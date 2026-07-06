'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { YamnetInference } from '@/lib/autonomous/yamnet-inference';
import { VadManager } from '@/lib/autonomous/vad-manager';
import { SessionManager } from '@/lib/autonomous/session-manager';
import { UploadQueue } from '@/lib/autonomous/upload-queue';
import { ScheduleManager } from '@/lib/autonomous/schedule-manager';
import type {
  AutonomousSettings,
  AutonomousState,
  AutonomousStatus,
  LoadingProgress,
} from '@/lib/autonomous/types';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export function useAutonomous() {
  const [state, setState] = useState<AutonomousState>({
    status: 'idle',
    utteranceCount: 0,
    error: null,
    loadingProgress: null,
    pendingUploads: 0,
  });
  const [settings, setSettingsState] = useState<AutonomousSettings | null>(null);

  const yamnetRef = useRef<YamnetInference | null>(null);
  const vadRef = useRef<VadManager | null>(null);
  const sessionRef = useRef<SessionManager | null>(null);
  const queueRef = useRef<UploadQueue | null>(null);
  const scheduleRef = useRef<ScheduleManager | null>(null);
  const statusRef = useRef<AutonomousStatus>('idle');
  const statusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const yamnetBusyRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const sm = new ScheduleManager();
    scheduleRef.current = sm;
    const loaded = sm.load();
    setSettingsState(loaded);

    const queue = new UploadQueue(API_URL);
    queueRef.current = queue;
    queue.onCountChange = (count) => patch((s) => ({ ...s, pendingUploads: count }));
    queue.restorePending();

    // Auto-prepare from IndexedDB cache on refresh/remount, but only when authenticated.
    // Mic is NOT touched here — VAD init is deferred to start().
    const token = typeof localStorage !== 'undefined'
      ? localStorage.getItem('access_token')
      : null;
    if (token) {
      YamnetInference.isModelCached().then((cached) => {
        if (cached && isMountedRef.current) prepare();
      });
    }

    return () => {
      isMountedRef.current = false;
      scheduleRef.current?.stopTick();
      vadRef.current?.destroy();
      vadRef.current = null;
      if (statusTimeoutRef.current !== null) {
        clearTimeout(statusTimeoutRef.current);
        statusTimeoutRef.current = null;
      }
      sessionRef.current?.clear();
      if (queueRef.current) queueRef.current.onCountChange = null;
      yamnetRef.current?.dispose();
      yamnetRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patch = useCallback((updates: Partial<AutonomousState> | ((s: AutonomousState) => AutonomousState)) => {
    if (!isMountedRef.current) return;
    setState((s) => {
      const next = typeof updates === 'function' ? updates(s) : { ...s, ...updates };
      if (next.status !== s.status) statusRef.current = next.status;
      return next;
    });
  }, []);

  // prepare() loads YAMNet and sets up the session — no mic access.
  // The VAD (and mic permission) is deferred to start().
  const prepare = useCallback(async () => {
    if (statusRef.current !== 'idle') return;
    patch({ status: 'loading', error: null, loadingProgress: { phase: 'downloading', percent: 0 } });
    try {
      const yamnet = new YamnetInference();
      yamnetRef.current = yamnet;

      await yamnet.load('/models/yamnet_3s.onnx', (progress: LoadingProgress) => {
        patch({ loadingProgress: progress });
      });

      const currentSettings = scheduleRef.current!.load();
      const session = new SessionManager(currentSettings.sessionSilenceMinutes);
      sessionRef.current = session;
      session.onSessionReady = async (blob: Blob) => {
        // Capture VAD state synchronously before the first await — statusRef is
        // accurate here; after await it may have changed (e.g. user resumed).
        const vadAlive = vadRef.current !== null;
        const wasPaused = vadAlive && statusRef.current === 'paused';
        patch({ status: 'uploading' });
        const query = scheduleRef.current!.load().additionalAnalysisQuery;
        await queueRef.current!.enqueue(blob, query);
        patch({ status: 'done', utteranceCount: 0 });
        if (statusTimeoutRef.current !== null) clearTimeout(statusTimeoutRef.current);
        statusTimeoutRef.current = setTimeout(() => {
          statusTimeoutRef.current = null;
          // VAD null → user stopped → ready.
          // VAD alive + was paused → restore paused (uploadNow from paused state).
          // VAD alive + was listening → resume listening.
          patch({ status: !vadAlive ? 'ready' : wasPaused ? 'paused' : 'listening' });
        }, 1500);
      };

      patch({ status: 'ready', loadingProgress: null });
    } catch (err) {
      patch({
        status: 'idle',
        error: err instanceof Error ? err.message : 'Failed to load models',
        loadingProgress: null,
      });
    }
  }, [patch]);

  // start() initialises the VAD (requests mic here, first time only) then begins listening.
  const start = useCallback(async () => {
    try {
      const currentSettings = scheduleRef.current!.load();

      // Destroy any prior VAD instance before creating a fresh one
      vadRef.current?.destroy();
      const vad = new VadManager();
      vadRef.current = vad;

      await vad.init(currentSettings.vadThreshold, {
        onSpeechStart: () => {
          patch({ status: 'utterance' });
        },
        onSpeechEnd: async (audio: Float32Array) => {
          const minSamples = (currentSettings.minUtteranceDurationMs / 1000) * 16000;
          if (audio.length < minSamples) return;

          // Prevent concurrent ORT inference from overlapping speech segments
          if (yamnetBusyRef.current) return;
          yamnetBusyRef.current = true;
          try {
            const isSpeech = await yamnetRef.current!.isSpeech(audio);
            if (!isSpeech) return;

            // Discard result if stop/uploadAndStop fired while YAMNet was running —
            // adding audio to a cleared session would corrupt state.
            const activeStatuses: string[] = ['utterance', 'listening', 'session-active', 'paused'];
            if (!activeStatuses.includes(statusRef.current)) return;

            sessionRef.current!.addUtterance(audio);
            patch({
              status: 'session-active',
              utteranceCount: sessionRef.current!.utteranceCount,
            });
          } finally {
            yamnetBusyRef.current = false;
          }
        },
        onError: (err: Error) => {
          vadRef.current?.destroy();
          vadRef.current = null;
          patch({ status: 'ready', error: err.message });
        },
      });

      await vad.start();
      patch({ status: 'listening', utteranceCount: 0, error: null });

      scheduleRef.current!.startTick(
        () => { /* already listening — no-op */ },
        () => {
          scheduleRef.current?.stopTick();
          vadRef.current?.destroy();
          vadRef.current = null;
          const hadContent = (sessionRef.current?.utteranceCount ?? 0) > 0;
          sessionRef.current?.flushNow();
          // Mirror uploadAndStop: only patch 'ready' when buffer was empty.
          // Non-empty: onSessionReady drives uploading → done → ready.
          if (!hadContent) patch({ status: 'ready' });
        },
        () => ['listening', 'utterance', 'session-active', 'paused'].includes(statusRef.current),
      );
      sessionRef.current?.setSilenceMinutes(currentSettings.sessionSilenceMinutes);
    } catch (err) {
      vadRef.current?.destroy();
      vadRef.current = null;
      patch({
        status: 'ready',
        error: err instanceof Error ? err.message : 'Failed to start microphone',
      });
    }
  }, [patch]);

  const pause = useCallback(async () => {
    await vadRef.current?.pause();
    patch({ status: 'paused' });
  }, [patch]);

  const resume = useCallback(async () => {
    await vadRef.current?.resume();
    patch((s) => ({
      ...s,
      status: s.utteranceCount > 0 ? 'session-active' : 'listening',
    }));
  }, [patch]);

  const uploadNow = useCallback(async () => {
    sessionRef.current?.flushNow();
  }, []);

  const discard = useCallback(async () => {
    sessionRef.current?.clear();
    patch((s) => ({ ...s, status: s.status === 'paused' ? 'paused' : 'listening', utteranceCount: 0 }));
  }, [patch]);

  const uploadAndStop = useCallback(async () => {
    scheduleRef.current?.stopTick();
    vadRef.current?.destroy();
    vadRef.current = null;
    const hadContent = (sessionRef.current?.utteranceCount ?? 0) > 0;
    sessionRef.current?.flushNow();
    // Empty buffer: go to ready immediately.
    // Non-empty: onSessionReady handles uploading → done → ready.
    if (!hadContent) patch({ status: 'ready' });
  }, [patch]);

  const saveSettings = useCallback((updated: AutonomousSettings) => {
    scheduleRef.current?.save(updated);
    setSettingsState(updated);
    sessionRef.current?.setSilenceMinutes(updated.sessionSilenceMinutes);
  }, []);

  return {
    state,
    settings,
    prepare,
    start,
    pause,
    resume,
    uploadNow,
    discard,
    uploadAndStop,
    saveSettings,
  };
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { useGlobalState } from '@/lib/global-state-context';
import { buildMicDeviceList, type MicDeviceOption } from '@/lib/audio/mic-device-list';

export type MicPermission = 'granted' | 'denied' | 'prompt' | 'unsupported';

// The tab mic indicator must never stay on longer than this without the
// picker being touched — see the preview-lifecycle rule in the design doc.
const PREVIEW_IDLE_MS = 20_000;

export interface UseMicDevicesResult {
  devices: MicDeviceOption[];
  selectedDeviceId: string | null;
  selectedLabel: string;
  permission: MicPermission;
  isEnumerating: boolean;
  isSwitching: boolean;
  isPreviewing: boolean;
  previewExpired: boolean;
  level: number;
  error: string | null;
  select: (deviceId: string | null, label: string) => Promise<void>;
  requestPermission: () => Promise<boolean>;
  refresh: () => Promise<void>;
  armPreview: () => void;
  handleOpenChange: (open: boolean) => void;
}

/**
 * Device enumeration + permission state for the mic picker. Holds no stream
 * itself — every stream lives in GlobalStateProvider's MicGraph, this hook
 * only reads/drives that through setMicDevice/startMicPreview/stopMicPreview.
 */
export function useMicDevices(systemDefaultLabel: string): UseMicDevicesResult {
  const {
    selectedMicId,
    selectedMicLabel,
    isSwitchingMic,
    isPreviewingMic,
    isRecording,
    audioLevel,
    setMicDevice,
    startMicPreview,
    stopMicPreview,
  } = useGlobalState();

  const [devices, setDevices] = useState<MicDeviceOption[]>([
    { deviceId: '', label: systemDefaultLabel, isDefault: true, groupId: '' },
  ]);
  const [permission, setPermission] = useState<MicPermission>('prompt');
  const [isEnumerating, setIsEnumerating] = useState(false);
  const [previewExpired, setPreviewExpired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    setIsEnumerating(true);
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      setDevices(buildMicDeviceList(all, systemDefaultLabel));
      setError(null);
    } catch {
      setError('Could not list microphones.');
    } finally {
      setIsEnumerating(false);
    }
  }, [systemDefaultLabel]);

  // Never calls getUserMedia — enumerateDevices() alone is enough to read
  // permission state and (once granted) real device labels.
  useEffect(() => {
    const permissionsApi = navigator.permissions;
    if (!permissionsApi?.query) {
      // Synchronizing with an external system (feature detection) — the
      // synchronous update on mount is intentional, not a re-render loop.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPermission('unsupported');
      refresh();
      return;
    }

    let status: PermissionStatus | null = null;
    let cancelled = false;
    permissionsApi
      .query({ name: 'microphone' as PermissionName })
      .then((result) => {
        if (cancelled) return;
        status = result;
        const apply = () => {
          setPermission(result.state as MicPermission);
          if (result.state === 'granted') refresh();
        };
        apply();
        result.onchange = apply;
      })
      .catch(() => {
        if (!cancelled) {
          setPermission('unsupported');
          refresh();
        }
      });

    return () => {
      cancelled = true;
      if (status) status.onchange = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const mediaDevices = navigator.mediaDevices as (MediaDevices & EventTarget) | undefined;
    if (!mediaDevices?.addEventListener) return;
    const handler = () => refresh();
    mediaDevices.addEventListener('devicechange', handler);
    return () => mediaDevices.removeEventListener('devicechange', handler);
  }, [refresh]);

  useEffect(
    () => () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    },
    [],
  );

  const armPreview = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    setPreviewExpired(false);
    idleTimerRef.current = setTimeout(() => {
      stopMicPreview();
      setPreviewExpired(true);
    }, PREVIEW_IDLE_MS);
  }, [stopMicPreview]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      await refresh();
      stream.getTracks().forEach((t) => t.stop());
      setPermission('granted');
      await startMicPreview();
      armPreview();
      return true;
    } catch {
      setPermission('denied');
      return false;
    }
  }, [refresh, startMicPreview, armPreview]);

  const select = useCallback(
    async (deviceId: string | null, label: string) => {
      await setMicDevice(deviceId, label);
      armPreview();
    },
    [setMicDevice, armPreview],
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        refresh();
        if (permission === 'granted') startMicPreview();
        armPreview();
      } else {
        if (idleTimerRef.current) {
          clearTimeout(idleTimerRef.current);
          idleTimerRef.current = null;
        }
        if (!isRecording) stopMicPreview();
      }
    },
    [refresh, permission, startMicPreview, stopMicPreview, isRecording, armPreview],
  );

  return {
    devices,
    selectedDeviceId: selectedMicId,
    selectedLabel: selectedMicId === null ? systemDefaultLabel : selectedMicLabel,
    permission,
    isEnumerating,
    isSwitching: isSwitchingMic,
    isPreviewing: isPreviewingMic,
    previewExpired,
    level: audioLevel,
    error,
    select,
    requestPermission,
    refresh,
    armPreview,
    handleOpenChange,
  };
}

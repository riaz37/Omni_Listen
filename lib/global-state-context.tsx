'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';
import { conversationsAPI } from './api';
import * as vault from './recording-vault';
import { downloadBlob } from './download-blob';
import type { RecordingEntry } from '@/lib/types';
import { MicGraph, type MicGraphHooks } from './audio/mic-graph';
import { acquireMicStream } from './audio/mic-stream';
import { readMicPreference, writeMicPreference, resolveMicDevice } from './mic-preference';

const DOWNLOAD_WINDOW_KEY = 'esap-download-window';
const DOWNLOAD_WINDOW_SECONDS = 300;

// Audio level metering — RMS below this counts as silence.
const SILENCE_RMS_THRESHOLD = 0.01;
// How long silence must persist before we warn the user.
const SILENCE_WARNING_MS = 6000;
// Skip the warning during this initial window so a quiet start isn't flagged immediately.
const SILENCE_GRACE_MS = 3000;

interface GlobalStateContextType {
    // Recording State
    isRecording: boolean;
    isPaused: boolean;
    recordingTime: number;
    audioBlob: Blob | null;
    audioUrl: string | null;
    mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>;
    audioLevel: number;
    noAudioDetected: boolean;
    startRecording: () => Promise<void>;
    stopRecording: () => void;
    pauseRecording: () => void;
    resumeRecording: () => void;
    cancelRecording: () => void;
    deleteRecording: () => void;
    recoveredRecording: RecordingEntry | null;
    currentRecordingId: string | null;
    activateRecovery: (entry: RecordingEntry) => void;
    dismissRecovery: (id: string) => void;

    // Microphone selection
    selectedMicId: string | null;
    selectedMicLabel: string;
    isSwitchingMic: boolean;
    isPreviewingMic: boolean;
    setMicDevice: (deviceId: string | null, label: string) => Promise<void>;
    startMicPreview: () => Promise<void>;
    stopMicPreview: () => void;

    // Download Window
    downloadSecondsLeft: number | null;
    downloadWindowFileName: string | null;
    triggerDownload: () => void;

    // Processing State
    processingJobId: string | null;
    processingStatus: string;
    processingProgress: number;
    isProcessing: boolean;
    startProcessing: (file: File, config: any) => Promise<string>;
    pollJobStatus: (id: string) => void;
    resetProcessing: () => void;

    // Auto-process trigger
    autoProcess: boolean;
    setAutoProcess: (value: boolean) => void;
}

const GlobalStateContext = createContext<GlobalStateContextType | undefined>(undefined);

export function GlobalStateProvider({ children }: { children: ReactNode }) {
    // --- Recording State ---
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const [audioLevel, setAudioLevel] = useState(0);
    const [noAudioDetected, setNoAudioDetected] = useState(false);
    const levelRafRef = useRef<number | null>(null);
    const silenceStartRef = useRef<number | null>(null);
    const recordingStartRef = useRef<number>(0);
    const [recoveredRecording, setRecoveredRecording] = useState<RecordingEntry | null>(null);
    const [currentRecordingId, setCurrentRecordingId] = useState<string | null>(null);
    const currentRecordingIdRef = useRef<string | null>(null);
    const chunkIndexRef = useRef<number>(0);

    // --- Microphone selection ---
    // The single MicGraph instance backing whichever stream is "live" right
    // now — either a pre-recording preview or an active recording. Owns the
    // one AudioContext; see lib/audio/mic-graph.ts for the hot-swap design.
    const micGraphRef = useRef<MicGraph | null>(null);
    const [selectedMicId, setSelectedMicId] = useState<string | null>(() => {
        const pref = readMicPreference();
        return pref && pref.deviceId !== '' ? pref.deviceId : null;
    });
    const selectedMicIdRef = useRef<string | null>(selectedMicId);
    const [selectedMicLabel, setSelectedMicLabel] = useState<string>(() => readMicPreference()?.label ?? '');
    const [isSwitchingMic, setIsSwitchingMic] = useState(false);
    const [isPreviewingMic, setIsPreviewingMic] = useState(false);
    const isRecordingRef = useRef(false);
    useEffect(() => {
        isRecordingRef.current = isRecording;
    }, [isRecording]);

    // --- Download Window ---
    const [downloadSecondsLeft, setDownloadSecondsLeft] = useState<number | null>(null);
    const [downloadWindowFileName, setDownloadWindowFileName] = useState<string | null>(null);
    const downloadWarnedRef = useRef(false);

    // --- Auto Process State ---
    const [autoProcess, setAutoProcess] = useState(false);

    // Timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRecording && !isPaused) {
            interval = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRecording, isPaused]);

    // Countdown effect for download window
    useEffect(() => {
        if (downloadSecondsLeft === null) return;
        if (downloadSecondsLeft === 0) {
            setAudioUrl((prevUrl) => {
                if (prevUrl) URL.revokeObjectURL(prevUrl);
                return null;
            });
            setAudioBlob(null);
            setDownloadSecondsLeft(null);
            setDownloadWindowFileName(null);
            sessionStorage.removeItem(DOWNLOAD_WINDOW_KEY);
            downloadWarnedRef.current = false;
            return;
        }
        if (downloadSecondsLeft === 60 && !downloadWarnedRef.current) {
            downloadWarnedRef.current = true;
            toast.warning('1 minute left to save your recording');
        }
        const timer = setTimeout(() => {
            setDownloadSecondsLeft((prev) => (prev !== null ? prev - 1 : null));
        }, 1000);
        return () => clearTimeout(timer);
    }, [downloadSecondsLeft]);

    useEffect(() => {
        const checkRecovery = async () => {
            try {
                const all = await vault.listRecordings();
                const unfinished = all.find(
                    (r) => r.status === 'recording' || r.status === 'stopped',
                );
                if (unfinished) setRecoveredRecording(unfinished);
            } catch {
                // IndexedDB unavailable (private browsing on some browsers) — silent
            }
        };
        checkRecovery();
    }, []);

    useEffect(() => {
        const raw = sessionStorage.getItem(DOWNLOAD_WINDOW_KEY);
        if (!raw) return;
        try {
            const { expiresAt, recordingId, fileName } = JSON.parse(raw);
            const remaining = Math.floor((expiresAt - Date.now()) / 1000);
            if (remaining <= 0) {
                sessionStorage.removeItem(DOWNLOAD_WINDOW_KEY);
                return;
            }
            vault.assembleBlob(recordingId).then((blob) => {
                const url = URL.createObjectURL(blob);
                setAudioBlob(blob);
                setAudioUrl(url);
                setDownloadWindowFileName(fileName);
                setDownloadSecondsLeft(remaining);
            }).catch(() => {
                sessionStorage.removeItem(DOWNLOAD_WINDOW_KEY);
            });
        } catch {
            sessionStorage.removeItem(DOWNLOAD_WINDOW_KEY);
        }
    }, []);

    // Stops the RMS metering loop. Safe to call multiple times — every
    // recording-exit path (normal stop, cancel) calls this. The AudioContext
    // itself is now owned by MicGraph and torn down via micGraph.close(),
    // not here.
    const stopLevelMeter = () => {
        if (levelRafRef.current !== null) {
            cancelAnimationFrame(levelRafRef.current);
            levelRafRef.current = null;
        }
        silenceStartRef.current = null;
        setAudioLevel(0);
        setNoAudioDetected(false);
    };

    // Reads the live RMS level off the given MicGraph and, in 'recording'
    // mode, flags sustained silence. 'preview' mode skips silence-detection
    // (that banner/toast is recording-only and already gated on isRecording
    // by the UI) but still drives the level meter shown before recording
    // starts. Throttled to ~20Hz — audioLevel lives in this top-level
    // context, so an un-throttled 60fps RAF loop would re-render the whole
    // page tree that often, and the preview extends the window it runs in
    // from "while recording" to "whenever the picker is open".
    const LEVEL_UPDATE_INTERVAL_MS = 50;

    const startLevelMeter = (graph: MicGraph, mode: 'preview' | 'recording') => {
        recordingStartRef.current = Date.now();
        silenceStartRef.current = null;

        let lastUpdate = 0;
        const loop = () => {
            if (micGraphRef.current !== graph) return; // superseded/closed — let this loop instance die

            // Paused MediaRecorder still leaves the underlying track live, so the
            // graph keeps reading real audio — force the meter to 0 while paused
            // per design, rather than showing (misleading) live levels.
            if (mode === 'recording' && mediaRecorderRef.current?.state === 'paused') {
                setAudioLevel(0);
                silenceStartRef.current = null;
                setNoAudioDetected(false);
                levelRafRef.current = requestAnimationFrame(loop);
                return;
            }

            const now = Date.now();
            if (now - lastUpdate >= LEVEL_UPDATE_INTERVAL_MS) {
                lastUpdate = now;
                const rms = graph.getRms();
                setAudioLevel(Math.min(1, Math.round(rms * 4 * 100) / 100));

                if (mode === 'recording') {
                    if (rms < SILENCE_RMS_THRESHOLD) {
                        if (silenceStartRef.current === null) silenceStartRef.current = now;
                        const silentForMs = now - silenceStartRef.current;
                        const elapsedSinceStart = now - recordingStartRef.current;
                        if (elapsedSinceStart > SILENCE_GRACE_MS && silentForMs > SILENCE_WARNING_MS) {
                            setNoAudioDetected(true);
                        }
                    } else {
                        silenceStartRef.current = null;
                        setNoAudioDetected(false);
                    }
                }
            }

            levelRafRef.current = requestAnimationFrame(loop);
        };
        levelRafRef.current = requestAnimationFrame(loop);
    };

    // Hardware mute/unmute and unexpected track-end (e.g. device unplugged)
    // are wired once per MicGraph and re-bound onto the new track by the
    // graph itself on every swap (see mic-graph.ts) — so these callbacks
    // don't need to change when the device changes.
    //
    // Recovers when the active mic disappears mid-use (unplugged), whether
    // that's caught via the track's own 'ended' event or a devicechange scan
    // (see the effect below). Re-resolves the stored preference against the
    // fresh device list — same logic a stale deviceId uses on next launch —
    // and swaps to whatever that resolves to (typically system default).
    const handleActiveDeviceLost = useCallback(async () => {
        const graph = micGraphRef.current;
        if (!graph) return;
        try {
            const devices = (await navigator.mediaDevices.enumerateDevices()).filter(
                (d) => d.kind === 'audioinput',
            );
            const resolved = resolveMicDevice(readMicPreference(), devices);
            const { stream } = await acquireMicStream(resolved.deviceId);
            await graph.swapSource(stream);
            selectedMicIdRef.current = resolved.deviceId;
            setSelectedMicId(resolved.deviceId);
            silenceStartRef.current = null;
            recordingStartRef.current = Date.now();
            toast.warning(
                isRecordingRef.current
                    ? 'Your microphone was disconnected — switched to the system default so the recording continues.'
                    : 'Your microphone was disconnected — switched to the system default.',
            );
        } catch (err) {
            console.error('Failed to recover from a disconnected microphone:', err);
        }
    }, []);

    const micGraphHooks: MicGraphHooks = {
        onTrackMute: (muted) => {
            if (muted) {
                setNoAudioDetected(true);
            } else {
                silenceStartRef.current = null;
                setNoAudioDetected(false);
            }
        },
        onTrackEnded: () => {
            handleActiveDeviceLost();
        },
    };

    // Chrome fires devicechange 2-4x per physical plug/unplug event —
    // debounce so we don't re-enumerate and re-check on every one of them.
    useEffect(() => {
        const mediaDevices = navigator.mediaDevices as (MediaDevices & EventTarget) | undefined;
        if (!mediaDevices?.addEventListener) return;

        let debounceTimer: ReturnType<typeof setTimeout> | null = null;
        const handler = () => {
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const graph = micGraphRef.current;
                if (!graph) return;
                navigator.mediaDevices
                    .enumerateDevices()
                    .then((all) => {
                        const inputs = all.filter((d) => d.kind === 'audioinput');
                        const activeId = graph.activeStream?.getAudioTracks()[0]?.getSettings().deviceId;
                        const stillPresent = !activeId || inputs.some((d) => d.deviceId === activeId);
                        if (!stillPresent) handleActiveDeviceLost();
                    })
                    .catch(() => {});
            }, 300);
        };

        mediaDevices.addEventListener('devicechange', handler);
        return () => {
            if (debounceTimer) clearTimeout(debounceTimer);
            mediaDevices.removeEventListener('devicechange', handler);
        };
    }, [handleActiveDeviceLost]);

    // AudioContext suspension watchdog: a suspended context feeding a
    // MediaStreamAudioDestinationNode emits digital silence into an
    // otherwise structurally-valid WebM. Backgrounded tabs (especially
    // mobile Safari) can suspend the context out from under an active
    // recording; ensureRunning() is a no-op unless that's actually happened.
    useEffect(() => {
        if (!isRecording) return;
        const interval = setInterval(() => {
            micGraphRef.current?.ensureRunning().catch(() => {});
        }, 1000);
        return () => clearInterval(interval);
    }, [isRecording]);

    const startRecording = async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Audio recording is not supported in your browser.');
            }

            const targetDeviceId = selectedMicIdRef.current;
            let graph = micGraphRef.current;
            let fellBackToDefault = false;

            if (graph) {
                // A preview (or an already-running graph) is live — hand it over
                // instead of opening the mic a second time. Only re-acquire if the
                // user picked a specific device that differs from what's live.
                const liveId = graph.activeStream?.getAudioTracks()[0]?.getSettings().deviceId ?? null;
                if (targetDeviceId !== null && liveId !== targetDeviceId) {
                    const acquired = await acquireMicStream(targetDeviceId);
                    await graph.swapSource(acquired.stream);
                    fellBackToDefault = acquired.fellBackToDefault;
                }
                await graph.ensureRunning();
            } else {
                const acquired = await acquireMicStream(targetDeviceId);
                graph = await MicGraph.create(acquired.stream, micGraphHooks);
                micGraphRef.current = graph;
                fellBackToDefault = acquired.fellBackToDefault;
            }

            if (fellBackToDefault) {
                toast.warning('Selected microphone is unavailable — recording from the system default instead.');
            }

            let mimeType = 'audio/webm';
            if (!MediaRecorder.isTypeSupported('audio/webm')) {
                if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
                else if (MediaRecorder.isTypeSupported('audio/wav')) mimeType = 'audio/wav';
            }

            // 128 kbps matches the extension and desktop recorders; the
            // browser default bitrate can be too low for clean transcription.
            // Constructed on graph.stream (the MicGraph destination), not the
            // raw mic stream — this is what makes a mid-recording device swap
            // possible without ever stopping/restarting the recorder.
            const recorder = new MediaRecorder(graph.stream, {
                mimeType,
                audioBitsPerSecond: 128000,
            });
            audioChunksRef.current = [];

            const recordingId = crypto.randomUUID();
            currentRecordingIdRef.current = recordingId;
            setCurrentRecordingId(recordingId);
            chunkIndexRef.current = 0;

            const now = new Date();
            const pad = (n: number) => String(n).padStart(2, '0');
            const fileName = `recording_${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}.${mimeType.split('/')[1]?.split(';')[0] ?? 'webm'}`;

            await vault.createRecording(recordingId, fileName, mimeType).catch(() => {});

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                    const idx = chunkIndexRef.current++;
                    vault.appendChunk(recordingId, idx, e.data).catch(() => {});
                }
            };

            recorder.onstop = () => {
                stopLevelMeter();
                const blob = new Blob(audioChunksRef.current, { type: mimeType });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
                // Releases the mic. MediaRecorder now reads from the MicGraph's
                // destination stream, not the raw mic stream, so stopping
                // recorder.stream's tracks (the old approach) would no longer
                // release anything — micGraph.close() is what actually does it.
                micGraphRef.current?.close();
                micGraphRef.current = null;

                const stoppedAt = new Date().toISOString();
                vault
                    .updateRecording(recordingId, {
                        status: 'stopped',
                        stoppedAt,
                        duration: Math.round(
                            (Date.now() - now.getTime()) / 1000,
                        ),
                    })
                    .catch(() => {});

                const expiresAt = Date.now() + DOWNLOAD_WINDOW_SECONDS * 1000;
                sessionStorage.setItem(
                  DOWNLOAD_WINDOW_KEY,
                  JSON.stringify({ expiresAt, recordingId, fileName }),
                );
                setDownloadWindowFileName(fileName);
                setDownloadSecondsLeft(DOWNLOAD_WINDOW_SECONDS);

                chunkIndexRef.current = 0;
            };

            mediaRecorderRef.current = recorder;
            recorder.start(5000);
            startLevelMeter(graph, 'recording');
            setIsRecording(true);
            setIsPaused(false);
            setIsPreviewingMic(false); // graph handed over to the recording
            setRecordingTime(0);
            setAudioBlob(null);
            setAudioUrl(null);
            setDownloadSecondsLeft(null);
            setDownloadWindowFileName(null);
            sessionStorage.removeItem(DOWNLOAD_WINDOW_KEY);
            downloadWarnedRef.current = false;
            setAutoProcess(false);
        } catch (error) {
            console.error('Failed to start recording:', error);
            throw error;
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsPaused(false);
            setRecordingTime(0);
        }
    };

    const pauseRecording = () => {
        if (mediaRecorderRef.current && isRecording && !isPaused) {
            mediaRecorderRef.current.pause();
            setIsPaused(true);
        }
    };

    const resumeRecording = () => {
        if (mediaRecorderRef.current && isRecording && isPaused) {
            mediaRecorderRef.current.resume();
            setIsPaused(false);
        }
    };

    const cancelRecording = () => {
        stopLevelMeter();
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.onstop = null;
            mediaRecorderRef.current.stop();
        }
        // Releases the mic — see the matching comment in recorder.onstop above.
        // MicGraph.close() stops its tracks synchronously (before its one
        // internal await), so the hardware indicator turns off immediately
        // even though close() itself isn't awaited here.
        micGraphRef.current?.close();
        micGraphRef.current = null;
        if (currentRecordingIdRef.current) {
            vault.deleteRecording(currentRecordingIdRef.current).catch(() => {});
            currentRecordingIdRef.current = null;
            setCurrentRecordingId(null);
        }
        setIsRecording(false);
        setIsPaused(false);
        setRecordingTime(0);
        audioChunksRef.current = [];
        chunkIndexRef.current = 0;
        setAudioBlob(null);
        setAudioUrl(null);
        setDownloadSecondsLeft(null);
        setDownloadWindowFileName(null);
        sessionStorage.removeItem(DOWNLOAD_WINDOW_KEY);
        downloadWarnedRef.current = false;
        setAutoProcess(false);
    };

    const deleteRecording = () => {
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }
        setAudioBlob(null);
        setAudioUrl(null);
        setDownloadSecondsLeft(null);
        setDownloadWindowFileName(null);
        sessionStorage.removeItem(DOWNLOAD_WINDOW_KEY);
        downloadWarnedRef.current = false;
        setRecordingTime(0);
        audioChunksRef.current = [];
        setAutoProcess(false);
    };

    // Switches the live graph to a different device, whether idle, previewing,
    // or mid-recording. Acquire-before-teardown: the new stream is opened
    // while the old one is still live, so a failure here leaves the old mic
    // fully intact and nothing is lost.
    const setMicDevice = async (deviceId: string | null, label: string) => {
        const previousId = selectedMicIdRef.current;
        const previousLabel = selectedMicLabel;

        writeMicPreference({ deviceId, label });
        selectedMicIdRef.current = deviceId;
        setSelectedMicId(deviceId);
        setSelectedMicLabel(label);

        const graph = micGraphRef.current;
        if (!graph) return; // idle with no live graph — the next start/preview will pick this up

        setIsSwitchingMic(true);
        try {
            const acquired = await acquireMicStream(deviceId);
            await graph.swapSource(acquired.stream);
            silenceStartRef.current = null;
            recordingStartRef.current = Date.now();
            setNoAudioDetected(false);
        } catch (err) {
            console.error('Failed to switch microphone:', err);
            writeMicPreference({ deviceId: previousId, label: previousLabel });
            selectedMicIdRef.current = previousId;
            setSelectedMicId(previousId);
            setSelectedMicLabel(previousLabel);
            toast.error('Could not switch to that microphone. Still recording from the previous one.');
        } finally {
            setIsSwitchingMic(false);
        }
    };

    // Opens the mic and starts the level meter WITHOUT a MediaRecorder, so the
    // picker can show a live "does this mic hear me" preview before Start is
    // pressed. Only ever called as a direct result of a user gesture — never
    // on mount — so there is no surprise permission prompt and no tab mic
    // indicator left on from a page load the user didn't ask for.
    const startMicPreview = async () => {
        if (isRecording || micGraphRef.current) return;
        try {
            const acquired = await acquireMicStream(selectedMicIdRef.current);
            const graph = await MicGraph.create(acquired.stream, micGraphHooks);
            micGraphRef.current = graph;
            setIsPreviewingMic(true);
            startLevelMeter(graph, 'preview');
            if (acquired.fellBackToDefault) {
                toast.warning('Selected microphone is unavailable — previewing the system default instead.');
            }
        } catch (err) {
            console.error('Mic preview unavailable:', err);
        }
    };

    // No-op while recording — the preview graph has already been handed over
    // to the recording at that point and must not be torn down here.
    const stopMicPreview = () => {
        if (isRecording) return;
        stopLevelMeter();
        micGraphRef.current?.close();
        micGraphRef.current = null;
        setIsPreviewingMic(false);
    };

    const activateRecovery = (entry: RecordingEntry) => {
        setRecoveredRecording(entry);
    };

    const dismissRecovery = async (id: string) => {
        await vault.deleteRecording(id).catch(() => {});
        setRecoveredRecording(null);
    };

    const triggerDownload = useCallback(() => {
        if (!audioBlob || !downloadWindowFileName) return;
        downloadBlob(audioBlob, downloadWindowFileName);
        setAudioUrl((prevUrl) => {
            if (prevUrl) URL.revokeObjectURL(prevUrl);
            return null;
        });
        setAudioBlob(null);
        setDownloadSecondsLeft(null);
        setDownloadWindowFileName(null);
        downloadWarnedRef.current = false;
        sessionStorage.removeItem(DOWNLOAD_WINDOW_KEY);
    }, [audioBlob, downloadWindowFileName]);

    // --- Processing State ---
    const [processingJobId, setProcessingJobId] = useState<string | null>(null);
    const [processingStatus, setProcessingStatus] = useState('');
    const [processingProgress, setProcessingProgress] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Restore processing state from localStorage on mount
    useEffect(() => {
        const persistedJobId = localStorage.getItem('processingJobId');
        if (persistedJobId) {
            setProcessingJobId(persistedJobId);
            setIsProcessing(true);
            setProcessingStatus('Resuming processing...');
            pollJobStatus(persistedJobId);
        }
        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
            }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const startProcessing = async (file: File, config: any) => {
        setIsProcessing(true);
        setProcessingStatus('Uploading...');
        setProcessingProgress(0);

        try {
            const result = await conversationsAPI.uploadAudio(file, config, (percent) => {
                // Upload percent goes into the status text, not processingProgress —
                // the poll loop owns that bar with the backend's own 0-100 scale.
                setProcessingStatus(`Uploading... ${percent}%`);
            });
            setProcessingJobId(result.job_id);
            localStorage.setItem('processingJobId', result.job_id);
            pollJobStatus(result.job_id);
            return result.job_id;
        } catch (error) {
            setIsProcessing(false);
            setProcessingStatus('');
            throw error;
        }
    };

    const pollJobStatus = useCallback((id: string) => {
        // Cancel any existing poll
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }

        let intervalMs = 2000;
        let attempts = 0;
        const MAX_ATTEMPTS = 60;

        const tick = async () => {
            if (attempts >= MAX_ATTEMPTS) {
                setIsProcessing(false);
                setProcessingStatus('Timed out waiting for result. Please refresh.');
                return;
            }
            attempts++;

            try {
                const statusData = await conversationsAPI.getJobStatus(id);
                setProcessingProgress(statusData.overall_progress);

                const stages = statusData.stages || {};
                let currentStatus = 'Processing...';
                if (stages.vad?.status === 'in_progress') currentStatus = '🎵 Detecting speech...';
                else if (stages.enhancement?.status === 'in_progress') currentStatus = '🔊 Enhancing audio quality...';
                else if (stages.transcription?.status === 'in_progress') currentStatus = '📝 Transcribing audio...';
                else if (stages.diarization?.status === 'in_progress') currentStatus = '👥 Identifying speakers...';
                else if (stages.extraction?.status === 'in_progress') currentStatus = '🤖 Extracting key insights...';
                else if (stages.calendar?.status === 'in_progress') currentStatus = '📅 Syncing to calendar...';
                else if (statusData.status === 'completed') currentStatus = '✅ Complete!';
                else if (statusData.status === 'failed') currentStatus = '❌ Failed';

                setProcessingStatus(currentStatus);

                if (statusData.status === 'completed' || statusData.status === 'failed') {
                    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                    pollIntervalRef.current = null;
                    setIsProcessing(false);
                    localStorage.removeItem('processingJobId');
                    if (statusData.status === 'failed') {
                        setProcessingStatus(`Failed: ${statusData.error}`);
                    }
                    return;
                }
            } catch (error: any) {
                console.error('Status check failed:', error);
                if (error?.response?.status === 404 || error?.message?.includes('404')) {
                    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                    pollIntervalRef.current = null;
                    resetProcessing();
                    return;
                }
            }

            // Exponential backoff with jitter, capped at 15s
            intervalMs = Math.min(intervalMs * 1.4 + Math.random() * 500, 15000);
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = setInterval(tick, intervalMs);
        };

        // Initial poll after jittered delay (500–1500ms)
        const jitteredStart = 500 + Math.random() * 1000;
        pollIntervalRef.current = setInterval(tick, jitteredStart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const resetProcessing = () => {
        setProcessingJobId(null);
        setProcessingStatus('');
        setProcessingProgress(0);
        setIsProcessing(false);
        localStorage.removeItem('processingJobId');
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };

    return (
        <GlobalStateContext.Provider value={{
            isRecording, isPaused, recordingTime, audioBlob, audioUrl, mediaRecorderRef,
            audioLevel, noAudioDetected,
            startRecording, stopRecording, pauseRecording, resumeRecording, cancelRecording, deleteRecording,
            recoveredRecording,
            currentRecordingId,
            activateRecovery,
            dismissRecovery,
            selectedMicId, selectedMicLabel, isSwitchingMic, isPreviewingMic,
            setMicDevice, startMicPreview, stopMicPreview,
            downloadSecondsLeft, downloadWindowFileName, triggerDownload,
            processingJobId, processingStatus, processingProgress, isProcessing,
            startProcessing, pollJobStatus, resetProcessing,
            autoProcess, setAutoProcess
        }}>
            {children}
        </GlobalStateContext.Provider>
    );
}

export function useGlobalState() {
    const context = useContext(GlobalStateContext);
    if (context === undefined) {
        throw new Error('useGlobalState must be used within a GlobalStateProvider');
    }
    return context;
}

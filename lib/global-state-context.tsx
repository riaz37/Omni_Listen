'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';
import { conversationsAPI } from './api';
import * as vault from './recording-vault';
import { downloadBlob } from './download-blob';
import type { RecordingEntry } from '@/app/(app)/settings/types';

const DOWNLOAD_WINDOW_KEY = 'esap-download-window';
const DOWNLOAD_WINDOW_SECONDS = 300;

interface GlobalStateContextType {
    // Recording State
    isRecording: boolean;
    isPaused: boolean;
    recordingTime: number;
    audioBlob: Blob | null;
    audioUrl: string | null;
    mediaRecorderRef: React.MutableRefObject<MediaRecorder | null>;
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
    const [recoveredRecording, setRecoveredRecording] = useState<RecordingEntry | null>(null);
    const [currentRecordingId, setCurrentRecordingId] = useState<string | null>(null);
    const currentRecordingIdRef = useRef<string | null>(null);
    const chunkIndexRef = useRef<number>(0);

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

    const startRecording = async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Audio recording is not supported in your browser.');
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100,
                },
            });

            let mimeType = 'audio/webm';
            if (!MediaRecorder.isTypeSupported('audio/webm')) {
                if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
                else if (MediaRecorder.isTypeSupported('audio/wav')) mimeType = 'audio/wav';
            }

            const recorder = new MediaRecorder(stream, { mimeType });
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
                const blob = new Blob(audioChunksRef.current, { type: mimeType });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
                stream.getTracks().forEach((track) => track.stop());

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
            setIsRecording(true);
            setIsPaused(false);
            setRecordingTime(0);
            setAudioBlob(null);
            setAudioUrl(null);
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
        if (mediaRecorderRef.current) {
            const stream = mediaRecorderRef.current.stream;
            if (stream) {
                stream.getTracks().forEach((track) => track.stop());
            }
            mediaRecorderRef.current.onstop = null;
            mediaRecorderRef.current.stop();
        }
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
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, []);

    const startProcessing = async (file: File, config: any) => {
        setIsProcessing(true);
        setProcessingStatus('Uploading...');
        setProcessingProgress(0);

        try {
            const result = await conversationsAPI.uploadAudio(file, config);
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

    const pollJobStatus = (id: string) => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

        pollIntervalRef.current = setInterval(async () => {
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

                setProcessingStatus(currentStatus);

                if (statusData.status === 'completed' || statusData.status === 'failed') {
                    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                    setIsProcessing(false);
                    localStorage.removeItem('processingJobId');

                    if (statusData.status === 'failed') {
                        setProcessingStatus(`Failed: ${statusData.error}`);
                    }
                }
            } catch (error: any) {
                console.error('Status check failed:', error);
                if (error?.response?.status === 404 || error?.message?.includes('404')) {
                    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                    resetProcessing();
                }
            }
        }, 2000);
    };

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
            startRecording, stopRecording, pauseRecording, resumeRecording, cancelRecording, deleteRecording,
            recoveredRecording,
            currentRecordingId,
            activateRecovery,
            dismissRecovery,
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

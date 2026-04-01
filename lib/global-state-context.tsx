'use client';

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { meetingsAPI } from './api';

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

    const startRecording = async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Audio recording is not supported in your browser.');
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            });

            let mimeType = 'audio/webm';
            if (!MediaRecorder.isTypeSupported('audio/webm')) {
                if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
                else if (MediaRecorder.isTypeSupported('audio/wav')) mimeType = 'audio/wav';
            }

            const recorder = new MediaRecorder(stream, { mimeType });
            audioChunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: mimeType });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorderRef.current = recorder;
            recorder.start();
            setIsRecording(true);
            setIsPaused(false);
            setRecordingTime(0);
            setAudioBlob(null);
            setAudioUrl(null);
            setAutoProcess(false); // Reset auto process
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
                stream.getTracks().forEach(track => track.stop());
            }
            mediaRecorderRef.current.onstop = null; // Prevent blob creation
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        setIsPaused(false);
        setRecordingTime(0);
        audioChunksRef.current = [];
        setAudioBlob(null);
        setAudioUrl(null);
        setAutoProcess(false);
    };

    const deleteRecording = () => {
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);
        audioChunksRef.current = [];
        setAutoProcess(false);
    };

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
            const result = await meetingsAPI.uploadAudio(file, config);
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
                const statusData = await meetingsAPI.getJobStatus(id);
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

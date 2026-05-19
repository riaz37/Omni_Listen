"use client";

import React, { useEffect, useState } from 'react';
import { StopCircle, Maximize2, Pause, Play } from 'lucide-react';

declare global {
    interface Window {
        electron?: {
            startRecording?: () => Promise<boolean>;
            stopRecording?: () => Promise<boolean>;
            onVadStatus?: (callback: (status: string) => void) => void;
            restoreMain?: () => Promise<void>;
            sendMiniAction?: (action: string) => Promise<void>;
            onMiniAction?: (callback: (action: string) => void) => void;
            sendTimerUpdate?: (time: string) => Promise<void>;
            onTimerUpdate?: (callback: (time: string) => void) => void;
            sendProcessingStatus?: (status: string) => Promise<void>;
            onProcessingStatus?: (callback: (status: string) => void) => void;
            sendRecordingState?: (state: { isPaused: boolean; isRecording: boolean }) => Promise<void>;
            onRecordingState?: (callback: (state: { isPaused: boolean }) => void) => void;
        };
    }
}

export default function MiniPage() {
    // State
    const [duration, setDuration] = useState('00:00');
    const [isPaused, setIsPaused] = useState(false);
    const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle');

    // Sync timer from main process
    useEffect(() => {
        if (window.electron?.onTimerUpdate) {
            window.electron.onTimerUpdate((time) => {
                setDuration(time);
            });
        }
    }, []);

    // Sync processing status from main process
    useEffect(() => {
        if (window.electron?.onProcessingStatus) {
            window.electron.onProcessingStatus((newStatus) => {
                if (newStatus === 'processing' || newStatus === 'done' || newStatus === 'idle') {
                    setStatus(newStatus);
                    if (newStatus === 'done') {
                        setTimeout(() => {
                            window.electron?.sendMiniAction?.('hide');
                            setStatus('idle');
                        }, 1500);
                    }
                }
            });
        }
    }, []);

    // Sync recording state (isPaused) from main process
    useEffect(() => {
        if (window.electron?.onRecordingState) {
            window.electron.onRecordingState((state) => {
                setIsPaused(state.isPaused);
            });
        }
    }, []);

    const handleStop = () => {
        if (window.electron?.sendMiniAction) {
            setStatus('processing'); // Optimistic update
            window.electron.sendMiniAction('stop');
        }
    };

    const handleCancel = () => {
        if (window.electron?.sendMiniAction) {
            window.electron.sendMiniAction('cancel');
        }
    };

    const togglePause = () => {
        const newPausedState = !isPaused;
        setIsPaused(newPausedState);
        if (window.electron?.sendMiniAction) {
            window.electron.sendMiniAction(newPausedState ? 'pause' : 'resume');
        }
    };

    if (status === 'processing') {
        return (
            <>
                <style jsx global>{`
                    body { background: transparent !important; overflow: hidden !important; margin: 0 !important; padding: 0 !important; height: 100vh; width: 100vw; }
                    .draggable-region { -webkit-app-region: drag; cursor: move; }
                    .no-drag { -webkit-app-region: no-drag; cursor: default; }
                `}</style>
                <div className="flex items-center justify-center h-full w-full select-none">
                    <div className="draggable-region bg-foreground/90 backdrop-blur-md border border-white/10 rounded-full px-6 py-3 flex items-center shadow-2xl transition-all duration-300 animate-pulse">
                        <span className="text-white text-sm font-medium">Processing...</span>
                    </div>
                </div>
            </>
        );
    }

    if (status === 'done') {
        return (
            <>
                <style jsx global>{`
                    body { background: transparent !important; overflow: hidden !important; margin: 0 !important; padding: 0 !important; height: 100vh; width: 100vw; }
                    .draggable-region { -webkit-app-region: drag; cursor: move; }
                    .no-drag { -webkit-app-region: no-drag; cursor: default; }
                `}</style>
                <div className="flex items-center justify-center h-full w-full select-none">
                    <div className="draggable-region bg-primary/90 backdrop-blur-md border border-white/10 rounded-full px-6 py-3 flex items-center shadow-2xl transition-all duration-300">
                        <span className="text-white text-sm font-bold">Done!</span>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <style jsx global>{`
                body { background: transparent !important; overflow: hidden !important; margin: 0 !important; padding: 0 !important; height: 100vh; width: 100vw; }
                .draggable-region { -webkit-app-region: drag; cursor: move; }
                .no-drag { -webkit-app-region: no-drag; cursor: default; }
            `}</style>

            <div className="flex items-center justify-center h-full w-full select-none">
                <div className="draggable-region bg-foreground/80 backdrop-blur-md border border-white/10 rounded-full pl-3 pr-2 py-2 flex items-center gap-3 shadow-2xl transition-all duration-300 group hover:bg-foreground/90">

                    {/* Recording Indicator */}
                    <div className={`w-2.5 h-2.5 rounded-full ${isPaused ? 'bg-yellow-400' : 'bg-red-500 animate-pulse'} shadow-[0_0_8px_rgba(239,68,68,0.6)]`} />

                    {/* Timer */}
                    <span className="text-white font-mono text-sm tracking-widest font-medium min-w-[50px]">
                        {duration}
                    </span>

                    {/* Divider */}
                    <div className="h-4 w-[1px] bg-white/10" />

                    {/* Controls */}
                    <div className="flex items-center gap-1 no-drag">
                        <button
                            onClick={togglePause}
                            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                            title={isPaused ? "Resume" : "Pause"}
                        >
                            {isPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
                        </button>

                        <button
                            onClick={handleStop}
                            className="px-3 py-1 rounded-full bg-card text-foreground text-xs font-bold hover:bg-muted transition-colors flex items-center gap-1"
                        >
                            <span className="w-1.5 h-1.5 bg-foreground rounded-[1px]" />
                            Done
                        </button>

                        <button
                            onClick={handleCancel}
                            className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-red-400 transition-colors"
                            title="Cancel Recording"
                        >
                            <span className="text-lg leading-none">&times;</span>
                        </button>
                    </div>

                    {/* Expand Button */}
                    <button
                        className="ml-1 p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors no-drag"
                        onClick={() => {
                            if (window.electron?.restoreMain) {
                                window.electron.restoreMain();
                            }
                        }}
                    >
                        <Maximize2 size={12} />
                    </button>
                </div>
            </div>
        </>
    );
}

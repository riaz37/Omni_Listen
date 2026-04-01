'use client';

import { useGlobalState } from '@/lib/global-state-context';
import { useRouter, usePathname } from 'next/navigation';
import { Mic, Loader2, X, Maximize2, Play, Pause, Square } from 'lucide-react';

export default function FloatingStatusIndicator() {
    const {
        isRecording,
        recordingTime,
        isProcessing,
        processingStatus,
        processingProgress,
        processingJobId,
        isPaused,
        pauseRecording,
        resumeRecording,
        stopRecording,
        cancelRecording,
        setAutoProcess
    } = useGlobalState();

    const router = useRouter();
    const pathname = usePathname();

    // Don't show if we are already on the dashboard (where the main controls are)
    // UNLESS we are on a different "view" of the dashboard (but dashboard is single page currently)
    // Actually, for better UX, let's show it if we are NOT on the dashboard page.
    const isDashboard = pathname === '/dashboard';

    if (isDashboard) return null;

    if (!isRecording && !isProcessing) return null;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleClick = () => {
        if (isProcessing && processingJobId) {
            // If processing is complete, maybe go to meeting? 
            // But for now, just go to dashboard to see progress
            router.push('/dashboard');
        } else {
            router.push('/dashboard');
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div
                onClick={handleClick}
                className="bg-card rounded-lg shadow-lg border border-primary/10 p-4 cursor-pointer hover:shadow-xl transition-all flex items-center gap-4 min-w-[300px]"
            >
                {isRecording ? (
                    <>
                        <div className="relative">
                            <div className={`w-10 h-10 ${isPaused ? 'bg-amber-100' : 'bg-neon-green/10'} rounded-full flex items-center justify-center`}>
                                {isPaused ? <Pause className="w-5 h-5 text-amber-600" /> : <Mic className="w-5 h-5 text-neon-green" />}
                            </div>
                            {!isPaused && <span className="absolute top-0 right-0 w-3 h-3 bg-neon-green rounded-full animate-pulse border-2 border-card"></span>}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-foreground">{isPaused ? 'Recording Paused' : 'Recording in progress'}</p>
                            <p className="text-xs text-muted-foreground font-mono">{formatTime(recordingTime)}</p>
                        </div>

                        <div className="flex items-center gap-1 mr-2" onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={isPaused ? resumeRecording : pauseRecording}
                                className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                                title={isPaused ? "Resume" : "Pause"}
                            >
                                {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
                            </button>
                            <button
                                onClick={() => {
                                    setAutoProcess(true);
                                    stopRecording();
                                }}
                                className="p-2 rounded-full hover:bg-primary/10 text-primary transition-colors"
                                title="Stop and Process"
                            >
                                <Square className="w-4 h-4 fill-current" />
                            </button>
                            <button
                                onClick={cancelRecording}
                                className="p-2 rounded-full hover:bg-red-100 text-red-600 transition-colors"
                                title="Cancel Recording"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="relative">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-foreground">Processing Meeting</p>
                            <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                                <div
                                    className="bg-primary h-1.5 rounded-full transition-all duration-500"
                                    style={{ width: `${processingProgress}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 truncate max-w-[180px]">{processingStatus}</p>
                        </div>
                    </>
                )}

                <div className="border-l pl-3 ml-1">
                    <Maximize2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
                </div>
            </div>
        </div>
    );
}

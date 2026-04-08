'use client';

import { Calendar } from 'lucide-react';
import {
  MotionDialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

interface CalendarConnectModalProps {
    isOpen: boolean;
    onConnect: () => void;
    onSkip: () => void;
    isConnecting?: boolean;
}

export default function CalendarConnectModal({
    isOpen,
    onConnect,
    onSkip,
    isConnecting = false,
}: CalendarConnectModalProps) {
    return (
        <MotionDialog open={isOpen} onOpenChange={(open) => { if (!open) onSkip(); }}>
            <DialogContent className="max-w-md overflow-hidden p-0" hideClose>
                <DialogTitle className="sr-only">Connect Google Calendar</DialogTitle>
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-primary px-6 py-8 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-primary-foreground">
                        Connect Google Calendar?
                    </h2>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-muted-foreground text-center mb-6">
                        Sync your conversations and automatically add action items to your Google Calendar.
                        You can always connect later from Settings.
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={onConnect}
                            disabled={isConnecting}
                            className="w-full py-3 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-green-500/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isConnecting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Connecting...</span>
                                </>
                            ) : (
                                <>
                                    <Calendar className="w-5 h-5" />
                                    <span>Connect Now</span>
                                </>
                            )}
                        </button>

                        <button
                            onClick={onSkip}
                            disabled={isConnecting}
                            className="w-full py-3 border border-border text-muted-foreground font-medium rounded-xl hover:bg-muted transition-colors disabled:opacity-50"
                        >
                            Maybe Later
                        </button>
                    </div>
                </div>
            </DialogContent>
        </MotionDialog>
    );
}

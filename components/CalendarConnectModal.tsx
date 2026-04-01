'use client';

import { Calendar, X } from 'lucide-react';
import { motion } from 'framer-motion';

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
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="bg-card rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
            >
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
                        Sync your meetings and automatically add action items to your Google Calendar.
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
            </motion.div>
        </div>
    );
}

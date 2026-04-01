'use client';

import { useState, useEffect } from 'react';
import { Sun, RefreshCw, X, ChevronUp, ChevronDown } from 'lucide-react';
import { briefingAPI } from '@/lib/api';

interface BriefingData {
    date: string;
    content: string | null;
    generated_now?: boolean;
    message?: string;
}

export default function MorningBriefingBubble() {
    const [briefing, setBriefing] = useState<BriefingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [regenerating, setRegenerating] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        loadBriefing();
    }, []);

    const loadBriefing = async () => {
        try {
            setLoading(true);
            const data = await briefingAPI.getTodaysBriefing();
            setBriefing(data);
        } catch (e) {
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerate = async () => {
        try {
            setRegenerating(true);
            const data = await briefingAPI.generateBriefing();
            setBriefing(data);
        } catch (e) {
        } finally {
            setRegenerating(false);
        }
    };

    // Get current hour
    const currentHour = new Date().getHours();
    // Force visible for user verification
    // const isMorning = currentHour >= 4 && currentHour < 12;
    const isMorning = true;

    // Don't show if loading or no content outside morning (bypassed for now)
    if (loading) return null;
    // if (!briefing?.content && !isMorning) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Expanded Panel */}
            {isExpanded && (
                <div className="mb-4 w-80 sm:w-96 bg-card rounded-2xl shadow-2xl border border-amber-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white">
                            <Sun className="w-5 h-5" />
                            <span className="font-semibold">Good Morning!</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleRegenerate}
                                disabled={regenerating}
                                className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                                title="Refresh"
                            >
                                <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
                            </button>
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                                title="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 max-h-80 overflow-y-auto">
                        {briefing?.content ? (
                            <div className="text-sm text-foreground/80 space-y-2">
                                {briefing.content.split('\n').map((line, i) => (
                                    line.trim() && (
                                        <p key={i} className={`${line.includes('**') ? 'font-semibold text-foreground' : ''}`}>
                                            {line.replace(/\*\*/g, '')}
                                        </p>
                                    )
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-sm text-muted-foreground mb-3">No briefing yet</p>
                                <button
                                    onClick={handleRegenerate}
                                    disabled={regenerating}
                                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {regenerating ? 'Generating...' : 'Generate Briefing'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Floating Bubble Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`
                    group relative w-14 h-14 rounded-full shadow-lg 
                    bg-gradient-to-br from-amber-400 to-orange-500
                    hover:from-amber-500 hover:to-orange-600
                    hover:scale-110 hover:shadow-xl
                    transition-all duration-300 ease-out
                    flex items-center justify-center
                    ${isExpanded ? 'ring-4 ring-amber-200' : ''}
                `}
            >
                <Sun className="w-7 h-7 text-white" />

                {/* Pulse animation when has content */}
                {briefing?.content && !isExpanded && (
                    <span className="absolute top-0 right-0 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                )}

                {/* Tooltip */}
                <span className="absolute right-full mr-3 px-3 py-1.5 bg-foreground text-background text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Morning Briefing
                </span>
            </button>
        </div>
    );
}

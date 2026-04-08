'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Sun, RefreshCw, X } from 'lucide-react';
import { briefingAPI } from '@/lib/api';

const STORAGE_KEY = 'morning-briefing-position';
const BUBBLE_SIZE = 56; // w-14 = 56px
const EDGE_PADDING = 16;

interface BriefingData {
    date: string;
    content: string | null;
    generated_now?: boolean;
    message?: string;
}

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

function getSavedPosition(): { x: number; y: number } | null {
    if (typeof window === 'undefined') return null;
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const pos = JSON.parse(saved);
            // Validate saved position is still within viewport
            const maxX = window.innerWidth - BUBBLE_SIZE - EDGE_PADDING;
            const maxY = window.innerHeight - BUBBLE_SIZE - EDGE_PADDING;
            return {
                x: clamp(pos.x, EDGE_PADDING, maxX),
                y: clamp(pos.y, EDGE_PADDING, maxY),
            };
        }
    } catch {}
    return null;
}

export default function MorningBriefingBubble() {
    // DESIGN EXCEPTION: Amber/orange gradient is intentional for "morning sun" theming.
    // See DESIGN.md for brand color rules (green-only accent).
    const [briefing, setBriefing] = useState<BriefingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [regenerating, setRegenerating] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);
    const bubbleRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadBriefing();
        const saved = getSavedPosition();
        if (saved) {
            setPosition(saved);
        } else {
            // Default: bottom-right
            setPosition({ x: window.innerWidth - BUBBLE_SIZE - EDGE_PADDING - 8, y: window.innerHeight - BUBBLE_SIZE - EDGE_PADDING - 8 });
        }
    }, []);

    // Re-clamp position on window resize
    useEffect(() => {
        const handleResize = () => {
            setPosition((prev) => {
                if (!prev) return prev;
                const maxX = window.innerWidth - BUBBLE_SIZE - EDGE_PADDING;
                const maxY = window.innerHeight - BUBBLE_SIZE - EDGE_PADDING;
                return {
                    x: clamp(prev.x, EDGE_PADDING, maxX),
                    y: clamp(prev.y, EDGE_PADDING, maxY),
                };
            });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        if (!position) return;
        e.preventDefault();
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            startPosX: position.x,
            startPosY: position.y,
        };
        setIsDragging(false);
    }, [position]);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!dragRef.current) return;
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;

        // Only start dragging after 4px threshold (distinguishes from click)
        if (!isDragging && Math.abs(dx) + Math.abs(dy) > 4) {
            setIsDragging(true);
        }

        const maxX = window.innerWidth - BUBBLE_SIZE - EDGE_PADDING;
        const maxY = window.innerHeight - BUBBLE_SIZE - EDGE_PADDING;

        setPosition({
            x: clamp(dragRef.current.startPosX + dx, EDGE_PADDING, maxX),
            y: clamp(dragRef.current.startPosY + dy, EDGE_PADDING, maxY),
        });
    }, [isDragging]);

    const handlePointerUp = useCallback(() => {
        if (!dragRef.current || !position) {
            dragRef.current = null;
            return;
        }
        dragRef.current = null;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
        // Delay resetting isDragging so the click handler can check it
        requestAnimationFrame(() => {
            setIsDragging(false);
        });
    }, [position]);

    const handleBubbleClick = useCallback(() => {
        if (!isDragging) {
            setIsExpanded((prev) => !prev);
        }
    }, [isDragging]);

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

    const currentHour = new Date().getHours();
    const isMorning = currentHour >= 4 && currentHour < 12;

    if (loading || !position) return null;
    if (!briefing?.content && !isMorning) return null;

    // Compute panel position: open upward or downward, left or right
    const panelWidth = 384; // w-96 = 384px
    const panelHeight = 360;
    const isNearBottom = position.y > window.innerHeight - panelHeight - BUBBLE_SIZE - 40;
    const isNearRight = position.x > window.innerWidth - panelWidth - 20;

    const panelStyle: React.CSSProperties = {
        position: 'absolute',
        width: Math.min(panelWidth, window.innerWidth - 32),
        ...(isNearBottom
            ? { bottom: BUBBLE_SIZE + 12 }
            : { top: BUBBLE_SIZE + 12 }),
        ...(isNearRight
            ? { right: 0 }
            : { left: 0 }),
    };

    return (
        <div
            ref={bubbleRef}
            className="fixed z-50"
            style={{
                left: position.x,
                top: position.y,
                width: BUBBLE_SIZE,
                height: BUBBLE_SIZE,
            }}
        >
            {/* Expanded Panel */}
            {isExpanded && (
                <div
                    ref={panelRef}
                    style={panelStyle}
                    className="bg-card rounded-xl shadow-2xl border border-amber-200/50 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200"
                >
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
            <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onClick={handleBubbleClick}
                className={`
                    group relative w-14 h-14 rounded-full shadow-lg cursor-grab active:cursor-grabbing
                    bg-gradient-to-br from-amber-400 to-orange-500
                    hover:from-amber-500 hover:to-orange-600
                    hover:shadow-xl
                    transition-shadow duration-300 ease-out
                    flex items-center justify-center select-none
                    ${isExpanded ? 'ring-4 ring-amber-200' : ''}
                    ${isDragging ? 'scale-105 shadow-2xl' : 'hover:scale-110'}
                `}
                style={{ transition: isDragging ? 'box-shadow 0.2s' : 'all 0.3s ease-out' }}
            >
                <Sun className="w-7 h-7 text-white pointer-events-none" />

                {/* Pulse animation when has content */}
                {briefing?.content && !isExpanded && (
                    <span className="absolute top-0 right-0 flex h-3 w-3 pointer-events-none">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                )}

                {/* Tooltip — hidden while dragging */}
                {!isDragging && (
                    <span className="absolute left-full ml-3 px-3 py-1.5 bg-foreground text-background text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Morning Briefing
                    </span>
                )}
            </div>
        </div>
    );
}

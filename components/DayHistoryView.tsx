'use client';

import { useRouter } from 'next/navigation';
import { Calendar, FileText, RefreshCw, Sparkles, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useMemo, useState, useEffect } from 'react';
import { summaryAPI } from '@/lib/api';

interface Meeting {
    job_id: string;
    created_at: string;
    summary_preview: string;
    event_count: number;
    has_custom_query: boolean;
}

interface DayHistoryViewProps {
    meetings: Meeting[];
}

interface DayGroup {
    date: string;
    meetingCount: number;
    totalEvents: number;
}

interface Source {
    index: number;
    job_id: string;
    title: string;
}

interface SummaryData {
    content: string;
    sources: Source[];
}

function DayGroupItem({ group }: { group: DayGroup }) {
    const router = useRouter();
    const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingSummary, setLoadingSummary] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        loadSummary();
    }, [group.date]);

    const loadSummary = async () => {
        setLoadingSummary(true);
        try {
            const data = await summaryAPI.getDailySummary(group.date);
            setSummaryData({
                content: data.content,
                sources: data.sources || []
            });
        } catch (e) {
            // Summary might not exist yet
        } finally {
            setLoadingSummary(false);
        }
    };

    const handleRegenerate = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setLoading(true);
        try {
            const data = await summaryAPI.generateDailySummary(group.date);
            setSummaryData({
                content: data.content,
                sources: data.sources || []
            });
        } catch (e) {
        } finally {
            setLoading(false);
        }
    };

    // Parse [N] tags and replace with link icons only
    const renderSummaryWithLinks = (text: string, sources: Source[]) => {
        const sourceMap = new Map(sources.map(s => [s.index, s]));

        // Split by reference tags like [1], [2] (single number only, no ranges)
        const parts = text.split(/(\[\d+\])/g);

        return parts.map((part, i) => {
            const match = part.match(/^\[(\d+)\]$/);
            if (match) {
                const idx = parseInt(match[1]);
                const source = sourceMap.get(idx);
                if (source) {
                    return (
                        <button
                            key={i}
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/meeting?id=${source.job_id}`);
                            }}
                            className="inline-flex items-center ml-1 p-0.5 text-primary hover:text-text-primary hover:bg-primary/10 rounded transition-colors"
                            title={`Go to: ${source.title}`}
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                    );
                }
                // If source not found, just hide the tag
                return null;
            }
            return <span key={i}>{part}</span>;
        });
    };

    // Get preview text (first ~150 chars, without reference tags)
    const previewText = summaryData?.content
        ? summaryData.content
            .replace(/\[\d+\]/g, '') // Remove [N] tags for preview
            .slice(0, 150)
            .trim() + (summaryData.content.length > 150 ? '...' : '')
        : null;

    return (
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            {/* Day Header */}
            <div className="bg-gradient-to-r from-primary/5 to-muted px-6 py-4 border-b border-border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">
                            {formatDate(group.date)}
                        </h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-card rounded-full border border-border">
                            <FileText className="w-4 h-4 text-primary" />
                            <span className="font-medium">{group.meetingCount}</span>
                            <span>meeting{group.meetingCount !== 1 ? 's' : ''}</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Summary Section */}
            <div className="px-6 py-4">
                {loadingSummary ? (
                    <div className="animate-pulse">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-muted rounded" />
                                <div className="h-3.5 w-28 bg-muted rounded" />
                            </div>
                            <div className="h-3.5 w-20 bg-muted rounded" />
                        </div>
                        <div className="h-4 bg-muted rounded w-full mb-2" />
                        <div className="h-4 bg-muted rounded w-4/5 mb-3" />
                        <div className="flex items-center justify-center pt-2 border-t border-border">
                            <div className="h-3.5 w-24 bg-muted rounded" />
                        </div>
                    </div>
                ) : summaryData ? (
                    <div>
                        {/* Summary Header */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-text-primary">
                                <Sparkles className="w-4 h-4" />
                                <h4 className="text-sm font-semibold uppercase tracking-wide">Daily Summary</h4>
                            </div>
                            <button
                                onClick={handleRegenerate}
                                disabled={loading}
                                className="text-xs flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                            >
                                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                                {loading ? 'Updating...' : 'Regenerate'}
                            </button>
                        </div>

                        {/* Collapsible Summary Content */}
                        <div
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="cursor-pointer group"
                        >
                            {isExpanded ? (
                                // Full summary with link icons
                                <div className="prose prose-sm max-w-none text-foreground/80 leading-relaxed">
                                    {summaryData.content.split('\n').map((line, i) => (
                                        line.trim() && (
                                            <p key={i} className="mb-2">
                                                {renderSummaryWithLinks(line, summaryData.sources)}
                                            </p>
                                        )
                                    ))}
                                </div>
                            ) : (
                                // Preview (collapsed)
                                <div className="text-sm text-muted-foreground line-clamp-2">
                                    {previewText}
                                </div>
                            )}

                            {/* Expand/Collapse indicator */}
                            <div className="flex items-center justify-center mt-2 pt-2 border-t border-border">
                                <span className="text-xs text-muted-foreground group-hover:text-primary flex items-center gap-1 transition-colors">
                                    {isExpanded ? (
                                        <>
                                            <ChevronUp className="w-4 h-4" />
                                            Click to collapse
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="w-4 h-4" />
                                            Click to expand
                                        </>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    // No summary yet
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <Sparkles className="w-8 h-8 text-muted-foreground/40 mb-2" />
                        <p className="text-sm text-muted-foreground mb-3">No summary generated yet</p>
                        <button
                            onClick={handleRegenerate}
                            disabled={loading}
                            className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground text-sm font-medium rounded-lg flex items-center gap-2 transition-colors disabled:bg-primary/70"
                        >
                            <Sparkles className="w-4 h-4" />
                            {loading ? 'Generating...' : 'Generate Daily Summary'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function DayHistoryView({ meetings }: DayHistoryViewProps) {
    const dayGroups = useMemo((): DayGroup[] => {
        const grouped = new Map<string, Meeting[]>();

        meetings.forEach((meeting) => {
            const date = new Date(meeting.created_at).toISOString().split('T')[0];
            if (!grouped.has(date)) {
                grouped.set(date, []);
            }
            grouped.get(date)!.push(meeting);
        });

        const groups: DayGroup[] = Array.from(grouped.entries())
            .map(([date, dayMeetings]) => ({
                date,
                meetingCount: dayMeetings.length,
                totalEvents: dayMeetings.reduce((sum, m) => sum + (m.event_count || 0), 0),
            }))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return groups;
    }, [meetings]);

    if (dayGroups.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No meetings to display</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {dayGroups.map((group) => (
                <DayGroupItem key={group.date} group={group} />
            ))}
        </div>
    );
}

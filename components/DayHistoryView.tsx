'use client';

import { useRouter } from 'next/navigation';
import { useLocalePath } from '@/lib/i18n/use-locale-path';
import { Calendar, FileText, RefreshCw, Sparkles, ChevronDown, ChevronUp, ExternalLink, AlertTriangle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { summaryAPI } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/use-translation';

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

interface DailySummaryQueryData {
    status: 'ready' | 'generating' | 'not_found';
    content?: string;
    sources?: Source[];
}

const VISIBLE_DAYS_STEP = 14;

function DayGroupItem({ group }: { group: DayGroup }) {
    const router = useRouter();
    const lp = useLocalePath();
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [isExpanded, setIsExpanded] = useState(false);

    const queryKey = ['dailySummary', group.date];

    const { data, isLoading, isError, refetch } = useQuery<DailySummaryQueryData>({
        queryKey,
        queryFn: async () => {
            try {
                const res = await summaryAPI.getDailySummary(group.date);
                return {
                    status: res.status === 'generating' ? 'generating' : 'ready',
                    content: res.content,
                    sources: res.sources || [],
                };
            } catch (e: any) {
                if (e?.response?.status === 404) {
                    return { status: 'not_found' };
                }
                throw e;
            }
        },
        // Generation runs server-side in the background; keep polling only
        // while a run is in flight for this date. TanStack dedupes by
        // queryKey, so this replaces the old per-mount setInterval loop.
        refetchInterval: (query) => (query.state.data?.status === 'generating' ? 4000 : false),
        staleTime: 5 * 60 * 1000,
    });

    const regenerateMutation = useMutation({
        mutationFn: () => summaryAPI.generateDailySummary(group.date),
        onSuccess: () => {
            queryClient.setQueryData<DailySummaryQueryData>(queryKey, { status: 'generating' });
        },
    });

    const loading = regenerateMutation.isPending || data?.status === 'generating';

    const handleRegenerate = (e: React.MouseEvent) => {
        e.stopPropagation();
        regenerateMutation.mutate();
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
                                router.push(lp(`/conversation?id=${source.job_id}`));
                            }}
                            className="inline-flex items-center ms-1 p-0.5 text-primary hover:text-text-primary hover:bg-primary/10 rounded transition-colors"
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

    const summaryContent = data?.status === 'ready' ? data.content : undefined;
    const summarySources = data?.sources || [];

    // Get preview text (first ~150 chars, without reference tags)
    const previewText = summaryContent
        ? summaryContent
            .replace(/\[\d+\]/g, '') // Remove [N] tags for preview
            .slice(0, 150)
            .trim() + (summaryContent.length > 150 ? '...' : '')
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
                            <span>{group.meetingCount !== 1 ? t('history.day_view.meetings_plural') : t('history.day_view.meetings_suffix')}</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Summary Section */}
            <div className="px-6 py-4">
                {isLoading ? (
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
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <AlertTriangle className="w-8 h-8 text-muted-foreground/40 mb-2" />
                        <p className="text-sm text-muted-foreground mb-3">{t('history.day_view.load_error')}</p>
                        <button
                            onClick={() => refetch()}
                            className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            {t('common.retry')}
                        </button>
                    </div>
                ) : summaryContent ? (
                    <div>
                        {/* Summary Header */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-text-primary">
                                <Sparkles className="w-4 h-4" />
                                <h4 className="text-sm font-semibold uppercase tracking-wide">{t('history.day_view.daily_summary')}</h4>
                            </div>
                            <button
                                onClick={handleRegenerate}
                                disabled={loading}
                                className="text-xs flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                            >
                                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                                {loading ? t('history.day_view.updating') : t('history.day_view.regenerate')}
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
                                    {summaryContent.split('\n').map((line, i) => (
                                        line.trim() && (
                                            <p key={i} className="mb-2">
                                                {renderSummaryWithLinks(line, summarySources)}
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
                                            {t('history.day_view.collapse')}
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="w-4 h-4" />
                                            {t('history.day_view.expand')}
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
                        <p className="text-sm text-muted-foreground mb-3">{t('history.day_view.no_summary')}</p>
                        <button
                            onClick={handleRegenerate}
                            disabled={loading}
                            className="px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground text-sm font-medium rounded-lg flex items-center gap-2 transition-colors disabled:bg-primary/70"
                        >
                            <Sparkles className="w-4 h-4" />
                            {loading ? t('history.day_view.generating') : t('history.day_view.generate_btn')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function DayHistoryView({ meetings }: DayHistoryViewProps) {
    const { t } = useTranslation();
    const [visibleCount, setVisibleCount] = useState(VISIBLE_DAYS_STEP);

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

    const visibleGroups = dayGroups.slice(0, visibleCount);
    const hasMore = dayGroups.length > visibleCount;

    return (
        <div className="space-y-6">
            {visibleGroups.map((group) => (
                <DayGroupItem key={group.date} group={group} />
            ))}
            {hasMore && (
                <div className="flex justify-center pt-2">
                    <button
                        onClick={() => setVisibleCount((c) => c + VISIBLE_DAYS_STEP)}
                        className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg border border-border transition-colors"
                    >
                        {t('history.day_view.load_more')}
                    </button>
                </div>
            )}
        </div>
    );
}

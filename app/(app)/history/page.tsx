'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useToast } from '@/components/Toast';
import PageEntrance from '@/components/ui/page-entrance';
import Pagination from '@/components/Pagination';
import EmptyState from '@/components/EmptyState';
import HistoryTabs from '@/components/HistoryTabs';
import DayHistoryView from '@/components/DayHistoryView';
import { DateGroupedList } from '@/components/DateGroupedList';
import { meetingsAPI } from '@/lib/api';
import { formatDate, truncate } from '@/lib/utils';
import { exportMeetingsToCSV } from '@/lib/export';
import { Skeleton } from 'boneyard-js/react';
import ConfirmDialog from '@/components/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { DURATIONS, EASINGS } from '@/lib/motion';
import {
  Calendar,
  FileText,
  Trash2,
  Check,
  Download,
  ArrowUpDown,
} from 'lucide-react';

export default function HistoryPage() {
  const router = useRouter();
  const { user, loading } = useRequireAuth();
  const toast = useToast();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'events'>('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedMeetingIds, setSelectedMeetingIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [historyView, setHistoryView] = useState<'meetings' | 'days'>('meetings');
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    confirmLabel?: string;
  } | null>(null);

  const hasSelection = selectedMeetingIds.length > 0;

  useEffect(() => {
    if (user) {
      loadMeetings();
    }
  }, [user]);

  const loadMeetings = async () => {
    try {
      const data = await meetingsAPI.getMeetings();
      setMeetings(data.meetings);
    } catch (error) {
    } finally {
      setLoadingMeetings(false);
    }
  };

  const handleDelete = (jobId: string) => {
    setConfirmDialog({
      title: 'Delete meeting',
      message: 'Are you sure you want to delete this meeting?',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        try {
          await meetingsAPI.deleteMeeting(jobId);
          setMeetings(meetings.filter((m) => m.job_id !== jobId));
        } catch (error) {
          toast.error('Failed to delete meeting');
        }
      },
    });
  };

  const handleToggleSelectMeeting = (meetingId: number) => {
    setSelectedMeetingIds((prev) =>
      prev.includes(meetingId)
        ? prev.filter((id) => id !== meetingId)
        : [...prev, meetingId]
    );
  };

  const handleSelectAll = () => {
    const allMeetingIds = paginatedMeetings.map((m) => m.id);
    setSelectedMeetingIds(allMeetingIds);
  };

  const handleDeselectAll = () => {
    setSelectedMeetingIds([]);
  };

  const handleBulkDelete = async () => {
    if (selectedMeetingIds.length === 0) {
      toast.error('No meetings selected');
      return;
    }

    setConfirmDialog({
      title: 'Delete selected meetings',
      message: `Are you sure you want to delete ${selectedMeetingIds.length} selected meeting(s)?`,
      confirmLabel: 'Delete',
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          const result = await meetingsAPI.bulkDeleteMeetings(selectedMeetingIds);
          setMeetings(meetings.filter((m) => !selectedMeetingIds.includes(m.id)));
          setSelectedMeetingIds([]);
          toast.success(`Deleted ${result.deleted_count} meeting(s)`);
        } catch (error) {
          toast.error('Failed to delete selected meetings');
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const handleDeleteAll = async () => {
    if (meetings.length === 0) {
      toast.error('No meetings to delete');
      return;
    }

    setConfirmDialog({
      title: 'Delete all meetings',
      message: `Are you sure you want to delete ALL ${meetings.length} meeting(s)? This action cannot be undone.`,
      confirmLabel: 'Delete all',
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          const result = await meetingsAPI.deleteAllMeetings();
          setMeetings([]);
          setSelectedMeetingIds([]);
          toast.success(`Deleted all ${result.deleted_count} meeting(s)`);
        } catch (error) {
          toast.error('Failed to delete all meetings');
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const sortedMeetings = [...meetings].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return b.event_count - a.event_count;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedMeetings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMeetings = sortedMeetings.slice(startIndex, endIndex);

  const allOnPageSelected =
    paginatedMeetings.length > 0 &&
    paginatedMeetings.every((m) => selectedMeetingIds.includes(m.id));

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const historySkeleton = (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header skeleton */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="h-8 bg-muted rounded w-56 mb-2 animate-pulse" />
            <div className="h-4 bg-muted rounded w-36 mt-1 animate-pulse" />
          </div>
          <div className="h-10 w-52 bg-muted rounded-lg animate-pulse" />
        </div>

        {/* Toolbar skeleton */}
        <div className="h-[44px] bg-surface/50 rounded-lg border border-border/60 mb-6 animate-pulse" />

        {/* Date groups skeleton */}
        <div className="space-y-8">
          {[...Array(2)].map((_, gi) => (
            <div key={gi}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2.5 h-2.5 bg-muted rounded-full animate-pulse" />
                <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                <div className="flex-1 h-px bg-border/50" />
              </div>
              <div className="space-y-3 ml-[5px] border-l border-border/40 pl-5">
                {[...Array(gi === 0 ? 1 : 2)].map((_, ci) => (
                  <div
                    key={ci}
                    className="bg-card rounded-lg border border-border p-5 animate-pulse"
                  >
                    <div className="flex gap-4">
                      <div className="w-5 h-5 bg-muted rounded mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-5 bg-muted rounded w-48" />
                          <div className="h-4 bg-muted rounded w-32" />
                        </div>
                        <div className="h-4 bg-muted rounded w-full mb-1" />
                        <div className="h-4 bg-muted rounded w-3/4 mb-4" />
                        <div className="flex items-center gap-3">
                          <div className="h-4 bg-muted rounded w-20" />
                          <div className="h-5 bg-muted rounded w-28" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const tabContentVariants = {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0, transition: { duration: DURATIONS.normal, ease: EASINGS.easeOut } },
    exit: { opacity: 0, y: -4, transition: { duration: DURATIONS.fast, ease: EASINGS.easeIn } },
  };

  return (
    <Skeleton name="history-groups" loading={loading || loadingMeetings} fallback={historySkeleton}>
      <div className="min-h-screen bg-background">
        <PageEntrance name="history" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* ── Header ── */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Meeting History
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {meetings.length} meeting{meetings.length !== 1 ? 's' : ''} analyzed
              </p>
            </div>
            <HistoryTabs activeView={historyView} onViewChange={setHistoryView} />
          </div>

          {/* ── Tab content ── */}
          <AnimatePresence mode="wait">
            {historyView === 'meetings' && (
              <motion.div key="meetings" {...tabContentVariants}>
                {/* ── Toolbar ── */}
                {meetings.length > 0 && (
                  <div className="flex items-center justify-between gap-3 mb-6 py-2.5 px-4 bg-surface/50 rounded-lg border border-border/60">
                    {/* Left: select + actions */}
                    <div className="flex items-center gap-3">
                      {/* Select all checkbox */}
                      <label className="flex items-center gap-2 cursor-pointer select-none group">
                        <input
                          type="checkbox"
                          checked={allOnPageSelected}
                          onChange={allOnPageSelected ? handleDeselectAll : handleSelectAll}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                        />
                        <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                          All
                        </span>
                      </label>

                      <div className="w-px h-5 bg-border/60" />

                      {/* Selection-aware actions — grid-stack crossfade, no layout shift */}
                      <div className="grid [grid-template-areas:'stack'] h-8 items-center">
                        {/* Default actions (no selection) */}
                        <div
                          className="flex items-center gap-2 [grid-area:stack] transition-opacity duration-200"
                          style={{ opacity: hasSelection ? 0 : 1, pointerEvents: hasSelection ? 'none' : 'auto' }}
                        >
                          <button
                            onClick={handleDeleteAll}
                            disabled={isDeleting}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Delete All</span>
                          </button>
                          <button
                            onClick={() => exportMeetingsToCSV(meetings)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary-hover rounded-md transition-colors shadow-sm"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Export</span>
                          </button>
                        </div>

                        {/* Selection actions */}
                        <div
                          className="flex items-center gap-2 [grid-area:stack] transition-opacity duration-200"
                          style={{ opacity: hasSelection ? 1 : 0, pointerEvents: hasSelection ? 'auto' : 'none' }}
                        >
                          <span className="text-xs font-medium text-primary tabular-nums">
                            {selectedMeetingIds.length} selected
                          </span>
                          <button
                            onClick={handleBulkDelete}
                            disabled={isDeleting}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-destructive-foreground bg-destructive hover:bg-destructive/90 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right: sort */}
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="text-xs font-medium bg-transparent text-muted-foreground hover:text-foreground border-none focus:ring-0 cursor-pointer pr-6 py-1"
                      >
                        <option value="date">Date</option>
                        <option value="events">Events</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* ── Meeting list ── */}
                {meetings.length === 0 ? (
                  <div className="bg-card rounded-lg border border-border shadow-sm">
                    <EmptyState
                      icon={FileText}
                      title="No meetings yet"
                      description="Upload your first meeting to get started"
                      action={{
                        label: 'Go to Dashboard',
                        onClick: () => router.push('/dashboard'),
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <DateGroupedList
                      items={paginatedMeetings}
                      dateKey="created_at"
                      renderItem={(meeting: any) => (
                        <div
                          key={meeting.job_id}
                          className={`group relative bg-card rounded-lg border transition-all duration-200 cursor-pointer ${
                            selectedMeetingIds.includes(meeting.id)
                              ? 'border-primary/40 ring-1 ring-primary/20'
                              : 'border-border hover:border-border/80 hover:shadow-md'
                          }`}
                        >
                          <div className="flex gap-4 p-5">
                            {/* Checkbox */}
                            <div className="flex-shrink-0 pt-0.5">
                              <input
                                type="checkbox"
                                checked={selectedMeetingIds.includes(meeting.id)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleToggleSelectMeeting(meeting.id);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                              />
                            </div>

                            {/* Content */}
                            <div
                              className="flex-1 min-w-0"
                              onClick={() => router.push(`/meeting?id=${meeting.job_id}`)}
                            >
                              <div className="flex items-baseline gap-3 mb-1.5">
                                <h3 className="text-base font-semibold text-foreground truncate">
                                  {meeting.title || 'Meeting Analysis'}
                                </h3>
                                <span className="text-xs text-muted-foreground whitespace-nowrap font-mono">
                                  {formatDate(meeting.created_at)}
                                </span>
                              </div>

                              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                                {truncate(meeting.summary_preview, 180)}
                              </p>

                              <div className="flex items-center gap-3 text-xs">
                                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {meeting.event_count} event{meeting.event_count !== 1 ? 's' : ''}
                                </span>
                                {meeting.has_custom_query && (
                                  <span className="px-2 py-0.5 bg-accent text-accent-foreground rounded-full text-xs font-medium">
                                    Analysis
                                  </span>
                                )}
                                {meeting.calendar_synced && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                    <Check className="w-3 h-3" />
                                    Synced
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Delete */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(meeting.job_id);
                              }}
                              className="flex-shrink-0 p-1.5 text-muted-foreground/0 group-hover:text-muted-foreground hover:!text-destructive hover:bg-destructive/10 rounded-md transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    />

                    {meetings.length > 10 && (
                      <div className="mt-8 bg-card rounded-lg border border-border">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          totalItems={sortedMeetings.length}
                          itemsPerPage={itemsPerPage}
                          onPageChange={handlePageChange}
                          onItemsPerPageChange={handleItemsPerPageChange}
                        />
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {/* Day History View */}
            {historyView === 'days' && (
              <motion.div key="days" {...tabContentVariants}>
                <DayHistoryView meetings={meetings} />
              </motion.div>
            )}
          </AnimatePresence>
        </PageEntrance>

        {confirmDialog && (
          <ConfirmDialog
            isOpen={!!confirmDialog}
            title={confirmDialog.title}
            message={confirmDialog.message}
            confirmLabel={confirmDialog.confirmLabel}
            onConfirm={() => {
              confirmDialog.onConfirm();
              setConfirmDialog(null);
            }}
            onCancel={() => setConfirmDialog(null)}
          />
        )}
      </div>
    </Skeleton>
  );
}

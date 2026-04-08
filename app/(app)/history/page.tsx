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
import { MeetingCard } from '@/components/MeetingCard';
import { meetingsAPI } from '@/lib/api';
import { exportMeetingsToCSV } from '@/lib/export';
import { Skeleton } from 'boneyard-js/react';
import CustomDropdown from '@/components/ui/custom-dropdown';
import ConfirmDialog from '@/components/ConfirmDialog';
import { AnimatePresence, motion } from 'framer-motion';
import { DURATIONS, EASINGS } from '@/lib/motion';
import {
  FileText,
  Trash2,
  Check,
  Download,
  Search,
  X,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    confirmLabel?: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      loadMeetings();
    }
  }, [user]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const loadMeetings = async () => {
    try {
      const data = await meetingsAPI.getMeetings();
      setMeetings(data.meetings);
    } catch (error) {
      toast.error('Failed to load meetings');
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
          setMeetings((prev) => prev.filter((m) => m.job_id !== jobId));
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
          setMeetings((prev) => prev.filter((m) => !selectedMeetingIds.includes(m.id)));
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

  const handleViewMeeting = (jobId: string) => {
    router.push(`/meeting?id=${jobId}`);
  };

  // Sort
  const sortedMeetings = [...meetings].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    return b.event_count - a.event_count;
  });

  // Filter by search
  const filteredMeetings = sortedMeetings.filter((m) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (m.title || '').toLowerCase().includes(query) ||
      (m.summary_preview || '').toLowerCase().includes(query)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredMeetings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMeetings = filteredMeetings.slice(startIndex, endIndex);

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
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="h-8 bg-muted rounded w-56 mb-2 animate-pulse" />
            <div className="h-4 bg-muted rounded w-36 mt-1 animate-pulse" />
          </div>
          <div className="h-10 w-28 bg-muted rounded-lg animate-pulse" />
        </div>

        {/* Tabs skeleton */}
        <div className="flex gap-4 border-b border-border mb-6">
          <div className="h-5 w-20 bg-muted rounded animate-pulse mb-2.5" />
          <div className="h-5 w-14 bg-muted rounded animate-pulse mb-2.5" />
        </div>

        {/* Toolbar skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="h-10 w-64 bg-muted rounded-lg animate-pulse" />
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-muted rounded-lg animate-pulse" />
            <div className="h-9 w-16 bg-muted rounded-lg animate-pulse" />
            <div className="h-9 w-20 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg border border-border p-5 animate-pulse">
              <div className="flex items-start gap-2 mb-2">
                <div className="w-4 h-4 bg-muted rounded mt-0.5" />
                <div className="h-5 bg-muted rounded flex-1" />
                <div className="h-5 w-28 bg-muted rounded-full" />
              </div>
              <div className="ml-6 space-y-2 mb-3">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
              <div className="flex items-center gap-3 ml-6">
                <div className="h-4 bg-muted rounded w-20" />
                <div className="h-4 bg-muted rounded w-32" />
                <div className="h-4 bg-muted rounded w-24" />
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
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Meeting History
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {meetings.length} meeting{meetings.length !== 1 ? 's' : ''} analyzed
              </p>
            </div>
            <button
              onClick={() => exportMeetingsToCSV(meetings)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-primary text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <HistoryTabs activeView={historyView} onViewChange={setHistoryView} />
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            {historyView === 'meetings' && (
              <motion.div key="meetings" {...tabContentVariants}>
                {/* Toolbar */}
                {meetings.length > 0 && (
                  <div className="flex items-center justify-between gap-4 mb-6">
                    {/* Search */}
                    <div className="relative flex-1 max-w-xs">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-card border border-border rounded-lg py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSelectAll}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Select All
                      </button>
                      <button
                        onClick={handleDeselectAll}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Clear
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        disabled={selectedMeetingIds.length === 0 || isDeleting}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-destructive-foreground bg-destructive hover:bg-destructive/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>

                      <div className="w-px h-5 bg-border/60 mx-1" />

                      <span className="text-sm text-muted-foreground">Sort By</span>
                      <CustomDropdown
                        value={sortBy}
                        onChange={(val) => setSortBy(val as 'date' | 'events')}
                        options={[
                          { value: 'events', label: 'Events' },
                          { value: 'date', label: 'Date' },
                        ]}
                      />
                    </div>
                  </div>
                )}

                {/* Meeting grid */}
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
                ) : filteredMeetings.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No meetings match your search</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {paginatedMeetings.map((meeting: any) => (
                        <MeetingCard
                          key={meeting.job_id}
                          meeting={meeting}
                          isSelected={selectedMeetingIds.includes(meeting.id)}
                          onToggleSelect={handleToggleSelectMeeting}
                          onView={handleViewMeeting}
                          onDelete={handleDelete}
                          openMenuId={openMenuId}
                          onToggleMenu={setOpenMenuId}
                        />
                      ))}
                    </div>

                    {filteredMeetings.length > itemsPerPage && (
                      <div className="mt-8 bg-card rounded-lg border border-border">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          totalItems={filteredMeetings.length}
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

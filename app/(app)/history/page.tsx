'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { toast } from 'sonner';
import PageEntrance from '@/components/ui/page-entrance';
import EmptyState from '@/components/EmptyState';
import HistoryTabs from '@/components/HistoryTabs';
import DayHistoryView from '@/components/DayHistoryView';
import { ConversationTable } from '@/components/ConversationTable';
import { conversationsAPI } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { exportConversationsToCSV } from '@/lib/export';
import { Skeleton } from 'boneyard-js/react';
import CustomDropdown from '@/components/ui/custom-dropdown';
import ConfirmDialog from '@/components/ConfirmDialog';
import { AnimatePresence, motion } from 'framer-motion';
import { DURATIONS, EASINGS } from '@/lib/motion';
import { AlignJustify } from 'lucide-react';
import {
  FileText,
  Trash2,
  Download,
  Search,
} from 'lucide-react';

type SortColumn = 'title' | 'events' | 'date';

export default function HistoryPage() {
  const router = useRouter();
  const { user, loading } = useRequireAuth();

  const queryClient = useQueryClient();
  const [sortColumn, setSortColumn] = useState<SortColumn>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedConversationIds, setSelectedConversationIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [historyView, setHistoryView] = useState<'conversations' | 'days'>('conversations');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    confirmLabel?: string;
  } | null>(null);

  const { data: conversationsData, isLoading: loadingConversations } = useQuery({
    queryKey: ['conversations', 'history'],
    queryFn: async () => {
      const data = await conversationsAPI.getConversations();
      return data.meetings ?? [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const conversations = conversationsData ?? [];

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleDelete = (jobId: string) => {
    setConfirmDialog({
      title: 'Delete conversation',
      message: 'Are you sure you want to delete this conversation?',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        try {
          await conversationsAPI.deleteConversation(jobId);
          queryClient.setQueryData(['conversations', 'history'], (old: any[] = []) =>
            old.filter((m) => m.job_id !== jobId)
          );
        } catch (error) {
          toast.error('Failed to delete conversation');
        }
      },
    });
  };

  const handleToggleSelectConversation = (conversationId: number) => {
    setSelectedConversationIds((prev) =>
      prev.includes(conversationId)
        ? prev.filter((id) => id !== conversationId)
        : [...prev, conversationId]
    );
  };

  const handleSelectAllOnPage = () => {
    const pageIds = paginatedConversations.map((m) => m.id);
    const allSelected = pageIds.every((id) => selectedConversationIds.includes(id));
    if (allSelected) {
      setSelectedConversationIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedConversationIds((prev) => [...new Set([...prev, ...pageIds])]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedConversationIds.length === 0) {
      toast.error('No conversations selected');
      return;
    }

    setConfirmDialog({
      title: 'Delete selected conversations',
      message: `Are you sure you want to delete ${selectedConversationIds.length} selected conversation(s)?`,
      confirmLabel: 'Delete',
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          const result = await conversationsAPI.bulkDeleteConversations(selectedConversationIds);
          queryClient.setQueryData(['conversations', 'history'], (old: any[] = []) =>
            old.filter((m) => !selectedConversationIds.includes(m.id))
          );
          setSelectedConversationIds([]);
          toast.success(`Deleted ${result.deleted_count} conversation(s)`);
        } catch (error) {
          toast.error('Failed to delete selected conversations');
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const handleViewConversation = (jobId: string) => {
    router.push(`/conversation?id=${jobId}`);
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDir('asc');
    }
  };

  const filteredConversations = useMemo(() => {
    let result = [...conversations];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          (m.title || '').toLowerCase().includes(query) ||
          (m.summary_preview || '').toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortColumn === 'title') return (a.title || '').localeCompare(b.title || '') * dir;
      if (sortColumn === 'events') return (a.event_count - b.event_count) * dir;
      if (sortColumn === 'date') {
        return (new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) * dir;
      }
      return 0;
    });

    return result;
  }, [conversations, searchQuery, sortColumn, sortDir]);

  const totalPages = Math.ceil(filteredConversations.length / rowsPerPage);
  const paginatedConversations = filteredConversations.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const stats = useMemo(() => {
    const total = conversations.length;
    const synced = conversations.filter((c: any) => c.calendar_synced).length;
    const withAnalysis = conversations.filter((c: any) => c.has_custom_query).length;
    const totalEvents = conversations.reduce((acc: number, c: any) => acc + (c.event_count || 0), 0);
    return { total, synced, withAnalysis, totalEvents };
  }, [conversations]);

  const historySkeleton = (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="h-8 bg-muted rounded w-56 mb-2 animate-pulse" />
            <div className="h-4 bg-muted rounded w-36 mt-1 animate-pulse" />
          </div>
          <div className="h-10 w-28 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg border border-border p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-20 mb-2" />
              <div className="h-8 bg-muted rounded w-12" />
            </div>
          ))}
        </div>
        <div className="bg-card rounded-lg border border-border p-4 animate-pulse">
          <div className="h-10 bg-muted rounded w-full mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded w-full mb-2" />
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
    <Skeleton name="history-groups" loading={loading || loadingConversations} fallback={historySkeleton}>
      <div className="min-h-screen bg-background">
        <PageEntrance name="history" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                  Conversation History
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  All conversations analyzed from your recordings
                </p>
              </div>
              <button
                onClick={() => exportConversationsToCSV(conversations)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-primary text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Conversations', value: stats.total },
              { label: 'Total Events', value: stats.totalEvents },
              { label: 'Calendar Synced', value: stats.synced },
              { label: 'With Analysis', value: stats.withAnalysis },
            ].map((card) => (
              <div
                key={card.label}
                className="bg-card rounded-lg border border-border p-4 transition-all hover:shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{card.label}</span>
                  <AlignJustify className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="text-3xl font-bold text-foreground">{card.value}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <HistoryTabs activeView={historyView} onViewChange={setHistoryView} />
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            {historyView === 'conversations' && (
              <motion.div key="conversations" {...tabContentVariants}>
                {/* Search & Filters */}
                {conversations.length > 0 && (
                  <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="relative w-full sm:w-auto sm:min-w-[240px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Filter conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-card text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-3 ml-auto">
                      {selectedConversationIds.length > 0 && (
                        <>
                          <span className="text-sm text-muted-foreground tabular-nums">
                            {selectedConversationIds.length} selected
                          </span>
                          <button
                            onClick={handleBulkDelete}
                            disabled={isDeleting}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-destructive-foreground bg-destructive hover:bg-destructive/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {conversations.length === 0 ? (
                  <div className="bg-card rounded-lg border border-border shadow-sm">
                    <EmptyState
                      icon={FileText}
                      title="No conversations yet"
                      description="Record your first conversation to get started"
                      action={{
                        label: 'Go to Listen',
                        onClick: () => router.push('/listen'),
                      }}
                    />
                  </div>
                ) : (
                  <ConversationTable
                    paginatedConversations={paginatedConversations}
                    filteredCount={filteredConversations.length}
                    selectedIds={selectedConversationIds}
                    sortColumn={sortColumn}
                    sortDir={sortDir}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    rowsPerPage={rowsPerPage}
                    onSort={handleSort}
                    onToggleSelect={handleToggleSelectConversation}
                    onSelectAllOnPage={handleSelectAllOnPage}
                    onView={handleViewConversation}
                    onDelete={handleDelete}
                    onSetCurrentPage={setCurrentPage}
                    onSetRowsPerPage={(rows) => { setRowsPerPage(rows); setCurrentPage(1); }}
                    hasFilters={searchQuery.trim() !== ''}
                  />
                )}
              </motion.div>
            )}

            {historyView === 'days' && (
              <motion.div key="days" {...tabContentVariants}>
                <DayHistoryView meetings={conversations} />
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

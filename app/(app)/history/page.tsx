'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Navigation from '@/components/Navigation';
import Pagination from '@/components/Pagination';
import EmptyState from '@/components/EmptyState';
import { SkeletonList } from '@/components/SkeletonCard';
import HistoryTabs from '@/components/HistoryTabs';
import DayHistoryView from '@/components/DayHistoryView'; // Re-export check
import { DateGroupedList } from '@/components/DateGroupedList';
import { meetingsAPI } from '@/lib/api';
import { formatDate, truncate } from '@/lib/utils';
import { exportMeetingsToCSV } from '@/lib/export';
import PrimaryButton from '@/components/PrimaryButton';
import { Calendar, FileText, Trash2, Check, Download, X, CheckCircle, XCircle } from 'lucide-react';

export default function HistoryPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'events'>('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedMeetingIds, setSelectedMeetingIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [historyView, setHistoryView] = useState<'meetings' | 'days'>('meetings');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    } else if (user) {
      loadMeetings();
    }
  }, [user, loading, router]);

  const loadMeetings = async () => {
    try {
      const data = await meetingsAPI.getMeetings();
      setMeetings(data.meetings);
    } catch (error) {
    } finally {
      setLoadingMeetings(false);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this meeting?')) return;

    try {
      await meetingsAPI.deleteMeeting(jobId);
      setMeetings(meetings.filter((m) => m.job_id !== jobId));
    } catch (error) {
      alert('Failed to delete meeting');
    }
  };

  const handleToggleSelectMeeting = (meetingId: number) => {
    setSelectedMeetingIds(prev =>
      prev.includes(meetingId)
        ? prev.filter(id => id !== meetingId)
        : [...prev, meetingId]
    );
  };

  const handleSelectAll = () => {
    const allMeetingIds = paginatedMeetings.map(m => m.id);
    setSelectedMeetingIds(allMeetingIds);
  };

  const handleDeselectAll = () => {
    setSelectedMeetingIds([]);
  };

  const handleBulkDelete = async () => {
    if (selectedMeetingIds.length === 0) {
      alert('No meetings selected');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedMeetingIds.length} selected meeting(s)?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await meetingsAPI.bulkDeleteMeetings(selectedMeetingIds);
      setMeetings(meetings.filter(m => !selectedMeetingIds.includes(m.id)));
      setSelectedMeetingIds([]);
      alert(`Deleted ${result.deleted_count} meeting(s)`);
    } catch (error) {
      alert('Failed to delete selected meetings');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAll = async () => {
    if (meetings.length === 0) {
      alert('No meetings to delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete ALL ${meetings.length} meeting(s)? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await meetingsAPI.deleteAllMeetings();
      setMeetings([]);
      setSelectedMeetingIds([]);
      alert(`Deleted all ${result.deleted_count} meeting(s)`);
    } catch (error) {
      alert('Failed to delete all meetings');
    } finally {
      setIsDeleting(false);
    }
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  if (loading || loadingMeetings) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header skeleton: title left, tabs right */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="h-8 bg-muted rounded w-56 mb-2 animate-pulse" />
              <div className="h-4 bg-muted rounded w-36 animate-pulse" />
            </div>
            <div className="h-10 w-52 bg-muted rounded-full animate-pulse" />
          </div>

          {/* Action bar skeleton */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-9 w-28 bg-muted rounded-lg animate-pulse" />
            <div className="h-9 w-24 bg-muted rounded-lg animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="h-4 w-14 bg-muted rounded animate-pulse" />
              <div className="h-9 w-24 bg-muted rounded-lg animate-pulse" />
            </div>
          </div>

          {/* Select all skeleton */}
          <div className="h-8 w-44 bg-muted rounded-lg animate-pulse mb-4" />

          {/* Date group skeleton */}
          <div className="space-y-6">
            {[...Array(2)].map((_, gi) => (
              <div key={gi}>
                {/* Date header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-muted rounded-full animate-pulse" />
                  <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                </div>

                {/* Meeting cards in group */}
                <div className="space-y-4 ml-5">
                  {[...Array(gi === 0 ? 1 : 2)].map((_, ci) => (
                    <div key={ci} className="bg-card rounded-lg border border-border shadow-sm p-6 animate-pulse">
                      <div className="flex gap-4">
                        <div className="w-5 h-5 bg-muted rounded mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="h-5 bg-muted rounded w-48" />
                            <div className="h-4 bg-muted rounded w-40" />
                          </div>
                          <div className="h-4 bg-muted rounded w-full mb-1" />
                          <div className="h-4 bg-muted rounded w-4/5 mb-4" />
                          <div className="flex items-center gap-4">
                            <div className="h-4 bg-muted rounded w-20" />
                            <div className="h-5 bg-muted rounded w-28" />
                          </div>
                        </div>
                        <div className="w-5 h-5 bg-muted rounded flex-shrink-0" />
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
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Meeting History</h1>
            <p className="text-muted-foreground mt-2">
              {meetings.length} meeting{meetings.length !== 1 ? 's' : ''} analyzed
            </p>
          </div>

          <HistoryTabs activeView={historyView} onViewChange={setHistoryView} />
        </div>

        {historyView === 'meetings' && (
          <>
            <div className="flex items-center gap-3 flex-wrap mb-6">
              {selectedMeetingIds.length > 0 ? (
                <>
                  <PrimaryButton
                    onClick={handleBulkDelete}
                    disabled={isDeleting}
                    loading={isDeleting}
                    variant="danger"
                    icon={Trash2}
                    title={`Delete ${selectedMeetingIds.length} selected`}
                  >
                    <span className="hidden sm:inline">Delete Selected ({selectedMeetingIds.length})</span>
                    <span className="sm:hidden">{selectedMeetingIds.length}</span>
                  </PrimaryButton>
                  <PrimaryButton
                    onClick={handleDeselectAll}
                    disabled={isDeleting}
                    variant="outline"
                    icon={X}
                    title="Deselect all"
                  >
                    <span className="hidden sm:inline">Clear</span>
                  </PrimaryButton>
                </>
              ) : meetings.length > 0 && (
                <PrimaryButton
                  onClick={handleDeleteAll}
                  disabled={isDeleting}
                  loading={isDeleting}
                  variant="danger"
                  icon={Trash2}
                  title="Delete all meetings"
                >
                  <span className="hidden sm:inline">Delete All</span>
                </PrimaryButton>
              )}
              <PrimaryButton
                onClick={() => exportMeetingsToCSV(meetings)}
                disabled={meetings.length === 0}
                icon={Download}
                title="Export to CSV"
              >
                Export
              </PrimaryButton>

              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-primary focus:border-primary"
                >
                  <option value="date">Date</option>
                  <option value="events">Events Count</option>
                </select>
              </div>
            </div>

            {loadingMeetings ? (
              <SkeletonList count={5} />
            ) : meetings.length === 0 ? (
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
                <div className="flex items-center gap-2 mb-4">
                  <PrimaryButton
                    onClick={selectedMeetingIds.length === paginatedMeetings.length ? handleDeselectAll : handleSelectAll}
                    variant="outline"
                    icon={selectedMeetingIds.length === paginatedMeetings.length ? XCircle : CheckCircle}
                    size="sm"
                  >
                    {selectedMeetingIds.length === paginatedMeetings.length ? 'Deselect All on Page' : 'Select All on Page'}
                  </PrimaryButton>
                  {selectedMeetingIds.length > 0 && (
                    <span className="text-sm text-muted-foreground">
                      {selectedMeetingIds.length} selected
                    </span>
                  )}
                </div>

                <div className="grid gap-4">
                  <DateGroupedList
                    items={paginatedMeetings}
                    dateKey="created_at"
                    renderItem={(meeting: any) => (
                      <div
                        key={meeting.job_id}
                        className="bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow p-6 mb-4"
                      >
                        <div className="flex gap-4">
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={selectedMeetingIds.includes(meeting.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleToggleSelectMeeting(meeting.id);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-primary cursor-pointer flex-shrink-0"
                          />

                          {/* Meeting Content */}
                          <div className="flex-1 cursor-pointer" onClick={() => router.push(`/meeting?id=${meeting.job_id}`)}>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-semibold text-foreground">
                                    {meeting.title || "Meeting Analysis"}
                                  </h3>
                                  <span className="text-sm text-muted-foreground">
                                    {formatDate(meeting.created_at)}
                                  </span>
                                </div>

                                <p className="text-muted-foreground text-sm mb-4">
                                  {truncate(meeting.summary_preview, 200)}
                                </p>

                                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{meeting.event_count} events</span>
                                  </div>
                                  {meeting.has_custom_query && (
                                    <span className="px-2 py-1 bg-accent text-accent-foreground rounded text-xs">
                                      Additional Analysis
                                    </span>
                                  )}
                                  {meeting.calendar_synced && (
                                    <span className="px-2 py-1 bg-primary/10 text-text-primary rounded text-xs flex items-center gap-1">
                                      <Check className="w-3 h-3" />
                                      Synced to Calendar
                                    </span>
                                  )}
                                </div>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(meeting.job_id);
                                }}
                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  />
                </div>

                {meetings.length > 10 && (
                  <div className="mt-6 bg-card rounded-lg border border-border shadow-sm">
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
          </>
        )}

        {/* Day History View */}
        {historyView === 'days' && (
          <DayHistoryView meetings={meetings} />
        )}

      </div>
    </div>
  );
}

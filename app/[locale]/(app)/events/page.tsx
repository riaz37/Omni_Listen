'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useEventsData, getEventTypeColor } from '@/hooks/useEventsData';
import { exportEventsToCSV, exportToICS } from '@/lib/export';
import { format, isPast } from 'date-fns';
import EmptyState from '@/components/EmptyState';
import EditEventModal from '@/components/EditEventModal';
import RescheduleEventModal from '@/components/RescheduleEventModal';
import PageEntrance from '@/components/ui/page-entrance';
import { Button } from '@/components/ui/button';
import CustomDropdown from '@/components/ui/custom-dropdown';
import { EventsSkeleton } from './EventsSkeleton';
import { Skeleton } from 'boneyard-js/react';
import { EventDetailModal } from './EventDetailModal';
import { EventTable } from './EventTable';
import {
  List,
  Download,
  Search,
  Trash2,
  AlignJustify,
} from 'lucide-react';

type SortColumn = 'title' | 'status' | 'assignee' | 'date';

export default function EventsPage() {
  const router = useRouter();
  const { user, loading } = useRequireAuth();

  const {
    filteredEvents,
    paginatedEvents,
    isLoading,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    currentPage,
    totalPages,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
    selectedEventIds,
    setSelectedEventIds,
    handleSelectAll,
    handleDeselectAll,
    selectedEvent,
    setSelectedEvent,
    editingEvent,
    setEditingEvent,
    reschedulingEvent,
    setReschedulingEvent,
    showEditModal,
    setShowEditModal,
    events,
    isDeleting,
    handleToggleNotification,
    handleToggleCompletion,
    handleEditEvent,
    handleSaveEvent,
    handleSyncEvent,
    handleDeleteEvent,
    handleBulkDelete,
    handleDeleteAll,
  } = useEventsData(user);

  const [sortColumn, setSortColumn] = useState<SortColumn>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDir('asc');
    }
  };

  const handleToggleSelect = (eventItemId: number) => {
    setSelectedEventIds((prev) =>
      prev.includes(eventItemId)
        ? prev.filter((id) => id !== eventItemId)
        : [...prev, eventItemId]
    );
  };

  const handleSelectAllOnPage = () => {
    const selectableIds = paginatedEvents
      .filter((e) => e.eventItemId)
      .map((e) => e.eventItemId!);
    const allSelected = selectableIds.every((id) =>
      selectedEventIds.includes(id)
    );
    if (allSelected) {
      setSelectedEventIds((prev) =>
        prev.filter((id) => !selectableIds.includes(id))
      );
    } else {
      setSelectedEventIds((prev) => [...new Set([...prev, ...selectableIds])]);
    }
  };

  // Sort the already-filtered events by column
  const sortedPaginatedEvents = useMemo(() => {
    const sorted = [...paginatedEvents];
    sorted.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortColumn === 'title') return a.title.localeCompare(b.title) * dir;
      if (sortColumn === 'status') {
        const aStatus = a.completed ? 2 : isPast(a.start) ? 0 : 1;
        const bStatus = b.completed ? 2 : isPast(b.start) ? 0 : 1;
        return (aStatus - bStatus) * dir;
      }
      if (sortColumn === 'assignee')
        return (a.assignee || '').localeCompare(b.assignee || '') * dir;
      if (sortColumn === 'date')
        return (a.start.getTime() - b.start.getTime()) * dir;
      return 0;
    });
    return sorted;
  }, [paginatedEvents, sortColumn, sortDir]);

  const stats = useMemo(() => {
    const total = events.length;
    const completed = events.filter((e) => e.completed).length;
    const upcoming = events.filter(
      (e) => !e.completed && !isPast(e.start)
    ).length;
    const overdue = events.filter(
      (e) => !e.completed && isPast(e.start)
    ).length;
    return { total, completed, upcoming, overdue };
  }, [events]);

  return (
    <Skeleton
      name="events-list"
      loading={loading}
      fallback={<EventsSkeleton />}
    >
      <div className="min-h-screen bg-background">
        <PageEntrance
          name="events"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Events List
                </h1>
                <p className="text-muted-foreground text-sm">
                  All events extracted from your conversations
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => exportEventsToCSV(filteredEvents)}
                  disabled={filteredEvents.length === 0}
                  variant="secondary"
                  iconLeft={<Download className="w-4 h-4" />}
                  title="Export to CSV"
                >
                  CSV
                </Button>
                <Button
                  onClick={() =>
                    exportToICS(
                      filteredEvents,
                      `events_${new Date().toISOString().split('T')[0]}`
                    )
                  }
                  disabled={filteredEvents.length === 0}
                  iconLeft={<Download className="w-4 h-4" />}
                  title="Export to Calendar (ICS)"
                >
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: 'Total Events',
                value: stats.total,
                onClick: () => setActiveTab('all'),
              },
              {
                label: 'Upcoming',
                value: stats.upcoming,
                onClick: () => setActiveTab('upcoming'),
              },
              {
                label: 'Completed',
                value: stats.completed,
                onClick: () => setActiveTab('all'),
              },
              {
                label: 'Overdue',
                value: stats.overdue,
                onClick: () => setActiveTab('past'),
              },
            ].map((card) => (
              <div
                key={card.label}
                onClick={card.onClick}
                className="bg-card rounded-lg border border-border p-4 cursor-pointer transition-all hover:shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    {card.label}
                  </span>
                  <AlignJustify className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="text-3xl font-bold text-foreground">
                  {card.value}
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border mb-6">
            {(['all', 'today', 'upcoming', 'past'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'all'
                  ? 'All'
                  : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Search & Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative w-full sm:w-auto sm:min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filter events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-card text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground text-sm"
              />
            </div>
            <div className="flex items-center gap-3 ml-auto">
              {selectedEventIds.length > 0 && (
                <>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {selectedEventIds.length} selected
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

          {/* Events Table */}
          {isLoading ? (
            <div className="bg-card rounded-lg border border-border p-4 animate-pulse">
              <div className="h-10 bg-muted rounded w-full mb-4" />
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded w-full mb-2" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="bg-card rounded-lg shadow-sm border border-border">
              <EmptyState
                icon={List}
                title="No events found"
                description="Upload and analyze conversations to see events here"
                action={{
                  label: 'Go to Listen',
                  onClick: () => router.push('/listen'),
                }}
              />
            </div>
          ) : (
            <EventTable
              paginatedEvents={sortedPaginatedEvents}
              filteredCount={filteredEvents.length}
              selectedIds={selectedEventIds}
              sortColumn={sortColumn}
              sortDir={sortDir}
              currentPage={currentPage}
              totalPages={totalPages}
              rowsPerPage={itemsPerPage}
              onSort={handleSort}
              onToggleSelect={handleToggleSelect}
              onSelectAllOnPage={handleSelectAllOnPage}
              onToggleCompletion={handleToggleCompletion}
              onEdit={handleEditEvent}
              onReschedule={setReschedulingEvent}
              onViewDetails={setSelectedEvent}
              onDelete={handleDeleteEvent}
              onSetCurrentPage={(p) => {
                if (typeof p === 'function') {
                  handlePageChange(p(currentPage));
                } else {
                  handlePageChange(p);
                }
              }}
              onSetRowsPerPage={handleItemsPerPageChange}
              hasFilters={searchTerm !== '' || activeTab !== 'all'}
            />
          )}
        </PageEntrance>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <EventDetailModal
            selectedEvent={selectedEvent}
            user={user}
            onClose={() => setSelectedEvent(null)}
            onSyncEvent={handleSyncEvent}
            onDeleteEvent={handleDeleteEvent}
            onNavigateToMeeting={(meetingId) =>
              router.push(`/conversation?id=${meetingId}`)
            }
            getEventTypeColor={getEventTypeColor}
          />
        )}

        {/* Edit Event Modal */}
        {editingEvent && (
          <EditEventModal
            event={{
              id: editingEvent.eventItemId || 0,
              title: editingEvent.title,
              date: format(editingEvent.start, 'yyyy-MM-dd'),
              description: editingEvent.description || '',
              location: editingEvent.location || '',
              assignee: editingEvent.assignee || '',
            }}
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setEditingEvent(null);
            }}
            onSave={handleSaveEvent}
          />
        )}

        {/* Reschedule Event Modal */}
        {reschedulingEvent && (
          <RescheduleEventModal
            event={{
              id: reschedulingEvent.eventItemId || 0,
              title: reschedulingEvent.title,
              date: format(reschedulingEvent.start, 'yyyy-MM-dd'),
              time: reschedulingEvent.start
                ? format(reschedulingEvent.start, 'HH:mm')
                : '',
            }}
            isOpen={!!reschedulingEvent}
            onClose={() => setReschedulingEvent(null)}
            onSave={handleSaveEvent}
          />
        )}
      </div>
    </Skeleton>
  );
}

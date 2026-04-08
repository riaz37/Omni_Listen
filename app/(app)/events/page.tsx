'use client';

import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useEventsData, getTimeStatus, getEventTypeColor } from '@/hooks/useEventsData';
import { exportEventsToCSV, exportToICS } from '@/lib/export';
import { format } from 'date-fns';
import Pagination from '@/components/Pagination';
import EmptyState from '@/components/EmptyState';
import EditEventModal from '@/components/EditEventModal';
import RescheduleEventModal from '@/components/RescheduleEventModal';
import { DateGroupedList } from '@/components/DateGroupedList';
import PageEntrance from '@/components/ui/page-entrance';
import { Button } from '@/components/ui/button';
import CustomDropdown from '@/components/ui/custom-dropdown';
import { EventsSkeleton } from './EventsSkeleton';
import { Skeleton } from 'boneyard-js/react';
import { EventDetailModal } from './EventDetailModal';
import { EventListItem } from './EventListItem';
import {
  List,
  Download,
  Search,
  Trash2,
  CheckCircle,
  X,
} from 'lucide-react';

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
    sortBy,
    setSortBy,
    currentPage,
    totalPages,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
    selectedEventIds,
    openMenuId,
    setOpenMenuId,
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

  return (
    <Skeleton name="events-list" loading={loading} fallback={<EventsSkeleton />}>
      <div className="min-h-screen bg-background">

        <PageEntrance name="events" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Events List</h1>
              <p className="text-muted-foreground text-sm">All events from your conversations, sorted by date</p>
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
                onClick={() => exportToICS(filteredEvents, `events_${new Date().toISOString().split('T')[0]}`)}
                disabled={filteredEvents.length === 0}
                iconLeft={<Download className="w-4 h-4" />}
                title="Export to Calendar (ICS)"
              >
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative w-full sm:w-auto sm:min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-card text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground text-sm"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap ml-auto">
            <button
              onClick={selectedEventIds.length === paginatedEvents.filter(e => e.eventItemId).length ? handleDeselectAll : handleSelectAll}
              className="flex items-center gap-1.5 px-3 py-2 bg-card text-foreground border border-border rounded-lg hover:bg-muted transition-colors text-sm"
            >
              <CheckCircle className="w-4 h-4" />
              Select All
            </button>
            <button
              onClick={handleDeselectAll}
              className="flex items-center gap-1.5 px-3 py-2 bg-card text-foreground border border-border rounded-lg hover:bg-muted transition-colors text-sm"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
            <button
              onClick={selectedEventIds.length > 0 ? handleBulkDelete : handleDeleteAll}
              disabled={isDeleting || events.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 bg-card text-destructive border border-border rounded-lg hover:bg-destructive/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              Sort By
            </div>
            <CustomDropdown
              value={sortBy}
              onChange={(val) => setSortBy(val as 'date' | 'type')}
              options={[
                { value: 'date', label: 'Events' },
                { value: 'type', label: 'Type' },
              ]}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border mb-6">
          {(['all', 'today', 'upcoming', 'past'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
            >
              {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Events List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-card rounded-lg border border-border shadow-sm p-6 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-5 h-5 bg-muted rounded mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-5 bg-muted rounded w-1/3" />
                      <div className="h-4 bg-muted rounded w-24" />
                    </div>
                    <div className="h-4 bg-muted rounded w-full mb-2" />
                    <div className="h-4 bg-muted rounded w-2/3 mb-4" />
                    <div className="flex items-center gap-4">
                      <div className="h-4 bg-muted rounded w-20" />
                      <div className="h-4 bg-muted rounded w-28" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-card rounded-lg shadow-sm border border-border">
            <EmptyState
              icon={List}
              title="No events found"
              description={
                searchTerm || activeTab !== 'upcoming'
                  ? 'Try adjusting your search or switching tabs'
                  : 'Upload and analyze conversations to see events here'
              }
              action={
                !(searchTerm || activeTab !== 'upcoming')
                  ? {
                    label: 'Go to Listen',
                    onClick: () => router.push('/listen'),
                  }
                  : undefined
              }
            />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <DateGroupedList
                items={paginatedEvents}
                dateKey="start"
                sortDirection="asc"
                renderItem={(event) => (
                  <EventListItem
                    key={event.id}
                    event={event}
                    openMenuId={openMenuId}
                    timeStatus={getTimeStatus(event.start)}
                    onToggleCompletion={handleToggleCompletion}
                    onToggleNotification={handleToggleNotification}
                    onEdit={handleEditEvent}
                    onReschedule={setReschedulingEvent}
                    onViewDetails={setSelectedEvent}
                    onDelete={handleDeleteEvent}
                    onSetOpenMenuId={setOpenMenuId}
                  />
                )}
              />
            </div>

            {filteredEvents.length > 10 && (
              <div className="mt-6 bg-card rounded-lg shadow-sm border border-border">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredEvents.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </div>
            )}
          </>
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
          onNavigateToMeeting={(meetingId) => router.push(`/conversation?id=${meetingId}`)}
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
            time: reschedulingEvent.start ? format(reschedulingEvent.start, 'HH:mm') : '',
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

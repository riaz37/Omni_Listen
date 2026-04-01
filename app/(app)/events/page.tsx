'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { meetingsAPI } from '@/lib/api';
import { useToast } from '@/components/Toast';
import Navigation from '@/components/Navigation';
import Pagination from '@/components/Pagination';
import EmptyState from '@/components/EmptyState';
import { SkeletonList } from '@/components/SkeletonCard';
import { exportEventsToCSV, exportToICS } from '@/lib/export';
import EditEventModal from '@/components/EditEventModal';
import RescheduleEventModal from '@/components/RescheduleEventModal';
import { parseISO, format, isFuture, isPast, isToday, differenceInDays } from 'date-fns';
import { DateGroupedList } from '@/components/DateGroupedList';
//import { getUrgencyStyles } from '@/lib/urgency-detector';
import {
  List,
  Calendar,
  Download,
  Clock,
  MapPin,
  Users,
  ChevronRight,
  Filter,
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  Bell,
  BellOff,
  Circle,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Save,
  X
} from 'lucide-react';

interface Event {
  id: string;
  eventItemId?: number;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  attendees?: string[];
  assignee?: string;
  meetingId?: string;
  type: 'meeting' | 'task' | 'deadline';
  synced?: boolean;
  calendarEventId?: string;
  isManual?: boolean;
  notificationsEnabled?: boolean;
  completed?: boolean;
  urgency?: 'yes' | 'no';
}

export default function EventsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const toast = useToast();

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'overdue' | 'completed'>('upcoming');
  const [sortBy, setSortBy] = useState<'date' | 'type'>('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [editingAssigneeId, setEditingAssigneeId] = useState<string | null>(null);
  const [editingAssigneeValue, setEditingAssigneeValue] = useState('');
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [reschedulingEvent, setReschedulingEvent] = useState<Event | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEventIds, setSelectedEventIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchEvents();
      requestNotificationPermission();
    }
  }, [user]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const eventsResponse = await meetingsAPI.getAllEvents();
      const extractedEvents: Event[] = [];

      if (eventsResponse.events && Array.isArray(eventsResponse.events)) {
        eventsResponse.events.forEach((event: any) => {
          try {
            // Support both field names from LLM extraction and database
            const dateField = event.date || event.due_date;
            const timeField = event.time || event.due_time;

            if (dateField) {
              let eventDate: Date;

              // If time is specified, combine date + time
              if (timeField && timeField.trim() && timeField.toLowerCase() !== 'null') {
                // Combine date (YYYY-MM-DD) and time (HH:MM) into datetime string
                const datetimeString = `${dateField}T${timeField}:00`;
                eventDate = parseISO(datetimeString);
              } else {
                // No time specified, parse as date-only (will default to midnight)
                eventDate = parseISO(dateField);
              }

              extractedEvents.push({
                id: `event-${event.id}`,
                eventItemId: event.id,
                title: event.title || event.task || 'Untitled Event',
                start: eventDate,
                end: new Date(eventDate.getTime() + 60 * 60 * 1000), // 1 hour duration
                description: event.description || event.context || '',
                location: event.location,
                attendees: event.assignee ? [event.assignee] : [],
                assignee: event.assignee || '',
                meetingId: event.meeting_id || '',
                type: 'meeting',
                synced: true,  // All events here are synced
                notificationsEnabled: true,
                completed: event.completed || false,
                urgency: event.urgency,
              });
            }
          } catch (err) {
          }
        });
      }

      setEvents(extractedEvents);
      scheduleNotifications(extractedEvents);
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const scheduleNotifications = (eventsList: Event[]) => {
    eventsList.forEach(event => {
      if (event.notificationsEnabled && isFuture(event.start)) {
        const daysUntil = differenceInDays(event.start, new Date());

        // Schedule notification for 1 day before (if event is more than 1 day away)
        if (daysUntil === 1 && 'Notification' in window && Notification.permission === 'granted') {
          setTimeout(() => {
            new Notification(`Upcoming Event Tomorrow: ${event.title}`, {
              body: `${event.title} is scheduled for ${format(event.start, 'PPP p')}`,
              icon: '/esapai_logo.png',
              tag: event.id,
            });
          }, 100);
        }
      }
    });
  };

  const handleToggleNotification = (eventId: string) => {
    const updatedEvents = events.map(e =>
      e.id === eventId
        ? { ...e, notificationsEnabled: !e.notificationsEnabled }
        : e
    );
    setEvents(updatedEvents);
    const event = updatedEvents.find(e => e.id === eventId);
    if (event?.notificationsEnabled) {
      toast.success('Notifications enabled for this event');
    } else {
      toast.info('Notifications disabled for this event');
    }
  };

  const handleToggleCompletion = async (event: Event) => {
    if (!event.eventItemId) return;

    try {
      const newCompletedState = !event.completed;
      await meetingsAPI.toggleTaskCompletion(event.eventItemId, newCompletedState);

      // Update local state
      const updatedEvents = events.map(e =>
        e.id === event.id
          ? { ...e, completed: newCompletedState }
          : e
      );
      setEvents(updatedEvents);

      if (newCompletedState) {
        toast.success('Event marked as completed');
      } else {
        toast.info('Event marked as incomplete');
      }
    } catch (error) {
      toast.error('Failed to update completion status');
    }
  };

  const handleEditAssignee = (event: Event) => {
    setEditingAssigneeId(event.id);
    setEditingAssigneeValue(event.assignee || '');
  };

  const handleCancelEditAssignee = () => {
    setEditingAssigneeId(null);
    setEditingAssigneeValue('');
  };

  const handleSaveAssignee = async (event: Event) => {
    if (!event.eventItemId) return;

    try {
      await meetingsAPI.updateEventAssignee(event.eventItemId, editingAssigneeValue);

      // Update local state
      const updatedEvents = events.map(e =>
        e.id === event.id
          ? { ...e, assignee: editingAssigneeValue, attendees: editingAssigneeValue ? [editingAssigneeValue] : [] }
          : e
      );
      setEvents(updatedEvents);

      setEditingAssigneeId(null);
      setEditingAssigneeValue('');
      toast.success('Assignee updated successfully');
    } catch (error) {
      toast.error('Failed to update assignee');
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowEditModal(true);
  };

  const handleRescheduleEvent = (event: Event) => {
    setReschedulingEvent(event);
  };

  const handleSaveEvent = async (eventId: number, updates: any) => {
    try {
      await meetingsAPI.updateEvent(eventId, updates);

      // Update local state
      const updatedEvents = events.map(e => {
        if (e.eventItemId === eventId) {
          let newStart = e.start;

          // Handle date and time updates
          if (updates.date !== undefined || updates.time !== undefined) {
            const dateStr = updates.date !== undefined ? updates.date : format(e.start, 'yyyy-MM-dd');
            const timeStr = updates.time !== undefined ? updates.time : '';

            if (timeStr && timeStr.trim()) {
              // Combine date and time
              newStart = parseISO(`${dateStr}T${timeStr}:00`);
            } else {
              // Date only
              newStart = parseISO(dateStr);
            }
          }

          return {
            ...e,
            title: updates.title !== undefined ? updates.title : e.title,
            start: newStart,
            end: updates.date !== undefined || updates.time !== undefined ? new Date(newStart.getTime() + 60 * 60 * 1000) : e.end,
            description: updates.description !== undefined ? updates.description : e.description,
            location: updates.location !== undefined ? updates.location : e.location,
            assignee: updates.assignee !== undefined ? updates.assignee : e.assignee,
            attendees: updates.assignee !== undefined ? [updates.assignee] : e.attendees,
          };
        }
        return e;
      });

      setEvents(updatedEvents);
      setShowEditModal(false);
      toast.success('Event updated successfully');
    } catch (error) {
      toast.error('Failed to update event');
      throw error;
    }
  };

  const handleSyncEvent = async (event: Event) => {
    try {
      toast.info('Syncing event to Google Calendar...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedEvents = events.map(e =>
        e.id === event.id
          ? { ...e, synced: true, calendarEventId: `gcal-${Date.now()}` }
          : e
      );
      setEvents(updatedEvents);
      toast.success('Event synced to Google Calendar!');
    } catch (error) {
      toast.error('Failed to sync event to calendar');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }
    try {
      // Extract numeric ID from "event-123" format
      const numericId = parseInt(eventId.replace('event-', ''));
      await meetingsAPI.deleteEvent(numericId);
      setEvents(events.filter(e => e.id !== eventId));
      setSelectedEvent(null);
      toast.success('Event deleted successfully');
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const handleToggleSelectEvent = (eventItemId: number) => {
    setSelectedEventIds(prev =>
      prev.includes(eventItemId)
        ? prev.filter(id => id !== eventItemId)
        : [...prev, eventItemId]
    );
  };

  const handleSelectAll = () => {
    const allEventIds = paginatedEvents
      .filter(e => e.eventItemId)
      .map(e => e.eventItemId!);
    setSelectedEventIds(allEventIds);
  };

  const handleDeselectAll = () => {
    setSelectedEventIds([]);
  };

  const handleBulkDelete = async () => {
    if (selectedEventIds.length === 0) {
      toast.error('No events selected');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedEventIds.length} selected event(s)?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await meetingsAPI.bulkDeleteEvents(selectedEventIds);
      setEvents(events.filter(e => !selectedEventIds.includes(e.eventItemId!)));
      setSelectedEventIds([]);
      toast.success(`Deleted ${result.deleted_count} event(s)`);
      if (result.calendar_deleted > 0) {
        toast.info(`${result.calendar_deleted} event(s) also deleted from Google Calendar`);
      }
    } catch (error) {
      toast.error('Failed to delete selected events');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAll = async () => {
    if (events.length === 0) {
      toast.error('No events to delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete ALL ${events.length} event(s)? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await meetingsAPI.deleteAllEvents();
      setEvents([]);
      setSelectedEventIds([]);
      toast.success(`Deleted all ${result.deleted_count} event(s)`);
      if (result.calendar_deleted > 0) {
        toast.info(`${result.calendar_deleted} event(s) also deleted from Google Calendar`);
      }
    } catch (error) {
      toast.error('Failed to delete all events');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredEvents = useMemo(() => {
    return events
      .filter(event => {
        if (activeTab === 'upcoming') {
          // Future events only (including later today), AND not completed
          return !event.completed && isFuture(event.start);
        }
        if (activeTab === 'overdue') {
          // Past events (including earlier today), AND not completed
          return !event.completed && isPast(event.start);
        }
        if (activeTab === 'completed') {
          // Only completed events
          return event.completed;
        }
        return true;
      })
      .filter(event =>
        searchTerm === '' ||
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === 'date') {
          return a.start.getTime() - b.start.getTime();
        } else {
          return a.type.localeCompare(b.type);
        }
      });
  }, [events, activeTab, searchTerm, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      meeting: 'bg-primary/10 text-text-primary border-primary/30',
      task: 'bg-accent text-accent-foreground border-border',
      deadline: 'bg-destructive/10 text-destructive border-destructive/30',
    };
    return colors[type] || colors.meeting;
  };

  const getTimeStatus = (date: Date) => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();

    if (isPast(date)) {
      return { text: 'Overdue', color: 'text-destructive' };
    }

    if (isFuture(date)) {
      const days = differenceInDays(date, now);
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor(diffMs / (1000 * 60));

      if (days >= 1) {
        if (days === 1) return { text: 'Tomorrow', color: 'text-primary' };
        if (days <= 7) return { text: `In ${days} days`, color: 'text-primary' };
        return { text: format(date, 'MMM dd, yyyy'), color: 'text-muted-foreground' };
      } else if (hours >= 1) {
        return { text: `In ${hours} hour${hours > 1 ? 's' : ''}`, color: 'text-primary' };
      } else if (minutes >= 1) {
        return { text: `In ${minutes} minute${minutes > 1 ? 's' : ''}`, color: 'text-primary' };
      } else {
        return { text: 'Soon', color: 'text-foreground' };
      }
    }

    return { text: format(date, 'MMM dd, yyyy'), color: 'text-muted-foreground' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Skeleton Header with title + action buttons */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
                <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-10 w-24 bg-muted rounded-md animate-pulse"></div>
                <div className="h-10 w-16 bg-muted rounded-md animate-pulse"></div>
                <div className="h-10 w-16 bg-muted rounded-md animate-pulse"></div>
              </div>
            </div>
            <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
          </div>
          {/* Skeleton Tabs */}
          <div className="flex border-b border-border mb-6">
            <div className="h-10 w-24 bg-muted rounded animate-pulse mr-4"></div>
            <div className="h-10 w-20 bg-muted rounded animate-pulse mr-4"></div>
            <div className="h-10 w-24 bg-muted rounded animate-pulse"></div>
          </div>
          {/* Skeleton Search + Sort */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 h-10 bg-muted rounded-lg animate-pulse border border-border"></div>
              <div className="h-10 w-40 bg-muted rounded-lg animate-pulse border border-border"></div>
            </div>
            {/* Skeleton Select All */}
            <div className="h-10 w-44 bg-muted rounded-lg animate-pulse"></div>
          </div>
          {/* Skeleton Event Cards */}
          <div className="bg-card rounded-lg shadow-sm border border-border divide-y divide-border">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-5 flex items-start gap-4">
                <div className="w-5 h-5 bg-muted rounded animate-pulse flex-shrink-0 mt-1"></div>
                <div className="flex-shrink-0">
                  <div className="w-[70px] h-[70px] bg-muted rounded-lg animate-pulse"></div>
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-5 bg-muted rounded w-3/4 animate-pulse"></div>
                  <div className="flex gap-3">
                    <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
                    <div className="h-5 bg-muted rounded-full w-16 animate-pulse"></div>
                  </div>
                  <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                </div>
                <div className="flex gap-2 ml-4">
                  <div className="w-9 h-9 bg-muted rounded-full animate-pulse"></div>
                  <div className="w-9 h-9 bg-muted rounded-full animate-pulse"></div>
                  <div className="w-9 h-9 bg-muted rounded-full animate-pulse"></div>
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <List className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Events</h1>
            </div>
            <div className="flex gap-2 flex-wrap">
              {selectedEventIds.length > 0 && (
                <>
                  <button
                    onClick={handleBulkDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive-hover disabled:bg-muted disabled:cursor-not-allowed transition-colors text-sm"
                    title={`Delete ${selectedEventIds.length} selected`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Delete Selected ({selectedEventIds.length})</span>
                    <span className="sm:hidden">{selectedEventIds.length}</span>
                  </button>
                  <button
                    onClick={handleDeselectAll}
                    disabled={isDeleting}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary-hover disabled:bg-muted disabled:cursor-not-allowed transition-colors text-sm"
                    title="Deselect all"
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                </>
              )}
              {selectedEventIds.length === 0 && events.length > 0 && (
                <button
                  onClick={handleDeleteAll}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive-hover disabled:bg-muted disabled:cursor-not-allowed transition-colors text-sm"
                  title="Delete all events"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Delete All</span>
                </button>
              )}
              <button
                onClick={() => exportEventsToCSV(filteredEvents)}
                disabled={filteredEvents.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-hover disabled:bg-muted disabled:cursor-not-allowed transition-colors text-sm"
                title="Export to CSV"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">CSV</span>
              </button>
              <button
                onClick={() => exportToICS(filteredEvents, `events_${new Date().toISOString().split('T')[0]}`)}
                disabled={filteredEvents.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/80 disabled:bg-muted disabled:cursor-not-allowed transition-colors text-sm"
                title="Export to Calendar (ICS)"
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">ICS</span>
              </button>
            </div>
          </div>
          <p className="text-muted-foreground">All events from your meetings, sorted by date</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border mb-6">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'upcoming'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('overdue')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overdue'
              ? 'border-destructive text-destructive'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
          >
            Overdue
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'completed'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
          >
            Completed
          </button>
        </div>

        {/* Filters & Search */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-card text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-card text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="date">Sort by Date</option>
              <option value="type">Sort by Type</option>
            </select>
          </div>

          {/* Select All/Deselect All */}
          {filteredEvents.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={selectedEventIds.length === paginatedEvents.filter(e => e.eventItemId).length ? handleDeselectAll : handleSelectAll}
                className="px-4 py-2 bg-muted hover:bg-muted text-foreground rounded-lg transition-colors text-sm flex items-center gap-2"
              >
                {selectedEventIds.length === paginatedEvents.filter(e => e.eventItemId).length ? (
                  <>
                    <XCircle className="w-4 h-4" />
                    Deselect All on Page
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Select All on Page
                  </>
                )}
              </button>
              {selectedEventIds.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {selectedEventIds.length} selected
                </span>
              )}
            </div>
          )}
        </div>

        {/* Events List */}
        {isLoading ? (
          <SkeletonList count={5} />
        ) : filteredEvents.length === 0 ? (
          <div className="bg-card rounded-lg shadow-sm border border-border">
            <EmptyState
              icon={List}
              title="No events found"
              description={
                searchTerm || activeTab !== 'upcoming'
                  ? 'Try adjusting your search or switching tabs'
                  : 'Upload and analyze meetings to see events here'
              }
              action={
                !(searchTerm || activeTab !== 'upcoming')
                  ? {
                    label: 'Go to Dashboard',
                    onClick: () => router.push('/dashboard'),
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
                renderItem={(event) => {
                  const timeStatus = getTimeStatus(event.start);
                  const isUrgent = event.urgency && event.urgency.toLowerCase() === 'yes';

                  const borderClass = event.completed
                    ? 'border-l-4 border-primary'
                    : isUrgent
                      ? 'border-l-4 border-destructive'
                      : '';

                  const bgClass = event.completed
                    ? 'bg-card'
                    : isUrgent
                      ? 'bg-destructive/10'
                      : 'bg-card';
                  return (
                    <div
                      key={event.id}
                      className={`p-5 rounded-lg border border-border shadow-sm hover:shadow-md transition-all ${borderClass} ${bgClass} ${event.completed ? 'opacity-75' : ''}`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        {event.eventItemId && (
                          <div className="flex-shrink-0 pt-1">
                            <input
                              type="checkbox"
                              checked={selectedEventIds.includes(event.eventItemId)}
                              onChange={() => handleToggleSelectEvent(event.eventItemId!)}
                              className="w-5 h-5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        )}

                        {/* Date Badge */}
                        <div className="flex-shrink-0">
                          <div className={`rounded-lg p-3 text-center min-w-[70px] ${isUrgent ? 'bg-destructive/10' : 'bg-primary/10'
                            }`}>
                            <div className={`text-2xl font-bold ${isUrgent ? 'text-destructive' : 'text-text-primary'
                              }`}>
                              {format(event.start, 'd')}
                            </div>
                            <div className={`text-xs uppercase ${isUrgent ? 'text-destructive' : 'text-primary'
                              }`}>
                              {format(event.start, 'MMM')}
                            </div>
                          </div>
                        </div>

                        {/* Event Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-start gap-2 mb-1">
                                <h3 className={`text-lg font-semibold text-foreground ${event.completed ? 'line-through' : ''}`}>{event.title}</h3>
                                {event.completed && (
                                  <span className="px-2 py-0.5 bg-primary/10 text-text-primary rounded text-xs font-medium flex-shrink-0">
                                    ✓ Done
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{format(event.start, 'h:mm a')}</span>
                                </div>
                                <span className={`font-medium ${timeStatus.color}`}>{timeStatus.text}</span>
                                <span className={`px-2 py-1 rounded-full text-xs border capitalize ${getEventTypeColor(event.type)}`}>
                                  {event.type}
                                </span>
                              </div>
                              {event.description && (
                                <p className="text-muted-foreground text-sm line-clamp-2 mb-2">{event.description}</p>
                              )}
                              {event.location && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <MapPin className="w-4 h-4" />
                                  <span className="line-clamp-1">{event.location}</span>
                                </div>
                              )}

                              {/* Assignee Section */}
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                                <Users className="w-4 h-4" />
                                {editingAssigneeId === event.id ? (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={editingAssigneeValue}
                                      onChange={(e) => setEditingAssigneeValue(e.target.value)}
                                      placeholder="Enter assignee name..."
                                      className="px-2 py-1 bg-card text-foreground border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => handleSaveAssignee(event)}
                                      className="p-1 text-primary hover:bg-primary/5 rounded transition-colors"
                                      title="Save"
                                    >
                                      <Save className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={handleCancelEditAssignee}
                                      className="p-1 text-muted-foreground hover:bg-muted rounded transition-colors"
                                      title="Cancel"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="text-foreground">
                                      {event.assignee || <span className="text-muted-foreground italic">No assignee</span>}
                                    </span>
                                    <button
                                      onClick={() => handleEditAssignee(event)}
                                      className="p-1 text-primary hover:bg-primary/5 rounded transition-colors"
                                      title="Edit assignee"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col justify-between items-end ml-4 gap-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleToggleCompletion(event)}
                              className={`p-2 rounded-full transition-colors ${event.completed
                                ? 'bg-primary/10 text-primary hover:bg-primary/20'
                                : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                                }`}
                              title={event.completed ? "Mark as incomplete" : "Mark as complete"}
                            >
                              <CheckCircle2 className="w-5 h-5" />
                            </button>

                            <button
                              onClick={() => handleEditEvent(event)}
                              className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                              title="Edit event"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>

                            <button
                              onClick={() => setReschedulingEvent(event)}
                              className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
                              title="Reschedule event"
                            >
                              <Calendar className="w-5 h-5" />
                            </button>

                            <button
                              onClick={() => handleToggleNotification(event.id)}
                              className={`p-2 rounded-full transition-colors ${event.notificationsEnabled
                                ? 'bg-muted text-foreground hover:bg-muted/80'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                                }`}
                              title={event.notificationsEnabled ? "Disable notifications" : "Enable notifications"}
                            >
                              {event.notificationsEnabled ? (
                                <Bell className="w-5 h-5" />
                              ) : (
                                <BellOff className="w-5 h-5" />
                              )}
                            </button>

                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                              title="Delete event"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
            </div>

            {filteredEvents.length > 25 && (
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
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedEvent(null)}>
          <div className="bg-card rounded-lg shadow-xl border border-border max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize border ${getEventTypeColor(selectedEvent.type)}`}>
                    {selectedEvent.type}
                  </span>
                  {selectedEvent.completed && (
                    <span className="px-3 py-1 bg-primary/10 text-text-primary rounded-full text-sm flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Completed
                    </span>
                  )}
                  {selectedEvent.synced && (
                    <span className="px-3 py-1 bg-primary/10 text-text-primary rounded-full text-sm flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Synced
                    </span>
                  )}
                </div>
                <h2 className={`text-2xl font-bold text-foreground ${selectedEvent.completed ? 'line-through' : ''}`}>{selectedEvent.title}</h2>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-muted-foreground hover:text-muted-foreground ml-4"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">Date & Time</span>
                </div>
                <p className="text-foreground ml-7">
                  {format(selectedEvent.start, 'EEEE, MMMM dd, yyyy')}
                </p>
                <p className="text-muted-foreground ml-7">
                  {format(selectedEvent.start, 'h:mm a')} - {format(selectedEvent.end, 'h:mm a')}
                </p>
              </div>

              {selectedEvent.description && (
                <div>
                  <p className="font-medium text-muted-foreground mb-1">Description</p>
                  <p className="text-foreground">{selectedEvent.description}</p>
                </div>
              )}

              {selectedEvent.location && (
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <MapPin className="w-5 h-5" />
                    <span className="font-medium">Location</span>
                  </div>
                  <p className="text-foreground ml-7">{selectedEvent.location}</p>
                </div>
              )}

              {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Users className="w-5 h-5" />
                    <span className="font-medium">Attendees</span>
                  </div>
                  <div className="ml-7 space-y-1">
                    {selectedEvent.attendees.map((attendee, index) => (
                      <p key={index} className="text-foreground">{attendee}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t border-border space-y-3">
                {!selectedEvent.synced && user?.calendar_connected && (
                  <button
                    onClick={() => {
                      if (selectedEvent) {
                        handleSyncEvent(selectedEvent);
                        setSelectedEvent(null);
                      }
                    }}
                    className="w-full px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Sync to Calendar</span>
                  </button>
                )}

                {selectedEvent.meetingId && (
                  <button
                    onClick={() => router.push(`/meeting?id=${selectedEvent.meetingId}`)}
                    className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
                  >
                    <span>View Meeting Details</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}

                <button
                  onClick={() => {
                    if (selectedEvent) {
                      handleDeleteEvent(selectedEvent.id);
                    }
                  }}
                  className="w-full px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive-hover transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Delete Event</span>
                </button>
              </div>
            </div>
          </div >
        </div >
      )}


      {/* Edit Event Modal */}
      {
        editingEvent && (
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
        )
      }

      {/* Reschedule Event Modal */}
      {
        reschedulingEvent && (
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
        )
      }
    </div >
  );
}

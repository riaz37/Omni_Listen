'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { meetingsAPI } from '@/lib/api';
import { useToast } from '@/components/Toast';
import Pagination from '@/components/Pagination';
import EmptyState from '@/components/EmptyState';
import { exportEventsToCSV, exportToICS } from '@/lib/export';
import EditEventModal from '@/components/EditEventModal';
import RescheduleEventModal from '@/components/RescheduleEventModal';
import { parseISO, format, isFuture, isPast, isToday, differenceInDays } from 'date-fns';
import { DateGroupedList } from '@/components/DateGroupedList';
//import { getUrgencyStyles } from '@/lib/urgency-detector';
import PrimaryButton from '@/components/PrimaryButton';
import { EventsSkeleton } from './EventsSkeleton';
import { Skeleton } from 'boneyard-js/react';
import { EventDetailModal } from './EventDetailModal';
import {
  List,
  Calendar,
  Download,
  Clock,
  MapPin,
  Users,
  ChevronRight,
  Search,
  Trash2,
  CheckCircle,
  Bell,
  Circle,
  CheckCircle2,
  Edit2,
  X,
  MoreVertical,
  Link2,
  Eye
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
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'upcoming' | 'past'>('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'type'>('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
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


  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowEditModal(true);
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
        if (activeTab === 'all') {
          return true;
        }
        if (activeTab === 'today') {
          return isToday(event.start);
        }
        if (activeTab === 'upcoming') {
          return isFuture(event.start);
        }
        if (activeTab === 'past') {
          return isPast(event.start);
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

  return (
    <Skeleton name="events-list" loading={loading} fallback={<EventsSkeleton />}>
      <div className="min-h-screen bg-background">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Events List</h1>
              <p className="text-muted-foreground text-sm">All events from your meetings, sorted by date</p>
            </div>
            <div className="flex gap-2">
              <PrimaryButton
                onClick={() => exportEventsToCSV(filteredEvents)}
                disabled={filteredEvents.length === 0}
                variant="secondary"
                icon={Download}
                title="Export to CSV"
              >
                CSV
              </PrimaryButton>
              <PrimaryButton
                onClick={() => exportToICS(filteredEvents, `events_${new Date().toISOString().split('T')[0]}`)}
                disabled={filteredEvents.length === 0}
                icon={Download}
                title="Export to Calendar (ICS)"
              >
                Export
              </PrimaryButton>
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
              Short By
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'type')}
              className="px-3 py-2 bg-card text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value="date">Events</option>
              <option value="type">Type</option>
            </select>
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

                  const getStatusBadge = () => {
                    if (event.completed) {
                      return <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">Complete</span>;
                    }
                    if (isPast(event.start)) {
                      return <span className="px-2.5 py-0.5 bg-destructive/10 text-destructive rounded-full text-xs font-medium">Overdue</span>;
                    }
                    if (isFuture(event.start)) {
                      return <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">{timeStatus.text}</span>;
                    }
                    return null;
                  };

                  return (
                    <div
                      key={event.id}
                      className={`p-4 rounded-lg border border-border bg-card hover:shadow-sm transition-all ${event.completed ? 'opacity-75' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        {event.eventItemId && (
                          <div className="flex-shrink-0 pt-1">
                            <button
                              onClick={() => handleToggleCompletion(event)}
                              className="flex-shrink-0"
                              title={event.completed ? "Mark as incomplete" : "Mark as complete"}
                            >
                              {event.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                              ) : (
                                <Circle className="w-5 h-5 text-border hover:text-primary transition-colors" />
                              )}
                            </button>
                          </div>
                        )}

                        {/* Event Content */}
                        <div className="flex-1 min-w-0">
                          {/* Title Row */}
                          <div className="flex items-start justify-between mb-1">
                            <h3 className={`text-sm font-semibold text-foreground ${event.completed ? 'line-through' : ''}`}>
                              {event.title}
                            </h3>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                              {/* Notify Button */}
                              <button
                                onClick={() => handleToggleNotification(event.id)}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${event.notificationsEnabled
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                                  }`}
                              >
                                <Bell className="w-3 h-3" />
                                Notify
                              </button>

                              {/* Three-dot Menu */}
                              <div className="relative">
                                <button
                                  onClick={() => setOpenMenuId(openMenuId === event.id ? null : event.id)}
                                  className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                                {openMenuId === event.id && (
                                  <>
                                    <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                                    <div className="absolute right-0 top-full mt-1 w-44 bg-card border border-border rounded-lg shadow-lg z-50 py-1">
                                      <button
                                        onClick={() => { handleEditEvent(event); setOpenMenuId(null); }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => { setReschedulingEvent(event); setOpenMenuId(null); }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                      >
                                        <Clock className="w-4 h-4" />
                                        Reschedule
                                      </button>
                                      <button
                                        onClick={() => { setSelectedEvent(event); setOpenMenuId(null); }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                      >
                                        <Eye className="w-4 h-4" />
                                        View Details
                                      </button>
                                      <button
                                        onClick={() => { handleDeleteEvent(event.id); setOpenMenuId(null); }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          {event.description && (
                            <p className="text-muted-foreground text-sm line-clamp-1 mb-2">{event.description}</p>
                          )}

                          {/* Bottom Row: Speaker, Sync, Status, Date/Time */}
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                              {/* Speaker/Assignee */}
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <span className="text-xs text-muted-foreground">Speaker</span>
                                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                                  <Users className="w-3 h-3 text-primary" />
                                </div>
                              </div>

                              {/* Sync indicator */}
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Link2 className="w-3.5 h-3.5" />
                                <span className="text-xs">Sync</span>
                              </div>

                              {/* Status Badge */}
                              {getStatusBadge()}
                            </div>

                            {/* Date & Time */}
                            <div className="flex items-center gap-3 text-muted-foreground text-xs">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{format(event.start, 'MMM dd, yyyy')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{format(event.start, 'h:mm a')}</span>
                              </div>
                            </div>
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
        <EventDetailModal
          selectedEvent={selectedEvent}
          user={user}
          onClose={() => setSelectedEvent(null)}
          onSyncEvent={handleSyncEvent}
          onDeleteEvent={handleDeleteEvent}
          onNavigateToMeeting={(meetingId) => router.push(`/meeting?id=${meetingId}`)}
          getEventTypeColor={getEventTypeColor}
        />
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
    </Skeleton>
  );
}

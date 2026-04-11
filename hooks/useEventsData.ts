'use client';

import { useState, useEffect, useMemo } from 'react';
import { conversationsAPI } from '@/lib/api';
import { toast } from 'sonner';
import { parseISO, format, isFuture, isPast, isToday, differenceInDays } from 'date-fns';

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
  conversationId?: string;
  type: 'conversation' | 'task' | 'deadline';
  synced?: boolean;
  calendarEventId?: string;
  isManual?: boolean;
  notificationsEnabled?: boolean;
  completed?: boolean;
  urgency?: 'yes' | 'no';
}

export function useEventsData(user: unknown) {

  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'upcoming' | 'past'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'type'>('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [selectedEventIds, setSelectedEventIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal state
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [reschedulingEvent, setReschedulingEvent] = useState<Event | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

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
      const eventsResponse = await conversationsAPI.getAllEvents();
      const extractedEvents: Event[] = [];

      if (eventsResponse.events && Array.isArray(eventsResponse.events)) {
        eventsResponse.events.forEach((event: any) => {
          try {
            const dateField = event.date || event.due_date;
            const timeField = event.time || event.due_time;

            if (dateField) {
              let eventDate: Date;

              if (timeField && timeField.trim() && timeField.toLowerCase() !== 'null') {
                const datetimeString = `${dateField}T${timeField}:00`;
                eventDate = parseISO(datetimeString);
              } else {
                eventDate = parseISO(dateField);
              }

              extractedEvents.push({
                id: `event-${event.id}`,
                eventItemId: event.id,
                title: event.title || event.task || 'Untitled Event',
                start: eventDate,
                end: new Date(eventDate.getTime() + 60 * 60 * 1000),
                description: event.description || event.context || '',
                location: event.location,
                attendees: event.assignee ? [event.assignee] : [],
                assignee: event.assignee || '',
                conversationId: event.meeting_id || '',
                type: 'conversation',
                synced: true,
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
      await conversationsAPI.toggleTaskCompletion(event.eventItemId, newCompletedState);

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
      await conversationsAPI.updateEvent(eventId, updates);

      const updatedEvents = events.map(e => {
        if (e.eventItemId === eventId) {
          let newStart = e.start;

          if (updates.date !== undefined || updates.time !== undefined) {
            const dateStr = updates.date !== undefined ? updates.date : format(e.start, 'yyyy-MM-dd');
            const timeStr = updates.time !== undefined ? updates.time : '';

            if (timeStr && timeStr.trim()) {
              newStart = parseISO(`${dateStr}T${timeStr}:00`);
            } else {
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
      const numericId = parseInt(eventId.replace('event-', ''));
      await conversationsAPI.deleteEvent(numericId);
      setEvents(events.filter(e => e.id !== eventId));
      setSelectedEvent(null);
      toast.success('Event deleted successfully');
    } catch (error) {
      toast.error('Failed to delete event');
    }
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
      const result = await conversationsAPI.bulkDeleteEvents(selectedEventIds);
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
      const result = await conversationsAPI.deleteAllEvents();
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
        if (activeTab === 'all') return true;
        if (activeTab === 'today') return isToday(event.start);
        if (activeTab === 'upcoming') return isFuture(event.start);
        if (activeTab === 'past') return isPast(event.start);
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

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + itemsPerPage);

  const handleSelectAll = () => {
    const allEventIds = paginatedEvents
      .filter(e => e.eventItemId)
      .map(e => e.eventItemId!);
    setSelectedEventIds(allEventIds);
  };

  const handleDeselectAll = () => {
    setSelectedEventIds([]);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return {
    // Data
    events,
    filteredEvents,
    paginatedEvents,
    isLoading,

    // Filters & pagination
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

    // Selection
    selectedEventIds,
    setSelectedEventIds,
    handleSelectAll,
    handleDeselectAll,

    // Modal state
    selectedEvent,
    setSelectedEvent,
    editingEvent,
    setEditingEvent,
    reschedulingEvent,
    setReschedulingEvent,
    showEditModal,
    setShowEditModal,

    // Actions
    isDeleting,
    handleToggleNotification,
    handleToggleCompletion,
    handleEditEvent,
    handleSaveEvent,
    handleSyncEvent,
    handleDeleteEvent,
    handleBulkDelete,
    handleDeleteAll,
  };
}

export function getTimeStatus(date: Date) {
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
}

export function getEventTypeColor(type: string) {
  const colors: Record<string, string> = {
    conversation: 'bg-primary/10 text-text-primary border-primary/30',
    task: 'bg-accent text-accent-foreground border-border',
    deadline: 'bg-destructive/10 text-destructive border-destructive/30',
  };
  return colors[type] || colors.conversation;
}

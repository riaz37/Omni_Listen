'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

  // UI-only state
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'upcoming' | 'past'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'type'>('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [selectedEventIds, setSelectedEventIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notificationOverrides, setNotificationOverrides] = useState<Record<string, boolean>>({});

  // Modal state
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [reschedulingEvent, setReschedulingEvent] = useState<Event | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: rawEvents = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await conversationsAPI.getAllEvents();
      return response.events ?? [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (user) requestNotificationPermission();
  }, [user]);

  const events = useMemo<Event[]>(() => {
    const extractedEvents: Event[] = [];
    rawEvents.forEach((event: any) => {
      try {
        const dateField = event.date || event.due_date;
        const timeField = event.time || event.due_time;
        if (dateField) {
          let eventDate: Date;
          if (timeField && timeField.trim() && timeField.toLowerCase() !== 'null') {
            eventDate = parseISO(`${dateField}T${timeField}:00`);
          } else {
            eventDate = parseISO(dateField);
          }
          const id = `event-${event.id}`;
          extractedEvents.push({
            id,
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
            notificationsEnabled: notificationOverrides[id] ?? true,
            completed: event.completed || false,
            urgency: event.urgency,
          });
        }
      } catch (err) {}
    });
    return extractedEvents;
  }, [rawEvents, notificationOverrides]);

  useEffect(() => {
    if (events.length > 0) scheduleNotifications(events);
  }, [events]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
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
              icon: '/logo.png',
              tag: event.id,
            });
          }, 100);
        }
      }
    });
  };

  const handleToggleNotification = (eventId: string) => {
    setNotificationOverrides(prev => {
      const current = prev[eventId] ?? true;
      const next = !current;
      if (next) {
        toast.success('Notifications enabled for this event');
      } else {
        toast.info('Notifications disabled for this event');
      }
      return { ...prev, [eventId]: next };
    });
  };

  const handleToggleCompletion = async (event: Event) => {
    if (!event.eventItemId) return;
    try {
      const newCompleted = !event.completed;
      await conversationsAPI.toggleTaskCompletion(event.eventItemId, newCompleted);
      queryClient.setQueryData(['events'], (old: any[] = []) =>
        old.map(e => e.id === event.eventItemId ? { ...e, completed: newCompleted } : e)
      );
      toast.success(newCompleted ? 'Event marked as completed' : 'Event marked as incomplete');
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
      queryClient.setQueryData(['events'], (old: any[] = []) =>
        old.map(e => {
          if (e.id !== eventId) return e;
          return {
            ...e,
            ...(updates.title !== undefined && { title: updates.title }),
            ...(updates.date !== undefined && { date: updates.date }),
            ...(updates.time !== undefined && { time: updates.time }),
            ...(updates.description !== undefined && { description: updates.description }),
            ...(updates.location !== undefined && { location: updates.location }),
            ...(updates.assignee !== undefined && { assignee: updates.assignee }),
          };
        })
      );
      setShowEditModal(false);
      toast.success('Event updated successfully');
    } catch (error) {
      toast.error('Failed to update event');
      throw error;
    }
  };

  const handleSyncEvent = async (_event: Event) => {
    toast.info('Calendar sync not yet implemented');
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      const numericId = parseInt(eventId.replace('event-', ''));
      await conversationsAPI.deleteEvent(numericId);
      queryClient.setQueryData(['events'], (old: any[] = []) =>
        old.filter(e => e.id !== numericId)
      );
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
    if (!confirm(`Are you sure you want to delete ${selectedEventIds.length} selected event(s)?`)) return;

    setIsDeleting(true);
    try {
      const result = await conversationsAPI.bulkDeleteEvents(selectedEventIds);
      queryClient.setQueryData(['events'], (old: any[] = []) =>
        old.filter(e => !selectedEventIds.includes(e.id))
      );
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
    if (!confirm(`Are you sure you want to delete ALL ${events.length} event(s)? This action cannot be undone.`)) return;

    setIsDeleting(true);
    try {
      const result = await conversationsAPI.deleteAllEvents();
      queryClient.setQueryData(['events'], []);
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
        if (sortBy === 'date') return a.start.getTime() - b.start.getTime();
        return a.type.localeCompare(b.type);
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

  const handleDeselectAll = () => setSelectedEventIds([]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return {
    events,
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

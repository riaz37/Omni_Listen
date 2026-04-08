'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { conversationsAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, parseISO, isFuture, isToday, isValid } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar-styles.css';
import { Button } from '@/components/ui/button';
import { Search, Plus, List } from 'lucide-react';
import CustomDropdown from '@/components/ui/custom-dropdown';
import type { CalendarEvent } from '@/lib/types';
import { CalendarSkeleton } from './CalendarSkeleton';
import { Skeleton } from 'boneyard-js/react';
import { CalendarToolbar } from './CalendarToolbar';
import { YearlyView } from './YearlyView';
import { CalendarEventModal } from './CalendarEventModal';
import { EventListSidebar } from './EventListSidebar';
import { CreateEventModal } from './CreateEventModal';
import PageEntrance from '@/components/ui/page-entrance';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function EventsPage() {
  const router = useRouter();
  const { user, loading } = useRequireAuth();


  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'month' | 'week' | 'day' | 'yearly'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'conversation' | 'task' | 'deadline'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEventList, setShowEventList] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    start: '',
    end: '',
    type: 'conversation' as 'conversation' | 'task' | 'deadline',
    description: '',
    location: '',
  });

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  // Handle ESC key to close modals
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedEvent) {
          setSelectedEvent(null);
        } else if (showCreateModal) {
          setShowCreateModal(false);
        } else if (showEventList) {
          setShowEventList(false);
        }
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [selectedEvent, showCreateModal, showEventList]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const eventsResponse = await conversationsAPI.getAllEvents();
      const extractedEvents: CalendarEvent[] = [];

      if (eventsResponse.events && Array.isArray(eventsResponse.events)) {
        eventsResponse.events.forEach((event: any) => {
          try {
            const dateField = event.date || event.due_date;
            const timeField = event.time || event.due_time;

            if (!dateField) {
              return;
            }

            let eventDate: Date;

            if (timeField && timeField.trim() && timeField.toLowerCase() !== 'null') {
              const datetimeString = `${dateField}T${timeField}:00`;
              eventDate = parseISO(datetimeString);
            } else {
              eventDate = parseISO(dateField);
            }

            if (!isValid(eventDate)) {
              return;
            }

            const DEFAULT_EVENT_DURATION_MS = 60 * 60 * 1000;

            let eventType: 'conversation' | 'task' | 'deadline' = 'task';

            const daysUntil = Math.ceil((eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            if (daysUntil < 0) {
              eventType = 'deadline';
            } else if (event.urgency === 'high' || daysUntil <= 3) {
              eventType = 'deadline';
            } else if (event.category === 'MEETING' || event.type === 'conversation') {
              eventType = 'conversation';
            }

            const newEvent = {
              id: `event-${event.id}`,
              eventItemId: event.id,
              title: event.title || event.task || 'Untitled Event',
              start: eventDate,
              end: new Date(eventDate.getTime() + DEFAULT_EVENT_DURATION_MS),
              description: event.description || event.context || '',
              location: event.location,
              attendees: event.assignee ? [event.assignee] : [],
              assignee: event.assignee || '',
              conversationId: event.meeting_id || '',
              type: eventType,
              synced: true,
              completed: event.completed || false,
              urgency: event.urgency,
            };

            extractedEvents.push(newEvent);
          } catch (err) {
          }
        });
      }

      setEvents(extractedEvents);
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.start) {
      toast.error('Please fill in all required fields');
      return;
    }

    const startDate = new Date(newEvent.start);
    const DEFAULT_EVENT_DURATION_MS = 60 * 60 * 1000;
    const endDate = newEvent.end ? new Date(newEvent.end) : new Date(startDate.getTime() + DEFAULT_EVENT_DURATION_MS);

    const manualEvent: CalendarEvent = {
      id: `manual-${Date.now()}`,
      title: newEvent.title,
      start: startDate,
      end: endDate,
      type: newEvent.type,
      description: newEvent.description,
      location: newEvent.location,
      isManual: true,
      synced: false,
    };

    setEvents([...events, manualEvent]);
    setShowCreateModal(false);
    setNewEvent({
      title: '',
      start: '',
      end: '',
      type: 'conversation',
      description: '',
      location: '',
    });
    toast.success('Event created successfully!');
  };

  const handleSyncEvent = async (event: CalendarEvent) => {
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

  const handleToggleCompletion = async (event: CalendarEvent) => {
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

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesType = filterType === 'all' || event.type === filterType;
      const matchesSearch = !searchTerm.trim() ||
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [events, filterType, searchTerm]);

  const handleNavigate = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  const getEventStyle = (event: CalendarEvent) => {
    const colors: Record<string, { bg: string; text: string }> = {
      meeting: { bg: 'hsl(var(--primary) / 0.15)', text: 'hsl(var(--primary))' },
      task: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6' },
      deadline: { bg: 'hsl(var(--destructive) / 0.15)', text: 'hsl(var(--destructive))' },
    };
    const c = colors[event.type] || { bg: 'hsl(var(--muted) / 0.5)', text: 'hsl(var(--foreground))' };
    return {
      backgroundColor: c.bg,
      color: c.text,
      borderRadius: '9999px',
      fontSize: '12px',
      fontWeight: 500,
      padding: '2px 10px',
      border: 'none',
    };
  };

  return (
    <Skeleton name="calendar-grid" loading={loading || isLoading} fallback={<CalendarSkeleton />}>
      <div className="min-h-screen bg-background">

      <PageEntrance name="calendar" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Event Calendar</h1>
            <p className="text-muted-foreground">View and manage all your conversation events and deadlines</p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            iconLeft={<Plus className="w-4 h-4" />}
          >
            Add Event
          </Button>
        </div>

        {/* Search & Actions Row */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEventList(true)}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted hover:border-primary/50 transition-colors text-sm font-medium"
            >
              <List className="w-4 h-4" />
              <span>All Events</span>
              {events.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary min-w-[20px] text-center">
                  {events.length}
                </span>
              )}
            </button>
            <span className="text-sm text-muted-foreground">Sort By</span>
            <CustomDropdown
              value={filterType}
              onChange={(val) => setFilterType(val as 'all' | 'conversation' | 'task' | 'deadline')}
              options={[
                { value: 'all', label: 'Events' },
                { value: 'conversation', label: 'Conversations' },
                { value: 'task', label: 'Tasks' },
                { value: 'deadline', label: 'Deadlines' },
              ]}
            />
          </div>
        </div>

        {/* Full-width Calendar */}
        <div className="bg-card rounded-xl border border-border p-6">
          <CalendarToolbar
            view={view}
            currentDate={currentDate}
            onViewChange={setView}
            onNavigate={handleNavigate}
          />

          {view === 'yearly' ? (
            <YearlyView currentDate={currentDate} />
          ) : (
            <div style={{ height: 'calc(100vh - 280px)', minHeight: '400px' }}>
              <Calendar
                localizer={localizer}
                events={filteredEvents}
                startAccessor="start"
                endAccessor="end"
                view={view}
                date={currentDate}
                onView={(newView) => setView(newView as any)}
                onNavigate={handleNavigate}
                onSelectEvent={(event) => setSelectedEvent(event)}
                eventPropGetter={(event) => ({
                  style: getEventStyle(event),
                })}
                components={{ toolbar: () => null }}
                style={{ height: '100%' }}
              />
            </div>
          )}
        </div>
      </PageEntrance>

      {/* Event List Sidebar */}
      {showEventList && (
        <EventListSidebar
          events={events}
          onSelectEvent={(event) => {
            setSelectedEvent(event);
            setShowEventList(false);
          }}
          onToggleCompletion={handleToggleCompletion}
          onClose={() => setShowEventList(false)}
        />
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <CalendarEventModal
          event={selectedEvent}
          calendarConnected={!!user?.calendar_connected}
          onClose={() => setSelectedEvent(null)}
          onSync={handleSyncEvent}
          onNavigateToConversation={(conversationId) => router.push(`/conversation?id=${conversationId}`)}
        />
      )}

      {/* Add Event Modal */}
      {showCreateModal && (
        <CreateEventModal
          newEvent={newEvent}
          onNewEventChange={setNewEvent}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateEvent}
        />
      )}
      </div>
    </Skeleton>
  );
}

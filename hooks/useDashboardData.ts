import { useState, useEffect } from 'react';
import { conversationsAPI, analyticsAPI } from '@/lib/api';

import { sortByUrgencyThenDate } from '@/lib/utils';

export function useDashboardData(user: any, loading: boolean, isLoggingOut: boolean) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [recentConversations, setRecentConversations] = useState<any[]>([]);

  const fetchUpcomingEvents = async () => {
    try {
      const eventsResponse = await conversationsAPI.getAllEvents();
      const now = new Date();
      const allEvents: any[] = [];

      if (eventsResponse.events && Array.isArray(eventsResponse.events)) {
        eventsResponse.events.forEach((event: any) => {
          try {
            if (event.date) {
              const eventDate = new Date(event.date);
              if (eventDate > now) {
                allEvents.push({
                  id: event.id,
                  title: event.title || 'Untitled Event',
                  date: eventDate,
                  assignee: event.assignee,
                  description: event.description || '',
                  urgency: event.urgency || 'no',
                  completed: event.completed || false,
                  conversationId: event.meeting_id || '',
                });
              }
            }
          } catch (err) {
          }
        });
      }

      allEvents.sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        return a.date.getTime() - b.date.getTime();
      });
      setUpcomingEvents(allEvents.slice(0, 5));
    } catch (error) {
    }
  };

  const fetchTasks = async () => {
    try {
      const [eventsResponse, notesResponse] = await Promise.all([
        conversationsAPI.getAllEvents(),
        conversationsAPI.getAllNotes()
      ]);

      const allTasks: any[] = [];

      if (eventsResponse.events && Array.isArray(eventsResponse.events)) {
        eventsResponse.events.forEach((event: any) => {
          try {
            allTasks.push({
              id: event.id,
              title: event.title || 'Untitled Task',
              date: new Date(event.date),
              completed: event.completed || false,
              type: 'dated_events',
              category: event.category,
              description: event.description || '',
              urgency: event.urgency || 'no',
              conversationId: event.meeting_id || '',
              assignee: event.assignee,
            });
          } catch (err) {
          }
        });
      }

      if (notesResponse.notes && Array.isArray(notesResponse.notes)) {
        notesResponse.notes.forEach((note: any) => {
          try {
            allTasks.push({
              id: note.id,
              title: note.title || 'Untitled Note',
              date: new Date(note.created_at || Date.now()),
              completed: note.completed || false,
              type: 'notes',
              category: note.category || note.note_type,
              description: note.description || '',
              urgency: note.urgency || 'no',
              conversationId: note.meeting_id || '',
              assignee: note.assignee,
            });
          } catch (err) {
          }
        });
      }

      allTasks.sort(sortByUrgencyThenDate);
      setTasks(allTasks);
    } catch (error) {
    }
  };

  const fetchRecentConversations = async () => {
    try {
      const response = await conversationsAPI.getConversations(5, 0);
      if (response.meetings && Array.isArray(response.meetings)) {
        const conversations = response.meetings.map((item: any) => ({
          job_id: item.job_id,
          title: item.title || 'Conversation Analysis',
          created_at: new Date(item.created_at),
        }));
        setRecentConversations(conversations);
      }
    } catch (error) {
    }
  };

  const handleToggleTask = async (taskId: number, completed: boolean) => {
    try {
      await conversationsAPI.toggleTaskCompletion(taskId, completed);
      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, completed } : task
      ));
      setTasks(prev => [...prev].sort(sortByUrgencyThenDate));
      fetchUpcomingEvents();
    } catch (error) {
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await conversationsAPI.deleteEvent(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
      fetchUpcomingEvents();
    } catch (error) {
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }
    try {
      await conversationsAPI.deleteEvent(eventId);
      setUpcomingEvents(upcomingEvents.filter(event => event.id !== eventId));
    } catch (error) {
    }
  };

  // Load data on mount
  useEffect(() => {
    if (!loading && !user && !isLoggingOut) {
      // redirect handled by parent
    } else if (user) {
      analyticsAPI.getAnalytics().then(setAnalytics).catch(() => {});
      fetchUpcomingEvents();
      fetchTasks();
      fetchRecentConversations();
    }
  }, [user, loading, isLoggingOut]);

  return {
    analytics,
    upcomingEvents,
    tasks,
    recentConversations,
    handleToggleTask,
    handleDeleteTask,
    handleDeleteEvent,
  };
}

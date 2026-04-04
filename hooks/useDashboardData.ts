import { useState, useEffect } from 'react';
import { meetingsAPI, analyticsAPI } from '@/lib/api';
import { sortByUrgencyThenDate } from '@/lib/utils';

export function useDashboardData(user: any, loading: boolean, isLoggingOut: boolean) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [recentMeetings, setRecentMeetings] = useState<any[]>([]);

  const fetchUpcomingEvents = async () => {
    try {
      const eventsResponse = await meetingsAPI.getAllEvents();
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
                  meetingId: event.meeting_id || '',
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
        meetingsAPI.getAllEvents(),
        meetingsAPI.getAllNotes()
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
              meetingId: event.meeting_id || '',
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
              meetingId: note.meeting_id || '',
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

  const fetchRecentMeetings = async () => {
    try {
      const response = await meetingsAPI.getMeetings(5, 0);
      if (response.meetings && Array.isArray(response.meetings)) {
        const meetings = response.meetings.map((meeting: any) => ({
          job_id: meeting.job_id,
          title: meeting.title || 'Meeting Analysis',
          created_at: new Date(meeting.created_at),
        }));
        setRecentMeetings(meetings);
      }
    } catch (error) {
    }
  };

  const handleToggleTask = async (taskId: number, completed: boolean) => {
    try {
      await meetingsAPI.toggleTaskCompletion(taskId, completed);
      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, completed } : task
      ));
      setTasks(prev => [...prev].sort(sortByUrgencyThenDate));
      fetchUpcomingEvents();
    } catch (error) {
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }
    try {
      await meetingsAPI.deleteEvent(taskId);
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
      await meetingsAPI.deleteEvent(eventId);
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
      fetchRecentMeetings();
    }
  }, [user, loading, isLoggingOut]);

  return {
    analytics,
    upcomingEvents,
    tasks,
    recentMeetings,
    handleToggleTask,
    handleDeleteTask,
    handleDeleteEvent,
  };
}

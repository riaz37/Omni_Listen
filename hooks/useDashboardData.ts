import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { conversationsAPI, analyticsAPI } from '@/lib/api';
import { sortByUrgencyThenDate } from '@/lib/utils';

export function useDashboardData(user: any, loading: boolean, isLoggingOut: boolean) {
  const queryClient = useQueryClient();
  const enabled = !!user && !loading && !isLoggingOut;

  const { data: rawEvents = [] } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const r = await conversationsAPI.getAllEvents();
      return r.events ?? [];
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const { data: rawNotes = [] } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const r = await conversationsAPI.getAllNotes();
      return r.notes ?? [];
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsAPI.getAnalytics(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const { data: conversationsResponse } = useQuery({
    queryKey: ['conversations', 'recent'],
    queryFn: () => conversationsAPI.getConversations(5, 0),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const allEvents: any[] = [];
    rawEvents.forEach((event: any) => {
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
      } catch (err) {}
    });
    allEvents.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return a.date.getTime() - b.date.getTime();
    });
    return allEvents.slice(0, 5);
  }, [rawEvents]);

  const tasks = useMemo(() => {
    const allTasks: any[] = [];
    rawEvents.forEach((event: any) => {
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
      } catch (err) {}
    });
    rawNotes.forEach((note: any) => {
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
      } catch (err) {}
    });
    return [...allTasks].sort(sortByUrgencyThenDate);
  }, [rawEvents, rawNotes]);

  const recentConversations = useMemo(() => {
    if (!conversationsResponse?.meetings) return [];
    return conversationsResponse.meetings.map((item: any) => ({
      job_id: item.job_id,
      title: item.title || 'Conversation Analysis',
      created_at: new Date(item.created_at),
      failed_at_stage: item.failed_at_stage ?? null,
    }));
  }, [conversationsResponse]);

  const handleToggleTask = async (taskId: number, completed: boolean) => {
    try {
      await conversationsAPI.toggleTaskCompletion(taskId, completed);
      queryClient.setQueryData(['events'], (old: any[] = []) =>
        old.map(e => e.id === taskId ? { ...e, completed } : e)
      );
    } catch (error) {}
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await conversationsAPI.deleteEvent(taskId);
      queryClient.setQueryData(['events'], (old: any[] = []) =>
        old.filter(e => e.id !== taskId)
      );
    } catch (error) {}
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await conversationsAPI.deleteEvent(eventId);
      queryClient.setQueryData(['events'], (old: any[] = []) =>
        old.filter(e => e.id !== eventId)
      );
    } catch (error) {}
  };

  return {
    analytics,
    upcomingEvents,
    tasks,
    recentConversations,
    queryClient,
    handleToggleTask,
    handleDeleteTask,
    handleDeleteEvent,
  };
}

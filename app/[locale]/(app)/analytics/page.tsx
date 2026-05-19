'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI, conversationsAPI } from '@/lib/api';
import { AnalyticsSkeleton } from './AnalyticsSkeleton';
import { AnalyticsStatCards } from './AnalyticsStatCards';
import { RecentConversationsCard } from './RecentConversationsCard';
import { RecentNotesCard } from './RecentNotesCard';
import { EventListCard } from './EventListCard';
import { AnalysisHistoryCard } from './AnalysisHistoryCard';
import { TaskListTable } from './TaskListTable';
import { Skeleton } from 'boneyard-js/react';
import PageEntrance from '@/components/ui/page-entrance';

interface Conversation {
  job_id: string;
  title: string;
  created_at: string;
  event_count: number;
  final_summary?: any;
}

interface Note {
  id: number;
  title: string;
  description: string;
  category: string;
  meeting_id: string;
  created_at?: string;
}

interface EventItem {
  id: number;
  title: string;
  description?: string;
  date: string;
  assignee?: string;
  completed?: boolean;
  synced?: boolean;
  meeting_id?: string;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  urgency?: string;
  assignee?: string;
  category?: string;
  type?: string;
}

const CATEGORY_STYLES: Record<string, string> = {
  general: 'bg-primary/10 text-primary',
  decision: 'bg-primary/10 text-primary',
  budget: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  action: 'bg-primary/10 text-primary',
  summary: 'bg-primary/10 text-primary',
};

function getCategoryBadge(category: string) {
  const cat = (category || 'general').toLowerCase();
  const style = CATEGORY_STYLES[cat] || CATEGORY_STYLES.general;
  const label = category ? category.charAt(0).toUpperCase() + category.slice(1).toLowerCase() : 'General';
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {label}
    </span>
    );
}

function getUrgencyLabel(urgency?: string) {
  if (urgency === 'yes' || urgency === 'high') {
    return <span className="px-2.5 py-1 rounded text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/30">Urgent</span>;
  }
  return <span className="px-2.5 py-1 rounded text-xs font-medium bg-muted text-muted-foreground border border-border">Normal</span>;
}

function getStatusBadge(completed: boolean) {
  if (completed) {
    return <span className="px-2.5 py-1 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20">Done</span>;
  }
  return <span className="px-2.5 py-1 rounded text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30">To Do</span>;
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds === 0) return '0';
  return String(Math.floor(seconds / 60));
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, loading } = useRequireAuth();

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsAPI.getAnalytics(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const { data: rawConversations = [], isLoading: convLoading } = useQuery({
    queryKey: ['conversations', 'all'],
    queryFn: () => conversationsAPI.getAllConversations(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const { data: rawEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const r = await conversationsAPI.getAllEvents();
      return r.events ?? [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const { data: rawNotes = [], isLoading: notesLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const r = await conversationsAPI.getAllNotes();
      return r.notes ?? [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = analyticsLoading || convLoading || eventsLoading || notesLoading;

  const conversations = useMemo<Conversation[]>(() => {
    return (Array.isArray(rawConversations) ? rawConversations : []).slice(0, 2).map((m: any) => {
      const summary = typeof m.final_summary === 'string' ? JSON.parse(m.final_summary) : m.final_summary;
      return {
        job_id: m.job_id,
        title: summary?.title || 'Conversation Analysis',
        created_at: m.created_at,
        event_count: rawEvents.filter((ev: any) => ev.meeting_id === m.job_id).length,
        final_summary: summary,
      };
    });
  }, [rawConversations, rawEvents]);

  const events = useMemo<EventItem[]>(() => rawEvents.slice(0, 2), [rawEvents]);
  const notes = useMemo<Note[]>(() => (rawNotes as Note[]).slice(0, 2), [rawNotes]);

  const tasks = useMemo<Task[]>(() => {
    const allTasks: Task[] = [];
    rawEvents.forEach((ev: any) => {
      allTasks.push({ id: ev.id, title: ev.title || 'Untitled', description: ev.description || ev.details,
        completed: ev.completed || false, urgency: ev.urgency || 'no', assignee: ev.assignee,
        category: ev.category, type: 'Event' });
    });
    rawNotes.forEach((note: any) => {
      allTasks.push({ id: note.id, title: note.title || 'Untitled', description: note.description,
        completed: note.completed || false, urgency: note.urgency || 'no', assignee: '',
        category: note.category, type: 'General' });
    });
    return allTasks.slice(0, 4);
  }, [rawEvents, rawNotes]);

  if (!user) return null;

  const totalConversations = analytics?.total_meetings || 0;
  const totalEvents = analytics?.total_events || 0;
  const avgDuration = formatDuration(analytics?.avg_duration_seconds || 0);
  const last30Days = analytics?.meetings_last_30_days || 0;

  return (
    <Skeleton name="analytics-dashboard" loading={loading || isLoading} fallback={<AnalyticsSkeleton />}>
      <div className="min-h-screen bg-background">

        <PageEntrance name="analytics" className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-12">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">
              View and manage all your conversation events and insights
            </p>
          </div>

          {/* Stat Cards */}
          <AnalyticsStatCards
            totalMeetings={totalConversations}
            totalEvents={totalEvents}
            avgDuration={avgDuration}
            last30Days={last30Days}
            onNavigate={(path) => router.push(path)}
          />

          {/* Recent Conversations + Recent Notes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <RecentConversationsCard
              conversations={conversations}
              totalConversations={totalConversations}
              onNavigate={(path) => router.push(path)}
            />
            <RecentNotesCard
              notes={notes}
              totalNotes={analytics?.total_events || 0}
              getCategoryBadge={getCategoryBadge}
            />
          </div>

          {/* Event List + Recent Additional Analysis History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <EventListCard
              events={events}
              totalEvents={totalEvents}
            />
            <AnalysisHistoryCard
              notes={notes}
            />
          </div>

          {/* Task List Table */}
          <TaskListTable
            tasks={tasks}
            getStatusBadge={getStatusBadge}
            getUrgencyLabel={getUrgencyLabel}
          />
        </PageEntrance>
      </div>
    </Skeleton>
  );
}

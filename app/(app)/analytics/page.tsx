'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { analyticsAPI, meetingsAPI } from '@/lib/api';
import { AnalyticsSkeleton } from './AnalyticsSkeleton';
import { AnalyticsStatCards } from './AnalyticsStatCards';
import { RecentMeetingsCard } from './RecentMeetingsCard';
import { RecentNotesCard } from './RecentNotesCard';
import { EventListCard } from './EventListCard';
import { AnalysisHistoryCard } from './AnalysisHistoryCard';
import { TaskListTable } from './TaskListTable';
import { Skeleton } from 'boneyard-js/react';
import PageEntrance from '@/components/ui/page-entrance';

interface Meeting {
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

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, loading } = useRequireAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [analyticsData, meetingsData, eventsData, notesData] = await Promise.all([
        analyticsAPI.getAnalytics(),
        meetingsAPI.getAllMeetings(),
        meetingsAPI.getAllEvents(),
        meetingsAPI.getAllNotes(),
      ]);

      setAnalytics(analyticsData);

      // Process meetings
      const processedMeetings = (Array.isArray(meetingsData) ? meetingsData : []).map((m: any) => {
        const summary = typeof m.final_summary === 'string'
          ? JSON.parse(m.final_summary)
          : m.final_summary;
        return {
          job_id: m.job_id,
          title: summary?.title || 'Meeting Analysis',
          created_at: m.created_at,
          event_count: 0,
          final_summary: summary,
        };
      });
      setMeetings(processedMeetings.slice(0, 2));

      // Process events
      const allEvents = eventsData.events || [];
      setEvents(allEvents.slice(0, 2));

      // Count events per meeting
      allEvents.forEach((ev: any) => {
        const meeting = processedMeetings.find((m: Meeting) => m.job_id === ev.meeting_id);
        if (meeting) {
          meeting.event_count++;
        }
      });

      // Process notes
      const allNotes = notesData.notes || [];
      setNotes(allNotes.slice(0, 2));

      // Build tasks from events + notes
      const allTasks: Task[] = [];
      allEvents.forEach((ev: any) => {
        allTasks.push({
          id: ev.id,
          title: ev.title || 'Untitled',
          description: ev.description || ev.details,
          completed: ev.completed || false,
          urgency: ev.urgency || 'no',
          assignee: ev.assignee,
          category: ev.category,
          type: 'Event',
        });
      });
      allNotes.forEach((note: any) => {
        allTasks.push({
          id: note.id,
          title: note.title || 'Untitled',
          description: note.description,
          completed: note.completed || false,
          urgency: note.urgency || 'no',
          assignee: '',
          category: note.category,
          type: 'General',
        });
      });
      setTasks(allTasks.slice(0, 4));
    } catch (error) {
      // silently fail - analytics page shows empty state
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    if (!seconds || seconds === 0) return '0';
    const mins = Math.floor(seconds / 60);
    return String(mins);
  };

  const getCategoryBadge = (category: string) => {
    const cat = (category || 'general').toLowerCase();
    const styles: Record<string, string> = {
      general: 'bg-primary/10 text-primary',
      decision: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      budget: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      action: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      summary: 'bg-primary/10 text-primary',
    };
    const style = styles[cat] || styles.general;
    const label = category ? category.charAt(0).toUpperCase() + category.slice(1).toLowerCase() : 'General';
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
        {label}
      </span>
    );
  };

  const getUrgencyLabel = (urgency?: string) => {
    if (urgency === 'yes' || urgency === 'high') {
      return <span className="px-2.5 py-1 rounded text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/30">Urgent</span>;
    }
    return <span className="px-2.5 py-1 rounded text-xs font-medium bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/30">Normal</span>;
  };

  const getStatusBadge = (completed: boolean) => {
    if (completed) {
      return <span className="px-2.5 py-1 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20">Done</span>;
    }
    return <span className="px-2.5 py-1 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20">To Do</span>;
  };

  if (!user) return null;

  const totalMeetings = analytics?.total_meetings || 0;
  const totalEvents = analytics?.total_events || 0;
  const avgDuration = formatDuration(analytics?.avg_duration_seconds || 0);
  const last30Days = analytics?.meetings_last_30_days || 0;

  return (
    <Skeleton name="analytics-dashboard" loading={loading || isLoading} fallback={<AnalyticsSkeleton />}>
      <div className="min-h-screen bg-background">

        <PageEntrance name="analytics" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">
              View and manage all your meeting events and deadlines
            </p>
          </div>

          {/* Stat Cards */}
          <AnalyticsStatCards
            totalMeetings={totalMeetings}
            totalEvents={totalEvents}
            avgDuration={avgDuration}
            last30Days={last30Days}
            onNavigate={(path) => router.push(path)}
          />

          {/* Recent Meetings History + Recent Notes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <RecentMeetingsCard
              meetings={meetings}
              totalMeetings={totalMeetings}
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

'use client';

import StatCard from '@/components/StatCard';
import { FileText, Calendar, TrendingUp, CheckSquare } from 'lucide-react';

interface AnalyticsData {
  total_meetings?: number;
  total_events?: number;
  total_tasks?: number;
  completion_rate?: number;
}

interface DashboardAnalyticsProps {
  analytics: AnalyticsData | null;
}

export default function DashboardAnalytics({ analytics }: DashboardAnalyticsProps) {
  if (!analytics) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      <StatCard
        title="Total Meetings"
        value={analytics.total_meetings ?? 0}
        icon={FileText}
      />
      <StatCard
        title="Events"
        value={analytics.total_events ?? 0}
        icon={Calendar}
      />
      <StatCard
        title="Tasks"
        value={analytics.total_tasks ?? 0}
        icon={CheckSquare}
      />
      <StatCard
        title="Completion Rate"
        value={`${analytics.completion_rate ?? 0}%`}
        icon={TrendingUp}
      />
    </div>
  );
}

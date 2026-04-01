'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Navigation from '@/components/Navigation';
import StatCard from '@/components/StatCard';
import { analyticsAPI } from '@/lib/api';
import { StatCardSkeleton, CardSkeleton } from '@/components/Skeleton';
import { FileText, Calendar, Clock, TrendingUp, Loader2, BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to format duration in minutes and seconds
  const formatDuration = (seconds: number): string => {
    if (seconds === 0) return '0m 0s';
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    if (secs === 0) return `${mins}m`;
    return `${mins}m ${secs}s`;
  };

  // Helper function to format total time (consistent precision with avg duration)
  const formatTotalTime = (seconds: number): string => {
    if (seconds === 0) return '0m 0s';
    if (seconds < 3600) {
      // Less than 1 hour - show in minutes and seconds (consistent with formatDuration)
      const mins = Math.floor(seconds / 60);
      const secs = Math.round(seconds % 60);
      if (secs === 0) return `${mins}m`;
      return `${mins}m ${secs}s`;
    }
    // 1 hour or more - show in hours with 1 decimal
    const hours = (seconds / 3600).toFixed(1);
    return `${hours} hr${parseFloat(hours) !== 1 ? 's' : ''}`;
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    } else if (user) {
      // Fetch analytics
      setIsLoading(true);
      analyticsAPI.getAnalytics()
        .then(setAnalytics)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [user, loading, router]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
            </div>
            <p className="text-muted-foreground">Insights and statistics about your meetings</p>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>

          {/* Cards Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-primary dark:text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          </div>
          <p className="text-muted-foreground">
            Overview of your meeting analysis and activity
          </p>
        </div>

        {/* Analytics Cards */}
        {analytics ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Meetings"
                value={analytics.total_meetings}
                icon={FileText}
                description="All time"
                color="blue"
              />
              <StatCard
                title="Total Events"
                value={analytics.total_events}
                icon={Calendar}
                description="Created from meetings"
                color="green"
              />
              <StatCard
                title="Avg Duration"
                value={formatDuration(analytics.avg_duration_seconds)}
                icon={Clock}
                description="Per meeting"
                color="purple"
              />
              <StatCard
                title="Last 30 Days"
                value={analytics.meetings_last_30_days}
                icon={TrendingUp}
                description="Recent meetings"
                color="orange"
              />
            </div>

            {/* Additional Analytics Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Meeting Activity */}
              <div className="bg-card-2 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Meeting Activity
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Meetings</span>
                    <span className="text-2xl font-bold text-foreground">
                      {analytics.total_meetings}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">This Month</span>
                    <span className="text-2xl font-bold text-primary dark:text-primary">
                      {analytics.meetings_last_30_days}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Average per Week</span>
                    <span className="text-2xl font-bold text-foreground">
                      {(() => {
                        const avgPerWeek = analytics.meetings_last_30_days / 4.3;
                        return avgPerWeek < 1 ? avgPerWeek.toFixed(1) : Math.round(avgPerWeek);
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Events Generated */}
              <div className="bg-card-2 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Events Generated
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Events</span>
                    <span className="text-2xl font-bold text-foreground">
                      {analytics.total_events}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Avg per Meeting</span>
                    <span className="text-2xl font-bold text-primary dark:text-primary">
                      {analytics.total_meetings > 0
                        ? (analytics.total_events / analytics.total_meetings).toFixed(1)
                        : '0'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Meeting Duration Stats */}
              <div className="bg-card-2 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Duration Stats
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Average Duration</span>
                    <span className="text-2xl font-bold text-foreground">
                      {formatDuration(analytics.avg_duration_seconds)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Time Analyzed</span>
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {formatTotalTime(analytics.total_audio_duration_seconds || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-card-2 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                  >
                    Upload New Meeting
                  </button>
                  <button
                    onClick={() => router.push('/history')}
                    className="w-full px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    View Meeting History
                  </button>
                  <button
                    onClick={() => router.push('/calendar')}
                    className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                  >
                    View Calendar
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-card-2 rounded-lg shadow p-8 text-center">
            <p className="text-muted-foreground">
              No analytics data available yet. Upload your first meeting to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

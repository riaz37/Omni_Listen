'use client';

import { useState, useCallback } from 'react';
import { normalizeUrgency } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { conversationsAPI } from '@/lib/api';
import {
  Calendar,
  Clock,
  CheckSquare,
  Trash2,
  List,
  FileText,
  RefreshCw,
} from 'lucide-react';

interface UpcomingEvent {
  id: number;
  title: string;
  date: Date;
  assignee?: string;
  description?: string;
  urgency?: string;
  completed?: boolean;
  meetingId?: string;
}

interface Task {
  id: number;
  title: string;
  date: Date;
  completed: boolean;
  type: string;
  category?: string;
  description?: string;
  urgency?: string;
  meetingId?: string;
  assignee?: string;
}

interface RecentConversation {
  job_id: string;
  title: string;
  created_at: Date;
  failed_at_stage: string | null;
}

interface DashboardRecentConversationsProps {
  recentConversations: RecentConversation[];
  upcomingEvents: UpcomingEvent[];
  tasks: Task[];
  router: { push: (url: string) => void };
  onToggleTask: (taskId: number, completed: boolean) => void;
  onDeleteTask: (taskId: number) => void;
  onDeleteEvent: (eventId: number) => void;
  onRecentConversationRetried?: (jobId: string) => void;
}

export default function DashboardRecentConversations({
  recentConversations,
  upcomingEvents,
  tasks,
  router,
  onToggleTask,
  onDeleteTask,
  onDeleteEvent,
  onRecentConversationRetried,
}: DashboardRecentConversationsProps) {
  const [retryingIds, setRetryingIds] = useState<Set<string>>(new Set());

  const handleRetry = useCallback(async (jobId: string) => {
    setRetryingIds((prev) => new Set(prev).add(jobId));
    try {
      await conversationsAPI.retryExtraction(jobId);
      const poll = setInterval(async () => {
        try {
          const status = await conversationsAPI.getJobStatus(jobId);
          if (status.status === 'completed') {
            clearInterval(poll);
            setRetryingIds((prev) => { const n = new Set(prev); n.delete(jobId); return n; });
            onRecentConversationRetried?.(jobId);
            router.push(`/conversation?id=${jobId}`);
          } else if (status.status === 'failed') {
            clearInterval(poll);
            setRetryingIds((prev) => { const n = new Set(prev); n.delete(jobId); return n; });
            toast.error('Retry failed: ' + (status.error || 'Unknown error'));
          }
        } catch {
          clearInterval(poll);
          setRetryingIds((prev) => { const n = new Set(prev); n.delete(jobId); return n; });
        }
      }, 5000);
    } catch {
      setRetryingIds((prev) => { const n = new Set(prev); n.delete(jobId); return n; });
      toast.error('Failed to start retry. Please try again.');
    }
  }, [router, onRecentConversationRetried]);

  return (
    <div className="lg:col-span-1">
      <div className="bg-card-2 rounded-lg shadow border border-border p-6 sticky top-4">
        <Tabs defaultValue="upcoming">
          <TabsList className="grid w-full grid-cols-3 mb-4 h-auto p-1">
            <TabsTrigger value="upcoming" className="flex items-center gap-1.5 px-1 sm:px-3">
              <List className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate text-xs sm:text-sm">Upcoming</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-1.5 px-1 sm:px-3">
              <CheckSquare className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate text-xs sm:text-sm">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="meetings" className="flex items-center gap-1.5 px-1 sm:px-3">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate text-xs sm:text-sm">History</span>
            </TabsTrigger>
          </TabsList>

          {/* Upcoming Events Tab */}
          <TabsContent value="upcoming">
            {upcomingEvents.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {upcomingEvents.map((event, index) => {
                  const isUrgent = normalizeUrgency(event.urgency) === 'yes';
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border border-border transition-colors relative ${event.completed ? 'bg-muted/50 opacity-70' : 'bg-card'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          {isUrgent && (
                            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium rounded-full">
                              Urgent
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {event.completed ? (
                            <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">Done</span>
                          ) : (
                            <span className="px-2 py-0.5 border border-primary text-primary text-xs font-medium rounded-full">To Do</span>
                          )}
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDeleteEvent(event.id); }} className="h-auto w-auto p-1 text-destructive/60 hover:text-destructive" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <h3 className="font-medium text-sm text-foreground mb-1">{event.title}</h3>
                      {event.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{event.description}</p>}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{event.assignee || 'Unassigned'}</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <Clock className="w-3 h-3 ml-1" />
                          <span>{event.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No upcoming events</p>
                <p className="text-xs text-muted-foreground mt-1">Events will appear here after syncing</p>
              </div>
            )}
            {upcomingEvents.length > 0 && (
              <Button variant="link" onClick={() => router.push('/events')} className="mt-4 w-full text-primary">
                View all events →
              </Button>
            )}
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            {tasks.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tasks.map((task) => {
                  const isUrgent = normalizeUrgency(task.urgency) === 'yes';
                  return (
                    <div key={task.id} className={`p-4 rounded-lg border border-border transition-all ${task.completed ? 'bg-muted/50 opacity-70' : 'bg-card'} relative`}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          {isUrgent && <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium rounded-full">Urgent</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => onToggleTask(task.id, !task.completed)} className="h-auto p-0">
                            {task.completed ? (
                              <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">Done</span>
                            ) : (
                              <span className="px-2 py-0.5 border border-primary text-primary text-xs font-medium rounded-full">To Do</span>
                            )}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }} className="h-auto w-auto p-1 text-destructive/60 hover:text-destructive" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <h3 className={`font-medium text-sm text-foreground mb-1 ${task.meetingId ? 'cursor-pointer' : ''}`} onClick={() => task.meetingId && router.push(`/conversation?id=${task.meetingId}`)}>
                        {task.title}
                      </h3>
                      {task.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{task.assignee || 'Unassigned'}</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{task.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <Clock className="w-3 h-3 ml-1" />
                          <span>{task.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckSquare className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No tasks yet</p>
                <p className="text-xs text-muted-foreground mt-1">Tasks will appear here from your conversations</p>
              </div>
            )}
          </TabsContent>

          {/* Recent Conversations Tab */}
          <TabsContent value="meetings">
            {recentConversations.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recentConversations.map((meeting) => {
                  const isRetrying = retryingIds.has(meeting.job_id) || meeting.failed_at_stage === 'pending_extraction';
                  const isFailed = !isRetrying && meeting.failed_at_stage === 'extraction_failed';

                  if (isFailed) {
                    return (
                      <div key={meeting.job_id} className="p-3 rounded-lg border border-amber-500/40 bg-amber-50/10 dark:bg-amber-900/10">
                        <h3 className="font-medium text-sm text-foreground mb-1 line-clamp-1">
                          {meeting.title || 'Conversation Analysis'}
                        </h3>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">Extraction failed</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRetry(meeting.job_id)}
                          className="h-7 text-xs border-amber-500/50 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Retry
                        </Button>
                      </div>
                    );
                  }

                  if (isRetrying) {
                    return (
                      <div key={meeting.job_id} className="p-3 rounded-lg border border-border bg-card-2 opacity-60">
                        <h3 className="font-medium text-sm text-foreground mb-1 line-clamp-1">
                          {meeting.title || 'Conversation Analysis'}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          Retrying extraction...
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={meeting.job_id}
                      onClick={() => router.push(`/conversation?id=${meeting.job_id}`)}
                      className="p-3 rounded-lg border border-border bg-card-2 hover:bg-muted cursor-pointer transition-colors"
                    >
                      <h3 className="font-medium text-sm text-foreground mb-1 line-clamp-1">
                        {meeting.title || 'Conversation Analysis'}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {meeting.created_at.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">No recent conversations</p>
                <p className="text-xs text-muted-foreground mt-1">Processed conversations will appear here</p>
              </div>
            )}
            <Button variant="link" onClick={() => router.push('/history')} className="mt-4 w-full text-primary">
              View all history →
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

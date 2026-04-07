'use client';

import { useState } from 'react';
import { normalizeUrgency } from '@/lib/utils';

import {
  Calendar,
  Clock,
  CheckSquare,
  Trash2,
  List,
  FileText,
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

interface RecentMeeting {
  job_id: string;
  title: string;
  created_at: Date;
}

interface DashboardRecentMeetingsProps {
  recentMeetings: RecentMeeting[];
  upcomingEvents: UpcomingEvent[];
  tasks: Task[];
  router: { push: (url: string) => void };
  onToggleTask: (taskId: number, completed: boolean) => void;
  onDeleteTask: (taskId: number) => void;
  onDeleteEvent: (eventId: number) => void;
}

export default function DashboardRecentMeetings({
  recentMeetings,
  upcomingEvents,
  tasks,
  router,
  onToggleTask,
  onDeleteTask,
  onDeleteEvent,
}: DashboardRecentMeetingsProps) {
  const [sidebarTab, setSidebarTab] = useState<'upcoming' | 'tasks' | 'meetings'>('upcoming');

  return (
    <div className="lg:col-span-1">
      <div className="bg-card-2 rounded-lg shadow p-6 sticky top-4">
        {/* Tab Switcher */}
        <div className="flex gap-2 mb-4 bg-muted p-1 rounded-lg">
          <button
            onClick={() => setSidebarTab('upcoming')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${sidebarTab === 'upcoming'
              ? 'bg-card-2 text-primary shadow'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            <List className="w-4 h-4" />
            Upcoming
          </button>
          <button
            onClick={() => setSidebarTab('tasks')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${sidebarTab === 'tasks'
              ? 'bg-card-2 text-primary shadow'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            <CheckSquare className="w-4 h-4" />
            Tasks
          </button>
        </div>

        {/* Upcoming Events Tab */}
        {sidebarTab === 'upcoming' && (
          <>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {upcomingEvents.map((event, index) => {
                  const isUrgent = normalizeUrgency(event.urgency) === 'yes';

                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border border-border transition-colors relative ${
                        event.completed ? 'bg-muted/50 opacity-70' : 'bg-card'
                      }`}
                    >
                      {/* Top row: Urgent badge + Status + Menu */}
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
                            <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                              Done
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 border border-primary text-primary text-xs font-medium rounded-full">
                              To Do
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteEvent(event.id);
                            }}
                            className="p-1 text-red-400 hover:text-red-500 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-medium text-sm text-foreground mb-1">
                        {event.title}
                      </h3>

                      {/* Description */}
                      {event.description && (
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      {/* Bottom row: Assignee left, Date right */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{event.assignee || 'Unassigned'}</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {event.date.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          <Clock className="w-3 h-3 ml-1" />
                          <span>
                            {event.date.toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  No upcoming events
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Events will appear here after syncing
                </p>
              </div>
            )}

            {upcomingEvents.length > 0 && (
              <button
                onClick={() => router.push('/events')}
                className="mt-4 w-full text-center text-sm text-primary dark:text-primary hover:text-text-primary dark:hover:text-primary font-medium"
              >
                View all events →
              </button>
            )}
          </>
        )}

        {/* Tasks Tab */}
        {sidebarTab === 'tasks' && (
          <>
            {tasks.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tasks.map((task) => {
                  const isUrgent = normalizeUrgency(task.urgency) === 'yes';

                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-lg border border-border transition-all ${
                        task.completed ? 'bg-muted/50 opacity-70' : 'bg-card'
                      } relative`}
                    >
                      {/* Top row: Urgent badge + Status pill + Menu */}
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          {isUrgent && (
                            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium rounded-full">
                              Urgent
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onToggleTask(task.id, !task.completed)}
                            className="focus:outline-none"
                          >
                            {task.completed ? (
                              <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                                Done
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 border border-primary text-primary text-xs font-medium rounded-full">
                                To Do
                              </span>
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTask(task.id);
                            }}
                            className="p-1 text-red-400 hover:text-red-500 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <h3
                        className={`font-medium text-sm text-foreground mb-1 ${task.meetingId ? 'cursor-pointer' : ''}`}
                        onClick={() => task.meetingId && router.push(`/meeting?id=${task.meetingId}`)}
                      >
                        {task.title}
                      </h3>

                      {/* Description */}
                      {task.description && (
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {/* Bottom row: Assignee left, Date right */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{task.assignee || 'Unassigned'}</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {task.date.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          <Clock className="w-3 h-3 ml-1" />
                          <span>
                            {task.date.toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckSquare className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  No tasks yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tasks will appear here from your meetings
                </p>
              </div>
            )}
          </>
        )}

        {/* Recent Meetings Tab */}
        {sidebarTab === 'meetings' && (
          <>
            {recentMeetings.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recentMeetings.map((meeting) => (
                  <div
                    key={meeting.job_id}
                    onClick={() => router.push(`/meeting?id=${meeting.job_id}`)}
                    className="p-3 rounded-lg border border-border bg-card-2 hover:bg-muted cursor-pointer transition-colors"
                  >
                    <h3 className="font-medium text-sm text-foreground mb-1 line-clamp-1">
                      {meeting.title || "Meeting Analysis"}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {meeting.created_at.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  No recent meetings
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Processed meetings will appear here
                </p>
              </div>
            )}

            <button
              onClick={() => router.push('/history')}
              className="mt-4 w-full text-center text-sm text-primary dark:text-primary hover:text-text-primary dark:hover:text-primary font-medium"
            >
              View all history →
            </button>
          </>
        )}
      </div>
    </div>
  );
}

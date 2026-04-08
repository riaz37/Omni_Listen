'use client';

import { format, isPast, isFuture } from 'date-fns';
import {
  Clock,
  Users,
  Bell,
  Circle,
  CheckCircle2,
  Edit2,
  Trash2,
  MoreVertical,
  Link2,
  Eye,
  Calendar,
} from 'lucide-react';

interface Event {
  id: string;
  eventItemId?: number;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  attendees?: string[];
  assignee?: string;
  meetingId?: string;
  type: 'conversation' | 'task' | 'deadline';
  synced?: boolean;
  calendarEventId?: string;
  isManual?: boolean;
  notificationsEnabled?: boolean;
  completed?: boolean;
  urgency?: 'yes' | 'no';
}

interface EventListItemProps {
  event: Event;
  openMenuId: string | null;
  timeStatus: { text: string; color: string };
  onToggleCompletion: (event: Event) => void;
  onToggleNotification: (eventId: string) => void;
  onEdit: (event: Event) => void;
  onReschedule: (event: Event) => void;
  onViewDetails: (event: Event) => void;
  onDelete: (eventId: string) => void;
  onSetOpenMenuId: (id: string | null) => void;
}

function getStatusBadge(event: Event, timeStatusText: string) {
  if (event.completed) {
    return <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">Complete</span>;
  }
  if (isPast(event.start)) {
    return <span className="px-2.5 py-0.5 bg-destructive/10 text-destructive rounded-full text-xs font-medium">Overdue</span>;
  }
  if (isFuture(event.start)) {
    return <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">{timeStatusText}</span>;
  }
  return null;
}

export function EventListItem({
  event,
  openMenuId,
  timeStatus,
  onToggleCompletion,
  onToggleNotification,
  onEdit,
  onReschedule,
  onViewDetails,
  onDelete,
  onSetOpenMenuId,
}: EventListItemProps) {
  return (
    <div
      key={event.id}
      className={`p-4 rounded-lg border border-border bg-card hover:shadow-sm transition-all ${event.completed ? 'opacity-75' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        {event.eventItemId && (
          <div className="flex-shrink-0 pt-1">
            <button
              onClick={() => onToggleCompletion(event)}
              className="flex-shrink-0"
              title={event.completed ? "Mark as incomplete" : "Mark as complete"}
            >
              {event.completed ? (
                <CheckCircle2 className="w-5 h-5 text-primary" />
              ) : (
                <Circle className="w-5 h-5 text-border hover:text-primary transition-colors" />
              )}
            </button>
          </div>
        )}

        {/* Event Content */}
        <div className="flex-1 min-w-0">
          {/* Title Row */}
          <div className="flex items-start justify-between mb-1">
            <h3 className={`text-sm font-semibold text-foreground ${event.completed ? 'line-through' : ''}`}>
              {event.title}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
              {/* Notify Button */}
              <button
                onClick={() => onToggleNotification(event.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${event.notificationsEnabled
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                  }`}
              >
                <Bell className="w-3 h-3" />
                Notify
              </button>

              {/* Three-dot Menu */}
              <div className="relative">
                <button
                  onClick={() => onSetOpenMenuId(openMenuId === event.id ? null : event.id)}
                  className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {openMenuId === event.id && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => onSetOpenMenuId(null)} />
                    <div className="absolute right-0 top-full mt-1 w-44 bg-card border border-border rounded-lg shadow-lg z-50 py-1">
                      <button
                        onClick={() => { onEdit(event); onSetOpenMenuId(null); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => { onReschedule(event); onSetOpenMenuId(null); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        <Clock className="w-4 h-4" />
                        Reschedule
                      </button>
                      <button
                        onClick={() => { onViewDetails(event); onSetOpenMenuId(null); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      <button
                        onClick={() => { onDelete(event.id); onSetOpenMenuId(null); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <p className="text-muted-foreground text-sm line-clamp-1 mb-2">{event.description}</p>
          )}

          {/* Bottom Row: Speaker, Sync, Status, Date/Time */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              {/* Speaker/Assignee */}
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="text-xs text-muted-foreground">Speaker</span>
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="w-3 h-3 text-primary" />
                </div>
              </div>

              {/* Sync indicator */}
              <div className="flex items-center gap-1 text-muted-foreground">
                <Link2 className="w-3.5 h-3.5" />
                <span className="text-xs">Sync</span>
              </div>

              {/* Status Badge */}
              {getStatusBadge(event, timeStatus.text)}
            </div>

            {/* Date & Time */}
            <div className="flex items-center gap-3 text-muted-foreground text-xs">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{format(event.start, 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{format(event.start, 'h:mm a')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

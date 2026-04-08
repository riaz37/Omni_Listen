import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  Users,
  Link2,
  CheckCircle2,
  Bell,
} from 'lucide-react';

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

interface EventListCardProps {
  events: EventItem[];
  totalEvents: number;
}

export function EventListCard({ events, totalEvents }: EventListCardProps) {
  return (
    <div className="bg-card-2 rounded-lg border border-border p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">Event List</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {totalEvents} total analysis &middot; {events.length} shown
        </p>
      </div>
      <div className="space-y-3">
        {events.length > 0 ? events.map((event) => (
          <div
            key={event.id}
            className="bg-background rounded-lg border border-border p-4 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-medium text-foreground line-clamp-1">{event.title}</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 ml-2 flex-shrink-0">
                <Bell className="w-3 h-3" /> Notify
              </span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
              {event.description || 'No description available.'}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              <span className="inline-flex items-center gap-1">
                <Users className="w-3 h-3" /> {event.assignee || 'Speaker'}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted">
                <Link2 className="w-3 h-3" /> Sync
              </span>
              {event.completed && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Complete
                </span>
              )}
              <span className="ml-auto flex items-center gap-2">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {event.date ? format(new Date(event.date), 'MMM dd, yyyy') : ''}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {event.date ? format(new Date(event.date), 'h:mm a') : ''}
                </span>
              </span>
            </div>
          </div>
        )) : (
          <p className="text-sm text-muted-foreground text-center py-6">No events yet</p>
        )}
      </div>
    </div>
  );
}

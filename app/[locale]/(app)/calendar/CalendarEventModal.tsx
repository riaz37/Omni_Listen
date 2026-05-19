import { format } from 'date-fns';
import { Clock, MapPin, Users, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  MotionDialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import type { CalendarEvent } from '@/lib/types';

interface CalendarEventModalProps {
  event: CalendarEvent;
  calendarConnected: boolean;
  onClose: () => void;
  onSync: (event: CalendarEvent) => void;
  onNavigateToConversation: (conversationId: string) => void;
}

export function CalendarEventModal({ event, calendarConnected, onClose, onSync, onNavigateToConversation }: CalendarEventModalProps) {
  return (
    <MotionDialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 text-sm rounded-full ${event.type === 'conversation' ? 'bg-primary/10 text-text-primary' :
                event.type === 'task' ? 'bg-accent text-accent-foreground' :
                  'bg-destructive/10 text-destructive'
              }`}>
              {event.type}
            </span>
            {event.completed && (
              <span className="px-3 py-1 bg-primary/10 text-text-primary rounded-full text-sm flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Completed
              </span>
            )}
          </div>
          <DialogTitle className={event.completed ? 'line-through' : ''}>{event.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Date & Time</span>
            </div>
            <p className="text-foreground ml-6 text-sm">
              {format(event.start, 'EEEE, MMMM dd, yyyy')}
            </p>
            <p className="text-muted-foreground ml-6 text-sm">
              {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
            </p>
          </div>

          {event.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
              <p className="text-foreground text-sm [overflow-wrap:anywhere] whitespace-pre-wrap line-clamp-6">{event.description}</p>
            </div>
          )}

          {event.location && (
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">Location</span>
              </div>
              <p className="text-foreground ml-6 text-sm">{event.location}</p>
            </div>
          )}

          {event.assignee && (
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Assignee</span>
              </div>
              <p className="text-foreground ml-6 text-sm">{event.assignee}</p>
            </div>
          )}

          {event.attendees && event.attendees.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Attendees</span>
              </div>
              <div className="ml-6 space-y-1">
                {event.attendees.map((attendee, index) => (
                  <p key={index} className="text-foreground text-sm">{attendee}</p>
                ))}
              </div>
            </div>
          )}

          {/* Sync Status */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${event.synced ? 'bg-primary' : 'bg-muted-foreground'}`} />
              <span className="text-sm text-muted-foreground">
                {event.synced ? 'Synced to Calendar' : 'Not synced'}
              </span>
            </div>
            {!event.synced && calendarConnected && (
              <Button
                onClick={() => onSync(event)}
                size="sm"
              >
                Sync Now
              </Button>
            )}
          </div>
        </div>

        {event.conversationId && (
          <DialogFooter className="pt-2 border-t border-border">
            <Button
              onClick={() => onNavigateToConversation(event.conversationId!)}
              iconRight={<ChevronRight className="w-4 h-4" />}
              className="w-full"
            >
              View Conversation Details
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </MotionDialog>
  );
}

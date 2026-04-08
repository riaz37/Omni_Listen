import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  MotionDialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Clock,
  MapPin,
  Users,
  ChevronRight,
  Trash2,
  CheckCircle,
  CheckCircle2,
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
  type: 'meeting' | 'task' | 'deadline';
  synced?: boolean;
  calendarEventId?: string;
  isManual?: boolean;
  notificationsEnabled?: boolean;
  completed?: boolean;
  urgency?: 'yes' | 'no';
}

interface EventDetailModalProps {
  selectedEvent: Event;
  user: { calendar_connected?: boolean } | null;
  onClose: () => void;
  onSyncEvent: (event: Event) => void;
  onDeleteEvent: (eventId: string) => void;
  onNavigateToMeeting: (meetingId: string) => void;
  getEventTypeColor: (type: string) => string;
}

export function EventDetailModal({
  selectedEvent,
  user,
  onClose,
  onSyncEvent,
  onDeleteEvent,
  onNavigateToMeeting,
  getEventTypeColor,
}: EventDetailModalProps) {
  return (
    <MotionDialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize border ${getEventTypeColor(selectedEvent.type)}`}>
              {selectedEvent.type}
            </span>
            {selectedEvent.completed && (
              <span className="px-3 py-1 bg-primary/10 text-text-primary rounded-full text-sm flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Completed
              </span>
            )}
            {selectedEvent.synced && (
              <span className="px-3 py-1 bg-primary/10 text-text-primary rounded-full text-sm flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Synced
              </span>
            )}
          </div>
          <DialogTitle className={selectedEvent.completed ? 'line-through' : ''}>{selectedEvent.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Date & Time</span>
            </div>
            <p className="text-foreground ml-7">
              {format(selectedEvent.start, 'EEEE, MMMM dd, yyyy')}
            </p>
            <p className="text-muted-foreground ml-7">
              {format(selectedEvent.start, 'h:mm a')} - {format(selectedEvent.end, 'h:mm a')}
            </p>
          </div>

          {selectedEvent.description && (
            <div>
              <p className="font-medium text-muted-foreground mb-1">Description</p>
              <p className="text-foreground">{selectedEvent.description}</p>
            </div>
          )}

          {selectedEvent.location && (
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MapPin className="w-5 h-5" />
                <span className="font-medium">Location</span>
              </div>
              <p className="text-foreground ml-7">{selectedEvent.location}</p>
            </div>
          )}

          {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Users className="w-5 h-5" />
                <span className="font-medium">Attendees</span>
              </div>
              <div className="ml-7 space-y-1">
                {selectedEvent.attendees.map((attendee, index) => (
                  <p key={index} className="text-foreground">{attendee}</p>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 border-t border-border space-y-3">
            {!selectedEvent.synced && user?.calendar_connected && (
              <button
                onClick={() => {
                  onSyncEvent(selectedEvent);
                  onClose();
                }}
                className="w-full px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/80 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Sync to Calendar</span>
              </button>
            )}

            {selectedEvent.meetingId && (
              <Button
                onClick={() => onNavigateToMeeting(selectedEvent.meetingId!)}
                iconRight={<ChevronRight className="w-4 h-4" />}
                className="w-full"
              >
                View Meeting Details
              </Button>
            )}

            <button
              onClick={() => {
                onDeleteEvent(selectedEvent.id);
              }}
              className="w-full px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive-hover transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              <span>Delete Event</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </MotionDialog>
  );
}

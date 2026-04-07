import { format } from 'date-fns';
import { Clock, MapPin, Users, ChevronRight, CheckCircle2 } from 'lucide-react';
import PrimaryButton from '@/components/PrimaryButton';
import AnimatedModal from '@/components/ui/animated-modal';
import type { CalendarEvent } from '@/lib/types';

interface CalendarEventModalProps {
  event: CalendarEvent;
  calendarConnected: boolean;
  onClose: () => void;
  onSync: (event: CalendarEvent) => void;
  onNavigateToMeeting: (meetingId: string) => void;
}

export function CalendarEventModal({ event, calendarConnected, onClose, onSync, onNavigateToMeeting }: CalendarEventModalProps) {
  return (
    <AnimatedModal open onClose={onClose}>
      <div className="bg-card rounded-lg border border-border shadow-xl max-w-lg w-full p-6 overflow-hidden">
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0 flex-1 mr-3">
            <h2 className={`text-2xl font-bold text-foreground mb-2 break-words ${event.completed ? 'line-through' : ''}`}>{event.title}</h2>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 text-sm rounded-full ${event.type === 'meeting' ? 'bg-primary/10 text-text-primary' :
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
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Date & Time</span>
            </div>
            <p className="text-foreground ml-7">
              {format(event.start, 'EEEE, MMMM dd, yyyy')}
            </p>
            <p className="text-muted-foreground ml-7">
              {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
            </p>
          </div>

          {event.description && (
            <div>
              <p className="font-medium text-muted-foreground mb-1">Description</p>
              <p className="text-foreground text-sm break-words overflow-hidden">{event.description}</p>
            </div>
          )}

          {event.location && (
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MapPin className="w-5 h-5" />
                <span className="font-medium">Location</span>
              </div>
              <p className="text-foreground ml-7">{event.location}</p>
            </div>
          )}

          {event.assignee && (
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="w-5 h-5" />
                <span className="font-medium">Assignee</span>
              </div>
              <p className="text-foreground ml-7">{event.assignee}</p>
            </div>
          )}

          {event.attendees && event.attendees.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Users className="w-5 h-5" />
                <span className="font-medium">Attendees</span>
              </div>
              <div className="ml-7 space-y-1">
                {event.attendees.map((attendee, index) => (
                  <p key={index} className="text-foreground">{attendee}</p>
                ))}
              </div>
            </div>
          )}

          {/* Sync Status */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${event.synced ? 'bg-primary' : 'bg-muted-foreground'}`}></div>
                <span className="text-sm text-muted-foreground">
                  {event.synced ? 'Synced to Calendar' : 'Not synced'}
                </span>
              </div>
              {!event.synced && calendarConnected && (
                <PrimaryButton
                  onClick={() => onSync(event)}
                  size="sm"
                >
                  Sync Now
                </PrimaryButton>
              )}
            </div>
          </div>

          {event.meetingId && (
            <div className="pt-4 border-t border-border">
              <PrimaryButton
                onClick={() => onNavigateToMeeting(event.meetingId!)}
                icon={ChevronRight}
                iconPosition="right"
                fullWidth
              >
                View Meeting Details
              </PrimaryButton>
            </div>
          )}
        </div>
      </div>
    </AnimatedModal>
  );
}

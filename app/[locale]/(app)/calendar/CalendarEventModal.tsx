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
import { useTranslation } from '@/lib/i18n/use-translation';

interface CalendarEventModalProps {
  event: CalendarEvent;
  calendarConnected: boolean;
  onClose: () => void;
  onSync: (event: CalendarEvent) => void;
  onNavigateToConversation: (conversationId: string) => void;
}

export function CalendarEventModal({ event, calendarConnected, onClose, onSync, onNavigateToConversation }: CalendarEventModalProps) {
  const { t } = useTranslation();
  return (
    <MotionDialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 text-sm rounded-full ${event.type === 'conversation' ? 'bg-primary/10 text-text-primary' :
                event.type === 'task' ? 'bg-accent text-accent-foreground' :
                  'bg-destructive/10 text-destructive'
              }`}>
              {t(`calendar.create_modal.type_${event.type}`)}
            </span>
            {event.completed && (
              <span className="px-3 py-1 bg-primary/10 text-text-primary rounded-full text-sm flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                {t('calendar.event_modal.completed')}
              </span>
            )}
          </div>
          <DialogTitle className={event.completed ? 'line-through' : ''}>{event.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{t('calendar.event_modal.date_time')}</span>
            </div>
            <p className="text-foreground ms-6 text-sm">
              {format(event.start, 'EEEE, MMMM dd, yyyy')}
            </p>
            <p className="text-muted-foreground ms-6 text-sm">
              {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
            </p>
          </div>

          {event.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{t('calendar.event_modal.description')}</p>
              <p className="text-foreground text-sm [overflow-wrap:anywhere] whitespace-pre-wrap line-clamp-6">{event.description}</p>
            </div>
          )}

          {event.location && (
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">{t('calendar.event_modal.location')}</span>
              </div>
              <p className="text-foreground ms-6 text-sm">{event.location}</p>
            </div>
          )}

          {event.assignee && (
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">{t('calendar.event_modal.assignee')}</span>
              </div>
              <p className="text-foreground ms-6 text-sm">{event.assignee}</p>
            </div>
          )}

          {event.attendees && event.attendees.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">{t('calendar.event_modal.attendees')}</span>
              </div>
              <div className="ms-6 space-y-1">
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
                {event.synced ? t('calendar.event_modal.synced') : t('calendar.event_modal.not_synced')}
              </span>
            </div>
            {!event.synced && calendarConnected && (
              <Button
                onClick={() => onSync(event)}
                size="sm"
              >
                {t('calendar.event_modal.sync_now')}
              </Button>
            )}
          </div>
        </div>

        {event.conversationId && (
          <DialogFooter className="pt-2 border-t border-border">
            <Button
              onClick={() => onNavigateToConversation(event.conversationId!)}
              iconRight={<ChevronRight className="w-4 h-4 rtl:rotate-180" />}
              className="w-full"
            >
              {t('calendar.event_modal.view_conversation')}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </MotionDialog>
  );
}

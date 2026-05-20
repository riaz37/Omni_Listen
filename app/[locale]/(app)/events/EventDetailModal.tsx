import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  MotionDialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
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
import { useTranslation } from '@/lib/i18n/use-translation';

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
  const { t } = useTranslation();
  return (
    <MotionDialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize border ${getEventTypeColor(selectedEvent.type)}`}>
              {t(`calendar.create_modal.type_${selectedEvent.type}`)}
            </span>
            {selectedEvent.completed && (
              <span className="px-3 py-1 bg-primary/10 text-text-primary rounded-full text-sm flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                {t('events.detail_modal.completed')}
              </span>
            )}
            {selectedEvent.synced && (
              <span className="px-3 py-1 bg-primary/10 text-text-primary rounded-full text-sm flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                {t('events.detail_modal.synced')}
              </span>
            )}
          </div>
          <DialogTitle className={selectedEvent.completed ? 'line-through' : ''}>{selectedEvent.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{t('events.detail_modal.date_time')}</span>
            </div>
            <p className="text-foreground ms-6 text-sm">
              {format(selectedEvent.start, 'EEEE, MMMM dd, yyyy')}
            </p>
            <p className="text-muted-foreground ms-6 text-sm">
              {format(selectedEvent.start, 'h:mm a')} - {format(selectedEvent.end, 'h:mm a')}
            </p>
          </div>

          {selectedEvent.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{t('events.detail_modal.description')}</p>
              <p className="text-foreground text-sm [overflow-wrap:anywhere] whitespace-pre-wrap line-clamp-6">{selectedEvent.description}</p>
            </div>
          )}

          {selectedEvent.location && (
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">{t('events.detail_modal.location')}</span>
              </div>
              <p className="text-foreground ms-6 text-sm">{selectedEvent.location}</p>
            </div>
          )}

          {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">{t('events.detail_modal.attendees')}</span>
              </div>
              <div className="ms-6 space-y-1">
                {selectedEvent.attendees.map((attendee, index) => (
                  <p key={index} className="text-foreground text-sm">{attendee}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 pt-2 border-t border-border sm:flex-col">
          {!selectedEvent.synced && user?.calendar_connected && (
            <Button
              variant="secondary"
              onClick={() => {
                onSyncEvent(selectedEvent);
                onClose();
              }}
              iconLeft={<CheckCircle className="w-4 h-4" />}
              className="w-full"
            >
              {t('events.detail_modal.sync_to_calendar')}
            </Button>
          )}

          {selectedEvent.meetingId && (
            <Button
              onClick={() => onNavigateToMeeting(selectedEvent.meetingId!)}
              iconRight={<ChevronRight className="w-4 h-4 rtl:rotate-180" />}
              className="w-full"
            >
              {t('events.detail_modal.view_meeting')}
            </Button>
          )}

          <Button
            variant="destructive"
            onClick={() => onDeleteEvent(selectedEvent.id)}
            iconLeft={<Trash2 className="w-4 h-4" />}
            className="w-full"
          >
            {t('events.detail_modal.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </MotionDialog>
  );
}

import { format } from 'date-fns';
import { Circle, CheckCircle2 } from 'lucide-react';
import type { CalendarEvent } from '@/lib/types';
import { useTranslation } from '@/lib/i18n/use-translation';

interface EventListSidebarProps {
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onToggleCompletion: (event: CalendarEvent) => void;
  onClose: () => void;
}

export function EventListSidebar({ events, onSelectEvent, onToggleCompletion, onClose }: EventListSidebarProps) {
  const { t } = useTranslation();
  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      <div className="fixed end-0 top-0 h-full w-96 bg-card border-s border-border shadow-xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">{t('calendar.event_list.title')}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t('calendar.event_list.no_events')}</p>
            </div>
          ) : (
            events.map((event, index) => {
              const isMiddleCard = index === Math.floor(events.length / 2);

              if (isMiddleCard) {
                return (
                  <div
                    key={event.id}
                    className="border border-border rounded-lg p-4 hover:border-primary cursor-pointer transition-colors"
                    onClick={() => onSelectEvent(event)}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleCompletion(event);
                        }}
                        className="mt-0.5 flex-shrink-0"
                      >
                        {event.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-foreground ${event.completed ? 'line-through' : ''}`}>
                          {event.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button className="px-2 py-1 text-xs border border-border rounded text-foreground hover:bg-muted">
                          {t('calendar.event_list.notify')}
                        </button>
                        <button className="text-muted-foreground hover:text-foreground">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="ms-8 space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span>{t('calendar.event_list.speaker')} {event.assignee || '-'}</span>
                        <span>{t('calendar.event_list.sync')} {event.synced ? t('common.yes') : t('common.no')}</span>
                        <span>{t('calendar.event_list.status')} {event.completed ? t('calendar.event_list.status_done') : t('calendar.event_list.status_pending')}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span>{format(event.start, 'MMM dd, yyyy')}</span>
                        <span>{format(event.start, 'h:mm a')}</span>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={event.id}
                  className="border border-border rounded-lg p-4 hover:border-primary cursor-pointer transition-colors"
                  onClick={() => onSelectEvent(event)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-foreground">{event.title}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full flex-shrink-0 ${
                      event.type === 'deadline'
                        ? 'bg-destructive/10 text-destructive'
                        : event.type === 'conversation'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-accent text-accent-foreground'
                    }`}>
                      {t(`calendar.create_modal.type_${event.type}`)}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{event.description}</p>
                  )}
                  <div className="flex items-center gap-3">
                    {event.attendees && event.attendees.length > 0 && (
                      <div className="flex -space-x-2">
                        {event.attendees.slice(0, 3).map((_, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs text-muted-foreground"
                          >
                            👤
                          </div>
                        ))}
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground">{format(event.start, 'MMM dd, yyyy')}</span>
                    <span className="text-xs text-muted-foreground">{format(event.start, 'h:mm a')}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

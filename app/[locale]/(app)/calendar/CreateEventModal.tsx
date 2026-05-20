import { CalendarDays, Clock, MapPin, FileText, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  MotionDialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import CustomDropdown from '@/components/ui/custom-dropdown';
import DatePicker from '@/components/ui/date-picker';
import TimePicker from '@/components/ui/time-picker';
import { useTranslation } from '@/lib/i18n/use-translation';

interface NewEventData {
  title: string;
  start: string;
  end: string;
  type: 'conversation' | 'task' | 'deadline';
  description: string;
  location: string;
}

interface CreateEventModalProps {
  newEvent: NewEventData;
  onNewEventChange: (event: NewEventData) => void;
  onClose: () => void;
  onSubmit: () => void;
}

function splitDateTime(dateTimeStr: string): { date: string; time: string } {
  if (!dateTimeStr) return { date: '', time: '' };
  if (dateTimeStr.includes('T')) {
    const [date, time] = dateTimeStr.split('T');
    return { date, time: time?.slice(0, 5) || '' };
  }
  return { date: dateTimeStr, time: '' };
}

function combineDateTime(date: string, time: string): string {
  if (!date) return '';
  if (!time) return date;
  return `${date}T${time}`;
}

export function CreateEventModal({ newEvent, onNewEventChange, onClose, onSubmit }: CreateEventModalProps) {
  const { t } = useTranslation();
  const startParts = splitDateTime(newEvent.start);
  const endParts = splitDateTime(newEvent.end);

  return (
    <MotionDialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('calendar.create_modal.title')}</DialogTitle>
          <DialogDescription>{t('calendar.create_modal.desc')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-1">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="event-title">{t('calendar.create_modal.label_title')}</Label>
            <Input
              id="event-title"
              value={newEvent.title}
              onChange={(e) => onNewEventChange({ ...newEvent, title: e.target.value })}
              placeholder={t('calendar.create_modal.placeholder_title')}
              maxLength={100}
              autoFocus
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-muted-foreground" />
              {t('calendar.create_modal.label_type')}
            </Label>
            <CustomDropdown
              value={newEvent.type}
              onChange={(val) => onNewEventChange({ ...newEvent, type: val as 'conversation' | 'task' | 'deadline' })}
              options={[
                { value: 'conversation', label: t('calendar.create_modal.type_conversation') },
                { value: 'task', label: t('calendar.create_modal.type_task') },
                { value: 'deadline', label: t('calendar.create_modal.type_deadline') },
              ]}
              className="w-full"
            />
          </div>

          {/* Date & Time Section */}
          <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
            {/* Start */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                {t('calendar.create_modal.label_starts')}
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <DatePicker
                  value={startParts.date}
                  onChange={(date) =>
                    onNewEventChange({ ...newEvent, start: combineDateTime(date, startParts.time) })
                  }
                  placeholder={t('calendar.create_modal.placeholder_date')}
                />
                <TimePicker
                  value={startParts.time}
                  onChange={(time) =>
                    onNewEventChange({ ...newEvent, start: combineDateTime(startParts.date, time) })
                  }
                  placeholder={t('calendar.create_modal.placeholder_time')}
                />
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">{t('calendar.create_modal.label_to')}</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* End */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                {t('calendar.create_modal.label_ends')}
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <DatePicker
                  value={endParts.date}
                  onChange={(date) =>
                    onNewEventChange({ ...newEvent, end: combineDateTime(date, endParts.time) })
                  }
                  placeholder={t('calendar.create_modal.placeholder_date')}
                />
                <TimePicker
                  value={endParts.time}
                  onChange={(time) =>
                    onNewEventChange({ ...newEvent, end: combineDateTime(endParts.date, time) })
                  }
                  placeholder={t('calendar.create_modal.placeholder_time')}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="event-location" className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              {t('calendar.create_modal.label_location')}
            </Label>
            <Input
              id="event-location"
              value={newEvent.location}
              onChange={(e) => onNewEventChange({ ...newEvent, location: e.target.value })}
              placeholder={t('calendar.create_modal.placeholder_location')}
              maxLength={200}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="event-description" className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              {t('calendar.create_modal.label_description')}
            </Label>
            <Textarea
              id="event-description"
              value={newEvent.description}
              onChange={(e) => onNewEventChange({ ...newEvent, description: e.target.value })}
              rows={3}
              maxLength={500}
              placeholder={t('calendar.create_modal.placeholder_description')}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2 border-t border-border sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={onSubmit}>
            {t('calendar.create_modal.add_btn')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </MotionDialog>
  );
}

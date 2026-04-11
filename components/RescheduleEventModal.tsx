'use client';

import { useState, useEffect } from 'react';
import { CalendarDays, Clock, Save, Info } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  MotionDialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import DatePicker from '@/components/ui/date-picker';
import TimePicker from '@/components/ui/time-picker';

interface Event {
  id: number;
  title: string;
  date: string;
  time?: string;
}

interface RescheduleEventModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventId: number, updates: {
    date?: string;
    time?: string;
  }) => Promise<void>;
}

export default function RescheduleEventModal({ event, isOpen, onClose, onSave }: RescheduleEventModalProps) {
  const getInitialDate = () => {
    if (!event.date) return '';
    try {
      if (event.date.includes('T')) {
        return event.date.split('T')[0];
      }
      return event.date;
    } catch {
      return '';
    }
  };

  const getInitialTime = () => {
    if (event.time) return event.time;
    if (!event.date) return '';
    try {
      if (event.date.includes('T')) {
        const parsed = parseISO(event.date);
        return format(parsed, 'HH:mm');
      }
    } catch {
      return '';
    }
    return '';
  };

  const [formData, setFormData] = useState({
    date: getInitialDate(),
    time: getInitialTime(),
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData({
      date: getInitialDate(),
      time: getInitialTime(),
    });
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updates: any = {};
      const initialDate = getInitialDate();
      const initialTime = getInitialTime();

      if (formData.date !== initialDate) updates.date = formData.date;
      if (formData.time !== initialTime) updates.time = formData.time;

      if (Object.keys(updates).length > 0) {
        await onSave(event.id, updates);
      }
      onClose();
    } catch (error) {
    } finally {
      setIsSaving(false);
    }
  };

  const getCurrentSchedule = () => {
    try {
      if (event.date) {
        if (event.date.includes('T')) {
          const parsed = parseISO(event.date);
          return format(parsed, 'PPP p');
        }
        return format(parseISO(event.date), 'PPP');
      }
    } catch {
      return 'Unknown';
    }
    return 'Unknown';
  };

  return (
    <MotionDialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule Event</DialogTitle>
          <DialogDescription>{event.title}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-1">
          {/* Current Schedule Info */}
          <div className="flex items-start gap-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-3">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Currently scheduled for <strong>{getCurrentSchedule()}</strong>
            </p>
          </div>

          {/* New Date & Time */}
          <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                New Date
              </Label>
              <DatePicker
                value={formData.date}
                onChange={(date) => setFormData({ ...formData, date })}
                placeholder="Pick a new date"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                Time
              </Label>
              <TimePicker
                value={formData.time}
                onChange={(time) => setFormData({ ...formData, time })}
                placeholder="Leave empty for all-day"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for an all-day event
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2 border-t border-border sm:justify-between">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              loading={isSaving}
              iconLeft={<Save className="w-4 h-4" />}
            >
              {isSaving ? 'Saving...' : 'Reschedule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </MotionDialog>
  );
}

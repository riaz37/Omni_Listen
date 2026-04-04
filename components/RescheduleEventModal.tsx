'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Save } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import AnimatedModal from '@/components/ui/animated-modal';

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
  // Extract current date and time from event
  const getInitialDate = () => {
    if (!event.date) return '';
    try {
      // If date is ISO string with time
      if (event.date.includes('T')) {
        return event.date.split('T')[0];
      }
      // If date is already in YYYY-MM-DD format
      return event.date;
    } catch {
      return '';
    }
  };

  const getInitialTime = () => {
    // First check if event has a separate time field
    if (event.time) return event.time;

    // Otherwise try to extract from date string
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

  // Update form data when event changes
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
      // Only send fields that have changed
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

  // Format current schedule for display
  const getCurrentSchedule = () => {
    try {
      if (event.date) {
        if (event.date.includes('T')) {
          const parsed = parseISO(event.date);
          return format(parsed, 'PPP p'); // "Jan 1, 2025 at 10:00 AM"
        }
        return format(parseISO(event.date), 'PPP'); // "Jan 1, 2025"
      }
    } catch {
      return 'Unknown';
    }
    return 'Unknown';
  };

  return (
    <AnimatedModal open={isOpen} onClose={onClose}>
      <div className="bg-card-2 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Reschedule Event
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {event.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Current Schedule Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Current schedule:</strong> {getCurrentSchedule()}
            </p>
          </div>

          {/* Date Input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Calendar className="w-4 h-4 inline-block mr-2" />
              New Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-muted text-foreground"
              required
            />
          </div>

          {/* Time Input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Clock className="w-4 h-4 inline-block mr-2" />
              Time (optional)
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-muted text-foreground"
              placeholder="Leave empty for all-day event"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave empty for an all-day event
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Reschedule'}
            </button>
          </div>
        </form>
      </div>
    </AnimatedModal>
  );
}

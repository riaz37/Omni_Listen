'use client';

import { useState, useEffect } from 'react';
import { CalendarDays, MapPin, FileText, User, Save } from 'lucide-react';
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
} from '@/components/ui/dialog';
import DatePicker from '@/components/ui/date-picker';
import { useTranslation } from '@/lib/i18n/use-translation';

interface Event {
  id: number;
  title: string;
  date: string;
  description?: string;
  location?: string;
  assignee?: string;
}

interface EditEventModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventId: number, updates: {
    title?: string;
    date?: string;
    description?: string;
    location?: string;
    assignee?: string;
  }) => Promise<void>;
}

export default function EditEventModal({ event, isOpen, onClose, onSave }: EditEventModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: event.title || '',
    date: event.date || '',
    description: event.description || '',
    location: event.location || '',
    assignee: event.assignee || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData({
      title: event.title || '',
      date: event.date || '',
      description: event.description || '',
      location: event.location || '',
      assignee: event.assignee || '',
    });
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updates: any = {};
      if (formData.title !== event.title) updates.title = formData.title;
      if (formData.date !== event.date) updates.date = formData.date;
      if (formData.description !== event.description) updates.description = formData.description;
      if (formData.location !== event.location) updates.location = formData.location;
      if (formData.assignee !== event.assignee) updates.assignee = formData.assignee;

      await onSave(event.id, updates);
      onClose();
    } catch (error) {
    } finally {
      setIsSaving(false);
    }
  };

  const dateValue = formData.date.includes('T') ? formData.date.split('T')[0] : formData.date;

  return (
    <MotionDialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('events.edit_modal.title')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-1">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-title">{t('events.edit_modal.label_title')}</Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
              {t('events.edit_modal.label_date')}
            </Label>
            <DatePicker
              value={dateValue}
              onChange={(date) => setFormData({ ...formData, date })}
              placeholder={t('events.edit_modal.placeholder_date')}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description" className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              {t('events.edit_modal.label_description')}
            </Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder={t('events.edit_modal.placeholder_description')}
              className="resize-none"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="edit-location" className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              {t('events.edit_modal.label_location')}
            </Label>
            <Input
              id="edit-location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder={t('events.edit_modal.placeholder_location')}
            />
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <Label htmlFor="edit-assignee" className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              {t('events.edit_modal.label_assignee')}
            </Label>
            <Input
              id="edit-assignee"
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              placeholder={t('events.edit_modal.placeholder_assignee')}
            />
          </div>

          <DialogFooter className="gap-2 pt-2 border-t border-border sm:justify-between">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              loading={isSaving}
              iconLeft={<Save className="w-4 h-4" />}
            >
              {isSaving ? t('events.edit_modal.saving') : t('events.edit_modal.save_changes')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </MotionDialog>
  );
}

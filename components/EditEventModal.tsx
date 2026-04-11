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
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-1">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
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
              Date
            </Label>
            <DatePicker
              value={dateValue}
              onChange={(date) => setFormData({ ...formData, date })}
              placeholder="Select date"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description" className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              Description
            </Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Add event description..."
              className="resize-none"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="edit-location" className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              Location
            </Label>
            <Input
              id="edit-location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Add location..."
            />
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <Label htmlFor="edit-assignee" className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              Assignee
            </Label>
            <Input
              id="edit-assignee"
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              placeholder="Assign to..."
            />
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
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </MotionDialog>
  );
}

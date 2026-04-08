'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, FileText, User, Save } from 'lucide-react';
import {
  MotionDialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

  // Update form data when event changes
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
      // Only send fields that have changed
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

  return (
    <MotionDialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <FileText className="w-4 h-4 inline-block mr-2" />
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-muted text-foreground"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Calendar className="w-4 h-4 inline-block mr-2" />
              Date
            </label>
            <input
              type="date"
              value={formData.date.split('T')[0]} // Extract date part from ISO string
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-muted text-foreground"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <FileText className="w-4 h-4 inline-block mr-2" />
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-muted text-foreground resize-none"
              placeholder="Add event description..."
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <MapPin className="w-4 h-4 inline-block mr-2" />
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-muted text-foreground"
              placeholder="Add location..."
            />
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <User className="w-4 h-4 inline-block mr-2" />
              Assignee
            </label>
            <input
              type="text"
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-muted text-foreground"
              placeholder="Assign to..."
            />
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
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </DialogContent>
    </MotionDialog>
  );
}

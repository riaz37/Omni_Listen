'use client';

import { useState, useEffect } from 'react';
import { FileText, AlignLeft, Tag, Save } from 'lucide-react';
import {
  MotionDialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import CustomDropdown from '@/components/ui/custom-dropdown';

interface Note {
  id: number;
  title: string;
  description: string;
  category: string;
}

interface EditNoteModalProps {
  note: Note;
  isOpen: boolean;
  onClose: () => void;
  onSave: (noteId: number, updates: {
    title?: string;
    description?: string;
    category?: string;
  }) => Promise<void>;
}

export default function EditNoteModal({ note, isOpen, onClose, onSave }: EditNoteModalProps) {
  const [formData, setFormData] = useState({
    title: note.title || '',
    description: note.description || '',
    category: note.category || 'GENERAL',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Update form data when note changes
  useEffect(() => {
    setFormData({
      title: note.title || '',
      description: note.description || '',
      category: note.category || 'GENERAL',
    });
  }, [note]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Only send fields that have changed
      const updates: any = {};
      if (formData.title !== note.title) updates.title = formData.title;
      if (formData.description !== note.description) updates.description = formData.description;
      if (formData.category !== note.category) updates.category = formData.category;

      await onSave(note.id, updates);
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
          <DialogTitle>Edit Note</DialogTitle>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Tag className="w-4 h-4 inline-block mr-2" />
              Category
            </label>
            <CustomDropdown
              value={formData.category}
              onChange={(val) => setFormData({ ...formData, category: val })}
              options={[
                { value: 'GENERAL', label: 'General' },
                { value: 'BUDGET', label: 'Budget' },
                { value: 'DECISION', label: 'Decision' },
              ]}
              className="w-full"
            />
          </div>

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
              className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              required
              placeholder="Enter note title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <AlignLeft className="w-4 h-4 inline-block mr-2" />
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
              required
              placeholder="Enter note description"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 text-sm font-medium text-foreground bg-muted border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

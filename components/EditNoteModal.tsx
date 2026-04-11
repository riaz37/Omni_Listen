'use client';

import { useState, useEffect } from 'react';
import { FileText, AlignLeft, Tag, Save } from 'lucide-react';
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

        <form onSubmit={handleSubmit} className="space-y-5 py-1">
          {/* Category */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-muted-foreground" />
              Category
            </Label>
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
          <div className="space-y-2">
            <Label htmlFor="edit-note-title" className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              Title
            </Label>
            <Input
              id="edit-note-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Enter note title"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-note-description" className="flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-muted-foreground" />
              Description
            </Label>
            <Textarea
              id="edit-note-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              required
              placeholder="Enter note description"
              className="resize-none"
            />
          </div>

          <DialogFooter className="gap-2 pt-2 border-t border-border sm:justify-between">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
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

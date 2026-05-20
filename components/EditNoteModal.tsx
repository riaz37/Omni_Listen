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
import { useTranslation } from '@/lib/i18n/use-translation';

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
  const { t } = useTranslation();
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
          <DialogTitle>{t('notes.edit_modal.title')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-1">
          {/* Category */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-muted-foreground" />
              {t('notes.edit_modal.label_category')}
            </Label>
            <CustomDropdown
              value={formData.category}
              onChange={(val) => setFormData({ ...formData, category: val })}
              options={[
                { value: 'GENERAL', label: t('notes.category_general') },
                { value: 'BUDGET', label: t('notes.stat_budget') },
                { value: 'DECISION', label: t('notes.category_decision') },
              ]}
              className="w-full"
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-note-title" className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              {t('notes.edit_modal.label_title')}
            </Label>
            <Input
              id="edit-note-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder={t('notes.edit_modal.placeholder_title')}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-note-description" className="flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-muted-foreground" />
              {t('notes.edit_modal.label_description')}
            </Label>
            <Textarea
              id="edit-note-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              required
              placeholder={t('notes.edit_modal.placeholder_description')}
              className="resize-none"
            />
          </div>

          <DialogFooter className="gap-2 pt-2 border-t border-border sm:justify-between">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              loading={isSaving}
              iconLeft={<Save className="w-4 h-4" />}
            >
              {isSaving ? t('notes.edit_modal.saving') : t('notes.edit_modal.save_changes')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </MotionDialog>
  );
}

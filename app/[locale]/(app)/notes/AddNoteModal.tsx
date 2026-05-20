import { format } from 'date-fns';
import { MessageSquare, Tag, FileText, AlignLeft } from 'lucide-react';
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
import { useTranslation } from '@/lib/i18n/use-translation';

interface NewNoteData {
  title: string;
  description: string;
  category: string;
  meetingId: string;
}

interface AddNoteModalProps {
  show: boolean;
  onClose: () => void;
  newNoteData: NewNoteData;
  setNewNoteData: (data: NewNoteData) => void;
  meetings: any[];
  onSubmit: () => void;
}

export function AddNoteModal({
  show,
  onClose,
  newNoteData,
  setNewNoteData,
  meetings,
  onSubmit,
}: AddNoteModalProps) {
  const { t } = useTranslation();
  return (
    <MotionDialog open={show} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('notes.add_modal.title')}</DialogTitle>
          <DialogDescription>{t('notes.add_modal.desc')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-1">
          {/* Select Meeting */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
              {t('notes.add_modal.label_meeting')}
            </Label>
            <CustomDropdown
              value={newNoteData.meetingId}
              onChange={(val) => setNewNoteData({ ...newNoteData, meetingId: val })}
              options={[
                { value: '', label: t('notes.add_modal.select_meeting') },
                ...meetings.map((meeting) => ({
                  value: meeting.job_id,
                  label: `${format(new Date(meeting.created_at), 'MMM dd, yyyy')} - ${t('notes.add_modal.meeting_suffix')}`,
                })),
              ]}
              className="w-full"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-muted-foreground" />
              {t('notes.add_modal.label_category')}
            </Label>
            <CustomDropdown
              value={newNoteData.category}
              onChange={(val) => setNewNoteData({ ...newNoteData, category: val })}
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
            <Label htmlFor="note-title" className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              {t('notes.add_modal.label_title')}
            </Label>
            <Input
              id="note-title"
              value={newNoteData.title}
              onChange={(e) => setNewNoteData({ ...newNoteData, title: e.target.value })}
              placeholder={t('notes.add_modal.placeholder_title')}
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="note-description" className="flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-muted-foreground" />
              {t('notes.add_modal.label_description')}
            </Label>
            <Textarea
              id="note-description"
              value={newNoteData.description}
              onChange={(e) => setNewNoteData({ ...newNoteData, description: e.target.value })}
              placeholder={t('notes.add_modal.placeholder_description')}
              maxLength={500}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2 border-t border-border sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={onSubmit}>
            {t('notes.add_modal.add_btn')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </MotionDialog>
  );
}

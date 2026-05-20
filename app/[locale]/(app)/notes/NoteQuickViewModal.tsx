import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  MotionDialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from '@/lib/i18n/use-translation';

interface Note {
  id: string;
  title: string;
  description: string;
  category: string;
  date?: Date;
  meetingId: string;
  meetingTitle?: string;
  type?: string;
  completed?: boolean;
  urgency?: 'yes' | 'no';
}

interface NoteQuickViewModalProps {
  note: Note;
  onClose: () => void;
  onViewDetails: (meetingId: string) => void;
}

export function NoteQuickViewModal({
  note,
  onClose,
  onViewDetails,
}: NoteQuickViewModalProps) {
  const { t } = useTranslation();
  return (
    <MotionDialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('notes.quick_view.title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div>
            <h3 className="font-semibold text-foreground mb-2">{note.title}</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note.description}</p>
          </div>

          {note.meetingId && (
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
              <p className="text-sm font-medium text-foreground">{t('notes.quick_view.from_meeting')}</p>
              <p className="text-sm text-muted-foreground">{note.meetingTitle}</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-2 border-t border-border sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            {t('common.close')}
          </Button>
          {note.meetingId && (
            <Button
              onClick={() => onViewDetails(note.meetingId)}
              iconRight={<ChevronRight className="w-4 h-4 rtl:rotate-180" />}
            >
              {t('notes.quick_view.view_details')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </MotionDialog>
  );
}

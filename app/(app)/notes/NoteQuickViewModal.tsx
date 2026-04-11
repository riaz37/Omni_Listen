import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  MotionDialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';

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
  return (
    <MotionDialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Note Quick View</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div>
            <h3 className="font-semibold text-foreground mb-2">{note.title}</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note.description}</p>
          </div>

          {note.meetingId && (
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
              <p className="text-sm font-medium text-foreground">From Meeting</p>
              <p className="text-sm text-muted-foreground">{note.meetingTitle}</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-2 border-t border-border sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {note.meetingId && (
            <Button
              onClick={() => onViewDetails(note.meetingId)}
              iconRight={<ChevronRight className="w-4 h-4" />}
            >
              View Details
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </MotionDialog>
  );
}

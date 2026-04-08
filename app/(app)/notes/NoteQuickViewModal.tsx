import { Button } from '@/components/ui/button';
import {
  MotionDialog,
  DialogContent,
  DialogHeader,
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

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-foreground mb-2">{note.title}</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note.description}</p>
          </div>

          {note.meetingId && (
            <div>
              <p className="font-semibold text-foreground text-sm">From Meeting</p>
              <p className="text-sm text-muted-foreground">{note.meetingTitle}</p>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              Cancel
            </button>
            {note.meetingId && (
              <Button onClick={() => onViewDetails(note.meetingId)}>
                View Details
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </MotionDialog>
  );
}

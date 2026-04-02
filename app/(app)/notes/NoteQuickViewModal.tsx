import { X } from 'lucide-react';
import PrimaryButton from '@/components/PrimaryButton';

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
    <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-foreground">Note Quick View</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
              <PrimaryButton onClick={() => onViewDetails(note.meetingId)}>
                View Details
              </PrimaryButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

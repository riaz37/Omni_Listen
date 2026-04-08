import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  MotionDialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import CustomDropdown from '@/components/ui/custom-dropdown';

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
  return (
    <MotionDialog open={show} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
          <DialogDescription>Add new task</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Select Meeting */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Select Meting
            </label>
            <CustomDropdown
              value={newNoteData.meetingId}
              onChange={(val) => setNewNoteData({ ...newNoteData, meetingId: val })}
              options={[
                { value: '', label: 'Select a meeting...' },
                ...meetings.map((meeting) => ({
                  value: meeting.job_id,
                  label: `${format(new Date(meeting.created_at), 'MMM dd, yyyy')} - Meeting`,
                })),
              ]}
              className="w-full"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Category
            </label>
            <CustomDropdown
              value={newNoteData.category}
              onChange={(val) => setNewNoteData({ ...newNoteData, category: val })}
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
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={newNoteData.title}
              onChange={(e) => setNewNoteData({ ...newNoteData, title: e.target.value })}
              placeholder="I need help with..."
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Description
            </label>
            <textarea
              value={newNoteData.description}
              onChange={(e) => setNewNoteData({ ...newNoteData, description: e.target.value })}
              placeholder="Please include all information relevant to your issue."
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              Cancel
            </button>
            <Button onClick={onSubmit}>
              Add
            </Button>
          </div>
        </div>
      </DialogContent>
    </MotionDialog>
  );
}

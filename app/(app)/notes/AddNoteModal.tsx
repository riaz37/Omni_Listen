import { format } from 'date-fns';
import { X } from 'lucide-react';
import PrimaryButton from '@/components/PrimaryButton';
import AnimatedModal from '@/components/ui/animated-modal';

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
    <AnimatedModal open={show} onClose={onClose}>
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Add Note</h2>
            <p className="text-sm text-muted-foreground">Add new task</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Select Meeting */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Select Meting
            </label>
            <select
              value={newNoteData.meetingId}
              onChange={(e) => setNewNoteData({ ...newNoteData, meetingId: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value="">Select a meeting...</option>
              {meetings.map((meeting) => (
                <option key={meeting.job_id} value={meeting.job_id}>
                  {format(new Date(meeting.created_at), 'MMM dd, yyyy')} - Meeting
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Category
            </label>
            <select
              value={newNoteData.category}
              onChange={(e) => setNewNoteData({ ...newNoteData, category: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value="GENERAL">General</option>
              <option value="BUDGET">Budget</option>
              <option value="DECISION">Decision</option>
            </select>
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
            <PrimaryButton onClick={onSubmit}>
              Add
            </PrimaryButton>
          </div>
        </div>
      </div>
    </AnimatedModal>
  );
}

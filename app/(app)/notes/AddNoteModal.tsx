import { format } from 'date-fns';
import { X } from 'lucide-react';
import PrimaryButton from '@/components/PrimaryButton';
import AnimatedModal from '@/components/ui/animated-modal';
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
            <PrimaryButton onClick={onSubmit}>
              Add
            </PrimaryButton>
          </div>
        </div>
      </div>
    </AnimatedModal>
  );
}

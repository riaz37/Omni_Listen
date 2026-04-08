import { Button } from '@/components/ui/button';
import {
  MotionDialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import CustomDropdown from '@/components/ui/custom-dropdown';

interface NewEventData {
  title: string;
  start: string;
  end: string;
  type: 'conversation' | 'task' | 'deadline';
  description: string;
  location: string;
}

interface CreateEventModalProps {
  newEvent: NewEventData;
  onNewEventChange: (event: NewEventData) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const inputClass =
  'w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 text-sm';

const selectClass =
  'w-full px-3 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 text-sm cursor-pointer [&>option]:bg-card [&>option]:text-foreground';

export function CreateEventModal({ newEvent, onNewEventChange, onClose, onSubmit }: CreateEventModalProps) {
  return (
    <MotionDialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Event</DialogTitle>
          <DialogDescription>Add new task</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Title</label>
            <input
              type="text"
              value={newEvent.title}
              onChange={(e) => onNewEventChange({ ...newEvent, title: e.target.value })}
              className={inputClass}
              placeholder="Event title"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Type</label>
            <CustomDropdown
              value={newEvent.type}
              onChange={(val) => onNewEventChange({ ...newEvent, type: val as 'conversation' | 'task' | 'deadline' })}
              options={[
                { value: 'conversation', label: 'Conversation' },
                { value: 'task', label: 'Task' },
                { value: 'deadline', label: 'Deadline' },
              ]}
              className="w-full"
            />
          </div>

          {/* Start Date & Time */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Start Date & Time</label>
            <input
              type="datetime-local"
              value={newEvent.start}
              onChange={(e) => onNewEventChange({ ...newEvent, start: e.target.value })}
              className={inputClass}
            />
          </div>

          {/* End Date & Time */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">End Date & Time</label>
            <input
              type="datetime-local"
              value={newEvent.end}
              onChange={(e) => onNewEventChange({ ...newEvent, end: e.target.value })}
              className={inputClass}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
            <textarea
              value={newEvent.description}
              onChange={(e) => onNewEventChange({ ...newEvent, description: e.target.value })}
              className={inputClass}
              rows={3}
              placeholder="Event description"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Location</label>
            <input
              type="text"
              value={newEvent.location}
              onChange={(e) => onNewEventChange({ ...newEvent, location: e.target.value })}
              className={inputClass}
              placeholder="Event location"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-border text-foreground rounded-lg hover:bg-muted transition-colors text-sm font-medium"
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

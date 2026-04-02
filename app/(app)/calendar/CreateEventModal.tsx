import PrimaryButton from '@/components/PrimaryButton';

interface NewEventData {
  title: string;
  start: string;
  end: string;
  type: 'meeting' | 'task' | 'deadline';
  description: string;
  location: string;
}

interface CreateEventModalProps {
  newEvent: NewEventData;
  onNewEventChange: (event: NewEventData) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function CreateEventModal({ newEvent, onNewEventChange, onClose, onSubmit }: CreateEventModalProps) {
  return (
    <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-card rounded-lg border border-border shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Add Event</h2>
            <p className="text-sm text-muted-foreground">Add new task</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 mt-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Title</label>
            <input
              type="text"
              value={newEvent.title}
              onChange={(e) => onNewEventChange({ ...newEvent, title: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="I need help with..."
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Type</label>
            <select
              value={newEvent.type}
              onChange={(e) => onNewEventChange({ ...newEvent, type: e.target.value as any })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="meeting">Metting</option>
              <option value="task">Task</option>
              <option value="deadline">Deadline</option>
            </select>
          </div>

          {/* Start Date & Time */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Start Date & Time</label>
            <input
              type="datetime-local"
              value={newEvent.start}
              onChange={(e) => onNewEventChange({ ...newEvent, start: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Select Date"
            />
          </div>

          {/* End Date & Time */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">End Date & Time</label>
            <input
              type="datetime-local"
              value={newEvent.end}
              onChange={(e) => onNewEventChange({ ...newEvent, end: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Select Date"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea
              value={newEvent.description}
              onChange={(e) => onNewEventChange({ ...newEvent, description: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              placeholder="Event description"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Location</label>
            <input
              type="text"
              value={newEvent.location}
              onChange={(e) => onNewEventChange({ ...newEvent, location: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="I need help with..."
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <PrimaryButton onClick={onSubmit}>
              Add
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { X } from 'lucide-react';
import PrimaryButton from '@/components/PrimaryButton';
import AnimatedModal from '@/components/ui/animated-modal';
import CustomDropdown from '@/components/ui/custom-dropdown';

interface NewTaskData {
  title: string;
  description: string;
  date: string;
  urgency: 'yes' | 'no';
}

interface AddTaskModalProps {
  show: boolean;
  newTask: NewTaskData;
  onNewTaskChange: (task: NewTaskData) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function AddTaskModal({ show, newTask, onNewTaskChange, onClose, onSubmit }: AddTaskModalProps) {
  return (
    <AnimatedModal open={show} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Add task</h2>
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
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => onNewTaskChange({ ...newTask, title: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground text-sm"
              placeholder="I need help with..."
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Due Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={newTask.date}
                onChange={(e) => onNewTaskChange({ ...newTask, date: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                placeholder="Select Date"
              />
            </div>
          </div>

          {/* Select Urgency */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Select Urgency
            </label>
            <CustomDropdown
              value={newTask.urgency}
              onChange={(val) => onNewTaskChange({ ...newTask, urgency: val as 'yes' | 'no' })}
              options={[
                { value: 'yes', label: 'Urgent' },
                { value: 'no', label: 'Normal' },
              ]}
              className="w-full"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Description
            </label>
            <textarea
              value={newTask.description}
              onChange={(e) => onNewTaskChange({ ...newTask, description: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground text-sm"
              placeholder="Please include all information relevant to your issue."
              rows={4}
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

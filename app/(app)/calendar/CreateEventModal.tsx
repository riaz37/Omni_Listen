import { CalendarDays, Clock, MapPin, FileText, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  MotionDialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import CustomDropdown from '@/components/ui/custom-dropdown';
import DatePicker from '@/components/ui/date-picker';
import TimePicker from '@/components/ui/time-picker';

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

function splitDateTime(dateTimeStr: string): { date: string; time: string } {
  if (!dateTimeStr) return { date: '', time: '' };
  if (dateTimeStr.includes('T')) {
    const [date, time] = dateTimeStr.split('T');
    return { date, time: time?.slice(0, 5) || '' };
  }
  return { date: dateTimeStr, time: '' };
}

function combineDateTime(date: string, time: string): string {
  if (!date) return '';
  if (!time) return date;
  return `${date}T${time}`;
}

export function CreateEventModal({ newEvent, onNewEventChange, onClose, onSubmit }: CreateEventModalProps) {
  const startParts = splitDateTime(newEvent.start);
  const endParts = splitDateTime(newEvent.end);

  return (
    <MotionDialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Event</DialogTitle>
          <DialogDescription>Create a new event on your calendar</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-1">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="event-title">Title</Label>
            <Input
              id="event-title"
              value={newEvent.title}
              onChange={(e) => onNewEventChange({ ...newEvent, title: e.target.value })}
              placeholder="What's this event about?"
              maxLength={100}
              autoFocus
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-muted-foreground" />
              Type
            </Label>
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

          {/* Date & Time Section */}
          <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
            {/* Start */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                Starts
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <DatePicker
                  value={startParts.date}
                  onChange={(date) =>
                    onNewEventChange({ ...newEvent, start: combineDateTime(date, startParts.time) })
                  }
                  placeholder="Date"
                />
                <TimePicker
                  value={startParts.time}
                  onChange={(time) =>
                    onNewEventChange({ ...newEvent, start: combineDateTime(startParts.date, time) })
                  }
                  placeholder="Time"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">to</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* End */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                Ends
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <DatePicker
                  value={endParts.date}
                  onChange={(date) =>
                    onNewEventChange({ ...newEvent, end: combineDateTime(date, endParts.time) })
                  }
                  placeholder="Date"
                />
                <TimePicker
                  value={endParts.time}
                  onChange={(time) =>
                    onNewEventChange({ ...newEvent, end: combineDateTime(endParts.date, time) })
                  }
                  placeholder="Time"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="event-location" className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              Location
            </Label>
            <Input
              id="event-location"
              value={newEvent.location}
              onChange={(e) => onNewEventChange({ ...newEvent, location: e.target.value })}
              placeholder="Add a location"
              maxLength={200}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="event-description" className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              Description
            </Label>
            <Textarea
              id="event-description"
              value={newEvent.description}
              onChange={(e) => onNewEventChange({ ...newEvent, description: e.target.value })}
              rows={3}
              maxLength={500}
              placeholder="Add details about this event..."
            />
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2 border-t border-border sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            Add Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </MotionDialog>
  );
}

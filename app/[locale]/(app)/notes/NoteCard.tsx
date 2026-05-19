import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Calendar,
  CheckCircle,
  MoreVertical,
  Clock,
  Eye,
  Trash2,
} from 'lucide-react';
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from '@/components/ui/dropdown';

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

interface NoteCardProps {
  note: Note;
  isSelected: boolean;
  onToggleSelect: (noteId: string) => void;
  onView: (note: Note) => void;
  onDelete: (noteId: string) => void;
  getCategoryBadgeColor: (category: string) => string;
}

export function NoteCard({
  note,
  isSelected,
  onToggleSelect,
  onView,
  onDelete,
  getCategoryBadgeColor,
}: NoteCardProps) {
  return (
    <div
      className={`bg-card rounded-lg border border-border p-4 hover:shadow-sm transition-all ${note.completed ? 'opacity-75' : ''}`}
    >
      {/* Top row: checkbox + title + badge + menu */}
      <div className="flex items-start gap-2 mb-2">
        <div className="flex-shrink-0 pt-0.5">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(note.id)}
          />
        </div>
        {note.completed && (
          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
        )}
        <h3 className={`text-sm font-semibold text-foreground flex-1 line-clamp-2 ${note.completed ? 'line-through' : ''}`}>
          {note.title}
        </h3>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 capitalize ${getCategoryBadgeColor(note.category)}`}>
          {note.category}
        </span>
        <div className="flex-shrink-0">
          <Dropdown>
            <DropdownTrigger className="p-0.5 text-muted-foreground hover:text-foreground rounded transition-colors">
              <MoreVertical className="w-4 h-4" />
            </DropdownTrigger>
            <DropdownContent align="end">
              <DropdownItem icon={Eye} onClick={() => onView(note)}>
                View Details
              </DropdownItem>
              <DropdownItem icon={Trash2} destructive onClick={() => onDelete(note.id)}>
                Delete
              </DropdownItem>
            </DropdownContent>
          </Dropdown>
        </div>
      </div>

      {/* Description */}
      <p className="text-muted-foreground text-sm line-clamp-2 mb-3 ml-6">
        {note.description}
      </p>

      {/* Bottom: date + time */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground ml-6">
        {note.date && (
          <>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{format(note.date, 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{format(note.date, 'h:mm a')}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

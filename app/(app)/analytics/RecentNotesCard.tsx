import { ReactNode } from 'react';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
} from 'lucide-react';

interface Note {
  id: number;
  title: string;
  description: string;
  category: string;
  meeting_id: string;
  created_at?: string;
}

interface RecentNotesCardProps {
  notes: Note[];
  totalNotes: number;
  getCategoryBadge: (category: string) => ReactNode;
}

export function RecentNotesCard({ notes, totalNotes, getCategoryBadge }: RecentNotesCardProps) {
  return (
    <div className="bg-card-2 rounded-lg border border-border p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">Recent Notes</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {totalNotes} total Notes &middot; {notes.length} shown
        </p>
      </div>
      <div className="space-y-3">
        {notes.length > 0 ? notes.map((note) => (
          <div
            key={note.id}
            className="bg-background rounded-lg border border-border p-4 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-medium text-foreground line-clamp-1">{note.title}</h3>
              <div className="ml-2 flex-shrink-0">
                {getCategoryBadge(note.category)}
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {note.description || 'No description available.'}
            </p>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {note.created_at ? format(new Date(note.created_at), 'MMM dd, yyyy') : 'No date'}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {note.created_at ? format(new Date(note.created_at), 'h:mm a') : ''}
              </span>
            </div>
          </div>
        )) : (
          <p className="text-sm text-muted-foreground text-center py-6">No notes yet</p>
        )}
      </div>
    </div>
  );
}

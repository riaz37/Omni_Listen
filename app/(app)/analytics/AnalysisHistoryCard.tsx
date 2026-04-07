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

interface AnalysisHistoryCardProps {
  notes: Note[];
}

export function AnalysisHistoryCard({ notes }: AnalysisHistoryCardProps) {
  return (
    <div className="bg-card-2 rounded-xl border border-border p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-foreground">Recent Additional Analysis History</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {notes.length} total analysis &middot; {notes.length} shown
        </p>
      </div>
      <div className="space-y-3">
        {notes.length > 0 ? notes.map((note) => (
          <div
            key={`analysis-${note.id}`}
            className="bg-background rounded-lg border border-border p-4 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground line-clamp-1">
                {note.title || 'Your Analysis Request'}
              </h3>
              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                  Summary
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
              {note.description || 'Summarize all technical decisions and their rationale'}
            </p>
            <div className="mb-2">
              <p className="text-xs font-semibold text-foreground mb-0.5">AI Analysis</p>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {note.description
                  ? note.description.substring(0, 80) + '...'
                  : 'The transcript is empty, so there are no technical decisions or ratio...'}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
          <p className="text-sm text-muted-foreground text-center py-6">No analysis history yet</p>
        )}
      </div>
    </div>
  );
}

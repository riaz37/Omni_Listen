import Checkbox from '@/components/ui/checkbox';
import { formatDate, truncate } from '@/lib/utils';
import {
  Calendar,
  BarChart2,
  MoreVertical,
  Eye,
  Trash2,
  Link2,
} from 'lucide-react';

interface MeetingCardProps {
  meeting: any;
  isSelected: boolean;
  onToggleSelect: (meetingId: number) => void;
  onView: (jobId: string) => void;
  onDelete: (jobId: string) => void;
  openMenuId: string | null;
  onToggleMenu: (id: string | null) => void;
}

export function MeetingCard({
  meeting,
  isSelected,
  onToggleSelect,
  onView,
  onDelete,
  openMenuId,
  onToggleMenu,
}: MeetingCardProps) {
  const isMenuOpen = openMenuId === meeting.job_id;

  return (
    <div
      className="bg-card rounded-lg border border-border p-5 hover:shadow-md transition-all cursor-pointer"
      onClick={() => onView(meeting.job_id)}
    >
      {/* Row 1: Checkbox + Title + Sync badge + Menu */}
      <div className="flex items-start gap-2 mb-2">
        <div
          className="flex-shrink-0 pt-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={isSelected}
            onChange={() => onToggleSelect(meeting.id)}
            size="sm"
          />
        </div>

        <h3 className="text-sm font-semibold text-foreground flex-1 truncate">
          {meeting.title || 'Meeting Analysis'}
        </h3>

        {meeting.calendar_synced && (
          <span
            className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <Link2 className="w-3 h-3" />
            Sync to calendar
          </span>
        )}

        <div
          className="relative flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onToggleMenu(isMenuOpen ? null : meeting.job_id)}
            className="p-0.5 text-muted-foreground hover:text-foreground rounded transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => onToggleMenu(null)}
              />
              <div className="absolute right-0 top-full mt-1 w-36 bg-card border border-border rounded-lg shadow-lg z-50 py-1">
                <button
                  onClick={() => {
                    onView(meeting.job_id);
                    onToggleMenu(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                <button
                  onClick={() => {
                    onDelete(meeting.job_id);
                    onToggleMenu(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Row 2: Description */}
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3 ml-6">
        {truncate(meeting.summary_preview, 180)}
      </p>

      {/* Row 3: Footer metadata */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground ml-6">
        <span className="inline-flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {meeting.event_count} Event{meeting.event_count !== 1 ? 's' : ''}
        </span>

        {meeting.has_custom_query && (
          <>
            <div className="w-px h-3 bg-border" />
            <span className="inline-flex items-center gap-1">
              <BarChart2 className="w-3.5 h-3.5" />
              Additional Analysis
            </span>
          </>
        )}

        <div className="w-px h-3 bg-border" />
        <span>{formatDate(meeting.created_at)}</span>
      </div>
    </div>
  );
}

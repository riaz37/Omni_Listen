import { Checkbox } from '@/components/ui/checkbox';
import { formatDate, truncate } from '@/lib/utils';
import {
  Calendar,
  BarChart2,
  MoreVertical,
  Eye,
  Trash2,
  Link2,
} from 'lucide-react';
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from '@/components/ui/dropdown';
import { useTranslation } from '@/lib/i18n/use-translation';

interface ConversationCardProps {
  meeting: any;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
  onView: (jobId: string) => void;
  onDelete: (jobId: string) => void;
}

export function ConversationCard({
  meeting,
  isSelected,
  onToggleSelect,
  onView,
  onDelete,
}: ConversationCardProps) {
  const { t } = useTranslation();
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
            onCheckedChange={() => onToggleSelect(meeting.id)}
          />
        </div>

        <h3 className="text-sm font-semibold text-foreground flex-1 truncate">
          {meeting.title || t('history.card.default_title')}
        </h3>

        {meeting.calendar_synced && (
          <span
            className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <Link2 className="w-3 h-3" />
            {t('history.card.sync_label')}
          </span>
        )}

        <div
          className="flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <Dropdown>
            <DropdownTrigger className="p-0.5 text-muted-foreground hover:text-foreground rounded transition-colors">
              <MoreVertical className="w-4 h-4" />
            </DropdownTrigger>
            <DropdownContent align="end">
              <DropdownItem icon={Eye} onClick={() => onView(meeting.job_id)}>
                {t('history.table.view_details')}
              </DropdownItem>
              <DropdownItem icon={Trash2} destructive onClick={() => onDelete(meeting.job_id)}>
                {t('common.delete')}
              </DropdownItem>
            </DropdownContent>
          </Dropdown>
        </div>
      </div>

      {/* Row 2: Description */}
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3 ms-6">
        {truncate(meeting.summary_preview, 180)}
      </p>

      {/* Row 3: Footer metadata */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground ms-6">
        <span className="inline-flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {meeting.event_count} {t('history.table.col_events')}
        </span>

        {meeting.has_custom_query && (
          <>
            <div className="w-px h-3 bg-border" />
            <span className="inline-flex items-center gap-1">
              <BarChart2 className="w-3.5 h-3.5" />
              {t('history.card.additional_analysis')}
            </span>
          </>
        )}

        <div className="w-px h-3 bg-border" />
        <span>{formatDate(meeting.created_at)}</span>
      </div>
    </div>
  );
}

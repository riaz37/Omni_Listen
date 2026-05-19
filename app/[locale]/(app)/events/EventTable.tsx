import { format, isPast, isFuture } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import CustomDropdown from '@/components/ui/custom-dropdown';
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from '@/components/ui/dropdown';
import {
  Eye,
  Edit2,
  Clock,
  Trash2,
  MoreHorizontal,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Users,
} from 'lucide-react';

interface Event {
  id: string;
  eventItemId?: number;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  attendees?: string[];
  assignee?: string;
  type: 'conversation' | 'task' | 'deadline';
  synced?: boolean;
  calendarEventId?: string;
  isManual?: boolean;
  notificationsEnabled?: boolean;
  completed?: boolean;
  urgency?: 'yes' | 'no';
}

type SortColumn = 'title' | 'status' | 'assignee' | 'date';

interface EventTableProps {
  paginatedEvents: Event[];
  filteredCount: number;
  selectedIds: number[];
  sortColumn: SortColumn;
  sortDir: 'asc' | 'desc';
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  onSort: (column: SortColumn) => void;
  onToggleSelect: (eventItemId: number) => void;
  onSelectAllOnPage: () => void;
  onToggleCompletion: (event: Event) => void;
  onEdit: (event: Event) => void;
  onReschedule: (event: Event) => void;
  onViewDetails: (event: Event) => void;
  onDelete: (eventId: string) => void;
  onSetCurrentPage: (page: number | ((prev: number) => number)) => void;
  onSetRowsPerPage: (rows: number) => void;
  hasFilters: boolean;
}

function getStatusBadge(event: Event) {
  if (event.completed) {
    return (
      <span className="inline-flex px-2.5 py-1 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/30">
        Done
      </span>
    );
  }
  if (isPast(event.start)) {
    return (
      <span className="inline-flex px-2.5 py-1 rounded text-xs font-medium bg-destructive/10 text-destructive border border-destructive/30">
        Overdue
      </span>
    );
  }
  return (
    <span className="inline-flex px-2.5 py-1 rounded text-xs font-medium bg-card text-primary border border-primary/30">
      Upcoming
    </span>
  );
}

export function EventTable({
  paginatedEvents,
  filteredCount,
  selectedIds,
  sortColumn,
  sortDir,
  currentPage,
  totalPages,
  rowsPerPage,
  onSort,
  onToggleSelect,
  onSelectAllOnPage,
  onToggleCompletion,
  onEdit,
  onReschedule,
  onViewDetails,
  onDelete,
  onSetCurrentPage,
  onSetRowsPerPage,
  hasFilters,
}: EventTableProps) {
  const selectableEvents = paginatedEvents.filter((e) => e.eventItemId);
  const allOnPageSelected =
    selectableEvents.length > 0 &&
    selectableEvents.every((e) => selectedIds.includes(e.eventItemId!));

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="w-10 p-3">
              <Checkbox
                checked={allOnPageSelected}
                onCheckedChange={() => onSelectAllOnPage()}
              />
            </th>
            <th className="text-left p-3 font-medium text-muted-foreground">
              <button
                onClick={() => onSort('title')}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                Title <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </th>
            <th className="text-left p-3 font-medium text-muted-foreground">
              <button
                onClick={() => onSort('status')}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                Status <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </th>
            <th className="text-left p-3 font-medium text-muted-foreground">
              <button
                onClick={() => onSort('assignee')}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                Assignee <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </th>
            <th className="text-left p-3 font-medium text-muted-foreground">
              <button
                onClick={() => onSort('date')}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                Date <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </th>
            <th className="w-10 p-3"></th>
          </tr>
        </thead>
        <tbody>
          {paginatedEvents.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-8 text-center text-muted-foreground">
                {hasFilters
                  ? 'No events match your filters'
                  : 'No events found. Upload conversations to create events.'}
              </td>
            </tr>
          ) : (
            paginatedEvents.map((event) => (
              <tr
                key={event.id}
                className={`border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors ${
                  event.completed ? 'opacity-60' : ''
                }`}
              >
                <td className="p-3">
                  {event.eventItemId ? (
                    <Checkbox
                      checked={selectedIds.includes(event.eventItemId)}
                      onCheckedChange={() => onToggleSelect(event.eventItemId!)}
                    />
                  ) : (
                    <div className="w-4" />
                  )}
                </td>
                <td className="p-3 max-w-[300px]">
                  <div
                    className={`font-medium text-foreground cursor-pointer hover:text-primary ${
                      event.completed ? 'line-through' : ''
                    }`}
                    onClick={() => onViewDetails(event)}
                  >
                    {event.title}
                  </div>
                  {event.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {event.description}
                    </p>
                  )}
                </td>
                <td className="p-3">{getStatusBadge(event)}</td>
                <td className="p-3">
                  <div className="flex items-center gap-1.5 text-sm text-foreground">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="truncate">
                      {event.assignee || '\u2014'}
                    </span>
                  </div>
                </td>
                <td className="p-3 whitespace-nowrap">
                  <div className="text-sm text-muted-foreground">
                    {format(event.start, 'MMM dd, yyyy')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(event.start, 'h:mm a')}
                  </div>
                </td>
                <td className="p-3">
                  <Dropdown>
                    <DropdownTrigger className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </DropdownTrigger>
                    <DropdownContent align="end">
                      <DropdownItem
                        icon={Eye}
                        onClick={() => onViewDetails(event)}
                      >
                        View Details
                      </DropdownItem>
                      <DropdownItem
                        icon={Edit2}
                        onClick={() => onEdit(event)}
                      >
                        Edit
                      </DropdownItem>
                      <DropdownItem
                        icon={Clock}
                        onClick={() => onReschedule(event)}
                      >
                        Reschedule
                      </DropdownItem>
                      <DropdownItem
                        icon={Trash2}
                        destructive
                        onClick={() => onDelete(event.id)}
                      >
                        Delete
                      </DropdownItem>
                    </DropdownContent>
                  </Dropdown>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border">
        <div className="text-sm text-muted-foreground">
          {selectedIds.length} of {filteredCount} row(s) selected.
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Rows per page</span>
            <CustomDropdown
              value={String(rowsPerPage)}
              onChange={(val) => {
                onSetRowsPerPage(Number(val));
                onSetCurrentPage(1);
              }}
              options={[
                { value: '10', label: '10' },
                { value: '25', label: '25' },
                { value: '50', label: '50' },
              ]}
            />
          </div>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages || 1}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onSetCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                onSetCurrentPage((p: number) => Math.max(1, p - 1))
              }
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() =>
                onSetCurrentPage((p: number) =>
                  Math.min(totalPages, p + 1)
                )
              }
              disabled={currentPage >= totalPages}
              className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSetCurrentPage(totalPages)}
              disabled={currentPage >= totalPages}
              className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

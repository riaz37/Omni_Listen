import { format } from 'date-fns';
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
  Trash2,
  MoreHorizontal,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

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

type SortColumn = 'title' | 'category' | 'source' | 'date';

interface NoteTableProps {
  paginatedNotes: Note[];
  filteredNotesCount: number;
  selectedIds: number[];
  sortColumn: SortColumn;
  sortDir: 'asc' | 'desc';
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  onSort: (column: SortColumn) => void;
  onToggleSelect: (noteId: string) => void;
  onSelectAllOnPage: () => void;
  onView: (note: Note) => void;
  onDelete: (noteId: string) => void;
  onSetCurrentPage: (page: number | ((prev: number) => number)) => void;
  onSetRowsPerPage: (rows: number) => void;
  getCategoryBadgeColor: (category: string) => string;
  isEmpty: boolean;
  hasFilters: boolean;
}

export function NoteTable({
  paginatedNotes,
  filteredNotesCount,
  selectedIds,
  sortColumn,
  sortDir,
  currentPage,
  totalPages,
  rowsPerPage,
  onSort,
  onToggleSelect,
  onSelectAllOnPage,
  onView,
  onDelete,
  onSetCurrentPage,
  onSetRowsPerPage,
  getCategoryBadgeColor,
  isEmpty,
  hasFilters,
}: NoteTableProps) {
  const allOnPageSelected =
    paginatedNotes.length > 0 &&
    paginatedNotes.every((n) =>
      selectedIds.includes(parseInt(n.id.replace('note-', '')))
    );

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
                onClick={() => onSort('category')}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                Category <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </th>
            <th className="text-left p-3 font-medium text-muted-foreground">
              <button
                onClick={() => onSort('source')}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                Source <ArrowUpDown className="w-3.5 h-3.5" />
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
          {paginatedNotes.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-8 text-center text-muted-foreground">
                {hasFilters
                  ? 'No notes match your filters'
                  : 'No notes found. Upload conversations to create notes.'}
              </td>
            </tr>
          ) : (
            paginatedNotes.map((note) => (
              <tr
                key={note.id}
                className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
              >
                <td className="p-3">
                  <Checkbox
                    checked={selectedIds.includes(
                      parseInt(note.id.replace('note-', ''))
                    )}
                    onCheckedChange={() => onToggleSelect(note.id)}
                  />
                </td>
                <td className="p-3 max-w-[300px]">
                  <div
                    className={`font-medium text-foreground cursor-pointer hover:text-primary ${
                      note.completed ? 'line-through opacity-60' : ''
                    }`}
                    onClick={() => onView(note)}
                  >
                    {note.title}
                  </div>
                  {note.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {note.description}
                    </p>
                  )}
                </td>
                <td className="p-3">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded text-xs font-medium capitalize ${getCategoryBadgeColor(
                      note.category
                    )}`}
                  >
                    {note.category}
                  </span>
                </td>
                <td className="p-3">
                  <span className="text-sm text-foreground truncate block max-w-[180px]">
                    {note.meetingTitle || '\u2014'}
                  </span>
                </td>
                <td className="p-3 whitespace-nowrap">
                  {note.date ? (
                    <span className="text-sm text-muted-foreground">
                      {format(note.date, 'MMM dd, yyyy')}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">{'\u2014'}</span>
                  )}
                </td>
                <td className="p-3">
                  <Dropdown>
                    <DropdownTrigger className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </DropdownTrigger>
                    <DropdownContent align="end">
                      <DropdownItem icon={Eye} onClick={() => onView(note)}>
                        View Details
                      </DropdownItem>
                      <DropdownItem
                        icon={Trash2}
                        destructive
                        onClick={() => onDelete(note.id)}
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
          {selectedIds.length} of {filteredNotesCount} row(s) selected.
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

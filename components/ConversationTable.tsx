import { Checkbox } from '@/components/ui/checkbox';
import { formatDate, truncate } from '@/lib/utils';
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
  Link2,
  RefreshCw,
} from 'lucide-react';

type SortColumn = 'title' | 'events' | 'date';

interface ConversationTableProps {
  paginatedConversations: any[];
  filteredCount: number;
  selectedIds: number[];
  sortColumn: SortColumn;
  sortDir: 'asc' | 'desc';
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  onSort: (column: SortColumn) => void;
  onToggleSelect: (id: number) => void;
  onSelectAllOnPage: () => void;
  onView: (jobId: string) => void;
  onDelete: (jobId: string) => void;
  onRetry: (jobId: string) => void;
  retryingJobIds: Set<string>;
  onSetCurrentPage: (page: number | ((prev: number) => number)) => void;
  onSetRowsPerPage: (rows: number) => void;
  hasFilters: boolean;
}

export function ConversationTable({
  paginatedConversations,
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
  onView,
  onDelete,
  onRetry,
  retryingJobIds,
  onSetCurrentPage,
  onSetRowsPerPage,
  hasFilters,
}: ConversationTableProps) {
  const allOnPageSelected =
    paginatedConversations.length > 0 &&
    paginatedConversations.every((c) => selectedIds.includes(c.id));

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
                onClick={() => onSort('events')}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                Events <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </th>
            <th className="text-left p-3 font-medium text-muted-foreground">
              Status
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
          {paginatedConversations.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-8 text-center text-muted-foreground">
                {hasFilters
                  ? 'No conversations match your search'
                  : 'No conversations found. Record your first conversation to get started.'}
              </td>
            </tr>
          ) : (
            paginatedConversations.map((conversation) => (
              <tr
                key={conversation.job_id}
                className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
              >
                <td className="p-3">
                  <Checkbox
                    checked={selectedIds.includes(conversation.id)}
                    onCheckedChange={() => onToggleSelect(conversation.id)}
                  />
                </td>
                <td className="p-3 max-w-[350px]">
                  <div
                    className="font-medium text-foreground cursor-pointer hover:text-primary"
                    onClick={() => onView(conversation.job_id)}
                  >
                    {conversation.title || 'Conversation Analysis'}
                  </div>
                  {conversation.summary_preview && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {truncate(conversation.summary_preview, 120)}
                    </p>
                  )}
                </td>
                <td className="p-3">
                  <span className="inline-flex px-2.5 py-1 rounded text-xs font-medium bg-muted text-foreground">
                    {conversation.event_count} Event
                    {conversation.event_count !== 1 ? 's' : ''}
                  </span>
                </td>
                <td className="p-3">
                  {(() => {
                    const isRetrying = retryingJobIds.has(conversation.job_id) || conversation.failed_at_stage === 'pending_extraction';
                    const isFailed = !isRetrying && conversation.failed_at_stage === 'extraction_failed';

                    if (isFailed) {
                      return (
                        <button
                          onClick={() => onRetry(conversation.job_id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Retry Extraction
                        </button>
                      );
                    }
                    if (isRetrying) {
                      return (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-muted text-muted-foreground">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          Retrying...
                        </span>
                      );
                    }
                    if (conversation.calendar_synced) {
                      return (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                          <Link2 className="w-3 h-3" />
                          Synced
                        </span>
                      );
                    }
                    if (conversation.has_custom_query) {
                      return (
                        <span className="inline-flex px-2.5 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                          Additional Analysis
                        </span>
                      );
                    }
                    return (
                      <span className="inline-flex px-2.5 py-1 rounded text-xs font-medium bg-muted text-muted-foreground">
                        Analyzed
                      </span>
                    );
                  })()}
                </td>
                <td className="p-3 whitespace-nowrap">
                  <span className="text-sm text-muted-foreground">
                    {formatDate(conversation.created_at)}
                  </span>
                </td>
                <td className="p-3">
                  <Dropdown>
                    <DropdownTrigger className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </DropdownTrigger>
                    <DropdownContent align="end">
                      <DropdownItem
                        icon={Eye}
                        onClick={() => onView(conversation.job_id)}
                      >
                        View Details
                      </DropdownItem>
                      {conversation.failed_at_stage === 'extraction_failed' && (
                        <DropdownItem
                          icon={RefreshCw}
                          onClick={() => onRetry(conversation.job_id)}
                        >
                          Retry Extraction
                        </DropdownItem>
                      )}
                      <DropdownItem
                        icon={Trash2}
                        destructive
                        onClick={() => onDelete(conversation.job_id)}
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

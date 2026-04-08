import { normalizeUrgency } from '@/lib/utils';
import CustomDropdown from '@/components/ui/custom-dropdown';
import {
  CheckCircle2,
  Trash2,
  MoreHorizontal,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Checkbox from '@/components/ui/checkbox';

interface Task {
  id: number;
  title: string;
  description?: string;
  date: Date;
  completed: boolean;
  type: string;
  category?: string;
  assignee?: string;
  meetingId: string;
  urgency?: 'yes' | 'no' | 'high' | 'medium' | 'low';
}

type SortColumn = 'title' | 'status' | 'priority' | 'assign';

interface TaskTableProps {
  paginatedTasks: Task[];
  filteredTasksCount: number;
  selectedIds: number[];
  sortColumn: SortColumn;
  sortDir: 'asc' | 'desc';
  searchTerm: string;
  filterType: 'all' | 'pending' | 'completed';
  filterUrgency: 'all' | 'yes' | 'no';
  openMenuId: number | null;
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  onSort: (column: SortColumn) => void;
  onToggleSelect: (id: number) => void;
  onSelectAllOnPage: () => void;
  onToggleTask: (taskId: number, completed: boolean) => void;
  onDeleteTask: (taskId: number) => void;
  onSetOpenMenuId: (id: number | null) => void;
  onSetCurrentPage: (page: number | ((prev: number) => number)) => void;
  onSetRowsPerPage: (rows: number) => void;
}

export function TaskTable({
  paginatedTasks,
  filteredTasksCount,
  selectedIds,
  sortColumn,
  sortDir,
  searchTerm,
  filterType,
  filterUrgency,
  openMenuId,
  currentPage,
  totalPages,
  rowsPerPage,
  onSort,
  onToggleSelect,
  onSelectAllOnPage,
  onToggleTask,
  onDeleteTask,
  onSetOpenMenuId,
  onSetCurrentPage,
  onSetRowsPerPage,
}: TaskTableProps) {
  const router = useRouter();

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="w-10 p-3">
              <Checkbox
                checked={paginatedTasks.length > 0 && paginatedTasks.every(t => selectedIds.includes(t.id))}
                onChange={() => onSelectAllOnPage()}
                size="sm"
              />
            </th>
            <th className="text-left p-3 font-medium text-muted-foreground">
              <button onClick={() => onSort('title')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                Title <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </th>
            <th className="text-left p-3 font-medium text-muted-foreground">
              <button onClick={() => onSort('status')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                Status <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </th>
            <th className="text-left p-3 font-medium text-muted-foreground">
              <button onClick={() => onSort('priority')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                Priority <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </th>
            <th className="text-left p-3 font-medium text-muted-foreground">
              <button onClick={() => onSort('assign')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                Assign <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </th>
            <th className="text-left p-3 font-medium text-muted-foreground">
              <button className="flex items-center gap-1">
                Assign <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </th>
            <th className="w-10 p-3"></th>
          </tr>
        </thead>
        <tbody>
          {paginatedTasks.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-8 text-center text-muted-foreground">
                {searchTerm || filterType !== 'all' || filterUrgency !== 'all'
                  ? 'No tasks match your filters'
                  : 'No tasks found. Upload meetings to create tasks.'}
              </td>
            </tr>
          ) : (
            paginatedTasks.map((task) => {
              const isUrgent = normalizeUrgency(task.urgency) === 'yes';

              return (
                <tr key={task.id} className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors">
                  <td className="p-3">
                    <Checkbox
                      checked={selectedIds.includes(task.id)}
                      onChange={() => onToggleSelect(task.id)}
                      size="sm"
                    />
                  </td>
                  <td className="p-3 max-w-[300px]">
                    <div
                      className={`font-medium text-foreground ${task.meetingId ? 'cursor-pointer hover:text-primary' : ''} ${task.completed ? 'line-through opacity-60' : ''}`}
                      onClick={() => task.meetingId && router.push(`/meeting?id=${task.meetingId}`)}
                    >
                      {task.title}
                    </div>
                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{task.description}</p>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex px-2.5 py-1 rounded text-xs font-medium border ${task.completed
                      ? 'bg-primary/10 text-primary border-primary/30'
                      : 'bg-card text-primary border-primary/30'
                      }`}>
                      {task.completed ? 'Done' : 'To Do'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex px-2.5 py-1 rounded text-xs font-medium border ${isUrgent
                      ? 'bg-destructive/10 text-destructive border-destructive/30'
                      : 'bg-muted text-muted-foreground border-border'
                      }`}>
                      {isUrgent ? 'Urgent' : 'Normal'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5 text-sm text-foreground">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="truncate">{task.assignee || '\u2014'}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 bg-muted text-foreground rounded">{task.type === 'dated_events' ? 'Event' : 'Note'}</span>
                      <span className="px-2 py-0.5 bg-muted text-foreground rounded">{task.category ? task.category.replace(/_/g, ' ') : 'General'}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="relative">
                      <button
                        onClick={() => onSetOpenMenuId(openMenuId === task.id ? null : task.id)}
                        className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {openMenuId === task.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => onSetOpenMenuId(null)} />
                          <div className="absolute right-0 top-full mt-1 w-40 bg-card border border-border rounded-lg shadow-lg z-50 py-1">
                            <button
                              onClick={() => { onToggleTask(task.id, !task.completed); onSetOpenMenuId(null); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              {task.completed ? 'Mark Incomplete' : 'Mark Done'}
                            </button>
                            <button
                              onClick={() => { onDeleteTask(task.id); onSetOpenMenuId(null); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border">
        <div className="text-sm text-muted-foreground">
          {selectedIds.length} of {filteredTasksCount} row(s) selected.
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Rows per page</span>
            <CustomDropdown
              value={String(rowsPerPage)}
              onChange={(val) => { onSetRowsPerPage(Number(val)); onSetCurrentPage(1); }}
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
            <button onClick={() => onSetCurrentPage(1)} disabled={currentPage === 1} className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button onClick={() => onSetCurrentPage((p: number) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => onSetCurrentPage((p: number) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={() => onSetCurrentPage(totalPages)} disabled={currentPage >= totalPages} className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

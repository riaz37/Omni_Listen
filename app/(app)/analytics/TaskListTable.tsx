import { ReactNode } from 'react';
import {
  MoreVertical,
  Users,
} from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  urgency?: string;
  assignee?: string;
  category?: string;
  type?: string;
}

interface TaskListTableProps {
  tasks: Task[];
  getStatusBadge: (completed: boolean) => ReactNode;
  getUrgencyLabel: (urgency?: string) => ReactNode;
}

export function TaskListTable({ tasks, getStatusBadge, getUrgencyLabel }: TaskListTableProps) {
  return (
    <div className="bg-card-2 rounded-xl border border-border p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-foreground">Task List</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {tasks.length} total Task &middot; {tasks.length} shown
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-2 w-8">
                <input type="checkbox" className="rounded border-border" disabled />
              </th>
              <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground">
                Title
              </th>
              <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground">
                Status
              </th>
              <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground">
                Priority
              </th>
              <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground">
                Assign
              </th>
              <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground">
                Assign
              </th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {tasks.length > 0 ? tasks.map((task) => (
              <tr key={task.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                <td className="py-3 px-2">
                  <input type="checkbox" className="rounded border-border" disabled />
                </td>
                <td className="py-3 px-2">
                  <div>
                    <p className="text-sm font-medium text-foreground line-clamp-1">{task.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {task.description || 'No description'}
                    </p>
                  </div>
                </td>
                <td className="py-3 px-2">
                  {getStatusBadge(task.completed)}
                </td>
                <td className="py-3 px-2">
                  {getUrgencyLabel(task.urgency)}
                </td>
                <td className="py-3 px-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {task.assignee || 'Unassigned'}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">{task.type || 'Event'}</span>
                    <span className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">{task.category || 'General'}</span>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <button className="text-muted-foreground hover:text-foreground">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                  No tasks found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

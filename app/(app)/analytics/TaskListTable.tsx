import { ReactNode } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  MoreHorizontal,
  Users,
  ArrowUpDown,
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
    <div className="bg-card-2 rounded-lg border border-border p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">Task List</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {tasks.length} total Task &middot; {tasks.length} shown
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-3 w-10">
                <Checkbox checked={false} onCheckedChange={() => {}} disabled />
              </th>
              <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground max-w-[260px]">
                <span className="flex items-center gap-1">Title <ArrowUpDown className="w-3 h-3" /></span>
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1">Status <ArrowUpDown className="w-3 h-3" /></span>
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1">Priority <ArrowUpDown className="w-3 h-3" /></span>
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1">Assignee <ArrowUpDown className="w-3 h-3" /></span>
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1">Tags <ArrowUpDown className="w-3 h-3" /></span>
              </th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {tasks.length > 0 ? tasks.map((task) => (
              <tr key={task.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                <td className="py-3 px-3">
                  <Checkbox checked={false} onCheckedChange={() => {}} disabled />
                </td>
                <td className="py-3 px-3 max-w-[260px]">
                  <div>
                    <p className="text-sm font-medium text-foreground line-clamp-1">{task.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {task.description || 'No description'}
                    </p>
                  </div>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  {getStatusBadge(task.completed)}
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  {getUrgencyLabel(task.urgency)}
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {task.assignee || 'Unassigned'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30">{task.type || 'Event'}</span>
                    <span className="px-2.5 py-1 rounded text-xs font-medium bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800/30">{task.category || 'General'}</span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
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

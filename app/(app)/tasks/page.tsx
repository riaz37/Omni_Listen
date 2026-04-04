'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { meetingsAPI } from '@/lib/api';
import { useToast } from '@/components/Toast';
import PrimaryButton from '@/components/PrimaryButton';
import { Search, Plus } from 'lucide-react';
import { Skeleton } from 'boneyard-js/react';
import { TasksSkeleton } from './TasksSkeleton';
import { TaskStatsCards } from './TaskStatsCards';
import { TaskTable } from './TaskTable';
import { AddTaskModal } from './AddTaskModal';
import PageEntrance from '@/components/ui/page-entrance';

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

export default function TasksPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const toast = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pending' | 'completed'>('all');
  const [filterUrgency, setFilterUrgency] = useState<'all' | 'yes' | 'no'>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'done'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [sortColumn, setSortColumn] = useState<'title' | 'status' | 'priority' | 'assign'>('title');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Add task modal state
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    date: '',
    urgency: 'no' as 'yes' | 'no'
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const [eventsResponse, notesResponse] = await Promise.all([
        meetingsAPI.getAllEvents(),
        meetingsAPI.getAllNotes()
      ]);

      const allTasks: Task[] = [];

      if (eventsResponse.events && Array.isArray(eventsResponse.events)) {
        eventsResponse.events.forEach((event: any) => {
          try {
            allTasks.push({
              id: event.id,
              title: event.title || 'Untitled Task',
              description: event.description || event.details,
              date: new Date(event.date),
              completed: event.completed || false,
              type: 'dated_events',
              category: event.category,
              assignee: event.assignee,
              meetingId: event.meeting_id || '',
              urgency: event.urgency,
            });
          } catch (err) {
          }
        });
      }

      if (notesResponse.notes && Array.isArray(notesResponse.notes)) {
        notesResponse.notes.forEach((note: any) => {
          try {
            allTasks.push({
              id: note.id,
              title: note.title || 'Untitled Note',
              description: note.description || note.details,
              date: new Date(note.created_at || Date.now()),
              completed: note.completed || false,
              type: 'notes',
              category: note.category || note.note_type,
              assignee: note.assignee,
              meetingId: note.meeting_id || '',
              urgency: note.urgency,
            });
          } catch (err) {
          }
        });
      }

      allTasks.sort((a, b) => {
        const aRawUrgency = a.urgency || 'no';
        const bRawUrgency = b.urgency || 'no';
        const aLevel = (aRawUrgency === 'high' || aRawUrgency === 'medium' || aRawUrgency === 'yes') ? 'yes' : 'no';
        const bLevel = (bRawUrgency === 'high' || bRawUrgency === 'medium' || bRawUrgency === 'yes') ? 'yes' : 'no';
        if (aLevel !== bLevel) {
          const urgencyOrder = { yes: 0, no: 1 };
          return urgencyOrder[aLevel] - urgencyOrder[bLevel];
        }
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        return a.date.getTime() - b.date.getTime();
      });

      setTasks(allTasks);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTask = async (taskId: number, completed: boolean) => {
    try {
      await meetingsAPI.toggleTaskCompletion(taskId, completed);
      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, completed } : task
      ));
      setTasks(prev => [...prev].sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        return a.date.getTime() - b.date.getTime();
      }));
      toast.success(completed ? 'Task marked as completed' : 'Task marked as incomplete');
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }
    try {
      await meetingsAPI.deleteEvent(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    try {
      const createdTask = await meetingsAPI.createTask({
        title: newTask.title,
        description: newTask.description,
        date: newTask.date || new Date().toISOString().split('T')[0],
        urgency: newTask.urgency
      });

      const task: Task = {
        id: createdTask.id,
        title: createdTask.title,
        description: createdTask.description,
        date: new Date(createdTask.date),
        completed: false,
        type: 'dated_events',
        meetingId: '',
        urgency: createdTask.urgency
      };

      setTasks(prev => [task, ...prev].sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        return a.date.getTime() - b.date.getTime();
      }));

      setNewTask({ title: '', description: '', date: '', urgency: 'no' });
      setShowAddTaskModal(false);
      toast.success('Task created successfully');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const filteredTasks = useMemo(() => {
    let result = tasks
      .filter(task => {
        if (activeTab === 'done') return task.completed;
        return true;
      })
      .filter(task => {
        if (filterType === 'pending') return !task.completed;
        if (filterType === 'completed') return task.completed;
        return true;
      })
      .filter(task => {
        if (filterUrgency === 'all') return true;
        const rawUrgency = task.urgency || 'no';
        const normalizedUrgency = (rawUrgency === 'high' || rawUrgency === 'medium' || rawUrgency === 'yes') ? 'yes' : 'no';
        return normalizedUrgency === filterUrgency;
      })
      .filter(task =>
        searchTerm === '' ||
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );

    result.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortColumn === 'title') return a.title.localeCompare(b.title) * dir;
      if (sortColumn === 'status') return (Number(a.completed) - Number(b.completed)) * dir;
      if (sortColumn === 'priority') {
        const aUrg = (a.urgency === 'high' || a.urgency === 'medium' || a.urgency === 'yes') ? 1 : 0;
        const bUrg = (b.urgency === 'high' || b.urgency === 'medium' || b.urgency === 'yes') ? 1 : 0;
        return (aUrg - bUrg) * dir;
      }
      if (sortColumn === 'assign') return (a.assignee || '').localeCompare(b.assignee || '') * dir;
      return 0;
    });

    return result;
  }, [tasks, activeTab, filterType, filterUrgency, searchTerm, sortColumn, sortDir]);

  const totalPages = Math.ceil(filteredTasks.length / rowsPerPage);
  const paginatedTasks = filteredTasks.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleSort = (column: typeof sortColumn) => {
    if (sortColumn === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDir('asc');
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAllOnPage = () => {
    const pageIds = paginatedTasks.map(t => t.id);
    const allSelected = pageIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...pageIds])]);
    }
  };

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const urgent = tasks.filter(t => {
      const rawUrgency = t.urgency || 'no';
      const normalizedUrgency = (rawUrgency === 'high' || rawUrgency === 'medium' || rawUrgency === 'yes') ? 'yes' : 'no';
      return normalizedUrgency === 'yes' && !t.completed;
    }).length;
    const normal = tasks.filter(t => {
      const rawUrgency = t.urgency || 'no';
      const normalizedUrgency = (rawUrgency === 'high' || rawUrgency === 'medium' || rawUrgency === 'yes') ? 'yes' : 'no';
      return normalizedUrgency === 'no' && !t.completed;
    }).length;

    return { total, completed, pending, urgent, normal };
  }, [tasks]);

  return (
    <Skeleton name="tasks-list" loading={loading || isLoading} fallback={<TasksSkeleton />}>
    <div className="min-h-screen bg-background">

      <PageEntrance name="tasks" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Task List</h1>
              <p className="text-muted-foreground text-sm">All events from your meetings, sorted by date</p>
            </div>
            <PrimaryButton
              onClick={() => setShowAddTaskModal(true)}
              icon={Plus}
            >
              Add Task
            </PrimaryButton>
          </div>
        </div>

        <TaskStatsCards
          stats={stats}
          onFilterChange={(ft, fu) => { setFilterType(ft); setFilterUrgency(fu); }}
        />

        {/* Tabs */}
        <div className="flex border-b border-border mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'all'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('done')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'done'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
          >
            Done
          </button>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative w-full sm:w-auto sm:min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-card text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground text-sm"
            />
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-sm text-muted-foreground">Status</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'pending' | 'completed')}
              className="px-3 py-2 bg-card text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            <span className="text-sm text-muted-foreground">Priority</span>
            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value as 'all' | 'yes' | 'no')}
              className="px-3 py-2 bg-card text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value="all">All Priority</option>
              <option value="yes">Urgent</option>
              <option value="no">Normal</option>
            </select>
          </div>
        </div>

        <TaskTable
          paginatedTasks={paginatedTasks}
          filteredTasksCount={filteredTasks.length}
          selectedIds={selectedIds}
          sortColumn={sortColumn}
          sortDir={sortDir}
          searchTerm={searchTerm}
          filterType={filterType}
          filterUrgency={filterUrgency}
          openMenuId={openMenuId}
          currentPage={currentPage}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          onSort={handleSort}
          onToggleSelect={handleToggleSelect}
          onSelectAllOnPage={handleSelectAllOnPage}
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
          onSetOpenMenuId={setOpenMenuId}
          onSetCurrentPage={setCurrentPage}
          onSetRowsPerPage={(rows) => { setRowsPerPage(rows); setCurrentPage(1); }}
        />

        <AddTaskModal
          show={showAddTaskModal}
          newTask={newTask}
          onNewTaskChange={setNewTask}
          onClose={() => setShowAddTaskModal(false)}
          onSubmit={handleCreateTask}
        />
      </PageEntrance>
    </div>
    </Skeleton>
  );
}

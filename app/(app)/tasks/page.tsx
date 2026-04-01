'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { meetingsAPI } from '@/lib/api';
import { useToast } from '@/components/Toast';
import Navigation from '@/components/Navigation';
import { getUrgencyStyles } from '@/lib/urgency-detector';
import { format } from 'date-fns';
import { TaskCardSkeleton, StatCardSkeleton } from '@/components/Skeleton';
import {
  CheckSquare,
  Circle,
  CheckCircle2,
  AlertCircle,
  Clock,
  Filter,
  Search,
  Loader2,
  Trash2,
  Plus,
  X
} from 'lucide-react';

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
      // Fetch events and notes directly (includes manual tasks and events from deleted meetings)
      const [eventsResponse, notesResponse] = await Promise.all([
        meetingsAPI.getAllEvents(),
        meetingsAPI.getAllNotes()
      ]);

      const allTasks: Task[] = [];

      // Process dated_events
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

      // Process notes
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

      // Sort tasks: urgent first, then by completion status, then by date
      allTasks.sort((a, b) => {
        // First, sort by urgency (normalize old values first)
        const aRawUrgency = a.urgency || 'no';
        const bRawUrgency = b.urgency || 'no';
        const aLevel = (aRawUrgency === 'high' || aRawUrgency === 'medium' || aRawUrgency === 'yes') ? 'yes' : 'no';
        const bLevel = (bRawUrgency === 'high' || bRawUrgency === 'medium' || bRawUrgency === 'yes') ? 'yes' : 'no';
        if (aLevel !== bLevel) {
          const urgencyOrder = { yes: 0, no: 1 };
          return urgencyOrder[aLevel] - urgencyOrder[bLevel];
        }
        // Then by completion status (incomplete first)
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        // Finally by date
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
      // Re-sort to push completed tasks to bottom
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

      // Add the new task to the list
      const task: Task = {
        id: createdTask.id,
        title: createdTask.title,
        description: createdTask.description,
        date: new Date(createdTask.date),
        completed: false,
        type: 'dated_events',
        meetingId: '', // Manual task, no meeting
        urgency: createdTask.urgency
      };

      setTasks(prev => [task, ...prev].sort((a, b) => {
        // Sort by completion, then date
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        return a.date.getTime() - b.date.getTime();
      }));

      // Reset form and close modal
      setNewTask({ title: '', description: '', date: '', urgency: 'no' });
      setShowAddTaskModal(false);
      toast.success('Task created successfully');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks
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
  }, [tasks, filterType, filterUrgency, searchTerm]);

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

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <CheckSquare className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
            </div>
            <p className="text-muted-foreground">Manage all your tasks and action items</p>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[...Array(5)].map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>

          {/* Filters Skeleton */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 h-10 bg-muted rounded-lg animate-pulse" />
              <div className="h-10 w-40 bg-muted rounded-lg animate-pulse" />
              <div className="h-10 w-40 bg-muted rounded-lg animate-pulse" />
            </div>
          </div>

          {/* Tasks Skeleton */}
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <TaskCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <CheckSquare className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
            </div>
            <button
              onClick={() => setShowAddTaskModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Task
            </button>
          </div>
          <p className="text-muted-foreground">Manage all your tasks and action items</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div
            onClick={() => { setFilterType('all'); setFilterUrgency('all'); }}
            className={`bg-card rounded-lg shadow p-4 cursor-pointer transition-all hover:shadow-md ${filterType === 'all' && filterUrgency === 'all' ? 'ring-2 ring-primary' : ''}`}
          >
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Tasks</div>
          </div>
          <div
            onClick={() => { setFilterType('pending'); setFilterUrgency('all'); }}
            className={`bg-card rounded-lg shadow p-4 cursor-pointer transition-all hover:shadow-md ${filterType === 'pending' && filterUrgency === 'all' ? 'ring-2 ring-primary' : ''}`}
          >
            <div className="text-2xl font-bold text-primary">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
          <div
            onClick={() => { setFilterType('completed'); setFilterUrgency('all'); }}
            className={`bg-card rounded-lg shadow p-4 cursor-pointer transition-all hover:shadow-md ${filterType === 'completed' ? 'ring-2 ring-primary' : ''}`}
          >
            <div className="text-2xl font-bold text-primary">{stats.completed}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          <div
            onClick={() => { setFilterType('pending'); setFilterUrgency('yes'); }}
            className={`bg-card rounded-lg shadow p-4 cursor-pointer transition-all hover:shadow-md ${filterUrgency === 'yes' ? 'ring-2 ring-red-500' : ''}`}
          >
            <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
            <div className="text-sm text-muted-foreground">Urgent</div>
          </div>
          <div
            onClick={() => { setFilterType('pending'); setFilterUrgency('no'); }}
            className={`bg-card rounded-lg shadow p-4 cursor-pointer transition-all hover:shadow-md ${filterUrgency === 'no' && filterType === 'pending' ? 'ring-2 ring-border' : ''}`}
          >
            <div className="text-2xl font-bold text-muted-foreground">{stats.normal}</div>
            <div className="text-sm text-muted-foreground">Normal</div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Urgency Filter */}
            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value as any)}
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Priority</option>
              <option value="yes">🔴 Urgent</option>
              <option value="no">Normal</option>
            </select>
          </div>
        </div>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <div className="bg-card rounded-lg shadow p-8 text-center">
            <CheckSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || filterType !== 'all' || filterUrgency !== 'all'
                ? 'No tasks match your filters'
                : 'No tasks found. Upload meetings to create tasks.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => {
              const rawUrgency = task.urgency || 'no';
              const urgency = (rawUrgency === 'high' || rawUrgency === 'medium' || rawUrgency === 'yes') ? 'yes' : 'no';
              const isUrgent = urgency === 'yes';
              const urgencyLevel = urgency === 'yes' ? 'high' : 'low';
              const styles = getUrgencyStyles(urgencyLevel);

              return (
                <div
                  key={task.id}
                  className={`rounded-lg shadow-sm border-l-4 transition-all ${task.completed
                    ? 'bg-card border-primary opacity-60'
                    : isUrgent
                      ? `${styles.cardBg} ${styles.border}`
                      : 'bg-card border-primary'
                    }`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <button
                        onClick={() => handleToggleTask(task.id, !task.completed)}
                        className="flex-shrink-0 mt-1"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-6 h-6 text-primary" />
                        ) : (
                          <Circle className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors" />
                        )}
                      </button>

                      {/* Task Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <h3
                              className={`font-semibold text-foreground mb-1 ${task.meetingId ? 'cursor-pointer hover:text-primary' : ''
                                } ${task.completed ? 'line-through' : ''}`}
                              onClick={() => task.meetingId && router.push(`/meeting?id=${task.meetingId}`)}
                            >
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                            )}
                          </div>

                          {/* Status Badges */}
                          <div className="flex flex-col items-end gap-1">
                            {task.completed && (
                              <span className="px-2 py-1 bg-primary/10 text-text-primary rounded text-xs font-medium">
                                ✓ Done
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(task.id);
                              }}
                              className="mt-1 p-1 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              title="Delete task"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Task Meta */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(task.date, 'MMM dd, yyyy')}
                          </div>
                          {task.category && (
                            <span className="px-2 py-0.5 bg-muted text-foreground rounded">
                              {task.category.replace(/_/g, ' ')}
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                            {task.type === 'dated_events' ? 'Event' : 'Note'}
                          </span>
                          {task.assignee && (
                            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded flex items-center gap-1">
                              👤 {task.assignee}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Task Modal */}
        {showAddTaskModal && (
          <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">Add New Task</h2>
                <button
                  onClick={() => setShowAddTaskModal(false)}
                  className="text-muted-foreground hover:text-muted-foreground"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter task title"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Description
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter task description"
                    rows={3}
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTask.date}
                    onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Urgency */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Urgency
                  </label>
                  <select
                    value={newTask.urgency}
                    onChange={(e) => setNewTask({ ...newTask, urgency: e.target.value as 'yes' | 'no' })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="no">Normal</option>
                    <option value="yes">Urgent</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddTaskModal(false)}
                    className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateTask}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                  >
                    Create Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

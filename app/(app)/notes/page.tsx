'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { meetingsAPI } from '@/lib/api';
import { useToast } from '@/components/Toast';
import Navigation from '@/components/Navigation';
import Pagination from '@/components/Pagination';
import EmptyState from '@/components/EmptyState';
import { SkeletonGrid } from '@/components/SkeletonCard';
import { exportNotesToCSV } from '@/lib/export';
import { parseISO, format } from 'date-fns';
//import { getUrgencyStyles } from '@/lib/urgency-detector';
import { StickyNote, Calendar, Tag, Search, ChevronRight, Filter, Plus, X, Download, AlertCircle, Trash2, Edit2, CheckCircle, XCircle } from 'lucide-react';
import EditNoteModal from '@/components/EditNoteModal';
import { DateGroupedList } from '@/components/DateGroupedList';

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

export default function NotesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const toast = useToast();

  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [newNoteData, setNewNoteData] = useState({
    title: '',
    description: '',
    category: 'GENERAL',
    meetingId: '',
  });
  const [meetings, setMeetings] = useState<any[]>([]);
  const [selectedNoteIds, setSelectedNoteIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      // Fetch meetings for dropdown and notes + events for processing
      const [meetingsData, notesResponse, eventsResponse] = await Promise.all([
        meetingsAPI.getAllMeetings(),
        meetingsAPI.getAllNotes(),
        meetingsAPI.getAllEvents()
      ]);

      setMeetings(meetingsData); // Store meetings for dropdown

      // Collect all completed tasks
      const completedTasks = new Set<string>();
      if (eventsResponse.events && Array.isArray(eventsResponse.events)) {
        eventsResponse.events.forEach((event: any) => {
          if (event.completed) {
            completedTasks.add(event.title?.toLowerCase() || '');
          }
        });
      }

      const extractedNotes: Note[] = [];

      if (notesResponse.notes && Array.isArray(notesResponse.notes)) {
        notesResponse.notes.forEach((note: any) => {
          try {
            // Map backend category to frontend category names
            let category = 'general';
            const backendCategory = note.category;

            if (backendCategory) {
              const categoryUpper = backendCategory.toUpperCase();
              if (categoryUpper === 'DECISION' || categoryUpper.includes('DECISION')) {
                category = 'decision';
              } else if (categoryUpper === 'BUDGET' || categoryUpper.includes('BUDGET')) {
                category = 'budget';
              } else if (categoryUpper === 'ACTION' || categoryUpper.includes('ACTION')) {
                category = 'action';
              } else {
                category = 'general';
              }
            }

            // Check if there's a related completed task
            const noteTitle = note.title?.toLowerCase() || '';
            const hasCompletedRelatedTask = completedTasks.has(noteTitle);

            // Find meeting title if meeting exists
            const meeting = meetingsData.find((m: any) => m.job_id === note.meeting_id);
            let meetingTitle = 'Manual Note';
            if (meeting) {
              const finalSummary = typeof meeting.final_summary === 'string'
                ? JSON.parse(meeting.final_summary)
                : meeting.final_summary;
              meetingTitle = finalSummary.title || 'Meeting';
            }

            extractedNotes.push({
              id: `note-${note.id}`,
              title: note.title || 'Untitled Note',
              description: note.description || '',
              category: category,
              date: meeting ? new Date(meeting.created_at) : undefined,
              meetingId: note.meeting_id || '',
              meetingTitle: meetingTitle,
              type: backendCategory,
              completed: note.completed || hasCompletedRelatedTask,
              urgency: note.urgency,
            });
          } catch (err) {
          }
        });
      }

      setNotes(extractedNotes);
    } catch (error) {
      toast.error('Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteData.title.trim()) {
      toast.error('Please enter a note title');
      return;
    }
    if (!newNoteData.meetingId) {
      toast.error('Please select a meeting');
      return;
    }

    try {
      await meetingsAPI.createNote(newNoteData.meetingId, {
        title: newNoteData.title,
        description: newNoteData.description,
        category: newNoteData.category,
      });

      toast.success('Note created successfully!');
      setShowAddNoteModal(false);
      setNewNoteData({
        title: '',
        description: '',
        category: 'GENERAL',
        meetingId: '',
      });
      // Refresh notes
      fetchNotes();
    } catch (error) {
      toast.error('Failed to create note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }
    try {
      // Extract numeric ID from "note-123" format
      const numericId = parseInt(noteId.replace('note-', ''));
      await meetingsAPI.deleteNote(numericId);
      setNotes(notes.filter(note => note.id !== noteId));
      toast.success('Note deleted successfully');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const handleEditNote = (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNote(note);
    setShowEditModal(true);
  };

  const handleSaveNote = async (noteId: number, updates: any) => {
    try {
      await meetingsAPI.updateNote(noteId, updates);

      // Update local state
      const updatedNotes = notes.map(n => {
        // Extract numeric ID from "note-123" format
        const numericId = parseInt(n.id.replace('note-', ''));
        if (numericId === noteId) {
          return {
            ...n,
            title: updates.title !== undefined ? updates.title : n.title,
            description: updates.description !== undefined ? updates.description : n.description,
            category: updates.category !== undefined ? updates.category : n.category,
          };
        }
        return n;
      });

      setNotes(updatedNotes);
      setShowEditModal(false);
      toast.success('Note updated successfully');
    } catch (error) {
      toast.error('Failed to update note');
      throw error;
    }
  };

  const handleToggleSelectNote = (noteId: string) => {
    const numericId = parseInt(noteId.replace('note-', ''));
    setSelectedNoteIds(prev =>
      prev.includes(numericId)
        ? prev.filter(id => id !== numericId)
        : [...prev, numericId]
    );
  };

  const handleSelectAll = () => {
    const allNoteIds = paginatedNotes.map(n => parseInt(n.id.replace('note-', '')));
    setSelectedNoteIds(allNoteIds);
  };

  const handleDeselectAll = () => {
    setSelectedNoteIds([]);
  };

  const handleBulkDelete = async () => {
    if (selectedNoteIds.length === 0) {
      toast.error('No notes selected');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedNoteIds.length} selected note(s)?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await meetingsAPI.bulkDeleteNotes(selectedNoteIds);
      setNotes(notes.filter(n => {
        const numericId = parseInt(n.id.replace('note-', ''));
        return !selectedNoteIds.includes(numericId);
      }));
      setSelectedNoteIds([]);
      toast.success(`Deleted ${result.deleted_count} note(s)`);
    } catch (error) {
      toast.error('Failed to delete selected notes');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAll = async () => {
    if (notes.length === 0) {
      toast.error('No notes to delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete ALL ${notes.length} note(s)? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await meetingsAPI.deleteAllNotes();
      setNotes([]);
      setSelectedNoteIds([]);
      toast.success(`Deleted all ${result.deleted_count} note(s)`);
    } catch (error) {
      toast.error('Failed to delete all notes');
    } finally {
      setIsDeleting(false);
    }
  };

  const categories = useMemo(() => {
    const cats = new Set(['all']);
    notes.forEach(note => cats.add(note.category));
    return Array.from(cats);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes
      .filter(note => selectedCategory === 'all' || note.category === selectedCategory)
      .filter(note =>
        searchTerm === '' ||
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        // Sort by date if available, otherwise by meeting
        if (a.date && b.date) {
          return b.date.getTime() - a.date.getTime();
        }
        if (a.date) return -1;
        if (b.date) return 1;
        return 0;
      });
  }, [notes, selectedCategory, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredNotes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNotes = filteredNotes.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      general: 'bg-muted text-foreground border-border',
      budget: 'bg-primary/10 text-text-primary border-primary/30',
      action: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700',
      decision: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700',
      technical: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700',
      'follow-up': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
    };
    return colors[category] || colors.general;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="h-8 bg-muted rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
          </div>
          <SkeletonGrid count={6} />
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
              <StickyNote className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Notes</h1>
            </div>
            <div className="flex gap-2 flex-wrap">
              {selectedNoteIds.length > 0 && (
                <>
                  <button
                    onClick={handleBulkDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-muted disabled:cursor-not-allowed transition-colors"
                    title={`Delete ${selectedNoteIds.length} selected`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Delete Selected ({selectedNoteIds.length})</span>
                    <span className="sm:hidden">{selectedNoteIds.length}</span>
                  </button>
                  <button
                    onClick={handleDeselectAll}
                    disabled={isDeleting}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/80 disabled:bg-muted disabled:cursor-not-allowed transition-colors"
                    title="Deselect all"
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                </>
              )}
              {selectedNoteIds.length === 0 && notes.length > 0 && (
                <button
                  onClick={handleDeleteAll}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-muted disabled:cursor-not-allowed transition-colors"
                  title="Delete all notes"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Delete All</span>
                </button>
              )}
              <button
                onClick={() => exportNotesToCSV(filteredNotes)}
                disabled={filteredNotes.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:bg-muted disabled:cursor-not-allowed transition-colors"
                title="Export to CSV"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={() => setShowAddNoteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Add Note</span>
              </button>
            </div>
          </div>
          <p className="text-muted-foreground">All notes from your analyzed meetings</p>
        </div>

        {/* Category Filter Bar */}
        <div className="bg-card rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-medium text-foreground">Categories</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${selectedCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-muted text-foreground hover:bg-muted'
                  }`}
              >
                {category}
                {category !== 'all' && (
                  <span className="ml-2 text-sm opacity-75">
                    ({notes.filter(n => n.category === category).length})
                  </span>
                )}
                {category === 'all' && (
                  <span className="ml-2 text-sm opacity-75">
                    ({notes.length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Select All/Deselect All */}
          {filteredNotes.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={selectedNoteIds.length === paginatedNotes.length ? handleDeselectAll : handleSelectAll}
                className="px-4 py-2 bg-muted hover:bg-muted text-foreground rounded-lg transition-colors text-sm flex items-center gap-2"
              >
                {selectedNoteIds.length === paginatedNotes.length ? (
                  <>
                    <XCircle className="w-4 h-4" />
                    Deselect All on Page
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Select All on Page
                  </>
                )}
              </button>
              {selectedNoteIds.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {selectedNoteIds.length} selected
                </span>
              )}
            </div>
          )}
        </div>

        {/* Notes Grid */}
        {isLoading ? (
          <SkeletonGrid count={6} />
        ) : filteredNotes.length === 0 ? (
          <div className="bg-card rounded-lg shadow-sm">
            <EmptyState
              icon={StickyNote}
              title="No notes found"
              description={
                searchTerm || selectedCategory !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Upload and analyze meetings to see notes here'
              }
              action={
                !(searchTerm || selectedCategory !== 'all')
                  ? {
                    label: 'Go to Dashboard',
                    onClick: () => router.push('/dashboard'),
                  }
                  : undefined
              }
            />
          </div>
        ) : (
          <>
            <div className="bg-card rounded-lg shadow-sm divide-y divide-border">
              <DateGroupedList
                items={paginatedNotes}
                dateKey="date"
                renderItem={(note) => {
                  const isUrgent = note.urgency && note.urgency.toLowerCase() === 'yes';

                  const borderClass = note.completed
                    ? 'border-l-4 border-primary'
                    : isUrgent
                      ? 'border-l-4 border-red-500'
                      : '';

                  const bgClass = note.completed
                    ? 'bg-card'
                    : isUrgent
                      ? 'bg-red-50 dark:bg-red-900/20'
                      : 'bg-card';

                  return (
                    <div
                      key={note.id}
                      onClick={() => setSelectedNote(note)}
                      className={`p-5 hover:bg-muted transition-colors ${borderClass} ${bgClass} ${note.completed ? 'opacity-75' : ''}`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <div className="flex-shrink-0 pt-1">
                          <input
                            type="checkbox"
                            checked={selectedNoteIds.includes(parseInt(note.id.replace('note-', '')))}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleToggleSelectNote(note.id);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-5 h-5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                          />
                        </div>

                        {/* Date Badge */}
                        {note.date && (
                          <div className="flex-shrink-0">
                            <div className={`rounded-lg p-3 text-center min-w-[70px] ${isUrgent ? 'bg-red-100' : 'bg-primary/10'
                              }`}>
                              <div className={`text-2xl font-bold ${isUrgent ? 'text-red-700' : 'text-text-primary'
                                }`}>
                                {format(note.date, 'd')}
                              </div>
                              <div className={`text-xs uppercase ${isUrgent ? 'text-red-600' : 'text-primary'
                                }`}>
                                {format(note.date, 'MMM')}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              {/* Title */}
                              <div className="flex items-start gap-2 mb-1">
                                <h3 className={`text-lg font-semibold text-foreground ${note.completed ? 'line-through' : ''}`}>
                                  {note.title}
                                </h3>
                                {note.completed && (
                                  <span className="px-2 py-0.5 bg-primary/10 text-text-primary rounded text-xs font-medium flex-shrink-0">
                                    ✓ Done
                                  </span>
                                )}
                              </div>

                              {/* Metadata */}
                              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
                                <span className={`px-2 py-1 rounded-full text-xs border capitalize ${getCategoryColor(note.category)}`}>
                                  <Tag className="w-3 h-3 inline mr-1" />
                                  {note.category}
                                </span>
                                {note.meetingTitle && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-muted-foreground">from</span>
                                    <span className="font-medium">{note.meetingTitle}</span>
                                  </div>
                                )}
                              </div>

                              {/* Description */}
                              <p className="text-muted-foreground text-sm line-clamp-2 mb-2">{note.description}</p>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col justify-between items-end ml-4 gap-2">
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => handleEditNote(note, e)}
                              className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                              title="Edit note"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNote(note.id);
                              }}
                              className="p-2 rounded-full bg-muted text-muted-foreground hover:bg-red-100 hover:text-red-600 transition-colors"
                              title="Delete note"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
            </div>

            {filteredNotes.length > 12 && (
              <div className="mt-6 bg-card rounded-lg shadow-sm">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredNotes.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Note Modal */}
      {showAddNoteModal && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">Add New Note</h2>
              <button
                onClick={() => setShowAddNoteModal(false)}
                className="text-muted-foreground hover:text-muted-foreground"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Meeting Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Meeting
                </label>
                <select
                  value={newNoteData.meetingId}
                  onChange={(e) => setNewNoteData({ ...newNoteData, meetingId: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Select a meeting...</option>
                  {meetings.map((meeting) => (
                    <option key={meeting.job_id} value={meeting.job_id}>
                      {format(new Date(meeting.created_at), 'MMM dd, yyyy')} - Meeting
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category
                </label>
                <select
                  value={newNoteData.category}
                  onChange={(e) => setNewNoteData({ ...newNoteData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="GENERAL">General</option>
                  <option value="BUDGET">Budget</option>
                  <option value="DECISION">Decision</option>
                </select>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newNoteData.title}
                  onChange={(e) => setNewNoteData({ ...newNoteData, title: e.target.value })}
                  placeholder="Enter note title..."
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  value={newNoteData.description}
                  onChange={(e) => setNewNoteData({ ...newNoteData, description: e.target.value })}
                  placeholder="Enter note description..."
                  rows={4}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddNoteModal(false)}
                  className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNote}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                >
                  Add Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Note Detail Modal */}
      {selectedNote && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedNote(null)}>
          <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize border ${getCategoryColor(selectedNote.category)}`}>
                    {selectedNote.category}
                  </span>
                  {selectedNote.date && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-1" />
                      {format(selectedNote.date, 'MMMM dd, yyyy')}
                    </div>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-foreground">{selectedNote.title}</h2>
              </div>
              <button
                onClick={() => setSelectedNote(null)}
                className="text-muted-foreground hover:text-muted-foreground ml-4"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-foreground whitespace-pre-wrap">{selectedNote.description}</p>
              </div>

              {selectedNote.meetingId && (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-2">From meeting:</p>
                  <p className="font-medium text-foreground mb-4">{selectedNote.meetingTitle}</p>
                  <button
                    onClick={() => router.push(`/meeting?id=${selectedNote.meetingId}`)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                  >
                    <span>View Full Meeting</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Note Modal */}
      {editingNote && (
        <EditNoteModal
          note={{
            id: parseInt(editingNote.id.replace('note-', '')),
            title: editingNote.title,
            description: editingNote.description,
            category: editingNote.category,
          }}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingNote(null);
          }}
          onSave={handleSaveNote}
        />
      )}
    </div>
  );
}

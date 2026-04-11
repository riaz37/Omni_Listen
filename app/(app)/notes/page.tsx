'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { conversationsAPI } from '@/lib/api';
import { toast } from 'sonner';
import EmptyState from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import CustomDropdown from '@/components/ui/custom-dropdown';
import {
  StickyNote,
  Search,
  Plus,
  Trash2,
} from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';
import EditNoteModal from '@/components/EditNoteModal';
import { NotesSkeleton } from './NotesSkeleton';
import { Skeleton } from 'boneyard-js/react';
import { NoteStatsCards } from './NoteStatsCards';
import { NoteTable } from './NoteTable';
import { AddNoteModal } from './AddNoteModal';
import { NoteQuickViewModal } from './NoteQuickViewModal';
import PageEntrance from '@/components/ui/page-entrance';

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

export default function NotesPage() {
  const router = useRouter();
  const { user, loading } = useRequireAuth();

  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newNoteData, setNewNoteData] = useState({
    title: '',
    description: '',
    category: 'GENERAL',
    meetingId: '',
  });
  const [meetings, setMeetings] = useState<any[]>([]);
  const [selectedNoteIds, setSelectedNoteIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortColumn, setSortColumn] = useState<SortColumn>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState<'all' | 'completed'>('all');
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const [meetingsData, notesResponse, eventsResponse] = await Promise.all([
        conversationsAPI.getAllConversations(),
        conversationsAPI.getAllNotes(),
        conversationsAPI.getAllEvents(),
      ]);

      setMeetings(meetingsData);

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

            const noteTitle = note.title?.toLowerCase() || '';
            const hasCompletedRelatedTask = completedTasks.has(noteTitle);

            const meeting = meetingsData.find((m: any) => m.job_id === note.meeting_id);
            let meetingTitle = 'Manual Note';
            if (meeting) {
              const finalSummary =
                typeof meeting.final_summary === 'string'
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
          } catch (err) {}
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
      await conversationsAPI.createNote(newNoteData.meetingId, {
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
      fetchNotes();
    } catch (error) {
      toast.error('Failed to create note');
    }
  };

  const handleDeleteNote = (noteId: string) => {
    setConfirmDialog({
      title: 'Delete note',
      message: 'Are you sure you want to delete this note?',
      onConfirm: async () => {
        try {
          const numericId = parseInt(noteId.replace('note-', ''));
          await conversationsAPI.deleteNote(numericId);
          setNotes(notes.filter((note) => note.id !== noteId));
          toast.success('Note deleted successfully');
        } catch (error) {
          toast.error('Failed to delete note');
        }
      },
    });
  };

  const handleSaveNote = async (noteId: number, updates: any) => {
    try {
      await conversationsAPI.updateNote(noteId, updates);

      const updatedNotes = notes.map((n) => {
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
    setSelectedNoteIds((prev) =>
      prev.includes(numericId) ? prev.filter((id) => id !== numericId) : [...prev, numericId]
    );
  };

  const handleSelectAllOnPage = () => {
    const pageIds = paginatedNotes.map((n) => parseInt(n.id.replace('note-', '')));
    const allSelected = pageIds.every((id) => selectedNoteIds.includes(id));
    if (allSelected) {
      setSelectedNoteIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedNoteIds((prev) => [...new Set([...prev, ...pageIds])]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNoteIds.length === 0) {
      toast.error('No notes selected');
      return;
    }

    setConfirmDialog({
      title: 'Delete selected notes',
      message: `Are you sure you want to delete ${selectedNoteIds.length} selected note(s)?`,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          const result = await conversationsAPI.bulkDeleteNotes(selectedNoteIds);
          setNotes(
            notes.filter((n) => {
              const numericId = parseInt(n.id.replace('note-', ''));
              return !selectedNoteIds.includes(numericId);
            })
          );
          setSelectedNoteIds([]);
          toast.success(`Deleted ${result.deleted_count} note(s)`);
        } catch (error) {
          toast.error('Failed to delete selected notes');
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDir('asc');
    }
  };

  const filteredNotes = useMemo(() => {
    let result = notes
      .filter((note) => {
        if (activeTab === 'completed') return note.completed;
        return true;
      })
      .filter((note) => selectedCategory === 'all' || note.category === selectedCategory)
      .filter(
        (note) =>
          searchTerm === '' ||
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.description.toLowerCase().includes(searchTerm.toLowerCase())
      );

    result.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortColumn === 'title') return a.title.localeCompare(b.title) * dir;
      if (sortColumn === 'category') return a.category.localeCompare(b.category) * dir;
      if (sortColumn === 'source') return (a.meetingTitle || '').localeCompare(b.meetingTitle || '') * dir;
      if (sortColumn === 'date') {
        const aTime = a.date?.getTime() || 0;
        const bTime = b.date?.getTime() || 0;
        return (bTime - aTime) * dir;
      }
      return 0;
    });

    return result;
  }, [notes, activeTab, selectedCategory, searchTerm, sortColumn, sortDir]);

  const totalPages = Math.ceil(filteredNotes.length / rowsPerPage);
  const paginatedNotes = filteredNotes.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      general: 'bg-primary/10 text-primary',
      budget: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      decision: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      action: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    };
    return colors[category] || colors.general;
  };

  const stats = useMemo(() => {
    const total = notes.length;
    const general = notes.filter((n) => n.category === 'general').length;
    const decision = notes.filter((n) => n.category === 'decision').length;
    const budget = notes.filter((n) => n.category === 'budget').length;
    return { total, general, decision, budget };
  }, [notes]);

  return (
    <Skeleton name="notes-grid" loading={loading} fallback={<NotesSkeleton />}>
      <div className="min-h-screen bg-background">
        <PageEntrance name="notes" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Notes</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  All notes captured from your conversations
                </p>
              </div>
              <Button onClick={() => setShowAddNoteModal(true)} iconLeft={<Plus className="w-4 h-4" />}>
                Add Note
              </Button>
            </div>
          </div>

          <NoteStatsCards
            stats={stats}
            onFilterChange={(cat) => { setSelectedCategory(cat); setCurrentPage(1); }}
          />

          {/* Tabs */}
          <div className="flex border-b border-border mb-6">
            <button
              onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'all'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              All
            </button>
            <button
              onClick={() => { setActiveTab('completed'); setCurrentPage(1); }}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'completed'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Completed
            </button>
          </div>

          {/* Search & Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative w-full sm:w-auto sm:min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filter notes..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-4 py-2 bg-card text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground text-sm"
              />
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <span className="text-sm text-muted-foreground">Category</span>
              <CustomDropdown
                value={selectedCategory}
                onChange={(val) => { setSelectedCategory(val); setCurrentPage(1); }}
                options={[
                  { value: 'all', label: 'All Categories' },
                  { value: 'general', label: 'General' },
                  { value: 'decision', label: 'Decision' },
                  { value: 'budget', label: 'Budget' },
                ]}
              />

              {selectedNoteIds.length > 0 && (
                <>
                  <div className="w-px h-5 bg-border/60" />
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {selectedNoteIds.length} selected
                  </span>
                  <button
                    onClick={handleBulkDelete}
                    disabled={isDeleting}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-destructive-foreground bg-destructive hover:bg-destructive/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>

          <NoteTable
            paginatedNotes={paginatedNotes}
            filteredNotesCount={filteredNotes.length}
            selectedIds={selectedNoteIds}
            sortColumn={sortColumn}
            sortDir={sortDir}
            currentPage={currentPage}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            onSort={handleSort}
            onToggleSelect={handleToggleSelectNote}
            onSelectAllOnPage={handleSelectAllOnPage}
            onView={setSelectedNote}
            onDelete={handleDeleteNote}
            onSetCurrentPage={setCurrentPage}
            onSetRowsPerPage={(rows) => { setRowsPerPage(rows); setCurrentPage(1); }}
            getCategoryBadgeColor={getCategoryBadgeColor}
            isEmpty={notes.length === 0}
            hasFilters={searchTerm !== '' || selectedCategory !== 'all'}
          />
        </PageEntrance>

        <AddNoteModal
          show={showAddNoteModal}
          onClose={() => setShowAddNoteModal(false)}
          newNoteData={newNoteData}
          setNewNoteData={setNewNoteData}
          meetings={meetings}
          onSubmit={handleAddNote}
        />

        {selectedNote && (
          <NoteQuickViewModal
            note={selectedNote}
            onClose={() => setSelectedNote(null)}
            onViewDetails={(meetingId) => router.push(`/conversation?id=${meetingId}`)}
          />
        )}

        {confirmDialog && (
          <ConfirmDialog
            isOpen={!!confirmDialog}
            title={confirmDialog.title}
            message={confirmDialog.message}
            onConfirm={() => {
              confirmDialog.onConfirm();
              setConfirmDialog(null);
            }}
            onCancel={() => setConfirmDialog(null)}
          />
        )}

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
    </Skeleton>
  );
}

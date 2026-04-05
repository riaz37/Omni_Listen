'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { meetingsAPI } from '@/lib/api';
import { useToast } from '@/components/Toast';
import EmptyState from '@/components/EmptyState';
import PrimaryButton from '@/components/PrimaryButton';
import {
  StickyNote,
  Search,
  Plus,
  X,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';
import EditNoteModal from '@/components/EditNoteModal';
import { NotesSkeleton } from './NotesSkeleton';
import { Skeleton } from 'boneyard-js/react';
import { NoteCard } from './NoteCard';
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

export default function NotesPage() {
  const router = useRouter();
  const { user, loading } = useRequireAuth();
  const toast = useToast();

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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'type'>('date');
  const [confirmDialog, setConfirmDialog] = useState<{title: string; message: string; onConfirm: () => void} | null>(null);

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const [meetingsData, notesResponse, eventsResponse] = await Promise.all([
        meetingsAPI.getAllMeetings(),
        meetingsAPI.getAllNotes(),
        meetingsAPI.getAllEvents()
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
          await meetingsAPI.deleteNote(numericId);
          setNotes(notes.filter(note => note.id !== noteId));
          toast.success('Note deleted successfully');
        } catch (error) {
          toast.error('Failed to delete note');
        }
      },
    });
  };

  const handleSaveNote = async (noteId: number, updates: any) => {
    try {
      await meetingsAPI.updateNote(noteId, updates);

      const updatedNotes = notes.map(n => {
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
    const allNoteIds = filteredNotes.map(n => parseInt(n.id.replace('note-', '')));
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

    setConfirmDialog({
      title: 'Delete selected notes',
      message: `Are you sure you want to delete ${selectedNoteIds.length} selected note(s)?`,
      onConfirm: async () => {
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
      },
    });
  };

  const filteredNotes = useMemo(() => {
    return notes
      .filter(note => selectedCategory === 'all' || note.category === selectedCategory)
      .filter(note =>
        searchTerm === '' ||
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (a.date && b.date) {
          return b.date.getTime() - a.date.getTime();
        }
        if (a.date) return -1;
        if (b.date) return 1;
        return 0;
      });
  }, [notes, selectedCategory, searchTerm]);

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      general: 'bg-primary/10 text-primary',
      budget: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      decision: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      action: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    };
    return colors[category] || colors.general;
  };

  return (
    <Skeleton name="notes-grid" loading={loading} fallback={<NotesSkeleton />}>
      <div className="min-h-screen bg-background">

      <PageEntrance name="notes" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Note List</h1>
              <p className="text-muted-foreground text-sm">All notes captured from your meetings</p>
            </div>
            <PrimaryButton
              onClick={() => setShowAddNoteModal(true)}
              icon={Plus}
            >
              Add Note
            </PrimaryButton>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border mb-6">
          {['all', 'general', 'decision', 'budget'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedCategory(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${selectedCategory === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Search & Actions */}
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
          <div className="flex items-center gap-2 flex-wrap ml-auto">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-1.5 px-3 py-2 bg-card text-foreground border border-border rounded-lg hover:bg-muted transition-colors text-sm"
            >
              <CheckCircle className="w-4 h-4" />
              Select All
            </button>
            <button
              onClick={handleDeselectAll}
              className="flex items-center gap-1.5 px-3 py-2 bg-card text-foreground border border-border rounded-lg hover:bg-muted transition-colors text-sm"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
            <button
              onClick={selectedNoteIds.length > 0 ? handleBulkDelete : undefined}
              disabled={isDeleting || selectedNoteIds.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 bg-card text-destructive border border-border rounded-lg hover:bg-destructive/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
            <span className="text-sm text-muted-foreground">Sort By</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'type')}
              className="px-3 py-2 bg-card text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            >
              <option value="date">Events</option>
              <option value="type">Type</option>
            </select>
          </div>
        </div>

        {/* Notes Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg border border-border p-4 h-40 animate-pulse"></div>
            ))}
          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                isSelected={selectedNoteIds.includes(parseInt(note.id.replace('note-', '')))}
                onToggleSelect={handleToggleSelectNote}
                onView={setSelectedNote}
                onDelete={handleDeleteNote}
                openMenuId={openMenuId}
                onToggleMenu={(id) => setOpenMenuId(openMenuId === id ? null : id)}
                getCategoryBadgeColor={getCategoryBadgeColor}
              />
            ))}
          </div>
        )}
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
          onViewDetails={(meetingId) => router.push(`/meeting?id=${meetingId}`)}
        />
      )}

      {confirmDialog && (
        <ConfirmDialog
          isOpen={!!confirmDialog}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }}
          onCancel={() => setConfirmDialog(null)}
        />
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
    </Skeleton>
  );
}

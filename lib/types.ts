/**
 * TypeScript type definitions for the application
 */

// Conversation-related types
export interface Conversation {
  job_id: string;
  user_id?: number;
  created_at: string;
  raw_transcript?: string;
  final_summary: string | FinalSummary;
  user_input?: string;
  user_input_result?: string | Record<string, unknown>;
  calendar_synced?: boolean;
  events?: EventData[];
  title?: string;
  summary_preview?: string;
  event_count?: number;
  has_custom_query?: boolean;
  failed_at_stage?: string | null;
}

export interface FinalSummary {
  english?: string;
  arabic?: string;
  dated_events?: DatedEvent[];
  notes?: Note[];
  key_takeaways?: {
    english?: string;
    arabic?: string;
  };
}

export interface DatedEvent {
  date: string;
  title?: string;
  description?: string;
  location?: string;
  attendees?: string[];
  time?: string;
}

export interface Note {
  title?: string;
  description?: string;
  date?: string;
  type?: 'task' | 'deadline' | 'note';
  priority?: 'high' | 'medium' | 'low';
}

export interface EventData {
  id: number;
  conversation_id: number;
  event_type: 'dated_events' | 'notes';
  event_data: string | DatedEvent | Note;
}

// Calendar event type (for UI)
export interface CalendarEvent {
  id: string;
  eventItemId?: number;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  attendees?: string[];
  assignee?: string;
  conversationId?: string;
  type: 'conversation' | 'task' | 'deadline';
  synced?: boolean;
  calendarEventId?: string;
  isManual?: boolean;
  completed?: boolean;
  urgency?: 'yes' | 'no' | 'high' | 'medium' | 'low';
}

// User types
export interface User {
  id: number;
  email: string;
  name?: string;
  picture?: string;
  calendar_connected?: boolean;
  created_at?: string;
  has_password?: boolean;
}

// Preset types
export interface Preset {
  id: number;
  name: string;
  config: ProcessingConfig;
  is_default: boolean;
  created_at: string;
}

export interface ProcessingConfig {
  role?: string;
  output_fields?: {
    transcript?: boolean;
    summary_english?: boolean;
    summary_arabic?: boolean;
    action_items?: boolean;
    deadlines?: boolean;
    calendar_sync?: boolean;
    budget_notes?: boolean;
    decisions?: boolean;
    general_notes?: boolean;
  };
  user_input?: string;
  custom_field_only?: boolean;
}

// Webhook types
export interface WebhookData {
  id: number;
  url: string;
  name?: string;
  events: string[];
  is_active: boolean;
  failure_count: number;
  last_triggered_at?: string;
}

export interface ApiKeyData {
  id: number;
  key_prefix: string;
  name?: string;
  created_at: string;
  last_used_at?: string;
}

// Raw API response shapes (as returned by /api/all-events, /api/all-notes, /api/meetings)
export interface RawEvent {
  id: number;
  title?: string;
  date: string;
  assignee?: string;
  description?: string;
  urgency?: string;
  completed?: boolean;
  meeting_id?: string;
  category?: string;
}

export interface RawNote {
  id: number;
  title?: string;
  created_at?: string;
  completed?: boolean;
  category?: string;
  note_type?: string;
  description?: string;
  urgency?: string;
  meeting_id?: string;
  assignee?: string;
}

export interface RawMeetingSummary {
  job_id: string;
  title?: string;
  created_at: string;
  failed_at_stage?: string | null;
}

export type RecordingStatus = 'recording' | 'stopped' | 'processed' | 'failed';

export interface RecordingEntry {
  id: string;
  fileName: string;
  mimeType: string;
  status: RecordingStatus;
  startedAt: string;
  stoppedAt: string | null;
  duration: number;
  size: number;
}

export interface AvailableEvent {
  value: string;
  label: string;
}

export const AVAILABLE_EVENTS: AvailableEvent[] = [
  { value: 'meeting.processed', label: 'Meeting Processed' },
  { value: 'task.created', label: 'Task Created' },
  { value: 'event.completed', label: 'Event Completed' },
  { value: 'event.updated', label: 'Event Updated' },
  { value: 'event.deleted', label: 'Event Deleted' },
  { value: 'note.created', label: 'Note Created' },
  { value: 'note.deleted', label: 'Note Deleted' },
];

export interface WebhookData {
  id: number;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  created_at: string;
}

export interface ApiKeyData {
  id: number;
  name: string | null;
  key_prefix: string;
  created_at: string;
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

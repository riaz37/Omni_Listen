import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function truncate(str: string | null | undefined, length: number): string {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Normalizes urgency values from various LLM/API formats to 'yes' | 'no'.
 */
export function normalizeUrgency(raw: string | undefined | null): 'yes' | 'no' {
  const value = raw || 'no';
  return (value === 'high' || value === 'medium' || value === 'yes') ? 'yes' : 'no';
}

/**
 * Sort comparator: urgent first, then incomplete before complete, then by date ascending.
 */
export function sortByUrgencyThenDate<T extends { urgency?: string; completed: boolean; date: Date }>(a: T, b: T): number {
  const aLevel = normalizeUrgency(a.urgency);
  const bLevel = normalizeUrgency(b.urgency);
  if (aLevel !== bLevel) {
    return aLevel === 'yes' ? -1 : 1;
  }
  if (a.completed !== b.completed) {
    return a.completed ? 1 : -1;
  }
  return a.date.getTime() - b.date.getTime();
}

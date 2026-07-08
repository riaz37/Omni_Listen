import {
  Landmark,
  ListChecks,
  Settings,
  LayoutList,
  FileText,
  ClipboardList,
  ShieldAlert,
  CalendarClock,
  DollarSign,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface QuickChip {
  id: string;
  icon: LucideIcon;
  title: string;
  query: string;
}

/**
 * Quick-access chips for the Additional Analysis box. Clicking a chip fills
 * config.user_input with its query (clicking again clears it). Queries must
 * be unique, ≤1000 chars, and must not match the backend prompt-injection
 * sanitizer patterns (see backend/llm/prompts.py sanitize_user_input).
 */
export const QUICK_CHIPS: QuickChip[] = [
  {
    id: 'budget-concerns',
    icon: Landmark,
    title: 'Budget concerns',
    query: 'What were the main budget concerns discussed?',
  },
  {
    id: 'action-items',
    icon: ListChecks,
    title: 'Action items',
    query: 'List all action items with assigned owners and deadlines',
  },
  {
    id: 'technical-decisions',
    icon: Settings,
    title: 'Technical decisions',
    query: 'Summarize all technical decisions and their rationale',
  },
  {
    id: 'structured-summary',
    icon: LayoutList,
    title: 'Structured summary',
    query: 'Give a structured summary organized by topic, with key points and outcomes under each topic',
  },
  {
    id: 'general-summary',
    icon: FileText,
    title: 'General summary',
    query: 'Give a general overview summary of the whole conversation in plain language',
  },
  {
    id: 'client-requirements',
    icon: ClipboardList,
    title: 'Client requirements',
    query: 'List all client requirements and feature requests discussed, with their specifics',
  },
  {
    id: 'risks-blockers',
    icon: ShieldAlert,
    title: 'Risks & blockers',
    query: 'List all risks, blockers, and concerns raised, and who raised them',
  },
  {
    id: 'follow-ups',
    icon: CalendarClock,
    title: 'Follow-ups & commitments',
    query: 'List all follow-ups and commitments made, who committed, and by when',
  },
  {
    id: 'financial-figures',
    icon: DollarSign,
    title: 'Financial figures',
    query: 'List all financial figures, amounts, and costs mentioned with their context',
  },
];

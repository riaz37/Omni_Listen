'use client';

import Link from 'next/link';
import {
  Mic,
  History,
  Calendar,
  CheckSquare,
  StickyNote,
  BarChart3,
  MessageSquare,
  CalendarDays,
  LucideIcon,
} from 'lucide-react';

type EmptyStateVariant =
  | 'dashboard'
  | 'history'
  | 'events'
  | 'tasks'
  | 'notes'
  | 'analytics'
  | 'queries'
  | 'calendar';

interface VariantConfig {
  icon: LucideIcon;
  title: string;
  description: string;
  cta?: {
    label: string;
    href: string;
  };
}

const variantConfigs: Record<EmptyStateVariant, VariantConfig> = {
  dashboard: {
    icon: Mic,
    title: 'No meetings yet',
    description: 'Record or upload your first meeting to get started',
    cta: { label: 'Record Meeting', href: '/dashboard' },
  },
  history: {
    icon: History,
    title: 'No meeting history',
    description: 'Your analyzed meetings will appear here',
    cta: { label: 'Record a Meeting', href: '/dashboard' },
  },
  events: {
    icon: Calendar,
    title: 'No events found',
    description: 'Events will be extracted from your meetings automatically',
  },
  tasks: {
    icon: CheckSquare,
    title: 'No tasks yet',
    description: 'Tasks will be created from your meeting action items',
  },
  notes: {
    icon: StickyNote,
    title: 'No notes yet',
    description: 'Notes from your meetings will appear here',
  },
  analytics: {
    icon: BarChart3,
    title: 'No analytics data',
    description: 'Upload your first meeting to see analytics',
    cta: { label: 'Go to Dashboard', href: '/dashboard' },
  },
  queries: {
    icon: MessageSquare,
    title: 'No analyses yet',
    description: 'Ask questions about your meetings to get insights',
  },
  calendar: {
    icon: CalendarDays,
    title: 'Calendar not connected',
    description: 'Connect your Google Calendar to see upcoming events',
    cta: { label: 'Connect Calendar', href: '/settings' },
  },
};

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  variant,
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  const config = variant ? variantConfigs[variant] : undefined;

  const Icon = icon ?? config?.icon;
  const displayTitle = title ?? config?.title ?? 'Nothing here yet';
  const displayDescription =
    description ?? config?.description ?? 'No data to display';
  const ctaConfig = config?.cta;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && (
        <div className="bg-card-2 rounded-full p-6 mb-4">
          <Icon className="w-12 h-12 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {displayTitle}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {displayDescription}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors"
        >
          {action.label}
        </button>
      )}
      {!action && ctaConfig && (
        <Link
          href={ctaConfig.href}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors"
        >
          {ctaConfig.label}
        </Link>
      )}
    </div>
  );
}

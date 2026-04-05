'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
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
import {
  DURATIONS,
  SPRINGS,
  TRANSITIONS,
  prefersReducedMotion,
} from '@/lib/motion';

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
    title: 'All caught up!',
    description: 'Tasks from your meeting action items will show up here',
  },
  notes: {
    icon: StickyNote,
    title: 'No notes yet',
    description: 'Notes from your meetings will appear here',
  },
  analytics: {
    icon: BarChart3,
    title: 'No analytics data',
    description: 'Upload your first meeting to see insights',
    cta: { label: 'Go to Dashboard', href: '/dashboard' },
  },
  queries: {
    icon: MessageSquare,
    title: 'Ask anything',
    description: 'Try asking a question about your meetings to get insights',
  },
  calendar: {
    icon: CalendarDays,
    title: 'Calendar not connected',
    description: 'Connect your Google Calendar to see upcoming events',
    cta: { label: 'Connect Calendar', href: '/settings' },
  },
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: DURATIONS.normal,
      staggerChildren: 0.08,
    },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITIONS.enter,
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

  const reduced = prefersReducedMotion();
  const Container = reduced ? 'div' : motion.div;
  const Child = reduced ? 'div' : motion.div;

  const containerProps = reduced
    ? {}
    : { variants: containerVariants, initial: 'hidden', animate: 'visible' };
  const childProps = reduced ? {} : { variants: childVariants };

  return (
    <Container
      className="flex flex-col items-center justify-center py-12 px-4 text-center dot-grid-bg rounded-xl"
      {...containerProps}
    >
      {Icon && (
        <Child
          className="bg-card rounded-full p-6 mb-4 shadow-sm"
          {...childProps}
        >
          <Icon className={`w-12 h-12 text-muted-foreground ${reduced ? '' : 'animate-float'}`} />
        </Child>
      )}
      <Child {...childProps}>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {displayTitle}
        </h3>
      </Child>
      <Child {...childProps}>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          {displayDescription}
        </p>
      </Child>
      {action && (
        <Child {...childProps}>
          <button
            onClick={action.onClick}
            className="relative px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors"
          >
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-lg animate-ping [animation-iteration-count:3] bg-primary/20 pointer-events-none" style={{ animationDuration: '3s' }} />
            {action.label}
          </button>
        </Child>
      )}
      {!action && ctaConfig && (
        <Child {...childProps}>
          <Link
            href={ctaConfig.href}
            className="relative px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors"
          >
            <span className="absolute inset-0 rounded-lg animate-ping [animation-iteration-count:3] bg-primary/20 pointer-events-none" style={{ animationDuration: '3s' }} />
            {ctaConfig.label}
          </Link>
        </Child>
      )}
    </Container>
  );
}

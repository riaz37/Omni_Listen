'use client';

import Link from 'next/link';
import { Calendar, Mic, BarChart3, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface OnboardingStep {
  number: number;
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}

const onboardingSteps: readonly OnboardingStep[] = [
  {
    number: 1,
    icon: Calendar,
    title: 'Connect Calendar',
    description: 'Sync your Google Calendar to automatically capture meetings.',
    href: '/settings',
    linkLabel: 'Go to Settings',
  },
  {
    number: 2,
    icon: Mic,
    title: 'Record First Meeting',
    description: 'Start recording or upload an audio file to get transcripts and insights.',
    href: '/dashboard',
    linkLabel: 'Start Recording',
  },
  {
    number: 3,
    icon: BarChart3,
    title: 'Explore Insights',
    description: 'View analytics, action items, and summaries from your meetings.',
    href: '/analytics',
    linkLabel: 'View Analytics',
  },
] as const;

interface WelcomeCardProps {
  onDismiss: () => void;
}

export default function WelcomeCard({ onDismiss }: WelcomeCardProps) {
  return (
    <div className="bg-card-2 rounded-xl p-6 relative">
      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
        aria-label="Dismiss welcome card"
      >
        <X className="w-5 h-5" />
      </button>

      <h2 className="text-lg font-semibold text-foreground mb-1">
        Welcome to Esap Listen
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Get started in three simple steps.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        {onboardingSteps.map((step) => (
          <div
            key={step.number}
            className="flex flex-col gap-3 rounded-lg border border-card-border bg-card p-4"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {step.number}
              </span>
              <step.icon className="h-5 w-5 text-primary" />
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {step.description}
              </p>
            </div>

            <Link
              href={step.href}
              className="mt-auto inline-flex items-center text-xs font-medium text-primary hover:underline"
            >
              {step.linkLabel} &rarr;
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

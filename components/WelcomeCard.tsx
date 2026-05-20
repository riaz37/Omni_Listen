'use client';

import Link from 'next/link';
import { Calendar, Mic, BarChart3, X } from 'lucide-react';
import { useLocalePath } from '@/lib/i18n/use-locale-path';
import { useTranslation } from '@/lib/i18n/use-translation';
import type { LucideIcon } from 'lucide-react';

interface OnboardingStep {
  number: number;
  icon: LucideIcon;
  titleKey: string;
  descriptionKey: string;
  href: string;
  linkLabelKey: string;
}

const onboardingSteps: readonly OnboardingStep[] = [
  {
    number: 1,
    icon: Calendar,
    titleKey: 'common_ui.welcome.step1_title',
    descriptionKey: 'common_ui.welcome.step1_desc',
    href: '/settings',
    linkLabelKey: 'common_ui.welcome.step1_link',
  },
  {
    number: 2,
    icon: Mic,
    titleKey: 'common_ui.welcome.step2_title',
    descriptionKey: 'common_ui.welcome.step2_desc',
    href: '/listen',
    linkLabelKey: 'common_ui.welcome.step2_link',
  },
  {
    number: 3,
    icon: BarChart3,
    titleKey: 'common_ui.welcome.step3_title',
    descriptionKey: 'common_ui.welcome.step3_desc',
    href: '/analytics',
    linkLabelKey: 'common_ui.welcome.step3_link',
  },
] as const;

interface WelcomeCardProps {
  onDismiss: () => void;
}

export default function WelcomeCard({ onDismiss }: WelcomeCardProps) {
  const lp = useLocalePath();
  const { t } = useTranslation();
  return (
    <div className="bg-card-2 rounded-xl p-6 relative">
      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
        aria-label={t('common_ui.welcome.dismiss')}
      >
        <X className="w-5 h-5" />
      </button>

      <h2 className="text-lg font-semibold text-foreground mb-1">
        {t('common_ui.welcome.title')}
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        {t('common_ui.welcome.subtitle')}
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
                {t(step.titleKey)}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {t(step.descriptionKey)}
              </p>
            </div>

            <Link
              href={lp(step.href)}
              className="mt-auto inline-flex items-center text-xs font-medium text-primary hover:underline"
            >
              {t(step.linkLabelKey)} &rarr;
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

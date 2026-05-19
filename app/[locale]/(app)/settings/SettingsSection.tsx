'use client';

import { cn } from '@/lib/utils';

interface SettingsSectionProps {
  id?: string;
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function SettingsSection({
  id,
  icon,
  title,
  description,
  action,
  children,
  className,
}: SettingsSectionProps) {
  return (
    <section
      id={id}
      className={cn('bg-card rounded-xl border border-border p-6', className)}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            {icon}
            {title}
          </h2>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0 ml-4">{action}</div>}
      </div>
      {children}
    </section>
  );
}

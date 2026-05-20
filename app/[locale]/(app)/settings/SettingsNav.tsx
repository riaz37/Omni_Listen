'use client';

import { useEffect, useRef, useState } from 'react';
import { User, Calendar, Chrome, Monitor, Webhook, Key } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/use-translation';

export function SettingsNav() {
  const { t } = useTranslation();
  const [activeId, setActiveId] = useState('profile');
  const observerRef = useRef<IntersectionObserver | null>(null);

  const NAV_GROUPS = [
    {
      label: t('settings.nav.group_account'),
      items: [
        { id: 'profile', label: t('settings.nav.item_profile'), icon: <User className="w-4 h-4" /> },
        { id: 'calendar', label: t('settings.nav.item_calendar'), icon: <Calendar className="w-4 h-4" /> },
      ],
    },
    {
      label: t('settings.nav.group_apps'),
      items: [
        { id: 'extension', label: t('settings.nav.item_extension'), icon: <Chrome className="w-4 h-4" /> },
        { id: 'desktop', label: t('settings.nav.item_desktop'), icon: <Monitor className="w-4 h-4" /> },
      ],
    },
    {
      label: t('settings.nav.group_developer'),
      items: [
        { id: 'webhooks', label: t('settings.nav.item_webhooks'), icon: <Webhook className="w-4 h-4" /> },
        { id: 'api-keys', label: t('settings.nav.item_api_keys'), icon: <Key className="w-4 h-4" /> },
      ],
    },
  ];

  useEffect(() => {
    const ids = NAV_GROUPS.flatMap(g => g.items.map(i => i.id));
    const elements = ids
      .map(id => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    observerRef.current = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 },
    );

    elements.forEach(el => observerRef.current!.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="hidden lg:block sticky top-24 self-start">
      <div className="space-y-6">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-3">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleClick(item.id)}
                  className={cn(
                    'flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-colors',
                    activeId === item.id
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                  )}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}

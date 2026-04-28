'use client';

import { useEffect, useRef, useState } from 'react';
import { User, Calendar, Chrome, Monitor, Webhook, Key, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavGroup {
  label: string;
  items: { id: string; label: string; icon: React.ReactNode }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Account',
    items: [
      { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
      { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Apps & Devices',
    items: [
      { id: 'extension', label: 'Extension', icon: <Chrome className="w-4 h-4" /> },
      { id: 'desktop', label: 'Desktop App', icon: <Monitor className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Developer',
    items: [
      { id: 'webhooks', label: 'Webhooks', icon: <Webhook className="w-4 h-4" /> },
      { id: 'api-keys', label: 'API Keys', icon: <Key className="w-4 h-4" /> },
    ],
  },
  {
    label: 'Data',
    items: [
      { id: 'recordings', label: 'Recordings', icon: <Mic className="w-4 h-4" /> },
    ],
  },
];

export function SettingsNav() {
  const [activeId, setActiveId] = useState('profile');
  const observerRef = useRef<IntersectionObserver | null>(null);

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

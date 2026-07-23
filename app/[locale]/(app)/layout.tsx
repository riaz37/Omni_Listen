'use client';

import Navigation from '@/components/Navigation';
import '@/lib/boneyard-config';
// Import bones registry once generated: import './bones/registry';

// PageTransition lives in template.tsx, not here — layouts persist across
// navigations by design, which breaks AnimatePresence's exit tracking (see
// template.tsx for details). Navigation must stay in the layout so it
// doesn't remount on every route change.
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {children}
    </div>
  );
}

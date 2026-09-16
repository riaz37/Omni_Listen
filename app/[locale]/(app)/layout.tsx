import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';

// A server component, purely so it can export metadata. Navigation is still a
// client component; a server layout renders one fine. The boneyard side-effect
// import that used to force 'use client' here now lives in template.tsx, which
// is a client component already. Module imports are cached, so the side effect
// still runs exactly once despite the template remounting per navigation.
//
// PageTransition lives in template.tsx, not here. Layouts persist across
// navigations by design, which breaks AnimatePresence's exit tracking (see
// template.tsx for details). Navigation must stay in the layout so it doesn't
// remount on every route change.

// Signed-in surfaces. Nothing under this group should ever reach an index, and
// metadata merges down the tree, so this one export covers all ten app pages.
// robots.txt disallows the same paths; this is the belt to that braces, since
// a disallowed URL can still be indexed from an external link.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

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

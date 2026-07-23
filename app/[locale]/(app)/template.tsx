'use client';

import PageTransition from '@/components/ui/page-transition';

// Next.js templates create a brand-new instance on every navigation, unlike
// layouts, which deliberately persist across route changes. AnimatePresence
// needs that clean mount/unmount lifecycle to track enter/exit correctly —
// wrapping it in layout.tsx instead let Next's router-cache-restored
// navigations (e.g. router.back()) desync from framer-motion's exit
// tracking, leaving pages permanently stuck invisible.
export default function AppTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransition>{children}</PageTransition>;
}

'use client';

import PageTransition from '@/components/ui/page-transition';
import '@/lib/boneyard-config';
// Import bones registry once generated: import './bones/registry';

// Next.js templates create a brand-new instance on every navigation, unlike
// layouts, which deliberately persist across route changes. AnimatePresence
// needs that clean mount/unmount lifecycle to track enter/exit correctly.
// Wrapping it in layout.tsx instead let Next's router-cache-restored
// navigations (e.g. router.back()) desync from framer-motion's exit tracking,
// leaving pages permanently stuck invisible.
//
// The boneyard-config import lives here rather than in layout.tsx so that
// layout.tsx can be a server component and export noindex metadata. It is a
// module side effect, and module evaluation is cached, so it runs once per
// page load no matter how often this template remounts.
export default function AppTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransition>{children}</PageTransition>;
}

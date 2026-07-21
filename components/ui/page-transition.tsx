'use client';

import { usePathname } from 'next/navigation';
import { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  NAV_INDEX,
  pageVariants,
  pageTransition,
  prefersReducedMotion,
} from '@/lib/motion';

/**
 * Directional page transition wrapper.
 *
 * Tracks the previous pathname's nav index to determine slide direction:
 * - Forward (higher index): content slides LEFT
 * - Backward (lower index): content slides RIGHT
 *
 * Wraps children with AnimatePresence + motion.div.
 * Navigation bar stays fixed outside this wrapper.
 */
export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // usePathname() returns the locale-prefixed path (e.g. "/en/history");
  // NAV_INDEX is keyed without the locale segment.
  const routePath = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '');
  const prevIndexRef = useRef<number>(NAV_INDEX[routePath] ?? 0);

  const currentIndex = NAV_INDEX[routePath] ?? prevIndexRef.current;
  const direction = currentIndex >= prevIndexRef.current ? 1 : -1;

  // Update ref AFTER computing direction
  prevIndexRef.current = currentIndex;

  // Skip animation entirely for reduced motion
  if (prefersReducedMotion()) {
    return <>{children}</>;
  }

  return (
    // No mode="wait": with it, a route restored from Next.js's client-side
    // router cache (e.g. router.back()) can arrive faster than framer-motion's
    // exit-tracking expects, so the "wait for the old page to finish exiting"
    // gate never resolves — the new page mounts, sits at its enter() styles
    // (opacity: 0), and never animates to center(), leaving a permanently
    // blank page with no error. Letting both pages animate concurrently
    // removes that gate entirely.
    <AnimatePresence custom={direction} initial={false}>
      <motion.div
        key={pathname}
        custom={direction}
        variants={pageVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={pageTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

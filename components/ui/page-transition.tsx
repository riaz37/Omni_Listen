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
  const prevIndexRef = useRef<number>(NAV_INDEX[pathname] ?? 0);

  const currentIndex = NAV_INDEX[pathname] ?? prevIndexRef.current;
  const direction = currentIndex >= prevIndexRef.current ? 1 : -1;

  // Update ref AFTER computing direction
  prevIndexRef.current = currentIndex;

  // Skip animation entirely for reduced motion
  if (prefersReducedMotion()) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait" custom={direction} initial={false}>
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

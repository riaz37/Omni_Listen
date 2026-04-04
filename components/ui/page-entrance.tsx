'use client';

import { motion, type Variants } from 'framer-motion';
import {
  DURATIONS,
  DISTANCES,
  EASINGS,
  STAGGER,
  prefersReducedMotion,
} from '@/lib/motion';
import { useRef } from 'react';

const ANIMATED_PAGES_KEY = 'esap-animated-pages';

function useFirstVisit(pageName: string): boolean {
  const checkedRef = useRef(false);
  const isFirstRef = useRef(false);

  if (!checkedRef.current && typeof window !== 'undefined') {
    checkedRef.current = true;
    try {
      const raw = sessionStorage.getItem(ANIMATED_PAGES_KEY);
      const visited: string[] = raw ? JSON.parse(raw) : [];
      if (!visited.includes(pageName)) {
        isFirstRef.current = true;
        sessionStorage.setItem(
          ANIMATED_PAGES_KEY,
          JSON.stringify([...visited, pageName]),
        );
      }
    } catch {
      // sessionStorage unavailable
    }
  }

  return isFirstRef.current;
}

interface PageEntranceProps {
  /** Page name for first-visit tracking (e.g. "dashboard") */
  name: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps page content with stagger entrance animation.
 * First visit: slower (500ms), subsequent: fast (200ms).
 * Direct children become stagger items — wrap sections in divs.
 *
 * Usage:
 * ```tsx
 * <PageEntrance name="tasks" className="max-w-7xl mx-auto px-4 py-8">
 *   <div>Header section</div>
 *   <div>Stats cards</div>
 *   <div>Table</div>
 * </PageEntrance>
 * ```
 */
export default function PageEntrance({
  name,
  children,
  className,
}: PageEntranceProps) {
  const firstVisit = useFirstVisit(name);

  if (prefersReducedMotion()) {
    return <div className={className}>{children}</div>;
  }

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: firstVisit ? STAGGER.slow : STAGGER.fast,
        delayChildren: firstVisit ? 0.1 : 0.02,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: DISTANCES.small },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: firstVisit ? DURATIONS.slow : DURATIONS.fast,
        ease: EASINGS.easeOut,
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {Array.isArray(children)
        ? children.map((child, i) =>
            child ? (
              <motion.div key={i} variants={itemVariants}>
                {child}
              </motion.div>
            ) : null,
          )
        : (
          <motion.div variants={itemVariants}>
            {children}
          </motion.div>
        )}
    </motion.div>
  );
}

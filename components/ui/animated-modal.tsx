'use client';

import { useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  DURATIONS,
  EASINGS,
  SPRINGS,
  TRANSITIONS,
  prefersReducedMotion,
} from '@/lib/motion';

interface AnimatedModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Max width class (default: "max-w-md") */
  className?: string;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATIONS.fast } },
  exit: { opacity: 0, transition: { duration: DURATIONS.fast } },
};

const desktopVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, ...SPRINGS.default },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: DURATIONS.fast, ease: EASINGS.easeIn },
  },
};

const mobileVariants = {
  hidden: { opacity: 0, y: '100%' },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
  },
  exit: {
    opacity: 0,
    y: '100%',
    transition: { duration: DURATIONS.fast, ease: EASINGS.easeIn },
  },
};

/**
 * Animated modal wrapper. Replaces conditional rendering with AnimatePresence.
 *
 * Usage:
 * ```tsx
 * <AnimatedModal open={show} onClose={handleClose}>
 *   <div className="p-6">Modal content</div>
 * </AnimatedModal>
 * ```
 */
export default function AnimatedModal({
  open,
  onClose,
  children,
  className = 'max-w-md',
}: AnimatedModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (prefersReducedMotion()) {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          className={`relative bg-card rounded-lg shadow-xl w-full ${className}`}
          role="dialog"
          aria-modal="true"
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Desktop modal */}
          <motion.div
            className={`relative bg-card rounded-t-2xl sm:rounded-lg shadow-xl w-full ${className} hidden sm:block`}
            variants={desktopVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
          >
            {children}
          </motion.div>

          {/* Mobile slide-up */}
          <motion.div
            className={`relative bg-card rounded-t-2xl shadow-xl w-full sm:hidden max-h-[85vh] overflow-y-auto`}
            variants={mobileVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-2 pb-1 sticky top-0">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

'use client';

import { useEffect, useCallback } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
  type PanInfo,
} from 'framer-motion';
import { DURATIONS, EASINGS, prefersReducedMotion } from '@/lib/motion';

interface AnimatedSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Title shown in the sheet header */
  title?: string;
}

const SWIPE_CLOSE_THRESHOLD = 100;
const SWIPE_VELOCITY_THRESHOLD = 500;

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATIONS.fast } },
  exit: { opacity: 0, transition: { duration: DURATIONS.instant } },
};

const sheetVariants = {
  hidden: { y: '100%' },
  visible: {
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 25 },
  },
  exit: {
    y: '100%',
    transition: { duration: DURATIONS.fast, ease: EASINGS.easeIn },
  },
};

/**
 * Mobile bottom sheet with swipe-to-dismiss.
 *
 * Usage:
 * ```tsx
 * <AnimatedSheet open={show} onClose={handleClose} title="Options">
 *   <div className="p-4">Sheet content</div>
 * </AnimatedSheet>
 * ```
 */
export default function AnimatedSheet({
  open,
  onClose,
  children,
  title,
}: AnimatedSheetProps) {
  const controls = useAnimation();
  const y = useMotionValue(0);
  const backdropOpacity = useTransform(y, [0, 300], [1, 0]);

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

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const shouldClose =
        info.offset.y > SWIPE_CLOSE_THRESHOLD ||
        info.velocity.y > SWIPE_VELOCITY_THRESHOLD;

      if (shouldClose) {
        controls.start('exit').then(onClose);
      } else {
        controls.start('visible');
      }
    },
    [controls, onClose],
  );

  if (prefersReducedMotion()) {
    if (!open) return null;
    return (
      <>
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
        <div
          className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 max-h-[70vh] overflow-y-auto rounded-t-2xl"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          {title && (
            <div className="px-5 py-3 border-b border-border">
              <span className="text-sm font-semibold text-foreground">
                {title}
              </span>
            </div>
          )}
          {children}
        </div>
      </>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 z-40"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ opacity: backdropOpacity }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 max-h-[70vh] overflow-y-auto rounded-t-2xl"
            variants={sheetVariants}
            initial="hidden"
            animate={controls}
            exit="exit"
            style={{ y }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            {/* Handle bar (drag target) */}
            <div className="flex justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {title && (
              <div className="px-5 py-2">
                <span className="text-sm font-semibold text-foreground">
                  {title}
                </span>
              </div>
            )}

            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

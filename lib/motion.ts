import type { Transition, Variants } from 'framer-motion';

// ─── Duration tokens (ms → seconds for Framer Motion) ───────────────────────

export const DURATIONS = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  dramatic: 0.7,
} as const;

// ─── Easing curves ──────────────────────────────────────────────────────────

export const EASINGS = {
  easeOut: [0, 0, 0.2, 1] as const,
  easeIn: [0.4, 0, 1, 1] as const,
  easeInOut: [0.4, 0, 0.2, 1] as const,
} as const;

// ─── Spring configs ─────────────────────────────────────────────────────────

export const SPRINGS = {
  default: { stiffness: 300, damping: 24, mass: 0.8 },
  gentle: { stiffness: 120, damping: 20 },
  bouncy: { stiffness: 400, damping: 15 },
  snappy: { stiffness: 500, damping: 30 },
} as const;

// ─── Distance tokens (px) ───────────────────────────────────────────────────

export const DISTANCES = {
  micro: 4,
  small: 8,
  medium: 16,
  large: 24,
} as const;

// ─── Navigation index map (for directional page transitions) ────────────────

export const NAV_INDEX: Record<string, number> = {
  '/listen': 0,
  '/analytics': 1,
  '/history': 2,
  '/calendar': 3,
  '/events': 4,
  '/tasks': 5,
  '/notes': 6,
  '/queries': 7,
  '/settings': 8,
};

// ─── Stagger delay caps ────────────────────────────────────────────────────

export const STAGGER = {
  fast: 0.03,
  normal: 0.04,
  slow: 0.06,
  /** Max items to stagger on mobile */
  mobileMaxItems: 3,
} as const;

// ─── Reusable transition presets ────────────────────────────────────────────

export const TRANSITIONS = {
  enter: {
    duration: DURATIONS.normal,
    ease: EASINGS.easeOut,
  } satisfies Transition,
  exit: {
    duration: DURATIONS.fast,
    ease: EASINGS.easeIn,
  } satisfies Transition,
  spring: {
    type: 'spring' as const,
    ...SPRINGS.default,
  } satisfies Transition,
  gentle: {
    type: 'spring' as const,
    ...SPRINGS.gentle,
  } satisfies Transition,
  page: {
    duration: DURATIONS.normal,
    ease: EASINGS.easeOut,
  } satisfies Transition,
} as const;

// ─── Shared animation variants ─────────────────────────────────────────────

/** Fade + slide up (most common entrance) */
export const fadeSlideUp: Variants = {
  hidden: { opacity: 0, y: DISTANCES.small },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITIONS.enter,
  },
  exit: {
    opacity: 0,
    y: -DISTANCES.micro,
    transition: TRANSITIONS.exit,
  },
};

/** Fade only */
export const fadeOnly: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DURATIONS.fast },
  },
  exit: {
    opacity: 0,
    transition: { duration: DURATIONS.fast },
  },
};

/** Scale + fade (modals, empty states) */
export const scaleFade: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: TRANSITIONS.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: TRANSITIONS.exit,
  },
};

/** Stagger container — wrap children that each use a child variant */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: STAGGER.normal,
      delayChildren: 0.05,
    },
  },
};

/** Child variant for staggered lists */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: DISTANCES.small },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITIONS.enter,
  },
};

// ─── Page transition variants (directional) ─────────────────────────────────

const PAGE_SLIDE_DESKTOP = DISTANCES.small;
const PAGE_SLIDE_MOBILE = DISTANCES.micro;

/** Returns slide distance — smaller on mobile */
function getSlideDistance(): number {
  if (typeof window === 'undefined') return PAGE_SLIDE_DESKTOP;
  return window.innerWidth < 768 ? PAGE_SLIDE_MOBILE : PAGE_SLIDE_DESKTOP;
}

/**
 * Page transition variants.
 * `custom` = direction: 1 (forward/slide left) or -1 (backward/slide right)
 */
export const pageVariants: Variants = {
  enter: (direction: number) => ({
    x: direction * getSlideDistance(),
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction * -getSlideDistance(),
    opacity: 0,
  }),
};

export const pageTransition: Transition = {
  duration: DURATIONS.normal,
  ease: EASINGS.easeOut,
};

// ─── Reduced motion helper ──────────────────────────────────────────────────

/**
 * Returns true when the user prefers reduced motion.
 * Safe for SSR (returns false on server).
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ─── First-visit animation speed ───────────────────────────────────────────

const ANIMATED_PAGES_KEY = 'esap-animated-pages';

/**
 * Returns true if this page has NOT been animated yet this session.
 * Marks the page as animated on first call.
 * First visit → slow (500ms), returning → fast (200ms).
 */
export function isFirstVisit(pageName: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = sessionStorage.getItem(ANIMATED_PAGES_KEY);
    const visited: string[] = raw ? JSON.parse(raw) : [];
    if (visited.includes(pageName)) return false;
    sessionStorage.setItem(
      ANIMATED_PAGES_KEY,
      JSON.stringify([...visited, pageName]),
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns stagger container variants with speed based on first visit.
 * First visit: slower stagger + delay. Return visit: snappy.
 */
export function getPageStagger(pageName: string) {
  const first = isFirstVisit(pageName);
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: first ? STAGGER.slow : STAGGER.fast,
        delayChildren: first ? 0.1 : 0.02,
      },
    },
  } satisfies Variants;
}

/**
 * Returns child item variants with speed based on first visit.
 */
export function getPageItem(firstVisit: boolean) {
  return {
    hidden: { opacity: 0, y: DISTANCES.small },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: firstVisit ? DURATIONS.slow : DURATIONS.fast,
        ease: EASINGS.easeOut,
      },
    },
  } satisfies Variants;
}

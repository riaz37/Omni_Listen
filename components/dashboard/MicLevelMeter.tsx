'use client';

import { prefersReducedMotion } from '@/lib/motion';

interface MicLevelMeterProps {
  /** 0..1 RMS level, e.g. from GlobalStateContext's audioLevel. */
  readonly level: number;
  /** Whether a live stream (recording or preview) is actually feeding this meter. */
  readonly active: boolean;
  readonly segments?: number;
  readonly className?: string;
}

/**
 * A compact Meet-style level meter: a handful of segments that light up
 * proportional to the input level. Deliberately NOT a framer-motion
 * component — it's a high-frequency, low-drama indicator, so a plain CSS
 * transition is enough. Always dir="ltr": a level meter is a physical
 * quantity (more bars = louder), not a piece of reading-direction UI, and
 * must not mirror in RTL layouts.
 */
export default function MicLevelMeter({ level, active, segments = 5, className = '' }: MicLevelMeterProps) {
  const litCount = active ? Math.max(0, Math.min(segments, Math.round(level * segments))) : 0;
  const transitionDuration = prefersReducedMotion() ? '0ms' : '100ms';

  return (
    <span
      dir="ltr"
      data-testid="mic-level-meter"
      className={`inline-flex items-center gap-0.5 ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: segments }, (_, i) => {
        const lit = i < litCount;
        return (
          <span
            key={i}
            data-testid={lit ? 'mic-level-segment-lit' : 'mic-level-segment'}
            className={`h-2.5 w-0.5 rounded-full transition-colors ${lit ? 'bg-primary' : 'bg-muted-foreground/20'}`}
            style={{ transitionDuration }}
          />
        );
      })}
    </span>
  );
}

import React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MicLevelMeter from '@/components/dashboard/MicLevelMeter';

function mockReducedMotion(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('MicLevelMeter', () => {
  it('lights segments proportional to the level when active', () => {
    mockReducedMotion(false);
    render(<MicLevelMeter level={0.6} active segments={5} />);
    const lit = screen.getAllByTestId('mic-level-segment-lit');
    expect(lit).toHaveLength(3); // round(0.6 * 5)
  });

  it('shows zero lit segments when inactive, regardless of level', () => {
    mockReducedMotion(false);
    render(<MicLevelMeter level={0.9} active={false} segments={5} />);
    expect(screen.queryAllByTestId('mic-level-segment-lit')).toHaveLength(0);
  });

  it('is wrapped in a fixed LTR direction so it never mirrors in RTL layouts', () => {
    mockReducedMotion(false);
    render(<MicLevelMeter level={0.5} active segments={5} />);
    expect(screen.getByTestId('mic-level-meter')).toHaveAttribute('dir', 'ltr');
  });

  it('keeps updating the level under reduced motion, only dropping the transition easing', () => {
    mockReducedMotion(true);
    render(<MicLevelMeter level={0.6} active segments={5} />);
    const lit = screen.getAllByTestId('mic-level-segment-lit');
    expect(lit).toHaveLength(3);
    expect(lit[0]).toHaveStyle({ transitionDuration: '0ms' });
  });

  it('uses a 100ms transition when motion is not reduced', () => {
    mockReducedMotion(false);
    render(<MicLevelMeter level={0.6} active segments={5} />);
    const lit = screen.getAllByTestId('mic-level-segment-lit');
    expect(lit[0]).toHaveStyle({ transitionDuration: '100ms' });
  });
});

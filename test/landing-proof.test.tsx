import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SocialProof from '@/components/landing/SocialProof';
import Testimonials from '@/components/landing/Testimonials';

// QA report item 7: numeric traction claims and invented testimonials during
// a public beta. Only verifiable statements remain.

vi.mock('@/lib/i18n/use-translation', () => ({
  useTranslation: () => ({ t: (key: string) => key, locale: 'en', dir: 'ltr' }),
}));
vi.mock('framer-motion', () => ({
  motion: { div: (props: any) => <div {...props} /> },
  useInView: () => true,
}));

describe('landing proof sections', () => {
  it('SocialProof renders four fact tiles and no counters', () => {
    const { container } = render(<SocialProof />);
    for (const n of [1, 2, 3, 4]) {
      expect(screen.getByText(`marketing.social_proof.fact${n}_title`)).toBeInTheDocument();
    }
    expect(container.textContent).not.toMatch(/\d{2,}/);
  });

  it('Testimonials renders nothing while there are no real quotes', () => {
    const { container } = render(<Testimonials />);
    expect(container).toBeEmptyDOMElement();
  });
});

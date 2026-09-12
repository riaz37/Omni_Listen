import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LandingNav from '@/components/landing/LandingNav';

// QA report item 1: from /pricing or /about, "Features" and "How It Works"
// were bare #hash anchors that resolved against the current page and did
// nothing. They must always point at the home page section.

vi.mock('@/lib/auth-context', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('@/lib/i18n/use-locale-path', () => ({
  useLocalePath: () => (p: string) => `/en${p}`,
}));
vi.mock('@/lib/i18n/use-translation', () => ({
  useTranslation: () => ({ t: (key: string) => key, locale: 'en', dir: 'ltr' }),
}));
vi.mock('@/components/LanguageSwitcher', () => ({ default: () => null }));
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return actual;
});
vi.mock('framer-motion', () => ({
  motion: {
    div: (props: any) => <div {...props} />,
    p: (props: any) => <p {...props} />,
  },
  useScroll: () => ({ scrollYProgress: 0 }),
  useSpring: (v: unknown) => v,
}));

describe('LandingNav section links', () => {
  it('point at the home page sections from any page', () => {
    render(<LandingNav />);
    expect(screen.getAllByRole('link', { name: 'marketing.nav.features' })[0]).toHaveAttribute('href', '/en#features');
    expect(screen.getAllByRole('link', { name: 'marketing.nav.how_it_works' })[0]).toHaveAttribute('href', '/en#how-it-works');
  });
});

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import Footer from '@/components/landing/Footer';

// QA report item 10: the footer linked to ESAP corporate accounts. Until
// OmniListen accounts exist (lib/site.ts SITE.socialLinks), no social links.
vi.mock('@/lib/i18n/use-locale-path', () => ({ useLocalePath: () => (p: string) => `/en${p}` }));
vi.mock('@/lib/i18n/use-translation', () => ({
  useTranslation: () => ({ t: (key: string) => key, locale: 'en', dir: 'ltr' }),
}));

describe('Footer', () => {
  it('renders no external social links while SITE.socialLinks is empty', () => {
    const { container } = render(<Footer />);
    const external = Array.from(container.querySelectorAll('a[target="_blank"]'));
    expect(external).toEqual([]);
    expect(container.textContent).not.toMatch(/esap_ai|esapai/);
  });
});

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import Footer from '@/components/landing/Footer';
import { SITE } from '@/lib/site';

// QA report item 10: the footer linked to ESAP corporate accounts rather than
// the product's own. OmniListen accounts now exist, so SITE.socialLinks is
// populated and the footer renders them. The assertion that matters is that it
// is the product's accounts, not the parent company's.
vi.mock('@/lib/i18n/use-locale-path', () => ({ useLocalePath: () => (p: string) => `/en${p}` }));
vi.mock('@/lib/i18n/use-translation', () => ({
  useTranslation: () => ({ t: (key: string) => key, locale: 'en', dir: 'ltr' }),
}));

// The parent company's handles specifically. Not a bare /esapai/ match: the
// product's own accounts legitimately contain that string
// (facebook.com/OmniListen.esapai, instagram.com/omnilisten.esapai).
const PARENT_COMPANY_HANDLES = [
  'x.com/esap_ai',
  'esapai.official',
  'linkedin.com/company/esapai',
  'tiktok.com/@esapai',
];

describe('Footer', () => {
  it('renders every configured social link', () => {
    const { container } = render(<Footer />);
    const external = Array.from(container.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]'));

    expect(external).toHaveLength(SITE.socialLinks.length);
    for (const social of SITE.socialLinks) {
      expect(
        external.some((a) => a.getAttribute('href') === social.href),
        `${social.label} is configured but not rendered`,
      ).toBe(true);
    }
  });

  it('links the product accounts, not the parent company ones', () => {
    const { container } = render(<Footer />);
    const hrefs = Array.from(container.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]'))
      .map((a) => a.getAttribute('href') ?? '');

    for (const handle of PARENT_COMPANY_HANDLES) {
      expect(
        hrefs.filter((h) => h.includes(handle)),
        `Footer links ESAP AI's ${handle} instead of OmniListen's account`,
      ).toEqual([]);
    }
  });

  it('opens external links safely', () => {
    const { container } = render(<Footer />);
    for (const a of Array.from(container.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]'))) {
      expect(a.getAttribute('rel')).toContain('noopener');
    }
  });
});

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TermsPage from '@/app/[locale]/(marketing)/terms/page';
import PrivacyPage from '@/app/[locale]/(marketing)/privacy/page';
import CookiesPage from '@/app/[locale]/(marketing)/cookies/page';
import { SITE } from '@/lib/site';

vi.mock('@/lib/i18n/use-translation', () => ({
  useTranslation: () => ({ t: (key: string) => key, locale: 'en', dir: 'ltr' }),
}));

// QA report items 2 and 3.
describe('legal pages', () => {
  it('site identity defaults to the production domain with no CR number', () => {
    expect(SITE.host).toBe('omnilisten.esap.ai');
    expect(SITE.commercialRegistration).toBeNull();
  });

  it('Terms link to the production domain, not a Vercel preview', () => {
    const { container } = render(<TermsPage />);
    const link = screen.getByRole('link', { name: SITE.host });
    expect(link).toHaveAttribute('href', SITE.url);
    expect(container.textContent).not.toMatch(/vercel\.app/);
  });

  it('no placeholder CR text on Terms or Privacy', () => {
    const terms = render(<TermsPage />).container.textContent ?? '';
    const privacy = render(<PrivacyPage />).container.textContent ?? '';
    for (const text of [terms, privacy]) {
      expect(text).not.toMatch(/Insert CR Number/);
      expect(text).not.toMatch(/CR No\./);
      expect(text).not.toMatch(/أدخل رقم السجل/);
    }
  });

  it('Terms describe a self-serve service, not an MSA-only enterprise contract', () => {
    const text = render(<TermsPage />).container.textContent ?? '';
    expect(text).not.toMatch(/signed MSA|per signed|Authorized Users|exclusively in a signed/);
    expect(text).toMatch(/Enterprise customers/);
    expect(text).toMatch(/Before you record/);
    expect(text).not.toMatch(/—/);
  });

  it('Privacy Policy names the real providers and drops the B2B-only framing', () => {
    const text = render(<PrivacyPage />).container.textContent ?? '';
    expect(text).not.toMatch(/exclusively in a B2B|signed DPA/);
    for (const provider of ['Supabase', 'Render', 'Vercel', 'AssemblyAI', 'Deepgram', 'Google Gemini']) {
      expect(text, provider).toContain(provider);
    }
    expect(text).toContain('Limited Use');
    expect(text).not.toMatch(/—/);
  });

  it('Cookie Policy lists the cookies actually set and nothing else', () => {
    const text = render(<CookiesPage />).container.textContent ?? '';
    for (const name of ['access_token', 'refresh_token', 'NEXT_LOCALE']) expect(text).toContain(name);
    expect(text).not.toMatch(/CSRF|Analytics Cookies|DPA/);
  });
});

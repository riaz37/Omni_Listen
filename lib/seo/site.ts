import type { Locale } from '@/lib/i18n/config';
import { SITE } from '@/lib/site';

/**
 * SEO-facing view of the site identity. Everything here derives from
 * lib/site.ts, which is the single source of truth for the domain and the
 * operating company; this module only adds the shapes the metadata and schema
 * helpers want.
 *
 * `output: 'export'` means there is no request to infer a host from, so
 * anything needing an absolute URL (canonical, hreflang, og:image, JSON-LD
 * @id) resolves against SITE.url. If `metadataBase` is left unset, Next
 * silently resolves relative OpenGraph image paths against localhost and
 * ships that to production.
 */
export const SITE_URL = SITE.url.replace(/\/$/, '');
export const SITE_NAME = SITE.name;
export const LEGAL_NAME = `${SITE.company} (trading as ${SITE.tradingAs})`;

export const OG_IMAGE = {
  url: '/og-image.png',
  width: 1200,
  height: 630,
} as const;

/** OpenGraph wants a full locale tag, not the bare language code. */
export function ogLocale(locale: Locale): string {
  return locale === 'ar' ? 'ar_SA' : 'en_US';
}

/** Absolute, locale-prefixed URL. `path` is '' for the locale home page. */
export function localeUrl(locale: Locale, path: string): string {
  return `${SITE_URL}/${locale}${path}`;
}

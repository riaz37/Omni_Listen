import { describe, it, expect } from 'vitest';
import { buildMetadata } from '@/lib/seo/metadata';
import { SEO_ROUTES, INDEXABLE_ROUTE_KEYS, type SeoRouteKey } from '@/lib/seo/routes';
import { SITE_URL, localeUrl } from '@/lib/seo/site';
import { locales } from '@/lib/i18n/config';

// The metadata helper reads titles and descriptions out of the dictionaries by
// key. A typo yields undefined, which Next renders as a missing <title> rather
// than failing the build, so nothing but this test would catch it. The length
// and em-dash assertions encode the copy rules from the marketing brief.

const ROUTE_KEYS = Object.keys(SEO_ROUTES) as SeoRouteKey[];
const TITLE_MAX = 60;

describe('SEO metadata', () => {
  for (const locale of locales) {
    for (const key of ROUTE_KEYS) {
      it(`${locale} ${key} resolves a usable title and description`, async () => {
        const meta = await buildMetadata(key, locale);
        const title = (meta.title as { absolute: string }).absolute;

        expect(title, `seo.${key}.title missing from ${locale}.json`).toBeTruthy();
        expect(title).not.toContain('seo.');
        expect(
          title.length,
          `"${title}" is ${title.length} chars, over the ${TITLE_MAX} budget`,
        ).toBeLessThanOrEqual(TITLE_MAX);
        expect(title, 'em dashes are not allowed in customer-facing copy').not.toContain('—');

        expect(meta.description, `seo.${key}.description missing from ${locale}.json`).toBeTruthy();
        expect(meta.description).not.toContain('seo.');
      });
    }
  }

  it('every page carries a self-referencing canonical on the real origin', async () => {
    for (const locale of locales) {
      for (const key of ROUTE_KEYS) {
        const meta = await buildMetadata(key, locale);
        expect(meta.alternates?.canonical).toBe(localeUrl(locale, SEO_ROUTES[key].path));
        expect(String(meta.alternates?.canonical)).toContain(SITE_URL);
      }
    }
  });

  it('hreflang alternates are reciprocal and include x-default', async () => {
    for (const locale of locales) {
      for (const key of ROUTE_KEYS) {
        const { languages } = (await buildMetadata(key, locale)).alternates ?? {};
        expect(languages, `no hreflang for ${locale}/${key}`).toBeTruthy();

        // Every locale must be addressable from every locale's page.
        for (const other of locales) {
          expect(languages?.[other]).toBe(localeUrl(other, SEO_ROUTES[key].path));
        }
        // x-default must point at a 200, i.e. /en, never at '/' which redirects.
        expect(languages?.['x-default']).toBe(localeUrl('en', SEO_ROUTES[key].path));
      }
    }
  });

  it('noindex routes are marked noindex and indexable ones are not', async () => {
    for (const key of ROUTE_KEYS) {
      const meta = await buildMetadata(key, 'en');
      const expectNoindex = 'noindex' in SEO_ROUTES[key];
      if (expectNoindex) {
        expect(meta.robots, `${key} should be noindex`).toMatchObject({ index: false });
      } else {
        expect(meta.robots, `${key} should be indexable`).toBeUndefined();
      }
    }
  });

  it('the sitemap route list excludes every noindex route', () => {
    for (const key of INDEXABLE_ROUTE_KEYS) {
      expect('noindex' in SEO_ROUTES[key], `${key} is noindex but listed as indexable`).toBe(false);
    }
    expect(INDEXABLE_ROUTE_KEYS).toContain('home');
    expect(INDEXABLE_ROUTE_KEYS).not.toContain('resetPassword');
  });

  it('OpenGraph and Twitter mirror the page title and name a card image', async () => {
    const meta = await buildMetadata('home', 'en');
    const title = (meta.title as { absolute: string }).absolute;

    expect(meta.openGraph?.title).toBe(title);
    expect(meta.twitter?.title).toBe(title);
    expect(JSON.stringify(meta.openGraph?.images)).toContain('/og-image.png');
    expect(meta.twitter).toMatchObject({ card: 'summary_large_image' });
  });

  it('an unknown locale falls back to English rather than emitting empty tags', async () => {
    const meta = await buildMetadata('home', 'de');
    expect((meta.title as { absolute: string }).absolute).toBeTruthy();
    expect(meta.alternates?.canonical).toBe(localeUrl('en', ''));
  });
});

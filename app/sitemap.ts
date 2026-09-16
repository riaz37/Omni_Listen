import type { MetadataRoute } from 'next';
import { localeUrl } from '@/lib/seo/site';
import { SEO_ROUTES, INDEXABLE_ROUTE_KEYS } from '@/lib/seo/routes';
import { locales, defaultLocale } from '@/lib/i18n/config';
// Required under `output: 'export'`: Next will not collect a metadata route
// for a static export unless it is explicitly declared static.
export const dynamic = 'force-static';


// A metadata route, so it compiles without a root layout above it and emits
// out/sitemap.xml under `output: 'export'`. Do not reach for
// generateSitemaps() here: multiple sitemaps need dynamic params, which a
// static export cannot serve.

// The landing page is the entry point; legal pages are real but low priority.
const PRIORITY: Partial<Record<(typeof INDEXABLE_ROUTE_KEYS)[number], number>> = {
  home: 1.0,
  pricing: 0.9,
  about: 0.7,
  security: 0.7,
  contact: 0.6,
  signup: 0.6,
  signin: 0.4,
  privacy: 0.3,
  terms: 0.3,
  cookies: 0.3,
};

export default function sitemap(): MetadataRoute.Sitemap {
  // A static export has no request time, so this is the build timestamp. It is
  // honest about when the page was last published, which is what the field is
  // for, and it avoids hand-maintaining per-route dates that would go stale.
  const lastModified = new Date();

  return INDEXABLE_ROUTE_KEYS.flatMap((key) => {
    const { path } = SEO_ROUTES[key];

    return locales.map((locale) => ({
      url: localeUrl(locale, path),
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: PRIORITY[key] ?? 0.5,
      // Every entry advertises its whole language cluster, including itself,
      // which is what Google requires for hreflang discovered via a sitemap.
      alternates: {
        languages: {
          ...Object.fromEntries(locales.map((l) => [l, localeUrl(l, path)])),
          'x-default': localeUrl(defaultLocale, path),
        },
      },
    }));
  });
}

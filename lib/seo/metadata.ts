import type { Metadata } from 'next';
import { locales, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { SITE_NAME, OG_IMAGE, ogLocale, localeUrl } from './site';
import { SEO_ROUTES, type SeoRouteKey } from './routes';

/**
 * Builds a page's full metadata: title, description, self-referencing
 * canonical, reciprocal hreflang, OpenGraph and Twitter card.
 *
 * A plain async function rather than a hook, because generateMetadata runs on
 * the server (at build time, under `output: 'export'`) where hooks like
 * useLocalePath are unavailable.
 */
export async function buildMetadata(key: SeoRouteKey, rawLocale: string): Promise<Metadata> {
  const locale: Locale = (locales as readonly string[]).includes(rawLocale)
    ? (rawLocale as Locale)
    : 'en';

  const route = SEO_ROUTES[key];
  const noindex = 'noindex' in route ? route.noindex : false;

  const dictionary = await getDictionary(locale);
  // Read the dictionary directly rather than through t(). t() falls back to
  // returning the key itself on a miss, which would put a literal
  // "seo.home.title" into the <title> tag instead of failing visibly.
  const seo = (dictionary as unknown as { seo: Record<string, string> }).seo;
  const title = seo[`${key}.title`];
  const description = seo[`${key}.description`];

  const canonical = localeUrl(locale, route.path);

  return {
    // `absolute` rather than a template: Next applies the title template to
    // metadata.title but never to openGraph.title, so a template silently
    // desynchronises the two and pushes titles past the length budget.
    title: { absolute: title },
    description,
    alternates: {
      canonical,
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, localeUrl(l, route.path)])),
        // Points at a 200, not at '/', which is a redirect.
        'x-default': localeUrl('en', route.path),
      },
    },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      url: canonical,
      title,
      description,
      locale: ogLocale(locale),
      alternateLocale: ogLocale(locale === 'ar' ? 'en' : 'ar'),
      images: [{ url: OG_IMAGE.url, width: OG_IMAGE.width, height: OG_IMAGE.height, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_IMAGE.url],
    },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

/**
 * Convenience wrapper for the generateMetadata export each page needs, so a
 * page file is one line rather than six.
 */
export function seoMetadata(key: SeoRouteKey) {
  return async function generateMetadata({
    params,
  }: {
    params: Promise<{ locale: string }>;
  }): Promise<Metadata> {
    const { locale } = await params;
    return buildMetadata(key, locale);
  };
}

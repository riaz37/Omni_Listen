import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/site';
import { APP_PATHS, SEO_ROUTES, type SeoRouteKey } from '@/lib/seo/routes';
import { locales } from '@/lib/i18n/config';
// Required under `output: 'export'`: Next will not collect a metadata route
// for a static export unless it is explicitly declared static.
export const dynamic = 'force-static';


// A metadata route, not a page, so it compiles without a root layout above it
// and emits out/robots.txt under `output: 'export'`.

/** Locale-prefixed forms of a path, e.g. '/listen' -> ['/en/listen', '/ar/listen']. */
function forEachLocale(path: string): string[] {
  return locales.map((locale) => `/${locale}${path}`);
}

// AI crawlers are allowed deliberately. Two of the audit's own recommendations
// (an llms.txt, and building citation signals) only pay off if these bots can
// read the marketing pages, so blocking them would work against the goal.
// Training-corpus inclusion is the accepted cost of that. These directives are
// honoured voluntarily in any case.
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'meta-externalagent',
];

export default function robots(): MetadataRoute.Robots {
  const noindexPaths = (Object.keys(SEO_ROUTES) as SeoRouteKey[])
    .filter((key) => 'noindex' in SEO_ROUTES[key])
    .map((key) => SEO_ROUTES[key].path)
    // '' would disallow the whole site; no noindex route uses it, but be safe.
    .filter((path) => path !== '');

  const disallow = [
    ...APP_PATHS.flatMap(forEachLocale),
    ...noindexPaths.flatMap(forEachLocale),
  ].sort();

  return {
    // One rule listing every agent, rather than a block per agent. Identical
    // semantics, and it keeps the file a few hundred bytes instead of 10 KB.
    // The AI crawlers are named even though '*' would already cover them, so
    // the policy is a deliberate, readable statement rather than an omission.
    rules: [{ userAgent: ['*', ...AI_CRAWLERS], allow: '/', disallow }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

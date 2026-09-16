/**
 * Every route that can appear in a search result, plus its indexability.
 *
 * Paths and robots directives are code, not copy, so they live here rather
 * than in the dictionaries. The matching titles and descriptions live under
 * the `seo` namespace in lib/i18n/dictionaries/{en,ar}.json, keyed by the same
 * route key, so the existing i18n parity test forces an Arabic translation for
 * every English one.
 *
 * `path` is appended to `/{locale}`, so '' is the locale home page.
 */
export const SEO_ROUTES = {
  home: { path: '' },
  about: { path: '/about' },
  pricing: { path: '/pricing' },
  security: { path: '/security' },
  contact: { path: '/contact' },
  privacy: { path: '/privacy' },
  terms: { path: '/terms' },
  cookies: { path: '/cookies' },

  // Legitimate landing targets for brand queries ("omnilisten login"), so
  // these stay indexable.
  signin: { path: '/signin' },
  signup: { path: '/signup' },

  // Transactional auth pages. Nothing here is useful from a search result, and
  // reset/verify URLs are token-bearing, so keep them out of the index.
  forgotPassword: { path: '/forgot-password', noindex: true },
  resetPassword: { path: '/reset-password', noindex: true },
  verifyEmail: { path: '/verify-email', noindex: true },

  // Reachable without a session, but not marketing surfaces.
  offline: { path: '/offline', noindex: true },
  testApi: { path: '/test-api', noindex: true },
} as const;

export type SeoRouteKey = keyof typeof SEO_ROUTES;

/** Route keys that belong in the sitemap. */
export const INDEXABLE_ROUTE_KEYS = (Object.keys(SEO_ROUTES) as SeoRouteKey[]).filter(
  (key) => !('noindex' in SEO_ROUTES[key]),
);

/**
 * Authenticated app paths. Disallowed in robots.txt and noindexed via the
 * (app) route group's layout. Kept as a plain list because robots.txt needs
 * the strings and the paths are locale-prefixed at both call sites.
 */
export const APP_PATHS = [
  // syncho renamed /queries to /analysis but kept the old route live, so
  // both are disallowed here.
  '/analysis',
  '/analytics',
  '/calendar',
  '/conversation',
  '/events',
  '/history',
  '/listen',
  '/notes',
  '/queries',
  '/settings',
  '/tasks',
] as const;

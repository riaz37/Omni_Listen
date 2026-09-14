// Public identity of the product and the company operating it. Legal pages,
// metadata and the footer read from here so a domain or company detail is
// changed in exactly one place.

export interface SocialLink {
  readonly label: string;
  readonly href: string;
  readonly icon: 'x' | 'linkedin' | 'facebook' | 'instagram' | 'youtube';
}

const url = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://omnilisten.esap.ai';

// NEXT_PUBLIC_SITE_URL may be malformed (missing scheme, typo'd, etc.) in a
// given deployment's env config. `new URL()` throws on that, and since this
// module runs at import time, an uncaught throw here would take down every
// marketing page that imports SITE. Fall back to the known-good host instead.
function resolveHost(candidate: string): string {
  try {
    return new URL(candidate).host;
  } catch {
    return 'omnilisten.esap.ai';
  }
}

export const SITE = {
  name: 'OmniListen',
  url,
  host: resolveHost(url),
  company: 'Empowering Energy',
  tradingAs: 'ESAP AI',
  // Commercial Registration number. Null until the company provides it; the
  // legal pages omit the CR clause entirely while it is null.
  commercialRegistration: process.env.NEXT_PUBLIC_COMPANY_CR?.trim() || null,
  // OmniListen has no product social accounts yet. Add entries here and the
  // footer renders them; keep it empty and the footer shows no social block.
  socialLinks: [] as ReadonlyArray<SocialLink>,
} as const;

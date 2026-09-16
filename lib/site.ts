// Public identity of the product and the company operating it. Legal pages,
// metadata and the footer read from here so a domain or company detail is
// changed in exactly one place.

export interface SocialLink {
  readonly label: string;
  readonly href: string;
  readonly icon:
    | 'x'
    | 'linkedin'
    | 'facebook'
    | 'instagram'
    | 'youtube'
    | 'threads'
    | 'tiktok'
    | 'snapchat';
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
  // OmniListen's own accounts, not the parent company's. Search engines use
  // these as sameAs edges to tie the site to a known entity, so a wrong handle
  // is worse than a missing one.
  socialLinks: [
    { label: 'X', href: 'https://x.com/OmniListen_esap', icon: 'x' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/showcase/omnilisten', icon: 'linkedin' },
    { label: 'Facebook', href: 'https://www.facebook.com/OmniListen.esapai', icon: 'facebook' },
    { label: 'Instagram', href: 'https://www.instagram.com/omnilisten.esapai/', icon: 'instagram' },
    { label: 'Threads', href: 'https://www.threads.com/@omnilisten.esapai', icon: 'threads' },
    { label: 'TikTok', href: 'https://www.tiktok.com/@omnilisten', icon: 'tiktok' },
    { label: 'Snapchat', href: 'https://www.snapchat.com/@omnilisten', icon: 'snapchat' },
    // No OmniListen channel yet, so this is the parent company's. Video
    // presence is the strongest single correlator with AI-answer citation, so
    // it is kept rather than dropped.
    {
      label: 'YouTube',
      href: 'https://www.youtube.com/channel/UC7LyRbfXwb7at1gCQpUMzGg',
      icon: 'youtube',
    },
  ] as ReadonlyArray<SocialLink>,
  // Profiles belonging to the publishing organization, used for the
  // Organization schema's sameAs rather than for the footer.
  publisherSocialLinks: [
    'https://x.com/esap_ai',
    'https://www.linkedin.com/company/esapai',
    'https://www.facebook.com/esapai.official',
    'https://www.instagram.com/esapai.official/',
    'https://www.tiktok.com/@esapai',
    'https://www.youtube.com/channel/UC7LyRbfXwb7at1gCQpUMzGg',
  ] as ReadonlyArray<string>,
  // From the company's Google Business listing. The Plus Code in that listing
  // is not part of a postal address, so it is omitted.
  address: {
    street: 'Al Imam Saud Ibn Abdul Aziz Branch Rd, An Nakheel',
    locality: 'Riyadh',
    postalCode: '12381',
    country: 'SA',
  },
  phone: '+966114933906',
  supportEmail: 'support@esap.ai',
  salesEmail: 'sales@esap.ai',
  foundingDate: '2021',
} as const;

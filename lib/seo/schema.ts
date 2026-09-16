import type { Locale } from '@/lib/i18n/config';
import { SITE_URL, SITE_NAME, LEGAL_NAME, localeUrl } from './site';
import { SITE } from '@/lib/site';
import { FAQ_KEYS } from './faq-items';

/**
 * JSON-LD builders. Pure functions, no I/O, so they are trivially testable.
 *
 * Two entities are modelled deliberately:
 *   - Organization is ESAP AI, the publisher, which owns the address, phone
 *     and corporate social profiles.
 *   - SoftwareApplication is OmniListen, the product, which owns the product
 *     social profiles and the offer.
 * Collapsing them into one node would attach a Riyadh street address to a
 * piece of software and muddle the entity graph.
 *
 * Deliberately absent: aggregateRating. Ratings not backed by real, on-page,
 * user-submitted reviews are a Google manual-action category, and the invented
 * testimonials that used to sit on the landing page have been removed.
 */

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const APPLICATION_ID = `${SITE_URL}/#software`;

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: 'ESAP AI',
    legalName: LEGAL_NAME,
    url: 'https://esap.ai',
    logo: `${SITE_URL}/logo.png`,
    foundingDate: SITE.foundingDate,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.locality,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.country,
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: SITE.phone,
        contactType: 'customer support',
        email: SITE.supportEmail,
        areaServed: 'SA',
        availableLanguage: ['en', 'ar'],
      },
      {
        '@type': 'ContactPoint',
        telephone: SITE.phone,
        contactType: 'sales',
        email: SITE.salesEmail,
        areaServed: 'SA',
        availableLanguage: ['en', 'ar'],
      },
    ],
    sameAs: [...SITE.publisherSocialLinks],
  };
}

export function websiteSchema(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    url: localeUrl(locale, ''),
    inLanguage: locale,
    publisher: { '@id': ORGANIZATION_ID },
  };
}

export function softwareApplicationSchema(locale: Locale, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': APPLICATION_ID,
    name: SITE_NAME,
    url: localeUrl(locale, ''),
    description,
    applicationCategory: 'BusinessApplication',
    // Web dashboard, a Windows desktop build, and a Chrome/Edge extension.
    operatingSystem: 'Web, Windows',
    inLanguage: ['en', 'ar'],
    publisher: { '@id': ORGANIZATION_ID },
    // Only the free plan is stated. Pro is priced at checkout and Enterprise
    // is unreleased, so publishing a figure for either would be fabrication.
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: localeUrl(locale, '/pricing'),
    },
    sameAs: SITE.socialLinks.map((link) => link.href),
  };
}

/**
 * `copy` is the `marketing` namespace of the resolved dictionary. Answers are
 * always present in the DOM (the accordion collapses with max-height, not
 * conditional rendering), so every question in the schema is genuinely visible
 * page content.
 */
export function faqSchema(copy: Record<string, string>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_KEYS.map(({ question, answer }) => ({
      '@type': 'Question',
      name: copy[question],
      acceptedAnswer: {
        '@type': 'Answer',
        text: copy[answer],
      },
    })),
  };
}

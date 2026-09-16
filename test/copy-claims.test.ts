import { describe, it, expect } from 'vitest';
import en from '@/lib/i18n/dictionaries/en.json';
import ar from '@/lib/i18n/dictionaries/ar.json';

// Turns the marketing brief's "claims we must not make" list into an
// executable rule. Every claim below was live on the landing page at some
// point and had to be removed; without this test nothing stops a future copy
// edit from quietly reintroducing one. The brief's rule of thumb is that if a
// number appears in customer-facing copy, someone must be able to show where
// it came from, so unsourced figures are banned outright rather than reworded.
//
// Docs: docs/omnilisten-marketing-brief-2026-09-12.md sections 9 and 10.

function flattenEntries(obj: Record<string, unknown>, prefix = ''): [string, string][] {
  let entries: [string, string][] = [];
  for (const k of Object.keys(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    const value = obj[k];
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      entries = entries.concat(flattenEntries(value as Record<string, unknown>, full));
    } else if (typeof value === 'string') {
      entries.push([full, value]);
    }
  }
  return entries;
}

const DICTIONARIES: [string, Record<string, unknown>][] = [
  ['en.json', en as Record<string, unknown>],
  ['ar.json', ar as Record<string, unknown>],
];

// The only key allowed to name a compliance standard, and then only if its own
// text says whose certification it is. See the targeted check at the bottom.
const INFRASTRUCTURE_KEY = 'marketing.security.infrastructure_body';

const BANNED: { label: string; pattern: RegExp; allowKeys?: string[] }[] = [
  {
    label: 'an accuracy percentage we have never benchmarked',
    pattern: /\b9\d(\.\d+)?\s?%/,
  },
  {
    label: 'a compliance certification OmniListen does not hold',
    pattern: /\bSOC\s?2\b|\bISO\s?27001\b|\bHIPAA\b/i,
    allowKeys: [INFRASTRUCTURE_KEY],
  },
  {
    label: 'a claim of certified PDPL or GDPR compliance',
    pattern: /\b(PDPL|GDPR)[\s-]?compliant\b/i,
  },
  {
    label: 'an unlimited or forever-free promise that contradicts the real plan limits',
    pattern: /\bno limits\b|\bunlimited\b|\bfree forever\b|\bforever free\b/i,
  },
  {
    label: 'a user or customer count we cannot stand behind',
    pattern: /\b\d[\d,.]*\s?(\+|k\b|thousand)\s*(conversations|users|teams|customers|professionals|meetings captured)/i,
  },
];

describe('marketing copy claims', () => {
  for (const [name, dict] of DICTIONARIES) {
    const entries = flattenEntries(dict);

    for (const { label, pattern, allowKeys = [] } of BANNED) {
      it(`${name} contains no ${label}`, () => {
        const offenders = entries
          .filter(([key]) => !allowKeys.includes(key))
          .filter(([, value]) => pattern.test(value))
          .map(([key, value]) => `${key}: ${value}`);

        expect(
          offenders,
          `Banned claim matched ${pattern} in ${name}:\n${offenders.join('\n')}`,
        ).toEqual([]);
      });
    }

    it(`${name} uses no em dashes in customer-facing copy`, () => {
      const offenders = entries
        .filter(([, value]) => value.includes('\u2014'))
        .map(([key, value]) => `${key}: ${value}`);

      expect(
        offenders,
        `Em dashes read as AI-generated copy. Use a full stop or a comma:\n${offenders.join('\n')}`,
      ).toEqual([]);
    });

    it(`${name} spells the product name as one word`, () => {
      const offenders = entries
        .filter(([, value]) => /Omni\s+Listen|Omnilisten|ESAPListen/.test(value))
        .map(([key, value]) => `${key}: ${value}`);

      expect(
        offenders,
        `The product name is "OmniListen", one word, capital O and capital L:\n${offenders.join('\n')}`,
      ).toEqual([]);
    });
  }

  // The infrastructure paragraph is the one key allowed to name a compliance
  // standard, so it gets a targeted check rather than a blanket exemption.
  // Naming no standard at all is the safest wording and passes trivially; the
  // assertion only bites if the copy starts citing certifications again.
  it('any compliance standard named in the infrastructure copy is attributed to the provider', () => {
    for (const [name, dict] of DICTIONARIES) {
      const text = flattenEntries(dict).find(([k]) => k === INFRASTRUCTURE_KEY)?.[1];
      expect(text, `${INFRASTRUCTURE_KEY} missing from ${name}`).toBeTruthy();

      if (!/SOC\s?2|ISO\s?27001|HIPAA/i.test(text as string)) continue;

      // It must name whose certification it is, and say it is not ours.
      expect(
        text,
        `${name}: ${INFRASTRUCTURE_KEY} cites a standard without naming the provider that holds it`,
      ).toMatch(/Google Cloud|Vercel|Render|Supabase|AWS|Azure/);
      expect(
        text,
        `${name}: ${INFRASTRUCTURE_KEY} cites a standard without disclaiming that OmniListen holds it`,
      ).toMatch(/not certifications held by OmniListen|not .{0,40}OmniListen/);
    }
  });
});

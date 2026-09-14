import { describe, it, expect } from 'vitest';
import en from '@/lib/i18n/dictionaries/en.json';
import ar from '@/lib/i18n/dictionaries/ar.json';

// Every user-facing string must exist in both locales. A key present in one
// dictionary only renders as the raw key in the other.
function flatten(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value && typeof value === 'object' ? flatten(value as Record<string, unknown>, path) : [path];
  });
}

describe('i18n dictionaries', () => {
  it('ar.json has exactly the same keys as en.json', () => {
    const enKeys = flatten(en).sort();
    const arKeys = flatten(ar).sort();
    expect(arKeys.filter((k) => !enKeys.includes(k))).toEqual([]);
    expect(enKeys.filter((k) => !arKeys.includes(k))).toEqual([]);
  });
});

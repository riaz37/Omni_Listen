import { describe, it, expect } from 'vitest';
import { QUICK_CHIPS } from '@/lib/quick-chips';

describe('QUICK_CHIPS', () => {
  it('contains the 9 expected chips', () => {
    expect(QUICK_CHIPS.map((c) => c.id)).toEqual([
      'budget-concerns',
      'action-items',
      'technical-decisions',
      'structured-summary',
      'general-summary',
      'client-requirements',
      'risks-blockers',
      'follow-ups',
      'financial-figures',
    ]);
  });

  it('every chip has a non-empty title and query within the 1000-char user_input limit', () => {
    for (const chip of QUICK_CHIPS) {
      expect(chip.title.length).toBeGreaterThan(0);
      expect(chip.query.length).toBeGreaterThan(0);
      expect(chip.query.length).toBeLessThanOrEqual(1000);
    }
  });

  it('queries are unique (chip toggle logic matches on exact query text)', () => {
    const queries = QUICK_CHIPS.map((c) => c.query);
    expect(new Set(queries).size).toBe(queries.length);
  });

  it('queries do not trip the backend prompt-injection sanitizer', () => {
    // Mirror of dangerous_patterns in backend/llm/prompts.py sanitize_user_input
    const dangerous = [
      /ignore\s+(previous|all|above|prior)\s+(instructions?|prompts?|rules?)/i,
      /disregard\s+(the|all|previous)/i,
      /system\s*:/i,
      /assistant\s*:/i,
      /<\|.*?\|>/i,
      /###\s*(system|assistant|user)/i,
      /you\s+are\s+now/i,
      /forget\s+(everything|all|previous)/i,
      /new\s+instructions?/i,
      /override\s+(the|all|previous)/i,
      /execute\s+this/i,
      /send\s+(to|data|information)/i,
    ];
    for (const chip of QUICK_CHIPS) {
      for (const pattern of dangerous) {
        expect(chip.query).not.toMatch(pattern);
      }
    }
  });
});

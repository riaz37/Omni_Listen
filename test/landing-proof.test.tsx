import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

// QA report item 7: numeric traction claims and invented testimonials during a
// public beta. The fix used to be honest replacement copy; it is now removal,
// so the guard is structural rather than behavioural. These assertions read the
// source because there is nothing left to render.
//
// The companion guard is test/copy-claims.test.ts, which blocks the claims
// themselves (accuracy percentages, user counts) from returning to the
// dictionaries.

const ROOT = path.resolve(__dirname, '..');
const LANDING = path.join(ROOT, 'app', '[locale]', '(marketing)', 'page.tsx');

describe('landing proof sections', () => {
  const source = fs.readFileSync(LANDING, 'utf8');

  it('the fabricated proof components no longer exist', () => {
    for (const name of ['SocialProof', 'Testimonials']) {
      expect(
        fs.existsSync(path.join(ROOT, 'components', 'landing', `${name}.tsx`)),
        `components/landing/${name}.tsx is back. It carried invented customers or traction numbers.`,
      ).toBe(false);
    }
  });

  it('the landing page renders neither section', () => {
    expect(source).not.toMatch(/SocialProof/);
    expect(source).not.toMatch(/Testimonials/);
  });

  it('the landing page composition is still intact', () => {
    // Removal should not have taken a real section with it.
    for (const section of ['Hero', 'Features', 'HowItWorks', 'PricingTeaser', 'FAQ', 'CallToAction']) {
      expect(source, `${section} missing from the landing page`).toMatch(new RegExp(`<${section} />`));
    }
  });
});

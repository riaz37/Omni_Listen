import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/auth-context', () => ({ useAuth: () => ({ user: null, logout: () => {} }) }));
vi.mock('@/lib/global-state-context', () => ({ useGlobalState: () => ({ isRecording: false }) }));
vi.mock('next/navigation', () => ({ usePathname: () => '/en/listen' }));

import { PRIMARY_ITEMS, SECONDARY_ITEMS } from '@/components/Navigation';
import { NAV_INDEX } from '@/lib/motion';
import { shouldRedirectToSignIn } from '@/lib/api';

// QA report item 8: the "Analysis" nav item pointed at /queries. The route
// now matches its label, and every nav href must be known to the page
// transition index and the protected-route guard.
describe('app navigation routes', () => {
  const hrefs = [...PRIMARY_ITEMS, ...SECONDARY_ITEMS].map((i) => i.href);

  it('uses /analysis, never /queries', () => {
    expect(hrefs).toContain('/analysis');
    expect(hrefs).not.toContain('/queries');
  });

  it('every nav href has a NAV_INDEX entry and is protected', () => {
    for (const href of hrefs) {
      expect(NAV_INDEX, href).toHaveProperty(href);
      expect(shouldRedirectToSignIn(`/en${href}`), href).toBe(true);
    }
  });

  it('keeps the legacy /queries path protected while it redirects', () => {
    expect(shouldRedirectToSignIn('/en/queries')).toBe(true);
  });
});

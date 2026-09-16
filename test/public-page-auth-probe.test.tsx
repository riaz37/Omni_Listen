import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { isPublicMarketingRoute, shouldRedirectToSignIn } from '@/lib/api';

// An anonymous visitor to a marketing page used to trigger GET /api/auth/me,
// which always 401s, which the response interceptor answered with POST
// /api/auth/refresh on a 90 second timeout. Two guaranteed-failing requests
// and a potentially very long hang on the highest-traffic page on the site.
// These tests pin the routing rule and the resulting behaviour.

const getCurrentUser = vi.fn();

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>();
  return {
    ...actual,
    authAPI: { ...actual.authAPI, getCurrentUser: () => getCurrentUser() },
  };
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/en',
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ clear: vi.fn() }),
}));

vi.mock('@/lib/i18n/use-locale-path', () => ({
  useLocalePath: () => (path: string) => `/en${path}`,
}));

async function renderAuthProviderAt(pathname: string) {
  window.history.replaceState({}, '', pathname);
  const { AuthProvider, useAuth } = await import('@/lib/auth-context');

  let seen: { loading: boolean; user: unknown } | null = null;
  function Probe() {
    const { loading, user } = useAuth();
    seen = { loading, user };
    return null;
  }

  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );
  await waitFor(() => expect(seen?.loading).toBe(false));
  return () => seen;
}

describe('public marketing route classification', () => {
  it('matches the marketing pages in both locales', () => {
    for (const path of [
      '/en',
      '/ar',
      '/en/',
      '/en/about',
      '/ar/about',
      '/en/pricing',
      '/en/security',
      '/en/contact',
      '/en/privacy',
      '/en/terms',
      '/en/cookies',
    ]) {
      expect(isPublicMarketingRoute(path), `${path} should be public marketing`).toBe(true);
    }
  });

  it('excludes auth pages, which must still detect an existing session', () => {
    // /signin redirects an already-signed-in visitor, and the token-bearing
    // pages complete a flow, so none of them may skip the probe.
    for (const path of [
      '/en/signin',
      '/en/signup',
      '/en/forgot-password',
      '/en/reset-password',
      '/en/verify-email',
    ]) {
      expect(isPublicMarketingRoute(path), `${path} must not skip the probe`).toBe(false);
    }
  });

  it('excludes the app routes', () => {
    for (const path of ['/en/listen', '/en/settings', '/ar/analytics', '/en/conversation']) {
      expect(isPublicMarketingRoute(path)).toBe(false);
      expect(shouldRedirectToSignIn(path)).toBe(true);
    }
  });

  it('never overlaps with the protected route set', () => {
    for (const path of ['/en', '/en/about', '/en/pricing', '/en/terms']) {
      expect(shouldRedirectToSignIn(path)).toBe(false);
    }
  });
});

describe('AuthProvider mount probe', () => {
  beforeEach(() => {
    getCurrentUser.mockReset();
    localStorage.clear();
    vi.resetModules();
  });

  afterEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('does not call /api/auth/me for an anonymous visitor on the landing page', async () => {
    const read = await renderAuthProviderAt('/en');

    expect(getCurrentUser).not.toHaveBeenCalled();
    expect(read()?.user).toBeNull();
  });

  it('still revalidates a returning visitor who has a cached user', async () => {
    localStorage.setItem('cached_user', JSON.stringify({ id: 1, email: 'a@b.co', name: 'A' }));
    getCurrentUser.mockResolvedValue({ id: 1, email: 'a@b.co', name: 'A' });

    await renderAuthProviderAt('/en');

    expect(getCurrentUser).toHaveBeenCalledTimes(1);
  });

  it('still probes on a non-marketing route even with no cached user', async () => {
    getCurrentUser.mockRejectedValue({ response: { status: 401 } });

    await renderAuthProviderAt('/en/signin');

    expect(getCurrentUser).toHaveBeenCalledTimes(1);
  });
});

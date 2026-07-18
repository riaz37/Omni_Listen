import { describe, it, expect } from 'vitest';
import { shouldRedirectToSignIn } from '@/lib/api';

describe('shouldRedirectToSignIn', () => {
  it('never redirects from the landing page', () => {
    expect(shouldRedirectToSignIn('/')).toBe(false);
    expect(shouldRedirectToSignIn('/en')).toBe(false);
    expect(shouldRedirectToSignIn('/ar')).toBe(false);
    expect(shouldRedirectToSignIn('/en/')).toBe(false);
  });

  it('never redirects from marketing pages', () => {
    expect(shouldRedirectToSignIn('/en/pricing')).toBe(false);
    expect(shouldRedirectToSignIn('/ar/about')).toBe(false);
    expect(shouldRedirectToSignIn('/en/privacy')).toBe(false);
    expect(shouldRedirectToSignIn('/en/terms')).toBe(false);
  });

  it('never redirects from auth pages (would loop)', () => {
    expect(shouldRedirectToSignIn('/en/signin')).toBe(false);
    expect(shouldRedirectToSignIn('/ar/signup')).toBe(false);
    expect(shouldRedirectToSignIn('/en/forgot-password')).toBe(false);
    expect(shouldRedirectToSignIn('/en/reset-password')).toBe(false);
    expect(shouldRedirectToSignIn('/en/verify-email')).toBe(false);
  });

  it('redirects from protected app routes', () => {
    expect(shouldRedirectToSignIn('/en/listen')).toBe(true);
    expect(shouldRedirectToSignIn('/ar/history')).toBe(true);
    expect(shouldRedirectToSignIn('/en/analytics')).toBe(true);
    expect(shouldRedirectToSignIn('/en/calendar')).toBe(true);
    expect(shouldRedirectToSignIn('/en/events')).toBe(true);
    expect(shouldRedirectToSignIn('/en/notes')).toBe(true);
    expect(shouldRedirectToSignIn('/en/queries')).toBe(true);
    expect(shouldRedirectToSignIn('/en/tasks')).toBe(true);
    expect(shouldRedirectToSignIn('/en/settings')).toBe(true);
    expect(shouldRedirectToSignIn('/en/conversation')).toBe(true);
  });

  it('handles trailing slashes on protected routes (static export serves them)', () => {
    expect(shouldRedirectToSignIn('/en/listen/')).toBe(true);
    expect(shouldRedirectToSignIn('/ar/settings/')).toBe(true);
  });

  it('does not treat lookalike prefixes as protected', () => {
    expect(shouldRedirectToSignIn('/en/listening-guide')).toBe(false);
    expect(shouldRedirectToSignIn('/en/tasks-overview')).toBe(false);
  });
});

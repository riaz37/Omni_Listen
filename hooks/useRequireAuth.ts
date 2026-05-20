'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalePath } from '@/lib/i18n/use-locale-path';
import { useAuth } from '@/lib/auth-context';

/**
 * Redirects unauthenticated users to /signin.
 * Returns { user, loading } so the page can gate data fetching on `user`.
 */
export function useRequireAuth() {
  const router = useRouter();
  const lp = useLocalePath();
  const auth = useAuth();

  useEffect(() => {
    if (!auth.loading && !auth.user) {
      router.push(lp('/signin'));
    }
  }, [auth.user, auth.loading, router, lp]);

  return auth;
}

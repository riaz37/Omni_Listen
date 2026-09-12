'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalePath } from '@/lib/i18n/use-locale-path';

// /queries was renamed to /analysis so the route matches its nav label.
// vercel.json issues a permanent redirect for this path; this page covers
// hosts that do not apply those redirects and any cached client-side link.
export default function LegacyQueriesRedirect() {
  const router = useRouter();
  const lp = useLocalePath();

  useEffect(() => {
    router.replace(lp('/analysis'));
  }, [router, lp]);

  return null;
}

'use client';

import { useVersionSkew } from '@/hooks/useVersionSkew';

// Mounted once in the root layout. Watches public/version.json and shows a
// "new version available — Refresh" toast when the running bundle goes stale.
export default function VersionSkewWatcher(): null {
  useVersionSkew();
  return null;
}

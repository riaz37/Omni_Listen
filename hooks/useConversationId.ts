'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';

// Two sources for the conversation id, each right at a different moment:
//
// On mount, window.location.search is authoritative when it carries an id
// (reflects the current URL from history, bookmarks, or Back/Forward). If
// the address bar is empty (arriving from a page without ?id), fall back to
// useSearchParams() for the router's knowledge.
//
// After mount, useSearchParams() reports fresh router navigation during
// render (correct on the first render of the new tree). But window.location
// lags behind: Next.js 16 updates it inside HistoryUpdater's
// useInsertionEffect, after that render. So apply the router change during
// render via render-phase state sync, then reconcile against the address bar
// after every commit once it has caught up. popstate covers Back/Forward,
// which do not re-render the router.
function readIdFromLocation(): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('id');
}

export function useConversationId(): string | null {
  const routerId = useSearchParams().get('id');
  usePathname(); // re-render on route change even when search params are unchanged

  const [id, setId] = useState<string | null>(() => readIdFromLocation() ?? routerId);
  const [lastRouterId, setLastRouterId] = useState<string | null>(routerId);

  // Render-phase adjustment (React's documented pattern for deriving state
  // from an external value during render): a router-reported change is
  // applied on the very render that revealed it.
  if (routerId !== lastRouterId) {
    setLastRouterId(routerId);
    setId(routerId);
  }

  // Post-commit reconciliation against the address bar. No dependency array
  // on purpose: it must run after every commit, it is a single string
  // comparison, and setState with an equal value is a no-op.
  useEffect(() => {
    const live = readIdFromLocation();
    setId((prev) => (prev === live ? prev : live));
  });

  useEffect(() => {
    const onPopState = () => setId(readIdFromLocation());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return id;
}

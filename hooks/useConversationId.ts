'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';

// On a statically-exported Next.js app (`output: 'export'`), /conversation is
// a single prerendered document — there is no server round-trip to re-derive
// route state from. Client-side navigation via router.push() can leave
// useSearchParams() reporting the PREVIOUS conversation's id for one or more
// renders after the address bar has already moved on. That staleness was the
// root cause of the "shows the previous meeting" bug: the detail page
// happily fetched and rendered whatever stale id useSearchParams() handed it.
//
// window.location.search is what the address bar (and the user) actually
// shows, so it must always win. useSearchParams()/usePathname() are kept
// only to force a re-render when the router navigates — pushState does not
// fire any DOM event we could otherwise listen for.
function readIdFromLocation(): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('id');
}

export function useConversationId(): string | null {
  useSearchParams();
  usePathname();

  const urlId = readIdFromLocation();
  const [id, setId] = useState<string | null>(urlId);

  // Render-phase adjustment (React's documented pattern for syncing state to
  // a prop/external value during render) — not a set-state-in-effect, so this
  // takes effect on the very render that revealed the new id instead of one
  // render later.
  if (id !== urlId) {
    setId(urlId);
  }

  useEffect(() => {
    const onPopState = () => setId(readIdFromLocation());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return id;
}

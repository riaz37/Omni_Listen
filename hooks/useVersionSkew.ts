import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

// public/version.json is stamped by scripts/write-version.js on every build.
// The first successful fetch after page load is the baseline; when a later
// check returns a different value, a newer deploy exists and this bundle is
// stale. We only ever prompt — never auto-reload, which could destroy an
// in-progress recording.
const CHECK_INTERVAL_MS = 10 * 60 * 1000;

export function useVersionSkew(): void {
  const baseline = useRef<string | null>(null);
  const notified = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const check = async (): Promise<void> => {
      if (notified.current) return;
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) return; // 404 in dev (file is build-generated) — ignore
        const data = await res.json();
        const version = typeof data?.version === 'string' ? data.version : null;
        if (cancelled || !version) return;
        if (baseline.current === null) {
          baseline.current = version;
          return;
        }
        if (version !== baseline.current) {
          notified.current = true;
          toast.info('A new version of OmniListen is available.', {
            duration: Infinity,
            action: {
              label: 'Refresh',
              onClick: () => window.location.reload(),
            },
          });
        }
      } catch {
        // Offline / blocked — try again on the next tick.
      }
    };

    check();
    const timer = setInterval(check, CHECK_INTERVAL_MS);
    const onFocus = (): void => { check(); };
    window.addEventListener('focus', onFocus);

    return () => {
      cancelled = true;
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, []);
}

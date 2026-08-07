'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * Whether you are signed in is settled once, by the root layout, on the
 * server. Next holds on to that layout for the life of the running app and
 * does not render it again as you move between screens — so a session that
 * ends while the phone is in a pocket leaves the app still showing a
 * garage, and a tab the browser froze and later restored comes back
 * believing whatever was true when it was parked. Every screen then
 * disagrees with the server until something forces a real page load, which
 * is why closing the app and returning to it read as "logged out" on one
 * tap and "logged in" on the next.
 *
 * Asking for a fresh render whenever the app comes back to the foreground
 * is what keeps the screens honest. It also clears the router's cache of
 * the pages behind it, so going back cannot restore a stale one either —
 * `signOut` reloads the page outright for the same reason.
 */

/** Long enough that pulling the notification shade down is not a refetch. */
const PARKED_MS = 3_000;

export function RefreshOnReturn() {
  const router = useRouter();
  const hiddenSince = useRef<number | null>(null);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        hiddenSince.current = Date.now();
        return;
      }
      const parked = hiddenSince.current;
      hiddenSince.current = null;
      if (parked !== null && Date.now() - parked >= PARKED_MS) router.refresh();
    };

    /**
     * A page restored from the back/forward cache never re-runs its render
     * and never fires `visibilitychange`, so this is the only notice we get
     * that it is back — and it is the case the report was about.
     */
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) router.refresh();
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pageshow', onPageShow);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, [router]);

  return null;
}

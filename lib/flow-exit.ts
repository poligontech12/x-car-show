'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

/**
 * Closing a flow.
 *
 * The account, registration and edit screens are flows rather than
 * destinations: each replaces the nav and carries its own close, and closing
 * means going back to whatever you were doing. `history.back()` does that
 * well right up until there is nothing behind it, when it does nothing at
 * all and the close button reads as broken.
 *
 * That is not a rare corner on this app. Signing out reloads the page on
 * purpose, so the history is deliberately empty. A card scanned at the gate
 * opens straight onto a car. A link someone forwarded opens straight onto
 * the screen it points at. In every one of those the flow *is* the first
 * screen, and its close had nowhere to go.
 *
 * So the shell counts the screens you pass through, and a flow asks whether
 * going back lands on one of ours — naming where it should land instead when
 * it would not.
 */

let screensSeen = 0;
let lastPath: string | null = null;

/**
 * Counted per document rather than per session: a reload starts the history
 * over, and the count has to start over with it or it would promise a screen
 * behind us that the browser threw away.
 */
function recordScreen(pathname: string): void {
  if (pathname === lastPath) return;
  lastPath = pathname;
  screensSeen += 1;
}

/** Mounted once, by the shell, so every screen is counted as it appears. */
export function useRecordScreens(): void {
  const pathname = usePathname();
  useEffect(() => recordScreen(pathname), [pathname]);
}

/**
 * A close handler for a flow: back to the screen behind it, or to `fallback`
 * when this flow is where the visit started.
 */
export function useFlowExit(fallback: string): () => void {
  const router = useRouter();
  return useCallback(() => {
    if (screensSeen > 1) router.back();
    else router.push(fallback);
  }, [router, fallback]);
}

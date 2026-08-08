'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useRef } from 'react';
import { useRecordScreens } from '@/lib/flow-exit';
import { ROSTER } from '@/lib/navigation';
import { ActionError } from './ActionError';
import { PhoneNav } from './PhoneNav';
import { Splash } from './Splash';
import { TabBar } from './TabBar';
import styles from './AppShell.module.css';

/**
 * Screens that take the whole height and do their own scrolling.
 *
 * Matched with `startsWith`, which is why the roster is not in this list
 * even though it is one of them: it lives at `/` now, and every path on
 * earth starts with a slash. It is checked for exactly, below.
 */
const FILL = ['/auth', '/onboard'];

/**
 * Register-a-car and the account screens are flows, not destinations:
 * they replace both the nav and the tab bar and carry their own close.
 */
const FLOW = ['/auth', '/onboard'];

/** Editing a car is a flow too, but it lives under a car's own route. */
const isEdit = (p: string) => /^\/car\/[^/]+\/edit\/?$/.test(p);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lit = useRef<HTMLElement | null>(null);

  // So a flow's close button knows whether there is a screen behind it.
  useRecordScreens();

  /**
   * A light that follows the pointer across whichever panel it is over.
   * Delegated from the frame — a listener per panel would be dozens of
   * them, and only one panel can be under the pointer anyway.
   */
  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const panel = (e.target as HTMLElement).closest<HTMLElement>('[data-spot]');
    if (panel !== lit.current) {
      lit.current?.style.removeProperty('--mx');
      lit.current?.style.removeProperty('--my');
      lit.current = panel;
    }
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    panel.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
    panel.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
  }, []);

  // The print sheet is not the app — it gets the bare page.
  if (pathname.startsWith('/cards')) return <>{children}</>;

  const fill = pathname === ROSTER.href || FILL.some((p) => pathname.startsWith(p)) || isEdit(pathname);
  const flow = FLOW.some((p) => pathname.startsWith(p)) || isEdit(pathname);

  return (
    <div className={styles.stage}>
      {/* Outside the frame, so it covers the device chrome on a desktop
          too. The print sheet returns above this and never sees it. */}
      <Splash />
      <div className={styles.frame} onPointerMove={onPointerMove}>
        {/* Two slow blooms so the black floor has depth and the glass
            has something to refract. */}
        <div className="aurora" aria-hidden="true" />
        <div className={styles.island} aria-hidden="true" />
        {!flow && <PhoneNav />}
        <ActionError />
        <div className={`${styles.main} ${fill ? styles.mainFill : styles.mainScroll}`}>
          {children}
        </div>
        {!flow && <TabBar />}
      </div>
    </div>
  );
}

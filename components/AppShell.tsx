'use client';

import { usePathname } from 'next/navigation';
import { TabBar } from './TabBar';
import styles from './AppShell.module.css';

/**
 * Screens that take the whole height and do their own scrolling —
 * a viewfinder and two flows with a pinned action bar at the foot.
 */
const FILL = ['/scan', '/auth', '/onboard'];

/** Register-a-car and the account screens replace the tab bar rather than sit under it. */
const NO_TABS = ['/auth', '/onboard'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // The print sheet is not the app — it gets the bare page.
  if (pathname.startsWith('/cards')) return <>{children}</>;

  const fill = FILL.some((p) => pathname.startsWith(p));
  const tabs = !NO_TABS.some((p) => pathname.startsWith(p));

  return (
    <div className={styles.stage}>
      <div className={styles.frame}>
        <div className={styles.notch} aria-hidden="true" />
        <div className={`${styles.main} ${fill ? styles['main--fill'] : styles['main--scroll']}`}>
          {!fill && <div className={styles.topFade} aria-hidden="true" />}
          {children}
        </div>
        {tabs && <TabBar />}
      </div>
    </div>
  );
}

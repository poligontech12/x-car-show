'use client';

import { usePathname } from 'next/navigation';
import { PhoneNav } from './PhoneNav';
import { TabBar } from './TabBar';
import styles from './AppShell.module.css';

/** Screens that take the whole height and do their own scrolling. */
const FILL = ['/scan', '/auth', '/onboard'];

/**
 * Register-a-car and the account screens are flows, not destinations:
 * they replace both the nav and the tab bar and carry their own close.
 */
const FLOW = ['/auth', '/onboard'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // The print sheet is not the app — it gets the bare page.
  if (pathname.startsWith('/cards')) return <>{children}</>;

  const fill = FILL.some((p) => pathname.startsWith(p));
  const flow = FLOW.some((p) => pathname.startsWith(p));

  return (
    <div className={styles.stage}>
      <div className={styles.frame}>
        <div className={styles.island} aria-hidden="true" />
        {!flow && <PhoneNav />}
        <div className={`${styles.main} ${fill ? styles.mainFill : styles.mainScroll}`}>
          {children}
        </div>
        {!flow && <TabBar />}
      </div>
    </div>
  );
}

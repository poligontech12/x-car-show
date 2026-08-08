'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PRIMARY_NAV } from '@/lib/navigation';
import styles from './TabBar.module.css';

/**
 * Four tabs, not five. Event day is gone — what was useful there
 * (the entry you scanned, the standings) lives in Scan and Award.
 */
function Glyph({ name }: { name: string }) {
  switch (name) {
    case 'feed':
      return (
        <div className={`${styles.glyph} ${styles.feed}`}>
          <i />
          <i />
          <i />
        </div>
      );
    case 'roster':
      return (
        <div className={`${styles.glyph} ${styles.roster}`}>
          <i />
          <i />
          <i />
          <i />
        </div>
      );
    case 'garage':
      return (
        <div className={`${styles.glyph} ${styles.garage}`}>
          <i />
          <i />
        </div>
      );
    default:
      return (
        <div className={`${styles.glyph} ${styles.award}`}>
          <i />
          <i />
          <i />
        </div>
      );
  }
}

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className={styles.bar} aria-label="Navigare principală">
      {PRIMARY_NAV.map((t) => {
        // Screens below a tab keep that tab lit: a car profile belongs to
        // the roster you opened it from, partners to the feed.
        const active =
          t.href === '/'
            ? pathname === '/' || pathname.startsWith('/car')
            : pathname.startsWith(t.href) ||
              (t.href === '/spotted' && pathname.startsWith('/partners'));

        return (
          <Link
            key={t.href}
            href={t.href}
            className={styles.tab}
            aria-current={active ? 'page' : undefined}
          >
            <Glyph name={t.glyph} />
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

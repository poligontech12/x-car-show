'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './TabBar.module.css';

/**
 * Four tabs, not five. Event day is gone — what was useful there
 * (the entry you scanned, the standings) lives in Scan and Award.
 */
const TABS = [
  { href: '/', label: 'FEED' },
  { href: '/roster', label: 'ROSTER' },
  { href: '/scan', label: 'SCAN' },
  { href: '/award', label: 'AWARD' },
] as const;

function Glyph({ label }: { label: string }) {
  switch (label) {
    case 'FEED':
      return (
        <div className={`${styles.glyph} ${styles.feed}`}>
          <i />
          <i />
          <i />
        </div>
      );
    case 'ROSTER':
      return (
        <div className={`${styles.glyph} ${styles.roster}`}>
          <i />
          <i />
          <i />
          <i />
        </div>
      );
    case 'SCAN':
      return (
        <div className={`${styles.glyph} ${styles.scan}`}>
          <div className={styles.scanBox}>
            <i />
            <i />
            <i />
            <i />
            <div className={styles.scanLine} />
          </div>
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
    <nav className={styles.bar} aria-label="Primary">
      {TABS.map((t) => {
        // Screens below a tab keep that tab lit: a car profile belongs to
        // the roster you opened it from, partners to the feed.
        const active =
          t.href === '/'
            ? pathname === '/' || pathname.startsWith('/partners')
            : pathname.startsWith(t.href) ||
              (t.href === '/roster' && pathname.startsWith('/car'));

        return (
          <Link
            key={t.href}
            href={t.href}
            className={styles.tab}
            aria-current={active ? 'page' : undefined}
          >
            <Glyph label={t.label} />
            <span className="t-micro">{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

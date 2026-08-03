'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { EVENT } from '@/lib/event';
import { useStore } from '@/lib/store';
import styles from './PhoneNav.module.css';

/**
 * The four tabs are in the bar at the foot; this menu is where the
 * rest of the app lives — the things you reach for once, not on
 * every visit.
 */
const LINKS = [
  { href: '/', label: 'Flux' },
  { href: '/roster', label: 'Înscriși' },
  { href: '/award', label: 'Mașina show-ului' },
  { href: '/scan', label: 'Scanare' },
  { href: '/partners', label: 'Parteneri' },
  { href: '/cards', label: 'Cartonașe' },
] as const;

export function PhoneNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { account, hydrated } = useStore();
  const [open, setOpen] = useState(false);

  // A menu that survives the navigation it triggered stays in the way.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const initials = account ? account.name.trim().charAt(0).toUpperCase() : null;
  /** A car opened from somewhere — the mark gives up its slot to a way back. */
  const detail = pathname.startsWith('/car/');

  return (
    <>
      <nav className={styles.nav} aria-label="Navigare">
        {detail ? (
          <button
            type="button"
            className="icon-btn"
            aria-label="Înapoi"
            onClick={() => router.back()}
          >
            ←
          </button>
        ) : (
          <Link href="/" className={styles.mark} aria-label="Acasă">
            X
          </Link>
        )}

        <div className={styles.right}>
          <Link
            href="/auth"
            className={styles.profile}
            aria-label={account ? 'Contul meu' : 'Conectare'}
          >
            {hydrated && initials ? (
              initials
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <circle cx="9" cy="5.6" r="3.2" stroke="currentColor" strokeWidth="1.6" />
                <path
                  d="M2.6 16c0-3.2 2.9-5.2 6.4-5.2s6.4 2 6.4 5.2"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </Link>

          <button
            type="button"
            className={`icon-btn ${styles.menu}`}
            aria-label="Meniu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <i />
            <i />
          </button>
        </div>
      </nav>

      <div
        className={`${styles.overlay} ${open ? styles.overlayOpen : ''}`}
        aria-hidden={!open}
        // A closed overlay is still in the DOM for the fade, so take it
        // out of the tab order rather than leaving links behind it.
        inert={!open}
      >
        <button type="button" className={styles.close} aria-label="Închide meniul" onClick={() => setOpen(false)}>
          ×
        </button>

        <div className={styles.links}>
          {LINKS.map((l, i) => {
            const on = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`${styles.link} ${on ? styles.linkOn : ''}`}
                // Behind the one above it, so the list arrives as a list.
                style={{ transitionDelay: open ? `${0.1 + i * 0.08}s` : '0s' }}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="spacer" />

        <p className={styles.meta}>
          {EVENT.edition} · {EVENT.dateNumeric}
          <br />
          {account ? `Conectat ca ${account.name}` : 'Neconectat'}
        </p>

        <button
          type="button"
          className="btn btn--white"
          style={{ marginTop: 16 }}
          onClick={() => {
            setOpen(false);
            router.push(account ? '/auth' : '/auth?mode=register&role=car');
          }}
        >
          {account ? 'Contul meu' : 'Conectare'}
        </button>
      </div>
    </>
  );
}

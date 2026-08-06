'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Mark } from './Mark';
import styles from './PhoneNav.module.css';

/**
 * The top bar: the marque on the left, the way into your account on the
 * right, and nothing else.
 *
 * There was a hamburger here that opened a full-screen menu. Four of its
 * six links were already the four tabs at the foot of every screen, so it
 * mostly offered people a second door to a room they were standing in.
 */
export function PhoneNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { account, hydrated } = useStore();

  const initials = account ? account.name.trim().charAt(0).toUpperCase() : null;
  /** A car opened from somewhere — the mark gives up its slot to a way back. */
  const detail = pathname.startsWith('/car/');

  return (
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
        <Link href="/" className={styles.mark} aria-label="X Car Show — acasă">
          <Mark />
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
      </div>
    </nav>
  );
}

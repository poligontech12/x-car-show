'use client';

import Link from 'next/link';
import styles from './error.module.css';

/**
 * One screen failed, but the app is still standing.
 *
 * The shell around this still rendered, so the nav and the tab bar are
 * there and the way out is a tap. Anything that takes the shell itself
 * down lands in `global-error.tsx` instead, which has to rebuild the
 * document from nothing.
 */
export default function ScreenError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className={styles.screen}>
      <div className={styles.body}>
        <h1 className={styles.title}>Ecranul ăsta n-a pornit.</h1>
        <p className={styles.sub}>
          Restul aplicației merge. Încearcă din nou, sau treci mai departe și revino.
        </p>

        <div className={styles.actions}>
          <button
            type="button"
            className="btn btn--primary"
            onClick={reset}
          >
            Încearcă din nou
          </button>
          <Link
            href="/"
            className="btn btn--glass"
          >
            Înapoi la Spotted
          </Link>
        </div>

        {/* For whoever is holding the laptop, not for the visitor. */}
        {error.digest && <p className={styles.code}>Cod: {error.digest}</p>}
      </div>
    </div>
  );
}

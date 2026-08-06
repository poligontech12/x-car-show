'use client';

import styles from './cards.module.css';

/**
 * The one thing to do on this page, so it is the one solid control on it.
 *
 * The browser's own dialog is both halves of the job: print it to paper,
 * or "Save as PDF" — which on a phone is the same sheet that puts it in
 * Files. The card is vector all the way down, so what comes out is A5 at
 * the printer's resolution rather than a picture of a card.
 */
export function PrintButton() {
  return (
    <button type="button" className={styles.print} onClick={() => window.print()}>
      TIPĂREȘTE SAU SALVEAZĂ PDF
    </button>
  );
}

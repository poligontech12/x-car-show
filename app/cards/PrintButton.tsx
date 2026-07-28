'use client';

import styles from './cards.module.css';

export function PrintButton() {
  return (
    <button type="button" className={styles.toolbarLink} onClick={() => window.print()}>
      PRINT · A5 LANDSCAPE
    </button>
  );
}

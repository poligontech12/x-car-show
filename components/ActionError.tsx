'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import styles from './ActionError.module.css';

/**
 * Why the last tap did not take.
 *
 * Votes and follows are painted before the server has agreed to them, so a
 * refusal used to arrive as the tap quietly undoing itself — indistinguishable
 * from a tap that missed. This says which it was, in the same words the
 * server used, and gets out of the way on its own.
 */

/** Long enough to read a sentence, short enough not to sit over the roster. */
const LINGER_MS = 5_000;

export function ActionError() {
  const { actionError, clearActionError } = useStore();

  useEffect(() => {
    if (!actionError) return;
    const t = setTimeout(clearActionError, LINGER_MS);
    return () => clearTimeout(t);
  }, [actionError, clearActionError]);

  if (!actionError) return null;

  return (
    <button
      type="button"
      className={styles.strip}
      role="alert"
      onClick={clearActionError}
    >
      {actionError}
    </button>
  );
}

'use client';

import { useActionState, useEffect, useState } from 'react';
import { submitGatePin } from '@/lib/gate-actions';
import styles from './cards.module.css';

/**
 * The code, typed once per phone at the start of the day.
 *
 * A wrong code is answered on this screen and nowhere else — there is no
 * one to escalate to in a field, and a marshal needs to know immediately
 * whether they mistyped or are holding the wrong code.
 */
export function GateForm() {
  const [error, act, pending] = useActionState(async (_prev: string | null, form: FormData) => {
    const attempt = await submitGatePin(String(form.get('pin') ?? ''));
    if (attempt === 'ok') return null;
    // Distinct from a wrong code, because the fix is to wait rather than
    // to try again — and a marshal told only "wrong" would keep typing.
    return attempt === 'throttled'
      ? 'Prea multe încercări greșite. Așteaptă zece minute.'
      : 'Cod greșit.';
  }, null);

  // Held shut until the page can answer — see the note in CheckIn.tsx.
  const [awake, setAwake] = useState(false);
  useEffect(() => setAwake(true), []);
  const busy = pending || !awake;

  return (
    <form className={styles.gate} action={act}>
      <b className={styles.gateTitle}>COD DE POARTĂ</b>
      <p className={styles.gateBody}>
        Pagina asta dă numere de concurs și pune mașinile în concurs, așa că cere codul.
        Îl ceri o dată pe telefon, la începutul zilei.
      </p>
      <div className={styles.gateRow}>
        <input
          className={styles.gateInput}
          name="pin"
          type="password"
          // A numeric keypad, because the code is four digits and this is
          // typed one-handed, standing up, in the sun.
          inputMode="numeric"
          autoComplete="off"
          aria-label="Cod de poartă"
          aria-invalid={Boolean(error)}
          placeholder="••••"
          disabled={busy}
        />
        <button className={styles.gateBtn} type="submit" disabled={busy}>
          {pending ? 'SE VERIFICĂ…' : 'INTRĂ'}
        </button>
      </div>
      {error && (
        <p className={styles.gateError} role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

'use client';

import { useActionState, useEffect, useState } from 'react';
import { checkInCar, undoCheckIn } from '@/lib/gate-actions';
import styles from './cards.module.css';

/**
 * One press at the gate: the number goes on the car, the card counts as
 * printed, and the car joins the award.
 *
 * The number is typed rather than taken from the suggestion automatically,
 * because a marshal is holding a card with a number already written on it
 * as often as they are picking a fresh one. The suggestion is the next
 * free number and sits in the placeholder, where it informs without
 * deciding.
 */
export function CheckIn({
  carId,
  no,
  checkedIn,
  suggestion,
}: {
  carId: string;
  no: string;
  checkedIn: boolean;
  suggestion: string;
}) {
  const [error, act, pending] = useActionState(async (_prev: string | null, form: FormData) => {
    const result =
      form.get('intent') === 'undo'
        ? await undoCheckIn(carId)
        : await checkInCar(carId, String(form.get('no') ?? ''));
    return result.ok ? null : result.error;
  }, null);

  /**
   * This form's action is a function in the browser, so a press that
   * lands before the page finishes waking up submits nothing at all — it
   * posts the form the plain way and the number is quietly lost.
   *
   * That is a fair description of a marshal on a tired phone in a field:
   * the list paints, they press, and nothing happens with no way to tell
   * whether it worked. Held shut until the page can answer, the press
   * either does the job or is visibly not ready for one yet.
   */
  const [awake, setAwake] = useState(false);
  useEffect(() => setAwake(true), []);
  const busy = pending || !awake;

  return (
    <form className={styles.checkIn} action={act}>
      <input
        // Keyed on the stored number so undoing a check-in empties the
        // box. Without it the field keeps what was typed, and the row
        // reads as still carrying a number the car no longer has.
        key={no}
        className={styles.checkInNo}
        name="no"
        defaultValue={no}
        placeholder={suggestion}
        inputMode="numeric"
        autoComplete="off"
        aria-label="Număr de concurs"
        disabled={busy}
      />
      <button
        className={styles.checkInBtn}
        type="submit"
        name="intent"
        value="print"
        disabled={busy}
        data-done={checkedIn}
      >
        {checkedIn ? 'TIPĂRIT ✓' : 'TIPĂRIT'}
      </button>
      {checkedIn && (
        // Undoing hands the number back, because the usual reason to undo
        // is that it went on the wrong car and the right one is waiting.
        <button
          className={styles.checkInUndo}
          type="submit"
          name="intent"
          value="undo"
          disabled={busy}
          title="Scoate numărul și mașina din concurs"
        >
          ANULEAZĂ
        </button>
      )}
      {error && (
        <span className={styles.checkInError} role="alert">
          {error}
        </span>
      )}
    </form>
  );
}

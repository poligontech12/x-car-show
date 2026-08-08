'use server';

import { eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from './db';
import { cars } from './db/schema';
import { closeGate, gateUnlocked, openGate, type GateAttempt } from './gate';

/**
 * What a marshal does at the gate, and the only actions in the app that
 * are not a member acting on their own account. Every one of them checks
 * the gate cookie first — the car id arrives from a form and says nothing
 * about who is sending it, exactly as elsewhere.
 */

export type GateResult = { ok: true } | { ok: false; error: string };

/** Numbers are read aloud across a field and written on a card by hand. */
const NO_MAX = 6;

const UNLOCKED_ONLY = 'Sesiunea de poartă s-a încheiat. Introdu codul din nou.';

async function requireGate(): Promise<void> {
  if (!(await gateUnlocked())) throw new Error(UNLOCKED_ONLY);
}

/**
 * Postgres says 23505 when a unique constraint refuses a row — but
 * Drizzle wraps the driver's error in one of its own, so the code sits
 * one or more `cause` links down rather than on what is caught here.
 * Missing it turns "that number is taken" into an unexplained failure at
 * the gate, which is the one place there is nobody to ask.
 */
function isDuplicate(error: unknown): boolean {
  for (let e = error, depth = 0; e && depth < 5; e = (e as { cause?: unknown }).cause, depth++) {
    if (typeof e === 'object' && e !== null && 'code' in e && e.code === '23505') return true;
  }
  return false;
}

export async function submitGatePin(pin: string): Promise<GateAttempt> {
  return openGate(pin);
}

export async function leaveGate(): Promise<void> {
  await closeGate();
  revalidatePath('/cards');
}

/**
 * The gate, in one press: the number goes on the car, the card counts as
 * printed, and the car joins the award.
 *
 * Re-submitting a number for a car already checked in corrects the number
 * without moving the moment it arrived — a typo at the gate is a typo,
 * not a second arrival.
 */
export async function checkInCar(carId: string, no: string): Promise<GateResult> {
  try {
    await requireGate();
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : UNLOCKED_ONLY };
  }

  const number = no.replace(/\s+/g, ' ').trim().slice(0, NO_MAX);
  if (!number) return { ok: false, error: 'Scrie numărul de concurs înainte.' };

  try {
    const [updated] = await db
      .update(cars)
      .set({ no: number, checkedInAt: sql`coalesce(${cars.checkedInAt}, now())`, updatedAt: new Date() })
      .where(eq(cars.id, carId))
      .returning({ id: cars.id });
    if (!updated) return { ok: false, error: 'Mașina asta nu mai există.' };
  } catch (error) {
    if (isDuplicate(error)) {
      const [holder] = await db
        .select({ make: cars.make, model: cars.model })
        .from(cars)
        .where(eq(cars.no, number))
        .limit(1);
      const whose = holder ? `${holder.make} ${holder.model}`.trim() : 'altă mașină';
      return { ok: false, error: `Numărul ${number} e deja la ${whose}.` };
    }
    throw error;
  }

  revalidateGate(carId);
  return { ok: true };
}

/**
 * Undoing a check-in gives the number back, because the usual reason for
 * undoing one is that it went on the wrong car and the right car is still
 * standing there waiting for it.
 */
export async function undoCheckIn(carId: string): Promise<GateResult> {
  try {
    await requireGate();
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : UNLOCKED_ONLY };
  }

  await db
    .update(cars)
    .set({ no: null, checkedInAt: null, updatedAt: new Date() })
    .where(eq(cars.id, carId));

  revalidateGate(carId);
  return { ok: true };
}

/** A check-in shows up on the card, the roster and the standings at once. */
function revalidateGate(carId: string) {
  revalidatePath('/cards');
  revalidatePath(`/cards/${carId}`);
  revalidatePath(`/car/${carId}`);
  revalidatePath('/roster');
  revalidatePath('/award');
}

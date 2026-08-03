'use server';

import { randomBytes } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from './auth';
import type { CarClass, ModCategory, ModGroup } from './cars';
import { db } from './db';
import { cars, follows, mods, users, votes } from './db/schema';
import { EVENT, votingOpen } from './event';

/**
 * Everything a member can change goes through here. Each action reads the
 * session itself rather than trusting an id from the client — a car id in
 * a form post says nothing about who is posting it.
 */

const CLASSES: CarClass[] = ['JDM', 'Germane', 'Muscle', 'Clasice', 'Stance', 'Off-road'];
const DRIVES = ['FWD', 'RWD', 'AWD', '4WD'] as const;
const MOD_CATEGORIES: ModCategory[] = ['Motor', 'Suspensie', 'Jante', 'Exterior', 'Interior'];

/** No I/O/0/1 — these end up printed on a card and read aloud at a gate. */
const ALPHABET = '23456789abcdefghjkmnpqrstuvwxyz';

function shortId(len = 6): string {
  const bytes = randomBytes(len);
  let out = '';
  for (let i = 0; i < len; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

async function currentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

async function requireUser() {
  const user = await currentUser();
  if (!user) throw new Error('Trebuie să fii conectat.');
  return user;
}

/** Trim, and treat an empty field as absent rather than as an empty string. */
const text = (v: unknown): string | null => {
  const s = typeof v === 'string' ? v.trim() : '';
  return s ? s : null;
};

/** A blank number is null, never 0 — the profile hides what nobody filled in. */
const num = (v: unknown): number | null => {
  const n = Number(String(v ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
};

const oneOf = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(v as T) ? (v as T) : fallback;

export interface CarInput {
  make?: string;
  model?: string;
  year?: string | number;
  nickname?: string;
  cls?: string;
  power?: string | number;
  tq?: string | number;
  weight?: string | number;
  engine?: string;
  drive?: string;
  gbox?: string;
  wheels?: string;
  paint?: string;
  story?: string;
  mods?: ModGroup[];
}

function carColumns(input: CarInput) {
  return {
    make: text(input.make) ?? '',
    model: text(input.model) ?? '',
    year: num(input.year),
    nickname: text(input.nickname),
    cls: oneOf(input.cls, CLASSES, 'JDM'),
    power: num(input.power),
    tq: num(input.tq),
    weight: num(input.weight),
    engine: text(input.engine),
    drive: oneOf(input.drive, DRIVES, 'RWD'),
    gbox: text(input.gbox),
    wheels: text(input.wheels),
    paint: text(input.paint),
    story: text(input.story),
  };
}

/** Mods are replaced wholesale — the edit form posts the full list every time. */
async function writeMods(tx: typeof db, carId: string, groups: ModGroup[] | undefined) {
  await tx.delete(mods).where(eq(mods.carId, carId));
  if (!groups?.length) return;
  const rows = groups
    .filter((g) => MOD_CATEGORIES.includes(g.name))
    .flatMap((g) =>
      g.items
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item, i) => ({
          id: shortId(12),
          carId,
          category: g.name,
          item,
          position: MOD_CATEGORIES.indexOf(g.name) * 100 + i,
        })),
    );
  if (rows.length) await tx.insert(mods).values(rows);
}

export async function registerCar(input: CarInput): Promise<string> {
  const user = await requireUser();
  const cols = carColumns(input);
  if (!cols.make && !cols.model) throw new Error('Spune-ne măcar ce mașină e.');

  const id = shortId();
  await db.transaction(async (tx) => {
    await tx.insert(cars).values({ id, ownerId: user.id, ...cols });
    await writeMods(tx as unknown as typeof db, id, input.mods);
    // Registering an entry is what makes you an entrant.
    await tx.update(users).set({ role: 'car', updatedAt: new Date() }).where(eq(users.id, user.id));
  });

  revalidatePath('/roster');
  revalidatePath('/garage');
  return id;
}

export async function saveCar(id: string, input: CarInput): Promise<void> {
  const user = await requireUser();
  const [owned] = await db
    .select({ id: cars.id })
    .from(cars)
    .where(and(eq(cars.id, id), eq(cars.ownerId, user.id)))
    .limit(1);
  if (!owned) throw new Error('Poți schimba doar mașinile pe care le-ai înscris tu.');

  await db.transaction(async (tx) => {
    await tx
      .update(cars)
      .set({ ...carColumns(input), updatedAt: new Date() })
      .where(eq(cars.id, id));
    await writeMods(tx as unknown as typeof db, id, input.mods);
  });

  revalidatePath(`/car/${id}`);
  revalidatePath('/roster');
  revalidatePath('/garage');
}

export async function deleteCar(id: string): Promise<void> {
  const user = await requireUser();
  // Votes and mods cascade; the owner check is the only gate that matters.
  const deleted = await db
    .delete(cars)
    .where(and(eq(cars.id, id), eq(cars.ownerId, user.id)))
    .returning({ id: cars.id });
  if (!deleted.length) throw new Error('Poți șterge doar mașinile pe care le-ai înscris tu.');

  revalidatePath('/roster');
  revalidatePath('/garage');
  revalidatePath('/award');
}

/**
 * One account, one vote, changeable until the deadline. The primary key on
 * `votes.voter_id` is what actually enforces "one" — this upsert simply
 * moves it, which also makes a vote queued offline safe to replay.
 */
export async function castVote(carId: string): Promise<void> {
  const user = await requireUser();
  if (!votingOpen()) throw new Error(`Votul s-a închis la ${EVENT.votingCloses}.`);

  const [car] = await db
    .select({ ownerId: cars.ownerId })
    .from(cars)
    .where(eq(cars.id, carId))
    .limit(1);
  if (!car) throw new Error('Mașina asta nu există.');
  if (car.ownerId === user.id) throw new Error('Nu poți vota propria mașină.');

  await db
    .insert(votes)
    .values({ voterId: user.id, carId })
    .onConflictDoUpdate({
      target: votes.voterId,
      set: { carId, castAt: new Date() },
    });

  revalidatePath('/award');
}

export async function toggleFollow(carId: string): Promise<boolean> {
  const user = await requireUser();
  const removed = await db
    .delete(follows)
    .where(and(eq(follows.userId, user.id), eq(follows.carId, carId)))
    .returning({ carId: follows.carId });

  if (!removed.length) await db.insert(follows).values({ userId: user.id, carId });

  revalidatePath(`/car/${carId}`);
  return removed.length === 0;
}

export interface ProfileInput {
  name?: string;
  town?: string;
  instagram?: string;
  facebook?: string;
}

export async function saveProfile(input: ProfileInput): Promise<void> {
  const user = await requireUser();
  // Handles are assigned at sign-up and printed on cards; they are not
  // edited here, or every QR pointing at a profile would rot.
  await db
    .update(users)
    .set({
      name: text(input.name) ?? user.name,
      town: text(input.town),
      instagram: text(input.instagram)?.replace(/^@+/, '') ?? null,
      facebook: text(input.facebook)?.replace(/^@+/, '') ?? null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  revalidatePath('/auth');
  revalidatePath('/roster');
}

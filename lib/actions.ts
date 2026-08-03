'use server';

import { randomBytes } from 'node:crypto';
import { and, count, eq, gte, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from './auth';
import type { CarClass, ModCategory, ModGroup } from './cars';
import { db } from './db';
import { cars, follows, mods, spottedPosts, spottedUsage, users, votes } from './db/schema';
import { EVENT, VOTE_LIMIT, votingOpen } from './event';
import { decodeSpottedImage } from './spotted-image';

/**
 * Everything a member can change goes through here. Each action reads the
 * session itself rather than trusting an id from the client — a car id in
 * a form post says nothing about who is posting it.
 */

const CLASSES: CarClass[] = ['JDM', 'Germane', 'Muscle', 'Clasice', 'Stance', 'Off-road'];
const DRIVES = ['FWD', 'RWD', 'AWD', '4WD'] as const;
const MOD_CATEGORIES: ModCategory[] = ['Motor', 'Suspensie', 'Jante', 'Exterior', 'Interior'];
const SPOTTED_SCOPE = 'global';
const HOUR_MS = 60 * 60 * 1000;
const USER_POSTS_PER_HOUR = 10;
const USER_POSTS_LIFETIME = 250;
const GLOBAL_DECODE_ATTEMPTS_PER_HOUR = 300;
const GLOBAL_POSTS_PER_HOUR = 100;
const GLOBAL_POST_LIMIT = 20_000;
const GLOBAL_BYTE_LIMIT = 1_000_000_000;

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

export interface SpottedInput {
  imageDataUrl: string;
  location?: string;
  caption?: string;
}

export type SpottedResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

const SPOTTED_ERRORS = new Set([
  'Alege o fotografie JPEG, PNG sau WebP.',
  'Fotografia nu poate fi citită.',
  'Fotografia este prea mare.',
  'Ai adăugat multe apariții. Mai încearcă într-o oră.',
  'Ai ajuns la limita de apariții pentru acest cont.',
  'Spotted este ocupat momentan. Mai încearcă puțin mai târziu.',
  'Spațiul Spotted este momentan plin.',
]);

async function reserveSpottedDecodeAttempt(): Promise<string | null> {
  return db.transaction(async (tx) => {
    await tx
      .insert(spottedUsage)
      .values({ scope: SPOTTED_SCOPE })
      .onConflictDoNothing({ target: spottedUsage.scope });
    const [usage] = await tx
      .select()
      .from(spottedUsage)
      .where(eq(spottedUsage.scope, SPOTTED_SCOPE))
      .limit(1)
      .for('update');
    if (!usage) return 'Spotted este ocupat momentan. Mai încearcă puțin mai târziu.';
    if (usage.postCount >= GLOBAL_POST_LIMIT || usage.totalBytes >= GLOBAL_BYTE_LIMIT) {
      return 'Spațiul Spotted este momentan plin.';
    }

    const now = new Date();
    const windowExpired = usage.attemptWindowStartedAt.getTime() < now.getTime() - HOUR_MS;
    const attempts = windowExpired ? 1 : usage.decodeAttempts + 1;
    if (attempts > GLOBAL_DECODE_ATTEMPTS_PER_HOUR) {
      return 'Spotted este ocupat momentan. Mai încearcă puțin mai târziu.';
    }
    await tx
      .update(spottedUsage)
      .set({
        attemptWindowStartedAt: windowExpired ? now : usage.attemptWindowStartedAt,
        decodeAttempts: attempts,
        updatedAt: now,
      })
      .where(eq(spottedUsage.scope, SPOTTED_SCOPE));
    return null;
  });
}

/** A sighting is shared community data, never a browser-local demo slot. */
export async function createSpottedPost(input: SpottedInput): Promise<SpottedResult> {
  const user = await currentUser();
  if (!user) return { ok: false, error: 'Trebuie să fii conectat.' };

  let id: string;
  try {
    const since = new Date(Date.now() - HOUR_MS);
    const [[recent], [lifetime]] = await Promise.all([
      db
        .select({ n: count() })
        .from(spottedPosts)
        .where(and(eq(spottedPosts.authorId, user.id), gte(spottedPosts.createdAt, since))),
      db.select({ n: count() }).from(spottedPosts).where(eq(spottedPosts.authorId, user.id)),
    ]);
    if (Number(recent?.n ?? 0) >= USER_POSTS_PER_HOUR) {
      throw new Error('Ai adăugat multe apariții. Mai încearcă într-o oră.');
    }
    if (Number(lifetime?.n ?? 0) >= USER_POSTS_LIFETIME) {
      throw new Error('Ai ajuns la limita de apariții pentru acest cont.');
    }

    // This durable global budget is consumed before any attacker-controlled
    // bytes reach Sharp. Invalid images still count as decoder attempts.
    const decodeBudgetError = await reserveSpottedDecodeAttempt();
    if (decodeBudgetError) throw new Error(decodeBudgetError);

    const photo = await decodeSpottedImage(input.imageDataUrl);
    const location = text(input.location)?.slice(0, 80) ?? null;
    const caption = text(input.caption)?.slice(0, 280) ?? null;
    id = shortId(12);

    await db.transaction(async (tx) => {
      // Serialize per-member quota checks and then lock the global counter.
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`spotted:${user.id}`}))`);
      const now = new Date();
      const lockedSince = new Date(now.getTime() - HOUR_MS);
      const [lockedRecent] = await tx
        .select({ n: count() })
        .from(spottedPosts)
        .where(
          and(eq(spottedPosts.authorId, user.id), gte(spottedPosts.createdAt, lockedSince)),
        );
      const [lockedLifetime] = await tx
        .select({ n: count() })
        .from(spottedPosts)
        .where(eq(spottedPosts.authorId, user.id));
      if (Number(lockedRecent?.n ?? 0) >= USER_POSTS_PER_HOUR) {
        throw new Error('Ai adăugat multe apariții. Mai încearcă într-o oră.');
      }
      if (Number(lockedLifetime?.n ?? 0) >= USER_POSTS_LIFETIME) {
        throw new Error('Ai ajuns la limita de apariții pentru acest cont.');
      }

      const [usage] = await tx
        .select()
        .from(spottedUsage)
        .where(eq(spottedUsage.scope, SPOTTED_SCOPE))
        .limit(1)
        .for('update');
      if (!usage) throw new Error('Spotted este ocupat momentan. Mai încearcă puțin mai târziu.');

      const postWindowExpired = usage.postWindowStartedAt.getTime() < now.getTime() - HOUR_MS;
      const postWindowCount = postWindowExpired ? 1 : usage.postWindowCount + 1;
      if (postWindowCount > GLOBAL_POSTS_PER_HOUR) {
        throw new Error('Spotted este ocupat momentan. Mai încearcă puțin mai târziu.');
      }
      if (
        usage.postCount + 1 > GLOBAL_POST_LIMIT ||
        usage.totalBytes + photo.bytes.length > GLOBAL_BYTE_LIMIT
      ) {
        throw new Error('Spațiul Spotted este momentan plin.');
      }

      await tx.insert(spottedPosts).values({
        id,
        authorId: user.id,
        image: photo.bytes,
        imageType: photo.contentType,
        location,
        caption,
      });
      await tx
        .update(spottedUsage)
        .set({
          postCount: usage.postCount + 1,
          totalBytes: usage.totalBytes + photo.bytes.length,
          postWindowStartedAt: postWindowExpired ? now : usage.postWindowStartedAt,
          postWindowCount,
          updatedAt: now,
        })
        .where(eq(spottedUsage.scope, SPOTTED_SCOPE));
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    return {
      ok: false,
      error: SPOTTED_ERRORS.has(message)
        ? message
        : 'Nu am putut publica fotografia. Încearcă din nou.',
    };
  }

  // Persistence is already committed. Cache invalidation failure must never
  // tell the member that publishing failed and invite a duplicate retry.
  try {
    revalidatePath('/');
  } catch (error) {
    console.error('Spotted cache invalidation failed after commit.', error);
  }
  return { ok: true, id };
}

/**
 * Back a car, or take that backing away. Three per account, changeable
 * until the deadline.
 *
 * The slot is what caps it: unique per voter and checked to be 1-3, so a
 * fourth vote cannot be written even if this function were wrong. Picking
 * the lowest free one keeps a released slot reusable rather than burning
 * it, and the (voter, car) key means voting for the same car twice is one
 * row — a ballot queued on a bad signal is safe to replay.
 *
 * Returns true when the vote was added, false when it was withdrawn.
 */
export async function toggleVote(carId: string): Promise<boolean> {
  const user = await requireUser();
  if (!votingOpen()) throw new Error(`Votul s-a închis la ${EVENT.votingCloses}.`);

  const [car] = await db
    .select({ ownerId: cars.ownerId })
    .from(cars)
    .where(eq(cars.id, carId))
    .limit(1);
  if (!car) throw new Error('Mașina asta nu există.');
  if (car.ownerId === user.id) throw new Error('Nu poți vota propria mașină.');

  const added = await db.transaction(async (tx) => {
    const mine = await tx
      .select({ carId: votes.carId, slot: votes.slot })
      .from(votes)
      .where(eq(votes.voterId, user.id));

    if (mine.some((v) => v.carId === carId)) {
      await tx
        .delete(votes)
        .where(and(eq(votes.voterId, user.id), eq(votes.carId, carId)));
      return false;
    }

    const used = new Set(mine.map((v) => v.slot));
    const slot = [1, 2, 3].find((n) => !used.has(n));
    if (!slot) {
      throw new Error(
        `Ai folosit toate cele ${VOTE_LIMIT} voturi. Retrage unul ca să votezi altă mașină.`,
      );
    }

    await tx.insert(votes).values({ voterId: user.id, carId, slot });
    return true;
  });

  revalidatePath('/award');
  return added;
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

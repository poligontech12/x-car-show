import 'server-only';
import { and, asc, count, desc, eq, inArray } from 'drizzle-orm';
import type { Car, ModCategory, ModGroup } from '@/lib/cars';
import { type CarPhoto, carPhotoUrl } from '@/lib/photos';
import { db } from './index';
import { carPhotos, cars, follows, mods, spottedPosts, users, votes } from './schema';

/** The order the profile and the edit form both show them in. */
const MOD_ORDER: ModCategory[] = ['Motor', 'Suspensie', 'Jante', 'Exterior', 'Interior'];

type CarRow = typeof cars.$inferSelect;
type OwnerRow = { name: string; town: string | null; handle: string; instagram: string | null; facebook: string | null };

/**
 * The screens were written against a flat `Car`, and they still are. The
 * owner's name, town and socials are joined in rather than stored on the
 * car, so editing a profile updates every entry that person brought.
 *
 * A figure nobody filled in comes back as an empty string, never "0" —
 * the profile hides blank stats and would otherwise print a hard zero.
 */
function toCar(
  row: CarRow,
  owner: OwnerRow,
  groups: ModGroup[],
  followers: number,
  photos: CarPhoto[],
): Car {
  const num = (v: number | null) => (v == null ? '' : String(v));
  return {
    id: row.id,
    photos,
    no: row.no ?? '',
    year: row.year ?? 0,
    make: row.make,
    model: row.model,
    cls: row.cls,
    engine: row.engine ?? '',
    power: num(row.power),
    tq: num(row.tq),
    weight: num(row.weight),
    drive: row.drive,
    gbox: row.gbox ?? '',
    wheels: row.wheels ?? '',
    paint: row.paint ?? '',
    stand: row.stand ?? '',
    owner: owner.name,
    town: owner.town ?? '',
    handle: owner.handle,
    followers: String(followers),
    nickname: row.nickname ?? undefined,
    instagram: owner.instagram ?? undefined,
    facebook: owner.facebook ?? undefined,
    win: row.win,
    mods: groups,
    story: row.story ?? '',
  };
}

/** Mods come back as one row per part; the UI wants them grouped. */
function groupMods(rows: { category: ModCategory; item: string }[]): ModGroup[] {
  const by = new Map<ModCategory, string[]>();
  for (const r of rows) {
    const list = by.get(r.category) ?? [];
    list.push(r.item);
    by.set(r.category, list);
  }
  return MOD_ORDER.filter((n) => by.get(n)?.length).map((name) => ({
    name,
    items: by.get(name)!,
  }));
}

/**
 * Slots and stamps, never the bytes. A roster of 142 cars carrying six
 * JPEGs each would be a hundred megabytes of payload; the pictures have
 * their own cacheable route and this only says which ones exist.
 */
async function photosByCarIds(ids: string[]): Promise<Map<string, CarPhoto[]>> {
  if (!ids.length) return new Map();
  const rows = await db
    .select({
      carId: carPhotos.carId,
      position: carPhotos.position,
      updatedAt: carPhotos.updatedAt,
    })
    .from(carPhotos)
    .where(inArray(carPhotos.carId, ids))
    .orderBy(asc(carPhotos.position));

  const by = new Map<string, CarPhoto[]>();
  for (const row of rows) {
    const list = by.get(row.carId) ?? [];
    list.push({
      position: row.position,
      url: carPhotoUrl(row.carId, row.position, row.updatedAt.getTime()),
    });
    by.set(row.carId, list);
  }
  return by;
}

/**
 * Every entry, newest first. Three queries rather than one join so the
 * mods and follower counts do not multiply the car rows — at 142 cars
 * that is cheaper than de-duplicating a cartesian product.
 */
export async function listCars(): Promise<Car[]> {
  const rows = await db
    .select({ car: cars, owner: users })
    .from(cars)
    .innerJoin(users, eq(cars.ownerId, users.id))
    .orderBy(desc(cars.createdAt));

  if (!rows.length) return [];
  const ids = rows.map((r) => r.car.id);

  const [modRows, followRows, photosByCar] = await Promise.all([
    db
      .select({ carId: mods.carId, category: mods.category, item: mods.item })
      .from(mods)
      .where(inArray(mods.carId, ids))
      .orderBy(asc(mods.position)),
    db
      .select({ carId: follows.carId, n: count() })
      .from(follows)
      .where(inArray(follows.carId, ids))
      .groupBy(follows.carId),
    photosByCarIds(ids),
  ]);

  const modsByCar = new Map<string, { category: ModCategory; item: string }[]>();
  for (const m of modRows) {
    const list = modsByCar.get(m.carId) ?? [];
    list.push(m);
    modsByCar.set(m.carId, list);
  }
  const followsByCar = new Map(followRows.map((f) => [f.carId, Number(f.n)]));

  return rows.map((r) =>
    toCar(
      r.car,
      r.owner,
      groupMods(modsByCar.get(r.car.id) ?? []),
      followsByCar.get(r.car.id) ?? 0,
      photosByCar.get(r.car.id) ?? [],
    ),
  );
}

export async function getCar(id: string): Promise<Car | null> {
  const [row] = await db
    .select({ car: cars, owner: users })
    .from(cars)
    .innerJoin(users, eq(cars.ownerId, users.id))
    .where(eq(cars.id, id))
    .limit(1);
  if (!row) return null;

  const [modRows, [followRow], photosByCar] = await Promise.all([
    db
      .select({ category: mods.category, item: mods.item })
      .from(mods)
      .where(eq(mods.carId, id))
      .orderBy(asc(mods.position)),
    db.select({ n: count() }).from(follows).where(eq(follows.carId, id)),
    photosByCarIds([id]),
  ]);

  return toCar(
    row.car,
    row.owner,
    groupMods(modRows),
    Number(followRow?.n ?? 0),
    photosByCar.get(id) ?? [],
  );
}

/** One photograph's bytes, for the route that serves them. */
export async function getCarPhoto(
  carId: string,
  position: number,
): Promise<{ image: Buffer; contentType: string } | null> {
  const [row] = await db
    .select({ image: carPhotos.image, contentType: carPhotos.imageType })
    .from(carPhotos)
    .where(and(eq(carPhotos.carId, carId), eq(carPhotos.position, position)))
    .limit(1);
  return row ?? null;
}

export async function carsByOwnerId(ownerId: string): Promise<Car[]> {
  const all = await listCars();
  const owned = await db.select({ id: cars.id }).from(cars).where(eq(cars.ownerId, ownerId));
  const mine = new Set(owned.map((c) => c.id));
  return all.filter((c) => mine.has(c.id));
}

export interface OwnerProfile {
  handle: string;
  name: string;
  town: string;
  instagram?: string;
  facebook?: string;
  cars: Car[];
}

export async function ownerByHandle(handle: string): Promise<OwnerProfile | null> {
  const [owner] = await db.select().from(users).where(eq(users.handle, handle)).limit(1);
  if (!owner) return null;
  return {
    handle: owner.handle,
    name: owner.name,
    town: owner.town ?? '',
    instagram: owner.instagram ?? undefined,
    facebook: owner.facebook ?? undefined,
    cars: await carsByOwnerId(owner.id),
  };
}

/** Votes per car. The ranking, percentages and ties are presentation. */
export async function voteTally(): Promise<Record<string, number>> {
  const rows = await db
    .select({ carId: votes.carId, n: count() })
    .from(votes)
    .groupBy(votes.carId);
  return Object.fromEntries(rows.map((r) => [r.carId, Number(r.n)]));
}

/** The cars this member has backed, oldest slot first. */
export async function votesOf(userId: string): Promise<string[]> {
  const rows = await db
    .select({ carId: votes.carId })
    .from(votes)
    .where(eq(votes.voterId, userId))
    .orderBy(asc(votes.slot));
  return rows.map((r) => r.carId);
}

export async function followsOf(userId: string): Promise<Record<string, true>> {
  const rows = await db.select({ carId: follows.carId }).from(follows).where(eq(follows.userId, userId));
  return Object.fromEntries(rows.map((r) => [r.carId, true as const]));
}

export async function ownsCar(userId: string, carId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: cars.id })
    .from(cars)
    .where(and(eq(cars.id, carId), eq(cars.ownerId, userId)))
    .limit(1);
  return Boolean(row);
}

export interface SpottedPost {
  id: string;
  author: string;
  location: string | null;
  caption: string | null;
  createdAt: string;
  imageUrl: string;
}

/** The feed carries metadata only. Image bytes have their own cacheable route. */
export async function listSpottedPosts(): Promise<SpottedPost[]> {
  const rows = await db
    .select({
      id: spottedPosts.id,
      author: users.name,
      location: spottedPosts.location,
      caption: spottedPosts.caption,
      createdAt: spottedPosts.createdAt,
    })
    .from(spottedPosts)
    .innerJoin(users, eq(spottedPosts.authorId, users.id))
    .orderBy(desc(spottedPosts.createdAt), desc(spottedPosts.id))
    .limit(30);

  return rows.map((post) => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
    imageUrl: `/api/spotted/${post.id}/image`,
  }));
}

export async function getSpottedImage(
  id: string,
): Promise<{ image: Buffer; contentType: string } | null> {
  const [row] = await db
    .select({ image: spottedPosts.image, contentType: spottedPosts.imageType })
    .from(spottedPosts)
    .where(eq(spottedPosts.id, id))
    .limit(1);
  return row ?? null;
}

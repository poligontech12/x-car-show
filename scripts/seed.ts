/**
 * The twelve demo builds, loaded into a development database so the app
 * has something to show while it is being worked on.
 *
 * PRODUCT.md is explicit that these are placeholders and must never be
 * presented as real entrants, so this refuses to touch a database that
 * already has real people in it, and refuses production outright. It
 * invents no new people either: the owners, cars, towns and stories are
 * the ones already modelled in lib/cars.ts and flagged there.
 *
 * What it adds beyond those is the shape of a show in progress —
 * photographs on the cars, sightings on the feed, follows and votes — so
 * a screen built around photography has photography on it.
 *
 * The pictures come from one of two places. If `npm run demo:photos` has
 * been run, they are openly licensed photographs of other people's cars
 * from Wikimedia Commons, credited in demo-photos/CREDITS.md. If it has
 * not, they are abstract colour fields generated here from each car's
 * real paint name — obviously not photographs of anything, which is the
 * right default for a database nobody has fetched anything for.
 *
 *   npm run demo:photos              fetch real, openly licensed photos
 *   npm run db:seed                  fill an empty database
 *   SEED_RESET=1 npm run db:seed     wipe every account first, then fill
 */
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { sql } from 'drizzle-orm';
import sharp from 'sharp';
import { auth } from '../lib/auth';
import { CARS } from '../lib/cars';
import { CAR_PHOTO_LIMIT } from '../lib/photos';
import { db } from '../lib/db';
import {
  accounts,
  carPhotos,
  cars,
  follows,
  mods,
  spottedPosts,
  spottedUsage,
  users,
  votes,
} from '../lib/db/schema';

const id = (n = 12) => randomBytes(n).toString('base64url').slice(0, n);
const num = (v: string) => (v && Number(v) > 0 ? Number(v) : null);

/** Every demo account shares it. Printed at the end so it can be used. */
const DEMO_PASSWORD = 'Showcase!2026';

/**
 * Deterministic, so re-seeding gives the same show rather than a
 * different one every time — easier to talk about a screenshot.
 */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

/**
 * A car's paint, as a colour. The placeholder then at least belongs to
 * the car it stands in for — the Silvia's wells are Bayside Blue.
 */
const PAINT: Record<string, string> = {
  'Bayside Blue': '#1f4788',
  'Renaissance Red': '#a8231f',
  'Alpinweiss II': '#c9c9cd',
  'Tornado Red': '#b52220',
  'Alb polar': '#d5d5d8',
  'Verde militar': '#4a5335',
  'Highland Green': '#2c4a37',
  'Deep Black': '#1a1a20',
  'Rosso Corsa wrap': '#b81222',
  'RS Green': '#586f34',
  'Hugger Orange': '#c25a1c',
  'Milano Red': '#a81f24',
};

const W = 1400;
const H = 930;

/**
 * An atmospheric field rather than a picture of anything: a sky, a dark
 * mass where a car would sit, and a vignette. Each slot shifts the
 * framing and the light so a car's six wells do not repeat.
 */
async function photograph(paint: string, slot: number, seed: number): Promise<Buffer> {
  const next = rng(seed * 31 + slot);
  const base = PAINT[paint] ?? '#3a3a44';
  const horizon = 0.42 + next() * 0.22;
  const lift = 0.5 + next() * 0.4;
  const skew = (next() - 0.5) * 260;
  const massW = 0.42 + next() * 0.3;

  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="${(next() * 0.5).toFixed(2)}" y2="1">
        <stop offset="0%" stop-color="#0b0c10"/>
        <stop offset="${(horizon * 70).toFixed(0)}%" stop-color="${base}" stop-opacity="${lift.toFixed(2)}"/>
        <stop offset="100%" stop-color="#08080a"/>
      </linearGradient>
      <radialGradient id="glow" cx="${(0.3 + next() * 0.4).toFixed(2)}" cy="${horizon.toFixed(2)}" r="0.7">
        <stop offset="0%" stop-color="${base}" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="${base}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75">
        <stop offset="55%" stop-color="#000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0.6"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#sky)"/>
    <rect width="${W}" height="${H}" fill="url(#glow)"/>
    <rect y="${(H * horizon).toFixed(0)}" width="${W}" height="${(H * (1 - horizon)).toFixed(0)}" fill="#0a0a0d" opacity="0.9"/>
    <ellipse cx="${(W / 2 + skew).toFixed(0)}" cy="${(H * horizon).toFixed(0)}"
             rx="${(W * massW).toFixed(0)}" ry="${(H * 0.19).toFixed(0)}" fill="#0d0d11"/>
    <ellipse cx="${(W / 2 + skew * 1.2).toFixed(0)}" cy="${(H * horizon - H * 0.06).toFixed(0)}"
             rx="${(W * massW * 0.55).toFixed(0)}" ry="${(H * 0.1).toFixed(0)}" fill="#101015" opacity="0.9"/>
    <rect width="${W}" height="${H}" fill="url(#vig)"/>
  </svg>`;

  return sharp(Buffer.from(svg)).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
}

interface Credit {
  carId: string;
  file: string;
  author: string;
  licence: string;
  sourcePage: string;
}

/**
 * Real photographs, if `npm run demo:photos` has fetched any. They are
 * openly licensed pictures of other people's cars from Wikimedia Commons,
 * with their provenance in demo-photos/CREDITS.md — see that file before
 * showing any of this to anybody. Without them the generated fields below
 * stand in, which is the honest default: a database nobody has fetched
 * anything for should look like one.
 */
async function realPhotos(): Promise<Map<string, Credit[]>> {
  const dir = join(process.cwd(), 'demo-photos');
  const by = new Map<string, Credit[]>();
  try {
    const credits = JSON.parse(await readFile(join(dir, 'credits.json'), 'utf8')) as Credit[];
    for (const credit of credits) {
      const list = by.get(credit.carId) ?? [];
      list.push(credit);
      by.set(credit.carId, list);
    }
  } catch {
    // Nothing fetched. The colour fields are the fallback, not an error.
  }
  return by;
}

/** Sightings look different from entries: brighter, looser, street-lit. */
async function sighting(hue: number, seed: number): Promise<Buffer> {
  const next = rng(seed);
  const svg = `<svg width="1200" height="900" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0%" stop-color="hsl(${hue}, 32%, 26%)"/>
        <stop offset="60%" stop-color="hsl(${(hue + 28) % 360}, 26%, 15%)"/>
        <stop offset="100%" stop-color="#0a0a0c"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="900" fill="url(#g)"/>
    <ellipse cx="${(300 + next() * 600).toFixed(0)}" cy="${(430 + next() * 120).toFixed(0)}"
             rx="${(320 + next() * 220).toFixed(0)}" ry="150" fill="#0b0b0e" opacity="0.92"/>
    <circle cx="${(180 + next() * 840).toFixed(0)}" cy="${(120 + next() * 160).toFixed(0)}"
            r="${(40 + next() * 60).toFixed(0)}" fill="hsl(${hue}, 45%, 55%)" opacity="0.18"/>
  </svg>`;
  return sharp(Buffer.from(svg)).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
}

/** Placeholder sightings, kept plain — a note, never a testimonial. */
const SIGHTINGS: { handle: string; location: string; caption: string }[] = [
  { handle: 'andrei.s14', location: 'DN2, Pătrăuți', caption: 'Oprită la benzinărie. Jante late, gardă jos.' },
  { handle: 'mihai1300', location: 'Centru, Cajvana', caption: 'Aceeași mașină pe care o văd în fiecare duminică.' },
  { handle: 'tudor.e30', location: 'Rădăuți', caption: 'Numere vechi, vopsea originală.' },
  { handle: 'dani.evo8', location: 'Ieșire spre Suceava', caption: 'Se auzea de departe.' },
  { handle: 'alex.bagged', location: 'Parcare Kaufland', caption: 'Lăsată pe perne, în colț.' },
  { handle: 'razvan2jz', location: 'DN17, Vatra Dornei', caption: 'A trecut pe lângă mine în sens invers.' },
  { handle: 'florin.fastback', location: 'Gura Humorului', caption: 'Parcată lângă biserică, nimeni lângă ea.' },
];

async function main() {
  if (process.env.NODE_ENV === 'production' && !process.env.SEED_ANYWAY) {
    throw new Error('Refusing to seed demo cars into production. Set SEED_ANYWAY=1 to override.');
  }

  if (process.env.SEED_RESET) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Refusing to reset accounts in production.');
    }
    // Cars, mods, photos, votes, follows and sightings all cascade off the
    // account that owns them, so this is the only delete needed.
    await db.delete(users);
    await db.delete(spottedUsage);
    console.log('Reset: every account and everything hanging off one is gone.');
  }

  const [{ count: existing }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(cars);
  if (existing > 0 && !process.env.SEED_ANYWAY) {
    console.log(`${existing} cars already registered — leaving them alone.`);
    return;
  }

  const ctx = await auth.$context;
  const passwordHash = await ctx.password.hash(DEMO_PASSWORD);

  // One account per distinct owner in the demo roster.
  const owners = new Map<string, { name: string; town: string; instagram?: string; facebook?: string }>();
  for (const c of CARS) {
    owners.set(c.handle, {
      name: c.owner,
      town: c.town,
      instagram: c.instagram,
      facebook: c.facebook,
    });
  }

  const userIdByHandle = new Map<string, string>();
  for (const [handle, o] of owners) {
    const uid = id(16);
    userIdByHandle.set(handle, uid);
    await db
      .insert(users)
      .values({
        id: uid,
        email: `${handle}@exemplu.invalid`,
        emailVerified: true,
        name: o.name,
        handle,
        role: 'car',
        town: o.town,
        instagram: o.instagram ?? null,
        facebook: o.facebook ?? null,
      })
      .onConflictDoNothing();

    // Without credentials nobody can sign in as a demo owner, and the
    // half of the app that only an owner sees cannot be shown at all.
    await db.insert(accounts).values({
      id: id(16),
      accountId: uid,
      providerId: 'credential',
      userId: uid,
      password: passwordHash,
    });
  }

  for (const c of CARS) {
    await db.insert(cars).values({
      id: c.id,
      ownerId: userIdByHandle.get(c.handle)!,
      make: c.make,
      model: c.model,
      year: c.year || null,
      nickname: c.nickname ?? null,
      cls: c.cls,
      power: num(c.power),
      tq: num(c.tq),
      weight: num(c.weight),
      engine: c.engine || null,
      drive: c.drive,
      gbox: c.gbox || null,
      wheels: c.wheels || null,
      paint: c.paint || null,
      story: c.story || null,
      no: c.no || null,
      stand: c.stand || null,
      win: c.win,
    });

    const rows = c.mods.flatMap((g, gi) =>
      g.items.map((item, i) => ({
        id: id(12),
        carId: c.id,
        category: g.name,
        item,
        position: gi * 100 + i,
      })),
    );
    if (rows.length) await db.insert(mods).values(rows);
  }

  // Photographs. Real ones where they were fetched, generated fields
  // otherwise. Not every car ends up fully shot, because at a real show
  // not every car would be — the empty wells are part of what this shows.
  const fetched = await realPhotos();
  let shots = 0;
  let fromCommons = 0;
  for (const [index, c] of CARS.entries()) {
    const real = fetched.get(c.id) ?? [];
    const howMany = real.length || 2 + (index % 5);

    for (let slot = 0; slot < Math.min(howMany, CAR_PHOTO_LIMIT); slot++) {
      const credit = real[slot];
      const bytes = credit
        ? await readFile(join(process.cwd(), 'demo-photos', credit.file))
        : await photograph(c.paint, slot, index + 7);
      const meta = await sharp(bytes).metadata();
      await db.insert(carPhotos).values({
        id: id(12),
        carId: c.id,
        position: slot,
        image: bytes,
        imageType: 'image/jpeg',
        width: meta.width!,
        height: meta.height!,
      });
      shots++;
      if (credit) fromCommons++;
    }
  }

  for (const [i, s] of SIGHTINGS.entries()) {
    const author = userIdByHandle.get(s.handle);
    if (!author) continue;
    await db.insert(spottedPosts).values({
      id: id(12),
      authorId: author,
      image: await sighting((i * 47) % 360, i + 3),
      imageType: 'image/jpeg',
      location: s.location,
      caption: s.caption,
    });
  }

  /**
   * Follows and votes are inserted as rows rather than as numbers, so
   * every count the app shows is one it counted itself. lib/cars.ts
   * carries invented follower figures; nothing reads them here.
   */
  const handles = [...owners.keys()];
  let followCount = 0;
  for (const [vi, handle] of handles.entries()) {
    const voter = userIdByHandle.get(handle)!;
    const next = rng(vi + 11);
    const others = CARS.filter((c) => c.handle !== handle);

    for (const c of others) {
      if (next() < 0.42) {
        await db.insert(follows).values({ userId: voter, carId: c.id }).onConflictDoNothing();
        followCount++;
      }
    }

    // Three each, the same ceiling everyone else has.
    const picks = [...others].sort(() => next() - 0.5).slice(0, 3);
    for (const [slot, c] of picks.entries()) {
      await db
        .insert(votes)
        .values({ voterId: voter, carId: c.id, slot: slot + 1 })
        .onConflictDoNothing();
    }
  }

  console.log(
    `Seeded ${owners.size} owners, ${CARS.length} cars, ${shots} photographs, ` +
      `${SIGHTINGS.length} sightings, ${followCount} follows and ${handles.length * 3} votes.`,
  );
  console.log(`Sign in as any of them — e.g. andrei.s14@exemplu.invalid / ${DEMO_PASSWORD}`);
  if (fromCommons) {
    console.log(
      `\n${fromCommons} of those photographs are openly licensed pictures of other\n` +
        `people's cars from Wikimedia Commons, standing in for a placeholder\n` +
        `roster. Authors and licences: demo-photos/CREDITS.md. Credit them if\n` +
        `you show this anywhere, and never present this roster as real entries.`,
    );
  } else {
    console.log('\nPhotographs are generated colour fields. `npm run demo:photos` fetches real ones.');
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

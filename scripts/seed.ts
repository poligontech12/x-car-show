/**
 * The twelve demo builds, loaded into a development database so the app
 * has something to show while it is being worked on.
 *
 * PRODUCT.md is explicit that these are placeholders and must never be
 * presented as real entrants, so this refuses to touch a database that
 * already has real people in it, and refuses production outright.
 */
import { randomBytes } from 'node:crypto';
import { sql } from 'drizzle-orm';
import { CARS } from '../lib/cars';
import { db } from '../lib/db';
import { cars, mods, users } from '../lib/db/schema';

const id = (n = 12) => randomBytes(n).toString('base64url').slice(0, n);
const num = (v: string) => (v && Number(v) > 0 ? Number(v) : null);

async function main() {
  if (process.env.NODE_ENV === 'production' && !process.env.SEED_ANYWAY) {
    throw new Error('Refusing to seed demo cars into production. Set SEED_ANYWAY=1 to override.');
  }

  const [{ count: existing }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(cars);
  if (existing > 0 && !process.env.SEED_ANYWAY) {
    console.log(`${existing} cars already registered — leaving them alone.`);
    return;
  }

  // One account per distinct owner in the demo roster.
  const owners = new Map<string, { name: string; town: string }>();
  for (const c of CARS) owners.set(c.handle, { name: c.owner, town: c.town });

  const userIdByHandle = new Map<string, string>();
  for (const [handle, o] of owners) {
    const uid = id(16);
    userIdByHandle.set(handle, uid);
    await db
      .insert(users)
      .values({
        id: uid,
        email: `${handle}@exemplu.invalid`,
        name: o.name,
        handle,
        role: 'car',
        town: o.town,
      })
      .onConflictDoNothing();
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

  console.log(`Seeded ${owners.size} owners and ${CARS.length} cars.`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

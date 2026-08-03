import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * The connection is opened on first use, not on import. `next build` loads
 * these modules to collect page data, and the build runs on a machine that
 * has no reason to hold database credentials — throwing at import time
 * would fail the build rather than the query, which is a much worse place
 * to find out.
 */
const globalForDb = globalThis as unknown as {
  sql?: ReturnType<typeof postgres>;
  db?: ReturnType<typeof drizzle<typeof schema>>;
};

function connect() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Locally: copy .env.example to .env.local. ' +
        'On the server: it is set on the container, pointing at Postgres.',
    );
  }
  // Next dev reloads this module on every edit, and each reload would open
  // a fresh pool — Postgres runs out of connections long before you run out
  // of edits. Keep one on the global in development.
  const sql =
    globalForDb.sql ??
    postgres(url, {
      // The show is one server and a few hundred phones; a small pool is
      // plenty and leaves headroom for psql at the gate.
      max: 10,
      idle_timeout: 20,
    });
  if (process.env.NODE_ENV !== 'production') globalForDb.sql = sql;
  return drizzle(sql, { schema });
}

/**
 * A stand-in that connects on the first property anyone reaches for. Every
 * caller writes `db.select(...)` as usual and never sees the difference.
 */
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop, receiver) {
    globalForDb.db ??= connect();
    return Reflect.get(globalForDb.db, prop, receiver);
  },
});

export { schema };

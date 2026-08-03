import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    'DATABASE_URL is not set. Copy .env.example to .env.local and point it at Postgres.',
  );
}

/**
 * Next dev reloads this module on every edit, and each reload would open
 * a fresh pool — Postgres runs out of connections long before you run out
 * of edits. Keep one on the global in development.
 */
const globalForDb = globalThis as unknown as { sql?: ReturnType<typeof postgres> };

const sql =
  globalForDb.sql ??
  postgres(url, {
    // The show is one server and a few hundred phones; a small pool is
    // plenty and leaves headroom for psql at the gate.
    max: 10,
    idle_timeout: 20,
  });

if (process.env.NODE_ENV !== 'production') globalForDb.sql = sql;

export const db = drizzle(sql, { schema });
export { sql, schema };

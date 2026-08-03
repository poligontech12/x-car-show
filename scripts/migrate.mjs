/**
 * Applies pending migrations, then exits. Plain JavaScript on purpose: this
 * runs inside the runtime image at container start, where there is no tsx
 * and no TypeScript.
 *
 * The container that runs this is the one the deploy pipeline health-checks
 * before promoting, so a migration that fails takes the new container down
 * and the previous one stays live.
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set — refusing to start.');
  process.exit(1);
}

// max: 1 — migrations are serial, and a pool would contend on the lock.
const sql = postgres(url, { max: 1 });

try {
  await migrate(drizzle(sql), { migrationsFolder: './drizzle' });
  console.log('Migrations applied.');
} catch (e) {
  console.error('Migration failed:', e);
  process.exit(1);
} finally {
  await sql.end();
}

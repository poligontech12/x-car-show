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

/**
 * Checked here rather than deeper in, because this runs before the server
 * listens: a container missing any of them fails its health check and the
 * deploy rolls back, instead of serving sessions signed with a default
 * secret that anybody could forge.
 */
const missing = ['DATABASE_URL', 'BETTER_AUTH_SECRET', 'NEXT_PUBLIC_SITE_URL'].filter(
  (k) => !process.env[k] || process.env[k] === 'build-time-placeholder',
);
if (missing.length) {
  console.error(`Refusing to start — not set on the container: ${missing.join(', ')}`);
  console.error('On the show server these come from /etc/x-car-show.env via --env-file.');
  process.exit(1);
}

const url = process.env.DATABASE_URL;

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

import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';

/**
 * Is it the app, the database, or the signal?
 *
 * Everything else that answers that question needs a terminal on the
 * server, which is the one thing nobody has in a field. This is a URL. It
 * takes one tap on a phone and says which of the three is broken, plus
 * which commit is actually serving — the question you cannot answer from
 * the outside once a deploy has been and gone.
 *
 * It touches the database on purpose. An endpoint that only proves the
 * process is listening would have answered "ok" through every outage worth
 * having, because the process listens fine while Postgres is unreachable.
 *
 * 200 when the database answers, 503 when it does not, so the deploy
 * pipeline's own health check can point here too and refuse to promote a
 * container that cannot reach its data.
 */

export const dynamic = 'force-dynamic';

const startedAt = Date.now();

/** "2h 14m", because a container that restarted an hour ago is a clue. */
function since(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h ? `${h}h ${m}m` : `${m}m ${s % 60}s`;
}

export async function GET() {
  const began = Date.now();

  /**
   * Counted rather than merely connected to: `select 1` passes against a
   * database that has been restored empty, which is the failure that would
   * matter most on the morning of the show.
   */
  let database: 'up' | 'down' = 'down';
  let cars: number | null = null;
  let detail: string | null = null;

  try {
    const [row] = await db.execute<{ cars: number }>(
      sql`select count(*)::int as cars from cars`,
    );
    cars = Number(row?.cars ?? 0);
    database = 'up';
  } catch (cause) {
    // The message, not the stack: this response is public.
    detail = cause instanceof Error ? cause.message.slice(0, 200) : 'unknown error';
  }

  const body = {
    ok: database === 'up',
    database,
    cars,
    /**
     * Read here, at request time, rather than inlined — Next only bakes
     * `NEXT_PUBLIC_*` into a build, so this is a plain environment variable
     * on the container and needs no rebuild to change. Absent locally, and
     * absent on the server until the deploy script sets it: say so rather
     * than print nothing, or an old build passes for a fresh one.
     */
    commit: process.env.COMMIT_SHA ?? 'unknown',
    uptime: since(Date.now() - startedAt),
    databaseReplyMs: Date.now() - began,
    ...(detail ? { detail } : {}),
  };

  return Response.json(body, {
    status: body.ok ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

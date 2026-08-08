/**
 * How many wrong answers an address gets before the gate stops listening.
 *
 * The code is four digits, which is ten thousand guesses against a public
 * URL — short enough to type one-handed in a field, and short enough for a
 * script to walk in minutes if nothing stands in the way. This is what
 * stands in the way: twenty tries per ten minutes turns the whole space
 * into several days, which outlasts the show.
 *
 * Kept free of `next/headers` and `server-only` so the policy can be
 * tested on its own, without a request or a running server.
 */

export const MAX_TRIES = 20;
export const WINDOW_MS = 10 * 60 * 1000;

/** Enough addresses to be useful, few enough to never be a leak. */
const MAX_TRACKED = 1000;

export type Attempts = Map<string, { count: number; first: number }>;

export const newAttempts = (): Attempts => new Map();

export function isBlocked(attempts: Attempts, key: string, now: number): boolean {
  const seen = attempts.get(key);
  if (!seen || now - seen.first > WINDOW_MS) return false;
  return seen.count >= MAX_TRIES;
}

export function recordFailure(attempts: Attempts, key: string, now: number): void {
  const seen = attempts.get(key);
  // A window that has aged out starts again rather than accumulating, so
  // yesterday's fat fingers are not held against today's.
  if (!seen || now - seen.first > WINDOW_MS) attempts.set(key, { count: 1, first: now });
  else seen.count++;

  if (attempts.size > MAX_TRACKED) {
    for (const [k, v] of attempts) if (now - v.first > WINDOW_MS) attempts.delete(k);
  }
}

/** Getting it right clears the record — a mistype is not an attack. */
export function clear(attempts: Attempts, key: string): void {
  attempts.delete(key);
}

/**
 * Which address to count against, given an `X-Forwarded-For`.
 *
 * The **last** entry, not the first. A proxy appends the peer it actually
 * saw, so the rightmost value is the one our own infrastructure wrote and
 * the only one a client cannot choose. Reading the leftmost — the usual
 * way to find "the real client" — would let anyone send a different
 * `X-Forwarded-For` on every request, get a fresh bucket each time, and
 * walk all ten thousand codes with the throttle looking on.
 *
 * With no header at all there is no proxy to trust, so everyone shares one
 * bucket. That is deliberately the strict end: it can throttle a marshal
 * standing beside an attacker, which is better than throttling nobody.
 */
export function callerKey(forwardedFor: string | null): string {
  const hops = (forwardedFor ?? '')
    .split(',')
    .map((hop) => hop.trim())
    .filter(Boolean);
  return hops.at(-1) ?? 'unknown';
}

import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import {
  callerKey,
  clear,
  isBlocked,
  newAttempts,
  recordFailure,
  type Attempts,
} from './gate-throttle';

/**
 * The gate code.
 *
 * /cards is the only surface that writes on a marshal's behalf — it hands
 * out entry numbers and decides which cars are in the award — so it can
 * not stay the open page it was when it only printed. There are no
 * marshal accounts to check against: the people running the gate share
 * one code, typed once on each phone at the start of the day.
 *
 * What the cookie holds is not the code. It is an HMAC of the code keyed
 * by the server's own secret, so a cookie cannot be written by anyone who
 * does not already know both — and the code itself never sits in a jar on
 * a phone that gets left on a table.
 */

const COOKIE = 'xcs_gate';
/** One long day in a field, and expired by the time the next one starts. */
const MAX_AGE = 16 * 60 * 60;

/**
 * Four digits, typed one-handed on a phone in a field, is the point. It
 * is also ten thousand guesses against a public URL, so the length is not
 * what protects this — the throttle below is. Left alone, a script walks
 * the whole space in minutes; at twenty tries per ten minutes it is days,
 * which outlasts the show.
 */
const MIN_PIN = 4;

/**
 * In memory on purpose. One container serves this, a deploy replaces it
 * every time a commit lands, and a marshal typing a code is not worth a
 * table — the counter only has to outlive an attacker's patience, not the
 * release. The policy itself lives in gate-throttle.ts, where it can be
 * tested without a request.
 */
const attempts: Attempts = newAttempts();

export type GateConfig =
  | { ok: true; pin: string }
  | { ok: false; reason: 'missing' | 'short' | 'no-secret' };

/** Told apart from a wrong code, because the fix is to wait, not retype. */
export type GateAttempt = 'ok' | 'wrong' | 'throttled';

export function gateConfig(): GateConfig {
  const pin = process.env.GATE_PIN?.trim();
  if (!process.env.BETTER_AUTH_SECRET) return { ok: false, reason: 'no-secret' };
  if (!pin) return { ok: false, reason: 'missing' };
  if (pin.length < MIN_PIN) return { ok: false, reason: 'short' };
  return { ok: true, pin };
}

function token(pin: string): string {
  return createHmac('sha256', process.env.BETTER_AUTH_SECRET!).update(`gate:${pin}`).digest('hex');
}

/** Compared byte by byte in constant time; length alone must not leak. */
function sameToken(a: string, b: string): boolean {
  const left = Buffer.from(a, 'utf8');
  const right = Buffer.from(b, 'utf8');
  return left.length === right.length && timingSafeEqual(left, right);
}

/** Whether this browser has already typed the code today. */
export async function gateUnlocked(): Promise<boolean> {
  const config = gateConfig();
  if (!config.ok) return false;
  const held = (await cookies()).get(COOKIE)?.value;
  return Boolean(held) && sameToken(held!, token(config.pin));
}

/**
 * Answers rather than throwing — the form says so on the screen, which is
 * the only place a marshal can act on it.
 *
 * A correct code clears that address's record, so the marshal who fat-
 * fingers it a few times and then gets it right is never counted towards
 * a lockout. Only sustained wrong answers accumulate.
 */
export async function openGate(pin: string): Promise<GateAttempt> {
  const config = gateConfig();
  if (!config.ok) return 'wrong';

  const key = callerKey((await headers()).get('x-forwarded-for'));
  const now = Date.now();
  if (isBlocked(attempts, key, now)) return 'throttled';

  if (!sameToken(pin.trim(), config.pin)) {
    recordFailure(attempts, key, now);
    return 'wrong';
  }
  clear(attempts, key);

  (await cookies()).set(COOKIE, token(config.pin), {
    httpOnly: true,
    sameSite: 'lax',
    /**
     * Secure exactly when the site is served over https, read off the
     * origin rather than off NODE_ENV.
     *
     * A production build served over plain http — which is what a local
     * check of the real bundle is — would otherwise mark this Secure and
     * have the browser drop it on the floor. Chrome hides that by
     * exempting localhost; Safari does not, so the gate opened once and
     * then said the session had ended on the very next press.
     */
    secure: process.env.NEXT_PUBLIC_SITE_URL?.startsWith('https://') ?? false,
    path: '/cards',
    maxAge: MAX_AGE,
  });
  return 'ok';
}

export async function closeGate(): Promise<void> {
  (await cookies()).delete({ name: COOKIE, path: '/cards' });
}

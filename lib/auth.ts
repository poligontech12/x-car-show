import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { accounts, sessions, users, verifications } from './db/schema';

/**
 * A handle out of whatever the person typed as their name: no diacritics,
 * no spaces, safe in a URL and readable on a printed card. Bucovina names
 * are full of ș/ț/ă, so the fold matters.
 */
export function slugHandle(input: string): string {
  const base = input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ș|ş/gi, 's')
    .replace(/ț|ţ/gi, 't')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
    .slice(0, 24);
  return base || 'membru';
}

/** Handles are unique and public; walk until one is free. */
async function uniqueHandle(input: string): Promise<string> {
  const base = slugHandle(input);
  for (let n = 0; n < 50; n++) {
    const candidate = n === 0 ? base : `${base}.${n + 1}`;
    const [taken] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.handle, candidate))
      .limit(1);
    if (!taken) return candidate;
  }
  return `${base}.${Date.now().toString(36)}`;
}

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.NEXT_PUBLIC_SITE_URL,

  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: { user: users, session: sessions, account: accounts, verification: verifications },
  }),

  /**
   * Email and password, and nothing else. There is no SMTP behind this
   * app, so magic links and password resets would be a promise it cannot
   * keep — and a rural showground is the worst place to discover that.
   */
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: false,
  },

  user: {
    additionalFields: {
      handle: { type: 'string', required: false, input: false },
      role: { type: 'string', required: false, defaultValue: 'vote' },
      town: { type: 'string', required: false },
      instagram: { type: 'string', required: false },
      facebook: { type: 'string', required: false },
    },
  },

  databaseHooks: {
    user: {
      create: {
        // The handle is ours to assign, not the visitor's to claim — it
        // has to be unique and it ends up in a URL on a printed card.
        before: async (user) => ({
          data: { ...user, handle: await uniqueHandle(user.name || user.email) },
        }),
      },
    },
  },

  /**
   * The defaults lock people out at a car show.
   *
   * Rate limiting here is per IP, and on show day a field in Cajvana means
   * one venue wifi or one saturated cell tower — a hundred and forty-two
   * people arriving behind a handful of shared addresses. Under the stock
   * limits the first few register and everybody behind them is told to try
   * again later, on the one morning that cannot be repeated.
   *
   * These numbers still stop somebody grinding passwords (twenty tries a
   * minute gets nowhere against an eight-character minimum) while leaving
   * room for a whole paddock signing up from the same IP at once.
   */
  rateLimit: {
    enabled: true,
    window: 60,
    max: 200,
    customRules: {
      '/sign-in/email': { window: 60, max: 20 },
      '/sign-up/email': { window: 60, max: 20 },
    },
  },

  // Keeps people signed in across the weekend without a round trip on
  // every request — the vote screen reads the session constantly.
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },

  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;

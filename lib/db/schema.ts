import { sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  check,
  customType,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';
import type { CarClass, ModCategory } from '@/lib/cars';
import type { Role } from '@/lib/store';

const bytea = customType<{ data: Buffer }>({
  dataType() {
    return 'bytea';
  },
});

/**
 * Six tables and the show fits in them. Everything a person reads on a
 * car page is either a column here or a join away — the owner's name,
 * town and socials live on the account, never copied onto the car, so
 * editing a profile updates every entry at once.
 *
 * Better Auth owns `users`, `sessions`, `accounts` and `verifications`;
 * the columns it does not know about are declared as additional fields
 * in lib/auth.ts and must be kept in step with the ones below.
 */

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  name: text('name').notNull(),
  image: text('image'),

  /** How the community finds you: the public profile lives at /owner/<handle>. */
  handle: text('handle').notNull().unique(),
  role: text('role').$type<Role>().notNull().default('vote'),
  town: text('town'),
  /** Handles, not URLs — the link is built at render. */
  instagram: text('instagram'),
  facebook: text('facebook'),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  token: text('token').notNull().unique(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Credentials. One row per sign-in method; today that is email + password. */
export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  password: text('password'),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
  scope: text('scope'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * An entry. The id is short because it is printed on the windscreen card
 * and encoded into the QR beside it — someone should be able to read it
 * off the card and type it.
 */
export const cars = pgTable(
  'cars',
  {
    id: text('id').primaryKey(),
    ownerId: text('owner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    make: text('make').notNull(),
    model: text('model').notNull(),
    year: integer('year'),
    /** What the owner calls it. Printed under the headline on the card. */
    nickname: text('nickname'),
    cls: text('cls').$type<CarClass>().notNull().default('JDM'),

    /** Blank until the owner fills it in — never zero. */
    power: integer('power'),
    tq: integer('tq'),
    weight: integer('weight'),

    engine: text('engine'),
    drive: text('drive').$type<'FWD' | 'RWD' | 'AWD' | '4WD'>().notNull().default('RWD'),
    gbox: text('gbox'),
    wheels: text('wheels'),
    paint: text('paint'),
    story: text('story'),

    /** Handed out by the organiser at the gate, not by the owner. */
    no: text('no'),
    stand: text('stand'),
    /** The year this car took car of the show, if it ever has. */
    win: text('win'),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('cars_owner_idx').on(t.ownerId)],
);

/** One row per part, grouped by category and ordered within it. */
export const mods = pgTable(
  'mods',
  {
    id: text('id').primaryKey(),
    carId: text('car_id')
      .notNull()
      .references(() => cars.id, { onDelete: 'cascade' }),
    category: text('category').$type<ModCategory>().notNull(),
    item: text('item').notNull(),
    position: integer('position').notNull().default(0),
  },
  (t) => [index('mods_car_idx').on(t.carId)],
);

/**
 * Uploaded photos. `slot` matches the ImageSlot id on the page, so a
 * car keeps its hero and its gallery order without a separate join.
 */
export const photos = pgTable(
  'photos',
  {
    id: text('id').primaryKey(),
    carId: text('car_id')
      .notNull()
      .references(() => cars.id, { onDelete: 'cascade' }),
    slot: text('slot').notNull(),
    path: text('path').notNull(),
    width: integer('width').notNull(),
    height: integer('height').notNull(),
    position: integer('position').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('photos_car_slot').on(t.carId, t.slot)],
);

/** Shared sightings. The image bytes live in Postgres so a deploy cannot
 * erase them and every phone sees the same post; they are served separately
 * from the feed payload by /api/spotted/:id/image. */
export const spottedPosts = pgTable(
  'spotted_posts',
  {
    id: text('id').primaryKey(),
    authorId: text('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    image: bytea('image').notNull(),
    imageType: text('image_type').notNull(),
    location: text('location'),
    caption: text('caption'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('spotted_posts_created_idx').on(t.createdAt),
    index('spotted_posts_author_created_idx').on(t.authorId, t.createdAt),
    check('spotted_posts_image_size', sql`octet_length(${t.image}) between 1 and 1000000`),
    check('spotted_posts_image_type', sql`${t.imageType} = 'image/jpeg'`),
  ],
);

/** One locked row keeps decoder and storage budgets durable across workers. */
export const spottedUsage = pgTable(
  'spotted_usage',
  {
    scope: text('scope').primaryKey(),
    postCount: integer('post_count').notNull().default(0),
    totalBytes: bigint('total_bytes', { mode: 'number' }).notNull().default(0),
    attemptWindowStartedAt: timestamp('attempt_window_started_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    decodeAttempts: integer('decode_attempts').notNull().default(0),
    postWindowStartedAt: timestamp('post_window_started_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    postWindowCount: integer('post_window_count').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check('spotted_usage_post_count', sql`${t.postCount} >= 0`),
    check('spotted_usage_total_bytes', sql`${t.totalBytes} >= 0`),
    check('spotted_usage_decode_attempts', sql`${t.decodeAttempts} >= 0`),
    check('spotted_usage_post_window_count', sql`${t.postWindowCount} >= 0`),
  ],
);

/**
 * Car of the show. Three votes each, and both halves of that are the
 * database's job rather than the app's:
 *
 * - the primary key is (voter, car), so voting for the same car twice is
 *   the same row. A ballot queued on a bad signal is safe to replay.
 * - each vote occupies a numbered slot, unique per voter and checked to
 *   be 1, 2 or 3. Three rows per person is arithmetic, not a count the
 *   app has to remember to run.
 */
export const votes = pgTable(
  'votes',
  {
    voterId: text('voter_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    carId: text('car_id')
      .notNull()
      .references(() => cars.id, { onDelete: 'cascade' }),
    slot: integer('slot').notNull(),
    castAt: timestamp('cast_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.voterId, t.carId] }),
    unique('votes_voter_slot').on(t.voterId, t.slot),
    check('votes_slot_range', sql`${t.slot} between 1 and 3`),
    index('votes_car_idx').on(t.carId),
  ],
);

export const follows = pgTable(
  'follows',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    carId: text('car_id')
      .notNull()
      .references(() => cars.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.carId] }), index('follows_car_idx').on(t.carId)],
);

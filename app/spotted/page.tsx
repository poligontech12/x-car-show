import { cookies } from 'next/headers';
import { listSpottedPosts } from '@/lib/db/queries';
import { shuffledAfter } from '@/lib/shuffle';
import { VISIT_COOKIE } from '@/middleware';
import { SpottedFeed } from '../SpottedFeed';

export const dynamic = 'force-dynamic';

/**
 * How many sightings hold their place at the top.
 *
 * Enough that somebody who has just posted finds their photograph without
 * scrolling — which is the thing a shuffled feed would otherwise take away,
 * since a post that is not where you left it reads as a post that failed.
 * Everything behind these is old enough that the order was arbitrary
 * anyway, and shuffling it is what makes the feed worth opening twice.
 */
const NEWEST_HELD = 3;

export default async function SpottedPage() {
  const [posts, jar] = await Promise.all([listSpottedPosts(), cookies()]);
  const seed = jar.get(VISIT_COOKIE)?.value ?? 'no-seed';
  return <SpottedFeed posts={shuffledAfter(posts, NEWEST_HELD, seed)} />;
}

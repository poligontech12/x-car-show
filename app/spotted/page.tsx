import { SpottedFeed } from './SpottedFeed';
import { listSpottedPosts } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

export default async function SpottedPage() {
  return <SpottedFeed posts={await listSpottedPosts()} />;
}

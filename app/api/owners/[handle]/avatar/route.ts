import { getAvatarByHandle } from '@/lib/db/queries';

/**
 * A member's own photograph, served away from the page that shows it —
 * the same arrangement every other picture here uses. The URL carries the
 * stamp from when it was uploaded, so replacing your photo changes the
 * link and nothing has to be told to forget the old one.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ handle: string }> },
) {
  const { handle } = await context.params;
  const avatar = await getAvatarByHandle(handle);
  if (!avatar) {
    return new Response('Not found', {
      status: 404,
      headers: { 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store' },
    });
  }

  const versioned = new URL(request.url).searchParams.has('v');

  return new Response(new Uint8Array(avatar.image), {
    headers: {
      'Content-Type': avatar.contentType,
      'Cache-Control': versioned ? 'public, max-age=31536000, immutable' : 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

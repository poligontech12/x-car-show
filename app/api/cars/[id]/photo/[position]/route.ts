import { getCarPhoto } from '@/lib/db/queries';
import { isCarPhotoPosition } from '@/lib/photos';

/**
 * A car's photograph, served away from the page that shows it. The roster
 * carries slot numbers and stamps; the bytes come from here, once, and
 * then out of the phone's cache for as long as the picture stands.
 */
function notFound() {
  return new Response('Not found', {
    status: 404,
    headers: { 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store' },
  });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string; position: string }> },
) {
  const { id, position } = await context.params;
  const slot = Number(position);
  if (!isCarPhotoPosition(slot)) return notFound();

  const photo = await getCarPhoto(id, slot);
  if (!photo) return notFound();

  /**
   * Every link the app renders carries the photo's own updated stamp, so
   * a given `v` can never come back as different bytes. A link without
   * one is somebody's bare URL and has to be re-checked each time, or
   * replacing a photograph would leave the old one on the phone forever.
   */
  const versioned = new URL(request.url).searchParams.has('v');

  return new Response(new Uint8Array(photo.image), {
    headers: {
      'Content-Type': photo.contentType,
      'Cache-Control': versioned ? 'public, max-age=31536000, immutable' : 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

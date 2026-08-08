import { getCarPhoto } from '@/lib/db/queries';
import { isPhotoWidth, photoVariant, prefersWebp } from '@/lib/image-variants';
import { isCarPhotoPosition } from '@/lib/photos';

/**
 * A car's photograph, served away from the page that shows it. The roster
 * carries slot numbers and stamps; the bytes come from here, once, and
 * then out of the phone's cache for as long as the picture stands.
 *
 * `w` picks a rendered width from the allowlist — the garage draws a 76px
 * tile and has no use for the full picture. Absent, the stored photograph
 * is served whole, so a link somebody typed by hand still works.
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

  const url = new URL(request.url);

  /**
   * Every link the app renders carries the photo's own updated stamp, so
   * a given `v` can never come back as different bytes. A link without
   * one is somebody's bare URL and has to be re-checked each time, or
   * replacing a photograph would leave the old one on the phone forever.
   */
  const version = url.searchParams.get('v');
  const versioned = version !== null;

  const asked = Number(url.searchParams.get('w'));
  const width = isPhotoWidth(asked) ? asked : undefined;
  const webp = prefersWebp(request.headers.get('accept'));

  const variant = await photoVariant(
    `${id}/${slot}/${version ?? 'live'}`,
    Buffer.from(photo.image),
    photo.contentType,
    { width, webp },
  );

  return new Response(new Uint8Array(variant.bytes), {
    headers: {
      'Content-Type': variant.contentType,
      'Cache-Control': versioned ? 'public, max-age=31536000, immutable' : 'no-store',
      /**
       * The same URL answers with WebP or JPEG depending on who asked, so
       * anything caching in between has to keep them apart. Without this a
       * proxy could hand a WebP to a browser that cannot read it.
       */
      Vary: 'Accept',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

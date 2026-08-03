import { getSpottedImage } from '@/lib/db/queries';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const photo = await getSpottedImage(id);
  if (!photo) {
    return new Response('Not found', {
      status: 404,
      headers: { 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store' },
    });
  }

  return new Response(new Uint8Array(photo.image), {
    headers: {
      'Content-Type': photo.contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

import 'server-only';
import sharp from 'sharp';

/**
 * A stored photograph, cut to the size the screen asking for it will draw.
 *
 * Everything is kept at 1200px wide, which is right for a card that fills
 * a phone and absurd for the 76px tile in the garage — a quarter of a
 * megapixel of detail thrown away by the browser, over a tower shared with
 * a hundred and forty other people.
 *
 * WebP rather than AVIF. AVIF is smaller again, but sharp spends hundreds
 * of milliseconds encoding one and this happens per request; WebP encodes
 * in tens of milliseconds, saves about a third over the stored JPEG, and
 * every browser that will be at this show reads it.
 */

/**
 * The only widths that will be rendered. An allowlist rather than any
 * number the query string offers: each distinct width is a cache entry and
 * a libvips call, and `?w=1`, `?w=2`, `?w=3` is a cheap way to make a
 * server spend its afternoon resizing.
 */
export const PHOTO_WIDTHS = [240, 720, 1200] as const;
export type PhotoWidth = (typeof PHOTO_WIDTHS)[number];

export const isPhotoWidth = (n: unknown): n is PhotoWidth =>
  PHOTO_WIDTHS.includes(n as PhotoWidth);

/**
 * Bounded, and evicted oldest-first. The container is replaced on every
 * deploy so this starts cold and that is fine: the cost of a miss is one
 * resize, and the versioned URLs mean a phone asks once and then never
 * again. The cap is what keeps a hundred and forty cars across three
 * widths and two formats from becoming the process's memory profile.
 */
const CACHE_LIMIT = 240;
const cache = new Map<string, { bytes: Buffer; contentType: string }>();

function remember(key: string, value: { bytes: Buffer; contentType: string }) {
  if (cache.size >= CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, value);
}

/** WebP when the browser says it reads it, which since iOS 14 is all of them. */
export const prefersWebp = (accept: string | null): boolean =>
  Boolean(accept?.includes('image/webp'));

export interface Variant {
  bytes: Buffer;
  contentType: string;
}

/**
 * `key` must identify these exact stored bytes — the photo's version stamp
 * belongs in it, or replacing a picture would serve the old one until the
 * process restarts.
 */
export async function photoVariant(
  key: string,
  original: Buffer,
  originalType: string,
  options: { width?: PhotoWidth; webp: boolean },
): Promise<Variant> {
  const { width, webp } = options;

  // Nothing asked for: hand back what is stored, untouched.
  if (!width && !webp) return { bytes: original, contentType: originalType };

  const cacheKey = `${key}|${width ?? 'full'}|${webp ? 'webp' : 'orig'}`;
  const hit = cache.get(cacheKey);
  if (hit) return hit;

  try {
    let pipeline = sharp(original, { failOn: 'error', sequentialRead: true });
    if (width) {
      // `withoutEnlargement` so asking for 1200 of a photograph stored
      // smaller returns the photograph, not an upscaled blur of it.
      pipeline = pipeline.resize({ width, withoutEnlargement: true });
    }

    const rendered = webp
      ? await pipeline.webp({ quality: 74 }).toBuffer()
      : await pipeline.jpeg({ quality: 80, mozjpeg: true }).toBuffer();

    /**
     * A conversion that came out heavier than what we already had is a
     * conversion worth throwing away — small photographs sometimes do.
     */
    const result =
      rendered.length < original.length
        ? { bytes: rendered, contentType: webp ? 'image/webp' : originalType }
        : { bytes: original, contentType: originalType };

    remember(cacheKey, result);
    return result;
  } catch {
    // A photograph libvips will not re-encode is still a photograph the
    // phone can show. Serve what is stored rather than nothing.
    return { bytes: original, contentType: originalType };
  }
}

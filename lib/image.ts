import sharp from 'sharp';

const MAX_INPUT_BYTES = 1_000_000;
const MAX_PIXELS = 12_000_000;
const MAX_DIMENSION = 4_096;
const DATA_URL = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/;

export interface DecodedImage {
  contentType: 'image/jpeg';
  bytes: Buffer;
  width: number;
  height: number;
}

const formats = {
  'image/jpeg': 'jpeg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const;

function imageError(): Error {
  return new Error('Fotografia nu poate fi citită.');
}

/**
 * Decode with libvips, cap pixels, strip metadata, and persist one safe
 * format. Every image a member uploads goes through here — a sighting on
 * the feed and a photograph on a car are the same problem.
 */
export async function decodeUploadedImage(
  dataUrl: string,
  options: { maxEdge?: number; square?: boolean; maxBytes?: number } = {},
): Promise<DecodedImage> {
  const match = DATA_URL.exec(dataUrl);
  if (!match) throw new Error('Alege o fotografie JPEG, PNG sau WebP.');

  const declaredType = match[1] as keyof typeof formats;
  const input = Buffer.from(match[2], 'base64');
  if (input.length > MAX_INPUT_BYTES) throw new Error('Fotografia este prea mare.');
  if (!input.length) throw imageError();

  try {
    const decoder = sharp(input, {
      failOn: 'error',
      limitInputPixels: MAX_PIXELS,
      sequentialRead: true,
    });
    const metadata = await decoder.metadata();
    if (
      metadata.format !== formats[declaredType] ||
      !metadata.width ||
      !metadata.height ||
      metadata.width > MAX_DIMENSION ||
      metadata.height > MAX_DIMENSION ||
      metadata.width * metadata.height > MAX_PIXELS
    ) {
      throw imageError();
    }

    const edge = options.maxEdge ?? 1_600;
    const ceiling = options.maxBytes ?? MAX_INPUT_BYTES;
    /**
     * A photograph keeps its shape; a face is cropped to the circle it
     * will be drawn in, here rather than in CSS, so every avatar in the
     * database is already the shape every screen wants.
     */
    const shape = options.square
      ? ({ width: edge, height: edge, fit: 'cover', position: 'attention' } as const)
      : ({ width: edge, height: edge, fit: 'inside', withoutEnlargement: true } as const);

    let encoded = await decoder
      .rotate()
      .resize(shape)
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });

    if (encoded.data.length > ceiling) {
      encoded = await sharp(input, { failOn: 'error', limitInputPixels: MAX_PIXELS })
        .rotate()
        .resize(
          options.square
            ? { ...shape, width: Math.round(edge * 0.75), height: Math.round(edge * 0.75) }
            : { ...shape, width: 1_200, height: 1_200 },
        )
        .jpeg({ quality: 68, mozjpeg: true })
        .toBuffer({ resolveWithObject: true });
    }
    if (encoded.data.length > ceiling) throw new Error('Fotografia este prea mare.');

    return {
      contentType: 'image/jpeg',
      bytes: encoded.data,
      width: encoded.info.width,
      height: encoded.info.height,
    };
  } catch (error) {
    if (error instanceof Error && error.message === 'Fotografia este prea mare.') throw error;
    throw imageError();
  }
}

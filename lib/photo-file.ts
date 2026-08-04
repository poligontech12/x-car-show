/**
 * Turning what came out of the camera into something we can post.
 *
 * A phone photo straight off the sensor is four megabytes, and the
 * server will not accept more than one — so the downscale happens here,
 * before the upload, on the device that already has the pixels. The
 * canvas round-trip is also what strips camera EXIF: an uploaded photo
 * should not carry the GPS coordinates of somebody's garage.
 */

const MAX_EDGE = 1600;
const QUALITY = 0.82;

/**
 * The ceiling on a data URL we will send. Base64 inflates by four
 * thirds, and the decoder refuses anything over a megabyte of input —
 * so this is that limit, said in the units the client is counting in.
 */
export const MAX_UPLOAD_DATA_URL = 1_340_000;

/**
 * Downscale so the long edge is at most MAX_EDGE, then JPEG-encode.
 * Falls back to reading the file as-is if the browser cannot decode it.
 */
export async function fileToDataUrl(
  file: File,
  options: { maxEdge?: number; quality?: number; allowOriginalFallback?: boolean } = {},
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Not an image');
  }

  try {
    const bitmap = await createImageBitmap(file);
    const maxEdge = options.maxEdge ?? MAX_EDGE;
    const quality = options.quality ?? QUALITY;
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    return canvas.toDataURL('image/jpeg', quality);
  } catch (error) {
    // Shared uploads must pass through the canvas: that strips camera EXIF
    // metadata and guarantees a bounded JPEG rather than leaking the original.
    if (options.allowOriginalFallback === false) throw error;
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
}

/**
 * A car photograph, sized to send. Tries at full size first because this
 * picture fills a phone screen edge to edge; a busy shot that comes back
 * too heavy is re-encoded smaller rather than refused, which is what the
 * decoder does on its own side too.
 */
export async function prepareCarPhoto(file: File): Promise<string> {
  let dataUrl = await fileToDataUrl(file, {
    maxEdge: 1600,
    quality: 0.78,
    allowOriginalFallback: false,
  });
  if (dataUrl.length > MAX_UPLOAD_DATA_URL) {
    dataUrl = await fileToDataUrl(file, {
      maxEdge: 1200,
      quality: 0.66,
      allowOriginalFallback: false,
    });
  }
  if (dataUrl.length > MAX_UPLOAD_DATA_URL) throw new Error('Fotografia este prea mare.');
  return dataUrl;
}

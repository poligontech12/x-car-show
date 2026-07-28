/**
 * Photo slots.
 *
 * Every image area in the app is a drop target — drag a photo onto a
 * placeholder and it sticks, across reloads. Photos are downscaled and
 * re-encoded before they are stored, because a phone photo straight off
 * the camera is 4 MB and localStorage gives us about 5 MB in total.
 */

const PREFIX = 'x-car-show/slot/';
const MAX_EDGE = 1600;
const QUALITY = 0.82;

type Listener = (dataUrl: string | null) => void;

/** Slots with the same id on screen at once stay in step. */
const listeners = new Map<string, Set<Listener>>();

export function readSlot(id: string): string | null {
  try {
    return window.localStorage.getItem(PREFIX + id);
  } catch {
    return null;
  }
}

function announce(id: string, value: string | null) {
  listeners.get(id)?.forEach((fn) => fn(value));
}

export function subscribeSlot(id: string, fn: Listener): () => void {
  let set = listeners.get(id);
  if (!set) {
    set = new Set();
    listeners.set(id, set);
  }
  set.add(fn);
  return () => {
    set.delete(fn);
    if (set.size === 0) listeners.delete(id);
  };
}

export function writeSlot(id: string, dataUrl: string): boolean {
  try {
    window.localStorage.setItem(PREFIX + id, dataUrl);
    announce(id, dataUrl);
    return true;
  } catch {
    // Quota. Drop the other slots' photos rather than losing this one —
    // the person is looking at the slot they just filled.
    try {
      for (const key of Object.keys(window.localStorage)) {
        if (key.startsWith(PREFIX) && key !== PREFIX + id) {
          window.localStorage.removeItem(key);
        }
      }
      window.localStorage.setItem(PREFIX + id, dataUrl);
      announce(id, dataUrl);
      return true;
    } catch {
      // Still no room, or storage is blocked. Show it for this session only.
      announce(id, dataUrl);
      return false;
    }
  }
}

export function clearSlot(id: string) {
  try {
    window.localStorage.removeItem(PREFIX + id);
  } catch {
    /* nothing to clean up */
  }
  announce(id, null);
}

/**
 * Downscale so the long edge is at most MAX_EDGE, then JPEG-encode.
 * Falls back to reading the file as-is if the browser cannot decode it.
 */
export async function fileToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Not an image');
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    return canvas.toDataURL('image/jpeg', QUALITY);
  } catch {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
}

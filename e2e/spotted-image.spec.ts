import { expect, test } from '@playwright/test';
import { decodeSpottedImage } from '../lib/spotted-image';

const PIXEL_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

test('spotted photos are decoded and normalized to a bounded JPEG', async () => {
  const photo = await decodeSpottedImage(`data:image/png;base64,${PIXEL_PNG}`);

  expect(photo.contentType).toBe('image/jpeg');
  expect([...photo.bytes.subarray(0, 3)]).toEqual([255, 216, 255]);
  expect(photo.width).toBe(1);
  expect(photo.height).toBe(1);
});

test('spotted photos reject unsupported, malformed, and oversized payloads', async () => {
  await expect(decodeSpottedImage('data:image/svg+xml;base64,PHN2Zy8+')).rejects.toThrow(
    'Alege o fotografie JPEG, PNG sau WebP.',
  );
  await expect(decodeSpottedImage('data:image/jpeg;base64,/9j/2Q==')).rejects.toThrow(
    'Fotografia nu poate fi citită.',
  );
  await expect(decodeSpottedImage(`data:image/jpeg;base64,${PIXEL_PNG}`)).rejects.toThrow(
    'Fotografia nu poate fi citită.',
  );

  const oversized = `data:image/jpeg;base64,${Buffer.alloc(1_000_001).toString('base64')}`;
  await expect(decodeSpottedImage(oversized)).rejects.toThrow('Fotografia este prea mare.');
});

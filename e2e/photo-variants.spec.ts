/**
 * A photograph arrives at the size the screen will draw it.
 *
 * Everything is stored at 1200px wide, which is right for a card filling a
 * phone and absurd for the 76px tile in the garage. The route renders a
 * width on request and answers in WebP when the browser says it reads one.
 * Both matter on a showground sharing one tower between a hundred and
 * forty phones.
 */
import { expect, test } from '@playwright/test';

const JPEG = { Accept: 'image/jpeg' };
const WEBP = { Accept: 'image/webp,image/*,*/*' };

/** A car from the seed that has a lead photograph. */
async function aPhotoUrl(request: import('@playwright/test').APIRequestContext) {
  const res = await request.get('/api/health');
  expect(res.ok(), 'need a working app to ask for a photo').toBe(true);
  return '/api/cars/evo/photo/0?v=1';
}

test('a browser that reads WebP is sent WebP, and one that does not is not', async ({
  request,
}) => {
  const url = await aPhotoUrl(request);

  const asJpeg = await request.get(url, { headers: JPEG });
  const asWebp = await request.get(url, { headers: WEBP });

  expect(asJpeg.headers()['content-type']).toBe('image/jpeg');
  expect(asWebp.headers()['content-type']).toBe('image/webp');

  const jpegBytes = (await asJpeg.body()).length;
  const webpBytes = (await asWebp.body()).length;
  expect(webpBytes, 'the point of WebP is that it is smaller').toBeLessThan(jpegBytes);

  // Anything caching between us and the phone has to keep the two apart,
  // or a browser gets a format it cannot read.
  expect(asWebp.headers()['vary']).toContain('Accept');
  expect(asWebp.headers()['cache-control']).toContain('immutable');
});

test('a width from the allowlist is rendered, and anything else is ignored', async ({
  request,
}) => {
  const url = await aPhotoUrl(request);

  const full = (await (await request.get(url, { headers: WEBP })).body()).length;
  const small = (await (await request.get(`${url}&w=240`, { headers: WEBP })).body()).length;
  expect(small, 'a 240px tile is a fraction of the full picture').toBeLessThan(full / 4);

  // Not on the list: served whole rather than rendered, so a query string
  // cannot ask the server to spend its afternoon resizing.
  const odd = await request.get(`${url}&w=137`, { headers: WEBP });
  expect(odd.status()).toBe(200);
  expect((await odd.body()).length, 'an unlisted width falls back to full').toBe(full);
});

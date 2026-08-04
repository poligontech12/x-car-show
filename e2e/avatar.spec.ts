import { expect, test } from '@playwright/test';

/**
 * A member's own photograph: added on the account screen, served from its
 * own route, and still there on the next load.
 */

const PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);

function identity() {
  const stamp = `${Date.now()}.${Math.random().toString(16).slice(2)}`;
  return {
    email: `e2e.avatar.${stamp}@example.com`,
    password: `E2e!${stamp}Aa`,
    name: `Fata ${stamp.slice(-5)}`,
  };
}

test('a member can add their own photograph, and it sticks', async ({ page }) => {
  test.skip(process.env.E2E_ALLOW_WRITES !== '1', 'creates a disposable account');
  const member = identity();

  const registration = await page.request.post('/api/auth/sign-up/email', {
    data: { name: member.name, email: member.email, password: member.password },
    headers: { Origin: new URL(process.env.PLAYWRIGHT_BASE_URL!).origin },
  });
  expect(registration.status()).toBe(200);

  await page.goto('/auth');
  await expect(page.getByRole('button', { name: 'Adaugă o poză' })).toBeVisible();

  await page.locator('input[type="file"]').setInputFiles({
    name: 'me.png',
    mimeType: 'image/png',
    buffer: PIXEL_PNG,
  });

  // Once it lands the control changes its mind about what it is for.
  await expect(page.getByRole('button', { name: 'Schimbă poza' })).toBeVisible({ timeout: 15_000 });

  const face = page.getByAltText(member.name);
  await expect(face).toBeVisible();
  const src = await face.getAttribute('src');
  expect(src).toMatch(/^\/api\/owners\/.+\/avatar\?v=\d+$/);

  const served = await page.request.get(src!);
  expect(served.status()).toBe(200);
  expect(served.headers()['content-type']).toBe('image/jpeg');
  expect(served.headers()['cache-control']).toContain('immutable');
  expect((await served.body()).subarray(0, 3)).toEqual(Buffer.from([0xff, 0xd8, 0xff]));

  // The session is cached for five minutes; a reload has to show the new
  // face rather than the account as it was before the upload.
  await page.reload();
  await expect(page.getByAltText(member.name)).toBeVisible();

  // And taking it away puts the initial back.
  await page.getByRole('button', { name: 'Șterge' }).click();
  await expect(page.getByRole('button', { name: 'Adaugă o poză' })).toBeVisible({ timeout: 15_000 });
  await page.reload();
  await expect(page.getByAltText(member.name)).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Adaugă o poză' })).toBeVisible();
});

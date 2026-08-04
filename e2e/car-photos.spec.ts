import { type Page, expect, test } from '@playwright/test';

/**
 * Photographs on a car, end to end: picked during registration, stored on
 * the server, and shown by every screen that talks about that car.
 *
 * Two defects are pinned here. Registration used to write its photos under
 * a fixed key that no car page ever read, so a new entry always opened
 * empty; and the roster numbered a car's photo differently from the
 * profile, so a picture on one was invisible on the other.
 */

const PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);

function identity() {
  const stamp = `${Date.now()}.${Math.random().toString(16).slice(2)}`;
  return {
    email: `e2e.photos.${stamp}@example.com`,
    password: `E2e!${stamp}Aa`,
    name: `Fotograf ${stamp.slice(-5)}`,
  };
}

/**
 * The store rehydrates the half-finished registration draft in an effect
 * after mount, and writes it straight back — so anything typed before
 * that lands is overwritten. A person cannot type that fast; Playwright
 * can. Wait for the write that only happens once hydration is done.
 */
async function draftReady(page: Page) {
  await page.waitForFunction(() => window.localStorage.getItem('x-car-show/ui') !== null);
}

test('a car registered with photos opens showing them, everywhere', async ({ page }) => {
  test.skip(process.env.E2E_ALLOW_WRITES !== '1', 'creates a disposable account and entry');
  const member = identity();

  const registration = await page.request.post('/api/auth/sign-up/email', {
    data: { name: member.name, email: member.email, password: member.password },
    headers: { Origin: new URL(process.env.PLAYWRIGHT_BASE_URL!).origin },
  });
  expect(registration.status()).toBe(200);

  // ── Registration, all four steps, with a photograph on the second ──
  await page.goto('/onboard');
  await draftReady(page);
  await page.getByLabel('Mașina').fill('Nissan Silvia S15');
  await page.getByLabel('An').fill('2001');
  await page.getByRole('button', { name: 'Continuă' }).click();
  await page.getByRole('button', { name: 'Continuă' }).click();

  await expect(page.getByRole('heading', { name: 'Pozele.' })).toBeVisible();
  // Registration offers the same six the car page does, not a smaller set
  // you have to discover was smaller.
  await expect(page.locator('input[type="file"]')).toHaveCount(6);
  await page.locator('input[type="file"]').first().setInputFiles({
    name: 'hero.png',
    mimeType: 'image/png',
    buffer: PIXEL_PNG,
  });
  // Held in the page until the car has an id — it must survive the rest
  // of the flow rather than being written somewhere nothing reads.
  await expect(page.getByAltText('Poza principală — 3/4 față')).toBeVisible();

  await page.getByRole('button', { name: 'Arată bine' }).click();
  await page.getByRole('button', { name: 'Gata' }).click();
  await page.getByRole('button', { name: 'Vezi înscrișii' }).click();

  // ── The car page, which is what was broken ──
  await page.waitForURL(/\/car\/[a-z0-9]+$/);
  const carId = new URL(page.url()).pathname.split('/').pop()!;

  const hero = page.locator('img').first();
  await expect(hero).toBeVisible();
  const heroSrc = await hero.getAttribute('src');
  expect(heroSrc).toMatch(new RegExp(`^/api/cars/${carId}/photo/0\\?v=\\d+$`));

  // ── The bytes, served from their own cacheable route ──
  const response = await page.request.get(heroSrc!);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toBe('image/jpeg');
  expect(response.headers()['cache-control']).toContain('immutable');
  expect((await response.body()).subarray(0, 3)).toEqual(Buffer.from([0xff, 0xd8, 0xff]));

  // ── Persistence: a reload is not what was holding the photo up ──
  await page.reload();
  await expect(page.locator(`img[src="${heroSrc}"]`).first()).toBeVisible();

  // ── Coherence: the roster leads with the same picture, not its own ──
  await page.goto('/roster');
  await expect(page.locator(`img[src="${heroSrc}"]`).first()).toBeVisible();

  // ── And the garage row, which used to have a key of its own too ──
  await page.goto('/garage');
  await expect(page.locator(`img[src="${heroSrc}"]`).first()).toBeVisible();
});

test('a car carries six photo slots, and only its owner is offered them', async ({ page }) => {
  test.skip(process.env.E2E_ALLOW_WRITES !== '1', 'creates a disposable account and entry');
  const member = identity();

  const registration = await page.request.post('/api/auth/sign-up/email', {
    data: { name: member.name, email: member.email, password: member.password },
    headers: { Origin: new URL(process.env.PLAYWRIGHT_BASE_URL!).origin },
  });
  expect(registration.status()).toBe(200);

  await page.goto('/onboard');
  await draftReady(page);
  await page.getByLabel('Mașina').fill('Toyota Chaser JZX100');
  await page.getByLabel('An').fill('1998');
  await page.getByRole('button', { name: 'Continuă' }).click();
  await page.getByRole('button', { name: 'Continuă' }).click();
  await page.getByRole('button', { name: 'Arată bine' }).click();
  await page.getByRole('button', { name: 'Gata' }).click();
  await page.getByRole('button', { name: 'Vezi înscrișii' }).click();
  await page.waitForURL(/\/car\/[a-z0-9]+$/);
  const carUrl = page.url();

  // Six wells for the owner — three was the old ceiling.
  await expect(page.getByRole('button', { name: /Adaugă o poză/ })).toHaveCount(6);

  // A visitor is shown the car, never a control the server would refuse.
  await page.context().clearCookies();
  await page.goto(carUrl);
  await expect(page.getByRole('button', { name: /Adaugă o poză/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'ȘTERGE' })).toHaveCount(0);
});

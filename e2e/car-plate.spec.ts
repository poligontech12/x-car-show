import { type Page, expect, test } from '@playwright/test';

/**
 * The registration plate, end to end.
 *
 * It is asked for at registration because it is how a car is found at the
 * gate: a marshal working down /cards to print a windscreen card matches
 * the plate in front of them against the list. That list is behind the
 * gate code now, so what it shows is pinned in gate.spec.ts; the promises
 * here are the ones made to the owner. The plate is stored as typed, since
 * the show draws cars from more than one country and a custom plate
 * matches no pattern at all. It is capitalised by the stylesheet rather
 * than on the way into the database — the app corrects how it looks, not
 * what somebody wrote.
 * And leaving it blank stays a real choice: the car page drops the row
 * rather than standing there holding a dash.
 */

function identity() {
  const stamp = `${Date.now()}.${Math.random().toString(16).slice(2)}`;
  return {
    email: `e2e.plate.${stamp}@example.com`,
    password: `E2e!${stamp}Aa`,
    name: `Numărist ${stamp.slice(-5)}`,
  };
}

/** The registration draft rehydrates after mount and writes itself back. */
async function draftReady(page: Page) {
  await page.waitForFunction(() => window.localStorage.getItem('x-car-show/ui') !== null);
}

/** The spec list is a key div followed by its value div. */
const plateValue = (page: Page) =>
  page.getByText('Înmatriculare', { exact: true }).locator('xpath=following-sibling::div');

test('a plate given at registration reaches the car page and can be taken back', async ({ page }) => {
  test.skip(process.env.E2E_ALLOW_WRITES !== '1', 'creates a disposable account and entry');
  const member = identity();

  const registration = await page.request.post('/api/auth/sign-up/email', {
    data: { name: member.name, email: member.email, password: member.password },
    headers: { Origin: new URL(process.env.PLAYWRIGHT_BASE_URL!).origin },
  });
  expect(registration.status()).toBe(200);

  // ── Step one asks for it, alongside the make and the year ──
  await page.goto('/onboard');
  await draftReady(page);
  await page.getByLabel('Mașina').fill('Dacia 1310');
  await page.getByLabel('An').fill('1988');
  // Typed carelessly, and in no country's format.
  await page.getByLabel('Nr. înmatriculare').fill('  ki  1234   ab ');
  await page.getByRole('button', { name: 'Continuă' }).click();
  await page.getByRole('button', { name: 'Continuă' }).click();
  await page.getByRole('button', { name: 'Arată bine' }).click();
  await page.getByRole('button', { name: 'Gata' }).click();
  await page.getByRole('button', { name: 'Vezi înscrișii' }).click();

  await page.waitForURL(/\/car\/[a-z0-9]+$/);
  const carId = new URL(page.url()).pathname.split('/').pop()!;

  // Runs of spaces collapse; the characters themselves are left alone,
  // lower case and all, because that is what the owner wrote.
  await expect(plateValue(page)).toHaveText('ki 1234 ab');

  // Capitals are the stylesheet's job — the text underneath is untouched.
  await expect(plateValue(page)).toHaveCSS('text-transform', 'uppercase');

  // The same plate on the marshals' print list is checked in gate.spec.ts,
  // which holds the code that page now needs.

  // ── It survives the trip to the database and back ──
  await page.reload();
  await expect(plateValue(page)).toHaveText('ki 1234 ab');
  await page.goto(`/car/${carId}/edit`);
  await expect(page.getByLabel('Nr. înmatriculare')).toHaveValue('ki 1234 ab');

  // ── Changing your mind takes it off a page anyone can open ──
  await page.getByLabel('Nr. înmatriculare').fill('');
  await page.getByRole('button', { name: 'Salvează' }).click();
  await page.waitForURL(`**/car/${carId}`);
  await expect(page.getByText('Înmatriculare', { exact: true })).toHaveCount(0);

  await page.reload();
  await expect(page.getByText('Înmatriculare', { exact: true })).toHaveCount(0);
});

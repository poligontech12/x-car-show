import { type Page, expect, test } from '@playwright/test';

/**
 * Following a car counts once.
 *
 * The profile used to add one for every follow the reader held, on top of
 * a count the database had already counted them in — so backing a car
 * nobody followed took it from none to two, and letting go took it back
 * to one. The optimistic adjustment only belongs there while the server
 * has not answered yet.
 */

function identity() {
  const stamp = `${Date.now()}.${Math.random().toString(16).slice(2)}`;
  return {
    email: `e2e.follow.${stamp}@example.com`,
    password: `E2e!${stamp}Aa`,
    name: `Urmăritor ${stamp.slice(-5)}`,
  };
}

async function draftReady(page: Page) {
  await page.waitForFunction(() => window.localStorage.getItem('x-car-show/ui') !== null);
}

/**
 * Following paints the moment you tap and posts behind it, which is the
 * point of it — but it means a reload issued straight afterwards can beat
 * the write to the database. Wait for the action to answer.
 */
function serverActionSettled(page: Page) {
  return page.waitForResponse(
    (r) => r.request().method() === 'POST' && Boolean(r.request().headers()['next-action']),
  );
}

test('a car with no followers goes to one when you back it, not two', async ({ page }) => {
  test.skip(process.env.E2E_ALLOW_WRITES !== '1', 'creates a disposable account and entry');
  const member = identity();

  const registration = await page.request.post('/api/auth/sign-up/email', {
    data: { name: member.name, email: member.email, password: member.password },
    headers: { Origin: new URL(process.env.PLAYWRIGHT_BASE_URL!).origin },
  });
  expect(registration.status()).toBe(200);

  await page.goto('/onboard');
  await draftReady(page);
  await page.getByLabel('Mașina').fill('Mazda RX-7 FD');
  await page.getByLabel('An').fill('1994');
  await page.getByRole('button', { name: 'Continuă' }).click();
  await page.getByRole('button', { name: 'Continuă' }).click();
  await page.getByRole('button', { name: 'Arată bine' }).click();
  await page.getByRole('button', { name: 'Gata' }).click();
  await page.getByRole('button', { name: 'Vezi înscrișii' }).click();
  await page.waitForURL(/\/car\/[a-z0-9]+$/);

  const count = page.getByText(/urmăritori$/);
  await expect(count).toHaveText('0 urmăritori');

  let posted = serverActionSettled(page);
  await page.getByRole('button', { name: 'Urmărește', exact: true }).click();
  // Straight away, before the server has answered — the optimistic +1.
  await expect(page.getByRole('button', { name: 'Urmărești' })).toBeVisible();
  await expect(count).toHaveText('1 urmăritori');

  // And once it has: the count now counts this reader itself, which is
  // where the optimistic +1 used to be added a second time.
  await posted;
  await expect(count).toHaveText('1 urmăritori');

  await page.reload();
  await expect(page.getByRole('button', { name: 'Urmărești' })).toBeVisible();
  await expect(page.getByText(/urmăritori$/)).toHaveText('1 urmăritori');

  posted = serverActionSettled(page);
  await page.getByRole('button', { name: 'Urmărești' }).click();
  await expect(page.getByRole('button', { name: 'Urmărește', exact: true })).toBeVisible();
  await expect(page.getByText(/urmăritori$/)).toHaveText('0 urmăritori');

  await posted;
  await page.reload();
  await expect(page.getByText(/urmăritori$/)).toHaveText('0 urmăritori');
});

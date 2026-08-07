/**
 * The two things you reach for when something is wrong at the show.
 *
 * `/api/health` answers "app, database, or signal?" from a phone, without
 * a terminal — see SHOWDAY.md. And an address that leads nowhere has to
 * land somewhere a visitor can read, in Romanian, with a way back: before
 * these existed a mistyped link got Next's own English page on a white
 * background, and a database that was unreachable got a blank screen.
 */
import { expect, test } from '@playwright/test';

test('health says whether the database is answering', async ({ request }) => {
  const res = await request.get('/api/health');
  expect(res.status(), 'healthy means 200').toBe(200);

  const body = await res.json();
  expect(body.ok).toBe(true);
  expect(body.database).toBe('up');
  // A count, not just a connection: a database restored empty answers
  // `select 1` perfectly well, and that is the morning-of failure.
  expect(typeof body.cars, 'cars is counted').toBe('number');
  expect(body.cars).toBeGreaterThan(0);
  // Present even when unset, so an old build cannot pass for a fresh one.
  expect(body.commit, 'commit is always reported').toBeTruthy();
  expect(res.headers()['cache-control']).toContain('no-store');
});

test('an address that leads nowhere is still readable', async ({ page }) => {
  const res = await page.goto('/o-adresa-care-nu-exista');
  expect(res?.status(), 'a real 404, not a soft 200').toBe(404);

  await expect(page.getByRole('heading', { name: 'Pagina asta nu există.' })).toBeVisible();
  // The way back matters more than the message.
  await expect(page.getByRole('link', { name: 'Vezi înscrișii' })).toBeVisible();

  await page.getByRole('link', { name: 'Vezi înscrișii' }).click();
  await expect(page).toHaveURL(/\/roster$/);
});

test('a car that was deleted says so in its own words', async ({ page }) => {
  await page.goto('/car/nu-exista-masina-asta');
  await expect(page.getByRole('heading', { name: 'Mașina nu există.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Vezi înscrișii' })).toBeVisible();
});

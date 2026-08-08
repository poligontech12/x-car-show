/**
 * A flow's close button always goes somewhere.
 *
 * Closing means going back to what you were doing, but `history.back()` does
 * nothing when the flow is the first screen of the visit — which is the
 * normal case for a forwarded link, a scanned card, and the reload that
 * signing out performs on purpose. The button used to sit there dead.
 */
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

/**
 * The fallback the close button falls back to: the roster, at the root.
 *
 * Polled, because the click that gets there has not finished when this is
 * called — read once, it catches the flow's own URL and fails.
 */
const landedOnRoster = (page: import('@playwright/test').Page) =>
  expect.poll(() => new URL(page.url()).pathname).toBe('/');

test('closing a flow opened cold lands on the roster', async ({ page }) => {
  // A fresh context: nothing behind this page to go back to.
  await page.goto('/auth');
  await expect(page.getByRole('heading', { name: 'Intră în show.' })).toBeVisible();

  await page.getByRole('button', { name: 'Închide' }).click();
  await landedOnRoster(page);
});

test('closing a flow reached from inside the app goes back', async ({ page }) => {
  // Deliberately not the root: the root is also where the cold-open
  // fallback lands, so starting there would pass whether history.back()
  // did anything or not.
  await page.goto('/spotted');
  await page.waitForTimeout(400);

  // Tapped, not typed — the app moves between screens without reloading,
  // which is what leaves a screen behind for the close button to find.
  await page.getByLabel('Conectare').click();
  await expect(page.getByRole('heading', { name: 'Intră în show.' })).toBeVisible();

  await page.getByRole('button', { name: 'Închide' }).click();
  await expect(page).toHaveURL(/\/spotted$/);
});

test('closing registration opened cold lands on the roster', async ({ page }) => {
  await page.goto('/onboard');
  await page.waitForTimeout(400);

  await page.getByRole('button', { name: 'Închide' }).click();
  await landedOnRoster(page);
});

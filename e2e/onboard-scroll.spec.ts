/**
 * Each step of registration begins at its beginning.
 *
 * All four steps are drawn inside one scrolling box and only the contents
 * are swapped, so without help the distance you had scrolled survives the
 * step change: scroll to the foot of the dials, carry on, and the
 * photographs open with their heading and the top of the main well already
 * above the edge — out of sight and out of reach of a tap.
 *
 * The viewport here is short on purpose. On a tall screen the next step is
 * too short to hold the scroll position, the browser clamps it back to
 * zero, and the bug hides — which is exactly how it reached a phone.
 */
import { expect, test, type Page } from '@playwright/test';

const BODY = '[class*=onboard-module][class*=body]';

async function scrollToBottom(page: Page) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) el.scrollTop = el.scrollHeight;
  }, BODY);
  await page.waitForTimeout(200);
}

/** Where the step's heading sits relative to the top of the scrolling box. */
async function headingOffset(page: Page) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    const heading = el?.querySelector('h1');
    if (!el || !heading) return null;
    return Math.round(heading.getBoundingClientRect().top - el.getBoundingClientRect().top);
  }, BODY);
}

test('a step is not opened part-way down the page', async ({ page }) => {
  test.skip(process.env.E2E_ALLOW_WRITES !== '1', 'creates a disposable account');
  const stamp = `${Date.now()}.${Math.random().toString(16).slice(2)}`;
  await page.emulateMedia({ reducedMotion: 'reduce' });

  await page.goto('/auth?mode=register&role=car');
  await page.getByLabel('Nume').fill('Test Scroll');
  await page.getByLabel('Email').fill(`e2e.scroll.${stamp}@example.com`);
  await page.getByLabel('Parolă').fill(`E2e!${stamp}Aa`);
  await page.getByRole('button', { name: 'Creează contul' }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/auth'), { timeout: 20_000 });

  // A phone with the browser's own chrome taking its share of the height.
  await page.setViewportSize({ width: 390, height: 560 });
  await page.goto('/onboard');
  await page.waitForTimeout(600);

  await page.getByLabel('Mașina').fill('Nissan Silvia S14');

  // Step 1 → 2, having scrolled down first.
  await scrollToBottom(page);
  await page.getByRole('button', { name: 'Continuă' }).click();
  await page.waitForTimeout(400);
  expect(await headingOffset(page), 'the dials step opens at its heading').toBeGreaterThanOrEqual(0);

  // Step 2 → 3. This is the one from the report: the photographs are tall
  // enough to hold a carried-over offset instead of clamping it away.
  await scrollToBottom(page);
  await page.getByRole('button', { name: 'Continuă' }).click();
  await page.waitForTimeout(400);
  expect(await headingOffset(page), 'the photos step opens at its heading').toBeGreaterThanOrEqual(
    0,
  );
  await expect(page.getByRole('heading', { name: 'Pozele.' })).toBeInViewport();

  // Step 3 → 4.
  await scrollToBottom(page);
  await page.getByRole('button', { name: 'Arată bine' }).click();
  await page.waitForTimeout(400);
  expect(await headingOffset(page), 'the description step opens at its heading').toBeGreaterThanOrEqual(
    0,
  );

  // And going back is a step change too.
  await scrollToBottom(page);
  await page.getByRole('button', { name: 'Înapoi' }).click();
  await page.waitForTimeout(400);
  expect(await headingOffset(page), 'going back opens at the heading').toBeGreaterThanOrEqual(0);
});

/**
 * The entrants lead the app, and the deck is dealt fresh for each visitor.
 *
 * A fixed order quietly decides who gets looked at, and on a day with one
 * vote per person that is not a small thing. But the order must hold still
 * while somebody is using it: the roster comes down from the root layout,
 * which re-renders on every vote, every follow and every return to the
 * foreground. Shuffling per render would deal a new hand under a thumb
 * mid-vote, which is why the seed is a cookie and not a random number.
 */
import { expect, test, type Page } from '@playwright/test';

/** The deck's order, read off the photographs it asks for. */
async function deckOrder(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('img'))
      .map((img) => img.getAttribute('src') ?? '')
      .map((src) => src.match(/\/api\/cars\/([a-z0-9]+)\/photo/)?.[1])
      .filter((id): id is string => Boolean(id)),
  );
}

test('the app opens on the entrants, not the feed', async ({ page }) => {
  await page.goto('/');
  // The deck, not the feed's header.
  await expect(page.getByRole('heading', { name: 'Spotted' })).toHaveCount(0);
  await expect(page.locator('[class*=roster-module]').first()).toBeVisible();

  // And the tab that is lit is the one you are on.
  const inscrisi = page.getByRole('link', { name: 'Înscriși' });
  await expect(inscrisi).toHaveAttribute('aria-current', 'page');
});

test('the feed keeps its own address, and the old roster link still works', async ({ page }) => {
  await page.goto('/spotted');
  await expect(page.getByRole('heading', { name: 'Spotted' })).toBeVisible();

  // Shared links and bookmarks predate the move.
  const res = await page.goto('/roster');
  expect(res?.status(), 'redirected, not 404').toBe(200);
  await expect(page).toHaveURL('/');
});

test('the deck holds its order for a visit and is dealt again for the next', async ({
  page,
  context,
}) => {
  await page.goto('/');
  const first = await deckOrder(page);
  expect(first.length, 'need a few cars to have an order at all').toBeGreaterThan(3);

  /**
   * Four reloads is what four votes would do to this page, and the order
   * has to survive all of them. This is the assertion that matters: the
   * shuffle being random is worth nothing if it re-randomises mid-use.
   */
  for (let i = 0; i < 4; i++) {
    await page.reload();
    expect(await deckOrder(page), `order changed on reload ${i + 1}`).toEqual(first);
  }

  // A new visit is a new cookie, and a new cookie is a new deal. Sampled
  // rather than asserted once: two shuffles of a dozen cars coinciding is
  // vanishingly unlikely, but it is not impossible.
  const orders: string[][] = [first];
  for (let visit = 0; visit < 3; visit++) {
    await context.clearCookies();
    await page.goto('/');
    orders.push(await deckOrder(page));
  }
  const distinct = new Set(orders.map((o) => o.join(',')));
  expect(distinct.size, 'every visit dealt the same deck').toBeGreaterThan(1);
});

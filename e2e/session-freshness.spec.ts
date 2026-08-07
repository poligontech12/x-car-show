/**
 * Coming back to the app must not leave it believing something the server
 * no longer agrees with.
 *
 * Whether you are signed in is decided once, by the root layout. Next keeps
 * that layout for the life of the running app and does not render it again
 * as you move between screens, so without something forcing a fresh render
 * the app carries whatever it believed when it was last loaded — which is
 * how a phone that parked the tab and came back showed a garage on one tap
 * and asked for an account on the next.
 */
import { expect, test, type Page } from '@playwright/test';

test.skip(process.env.E2E_ALLOW_WRITES !== '1', 'creates a disposable account');

/** What the garage currently believes about the account. */
async function garageBelief(page: Page): Promise<'in' | 'out'> {
  const text = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' '));
  if (/Ai nevoie de un cont/.test(text)) return 'out';
  return 'in';
}

/** Park the tab the way a phone does when the app goes to the background. */
async function parkAndReturn(page: Page) {
  const setVisibility = (state: string) =>
    page.evaluate((value) => {
      Object.defineProperty(document, 'visibilityState', { value, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    }, state);

  await setVisibility('hidden');
  await page.waitForTimeout(3_500); // longer than the component's parked threshold
  await setVisibility('visible');
  await page.waitForTimeout(1_500);
}

test('a session that ends while the app is parked is noticed on return', async ({
  page,
  context,
}) => {
  const stamp = `${Date.now()}.${Math.random().toString(16).slice(2)}`;
  await page.emulateMedia({ reducedMotion: 'reduce' });

  await page.goto('/auth?mode=register&role=car');
  await page.getByLabel('Nume').fill('Test Sesiune');
  await page.getByLabel('Email').fill(`e2e.session.${stamp}@example.com`);
  await page.getByLabel('Parolă').fill(`E2e!${stamp}Aa`);
  await page.getByRole('button', { name: 'Creează contul' }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/auth'), { timeout: 20_000 });
  await page.waitForTimeout(1_500);

  await page.goto('/garage');
  await page.waitForTimeout(600);
  expect(await garageBelief(page), 'signed in to begin with').toBe('in');

  // The session ends underneath the running app — expired, or signed out
  // somewhere else — exactly as it would while the phone was in a pocket.
  const others = (await context.cookies()).filter(
    (c) => !/session_token|session_data/.test(c.name),
  );
  await context.clearCookies();
  await context.addCookies(others);

  await parkAndReturn(page);

  expect(await garageBelief(page), 'the garage must not still show an account').toBe('out');

  // Going back must not resurrect a page rendered while signed in.
  await page.goto('/garage');
  await page.waitForTimeout(600);
  expect(await garageBelief(page), 'still signed out after navigating again').toBe('out');
});

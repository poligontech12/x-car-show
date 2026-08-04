import { type Page, expect, test } from '@playwright/test';

/**
 * Editing your profile sticks.
 *
 * Town, Instagram and Facebook are written straight to the database while
 * the session is served from a signed cookie for five minutes — so the
 * write landed and the read did not, the field snapped back to what it
 * was, and the whole thing looked like a save that never happened.
 */

function identity() {
  const stamp = `${Date.now()}.${Math.random().toString(16).slice(2)}`;
  return {
    email: `e2e.profile.${stamp}@example.com`,
    password: `E2e!${stamp}Aa`,
    name: `Profil ${stamp.slice(-5)}`,
  };
}

/** The profile writes 700ms after the last keystroke, then re-reads. */
async function saved(page: Page) {
  await page.waitForResponse(
    (r) => r.request().method() === 'POST' && Boolean(r.request().headers()['next-action']),
    { timeout: 10_000 },
  );
}

test('a profile field survives the reload after saving it', async ({ page }) => {
  test.skip(process.env.E2E_ALLOW_WRITES !== '1', 'creates a disposable account');
  const member = identity();

  const registration = await page.request.post('/api/auth/sign-up/email', {
    data: { name: member.name, email: member.email, password: member.password },
    headers: { Origin: new URL(process.env.PLAYWRIGHT_BASE_URL!).origin },
  });
  expect(registration.status()).toBe(200);

  await page.goto('/auth');

  const instagram = page.locator('#acc-ig');
  const town = page.locator('#acc-town');
  await expect(instagram).toBeVisible();

  const written = saved(page);
  await instagram.fill('@andrei.s14');
  await written;

  // Still there once the server has answered and the screen re-read it.
  await expect(instagram).toHaveValue('@andrei.s14');

  // And still there on a fresh load, which is where the cached session
  // used to hand back the profile as it was before the edit.
  await page.reload();
  await expect(page.locator('#acc-ig')).toHaveValue(/andrei\.s14/);

  // The other fields go through exactly the same path.
  const townWritten = saved(page);
  await town.fill('Cajvana');
  await townWritten;
  await page.reload();
  await expect(page.locator('#acc-town')).toHaveValue('Cajvana');
  await expect(page.locator('#acc-ig')).toHaveValue(/andrei\.s14/);
});

import { expect, test } from '@playwright/test';

const PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);

function identity() {
  const stamp = `${Date.now()}.${Math.random().toString(16).slice(2)}`;
  return {
    email: `e2e.spotted.${stamp}@example.com`,
    password: `E2e!${stamp}Aa`,
    name: `Spotter ${stamp.slice(-5)}`,
  };
}

test('roster no longer advertises cars that are not in the app', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/de mașini încă nu sunt în aplicație/i)).toHaveCount(0);
  await expect(page.getByText(/Le adăugăm până pe 8 august/i)).toHaveCount(0);
});

test('a signed-in member can publish a persistent spotted photo', async ({ page }) => {
  test.skip(process.env.E2E_ALLOW_WRITES !== '1', 'creates a disposable account and sighting');
  const member = identity();

  const registration = await page.request.post('/api/auth/sign-up/email', {
    data: { name: member.name, email: member.email, password: member.password },
    headers: { Origin: new URL(process.env.PLAYWRIGHT_BASE_URL!).origin },
  });
  expect(registration.status()).toBe(200);

  await page.goto('/spotted');
  await expect(page.getByRole('heading', { name: 'Spotted' })).toBeVisible();
  await page.getByRole('button', { name: /spotted/i }).click();
  await page.locator('input[type="file"]').setInputFiles({
    name: 'spotted.png',
    mimeType: 'image/png',
    buffer: PIXEL_PNG,
  });
  await expect(page.getByAltText('Previzualizarea fotografiei')).toBeVisible();
  await page.getByLabel('Unde ai văzut-o?').fill('Cajvana centru');
  await page.getByLabel('Ce ți-a atras atenția?').fill('Un test de persistență pentru Spotted.');
  await page.route('**/*', async (route) => {
    if (route.request().method() === 'POST' && route.request().headers()['next-action']) {
      await new Promise((resolve) => setTimeout(resolve, 350));
    }
    await route.continue();
  });
  await page.getByRole('button', { name: 'Publică' }).click();
  await expect(page.getByRole('button', { name: 'Renunță' })).toBeDisabled();
  await expect(page.getByRole('button', { name: /SPOTTED/ })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Se publică…' })).toBeDisabled();

  const post = page.getByRole('article').filter({ hasText: member.name }).first();
  await expect(post).toContainText('Cajvana centru');
  await expect(post).toContainText('Un test de persistență pentru Spotted.');
  const image = post.locator('img');
  await expect(image).toBeVisible();
  const imageUrl = await image.getAttribute('src');
  expect(imageUrl).toMatch(/^\/api\/spotted\/.+\/image$/);
  const response = await page.request.get(imageUrl!);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toBe('image/jpeg');
  expect(response.headers()['cache-control']).toContain('immutable');
  expect((await response.body()).subarray(0, 3)).toEqual(Buffer.from([0xff, 0xd8, 0xff]));

  await page.reload();
  await expect(page.getByRole('article').filter({ hasText: member.name }).first()).toContainText(
    'Un test de persistență pentru Spotted.',
  );
});

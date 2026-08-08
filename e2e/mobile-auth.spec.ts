import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

function testIdentity() {
  const stamp = `${Date.now()}.${Math.random().toString(16).slice(2)}`;
  return {
    email: `e2e.mobile.${stamp}@example.com`,
    password: `E2e!${stamp}Aa`,
  };
}

test('registration validation clears when the user corrects the field', async ({ page }) => {
  await page.goto('/auth');

  await page.getByRole('button', { name: 'Creează contul' }).click();
  const validation = page.locator('p[role="alert"]');
  await expect(validation).toHaveText('Scrie-ți e-mailul.');

  await page.getByLabel('Email').fill('e2e.mobile@example.com');
  await expect(validation).toBeHidden();
});

test('sign-out remains stable on mobile Safari', async ({ page, browserName }) => {
  test.skip(browserName !== 'webkit');
  test.skip(process.env.E2E_ALLOW_WRITES !== '1', 'creates a disposable account');
  const { email, password } = testIdentity();
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(String(error)));

  await page.goto('/auth');
  await page.getByLabel('Nume').fill('Test Mobil Safari');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Parolă').fill(password);
  await page.getByRole('button', { name: 'Creează contul' }).click();
  // Registering without having asked to enter a car lands on the roster,
  // which is the root — a '**/roster' glob would wait forever.
  await page.waitForURL((url) => url.pathname === '/');

  await page.getByLabel('Contul meu').click();
  await page.waitForURL('**/auth');

  let slowChunks = false;
  const documentNavigations: string[] = [];
  const clientNavigations: Array<{ method: string; url: string }> = [];
  await page.exposeFunction(
    'recordClientNavigation',
    (method: string, url: string) => clientNavigations.push({ method, url }),
  );
  await page.evaluate(() => {
    for (const method of ['pushState', 'replaceState'] as const) {
      const original = history[method];
      history[method] = ((data: unknown, unused: string, url?: string | URL | null) => {
        void window.recordClientNavigation(method, String(url ?? location.href));
        return original.call(history, data, unused, url);
      }) as History[typeof method];
    }
  });
  page.on('request', (request) => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) {
      documentNavigations.push(request.url());
    }
  });
  await page.route('**/_next/static/chunks/**', async (route) => {
    if (slowChunks) await new Promise((resolve) => setTimeout(resolve, 250));
    await route.continue();
  });
  slowChunks = true;

  await page.getByRole('button', { name: 'Deconectare' }).click();
  await page.waitForURL((url) => url.pathname === '/');
  await page.waitForTimeout(1_000);

  await expect(page.getByText('This page couldn’t load')).toHaveCount(0);
  expect(pageErrors.filter((error) => error.includes('ChunkLoadError'))).toEqual([]);
  expect(clientNavigations.filter(({ url }) => new URL(url, page.url()).pathname === '/')).toEqual(
    [],
  );
  expect(documentNavigations.filter((url) => new URL(url).pathname === '/')).toHaveLength(1);
});

declare global {
  interface Window {
    recordClientNavigation(method: string, url: string): Promise<void>;
  }
}

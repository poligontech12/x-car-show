import { type Page, expect, test } from '@playwright/test';

/**
 * The gate: one press per entry that gives a car its number, marks the
 * card printed, and puts the car in the award.
 *
 * The rules worth pinning are the ones that would be expensive to get
 * wrong in a field. The page writes, so it must not be reachable without
 * the code. Two cars must never wear the same number. And a car reaches
 * or leaves the award exactly as it is checked in or undone.
 *
 * The matching server-side rule — toggleVote refusing a car that never
 * arrived — is not reachable from here, because the board stops drawing
 * the row that would cast the vote. It is a guard against a replayed
 * ballot rather than against this UI, and is asserted in lib/actions.ts.
 */

const PIN = process.env.GATE_PIN ?? '';

function identity() {
  const stamp = `${Date.now()}.${Math.random().toString(16).slice(2)}`;
  return {
    email: `e2e.gate.${stamp}@example.com`,
    password: `E2e!${stamp}Aa`,
    name: `Comisar ${stamp.slice(-5)}`,
  };
}

async function draftReady(page: Page) {
  await page.waitForFunction(() => window.localStorage.getItem('x-car-show/ui') !== null);
}

/**
 * Registers an account and one car. The owner's name is returned with the
 * id because it is the only thing on screen unique to this run — several
 * of these specs have registered a Dacia 1310 into the same database.
 */
async function registerCar(
  page: Page,
  model: string,
  plate: string,
): Promise<{ id: string; owner: string }> {
  const member = identity();
  const registration = await page.request.post('/api/auth/sign-up/email', {
    data: { name: member.name, email: member.email, password: member.password },
    headers: { Origin: new URL(process.env.PLAYWRIGHT_BASE_URL!).origin },
  });
  expect(registration.status()).toBe(200);

  await page.goto('/onboard');
  await draftReady(page);
  await page.getByLabel('Mașina').fill(model);
  await page.getByLabel('An').fill('1998');
  await page.getByLabel('Nr. înmatriculare').fill(plate);
  await page.getByRole('button', { name: 'Continuă' }).click();
  await page.getByRole('button', { name: 'Continuă' }).click();
  await page.getByRole('button', { name: 'Arată bine' }).click();
  await page.getByRole('button', { name: 'Gata' }).click();
  await page.getByRole('button', { name: 'Vezi înscrișii' }).click();
  await page.waitForURL(/\/car\/[a-z0-9]+$/);
  return { id: new URL(page.url()).pathname.split('/').pop()!, owner: member.name };
}

/** CSS module class names are hashed, so rows carry their car id. */
const row = (page: Page, carId: string) => page.locator(`[data-car="${carId}"]`);

async function openGate(page: Page) {
  await page.goto('/cards');
  await page.getByLabel('Cod de poartă').fill(PIN);
  await page.getByRole('button', { name: 'INTRĂ' }).click();
  await expect(page.getByRole('link', { name: '← APLICAȚIA' })).toBeVisible();
}

test.describe('the gate', () => {
  test.skip(process.env.E2E_ALLOW_WRITES !== '1', 'creates disposable accounts and entries');
  test.skip(!PIN, 'needs GATE_PIN set to the same value the server was started with');

  test('the print list will not open without the code', async ({ page }) => {
    await page.goto('/cards');

    // No list, no buttons — not merely a hidden control on a visible page.
    await expect(page.getByLabel('Cod de poartă')).toBeVisible();
    await expect(page.locator('[data-car]')).toHaveCount(0);

    await page.getByLabel('Cod de poartă').fill(`${PIN}-gresit`);
    await page.getByRole('button', { name: 'INTRĂ' }).click();
    await expect(page.getByText('Cod greșit.')).toBeVisible();
    await expect(page.locator('[data-car]')).toHaveCount(0);

    // Getting it right clears the record, so the wrong answer above is
    // not held against a marshal who simply mistyped.
    await page.getByLabel('Cod de poartă').fill(PIN);
    await page.getByRole('button', { name: 'INTRĂ' }).click();
    await expect(page.getByRole('link', { name: '← APLICAȚIA' })).toBeVisible();
  });

  test('one press numbers a car, prints its card and puts it in the award', async ({ page }) => {
    const plate = `gate ${Date.now() % 100000}`;
    const { id: carId, owner } = await registerCar(page, 'Dacia 1310', plate);
    const no = String(700 + (Date.now() % 99));

    // Before the gate: not on the board at all.
    await page.goto('/award');
    await expect(page.getByText(owner)).toHaveCount(0);

    await openGate(page);
    const entry = row(page, carId);
    // The plate the owner gave at registration is what a marshal reads
    // off the car in front of them to find this row.
    await expect(entry).toContainText(plate);
    await expect(entry).toContainText('Dacia 1310');
    await expect(entry.getByRole('button', { name: 'TIPĂRIT' })).toBeVisible();
    await entry.getByLabel('Număr de concurs').fill(no);
    await entry.getByRole('button', { name: 'TIPĂRIT' }).click();

    // The row now reads as done, and carries the number.
    await expect(entry.getByRole('button', { name: 'TIPĂRIT ✓' })).toBeVisible();
    await expect(entry.getByLabel('Număr de concurs')).toHaveValue(no);

    // The number reached the car itself, and the award now lists it.
    await page.goto('/award');
    await expect(page.getByText(`Nr. ${no} · ${owner}`)).toBeVisible();
  });

  test('a number already worn is refused, and says who has it', async ({ page }) => {
    const { id: first } = await registerCar(page, 'Toyota Supra MK4', `dup a ${Date.now() % 100000}`);
    const { id: second } = await registerCar(page, 'Honda Civic EK4', `dup b ${Date.now() % 100000}`);
    const no = String(800 + (Date.now() % 99));

    await openGate(page);
    const firstRow = row(page, first);
    await firstRow.getByLabel('Număr de concurs').fill(no);
    await firstRow.getByRole('button', { name: 'TIPĂRIT' }).click();
    await expect(firstRow.getByRole('button', { name: 'TIPĂRIT ✓' })).toBeVisible();

    const secondRow = row(page, second);
    await secondRow.getByLabel('Număr de concurs').fill(no);
    await secondRow.getByRole('button', { name: 'TIPĂRIT' }).click();

    await expect(secondRow).toContainText(`Numărul ${no} e deja la`);
    await expect(secondRow).toContainText('Toyota Supra MK4');
    // Refused means refused: the second car did not quietly check in.
    await expect(secondRow.getByRole('button', { name: 'TIPĂRIT', exact: true })).toBeVisible();
  });

  test('undoing a check-in hands the number back', async ({ page }) => {
    const { id: carId, owner } = await registerCar(page, 'ARO 244', `undo ${Date.now() % 100000}`);
    const no = String(900 + (Date.now() % 99));

    await openGate(page);
    const entry = row(page, carId);
    await entry.getByLabel('Număr de concurs').fill(no);
    await entry.getByRole('button', { name: 'TIPĂRIT' }).click();
    await expect(entry.getByRole('button', { name: 'TIPĂRIT ✓' })).toBeVisible();

    await entry.getByRole('button', { name: 'ANULEAZĂ' }).click();
    await expect(entry.getByRole('button', { name: 'TIPĂRIT', exact: true })).toBeVisible();
    await expect(entry.getByLabel('Număr de concurs')).toHaveValue('');

    // And the car has left the award again.
    await page.goto('/award');
    await expect(page.getByText(owner)).toHaveCount(0);
  });
});

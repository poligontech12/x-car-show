/**
 * A session that has been revoked stops working at once.
 *
 * Better Auth can keep a signed copy of the session in a second cookie and
 * answer from that without asking the database. While it did, a session
 * deleted server-side — signed out on another phone, revoked by hand —
 * went on working for the life of that copy, and not only for reading:
 * a profile edit made with a deleted session was written to the database.
 * On a show that promises one vote per person, revocation has to bite
 * immediately, so the cache is off and this holds it off.
 */
import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';

const psql = (sql: string) =>
  execFileSync('psql', ['-d', 'xcarshow', '-t', '-A', '-c', sql], { encoding: 'utf8' }).trim();

test('a session deleted server-side can no longer read or write', async ({ page, context }) => {
  test.skip(process.env.E2E_ALLOW_WRITES !== '1', 'creates a disposable account');
  const stamp = `${Date.now()}.${Math.random().toString(16).slice(2)}`;
  const email = `e2e.revoke.${stamp}@example.com`;
  await page.emulateMedia({ reducedMotion: 'reduce' });

  await page.goto('/auth?mode=register&role=car');
  await page.getByLabel('Nume').fill('Test Revocare');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Parolă').fill(`E2e!${stamp}Aa`);
  await page.getByRole('button', { name: 'Creează contul' }).click();
  await page.waitForURL((u) => !u.pathname.startsWith('/auth'), { timeout: 20_000 });
  await page.waitForTimeout(1_000);

  try {
    const token = (await context.cookies())
      .find((c) => c.name.endsWith('session_token'))!
      .value.split('.')[0];
    expect(psql(`select count(*) from sessions where token='${token}'`), 'signed in').toBe('1');

    // Revoked underneath the running app.
    psql(`delete from sessions where token = '${token}'`);

    // Reading: the garage must ask for an account again.
    await page.goto('/garage');
    await page.waitForTimeout(600);
    const text = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' '));
    expect(text, 'the garage must not still show an account').toMatch(/Ai nevoie de un cont/);

    // Writing: a profile edit must not reach the database.
    const before = psql(`select coalesce(town,'') from users where email='${email}'`);
    await page.goto('/auth');
    await page.waitForTimeout(600);
    const town = page.locator('#acc-town');
    if (await town.count()) {
      await town.fill('OrasNepermis');
      await page.waitForTimeout(2_500);
    }
    expect(
      psql(`select coalesce(town,'') from users where email='${email}'`),
      'a revoked session must not be able to write',
    ).toBe(before);
  } finally {
    psql(`delete from users where email = '${email}'`);
  }
});

/**
 * Nothing may stick out past the side of the phone.
 *
 * The frame clips horizontal overflow, so a button that grows too wide is
 * not scrolled to — it is quietly cut off at the edge, which is how this
 * went unnoticed. The check is therefore on geometry rather than on
 * anything visible: every box inside the frame has to end inside it.
 *
 * Widths run down to 320px (the narrowest phone still in use) and the
 * text is scaled up to 200%, which is what a reader with large type set
 * on their phone gets.
 */
import { expect, test, type Page } from '@playwright/test';

const WIDTHS = [412, 390, 375, 360, 320];
const TEXT_SCALES = [100, 200];

async function spills(page: Page) {
  return page.evaluate(() => {
    const frame = document.querySelector('[class*=AppShell-module][class*=frame]');
    if (!frame) return [];
    const edge = frame.getBoundingClientRect().right;
    const out: string[] = [];
    frame.querySelectorAll('*').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) return;
      if (r.right > edge + 0.5) {
        out.push(
          `${el.tagName.toLowerCase()}.${String((el as HTMLElement).className || '').slice(0, 40)}` +
            ` "${(el.textContent || '').trim().slice(0, 30)}" +${Math.round(r.right - edge)}px`,
        );
      }
    });
    return out;
  });
}

test.describe('the phone frame contains its contents', () => {
  test.skip(process.env.E2E_ALLOW_WRITES !== '1', 'creates a disposable account');

  test('registration and garage stay inside the screen', async ({ page }) => {
    const stamp = `${Date.now()}.${Math.random().toString(16).slice(2)}`;
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.goto('/auth?mode=register&role=car');
    await page.getByLabel('Nume').fill('Test Overflow');
    await page.getByLabel('Email').fill(`e2e.overflow.${stamp}@example.com`);
    await page.getByLabel('Parolă').fill(`E2e!${stamp}Aa`);
    await page.getByRole('button', { name: 'Creează contul' }).click();
    await page.waitForURL((url) => !url.pathname.startsWith('/auth'), { timeout: 20_000 });

    // One car, so the garage renders its list and the "add another" button.
    await page.goto('/onboard');
    await page.getByLabel('Mașina').fill('Nissan Silvia S14');
    await page.getByLabel('An').fill('1998');
    await page.getByRole('button', { name: 'Continuă' }).click();
    await page.getByRole('button', { name: 'Continuă' }).click();
    await page.getByRole('button', { name: 'Arată bine' }).click();
    await page.getByRole('button', { name: 'Gata' }).click();
    await page.waitForTimeout(1_500);

    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 780 });
      for (const scale of TEXT_SCALES) {
        for (const path of ['/garage', '/onboard']) {
          await page.goto(path);
          await page.addStyleTag({
            content: `html{-webkit-text-size-adjust:${scale}%;text-size-adjust:${scale}%}`,
          });
          await page.waitForTimeout(250);
          expect(await spills(page), `${path} at ${width}px, text ${scale}%`).toEqual([]);
        }

        // Step two of registration puts a second button beside the first —
        // the pair that has to share one line without either running off.
        await page.goto('/onboard');
        await page.addStyleTag({
          content: `html{-webkit-text-size-adjust:${scale}%;text-size-adjust:${scale}%}`,
        });
        await page.getByLabel('Mașina').fill('Nissan Silvia S14');
        await page.getByRole('button', { name: 'Continuă' }).click();
        await page.waitForTimeout(250);
        await expect(page.getByRole('button', { name: 'Înapoi' })).toBeVisible();
        expect(await spills(page), `onboard step 2 at ${width}px, text ${scale}%`).toEqual([]);
      }
    }
  });
});

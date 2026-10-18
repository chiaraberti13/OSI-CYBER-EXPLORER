import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * UX-28 — the manual's new cards are theme-coherent and AA in dark mode.
 *
 * Dark styling ships opt-in via `data-theme="dark"` on the document root (the app
 * stays light by default). This run forces the attribute, confirms the dark design
 * tokens are actually applied to the manual region and its colored tiles, and checks
 * that every tile keeps WCAG AA colour contrast.
 */
test.describe('manual dark theme (UX-28)', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('applies the dark tokens to the manual cards with AA contrast', async ({ page }) => {
    await page.goto('/#/manual/osi-model');
    await expect(page.getByRole('heading', { level: 1, name: 'Manuale di studio' })).toBeVisible();

    // Opt into the dark theme (attribute-driven; the app ships light by default).
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));

    // Wait for the view's entrance animation (motion opacity 0 -> 1) to settle, so the
    // contrast scan sees the opaque dark surfaces rather than a half-faded blend.
    await expect
      .poll(() =>
        page.locator('[data-manual-root]').evaluate((el) => getComputedStyle(el.parentElement as Element).opacity)
      )
      .toBe('1');

    // The dark design tokens are applied to the manual region and the indigo tile.
    const rootBg = await page.locator('[data-manual-root]').evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(rootBg).toBe('rgb(11, 17, 32)'); // --color-dark-canvas

    const objectivesBg = await page
      .locator('[data-manual-tile="objectives"]')
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(objectivesBg).toBe('rgb(30, 27, 75)'); // --color-dark-tile-objectives-bg

    // No colour-contrast violations anywhere in the dark manual.
    const axe = await new AxeBuilder({ page }).include('[data-manual-root]').withRules(['color-contrast']).analyze();
    expect(axe.violations).toEqual([]);
  });

  test('leaves the manual light by default', async ({ page }) => {
    await page.goto('/#/manual');
    await expect(page.getByRole('heading', { level: 1, name: 'Manuale di studio' })).toBeVisible();
    const rootBg = await page.locator('[data-manual-root]').evaluate((el) => getComputedStyle(el).backgroundColor);
    // Transparent/light: the dark canvas token must not leak into the default theme.
    expect(rootBg).not.toBe('rgb(11, 17, 32)');
  });
});

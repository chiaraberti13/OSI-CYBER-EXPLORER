import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * VIS-10 — a coherent, non-textual sign for each chapter's certification route (CCNA,
 * eJPT, extension) in the chapter tree and the chapter header. The icon shape carries
 * the distinction (not colour alone); the route name stays available as text.
 */
test.describe('certification-route marks (VIS-10)', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('distinguishes CCNA, eJPT and extension chapters in the tree and header', async ({ page }) => {
    await page.goto('/#/manual');
    const nav = page.getByRole('navigation', { name: 'Capitoli del manuale' });

    // All three routes are marked in the tree…
    await expect(nav.locator('[data-track="ccna"]').first()).toBeVisible();
    await expect(nav.locator('[data-track="ejpt"]').first()).toBeVisible();
    await expect(nav.locator('[data-track="extension"]').first()).toBeVisible();

    // …and eJPT rows sit inside the extension domain group yet stay distinctly marked,
    // so eJPT is no longer visually merged with the Security+ extension.
    const extensionGroup = nav.getByRole('group', { name: 'Estensione' });
    await expect(extensionGroup.locator('[data-track="ejpt"]').first()).toBeVisible();
    await expect(extensionGroup.locator('[data-track="extension"]').first()).toBeVisible();

    // Opening an eJPT chapter shows the eJPT route chip in the header, not the generic one.
    await page.goto('/#/manual/pentest-methodology');
    await expect(page.getByText('eJPT', { exact: true }).first()).toBeVisible();
  });

  test('keeps the eJPT route chip AA-contrast in the dark manual', async ({ page }) => {
    await page.goto('/#/manual/pentest-methodology');
    await expect(page.getByRole('heading', { level: 2, name: /Metodologia di penetration testing/ })).toBeVisible();

    // Opt into the dark theme (attribute-driven; the app ships light by default).
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await page.getByRole('button', { name: 'Chiudi le istruzioni' }).click();

    // Wait for the entrance animation (opacity 0 -> 1) to settle, so the contrast scan
    // reads the opaque dark surfaces rather than a half-faded blend.
    await expect
      .poll(() =>
        page.locator('[data-manual-root]').evaluate((el) => getComputedStyle(el.parentElement as Element).opacity)
      )
      .toBe('1');

    // The rose eJPT chip is only present on an eJPT chapter; scan the dark manual for
    // any colour-contrast violation introduced by the new route accent.
    const axe = await new AxeBuilder({ page }).include('[data-manual-root]').withRules(['color-contrast']).analyze();
    expect(axe.violations).toEqual([]);
  });
});

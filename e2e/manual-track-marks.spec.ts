import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * VIS-10 — a coherent, non-textual sign for each of the two study routes (Percorso CCNA,
 * eJPT) on the route group headers and the chapter header. The icon shape carries the
 * distinction (not colour alone); the route name stays available as text.
 */
test.describe('certification-route marks (VIS-10, two-route IA)', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('marks each route group in the tree and the eJPT chapter header', async ({ page }) => {
    await page.goto('/#/manual');
    const nav = page.getByRole('navigation', { name: 'Capitoli del manuale' });

    // Each route group header carries its route icon…
    await expect(nav.getByRole('group', { name: 'Percorso CCNA' }).locator('[data-track="ccna"]')).toBeVisible();
    await expect(nav.getByRole('group', { name: 'eJPT' }).locator('[data-track="ejpt"]')).toBeVisible();
    // …and there is no third "Estensione" group any more.
    await expect(nav.getByRole('group', { name: 'Estensione' })).toHaveCount(0);

    // Opening an eJPT chapter shows the eJPT route chip in the header.
    await page.goto('/#/manual/pentest-methodology');
    await expect(page.getByText('eJPT', { exact: true }).first()).toBeVisible();
  });

  test('keeps the eJPT route chip AA-contrast in the dark manual', async ({ page }) => {
    await page.goto('/#/manual/pentest-methodology');
    await expect(page.getByRole('heading', { level: 2, name: /Metodologia di penetration testing/ })).toBeVisible();

    // Opt into the dark theme (attribute-driven; the app ships light by default).
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));

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

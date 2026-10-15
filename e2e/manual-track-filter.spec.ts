import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * UX-32 — the manual's chapter index can be filtered by certification route (CCNA /
 * eJPT / extension). The filter is view state: it narrows the tree without navigating,
 * so routing, deep links and the open chapter are preserved, and it stays WCAG 2.2 AA.
 */
test.describe('certification-route filter (UX-32)', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('narrows the tree to a route and leaves routing untouched', async ({ page }) => {
    await page.goto('/#/manual');
    const nav = page.getByRole('navigation', { name: 'Capitoli del manuale' });
    // The filter sits above the chapter tree (outside the nav). The desktop instance is
    // first in the DOM and visible at this width; the mobile one is lg:hidden.
    const filter = page.getByRole('group', { name: 'Filtra per percorso' }).first();
    await expect(filter).toBeVisible();

    // Every route is present before filtering.
    await expect(nav.locator('[data-track="ccna"]').first()).toBeVisible();
    await expect(nav.locator('[data-track="ejpt"]').first()).toBeVisible();

    // Filter to eJPT: only eJPT rows remain, the CCNA domain groups drop out.
    await filter.getByRole('button', { name: 'eJPT' }).click();
    await expect(filter.getByRole('button', { name: 'eJPT' })).toHaveAttribute('aria-pressed', 'true');
    await expect(nav.locator('[data-track="ejpt"]').first()).toBeVisible();
    await expect(nav.locator('[data-track="ccna"]')).toHaveCount(0);
    await expect(nav.locator('[data-track="extension"]')).toHaveCount(0);
    await expect(nav.getByRole('group', { name: 'CCNA 1.0 · Fondamenti di rete' })).toHaveCount(0);

    // Filtering did not navigate: still the bare manual route.
    await expect(page).toHaveURL(/#\/manual$/);

    // No WCAG 2.2 AA violation in the filtered state.
    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .include('[data-manual-root]')
      .analyze();
    expect(axe.violations).toEqual([]);
  });

  test('preserves a deep-linked chapter while its route is filtered out', async ({ page }) => {
    await page.goto('/#/manual/osi-model');
    await expect(page.getByRole('heading', { level: 2, name: /Il modello OSI/ })).toBeVisible();

    // Filter to eJPT: the open CCNA chapter stays rendered and the URL is unchanged.
    await page
      .getByRole('group', { name: 'Filtra per percorso' })
      .first()
      .getByRole('button', { name: 'eJPT' })
      .click();
    await expect(page).toHaveURL(/#\/manual\/osi-model$/);
    await expect(page.getByRole('heading', { level: 2, name: /Il modello OSI/ })).toBeVisible();
  });
});

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * UX-32 — the manual's chapter index can be filtered by study route (Percorso CCNA /
 * eJPT). The filter is view state: it narrows the tree without navigating, so routing,
 * deep links and the open chapter are preserved, and it stays WCAG 2.2 AA.
 */
test.describe('certification-route filter (UX-32, two-route IA)', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('narrows the tree to a route and leaves routing untouched', async ({ page }) => {
    await page.goto('/#/manual');
    const nav = page.getByRole('navigation', { name: 'Capitoli del manuale' });
    // The filter sits above the chapter tree (outside the nav). The desktop instance is
    // first in the DOM and visible at this width; the mobile one is lg:hidden.
    const filter = page.getByRole('group', { name: 'Filtra per percorso' }).first();
    await expect(filter).toBeVisible();

    // Both route groups are present before filtering.
    await expect(nav.getByRole('group', { name: 'Percorso CCNA' })).toBeVisible();
    await expect(nav.getByRole('group', { name: 'eJPT' })).toBeVisible();

    // Filter to eJPT: only the eJPT route group remains.
    await filter.getByRole('button', { name: 'eJPT' }).click();
    await expect(filter.getByRole('button', { name: 'eJPT' })).toHaveAttribute('aria-pressed', 'true');
    await expect(nav.getByRole('group', { name: 'eJPT' })).toBeVisible();
    await expect(nav.getByRole('group', { name: 'Percorso CCNA' })).toHaveCount(0);

    // Filtering did not navigate: still the bare manual route.
    await expect(page).toHaveURL(/#\/manual$/);

    // No WCAG 2.2 AA violation in the filtered state.
    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .include('[data-manual-root]')
      .analyze();
    expect(axe.violations).toEqual([]);
  });

  test('filters the card index by route without navigating away from the manual root (UX-32)', async ({ page }) => {
    // IA-13 — the filter lives on the card index; it is view state, so narrowing the shown
    // route never changes the route and keeps the URL on the manual root.
    await page.goto('/#/manual');
    const nav = page.getByRole('navigation', { name: 'Capitoli del manuale' });
    await expect(nav.getByRole('group')).toHaveCount(2);

    await page.getByRole('group', { name: 'Filtra per percorso' }).getByRole('button', { name: 'eJPT' }).click();
    await expect(nav.getByRole('group')).toHaveCount(1);
    await expect(nav.getByRole('group', { name: 'eJPT' })).toBeVisible();
    await expect(nav.getByRole('group', { name: 'Percorso CCNA' })).toHaveCount(0);
    await expect(page).toHaveURL(/#\/manual$/);
  });
});

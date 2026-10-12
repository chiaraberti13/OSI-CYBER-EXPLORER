import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/**
 * UX-25 — mobile refinement of the study manual.
 *
 * On a narrow viewport the per-domain chapter navigation collapses into a single
 * compact selector so it no longer takes over the screen, while the index (chapter
 * contents) and the Previous/Next flow stay reachable. Everything must fit at
 * 320 CSS px with no horizontal page overflow and 44 px touch targets.
 */
test.describe('manual mobile navigation (UX-25)', () => {
  test.use({ viewport: { width: 320, height: 800 } });

  test('collapses the chapter navigation into a compact selector without overflow', async ({ page }) => {
    await page.goto('/#/manual');

    const chapterNav = page.getByRole('navigation', { name: 'Capitoli del manuale' });
    const selector = chapterNav.getByRole('combobox', { name: 'Vai a un capitolo' });
    await expect(selector).toBeVisible();

    // The wide-viewport chip buttons are hidden on mobile, so the navigation stays compact.
    await expect(chapterNav.getByRole('button')).toHaveCount(0);

    // Compactness: the whole chapter navigation stays well under half the viewport height.
    const navBox = await chapterNav.boundingBox();
    expect(navBox).not.toBeNull();
    expect(navBox!.height).toBeLessThan(400);

    // The selector itself is a comfortable 44 px touch target. Round to two
    // decimals first to absorb sub-pixel layout rounding, as the UX-24 suite does.
    const selectorBox = await selector.boundingBox();
    expect(selectorBox).not.toBeNull();
    expect(Math.round(selectorBox!.height * 100) / 100).toBeGreaterThanOrEqual(44);

    // No horizontal page scroll at 320 px.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('keeps the index and Previous/Next flow reachable from the selector', async ({ page }) => {
    await page.goto('/#/manual');

    const selector = page
      .getByRole('navigation', { name: 'Capitoli del manuale' })
      .getByRole('combobox', { name: 'Vai a un capitolo' });

    // The chapter index (contents) remains available on mobile.
    const contents = page.getByRole('navigation', { name: 'Contenuti del capitolo' });
    await expect(contents).toBeVisible();

    // Choosing a chapter from the selector navigates and moves focus to the new title.
    await selector.selectOption('ip-routing-ospf');
    const title = page.getByRole('heading', { level: 2, name: /OSPF/ });
    await expect(title).toBeFocused();
    await expect(selector).toHaveValue('ip-routing-ospf');

    // Previous/Next chapter controls stay usable and meet the 44 px target.
    const stepNav = page.getByRole('navigation', { name: 'Capitolo precedente e successivo' });
    const nextButton = stepNav.getByRole('button', { name: /Capitolo successivo/ });
    const nextBox = await nextButton.boundingBox();
    expect(nextBox).not.toBeNull();
    expect(Math.round(nextBox!.height * 100) / 100).toBeGreaterThanOrEqual(44);
    await nextButton.click();
    await expect(page.getByRole('heading', { level: 2, name: /Servizi IP/ })).toBeFocused();

    const axe = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(axe.violations).toEqual([]);
  });
});

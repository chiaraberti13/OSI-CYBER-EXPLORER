import { expect, test } from '@playwright/test';

/**
 * UX-26 — the guided exercise is the primary practical action in every topic.
 *
 * Across all chapters, each guided-lab tile must surface a clearly primary call to
 * action («Fai l'esercizio guidato»), visually distinct from the lighter
 * «Studia nel laboratorio» free-exploration link.
 */
test.describe('manual guided exercise emphasis (UX-26)', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('surfaces a primary guided-exercise action on every guided lab', async ({ page }) => {
    await page.goto('/#/manual');
    // The manual view is a lazy chunk; wait for it before counting controls.
    const chapterNav = page.getByRole('navigation', { name: 'Capitoli del manuale' });
    await expect(chapterNav).toBeVisible();

    // IA-12 — the CCNA index is organised into collapsible domain sections. Expand every
    // one so all chapter links are reachable, then iterate the chapter links only (not the
    // section toggles).
    const sectionToggles = chapterNav.locator('[data-testid="manual-chapter-section"]');
    const sectionCount = await sectionToggles.count();
    for (let s = 0; s < sectionCount; s++) {
      const toggle = sectionToggles.nth(s);
      if ((await toggle.getAttribute('aria-expanded')) === 'false') await toggle.click();
    }

    const chapterButtons = chapterNav.locator('[data-testid="manual-chapter-link"]');
    const chapterCount = await chapterButtons.count();
    expect(chapterCount).toBeGreaterThan(1);

    let totalGuidedLabs = 0;

    for (let i = 0; i < chapterCount; i++) {
      await chapterButtons.nth(i).click();
      await expect(chapterButtons.nth(i)).toHaveAttribute('aria-current', 'page');

      const tiles = page.locator('[data-manual-tile="guided-lab"]');
      const tileCount = await tiles.count();

      for (let t = 0; t < tileCount; t++) {
        const tile = tiles.nth(t);
        const primary = tile.locator('[data-manual-action="guided-exercise"]');
        await expect(primary).toHaveCount(1);
        await expect(primary).toBeVisible();
        await expect(primary).toContainText('Fai l’esercizio guidato');

        // Primary styling: a solid accent surface — neither transparent nor white.
        const background = await primary.evaluate((el) => getComputedStyle(el).backgroundColor);
        expect(background).not.toBe('rgba(0, 0, 0, 0)');
        expect(background).not.toBe('transparent');
        expect(background).not.toBe('rgb(255, 255, 255)');
        // The class contract pins it to the accent token.
        await expect(primary).toHaveClass(/bg-indigo-600/);
      }

      totalGuidedLabs += tileCount;
    }

    // The manual advertises its guided labs in the header; every one is covered above.
    expect(totalGuidedLabs).toBeGreaterThan(0);
  });

  test('keeps "study in the lab" a clearly secondary action', async ({ page }) => {
    await page.goto('/#/manual');
    await expect(page.getByRole('heading', { level: 1, name: 'Manuale di studio' })).toBeVisible();

    // The OSI chapter offers both a guided exercise and free lab exploration.
    const studyLink = page.locator('[data-manual-action="study-lab"]').first();
    if ((await studyLink.count()) > 0) {
      const primaryBg = await page
        .locator('[data-manual-action="guided-exercise"]')
        .first()
        .evaluate((el) => getComputedStyle(el).backgroundColor);
      const studyBg = await studyLink.evaluate((el) => getComputedStyle(el).backgroundColor);
      // The secondary action uses a different, lighter surface than the primary.
      expect(studyBg).not.toBe(primaryBg);
      await expect(studyLink).not.toHaveClass(/bg-indigo-600/);
    }
  });
});

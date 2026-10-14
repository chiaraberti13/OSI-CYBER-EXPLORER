import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('manual mobile navigation (UX-25)', () => {
  test.use({ viewport: { width: 320, height: 800 } });
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('keeps chapter, progress and topic navigation compact and reachable', async ({ page }) => {
    await page.goto('/#/manual');
    const closeHelp = page.getByRole('button', { name: 'Chiudi le istruzioni' });
    if (await closeHelp.count()) await closeHelp.click();

    const desktopNav = page.getByRole('navigation', { name: 'Capitoli del manuale' });
    const mobileNav = page.getByRole('navigation', { name: 'Navigazione mobile del manuale' });
    const chapterSelect = mobileNav.getByRole('combobox', { name: 'Vai a un capitolo' });
    const topicIndex = page.getByTestId('mobile-topic-index');

    await expect(desktopNav).toBeHidden();
    await expect(mobileNav).toBeVisible();
    await expect(chapterSelect.locator('option')).toHaveCount(21);
    await expect(chapterSelect.locator('optgroup')).toHaveCount(7);
    expect((await mobileNav.boundingBox())?.height).toBeLessThanOrEqual(112);

    const indexOverflow = await topicIndex.evaluate((index) => ({
      clientWidth: index.clientWidth,
      scrollWidth: index.scrollWidth
    }));
    expect(indexOverflow.scrollWidth).toBeGreaterThan(indexOverflow.clientWidth);

    await chapterSelect.selectOption('ethernet-switching');
    const ethernetTitle = page.getByRole('heading', { level: 2, name: /Ethernet/ });
    await expect(ethernetTitle).toBeFocused();
    await expect(chapterSelect).toHaveValue('ethernet-switching');

    await page.getByRole('button', { name: 'Segna come completato' }).click();
    await expect(mobileNav.getByLabel('Progresso capitoli: 1/21 (5%)')).toBeVisible();

    const secondTopic = topicIndex.getByRole('button').nth(1);
    await secondTopic.click();
    await expect(secondTopic).toHaveAttribute('aria-current', 'location');
    const toolbarBox = await mobileNav.boundingBox();
    await expect(mobileNav.getByLabel('Progresso capitoli: 1/21 (5%)')).toBeInViewport();

    const selectedTopic = page.locator('[data-manual-topic="switch-cam-learning"]');
    const selectedTopicBox = await selectedTopic.boundingBox();
    expect(selectedTopicBox?.y).toBeGreaterThanOrEqual((toolbarBox?.y ?? 0) + (toolbarBox?.height ?? 0) - 2);

    await page.evaluate(() => window.scrollBy({ top: 500, behavior: 'instant' }));
    const stickyToolbarBox = await mobileNav.boundingBox();
    expect(stickyToolbarBox?.y).toBeGreaterThanOrEqual(103);
    // The sticky region starts at 104 px; its border and 8 px padding put
    // the navigation itself at 113 px.
    expect(stickyToolbarBox?.y).toBeLessThanOrEqual(114);
    await expect(mobileNav.getByLabel('Progresso capitoli: 1/21 (5%)')).toBeInViewport();

    const widths = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth
    }));
    expect(widths.content).toBeLessThanOrEqual(widths.viewport);

    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(axe.violations).toEqual([]);
  });

  test('keeps previous and next chapter actions usable at 320 px', async ({ page }) => {
    await page.goto('/#/manual');
    const mobileNav = page.getByRole('navigation', { name: 'Navigazione mobile del manuale' });
    await mobileNav.getByRole('combobox', { name: 'Vai a un capitolo' }).selectOption('ethernet-switching');

    const stepNav = page.getByRole('navigation', { name: 'Capitolo precedente e successivo' });
    await stepNav.scrollIntoViewIfNeeded();
    const buttons = stepNav.getByRole('button');
    await expect(buttons).toHaveCount(2);
    for (const button of await buttons.all()) {
      const box = await button.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
      await expect(button).toBeInViewport();
    }

    await stepNav.getByRole('button', { name: /Capitolo successivo/ }).click();
    await expect(page.getByRole('heading', { level: 2, name: /Indirizzamento IPv4/ })).toBeFocused();
    await expect(mobileNav.getByRole('combobox')).toHaveValue('ipv4-subnetting');
  });

  test('localises the compact navigation and keeps its controls at least 44 px', async ({ page }) => {
    await page.goto('/#/manual');
    await page.getByRole('button', { name: 'English', exact: true }).click();
    const mobileNav = page.getByRole('navigation', { name: 'Mobile manual navigation' });
    const selector = mobileNav.getByRole('combobox', { name: 'Jump to a chapter' });
    await expect(selector.locator('optgroup[label="CCNA 1.0 · Network Fundamentals · 0/5"]')).toHaveCount(1);
    const targets = await mobileNav.locator('button, select').evaluateAll((controls) =>
      controls.map((control) => {
        const box = control.getBoundingClientRect();
        return { width: Math.round(box.width * 100) / 100, height: Math.round(box.height * 100) / 100 };
      })
    );
    for (const target of targets) {
      expect(target.width).toBeGreaterThanOrEqual(44);
      expect(target.height).toBeGreaterThanOrEqual(44);
    }
    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(axe.violations).toEqual([]);
  });
});

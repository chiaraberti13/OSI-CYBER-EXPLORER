import { expect, test, type Locator } from '@playwright/test';

type ReadingRhythm = {
  charactersWide: number;
  fontSize: number;
  lineHeight: number;
};

async function readingRhythm(copy: Locator): Promise<ReadingRhythm> {
  return copy.evaluate((element) => {
    const style = getComputedStyle(element);
    const chProbe = document.createElement('span');
    chProbe.setAttribute('aria-hidden', 'true');
    chProbe.style.cssText = 'position:absolute;visibility:hidden;inline-size:1ch;font:inherit';
    element.append(chProbe);
    const ch = chProbe.getBoundingClientRect().width;
    chProbe.remove();

    return {
      charactersWide: element.getBoundingClientRect().width / ch,
      fontSize: Number.parseFloat(style.fontSize),
      lineHeight: Number.parseFloat(style.lineHeight)
    };
  });
}

test.describe('manual reading rhythm (UX-23)', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('keeps readable measure, hierarchy and tile spacing across chapters', async ({ page }) => {
    await page.goto('/#/manual');

    const assertChapterTypography = async () => {
      const topics = page.locator('[data-manual-topic]');
      await expect(topics.first()).toBeVisible();

      const rhythm = await readingRhythm(topics.first().locator('[data-manual-copy="theory"]'));
      expect(rhythm.charactersWide).toBeGreaterThanOrEqual(65);
      expect(rhythm.charactersWide).toBeLessThanOrEqual(72.1);
      expect(rhythm.fontSize).toBe(16);
      expect(rhythm.lineHeight).toBe(28);

      const topicHeading = await topics
        .first()
        .getByRole('heading', { level: 3 })
        .evaluate((heading) => {
          const style = getComputedStyle(heading);
          return {
            fontSize: Number.parseFloat(style.fontSize),
            lineHeight: Number.parseFloat(style.lineHeight)
          };
        });
      expect(topicHeading).toEqual({ fontSize: 18, lineHeight: 28 });

      const tilePaddings = await topics
        .first()
        .locator('[data-manual-tile="objectives"], [data-manual-tile="common-mistakes"]')
        .evaluateAll((tiles) => tiles.map((tile) => Number.parseFloat(getComputedStyle(tile).paddingInlineStart)));
      expect(tilePaddings).toEqual([16, 16]);

      const topicBoxes = await topics.evaluateAll((cards) =>
        cards.map((card) => {
          const box = card.getBoundingClientRect();
          return { top: box.top, bottom: box.bottom };
        })
      );
      const topicGaps = topicBoxes.slice(1).map((box, index) => box.top - topicBoxes[index].bottom);
      for (const gap of topicGaps) {
        // The declared 24 px gap can resolve one physical pixel lower after
        // subpixel card heights are transported through Chromium.
        expect(gap).toBeGreaterThanOrEqual(23);
        expect(gap).toBeLessThanOrEqual(24);
      }
    };

    await assertChapterTypography();
    await page
      .getByRole('navigation', { name: 'Capitoli del manuale' })
      .getByRole('button', { name: /Ethernet/ })
      .click();
    await expect(page.getByRole('heading', { level: 2, name: /Ethernet/ })).toBeVisible();
    await assertChapterTypography();
  });
});

test.describe('manual reading rhythm on mobile (UX-23)', () => {
  test.use({ viewport: { width: 320, height: 800 } });

  test('preserves body size and leading while adapting the measure without overflow', async ({ page }) => {
    await page.goto('/#/manual');

    const rhythm = await readingRhythm(page.locator('[data-manual-copy="theory"]').first());
    expect(rhythm.charactersWide).toBeLessThan(65);
    expect(rhythm.fontSize).toBe(16);
    expect(rhythm.lineHeight).toBe(28);

    const widths = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth
    }));
    expect(widths.content).toBeLessThanOrEqual(widths.viewport);
  });
});

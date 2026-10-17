import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const chapters = [
  ['segmentation-trust-boundaries', 'segmentation'],
  ['email-human-security', 'email'],
  ['pentest-methodology', 'pentest'],
  ['osi-model', 'encapsulation'],
  ['ip-services', 'qos'],
  ['crypto-vpn-pki-tls', 'pki-tls-chain'],
  ['vlan-trunk-stp', 'stp-tree']
] as const;

for (const language of ['it', 'en'] as const) {
  for (const theme of ['light', 'dark'] as const) {
    for (const width of [320, 1280] as const) {
      test(`concept diagrams: ${language}, ${theme}, ${width}px viewport`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto('/#/manual');
        if (language === 'en') await page.getByRole('button', { name: 'English', exact: true }).click();
        await page.evaluate((value) => document.documentElement.setAttribute('data-theme', value), theme);
        for (const [chapter, id] of chapters) {
          await page.goto(`/#/manual/${chapter}`);
          const figure = page.locator(`[data-manual-diagram="${id}"]`);
          await expect(figure).toBeVisible();
          await figure.scrollIntoViewIfNeeded();
          const graphic = figure.getByRole('img');
          await expect(graphic).toHaveAccessibleName(/.+/);
          await expect(graphic).toHaveAccessibleDescription(/.+/);
          // SVG text is not covered by Axe contrast/overflow rules: check its geometry explicitly.
          const overflow = await graphic.evaluate((svg) => {
            const width = (svg as SVGSVGElement).viewBox.baseVal.width;
            return [...svg.querySelectorAll('text')]
              .filter((label) => {
                const box = label.getBBox();
                return box.x < 0 || box.x + box.width > width;
              })
              .map((label) => label.textContent);
          });
          expect(overflow).toEqual([]);
          // Check actual SVG ink against its opaque figure surface (Axe skips SVG text).
          const contrast = await graphic.evaluate((svg) => {
            const luminance = (color: string) => {
              const rgb = color
                .match(/[\d.]+/g)!
                .slice(0, 3)
                .map(Number)
                .map((value) => {
                  const channel = value / 255;
                  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
                });
              return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
            };
            const ink = luminance(getComputedStyle(svg).color);
            const surface = luminance(getComputedStyle(svg.closest('figure')!).backgroundColor);
            return (Math.max(ink, surface) + 0.05) / (Math.min(ink, surface) + 0.05);
          });
          expect(contrast).toBeGreaterThanOrEqual(4.5);

          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
          await expect
            .poll(() =>
              page.locator('[data-manual-root]').evaluate((el) => getComputedStyle(el.parentElement!).opacity)
            )
            .toBe('1');
          const axe = await new AxeBuilder({ page })
            .include('[data-manual-root]')
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
            .analyze();
          expect(axe.violations).toEqual([]);
        }
      });
    }
  }
}

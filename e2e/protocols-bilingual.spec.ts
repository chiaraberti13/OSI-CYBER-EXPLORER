import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { PROTOCOL_REGISTRY } from '../src/content/protocolRegistry';

for (const width of [320, 1280]) {
  test(`protocol catalogue is complete, bilingual and accessible at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/#/ports');
    await page.getByRole('button', { name: 'Protocolli', exact: true }).click();
    const cards = page.locator('[data-protocol]');
    for (const language of ['it', 'en'] as const) {
      if (language === 'en') await page.getByRole('button', { name: 'English', exact: true }).click();
      await expect(cards).toHaveCount(PROTOCOL_REGISTRY.length);
      const content = await cards.allTextContents();
      for (const [index, protocol] of PROTOCOL_REGISTRY.entries()) {
        for (const field of ['description', 'useCase', 'security'] as const) {
          expect(content[index]).toContain(protocol[field][language]);
        }
      }
      await expect(page.getByText(language === 'it' ? 'Trasporto' : 'Transport', { exact: true })).toBeVisible();
      await expect(page.getByText(language === 'it' ? 'Sicuro' : 'Secure', { exact: true })).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const search = page.getByRole('textbox', { name: language === 'it' ? 'Cerca protocolli' : 'Search protocols' });
      await search.fill('HMAC-SHA');
      await expect(cards).toHaveCount(1);
      await expect(cards.first()).toHaveAttribute('data-protocol', 'OSPF');
      await page.getByRole('button', { name: language === 'it' ? 'Azzera' : 'Reset', exact: true }).click();
      await expect(cards).toHaveCount(PROTOCOL_REGISTRY.length);
      await expect.poll(() => cards.last().evaluate((element) => getComputedStyle(element).opacity)).toBe('1');
      const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      expect(scan.violations).toEqual([]);
    }
    // Searching must also use the current language rather than only English metadata.
    await page.getByRole('textbox', { name: 'Search protocols' }).fill('byte stream');
    await expect(cards).toHaveCount(1);
    await page.getByRole('button', { name: 'Italiano', exact: true }).click();
    await expect(cards).toHaveCount(0);
    await page.getByRole('textbox', { name: 'Cerca protocolli' }).fill('flusso di byte');
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toHaveAttribute('data-protocol', 'TCP');
  });
}

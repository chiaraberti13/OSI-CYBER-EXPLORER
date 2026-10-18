import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { DEVICE_REGISTRY } from '../src/content/deviceRegistry';

for (const width of [320, 1280]) {
  test(`device catalogue is bilingual, accessible and filterable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/#/ports');
    await page.getByRole('button', { name: 'Apparati', exact: true }).click();
    const cards = page.locator('[data-device]');
    for (const language of ['it', 'en'] as const) {
      if (language === 'en') await page.getByRole('button', { name: 'English', exact: true }).click();
      await expect(cards).toHaveCount(DEVICE_REGISTRY.length);
      const texts = await cards.allTextContents();
      for (const [index, device] of DEVICE_REGISTRY.entries()) {
        for (const field of ['role', 'howItWorks', 'securityAttacks', 'cannotStop', 'mitigation'] as const) {
          expect(texts[index]).toContain(device[field][language]);
        }
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(
        await cards.evaluateAll((elements) =>
          elements.every((element) => element.scrollWidth <= element.clientWidth + 1)
        )
      ).toBe(true);
      const search = page.getByRole('textbox', { name: language === 'it' ? 'Cerca apparati' : 'Search devices' });
      await search.fill('BPDU Guard');
      await expect(cards).toHaveCount(1);
      await expect(cards.first()).toHaveAttribute('data-device', 'SW - Ethernet Switch');
      const security = page.getByRole('button', {
        name: language === 'it' ? 'Sicurezza & Protezione' : 'Security & Defense',
        exact: true
      });
      await security.click();
      await expect(security).toHaveAttribute('aria-pressed', 'true');
      await expect(cards).toHaveCount(0);
      await page
        .getByRole('button', { name: language === 'it' ? 'Cancella tutti i filtri' : 'Clear all filters', exact: true })
        .click();
      await expect(search).toHaveValue('');
      await expect(security).toHaveAttribute('aria-pressed', 'false');
      await expect(cards).toHaveCount(DEVICE_REGISTRY.length);
      for (const [category, label] of [
        ['security', language === 'it' ? 'Sicurezza & Protezione' : 'Security & Defense'],
        ['networking', language === 'it' ? 'Connettività & Routing' : 'Routing & Switching'],
        ['infrastructure', language === 'it' ? 'Accesso & Trasmissione' : 'Access & Transport']
      ] as const) {
        await page.getByRole('button', { name: label, exact: true }).click();
        await expect(cards).toHaveCount(DEVICE_REGISTRY.filter((device) => device.category === category).length);
      }
      await page.getByRole('button', { name: language === 'it' ? 'Azzera' : 'Reset', exact: true }).click();
      await expect(cards).toHaveCount(DEVICE_REGISTRY.length);
      await expect.poll(() => cards.last().evaluate((element) => getComputedStyle(element).opacity)).toBe('1');
      const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      expect(scan.violations).toEqual([]);
    }
    await page.getByRole('textbox', { name: 'Search devices' }).fill('unknown unicast');
    await expect(cards).toHaveCount(2);
    await page.getByRole('button', { name: 'Italiano', exact: true }).click();
    await expect(cards).toHaveCount(0);
    await page.getByRole('textbox', { name: 'Cerca apparati' }).fill('unicast sconosciuti');
    await expect(cards).toHaveCount(2);
  });
}

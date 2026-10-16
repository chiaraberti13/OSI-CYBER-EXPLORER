import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { PORT_REGISTRY } from '../src/content/portContent';

for (const width of [320, 1280]) {
  test(`port catalogue preserves translations, filters and reflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/#/ports');
    const cards = page.locator('[data-port-service]');
    for (const language of ['it', 'en'] as const) {
      if (language === 'en') await page.getByRole('button', { name: 'English', exact: true }).click();
      await expect(cards).toHaveCount(PORT_REGISTRY.length);
      const content = await cards.allTextContents();
      for (const [index, port] of PORT_REGISTRY.entries()) {
        for (const field of ['description', 'security'] as const) {
          expect(content[index]).toContain(port[field][language]);
        }
        if (port.ambiguity) expect(content[index]).toContain(port.ambiguity[language]);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const search = page.getByRole('textbox', {
        name: language === 'it' ? 'Cerca porte e servizi di rete' : 'Search network ports and services'
      });
      const filter = page.getByRole('combobox', {
        name: language === 'it' ? 'Profilo di sicurezza' : 'Security posture'
      });
      await search.fill('TACACS+');
      await expect(cards).toHaveCount(1);
      await filter.selectOption('secure');
      await expect(cards).toHaveCount(0);
      await filter.selectOption('review');
      await expect(cards).toHaveCount(1);
      await expect(cards.first()).toHaveAttribute('data-port-service', 'TACACS+');
      await page
        .getByRole('button', { name: language === 'it' ? 'Azzera filtri' : 'Reset filters', exact: true })
        .click();
      await expect(cards).toHaveCount(PORT_REGISTRY.length);
      await page.getByRole('button', { name: '49152+', exact: true }).click();
      await expect(
        page.getByRole('heading', {
          name: language === 'it' ? 'Comprendere le porte dinamiche' : 'Understanding Dynamic Ports'
        })
      ).toBeVisible();
      await expect(
        page.getByText(
          language === 'it'
            ? /il loro intervallo dipende dal sistema operativo/
            : /their range depends on the operating system/
        )
      ).toBeVisible();
      await page
        .getByRole('button', { name: language === 'it' ? 'Azzera filtri' : 'Reset filters', exact: true })
        .click();
      await expect.poll(() => cards.last().evaluate((element) => getComputedStyle(element).opacity)).toBe('1');
      const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      expect(scan.violations).toEqual([]);
    }
  });
}

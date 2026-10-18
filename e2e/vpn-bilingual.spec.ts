import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { VPN_CONTENT } from '../src/content/vpnContent';

for (const width of [320, 1280]) {
  test(`VPN topics preserve translations, keyboard selection and reflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/#/ports');
    await page.getByRole('button', { name: 'AAA & VPN', exact: true }).click();
    await page.locator('#subtab-vpn').click();
    const panel = page.getByTestId('vpn-content');
    for (const language of ['it', 'en'] as const) {
      if (language === 'en') await page.getByRole('button', { name: 'English', exact: true }).click();
      await expect(panel).toContainText(VPN_CONTENT.overview[language]);
      for (const id of ['vpn-overview', 'ipsec-tunnel', 'ipsec-transport', 'dtls'] as const) {
        const method = VPN_CONTENT.modes[id];
        const button = page.locator(`#vpn-btn-${id}`);
        await expect(button).toContainText(method.title[language]);
        await button.focus();
        await page.keyboard.press('Enter');
        await expect(button).toHaveAttribute('aria-pressed', 'true');
        await expect(panel.locator('button[aria-pressed="true"]')).toHaveCount(1);
        const detail = page.locator('#vpn-detail-card');
        await expect(detail.getByRole('heading', { name: method.title[language], exact: true })).toBeVisible();
        await expect(detail).toContainText(method.description[language]);
        await expect(detail).toContainText(VPN_CONTENT.diagramNote[language]);
        await expect(detail).toContainText(method.note[language]);
        for (const step of method.blocks) await expect(detail).toContainText(step[language]);
        await detail.getByTestId('vpn-note').scrollIntoViewIfNeeded();
        await expect(detail.getByTestId('vpn-note')).toBeInViewport();
        expect(await detail.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await expect
          .poll(() => panel.evaluate((element) => getComputedStyle(element.parentElement!).opacity))
          .toBe('1');
        const scan = await new AxeBuilder({ page })
          .include('[data-testid="vpn-content"]')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze();
        expect(scan.violations).toEqual([]);
      }
      await page.locator('#subtab-aaa').click();
      await page.locator('#subtab-vpn').click();
      await expect(page.locator('#vpn-btn-dtls')).toHaveAttribute('aria-pressed', 'true');
    }
  });
}

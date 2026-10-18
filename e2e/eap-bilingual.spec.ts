import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { EAP_CONTENT } from '../src/content/eapContent';

for (const width of [320, 1280]) {
  test(`EAP methods preserve translations, keyboard selection and reflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/#/ports');
    await page.getByRole('button', { name: 'AAA & VPN', exact: true }).click();
    const panel = page.getByTestId('eap-content');
    for (const language of ['it', 'en'] as const) {
      if (language === 'en') await page.getByRole('button', { name: 'English', exact: true }).click();
      await expect(panel).toContainText(EAP_CONTENT.overview[language]);
      for (const id of ['tls', 'peap', 'ttls', 'fast', 'md5'] as const) {
        const method = EAP_CONTENT.methods[id];
        const button = page.locator(`#eap-btn-${id}`);
        await expect(button).toContainText(method.label[language]);
        await button.focus();
        await page.keyboard.press('Enter');
        await expect(button).toHaveAttribute('aria-pressed', 'true');
        await expect(panel.locator('button[aria-pressed="true"]')).toHaveCount(1);
        const detail = page.locator('#eap-detail-card');
        await expect(detail.getByRole('heading', { name: method.name, exact: true })).toBeVisible();
        await expect(detail).toContainText(method.description[language]);
        await expect(detail).toContainText(EAP_CONTENT.flowNote[language]);
        for (const step of method.steps) await expect(detail).toContainText(step[language]);
        await detail.locator('li').last().scrollIntoViewIfNeeded();
        await expect(detail.locator('li').last()).toBeInViewport();
        expect(await detail.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await expect
          .poll(() => panel.evaluate((element) => getComputedStyle(element.parentElement!).opacity))
          .toBe('1');
        const scan = await new AxeBuilder({ page })
          .include('[data-testid="eap-content"]')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze();
        expect(scan.violations).toEqual([]);
      }
      await page.locator('#subtab-aaa').click();
      await page.locator('#subtab-eap').click();
      await expect(page.locator('#eap-btn-md5')).toHaveAttribute('aria-pressed', 'true');
    }
  });
}

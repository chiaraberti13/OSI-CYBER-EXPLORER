import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { AAA_CONTENT } from '../src/content/aaaContent';

for (const width of [320, 1280]) {
  test(`AAA comparison and illustrative traces preserve bilingual facts and reflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/#/ports');
    await page.getByRole('button', { name: 'AAA & VPN', exact: true }).click();
    await page.locator('#subtab-aaa').click();
    const panel = page.getByTestId('aaa-content');
    for (const language of ['it', 'en'] as const) {
      if (language === 'en') await page.getByRole('button', { name: 'English', exact: true }).click();
      await expect(page.locator('#subtab-aaa')).toHaveAttribute('aria-pressed', 'true');
      await expect(panel).toContainText(AAA_CONTENT.overview[language]);
      await expect(panel).toContainText(AAA_CONTENT.disclaimer[language]);
      for (const id of ['radius', 'tacacs'] as const) {
        const protocol = AAA_CONTENT.protocols[id];
        for (const fact of protocol.facts)
          await expect(panel.locator(`[data-aaa-protocol="${id}"]`)).toContainText(fact[language]);
        const button = panel.getByRole('button', {
          name: `${language === 'en' ? 'Simulate' : 'Simula'} ${protocol.name}`,
          exact: true
        });
        await button.focus();
        await page.keyboard.press('Enter');
        await expect(button).toHaveAttribute('aria-pressed', 'true');
        const trace = page.getByTestId('aaa-trace');
        for (const event of protocol.events) await expect(trace).toContainText(event[language]);
        await expect(trace).toContainText(protocol.lesson[language]);
        const lesson = trace.locator('p');
        await lesson.scrollIntoViewIfNeeded();
        await expect(lesson).toBeInViewport();
        expect(await trace.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
        await expect
          .poll(() => panel.evaluate((element) => getComputedStyle(element.parentElement!).opacity))
          .toBe('1');
        expect(await panel.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        const scan = await new AxeBuilder({ page })
          .include('[data-testid="aaa-content"]')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze();
        expect(scan.violations).toEqual([]);
      }
    }
  });
}

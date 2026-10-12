import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

test.describe('manual accessibility (UX-24)', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('orders chapter and topic navigation before content and announces chapter changes', async ({ page }) => {
    await page.goto('/#/manual');
    const chapterNav = page.getByRole('navigation', { name: 'Capitoli del manuale' });
    const topicRail = page.getByRole('navigation', { name: 'In questa pagina' });

    const activeChapter = chapterNav.getByRole('button', { name: /modello OSI/ });
    const activeTopic = topicRail.getByRole('button').first();
    await expect(activeChapter).toHaveAttribute('aria-current', 'page');
    await expect(activeTopic).toHaveAttribute('aria-current', 'location');

    // From the final chapter selector, Tab reaches the first topic jump before
    // entering the article, matching the DOM and visual navigation order.
    await chapterNav.getByRole('button').last().focus();
    await page.keyboard.press('Tab');
    await expect(activeTopic).toBeFocused();

    const nextChapter = chapterNav.getByRole('button', { name: /Ethernet/ });
    await nextChapter.click();
    const newTitle = page.getByRole('heading', { level: 2, name: /Ethernet/ });
    await expect(newTitle).toBeFocused();
    await expect(newTitle).toHaveAttribute('tabindex', '-1');
    await expect(nextChapter).toHaveAttribute('aria-current', 'page');
    await expect(activeChapter).not.toHaveAttribute('aria-current');

    const axe = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(axe.violations).toEqual([]);
  });

  test('uses instant scrolling when reduced motion is requested', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/#/manual');
    await page.evaluate(() => {
      const behaviors: string[] = [];
      Object.defineProperty(window, '__manualScrollBehaviors', { value: behaviors, configurable: true });
      Element.prototype.scrollIntoView = function scrollIntoView(options?: boolean | ScrollIntoViewOptions) {
        if (typeof options === 'object') behaviors.push(options.behavior ?? 'auto');
      };
      window.scrollTo = function scrollTo(options?: ScrollToOptions | number) {
        if (typeof options === 'object') behaviors.push(options.behavior ?? 'auto');
      } as typeof window.scrollTo;
    });

    const topicRail = page.getByRole('navigation', { name: 'In questa pagina' });
    await topicRail.getByRole('button').nth(1).click();
    await page
      .getByRole('navigation', { name: 'Capitoli del manuale' })
      .getByRole('button', { name: /Ethernet/ })
      .click();
    await expect(page.getByRole('heading', { level: 2, name: /Ethernet/ })).toBeFocused();

    const behaviors = await page.evaluate(
      () => (window as typeof window & { __manualScrollBehaviors: string[] }).__manualScrollBehaviors
    );
    expect(behaviors).toEqual(['auto', 'auto']);
  });
});

test.describe('manual accessibility on mobile (UX-24)', () => {
  test.use({ viewport: { width: 320, height: 800 } });

  test('keeps current location, touch targets and colored tiles accessible', async ({ page }) => {
    await page.goto('/#/manual');
    const contents = page.getByRole('navigation', { name: 'Navigazione mobile del manuale' });
    const buttons = contents.getByRole('button');
    await expect(buttons.first()).toHaveAttribute('aria-current', 'location');
    await buttons.nth(1).click();
    await expect(buttons.first()).not.toHaveAttribute('aria-current');
    await expect(buttons.nth(1)).toHaveAttribute('aria-current', 'location');

    const undersized = await page
      .locator('main button:visible, main a[href]:visible, main summary:visible')
      .evaluateAll((controls) =>
        controls.flatMap((control) => {
          const box = control.getBoundingClientRect();
          const width = Math.round(box.width * 100) / 100;
          const height = Math.round(box.height * 100) / 100;
          return width < 44 || height < 44
            ? [`${control.tagName.toLowerCase()}[${control.textContent?.trim() ?? ''}]: ${width}×${height}`]
            : [];
        })
      );
    expect(undersized).toEqual([]);

    const tileContrast = await new AxeBuilder({ page })
      .include('[data-manual-tile]')
      .withRules(['color-contrast'])
      .analyze();
    expect(tileContrast.violations).toEqual([]);

    const axe = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(axe.violations).toEqual([]);
  });
});

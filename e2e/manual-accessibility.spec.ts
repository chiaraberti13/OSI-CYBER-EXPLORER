import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

test.describe('manual accessibility (UX-24)', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('keeps the topic rail current, moves focus on a chapter change, and stays WCAG clean', async ({ page }) => {
    await page.goto('/#/manual/osi-model');
    const topicRail = page.getByRole('navigation', { name: 'In questa pagina' });
    await expect(topicRail.getByRole('button').first()).toHaveAttribute('aria-current', 'location');

    // Moving to the next chapter shifts focus to the new chapter title (an SR
    // announcement point) which is programmatically focusable.
    await page
      .getByRole('navigation', { name: 'Capitolo precedente e successivo' })
      .getByRole('button', { name: /Capitolo successivo/ })
      .click();
    const newTitle = page.getByRole('heading', { level: 2, name: /Ethernet/ });
    await expect(newTitle).toBeFocused();
    await expect(newTitle).toHaveAttribute('tabindex', '-1');

    const axe = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(axe.violations).toEqual([]);
  });

  test('uses instant scrolling when reduced motion is requested', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/#/manual/osi-model');
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
      .getByRole('navigation', { name: 'Capitolo precedente e successivo' })
      .getByRole('button', { name: /Capitolo successivo/ })
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
    await page.goto('/#/manual/osi-model');
    // UX-45c: the per-topic quick jump is a native select; its value reflects the active
    // topic (the "current location") and updates when another topic is chosen.
    const contents = page.getByRole('navigation', { name: 'Navigazione mobile del manuale' });
    const topicSelect = contents.getByRole('combobox', { name: 'Vai a un argomento' });
    const options = topicSelect.getByRole('option');
    const firstValue = await options.first().getAttribute('value');
    const secondValue = await options.nth(1).getAttribute('value');
    await expect(topicSelect).toHaveValue(firstValue ?? '');
    await topicSelect.selectOption(secondValue!);
    await expect(topicSelect).toHaveValue(secondValue!);

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

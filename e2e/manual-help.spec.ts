import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

test.describe('manual onboarding (UX-22)', () => {
  test('remembers dismissal across reloads, lab visits and chapter progress resets', async ({ page }) => {
    await page.goto('/#/manual');
    const help = page.getByRole('region', { name: 'Come usare questa guida' });
    const trigger = page.getByRole('button', { name: 'Come usare questa guida' });
    await expect(help).toBeVisible();
    await expect(help.getByRole('listitem')).toHaveCount(3);
    await page.getByRole('button', { name: 'Segna come completato' }).click();

    await help.getByRole('button', { name: 'Chiudi le istruzioni' }).click();
    await expect(help).toBeHidden();
    await expect(trigger).toBeFocused();
    await page.reload();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('button', { name: 'Segna come da completare' })).toBeVisible();

    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(help).toBeVisible();
    await page.keyboard.press('Space');
    await expect(help).toBeHidden();

    await page.getByRole('link', { name: 'Fai l’esercizio guidato', exact: true }).first().click();
    await expect(page).toHaveURL(/#\/(osi|ports)$/);
    await page.goBack();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await page.getByRole('button', { name: 'Azzera progresso' }).click();
    await expect(help).toBeHidden();
    await page.reload();
    await expect(help).toBeHidden();
  });

  test('migrates version 2, retaining language and completed chapters', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'osi-lab-preferences',
        JSON.stringify({
          version: 2,
          state: {
            language: 'en',
            audioEnabled: false,
            simSpeed: 2,
            hasSeenGuide: true,
            completedChapterIds: ['osi-model']
          }
        })
      );
    });
    await page.goto('/#/manual');
    await expect(page.getByRole('region', { name: 'How to use this guide' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Mark as incomplete' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByLabel('Chapter progress: 1/10', { exact: true })).toBeVisible();
  });

  test('keeps instructions usable when browser storage is blocked', async ({ page }) => {
    await page.addInitScript(() => {
      for (const method of ['getItem', 'setItem', 'removeItem']) {
        Object.defineProperty(Storage.prototype, method, {
          value: () => {
            throw new DOMException('Storage blocked', 'SecurityError');
          }
        });
      }
    });
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.goto('/#/manual');
    await page.getByRole('button', { name: 'Chiudi le istruzioni' }).click();
    await page.getByRole('link', { name: 'Fai l’esercizio guidato', exact: true }).first().click();
    await page.goBack();
    const trigger = page.getByRole('button', { name: 'Come usare questa guida' });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await trigger.click();
    await expect(page.getByRole('region', { name: 'Come usare questa guida' })).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  for (const language of ['it', 'en'] as const) {
    test(`${language} instructions have no detectable WCAG A/AA violations at 320 px`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto('/#/manual');
      if (language === 'en') await page.getByRole('button', { name: 'English' }).click();
      const title = language === 'it' ? 'Come usare questa guida' : 'How to use this guide';
      const help = page.getByRole('region', { name: title });
      await expect(help).toBeVisible();
      await expect(page.locator('main > div').last()).toHaveCSS('opacity', '1');

      const result = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      expect(result.violations).toEqual([]);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      for (const control of [page.getByRole('button', { name: title }), help.getByRole('button')]) {
        const box = await control.boundingBox();
        expect(box).not.toBeNull();
        expect(box?.width).toBeGreaterThanOrEqual(44);
        expect(box?.height).toBeGreaterThanOrEqual(44);
      }
    });
  }
});

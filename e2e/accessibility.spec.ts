import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

const representativeViews = [
  { route: 'curriculum', heading: 'Mappa didattica integrata' },
  { route: 'manual', heading: 'Manuale di studio' },
  { route: 'osi', heading: 'Pila OSI' },
  { route: 'ports', heading: 'Porte & Protocolli' },
  { route: 'glossary', heading: 'Glossario di Rete' },
  { route: 'attacklab', heading: 'Laboratorio Attacco & Difesa' }
] as const;

async function expectNoWcagViolations(page: Page, context: string) {
  // Route headings become visible before Motion has necessarily completed the
  // active view's opacity transition. Axe must inspect the settled colours.
  await expect(page.locator('main > div').last()).toHaveCSS('opacity', '1');
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  const violations = results.violations.map(({ id, impact, help, nodes }) => ({
    id,
    impact,
    help,
    nodes: nodes.map((node) => ({
      target: node.target,
      html: node.html,
      failureSummary: node.failureSummary
    }))
  }));

  expect(violations, `${context}: Axe found WCAG 2.2 A/AA violations`).toEqual([]);
}

test.describe('automated WCAG checks (UX-16)', () => {
  for (const { route, heading } of representativeViews) {
    test(`${route} has no detectable WCAG A/AA violations`, async ({ page }) => {
      await page.goto(`/#/${route}`);
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
      await expectNoWcagViolations(page, route);
    });
  }

  test('the English shell and guide dialog have no detectable violations', async ({ page }) => {
    await page.goto('/#/curriculum');
    await page.getByRole('button', { name: 'English' }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', { level: 1, name: 'Integrated learning map' })).toBeVisible();
    await expectNoWcagViolations(page, 'English curriculum');

    const trigger = page.getByRole('button', { name: 'Open the guide' });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Laboratory Directory & Guide' });
    await expect(dialog).toBeVisible();
    // Axe must inspect the final rendered colours, not Motion's translucent entry frame.
    await expect(dialog).toHaveCSS('opacity', '1');
    await expectNoWcagViolations(page, 'English guide dialog');
  });

  test('the guide traps focus, closes with Escape, and restores the trigger', async ({ page }) => {
    await page.goto('/#/curriculum');
    const trigger = page.getByRole('button', { name: 'Apri la guida' });
    await trigger.click();

    const dialog = page.getByRole('dialog', { name: 'Manuale & Repository di Rete' });
    const firstControl = dialog.getByRole('button', { name: 'Chiudi la guida' });
    const lastControl = dialog.getByRole('button', { name: 'Ho capito!' });
    await expect(firstControl).toBeFocused();

    await page.keyboard.press('Shift+Tab');
    await expect(lastControl).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(firstControl).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});

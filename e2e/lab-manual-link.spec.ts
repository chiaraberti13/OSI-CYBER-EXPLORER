import { expect, test } from '@playwright/test';

/**
 * EDU-STRUCT-05 — a lab defers its theory to the manual. Every lab a manual chapter cites
 * carries a back-link to that chapter (`#/manual/<id>`); views no chapter cites show none.
 */
test.describe('lab → manual back-link (EDU-STRUCT-05)', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('a lab links back to its chapter and the link opens it', async ({ page }) => {
    await page.goto('/#/osi');

    const callout = page.locator('aside', { hasText: 'Teoria nel manuale' });
    await expect(callout).toBeVisible();
    const chapterLink = callout.getByRole('link', { name: /Il modello OSI/ });
    await expect(chapterLink).toHaveAttribute('href', '#/manual/osi-model');

    await chapterLink.click();
    await expect(page).toHaveURL(/#\/manual\/osi-model$/);
    await expect(page.getByRole('heading', { level: 2, name: /modello OSI/ })).toBeVisible();
  });

  test('a lab shared by two chapters links to both', async ({ page }) => {
    await page.goto('/#/fundamentals');
    const aside = page.locator('aside', { hasText: 'Teoria nel manuale' });
    await expect(aside.getByRole('link')).toHaveCount(2);
    await expect(aside.getByRole('link').nth(0)).toHaveAttribute('href', '#/manual/ethernet-switching');
    await expect(aside.getByRole('link').nth(1)).toHaveAttribute('href', '#/manual/ipv4-subnetting');
  });

  test('the manual itself shows no lab back-link', async ({ page }) => {
    await page.goto('/#/manual');
    await expect(page.getByRole('heading', { name: 'Manuale di studio' })).toBeVisible();
    await expect(page.locator('aside', { hasText: 'Teoria nel manuale' })).toHaveCount(0);
  });
});

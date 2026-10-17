import { expect, test } from '@playwright/test';

/**
 * EDU-STRUCT-04 — manual chapters are addressable via URL (`#/manual/<chapterId>`).
 *
 * A deep link opens the addressed chapter directly; a broken chapter id falls back
 * safely to the manual root; and selecting chapters in the app keeps the URL in sync
 * so Back returns to the previous chapter.
 */
test.describe('manual chapter deep links (EDU-STRUCT-04)', () => {
  test('opens the addressed chapter directly', async ({ page }) => {
    await page.goto('/#/manual/ip-routing-ospf');
    await expect(page.getByRole('heading', { level: 2, name: /OSPF/ })).toBeVisible();
    await expect(page).toHaveURL(/#\/manual\/ip-routing-ospf$/);
  });

  test('falls back to the manual root for a broken chapter id', async ({ page }) => {
    await page.goto('/#/manual/not-a-real-chapter');
    // The URL is canonicalized to #/manual and the card index (the manual root) opens.
    await expect(page.getByRole('heading', { level: 1, name: 'Manuale di studio' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Capitoli del manuale' })).toBeVisible();
    await expect(page).toHaveURL(/#\/manual$/);
  });

  test('keeps the URL in sync with chapter selection and Back', async ({ page }) => {
    await page.goto('/#/manual');
    await expect(page.getByRole('heading', { level: 1, name: 'Manuale di studio' })).toBeVisible();

    // Open the Ethernet chapter from the card index.
    await page
      .getByRole('navigation', { name: 'Capitoli del manuale' })
      .getByRole('link', { name: /Ethernet, switching/ })
      .click();
    await expect(page).toHaveURL(/#\/manual\/ethernet-switching$/);
    await expect(page.getByRole('heading', { level: 2, name: /Ethernet/ })).toBeVisible();

    // Back returns to the manual root (the card index).
    await page.goBack();
    await expect(page).toHaveURL(/#\/manual$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Manuale di studio' })).toBeVisible();
  });
});

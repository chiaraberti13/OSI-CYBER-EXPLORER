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

  test('a lab shared by several chapters links to each', async ({ page }) => {
    await page.goto('/#/fundamentals');
    const aside = page.locator('aside', { hasText: 'Teoria nel manuale' });
    await expect(aside.getByRole('link')).toHaveCount(4);
    await expect(aside.getByRole('link').nth(0)).toHaveAttribute('href', '#/manual/ethernet-switching');
    await expect(aside.getByRole('link').nth(1)).toHaveAttribute('href', '#/manual/ipv4-subnetting');
    await expect(aside.getByRole('link').nth(2)).toHaveAttribute('href', '#/manual/network-components');
    await expect(aside.getByRole('link').nth(3)).toHaveAttribute('href', '#/manual/ipv6-addressing');
  });

  test('the manual itself shows no lab back-link', async ({ page }) => {
    await page.goto('/#/manual');
    await expect(page.getByRole('heading', { name: 'Manuale di studio' })).toBeVisible();
    await expect(page.locator('aside', { hasText: 'Teoria nel manuale' })).toHaveCount(0);
  });

  // EDU-31 — a newly taught lab surfaces the same back-link in the real app, proving the
  // central mount (App.tsx, from the active view id) covers new chapters, not just the
  // ones wired by hand. `layer2security` gained its chapter with CONTENT-02 (5/5).
  test('a newly taught lab links back to its new chapter', async ({ page }) => {
    await page.goto('/#/layer2security');
    const callout = page.locator('aside', { hasText: 'Teoria nel manuale' });
    await expect(callout).toBeVisible();
    const chapterLink = callout.getByRole('link', { name: /access layer/i });
    await expect(chapterLink).toHaveAttribute('href', '#/manual/access-layer-security');

    await chapterLink.click();
    await expect(page).toHaveURL(/#\/manual\/access-layer-security$/);
    await expect(page.getByRole('heading', { level: 2, name: /access layer/i })).toBeVisible();
  });
});

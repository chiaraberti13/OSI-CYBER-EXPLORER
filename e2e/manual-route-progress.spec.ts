import { expect, test } from '@playwright/test';

/**
 * UX-33 — the manual shows chapter progress broken out per certification route (CCNA,
 * eJPT, extension) beside the overall total, so a learner working one objective sees
 * that objective advance on its own.
 */
test.describe('per-route progress (UX-33)', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('advances only the route of the completed chapter', async ({ page }) => {
    await page.goto('/#/manual');
    const closeHelp = page.getByRole('button', { name: 'Chiudi le istruzioni' });
    if (await closeHelp.count()) await closeHelp.click();

    const routeList = page.getByRole('list', { name: 'Progresso per percorso' });
    await expect(routeList).toBeVisible();
    // Three routes, all at zero before any chapter is completed.
    await expect(routeList.getByRole('listitem')).toHaveCount(3);
    await expect(routeList.getByText(/^CCNA 0\/\d+$/)).toBeVisible();
    await expect(routeList.getByText(/^eJPT 0\/\d+$/)).toBeVisible();

    // Completing the open chapter (osi-model, a CCNA chapter) advances CCNA only.
    await page.getByRole('button', { name: 'Segna come completato' }).click();
    await expect(routeList.getByText(/^CCNA 1\/\d+$/)).toBeVisible();
    await expect(routeList.getByText(/^eJPT 0\/\d+$/)).toBeVisible();

    // The overall total counts it too.
    await expect(page.getByText(/Progresso capitoli: 1\/\d+/)).toBeVisible();
  });
});

import { expect, test } from '@playwright/test';

/**
 * UX-29 — topics are addressable via URL (`#/manual/<chapterId>/<topicId>`).
 *
 * A deep link opens the chapter and scrolls to the exact topic with the rail aligned;
 * selecting a topic gives it a shareable anchor; a broken topic falls back to the chapter.
 */
test.describe('manual topic deep links (UX-29)', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('opens the exact topic and aligns the rail', async ({ page }) => {
    await page.goto('/#/manual/osi-model/osi-seven-layers');
    await expect(page.getByRole('heading', { level: 2, name: /modello OSI/ })).toBeVisible();

    // The addressed topic is scrolled into view and highlighted in the "On this page" rail.
    await expect(page.locator('#topic-osi-seven-layers')).toBeInViewport();
    const rail = page.getByRole('navigation', { name: 'In questa pagina' });
    await expect(rail.getByRole('button', { name: /sette livelli/ })).toHaveAttribute('aria-current', 'location');
    await expect(page).toHaveURL(/#\/manual\/osi-model\/osi-seven-layers$/);
  });

  test('gives each topic a shareable anchor on selection', async ({ page }) => {
    await page.goto('/#/manual/osi-model');
    await page.getByRole('button', { name: 'Chiudi le istruzioni' }).click();

    const rail = page.getByRole('navigation', { name: 'In questa pagina' });
    await rail.getByRole('button', { name: /sette livelli/ }).click();

    await expect(page).toHaveURL(/#\/manual\/osi-model\/osi-seven-layers$/);
    await expect(page.locator('#topic-osi-seven-layers')).toBeInViewport();
  });

  test('falls back to the chapter for a broken topic id', async ({ page }) => {
    await page.goto('/#/manual/osi-model/not-a-topic');
    await expect(page.getByRole('heading', { level: 2, name: /modello OSI/ })).toBeVisible();
    await expect(page).toHaveURL(/#\/manual\/osi-model$/);
  });
});

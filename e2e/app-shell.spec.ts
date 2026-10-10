import { test, expect, type Page } from '@playwright/test';

/**
 * ENG-12 smoke tests for the application shell: first load, the language toggle,
 * the Ctrl/Cmd+K quick search, hash-based deep links and history, and that the
 * navigation stays usable at a phone width. These exercise the chrome that every
 * lab depends on, so a regression here breaks the whole app.
 */

async function openApp(page: Page) {
  await page.goto('/');
  // The persistent brand heading proves the shell mounted.
  await expect(page.getByRole('heading', { level: 1, name: 'OSI Cyber Explorer' })).toBeVisible();
}

test.describe('application shell', () => {
  test('loads the default OSI lab', async ({ page }) => {
    await openApp(page);

    // The default view is the OSI stack with its packet simulator (Italian default).
    await expect(page.getByRole('heading', { name: 'Simulatore di pacchetti' })).toBeVisible();
    await expect(page).toHaveTitle(/Pila OSI — OSI Cyber Explorer/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'it');
  });

  test('switches language between Italian and English', async ({ page }) => {
    await openApp(page);

    // Italian is the default: the guide button is labelled in Italian.
    await expect(page.getByRole('button', { name: 'Apri la guida' })).toBeVisible();

    await page.getByRole('button', { name: 'English' }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('button', { name: 'Open the guide' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Packet simulator' })).toBeVisible();

    // And back again, confirming the toggle is symmetric.
    await page.getByRole('button', { name: 'Italiano' }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'it');
    await expect(page.getByRole('button', { name: 'Apri la guida' })).toBeVisible();
  });

  test('quick search opens with Ctrl+K and navigates by keyboard', async ({ page }) => {
    await openApp(page);

    await page.keyboard.press('Control+k');
    const search = page.getByRole('textbox', { name: 'Cerca un laboratorio' });
    await expect(search).toBeFocused();

    // "vlsm" only matches the Network fundamentals lab's keywords.
    await search.fill('vlsm');
    const results = page.locator('#nav-search-results');
    await expect(results.getByRole('link')).toHaveCount(1);

    // Arrow + Enter selects the highlighted result entirely from the keyboard.
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#\/fundamentals$/);
    await expect(page.getByRole('heading', { name: 'Pianificatore VLSM' })).toBeVisible();
  });

  test('Escape closes the quick search', async ({ page }) => {
    await openApp(page);

    await page.keyboard.press('Control+k');
    const dialog = page.getByRole('dialog', { name: 'Cerca un laboratorio' });
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('the first Tab reaches the skip link and it jumps to the main content', async ({ page }) => {
    await openApp(page);

    // The skip link must be the first thing a keyboard user reaches.
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Vai al contenuto' });
    await expect(skip).toBeFocused();

    // Activating it lands focus on the main landmark without disturbing the route.
    await page.keyboard.press('Enter');
    await expect(page.locator('#main-content')).toBeFocused();
    await expect(page).toHaveURL(/#\/osi$/);
  });

  test('deep links, reload and invalid routes behave predictably', async ({ page }) => {
    // A deep link opens its destination directly.
    await page.goto('/#/ports');
    await expect(page).toHaveTitle(/Porte & Protocolli — OSI Cyber Explorer/);

    // Reload keeps the same view (routing reads the hash before React renders).
    await page.reload();
    await expect(page).toHaveTitle(/Porte & Protocolli — OSI Cyber Explorer/);

    // An unknown route is canonicalised in place to the default OSI view.
    await page.goto('/#/not-a-real-view');
    await expect(page).toHaveURL(/#\/osi$/);
    await expect(page).toHaveTitle(/Pila OSI — OSI Cyber Explorer/);
  });

  test('browser Back and Forward restore the previous view', async ({ page }) => {
    await openApp(page);

    // SPA navigation via the quick search pushes a history entry.
    await page.keyboard.press('Control+k');
    await page.getByRole('textbox', { name: 'Cerca un laboratorio' }).fill('vlsm');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#\/fundamentals$/);

    await page.goBack();
    await expect(page).toHaveURL(/#\/osi$/);
    await expect(page.getByRole('heading', { name: 'Simulatore di pacchetti' })).toBeVisible();

    await page.goForward();
    await expect(page).toHaveURL(/#\/fundamentals$/);
    await expect(page.getByRole('heading', { name: 'Pianificatore VLSM' })).toBeVisible();
  });
});

test.describe('navigation at phone width', () => {
  test.use({ viewport: { width: 390, height: 780 } });

  test('a lab is reachable from the compact menu', async ({ page }) => {
    await openApp(page);

    // The interactive-labs group uses its short label on narrow viewports.
    await page.getByRole('button', { name: /Interattivi/ }).click();
    await page
      .locator('#nav-panel-interactive')
      .getByRole('link', { name: /Attacco & Difesa/ })
      .click();

    await expect(page).toHaveURL(/#\/attacklab$/);
    await expect(page).toHaveTitle(/Attacco & Difesa — OSI Cyber Explorer/);
  });
});

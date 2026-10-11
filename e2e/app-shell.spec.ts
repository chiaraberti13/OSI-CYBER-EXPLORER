import { test, expect, type Page } from '@playwright/test';
import { VIEW_ORDER } from '../src/content/viewRegistry';

/**
 * ENG-12 smoke tests for the application shell: first load, the language toggle,
 * the Ctrl/Cmd+K quick search, hash-based deep links and history, and that the
 * navigation stays usable at a phone width. These exercise the chrome that every
 * lab depends on, so a regression here breaks the whole app.
 */

async function openApp(page: Page) {
  await page.goto('/');
  // The view heading proves both the shell and the default lazy route mounted.
  await expect(page.getByRole('heading', { level: 1, name: 'Pila OSI' })).toBeVisible();
}

test.describe('application shell', () => {
  test('loads the default OSI lab', async ({ page }) => {
    await openApp(page);

    // The default view is the OSI stack with its packet simulator (Italian default).
    await expect(page.getByRole('heading', { name: 'Simulatore di pacchetti' })).toBeVisible();
    await expect(page).toHaveTitle(/Pila OSI — OSI Cyber Explorer/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'it');
  });

  test('loads the guide artwork locally without third-party requests (UX-11)', async ({ page }) => {
    const thirdPartyRequests: string[] = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.origin !== 'http://127.0.0.1:4173') thirdPartyRequests.push(url.href);
    });

    await openApp(page);
    await page.getByRole('button', { name: 'Apri la guida' }).click();

    const dialog = page.getByRole('dialog', { name: 'Manuale & Repository di Rete' });
    const banner = dialog.locator('img[alt=""]');
    await expect(banner).toBeVisible();
    await expect
      .poll(() => banner.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0))
      .toBe(true);

    const source = await banner.getAttribute('src');
    expect(source).toMatch(/^data:image\/svg\+xml,/);
    expect(thirdPartyRequests).toEqual([]);
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
    const search = page.getByRole('combobox', { name: 'Cerca un laboratorio' });
    await expect(search).toBeFocused();

    // "vlsm" only matches the Network fundamentals lab's keywords.
    await search.fill('vlsm');
    const listbox = page.getByRole('listbox', { name: 'Risultati della ricerca' });
    await expect(listbox.getByRole('option')).toHaveCount(1);
    // The combobox points at the single active option without moving DOM focus.
    await expect(search).toHaveAttribute('aria-expanded', 'true');
    const optionId = await listbox.getByRole('option').getAttribute('id');
    await expect(search).toHaveAttribute('aria-activedescendant', optionId ?? '');
    await expect(search).toBeFocused();

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

  test('the study manual opens, reveals a solution and links into a lab (EDU-01)', async ({ page }) => {
    await page.goto('/#/manual');
    await expect(page).toHaveTitle(/Manuale di studio — OSI Cyber Explorer/);
    await expect(page.getByRole('heading', { level: 1, name: 'Manuale di studio' })).toBeVisible();

    // A guided-lab solution is disclosed on demand.
    const disclosure = page.getByText('Mostra la soluzione commentata').first();
    await disclosure.click();
    await expect(page.getByText('Soluzione commentata').first()).toBeVisible();

    // A guided lab links into the OSI stack lab.
    await page
      .getByRole('link', { name: /Apri il laboratorio/ })
      .first()
      .click();
    await expect(page).toHaveURL(/#\/(osi|ports)$/);
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
    await page.getByRole('combobox', { name: 'Cerca un laboratorio' }).fill('vlsm');
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

test.describe('document heading outline', () => {
  test('every registered view has exactly one view-owned h1 (UX-09)', async ({ page }) => {
    await page.goto('/');

    for (const view of VIEW_ORDER) {
      await page.evaluate((nextView) => {
        window.location.hash = `/${nextView}`;
      }, view);
      await expect(page).toHaveURL(new RegExp(`#/${view}$`));

      const headings = page.locator('main h1, main h2, main h3, main h4, main h5, main h6');
      await expect(headings.first(), `${view}: the first main heading must be h1`).toHaveJSProperty('tagName', 'H1');
      await expect(page.locator('main h1'), `${view}: the view must own one main title`).toHaveCount(1);
      await expect(page.locator('body > div h1'), `${view}: the document must contain one h1`).toHaveCount(1);
    }
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

  test('exposes an overflow scroll affordance for the group tabs (UX-07)', async ({ page }) => {
    await openApp(page);

    // At phone width the group tabs overflow, so the right scroll button is shown
    // while the left one is not (nothing is hidden to the left yet).
    const scrollRight = page.getByRole('button', { name: 'Scorri i laboratori verso destra' });
    const scrollLeft = page.getByRole('button', { name: 'Scorri i laboratori verso sinistra' });
    await expect(scrollRight).toBeVisible();
    await expect(scrollLeft).toHaveCount(0);

    // Using it reveals the content hidden to the right, so the left affordance appears.
    await scrollRight.click();
    await expect(scrollLeft).toBeVisible();
  });
});

test.describe('WCAG reflow and touch targets', () => {
  test.use({ viewport: { width: 320, height: 800 } });

  test('keeps primary controls at least 44 px and avoids page overflow (UX-08)', async ({ page }) => {
    await openApp(page);

    // A 320 CSS-pixel viewport is also the WCAG 1.4.10 reference layout for a
    // 1280 px desktop viewport at 400% browser zoom (and is stricter than 200%).
    const primaryControls = [
      page.getByRole('button', { name: 'Apri la guida' }),
      page.getByRole('button', { name: 'English' }),
      page.getByRole('button', { name: 'Italiano' }),
      page.getByRole('button', { name: 'Copia il link di questo laboratorio' }),
      page.getByRole('button', { name: 'Cerca un laboratorio' }),
      page.getByRole('button', { name: 'Velocità 0.5x' }),
      page.getByRole('button', { name: 'Velocità 1x' }),
      page.getByRole('button', { name: 'Velocità 2x' }),
      page.getByRole('button', { name: 'Avvia Simulazione' }),
      page.getByRole('button', { name: 'Reset' }),
      page.getByLabel('Seleziona il protocollo da simulare')
    ];

    for (const control of primaryControls) {
      await expect(control).toBeVisible();
      const box = await control.boundingBox();
      expect(box, 'control must have a measurable box').not.toBeNull();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }

    const undersizedControls = await page
      .locator('button:visible, select:visible, textarea:visible, input:visible')
      .evaluateAll((controls) =>
        controls.flatMap((control) => {
          const rect = control.getBoundingClientRect();
          return rect.width < 44 || rect.height < 44
            ? [
                `${control.tagName.toLowerCase()}[${control.getAttribute('aria-label') ?? control.textContent?.trim() ?? ''}]: ${rect.width}×${rect.height}`
              ]
            : [];
        })
      );
    expect(undersizedControls).toEqual([]);

    const microText = await page
      .locator('.text-\\[8px\\], .text-\\[9px\\], .text-\\[10px\\], .text-\\[11px\\], .eyebrow')
      .evaluateAll((nodes) =>
        nodes.map((node) => Number.parseFloat(getComputedStyle(node).fontSize)).filter((size) => size < 12)
      );
    expect(microText).toEqual([]);

    const reflow = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth
    }));
    expect(reflow.content).toBeLessThanOrEqual(reflow.viewport);
  });
});

test.describe('glossary on a short landscape viewport', () => {
  test.use({ viewport: { width: 740, height: 320 } });

  test('keeps the glossary bounded and scrolls terms internally (UX-10)', async ({ page }) => {
    await page.goto('/#/glossary');

    const glossary = page.getByRole('region', { name: 'Glossario di Rete' });
    const terms = page.getByTestId('glossary-terms-scroll');
    await expect(glossary).toBeVisible();
    await expect(terms).toBeVisible();

    const layout = await glossary.evaluate((section) => {
      const scrollRegion = section.querySelector<HTMLElement>('[data-testid="glossary-terms-scroll"]');
      if (!scrollRegion) throw new Error('Glossary scroll region not found');

      return {
        sectionHeight: section.getBoundingClientRect().height,
        sectionOverflow: getComputedStyle(section).overflow,
        listClientHeight: scrollRegion.clientHeight,
        listScrollHeight: scrollRegion.scrollHeight,
        listOverflowY: getComputedStyle(scrollRegion).overflowY,
        pageClientWidth: document.documentElement.clientWidth,
        pageScrollWidth: document.documentElement.scrollWidth
      };
    });

    // The previous 600 px minimum was almost twice this viewport's height.
    expect(layout.sectionHeight).toBeLessThan(320);
    expect(layout.sectionOverflow).toBe('hidden');
    expect(layout.listOverflowY).toBe('auto');
    expect(layout.listScrollHeight).toBeGreaterThan(layout.listClientHeight);
    expect(layout.pageScrollWidth).toBeLessThanOrEqual(layout.pageClientWidth);

    await terms.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    await expect.poll(() => terms.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  });
});

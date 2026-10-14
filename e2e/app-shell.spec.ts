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
  // The landing heading proves both the shell and the default lazy route mounted.
  await expect(page.getByRole('heading', { level: 1, name: 'Mappa didattica integrata' })).toBeVisible();
}

test.describe('application shell', () => {
  test('opens the study path as the default landing and offers a clear next step', async ({ page }) => {
    await openApp(page);

    await expect(page.getByRole('heading', { name: 'Da dove iniziare' })).toBeVisible();
    const continueLink = page.getByRole('link', { name: 'Continua con il Manuale di studio' });
    await expect(continueLink).toHaveAttribute('href', '#/manual');
    await continueLink.click();
    await expect(page).toHaveURL(/#\/manual$/);
    await expect(page.getByRole('heading', { name: 'Manuale di studio' })).toBeVisible();
    await expect(page).toHaveTitle(/Manuale di studio — OSI Cyber Explorer/);
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
    await expect(page.getByRole('heading', { name: 'Where to start' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Continue with the Study Manual' })).toHaveAttribute(
      'href',
      '#/manual'
    );

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
    await expect(page).toHaveURL(/#\/curriculum$/);
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
      .getByRole('link', { name: /Fai l’esercizio guidato/ })
      .first()
      .click();
    await expect(page).toHaveURL(/#\/(osi|ports)$/);
  });

  test('the study manual navigation is grouped by CCNA domain (EDU-STRUCT-02)', async ({ page }) => {
    await page.goto('/#/manual');
    const nav = page.getByRole('navigation', { name: 'Capitoli del manuale' });
    await expect(nav.getByRole('group', { name: 'CCNA 1.0 · Fondamenti di rete' })).toBeVisible();
    await expect(nav.getByRole('group', { name: 'CCNA 3.0 · Connettività IP' })).toBeVisible();
    await expect(nav.getByRole('group', { name: 'Estensione' })).toBeVisible();
  });

  test('the manual keeps domain and chapter context below the sticky navigation (UX-20)', async ({ page }) => {
    await page.goto('/#/manual');
    const context = page.getByRole('region', { name: 'Contesto del capitolo' });

    await expect(context).toContainText('CCNA 1.0 · Fondamenti di rete');
    await expect(context).toContainText('Il modello OSI e l’incapsulamento');
    await expect(context.locator('h1, h2, h3, h4, h5, h6')).toHaveCount(0);

    // Scroll within a long chapter: the context bar stays immediately below the
    // 56 px app header and 48 px lab navigation instead of leaving the viewport.
    await page.getByRole('heading', { level: 3 }).nth(2).scrollIntoViewIfNeeded();
    await expect.poll(async () => Math.round((await context.boundingBox())?.y ?? -1)).toBe(104);

    await page
      .getByRole('navigation', { name: 'In questa pagina' })
      .getByRole('button', { name: /Incapsulamento e decapsulamento/ })
      .click();
    const topicHeading = page.getByRole('heading', { level: 3, name: /Incapsulamento e decapsulamento/ });
    await expect
      .poll(async () => {
        const contextBox = await context.boundingBox();
        const headingBox = await topicHeading.boundingBox();
        return contextBox && headingBox ? Math.round(headingBox.y - (contextBox.y + contextBox.height)) : -1;
      })
      .toBeGreaterThanOrEqual(8);

    await page
      .getByRole('navigation', { name: 'Capitoli del manuale' })
      .getByRole('button', { name: /Ethernet/ })
      .click();
    await expect(context).toContainText('Ethernet, switching e tabella CAM');
  });

  test('chapter completion persists locally, aggregates by domain, and resets (UX-21)', async ({ page }) => {
    await page.goto('/#/manual');
    await expect(page.getByLabel('Progresso capitoli: 0/28', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Segna come completato' }).click();
    await expect(page.getByLabel('Progresso capitoli: 1/28', { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('button', { name: 'Segna come da completare' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );

    // Per-domain aggregation lives in the manual's own chapter navigation (IA-01a); the
    // overview no longer duplicates the chapter index (IA-01b).
    await expect(page.getByLabel('CCNA 1.0 · Fondamenti di rete · Progresso capitoli: 1/5')).toBeVisible();

    await page.getByRole('button', { name: 'Azzera progresso' }).click();
    await page.reload();
    await expect(page.getByLabel('Progresso capitoli: 0/28', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Segna come completato' })).toHaveAttribute('aria-pressed', 'false');
  });

  test('deep links, reload and invalid routes behave predictably', async ({ page }) => {
    // A deep link opens its destination directly.
    await page.goto('/#/ports');
    await expect(page).toHaveTitle(/Porte & Protocolli — OSI Cyber Explorer/);

    // Reload keeps the same view (routing reads the hash before React renders).
    await page.reload();
    await expect(page).toHaveTitle(/Porte & Protocolli — OSI Cyber Explorer/);

    // An unknown route is canonicalised in place to the default study-path landing.
    await page.goto('/#/not-a-real-view');
    await expect(page).toHaveURL(/#\/curriculum$/);
    await expect(page).toHaveTitle(/Mappa CCNA — OSI Cyber Explorer/);
  });

  test('browser Back and Forward restore the previous view', async ({ page }) => {
    await openApp(page);

    // SPA navigation via the quick search pushes a history entry.
    await page.keyboard.press('Control+k');
    await page.getByRole('combobox', { name: 'Cerca un laboratorio' }).fill('vlsm');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#\/fundamentals$/);

    await page.goBack();
    await expect(page).toHaveURL(/#\/curriculum$/);
    await expect(page.getByRole('heading', { name: 'Mappa didattica integrata' })).toBeVisible();

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
    await page.goto('/#/osi');

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
      // Chromium can expose a declared 44 px box as 43.99994 because of
      // device-scale floating-point conversion. Normalising to 0.01 CSS px
      // avoids that transport noise without accepting a genuine 43.99 px target.
      expect(Math.round(box!.width * 100) / 100).toBeGreaterThanOrEqual(44);
      expect(Math.round(box!.height * 100) / 100).toBeGreaterThanOrEqual(44);
    }

    const undersizedControls = await page
      .locator('button:visible, select:visible, textarea:visible, input:visible')
      .evaluateAll((controls) =>
        controls.flatMap((control) => {
          const rect = control.getBoundingClientRect();
          const width = Math.round(rect.width * 100) / 100;
          const height = Math.round(rect.height * 100) / 100;
          return width < 44 || height < 44
            ? [
                `${control.tagName.toLowerCase()}[${control.getAttribute('aria-label') ?? control.textContent?.trim() ?? ''}]: ${width}×${height}`
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

test.describe('large collection findability', () => {
  test('filters, counts, highlights, and resets glossary and port results (UX-15)', async ({ page }) => {
    await page.goto('/#/glossary');
    const glossary = page.getByRole('region', { name: 'Glossario di Rete' });
    const glossarySearch = glossary.getByRole('textbox', {
      name: 'Cerca termini o definizioni del glossario'
    });
    await glossarySearch.fill('ipsec');
    await glossary.getByRole('combobox', { name: 'Cerca in' }).selectOption('term');
    await expect(glossary.getByRole('status')).toContainText(/\d+ di \d+ termin/);
    await expect(glossary.locator('mark').filter({ hasText: /ipsec/i }).first()).toBeVisible();
    await glossary.getByRole('button', { name: 'Azzera filtri' }).click();
    await expect(glossarySearch).toHaveValue('');
    await expect(glossary.getByRole('combobox', { name: 'Cerca in' })).toHaveValue('all');

    await page.goto('/#/ports');
    const main = page.getByRole('main');
    const portSearch = main.getByRole('textbox', { name: 'Cerca porte e servizi di rete' });
    await portSearch.fill('8080');
    await expect(main.getByRole('status')).toContainText(/\d+ di \d+ servizi/);
    await expect(main.locator('mark').filter({ hasText: '8080' }).first()).toBeVisible();
    await main.getByRole('combobox', { name: 'Profilo di sicurezza' }).selectOption('review');
    await main.getByRole('button', { name: 'Azzera filtri' }).click();
    await expect(portSearch).toHaveValue('');
    await expect(main.getByRole('combobox', { name: 'Profilo di sicurezza' })).toHaveValue('all');
  });
});

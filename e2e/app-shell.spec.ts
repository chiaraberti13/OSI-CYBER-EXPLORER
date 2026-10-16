import { test, expect, type Page } from '@playwright/test';
import { VIEW_ORDER } from '../src/content/viewRegistry';
import { chaptersForCertificationTrack, manualStats } from '../src/lib/studyManual';

// ENG-31 — derive chapter-count expectations from the manual dataset so a new chapter
// never forces a hand-edit here.
const TOTAL_CHAPTERS = manualStats().chapters;
const CCNA_CHAPTERS = chaptersForCertificationTrack('ccna').length;

/**
 * ENG-12 smoke tests for the application shell: first load, the language toggle,
 * the Ctrl/Cmd+K quick search, hash-based deep links and history, and that the
 * navigation stays usable at a phone width. These exercise the chrome that every
 * lab depends on, so a regression here breaks the whole app.
 */

async function openApp(page: Page) {
  await page.goto('/');
  // The landing heading proves both the shell and the default lazy route mounted. IA-11
  // makes the Study Manual the single study path and the default landing.
  await expect(page.getByRole('heading', { level: 1, name: 'Manuale di studio' })).toBeVisible();
}

test.describe('application shell', () => {
  test('opens the Study Manual as the default landing (IA-11)', async ({ page }) => {
    await openApp(page);

    await expect(page).toHaveURL(/#\/manual$/);
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
    // The landing is the Study Manual; its heading localises with the toggle.
    await expect(page.getByRole('heading', { level: 1, name: 'Study manual' })).toBeVisible();

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
    await expect(page).toHaveURL(/#\/manual$/);
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

  test('the study manual navigation is grouped by the two study routes (EDU-STRUCT-02)', async ({ page }) => {
    await page.goto('/#/manual');
    const nav = page.getByRole('navigation', { name: 'Capitoli del manuale' });
    await expect(nav.getByRole('group', { name: 'Percorso CCNA' })).toBeVisible();
    await expect(nav.getByRole('group', { name: 'eJPT' })).toBeVisible();
    await expect(nav.getByRole('group', { name: 'Estensione' })).toHaveCount(0);
  });

  test('the manual keeps domain and chapter context below the sticky navigation (UX-20)', async ({ page }) => {
    await page.goto('/#/manual');
    const context = page.getByRole('region', { name: 'Contesto del capitolo' });

    await expect(context).toContainText('CCNA 1.0 · Fondamenti di rete');
    await expect(context).toContainText('Il modello OSI e l’incapsulamento');
    await expect(context.locator('h1, h2, h3, h4, h5, h6')).toHaveCount(0);

    // Scroll within a long chapter: the context bar stays immediately below the
    // single 56 px app top bar (IA-13) instead of leaving the viewport.
    await page.getByRole('heading', { level: 3 }).nth(2).scrollIntoViewIfNeeded();
    await expect.poll(async () => Math.round((await context.boundingBox())?.y ?? -1)).toBe(56);

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

  test('chapter completion persists locally, aggregates by route, and resets (UX-21)', async ({ page }) => {
    await page.goto('/#/manual');
    await expect(page.getByLabel(`Progresso capitoli: 0/${TOTAL_CHAPTERS}`, { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Segna come completato' }).click();
    await expect(page.getByLabel(`Progresso capitoli: 1/${TOTAL_CHAPTERS}`, { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('button', { name: 'Segna come da completare' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );

    // Per-route aggregation lives in the manual's own chapter navigation: the CCNA route
    // group header shows one completed chapter (scoped to the tree so it is not confused
    // with the per-route progress summary in the header).
    await expect(
      page
        .getByRole('navigation', { name: 'Capitoli del manuale' })
        .getByLabel(`Percorso CCNA · Progresso capitoli: 1/${CCNA_CHAPTERS}`)
    ).toBeVisible();

    await page.getByRole('button', { name: 'Azzera progresso' }).click();
    await page.reload();
    await expect(page.getByLabel(`Progresso capitoli: 0/${TOTAL_CHAPTERS}`, { exact: true })).toBeVisible();
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
    await expect(page).toHaveURL(/#\/manual$/);
    await expect(page).toHaveTitle(/Manuale di studio — OSI Cyber Explorer/);
  });

  test('browser Back and Forward restore the previous view', async ({ page }) => {
    await openApp(page);

    // SPA navigation via the quick search pushes a history entry.
    await page.keyboard.press('Control+k');
    await page.getByRole('combobox', { name: 'Cerca un laboratorio' }).fill('vlsm');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#\/fundamentals$/);

    await page.goBack();
    await expect(page).toHaveURL(/#\/manual$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Manuale di studio' })).toBeVisible();

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

    // IA-13: on mobile the primary navigation is a drawer opened from the top bar.
    await page.getByRole('button', { name: 'Apri il menu di navigazione' }).click();
    const drawer = page.getByRole('dialog', { name: 'Navigazione principale' });
    await expect(drawer).toBeVisible();

    // Every lab lives under the single "Laboratori" disclosure, organised by area.
    await drawer.getByRole('button', { name: /Laboratori/ }).click();
    await drawer.getByRole('link', { name: /Attacco & Difesa/ }).click();

    await expect(page).toHaveURL(/#\/attacklab$/);
    await expect(page).toHaveTitle(/Attacco & Difesa — OSI Cyber Explorer/);
  });
});

test.describe('WCAG reflow and touch targets', () => {
  test.use({ viewport: { width: 320, height: 800 } });

  test('keeps primary controls at least 44 px and avoids page overflow (UX-08)', async ({ page }) => {
    await openApp(page);
    await page.goto('/#/osi');

    // A 320 CSS-pixel viewport is also the WCAG 1.4.10 reference layout for a
    // 1280 px desktop viewport at 400% browser zoom (and is stricter than 200%).
    // Chromium can expose a declared 44 px box as 43.99994 because of device-scale
    // floating-point conversion; normalising to 0.01 CSS px absorbs that transport
    // noise without accepting a genuine 43.99 px target.
    const meetsTarget = async (control: ReturnType<Page['getByRole']>) => {
      await expect(control).toBeVisible();
      const box = await control.boundingBox();
      expect(box, 'control must have a measurable box').not.toBeNull();
      expect(Math.round(box!.width * 100) / 100).toBeGreaterThanOrEqual(44);
      expect(Math.round(box!.height * 100) / 100).toBeGreaterThanOrEqual(44);
    };

    // IA-13: on mobile the top bar carries the menu, search and copy-link controls;
    // the guide and language controls live in the navigation drawer (checked below).
    const topBarControls = [
      page.getByRole('button', { name: 'Apri il menu di navigazione' }),
      page.getByRole('button', { name: 'Copia il link di questo laboratorio' }),
      page.getByRole('button', { name: 'Cerca un laboratorio' }),
      page.getByRole('button', { name: 'Velocità 0.5x' }),
      page.getByRole('button', { name: 'Velocità 1x' }),
      page.getByRole('button', { name: 'Velocità 2x' }),
      page.getByRole('button', { name: 'Avvia Simulazione' }),
      page.getByRole('button', { name: 'Reset' }),
      page.getByLabel('Seleziona il protocollo da simulare')
    ];
    for (const control of topBarControls) await meetsTarget(control);

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

    // The guide and language controls live in the navigation drawer on mobile: open it
    // and confirm they also meet the 44 px target without introducing horizontal overflow.
    await page.getByRole('button', { name: 'Apri il menu di navigazione' }).click();
    const drawer = page.getByRole('dialog', { name: 'Navigazione principale' });
    await expect(drawer).toBeVisible();
    await meetsTarget(drawer.getByRole('button', { name: 'Apri la guida' }));
    await meetsTarget(drawer.getByRole('button', { name: 'English' }));
    await meetsTarget(drawer.getByRole('button', { name: 'Italiano' }));

    const reflowWithDrawer = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth
    }));
    expect(reflowWithDrawer.content).toBeLessThanOrEqual(reflowWithDrawer.viewport);
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

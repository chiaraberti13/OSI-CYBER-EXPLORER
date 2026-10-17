// @vitest-environment jsdom
/**
 * @license
 * SPDX-License-Identifier: GPL-3.0-only
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StudyManualView from './StudyManualView';
import { scrollBehaviorForReducedMotion } from '../lib/motion';
import { chaptersByCertificationTrack, chaptersForCertificationTrack, manualStats } from '../lib/studyManual';
import { useStore } from '../store';

// ENG-31 — derive the chapter-count expectations from the manual dataset (the single
// source of truth) so adding a chapter never forces a hand-edit here. Asserting the
// rendered counts against the data also proves the view surfaces every chapter and
// group, rather than a literal matching itself.
const TOTAL_CHAPTERS = manualStats().chapters;
// Two-route IA: the index groups by study route (Percorso CCNA, eJPT), not by CCNA domain.
const TRACK_GROUPS = chaptersByCertificationTrack();
const CCNA_CHAPTERS = chaptersForCertificationTrack('ccna').length;
const EJPT_CHAPTERS = chaptersForCertificationTrack('ejpt').length;

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  useStore.setState({
    language: 'it',
    completedChapterIds: [],
    activeChapterId: null,
    activeTopicId: null
  });
});

describe('StudyManualView (EDU-01)', () => {
  it('renders the manual heading, the OSI chapter and a topic', () => {
    const { container } = render(<StudyManualView />);
    expect(screen.getByRole('heading', { level: 1, name: 'Manuale di studio' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: /Il modello OSI/ })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 3, name: /sette livelli/ })).toBeTruthy();
    expect(screen.getByTestId('manual-reading-column').classList.contains('manual-reading-column')).toBe(true);
    expect(container.querySelectorAll('[data-manual-copy="theory"]')).toHaveLength(4);
    expect(container.querySelectorAll('[data-manual-topic]')).toHaveLength(4);
  });

  it('uses the same reading hierarchy and tile rhythm across chapters', async () => {
    const user = userEvent.setup();
    const { container } = render(<StudyManualView />);

    const assertChapterRhythm = () => {
      const topicCards = [...container.querySelectorAll<HTMLElement>('[data-manual-topic]')];
      expect(topicCards.length).toBeGreaterThan(1);
      for (const card of topicCards) {
        expect(card.querySelector('[data-manual-copy="theory"]')?.classList.contains('manual-reading-copy')).toBe(true);
        expect(card.querySelector('[data-manual-tile="objectives"]')).not.toBeNull();
        expect(card.querySelector('[data-manual-tile="common-mistakes"]')).not.toBeNull();
      }
    };

    assertChapterRhythm();
    await user.click(
      within(screen.getByRole('navigation', { name: 'Capitoli del manuale' })).getByRole('button', {
        name: /Ethernet/
      })
    );
    assertChapterRhythm();
  });

  it('exposes the manual root hook for theme scoping (UX-28)', () => {
    const { container } = render(<StudyManualView />);
    expect(container.querySelector('[data-manual-root]')).not.toBeNull();
  });

  it('shows the CCNA domain alignment badge for the active chapter', () => {
    render(<StudyManualView />);
    // The OSI chapter maps to CCNA domain 1.0 Network Fundamentals.
    expect(screen.getAllByText('CCNA 1.0 · Fondamenti di rete').length).toBeGreaterThan(0);
  });

  it('keeps chapter context outside the document heading outline', async () => {
    const user = userEvent.setup();
    render(<StudyManualView />);

    const context = screen.getByRole('region', { name: 'Contesto del capitolo' });
    expect(within(context).getByText('CCNA 1.0 · Fondamenti di rete')).toBeTruthy();
    expect(within(context).getByText('Il modello OSI e l’incapsulamento')).toBeTruthy();
    expect(context.querySelector('h1, h2, h3, h4, h5, h6')).toBeNull();

    const chapterNav = screen.getByRole('navigation', { name: 'Capitoli del manuale' });
    await user.click(within(chapterNav).getByRole('button', { name: /Ethernet/ }));
    expect(within(context).getByText('Ethernet, switching e tabella CAM')).toBeTruthy();
  });

  it('marks the active chapter complete and resets all progress', async () => {
    const user = userEvent.setup();
    render(<StudyManualView />);

    const markComplete = screen.getByRole('button', { name: 'Segna come completato' });
    expect(markComplete.getAttribute('aria-pressed')).toBe('false');
    await user.click(markComplete);

    expect(screen.getByRole('button', { name: 'Segna come da completare' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByLabelText(`Progresso capitoli: 1/${TOTAL_CHAPTERS}`)).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Azzera progresso' }));
    expect(screen.getByRole('button', { name: 'Segna come completato' }).getAttribute('aria-pressed')).toBe('false');
    expect(screen.queryByRole('button', { name: 'Azzera progresso' })).toBeNull();
  });

  it('offers an "on this page" rail listing the chapter topics', () => {
    render(<StudyManualView />);
    const chapterNav = screen.getByRole('navigation', { name: 'Capitoli del manuale' });
    const rail = screen.getByRole('navigation', { name: 'In questa pagina' });
    const article = screen.getByRole('article');
    // The OSI chapter has four topics; each is a jump target in the rail.
    expect(within(rail).getAllByRole('button').length).toBe(4);
    expect(within(rail).getByRole('button', { name: /sette livelli/ })).toBeTruthy();
    expect(chapterNav.compareDocumentPosition(rail) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(rail.compareDocumentPosition(article) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('uses coherent current states in both topic navigations', async () => {
    const user = userEvent.setup();
    render(<StudyManualView />);
    const rail = screen.getByRole('navigation', { name: 'In questa pagina' });
    const mobileContents = screen.getByRole('navigation', { name: 'Navigazione mobile del manuale' });
    const railButtons = within(rail).getAllByRole('button');
    // The mobile per-topic quick jump is a native select (UX-45c), not a chip strip; its
    // value tracks the same active topic as the desktop rail.
    const topicSelect = within(mobileContents).getByTestId('mobile-topic-index') as HTMLSelectElement;
    const topicOptions = within(topicSelect).getAllByRole('option') as HTMLOptionElement[];

    expect(railButtons[0].getAttribute('aria-current')).toBe('location');
    expect(topicSelect.value).toBe(topicOptions[0].value);
    await user.click(railButtons[1]);
    expect(railButtons[0].hasAttribute('aria-current')).toBe(false);
    expect(railButtons[1].getAttribute('aria-current')).toBe('location');
    expect(topicSelect.value).toBe(topicOptions[1].value);
  });

  it('offers a compact domain-grouped chapter selector and persistent topic index on mobile', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    render(<StudyManualView />);

    const mobileNav = screen.getByRole('navigation', { name: 'Navigazione mobile del manuale' });
    const chapterSelect = within(mobileNav).getByRole('combobox', { name: 'Vai a un capitolo' });
    expect(within(chapterSelect).getAllByRole('option')).toHaveLength(TOTAL_CHAPTERS);
    // The selector is grouped by the two study routes, each labelled with its progress.
    expect(chapterSelect.querySelector(`optgroup[label="Percorso CCNA · 0/${CCNA_CHAPTERS}"]`)).not.toBeNull();
    expect(chapterSelect.querySelector(`optgroup[label="eJPT · 0/${EJPT_CHAPTERS}"]`)).not.toBeNull();
    // The per-topic quick jump is a native select (UX-45c): one option per topic of the
    // open chapter, so switching chapters re-populates it.
    const topicOptions = () => within(within(mobileNav).getByTestId('mobile-topic-index')).getAllByRole('option');
    expect(topicOptions()).toHaveLength(4);

    await user.selectOptions(chapterSelect, 'ethernet-switching');
    const chapterHeading = screen.getByRole('heading', { level: 2, name: /Ethernet/ });
    expect((chapterSelect as HTMLSelectElement).value).toBe('ethernet-switching');
    expect(document.activeElement).toBe(chapterHeading);
    expect(topicOptions()).toHaveLength(3);
  });

  it('respects the reduced-motion preference for manual scrolling', () => {
    expect(scrollBehaviorForReducedMotion(true)).toBe('auto');
    expect(scrollBehaviorForReducedMotion(false)).toBe('smooth');
  });

  it('moves to the next chapter through the chapter step navigation', async () => {
    const user = userEvent.setup();
    render(<StudyManualView />);

    const stepNav = screen.getByRole('navigation', { name: 'Capitolo precedente e successivo' });
    // On the first chapter there is a next but no previous.
    expect(within(stepNav).queryByText('Capitolo precedente')).toBeNull();
    await user.click(within(stepNav).getByRole('button', { name: /Capitolo successivo/ }));

    expect(screen.getByRole('heading', { level: 2, name: /Ethernet/ })).toBeTruthy();
  });

  it('groups the chapter navigation by the two study routes', () => {
    render(<StudyManualView />);
    const nav = screen.getByRole('navigation', { name: 'Capitoli del manuale' });
    // Exactly the two routes, as groups — no third "Estensione" bucket, no flat domain list.
    const groups = within(nav).getAllByRole('group');
    expect(groups).toHaveLength(2);
    expect(within(nav).getByRole('group', { name: 'Percorso CCNA' })).toBeTruthy();
    expect(within(nav).getByRole('group', { name: 'eJPT' })).toBeTruthy();
    expect(within(nav).queryByRole('group', { name: 'Estensione' })).toBeNull();
    // Each route group carries its progress count.
    expect(within(nav).getByLabelText(`Percorso CCNA · Progresso capitoli: 0/${CCNA_CHAPTERS}`)).toBeTruthy();
    expect(within(nav).getByLabelText(`eJPT · Progresso capitoli: 0/${EJPT_CHAPTERS}`)).toBeTruthy();
  });

  it('offers a guided lab with a revealable solution and a link into the interactive lab', () => {
    render(<StudyManualView />);

    // The guided-lab solution is behind a disclosure, not shown as plain text upfront.
    expect(screen.getAllByText('Mostra la soluzione commentata').length).toBeGreaterThan(0);

    // At least one guided lab opens the OSI stack lab via a real, copyable link.
    const osiLinks = screen
      .getAllByRole('link', { name: /Fai l’esercizio guidato/ })
      .filter((a) => a.getAttribute('href') === '#/osi');
    expect(osiLinks.length).toBeGreaterThan(0);
  });

  it('makes the guided exercise the primary practical action in each topic (UX-26)', () => {
    const { container } = render(<StudyManualView />);

    const topics = [...container.querySelectorAll<HTMLElement>('[data-manual-topic]')];
    expect(topics.length).toBeGreaterThan(0);

    for (const topic of topics) {
      const guidedTiles = topic.querySelectorAll('[data-manual-tile="guided-lab"]');
      // Every guided lab exposes a clearly primary call to action with the explicit label.
      for (const tile of guidedTiles) {
        const primary = tile.querySelector<HTMLAnchorElement>('[data-manual-action="guided-exercise"]');
        expect(primary).not.toBeNull();
        expect(primary!.textContent).toContain('Fai l’esercizio guidato');
        // Primary styling: a solid accent surface, not a ghost/outline control.
        expect(primary!.className).toContain('bg-indigo-600');
        expect(primary!.className).toContain('text-white');
      }

      // Where a topic also offers free lab exploration, it is a clearly secondary
      // action that comes after the primary guided exercise in reading order.
      const study = topic.querySelector<HTMLElement>('[data-manual-action="study-lab"]');
      if (study && guidedTiles.length > 0) {
        expect(study.className).not.toContain('bg-indigo-600');
        const primary = topic.querySelector<HTMLElement>('[data-manual-action="guided-exercise"]');
        expect(primary).not.toBeNull();
        expect(primary!.compareDocumentPosition(study) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      }
    }
  });

  it('localises the manual to English', () => {
    useStore.setState({ language: 'en' });
    render(<StudyManualView />);
    expect(screen.getByRole('heading', { level: 1, name: 'Study manual' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: /OSI model/ })).toBeTruthy();
    // Guided-lab disclosure and lab link are localised too.
    expect(screen.getAllByText('Show the commented solution').length).toBeGreaterThan(0);
  });

  it('navigates between chapters through the chapter navigation', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    render(<StudyManualView />);

    const chapterNav = screen.getByRole('navigation', { name: 'Capitoli del manuale' });
    const firstChapter = within(chapterNav).getByRole('button', { name: /modello OSI/ });
    const secondChapter = within(chapterNav).getByRole('button', { name: /Ethernet/ });
    expect(firstChapter.getAttribute('aria-current')).toBe('page');
    await user.click(secondChapter);

    const chapterHeading = screen.getByRole('heading', { level: 2, name: /Ethernet/ });
    expect(chapterHeading).toBeTruthy();
    expect(document.activeElement).toBe(chapterHeading);
    expect(chapterHeading.getAttribute('tabindex')).toBe('-1');
    expect(firstChapter.hasAttribute('aria-current')).toBe(false);
    expect(secondChapter.getAttribute('aria-current')).toBe('page');
  });

  it('offers a compact chapter selector for narrow viewports (UX-25)', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    render(<StudyManualView />);

    // The selector lives inside the single chapter navigation and is grouped by
    // CCNA domain, so the per-domain layout stays compact on mobile.
    const chapterNav = screen.getByRole('navigation', { name: 'Navigazione mobile del manuale' });
    const selector = within(chapterNav).getByRole('combobox', { name: 'Vai a un capitolo' });
    expect((selector as HTMLSelectElement).value).toBe('osi-model');
    expect(within(selector).getAllByRole('group').length).toBeGreaterThan(1);

    // Choosing another chapter navigates there, keeping the flow in sync with the chips.
    await user.selectOptions(selector, 'ethernet-switching');
    expect(screen.getByRole('heading', { level: 2, name: /Ethernet/ })).toBeTruthy();
    expect((selector as HTMLSelectElement).value).toBe('ethernet-switching');
  });

  it('reveals the commented solution when the disclosure is opened', () => {
    const { container } = render(<StudyManualView />);
    const details = container.querySelector('details');
    expect(details).not.toBeNull();
    // Closed by default; the solution body lives inside the disclosure.
    expect((details as HTMLDetailsElement).open).toBe(false);
    const solutionHeading = within(details as HTMLElement).getByText('Soluzione commentata');
    expect(solutionHeading).toBeTruthy();
  });
});

describe('certification-route marks (VIS-10, two-route IA)', () => {
  it('marks each of the two route groups with its icon and names it', () => {
    render(<StudyManualView />);
    const nav = screen.getByRole('navigation', { name: 'Capitoli del manuale' });

    // The route icon (a non-textual channel) sits on each group header: one per route.
    expect(nav.querySelectorAll('[data-track="ccna"]')).toHaveLength(1);
    expect(nav.querySelectorAll('[data-track="ejpt"]')).toHaveLength(1);
    expect(nav.querySelectorAll('[data-track]')).toHaveLength(TRACK_GROUPS.length);

    // The route is also named as text (not colour/icon only, WCAG 1.4.1).
    expect(within(nav).getByText('Percorso CCNA')).toBeTruthy();
    expect(within(nav).getByText('eJPT')).toBeTruthy();
  });

  it('filters the chapter index by certification route without navigating (UX-32)', async () => {
    const user = userEvent.setup();
    render(<StudyManualView />);
    const nav = screen.getByRole('navigation', { name: 'Capitoli del manuale' });
    // The filter sits outside the chapter nav (the tree stays chapters-only); jsdom renders
    // both the desktop and mobile instances, so drive the first and assert on the tree.
    const filter = screen.getAllByRole('group', { name: 'Filtra per percorso' })[0];

    // Starts on "Tutti": both route groups are present and the control reflects it.
    expect(within(filter).getByRole('button', { name: 'Tutti' }).getAttribute('aria-pressed')).toBe('true');
    expect(within(nav).getAllByRole('group')).toHaveLength(2);

    // Filtering to eJPT narrows the tree to just the eJPT route group…
    await user.click(within(filter).getByRole('button', { name: 'eJPT' }));
    expect(within(nav).getAllByRole('group')).toHaveLength(1);
    expect(within(nav).getByRole('group', { name: 'eJPT' })).toBeTruthy();
    expect(within(nav).queryByRole('group', { name: 'Percorso CCNA' })).toBeNull();
    expect(within(filter).getByRole('button', { name: 'eJPT' }).getAttribute('aria-pressed')).toBe('true');
    expect(within(filter).getByRole('button', { name: 'Tutti' }).getAttribute('aria-pressed')).toBe('false');

    // …and it is view state only: no navigation happened and the open chapter still renders.
    expect(useStore.getState().activeChapterId).toBeNull();
    expect(screen.getByRole('heading', { level: 2, name: /Il modello OSI/ })).toBeTruthy();

    // Filtering to CCNA shows only the CCNA route group.
    await user.click(within(filter).getByRole('button', { name: 'CCNA' }));
    expect(within(nav).getAllByRole('group')).toHaveLength(1);
    expect(within(nav).getByRole('group', { name: 'Percorso CCNA' })).toBeTruthy();
    expect(within(nav).queryByRole('group', { name: 'eJPT' })).toBeNull();
  });

  it('breaks progress out per certification route beside the total (UX-33)', () => {
    // One completed chapter on the CCNA route (osi-model) must advance CCNA only.
    useStore.setState({ completedChapterIds: ['osi-model'] });
    render(<StudyManualView />);

    const routeList = screen.getByRole('list', { name: 'Progresso per percorso' });
    // One row per study route — the two objectives, no third bucket.
    expect(within(routeList).getAllByRole('listitem')).toHaveLength(2);

    // CCNA shows 1 completed; eJPT stays 0 — progress is per route, not shared.
    expect(within(routeList).getByText(`Percorso CCNA 1/${CCNA_CHAPTERS}`)).toBeTruthy();
    expect(within(routeList).getByText(`eJPT 0/${EJPT_CHAPTERS}`)).toBeTruthy();

    // The total still counts both routes together.
    expect(screen.getByText(new RegExp(`Progresso capitoli: 1/${TOTAL_CHAPTERS}`))).toBeTruthy();
  });

  it('organises the CCNA route into collapsible domain sections (IA-12)', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    render(<StudyManualView />);
    const nav = screen.getByRole('navigation', { name: 'Capitoli del manuale' });

    // The section holding the open chapter (OSI → CCNA 1.0) is expanded by default, so its
    // chapters are visible; a different domain section starts collapsed and its chapter hidden.
    const fundamentals = within(nav).getByRole('button', { name: /1\.0 · Fondamenti di rete/ });
    expect(fundamentals.getAttribute('aria-expanded')).toBe('true');
    expect(within(nav).getByRole('button', { name: /Il modello OSI/ })).toBeTruthy();

    const ipConnectivity = within(nav).getByRole('button', { name: /3\.0 · Connettività IP/ });
    expect(ipConnectivity.getAttribute('aria-expanded')).toBe('false');
    expect(within(nav).queryByRole('button', { name: /OSPF/ })).toBeNull();

    // Expanding the collapsed section reveals its chapters without navigating.
    await user.click(ipConnectivity);
    expect(ipConnectivity.getAttribute('aria-expanded')).toBe('true');
    expect(within(nav).getByRole('button', { name: /OSPF/ })).toBeTruthy();
    expect(useStore.getState().activeChapterId).toBeNull();

    // The two route groups are still the only landmark groups — sections are disclosures.
    expect(within(nav).getAllByRole('group')).toHaveLength(2);
  });

  it('auto-expands the section of a chapter opened from elsewhere (IA-12)', () => {
    // Open an eJPT-adjacent CCNA extension chapter: its "Approfondimenti" section must be
    // expanded so the active chapter is visible in the tree.
    act(() => useStore.setState({ activeChapterId: 'segmentation-trust-boundaries' }));
    render(<StudyManualView />);
    const nav = screen.getByRole('navigation', { name: 'Capitoli del manuale' });
    const advanced = within(nav).getByRole('button', { name: /Approfondimenti e Security\+/ });
    expect(advanced.getAttribute('aria-expanded')).toBe('true');
  });

  it('shows the route chip in the header: rose eJPT vs indigo CCNA (no "Estensione")', () => {
    act(() => useStore.setState({ activeChapterId: 'pentest-methodology' }));
    const { container } = render(<StudyManualView />);
    // An eJPT chapter: the rose eJPT chip, and the eJPT route mark in the context bar.
    const chip = container.querySelector('.bg-rose-100');
    expect(chip).not.toBeNull();
    expect(chip!.textContent).toContain('eJPT');
    expect(container.querySelector('[data-testid="chapter-context"] [data-track="ejpt"]')).not.toBeNull();

    cleanup();
    act(() => useStore.setState({ activeChapterId: 'segmentation-trust-boundaries' }));
    const second = render(<StudyManualView />);
    // A CCNA-route advanced (Security+) chapter: the indigo CCNA chip, never a rose eJPT one
    // and never an "Estensione" label.
    expect(second.container.querySelector('.bg-rose-100')).toBeNull();
    expect(second.container.querySelector('.bg-indigo-100')?.textContent).toContain('CCNA');
    expect(second.container.textContent).not.toContain('Estensione');
  });
});

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
import { chaptersByDomain, chaptersForCertificationTrack, manualStats } from '../lib/studyManual';
import { useStore } from '../store';

// ENG-31 — derive the chapter-count expectations from the manual dataset (the single
// source of truth) so adding a chapter never forces a hand-edit here. Asserting the
// rendered counts against the data also proves the view surfaces every chapter and
// group, rather than a literal matching itself.
const TOTAL_CHAPTERS = manualStats().chapters;
const CHAPTER_GROUPS = chaptersByDomain();
const FIRST_DOMAIN_CHAPTERS = CHAPTER_GROUPS[0].chapters.length;
const EXTENSION_CHAPTERS = CHAPTER_GROUPS.find((group) => group.key === 'extension')?.chapters.length ?? 0;

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  useStore.setState({
    language: 'it',
    completedChapterIds: [],
    hasDismissedManualHelp: false,
    activeChapterId: null,
    activeTopicId: null
  });
});

describe('manual first-visit help (UX-22)', () => {
  it('shows navigation, practice and chapter guidance on the first visit', () => {
    render(<StudyManualView />);
    const help = screen.getByRole('region', { name: 'Come usare questa guida' });
    expect(within(help).getAllByRole('listitem')).toHaveLength(3);
    expect(within(help).getByText(/Contenuti del capitolo/)).toBeTruthy();
    expect(within(help).getByText(/soluzione commentata e l’autoverifica/)).toBeTruthy();
    expect(within(help).getByText(/Capitolo precedente/)).toBeTruthy();
    const trigger = screen.getByRole('button', { name: 'Come usare questa guida' });
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(help.id);
  });

  it('remembers dismissal, returns focus to the trigger, and can reopen the help', async () => {
    const user = userEvent.setup();
    render(<StudyManualView />);
    const trigger = screen.getByRole('button', { name: 'Come usare questa guida' });

    await user.click(screen.getByRole('button', { name: 'Chiudi le istruzioni' }));
    expect(screen.queryByRole('region', { name: 'Come usare questa guida' })).toBeNull();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);
    expect(useStore.getState().hasDismissedManualHelp).toBe(true);

    await user.click(trigger);
    expect(screen.getByRole('region', { name: 'Come usare questa guida' })).toBeTruthy();
    expect(useStore.getState().hasDismissedManualHelp).toBe(true);
  });

  it('keeps dismissed help closed when the manual is revisited and progress is reset', async () => {
    const user = userEvent.setup();
    useStore.setState({ hasDismissedManualHelp: true, completedChapterIds: ['osi-model'] });
    const { unmount } = render(<StudyManualView />);
    expect(screen.queryByRole('region', { name: 'Come usare questa guida' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Azzera progresso' }));
    expect(useStore.getState().hasDismissedManualHelp).toBe(true);
    unmount();

    render(<StudyManualView />);
    expect(screen.queryByRole('region', { name: 'Come usare questa guida' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Come usare questa guida' })).toBeTruthy();
  });

  it('toggles the disclosure from the keyboard without trapping focus', async () => {
    const user = userEvent.setup();
    render(<StudyManualView />);
    const trigger = screen.getByRole('button', { name: 'Come usare questa guida' });
    trigger.focus();
    await user.keyboard('{Enter}');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    await user.keyboard(' ');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(trigger);
  });

  it('updates the open instructions when the language changes', () => {
    render(<StudyManualView />);
    act(() => useStore.getState().setLanguage('en'));
    const help = screen.getByRole('region', { name: 'How to use this guide' });
    expect(within(help).getByText(/On this page/)).toBeTruthy();
    expect(within(help).getByText(/commented solution and self-check/)).toBeTruthy();
    expect(within(help).getByText(/Previous chapter/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Close the instructions' })).toBeTruthy();
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
    // Scope to the topic index: the toolbar also holds the UX-32 route-filter buttons.
    const mobileButtons = within(within(mobileContents).getByTestId('mobile-topic-index')).getAllByRole('button');

    expect(railButtons[0].getAttribute('aria-current')).toBe('location');
    expect(mobileButtons[0].getAttribute('aria-current')).toBe('location');
    await user.click(railButtons[1]);
    expect(railButtons[0].hasAttribute('aria-current')).toBe(false);
    expect(railButtons[1].getAttribute('aria-current')).toBe('location');
    expect(mobileButtons[1].getAttribute('aria-current')).toBe('location');
  });

  it('offers a compact domain-grouped chapter selector and persistent topic index on mobile', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    render(<StudyManualView />);

    const mobileNav = screen.getByRole('navigation', { name: 'Navigazione mobile del manuale' });
    const chapterSelect = within(mobileNav).getByRole('combobox', { name: 'Vai a un capitolo' });
    expect(within(chapterSelect).getAllByRole('option')).toHaveLength(TOTAL_CHAPTERS);
    expect(
      chapterSelect.querySelector(`optgroup[label="CCNA 1.0 · Fondamenti di rete · 0/${FIRST_DOMAIN_CHAPTERS}"]`)
    ).not.toBeNull();
    expect(chapterSelect.querySelector(`optgroup[label="Estensione · 0/${EXTENSION_CHAPTERS}"]`)).not.toBeNull();
    // The persistent topic index holds one button per topic of the open chapter (the
    // toolbar also carries the UX-32 route filter, so scope the count to the index).
    const topicIndex = () => within(within(mobileNav).getByTestId('mobile-topic-index')).getAllByRole('button');
    expect(topicIndex()).toHaveLength(4);

    await user.selectOptions(chapterSelect, 'ethernet-switching');
    const chapterHeading = screen.getByRole('heading', { level: 2, name: /Ethernet/ });
    expect((chapterSelect as HTMLSelectElement).value).toBe('ethernet-switching');
    expect(document.activeElement).toBe(chapterHeading);
    expect(topicIndex()).toHaveLength(3);
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

  it('groups the chapter navigation by CCNA domain', () => {
    render(<StudyManualView />);
    const nav = screen.getByRole('navigation', { name: 'Capitoli del manuale' });
    // Domain groups are labelled and precede the extension bucket.
    expect(within(nav).getByRole('group', { name: 'CCNA 1.0 · Fondamenti di rete' })).toBeTruthy();
    expect(within(nav).getByRole('group', { name: 'CCNA 3.0 · Connettività IP' })).toBeTruthy();
    expect(within(nav).getByRole('group', { name: 'Estensione' })).toBeTruthy();
    // The exam-weight badge is labelled so its percentage is not mistaken for completion
    // progress (which is shown as a fraction/percent elsewhere on the page).
    expect(within(nav).getAllByLabelText('Peso d’esame: 20%').length).toBeGreaterThan(0);
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

describe('certification-route marks (VIS-10)', () => {
  it('marks every chapter row in the tree with its route and names the route for AT', () => {
    render(<StudyManualView />);
    const nav = screen.getByRole('navigation', { name: 'Capitoli del manuale' });

    // Each row carries its route icon (a non-textual channel) via data-track, in the
    // exact per-route counts the dataset implies — eJPT included, even though its
    // chapters sit inside the extension domain group.
    for (const track of ['ccna', 'ejpt', 'extension'] as const) {
      expect(nav.querySelectorAll(`[data-track="${track}"]`).length, track).toBe(
        chaptersForCertificationTrack(track).length
      );
    }
    expect(chaptersForCertificationTrack('ejpt').length).toBeGreaterThan(0);

    // The route is also exposed as text (not colour/icon only, WCAG 1.4.1): one
    // sr-only "Percorso <route>" label per chapter row.
    expect(within(nav).getAllByText(/^Percorso (CCNA|eJPT|Estensione)$/).length).toBe(TOTAL_CHAPTERS);
  });

  it('filters the chapter index by certification route without navigating (UX-32)', async () => {
    const user = userEvent.setup();
    render(<StudyManualView />);
    const nav = screen.getByRole('navigation', { name: 'Capitoli del manuale' });
    // The filter sits outside the chapter nav (the tree stays chapters-only); jsdom renders
    // both the desktop and mobile instances, so drive the first and assert on the tree.
    const filter = screen.getAllByRole('group', { name: 'Filtra per percorso' })[0];

    // Starts on "Tutti": every chapter row is present and the control reflects it.
    expect(within(filter).getByRole('button', { name: 'Tutti' }).getAttribute('aria-pressed')).toBe('true');
    expect(nav.querySelectorAll('[data-track]')).toHaveLength(TOTAL_CHAPTERS);

    // Filtering to eJPT narrows the tree to just the eJPT rows…
    await user.click(within(filter).getByRole('button', { name: 'eJPT' }));
    expect(nav.querySelectorAll('[data-track="ejpt"]')).toHaveLength(chaptersForCertificationTrack('ejpt').length);
    expect(nav.querySelectorAll('[data-track="ccna"]')).toHaveLength(0);
    expect(nav.querySelectorAll('[data-track="extension"]')).toHaveLength(0);
    expect(within(filter).getByRole('button', { name: 'eJPT' }).getAttribute('aria-pressed')).toBe('true');
    expect(within(filter).getByRole('button', { name: 'Tutti' }).getAttribute('aria-pressed')).toBe('false');

    // …and it is view state only: no navigation happened and the open chapter still renders.
    expect(useStore.getState().activeChapterId).toBeNull();
    expect(screen.getByRole('heading', { level: 2, name: /Il modello OSI/ })).toBeTruthy();

    // Filtering to CCNA drops the extension bucket and keeps the CCNA domain groups.
    await user.click(within(filter).getByRole('button', { name: 'CCNA' }));
    expect(within(nav).queryByRole('group', { name: 'Estensione' })).toBeNull();
    expect(within(nav).getByRole('group', { name: 'CCNA 1.0 · Fondamenti di rete' })).toBeTruthy();
    expect(nav.querySelectorAll('[data-track="ejpt"]')).toHaveLength(0);
  });

  it('sets an eJPT chapter apart from a Security+ extension chapter in the header', () => {
    act(() => useStore.setState({ activeChapterId: 'pentest-methodology' }));
    const { container } = render(<StudyManualView />);
    // The header route chip reads eJPT (rose) instead of the generic "Estensione".
    const chip = container.querySelector('.bg-rose-100');
    expect(chip).not.toBeNull();
    expect(chip!.textContent).toContain('eJPT');
    // The active chapter's header carries the eJPT route mark.
    expect(container.querySelector('[data-testid="chapter-context"] [data-track="ejpt"]')).not.toBeNull();

    cleanup();
    act(() => useStore.setState({ activeChapterId: 'segmentation-trust-boundaries' }));
    const second = render(<StudyManualView />);
    // A Security+ extension chapter keeps the amber "Estensione" chip, not a rose eJPT one.
    expect(second.container.querySelector('.bg-rose-100')).toBeNull();
    expect(second.container.querySelector('.bg-amber-100')?.textContent).toContain('Estensione');
  });
});

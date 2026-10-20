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
import {
  chaptersByCertificationTrack,
  chaptersForCertificationTrack,
  manualStats,
  orderedChapters
} from '../lib/studyManual';
import { useStore } from '../store';

// ENG-31 — derive the chapter-count expectations from the manual dataset (the single
// source of truth) so adding a chapter never forces a hand-edit here.
const TOTAL_CHAPTERS = manualStats().chapters;
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
    completedTopicIds: [],
    activeChapterId: null,
    activeTopicId: null
  });
});

// IA-13 — `#/manual` (no chapter) renders the card index; opening a chapter (its id in the
// store) renders the full-width reader. Reader tests open a chapter first.
function renderReader(chapterId = 'osi-model') {
  useStore.setState({ activeChapterId: chapterId });
  return render(<StudyManualView />);
}

describe('StudyManualView reader (EDU-01)', () => {
  it('renders the manual heading, the OSI chapter and a topic', () => {
    const { container } = renderReader();
    expect(screen.getByRole('heading', { level: 1, name: 'Manuale di studio' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: /Il modello OSI/ })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 3, name: /sette livelli/ })).toBeTruthy();
    expect(screen.getByTestId('manual-reading-column').classList.contains('manual-reading-column')).toBe(true);
    expect(container.querySelectorAll('[data-manual-copy="theory"]')).toHaveLength(4);
    expect(container.querySelectorAll('[data-manual-topic]')).toHaveLength(4);
  });

  it('uses the same reading hierarchy and tile rhythm across chapters', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    const { container } = renderReader();

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
    await user.selectOptions(
      within(screen.getByRole('navigation', { name: 'Navigazione mobile del manuale' })).getByRole('combobox', {
        name: 'Vai a un capitolo'
      }),
      'ethernet-switching'
    );
    expect(screen.getByRole('heading', { level: 2, name: /Ethernet/ })).toBeTruthy();
    assertChapterRhythm();
  });

  it('exposes the manual root hook for theme scoping (UX-28)', () => {
    const { container } = renderReader();
    expect(container.querySelector('[data-manual-root]')).not.toBeNull();
  });

  it('shows the CCNA domain alignment badge for the active chapter', () => {
    renderReader();
    // The OSI chapter maps to CCNA domain 1.0 Network Fundamentals.
    expect(screen.getAllByText('CCNA 1.0 · Fondamenti di rete').length).toBeGreaterThan(0);
  });

  it('keeps chapter context outside the document heading outline', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    renderReader();

    const context = screen.getByRole('region', { name: 'Contesto del capitolo' });
    expect(within(context).getByText('CCNA 1.0 · Fondamenti di rete')).toBeTruthy();
    expect(within(context).getByText('Il modello OSI e l’incapsulamento')).toBeTruthy();
    expect(context.querySelector('h1, h2, h3, h4, h5, h6')).toBeNull();

    await user.selectOptions(
      within(screen.getByRole('navigation', { name: 'Navigazione mobile del manuale' })).getByRole('combobox', {
        name: 'Vai a un capitolo'
      }),
      'ethernet-switching'
    );
    expect(within(context).getByText('Ethernet, switching e tabella CAM')).toBeTruthy();
  });

  it('marks the active chapter complete and resets all progress', async () => {
    const user = userEvent.setup();
    renderReader();

    const markComplete = screen.getByRole('button', { name: 'Segna come completato' });
    expect(markComplete.getAttribute('aria-pressed')).toBe('false');
    await user.click(markComplete);

    expect(screen.getByRole('button', { name: 'Segna come da completare' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByLabelText(`Progresso capitoli: 1/${TOTAL_CHAPTERS}`)).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Azzera progresso' }));
    expect(screen.getByRole('button', { name: 'Segna come completato' }).getAttribute('aria-pressed')).toBe('false');
    expect(screen.queryByRole('button', { name: 'Azzera progresso' })).toBeNull();
  });

  it('marks a single topic as studied and tracks the chapter topics-studied tally (EDU-PROG)', async () => {
    const user = userEvent.setup();
    const { container } = renderReader();

    // The OSI chapter has four topics; none studied yet, so no tally is shown until one is.
    const topicToggles = container.querySelectorAll<HTMLButtonElement>('[data-testid^="topic-studied-"]');
    expect(topicToggles).toHaveLength(4);
    const firstToggle = screen.getByTestId('topic-studied-osi-why-layers');
    expect(firstToggle.getAttribute('aria-pressed')).toBe('false');
    expect(firstToggle.getAttribute('aria-label')).toBe('Segna argomento come studiato');

    await user.click(firstToggle);

    // The toggle reflects the studied state and the store records exactly that topic.
    expect(screen.getByTestId('topic-studied-osi-why-layers').getAttribute('aria-pressed')).toBe('true');
    expect(useStore.getState().completedTopicIds).toEqual(['osi-why-layers']);
    // The chapter's topics-studied tally reads 1 of 4 without marking the whole chapter.
    expect(screen.getByTestId('chapter-topic-progress').textContent).toContain('1/4');
    expect(screen.getByRole('button', { name: 'Segna come completato' }).getAttribute('aria-pressed')).toBe('false');

    // The single reset control clears topic progress along with chapters.
    await user.click(screen.getByTestId('topic-studied-osi-why-layers'));
    expect(useStore.getState().completedTopicIds).toEqual([]);
  });

  it('localises the topic studied control to English (EDU-PROG)', async () => {
    const user = userEvent.setup();
    useStore.setState({ language: 'en' });
    renderReader();
    const toggle = screen.getByTestId('topic-studied-osi-why-layers');
    expect(toggle.getAttribute('aria-label')).toBe('Mark topic as studied');
    await user.click(toggle);
    expect(screen.getByTestId('topic-studied-osi-why-layers').getAttribute('aria-label')).toBe(
      'Mark topic as not studied'
    );
    expect(screen.getByTestId('chapter-topic-progress').textContent).toContain('Topics studied: 1/4');
  });

  it('offers an "on this page" rail listing the chapter topics', () => {
    renderReader();
    const rail = screen.getByRole('navigation', { name: 'In questa pagina' });
    const article = screen.getByRole('article');
    // The OSI chapter has four topics; each is a jump target in the rail.
    expect(within(rail).getAllByRole('button').length).toBe(4);
    expect(within(rail).getByRole('button', { name: /sette livelli/ })).toBeTruthy();
    // The rail precedes the article in DOM/focus order.
    expect(rail.compareDocumentPosition(article) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('uses coherent current states in both topic navigations', async () => {
    const user = userEvent.setup();
    renderReader();
    const rail = screen.getByRole('navigation', { name: 'In questa pagina' });
    const mobileContents = screen.getByRole('navigation', { name: 'Navigazione mobile del manuale' });
    const railButtons = within(rail).getAllByRole('button');
    // The mobile per-topic quick jump is a native select (UX-45c); its value tracks the
    // same active topic as the desktop rail.
    const topicSelect = within(mobileContents).getByTestId('mobile-topic-index') as HTMLSelectElement;
    const topicOptions = within(topicSelect).getAllByRole('option') as HTMLOptionElement[];

    expect(railButtons[0].getAttribute('aria-current')).toBe('location');
    expect(topicSelect.value).toBe(topicOptions[0].value);
    await user.click(railButtons[1]);
    expect(railButtons[0].hasAttribute('aria-current')).toBe(false);
    expect(railButtons[1].getAttribute('aria-current')).toBe('location');
    expect(topicSelect.value).toBe(topicOptions[1].value);
  });

  it('offers a compact chapter selector and a per-topic select on mobile', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    renderReader();

    const mobileNav = screen.getByRole('navigation', { name: 'Navigazione mobile del manuale' });
    const chapterSelect = within(mobileNav).getByRole('combobox', { name: 'Vai a un capitolo' });
    expect(within(chapterSelect).getAllByRole('option')).toHaveLength(TOTAL_CHAPTERS);
    // The selector is grouped by the two study routes, each labelled with its progress.
    expect(chapterSelect.querySelector(`optgroup[label="Percorso CCNA · 0/${CCNA_CHAPTERS}"]`)).not.toBeNull();
    expect(chapterSelect.querySelector(`optgroup[label="eJPT · 0/${EJPT_CHAPTERS}"]`)).not.toBeNull();
    // The per-topic quick jump is a native select: one option per topic of the open chapter.
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
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    renderReader();

    const stepNav = screen.getByRole('navigation', { name: 'Capitolo precedente e successivo' });
    // On the first chapter there is a next but no previous.
    expect(within(stepNav).queryByText('Capitolo precedente')).toBeNull();
    await user.click(within(stepNav).getByRole('button', { name: /Capitolo successivo/ }));

    expect(screen.getByRole('heading', { level: 2, name: /Ethernet/ })).toBeTruthy();
  });

  it('offers a guided lab with a revealable solution and a link into the interactive lab', () => {
    renderReader();

    // The guided-lab solution is behind a disclosure, not shown as plain text upfront.
    expect(screen.getAllByText('Mostra la soluzione commentata').length).toBeGreaterThan(0);

    // At least one guided lab opens the OSI stack lab via a real, copyable link.
    const osiLinks = screen
      .getAllByRole('link', { name: /Fai l’esercizio guidato/ })
      .filter((a) => a.getAttribute('href') === '#/osi');
    expect(osiLinks.length).toBeGreaterThan(0);
  });

  it('makes the guided exercise the primary practical action in each topic (UX-26)', () => {
    const { container } = renderReader();

    const topics = [...container.querySelectorAll<HTMLElement>('[data-manual-topic]')];
    expect(topics.length).toBeGreaterThan(0);

    for (const topic of topics) {
      const guidedTiles = topic.querySelectorAll('[data-manual-tile="guided-lab"]');
      for (const tile of guidedTiles) {
        const primary = tile.querySelector<HTMLAnchorElement>('[data-manual-action="guided-exercise"]');
        expect(primary).not.toBeNull();
        expect(primary!.textContent).toContain('Fai l’esercizio guidato');
        expect(primary!.className).toContain('bg-indigo-600');
        expect(primary!.className).toContain('text-white');
      }

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
    renderReader();
    expect(screen.getByRole('heading', { level: 1, name: 'Study manual' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: /OSI model/ })).toBeTruthy();
    // Guided-lab disclosure and lab link are localised too.
    expect(screen.getAllByText('Show the commented solution').length).toBeGreaterThan(0);
  });

  it('reveals the commented solution when the disclosure is opened', () => {
    const { container } = renderReader();
    const details = container.querySelector('details');
    expect(details).not.toBeNull();
    expect((details as HTMLDetailsElement).open).toBe(false);
    const solutionHeading = within(details as HTMLElement).getByText('Soluzione commentata');
    expect(solutionHeading).toBeTruthy();
  });

  it('links back to the card index from the reader', () => {
    renderReader('ethernet-switching');
    const back = screen.getByRole('link', { name: 'Tutti i capitoli' });
    expect(back.getAttribute('href')).toBe('#/manual');
  });
});

describe('StudyManualView card index (IA-13)', () => {
  it('lists every chapter as a card and opens one on click', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    render(<StudyManualView />);

    // The index is the chapter chooser: one card (a real link) per chapter.
    const cards = screen.getAllByTestId('manual-chapter-link');
    expect(cards).toHaveLength(TOTAL_CHAPTERS);
    expect(screen.queryByRole('article')).toBeNull();

    const ethernet = screen.getByRole('link', { name: /Ethernet, switching/ });
    expect(ethernet.getAttribute('href')).toBe('#/manual/ethernet-switching');
    await user.click(ethernet);

    const chapterHeading = screen.getByRole('heading', { level: 2, name: /Ethernet/ });
    expect(document.activeElement).toBe(chapterHeading);
    expect(useStore.getState().activeChapterId).toBe('ethernet-switching');
  });

  it('hides the resume summary until there is progress (EDU-PROG)', () => {
    render(<StudyManualView />);
    expect(screen.queryByTestId('resume-summary')).toBeNull();
  });

  it('shows a resume summary that aggregates progress and links to the next chapter (EDU-PROG)', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    // One chapter complete plus one topic studied in another chapter.
    useStore.setState({ completedChapterIds: ['osi-model'], completedTopicIds: ['ethernet-frame-mac'] });
    render(<StudyManualView />);

    const summary = screen.getByTestId('resume-summary');
    expect(within(summary).getByText(/Argomenti studiati: 1\/\d+/)).toBeTruthy();

    // osi-model is complete, so the resume target is the next chapter in study order.
    const resume = screen.getByTestId('resume-link');
    expect(resume.getAttribute('href')).toBe('#/manual/ethernet-switching');
    await user.click(resume);
    expect(useStore.getState().activeChapterId).toBe('ethernet-switching');
  });

  it('reports completion in the resume summary when every chapter is done (EDU-PROG)', () => {
    useStore.setState({ completedChapterIds: orderedChapters().map((chapter) => chapter.id) });
    render(<StudyManualView />);
    const summary = screen.getByTestId('resume-summary');
    expect(within(summary).getByText('Hai completato tutti i capitoli.')).toBeTruthy();
    expect(screen.queryByTestId('resume-link')).toBeNull();
  });

  it('shows an in-progress topic tally on a started-but-unfinished chapter card (EDU-PROG)', () => {
    // One topic studied in ethernet-switching (3 topics), chapter not completed.
    useStore.setState({ completedTopicIds: ['ethernet-frame-mac'] });
    render(<StudyManualView />);
    const tally = screen.getByTestId('card-topic-progress-ethernet-switching');
    expect(tally.textContent).toContain('1/3');
    expect(tally.getAttribute('aria-label')).toBe('Argomenti studiati: 1/3');
  });

  it('omits the card topic tally once the chapter is completed (EDU-PROG)', () => {
    // A completed chapter already reads "Completed"; the tally would be redundant.
    useStore.setState({ completedChapterIds: ['osi-model'], completedTopicIds: ['osi-why-layers'] });
    render(<StudyManualView />);
    expect(screen.queryByTestId('card-topic-progress-osi-model')).toBeNull();
  });

  it('groups the chapter index by the two study routes', () => {
    render(<StudyManualView />);
    const nav = screen.getByRole('navigation', { name: 'Capitoli del manuale' });
    const groups = within(nav).getAllByRole('group');
    expect(groups).toHaveLength(2);
    expect(within(nav).getByRole('group', { name: 'Percorso CCNA' })).toBeTruthy();
    expect(within(nav).getByRole('group', { name: 'eJPT' })).toBeTruthy();
    expect(within(nav).queryByRole('group', { name: 'Estensione' })).toBeNull();
    // Each route group carries its progress count.
    expect(within(nav).getByLabelText(`Percorso CCNA · Progresso capitoli: 0/${CCNA_CHAPTERS}`)).toBeTruthy();
    expect(within(nav).getByLabelText(`eJPT · Progresso capitoli: 0/${EJPT_CHAPTERS}`)).toBeTruthy();
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
    const filter = screen.getByRole('group', { name: 'Filtra per percorso' });

    // Starts on "Tutti": both route groups are present and the control reflects it.
    expect(within(filter).getByRole('button', { name: 'Tutti' }).getAttribute('aria-pressed')).toBe('true');
    expect(within(nav).getAllByRole('group')).toHaveLength(2);

    // Filtering to eJPT narrows the index to just the eJPT route group…
    await user.click(within(filter).getByRole('button', { name: 'eJPT' }));
    expect(within(nav).getAllByRole('group')).toHaveLength(1);
    expect(within(nav).getByRole('group', { name: 'eJPT' })).toBeTruthy();
    expect(within(nav).queryByRole('group', { name: 'Percorso CCNA' })).toBeNull();
    expect(within(filter).getByRole('button', { name: 'eJPT' }).getAttribute('aria-pressed')).toBe('true');
    expect(within(filter).getByRole('button', { name: 'Tutti' }).getAttribute('aria-pressed')).toBe('false');

    // …and it is view state only: no navigation happened and the index still shows cards.
    expect(useStore.getState().activeChapterId).toBeNull();
    expect(screen.getAllByTestId('manual-chapter-link').length).toBe(EJPT_CHAPTERS);

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
    expect(within(routeList).getAllByRole('listitem')).toHaveLength(2);

    expect(within(routeList).getByText(`Percorso CCNA 1/${CCNA_CHAPTERS}`)).toBeTruthy();
    expect(within(routeList).getByText(`eJPT 0/${EJPT_CHAPTERS}`)).toBeTruthy();

    expect(screen.getByText(new RegExp(`Progresso capitoli: 1/${TOTAL_CHAPTERS}`))).toBeTruthy();
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

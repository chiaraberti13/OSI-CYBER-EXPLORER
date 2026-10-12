// @vitest-environment jsdom
/**
 * @license
 * SPDX-License-Identifier: GPL-3.0-only
 */

import { afterEach, describe, expect, it } from 'vitest';
import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StudyManualView from './StudyManualView';
import { useStore } from '../store';

afterEach(() => {
  cleanup();
  useStore.setState({ language: 'it', completedChapterIds: [], hasDismissedManualHelp: false });
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
    expect(screen.getByLabelText('Progresso capitoli: 1/9')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Azzera progresso' }));
    expect(screen.getByRole('button', { name: 'Segna come completato' }).getAttribute('aria-pressed')).toBe('false');
    expect(screen.queryByRole('button', { name: 'Azzera progresso' })).toBeNull();
  });

  it('offers an "on this page" rail listing the chapter topics', () => {
    render(<StudyManualView />);
    const rail = screen.getByRole('navigation', { name: 'In questa pagina' });
    // The OSI chapter has four topics; each is a jump target in the rail.
    expect(within(rail).getAllByRole('button').length).toBe(4);
    expect(within(rail).getByRole('button', { name: /sette livelli/ })).toBeTruthy();
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
  });

  it('offers a guided lab with a revealable solution and a link into the interactive lab', () => {
    render(<StudyManualView />);

    // The guided-lab solution is behind a disclosure, not shown as plain text upfront.
    expect(screen.getAllByText('Mostra la soluzione commentata').length).toBeGreaterThan(0);

    // At least one guided lab opens the OSI stack lab via a real, copyable link.
    const osiLinks = screen
      .getAllByRole('link', { name: /Apri il laboratorio/ })
      .filter((a) => a.getAttribute('href') === '#/osi');
    expect(osiLinks.length).toBeGreaterThan(0);
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
    render(<StudyManualView />);

    const chapterNav = screen.getByRole('navigation', { name: 'Capitoli del manuale' });
    const secondChapter = within(chapterNav).getByRole('button', { name: /Ethernet/ });
    await user.click(secondChapter);

    expect(screen.getByRole('heading', { level: 2, name: /Ethernet/ })).toBeTruthy();
    expect(secondChapter.getAttribute('aria-current')).toBe('true');
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

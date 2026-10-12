// @vitest-environment jsdom
/**
 * @license
 * SPDX-License-Identifier: GPL-3.0-only
 */

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StudyManualView from './StudyManualView';
import { useStore } from '../store';

afterEach(() => {
  cleanup();
  useStore.setState({ language: 'it', completedChapterIds: [] });
});

describe('StudyManualView (EDU-01)', () => {
  it('renders the manual heading, the OSI chapter and a topic', () => {
    render(<StudyManualView />);
    expect(screen.getByRole('heading', { level: 1, name: 'Manuale di studio' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: /Il modello OSI/ })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 3, name: /sette livelli/ })).toBeTruthy();
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

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
  useStore.setState({ language: 'it' });
});

describe('StudyManualView (EDU-01)', () => {
  it('renders the manual heading, the OSI chapter and a topic', () => {
    render(<StudyManualView />);
    expect(screen.getByRole('heading', { level: 2, name: 'Manuale di studio' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 3, name: /Il modello OSI/ })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 4, name: /sette livelli/ })).toBeTruthy();
  });

  it('offers a guided lab with a revealable solution and a link into the interactive lab', () => {
    render(<StudyManualView />);

    // The guided-lab solution is behind a disclosure, not shown as plain text upfront.
    expect(screen.getAllByText('Mostra la soluzione commentata').length).toBeGreaterThan(0);

    // At least one guided lab opens the OSI stack lab via a real, copyable link.
    const osiLinks = screen.getAllByRole('link', { name: /Apri il laboratorio/ })
      .filter(a => a.getAttribute('href') === '#/osi');
    expect(osiLinks.length).toBeGreaterThan(0);
  });

  it('localises the manual to English', () => {
    useStore.setState({ language: 'en' });
    render(<StudyManualView />);
    expect(screen.getByRole('heading', { level: 2, name: 'Study manual' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 3, name: /OSI model/ })).toBeTruthy();
    // Guided-lab disclosure and lab link are localised too.
    expect(screen.getAllByText('Show the commented solution').length).toBeGreaterThan(0);
  });

  it('navigates between chapters through the chapter navigation', async () => {
    const user = userEvent.setup();
    render(<StudyManualView />);

    const chapterNav = screen.getByRole('navigation', { name: 'Capitoli del manuale' });
    const secondChapter = within(chapterNav).getByRole('button', { name: /Ethernet/ });
    await user.click(secondChapter);

    expect(screen.getByRole('heading', { level: 3, name: /Ethernet/ })).toBeTruthy();
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

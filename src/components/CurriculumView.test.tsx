// @vitest-environment jsdom
/**
 * @license
 * SPDX-License-Identifier: GPL-3.0-only
 */

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import CurriculumView from './CurriculumView';
import { useStore } from '../store';

afterEach(() => {
  cleanup();
  useStore.setState({ language: 'it', completedChapterIds: [] });
});

describe('CurriculumView — theory defers to the study manual (EDU-STRUCT-03)', () => {
  it('shows a "theory in the manual" pointer on every CCNA domain card', () => {
    useStore.setState({ language: 'it' });
    render(<CurriculumView />);
    // One pointer per CCNA domain (six domains).
    expect(screen.getAllByText('Teoria nel manuale').length).toBe(6);
  });

  it('links a covered domain to the manual chapters that teach it', () => {
    useStore.setState({ language: 'it' });
    render(<CurriculumView />);
    // Network Fundamentals is taught by Chapter 1 (OSI), linked into the manual.
    const chapterLinks = screen
      .getAllByRole('link', { name: /Cap\. 1:/ })
      .filter((a) => a.getAttribute('href') === '#/manual');
    expect(chapterLinks.length).toBeGreaterThan(0);
  });

  it('marks a domain with no manual chapter yet as coming soon', () => {
    useStore.setState({ language: 'it' });
    render(<CurriculumView />);
    // Automation & Programmability (6.0) has no dedicated chapter yet.
    expect(screen.getByText(/In arrivo: questo dominio/)).toBeTruthy();
  });

  it('shows locally completed chapter progress for each covered domain', () => {
    useStore.setState({ language: 'it', completedChapterIds: ['osi-model'] });
    render(<CurriculumView />);

    expect(screen.getByLabelText('Progresso capitoli: 1/3').textContent).toContain('Progresso: 1/3 (33%)');
  });
});

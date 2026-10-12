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

  it('points a covered domain to its chapters with a single deep link (IA-01b)', () => {
    useStore.setState({ language: 'it' });
    render(<CurriculumView />);
    // Network Fundamentals deep-links to its first chapter (OSI), opening the Capitoli tab
    // there — a single pointer rather than a duplicated chapter list.
    const ctas = screen
      .getAllByRole('link', { name: 'Apri i capitoli nel Manuale' })
      .filter((a) => a.getAttribute('href') === '#/manual/osi-model');
    expect(ctas.length).toBe(1);
  });

  it('does not re-list the individual chapters: the index lives in the Capitoli tab (IA-01b)', () => {
    useStore.setState({ language: 'it' });
    render(<CurriculumView />);
    // The per-chapter "Cap. N:" index was removed from the overview to avoid duplicating
    // the manual's domain navigation.
    expect(screen.queryAllByRole('link', { name: /Cap\. \d+:/ })).toHaveLength(0);
    // Five of the six domains are covered by chapters, each with one pointer.
    expect(screen.getAllByRole('link', { name: 'Apri i capitoli nel Manuale' })).toHaveLength(5);
  });

  it('marks a domain with no manual chapter yet as coming soon', () => {
    useStore.setState({ language: 'it' });
    render(<CurriculumView />);
    // Automation & Programmability (6.0) has no dedicated chapter yet.
    expect(screen.getByText(/In arrivo: questo dominio/)).toBeTruthy();
  });
});

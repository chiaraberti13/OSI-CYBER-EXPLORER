// @vitest-environment jsdom
/**
 * @license
 * SPDX-License-Identifier: GPL-3.0-only
 */

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import CcnaHubTabs from './CcnaHubTabs';
import { useStore } from '../store';

afterEach(() => {
  cleanup();
  useStore.setState({ activeView: 'curriculum', language: 'it' });
});

describe('CcnaHubTabs (IA-01)', () => {
  it('links the two hub sections and marks the active one', () => {
    useStore.setState({ activeView: 'manual', language: 'it' });
    render(<CcnaHubTabs />);

    const nav = screen.getByRole('navigation', { name: 'Sezioni del percorso CCNA' });
    const overview = within(nav).getByRole('link', { name: 'Panoramica' });
    const chapters = within(nav).getByRole('link', { name: 'Capitoli' });

    expect(overview.getAttribute('href')).toBe('#/curriculum');
    expect(chapters.getAttribute('href')).toBe('#/manual');
    // On the manual, "Capitoli" is the current section.
    expect(chapters.getAttribute('aria-current')).toBe('page');
    expect(overview.hasAttribute('aria-current')).toBe(false);
  });

  it('marks the overview current on the map view and localises to English', () => {
    useStore.setState({ activeView: 'curriculum', language: 'en' });
    render(<CcnaHubTabs />);
    const nav = screen.getByRole('navigation', { name: 'CCNA path sections' });
    const overview = within(nav).getByRole('link', { name: 'Overview' });
    expect(overview.getAttribute('aria-current')).toBe('page');
    expect(within(nav).getByRole('link', { name: 'Chapters' }).hasAttribute('aria-current')).toBe(false);
  });
});

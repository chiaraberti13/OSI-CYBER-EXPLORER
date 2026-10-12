// @vitest-environment jsdom
/**
 * @license
 * SPDX-License-Identifier: GPL-3.0-only
 */

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import App from './App';
import { useStore } from './store';

afterEach(() => {
  cleanup();
  useStore.setState({ activeView: 'curriculum', language: 'it', hasDismissedManualHelp: false });
});

describe('App lazy loading states (UX-27)', () => {
  it('shows the manual-shaped skeleton while the manual chunk loads, then the real manual', async () => {
    useStore.setState({ activeView: 'manual', language: 'it', hasDismissedManualHelp: true });
    render(<App />);

    // While the lazy chunk resolves, the Suspense fallback is the layout-matched
    // skeleton (not the generic compact placeholder), so there is no jarring swap.
    const skeleton = screen.getByTestId('manual-skeleton');
    expect(skeleton.textContent?.trim()).toBe('Caricamento del manuale di studio…');

    // Once loaded, the real manual replaces the skeleton with no leftover placeholder.
    expect(await screen.findByRole('heading', { level: 1, name: 'Manuale di studio' })).toBeTruthy();
    expect(screen.queryByTestId('manual-skeleton')).toBeNull();
  });

  it('uses the compact fallback for other lazy views', () => {
    useStore.setState({ activeView: 'osi', language: 'it' });
    render(<App />);

    // Non-manual views keep the small shared placeholder, not the manual skeleton.
    expect(screen.queryByTestId('manual-skeleton')).toBeNull();
    expect(screen.getByText('Caricamento del modulo…')).toBeTruthy();
  });
});

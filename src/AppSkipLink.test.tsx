// @vitest-environment jsdom
/**
 * @license
 * SPDX-License-Identifier: GPL-3.0-only
 */

import { afterEach, describe, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, within } from '@testing-library/react';
import App from './App';
import { useStore } from './store';

/**
 * UX-02: the skip link must be the first focusable control, target the main
 * landmark, move focus there when activated, and not disturb the router hash
 * (which uses `#/<view>` and would otherwise canonicalise the view away).
 */

afterEach(() => {
  cleanup();
  window.history.replaceState(null, '', '/');
  useStore.setState({ activeView: 'osi', language: 'it', isGuideOpen: false });
});

describe('UX-02 skip link', () => {
  it('is the first focusable element and points at the main landmark', () => {
    const { container } = render(<App />);

    const focusable = container.querySelectorAll(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const skip = focusable[0] as HTMLAnchorElement;
    expect(skip.textContent).toBe('Vai al contenuto');
    expect(skip.getAttribute('href')).toBe('#main-content');

    const main = container.querySelector('main');
    expect(main?.id).toBe('main-content');
    expect(main?.getAttribute('tabindex')).toBe('-1');
  });

  it('moves focus to the main landmark without changing the route hash', () => {
    window.history.replaceState(null, '', '#/ports');
    const { container } = render(<App />);

    const skip = within(container).getByRole('link', { name: 'Vai al contenuto' });
    act(() => {
      fireEvent.click(skip);
    });

    const main = container.querySelector('main');
    expect(document.activeElement).toBe(main);
    // The programmatic jump must not rewrite the view hash used by the router.
    expect(window.location.hash).toBe('#/ports');
  });

  it('localises the label to English', () => {
    const { container } = render(<App />);
    act(() => useStore.getState().setLanguage('en'));

    const skip = within(container).getByRole('link', { name: 'Skip to content' });
    expect(skip.getAttribute('href')).toBe('#main-content');
  });
});

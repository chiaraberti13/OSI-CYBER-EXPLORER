// @vitest-environment jsdom
/**
 * @license
 * SPDX-License-Identifier: GPL-3.0-only
 */

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GlossaryModal from './GlossaryModal';
import { useStore } from '../store';

/**
 * UX-04: the glossary search must have a real accessible name (not only the
 * placeholder), announce the result count through a live region, and offer a
 * reset. Rendered inline (no portal) so the test drives the component directly.
 */

afterEach(() => {
  cleanup();
  useStore.setState({ language: 'it' });
});

describe('UX-04 glossary search accessibility', () => {
  it('names the search field beyond its placeholder and describes it with the live count', () => {
    render(<GlossaryModal inline />);

    const input = screen.getByRole('textbox', { name: 'Cerca termini o definizioni del glossario' });
    const status = screen.getByRole('status');
    // The input is described by the live region, so the count is part of its a11y name/description.
    expect(input.getAttribute('aria-describedby')).toBe(status.id);
    expect(status.textContent).toMatch(/\d+ termini/);
  });

  it('updates the announced count as the query narrows the list', async () => {
    const user = userEvent.setup();
    render(<GlossaryModal inline />);

    const input = screen.getByRole('textbox', { name: 'Cerca termini o definizioni del glossario' });
    const status = screen.getByRole('status');
    const before = Number(status.textContent!.match(/(\d+)/)![1]);

    await user.type(input, 'ipsec');
    const after = Number(status.textContent!.match(/(\d+)/)![1]);
    expect(after).toBeGreaterThan(0);
    expect(after).toBeLessThan(before);
    expect(screen.getByText('IPsec')).toBeTruthy();
  });

  it('announces and shows the empty state when nothing matches', async () => {
    const user = userEvent.setup();
    render(<GlossaryModal inline />);

    const input = screen.getByRole('textbox', { name: 'Cerca termini o definizioni del glossario' });
    await user.type(input, 'zzzznotathing');

    expect(screen.getByRole('status').textContent).toBe('Nessun termine trovato.');
    // The visible empty state is shown too (both the panel and the live region carry it).
    expect(screen.getAllByText('Nessun termine trovato.').length).toBeGreaterThanOrEqual(1);
  });

  it('offers a reset that clears the query and returns focus to the field', async () => {
    const user = userEvent.setup();
    render(<GlossaryModal inline />);

    const input = screen.getByRole('textbox', { name: 'Cerca termini o definizioni del glossario' });
    // No reset until there is something to clear.
    expect(screen.queryByRole('button', { name: 'Cancella la ricerca' })).toBeNull();

    await user.type(input, 'ipsec');
    const clear = screen.getByRole('button', { name: 'Cancella la ricerca' });
    await user.click(clear);

    expect((input as HTMLInputElement).value).toBe('');
    expect(document.activeElement).toBe(input);
  });

  it('localises the accessible name to English', () => {
    useStore.setState({ language: 'en' });
    render(<GlossaryModal inline />);
    const input = screen.getByRole('textbox', { name: 'Search glossary terms or definitions' });
    expect(within(input.closest('div')!.parentElement!).getByRole('status').textContent).toMatch(/\d+ terms?/);
  });
});

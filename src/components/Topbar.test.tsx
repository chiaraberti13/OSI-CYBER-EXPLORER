// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Topbar from './Topbar';
import { useStore } from '../store';
import { connectViewRouting } from '../lib/viewRouting';

let disconnect: (() => void) | undefined;

beforeEach(() => {
  window.history.replaceState(null, '', '#/manual');
  disconnect = connectViewRouting(useStore, window);
});

afterEach(() => {
  cleanup();
  disconnect?.();
  window.history.replaceState(null, '', '/');
  useStore.setState({ activeView: 'manual', language: 'it' });
});

describe('Topbar quick search', () => {
  it('filters every lab with the quick search and opens the chosen one', async () => {
    const user = userEvent.setup();
    render(<Topbar />);

    await user.click(screen.getByRole('button', { name: 'Cerca un laboratorio' }));
    const input = screen.getByRole('combobox', { name: 'Cerca un laboratorio' });
    await user.type(input, 'ospf');

    const results = screen.getByRole('listbox', { name: 'Risultati della ricerca' });
    const options = within(results).getAllByRole('option');
    expect(options.length).toBeGreaterThan(0);
    expect(options.length).toBeLessThan(10);

    await user.keyboard('{Enter}');
    expect(['routing', 'routingsecurity']).toContain(useStore.getState().activeView);
    expect(window.location.hash).toBe(`#/${useStore.getState().activeView}`);
  });

  it('exposes the combobox ARIA pattern and tracks the active option with the arrows', async () => {
    const user = userEvent.setup();
    render(<Topbar />);

    await user.click(screen.getByRole('button', { name: 'Cerca un laboratorio' }));
    const input = screen.getByRole('combobox', { name: 'Cerca un laboratorio' });

    expect(input.getAttribute('aria-autocomplete')).toBe('list');
    expect(input.getAttribute('aria-expanded')).toBe('true');
    const listbox = screen.getByRole('listbox', { name: 'Risultati della ricerca' });
    expect(input.getAttribute('aria-controls')).toBe(listbox.id);

    const options = within(listbox).getAllByRole('option');
    expect(options.length).toBeGreaterThan(1);
    expect(options[0].getAttribute('aria-selected')).toBe('true');
    expect(input.getAttribute('aria-activedescendant')).toBe(options[0].id);
    expect(document.activeElement).toBe(input);

    await user.keyboard('{ArrowDown}');
    const afterDown = within(screen.getByRole('listbox')).getAllByRole('option');
    expect(afterDown[1].getAttribute('aria-selected')).toBe('true');
    expect(afterDown[0].getAttribute('aria-selected')).toBe('false');
    expect(input.getAttribute('aria-activedescendant')).toBe(afterDown[1].id);

    expect(within(screen.getByRole('dialog')).getByRole('status').textContent).toMatch(/\d+ risultat/);
  });

  it('says so when nothing matches instead of showing an empty list', async () => {
    const user = userEvent.setup();
    render(<Topbar />);
    await user.click(screen.getByRole('button', { name: 'Cerca un laboratorio' }));
    const input = screen.getByRole('combobox', { name: 'Cerca un laboratorio' });
    await user.type(input, 'zzzznotathing');
    expect(screen.getAllByText(/Nessun laboratorio corrisponde/).length).toBeGreaterThanOrEqual(1);
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(input.getAttribute('aria-activedescendant')).toBeNull();
    expect(within(screen.getByRole('dialog')).getByRole('status').textContent).toMatch(/Nessun laboratorio/);
  });

  it('renders the search control in English when the language changes', () => {
    useStore.setState({ language: 'en' });
    render(<Topbar />);
    expect(screen.getByRole('button', { name: 'Search for a lab' })).toBeTruthy();
  });

  it('copies a shareable link to the current view and confirms it (UX-06)', async () => {
    const user = userEvent.setup();
    useStore.setState({ activeView: 'routing' });
    window.history.replaceState(null, '', '#/routing');
    render(<Topbar />);

    const copy = screen.getByRole('button', { name: 'Copia il link di questo laboratorio' });
    await user.click(copy);

    expect(await navigator.clipboard.readText()).toMatch(/#\/routing$/);
    expect(screen.getByRole('status').textContent).toBe('Link copiato');
  });

  it('localises the copy-link control to English', () => {
    useStore.setState({ language: 'en' });
    render(<Topbar />);
    expect(screen.getByRole('button', { name: 'Copy link to this lab' })).toBeTruthy();
  });

  it('opens the navigation drawer from the menu button', async () => {
    const user = userEvent.setup();
    render(<Topbar />);
    await user.click(screen.getByRole('button', { name: 'Apri il menu di navigazione' }));
    expect(useStore.getState().isNavOpen).toBe(true);
  });
});

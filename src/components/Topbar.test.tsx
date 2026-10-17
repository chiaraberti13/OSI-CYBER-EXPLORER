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
  useStore.setState({ activeView: 'manual', language: 'it', isNavOpen: false });
});

describe('Topbar primary navigation', () => {
  it('opens the Laboratori dropdown and switches view when an entry is chosen', async () => {
    const user = userEvent.setup();
    render(<Topbar />);

    const labs = screen.getByRole('button', { name: /Laboratori/ });
    expect(labs.getAttribute('aria-expanded')).toBe('false');
    await user.click(labs);
    expect(labs.getAttribute('aria-expanded')).toBe('true');

    const entry = screen.getByRole('link', { name: /^Connettività IP/ });
    expect(entry.getAttribute('href')).toBe('#/routing');
    await user.click(entry);

    expect(useStore.getState().activeView).toBe('routing');
    expect(window.location.hash).toBe('#/routing');
  });

  it('navigates to a promoted single-destination item (Porte)', async () => {
    const user = userEvent.setup();
    render(<Topbar />);
    const ports = screen.getByRole('link', { name: /Porte e protocolli/ });
    expect(ports.getAttribute('href')).toBe('#/ports');
    await user.click(ports);
    expect(useStore.getState().activeView).toBe('ports');
  });

  it('marks the Laboratori item as current when a lab is the active view', () => {
    useStore.setState({ activeView: 'emailsecurity' });
    render(<Topbar />);
    expect(screen.getByRole('button', { name: /Laboratori/ }).getAttribute('aria-current')).toBe('true');
  });

  it('renders every destination in English when the language changes', () => {
    useStore.setState({ language: 'en' });
    render(<Topbar />);
    expect(screen.getByRole('link', { name: /Manual/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Labs/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Glossary/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: /CCNA map/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Ports & protocols/ })).toBeTruthy();
  });

  it('opens the guide and toggles the language from the top bar', async () => {
    const user = userEvent.setup();
    render(<Topbar />);
    const guide = screen.getByRole('button', { name: 'Apri la guida' });
    expect(guide.getAttribute('aria-haspopup')).toBe('dialog');
    await user.click(guide);
    expect(useStore.getState().isGuideOpen).toBe(true);
    await user.click(screen.getByRole('button', { name: 'English' }));
    expect(useStore.getState().language).toBe('en');
  });

  it('opens the navigation drawer from the menu button', async () => {
    const user = userEvent.setup();
    render(<Topbar />);
    await user.click(screen.getByRole('button', { name: 'Apri il menu di navigazione' }));
    expect(useStore.getState().isNavOpen).toBe(true);
  });
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
});

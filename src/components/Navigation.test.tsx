// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navigation from './Navigation';
import { useStore } from '../store';

afterEach(() => {
  cleanup();
  useStore.setState({ activeView: 'osi', language: 'it' });
});

describe('Navigation', () => {
  it('opens a group and switches view when an entry is chosen', async () => {
    const user = userEvent.setup();
    render(<Navigation />);

    const group = screen.getByRole('button', { name: /Percorso CCNA/ });
    expect(group.getAttribute('aria-expanded')).toBe('false');
    await user.click(group);
    expect(group.getAttribute('aria-expanded')).toBe('true');

    const panel = screen.getByRole('button', { name: /^Connettività IP/ });
    await user.click(panel);

    expect(useStore.getState().activeView).toBe('routing');
    // Reaching the destination closes the chrome.
    expect(screen.getByRole('button', { name: /Percorso CCNA/ }).getAttribute('aria-expanded')).toBe('false');
  });

  it('filters every lab with the quick search and opens the chosen one', async () => {
    const user = userEvent.setup();
    render(<Navigation />);

    await user.click(screen.getByRole('button', { name: 'Cerca un laboratorio' }));
    const input = screen.getByRole('textbox', { name: 'Cerca un laboratorio' });
    await user.type(input, 'ospf');

    const results = screen.getByRole('list', { name: 'Risultati della ricerca' });
    const options = within(results).getAllByRole('button');
    expect(options.length).toBeGreaterThan(0);
    expect(options.length).toBeLessThan(10);

    await user.keyboard('{Enter}');
    expect(['routing', 'routingsecurity']).toContain(useStore.getState().activeView);
  });

  it('says so when nothing matches instead of showing an empty list', async () => {
    const user = userEvent.setup();
    render(<Navigation />);
    await user.click(screen.getByRole('button', { name: 'Cerca un laboratorio' }));
    await user.type(screen.getByRole('textbox', { name: 'Cerca un laboratorio' }), 'zzzznotathing');
    expect(screen.getByText(/Nessun laboratorio corrisponde/)).toBeTruthy();
  });

  it('marks the group that holds the active view', () => {
    useStore.setState({ activeView: 'emailsecurity' });
    render(<Navigation />);
    // The breadcrumb names the current entry, so the learner is never lost.
    expect(screen.getByText('Email e phishing')).toBeTruthy();
  });

  it('renders every label in English when the language changes', () => {
    useStore.setState({ language: 'en' });
    render(<Navigation />);
    expect(screen.getByRole('button', { name: /CCNA path/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Search for a lab' })).toBeTruthy();
  });
});

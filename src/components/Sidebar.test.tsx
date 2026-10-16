// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar from './Sidebar';
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

describe('Sidebar', () => {
  it('reveals the labs disclosure and switches view when an entry is chosen', async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

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
    render(<Sidebar />);

    const ports = screen.getByRole('link', { name: /Porte e protocolli/ });
    expect(ports.getAttribute('href')).toBe('#/ports');
    await user.click(ports);
    expect(useStore.getState().activeView).toBe('ports');
  });

  it('marks the labs disclosure as current when a lab is the active view', () => {
    useStore.setState({ activeView: 'emailsecurity' });
    render(<Sidebar />);
    // The labs group holds the active view, so its disclosure button carries aria-current
    // and the list auto-expands so the active lab is visible.
    const labs = screen.getByRole('button', { name: /Laboratori/ });
    expect(labs.getAttribute('aria-current')).toBe('true');
    expect(labs.getAttribute('aria-expanded')).toBe('true');
  });

  it('keeps the promoted Glossario and Porte out of the labs list', async () => {
    const user = userEvent.setup();
    render(<Sidebar />);
    await user.click(screen.getByRole('button', { name: /Laboratori/ }));
    // Glossario and Porte have their own top-level entries, so they must not also appear
    // as links inside the expanded labs disclosure (exactly one link each).
    expect(screen.getAllByRole('link', { name: /Glossario/ })).toHaveLength(1);
    expect(screen.getAllByRole('link', { name: /Porte e protocolli/ })).toHaveLength(1);
  });

  it('renders every destination in English when the language changes', () => {
    useStore.setState({ language: 'en' });
    render(<Sidebar />);
    expect(screen.getByRole('link', { name: /Manual/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Labs/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Glossary/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: /CCNA map/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Ports & protocols/ })).toBeTruthy();
  });

  it('opens the guide and toggles the language from the footer', async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    const guide = screen.getByRole('button', { name: 'Apri la guida' });
    expect(guide.getAttribute('aria-haspopup')).toBe('dialog');
    await user.click(guide);
    expect(useStore.getState().isGuideOpen).toBe(true);

    await user.click(screen.getByRole('button', { name: 'English' }));
    expect(useStore.getState().language).toBe('en');
  });
});

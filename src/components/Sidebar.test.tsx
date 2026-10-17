// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Topbar from './Topbar';
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

// The drawer is opened from the top bar's menu button, so the two components are
// exercised together — as they are mounted in the app.
function openDrawer() {
  render(
    <>
      <Topbar />
      <Sidebar />
    </>
  );
}

describe('Sidebar (mobile drawer)', () => {
  it('opens from the menu button and reaches a lab through the Laboratori disclosure', async () => {
    const user = userEvent.setup();
    openDrawer();

    expect(screen.queryByTestId('app-drawer')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Apri il menu di navigazione' }));

    const drawer = within(screen.getByTestId('app-drawer'));
    await user.click(drawer.getByRole('button', { name: /Laboratori/ }));
    const entry = drawer.getByRole('link', { name: /^Connettività IP/ });
    expect(entry.getAttribute('href')).toBe('#/routing');
    await user.click(entry);

    expect(useStore.getState().activeView).toBe('routing');
  });

  it('localises the drawer destinations to English', async () => {
    const user = userEvent.setup();
    useStore.setState({ language: 'en' });
    openDrawer();

    await user.click(screen.getByRole('button', { name: 'Open the navigation menu' }));
    const drawer = within(screen.getByTestId('app-drawer'));
    expect(drawer.getByRole('link', { name: /Manual/ })).toBeTruthy();
    expect(drawer.getByRole('button', { name: /Labs/ })).toBeTruthy();
    expect(drawer.getByRole('link', { name: /Glossary/ })).toBeTruthy();
    expect(drawer.getByRole('link', { name: /Ports & protocols/ })).toBeTruthy();
  });
});

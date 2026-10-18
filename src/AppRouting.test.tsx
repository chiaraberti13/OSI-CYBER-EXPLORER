// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { act, cleanup, render } from '@testing-library/react';
import App from './App';
import { useStore } from './store';
import { connectViewRouting } from './lib/viewRouting';

let disconnect: (() => void) | undefined;

afterEach(() => {
  cleanup();
  disconnect?.();
  disconnect = undefined;
  window.history.replaceState(null, '', '/');
  useStore.setState({ activeView: 'osi', language: 'it', isGuideOpen: false });
});

describe('lab routing in App', () => {
  it('updates the page title and language after a deep link, view switch and history event', () => {
    window.history.replaceState(null, '', '#/routing');
    disconnect = connectViewRouting(useStore, window);
    render(<App />);
    expect(document.title).toBe('Connettività IP — OSI Cyber Explorer');
    expect(document.documentElement.lang).toBe('it');

    act(() => useStore.getState().setLanguage('en'));
    expect(document.title).toBe('IP connectivity — OSI Cyber Explorer');
    expect(document.documentElement.lang).toBe('en');
    expect(window.location.hash).toBe('#/routing');

    act(() => useStore.getState().setActiveView('glossary'));
    expect(document.title).toBe('Glossary — OSI Cyber Explorer');
    expect(window.location.hash).toBe('#/glossary');

    act(() => {
      window.history.replaceState(null, '', '#/routing');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(document.title).toBe('IP connectivity — OSI Cyber Explorer');
  });
});

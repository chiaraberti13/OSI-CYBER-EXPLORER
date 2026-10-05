// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VIEW_ORDER, VIEW_REGISTRY } from '../content/viewRegistry';
import { useStore } from '../store';
import { connectViewRouting, resolveViewHash, viewHash, viewTitle } from './viewRouting';

let disconnect: (() => void) | undefined;

beforeEach(() => {
  window.history.replaceState({ external: true }, '', '/study/?mode=demo');
  useStore.setState({ activeView: 'osi', language: 'it' });
});

afterEach(() => {
  disconnect?.();
  disconnect = undefined;
  window.history.replaceState(null, '', '/');
  useStore.setState({ activeView: 'osi', language: 'it' });
});

describe('registry-derived routes', () => {
  it('gives every registered view one unique, round-trippable URL', () => {
    const hashes = VIEW_ORDER.map(viewHash);
    expect(new Set(hashes).size).toBe(VIEW_ORDER.length);
    for (const view of VIEW_ORDER) {
      expect(resolveViewHash(viewHash(view))).toBe(view);
    }
  });

  it('falls back safely for empty, malformed, encoded and unregistered routes', () => {
    for (const hash of [
      '', '#', '#/', '#routing', '#/missing', '#/constructor', '#/toString',
      '#/__proto__', '#/ROUTING', '#/%72outing', '#/routing/',
      '#/routing?view=glossary', '#/routing#glossary', '#//example.com',
      '#/../routing', '#/routing\u0000', '#/<script>alert(1)</script>',
    ]) {
      expect(resolveViewHash(hash), hash).toBe('osi');
    }
  });

  it('uses each registry label as the title in both languages', () => {
    for (const view of VIEW_ORDER) {
      for (const language of ['it', 'en'] as const) {
        expect(viewTitle(view, language)).toBe(`${VIEW_REGISTRY[view][language]} — OSI Cyber Explorer`);
      }
    }
  });
});

describe('browser/store connection', () => {
  it('loads every deep link before rendering, overriding stale session navigation', () => {
    for (const view of VIEW_ORDER) {
      window.history.replaceState(null, '', viewHash(view));
      useStore.setState({ activeView: 'osi' });
      const length = window.history.length;
      disconnect = connectViewRouting(useStore, window);
      expect(useStore.getState().activeView).toBe(view);
      expect(window.location.hash).toBe(viewHash(view));
      expect(window.history.length).toBe(length);
      disconnect();
    }
  });

  it('canonicalizes a missing route without adding a history entry', () => {
    const length = window.history.length;
    useStore.setState({ activeView: 'routing' });
    disconnect = connectViewRouting(useStore, window);
    expect(useStore.getState().activeView).toBe('osi');
    expect(window.location.hash).toBe('#/osi');
    expect(window.history.length).toBe(length);
  });

  it('replaces an invalid route while preserving the base path, query and existing state', () => {
    window.history.replaceState({ external: true }, '', '#/not-a-lab');
    const length = window.history.length;
    disconnect = connectViewRouting(useStore, window);
    expect(window.location.pathname).toBe('/study/');
    expect(window.location.search).toBe('?mode=demo');
    expect(window.location.hash).toBe('#/osi');
    expect(window.history.state).toEqual({ external: true });
    expect(window.history.length).toBe(length);
  });

  it('records one entry per view change, with no duplication or persisted session state', () => {
    disconnect = connectViewRouting(useStore, window);
    const length = window.history.length;
    useStore.getState().setActiveView('routing');
    expect(window.location.hash).toBe('#/routing');
    expect(window.history.length).toBe(length + 1);
    expect(window.history.state).toBeNull();
    useStore.getState().setActiveView('routing');
    useStore.getState().setLanguage('en');
    useStore.getState().setSelectedLayerId(3);
    useStore.getState().setIsGuideOpen(true);
    expect(window.history.length).toBe(length + 1);
    expect(window.location.hash).toBe('#/routing');
    useStore.getState().setIsGuideOpen(false);
  });

  it('supports real Back and Forward traversal without pushing compensating entries', async () => {
    disconnect = connectViewRouting(useStore, window);
    useStore.getState().setActiveView('routing');
    useStore.getState().setActiveView('glossary');
    const length = window.history.length;

    window.history.back();
    await vi.waitFor(() => expect(useStore.getState().activeView).toBe('routing'));
    expect(window.location.hash).toBe('#/routing');
    window.history.back();
    await vi.waitFor(() => expect(useStore.getState().activeView).toBe('osi'));
    window.history.forward();
    await vi.waitFor(() => expect(useStore.getState().activeView).toBe('routing'));
    window.history.forward();
    await vi.waitFor(() => expect(useStore.getState().activeView).toBe('glossary'));
    expect(window.history.length).toBe(length);
  });

  it('follows a native hashchange, including links opened without React interception', async () => {
    disconnect = connectViewRouting(useStore, window);
    window.location.hash = '#/services';
    await vi.waitFor(() => expect(useStore.getState().activeView).toBe('services'));
    expect(window.location.hash).toBe('#/services');
  });

  it('handles duplicate history events and invalid hashes without a navigation loop', () => {
    disconnect = connectViewRouting(useStore, window);
    useStore.getState().setActiveView('routing');
    window.history.pushState(null, '', '#/unknown');
    const length = window.history.length;
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    expect(useStore.getState().activeView).toBe('osi');
    expect(window.location.hash).toBe('#/osi');
    expect(window.history.length).toBe(length);
  });

  it('cleans up both event listeners and the store subscription, then reconnects safely', () => {
    disconnect = connectViewRouting(useStore, window);
    disconnect();
    useStore.getState().setActiveView('routing');
    expect(window.location.hash).toBe('#/osi');
    window.history.replaceState(null, '', '#/glossary');
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    expect(useStore.getState().activeView).toBe('routing');
    disconnect = connectViewRouting(useStore, window);
    expect(useStore.getState().activeView).toBe('glossary');
    useStore.getState().setActiveView('osi');
    expect(window.location.hash).toBe('#/osi');
  });
});

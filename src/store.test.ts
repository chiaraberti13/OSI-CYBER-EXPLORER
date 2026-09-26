// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_PREFERENCES,
  PREFERENCES_STORAGE_KEY,
  PREFERENCES_STORAGE_VERSION,
} from './lib/preferences';

async function loadFreshStore() {
  vi.resetModules();
  return (await import('./store')).useStore;
}

function writeStoredState(state: unknown, version: number): void {
  localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify({ state, version }));
}

describe('persisted preference rehydration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('migrates the former unversioned state and writes the current version', async () => {
    const previousPreferences = {
      language: 'en',
      audioEnabled: false,
      simSpeed: 2,
      hasSeenGuide: true,
    };
    writeStoredState(previousPreferences, 0);

    const store = await loadFreshStore();

    expect(store.getState()).toMatchObject(previousPreferences);
    expect(JSON.parse(localStorage.getItem(PREFERENCES_STORAGE_KEY) ?? '{}')).toEqual({
      state: previousPreferences,
      version: PREFERENCES_STORAGE_VERSION,
    });
  });

  it('sanitizes a tampered current-version state and ignores extra keys', async () => {
    writeStoredState({
      language: 'javascript:alert(1)',
      audioEnabled: 'false',
      simSpeed: Number.POSITIVE_INFINITY,
      hasSeenGuide: { value: true },
      logs: [{ message: 'injected session state' }],
      activeAttack: 'spoofing',
    }, PREFERENCES_STORAGE_VERSION);

    const store = await loadFreshStore();
    const state = store.getState();

    expect(state).toMatchObject(DEFAULT_PREFERENCES);
    expect(state.logs).toEqual([]);
    expect(state.activeAttack).toBe('none');
  });

  it('keeps valid fields and restores invalid fields independently', async () => {
    writeStoredState({
      language: 'en',
      audioEnabled: null,
      simSpeed: 0.5,
      hasSeenGuide: false,
    }, PREFERENCES_STORAGE_VERSION);

    const store = await loadFreshStore();

    expect(store.getState()).toMatchObject({
      language: 'en',
      audioEnabled: true,
      simSpeed: 0.5,
      hasSeenGuide: false,
    });
  });

  it('starts with defaults when the storage JSON is corrupted', async () => {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, '{"state":');

    const store = await loadFreshStore();

    expect(store.getState()).toMatchObject(DEFAULT_PREFERENCES);
  });

  it('starts with defaults rather than guessing a future schema', async () => {
    writeStoredState({
      language: 'en',
      audioEnabled: false,
      simSpeed: 2,
      hasSeenGuide: true,
    }, PREFERENCES_STORAGE_VERSION + 1);

    const store = await loadFreshStore();

    expect(store.getState()).toMatchObject(DEFAULT_PREFERENCES);
  });
});

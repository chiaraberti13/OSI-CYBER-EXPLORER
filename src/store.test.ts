// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_PREFERENCES, PREFERENCES_STORAGE_KEY, PREFERENCES_STORAGE_VERSION } from './lib/preferences';

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
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('migrates the former unversioned state and writes the current version', async () => {
    const previousPreferences = {
      language: 'en',
      audioEnabled: false,
      simSpeed: 2,
      hasSeenGuide: true
    };
    writeStoredState(previousPreferences, 0);

    const store = await loadFreshStore();

    expect(store.getState()).toMatchObject(previousPreferences);
    expect(JSON.parse(localStorage.getItem(PREFERENCES_STORAGE_KEY) ?? '{}')).toEqual({
      state: { ...previousPreferences, hasDismissedManualHelp: false, completedChapterIds: [], completedTopicIds: [] },
      version: PREFERENCES_STORAGE_VERSION
    });
  });

  it('sanitizes a tampered current-version state and ignores extra keys', async () => {
    writeStoredState(
      {
        language: 'javascript:alert(1)',
        audioEnabled: 'false',
        simSpeed: Number.POSITIVE_INFINITY,
        hasSeenGuide: { value: true },
        hasDismissedManualHelp: 'true',
        completedChapterIds: ['osi-model', 'unknown', 'osi-model'],
        logs: [{ message: 'injected session state' }],
        activeAttack: 'spoofing'
      },
      PREFERENCES_STORAGE_VERSION
    );

    const store = await loadFreshStore();
    const state = store.getState();

    expect(state).toMatchObject({ ...DEFAULT_PREFERENCES, completedChapterIds: ['osi-model'] });
    expect(state.logs).toEqual([]);
    expect(state.activeAttack).toBe('none');
    expect(state.completedChapterIds).toEqual(['osi-model']);
  });

  it('keeps valid fields and restores invalid fields independently', async () => {
    writeStoredState(
      {
        language: 'en',
        audioEnabled: null,
        simSpeed: 0.5,
        hasSeenGuide: false,
        completedChapterIds: ['ethernet-switching']
      },
      PREFERENCES_STORAGE_VERSION
    );

    const store = await loadFreshStore();

    expect(store.getState()).toMatchObject({
      language: 'en',
      audioEnabled: true,
      simSpeed: 0.5,
      hasSeenGuide: false,
      completedChapterIds: ['ethernet-switching']
    });
  });

  it('migrates existing progress from version 2 and offers manual help', async () => {
    writeStoredState({ ...DEFAULT_PREFERENCES, language: 'en', completedChapterIds: ['osi-model'] }, 2);
    const store = await loadFreshStore();

    expect(store.getState()).toMatchObject({
      language: 'en',
      completedChapterIds: ['osi-model'],
      hasDismissedManualHelp: false
    });
    expect(JSON.parse(localStorage.getItem(PREFERENCES_STORAGE_KEY) ?? '{}').version).toBe(PREFERENCES_STORAGE_VERSION);
  });

  it('remembers manual-help dismissal after rehydration without clearing progress', async () => {
    const store = await loadFreshStore();
    store.getState().toggleChapterCompleted('osi-model');
    store.getState().setHasDismissedManualHelp(true);

    const restoredStore = await loadFreshStore();
    expect(restoredStore.getState()).toMatchObject({
      hasDismissedManualHelp: true,
      completedChapterIds: ['osi-model']
    });
  });

  it('starts with defaults when the storage JSON is corrupted', async () => {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, '{"state":');

    const store = await loadFreshStore();

    expect(store.getState()).toMatchObject(DEFAULT_PREFERENCES);
  });

  it('starts with defaults rather than guessing a future schema', async () => {
    writeStoredState(
      {
        language: 'en',
        audioEnabled: false,
        simSpeed: 2,
        hasSeenGuide: true
      },
      PREFERENCES_STORAGE_VERSION + 1
    );

    const store = await loadFreshStore();

    expect(store.getState()).toMatchObject(DEFAULT_PREFERENCES);
  });

  it('persists completion toggles and can reset all chapter progress', async () => {
    const store = await loadFreshStore();

    store.getState().toggleChapterCompleted('osi-model');
    store.getState().toggleChapterCompleted('unknown');
    expect(store.getState().completedChapterIds).toEqual(['osi-model']);
    expect(JSON.parse(localStorage.getItem(PREFERENCES_STORAGE_KEY) ?? '{}').state.completedChapterIds).toEqual([
      'osi-model'
    ]);

    store.getState().resetChapterProgress();
    expect(store.getState().completedChapterIds).toEqual([]);
  });

  it('persists per-topic progress, rejects unknown topics, and resets alongside chapters', async () => {
    const store = await loadFreshStore();

    store.getState().toggleTopicCompleted('osi-why-layers');
    store.getState().toggleTopicCompleted('not-a-real-topic');
    store.getState().toggleChapterCompleted('osi-model');

    expect(store.getState().completedTopicIds).toEqual(['osi-why-layers']);
    expect(JSON.parse(localStorage.getItem(PREFERENCES_STORAGE_KEY) ?? '{}').state.completedTopicIds).toEqual([
      'osi-why-layers'
    ]);

    // Toggling again clears the single studied topic without affecting chapter progress.
    store.getState().toggleTopicCompleted('osi-why-layers');
    expect(store.getState().completedTopicIds).toEqual([]);
    expect(store.getState().completedChapterIds).toEqual(['osi-model']);

    // The single reset control clears both chapter and topic progress.
    store.getState().toggleTopicCompleted('osi-why-layers');
    store.getState().resetChapterProgress();
    expect(store.getState().completedTopicIds).toEqual([]);
    expect(store.getState().completedChapterIds).toEqual([]);
  });

  it('keeps progress usable in memory when browser storage throws', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });

    const store = await loadFreshStore();
    expect(() => store.getState().toggleChapterCompleted('osi-model')).not.toThrow();
    expect(() => store.getState().setHasDismissedManualHelp(true)).not.toThrow();
    expect(store.getState().completedChapterIds).toEqual(['osi-model']);
    expect(store.getState().hasDismissedManualHelp).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PREFERENCES,
  PREFERENCES_STORAGE_VERSION,
  SIMULATION_SPEEDS,
  isSimulationSpeed,
  migratePreferences,
  sanitizePreferences,
} from './preferences';

describe('preference schema', () => {
  it('accepts every supported value', () => {
    expect(sanitizePreferences({
      language: 'en',
      audioEnabled: false,
      simSpeed: 2,
      hasSeenGuide: true,
    })).toEqual({
      language: 'en',
      audioEnabled: false,
      simSpeed: 2,
      hasSeenGuide: true,
    });
  });

  it('restores the default for each missing or out-of-domain field', () => {
    expect(sanitizePreferences({
      language: 'fr',
      audioEnabled: 'false',
      simSpeed: 99,
      hasSeenGuide: 1,
    })).toEqual(DEFAULT_PREFERENCES);
  });

  it.each([null, undefined, 'preferences', 1, true, []])(
    'restores all defaults for a non-object payload: %j',
    (value) => {
      expect(sanitizePreferences(value)).toEqual(DEFAULT_PREFERENCES);
    },
  );

  it('preserves valid fields while replacing only invalid ones', () => {
    expect(sanitizePreferences({
      language: 'en',
      audioEnabled: 'yes',
      simSpeed: 0.5,
      hasSeenGuide: false,
    })).toEqual({
      language: 'en',
      audioEnabled: true,
      simSpeed: 0.5,
      hasSeenGuide: false,
    });
  });

  it('drops properties outside the persistence allowlist', () => {
    expect(sanitizePreferences({
      ...DEFAULT_PREFERENCES,
      logs: [{ message: 'must not be restored' }],
      activeAttack: 'spoofing',
      __proto__: { polluted: true },
    })).toEqual(DEFAULT_PREFERENCES);
  });

  it('migrates the previous unversioned schema', () => {
    expect(migratePreferences({
      language: 'en',
      audioEnabled: false,
      simSpeed: 2,
      hasSeenGuide: true,
    }, 0)).toEqual({
      language: 'en',
      audioEnabled: false,
      simSpeed: 2,
      hasSeenGuide: true,
    });
  });

  it('sanitizes tampered fields while migrating the previous schema', () => {
    expect(migratePreferences({
      language: 'en',
      audioEnabled: false,
      simSpeed: -1,
      hasSeenGuide: 'true',
    }, 0)).toEqual({
      language: 'en',
      audioEnabled: false,
      simSpeed: 1,
      hasSeenGuide: false,
    });
  });

  it.each([-1, PREFERENCES_STORAGE_VERSION + 1, 999])(
    'does not guess an unknown storage schema version: %d',
    (version) => {
      expect(migratePreferences({
        language: 'en',
        audioEnabled: false,
        simSpeed: 2,
        hasSeenGuide: true,
      }, version)).toEqual(DEFAULT_PREFERENCES);
    },
  );

  it('exposes immutable defaults and the exact speed domain', () => {
    expect(Object.isFrozen(DEFAULT_PREFERENCES)).toBe(true);
    expect(SIMULATION_SPEEDS).toEqual([0.5, 1, 2]);
    expect(SIMULATION_SPEEDS.every(isSimulationSpeed)).toBe(true);
    expect(isSimulationSpeed(Number.NaN)).toBe(false);
    expect(isSimulationSpeed('1')).toBe(false);
  });
});

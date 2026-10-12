import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PREFERENCES,
  PREFERENCES_STORAGE_VERSION,
  SIMULATION_SPEEDS,
  isSimulationSpeed,
  migratePreferences,
  sanitizePreferences
} from './preferences';

describe('preference schema', () => {
  it('accepts every supported value', () => {
    expect(
      sanitizePreferences({
        language: 'en',
        audioEnabled: false,
        simSpeed: 2,
        hasSeenGuide: true,
        hasDismissedManualHelp: true,
        completedChapterIds: ['osi-model', 'osi-model', 'not-a-chapter']
      })
    ).toEqual({
      language: 'en',
      audioEnabled: false,
      simSpeed: 2,
      hasSeenGuide: true,
      hasDismissedManualHelp: true,
      completedChapterIds: ['osi-model']
    });
  });

  it('restores the default for each missing or out-of-domain field', () => {
    expect(
      sanitizePreferences({
        language: 'fr',
        audioEnabled: 'false',
        simSpeed: 99,
        hasSeenGuide: 1,
        hasDismissedManualHelp: 'true'
      })
    ).toEqual(DEFAULT_PREFERENCES);
  });

  it.each([null, undefined, 'preferences', 1, true, []])(
    'restores all defaults for a non-object payload: %j',
    (value) => {
      expect(sanitizePreferences(value)).toEqual(DEFAULT_PREFERENCES);
    }
  );

  it('preserves valid fields while replacing only invalid ones', () => {
    expect(
      sanitizePreferences({
        language: 'en',
        audioEnabled: 'yes',
        simSpeed: 0.5,
        hasSeenGuide: false,
        completedChapterIds: ['ethernet-switching']
      })
    ).toEqual({
      language: 'en',
      audioEnabled: true,
      simSpeed: 0.5,
      hasSeenGuide: false,
      hasDismissedManualHelp: false,
      completedChapterIds: ['ethernet-switching']
    });
  });

  it('drops properties outside the persistence allowlist', () => {
    expect(
      sanitizePreferences({
        ...DEFAULT_PREFERENCES,
        logs: [{ message: 'must not be restored' }],
        activeAttack: 'spoofing',
        __proto__: { polluted: true }
      })
    ).toEqual(DEFAULT_PREFERENCES);
  });

  it('migrates the previous unversioned schema', () => {
    expect(
      migratePreferences(
        {
          language: 'en',
          audioEnabled: false,
          simSpeed: 2,
          hasSeenGuide: true
        },
        0
      )
    ).toEqual({
      language: 'en',
      audioEnabled: false,
      simSpeed: 2,
      hasSeenGuide: true,
      hasDismissedManualHelp: false,
      completedChapterIds: []
    });
  });

  it('sanitizes tampered fields while migrating the previous schema', () => {
    expect(
      migratePreferences(
        {
          language: 'en',
          audioEnabled: false,
          simSpeed: -1,
          hasSeenGuide: 'true'
        },
        0
      )
    ).toEqual({
      language: 'en',
      audioEnabled: false,
      simSpeed: 1,
      hasSeenGuide: false,
      hasDismissedManualHelp: false,
      completedChapterIds: []
    });
  });

  it('migrates version 2 without losing chapter progress and enables first-visit manual help', () => {
    expect(
      migratePreferences(
        {
          language: 'en',
          audioEnabled: false,
          simSpeed: 2,
          hasSeenGuide: true,
          completedChapterIds: ['osi-model', 'unknown', 'osi-model']
        },
        2
      )
    ).toEqual({
      language: 'en',
      audioEnabled: false,
      simSpeed: 2,
      hasSeenGuide: true,
      hasDismissedManualHelp: false,
      completedChapterIds: ['osi-model']
    });
  });

  it.each([null, 'false', 1, [], { dismissed: true }])('rejects malformed manual-help flags: %j', (value) => {
    expect(sanitizePreferences({ hasDismissedManualHelp: value }).hasDismissedManualHelp).toBe(false);
  });

  it.each([-1, PREFERENCES_STORAGE_VERSION + 1, 999])(
    'does not guess an unknown storage schema version: %d',
    (version) => {
      expect(
        migratePreferences(
          {
            language: 'en',
            audioEnabled: false,
            simSpeed: 2,
            hasSeenGuide: true
          },
          version
        )
      ).toEqual(DEFAULT_PREFERENCES);
    }
  );

  it('exposes immutable defaults and the exact speed domain', () => {
    expect(Object.isFrozen(DEFAULT_PREFERENCES)).toBe(true);
    expect(SIMULATION_SPEEDS).toEqual([0.5, 1, 2]);
    expect(SIMULATION_SPEEDS.every(isSimulationSpeed)).toBe(true);
    expect(isSimulationSpeed(Number.NaN)).toBe(false);
    expect(isSimulationSpeed('1')).toBe(false);
  });
});

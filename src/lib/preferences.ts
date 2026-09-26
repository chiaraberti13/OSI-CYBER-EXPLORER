import type { Language } from '../types';

export const PREFERENCES_STORAGE_KEY = 'osi-lab-preferences';
export const PREFERENCES_STORAGE_VERSION = 1;
export const SIMULATION_SPEEDS = [0.5, 1, 2] as const;

export type SimulationSpeed = (typeof SIMULATION_SPEEDS)[number];

export interface PersistedPreferences {
  language: Language;
  audioEnabled: boolean;
  simSpeed: SimulationSpeed;
  hasSeenGuide: boolean;
}

export const DEFAULT_PREFERENCES: Readonly<PersistedPreferences> = Object.freeze({
  language: 'it',
  audioEnabled: true,
  simSpeed: 1,
  hasSeenGuide: false,
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isSimulationSpeed(value: unknown): value is SimulationSpeed {
  return typeof value === 'number' && SIMULATION_SPEEDS.some((speed) => speed === value);
}

/**
 * Rebuilds persisted preferences from an explicit allowlist. Missing, malformed,
 * out-of-domain and unexpected values never enter the application state.
 */
export function sanitizePreferences(value: unknown): PersistedPreferences {
  if (!isRecord(value)) {
    return { ...DEFAULT_PREFERENCES };
  }

  return {
    language: value.language === 'it' || value.language === 'en'
      ? value.language
      : DEFAULT_PREFERENCES.language,
    audioEnabled: typeof value.audioEnabled === 'boolean'
      ? value.audioEnabled
      : DEFAULT_PREFERENCES.audioEnabled,
    simSpeed: isSimulationSpeed(value.simSpeed)
      ? value.simSpeed
      : DEFAULT_PREFERENCES.simSpeed,
    hasSeenGuide: typeof value.hasSeenGuide === 'boolean'
      ? value.hasSeenGuide
      : DEFAULT_PREFERENCES.hasSeenGuide,
  };
}

/**
 * Version 0 is Zustand's former unversioned flat state. Unknown old or future
 * schemas are not guessed: they are replaced with safe defaults.
 */
export function migratePreferences(value: unknown, version: number): PersistedPreferences {
  return version === 0
    ? sanitizePreferences(value)
    : { ...DEFAULT_PREFERENCES };
}

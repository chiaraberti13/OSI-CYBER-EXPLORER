import type { Language } from '../types';
import { MANUAL_ROUTE_INDEX, MANUAL_TOPIC_IDS } from '../content/manualRouteIndex';

export const PREFERENCES_STORAGE_KEY = 'osi-lab-preferences';
export const PREFERENCES_STORAGE_VERSION = 4;
export const SIMULATION_SPEEDS = [0.5, 1, 2] as const;

export type SimulationSpeed = (typeof SIMULATION_SPEEDS)[number];

export interface PersistedPreferences {
  language: Language;
  audioEnabled: boolean;
  simSpeed: SimulationSpeed;
  hasSeenGuide: boolean;
  hasDismissedManualHelp: boolean;
  completedChapterIds: string[];
  completedTopicIds: string[];
}

export const DEFAULT_PREFERENCES: Readonly<PersistedPreferences> = Object.freeze({
  language: 'it',
  audioEnabled: true,
  simSpeed: 1,
  hasSeenGuide: false,
  hasDismissedManualHelp: false,
  completedChapterIds: [],
  completedTopicIds: []
});

const MANUAL_CHAPTER_IDS = new Set(MANUAL_ROUTE_INDEX.map((chapter) => chapter.id));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isSimulationSpeed(value: unknown): value is SimulationSpeed {
  return typeof value === 'number' && SIMULATION_SPEEDS.some((speed) => speed === value);
}

function sanitizeCompletedChapterIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id): id is string => typeof id === 'string' && MANUAL_CHAPTER_IDS.has(id)))];
}

function sanitizeCompletedTopicIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id): id is string => typeof id === 'string' && MANUAL_TOPIC_IDS.has(id)))];
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
    language: value.language === 'it' || value.language === 'en' ? value.language : DEFAULT_PREFERENCES.language,
    audioEnabled: typeof value.audioEnabled === 'boolean' ? value.audioEnabled : DEFAULT_PREFERENCES.audioEnabled,
    simSpeed: isSimulationSpeed(value.simSpeed) ? value.simSpeed : DEFAULT_PREFERENCES.simSpeed,
    hasSeenGuide: typeof value.hasSeenGuide === 'boolean' ? value.hasSeenGuide : DEFAULT_PREFERENCES.hasSeenGuide,
    hasDismissedManualHelp:
      typeof value.hasDismissedManualHelp === 'boolean'
        ? value.hasDismissedManualHelp
        : DEFAULT_PREFERENCES.hasDismissedManualHelp,
    completedChapterIds: sanitizeCompletedChapterIds(value.completedChapterIds),
    completedTopicIds: sanitizeCompletedTopicIds(value.completedTopicIds)
  };
}

/**
 * Versions 0 and 1 predate chapter progress; version 2 predates manual help;
 * version 3 predates per-topic progress (EDU-PROG). Each retained schema is
 * re-sanitized, so a missing `completedTopicIds` simply defaults to empty and
 * earlier chapter progress is preserved. Unknown schemas are not guessed.
 */
export function migratePreferences(value: unknown, version: number): PersistedPreferences {
  return version === 0 || version === 1 || version === 2 || version === 3
    ? sanitizePreferences(value)
    : { ...DEFAULT_PREFERENCES };
}

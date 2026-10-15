import { create, type StateCreator } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import type { AttackType, Language, LogEntry, OsiLayerId, PacketHeader, SimulationState } from './types';
import type { SimProtocol } from './lib/osi';
import {
  DEFAULT_PREFERENCES,
  PREFERENCES_STORAGE_KEY,
  PREFERENCES_STORAGE_VERSION,
  isSimulationSpeed,
  migratePreferences,
  sanitizePreferences
} from './lib/preferences';
import type { SimulationSpeed } from './lib/preferences';
import { findChapter } from './lib/studyManual';

export type AppView =
  | 'manual'
  | 'curriculum'
  | 'pathtrace'
  | 'fundamentals'
  | 'access'
  | 'routing'
  | 'services'
  | 'securitycore'
  | 'automation'
  | 'coverage'
  | 'attackpaths'
  | 'hardening'
  | 'detection'
  | 'recovery'
  | 'ipv6security'
  | 'segmentation'
  | 'identitytrust'
  | 'routingsecurity'
  | 'wirelesssecurity'
  | 'vpnsecurity'
  | 'availability'
  | 'inspection'
  | 'managementsecurity'
  | 'endpointsecurity'
  | 'applicationsecurity'
  | 'emailsecurity'
  | 'layer2security'
  | 'defense'
  | 'evidence'
  | 'osi'
  | 'attacklab'
  | 'ports'
  | 'security'
  | 'scanstates'
  | 'glossary';

export interface PreferencesSlice {
  language: Language;
  setLanguage: (language: Language) => void;
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
  simSpeed: SimulationSpeed;
  setSimSpeed: (speed: SimulationSpeed) => void;
  hasSeenGuide: boolean;
  setHasSeenGuide: (seen: boolean) => void;
  hasDismissedManualHelp: boolean;
  setHasDismissedManualHelp: (dismissed: boolean) => void;
}

export interface ProgressSlice {
  completedChapterIds: string[];
  toggleChapterCompleted: (id: string) => void;
  resetChapterProgress: () => void;
}

export interface NavigationSlice {
  selectedLayerId: OsiLayerId;
  setSelectedLayerId: (id: OsiLayerId) => void;
  viewMode: 'theory' | 'packet';
  setViewMode: (mode: 'theory' | 'packet') => void;
  detailTab: 'overview' | 'attacks' | 'defenses' | 'security';
  setDetailTab: (tab: 'overview' | 'attacks' | 'defenses' | 'security') => void;
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  /** The manual chapter addressed by the URL (`#/manual/<id>`); null at the manual root. */
  activeChapterId: string | null;
  setActiveChapter: (id: string | null) => void;
  /** The chapter topic addressed by the URL (`#/manual/<id>/<topic>`); null when none (UX-29). */
  activeTopicId: string | null;
  setActiveTopic: (id: string | null) => void;
  /** Apply a full manual route (view + chapter + topic) in one update, for the router. */
  applyRoute: (view: AppView, chapterId: string | null, topicId: string | null) => void;
}

export interface SimulationSlice {
  simulationState: SimulationState;
  setSimulationState: (state: SimulationState) => void;
  activeAttack: AttackType;
  setActiveAttack: (attack: AttackType) => void;
  activeScenarioId: string | null;
  setActiveScenarioId: (id: string | null) => void;
  defenseEnabled: boolean;
  setDefenseEnabled: (enabled: boolean) => void;
  logs: LogEntry[];
  addLog: (message: string, type?: LogEntry['type']) => void;
  clearLogs: () => void;
  packetHeaders: PacketHeader[];
  addPacketHeader: (header: PacketHeader) => void;
  clearPacketHeaders: () => void;
  currentStep: OsiLayerId;
  setCurrentStep: (step: OsiLayerId) => void;
  selectedProtocol: SimProtocol;
  setSelectedProtocol: (protocol: SimProtocol) => void;
  hasSimulated: boolean;
  setHasSimulated: (has: boolean) => void;
  isPaused: boolean;
  setIsPaused: (isPaused: boolean) => void;
}

export interface UiSlice {
  isGuideOpen: boolean;
  setIsGuideOpen: (open: boolean) => void;
}

export type AppState = PreferencesSlice & ProgressSlice & NavigationSlice & SimulationSlice & UiSlice;
type Slice<T> = StateCreator<AppState, [], [], T>;

const createPreferencesSlice: Slice<PreferencesSlice> = (set) => ({
  language: DEFAULT_PREFERENCES.language,
  setLanguage: (language) => set({ language }),
  audioEnabled: DEFAULT_PREFERENCES.audioEnabled,
  setAudioEnabled: (audioEnabled) => set({ audioEnabled }),
  simSpeed: DEFAULT_PREFERENCES.simSpeed,
  setSimSpeed: (simSpeed) =>
    set({
      simSpeed: isSimulationSpeed(simSpeed) ? simSpeed : DEFAULT_PREFERENCES.simSpeed
    }),
  hasSeenGuide: DEFAULT_PREFERENCES.hasSeenGuide,
  setHasSeenGuide: (hasSeenGuide) => set({ hasSeenGuide }),
  hasDismissedManualHelp: DEFAULT_PREFERENCES.hasDismissedManualHelp,
  setHasDismissedManualHelp: (hasDismissedManualHelp) => set({ hasDismissedManualHelp })
});

const createNavigationSlice: Slice<NavigationSlice> = (set) => ({
  selectedLayerId: 7,
  setSelectedLayerId: (selectedLayerId) => set({ selectedLayerId, viewMode: 'theory' }),
  viewMode: 'theory',
  setViewMode: (viewMode) => set({ viewMode }),
  detailTab: 'overview',
  setDetailTab: (detailTab) => set({ detailTab }),
  activeView: 'manual',
  setActiveView: (activeView) => set({ activeView }),
  activeChapterId: null,
  // Unknown ids collapse to null so a tampered URL can never select a missing chapter.
  // Changing chapter clears the topic anchor — the new chapter has its own topics.
  setActiveChapter: (id) => set({ activeChapterId: id && findChapter(id) ? id : null, activeTopicId: null }),
  activeTopicId: null,
  setActiveTopic: (id) =>
    set((state) => {
      const chapter = state.activeChapterId ? findChapter(state.activeChapterId) : undefined;
      return { activeTopicId: id && chapter?.topics.some((topic) => topic.id === id) ? id : null };
    }),
  // Set view, chapter and topic in a single update so the router never observes an
  // inconsistent intermediate state (which would push a wrong URL during traversal).
  applyRoute: (view, chapterId, topicId) => {
    const chapter = chapterId ? findChapter(chapterId) : undefined;
    set({
      activeView: view,
      activeChapterId: chapter ? chapter.id : null,
      activeTopicId: chapter && topicId && chapter.topics.some((topic) => topic.id === topicId) ? topicId : null
    });
  }
});

const createProgressSlice: Slice<ProgressSlice> = (set) => ({
  completedChapterIds: DEFAULT_PREFERENCES.completedChapterIds,
  toggleChapterCompleted: (id) => {
    if (!findChapter(id)) return;
    set((state) => ({
      completedChapterIds: state.completedChapterIds.includes(id)
        ? state.completedChapterIds.filter((chapterId) => chapterId !== id)
        : [...state.completedChapterIds, id]
    }));
  },
  resetChapterProgress: () => set({ completedChapterIds: [] })
});

const createSimulationSlice: Slice<SimulationSlice> = (set) => ({
  simulationState: 'idle',
  setSimulationState: (simulationState) =>
    set((state) => ({
      simulationState,
      hasSimulated: simulationState !== 'idle' ? true : state.hasSimulated
    })),
  activeAttack: 'none',
  setActiveAttack: (activeAttack) => set({ activeAttack }),
  activeScenarioId: null,
  setActiveScenarioId: (activeScenarioId) => set({ activeScenarioId }),
  defenseEnabled: false,
  setDefenseEnabled: (defenseEnabled) => set({ defenseEnabled }),
  logs: [],
  addLog: (message, type = 'info') =>
    set((state) => ({
      logs: [...state.logs, { timestamp: new Date().toLocaleTimeString(), message, type }].slice(-50)
    })),
  clearLogs: () => set({ logs: [] }),
  packetHeaders: [],
  addPacketHeader: (header) =>
    set((state) => ({
      packetHeaders: [...state.packetHeaders, header]
    })),
  clearPacketHeaders: () => set({ packetHeaders: [] }),
  currentStep: 7,
  setCurrentStep: (currentStep) => set({ currentStep }),
  selectedProtocol: 'HTTP',
  setSelectedProtocol: (selectedProtocol) => set({ selectedProtocol }),
  hasSimulated: false,
  setHasSimulated: (hasSimulated) => set({ hasSimulated }),
  isPaused: false,
  setIsPaused: (isPaused) => set({ isPaused })
});

const createUiSlice: Slice<UiSlice> = (set) => ({
  isGuideOpen: false,
  setIsGuideOpen: (isGuideOpen) => set({ isGuideOpen })
});

// Some privacy modes, embedded browsers and test environments expose Storage but
// throw on access. Keep preferences usable for the current session in that case.
const memoryStorage = new Map<string, string>();
const safePreferenceStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name) ?? memoryStorage.get(name) ?? null;
    } catch {
      return memoryStorage.get(name) ?? null;
    }
  },
  setItem: (name, value) => {
    memoryStorage.set(name, value);
    try {
      localStorage.setItem(name, value);
    } catch {
      // The in-memory copy remains available for this session.
    }
  },
  removeItem: (name) => {
    memoryStorage.delete(name);
    try {
      localStorage.removeItem(name);
    } catch {
      // Storage is unavailable; the in-memory copy was still removed.
    }
  }
};

export const useStore = create<AppState>()(
  persist(
    (...args) => ({
      ...createPreferencesSlice(...args),
      ...createProgressSlice(...args),
      ...createNavigationSlice(...args),
      ...createSimulationSlice(...args),
      ...createUiSlice(...args)
    }),
    {
      name: PREFERENCES_STORAGE_KEY,
      storage: createJSONStorage(() => safePreferenceStorage),
      version: PREFERENCES_STORAGE_VERSION,
      migrate: migratePreferences,
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...sanitizePreferences(persistedState)
      }),
      // These non-secret preferences intentionally remain inspectable in localStorage.
      // Never persist transient session state (logs, simulation status, active attack),
      // so a reload always starts clean.
      partialize: (state) => ({
        language: state.language,
        audioEnabled: state.audioEnabled,
        simSpeed: state.simSpeed,
        hasSeenGuide: state.hasSeenGuide,
        hasDismissedManualHelp: state.hasDismissedManualHelp,
        completedChapterIds: state.completedChapterIds
      })
    }
  )
);

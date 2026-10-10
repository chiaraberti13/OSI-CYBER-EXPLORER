import { create, type StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AttackType,
  Language,
  LogEntry,
  OsiLayerId,
  PacketHeader,
  SimulationState,
} from './types';
import type { SimProtocol } from './lib/osi';
import {
  DEFAULT_PREFERENCES,
  PREFERENCES_STORAGE_KEY,
  PREFERENCES_STORAGE_VERSION,
  isSimulationSpeed,
  migratePreferences,
  sanitizePreferences,
} from './lib/preferences';
import type { SimulationSpeed } from './lib/preferences';

export type AppView = 'manual' | 'curriculum' | 'pathtrace' | 'fundamentals' | 'access' | 'routing' | 'services' | 'securitycore' | 'automation' | 'coverage' | 'attackpaths' | 'hardening' | 'detection' | 'recovery' | 'ipv6security' | 'segmentation' | 'identitytrust' | 'routingsecurity' | 'wirelesssecurity' | 'vpnsecurity' | 'availability' | 'inspection' | 'managementsecurity' | 'endpointsecurity' | 'applicationsecurity' | 'emailsecurity' | 'layer2security' | 'defense' | 'evidence' | 'osi' | 'attacklab' | 'ports' | 'security' | 'glossary';

export interface PreferencesSlice {
  language: Language;
  setLanguage: (language: Language) => void;
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
  simSpeed: SimulationSpeed;
  setSimSpeed: (speed: SimulationSpeed) => void;
  hasSeenGuide: boolean;
  setHasSeenGuide: (seen: boolean) => void;
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

export type AppState = PreferencesSlice & NavigationSlice & SimulationSlice & UiSlice;
type Slice<T> = StateCreator<AppState, [], [], T>;

const createPreferencesSlice: Slice<PreferencesSlice> = (set) => ({
  language: DEFAULT_PREFERENCES.language,
  setLanguage: (language) => set({ language }),
  audioEnabled: DEFAULT_PREFERENCES.audioEnabled,
  setAudioEnabled: (audioEnabled) => set({ audioEnabled }),
  simSpeed: DEFAULT_PREFERENCES.simSpeed,
  setSimSpeed: (simSpeed) => set({
    simSpeed: isSimulationSpeed(simSpeed) ? simSpeed : DEFAULT_PREFERENCES.simSpeed,
  }),
  hasSeenGuide: DEFAULT_PREFERENCES.hasSeenGuide,
  setHasSeenGuide: (hasSeenGuide) => set({ hasSeenGuide }),
});

const createNavigationSlice: Slice<NavigationSlice> = (set) => ({
  selectedLayerId: 7,
  setSelectedLayerId: (selectedLayerId) => set({ selectedLayerId, viewMode: 'theory' }),
  viewMode: 'theory',
  setViewMode: (viewMode) => set({ viewMode }),
  detailTab: 'overview',
  setDetailTab: (detailTab) => set({ detailTab }),
  activeView: 'osi',
  setActiveView: (activeView) => set({ activeView }),
});

const createSimulationSlice: Slice<SimulationSlice> = (set) => ({
  simulationState: 'idle',
  setSimulationState: (simulationState) => set((state) => ({
    simulationState,
    hasSimulated: simulationState !== 'idle' ? true : state.hasSimulated,
  })),
  activeAttack: 'none',
  setActiveAttack: (activeAttack) => set({ activeAttack }),
  activeScenarioId: null,
  setActiveScenarioId: (activeScenarioId) => set({ activeScenarioId }),
  defenseEnabled: false,
  setDefenseEnabled: (defenseEnabled) => set({ defenseEnabled }),
  logs: [],
  addLog: (message, type = 'info') => set((state) => ({
    logs: [
      ...state.logs,
      { timestamp: new Date().toLocaleTimeString(), message, type },
    ].slice(-50),
  })),
  clearLogs: () => set({ logs: [] }),
  packetHeaders: [],
  addPacketHeader: (header) => set((state) => ({
    packetHeaders: [...state.packetHeaders, header],
  })),
  clearPacketHeaders: () => set({ packetHeaders: [] }),
  currentStep: 7,
  setCurrentStep: (currentStep) => set({ currentStep }),
  selectedProtocol: 'HTTP',
  setSelectedProtocol: (selectedProtocol) => set({ selectedProtocol }),
  hasSimulated: false,
  setHasSimulated: (hasSimulated) => set({ hasSimulated }),
  isPaused: false,
  setIsPaused: (isPaused) => set({ isPaused }),
});

const createUiSlice: Slice<UiSlice> = (set) => ({
  isGuideOpen: false,
  setIsGuideOpen: (isGuideOpen) => set({ isGuideOpen }),
});

export const useStore = create<AppState>()(
  persist(
    (...args) => ({
      ...createPreferencesSlice(...args),
      ...createNavigationSlice(...args),
      ...createSimulationSlice(...args),
      ...createUiSlice(...args),
    }),
    {
      name: PREFERENCES_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      version: PREFERENCES_STORAGE_VERSION,
      migrate: migratePreferences,
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...sanitizePreferences(persistedState),
      }),
      // These non-secret preferences intentionally remain inspectable in localStorage.
      // Never persist transient session state (logs, simulation status, active attack),
      // so a reload always starts clean.
      partialize: (state) => ({
        language: state.language,
        audioEnabled: state.audioEnabled,
        simSpeed: state.simSpeed,
        hasSeenGuide: state.hasSeenGuide,
      }),
    },
  ),
);

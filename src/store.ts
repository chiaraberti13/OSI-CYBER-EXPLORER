import { create } from 'zustand';
import { Language, LogEntry, SimulationState, AttackType, PacketHeader } from './types';

interface AppState {
  language: Language;
  setLanguage: (lang: Language) => void;
  
  selectedLayerId: number;
  setSelectedLayerId: (id: number) => void;

  viewMode: 'theory' | 'packet';
  setViewMode: (mode: 'theory' | 'packet') => void;
  
  simulationState: SimulationState;
  setSimulationState: (state: SimulationState) => void;
  
  activeAttack: AttackType;
  setActiveAttack: (attack: AttackType) => void;
  
  activeScenarioId: string | null;
  setActiveScenarioId: (id: string | null) => void;
  
  isGlossaryOpen: boolean;
  setIsGlossaryOpen: (open: boolean) => void;

  isPortsOpen: boolean;
  setIsPortsOpen: (open: boolean) => void;

  isGuideOpen: boolean;
  setIsGuideOpen: (open: boolean) => void;

  isQuizOpen: boolean;
  setIsQuizOpen: (open: boolean) => void;
  
  quizScore: number;
  incrementQuizScore: () => void;
  resetQuizScore: () => void;
  
  defenseEnabled: boolean;
  setDefenseEnabled: (enabled: boolean) => void;
  
  logs: LogEntry[];
  addLog: (message: string, type?: LogEntry['type']) => void;
  clearLogs: () => void;
  
  packetHeaders: PacketHeader[];
  addPacketHeader: (header: PacketHeader) => void;
  clearPacketHeaders: () => void;
  
  currentStep: number;
  setCurrentStep: (step: number) => void;
  
  selectedProtocol: 'HTTP' | 'DNS' | 'BGP' | 'SSH' | 'FTP' | 'SMTP';
  setSelectedProtocol: (protocol: 'HTTP' | 'DNS' | 'BGP' | 'SSH' | 'FTP' | 'SMTP') => void;

  detailTab: 'overview' | 'attacks' | 'defenses' | 'security';
  setDetailTab: (tab: 'overview' | 'attacks' | 'defenses' | 'security') => void;
  
  hasSimulated: boolean;
  setHasSimulated: (has: boolean) => void;

  isPaused: boolean;
  setIsPaused: (isPaused: boolean) => void;

  activeView: 'osi' | 'ports' | 'security' | 'glossary' | 'quiz';
  setActiveView: (view: 'osi' | 'ports' | 'security' | 'glossary' | 'quiz') => void;

  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  language: 'it',
  setLanguage: (language) => set({ language }),
  
  selectedLayerId: 7,
  setSelectedLayerId: (selectedLayerId) => set({ selectedLayerId, viewMode: 'theory' }),

  viewMode: 'theory',
  setViewMode: (viewMode) => set({ viewMode }),
  
  simulationState: 'idle',
  setSimulationState: (simulationState) => set((state) => ({ 
    simulationState,
    hasSimulated: simulationState !== 'idle' ? true : state.hasSimulated
  })),
  
  activeAttack: 'none',
  setActiveAttack: (activeAttack) => set({ activeAttack }),
  
  activeScenarioId: null,
  setActiveScenarioId: (activeScenarioId) => set({ activeScenarioId }),
  
  isGlossaryOpen: false,
  setIsGlossaryOpen: (isGlossaryOpen) => set({ isGlossaryOpen }),

  isPortsOpen: false,
  setIsPortsOpen: (isPortsOpen) => set({ isPortsOpen }),

  isGuideOpen: false,
  setIsGuideOpen: (isGuideOpen) => set({ isGuideOpen }),

  isQuizOpen: false,
  setIsQuizOpen: (isQuizOpen) => set({ isQuizOpen }),
  
  quizScore: 0,
  incrementQuizScore: () => set((state) => ({ quizScore: state.quizScore + 1 })),
  resetQuizScore: () => set({ quizScore: 0 }),
  
  defenseEnabled: false,
  setDefenseEnabled: (defenseEnabled) => set({ defenseEnabled }),
  
  logs: [],
  addLog: (message, type = 'info') => set((state) => ({
    logs: [
      ...state.logs,
      { timestamp: new Date().toLocaleTimeString(), message, type }
    ].slice(-50) // Keep last 50 logs
  })),
  clearLogs: () => set({ logs: [] }),
  
  packetHeaders: [],
  addPacketHeader: (header) => set((state) => ({
    packetHeaders: [...state.packetHeaders, header]
  })),
  clearPacketHeaders: () => set({ packetHeaders: [] }),
  
  currentStep: 7,
  setCurrentStep: (currentStep) => set({ currentStep }),

  selectedProtocol: 'HTTP',
  setSelectedProtocol: (selectedProtocol) => set({ selectedProtocol }),

  isPaused: false,
  setIsPaused: (isPaused) => set({ isPaused }),

  hasSimulated: false,
  setHasSimulated: (hasSimulated) => set({ hasSimulated }),

  detailTab: 'overview',
  setDetailTab: (detailTab) => set({ detailTab }),

  activeView: 'osi',
  setActiveView: (activeView) => set({ activeView }),

  audioEnabled: true,
  setAudioEnabled: (audioEnabled) => set({ audioEnabled }),
}));

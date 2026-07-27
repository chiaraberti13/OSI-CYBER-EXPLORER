export type Language = 'it' | 'en';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface Attack {
  name: string;
  type?: AttackType;
  description: string;
  howItWorks: string;
  impact: string;
  mitigation_strategy: string;
  severity: Severity;
  protocols?: string[];
}

export interface Defense {
  name: string;
  description: string;
  method: string;
  counters?: string[];
  protocols?: string[];
}

export interface Translation {
  name: string;
  description: string;
  responsibilities?: string[];
  useCases?: string[];
  keyFacts?: string[];
  attacks?: Attack[];
  defenses?: Defense[];
  protocols?: string[];
}

export interface LayerData {
  id: number;
  name: string;
  color: string;
  pdu: string;
  translations: {
    it: Translation;
    en: Translation;
  };
}

export interface PacketHeader {
  layer: number;
  protocol: string;
  details: string;
  pduName: string;
  fields?: { key: string; value: string }[];
}

export interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'danger' | 'success';
}

export type SimulationState = 'idle' | 'encapsulating' | 'decapsulating' | 'interrupted';
export type AttackType = 'mitm' | 'dos' | 'injection' | 'spoofing' | 'replay' | 'eavesdropping' | 'bruteforce' | 'malware' | 'none';

export interface AttackScenario {
  id: string;
  name: { it: string; en: string };
  description: { it: string; en: string };
  recommendedDefense: { it: string; en: string };
  targetLayer: number;
  attackType: AttackType;
  defenseEnabled?: boolean;
}

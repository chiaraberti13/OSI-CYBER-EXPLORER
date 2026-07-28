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

export type Bilingual = { it: string; en: string };

// One step in an attack's "kill chain" — used by the step-by-step Attack & Defense Lab
// to show HOW an attack unfolds and, when a defense is active, WHERE it is stopped.
export type StepActor = 'attacker' | 'victim' | 'network' | 'defense';

export interface AttackStep {
  actor: StepActor;
  title: Bilingual;
  detail: Bilingual;
  packet?: string; // optional raw payload / technical label shown in monospace
}

export interface AttackWalkthrough {
  scenarioId: string; // links to an AttackScenario id
  layer: number;
  severity: Severity;
  goal: Bilingual;            // what the attacker is trying to achieve
  steps: AttackStep[];        // the attack unfolding, in order
  neutralizeAtStep: number;   // 0-based index of the step where the defense intercepts
  defense: {
    name: Bilingual;
    action: Bilingual;        // what the countermeasure does at the interception point
    mechanism: Bilingual;     // why/how it works
  };
  outcomeSuccess: Bilingual;  // consequence if the attack completes unopposed
  outcomeBlocked: Bilingual;  // consequence once the defense neutralizes it
}

export interface AttackScenario {
  id: string;
  name: { it: string; en: string };
  description: { it: string; en: string };
  recommendedDefense: { it: string; en: string };
  targetLayer: number;
  attackType: AttackType;
  defenseEnabled?: boolean;
}

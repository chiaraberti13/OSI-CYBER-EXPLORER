/**
 * Pure, framework-free state machine for the OSI Packet Simulator.
 *
 * All timing, OSI encapsulation/decapsulation transitions, packet-header
 * generation and per-protocol profiles live here as a discriminated
 * reducer so they can be unit-tested with fake timers and plain data,
 * independently of React or the Zustand store. `PacketSimulator.tsx` only
 * wires the resulting effects into the store and drives the timer.
 *
 * The reducer never performs side effects itself: each transition returns
 * the next machine state plus an ordered list of `SimEffect`s (logs, header
 * additions, layer selection, audio cues) that the host applies. This keeps
 * the engine deterministic and makes every log line and header assertable.
 */

import { OSI_LAYERS } from '../content/osiLayers';
import type { AttackType, Language, LogEntry, OsiLayerId, PacketHeader } from '../types';
import { l4ProtocolFor, pduNameForLayer, type SimProtocol } from './osi';

/** Audio feedback cue identifiers, mirrored by `playAudioCue` in utils/audio. */
export type AudioCue = 'success' | 'alert' | 'step' | 'start';

/** Severity of a simulation log line, shared with the store's log entries. */
export type LogSeverity = LogEntry['type'];

/** A single key/value row shown inside an inspected packet header. */
export interface HeaderField {
  key: string;
  value: string;
}

/** Phase of the encapsulation/decapsulation flow. */
export type SimPhase = 'idle' | 'encapsulating' | 'decapsulating' | 'interrupted';

/**
 * A declarative side effect produced by a transition. The host (the React
 * component) is responsible for turning each into a store mutation or an
 * audio cue; the reducer stays pure.
 */
export type SimEffect =
  | { kind: 'clearHeaders' }
  | { kind: 'clearAttack' }
  | { kind: 'log'; message: string; severity: LogSeverity }
  | { kind: 'addHeader'; header: PacketHeader }
  | { kind: 'selectLayer'; layerId: OsiLayerId }
  | { kind: 'audio'; cue: AudioCue };

/**
 * Inputs that influence a transition but are owned elsewhere (the store):
 * the selected protocol, any injected attack, whether a defense is active and
 * the current UI language used to localise log lines.
 */
export interface SimContext {
  protocol: SimProtocol;
  attack: AttackType;
  defenseEnabled: boolean;
  language: Language;
}

/** Actions that drive the simulation machine. */
export type SimAction =
  | { type: 'START' }
  | { type: 'TICK' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESET' };

/** The engine's own state: phase, the OSI layer currently processed and pause flag. */
export interface SimMachineState {
  phase: SimPhase;
  currentStep: OsiLayerId;
  paused: boolean;
}

/** Result of a transition: the next state and the effects to apply, in order. */
export interface SimResult {
  state: SimMachineState;
  effects: SimEffect[];
}

/** Top OSI layer (Application) — where encapsulation starts and decapsulation ends. */
export const TOP_LAYER: OsiLayerId = 7;
/** Bottom OSI layer (Physical) — the transmission boundary between TX and RX. */
export const BOTTOM_LAYER: OsiLayerId = 1;
/** Step the machine resets to (Application layer). */
export const INITIAL_STEP: OsiLayerId = TOP_LAYER;

/** The idle machine state used on first render and after a reset. */
export const INITIAL_SIM_STATE: SimMachineState = {
  phase: 'idle',
  currentStep: INITIAL_STEP,
  paused: false,
};

/**
 * Protocol/header name shown for a given OSI layer. L7 is the application
 * protocol itself, L6 is TLS for HTTPS (otherwise a conceptual representation
 * label), L5 a conceptual session label, L4 the transport protocol (TCP/UDP),
 * L3 IP and L2 Ethernet II. Any other layer falls back to the first protocol
 * declared for it in the OSI content, or `Data`.
 */
export function headerNameForLayer(layerId: number, protocol: SimProtocol, language: Language): string {
  if (layerId === 7) return protocol;
  if (layerId === 6) return protocol === 'HTTPS' ? 'TLS' : language === 'it' ? 'Rappresentazione' : 'Representation';
  if (layerId === 5) return language === 'it' ? 'Funzioni di sessione' : 'Session functions';
  if (layerId === 4) return l4ProtocolFor(protocol);
  if (layerId === 3) return 'IP';
  if (layerId === 2) return 'Ethernet II';
  const layer = OSI_LAYERS.find((l) => l.id === layerId);
  return layer?.translations[language].protocols?.[0] ?? 'Data';
}

/** Startup log line shown when a protocol's encapsulation begins. */
export function startupLogMessage(protocol: SimProtocol, language: Language): string {
  const en = language === 'en';
  switch (protocol) {
    case 'HTTP':
      return en
        ? 'HTTP: TCP session established; preparing a cleartext request.'
        : 'HTTP: sessione TCP stabilita; preparazione della richiesta in chiaro.';
    case 'HTTPS':
      return en
        ? 'HTTPS: TCP and TLS sessions established; preparing encrypted application data.'
        : 'HTTPS: sessioni TCP e TLS stabilite; preparazione dei dati applicativi cifrati.';
    case 'SSH':
      return en
        ? 'SSH Session: Initiating Diffie-Hellman Key Exchange...'
        : 'Sessione SSH: Avvio scambio chiavi Diffie-Hellman...';
    case 'FTP':
      return en
        ? 'FTP Control: Connecting to command port 21...'
        : 'Controllo FTP: Connessione alla porta comandi 21...';
    case 'SMTP':
      return en
        ? 'SMTP Session: Sending EHLO to mail gateway...'
        : 'Sessione SMTP: Invio EHLO al gateway di posta...';
    case 'DNS':
      return en ? 'DNS Query: Resolving domain name...' : 'Query DNS: Risoluzione nome dominio...';
    case 'BGP':
      return en ? 'BGP Update: Announcing IP prefix...' : 'Update BGP: Annuncio prefisso IP...';
    default:
      return en
        ? 'Packet Preparation: Initializing new sequence...'
        : 'Preparazione Pacchetto: Inizializzazione nuova sequenza...';
  }
}

/**
 * Per-protocol encapsulation profile: the human-readable `details` line and
 * the inspectable header `fields` added at a given OSI layer. All values are
 * inert, documentation-only examples (RFC 5737 / RFC 2606 ranges) and carry
 * no language-specific text, so the result is deterministic per (step, protocol).
 */
export function buildEncapsulationHeader(
  step: number,
  protocol: SimProtocol,
): { details: string; fields: HeaderField[] } {
  let details = `L${step} Header Added`;
  let fields: HeaderField[] = [];

  if (protocol === 'HTTP' || protocol === 'HTTPS') {
    const secureWeb = protocol === 'HTTPS';
    if (step === 7) {
      details = 'GET /index.html HTTP/1.1';
      fields = [
        { key: 'Method', value: 'GET' },
        { key: 'Path', value: '/index.html' },
        { key: 'Host', value: 'example.com' },
        { key: 'Agent', value: 'Mozilla/5.0' },
      ];
    } else if (step === 6) {
      details = secureWeb
        ? 'TLS 1.3 record: encrypted HTTP application data'
        : 'Representation: UTF-8 content, no generic L6 header';
      fields = secureWeb
        ? [
            { key: 'Record', value: 'Application Data' },
            { key: 'Version', value: 'TLS 1.3' },
            { key: 'Content', value: 'Encrypted' },
          ]
        : [
            { key: 'Charset', value: 'UTF-8' },
            { key: 'Encryption', value: 'None' },
          ];
    } else if (step === 5) {
      details = 'Session semantics: no universal OSI Layer 5 header';
      fields = [
        { key: 'Model', value: 'Conceptual OSI function' },
        { key: 'State', value: 'Established' },
      ];
    } else if (step === 4) {
      details = `TCP: PSH, ACK, destination port ${secureWeb ? '443' : '80'}`;
      fields = [
        { key: 'SrcPort', value: '54321' },
        { key: 'DstPort', value: secureWeb ? '443' : '80' },
        { key: 'SeqNo', value: '120485' },
        { key: 'Flags', value: 'PSH, ACK' },
      ];
    } else if (step === 3) {
      details = 'IPv4: 192.168.1.10 -> 198.51.100.14';
      fields = [
        { key: 'SrcIP', value: '192.168.1.10' },
        { key: 'DstIP', value: '198.51.100.14' },
        { key: 'TTL', value: '64' },
        { key: 'Proto', value: '0x06 (TCP)' },
      ];
    } else if (step === 2) {
      details = 'MAC: 00:0C:29... -> 00:50:56...';
      fields = [
        { key: 'SrcMAC', value: '00:0C:29:C0:00:08' },
        { key: 'DstMAC', value: '00:50:56:C0:00:01' },
        { key: 'VLAN', value: '10' },
      ];
    }
  } else if (protocol === 'SSH') {
    if (step === 7) {
      details = 'SSH-2.0-OpenSSH_8.9: Encrypted Payload';
      fields = [
        { key: 'MsgId', value: '34' },
        { key: 'EncData', value: '4f2a...88bc' },
        { key: 'MAC', value: 'SHA256' },
      ];
    } else if (step === 4) {
      details = 'TCP Port 22 (SSH)';
      fields = [
        { key: 'SrcPort', value: '55231' },
        { key: 'DstPort', value: '22' },
        { key: 'SeqNo', value: '1001' },
      ];
    } else {
      details = `L${step} Overhead`;
    }
  } else if (protocol === 'FTP') {
    if (step === 7) {
      details = 'FTP Command: USER anonymous';
      fields = [
        { key: 'Prefix', value: 'USER' },
        { key: 'Arg', value: 'anonymous' },
        { key: 'EOL', value: 'CRLF' },
      ];
    } else if (step === 4) {
      details = 'TCP Port 21 (FTP-Control)';
      fields = [
        { key: 'SrcPort', value: '55678' },
        { key: 'DstPort', value: '21' },
      ];
    } else {
      details = `L${step} Overhead`;
    }
  } else if (protocol === 'SMTP') {
    if (step === 7) {
      details = 'SMTP: MAIL FROM:<sender@example.com>';
      fields = [
        { key: 'Command', value: 'MAIL FROM' },
        { key: 'Sender', value: 'sender@example.com' },
      ];
    } else if (step === 4) {
      details = 'TCP Port 25 (SMTP)';
      fields = [
        { key: 'SrcPort', value: '5590' },
        { key: 'DstPort', value: '25' },
      ];
    } else {
      details = `L${step} Overhead`;
    }
  } else if (protocol === 'DNS') {
    if (step === 7) {
      details = 'DNS Query: example.com (A Record)';
      fields = [
        { key: 'ID', value: '0x3a4b' },
        { key: 'Flags', value: 'Standard Query' },
        { key: 'Name', value: 'example.com' },
        { key: 'Type', value: 'A (IPv4 Address)' },
      ];
    } else if (step === 4) {
      details = 'UDP Port 53';
      fields = [
        { key: 'SrcPort', value: '55667' },
        { key: 'DstPort', value: '53 (DNS)' },
        { key: 'Len', value: '38' },
      ];
    } else if (step === 3) {
      details = 'IP Dest: 203.0.113.8';
      fields = [
        { key: 'SrcIP', value: '192.168.1.10' },
        { key: 'DstIP', value: '203.0.113.8' },
        { key: 'TTL', value: '64' },
      ];
    } else if (step === 2) {
      details = 'Ethernet II: ARP Resolved';
      fields = [
        { key: 'SrcMAC', value: '00:0C:29:C0:00:08' },
        { key: 'DstMAC', value: '00:50:56:C0:00:01' },
      ];
    } else {
      details = `L${step} Overhead`;
    }
  } else if (protocol === 'BGP') {
    if (step === 7) {
      details = 'BGP Update: Prefix 192.168.100.0/24';
      fields = [
        { key: 'MsgType', value: 'UPDATE' },
        { key: 'Prefix', value: '192.168.100.0/24' },
        { key: 'Origin', value: 'IGP' },
        { key: 'AS_PATH', value: '65001 65002' },
      ];
    } else if (step === 4) {
      details = 'TCP Port 179 (BGP)';
      fields = [
        { key: 'SrcPort', value: '49172' },
        { key: 'DstPort', value: '179' },
        { key: 'Flags', value: 'PUSH, ACK' },
      ];
    } else if (step === 3) {
      details = 'IP: Internal Routing';
      fields = [
        { key: 'SrcIP', value: '10.0.0.1' },
        { key: 'DstIP', value: '10.0.0.2' },
      ];
    } else if (step === 2) {
      details = 'Ethernet II frame toward the next-hop router';
      fields = [
        { key: 'SrcMAC', value: '00:1B:54:AA:10:01' },
        { key: 'DstMAC', value: '00:1B:54:AA:10:02' },
        { key: 'EtherType', value: '0x0800 (IPv4)' },
      ];
    } else {
      details = `L${step} Routing Overhead`;
    }
  } else {
    if (step === 7) {
      details = 'ICMP Echo Request: Data payload';
      fields = [
        { key: 'Type', value: '8 (Echo Request)' },
        { key: 'Code', value: '0' },
        { key: 'Payload', value: '32 Bytes' },
      ];
    } else if (step === 4) {
      details = 'UDP: Checksum 0xAC3F';
      fields = [
        { key: 'SrcPort', value: '32768' },
        { key: 'DstPort', value: '7' },
        { key: 'Length', value: '40' },
      ];
    } else if (step === 3) {
      details = 'ICMP Over IP: Type 8, Code 0';
      fields = [
        { key: 'SrcIP', value: '192.168.1.5' },
        { key: 'DstIP', value: '203.0.113.8' },
        { key: 'TTL', value: '128' },
      ];
    } else if (step === 2) {
      details = 'Ethernet II: IPv4 Payload';
      fields = [
        { key: 'SrcMAC', value: 'B4:2E:99:A1:C2:E0' },
        { key: 'DstMAC', value: 'E4:F4:C6:D1:B2:A1' },
        { key: 'Type', value: '0x0800' },
      ];
    }
  }

  return { details, fields };
}

/** START: only from idle. Clears headers, logs the protocol intro and begins encapsulation at L7. */
function start(state: SimMachineState, ctx: SimContext): SimResult {
  if (state.phase !== 'idle') return { state, effects: [] };
  const effects: SimEffect[] = [
    { kind: 'clearHeaders' },
    { kind: 'log', message: startupLogMessage(ctx.protocol, ctx.language), severity: 'info' },
    {
      kind: 'log',
      message: ctx.language === 'en' ? 'Starting packet encapsulation...' : 'Inizio incapsulamento pacchetto...',
      severity: 'info',
    },
    { kind: 'audio', cue: 'start' },
  ];
  return { state: { phase: 'encapsulating', currentStep: INITIAL_STEP, paused: false }, effects };
}

/** RESET: return to idle at L7, clear headers and any injected attack, log the reset. */
function reset(ctx: SimContext): SimResult {
  return {
    state: { phase: 'idle', currentStep: INITIAL_STEP, paused: false },
    effects: [
      { kind: 'clearHeaders' },
      { kind: 'clearAttack' },
      {
        kind: 'log',
        message: ctx.language === 'en' ? 'Simulation reset.' : 'Simulazione resettata.',
        severity: 'warning',
      },
    ],
  };
}

/** One encapsulation step: add the current layer's header, descend one layer, or transmit at L1. */
function tickEncapsulating(state: SimMachineState, ctx: SimContext): SimResult {
  const { currentStep } = state;

  if (currentStep > BOTTOM_LAYER) {
    const headerName = headerNameForLayer(currentStep, ctx.protocol, ctx.language);
    const pduName = pduNameForLayer(currentStep, ctx.protocol);
    const { details, fields } = buildEncapsulationHeader(currentStep, ctx.protocol);
    const header: PacketHeader = { layer: currentStep, protocol: headerName, details, pduName, fields };
    const message =
      currentStep === 5 || currentStep === 6
        ? `L${currentStep} processed (${headerName}; conceptual OSI function)`
        : `L${currentStep} encapsulated (${headerName})`;
    return {
      state: { ...state, currentStep: (currentStep - 1) as OsiLayerId },
      effects: [
        { kind: 'addHeader', header },
        { kind: 'log', message, severity: 'success' },
        { kind: 'selectLayer', layerId: currentStep },
        { kind: 'audio', cue: 'step' },
      ],
    };
  }

  // currentStep === BOTTOM_LAYER: the frame is transmitted over the physical media.
  const effects: SimEffect[] = [
    {
      kind: 'log',
      message: ctx.language === 'en' ? 'Transmitting via Physical Media...' : 'Trasmissione via Media Fisico...',
      severity: 'info',
    },
  ];

  if (ctx.attack !== 'none' && !ctx.defenseEnabled) {
    effects.push({
      kind: 'log',
      message:
        ctx.language === 'en'
          ? `CRITICAL: ${ctx.attack.toUpperCase()} attack successful! Connection dropped.`
          : `CRITICO: Attacco ${ctx.attack.toUpperCase()} riuscito! Connessione interrotta.`,
      severity: 'danger',
    });
    effects.push({ kind: 'audio', cue: 'alert' });
    return { state: { ...state, phase: 'interrupted' }, effects };
  }

  if (ctx.attack !== 'none' && ctx.defenseEnabled) {
    effects.push({
      kind: 'log',
      message:
        ctx.language === 'en'
          ? `Defense mitigated ${ctx.attack.toUpperCase()} attack.`
          : `La difesa ha mitigato l'attacco ${ctx.attack.toUpperCase()}.`,
      severity: 'success',
    });
  }
  effects.push({
    kind: 'log',
    message:
      ctx.language === 'en'
        ? 'Packet reaching destination. Starting decapsulation...'
        : 'Il pacchetto raggiunge il destinatario. Inizio decapsulamento...',
    severity: 'info',
  });
  return { state: { ...state, phase: 'decapsulating' }, effects };
}

/** One decapsulation step: strip the current layer and ascend, or deliver at L7. */
function tickDecapsulating(state: SimMachineState, ctx: SimContext): SimResult {
  const { currentStep } = state;

  if (currentStep < TOP_LAYER) {
    const nextStep = (currentStep + 1) as OsiLayerId;
    const pduName = pduNameForLayer(nextStep, ctx.protocol);
    return {
      state: { ...state, currentStep: nextStep },
      effects: [
        { kind: 'log', message: `L${currentStep} decapsulated (${pduName})`, severity: 'success' },
        { kind: 'selectLayer', layerId: nextStep },
        { kind: 'audio', cue: 'step' },
      ],
    };
  }

  return {
    state: { ...state, phase: 'idle' },
    effects: [
      {
        kind: 'log',
        message:
          ctx.language === 'en'
            ? 'Data successfully delivered to Application Layer.'
            : 'Dati consegnati con successo al Livello Applicazione.',
        severity: 'success',
      },
      { kind: 'audio', cue: 'success' },
    ],
  };
}

/** A paused machine and any non-running phase ignore ticks. */
function tick(state: SimMachineState, ctx: SimContext): SimResult {
  if (state.paused) return { state, effects: [] };
  if (state.phase === 'encapsulating') return tickEncapsulating(state, ctx);
  if (state.phase === 'decapsulating') return tickDecapsulating(state, ctx);
  return { state, effects: [] };
}

/**
 * The pure simulation reducer. Given the current machine state, an action and
 * the surrounding context, it returns the next state and the ordered effects
 * to apply. It performs no side effects and never mutates its inputs.
 */
export function simulationReducer(state: SimMachineState, action: SimAction, ctx: SimContext): SimResult {
  switch (action.type) {
    case 'START':
      return start(state, ctx);
    case 'TICK':
      return tick(state, ctx);
    case 'PAUSE':
      return { state: { ...state, paused: true }, effects: [] };
    case 'RESUME':
      return { state: { ...state, paused: false }, effects: [] };
    case 'RESET':
      return reset(ctx);
  }
}

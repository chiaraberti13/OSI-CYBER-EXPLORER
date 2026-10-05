import { describe, expect, it } from 'vitest';
import type { SimProtocol } from './osi';
import {
  INITIAL_SIM_STATE,
  INITIAL_STEP,
  buildEncapsulationHeader,
  headerNameForLayer,
  simulationReducer,
  startupLogMessage,
  type SimAction,
  type SimContext,
  type SimEffect,
  type SimMachineState,
} from './simulation';

const EN: SimContext = { protocol: 'HTTP', attack: 'none', defenseEnabled: false, language: 'en' };

function logs(effects: SimEffect[]): string[] {
  return effects.filter((e): e is Extract<SimEffect, { kind: 'log' }> => e.kind === 'log').map((e) => e.message);
}

/** Dispatch a sequence of actions from a starting state, returning the final state and all effects in order. */
function run(start: SimMachineState, actions: SimAction[], ctx: SimContext) {
  let state = start;
  const effects: SimEffect[] = [];
  for (const action of actions) {
    const result = simulationReducer(state, action, ctx);
    state = result.state;
    effects.push(...result.effects);
  }
  return { state, effects };
}

const ticks = (n: number): SimAction[] => Array.from({ length: n }, () => ({ type: 'TICK' }) as const);

// The selected application profiles must keep their transport and service port
// throughout a complete run, not only when the header builder is called alone.
const PROFILES = [
  { protocol: 'HTTP', transport: 'TCP', port: '80', pdu: 'Segment' },
  { protocol: 'HTTPS', transport: 'TCP', port: '443', pdu: 'Segment' },
  { protocol: 'SSH', transport: 'TCP', port: '22', pdu: 'Segment' },
  { protocol: 'FTP', transport: 'TCP', port: '21', pdu: 'Segment' },
  { protocol: 'SMTP', transport: 'TCP', port: '25', pdu: 'Segment' },
  { protocol: 'DNS', transport: 'UDP', port: '53 (DNS)', pdu: 'Datagram' },
  { protocol: 'BGP', transport: 'TCP', port: '179', pdu: 'Segment' },
] satisfies { protocol: SimProtocol; transport: string; port: string; pdu: string }[];

describe('headerNameForLayer', () => {
  it('maps the application layer to the protocol itself', () => {
    expect(headerNameForLayer(7, 'HTTPS', 'en')).toBe('HTTPS');
  });

  it('uses TLS at L6 for HTTPS and a localized representation label otherwise', () => {
    expect(headerNameForLayer(6, 'HTTPS', 'en')).toBe('TLS');
    expect(headerNameForLayer(6, 'HTTP', 'en')).toBe('Representation');
    expect(headerNameForLayer(6, 'HTTP', 'it')).toBe('Rappresentazione');
  });

  it('localizes the session label at L5', () => {
    expect(headerNameForLayer(5, 'HTTP', 'en')).toBe('Session functions');
    expect(headerNameForLayer(5, 'HTTP', 'it')).toBe('Funzioni di sessione');
  });

  it('derives the transport protocol at L4 and fixed labels at L3/L2', () => {
    expect(headerNameForLayer(4, 'DNS', 'en')).toBe('UDP');
    expect(headerNameForLayer(4, 'HTTP', 'en')).toBe('TCP');
    expect(headerNameForLayer(3, 'HTTP', 'en')).toBe('IP');
    expect(headerNameForLayer(2, 'HTTP', 'en')).toBe('Ethernet II');
  });
});

describe('startupLogMessage', () => {
  it('returns a protocol-specific, localized intro', () => {
    expect(startupLogMessage('SSH', 'en')).toContain('Diffie-Hellman');
    expect(startupLogMessage('SSH', 'it')).toContain('scambio chiavi');
    expect(startupLogMessage('DNS', 'en')).toContain('Resolving');
  });
});

describe('buildEncapsulationHeader', () => {
  it('produces the HTTP application request at L7', () => {
    const { details, fields } = buildEncapsulationHeader(7, 'HTTP');
    expect(details).toBe('GET /index.html HTTP/1.1');
    expect(fields).toContainEqual({ key: 'Host', value: 'example.com' });
  });

  it('switches the HTTPS transport port to 443', () => {
    expect(buildEncapsulationHeader(4, 'HTTPS').details).toContain('443');
    expect(buildEncapsulationHeader(4, 'HTTP').details).toContain('80');
  });

  it('uses only documentation-range addresses (RFC 5737 / RFC 2606)', () => {
    const { fields } = buildEncapsulationHeader(3, 'HTTP');
    expect(fields).toContainEqual({ key: 'DstIP', value: '198.51.100.14' });
  });

  it('falls back to an overhead label for unspecified SSH layers', () => {
    expect(buildEncapsulationHeader(3, 'SSH').details).toBe('L3 Overhead');
    expect(buildEncapsulationHeader(6, 'BGP').details).toBe('L6 Routing Overhead');
  });
});

describe('simulationReducer — lifecycle', () => {
  it('starts only from idle and begins encapsulation at the top layer', () => {
    const { state, effects } = simulationReducer(INITIAL_SIM_STATE, { type: 'START' }, EN);
    expect(state).toEqual({ phase: 'encapsulating', currentStep: INITIAL_STEP, paused: false });
    expect(effects[0]).toEqual({ kind: 'clearHeaders' });
    expect(logs(effects)).toEqual([
      startupLogMessage('HTTP', 'en'),
      'Starting packet encapsulation...',
    ]);
    expect(effects).toContainEqual({ kind: 'audio', cue: 'start' });
  });

  it('ignores START while a run is already in progress', () => {
    const running: SimMachineState = { phase: 'encapsulating', currentStep: 5, paused: false };
    const { state, effects } = simulationReducer(running, { type: 'START' }, EN);
    expect(state).toBe(running);
    expect(effects).toHaveLength(0);
  });

  it('resets to idle at the top layer, clearing headers and attack', () => {
    const interrupted: SimMachineState = { phase: 'interrupted', currentStep: 1, paused: false };
    const { state, effects } = simulationReducer(interrupted, { type: 'RESET' }, { ...EN, language: 'it' });
    expect(state).toEqual({ phase: 'idle', currentStep: INITIAL_STEP, paused: false });
    expect(effects).toContainEqual({ kind: 'clearHeaders' });
    expect(effects).toContainEqual({ kind: 'clearAttack' });
    expect(logs(effects)).toEqual(['Simulazione resettata.']);
  });

  it('pauses and resumes without side effects', () => {
    const running: SimMachineState = { phase: 'encapsulating', currentStep: 4, paused: false };
    const paused = simulationReducer(running, { type: 'PAUSE' }, EN);
    expect(paused.state.paused).toBe(true);
    expect(paused.effects).toHaveLength(0);
    const resumed = simulationReducer(paused.state, { type: 'RESUME' }, EN);
    expect(resumed.state.paused).toBe(false);
  });

  it('is a no-op when ticking while paused', () => {
    const paused: SimMachineState = { phase: 'encapsulating', currentStep: 4, paused: true };
    const { state, effects } = simulationReducer(paused, { type: 'TICK' }, EN);
    expect(state).toBe(paused);
    expect(effects).toHaveLength(0);
  });

  it.each(['idle', 'interrupted'] as const)('ignores ticks in the %s phase', (phase) => {
    const state: SimMachineState = { phase, currentStep: 1, paused: false };
    const result = simulationReducer(state, { type: 'TICK' }, EN);
    expect(result.state).toBe(state);
    expect(result.effects).toEqual([]);
  });

  it('resets an English session even when paused', () => {
    const state: SimMachineState = { phase: 'decapsulating', currentStep: 3, paused: true };
    const result = simulationReducer(state, { type: 'RESET' }, EN);
    expect(result.state).toEqual(INITIAL_SIM_STATE);
    expect(logs(result.effects)).toEqual(['Simulation reset.']);
    expect(state).toEqual({ phase: 'decapsulating', currentStep: 3, paused: true });
  });
});

describe('simulationReducer — full encapsulation / decapsulation', () => {
  it('adds one header per layer from L7 down to L2, then transitions to decapsulation', () => {
    const started = simulationReducer(INITIAL_SIM_STATE, { type: 'START' }, EN).state;
    // Six stepping ticks add L7..L2; a seventh tick transmits at L1.
    const { state, effects } = run(started, ticks(7), EN);
    const headers = effects.filter((e): e is Extract<SimEffect, { kind: 'addHeader' }> => e.kind === 'addHeader');
    expect(headers.map((h) => h.header.layer)).toEqual([7, 6, 5, 4, 3, 2]);
    expect(state.phase).toBe('decapsulating');
    expect(state.currentStep).toBe(1);
    expect(logs(effects)).toContain('Packet reaching destination. Starting decapsulation...');
  });

  it('interrupts the flow when an undefended attack is active', () => {
    const atPhysical: SimMachineState = { phase: 'encapsulating', currentStep: 1, paused: false };
    const ctx: SimContext = { ...EN, attack: 'mitm' };
    const { state, effects } = simulationReducer(atPhysical, { type: 'TICK' }, ctx);
    expect(state.phase).toBe('interrupted');
    expect(logs(effects).some((m) => m.includes('CRITICAL') && m.includes('MITM'))).toBe(true);
    expect(effects).toContainEqual({ kind: 'audio', cue: 'alert' });
  });

  it('mitigates the attack and proceeds when a defense is enabled', () => {
    const atPhysical: SimMachineState = { phase: 'encapsulating', currentStep: 1, paused: false };
    const ctx: SimContext = { ...EN, attack: 'dos', defenseEnabled: true };
    const { state, effects } = simulationReducer(atPhysical, { type: 'TICK' }, ctx);
    expect(state.phase).toBe('decapsulating');
    expect(logs(effects).some((m) => m.includes('Defense mitigated') && m.includes('DOS'))).toBe(true);
  });

  it('decapsulates layer by layer and delivers at the application layer', () => {
    const atL1: SimMachineState = { phase: 'decapsulating', currentStep: 1, paused: false };
    const { state, effects } = run(atL1, ticks(7), EN);
    expect(state.phase).toBe('idle');
    expect(logs(effects)[0]).toBe('L1 decapsulated (Frame)');
    expect(logs(effects)).toContain('Data successfully delivered to Application Layer.');
    expect(effects).toContainEqual({ kind: 'audio', cue: 'success' });
  });

  it('drives a complete HTTP run from idle back to idle', () => {
    const { state, effects } = run(INITIAL_SIM_STATE, [{ type: 'START' }, ...ticks(14)], EN);
    expect(state.phase).toBe('idle');
    const headers = effects.filter((e) => e.kind === 'addHeader');
    expect(headers).toHaveLength(6);
  });
});

describe.each(['en', 'it'] as const)('simulation protocol journeys (%s)', (language) => {
  it.each(PROFILES)('delivers $protocol with the correct transport and port', ({ protocol, transport, port, pdu }) => {
    const ctx: SimContext = { ...EN, protocol, language };
    const initial = { ...INITIAL_SIM_STATE };
    const { state, effects } = run(initial, [{ type: 'START' }, ...ticks(14)], ctx);
    const headers = effects
      .filter((effect): effect is Extract<SimEffect, { kind: 'addHeader' }> => effect.kind === 'addHeader')
      .map((effect) => effect.header);

    expect(state).toEqual(INITIAL_SIM_STATE);
    expect(initial).toEqual(INITIAL_SIM_STATE);
    expect(headers.map((header) => header.layer)).toEqual([7, 6, 5, 4, 3, 2]);
    expect(headers.find((header) => header.layer === 7)).toMatchObject({ protocol, pduName: 'Data' });
    expect(headers.find((header) => header.layer === 7)?.fields?.length).toBeGreaterThan(0);
    expect(headers.find((header) => header.layer === 4)).toMatchObject({
      protocol: transport,
      pduName: pdu,
      fields: expect.arrayContaining([{ key: 'DstPort', value: port }]),
    });
    expect(effects).toContainEqual({ kind: 'audio', cue: 'success' });
    expect(logs(effects)).toContain(language === 'en'
      ? 'Data successfully delivered to Application Layer.'
      : 'Dati consegnati con successo al Livello Applicazione.');
  });

  it.each([false, true])('applies the attack outcome when defenseEnabled=%s', (defenseEnabled) => {
    const ctx: SimContext = { ...EN, attack: 'mitm', defenseEnabled, language };
    const { state, effects } = run(INITIAL_SIM_STATE, [{ type: 'START' }, ...ticks(14)], ctx);
    expect(state.phase).toBe(defenseEnabled ? 'idle' : 'interrupted');
    expect(effects).toContainEqual({ kind: 'audio', cue: defenseEnabled ? 'success' : 'alert' });
    expect(logs(effects).some((message) => message.includes('MITM'))).toBe(true);
    expect(logs(effects).includes(language === 'en'
      ? 'Data successfully delivered to Application Layer.'
      : 'Dati consegnati con successo al Livello Applicazione.')).toBe(defenseEnabled);
  });
});

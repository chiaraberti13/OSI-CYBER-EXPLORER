import { describe, expect, it } from 'vitest';
import { formatMac, isGroupMac, macKind, simulateCam, type FrameInput, type SwitchPort } from './camTable';

const PORTS: SwitchPort[] = [
  { id: 'Gi1/0/1', name: 'Gi1/0/1', mode: 'access', vlan: 10 },
  { id: 'Gi1/0/2', name: 'Gi1/0/2', mode: 'access', vlan: 10 },
  { id: 'Gi1/0/3', name: 'Gi1/0/3', mode: 'access', vlan: 20 },
  { id: 'Gi1/0/24', name: 'Gi1/0/24', mode: 'trunk', vlan: 99, trunkVlans: [10, 20] }
];

const A = '0000.1111.aaaa';
const B = '0000.2222.bbbb';
const C = '0000.3333.cccc';
const BROADCAST = 'ffff.ffff.ffff';

const frame = (over: Partial<FrameInput> = {}): FrameInput =>
  ({ srcMac: A, dstMac: B, ingressPort: 'Gi1/0/1', vlan: 10, ...over });

describe('MAC address classification', () => {
  it('separates unicast, multicast and broadcast by the I/G bit', () => {
    expect(macKind(A)).toBe('unicast');
    expect(macKind(BROADCAST)).toBe('broadcast');
    expect(macKind('0100.5e00.0001')).toBe('multicast');
    expect(isGroupMac('0100.5e00.0001')).toBe(true);
    expect(isGroupMac(A)).toBe(false);
  });

  it('prints an address the way IOS does', () => {
    expect(formatMac('00:00:11:11:AA:AA')).toBe('0000.1111.aaaa');
  });
});

describe('learning', () => {
  it('learns the source address, never the destination', () => {
    const [step] = simulateCam(PORTS, [frame()]);
    expect(step.learned?.mac).toBe('0000.1111.aaaa');
    expect(step.table.map(entry => entry.mac)).toEqual(['00001111aaaa']);
    // B was the destination and is still unknown, which is why the frame was flooded.
    expect(step.destinationKnown).toBe(false);
  });

  it('refuses a frame sourced from a group address', () => {
    expect(() => simulateCam(PORTS, [frame({ srcMac: BROADCAST })])).toThrow('INVALID_SOURCE_MAC');
  });

  it('moves an entry when the same MAC appears on another port', () => {
    const steps = simulateCam(PORTS, [
      frame(),
      frame({ ingressPort: 'Gi1/0/2' })
    ]);
    expect(steps[1].learned?.moved).toBe(true);
    expect(steps[1].learned?.movedFrom).toBe('Gi1/0/1');
    expect(steps[1].table.find(entry => entry.mac === '00001111aaaa')?.port).toBe('Gi1/0/2');
  });

  it('keeps one entry per MAC per VLAN', () => {
    const steps = simulateCam(PORTS, [
      frame(),
      frame({ ingressPort: 'Gi1/0/3', vlan: 20 })
    ]);
    // The same address in two VLANs is two entries: the table is keyed by VLAN and MAC.
    expect(steps[1].table).toHaveLength(2);
    expect(steps[1].table.map(entry => entry.vlan)).toEqual([10, 20]);
  });

  it('does not overwrite a static entry with what arrives on the wire', () => {
    const steps = simulateCam(PORTS, [frame({ ingressPort: 'Gi1/0/2' })], {
      initialEntries: [{ mac: A, port: 'Gi1/0/1', vlan: 10, kind: 'static' }]
    });
    expect(steps[0].learned).toBeNull();
    expect(steps[0].table.find(entry => entry.mac === '00001111aaaa')?.port).toBe('Gi1/0/1');
  });
});

describe('the forwarding decision', () => {
  it('floods an unknown unicast to every other port in the VLAN', () => {
    const [step] = simulateCam(PORTS, [frame()]);
    expect(step.action).toBe('flood');
    // VLAN 10 is on Gi1/0/1, Gi1/0/2 and the trunk; the ingress port is excluded.
    expect(step.egressPorts).toEqual(['Gi1/0/2', 'Gi1/0/24']);
    expect(step.destinationKind).toBe('unicast');
    expect(step.reason.en).toMatch(/not a broadcast/);
  });

  it('forwards out one port once the destination has been learned', () => {
    const steps = simulateCam(PORTS, [
      frame({ srcMac: B, dstMac: A, ingressPort: 'Gi1/0/2' }),
      frame({ srcMac: A, dstMac: B, ingressPort: 'Gi1/0/1' })
    ]);
    expect(steps[1].action).toBe('forward');
    expect(steps[1].egressPorts).toEqual(['Gi1/0/2']);
  });

  it('filters a frame whose destination is on the ingress port', () => {
    const steps = simulateCam(PORTS, [
      // B is learned on Gi1/0/1 (a shared segment behind that port)…
      frame({ srcMac: B, dstMac: C, ingressPort: 'Gi1/0/1' }),
      // …so a frame for B arriving on Gi1/0/1 has nowhere to go.
      frame({ srcMac: A, dstMac: B, ingressPort: 'Gi1/0/1' })
    ]);
    expect(steps[1].action).toBe('filter');
    expect(steps[1].egressPorts).toEqual([]);
    expect(steps[1].destinationKnown).toBe(true);
  });

  it('floods a broadcast without learning or filtering it', () => {
    const [step] = simulateCam(PORTS, [frame({ dstMac: BROADCAST })]);
    expect(step.action).toBe('flood');
    expect(step.destinationKind).toBe('broadcast');
    expect(step.table.map(entry => entry.mac)).toEqual(['00001111aaaa']);
  });

  it('treats multicast as a flood until IGMP snooping is involved', () => {
    const [step] = simulateCam(PORTS, [frame({ dstMac: '0100.5e00.0001' })]);
    expect(step.action).toBe('flood');
    expect(step.reason.en).toMatch(/IGMP snooping/);
  });
});

describe('VLAN separation', () => {
  it('never floods into another VLAN', () => {
    const [step] = simulateCam(PORTS, [frame({ dstMac: BROADCAST })]);
    expect(step.egressPorts).not.toContain('Gi1/0/3');
  });

  it('does not use an entry learned in another VLAN', () => {
    const steps = simulateCam(PORTS, [
      frame({ srcMac: B, dstMac: C, ingressPort: 'Gi1/0/3', vlan: 20 }),
      frame({ srcMac: A, dstMac: B, ingressPort: 'Gi1/0/1', vlan: 10 })
    ]);
    // B is known, but in VLAN 20: in VLAN 10 it is still an unknown unicast.
    expect(steps[1].action).toBe('flood');
    expect(steps[1].destinationKnown).toBe(false);
  });

  it('includes a trunk that allows the VLAN in the flood', () => {
    const [step] = simulateCam(PORTS, [frame({ ingressPort: 'Gi1/0/3', vlan: 20, dstMac: BROADCAST })]);
    expect(step.egressPorts).toEqual(['Gi1/0/24']);
  });
});

describe('aging', () => {
  it('removes a dynamic entry after the idle time and relearns it as new', () => {
    const steps = simulateCam(PORTS, [
      frame({ srcMac: B, dstMac: C, ingressPort: 'Gi1/0/2', at: 0 }),
      frame({ srcMac: A, dstMac: B, ingressPort: 'Gi1/0/1', at: 100 }),
      frame({ srcMac: A, dstMac: B, ingressPort: 'Gi1/0/1', at: 400 })
    ], { agingSeconds: 300 });
    expect(steps[1].action).toBe('forward');
    // At t=400 the entry for B has been idle 400 s: it is gone, so the frame floods.
    expect(steps[2].agedOut).toContain('0000.2222.bbbb');
    expect(steps[2].action).toBe('flood');
  });

  it('keeps an entry alive while its host keeps sending', () => {
    const steps = simulateCam(PORTS, [
      frame({ srcMac: B, dstMac: C, ingressPort: 'Gi1/0/2', at: 0 }),
      frame({ srcMac: B, dstMac: C, ingressPort: 'Gi1/0/2', at: 250 }),
      frame({ srcMac: A, dstMac: B, ingressPort: 'Gi1/0/1', at: 400 })
    ], { agingSeconds: 300 });
    expect(steps[2].agedOut).toEqual([]);
    expect(steps[2].action).toBe('forward');
  });

  it('never ages a static entry', () => {
    const steps = simulateCam(PORTS, [frame({ dstMac: B, at: 10_000 })], {
      agingSeconds: 300,
      initialEntries: [{ mac: B, port: 'Gi1/0/2', vlan: 10, kind: 'static' }]
    });
    expect(steps[0].agedOut).toEqual([]);
    expect(steps[0].action).toBe('forward');
  });
});

describe('invalid input', () => {
  it('rejects a topology or a frame that cannot exist', () => {
    expect(() => simulateCam([], [frame()])).toThrow('NO_PORTS');
    expect(() => simulateCam(PORTS, [frame({ ingressPort: 'Gi9/9/9' })])).toThrow('UNKNOWN_PORT');
    expect(() => simulateCam(PORTS, [frame({ vlan: 5000 })])).toThrow('INVALID_VLAN');
    expect(() => simulateCam(PORTS, [frame()], { agingSeconds: 0 })).toThrow('INVALID_AGING');
    expect(() => simulateCam(PORTS, [frame({ at: 10 }), frame({ at: 5 })])).toThrow('TIME_WENT_BACKWARDS');
  });

  it('explains every step in both languages', () => {
    const steps = simulateCam(PORTS, [frame(), frame({ dstMac: BROADCAST }), frame({ srcMac: B, dstMac: A, ingressPort: 'Gi1/0/2' })]);
    for (const step of steps) {
      expect(step.reason.it.length).toBeGreaterThan(40);
      expect(step.reason.en.length).toBeGreaterThan(40);
    }
  });
});

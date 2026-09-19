import { describe, expect, it } from 'vitest';
import { tracePath, traceRoundTrip, type TraceOptions } from './pathTrace';

const base: TraceOptions = {
  sourceId: 'pc-a',
  destinationId: 'server',
  protocol: 'tcp',
  port: 443,
  aclPlacement: 'inbound-users',
  trunkAllowedVlans: [10, 20, 99],
  nativeVlanConsistent: true,
  natEnabled: true,
  defaultRoutePresent: true
};

const kinds = (result: { steps: Array<{ kind: string }> }) => result.steps.map(step => step.kind);

describe('path trace — the local or remote decision', () => {
  it('stays at Layer 2 inside one VLAN and never consults the ACL', () => {
    const result = tracePath({ ...base, destinationId: 'pc-b' });
    expect(result.delivered).toBe(true);
    expect(result.layer2Only).toBe(true);
    expect(kinds(result)).not.toContain('acl');
    expect(kinds(result)).not.toContain('route');
    expect(kinds(result)).not.toContain('svi');
  });

  it('routes between VLANs through the SVI, in order', () => {
    const result = tracePath(base);
    expect(result.delivered).toBe(true);
    expect(result.layer2Only).toBe(false);
    const order = kinds(result);
    // The host decides first, the ACL before the lookup, the delivery last.
    expect(order.indexOf('host')).toBeLessThan(order.indexOf('trunk'));
    expect(order.indexOf('trunk')).toBeLessThan(order.indexOf('svi'));
    expect(order.indexOf('acl')).toBeLessThan(order.indexOf('route'));
    expect(order[order.length - 1]).toBe('delivery');
  });
});

describe('path trace — the ACL', () => {
  it('denies Telnet at the inbound ACL, before any routing decision', () => {
    const result = tracePath({ ...base, port: 23 });
    expect(result.delivered).toBe(false);
    expect(kinds(result)).toContain('acl');
    expect(kinds(result)).not.toContain('route');
    expect(result.dropReason?.en).toMatch(/inbound ACL/);
  });

  it('drops a port no ACE permits through the implicit deny', () => {
    const result = tracePath({ ...base, port: 53 });
    expect(result.delivered).toBe(false);
    const acl = result.steps.find(step => step.kind === 'acl');
    expect(acl?.detail.en).toMatch(/implicit deny/);
  });

  it('delivers the very same packet once the ACL is removed', () => {
    expect(tracePath({ ...base, port: 53 }).delivered).toBe(false);
    expect(tracePath({ ...base, port: 53, aclPlacement: 'none' }).delivered).toBe(true);
  });

  it('is not consulted when applied in the direction the packet does not cross', () => {
    // Inbound on the users SVI never sees a packet sourced in the servers VLAN.
    const fromServer = tracePath({ ...base, sourceId: 'server', destinationId: 'pc-a', port: 23 });
    expect(kinds(fromServer)).not.toContain('acl');
    expect(fromServer.delivered).toBe(true);
  });

  it('moves its effect when placed outbound on the destination VLAN', () => {
    const outbound = tracePath({ ...base, aclPlacement: 'outbound-servers', port: 23 });
    expect(outbound.delivered).toBe(false);
    const order = kinds(outbound);
    // Outbound is evaluated after the routing decision, inbound before it.
    expect(order.indexOf('route')).toBeLessThan(order.indexOf('acl'));
  });
});

describe('path trace — the trunk', () => {
  it('drops the frame when the VLAN is pruned from the allowed list', () => {
    const result = tracePath({ ...base, sourceId: 'phone', destinationId: 'server', protocol: 'icmp', port: undefined, trunkAllowedVlans: [10, 99] });
    expect(result.delivered).toBe(false);
    expect(result.dropReason?.en).toMatch(/pruned/);
    expect(kinds(result)).not.toContain('svi');
  });

  it('reports a native VLAN mismatch without stopping tagged traffic', () => {
    const result = tracePath({ ...base, nativeVlanConsistent: false });
    expect(result.delivered).toBe(true);
    const mismatch = result.steps.find(step => step.title.en.includes('Native VLAN mismatch'));
    expect(mismatch?.verdict).toBe('info');
  });
});

describe('path trace — leaving the network', () => {
  it('translates the source and leaves through the default route', () => {
    const result = tracePath({ ...base, destinationId: 'internet' });
    expect(result.delivered).toBe(true);
    expect(result.translatedSource).toBe('198.51.100.10:49152');
    expect(kinds(result)).toContain('nat');
  });

  it('has nowhere to send the packet without a default route', () => {
    const result = tracePath({ ...base, destinationId: 'internet', defaultRoutePresent: false });
    expect(result.delivered).toBe(false);
    expect(result.dropReason?.en).toMatch(/No route|default route/i);
  });

  it('cannot use a private source on the public link when NAT is off', () => {
    const result = tracePath({ ...base, destinationId: 'internet', natEnabled: false });
    expect(result.delivered).toBe(false);
    expect(result.dropReason?.en).toMatch(/Private source/);
  });

  it('still reaches an internal VLAN without any default route', () => {
    expect(tracePath({ ...base, defaultRoutePresent: false }).delivered).toBe(true);
  });
});

describe('path trace — both directions', () => {
  it('shows the asymmetry a one-way ACL creates', () => {
    // PC-A cannot open Telnet to the server, but the server can open it to PC-A:
    // a stateless ACL applied inbound on one SVI filters one direction only.
    const trip = traceRoundTrip({ ...base, port: 23 });
    expect(trip.forward.delivered).toBe(false);
    expect(trip.ret.delivered).toBe(true);
    expect(trip.asymmetric).toBe(true);
    expect(trip.note.en).toMatch(/stateless ACL/);
  });

  it('reports symmetry when both directions cross the same points', () => {
    const trip = traceRoundTrip({ ...base, protocol: 'icmp', port: undefined });
    expect(trip.forward.delivered).toBe(true);
    expect(trip.ret.delivered).toBe(true);
    expect(trip.asymmetric).toBe(false);
  });

  it('treats the reply from the Internet as reversed NAT state, not a new path', () => {
    const trip = traceRoundTrip({ ...base, destinationId: 'internet' });
    expect(trip.ret.delivered).toBe(true);
    expect(trip.ret.steps[0].kind).toBe('nat');
    expect(trip.note.en).toMatch(/translation state/);
  });

  it('has no way back from the Internet without NAT', () => {
    const trip = traceRoundTrip({ ...base, destinationId: 'internet', natEnabled: false });
    expect(trip.forward.delivered).toBe(false);
    expect(trip.ret.delivered).toBe(false);
  });
});

describe('path trace — every step is teachable', () => {
  it('gives each step a device, a bilingual title and detail, and a verdict', () => {
    const scenarios: TraceOptions[] = [
      base,
      { ...base, destinationId: 'pc-b' },
      { ...base, destinationId: 'internet' },
      { ...base, port: 23 },
      { ...base, trunkAllowedVlans: [99] }
    ];
    for (const scenario of scenarios) {
      for (const step of tracePath(scenario).steps) {
        expect(step.device.length).toBeGreaterThan(1);
        expect(step.title.it.length).toBeGreaterThan(5);
        expect(step.title.en.length).toBeGreaterThan(5);
        expect(step.detail.it.length).toBeGreaterThan(30);
        expect(step.detail.en.length).toBeGreaterThan(30);
        expect(['forward', 'drop', 'info']).toContain(step.verdict);
      }
    }
  });

  it('rejects an unknown endpoint instead of tracing nonsense', () => {
    expect(() => tracePath({ ...base, sourceId: 'nope' })).toThrow('UNKNOWN_SOURCE');
    expect(() => tracePath({ ...base, destinationId: 'nope' })).toThrow('UNKNOWN_DESTINATION');
  });
});

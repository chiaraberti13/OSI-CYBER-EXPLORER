import { describe, expect, it } from 'vitest';
import {
  advancePivotTime,
  createPivotSession,
  PIVOTING_TOPOLOGY,
  simulatePivotFlow,
  teardownPivotSession
} from './pivotingLab';

describe('offline pivoting model', () => {
  it('requires explicit scope and limits leases to the declared options', () => {
    expect(createPivotSession('route', 5, false)).toBeNull();
    expect(createPivotSession('route', 5, true)).toEqual({
      mode: 'route',
      leaseMinutes: 5,
      elapsedMinutes: 0,
      active: true
    });
    expect(PIVOTING_TOPOLOGY.allowedPort).toBe(443);
  });

  it('routes the host through the pivot while firewall policy still denies an out-of-scope port', () => {
    const session = createPivotSession('route', 10, true)!;
    const allowed = simulatePivotFlow(session, 443, true, true);
    expect(allowed.outcome).toBe('allowed');
    expect(allowed.flow).toEqual(['198.51.100.10 → 198.51.100.20', '203.0.113.1 → 203.0.113.25:443/TCP']);

    const denied = simulatePivotFlow(session, 22, true, true);
    expect(denied.outcome).toBe('out-of-scope');
    expect(denied.telemetry).toContain('FIREWALL_DENY: TCP/22 outside authorized scope');
  });

  it('maps only the approved single service and does not install a route', () => {
    const session = createPivotSession('port-forward', 5, true)!;
    const allowed = simulatePivotFlow(session, 443, true, true);
    expect(allowed.outcome).toBe('allowed');
    expect(allowed.flow).toEqual(['198.51.100.10 → 198.51.100.20:8443', '203.0.113.1 → 203.0.113.25:443/TCP']);

    const unmapped = simulatePivotFlow(session, 22, true, true);
    expect(unmapped.outcome).toBe('no-mapping');
    expect(unmapped.telemetry).toContain('FIREWALL_DENY: no approved mapping');
  });

  it('models forwarding and firewall denial as separate controls', () => {
    const session = createPivotSession('route', 5, true)!;
    expect(simulatePivotFlow(session, 443, false, true).outcome).toBe('forwarding-disabled');
    const denied = simulatePivotFlow(session, 443, true, false);
    expect(denied.outcome).toBe('firewall-denied');
    expect(denied.telemetry).toContain('IDS_ALERT: policy-denied pivot flow');
  });

  it('expires deterministically, removes the simulated path, and supports explicit teardown', () => {
    const session = createPivotSession('route', 10, true)!;
    const halfway = advancePivotTime(session, 5);
    expect(halfway).toMatchObject({ elapsedMinutes: 5, active: true });
    const expired = advancePivotTime(halfway, 5);
    expect(expired).toMatchObject({ elapsedMinutes: 10, active: false });
    expect(simulatePivotFlow(expired, 443, true, true).outcome).toBe('inactive');

    expect(teardownPivotSession(session)).toMatchObject({ active: false, elapsedMinutes: 0 });
    expect(advancePivotTime(teardownPivotSession(session), 5).active).toBe(false);
  });
});

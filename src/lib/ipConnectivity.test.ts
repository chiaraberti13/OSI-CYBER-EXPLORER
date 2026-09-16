import { describe, expect, it } from 'vitest';
import {
  calculateOspfCost,
  electOspfDrBdr,
  normalizeNetwork,
  selectBestRoutes,
  selectOspfRouterId,
  type Ipv4Route
} from './ipConnectivity';

const routes: Ipv4Route[] = [
  { id: 'default', source: 'static', network: '0.0.0.0', prefix: 0, administrativeDistance: 1, metric: 0, nextHop: '192.0.2.1', exitInterface: 'Gi0/0' },
  { id: 'ospf-10', source: 'ospf', network: '10.0.0.0', prefix: 8, administrativeDistance: 110, metric: 20, nextHop: '192.0.2.2', exitInterface: 'Gi0/1' },
  { id: 'static-10-1', source: 'static', network: '10.1.0.0', prefix: 16, administrativeDistance: 1, metric: 0, nextHop: '192.0.2.3', exitInterface: 'Gi0/2' },
  { id: 'ospf-10-1-2a', source: 'ospf', network: '10.1.2.0', prefix: 24, administrativeDistance: 110, metric: 30, nextHop: '192.0.2.4', exitInterface: 'Gi0/3' },
  { id: 'ospf-10-1-2b', source: 'ospf', network: '10.1.2.0', prefix: 24, administrativeDistance: 110, metric: 30, nextHop: '192.0.2.5', exitInterface: 'Gi0/4' }
];

describe('IPv4 route selection', () => {
  it('normalizes a prefix to its network address', () => {
    expect(normalizeNetwork('10.1.2.99', 24)).toBe('10.1.2.0');
  });

  it('uses longest-prefix match before administrative distance', () => {
    expect(selectBestRoutes(routes, '10.1.2.50').map(route => route.id)).toEqual(['ospf-10-1-2a', 'ospf-10-1-2b']);
    expect(selectBestRoutes(routes, '10.1.9.10')[0].id).toBe('static-10-1');
  });

  it('falls back to the default route and returns an empty result without one', () => {
    expect(selectBestRoutes(routes, '203.0.113.10')[0].id).toBe('default');
    expect(selectBestRoutes(routes.slice(1), '203.0.113.10')).toEqual([]);
  });
});

describe('OSPF calculations and elections', () => {
  it('calculates interface cost from the configured reference bandwidth', () => {
    expect(calculateOspfCost(10)).toBe(10);
    expect(calculateOspfCost(1000)).toBe(1);
    expect(calculateOspfCost(1000, 100000)).toBe(100);
  });

  it('selects configured, loopback, then active-interface router IDs', () => {
    expect(selectOspfRouterId('1.1.1.1', ['10.0.0.1'], ['192.0.2.1']).source).toBe('configured');
    expect(selectOspfRouterId(undefined, ['2.2.2.2', '3.3.3.3'], ['192.0.2.1'])).toEqual({ routerId: '3.3.3.3', source: 'loopback' });
    expect(selectOspfRouterId(undefined, [], ['192.0.2.1', '198.51.100.2'])).toEqual({ routerId: '198.51.100.2', source: 'interface' });
  });

  it('elects DR and BDR by priority, then router ID, excluding priority zero', () => {
    const election = electOspfDrBdr([
      { id: 'R1', priority: 1, routerId: '1.1.1.1' },
      { id: 'R2', priority: 100, routerId: '2.2.2.2' },
      { id: 'R3', priority: 100, routerId: '3.3.3.3' },
      { id: 'R4', priority: 0, routerId: '4.4.4.4' }
    ]);
    expect(election.dr?.id).toBe('R3');
    expect(election.bdr?.id).toBe('R2');
  });
});

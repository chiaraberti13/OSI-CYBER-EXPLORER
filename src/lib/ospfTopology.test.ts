import { describe, expect, it } from 'vitest';
import { computeSpf, type OspfSpfOptions } from './ospfTopology';
import { OSPF_LINKS, OSPF_ROUTERS } from '../content/ospfTopology';

const spf = (over: Partial<OspfSpfOptions> = {}) =>
  computeSpf({ routers: OSPF_ROUTERS, links: OSPF_LINKS, rootId: 'R1', ...over });

const routeTo = (result: ReturnType<typeof computeSpf>, network: string) =>
  result.routes.find(route => route.network === network)!;

describe('interface cost from the reference bandwidth', () => {
  it('uses the IOS default of 100 Mb/s, truncating the division', () => {
    const result = spf();
    expect(result.linkCosts['r1-r2']).toBe(1);     // 1 Gb/s: 100/1000 floors to 0, raised to 1
    expect(result.linkCosts['r2-r3']).toBe(10);    // 10 Mb/s
    expect(result.linkCosts['r4-r5']).toBe(64);    // T1: 100/1.544 = 64.76 → 64
  });

  it('separates speeds the default cannot rank apart once the reference is raised', () => {
    // At the default, the 100 Mb/s and the 1 Gb/s link both cost 1.
    expect(spf().linkCosts['r2-r4']).toBe(spf().linkCosts['r3-r4']);
    const raised = spf({ referenceBandwidthMbps: 1000 });
    expect(raised.linkCosts['r2-r4']).toBe(10);
    expect(raised.linkCosts['r3-r4']).toBe(1);
  });

  it('names the links whose cost hides a real difference', () => {
    // Cost 1 is shared by 1 Gb/s and 100 Mb/s links, so all four are flagged.
    expect(spf().indistinguishableLinks.sort()).toEqual(['r1-r2', 'r1-r3', 'r2-r4', 'r3-r4']);
    expect(spf({ referenceBandwidthMbps: 1000 }).indistinguishableLinks).toEqual([]);
  });
});

describe('the shortest path tree', () => {
  it('costs every router from the root', () => {
    expect(spf().routerCosts).toEqual({ R1: 0, R2: 1, R3: 1, R4: 2, R5: 66 });
  });

  it('prefers two cheap hops over one expensive cross link', () => {
    // R1 reaches R3 directly for 1, never through R2 for 1 + 10.
    const result = spf();
    expect(result.routerCosts.R3).toBe(1);
    expect(routeTo(result, '10.0.3.0').paths).toEqual([['R1', 'R3']]);
  });

  it('adds the stub interface cost on top of the path cost', () => {
    const branch = routeTo(spf(), '10.0.4.0');
    expect(branch.routerCost).toBe(2);
    expect(branch.totalCost).toBe(3);
  });

  it('treats a network on the root as connected, with no path cost', () => {
    const local = routeTo(spf(), '10.0.1.0');
    expect(local.local).toBe(true);
    expect(local.totalCost).toBe(1);
    expect(local.paths).toEqual([['R1']]);
  });
});

describe('equal-cost multipath', () => {
  it('installs both paths when they tie at the default reference', () => {
    const branch = routeTo(spf(), '10.0.4.0');
    expect(branch.ecmp).toBe(true);
    expect(branch.nextHops).toEqual(['R2', 'R3']);
    expect(branch.paths).toEqual([['R1', 'R2', 'R4'], ['R1', 'R3', 'R4']]);
  });

  it('stops load-balancing once the faster path is actually cheaper', () => {
    const branch = routeTo(spf({ referenceBandwidthMbps: 1000 }), '10.0.4.0');
    expect(branch.ecmp).toBe(false);
    expect(branch.nextHops).toEqual(['R3']);
    expect(branch.routerCost).toBe(2);
  });

  it('honours maximum-paths, which IOS defaults to 4', () => {
    const limited = routeTo(spf({ maximumPaths: 1 }), '10.0.4.0');
    expect(limited.nextHops).toEqual(['R2']);
    expect(limited.paths).toHaveLength(1);
    expect(() => spf({ maximumPaths: 0 })).toThrow('INVALID_MAXIMUM_PATHS');
  });
});

describe('reconvergence when a link fails', () => {
  it('falls back to the surviving path at its real cost', () => {
    const result = spf({ referenceBandwidthMbps: 1000, downLinkIds: ['r3-r4'] });
    const branch = routeTo(result, '10.0.4.0');
    expect(branch.nextHops).toEqual(['R2']);
    expect(branch.routerCost).toBe(11);
    expect(result.routerCosts.R5).toBe(11 + 647);
  });

  it('reports a router as unreachable when every path to it is down', () => {
    const result = spf({ downLinkIds: ['r2-r4', 'r3-r4'] });
    expect(result.unreachableRouters.sort()).toEqual(['R4', 'R5']);
    expect(result.routes.some(route => route.network === '10.0.4.0')).toBe(false);
    // The routers still reachable keep their costs.
    expect(result.routerCosts).toEqual({ R1: 0, R2: 1, R3: 1 });
  });

  it('leaves the rest of the tree untouched by an unrelated failure', () => {
    const result = spf({ downLinkIds: ['r2-r3'] });
    expect(result.routerCosts).toEqual({ R1: 0, R2: 1, R3: 1, R4: 2, R5: 66 });
  });
});

describe('the root matters', () => {
  it('produces a different tree from a different router', () => {
    const fromR5 = spf({ rootId: 'R5' });
    // 64 sul T1, piu un salto da R4 e uno da R2 o R3: 66.
    expect(fromR5.routerCosts.R1).toBe(66);
    // Everything R5 knows is behind the T1: one next hop for the whole network.
    expect(new Set(fromR5.routes.filter(route => !route.local).map(route => route.nextHops.join()))).toEqual(new Set(['R4']));
  });
});

describe('invalid topologies', () => {
  it('refuses input it cannot compute', () => {
    expect(() => computeSpf({ routers: [], links: [], rootId: 'R1' })).toThrow('NO_ROUTERS');
    expect(() => spf({ rootId: 'R9' })).toThrow('UNKNOWN_ROOT');
    expect(() => spf({ links: [...OSPF_LINKS, { id: 'ghost', a: 'R1', b: 'R9', bandwidthMbps: 100 }] })).toThrow('UNKNOWN_ROUTER');
    expect(() => spf({ referenceBandwidthMbps: 0 })).toThrow('INVALID_REFERENCE_BANDWIDTH');
  });
});

import { describe, expect, it } from 'vitest';
import { bridgeIdFor, convergeStp, pathCostFor, type StpResult, type StpSwitch } from './stp';
import { STP_LINKS, STP_SWITCHES } from '../content/stpTopology';

const converge = (vlan: number, overrides: Partial<Record<string, number>> = {}, method: 'short' | 'long' = 'short') =>
  convergeStp({
    switches: STP_SWITCHES.map(item => (
      overrides[item.id] === undefined
        ? item
        : { ...item, priority: overrides[item.id]!, vlanPriority: { ...item.vlanPriority, [vlan]: overrides[item.id]! } }
    )),
    links: STP_LINKS,
    vlan,
    method
  });

const portOf = (result: StpResult, switchId: string, port: string) =>
  result.ports.find(item => item.switchId === switchId && item.port === port);

const blockingPorts = (result: StpResult) =>
  result.ports.filter(item => item.state === 'blocking').map(item => `${item.switchId} ${item.port}`).sort();

describe('Bridge ID', () => {
  it('adds the VLAN to the configured priority, as the extended system ID does', () => {
    const id = bridgeIdFor(STP_SWITCHES[0], 10);
    expect(id.priority).toBe(24576);
    expect(id.value).toBe(24586);
    expect(id.text).toBe('24586 (24576 sys-id-ext 10)');
  });

  it('falls back to the global priority on a VLAN with no override', () => {
    expect(bridgeIdFor(STP_SWITCHES[0], 30).value).toBe(32798);
  });

  it('rejects a priority that is not a multiple of 4096', () => {
    const wrong: StpSwitch = { id: 'x', name: 'X', mac: '0000.0000.0001', priority: 5000 };
    expect(() => bridgeIdFor(wrong, 1)).toThrow('INVALID_STP_PRIORITY');
    expect(() => bridgeIdFor({ ...wrong, priority: 65536 }, 1)).toThrow('INVALID_STP_PRIORITY');
  });
});

describe('root bridge election', () => {
  it('elects the switch configured as root for that VLAN', () => {
    expect(converge(10).rootId).toBe('dsw1');
    expect(converge(20).rootId).toBe('dsw2');
  });

  it('falls back to the lowest MAC when every priority is equal', () => {
    // On VLAN 30 nobody has an override, so all four sit at 32768 and only the MAC decides.
    expect(convergeStp({ switches: STP_SWITCHES, links: STP_LINKS, vlan: 30 }).rootId).toBe('dsw1');
  });

  it('moves the root when an access switch is given a lower priority', () => {
    // The classic misconfiguration: the whole tree now hangs off the access layer.
    const result = converge(10, { asw1: 4096 });
    expect(result.rootId).toBe('asw1');
    expect(result.rootPathCosts.dsw1).toBe(4);
    const rootPorts = result.ports.filter(item => item.switchId === 'asw1' && item.role === 'root');
    expect(rootPorts).toHaveLength(0);
  });
});

describe('root path cost', () => {
  it('prefers two cheap hops over one expensive one', () => {
    // DSW2 could reach DSW1 through an access switch for 4 + 4, but the 10 Gb/s
    // link between the distribution pair costs 2.
    const result = converge(10);
    expect(result.rootPathCosts).toEqual({ dsw1: 0, dsw2: 2, asw1: 4, asw2: 4 });
  });

  it('scales with the path cost method without changing the tree', () => {
    const short = converge(10);
    const long = converge(10, {}, 'long');
    expect(pathCostFor('10 Gb/s', 'short')).toBe(2);
    expect(pathCostFor('10 Gb/s', 'long')).toBe(2000);
    expect(long.rootPathCosts).toEqual({ dsw1: 0, dsw2: 2000, asw1: 20000, asw2: 20000 });
    expect(blockingPorts(long)).toEqual(blockingPorts(short));
  });

  it('refuses a link speed the chosen method cannot cost', () => {
    expect(() => pathCostFor('40 Gb/s', 'short')).toThrow('UNKNOWN_LINK_SPEED');
    expect(pathCostFor('100 Gb/s', 'long')).toBe(200);
  });
});

describe('port roles', () => {
  it('gives every non-root switch exactly one root port, and the root none', () => {
    const result = converge(10);
    for (const item of STP_SWITCHES) {
      const rootPorts = result.ports.filter(port => port.switchId === item.id && port.role === 'root');
      expect(rootPorts.length, `${item.id} root ports`).toBe(item.id === result.rootId ? 0 : 1);
    }
  });

  it('leaves every port of the root bridge designated and forwarding', () => {
    const result = converge(10);
    const rootPorts = result.ports.filter(port => port.switchId === 'dsw1');
    expect(rootPorts.length).toBe(3);
    expect(rootPorts.every(port => port.role === 'designated' && port.state === 'forwarding')).toBe(true);
  });

  it('gives every segment exactly one designated port', () => {
    const result = converge(10);
    for (const link of STP_LINKS) {
      const designated = result.ports.filter(port => port.linkId === link.id && port.role === 'designated');
      expect(designated.length, `${link.id} designated ports`).toBe(1);
    }
  });

  it('blocks the redundant uplinks and the access cross link on VLAN 10', () => {
    expect(blockingPorts(converge(10))).toEqual(['asw1 Gi1/0/23', 'asw2 Gi1/0/1', 'asw2 Gi1/0/23']);
  });

  it('breaks a cost tie with the lower Bridge ID', () => {
    // ASW1 and ASW2 both sit at cost 4, so the cross link is decided by MAC:
    // ASW1 ends in ...3333 and wins, ASW2 blocks.
    const result = converge(10);
    expect(portOf(result, 'asw1', 'Gi1/0/1')?.role).toBe('designated');
    expect(portOf(result, 'asw2', 'Gi1/0/1')?.role).toBe('alternate');
  });

  it('picks the uplink toward the root, not the cheaper-looking neighbour', () => {
    const result = converge(10);
    expect(portOf(result, 'asw1', 'Gi1/0/24')?.role).toBe('root');
    expect(portOf(result, 'asw1', 'Gi1/0/23')?.role).toBe('alternate');
  });
});

describe('per-VLAN trees', () => {
  it('sends the two VLANs up different uplinks', () => {
    const ten = converge(10);
    const twenty = converge(20);
    // VLAN 10 climbs through DSW1, VLAN 20 through DSW2: both uplinks carry traffic.
    expect(portOf(ten, 'asw1', 'Gi1/0/24')?.role).toBe('root');
    expect(portOf(twenty, 'asw1', 'Gi1/0/23')?.role).toBe('root');
    expect(portOf(twenty, 'asw1', 'Gi1/0/24')?.role).toBe('alternate');
  });

  it('blocks a different set of ports per VLAN', () => {
    expect(blockingPorts(converge(20))).not.toEqual(blockingPorts(converge(10)));
  });
});

describe('the result is a spanning tree', () => {
  it('leaves exactly one forwarding path per switch pair', () => {
    for (const vlan of [10, 20, 30]) {
      const result = converge(vlan);
      const forwardingLinks = STP_LINKS.filter(link => !result.blockedLinkIds.includes(link.id));
      // A loop-free tree over n nodes has exactly n - 1 edges.
      expect(forwardingLinks.length, `VLAN ${vlan}`).toBe(STP_SWITCHES.length - 1);
    }
  });

  it('explains every port in both languages', () => {
    for (const port of converge(10).ports) {
      expect(port.reason.it.length).toBeGreaterThan(30);
      expect(port.reason.en.length).toBeGreaterThan(30);
    }
  });
});

describe('invalid topologies', () => {
  it('rejects nonsense input instead of inventing a tree', () => {
    expect(() => convergeStp({ switches: [], links: [], vlan: 10 })).toThrow('NO_SWITCHES');
    expect(() => convergeStp({ switches: STP_SWITCHES, links: STP_LINKS, vlan: 5000 })).toThrow('INVALID_VLAN');
    expect(() => convergeStp({
      switches: STP_SWITCHES,
      links: [...STP_LINKS, { id: 'ghost', from: { switchId: 'dsw1', port: 'Gi1/0/9' }, to: { switchId: 'nope', port: 'Gi1/0/9' }, speed: '1 Gb/s' }],
      vlan: 10
    })).toThrow('UNKNOWN_SWITCH');
  });

  it('refuses a switch with no path to the root', () => {
    expect(() => convergeStp({
      switches: [...STP_SWITCHES, { id: 'orphan', name: 'ORPHAN', mac: '0009.0000.9999', priority: 32768 }],
      links: STP_LINKS,
      vlan: 10
    })).toThrow('UNREACHABLE_SWITCH');
  });
});

describe('the explanation names the criterion that actually decided', () => {
  const reasonOf = (vlan: number, switchId: string, port: string) =>
    convergeStp({ switches: STP_SWITCHES, links: STP_LINKS, vlan }).ports
      .find(item => item.switchId === switchId && item.port === port)!.reason;

  it('says "lower Bridge ID" when the two ends cost the same', () => {
    // ASW1 and ASW2 both sit at cost 4 on the cross link, so cost cannot be the reason.
    expect(reasonOf(10, 'asw1', 'Gi1/0/1').en).toMatch(/Identical cost at both ends \(4\)/);
    expect(reasonOf(10, 'asw1', 'Gi1/0/1').en).toMatch(/lower Bridge ID/);
    expect(reasonOf(10, 'asw2', 'Gi1/0/1').en).toMatch(/higher Bridge ID/);
    expect(reasonOf(10, 'asw2', 'Gi1/0/1').it).toMatch(/Bridge ID più alto/);
  });

  it('says "better cost" only when the costs really differ', () => {
    // DSW2 is at 2 and ASW1 at 4 on the secondary uplink, so here cost is the reason.
    expect(reasonOf(10, 'dsw2', 'Gi1/0/11').en).toMatch(/better cost to the root \(2 against 4\)/);
    expect(reasonOf(10, 'asw1', 'Gi1/0/23').en).toMatch(/Worse cost to the root than DSW2 \(4 against 2\)/);
  });

  it('never claims a cost is better than an equal one', () => {
    for (const vlan of [10, 20, 30]) {
      for (const port of convergeStp({ switches: STP_SWITCHES, links: STP_LINKS, vlan }).ports) {
        const equalPair = /\((\d+) against \1\)/.test(port.reason.en);
        expect(equalPair, `${port.switchId} ${port.port}`).toBe(false);
      }
    }
  });
});

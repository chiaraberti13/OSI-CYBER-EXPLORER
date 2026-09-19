import type { Bilingual } from '../types';
import { normalizeMac, STP_LONG_PATH_COST, STP_SHORT_PATH_COST } from './networkAccess';

/**
 * Spanning tree convergence on a topology, one VLAN at a time.
 *
 * The lab already explains the election in the abstract: lowest Bridge ID wins, then
 * lowest root path cost, then the tie-breakers. What that never shows is the thing the
 * exam actually asks — on *this* diagram, with *these* priorities, which single port
 * ends up blocking. So this engine runs the real algorithm and labels every port, and
 * because the Bridge ID carries the VLAN in its extended system ID, switching VLAN
 * shows PVST+ load balancing as a consequence rather than as a claim.
 *
 * It models 802.1D/PVST+ roles. RSTP adds the alternate/backup distinction and faster
 * transitions, but picks the same tree from the same priority vectors.
 */

export type StpPathCostMethod = 'short' | 'long';
export type StpPortRole = 'root' | 'designated' | 'alternate';
export type StpPortState = 'forwarding' | 'blocking';

export interface StpSwitch {
  id: string;
  name: string;
  /** Base MAC, used as the low-order part of the Bridge ID. */
  mac: string;
  /** Configured bridge priority; must be a multiple of 4096 between 0 and 61440. */
  priority: number;
  /** Per-VLAN priority overrides, as `spanning-tree vlan N priority` would set them. */
  vlanPriority?: Record<number, number>;
}

export interface StpLink {
  id: string;
  from: { switchId: string; port: string };
  to: { switchId: string; port: string };
  /** Key into the chosen path cost table, e.g. '1 Gb/s'. */
  speed: string;
}

export interface StpBridgeId {
  /** Configured priority alone. */
  priority: number;
  /** Priority plus the VLAN carried in the extended system ID: what actually competes. */
  value: number;
  mac: string;
  /** How IOS prints it, e.g. '24586 (24576 sys-id-ext 10)'. */
  text: string;
}

export interface StpPort {
  switchId: string;
  port: string;
  linkId: string;
  neighborId: string;
  neighborPort: string;
  role: StpPortRole;
  state: StpPortState;
  /** Cost of this port, from the speed and the chosen method. */
  cost: number;
  /** Cost from this port's switch to the root bridge. */
  rootPathCost: number;
  reason: Bilingual;
}

export interface StpResult {
  vlan: number;
  method: StpPathCostMethod;
  rootId: string;
  bridgeIds: Record<string, StpBridgeId>;
  rootPathCosts: Record<string, number>;
  ports: StpPort[];
  /** Links with a blocking end: the redundant paths the tree has cut. */
  blockedLinkIds: string[];
}

export interface StpOptions {
  switches: StpSwitch[];
  links: StpLink[];
  vlan: number;
  method?: StpPathCostMethod;
}

const b = (it: string, en: string): Bilingual => ({ it, en });

/** Default port priority; uniform here, so only the port number breaks ties. */
const PORT_PRIORITY = 128;

/**
 * Port ID for tie-breaking: priority then port number. The number is the trailing
 * digits of the interface name, which is what the switch itself compares.
 */
function portId(port: string): number {
  const digits = port.match(/(\d+)\s*$/);
  if (!digits) throw new Error('INVALID_PORT');
  return PORT_PRIORITY * 100_000 + Number(digits[1]);
}

export function pathCostFor(speed: string, method: StpPathCostMethod): number {
  const table = method === 'long' ? STP_LONG_PATH_COST : STP_SHORT_PATH_COST;
  const cost = table[speed];
  if (cost === undefined) throw new Error('UNKNOWN_LINK_SPEED');
  return cost;
}

export function bridgePriorityFor(candidate: StpSwitch, vlan: number): number {
  return candidate.vlanPriority?.[vlan] ?? candidate.priority;
}

/**
 * The Bridge ID actually advertised. With the extended system ID — the default on
 * every current switch — the 12 bits that once held an arbitrary priority now hold the
 * VLAN, so the configured priority is only settable in steps of 4096 and the VLAN is
 * added to it. This is why `priority 24576` on VLAN 10 shows up as 24586.
 */
export function bridgeIdFor(candidate: StpSwitch, vlan: number): StpBridgeId {
  const priority = bridgePriorityFor(candidate, vlan);
  if (!Number.isInteger(priority) || priority < 0 || priority > 61440 || priority % 4096 !== 0) {
    throw new Error('INVALID_STP_PRIORITY');
  }
  const mac = normalizeMac(candidate.mac);
  return {
    priority,
    value: priority + vlan,
    mac,
    text: `${priority + vlan} (${priority} sys-id-ext ${vlan})`
  };
}

/** Negative when `left` wins the comparison, as a lower Bridge ID does. */
function compareBridgeIds(left: StpBridgeId, right: StpBridgeId): number {
  if (left.value !== right.value) return left.value - right.value;
  return left.mac < right.mac ? -1 : left.mac > right.mac ? 1 : 0;
}

interface Adjacency {
  linkId: string;
  port: string;
  neighborId: string;
  neighborPort: string;
  cost: number;
}

export function convergeStp({ switches, links, vlan, method = 'short' }: StpOptions): StpResult {
  if (switches.length === 0) throw new Error('NO_SWITCHES');
  if (!Number.isInteger(vlan) || vlan < 1 || vlan > 4094) throw new Error('INVALID_VLAN');

  const byId = new Map(switches.map(item => [item.id, item]));
  const bridgeIds: Record<string, StpBridgeId> = {};
  for (const item of switches) bridgeIds[item.id] = bridgeIdFor(item, vlan);

  const adjacency = new Map<string, Adjacency[]>(switches.map(item => [item.id, []]));
  for (const link of links) {
    if (!byId.has(link.from.switchId)) throw new Error('UNKNOWN_SWITCH');
    if (!byId.has(link.to.switchId)) throw new Error('UNKNOWN_SWITCH');
    const cost = pathCostFor(link.speed, method);
    adjacency.get(link.from.switchId)!.push({ linkId: link.id, port: link.from.port, neighborId: link.to.switchId, neighborPort: link.to.port, cost });
    adjacency.get(link.to.switchId)!.push({ linkId: link.id, port: link.to.port, neighborId: link.from.switchId, neighborPort: link.from.port, cost });
  }

  // 1. The root is simply the lowest Bridge ID. Nothing else is considered.
  const rootId = switches.reduce((best, candidate) =>
    compareBridgeIds(bridgeIds[candidate.id], bridgeIds[best.id]) < 0 ? candidate : best
  ).id;

  // 2. Root path cost per switch: the cheapest sum of port costs back to the root.
  const rootPathCosts: Record<string, number> = {};
  for (const item of switches) rootPathCosts[item.id] = item.id === rootId ? 0 : Number.POSITIVE_INFINITY;
  // Bellman-Ford: the topologies here are a handful of switches, and relaxing until
  // nothing improves is easier to read than a priority queue.
  for (let round = 0; round < switches.length; round += 1) {
    let changed = false;
    for (const item of switches) {
      for (const edge of adjacency.get(item.id)!) {
        const candidate = rootPathCosts[edge.neighborId] + edge.cost;
        if (candidate < rootPathCosts[item.id]) {
          rootPathCosts[item.id] = candidate;
          changed = true;
        }
      }
    }
    if (!changed) break;
  }
  for (const item of switches) {
    if (!Number.isFinite(rootPathCosts[item.id])) throw new Error('UNREACHABLE_SWITCH');
  }

  // 3. One root port per non-root switch: lowest root path cost through that port,
  //    then lowest neighbour Bridge ID, then lowest neighbour port ID, then own port ID.
  const rootPortBySwitch = new Map<string, Adjacency>();
  for (const item of switches) {
    if (item.id === rootId) continue;
    const best = adjacency.get(item.id)!.reduce<Adjacency | null>((winner, edge) => {
      if (!winner) return edge;
      const edgeTotal = rootPathCosts[edge.neighborId] + edge.cost;
      const winnerTotal = rootPathCosts[winner.neighborId] + winner.cost;
      if (edgeTotal !== winnerTotal) return edgeTotal < winnerTotal ? edge : winner;
      const bridgeComparison = compareBridgeIds(bridgeIds[edge.neighborId], bridgeIds[winner.neighborId]);
      if (bridgeComparison !== 0) return bridgeComparison < 0 ? edge : winner;
      if (portId(edge.neighborPort) !== portId(winner.neighborPort)) {
        return portId(edge.neighborPort) < portId(winner.neighborPort) ? edge : winner;
      }
      return portId(edge.port) < portId(winner.port) ? edge : winner;
    }, null);
    if (best) rootPortBySwitch.set(item.id, best);
  }

  // 4. One designated port per link. The peer of a root port is always designated,
  //    because that is where the superior BPDU came from; otherwise the end with the
  //    lower root path cost wins, then the lower Bridge ID, then the lower port ID.
  const ports: StpPort[] = [];
  const blockedLinkIds: string[] = [];

  for (const link of links) {
    const cost = pathCostFor(link.speed, method);
    const ends = [
      { switchId: link.from.switchId, port: link.from.port, neighborId: link.to.switchId, neighborPort: link.to.port },
      { switchId: link.to.switchId, port: link.to.port, neighborId: link.from.switchId, neighborPort: link.from.port }
    ];

    const rootEnd = ends.find(end => rootPortBySwitch.get(end.switchId)?.linkId === link.id);
    let designatedEnd: typeof ends[number];
    // Which criterion settled this segment: it is what the explanation has to name,
    // because "better cost" is simply false when the two costs are equal.
    let decidedBy: 'root-port' | 'cost' | 'bridge-id' | 'port-id';
    if (rootEnd) {
      designatedEnd = ends.find(end => end !== rootEnd)!;
      decidedBy = 'root-port';
    } else {
      const [left, right] = ends;
      if (rootPathCosts[left.switchId] !== rootPathCosts[right.switchId]) {
        designatedEnd = rootPathCosts[left.switchId] < rootPathCosts[right.switchId] ? left : right;
        decidedBy = 'cost';
      } else {
        const comparison = compareBridgeIds(bridgeIds[left.switchId], bridgeIds[right.switchId]);
        if (comparison !== 0) {
          designatedEnd = comparison < 0 ? left : right;
          decidedBy = 'bridge-id';
        } else {
          designatedEnd = portId(left.port) < portId(right.port) ? left : right;
          decidedBy = 'port-id';
        }
      }
    }

    for (const end of ends) {
      const isRoot = end === rootEnd;
      const isDesignated = end === designatedEnd;
      const role: StpPortRole = isRoot ? 'root' : isDesignated ? 'designated' : 'alternate';
      const neighbourName = byId.get(end.neighborId)!.name;
      const own = rootPathCosts[end.switchId];
      const peer = rootPathCosts[end.neighborId];
      let reason: Bilingual;
      if (isRoot) {
        reason = b(
          `Costo più basso verso la root: ${own} passando da ${neighbourName}. È l'unica porta da cui questo switch ascolta la root.`,
          `Lowest cost to the root: ${own} through ${neighbourName}. It is the only port this switch listens to the root on.`
        );
      } else if (isDesignated && end.switchId === rootId) {
        reason = b(
          'Ogni porta della root bridge è designated: la root non ha nulla verso cui risalire.',
          'Every port on the root bridge is designated: the root has nothing to climb toward.'
        );
      } else if (isDesignated && decidedBy === 'root-port') {
        reason = b(
          `${neighbourName} ha eletto la propria porta su questo segmento come root port, quindi questo lato è designated e inoltra.`,
          `${neighbourName} elected its port on this segment as its root port, so this side is designated and forwards.`
        );
      } else if (isDesignated && decidedBy === 'cost') {
        reason = b(
          `Su questo segmento questo lato annuncia il costo migliore verso la root (${own} contro ${peer}), quindi inoltra verso ${neighbourName}.`,
          `On this segment this side advertises the better cost to the root (${own} against ${peer}), so it forwards toward ${neighbourName}.`
        );
      } else if (isDesignated && decidedBy === 'bridge-id') {
        reason = b(
          `Costo identico ai due capi (${own}): decide il Bridge ID più basso, che è quello di questo switch rispetto a ${neighbourName}.`,
          `Identical cost at both ends (${own}): the lower Bridge ID decides, and this switch holds it against ${neighbourName}.`
        );
      } else if (isDesignated) {
        reason = b(
          `Costo e Bridge ID identici: decide il Port ID più basso, che è quello di questa porta.`,
          `Identical cost and Bridge ID: the lower Port ID decides, and this port holds it.`
        );
      } else if (decidedBy === 'cost') {
        reason = b(
          `Costo verso la root peggiore di ${neighbourName} (${own} contro ${peer}) e non è root port: blocca per rompere il loop, ma continua ad ascoltare le BPDU.`,
          `Worse cost to the root than ${neighbourName} (${own} against ${peer}), and not a root port: it blocks to break the loop, but keeps listening to BPDUs.`
        );
      } else if (decidedBy === 'bridge-id') {
        reason = b(
          `Costo identico a ${neighbourName} (${own}), ma Bridge ID più alto: perde il ruolo di designated e blocca, continuando ad ascoltare le BPDU.`,
          `Same cost as ${neighbourName} (${own}), but a higher Bridge ID: it loses the designated role and blocks, while still listening to BPDUs.`
        );
      } else {
        reason = b(
          `Costo e Bridge ID identici a ${neighbourName}, ma Port ID più alto: blocca, continuando ad ascoltare le BPDU.`,
          `Same cost and Bridge ID as ${neighbourName}, but a higher Port ID: it blocks, while still listening to BPDUs.`
        );
      }

      ports.push({
        switchId: end.switchId,
        port: end.port,
        linkId: link.id,
        neighborId: end.neighborId,
        neighborPort: end.neighborPort,
        role,
        state: role === 'alternate' ? 'blocking' : 'forwarding',
        cost,
        rootPathCost: rootPathCosts[end.switchId],
        reason
      });

      if (role === 'alternate' && !blockedLinkIds.includes(link.id)) blockedLinkIds.push(link.id);
    }
  }

  return { vlan, method, rootId, bridgeIds, rootPathCosts, ports, blockedLinkIds };
}

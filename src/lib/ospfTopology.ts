import type { Bilingual } from '../types';
import { calculateOspfCost, normalizeNetwork } from './ipConnectivity';

/**
 * OSPF as it actually decides: the shortest path tree, not one interface cost.
 *
 * The lab already converts a bandwidth into a cost. What that cannot show is the thing
 * the exam asks and the design gets wrong: on *this* topology, which path wins, when
 * do two paths tie and get installed together, and what happens to both answers when
 * the reference bandwidth is left at its 1990s default of 100 Mb/s — where a 100 Mb/s
 * link and a 1 Gb/s link are indistinguishable, so OSPF load-balances across them as
 * if they were equal.
 *
 * Dijkstra with a predecessor *set* per node, because collecting every equal-cost
 * predecessor is what makes equal-cost multipath visible instead of arbitrary.
 */

export interface OspfStubNetwork {
  address: string;
  prefix: number;
  /** Cost of the interface the network sits on; a loopback is 1 by default on IOS. */
  cost?: number;
  label?: Bilingual;
}

export interface OspfRouterNode {
  id: string;
  name: string;
  routerId: string;
  networks: OspfStubNetwork[];
}

export interface OspfTopologyLink {
  id: string;
  a: string;
  b: string;
  /** Interface bandwidth in Mb/s; the cost is derived from it. */
  bandwidthMbps: number;
}

export interface OspfRouteEntry {
  network: string;
  prefix: number;
  /** Router advertising the network. */
  advertisedBy: string;
  totalCost: number;
  /** Cost to reach the advertising router, before the stub interface cost. */
  routerCost: number;
  /** Every equal-cost path, each as a list of router ids from root to destination. */
  paths: string[][];
  /** First hop after the root, one per equal-cost path. */
  nextHops: string[];
  ecmp: boolean;
  /** True when the network is on the root itself: connected, not learned via OSPF. */
  local: boolean;
}

export interface OspfSpfResult {
  rootId: string;
  referenceBandwidthMbps: number;
  /** Cost from the root to each reachable router. */
  routerCosts: Record<string, number>;
  routes: OspfRouteEntry[];
  /** Routers with no path to the root once the down links are removed. */
  unreachableRouters: string[];
  /** Cost of each link that is still up, after the reference bandwidth in force. */
  linkCosts: Record<string, number>;
  /** Links whose two ends are the same speed but whose cost hides a real difference. */
  indistinguishableLinks: string[];
}

export interface OspfSpfOptions {
  routers: OspfRouterNode[];
  links: OspfTopologyLink[];
  rootId: string;
  /** `auto-cost reference-bandwidth`, in Mb/s. IOS defaults to 100. */
  referenceBandwidthMbps?: number;
  /** Link ids currently down, to watch the tree reconverge. */
  downLinkIds?: string[];
  /** `maximum-paths`; IOS installs 4 equal-cost paths by default. */
  maximumPaths?: number;
}

interface Edge { to: string; cost: number; linkId: string }

export function computeSpf({
  routers,
  links,
  rootId,
  referenceBandwidthMbps = 100,
  downLinkIds = [],
  maximumPaths = 4
}: OspfSpfOptions): OspfSpfResult {
  if (routers.length === 0) throw new Error('NO_ROUTERS');
  if (maximumPaths < 1) throw new Error('INVALID_MAXIMUM_PATHS');
  const byId = new Map(routers.map(router => [router.id, router]));
  if (!byId.has(rootId)) throw new Error('UNKNOWN_ROOT');

  const adjacency = new Map<string, Edge[]>(routers.map(router => [router.id, []]));
  const linkCosts: Record<string, number> = {};
  for (const link of links) {
    if (!byId.has(link.a) || !byId.has(link.b)) throw new Error('UNKNOWN_ROUTER');
    const cost = calculateOspfCost(link.bandwidthMbps, referenceBandwidthMbps);
    if (downLinkIds.includes(link.id)) continue;
    linkCosts[link.id] = cost;
    adjacency.get(link.a)!.push({ to: link.b, cost, linkId: link.id });
    adjacency.get(link.b)!.push({ to: link.a, cost, linkId: link.id });
  }

  // Dijkstra, keeping every predecessor that ties on cost.
  const cost = new Map<string, number>(routers.map(router => [router.id, Number.POSITIVE_INFINITY]));
  const predecessors = new Map<string, Set<string>>(routers.map(router => [router.id, new Set<string>()]));
  const settled = new Set<string>();
  cost.set(rootId, 0);

  for (;;) {
    let current: string | null = null;
    let best = Number.POSITIVE_INFINITY;
    for (const router of routers) {
      const value = cost.get(router.id)!;
      if (!settled.has(router.id) && value < best) { best = value; current = router.id; }
    }
    if (current === null) break;
    settled.add(current);

    for (const edge of adjacency.get(current)!) {
      const candidate = best + edge.cost;
      const known = cost.get(edge.to)!;
      if (candidate < known) {
        cost.set(edge.to, candidate);
        predecessors.set(edge.to, new Set([current]));
      } else if (candidate === known && candidate !== Number.POSITIVE_INFINITY && edge.to !== rootId) {
        predecessors.get(edge.to)!.add(current);
      }
    }
  }

  /** Every equal-cost path from the root to `target`, root first. */
  function pathsTo(target: string): string[][] {
    if (target === rootId) return [[rootId]];
    const parents = predecessors.get(target);
    if (!parents || parents.size === 0) return [];
    const result: string[][] = [];
    for (const parent of [...parents].sort()) {
      for (const prefixPath of pathsTo(parent)) {
        // A cycle cannot appear in a shortest-path tree, but guard anyway.
        if (prefixPath.includes(target)) continue;
        result.push([...prefixPath, target]);
      }
    }
    return result;
  }

  const routerCosts: Record<string, number> = {};
  const unreachableRouters: string[] = [];
  for (const router of routers) {
    const value = cost.get(router.id)!;
    if (Number.isFinite(value)) routerCosts[router.id] = value;
    else unreachableRouters.push(router.id);
  }

  const routes: OspfRouteEntry[] = [];
  for (const router of routers) {
    const routerCost = routerCosts[router.id];
    if (routerCost === undefined) continue;
    const paths = pathsTo(router.id);
    for (const network of router.networks) {
      const stubCost = network.cost ?? 1;
      const nextHops = [...new Set(paths.map(path => path[1]).filter((hop): hop is string => hop !== undefined))].sort();
      routes.push({
        network: normalizeNetwork(network.address, network.prefix),
        prefix: network.prefix,
        advertisedBy: router.id,
        // A network on the root itself is connected: OSPF does not add a path cost to it.
        totalCost: router.id === rootId ? stubCost : routerCost + stubCost,
        routerCost,
        paths: paths.slice(0, Math.max(1, maximumPaths)),
        nextHops: nextHops.slice(0, maximumPaths),
        ecmp: nextHops.length > 1,
        local: router.id === rootId
      });
    }
  }
  routes.sort((left, right) => left.network.localeCompare(right.network) || left.prefix - right.prefix);

  // Links of different speed that the reference bandwidth in force cannot rank apart.
  const costBySpeed = new Map<number, Set<number>>();
  for (const link of links) {
    const value = calculateOspfCost(link.bandwidthMbps, referenceBandwidthMbps);
    if (!costBySpeed.has(value)) costBySpeed.set(value, new Set());
    costBySpeed.get(value)!.add(link.bandwidthMbps);
  }
  const indistinguishableLinks = links
    .filter(link => (costBySpeed.get(calculateOspfCost(link.bandwidthMbps, referenceBandwidthMbps))?.size ?? 0) > 1)
    .map(link => link.id);

  return { rootId, referenceBandwidthMbps, routerCosts, routes, unreachableRouters, linkCosts, indistinguishableLinks };
}

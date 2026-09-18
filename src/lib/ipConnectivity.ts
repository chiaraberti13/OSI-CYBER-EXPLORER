import { ipv4ToUint, prefixToMask, uintToIpv4 } from './ipv4';

export type RouteSource = 'local' | 'connected' | 'static' | 'ospf' | 'ospf-ia';

export interface Ipv4Route {
  id: string;
  source: RouteSource;
  network: string;
  prefix: number;
  administrativeDistance: number;
  metric: number;
  nextHop?: string;
  exitInterface: string;
}

export interface OspfCandidate {
  id: string;
  priority: number;
  routerId: string;
}

/** Who already holds each role when the election runs again (ids of existing candidates). */
export interface OspfElectionState {
  drId?: string;
  bdrId?: string;
}

export interface OspfElectionResult {
  dr: OspfCandidate | null;
  bdr: OspfCandidate | null;
  /** The BDR was promoted to DR because no DR was seated. */
  promotedBdr: boolean;
  /**
   * A better-ranked eligible router was present but could not take a seated role:
   * this is the observable proof that OSPF elections are not preemptive.
   */
  preemptionBlocked: boolean;
}

export interface RouterIdSelection {
  routerId: string;
  source: 'configured' | 'loopback' | 'interface';
}

export const DEFAULT_ADMINISTRATIVE_DISTANCE: Readonly<Record<RouteSource, number>> = {
  local: 0,
  connected: 0,
  static: 1,
  ospf: 110,
  'ospf-ia': 110
};

function assertPrefix(prefix: number): void {
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) throw new Error('INVALID_PREFIX');
}

export function normalizeNetwork(address: string, prefix: number): string {
  assertPrefix(prefix);
  return uintToIpv4((ipv4ToUint(address) & prefixToMask(prefix)) >>> 0);
}

export function routeMatches(route: Ipv4Route, destination: string): boolean {
  assertPrefix(route.prefix);
  const mask = prefixToMask(route.prefix);
  const routeNetwork = ipv4ToUint(normalizeNetwork(route.network, route.prefix));
  return ((ipv4ToUint(destination) & mask) >>> 0) === routeNetwork;
}

export function selectBestRoutes(routes: Ipv4Route[], destination: string): Ipv4Route[] {
  ipv4ToUint(destination);
  const matches = routes.filter(route => routeMatches(route, destination));
  if (matches.length === 0) return [];

  const longestPrefix = Math.max(...matches.map(route => route.prefix));
  const longest = matches.filter(route => route.prefix === longestPrefix);
  const lowestDistance = Math.min(...longest.map(route => route.administrativeDistance));
  const trusted = longest.filter(route => route.administrativeDistance === lowestDistance);
  const lowestMetric = Math.min(...trusted.map(route => route.metric));
  return trusted.filter(route => route.metric === lowestMetric);
}

export function calculateOspfCost(interfaceBandwidthMbps: number, referenceBandwidthMbps = 100): number {
  if (!Number.isFinite(interfaceBandwidthMbps) || interfaceBandwidthMbps <= 0) throw new Error('INVALID_BANDWIDTH');
  if (!Number.isFinite(referenceBandwidthMbps) || referenceBandwidthMbps <= 0) throw new Error('INVALID_REFERENCE_BANDWIDTH');
  return Math.max(1, Math.floor(referenceBandwidthMbps / interfaceBandwidthMbps));
}

function highestIpv4(addresses: string[]): string | null {
  if (addresses.length === 0) return null;
  return addresses.reduce((highest, address) => ipv4ToUint(address) > ipv4ToUint(highest) ? address : highest);
}

export function selectOspfRouterId(configured: string | undefined, loopbacks: string[], interfaces: string[]): RouterIdSelection {
  if (configured) return { routerId: uintToIpv4(ipv4ToUint(configured)), source: 'configured' };
  const loopback = highestIpv4(loopbacks);
  if (loopback) return { routerId: loopback, source: 'loopback' };
  const activeInterface = highestIpv4(interfaces);
  if (activeInterface) return { routerId: activeInterface, source: 'interface' };
  throw new Error('NO_ROUTER_ID_CANDIDATE');
}

/** Highest priority first, then highest Router ID — the OSPF ranking rule. */
function byOspfRank(left: OspfCandidate, right: OspfCandidate): number {
  return right.priority - left.priority || ipv4ToUint(right.routerId) - ipv4ToUint(left.routerId);
}

/**
 * Elects DR and BDR the way RFC 2328 does, which is not simply "the two best routers":
 * the BDR is elected first among the routers that do not already claim the DR role, and it
 * is promoted to DR only when no DR is seated. Passing the current state models the fact
 * that the election is NOT preemptive — a router joining a converged segment with a better
 * priority stays a DROTHER until the seated router disappears.
 */
export function electOspfDrBdr(candidates: OspfCandidate[], current: OspfElectionState = {}): OspfElectionResult {
  const eligible = candidates
    .filter(candidate => {
      if (!Number.isInteger(candidate.priority) || candidate.priority < 0 || candidate.priority > 255) throw new Error('INVALID_OSPF_PRIORITY');
      ipv4ToUint(candidate.routerId);
      return candidate.priority > 0;
    })
    .sort(byOspfRank);

  // A seated role only survives if that router is still present and still eligible.
  const seatedDr = eligible.find(candidate => candidate.id === current.drId) ?? null;
  const seatedBdr = eligible.find(candidate => candidate.id === current.bdrId) ?? null;

  // Step 1: elect the BDR among the routers that are not the DR.
  const bdrPool = eligible.filter(candidate => candidate !== seatedDr);
  let bdr = seatedBdr && seatedBdr !== seatedDr ? seatedBdr : bdrPool[0] ?? null;

  // Step 2: the DR is the seated one, otherwise the BDR is promoted and a new BDR is elected.
  let dr = seatedDr;
  let promotedBdr = false;
  if (!dr && bdr) {
    dr = bdr;
    promotedBdr = true;
    bdr = bdrPool.filter(candidate => candidate !== dr)[0] ?? null;
  }

  const best = eligible[0] ?? null;
  const preemptionBlocked = Boolean(best && dr && best !== dr && byOspfRank(best, dr) < 0);

  return { dr, bdr, promotedBdr, preemptionBlocked };
}

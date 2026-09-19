export type Ipv4AddressKind =
  | 'private'
  | 'public'
  | 'shared'
  | 'special-use'
  | 'loopback'
  | 'link-local'
  | 'multicast'
  | 'documentation'
  | 'unspecified'
  | 'limited-broadcast';

export interface Ipv4Subnet {
  address: string;
  prefix: number;
  subnetMask: string;
  wildcardMask: string;
  networkAddress: string;
  broadcastAddress: string;
  hasBroadcast: boolean;
  firstUsable: string;
  lastUsable: string;
  totalAddresses: number;
  usableHosts: number;
  pointToPoint: boolean;
  hostRoute: boolean;
  kind: Ipv4AddressKind;
  binaryAddress: string[];
  binaryMask: string[];
}

export function ipv4ToUint(address: string): number {
  const octets = address.trim().split('.');
  if (octets.length !== 4) throw new Error('INVALID_IPV4');

  return octets.reduce((value, octet) => {
    if (!/^\d{1,3}$/.test(octet)) throw new Error('INVALID_IPV4');
    const parsed = Number(octet);
    if (parsed < 0 || parsed > 255) throw new Error('INVALID_IPV4');
    return ((value << 8) | parsed) >>> 0;
  }, 0);
}

export function uintToIpv4(value: number): string {
  const unsigned = value >>> 0;
  return [24, 16, 8, 0].map(shift => (unsigned >>> shift) & 0xff).join('.');
}

export function prefixToMask(prefix: number): number {
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) throw new Error('INVALID_PREFIX');
  return prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
}

export function addressKind(value: number): Ipv4AddressKind {
  const address = value >>> 0;
  const matches = (mask: number, expected: number) => ((address & mask) >>> 0) === (expected >>> 0);
  if (address === 0) return 'unspecified';
  if (address === 0xffffffff) return 'limited-broadcast';
  if (matches(0xff000000, 0x7f000000)) return 'loopback';
  if (matches(0xffff0000, 0xa9fe0000)) return 'link-local';
  if (matches(0xf0000000, 0xe0000000)) return 'multicast';
  if (
    matches(0xff000000, 0x0a000000) ||
    matches(0xfff00000, 0xac100000) ||
    matches(0xffff0000, 0xc0a80000)
  ) return 'private';
  if (matches(0xffc00000, 0x64400000)) return 'shared';
  if (
    matches(0xffffff00, 0xc0000200) ||
    matches(0xffffff00, 0xc6336400) ||
    matches(0xffffff00, 0xcb007100)
  ) return 'documentation';
  if (
    matches(0xff000000, 0x00000000) ||
    matches(0xffffff00, 0xc0000000) ||
    matches(0xfffe0000, 0xc6120000) ||
    matches(0xf0000000, 0xf0000000)
  ) return 'special-use';
  return 'public';
}

function binaryOctets(value: number): string[] {
  return uintToIpv4(value).split('.').map(octet => Number(octet).toString(2).padStart(8, '0'));
}

export function calculateIpv4Subnet(address: string, prefix: number): Ipv4Subnet {
  const ip = ipv4ToUint(address);
  const mask = prefixToMask(prefix);
  const wildcard = (~mask) >>> 0;
  const network = (ip & mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;
  const totalAddresses = 2 ** (32 - prefix);
  const pointToPoint = prefix === 31;
  const hostRoute = prefix === 32;

  let firstUsable = network;
  let lastUsable = broadcast;
  let usableHosts = totalAddresses;

  if (prefix <= 30) {
    firstUsable = (network + 1) >>> 0;
    lastUsable = (broadcast - 1) >>> 0;
    usableHosts = totalAddresses - 2;
  }

  return {
    address: uintToIpv4(ip),
    prefix,
    subnetMask: uintToIpv4(mask),
    wildcardMask: uintToIpv4(wildcard),
    networkAddress: uintToIpv4(network),
    broadcastAddress: uintToIpv4(broadcast),
    hasBroadcast: prefix <= 30,
    firstUsable: uintToIpv4(firstUsable),
    lastUsable: uintToIpv4(lastUsable),
    totalAddresses,
    usableHosts,
    pointToPoint,
    hostRoute,
    kind: addressKind(ip),
    binaryAddress: binaryOctets(ip),
    binaryMask: binaryOctets(mask)
  };
}

/**
 * VLSM planning.
 *
 * The subnet explorer analyses an address you already have. What the exam actually
 * asks — and what people get wrong — is the inverse: given a block and a list of
 * requirements, produce the plan. The rule that makes it work is sorting the
 * requirements from largest to smallest; allocating in request order fragments the
 * block and fails on a space that would otherwise have been sufficient.
 */
export interface VlsmRequirement {
  id: string;
  name: string;
  /** Usable hosts needed, excluding network and broadcast. */
  hosts: number;
}

export interface VlsmAllocation {
  id: string;
  name: string;
  requestedHosts: number;
  prefix: number;
  network: string;
  broadcast: string;
  firstUsable: string;
  lastUsable: string;
  usableHosts: number;
  /** Addresses allocated but not requested. */
  wastedHosts: number;
}

export interface VlsmPlan {
  base: string;
  basePrefix: number;
  allocations: VlsmAllocation[];
  totalAddresses: number;
  /** Addresses spent, counting the gaps that boundary alignment leaves unusable. */
  usedAddresses: number;
  /** Share of the block consumed, as a percentage with one decimal. */
  utilisationPercent: number;
  /** First address after the last allocation, or null when the block is full. */
  nextFreeAddress: string | null;
}

/** Smallest prefix that still provides `hosts` usable addresses, counting the two reserved ones. */
export function prefixForHosts(hosts: number): number {
  if (!Number.isInteger(hosts) || hosts < 1) throw new Error('INVALID_HOST_COUNT');
  // /31 and /32 are special cases with no broadcast, so a request of 1 or 2 still needs a /30.
  if (hosts > 2 ** 30 - 2) throw new Error('HOSTS_EXCEED_IPV4');
  for (let prefix = 30; prefix >= 0; prefix -= 1) {
    if (2 ** (32 - prefix) - 2 >= hosts) return prefix;
  }
  throw new Error('HOSTS_EXCEED_IPV4');
}

export function planVlsm(base: string, basePrefix: number, requirements: VlsmRequirement[]): VlsmPlan {
  if (requirements.length === 0) throw new Error('NO_REQUIREMENTS');
  // `&` in JavaScript yields a *signed* 32-bit integer, so 192.168.1.0 & mask comes
  // back negative: `>>> 0` brings it back into the unsigned range the rest of the
  // arithmetic assumes.
  const blockStart = (ipv4ToUint(base) & prefixToMask(basePrefix)) >>> 0;
  const blockSize = 2 ** (32 - basePrefix);
  const blockEnd = blockStart + blockSize - 1;

  // Largest first: this is the whole trick of VLSM.
  const ordered = [...requirements].sort((left, right) => right.hosts - left.hosts || left.id.localeCompare(right.id));

  let cursor = blockStart;
  const allocations: VlsmAllocation[] = [];

  for (const requirement of ordered) {
    const prefix = prefixForHosts(requirement.hosts);
    const size = 2 ** (32 - prefix);
    // A subnet must start on a boundary that is a multiple of its own size.
    const aligned = Math.ceil(cursor / size) * size;
    if (aligned + size - 1 > blockEnd) throw new Error('BLOCK_TOO_SMALL');

    const network = aligned >>> 0;
    const broadcast = (network + size - 1) >>> 0;
    const usableHosts = size - 2;
    allocations.push({
      id: requirement.id,
      name: requirement.name,
      requestedHosts: requirement.hosts,
      prefix,
      network: uintToIpv4(network),
      broadcast: uintToIpv4(broadcast),
      firstUsable: uintToIpv4((network + 1) >>> 0),
      lastUsable: uintToIpv4((broadcast - 1) >>> 0),
      usableHosts,
      wastedHosts: usableHosts - requirement.hosts
    });
    cursor = (broadcast + 1) >>> 0;
  }

  const usedAddresses = cursor - blockStart;
  return {
    base: uintToIpv4(blockStart >>> 0),
    basePrefix,
    allocations,
    totalAddresses: blockSize,
    usedAddresses,
    utilisationPercent: Math.round((usedAddresses / blockSize) * 1000) / 10,
    nextFreeAddress: cursor > blockEnd ? null : uintToIpv4(cursor)
  };
}

/**
 * The wildcard needed to match a contiguous range with a single ACE, and whether one
 * ACE is actually enough. Converting a prefix to a wildcard is the easy direction; this
 * is the one people get wrong, because a wildcard can only express a block that is
 * aligned to its own size.
 */
export interface WildcardMatch {
  /** Address to write in the ACE. */
  address: string;
  wildcard: string;
  /** Prefix equivalent of the block the ACE actually matches. */
  prefix: number;
  /** True when the single ACE matches the requested range and nothing more. */
  exact: boolean;
  /** Addresses the ACE matches beyond the requested range. */
  extraAddresses: number;
}

export function wildcardForRange(firstAddress: string, lastAddress: string): WildcardMatch {
  const first = ipv4ToUint(firstAddress);
  const last = ipv4ToUint(lastAddress);
  if (last < first) throw new Error('INVALID_RANGE');

  const requested = last - first + 1;
  // Grow the block until one aligned prefix covers the whole range.
  for (let prefix = 32; prefix >= 0; prefix -= 1) {
    const mask = prefixToMask(prefix);
    const blockStart = (first & mask) >>> 0;
    const size = 2 ** (32 - prefix);
    if (blockStart + size - 1 >= last) {
      return {
        address: uintToIpv4(blockStart),
        wildcard: uintToIpv4((~mask) >>> 0),
        prefix,
        exact: blockStart === first && size === requested,
        extraAddresses: size - requested
      };
    }
  }
  throw new Error('INVALID_RANGE');
}

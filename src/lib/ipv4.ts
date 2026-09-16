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

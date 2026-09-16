export type Ipv6AddressKind =
  | 'unspecified'
  | 'loopback'
  | 'link-local'
  | 'unique-local'
  | 'global-unicast'
  | 'multicast'
  | 'documentation'
  | 'ipv4-mapped'
  | 'other';

export interface Ipv6Details {
  expanded: string;
  compressed: string;
  hextets: string[];
  kind: Ipv6AddressKind;
  prefix?: number;
}

function parsePrefix(input: string): { address: string; prefix?: number } {
  const parts = input.trim().split('/');
  if (parts.length > 2 || !parts[0]) throw new Error('INVALID_IPV6');
  if (parts.length === 1) return { address: parts[0] };
  if (!/^\d{1,3}$/.test(parts[1])) throw new Error('INVALID_IPV6_PREFIX');
  const prefix = Number(parts[1]);
  if (prefix < 0 || prefix > 128) throw new Error('INVALID_IPV6_PREFIX');
  return { address: parts[0], prefix };
}

export function expandIpv6(input: string): string[] {
  const { address } = parsePrefix(input.toLowerCase().split('%')[0]);
  if (address.includes('.')) throw new Error('IPV4_EMBEDDED_NOT_SUPPORTED');
  if ((address.match(/::/g) ?? []).length > 1) throw new Error('INVALID_IPV6');

  const compressed = address.includes('::');
  const [leftPart, rightPart = ''] = address.split('::');
  const left = leftPart ? leftPart.split(':') : [];
  const right = rightPart ? rightPart.split(':') : [];
  const validHextet = /^[0-9a-f]{1,4}$/;
  if (![...left, ...right].every(hextet => validHextet.test(hextet))) throw new Error('INVALID_IPV6');

  if (!compressed && left.length !== 8) throw new Error('INVALID_IPV6');
  const missing = 8 - left.length - right.length;
  if (compressed && missing < 1) throw new Error('INVALID_IPV6');

  return [...left, ...Array.from({ length: Math.max(0, missing) }, () => '0'), ...right]
    .map(hextet => hextet.padStart(4, '0'));
}

export function compressIpv6(hextets: string[]): string {
  if (hextets.length !== 8) throw new Error('INVALID_IPV6');
  const normalized = hextets.map(hextet => Number.parseInt(hextet, 16).toString(16));
  let bestStart = -1;
  let bestLength = 0;
  let currentStart = -1;

  for (let index = 0; index <= normalized.length; index += 1) {
    if (index < normalized.length && normalized[index] === '0') {
      if (currentStart === -1) currentStart = index;
    } else if (currentStart !== -1) {
      const length = index - currentStart;
      if (length > bestLength && length >= 2) {
        bestStart = currentStart;
        bestLength = length;
      }
      currentStart = -1;
    }
  }

  if (bestStart === -1) return normalized.join(':');
  const before = normalized.slice(0, bestStart).join(':');
  const after = normalized.slice(bestStart + bestLength).join(':');
  return `${before}::${after}`;
}

export function classifyIpv6(hextets: string[]): Ipv6AddressKind {
  const values = hextets.map(hextet => Number.parseInt(hextet, 16));
  const allZero = values.every(value => value === 0);
  if (allZero) return 'unspecified';
  if (values.slice(0, 7).every(value => value === 0) && values[7] === 1) return 'loopback';
  if (values.slice(0, 5).every(value => value === 0) && values[5] === 0xffff) return 'ipv4-mapped';
  if (values[0] === 0x2001 && values[1] === 0x0db8) return 'documentation';
  if ((values[0] & 0xff00) === 0xff00) return 'multicast';
  if ((values[0] & 0xffc0) === 0xfe80) return 'link-local';
  if ((values[0] & 0xfe00) === 0xfc00) return 'unique-local';
  if ((values[0] & 0xe000) === 0x2000) return 'global-unicast';
  return 'other';
}

export function inspectIpv6(input: string): Ipv6Details {
  const parsed = parsePrefix(input);
  const hextets = expandIpv6(input);
  return {
    expanded: hextets.join(':'),
    compressed: compressIpv6(hextets),
    hextets,
    kind: classifyIpv6(hextets),
    prefix: parsed.prefix
  };
}

export function macToModifiedEui64(mac: string): string {
  const octets = mac.trim().split(/[:-]/);
  if (octets.length !== 6 || !octets.every(octet => /^[0-9a-fA-F]{2}$/.test(octet))) {
    throw new Error('INVALID_MAC');
  }
  const bytes = octets.map(octet => Number.parseInt(octet, 16));
  bytes[0] ^= 0x02;
  const eui = [...bytes.slice(0, 3), 0xff, 0xfe, ...bytes.slice(3)];
  return Array.from({ length: 4 }, (_, index) =>
    `${eui[index * 2].toString(16).padStart(2, '0')}${eui[index * 2 + 1].toString(16).padStart(2, '0')}`
  ).join(':');
}

import type { Language } from '../types';

export const HEADER_SPECIFICATIONS = {
  ethernet: {
    headerBytes: 14,
    fcsBytes: 4,
    vlanTagBytes: 4,
    minimumFrameBytes: 64,
    maximumFrameBytes: 1518,
    maximumTaggedFrameBytes: 1522,
    mtuBytes: 1500,
  },
  ipv4: {
    minimumHeaderBytes: 20,
    maximumHeaderBytes: 60,
  },
  ipv6: {
    fixedHeaderBytes: 40,
  },
  tcp: {
    minimumHeaderBytes: 20,
    maximumHeaderBytes: 60,
  },
  udp: {
    headerBytes: 8,
  },
  typicalMss: {
    ipv4Bytes: 1460,
    ipv6Bytes: 1440,
  },
  initialTtlSystemDefaults: [64, 128, 255],
} as const;

export interface HeaderSpecificationFact {
  id: string;
  label: string;
  value: string;
}

const bytes = (value: number) => `${value} B`;
const byteRange = (minimum: number, maximum: number) => `${minimum}–${maximum} B`;

export function headerSpecificationFacts(
  layer: number,
  language: Language,
): readonly HeaderSpecificationFact[] {
  const labels = {
    it: {
      ethernetHeader: 'Header Ethernet II',
      fcs: 'FCS',
      vlanTag: 'Tag 802.1Q',
      frame: 'Frame Ethernet',
      taggedFrame: 'Frame con tag',
      mtu: 'MTU Ethernet',
      ipv4Header: 'Header IPv4',
      ipv6Header: 'Header IPv6 fisso',
      ttlDefaults: 'TTL iniziali (default di sistema)',
      tcpHeader: 'Header TCP',
      udpHeader: 'Header UDP',
      ipv4Mss: 'MSS tipico IPv4',
      ipv6Mss: 'MSS tipico IPv6',
    },
    en: {
      ethernetHeader: 'Ethernet II header',
      fcs: 'FCS',
      vlanTag: '802.1Q tag',
      frame: 'Ethernet frame',
      taggedFrame: 'Tagged frame',
      mtu: 'Ethernet MTU',
      ipv4Header: 'IPv4 header',
      ipv6Header: 'Fixed IPv6 header',
      ttlDefaults: 'Initial TTLs (system defaults)',
      tcpHeader: 'TCP header',
      udpHeader: 'UDP header',
      ipv4Mss: 'Typical IPv4 MSS',
      ipv6Mss: 'Typical IPv6 MSS',
    },
  }[language];

  if (layer === 2) {
    return [
      { id: 'ethernet-header', label: labels.ethernetHeader, value: bytes(HEADER_SPECIFICATIONS.ethernet.headerBytes) },
      { id: 'ethernet-fcs', label: labels.fcs, value: bytes(HEADER_SPECIFICATIONS.ethernet.fcsBytes) },
      { id: 'vlan-tag', label: labels.vlanTag, value: bytes(HEADER_SPECIFICATIONS.ethernet.vlanTagBytes) },
      {
        id: 'ethernet-frame',
        label: labels.frame,
        value: byteRange(HEADER_SPECIFICATIONS.ethernet.minimumFrameBytes, HEADER_SPECIFICATIONS.ethernet.maximumFrameBytes),
      },
      { id: 'tagged-frame', label: labels.taggedFrame, value: bytes(HEADER_SPECIFICATIONS.ethernet.maximumTaggedFrameBytes) },
      { id: 'ethernet-mtu', label: labels.mtu, value: bytes(HEADER_SPECIFICATIONS.ethernet.mtuBytes) },
    ];
  }

  if (layer === 3) {
    return [
      {
        id: 'ipv4-header',
        label: labels.ipv4Header,
        value: byteRange(HEADER_SPECIFICATIONS.ipv4.minimumHeaderBytes, HEADER_SPECIFICATIONS.ipv4.maximumHeaderBytes),
      },
      { id: 'ipv6-header', label: labels.ipv6Header, value: bytes(HEADER_SPECIFICATIONS.ipv6.fixedHeaderBytes) },
      {
        id: 'ttl-defaults',
        label: labels.ttlDefaults,
        value: HEADER_SPECIFICATIONS.initialTtlSystemDefaults.join(' / '),
      },
    ];
  }

  if (layer === 4) {
    return [
      {
        id: 'tcp-header',
        label: labels.tcpHeader,
        value: byteRange(HEADER_SPECIFICATIONS.tcp.minimumHeaderBytes, HEADER_SPECIFICATIONS.tcp.maximumHeaderBytes),
      },
      { id: 'udp-header', label: labels.udpHeader, value: bytes(HEADER_SPECIFICATIONS.udp.headerBytes) },
      { id: 'ipv4-mss', label: labels.ipv4Mss, value: bytes(HEADER_SPECIFICATIONS.typicalMss.ipv4Bytes) },
      { id: 'ipv6-mss', label: labels.ipv6Mss, value: bytes(HEADER_SPECIFICATIONS.typicalMss.ipv6Bytes) },
    ];
  }

  return [];
}

export function headerSpecificationSignature(layer: number, language: Language): string {
  return headerSpecificationFacts(layer, language)
    .map(({ label, value }) => `${label}: ${value}`)
    .join(' · ');
}

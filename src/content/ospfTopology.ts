import type { Bilingual } from '../types';
import type { OspfRouterNode, OspfTopologyLink } from '../lib/ospfTopology';

/**
 * The single-area OSPF topology the SPF lab runs on.
 *
 * Five routers, chosen so that the two questions worth asking both have a visible
 * answer: R1 reaches R4 over two paths that tie at the default reference bandwidth
 * (equal-cost multipath), and one of those two paths is ten times faster than the
 * other — a difference the 100 Mb/s default cannot express, and that appears the moment
 * the reference bandwidth is raised.
 */

const b = (it: string, en: string): Bilingual => ({ it, en });

export const OSPF_ROUTERS: OspfRouterNode[] = [
  {
    id: 'R1', name: 'R1', routerId: '1.1.1.1',
    networks: [
      { address: '10.0.1.0', prefix: 24, cost: 1, label: b('LAN del core', 'Core LAN') },
      { address: '1.1.1.1', prefix: 32, cost: 1, label: b('Loopback, origine del Router ID', 'Loopback, source of the Router ID') }
    ]
  },
  {
    id: 'R2', name: 'R2', routerId: '2.2.2.2',
    networks: [{ address: '10.0.2.0', prefix: 24, cost: 1, label: b('LAN di distribuzione A', 'Distribution LAN A') }]
  },
  {
    id: 'R3', name: 'R3', routerId: '3.3.3.3',
    networks: [{ address: '10.0.3.0', prefix: 24, cost: 1, label: b('LAN di distribuzione B', 'Distribution LAN B') }]
  },
  {
    id: 'R4', name: 'R4', routerId: '4.4.4.4',
    networks: [{ address: '10.0.4.0', prefix: 24, cost: 1, label: b('LAN della filiale', 'Branch LAN') }]
  },
  {
    id: 'R5', name: 'R5', routerId: '5.5.5.5',
    networks: [{ address: '10.0.5.0', prefix: 24, cost: 1, label: b('LAN dietro il collegamento seriale', 'LAN behind the serial link') }]
  }
];

export const OSPF_LINKS: OspfTopologyLink[] = [
  { id: 'r1-r2', a: 'R1', b: 'R2', bandwidthMbps: 1000 },
  { id: 'r1-r3', a: 'R1', b: 'R3', bandwidthMbps: 1000 },
  { id: 'r2-r4', a: 'R2', b: 'R4', bandwidthMbps: 100 },
  { id: 'r3-r4', a: 'R3', b: 'R4', bandwidthMbps: 1000 },
  { id: 'r2-r3', a: 'R2', b: 'R3', bandwidthMbps: 10 },
  { id: 'r4-r5', a: 'R4', b: 'R5', bandwidthMbps: 1.544 }
];

export const OSPF_LINK_LABELS: Record<string, Bilingual> = {
  'r1-r2': b('Core verso distribuzione A — 1 Gb/s', 'Core to distribution A — 1 Gb/s'),
  'r1-r3': b('Core verso distribuzione B — 1 Gb/s', 'Core to distribution B — 1 Gb/s'),
  'r2-r4': b('Distribuzione A verso filiale — 100 Mb/s', 'Distribution A to branch — 100 Mb/s'),
  'r3-r4': b('Distribuzione B verso filiale — 1 Gb/s', 'Distribution B to branch — 1 Gb/s'),
  'r2-r3': b('Collegamento trasversale lento — 10 Mb/s', 'Slow cross link — 10 Mb/s'),
  'r4-r5': b('Seriale verso la sede remota — 1,544 Mb/s (T1)', 'Serial to the remote site — 1.544 Mb/s (T1)')
};

/** Reference bandwidths worth comparing, in Mb/s. */
export const OSPF_REFERENCES = [
  { value: 100, label: b('100 Mb/s — default IOS', '100 Mb/s — IOS default') },
  { value: 1000, label: b('1 000 Mb/s — adeguato a link a 1 Gb/s', '1,000 Mb/s — fits 1 Gb/s links') },
  { value: 100_000, label: b('100 000 Mb/s — adeguato a link a 100 Gb/s', '100,000 Mb/s — fits 100 Gb/s links') }
] as const;

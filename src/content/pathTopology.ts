import type { Bilingual } from '../types';

/**
 * The reference topology the path tracer walks.
 *
 * It is deliberately small and fixed: three VLANs on an access switch, a multilayer
 * switch that owns the SVIs and one ACL, an edge router doing NAT overload, and the
 * Internet. Small enough to hold in your head, rich enough that a single packet has
 * to cross a trunk, an SVI, an ACL, a routing decision and a translation.
 */

const b = (it: string, en: string): Bilingual => ({ it, en });

export interface TopoVlan {
  id: number;
  name: string;
  /** Gateway address, owned by the SVI on the multilayer switch. */
  gateway: string;
  prefix: number;
}

export interface TopoHost {
  id: string;
  name: string;
  ip: string;
  vlan: number;
  /** Where the host is plugged in. */
  device: 'sw-access' | 'sw-core';
  port: string;
  role: Bilingual;
}

export const TOPO_VLANS: TopoVlan[] = [
  { id: 10, name: 'USERS', gateway: '10.10.10.1', prefix: 24 },
  { id: 20, name: 'VOICE', gateway: '10.10.20.1', prefix: 24 },
  { id: 50, name: 'SERVERS', gateway: '10.20.50.1', prefix: 24 }
];

export const TOPO_HOSTS: TopoHost[] = [
  { id: 'pc-a', name: 'PC-A', ip: '10.10.10.42', vlan: 10, device: 'sw-access', port: 'Gi1/0/1', role: b('Workstation nella VLAN utenti', 'Workstation in the users VLAN') },
  { id: 'pc-b', name: 'PC-B', ip: '10.10.10.43', vlan: 10, device: 'sw-access', port: 'Gi1/0/2', role: b('Seconda workstation, stessa VLAN e stessa subnet di PC-A', 'Second workstation, same VLAN and subnet as PC-A') },
  { id: 'phone', name: 'PHONE', ip: '10.10.20.30', vlan: 20, device: 'sw-access', port: 'Gi1/0/5', role: b('Telefono IP nella VLAN voce', 'IP phone in the voice VLAN') },
  { id: 'server', name: 'SERVER', ip: '10.20.50.5', vlan: 50, device: 'sw-core', port: 'Gi1/0/10', role: b('Server applicativo, collegato direttamente al core', 'Application server, attached directly to the core') }
];

/** The Internet destination, outside every local subnet. */
export const TOPO_INTERNET = { id: 'internet', name: 'INTERNET', ip: '8.8.8.8' } as const;

export const TOPO_LINKS = {
  /** Access switch uplink toward the core. */
  accessTrunk: { device: 'SW-ACCESS', port: 'Gi1/0/24', nativeVlan: 99 },
  coreTrunk: { device: 'SW-CORE', port: 'Gi1/0/1', nativeVlan: 99 },
  /** Point-to-point between the multilayer switch and the edge router. */
  coreToEdge: { network: '192.0.2.0', prefix: 30, coreIp: '192.0.2.1', edgeIp: '192.0.2.2' },
  /** Edge router toward the provider. */
  edgeOutside: { ip: '198.51.100.10', nextHop: '198.51.100.1', interface: 'Gi0/0' }
} as const;

/**
 * The ACL the learner can move around. It is the kind of list someone writes to
 * "allow HTTPS and ping, block Telnet" — and whose consequences only become visible
 * once you watch a packet meet it.
 */
export const TOPO_ACL_TEXT = [
  '10 deny tcp 10.10.10.0 0.0.0.255 any eq 23 log',
  '20 permit tcp 10.10.10.0 0.0.0.255 10.20.50.0 0.0.0.255 eq 443',
  '30 permit tcp 10.10.10.0 0.0.0.255 any eq 443',
  '40 permit icmp any any',
  'implicit deny ip any any'
];

export const TOPO_TRAFFIC = [
  { id: 'https', label: b('HTTPS — TCP 443', 'HTTPS — TCP 443'), protocol: 'tcp' as const, port: 443 },
  { id: 'telnet', label: b('Telnet — TCP 23', 'Telnet — TCP 23'), protocol: 'tcp' as const, port: 23 },
  { id: 'dns', label: b('DNS — TCP 53', 'DNS — TCP 53'), protocol: 'tcp' as const, port: 53 },
  { id: 'icmp', label: b('Ping — ICMP', 'Ping — ICMP'), protocol: 'icmp' as const, port: undefined }
];

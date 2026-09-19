import type { Bilingual } from '../types';
import type { StpLink, StpSwitch } from '../lib/stp';

/**
 * The topology the spanning tree lab converges.
 *
 * Two distribution switches, two access switches, and a cross link between the access
 * pair: the smallest arrangement that contains three loops at once, so blocking is not
 * a single obvious port. The priorities are the ones a real design uses — DSW1 made
 * root for the odd VLAN, DSW2 for the even one — which is what makes the two trees
 * differ and the uplinks share the load.
 */

const b = (it: string, en: string): Bilingual => ({ it, en });

export interface StpSwitchMeta extends StpSwitch {
  role: Bilingual;
  layer: 'distribution' | 'access';
}

export const STP_SWITCHES: StpSwitchMeta[] = [
  {
    id: 'dsw1', name: 'DSW1', mac: '0001.0000.1111', priority: 32768, vlanPriority: { 10: 24576 },
    layer: 'distribution',
    role: b('Distribuzione, root designata per la VLAN 10', 'Distribution, intended root for VLAN 10')
  },
  {
    id: 'dsw2', name: 'DSW2', mac: '0002.0000.2222', priority: 32768, vlanPriority: { 20: 24576 },
    layer: 'distribution',
    role: b('Distribuzione, root designata per la VLAN 20', 'Distribution, intended root for VLAN 20')
  },
  {
    id: 'asw1', name: 'ASW1', mac: '0003.0000.3333', priority: 32768,
    layer: 'access',
    role: b('Access switch, doppio uplink verso la distribuzione', 'Access switch, dual-homed to the distribution layer')
  },
  {
    id: 'asw2', name: 'ASW2', mac: '0004.0000.4444', priority: 32768,
    layer: 'access',
    role: b('Access switch, doppio uplink e collegamento verso ASW1', 'Access switch, dual-homed plus a link to ASW1')
  }
];

export const STP_LINKS: StpLink[] = [
  { id: 'core', from: { switchId: 'dsw1', port: 'Gi1/0/1' }, to: { switchId: 'dsw2', port: 'Gi1/0/1' }, speed: '10 Gb/s' },
  { id: 'a1-d1', from: { switchId: 'asw1', port: 'Gi1/0/24' }, to: { switchId: 'dsw1', port: 'Gi1/0/11' }, speed: '1 Gb/s' },
  { id: 'a1-d2', from: { switchId: 'asw1', port: 'Gi1/0/23' }, to: { switchId: 'dsw2', port: 'Gi1/0/11' }, speed: '1 Gb/s' },
  { id: 'a2-d1', from: { switchId: 'asw2', port: 'Gi1/0/24' }, to: { switchId: 'dsw1', port: 'Gi1/0/12' }, speed: '1 Gb/s' },
  { id: 'a2-d2', from: { switchId: 'asw2', port: 'Gi1/0/23' }, to: { switchId: 'dsw2', port: 'Gi1/0/12' }, speed: '1 Gb/s' },
  { id: 'access', from: { switchId: 'asw1', port: 'Gi1/0/1' }, to: { switchId: 'asw2', port: 'Gi1/0/1' }, speed: '100 Mb/s' }
];

/** The VLANs the lab converges; two is enough to show per-VLAN trees. */
export const STP_VLANS = [10, 20] as const;

export const STP_LINK_LABELS: Record<string, Bilingual> = {
  core: b('Collegamento tra le due distribuzioni', 'Link between the two distribution switches'),
  'a1-d1': b('Uplink primario di ASW1', 'Primary uplink of ASW1'),
  'a1-d2': b('Uplink secondario di ASW1', 'Secondary uplink of ASW1'),
  'a2-d1': b('Uplink primario di ASW2', 'Primary uplink of ASW2'),
  'a2-d2': b('Uplink secondario di ASW2', 'Secondary uplink of ASW2'),
  access: b('Collegamento diretto tra i due access switch', 'Direct link between the two access switches')
};

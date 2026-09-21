import type { Bilingual } from '../types';
import type { AclIntent } from '../lib/aclBuilder';

/**
 * The requirements an ACL gets written from, and the orders worth comparing.
 *
 * Each intent is one sentence a network owner would actually say. The presets exist to
 * make the order visible: the same set of requirements, written in two different
 * orders, produces one ACL that works and one where a line can never match.
 */

const b = (it: string, en: string): Bilingual => ({ it, en });

export const GUEST_VLAN = { kind: 'subnet' as const, address: '10.10.10.0', wildcard: '0.0.0.255' };
export const SERVER_VLAN = { kind: 'subnet' as const, address: '10.20.50.0', wildcard: '0.0.0.255' };
export const MGMT_HOSTS = { kind: 'subnet' as const, address: '10.99.0.8', wildcard: '0.0.0.3' };
export const ANYWHERE = { kind: 'any' as const };

export const ACL_INTENTS: AclIntent[] = [
  {
    id: 'deny-telnet',
    action: 'deny', protocol: 'tcp', source: GUEST_VLAN, destination: ANYWHERE, port: 23, log: true,
    description: b('Blocca Telnet dalla VLAN utenti verso qualsiasi destinazione, e registra i tentativi',
                   'Block Telnet from the users VLAN to anywhere, and log the attempts')
  },
  {
    id: 'deny-infected-host',
    action: 'deny', protocol: 'ip', source: { kind: 'host', address: '10.10.10.66' }, destination: ANYWHERE, log: true,
    description: b('Isola completamente l’host 10.10.10.66, sospetto di compromissione',
                   'Fully isolate host 10.10.10.66, suspected of being compromised')
  },
  {
    id: 'permit-mgmt-ssh',
    action: 'permit', protocol: 'tcp', source: MGMT_HOSTS, destination: ANYWHERE, port: 22,
    description: b('Consenti SSH solo dai quattro host di management 10.99.0.8/30',
                   'Allow SSH only from the four management hosts in 10.99.0.8/30')
  },
  {
    id: 'permit-https-servers',
    action: 'permit', protocol: 'tcp', source: GUEST_VLAN, destination: SERVER_VLAN, port: 443,
    description: b('Consenti HTTPS dalla VLAN utenti verso la VLAN server',
                   'Allow HTTPS from the users VLAN to the servers VLAN')
  },
  {
    id: 'permit-dns',
    action: 'permit', protocol: 'udp', source: GUEST_VLAN, destination: { kind: 'host', address: '10.20.50.53' }, port: 53,
    description: b('Consenti DNS in UDP verso il resolver interno',
                   'Allow DNS over UDP toward the internal resolver')
  },
  {
    id: 'permit-icmp',
    action: 'permit', protocol: 'icmp', source: ANYWHERE, destination: ANYWHERE,
    description: b('Consenti ICMP, per non perdere ping e traceroute nella diagnostica',
                   'Allow ICMP, so ping and traceroute survive for troubleshooting')
  },
  {
    id: 'permit-established',
    action: 'permit', protocol: 'tcp', source: ANYWHERE, destination: GUEST_VLAN, established: true,
    description: b('Consenti il traffico TCP di ritorno verso la VLAN utenti (established)',
                   'Allow returning TCP traffic toward the users VLAN (established)')
  },
  {
    id: 'permit-guests-out',
    action: 'permit', protocol: 'ip', source: GUEST_VLAN, destination: ANYWHERE,
    description: b('Consenti tutto il resto del traffico IP in uscita dalla VLAN utenti',
                   'Allow all remaining IP traffic out of the users VLAN')
  },
  {
    id: 'permit-web-any',
    action: 'permit', protocol: 'tcp', source: ANYWHERE, destination: ANYWHERE, port: 443,
    description: b('Consenti HTTPS da qualunque origine verso qualunque destinazione',
                   'Allow HTTPS from anywhere to anywhere')
  }
];

export interface AclPreset {
  id: string;
  title: Bilingual;
  lesson: Bilingual;
  /** Intent ids, in the order the ACL is written. */
  order: string[];
  interfaceName: string;
  direction: 'in' | 'out';
}

export const ACL_PRESETS: AclPreset[] = [
  {
    id: 'correct',
    title: b('Policy scritta nell’ordine giusto', 'Policy written in the right order'),
    lesson: b(
      'Dal più specifico al più generale: prima l’host isolato, poi il blocco di Telnet, poi i permessi mirati, e solo alla fine il permit generico. Ogni riga può ancora corrispondere a del traffico.',
      'Most specific first: the isolated host, then the Telnet block, then the targeted permits, and only at the end the general permit. Every line can still match traffic.'
    ),
    order: ['deny-infected-host', 'deny-telnet', 'permit-mgmt-ssh', 'permit-https-servers', 'permit-dns', 'permit-icmp', 'permit-guests-out'],
    interfaceName: 'Vlan10', direction: 'in'
  },
  {
    id: 'shadowed',
    title: b('Il permit generico messo in cima', 'The general permit placed on top'),
    lesson: b(
      'Stessi requisiti, un solo spostamento: il permit generico dalla VLAN utenti è in prima posizione. Da quel momento il blocco di Telnet e l’isolamento dell’host non verranno mai raggiunti, e i loro contatori resteranno a zero — la ACL sembra configurata e non blocca nulla.',
      'The same requirements, one move: the general permit from the users VLAN sits first. From that point the Telnet block and the host isolation are never reached, and their counters stay at zero — the ACL looks configured and blocks nothing.'
    ),
    order: ['permit-guests-out', 'deny-telnet', 'deny-infected-host', 'permit-https-servers', 'permit-icmp'],
    interfaceName: 'Vlan10', direction: 'in'
  },
  {
    id: 'redundant',
    title: b('Una riga ridondante', 'A redundant line'),
    lesson: b(
      'Il permit HTTPS da qualunque origine copre già quello dalla sola VLAN utenti, e prende la stessa decisione. Non è un problema di sicurezza, ma è una riga che non conterà mai un pacchetto: chi legge la ACL crede che serva.',
      'The HTTPS permit from anywhere already covers the one from the users VLAN alone, and takes the same decision. It is not a security problem, but it is a line that will never count a packet: whoever reads the ACL believes it matters.'
    ),
    order: ['permit-web-any', 'permit-https-servers', 'permit-icmp'],
    interfaceName: 'Vlan10', direction: 'in'
  },
  {
    id: 'deny-only',
    title: b('Solo deny: il deny implicito fa il resto', 'Deny only: the implicit deny does the rest'),
    lesson: b(
      'Una ACL composta solo da deny non lascia passare niente: il deny implicito finale scarta tutto ciò che nessuna riga permette. È l’errore che blocca un’intera VLAN con due righe apparentemente innocue.',
      'An ACL made only of deny lines lets nothing through: the final implicit deny drops everything no line permits. It is the mistake that takes an entire VLAN down with two apparently harmless lines.'
    ),
    order: ['deny-infected-host', 'deny-telnet'],
    interfaceName: 'Vlan10', direction: 'in'
  }
];

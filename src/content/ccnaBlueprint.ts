/**
 * @license
 * SPDX-License-Identifier: GPL-3.0-only
 */

import type { AppView } from '../store';
import type { Bilingual } from '../types';

export interface CcnaBlueprintTopic {
  id: string;
  title: Bilingual;
  destinations: readonly AppView[];
}

export interface CcnaBlueprintDomain {
  number: number;
  weight: number;
  title: Bilingual;
  topics: readonly CcnaBlueprintTopic[];
}

export const CCNA_BLUEPRINT = {
  exam: '200-301',
  version: '1.1',
  reviewedOn: '2026-10-10',
  source: {
    label: 'Cisco CCNA Exam v1.1 (200-301) exam topics',
    url: 'https://learningcontent.cisco.com/documents/marketing/exam-topics/200-301-CCNA-v1.1.pdf'
  }
} as const;

const topic = (id: string, it: string, en: string, ...destinations: AppView[]): CcnaBlueprintTopic => ({
  id,
  title: { it, en },
  destinations
});

/**
 * Versioned coverage matrix for every numbered topic in Cisco's 200-301 v1.1
 * blueprint. Destinations are registry IDs rather than URLs, so route changes
 * remain type-safe and the coverage test can reject stale or missing views.
 */
export const CCNA_BLUEPRINT_DOMAINS: readonly CcnaBlueprintDomain[] = [
  {
    number: 1,
    weight: 20,
    title: { it: 'Fondamenti di rete', en: 'Network Fundamentals' },
    topics: [
      topic('1.1', 'Ruolo e funzione dei componenti di rete', 'Role and function of network components', 'fundamentals', 'ports'),
      topic('1.2', 'Caratteristiche delle architetture di topologia', 'Characteristics of network topology architectures', 'fundamentals', 'pathtrace'),
      topic('1.3', 'Interfacce fisiche e tipi di cablaggio', 'Physical interface and cabling types', 'fundamentals', 'ports'),
      topic('1.4', 'Problemi di interfaccia e cablaggio', 'Interface and cable issues', 'fundamentals'),
      topic('1.5', 'Confronto tra TCP e UDP', 'Compare TCP and UDP', 'fundamentals', 'ports'),
      topic('1.6', 'Indirizzamento e subnetting IPv4', 'IPv4 addressing and subnetting', 'fundamentals'),
      topic('1.7', 'Indirizzamento IPv4 privato', 'Private IPv4 addressing', 'fundamentals'),
      topic('1.8', 'Indirizzamento e prefissi IPv6', 'IPv6 addressing and prefixes', 'fundamentals', 'ipv6security'),
      topic('1.9', 'Tipi di indirizzi IPv6', 'IPv6 address types', 'ipv6security', 'fundamentals'),
      topic('1.10', 'Parametri IP del sistema operativo client', 'Client operating-system IP parameters', 'fundamentals'),
      topic('1.11', 'Principi wireless', 'Wireless principles', 'access', 'wirelesssecurity'),
      topic('1.12', 'Fondamenti di virtualizzazione', 'Virtualization fundamentals', 'fundamentals'),
      topic('1.13', 'Concetti di switching', 'Switching concepts', 'access', 'layer2security')
    ]
  },
  {
    number: 2,
    weight: 20,
    title: { it: 'Accesso alla rete', en: 'Network Access' },
    topics: [
      topic('2.1', 'VLAN su più switch', 'VLANs spanning multiple switches', 'access', 'layer2security'),
      topic('2.2', 'Connettività tra switch', 'Interswitch connectivity', 'access', 'layer2security'),
      topic('2.3', 'Protocolli di scoperta Layer 2', 'Layer 2 discovery protocols', 'access'),
      topic('2.4', 'EtherChannel con LACP', 'EtherChannel with LACP', 'access'),
      topic('2.5', 'Funzionamento di Rapid PVST+', 'Rapid PVST+ operation', 'access', 'layer2security'),
      topic('2.6', 'Architetture wireless e modalità AP', 'Wireless architectures and AP modes', 'access', 'wirelesssecurity'),
      topic('2.7', 'Connessioni fisiche WLAN', 'WLAN physical connections', 'access', 'wirelesssecurity'),
      topic('2.8', 'Metodi di accesso alla gestione', 'Management access methods', 'access', 'managementsecurity'),
      topic('2.9', 'Configurazione WLAN tramite GUI', 'WLAN configuration through a GUI', 'access', 'wirelesssecurity')
    ]
  },
  {
    number: 3,
    weight: 25,
    title: { it: 'Connettività IP', en: 'IP Connectivity' },
    topics: [
      topic('3.1', 'Componenti della tabella di routing', 'Routing table components', 'routing'),
      topic('3.2', 'Decisione di inoltro predefinita del router', 'Default router forwarding decision', 'routing', 'pathtrace'),
      topic('3.3', 'Routing statico IPv4 e IPv6', 'IPv4 and IPv6 static routing', 'routing'),
      topic('3.4', 'OSPFv2 ad area singola', 'Single-area OSPFv2', 'routing', 'routingsecurity'),
      topic('3.5', 'Protocolli di ridondanza del primo hop', 'First-hop redundancy protocols', 'routing', 'availability')
    ]
  },
  {
    number: 4,
    weight: 10,
    title: { it: 'Servizi IP', en: 'IP Services' },
    topics: [
      topic('4.1', 'NAT sorgente', 'Source NAT', 'services', 'pathtrace'),
      topic('4.2', 'Ruolo di NTP', 'Role of NTP', 'services', 'managementsecurity'),
      topic('4.3', 'Ruoli di DHCP e DNS', 'Roles of DHCP and DNS', 'services'),
      topic('4.4', 'Funzione di SNMP', 'Function of SNMP', 'services', 'managementsecurity'),
      topic('4.5', 'Funzionalità di syslog', 'Syslog features', 'services', 'detection'),
      topic('4.6', 'Client e relay DHCP', 'DHCP client and relay', 'services'),
      topic('4.7', 'Comportamenti QoS per hop', 'QoS per-hop behaviors', 'services', 'availability'),
      topic('4.8', 'Accesso remoto tramite SSH', 'Remote access using SSH', 'services', 'managementsecurity'),
      topic('4.9', 'Funzioni di TFTP e FTP', 'TFTP and FTP capabilities', 'services')
    ]
  },
  {
    number: 5,
    weight: 15,
    title: { it: 'Fondamenti di sicurezza', en: 'Security Fundamentals' },
    topics: [
      topic('5.1', 'Concetti fondamentali di sicurezza', 'Key security concepts', 'securitycore', 'coverage'),
      topic('5.2', 'Programmi di sicurezza', 'Security programs', 'securitycore', 'hardening'),
      topic('5.3', 'Controllo dell’accesso ai dispositivi con password locali', 'Device access control with local passwords', 'securitycore', 'identitytrust'),
      topic('5.4', 'Elementi delle policy password e alternative', 'Password policy elements and alternatives', 'securitycore', 'identitytrust'),
      topic('5.5', 'VPN IPsec site-to-site e ad accesso remoto', 'Site-to-site and remote-access IPsec VPNs', 'securitycore', 'vpnsecurity'),
      topic('5.6', 'Liste di controllo accessi', 'Access control lists', 'securitycore', 'inspection'),
      topic('5.7', 'Funzioni di sicurezza Layer 2', 'Layer 2 security features', 'layer2security', 'securitycore'),
      topic('5.8', 'Concetti AAA', 'AAA concepts', 'identitytrust', 'securitycore'),
      topic('5.9', 'Protocolli di sicurezza wireless', 'Wireless security protocols', 'wirelesssecurity', 'securitycore'),
      topic('5.10', 'WLAN con WPA2 PSK tramite GUI', 'WLAN with WPA2 PSK using a GUI', 'wirelesssecurity', 'access')
    ]
  },
  {
    number: 6,
    weight: 10,
    title: { it: 'Automazione e programmabilità', en: 'Automation and Programmability' },
    topics: [
      topic('6.1', 'Impatto dell’automazione sulla gestione di rete', 'Impact of automation on network management', 'automation'),
      topic('6.2', 'Reti tradizionali e controller-based', 'Traditional and controller-based networking', 'automation'),
      topic('6.3', 'Architetture software-defined', 'Software-defined architectures', 'automation'),
      topic('6.4', 'AI generativa, predittiva e machine learning nelle operazioni', 'Generative AI, predictive AI, and machine learning in operations', 'automation'),
      topic('6.5', 'Caratteristiche delle API REST', 'REST API characteristics', 'automation'),
      topic('6.6', 'Configuration management con Ansible e Terraform', 'Configuration management with Ansible and Terraform', 'automation'),
      topic('6.7', 'Componenti dei dati JSON', 'JSON data components', 'automation')
    ]
  }
];

export const CCNA_BLUEPRINT_TOPICS = CCNA_BLUEPRINT_DOMAINS.flatMap(domain => domain.topics);

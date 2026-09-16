import type { Bilingual } from '../types';

export interface CcnaDomain {
  id: string;
  number: number;
  weight: number;
  title: Bilingual;
  purpose: Bilingual;
  objectiveIds: string[];
  topics: Bilingual[];
  securityLinks: Bilingual[];
}

/**
 * CCNA 200-301 v1.1 curriculum map. Italian is the editorial source;
 * English uses the standard terminology used in Cisco documentation.
 */
export const CCNA_DOMAINS: CcnaDomain[] = [
  {
    id: 'network-fundamentals',
    number: 1,
    weight: 20,
    title: { it: 'Fondamenti di rete', en: 'Network Fundamentals' },
    purpose: {
      it: 'Comprendere componenti, topologie, mezzi trasmissivi, indirizzamento, TCP/UDP, wireless, virtualizzazione e switching.',
      en: 'Understand components, topologies, media, addressing, TCP/UDP, wireless, virtualization, and switching.'
    },
    objectiveIds: ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9', '1.10', '1.11', '1.12', '1.13'],
    topics: [
      { it: 'Dispositivi, topologie e infrastrutture', en: 'Devices, topologies, and infrastructure' },
      { it: 'Cablaggio, interfacce ed errori fisici', en: 'Cabling, interfaces, and physical faults' },
      { it: 'IPv4, subnetting e IPv6', en: 'IPv4, subnetting, and IPv6' },
      { it: 'TCP, UDP e principi wireless', en: 'TCP, UDP, and wireless principles' },
      { it: 'Virtualizzazione, VRF e switching', en: 'Virtualization, VRFs, and switching' }
    ],
    securityLinks: [
      { it: 'Spoofing, sniffing, jamming e rogue device', en: 'Spoofing, sniffing, jamming, and rogue devices' },
      { it: 'uRPF, RA Guard, NAC e hardening fisico', en: 'uRPF, RA Guard, NAC, and physical hardening' }
    ]
  },
  {
    id: 'network-access',
    number: 2,
    weight: 20,
    title: { it: 'Accesso alla rete', en: 'Network Access' },
    purpose: {
      it: 'Configurare e verificare switching, VLAN, trunk, EtherChannel, STP, wireless e accesso amministrativo.',
      en: 'Configure and verify switching, VLANs, trunks, EtherChannel, STP, wireless, and management access.'
    },
    objectiveIds: ['2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8', '2.9'],
    topics: [
      { it: 'VLAN, trunk 802.1Q e inter-VLAN routing', en: 'VLANs, 802.1Q trunks, and inter-VLAN routing' },
      { it: 'CDP, LLDP ed EtherChannel LACP', en: 'CDP, LLDP, and LACP EtherChannel' },
      { it: 'Rapid PVST+ e protezioni STP', en: 'Rapid PVST+ and STP protections' },
      { it: 'Architetture wireless, AP e WLC', en: 'Wireless architectures, APs, and WLCs' }
    ],
    securityLinks: [
      { it: 'VLAN hopping, MAC flooding, ARP poisoning e attacchi STP', en: 'VLAN hopping, MAC flooding, ARP poisoning, and STP attacks' },
      { it: 'Port security, DHCP snooping, DAI, 802.1X e WPA2/WPA3', en: 'Port security, DHCP snooping, DAI, 802.1X, and WPA2/WPA3' }
    ]
  },
  {
    id: 'ip-connectivity',
    number: 3,
    weight: 25,
    title: { it: 'Connettività IP', en: 'IP Connectivity' },
    purpose: {
      it: 'Interpretare le tabelle di routing e configurare rotte statiche e OSPFv2 single-area.',
      en: 'Interpret routing tables and configure static routes and single-area OSPFv2.'
    },
    objectiveIds: ['3.1', '3.2', '3.3', '3.4', '3.5'],
    topics: [
      { it: 'Routing table e longest prefix match', en: 'Routing tables and longest prefix match' },
      { it: 'Rotte statiche IPv4 e IPv6', en: 'IPv4 and IPv6 static routes' },
      { it: 'OSPFv2, adiacenze, DR/BDR e router ID', en: 'OSPFv2, adjacencies, DR/BDR, and router ID' },
      { it: 'First-hop redundancy', en: 'First-hop redundancy' }
    ],
    securityLinks: [
      { it: 'Route injection, OSPF spoofing, BGP hijacking e control-plane DoS', en: 'Route injection, OSPF spoofing, BGP hijacking, and control-plane DoS' },
      { it: 'Prefix filtering, CoPP, autenticazione e RPKI', en: 'Prefix filtering, CoPP, authentication, and RPKI' }
    ]
  },
  {
    id: 'ip-services',
    number: 4,
    weight: 10,
    title: { it: 'Servizi IP', en: 'IP Services' },
    purpose: {
      it: 'Configurare e comprendere NAT, NTP, DHCP, DNS, SNMP, syslog, QoS, SSH e trasferimento file.',
      en: 'Configure and understand NAT, NTP, DHCP, DNS, SNMP, syslog, QoS, SSH, and file transfer.'
    },
    objectiveIds: ['4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7', '4.8', '4.9'],
    topics: [
      { it: 'NAT, DHCP e DHCP relay', en: 'NAT, DHCP, and DHCP relay' },
      { it: 'DNS, NTP, SNMP e syslog', en: 'DNS, NTP, SNMP, and syslog' },
      { it: 'QoS per-hop behavior', en: 'QoS per-hop behavior' },
      { it: 'SSH, TFTP e FTP', en: 'SSH, TFTP, and FTP' }
    ],
    securityLinks: [
      { it: 'DNS poisoning, DHCP starvation, amplification e credential sniffing', en: 'DNS poisoning, DHCP starvation, amplification, and credential sniffing' },
      { it: 'DNSSEC, SNMPv3 authPriv, logging protetto e SSH hardening', en: 'DNSSEC, SNMPv3 authPriv, protected logging, and SSH hardening' }
    ]
  },
  {
    id: 'security-fundamentals',
    number: 5,
    weight: 15,
    title: { it: 'Fondamenti di sicurezza', en: 'Security Fundamentals' },
    purpose: {
      it: 'Applicare controllo degli accessi, hardening, VPN, ACL, sicurezza Layer 2, AAA e sicurezza wireless.',
      en: 'Apply access control, hardening, VPNs, ACLs, Layer 2 security, AAA, and wireless security.'
    },
    objectiveIds: ['5.1', '5.2', '5.3', '5.4', '5.5', '5.6', '5.7', '5.8', '5.9', '5.10'],
    topics: [
      { it: 'Minacce, vulnerabilità, exploit e mitigazioni', en: 'Threats, vulnerabilities, exploits, and mitigations' },
      { it: 'Hardening, password, MFA e certificati', en: 'Hardening, passwords, MFA, and certificates' },
      { it: 'VPN IPsec e ACL', en: 'IPsec VPNs and ACLs' },
      { it: 'Sicurezza Layer 2, AAA e WLAN', en: 'Layer 2 security, AAA, and WLAN security' }
    ],
    securityLinks: [
      { it: 'Attacchi al data, control e management plane', en: 'Data-plane, control-plane, and management-plane attacks' },
      { it: 'Difese preventive, detective, correttive e compensative', en: 'Preventive, detective, corrective, and compensating controls' }
    ]
  },
  {
    id: 'automation-programmability',
    number: 6,
    weight: 10,
    title: { it: 'Automazione e programmabilità', en: 'Automation and Programmability' },
    purpose: {
      it: 'Comprendere reti controller-based, SDN, API REST, JSON, configuration management e AI nelle operazioni di rete.',
      en: 'Understand controller-based networking, SDN, REST APIs, JSON, configuration management, and AI in network operations.'
    },
    objectiveIds: ['6.1', '6.2', '6.3', '6.4', '6.5', '6.6', '6.7'],
    topics: [
      { it: 'Reti tradizionali e controller-based', en: 'Traditional and controller-based networks' },
      { it: 'Underlay, overlay, fabric e API', en: 'Underlay, overlay, fabric, and APIs' },
      { it: 'REST, CRUD e JSON', en: 'REST, CRUD, and JSON' },
      { it: 'Ansible, Terraform e AI/ML', en: 'Ansible, Terraform, and AI/ML' }
    ],
    securityLinks: [
      { it: 'API abuse, token theft, secret exposure e configuration drift', en: 'API abuse, token theft, secret exposure, and configuration drift' },
      { it: 'RBAC, secret management, audit trail e rollback', en: 'RBAC, secret management, audit trails, and rollback' }
    ]
  }
];

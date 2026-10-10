/**
 * @license
 * SPDX-License-Identifier: GPL-3.0-only
 */

import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import {
  Activity, BookOpen, Cable, Calculator, FileCode2, FileSearch, Fingerprint, Gauge,
  GitBranch, GlobeLock, Hash, HeartPulse, KeyRound, Laptop, Layers, Layers3, LockKeyhole, Map,
  MailWarning, Network, Radar, Radio, Route, Router, ServerCog, Shield, ShieldAlert,
  Split, Swords, Workflow, type LucideIcon
} from 'lucide-react';
import type { AppView } from '../store';
import { importWithRetry } from '../lib/lazyWithRetry';

/**
 * The single, typed registry of every view the app can render.
 *
 * Before ENG-06 the same list of views was repeated four times, each with its own
 * slice of the truth: the `AppView` union in the store, the `NAV_GROUPS` editorial
 * data, the `VIEW_ICONS` map in the navigation component, and one `activeView === …`
 * branch per view in `App.tsx`. Adding a view meant editing four files in lockstep,
 * and nothing failed loudly when one was forgotten.
 *
 * This registry is now the one place that knows, for each view, which group it belongs
 * to, which icon represents it, how to lazy-load it, how it animates in, whether it is
 * rendered inline, and its bilingual labels, hints and search keywords. Everything else
 * — the navigation menu, the quick search, the icons and the main render switch — is
 * derived from here. The `satisfies Record<AppView, ViewDefinition>` annotation makes
 * the compiler reject a registry that is missing a view or declares one that is not in
 * the `AppView` union, so the set of views stays provably in sync with the store type.
 */

/** The props every registered view may receive. Only the embeddable modals read `inline`. */
export type ViewProps = { inline?: boolean };

/** Entrance/exit animation presets, resolved to concrete values in `App.tsx`. */
export type MotionPreset = 'subtle' | 'pronounced';

/** The navigation groups, in menu order. */
export type ViewGroupId = 'ccna' | 'interactive' | 'domains' | 'operations';

export interface ViewGroupMeta {
  id: ViewGroupId;
  it: string;
  en: string;
  itShort: string;
  enShort: string;
}

/** Group display metadata and the order groups appear in the navigation bar. */
export const VIEW_GROUPS: readonly ViewGroupMeta[] = [
  { id: 'ccna', it: 'Percorso CCNA', en: 'CCNA path', itShort: 'CCNA', enShort: 'CCNA' },
  { id: 'interactive', it: 'Laboratori interattivi', en: 'Interactive labs', itShort: 'Interattivi', enShort: 'Interactive' },
  { id: 'domains', it: 'Sicurezza per area', en: 'Security by area', itShort: 'Per area', enShort: 'By area' },
  { id: 'operations', it: 'Operazioni e difesa', en: 'Operations and defense', itShort: 'Operazioni', enShort: 'Operations' }
];

export interface ViewDefinition {
  /** The navigation group this view belongs to. */
  group: ViewGroupId;
  /** Icon shown in the navigation menus and quick search. */
  icon: LucideIcon;
  /** Lazy-loaded component rendered in the main area. */
  component: LazyExoticComponent<ComponentType<ViewProps>>;
  /** Render the view inline (full-page embed of an otherwise modal view). */
  inline?: boolean;
  /** Which entrance/exit animation to use; defaults to `subtle`. */
  motion?: MotionPreset;
  it: string;
  en: string;
  /** One line explaining what the view is for, shown under the label. */
  hintIt: string;
  hintEn: string;
  /** Extra terms the quick search should match, beyond label and hint. */
  keywords: string;
}

/**
 * Wrap a dynamic import as a lazily-loaded view. Pinning the component type to
 * {@link ViewProps} here keeps every entry's `component` field the same type, so the
 * registry stays a homogeneous `Record` the render switch can index without casts.
 */
function view(loader: () => Promise<{ default: ComponentType<ViewProps> }>): LazyExoticComponent<ComponentType<ViewProps>> {
  // `importWithRetry` absorbs transient chunk-fetch failures (a dropped connection, a
  // chunk still propagating after a deploy) before React.lazy caches the result. A
  // failure that survives the retries surfaces to the ChunkErrorBoundary (ENG-09).
  return lazy(() => importWithRetry(loader));
}

export const VIEW_REGISTRY: Record<AppView, ViewDefinition> = {
  // --- CCNA path --------------------------------------------------------------
  curriculum: {
    group: 'ccna',
    icon: Map,
    component: view(() => import('../components/CurriculumView')),
    it: 'Mappa CCNA',
    en: 'CCNA map',
    hintIt: 'I sei domini ufficiali con pesi, obiettivi e collegamenti.',
    hintEn: 'The six official domains with weights, objectives, and links.',
    keywords: '200-301 domini domains percorso syllabus blueprint obiettivi'
  },
  fundamentals: {
    group: 'ccna',
    icon: Calculator,
    component: view(() => import('../components/NetworkFundamentalsLab')),
    it: 'Fondamenti di rete',
    en: 'Network fundamentals',
    hintIt: 'IPv4 e subnetting, IPv6, TCP/UDP, switching, virtualizzazione, parametri IP del client.',
    hintEn: 'IPv4 and subnetting, IPv6, TCP/UDP, switching, virtualization, client IP parameters.',
    keywords: 'subnet mask wildcard cidr binario eui-64 slaac mtu duplex collisione broadcast container vrf ipconfig vlsm pianificatore planner frammentazione fragmentation df pmtud mss adjust-mss gre tunnel overhead 1500 1476 802.1q baby giant'
  },
  access: {
    group: 'ccna',
    icon: Cable,
    component: view(() => import('../components/NetworkAccessLab')),
    it: 'Accesso alla rete',
    en: 'Network access',
    hintIt: 'VLAN, trunk 802.1Q, STP/RSTP, EtherChannel, principi wireless e GUI del WLC.',
    hintEn: 'VLANs, 802.1Q trunks, STP/RSTP, EtherChannel, wireless principles, and the WLC GUI.',
    keywords: 'vlan trunk native stp rstp bpdu portfast lacp pagp etherchannel wlc capwap ssid csma cam table mac address-table flooding filtering aging learning unknown unicast port-security sticky violation protect restrict shutdown err-disable psecure bridge id discarding pvst'
  },
  routing: {
    group: 'ccna',
    icon: Route,
    component: view(() => import('../components/IpConnectivityLab')),
    it: 'Connettività IP',
    en: 'IP connectivity',
    hintIt: 'Lettura di show ip route, longest prefix match, OSPFv2, DR/BDR e first-hop redundancy.',
    hintEn: 'Reading show ip route, longest prefix match, OSPFv2, DR/BDR, and first-hop redundancy.',
    keywords: 'routing table rotte statiche floating ospf costo router-id dr bdr hsrp vrrp fhrp rib fib cef spf dijkstra shortest path ecmp maximum-paths reference-bandwidth auto-cost area lsa riconvergenza'
  },
  services: {
    group: 'ccna',
    icon: ServerCog,
    component: view(() => import('../components/IpServicesLab')),
    it: 'Servizi IP',
    en: 'IP services',
    hintIt: 'DHCP e relay, DNS, NAT/PAT, NTP, SNMPv3, Syslog, QoS e SSH.',
    hintEn: 'DHCP and relay, DNS, NAT/PAT, NTP, SNMPv3, Syslog, QoS, and SSH.',
    keywords: 'dhcp dora discover offer request ack nak relay helper-address giaddr option 82 snooping trusted lease t1 t2 apipa 169.254 dns nat pat overload ntp stratum snmp syslog severity qos dscp ssh tftp'
  },
  securitycore: {
    group: 'ccna',
    icon: LockKeyhole,
    component: view(() => import('../components/SecurityFundamentalsLab')),
    it: 'Sicurezza CCNA',
    en: 'Security fundamentals',
    hintIt: 'ACL IPv4, AAA, VPN e IPsec, firewall e IDS/IPS, PKI, da WEP a WPA3.',
    hintEn: 'IPv4 ACLs, AAA, VPNs and IPsec, firewalls and IDS/IPS, PKI, WEP through WPA3.',
    keywords: 'acl standard extended established first match implicit deny shadowing riga morta ordine sequenza access-group access-list wildcard aaa tacacs radius ipsec ikev2 pki crl ocsp wpa2 psk wpa3 sae mfa'
  },
  automation: {
    group: 'ccna',
    icon: Workflow,
    component: view(() => import('../components/AutomationLab')),
    it: 'Automazione',
    en: 'Automation',
    hintIt: 'Reti controller-based, underlay e overlay, REST e CRUD, JSON, Ansible e Terraform.',
    hintEn: 'Controller-based networking, underlay and overlay, REST and CRUD, JSON, Ansible, and Terraform.',
    keywords: 'sdn controller northbound southbound netconf restconf yang rest crud json idempotenza ansible terraform ai'
  },

  // --- Interactive labs -------------------------------------------------------
  pathtrace: {
    group: 'interactive',
    icon: Split,
    component: view(() => import('../components/PathTraceLab')),
    it: 'Tracciatore di percorso',
    en: 'Path tracer',
    hintIt: 'Segui un pacchetto su una topologia reale: host, trunk, SVI, ACL, routing e NAT, in andata e in ritorno.',
    hintEn: 'Follow a packet across a real topology: host, trunk, SVI, ACL, routing, and NAT, forward and return.',
    keywords: 'percorso path trace pacchetto hop gateway svi acl nat ritorno asimmetria troubleshooting end-to-end'
  },
  osi: {
    group: 'interactive',
    icon: Layers,
    component: view(() => import('../components/OsiLabView')),
    it: 'Pila OSI',
    en: 'OSI stack',
    hintIt: 'Simulazione passo-passo di incapsulamento e decapsulamento, con ispettore dei pacchetti.',
    hintEn: 'Step-by-step encapsulation and decapsulation simulation, with a packet inspector.',
    keywords: 'sette livelli layer incapsulamento encapsulation pdu header simulazione pacchetto http dns bgp'
  },
  attacklab: {
    group: 'interactive',
    icon: Swords,
    component: view(() => import('../components/AttackLab')),
    motion: 'pronounced',
    it: 'Attacco & Difesa',
    en: 'Attack & defense',
    hintIt: 'Circa 25 attacchi sui sette livelli come kill chain, con il punto esatto in cui la difesa interviene.',
    hintEn: 'About 25 attacks across the seven layers as kill chains, with the exact point where the defense intervenes.',
    keywords: 'kill chain arp poisoning mac flooding syn flood spoofing xss sql injection mitm scenario'
  },
  ports: {
    group: 'interactive',
    icon: Hash,
    component: view(() => import('../components/PortsExplorer')),
    inline: true,
    motion: 'pronounced',
    it: 'Porte & Protocolli',
    en: 'Ports & protocols',
    hintIt: 'Registro delle porte IANA, protocolli e apparati di rete con le loro caratteristiche di sicurezza.',
    hintEn: 'IANA port registry, protocols, and network devices with their security characteristics.',
    keywords: 'porte ports iana well-known registered tcp udp router switch firewall bridge hub gateway nids'
  },
  security: {
    group: 'interactive',
    icon: Shield,
    component: view(() => import('../components/SecurityDashboard')),
    motion: 'pronounced',
    it: 'IDS e IPS',
    en: 'IDS and IPS',
    hintIt: 'Apparati difensivi NIDS, NIPS, HIDS, HIPS, WIDS, WIPS ed EDR: rilevare rispetto a bloccare.',
    hintEn: 'NIDS, NIPS, HIDS, HIPS, WIDS, WIPS, and EDR defensive devices: detecting versus blocking.',
    keywords: 'ids ips nids nips hids hips wids wips edr inline out-of-band firme signature'
  },
  glossary: {
    group: 'interactive',
    icon: BookOpen,
    component: view(() => import('../components/GlossaryModal')),
    inline: true,
    motion: 'pronounced',
    it: 'Glossario',
    en: 'Glossary',
    hintIt: 'Dizionario ricercabile di termini di rete e sicurezza, con trappole d’esame e mnemonici.',
    hintEn: 'Searchable dictionary of networking and security terms, with exam traps and mnemonics.',
    keywords: 'glossario glossary dizionario definizioni termini sigle acronimi'
  },

  // --- Security by area -------------------------------------------------------
  layer2security: {
    group: 'domains',
    icon: Cable,
    component: view(() => import('../components/Layer2SecurityLab')),
    it: 'Layer 2 e first hop',
    en: 'Layer 2 and first hop',
    hintIt: 'Porta fisica, CAM e Port Security, trunk, DHCP Snooping, DAI e protezioni STP.',
    hintEn: 'Physical port, CAM and Port Security, trunks, DHCP Snooping, DAI, and STP protections.',
    keywords: 'port security cam dhcp snooping dai ip source guard bpdu guard root guard native vlan'
  },
  wirelesssecurity: {
    group: 'domains',
    icon: Radio,
    component: view(() => import('../components/WirelessSecurityLab')),
    it: 'Wireless e RF',
    en: 'Wireless and RF',
    hintIt: 'Interferenza e jamming, rogue AP, evil twin, PMF, WPA2 e WPA3, trust del WLC.',
    hintEn: 'Interference and jamming, rogue APs, evil twin, PMF, WPA2 and WPA3, WLC trust.',
    keywords: 'wifi rf jamming rogue evil twin pmf 802.11w wpa3 capwap guest deautenticazione'
  },
  routingsecurity: {
    group: 'domains',
    icon: Router,
    component: view(() => import('../components/RoutingSecurityLab')),
    it: 'Routing e control plane',
    en: 'Routing and control plane',
    hintIt: 'Fiducia OSPF, redistribuzione, BGP e RPKI, FHRP, uRPF, CoPP, coerenza RIB e FIB.',
    hintEn: 'OSPF trust, redistribution, BGP and RPKI, FHRP, uRPF, CoPP, RIB and FIB consistency.',
    keywords: 'ospf autenticazione bgp hijacking rpki urpf copp control plane redistribuzione fhrp'
  },
  ipv6security: {
    group: 'domains',
    icon: Network,
    component: view(() => import('../components/Ipv6SecurityLab')),
    it: 'IPv6 e dual-stack',
    en: 'IPv6 and dual-stack',
    hintIt: 'RA e DHCPv6 rogue, Neighbor Cache, ICMPv6 e PMTUD, extension header, tunnel di transizione.',
    hintEn: 'Rogue RA and DHCPv6, Neighbor Cache, ICMPv6 and PMTUD, extension headers, transition tunnels.',
    keywords: 'ipv6 ra guard nd slaac dhcpv6 neighbor icmpv6 pmtud extension header tunnel dual stack'
  },
  segmentation: {
    group: 'domains',
    icon: Layers3,
    component: view(() => import('../components/SegmentationLab')),
    it: 'Segmentazione',
    en: 'Segmentation',
    hintIt: 'Percorso reale del traffico tra VLAN, SVI, ACL, VRF, overlay e servizi condivisi.',
    hintEn: 'The real traffic path across VLANs, SVIs, ACLs, VRFs, overlays, and shared services.',
    keywords: 'segmentazione zone confini trust boundary vlan svi acl vrf east-west guest iot overlay'
  },
  identitytrust: {
    group: 'domains',
    icon: Fingerprint,
    component: view(() => import('../components/IdentityTrustLab')),
    it: 'Identità e AAA',
    en: 'Identity and AAA',
    hintIt: 'TACACS+, RADIUS con 802.1X ed EAP-TLS, MAB, fallback AAA, PKI, revoca delle sessioni.',
    hintEn: 'TACACS+, RADIUS with 802.1X and EAP-TLS, MAB, AAA fallback, PKI, session revocation.',
    keywords: 'identita aaa tacacs radius 802.1x eap-tls mab fallback privilegi revoca lifecycle'
  },
  vpnsecurity: {
    group: 'domains',
    icon: KeyRound,
    component: view(() => import('../components/VpnPkiSecurityLab')),
    it: 'VPN, IPsec e PKI',
    en: 'VPN, IPsec, and PKI',
    hintIt: 'Negoziazione IKEv2, CHILD_SA, autenticazione del peer, NAT-T, rekey e revoca dei certificati.',
    hintEn: 'IKEv2 negotiation, CHILD_SAs, peer authentication, NAT-T, rekeying, and certificate revocation.',
    keywords: 'vpn ipsec ike ikev2 esp ah child sa spi nat-t traffic selector rekey pki certificati'
  },
  inspection: {
    group: 'domains',
    icon: ShieldAlert,
    component: view(() => import('../components/InspectionSecurityLab')),
    it: 'Firewall e ispezione',
    en: 'Firewall and inspection',
    hintIt: 'Policy ordinata, flussi stateful e asimmetrici, IDS rispetto a IPS inline, traffico cifrato.',
    hintEn: 'Ordered policy, stateful and asymmetric flows, IDS versus inline IPS, encrypted traffic.',
    keywords: 'firewall stateful ispezione ids ips inline firme tls evasione ha logging policy'
  },
  managementsecurity: {
    group: 'domains',
    icon: ServerCog,
    component: view(() => import('../components/ManagementTelemetryLab')),
    it: 'Management e telemetria',
    en: 'Management and telemetry',
    hintIt: 'Out-of-band e management VRF, SSH e AAA, SNMPv3, Syslog remoto, backup protetti.',
    hintEn: 'Out-of-band and management VRF, SSH and AAA, SNMPv3, remote Syslog, protected backups.',
    keywords: 'management oob vrf ssh snmpv3 syslog ntp netconf restconf cdp lldp backup collector'
  },
  endpointsecurity: {
    group: 'domains',
    icon: Laptop,
    component: view(() => import('../components/EndpointSecurityLab')),
    it: 'Endpoint e postura',
    en: 'Endpoint and posture',
    hintIt: 'Inventario, baseline, patching basato sul rischio, EDR, host firewall, NAC continuo.',
    hintEn: 'Inventory, baselines, risk-based patching, EDR, host firewall, continuous NAC.',
    keywords: 'endpoint postura inventario baseline patch edr host firewall application control nac isolamento'
  },
  applicationsecurity: {
    group: 'domains',
    icon: GlobeLock,
    component: view(() => import('../components/ApplicationSecurityLab')),
    it: 'DNS, web e applicazioni',
    en: 'DNS, web, and applications',
    hintIt: 'Risoluzione e delega DNS, rebinding, tunneling e DoH, identità TLS, injection, API.',
    hintEn: 'DNS resolution and delegation, rebinding, tunneling and DoH, TLS identity, injection, APIs.',
    keywords: 'dns dnssec doh rebinding tunneling tls http proxy injection sessione api autorizzazione'
  },
  emailsecurity: {
    group: 'domains',
    icon: MailWarning,
    component: view(() => import('../components/EmailHumanSecurityLab')),
    it: 'Email e phishing',
    en: 'Email and phishing',
    hintIt: 'SPF, DKIM e DMARC, domini lookalike, phishing adversary-in-the-middle, BEC, consenso OAuth.',
    hintEn: 'SPF, DKIM, and DMARC, lookalike domains, adversary-in-the-middle phishing, BEC, OAuth consent.',
    keywords: 'email phishing spf dkim dmarc lookalike allegati qr bec oauth human layer utente'
  },

  // --- Operations and defense -------------------------------------------------
  coverage: {
    group: 'operations',
    icon: Activity,
    component: view(() => import('../components/SecurityCoverageView')),
    it: 'Catalogo Attacco–Difesa',
    en: 'Attack–defense catalog',
    hintIt: 'Catalogo trasversale ricercabile: ogni tecnica con prevenzione, rilevamento, risposta e verifica.',
    hintEn: 'Searchable cross-domain catalog: every technique with prevention, detection, response, and verification.',
    keywords: 'catalogo copertura matrice tecniche famiglie piani playbook coverage'
  },
  attackpaths: {
    group: 'operations',
    icon: GitBranch,
    component: view(() => import('../components/AttackPathsLab')),
    it: 'Percorsi d’attacco',
    en: 'Attack paths',
    hintIt: 'Percorsi multi-fase da ricognizione a impatto, con segnali osservabili e validazione.',
    hintEn: 'Multi-stage paths from reconnaissance to impact, with observable signals and validation.',
    keywords: 'percorsi attack path ricognizione accesso propagazione impatto segnali validazione'
  },
  detection: {
    group: 'operations',
    icon: Radar,
    component: view(() => import('../components/DetectionEngineeringLab')),
    it: 'Detection engineering',
    en: 'Detection engineering',
    hintIt: 'Telemetria, logica comportamentale, correlazione, cause legittime alternative e prima risposta.',
    hintEn: 'Telemetry, behavioral logic, correlation, legitimate alternative causes, and first response.',
    keywords: 'detection telemetria correlazione alert falsi positivi baseline siem validazione'
  },
  hardening: {
    group: 'operations',
    icon: FileCode2,
    component: view(() => import('../components/ConfigurationHardeningLab')),
    it: 'Hardening delle config',
    en: 'Configuration hardening',
    hintIt: 'Confronti affiancati tra configurazioni IOS/IOS XE deboli e pattern più sicuri.',
    hintEn: 'Side-by-side comparisons of weak versus safer IOS/IOS XE configuration patterns.',
    keywords: 'hardening configurazione ios baseline insicuro sicuro rollback show change'
  },
  availability: {
    group: 'operations',
    icon: Gauge,
    component: view(() => import('../components/AvailabilitySecurityLab')),
    it: 'Disponibilità e DoS',
    en: 'Availability and DoS',
    hintIt: 'Quale risorsa si esaurisce davvero: banda, packet rate, CPU, backlog, CAM, stato, code.',
    hintEn: 'Which resource is actually exhausted: bandwidth, packet rate, CPU, backlog, CAM, state, queues.',
    keywords: 'disponibilita dos ddos saturazione capacita backlog syn reflection amplification coda qos'
  },
  recovery: {
    group: 'operations',
    icon: HeartPulse,
    component: view(() => import('../components/ResilienceRecoveryLab')),
    it: 'Resilienza e ripristino',
    en: 'Resilience and recovery',
    hintIt: 'Servizio minimo, ordine di ripristino delle dipendenze e prova indipendente del recupero.',
    hintEn: 'Minimum service, dependency restoration order, and independent proof of recovery.',
    keywords: 'resilienza recovery ripristino continuita dipendenze rto ransomware validazione rischio residuo'
  },
  evidence: {
    group: 'operations',
    icon: FileSearch,
    component: view(() => import('../components/SecurityEvidenceLab')),
    it: 'Evidenze operative',
    en: 'Operational evidence',
    hintIt: 'Output IOS, log e audit annotati: separa osservazione, interpretazione e limiti dell’artefatto.',
    hintEn: 'Annotated IOS output, logs, and audits: separating observation, interpretation, and artifact limits.',
    keywords: 'evidenze evidence log output show audit interpretazione correlazione artefatto'
  },
  defense: {
    group: 'operations',
    icon: Shield,
    component: view(() => import('../components/DefenseControlsLab')),
    it: 'Controlli difensivi',
    en: 'Defensive controls',
    hintIt: 'Catalogo defense-in-depth: funzione, enforcement, dipendenze, verifica e limite operativo.',
    hintEn: 'Defense-in-depth catalog: function, enforcement, dependencies, verification, and operational limit.',
    keywords: 'controlli difese preventivo detective correttivo compensativo defense in depth enforcement'
  }
} satisfies Record<AppView, ViewDefinition>;

/** Every view id, in menu order (the registry's declaration order). */
export const VIEW_ORDER = Object.keys(VIEW_REGISTRY) as AppView[];

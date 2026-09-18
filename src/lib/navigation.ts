import type { AppView } from '../store';

/**
 * Navigation model for the lab.
 *
 * There are more than thirty views: listing them all at once is not navigable, so
 * they are grouped by what the learner is trying to do, and every entry carries a
 * one-line hint plus search keywords. The data lives here, away from the component,
 * so the structure can be unit-tested (every view reachable, exactly once).
 */
export interface NavEntry {
  view: AppView;
  it: string;
  en: string;
  /** One line explaining what the view is for, shown under the label. */
  hintIt: string;
  hintEn: string;
  /** Extra terms the quick search should match, beyond label and hint. */
  keywords: string;
}

export interface NavGroup {
  id: string;
  it: string;
  en: string;
  itShort: string;
  enShort: string;
  entries: NavEntry[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'ccna',
    it: 'Percorso CCNA',
    en: 'CCNA path',
    itShort: 'CCNA',
    enShort: 'CCNA',
    entries: [
      {
        view: 'curriculum',
        it: 'Mappa CCNA',
        en: 'CCNA map',
        hintIt: 'I sei domini ufficiali con pesi, obiettivi e collegamenti.',
        hintEn: 'The six official domains with weights, objectives, and links.',
        keywords: '200-301 domini domains percorso syllabus blueprint obiettivi'
      },
      {
        view: 'fundamentals',
        it: 'Fondamenti di rete',
        en: 'Network fundamentals',
        hintIt: 'IPv4 e subnetting, IPv6, TCP/UDP, switching, virtualizzazione, parametri IP del client.',
        hintEn: 'IPv4 and subnetting, IPv6, TCP/UDP, switching, virtualization, client IP parameters.',
        keywords: 'subnet mask wildcard cidr binario eui-64 slaac mtu duplex collisione broadcast container vrf ipconfig'
      },
      {
        view: 'access',
        it: 'Accesso alla rete',
        en: 'Network access',
        hintIt: 'VLAN, trunk 802.1Q, STP/RSTP, EtherChannel, principi wireless e GUI del WLC.',
        hintEn: 'VLANs, 802.1Q trunks, STP/RSTP, EtherChannel, wireless principles, and the WLC GUI.',
        keywords: 'vlan trunk native stp rstp bpdu portfast lacp pagp etherchannel wlc capwap ssid csma'
      },
      {
        view: 'routing',
        it: 'Connettività IP',
        en: 'IP connectivity',
        hintIt: 'Lettura di show ip route, longest prefix match, OSPFv2, DR/BDR e first-hop redundancy.',
        hintEn: 'Reading show ip route, longest prefix match, OSPFv2, DR/BDR, and first-hop redundancy.',
        keywords: 'routing table rotte statiche floating ospf costo router-id dr bdr hsrp vrrp fhrp rib fib cef'
      },
      {
        view: 'services',
        it: 'Servizi IP',
        en: 'IP services',
        hintIt: 'DHCP e relay, DNS, NAT/PAT, NTP, SNMPv3, Syslog, QoS e SSH.',
        hintEn: 'DHCP and relay, DNS, NAT/PAT, NTP, SNMPv3, Syslog, QoS, and SSH.',
        keywords: 'dhcp dora relay giaddr dns nat pat overload ntp stratum snmp syslog severity qos dscp ssh tftp'
      },
      {
        view: 'securitycore',
        it: 'Sicurezza CCNA',
        en: 'Security fundamentals',
        hintIt: 'ACL IPv4, AAA, VPN e IPsec, firewall e IDS/IPS, PKI, da WEP a WPA3.',
        hintEn: 'IPv4 ACLs, AAA, VPNs and IPsec, firewalls and IDS/IPS, PKI, WEP through WPA3.',
        keywords: 'acl standard extended established aaa tacacs radius ipsec ikev2 pki crl ocsp wpa2 psk wpa3 sae mfa'
      },
      {
        view: 'automation',
        it: 'Automazione',
        en: 'Automation',
        hintIt: 'Reti controller-based, underlay e overlay, REST e CRUD, JSON, Ansible e Terraform.',
        hintEn: 'Controller-based networking, underlay and overlay, REST and CRUD, JSON, Ansible, and Terraform.',
        keywords: 'sdn controller northbound southbound netconf restconf yang rest crud json idempotenza ansible terraform ai'
      }
    ]
  },
  {
    id: 'interactive',
    it: 'Laboratori interattivi',
    en: 'Interactive labs',
    itShort: 'Interattivi',
    enShort: 'Interactive',
    entries: [
      {
        view: 'osi',
        it: 'Pila OSI',
        en: 'OSI stack',
        hintIt: 'Simulazione passo-passo di incapsulamento e decapsulamento, con ispettore dei pacchetti.',
        hintEn: 'Step-by-step encapsulation and decapsulation simulation, with a packet inspector.',
        keywords: 'sette livelli layer incapsulamento encapsulation pdu header simulazione pacchetto http dns bgp'
      },
      {
        view: 'attacklab',
        it: 'Attacco & Difesa',
        en: 'Attack & defense',
        hintIt: 'Circa 25 attacchi sui sette livelli come kill chain, con il punto esatto in cui la difesa interviene.',
        hintEn: 'About 25 attacks across the seven layers as kill chains, with the exact point where the defense intervenes.',
        keywords: 'kill chain arp poisoning mac flooding syn flood spoofing xss sql injection mitm scenario'
      },
      {
        view: 'ports',
        it: 'Porte & Protocolli',
        en: 'Ports & protocols',
        hintIt: 'Registro delle porte IANA, protocolli e apparati di rete con le loro caratteristiche di sicurezza.',
        hintEn: 'IANA port registry, protocols, and network devices with their security characteristics.',
        keywords: 'porte ports iana well-known registered tcp udp router switch firewall bridge hub gateway nids'
      },
      {
        view: 'security',
        it: 'IDS e IPS',
        en: 'IDS and IPS',
        hintIt: 'Apparati difensivi NIDS, NIPS, HIDS, HIPS, WIDS, WIPS ed EDR: rilevare rispetto a bloccare.',
        hintEn: 'NIDS, NIPS, HIDS, HIPS, WIDS, WIPS, and EDR defensive devices: detecting versus blocking.',
        keywords: 'ids ips nids nips hids hips wids wips edr inline out-of-band firme signature'
      },
      {
        view: 'glossary',
        it: 'Glossario',
        en: 'Glossary',
        hintIt: 'Dizionario ricercabile di termini di rete e sicurezza, con trappole d’esame e mnemonici.',
        hintEn: 'Searchable dictionary of networking and security terms, with exam traps and mnemonics.',
        keywords: 'glossario glossary dizionario definizioni termini sigle acronimi'
      }
    ]
  },
  {
    id: 'domains',
    it: 'Sicurezza per area',
    en: 'Security by area',
    itShort: 'Per area',
    enShort: 'By area',
    entries: [
      {
        view: 'layer2security',
        it: 'Layer 2 e first hop',
        en: 'Layer 2 and first hop',
        hintIt: 'Porta fisica, CAM e Port Security, trunk, DHCP Snooping, DAI e protezioni STP.',
        hintEn: 'Physical port, CAM and Port Security, trunks, DHCP Snooping, DAI, and STP protections.',
        keywords: 'port security cam dhcp snooping dai ip source guard bpdu guard root guard native vlan'
      },
      {
        view: 'wirelesssecurity',
        it: 'Wireless e RF',
        en: 'Wireless and RF',
        hintIt: 'Interferenza e jamming, rogue AP, evil twin, PMF, WPA2 e WPA3, trust del WLC.',
        hintEn: 'Interference and jamming, rogue APs, evil twin, PMF, WPA2 and WPA3, WLC trust.',
        keywords: 'wifi rf jamming rogue evil twin pmf 802.11w wpa3 capwap guest deautenticazione'
      },
      {
        view: 'routingsecurity',
        it: 'Routing e control plane',
        en: 'Routing and control plane',
        hintIt: 'Fiducia OSPF, redistribuzione, BGP e RPKI, FHRP, uRPF, CoPP, coerenza RIB e FIB.',
        hintEn: 'OSPF trust, redistribution, BGP and RPKI, FHRP, uRPF, CoPP, RIB and FIB consistency.',
        keywords: 'ospf autenticazione bgp hijacking rpki urpf copp control plane redistribuzione fhrp'
      },
      {
        view: 'ipv6security',
        it: 'IPv6 e dual-stack',
        en: 'IPv6 and dual-stack',
        hintIt: 'RA e DHCPv6 rogue, Neighbor Cache, ICMPv6 e PMTUD, extension header, tunnel di transizione.',
        hintEn: 'Rogue RA and DHCPv6, Neighbor Cache, ICMPv6 and PMTUD, extension headers, transition tunnels.',
        keywords: 'ipv6 ra guard nd slaac dhcpv6 neighbor icmpv6 pmtud extension header tunnel dual stack'
      },
      {
        view: 'segmentation',
        it: 'Segmentazione',
        en: 'Segmentation',
        hintIt: 'Percorso reale del traffico tra VLAN, SVI, ACL, VRF, overlay e servizi condivisi.',
        hintEn: 'The real traffic path across VLANs, SVIs, ACLs, VRFs, overlays, and shared services.',
        keywords: 'segmentazione zone confini trust boundary vlan svi acl vrf east-west guest iot overlay'
      },
      {
        view: 'identitytrust',
        it: 'Identità e AAA',
        en: 'Identity and AAA',
        hintIt: 'TACACS+, RADIUS con 802.1X ed EAP-TLS, MAB, fallback AAA, PKI, revoca delle sessioni.',
        hintEn: 'TACACS+, RADIUS with 802.1X and EAP-TLS, MAB, AAA fallback, PKI, session revocation.',
        keywords: 'identita aaa tacacs radius 802.1x eap-tls mab fallback privilegi revoca lifecycle'
      },
      {
        view: 'vpnsecurity',
        it: 'VPN, IPsec e PKI',
        en: 'VPN, IPsec, and PKI',
        hintIt: 'Negoziazione IKEv2, CHILD_SA, autenticazione del peer, NAT-T, rekey e revoca dei certificati.',
        hintEn: 'IKEv2 negotiation, CHILD_SAs, peer authentication, NAT-T, rekeying, and certificate revocation.',
        keywords: 'vpn ipsec ike ikev2 esp ah child sa spi nat-t traffic selector rekey pki certificati'
      },
      {
        view: 'inspection',
        it: 'Firewall e ispezione',
        en: 'Firewall and inspection',
        hintIt: 'Policy ordinata, flussi stateful e asimmetrici, IDS rispetto a IPS inline, traffico cifrato.',
        hintEn: 'Ordered policy, stateful and asymmetric flows, IDS versus inline IPS, encrypted traffic.',
        keywords: 'firewall stateful ispezione ids ips inline firme tls evasione ha logging policy'
      },
      {
        view: 'managementsecurity',
        it: 'Management e telemetria',
        en: 'Management and telemetry',
        hintIt: 'Out-of-band e management VRF, SSH e AAA, SNMPv3, Syslog remoto, backup protetti.',
        hintEn: 'Out-of-band and management VRF, SSH and AAA, SNMPv3, remote Syslog, protected backups.',
        keywords: 'management oob vrf ssh snmpv3 syslog ntp netconf restconf cdp lldp backup collector'
      },
      {
        view: 'endpointsecurity',
        it: 'Endpoint e postura',
        en: 'Endpoint and posture',
        hintIt: 'Inventario, baseline, patching basato sul rischio, EDR, host firewall, NAC continuo.',
        hintEn: 'Inventory, baselines, risk-based patching, EDR, host firewall, continuous NAC.',
        keywords: 'endpoint postura inventario baseline patch edr host firewall application control nac isolamento'
      },
      {
        view: 'applicationsecurity',
        it: 'DNS, web e applicazioni',
        en: 'DNS, web, and applications',
        hintIt: 'Risoluzione e delega DNS, rebinding, tunneling e DoH, identità TLS, injection, API.',
        hintEn: 'DNS resolution and delegation, rebinding, tunneling and DoH, TLS identity, injection, APIs.',
        keywords: 'dns dnssec doh rebinding tunneling tls http proxy injection sessione api autorizzazione'
      },
      {
        view: 'emailsecurity',
        it: 'Email e phishing',
        en: 'Email and phishing',
        hintIt: 'SPF, DKIM e DMARC, domini lookalike, phishing adversary-in-the-middle, BEC, consenso OAuth.',
        hintEn: 'SPF, DKIM, and DMARC, lookalike domains, adversary-in-the-middle phishing, BEC, OAuth consent.',
        keywords: 'email phishing spf dkim dmarc lookalike allegati qr bec oauth human layer utente'
      }
    ]
  },
  {
    id: 'operations',
    it: 'Operazioni e difesa',
    en: 'Operations and defense',
    itShort: 'Operazioni',
    enShort: 'Operations',
    entries: [
      {
        view: 'coverage',
        it: 'Catalogo Attacco–Difesa',
        en: 'Attack–defense catalog',
        hintIt: 'Catalogo trasversale ricercabile: ogni tecnica con prevenzione, rilevamento, risposta e verifica.',
        hintEn: 'Searchable cross-domain catalog: every technique with prevention, detection, response, and verification.',
        keywords: 'catalogo copertura matrice tecniche famiglie piani playbook coverage'
      },
      {
        view: 'attackpaths',
        it: 'Percorsi d’attacco',
        en: 'Attack paths',
        hintIt: 'Percorsi multi-fase da ricognizione a impatto, con segnali osservabili e validazione.',
        hintEn: 'Multi-stage paths from reconnaissance to impact, with observable signals and validation.',
        keywords: 'percorsi attack path ricognizione accesso propagazione impatto segnali validazione'
      },
      {
        view: 'detection',
        it: 'Detection engineering',
        en: 'Detection engineering',
        hintIt: 'Telemetria, logica comportamentale, correlazione, cause legittime alternative e prima risposta.',
        hintEn: 'Telemetry, behavioral logic, correlation, legitimate alternative causes, and first response.',
        keywords: 'detection telemetria correlazione alert falsi positivi baseline siem validazione'
      },
      {
        view: 'hardening',
        it: 'Hardening delle config',
        en: 'Configuration hardening',
        hintIt: 'Confronti affiancati tra configurazioni IOS/IOS XE deboli e pattern più sicuri.',
        hintEn: 'Side-by-side comparisons of weak versus safer IOS/IOS XE configuration patterns.',
        keywords: 'hardening configurazione ios baseline insicuro sicuro rollback show change'
      },
      {
        view: 'availability',
        it: 'Disponibilità e DoS',
        en: 'Availability and DoS',
        hintIt: 'Quale risorsa si esaurisce davvero: banda, packet rate, CPU, backlog, CAM, stato, code.',
        hintEn: 'Which resource is actually exhausted: bandwidth, packet rate, CPU, backlog, CAM, state, queues.',
        keywords: 'disponibilita dos ddos saturazione capacita backlog syn reflection amplification coda qos'
      },
      {
        view: 'recovery',
        it: 'Resilienza e ripristino',
        en: 'Resilience and recovery',
        hintIt: 'Servizio minimo, ordine di ripristino delle dipendenze e prova indipendente del recupero.',
        hintEn: 'Minimum service, dependency restoration order, and independent proof of recovery.',
        keywords: 'resilienza recovery ripristino continuita dipendenze rto ransomware validazione rischio residuo'
      },
      {
        view: 'evidence',
        it: 'Evidenze operative',
        en: 'Operational evidence',
        hintIt: 'Output IOS, log e audit annotati: separa osservazione, interpretazione e limiti dell’artefatto.',
        hintEn: 'Annotated IOS output, logs, and audits: separating observation, interpretation, and artifact limits.',
        keywords: 'evidenze evidence log output show audit interpretazione correlazione artefatto'
      },
      {
        view: 'defense',
        it: 'Controlli difensivi',
        en: 'Defensive controls',
        hintIt: 'Catalogo defense-in-depth: funzione, enforcement, dipendenze, verifica e limite operativo.',
        hintEn: 'Defense-in-depth catalog: function, enforcement, dependencies, verification, and operational limit.',
        keywords: 'controlli difese preventivo detective correttivo compensativo defense in depth enforcement'
      }
    ]
  }
];

/** Every entry, flattened, in menu order. */
export const NAV_ENTRIES: ReadonlyArray<{ group: NavGroup; entry: NavEntry }> = NAV_GROUPS.flatMap(group =>
  group.entries.map(entry => ({ group, entry }))
);

/** The group a view belongs to, used to highlight the menu and build the breadcrumb. */
export function navGroupOf(view: AppView): NavGroup | undefined {
  return NAV_GROUPS.find(group => group.entries.some(entry => entry.view === view));
}

export function navEntryOf(view: AppView): NavEntry | undefined {
  return NAV_ENTRIES.find(item => item.entry.view === view)?.entry;
}

/** Lowercases and strips accents so "identità" is found by typing "identita". */
function normalize(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/**
 * Quick search across every view. All whitespace-separated terms must match
 * somewhere in the label, the hint, or the keywords, so "wpa dns" narrows instead
 * of widening. An empty query returns everything, in menu order.
 */
export function searchNav(query: string, language: 'it' | 'en'): ReadonlyArray<{ group: NavGroup; entry: NavEntry }> {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return NAV_ENTRIES;

  return NAV_ENTRIES.filter(({ group, entry }) => {
    const haystack = normalize([
      entry[language],
      entry.it,
      entry.en,
      language === 'it' ? entry.hintIt : entry.hintEn,
      entry.keywords,
      group[language]
    ].join(' '));
    return terms.every(term => haystack.includes(term));
  });
}

import type { Ipv4Route, RouteSource } from '../lib/ipConnectivity';
type Language = 'it' | 'en';
type Localized = Record<Language, string>;

export const ROUTES: Ipv4Route[] = [
  { id: 'local-lan', source: 'local', network: '10.10.10.1', prefix: 32, administrativeDistance: 0, metric: 0, exitInterface: 'Gi0/1' },
  { id: 'connected-lan', source: 'connected', network: '10.10.10.0', prefix: 24, administrativeDistance: 0, metric: 0, exitInterface: 'Gi0/1' },
  { id: 'ospf-branch-a', source: 'ospf', network: '10.10.0.0', prefix: 16, administrativeDistance: 110, metric: 20, nextHop: '192.0.2.2', exitInterface: 'Gi0/0' },
  { id: 'static-campus', source: 'static', network: '10.0.0.0', prefix: 8, administrativeDistance: 1, metric: 0, nextHop: '192.0.2.6', exitInterface: 'Gi0/2' },
  { id: 'ospf-dc-a', source: 'ospf', network: '172.16.0.0', prefix: 16, administrativeDistance: 110, metric: 30, nextHop: '192.0.2.2', exitInterface: 'Gi0/0' },
  { id: 'ospf-dc-b', source: 'ospf', network: '172.16.0.0', prefix: 16, administrativeDistance: 110, metric: 30, nextHop: '192.0.2.10', exitInterface: 'Gi0/3' },
  { id: 'default', source: 'static', network: '0.0.0.0', prefix: 0, administrativeDistance: 1, metric: 0, nextHop: '198.51.100.1', exitInterface: 'Gi0/4' }
];

export const ROUTE_CODES: Record<RouteSource, string> = {
  local: 'L',
  connected: 'C',
  static: 'S',
  ospf: 'O',
  'ospf-ia': 'O IA'
};

export const OSPF_STATES: Array<{ state: string; detail: Localized }> = [
  { state: 'Down', detail: { it: 'Nessun Hello valido ricevuto durante il dead interval.', en: 'No valid Hello received within the dead interval.' } },
  { state: 'Init', detail: { it: 'È stato ricevuto un Hello, ma il router locale non compare ancora tra i neighbor.', en: 'A Hello was received, but the local router is not yet listed as a neighbor.' } },
  { state: '2-Way', detail: { it: 'Comunicazione bidirezionale; su reti multiaccess avviene l’elezione DR/BDR.', en: 'Bidirectional communication; DR/BDR election occurs on multiaccess networks.' } },
  { state: 'ExStart', detail: { it: 'I router negoziano master/slave e sequence number per lo scambio DBD.', en: 'Routers negotiate master/slave roles and sequence numbers for DBD exchange.' } },
  { state: 'Exchange', detail: { it: 'Vengono scambiati i Database Description packet.', en: 'Database Description packets are exchanged.' } },
  { state: 'Loading', detail: { it: 'LSR, LSU e LSAck sincronizzano le LSA mancanti o più recenti.', en: 'LSRs, LSUs, and LSAcks synchronize missing or newer LSAs.' } },
  { state: 'Full', detail: { it: 'Le link-state database dei due neighbor sono sincronizzate.', en: 'The neighbors’ link-state databases are synchronized.' } }
];

export const SECURITY_ROWS: Array<{ attack: Localized; effect: Localized; defense: Localized; evidence: string }> = [
  {
    attack: { it: 'Neighbor OSPF non autorizzato', en: 'Unauthorized OSPF neighbor' },
    effect: { it: 'Un router ostile forma un’adiacenza e tenta di introdurre informazioni di routing.', en: 'A hostile router forms an adjacency and attempts to introduce routing information.' },
    defense: { it: 'Autenticazione OSPF coerente su entrambi i peer, passive-interface di default e adiacenze solo sui link previsti.', en: 'Consistent OSPF authentication on both peers, passive-interface by default, and adjacencies only on intended links.' },
    evidence: 'show ip ospf neighbor detail'
  },
  {
    attack: { it: 'LSA false o route injection', en: 'Forged LSA or route injection' },
    effect: { it: 'Rotte più specifiche, default o metriche alterate deviano il traffico verso black hole o intercettazione.', en: 'More-specific routes, defaults, or altered metrics redirect traffic toward a black hole or interception point.' },
    defense: { it: 'Autenticazione protegge il dominio da dispositivi esterni; filtri e policy di redistribuzione limitano anche errori o router interni compromessi.', en: 'Authentication protects the domain from external devices; redistribution filters and policy also limit mistakes or compromised internal routers.' },
    evidence: 'show ip ospf database'
  },
  {
    attack: { it: 'Hello/LSA flooding', en: 'Hello/LSA flooding' },
    effect: { it: 'Consumo di CPU e instabilità delle adiacenze o della LSDB.', en: 'CPU exhaustion and instability of adjacencies or the LSDB.' },
    defense: { it: 'CoPP per proteggere il control plane, autenticazione, policing e monitoraggio delle variazioni LSA/neighbor.', en: 'CoPP to protect the control plane, authentication, policing, and monitoring of LSA/neighbor churn.' },
    evidence: 'show policy-map control-plane'
  },
  {
    attack: { it: 'Route hijacking più specifico', en: 'More-specific route hijacking' },
    effect: { it: 'Una rotta con prefisso più lungo vince anche contro una sorgente con distanza amministrativa migliore.', en: 'A longer-prefix route wins even against a source with a better administrative distance.' },
    defense: { it: 'Prefix filtering, summarization controllata, autenticazione del protocollo e allarmi per nuovi prefissi critici.', en: 'Prefix filtering, controlled summarization, protocol authentication, and alerts for new critical prefixes.' },
    evidence: 'show ip route <prefix>'
  },
  {
    attack: { it: 'ICMP redirect spoofing', en: 'ICMP redirect spoofing' },
    effect: { it: 'Un host può accettare un next hop malevolo sulla rete locale.', en: 'A host may accept a malicious next hop on the local network.' },
    defense: { it: 'Disabilita ICMP Redirect sulle interfacce dove non serve, applica segmentazione e protezioni di access layer.', en: 'Disable ICMP Redirects on interfaces where they are not required, and apply segmentation and access-layer protections.' },
    evidence: 'show ip interface'
  },
  {
    attack: { it: 'IP source routing', en: 'IP source routing' },
    effect: { it: 'Opzioni IPv4 consentono al mittente di influenzare il percorso e tentare di aggirare controlli.', en: 'IPv4 options allow the sender to influence the path and attempt to bypass controls.' },
    defense: { it: 'Mantieni disabilitato IP source routing e filtra pacchetti con opzioni anomale ai confini.', en: 'Keep IP source routing disabled and filter packets with abnormal options at boundaries.' },
    evidence: 'show running-config | include source-route'
  },
  {
    attack: { it: 'Spoofing dell’indirizzo sorgente', en: 'Source-address spoofing' },
    effect: { it: 'Il traffico usa indirizzi impossibili o appartenenti ad altre reti per nascondere l’origine o amplificare attacchi.', en: 'Traffic uses impossible or foreign source addresses to hide its origin or amplify attacks.' },
    defense: { it: 'uRPF dove la topologia lo consente, ACL anti-spoofing e BCP 38 agli edge; valuta i percorsi asimmetrici.', en: 'uRPF where topology permits, anti-spoofing ACLs, and BCP 38 at edges; account for asymmetric paths.' },
    evidence: 'show ip interface | include verify'
  }
];

export const ROUTE_TABLE_OUTPUT = `R1# show ip route
Codes: L - local, C - connected, S - static, R - RIP, O - OSPF,
       IA - OSPF inter area, E1/E2 - OSPF external type 1/2,
       B - BGP, D - EIGRP, EX - EIGRP external, * - candidate default

Gateway of last resort is 198.51.100.1 to network 0.0.0.0

S*    0.0.0.0/0 [1/0] via 198.51.100.1
      10.0.0.0/8 is variably subnetted, 3 subnets, 3 masks
S        10.0.0.0/8 [1/0] via 192.0.2.6
O        10.10.0.0/16 [110/20] via 192.0.2.2, 00:04:11, GigabitEthernet0/0
C        10.10.10.0/24 is directly connected, GigabitEthernet0/1
L        10.10.10.1/32 is directly connected, GigabitEthernet0/1
O IA  172.16.0.0/16 [110/30] via 192.0.2.2, 00:03:52, GigabitEthernet0/0`;

export const ROUTE_TABLE_LEGEND: Array<{ token: string; detail: Localized }> = [
  {
    token: 'Gateway of last resort',
    detail: {
      it: 'Dove finisce il traffico che non corrisponde ad alcuna rotta più specifica. Se manca, i pacchetti senza corrispondenza vengono scartati con ICMP Destination Unreachable.',
      en: 'Where traffic that matches no more-specific route ends up. If it is absent, unmatched packets are dropped with ICMP Destination Unreachable.'
    }
  },
  {
    token: 'S* 0.0.0.0/0',
    detail: {
      it: 'L’asterisco marca la rotta come candidate default. Il prefisso /0 corrisponde a tutto, quindi vince solo quando nessun prefisso più lungo corrisponde.',
      en: 'The asterisk marks the route as a candidate default. The /0 prefix matches everything, so it only wins when no longer prefix matches.'
    }
  },
  {
    token: '[110/20]',
    detail: {
      it: 'Distanza amministrativa / metrica. Il primo numero confronta sorgenti diverse per lo stesso prefisso (110 = OSPF), il secondo confronta percorsi dentro la stessa sorgente. Le rotte connected e local non lo mostrano perché hanno AD 0.',
      en: 'Administrative distance / metric. The first number compares different sources for the same prefix (110 = OSPF), the second compares paths within the same source. Connected and local routes do not show it because their AD is 0.'
    }
  },
  {
    token: 'C vs L',
    detail: {
      it: 'C è la subnet configurata sull’interfaccia, L è l’indirizzo /32 del router stesso: serve al router per riconoscere il traffico destinato a sé. Vederli entrambi è normale, non una duplicazione.',
      en: 'C is the subnet configured on the interface, L is the router’s own /32 address, which lets the router recognize traffic addressed to itself. Seeing both is normal, not a duplication.'
    }
  },
  {
    token: 'variably subnetted',
    detail: {
      it: 'La rete maggiore è divisa in subnet con maschere diverse (VLSM). La riga indica quante subnet e quante maschere distinte: è un riepilogo, non una rotta installata.',
      en: 'The major network is divided into subnets with different masks (VLSM). The line states how many subnets and how many distinct masks: it is a summary line, not an installed route.'
    }
  },
  {
    token: 'O IA · 00:03:52',
    detail: {
      it: 'IA indica una rotta OSPF appresa da un’altra area. Il timer è da quanto la rotta è nella tabella: se si azzera continuamente, la rete sta flappando.',
      en: 'IA marks an OSPF route learned from another area. The timer shows how long the route has been in the table: if it keeps resetting, the network is flapping.'
    }
  },
  {
    token: 'via · directly connected',
    detail: {
      it: 'via indica un next hop da risolvere con una ricorsione nella tabella (recursive lookup); directly connected indica che la destinazione si raggiunge sul segmento locale, senza altri salti.',
      en: 'via names a next hop that must be resolved by a recursive lookup in the table; directly connected means the destination is reached on the local segment, with no further hop.'
    }
  }
];

export const FHRP_ROWS: Array<{ property: Localized; hsrp: Localized; vrrp: Localized }> = [
  {
    property: { it: 'Standard e ruoli', en: 'Standard and roles' },
    hsrp: { it: 'Cisco; un router Active e uno Standby, gli altri restano in Listen.', en: 'Cisco; one Active router and one Standby, the others stay in Listen.' },
    vrrp: { it: 'Standard aperto (RFC 5798); un Master e uno o più Backup.', en: 'Open standard (RFC 5798); one Master and one or more Backups.' }
  },
  {
    property: { it: 'Indirizzi virtuali', en: 'Virtual addresses' },
    hsrp: { it: 'IP virtuale configurato dall’amministratore; MAC virtuale 0000.0C07.ACxx (xx = gruppo) in HSRPv1.', en: 'Administrator-configured virtual IP; virtual MAC 0000.0C07.ACxx (xx = group) in HSRPv1.' },
    vrrp: { it: 'IP virtuale che può coincidere con quello reale del Master; MAC virtuale 0000.5E00.01xx.', en: 'Virtual IP that may be the Master’s own address; virtual MAC 0000.5E00.01xx.' }
  },
  {
    property: { it: 'Elezione e subentro', en: 'Election and takeover' },
    hsrp: { it: 'Vince la priorità più alta (default 100), poi l’IP più alto; senza il comando preempt il router a priorità maggiore non subentra.', en: 'Highest priority wins (default 100), then the highest IP; without the preempt command a higher-priority router does not take over.' },
    vrrp: { it: 'Vince la priorità più alta (default 100) e il preempt è attivo per impostazione predefinita.', en: 'Highest priority wins (default 100) and preemption is enabled by default.' }
  },
  {
    property: { it: 'Distribuzione del carico', en: 'Load sharing' },
    hsrp: { it: 'Un solo gateway attivo per gruppo: si distribuisce il carico creando più gruppi e alternando l’Active per VLAN.', en: 'One active gateway per group: load is shared by creating multiple groups and alternating the Active per VLAN.' },
    vrrp: { it: 'Stesso principio con più gruppi; GLBP (Cisco) distribuisce invece il carico tra gateway nello stesso gruppo.', en: 'Same principle with multiple groups; Cisco GLBP instead shares load across gateways within one group.' }
  },
  {
    property: { it: 'Failover e verifica', en: 'Failover and verification' },
    hsrp: { it: 'Hello e hold timer rilevano la perdita del peer; l’object tracking abbassa la priorità se cade l’uplink, non solo l’interfaccia locale.', en: 'Hello and hold timers detect peer loss; object tracking lowers the priority when the uplink fails, not just the local interface.' },
    vrrp: { it: 'Advertisement periodici e master down interval; la verifica si fa su stato, priorità e ARP del client.', en: 'Periodic advertisements and a master down interval; verification covers state, priority, and the client ARP entry.' }
  }
];

export const STATIC_CONFIG: Record<Language, string> = {
  it: `ip route 0.0.0.0 0.0.0.0 198.51.100.1
ip route 10.20.0.0 255.255.0.0 192.0.2.2
! Floating static: AD 200, usata solo se la rotta migliore scompare
ip route 10.20.0.0 255.255.0.0 192.0.2.6 200
! IPv6
ipv6 route ::/0 2001:db8:0:1::1`,
  en: `ip route 0.0.0.0 0.0.0.0 198.51.100.1
ip route 10.20.0.0 255.255.0.0 192.0.2.2
! Floating static: AD 200, used only when the better route disappears
ip route 10.20.0.0 255.255.0.0 192.0.2.6 200
! IPv6
ipv6 route ::/0 2001:db8:0:1::1`
};

export const OSPF_CONFIG = `router ospf 10
 router-id 1.1.1.1
 passive-interface default
 no passive-interface GigabitEthernet0/0
 ! reference-bandwidth is expressed in Mb/s: 100000 = 100 Gb/s.
 ! It is local to the router and is NOT advertised: a different value on a
 ! neighbour makes the two run SPF on different costs, so the same value must
 ! be configured on every router of the OSPF domain.
 auto-cost reference-bandwidth 100000
!
interface GigabitEthernet0/0
 ip ospf 10 area 0
 ip ospf network point-to-point
 ip ospf authentication key-chain OSPF-AUTH`;

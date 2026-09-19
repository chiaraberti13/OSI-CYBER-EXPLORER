import type { Bilingual } from '../types';

/**
 * CCNA 200-301 v1.1 objectives 1.1, 1.2, and 1.3 — the conceptual foundation the
 * interactive labs assume but never state: what each component decides, which
 * architecture is chosen and why, and what the physical layer actually imposes.
 *
 * Every entry follows the same didactic shape: the principle first, then the
 * consequence you can observe, then the mistake to avoid.
 */

const b = (it: string, en: string): Bilingual => ({ it, en });

/** 1.1 — Role and function of network components. */
export interface NetworkComponent {
  id: string;
  name: Bilingual;
  layer: string;
  /** The single decision this device makes on every unit of traffic. */
  decision: Bilingual;
  /** The boundary it does or does not create. */
  boundary: Bilingual;
  /** What it is commonly, and wrongly, believed to do. */
  notThis: Bilingual;
}

export const NETWORK_COMPONENTS: NetworkComponent[] = [
  {
    id: 'switch',
    name: b('Switch Layer 2', 'Layer 2 switch'),
    layer: 'L2',
    decision: b('Per ogni frame confronta il MAC di destinazione con la CAM table: inoltra su una porta, filtra o fa flooding sulla VLAN.', 'For every frame it compares the destination MAC with the CAM table: forward out one port, filter, or flood within the VLAN.'),
    boundary: b('Separa i domini di collisione (una porta ciascuno) ma non separa il dominio di broadcast: quello lo separano una VLAN o un router.', 'It separates collision domains (one per port) but not the broadcast domain: a VLAN or a router does that.'),
    notThis: b('Non instrada e non filtra per indirizzo IP. Aggiungere VLAN segmenta, non protegge: senza ACL il traffico tra VLAN resta aperto appena esiste un punto di routing.', 'It does not route and does not filter on IP. Adding VLANs segments but does not protect: without ACLs, inter-VLAN traffic stays open as soon as a routing point exists.')
  },
  {
    id: 'router',
    name: b('Router', 'Router'),
    layer: 'L3',
    decision: b('Per ogni pacchetto cerca l’indirizzo di destinazione nella routing table con il longest prefix match, decrementa il TTL e riscrive gli header di livello 2.', 'For every packet it looks up the destination address in the routing table using longest prefix match, decrements the TTL, and rewrites the Layer 2 headers.'),
    boundary: b('È il confine del dominio di broadcast: non inoltra i broadcast, ed è la ragione per cui serve un relay DHCP per servire una subnet remota.', 'It is the broadcast-domain boundary: it does not forward broadcasts, which is why a DHCP relay is needed to serve a remote subnet.'),
    notThis: b('Non è un firewall: senza ACL inoltra qualunque pacchetto per cui esiste una rotta. Una rotta nella RIB non garantisce che il percorso di ritorno esista.', 'It is not a firewall: without ACLs it forwards any packet for which a route exists. A route in the RIB does not guarantee that the return path exists.')
  },
  {
    id: 'multilayer',
    name: b('Switch multilayer (Layer 3)', 'Multilayer (Layer 3) switch'),
    layer: 'L2 + L3',
    decision: b('Commuta dentro la VLAN e instrada tra VLAN tramite le SVI, con il forwarding programmato in hardware.', 'It switches inside a VLAN and routes between VLANs through SVIs, with forwarding programmed in hardware.'),
    boundary: b('Concentra nello stesso apparato il confine Layer 2 e quello Layer 3: l’SVI è il default gateway della VLAN.', 'It concentrates the Layer 2 and Layer 3 boundaries in one device: the SVI is the VLAN default gateway.'),
    notThis: b('Un’SVI attiva non implica una policy: l’inter-VLAN routing è aperto fino a quando non si applica una ACL nella direzione corretta.', 'An active SVI does not imply a policy: inter-VLAN routing is open until an ACL is applied in the correct direction.')
  },
  {
    id: 'firewall',
    name: b('Firewall e NGFW', 'Firewall and NGFW'),
    layer: 'L3-L7',
    decision: b('Classifica il flusso per zona, indirizzi, servizio e — in un NGFW — applicazione e identità, quindi applica la prima regola corrispondente e mantiene lo stato della sessione.', 'It classifies the flow by zone, addresses, service and — in an NGFW — application and identity, then applies the first matching rule and keeps session state.'),
    boundary: b('È un confine di fiducia: il traffico di ritorno passa perché esiste lo stato della sessione, non perché esiste una regola in senso inverso.', 'It is a trust boundary: return traffic passes because session state exists, not because a reverse rule exists.'),
    notThis: b('Non vede ciò che non gli passa davanti: un percorso asimmetrico o un flusso east-west dentro la stessa VLAN gli sfugge, e il traffico cifrato resta opaco senza ispezione TLS.', 'It cannot see what does not pass through it: an asymmetric path or an east-west flow inside the same VLAN escapes it, and encrypted traffic stays opaque without TLS inspection.')
  },
  {
    id: 'ap',
    name: b('Access point', 'Access point'),
    layer: 'L1-L2',
    decision: b('Fa da bridge tra il mezzo radio half-duplex e la rete cablata, gestendo associazione, contesa del canale e mappatura SSID-VLAN.', 'It bridges the half-duplex radio medium and the wired network, handling association, channel contention, and SSID-to-VLAN mapping.'),
    boundary: b('Estende un dominio di broadcast via radio: i client di uno SSID mappato su una VLAN stanno nella stessa subnet degli host cablati di quella VLAN.', 'It extends a broadcast domain over the air: clients of an SSID mapped to a VLAN sit in the same subnet as that VLAN’s wired hosts.'),
    notThis: b('Non è uno switch wireless: la banda è condivisa e si divide tra i client associati. Un client associato non è ancora un client autorizzato.', 'It is not a wireless switch: bandwidth is shared and divided among associated clients. An associated client is not yet an authorized client.')
  },
  {
    id: 'wlc',
    name: b('Wireless LAN Controller', 'Wireless LAN Controller'),
    layer: 'L2-L7',
    decision: b('Centralizza configurazione, RF management, roaming e policy degli AP lightweight, che restano responsabili delle funzioni radio in tempo reale (split-MAC).', 'It centralizes configuration, RF management, roaming, and policy for lightweight APs, which remain responsible for real-time radio functions (split-MAC).'),
    boundary: b('Il tunnel CAPWAP separa il control plane (UDP 5246, cifrato con DTLS) dal data plane (UDP 5247, cifrato solo se abilitato).', 'The CAPWAP tunnel separates the control plane (UDP 5246, DTLS-encrypted) from the data plane (UDP 5247, encrypted only if enabled).'),
    notThis: b('Non è un requisito della radio: un AP autonomo funziona senza controller. Il WLC aggiunge coerenza e scala, e diventa un punto singolo di fiducia da proteggere.', 'It is not a radio requirement: an autonomous AP works without a controller. The WLC adds consistency and scale, and becomes a single point of trust to protect.')
  },
  {
    id: 'endpoint',
    name: b('Endpoint e server', 'Endpoints and servers'),
    layer: 'L2-L7',
    decision: b('Per ogni destinazione l’host confronta il proprio indirizzo e la subnet mask: stessa subnet significa ARP diretto, subnet diversa significa consegna al default gateway.', 'For every destination the host compares its own address and subnet mask: same subnet means ARP directly, different subnet means delivery to the default gateway.'),
    boundary: b('È qui che nasce e termina il traffico, e dove la cifratura end-to-end protegge il contenuto indipendentemente da quanto è fidata l’infrastruttura.', 'This is where traffic begins and ends, and where end-to-end encryption protects content regardless of how trusted the infrastructure is.'),
    notThis: b('Quattro parametri corretti (indirizzo, mask, gateway, DNS) non garantiscono raggiungibilità: dimostrano solo che l’host è configurato.', 'Four correct parameters (address, mask, gateway, DNS) do not guarantee reachability: they only prove the host is configured.')
  },
  {
    id: 'poe',
    name: b('PoE e alimentazione', 'PoE and power'),
    layer: 'L1',
    decision: b('Lo switch rileva e classifica il dispositivo alimentato prima di erogare potenza, poi la fornisce entro il budget della porta e dell’apparato.', 'The switch detects and classifies the powered device before supplying power, then delivers it within the port and system budget.'),
    boundary: b('Rende la porta di accesso una dipendenza di alimentazione: telefoni, AP e telecamere si spengono con lo switch, quindi il gruppo di continuità diventa parte del progetto di rete.', 'It makes the access port a power dependency: phones, APs, and cameras go down with the switch, so the UPS becomes part of the network design.'),
    notThis: b('Il budget non è illimitato: 802.3af arriva a 15,4 W per porta, 802.3at a 30 W, 802.3bt a 60/90 W, ma va dimensionato anche il totale dell’apparato.', 'The budget is not unlimited: 802.3af reaches 15.4 W per port, 802.3at 30 W, 802.3bt 60/90 W, but the system total must be sized as well.')
  }
];

/** 1.2 — Network topology architectures. */
export interface TopologyArchitecture {
  id: string;
  name: Bilingual;
  shape: Bilingual;
  whenToUse: Bilingual;
  tradeOff: Bilingual;
}

export const TOPOLOGY_ARCHITECTURES: TopologyArchitecture[] = [
  {
    id: 'two-tier',
    name: b('Due livelli (collapsed core)', 'Two-tier (collapsed core)'),
    shape: b('Access e un livello combinato distribution/core: gli switch di accesso salgono su una coppia di switch che fa da distribuzione e da core insieme.', 'Access plus a combined distribution/core layer: access switches uplink to a pair of switches acting as both distribution and core.'),
    whenToUse: b('È la scelta normale per una sede singola o un campus piccolo, dove un terzo livello aggiungerebbe costo e latenza senza risolvere un problema reale.', 'The normal choice for a single site or a small campus, where a third layer would add cost and latency without solving a real problem.'),
    tradeOff: b('Meno apparati e meno hop, ma la coppia collapsed core concentra il rischio: la sua ridondanza e il suo dimensionamento sono l’intera resilienza del sito.', 'Fewer devices and fewer hops, but the collapsed-core pair concentrates risk: its redundancy and sizing are the site’s entire resilience.')
  },
  {
    id: 'three-tier',
    name: b('Tre livelli', 'Three-tier'),
    shape: b('Access, distribution e core distinti: l’accesso aggrega sulla distribuzione, che aggrega sul core dedicato al solo trasporto veloce tra blocchi.', 'Distinct access, distribution, and core: access aggregates into distribution, which aggregates into a core dedicated to fast transport between blocks.'),
    whenToUse: b('Serve quando i blocchi di accesso sono molti o distribuiti su più edifici: il core permette di aggiungere o isolare un blocco senza toccare gli altri.', 'Needed when access blocks are numerous or spread across buildings: the core lets a block be added or isolated without touching the others.'),
    tradeOff: b('Scala e isolamento dei guasti migliori a costo di più apparati, più link e un progetto Layer 3 più articolato da documentare e verificare.', 'Better scale and fault isolation at the cost of more devices, more links, and a more elaborate Layer 3 design to document and verify.')
  },
  {
    id: 'spine-leaf',
    name: b('Spine-leaf', 'Spine-leaf'),
    shape: b('Ogni leaf è collegato a ogni spine e nessun leaf è collegato a un altro leaf: due server qualsiasi distano sempre lo stesso numero di hop.', 'Every leaf connects to every spine and no leaf connects to another leaf: any two servers are always the same number of hops apart.'),
    whenToUse: b('È l’architettura dei data center, dove il traffico è prevalentemente east-west tra server e la latenza deve essere prevedibile.', 'The data-centre architecture, where traffic is predominantly east-west between servers and latency must be predictable.'),
    tradeOff: b('Banda e latenza uniformi, ma richiede molti link, ECMP sul routing e tipicamente un overlay per la segmentazione dei tenant.', 'Uniform bandwidth and latency, but it requires many links, ECMP in routing, and typically an overlay for tenant segmentation.')
  },
  {
    id: 'soho',
    name: b('SOHO', 'SOHO'),
    shape: b('Un solo apparato integra routing, switching, wireless e spesso firewall e modem per un ufficio piccolo o domestico.', 'A single device integrates routing, switching, wireless, and often firewall and modem for a small or home office.'),
    whenToUse: b('Dove il numero di utenti è basso e la gestione deve essere minima; è anche lo scenario tipico del lavoro da remoto da proteggere con VPN.', 'Where user count is low and management must be minimal; it is also the typical remote-work scenario to protect with a VPN.'),
    tradeOff: b('Semplicità massima, ma nessuna ridondanza e poca visibilità: l’apparato è insieme punto singolo di guasto e unico punto di enforcement.', 'Maximum simplicity, but no redundancy and little visibility: the device is both the single point of failure and the only enforcement point.')
  },
  {
    id: 'wan',
    name: b('WAN', 'WAN'),
    shape: b('Collega sedi distanti con circuiti di un provider: MPLS, Internet con VPN IPsec, linee dedicate o accessi broadband, spesso combinati in SD-WAN.', 'Connects distant sites over provider circuits: MPLS, Internet with IPsec VPNs, leased lines, or broadband access, often combined in SD-WAN.'),
    whenToUse: b('Quando le sedi sono oltre la portata del campus e la connettività va acquistata invece che cablata.', 'When sites are beyond campus reach and connectivity must be bought rather than cabled.'),
    tradeOff: b('Banda costosa e latenza imposta dalla distanza fisica: è il collo di bottiglia dove QoS, ridondanza dei circuiti e scelta del percorso contano davvero.', 'Expensive bandwidth and latency imposed by physical distance: it is the bottleneck where QoS, circuit redundancy, and path selection genuinely matter.')
  },
  {
    id: 'cloud',
    name: b('On-premises e cloud', 'On-premises and cloud'),
    shape: b('I servizi stanno in un data center proprio, presso un provider cloud o in entrambi, raggiunti via Internet, VPN o interconnessione dedicata.', 'Services live in an owned data centre, at a cloud provider, or both, reached over the Internet, a VPN, or a dedicated interconnect.'),
    whenToUse: b('Il cloud conviene dove la domanda è variabile o il servizio è gestito; l’on-premises dove contano latenza locale, vincoli normativi o hardware specifico.', 'Cloud fits variable demand or managed services; on-premises fits local latency, regulatory constraints, or specific hardware.'),
    tradeOff: b('Sposta il capitale in spesa corrente e l’amministrazione in configurazione: il perimetro diventa l’identità, e il percorso verso il servizio diventa critico.', 'It shifts capital into operating cost and administration into configuration: the perimeter becomes identity, and the path to the service becomes critical.')
  }
];

/** 1.3 — Physical interfaces and cabling types. */
export interface CablingType {
  id: string;
  name: Bilingual;
  medium: Bilingual;
  /** A figure such as "100 m" reads the same in both languages; a phrase does not. */
  reach: string | Bilingual;
  useCase: Bilingual;
  trap: Bilingual;
}

export const CABLING_TYPES: CablingType[] = [
  {
    id: 'utp',
    name: b('Rame UTP (Cat5e, Cat6, Cat6a)', 'UTP copper (Cat5e, Cat6, Cat6a)'),
    medium: b('Quattro coppie intrecciate: l’intreccio annulla il rumore captato dalle due coppie in modo uguale e contrario.', 'Four twisted pairs: the twisting cancels noise picked up equally and oppositely by the two wires of a pair.'),
    reach: '100 m',
    useCase: b('Il collegamento orizzontale verso l’endpoint, dove costo e semplicità di terminazione contano più della distanza.', 'The horizontal run to the endpoint, where cost and ease of termination matter more than distance.'),
    trap: b('I 100 m sono il limite del canale, cavo di permuta compreso, e valgono per l’Ethernet non per il PoE, la cui caduta di tensione va valutata a parte. Oltre quella distanza servono fibra o un apparato intermedio.', 'The 100 m is a channel limit, patch cords included, and applies to Ethernet rather than to PoE, whose voltage drop must be assessed separately. Beyond that distance you need fibre or an intermediate device.')
  },
  {
    id: 'mmf',
    name: b('Fibra multimodale (MMF)', 'Multimode fibre (MMF)'),
    medium: b('Nucleo largo (50 o 62,5 µm) in cui la luce viaggia su più percorsi: sorgenti economiche come i VCSEL bastano.', 'A wide core (50 or 62.5 µm) in which light travels along multiple paths: inexpensive sources such as VCSELs suffice.'),
    reach: b('Da centinaia di metri a poche centinaia, in calo al crescere della velocità', 'From hundreds of metres down to a few hundred, shrinking as speed rises'),
    useCase: b('Dorsali di campus e collegamenti intra-data center, dove serve più distanza del rame a costo contenuto.', 'Campus backbones and intra-data-centre links, where more distance than copper is needed at moderate cost.'),
    trap: b('I percorsi multipli causano dispersione modale: la distanza massima dipende dalla velocità e dalla categoria OM, non è un valore unico.', 'Multiple paths cause modal dispersion: the maximum distance depends on the speed and the OM category, it is not a single value.')
  },
  {
    id: 'smf',
    name: b('Fibra monomodale (SMF)', 'Single-mode fibre (SMF)'),
    medium: b('Nucleo sottile (circa 9 µm) che ammette un solo percorso: richiede sorgenti laser più costose ma elimina la dispersione modale.', 'A thin core (about 9 µm) that admits a single path: it needs more expensive laser sources but removes modal dispersion.'),
    reach: b('Decine di chilometri', 'Tens of kilometres'),
    useCase: b('Collegamenti tra edifici, tra data center e verso il provider, dove la distanza è il vincolo dominante.', 'Links between buildings, between data centres, and toward the provider, where distance is the dominant constraint.'),
    trap: b('Non si mescolano fibra e ottiche di tipo diverso: un transceiver monomodale su una bretella multimodale produce un link instabile o non funzionante, con errori difficili da attribuire.', 'Do not mix fibre and optics of different types: a single-mode transceiver on a multimode patch cord produces an unstable or dead link, with errors that are hard to attribute.')
  },
  {
    id: 'pinout',
    name: b('T568A, T568B e cavi crossover', 'T568A, T568B, and crossover cables'),
    medium: b('I due standard di piedinatura differiscono solo per lo scambio della coppia verde con la coppia arancione.', 'The two pinout standards differ only by swapping the green pair with the orange pair.'),
    reach: '—',
    useCase: b('Stesso standard ai due capi produce un cavo straight-through; standard diversi producono un crossover, storicamente necessario tra apparati dello stesso tipo.', 'The same standard at both ends produces a straight-through cable; different standards produce a crossover, historically required between devices of the same type.'),
    trap: b('Mnemonico: A come "Alike" — i due capi identici danno lo straight-through; B come "Both different" — capi diversi danno il crossover. Sulle porte moderne l’Auto-MDIX rileva e corregge lo scambio, quindi il crossover serve solo con hardware legacy o quando l’Auto-MDIX è disattivato.', 'Mnemonic: A for "Alike" — two identical ends give a straight-through; B for "Both different" — different ends give a crossover. Modern ports run Auto-MDIX, which detects and corrects the swap, so a crossover is only needed with legacy hardware or when Auto-MDIX is disabled.')
  },
  {
    id: 'negotiation',
    name: b('Autonegoziazione di velocità e duplex', 'Speed and duplex autonegotiation'),
    medium: b('I due capi annunciano le capacità supportate e scelgono la combinazione migliore comune, di norma la più alta disponibile in full duplex.', 'Both ends advertise supported capabilities and select the best common combination, normally the highest available in full duplex.'),
    reach: '—',
    useCase: b('Lasciare l’autonegoziazione attiva su entrambi i lati è la configurazione corretta nella grande maggioranza dei casi.', 'Leaving autonegotiation enabled on both sides is the correct configuration in the vast majority of cases.'),
    trap: b('Forzare velocità e duplex su un solo lato è la causa classica del duplex mismatch: l’altro capo ripiega su half duplex, il link resta up/up e le prestazioni crollano. Se si forza, si forza su entrambi i capi.', 'Hard-coding speed and duplex on one side only is the classic cause of a duplex mismatch: the other end falls back to half duplex, the link stays up/up, and performance collapses. If you hard-code, hard-code both ends.')
  }
];

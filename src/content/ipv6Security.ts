import type { Bilingual } from '../types';
import type { CcnaDomainId } from './securityCoverage';
import type { SecurityPlane } from './securityTaxonomy';

export type Ipv6SecurityTopic = 'first-hop' | 'control' | 'evasion' | 'transition' | 'dual-stack';

export interface Ipv6SecurityScenario {
  id: string;
  topic: Ipv6SecurityTopic;
  planes: SecurityPlane[];
  domains: CcnaDomainId[];
  techniqueIds: string[];
  controlIds: string[];
  title: Bilingual;
  normalBehavior: Bilingual;
  threat: Bilingual;
  evidence: Bilingual[];
  controls: Bilingual[];
  verification: Bilingual[];
  pitfall: Bilingual;
}

const b = (it: string, en: string): Bilingual => ({ it, en });

export const IPV6_SECURITY_SCENARIOS: Ipv6SecurityScenario[] = [
  {
    id: 'rogue-ra-nd', topic: 'first-hop', planes: ['control', 'data'], domains: ['network-fundamentals', 'network-access'], techniqueIds: ['ipv6-ra-nd-spoofing'], controlIds: ['l2-first-hop-security', 'dual-stack-policy-parity'],
    title: b('RA rogue e Neighbor Discovery falsificato', 'Rogue RA and forged Neighbor Discovery'),
    normalBehavior: b('ICMPv6 Neighbor Discovery sostituisce ARP. I Router Advertisement comunicano prefisso, router predefinito e parametri SLAAC; i Neighbor Advertisement risolvono l’associazione IPv6–MAC.', 'ICMPv6 Neighbor Discovery replaces ARP. Router Advertisements communicate prefixes, the default router, and SLAAC parameters; Neighbor Advertisements resolve IPv6-to-MAC mappings.'),
    threat: b('RA o NA falsi possono introdurre un gateway ostile, un prefisso inatteso o una falsa associazione di neighbor, abilitando intercettazione o disservizio.', 'Forged RAs or NAs can introduce a hostile gateway, an unexpected prefix, or a false neighbor mapping, enabling interception or disruption.'),
    evidence: [b('RA ricevuti su porte di accesso e prefissi/router non autorizzati.', 'RAs received on access ports and unauthorized prefixes/routers.'), b('Cambi frequenti o duplicati nella neighbor cache.', 'Frequent or duplicate changes in the neighbor cache.')],
    controls: [b('RA Guard sulle porte host e trust soltanto verso gli uplink legittimi.', 'RA Guard on host-facing ports and trust only toward legitimate uplinks.'), b('IPv6 Source Guard/SAVI dove supportato, segmentazione e cifratura end-to-end.', 'IPv6 Source Guard/SAVI where supported, segmentation, and end-to-end encryption.')],
    verification: [b('Confronta `show ipv6 neighbors` con inventario e binding attesi.', 'Compare `show ipv6 neighbors` with the expected inventory and bindings.'), b('Controlla policy e contatori RA Guard da una porta trusted e una untrusted.', 'Check RA Guard policy and counters from one trusted and one untrusted port.')],
    pitfall: b('RA Guard richiede classificazione corretta delle porte e implementazioni aggiornate capaci di analizzare le catene di extension header.', 'RA Guard requires correct port classification and current implementations able to parse extension-header chains.')
  },
  {
    id: 'rogue-dhcpv6', topic: 'first-hop', planes: ['data', 'application'], domains: ['network-access', 'ip-services'], techniqueIds: ['rogue-dhcpv6'], controlIds: ['l2-first-hop-security', 'dual-stack-policy-parity'],
    title: b('Server DHCPv6 rogue', 'Rogue DHCPv6 server'),
    normalBehavior: b('Con DHCPv6 stateful o stateless, i flag M/O degli RA guidano il client. DHCPv6 può fornire indirizzi e opzioni come DNS, ma il router predefinito viene appreso dagli RA.', 'With stateful or stateless DHCPv6, RA M/O flags guide the client. DHCPv6 can supply addresses and options such as DNS, but the default router is learned from RAs.'),
    threat: b('Un server non autorizzato può distribuire DNS o configurazioni IPv6 ostili e creare una divergenza difficile da notare rispetto a IPv4.', 'An unauthorized server can distribute hostile DNS or IPv6 configuration and create a divergence that is easy to miss when compared with IPv4.'),
    evidence: [b('Advertise/Reply da porte client o DUID non autorizzati.', 'Advertise/Reply messages from client ports or unauthorized DUIDs.'), b('DNS IPv6 e lease incoerenti tra host dello stesso segmento.', 'Inconsistent IPv6 DNS settings and leases among hosts on the same segment.')],
    controls: [b('DHCPv6 Guard con ruoli server/client espliciti.', 'DHCPv6 Guard with explicit server/client roles.'), b('Inventario di server, relay, DUID, prefissi e opzioni autorizzate.', 'Inventory of authorized servers, relays, DUIDs, prefixes, and options.')],
    verification: [b('Acquisisci il flusso Solicit–Advertise–Request–Reply e valida sorgente e opzioni.', 'Capture the Solicit–Advertise–Request–Reply exchange and validate its source and options.'), b('Verifica contatori DHCPv6 Guard e configurazione RA M/O.', 'Verify DHCPv6 Guard counters and RA M/O configuration.')],
    pitfall: b('DHCPv6 Guard non sostituisce RA Guard: DHCPv6 non distribuisce il default gateway IPv6.', 'DHCPv6 Guard does not replace RA Guard: DHCPv6 does not distribute the IPv6 default gateway.')
  },
  {
    id: 'neighbor-cache-exhaustion', topic: 'first-hop', planes: ['control', 'data'], domains: ['network-fundamentals', 'network-access'], techniqueIds: ['ipv6-neighbor-cache-exhaustion'], controlIds: ['l2-first-hop-security', 'source-validation-copp'],
    title: b('Esaurimento della Neighbor Cache', 'Neighbor Cache exhaustion'),
    normalBehavior: b('Il router mantiene stato ND per i neighbor on-link e risolve nuovi indirizzi mediante Neighbor Solicitation e Advertisement.', 'The router maintains ND state for on-link neighbors and resolves new addresses through Neighbor Solicitation and Advertisement.'),
    threat: b('Traffico verso numerosi indirizzi on-link inesistenti forza risoluzioni e stato incompleto, consumando CPU e memoria del first-hop router.', 'Traffic toward many nonexistent on-link addresses forces resolution and incomplete state, consuming first-hop router CPU and memory.'),
    evidence: [b('Crescita rapida di entry INCOMPLETE e Neighbor Solicitation.', 'Rapid growth of INCOMPLETE entries and Neighbor Solicitations.'), b('CPU elevata, perdita di neighbor legittimi o ritardi nella risoluzione.', 'High CPU, loss of legitimate neighbors, or resolution delays.')],
    controls: [b('Limiti della neighbor cache e rate limiting ND compatibili con la piattaforma.', 'Platform-appropriate neighbor-cache limits and ND rate limiting.'), b('Prefissi di accesso dimensionati, source validation e protezione del control plane.', 'Right-sized access prefixes, source validation, and control-plane protection.')],
    verification: [b('Osserva trend e stati con `show ipv6 neighbors` e telemetria CPU.', 'Observe trends and states with `show ipv6 neighbors` and CPU telemetry.'), b('Valida che i limiti preservino la normale acquisizione dei neighbor.', 'Validate that limits preserve normal neighbor acquisition.')],
    pitfall: b('Soglie troppo basse possono trasformare la mitigazione in un outage per host legittimi o ambienti ad alta densità.', 'Thresholds that are too low can turn mitigation into an outage for legitimate hosts or high-density environments.')
  },
  {
    id: 'icmpv6-pmtud', topic: 'control', planes: ['control', 'data'], domains: ['network-fundamentals', 'ip-connectivity'], techniqueIds: ['icmpv6-filtering-abuse'], controlIds: ['dual-stack-policy-parity', 'source-validation-copp'],
    title: b('ICMPv6, ND e Path MTU Discovery', 'ICMPv6, ND, and Path MTU Discovery'),
    normalBehavior: b('ICMPv6 supporta errori, Neighbor Discovery e PMTUD. In IPv6 i router non frammentano: il mittente reagisce ai messaggi Packet Too Big e adatta la dimensione dei pacchetti.', 'ICMPv6 supports errors, Neighbor Discovery, and PMTUD. IPv6 routers do not fragment: the source reacts to Packet Too Big messages and adjusts packet size.'),
    threat: b('Il filtraggio indiscriminato crea black hole MTU e guasti ND; messaggi ICMPv6 falsi o in eccesso possono invece alterare o degradare i flussi.', 'Indiscriminate filtering creates MTU black holes and ND failures; forged or excessive ICMPv6 messages can instead alter or degrade flows.'),
    evidence: [b('Sessioni piccole funzionano mentre trasferimenti più grandi si bloccano.', 'Small sessions work while larger transfers stall.'), b('Packet Too Big assenti o inattesi e contatori ACL ICMPv6 in crescita.', 'Missing or unexpected Packet Too Big messages and rising ICMPv6 ACL counters.')],
    controls: [b('Consenti i tipi ICMPv6 necessari secondo ruolo e direzione; limita solo gli abusi.', 'Permit required ICMPv6 types according to role and direction; rate-limit only abuse.'), b('Valida hop, sorgente e contesto dove la piattaforma lo consente.', 'Validate hop, source, and context where the platform allows it.')],
    verification: [b('Prova PMTUD con dimensioni diverse e osserva Packet Too Big end-to-end.', 'Test PMTUD with different sizes and observe Packet Too Big end to end.'), b('Verifica ND, SLAAC e raggiungibilità dopo ogni modifica ACL.', 'Verify ND, SLAAC, and reachability after every ACL change.')],
    pitfall: b('“Blocca tutto ICMP” non è una policy sicura per IPv6: può interrompere funzioni fondamentali senza produrre un errore evidente.', '“Block all ICMP” is not a safe IPv6 policy: it can break fundamental functions without producing an obvious error.')
  },
  {
    id: 'extension-header-evasion', topic: 'evasion', planes: ['data', 'control'], domains: ['network-fundamentals', 'security-fundamentals'], techniqueIds: ['ipv6-extension-header-evasion'], controlIds: ['firewall-ids-ips', 'dual-stack-policy-parity'],
    title: b('Evasione con IPv6 Extension Header', 'IPv6 extension-header evasion'),
    normalBehavior: b('Gli extension header trasportano funzioni opzionali tra header IPv6 e protocollo superiore; non sono automaticamente malevoli.', 'Extension headers carry optional functions between the IPv6 header and the upper-layer protocol; they are not automatically malicious.'),
    threat: b('Catene insolite, frammentazione o parsing incoerente tra dispositivi possono nascondere il protocollo superiore o produrre decisioni diverse tra firewall, IDS e host.', 'Unusual chains, fragmentation, or inconsistent parsing across devices can hide the upper-layer protocol or produce different decisions among firewalls, IDSs, and hosts.'),
    evidence: [b('Catene lunghe, ordine anomalo, frammenti sovrapposti o protocollo finale non visibile.', 'Long chains, abnormal ordering, overlapping fragments, or an unseen final protocol.'), b('Disaccordo tra flow log, packet capture e log del controllo inline.', 'Disagreement among flow logs, packet captures, and inline-control logs.')],
    controls: [b('Normalizzazione e policy esplicita per extension header non necessari.', 'Normalization and explicit policy for unnecessary extension headers.'), b('Firewall/IPS aggiornati e testati con catene e frammenti rappresentativi.', 'Current firewalls/IPSs tested with representative chains and fragments.')],
    verification: [b('Confronta la decisione del controllo con una cattura prima e dopo l’enforcement.', 'Compare the control decision with captures before and after enforcement.'), b('Verifica che traffico IPv6 legittimo con header consentiti continui a funzionare.', 'Verify that legitimate IPv6 traffic with allowed headers continues to work.')],
    pitfall: b('Scartare ogni extension header può interrompere traffico valido; accettarli senza limiti può creare un gap di parsing.', 'Dropping every extension header can break valid traffic; accepting them without limits can create a parsing gap.')
  },
  {
    id: 'ipv6-fragmentation', topic: 'evasion', planes: ['data'], domains: ['network-fundamentals', 'security-fundamentals'], techniqueIds: ['ipv6-fragmentation-evasion'], controlIds: ['firewall-ids-ips', 'dual-stack-policy-parity'],
    title: b('Frammentazione IPv6 e visibilità', 'IPv6 fragmentation and visibility'),
    normalBehavior: b('Solo l’host sorgente frammenta IPv6 usando il Fragment header; i router inoltrano oppure inviano Packet Too Big.', 'Only the source host fragments IPv6 using the Fragment header; routers forward or send Packet Too Big.'),
    threat: b('Frammenti minuscoli, incompleti o ambigui possono eludere controlli stateless, consumare risorse di riassemblaggio o separare informazioni critiche per la policy.', 'Tiny, incomplete, or ambiguous fragments can evade stateless controls, consume reassembly resources, or separate policy-critical information.'),
    evidence: [b('Molti fragment ID incompleti, offset anomali o timeout di riassemblaggio.', 'Many incomplete fragment IDs, abnormal offsets, or reassembly timeouts.'), b('Sessioni viste dall’endpoint ma non classificate dal sensore.', 'Sessions seen by the endpoint but not classified by the sensor.')],
    controls: [b('Riassemblaggio/normalizzazione coerente e limiti di risorsa sui dispositivi stateful.', 'Consistent reassembly/normalization and resource limits on stateful devices.'), b('Policy per atomic/tiny fragment basata sulle necessità reali dell’ambiente.', 'Policy for atomic/tiny fragments based on actual environmental needs.')],
    verification: [b('Confronta capture, contatori fragment e log di reassembly.', 'Compare captures, fragment counters, and reassembly logs.'), b('Esegui test controllati con frammenti validi e malformati.', 'Run controlled tests with valid and malformed fragments.')],
    pitfall: b('La frammentazione IPv6 non avviene nei router: attribuirla a un router intermedio porta a una diagnosi errata.', 'IPv6 fragmentation does not occur in routers: attributing it to an intermediate router leads to an incorrect diagnosis.')
  },
  {
    id: 'transition-tunnel-bypass', topic: 'transition', planes: ['data', 'management'], domains: ['network-fundamentals', 'security-fundamentals'], techniqueIds: ['ipv6-transition-tunnel-bypass'], controlIds: ['dual-stack-policy-parity', 'telemetry-independent-evidence'],
    title: b('Bypass tramite tunnel e meccanismi di transizione', 'Bypass through tunnels and transition mechanisms'),
    normalBehavior: b('Tunnel configurati esplicitamente possono trasportare IPv6 su infrastruttura IPv4; molti meccanismi automatici legacy non servono nelle reti moderne.', 'Explicitly configured tunnels can carry IPv6 over IPv4 infrastructure; many legacy automatic mechanisms are unnecessary in modern networks.'),
    threat: b('6in4, Teredo o altri tunnel non autorizzati possono oltrepassare sensori e policy che ispezionano solo IPv4 o solo il traffico nativo.', 'Unauthorized 6in4, Teredo, or other tunnels can bypass sensors and policies that inspect only IPv4 or only native traffic.'),
    evidence: [b('Protocol 41, endpoint tunnel o traffico UDP di transizione non previsto.', 'Unexpected protocol 41, tunnel endpoints, or transition-related UDP traffic.'), b('Host con connettività IPv6 non presente nell’inventario di rete.', 'Hosts with IPv6 connectivity absent from the network inventory.')],
    controls: [b('Disabilita meccanismi di transizione inutilizzati e autorizza esplicitamente i tunnel necessari.', 'Disable unused transition mechanisms and explicitly authorize required tunnels.'), b('Ispeziona entrambi gli header e porta la telemetria anche sul traffico decapsulato.', 'Inspect both headers and extend telemetry to decapsulated traffic.')],
    verification: [b('Cerca protocolli e destinazioni di tunnel nei flow log e sugli endpoint.', 'Search for tunnel protocols and destinations in flow logs and on endpoints.'), b('Verifica che i tunnel autorizzati attraversino gli stessi controlli del traffico nativo.', 'Verify that authorized tunnels traverse the same controls as native traffic.')],
    pitfall: b('Bloccare un singolo protocollo non copre tutti i metodi di incapsulamento; l’inventario degli endpoint resta essenziale.', 'Blocking one protocol does not cover every encapsulation method; endpoint inventory remains essential.')
  },
  {
    id: 'dual-stack-policy-gap', topic: 'dual-stack', planes: ['data', 'management', 'application'], domains: ['network-fundamentals', 'ip-services', 'security-fundamentals'], techniqueIds: ['dual-stack-policy-bypass'], controlIds: ['dual-stack-policy-parity', 'telemetry-independent-evidence'],
    title: b('Divergenza di policy dual-stack e shadow IPv6', 'Dual-stack policy drift and shadow IPv6'),
    normalBehavior: b('IPv4 e IPv6 sono due protocolli operativi paralleli: routing, ACL, firewall, DNS, telemetria e hardening devono coprire entrambi.', 'IPv4 and IPv6 are two parallel operational protocols: routing, ACLs, firewalls, DNS, telemetry, and hardening must cover both.'),
    threat: b('Un servizio protetto in IPv4 ma esposto via AAAA, link-local, indirizzo globale o IPv6 abilitato automaticamente crea un percorso alternativo non governato.', 'A service protected over IPv4 but exposed through AAAA, link-local, a global address, or automatically enabled IPv6 creates an unmanaged alternate path.'),
    evidence: [b('Porte o servizi raggiungibili solo via IPv6 e AAAA non inventariati.', 'Ports or services reachable only over IPv6 and untracked AAAA records.'), b('ACL, flow log o alert presenti per IPv4 ma assenti per IPv6.', 'ACLs, flow logs, or alerts present for IPv4 but absent for IPv6.')],
    controls: [b('Policy-as-code e test di parità IPv4/IPv6 per ogni flusso autorizzato e negato.', 'Policy-as-code and IPv4/IPv6 parity tests for every allowed and denied flow.'), b('Inventario IPAM/DNS, scanning autorizzato e telemetria dual-stack.', 'IPAM/DNS inventory, authorized scanning, and dual-stack telemetry.')],
    verification: [b('Ripeti la stessa matrice di test su record A e AAAA e su entrambe le famiglie.', 'Repeat the same test matrix against A and AAAA records and both address families.'), b('Confronta coverage di ACL, firewall, IDS/IPS, NetFlow e logging.', 'Compare ACL, firewall, IDS/IPS, NetFlow, and logging coverage.')],
    pitfall: b('NAT non è un controllo di sicurezza IPv6 e disabilitare IPv6 “sulla carta” non prova che sia assente da host, tunnel e link locali.', 'NAT is not an IPv6 security control, and disabling IPv6 “on paper” does not prove it is absent from hosts, tunnels, and local links.')
  }
];

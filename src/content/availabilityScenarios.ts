import type { Bilingual } from '../types';
import type { CcnaDomainId } from './securityCoverage';
import type { SecurityPlane } from './securityTaxonomy';

export type AvailabilityArea = 'bandwidth' | 'tcp-state' | 'reflection' | 'control-plane' | 'layer2' | 'ipv6' | 'services' | 'nat' | 'qos';

export interface AvailabilityScenario {
  id: string;
  area: AvailabilityArea;
  domains: CcnaDomainId[];
  planes: SecurityPlane[];
  techniqueIds: string[];
  controlIds: string[];
  title: Bilingual;
  resource: Bilingual;
  saturationMechanism: Bilingual;
  evidence: Bilingual[];
  controls: Bilingual[];
  verification: Bilingual[];
  caveat: Bilingual;
}

const b = (it: string, en: string): Bilingual => ({ it, en });

export const AVAILABILITY_SCENARIOS: AvailabilityScenario[] = [
  {
    id: 'wan-link-saturation', area: 'bandwidth', domains: ['network-fundamentals', 'security-fundamentals'], planes: ['physical', 'data'], techniqueIds: ['link-saturation-ddos', 'udp-amplification'], controlIds: ['availability-capacity-protection', 'source-validation-copp'],
    title: b('Saturazione del link e punto di enforcement', 'Link saturation and the enforcement point'),
    resource: b('Capacità in bit/s e packet/s del collegamento più stretto prima del servizio.', 'Bit/s and packet/s capacity of the narrowest link before the service.'),
    saturationMechanism: b('Un volume superiore alla capacità riempie le code e causa loss prima che firewall o IPS locali possano applicare policy.', 'Traffic volume above capacity fills queues and causes loss before local firewalls or IPS can enforce policy.'),
    evidence: [b('Utilizzo prossimo al line rate, output drop, queue drop e loss simultanea su più servizi.', 'Utilization near line rate, output drops, queue drops, and simultaneous loss across services.'), b('NetFlow mostra sorgenti o destinazioni distribuite e traffico già saturo a monte.', 'NetFlow shows distributed sources or destinations and traffic already saturated upstream.')],
    controls: [b('Mitigazione upstream, scrubbing/anycast, RTBH o FlowSpec secondo governance e provider.', 'Upstream mitigation, scrubbing/anycast, RTBH, or FlowSpec according to governance and provider support.'), b('Capacity plan, percorsi ridondanti e contatti/escalation provati.', 'Capacity planning, redundant paths, and tested contacts/escalation.')],
    verification: [b('Misura il traffico prima e dopo il punto di mitigazione, non solo sul firewall.', 'Measure traffic before and after the mitigation point, not only at the firewall.'), b('Conferma disponibilità dei flussi essenziali mentre la mitigazione è attiva.', 'Confirm availability of essential flows while mitigation is active.')],
    caveat: b('CoPP protegge la CPU del router, ma non libera un link WAN già saturo dal traffico transit.', 'CoPP protects router CPU but does not free a WAN link already saturated by transit traffic.')
  },
  {
    id: 'tcp-syn-state-exhaustion', area: 'tcp-state', domains: ['network-fundamentals', 'security-fundamentals'], planes: ['data', 'application'], techniqueIds: ['syn-flood'], controlIds: ['availability-capacity-protection', 'firewall-ids-ips'],
    title: b('SYN flood, backlog e stato half-open', 'SYN flood, backlog, and half-open state'),
    resource: b('Backlog TCP, memoria e stato di firewall, load balancer e server.', 'TCP backlog, memory, and state on firewalls, load balancers, and servers.'),
    saturationMechanism: b('Molti SYN senza ACK finale mantengono connessioni embryonic fino al timeout e impediscono nuove sessioni legittime.', 'Many SYNs without the final ACK retain embryonic connections until timeout and prevent new legitimate sessions.'),
    evidence: [b('Rapporto SYN/ACK anomalo, half-open crescenti, backlog pieno e retransmission SYN-ACK.', 'An abnormal SYN-to-ACK ratio, growing half-open state, a full backlog, and SYN-ACK retransmissions.'), b('Banda non necessariamente satura ma nuove connessioni falliscono.', 'Bandwidth is not necessarily saturated, yet new connections fail.')],
    controls: [b('SYN cookies/proxy, limiti per sorgente, timeout calibrati e protezione DDoS state-aware.', 'SYN cookies/proxying, per-source limits, calibrated timeouts, and state-aware DDoS protection.'), b('Scaling e health check che misurino nuove connessioni, non solo process uptime.', 'Scaling and health checks that measure new connections, not only process uptime.')],
    verification: [b('Correla handshake in capture con contatori embryonic e backlog.', 'Correlate handshakes in captures with embryonic-state and backlog counters.'), b('Verifica nuovi client legittimi durante un test di carico controllato entro soglia.', 'Verify new legitimate clients during a controlled load test within the approved threshold.')],
    caveat: b('Ridurre indiscriminatamente i timeout può interrompere client lenti o reti ad alta latenza senza risolvere la causa.', 'Indiscriminately reducing timeouts can disrupt slow clients or high-latency networks without addressing the cause.')
  },
  {
    id: 'udp-reflection-amplification', area: 'reflection', domains: ['network-fundamentals', 'ip-services', 'security-fundamentals'], planes: ['data', 'application'], techniqueIds: ['udp-amplification', 'ip-spoofing'], controlIds: ['availability-capacity-protection', 'source-validation-copp'],
    title: b('Reflection/amplification UDP e sorgente spoofata', 'UDP reflection/amplification and spoofed sources'),
    resource: b('Banda della vittima e capacità packet-processing di edge e servizio.', 'Victim bandwidth and the packet-processing capacity of edge devices and services.'),
    saturationMechanism: b('Piccole richieste con IP vittima spoofato inducono molti reflector a inviare risposte più grandi verso la destinazione.', 'Small requests with the victim IP spoofed cause many reflectors to send larger responses to the destination.'),
    evidence: [b('Molte risposte UDP non richieste, sorgenti distribuite e rapporto byte risposta/richiesta elevato.', 'Many unsolicited UDP responses, distributed sources, and a high response-to-request byte ratio.'), b('Assenza del traffico di richiesta corrispondente vicino alla vittima.', 'Absence of corresponding request traffic near the victim.')],
    controls: [b('BCP 38/uRPF agli edge di origine, servizi non open e response rate limiting.', 'BCP 38/uRPF at source edges, no open services, and response-rate limiting.'), b('Filtri o scrubbing upstream perché il blocco locale non recupera banda già consumata.', 'Upstream filtering or scrubbing because local blocking does not recover already consumed bandwidth.')],
    verification: [b('Confronta NetFlow e capture su edge vittima con telemetria provider.', 'Compare NetFlow and captures at the victim edge with provider telemetry.'), b('Verifica che i propri servizi UDP non rispondano a sorgenti non autorizzate come amplificatori.', 'Verify that local UDP services do not answer unauthorized sources as amplifiers.')],
    caveat: b('Bloccare tutte le risposte UDP può interrompere DNS, NTP o applicazioni legittime; servono servizio, direzione e stato.', 'Blocking all UDP responses can break DNS, NTP, or legitimate applications; service, direction, and state matter.')
  },
  {
    id: 'control-plane-cpu-exhaustion', area: 'control-plane', domains: ['network-fundamentals', 'ip-connectivity', 'security-fundamentals'], planes: ['control', 'management'], techniqueIds: ['control-plane-protocol-flood'], controlIds: ['availability-capacity-protection', 'source-validation-copp', 'routing-trust-policy'],
    title: b('CPU del control plane, punt ed eccezioni', 'Control-plane CPU, punts, and exceptions'),
    resource: b('CPU, input queue e capacità delle classi di control-plane policing.', 'CPU, input queues, and control-plane policing class capacity.'),
    saturationMechanism: b('Traffico destinato all’apparato, eccezioni di forwarding o churn di protocolli forza packet processing sulla CPU.', 'Device-destined traffic, forwarding exceptions, or protocol churn forces packet processing onto the CPU.'),
    evidence: [b('CPU interrupt elevata, input queue drop, punt crescenti e classi CoPP exceed.', 'High interrupt CPU, input-queue drops, rising punts, and CoPP class exceeds.'), b('Adiacenze instabili o management lento mentre il data plane hardware può continuare a inoltrare.', 'Unstable adjacencies or slow management while the hardware data plane may continue forwarding.')],
    controls: [b('CoPP per classi, infrastructure ACL, autenticazione dei protocolli e rate coerenti.', 'Class-based CoPP, infrastructure ACLs, protocol authentication, and appropriate rates.'), b('OOB management e baseline separate per routing, gestione ed eccezioni.', 'OOB management and separate baselines for routing, management, and exceptions.')],
    verification: [b('Identifica la classe colpita e conferma che protocolli critici restino entro conform-action.', 'Identify the affected class and confirm critical protocols remain within conform-action.'), b('Verifica contemporaneamente CPU, neighbor e forwarding transit.', 'Verify CPU, neighbors, and transit forwarding at the same time.')],
    caveat: b('Una policy CoPP troppo aggressiva può causare lo stesso outage che dovrebbe prevenire affamando routing o first-hop protocols.', 'An overly aggressive CoPP policy can cause the outage it should prevent by starving routing or first-hop protocols.')
  },
  {
    id: 'layer2-table-and-broadcast-exhaustion', area: 'layer2', domains: ['network-access', 'ip-services'], planes: ['data', 'control'], techniqueIds: ['mac-flooding', 'dhcp-starvation', 'l2-broadcast-storm'], controlIds: ['availability-capacity-protection', 'l2-first-hop-security', 'stp-edge-protection'],
    title: b('CAM, lease DHCP e broadcast domain', 'CAM, DHCP leases, and the broadcast domain'),
    resource: b('CAM table, pool DHCP, capacità broadcast e CPU degli endpoint nel segmento.', 'CAM table, DHCP pools, broadcast capacity, and endpoint CPU within the segment.'),
    saturationMechanism: b('MAC churn, identità DHCP variabili o loop Layer 2 consumano tabelle e moltiplicano flooding/broadcast.', 'MAC churn, changing DHCP identities, or Layer 2 loops consume tables and multiply flooding/broadcast traffic.'),
    evidence: [b('CAM utilization/churn, unknown-unicast, Discover spike e pool esaurito.', 'CAM utilization/churn, unknown-unicast traffic, Discover spikes, and pool exhaustion.'), b('MAC flapping, topology change e broadcast simultanei su più porte.', 'MAC flapping, topology changes, and simultaneous broadcasts across multiple ports.')],
    controls: [b('Port Security, DHCP Snooping rate limit, BPDU Guard e storm control calibrato.', 'Port Security, DHCP Snooping rate limits, BPDU Guard, and calibrated storm control.'), b('Domini broadcast contenuti e porte edge/uplink classificate correttamente.', 'Contained broadcast domains and correctly classified edge/uplink ports.')],
    verification: [b('Correla porta, MAC, binding DHCP e ultimo topology change prima di pulire lo stato.', 'Correlate the port, MAC, DHCP binding, and last topology change before clearing state.'), b('Prova che il limite contenga una porta ostile senza bloccare uplink o relay legittimi.', 'Prove that the limit contains a hostile port without blocking legitimate uplinks or relays.')],
    caveat: b('Svuotare CAM o lease senza isolare la sorgente può aggravare flooding e indisponibilità durante la ricostruzione.', 'Clearing CAM or leases without isolating the source can worsen flooding and unavailability during relearning.')
  },
  {
    id: 'ipv6-neighbor-fragment-exhaustion', area: 'ipv6', domains: ['network-fundamentals', 'network-access', 'security-fundamentals'], planes: ['control', 'data'], techniqueIds: ['ipv6-neighbor-cache-exhaustion', 'ipv6-fragmentation-evasion'], controlIds: ['availability-capacity-protection', 'l2-first-hop-security', 'dual-stack-policy-parity'],
    title: b('Neighbor Cache e riassemblaggio IPv6', 'IPv6 Neighbor Cache and reassembly'),
    resource: b('Neighbor table, CPU ND e memoria/timeout di riassemblaggio dei frammenti.', 'Neighbor tables, ND CPU, and fragment-reassembly memory/timeouts.'),
    saturationMechanism: b('Destinazioni on-link inesistenti generano entry INCOMPLETE; frammenti incompleti trattengono stato fino al timeout.', 'Nonexistent on-link destinations create INCOMPLETE entries; incomplete fragments retain state until timeout.'),
    evidence: [b('Neighbor INCOMPLETE crescenti, Neighbor Solicitation e CPU del first-hop router.', 'Growing INCOMPLETE neighbors, Neighbor Solicitations, and first-hop-router CPU.'), b('Fragment ID incompleti, timeout e memoria di riassemblaggio in crescita.', 'Incomplete fragment IDs, timeouts, and growing reassembly memory.')],
    controls: [b('Limiti neighbor/ND, prefissi access dimensionati e protezioni first-hop IPv6.', 'Neighbor/ND limits, right-sized access prefixes, and IPv6 first-hop protections.'), b('Normalizzazione, limiti di riassemblaggio e policy dual-stack equivalenti.', 'Normalization, reassembly limits, and equivalent dual-stack policy.')],
    verification: [b('Distingui neighbor legittimi, INCOMPLETE e sorgenti che generano la risoluzione.', 'Distinguish legitimate neighbors, INCOMPLETE entries, and sources triggering resolution.'), b('Verifica ND e PMTUD legittimi dopo l’applicazione dei limiti.', 'Verify legitimate ND and PMTUD after applying limits.')],
    caveat: b('Bloccare indiscriminatamente ICMPv6 o frammenti interrompe funzioni necessarie; la policy deve essere specifica per tipo e contesto.', 'Indiscriminately blocking ICMPv6 or fragments breaks required functions; policy must be specific to type and context.')
  },
  {
    id: 'dns-capacity-exhaustion', area: 'services', domains: ['ip-services', 'security-fundamentals'], planes: ['application', 'data'], techniqueIds: ['dns-resource-exhaustion', 'udp-amplification'], controlIds: ['availability-capacity-protection', 'telemetry-independent-evidence'],
    title: b('Capacità DNS, recursion e cache miss', 'DNS capacity, recursion, and cache misses'),
    resource: b('Query/s del resolver o authoritative, worker, socket, cache e dipendenze upstream.', 'Resolver or authoritative query rate, workers, sockets, cache, and upstream dependencies.'),
    saturationMechanism: b('Query random-subdomain o recursion costosa evitano la cache e moltiplicano lavoro, stato e traffico verso gli upstream.', 'Random-subdomain queries or expensive recursion bypass caches and multiply work, state, and upstream traffic.'),
    evidence: [b('QPS e latency crescenti, cache-hit ratio in calo, SERVFAIL e outstanding query.', 'Rising QPS and latency, a falling cache-hit ratio, SERVFAIL responses, and outstanding queries.'), b('Nomi ad alta entropia, domini concentrati o recursion da client non autorizzati.', 'High-entropy names, concentrated domains, or recursion from unauthorized clients.')],
    controls: [b('Recursion solo per client autorizzati, RRL, cache e capacity plan separati per ruolo.', 'Recursion only for authorized clients, RRL, caching, and separate capacity plans by role.'), b('Anycast o resolver ridondanti, DNS firewall e monitoring di QPS/latency/cache.', 'Anycast or redundant resolvers, DNS firewalls, and QPS/latency/cache monitoring.')],
    verification: [b('Testa risposte cached e uncached distinguendo resolver e authoritative.', 'Test cached and uncached answers while distinguishing resolver and authoritative roles.'), b('Conferma che client esterni non possano usare recursion e che RRL preservi query legittime.', 'Confirm external clients cannot use recursion and that RRL preserves legitimate queries.')],
    caveat: b('Un alto QPS può essere traffico legittimo; cache-hit ratio, nomi, client e costo per query forniscono il contesto.', 'High QPS can be legitimate; cache-hit ratio, names, clients, and per-query cost provide context.')
  },
  {
    id: 'nat-firewall-state-exhaustion', area: 'nat', domains: ['ip-services', 'security-fundamentals'], planes: ['data', 'application'], techniqueIds: ['nat-state-exhaustion', 'syn-flood'], controlIds: ['availability-capacity-protection', 'firewall-ids-ips'],
    title: b('Traduzioni NAT/PAT e state table', 'NAT/PAT translations and state tables'),
    resource: b('Porte PAT, translation slots, session table, memoria e capacità di setup delle connessioni.', 'PAT ports, translation slots, session tables, memory, and connection-setup capacity.'),
    saturationMechanism: b('Molti flussi unici o incompleti consumano porte e stato fino a impedire nuove allocazioni legittime.', 'Many unique or incomplete flows consume ports and state until legitimate new allocations fail.'),
    evidence: [b('Translation/session utilization, allocation failure e crescita delle sessioni incomplete.', 'Translation/session utilization, allocation failures, and growth in incomplete sessions.'), b('Molte tuple per pochi host, timeout lunghi o applicazioni che non chiudono le sessioni.', 'Many tuples from few hosts, long timeouts, or applications that do not close sessions.')],
    controls: [b('Limiti per host, pool adeguati, timeout per protocollo e protezione stateful.', 'Per-host limits, adequate pools, per-protocol timeouts, and stateful protection.'), b('Capacity alert prima dell’esaurimento e segmentazione dei servizi critici.', 'Capacity alerts before exhaustion and segmentation of critical services.')],
    verification: [b('Identifica la risorsa piena: porte, traduzioni, sessioni, memoria o setup rate.', 'Identify the full resource: ports, translations, sessions, memory, or setup rate.'), b('Verifica nuove sessioni legittime durante il rilascio controllato dello stato fraudolento.', 'Verify legitimate new sessions during controlled release of fraudulent state.')],
    caveat: b('Cancellare l’intera tabella ripristina spazio ma interrompe anche le sessioni sane e può produrre una nuova ondata di connessioni.', 'Clearing the entire table restores space but also breaks healthy sessions and may cause a new connection surge.')
  },
  {
    id: 'qos-queue-starvation', area: 'qos', domains: ['ip-services', 'security-fundamentals'], planes: ['data'], techniqueIds: ['qos-starvation-abuse', 'ip-spoofing'], controlIds: ['availability-capacity-protection', 'segmentation-least-reachability'],
    title: b('QoS, code e starvation del traffico critico', 'QoS, queues, and critical-traffic starvation'),
    resource: b('Buffer, scheduler, policer e banda assegnata alle classi QoS.', 'Buffers, schedulers, policers, and bandwidth assigned to QoS classes.'),
    saturationMechanism: b('Traffico marcato impropriamente o burst oltre capacità riempie una coda, consuma la priority queue o affama altre classi.', 'Improperly marked traffic or over-capacity bursts fill a queue, consume the priority queue, or starve other classes.'),
    evidence: [b('Queue depth/drop, offered rate, policer exceed e latency/jitter per classe.', 'Queue depth/drops, offered rate, policer exceeds, and per-class latency/jitter.'), b('DSCP non coerente con il trust boundary o applicazioni inattese nella priority queue.', 'DSCP inconsistent with the trust boundary or unexpected applications in the priority queue.')],
    controls: [b('Marking al trust boundary, class-map specifiche, LLQ con policer e bandwidth guarantee.', 'Marking at the trust boundary, specific class maps, LLQ policing, and bandwidth guarantees.'), b('Capacity plan, shaping sull’egress stretto e telemetria per classe.', 'Capacity planning, shaping at the constrained egress, and per-class telemetry.')],
    verification: [b('Genera traffico controllato per classe e misura drop, latency e jitter sotto congestione.', 'Generate controlled traffic per class and measure drops, latency, and jitter under congestion.'), b('Conferma che marking client non fidato venga riscritto o ignorato.', 'Confirm that marking from untrusted clients is rewritten or ignored.')],
    caveat: b('QoS gestisce la congestione ma non crea banda: sotto saturazione prolungata decide quale traffico degrada.', 'QoS manages congestion but does not create bandwidth: under sustained saturation it decides which traffic degrades.')
  }
];

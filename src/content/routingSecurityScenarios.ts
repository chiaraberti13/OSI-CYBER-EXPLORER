import type { Bilingual } from '../types';
import type { CcnaDomainId } from './securityCoverage';
import type { SecurityPlane } from './securityTaxonomy';

export type RoutingSecurityArea = 'ospf' | 'redistribution' | 'bgp' | 'fhrp' | 'source-validation' | 'copp' | 'host-routing' | 'forwarding' | 'change';

export interface RoutingSecurityScenario {
  id: string;
  area: RoutingSecurityArea;
  domains: CcnaDomainId[];
  planes: SecurityPlane[];
  techniqueIds: string[];
  controlIds: string[];
  title: Bilingual;
  normalDecision: Bilingual;
  threat: Bilingual;
  evidence: Bilingual[];
  controls: Bilingual[];
  verification: Bilingual[];
  caveat: Bilingual;
}

const b = (it: string, en: string): Bilingual => ({ it, en });

export const ROUTING_SECURITY_SCENARIOS: RoutingSecurityScenario[] = [
  {
    id: 'ospf-adjacency-lsdb', area: 'ospf', domains: ['ip-connectivity', 'security-fundamentals'], planes: ['control'], techniqueIds: ['ospf-injection', 'control-plane-protocol-flood'], controlIds: ['routing-trust-policy', 'source-validation-copp'],
    title: b('Confine di adiacenza OSPF e integrità LSDB', 'OSPF adjacency boundary and LSDB integrity'),
    normalDecision: b('Hello compatibili formano neighbor solo sui link previsti; le LSA sincronizzano la LSDB e SPF calcola i percorsi.', 'Compatible Hellos form neighbors only on intended links; LSAs synchronize the LSDB and SPF computes paths.'),
    threat: b('Un neighbor non autorizzato o un router interno compromesso introduce LSA, default o metriche ostili oppure provoca churn della LSDB.', 'An unauthorized neighbor or compromised internal router introduces hostile LSAs, defaults, or metrics, or causes LSDB churn.'),
    evidence: [b('Nuovo Router ID, stato neighbor instabile o adjacency su interfaccia utente.', 'A new Router ID, unstable neighbor state, or an adjacency on a user-facing interface.'), b('Advertising Router inatteso, LSA age/sequence anomali e SPF frequenti.', 'An unexpected Advertising Router, abnormal LSA age/sequence, and frequent SPF runs.')],
    controls: [b('`passive-interface default`, autenticazione coerente e adiacenze solo sui transiti.', '`passive-interface default`, consistent authentication, and adjacencies only on transit links.'), b('CoPP, filtri di redistribuzione e baseline di neighbor/LSDB.', 'CoPP, redistribution filters, and neighbor/LSDB baselines.')],
    verification: [b('`show ip ospf neighbor detail`, `interface brief` e `database`.', '`show ip ospf neighbor detail`, `interface brief`, and `database`.'), b('Confronta prefissi critici, advertising router e frequenza SPF con la baseline.', 'Compare critical prefixes, advertising routers, and SPF frequency with the baseline.')],
    caveat: b('L’autenticazione prova la conoscenza della chiave, ma non impedisce a un router autorizzato e compromesso di annunciare informazioni errate.', 'Authentication proves knowledge of the key, but it does not stop an authorized compromised router from advertising incorrect information.')
  },
  {
    id: 'redistribution-default-injection', area: 'redistribution', domains: ['ip-connectivity', 'security-fundamentals'], planes: ['control', 'data'], techniqueIds: ['route-redistribution-abuse', 'ospf-injection'], controlIds: ['routing-trust-policy', 'routing-change-assurance'],
    title: b('Redistribuzione e default route injection', 'Redistribution and default-route injection'),
    normalDecision: b('La redistribuzione traduce reachability tra protocolli secondo route map, tag, metriche e prefissi esplicitamente autorizzati.', 'Redistribution translates reachability between protocols according to explicitly authorized route maps, tags, metrics, and prefixes.'),
    threat: b('Una policy ampia importa default, route interne o prefissi più specifici, creando loop, black hole o deviazione del traffico.', 'A broad policy imports defaults, internal routes, or more-specific prefixes, creating loops, black holes, or traffic diversion.'),
    evidence: [b('Route external inattese, tag mancanti e cambi dell’originating protocol.', 'Unexpected external routes, missing tags, and changes in the originating protocol.'), b('Aumento improvviso dei prefissi o default route da un ASBR non previsto.', 'A sudden prefix increase or a default route from an unexpected ASBR.')],
    controls: [b('Prefix list allowlist, route map, tagging anti-loop e metriche deterministiche.', 'Prefix-list allowlists, route maps, anti-loop tagging, and deterministic metrics.'), b('Maximum-prefix, change review e rollback della policy.', 'Maximum-prefix controls, change review, and policy rollback.')],
    verification: [b('`show ip protocols`, route external e route map counters.', '`show ip protocols`, external routes, and route-map counters.'), b('Valida origine e next hop dei prefissi consentiti e assenza di reimport loop.', 'Validate the origin and next hop of allowed prefixes and the absence of reimport loops.')],
    caveat: b('La route esiste nella RIB non significa che il percorso end-to-end o il ritorno siano corretti.', 'A route existing in the RIB does not mean the end-to-end or return path is correct.')
  },
  {
    id: 'bgp-origin-policy', area: 'bgp', domains: ['ip-connectivity', 'security-fundamentals'], planes: ['control', 'data'], techniqueIds: ['bgp-hijack', 'control-plane-protocol-flood'], controlIds: ['routing-trust-policy', 'routing-change-assurance', 'telemetry-independent-evidence'],
    title: b('Policy BGP, RPKI e maximum-prefix', 'BGP policy, RPKI, and maximum-prefix'),
    normalDecision: b('BGP seleziona percorsi mediante attributi e policy locale; i filtri stabiliscono quali prefissi accettare e annunciare a ogni peer.', 'BGP selects paths through attributes and local policy; filters determine which prefixes to accept and advertise to each peer.'),
    threat: b('Un origin AS errato, un more-specific o una route leak di massa devia traffico o esaurisce risorse di controllo.', 'An incorrect origin AS, a more-specific route, or a mass route leak diverts traffic or exhausts control resources.'),
    evidence: [b('Cambio origin AS, RPKI Invalid/NotFound o più specifici improvvisi.', 'An origin-AS change, RPKI Invalid/NotFound state, or sudden more-specifics.'), b('Prefix count oltre baseline, AS_PATH inatteso e session reset per max-prefix.', 'Prefix count beyond baseline, an unexpected AS_PATH, and session reset due to max-prefix.')],
    controls: [b('Prefix/AS-path policy, maximum-prefix, bogon filtering e RPKI origin validation.', 'Prefix/AS-path policy, maximum-prefix, bogon filtering, and RPKI origin validation.'), b('Route monitoring indipendente e canale operativo con peer/upstream.', 'Independent route monitoring and an operational channel with peers/upstreams.')],
    verification: [b('Confronta received/advertised routes con policy e inventory autorizzato.', 'Compare received/advertised routes with policy and the authorized inventory.'), b('Verifica stato RPKI, origin, più specifici e vista da collector esterni.', 'Verify RPKI state, origin, more-specifics, and external collector views.')],
    caveat: b('RPKI origin validation conferma l’AS autorizzato a originare il prefisso, non valida l’intero AS_PATH né l’intento della route leak.', 'RPKI origin validation confirms the AS authorized to originate the prefix; it does not validate the full AS_PATH or the intent behind a route leak.')
  },
  {
    id: 'fhrp-gateway-role', area: 'fhrp', domains: ['network-access', 'ip-connectivity', 'ip-services'], planes: ['control', 'data'], techniqueIds: ['fhrp-gateway-takeover', 'arp-poisoning'], controlIds: ['routing-trust-policy', 'l2-first-hop-security', 'segmentation-least-reachability'],
    title: b('Ruolo FHRP e takeover del gateway', 'FHRP role and gateway takeover'),
    normalDecision: b('HSRP/VRRP elegge un gateway attivo per IP e MAC virtuali; priority, preempt e object tracking governano failover e failback.', 'HSRP/VRRP elects an active gateway for virtual IP and MAC addresses; priority, preemption, and object tracking govern failover and failback.'),
    threat: b('Messaggi FHRP falsi o configurazioni incoerenti assumono il ruolo attivo, creano split-brain o mantengono un gateway senza upstream valido.', 'Forged FHRP messages or inconsistent configuration assume the active role, create split brain, or retain a gateway without a valid upstream.'),
    evidence: [b('Cambi Active/Standby inattesi, doppio Active e virtual MAC su porte diverse.', 'Unexpected Active/Standby changes, dual Active state, and the virtual MAC on different ports.'), b('Priority/preempt diversi dalla baseline e tracking che non riduce la priorità.', 'Priority/preemption differing from baseline and tracking that does not reduce priority.')],
    controls: [b('Autenticazione dove supportata, confine Layer 2 e peer esplicitamente inventariati.', 'Authentication where supported, a Layer 2 boundary, and explicitly inventoried peers.'), b('Object tracking, configurazione simmetrica e monitoraggio dei role change.', 'Object tracking, symmetric configuration, and role-change monitoring.')],
    verification: [b('`show standby brief`/`show vrrp brief`, ARP client e MAC table.', '`show standby brief`/`show vrrp brief`, client ARP, and the MAC table.'), b('Testa failover e failback verificando anche la raggiungibilità upstream.', 'Test failover and failback while also verifying upstream reachability.')],
    caveat: b('Un gateway FHRP attivo può rispondere ai client anche quando routing, ACL o percorso upstream sono guasti.', 'An active FHRP gateway can answer clients even when routing, ACLs, or the upstream path are broken.')
  },
  {
    id: 'urpf-asymmetric-routing', area: 'source-validation', domains: ['network-fundamentals', 'ip-connectivity', 'security-fundamentals'], planes: ['data'], techniqueIds: ['ip-spoofing'], controlIds: ['source-validation-copp', 'routing-change-assurance'],
    title: b('uRPF e routing asimmetrico', 'uRPF and asymmetric routing'),
    normalDecision: b('uRPF confronta la sorgente con la RIB/FIB: strict richiede il percorso di ritorno sulla stessa interfaccia, loose richiede una route valida da qualunque interfaccia.', 'uRPF compares the source with the RIB/FIB: strict mode requires the return path on the same interface, while loose mode requires a valid route through any interface.'),
    threat: b('Sorgenti spoofate abusano di fiducia o riflessione; una modalità troppo rigida può però scartare traffico legittimo asimmetrico.', 'Spoofed sources abuse trust or reflection; an overly strict mode may instead drop legitimate asymmetric traffic.'),
    evidence: [b('Drop uRPF per sorgenti bogon/impossibili o dopo un cambio di percorso.', 'uRPF drops for bogon/impossible sources or after a path change.'), b('Traffico valido ricevuto su un edge diverso dalla best return route.', 'Valid traffic received on an edge different from the best return route.')],
    controls: [b('Strict sugli access edge deterministici; loose/ACL dove l’asimmetria è prevista.', 'Strict mode on deterministic access edges; loose mode/ACLs where asymmetry is expected.'), b('BCP 38, inventory dei prefissi e monitoraggio dei drop.', 'BCP 38, prefix inventory, and drop monitoring.')],
    verification: [b('`show ip interface` e contatori drop correlati al route lookup della sorgente.', '`show ip interface` and drop counters correlated with the source route lookup.'), b('Simula i percorsi primario, secondario e di failover prima dell’enforcement.', 'Simulate primary, secondary, and failover paths before enforcement.')],
    caveat: b('Loose uRPF riduce sorgenti non instradabili ma non prova che una sorgente instradabile appartenga davvero al mittente.', 'Loose uRPF reduces unroutable sources but does not prove that a routable source really belongs to the sender.')
  },
  {
    id: 'copp-classification', area: 'copp', domains: ['network-fundamentals', 'ip-connectivity', 'security-fundamentals'], planes: ['control', 'management'], techniqueIds: ['control-plane-protocol-flood', 'ospf-injection', 'management-plane-exposure'], controlIds: ['source-validation-copp', 'management-plane-isolation'],
    title: b('Classificazione e policing CoPP', 'CoPP classification and policing'),
    normalDecision: b('CoPP classifica il traffico puntato alla CPU del dispositivo e applica policing per proteggere routing, gestione e protocolli essenziali.', 'CoPP classifies traffic destined for the device CPU and applies policing to protect routing, management, and essential protocols.'),
    threat: b('Flood di pacchetti receive/punt/exception consuma CPU; una policy aggressiva può affamare Hello, ARP/ND o gestione legittima.', 'A flood of receive/punt/exception packets consumes CPU; an aggressive policy can starve legitimate Hellos, ARP/ND, or management traffic.'),
    evidence: [b('CPU interrupt elevata, input queue drop e classi CoPP in exceed/drop.', 'High interrupt CPU, input-queue drops, and CoPP classes in exceed/drop.'), b('Adiacenze o sessioni di gestione instabili mentre il transit forwarding resta disponibile.', 'Unstable adjacencies or management sessions while transit forwarding remains available.')],
    controls: [b('Classi separate per routing, gestione, eccezioni e default con soglie basate su baseline.', 'Separate classes for routing, management, exceptions, and default traffic with baseline-based thresholds.'), b('Infrastructure ACL e source validation prima del control plane.', 'Infrastructure ACLs and source validation before the control plane.')],
    verification: [b('`show policy-map control-plane`, CPU, queue e adiacenze durante carico controllato.', '`show policy-map control-plane`, CPU, queues, and adjacencies during controlled load.'), b('Conferma conform/exceed/drop e continuità dei protocolli critici.', 'Confirm conform/exceed/drop behavior and continuity of critical protocols.')],
    caveat: b('CoPP protegge la CPU, non la capacità del link e non filtra automaticamente il traffico transit nel data plane.', 'CoPP protects the CPU, not link capacity, and it does not automatically filter transit data-plane traffic.')
  },
  {
    id: 'icmp-redirect-host-route', area: 'host-routing', domains: ['ip-connectivity', 'security-fundamentals'], planes: ['control', 'data'], techniqueIds: ['icmp-redirect-source-route'], controlIds: ['routing-trust-policy', 'l2-first-hop-security'],
    title: b('ICMP redirect e percorso scelto dall’host', 'ICMP redirects and host-selected paths'),
    normalDecision: b('Un router può indicare a un host on-link un next hop migliore; le opzioni source route permetterebbero invece al mittente di influenzare il percorso.', 'A router may tell an on-link host about a better next hop; source-route options would instead let the sender influence the path.'),
    threat: b('Redirect falsi o IP source routing alterano il next hop e tentano di aggirare il percorso di sicurezza previsto.', 'Forged redirects or IP source routing alter the next hop and attempt to bypass the intended security path.'),
    evidence: [b('Redirect da sorgenti inattese, nuove host route e next hop diversi dal gateway.', 'Redirects from unexpected sources, new host routes, and next hops different from the gateway.'), b('Pacchetti con IP options o percorsi che evitano l’enforcement previsto.', 'Packets with IP options or paths that avoid the intended enforcement point.')],
    controls: [b('Disabilita redirect dove non necessari e mantieni IP source routing disabilitato.', 'Disable redirects where unnecessary and keep IP source routing disabled.'), b('First Hop Security, segmentazione e filtering delle opzioni anomale.', 'First Hop Security, segmentation, and filtering of abnormal options.')],
    verification: [b('`show ip interface`, capture ICMP e tabella route/cache dell’host.', '`show ip interface`, ICMP captures, and the host route/cache table.'), b('Verifica che il traffico continui ad attraversare il punto di policy atteso.', 'Verify that traffic continues to traverse the expected policy point.')],
    caveat: b('Traceroute mostra hop osservabili, ma ECMP, tunnel e filtering ICMP possono rendere il percorso incompleto o variabile.', 'Traceroute shows observable hops, but ECMP, tunnels, and ICMP filtering may make the path incomplete or variable.')
  },
  {
    id: 'rib-fib-adjacency', area: 'forwarding', domains: ['network-fundamentals', 'ip-connectivity', 'automation-programmability'], planes: ['control', 'data', 'management'], techniqueIds: ['rib-fib-programming-abuse', 'controller-compromise'], controlIds: ['routing-change-assurance', 'automation-guardrails', 'telemetry-independent-evidence'],
    title: b('Coerenza tra RIB, FIB e adjacency', 'RIB, FIB, and adjacency consistency'),
    normalDecision: b('Il control plane sceglie la route nella RIB; CEF programma la FIB e usa l’adjacency per la riscrittura Layer 2.', 'The control plane selects the route in the RIB; CEF programs the FIB and uses adjacency information for Layer 2 rewrites.'),
    threat: b('Errore software, controller compromesso o programmazione incompleta produce forwarding diverso dalla routing table visibile.', 'A software error, compromised controller, or incomplete programming produces forwarding that differs from the visible routing table.'),
    evidence: [b('Route presente in RIB ma assente/drop/punt in FIB o adjacency incomplete.', 'A route present in the RIB but absent/drop/punt in the FIB or an incomplete adjacency.'), b('Packet path diverso da next hop, interface o policy attesi.', 'A packet path different from the expected next hop, interface, or policy.')],
    controls: [b('Software validato, change control, controller RBAC e confronto RIB–FIB.', 'Validated software, change control, controller RBAC, and RIB-to-FIB comparison.'), b('Telemetria indipendente e test sintetici end-to-end.', 'Independent telemetry and end-to-end synthetic tests.')],
    verification: [b('`show ip route`, `show ip cef exact-route` e `show adjacency detail`.', '`show ip route`, `show ip cef exact-route`, and `show adjacency detail`.'), b('Confronta decisione teorica, programmazione hardware e capture sul link.', 'Compare theoretical decisions, hardware programming, and link captures.')],
    caveat: b('Una routing table corretta prova l’intento del control plane, non l’effettivo inoltro hardware dei pacchetti.', 'A correct routing table proves control-plane intent, not actual hardware packet forwarding.')
  },
  {
    id: 'routing-change-convergence', area: 'change', domains: ['ip-connectivity', 'automation-programmability'], planes: ['control', 'management'], techniqueIds: ['route-redistribution-abuse', 'automation-supply-chain-drift'], controlIds: ['routing-change-assurance', 'automation-guardrails'],
    title: b('Change di routing, convergenza e rollback', 'Routing changes, convergence, and rollback'),
    normalDecision: b('Una modifica controllata applica policy a scope limitato, attende la convergenza e verifica reachability, route count e stabilità prima di espandersi.', 'A controlled change applies policy to a limited scope, waits for convergence, and verifies reachability, route count, and stability before expanding.'),
    threat: b('Una modifica automatizzata propaga route map, metriche o filtri errati su molti nodi prima che l’impatto sia osservabile.', 'An automated change propagates incorrect route maps, metrics, or filters across many nodes before impact becomes visible.'),
    evidence: [b('Route count, next hop, adjacency o latency cambiano oltre l’intento.', 'Route count, next hop, adjacencies, or latency change beyond intent.'), b('Job dichiarato SUCCESS ma stato di rete divergente o instabile.', 'A job reports SUCCESS while network state is divergent or unstable.')],
    controls: [b('Pre-check, diff, canary, pause di convergenza, stop condition e rollback testato.', 'Pre-checks, diffs, canaries, a convergence pause, stop conditions, and tested rollback.'), b('Out-of-band access e snapshot dello stato prima/dopo.', 'Out-of-band access and before/after state snapshots.')],
    verification: [b('Confronta RIB/FIB, neighbor, route count e flussi sintetici sul canary.', 'Compare RIB/FIB, neighbors, route counts, and synthetic flows on the canary.'), b('Esegui rollback controllato e prova il ritorno allo stato precedente.', 'Run a controlled rollback and prove return to the previous state.')],
    caveat: b('Il completamento del job non equivale alla convergenza né alla correttezza del data plane.', 'Job completion does not equal convergence or data-plane correctness.')
  }
];

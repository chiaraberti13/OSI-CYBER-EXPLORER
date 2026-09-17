import type { Bilingual } from '../types';
import type { CcnaDomainId } from './securityCoverage';
import type { SecurityPlane } from './securityTaxonomy';

export type InspectionArea = 'policy' | 'state' | 'nat' | 'ids-ips' | 'tuning' | 'encrypted' | 'evasion' | 'ha' | 'logging';

export interface InspectionScenario {
  id: string;
  area: InspectionArea;
  domains: CcnaDomainId[];
  planes: SecurityPlane[];
  techniqueIds: string[];
  controlIds: string[];
  title: Bilingual;
  inspectionPath: Bilingual[];
  threat: Bilingual;
  evidence: Bilingual[];
  controls: Bilingual[];
  verification: Bilingual[];
  caveat: Bilingual;
}

const b = (it: string, en: string): Bilingual => ({ it, en });

export const INSPECTION_SCENARIOS: InspectionScenario[] = [
  {
    id: 'ordered-policy-shadowing', area: 'policy', domains: ['security-fundamentals'], planes: ['data', 'management'], techniqueIds: ['firewall-policy-shadowing', 'inter-vlan-policy-bypass'], controlIds: ['inspection-policy-assurance', 'segmentation-least-reachability'],
    title: b('Ordine delle regole, shadowing e default deny', 'Rule order, shadowing, and default deny'),
    inspectionPath: [b('Il firewall classifica zona, sorgente, destinazione, servizio, applicazione e identità.', 'The firewall classifies zone, source, destination, service, application, and identity.'), b('Applica la prima regola corrispondente o la semantica specifica della piattaforma, quindi registra l’esito.', 'It applies the first matching rule or platform-specific semantics, then records the outcome.')],
    threat: b('Regole ampie o precedenti rendono inefficaci deny più specifici e aprono percorsi non previsti tra zone.', 'Broad or earlier rules make more specific denies ineffective and open unintended paths across zones.'),
    evidence: [b('Rule hit su una policy generica mentre la regola specifica resta a zero.', 'Rule hits on a generic policy while the specific rule remains at zero.'), b('Diff tra intent dei flussi e ordine/oggetti realmente installati.', 'A difference between flow intent and the actually installed rule/object order.')],
    controls: [b('Default deny, oggetti minimi, review dello shadowing e ownership per regola.', 'Default deny, minimal objects, shadowing review, and rule ownership.'), b('Test positivi e negativi per zona, famiglia IP e direzione.', 'Positive and negative tests by zone, IP family, and direction.')],
    verification: [b('Traccia un flusso fino alla regola effettivamente colpita e ai relativi contatori.', 'Trace a flow to the actually matched rule and its counters.'), b('Verifica che la rimozione di una regola apparentemente inutilizzata non interrompa dipendenze note.', 'Verify that removing an apparently unused rule does not break known dependencies.')],
    caveat: b('Una regola senza hit può dipendere da telemetria incompleta, traffico stagionale o matching su un nodo diverso del cluster.', 'A rule with no hits may reflect incomplete telemetry, seasonal traffic, or matching on another cluster node.')
  },
  {
    id: 'stateful-asymmetric-flow', area: 'state', domains: ['network-fundamentals', 'ip-connectivity', 'security-fundamentals'], planes: ['data'], techniqueIds: ['asymmetric-state-evasion', 'session-hijack-reset'], controlIds: ['inspection-policy-assurance', 'routing-change-assurance'],
    title: b('State table, ritorno e routing asimmetrico', 'State tables, return traffic, and asymmetric routing'),
    inspectionPath: [b('Il primo pacchetto crea stato con tuple, TCP flags, timeout e policy applicata.', 'The first packet creates state with tuples, TCP flags, timeouts, and applied policy.'), b('Il traffico di ritorno deve raggiungere un nodo che possiede o condivide quello stato.', 'Return traffic must reach a node that owns or shares that state.')],
    threat: b('Asimmetria, ECMP o state sync incompleto produce drop; controlli permissivi per aggirare il problema possono creare bypass.', 'Asymmetry, ECMP, or incomplete state synchronization causes drops; permissive workarounds can create bypasses.'),
    evidence: [b('SYN visto senza SYN-ACK sullo stesso nodo, sessione incomplete o drop out-of-state.', 'A SYN seen without the SYN-ACK on the same node, incomplete sessions, or out-of-state drops.'), b('RIB/FIB e packet capture mostrano forward e return path su firewall diversi.', 'The RIB/FIB and packet captures show forward and return paths through different firewalls.')],
    controls: [b('Routing simmetrico dove richiesto, state synchronization e ownership del percorso.', 'Symmetric routing where required, state synchronization, and path ownership.'), b('Eccezioni stateless minime e documentate, mai come correzione generica.', 'Minimal documented stateless exceptions, never as a generic workaround.')],
    verification: [b('Correla session ID, tuple e capture su entrambi i nodi e direzioni.', 'Correlate session IDs, tuples, and captures on both nodes and directions.'), b('Testa failover e ECMP mantenendo sessioni esistenti e nuove connessioni.', 'Test failover and ECMP while preserving existing sessions and new connections.')],
    caveat: b('Consentire il traffico out-of-state può nascondere il problema di routing e ridurre le garanzie del firewall stateful.', 'Allowing out-of-state traffic can hide the routing problem and weaken stateful-firewall guarantees.')
  },
  {
    id: 'nat-versus-security-policy', area: 'nat', domains: ['ip-services', 'security-fundamentals'], planes: ['data'], techniqueIds: ['firewall-policy-shadowing', 'nat-state-exhaustion'], controlIds: ['inspection-policy-assurance', 'availability-capacity-protection'],
    title: b('NAT, ordine di elaborazione e autorizzazione', 'NAT, processing order, and authorization'),
    inspectionPath: [b('La piattaforma valuta policy e traduzione secondo un ordine preciso pre-NAT/post-NAT.', 'The platform evaluates policy and translation according to a precise pre-NAT/post-NAT order.'), b('La sessione conserva indirizzi originali e tradotti per forwarding, logging e ritorno.', 'The session retains original and translated addresses for forwarding, logging, and return traffic.')],
    threat: b('Oggetti sul lato sbagliato della traduzione o l’idea che NAT equivalga a firewalling espongono servizi o rompono i deny.', 'Objects on the wrong side of translation or treating NAT as firewalling exposes services or breaks denies.'),
    evidence: [b('Log con original/translated tuple diverse dall’oggetto usato nella regola.', 'Logs with original/translated tuples different from the object used in the rule.'), b('Traduzione presente ma policy hit inattesa, reverse path assente o porte esaurite.', 'A translation exists but an unexpected policy is hit, the reverse path is missing, or ports are exhausted.')],
    controls: [b('Documentazione dell’ordine operativo, oggetti coerenti e policy esplicita indipendente dal NAT.', 'Documented processing order, consistent objects, and explicit security policy independent of NAT.'), b('Test da entrambe le zone con tuple originali e tradotte annotate.', 'Tests from both zones with original and translated tuples annotated.')],
    verification: [b('Traccia sessione, NAT rule, security rule e ritorno nello stesso test.', 'Trace the session, NAT rule, security rule, and return path in one test.'), b('Conferma che rimuovere la traduzione non trasformi automaticamente un deny in allow o viceversa.', 'Confirm that removing translation does not automatically turn a deny into an allow or vice versa.')],
    caveat: b('NAT modifica indirizzi o porte, ma non costituisce da solo una decisione di autorizzazione o una protezione completa.', 'NAT changes addresses or ports but is not by itself an authorization decision or complete protection.')
  },
  {
    id: 'ids-versus-inline-ips', area: 'ids-ips', domains: ['security-fundamentals'], planes: ['data', 'application'], techniqueIds: ['network-reconnaissance', 'injection', 'ids-sensor-evasion'], controlIds: ['inspection-policy-assurance', 'firewall-ids-ips'],
    title: b('IDS fuori banda e IPS inline', 'Out-of-band IDS and inline IPS'),
    inspectionPath: [b('L’IDS riceve copie del traffico da TAP/SPAN e genera alert senza essere nel percorso.', 'An IDS receives copied traffic from a TAP/SPAN and alerts without sitting in the path.'), b('L’IPS è inline: può bloccare, ma introduce capacità, latenza e comportamento di failure.', 'An IPS is inline: it can block but introduces capacity, latency, and failure behavior.')],
    threat: b('SPAN incompleto crea blind spot; bypass, overload o fail-open dell’IPS lascia passare traffico senza enforcement atteso.', 'Incomplete SPAN creates blind spots; IPS bypass, overload, or fail-open behavior lets traffic pass without expected enforcement.'),
    evidence: [b('Differenza tra contatori interfaccia, pacchetti visti dal sensore e flussi reali.', 'Differences across interface counters, sensor-seen packets, and actual flows.'), b('Stato bypass/fail mode, packet drop del sensore o signature alert senza action.', 'Bypass/fail-mode state, sensor packet drops, or signature alerts without an action.')],
    controls: [b('TAP/SPAN dimensionato e verificato; IPS con capacity plan e bypass governato.', 'Sized and verified TAP/SPAN; IPS capacity planning and governed bypass.'), b('Health monitoring indipendente e test separati di alert e block.', 'Independent health monitoring and separate alert and block tests.')],
    verification: [b('Invia un artefatto benigno di test e conferma visibilità IDS e azione IPS attesa.', 'Send a benign test artifact and confirm IDS visibility and the expected IPS action.'), b('Confronta pacchetti ingress/egress per provare il blocco, non il solo alert.', 'Compare ingress/egress packets to prove blocking, not merely the alert.')],
    caveat: b('Un alert IDS dimostra rilevamento, non blocco; un evento IPS “drop” richiede comunque prova del percorso e del risultato.', 'An IDS alert proves detection, not blocking; an IPS “drop” event still requires path and outcome evidence.')
  },
  {
    id: 'signature-anomaly-tuning', area: 'tuning', domains: ['security-fundamentals'], planes: ['application', 'management'], techniqueIds: ['ids-sensor-evasion', 'injection'], controlIds: ['inspection-policy-assurance', 'firewall-ids-ips', 'telemetry-independent-evidence'],
    title: b('Firme, anomalie e tuning dei falsi positivi', 'Signatures, anomalies, and false-positive tuning'),
    inspectionPath: [b('Le firme cercano pattern o comportamento noto; l’analisi anomaly confronta attività e baseline.', 'Signatures look for known patterns or behavior; anomaly analysis compares activity against a baseline.'), b('Severity, confidence, asset context e policy determinano alert, reset, drop o sola osservazione.', 'Severity, confidence, asset context, and policy determine alerting, reset, drop, or observation only.')],
    threat: b('Eccezioni troppo ampie e alert fatigue eliminano visibilità; firme non aggiornate o parser incompleti lasciano falsi negativi.', 'Overly broad exceptions and alert fatigue remove visibility; stale signatures or incomplete parsers leave false negatives.'),
    evidence: [b('Signature hit per asset/flow, action applicata e packet context associato.', 'Signature hits by asset/flow, applied action, and associated packet context.'), b('Regole disabilitate, suppress senza scadenza e delta tra detection ed endpoint telemetry.', 'Disabled rules, suppression without expiry, and gaps between detection and endpoint telemetry.')],
    controls: [b('Tuning specifico per asset e direzione, owner/scadenza delle eccezioni e regression test.', 'Asset- and direction-specific tuning, ownership/expiry for exceptions, and regression tests.'), b('Aggiornamenti controllati, staged rollout e correlazione con endpoint e applicazioni.', 'Controlled updates, staged rollout, and correlation with endpoints and applications.')],
    verification: [b('Riproduci un benign true positive e un caso legittimo simile dopo ogni tuning.', 'Replay a benign true positive and a similar legitimate case after each tuning change.'), b('Conferma che la suppress riduca solo il rumore previsto senza eliminare varianti utili.', 'Confirm suppression reduces only expected noise without removing useful variants.')],
    caveat: b('Zero falsi positivi non è un obiettivo realistico e spesso segnala una copertura troppo stretta o telemetria assente.', 'Zero false positives is not a realistic goal and often signals coverage that is too narrow or missing telemetry.')
  },
  {
    id: 'encrypted-traffic-visibility', area: 'encrypted', domains: ['security-fundamentals', 'ip-services'], planes: ['data', 'application', 'identity'], techniqueIds: ['encrypted-traffic-blindness', 'tls-downgrade-cert-abuse'], controlIds: ['inspection-policy-assurance', 'cryptographic-trust'],
    title: b('Traffico cifrato, TLS inspection e privacy', 'Encrypted traffic, TLS inspection, and privacy'),
    inspectionPath: [b('Senza decryption il sensore osserva metadata come IP, SNI quando disponibile, certificato, timing e volume.', 'Without decryption, the sensor observes metadata such as IP, SNI when available, certificates, timing, and volume.'), b('Con TLS inspection un proxy termina e ricrea TLS, richiedendo CA, policy, capacità ed esclusioni governate.', 'With TLS inspection, a proxy terminates and recreates TLS, requiring a CA, policy, capacity, and governed exclusions.')],
    threat: b('Malware o esfiltrazione usano TLS per ridurre la visibilità; decryption mal gestita introduce trust e privacy risk.', 'Malware or exfiltration uses TLS to reduce visibility; poorly managed decryption introduces trust and privacy risks.'),
    evidence: [b('JA3/JA4 o fingerprint, certificati, destinazioni, volume e comportamento DNS/endpoint.', 'JA3/JA4 or other fingerprints, certificates, destinations, volume, and DNS/endpoint behavior.'), b('Percentuale decrypt/bypass, errori handshake e categorie escluse.', 'Decrypt/bypass percentage, handshake errors, and excluded categories.')],
    controls: [b('Decryption selettiva secondo rischio, privacy e normativa; endpoint/EDR per le esclusioni.', 'Selective decryption according to risk, privacy, and law; endpoint/EDR coverage for exclusions.'), b('CA protetta, trust distribuito, suite moderne e capacity plan del proxy.', 'A protected CA, distributed trust, modern suites, and proxy capacity planning.')],
    verification: [b('Conferma dal client la chain sostituita solo nei flussi previsti e la chain originale nelle esclusioni.', 'Confirm from the client that the chain is replaced only for intended flows and remains original for exclusions.'), b('Prova visibilità e policy con e senza decryption usando traffico benigno controllato.', 'Test visibility and policy with and without decryption using controlled benign traffic.')],
    caveat: b('La cifratura protegge il contenuto ma non rende il flusso benigno; la decryption aumenta visibilità ma crea un nuovo confine di fiducia.', 'Encryption protects content but does not make a flow benign; decryption improves visibility but creates a new trust boundary.')
  },
  {
    id: 'parser-normalization-evasion', area: 'evasion', domains: ['network-fundamentals', 'security-fundamentals'], planes: ['data', 'application'], techniqueIds: ['ids-sensor-evasion', 'ip-fragmentation-evasion', 'ipv6-extension-header-evasion'], controlIds: ['inspection-policy-assurance', 'firewall-ids-ips', 'dual-stack-policy-parity'],
    title: b('Evasione, frammentazione e normalizzazione', 'Evasion, fragmentation, and normalization'),
    inspectionPath: [b('Firewall, sensore e destinazione devono interpretare nello stesso modo frammenti, stream e protocolli.', 'Firewalls, sensors, and destinations must interpret fragments, streams, and protocols consistently.'), b('Normalizzazione e riassemblaggio precedono la decisione su contenuto e sessione.', 'Normalization and reassembly precede content and session decisions.')],
    threat: b('Overlap, tiny fragment, extension header o codifiche ambigue producono interpretazioni differenti e nascondono il payload.', 'Overlaps, tiny fragments, extension headers, or ambiguous encodings produce different interpretations and hide payloads.'),
    evidence: [b('Overlap/timeout, parser error, stream gap e mismatch tra evento sensore e comportamento host.', 'Overlaps/timeouts, parser errors, stream gaps, and mismatches between sensor events and host behavior.'), b('Differenze di verdict tra IPv4/IPv6 o tra nodi con versioni diverse.', 'Verdict differences across IPv4/IPv6 or nodes running different versions.')],
    controls: [b('Normalizzazione coerente, riassemblaggio stateful, parser aggiornati e policy dual-stack.', 'Consistent normalization, stateful reassembly, current parsers, and dual-stack policy.'), b('Test di regressione con campioni rappresentativi e limiti di risorsa.', 'Regression tests with representative samples and resource limits.')],
    verification: [b('Confronta capture prima/dopo il sensore e interpretazione finale dell’endpoint.', 'Compare captures before/after the sensor and the endpoint’s final interpretation.'), b('Ripeti casi equivalenti su IPv4 e IPv6 senza affidarti al solo signature hit.', 'Repeat equivalent cases over IPv4 and IPv6 without relying only on signature hits.')],
    caveat: b('Bloccare ogni frammento o extension header può interrompere traffico legittimo; la policy deve riflettere ruolo e percorso.', 'Blocking every fragment or extension header can break legitimate traffic; policy must reflect role and path.')
  },
  {
    id: 'inspection-ha-failure-mode', area: 'ha', domains: ['security-fundamentals', 'ip-connectivity'], planes: ['data', 'control', 'management'], techniqueIds: ['inline-fail-open-abuse', 'firewall-policy-shadowing'], controlIds: ['inspection-policy-assurance', 'availability-capacity-protection'],
    title: b('HA, state sync, fail-open e fail-close', 'HA, state synchronization, fail-open, and fail-close'),
    inspectionPath: [b('I peer HA sincronizzano configurazione, stato e health secondo capacità della piattaforma.', 'HA peers synchronize configuration, state, and health according to platform capabilities.'), b('Durante guasto o bypass, il design decide se preservare traffico, enforcement o entrambi parzialmente.', 'During failure or bypass, design determines whether to preserve traffic, enforcement, or both partially.')],
    threat: b('State/config drift o bypass non monitorato rende il nodo secondario più permissivo o interrompe sessioni al failover.', 'State/configuration drift or unmonitored bypass makes the secondary more permissive or breaks sessions during failover.'),
    evidence: [b('Config hash, policy version, sync status e session count divergenti.', 'Diverging configuration hashes, policy versions, sync status, and session counts.'), b('Evento fail-open/bypass, cambio active peer e flussi senza log di enforcement.', 'A fail-open/bypass event, active-peer change, and flows without enforcement logs.')],
    controls: [b('HA su failure domain distinti, sync monitorato e policy/versione equivalenti.', 'HA across distinct failure domains, monitored synchronization, and equivalent policy/version.'), b('Fail mode scelto per rischio, bypass allarmato e test periodici con traffico reale controllato.', 'Risk-based fail mode, alerted bypass, and periodic tests with controlled real traffic.')],
    verification: [b('Esegui failover controllato verificando sessioni esistenti, nuove e deny.', 'Perform a controlled failover while verifying existing sessions, new sessions, and denies.'), b('Conferma che un nodo degraded non resti nel path senza ispezione invisibile.', 'Confirm a degraded node does not remain in-path with invisible loss of inspection.')],
    caveat: b('Fail-open preserva disponibilità ma riduce enforcement; fail-close preserva il controllo ma può causare indisponibilità.', 'Fail-open preserves availability but weakens enforcement; fail-close preserves control but can cause an outage.')
  },
  {
    id: 'inspection-logging-proof', area: 'logging', domains: ['ip-services', 'security-fundamentals'], planes: ['management', 'application'], techniqueIds: ['security-log-suppression', 'syslog-manipulation'], controlIds: ['inspection-policy-assurance', 'telemetry-independent-evidence'],
    title: b('Logging, session end e prova dell’enforcement', 'Logging, session end, and enforcement proof'),
    inspectionPath: [b('Il firewall può registrare session start, end, deny, threat e modifiche di policy in tempi diversi.', 'A firewall may log session start, end, denies, threats, and policy changes at different times.'), b('Collector, NTP, buffering e retention determinano completezza e correlabilità.', 'Collectors, NTP, buffering, and retention determine completeness and correlation quality.')],
    threat: b('Log disabilitati, sampling, perdita del collector o tampering nascondono allow, deny e cambi di enforcement.', 'Disabled logging, sampling, collector loss, or tampering hides allows, denies, and enforcement changes.'),
    evidence: [b('Gap di sequence/timestamp, differenza local/remote e session end mancanti.', 'Sequence/timestamp gaps, local-versus-remote differences, and missing session-end records.'), b('Policy change senza audit o traffico osservato senza log corrispondente.', 'A policy change without audit records or observed traffic without a matching log.')],
    controls: [b('Log remoto affidabile, NTP, buffering, storage immutabile e audit amministrativo.', 'Reliable remote logging, NTP, buffering, immutable storage, and administrative auditing.'), b('Policy di logging per eventi critici e health check end-to-end del collector.', 'Logging policy for critical events and end-to-end collector health checks.')],
    verification: [b('Genera allow, deny e threat benigni e seguili da sensore a collector/SIEM.', 'Generate benign allow, deny, and threat events and trace them from sensor to collector/SIEM.'), b('Confronta log con packet capture e contatori: nessuna singola fonte prova da sola il risultato.', 'Compare logs with packet captures and counters: no single source alone proves the outcome.')],
    caveat: b('Assenza di log non prova assenza di traffico; può indicare policy, sampling, ritardo, perdita o visibilità sul nodo sbagliato.', 'Absence of logs does not prove absence of traffic; it may indicate policy, sampling, delay, loss, or visibility on the wrong node.')
  }
];

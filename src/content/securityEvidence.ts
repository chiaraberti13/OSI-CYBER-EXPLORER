import type { Bilingual } from '../types';
import type { CcnaDomainId } from './securityCoverage';
import type { SecurityPlane } from './securityTaxonomy';

export type EvidenceSeverity = 'context' | 'warning' | 'critical';

export interface EvidenceAnnotation {
  line: number;
  severity: EvidenceSeverity;
  label: Bilingual;
  meaning: Bilingual;
}

export interface SecurityEvidenceCase {
  id: string;
  title: Bilingual;
  source: string;
  command: string;
  domains: CcnaDomainId[];
  plane: SecurityPlane;
  context: Bilingual;
  output: string[];
  annotations: EvidenceAnnotation[];
  correlate: Bilingual[];
  limitation: Bilingual;
}

const b = (it: string, en: string): Bilingual => ({ it, en });
const a = (line: number, severity: EvidenceSeverity, label: Bilingual, meaning: Bilingual): EvidenceAnnotation => ({ line, severity, label, meaning });

export const SECURITY_EVIDENCE_CASES: SecurityEvidenceCase[] = [
  {
    id: 'physical-interface-errors', title: b('Errori fisici e duplex', 'Physical and duplex errors'), source: 'Cisco IOS', command: 'show interfaces gigabitEthernet0/1', domains: ['network-fundamentals'], plane: 'physical',
    context: b('Un collegamento presenta throughput instabile e ritrasmissioni.', 'A link shows unstable throughput and retransmissions.'),
    output: ['GigabitEthernet0/1 is up, line protocol is up', '  MTU 1500 bytes, BW 1000000 Kbit/sec, DLY 10 usec', '  Full-duplex, 1000Mb/s, media type is RJ45', '  5 minute input rate 870000000 bits/sec, 94000 packets/sec', '  18422 input errors, 17301 CRC, 0 frame, 0 overrun', '  921 late collisions, 0 deferred, 0 lost carrier'],
    annotations: [a(1, 'context', b('Stato operativo', 'Operational state'), b('Up/up conferma connettività, non qualità del mezzo.', 'Up/up confirms connectivity, not media quality.')), a(5, 'critical', b('CRC elevati', 'High CRC count'), b('Indica corruzione Layer 1: cablaggio, transceiver, interferenza o porta.', 'Indicates Layer 1 corruption: cabling, transceiver, interference, or port.')), a(6, 'warning', b('Late collision', 'Late collision'), b('Su full-duplex è anomala e suggerisce mismatch o problema fisico.', 'It is abnormal on full duplex and suggests a mismatch or physical fault.'))],
    correlate: [b('Confronta errori e duplex su entrambe le estremità.', 'Compare errors and duplex on both ends.'), b('Verifica DOM/transceiver, cavo e andamento temporale dei contatori.', 'Check DOM/transceiver data, cable, and counter trends over time.')],
    limitation: b('Un contatore cumulativo non prova che l’errore sia ancora attivo: serve un delta temporale.', 'A cumulative counter does not prove the fault is still active: a time delta is required.')
  },
  {
    id: 'dai-arp-evidence', title: b('ARP spoofing e Dynamic ARP Inspection', 'ARP spoofing and Dynamic ARP Inspection'), source: 'Cisco IOS', command: 'show ip arp inspection statistics', domains: ['network-access'], plane: 'data',
    context: b('Client della VLAN 20 segnalano cambi improvvisi del MAC del gateway.', 'Clients in VLAN 20 report sudden gateway MAC changes.'),
    output: ['Vlan      Forwarded        Dropped     DHCP Drops   ACL Drops', '----      ---------        -------     ----------   ---------', '  20          182440            317            317           0', '  30           92201              0              0           0', 'Interface Gi1/0/18: rate 14 pps, 301 validation failures', '%SW_DAI-4-DHCP_SNOOPING_DENY: 2 Invalid ARPs on Gi1/0/18'],
    annotations: [a(3, 'warning', b('Drop concentrati', 'Concentrated drops'), b('La VLAN 20 mostra ARP non coerenti con i binding DHCP Snooping.', 'VLAN 20 shows ARP inconsistent with DHCP Snooping bindings.')), a(5, 'critical', b('Porta sorgente', 'Source port'), b('Gi1/0/18 concentra failure e consente di ridurre il perimetro.', 'Gi1/0/18 concentrates failures and narrows the scope.')), a(6, 'context', b('Evento di enforcement', 'Enforcement event'), b('DAI ha bloccato frame: è evidenza di controllo, non identità certa dell’attaccante.', 'DAI blocked frames: this proves enforcement, not the attacker’s identity.'))],
    correlate: [b('Binding DHCP Snooping, MAC table e ARP dei client.', 'DHCP Snooping bindings, MAC table, and client ARP caches.'), b('Profilo NAC e inventario della porta Gi1/0/18.', 'NAC profile and inventory for port Gi1/0/18.')],
    limitation: b('Host con IP statico legittimo può produrre drop se manca una ARP ACL corretta.', 'A legitimate statically addressed host may produce drops when the proper ARP ACL is missing.')
  },
  {
    id: 'ospf-neighbor-instability', title: b('Instabilità delle adiacenze OSPF', 'OSPF adjacency instability'), source: 'Cisco IOS', command: 'show ip ospf neighbor detail', domains: ['ip-connectivity'], plane: 'control',
    context: b('La rete converge ripetutamente e alcune rotte scompaiono per pochi secondi.', 'The network repeatedly reconverges and some routes disappear for a few seconds.'),
    output: ['Neighbor 10.0.0.2, interface address 10.12.0.2', '  In the area 0 via interface GigabitEthernet0/0', '  Neighbor priority is 1, State is FULL, 6 state changes', '  Dead timer due in 00:00:03', '  Neighbor is up for 00:04:12', '  Retransmission queue length 28, retransmission count 146'],
    annotations: [a(3, 'warning', b('State change', 'State changes'), b('Sei transizioni in pochi minuti indicano instabilità, non necessariamente attacco.', 'Six transitions in a few minutes indicate instability, not necessarily an attack.')), a(4, 'critical', b('Dead timer vicino a zero', 'Dead timer near zero'), b('Hello mancanti possono far cadere l’adiacenza alla prossima scadenza.', 'Missing Hellos may drop the adjacency at the next expiry.')), a(6, 'warning', b('Ritrasmissioni', 'Retransmissions'), b('Queue e counter elevati suggeriscono loss, MTU o congestione del control plane.', 'High queue and counters suggest loss, MTU issues, or control-plane congestion.'))],
    correlate: [b('Interface errors, CPU/CoPP, MTU e packet capture degli Hello.', 'Interface errors, CPU/CoPP, MTU, and Hello packet capture.'), b('LSDB e log per nuovi router ID o autenticazione fallita.', 'LSDB and logs for new router IDs or authentication failures.')],
    limitation: b('L’output del neighbor non distingue da solo guasto, misconfigurazione e LSA injection.', 'Neighbor output alone cannot distinguish a fault, misconfiguration, and LSA injection.')
  },
  {
    id: 'bgp-origin-change', title: b('Cambio dell’origine BGP', 'BGP origin change'), source: 'Route monitor', command: 'BGP update comparison', domains: ['ip-connectivity'], plane: 'control',
    context: b('Un prefisso pubblico aziendale viene osservato da un AS diverso e con maggiore specificità.', 'A corporate public prefix is observed from a different AS and with greater specificity.'),
    output: ['Baseline: 203.0.113.0/24  origin AS64520  RPKI Valid', 'Observed: 203.0.113.0/25 origin AS64599  RPKI Invalid', 'AS_PATH: 64496 64599', 'First seen: 14:32:08 UTC; collectors: 19/24', 'Traffic shift: 72% toward new origin'],
    annotations: [a(2, 'critical', b('Più specifica e invalid', 'More specific and invalid'), b('La /25 vince il longest-prefix match e l’origine non è autorizzata dal ROA.', 'The /25 wins longest-prefix match and its origin is not authorized by the ROA.')), a(4, 'context', b('Visibilità multipla', 'Multiple vantage points'), b('Più collector riducono la probabilità di un’anomalia locale.', 'Multiple collectors reduce the likelihood of a local observation artifact.')), a(5, 'warning', b('Impatto osservabile', 'Observable impact'), b('Il cambio di traffico sostiene l’ipotesi di dirottamento.', 'The traffic shift supports the diversion hypothesis.'))],
    correlate: [b('RIB ricevute dai peer, ROA/RPKI e IRR.', 'Routes received from peers, ROA/RPKI, and IRR data.'), b('NetFlow, reachability esterna e comunicazioni del provider.', 'NetFlow, external reachability, and provider communications.')],
    limitation: b('RPKI Invalid segnala incoerenza di origine/lunghezza, ma non dimostra da solo intenzionalità malevola.', 'RPKI Invalid shows an origin/length inconsistency but does not by itself prove malicious intent.')
  },
  {
    id: 'nat-exhaustion', title: b('Esaurimento delle traduzioni NAT/PAT', 'NAT/PAT translation exhaustion'), source: 'Cisco IOS', command: 'show ip nat statistics', domains: ['ip-services'], plane: 'data',
    context: b('Nuove connessioni Internet falliscono mentre quelle esistenti restano attive.', 'New Internet connections fail while existing ones remain active.'),
    output: ['Total active translations: 65512 (4096 static, 61416 dynamic; 61416 extended)', 'Peak translations: 65535, occurred 00:01:42 ago', 'Outside interfaces: GigabitEthernet0/0', 'Inside interfaces: Vlan10, Vlan20, Vlan30', 'Hits: 99824103  Misses: 128744', 'Expired translations: 781  Allocation failures: 120493'],
    annotations: [a(1, 'warning', b('Tabella quasi piena', 'Nearly full table'), b('Il numero è vicino al picco dichiarato e indica pressione sullo stato.', 'The number is near the reported peak and indicates state pressure.')), a(2, 'critical', b('Picco massimo', 'Maximum peak'), b('La capacità è stata saturata recentemente.', 'Capacity was saturated recently.')), a(6, 'critical', b('Allocation failure', 'Allocation failures'), b('Le nuove traduzioni non possono essere create: spiega il sintomo osservato.', 'New translations cannot be created: this explains the observed symptom.'))],
    correlate: [b('Top talker NetFlow, sessioni per host e timeout.', 'NetFlow top talkers, sessions per host, and timeouts.'), b('Firewall state table e rapporto SYN/SYN-ACK/ACK.', 'Firewall state table and SYN/SYN-ACK/ACK ratios.')],
    limitation: b('NAT exhaustion può derivare da crescita legittima, malware o DoS: il totale non attribuisce la causa.', 'NAT exhaustion may result from legitimate growth, malware, or DoS: the total does not attribute the cause.')
  },
  {
    id: 'aaa-ssh-accounting', title: b('Accesso amministrativo e accounting AAA', 'Administrative access and AAA accounting'), source: 'AAA / Syslog', command: 'correlated authentication timeline', domains: ['security-fundamentals', 'ip-services'], plane: 'management',
    context: b('Una configurazione cambia fuori finestra e deve essere attribuita.', 'A configuration changes outside the approved window and must be attributed.'),
    output: ['22:14:02 AUTH SUCCESS user=netops src=198.51.100.24 method=ssh', '22:14:04 AUTHOR cmd="configure terminal" privilege=15 permit', '22:14:11 ACCT cmd="no logging host 10.10.10.50" result=success', '22:14:18 ACCT cmd="username backup privilege 15 secret *****" result=success', '22:15:00 SYSLOG transport to 10.10.10.50 unavailable', '22:18:42 AUTH SUCCESS user=backup src=198.51.100.24 method=ssh'],
    annotations: [a(1, 'warning', b('Sorgente esterna', 'External source'), b('L’accesso privilegiato proviene da un indirizzo da validare rispetto alla management policy.', 'Privileged access comes from an address that must be checked against management policy.')), a(3, 'critical', b('Riduzione visibilità', 'Reduced visibility'), b('La rimozione del collector precede altre modifiche e può indicare defense evasion.', 'Removing the collector precedes other changes and may indicate defense evasion.')), a(4, 'critical', b('Nuova persistenza', 'New persistence'), b('Un account privilegiato viene creato e poi utilizzato dalla stessa sorgente.', 'A privileged account is created and then used from the same source.'))],
    correlate: [b('Change ticket, VTY ACL, VPN, IdP/MFA e command accounting completo.', 'Change ticket, VTY ACL, VPN, IdP/MFA, and complete command accounting.'), b('Configuration archive e log remoto ancora disponibile.', 'Configuration archive and any remaining remote logs.')],
    limitation: b('Un username non equivale con certezza a una persona se credenziali o sessione sono state compromesse.', 'A username does not conclusively identify a person when credentials or a session may be compromised.')
  },
  {
    id: 'vpn-certificate-trust', title: b('Fiducia del peer VPN', 'VPN peer trust'), source: 'IKEv2 / PKI', command: 'show crypto ikev2 sa detail', domains: ['security-fundamentals'], plane: 'identity',
    context: b('Il tunnel è attivo ma il peer presenta una nuova identità certificata.', 'The tunnel is active but the peer presents a newly certified identity.'),
    output: ['Session-id: 42, Status: UP-ACTIVE, IKE count: 1, CHILD count: 1', 'Remote id: vpn-branch.example.net', 'Certificate serial: 07:A9:41:CC, issuer: CN=Example-Issuing-CA-2', 'Chain validation: SUCCESS; revocation status: UNKNOWN', 'Encryption: AES-CBC-128, Integrity: SHA1, PRF: SHA1, DH group: 2', 'PFS: disabled; lifetime: 86400 seconds'],
    annotations: [a(3, 'context', b('Nuovo certificato', 'New certificate'), b('Seriale e issuer devono essere confrontati con inventario e change record.', 'Serial and issuer must be compared with inventory and change records.')), a(4, 'warning', b('Revoca sconosciuta', 'Unknown revocation'), b('Chain valida non significa che il certificato non sia stato revocato.', 'A valid chain does not mean the certificate has not been revoked.')), a(5, 'critical', b('Suite legacy', 'Legacy suite'), b('SHA-1 e DH group 2 sono parametri deboli da rimuovere secondo compatibilità e policy.', 'SHA-1 and DH group 2 are weak parameters to remove according to compatibility and policy.'))],
    correlate: [b('CRL/OCSP, inventario certificati, Certificate Transparency e change record.', 'CRL/OCSP, certificate inventory, Certificate Transparency, and change records.'), b('Configurazione del peer, rekey e contatori IPsec.', 'Peer configuration, rekeying, and IPsec counters.')],
    limitation: b('Tunnel UP e chain valida non dimostrano che il peer o l’endpoint siano affidabili.', 'An UP tunnel and valid chain do not prove the peer or endpoint is trustworthy.')
  },
  {
    id: 'automation-drift-audit', title: b('Drift e blast radius dell’automazione', 'Automation drift and blast radius'), source: 'Controller / CI audit', command: 'deployment audit diff', domains: ['automation-programmability'], plane: 'management',
    context: b('Una pipeline riuscita ha modificato più dispositivi del previsto.', 'A successful pipeline changed more devices than expected.'),
    output: ['run_id=8421 actor=svc-netauto artifact=net-policy@4f9c2a1 signature=VALID', 'scope requested=site-rome devices=12', 'scope resolved=region-emea devices=418', 'plan: +0 ~836 -0 resources; approval=auto', 'apply status=SUCCESS changed_devices=417 failed_devices=1', 'post-check drift=173 devices; rollback_test=NOT_RUN'],
    annotations: [a(1, 'context', b('Provenienza valida', 'Valid provenance'), b('La firma valida identifica l’artifact, non garantisce che la logica sia corretta.', 'A valid signature identifies the artifact; it does not guarantee correct logic.')), a(3, 'critical', b('Scope expansion', 'Scope expansion'), b('Il target risolto è molto più ampio della richiesta: definisce il blast radius.', 'The resolved target is much broader than requested and defines the blast radius.')), a(4, 'warning', b('Approvazione automatica', 'Automatic approval'), b('836 modifiche senza gate umano aumentano il rischio sistemico.', '836 changes without a human gate increase systemic risk.')), a(6, 'critical', b('Drift post-change', 'Post-change drift'), b('Success della pipeline non coincide con convergenza reale e il rollback non è stato testato.', 'Pipeline success does not equal actual convergence, and rollback was not tested.'))],
    correlate: [b('Source of truth, inventory selector, plan completo e config diff dei device.', 'Source of truth, inventory selector, full plan, and device configuration diffs.'), b('Audit token/workload, canary result e telemetria del servizio.', 'Token/workload audit, canary results, and service telemetry.')],
    limitation: b('Lo stato SUCCESS descrive il job, non la correttezza né lo stato finale della rete.', 'SUCCESS describes the job, not correctness or the network’s final state.')
  }
];

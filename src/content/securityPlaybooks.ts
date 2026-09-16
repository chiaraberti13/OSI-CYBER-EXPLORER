import type { Bilingual } from '../types';
import type { CcnaDomainId } from './securityCoverage';

export interface SecurityPlaybook {
  id: string;
  title: Bilingual;
  signal: Bilingual;
  domains: CcnaDomainId[];
  techniqueIds: string[];
  stabilize: Bilingual[];
  evidence: Bilingual[];
  contain: Bilingual[];
  recover: Bilingual[];
  validate: Bilingual[];
  pitfalls: Bilingual[];
}

const b = (it: string, en: string): Bilingual => ({ it, en });
const p = (
  id: string,
  title: Bilingual,
  signal: Bilingual,
  domains: CcnaDomainId[],
  techniqueIds: string[],
  stabilize: Bilingual[],
  evidence: Bilingual[],
  contain: Bilingual[],
  recover: Bilingual[],
  validate: Bilingual[],
  pitfalls: Bilingual[]
): SecurityPlaybook => ({ id, title, signal, domains, techniqueIds, stabilize, evidence, contain, recover, validate, pitfalls });

export const SECURITY_PLAYBOOKS: SecurityPlaybook[] = [
  p(
    'layer2-compromise',
    b('Compromissione del dominio Layer 2', 'Layer 2 domain compromise'),
    b('Gateway instabile, cambi MAC, DHCP inatteso, topology change o trunk non autorizzati.', 'Unstable gateway, MAC changes, unexpected DHCP, topology changes, or unauthorized trunks.'),
    ['network-access'],
    ['arp-poisoning', 'rogue-dhcp', 'stp-manipulation', 'vlan-switch-spoofing', 'mac-flooding'],
    [b('Identifica VLAN, switch e porte coinvolte prima di modificare STP o tabelle.', 'Identify affected VLANs, switches, and ports before changing STP or tables.'), b('Mantieni raggiungibile un percorso di gestione sicuro e fuori banda.', 'Keep a secure out-of-band management path reachable.')],
    [b('Salva CAM, ARP, DHCP Snooping binding, STP detail, trunk e contatori porta.', 'Save CAM, ARP, DHCP Snooping bindings, STP detail, trunks, and port counters.'), b('Correla timestamp e cambiamenti evitando di cancellare subito le tabelle.', 'Correlate timestamps and changes without immediately clearing tables.')],
    [b('Quarantena la porta o il segmento minimo necessario.', 'Quarantine the smallest necessary port or segment.'), b('Applica DAI, DHCP Snooping, BPDU Guard/Root Guard e modalità access esplicita solo dopo aver validato la topologia.', 'Apply DAI, DHCP Snooping, BPDU Guard/Root Guard, and explicit access mode only after validating topology.')],
    [b('Ripristina binding, root bridge e trunk autorizzati da una configurazione nota.', 'Restore bindings, the root bridge, and authorized trunks from known-good configuration.'), b('Riammetti i client per gruppi osservando nuove violazioni.', 'Readmit clients in groups while watching for new violations.')],
    [b('Verifica gateway, tabella MAC stabile, root STP previsto e assenza di Offer rogue.', 'Verify gateway reachability, a stable MAC table, the expected STP root, and no rogue Offers.'), b('Conferma che le protezioni non blocchino uplink legittimi.', 'Confirm protections do not block legitimate uplinks.')],
    [b('Non cancellare indiscriminatamente CAM/ARP: distrugge contesto e può amplificare il flooding.', 'Do not indiscriminately clear CAM/ARP: it destroys context and may amplify flooding.'), b('Non attivare BPDU Guard su link tra switch.', 'Do not enable BPDU Guard on inter-switch links.')]
  ),
  p(
    'wireless-rogue',
    b('Rogue AP, evil twin e disturbo radio', 'Rogue AP, evil twin, and radio disruption'),
    b('SSID/BSSID duplicati, deauthentication spike, certificato EAP inatteso o SNR degradato.', 'Duplicate SSIDs/BSSIDs, deauthentication spikes, an unexpected EAP certificate, or degraded SNR.'),
    ['network-access', 'security-fundamentals'],
    ['rf-jamming', 'evil-twin-deauth', 'rogue-device'],
    [b('Distingui interferenza, rogue interno ed evil twin esterno tramite WLC e spectrum analysis.', 'Distinguish interference, an internal rogue, and an external evil twin using WLC data and spectrum analysis.'), b('Proteggi un canale alternativo per utenti e attività critiche.', 'Protect an alternative channel for users and critical operations.')],
    [b('Conserva BSSID, canale, RSSI, posizione, frame management e log RADIUS.', 'Preserve BSSID, channel, RSSI, location, management frames, and RADIUS logs.'), b('Registra il certificato presentato e gli endpoint che hanno tentato la connessione.', 'Record the presented certificate and endpoints that attempted connection.')],
    [b('Blocca il rogue sul cablato se interno e usa WIPS solo secondo policy e normativa.', 'Block the rogue on the wired side if internal and use WIPS only under policy and law.'), b('Imponi PMF ed EAP-TLS con validazione del certificato server.', 'Enforce PMF and EAP-TLS with server-certificate validation.')],
    [b('Rimuovi l’apparato, ruota credenziali eventualmente esposte e aggiorna profili WLAN.', 'Remove the device, rotate possibly exposed credentials, and update WLAN profiles.'), b('Correggi progetto RF o canali se la causa è interferenza.', 'Correct RF design or channels if interference is the cause.')],
    [b('Conferma assenza del BSSID, autenticazioni valide e stabilità di retry/SNR.', 'Confirm the BSSID is absent, authentication is valid, and retries/SNR are stable.'), b('Esegui una survey nelle aree precedentemente colpite.', 'Run a survey in previously affected areas.')],
    [b('Non confondere stesso SSID con stesso dispositivo: usa BSSID, radio e posizione.', 'Do not confuse the same SSID with the same device: use BSSID, radio, and location.'), b('Non effettuare deauthentication attiva fuori da un ambiente autorizzato.', 'Do not perform active deauthentication outside an authorized environment.')]
  ),
  p(
    'routing-integrity',
    b('Perdita di integrità del routing', 'Routing integrity loss'),
    b('Neighbor churn, LSA inattesi, cambio origin-AS, rotta più specifica o next hop anomalo.', 'Neighbor churn, unexpected LSAs, origin-AS changes, a more-specific route, or an abnormal next hop.'),
    ['ip-connectivity'],
    ['ospf-injection', 'bgp-hijack', 'icmp-redirect-source-route', 'ip-spoofing'],
    [b('Determina se l’evento è locale, di redistribuzione o upstream prima di ritirare rotte.', 'Determine whether the event is local, redistribution-related, or upstream before withdrawing routes.'), b('Preserva una rotta di gestione alternativa e limita le modifiche simultanee.', 'Preserve an alternative management route and limit simultaneous changes.')],
    [b('Acquisisci RIB/FIB, LSDB, neighbor detail, configurazione e route-monitoring esterno.', 'Capture RIB/FIB, LSDB, neighbor details, configuration, and external route monitoring.'), b('Annota prefisso, origin, next hop, metriche e momento della prima variazione.', 'Record the prefix, origin, next hop, metrics, and time of the first change.')],
    [b('Filtra l’annuncio o isola l’adiacenza senza interrompere percorsi sani.', 'Filter the announcement or isolate the adjacency without disrupting healthy paths.'), b('Coordina provider e peer per hijack o route leak esterni.', 'Coordinate providers and peers for external hijacks or route leaks.')],
    [b('Ripristina autenticazione, passive-interface, prefix policy e redistribuzione note.', 'Restore known-good authentication, passive interfaces, prefix policy, and redistribution.'), b('Riconvergi gradualmente e monitora stabilità e reachability.', 'Reconverge gradually and monitor stability and reachability.')],
    [b('Confronta control plane e forwarding reale con traceroute e lookup mirati.', 'Compare the control plane and actual forwarding using targeted traceroutes and lookups.'), b('Conferma RPKI state, neighbor autorizzati e assenza di prefissi inattesi.', 'Confirm RPKI state, authorized neighbors, and no unexpected prefixes.')],
    [b('Non usare clear process come prima azione: elimina evidenze e causa riconvergenza globale.', 'Do not use clear process as the first action: it removes evidence and triggers global reconvergence.'), b('Non assumere che una RIB corretta garantisca una FIB corretta.', 'Do not assume a correct RIB guarantees a correct FIB.')]
  ),
  p(
    'service-telemetry-manipulation',
    b('Manipolazione dei servizi e della telemetria', 'Service and telemetry manipulation'),
    b('DNS incoerente, offset temporale, SNMP SET insoliti o gap nella raccolta Syslog.', 'Inconsistent DNS, time offsets, unusual SNMP SETs, or gaps in Syslog collection.'),
    ['ip-services'],
    ['dns-poisoning', 'ntp-manipulation', 'snmp-community-abuse', 'syslog-manipulation'],
    [b('Usa fonti indipendenti per DNS, tempo e log prima di fidarti della telemetria primaria.', 'Use independent DNS, time, and log sources before trusting primary telemetry.'), b('Evita correzioni temporali brusche che rendano più difficile la timeline.', 'Avoid abrupt time corrections that make the timeline harder to reconstruct.')],
    [b('Salva cache/risposte DNS, peer NTP, SNMP audit e copie remote dei log.', 'Save DNS caches/responses, NTP peers, SNMP audit data, and remote log copies.'), b('Confronta timestamp grezzi, monotonic clock e fonti esterne.', 'Compare raw timestamps, monotonic clocks, and external sources.')],
    [b('Blocca server o manager non autorizzati e forza resolver/time source approvati.', 'Block unauthorized servers or managers and enforce approved resolvers/time sources.'), b('Sospendi write SNMP non necessario e proteggi il trasporto dei log.', 'Suspend unnecessary SNMP write access and protect log transport.')],
    [b('Flusha solo cache compromesse, ruota community/credenziali e ripristina configurazioni note.', 'Flush only compromised caches, rotate communities/credentials, and restore known-good configurations.'), b('Riallinea il tempo in modo controllato e documentato.', 'Realign time in a controlled and documented manner.')],
    [b('Verifica DNSSEC, offset/stratum, utenti SNMPv3 e continuità della pipeline Syslog.', 'Verify DNSSEC, offset/stratum, SNMPv3 users, and Syslog pipeline continuity.'), b('Ricostruisci un evento campione end-to-end fino al collector.', 'Trace a sample event end to end to the collector.')],
    [b('Non considerare NAT, DNS o NTP affidabili solo perché rispondono.', 'Do not consider NAT, DNS, or NTP trustworthy merely because they respond.'), b('Non sovrascrivere i log locali prima di averne preservato una copia.', 'Do not overwrite local logs before preserving a copy.')]
  ),
  p(
    'availability-event',
    b('Saturazione e indisponibilità', 'Saturation and availability incident'),
    b('Link saturo, SYN incomplete, amplificazione UDP o esaurimento di NAT e state table.', 'A saturated link, incomplete SYNs, UDP amplification, or exhausted NAT and state tables.'),
    ['network-fundamentals', 'ip-services', 'security-fundamentals'],
    ['syn-flood', 'udp-amplification', 'nat-state-exhaustion', 'rf-jamming'],
    [b('Stabilisci quale risorsa è esaurita: banda, CPU, memoria, connessioni, traduzioni o radio.', 'Determine which resource is exhausted: bandwidth, CPU, memory, connections, translations, or radio.'), b('Proteggi gestione, DNS, autenticazione e servizi essenziali con priorità esplicite.', 'Protect management, DNS, authentication, and essential services with explicit priorities.')],
    [b('Raccogli interface rates, NetFlow, session table, code path e metriche upstream.', 'Collect interface rates, NetFlow, session tables, code paths, and upstream metrics.'), b('Misura baseline e rapporto richieste/risposte senza affidarti al solo volume.', 'Measure baselines and request/response ratios rather than relying on volume alone.')],
    [b('Applica rate limit e filtri mirati; attiva scrubbing/upstream mitigation se il link è già saturo.', 'Apply targeted rate limits and filters; enable scrubbing/upstream mitigation if the link is already saturated.'), b('Mantieni allowlist ristrette per funzioni operative indispensabili.', 'Maintain narrow allowlists for indispensable operational functions.')],
    [b('Rilascia stato fraudolento con cautela, scala la capacità e correggi servizi amplificatori.', 'Carefully release fraudulent state, scale capacity, and fix amplifier services.'), b('Riduci gradualmente le mitigazioni osservando recidive.', 'Gradually reduce mitigations while watching for recurrence.')],
    [b('Conferma latenza, loss, nuove sessioni, translation allocation e disponibilità applicativa.', 'Confirm latency, loss, new sessions, translation allocation, and application availability.'), b('Verifica che la mitigazione non abbia creato un denial of service ai client legittimi.', 'Verify the mitigation did not create a denial of service for legitimate clients.')],
    [b('Un WAF non può fermare la saturazione del link a monte.', 'A WAF cannot stop upstream link saturation.'), b('Non bloccare automaticamente grandi reti senza valutare spoofing e collateral damage.', 'Do not automatically block large networks without assessing spoofing and collateral damage.')]
  ),
  p(
    'management-credential-compromise',
    b('Compromissione di credenziali e piano di gestione', 'Credential and management-plane compromise'),
    b('Login anomali, nuovo device, fallback AAA, chiavi SSH inattese o comandi fuori profilo.', 'Abnormal logins, a new device, AAA fallback, unexpected SSH keys, or out-of-profile commands.'),
    ['security-fundamentals', 'ip-services'],
    ['credential-attacks', 'ssh-management-attacks', 'aaa-protocol-abuse', 'session-hijack-reset'],
    [b('Preserva almeno un accesso amministrativo affidabile e separato dall’identità sospetta.', 'Preserve at least one trusted administrative path separate from the suspicious identity.'), b('Determina privilegi, sessioni e dispositivi raggiunti prima del reset generalizzato.', 'Determine privileges, sessions, and reached devices before a broad reset.')],
    [b('Salva AAA/IdP, command accounting, sessioni attive, chiavi e configuration diff.', 'Save AAA/IdP data, command accounting, active sessions, keys, and configuration diffs.'), b('Costruisci la timeline dalla prima autenticazione all’ultima azione privilegiata.', 'Build the timeline from first authentication to the last privileged action.')],
    [b('Revoca sessioni e token, disabilita l’identità e limita le VTY alle sorgenti di emergenza.', 'Revoke sessions and tokens, disable the identity, and restrict VTY access to emergency sources.'), b('Isola i device modificati senza perdere console o OOB.', 'Isolate modified devices without losing console or OOB access.')],
    [b('Ruota password, chiavi, shared secret e certificati in ordine di dipendenza.', 'Rotate passwords, keys, shared secrets, and certificates in dependency order.'), b('Ripristina configurazioni validate e correggi ruoli, MFA e fallback.', 'Restore validated configurations and correct roles, MFA, and fallback behavior.')],
    [b('Testa autenticazione, autorizzazione per comando e accounting con un account controllato.', 'Test authentication, per-command authorization, and accounting with a controlled account.'), b('Verifica che non restino sessioni, chiavi o modifiche persistenti.', 'Verify no sessions, keys, or persistent changes remain.')],
    [b('Non ruotare il solo account utente se sono esposti token, chiavi o shared secret.', 'Do not rotate only the user account when tokens, keys, or shared secrets are exposed.'), b('Non rimuovere il fallback locale prima di aver testato AAA.', 'Do not remove local fallback before testing AAA.')]
  ),
  p(
    'trust-vpn-pki',
    b('Compromissione della fiducia PKI e VPN', 'PKI and VPN trust compromise'),
    b('Certificato inatteso, chain non valida, peer VPN sconosciuto o negoziazione legacy.', 'An unexpected certificate, invalid chain, unknown VPN peer, or legacy negotiation.'),
    ['security-fundamentals'],
    ['pki-trust-abuse', 'vpn-weak-crypto', 'tls-downgrade-cert-abuse'],
    [b('Distingui compromissione della chiave, emissione fraudolenta, trust-store errato e semplice scadenza.', 'Distinguish key compromise, fraudulent issuance, an incorrect trust store, and simple expiration.'), b('Mantieni un canale verificato per comunicare nuove fingerprint.', 'Maintain a verified channel for communicating new fingerprints.')],
    [b('Preserva certificato, chain, seriale, fingerprint, CT record e parametri IKE/TLS negoziati.', 'Preserve the certificate, chain, serial, fingerprint, CT record, and negotiated IKE/TLS parameters.'), b('Elenca sistemi, firme e sessioni che hanno usato la chiave sospetta.', 'List systems, signatures, and sessions that used the suspicious key.')],
    [b('Revoca il certificato, rimuovi la trust anchor o disabilita la suite senza interrompere ogni canale sicuro.', 'Revoke the certificate, remove the trust anchor, or disable the suite without breaking every secure channel.'), b('Blocca peer e tunnel non autorizzati.', 'Block unauthorized peers and tunnels.')],
    [b('Genera nuove chiavi su componente protetto, emetti certificati e distribuisci la chain corretta.', 'Generate new keys on protected hardware, issue certificates, and distribute the correct chain.'), b('Aggiorna policy IKE/TLS e trust store secondo dipendenze documentate.', 'Update IKE/TLS policy and trust stores according to documented dependencies.')],
    [b('Controlla CRL/OCSP, Certificate Transparency, nome, chain e negoziazione effettiva.', 'Check CRL/OCSP, Certificate Transparency, name, chain, and actual negotiation.'), b('Verifica rekey, PFS e raggiungibilità applicativa nel tunnel.', 'Verify rekeying, PFS, and application reachability through the tunnel.')],
    [b('La cifratura del tunnel non rende affidabile un endpoint compromesso.', 'Tunnel encryption does not make a compromised endpoint trustworthy.'), b('Non eliminare una CA radice senza mappare tutte le dipendenze.', 'Do not remove a root CA without mapping all dependencies.')]
  ),
  p(
    'automation-controller-compromise',
    b('Compromissione di controller e automazione', 'Controller and automation compromise'),
    b('Config diff estesi, token usati da workload nuovi, drift rapido o chiamate southbound anomale.', 'Broad configuration diffs, tokens used by new workloads, rapid drift, or abnormal southbound calls.'),
    ['automation-programmability'],
    ['controller-compromise', 'api-auth-token-abuse', 'automation-supply-chain-drift', 'ai-telemetry-poisoning'],
    [b('Ferma la propagazione automatica preservando uno snapshot di controller, pipeline e source of truth.', 'Stop automated propagation while preserving a snapshot of the controller, pipeline, and source of truth.'), b('Definisci il blast radius prima di eseguire rollback globali.', 'Define the blast radius before performing global rollbacks.')],
    [b('Salva audit API, token identity, artifact hash/signature, plan/diff e device config.', 'Save API audits, token identity, artifact hashes/signatures, plans/diffs, and device configurations.'), b('Confronta intento, stato controller e stato reale dei dispositivi.', 'Compare intent, controller state, and actual device state.')],
    [b('Revoca token e workload identity, isola controller/canale e blocca artifact non fidati.', 'Revoke tokens and workload identities, isolate the controller/channel, and block untrusted artifacts.'), b('Passa a change control manuale per i servizi critici.', 'Switch critical services to manual change control.')],
    [b('Ripristina artifact firmati e controller noto; esegui rollback canary prima dell’estensione.', 'Restore signed artifacts and a known-good controller; perform a canary rollback before broad rollout.'), b('Riconcilia gradualmente source of truth e dispositivi.', 'Gradually reconcile the source of truth and devices.')],
    [b('Verifica firma e provenienza, dry-run/plan, idempotenza e config diff per campione.', 'Verify signatures and provenance, dry runs/plans, idempotency, and sampled configuration diffs.'), b('Conferma che token revocati e vecchie pipeline non possano più agire.', 'Confirm revoked tokens and old pipelines can no longer act.')],
    [b('Non fidarti del solo “success” della pipeline: verifica lo stato sul dispositivo.', 'Do not trust pipeline success alone: verify state on the device.'), b('Non applicare un rollback globale prima di testare compatibilità e dipendenze.', 'Do not perform a global rollback before testing compatibility and dependencies.')]
  )
];

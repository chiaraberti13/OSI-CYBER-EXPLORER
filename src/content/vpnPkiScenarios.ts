import type { Bilingual } from '../types';
import type { CcnaDomainId } from './securityCoverage';
import type { SecurityPlane } from './securityTaxonomy';

export type VpnPkiArea = 'negotiation' | 'sa' | 'peer-auth' | 'nat-traversal' | 'selectors' | 'routing' | 'remote-access' | 'rekey-replay' | 'lifecycle';

export interface VpnPkiScenario {
  id: string;
  area: VpnPkiArea;
  domains: CcnaDomainId[];
  planes: SecurityPlane[];
  techniqueIds: string[];
  controlIds: string[];
  title: Bilingual;
  packetFlow: Bilingual[];
  threat: Bilingual;
  evidence: Bilingual[];
  controls: Bilingual[];
  verification: Bilingual[];
  caveat: Bilingual;
}

const b = (it: string, en: string): Bilingual => ({ it, en });

export const VPN_PKI_SCENARIOS: VpnPkiScenario[] = [
  {
    id: 'ikev2-negotiation-policy', area: 'negotiation', domains: ['security-fundamentals'], planes: ['control', 'identity'], techniqueIds: ['vpn-weak-crypto', 'ike-policy-downgrade'], controlIds: ['vpn-pki-assurance', 'cryptographic-trust'],
    title: b('Negoziazione IKEv2 e policy crittografica', 'IKEv2 negotiation and cryptographic policy'),
    packetFlow: [b('IKE_SA_INIT negozia cifratura, PRF, integrità, gruppo DH e scambia nonce.', 'IKE_SA_INIT negotiates encryption, PRF, integrity, and the DH group, and exchanges nonces.'), b('IKE_AUTH autentica le identità e crea la prima CHILD_SA per IPsec.', 'IKE_AUTH authenticates identities and creates the first IPsec CHILD_SA.')],
    threat: b('Proposte legacy mantenute per compatibilità permettono la selezione di algoritmi o gruppi più deboli dell’intento.', 'Legacy proposals retained for compatibility allow algorithms or groups weaker than intended to be selected.'),
    evidence: [b('Suite negoziata diversa dalla baseline oppure IKEv1 ancora accettato.', 'A negotiated suite different from baseline or IKEv1 still accepted.'), b('Failure ripetuti seguiti da una proposta legacy riuscita.', 'Repeated failures followed by a successful legacy proposal.')],
    controls: [b('IKEv2, allowlist di suite robuste e rimozione progressiva delle proposte legacy.', 'IKEv2, an allowlist of strong suites, and phased removal of legacy proposals.'), b('Policy coerente sui peer, change control e canary prima del rollout.', 'Consistent peer policy, change control, and a canary before rollout.')],
    verification: [b('Controlla la proposta realmente negoziata in `show crypto ikev2 sa detail`.', 'Check the actually negotiated proposal in `show crypto ikev2 sa detail`.'), b('Prova che un peer con sola suite non autorizzata venga rifiutato.', 'Prove that a peer offering only an unauthorized suite is rejected.')],
    caveat: b('Configurare una proposta forte non basta se una proposta debole resta negoziabile con priorità o compatibilità diverse.', 'Configuring a strong proposal is insufficient if a weak proposal remains negotiable through different priority or compatibility behavior.')
  },
  {
    id: 'ipsec-child-sa-forwarding', area: 'sa', domains: ['security-fundamentals', 'ip-connectivity'], planes: ['data', 'control'], techniqueIds: ['vpn-traffic-selector-bypass'], controlIds: ['vpn-pki-assurance', 'segmentation-least-reachability'],
    title: b('CHILD_SA, SPI e forwarding ESP', 'CHILD_SA, SPI, and ESP forwarding'),
    packetFlow: [b('Ogni direzione usa una SA unidirezionale identificata da SPI, peer e protocollo.', 'Each direction uses a unidirectional SA identified by SPI, peer, and protocol.'), b('ESP protegge il payload; contatori encrypt/decrypt dimostrano quale traffico attraversa la SA.', 'ESP protects the payload; encrypt/decrypt counters show which traffic traverses the SA.')],
    threat: b('SA parziali, selector troppo ampi o policy asimmetriche cifrano solo una direzione oppure includono traffico non autorizzato.', 'Partial SAs, overly broad selectors, or asymmetric policies encrypt only one direction or include unauthorized traffic.'),
    evidence: [b('Contatori encaps/decaps divergenti, drop o SPI senza SA corrispondente.', 'Diverging encapsulation/decapsulation counters, drops, or an SPI without a matching SA.'), b('Traffico protetto osservato fuori dai prefissi o protocolli previsti.', 'Protected traffic observed outside intended prefixes or protocols.')],
    controls: [b('Selector minimi, policy speculari, ACL/firewall dopo la decifratura e anti-spoofing.', 'Minimal selectors, symmetric policy, post-decryption ACLs/firewalls, and anti-spoofing.'), b('Baseline di SA, SPI, lifetime e contatori per entrambe le direzioni.', 'A baseline of SAs, SPIs, lifetimes, and counters in both directions.')],
    verification: [b('Genera un flusso consentito e verifica incremento encrypt e decrypt sui due peer.', 'Generate an allowed flow and verify encrypt and decrypt increments on both peers.'), b('Prova un flusso negato e conferma che non entri nella SA né superi la policy interna.', 'Test a denied flow and confirm that it neither enters the SA nor passes internal policy.')],
    caveat: b('Una IKE SA in stato UP prova il control plane, non la presenza di entrambe le IPsec SA né il forwarding end-to-end.', 'An UP IKE SA proves the control plane, not the presence of both IPsec SAs or end-to-end forwarding.')
  },
  {
    id: 'vpn-peer-authentication', area: 'peer-auth', domains: ['security-fundamentals'], planes: ['identity', 'control'], techniqueIds: ['vpn-peer-impersonation', 'pki-trust-abuse', 'vpn-weak-crypto'], controlIds: ['vpn-pki-assurance', 'cryptographic-trust', 'identity-lifecycle-session-control'],
    title: b('Autenticazione del peer: PSK o certificato', 'Peer authentication: PSK or certificate'),
    packetFlow: [b('Il peer presenta un’identità IKE e prova il possesso della PSK o della chiave privata.', 'The peer presents an IKE identity and proves possession of the PSK or private key.'), b('Con PKI si validano chain, trust anchor, nome/SAN, EKU, validità e revoca.', 'With PKI, the chain, trust anchor, name/SAN, EKU, validity, and revocation are validated.')],
    threat: b('PSK condivise, identity matching permissivo o validazione PKI incompleta consentono impersonificazione del peer.', 'Shared PSKs, permissive identity matching, or incomplete PKI validation enable peer impersonation.'),
    evidence: [b('Remote ID, issuer, seriale o fingerprint diversi dall’inventario.', 'A remote ID, issuer, serial number, or fingerprint different from inventory.'), b('Stessa PSK usata da più sedi o revocation status sconosciuto.', 'The same PSK used by multiple sites or unknown revocation status.')],
    controls: [b('Certificati unici per peer, identity matching esplicito e trust store minimo.', 'Unique per-peer certificates, explicit identity matching, and a minimal trust store.'), b('Se serve una PSK, valore unico e casuale per peer con rotazione e ownership.', 'If a PSK is required, use a unique random value per peer with rotation and ownership.')],
    verification: [b('Confronta identità IKE e certificato effettivo con inventory e change approvato.', 'Compare the actual IKE identity and certificate with inventory and the approved change.'), b('Un certificato valido per una diversa identità o EKU deve essere rifiutato.', 'A certificate valid for a different identity or EKU must be rejected.')],
    caveat: b('Chain validation SUCCESS non prova che il nome atteso coincida né che la revoca sia stata controllata con esito valido.', 'Chain validation SUCCESS does not prove that the expected name matches or that revocation was successfully checked.')
  },
  {
    id: 'vpn-nat-traversal', area: 'nat-traversal', domains: ['ip-services', 'security-fundamentals'], planes: ['data', 'control'], techniqueIds: ['vpn-weak-crypto'], controlIds: ['vpn-pki-assurance', 'segmentation-least-reachability'],
    title: b('NAT detection e IPsec NAT-T', 'NAT detection and IPsec NAT-T'),
    packetFlow: [b('IKE usa normalmente UDP/500 e rileva la presenza di NAT tra i peer.', 'IKE normally uses UDP/500 and detects NAT between peers.'), b('Con NAT-T, IKE ed ESP incapsulato in UDP passano su UDP/4500.', 'With NAT-T, IKE and UDP-encapsulated ESP use UDP/4500.')],
    threat: b('ACL troppo ampie, timeout NAT o traduzioni instabili interrompono il tunnel o espongono il servizio IKE a sorgenti non necessarie.', 'Overly broad ACLs, NAT timeouts, or unstable translations disrupt the tunnel or expose IKE to unnecessary sources.'),
    evidence: [b('Cambio frequente di mapping, keepalive mancanti o passaggio ripetuto tra UDP/500 e 4500.', 'Frequent mapping changes, missing keepalives, or repeated switching between UDP/500 and 4500.'), b('IKE scan o tentativi da sorgenti fuori dall’inventario dei peer.', 'IKE scans or attempts from sources outside the peer inventory.')],
    controls: [b('ACL per peer quando possibile, rate limit calibrato e timeout coerenti con keepalive e DPD.', 'Per-peer ACLs where possible, calibrated rate limits, and timeouts aligned with keepalives and DPD.'), b('NAT exemption o regole ordinate e documentate secondo l’architettura.', 'NAT exemption or ordered, documented rules according to the architecture.')],
    verification: [b('Conferma NAT detection, porta effettiva e stabilità del mapping durante idle e rekey.', 'Confirm NAT detection, the actual port, and mapping stability during idle periods and rekeying.'), b('Verifica che solo i flussi IKE/NAT-T necessari raggiungano il gateway.', 'Verify that only required IKE/NAT-T flows reach the gateway.')],
    caveat: b('UDP/4500 indica NAT traversal, non dimostra da solo autenticazione forte, suite corretta o traffico applicativo protetto.', 'UDP/4500 indicates NAT traversal; by itself it does not prove strong authentication, the correct suite, or protected application traffic.')
  },
  {
    id: 'vpn-traffic-selectors', area: 'selectors', domains: ['security-fundamentals', 'ip-connectivity'], planes: ['data', 'control'], techniqueIds: ['vpn-traffic-selector-bypass', 'vpn-route-policy-leak'], controlIds: ['vpn-pki-assurance', 'segmentation-least-reachability'],
    title: b('Traffic selector, crypto ACL e dominio cifrato', 'Traffic selectors, crypto ACLs, and the encryption domain'),
    packetFlow: [b('Una VPN policy-based seleziona il traffico con crypto ACL speculari.', 'A policy-based VPN selects traffic with symmetric crypto ACLs.'), b('Una VPN route-based inoltra verso una VTI, mentre firewall e routing definiscono la reachability.', 'A route-based VPN forwards toward a VTI, while firewall policy and routing define reachability.')],
    threat: b('Selector any-any, mismatch tra peer o route inattese ampliano il dominio cifrato, causano black hole o aggirano la segmentazione.', 'Any-any selectors, peer mismatches, or unexpected routes expand the encryption domain, cause black holes, or bypass segmentation.'),
    evidence: [b('Proxy ID/TS diversi tra peer, SA duplicate o selector più larghi dell’intento.', 'Different peer proxy IDs/traffic selectors, duplicate SAs, or selectors broader than intent.'), b('Route verso reti interne appresa o redistribuita attraverso la VTI senza allowlist.', 'A route to internal networks learned or redistributed through the VTI without an allowlist.')],
    controls: [b('Allowlist di prefissi/protocolli, policy speculari e review con source of truth.', 'Prefix/protocol allowlists, symmetric policy, and review against a source of truth.'), b('Firewall sulla zona tunnel e filtri di routing/redistribuzione per le VTI.', 'Firewall policy on the tunnel zone and routing/redistribution filters for VTIs.')],
    verification: [b('Confronta intent, selector negoziati, route lookup e policy hit su entrambi i peer.', 'Compare intent, negotiated selectors, route lookups, and policy hits on both peers.'), b('Costruisci una matrice di flussi consentiti e negati in entrambe le direzioni.', 'Build an allowed-and-denied flow matrix in both directions.')],
    caveat: b('Cifrare un prefisso non lo autorizza automaticamente: il tunnel protegge il trasporto, mentre firewall e segmentazione limitano l’accesso.', 'Encrypting a prefix does not automatically authorize it: the tunnel protects transport, while firewalls and segmentation restrict access.')
  },
  {
    id: 'vpn-routing-failover', area: 'routing', domains: ['ip-connectivity', 'security-fundamentals'], planes: ['control', 'data'], techniqueIds: ['vpn-route-policy-leak', 'vpn-failover-policy-drift'], controlIds: ['vpn-pki-assurance', 'routing-trust-policy', 'routing-change-assurance'],
    title: b('Routing, ritorno e failover del tunnel', 'Tunnel routing, return path, and failover'),
    packetFlow: [b('Route statiche o dinamiche scelgono il tunnel primario e quello di backup.', 'Static or dynamic routes select the primary and backup tunnel.'), b('Il percorso di ritorno deve rispettare policy, stato firewall e dominio cifrato.', 'The return path must respect policy, firewall state, and the encryption domain.')],
    threat: b('Failover incompleto, metriche errate o policy diverse sul backup creano black hole, asimmetria o accesso più permissivo.', 'Incomplete failover, incorrect metrics, or different backup policy create black holes, asymmetry, or more permissive access.'),
    evidence: [b('Tunnel backup UP ma route assente, next hop errato o selector non equivalenti.', 'A backup tunnel is UP but lacks a route, has the wrong next hop, or uses nonequivalent selectors.'), b('Ritorno fuori tunnel, RPF drop o firewall sessioni solo in una direzione.', 'Return traffic outside the tunnel, RPF drops, or one-directional firewall sessions.')],
    controls: [b('Tracking end-to-end, metriche deterministiche e policy equivalenti tra primario e backup.', 'End-to-end tracking, deterministic metrics, and equivalent policy across primary and backup.'), b('Test periodici di failover con snapshot di route, SA, policy e flussi.', 'Periodic failover tests with route, SA, policy, and flow snapshots.')],
    verification: [b('Durante il failover verifica RIB/FIB, SA, contatori e percorso di ritorno.', 'During failover, verify the RIB/FIB, SAs, counters, and return path.'), b('Conferma sia i flussi consentiti sia i deny sul tunnel di backup.', 'Confirm both allowed flows and denies over the backup tunnel.')],
    caveat: b('Tunnel e routing convergenti non provano equivalenza delle regole di sicurezza o simmetria del traffico di ritorno.', 'Converged tunnel and routing state do not prove equivalent security rules or return-path symmetry.')
  },
  {
    id: 'remote-access-split-dns', area: 'remote-access', domains: ['security-fundamentals', 'ip-services'], planes: ['data', 'identity', 'application'], techniqueIds: ['vpn-split-tunnel-pivot', 'vpn-dns-leak', 'mfa-fatigue-token-theft'], controlIds: ['vpn-pki-assurance', 'identity-lifecycle-session-control', 'segmentation-least-reachability'],
    title: b('Remote access, split tunnel e DNS', 'Remote access, split tunneling, and DNS'),
    packetFlow: [b('Il gateway autentica utente e device e assegna route, DNS e policy alla sessione.', 'The gateway authenticates the user and device and assigns routes, DNS, and policy to the session.'), b('La policy split tunnel decide quali destinazioni usano la VPN e quali l’uscita locale.', 'Split-tunnel policy decides which destinations use the VPN and which use local egress.')],
    threat: b('Un endpoint compromesso fa da pivot tra rete locale e VPN oppure query interne escono verso resolver pubblici.', 'A compromised endpoint pivots between the local network and VPN, or internal queries leak to public resolvers.'),
    evidence: [b('Route o resolver diversi dalla policy assegnata e DNS suffix incoerenti.', 'Routes or resolvers different from assigned policy and inconsistent DNS suffixes.'), b('Flussi simultanei verso reti non fidate e risorse interne durante la sessione.', 'Simultaneous flows to untrusted networks and internal resources during the session.')],
    controls: [b('Split include/exclude esplicito, DNS protetto, host firewall e posture continua.', 'Explicit split include/exclude policy, protected DNS, host firewalls, and continuous posture.'), b('MFA resistente al phishing, certificato device e autorizzazione per ruolo.', 'Phishing-resistant MFA, a device certificate, and role-based authorization.')],
    verification: [b('Controlla route, DNS, proxy e policy firewall effettive sul client.', 'Check the effective routes, DNS, proxy, and firewall policy on the client.'), b('Prova destinazioni interne, Internet e DNS prima, durante e dopo la VPN.', 'Test internal destinations, Internet access, and DNS before, during, and after VPN connection.')],
    caveat: b('Full tunnel riduce alcuni percorsi diretti ma non rende affidabile un endpoint compromesso e richiede capacità e policy egress adeguate.', 'Full tunneling reduces some direct paths but does not make a compromised endpoint trustworthy and requires adequate capacity and egress policy.')
  },
  {
    id: 'ipsec-rekey-anti-replay', area: 'rekey-replay', domains: ['security-fundamentals'], planes: ['data', 'control'], techniqueIds: ['ipsec-replay-rekey-abuse', 'replay'], controlIds: ['vpn-pki-assurance', 'cryptographic-trust'],
    title: b('Rekey, lifetime e finestra anti-replay', 'Rekeying, lifetimes, and the anti-replay window'),
    packetFlow: [b('IKE e CHILD_SA hanno lifetime separati e vengono rinnovati prima della scadenza.', 'IKE and CHILD SAs have separate lifetimes and are renewed before expiry.'), b('ESP usa sequence number e una finestra anti-replay per scartare pacchetti duplicati o troppo vecchi.', 'ESP uses sequence numbers and an anti-replay window to discard duplicate or excessively old packets.')],
    threat: b('Lifetime incoerenti o rekey instabile causano outage; replay o forte riordinamento tenta di consumare o superare la finestra.', 'Mismatched lifetimes or unstable rekeying cause outages; replay or severe reordering attempts to consume or exceed the window.'),
    evidence: [b('Rekey failure periodici, SA sovrapposte anomale o tunnel che cade a intervalli regolari.', 'Periodic rekey failures, abnormal overlapping SAs, or a tunnel dropping at regular intervals.'), b('Replay drop crescenti correlati con sequence number duplicati o traffico riordinato.', 'Increasing replay drops correlated with duplicate sequence numbers or reordered traffic.')],
    controls: [b('Lifetime compatibili, PFS secondo policy, DPD e margine di rekey adeguato.', 'Compatible lifetimes, PFS according to policy, DPD, and adequate rekey margin.'), b('Anti-replay abilitato e finestra dimensionata sulla reale variabilità del percorso.', 'Anti-replay enabled with a window sized for actual path variability.')],
    verification: [b('Osserva un rekey completo senza perdita di flussi e confronta le nuove SPI.', 'Observe a complete rekey without flow loss and compare the new SPIs.'), b('Correla replay drop con capture e caratteristiche multipath prima di classificare un attacco.', 'Correlate replay drops with captures and multipath characteristics before classifying an attack.')],
    caveat: b('Replay drop non dimostrano automaticamente un attacco: ECMP, accelerazione hardware e percorsi instabili possono riordinare pacchetti legittimi.', 'Replay drops do not automatically prove an attack: ECMP, hardware acceleration, and unstable paths can reorder legitimate packets.')
  },
  {
    id: 'vpn-pki-lifecycle-revocation', area: 'lifecycle', domains: ['security-fundamentals', 'automation-programmability'], planes: ['identity', 'management'], techniqueIds: ['pki-trust-abuse', 'certificate-enrollment-abuse', 'vpn-peer-impersonation'], controlIds: ['vpn-pki-assurance', 'identity-lifecycle-session-control', 'automation-guardrails'],
    title: b('Lifecycle PKI, revoca e sostituzione del peer', 'PKI lifecycle, revocation, and peer replacement'),
    packetFlow: [b('Enrollment assegna certificato, chiave, identità, EKU, owner e scadenza al peer.', 'Enrollment assigns a certificate, key, identity, EKU, owner, and expiry to the peer.'), b('Rinnovo e revoca devono propagarsi ai gateway e alle sessioni attive secondo policy.', 'Renewal and revocation must propagate to gateways and active sessions according to policy.')],
    threat: b('Certificati orfani, template permissivi o revoca non controllata mantengono accesso dopo compromissione o dismissione.', 'Orphaned certificates, permissive templates, or unchecked revocation preserve access after compromise or decommissioning.'),
    evidence: [b('Certificato senza owner, device dismesso ancora attivo o SAN/EKU fuori profilo.', 'A certificate without an owner, a retired device still active, or off-profile SAN/EKU values.'), b('CRL scaduta, OCSP irraggiungibile o comportamento fail-open non previsto.', 'An expired CRL, unreachable OCSP, or unexpected fail-open behavior.')],
    controls: [b('Inventory con owner/scadenza, template minimi, protezione chiavi e rinnovo controllato.', 'Inventory with ownership/expiry, minimal templates, key protection, and controlled renewal.'), b('Revoca testata end-to-end, distribuzione affidabile di CRL/OCSP e procedura break-glass.', 'End-to-end tested revocation, reliable CRL/OCSP distribution, and a break-glass procedure.')],
    verification: [b('Un peer revocato non deve creare nuove SA e le sessioni esistenti vanno gestite secondo policy.', 'A revoked peer must not create new SAs, and existing sessions must be handled according to policy.'), b('Riconcilia certificati emessi, configurati, osservati e associati ad asset attivi.', 'Reconcile issued, configured, observed certificates with active assets.')],
    caveat: b('Revocare un certificato non chiude necessariamente una SA già attiva finché il prodotto o la policy non forza una nuova validazione.', 'Revoking a certificate does not necessarily close an existing SA until the product or policy forces revalidation.')
  }
];

import type { Bilingual } from '../types';
import type { CcnaDomainId } from './securityCoverage';
import type { SecurityPlane } from './securityTaxonomy';

export type WirelessSecurityArea = 'rf' | 'rogue' | 'evil-twin' | 'management-frames' | 'personal' | 'transition' | 'enterprise' | 'infrastructure' | 'guest';

export interface WirelessSecurityScenario {
  id: string;
  area: WirelessSecurityArea;
  domains: CcnaDomainId[];
  planes: SecurityPlane[];
  techniqueIds: string[];
  controlIds: string[];
  title: Bilingual;
  normalBehavior: Bilingual;
  threat: Bilingual;
  evidence: Bilingual[];
  controls: Bilingual[];
  verification: Bilingual[];
  caveat: Bilingual;
}

const b = (it: string, en: string): Bilingual => ({ it, en });

export const WIRELESS_SECURITY_SCENARIOS: WirelessSecurityScenario[] = [
  {
    id: 'rf-interference-jamming', area: 'rf', domains: ['network-fundamentals', 'network-access'], planes: ['physical'], techniqueIds: ['rf-jamming'], controlIds: ['wireless-rf-trust-defense', 'physical-media-hardening'],
    title: b('Interferenza RF, congestione e jamming', 'RF interference, congestion, and jamming'),
    normalBehavior: b('Client e AP condividono un mezzo half-duplex; channel utilization, SNR, retry e data rate variano con distanza, ostacoli e contesa.', 'Clients and APs share a half-duplex medium; channel utilization, SNR, retries, and data rate vary with distance, obstacles, and contention.'),
    threat: b('Rumore intenzionale o non intenzionale riduce il rapporto segnale/rumore e la disponibilità senza dover decodificare frame 802.11.', 'Intentional or unintentional noise reduces signal-to-noise ratio and availability without needing to decode 802.11 frames.'),
    evidence: [b('Noise floor elevato, SNR in calo, retry e channel utilization crescenti.', 'A high noise floor, falling SNR, and rising retries and channel utilization.'), b('Energia RF senza frame Wi-Fi validi oppure molte reti co-channel.', 'RF energy without valid Wi-Fi frames or many co-channel networks.')],
    controls: [b('Site survey, piano canali/potenza, bande alternative e capacità adeguata.', 'Site surveys, channel/power planning, alternate bands, and adequate capacity.'), b('Spectrum analysis e percorso cablato alternativo per servizi critici.', 'Spectrum analysis and an alternate wired path for critical services.')],
    verification: [b('Correla statistiche WLC/AP con spectrum analyzer e posizione.', 'Correlate WLC/AP statistics with a spectrum analyzer and location.'), b('Verifica recovery cambiando canale/banda senza abbassare la sicurezza.', 'Verify recovery by changing channel/band without reducing security.')],
    caveat: b('Retry elevati non provano jamming: possono derivare da copertura, hidden node, interferenza o congestione legittima.', 'High retry rates do not prove jamming: they may result from coverage, hidden nodes, interference, or legitimate congestion.')
  },
  {
    id: 'rogue-ap-classification', area: 'rogue', domains: ['network-access', 'security-fundamentals'], planes: ['physical', 'data'], techniqueIds: ['rogue-device', 'wireless-rogue-bridge'], controlIds: ['wireless-rf-trust-defense', 'dot1x-nac', 'segmentation-least-reachability'],
    title: b('Rogue AP, neighbor e rogue on-wire', 'Rogue AP, neighbor, and on-wire rogue'),
    normalBehavior: b('WLC/WIDS osserva BSSID, SSID, canale e RSSI; la rete cablata identifica MAC, porta e VLAN dell’apparato realmente connesso.', 'The WLC/WIDS observes BSSID, SSID, channel, and RSSI; the wired network identifies the MAC, port, and VLAN of a truly connected device.'),
    threat: b('Un AP non autorizzato collegato alla LAN crea un bridge radio oltre NAC e policy; un semplice AP vicino può invece essere solo un neighbor esterno.', 'An unauthorized AP connected to the LAN creates a radio bridge around NAC and policy; a nearby AP may instead be only an external neighbor.'),
    evidence: [b('BSSID non inventariato correlato a MAC visto su una switchport interna.', 'An untracked BSSID correlated with a MAC seen on an internal switchport.'), b('SSID aziendale da radio non gestita, posizione o vendor inattesi.', 'The enterprise SSID from an unmanaged radio, unexpected location, or vendor.')],
    controls: [b('Inventario AP/BSSID, 802.1X sulle porte, Port Security e switchport inutilizzate shutdown.', 'AP/BSSID inventory, 802.1X on ports, Port Security, and shutdown unused switchports.'), b('Classificazione WIDS unita a MAC table, DHCP e NAC.', 'WIDS classification combined with MAC-table, DHCP, and NAC data.')],
    verification: [b('Confronta WLC rogue detail con `show mac address-table` e sessione NAC.', 'Compare WLC rogue details with `show mac address-table` and the NAC session.'), b('Contieni sul cablato soltanto dopo aver provato che il device è on-wire e non autorizzato.', 'Contain on the wired network only after proving the device is on-wire and unauthorized.')],
    caveat: b('Stesso SSID e RSSI elevato non dimostrano da soli che un AP sia collegato alla rete aziendale o appartenga all’organizzazione.', 'The same SSID and high RSSI alone do not prove that an AP is connected to the enterprise network or belongs to the organization.')
  },
  {
    id: 'evil-twin-eap', area: 'evil-twin', domains: ['network-access', 'security-fundamentals'], planes: ['data', 'identity'], techniqueIds: ['evil-twin-deauth', 'eap-server-certificate-bypass'], controlIds: ['wireless-rf-trust-defense', 'dot1x-nac', 'cryptographic-trust'],
    title: b('Evil twin e validazione del server EAP', 'Evil twin and EAP server validation'),
    normalBehavior: b('Il client seleziona un BSS compatibile e, con Enterprise Wi-Fi, valida identità e certificato del server durante EAP.', 'The client selects a compatible BSS and, with enterprise Wi-Fi, validates server identity and certificate during EAP.'),
    threat: b('Un AP clone usa SSID noto e segnale favorevole; un supplicant non gestito può accettare un certificato EAP rogue o chiedere all’utente di fidarsi.', 'A cloned AP uses a known SSID and favorable signal; an unmanaged supplicant may accept a rogue EAP certificate or ask the user to trust it.'),
    evidence: [b('BSSID/RSN capabilities o certificato server diversi dalla baseline.', 'BSSID/RSN capabilities or a server certificate different from baseline.'), b('Autenticazioni EAP verso infrastruttura non inventariata e prompt inattesi.', 'EAP authentications toward untracked infrastructure and unexpected prompts.')],
    controls: [b('Profilo WLAN gestito con CA, nome server ed EAP method vincolati.', 'A managed WLAN profile with pinned CA, server name, and EAP method.'), b('EAP-TLS, PMF, WIDS/WIPS e rimozione dell’auto-join a SSID non gestiti.', 'EAP-TLS, PMF, WIDS/WIPS, and removal of auto-join for unmanaged SSIDs.')],
    verification: [b('Confronta chain/SAN/EKU del certificato EAP dal client reale.', 'Compare the EAP certificate chain/SAN/EKU from the actual client.'), b('Il client deve rifiutare un server non autorizzato senza offrire override all’utente.', 'The client must reject an unauthorized server without offering a user override.')],
    caveat: b('Un SSID è un nome, non un’identità crittografica; anche il BSSID può essere falsificato.', 'An SSID is a name, not a cryptographic identity; the BSSID can also be spoofed.')
  },
  {
    id: 'pmf-management-frames', area: 'management-frames', domains: ['network-access', 'security-fundamentals'], planes: ['data'], techniqueIds: ['evil-twin-deauth', 'wireless-management-frame-abuse'], controlIds: ['wireless-rf-trust-defense'],
    title: b('Deauthentication, disassociation e PMF', 'Deauthentication, disassociation, and PMF'),
    normalBehavior: b('I frame di management coordinano associazione e roaming; 802.11w Protected Management Frames protegge frame robusti dopo l’associazione.', 'Management frames coordinate association and roaming; 802.11w Protected Management Frames protects robust frames after association.'),
    threat: b('Frame deauthentication/disassociation falsificati interrompono client o favoriscono una nuova associazione a un AP ostile.', 'Forged deauthentication/disassociation frames disrupt clients or encourage reassociation to a hostile AP.'),
    evidence: [b('Picchi di reason code, disassociazioni e roaming senza causa RF coerente.', 'Spikes in reason codes, disassociations, and roaming without a consistent RF cause.'), b('Frame non protetti verso client che dovrebbero negoziare PMF.', 'Unprotected frames targeting clients that should negotiate PMF.')],
    controls: [b('PMF required dove compatibile; WPA3 lo richiede, WPA2 può supportarlo.', 'Require PMF where compatible; WPA3 requires it, while WPA2 may support it.'), b('WIDS alerting, client profile gestiti e inventory delle capability.', 'WIDS alerting, managed client profiles, and capability inventory.')],
    verification: [b('Controlla stato PMF su WLAN e client, non soltanto nella policy configurata.', 'Check PMF state on both the WLAN and client, not only in configured policy.'), b('Correla reason code, BSSID, RSSI e timeline RADIUS/WLC.', 'Correlate reason code, BSSID, RSSI, and the RADIUS/WLC timeline.')],
    caveat: b('PMF non protegge beacon e probe come una sessione cifrata, né impedisce il jamming fisico.', 'PMF does not protect beacons and probes like an encrypted session, nor does it prevent physical jamming.')
  },
  {
    id: 'wpa2-personal-psk', area: 'personal', domains: ['network-access', 'security-fundamentals'], planes: ['data', 'identity'], techniqueIds: ['wireless-psk-compromise'], controlIds: ['wireless-rf-trust-defense', 'identity-lifecycle-session-control'],
    title: b('WPA2-Personal e rischio della PSK condivisa', 'WPA2-Personal and shared-PSK risk'),
    normalBehavior: b('Tutti i client usano la stessa passphrase per derivare materiale di chiave; il four-way handshake conferma il possesso senza trasmettere la PSK.', 'All clients use the same passphrase to derive key material; the four-way handshake confirms possession without transmitting the PSK.'),
    threat: b('Una passphrase debole o divulgata permette tentativi offline sul materiale catturato e non attribuisce l’accesso a un’identità individuale.', 'A weak or disclosed passphrase permits offline guesses against captured material and does not attribute access to an individual identity.'),
    evidence: [b('Client non inventariati che usano la WLAN dopo offboarding o condivisione della PSK.', 'Untracked clients using the WLAN after offboarding or PSK sharing.'), b('Rotazioni rare, passphrase riutilizzata e impossibilità di revocare un solo device.', 'Rare rotation, reused passphrases, and inability to revoke one device.')],
    controls: [b('Passphrase lunga e casuale, rotazione dopo esposizione e segmentazione.', 'A long random passphrase, rotation after exposure, and segmentation.'), b('Per-device PSK/PPSK dove supportato oppure WPA2/3-Enterprise con EAP-TLS.', 'Per-device PSK/PPSK where supported or WPA2/3-Enterprise with EAP-TLS.')],
    verification: [b('Riconcilia client associati con inventory e owner.', 'Reconcile associated clients with inventory and ownership.'), b('Verifica che una credenziale revocata non consenta nuova associazione.', 'Verify that a revoked credential cannot establish a new association.')],
    caveat: b('Nascondere l’SSID e filtrare MAC non rendono forte una PSK e non costituiscono autenticazione affidabile.', 'Hiding the SSID and filtering MAC addresses do not strengthen a PSK and are not reliable authentication.')
  },
  {
    id: 'wpa3-transition-mode', area: 'transition', domains: ['network-access', 'security-fundamentals'], planes: ['data', 'identity'], techniqueIds: ['wireless-transition-downgrade'], controlIds: ['wireless-rf-trust-defense', 'cryptographic-trust'],
    title: b('WPA3, SAE e transition mode', 'WPA3, SAE, and transition mode'),
    normalBehavior: b('WPA3-Personal usa SAE e PMF; transition mode permette contemporaneamente client WPA2 e WPA3 per compatibilità.', 'WPA3-Personal uses SAE and PMF; transition mode allows WPA2 and WPA3 clients simultaneously for compatibility.'),
    threat: b('La compatibilità prolungata mantiene il percorso WPA2 più debole e può indurre client legacy a usare protezioni inferiori.', 'Prolonged compatibility retains the weaker WPA2 path and may cause legacy clients to use lower protections.'),
    evidence: [b('Client capaci di WPA3 che negoziano WPA2 o PMF non required.', 'WPA3-capable clients negotiating WPA2 or PMF not required.'), b('Associazioni legacy persistenti e RSN capabilities diverse dall’intento.', 'Persistent legacy associations and RSN capabilities different from intent.')],
    controls: [b('Inventory delle capability, SSID separato temporaneo e data di fine transition mode.', 'Capability inventory, a separate temporary SSID, and an end date for transition mode.'), b('WPA3-only/PMF required per client compatibili e monitoraggio della negoziazione.', 'WPA3-only/PMF required for compatible clients and negotiation monitoring.')],
    verification: [b('Controlla cifratura, AKM e PMF negoziati per singolo client.', 'Check negotiated encryption, AKM, and PMF for each client.'), b('Rimuovi transition mode su un canary e verifica compatibilità prima del rollout.', 'Remove transition mode on a canary and verify compatibility before rollout.')],
    caveat: b('Abilitare WPA3 nel controller non prova che ogni client stia usando WPA3 se transition mode resta attivo.', 'Enabling WPA3 on the controller does not prove every client is using WPA3 while transition mode remains active.')
  },
  {
    id: 'enterprise-radius-policy', area: 'enterprise', domains: ['network-access', 'security-fundamentals'], planes: ['data', 'identity'], techniqueIds: ['nac-posture-bypass', 'aaa-protocol-abuse', 'eap-server-certificate-bypass'], controlIds: ['dot1x-nac', 'identity-lifecycle-session-control', 'wireless-rf-trust-defense'],
    title: b('WPA-Enterprise, RADIUS e policy dinamica', 'WPA-Enterprise, RADIUS, and dynamic policy'),
    normalBehavior: b('AP/WLC agisce da authenticator, RADIUS valida EAP e restituisce attributi di autorizzazione come VLAN, ACL o ruolo.', 'The AP/WLC acts as authenticator, RADIUS validates EAP, and returns authorization attributes such as a VLAN, ACL, or role.'),
    threat: b('Policy RADIUS errata, fallback permissivo o CoA non autorizzata assegna al client un segmento o privilegio scorretto.', 'Incorrect RADIUS policy, permissive fallback, or unauthorized CoA assigns the client an incorrect segment or privilege.'),
    evidence: [b('Access-Accept con attributi inattesi o authorization profile cambiato.', 'Access-Accept messages with unexpected attributes or a changed authorization profile.'), b('Fallback locale/MAB, CoA insolite e accounting incompleto.', 'Local/MAB fallback, unusual CoA, and incomplete accounting.')],
    controls: [b('Policy per identità/device, EAP-TLS, server ridondanti e CoA da sorgenti autorizzate.', 'Policy by identity/device, EAP-TLS, redundant servers, and CoA from authorized sources.'), b('Segreti unici o trasporto protetto dove supportato, accounting e least privilege.', 'Unique secrets or protected transport where supported, accounting, and least privilege.')],
    verification: [b('Correla client detail, RADIUS request/response e policy risultante.', 'Correlate client details, RADIUS requests/responses, and resulting policy.'), b('Testa identità positive/negative e failure dei server senza abbassare l’autorizzazione.', 'Test positive/negative identities and server failure without weakening authorization.')],
    caveat: b('Un Access-Accept prova la decisione RADIUS, non che VLAN/ACL/ruolo siano stati applicati correttamente nel data plane.', 'An Access-Accept proves the RADIUS decision, not that the VLAN/ACL/role was correctly applied in the data plane.')
  },
  {
    id: 'capwap-wlc-boundary', area: 'infrastructure', domains: ['network-access', 'automation-programmability', 'security-fundamentals'], planes: ['control', 'management', 'data'], techniqueIds: ['wireless-controller-capwap-abuse', 'controller-compromise'], controlIds: ['wireless-rf-trust-defense', 'management-plane-isolation', 'automation-guardrails'],
    title: b('WLC, CAPWAP e confine dell’infrastruttura', 'WLC, CAPWAP, and the infrastructure boundary'),
    normalBehavior: b('Lightweight AP e WLC usano CAPWAP per controllo e, secondo architettura, dati; discovery, join e trust determinano il controller autorizzato.', 'Lightweight APs and WLCs use CAPWAP for control and, depending on architecture, data; discovery, join, and trust determine the authorized controller.'),
    threat: b('Discovery/join verso controller non autorizzato, management WLC esposto o controller compromesso propagano WLAN e policy ostili su larga scala.', 'Discovery/join toward an unauthorized controller, exposed WLC management, or a compromised controller propagates hostile WLANs and policy at scale.'),
    evidence: [b('AP che cambia controller, join failure, certificato/trust inatteso o config push anomalo.', 'An AP changing controller, join failures, unexpected certificate/trust, or abnormal configuration pushes.'), b('CAPWAP da indirizzi non inventariati e accessi management fuori rete amministrativa.', 'CAPWAP from untracked addresses and management access outside the administrative network.')],
    controls: [b('Management segmentation, controller/AP inventory, trust/certificati e ACL CAPWAP.', 'Management segmentation, controller/AP inventory, trust/certificates, and CAPWAP ACLs.'), b('RBAC/MFA, HA, backup, change approval e audit immutabile del WLC.', 'RBAC/MFA, HA, backups, change approval, and immutable WLC auditing.')],
    verification: [b('Verifica controller primario/secondario, AP join, trust e config hash/version.', 'Verify primary/secondary controllers, AP join, trust, and configuration hash/version.'), b('Testa failover WLC e conferma che WLAN, RADIUS e segmentazione restino equivalenti.', 'Test WLC failover and confirm that WLANs, RADIUS, and segmentation remain equivalent.')],
    caveat: b('CAPWAP operativo dimostra connettività AP–controller, non correttezza di policy, autenticazione o forwarding client.', 'Operational CAPWAP proves AP-to-controller connectivity, not correct policy, authentication, or client forwarding.')
  },
  {
    id: 'guest-client-isolation', area: 'guest', domains: ['network-access', 'ip-services', 'security-fundamentals'], planes: ['data', 'application'], techniqueIds: ['wireless-client-isolation-bypass', 'dual-stack-policy-bypass'], controlIds: ['wireless-rf-trust-defense', 'segmentation-least-reachability', 'dual-stack-policy-parity'],
    title: b('Guest WLAN, client isolation e captive portal', 'Guest WLAN, client isolation, and captive portal'),
    normalBehavior: b('La WLAN guest limita client-to-client e accesso interno, fornendo DHCP/DNS e uscita Internet attraverso una zona separata.', 'The guest WLAN restricts client-to-client and internal access while providing DHCP/DNS and Internet egress through a separate zone.'),
    threat: b('Peer traffic locale, IPv6 non filtrato, bridge errato o pre-auth ACL ampia permette lateral movement o accesso interno prima/dopo il portal.', 'Local peer traffic, unfiltered IPv6, incorrect bridging, or broad pre-auth ACLs permit lateral movement or internal access before/after the portal.'),
    evidence: [b('Reachability tra client o verso RFC1918/ULA/management non prevista.', 'Unexpected reachability between clients or toward RFC1918/ULA/management space.'), b('Policy diversa tra IPv4 e IPv6 o tra stato pre-auth e post-auth.', 'Policy differences between IPv4 and IPv6 or between pre-auth and post-auth state.')],
    controls: [b('Client isolation, firewall deny verso reti interne e parità IPv4/IPv6.', 'Client isolation, firewall denies toward internal networks, and IPv4/IPv6 parity.'), b('Pre-auth ACL minima, DNS/DHCP controllati, rate limit e logging rispettoso della privacy.', 'A minimal pre-auth ACL, controlled DNS/DHCP, rate limits, and privacy-conscious logging.')],
    verification: [b('Testa client-to-client, reti interne, management, DNS e Internet su entrambe le famiglie IP.', 'Test client-to-client, internal networks, management, DNS, and Internet over both IP families.'), b('Ripeti la matrice prima e dopo autenticazione captive portal.', 'Repeat the matrix before and after captive-portal authentication.')],
    caveat: b('Il captive portal registra o accetta termini, ma non cifra da solo il traffico radio né rende affidabile il client.', 'A captive portal records or accepts terms, but it does not itself encrypt radio traffic or make the client trustworthy.')
  }
];

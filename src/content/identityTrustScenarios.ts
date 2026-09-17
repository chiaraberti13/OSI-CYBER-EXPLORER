import type { Bilingual } from '../types';
import type { CcnaDomainId } from './securityCoverage';
import type { SecurityPlane } from './securityTaxonomy';

export type IdentityTrustArea = 'device-admin' | 'network-access' | 'fallback' | 'pki' | 'remote-access' | 'privilege' | 'session' | 'lifecycle';

export interface IdentityTrustScenario {
  id: string;
  area: IdentityTrustArea;
  domains: CcnaDomainId[];
  planes: SecurityPlane[];
  techniqueIds: string[];
  controlIds: string[];
  title: Bilingual;
  trustFlow: Bilingual[];
  failureMode: Bilingual;
  evidence: Bilingual[];
  controls: Bilingual[];
  verification: Bilingual[];
  boundary: Bilingual;
}

const b = (it: string, en: string): Bilingual => ({ it, en });

export const IDENTITY_TRUST_SCENARIOS: IdentityTrustScenario[] = [
  {
    id: 'tacacs-device-administration', area: 'device-admin', domains: ['ip-services', 'security-fundamentals'], planes: ['management', 'identity'], techniqueIds: ['aaa-protocol-abuse', 'privileged-command-abuse', 'ssh-management-attacks'], controlIds: ['aaa-privileged-access', 'management-plane-isolation'],
    title: b('Amministrazione apparati con TACACS+', 'Device administration with TACACS+'),
    trustFlow: [b('SSH identifica l’amministratore sul management plane.', 'SSH identifies the administrator on the management plane.'), b('TACACS+ separa authentication, exec/command authorization e accounting.', 'TACACS+ separates authentication, exec/command authorization, and accounting.'), b('Il device applica il privilege autorizzato e invia record start/stop fuori dispositivo.', 'The device applies the authorized privilege and sends off-device start/stop records.')],
    failureMode: b('Un metodo AAA incompleto autentica l’utente ma non limita i comandi o non produce accounting attribuibile.', 'An incomplete AAA method authenticates the user but does not restrict commands or produce attributable accounting.'),
    evidence: [b('Comandi privilegiati senza record corrispondente o con identità condivisa.', 'Privileged commands without matching records or with a shared identity.'), b('Fallback locale, server timeout e cambi improvvisi del privilege level.', 'Local fallback, server timeouts, and sudden privilege-level changes.')],
    controls: [b('Account nominativi, command authorization, accounting e ruoli least privilege.', 'Named accounts, command authorization, accounting, and least-privilege roles.'), b('Management VRF/ACL, server ridondanti, segreti unici e time sync.', 'A management VRF/ACLs, redundant servers, unique secrets, and time synchronization.')],
    verification: [b('`test aaa group tacacs+`, `show aaa servers` e accesso controllato per ciascun ruolo.', '`test aaa group tacacs+`, `show aaa servers`, and controlled access for each role.'), b('Conferma allow e deny dei comandi e record accounting start/stop.', 'Confirm command allows and denies plus start/stop accounting records.')],
    boundary: b('TACACS+ protegge il payload applicativo, ma serve comunque una rete di gestione protetta e una gestione sicura dei segreti.', 'TACACS+ protects its application payload, but it still requires a protected management network and secure secret handling.')
  },
  {
    id: 'dot1x-eap-tls', area: 'network-access', domains: ['network-access', 'security-fundamentals'], planes: ['data', 'identity'], techniqueIds: ['nac-posture-bypass', 'eap-server-certificate-bypass', 'rogue-device'], controlIds: ['dot1x-nac', 'cryptographic-trust'],
    title: b('802.1X ed EAP-TLS', '802.1X and EAP-TLS'),
    trustFlow: [b('Il supplicant scambia EAPOL con lo switch o AP authenticator.', 'The supplicant exchanges EAPOL with the switch or AP authenticator.'), b('L’authenticator incapsula EAP verso il server RADIUS.', 'The authenticator encapsulates EAP toward the RADIUS server.'), b('EAP-TLS autentica certificati e RADIUS restituisce autorizzazione, VLAN o policy.', 'EAP-TLS authenticates certificates and RADIUS returns authorization, a VLAN, or policy.')],
    failureMode: b('Il client non valida CA, nome o scopo del certificato server e consegna il flusso EAP a un’infrastruttura rogue.', 'The client fails to validate the server certificate CA, name, or purpose and gives the EAP flow to rogue infrastructure.'),
    evidence: [b('Certificato server o chain diversi dal profilo distribuito.', 'A server certificate or chain different from the deployed profile.'), b('Cambio di authorization profile, VLAN dinamica o RADIUS server.', 'A change in authorization profile, dynamic VLAN, or RADIUS server.')],
    controls: [b('Profili supplicant gestiti con CA e nome server vincolati.', 'Managed supplicant profiles with pinned CA and server name.'), b('Certificati device unici, revoca, RADIUS ridondante e dynamic authorization controllata.', 'Unique device certificates, revocation, redundant RADIUS, and controlled dynamic authorization.')],
    verification: [b('`show authentication sessions details` e RADIUS live logs.', '`show authentication sessions details` and RADIUS live logs.'), b('Prova un certificato server non autorizzato: il supplicant deve rifiutarlo.', 'Test an unauthorized server certificate: the supplicant must reject it.')],
    boundary: b('802.1X controlla l’ammissione alla rete; non dimostra che l’endpoint resti integro dopo l’autenticazione.', '802.1X controls network admission; it does not prove the endpoint remains uncompromised after authentication.')
  },
  {
    id: 'mab-fallback', area: 'fallback', domains: ['network-access', 'security-fundamentals'], planes: ['data', 'identity'], techniqueIds: ['nac-posture-bypass', 'rogue-device'], controlIds: ['dot1x-nac', 'segmentation-least-reachability'],
    title: b('MAB e fallback per dispositivi senza supplicant', 'MAB and fallback for devices without a supplicant'),
    trustFlow: [b('Il device non completa 802.1X e l’authenticator usa il MAC come identificatore.', 'The device does not complete 802.1X and the authenticator uses its MAC as an identifier.'), b('RADIUS confronta il MAC con inventario e profiling.', 'RADIUS compares the MAC with inventory and profiling data.'), b('La policy assegna un segmento strettamente limitato.', 'Policy assigns a tightly restricted segment.')],
    failureMode: b('Un MAC copiato ottiene la stessa autorizzazione del dispositivo legittimo quando MAB viene trattato come autenticazione forte.', 'A copied MAC receives the same authorization as the legitimate device when MAB is treated as strong authentication.'),
    evidence: [b('Lo stesso MAC appare su porte, switch o profili diversi.', 'The same MAC appears on different ports, switches, or profiles.'), b('Aumento del fallback MAB o profiling incoerente.', 'An increase in MAB fallback or inconsistent profiling.')],
    controls: [b('MAB solo per eccezioni inventariate, con VLAN/ACL minime.', 'MAB only for inventoried exceptions, with minimal VLAN/ACL access.'), b('Profiling multiplo, Port Security e alert su cambio di posizione.', 'Multiple profiling signals, Port Security, and alerts on location changes.')],
    verification: [b('Confronta sessione, MAC table, LLDP/CDP e inventory owner.', 'Compare the session, MAC table, LLDP/CDP, and inventory owner.'), b('Verifica che il segmento MAB non raggiunga management o reti utente.', 'Verify that the MAB segment cannot reach management or user networks.')],
    boundary: b('MAB identifica un indirizzo facilmente falsificabile; non autentica una persona né prova il possesso di una chiave privata.', 'MAB identifies an easily spoofed address; it does not authenticate a person or prove possession of a private key.')
  },
  {
    id: 'aaa-outage-break-glass', area: 'fallback', domains: ['ip-services', 'security-fundamentals'], planes: ['management', 'identity'], techniqueIds: ['aaa-protocol-abuse', 'management-plane-exposure'], controlIds: ['aaa-privileged-access', 'management-plane-isolation', 'telemetry-independent-evidence'],
    title: b('Guasto AAA e accesso break-glass', 'AAA outage and break-glass access'),
    trustFlow: [b('Il device prova il gruppo AAA primario e secondario.', 'The device tries the primary and secondary AAA group.'), b('Il metodo locale viene usato soltanto quando i server non rispondono, secondo la method list.', 'The local method is used only when servers do not respond, according to the method list.'), b('L’uso break-glass genera alert, custodia dual-control e revisione successiva.', 'Break-glass use generates an alert, dual-control custody, and a subsequent review.')],
    failureMode: b('Un fallback permissivo diventa un bypass permanente; al contrario, una method list non testata può causare lockout totale.', 'A permissive fallback becomes a permanent bypass; conversely, an untested method list can cause a complete lockout.'),
    evidence: [b('Server marcati dead, timeout e autenticazioni locali fuori manutenzione.', 'Servers marked dead, timeouts, and local authentications outside maintenance.'), b('Accounting mancante proprio durante il guasto AAA.', 'Missing accounting precisely during the AAA outage.')],
    controls: [b('Due server su failure domain distinti e fallback locale ristretto.', 'Two servers in separate failure domains and restricted local fallback.'), b('Credenziale break-glass protetta, ruotata dopo l’uso e monitorata localmente/remotamente.', 'A protected break-glass credential, rotated after use, and monitored locally/remotely.')],
    verification: [b('Simula server irraggiungibile da console mantenendo una sessione di recovery.', 'Simulate an unreachable server from the console while retaining a recovery session.'), b('Verifica la differenza tra timeout/error e un esplicito reject AAA.', 'Verify the difference between timeout/error and an explicit AAA reject.')],
    boundary: b('In una method list IOS, un reject autorevole normalmente non deve trasformarsi in un tentativo locale con la stessa password.', 'In an IOS method list, an authoritative reject should not normally turn into a local attempt with the same password.')
  },
  {
    id: 'pki-validation-revocation', area: 'pki', domains: ['security-fundamentals'], planes: ['identity', 'management'], techniqueIds: ['pki-trust-abuse', 'certificate-enrollment-abuse', 'tls-downgrade-cert-abuse'], controlIds: ['cryptographic-trust', 'identity-lifecycle-session-control'],
    title: b('Validazione PKI, enrollment e revoca', 'PKI validation, enrollment, and revocation'),
    trustFlow: [b('La root CA definisce il trust anchor e firma CA subordinate vincolate.', 'The root CA defines the trust anchor and signs constrained subordinate CAs.'), b('Enrollment autorizzato lega identità, chiave pubblica, EKU e durata.', 'Authorized enrollment binds identity, public key, EKU, and lifetime.'), b('Il peer verifica chain, nome, validità, key usage e stato di revoca.', 'The peer verifies chain, name, validity, key usage, and revocation status.')],
    failureMode: b('Template permissivi, enrollment non autorizzato o revocation checking assente trasformano un certificato formalmente valido in impersonificazione.', 'Permissive templates, unauthorized enrollment, or absent revocation checking turn a formally valid certificate into impersonation.'),
    evidence: [b('Nuove emissioni fuori profilo, EKU e subject alternativi inattesi.', 'New off-profile issuances, unexpected EKUs, and subject alternative names.'), b('OCSP/CRL non raggiungibili, scaduti o ignorati dal client.', 'OCSP/CRL endpoints that are unreachable, stale, or ignored by the client.')],
    controls: [b('Template minimi, approvazione per identità sensibili e protezione HSM/TPM.', 'Minimal templates, approval for sensitive identities, and HSM/TPM protection.'), b('Inventario certificati, rinnovo controllato, revoca e trust store minimali.', 'Certificate inventory, controlled renewal, revocation, and minimal trust stores.')],
    verification: [b('Testa chain, hostname/SAN, EKU, scadenza e revoca dal client reale.', 'Test chain, hostname/SAN, EKU, expiry, and revocation from the actual client.'), b('Riconcilia emissioni CA, inventory e Certificate Transparency dove applicabile.', 'Reconcile CA issuances, inventory, and Certificate Transparency where applicable.')],
    boundary: b('La firma valida prova una catena crittografica, non che l’endpoint sia integro o che l’enrollment fosse autorizzato.', 'A valid signature proves a cryptographic chain, not that the endpoint is uncompromised or the enrollment was authorized.')
  },
  {
    id: 'remote-access-vpn', area: 'remote-access', domains: ['security-fundamentals', 'ip-services'], planes: ['data', 'identity'], techniqueIds: ['vpn-weak-crypto', 'mfa-fatigue-token-theft', 'vpn-split-tunnel-pivot'], controlIds: ['cryptographic-trust', 'identity-lifecycle-session-control', 'segmentation-least-reachability'],
    title: b('VPN remote access, MFA e split tunneling', 'Remote-access VPN, MFA, and split tunneling'),
    trustFlow: [b('Il gateway valida peer, suite crittografica e identità utente/device.', 'The gateway validates the peer, cryptographic suite, and user/device identity.'), b('MFA e postura concorrono alla decisione di autorizzazione.', 'MFA and posture contribute to the authorization decision.'), b('Policy di split/full tunnel e ACL definiscono le destinazioni raggiungibili.', 'Split/full-tunnel policy and ACLs define reachable destinations.')],
    failureMode: b('Push MFA approvati per fatigue, token/sessione rubati o split tunnel non governato creano un ponte tra rete non fidata e risorse interne.', 'MFA pushes approved through fatigue, stolen tokens/sessions, or unmanaged split tunneling create a bridge between an untrusted network and internal resources.'),
    evidence: [b('Push ripetuti, nuovi device/ASN e sessioni simultanee incompatibili.', 'Repeated pushes, new devices/ASNs, and incompatible concurrent sessions.'), b('Traffico Internet locale e interno simultaneo non coerente con la policy.', 'Simultaneous local Internet and internal traffic inconsistent with policy.')],
    controls: [b('MFA resistente al phishing, device certificate e posture check.', 'Phishing-resistant MFA, a device certificate, and posture checks.'), b('Split tunneling esplicito, DNS sicuro, segmentazione e revoca rapida della sessione.', 'Explicit split tunneling, secure DNS, segmentation, and rapid session revocation.')],
    verification: [b('Controlla suite/peer, route installate, DNS e ACL effettive sul client.', 'Check the actual suite/peer, installed routes, DNS, and ACLs on the client.'), b('Revoca una sessione di test e conferma che gateway e client la terminino.', 'Revoke a test session and confirm that the gateway and client terminate it.')],
    boundary: b('La VPN protegge il trasporto e applica accesso; non rende affidabile un endpoint già compromesso.', 'A VPN protects transport and applies access policy; it does not make an already compromised endpoint trustworthy.')
  },
  {
    id: 'privileged-session', area: 'privilege', domains: ['ip-services', 'security-fundamentals'], planes: ['management', 'identity'], techniqueIds: ['privileged-command-abuse', 'session-hijack-reset', 'credential-attacks'], controlIds: ['aaa-privileged-access', 'management-plane-isolation', 'telemetry-independent-evidence'],
    title: b('Sessioni privilegiate e autorizzazione dei comandi', 'Privileged sessions and command authorization'),
    trustFlow: [b('L’identità entra tramite jump host o PAM con MFA.', 'Identity enters through a jump host or PAM with MFA.'), b('AAA assegna ruolo e autorizza ogni comando sensibile.', 'AAA assigns a role and authorizes each sensitive command.'), b('Accounting e session recording rendono attribuibile la modifica.', 'Accounting and session recording make the change attributable.')],
    failureMode: b('Una sessione già autenticata viene riutilizzata o un ruolo ampio esegue modifiche legittime ma non autorizzate dal change.', 'An already authenticated session is reused or a broad role performs legitimate commands not authorized by the change.'),
    evidence: [b('Comandi fuori finestra, device o ticket e improvviso aumento del privilege.', 'Commands outside the window, device, or ticket and a sudden privilege increase.'), b('Sessione senza reauthentication dopo cambio di rischio o ruolo.', 'A session without reauthentication after a risk or role change.')],
    controls: [b('Just-in-time privilege, command sets, approval e session timeout.', 'Just-in-time privilege, command sets, approval, and session timeouts.'), b('Accounting immutabile, recording, ticket correlation e revoca centralizzata.', 'Immutable accounting, recording, ticket correlation, and centralized revocation.')],
    verification: [b('Prova un comando consentito e uno negato per ciascun ruolo.', 'Test one allowed and one denied command for each role.'), b('Conferma identità, timestamp, device, comando e risultato nei record.', 'Confirm identity, timestamp, device, command, and result in records.')],
    boundary: b('MFA protegge l’ingresso, ma non impedisce l’abuso di una sessione già autorizzata o di privilegi eccessivi.', 'MFA protects entry, but it does not prevent abuse of an already authorized session or excessive privileges.')
  },
  {
    id: 'session-revocation', area: 'session', domains: ['security-fundamentals', 'automation-programmability'], planes: ['identity', 'application'], techniqueIds: ['session-hijack-reset', 'replay', 'mfa-fatigue-token-theft'], controlIds: ['identity-lifecycle-session-control', 'telemetry-independent-evidence', 'aaa-privileged-access'],
    title: b('Revoca e rivalutazione della sessione', 'Session revocation and reevaluation'),
    trustFlow: [b('L’autenticazione emette una sessione o token con scope e durata definiti.', 'Authentication issues a session or token with defined scope and lifetime.'), b('Eventi di rischio, logout o cambio ruolo richiedono revoca o reauthentication.', 'Risk events, logout, or role changes require revocation or reauthentication.'), b('Gateway, applicazione e cache distribuite applicano lo stesso stato di revoca.', 'Gateways, applications, and distributed caches enforce the same revocation state.')],
    failureMode: b('Un token copiato resta valido dopo reset password, disabilitazione account o logout perché il sistema non invalida tutte le sessioni derivate.', 'A copied token remains valid after a password reset, account disablement, or logout because the system does not invalidate all derived sessions.'),
    evidence: [b('Lo stesso token appare da device, ASN o aree incompatibili.', 'The same token appears from incompatible devices, ASNs, or locations.'), b('Accessi riusciti dopo l’evento di revoca o oltre la durata prevista.', 'Successful access after the revocation event or beyond the intended lifetime.')],
    controls: [b('Token brevi, rotation, binding, introspection e revocation list.', 'Short-lived tokens, rotation, binding, introspection, and revocation lists.'), b('Rivalutazione continua del rischio e reauthentication per azioni sensibili.', 'Continuous risk reevaluation and reauthentication for sensitive actions.')],
    verification: [b('Revoca una sessione di test e prova gateway, API e applicazione senza attendere la scadenza.', 'Revoke a test session and test the gateway, API, and application without waiting for expiry.'), b('Conferma che refresh token e sessioni figlie non possano riemettere accesso.', 'Confirm that refresh tokens and child sessions cannot reissue access.')],
    boundary: b('Cambiare la password non equivale sempre a revocare tutte le sessioni: la semantica dipende dall’IdP e dall’applicazione.', 'Changing a password does not always revoke every session: semantics depend on the IdP and application.')
  },
  {
    id: 'identity-lifecycle', area: 'lifecycle', domains: ['security-fundamentals', 'automation-programmability'], planes: ['identity', 'management', 'application'], techniqueIds: ['credential-attacks', 'replay', 'api-auth-token-abuse', 'certificate-enrollment-abuse'], controlIds: ['identity-lifecycle-session-control', 'automation-guardrails', 'cryptographic-trust'],
    title: b('Lifecycle di account, chiavi, certificati e token', 'Lifecycle of accounts, keys, certificates, and tokens'),
    trustFlow: [b('Provisioning assegna identità, owner, scopo e privilegi minimi.', 'Provisioning assigns identity, owner, scope, and least privilege.'), b('Uso e rinnovo mantengono credenziali brevi, tracciabili e ruotate.', 'Use and renewal keep credentials short-lived, traceable, and rotated.'), b('Revoca e deprovisioning rimuovono accesso, sessioni e trust dipendenti.', 'Revocation and deprovisioning remove access, sessions, and dependent trust.')],
    failureMode: b('Account orfani, token senza scadenza, chiavi condivise o certificati non inventariati sopravvivono al ruolo o al sistema che li aveva richiesti.', 'Orphaned accounts, non-expiring tokens, shared keys, or untracked certificates outlive the role or system that required them.'),
    evidence: [b('Credenziali senza owner, ultimo uso o data di scadenza.', 'Credentials without an owner, last-used time, or expiry date.'), b('Uso successivo a offboarding, revoca o sostituzione del servizio.', 'Use after offboarding, revocation, or service replacement.')],
    controls: [b('Inventory centralizzato, owner obbligatorio, scadenza e rotazione automatizzata.', 'Centralized inventory, required ownership, expiry, and automated rotation.'), b('Token scoped, secret manager, revoca delle sessioni e access review periodica.', 'Scoped tokens, a secret manager, session revocation, and periodic access reviews.')],
    verification: [b('Riconcilia IdP, AAA, CA, secret store, device e applicazioni.', 'Reconcile the IdP, AAA, CA, secret store, devices, and applications.'), b('Testa deprovisioning e revoca end-to-end, inclusa la cache delle sessioni.', 'Test deprovisioning and revocation end to end, including session caches.')],
    boundary: b('Disabilitare l’account non revoca automaticamente ogni token, certificato, chiave API o sessione derivata.', 'Disabling an account does not automatically revoke every derived token, certificate, API key, or session.')
  }
];

import type { AclRule } from '../lib/securityFundamentals';
type Language = 'it' | 'en';
type Localized = Record<Language, string>;

export const ACL_RULES: AclRule[] = [
  { sequence: 10, action: 'deny', protocol: 'tcp', source: { address: '10.10.10.0', wildcard: '0.0.0.255' }, destination: { address: '0.0.0.0', wildcard: '255.255.255.255' }, destinationPort: 23, log: true },
  { sequence: 20, action: 'permit', protocol: 'tcp', source: { address: '10.10.10.0', wildcard: '0.0.0.255' }, destination: { address: '10.20.0.0', wildcard: '0.0.255.255' }, destinationPort: 443 },
  { sequence: 30, action: 'permit', protocol: 'icmp', source: { address: '0.0.0.0', wildcard: '255.255.255.255' }, destination: { address: '10.20.0.0', wildcard: '0.0.255.255' } }
];

export const ACL_IOS = [
  '10 deny tcp 10.10.10.0 0.0.0.255 any eq 23 log',
  '20 permit tcp 10.10.10.0 0.0.0.255 10.20.0.0 0.0.255.255 eq 443',
  '30 permit icmp any 10.20.0.0 0.0.255.255',
  'implicit deny ip any any'
];

export const SECURITY_FOUNDATIONS: Array<{ title: Localized; detail: Localized }> = [
  { title: { it: 'Threat · vulnerability · exploit', en: 'Threat · vulnerability · exploit' }, detail: { it: 'La minaccia può causare danno; la vulnerabilità è una debolezza; l’exploit è il metodo che la sfrutta. Una mitigation riduce probabilità o impatto, ma raramente azzera il rischio.', en: 'A threat may cause harm; a vulnerability is a weakness; an exploit is the method that abuses it. A mitigation reduces likelihood or impact but rarely removes all risk.' } },
  { title: { it: 'CIA e gestione del rischio', en: 'CIA and risk management' }, detail: { it: 'Confidentiality limita la divulgazione, Integrity protegge correttezza e autenticità, Availability mantiene servizi accessibili. Le decisioni bilanciano rischio, costo e operatività.', en: 'Confidentiality limits disclosure, Integrity protects correctness and authenticity, and Availability keeps services accessible. Decisions balance risk, cost, and operations.' } },
  { title: { it: 'Security program', en: 'Security program' }, detail: { it: 'Policy, awareness e training, controllo degli accessi fisici, asset inventory, change management, incident response e miglioramento continuo lavorano insieme.', en: 'Policies, awareness and training, physical access controls, asset inventory, change management, incident response, and continual improvement work together.' } },
  { title: { it: 'Password e autenticazione', en: 'Passwords and authentication' }, detail: { it: 'Preferisci passphrase lunghe, uniche e non prevedibili, password manager, MFA e controllo delle credenziali compromesse. Evita rotazioni arbitrarie che producono pattern deboli.', en: 'Prefer long, unique, unpredictable passphrases, password managers, MFA, and breached-credential checks. Avoid arbitrary rotation that produces weak patterns.' } },
  { title: { it: 'Sicurezza di livello 2', en: 'Layer 2 security' }, detail: { it: 'Port Security, DHCP Snooping, DAI, IP Source Guard, BPDU Guard, Root Guard e segmentazione proteggono l’access layer; ogni controllo dipende da trust boundary corrette.', en: 'Port Security, DHCP Snooping, DAI, IP Source Guard, BPDU Guard, Root Guard, and segmentation protect the access layer; each control depends on correct trust boundaries.' } }
];

export const AAA_ROWS: Array<{ property: Localized; tacacs: Localized; radius: Localized }> = [
  { property: { it: 'Uso tipico', en: 'Typical use' }, tacacs: { it: 'Amministrazione dei dispositivi', en: 'Device administration' }, radius: { it: 'Accesso alla rete, VPN e 802.1X', en: 'Network access, VPN, and 802.1X' } },
  { property: { it: 'Trasporto', en: 'Transport' }, tacacs: { it: 'TCP porta 49', en: 'TCP port 49' }, radius: { it: 'UDP 1812/1813', en: 'UDP 1812/1813' } },
  { property: { it: 'Separazione AAA', en: 'AAA separation' }, tacacs: { it: 'Authentication, authorization e accounting separabili', en: 'Authentication, authorization, and accounting can be separated' }, radius: { it: 'Authentication e authorization strettamente integrate', en: 'Authentication and authorization are closely coupled' } },
  { property: { it: 'Protezione', en: 'Protection' }, tacacs: { it: 'Cifra il body del pacchetto; header visibile', en: 'Encrypts the packet body; header remains visible' }, radius: { it: 'Tradizionalmente protegge la password, non l’intero payload', en: 'Traditionally protects the password, not the entire payload' } }
];

export const VPN_ROWS: Array<{ title: string; detail: Localized }> = [
  { title: 'Site-to-site IPsec', detail: { it: 'Collega reti attraverso un tunnel tra gateway. ESP fornisce riservatezza e può garantire integrità/autenticazione; IKE negozia SA e chiavi.', en: 'Connects networks through a tunnel between gateways. ESP provides confidentiality and can provide integrity/authentication; IKE negotiates SAs and keys.' } },
  { title: 'Remote-access VPN', detail: { it: 'Collega un singolo utente alla rete aziendale tramite IPsec o TLS. Richiede MFA, postura endpoint, autorizzazioni minime e split-tunneling valutato.', en: 'Connects an individual user to the enterprise through IPsec or TLS. It requires MFA, endpoint posture, least privilege, and an evaluated split-tunneling policy.' } },
  { title: 'GRE', detail: { it: 'Incapsula protocolli e multicast ma non cifra né autentica. GRE over IPsec aggiunge la protezione di IPsec.', en: 'Encapsulates protocols and multicast but does not encrypt or authenticate. GRE over IPsec adds IPsec protection.' } },
  { title: 'IKEv2', detail: { it: 'IKE_SA_INIT negozia algoritmi e Diffie–Hellman; IKE_AUTH autentica i peer. I CHILD_SA proteggono il traffico IPsec.', en: 'IKE_SA_INIT negotiates algorithms and Diffie–Hellman; IKE_AUTH authenticates peers. CHILD_SAs protect IPsec traffic.' } }
];

export const ENFORCEMENT_ROWS: Array<{ title: string; detail: Localized }> = [
  { title: 'Stateless ACL', detail: { it: 'Valuta ogni pacchetto con campi L3/L4 e prima corrispondenza. Non mantiene lo stato della sessione.', en: 'Evaluates each packet using L3/L4 fields and first match. It keeps no session state.' } },
  { title: 'Stateful firewall', detail: { it: 'Mantiene una state table e consente il traffico di ritorno coerente con connessioni valide.', en: 'Maintains a state table and permits return traffic consistent with valid connections.' } },
  { title: 'NGFW', detail: { it: 'Aggiunge identità, applicazioni, URL filtering, TLS inspection e threat prevention, con costi di privacy e prestazioni da gestire.', en: 'Adds identity, applications, URL filtering, TLS inspection, and threat prevention, with privacy and performance costs to manage.' } },
  { title: 'IDS / IPS', detail: { it: 'IDS osserva fuori banda e avvisa; IPS è inline e può bloccare. Entrambi richiedono tuning per falsi positivi e falsi negativi.', en: 'IDS observes out of band and alerts; IPS sits inline and can block. Both require tuning for false positives and false negatives.' } }
];

export const PKI_STEPS: Array<{ title: string; detail: Localized }> = [
  { title: 'Root CA', detail: { it: 'Trust anchor autofirmata, mantenuta altamente protetta e spesso offline.', en: 'Self-signed trust anchor, strongly protected and often kept offline.' } },
  { title: 'Intermediate CA', detail: { it: 'Firma certificati o ulteriori subordinate, limitando l’esposizione della root.', en: 'Signs certificates or additional subordinate CAs, limiting root exposure.' } },
  { title: 'Leaf certificate', detail: { it: 'Lega identità e chiave pubblica; il client verifica catena, nome, validità, key usage e revoca.', en: 'Binds identity to a public key; the client checks chain, name, validity, key usage, and revocation.' } },
  { title: 'CRL / OCSP', detail: { it: 'Comunicano la revoca prima della scadenza. Disponibilità, freshness e soft-fail devono essere valutati.', en: 'Communicate revocation before expiry. Availability, freshness, and soft-fail behavior must be considered.' } }
];

export const WLAN_SECURITY_ROWS: Array<{ generation: string; crypto: Localized; authentication: Localized; weakness: Localized }> = [
  {
    generation: 'WEP',
    crypto: { it: 'RC4 con IV di 24 bit riutilizzati.', en: 'RC4 with reused 24-bit IVs.' },
    authentication: { it: 'Chiave statica condivisa.', en: 'Static shared key.' },
    weakness: { it: 'Rotto: la chiave si recupera in minuti raccogliendo IV. Non va usato in nessun caso, nemmeno in laboratorio.', en: 'Broken: the key is recovered in minutes by collecting IVs. Never use it, not even in a lab.' }
  },
  {
    generation: 'WPA',
    crypto: { it: 'TKIP su base RC4, pensato come aggiornamento firmware per l’hardware WEP.', en: 'TKIP over RC4, designed as a firmware upgrade for WEP hardware.' },
    authentication: { it: 'PSK oppure 802.1X.', en: 'PSK or 802.1X.' },
    weakness: { it: 'Deprecato: TKIP ha debolezze note e va disattivato quando è ancora offerto come opzione.', en: 'Deprecated: TKIP has known weaknesses and should be switched off wherever it is still offered as an option.' }
  },
  {
    generation: 'WPA2',
    crypto: { it: 'AES-CCMP (802.11i), lo standard ancora più diffuso.', en: 'AES-CCMP (802.11i), still the most widely deployed standard.' },
    authentication: { it: 'Personal con PSK e handshake a 4 vie, oppure Enterprise con 802.1X/EAP.', en: 'Personal with a PSK and the 4-way handshake, or Enterprise with 802.1X/EAP.' },
    weakness: { it: 'In Personal l’handshake si cattura e la passphrase si attacca offline; PMF è opzionale, quindi i frame di management restano falsificabili.', en: 'In Personal the handshake can be captured and the passphrase attacked offline; PMF is optional, so management frames remain forgeable.' }
  },
  {
    generation: 'WPA3',
    crypto: { it: 'AES con SAE in Personal e suite più robuste in Enterprise; PMF obbligatorio.', en: 'AES with SAE in Personal and stronger suites in Enterprise; PMF mandatory.' },
    authentication: { it: 'SAE (dragonfly) in Personal, 802.1X in Enterprise.', en: 'SAE (dragonfly) in Personal, 802.1X in Enterprise.' },
    weakness: { it: 'Il transition mode che accetta anche WPA2 riporta il livello di sicurezza a quello di WPA2 per i client legacy.', en: 'Transition mode, which also accepts WPA2, brings the security level back down to WPA2 for legacy clients.' }
  }
];

export const WPA2_PSK_STEPS: Array<{ step: Localized; detail: Localized }> = [
  {
    step: { it: '1 · Interfaccia e VLAN', en: '1 · Interface and VLAN' },
    detail: { it: 'Sul WLC si crea o si sceglie l’interfaccia dinamica legata alla VLAN della WLAN. È il passaggio che decide da quale subnet i client prenderanno l’indirizzo: sbagliarlo produce client associati e senza IP.', en: 'On the WLC, create or select the dynamic interface bound to the WLAN VLAN. This step decides which subnet clients take their address from: getting it wrong produces associated clients with no IP.' }
  },
  {
    step: { it: '2 · WLAN e SSID', en: '2 · WLAN and SSID' },
    detail: { it: 'WLANs → Create New: Profile Name interno, SSID trasmesso, Status abilitato e Radio Policy. Profile Name e SSID sono campi distinti.', en: 'WLANs → Create New: internal Profile Name, broadcast SSID, Status enabled, and Radio Policy. Profile Name and SSID are distinct fields.' }
  },
  {
    step: { it: '3 · Layer 2 Security = WPA2 + PSK', en: '3 · Layer 2 Security = WPA2 + PSK' },
    detail: { it: 'Security → Layer 2: WPA2 Policy attiva, WPA2 Encryption = AES (TKIP disattivato), Auth Key Mgmt = PSK e passphrase ASCII di 8-63 caratteri. È la configurazione richiesta dall’obiettivo 5.10.', en: 'Security → Layer 2: WPA2 Policy enabled, WPA2 Encryption = AES (TKIP off), Auth Key Mgmt = PSK, and an 8-63 character ASCII passphrase. This is the configuration objective 5.10 asks for.' }
  },
  {
    step: { it: '4 · QoS e Advanced', en: '4 · QoS and Advanced' },
    detail: { it: 'Profilo QoS coerente con il traffico (Platinum per la voce), P2P Blocking per isolare i client di una WLAN guest, session timeout e client exclusion.', en: 'A QoS profile consistent with the traffic (Platinum for voice), P2P Blocking to isolate the clients of a guest WLAN, session timeout, and client exclusion.' }
  },
  {
    step: { it: '5 · Verifica', en: '5 · Verification' },
    detail: { it: 'Associare un client reale e controllarne stato, policy applicata e indirizzo: show wireless client summary, show wireless client mac-address <mac> detail e show wlan summary. Associato non significa autorizzato.', en: 'Associate a real client and check its state, applied policy, and address: show wireless client summary, show wireless client mac-address <mac> detail, and show wlan summary. Associated does not mean authorized.' }
  }
];

export const ATTACK_ROWS: Array<{ attack: Localized; layer: string; defense: Localized; limit: Localized }> = [
  { attack: { it: 'Credential stuffing e password spraying', en: 'Credential stuffing and password spraying' }, layer: 'Identity', defense: { it: 'MFA resistente al phishing, password uniche, rate limiting, detection e password manager.', en: 'Phishing-resistant MFA, unique passwords, rate limiting, detection, and password managers.' }, limit: { it: 'MFA debole può essere aggirata con fatigue o adversary-in-the-middle.', en: 'Weak MFA may be bypassed through fatigue or adversary-in-the-middle.' } },
  { attack: { it: 'Privilege escalation e abuso amministrativo', en: 'Privilege escalation and administrative abuse' }, layer: 'AAA', defense: { it: 'Least privilege, TACACS+, command authorization, accounting, PAM e separazione dei ruoli.', en: 'Least privilege, TACACS+, command authorization, accounting, PAM, and role separation.' }, limit: { it: 'L’accounting registra, ma non impedisce da solo l’abuso.', en: 'Accounting records activity but does not prevent abuse by itself.' } },
  { attack: { it: 'ACL bypass per ordine errato', en: 'ACL bypass through incorrect ordering' }, layer: 'L3/L4', defense: { it: 'Regole specifiche prima delle generiche, object group controllati, log e test del verso/interfaccia.', en: 'Specific rules before generic rules, controlled object groups, logging, and direction/interface testing.' }, limit: { it: 'Una ACL non comprende identità applicativa né stato completo.', en: 'An ACL does not understand application identity or full state.' } },
  { attack: { it: 'Rogue device e accesso non autorizzato', en: 'Rogue device and unauthorized access' }, layer: 'NAC', defense: { it: '802.1X, RADIUS, EAP-TLS, MAB solo come fallback controllato, profiling e VLAN/SGT dinamici.', en: '802.1X, RADIUS, EAP-TLS, MAB only as a controlled fallback, profiling, and dynamic VLANs/SGTs.' }, limit: { it: 'MAB autentica il MAC, facilmente falsificabile; non equivale a EAP-TLS.', en: 'MAB authenticates a readily spoofed MAC; it is not equivalent to EAP-TLS.' } },
  { attack: { it: 'Man-in-the-middle e downgrade VPN', en: 'Man-in-the-middle and VPN downgrade' }, layer: 'VPN', defense: { it: 'IKEv2, suite robuste, certificati validati, PFS, MFA e disabilitazione di algoritmi legacy.', en: 'IKEv2, strong suites, validated certificates, PFS, MFA, and disabled legacy algorithms.' }, limit: { it: 'La VPN protegge il transito, non rende affidabile un endpoint compromesso.', en: 'A VPN protects transit; it does not make a compromised endpoint trustworthy.' } },
  { attack: { it: 'Certificato fraudolento o chiave privata rubata', en: 'Fraudulent certificate or stolen private key' }, layer: 'PKI', defense: { it: 'Protezione HSM/TPM, lifecycle delle chiavi, pinning dove appropriato, CT monitoring e revoca.', en: 'HSM/TPM protection, key lifecycle management, pinning where appropriate, CT monitoring, and revocation.' }, limit: { it: 'La revoca dipende dal controllo effettivo di CRL/OCSP del client.', en: 'Revocation depends on the client actually checking CRL/OCSP.' } },
  { attack: { it: 'Malware, ransomware ed exploit endpoint', en: 'Malware, ransomware, and endpoint exploits' }, layer: 'Endpoint', defense: { it: 'Patch, EDR, application control, hardening, backup isolati e segmentazione.', en: 'Patching, EDR, application control, hardening, isolated backups, and segmentation.' }, limit: { it: 'Le firme non rilevano ogni comportamento nuovo; serve telemetria e risposta.', en: 'Signatures do not detect every new behavior; telemetry and response are required.' } },
  { attack: { it: 'Evil twin e furto credenziali Wi-Fi', en: 'Evil twin and Wi-Fi credential theft' }, layer: 'Wireless', defense: { it: 'WPA3-Enterprise/802.1X, EAP-TLS, validazione CA/nome server, PMF e WIDS/WIPS.', en: 'WPA3-Enterprise/802.1X, EAP-TLS, CA/server-name validation, PMF, and WIDS/WIPS.' }, limit: { it: 'EAP-TLS riduce il phishing ma richiede gestione corretta dei certificati.', en: 'EAP-TLS reduces phishing but requires sound certificate management.' } },
  { attack: { it: 'DoS contro control o management plane', en: 'DoS against control or management plane' }, layer: 'Planes', defense: { it: 'CoPP, infrastructure ACL, rate limiting, management VRF e servizi minimi.', en: 'CoPP, infrastructure ACLs, rate limiting, management VRF, and minimal services.' }, limit: { it: 'Il policing deve evitare sia starvation sia blocco del traffico legittimo.', en: 'Policing must avoid both starvation and blocking legitimate traffic.' } },
  { attack: { it: 'Configurazioni insicure o drift', en: 'Insecure configuration or drift' }, layer: 'Hardening', defense: { it: 'Baseline, backup, version control, AAA, logging, secure boot/image verification e audit periodici.', en: 'Baselines, backups, version control, AAA, logging, secure boot/image verification, and periodic audits.' }, limit: { it: 'Una baseline non aggiornata può consolidare impostazioni vulnerabili.', en: 'An outdated baseline may preserve vulnerable settings.' } }
];

export const HARDENING_CONFIG = `aaa new-model
aaa authentication login default group tacacs+ local
aaa authorization exec default group tacacs+ local
aaa accounting commands 15 default start-stop group tacacs+
!
ip access-list standard MGMT-SOURCES
 permit 10.99.0.0 0.0.0.255
!
line vty 0 4
 access-class MGMT-SOURCES in
 transport input ssh
 exec-timeout 5 0
!
no ip http server
service password-encryption
login block-for 120 attempts 3 within 60`;

import { useMemo, useState } from 'react';
import { Fingerprint, KeyRound, LockKeyhole, ShieldCheck, Siren, TriangleAlert, Wifi } from 'lucide-react';
import { evaluateIpv4Acl, type AclRule, type PacketDescriptor } from '../lib/securityFundamentals';
import { useStore } from '../store';
import ResponsiveTable from './ResponsiveTable';
import AclBuilderLab from './AclBuilderLab';
import WildcardBuilder from './WildcardBuilder';

type Language = 'it' | 'en';
type Localized = Record<Language, string>;

const ACL_RULES: AclRule[] = [
  { sequence: 10, action: 'deny', protocol: 'tcp', source: { address: '10.10.10.0', wildcard: '0.0.0.255' }, destination: { address: '0.0.0.0', wildcard: '255.255.255.255' }, destinationPort: 23, log: true },
  { sequence: 20, action: 'permit', protocol: 'tcp', source: { address: '10.10.10.0', wildcard: '0.0.0.255' }, destination: { address: '10.20.0.0', wildcard: '0.0.255.255' }, destinationPort: 443 },
  { sequence: 30, action: 'permit', protocol: 'icmp', source: { address: '0.0.0.0', wildcard: '255.255.255.255' }, destination: { address: '10.20.0.0', wildcard: '0.0.255.255' } }
];

const ACL_IOS = [
  '10 deny tcp 10.10.10.0 0.0.0.255 any eq 23 log',
  '20 permit tcp 10.10.10.0 0.0.0.255 10.20.0.0 0.0.255.255 eq 443',
  '30 permit icmp any 10.20.0.0 0.0.255.255',
  'implicit deny ip any any'
];

const SECURITY_FOUNDATIONS: Array<{ title: Localized; detail: Localized }> = [
  { title: { it: 'Threat · vulnerability · exploit', en: 'Threat · vulnerability · exploit' }, detail: { it: 'La minaccia può causare danno; la vulnerabilità è una debolezza; l’exploit è il metodo che la sfrutta. Una mitigation riduce probabilità o impatto, ma raramente azzera il rischio.', en: 'A threat may cause harm; a vulnerability is a weakness; an exploit is the method that abuses it. A mitigation reduces likelihood or impact but rarely removes all risk.' } },
  { title: { it: 'CIA e gestione del rischio', en: 'CIA and risk management' }, detail: { it: 'Confidentiality limita la divulgazione, Integrity protegge correttezza e autenticità, Availability mantiene servizi accessibili. Le decisioni bilanciano rischio, costo e operatività.', en: 'Confidentiality limits disclosure, Integrity protects correctness and authenticity, and Availability keeps services accessible. Decisions balance risk, cost, and operations.' } },
  { title: { it: 'Security program', en: 'Security program' }, detail: { it: 'Policy, awareness e training, controllo degli accessi fisici, asset inventory, change management, incident response e miglioramento continuo lavorano insieme.', en: 'Policies, awareness and training, physical access controls, asset inventory, change management, incident response, and continual improvement work together.' } },
  { title: { it: 'Password e autenticazione', en: 'Passwords and authentication' }, detail: { it: 'Preferisci passphrase lunghe, uniche e non prevedibili, password manager, MFA e controllo delle credenziali compromesse. Evita rotazioni arbitrarie che producono pattern deboli.', en: 'Prefer long, unique, unpredictable passphrases, password managers, MFA, and breached-credential checks. Avoid arbitrary rotation that produces weak patterns.' } },
  { title: { it: 'Sicurezza di livello 2', en: 'Layer 2 security' }, detail: { it: 'Port Security, DHCP Snooping, DAI, IP Source Guard, BPDU Guard, Root Guard e segmentazione proteggono l’access layer; ogni controllo dipende da trust boundary corrette.', en: 'Port Security, DHCP Snooping, DAI, IP Source Guard, BPDU Guard, Root Guard, and segmentation protect the access layer; each control depends on correct trust boundaries.' } }
];

const AAA_ROWS: Array<{ property: Localized; tacacs: Localized; radius: Localized }> = [
  { property: { it: 'Uso tipico', en: 'Typical use' }, tacacs: { it: 'Amministrazione dei dispositivi', en: 'Device administration' }, radius: { it: 'Accesso alla rete, VPN e 802.1X', en: 'Network access, VPN, and 802.1X' } },
  { property: { it: 'Trasporto', en: 'Transport' }, tacacs: { it: 'TCP porta 49', en: 'TCP port 49' }, radius: { it: 'UDP 1812/1813', en: 'UDP 1812/1813' } },
  { property: { it: 'Separazione AAA', en: 'AAA separation' }, tacacs: { it: 'Authentication, authorization e accounting separabili', en: 'Authentication, authorization, and accounting can be separated' }, radius: { it: 'Authentication e authorization strettamente integrate', en: 'Authentication and authorization are closely coupled' } },
  { property: { it: 'Protezione', en: 'Protection' }, tacacs: { it: 'Cifra il body del pacchetto; header visibile', en: 'Encrypts the packet body; header remains visible' }, radius: { it: 'Tradizionalmente protegge la password, non l’intero payload', en: 'Traditionally protects the password, not the entire payload' } }
];

const VPN_ROWS: Array<{ title: string; detail: Localized }> = [
  { title: 'Site-to-site IPsec', detail: { it: 'Collega reti attraverso un tunnel tra gateway. ESP fornisce riservatezza e può garantire integrità/autenticazione; IKE negozia SA e chiavi.', en: 'Connects networks through a tunnel between gateways. ESP provides confidentiality and can provide integrity/authentication; IKE negotiates SAs and keys.' } },
  { title: 'Remote-access VPN', detail: { it: 'Collega un singolo utente alla rete aziendale tramite IPsec o TLS. Richiede MFA, postura endpoint, autorizzazioni minime e split-tunneling valutato.', en: 'Connects an individual user to the enterprise through IPsec or TLS. It requires MFA, endpoint posture, least privilege, and an evaluated split-tunneling policy.' } },
  { title: 'GRE', detail: { it: 'Incapsula protocolli e multicast ma non cifra né autentica. GRE over IPsec aggiunge la protezione di IPsec.', en: 'Encapsulates protocols and multicast but does not encrypt or authenticate. GRE over IPsec adds IPsec protection.' } },
  { title: 'IKEv2', detail: { it: 'IKE_SA_INIT negozia algoritmi e Diffie–Hellman; IKE_AUTH autentica i peer. I CHILD_SA proteggono il traffico IPsec.', en: 'IKE_SA_INIT negotiates algorithms and Diffie–Hellman; IKE_AUTH authenticates peers. CHILD_SAs protect IPsec traffic.' } }
];

const ENFORCEMENT_ROWS: Array<{ title: string; detail: Localized }> = [
  { title: 'Stateless ACL', detail: { it: 'Valuta ogni pacchetto con campi L3/L4 e prima corrispondenza. Non mantiene lo stato della sessione.', en: 'Evaluates each packet using L3/L4 fields and first match. It keeps no session state.' } },
  { title: 'Stateful firewall', detail: { it: 'Mantiene una state table e consente il traffico di ritorno coerente con connessioni valide.', en: 'Maintains a state table and permits return traffic consistent with valid connections.' } },
  { title: 'NGFW', detail: { it: 'Aggiunge identità, applicazioni, URL filtering, TLS inspection e threat prevention, con costi di privacy e prestazioni da gestire.', en: 'Adds identity, applications, URL filtering, TLS inspection, and threat prevention, with privacy and performance costs to manage.' } },
  { title: 'IDS / IPS', detail: { it: 'IDS osserva fuori banda e avvisa; IPS è inline e può bloccare. Entrambi richiedono tuning per falsi positivi e falsi negativi.', en: 'IDS observes out of band and alerts; IPS sits inline and can block. Both require tuning for false positives and false negatives.' } }
];

const PKI_STEPS: Array<{ title: string; detail: Localized }> = [
  { title: 'Root CA', detail: { it: 'Trust anchor autofirmata, mantenuta altamente protetta e spesso offline.', en: 'Self-signed trust anchor, strongly protected and often kept offline.' } },
  { title: 'Intermediate CA', detail: { it: 'Firma certificati o ulteriori subordinate, limitando l’esposizione della root.', en: 'Signs certificates or additional subordinate CAs, limiting root exposure.' } },
  { title: 'Leaf certificate', detail: { it: 'Lega identità e chiave pubblica; il client verifica catena, nome, validità, key usage e revoca.', en: 'Binds identity to a public key; the client checks chain, name, validity, key usage, and revocation.' } },
  { title: 'CRL / OCSP', detail: { it: 'Comunicano la revoca prima della scadenza. Disponibilità, freshness e soft-fail devono essere valutati.', en: 'Communicate revocation before expiry. Availability, freshness, and soft-fail behavior must be considered.' } }
];

const WLAN_SECURITY_ROWS: Array<{ generation: string; crypto: Localized; authentication: Localized; weakness: Localized }> = [
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

const WPA2_PSK_STEPS: Array<{ step: Localized; detail: Localized }> = [
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

const ATTACK_ROWS: Array<{ attack: Localized; layer: string; defense: Localized; limit: Localized }> = [
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

const HARDENING_CONFIG = `aaa new-model
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

function SectionTitle({ icon: Icon, title, id }: { icon: typeof ShieldCheck; title: string; id: string }) {
  return <div className="flex items-center gap-3"><Icon className="h-5 w-5 text-indigo-600" /><h2 id={id} className="text-lg font-semibold text-slate-900">{title}</h2></div>;
}

export default function SecurityFundamentalsLab() {
  const language = useStore(state => state.language);
  const [packet, setPacket] = useState<PacketDescriptor>({ protocol: 'tcp', sourceIp: '10.10.10.42', destinationIp: '10.20.50.5', sourcePort: 49152, destinationPort: 443, tcpFlags: ['SYN'] });

  const decision = useMemo(() => {
    try { return { value: evaluateIpv4Acl(ACL_RULES, packet), error: false } as const; }
    catch { return { value: null, error: true } as const; }
  }, [packet]);

  const t = language === 'it'
    ? {
        title: 'Security Fundamentals Lab', subtitle: 'Applica controlli preventivi, investigativi e correttivi senza confondere capacità, limiti e piano operativo.', foundations: 'Concetti e programma di sicurezza',
        acl: 'ACL IPv4: prima corrispondenza', protocol: 'Protocollo', source: 'IPv4 sorgente', destination: 'IPv4 destinazione', port: 'Porta destinazione', ack: 'Imposta ACK TCP', invalid: 'Il descrittore del pacchetto contiene indirizzi o porte non validi.', permit: 'PERMIT', deny: 'DENY', matched: 'Regola corrispondente', implicit: 'Implicit deny', aclNote: 'Le ACL vengono lette dall’alto verso il basso e si fermano alla prima corrispondenza. Standard ACL: solo sorgente. Extended ACL: protocollo, sorgente, destinazione e porte. “established” verifica ACK/RST ma non mantiene stato.',
        aaa: 'AAA e controllo amministrativo', property: 'Proprietà',
        wlan: 'Protocolli di sicurezza wireless e WPA2 PSK', generation: 'Generazione', crypto: 'Cifratura', authN: 'Autenticazione', weakness: 'Limite da conoscere',
        wlanNote: 'WPA2 PSK è adeguato a una rete piccola o a un laboratorio: la passphrase è condivisa, quindi non identifica un utente, non si revoca singolarmente e chi la conosce può decifrare il traffico degli altri se ha catturato il loro handshake. In ambito aziendale si usa Enterprise con 802.1X/EAP-TLS. La sequenza dei campi nella GUI del WLC è nel Network Access Lab.',
        psk: 'Creare una WLAN WPA2 PSK', vpn: 'VPN e protezione del transito', enforcement: 'ACL, firewall e IDS/IPS', pki: 'PKI e catena di fiducia', attacks: 'Attacchi, difese e limiti', attack: 'Attacco', plane: 'Area', defense: 'Difesa', limit: 'Limite operativo', hardening: 'Hardening IOS di riferimento', hardeningNote: 'L’ordine AAA deve conservare un fallback locale testato per evitare lockout. service password-encryption applica offuscamento Type 7 reversibile: non sostituisce secret robusti, AAA e MFA. Algoritmi e comandi dipendono dalla piattaforma.'
      }
    : {
        title: 'Security Fundamentals Lab', subtitle: 'Apply preventive, detective, and corrective controls without confusing capabilities, limitations, and operational plane.', foundations: 'Security concepts and program',
        acl: 'IPv4 ACL: first match', protocol: 'Protocol', source: 'Source IPv4', destination: 'Destination IPv4', port: 'Destination port', ack: 'Set TCP ACK', invalid: 'The packet descriptor contains invalid addresses or ports.', permit: 'PERMIT', deny: 'DENY', matched: 'Matched rule', implicit: 'Implicit deny', aclNote: 'ACLs are read top-down and stop at the first match. Standard ACL: source only. Extended ACL: protocol, source, destination, and ports. “established” checks ACK/RST but keeps no state.',
        aaa: 'AAA and administrative control', property: 'Property',
        wlan: 'Wireless security protocols and WPA2 PSK', generation: 'Generation', crypto: 'Encryption', authN: 'Authentication', weakness: 'Limitation to know',
        wlanNote: 'WPA2 PSK is adequate for a small network or a lab: the passphrase is shared, so it identifies no user, cannot be revoked individually, and whoever knows it can decrypt other clients’ traffic if their handshake was captured. Enterprise deployments use 802.1X/EAP-TLS instead. The WLC GUI field sequence lives in the Network Access Lab.',
        psk: 'Creating a WPA2 PSK WLAN', vpn: 'VPN and transit protection', enforcement: 'ACLs, firewalls, and IDS/IPS', pki: 'PKI and chain of trust', attacks: 'Attacks, defenses, and limitations', attack: 'Attack', plane: 'Area', defense: 'Defense', limit: 'Operational limitation', hardening: 'Reference IOS hardening', hardeningNote: 'The AAA order should retain a tested local fallback to avoid lockout. service password-encryption applies reversible Type 7 obfuscation: it does not replace strong secrets, AAA, or MFA. Algorithms and commands depend on the platform.'
      };

  const setPacketField = <Key extends keyof PacketDescriptor,>(key: Key, value: PacketDescriptor[Key]) => setPacket(current => ({ ...current, [key]: value }));

  return (
    <div className="space-y-8">
      <header className="rounded-xl border border-slate-200 bg-white p-6 md:p-8"><p className="eyebrow">CCNA 5.1 · 5.2 · 5.3 · 5.4 · 5.5 · 5.6 · 5.7 · 5.8 · 5.9 · 5.10</p><h1 className="mt-2 text-2xl font-semibold text-slate-900">{t.title}</h1><p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{t.subtitle}</p></header>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="security-foundations-title"><SectionTitle icon={ShieldCheck} title={t.foundations} id="security-foundations-title" /><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{SECURITY_FOUNDATIONS.map(item => <article key={item.title.en} className="rounded-lg border border-slate-200 p-4"><h3 className="text-sm font-semibold text-slate-900">{item.title[language]}</h3><p className="mt-2 text-xs leading-relaxed text-slate-600">{item.detail[language]}</p></article>)}</div></section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="acl-title"><SectionTitle icon={ShieldCheck} title={t.acl} id="acl-title" /><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><label className="space-y-1 text-xs text-slate-600">{t.protocol}<select value={packet.protocol} onChange={event => setPacketField('protocol', event.target.value as PacketDescriptor['protocol'])} className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm"><option value="tcp">TCP</option><option value="udp">UDP</option><option value="icmp">ICMP</option></select></label><label className="space-y-1 text-xs text-slate-600">{t.source}<input value={packet.sourceIp} onChange={event => setPacketField('sourceIp', event.target.value)} className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm" /></label><label className="space-y-1 text-xs text-slate-600">{t.destination}<input value={packet.destinationIp} onChange={event => setPacketField('destinationIp', event.target.value)} className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm" /></label><label className="space-y-1 text-xs text-slate-600">{t.port}<input type="number" min={1} max={65535} value={packet.destinationPort ?? ''} onChange={event => setPacketField('destinationPort', Number(event.target.value))} disabled={packet.protocol === 'icmp'} className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm disabled:bg-slate-100" /></label></div><label className="mt-4 flex items-center gap-2 text-xs text-slate-700"><input type="checkbox" checked={(packet.tcpFlags ?? []).includes('ACK')} disabled={packet.protocol !== 'tcp'} onChange={event => setPacketField('tcpFlags', event.target.checked ? ['ACK'] : ['SYN'])} />{t.ack}</label><div className="mt-4 space-y-2 font-mono text-xs">{ACL_IOS.map((line, index) => <div key={line} className={`rounded-md border px-3 py-2 ${decision.value?.matchedSequence === ACL_RULES[index]?.sequence || (decision.value?.implicit && index === ACL_IOS.length - 1) ? 'border-indigo-300 bg-indigo-50 text-indigo-800' : 'border-slate-100 bg-slate-50 text-slate-600'}`}>{line}</div>)}</div>{decision.error ? <p className="mt-4 flex items-center gap-2 text-sm text-rose-700" role="alert"><TriangleAlert className="h-4 w-4" />{t.invalid}</p> : <div className={`mt-4 rounded-lg border p-4 ${decision.value?.action === 'permit' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}><span className="font-semibold">{decision.value?.action === 'permit' ? t.permit : t.deny}</span><span className="ml-3 text-xs">{decision.value?.implicit ? t.implicit : `${t.matched}: ${decision.value?.matchedSequence}`}{decision.value?.logged ? ' · log' : ''}</span></div>}<p className="mt-4 text-xs leading-relaxed text-slate-600">{t.aclNote}</p></section>

      <AclBuilderLab />

      <WildcardBuilder />

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="aaa-title"><SectionTitle icon={Fingerprint} title={t.aaa} id="aaa-title" /><div className="mt-4"><ResponsiveTable
          rows={AAA_ROWS}
          rowKey={row => row.property.en}
          label={t.aaa}
          breakpoint="md"
          minWidth={640}
          columns={[
            { id: 'property', header: t.property, heading: true, cell: row => row.property[language] },
            { id: 'tacacs', header: 'TACACS+', cell: row => row.tacacs[language] },
            { id: 'radius', header: 'RADIUS', cell: row => row.radius[language] }
          ]}
        /></div></section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="vpn-title"><SectionTitle icon={LockKeyhole} title={t.vpn} id="vpn-title" /><div className="mt-4 grid gap-3 md:grid-cols-2">{VPN_ROWS.map(row => <article key={row.title} className="rounded-lg border border-slate-200 p-4"><h3 className="text-sm font-semibold text-slate-900">{row.title}</h3><p className="mt-2 text-xs leading-relaxed text-slate-600">{row.detail[language]}</p></article>)}</div></section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="enforcement-title"><SectionTitle icon={Siren} title={t.enforcement} id="enforcement-title" /><div className="mt-4 grid gap-3 md:grid-cols-2">{ENFORCEMENT_ROWS.map(row => <article key={row.title} className="rounded-lg border border-slate-200 p-4"><h3 className="text-sm font-semibold text-slate-900">{row.title}</h3><p className="mt-2 text-xs leading-relaxed text-slate-600">{row.detail[language]}</p></article>)}</div></section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="pki-title"><SectionTitle icon={KeyRound} title={t.pki} id="pki-title" /><ol className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{PKI_STEPS.map((step, index) => <li key={step.title} className="rounded-lg border border-slate-200 p-4"><span className="font-mono text-[10px] text-indigo-600">{index + 1}</span><h3 className="mt-1 text-sm font-semibold text-slate-900">{step.title}</h3><p className="mt-2 text-xs leading-relaxed text-slate-600">{step.detail[language]}</p></li>)}</ol></section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="wlan-security-title">
        <SectionTitle icon={Wifi} title={t.wlan} id="wlan-security-title" />
        <div className="mt-4"><ResponsiveTable
          rows={WLAN_SECURITY_ROWS}
          rowKey={row => row.generation}
          label={t.wlan}
          minWidth={900}
          columns={[
            { id: 'generation', header: t.generation, heading: true, cellClassName: 'text-indigo-700', cell: row => row.generation },
            { id: 'crypto', header: t.crypto, cell: row => row.crypto[language] },
            { id: 'authn', header: t.authN, cell: row => row.authentication[language] },
            { id: 'weakness', header: t.weakness, cellClassName: 'text-amber-900', cell: row => row.weakness[language] }
          ]}
        /></div>
        <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-slate-500">{t.psk}</h3>
        <ol className="mt-2 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{WPA2_PSK_STEPS.map(item => <li key={item.step.en} className="rounded-lg border border-slate-200 p-4"><h4 className="text-xs font-semibold text-slate-900">{item.step[language]}</h4><p className="mt-2 text-xs leading-relaxed text-slate-600">{item.detail[language]}</p></li>)}</ol>
        <p className="mt-4 rounded-lg border border-amber-100 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">{t.wlanNote}</p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="security-matrix-title"><SectionTitle icon={ShieldCheck} title={t.attacks} id="security-matrix-title" /><div className="mt-4"><ResponsiveTable
          rows={ATTACK_ROWS}
          rowKey={row => row.attack.en}
          label={t.attacks}
          breakpoint="xl"
          minWidth={1040}
          columns={[
            { id: 'attack', header: t.attack, heading: true, cellClassName: 'text-rose-700', cell: row => row.attack[language] },
            { id: 'plane', header: t.plane, cellClassName: 'font-mono text-indigo-700', cell: row => row.layer },
            { id: 'defense', header: t.defense, cellClassName: 'text-emerald-800', cell: row => row.defense[language] },
            { id: 'limit', header: t.limit, cell: row => row.limit[language] }
          ]}
        /></div></section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="hardening-title"><SectionTitle icon={LockKeyhole} title={t.hardening} id="hardening-title" /><p className="mt-3 text-xs leading-relaxed text-slate-600">{t.hardeningNote}</p><pre className="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-emerald-300"><code>{HARDENING_CONFIG}</code></pre></section>
    </div>
  );
}

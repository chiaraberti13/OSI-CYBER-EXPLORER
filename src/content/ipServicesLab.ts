type Language = 'it' | 'en';
type Localized = Record<Language, string>;

export const DHCP_STEPS: Array<{ acronym: string; direction: string; detail: Localized }> = [
  { acronym: 'D · Discover', direction: 'client → broadcast', detail: { it: 'Il client senza indirizzo cerca server DHCP usando UDP 68→67.', en: 'A client without an address searches for DHCP servers using UDP 68→67.' } },
  { acronym: 'O · Offer', direction: 'server → client', detail: { it: 'Il server propone indirizzo, mask, gateway, DNS e durata del lease.', en: 'The server offers an address, mask, gateway, DNS, and lease duration.' } },
  { acronym: 'R · Request', direction: 'client → broadcast', detail: { it: 'Il client identifica l’offerta scelta e richiede formalmente l’indirizzo.', en: 'The client identifies the selected offer and formally requests the address.' } },
  { acronym: 'A · Acknowledge', direction: 'server → client', detail: { it: 'Il server conferma lease e opzioni; un NAK rifiuta una richiesta non valida.', en: 'The server confirms the lease and options; a NAK rejects an invalid request.' } }
];

export const DNS_RECORDS: Array<{ type: string; purpose: Localized }> = [
  { type: 'A', purpose: { it: 'Nome → indirizzo IPv4', en: 'Name → IPv4 address' } },
  { type: 'AAAA', purpose: { it: 'Nome → indirizzo IPv6', en: 'Name → IPv6 address' } },
  { type: 'CNAME', purpose: { it: 'Alias → nome canonico', en: 'Alias → canonical name' } },
  { type: 'MX', purpose: { it: 'Server di posta e preferenza', en: 'Mail server and preference' } },
  { type: 'PTR', purpose: { it: 'Risoluzione inversa indirizzo → nome', en: 'Reverse lookup address → name' } },
  { type: 'TXT', purpose: { it: 'Testo, verifica e policy come SPF/DMARC', en: 'Text, verification, and policies such as SPF/DMARC' } },
  { type: 'SRV', purpose: { it: 'Localizzazione di un servizio e relativa porta', en: 'Service location and associated port' } }
];

export const SYSLOG_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7] as const;

export const CLIENT_SERVICE_ROLES: Array<{ phase: Localized; dhcp: Localized; dns: Localized }> = [
  {
    phase: { it: 'Cosa fornisce al client', en: 'What it gives the client' },
    dhcp: { it: 'I parametri con cui l’host esiste in rete: indirizzo IP, subnet mask, default gateway, server DNS, dominio e durata del lease. Senza DHCP l’host ripiega su APIPA (169.254.x.x) e comunica solo dentro il proprio segmento.', en: 'The parameters that let the host exist on the network: IP address, subnet mask, default gateway, DNS servers, domain, and lease duration. Without DHCP the host falls back to APIPA (169.254.x.x) and can only talk inside its own segment.' },
    dns: { it: 'La traduzione da nome a indirizzo. Non fornisce connettività: un host senza DNS è pienamente raggiungibile per indirizzo, ma quasi inutilizzabile per una persona.', en: 'Name-to-address translation. It provides no connectivity: a host without DNS is fully reachable by address, but nearly unusable for a person.' }
  },
  {
    phase: { it: 'Quando entra in gioco', en: 'When it comes into play' },
    dhcp: { it: 'All’accensione o al collegamento del cavo, e poi al rinnovo: il client prova il renew al 50% del lease (T1) con l’unicast al server originale, e il rebind all’87,5% (T2) in broadcast verso qualunque server.', en: 'At power-on or when the cable is connected, and then at renewal: the client attempts a renew at 50% of the lease (T1) with a unicast to the original server, and a rebind at 87.5% (T2) by broadcast toward any server.' },
    dns: { it: 'Prima di ogni connessione per nome, e solo se la risposta non è già nella cache locale o del resolver. Il TTL del record decide per quanto la risposta resta riutilizzabile.', en: 'Before every connection by name, and only if the answer is not already in the local or resolver cache. The record TTL decides how long the answer stays reusable.' }
  },
  {
    phase: { it: 'Trasporto e porte', en: 'Transport and ports' },
    dhcp: { it: 'UDP: il client usa la porta 68 e il server la 67. Il Discover parte in broadcast perché il client non ha ancora un indirizzo — ed è la ragione per cui serve un relay per servire subnet remote.', en: 'UDP: the client uses port 68 and the server port 67. The Discover goes out as a broadcast because the client has no address yet — which is exactly why a relay is needed to serve remote subnets.' },
    dns: { it: 'UDP 53 per le query normali, TCP 53 quando la risposta non entra in un datagram o per i trasferimenti di zona. DoT usa TCP 853 e DoH la 443.', en: 'UDP 53 for ordinary queries, TCP 53 when the answer does not fit a datagram or for zone transfers. DoT uses TCP 853 and DoH uses 443.' }
  },
  {
    phase: { it: 'Come si diagnostica dal client', en: 'How to diagnose it from the client' },
    dhcp: { it: 'ipconfig /all su Windows, ipconfig getpacket en0 su macOS, ip addr con resolvectl status su Linux: si legge se un indirizzo è stato realmente concesso e da quale server.', en: 'ipconfig /all on Windows, ipconfig getpacket en0 on macOS, ip addr with resolvectl status on Linux: this shows whether an address was actually granted and by which server.' },
    dns: { it: 'nslookup o dig sul nome, poi un ping all’indirizzo restituito. Se il nome non risolve ma l’indirizzo risponde, il guasto è nel servizio di risoluzione, non nella rete.', en: 'nslookup or dig on the name, then a ping to the returned address. If the name does not resolve but the address answers, the fault is in name resolution, not in the network.' }
  }
];

export const SERVICE_CONCEPTS: Array<{ title: string; detail: Localized }> = [
  { title: 'HSRP / FHRP', detail: { it: 'Gli host usano un gateway virtuale. Un router è Active e uno Standby; priorità, preempt e object tracking controllano il failover. VRRP è uno standard aperto con terminologia Master/Backup. È l’obiettivo CCNA 3.5: il confronto completo HSRP/VRRP è nell’IP Connectivity Lab.', en: 'Hosts use a virtual gateway. One router is Active and another Standby; priority, preempt, and object tracking control failover. VRRP is an open standard using Master/Backup terminology. This is CCNA objective 3.5: the full HSRP/VRRP comparison lives in the IP Connectivity Lab.' } },
  { title: 'SNMP manager · agent · MIB', detail: { it: 'Il manager legge o modifica oggetti dell’agent tramite OID. Trap è una notifica non confermata; Inform richiede conferma ed è più affidabile ma genera più overhead.', en: 'The manager reads or changes agent objects through OIDs. A Trap is unacknowledged; an Inform requires acknowledgment and is more reliable but creates more overhead.' } },
  { title: 'TFTP · FTP', detail: { it: 'TFTP usa UDP/69, non autentica e non cifra. FTP usa TCP/21 più una connessione dati, ma credenziali e contenuti restano in chiaro. Preferisci SCP, SFTP o HTTPS per trasferimenti protetti.', en: 'TFTP uses UDP/69 with no authentication or encryption. FTP uses TCP/21 plus a data connection, but credentials and content remain cleartext. Prefer SCP, SFTP, or HTTPS for protected transfers.' } },
  { title: 'SSH', detail: { it: 'SSHv2 fornisce cifratura, integrità e autenticazione per la gestione CLI. La sicurezza dipende anche da AAA, chiavi, management plane isolato e autorizzazioni minime.', en: 'SSHv2 provides encryption, integrity, and authentication for CLI management. Security also depends on AAA, keys, an isolated management plane, and least privilege.' } }
];

export const QOS_MECHANISMS: Array<{ title: string; detail: Localized }> = [
  { title: 'Classification & marking', detail: { it: 'Identifica il traffico e imposta CoS/DSCP; la trust boundary stabilisce dove una marcatura può essere accettata.', en: 'Identifies traffic and sets CoS/DSCP; the trust boundary determines where a marking may be accepted.' } },
  { title: 'CBWFQ / LLQ', detail: { it: 'CBWFQ assegna banda alle classi; LLQ aggiunge una coda a priorità stretta, normalmente sottoposta a policing per evitare starvation.', en: 'CBWFQ assigns bandwidth to classes; LLQ adds strict priority, normally policed to prevent starvation.' } },
  { title: 'Policing', detail: { it: 'Applica un limite senza bufferizzare: il traffico eccedente viene scartato o rimarcato. Può produrre burst e ritrasmissioni.', en: 'Enforces a rate without buffering: excess traffic is dropped or remarked. It may produce bursts and retransmissions.' } },
  { title: 'Shaping', detail: { it: 'Bufferizza e ritarda il traffico eccedente per rispettare una velocità media; aumenta la latenza ma rende il flusso più regolare.', en: 'Buffers and delays excess traffic to meet an average rate; it adds latency but creates a smoother flow.' } },
  { title: 'WRED', detail: { it: 'Scarta probabilisticamente prima che la coda sia piena, soprattutto per segnalare congestione ai flussi TCP; non sostituisce la capacità.', en: 'Drops probabilistically before a queue fills, mainly to signal congestion to TCP flows; it does not replace capacity.' } }
];

export const SECURITY_ROWS: Array<{ service: string; attack: Localized; defense: Localized; verify: string }> = [
  { service: 'DHCP', attack: { it: 'Starvation del pool e rogue DHCP con gateway/DNS malevoli.', en: 'Pool starvation and rogue DHCP offering malicious gateway/DNS settings.' }, defense: { it: 'DHCP Snooping, trust solo verso il server, rate limit client, Port Security e binding monitorati.', en: 'DHCP Snooping, trust only toward the server, client rate limits, Port Security, and monitored bindings.' }, verify: 'show ip dhcp snooping' },
  { service: 'DNS', attack: { it: 'Cache poisoning e risposte falsificate che dirottano la risoluzione.', en: 'Cache poisoning and forged replies that redirect resolution.' }, defense: { it: 'DNSSEC valida autenticità e integrità dei dati firmati; randomizzazione e resolver aggiornati riducono spoofing, ma DNSSEC non cifra le query.', en: 'DNSSEC validates authenticity and integrity of signed data; randomization and updated resolvers reduce spoofing, but DNSSEC does not encrypt queries.' }, verify: 'dig +dnssec <name>' },
  { service: 'DNS', attack: { it: 'Amplification/reflection tramite resolver ricorsivi aperti e query con risposta grande.', en: 'Amplification/reflection through open recursive resolvers and queries with large responses.' }, defense: { it: 'Niente open recursion, response-rate limiting, BCP 38 e capacità DDoS a monte.', en: 'No open recursion, response-rate limiting, BCP 38, and upstream DDoS capacity.' }, verify: 'show platform hardware qfp active statistics drop' },
  { service: 'DNS', attack: { it: 'DNS tunneling per comando, controllo o esfiltrazione nei sottodomini.', en: 'DNS tunneling for command and control or data exfiltration in subdomains.' }, defense: { it: 'Resolver aziendali obbligatori, logging, analisi di entropia/volume, allowlist e DNS firewall/RPZ.', en: 'Enforced enterprise resolvers, logging, entropy/volume analysis, allowlists, and DNS firewall/RPZ.' }, verify: 'resolver query logs' },
  { service: 'NAT/PAT', attack: { it: 'Esaurimento delle traduzioni con molte sessioni o porte.', en: 'Translation exhaustion through excessive sessions or ports.' }, defense: { it: 'Timeout coerenti, limiti di sessione, firewall stateful e monitoraggio della tabella. NAT da solo non è un controllo di sicurezza.', en: 'Appropriate timeouts, session limits, a stateful firewall, and table monitoring. NAT alone is not a security control.' }, verify: 'show ip nat statistics' },
  { service: 'FHRP', attack: { it: 'Messaggi HSRP/VRRP falsificati tentano di assumere il ruolo del gateway attivo.', en: 'Forged HSRP/VRRP messages attempt to take over the active-gateway role.' }, defense: { it: 'Autenticazione quando supportata, segmentazione, ACL/CoPP e protezioni di access layer; monitora cambi di stato e virtual MAC.', en: 'Authentication where supported, segmentation, ACLs/CoPP, and access-layer protections; monitor state and virtual-MAC changes.' }, verify: 'show standby brief' },
  { service: 'NTP', attack: { it: 'Time spoofing altera log, certificati, correlazione SIEM e protocolli dipendenti dal tempo.', en: 'Time spoofing disrupts logs, certificates, SIEM correlation, and time-dependent protocols.' }, defense: { it: 'Server multipli attendibili, autenticazione quando supportata, ACL, monitoring dell’offset e NTS nei sistemi compatibili.', en: 'Multiple trusted servers, authentication where supported, ACLs, offset monitoring, and NTS on compatible systems.' }, verify: 'show ntp associations detail' },
  { service: 'SNMP', attack: { it: 'Enumerazione, community guessing o SET non autorizzati con SNMPv1/v2c.', en: 'Enumeration, community guessing, or unauthorized SET operations with SNMPv1/v2c.' }, defense: { it: 'SNMPv3 authPriv per autenticazione, integrità e cifratura; viste minime, ACL e credenziali uniche.', en: 'SNMPv3 authPriv for authentication, integrity, and encryption; minimal views, ACLs, and unique credentials.' }, verify: 'show snmp user' },
  { service: 'Syslog', attack: { it: 'Log injection, perdita UDP, manomissione o cancellazione locale.', en: 'Log injection, UDP loss, tampering, or local deletion.' }, defense: { it: 'Raccolta remota centralizzata, trasporto affidabile/TLS se disponibile, timestamp NTP, accesso ristretto e storage immutabile.', en: 'Centralized remote collection, reliable transport/TLS where available, NTP timestamps, restricted access, and immutable storage.' }, verify: 'show logging' },
  { service: 'QoS', attack: { it: 'DSCP marking abusivo per ottenere priorità o saturare la LLQ.', en: 'Abusive DSCP marking to gain priority or exhaust the LLQ.' }, defense: { it: 'Trust boundary esplicito, remark all’edge, policing per classe e LLQ dimensionata.', en: 'Explicit trust boundary, remarking at the edge, per-class policing, and a properly sized LLQ.' }, verify: 'show policy-map interface' },
  { service: 'SSH', attack: { it: 'Brute force, password spraying, chiavi rubate o accesso da reti non autorizzate.', en: 'Brute force, password spraying, stolen keys, or access from unauthorized networks.' }, defense: { it: 'SSHv2, AAA centralizzata, chiavi, management ACL/VRF, timeout, logging e CoPP; disabilita Telnet.', en: 'SSHv2, centralized AAA, keys, management ACL/VRF, timeouts, logging, and CoPP; disable Telnet.' }, verify: 'show ip ssh' },
  { service: 'TFTP/FTP', attack: { it: 'Credenziali, configurazioni o immagini possono essere intercettate o modificate in transito.', en: 'Credentials, configurations, or images may be intercepted or modified in transit.' }, defense: { it: 'Usa SCP/SFTP/HTTPS, limita i server alla management network e verifica hash/firma delle immagini.', en: 'Use SCP/SFTP/HTTPS, restrict servers to the management network, and verify image hashes/signatures.' }, verify: 'show archive' }
];

export const DHCP_NAT_CONFIG: Record<Language, string> = {
  it: `ip dhcp excluded-address 10.10.10.1 10.10.10.20
ip dhcp pool USERS
 network 10.10.10.0 255.255.255.0
 default-router 10.10.10.1
 dns-server 10.20.0.53
!
interface Vlan20
 ip helper-address 10.20.0.10
!
ip access-list standard NAT-INSIDE
 permit 10.10.10.0 0.0.0.255
ip nat inside source list NAT-INSIDE interface Gi0/0 overload`,
  en: `ip dhcp excluded-address 10.10.10.1 10.10.10.20
ip dhcp pool USERS
 network 10.10.10.0 255.255.255.0
 default-router 10.10.10.1
 dns-server 10.20.0.53
!
interface Vlan20
 ip helper-address 10.20.0.10
!
ip access-list standard NAT-INSIDE
 permit 10.10.10.0 0.0.0.255
ip nat inside source list NAT-INSIDE interface Gi0/0 overload`
};

export const MANAGEMENT_CONFIG = `service timestamps log datetime msec localtime show-timezone
logging host 10.20.0.50
logging trap warnings
logging source-interface Loopback0
!
ntp server 10.20.0.123 prefer
!
snmp-server group SECURE v3 priv
snmp-server user netops SECURE v3 auth sha <AUTH_SECRET> priv aes 128 <PRIV_SECRET>
!
ip domain name lab.example
username netadmin privilege 15 secret <SECRET>
crypto key generate rsa modulus 2048
ip ssh version 2
line vty 0 4
 transport input ssh
 login local`;

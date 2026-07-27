import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Search, ShieldAlert, ShieldCheck, HelpCircle, 
  Trophy, Sparkles, Hash, Activity, Lock, Unlock, PlayCircle, RefreshCw,
  Layers, Globe, Shield, Shuffle, Network, Radio, Cpu, Server
} from 'lucide-react';
import { useStore } from '../store';

interface PortInfo {
  port: number | string;
  service: string;
  name: string;
  type: 'TCP' | 'UDP' | 'Both';
  range: 'well-known' | 'registered' | 'dynamic';
  description: { en: string; it: string };
  security: { en: string; it: string };
  isSecure: boolean;
}

interface ProtocolInfo {
  name: string;
  fullName: string;
  layer: number;
  type: string;
  description: { en: string; it: string };
  useCase: { en: string; it: string };
  security: { en: string; it: string };
  isSecure: boolean;
}

const PROTOCOL_REGISTRY: ProtocolInfo[] = [
  {
    name: 'HTTP / HTTPS',
    fullName: 'Hypertext Transfer Protocol (Secure)',
    layer: 7,
    type: 'Application',
    description: {
      en: 'The foundation of data communication for the World Wide Web, initiating browser-server transactions.',
      it: 'Il fondamento dello scambio dati sul World Wide Web, definendo le transazioni tra client e server.'
    },
    useCase: {
      en: 'Accessing web pages, loading media assets, and consuming REST APIs.',
      it: 'Accesso a pagine web, caricamento di asset multimediali e chiamate ad API REST.'
    },
    security: {
      en: 'HTTPS encrypts all payloads using TLS/SSL, shielding credentials and data from passive listening.',
      it: 'HTTPS cifra tutti i payload con TLS/SSL, proteggendo credenziali e sessioni da intercettazioni passive.'
    },
    isSecure: true
  },
  {
    name: 'DNS',
    fullName: 'Domain Name System',
    layer: 7,
    type: 'Application',
    description: {
      en: 'Translates memorizable hostnames (like google.com) into IP addresses for packet routing.',
      it: 'Traduce i nomi di host facili da ricordare (come google.com) in indirizzi IP numerici.'
    },
    useCase: {
      en: 'Resolving domain coordinates prior to initiating TCP connection handshakes.',
      it: 'Risoluzione delle coordinate dei server prima di avviare l\'handshake TCP.'
    },
    security: {
      en: 'Vulnerable to spoofing and redirection unless hardened via DNSSEC cryptographic signatures.',
      it: 'Vulnerabile a dirottamenti e spoofing se non protetto tramite le firme crittografiche DNSSEC.'
    },
    isSecure: false
  },
  {
    name: 'SSH',
    fullName: 'Secure Shell',
    layer: 7,
    type: 'Application',
    description: {
      en: 'Enables encrypted interactive terminal sessions and secure administrative host access.',
      it: 'Consente sessioni di terminale interattive cifrate e comunicazioni di gestione remota sicura.'
    },
    useCase: {
      en: 'Remote Linux server command line terminal, secure automated scripts execution, and SFTP transfers.',
      it: 'Amministrazione remota di server Linux via linea di comando, script automatizzati e passaggi SFTP.'
    },
    security: {
      en: 'Protects passwords and tokens by wrapping sessions in state-of-the-art public-key cryptography.',
      it: 'Protegge le sessioni avvolgendole in sistemi crittografici avanzati a chiave pubblica.'
    },
    isSecure: true
  },
  {
    name: 'SMTP',
    fullName: 'Simple Mail Transfer Protocol',
    layer: 7,
    type: 'Application',
    description: {
      en: 'Standard mechanism for transmitting messages between mail transfer agents (MTAs).',
      it: 'Meccanismo standard per la trasmissione e l\'instradamento dei messaggi tra server di posta (MTA).'
    },
    useCase: {
      en: 'Pushing newly composed emails from client environments out to local or foreign mail servers.',
      it: 'Invio di nuovi messaggi di posta elettronica da client a server o inoltro tra server.'
    },
    security: {
      en: 'Plaintext by default; relies on STARTTLS wrappers, DKIM validation and SPF filters to stop phishing.',
      it: 'In chiaro di default; si affida a schemi STARTTLS, record SPF e firme DKIM per evitare spoofing.'
    },
    isSecure: false
  },
  {
    name: 'SNMP',
    fullName: 'Simple Network Management Protocol',
    layer: 7,
    type: 'Application',
    description: {
      en: 'Protocol used for monitoring and managing devices in IP networks.',
      it: 'Protocollo utilizzato per monitorare e gestire i dispositivi di rete IP.'
    },
    useCase: {
      en: 'Querying router throughput, check switch statuses, and receive configuration alerts.',
      it: 'Interrogazione del throughput dei router, stato degli switch e ricezione di alert fisici.'
    },
    security: {
      en: 'SNMP v1 and v2 transmit passwords (community strings) in plaintext. SNMP v3 is secure and encrypted.',
      it: 'SNMP v1 e v2 trasmettono password (stringhe di community) in chiaro. SNMP v3 è cifrato e sicuro.'
    },
    isSecure: false
  },
  {
    name: 'TCP',
    fullName: 'Transmission Control Protocol',
    layer: 4,
    type: 'Transport',
    description: {
      en: 'Connection-oriented transport protocol guaranteeing reliable, ordered packet delivery with error checking.',
      it: 'Protocollo di trasporto orientato alla connessione che garantisce la consegna ordinata e affidabile dei pacchetti.'
    },
    useCase: {
      en: 'Web browsing (HTTP), file exchange (FTP), email management, and database synchronization.',
      it: 'Navigazione web (HTTP), trasferimento file (FTP), posta elettronica e database.'
    },
    security: {
      en: 'Target of SYN Flood DDoS attacks. Lacks native encryption; payloads must be wrapped via TLS.',
      it: 'Obiettivo di attacchi di tipo SYN Flood. Non ha cifratura nativa, i dati vanno protetti con TLS.'
    },
    isSecure: false
  },
  {
    name: 'UDP',
    fullName: 'User Datagram Protocol',
    layer: 4,
    type: 'Transport',
    description: {
      en: 'Connectionless, lightweight transport focusing on speed and minimal delay over reliability.',
      it: 'Protocollo di trasporto leggero non orientato alla connessione, focalizzato sulla velocità e latenza minima.'
    },
    useCase: {
      en: 'Real-time media streams, online gamings packet networks, DNS queries, and NTP synchronizations.',
      it: 'Streaming audio/video in tempo reale, multiplayer online, query DNS e sincronizzazione NTP.'
    },
    security: {
      en: 'Highly vulnerable to spoofed Source IPs, which makes it ideal for Reflective DDoS amplification attacks.',
      it: 'Vulnerabile al falsificamento dell\'IP sorgente, utile per sferrare attacchi amplificati DDoS riflessi.'
    },
    isSecure: false
  },
  {
    name: 'IP (IPv4 / IPv6)',
    fullName: 'Internet Protocol',
    layer: 3,
    type: 'Network',
    description: {
      en: 'Defines addressing layout and routing logic for routing packets across network boundaries.',
      it: 'Definisce la struttura degli indirizzi di rete e la logica di instradamento per muovere i pacchetti.'
    },
    useCase: {
      en: 'Uniquely labeling nodes in global and local segments and routing payloads via gateways.',
      it: 'Etichettare in modo univoco i sistemi terminali e instradare i dati attraverso i vari router.'
    },
    security: {
      en: 'Prone to IP Spoofing and fragmentation attacks (Teardrop). IPSec encrypts IP layers directly.',
      it: 'Soggetto a IP Spoofing e attacchi di frammentazione. IPSec aggiunge crittografia e autenticazione.'
    },
    isSecure: false
  },
  {
    name: 'ICMP',
    fullName: 'Internet Control Message Protocol',
    layer: 3,
    type: 'Network',
    description: {
      en: 'Operational control protocol for reporting network errors, gateway redirects, and troubleshooting metrics.',
      it: 'Protocollo di servizio diagnostico per segnalare errori di rete, problemi di routing e metriche.'
    },
    useCase: {
      en: 'Executing diagnostic commands like Ping (echo requests) and traceroute path calculations.',
      it: 'Esecuzione di comandi diagnostici di accessibilità come Ping e tracciamento rotte (traceroute).'
    },
    security: {
      en: 'Often abused for ICMP Smurf floods or Ping of Death exploits. Often blocked inside corporate firewalls.',
      it: 'Abusato per attacchi DDoS ICMP Flood o Ping of Death. Viene spesso disabilitato dai firewall aziendali.'
    },
    isSecure: false
  },
  {
    name: 'ARP',
    fullName: 'Address Resolution Protocol',
    layer: 2,
    type: 'Data Link',
    description: {
      en: 'Resolves dynamic IP layer logical addresses to hardcoded local MAC hardware addresses.',
      it: 'Mappa gli indirizzi IP (Livello 3) negli indirizzi hardware MAC fisici del canale locale (Livello 2).'
    },
    useCase: {
      en: 'Enabling local local-link Ethernet frames to target physical interfaces inside the same switch VLAN.',
      it: 'Consentire ai frame Ethernet locali di raggiungere le schede di rete fisiche dei vicini di switch.'
    },
    security: {
      en: 'Lacks authentication. Vulnerable to ARP Poisoning (MITM) where attackers spoof default gateway MACs.',
      it: 'Senza autenticazione. Vulnerabile ad ARP Poisoning (MITM) in cui si dirottano i flussi del router.'
    },
    isSecure: false
  },
  {
    name: 'FTP',
    fullName: 'File Transfer Protocol',
    layer: 7,
    type: 'Application',
    description: {
      en: 'A standard network protocol used for transfer of computer files between a client and server.',
      it: 'Protocollo standard per il trasferimento di file tra client e server in una rete.'
    },
    useCase: {
      en: 'Legacy website publishing or raw file sharing within legacy networks.',
      it: 'Pubblicazione di vecchi siti web o condivisione massiva di file in reti legacy.'
    },
    security: {
      en: 'Extremely insecure. Transmits usernames and passwords in cleartext. Prefer SFTP or FTPS.',
      it: 'Estremamente insicuro. Trasmette credenziali e dati in chiaro. Sostituire con SFTP o FTPS.'
    },
    isSecure: false
  },
  {
    name: 'TFTP',
    fullName: 'Trivial File Transfer Protocol',
    layer: 7,
    type: 'Application',
    description: {
      en: 'A very simple, lightweight file transfer protocol executing over UDP broadcasts.',
      it: 'Un protocollo di trasferimento file estremamente semplificato operante su UDP.'
    },
    useCase: {
      en: 'Booting diskless computer workstations or uploading firmware snapshots to switches.',
      it: 'Bootstrap di postazioni senza disco o caricamento firmware su switch e router.'
    },
    security: {
      en: 'Has zero authentication or encryption. Must be locked down to private local networks.',
      it: 'Nessuna autenticazione o crittografia. Deve essere isolato rigorosamente in reti locali protette.'
    },
    isSecure: false
  },
  {
    name: 'DHCP',
    fullName: 'Dynamic Host Configuration Protocol',
    layer: 7,
    type: 'Application',
    description: {
      en: 'Automatically assigns IP network settings (IP address, gateway, DNS) to joining client nodes.',
      it: 'Assegna automaticamente indirizzo IP, subnet mask, gateway e DNS ai computer client che si collegano.'
    },
    useCase: {
      en: 'Enabling plug-and-play connectivity for local network hosts, home routers and corporate networks.',
      it: 'Consente la connettività plug-and-play in reti aziendali, domestiche e Wi-Fi pubbliche.'
    },
    security: {
      en: 'Vulnerable to DHCP Starvation and Rogue DHCP server attacks (man-in-the-middle). Protect with DHCP Snooping.',
      it: 'Soggetto ad attacchi di DHCP Starvation e server DHCP fasulli. Proteggere con DHCP Snooping sugli switch.'
    },
    isSecure: false
  },
  {
    name: 'LDAP',
    fullName: 'Lightweight Directory Access Protocol',
    layer: 7,
    type: 'Application',
    description: {
      en: 'Industry standard for accessing and managing distributed directory services over a network.',
      it: 'Standard industriale per consultare e gestire servizi di directory (utenti, rubriche, stampanti) centralizzate.'
    },
    useCase: {
      en: 'Centralized authentication and Single Sign-On (SSO) in Microsoft Active Directory clusters.',
      it: 'Autenticazione centralizzata e sistemi di Single Sign-On (SSO) tramite Active Directory.'
    },
    security: {
      en: 'Lacks native encryption; credential queries are visible unless wrapped via LDAPS (port 636) or STARTTLS.',
      it: 'Le ricerche sono in chiaro di default; le credenziali vanno protette usando LDAPS (porta 636) o STARTTLS.'
    },
    isSecure: false
  },
  {
    name: 'IMAP & POP3',
    fullName: 'Interactive Mail Access / Post Office Protocol',
    layer: 7,
    type: 'Application',
    description: {
      en: 'Standard protocols for extracting, reading and managing emails deposited on a remote mail server.',
      it: 'Protocolli standard per recuperare, scaricare e organizzare i messaggi presenti sui server mail.'
    },
    useCase: {
      en: 'Connecting desktop mail programs (Outlook, Thunderbird) to retrieve and synchronize electronic letters.',
      it: 'Collegamento di programmi client (Outlook, Thunderbird) per leggere ed estrarre la posta elettronica.'
    },
    security: {
      en: 'Plaintext by default, exposing email messages and passwords. Always mandate secure SSL/TLS versions (IMAPS / POP3S).',
      it: 'In chiaro di default, esibendo messaggi e password. Richiedere l\'uso delle versioni TLS (IMAPS / POP3S).'
    },
    isSecure: false
  },
  {
    name: 'TLS / SSL',
    fullName: 'Transport Layer Security / Secure Sockets Layer',
    layer: 6,
    type: 'Presentation',
    description: {
      en: 'Cryptographic protocols designed to provide end-to-end communications security over a computer network.',
      it: 'Protocolli crittografici dedicati a garantire riservatezza, integrità ed autenticità della comunicazione.'
    },
    useCase: {
      en: 'Wrapping plaintext protocols (HTTP into HTTPS, IMAP into IMAPS, LDAP into LDAPS) securely.',
      it: 'Incapsulamento sicuro di canali vulnerabili (HTTP in HTTPS, IMAP in IMAPS, LDAP in LDAPS).'
    },
    security: {
      en: 'SSL and TLS 1.0/1.1 are obsolete and vulnerable (e.g., POODLE, BEAST). Enforce modern TLS 1.2 or TLS 1.3.',
      it: 'Le vecchie versioni SSL/TLS 1.0/1.1 sono deprecate e vulnerabili. Obbligare l\'uso di TLS 1.2 o TLS 1.3.'
    },
    isSecure: true
  },
  {
    name: 'BGP',
    fullName: 'Border Gateway Protocol',
    layer: 7,
    type: 'Application',
    description: {
      en: 'The routing backbone of the Internet, exchanging routing paths between distinct Autonomous Systems.',
      it: 'Il protocollo di routing dorsale di Internet, operante per connettere e instradare i flussi tra sistemi autonomi (AS).'
    },
    useCase: {
      en: 'Determining the optimal routing paths across global networks for major telecom ISPs and Cloud hubs.',
      it: 'Calcolo dei percorsi di transito ottimali su reti geografiche per operatori e data-center.'
    },
    security: {
      en: 'Lacks built-in validation, leading to BGP Route Hijacking. Mitigate using RPKI digital signatures.',
      it: 'Privo di validazione nativa degli annunci. Soggetto a BGP Hijacking. Mitigare con firme RPKI.'
    },
    isSecure: false
  },
  {
    name: 'OSPF',
    fullName: 'Open Shortest Path First',
    layer: 3,
    type: 'Network',
    description: {
      en: 'A link-state interior gateway routing protocol used to distribute routing information within a single network domain.',
      it: 'Protocollo di routing interno di tipo link-state per calcolare l\'itinerario di costo minimo in un\'organizzazione.'
    },
    useCase: {
      en: 'Dynamic auto-configuration of routing tables inside campus or enterprise local area network structures.',
      it: 'Configurazione dinamica delle tabelle di routing in reti LAN aziendali o infrastrutture complesse.'
    },
    security: {
      en: 'Vulnerable to routing table injection or route poisoning unless configured with cryptographic MD5 passwords.',
      it: 'Soggetto a iniezioni di rotte fasulle. Proteggere con chiavi crittografiche d\'area (autenticazione MD5).'
    },
    isSecure: false
  },
  {
    name: 'Ethernet',
    fullName: 'IEEE 802.3 Standard',
    layer: 2,
    type: 'Data Link / Physical',
    description: {
      en: 'The dominant wired local area network standard, defining frame structures, physical cables, and interface speeds.',
      it: 'La tecnologia cablata regina delle reti locali (LAN), che definisce frame Ethernet, cavi, pinout e velocità.'
    },
    useCase: {
      en: 'Transmitting encapsulated frames reliably over copper RJ45 or glass fiber optic connections.',
      it: 'Connessione fisica e passaggio di frame locali attraverso cavi ethernet in rame o fibra ottica.'
    },
    security: {
      en: 'Completely unencrypted. Subject to local wiretapping, MAC flooding, and local switch spoofing.',
      it: 'Nessuna cifratura. Soggetto a intercettazione su cavo, saturazione tabelle (MAC flood) e spoofing.'
    },
    isSecure: false
  },
  {
    name: 'Wi-Fi (IEEE 802.11)',
    fullName: 'Wireless Local Area Network standard',
    layer: 2,
    type: 'Data Link / Physical',
    description: {
      en: 'Over-the-air communication standard allowing mobile nodes to communicate using radio waves.',
      it: 'Standard di comunicazione radio per collegare dispositivi mobili a reti locali senza l\'uso di cavi.'
    },
    useCase: {
      en: 'Providing local networking access for smartphones, laptops, and smart home IoT appliances wirelessly.',
      it: 'Punto di acesso radio flessibile per smartphone, portatili e domotica.'
    },
    security: {
      en: 'WPA2/WPA3 keys are highly advised. Vulnerable to twin-ap evil twin attacks or rogue wireless beacons.',
      it: 'Crittografia WPA2 o WPA3 obbligatoria. Vulnerabile ad attacchi Evil Twin (finto access point) o password deboli.'
    },
    isSecure: true
  }
];

interface DeviceInfo {
  name: string;
  fullName: string;
  layer: string;
  category: 'security' | 'networking' | 'infrastructure';
  role: { en: string; it: string };
  howItWorks: { en: string; it: string };
  securityAttacks: { en: string; it: string };
  cannotStop: { en: string; it: string };
  mitigation: { en: string; it: string };
  iconName: 'Shield' | 'Shuffle' | 'Network' | 'Activity' | 'Radio' | 'Cpu' | 'Server';
}

const DEVICE_REGISTRY: DeviceInfo[] = [
  {
    name: 'FW-PF - Stateless Firewall',
    fullName: 'Packet Filtering Firewall (Stateless)',
    layer: 'Layer 3, 4 (Network/Transport)',
    category: 'security',
    role: {
      en: 'Inspects and filters individual packets statically based on IP addresses, ports, and protocols without tracking session context.',
      it: 'Ispeziona staticamente i singoli pacchetti in base a IP, porte e protocollo, senza tenere traccia dello stato della sessione.'
    },
    howItWorks: {
      en: 'Compares each incoming packet against access control lists (ACLs). It decides to permit or deny packets in total isolation from other packets.',
      it: 'Confronta ogni singolo pacchetto in ingresso con le liste di controllo accessi (ACL) e decide se farlo passare disinteressandosi del contesto.'
    },
    securityAttacks: {
      en: 'Fenders off IP addresses outside permitted subnets, blocks access to closed port ranges, and filters basic ICMP floods.',
      it: 'Respinge indirizzi IP non appartenenti a subnet autorizzate, blocca l\'accesso a range di porte chiuse e filtra attacchi ICMP flood di base.'
    },
    cannotStop: {
      en: 'Session hijacking, ACK storms, or malformed protocol payloads. Because it is stateless, it cannot verify if an incoming packet is a legitimate, expected reply or an out-of-order spoof.',
      it: 'Session Hijacking, ACK flood o exploit applicativi. Essendo privo di stato (stateless), non può verificare se un pacchetto in ingresso sia una risposta attesa o una falsificazione fuori sequenza.'
    },
    mitigation: {
      en: 'Upgrade immediately to stateful inspection firewalls (Stateful FW) or next-generation firewalls (NGFW) to track TCP stream states.',
      it: 'Migrare immediatamente a firewall stateful o next-generation (NGFW) in grado di tracciare le sessioni e verificare i flussi TCP.'
    },
    iconName: 'Shield'
  },
  {
    name: 'FW-SI - Stateful Firewall',
    fullName: 'Stateful Inspection Firewall',
    layer: 'Layer 3, 4 (Network/Transport)',
    category: 'security',
    role: {
      en: 'Monitors the state of active network connections, allowing incoming traffic only if it matches a valid, established outbound request.',
      it: 'Rileva e traccia lo stato delle connessioni di rete attive, consentendo l\'ingresso solo al traffico in risposta a flussi interni legittimi.'
    },
    howItWorks: {
      en: 'Maintains an active State Table of all established connections (tracking source/destination IP, port numbers, and TCP sequence states).',
      it: 'Mantiene una Tabella degli Stati attiva con tutte le connessioni in corso (abbinando IP di origine/destinazione, porte e numeri di sequenza TCP).'
    },
    securityAttacks: {
      en: 'Blocks unsolicited inbound connection requests, unauthorized port scans, and out-of-sequence packet injection attempts.',
      it: 'Blocca connessioni esterne impreviste non sollecitate, tentativi di port scanning e iniezioni di pacchetti fuori sequenza.'
    },
    cannotStop: {
      en: 'SQL Injections, Cross-Site Scripting (XSS), and content-based malware. Since it only checks protocol session compliance (Layer 4), it remains completely blind to malicious payloads wrapped inside valid connections.',
      it: 'SQL Injection, Cross-Site Scripting (XSS) e malware. Controllando solo la conformità della connessione di trasporto (Layer 4), ignora completamente il contenuto applicativo inserito all\'interno del flusso autorizzato.'
    },
    mitigation: {
      en: 'Deploy in combination with Web Application Firewalls (WAF) to inspect Layer 7 web payloads, and IPS for signature-level malware detection.',
      it: 'Associare a dispositivi Web Application Firewall (WAF) per esaminare payload web al Layer 7 e sistemi IPS per rilevare codice dall\'interno.'
    },
    iconName: 'Shield'
  },
  {
    name: 'FW-PX - Proxy Firewall',
    fullName: 'Application-Level Proxy Firewall',
    layer: 'Layer 7 (Application)',
    category: 'security',
    role: {
      en: 'Acts as an intermediary between client and server, establishing independent connections to fully isolate external hosts from the internal network.',
      it: 'Intermedia l\'intera sessione tra client e server, aprendo due connessioni separate per isolare del tutto i server interni dalle minacce esterne.'
    },
    howItWorks: {
      en: 'Intercepts incoming application requests, performs thorough payload validation and validation of specific commands (e.g. HTTP, FTP), then establishes a new separate connection to the destination.',
      it: 'Intercetta le richieste applicative esterne, esegue una validazione profonda e sintattica dei messaggi, e avvia una nuova connessione autonoma verso il server.'
    },
    securityAttacks: {
      en: 'Prevents indirect network exploits, filters forbidden application commands, blocks malformed protocols, and hides internal IP addresses.',
      it: 'Previene exploit indiretti a livello di rete, disabilita comandi applicativi non permessi, corregge anomalie e nasconde gli IP reali interni.'
    },
    cannotStop: {
      en: 'Zero-day exploits targeted directly at vulnerabilities in the Proxy daemon/software itself, or high-volume DDoS attacks that overwhelm the CPU resource limits of the proxy host.',
      it: 'Zero-day mirati a vulnerabilità specifiche presenti nello stesso applicativo software del Proxy, o attacchi DDoS massivi che ne esauriscono la CPU.'
    },
    mitigation: {
      en: 'Regularly patch proxy software, perform OS hardening, and configure load balancers to distribute high-volume traffic.',
      it: 'Aggiornare regolarmente il software del proxy, effettuare l\'hardening del sistema operativo ed impostare bilanciatori a monte.'
    },
    iconName: 'Server'
  },
  {
    name: 'FW-KPF - Kernel Proxy',
    fullName: 'Kernel Proxy Firewall',
    layer: 'Layer 5, 6, 7 (Session/Presentation/Application)',
    category: 'security',
    role: {
      en: 'Performs high-performance application-level proxy inspections directly within the operating system kernel, rather than slow user space.',
      it: 'Esegue un\'ispezione proxy approfondita dei protocolli applicativi direttamente nello spazio del kernel del sistema operativo, massimizzando le performance.'
    },
    howItWorks: {
      en: 'Spawns dynamic virtual protocol stacks natively inside the kernel to validate application compliance at close to network interfaces line speeds.',
      it: 'Genera uno stack di protocollo virtuale direttamente nel kernel dell\'OS, analizzando i dati applicativi quasi alla velocità dell\'interfaccia fisica.'
    },
    securityAttacks: {
      en: 'Filters unauthorized high-speed application streams, drops complex application bypass tries, and blocks protocol parameter evasion.',
      it: 'Scherma canali applicativi sospetti ad alta velocità, neutralizza deviazioni sofisticate e blocca tentativi di bypass dei parametri di protocollo.'
    },
    cannotStop: {
      en: 'Credential theft (phishing) or insider corporate espionage. If an attacker possesses legitimate login keys, the kernel proxy has no way of recognizing malicious intent because the transaction perfectly aligns with standard protocol rules.',
      it: 'Furto di credenziali (phishing) o spionaggio interno. Se un attaccante possiede chiavi o credenziali di login valide, il kernel proxy farà transitare il flusso poiché formalmente impeccabile e conforme al protocollo.'
    },
    mitigation: {
      en: 'Deploy robust Multi-Factor Authentication (MFA), role-based privilege checks, and implement behavioral system auditing.',
      it: 'Abilitare robuste autenticazioni a più fattori (MFA), controlli granulari dei privilegi ed ispezionare i log dei comportamenti utente.'
    },
    iconName: 'Cpu'
  },
  {
    name: 'WAF - Web Application Firewall',
    fullName: 'Web Application Firewall',
    layer: 'Layer 7 (Application)',
    category: 'security',
    role: {
      en: 'Monitors, filters, and blocks HTTP/HTTPS web traffic explicitly aimed at exploiting flaws in public-facing web applications.',
      it: 'Monitora, filtra e blocca il traffico web HTTP/HTTPS diretto ai server aziendali, neutralizzando attacchi mirati ai portali web.'
    },
    howItWorks: {
      en: 'Analyzes HTTP request components (GET parameters, POST bodies, cookies, and headers) against signatures (OWASP Top 10) and anomaly templates.',
      it: 'Esamina le richieste web (parametri GET, messaggi POST, cookie e intestazioni) confrontandole con elenchi di firme d\'attacco (OWASP Top 10).'
    },
    securityAttacks: {
      en: 'Stops SQL Injection (SQLi), Cross-Site Scripting (XSS), Local/Remote File Inclusion (LFI/RFI), and credential stuffing.',
      it: 'Arresta SQL Injection (SQLi), Cross-Site Scripting (XSS), inclusioni di file locali/remoti (LFI/RFI) e attacchi di credential stuffing.'
    },
    cannotStop: {
      en: 'Layer 3/4 volumetric floods (like SYN flood or UDP/NTP reflection). Siting high up in the application layer, the WAF cannot stop lower-level floods from fully saturating the internet link before the web packets can even be received.',
      it: 'Attacchi volumetrici di rete ai Layer 3/4 (es. SYN floods o riflessione UDP/NTP). Essendo posizionato al livello applicativo, non può impedire ad un flood massivo a valle di saturare la banda fisica del link internet a monte.'
    },
    mitigation: {
      en: 'Partner with cloud-based Anycast DDoS mitigation engines (e.g. Cloudflare, Akamai) to filter network floods before they hit the perimeter.',
      it: 'Adottare soluzioni cloud di mitigazione DDoS basate su Anycast (es. Cloudflare) per digerire i flood di rete a livello geografico.'
    },
    iconName: 'Shield'
  },
  {
    name: 'UTM - Unified Threat Security',
    fullName: 'Unified Threat Management',
    layer: 'Multi-Layer (Layers 3, 4, 5, 7)',
    category: 'security',
    role: {
      en: 'Consolidates multiple network defense tools (firewall, network antivirus, IPS, content filtering) into a centralized, easy-to-manage device.',
      it: 'Fonde diverse funzionalità defensive (firewall, antivirus di rete, prevenzione delle intrusioni, filtro web) in un unico apparato consolidato.'
    },
    howItWorks: {
      en: 'Executes single-pass deep packet scanning, running incoming streams through a sequence of defense engines located in one hardware appliance.',
      it: 'Esegue un\'ispezione multi-motore in un unico passaggio, canalizzando i pacchetti in motori sequenziali di controllo antivirus, firewall e IPS.'
    },
    securityAttacks: {
      en: 'Blocks known network worms, malware file transfers, malicious active spam, and connections to known botnets.',
      it: 'Neutralizza worm di rete conosciuti, download di malware firmati, spam e connessioni verso server di comando botnet.'
    },
    cannotStop: {
      en: 'Untracked zero-day attacks leveraging proprietary compression/obfuscation algorithms, or internal lateral attacks. If an office computer gets infected via USB, the perimeter UTM cannot stop it from infecting other LAN machines over physical switches.',
      it: 'Attacchi zero-day cifrati con algoritmi proprietari fuori firma, o attacchi interni laterali. Se un PC in ufficio viene infettato da USB, la UTM perimetrale è cieca sui movimenti laterali che si propagano sullo switch locale.'
    },
    mitigation: {
      en: 'Configure strict LAN micro-segmentation, and install Host Endpoint Detection and Response (EDR) software on all workstations.',
      it: 'Abilitare la microsegmentazione locale sulla rete LAN locale e installare agenti EDR (Endpoint Detection and Response) sugli host.'
    },
    iconName: 'Cpu'
  },
  {
    name: 'NGFW - Next-Generation FW',
    fullName: 'Next-Generation Firewall',
    layer: 'Layer 3, 4, 7 (Application & Port Aware)',
    category: 'security',
    role: {
      en: 'Provides deep control by combining a typical stateful firewall with integrated IPS, user identity checks, and application awareness.',
      it: 'Ottiene un controllo pervasivo integrando un tipico firewall stateful con ispezione IPS attiva e l\'identificazione degli utenti e delle app.'
    },
    howItWorks: {
      en: 'Conducts Deep Packet Inspection (DPI) to identify and classify the exact application (e.g. telling Facebook Chat apart from a file transfer) regardless of ports.',
      it: 'Esegue Deep Packet Inspection (DPI) per decrittare e identificare l\'esatto servizio (es. distinguendo Facebook Chat da un trasferimento FTP) a prescindere dalle porte.'
    },
    securityAttacks: {
      en: 'Detects protocol evasions (dynamic ports), server exploits using malicious file attachments on standard ports, and anomalous flows.',
      it: 'Rileva deviazioni di protocollo su porte dinamiche, exploit diretti ai server tramite allegati dannosi scambiati su porte standard.'
    },
    cannotStop: {
      en: 'Encrypted malicious traffic inside HTTPS/TLS streams unless active SSL decryption is deployed, and attacks capitalizing on unpatched client-side system configurations once inside.',
      it: 'Traffico malevolo crittografato all\'interno di canali HTTPS se la decrittografia SSL (SSL Decrypt) è spenta, e attacchi focalizzati su configurazioni locali deboli.'
    },
    mitigation: {
      en: 'Enable SSL/TLS inspection profiles on the NGFW, and mandate central security patches update cycles.',
      it: 'Attivare i profili di ispezione SSL/TLS (SSL Decryption) sul firewall e velocizzare i cicli di installazione delle patch.'
    },
    iconName: 'Shield'
  },
  {
    name: 'RTR - Network Router',
    fullName: 'Network Router',
    layer: 'Layer 3 (Network)',
    category: 'networking',
    role: {
      en: 'Interconnects different subnets and routes IP packet flows dynamically across global network boundaries.',
      it: 'Interconnette reti e sottoreti diverse, calcolando i tragitti ottimali per instradare dinamicamente i pacchetti IP.'
    },
    howItWorks: {
      en: 'Parses destination IP addresses from IP headers and references local routing tables (OSPF, BGP) to send packets to the correct next hop.',
      it: 'Analizza gli IP di destinazione inseriti nell\'header dei pacchetti e interroga la tabella di instradamento locale (OSPF, BGP) per selezionare l\'hop successivo.'
    },
    securityAttacks: {
      en: 'IP Directed Broadcast magnification, IP routing loops, basic IP spoofing (using Unicast RPF controls), and simple route failures.',
      it: 'Scongiura attacchi ad amplificazione broadcast IP, loop infiniti di instradamento ed esegue controlli anti-spoofing via uRPF.'
    },
    cannotStop: {
      en: 'Layer 2 local segment exploits (such as localized MAC Flooding or ARP Spoofing). Since routers deal strictly with IP addresses, they ignore frame activity exchange inside the local managed switch segment.',
      it: 'Attacchi interni a livello Layer 2 (come ARP Poisoning o flooding della tabella CAM). Il router opera solo sugli indirizzi IP e non ha alcun controllo sul traffico diretto dei frame locali tra PC e switch.'
    },
    mitigation: {
      en: 'Configure Dynamic ARP Inspection (DAI) and secure DHCP Binding tables on downstream LAN switches.',
      it: 'Abilitare sui controlli degli switch adiacenti filtri quali Dynamic ARP Inspection (DAI) e DHCP Snooping.'
    },
    iconName: 'Shuffle'
  },
  {
    name: 'SW - Ethernet Switch',
    fullName: 'Layer 2 Ethernet Switch',
    layer: 'Layer 2 (Data Link)',
    category: 'networking',
    role: {
      en: 'Directs digital communication frames locally within the same network segment, avoiding packet collisions.',
      it: 'Inoltra i frame dei dati in modo mirato e ad alta velocità tra le macchine collegate all\'interno dello stesso segmento fisico.'
    },
    howItWorks: {
      en: 'Builds a dynamic Content Addressable Memory (CAM) table matching target MAC hardware addresses to physical switch interfaces.',
      it: 'Compone una tabella di memoria associativa (tabella CAM) per abbinare ciascun indirizzo MAC fisico alla porta corretta.'
    },
    securityAttacks: {
      en: 'Intercepts simple physical cable sniffing, mitigates basic STP root bridges displacement attempts (BPDU Guard), and regulates VLAN access.',
      it: 'Attenua lo sniffing isolando i flussi sulle porte, contrasta furti del ruolo Root STP con filtri BPDU Guard e gestisce l\'appartenenza alle VLAN.'
    },
    cannotStop: {
      en: 'Layer 7 application exploits (SQL injection, malicious script payloads in files, or logic overflows). The switch processes physical frame headers in copper/silicon, meaning it is blind to what data travels inside the payload.',
      it: 'Attacchi applicativi del Layer 7 (SQL Injection, XSS, file infetti). Lo switch opera a livello di impulsi e indirizzi hardware, restando ignaro del significato dei file che transitano all\'interno del payload.'
    },
    mitigation: {
      en: 'Route segment transit traffic through a stateful firewall and enforce strict endpoint Antivirus software routines.',
      it: 'Instradare il traffico critico verso un firewall perimetrale e installare antivirus aggiornati su tutti gli host della LAN.'
    },
    iconName: 'Network'
  },
  {
    name: 'WAP - Wireless AP',
    fullName: 'Wireless Access Point',
    layer: 'Layer 2 (Data Link)',
    category: 'networking',
    role: {
      en: 'Bridges radio-frequency wireless networks to the physical wired Ethernet infrastructures.',
      it: 'Funge da punto di raccordo isolando l\'etere radio e traducendo i pacchetti wireless in frame cablati Ethernet.'
    },
    howItWorks: {
      en: 'Establishes local encrypted radio links, coordinates client access, and wraps wireless frames into standard RJ45 cable structures.',
      it: 'Stabilisce collegamenti radio cifrati, organizza l\'handshake d\'accesso dei client wireless e ne incapsula il traffico sul cavo standard.'
    },
    securityAttacks: {
      en: 'Filters unauthorized over-the-air packet snooping with standard WPA3 encryption, and screens out rogue mac links.',
      it: 'Previene l\'intercettazione passiva radio imponendo cifratura WPA3 e rifiuta connessioni basate su liste fisse di MAC nocivi.'
    },
    cannotStop: {
      en: 'Physical Layer 1 Radio Frequency (RF) jamming. A nearby malicious radio transmitter broadcasting noise on the 2.4GHz/5GHz bands will block antennae reception completely, regardless of logical encryption strength.',
      it: 'Disturbo fisico a radiofrequenza o Jamming del Layer 1. Se un trasmettitore posizionato nelle vicinanze inonda gli spettri 2.4GHz/5GHz di rumore bianco, renderà le antenne sorde a prescindere da qualunque cifratura logica WPA3.'
    },
    mitigation: {
      en: 'Run active spectrum analyzers, implement shielded premises design, and use physical directional antennas to isolate interference sources.',
      it: 'Impiegare analizzatori di spettro wireless per tracciare le emissioni di disturbo ed utilizzare antenne ad array direzionale.'
    },
    iconName: 'Radio'
  },
  {
    name: 'GWY - Protocol Gateway',
    fullName: 'Application & Protocol Gateway',
    layer: 'Layer 3 to 7 (Multi-Layer)',
    category: 'infrastructure',
    role: {
      en: 'Connects and converts communication between completely dissimilar network environments, architectures, or interfaces.',
      it: 'Interconnette e traduce comunicazioni provenienti da sistemi o interfacce del tutto discordi nel profondo.'
    },
    howItWorks: {
      en: 'Terminates connections from protocol A, extracts payload data, translates parameters, and repackages it according to protocol B.',
      it: 'Interrompe la connessione percorsa con un protocollo A, estrae i dati per rimodularli e li riesprime conformandoli alle regole del protocollo B.'
    },
    securityAttacks: {
      en: 'Resolves syntax incompatibilities, stops direct external-to-internal network command injection, and mitigates basic buffer bugs during rewrite.',
      it: 'Individua incompatibilità sintattiche strutturali, impedisce l\'esecuzione diretta di comandi non filtrati e corregge errori minori.'
    },
    cannotStop: {
      en: 'Logical or malicious instructions sent by authenticated, approved internal programs. If an approved script orders the deletion of database tables, the gateway will process the command anyway.',
      it: 'Comandi dannosi lanciati da utenze o programmi interni già autenticati e abilitati. Se un demone autorizzato inoltra un comando distruttivo, il Gateway lo tradurrà ed eseguirà ritenendolo lecito per i privilegi posseduti.'
    },
    mitigation: {
      en: 'Apply robust behavioral tracking, enforce granular API rate ceilings, and monitor complete activity logs.',
      it: 'Applicare sistemi di tracciamento dei comportamenti, definire severe quote di utilizzo (rate limit) ed analizzare regolarmente i log.'
    },
    iconName: 'Cpu'
  },
  {
    name: 'BDG - Network Bridge',
    fullName: 'Hardware Network Bridge',
    layer: 'Layer 2 (Data Link)',
    category: 'networking',
    role: {
      en: 'Connects and divides two distinct physical network links, isolating collision domains locally.',
      it: 'Raccorda e segmenta due tratte di cavo differenti della stessa rete locale, riducendo lo spreco di collisioni elettriche.'
    },
    howItWorks: {
      en: 'Tracks physical MAC addresses seen on interfaces and lets a frame cross only if the target MAC resides on the opposite segment.',
      it: 'Rileva e tiene traccia dei MAC address avvistati sulle porte, consentendo il transito da una tratta all\'altra solo se il PC destinatario è realmente sull\'altro lato.'
    },
    securityAttacks: {
      en: 'Keeps excessive localized cabling noise isolated and helps filter simple local network loop creations.',
      it: 'Contiene e circoscrive la propagazione di tempeste elettriche e scherma anomalie di cablaggio minori.'
    },
    cannotStop: {
      en: 'Dynamic Routing Protocol injections (such as fake OSPF or RIP routing updates). Operating entirely at Layer 2, the bridge only reads MAC addresses and transparently forwards malicious route updates to routers downstream.',
      it: 'Iniezioni di annunci di routing dinamico fasulli (es. pacchetti OSPF o RIP falsificati). Lavorando esclusivamente sul Layer 2 hardware, il bridge è cieco sulle informazioni IP e farà transitare indisturbati questi annunci venefici.'
    },
    mitigation: {
      en: 'Implement cryptographic authentication in downstream routing protocols (such as OSPF with MD5 keys).',
      it: 'Configurare i router connessi con chiavi di autenticazione crittografica per i protocolli (es. OSPF protetto da MD5).'
    },
    iconName: 'Server'
  },
  {
    name: 'HUB - Network Hub',
    fullName: 'Passive Ethernet Hub',
    layer: 'Layer 1 (Physical)',
    category: 'networking',
    role: {
      en: 'A historic multiport repeater that extends local wiring lines by physically broadcasting received electrical signals across all interfaces.',
      it: 'Dispositivo obsoleto che prolunga e ripartisce le tratte Ethernet rigenerando e sparando i segnali elettrici a tutte le porte.'
    },
    howItWorks: {
      en: 'Lacks chips, memory tables, or state checking. Repeats any incoming electrical voltage wave to all connected target interfaces.',
      it: 'Privo di processore intelligente o tabelle di memoria. Copia elettricamente qualsiasi onda di tensione ricevuta verso ogni altra porta.'
    },
    securityAttacks: {
      en: 'Possesses zero intelligence or defensive mechanisms. It is incapable of identifying or stopping any style of attack.',
      it: 'Nessuno. Totalmente sprovvisto di logica, non è fisicamente in grado di intercettare, arginare o isolare alcuna minaccia.'
    },
    cannotStop: {
      en: 'ANY style of threat (packet sniffing, MAC spoofing, ARP poisoning, DDoS floods). Because it is a simple physical repeater, any laptop connected to a port can capture all network frames flowing between other hosts in cleartext using a sniffer (Wireshark).',
      it: 'Qualsiasi minaccia informatica (sniffing dei dati, MAC spoofing, ARP poisoning, attacchi DDoS). Essendo un semplice ripetitore fisico, chiunque si colleghi ad una spina dell\'hub intercetta in tempo reale ed in chiaro tutte le comunicazioni degli altri host.'
    },
    mitigation: {
      en: 'Decommission and replace all active hubs with secure modern managed switches immediately.',
      it: 'Dismettere e rimpiazzare all\'istante ogni vecchio hub con moderni switch gestiti, e sigillare fisicamente le prese libere.'
    },
    iconName: 'Activity'
  },
  {
    name: 'NIDS - Network IDS (Passive)',
    fullName: 'Network Intrusion Detection System',
    layer: 'Layer 3, 4, 7 (Network/Transport/Application)',
    category: 'security',
    role: {
      en: 'Passively monitors network traffic copies (via port mirroring or TAPs) to detect suspicious patterns, active scans, or signature matches, generating real-time security alerts.',
      it: 'Monitora passivamente le copie del traffico di rete (tramite port mirroring o TAP fisici) per identificare pattern sospetti, scansioni ostili o corrispondenze di firme d\'attacco, generando avvisi di sicurezza.'
    },
    howItWorks: {
      en: 'Receives mirrored traffic out-of-band, meaning it does not sit directly in the network path. It inspects copies of frames against an extensive signature file database or behavioral baselines.',
      it: 'Riceve il traffico duplicato fuori banda (non si interpone nel tragitto reale dei pacchetti). Esamina le copie dei frame confrontandole con un database di firme d\'attacco o comportamenti anomali.'
    },
    securityAttacks: {
      en: 'Identifies slow port scanning sweeps, brute-force attempts, worm replication activities, and known software vulnerabilities exploits without impacting network performance.',
      it: 'Individua scansioni di porte (port scanning) striscianti, attacchi brute-force, replicazioni di worm di rete e tentativi noti di exploit senza rallentare la velocità fisica della rete.'
    },
    cannotStop: {
      en: 'Any active attack in real time. Because it processes a copy of the traffic out-of-band (after packets have already reached their destination), it can ONLY log and alert, keeping the network running but unable to drop the malicious packets directly.',
      it: 'Nessun attacco attivo in tempo reale. Poiché analizza una copia del traffico fuori banda (quando i pacchetti hanno già raggiunto la destinazione), può SOLO registrare e allertare, ma non ha il potere di bloccare il transito.'
    },
    mitigation: {
      en: 'Feed NIDS alerts directly into a SIEM or active SOAR platform to trigger firewall block rules or script dynamic ACL changes on perimetral devices.',
      it: 'Incanalare i log del NIDS in un SIEM o una piattaforma SOAR per attivare automaticamente script di blocco o variazioni dinamiche delle ACL sui firewall di perimetro.'
    },
    iconName: 'Activity'
  },
  {
    name: 'NIPS - Network IPS (Active inline)',
    fullName: 'Network Intrusion Prevention System',
    layer: 'Layer 3, 4, 7 (Network/Transport/Application)',
    category: 'security',
    role: {
      en: 'Deploys inline (directly in the network path) to actively inspect packets in real-time, instantly blocking, dropping, or sanitizing malicious connections.',
      it: 'Si posiziona in-linea (direttamente nel percorso attivo del traffico) per ispezionare i pacchetti in tempo reale, bloccando, scartando o sanificando all\'istante le connessioni dannose.'
    },
    howItWorks: {
      en: 'Requires traffic to flow physically through the appliance. If a packet payload matches an exploit signature or anomaly threshold, the device discards the frame, resets the TCP session, or rewrites parameters before forwarding.',
      it: 'Richiede che il traffico fluisca fisicamente attraverso l\'hardware. In caso di corrispondenza con firme nocive o anomalie, scarta istantaneamente il pacchetto, forza il reset TCP o ne modifica i parametri.'
    },
    securityAttacks: {
      en: 'Halts remote code execution (RCE) attempts, command injections, active denial of service floods, and network-level buffer overflows before they reach targets.',
      it: 'Arresta attacchi di Remote Code Execution (RCE), command injection, flood per Denial of Service (DoS) e buffer overflow di rete prima che colpiscano i server.'
    },
    cannotStop: {
      en: 'Heavily encrypted traffic payloads (SSL/TLS) if not equipped with decryption modules, or zero-day zero-signature execution sequences. Also presents a single point of failure: if it crashes, it can sever the physical link.',
      it: 'Traffico cifrato (SSL/TLS) se non provvisto di moduli di ispezione crittografica (SSL decryption), o minacce zero-day inedite. Inoltre, rappresenta un single point of failure: se va in crash o è sovraccarico, blocca fisicamente la linea.'
    },
    mitigation: {
      en: 'Enable SSL/TLS decryption proxies, configure bypass network taps with fail-open hardware configurations, and ensure automated, daily signature updates.',
      it: 'Abilitare proxy di decrittografia SSL/TLS, dotare l\'hardware di schede bypass fail-open per non interrompere il cavo in caso di guasto elettrico, e impostare aggiornamenti firme giornalieri.'
    },
    iconName: 'Shield'
  },
  {
    name: 'NDR - Network Detection & Response',
    fullName: 'Network Detection & Response (AI Network Monitor)',
    layer: 'Layer 3, 4, 7 (Network & Traffic Analytics)',
    category: 'security',
    role: {
      en: 'Monitors raw network flows (NetFlow/IPFIX) and packets using machine learning to detect advanced network-wide anomalies, Command & Control (C2) channels, and user credential abuse.',
      it: 'Rileva minacce latenti analizzando i flussi di rete (NetFlow/IPFIX) tramite algoritmi intelligenti per scovare canali di comando e controllo (C2), anomalie di traffico di massa ed abusi di credenziali.'
    },
    howItWorks: {
      en: 'Analyzes metadata of peer-to-peer conversations across the subnet to map normal behavior. When a host begins unexpected lateral database scanning or huge outbound packet bulk transfers, it isolates the network port.',
      it: 'Analizza i metadati delle conversazioni di rete tra tutti gli host configurando una linea di normalità. Non appena un client effettua trasferimenti insoliti verso server esteri o scansioni interne, lo isola.'
    },
    securityAttacks: {
      en: 'Unveils highly hidden Command & Control beaconing, advanced persistent threats (APT) pivoting, covert DNS tunneling leaks, and large-scale data exfiltration.',
      it: 'Svela traffici silenti verso server Command & Control (beaconing), spostamenti laterali di hacker, esfiltrazioni silenziose di database via DNS tunneling e anomalie massive.'
    },
    cannotStop: {
      en: 'Malicious processes running locally on endpoints that generate zero network traffic, or highly fragmented traffic mimicking authentic web browsing patterns.',
      it: 'Processi dannosi che agiscono solo in locale sul singolo PC senza fare alcuna chiamata di rete, o traffico cifrato spezzettato e sagomato per assomigliare esattamente ad una navigazione web lecita.'
    },
    mitigation: {
      en: 'Integrate NDR with inline NAC or core directory systems to revoke access of suspicious IPs automatically within seconds.',
      it: 'Agganciare l\'NDR a sistemi di controllo dell\'accesso alla rete (NAC) o al firewall core per tagliare immediatamente i permessi dell\'IP sospetto alla prima anomalia.'
    },
    iconName: 'Activity'
  },
  {
    name: 'WIDS - Wireless IDS (Air Monitor)',
    fullName: 'Wireless Intrusion Detection System',
    layer: 'Layer 1, 2 (Physical & Data Link - RF Spectrum)',
    category: 'security',
    role: {
      en: 'Monitors the local radio frequency (RF) spectrum to identify unauthorized access points (rogue APs), packet injection attacks, and wireless jamming attempts.',
      it: 'Monitora passivamente lo spettro delle frequenze radio (RF) alla ricerca di Access Point non autorizzati (Rogue AP), iniezioni di pacchetti wireless e tentativi di jamming (disturbo del segnale).'
    },
    howItWorks: {
      en: 'Uses distributed sensor antennas to scan Wi-Fi bands, parsing 802.11 management frames (beacons, probe requests, dissociation frames) to flag MAC address anomalies and unlisted emitters.',
      it: 'Utilizza sensori antenna distribuiti per scansionare le bande Wi-Fi, analizzando i frame di gestione 802.11 (beacon, probe, deauth) per scovare anomalie nei MAC address o emittenti estranei.'
    },
    securityAttacks: {
      en: 'Detects Evil Twin attacks, deauthentication floods, MAC spoofing on the air interface, and active RF jamming/interference engines.',
      it: 'Rileva attacchi Evil Twin, attacchi di deautenticazione (Deauth Flood), MAC spoofing via radio e generatori di interferenza RF dolosa (Jamming).'
    },
    cannotStop: {
      en: 'The wireless transmission of frames. Since it operates as a passive observer, it cannot block clients physically from associating with a rogue AP or prevent raw physical radio noise from disrupting the airwaves.',
      it: 'La trasmissione radio fisica dei frame. Essendo un sensore puramente passivo, non può fisicamente impedire ai client di associarsi ad un AP malevolo, né può bloccare il rumore radio di disturbo fisico nello spettro.'
    },
    mitigation: {
      en: 'Position wireless sensors uniformly to eliminate signal dead zones, integrate with wired switch catalogs for port containment (shutting down switch ports feeding rogue APs).',
      it: 'Posizionare sensori dislocati in modo uniforme per annullare i coni d\'ombra di segnale, e integrare il sistema con switch cablati per disattivare la porta fisica che alimenta l\'AP illegale.'
    },
    iconName: 'Radio'
  },
  {
    name: 'WIPS - Wireless IPS (Air Blocker)',
    fullName: 'Wireless Intrusion Prevention System',
    layer: 'Layer 1, 2 (Physical & Data Link - RF Spectrum)',
    category: 'security',
    role: {
      en: 'Actively interrupts unauthorized wireless connections and blocks client authentication to rogue APs over the air.',
      it: 'Interrompe attivamente le connessioni wireless non autorizzate e blocca al volo i tentativi di associazione ad AP illegali o sospetti via radio.'
    },
    howItWorks: {
      en: 'Upon detecting a rogue client or AP, it spoofs deauthentication frames targeting the target MAC addresses, forcing continuous wireless disconnections.',
      it: 'All\'invocazione di un AP o client illegale, genera e trasmette frame di deautenticazione (Deauth) falsificati diretti ai loro MAC address, forzando la disconnessione immediata.'
    },
    securityAttacks: {
      en: 'Neutralizes Evil Twin connections, blocks rogue ad-hoc networks, and shuts down unapproved client-to-client Wi-Fi bridging.',
      it: 'Sgretola sul nascere connessioni ad AP pirata (Evil Twin), inibisce reti wireless ad-hoc non consentite e interrompe ponti radio (bridging) wifi non registrati.'
    },
    cannotStop: {
      en: 'Passive Wi-Fi frame sniffing or custom radio wave jamming that does not comply with 802.11 modulation structures.',
      it: 'Lo sniffing passivo delle onde radio (che avviene senza trasmettere nulla) o attacchi di jamming fisico di spettro che oscurano completamente l\'antenna di ricezione.'
    },
    mitigation: {
      en: 'Configure proper classification rules to avoid target blacklisting of neighbor residential APs, and transition to Protected Management Frames (PMF / 802.11w) to secure management packets against spoofed deauth.',
      it: 'Definire filtri di classificazione rigorosi per non attaccare gli AP residenziali vicini di casa, e migrare i propri AP standard a Protected Management Frames (PMF / 802.11w) per rendere inefficaci i finti deauth.'
    },
    iconName: 'Shield'
  },
  {
    name: 'HIDS - Host IDS (Endpoint Monitor)',
    fullName: 'Host Intrusion Detection System',
    layer: 'Layer 7 (Application & Operating System)',
    category: 'security',
    role: {
      en: 'Monitors local system components, integrity databases, and application event logs directly on a specific server or endpoint for insider threats or breach indicators.',
      it: 'Monitora le componenti di sistema locali, i database di integrità ed i log degli eventi direttamente su un server o computer specifico, identificando minacce interne o indicatori di violazione.'
    },
    howItWorks: {
      en: 'Runs as an agent or daemon inside the host. It tracks changes to system registry keys, monitors authentication logs, parses application activities, and checks system file hashes against gold standard baselines.',
      it: 'Gira come un agente locale o demone dentro il sistema operativo. Monitora modifiche al registro di sistema, analizza log di login, controlla checksum dei file di sistema ed evidenzia manomissioni insolite.'
    },
    securityAttacks: {
      en: 'Uncovers unauthorized configuration alterations, privilege escalation triggers, suspicious administrative logins, and rogue file writes (like rootkits or webshells).',
      it: 'Svela modifiche non autorizzate ai registri, tentativi di scalata dei privilegi (privilege escalation), tentativi di login sospetti ed inserimento di file ostili (come rootkit o webshell).'
    },
    cannotStop: {
      en: 'Active encryption or execution of ransomware if it does not contain blocking engines, and rapid memory-only fileless execution sequences. Moreover, if the attacker obtains high-level administrator root privileges, they can disable or corrupt the HIDS agent entirely.',
      it: 'La cifratura immediata di file o esecuzione rapida di ransomware se sprovvisto di moduli di blocco attivi, e malware fileless residenti solo in RAM. Inoltre, se l\'attaccante ottiene privilegi di ROOT, può disattivare l\'agente HIDS.'
    },
    mitigation: {
      en: 'Protect client processes with tamper-protection settings, stream all host telemetry logs in real time to off-host write-only SIEM systems, and combine with integrity monitoring tools like Tripwire.',
      it: 'Attivare difese anti-manomissione dell\'agente client, inoltrare tutta la telemetria in tempo reale a server SIEM esterni "write-only", e usare strumenti di integrity checking (es. Tripwire).'
    },
    iconName: 'Activity'
  },
  {
    name: 'HIPS - Host IPS (Endpoint Protection)',
    fullName: 'Host Intrusion Prevention System',
    layer: 'Layer 7 (Application & Operating System)',
    category: 'security',
    role: {
      en: 'Actively prevents malicious software executions, rogue registry writes, and buffer overflows directly on endpoints, stopping attacks in memory or on the disk.',
      it: 'Impedisce attivamente l\'esecuzione di software nocivi, scritture nei registri di sistema o buffer overflow direttamente sull\'endpoint, bloccando attacchi in RAM o su disco.'
    },
    howItWorks: {
      en: 'Interposes directly between application processes and the operating system kernel. It intercepts system calls (syscalls) and dynamically blocks operations that violate local security postures.',
      it: 'Si interpone tra i processi applicativi e il kernel del sistema operativo. Intercetta le syscall (chiamate di sistema) bloccando le azioni che violano le policy locali dell\'endpoint.'
    },
    securityAttacks: {
      en: 'Intercepts zero-day exploitation attempts, isolates unknown ransomware executions, blocks writing to vital directory keys, and shuts down memory injection actions.',
      it: 'Intercetta tentativi di exploit zero-day, blocca e isola ransomware, impedisce scritture su chiavi vitali del registro e inibisce iniezioni di codice in memoria (process hollowing).'
    },
    cannotStop: {
      en: 'Exploitations that target vulnerable hardware firmware lines, or users manually bypassing prompts with high administrative rights. Can also trigger excessive false positives that crash vital legacy business databases.',
      it: 'Sfruttamento di falle hardware/firmware di basso livello, o azioni autorizzate incautamente dall\'utente con massimi privilegi amministrativi. Inoltre, può generare falsi positivi bloccando database o tool aziendali storici.'
    },
    mitigation: {
      en: 'Configure granular, host-specific exception profiles, implement strict change-management plans, and upgrade endpoint clients to modern EDR (Endpoint Detection & Response) engines.',
      it: 'Configurare liste di esclusione granulari, avviare rigorosi test di compatibilità prima del deploy e aggiornare i client endpoint verso agenti moderni di EDR (Endpoint Detection & Response).'
    },
    iconName: 'Shield'
  },
  {
    name: 'EDR - Endpoint Detection & Response',
    fullName: 'Endpoint Detection & Response (XDR-Ready)',
    layer: 'Layer 7 (Application & Operating System)',
    category: 'security',
    role: {
      en: 'Leverages behavior telemetry, AI anomaly detection, and automated isolation playbooks to protect endpoints against unknown, fileless, or advanced persistent threats (APT).',
      it: 'Combina telemetria comportamentale, intelligenza artificiale per anomalie e playbook di isolamento immediato per salvare i computer aziendali da minacce sconosciute, malware fileless o APT.'
    },
    howItWorks: {
      en: 'Streams entire host metadata (process lifecycles, network hooks, file reads) in real time. Rather than relying purely on static hashes, it analyzes active memory executions and shuts down compromised processes instantly.',
      it: 'Invia tutta la telemetria dell\'host (processi avviati, porte aperte, file modificati) a motori di analisi istantanei. Invece di basarsi su firme statiche, analizza come si comportano i processi in RAM e li termina all\'istante.'
    },
    securityAttacks: {
      en: 'Stops fileless PowerShell memory injections, live ransomware encryption loops, DLL sideloading bypasses, and multi-stage APT lateral movement attempts.',
      it: 'Arresta iniezioni distruttive di PowerShell in memoria (senza scrivere file su disco), cifrature ransomware repentine, caricamenti DLL malevoli ed evasioni sandbox.'
    },
    cannotStop: {
      en: 'Hardware-level CPU cache vulnerabilities (Meltdown/Spectre) or physical removal/tampering of host drives prior to boot.',
      it: 'Vulnerabilità a livello fisico della CPU o del silicio (es. microarchitettura, Spectre/Meltdown) o furto fisico del disco rigido privo di crittografia a riposo.'
    },
    mitigation: {
      en: 'Maintain strict least-privilege configurations, disable remote command console execution protocols across endpoints, and combine with regular off-line immutable backup strategies.',
      it: 'Mantenere politiche rigorose di minimo privilegio, disabilitare ovunque l\'accesso remoto a script amministrativi non autorizzati e predisporre backup offline (immutabili).'
    },
    iconName: 'Cpu'
  },
  {
    name: 'LBR - Load Balancer',
    fullName: 'Application Delivery Controller & Load Balancer',
    layer: 'Layer 4, 7 (Transport/Application)',
    category: 'networking',
    role: {
      en: 'Distributes incoming client application traffic across multiple backend servers to maximize capacity, reliability, and service uptime.',
      it: 'Distribuisce in modo intelligente le richieste dei client tra più server di destinazione backend, ottimizzando l\'uso delle risorse e scongiurando singoli punti di guasto.'
    },
    howItWorks: {
      en: 'Inspects TCP parameters (Layer 4) or URL queries, cookies, and HTTP headers (Layer 7), routing flows based on algorithms like Round-Robin, Least Connections, or Session Affinity.',
      it: 'Analizza i parametri TCP (Layer 4) o l\'URI, i cookie e le intestazioni HTTP (Layer 7), indirizzando le richieste secondo algoritmi mirati (es. Round-Robin, Least Connections o affinità di sessione).'
    },
    securityAttacks: {
      en: 'Handles massive spikes of application traffic, shields direct server IP visibility, and mitigates single-target system stress floods.',
      it: 'Assorbe e sgonfia picchi improvvisi di traffico, scherma l\'indirizzamento IP reale dei server backend ed evita il sovraccarico di un singolo server.'
    },
    cannotStop: {
      en: 'Application logical exploits (like SQL Injection or broken authorization flows). Although it balances traffic, it faithfully duplicates and forwards malicious requests to the backends, treating them as normal users.',
      it: 'Exploit logici applicativi (come SQL Injection o manipolazioni di privilegi). Il bilanciatore si limita a smistare le connessioni e, se non dotato di moduli WAF dedicati, inoltrerà fedelmente le richieste nocive ai server backend.'
    },
    mitigation: {
      en: 'Integrate active WAF modules directly within the Application Delivery Controller (ADC) or run reverse proxy web application firewalls in front of the load balancer.',
      it: 'Attivare moduli integrati WAF all\'interno dell\'Application Delivery Controller (ADC) o posizionare Web Application Firewall dedicati a monte.'
    },
    iconName: 'Shuffle'
  },
  {
    name: 'VPN - VPN Concentrator',
    fullName: 'Virtual Private Network Gateway',
    layer: 'Layer 3, 4 (IPsec / SSL-TLS)',
    category: 'security',
    role: {
      en: 'Creates secure, encrypted tunnels over public networks to connect remote clients or branch locations safely to the private corporate LAN.',
      it: 'Crea tunnel di comunicazione protetti e crittografati su reti pubbliche, consentendo a utenti remoti o sedi distaccate di connettersi in totale sicurezza alla intranet locale.'
    },
    howItWorks: {
      en: 'Performs initial cryptographic handshake, authenticates users, and wraps/encrypts cleartext packets into IPsec (Layer 3) or SSL/TLS (Layer 4) transport envelopes.',
      it: 'Esegue un handshake crittografico iniziale, autentica l\'utente e incapsula/cifra tutti i pacchetti originari all\'interno di un canale IPsec (Layer 3) o SSL/TLS (Layer 4).'
    },
    securityAttacks: {
      en: 'Prevents passive internet eavesdropping, man-in-the-middle sniffing, and unauthorized interception of corporate transit traffic.',
      it: 'Sventa intercettazioni di transito (sniffing), attacchi Man-in-the-Middle e la decodifica non autorizzata dei dati aziendali che viaggiano su reti pubbliche.'
    },
    cannotStop: {
      en: 'Phishing attacks, malware execution, or malicious traffic passing inside the tunnel once a connection is authenticated. If an infected endpoint connects via VPN, it can spread worms laterally directly into the internal network.',
      it: 'Attacchi phishing, esecuzione locale di malware o transito di minacce all\'interno dello stesso tunnel una volta autenticato. Se un dipendente si collega con un PC infetto, propagherà virus direttamente sulla LAN interna.'
    },
    mitigation: {
      en: 'Enforce Zero Trust Network Access (ZTNA), mandate continuous endpoint policy compliance scans (Host Checking), and require Multi-Factor Authentication.',
      it: 'Adottare logiche Zero Trust (ZTNA), imporre controlli di conformità e sicurezza dell\'host prima dell\'accesso (Host Checking) e richiedere la MFA.'
    },
    iconName: 'Shield'
  },
  {
    name: 'MDM/ONT - Modem & Terminal',
    fullName: 'Modulator-Demodulator & Optical Network Terminal',
    layer: 'Layer 1, 2 (Physical & Data Link)',
    category: 'infrastructure',
    role: {
      en: 'Converts digital signals from localized router arrays into light waves (fiber) or analog frequencies (copper DSL/Coaxial) for external long-haul ISP lines.',
      it: 'Converte i segnali digitali provenienti dal router locale in impulsi luminosi (fibra ottica) o frequenze analogiche (rame DSL/Coassiale) per viaggiare sulle linee WAN geografiche.'
    },
    howItWorks: {
      en: 'Performs modulation-demodulation (modem) or converts laser pulses (ONT) to frame Ethernet segments, syncing physical clocks with internal carrier exchange stations.',
      it: 'Modula e demodula onde di portante analogica o converte impulsi laser (ONT) in frame Ethernet adatti ai dispositivi LAN, sincronizzando il clock con la centrale ISP.'
    },
    securityAttacks: {
      en: 'Saves local setups from raw line surges and handles standard physical carrier synchronization errors.',
      it: 'Preserva i router locali da sovratensioni sulla tratta telefonica esterna e scherma problemi hardware di allineamento del carrier.'
    },
    cannotStop: {
      en: 'Any network or application layer attacks (such as port scans, SQLi, malware, or DNS spoofing). Operating essentially at Layer 1/2 physical conversions, it passes all traffic dynamically and transparently to next stages without logical inspection.',
      it: 'Qualsiasi attacco di rete o applicativo (come port scanning, SQL injection, malware o falsificazioni DNS). Lavorando unicamente sulla conversione elettrica/ottica dei segnali, fa transitare ogni dato in modo transparente senza alcuna ispezione logica.'
    },
    mitigation: {
      en: 'Always back the terminal/modem device immediately with a stateful firewall (FW-SI) or router to manage ACL policies.',
      it: 'Collegare sempre il modem/ONT direttamente ad un firewall stateful o un router protetto adibito al controllo delle ACL.'
    },
    iconName: 'Radio'
  },
  {
    name: 'SIEM - Security Information & Event Management',
    fullName: 'Security Information & Event Management System',
    layer: 'Layer 7 (Application)',
    category: 'security',
    role: {
      en: 'Aggregates, correlates, and analyzes security logs from all network systems, firewalls, and servers to detect active indicators of compromise (IoC).',
      it: 'Aggrega, correla e analizza i log di sicurezza generati da tutti gli apparati di rete, firewall e server per identificare indicatori di compromissione (IoC) attivi.'
    },
    howItWorks: {
      en: 'Ingests real-time syslog and event streams, normalizes raw text, and matches sequential patterns against pre-configured correlations rules or heuristic behavior baselines.',
      it: 'Ingloba flussi di eventi e log Syslog in tempo reale, normalizza il testo grezzo e confronta sequenze di azioni sospette con regole di correlazione fisse o analisi euristica.'
    },
    securityAttacks: {
      en: 'Detects slow, distributed brute-force attempts across different servers, unauthorized privilege elevations, and silent lateral movements across routers.',
      it: 'Rileva tentativi di brute-force lenti distribuite su host diversi, escalation abusive di privilegi amministrativi e movimenti laterali silenziosi tra i vari router.'
    },
    cannotStop: {
      en: 'Initial, ultra-fast exploits or zero-day script executions in real-time. Because SIEM is primarily a diagnostic analyzer (reactive/detective), it notes the breach but cannot block physical frames or connections by default unless explicitly integrated with active SOAR automation tools.',
      it: 'Exploit istantanei ad altissima velocità o esecuzioni di script zero-day. Essendo prevalentemente un analizzatore di tipo diagnostico (reattivo), registra l\'avvenuta violazione ma non può bloccare fisicamente una connessione se sprovvisto di automazione SOAR.'
    },
    mitigation: {
      en: 'Pair the SIEM with active SOAR (Security Orchestration, Automation, and Response) networks to trigger automatic block execution on perimeter firewalls.',
      it: 'Associare il SIEM a piattaforme SOAR (Security Orchestration, Automation, and Response) attive per iniettare regole di blocco automatiche sui firewall perimetrali.'
    },
    iconName: 'Cpu'
  },
  {
    name: 'NAC - Network Access Control',
    fullName: 'Network Access Control & 802.1X Gateway',
    layer: 'Layer 2, 3 (Data Link & Network)',
    category: 'security',
    role: {
      en: 'Restricts and monitors physical and wireless connections to the corporate network, validating endpoint compliance before granting LAN access.',
      it: 'Limita e monitora i collegamenti fisici e wireless alla rete aziendale, convalidando lo stato di conformità degli host prima di concederne l\'ingresso.'
    },
    howItWorks: {
      en: 'Leverages IEEE 802.1X protocols and local agents to verify credentials, computer certificates, and check host posture (current OS patches, active antivirus) before mapping to authorized VLANs.',
      it: 'Sfrutta il protocollo IEEE 802.1X e agenti locali per verificare credenziali, certificati digitali e salute dell\'host (patch installate, antivirus attivo) prima di associarlo alla VLAN corretta.'
    },
    securityAttacks: {
      en: 'Stops rogue laptop physical connections on open wall Ethernet jacks, isolates infected devices, and blocks unmanaged employee tablets.',
      it: 'Inibisce l\'accesso di PC estranei collegati abusivamente a prese di rete a muro incustodite, isola i dispositivi compromessi e blocca tablet sprovvisti di profili.'
    },
    cannotStop: {
      en: 'Advanced application exploits executed by an already authenticated, fully compliant corporate notebook that gets exploited client-side by malware *after* it has successfully joined the LAN segment.',
      it: 'Exploit applicativi avanzati scatenati da un notebook aziendale regolarmente registrato e pienamente conforme che viene infettato a livello client *dopo* aver completato la procedura di login.'
    },
    mitigation: {
      en: 'Implement continuous host health scanning (periodic posture checks) and deploy micro-segmentation switches to restrict lateral movement paths.',
      it: 'Implementare analisi periodiche di conformità sull\'host (posture check ricorrente) e configurare regole di micro-segmentazione locale.'
    },
    iconName: 'Server'
  },
  {
    name: 'HNP - Decoy Honeypot',
    fullName: 'Network Decoy Honeypot',
    layer: 'Layer 3, 4, 7 (Multi-Layer)',
    category: 'security',
    role: {
      en: 'Deploys simulated, deliberately vulnerable services over the local network to attract, trap, and record the methods of active attackers in complete isolation.',
      it: 'Distribuisce servizi simulati e vulnerabili in rete per attirare, intrappolare e registrare i comportamenti dei pirati informatici in assoluto isolamento.'
    },
    howItWorks: {
      en: 'Emulates standard production setups (like unpatched Unix databases, SSH daemons, or PLC units). Since the decoy has no true company activity, any interaction triggers an immediate high-priority alarm.',
      it: 'Emula configurazioni reali (es. database obsoleti, porte SSH aperte o centraline industriali). Non ospitando reale traffico aziendale, qualunque tentativo di connessione genera allarmi ad alta priorità.'
    },
    securityAttacks: {
      en: 'Detects early network scanning sweeps, logs stealthy internal lateral hops, and intercepts rogue brute force sweeps.',
      it: 'Rileva attività di ricognizione preventiva (network scanning) dell\'attaccante, registra spostamenti laterali e intercetta robot di brute-force automatici.'
    },
    cannotStop: {
      en: 'Direct exploits targeted against real, vital production systems. If the attacker ignores the decoy servers because they possess precise map blueprints, the honeypot remains completely bypassed.',
      it: 'Exploit diretti mirati esclusivamente a risorse e server vitali reali di produzione. Se l\'attore ostile dispone di informazioni precise e ignora i server esca, l\'honeypot non potrà intercettarlo.'
    },
    mitigation: {
      en: 'Scatter fake admin credentials (honeytokens) and mock server listings inside real workstations to redirect scanning hackers to the honeypot.',
      it: 'Disseminare credenziali fasulle (honeytokens) e record di database virtuali all\'interno dei PC reali per deviare le scansioni degli hacker verso l\'esca.'
    },
    iconName: 'Activity'
  },
  {
    name: 'AAA - Authenticator TACACS+/RADIUS',
    fullName: 'Authentication, Authorization, and Accounting Gateway',
    layer: 'Layer 7 (Application)',
    category: 'security',
    role: {
      en: 'Centralizes administrative access controls to network physical appliances, enforcing strict command privileges and action auditing.',
      it: 'Centralizza i controlli di accesso amministrativo per gli apparati fisici di rete, imponendo ruoli rigidi di comando e tracciando ogni operazione.'
    },
    howItWorks: {
      en: 'Receives authentication requests from networking nodes, validates credentials against central LDAP/Active Directory engines, issues authorized shell levels, and records a trace of run command strings.',
      it: 'Riceve le richieste di login degli amministratori, convalida le credenziali su server centrali LDAP/Active Directory, stabilisce i livelli di comando abilitati e archivia l\'elenco delle azioni digitate.'
    },
    securityAttacks: {
      en: 'Stops unauthorized configuration changes on switches, defeats local default credential exploits, and guarantees individual admin account tracking.',
      it: 'Sventa configurazioni arbitrarie sugli apparati di rete, impedisce l\'accesso tramite credenziali di fabbrica (default) e assicura la tracciabilità delle azioni per singolo utente.'
    },
    cannotStop: {
      en: 'Man-in-the-Middle hijacking of open console sessions if administrators log in using unencrypted protocols (like Telnet or HTTP) or credential scraping from administrative client devices.',
      it: 'Sottrazione di sessioni aperte consolle (session hijacking) via MITM qualora il personale usi protocolli non cifrati (come Telnet o HTTP), o furto di password sul PC dell\'operatore.'
    },
    mitigation: {
      en: 'Enforce modern cryptographic transport layers (SSHv2, HTTPS) for console connections, require Multi-Factor Authentication, and define short auto-logoff sessions.',
      it: 'Imporre canali crittografici (SSHv2, HTTPS) per le connessioni, richiedere autenticazione a più fattori (MFA) e configurare sessioni brevi con auto-logoff.'
    },
    iconName: 'Shield'
  },
  {
    name: 'PRX - Proxy Server (Forward/Reverse)',
    fullName: 'Forward & Reverse Proxy Server Array',
    layer: 'Layer 7 (Application)',
    category: 'networking',
    role: {
      en: 'Acts as an intermediary gateway for requests. A Forward Proxy handles outgoing traffic from internal clients to encrypt or filter content, while a Reverse Proxy intercepts incoming web requests to handle SSL/TLS termination, caching, and host shielding.',
      it: 'Agisce come gateway intermedio per le richieste. Un Forward Proxy gestisce il traffico in uscita dei client interni per cifrare o filtrare i contenuti, mentre un Reverse Proxy intercetta le richieste web in entrata per gestire la terminazione SSL/TLS, il caching e il mascheramento dei server.'
    },
    howItWorks: {
      en: 'Receives connection requests on behalf of other devices. It parses URL patterns, manages static caching assets to offload backend nodes, rewrites HTTP headers, and translates public IPs to private destination pools.',
      it: 'Riceve richieste di connessione per conto di altri apparati. Analizza i pattern degli URL, gestisce copie cached di elementi statici per alleggerire i server reali, riscrive header HTTP ed esegue la traduzione (NAT) tra IP pubblici ed IP privati di destinazione.'
    },
    securityAttacks: {
      en: 'Obscures internal network layouts, blocks direct access to origin web servers, filters unauthorized outbound web categorization targets, and mitigates basic web scraping.',
      it: 'Nasconde la struttura della rete LAN interna, impedisce l\'accesso diretto ai server web di origine, blocca la navigazione dei dipendenti verso siti non autorizzati e attenua lo scraping automatizzato.'
    },
    cannotStop: {
      en: 'Sophisticated application exploits (like unvalidated SQL queries or remote file inclusion) if the proxy does not run active deep Web Application Firewall (WAF) rule sets, or attacks targeting non-web custom ports.',
      it: 'Exploit applicativi avanzati (come SQL injection o attacchi di inclusione file) se il proxy non esegue moduli attivi di WAF, o attacchi diretti a porte personalizzate non HTTP/HTTPS.'
    },
    mitigation: {
      en: 'Integrate with active WAF engines, configure robust TLS configurations with HSTS rules, and maintain updated URL categorization databases for forward proxies.',
      it: 'Integrare motori WAF attivi nel proxy, forzare configurazioni TLS sicure con regole HSTS e mantenere sempre aggiornati i database di categorizzazione web per i forward proxy.'
    },
    iconName: 'Server'
  },
  {
    name: 'JMP - Jump Server / Bastion Host',
    fullName: 'Secure Administrative Gateway & Bastion Host',
    layer: 'Layer 7 (Application - SSH / RDP / Web Console)',
    category: 'security',
    role: {
      en: 'Acts as a single, highly-secured entry point (bastion host) that administrators must authenticate through before accessing other sensitive servers or physical devices in internal network zones.',
      it: 'Agisce come un singolo punto d\'ingresso blindato e protetto (bastion host) attraverso il quale gli amministratori devono autenticarsi prima di accedere ad altri server sensibili o apparati all\'interno della rete.'
    },
    howItWorks: {
      en: 'Sits in a DMZ or isolated network segment. System administrators connect to the Jump Server (via SSH, RDP, or secure HTML5 consoles) using multi-factor credentials, then initiate a secondary authenticated session to internal servers.',
      it: 'Si posiziona in una DMZ o un segmento di rete isolato. Gli amministratori si collegano al Jump Server (tramite SSH, RDP o console HTML5 protette) con credenziali e MFA, e da lì avviano una seconda sessione autenticata verso la vera destinazione.'
    },
    securityAttacks: {
      en: 'Eliminates direct administrative access exposure from the internet, prevents brute-force attempts on database nodes, enforces strict protocol isolation, and centralizes session logging.',
      it: 'Elimina completamente l\'esposizione diretta delle porte di gestione (SSH, RDP) su Internet, previene attacchi brute-force sui server core, impone un isolamento rigoroso dei protocolli e centralizza la registrazione video/testo delle sessioni.'
    },
    cannotStop: {
      en: 'Credential scraping or keylogging on the administrator\'s local workstation, or privilege escalation exploits originating from already compromised internal services after session bridge establishment.',
      it: 'Furto di credenziali (credential scraping o keylogger) sul computer locale del manutentore prima dell\'accesso, o exploit di escalation dei privileges scatenati da servizi interni infetti dopo il collegamento.'
    },
    mitigation: {
      en: 'Mandate Multi-Factor Authentication (MFA), restrict Jump Server inbound traffic exclusively via secure client-to-site VPNs, and enable real-time session recording, auditing, and keystroke logging.',
      it: 'Imporre il vincolo di MFA, limitare l\'accesso in ingresso al Jump Server solo tramite VPN preventiva e abilitare la registrazione video ed il tracciamento dei comandi digitati in tempo reale.'
    },
    iconName: 'Shield'
  },
  {
    name: 'TAP/SEN - Network TAP & Sensor',
    fullName: 'Test Access Point & Active/Passive Network Sensor',
    layer: 'Layer 1, 2 (Physical & Data Link)',
    category: 'infrastructure',
    role: {
      en: 'Provides physical or optical visibility into network lines by creating exact copies of flowing packets to feed analysis systems like IDS, NTA, or SIEM silently and without latency.',
      it: 'Fornisce visibilità fisica o ottica dei flussi cablati duplicando specularmente i pacchetti in transito per inviarli a sistemi di analisi come IDS, NDR o SIEM, in modo silente e senza indurre ritardi.'
    },
    howItWorks: {
      en: 'Interposes directly in-line between two network nodes (e.g., router and switch). A Passive TAP splits copper signals electrically or fiber signals optically, maintaining traffic flow even if the analyzer loses power.',
      it: 'Si interpone fisicamente lungo il cavo tra due nodi (es. router e switch). Un TAP passivo sdoppia il segnale in rame o gli impulsi in fibra convogliando una copia esatta al monitor, consentendo il transito reale anche in caso di mancanza di corrente.'
    },
    securityAttacks: {
      en: 'Provides reliable, untamperable access to raw transit frames, completely immune to host-level MAC spoofing or route poisoning attempts.',
      it: 'Fornisce un accesso affidabile ed immune a manutenzioni o manipolazioni logiche, catturando i frame di transito grezzi inalterati da tentativi di spoofing o avvelenamento ARP.'
    },
    cannotStop: {
      en: 'Malicious traffic from passing through the link. By architecture, a passive TAP is purely read-only and lacks any packet modification or active block capacity.',
      it: 'Il transito di minacce o traffico malevolo. Per progettazione, il TAP passivo agisce in sola lettura e non ha facoltà di modificare i pacchetti o inibirne il passaggio.'
    },
    mitigation: {
      en: 'Enforce strict physical security for TAP hardware units to prevent malicious interceptors from intercepting corporate traffic directly from the racks.',
      it: 'Garantire la massima sicurezza fisica per la stanza server e i rack in cui sono collocati i TAP per proteggere il traffico sensibile da intercettazioni fisiche abusive.'
    },
    iconName: 'Network'
  }
];

const PORT_REGISTRY: PortInfo[] = [
  // Well-Known Ports
  {
    port: 20,
    service: 'FTP Data',
    name: 'File Transfer Protocol (Data)',
    type: 'TCP',
    range: 'well-known',
    description: {
      en: 'Used for transferring file data in Active mode.',
      it: 'Utilizzato per il trasferimento dei dati dei file in modalità Attiva.'
    },
    security: {
      en: 'Plaintext protocol. Vulnerable to sniffing and spoofing.',
      it: 'Protocollo in chiaro. Vulnerabile a sniffing e spoofing.'
    },
    isSecure: false
  },
  {
    port: 21,
    service: 'FTP Control',
    name: 'File Transfer Protocol (Control)',
    type: 'TCP',
    range: 'well-known',
    description: {
      en: 'Used for sending commands and authentication details.',
      it: 'Utilizzato per l\'invio di comandi e credenziali di autenticazione.'
    },
    security: {
      en: 'Transmits passwords in plaintext. SFTP/FTPS is highly recommended.',
      it: 'Trasmette password in chiaro. Si raccomanda fortemente SFTP o FTPS.'
    },
    isSecure: false
  },
  {
    port: 22,
    service: 'SSH',
    name: 'Secure Shell',
    type: 'TCP',
    range: 'well-known',
    description: {
      en: 'Enables secure encrypted remote terminal access and file transfers (SFTP).',
      it: 'Consente l\'accesso crittografato sicuro a terminali remoti e trasferimenti file (SFTP).'
    },
    security: {
      en: 'Highly secure replacement for Telnet. Ensure strong key auth and disable root login.',
      it: 'Sostituto sicuro di Telnet. Assicurare l\'autenticazione a chiavi e disabilitare login root.'
    },
    isSecure: true
  },
  {
    port: 23,
    service: 'Telnet',
    name: 'Telnet',
    type: 'TCP',
    range: 'well-known',
    description: {
      en: 'Legacy unencrypted text communications for remote shell management.',
      it: 'Comunicazione testuale non cifrata legacy per la gestione di shell remote.'
    },
    security: {
      en: 'CRITICAL RISK. All data, including logins and passwords, is transmitted in cleartext.',
      it: 'RISCHIO CRITICO. Tutti i dati, inclusi login e password, sono trasmessi in chiaro.'
    },
    isSecure: false
  },
  {
    port: 25,
    service: 'SMTP',
    name: 'Simple Mail Transfer Protocol',
    type: 'TCP',
    range: 'well-known',
    description: {
      en: 'Standard protocol for sending and routing email between mail servers.',
      it: 'Protocollo standard per l\'invio e l\'instradamento delle email tra i server.'
    },
    security: {
      en: 'Vulnerable to email spoofing and spam unless secured with STARTTLS and SPF/DKIM/DMARC.',
      it: 'Vulnerabile a spoofing e spam se non protetto con STARTTLS e record SPF/DKIM/DMARC.'
    },
    isSecure: false
  },
  {
    port: 49,
    service: 'TACACS+',
    name: 'Terminal Access Controller Access-Control System Plus',
    type: 'TCP',
    range: 'well-known',
    description: {
      en: 'Cisco proprietary AAA protocol used for authenticating administrators on routers, switches, and firewalls.',
      it: 'Protocollo AAA proprietario Cisco utilizzato per l\'autenticazione degli amministratori su router, switch e firewall.'
    },
    security: {
      en: 'Enforces TCP connectivity and encrypts the complete packet payload body (only the standard header remains plaintext), making it extremely secure.',
      it: 'Forza la connettività TCP e cifra l\'intero corpo del payload dei pacchetti (solo l\'intestazione standard è in chiaro), rendendolo estremamente sicuro.'
    },
    isSecure: true
  },
  {
    port: 53,
    service: 'DNS',
    name: 'Domain Name System',
    type: 'Both',
    range: 'well-known',
    description: {
      en: 'Translates domain names (like google.com) to machine-readable IP addresses.',
      it: 'Traduce i nomi di dominio (come google.com) in indirizzi IP leggibili dalle macchine.'
    },
    security: {
      en: 'Target for DNS Spoofing, Cache Poisoning, and DDoS Amplification. Protect via DNSSEC.',
      it: 'Target per DNS Spoofing, Cache Poisoning e DDoS Amplification. Proteggere con DNSSEC.'
    },
    isSecure: true
  },
  {
    port: '67 / 68',
    service: 'DHCP',
    name: 'Dynamic Host Configuration Protocol',
    type: 'UDP',
    range: 'well-known',
    description: {
      en: 'Automatically assigns IP addresses and network parameters to client devices.',
      it: 'Assegna automaticamente indirizzi IP e parametri di rete ai dispositivi client.'
    },
    security: {
      en: 'Subject to DHCP Starvation and Rogue DHCP Server attacks. Prevent via DHCP Snooping.',
      it: 'Soggetto ad attacchi DHCP Starvation e Rogue DHCP Server. Prevenire tramite DHCP Snooping.'
    },
    isSecure: false
  },
  {
    port: 69,
    service: 'TFTP',
    name: 'Trivial File Transfer Protocol',
    type: 'UDP',
    range: 'well-known',
    description: {
      en: 'A very simple file transfer protocol, often used for booting diskless workstations.',
      it: 'Un protocollo di trasferimento file molto elementare, spesso usato per il bootstrap di dispositivi diskless.'
    },
    security: {
      en: 'No encryption or authentication whatsoever. Transmits data in cleartext; restrict to local networks.',
      it: 'Nessuna cifratura e nessuna autenticazione. Trasmette i dati in chiaro; limitare l\'uso a reti isolate.'
    },
    isSecure: false
  },
  {
    port: 80,
    service: 'HTTP',
    name: 'Hypertext Transfer Protocol',
    type: 'TCP',
    range: 'well-known',
    description: {
      en: 'Foundation of data exchange on the World Wide Web. Plaintext web server communications.',
      it: 'Fondamento dello scambio dati sul World Wide Web. Comunicazione web server in chiaro.'
    },
    security: {
      en: 'All data is unencrypted. Vulnerable to interception (MITM). Upgrade to HTTPS (port 443).',
      it: 'I dati sono in chiaro. Vulnerabile a intercettazione (MITM). Passare a HTTPS (porta 443).'
    },
    isSecure: false
  },
  {
    port: 88,
    service: 'Kerberos',
    name: 'Kerberos Authentication',
    type: 'Both',
    range: 'well-known',
    description: {
      en: 'Computer network authentication protocol works on "tickets" to allow nodes to prove identity securely.',
      it: 'Protocollo di autenticazione di rete operante su "ticket" che permette l\'identità mutua sicura tra nodi.'
    },
    security: {
      en: 'Strong cryptography-centric system, though vulnerable to ticket exploitation (Golden/Silver Ticket).',
      it: 'Sistema robusto basato su crittografia, sebbene vulnerabile a exploit sui ticket (Golden/Silver Ticket).'
    },
    isSecure: true
  },
  {
    port: 110,
    service: 'POP3',
    name: 'Post Office Protocol v3',
    type: 'TCP',
    range: 'well-known',
    description: {
      en: 'Retrieves emails from a mail server and usually deletes them from the server afterwards.',
      it: 'Scarica i messaggi email da un server remoto e solitamente li rimuove dal server stesso.'
    },
    security: {
      en: 'Insecure in default cleartext. Secure via POP3S (port 995) using SSL/TLS encryption.',
      it: 'Non sicuro configurato in chiaro. Proteggere tramite POP3S (porta 995) usando SSL/TLS.'
    },
    isSecure: false
  },
  {
    port: 119,
    service: 'NNTP',
    name: 'Network News Transfer Protocol',
    type: 'TCP',
    range: 'well-known',
    description: {
      en: 'Used for distributing, inquiring, retrieving, and posting Usenet news articles.',
      it: 'Utilizzato per la distribuzione, consultazione e pubblicazione degli articoli di news Usenet.'
    },
    security: {
      en: 'Plaintext by default, highly subject to snooping. NNTPS over SSL is the secure choice.',
      it: 'In chiaro di default, esposto a intercettazione. NNTPS via SSL rappresenta l\'alternativa sicura.'
    },
    isSecure: false
  },
  {
    port: 123,
    service: 'NTP',
    name: 'Network Time Protocol',
    type: 'UDP',
    range: 'well-known',
    description: {
      en: 'Synchronizes clock settings across network devices and systems.',
      it: 'Sincronizza gli orologi dei dispositivi e dei sistemi all\'interno della rete.'
    },
    security: {
      en: 'Frequently abused in DRDoS (Distributed Reflective Denial of Service) amplification attacks.',
      it: 'Spesso abusato in attacchi DDoS di tipo amplificato (DRDoS Reflective Attacks).'
    },
    isSecure: false
  },
  {
    port: 135,
    service: 'MS RPC',
    name: 'Microsoft RPC Endpoint Mapper',
    type: 'Both',
    range: 'well-known',
    description: {
      en: 'Enables client-server communications for Microsoft-based systems and directory services.',
      it: 'Abilita comunicazioni client-server per i servizi di directory e i sistemi Microsoft-based.'
    },
    security: {
      en: 'Can disclose system configuration details to attackers. Should be strictly firewalled.',
      it: 'Rischia di svelare dettagli di configurazione di sistema agli attaccanti. Va schermato severamente.'
    },
    isSecure: false
  },
  {
    port: 137,
    service: 'NetBIOS-NS',
    name: 'NetBIOS Name Service',
    type: 'Both',
    range: 'well-known',
    description: {
      en: 'Used for name registration and resolution in local NetBIOS network groups.',
      it: 'Utilizzato per la registrazione e risoluzione dei nomi in reti locali basate su NetBIOS.'
    },
    security: {
      en: 'Vulnerable to NetBIOS spoofing and information gathering. Should be disabled on public interfaces.',
      it: 'Vulnerabile a spoofing NetBIOS e raccolta informazioni. Deve essere disattivato sulle interfacce esterne.'
    },
    isSecure: false
  },
  {
    port: 138,
    service: 'NetBIOS-DGM',
    name: 'NetBIOS Datagram Service',
    type: 'UDP',
    range: 'well-known',
    description: {
      en: 'Provides connectionless communication for NetBIOS packets (browsing, election).',
      it: 'Fornisce un canale di comunicazione non connesso per messaggi NetBIOS (browsing, elezioni).'
    },
    security: {
      en: 'Plaintext protocol, vulnerable to local spoofing. Block at external firewalls.',
      it: 'Protocollo in chiaro, esposto a spoofing locale. Filtrare sui firewall perimetrali.'
    },
    isSecure: false
  },
  {
    port: 139,
    service: 'NetBIOS-SSN',
    name: 'NetBIOS Session Service',
    type: 'TCP',
    range: 'well-known',
    description: {
      en: 'Provides connection-oriented session communications for NetBIOS (legacy file sharing).',
      it: 'Fornisce sessioni orientate alla connessione per protocolli NetBIOS (condivisione file legacy).'
    },
    security: {
      en: 'Highly vulnerable to scanning, enumeration, and exploitation. Deprecated in favor of direct SMB (445).',
      it: 'Altamente vulnerabile a scansioni, enumerazione ed attacchi. Deprecato a favore di SMB diretto (445).'
    },
    isSecure: false
  },
  {
    port: 143,
    service: 'IMAP',
    name: 'Internet Message Access Protocol',
    type: 'TCP',
    range: 'well-known',
    description: {
      en: 'Saves and manages emails concurrently on a mail server, allowing multi-device sync.',
      it: 'Memorizza e gestisce le email sul server, consentendo la sincronizzazione tra più dispositivi.'
    },
    security: {
      en: 'Plaintext protocol. Secure via IMAPS (port 993) using explicit SSL/TLS connection wrapper.',
      it: 'Protocollo in chiaro. Proteggere tramite IMAPS (porta 993) usando wrapper SSL/TLS.'
    },
    isSecure: false
  },
  {
    port: 161,
    service: 'SNMP',
    name: 'Simple Network Management Protocol',
    type: 'UDP',
    range: 'well-known',
    description: {
      en: 'Used to monitor, query, and configure network devices such as switches and routers.',
      it: 'Utilizzato per monitorare, interrogare e configurare apparati di rete quali switch e router.'
    },
    security: {
      en: 'SNMP v1/v2 transmit plaintext "community strings" (passwords). SNMP v3 is strongly recommended.',
      it: 'SNMP v1/v2 trasmettono password ("community string") in chiaro. Raccomandato l\'uso esclusivo di SNMP v3.'
    },
    isSecure: false
  },
  {
    port: 162,
    service: 'SNMP Trap',
    name: 'SNMP Traps Receiver',
    type: 'UDP',
    range: 'well-known',
    description: {
      en: 'Listens for asynchronous notifications/alerts pushed by network devices to the manager.',
      it: 'Ascolta le notifiche e gli alert asincroni generati dagli apparati verso il sistema di gestione.'
    },
    security: {
      en: 'Vulnerable to spoofed alert injections unless configured with SNMPv3 security and authentication.',
      it: 'Vulnerabile a finti alert se non protetto con le chiavi di sicurezza e autenticazione di SNMPv3.'
    },
    isSecure: false
  },
  {
    port: 179,
    service: 'BGP',
    name: 'Border Gateway Protocol',
    type: 'TCP',
    range: 'well-known',
    description: {
      en: 'Decides routing paths between Autonomous Systems (ASes) on the global Internet.',
      it: 'Decide i percorsi di instradamento tra gli Autonomous Systems (AS) su Internet.'
    },
    security: {
      en: 'Vulnerable to BGP Hijacking and Route Leaks. Protect via RPKI, MD5 signatures, or BGPsec.',
      it: 'Vulnerabile a BGP Hijacking e Route Leak. Proteggere via RPKI, firme MD5 o BGPsec.'
    },
    isSecure: true
  },
  {
    port: 389,
    service: 'LDAP',
    name: 'Lightweight Directory Access Protocol',
    type: 'Both',
    range: 'well-known',
    description: {
      en: 'Used to query and manipulate user and object records in network directory services.',
      it: 'Utilizzato per interrogare e gestire profili utente e oggetti nei servizi di directory in rete.'
    },
    security: {
      en: 'Transmits queries and passwords in plaintext unless upgraded via STARTTLS or LDAPS (636).',
      it: 'Invia letture e credenziali in chiaro a meno di non elevare il canale via STARTTLS o scegliere LDAPS (636).'
    },
    isSecure: false
  },
  {
    port: 443,
    service: 'HTTPS',
    name: 'HTTP Secure (over TLS)',
    type: 'TCP',
    range: 'well-known',
    description: {
      en: 'Enables encrypted, authentic web browsing using Transport Layer Security (TLS).',
      it: 'Consente la navigazione web cifrata e autenticata utilizzando TLS.'
    },
    security: {
      en: 'Standard secure standard. Protect against certificate private key leaks and outdated TS suites.',
      it: 'Standard di sicurezza moderno. Proteggere da fughe di chiavi private e cifre obsolete.'
    },
    isSecure: true
  },
  {
    port: 445,
    service: 'SMB',
    name: 'Server Message Block',
    type: 'TCP',
    range: 'well-known',
    description: {
      en: 'Enables shared access to files, printers, and serial ports on local networks.',
      it: 'Fornisce l\'accesso condiviso a file, stampanti e porte seriali all\'interno di reti locali.'
    },
    security: {
      en: 'Often abused by historical exploits (EternalBlue, WannaCry). Enforce SMBv3 signature and encryption.',
      it: 'Molto sfruttato in exploit storici (EternalBlue, WannaCry). Forzare firme digitali e SMBv3.'
    },
    isSecure: false
  },
  {
    port: 465,
    service: 'SMTPS',
    name: 'SMTP Secure',
    type: 'TCP',
    range: 'well-known',
    description: {
      en: 'Securely routes and sends electronic mail using implicit TLS encryption.',
      it: 'Invia e instrada la posta elettronica in modo sicuro usando la cifratura TLS implicita.'
    },
    security: {
      en: 'Uses SSL/TLS to prevent message sniffing or credential theft during mail dispatch.',
      it: 'Utilizza SSL/TLS per prevenire sniffing dei messaggi o furto credenziali all\'invio.'
    },
    isSecure: true
  },
  {
    port: 514,
    service: 'Syslog',
    name: 'Syslog Standard Logging',
    type: 'UDP',
    range: 'well-known',
    description: {
      en: 'Standard protocol for transmitting system information and event logs across nodes.',
      it: 'Protocollo per la raccolta e l\'invio di log di sistema e messaggi di diagnostica.'
    },
    security: {
      en: 'Unencrypted UDP. Messages can be intercepted, read, or spoofed easily on transit.',
      it: 'UDP non cifrato. I messaggi possono essere visti in chiaro o falsificati in rete.'
    },
    isSecure: false
  },
  {
    port: 587,
    service: 'SMTP Submission',
    name: 'SMTP Client submission',
    type: 'TCP',
    range: 'well-known',
    description: {
      en: 'Preferred modern port for routing user emails, requiring authentication and STARTTLS security.',
      it: 'Canale preferito moderno per l\'invio di email da client, richiede autenticazione ed elezione a STARTTLS.'
    },
    security: {
      en: 'Safe when configured to enforce encryption. Replaces plaintext transit via legacy port 25.',
      it: 'Sicuro se configurato con cifratura obbligatoria. Sostituisce il vecchio transito in chiaro su porta 25.'
    },
    isSecure: true
  },
  {
    port: 636,
    service: 'LDAPS',
    name: 'LDAP Secure (over SSL/TLS)',
    type: 'TCP',
    range: 'well-known',
    description: {
      en: 'Provides encrypted connection for Active Directory and LDAP querying over SSL/TLS.',
      it: 'Fornisce un canale crittografato protetto per interrogazioni Active Directory e LDAP via SSL/TLS.'
    },
    security: {
      en: 'Protects critical user credentials and organization metadata from snooping.',
      it: 'Protegge le credenziali sensibili degli utenti e i dati di struttura interni da eavesdropping.'
    },
    isSecure: true
  },
  {
    port: 993,
    service: 'IMAPS',
    name: 'IMAP Secure',
    type: 'TCP',
    range: 'well-known',
    description: {
      en: 'Accesses electronic mail on mail servers over an encrypted SSL/TLS session.',
      it: 'Accede alla posta elettronica sul server remoto tramite una sessione cifrata SSL/TLS.'
    },
    security: {
      en: 'Enforces end-to-end transport layer security, secure against local Wi-Fi interception.',
      it: 'Garantisce la sicurezza dello strato di trasporto, protetto da eavesdropping su reti locali.'
    },
    isSecure: true
  },
  {
    port: 995,
    service: 'POP3S',
    name: 'POP3 Secure',
    type: 'TCP',
    range: 'well-known',
    description: {
      en: 'Enables secure electronic mail download encrypting credentials and letters.',
      it: 'Abilita il download sicuro delle email cifrando credenziali e messaggi.'
    },
    security: {
      en: 'Prevents credential eavesdropping in transit during client extraction.',
      it: 'Previene l\'intercettazione delle credenziali in transito durante il download.'
    },
    isSecure: true
  },

  // Registered Ports
  {
    port: 1433,
    service: 'MSSQL',
    name: 'Microsoft SQL Server Database',
    type: 'TCP',
    range: 'registered',
    description: {
      en: 'Default socket for Microsoft SQL Server relational database system.',
      it: 'Socket di default per il database relazionale Microsoft SQL Server.'
    },
    security: {
      en: 'Frequent target for dictionary attacks. Block external access and enforce SQL encryption.',
      it: 'Frequente bersaglio di attacchi dictionary. Bloccare accessi esterni e forzare crittografia.'
    },
    isSecure: false
  },
  {
    port: 1521,
    service: 'Oracle DB',
    name: 'Oracle Database Listener',
    type: 'TCP',
    range: 'registered',
    description: {
      en: 'Listens for connection requests forwarding client sessions to Oracle database services.',
      it: 'Ascolta le richieste di connessione dei client inoltrandole al database Oracle.'
    },
    security: {
      en: 'Vulnerable to database enumeration if listener endpoints are publicly exposed.',
      it: 'Vulnerabile a enumerazione del database se l\'endpoint del listener è pubblico.'
    },
    isSecure: false
  },
  {
    port: 1645,
    service: 'RADIUS Auth (Alt)',
    name: 'RADIUS Authentication (Legacy)',
    type: 'UDP',
    range: 'registered',
    description: {
      en: 'Legacy alternate port used for central authentication dial-in requests.',
      it: 'Porta alternativa storica per la gestione centrale delle richieste di autenticazione.'
    },
    security: {
      en: 'Vulnerable to security gaps present in older RADIUS specifications. Prefer modern port 1812.',
      it: 'Soggetto a vulnerabilità note presenti nelle vecchie specifiche. Preferire la porta moderna 1812.'
    },
    isSecure: false
  },
  {
    port: 1646,
    service: 'RADIUS Acct (Alt)',
    name: 'RADIUS Accounting (Legacy)',
    type: 'UDP',
    range: 'registered',
    description: {
      en: 'Legacy alternate port used for collecting system events and usage logs.',
      it: 'Porta alternativa storica utilizzata per raccogliere i log correlati all\'account utente.'
    },
    security: {
      en: 'Plaintext transit. Better to transition active servers to contemporary port 1813.',
      it: 'Transito dati sensibili in chiaro. Meglio migrare i server operativi alla porta moderna 1813.'
    },
    isSecure: false
  },
  {
    port: 1812,
    service: 'RADIUS Auth',
    name: 'RADIUS Authentication Service',
    type: 'UDP',
    range: 'registered',
    description: {
      en: 'Standard port for authenticating corporate and enterprise remote access connections (VPN/Wi-Fi).',
      it: 'Porta standard per l\'autenticazione centralizzata aziendale di connessioni VPN e Wi-Fi Corporate.'
    },
    security: {
      en: 'Relies on shared secrets. Should be coupled with secure IPSec tunnels or restricted network VLANs.',
      it: 'Basato su segreti condivisi. È altamente consigliabile blindarlo dentro tunnel IPSec o VLAN protette.'
    },
    isSecure: false
  },
  {
    port: 1813,
    service: 'RADIUS Acct',
    name: 'RADIUS Accounting Service',
    type: 'UDP',
    range: 'registered',
    description: {
      en: 'Standard IANA port designated for collecting audit data and remote user usage logs.',
      it: 'Porta ufficiale IANA destinata alla raccolta dati di monitoraggio e log di attività remota degli utenti.'
    },
    security: {
      en: 'Insecure unless traffic passes through private local subnets or encrypted VPN links.',
      it: 'Insicuro a meno che i dati non passino attraverso sottoreti private o reti VPN protette.'
    },
    isSecure: false
  },
  {
    port: 3000,
    service: 'Vite / Dev Server',
    name: 'Vite Dev Web Server',
    type: 'Both',
    range: 'registered',
    description: {
      en: 'Common default development server port used in Vite, React, and Express development.',
      it: 'Porta di sviluppo predefinita comune usata nei framework Vite, React ed Express.'
    },
    security: {
      en: 'Normally bound locally. Never leave developmental APIs running exposed to production servers.',
      it: 'Normalmente vincolata in locale. Mai lasciare API di sviluppo esposte su server produttivi.'
    },
    isSecure: true
  },
  {
    port: 3306,
    service: 'MySQL',
    name: 'MySQL Database',
    type: 'TCP',
    range: 'registered',
    description: {
      en: 'Standard port to connect to the MySQL database engine.',
      it: 'Porta standard per connettersi al motore database relazionale MySQL.'
    },
    security: {
      en: 'Prone to credential brute forcing. Bind only to localhost (127.0.0.1) unless cluster-synchronized.',
      it: 'Soggetto a tentativi di brute force delle credenziali. Consigliato il binding solo su localhost.'
    },
    isSecure: false
  },
  {
    port: 3389,
    service: 'RDP',
    name: 'Remote Desktop Protocol',
    type: 'Both',
    range: 'registered',
    description: {
      en: 'Microsoft graphical user interface connection to remote physical or virtual systems.',
      it: 'Collegamento grafico proprietario Microsoft a desktop windows su host remoti.'
    },
    security: {
      en: 'High-risk port. Constantly targeted by ransomware bots. Protect via VPN, MFA, or Gateway.',
      it: 'Porta ad alto rischio. Obiettivo prediletto dai bot ransomware. Proteggere con VPN e MFA.'
    },
    isSecure: false
  },
  {
    port: 5432,
    service: 'PostgreSQL',
    name: 'PostgreSQL Database',
    type: 'TCP',
    range: 'registered',
    description: {
      en: 'Enables network connections to PostgreSQL Object-Relational Database.',
      it: 'Abilita connessioni di rete al database relazionale PostgreSQL.'
    },
    security: {
      en: 'Ensure pg_hba.conf restricts inbound client IPs and requires MD5/Scram passwords with TLS.',
      it: 'Configurare pg_hba.conf per limitare gli ip client abilitati richiedendo pass secure e TLS.'
    },
    isSecure: false
  },
  {
    port: 6379,
    service: 'Redis',
    name: 'Redis In-Memory Database',
    type: 'TCP',
    range: 'registered',
    description: {
      en: 'Extremely fast in-memory key-value database used for caching and session indexing.',
      it: 'Database in-memory a chiave-valore velocissimo per cache e indexing sessioni.'
    },
    security: {
      en: 'By default, lacks strong security. Publicly exposed databases can leak cleartext sessions easily.',
      it: 'Di default ha pochissime protezioni. Se esposto può causare fughe di dati critiche.'
    },
    isSecure: false
  },
  {
    port: 6514,
    service: 'Syslog over TLS',
    name: 'Secure Syslog Delivery',
    type: 'TCP',
    range: 'registered',
    description: {
      en: 'Standardized encrypted transmission of syslog event messages using TLS protection.',
      it: 'Protocollo ufficiale per l\'invio crittografato di log di eventi di sistema protetto da TLS.'
    },
    security: {
      en: 'Ensures data confidentiality and authenticates sender and receiver nodes securely.',
      it: 'Garantisce la riservatezza delle informazioni di audit e autentica l\'origine e i server log.'
    },
    isSecure: true
  },
  {
    port: 8080,
    service: 'HTTP Alternate',
    name: 'Apache Tomcat / Backup Web Server',
    type: 'TCP',
    range: 'registered',
    description: {
      en: 'Common alternate port for web hosting services or local application proxies.',
      it: 'Porta alternativa comune per hosting web, proxy o server Apache Tomcat dedicati.'
    },
    security: {
      en: 'Identical risk profile as default HTTP. Used frequently to test web interfaces safely.',
      it: 'Stesso profilo di rischio di HTTP. Usata spesso per interfacce amministrative interne.'
    },
    isSecure: false
  },
  {
    port: 27017,
    service: 'MongoDB',
    name: 'MongoDB NoSQL Daemon',
    type: 'TCP',
    range: 'registered',
    description: {
      en: 'NoSQL document-oriented engine default listening channel.',
      it: 'Canale di ascolto predefinito per il database NoSQL orientato ai documenti MongoDB.'
    },
    security: {
      en: 'Frequently left exposed without authentication by mistake. Must require authorization.',
      it: 'Spesso lasciato esposto senza autenticazione per errore. Attivare il rbac/controllo accessi.'
    },
    isSecure: false
  }
];

export default function PortsModal({ isOpen = false, onClose = () => {}, inline = false }: { isOpen?: boolean; onClose?: () => void; inline?: boolean }) {
  const { language } = useStore();
  const [activeTab, setActiveTab] = useState<'ports' | 'protocols' | 'devices' | 'secure-access' | 'trainer'>('ports');
  const [selectedRange, setSelectedRange] = useState<'all' | 'well-known' | 'registered' | 'dynamic'>('all');
  const [deviceCategory, setDeviceCategory] = useState<'all' | 'security' | 'networking' | 'infrastructure'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [secureSubTab, setSecureSubTab] = useState<'eap' | 'aaa' | 'vpn'>('eap');
  const [selectedEap, setSelectedEap] = useState<'tls' | 'peap' | 'ttls' | 'fast' | 'md5'>('tls');
  const [selectedAaaSim, setSelectedAaaSim] = useState<'radius' | 'tacacs'>('radius');
  const [selectedVpnMode, setSelectedVpnMode] = useState<'ipsec-tunnel' | 'ipsec-transport' | 'dtls' | 'vpn-overview'>('vpn-overview');

  // Game/Trainer State
  const [trainerMode, setTrainerMode] = useState<'selection' | 'quiz' | 'flashcards'>('selection');
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [gameScore, setGameScore] = useState(0);
  const [gameStreak, setGameStreak] = useState(0);
  const [gameQuestions, setGameQuestions] = useState<{ port: number; service: string; options: number[] }[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerEvaluated, setAnswerEvaluated] = useState(false);

  // Flashcards state
  const [flashcardsList, setFlashcardsList] = useState<PortInfo[]>([]);
  const [currentFlashcardIdx, setCurrentFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Filter Ports
  const filteredPorts = PORT_REGISTRY.filter(p => {
    const rangeMatch = selectedRange === 'all' || p.range === selectedRange;
    const term = searchTerm.toLowerCase();
    const searchMatch = !searchTerm || 
      p.port.toString().toLowerCase().includes(term) ||
      p.service.toLowerCase().includes(term) ||
      p.name.toLowerCase().includes(term) ||
      p.description[language].toLowerCase().includes(term);
    return rangeMatch && searchMatch;
  });

  // Filter Protocols
  const filteredProtocols = PROTOCOL_REGISTRY.filter(p => {
    const term = searchTerm.toLowerCase();
    const searchMatch = !searchTerm || 
      p.name.toLowerCase().includes(term) ||
      p.fullName.toLowerCase().includes(term) ||
      p.type.toLowerCase().includes(term) ||
      p.description[language].toLowerCase().includes(term) ||
      p.useCase[language].toLowerCase().includes(term) ||
      p.security[language].toLowerCase().includes(term);
    return searchMatch;
  });

  // Filter Devices
  const filteredDevices = DEVICE_REGISTRY.filter(d => {
    const categoryMatch = deviceCategory === 'all' || d.category === deviceCategory;
    const term = searchTerm.toLowerCase();
    const searchMatch = !searchTerm || 
      d.name.toLowerCase().includes(term) ||
      d.fullName.toLowerCase().includes(term) ||
      d.layer.toLowerCase().includes(term) ||
      d.role[language].toLowerCase().includes(term) ||
      d.howItWorks[language].toLowerCase().includes(term) ||
      d.securityAttacks[language].toLowerCase().includes(term) ||
      d.cannotStop[language].toLowerCase().includes(term) ||
      d.mitigation[language].toLowerCase().includes(term);
    return categoryMatch && searchMatch;
  });

  // Start Port Trainer Game
  const startNewGame = () => {
    // Generate 5 random questions
    const shuffled = [...PORT_REGISTRY].sort(() => 0.5 - Math.random());
    const questions = shuffled.slice(0, 5).map(q => {
      const correctPort = typeof q.port === 'number' ? q.port : parseInt(q.port.toString().split(' ')[0], 10) || 53;
      
      // Make 3 plausible decoy port options
      const decoys = PORT_REGISTRY
        .filter(item => {
          const itemPort = typeof item.port === 'number' ? item.port : 9999;
          return itemPort !== correctPort;
        })
        .map(item => typeof item.port === 'number' ? item.port : 80)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      const options = [...decoys, correctPort].sort(() => 0.5 - Math.random());
      
      return {
        port: correctPort,
        service: q.service,
        options
      };
    });

    setGameQuestions(questions);
    setCurrentQuestionIdx(0);
    setGameScore(0);
    setSelectedAnswer(null);
    setAnswerEvaluated(false);
    setGameState('playing');
    setTrainerMode('quiz');
  };

  const startFlashcards = () => {
    const shuffled = [...PORT_REGISTRY].sort(() => 0.5 - Math.random());
    setFlashcardsList(shuffled);
    setCurrentFlashcardIdx(0);
    setIsFlipped(false);
    setTrainerMode('flashcards');
  };

  const handleSelectAnswer = (ans: number) => {
    if (answerEvaluated) return;
    setSelectedAnswer(ans);
    setAnswerEvaluated(true);
    const isCorrect = ans === gameQuestions[currentQuestionIdx].port;
    if (isCorrect) {
      setGameScore(prev => prev + 1);
      setGameStreak(prev => prev + 1);
    } else {
      setGameStreak(0);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < gameQuestions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedAnswer(null);
      setAnswerEvaluated(false);
    } else {
      setGameState('ended');
    }
  };

  const renderWrapper = (children: React.ReactNode) => {
    if (inline) {
      return (
        <div className="relative bg-white rounded-3xl border border-slate-200 flex flex-col overflow-hidden w-full h-[82vh] min-h-[600px] shadow-sm">
          {children}
        </div>
      );
    }
    return (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl z-[101] flex flex-col overflow-hidden w-full max-w-4xl h-auto max-h-[85vh] border border-slate-100"
            >
              {children}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  };

  return renderWrapper(
    <>
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Hash className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter">
                    {language === 'en' ? 'Network Ports & Protocols' : 'Porte & Protocolli di Rete'}
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    {language === 'en' 
                      ? 'IANA numeric bands, protocol associations, standard definitions and security' 
                      : 'Bande numeriche IANA, associazioni dei protocolli, definizioni standard e sicurezza'}
                  </p>
                </div>
              </div>

              {/* Sub-Tabs Selector */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl mr-3 select-none">
                <button
                  onClick={() => setActiveTab('ports')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1 ${
                    activeTab === 'ports' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Hash className="w-3.5 h-3.5" />
                  {language === 'en' ? 'Ports' : 'Porte'}
                </button>
                <button
                  onClick={() => setActiveTab('protocols')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1 ${
                    activeTab === 'protocols' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  {language === 'en' ? 'Protocols' : 'Protocolli'}
                </button>
                <button
                  onClick={() => setActiveTab('devices')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1 ${
                    activeTab === 'devices' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Network className="w-3.5 h-3.5" />
                  {language === 'en' ? 'Hardware' : 'Apparati'}
                </button>
                <button
                  onClick={() => setActiveTab('secure-access')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1 ${
                    activeTab === 'secure-access' 
                      ? 'bg-white text-slate-900 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  {language === 'en' ? 'AAA & VPN' : 'AAA & VPN'}
                </button>
                <button
                  onClick={() => {
                    setActiveTab('trainer');
                    setTrainerMode('selection');
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase flex items-center gap-1 transition-all ${
                    activeTab === 'trainer' 
                      ? 'bg-indigo-600 text-white shadow-md font-extrabold' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {language === 'en' ? 'Trainer' : 'Quiz'}
                </button>
              </div>

              {!inline && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-50 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              )}
            </div>

            {/* Main Content Pane */}
            <div className="flex-1 overflow-y-auto bg-slate-50/50 flex flex-col min-h-[350px]">
              {activeTab === 'ports' ? (
                <>
                  {/* Registry Top Bar: Category cards explaining numbering */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-6 bg-slate-50/70 border-b border-slate-100">
                    <div 
                      onClick={() => setSelectedRange('well-known')}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                        selectedRange === 'well-known' 
                          ? 'bg-amber-50/50 border-amber-300 shadow-sm' 
                          : 'bg-white border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest leading-none">
                          {language === 'en' ? 'Well-Known' : 'Porte Ben Note'}
                        </span>
                        <Lock className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                      <h4 className="font-mono text-xs font-bold text-slate-700">0 - 1023</h4>
                      <p className="text-[11px] text-slate-500 mt-1 lines-clamp-2">
                        {language === 'en' 
                          ? 'Reserved for core system administration and essential transport daemons (HTTP, DNS, SSH, SMTP).' 
                          : 'Assegnate da IANA per sistemi e servizi fondamentali della suite TCP/IP.'}
                      </p>
                    </div>

                    <div 
                      onClick={() => setSelectedRange('registered')}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                        selectedRange === 'registered' 
                          ? 'bg-blue-50/50 border-blue-300 shadow-sm' 
                          : 'bg-white border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none">
                          {language === 'en' ? 'Registered' : 'Porte Registrate'}
                        </span>
                        <Unlock className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      <h4 className="font-mono text-xs font-bold text-slate-700">1024 - 49151</h4>
                      <p className="text-[11px] text-slate-500 mt-1 lines-clamp-2">
                        {language === 'en' 
                          ? 'Assigned to user processes, databases (MySQL, Redis, PostgreSQL), third-party programs or local web servers.' 
                          : 'Assegnate a ditte, utenti o processi specifici approvati (database, app locali, microservizi).'}
                      </p>
                    </div>

                    <div 
                      onClick={() => setSelectedRange('dynamic')}
                      className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                        selectedRange === 'dynamic' 
                          ? 'bg-emerald-50/50 border-emerald-300 shadow-sm' 
                          : 'bg-white border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none">
                          {language === 'en' ? 'Dynamic / Private' : 'Porte Dinamiche'}
                        </span>
                        <Activity className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      <h4 className="font-mono text-xs font-bold text-slate-700">49152 - 65535</h4>
                      <p className="text-[11px] text-slate-500 mt-1 lines-clamp-2">
                        {language === 'en' 
                          ? 'Ephemeral sockets dynamically chosen by the host OS during client connection initiation.' 
                          : 'Porte temporanee assegnate dinamicamente dal sistema operativo client all\'avvio di connessioni esterne.'}
                      </p>
                    </div>
                  </div>

                  {/* Filter / Search Bar */}
                  <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between bg-white">
                    <div className="relative w-full sm:max-w-md">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={language === 'en' ? 'Search ports, services, security or protocols...' : 'Cerca porte, sigle, sicurezze o protocolli...'}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/50 transition-all font-medium"
                      />
                    </div>

                    <div className="flex gap-2 self-start sm:self-auto shrink-0">
                      <button
                        onClick={() => setSelectedRange('all')}
                        className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase border tracking-tight transition-all ${
                          selectedRange === 'all' 
                            ? 'bg-slate-900 border-slate-900 text-white' 
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {language === 'en' ? 'All ranges' : 'Tutte'}
                      </button>
                      <button
                        onClick={() => setSelectedRange('well-known')}
                        className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase border tracking-tight transition-all ${
                          selectedRange === 'well-known' 
                            ? 'bg-amber-500 border-amber-500 text-white shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        0 - 1023
                      </button>
                      <button
                        onClick={() => setSelectedRange('registered')}
                        className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase border tracking-tight transition-all ${
                          selectedRange === 'registered' 
                            ? 'bg-blue-500 border-blue-500 text-white shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        1024 - 49151
                      </button>
                      <button
                        onClick={() => setSelectedRange('dynamic')}
                        className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase border tracking-tight transition-all ${
                          selectedRange === 'dynamic' 
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        49152+
                      </button>
                    </div>
                  </div>

                  {/* Port Rows Grid */}
                  <div className="flex-1 p-6 space-y-4">
                    {selectedRange === 'dynamic' && (
                      <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex gap-4 items-start mb-4">
                        <Activity className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <h5 className="font-bold text-xs text-emerald-800 uppercase tracking-wider">
                            {language === 'en' ? 'Understanding Dynamic Range' : 'Comprensione della Banda Dinamica'}
                          </h5>
                          <p className="text-[11px] text-emerald-700 leading-relaxed mt-1">
                            {language === 'en' 
                              ? 'This range (49152 to 65535) does not host pre-assigned application daemons. When you open a website, your computer chooses a dynamic port from this exact block as the "Source Port" (Porta Sorgente) to route incoming server replies back to your browser process.' 
                              : 'Questo intervallo (da 49152 a 65535) non ospita demoni di sistema fissi o preassegnati. Quando apri una pagina web, il tuo computer sceglie una porta dinamica da questo blocco come "Porta Sorgente" per ricanalizzare le risposte della rete verso la scheda corretta.'}
                          </p>
                        </div>
                      </div>
                    )}

                    {filteredPorts.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredPorts.map((item, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(idx * 0.02, 0.2) }}
                            className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group flex flex-col justify-between"
                          >
                            <div>
                              {/* Header segment of port row */}
                              <div className="flex justify-between items-start gap-2 mb-2">
                                <span className="flex items-center gap-1.5">
                                  <span className="px-2.5 py-1 bg-slate-900 text-white font-mono font-black text-xs rounded-lg select-all">
                                    PORT {item.port}
                                  </span>
                                  <span className="text-xs font-black text-slate-800 tracking-tight">
                                    {item.service}
                                  </span>
                                </span>

                                <span className="flex items-center gap-1">
                                  <span className="text-[9px] font-mono font-black px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded uppercase">
                                    {item.type}
                                  </span>
                                  <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-0.5 ${
                                    item.range === 'well-known' 
                                      ? 'bg-amber-50 text-amber-600 border border-amber-100' 
                                      : 'bg-blue-50 text-blue-600 border border-blue-100'
                                  }`}>
                                    {item.range === 'well-known' 
                                      ? (language === 'en' ? 'Core' : 'Nucleo') 
                                      : (language === 'en' ? 'App' : 'Servizio')}
                                  </span>
                                </span>
                              </div>

                              <div className="text-slate-800 text-xs font-black mb-1 group-hover:text-indigo-600 transition-colors">
                                {item.name}
                              </div>
                              <p className="text-[11px] text-slate-500 leading-normal">
                                {item.description[language]}
                              </p>
                            </div>

                            {/* Security Note at bottom of card */}
                            <div className="mt-3 pt-3 border-t border-slate-50/80 flex items-start gap-2 text-[11px]">
                              {item.isSecure ? (
                                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              ) : (
                                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                              )}
                              <p className={`leading-snug font-medium ${item.isSecure ? 'text-slate-500' : 'text-slate-500'}`}>
                                <strong className="text-[10px] uppercase font-black tracking-wider block mb-0.5">
                                  {language === 'en' ? 'Security Review' : 'Profilo di Sicurezza'}:
                                </strong>
                                {item.security[language]}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                        <Hash className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <h4 className="font-bold text-slate-700 text-sm">
                          {language === 'en' ? 'No ports match your search' : 'Nessuna corrispondenza trovata'}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                          {language === 'en' 
                            ? 'Try searching by numeric port (e.g., 22), protocol abbreviation (e.g., SSH), or search keyword.' 
                            : 'Prova a cercare per numero di porta (es. 22), sigla del protocollo (es. SSH) o parole descrittive.'}
                        </p>
                        <button
                          onClick={() => { setSearchTerm(''); setSelectedRange('all'); }}
                          className="mt-4 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-all"
                        >
                          {language === 'en' ? 'Clear search filters' : 'Riazzera filtri'}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : activeTab === 'protocols' ? (
                <>
                  {/* Category cards explaining OSI / TCP-IP Layers summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-6 bg-slate-50/70 border-b border-slate-100">
                    <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-rose-600 uppercase tracking-wider block">Layer 7</span>
                        <span className="text-xs font-black text-slate-800">Application</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 leading-tight">HTTP, DNS, SSH, SMTP, SNMP</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider block">Layer 4</span>
                        <span className="text-xs font-black text-slate-800">Transport</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 leading-tight">TCP (Reliable), UDP (Fast)</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider block">Layer 3</span>
                        <span className="text-xs font-black text-slate-800">Network</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 leading-tight">IP (Routing), ICMP (Ping)</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider block">Layer 2</span>
                        <span className="text-xs font-black text-slate-800">Data Link</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 leading-tight">ARP (Local Resolution)</p>
                    </div>
                  </div>

                  {/* Filter / Search Bar for Protocols */}
                  <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between bg-white">
                    <div className="relative w-full sm:max-w-md">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={language === 'en' ? 'Search protocol names, acronyms, or descriptions...' : 'Cerca nomi di protocolli, sigle o definizioni...'}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/50 transition-all font-medium"
                      />
                    </div>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase border bg-white border-slate-200 text-slate-500 hover:border-slate-300 transition-all shrink-0 font-mono"
                      >
                        {language === 'en' ? 'Reset' : 'Reset'}
                      </button>
                    )}
                  </div>

                  {/* Protocols Grid */}
                  <div className="flex-1 p-6 space-y-4">
                    {filteredProtocols.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredProtocols.map((item, idx) => {
                          // Layer-specific styling
                          let layerColor = "bg-rose-50 text-rose-700 border-rose-200";
                          if (item.layer === 4) layerColor = "bg-indigo-50 text-indigo-700 border-indigo-200";
                          if (item.layer === 3) layerColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
                          if (item.layer === 2) layerColor = "bg-amber-50 text-amber-700 border-amber-200";

                          return (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: Math.min(idx * 0.02, 0.2) }}
                              className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex justify-between items-start gap-2 mb-2">
                                  <span className="flex items-center gap-1.5">
                                    <span className="px-2.5 py-1 bg-indigo-600 text-white font-black text-xs rounded-lg select-all font-mono">
                                      {item.name}
                                    </span>
                                    <span className={`text-[9.5px] font-mono font-black px-2 py-0.5 rounded-lg border uppercase ${layerColor}`}>
                                      Layer {item.layer} ({item.type})
                                    </span>
                                  </span>
                                  {item.isSecure ? (
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg uppercase">
                                      {language === 'en' ? 'Secure' : 'Sicuro'}
                                    </span>
                                  ) : null}
                                </div>

                                <div className="text-slate-800 text-xs font-black mb-1 group-hover:text-indigo-600 transition-colors">
                                  {item.fullName}
                                </div>
                                <p className="text-[11px] text-slate-500 leading-normal">
                                  {item.description[language]}
                                </p>

                                <div className="mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                                  <strong className="text-[9.5px] text-slate-400 uppercase tracking-widest block mb-0.5">
                                    {language === 'en' ? 'Core Use Case' : 'Caso d\'Uso Principale'}
                                  </strong>
                                  <p className="text-[11px] text-slate-600 leading-normal">
                                    {item.useCase[language]}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-3 pt-3 border-t border-slate-50/80 flex items-start gap-2 text-[11px]">
                                {item.isSecure ? (
                                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                ) : (
                                  <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                )}
                                <p className="leading-snug font-medium text-slate-500">
                                  <strong className="text-[9.5px] uppercase font-black tracking-wider block mb-0.5 text-slate-400">
                                    {language === 'en' ? 'Security Review' : 'Profilo di Sicurezza'}:
                                  </strong>
                                  {item.security[language]}
                                </p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                        <Layers className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <h4 className="font-bold text-slate-700 text-sm">
                          {language === 'en' ? 'No protocols match your search' : 'Nessun protocollo trovato'}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                          {language === 'en' 
                            ? 'Try searching by name, description key terms, or OSI layer acronym.' 
                            : 'Prova a cercare per sigla, parole chiave della descrizione o livello OSI.'}
                        </p>
                        <button
                          onClick={() => { setSearchTerm(''); }}
                          className="mt-4 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-all"
                        >
                          {language === 'en' ? 'Clear search filter' : 'Riazzera filtro'}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : activeTab === 'devices' ? (
                <>
                  {/* Category cards explaining Network Hardware level */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-6 bg-slate-50/70 border-b border-slate-100">
                    <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-rose-600 uppercase tracking-wider block">Layer 3, 4, 7</span>
                        <span className="text-xs font-black text-slate-800">Security Gateways</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 leading-tight">Firewall, Gateway Applicativo</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider block">Layer 3</span>
                        <span className="text-xs font-black text-slate-800">Network Layer</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 leading-tight">Router, Switch Layer 3</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider block">Layer 2</span>
                        <span className="text-xs font-black text-slate-800">Data Link</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 leading-tight">Switch Ethernet, Wireless AP, Bridge</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider block">Layer 1</span>
                        <span className="text-xs font-black text-slate-800">Physical Layer</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 leading-tight">Hub Passivo, Cavi, Ripetitore</p>
                    </div>
                  </div>

                  {/* Filter / Search Bar for Devices */}
                  <div className="px-6 py-4 border-b border-slate-100 bg-white space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between font-sans">
                      <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder={language === 'en' ? 'Search network hardware, firewall, router, switch...' : 'Cerca apparati, firewall, router, switch...'}
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/50 transition-all font-medium font-sans"
                        />
                      </div>
                      
                      <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mr-1 font-mono">
                          {language === 'en' ? 'Total' : 'Totale'}: {filteredDevices.length}
                        </span>
                        {(searchTerm || deviceCategory !== 'all') && (
                          <button
                            onClick={() => { setSearchTerm(''); setDeviceCategory('all'); }}
                            className="px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase border bg-white border-slate-200 text-slate-500 hover:border-slate-300 transition-all shrink-0 font-mono"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 font-sans">
                      <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider mr-1 self-center font-mono">
                        {language === 'en' ? 'Filter by Type:' : 'Filtra per Tipologia:'}
                      </span>
                      <button
                        onClick={() => setDeviceCategory('all')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          deviceCategory === 'all'
                            ? 'bg-slate-900 border border-slate-900 text-white shadow-sm'
                            : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span>{language === 'en' ? 'All Hardware' : 'Tutti gli Apparati'}</span>
                      </button>
                      
                      <button
                        onClick={() => setDeviceCategory('security')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          deviceCategory === 'security'
                            ? 'bg-rose-600 border border-rose-600 text-white shadow-sm'
                            : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600'
                        }`}
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>{language === 'en' ? 'Security & Defense' : 'Sicurezza & Protezione'}</span>
                      </button>

                      <button
                        onClick={() => setDeviceCategory('networking')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          deviceCategory === 'networking'
                            ? 'bg-indigo-600 border border-indigo-600 text-white shadow-sm'
                            : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600'
                        }`}
                      >
                        <Network className="w-3.5 h-3.5" />
                        <span>{language === 'en' ? 'Routing & Switching' : 'Connettività & Routing'}</span>
                      </button>

                      <button
                        onClick={() => setDeviceCategory('infrastructure')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          deviceCategory === 'infrastructure'
                            ? 'bg-amber-600 border border-amber-600 text-white shadow-sm'
                            : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600'
                        }`}
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>{language === 'en' ? 'Access & Transport' : 'Accesso & Trasmissione'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Devices Grid */}
                  <div className="flex-1 p-6 space-y-4">
                    {filteredDevices.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredDevices.map((item, idx) => {
                          // Layer-specific styling
                          let layerColor = "bg-rose-50 text-rose-700 border-rose-200";
                          if (item.layer.includes("Layer 3 (")) {
                            layerColor = "bg-indigo-50 text-indigo-700 border-indigo-200";
                          } else if (item.layer.includes("Layer 2")) {
                            layerColor = "bg-blue-50 text-blue-700 border-blue-200";
                          } else if (item.layer.includes("Layer 1")) {
                            layerColor = "bg-amber-50 text-amber-700 border-amber-200";
                          }

                          // Icon logic
                          const getDeviceIcon = (iconName: string) => {
                            switch (iconName) {
                              case 'Shield': return <Shield className="w-5 h-5 text-rose-600" />;
                              case 'Shuffle': return <Shuffle className="w-5 h-5 text-indigo-600" />;
                              case 'Network': return <Network className="w-5 h-5 text-blue-600" />;
                              case 'Radio': return <Radio className="w-5 h-5 text-sky-600" />;
                              case 'Cpu': return <Cpu className="w-5 h-5 text-purple-600" />;
                              case 'Server': return <Server className="w-5 h-5 text-slate-600" />;
                              case 'Activity': return <Activity className="w-5 h-5 text-teal-600" />;
                              default: return <Server className="w-5 h-5 text-slate-600" />;
                            }
                          };

                          return (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: Math.min(idx * 0.02, 0.2) }}
                              className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all group flex flex-col justify-between"
                            >
                              <div className="space-y-3">
                                <div className="flex justify-between items-start gap-2">
                                  <span className="flex items-center gap-2">
                                    <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-100">
                                      {getDeviceIcon(item.iconName)}
                                    </div>
                                    <span className="text-sm font-black text-slate-800 tracking-tight">
                                      {item.name}
                                    </span>
                                  </span>
                                  <span className={`text-[9.5px] font-mono font-black px-2 py-0.5 rounded-lg border uppercase ${layerColor}`}>
                                    {item.layer}
                                  </span>
                                </div>

                                <div>
                                  <div className="text-slate-800 text-xs font-black mb-1">
                                    {item.fullName}
                                  </div>
                                  <p className="text-[11px] text-slate-500 leading-normal mb-3 font-medium">
                                    {language === 'en' ? item.role.en : item.role.it}
                                  </p>
                                </div>

                                <div className="space-y-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100/85 overflow-hidden flex flex-col justify-between">
                                  <div>
                                    <strong className="text-[9px] text-slate-400 uppercase tracking-wider block mb-0.5">
                                      {language === 'en' ? 'How it Works' : 'Come Funziona'}
                                    </strong>
                                    <p className="text-[11px] text-slate-600 leading-normal">
                                      {language === 'en' ? item.howItWorks.en : item.howItWorks.it}
                                    </p>
                                  </div>
                                  <div className="pt-2 border-t border-slate-100">
                                    <strong className="text-[9px] text-indigo-500 uppercase tracking-wider block mb-0.5">
                                      {language === 'en' ? 'Cyber Attack Risks (Mitigated)' : 'Vulnerabilità & Attacchi (Mitigati)'}
                                    </strong>
                                    <p className="text-[11px] text-slate-600 leading-normal">
                                      {language === 'en' ? item.securityAttacks.en : item.securityAttacks.it}
                                    </p>
                                  </div>
                                  <div className="pt-2 border-t border-slate-100 bg-rose-50/40 -mx-3 -mb-3 px-3 pb-3 pt-2 rounded-b-xl border-dashed border-rose-100/70 mt-1">
                                    <strong className="text-[9px] text-red-600 uppercase tracking-wider block mb-1 flex items-center gap-1">
                                      <ShieldAlert className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                      {language === 'en' ? 'What it CANNOT Stop & Why' : 'Cosa NON può fermare & Perché'}
                                    </strong>
                                    <p className="text-[10.5px] text-red-950 font-semibold leading-relaxed">
                                      {language === 'en' ? item.cannotStop.en : item.cannotStop.it}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4 pt-3 border-t border-slate-50 flex items-start gap-2 text-[11px]">
                                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <div className="leading-snug text-slate-500 font-medium">
                                  <strong className="text-[9px] uppercase font-black tracking-wider block mb-0.5 text-slate-400">
                                    {language === 'en' ? 'Strategic Mitigation' : 'Mitigazione & Difesa'}:
                                  </strong>
                                  {language === 'en' ? item.mitigation.en : item.mitigation.it}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                        <Network className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <h4 className="font-bold text-slate-700 text-sm">
                          {language === 'en' ? 'No devices match your search' : 'Nessun apparato trovato'}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                          {language === 'en' 
                            ? 'Try searching by physical terms like firewall, router, switch or hub.' 
                            : 'Prova a cercare termini come firewall, router, switch o hub.'}
                        </p>
                        <button
                          onClick={() => { setSearchTerm(''); }}
                          className="mt-4 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-all"
                        >
                          {language === 'en' ? 'Clear search filter' : 'Riazzera filtro'}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : activeTab === 'secure-access' ? (
                /* AAA & VPN Secure Access Interface */
                <div className="flex-1 p-6 space-y-6 max-w-6xl mx-auto w-full">
                  {/* Top Intro Card */}
                  <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg border border-slate-950">
                    <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-8 translate-y-8">
                      <Lock className="w-64 h-64" />
                    </div>
                    <div className="max-w-2xl relative z-10 space-y-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-500/30">
                        <Lock className="w-3 h-3" />
                        {language === 'en' ? 'Enterprise Access Integrity' : 'Integrità degli Accessi Aziendali'}
                      </span>
                      <h3 className="text-2xl font-black uppercase tracking-tight leading-none text-white">
                        {language === 'en' ? 'AAA Secure Framework & Virtual Tunneling' : 'Framework Sicuro AAA & Tunneling Virtuale'}
                      </h3>
                      <p className="text-slate-300 text-[12.5px] leading-relaxed">
                        {language === 'en'
                          ? 'Authentication frameworks, AAA servers, and secure overlay channels protect network boundaries. Learn how EAP, RADIUS, TACACS+, and VPN technologies establish trusted tunnels and audit administrative sessions.'
                          : 'I framework di autenticazione, i server AAA e i canali logici protetti difendono i confini delle reti. Scopri come le tecnologie EAP, RADIUS, TACACS+ e VPN creano tunnel cifrati e certificano le sessioni degli utenti.'}
                      </p>
                    </div>
                  </div>

                  {/* Segment Selector tabs */}
                  <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-px select-none">
                    <button
                      id="subtab-eap"
                      onClick={() => setSecureSubTab('eap')}
                      className={`px-4 py-2 text-xs font-black uppercase border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                        secureSubTab === 'eap'
                          ? 'border-emerald-500 text-emerald-600 font-extrabold'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {language === 'en' ? 'EAP Framework (Types)' : 'Framework EAP (Tutti i Tipi)'}
                    </button>
                    <button
                      id="subtab-aaa"
                      onClick={() => setSecureSubTab('aaa')}
                      className={`px-4 py-2 text-xs font-black uppercase border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                        secureSubTab === 'aaa'
                          ? 'border-emerald-500 text-emerald-600 font-extrabold'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Server className="w-3.5 h-3.5" />
                      RADIUS vs TACACS+ (AAA)
                    </button>
                    <button
                      id="subtab-vpn"
                      onClick={() => setSecureSubTab('vpn')}
                      className={`px-4 py-2 text-xs font-black uppercase border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                        secureSubTab === 'vpn'
                          ? 'border-emerald-500 text-emerald-600 font-extrabold'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      DTLS, IPsec & VPN
                    </button>
                  </div>

                  {/* Subtab Contents panels */}
                  <AnimatePresence mode="wait">
                    {secureSubTab === 'eap' && (
                      <motion.div
                        key="eap-panel"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        {/* EAP Overview */}
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
                          <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-tight">
                            {language === 'en' ? 'Extensible Authentication Protocol (EAP)' : 'Extensible Authentication Protocol (EAP)'}
                          </h4>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            {language === 'en'
                              ? 'EAP is not a stand-alone protocol, but a generic container framework that supports diverse authentication methods. It negotiates credentials between client devices (supplicants), wireless access points/switches (authenticators), and back-end AAA servers (RADIUS/TACACS+).'
                              : "EAP non è un protocollo a sé stante, ma un framework contenitore flessibile progettato per ospitare svariati metodi di autenticazione. Gestisce baratti e negoziazione di credenziali tra lo smart device (supplicant), l'Access Point o Switch di rete (authenticator) e il server d'accesso centrale (RADIUS/TACACS+)."}
                          </p>
                        </div>

                        {/* Interactive EAP Types Explorer */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                          {/* Method Selector buttons - Left Col */}
                          <div className="md:col-span-4 space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                              {language === 'en' ? 'Select EAP Method' : 'Seleziona Metodo EAP'}
                            </span>
                            {[
                              { id: 'tls', name: 'EAP-TLS', full: 'EAP Transport Layer Security', desc: 'Dual-certs' },
                              { id: 'peap', name: 'EAP-PEAP', full: 'Protected Extensible Auth Protocol', desc: 'Server cert' },
                              { id: 'ttls', name: 'EAP-TTLS', full: 'Tunneled TLS Auth', desc: 'Flexible inner' },
                              { id: 'fast', name: 'EAP-FAST', full: 'Flexible Auth via Secure Tunneling', desc: 'PAC key exchange' },
                              { id: 'md5', name: 'EAP-MD5', full: 'Message Digest 5', desc: 'Insecure legacy' }
                            ].map((met) => (
                              <button
                                key={met.id}
                                id={`eap-btn-${met.id}`}
                                onClick={() => setSelectedEap(met.id as any)}
                                className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex justify-between items-center ${
                                  selectedEap === met.id
                                    ? 'bg-emerald-600 border-emerald-700 text-white shadow'
                                    : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <div>
                                  <div className="font-black">{met.name}</div>
                                  <div className={`text-[10px] font-normal leading-tight ${selectedEap === met.id ? 'text-emerald-100' : 'text-slate-400'}`}>
                                    {met.full}
                                  </div>
                                </div>
                                <span className={`text-[9px] font-bold uppercase shrink-0 px-2 py-0.5 rounded border ${
                                  selectedEap === met.id
                                    ? 'bg-emerald-500/30 border-emerald-400 text-white'
                                    : met.id === 'md5'
                                    ? 'bg-rose-50 border-rose-100 text-rose-600'
                                    : 'bg-slate-50 border-slate-200 text-slate-500'
                                }`}>
                                  {met.desc}
                                </span>
                              </button>
                            ))}
                          </div>

                          {/* Detail of selected method - Right Col */}
                          <div id="eap-detail-card" className="md:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-6">
                            {/* Detailed explanation */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h5 className="font-black text-slate-800 text-md uppercase">
                                  {selectedEap === 'tls' && 'EAP-TLS (Certificates Verified)'}
                                  {selectedEap === 'peap' && 'EAP-PEAP (Protected EAP)'}
                                  {selectedEap === 'ttls' && 'EAP-TTLS (Tunneled TLS)'}
                                  {selectedEap === 'fast' && 'EAP-FAST (Cisco Secure)'}
                                  {selectedEap === 'md5' && 'EAP-MD5 (Vulnerable Legacy)'}
                                </h5>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                  selectedEap === 'md5'
                                    ? 'bg-red-50 text-red-600 border border-red-100'
                                    : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                }`}>
                                  {selectedEap === 'md5' ? (language === 'en' ? 'CRITICAL RISK' : 'RISCHIO ATTO') : (language === 'en' ? 'RECOMMENDED/SECURE' : 'CONSIGLIATO / SICURO')}
                                </span>
                              </div>

                              <p className="text-[12.5px] text-slate-600 leading-relaxed">
                                {selectedEap === 'tls' && (
                                  language === 'en'
                                    ? 'EAP-TLS requires digital certificates on both the client device (supplicant) and the authentication server. Authenticating without passwords makes it immune to phishing, dictionary, and brute force attacks. It is the gold standard for enterprise-grade 802.1X secure network ports.'
                                    : 'EAP-TLS richiede certificati digitali X.509 validi sia sul client (supplicant) sia sul server di verifica. Trattandosi di autenticazione crittografica priva di password, è immune ad attacchi di phishing, dizionario e brute force. Rappresenta la scelta eccellente e standard aureo per reti aziendali ad alta sicurezza.'
                                )}
                                {selectedEap === 'peap' && (
                                  language === 'en'
                                    ? 'EAP-PEAP simplifies deployment: only the authentication server needs a certificate. The server presents its card to establish a secure outer TLS encrypted tunnel. Inside this secure dome, the client can safely transmit standard credentials (usually using MSCHAPv2 user/pass) without danger of sniffing.'
                                    : "EAP-PEAP semplifica l'installazione aziendale: solo il server centrale richiede un certificato. Il server lo invia al client per stabilire inizialmente un tunnel TLS crittografato (involucro esterno). All'interno di questo tunnel protetto, il client autentica sé stesso inviando le classiche credenziali (di solito MSCHAPv2 user/password) in piena sicurezza."
                                )}
                                {selectedEap === 'ttls' && (
                                  language === 'en'
                                    ? 'Similar to PEAP, EAP-TTLS creates a secure outer TLS tunnel first based on the server certificate. Inside the tunnel, however, TTLS allows an even wider variety of legacy inner authentication protocols (like PAP, CHAP, or MSCHAPv1) without exposing them to cleartext sniffing risks.'
                                    : 'Molto simile a PEAP, EAP-TTLS genera un canale TLS esterno cifrato basandosi sul certificato del server. Al suo interno, permette tuttavia un ventaglio flessibile di vecchi protocolli interni di autenticazione (es. PAP, CHAP, MSCHAP) che non potrebbero viaggiare all\'aria aperta in chiaro di default.'
                                )}
                                {selectedEap === 'fast' && (
                                  language === 'en'
                                    ? 'Created by Cisco as an alternative to digital certificates. Instead of heavy certificate authorities, it uses an in-band shared symmetric credential called PAC (Protected Access Credential) to establish a protective tunnel, preventing latency during access handshakes.'
                                    : 'Concepito da Cisco per aggirare la complessa infrastruttura a chiavi pubbliche (PKI). Sostituisce i certificati digitali delegando la transazione iniziale ad una credenziale simmetrica chiamata PAC (Protected Access Credential), riducendo la latenza complessiva.'
                                )}
                                {selectedEap === 'md5' && (
                                  language === 'en'
                                    ? 'An old legacy EAP type that transmits password hashes using MD5 without establishing any encrypted tunnel. Highly vulnerable to dictionary sniffing, offline brute force, and fake access point dirottements (Evil Twin/MitM). Deprecated and strictly forbidden in professional networks.'
                                    : 'Il tipo di EAP più antico. Trasmette gli hash delle password dei client via MD5 senza creare alcun tunnel cifrato a monte. È altamente vulnerabile a intercettazione passiva (sniffing), attacchi offline a dizionario ed Evil Twin. È fortemente sconsigliato e deprecato.'
                                )}
                              </p>
                            </div>

                            {/* Interactive flow map diagram of supplicant authenticator server */}
                            <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-[10.5px] border border-slate-950 space-y-3 shrink-0">
                              <div className="border-b border-slate-800 pb-1.5 flex justify-between items-center text-slate-400 font-bold uppercase tracking-wider">
                                <span>Autentication Protocol Interaction Map</span>
                                <span className="text-[9px] shrink-0 text-amber-500 font-normal">Active Selection: {selectedEap.toUpperCase()}</span>
                              </div>

                              <div className="grid grid-cols-3 text-center gap-1 font-bold text-slate-400 uppercase py-1 bg-slate-800/20 rounded">
                                <span className="text-blue-300">Client / Supplicant</span>
                                <span className="text-emerald-300">Switch/AP / Authenticator</span>
                                <span className="text-pink-300">AAA Server / RADIUS</span>
                              </div>

                              {/* Interactive sequence flow based on EAP choices */}
                              <div className="space-y-2 mt-2 leading-relaxed">
                                {selectedEap === 'tls' && (
                                  <>
                                    <div className="flex justify-between items-center text-slate-400">
                                      <span>1. Client starts association</span>
                                      <span className="text-blue-400">EAPOL-Start ───&gt;</span>
                                      <span className="text-emerald-400">AP limits port</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-300">
                                      <span>2. Server prompts certificate</span>
                                      <span className="text-pink-400">&lt;─── TLS Certs Exchange ───&gt;</span>
                                      <span>Supplicant &amp; Server validation</span>
                                    </div>
                                    <div className="flex justify-between items-center text-emerald-400 font-bold">
                                      <span>3. Mutual trust verified</span>
                                      <span>Certificates digital signature valid (Dual checks)</span>
                                      <span className="text-emerald-400">✓ Port Activated</span>
                                    </div>
                                  </>
                                )}
                                {selectedEap === 'peap' && (
                                  <>
                                    <div className="flex justify-between items-center text-slate-400">
                                      <span>1. Client seeks access</span>
                                      <span className="text-blue-400">WPA-Enterprise init ──&gt;</span>
                                      <span>Relayed to AAA Server</span>
                                    </div>
                                    <div className="flex justify-between items-center text-amber-300">
                                      <span>2. Encrypted TLS Tunnel</span>
                                      <span className="text-pink-400">&lt;═ [Outer Tunnel Established] ═&gt;</span>
                                      <span>RADIUS Cert validated by Client</span>
                                    </div>
                                    <div className="flex justify-between items-center text-emerald-400">
                                      <span>3. Inner credential check</span>
                                      <span className="text-blue-400">└─ Sends encrypted User/Pass ──&gt;</span>
                                      <span>RADIUS check against Active Directory</span>
                                    </div>
                                  </>
                                )}
                                {selectedEap === 'ttls' && (
                                  <>
                                    <div className="flex justify-between items-center text-slate-400">
                                      <span>1. Request connection</span>
                                      <span>802.1X link initiated</span>
                                      <span>Active bridge suspended</span>
                                    </div>
                                    <div className="flex justify-between items-center text-indigo-300">
                                      <span>2. Server tunnel setup</span>
                                      <span className="text-indigo-400">&lt;═ [Tunnel TLS Shield Active] ═&gt;</span>
                                      <span>Server authentication authenticated</span>
                                    </div>
                                    <div className="flex justify-between items-center text-emerald-400">
                                      <span>3. Safe legacy pass exchange</span>
                                      <span className="text-blue-400">└─ Internal PAP/CHAP credential ──&gt;</span>
                                      <span>✓ Decrypted and checked in server</span>
                                    </div>
                                  </>
                                )}
                                {selectedEap === 'fast' && (
                                  <>
                                    <div className="flex justify-between items-center text-slate-400">
                                      <span>1. Handshake request</span>
                                      <span className="text-blue-400">PAC identification key ──&gt;</span>
                                      <span>Matches PAC database lookup</span>
                                    </div>
                                    <div className="flex justify-between items-center text-emerald-300">
                                      <span>2. Rapid tunnel creation</span>
                                      <span className="text-pink-400">&lt;═ [PAC encrypted tunnel] ═&gt;</span>
                                      <span>No heavy Certificate Authorities required</span>
                                    </div>
                                    <div className="flex justify-between items-center text-emerald-400">
                                      <span>3. Access approved</span>
                                      <span>Credential matched symmetrically</span>
                                      <span>✓ Port instantly authorized</span>
                                    </div>
                                  </>
                                )}
                                {selectedEap === 'md5' && (
                                  <>
                                    <div className="flex justify-between items-center text-slate-400">
                                      <span>1. Client logins</span>
                                      <span className="text-blue-300">Simple identity request ──&gt;</span>
                                      <span>No tunnel wrapping available</span>
                                    </div>
                                    <div className="flex justify-between items-center text-rose-400 font-semibold animate-pulse">
                                      <span>2. Password challenge</span>
                                      <span className="text-pink-400">&lt;─── Sends raw MD5 challenge ───</span>
                                      <span>Vulnerable to dictionary brute force Sniffer</span>
                                    </div>
                                    <div className="flex justify-between items-center text-rose-500 font-bold">
                                      <span>3. CRITICAL RISK</span>
                                      <span>Password hash readable by rogue antennas</span>
                                      <span>⚠ Deauth and identity loss risk high</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {secureSubTab === 'aaa' && (
                      <motion.div
                        key="aaa-panel"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        {/* AAA Overview info */}
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
                          <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-tight">
                            {language === 'en' ? 'Centralized Network Control: RADIUS vs TACACS+' : 'Controllo Centralizzato degli Accessi: RADIUS vs TACACS+'}
                          </h4>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            {language === 'en'
                              ? 'RADIUS and TACACS+ are both AAA (Authentication, Authorization, Accounting) protocols used to manage network access. However, they were built for different scopes: RADIUS is engineered for user/client access at the perimeter, while TACACS+ is crafted for fine-grained administrative access controls directly on network hardware.'
                              : "RADIUS e TACACS+ sono i due protocolli di gestione centralizzata AAA (Autenticazione, Autorizzazione, Accounting) leader del mercato. Sebbene si somiglino negli scopi, nascono per esigenze antitetiche: RADIUS si focalizza sul controllo d'accesso degli utenti ai bordi (es. Wi-Fi aziendale), mentre TACACS+ governa la sicurezza degli amministratori di sistema direttamente sulle riga di comando di router e switch."}
                          </p>
                        </div>

                        {/* Comparative Grid Table */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                          {/* RADIUS Features Card */}
                          <div className="bg-white border-t-4 border-t-blue-500 border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                            <span className="text-xs font-black text-blue-600 font-mono tracking-widest block uppercase">RADIUS</span>
                            <h5 className="font-extrabold text-slate-800 text-sm">Remote Authentication Dial-In User Service</h5>
                            
                            <ul className="space-y-2.5 text-xs text-slate-600">
                              <li className="flex items-start gap-2">
                                <span className="p-1 bg-blue-50 text-blue-600 rounded-md shrink-0 font-mono text-[10px] font-bold">L4</span>
                                <span><strong>{language === 'en' ? 'Transport' : 'Trasporto'}:</strong> UDP (ports 1812 Authentication, 1813 Accounting). Connectionless and fast.</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="p-1 bg-blue-50 text-blue-600 rounded-md shrink-0 font-mono text-[10px] font-bold">SEC</span>
                                <span><strong>{language === 'en' ? 'Encryption' : 'Crittografia'}:</strong> Only encrypts the password field inside the packet. Usernames, attributes, and session statistics are sent in cleartext.</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="p-1 bg-blue-50 text-blue-600 rounded-md shrink-0 font-mono text-[10px] font-bold">AAA</span>
                                <span><strong>{language === 'en' ? 'Separation' : 'Separazione'}:</strong> Combines Authentication and Authorization together in a single request transaction.</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="p-1 bg-blue-50 text-blue-600 rounded-md shrink-0 font-mono text-[10px] font-bold">USE</span>
                                <span><strong>{language === 'en' ? 'Scope' : 'Destinazione'}:</strong> Client access and perimeter doors (secure corporate Wi-Fi, switches port locking, Dial-up/Broadband networks).</span>
                              </li>
                            </ul>
                          </div>

                          {/* TACACS+ Features Card */}
                          <div className="bg-white border-t-4 border-t-emerald-500 border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                            <span className="text-xs font-black text-emerald-600 font-mono tracking-widest block uppercase">TACACS+</span>
                            <h5 className="font-extrabold text-slate-800 text-sm">Terminal Access Controller Access-Control System Plus</h5>
                            
                            <ul className="space-y-2.5 text-xs text-slate-600">
                              <li className="flex items-start gap-2">
                                <span className="p-1 bg-emerald-50 text-emerald-600 rounded-md shrink-0 font-mono text-[10px] font-bold">L4</span>
                                <span><strong>{language === 'en' ? 'Transport' : 'Trasporto'}:</strong> TCP (port 49). Establishes a connection-oriented stateful session, guaranteed delivery.</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="p-1 bg-emerald-50 text-emerald-600 rounded-md shrink-0 font-mono text-[10px] font-bold">SEC</span>
                                <span><strong>{language === 'en' ? 'Encryption' : 'Crittografia'}:</strong> Completely encrypts the entire body payload of the packet. Only a minimal standard header is left in plaintext.</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="p-1 bg-emerald-50 text-emerald-600 rounded-md shrink-0 font-mono text-[10px] font-bold">AAA</span>
                                <span><strong>{language === 'en' ? 'Separation' : 'Separazione'}:</strong> Separates Authentication, Authorization, and Accounting cleanly into autonomous queries.</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="p-1 bg-emerald-50 text-emerald-600 rounded-md shrink-0 font-mono text-[10px] font-bold">USE</span>
                                <span><strong>{language === 'en' ? 'Scope' : 'Destinazione'}:</strong> Highly detailed administrative control on switches, routers, firewalls. Authorizes specific configuration commands (e.g. allow only 'show running-config' but deny 'reload').</span>
                              </li>
                            </ul>
                          </div>
                        </div>

                        {/* Interactive Diagnostic AAA Console simulator */}
                        <div className="bg-slate-900 border border-slate-950 rounded-2xl p-5 text-slate-300 space-y-4">
                          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                            <h5 className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                              <Activity className="w-4 h-4 text-emerald-400" />
                              {language === 'en' ? 'AAA Active Protocol Logger' : 'Analizzatore Real-Time Auditing AAA'}
                            </h5>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedAaaSim('radius')}
                                className={`px-2 py-1 rounded text-[10px] font-bold font-mono transition-colors border ${
                                  selectedAaaSim === 'radius'
                                    ? 'bg-blue-600 text-white border-blue-700'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                              >
                                {language === 'en' ? 'Simulate RADIUS' : 'Simula RADIUS'}
                              </button>
                              <button
                                onClick={() => setSelectedAaaSim('tacacs')}
                                className={`px-2 py-1 rounded text-[10px] font-bold font-mono transition-colors border ${
                                  selectedAaaSim === 'tacacs'
                                    ? 'bg-emerald-600 text-white border-emerald-700'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                              >
                                {language === 'en' ? 'Simulate TACACS+' : 'Simula TACACS+'}
                              </button>
                            </div>
                          </div>

                          <div className="p-4 bg-slate-950 rounded-xl font-mono text-xs space-y-2 leading-relaxed border border-slate-800">
                            {selectedAaaSim === 'radius' ? (
                              <>
                                <p className="text-blue-400">&gt; RADIUS CLI: Connecting Client WPA3-Enterprise supplicant...</p>
                                <p className="text-slate-500">&gt; Packet generated: UDP Port 1812 destination, size 124 bytes.</p>
                                <p className="text-amber-400 font-bold">&gt; [SNIFFER VIEW] Username: "employee_chiara" [PLAINTEXT]</p>
                                <p className="text-amber-400 font-bold">&gt; [SNIFFER VIEW] Encrypted Attribute: Password hash: "ESP_hash_2026_***" [PROTECTED]</p>
                                <p className="text-slate-400">&gt; Query dispatched to company Active Directory Server. Checking user profiles...</p>
                                <p className="text-emerald-400 font-bold">&gt; RESPONSE RECEIVED [Access-Accept] - Combined Auth/Authz approved. User connected. Profile: "VLAN_IT_Dept" assigned.</p>
                              </>
                            ) : (
                              <>
                                <p className="text-emerald-400">&gt; TACACS+ CLI: Sys-Administrator "chiara_admin" logging on Router_Core_Rome...</p>
                                <p className="text-slate-500">&gt; Session opened: TCP Port 49 connection established. Stateful handshake completed.</p>
                                <p className="text-emerald-500 font-bold">&gt; [SNIFFER VIEW] Entire packet body encrypted. Payload is invisible to hackers! [CRITICAL ADVANTAGE]</p>
                                <p className="text-slate-400">&gt; Command typed: "configure terminal" (auth check requested)...</p>
                                <p className="text-emerald-400 font-bold">&gt; COMMAND AUTHORIZATION: Approved. Server grants "Privilege Level 15" for exact conft commands.</p>
                                <p className="text-slate-400">&gt; Logged command to security audit ledger [TACACS+ Accounting].</p>
                              </>
                            )}
                          </div>
                          
                          <div className="text-slate-400 text-[11px] leading-relaxed">
                            {selectedAaaSim === 'radius' ? (
                              <p>
                                <strong>💡 {language === 'en' ? 'Security Lesson' : 'Spiegazione Pratica'}:</strong>{' '}
                                {language === 'en'
                                  ? 'Notice how RADIUS left the username visible in plaintext over the wire! Because RADIUS only encrypts the password attribute, hackers sniffing local network corridors can map all your corporate active usernames easily. Standard RADIUS should always be encapsulated inside secure IPsec tunnels or upgraded to RadSec (over TLS).'
                                  : "Nota come il pacchetto RADIUS trasmetta il nome utente in chiaro lungo la linea di transito! Poiché RADIUS cifra soltanto la password, terzi hacker in ascolto abusivo possono mappare l'identità dell'utente semplicemente spiando i pacchetti. Per questo motivo, il protocollo va protetto incapsulandolo in tunnel IPsec o migrando a RadSec (RADIUS su TLS Cifrato)."}
                              </p>
                            ) : (
                              <p>
                                <strong>💡 {language === 'en' ? 'Security Lesson' : 'Spiegazione Pratica'}:</strong>{' '}
                                {language === 'en'
                                  ? 'TACACS+ completely encrypts every packet. Sniffers only see the transport TCP layer metadata. Furthermore, TACACS+ checks every single configuration command individually. If a rogue admin types "reload" or "erase startup-config", TACACS+ can block the command instantly while keeping the engineer session active, guaranteeing professional security auditing.'
                                  : 'Il TACACS+ cifra interamente ogni pacchetto; gli sniffer vedono solo i metadati di trasporto. Inoltre, TACACS+ convalida i comandi in modo granulare: se un amministratore malevolo digita "reload" o comandi dannosi, il server può negare lo specifico comando salvando la rete, lasciando l\'utente connesso per compiere altre configurazioni.'}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {secureSubTab === 'vpn' && (
                      <motion.div
                        key="vpn-panel"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        {/* VPN Overview card */}
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
                          <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-tight">
                            {language === 'en' ? 'Overlay Tunneling Security: VPN, IPsec & DTLS' : 'La Sicurezza dell\'Overlay Tunneling: VPN, IPsec & DTLS'}
                          </h4>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            {language === 'en'
                              ? 'A Virtual Private Network (VPN) creates a secure logical overlay network on top of physical networks (like the internet). IPsec and DTLS are the standard cryptographic engines that make VPN tunnels secure against sniffing and manipulation.'
                              : "Una Virtual Private Network (VPN) estende un canale privato sicuro (overlay) al di sopra di infrastrutture pubbliche (underlay) non filtrate come la rete globale Internet. IPsec e DTLS rappresentano i motori crittografici fondamentali usati per blindare e convalidare i tunnel contro l'intercettazione e il sabotaggio."}
                          </p>
                        </div>

                        {/* Interactive selector for VPN Modes */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                          {/* Left menu selection */}
                          <div className="lg:col-span-4 space-y-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                              {language === 'en' ? 'Select Tunnel Technology' : 'Scegli la Tecnologia Minerale'}
                            </span>
                            {[
                              { id: 'vpn-overview', name: 'VPN Overview', desc: 'Secure logical envelopes' },
                              { id: 'ipsec-tunnel', name: 'IPsec Tunnel Mode', desc: 'Whole packet encryption' },
                              { id: 'ipsec-transport', name: 'IPsec Transport Mode', desc: 'Payload encryption only' },
                              { id: 'dtls', name: 'DTLS (UDP Security)', desc: 'Real-time high performance' }
                            ].map((vMode) => (
                              <button
                                key={vMode.id}
                                id={`vpn-btn-${vMode.id}`}
                                onClick={() => setSelectedVpnMode(vMode.id as any)}
                                className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex justify-between items-center ${
                                  selectedVpnMode === vMode.id
                                    ? 'bg-emerald-600 border-emerald-700 text-white shadow'
                                    : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <div>
                                  <div className="font-black">{vMode.name}</div>
                                  <div className={`text-[10px] font-normal leading-tight ${selectedVpnMode === vMode.id ? 'text-emerald-100' : 'text-slate-400'}`}>
                                    {vMode.desc}
                                  </div>
                                </div>
                                <span className="text-[14px] shrink-0 font-bold">→</span>
                              </button>
                            ))}
                          </div>

                          {/* Right detail area */}
                          <div id="vpn-detail-card" className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-5">
                            {/* Header description */}
                            <div className="space-y-2">
                              <h5 className="font-black text-slate-800 text-sm uppercase">
                                {selectedVpnMode === 'vpn-overview' && (language === 'en' ? 'VPN Overview & Cryptographic Tunneling' : 'Panoramica VPN & Tunnel Crittografati')}
                                {selectedVpnMode === 'ipsec-tunnel' && 'IPsec Tunnel Mode (Gateway-to-Gateway)'}
                                {selectedVpnMode === 'ipsec-transport' && 'IPsec Transport Mode (Host-to-Host)'}
                                {selectedVpnMode === 'dtls' && 'DTLS (Datagram Transport Layer Security)'}
                              </h5>
                              <p className="text-xs text-slate-500 leading-relaxed">
                                {selectedVpnMode === 'vpn-overview' && (
                                  language === 'en'
                                    ? 'VPNs connect remote locations or telecommuters safely. Popular methods include OpenVPN, WireGuard, L2TP/IPsec, and SSL/TLS. Security depends on robust ciphers (AES/ChaCha) and establishing a cryptographic barrier over public lines.'
                                    : 'Le VPN collegano in sicurezza uffici divisi o utenti remoti. I software di riferimento (es. OpenVPN, WireGuard, IPsec) aprono una porta virtuale protetta (TUN/TAP). La solidità dipende dagli algoritmi scelti, ed è garantita introducendo un Kill Switch che stacca Internet se il tunnel cade.'
                                )}
                                {selectedVpnMode === 'ipsec-tunnel' && (
                                  language === 'en'
                                    ? 'In Tunnel Mode, IPsec encrypts the entire original IP packet (the original IP header and payload are both ciphered) and places it inside a completely new IP packet with a new Outer IP Header routing the packet between VPN gateways, making original locations completely hidden from passive analysis. Ideal for Site-to-Site WANs.'
                                    : 'In modalità Tunnel, IPsec cifra interamente il pacchetto IP originale (sia i dati sia l\'intestazione IP di origine). L\'intero pacchetto cifrato viene avvolto all\'interno di un nuovo pacchetto IP con una nuova intestazione (Outer IP Header) che indica i gateway di transito. Nasconde i nodi reali dagli sniffer. Standard per reti Site-to-Site WAN.'
                                )}
                                {selectedVpnMode === 'ipsec-transport' && (
                                  language === 'en'
                                    ? 'In Transport Mode, IPsec only encrypts the payload (TCP/UDP segment and data). The original IP header is kept in plaintext without any wrapper, meaning routing addresses are visible. It is optimized for Host-to-Host communication within already defined private environments, reducing header overhead.'
                                    : 'In modalità Trasporto, IPsec cifra esclusivamente il payload (i dati e i segmenti TCP/UDP), mantenendo l\'intestazione IP originale visibile e intatta. Poiché non c\'è un nuovo indirizzo IP di transito applicato a monte, riduce il peso dei pacchetti. È usato per comunicazioni dirette Host-to-Host in reti private predefinite.'
                                )}
                                {selectedVpnMode === 'dtls' && (
                                  language === 'en'
                                    ? 'DTLS mirrors the TLS engine but adapts it to secure light connectionless UDP transmissions. Standard TLS works over TCP and suffers when nesting TCP payload streams inside TCP tunnels (TCP Meltdown / severe packet loss delays). DTLS bypasses this, making VPN tunnels perform at maximum speed, perfect for audio streams.'
                                    : 'La sicurezza di TLS (lo stesso usufruito per HTTPS) incontra i flussi veloci UDP. TLS richiede TCP e soffre gravemente se si instradano flussi TCP all\'interno di tunnel TCP (frenando la linea per colli di bottiglia e latenze, "TCP Meltdown"). DTLS supera tutto questo, erogando massime performance per VPN ad alto traffico.'
                                )}
                              </p>
                            </div>

                            {/* Packet visualizer grid */}
                            <div className="space-y-2 shrink-0">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
                                {language === 'en' ? 'Packet Frame Structure Visualizer' : 'Visualizzatore del Pacchetto e dei Suoi Strati'}
                              </span>

                              {selectedVpnMode === 'vpn-overview' && (
                                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2 font-mono text-[10px]">
                                  <div className="text-slate-500 font-bold uppercase pb-1 border-b">Standard Plaintext TCP/IP packet</div>
                                  <div className="flex text-center border overflow-hidden rounded-lg font-bold">
                                    <div className="w-1/4 bg-slate-100 text-slate-500 border-r py-2">Outer IP</div>
                                    <div className="w-1/4 bg-slate-100 text-slate-500 border-r py-2">TCP (L4)</div>
                                    <div className="w-2/4 bg-red-100 text-red-700 py-2 animate-pulse">Application Payload (Plaintext, EXPOSED!)</div>
                                  </div>
                                </div>
                              )}

                              {selectedVpnMode === 'ipsec-tunnel' && (
                                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2 font-mono text-[10px]">
                                  <div className="text-emerald-700 font-bold uppercase pb-1 border-b">IPsec Tunnel Mode (Site-to-Site Encapsulated)</div>
                                  <div className="flex text-center border overflow-hidden rounded-lg font-bold">
                                    <div className="w-1/5 bg-emerald-600 text-white border-r py-2">New IP Header</div>
                                    <div className="w-1/5 bg-indigo-600 text-white border-r py-2">ESP Header (L3)</div>
                                    <div className="w-3/5 bg-emerald-100 border-dashed border-2 border-emerald-400 text-emerald-800 py-2 flex flex-col justify-center">
                                      <span>[ENCRYPTED Original IP Header]</span>
                                      <span className="text-[9px] opacity-80">[ENCRYPTED Payload &amp; TCP]</span>
                                    </div>
                                    <div className="w-1/10 bg-indigo-600 text-white py-2 shrink-0">ESP Authentication Trailer</div>
                                  </div>
                                </div>
                              )}

                              {selectedVpnMode === 'ipsec-transport' && (
                                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2 font-mono text-[10px]">
                                  <div className="text-amber-700 font-bold uppercase pb-1 border-b">IPsec Transport Mode (Payload Secure)</div>
                                  <div className="flex text-center border overflow-hidden rounded-lg font-bold">
                                    <div className="w-1/4 bg-slate-200 text-slate-600 border-r py-2">Original IP Header (VISIBLE)</div>
                                    <div className="w-1/4 bg-indigo-600 text-white border-r py-2">ESP Header</div>
                                    <div className="w-2/4 bg-emerald-100 border-dashed border-2 border-emerald-400 text-emerald-800 py-2">[ENCRYPTED Payload &amp; TCP/UDP Layers]</div>
                                    <div className="w-1/12 bg-indigo-600 text-white py-2 shrink-0">ESP Trailer</div>
                                  </div>
                                </div>
                              )}

                              {selectedVpnMode === 'dtls' && (
                                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2 font-mono text-[10px]">
                                  <div className="text-purple-700 font-bold uppercase pb-1 border-b">DTLS Secure Datagram Format</div>
                                  <div className="flex text-center border overflow-hidden rounded-lg font-bold">
                                    <div className="w-1/5 bg-slate-200 text-slate-600 border-r py-2">IP</div>
                                    <div className="w-1/5 bg-amber-500 text-white border-r py-2">UDP (L4 datagram)</div>
                                    <div className="w-1/5 bg-indigo-600 text-white border-r py-2">DTLS Header</div>
                                    <div className="w-2/5 bg-emerald-100 border-dashed border-2 border-emerald-400 text-emerald-800 py-2">[ENCRYPTED Secure Data]</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* Interactive Port Trainer / Game Tab */
                <div className="flex-1 p-6 flex flex-col justify-center max-w-2xl mx-auto w-full">
                  <AnimatePresence mode="wait">
                    {trainerMode === 'selection' ? (
                      <motion.div
                        key="selection"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-6"
                      >
                        <div className="text-center space-y-2">
                          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                            {language === 'en' ? 'Networking Study & Training' : 'Studio & Addestramento di Rete'}
                          </h3>
                          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                            {language === 'en'
                              ? 'Reinforce your knowledge of ports, standard connection layers, security configurations and protocols with our interactive training tools.'
                              : 'Rafforza la tua conoscenza delle porte, dei tipi di trasporto, delle impostazioni di sicurezza e dei protocolli con i nostri strumenti interattivi.'}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Card 1: Port Quiz Challenge */}
                          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-150 transition-all flex flex-col justify-between space-y-4">
                            <div className="space-y-3">
                              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                                <Trophy className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="font-extrabold text-slate-800 text-sm">
                                  {language === 'en' ? 'Port Association Quiz' : 'Quiz sulle Associazioni'}
                                </h4>
                                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                                  {language === 'en'
                                    ? 'A rapid 5-question challenge mapping services to their standard connection ports.'
                                    : 'Una sfida veloce di 5 domande per collegare i servizi alle rispettive porte numeriche.'}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={startNewGame}
                              className="w-full py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow hover:bg-indigo-700 transition flex items-center justify-center gap-1.5"
                            >
                              <PlayCircle className="w-4 h-4" />
                              {language === 'en' ? 'Start Quiz Challenge' : 'Avvia Quiz'}
                            </button>
                          </div>

                          {/* Card 2: Interactive Study Flashcards */}
                          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-150 transition-all flex flex-col justify-between space-y-4">
                            <div className="space-y-3">
                              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                                <Layers className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="font-extrabold text-slate-800 text-sm">
                                  {language === 'en' ? 'Interactive Study Flashcards' : 'Flashcard di Studio Interattive'}
                                </h4>
                                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                                  {language === 'en'
                                    ? 'Review every system port item individually. Click to flip cards and check connection types and safety alerts.'
                                    : 'Ripassa ogni singola porta di rete. Clicca per girarla e vederne protocollo, trasporto e sicurezza.'}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={startFlashcards}
                              className="w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow hover:bg-emerald-700 transition flex items-center justify-center gap-1.5"
                            >
                              <Layers className="w-4 h-4" />
                              {language === 'en' ? 'Practice Flashcards' : 'Pratica le Flashcard'}
                            </button>
                          </div>
                        </div>

                        <div className="text-center font-mono text-[10px] text-indigo-500/80 uppercase font-bold tracking-wider">
                          {language === 'en' ? `${PORT_REGISTRY.length} registered study targets verified` : `${PORT_REGISTRY.length} porte registrate caricate nel database`}
                        </div>
                      </motion.div>
                    ) : trainerMode === 'quiz' ? (
                      /* Active Quiz Screen */
                      <motion.div
                        key="quiz-mode"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full"
                      >
                        {gameState === 'playing' ? (
                          <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
                            {/* Game Status Header */}
                            <div className="flex justify-between items-center text-xs pb-4 border-b border-slate-100">
                              <span className="font-bold text-slate-400 uppercase tracking-wider">
                                {language === 'en' ? `Challenge ${currentQuestionIdx + 1} of 5` : `Sfida ${currentQuestionIdx + 1} di 5`}
                              </span>
                              <span className="px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold rounded-full">
                                {language === 'en' ? `Score: ${gameScore}/5` : `Punti: ${gameScore}/5`}
                              </span>
                            </div>

                            {/* Trivia Question card */}
                            <div className="text-center space-y-3">
                              <span className="inline-block px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                                {language === 'en' ? 'Determine Target Port' : 'Individua la Porta Target'}
                              </span>
                              <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                                {language === 'en' ? 'Which port corresponds to:' : 'Quale porta corrisponde al servizio:'}
                              </h4>
                              <div className="text-3xl font-black text-indigo-600 bg-indigo-50/50 py-4 px-6 rounded-2xl max-w-xs mx-auto border border-indigo-100 shadow-inner">
                                {gameQuestions[currentQuestionIdx]?.service}
                              </div>
                            </div>

                            {/* Port Options Buttons Grid */}
                            <div className="grid grid-cols-2 gap-3 pt-3">
                              {gameQuestions[currentQuestionIdx]?.options.map((option, idx) => {
                                const isCorrect = option === gameQuestions[currentQuestionIdx].port;
                                const isSelected = option === selectedAnswer;
                                
                                let btnStyle = "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300";
                                
                                if (answerEvaluated) {
                                  if (isCorrect) {
                                    btnStyle = "bg-emerald-500 border-emerald-600 text-white shadow-md shadow-emerald-100";
                                  } else if (isSelected) {
                                    btnStyle = "bg-rose-500 border-rose-600 text-white shadow-md shadow-rose-100";
                                  } else {
                                    btnStyle = "bg-slate-50 border-slate-100 text-slate-300 pointer-events-none opacity-40";
                                  }
                                }

                                return (
                                  <button
                                    key={idx}
                                    disabled={answerEvaluated}
                                    onClick={() => handleSelectAnswer(option)}
                                    className={`py-4 px-6 border rounded-2xl font-mono text-lg font-black transition-all ${btnStyle}`}
                                  >
                                    {option}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Feedback Banner and Control */}
                            {answerEvaluated && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100"
                              >
                                <span className="text-xs font-semibold text-indigo-900">
                                  {selectedAnswer === gameQuestions[currentQuestionIdx].port ? (
                                    <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                      {language === 'en' ? 'Correct! Strong transmission verified.' : 'Corretto! Trasmissione validata.'}
                                    </span>
                                  ) : (
                                    <span className="text-rose-700 font-bold flex items-center gap-1.5 align-middle">
                                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                                      {language === 'en' 
                                        ? `Incorrect. Correct port was ${gameQuestions[currentQuestionIdx].port}.` 
                                        : `Sbagliato. La porta esatta era ${gameQuestions[currentQuestionIdx].port}.`}
                                    </span>
                                  )}
                                </span>

                                <div className="flex gap-2 w-full sm:w-auto">
                                  <button
                                    onClick={handleNextQuestion}
                                    className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold uppercase rounded-xl shadow hover:bg-indigo-700 transition"
                                  >
                                    {currentQuestionIdx === gameQuestions.length - 1 
                                      ? (language === 'en' ? 'See overall score' : 'Vedi punteggio finale') 
                                      : (language === 'en' ? 'Next Protocol' : 'Prossimo Protocollo')}
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        ) : (
                          /* End Game Results screen */
                          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-6 text-center">
                            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto shadow-inner relative">
                              <Trophy className="w-10 h-10 text-amber-500" />
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
                                className="absolute inset-0 rounded-full border border-dashed border-amber-300"
                              />
                            </div>

                            <div className="space-y-1">
                              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                                {language === 'en' ? 'Training session completed!' : 'Sessione completata!'}
                              </h3>
                              <p className="text-slate-500 text-sm">
                                {language === 'en' ? 'Heres your certification scorecard:' : 'Ecco la scheda di valutazione del tuo addestramento:'}
                              </p>
                            </div>

                            {/* Final score display */}
                            <div className="bg-slate-50 py-4 px-6 rounded-2xl max-w-sm mx-auto border border-slate-100 flex justify-around items-center divide-x divide-slate-200">
                              <div>
                                <span className="block text-[10px] uppercase font-bold text-slate-400">{language === 'en' ? 'Correct answers' : 'Risposte esatte'}</span>
                                <span className="text-2xl font-black text-slate-800">{gameScore} / 5</span>
                              </div>
                              <div className="pl-6 text-left">
                                <span className="block text-[10px] uppercase font-bold text-slate-400">{language === 'en' ? 'Precision Rate' : 'Precisione'}</span>
                                <span className="text-2xl font-black text-indigo-600">{(gameScore/5)*100}%</span>
                              </div>
                            </div>

                            <p className="text-xs text-slate-400 italic max-w-sm mx-auto">
                              {gameScore === 5 
                                ? (language === 'en' ? 'Spectacular! All core systems are protected completely. Level: Ports Architect.' : 'Spettacolare! Tutte le difese e le porte sono presidiate. Livello: Architetto delle Porte.')
                                : gameScore >= 3
                                ? (language === 'en' ? 'Good performance. Some minor database or SSH configuration gaps exist. Keep practicing!' : 'Buona performance. Qualche svista su database o SSH, continua ad allenarti!')
                                : (language === 'en' ? 'Warning: Open ports detected. System is vulnerable to mapping. Try to review the Registry tab!' : 'Allerta: Rilevate troppe porte aperte. Il sistema è esposto a violazioni. Rivedi il Dizionario!')}
                            </p>

                            <div className="flex gap-3 justify-center pt-3">
                              <button
                                onClick={() => startNewGame()}
                                className="px-5 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
                              >
                                <RefreshCw className="w-4 h-4" />
                                {language === 'en' ? 'Replay Quiz' : 'Allenati di nuovo'}
                              </button>
                              <button
                                onClick={() => setTrainerMode('selection')}
                                className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all"
                              >
                                {language === 'en' ? 'Change Game Mode' : 'Cambia Gioco'}
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      /* Flashcards Mode Screen */
                      <motion.div
                        key="flashcards-mode"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-6 w-full"
                      >
                        {/* Status bar */}
                        <div className="flex justify-between items-center text-xs pb-4 border-b border-slate-100">
                          <span className="font-bold text-slate-400 uppercase tracking-wider font-mono">
                            {language === 'en'
                              ? `Flashcard ${currentFlashcardIdx + 1} of ${flashcardsList.length}`
                              : `Flashcard ${currentFlashcardIdx + 1} di ${flashcardsList.length}`}
                          </span>
                          <button
                            onClick={() => {
                              const shuffled = [...PORT_REGISTRY].sort(() => 0.5 - Math.random());
                              setFlashcardsList(shuffled);
                              setCurrentFlashcardIdx(0);
                              setIsFlipped(false);
                            }}
                            className="text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-all"
                          >
                            <RefreshCw className="w-3.5 h-3.5 animate-spin-hover" />
                            <span className="text-[10px] font-bold uppercase tracking-wide font-mono">
                              {language === 'en' ? 'Shuffle Deck' : 'Mischia'}
                            </span>
                          </button>
                        </div>

                        {/* Interactive Flip Card Component */}
                        <div 
                          onClick={() => setIsFlipped(prev => !prev)}
                          className="min-h-[290px] cursor-pointer relative group active:scale-[0.99] transition-transform duration-150 select-none"
                        >
                          <AnimatePresence mode="wait">
                            {!isFlipped ? (
                              /* Front Side */
                              <motion.div
                                key="front"
                                initial={{ rotateY: -90, opacity: 0 }}
                                animate={{ rotateY: 0, opacity: 1 }}
                                exit={{ rotateY: 90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl p-8 flex flex-col justify-between text-white shadow-xl shadow-indigo-100/40 min-h-[290px]"
                              >
                                <div className="flex justify-between items-start">
                                  <span className="font-black text-xs uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full text-indigo-100 font-mono">
                                    {(flashcardsList[currentFlashcardIdx]?.range || 'well-known').toUpperCase()}
                                  </span>
                                  <span className="text-white/40 text-xs font-mono font-bold uppercase">
                                    {language === 'en' ? 'Front Side' : 'Fronte'}
                                  </span>
                                </div>

                                <div className="text-center py-4 space-y-1">
                                  <div className="text-6xl font-black font-mono tracking-tight select-all">
                                    {flashcardsList[currentFlashcardIdx]?.port}
                                  </div>
                                  <div className="text-indigo-200 text-xs uppercase font-extrabold tracking-widest leading-loose">
                                    {language === 'en' ? 'Protocol Service' : 'Servizio di Rete'}
                                  </div>
                                </div>

                                <div className="text-center text-[10px] text-indigo-200 uppercase font-black tracking-widest bg-indigo-800/20 py-1 rounded-lg">
                                  {language === 'en' ? 'Click / Tap to reveal details' : 'Clicca / Tocca per girare'}
                                </div>
                              </motion.div>
                            ) : (
                              /* Back Side */
                              <motion.div
                                key="back"
                                initial={{ rotateY: 90, opacity: 0 }}
                                animate={{ rotateY: 0, opacity: 1 }}
                                exit={{ rotateY: -90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="absolute inset-0 bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-xl min-h-[290px]"
                              >
                                <div className="space-y-3">
                                  <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                                    <span className="flex items-center gap-1.5">
                                      <span className="px-2.5 py-1 bg-indigo-600 text-white font-mono font-black text-xs rounded-lg select-all">
                                        Port {flashcardsList[currentFlashcardIdx]?.port}
                                      </span>
                                      <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono text-[10px] uppercase font-bold rounded-lg">
                                        {flashcardsList[currentFlashcardIdx]?.type}
                                      </span>
                                    </span>
                                    
                                    <span className="flex items-center gap-1">
                                      {flashcardsList[currentFlashcardIdx]?.isSecure ? (
                                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg uppercase">
                                          {language === 'en' ? 'Secure' : 'Sicuro'}
                                        </span>
                                      ) : (
                                        <span className="text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg uppercase">
                                          {language === 'en' ? 'Insecure' : 'Insicuro'}
                                        </span>
                                      )}
                                    </span>
                                  </div>

                                  <div className="space-y-2 text-left">
                                    <div>
                                      <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                                        {language === 'en' ? 'Service Name' : 'Nome Servizio'}
                                      </h4>
                                      <p className="text-xs font-black text-slate-800 leading-tight">
                                        {flashcardsList[currentFlashcardIdx]?.service} &bull; <span className="text-slate-400 text-[11px] font-medium font-sans">{flashcardsList[currentFlashcardIdx]?.name}</span>
                                      </p>
                                    </div>

                                    <div>
                                      <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                                        {language === 'en' ? 'Base Description' : 'Descrizione di Base'}
                                      </h4>
                                      <p className="text-[11px] text-slate-600 leading-normal font-semibold">
                                        {flashcardsList[currentFlashcardIdx]?.description[language]}
                                      </p>
                                    </div>

                                    <div className="bg-slate-50 border border-slate-150 p-2 rounded-xl flex items-start gap-1.5">
                                      {flashcardsList[currentFlashcardIdx]?.isSecure ? (
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                      ) : (
                                        <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                      )}
                                      <div className="text-[9.5px] leading-tight text-left">
                                        <strong className="text-slate-400 uppercase tracking-wider block mb-0.5">
                                          {language === 'en' ? 'Security Review' : 'Sicurezza'}
                                        </strong>
                                        <p className="text-slate-600 font-medium">
                                          {flashcardsList[currentFlashcardIdx]?.security[language]}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="text-center text-[9px] text-slate-300 font-bold uppercase tracking-widest mt-2 border-t border-slate-50 pt-1.5">
                                  {language === 'en' ? 'Click / Tap card to flip back' : 'Clicca / Tocca per girare di nuovo'}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Navigation controls */}
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            disabled={currentFlashcardIdx === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentFlashcardIdx(prev => prev - 1);
                              setIsFlipped(false);
                            }}
                            className="py-2.5 px-3 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 disabled:opacity-40 disabled:pointer-events-none text-xs font-black uppercase rounded-xl transition flex items-center justify-center gap-1"
                          >
                            &larr; <span className="hidden sm:inline">{language === 'en' ? 'Prev' : 'Prec'}</span>
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsFlipped(prev => !prev);
                            }}
                            className="py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black uppercase rounded-xl transition"
                          >
                            {language === 'en' ? 'Flip' : 'Gira'}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (currentFlashcardIdx < flashcardsList.length - 1) {
                                setCurrentFlashcardIdx(prev => prev + 1);
                              } else {
                                setCurrentFlashcardIdx(0); // wrap
                              }
                              setIsFlipped(false);
                            }}
                            className="py-2.5 px-3 bg-slate-900 text-white hover:bg-slate-800 text-xs font-black uppercase rounded-xl transition flex items-center justify-center gap-1"
                          >
                            <span className="hidden sm:inline">{language === 'en' ? 'Next' : 'Socc'}</span> &rarr;
                          </button>
                        </div>

                        {/* Back home control */}
                        <div className="text-center pt-2">
                          <button
                            onClick={() => setTrainerMode('selection')}
                            className="text-xs text-slate-400 hover:text-slate-600 underline font-semibold transition"
                          >
                            {language === 'en' ? 'Back to Selection Menu' : 'Torna al Menu Principale'}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 text-center bg-slate-50/30">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {language === 'en' ? 'IANA Bandwidth Classification • Standard Protocol Mappings' : 'Classificazione Bande IANA • Monitor di Sicurezza Standard'}
              </p>
            </div>
    </>
  );
}

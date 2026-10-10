import type { ProtocolInfo } from './portsExplorerTypes';

export const PROTOCOL_REGISTRY: ProtocolInfo[] = [
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
      en: 'Translates human-readable hostnames (such as example.com) into IP addresses used to reach network services.',
      it: 'Traduce i nomi di host facili da ricordare (come example.com) in indirizzi IP numerici.'
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
      en: 'SSHv1 is obsolete and must not be enabled. Require SSHv2 with modern host keys, key exchange and ciphers; restrict management sources and prefer key-based or centralized authentication.',
      it: 'SSHv1 è obsoleto e non deve essere abilitato. Richiedere SSHv2 con host key, scambio chiavi e cifrari moderni; limitare le sorgenti di gestione e preferire autenticazione a chiave o centralizzata.'
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
      en: 'Plaintext without transport protection. STARTTLS protects data in transit; SPF, DKIM and DMARC help authenticate sending domains but do not eliminate phishing.',
      it: 'Senza protezione del trasporto opera in chiaro. STARTTLS protegge i dati in transito; SPF, DKIM e DMARC aiutano ad autenticare i domini mittenti, ma non eliminano il phishing.'
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
      en: 'SNMPv1 and SNMPv2c expose community strings without encryption. SNMPv3 supports authentication and, with the authPriv security level, encryption.',
      it: 'SNMPv1 e SNMPv2c espongono le community string senza cifratura. SNMPv3 supporta l’autenticazione e, con il livello di sicurezza authPriv, anche la cifratura.'
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
      en: 'Real-time media, online gaming, DNS queries, and NTP synchronization.',
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
      en: 'Resolves IPv4 addresses to Layer 2 MAC addresses on the local broadcast domain.',
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

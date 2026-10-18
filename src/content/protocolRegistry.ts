import type { ProtocolInfo } from './portsExplorerTypes';

export const PROTOCOL_REGISTRY: ProtocolInfo[] = [
  {
    name: 'HTTP / HTTPS',
    fullName: 'Hypertext Transfer Protocol (Secure)',
    layer: 7,
    type: 'Application',
    description: {
      it: 'HTTP definisce richieste e risposte tra client e server web; HTTPS protegge lo scambio con TLS.',
      en: 'HTTP defines requests and responses between web clients and servers; HTTPS protects the exchange with TLS.'
    },
    useCase: {
      it: 'Accesso a pagine web, caricamento di contenuti multimediali e chiamate ad API REST.',
      en: 'Accessing web pages, loading media content and calling REST APIs.'
    },
    security: {
      it: 'HTTP non cifra i dati. HTTPS usa TLS per proteggere il collegamento: verificare certificati e nomi del server. SSL è obsoleto; la cifratura non rende affidabile il sito.',
      en: 'HTTP does not encrypt data. HTTPS uses TLS to protect the connection: validate certificates and server names. SSL is obsolete; encryption does not make a site trustworthy.'
    },
    isSecure: true
  },
  {
    name: 'DNS',
    fullName: 'Domain Name System',
    layer: 7,
    type: 'Application',
    description: {
      it: 'Sistema distribuito che associa nomi come example.com a record, inclusi indirizzi IP e server di posta.',
      en: 'A distributed system that maps names such as example.com to records, including IP addresses and mail servers.'
    },
    useCase: {
      it: 'Risoluzione dei nomi prima di contattare servizi web, di posta o altri servizi di rete.',
      en: 'Resolving names before contacting web, mail or other network services.'
    },
    security: {
      it: 'DNSSEC autentica origine e integrità dei dati DNS firmati, ma non cifra le query. La validazione richiede una catena di fiducia; non garantisce che il servizio risolto sia sicuro.',
      en: 'DNSSEC authenticates the origin and integrity of signed DNS data but does not encrypt queries. Validation requires a chain of trust; it does not guarantee that the resolved service is safe.'
    },
    isSecure: false
  },
  {
    name: 'SSH',
    fullName: 'Secure Shell',
    layer: 7,
    type: 'Application',
    description: {
      it: 'Consente sessioni di terminale cifrate e accesso amministrativo remoto autenticato.',
      en: 'Enables encrypted terminal sessions and authenticated remote administrative access.'
    },
    useCase: {
      it: 'Amministrazione di server Linux, esecuzione remota di script e trasferimenti SFTP.',
      en: 'Administering Linux servers, running remote scripts and transferring files with SFTP.'
    },
    security: {
      it: 'SSHv1 è obsoleto. Usare SSHv2 con algoritmi moderni, verificare la chiave del server e limitare le sorgenti di gestione; preferire autenticazione a chiave o centralizzata.',
      en: 'SSHv1 is obsolete. Use SSHv2 with modern algorithms, verify the server key and restrict management sources; prefer key-based or centralized authentication.'
    },
    isSecure: true
  },
  {
    name: 'SMTP',
    fullName: 'Simple Mail Transfer Protocol',
    layer: 7,
    type: 'Application',
    description: {
      it: 'Trasporta messaggi di posta tra server e supporta la sottomissione dei messaggi dai client.',
      en: 'Transports mail between servers and supports message submission from clients.'
    },
    useCase: {
      it: 'Invio dal client al servizio di posta e inoltro dal server mittente al server destinatario.',
      en: 'Submitting mail from a client to its mail service and relaying it from the sending server to the receiving server.'
    },
    security: {
      it: 'STARTTLS protegge il collegamento se negoziato e verificato; la modalità opportunistica non garantisce cifratura. SPF, DKIM e DMARC autenticano domini, non rendono innocuo il contenuto.',
      en: 'STARTTLS protects the connection when negotiated and verified; opportunistic mode does not guarantee encryption. SPF, DKIM and DMARC authenticate domains, not the safety of the content.'
    },
    isSecure: false
  },
  {
    name: 'SNMP',
    fullName: 'Simple Network Management Protocol',
    layer: 7,
    type: 'Application',
    description: {
      it: 'Protocollo per monitorare e gestire dispositivi su reti IP.',
      en: 'A protocol for monitoring and managing devices on IP networks.'
    },
    useCase: {
      it: 'Lettura di contatori e stato delle interfacce, gestione autorizzata e ricezione di notifiche.',
      en: 'Reading counters and interface status, performing authorized management and receiving notifications.'
    },
    security: {
      it: 'SNMPv1 e SNMPv2c trasmettono le community string senza cifratura. SNMPv3 offre diversi livelli: authPriv combina autenticazione e cifratura; limitare comunque gli accessi di gestione.',
      en: 'SNMPv1 and SNMPv2c send community strings without encryption. SNMPv3 offers different levels: authPriv combines authentication and encryption; management access still needs restriction.'
    },
    isSecure: false
  },
  {
    name: 'TCP',
    fullName: 'Transmission Control Protocol',
    layer: 4,
    type: 'Transport',
    description: {
      it: 'Trasporto orientato alla connessione che offre un flusso di byte affidabile e ordinato, con ritrasmissioni. Non conserva i confini dei messaggi e non garantisce il successo se la connessione si interrompe.',
      en: 'Connection-oriented transport providing a reliable, ordered byte stream with retransmissions. It does not preserve message boundaries or guarantee success if the connection fails.'
    },
    useCase: {
      it: 'Trasporto per HTTP/1.1 e HTTP/2, FTP, posta e molti servizi di database; HTTP/3 usa invece QUIC su UDP.',
      en: 'Transport for HTTP/1.1 and HTTP/2, FTP, mail and many database services; HTTP/3 instead uses QUIC over UDP.'
    },
    security: {
      it: 'Non offre cifratura nativa. Proteggere i dati sensibili, ad esempio con TLS, e mitigare i SYN flood che possono esaurire lo stato delle connessioni.',
      en: 'It provides no native encryption. Protect sensitive data, for example with TLS, and mitigate SYN floods that can exhaust connection state.'
    },
    isSecure: false
  },
  {
    name: 'UDP',
    fullName: 'User Datagram Protocol',
    layer: 4,
    type: 'Transport',
    description: {
      it: 'Trasporto a datagrammi senza connessione: non fornisce consegna, ordine o ritrasmissione garantiti. Le applicazioni possono aggiungere queste funzioni; la bassa latenza non è garantita.',
      en: 'Connectionless datagram transport: it does not guarantee delivery, ordering or retransmission. Applications can add these functions; low latency is not guaranteed.'
    },
    useCase: {
      it: 'Media in tempo reale, giochi online, query DNS, sincronizzazione NTP e trasporto QUIC.',
      en: 'Real-time media, online gaming, DNS queries, NTP synchronization and QUIC transport.'
    },
    security: {
      it: 'Non autentica l’IP sorgente. Servizi esposti possono essere abusati per riflessione e amplificazione DDoS; applicare controlli anti-spoofing e limitare i servizi accessibili.',
      en: 'It does not authenticate the source IP. Exposed services can be abused for DDoS reflection and amplification; apply anti-spoofing controls and restrict accessible services.'
    },
    isSecure: false
  },
  {
    name: 'IP (IPv4 / IPv6)',
    fullName: 'Internet Protocol',
    layer: 3,
    type: 'Network',
    description: {
      it: 'Fornisce indirizzamento e consegna best-effort di pacchetti tra reti; non garantisce consegna o ordine.',
      en: 'Provides addressing and best-effort packet delivery across networks; it does not guarantee delivery or order.'
    },
    useCase: {
      it: 'Indirizzamento delle interfacce e inoltro dei pacchetti attraverso router verso altre reti.',
      en: 'Addressing interfaces and forwarding packets through routers to other networks.'
    },
    security: {
      it: 'Gli indirizzi sorgente possono essere falsificati. IPsec può proteggere il traffico IP: autenticazione e cifratura dipendono dai protocolli e dagli algoritmi configurati.',
      en: 'Source addresses can be forged. IPsec can protect IP traffic: authentication and encryption depend on the configured protocols and algorithms.'
    },
    isSecure: false
  },
  {
    name: 'ICMP',
    fullName: 'Internet Control Message Protocol',
    layer: 3,
    type: 'Network',
    description: {
      it: 'Segnala errori e informazioni di controllo per IP; ICMPv6 supporta anche funzioni essenziali di IPv6.',
      en: 'Reports errors and control information for IP; ICMPv6 also supports essential IPv6 functions.'
    },
    useCase: {
      it: 'Diagnostica con ping e risposte usate da traceroute; segnalazione di errori e della necessità di ridurre la dimensione dei pacchetti.',
      en: 'Diagnostics with ping and responses used by traceroute; reporting errors and the need to reduce packet size.'
    },
    security: {
      it: 'Filtrare per tipo e contesto e limitare gli abusi, senza bloccare tutto ICMP. Bloccare messaggi necessari può interrompere la scoperta della MTU del percorso e funzioni IPv6.',
      en: 'Filter by type and context and limit abuse without blocking all ICMP. Blocking required messages can break path MTU discovery and IPv6 functions.'
    },
    isSecure: false
  },
  {
    name: 'ARP',
    fullName: 'Address Resolution Protocol',
    layer: 2,
    type: 'Data Link',
    description: {
      it: 'Associa un indirizzo IPv4 all’indirizzo MAC del prossimo hop sul collegamento locale. IPv6 usa Neighbor Discovery.',
      en: 'Maps an IPv4 address to the next hop’s MAC address on the local link. IPv6 uses Neighbor Discovery.'
    },
    useCase: {
      it: 'Individuazione del MAC del vicino per destinazioni locali o del gateway per destinazioni remote, nello stesso dominio broadcast.',
      en: 'Finding the neighbor’s MAC for local destinations or the gateway’s MAC for remote destinations within the same broadcast domain.'
    },
    security: {
      it: 'Non autentica le risposte. ARP poisoning può deviare il traffico verso un attaccante; DAI, con binding attendibili, aiuta a rilevare e bloccare associazioni false.',
      en: 'It does not authenticate replies. ARP poisoning can redirect traffic to an attacker; DAI with trusted bindings helps detect and block false mappings.'
    },
    isSecure: false
  },
  {
    name: 'FTP',
    fullName: 'File Transfer Protocol',
    layer: 7,
    type: 'Application',
    description: {
      it: 'Trasferisce file tra client e server con connessioni separate per controllo e dati.',
      en: 'Transfers files between clients and servers using separate control and data connections.'
    },
    useCase: {
      it: 'Scambio di file e integrazione con sistemi legacy che richiedono questo protocollo.',
      en: 'Exchanging files and integrating with legacy systems that require this protocol.'
    },
    security: {
      it: 'FTP senza protezione trasmette credenziali e dati in chiaro. Preferire SFTP, basato su SSH, oppure FTPS, che protegge FTP con TLS.',
      en: 'Unprotected FTP sends credentials and data in plaintext. Prefer SFTP, based on SSH, or FTPS, which protects FTP with TLS.'
    },
    isSecure: false
  },
  {
    name: 'TFTP',
    fullName: 'Trivial File Transfer Protocol',
    layer: 7,
    type: 'Application',
    description: {
      it: 'Trasferisce file su UDP senza connessione: nel protocollo base il client invia la richiesta al server in unicast, non in broadcast.',
      en: 'Transfers files over connectionless UDP: in the base protocol the client sends its request to the server using unicast, not broadcast.'
    },
    useCase: {
      it: 'Avvio di sistemi senza disco o trasferimento di firmware e configurazioni in una rete di gestione controllata.',
      en: 'Booting diskless systems or transferring firmware and configuration files in a controlled management network.'
    },
    security: {
      it: 'Non offre autenticazione o cifratura. Limitare sorgenti, destinazioni e file accessibili; non esporlo a reti non fidate.',
      en: 'It provides no authentication or encryption. Restrict sources, destinations and accessible files; do not expose it to untrusted networks.'
    },
    isSecure: false
  },
  {
    name: 'DHCP',
    fullName: 'Dynamic Host Configuration Protocol',
    layer: 7,
    type: 'Application',
    description: {
      it: 'DHCP per IPv4 assegna ai client indirizzo IP, subnet mask e opzioni come gateway e DNS; DHCPv6 ha un funzionamento distinto.',
      en: 'DHCP for IPv4 assigns clients an IP address, subnet mask and options such as gateway and DNS; DHCPv6 operates differently.'
    },
    useCase: {
      it: 'Configurazione automatica dei client in reti domestiche e aziendali, anche tramite relay tra sottoreti.',
      en: 'Automatically configuring clients in home and enterprise networks, including through relays between subnets.'
    },
    security: {
      it: 'Server DHCP non autorizzati e starvation possono alterare o esaurire le assegnazioni. DHCP Snooping e limiti di frequenza sulle porte non fidate aiutano a contenerli.',
      en: 'Unauthorized DHCP servers and starvation can alter or exhaust address assignments. DHCP Snooping and rate limits on untrusted ports help contain them.'
    },
    isSecure: false
  },
  {
    name: 'LDAP',
    fullName: 'Lightweight Directory Access Protocol',
    layer: 7,
    type: 'Application',
    description: {
      it: 'Permette di consultare e modificare servizi di directory, ad esempio utenti, gruppi e risorse.',
      en: 'Supports querying and modifying directory services, such as users, groups and resources.'
    },
    useCase: {
      it: 'Ricerca di identità e gruppi in una directory come Active Directory; LDAP non è di per sé un protocollo di Single Sign-On.',
      en: 'Looking up identities and groups in a directory such as Active Directory; LDAP is not itself a Single Sign-On protocol.'
    },
    security: {
      it: 'Proteggere le sessioni con TLS, tramite LDAPS o StartTLS, verificando il certificato del server. Non inviare password con simple bind su un collegamento non protetto.',
      en: 'Protect sessions with TLS, through LDAPS or StartTLS, and validate the server certificate. Do not send passwords using simple bind over an unprotected connection.'
    },
    isSecure: false
  },
  {
    name: 'IMAP & POP3',
    fullName: 'Internet Message Access Protocol / Post Office Protocol Version 3',
    layer: 7,
    type: 'Application',
    description: {
      it: 'IMAP gestisce messaggi e cartelle sul server; POP3 consente di recuperare messaggi, con gestione della casella più limitata.',
      en: 'IMAP manages messages and folders on the server; POP3 retrieves messages with more limited mailbox management.'
    },
    useCase: {
      it: 'Accesso alla posta dai client: IMAP sincronizza stato e cartelle; POP3 viene usato soprattutto per scaricare i messaggi.',
      en: 'Mail access from clients: IMAP synchronizes state and folders; POP3 is mainly used to download messages.'
    },
    security: {
      it: 'Senza TLS, credenziali e messaggi possono essere esposti. Richiedere TLS con certificati validati, ad esempio con IMAPS e POP3S; non usare SSL obsoleto.',
      en: 'Without TLS, credentials and messages may be exposed. Require TLS with validated certificates, for example with IMAPS and POP3S; do not use obsolete SSL.'
    },
    isSecure: false
  },
  {
    name: 'TLS / SSL',
    fullName: 'Transport Layer Security / Secure Sockets Layer',
    layer: 6,
    type: 'Presentation',
    description: {
      it: 'TLS protegge la comunicazione tra i suoi endpoint con riservatezza, integrità e autenticazione. La collocazione al livello OSI 6 è una semplificazione didattica, non uno stack reale.',
      en: 'TLS protects communication between its endpoints with confidentiality, integrity and authentication. Its placement at OSI layer 6 is a teaching simplification, not a real protocol stack.'
    },
    useCase: {
      it: 'Protezione di HTTP come HTTPS, IMAP come IMAPS e LDAP tramite LDAPS o StartTLS.',
      en: 'Protecting HTTP as HTTPS, IMAP as IMAPS and LDAP through LDAPS or StartTLS.'
    },
    security: {
      it: 'SSL e TLS 1.0/1.1 sono obsoleti. Usare TLS 1.2 o TLS 1.3 con configurazioni moderne e verifica dell’identità del peer; la protezione termina dove termina TLS.',
      en: 'SSL and TLS 1.0/1.1 are obsolete. Use TLS 1.2 or TLS 1.3 with modern configurations and peer identity validation; protection ends where TLS terminates.'
    },
    isSecure: true
  },
  {
    name: 'BGP',
    fullName: 'Border Gateway Protocol',
    layer: 7,
    type: 'Application',
    description: {
      it: 'Scambia informazioni di raggiungibilità e attributi di percorso tra sistemi autonomi e al loro interno; usa TCP.',
      en: 'Exchanges reachability information and path attributes between and within autonomous systems; it uses TCP.'
    },
    useCase: {
      it: 'Selezione di percorsi secondo policy per interconnessioni Internet, operatori e reti aziendali.',
      en: 'Selecting paths according to policy for Internet interconnections, providers and enterprise networks.'
    },
    security: {
      it: 'RPKI con validazione dell’origine verifica se un AS è autorizzato a originare un prefisso, non l’intero AS_PATH. Aggiungere filtri di routing e protezione delle sessioni contro annunci impropri.',
      en: 'RPKI origin validation checks whether an AS is authorized to originate a prefix, not the entire AS_PATH. Add routing filters and session protection against improper announcements.'
    },
    isSecure: false
  },
  {
    name: 'OSPF',
    fullName: 'Open Shortest Path First',
    layer: 3,
    type: 'Network',
    description: {
      it: 'Protocollo di routing interno link-state che calcola percorsi a costo minimo a partire da una mappa della topologia.',
      en: 'A link-state interior routing protocol that calculates lowest-cost paths from a topology map.'
    },
    useCase: {
      it: 'Aggiornamento dinamico delle rotte in reti aziendali e campus suddivisi in aree.',
      en: 'Dynamically updating routes in enterprise and campus networks divided into areas.'
    },
    security: {
      it: 'Autenticare le adiacenze e proteggere il control plane. OSPFv2 supporta HMAC-SHA oltre al vecchio MD5: scegliere algoritmi moderni supportati dai peer e gestire le chiavi.',
      en: 'Authenticate adjacencies and protect the control plane. OSPFv2 supports HMAC-SHA in addition to legacy MD5: select modern algorithms supported by peers and manage keys.'
    },
    isSecure: false
  },
  {
    name: 'Ethernet',
    fullName: 'IEEE 802.3 Standard',
    layer: 2,
    type: 'Data Link / Physical',
    description: {
      it: 'Famiglia IEEE 802.3 per reti cablate: definisce funzioni MAC, formati dei frame e diversi mezzi e livelli fisici.',
      en: 'The IEEE 802.3 family for wired networks defines MAC functions, frame formats and different media and physical layers.'
    },
    useCase: {
      it: 'Trasporto di frame su collegamenti locali in rame o fibra; il solo Ethernet non garantisce ritrasmissione dei frame persi.',
      en: 'Transporting frames over local copper or fiber links; Ethernet alone does not guarantee retransmission of lost frames.'
    },
    security: {
      it: 'Il normale traffico Ethernet non è cifrato. Proteggere accesso fisico e porte; MACsec può proteggere il collegamento, senza sostituire la sicurezza delle applicazioni.',
      en: 'Ordinary Ethernet traffic is not encrypted. Protect physical access and ports; MACsec can protect the link without replacing application security.'
    },
    isSecure: false
  },
  {
    name: 'Wi-Fi (IEEE 802.11)',
    fullName: 'Wireless Local Area Network standard',
    layer: 2,
    type: 'Data Link / Physical',
    description: {
      it: 'Famiglia di standard per collegare dispositivi a una rete locale tramite onde radio.',
      en: 'A family of standards for connecting devices to a local network using radio waves.'
    },
    useCase: {
      it: 'Accesso senza fili per smartphone, portatili e dispositivi IoT tramite access point.',
      en: 'Wireless access for smartphones, laptops and IoT devices through access points.'
    },
    security: {
      it: 'La protezione dipende dalla configurazione: usare WPA3 o WPA2 con AES, credenziali robuste e verifica dei certificati nelle reti enterprise. Non fidarsi del solo nome della rete contro gli evil twin.',
      en: 'Protection depends on configuration: use WPA3 or WPA2 with AES, strong credentials and certificate validation on enterprise networks. Do not trust the network name alone against evil twins.'
    },
    isSecure: true
  }
];

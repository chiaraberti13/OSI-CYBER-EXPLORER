/**
 * Split out of the old src/constants.ts.
 *
 * That single file held the OSI layers, the attack scenarios, the glossary and the
 * walkthroughs together, so opening the OSI lab downloaded the glossary too. Each
 * dataset now lives on its own and is imported only where it is used.
 */

export const GLOSSARY_TERMS = [
  {
    term: 'DTLS',
    definition: {
      en: 'Datagram Transport Layer Security - A communications protocol based on TLS designed to secure datagram-based (UDP) transmissions safely and efficiently.',
      it: 'Datagram Transport Layer Security - Un protocollo basato su TLS ma adattato per proteggere comunicazioni basate su datagrammi (UDP), preservando la velocità senza colli di bottiglia.'
    }
  },
  {
    term: 'IPsec',
    definition: {
      en: 'Internet Protocol Security - A Layer 3 protocol suite: IKE negotiates the Security Associations and keys, ESP provides confidentiality plus integrity and authentication, AH provides integrity and authentication only (no encryption). It protects the traffic selected by the policy (traffic selectors / crypto ACL), not every IP packet, and is the standard for site-to-site and remote-access VPNs.',
      it: 'Internet Protocol Security - Suite di protocolli di livello 3: IKE negozia Security Association e chiavi, ESP fornisce riservatezza oltre a integrità e autenticazione, AH fornisce solo integrità e autenticazione (nessuna cifratura). Protegge il traffico selezionato dalla policy (traffic selector / crypto ACL), non tutti i pacchetti IP, ed è lo standard per VPN site-to-site e remote access.'
    }
  },
  {
    term: 'VPN',
    definition: {
      en: 'Virtual Private Network - A logical tunnel carried over a public, untrusted transport network, which lets remote hosts and sites behave as if they were on the same private network. In the VPNs used for security (IPsec, TLS) that tunnel is also encrypted and authenticated; encapsulation alone is not encryption, which is why GRE is a VPN technology that provides neither confidentiality nor authentication.',
      it: 'Virtual Private Network - Canale logico trasportato su una rete pubblica non fidata, che permette a host e sedi remote di comportarsi come se fossero sulla stessa rete privata. Nelle VPN usate per la sicurezza (IPsec, TLS) quel canale è anche cifrato e autenticato; l\'incapsulamento da solo non è cifratura, ed è il motivo per cui GRE è una tecnologia VPN che non fornisce né riservatezza né autenticazione.'
    }
  },
  {
    term: 'GRE',
    definition: {
      en: 'Generic Routing Encapsulation - A tunnelling protocol that wraps an arbitrary payload, including multicast and routing protocol traffic, in a new IP header. It encapsulates without encrypting or authenticating anything, so it is used inside IPsec (GRE over IPsec) whenever confidentiality is required. The extra header reduces the usable MTU of the path.',
      it: 'Generic Routing Encapsulation - Protocollo di tunneling che incapsula un payload arbitrario, compresi multicast e traffico dei protocolli di routing, in un nuovo header IP. Incapsula senza cifrare né autenticare nulla, quindi si usa dentro IPsec (GRE over IPsec) quando serve riservatezza. L\'header aggiuntivo riduce la MTU utilizzabile del percorso.'
    }
  },
  {
    term: 'PDU',
    definition: {
      en: 'Protocol Data Unit - The name data takes at each layer: Data at layers 5-7, Segment at layer 4 with TCP (Datagram with UDP), Packet at layer 3, Frame at layer 2, Bit at layer 1. Naming the PDU correctly tells you which header you are looking at.',
      it: 'Protocol Data Unit - Il nome che i dati assumono a ogni livello: Data ai livelli 5-7, Segment al livello 4 con TCP (Datagram con UDP), Packet al livello 3, Frame al livello 2, Bit al livello 1. Usare il nome corretto della PDU dice subito quale header si sta osservando.'
    }
  },
  {
    term: 'Encapsulation',
    definition: {
      en: 'The process of adding headers to data as it moves down the OSI stack.',
      it: 'Il processo di aggiunta di intestazioni ai dati mentre scendono nello stack OSI.'
    }
  },
  {
    term: 'WAF',
    definition: {
      en: 'Web Application Firewall - Filters, monitors, and blocks HTTP traffic to and from a web service.',
      it: 'Web Application Firewall - Filtra, monitora e blocca il traffico HTTP da e verso un servizio web.'
    }
  },
  {
    term: 'Handshake',
    definition: {
      en: 'The process by which two devices establish a connection (e.g., TCP 3-way handshake).',
      it: 'Il processo attraverso il quale due dispositivi stabiliscono una connessione (es. handshake a 3 vie TCP).'
    }
  },
  {
    term: 'Payload',
    definition: {
      en: 'The actual data being carried within a packet, excluding headers/metadata.',
      it: 'I dati effettivi trasportati all\'interno di un pacchetto, esclusi intestazioni/metadati.'
    }
  },
  {
    term: 'TTL',
    definition: {
      en: 'Time To Live - An 8-bit IPv4 header field that counts hops, not seconds: every router decrements it by one and discards the packet at zero, returning ICMP Time Exceeded — the mechanism traceroute relies on. Its IPv6 equivalent is Hop Limit. The TTL of a DNS record is unrelated: there it really is a caching lifetime in seconds.',
      it: 'Time To Live - Campo di 8 bit dell\'header IPv4 che conta gli hop, non i secondi: ogni router lo decrementa di uno e a zero scarta il pacchetto rispondendo con ICMP Time Exceeded — il meccanismo su cui si basa traceroute. In IPv6 il campo equivalente è Hop Limit. Il TTL di un record DNS è un\'altra cosa: lì è davvero una durata di cache in secondi.'
    }
  },
  {
    term: 'Port',
    definition: {
      en: 'A logical endpoint for communication (e.g., 80 for HTTP, 443 for HTTPS).',
      it: 'Un endpoint logico per la comunicazione (es. 80 per HTTP, 443 per HTTPS).'
    }
  },
  {
    term: 'ARP',
    definition: {
      en: 'Address Resolution Protocol - Used to map an IP address to a physical MAC address.',
      it: 'Address Resolution Protocol - Usato per mappare un indirizzo IP a un indirizzo fisico MAC.'
    }
  },
  {
    term: 'Bandwidth',
    definition: {
      en: 'The maximum rate of data transfer across a given path.',
      it: 'La velocità massima di trasferimento dati attraverso un dato percorso.'
    }
  },
  {
    term: 'Latency',
    definition: {
      en: 'The time it takes for data to travel from source to destination.',
      it: 'Il tempo necessario ai dati per viaggiare dalla sorgente alla destinazione.'
    }
  },
  {
    term: 'DHCP',
    definition: {
      en: 'Dynamic Host Configuration Protocol - Automatically assigns IP addresses to devices.',
      it: 'Dynamic Host Configuration Protocol - Assegna automaticamente indirizzi IP ai dispositivi.'
    }
  },
  {
    term: 'DNS',
    definition: {
      en: 'Domain Name System - Translates human-readable domain names to IP addresses.',
      it: 'Domain Name System - Traduce i nomi di dominio leggibili in indirizzi IP.'
    }
  },
  {
    term: 'ICMP',
    definition: {
      en: 'Internet Control Message Protocol - Used for diagnostic and error messages (e.g., PING).',
      it: 'Internet Control Message Protocol - Usato per messaggi diagnostici e di errore (es. PING).'
    }
  },
  {
    term: 'Frame',
    definition: {
      en: 'The PDU of the Data Link Layer (Layer 2). Includes MAC addresses.',
      it: 'La PDU del livello Data Link (Livello 2). Include gli indirizzi MAC.'
    }
  },
  {
    term: 'Packet',
    definition: {
      en: 'The PDU of the Network Layer (Layer 3). Includes IP addresses.',
      it: 'La PDU del livello Network (Livello 3). Include gli indirizzi IP.'
    }
  },
  {
    term: 'Segment',
    definition: {
      en: 'The PDU of the Transport Layer (Layer 4) when TCP is used: it carries source and destination ports, sequence and acknowledgement numbers, and flags. With UDP the correct name for the L4 PDU is datagram — a frequent exam distinction.',
      it: 'La PDU del livello Transport (Livello 4) quando si usa TCP: trasporta porta sorgente e destinazione, sequence e acknowledgement number e i flag. Con UDP il nome corretto della PDU di livello 4 è datagram: è una distinzione che l\'esame chiede spesso.'
    }
  },
  {
    term: 'Protocol',
    definition: {
      en: 'A set of rules for data communication over a network.',
      it: 'Un insieme di regole per la comunicazione dei dati su una rete.'
    }
  },
  {
    term: 'TCP/IP',
    definition: {
      en: 'The model actually implemented on the Internet, with four layers: Application (OSI 5-7), Transport (OSI 4), Internet (OSI 3), and Network Access/Link (OSI 1-2). OSI is the reference model used to describe and troubleshoot; TCP/IP is the protocol stack that runs.',
      it: 'Il modello realmente implementato su Internet, a quattro livelli: Application (OSI 5-7), Transport (OSI 4), Internet (OSI 3) e Network Access/Link (OSI 1-2). OSI è il modello di riferimento usato per descrivere e fare troubleshooting; TCP/IP è la pila di protocolli che gira davvero.'
    }
  },
  {
    term: 'Port 80',
    definition: {
      en: 'The default port for unencrypted web traffic (HTTP).',
      it: 'La porta predefinita per il traffico web non crittografato (HTTP).'
    }
  },
  {
    term: 'Port 443',
    definition: {
      en: 'The default port for encrypted web traffic (HTTPS).',
      it: 'La porta predefinita per il traffico web crittografato (HTTPS).'
    }
  },
  {
    term: 'BGP',
    definition: {
      en: 'Border Gateway Protocol - The standard protocol used to exchange routing info between autonomous systems on the Internet.',
      it: 'Border Gateway Protocol - Il protocollo standard usato per scambiare informazioni di routing tra sistemi autonomi su Internet.'
    }
  },
  {
    term: 'MITM',
    definition: {
      en: 'Man-in-the-Middle - An attack where the attacker secretly relays and possibly alters communications between two parties.',
      it: 'Man-in-the-Middle - Un attacco in cui l\'attaccante intercetta ed eventualmente altera le comunicazioni tra due parti a loro insaputa.'
    }
  },
  {
    term: 'Slowloris',
    definition: {
      en: 'A low-bandwidth DoS attack (not DDoS: one host is enough). It opens many HTTP connections and keeps them half-open by drip-feeding partial headers, exhausting the web server connection pool.',
      it: 'Un attacco DoS a bassa banda (non DDoS: basta un solo host). Apre molte connessioni HTTP e le mantiene semi-aperte inviando header parziali a intervalli, esaurendo il pool di connessioni del web server.'
    }
  },
  {
    term: 'SYN Cookie',
    definition: {
      en: 'A technique used to resist SYN flood attacks without needing to store the state of the half-open connections.',
      it: 'Una tecnica usata per resistere agli attacchi SYN flood senza dover memorizzare lo stato delle connessioni half-open.'
    }
  },
  {
    term: 'SSH',
    definition: {
      en: 'Secure Shell - A cryptographic network protocol for operating network services securely over an unsecured network.',
      it: 'Secure Shell - Un protocollo di rete crittografico per operare servizi di rete in modo sicuro su una rete non protetta.'
    }
  },
  {
    term: 'FTP',
    definition: {
      en: 'File Transfer Protocol - Used for the transfer of computer files between a client and server on a computer network.',
      it: 'File Transfer Protocol - Usato per il trasferimento di file tra un client e un server su una rete informatica.'
    }
  },
  {
    term: 'SMTP',
    definition: {
      en: 'Simple Mail Transfer Protocol - A communication protocol for electronic mail transmission.',
      it: 'Simple Mail Transfer Protocol - Un protocollo di comunicazione per la trasmissione di posta elettronica.'
    }
  },
  {
    term: 'IDS',
    definition: {
      en: 'Intrusion Detection System - A device or software application that monitors a network or systems for malicious activity or policy violations. It works out of band on a copy of the traffic: it detects and alerts, it does not block.',
      it: 'Intrusion Detection System - Dispositivo o software che monitora rete o sistemi alla ricerca di attività dannose o violazioni delle policy. Opera fuori banda su una copia del traffico: rileva e allerta, non blocca.'
    }
  },
  {
    term: 'IPS',
    definition: {
      en: 'Intrusion Prevention System - A security tool placed inline in the traffic path: beyond detecting, it can drop the packet or tear down the session. Because it is inline, a false positive blocks legitimate traffic and a failure of the device affects availability.',
      it: 'Intrusion Prevention System - Strumento di sicurezza posto inline sul percorso del traffico: oltre a rilevare può scartare il pacchetto o terminare la sessione. Essendo inline, un falso positivo blocca traffico legittimo e un guasto impatta la disponibilità.'
    }
  },
  {
    term: 'NIDS / NIPS',
    definition: {
      en: 'Network-based IDS/IPS - Analyses the traffic of several devices across a whole segment, received through SPAN/port mirroring or a TAP (NIDS) or inline (NIPS). It cannot see what stays inside the host, nor — without decryption — the content of encrypted traffic.',
      it: 'Network-based IDS/IPS - Analizza il traffico di più dispositivi di un intero segmento, ricevuto via SPAN/port mirroring o TAP (NIDS) oppure inline (NIPS). Non vede ciò che resta dentro l\'host né, senza decifratura, il contenuto del traffico cifrato.'
    }
  },
  {
    term: 'HIDS / HIPS',
    definition: {
      en: 'Host-based IDS/IPS - An agent installed on a single host to monitor processes, system calls, files, and local logs. It sees traffic already decrypted and local activity, but covers only the machine it is installed on.',
      it: 'Host-based IDS/IPS - Agent installato sul singolo host per monitorare processi, chiamate di sistema, file e log locali. Vede il traffico già decifrato e l\'attività locale, ma copre solo la macchina su cui è installato.'
    }
  },
  {
    term: 'Firewall',
    definition: {
      en: 'A security system that monitors and controls incoming and outgoing network traffic based on predetermined security rules.',
      it: 'Un sistema di sicurezza che monitora e controlla il traffico di rete in entrata e in uscita in base a regole di sicurezza prestabilite.'
    }
  },
  {
    term: 'Packet Sniffing',
    definition: {
      en: 'The practice of gathering, collecting, and logging packets that pass through a computer network, often for diagnostics or malicious interception.',
      it: 'La pratica di raccogliere ed esaminare i pacchetti che passano attraverso una rete informatica, spesso per scopi diagnostici o per intercettazione dannosa.'
    }
  },
  {
    term: 'EAP',
    definition: {
      en: 'Extensible Authentication Protocol - An authentication framework frequently used in wireless networks (WPA-Enterprise) and point-to-point links. It supports various authentication methods like EAP-TLS (highly secure, certificate-based), EAP-PEAP, and EAP-TTLS (tunnel-based).',
      it: 'Extensible Authentication Protocol - Un framework di autenticazione comunemente usato nelle reti wireless (WPA-Enterprise) e nei link punto-punto. Supporta diverse metodologie come EAP-TLS (altamente sicuro, basato su certificati client/server), EAP-PEAP e EAP-TTLS (che creano un tunnel cifrato sicuro prima di autenticare).'
    }
  },
  {
    term: 'RADIUS',
    definition: {
      en: 'Remote Authentication Dial-In User Service - A networking protocol operating on ports 1812/1813 (UDP) that provides centralized Authentication, Authorization, and Accounting (AAA) management for users connecting to a network. It encrypts only the password in the payload.',
      it: 'Remote Authentication Dial-In User Service - Un protocollo di rete operante sulle porte 1812/1813 (UDP) che gestisce in modo centralizzato Autenticazione, Autorizzazione e Accounting (AAA) per utenti che si connettono alla rete. Cifra solo la password nel payload, lasciando il resto in chiaro.'
    }
  },
  {
    term: 'TACACS+',
    definition: {
      en: 'Terminal Access Controller Access-Control System Plus - A secure TCP-based AAA protocol (Port 49) developed by Cisco. Unlike RADIUS, it completely separates Authentication, Authorization, and Accounting, and encrypts the entire payload body, making it ideal for router/switch administration.',
      it: 'Terminal Access Controller Access-Control System Plus - Un protocollo sicuro di AAA basato su TCP (Porta 49) sviluppato da Cisco. A differenza di RADIUS, separa completamente Autenticazione, Autorizzazione e Accounting, e cifra l\'intero corpo del payload, rendendolo ideale per l\'amministrazione di router e switch.'
    }
  },
  {
    term: '802.1X',
    definition: {
      en: 'IEEE standard for port-based Network Access Control (PNAC). It provides an authentication mechanism to devices wishing to attach to a LAN or WLAN, using EAP for secure credential exchange.',
      it: 'Standard IEEE per il controllo dell\'accesso alla rete basato su porta (PNAC). Fornisce un meccanismo di autenticazione per dispositivi che tentano di connettersi a una LAN o WLAN, usando EAP per il transito sicuro delle credenziali.'
    }
  },
  {
    term: 'AAA',
    definition: {
      en: 'Authentication, Authorization, and Accounting - A security framework for controlling user access, enforcing corporate policies, auditing usage, and keeping track of all network activities.',
      it: 'Authentication, Authorization, and Accounting - Un framework di sicurezza per controllare l\'accesso alle risorse di rete, applicare le policy aziendali, verificare l\'uso e tenere traccia di tutte le attività eseguite.'
    }
  },
  {
    term: 'TLS',
    definition: {
      en: 'Transport Layer Security - A cryptographic protocol designed to provide secure, encrypted end-to-end communications over a computer network (commonly upgrading HTTP to HTTPS).',
      it: 'Transport Layer Security - Un protocollo crittografico progettato per offrire comunicazioni sicure e cifrate end-to-end su una rete informatica (comunemente usato per aggiornare HTTP in HTTPS).'
    }
  },
  {
    term: 'WPA3',
    definition: {
      en: 'Wi-Fi Protected Access 3 - The latest generation of wireless security standards, providing stronger encryption (using SAE handshakes) and elevated protection against offline brute force attempts.',
      it: 'Wi-Fi Protected Access 3 - L\'ultima generazione di standard di sicurezza wireless, che offre una crittografia più solida (tramite handshake SAE) e una maggiore protezione contro gli attacchi bruteforce offline.'
    }
  },
  {
    term: 'AES',
    definition: {
      en: 'Advanced Encryption Standard - A symmetric-key block cipher algorithm chosen by the US government and established globally to protect sensitive data across communications and storage.',
      it: 'Advanced Encryption Standard - Un algoritmo di crittografia simmetrica a blocchi scelto dal governo degli Stati Uniti e adottato globalmente per proteggere e cifrare dati sensibili in transito o archiviati.'
    }
  },
  {
    term: 'OSI Model',
    definition: {
      en: 'OSI Model (Open Systems Interconnection) - A theoretical framework of 7 conceptual layers developed by the ISO to standardize and partition network telecommunication functions.',
      it: 'Modello OSI (Open Systems Interconnection) - Una struttura teorica a 7 livelli concettuali sviluppata dall\'ISO per standardizzare e ripartire le funzioni di telecomunicazione e di rete.'
    }
  },
  {
    term: 'MAC Address',
    definition: {
      en: 'Media Access Control Address - A 48-bit Layer 2 identifier (24-bit OUI + 24-bit device ID) assigned to a NIC. Switches use it to forward frames inside a broadcast domain; frames are switched, never routed, and the burned-in address can be overridden in software.',
      it: 'Media Access Control Address - Identificativo di livello 2 a 48 bit (24 bit di OUI + 24 bit di dispositivo) assegnato alla NIC. Gli switch lo usano per commutare i frame dentro un dominio di broadcast: i frame vengono commutati, mai instradati, e l\'indirizzo impresso nella scheda può essere sovrascritto via software.'
    }
  },
  {
    term: 'IP Address',
    definition: {
      en: 'Internet Protocol Address - A logical numeric label assigned to each device participating in a computer network that uses the Internet Protocol for routing packets (Layer 3).',
      it: 'Indirizzo IP - Un\'etichetta numerica logica assegnata a ciascun dispositivo connesso a una rete che utilizza il protocollo IP per instradare e recapitare i pacchetti (Livello 3).'
    }
  },
  {
    term: 'TCP',
    definition: {
      en: 'Transmission Control Protocol - A reliable, connection-oriented, flow-controlled Transport layer (Layer 4) protocol that ensures ordered delivery of byte streams.',
      it: 'Transmission Control Protocol - Un protocollo di livello Transport (Livello 4) orientato alla connessione, affidabile e con controllo di flusso, che garantisce la consegna ordinata e priva di errori dei dati.'
    }
  },
  {
    term: 'UDP',
    definition: {
      en: 'User Datagram Protocol - A connectionless Transport layer (Layer 4) protocol. It is not faster on the wire than TCP: it has an 8-byte header and no handshake, acknowledgements (ACK), retransmission, ordering, or congestion control, so it avoids the delay those mechanisms introduce. Its PDU is called a datagram.',
      it: 'User Datagram Protocol - Protocollo di livello Transport (Livello 4) connectionless. Non è più veloce di TCP sul filo: ha un header di soli 8 byte e nessun handshake, ACK, ritrasmissione, ordinamento o controllo di congestione, quindi evita i ritardi introdotti da questi meccanismi. La sua PDU si chiama datagram.'
    }
  },
  {
    term: 'HTTP',
    definition: {
      en: 'Hypertext Transfer Protocol - An unencrypted Application layer (Layer 7) protocol used broadly on the web to request and fetch documents or resources (defaulting to Port 80).',
      it: 'Hypertext Transfer Protocol - Un protocollo non crittografato di livello Applicazione (Livello 7) ampiamente usato sul web per la richiesta e il recupero di documenti o risorse (porta predefinita 80).'
    }
  },
  {
    term: 'HTTPS',
    definition: {
      en: 'Hypertext Transfer Protocol Secure - An extension of HTTP using TLS encryption to secure the communication channel, encrypting URLs, headers, and payloads on Port 443.',
      it: 'Hypertext Transfer Protocol Secure - Un\'estensione sicura di HTTP che utilizza la crittografia TLS per proteggere il canale di comunicazione, cifrando URL, intestazioni e payload sulla porta 443.'
    }
  },
  {
    term: 'SQL Injection',
    definition: {
      en: 'SQLi - An Application layer attack where malicious SQL strings are injected into input fields, manipulating raw queries on the back-end database directly to leak or damage tables.',
      it: 'SQL Injection - Un attacco a livello applicativo in cui query SQL alterate vengono iniettate nei campi di input, spingendo il database server a eseguire comandi non autorizzati per estrarre o alterare dati.'
    }
  },
  {
    term: 'Cross-Site Scripting',
    definition: {
      en: 'XSS - A vulnerability where an attacker injects malicious scripts (often JavaScript) into web pages viewed by other users, allowing session cookie theft or interface manipulation.',
      it: 'Cross-Site Scripting - Una vulnerabilità in cui l\'attaccante inietta script malevoli (spesso JavaScript) all\'interno di pagine web visitate da altri utenti, consentendo il furto di cookie di sessione o la manipolazione dell\'interfaccia.'
    }
  },
  {
    term: 'uRPF',
    definition: {
      en: 'Unicast Reverse Path Forwarding - An anti-spoofing check performed by the router on ingress: the source address of the packet is looked up in the FIB. In strict mode the packet is dropped unless the best return path uses the very interface it arrived on; loose mode only requires that the source be routable. Strict mode breaks asymmetric routing, which is why loose mode is used at multihomed edges.',
      it: 'Unicast Reverse Path Forwarding - Controllo anti-spoofing eseguito dal router in ingresso: l\'indirizzo sorgente del pacchetto viene cercato nella FIB. In modalità strict il pacchetto è scartato se il percorso di ritorno migliore non usa la stessa interfaccia da cui è arrivato; in modalità loose basta che la sorgente sia raggiungibile. Lo strict mode rompe il routing asimmetrico: per questo ai bordi multihomed si usa il loose mode.'
    }
  },
  {
    term: 'DAI',
    definition: {
      en: 'Dynamic ARP Inspection - A switch feature that intercepts every ARP packet received on an untrusted port and validates its IP-to-MAC pair against the DHCP snooping binding table (or an ARP ACL for static hosts), dropping the mismatches that make ARP poisoning possible. It requires DHCP snooping to be enabled first, and uplinks toward legitimate switches/servers must be configured as trusted.',
      it: 'Dynamic ARP Inspection - Funzionalità dello switch che intercetta ogni pacchetto ARP ricevuto su una porta untrusted e ne convalida la coppia IP-MAC con il binding database del DHCP Snooping (o con una ARP ACL per gli host statici), scartando le associazioni non corrispondenti che rendono possibile l\'ARP poisoning. Richiede DHCP Snooping attivo e le porte verso switch/server legittimi vanno dichiarate trusted.'
    }
  },
  {
    term: 'Punycode',
    definition: {
      en: 'A representation system that translates Internationalized Domain Names (IDNs) containing Unicode characters into safe basic ASCII strings prefixed with "xn--" for DNS queries.',
      it: 'Un sistema di codifica che converte i Nomi di Dominio Internazionalizzati (IDN) contenenti caratteri speciali Unicode in stringhe ASCII standard che iniziano con "xn--", utilizzabili dal DNS.'
    }
  },
  {
    term: 'CSP',
    definition: {
      en: 'Content Security Policy - An HTTP header that restricts what dynamic script or style resources browsers are allowed to run, serving as a powerful layer of defense against XSS attacks.',
      it: 'Content Security Policy - Un\'intestazione HTTP che indica quali risorse dinamiche di script o fogli di stile il browser è autorizzato a eseguire per quella pagina, riducendo drasticamente il rischio di XSS.'
    }
  },
  {
    term: 'AEAD',
    definition: {
      en: 'Authenticated Encryption with Associated Data - Encryption modes (for example AES-GCM, ChaCha20-Poly1305) that provide confidentiality and authenticated payload integrity in a single operation: tampered ciphertext is rejected before it is decrypted. This removes the padding oracle attacks that affect CBC with MAC-then-Encrypt, where the MAC is computed on the plaintext and encrypted with it, so the receiver has to decrypt and check the padding before it can verify the MAC.',
      it: 'Authenticated Encryption with Associated Data - Modalità di cifratura (per esempio AES-GCM, ChaCha20-Poly1305) che forniscono riservatezza e integrità autenticata del payload in una sola operazione: il testo cifrato manomesso viene rifiutato prima di essere decifrato. Questo elimina gli attacchi di tipo padding oracle che colpiscono CBC con MAC-then-Encrypt, dove il MAC è calcolato sul plaintext e cifrato insieme a esso, quindi il destinatario deve decifrare e controllare il padding prima di poter verificare il MAC.'
    }
  },

  // ---------------------------------------------------------------------------
  // CCNA 200-301 v1.1 — 1.0 Network Fundamentals
  // ---------------------------------------------------------------------------
  {
    term: 'Subnet Mask',
    definition: {
      en: 'The 32-bit value that splits an IPv4 address into a network part (contiguous 1 bits) and a host part (0 bits). 255.255.255.0 is the same thing as the /24 prefix. In a subnet of /30 or shorter, the all-zeros host address is the network address and the all-ones host address is the broadcast, so usable hosts = 2^(32-prefix) - 2.',
      it: 'Valore a 32 bit che divide un indirizzo IPv4 in parte di rete (bit 1 contigui) e parte host (bit 0). 255.255.255.0 è la stessa cosa del prefisso /24. In una subnet /30 o più corta, l\'indirizzo host tutto a zeri è l\'indirizzo di rete e quello tutto a uno è il broadcast, quindi gli host utilizzabili sono 2^(32-prefisso) - 2.'
    }
  },
  {
    term: 'Wildcard Mask',
    definition: {
      en: 'The inverted subnet mask (0 = the bit must match, 1 = the bit is ignored) used by ACLs and by the OSPF network command. The mask for a /24 is 0.0.0.255. A classic exam trap: subtract each octet from 255 to convert, and never write a subnet mask where a wildcard is expected.',
      it: 'Maschera invertita rispetto alla subnet mask (0 = il bit deve corrispondere, 1 = il bit è ignorato) usata dalle ACL e dal comando network di OSPF. Per un /24 vale 0.0.0.255. Trappola d\'esame classica: per convertirla sottrai ogni ottetto da 255 e non scrivere mai una subnet mask dove è attesa una wildcard.'
    }
  },
  {
    term: 'Default Gateway',
    definition: {
      en: 'The router IP address a host uses for any destination outside its own subnet. The host compares destination and its own address with its subnet mask: same subnet means ARP for the destination directly, different subnet means ARP for the gateway and send the frame to the gateway MAC while the destination IP stays unchanged.',
      it: 'Indirizzo IP del router che un host usa per ogni destinazione fuori dalla propria subnet. L\'host confronta destinazione e proprio indirizzo tramite la subnet mask: stessa subnet significa ARP direttamente per la destinazione, subnet diversa significa ARP per il gateway e invio del frame al MAC del gateway, mentre l\'IP di destinazione resta invariato.'
    }
  },
  {
    term: 'Collision Domain',
    definition: {
      en: 'The set of interfaces whose transmissions can collide with one another. Every switch port is its own collision domain, and a full-duplex link has no collisions at all, so CSMA/CD is disabled on it. Collision domains are a Layer 1/2 concept and must not be confused with broadcast domains.',
      it: 'Insieme di interfacce le cui trasmissioni possono collidere tra loro. Ogni porta di uno switch è un dominio di collisione a sé e un collegamento full-duplex non ha collisioni, quindi su di esso CSMA/CD è disattivato. È un concetto di livello 1/2 e non va confuso con il dominio di broadcast.'
    }
  },
  {
    term: 'Broadcast Domain',
    definition: {
      en: 'The set of devices that receive a Layer 2 broadcast frame (destination FF:FF:FF:FF:FF:FF). A switch forwards broadcasts, so it does not split broadcast domains; a VLAN or a router does. Rule of thumb: one VLAN = one broadcast domain = normally one IP subnet.',
      it: 'Insieme di dispositivi che ricevono un frame broadcast di livello 2 (destinazione FF:FF:FF:FF:FF:FF). Uno switch inoltra i broadcast, quindi non separa i domini di broadcast: lo fanno una VLAN o un router. Regola pratica: una VLAN = un dominio di broadcast = normalmente una subnet IP.'
    }
  },
  {
    term: 'CSMA/CD',
    definition: {
      en: 'Carrier Sense Multiple Access with Collision Detection - The half-duplex Ethernet access method. Think of a crowded room: you listen before speaking (carrier sense), if two people start together you both hear the clash (collision detection), everyone stops, sends a jam signal, and waits a random backoff before retrying. Full-duplex switched links do not need it; on Wi-Fi the equivalent is CSMA/CA, which avoids collisions instead of detecting them.',
      it: 'Carrier Sense Multiple Access with Collision Detection - Metodo di accesso dell\'Ethernet half-duplex. Immagina una stanza affollata: si ascolta prima di parlare (carrier sense), se due parlano insieme entrambi sentono la sovrapposizione (collision detection), tutti si fermano, inviano un jam signal e attendono un backoff casuale prima di riprovare. I collegamenti full-duplex commutati non ne hanno bisogno; nel Wi-Fi l\'equivalente è CSMA/CA, che evita le collisioni invece di rilevarle.'
    }
  },
  {
    term: 'Duplex Mismatch',
    definition: {
      en: 'One side of a link is full-duplex and the other half-duplex, typically because one end is hard-coded and the other is left to autonegotiation, which then falls back to half. The link stays up/up but performance collapses: the half-duplex side reports late collisions and the full-duplex side reports CRC/input errors that grow with load.',
      it: 'Un lato del collegamento è full-duplex e l\'altro half-duplex, tipicamente perché un estremo è forzato e l\'altro lasciato in autonegoziazione, che ripiega su half. Il link resta up/up ma le prestazioni crollano: il lato half-duplex registra late collision e il lato full-duplex errori CRC/input che crescono con il carico.'
    }
  },
  {
    term: 'MTU',
    definition: {
      en: 'Maximum Transmission Unit - The largest Layer 3 payload an interface will carry, 1500 bytes on standard Ethernet. A packet larger than the next-hop MTU is fragmented by IPv4 routers, or dropped with ICMP Packet Too Big by IPv6 routers, which only fragment at the source. Tunnels (GRE, IPsec) add headers and therefore reduce the usable MTU.',
      it: 'Maximum Transmission Unit - Massimo payload di livello 3 che un\'interfaccia può trasportare, 1500 byte su Ethernet standard. Un pacchetto più grande della MTU del next hop viene frammentato dai router IPv4, oppure scartato con ICMP Packet Too Big dai router IPv6, che frammentano solo alla sorgente. I tunnel (GRE, IPsec) aggiungono header e quindi riducono la MTU utilizzabile.'
    }
  },
  {
    term: 'PoE',
    definition: {
      en: 'Power over Ethernet - Delivery of DC power and data over the same twisted-pair cable, so access points, IP phones, and cameras need no local power supply. The switch first detects and classifies the powered device, then supplies power: 802.3af (PoE) up to 15.4 W per port, 802.3at (PoE+) up to 30 W, 802.3bt (PoE++) up to 60/90 W. The per-port budget and the switch total power budget must both be planned.',
      it: 'Power over Ethernet - Trasporto di alimentazione in corrente continua e dati sullo stesso cavo in rame, così che access point, telefoni IP e telecamere non richiedano un alimentatore locale. Lo switch prima rileva e classifica il dispositivo alimentato, poi eroga potenza: 802.3af (PoE) fino a 15,4 W per porta, 802.3at (PoE+) fino a 30 W, 802.3bt (PoE++) fino a 60/90 W. Vanno dimensionati sia il budget per porta sia il budget complessivo dello switch.'
    }
  },
  {
    term: 'SLAAC',
    definition: {
      en: 'Stateless Address Autoconfiguration - The IPv6 host builds its own global address by taking the /64 prefix from a Router Advertisement and generating the interface ID itself (modified EUI-64 or, more commonly today, a random/privacy value). Stateless means no server tracks the assignment; DNS usually still comes from the RA or from stateless DHCPv6.',
      it: 'Stateless Address Autoconfiguration - L\'host IPv6 costruisce da sé il proprio indirizzo globale prendendo il prefisso /64 da un Router Advertisement e generando autonomamente l\'interface ID (modified EUI-64 oppure, oggi più spesso, un valore casuale/privacy). Stateless significa che nessun server tiene traccia dell\'assegnazione; il DNS arriva di solito dallo stesso RA o da DHCPv6 stateless.'
    }
  },
  {
    term: 'Modified EUI-64',
    definition: {
      en: 'The rule that turns a 48-bit MAC into a 64-bit IPv6 interface ID: split the MAC in half, insert FF:FE in the middle, then invert the seventh bit of the first byte (the U/L bit). 00:1A:2B:3C:4D:5E becomes 021A:2BFF:FE3C:4D5E. Because it exposes the MAC, modern operating systems prefer randomized interface identifiers.',
      it: 'Regola che trasforma un MAC a 48 bit in un interface ID IPv6 a 64 bit: si divide il MAC a metà, si inserisce FF:FE al centro e si inverte il settimo bit del primo byte (bit U/L). 00:1A:2B:3C:4D:5E diventa 021A:2BFF:FE3C:4D5E. Poiché espone il MAC, i sistemi operativi moderni preferiscono interface identifier casuali.'
    }
  },
  {
    term: 'Anycast',
    definition: {
      en: 'One address configured on several nodes, with routing delivering each client to the topologically nearest instance. IPv6 has no dedicated anycast prefix: an anycast address is an ordinary unicast address assigned more than once. It is widely used for root DNS and public resolvers.',
      it: 'Un solo indirizzo configurato su più nodi, con il routing che consegna ogni client all\'istanza topologicamente più vicina. IPv6 non ha un prefisso dedicato all\'anycast: un indirizzo anycast è un normale indirizzo unicast assegnato più volte. È largamente usato per i root DNS e i resolver pubblici.'
    }
  },

  // ---------------------------------------------------------------------------
  // CCNA 200-301 v1.1 — 2.0 Network Access
  // ---------------------------------------------------------------------------
  {
    term: 'VLAN',
    definition: {
      en: 'Virtual LAN - A logical Layer 2 segment that splits one physical switch into several independent broadcast domains, each normally mapped to its own IP subnet. Traffic between VLANs requires a Layer 3 device (router or multilayer switch). A VLAN segments, it does not filter: it is not a firewall.',
      it: 'Virtual LAN - Segmento logico di livello 2 che divide un singolo switch fisico in più domini di broadcast indipendenti, ciascuno normalmente associato a una propria subnet IP. Il traffico tra VLAN richiede un dispositivo di livello 3 (router o switch multilayer). Una VLAN segmenta, non filtra: non è un firewall.'
    }
  },
  {
    term: 'Trunk (802.1Q)',
    definition: {
      en: 'A link that carries several VLANs between switches (or toward a router/AP) by inserting a 4-byte 802.1Q tag with the VLAN ID into each frame. An access port belongs to a single VLAN and sends frames untagged; a trunk tags everything except the native VLAN.',
      it: 'Collegamento che trasporta più VLAN tra switch (o verso un router/AP) inserendo in ogni frame un tag 802.1Q di 4 byte con il VLAN ID. Una porta di accesso appartiene a una sola VLAN e invia frame senza tag; un trunk tagga tutto tranne la native VLAN.'
    }
  },
  {
    term: 'Native VLAN',
    definition: {
      en: 'The one VLAN whose frames cross an 802.1Q trunk untagged (VLAN 1 by default). Both ends must agree or CDP reports a native VLAN mismatch and traffic leaks between VLANs. Best practice: use a dedicated, unused native VLAN that is not an access VLAN — this is what removes the double-tagging VLAN hopping attack.',
      it: 'L\'unica VLAN i cui frame attraversano un trunk 802.1Q senza tag (per impostazione predefinita la VLAN 1). I due estremi devono coincidere, altrimenti CDP segnala un native VLAN mismatch e il traffico passa tra VLAN diverse. Buona pratica: usare una native VLAN dedicata e inutilizzata, diversa dalle VLAN di accesso — è ciò che elimina l\'attacco di VLAN hopping per double tagging.'
    }
  },
  {
    term: 'SVI',
    definition: {
      en: 'Switched Virtual Interface - A virtual Layer 3 interface on a switch (interface vlan 10) that gives a VLAN its gateway address and enables inter-VLAN routing without router-on-a-stick. It comes up only when the VLAN exists in the database and at least one active port or trunk carries that VLAN.',
      it: 'Switched Virtual Interface - Interfaccia virtuale di livello 3 su uno switch (interface vlan 10) che assegna alla VLAN il proprio indirizzo di gateway e abilita l\'inter-VLAN routing senza router-on-a-stick. Passa in stato up solo se la VLAN esiste nel database e almeno una porta attiva o un trunk trasporta quella VLAN.'
    }
  },
  {
    term: 'STP',
    definition: {
      en: 'Spanning Tree Protocol (802.1D) - Prevents Layer 2 loops, which are far worse than Layer 3 loops because the Ethernet header has no TTL and a broadcast storm therefore never stops. Switches elect a root bridge, each other switch picks the root port with the lowest cost toward it, each segment picks a designated port, and every remaining port is blocked.',
      it: 'Spanning Tree Protocol (802.1D) - Previene i loop di livello 2, molto più gravi di quelli di livello 3 perché l\'header Ethernet non ha un TTL e quindi una broadcast storm non si ferma mai. Gli switch eleggono una root bridge, ogni altro switch sceglie la root port con il costo minore verso di essa, ogni segmento sceglie una designated port e tutte le porte restanti restano bloccate.'
    }
  },
  {
    term: 'Bridge ID',
    definition: {
      en: 'The value that decides the STP root election: 4-bit priority + 12-bit extended system ID (the VLAN number) + the switch MAC address. The lowest Bridge ID wins, priority first and MAC only as a tie-breaker. Priority must be a multiple of 4096 (default 32768), so a switch in VLAN 10 with priority 32768 actually advertises 32778.',
      it: 'Valore che decide l\'elezione della root STP: priorità a 4 bit + extended system ID a 12 bit (il numero di VLAN) + MAC address dello switch. Vince il Bridge ID più basso, prima la priorità e il MAC solo come spareggio. La priorità deve essere un multiplo di 4096 (default 32768), quindi uno switch nella VLAN 10 con priorità 32768 annuncia in realtà 32778.'
    }
  },
  {
    term: 'RSTP',
    definition: {
      en: 'Rapid Spanning Tree Protocol (802.1w) - Converges in seconds instead of the 30-50 s of classic STP by adding proposal/agreement handshakes, edge ports, and the alternate and backup roles that pre-compute a replacement path. It keeps three port states only: discarding, learning, forwarding. Cisco Rapid PVST+ runs one RSTP instance per VLAN.',
      it: 'Rapid Spanning Tree Protocol (802.1w) - Converge in pochi secondi invece dei 30-50 s dello STP classico grazie agli handshake proposal/agreement, alle edge port e ai ruoli alternate e backup che precalcolano un percorso sostitutivo. Mantiene solo tre stati di porta: discarding, learning, forwarding. Il Rapid PVST+ Cisco esegue un\'istanza RSTP per ogni VLAN.'
    }
  },
  {
    term: 'PortFast',
    definition: {
      en: 'Moves an access port to forwarding immediately instead of walking through listening and learning, so hosts get DHCP without a 30-second wait. It is for edge ports only: on a port connected to another switch it would create a temporary loop, which is why it is always paired with BPDU Guard.',
      it: 'Porta subito in forwarding una porta di accesso invece di farle attraversare listening e learning, così gli host ottengono il DHCP senza attendere 30 secondi. Va usata solo sulle porte edge: su una porta collegata a un altro switch creerebbe un loop temporaneo, ed è per questo che si abbina sempre a BPDU Guard.'
    }
  },
  {
    term: 'BPDU Guard',
    definition: {
      en: 'Puts a PortFast edge port into err-disable the moment it receives any BPDU, because a BPDU on a user port means either an unauthorized switch or an attacker trying to become root. Root Guard is the complementary control: it keeps the port up but blocks it if a superior BPDU arrives where the root must never appear.',
      it: 'Mette in err-disable una porta edge con PortFast nell\'istante in cui riceve una BPDU, perché una BPDU su una porta utente indica uno switch non autorizzato o un attaccante che tenta di diventare root. Root Guard è il controllo complementare: mantiene la porta attiva ma la blocca se arriva una BPDU superiore dove la root non deve mai comparire.'
    }
  },
  {
    term: 'EtherChannel',
    definition: {
      en: 'Bundles up to eight physical links into one logical port-channel, so STP sees a single link and all members forward. Negotiation uses LACP (802.3ad: active initiates, passive only answers) or the Cisco PAgP (desirable initiates, auto only answers); mode on skips negotiation and must be set on both ends. Speed, duplex, and VLAN configuration must match on every member port.',
      it: 'Aggrega fino a otto collegamenti fisici in un unico port-channel logico, così STP vede un solo link e tutti i membri inoltrano. La negoziazione usa LACP (802.3ad: active avvia, passive risponde soltanto) oppure il PAgP Cisco (desirable avvia, auto risponde soltanto); la modalità on non negozia e va impostata su entrambi i lati. Velocità, duplex e configurazione VLAN devono coincidere su tutte le porte membro.'
    }
  },
  {
    term: 'CDP / LLDP',
    definition: {
      en: 'Layer 2 neighbor discovery protocols: CDP is Cisco proprietary, LLDP (802.1AB) is the open standard. They report the neighbor device ID, platform, port, and VLAN, which makes them invaluable for documenting a topology and equally valuable to an attacker — disable them on ports facing untrusted networks.',
      it: 'Protocolli di discovery dei vicini a livello 2: CDP è proprietario Cisco, LLDP (802.1AB) è lo standard aperto. Riportano device ID, piattaforma, porta e VLAN del vicino, il che li rende preziosi per documentare una topologia e altrettanto preziosi per un attaccante: vanno disabilitati sulle porte verso reti non fidate.'
    }
  },
  {
    term: 'WLC',
    definition: {
      en: 'Wireless LAN Controller - The device that centralizes configuration, RF management, roaming, and security policy for lightweight access points. In a split-MAC architecture the AP keeps the real-time radio functions while the WLC handles association, authentication, and management.',
      it: 'Wireless LAN Controller - Dispositivo che centralizza configurazione, gestione RF, roaming e policy di sicurezza per gli access point lightweight. Nell\'architettura split-MAC l\'AP mantiene le funzioni radio in tempo reale mentre il WLC gestisce associazione, autenticazione e management.'
    }
  },
  {
    term: 'CAPWAP',
    definition: {
      en: 'Control and Provisioning of Wireless Access Points - The tunnel between a lightweight AP and its WLC: UDP 5246 for the control plane, which is DTLS-encrypted, and UDP 5247 for the data plane, which is only encrypted if explicitly enabled. The AP must reach the WLC at Layer 3, so it is usually discovered through DHCP option 43 or DNS.',
      it: 'Control and Provisioning of Wireless Access Points - Tunnel tra un AP lightweight e il suo WLC: UDP 5246 per il control plane, cifrato con DTLS, e UDP 5247 per il data plane, cifrato solo se esplicitamente abilitato. L\'AP deve raggiungere il WLC a livello 3, quindi lo individua di norma tramite l\'opzione DHCP 43 o il DNS.'
    }
  },
  {
    term: 'SSID',
    definition: {
      en: 'Service Set Identifier - The network name advertised in beacons and used by clients to select a WLAN. It is an identifier, not a security control: hiding it only stops casual discovery, since the name still travels in probe and association frames.',
      it: 'Service Set Identifier - Nome della rete annunciato nei beacon e usato dai client per scegliere una WLAN. È un identificatore, non un controllo di sicurezza: nasconderlo impedisce solo la scoperta casuale, perché il nome viaggia comunque nei frame di probe e associazione.'
    }
  },

  // ---------------------------------------------------------------------------
  // CCNA 200-301 v1.1 — 3.0 IP Connectivity
  // ---------------------------------------------------------------------------
  {
    term: 'Longest Prefix Match',
    definition: {
      en: 'The first and overriding rule of a routing-table lookup: among all matching routes the router installs the one with the longest prefix, whatever its source. A /32 static route beats a /24 OSPF route, and administrative distance is compared only between routes with the same prefix length. Order to remember: prefix length, then administrative distance, then metric.',
      it: 'Prima regola, e prevalente, del lookup nella routing table: tra tutte le rotte corrispondenti il router installa quella con il prefisso più lungo, qualunque sia la sua origine. Una rotta statica /32 vince su una rotta OSPF /24 e la distanza amministrativa si confronta solo tra rotte con la stessa lunghezza di prefisso. Ordine da ricordare: lunghezza del prefisso, poi distanza amministrativa, poi metrica.'
    }
  },
  {
    term: 'Administrative Distance',
    definition: {
      en: 'The trustworthiness of a route source, used to choose between routes to the same prefix learned from different protocols; the lower value wins. Cisco defaults: connected and local 0, static 1, eBGP 20, EIGRP 90, OSPF 110, IS-IS 115, RIP 120, external EIGRP 170, iBGP 200, unusable 255. It is local to the router and is never advertised.',
      it: 'Grado di affidabilità di una sorgente di routing, usato per scegliere tra rotte verso lo stesso prefisso apprese da protocolli diversi; vince il valore più basso. Valori predefiniti Cisco: connected e local 0, static 1, eBGP 20, EIGRP 90, OSPF 110, IS-IS 115, RIP 120, EIGRP external 170, iBGP 200, inutilizzabile 255. È locale al router e non viene mai annunciata.'
    }
  },
  {
    term: 'Floating Static Route',
    definition: {
      en: 'A static route configured with an administrative distance higher than the dynamic protocol it backs up (for example ip route 10.20.0.0 255.255.0.0 192.0.2.6 200). It stays out of the routing table while the preferred route exists and is installed automatically the moment that route disappears.',
      it: 'Rotta statica configurata con una distanza amministrativa superiore a quella del protocollo dinamico di cui è backup (per esempio ip route 10.20.0.0 255.255.0.0 192.0.2.6 200). Resta fuori dalla routing table finché esiste la rotta preferita e viene installata automaticamente nel momento in cui quella rotta scompare.'
    }
  },
  {
    term: 'OSPF',
    definition: {
      en: 'Open Shortest Path First - An open-standard link-state IGP. Every router floods LSAs describing its links, builds an identical link-state database inside the area, and runs the SPF (Dijkstra) algorithm on it to compute the shortest path. Neighbors form adjacencies with Hello packets on multicast 224.0.0.5 and must agree on area, hello/dead timers, subnet, authentication, and MTU.',
      it: 'Open Shortest Path First - IGP link-state a standard aperto. Ogni router inonda la rete di LSA che descrivono i propri link, costruisce un link-state database identico all\'interno dell\'area ed esegue su di esso l\'algoritmo SPF (Dijkstra) per calcolare il percorso più breve. I vicini formano adiacenze con pacchetti Hello sul multicast 224.0.0.5 e devono concordare su area, timer hello/dead, subnet, autenticazione e MTU.'
    }
  },
  {
    term: 'OSPF Cost',
    definition: {
      en: 'The OSPF metric: reference bandwidth divided by interface bandwidth, with a minimum of 1. With the 100 Mbps default reference, every interface at 100 Mbps or faster costs 1, so a Gigabit and a FastEthernet link look identical — raise the reference bandwidth (auto-cost reference-bandwidth) to the same value on every router in the domain.',
      it: 'Metrica di OSPF: reference bandwidth diviso banda dell\'interfaccia, con minimo 1. Con il riferimento predefinito di 100 Mbps ogni interfaccia da 100 Mbps in su ha costo 1, quindi un link Gigabit e uno FastEthernet risultano identici: va alzata la reference bandwidth (auto-cost reference-bandwidth) allo stesso valore su tutti i router del dominio.'
    }
  },
  {
    term: 'OSPF Router ID',
    definition: {
      en: 'The 32-bit value in dotted-decimal form that uniquely identifies a router in the OSPF domain. Selection order: the router-id command, otherwise the highest IPv4 address on an up loopback, otherwise the highest IPv4 address on an up physical interface. It does not change until the process is cleared, so configure it explicitly on a loopback for stability.',
      it: 'Valore a 32 bit in notazione decimale puntata che identifica in modo univoco un router nel dominio OSPF. Ordine di scelta: comando router-id, altrimenti l\'indirizzo IPv4 più alto tra le loopback attive, altrimenti l\'indirizzo IPv4 più alto tra le interfacce fisiche attive. Non cambia finché il processo non viene azzerato: per stabilità va configurato esplicitamente su una loopback.'
    }
  },
  {
    term: 'DR / BDR',
    definition: {
      en: 'Designated Router and Backup Designated Router - On a broadcast or non-broadcast multiaccess segment, OSPF elects them so that routers exchange LSAs with the DR (224.0.0.6) instead of with every neighbor, turning n(n-1)/2 adjacencies into n. The highest priority wins, then the highest Router ID; priority 0 makes a router ineligible and the election is non-preemptive. Point-to-point links elect no DR.',
      it: 'Designated Router e Backup Designated Router - Su un segmento broadcast o non-broadcast multiaccess OSPF li elegge affinché i router scambino le LSA con il DR (224.0.0.6) invece che con ogni vicino, trasformando n(n-1)/2 adiacenze in n. Vince la priorità più alta, poi il Router ID più alto; priorità 0 rende un router non eleggibile e l\'elezione non è preemptive. Sui link point-to-point non viene eletto alcun DR.'
    }
  },
  {
    term: 'FHRP / HSRP',
    definition: {
      en: 'First Hop Redundancy Protocol - Lets two or more routers share one virtual IP and virtual MAC so hosts keep a single default gateway while the physical router behind it can fail over. HSRP is Cisco (Active/Standby, virtual MAC 0000.0C07.ACxx, highest priority wins but only preempts if preempt is configured); VRRP is the open standard (Master/Backup) and GLBP also load-balances across gateways. Object tracking lowers the priority when the uplink fails.',
      it: 'First Hop Redundancy Protocol - Consente a due o più router di condividere un IP e un MAC virtuali, così gli host mantengono un unico default gateway mentre il router fisico dietro di esso può commutare in caso di guasto. HSRP è Cisco (Active/Standby, MAC virtuale 0000.0C07.ACxx, vince la priorità più alta ma il subentro avviene solo se è configurato preempt); VRRP è lo standard aperto (Master/Backup) e GLBP distribuisce anche il carico tra i gateway. L\'object tracking abbassa la priorità quando cade l\'uplink.'
    }
  },
  {
    term: 'RIB / FIB',
    definition: {
      en: 'The RIB (routing table) is the control-plane database of all best routes learned by every source; the FIB is the data-plane copy that CEF programs in hardware, paired with an adjacency table holding the Layer 2 rewrite information. Traffic can be broken even when show ip route looks perfect, which is why forwarding is verified with show ip cef, not only with the RIB.',
      it: 'La RIB (routing table) è il database di control plane con tutte le rotte migliori apprese da ogni sorgente; la FIB è la copia di data plane che CEF programma in hardware, affiancata da una adjacency table con le informazioni di riscrittura di livello 2. Il traffico può essere interrotto anche quando show ip route appare perfetto: per questo l\'inoltro si verifica con show ip cef e non solo con la RIB.'
    }
  },

  // ---------------------------------------------------------------------------
  // CCNA 200-301 v1.1 — 4.0 IP Services
  // ---------------------------------------------------------------------------
  {
    term: 'NAT / PAT',
    definition: {
      en: 'Network Address Translation rewrites addresses at the network boundary; PAT (NAT overload) additionally rewrites the source port so thousands of inside hosts share one public address. Cisco terminology: inside local is the private address, inside global its public translation, outside global the real remote address. NAT hides topology but is not a security control — it authenticates nothing and inspects nothing.',
      it: 'Il Network Address Translation riscrive gli indirizzi al confine della rete; il PAT (NAT overload) riscrive in più la porta sorgente, così migliaia di host interni condividono un solo indirizzo pubblico. Terminologia Cisco: inside local è l\'indirizzo privato, inside global la sua traduzione pubblica, outside global l\'indirizzo remoto reale. Il NAT nasconde la topologia ma non è un controllo di sicurezza: non autentica e non ispeziona nulla.'
    }
  },
  {
    term: 'DHCP Relay',
    definition: {
      en: 'The ip helper-address command on the client-side SVI or router interface: the router converts the client broadcast into a unicast toward the DHCP server and fills the giaddr field with its own interface address, which is how the server knows which scope to allocate from. Without it a centralized DHCP server can never serve a remote subnet, because routers do not forward broadcasts.',
      it: 'Il comando ip helper-address sull\'interfaccia o SVI lato client: il router converte il broadcast del client in unicast verso il server DHCP e compila il campo giaddr con l\'indirizzo della propria interfaccia, che è ciò che permette al server di sapere da quale scope assegnare. Senza di esso un server DHCP centralizzato non può servire una subnet remota, perché i router non inoltrano i broadcast.'
    }
  },
  {
    term: 'DORA',
    definition: {
      en: 'The four DHCP messages, in order: Discover (client broadcast, UDP 68 to 67), Offer (server proposes an address), Request (client broadcasts which offer it accepts, so the other servers release theirs), Acknowledge (server confirms lease and options). Mnemonic: D-O-R-A. A DHCPNAK refuses an invalid request, for example a client asking for an address from the wrong subnet.',
      it: 'I quattro messaggi DHCP, in ordine: Discover (broadcast del client, UDP 68 verso 67), Offer (il server propone un indirizzo), Request (il client comunica in broadcast quale offerta accetta, così gli altri server liberano la propria), Acknowledge (il server conferma lease e opzioni). Mnemonico: D-O-R-A. Un DHCPNAK rifiuta una richiesta non valida, per esempio un client che chiede un indirizzo della subnet sbagliata.'
    }
  },
  {
    term: 'Syslog Severity',
    definition: {
      en: 'Eight levels, 0 the most severe and 7 the most verbose: 0 Emergency, 1 Alert, 2 Critical, 3 Error, 4 Warning, 5 Notification, 6 Informational, 7 Debugging. Configuring logging trap 4 sends levels 0 through 4 — a threshold always includes every numerically lower level. Mnemonic: Every Awesome Cisco Engineer Will Need Ice cream Daily.',
      it: 'Otto livelli, 0 il più grave e 7 il più dettagliato: 0 Emergency, 1 Alert, 2 Critical, 3 Error, 4 Warning, 5 Notification, 6 Informational, 7 Debugging. Configurare logging trap 4 invia i livelli da 0 a 4: una soglia include sempre tutti i livelli numericamente inferiori. Mnemonico: Every Awesome Cisco Engineer Will Need Ice cream Daily.'
    }
  },
  {
    term: 'SNMPv3',
    definition: {
      en: 'The only secure version of SNMP, because v1 and v2c authenticate with a community string sent in cleartext. Its three security levels are noAuthNoPriv, authNoPriv (authentication and integrity, usually SHA) and authPriv (adds AES encryption) — authPriv is the one to deploy, together with restrictive views and an ACL on the agent.',
      it: 'L\'unica versione sicura di SNMP, perché v1 e v2c autenticano con una community string trasmessa in chiaro. I tre livelli di sicurezza sono noAuthNoPriv, authNoPriv (autenticazione e integrità, di norma SHA) e authPriv (aggiunge la cifratura AES): authPriv è quello da adottare, insieme a viste restrittive e a una ACL sull\'agent.'
    }
  },
  {
    term: 'NTP Stratum',
    definition: {
      en: 'The distance in hops from an authoritative clock: stratum 0 is the reference itself (atomic clock, GPS), stratum 1 a server directly attached to it, and each further hop adds one, up to 15; stratum 16 means unsynchronized. A lower stratum is preferred. Accurate time is a security prerequisite: without it logs cannot be correlated and certificate validity cannot be judged.',
      it: 'Distanza in hop da un orologio autorevole: stratum 0 è il riferimento stesso (orologio atomico, GPS), stratum 1 un server collegato direttamente a esso e ogni salto successivo aggiunge uno, fino a 15; stratum 16 significa non sincronizzato. Si preferisce lo stratum più basso. Un tempo accurato è un prerequisito di sicurezza: senza di esso i log non sono correlabili e la validità dei certificati non è valutabile.'
    }
  },
  {
    term: 'DSCP / PHB',
    definition: {
      en: 'Differentiated Services Code Point - The 6 bits of the IP header ToS/Traffic Class field that mark a packet, and the Per-Hop Behavior each device applies to that marking. EF (46) is the low-latency class for voice, AF41 (34) is typical for video, CS6 (48) for routing protocols, BE (0) is best effort. Marking alone does nothing: every hop must be configured to honor it, and the trust boundary decides where a marking may be believed.',
      it: 'Differentiated Services Code Point - I 6 bit del campo ToS/Traffic Class dell\'header IP che marcano un pacchetto, e il Per-Hop Behavior che ogni dispositivo applica a quella marcatura. EF (46) è la classe a bassa latenza per la voce, AF41 (34) è tipico per il video, CS6 (48) per i protocolli di routing, BE (0) è best effort. La sola marcatura non produce effetti: ogni hop deve essere configurato per rispettarla e la trust boundary stabilisce dove una marcatura può essere creduta.'
    }
  },

  // ---------------------------------------------------------------------------
  // CCNA 200-301 v1.1 — 5.0 Security Fundamentals
  // ---------------------------------------------------------------------------
  {
    term: 'ACL',
    definition: {
      en: 'Access Control List - An ordered list of permit/deny statements evaluated top-down, stopping at the first match, with an invisible deny ip any any at the end. A standard ACL filters on source only and belongs close to the destination; an extended ACL filters protocol, source, destination, and ports and belongs close to the source. Exam traps: order matters, an ACL with only deny statements blocks everything, and an ACL applied in the wrong direction filters nothing.',
      it: 'Access Control List - Elenco ordinato di istruzioni permit/deny valutate dall\'alto verso il basso, che si ferma alla prima corrispondenza, con un deny ip any any implicito in fondo. Una standard ACL filtra solo sulla sorgente e va posizionata vicino alla destinazione; una extended ACL filtra protocollo, sorgente, destinazione e porte e va posizionata vicino alla sorgente. Trappole d\'esame: l\'ordine conta, una ACL con soli deny blocca tutto e una ACL applicata nel verso sbagliato non filtra nulla.'
    }
  },
  {
    term: 'Port Security',
    definition: {
      en: 'Limits how many MAC addresses a switch access port may learn and what to do on violation: protect silently drops, restrict drops and logs/increments counters, shutdown (the default) puts the port in err-disable. Sticky learning writes the learned addresses into the running configuration. It is the first-line control against MAC flooding and against a hub or rogue switch plugged into a user port.',
      it: 'Limita quanti indirizzi MAC una porta di accesso può apprendere e definisce il comportamento in caso di violazione: protect scarta in silenzio, restrict scarta e registra/incrementa i contatori, shutdown (predefinito) mette la porta in err-disable. L\'apprendimento sticky scrive gli indirizzi appresi nella running configuration. È il controllo di prima linea contro il MAC flooding e contro un hub o uno switch non autorizzato collegato a una porta utente.'
    }
  },
  {
    term: 'DHCP Snooping',
    definition: {
      en: 'A switch feature that classifies ports as trusted (toward the legitimate DHCP server or another switch) or untrusted (toward clients) and drops server messages — OFFER, ACK, NAK — arriving on untrusted ports, which stops rogue DHCP servers. It also rate-limits client requests against starvation and builds the IP-to-MAC-to-port binding table that Dynamic ARP Inspection and IP Source Guard depend on.',
      it: 'Funzionalità dello switch che classifica le porte come trusted (verso il server DHCP legittimo o un altro switch) o untrusted (verso i client) e scarta i messaggi da server — OFFER, ACK, NAK — che arrivano su porte untrusted, bloccando così i server DHCP non autorizzati. Applica inoltre un rate limit alle richieste dei client contro lo starvation e costruisce la tabella di binding IP-MAC-porta da cui dipendono Dynamic ARP Inspection e IP Source Guard.'
    }
  },
  {
    term: 'WPA2 / WPA3',
    definition: {
      en: 'WPA2 uses AES-CCMP with a 4-way handshake; its Personal mode derives the key from a shared passphrase, which makes the handshake capturable and brute-forceable offline. WPA3-Personal replaces that with SAE (Simultaneous Authentication of Equals, a dragonfly handshake) which resists offline cracking and provides forward secrecy, and makes Protected Management Frames mandatory against deauthentication attacks. Enterprise mode of either uses 802.1X/EAP instead of a shared secret.',
      it: 'WPA2 usa AES-CCMP con un handshake a 4 vie; in modalità Personal la chiave deriva da una passphrase condivisa, il che rende l\'handshake catturabile e attaccabile offline a forza bruta. WPA3-Personal lo sostituisce con SAE (Simultaneous Authentication of Equals, handshake dragonfly), che resiste al cracking offline e fornisce forward secrecy, e rende obbligatori i Protected Management Frame contro gli attacchi di deautenticazione. La modalità Enterprise di entrambi usa 802.1X/EAP invece di un segreto condiviso.'
    }
  },
  {
    term: 'MFA',
    definition: {
      en: 'Multi-Factor Authentication - Requires two or more independent factors: something you know (password), something you have (token, smart card, phone), something you are (biometrics). Two passwords are not MFA. Phishing-resistant factors (FIDO2/WebAuthn, certificates) also defeat adversary-in-the-middle proxies, which push notifications and OTP codes do not.',
      it: 'Multi-Factor Authentication - Richiede due o più fattori indipendenti: qualcosa che si conosce (password), qualcosa che si possiede (token, smart card, telefono), qualcosa che si è (biometria). Due password non sono MFA. I fattori resistenti al phishing (FIDO2/WebAuthn, certificati) neutralizzano anche i proxy adversary-in-the-middle, cosa che notifiche push e codici OTP non fanno.'
    }
  },

  // ---------------------------------------------------------------------------
  // CCNA 200-301 v1.1 — 6.0 Automation and Programmability
  // ---------------------------------------------------------------------------
  {
    term: 'SDN',
    definition: {
      en: 'Software-Defined Networking - An architecture that separates the control plane from the data plane and centralizes it in a controller holding the network-wide view. Applications express intent through northbound APIs (usually REST), and the controller programs the devices through southbound interfaces (NETCONF, RESTCONF, OpenFlow, gRPC). The devices keep forwarding traffic in their own data plane.',
      it: 'Software-Defined Networking - Architettura che separa il control plane dal data plane e lo centralizza in un controller che possiede la vista complessiva della rete. Le applicazioni esprimono l\'intento tramite API northbound (di norma REST) e il controller programma i dispositivi tramite interfacce southbound (NETCONF, RESTCONF, OpenFlow, gRPC). I dispositivi continuano a inoltrare il traffico nel proprio data plane.'
    }
  },
  {
    term: 'Underlay / Overlay / Fabric',
    definition: {
      en: 'The underlay is the physical IP network that simply provides reachability between nodes and tunnel endpoints; the overlay is the logical topology built on top of it with tunnels (VXLAN, GRE) that carries tenants and policy independently of the cabling; the fabric is the whole coordinated system — underlay, overlay, controller, and policy. The overlay cannot be stable if the underlay has not converged.',
      it: 'L\'underlay è la rete IP fisica che fornisce semplicemente raggiungibilità tra nodi e tunnel endpoint; l\'overlay è la topologia logica costruita sopra di esso con tunnel (VXLAN, GRE) che trasporta tenant e policy in modo indipendente dal cablaggio; il fabric è l\'intero sistema coordinato: underlay, overlay, controller e policy. L\'overlay non può essere stabile se l\'underlay non è converso.'
    }
  },
  {
    term: 'REST API',
    definition: {
      en: 'Representational State Transfer - A stateless HTTP interface where each URI identifies a resource and the verb states the CRUD operation: GET reads (safe and idempotent), POST creates (neither), PUT replaces and PATCH partially updates, DELETE removes (both idempotent). Status families: 2xx success, 3xx redirect, 4xx client error (401 not authenticated, 403 not authorized, 429 rate-limited), 5xx server error.',
      it: 'Representational State Transfer - Interfaccia HTTP stateless in cui ogni URI identifica una risorsa e il verbo indica l\'operazione CRUD: GET legge (safe e idempotente), POST crea (né l\'uno né l\'altro), PUT sostituisce e PATCH aggiorna parzialmente, DELETE rimuove (entrambi idempotenti). Famiglie di stato: 2xx successo, 3xx redirect, 4xx errore del client (401 non autenticato, 403 non autorizzato, 429 rate limit), 5xx errore del server.'
    }
  },
  {
    term: 'Idempotency',
    definition: {
      en: 'A request or task is idempotent when repeating it leaves the system in the same final state as running it once — the property that makes automation safe to re-run. PUT and DELETE are idempotent, POST is not. It says nothing about the response: a second DELETE legitimately returns 404 while the state, the resource being absent, is unchanged.',
      it: 'Una richiesta o un task è idempotente quando ripeterla lascia il sistema nello stesso stato finale di una singola esecuzione: è la proprietà che rende sicuro rieseguire l\'automazione. PUT e DELETE sono idempotenti, POST no. Non dice nulla sulla risposta: una seconda DELETE può legittimamente restituire 404 mentre lo stato, ossia l\'assenza della risorsa, resta invariato.'
    }
  },
  {
    term: 'JSON',
    definition: {
      en: 'JavaScript Object Notation - The data-encoding format of most REST APIs. Six value types: object in braces with "key": value pairs, array in square brackets, string in double quotes, number, boolean, null. Keys are always quoted strings, the last element never takes a trailing comma, and standard JSON has no comments.',
      it: 'JavaScript Object Notation - Formato di codifica dati della maggior parte delle REST API. Sei tipi di valore: object tra parentesi graffe con coppie "chiave": valore, array tra parentesi quadre, string tra virgolette doppie, number, boolean, null. Le chiavi sono sempre stringhe tra virgolette, l\'ultimo elemento non prende mai la virgola finale e il JSON standard non ammette commenti.'
    }
  },
  {
    term: 'NETCONF / RESTCONF',
    definition: {
      en: 'Southbound protocols for programmatic configuration. NETCONF runs over SSH (TCP 830), encodes in XML, and offers transactions with candidate/running datastores and commit or rollback; RESTCONF runs over HTTPS, uses REST verbs, and encodes in JSON or XML. Both describe the data with YANG models, which define structure, types, and constraints but are not a transport format.',
      it: 'Protocolli southbound per la configurazione programmatica. NETCONF funziona su SSH (TCP 830), codifica in XML e offre transazioni con datastore candidate/running e commit o rollback; RESTCONF funziona su HTTPS, usa i verbi REST e codifica in JSON o XML. Entrambi descrivono i dati con modelli YANG, che definiscono struttura, tipi e vincoli ma non sono un formato di trasporto.'
    }
  },
  {
    term: 'Ansible / Terraform',
    definition: {
      en: 'Ansible is agentless and usually push-based: YAML playbooks are executed over SSH or an API against an inventory, and well-written modules converge idempotently. Terraform is declarative with a plan/apply workflow: HCL describes the desired resources and a state file tracks what exists, so the plan shows the diff before anything changes. That state file contains sensitive data and must be protected.',
      it: 'Ansible è agentless e di norma push: i playbook YAML sono eseguiti via SSH o API su un inventory e i moduli scritti correttamente convergono in modo idempotente. Terraform è dichiarativo con flusso plan/apply: l\'HCL descrive le risorse desiderate e un file di state traccia ciò che esiste, così il plan mostra la differenza prima di qualsiasi modifica. Quel file di state contiene dati sensibili e va protetto.'
    }
  },
  {
    term: 'Configuration Drift',
    definition: {
      en: 'The gap that opens between the intended configuration held in the source of truth and the state actually running on the devices, caused by manual changes, failed rollouts, or partial rollbacks. It makes outcomes non-reproducible and silently reopens security exposure, which is why automation pipelines add periodic diffs, reconciliation, and policy as code.',
      it: 'Divario che si apre tra la configurazione voluta, custodita nella source of truth, e lo stato realmente in esecuzione sui dispositivi, causato da modifiche manuali, rollout falliti o rollback parziali. Rende i risultati non riproducibili e riapre silenziosamente esposizioni di sicurezza: per questo le pipeline di automazione aggiungono diff periodici, reconciliation e policy as code.'
    }
  }
];

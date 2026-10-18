import { mergePortRegistry } from './portRegistry';
import type { PortContent, PortInfo } from './portsExplorerTypes';

export const PORT_CONTENT: PortContent[] = [
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
      it: "Utilizzato per l'invio di comandi e credenziali di autenticazione."
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
      it: "Consente l'accesso crittografato sicuro a terminali remoti e trasferimenti file (SFTP)."
    },
    security: {
      en: 'Use modern SSH, verify host keys, require strong authentication and restrict administrator access.',
      it: 'Usare SSH moderno, verificare le chiavi host, richiedere autenticazione robusta e limitare gli accessi amministrativi.'
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
      en: 'High risk: all data, including usernames and passwords, travels in cleartext. Replace with SSH.',
      it: 'Rischio elevato: tutti i dati, inclusi utenti e password, viaggiano in chiaro. Sostituire con SSH.'
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
      it: "Protocollo standard per l'invio e l'instradamento delle email tra i server."
    },
    security: {
      en: 'STARTTLS protects a transport hop when negotiated and validated. SPF/DKIM/DMARC address domain impersonation, not all spam.',
      it: 'STARTTLS protegge un tratto di trasporto se negoziato e validato. SPF/DKIM/DMARC contrastano la falsificazione del dominio, non tutto lo spam.'
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
      en: 'AAA protocol for network device administration, documented in RFC 8907.',
      it: 'Protocollo AAA per amministrare apparati di rete, documentato nella RFC 8907.'
    },
    security: {
      en: 'Legacy body obfuscation is not strong encryption and lacks integrity protection. Isolate management traffic and protect its transport.',
      it: 'L’offuscamento legacy del corpo non è cifratura robusta e manca la protezione di integrità. Isolare il traffico di gestione e proteggerne il trasporto.'
    },
    isSecure: false
  },
  {
    port: 53,
    service: 'DNS',
    name: 'Domain Name System',
    type: 'Both',
    range: 'well-known',
    description: {
      en: 'Translates domain names (like example.com) to machine-readable IP addresses.',
      it: 'Traduce i nomi di dominio (come example.com) in indirizzi IP leggibili dalle macchine.'
    },
    security: {
      en: 'Cleartext DNS permits interception and spoofing. DNSSEC authenticates records without encryption; DoT or DoH encrypts the connection to the resolver.',
      it: 'DNS in chiaro espone a intercettazione e spoofing. DNSSEC autentica i record senza cifrarli; DoT o DoH cifra la connessione al resolver.'
    },
    isSecure: false
  },
  {
    port: '67 / 68',
    service: 'DHCP',
    name: 'Dynamic Host Configuration Protocol',
    type: 'UDP',
    range: 'well-known',
    description: {
      en: 'Assigns IPv4 addresses and network settings: server UDP 67, client UDP 68.',
      it: 'Assegna indirizzi IPv4 e parametri di rete: server UDP 67, client UDP 68.'
    },
    security: {
      en: 'Rogue servers and address exhaustion are risks. Configure DHCP snooping with trusted ports and suitable rate limits.',
      it: 'Server abusivi ed esaurimento degli indirizzi sono rischi. Configurare DHCP snooping con porte fidate e limiti di frequenza adeguati.'
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
      en: 'No encryption or authentication. Restrict transfers to isolated, controlled networks.',
      it: 'Nessuna cifratura o autenticazione. Limitare i trasferimenti a reti isolate e controllate.'
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
      en: 'Uses tickets to authenticate clients and services; mutual authentication depends on the exchange.',
      it: 'Usa ticket per autenticare client e servizi; l’autenticazione reciproca dipende dallo scambio.'
    },
    security: {
      en: 'Protect service and domain keys: their compromise can enable Silver Ticket or Golden Ticket forgery.',
      it: 'Proteggere le chiavi dei servizi e del dominio: la loro compromissione può consentire falsificazioni Silver Ticket o Golden Ticket.'
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
      en: 'Retrieves mail; deletion from the server depends on client commands and policy.',
      it: 'Recupera la posta; la rimozione dal server dipende dai comandi e dalla politica del client.'
    },
    security: {
      en: 'Avoid cleartext credentials. Use POP3S on 995 with certificate validation.',
      it: 'Evitare credenziali in chiaro. Usare POP3S su 995 con validazione del certificato.'
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
      en: 'Cleartext traffic can be intercepted. Use NNTPS with modern TLS and certificate validation.',
      it: 'Il traffico in chiaro è intercettabile. Usare NNTPS con TLS moderno e validazione del certificato.'
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
      it: "Sincronizza gli orologi dei dispositivi e dei sistemi all'interno della rete."
    },
    security: {
      en: 'Exposed servers can enable reflection/amplification attacks (DRDoS). Restrict queries and maintain updated software.',
      it: 'Server esposti possono consentire attacchi di riflessione/amplificazione (DRDoS). Limitare le query e aggiornare il software.'
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
      en: 'Maps Microsoft RPC services to their endpoints; subsequent connections can use dynamic ports.',
      it: 'Associa servizi Microsoft RPC ai relativi endpoint; le connessioni successive possono usare porte dinamiche.'
    },
    security: {
      en: 'Can expose service information. Allow only required clients and endpoints through the firewall.',
      it: 'Può esporre informazioni sui servizi. Consentire sul firewall soltanto client ed endpoint necessari.'
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
      en: 'Legacy file sharing can expose service information. Restrict access and prefer supported SMB directly on 445.',
      it: 'La condivisione legacy può esporre informazioni sui servizi. Limitare gli accessi e preferire SMB supportato direttamente su 445.'
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
      en: 'Avoid cleartext authentication. IMAPS on 993 uses implicit TLS; validate the server certificate.',
      it: 'Evitare autenticazione in chiaro. IMAPS su 993 usa TLS implicito; validare il certificato del server.'
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
      en: 'SNMP v1/v2c exposes community strings. Configure SNMPv3 authPriv for authentication and encryption; version alone is insufficient.',
      it: 'SNMP v1/v2c espone le community string. Configurare SNMPv3 authPriv per autenticazione e cifratura; la sola versione non basta.'
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
      en: 'Unauthenticated alerts can be forged. Configure SNMPv3 authPriv and restrict authorized senders.',
      it: 'Gli avvisi non autenticati sono falsificabili. Configurare SNMPv3 authPriv e limitare i mittenti autorizzati.'
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
      en: 'Exchanges reachability and selects routes between Autonomous Systems (AS) on the Internet.',
      it: 'Scambia informazioni di raggiungibilità e seleziona rotte tra sistemi autonomi (AS) su Internet.'
    },
    security: {
      en: 'The TCP session is not encrypted: TCP-MD5 or TCP-AO only authenticate the peer. Vulnerable to hijacking and route leaks, mitigated by prefix filtering, max-prefix limits, RPKI origin validation, and GTSM/TTL security.',
      it: "La sessione TCP non è cifrata: TCP-MD5 o TCP-AO autenticano soltanto il peer. Vulnerabile a hijacking e route leak, mitigati con prefix filtering, limiti max-prefix, validazione dell'origine RPKI e GTSM/TTL security."
    },
    isSecure: false
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
      en: 'Simple bind can expose passwords without transport protection. Require STARTTLS or LDAPS (636) and validate certificates.',
      it: 'Il simple bind può esporre password senza protezione del trasporto. Richiedere STARTTLS o LDAPS (636) e validare i certificati.'
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
      en: 'Protects web communication using TLS and certificate-based server authentication.',
      it: 'Protegge la comunicazione web tramite TLS e autenticazione del server basata su certificati.'
    },
    security: {
      en: 'Validate certificates and use modern TLS. Encryption does not establish that a website or its content is trustworthy.',
      it: 'Validare i certificati e usare TLS moderno. La cifratura non dimostra che un sito o i suoi contenuti siano affidabili.'
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
      it: "Fornisce l'accesso condiviso a file, stampanti e porte seriali all'interno di reti locali."
    },
    security: {
      en: 'Disable SMBv1 and patch systems. Require signing for integrity and SMBv3 encryption for confidentiality; restrict access.',
      it: 'Disabilitare SMBv1 e aggiornare i sistemi. Richiedere firma per integrità e cifratura SMBv3 per riservatezza; limitare gli accessi.'
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
      en: 'Client message submission over implicit TLS; distinct from server-to-server relay on 25.',
      it: 'Invio della posta dal client con TLS implicito; distinto dal relay tra server su 25.'
    },
    security: {
      en: 'Validate certificates and authenticate users. Transport encryption does not provide end-to-end message encryption.',
      it: 'Validare i certificati e autenticare gli utenti. La cifratura del trasporto non cifra i messaggi da mittente a destinatario.'
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
      en: 'Sends system events and diagnostic logs to a collector.',
      it: 'Invia eventi di sistema e log diagnostici a un collettore.'
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
      en: 'Client message submission, commonly upgraded with STARTTLS. Does not replace server-to-server relay on 25.',
      it: 'Invio della posta dal client, comunemente protetto con STARTTLS. Non sostituisce il relay tra server su 25.'
    },
    security: {
      en: 'Require STARTTLS before credentials or messages, validate certificates and enforce authentication. Port 587 alone provides no encryption.',
      it: 'Richiedere STARTTLS prima di credenziali o messaggi, validare i certificati e imporre autenticazione. La porta 587 da sola non cifra.'
    },
    isSecure: true
  },
  {
    port: 636,
    service: 'LDAPS',
    name: 'LDAP Secure (over TLS)',
    type: 'TCP',
    range: 'well-known',
    description: {
      en: 'LDAP directory access over an implicit TLS connection.',
      it: 'Accesso alle directory LDAP tramite una connessione TLS implicita.'
    },
    security: {
      en: 'Validate certificates and restrict directory permissions; TLS protects transport, not authorization policy.',
      it: 'Validare i certificati e limitare i permessi sulla directory; TLS protegge il trasporto, non la politica di autorizzazione.'
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
      en: 'Accesses mail over implicit TLS between client and server.',
      it: 'Accede alla posta tramite TLS implicito tra client e server.'
    },
    security: {
      en: 'Validate server certificates. This protects the connection, not messages end-to-end between correspondents.',
      it: 'Validare i certificati del server. Protegge la connessione, non i messaggi da mittente a destinatario.'
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
      en: 'Validate server certificates to protect credentials and messages in transit between client and server.',
      it: 'Validare i certificati del server per proteggere credenziali e messaggi in transito tra client e server.'
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
      en: 'Restrict SQL access to authorized clients, require TLS and strong authentication.',
      it: 'Limitare gli accessi SQL ai client autorizzati, richiedere TLS e autenticazione robusta.'
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
      it: "Vulnerabile a enumerazione del database se l'endpoint del listener è pubblico."
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
      en: 'Use standard port 1812 for interoperability. Changing the port does not add encryption or repair protocol weaknesses.',
      it: 'Usare la porta standard 1812 per interoperabilità. Cambiare porta non aggiunge cifratura né risolve debolezze del protocollo.'
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
      en: 'Legacy port for collecting session usage and accounting records.',
      it: 'Porta legacy per raccogliere dati di utilizzo delle sessioni e registrazioni di accounting.'
    },
    security: {
      en: 'Use standard port 1813 for interoperability. Protect the transport: changing the port does not encrypt accounting records.',
      it: 'Usare la porta standard 1813 per interoperabilità. Proteggere il trasporto: cambiare porta non cifra i dati di accounting.'
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
      it: "Porta standard per l'autenticazione centralizzata aziendale di connessioni VPN e Wi-Fi Corporate."
    },
    security: {
      en: 'Shared secrets do not encrypt the entire packet. Use protected transport such as IPsec or supported RADIUS over TLS; a VLAN does not encrypt.',
      it: 'I segreti condivisi non cifrano l’intero pacchetto. Usare trasporto protetto come IPsec o RADIUS su TLS se supportato; una VLAN non cifra.'
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
      en: 'Accounting data needs protected transport and restricted peers. A private subnet alone provides no encryption.',
      it: 'I dati di accounting richiedono trasporto protetto e peer autorizzati. Una sottorete privata da sola non cifra.'
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
      en: 'This project configures Vite on 3000; the Vite default is 5173. Development ports are configurable.',
      it: 'Questo progetto configura Vite su 3000; il valore predefinito di Vite è 5173. Le porte di sviluppo sono configurabili.'
    },
    security: {
      en: 'Plain HTTP with no authentication by default, plus verbose errors and source maps. Bind it to localhost only and never expose a development server on a public interface.',
      it: "HTTP in chiaro e senza autenticazione per impostazione predefinita, con errori verbosi e source map. Va vincolata solo a localhost e un server di sviluppo non va mai esposto su un'interfaccia pubblica."
    },
    isSecure: false
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
      en: 'Restrict access to authorized clients, require TLS and use least-privilege accounts with strong authentication.',
      it: 'Limitare gli accessi ai client autorizzati, richiedere TLS e usare account con privilegi minimi e autenticazione robusta.'
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
      en: 'Provides graphical remote desktop access to physical or virtual systems.',
      it: 'Fornisce accesso grafico al desktop remoto di sistemi fisici o virtuali.'
    },
    security: {
      en: 'Patch hosts, require NLA and restrict exposure through a managed gateway or VPN with MFA.',
      it: 'Aggiornare gli host, richiedere NLA e limitare l’esposizione tramite gateway gestito o VPN con MFA.'
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
      en: 'Enables network connections to the PostgreSQL object-relational database.',
      it: 'Abilita connessioni di rete al database relazionale a oggetti PostgreSQL.'
    },
    security: {
      en: 'Restrict client IP addresses in pg_hba.conf; prefer SCRAM-SHA-256 authentication and require TLS.',
      it: 'Limitare gli indirizzi IP dei client in pg_hba.conf; preferire autenticazione SCRAM-SHA-256 e richiedere TLS.'
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
      en: 'In-memory key-value database for caching and session storage.',
      it: 'Database in memoria a chiave-valore per cache e archiviazione delle sessioni.'
    },
    security: {
      en: 'Protected mode reduces accidental exposure. Still configure ACL permissions, TLS and network restrictions.',
      it: 'La modalità protetta riduce l’esposizione accidentale. Configurare comunque permessi ACL, TLS e restrizioni di rete.'
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
      it: "Protocollo ufficiale per l'invio crittografato di log di eventi di sistema protetto da TLS."
    },
    security: {
      en: 'TLS protects logs in transit. Configure certificate validation and authorized peers; mutual authentication is not automatic.',
      it: 'TLS protegge i log in transito. Configurare validazione dei certificati e peer autorizzati; l’autenticazione reciproca non è automatica.'
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
      en: 'Alternate port for web services and application proxies, including Apache Tomcat.',
      it: 'Porta alternativa per servizi web e proxy applicativi, incluso Apache Tomcat.'
    },
    security: {
      en: 'Changing the port does not secure HTTP. Require encrypted transport and restrict administrative interfaces.',
      it: 'Cambiare porta non protegge HTTP. Richiedere trasporto cifrato e limitare le interfacce amministrative.'
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
      en: 'Default listening port for the MongoDB document-oriented NoSQL database.',
      it: 'Porta di ascolto predefinita del database NoSQL MongoDB orientato ai documenti.'
    },
    security: {
      en: 'Enable authentication, role-based authorization and TLS; restrict network access to authorized clients.',
      it: 'Abilitare autenticazione, autorizzazione basata sui ruoli e TLS; limitare gli accessi di rete ai client autorizzati.'
    },
    isSecure: false
  }
];

export const PORT_REGISTRY: PortInfo[] = mergePortRegistry(PORT_CONTENT);

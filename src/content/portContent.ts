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
      en: 'Translates domain names (like example.com) to machine-readable IP addresses.',
      it: 'Traduce i nomi di dominio (come example.com) in indirizzi IP leggibili dalle macchine.'
    },
    security: {
      en: 'Cleartext by default: queries and answers are readable and forgeable. Target for DNS spoofing, cache poisoning, tunneling, and reflection/amplification. DNSSEC signs the records (authenticity and integrity) but does not encrypt; confidentiality requires DoT (TCP 853) or DoH (TCP 443).',
      it: 'In chiaro per impostazione predefinita: query e risposte sono leggibili e falsificabili. Bersaglio di DNS spoofing, cache poisoning, tunneling e reflection/amplification. DNSSEC firma i record (autenticità e integrità) ma non cifra; per la riservatezza servono DoT (TCP 853) o DoH (TCP 443).'
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
      en: 'The TCP session is not encrypted: TCP-MD5 or TCP-AO only authenticate the peer. Vulnerable to hijacking and route leaks, mitigated by prefix filtering, max-prefix limits, RPKI origin validation, and GTSM/TTL security.',
      it: 'La sessione TCP non è cifrata: TCP-MD5 o TCP-AO autenticano soltanto il peer. Vulnerabile a hijacking e route leak, mitigati con prefix filtering, limiti max-prefix, validazione dell\'origine RPKI e GTSM/TTL security.'
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
      en: 'Plain HTTP with no authentication by default, plus verbose errors and source maps. Bind it to localhost only and never expose a development server on a public interface.',
      it: 'HTTP in chiaro e senza autenticazione per impostazione predefinita, con errori verbosi e source map. Va vincolata solo a localhost e un server di sviluppo non va mai esposto su un\'interfaccia pubblica.'
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

export const PORT_REGISTRY: PortInfo[] = mergePortRegistry(PORT_CONTENT);

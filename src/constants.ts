import { LayerData, AttackScenario, AttackWalkthrough } from './types';

export const OSI_LAYERS: LayerData[] = [
  {
    id: 7,
    name: 'Application',
    color: '#ef4444',
    pdu: 'Data',
    translations: {
      en: {
        name: 'Application Layer',
        description: 'The topmost layer — the interface between network services and end-user applications. It defines protocols that applications use to communicate over the network, handling everything from web browsing to email transfer.',
        responsibilities: [
          'Interface for end-user network services',
          'Resource sharing and device redirection',
          'Network management and error notification',
          'User authentication and identification'
        ],
        useCases: [
          'Web Browsing (HTTP/HTTPS)',
          'Electronic Mail (SMTP/IMAP/POP3)',
          'File Transfer (FTP/SFTP)',
          'Domain Name Resolution (DNS)'
        ],
        protocols: ['HTTP/HTTPS', 'DNS', 'FTP', 'SMTP', 'SSH', 'SNMP'],
        keyFacts: [
          'This layer does NOT refer to the application itself (e.g., Chrome), but to the protocols it uses.',
          'DNS operates here — every domain name lookup traverses this layer before any connection starts.',
          'HTTP is stateless by design; cookies and sessions at higher layers simulate stateful behavior.'
        ],
        attacks: [
          {
            name: 'SQL Injection',
            type: 'injection',
            description: 'Attacker inserts malicious SQL code into input fields that are concatenated into database queries.',
            howItWorks: '1. Attacker finds an input field that talks to a DB.\n2. Enters payload like \' OR 1=1 --\n3. Backend naively concatenates it into a query.\n4. Database executes the injected logic, leaking or corrupting data.',
            impact: 'Full database compromise, data theft, authentication bypass, data deletion.',
            mitigation_strategy: 'Use parameterized queries (prepared statements) and ORM frameworks. Never concatenate user input into SQL strings.',
            severity: 'critical',
            protocols: ['HTTP']
          },
          {
            name: 'Cross-Site Scripting (XSS)',
            description: 'Attacker injects malicious JavaScript into web pages viewed by other users.',
            howItWorks: '1. Attacker submits <script>alert(document.cookie)</script> into a comment field.\n2. Server stores it without sanitization.\n3. Victim loads the page — their browser executes the script.\n4. Attacker receives cookies / session tokens.',
            impact: 'Session hijacking, credential theft, defacement, malware delivery.',
            mitigation_strategy: 'Sanitize all user-generated output. Use Content Security Policy (CSP) headers. Encode HTML entities.',
            severity: 'high',
            protocols: ['HTTP']
          },
          {
            name: 'Broken Access Control (BAC)',
            description: 'Users can access resources outside of their intended permissions due to weak implementation of access checks.',
            howItWorks: '1. Application fails to check if the user is authorized for an action.\n2. Attacker modifies a URL from /user/profile to /admin/settings.\n3. Server serves restricted data without verifying admin role.',
            impact: 'Privilege escalation, unauthorized data access, system-wide compromise.',
            mitigation_strategy: 'Implement centralized authorization checks. Deny access by default. Follow the principle of least privilege.',
            severity: 'critical',
            protocols: ['HTTP', 'FTP']
          },
          {
            name: 'HTTP DDoS (Layer 7)',
            description: 'Attacker floods the server with seemingly legitimate HTTP requests, exhausting server resources.',
            howItWorks: '1. Attacker controls a botnet of thousands of machines.\n2. Each machine sends rapid GET/POST requests to the target.\n3. Server spends CPU/RAM handling each request.\n4. Legitimate users cannot get a response.',
            impact: 'Complete service unavailability, revenue loss, reputational damage.',
            mitigation_strategy: 'Deploy a WAF with rate limiting, CAPTCHA challenges, and behavior-based bot detection.',
            severity: 'high',
            protocols: ['HTTP']
          },
          {
            name: 'DNS Spoofing / Cache Poisoning',
            description: 'Attacker corrupts a DNS resolver\'s cache to redirect users to malicious IP addresses.',
            howItWorks: '1. Attacker sends forged DNS responses to a resolver before the legitimate one arrives.\n2. Resolver caches the fake IP.\n3. Users querying that resolver get redirected to attacker\'s server.\n4. Attacker can intercept credentials or serve malware.',
            impact: 'Phishing, credential theft, malware distribution at scale.',
            mitigation_strategy: 'Deploy DNSSEC (DNS Security Extensions) to cryptographically sign DNS records.',
            severity: 'critical',
            protocols: ['DNS']
          },
          {
            name: 'Slowloris',
            description: 'A denial-of-service attack that enables one machine to take down another machine\'s web server with minimal bandwidth.',
            howItWorks: '1. Attacker opens multiple connections to the target web server.\n2. Sends partial HTTP requests but never completes them.\n3. Periodically sends subsequent headers to keep the connections open.\n4. Server connection pool is exhausted, denying service to legitimate users.',
            impact: 'Complete web service unavailability.',
            mitigation_strategy: 'Limit the number of concurrent connections per IP. Use the latest web server software.',
            severity: 'high',
            protocols: ['HTTP']
          }
        ],
        defenses: [
          {
            name: 'Web Application Firewall (WAF)',
            description: 'Filters, monitors, and blocks HTTP traffic based on a set of rules to protect web applications.',
            method: 'Inspects request payload, headers, and patterns against signature databases and behavioral rules.',
            counters: ['HTTP DDoS (Layer 7)', 'SQL Injection', 'Cross-Site Scripting (XSS)', 'Broken Access Control (BAC)']
          },
          {
            name: 'Identity & Access Management (IAM)',
            description: 'Framework of policies and technologies for ensuring that the right users have the appropriate access to technology resources.',
            method: 'Centralized authentication and authorization. RBAC (Role-Based Access Control) or ABAC (Attribute-Based Access Control).',
            counters: ['Broken Access Control (BAC)']
          },
          {
            name: 'Input Validation & Sanitization',
            description: 'Ensuring all user-supplied data is checked for type, length, format, and range before processing.',
            method: 'Allowlist validation on server side; HTML entity encoding for output; reject malformed input.',
            counters: ['SQL Injection', 'Cross-Site Scripting (XSS)']
          },
          {
            name: 'Content Security Policy (CSP)',
            description: 'HTTP response header that tells the browser which sources of content are trusted.',
            method: 'Restricts inline scripts and unauthorized third-party resource loading via strict directives.',
            counters: ['Cross-Site Scripting (XSS)']
          },
          {
            name: 'DNSSEC',
            description: 'Adds cryptographic signatures to DNS records, allowing resolvers to verify authenticity.',
            method: 'DNS responses are signed; resolvers validate the chain of trust from root to TLD to domain.',
            counters: ['DNS Spoofing / Cache Poisoning']
          }
        ]
      },
      it: {
        name: 'Livello Applicazione',
        description: 'Il livello più vicino all\'utente — l\'interfaccia tra i servizi di rete e le applicazioni. Definisce i protocolli usati dalle applicazioni per comunicare in rete, dalla navigazione web al trasferimento email.',
        responsibilities: [
          'Interfaccia per i servizi di rete dell\'utente finale',
          'Condivisione di risorse e reindirizzamento dei dispositivi',
          'Gestione della rete e notifica degli errori',
          'Autenticazione e identificazione dell\'utente'
        ],
        useCases: [
          'Navigazione Web (HTTP/HTTPS)',
          'Posta Elettronica (SMTP/IMAP/POP3)',
          'Trasferimento File (FTP/SFTP)',
          'Risoluzione dei Nomi di Dominio (DNS)'
        ],
        protocols: ['HTTP/HTTPS', 'DNS', 'FTP', 'SMTP', 'SSH', 'SNMP'],
        keyFacts: [
          'Questo livello NON si riferisce all\'applicazione stessa (es. Chrome), ma ai protocolli che essa usa.',
          'Il DNS opera qui — ogni risoluzione di nome dominio attraversa questo livello prima di qualsiasi connessione.',
          'HTTP è senza stato per design; cookie e sessioni simulano comportamenti stateful.'
        ],
        attacks: [
          {
            name: 'SQL Injection',
            type: 'injection',
            description: 'L\'attaccante inserisce codice SQL malevolo nei campi di input che vengono concatenati nelle query del database.',
            howItWorks: '1. L\'attaccante trova un campo di input collegato a un DB.\n2. Inserisce payload come \' OR 1=1 --\n3. Il backend lo concatena ingenuamente nella query.\n4. Il database esegue la logica iniettata, rivelando o corrompendo i dati.',
            impact: 'Compromissione completa del database, furto di dati, bypass dell\'autenticazione.',
            mitigation_strategy: 'Usa query parametrizzate (prepared statements) e ORM. Non concatenare mai input utente in stringhe SQL.',
            severity: 'critical',
            protocols: ['HTTP']
          },
          {
            name: 'Cross-Site Scripting (XSS)',
            description: 'L\'attaccante inietta JavaScript malevolo in pagine web visualizzate da altri utenti.',
            howItWorks: '1. L\'attaccante invia <script>alert(document.cookie)</script> in un campo commento.\n2. Il server lo salva senza sanificazione.\n3. La vittima carica la pagina — il browser esegue lo script.\n4. L\'attaccante riceve cookie/token di sessione.',
            impact: 'Furto di sessione, furto di credenziali, defacement, distribuzione di malware.',
            mitigation_strategy: 'Sanifica tutto l\'output generato dagli utenti. Usa header CSP. Codifica le entità HTML.',
            severity: 'high',
            protocols: ['HTTP']
          },
          {
            name: 'Controllo Accessi Difettoso (BAC)',
            description: 'Gli utenti possono accedere a risorse al di fuori della loro autorizzazione a causa di controlli degli accessi deboli.',
            howItWorks: '1. L\'applicazione non verifica correttamente se l\'utente è autorizzato.\n2. L\'attaccante modifica un URL da /utente/profilo a /admin/impostazioni.\n3. Il server serve dati riservati senza verificare il ruolo di amministratore.',
            impact: 'Privilege escalation, accesso non autorizzato ai dati, compromissione dell\'intero sistema.',
            mitigation_strategy: 'Implementa controlli di autorizzazione centralizzati. Nega l\'accesso di default (Default Deny). Segui il principio del minimo privilegio.',
            severity: 'critical',
            protocols: ['HTTP', 'FTP']
          },
          {
            name: 'HTTP DDoS (Livello 7)',
            description: 'L\'attaccante inonda il server con richieste HTTP apparentemente legittime, esaurendo le risorse.',
            howItWorks: '1. L\'attaccante controlla una botnet di migliaia di macchine.\n2. Ogni macchina invia richieste GET/POST rapide al target.\n3. Il server consuma CPU/RAM per ogni richiesta.\n4. Gli utenti legittimi non ricevono risposta.',
            impact: 'Indisponibilità completa del servizio, perdita di fatturato, danni reputazionali.',
            mitigation_strategy: 'Distribuisci un WAF con rate limiting, CAPTCHA e rilevamento bot comportamentale.',
            severity: 'high',
            protocols: ['HTTP']
          },
          {
            name: 'DNS Spoofing / Cache Poisoning',
            description: 'L\'attaccante corrompe la cache di un resolver DNS per reindirizzare gli utenti verso IP malevoli.',
            howItWorks: '1. L\'attaccante invia risposte DNS false al resolver prima di quelle legittime.\n2. Il resolver memorizza l\'IP falso.\n3. Gli utenti vengono reindirizzati al server dell\'attaccante.\n4. L\'attaccante intercetta credenziali o serve malware.',
            impact: 'Phishing, furto di credenziali, distribuzione di malware su larga scala.',
            mitigation_strategy: 'Distribuisci DNSSEC per firmare crittograficamente i record DNS.',
            severity: 'critical',
            protocols: ['DNS']
          }
        ],
        defenses: [
          {
            name: 'Web Application Firewall (WAF)',
            description: 'Filtra, monitora e blocca il traffico HTTP per proteggere le applicazioni web.',
            method: 'Ispeziona payload, header e pattern rispetto a database di firme e regole comportamentali.',
            counters: ['HTTP DDoS (Livello 7)', 'SQL Injection', 'Cross-Site Scripting (XSS)', 'Controllo Accessi Difettoso (BAC)']
          },
          {
            name: 'IAM (Identity & Access Management)',
            description: 'Framework di politiche e tecnologie per garantire che gli utenti giusti abbiano l\'accesso appropriato alle risorse.',
            method: 'Autenticazione e autorizzazione centralizzate. RBAC (Role-Based Access Control) o ABAC (Attribute-Based Access Control).',
            counters: ['Controllo Accessi Difettoso (BAC)']
          },
          {
            name: 'Validazione & Sanificazione Input',
            description: 'Verifica che tutti i dati forniti dagli utenti rispettino tipo, lunghezza, formato e range.',
            method: 'Validazione allowlist lato server; codifica HTML per l\'output; rifiuta input malformati.',
            counters: ['SQL Injection', 'Cross-Site Scripting (XSS)']
          },
          {
            name: 'Content Security Policy (CSP)',
            description: 'Header HTTP che indica al browser quali sorgenti di contenuto sono attendibili.',
            method: 'Limita script inline e caricamenti di risorse di terze parti non autorizzate.',
            counters: ['Cross-Site Scripting (XSS)']
          },
          {
            name: 'DNSSEC',
            description: 'Aggiunge firme crittografiche ai record DNS, permettendo ai resolver di verificarne l\'autenticità.',
            method: 'Le risposte DNS sono firmate; i resolver validano la catena di fiducia dalla root al dominio.',
            counters: ['DNS Spoofing / Cache Poisoning']
          }
        ]
      }
    }
  },
  {
    id: 6,
    name: 'Presentation',
    color: '#f97316',
    pdu: 'Data',
    translations: {
      en: {
        name: 'Presentation Layer',
        description: 'Acts as the "translator" for the network — responsible for data formatting, encryption/decryption, and compression. It ensures that data sent by one system can be understood by another, regardless of internal format differences.',
        responsibilities: [
          'Data translation and formatting',
          'Encryption and decryption for secure transmission',
          'Data compression for transmission efficiency',
          'Character code translation (e.g., ASCII to EBCDIC)'
        ],
        useCases: [
          'Secure communications (SSL/TLS)',
          'Image encoding (JPEG, PNG)',
          'Video/Audio formatting (MPEG, MP3)',
          'Data serialization (JSON, XML)'
        ],
        protocols: ['SSL/TLS', 'JPEG', 'MPEG', 'ASCII', 'XDR'],
        keyFacts: [
          'TLS (Transport Layer Security) is often associated with L4, but encryption/decryption logically belongs here.',
          'Character encoding (UTF-8, ASCII) is a Presentation Layer concern — mismatches cause "mojibake" (garbled text).',
          'JPEG, MP3, and video codecs operate at this layer — they transform raw data into presentable formats.'
        ],
        attacks: [
          {
            name: 'SSL Stripping',
            description: 'Attacker downgrades an HTTPS connection to HTTP, making traffic readable in plaintext.',
            howItWorks: '1. Attacker performs a MITM between client and server.\n2. Intercepts initial HTTP request and establishes HTTPS with the server.\n3. Serves the client HTTP instead of HTTPS.\n4. Client believes they are on a secure site; attacker reads everything.',
            impact: 'Credential theft, session hijacking, full traffic interception.',
            mitigation_strategy: 'Enforce HTTP Strict Transport Security (HSTS) so browsers always use HTTPS, even on first request.',
            severity: 'critical',
            protocols: ['HTTP']
          },
          {
            name: 'XML External Entity (XXE)',
            description: 'Exploiting a weak XML parser to read local files, execute internal scans (SSRF), or cause DoS.',
            howItWorks: '1. Application parses user-provided XML.\n2. Attacker inserts a DOCTYPE with an external entity pointing to /etc/passwd.\n3. Parser fetches the external resource.\n4. Server returns the content of the local file in the response.',
            impact: 'Information disclosure, SSRF, remote code execution in some cases.',
            mitigation_strategy: 'Disable DTDs (Document Type Definitions) and external entity processing in the XML parser.',
            severity: 'high',
            protocols: ['HTTP']
          },
          {
            name: 'Format String Attack',
            description: 'Exploiting vulnerabilities in how applications handle format specifiers in strings.',
            howItWorks: '1. Application uses user input directly in a printf-style function.\n2. Attacker inputs %x%x%x%n as a string.\n3. Program reads memory addresses or writes to arbitrary locations.\n4. Results in information disclosure or code execution.',
            impact: 'Memory disclosure, remote code execution, application crash.',
            mitigation_strategy: 'Never pass user-controlled data as format string arguments. Use static format strings.',
            severity: 'high',
            protocols: ['HTTP', 'SMTP', 'FTP']
          },
          {
            name: 'Padding Oracle Attack',
            type: 'injection',
            description: 'Attacker exploits the padding of encrypted messages to decrypt data without the secret key.',
            howItWorks: '1. Attacker sends ciphertext with modified padding to a server.\n2. Server reveals whether the padding is valid or invalid through error messages or timing.\n3. Attacker uses this side-channel to deduce the plaintext byte-by-byte.\n4. Eventually, the entire message is recovered without the key.',
            impact: 'Encryption bypass, data disclosure, credential theft.',
            mitigation_strategy: 'Use authenticated encryption modes like AES-GCM or ChaCha20-Poly1305. Avoid revealing detailed decryption error messages.',
            severity: 'critical',
            protocols: ['HTTP']
          },
          {
            name: 'Homograph Attack',
            type: 'spoofing',
            description: 'Using characters from different sets (e.g., Cyrillic) that look identical to Latin characters to deceive users.',
            howItWorks: '1. Attacker registers a domain like "apple.com" but uses a Cyrillic "а".\n2. User clicks a link that looks perfectly legitimate.\n3. Browser resolves the Punycode version (xn--pple-43d.com) of the domain.\n4. Attacker hosts a phishing site on the visually identical domain.',
            impact: 'Highly effective phishing, credential theft, malware distribution.',
            mitigation_strategy: 'Enable browser-level homograph protection. Use Punycode display in address bars for suspicious characters. Implement HSTS.',
            severity: 'high',
            protocols: ['HTTP', 'DNS']
          }
        ],
        defenses: [
          {
            name: 'HSTS (HTTP Strict Transport Security)',
            description: 'Forces browsers to only connect via HTTPS, preventing protocol downgrade attacks.',
            method: 'Server sends Strict-Transport-Security header; browser pins HTTPS for the domain duration.',
            counters: ['SSL Stripping']
          },
          {
            name: 'TLS Certificate Pinning',
            description: 'Application hardcodes expected server certificates, rejecting unexpected ones.',
            method: 'Client stores hash of server cert; rejects connections if cert doesn\'t match.',
            counters: ['SSL Stripping']
          },
          {
            name: 'Authenticated Encryption (AEAD)',
            description: 'Encryption modes that provide both confidentiality and authenticity simultaneously.',
            method: 'Use modes like AES-GCM which include a Message Authentication Code (MAC) to prevent tampering.',
            counters: ['Padding Oracle Attack']
          },
          {
            name: 'Punycode Blacklisting',
            description: 'Rejecting or flagging domains that use mixed-script characters in sensitive contexts.',
            method: 'Identify and block domains that use visually similar characters from different alphabets.',
            counters: ['Homograph Attack']
          },
          {
            name: 'Sandboxed Parsing',
            description: 'Parsing untrusted files in an isolated process or container with restricted privileges.',
            method: 'Use OS-level sandboxing (seccomp, containers) so parser exploits cannot affect the host.',
            counters: ['Malformed Data / Heap Overflow', 'Format String Attack']
          },
          {
            name: 'Input Schema Validation',
            description: 'Validating data structures (JSON Schema, XML Schema) before passing to parsers.',
            method: 'Reject data that does not conform to expected schema before any parsing occurs.',
            counters: ['Malformed Data / Heap Overflow']
          }
        ]
      },
      it: {
        name: 'Livello Presentazione',
        description: 'Agisce come "traduttore" per la rete — responsabile della formattazione dei dati, crittografia/decrittografia e compressione. Garantisce che i dati inviati da un sistema possano essere compresi da un altro, indipendentemente dalle differenze di formato interno.',
        responsibilities: [
          'Traduzione e formattazione dei dati',
          'Cifratura e decifratura per trasmissioni sicure',
          'Compressione dei dati per l\'efficienza della trasmissione',
          'Traduzione dei codici di caratteri (es. ASCII in UTF-8)'
        ],
        useCases: [
          'Comunicazioni sicure (SSL/TLS)',
          'Codifica immagini (JPEG, PNG)',
          'Formattazione Video/Audio (MPEG, MP3)',
          'Serializzazione dati (JSON, XML)'
        ],
        protocols: ['SSL/TLS', 'JPEG', 'MPEG', 'ASCII', 'XDR'],
        keyFacts: [
          'TLS è spesso associato a L4, ma la crittografia/decrittografia logicamente appartiene a questo livello.',
          'La codifica dei caratteri (UTF-8, ASCII) è una responsabilità del Livello Presentazione.',
          'JPEG, MP3 e codec video operano a questo livello — trasformano i dati grezzi in formati presentabili.'
        ],
        attacks: [
          {
            name: 'SSL Stripping',
            description: 'L\'attaccante degrada una connessione HTTPS a HTTP, rendendo il traffico leggibile in chiaro.',
            howItWorks: '1. L\'attaccante esegue un MITM tra client e server.\n2. Intercetta la richiesta HTTP iniziale e stabilisce HTTPS con il server.\n3. Serve HTTP al client invece di HTTPS.\n4. Il client crede di essere su un sito sicuro; l\'attaccante legge tutto.',
            impact: 'Furto di credenziali, hijacking di sessione, intercettazione completa del traffico.',
            mitigation_strategy: 'Applica HTTP Strict Transport Security (HSTS) affinché i browser usino sempre HTTPS.',
            severity: 'critical',
            protocols: ['HTTP']
          },
          {
            name: 'XML External Entity (XXE)',
            description: 'Sfruttamento di un parser XML debole per leggere file locali, eseguire scansioni interne (SSRF) o causare DoS.',
            howItWorks: '1. L\'applicazione elabora XML fornito dall\'utente.\n2. L\'attaccante inserisce un DOCTYPE con un\'entità esterna che punta a /etc/passwd.\n3. Il parser recupera la risorsa esterna.\n4. Il server restituisce il contenuto del file locale nella risposta.',
            impact: 'Divulgazione di informazioni, SSRF, esecuzione di codice remoto in rari casi.',
            mitigation_strategy: 'Disabilita i DTD (Document Type Definitions) e l\'elaborazione di entità esterne nel parser XML.',
            severity: 'high',
            protocols: ['HTTP']
          },
          {
            name: 'Format String Attack',
            description: 'Sfruttamento di vulnerabilità nel modo in cui le applicazioni gestiscono i format specifier nelle stringhe.',
            howItWorks: '1. L\'applicazione usa input utente direttamente in una funzione tipo printf.\n2. L\'attaccante inserisce %x%x%x%n come stringa.\n3. Il programma legge indirizzi di memoria o scrive in posizioni arbitrarie.\n4. Risulta in divulgazione di informazioni o esecuzione di codice.',
            impact: 'Divulgazione di memoria, esecuzione di codice remoto, crash dell\'applicazione.',
            mitigation_strategy: 'Non passare mai dati controllati dall\'utente come argomenti di format string. Usa format string statiche.',
            severity: 'high',
            protocols: ['HTTP', 'SMTP', 'FTP']
          },
          {
            name: 'Attacco Padding Oracle',
            type: 'injection',
            description: 'L\'attaccante sfrutta il padding dei messaggi cifrati per decifrare i dati senza la chiave segreta.',
            howItWorks: '1. L\'attaccante invia messaggi cifrati con padding modificato a un server.\n2. Il server rivela se il padding è valido o meno tramite messaggi di errore o timing.\n3. L\'attaccante usa questo canale laterale per dedurre il testo in chiaro byte per byte.\n4. Alla fine, l\'intero messaggio viene recuperato senza chiave.',
            impact: 'Bypass della crittografia, divulgazione di dati, furto di credenziali.',
            mitigation_strategy: 'Usa modalità di crittografia autenticata come AES-GCM o ChaCha20-Poly1305. Evita messaggi di errore di decifratura dettagliati.',
            severity: 'critical',
            protocols: ['HTTP']
          },
          {
            name: 'Attacco Omografo',
            type: 'spoofing',
            description: 'Utilizzo di caratteri di set diversi (es. Cirillico) che sembrano identici ai caratteri Latini per ingannare gli utenti.',
            howItWorks: '1. L\'attaccante registra un dominio come "apple.com" usando una "а" cirillica.\n2. L\'utente clicca su un link che sembra perfettamente legittimo.\n3. Il browser risolve la versione Punycode (xn--pple-43d.com) del dominio.\n4. L\'attaccante ospita un sito di phishing sul dominio visivamente identico.',
            impact: 'Phishing altamente efficace, furto di credenziali, distribuzione di malware.',
            mitigation_strategy: 'Abilita la protezione omografica a livello di browser. Usa la visualizzazione Punycode per caratteri sospetti.',
            severity: 'high',
            protocols: ['HTTP', 'DNS']
          }
        ],
        defenses: [
          {
            name: 'HSTS (HTTP Strict Transport Security)',
            description: 'Forza i browser a connettersi solo via HTTPS, prevenendo attacchi di downgrade del protocollo.',
            method: 'Il server invia l\'header Strict-Transport-Security; il browser fissa HTTPS per il dominio.',
            counters: ['SSL Stripping']
          },
          {
            name: 'Certificate Pinning TLS',
            description: 'L\'applicazione inserisce nel codice i certificati server attesi, rifiutando quelli inattesi.',
            method: 'Il client memorizza l\'hash del certificato del server; rifiuta connessioni se non corrisponde.',
            counters: ['SSL Stripping']
          },
          {
            name: 'Crittografia Autenticata (AEAD)',
            description: 'Modalità di cifratura che garantiscono sia la riservatezza che l\'autenticità.',
            method: 'Usa modalità come AES-GCM che includono un MAC (Message Authentication Code) per prevenire manomissioni.',
            counters: ['Attacco Padding Oracle']
          },
          {
            name: 'Blacklist Punycode',
            description: 'Rifiutare o segnalare domini che usano script misti in contesti sensibili.',
            method: 'Identifica e blocca domini che usano caratteri visivamente simili da alfabeti diversi.',
            counters: ['Attacco Omografo']
          },
          {
            name: 'Parsing in Sandbox',
            description: 'Parsing di file non attendibili in un processo o container isolato con privilegi limitati.',
            method: 'Usa sandboxing a livello OS (seccomp, container) per isolare eventuali exploit del parser.',
            counters: ['Dati Malformati / Heap Overflow', 'Format String Attack']
          },
          {
            name: 'Validazione Schema Input',
            description: 'Validazione delle strutture dati (JSON Schema, XML Schema) prima di passarle ai parser.',
            method: 'Rifiuta dati non conformi allo schema atteso prima di qualsiasi operazione di parsing.',
            counters: ['Dati Malformati / Heap Overflow']
          }
        ]
      }
    }
  },
  {
    id: 5,
    name: 'Session',
    color: '#eab308',
    pdu: 'Data',
    translations: {
      en: {
        name: 'Session Layer',
        description: 'Establishes, manages, and terminates communication sessions between applications. It handles authentication checkpointing, and dialog control — deciding who speaks when in a two-way communication.',
        responsibilities: [
          'Session establishment, maintenance, and termination',
          'Dialog control (half-duplex vs. full-duplex)',
          'Synchronization and checkpointing',
          'Authentication and authorization'
        ],
        useCases: [
          'Remote Procedure Calls (RPC)',
          'SQL Database session management',
          'Naming services like NetBIOS',
          'Network basic input/output services'
        ],
        protocols: ['NetBIOS', 'RPC', 'PPTP', 'L2TP', 'SIP'],
        keyFacts: [
          'A "session" is a logical connection above the TCP connection — it can persist across multiple TCP connections.',
          'Session tokens are random identifiers assigned after login; they are the key to your authenticated state.',
          'Session fixation is possible because many apps let users choose their own session ID before login.'
        ],
        attacks: [
          {
            name: 'Session Hijacking',
            description: 'Attacker steals a valid session token to impersonate a legitimate authenticated user.',
            howItWorks: '1. User logs in; server creates session token (e.g., cookie SESSID=abc123).\n2. Attacker intercepts the token via network sniffing, XSS, or MITM.\n3. Attacker sends requests with the stolen token.\n4. Server treats attacker as the authenticated user.',
            impact: 'Full account takeover without knowing the password.',
            mitigation_strategy: 'Use HTTPS everywhere. Set HttpOnly and Secure flags on cookies. Rotate session tokens after login.',
            severity: 'critical',
            protocols: ['HTTP', 'FTP']
          },
          {
            name: 'Cross-Site Request Forgery (CSRF)',
            description: 'Attacker tricks a logged-in user\'s browser into making unauthorized requests to a trusted site.',
            howItWorks: '1. Victim is logged into bank.com.\n2. Attacker sends a link: evil.com/transfer?to=attacker&amount=1000.\n3. Victim\'s browser automatically includes bank.com cookies.\n4. Bank processes the transfer as if initiated by the victim.',
            impact: 'Unauthorized actions (transfers, password changes) performed on behalf of the victim.',
            mitigation_strategy: 'Use CSRF tokens (unpredictable values in forms). Check Origin/Referer headers. Use SameSite cookies.',
            severity: 'high',
            protocols: ['HTTP']
          },
          {
            name: 'Session Fixation',
            description: 'Attacker forces a user to use a known session ID, then hijacks it after the user authenticates.',
            howItWorks: '1. Attacker obtains a valid but unauthenticated session ID.\n2. Tricks victim into using that ID (e.g., via URL parameter).\n3. Victim logs in — server authenticates that session.\n4. Attacker uses the now-authenticated session ID.',
            impact: 'Account takeover without intercepting credentials.',
            mitigation_strategy: 'Always generate a new session ID upon successful login. Never accept session IDs from URL parameters.',
            severity: 'high',
            protocols: ['HTTP']
          },
          {
            name: 'Session Token Prediction',
            type: 'spoofing',
            description: 'Attacker predicts the next session token due to a weak or non-random generation algorithm.',
            howItWorks: '1. Attacker collects several valid session tokens from the server.\n2. Analyzes the tokens for patterns (e.g., incremental IDs, timestamp-based).\n3. Uses the observed pattern to guess tokens assigned to other users.\n4. Hijacks active sessions without needing to steal an existing token.',
            impact: 'Systemic session hijacking, mass account takeover.',
            mitigation_strategy: 'Use cryptographically secure pseudo-random number generators (CSPRNG). Ensure tokens have at least 128 bits of entropy.',
            severity: 'critical',
            protocols: ['HTTP']
          },
          {
            name: 'Insecure Session Expiry',
            description: 'Sessions remain active far longer than necessary, increasing the window for hijacking.',
            howItWorks: '1. User finishes using an application but does not log out.\n2. Attacker gains access to the local machine or steals the cookie later.\n3. The session is still valid because there is no server-side timeout.\n4. Attacker continues using the authenticated session indefinitely.',
            impact: 'Prolonged window for session theft and unauthorized access.',
            mitigation_strategy: 'Implement absolute timeouts and idle timeouts. Invalidate sessions on the server upon browser close or logout.',
            severity: 'medium',
            protocols: ['HTTP']
          }
        ],
        defenses: [
          {
            name: 'Secure Session Tokens',
            description: 'Generating cryptographically random, high-entropy session identifiers.',
            method: 'Use CSPRNG to generate 128+ bit tokens. Store server-side. Expire after inactivity.',
            counters: ['Session Hijacking', 'Session Fixation', 'Session Token Prediction']
          },
          {
            name: 'CSRF Token Protection',
            description: 'Including unique, secret, per-session tokens in all state-changing forms.',
            method: 'Server generates random token tied to session. Form submits it. Server validates before processing.',
            counters: ['Cross-Site Request Forgery (CSRF)']
          },
          {
            name: 'SameSite Cookies',
            description: 'Cookie attribute that prevents the browser from sending cookies with cross-site requests.',
            method: 'Set SameSite=Strict or SameSite=Lax on session cookies to block CSRF vectors.',
            counters: ['Cross-Site Request Forgery (CSRF)', 'Session Hijacking']
          },
          {
            name: 'Session Lifespan Management',
            description: 'Enforcing strict time limits on how long a session can remain valid.',
            method: 'Implement idle timeouts (e.g., 30 mins) and absolute timeouts (e.g., 24 hours). Clear cookies on logout.',
            counters: ['Insecure Session Expiry', 'Session Hijacking']
          },
          {
            name: 'Session Timeout & Invalidation',
            description: 'Automatically expiring sessions after a period of inactivity or on logout.',
            method: 'Server-side session expiry. Invalidate session ID on logout. Re-authenticate for sensitive actions.',
            counters: ['Session Hijacking']
          }
        ]
      },
      it: {
        name: 'Livello Sessione',
        description: 'Stabilisce, gestisce e termina le sessioni di comunicazione tra applicazioni. Gestisce autenticazione, checkpoint e controllo del dialogo — decidendo chi parla quando in una comunicazione bidirezionale.',
        responsibilities: [
          'Creazione, mantenimento e chiusura delle sessioni',
          'Controllo del dialogo (half-duplex vs. full-duplex)',
          'Sincronizzazione e checkpointing',
          'Autenticazione e autorizzazione'
        ],
        useCases: [
          'Chiamate di procedure remote (RPC)',
          'Gestione sessioni database SQL',
          'Servizi di naming come NetBIOS',
          'Servizi di input/output di rete di base'
        ],
        protocols: ['NetBIOS', 'RPC', 'PPTP', 'L2TP', 'SIP'],
        keyFacts: [
          'Una "sessione" è una connessione logica sopra la connessione TCP — può persistere su più connessioni TCP.',
          'I token di sessione sono identificatori casuali assegnati dopo il login; sono la chiave del tuo stato autenticato.',
          'La session fixation è possibile perché molte app permettono agli utenti di scegliere il proprio session ID prima del login.'
        ],
        attacks: [
          {
            name: 'Session Hijacking',
            description: 'L\'attaccante ruba un token di sessione valido per impersonare un utente autenticato.',
            howItWorks: '1. L\'utente si autentica; il server crea un token (es. cookie SESSID=abc123).\n2. L\'attaccante intercetta il token via sniffing, XSS o MITM.\n3. L\'attaccante invia richieste con il token rubato.\n4. Il server tratta l\'attaccante come l\'utente autenticato.',
            impact: 'Compromissione completa dell\'account senza conoscere la password.',
            mitigation_strategy: 'Usa HTTPS ovunque. Imposta flag HttpOnly e Secure sui cookie. Rigenera i token dopo il login.',
            severity: 'critical',
            protocols: ['HTTP', 'FTP']
          },
          {
            name: 'Cross-Site Request Forgery (CSRF)',
            description: 'L\'attaccante inganna il browser di un utente loggato per fare richieste non autorizzate a un sito fidato.',
            howItWorks: '1. La vittima è loggata su banca.com.\n2. L\'attaccante invia un link: evil.com/trasferisci?a=attaccante&importo=1000.\n3. Il browser della vittima include automaticamente i cookie di banca.com.\n4. La banca processa il trasferimento come se fosse della vittima.',
            impact: 'Azioni non autorizzate (trasferimenti, cambio password) eseguite per conto della vittima.',
            mitigation_strategy: 'Usa token CSRF. Controlla gli header Origin/Referer. Usa cookie SameSite.',
            severity: 'high',
            protocols: ['HTTP']
          },
          {
            name: 'Session Fixation',
            description: 'L\'attaccante forza un utente a usare un session ID noto, poi lo hijacka dopo l\'autenticazione.',
            howItWorks: '1. L\'attaccante ottiene un session ID valido ma non autenticato.\n2. Inganna la vittima a usare quel ID (es. tramite parametro URL).\n3. La vittima si autentica — il server autentica quella sessione.\n4. L\'attaccante usa il session ID ora autenticato.',
            impact: 'Compromissione dell\'account senza intercettare le credenziali.',
            mitigation_strategy: 'Genera sempre un nuovo session ID dopo il login riuscito. Non accettare mai session ID dai parametri URL.',
            severity: 'high',
            protocols: ['HTTP']
          },
          {
            name: 'Predizione Token di Sessione',
            type: 'spoofing',
            description: 'L\'attaccante indovina il prossimo token di sessione a causa di un algoritmo di generazione debole.',
            howItWorks: '1. L\'attaccante raccoglie diversi token validi dal server.\n2. Analizza i pattern (es. ID incrementali, basati sul tempo).\n3. Usa il pattern osservato per indovinare i token assegnati ad altri utenti.\n4. Hijack della sessione senza dover rubare un token esistente.',
            impact: 'Session hijacking sistemico, acquisizione di account di massa.',
            mitigation_strategy: 'Usa generatori di numeri casuali crittograficamente sicuri (CSPRNG). Assicura almeno 128 bit di entropia.',
            severity: 'critical',
            protocols: ['HTTP']
          },
          {
            name: 'Scadenza Sessione Insicura',
            description: 'Le sessioni rimangono attive molto più a lungo del necessario, aumentando la finestra per il furto.',
            howItWorks: '1. L\'utente finisce di usare l\'app ma non effettua il logout.\n2. L\'attaccante ottiene accesso alla macchina locale in seguito.\n3. La sessione è ancora valida perché non c\'è timeout lato server.\n4. L\'attaccante continua a usare la sessione autenticata per giorni.',
            impact: 'Finestra prolungata per il furto di sessione e accesso non autorizzato.',
            mitigation_strategy: 'Implementa timeout assoluti e di inattività. Invalida le sessioni sul server dopo il logout.',
            severity: 'medium',
            protocols: ['HTTP']
          }
        ],
        defenses: [
          {
            name: 'Token di Sessione Sicuri',
            description: 'Generazione di identificatori di sessione casuali crittograficamente, ad alta entropia.',
            method: 'Usa CSPRNG per generare token da 128+ bit. Archivia lato server. Scadono dopo inattività.',
            counters: ['Session Hijacking', 'Session Fixation', 'Predizione Token di Sessione']
          },
          {
            name: 'Protezione Token CSRF',
            description: 'Includere token unici e segreti per sessione in tutti i form che modificano lo stato.',
            method: 'Il server genera token casuale legato alla sessione. Il form lo invia. Il server lo valida.',
            counters: ['Cross-Site Request Forgery (CSRF)']
          },
          {
            name: 'Cookie SameSite',
            description: 'Attributo dei cookie che impedisce al browser di inviarli con richieste cross-site.',
            method: 'Imposta SameSite=Strict o SameSite=Lax sui cookie di sessione per bloccare i vettori CSRF.',
            counters: ['Cross-Site Request Forgery (CSRF)', 'Session Hijacking']
          },
          {
            name: 'Gestione Ciclo di Vita Sessione',
            description: 'Applicazione di limiti temporali severi sulla validità della sessione.',
            method: 'Implementa timeout di inattività e assoluti. Cancella i cookie al logout.',
            counters: ['Scadenza Sessione Insicura', 'Session Hijacking']
          },
          {
            name: 'Timeout & Invalidazione Sessione',
            description: 'Scadenza automatica delle sessioni dopo inattività o al logout.',
            method: 'Scadenza sessione lato server. Invalida session ID al logout. Ri-autentica per azioni sensibili.',
            counters: ['Session Hijacking']
          }
        ]
      }
    }
  },
  {
    id: 4,
    name: 'Transport',
    color: '#22c55e',
    pdu: 'Segment',
    translations: {
      en: {
        name: 'Transport Layer',
        description: 'Provides end-to-end communication between applications on different hosts. It manages segmentation, flow control, error correction, and multiplexing — ensuring complete data delivery (TCP) or prioritizing speed (UDP).',
        responsibilities: [
          'End-to-end data delivery and recovery',
          'Segmentation and reassembly of data streams',
          'Flow control and congestion avoidance',
          'Service-point addressing (ports)'
        ],
        useCases: [
          'Reliable data transfer (Web, File Transfer)',
          'Real-time data streaming (VOIP, Video)',
          'Connectionless fast messaging (Gaming, DNS)',
          'Error checking and data integrity enforcement'
        ],
        protocols: ['TCP', 'UDP', 'SCTP', 'DCCP'],
        keyFacts: [
          'The TCP 3-way handshake (SYN → SYN-ACK → ACK) is the basis of all reliable TCP connections.',
          'Port numbers (0–65535) allow a single IP to host thousands of simultaneous services.',
          'UDP has no handshake — a packet is fired and forgotten. This makes it ideal for DNS, video streaming, and gaming.'
        ],
        attacks: [
          {
            name: 'SYN Flood',
            type: 'dos',
            description: 'Attacker sends thousands of TCP SYN packets but never completes the handshake, exhausting the server\'s connection table.',
            howItWorks: '1. Attacker sends rapid SYN packets from spoofed IPs.\n2. Server responds with SYN-ACK and waits for ACK.\n3. ACK never arrives (IP is fake).\n4. Server\'s half-open connection table fills up — legitimate connections are refused.',
            impact: 'Denial of Service — legitimate clients cannot connect.',
            mitigation_strategy: 'Enable SYN cookies on the server (Linux: net.ipv4.tcp_syncookies=1). SYN cookies avoid storing half-open connections.',
            severity: 'high',
            protocols: ['HTTP', 'SSH', 'FTP', 'SMTP', 'BGP']
          },
          {
            name: 'Sockstress',
            description: 'DoS attack that maintains thousands of TCP connections in a low-resource state to exhaust a server\'s capacity.',
            howItWorks: '1. Attacker initiates TCP handshake.\n2. Completes the handshake but sets the window size to zero or very small.\n3. Server keeps the connection open, waiting for the window to open.\n4. Server runs out of resources (RAM/Sockets) handling "stuck" connections.',
            impact: 'Complete server unresponsiveness for new connections.',
            mitigation_strategy: 'Set aggressive timeouts for zero-window connections. Limit maximum connections per IP.',
            severity: 'high',
            protocols: ['HTTP', 'SSH', 'FTP', 'SMTP']
          },
          {
            name: 'UDP Amplification DDoS',
            description: 'Attacker abuses UDP services that return large responses to small queries, amplifying attack traffic.',
            howItWorks: '1. Attacker sends small UDP requests (e.g., DNS, NTP) with victim\'s spoofed source IP.\n2. Servers send large responses to the victim.\n3. Amplification factor can be 10x–100x (NTP monlist up to 556x).\n4. Victim is flooded with traffic it never requested.',
            impact: 'Network saturation, service outage with minimal attacker bandwidth.',
            mitigation_strategy: 'Disable amplifying services (monlist). Configure BCP38 egress filtering to prevent spoofed source IPs.',
            severity: 'critical',
            protocols: ['DNS']
          },
          {
            name: 'Port Scanning',
            description: 'Systematic probing of ports on a target to discover open services and their versions.',
            howItWorks: '1. Scanner sends SYN to each port in range.\n2. Open port replies SYN-ACK; closed port replies RST.\n3. Attacker maps the attack surface.\n4. Service version fingerprinting reveals known vulnerabilities.',
            impact: 'Intelligence gathering — foundation for targeted exploits.',
            mitigation_strategy: 'Use stateful firewalls and port knocking. Disable or hide service version banners.',
            severity: 'medium',
            protocols: ['HTTP', 'DNS', 'SSH', 'FTP', 'SMTP']
          },
          {
            name: 'TCP Session Hijacking',
            description: 'Attacker inserts themselves into an established TCP session by predicting sequence numbers.',
            howItWorks: '1. Attacker sniffs a TCP conversation to learn SEQ/ACK numbers.\n2. Injects a packet with correct sequence number and victim\'s source IP.\n3. Server accepts it as part of the legitimate session.\n4. Attacker can inject commands or data.',
            impact: 'Unauthorized command injection into active sessions.',
            mitigation_strategy: 'Use TLS/HTTPS to encrypt and authenticate all traffic. Use modern TCP with random ISN (Initial Sequence Numbers).',
            severity: 'high',
            protocols: ['HTTP', 'SSH', 'FTP', 'SMTP', 'BGP']
          },
          {
            name: 'TCP Reset Attack',
            type: 'dos',
            description: 'Attacker kills a legitimate TCP connection by sending a spoofed packet with the RST (Reset) flag set.',
            howItWorks: '1. Attacker observes or predicts a TCP session sequence number.\n2. Sends a spoofed packet with the victim\'s source IP and the RST flag.\n3. Server receives the RST packet and immediately closes the connection.\n4. Legitimate users are disconnected without warning.',
            impact: 'Disruption of long-lived connections (BGP sessions, long downloads).',
            mitigation_strategy: 'Use TCP MD5 signatures or TLS for authentication. Use modern operating systems with harder-to-predict sequence numbers.',
            severity: 'high',
            protocols: ['BGP', 'SSH', 'FTP']
          },
          {
            name: 'UDP Flood',
            type: 'dos',
            description: 'A classic DoS attack that overwhelms a target by sending a high volume of UDP packets to random ports.',
            howItWorks: '1. Attacker sends a flood of UDP packets to random ports on the target host.\n2. For each packet, the host checks for an application listening on that port.\n3. Finding none, the host sends an ICMP "Destination Unreachable" packet back.\n4. The target\'s resources are exhausted processing the flood and sending replies.',
            impact: 'System unresponsiveness, network bandwidth exhaustion.',
            mitigation_strategy: 'Configure firewalls to limit ICMP unreachable responses. Use DDoS protection services higher up in the network.',
            severity: 'high',
            protocols: ['DNS']
          }
        ],
        defenses: [
          {
            name: 'SYN Cookies',
            description: 'Technique allowing the server to handle SYN floods without storing half-open connections.',
            method: 'Server encodes connection state in the sequence number cryptographically. Only restores state on valid ACK.',
            counters: ['SYN Flood']
          },
          {
            name: 'Stateful Firewall / ACLs',
            description: 'Firewall that tracks connection state and blocks packets that don\'t belong to known sessions.',
            method: 'Maintain state table. Drop packets with invalid flags. Block unauthorized port ranges.',
            counters: ['Port Scanning', 'TCP Session Hijacking']
          },
          {
            name: 'Rate Limiting',
            description: 'Limiting the number of connections or packets from a single source within a time window.',
            method: 'Drop or throttle connections exceeding threshold (e.g., iptables -m limit, fail2ban).',
            counters: ['SYN Flood', 'UDP Amplification DDoS']
          },
          {
            name: 'BCP38 Egress Filtering',
            description: 'ISP-level filtering that blocks packets with spoofed source IP addresses from leaving a network.',
            method: 'Routers verify source IP is within their assigned prefix; drop packets claiming to be from other networks.',
            counters: ['UDP Amplification DDoS', 'SYN Flood']
          },
          {
            name: 'Anycast DDoS Mitigation',
            description: 'Using Anycast routing to distribute attack traffic across multiple geographically diverse data centers.',
            method: 'Announce the same IP address from multiple locations. Traffic is routed to the nearest node, diluting the attack power locally.',
            counters: ['UDP Flood', 'UDP Amplification DDoS', 'SYN Flood']
          }
        ]
      },
      it: {
        name: 'Livello Trasporto',
        description: 'Fornisce comunicazione end-to-end tra applicazioni su host diversi. Gestisce segmentazione, controllo del flusso, correzione degli errori e multiplexing — garantendo la consegna completa dei dati (TCP) o privilegiando la velocità (UDP).',
        responsibilities: [
          'Consegna e recupero dati end-to-end',
          'Segmentazione e riassemblaggio dei flussi di dati',
          'Controllo del flusso ed evitamento congestione',
          'Indirizzamento del punto di servizio (porte)'
        ],
        useCases: [
          'Trasferimento dati affidabile (Web, File)',
          'Streaming dati in tempo reale (VOIP, Video)',
          'Messaggistica rapida senza connessione (Gaming, DNS)',
          'Controllo errori e integrità dei dati'
        ],
        protocols: ['TCP', 'UDP', 'SCTP', 'DCCP'],
        keyFacts: [
          'Il 3-way handshake TCP (SYN → SYN-ACK → ACK) è la base di tutte le connessioni TCP affidabili.',
          'I numeri di porta (0–65535) permettono a un singolo IP di ospitare migliaia di servizi simultanei.',
          'UDP non ha handshake — un pacchetto viene inviato e dimenticato. Ideale per DNS, streaming video e gaming.'
        ],
        attacks: [
          {
            name: 'SYN Flood',
            type: 'dos',
            description: 'L\'attaccante invia migliaia di pacchetti TCP SYN senza mai completare l\'handshake, esaurendo la tabella delle connessioni del server.',
            howItWorks: '1. L\'attaccante invia pacchetti SYN rapidi da IP falsificati.\n2. Il server risponde con SYN-ACK e aspetta l\'ACK.\n3. L\'ACK non arriva mai (l\'IP è falso).\n4. La tabella half-open si riempie — le connessioni legittime vengono rifiutate.',
            impact: 'Denial of Service — i client legittimi non possono connettersi.',
            mitigation_strategy: 'Abilita i SYN cookie sul server (Linux: net.ipv4.tcp_syncookies=1). I SYN cookie evitano di memorizzare connessioni half-open.',
            severity: 'high',
            protocols: ['HTTP', 'SSH', 'FTP', 'SMTP', 'BGP']
          },
          {
            name: 'Sockstress',
            description: 'Attacco DoS che mantiene migliaia di connessioni TCP in uno stato di basso consumo di risorse per esaurire la capacità del server.',
            howItWorks: '1. L\'attaccante avvia l\'handshake TCP.\n2. Completa l\'handshake ma imposta la dimensione della finestra (window size) a zero o molto piccola.\n3. Il server mantiene la connessione aperta, aspettando che la finestra si apra.\n4. Il server esaurisce risorse (RAM/Socket) gestendo connessioni "bloccate".',
            impact: 'Indisponibilità completa del server per nuove connessioni.',
            mitigation_strategy: 'Imposta timeout aggressivi per connessioni con finestra zero. Limita le connessioni massime per IP.',
            severity: 'high',
            protocols: ['HTTP', 'SSH', 'FTP', 'SMTP']
          },
          {
            name: 'UDP Amplification DDoS',
            description: 'L\'attaccante abusa di servizi UDP che restituiscono risposte grandi a query piccole, amplificando il traffico d\'attacco.',
            howItWorks: '1. L\'attaccante invia piccole richieste UDP (DNS, NTP) con l\'IP sorgente della vittima falsificato.\n2. I server inviano risposte grandi alla vittima.\n3. Il fattore di amplificazione può essere 10x–100x.\n4. La vittima viene inondata da traffico che non ha richiesto.',
            impact: 'Saturazione della rete, interruzione del servizio con minima banda dell\'attaccante.',
            mitigation_strategy: 'Disabilita i servizi amplificatori (monlist). Configura il filtraggio BCP38 per prevenire IP sorgente falsificati.',
            severity: 'critical',
            protocols: ['DNS']
          },
          {
            name: 'Port Scanning',
            description: 'Sondaggio sistematico delle porte di un target per scoprire servizi aperti e le loro versioni.',
            howItWorks: '1. Lo scanner invia SYN a ogni porta nel range.\n2. La porta aperta risponde SYN-ACK; quella chiusa risponde RST.\n3. L\'attaccante mappa la superficie d\'attacco.\n4. Il fingerprinting della versione rivela vulnerabilità note.',
            impact: 'Raccolta di intelligence — fondamento per exploit mirati.',
            mitigation_strategy: 'Usa firewall stateful e port knocking. Disabilita o nascondi i banner di versione dei servizi.',
            severity: 'medium',
            protocols: ['HTTP', 'DNS', 'SSH', 'FTP', 'SMTP']
          },
          {
            name: 'TCP Session Hijacking',
            description: 'L\'attaccante si inserisce in una sessione TCP stabilita indovinando i numeri di sequenza.',
            howItWorks: '1. L\'attaccante sniffa una conversazione TCP per conoscere i numeri SEQ/ACK.\n2. Inietta un pacchetto con il numero di sequenza corretto e l\'IP sorgente della vittima.\n3. Il server lo accetta come parte della sessione legittima.\n4. L\'attaccante può iniettare comandi o dati.',
            impact: 'Iniezione di comandi non autorizzati nelle sessioni attive.',
            mitigation_strategy: 'Usa TLS/HTTPS per cifrare e autenticare tutto il traffico. Usa TCP moderno con ISN (Initial Sequence Numbers) casuali.',
            severity: 'high',
            protocols: ['HTTP', 'SSH', 'FTP', 'SMTP', 'BGP']
          },
          {
            name: 'Attacco TCP Reset',
            type: 'dos',
            description: 'L\'attaccante termina una connessione TCP legittima inviando un pacchetto falsificato con il flag RST (Reset) impostato.',
            howItWorks: '1. L\'attaccante osserva o predice il numero di sequenza di una sessione TCP.\n2. Invia un pacchetto spoofato con l\'IP della vittima e il flag RST.\n3. Il server riceve il RST e chiude immediatamente la connessione.\n4. Gli utenti legittimi vengono disconnessi senza preavviso.',
            impact: 'Interruzione di connessioni a lunga durata (sessioni BGP, download lunghi).',
            mitigation_strategy: 'Usa firme TCP MD5 o TLS per l\'autenticazione. Usa sistemi operativi moderni con numeri di sequenza difficili da prevedere.',
            severity: 'high',
            protocols: ['BGP', 'SSH', 'FTP']
          },
          {
            name: 'UDP Flood',
            type: 'dos',
            description: 'Un classico attacco DoS che travolge un target inviando un alto volume di pacchetti UDP a porte casuali.',
            howItWorks: '1. L\'attaccante invia una raffica di pacchetti UDP a porte casuali sull\'host target.\n2. Per ogni pacchetto, l\'host controlla se c\'è un\'app in ascolto.\n3. Non trovandone, l\'host invia indietro un pacchetto ICMP "Destination Unreachable".\n4. Le risorse del target vengono esaurite processando la raffica e inviando risposte.',
            impact: 'Indisponibilità del sistema, esaurimento della banda di rete.',
            mitigation_strategy: 'Configura i firewall per limitare le risposte ICMP unreachable. Usa servizi di protezione DDoS.',
            severity: 'high',
            protocols: ['DNS']
          }
        ],
        defenses: [
          {
            name: 'SYN Cookies',
            description: 'Tecnica che permette al server di gestire i SYN flood senza memorizzare connessioni half-open.',
            method: 'Il server codifica lo stato della connessione nel numero di sequenza crittograficamente. Ripristina lo stato solo su ACK valido.',
            counters: ['SYN Flood']
          },
          {
            name: 'Firewall Stateful / ACL',
            description: 'Firewall che traccia lo stato delle connessioni e blocca i pacchetti che non appartengono a sessioni note.',
            method: 'Mantieni una tabella di stato. Scarta pacchetti con flag non validi. Blocca range di porte non autorizzate.',
            counters: ['Port Scanning', 'TCP Session Hijacking']
          },
          {
            name: 'Rate Limiting',
            description: 'Limitazione del numero di connessioni o pacchetti da una singola sorgente in una finestra temporale.',
            method: 'Scarta o limita connessioni che superano la soglia (es. iptables -m limit, fail2ban).',
            counters: ['SYN Flood', 'UDP Amplification DDoS']
          },
          {
            name: 'Filtraggio Egress BCP38',
            description: 'Filtraggio a livello ISP che blocca pacchetti con IP sorgente falsificati in uscita da una rete.',
            method: 'I router verificano che l\'IP sorgente sia nel loro prefisso assegnato; scartano pacchetti con IP di altre reti.',
            counters: ['UDP Amplification DDoS', 'SYN Flood']
          },
          {
            name: 'Mitigazione DDoS Anycast',
            description: 'Uso del routing Anycast per distribuire il traffico d\'attacco su più data center geograficamente diversi.',
            method: 'Annuncia lo stesso indirizzo IP da più posizioni. Il traffico viene instradato al nodo più vicino, diluendo la potenza dell\'attacco localmente.',
            counters: ['UDP Flood', 'UDP Amplification DDoS', 'SYN Flood']
          }
        ]
      }
    }
  },
  {
    id: 3,
    name: 'Network',
    color: '#3b82f6',
    pdu: 'Packet',
    translations: {
      en: {
        name: 'Network Layer',
        description: 'Handles logical addressing and routing — determining the best path for data to travel across multiple networks. It operates on packets, using IP addresses to identify sources and destinations across the internet.',
        responsibilities: [
          'Logical addressing (IP assignment)',
          'Routing packets across multiple networks',
          'Traffic management and internetworking',
          'Packet fragmentation and reassembly'
        ],
        useCases: [
          'Global Internet Routing (BGP)',
          'Local Area Network Routing (OSPF)',
          'Address Resolution and Diagnostics (ICMP)',
          'Virtual Private Networking (IPSec/VPN)'
        ],
        protocols: ['IPv4', 'IPv6', 'ICMP', 'IPsec', 'OSPF', 'BGP'],
        keyFacts: [
          'IP addresses are logical and topology-dependent: they change when the device moves to another subnet, while the MAC stays with the NIC (burned in, though it can be overridden in software).',
          'TTL (Time to Live) field in IP headers prevents packets from looping forever — it decrements at each hop.',
          'BGP (Border Gateway Protocol) is the "routing protocol of the internet" — routing table poisoning can redirect global traffic.'
        ],
        attacks: [
          {
            name: 'IP Spoofing',
            type: 'spoofing',
            description: 'Creating IP packets with a forged source IP address to impersonate another host or bypass filters.',
            howItWorks: '1. Attacker crafts raw IP packets with victim\'s IP as source.\n2. Sends to a target server or network.\n3. Server responds to the spoofed IP (victim).\n4. Used to bypass IP-based access controls or amplify DDoS attacks.',
            impact: 'Bypassing firewalls, amplifying DDoS attacks, MITM facilitation.',
            mitigation_strategy: 'Implement ingress and egress filtering (BCP38). Verify source IPs at network borders.',
            severity: 'high'
          },
          {
            name: 'Routing Protocol Hijacking',
            description: 'Injecting false routing information into protocols like OSPF or RIP to redirect or drop traffic.',
            howItWorks: '1. Attacker joins a network segment as a router.\n2. Sends forged routing updates claiming a faster path to a network.\n3. Legitimate routers update their tables with the false path.\n4. Attacker becomes a Man-in-the-Middle for across-network traffic.',
            impact: 'Traffic redirection, network-wide MITM, selective packet dropping.',
            mitigation_strategy: 'Use routing protocol authentication (e.g., OSPF MD5 authentication). Limit neighbor adjacencies.',
            severity: 'high'
          },
          {
            name: 'ICMP Smurf Attack',
            description: 'DDoS attack that uses broadcast ICMP echo requests with the victim\'s spoofed source IP.',
            howItWorks: '1. Attacker sends ICMP echo request to a broadcast address (e.g., 192.168.1.255).\n2. Uses victim\'s IP as the source.\n3. All hosts on the network reply to the victim.\n4. A single request generates thousands of responses flooding the victim.',
            impact: 'Network saturation at victim, potential collateral impact on amplifier network.',
            mitigation_strategy: 'Configure routers to block directed broadcast packets. Disable ICMP broadcast responses.',
            severity: 'high'
          },
          {
            name: 'Ping of Death',
            description: 'Sending oversized or malformed ICMP packets to crash, freeze, or destabilize the target system.',
            howItWorks: '1. ICMP allows packets up to 65,535 bytes.\n2. Attacker sends a packet larger than the maximum allowed by IP.\n3. Packet is fragmented during transit.\n4. Reassembly at target causes buffer overflow because the total size exceeds allocated memory.',
            impact: 'System crash, blue screen (BSOD), kernel panic.',
            mitigation_strategy: 'Update OS with latest security patches. Configure firewalls to drop ICMP packets exceeding standard MTU sizes.',
            severity: 'high'
          },
          {
            name: 'BGP Hijacking',
            description: 'Malicious ASes announce more specific IP prefix routes, capturing internet traffic meant for others.',
            howItWorks: '1. Attacker controls an Autonomous System (AS) connected to BGP.\n2. Announces ownership of IP blocks actually owned by others.\n3. Routers prefer more specific routes, redirecting traffic.\n4. Attacker can intercept, drop, or inspect traffic at internet scale.',
            impact: 'Global traffic interception, internet routing disruption, massive-scale MITM.',
            mitigation_strategy: 'Deploy BGPsec and RPKI (Resource Public Key Infrastructure) to cryptographically validate route origins.',
            severity: 'critical',
            protocols: ['BGP']
          },
          {
            name: 'IP Fragmentation Attack',
            description: 'Sending malformed or overlapping IP fragments to bypass security devices or crash target systems.',
            howItWorks: '1. IP allows splitting large packets into fragments.\n2. Attacker sends overlapping fragment offsets.\n3. Reassembly at destination causes buffer overflows or incorrect data reconstruction.\n4. Firewalls that don\'t reassemble fragments may pass malicious payloads.',
            impact: 'Firewall bypass, system crashes, malicious payload delivery.',
            mitigation_strategy: 'Enable stateful packet inspection that reassembles fragments before inspection. Drop malformed fragments.',
            severity: 'medium'
          },
          {
            name: 'Routing Loop Attack',
            type: 'dos',
            description: 'Attacker creates a loop in the network, forcing packets to circulate between routers until TTL expiry.',
            howItWorks: '1. Attacker sends forged routing updates to multiple routers.\n2. Routers A thinks B has the best path; B thinks A has the best path.\n3. A packet for that network bounces back and forth between A and B.\n4. Link bandwidth is instantly consumed by the looping packets.',
            impact: 'Instant network congestion, link saturation, denial of service.',
            mitigation_strategy: 'Implement Split Horizon and Route Poisoning. Use reliable routing protocols with loop prevention mechanisms.',
            severity: 'high'
          }
        ],
        defenses: [
          {
            name: 'Ingress & Egress Filtering',
            description: 'Filtering packets at network borders to reject those with impossible or unauthorized source IPs.',
            method: 'Drop incoming packets claiming to be from internal IPs; drop outgoing packets from unassigned IPs.',
            counters: ['IP Spoofing', 'ICMP Smurf Attack']
          },
          {
            name: 'RPKI (Route Origin Validation)',
            description: 'Cryptographic framework to validate that BGP route announcements are authorized by IP block owners.',
            method: 'ISPs create Route Origin Authorizations (ROAs); routers validate announcements against signed ROAs.',
            counters: ['BGP Hijacking']
          },
          {
            name: 'IPsec',
            description: 'Protocol suite for authenticating and encrypting IP packets at the network layer.',
            method: 'ESP (Encapsulating Security Payload) encrypts packet contents; AH (Authentication Header) verifies integrity.',
            counters: ['IP Spoofing', 'IP Fragmentation Attack']
          },
          {
            name: 'Stateful Packet Inspection',
            description: 'Firewalls that track packet context and reassemble fragments before inspection.',
            method: 'Maintain connection state table. Reassemble IP fragments. Drop packets violating expected state.',
            counters: ['IP Fragmentation Attack', 'IP Spoofing']
          },
          {
            name: 'Control Plane Policing (CoPP)',
            description: 'Feature that protects the router\'s CPU by rate-limiting traffic destined for the control plane.',
            method: 'Apply policies to filter and throttle traffic like routing updates or ICMP, preventing CPU exhaustion during attacks.',
            counters: ['Routing Protocol Hijacking', 'ICMP Smurf Attack', 'Routing Loop Attack']
          }
        ]
      },
      it: {
        name: 'Livello Rete',
        description: 'Gestisce l\'indirizzamento logico e il routing — determinando il percorso migliore per i dati attraverso reti multiple. Opera sui pacchetti, usando indirizzi IP per identificare sorgenti e destinazioni su internet.',
        responsibilities: [
          'Indirizzamento logico (assegnazione IP)',
          'Instradamento pacchetti attraverso reti multiple',
          'Gestione del traffico e internetworking',
          'Frammentazione e riassemblaggio dei pacchetti'
        ],
        useCases: [
          'Routing Internet Globale (BGP)',
          'Routing della rete locale (OSPF)',
          'Risoluzione indirizzi e Diagnostica (ICMP)',
          'Virtual Private Networking (IPSec/VPN)'
        ],
        protocols: ['IPv4', 'IPv6', 'ICMP', 'IPsec', 'OSPF', 'BGP'],
        keyFacts: [
          'Gli indirizzi IP sono logici e dipendono dalla topologia: cambiano se il dispositivo si sposta in un\'altra subnet, mentre il MAC resta legato alla NIC (impresso nella scheda, anche se sovrascrivibile via software).',
          'Il campo TTL (Time to Live) negli header IP previene che i pacchetti girino all\'infinito — si decrementa ad ogni hop.',
          'BGP è il "protocollo di routing di internet" — un avvelenamento della tabella di routing può reindirizzare il traffico globale.'
        ],
        attacks: [
          {
            name: 'IP Spoofing',
            type: 'spoofing',
            description: 'Creazione di pacchetti IP con indirizzo sorgente falsificato per impersonare un altro host o bypassare filtri.',
            howItWorks: '1. L\'attaccante crea pacchetti IP grezzi con l\'IP della vittima come sorgente.\n2. Li invia a un server o rete target.\n3. Il server risponde all\'IP falsificato (la vittima).\n4. Usato per bypassare controlli basati su IP o amplificare attacchi DDoS.',
            impact: 'Bypass dei firewall, amplificazione di attacchi DDoS, facilitazione MITM.',
            mitigation_strategy: 'Implementa filtraggio in entrata e uscita (BCP38). Verifica gli IP sorgente ai confini di rete.',
            severity: 'high'
          },
          {
            name: 'Hijacking del Protocollo di Routing',
            description: 'Iniezione di informazioni di routing false in protocolli come OSPF o RIP per reindirizzare o scartare il traffico.',
            howItWorks: '1. L\'attaccante si unisce a un segmento di rete come router.\n2. Invia aggiornamenti di routing falsi dichiarando un percorso più veloce verso una rete.\n3. I router legittimi aggiornano le loro tabelle con il percorso falso.\n4. L\'attaccante diventa un MITM per il traffico tra reti.',
            impact: 'Reindirizzamento del traffico, MITM a livello di intera rete, scarto selettivo dei pacchetti.',
            mitigation_strategy: 'Usa l\'autenticazione nei protocolli di routing (es. OSPF MD5). Limita le adiacenze dei vicini.',
            severity: 'high'
          },
          {
            name: 'Attacco Smurf ICMP',
            description: 'Attacco DDoS che usa richieste echo ICMP broadcast con l\'IP sorgente della vittima falsificato.',
            howItWorks: '1. L\'attaccante invia richiesta echo ICMP all\'indirizzo broadcast (es. 192.168.1.255).\n2. Usa l\'IP della vittima come sorgente.\n3. Tutti gli host della rete rispondono alla vittima.\n4. Una singola richiesta genera migliaia di risposte che inondano la vittima.',
            impact: 'Saturazione della rete della vittima, potenziale impatto collaterale sulla rete amplificatrice.',
            mitigation_strategy: 'Configura i router per bloccare i pacchetti directed broadcast. Disabilita le risposte ICMP broadcast.',
            severity: 'high'
          },
          {
            name: 'Ping of Death',
            description: 'Invio di pacchetti ICMP sovradimensionati o malformati per mandare in crash, bloccare o destabilizzare il sistema target.',
            howItWorks: '1. ICMP permette pacchetti fino a 65.535 byte.\n2. L\'attaccante invia un pacchetto più grande del massimo consentito da IP.\n3. Il pacchetto viene frammentato durante il transito.\n4. Il riassemblaggio sul target causa buffer overflow perché la dimensione totale supera la memoria allocata.',
            impact: 'Crash di sistema, schermata blu (BSOD), kernel panic.',
            mitigation_strategy: 'Aggiorna il SO con le ultime patch di sicurezza. Configura i firewall per scartare pacchetti ICMP che superano le dimensioni MTU standard.',
            severity: 'high'
          },
          {
            name: 'BGP Hijacking',
            description: 'AS malevoli annunciano route con prefissi IP più specifici, catturando traffico internet destinato ad altri.',
            howItWorks: '1. L\'attaccante controlla un Autonomous System (AS) connesso a BGP.\n2. Annuncia la proprietà di blocchi IP effettivamente di altri.\n3. I router preferiscono route più specifiche, reindirizzando il traffico.\n4. L\'attaccante può intercettare, scartare o ispezionare il traffico su scala internet.',
            impact: 'Intercettazione globale del traffico, disruption del routing internet, MITM su scala massiva.',
            mitigation_strategy: 'Distribuisci BGPsec e RPKI per validare crittograficamente le origini delle route.',
            severity: 'critical',
            protocols: ['BGP']
          },
          {
            name: 'Attacco per Frammentazione IP',
            description: 'Invio di frammenti IP malformati o sovrapposti per bypassare dispositivi di sicurezza o crashare sistemi.',
            howItWorks: '1. L\'IP permette di dividere pacchetti grandi in frammenti.\n2. L\'attaccante invia offset di frammenti sovrapposti.\n3. Il riassemblaggio alla destinazione causa buffer overflow o ricostruzione dati errata.\n4. I firewall che non riassemblano i frammenti possono far passare payload malevoli.',
            impact: 'Bypass del firewall, crash di sistema, consegna di payload malevoli.',
            mitigation_strategy: 'Abilita l\'ispezione stateful che riassembla i frammenti prima dell\'ispezione. Scarta i frammenti malformati.',
            severity: 'medium'
          },
          {
            name: 'Attacco Routing Loop',
            type: 'dos',
            description: 'L\'attaccante crea un loop nella rete, forzando i pacchetti a circolare tra i router fino alla scadenza del TTL.',
            howItWorks: '1. L\'attaccante invia aggiornamenti di routing falsi a più router.\n2. Il router A pensa che B abbia il percorso migliore; B pensa che l\'abbia A.\n3. Un pacchetto per quella rete rimbalza tra A e B.\n4. La banda del link viene istantaneamente consumata dai pacchetti in loop.',
            impact: 'Congestione istantanea della rete, saturazione dei link, denial of service.',
            mitigation_strategy: 'Implementa Split Horizon e Route Poisoning. Usa protocolli di routing con meccanismi di prevenzione dei loop.',
            severity: 'high'
          }
        ],
        defenses: [
          {
            name: 'Filtraggio Ingress & Egress',
            description: 'Filtraggio dei pacchetti ai confini di rete per rifiutare quelli con IP sorgente impossibili o non autorizzati.',
            method: 'Scarta i pacchetti in entrata che dichiarano di essere IP interni; scarta i pacchetti in uscita da IP non assegnati.',
            counters: ['IP Spoofing', 'Attacco Smurf ICMP']
          },
          {
            name: 'RPKI (Validazione Origine Route)',
            description: 'Framework crittografico per validare che gli annunci BGP siano autorizzati dai proprietari dei blocchi IP.',
            method: 'Gli ISP creano Route Origin Authorizations (ROA); i router validano gli annunci rispetto alle ROA firmate.',
            counters: ['BGP Hijacking']
          },
          {
            name: 'IPsec',
            description: 'Suite di protocolli per autenticare e cifrare i pacchetti IP a livello di rete.',
            method: 'ESP cifra il contenuto del pacchetto; AH (Authentication Header) verifica l\'integrità.',
            counters: ['IP Spoofing', 'Attacco per Frammentazione IP']
          },
          {
            name: 'Ispezione Stateful dei Pacchetti',
            description: 'Firewall che tracciano il contesto dei pacchetti e riassemblano i frammenti prima dell\'ispezione.',
            method: 'Mantieni una tabella di stato delle connessioni. Riassembla frammenti IP. Scarta pacchetti che violano lo stato atteso.',
            counters: ['Attacco per Frammentazione IP', 'IP Spoofing']
          },
          {
            name: 'Control Plane Policing (CoPP)',
            description: 'Funzione che protegge la CPU del router limitando il traffico destinato al control plane.',
            method: 'Applica policy per filtrare e limitare il traffico come aggiornamenti di routing o ICMP, prevenendo l\'esaurimento della CPU.',
            counters: ['Hijacking del Protocollo di Routing', 'Attacco Smurf ICMP', 'Attacco Routing Loop']
          }
        ]
      }
    }
  },
  {
    id: 2,
    name: 'Data Link',
    color: '#8b5cf6',
    pdu: 'Frame',
    translations: {
      en: {
        name: 'Data Link Layer',
        description: 'Provides node-to-node data transfer within the same network segment. It handles framing, physical addressing (MAC), error detection, and flow control between directly connected devices like switches and network interface cards.',
        responsibilities: [
          'Physical addressing (MAC addresses)',
          'Framing bits into organized data units',
          'Error detection and notification (CRC)',
          'Flow control for local network access'
        ],
        useCases: [
          'Local Area Network switching (Ethernet)',
          'Wireless connection management (802.11)',
          'Broadcast communication within a subnet',
          'Virtual LAN segmentation (VLAN)'
        ],
        protocols: ['Ethernet', '802.11 (Wi-Fi)', 'ARP', 'PPP', 'VLAN (802.1Q)'],
        keyFacts: [
          'MAC addresses are 48-bit hardware identifiers burned into NICs — but they can be spoofed via software.',
          'ARP has NO authentication — it trusts any reply, making it inherently vulnerable to poisoning attacks.',
          'Switches learn MAC addresses from traffic; when the CAM table is full they flood unknown-unicast frames to every port of the same VLAN (fail-open) — flooding, not broadcasting, and never across VLANs.'
        ],
        attacks: [
          {
            name: 'ARP Poisoning / Spoofing',
            type: 'mitm',
            description: 'Attacker sends fake ARP replies to associate their MAC address with a legitimate IP, enabling MITM.',
            howItWorks: '1. Attacker broadcasts: "I am 192.168.1.1 and my MAC is AA:BB:CC..."\n2. Victims update their ARP cache.\n3. Traffic meant for the gateway now flows through the attacker.\n4. Attacker reads or modifies traffic, then forwards it (invisible MITM).',
            impact: 'Man-in-the-Middle, credential interception, traffic manipulation.',
            mitigation_strategy: 'Enable Dynamic ARP Inspection (DAI) on managed switches. Use static ARP entries for critical hosts.',
            severity: 'critical'
          },
          {
            name: 'STP Root Bridge Hijacking',
            description: 'Attacker forces their own device to be elected as the Root Bridge of the Spanning Tree Protocol.',
            howItWorks: '1. Attacker sends superior BPDUs with the lowest possible Priority.\n2. Switches re-calculate STP topology.\n3. Attacker\'s device becomes the central Root Bridge.\n4. Network traffic is rerouted through the attacker\'s port for inspection.',
            impact: 'Man-in-the-Middle at the physical switch level, network instability.',
            mitigation_strategy: 'Enable BPDU Guard on all access ports to block unauthorized BPDUs.',
            severity: 'high'
          },
          {
            name: 'VLAN Trunking Protocol (VTP) Attack',
            description: 'Attacker sends malicious VTP messages to delete or modify VLAN configurations across the network.',
            howItWorks: '1. Attacker connects a device and identifies a trunk port.\n2. Injects VTP packets with a higher revision number and zero VLANs.\n3. Other switches in the VTP domain accept the "update".\n4. Existing VLANs are deleted network-wide, causing massive outage.',
            impact: 'Network-wide Denial of Service, potential VLAN leakage.',
            mitigation_strategy: 'Use VTP passwords. Set switches to VTP transparent mode or disable VTP entirely.',
            severity: 'critical'
          },
          {
            name: 'MAC Flooding',
            description: 'Attacker floods a switch with frames using fake source MAC addresses, filling its CAM table.',
            howItWorks: '1. Attacker uses a tool (macof) to generate thousands of frames with random MAC addresses.\n2. Switch\'s CAM table fills to capacity.\n3. Switch fails open — starts broadcasting all frames to every port.\n4. Attacker on any port can sniff all network traffic.',
            impact: 'Full LAN traffic interception, equivalent to being a passive wiretap on the network.',
            mitigation_strategy: 'Configure port security on switches — limit the number of MAC addresses per port.',
            severity: 'high'
          },
          {
            name: 'VLAN Hopping',
            description: 'Attacker bypasses VLAN segmentation to send traffic to VLANs they shouldn\'t have access to.',
            howItWorks: '1. Switch trunk ports by default allow all VLANs.\n2. Attacker\'s port auto-negotiates trunking (DTP exploit).\n3. Attacker tags frames with target VLAN ID.\n4. Switch forwards frames into the target VLAN — segmentation bypassed.',
            impact: 'Access to network segments intended to be isolated (e.g., production, management VLANs).',
            mitigation_strategy: 'Disable DTP on access ports. Set native VLAN to an unused ID. Explicitly configure trunk ports.',
            severity: 'high'
          },
          {
            name: 'Rogue DHCP Server',
            description: 'Attacker runs an unauthorized DHCP server that provides fake network configuration to clients.',
            howItWorks: '1. Client broadcasts DHCP Discover.\n2. Attacker\'s rogue server responds first with a DHCP Offer.\n3. Attacker sets their own machine as the default gateway.\n4. All client traffic routes through attacker\'s machine.',
            impact: 'Man-in-the-Middle attack on all newly connected clients, traffic interception.',
            mitigation_strategy: 'Enable DHCP Snooping on managed switches — only allow DHCP responses from trusted uplink ports.',
            severity: 'high'
          },
          {
            name: 'DHCP Starvation',
            type: 'dos',
            description: 'Attacker exhausts the DHCP server\'s IP pool by sending thousands of DHCP requests with different MACs.',
            howItWorks: '1. Attacker generates fake DHCP Discover packets with random source MACs.\n2. Server assigns an IP for each request and adds it to its lease table.\n3. Within seconds, all available IPs in the scope are exhausted.\n4. New legitimate clients cannot obtain an IP and cannot join the network.',
            impact: 'Network-wide denial of service for all new connections.',
            mitigation_strategy: 'Enable Port Security to limit the number of MAC addresses on a single port. Use DHCP Snooping.',
            severity: 'high'
          }
        ],
        defenses: [
          {
            name: 'Dynamic ARP Inspection (DAI)',
            description: 'Switch feature that validates ARP packets against a trusted DHCP snooping binding table.',
            method: 'Intercept all ARP packets on untrusted ports. Validate IP-to-MAC mapping against DHCP bindings. Drop invalid ones.',
            counters: ['ARP Poisoning / Spoofing']
          },
          {
            name: 'Port Security',
            description: 'Switch feature that limits and locks the number of MAC addresses learned on each port.',
            method: 'Define max MACs per port. Shut down port or drop frames if limit exceeded or unknown MAC appears.',
            counters: ['MAC Flooding']
          },
          {
            name: 'DHCP Snooping',
            description: 'Switch feature that filters DHCP messages and builds a trusted binding table of IP-MAC-port mappings.',
            method: 'Mark client-facing ports as untrusted; only uplink/server ports are trusted for DHCP offers.',
            counters: ['Rogue DHCP Server', 'ARP Poisoning / Spoofing']
          },
          {
            name: 'Private VLANs & DTP Disable',
            description: 'Disabling trunk auto-negotiation and using Private VLANs to isolate hosts within the same VLAN.',
            method: 'switchport nonegotiate on all access ports. Configure PVLANs to restrict intra-VLAN communication.',
            counters: ['VLAN Hopping']
          }
        ]
      },
      it: {
        name: 'Livello Collegamento Dati',
        description: 'Fornisce il trasferimento dati nodo-a-nodo all\'interno dello stesso segmento di rete. Gestisce il framing, l\'indirizzamento fisico (MAC), il rilevamento errori e il controllo del flusso tra dispositivi direttamente connessi come switch e schede di rete.',
        responsibilities: [
          'Indirizzamento fisico (indirizzi MAC)',
          'Framing dei bit in unità di dati organizzate',
          'Rilevamento e notifica degli errori (CRC)',
          'Controllo del flusso per l\'accesso alla rete locale'
        ],
        useCases: [
          'Switching di rete locale (Ethernet)',
          'Gestione della connessione wireless (802.11)',
          'Comunicazione broadcast all\'interno di una subnet',
          'Segmentazione LAN virtuale (VLAN)'
        ],
        protocols: ['Ethernet', '802.11 (Wi-Fi)', 'ARP', 'PPP', 'VLAN (802.1Q)'],
        keyFacts: [
          'Gli indirizzi MAC sono identificatori hardware a 48 bit impressi nelle NIC — ma possono essere falsificati via software.',
          'ARP NON ha autenticazione — si fida di qualsiasi risposta, rendendolo intrinsecamente vulnerabile agli attacchi di poisoning.',
          'Gli switch imparano gli indirizzi MAC dal traffico; con la CAM table piena eseguono il flooding dei frame unknown-unicast su tutte le porte della stessa VLAN (fail-open): è flooding, non broadcast, e non attraversa le VLAN.'
        ],
        attacks: [
          {
            name: 'ARP Poisoning / Spoofing',
            type: 'mitm',
            description: 'L\'attaccante invia risposte ARP false per associare il proprio MAC a un IP legittimo, abilitando il MITM.',
            howItWorks: '1. L\'attaccante trasmette: "Sono 192.168.1.1 e il mio MAC è AA:BB:CC..."\n2. Le vittime aggiornano la loro cache ARP.\n3. Il traffico destinato al gateway ora fluisce attraverso l\'attaccante.\n4. L\'attaccante legge o modifica il traffico, poi lo re-invia (MITM invisibile).',
            impact: 'Man-in-the-Middle, intercettazione credenziali, manipolazione del traffico.',
            mitigation_strategy: 'Abilita il Dynamic ARP Inspection (DAI) sugli switch gestiti. Usa voci ARP statiche per host critici.',
            severity: 'critical'
          },
          {
            name: 'STP Root Bridge Hijacking',
            description: 'L\'attaccante forza il proprio dispositivo a essere eletto come Root Bridge del protocollo Spanning Tree.',
            howItWorks: '1. L\'attaccante invia BPDU "superiori" con la priorità più bassa possibile.\n2. Gli switch ricalcolano la topologia STP.\n3. Il dispositivo dell\'attaccante diventa il Root Bridge centrale.\n4. Il traffico di rete viene reindirizzato attraverso la porta dell\'attaccante.',
            impact: 'Man-in-the-Middle a livello di switch fisico, instabilità della rete.',
            mitigation_strategy: 'Abilita BPDU Guard su tutte le porte di accesso per bloccare BPDU non autorizzate.',
            severity: 'high'
          },
          {
            name: 'Attacco VTP (VLAN Trunking Protocol)',
            description: 'L\'attaccante invia messaggi VTP malevoli per eliminare o modificare le configurazioni VLAN in tutta la rete.',
            howItWorks: '1. L\'attaccante si connette e identifica una porta trunk.\n2. Inietta pacchetti VTP con un numero di revisione più alto e zero VLAN.\n3. Gli altri switch nel dominio VTP accettano l\'aggiornamento.\n4. Le VLAN esistenti vengono eliminate dall\'intera rete, causando un blackout massivo.',
            impact: 'Denial of Service a livello di intera rete, potenziale perdita di isolamento VLAN.',
            mitigation_strategy: 'Usa password VTP. Imposta gli switch in modalità VTP transparent o disabilita VTP.',
            severity: 'critical'
          },
          {
            name: 'MAC Flooding',
            description: 'L\'attaccante inonda uno switch con frame usando indirizzi MAC sorgente falsi, riempiendo la sua tabella CAM.',
            howItWorks: '1. L\'attaccante usa uno strumento (macof) per generare migliaia di frame con MAC casuali.\n2. La tabella CAM dello switch si riempie.\n3. Lo switch va in fail-open — inizia a trasmettere tutti i frame su ogni porta.\n4. L\'attaccante su qualsiasi porta può sniffare tutto il traffico di rete.',
            impact: 'Intercettazione completa del traffico LAN, equivalente a un wiretap passivo sulla rete.',
            mitigation_strategy: 'Configura la port security sugli switch — limita il numero di indirizzi MAC per porta.',
            severity: 'high'
          },
          {
            name: 'VLAN Hopping',
            description: 'L\'attaccante bypassa la segmentazione VLAN per inviare traffico a VLAN a cui non dovrebbe avere accesso.',
            howItWorks: '1. Le porte trunk degli switch consentono di default tutte le VLAN.\n2. La porta dell\'attaccante negozia automaticamente il trunking (exploit DTP).\n3. L\'attaccante marca i frame con l\'ID della VLAN target.\n4. Lo switch forwarda i frame nella VLAN target — segmentazione bypassata.',
            impact: 'Accesso a segmenti di rete isolati (es. VLAN di produzione, gestione).',
            mitigation_strategy: 'Disabilita DTP sulle porte di accesso. Imposta la native VLAN su un ID inutilizzato. Configura esplicitamente le porte trunk.',
            severity: 'high'
          },
          {
            name: 'Server DHCP Rogue',
            description: 'L\'attaccante esegue un server DHCP non autorizzato che fornisce configurazioni di rete false ai client.',
            howItWorks: '1. Il client trasmette DHCP Discover.\n2. Il server rogue dell\'attaccante risponde per primo con un DHCP Offer.\n3. L\'attaccante imposta la propria macchina come gateway predefinito.\n4. Tutto il traffico del client viene instradato attraverso la macchina dell\'attaccante.',
            impact: 'Attacco Man-in-the-Middle su tutti i client appena connessi, intercettazione traffico.',
            mitigation_strategy: 'Abilita il DHCP Snooping sugli switch gestiti — consenti risposte DHCP solo dalle porte uplink attendibili.',
            severity: 'high'
          },
          {
            name: 'DHCP Starvation',
            type: 'dos',
            description: 'L\'attaccante esaurisce il pool di IP del server DHCP inviando migliaia di richieste con MAC diversi.',
            howItWorks: '1. L\'attaccante genera pacchetti DHCP Discover con MAC sorgente casuali.\n2. Il server assegna un IP per ogni richiesta e lo aggiunge alla tabella dei lease.\n3. In pochi secondi, tutti gli IP disponibili vengono esauriti.\n4. I nuovi client legittimi non possono ottenere un IP e non possono unirsi alla rete.',
            impact: 'Denial of service a livello di intera rete per tutte le nuove connessioni.',
            mitigation_strategy: 'Abilita la Port Security per limitare il numero di indirizzi MAC su una singola porta. Usa DHCP Snooping.',
            severity: 'high'
          }
        ],
        defenses: [
          {
            name: 'Dynamic ARP Inspection (DAI)',
            description: 'Funzione dello switch che valida i pacchetti ARP rispetto a una tabella di binding DHCP snooping affidabile.',
            method: 'Intercetta tutti i pacchetti ARP sulle porte non attendibili. Valida la mappatura IP-MAC rispetto ai binding DHCP. Scarta quelli non validi.',
            counters: ['ARP Poisoning / Spoofing']
          },
          {
            name: 'Port Security',
            description: 'Funzione dello switch che limita e blocca il numero di indirizzi MAC appresi su ogni porta.',
            method: 'Definisci il numero massimo di MAC per porta. Spegni la porta o scarta frame se il limite viene superato.',
            counters: ['MAC Flooding']
          },
          {
            name: 'DHCP Snooping',
            description: 'Funzione dello switch che filtra i messaggi DHCP e costruisce una tabella di binding affidabile IP-MAC-porta.',
            method: 'Marca le porte lato client come non attendibili; solo le porte uplink/server sono attendibili per le offerte DHCP.',
            counters: ['Server DHCP Rogue', 'ARP Poisoning / Spoofing']
          },
          {
            name: 'Private VLAN & Disable DTP',
            description: 'Disabilitazione dell\'auto-negoziazione trunk e uso di Private VLAN per isolare host nella stessa VLAN.',
            method: 'switchport nonegotiate su tutte le porte di accesso. Configura PVLAN per limitare la comunicazione intra-VLAN.',
            counters: ['VLAN Hopping']
          }
        ]
      }
    }
  },
  {
    id: 1,
    name: 'Physical',
    color: '#ec4899',
    pdu: 'Bits',
    translations: {
      en: {
        name: 'Physical Layer',
        description: 'The foundation of all networking — responsible for transmitting raw bit streams over physical media. It defines electrical, optical, and radio signal specifications, cable types, connectors, and the physical topology of networks.',
        responsibilities: [
          'Transmission of raw bit-streams',
          'Signal encoding and synchronization',
          'Mechanical and electrical specifications',
          'Physical network topology design'
        ],
        useCases: [
          'Cabling infrastructure (Copper, Fiber)',
          'Wireless radio signaling',
          'Hardware interfaces (USB, Bluetooth)',
          'Hub and repeater signal regeneration'
        ],
        protocols: ['DSL', 'USB', 'Ethernet (Copper/Fiber)', 'Wi-Fi (Radio)', 'Bluetooth'],
        keyFacts: [
          'At this layer, data is just voltage levels, light pulses, or radio waves — pure physics, no logic.',
          'Fiber optic cables are inherently harder to tap than copper cables — light doesn\'t radiate like electrical signals.',
          'Physical layer attacks often require physical proximity, but they are the hardest to detect remotely.'
        ],
        attacks: [
          {
            name: 'Wiretapping',
            type: 'eavesdropping',
            description: 'Physically splicing into copper network cables to passively intercept electrical signals.',
            howItWorks: '1. Attacker gains physical access to cabling (e.g., patch panel, in-wall wiring).\n2. Splices a tap device onto the wire.\n3. Electrical signals are duplicated and captured.\n4. Attacker can replay traffic analysis from a remote location.',
            impact: 'Passive traffic interception, credential harvesting, long-term surveillance.',
            mitigation_strategy: 'Use fiber optic cables (harder to tap). Encrypt all traffic. Implement physical cable protection (conduits, tamper-evident seals).',
            severity: 'high'
          },
          {
            name: 'Signal Jamming',
            description: 'Transmitting radio frequency interference to disrupt wireless communications.',
            howItWorks: '1. Attacker uses a radio transmitter on the target frequency (Wi-Fi, cellular).\n2. Noise overwhelms legitimate signals.\n3. Wireless clients cannot communicate with access points.\n4. Results in a localized denial of service affecting the physical area.',
            impact: 'Wireless network unavailability, IoT device disruption, communication blackout.',
            mitigation_strategy: 'Use spread-spectrum technologies (FHSS, DSSS) that are inherently resistant to narrow-band jamming.',
            severity: 'high'
          },
          {
            name: 'Hardware Implant',
            description: 'Installing a rogue hardware device (keylogger, network tap, rogue AP) directly on target equipment.',
            howItWorks: '1. Attacker gains physical access to a server room, desktop, or network device.\n2. Installs a tiny device on a USB port, PCI slot, or in-line on a cable.\n3. Device captures keystrokes, network traffic, or provides a backdoor channel.\n4. Data is exfiltrated via Wi-Fi, cellular, or retrieved later physically.',
            impact: 'Long-term persistent access, undetectable by network-based security tools.',
            mitigation_strategy: 'Strict physical access control (badge + biometrics + video). Regular hardware audits. Tamper-evident seals.',
            severity: 'critical'
          },
          {
            name: 'Cable / Power Disruption',
            description: 'Physically cutting network cables or disrupting power to cause denial of service.',
            howItWorks: '1. Attacker locates critical infrastructure cabling (fiber trunks, power feeds).\n2. Cuts or disconnects cables, or disrupts UPS/power systems.\n3. Network segments go dark immediately.\n4. Recovery requires physical repair and may take hours.',
            impact: 'Immediate network outage, data center disruption, loss of availability.',
            mitigation_strategy: 'Redundant physical paths (diverse routing). Buried / armored cables. Uninterruptible power supplies.',
            severity: 'high'
          },
          {
            name: 'TEMPEST / Side-channel Attack',
            type: 'eavesdropping',
            description: 'Intercepting electromagnetic radiation from hardware (monitors, cables, keyboards) to recover data.',
            howItWorks: '1. Electronic devices emit unintentional electromagnetic signals during operation.\n2. Attacker uses sensitive antennas nearby to capture these signals.\n3. Digital signal processing reconstructs the screen image or keystrokes.\n4. Critical info is stolen without any physical or logical contact.',
            impact: 'Passive theft of highly sensitive data, passwords, and cryptographic keys.',
            mitigation_strategy: 'Use shielded cabling (STP). Implement Faraday cages for sensitive equipment. Follow TEMPEST standards for hardware.',
            severity: 'high'
          },
          {
            name: 'EMP Attack (Electromagnetic Pulse)',
            type: 'dos',
            description: 'Using a high-energy electromagnetic burst to permanently damage or destroy electronic hardware.',
            howItWorks: '1. Attacker detonates a specialized device (e.g., non-nuclear EMP generator).\n2. Intense electromagnetic currents are induced in all nearby wiring.\n3. Delicate semiconductor components in servers and switches are instantly fried.\n4. Entire network infrastructure is permanently disabled.',
            impact: 'Permanent destruction of network hardware, long-term massive outage.',
            mitigation_strategy: 'Electromagnetic hardening of data centers. Use surge protectors and specialized shielding.',
            severity: 'critical'
          }
        ],
        defenses: [
          {
            name: 'Physical Access Control',
            description: 'Restricting who can physically enter areas with network equipment.',
            method: 'Multi-factor physical authentication (badge + PIN + biometrics). Mantrap entries. Security cameras with 24/7 monitoring.',
            counters: ['Wiretapping', 'Hardware Implant', 'Cable / Power Disruption']
          },
          {
            name: 'Faraday Shielding',
            description: 'Using conductive enclosures to block external electromagnetic fields.',
            method: 'Install Faraday cages around sensitive server racks to block both TEMPEST leaks and EMP pulses.',
            counters: ['TEMPEST / Side-channel Attack', 'EMP Attack (Electromagnetic Pulse)']
          },
          {
            name: 'Fiber Optic Cabling',
            description: 'Using fiber instead of copper for sensitive links — light signals don\'t radiate and are harder to tap.',
            method: 'Light-based transmission requires physical splicing and causes signal loss when tapped — making taps detectable.',
            counters: ['Wiretapping']
          },
          {
            name: 'Tamper-Evident Seals & Hardware Audits',
            description: 'Physical seals that reveal if hardware has been opened or tampered with.',
            method: 'Apply tamper-evident labels to hardware. Periodically audit for unexpected devices or modifications.',
            counters: ['Hardware Implant']
          },
          {
            name: 'Redundant Infrastructure',
            description: 'Deploying redundant physical paths, power supplies, and geographic diversity.',
            method: 'Dual fiber paths via diverse routes. Multiple ISP connections. N+1 UPS. Geographically distributed data centers.',
            counters: ['Cable / Power Disruption', 'Signal Jamming']
          }
        ]
      },
      it: {
        name: 'Livello Fisico',
        description: 'La fondamenta di tutta la rete — responsabile della trasmissione di flussi di bit grezzi su supporti fisici. Definisce le specifiche dei segnali elettrici, ottici e radio, i tipi di cavo, i connettori e la topologia fisica delle reti.',
        responsibilities: [
          'Trasmissione di flussi di bit grezzi',
          'Codifica e sincronizzazione del segnale',
          'Specifiche meccaniche ed elettriche',
          'Design della topologia fisica di rete'
        ],
        useCases: [
          'Infrastruttura di cablaggio (Rame, Fibra)',
          'Segnalazione radio wireless',
          'Interfacce hardware (USB, Bluetooth)',
          'Rigenerazione del segnale hub e repeater'
        ],
        protocols: ['DSL', 'USB', 'Ethernet (Rame/Fibra)', 'Wi-Fi (Radio)', 'Bluetooth'],
        keyFacts: [
          'A questo livello, i dati sono solo livelli di tensione, impulsi luminosi o onde radio — fisica pura, nessuna logica.',
          'I cavi in fibra ottica sono intrinsecamente più difficili da intercettare rispetto al rame — la luce non irradia come i segnali elettrici.',
          'Gli attacchi al livello fisico richiedono spesso vicinanza fisica, ma sono i più difficili da rilevare remotamente.'
        ],
        attacks: [
          {
            name: 'Intercettazione Fisica (Wiretapping)',
            type: 'eavesdropping',
            description: 'Splicing fisico nei cavi di rete in rame per intercettare passivamente i segnali elettrici.',
            howItWorks: '1. L\'attaccante ottiene accesso fisico ai cavi (es. patch panel, cablaggio a parete).\n2. Installa un dispositivo di intercettazione sul cavo.\n3. I segnali elettrici vengono duplicati e catturati.\n4. L\'attaccante può analizzare il traffico da una posizione remota.',
            impact: 'Intercettazione passiva del traffico, raccolta credenziali, sorveglianza a lungo termine.',
            mitigation_strategy: 'Usa cavi in fibra ottica (più difficili da intercettare). Cifra tutto il traffico. Implementa protezione fisica dei cavi.',
            severity: 'high'
          },
          {
            name: 'Signal Jamming',
            description: 'Trasmissione di interferenze radio per disturbare le comunicazioni wireless.',
            howItWorks: '1. L\'attaccante usa un trasmettitore radio sulla frequenza target (Wi-Fi, cellulare).\n2. Il rumore sopraffà i segnali legittimi.\n3. I client wireless non possono comunicare con i punti di accesso.\n4. Risulta in un denial of service localizzato che colpisce l\'area fisica.',
            impact: 'Indisponibilità della rete wireless, disruzione dispositivi IoT, blackout comunicazioni.',
            mitigation_strategy: 'Usa tecnologie spread-spectrum (FHSS, DSSS) intrinsecamente resistenti al jamming a banda stretta.',
            severity: 'high'
          },
          {
            name: 'Impianto Hardware',
            description: 'Installazione di un dispositivo hardware rogue (keylogger, network tap, AP rogue) direttamente sull\'attrezzatura target.',
            howItWorks: '1. L\'attaccante ottiene accesso fisico a una sala server, desktop o dispositivo di rete.\n2. Installa un piccolo dispositivo su una porta USB, slot PCI o in-line su un cavo.\n3. Il dispositivo cattura keystroke, traffico di rete o fornisce un canale backdoor.\n4. I dati vengono esfiltrati via Wi-Fi, cellulare o recuperati fisicamente in seguito.',
            impact: 'Accesso persistente a lungo termine, non rilevabile dagli strumenti di sicurezza basati sulla rete.',
            mitigation_strategy: 'Rigoroso controllo accessi fisici (badge + biometria + video). Audit hardware regolari. Sigilli anti-manomissione.',
            severity: 'critical'
          },
          {
            name: 'Taglio Cavi / Interruzione Alimentazione',
            description: 'Taglio fisico dei cavi di rete o interruzione dell\'alimentazione per causare denial of service.',
            howItWorks: '1. L\'attaccante individua i cavi dell\'infrastruttura critica (trunk fibra, alimentazioni).\n2. Taglia o scollega i cavi, o interrompe i sistemi UPS/alimentazione.\n3. I segmenti di rete vanno offline immediatamente.\n4. Il ripristino richiede riparazione fisica e può richiedere ore.',
            impact: 'Interruzione immediata della rete, disruption del data center, perdita di disponibilità.',
            mitigation_strategy: 'Percorsi fisici ridondanti (routing diversificato). Cavi interrati/blindati. Gruppi di continuità.',
            severity: 'high'
          },
          {
            name: 'TEMPEST / Attacco Canale Laterale',
            type: 'eavesdropping',
            description: 'Intercettazione delle radiazioni elettromagnetiche dall\'hardware (monitor, cavi) per recuperare dati.',
            howItWorks: '1. I dispositivi elettronici emettono segnali elettromagnetici involontari.\n2. L\'attaccante usa antenne sensibili nelle vicinanze per catturare i segnali.\n3. Il processamento dei segnali ricostruisce immagini dello schermo o tasti premuti.\n4. Informazioni critiche rubate senza contatto fisico o logico.',
            impact: 'Furto passivo di dati altamente sensibili, password e chiavi crittografiche.',
            mitigation_strategy: 'Usa cavi schermati (STP). Implementa gabbie di Faraday per attrezzature sensibili.',
            severity: 'high'
          },
          {
            name: 'Attacco EMP (Impulso Elettromagnetico)',
            type: 'dos',
            description: 'Uso di una scarica elettromagnetica ad alta energia per danneggiare o distruggere permanentemente l\'hardware.',
            howItWorks: '1. L\'attaccante detona un dispositivo specializzato (generatore EMP non nucleare).\n2. Correnti elettromagnetiche intense vengono indotte in tutti i cablaggi vicini.\n3. I componenti a semiconduttore in server e switch vengono bruciati istantaneamente.\n4. L\'intera infrastruttura di rete è permanentemente disabilitata.',
            impact: 'Distruzione permanente dell\'hardware di rete, blackout massivo a lungo termine.',
            mitigation_strategy: 'Hardening elettromagnetico dei data center. Usa limitatori di sovratensione e schermature.',
            severity: 'critical'
          }
        ],
        defenses: [
          {
            name: 'Controllo Accessi Fisici',
            description: 'Limitazione di chi può accedere fisicamente alle aree con attrezzature di rete.',
            method: 'Autenticazione fisica multi-fattore (badge + PIN + biometria). Ingressi mantrap. Telecamere di sicurezza con monitoraggio 24/7.',
            counters: ['Intercettazione Fisica (Wiretapping)', 'Impianto Hardware', 'Taglio Cavi / Interruzione Alimentazione']
          },
          {
            name: 'Schermatura di Faraday',
            description: 'Uso di involucri conduttivi per bloccare i campi elettromagnetici esterni.',
            method: 'Installa gabbie di Faraday intorno ai rack server sensibili per bloccare le perdite TEMPEST e gli impulsi EMP.',
            counters: ['TEMPEST / Attacco Canale Laterale', 'Attacco EMP (Impulso Elettromagnetico)']
          },
          {
            name: 'Cablaggio in Fibra Ottica',
            description: 'Uso della fibra invece del rame per link sensibili — i segnali luminosi non irradiano e sono più difficili da intercettare.',
            method: 'La trasmissione basata sulla luce richiede splicing fisico e causa perdita di segnale quando viene intercettata — rendendo i tap rilevabili.',
            counters: ['Intercettazione Fisica (Wiretapping)']
          },
          {
            name: 'Sigilli Anti-Manomissione & Audit Hardware',
            description: 'Sigilli fisici che rivelano se l\'hardware è stato aperto o manomesso.',
            method: 'Applica etichette anti-manomissione all\'hardware. Esegui audit periodici per dispositivi o modifiche inaspettate.',
            counters: ['Impianto Hardware']
          },
          {
            name: 'Infrastruttura Ridondante',
            description: 'Distribuzione di percorsi fisici ridondanti, alimentatori e diversità geografica.',
            method: 'Doppi percorsi fibra via route diverse. Connessioni ISP multiple. UPS N+1. Data center geograficamente distribuiti.',
            counters: ['Taglio Cavi / Interruzione Alimentazione', 'Signal Jamming']
          }
        ]
      }
    }
  }
];

export const ATTACK_SCENARIOS: AttackScenario[] = [
  {
    id: 'l1-jamming',
    name: { en: 'Signal Jamming', it: 'Disturbo del Segnale' },
    description: { en: 'Physical layer attack that blocks wireless communication via noise.', it: 'Attacco al livello Fisico che blocca le comunicazioni wireless tramite rumore.' },
    recommendedDefense: { en: 'Shielding, dynamic frequency hopping, or directional antennas.', it: 'Schermatura, frequency hopping dinamico o antenne direzionali.' },
    targetLayer: 1,
    attackType: 'dos',
    defenseEnabled: false
  },
  {
    id: 'l1-tapping',
    name: { en: 'Physical Tapping', it: 'Intercettazione Fisica' },
    description: { en: 'Splicing into a cable to intercept electrical signals.', it: 'Intercettazione di un cavo per catturare segnali elettrici.' },
    recommendedDefense: { en: 'Physical security of cabling, use of fiber optics (harder to tap).', it: 'Sicurezza fisica del cablaggio, uso della fibra ottica (difficile da intercettare).' },
    targetLayer: 1,
    attackType: 'eavesdropping',
    defenseEnabled: false
  },
  {
    id: 'l2-mitm',
    name: { en: 'ARP Poisoning MITM', it: 'ARP Poisoning MITM' },
    description: { en: 'Intercepting local traffic by poisoning the ARP cache.', it: 'Intercettazione del traffico locale avvelenando la cache ARP.' },
    recommendedDefense: { en: 'Dynamic ARP Inspection (DAI) on managed switches.', it: 'Dynamic ARP Inspection (DAI) su switch gestiti.' },
    targetLayer: 2,
    attackType: 'mitm',
    defenseEnabled: false
  },
  {
    id: 'l2-mac-flood',
    name: { en: 'MAC Flooding', it: 'MAC Flooding' },
    description: { en: 'Filling the switch CAM table so unknown-unicast frames are flooded to every port of the VLAN (fail-open).', it: 'Riempimento della CAM table dello switch perché i frame unknown-unicast subiscano flooding su tutte le porte della VLAN (fail-open).' },
    recommendedDefense: { en: 'Port Security with limit on MAC address count per port.', it: 'Port Security con limite sul numero di indirizzi MAC per porta.' },
    targetLayer: 2,
    attackType: 'dos',
    defenseEnabled: false
  },
  {
    id: 'l2-dhcp-starve',
    name: { en: 'DHCP Starvation', it: 'DHCP Starvation' },
    description: { en: 'Exhausting the DHCP pool to deny access to new clients.', it: 'Esaurimento del pool DHCP per negare l\'accesso ai nuovi client.' },
    recommendedDefense: { en: 'DHCP Snooping and Port Security.', it: 'DHCP Snooping e Port Security.' },
    targetLayer: 2,
    attackType: 'dos',
    defenseEnabled: false
  },
  {
    id: 'l3-spoofing',
    name: { en: 'IP Spoofing', it: 'IP Spoofing' },
    description: { en: 'Sending packets with forged source IP addresses.', it: 'Invio di pacchetti con indirizzi IP sorgente contraffatti.' },
    recommendedDefense: { en: 'Ingress/Egress filtering (Unicast RPF) at router level.', it: 'Filtraggio Ingress/Egress (Unicast RPF) a livello router.' },
    targetLayer: 3,
    attackType: 'spoofing',
    defenseEnabled: false
  },
  {
    id: 'l3-smurf',
    name: { en: 'ICMP Smurf', it: 'ICMP Smurf' },
    description: { en: 'Amplifying a DoS attack using broadcast ICMP echoes.', it: 'Amplificazione di un DoS usando echo ICMP broadcast.' },
    recommendedDefense: { en: 'Disabling IP directed broadcasts on router interfaces.', it: 'Uso di firewall per bloccare echo ICMP broadcast.' },
    targetLayer: 3,
    attackType: 'dos',
    defenseEnabled: false
  },
  {
    id: 'l3-frag',
    name: { en: 'IP Fragmentation', it: 'Frammentazione IP' },
    description: { en: 'Overlapping packets to bypass firewalls or crash systems.', it: 'Pacchetti sovrapposti per bypassare firewall o crashare sistemi.' },
    recommendedDefense: { en: 'Stateful firewall with fragment reassembly and inspection.', it: 'Firewall stateful con riassemblaggio e ispezione dei frammenti.' },
    targetLayer: 3,
    attackType: 'injection',
    defenseEnabled: false
  },
  {
    id: 'l4-dos',
    name: { en: 'TCP SYN Flood', it: 'TCP SYN Flood' },
    description: { en: 'Exhausting server resources with incomplete handshakes.', it: 'Esaurimento delle risorse del server con handshake incompleti.' },
    recommendedDefense: { en: 'SYN Cookies, rate limiting, or reverse proxies.', it: 'SYN Cookies, limitazione del rate o reverse proxy.' },
    targetLayer: 4,
    attackType: 'dos',
    defenseEnabled: false
  },
  {
    id: 'l4-udp-flood',
    name: { en: 'UDP Flood', it: 'UDP Flood' },
    description: { en: 'Overwhelming a target with high-volume UDP traffic.', it: 'Travolgere un target con un alto volume di traffico UDP.' },
    recommendedDefense: { en: 'Anycast DDoS mitigation and high-capacity firewalls.', it: 'Mitigazione DDoS Anycast e firewall ad alta capacità.' },
    targetLayer: 4,
    attackType: 'dos',
    defenseEnabled: false
  },
  {
    id: 'l4-scan',
    name: { en: 'Port Scanning', it: 'Port Scanning' },
    description: { en: 'Probing ports to find vulnerable services.', it: 'Sondaggio delle porte per trovare servizi vulnerabili.' },
    recommendedDefense: { en: 'Intrusion Detection Systems (IDS) and strict firewall rules.', it: 'Sistemi di rilevamento intrusioni (IDS) e regole firewall severe.' },
    targetLayer: 4,
    attackType: 'eavesdropping',
    defenseEnabled: false
  },
  {
    id: 'l5-replay',
    name: { en: 'Replay Attack', it: 'Attacco di Replay' },
    description: { en: 'Intercepting and re-sending a valid session token.', it: 'Intercettazione e reinvio di un token di sessione valido.' },
    recommendedDefense: { en: 'Anti-replay counters, one-time nonces, and TLS.', it: 'Contatori anti-replay, nonce usa e getta e TLS.' },
    targetLayer: 5,
    attackType: 'replay',
    defenseEnabled: false
  },
  {
    id: 'l5-hijacking',
    name: { en: 'Session Hijacking', it: 'Session Hijacking' },
    description: { en: 'Taking over an active authenticated user session.', it: 'Acquisizione di una sessione utente autenticata attiva.' },
    recommendedDefense: { en: 'Secure session tokens, HSTS, and multi-factor auth.', it: 'Token di sessione sicuri, HSTS e autenticazione a più fattori.' },
    targetLayer: 5,
    attackType: 'mitm',
    defenseEnabled: false
  },
  {
    id: 'l6-oracle',
    name: { en: 'Padding Oracle', it: 'Padding Oracle' },
    description: { en: 'Exploiting encryption padding to decrypt messages.', it: 'Sfruttare il padding della cifratura per decifrare messaggi.' },
    recommendedDefense: { en: 'Authenticated encryption (AES-GCM) and generic error messages.', it: 'Crittografia autenticata (AES-GCM) e messaggi di errore generici.' },
    targetLayer: 6,
    attackType: 'injection',
    defenseEnabled: false
  },
  {
    id: 'l7-injection',
    name: { en: 'SQL Injection', it: 'SQL Injection' },
    description: { en: 'Injecting malicious SQL code into web applications.', it: 'Iniezione di codice SQL malevolo nelle applicazioni web.' },
    recommendedDefense: { en: 'Input validation, parameterized queries, and Web Application Firewalls (WAF).', it: 'Validazione input, query parametrizzate e Web Application Firewall (WAF).' },
    targetLayer: 7,
    attackType: 'injection',
    defenseEnabled: false
  },
  {
    id: 'l7-xss',
    name: { en: 'Cross-Site Scripting (XSS)', it: 'Cross-Site Scripting (XSS)' },
    description: { en: 'Injecting malicious scripts into web pages viewed by users.', it: 'Iniezione di script malevoli nelle pagine web caricate dagli utenti.' },
    recommendedDefense: { en: 'Content Security Policy (CSP) and strict output encoding.', it: 'Content Security Policy (CSP) e codifica rigorosa dell\'output.' },
    targetLayer: 7,
    attackType: 'injection',
    defenseEnabled: false
  },
  {
    id: 'l7-homograph',
    name: { en: 'Homograph Phishing', it: 'Phishing Omografico' },
    description: { en: 'Using visually identical characters to mimic domains.', it: 'Uso di caratteri visivamente identici per imitare domini.' },
    recommendedDefense: { en: 'Browser punycode protection and user awareness training.', it: 'Protezione punycode nei browser e formazione degli utenti.' },
    targetLayer: 7,
    attackType: 'spoofing',
    defenseEnabled: false
  },
  {
    id: 'l7-dns-poison',
    name: { en: 'DNS Cache Poisoning', it: 'Avvelenamento Cache DNS' },
    description: { en: 'Redirecting users to malicious sites by corrupting DNS resolver cache.', it: 'Reindirizzamento degli utenti verso siti malevoli corrompendo la cache del resolver DNS.' },
    recommendedDefense: { en: 'Implementing DNSSEC and high-entropy transaction IDs.', it: 'Implementazione di DNSSEC e ID di transazione ad alta entropia.' },
    targetLayer: 7,
    attackType: 'spoofing',
    defenseEnabled: false
  },
  {
    id: 'l7-slowloris',
    name: { en: 'Slowloris HTTP DoS', it: 'Slowloris HTTP DoS' },
    description: { en: 'Keeping many HTTP connections open by sending partial requests slowly.', it: 'Mantenimento di molte connessioni HTTP aperte inviando richieste parziali lentamente.' },
    recommendedDefense: { en: 'Limiting concurrent connections and using reverse proxies.', it: 'Limitazione delle connessioni simultanee e uso di reverse proxy.' },
    targetLayer: 7,
    attackType: 'dos',
    defenseEnabled: false
  },
  {
    id: 'l4-tcp-reset',
    name: { en: 'TCP Reset Attack', it: 'Attacco TCP Reset' },
    description: { en: 'Killing a TCP session by injecting a spoofed RST packet.', it: 'Terminare una sessione TCP iniettando un pacchetto RST contraffatto.' },
    recommendedDefense: { en: 'Encryption (TLS) and harder-to-predict sequence numbers.', it: 'Crittografia (TLS) e numeri di sequenza difficili da predire.' },
    targetLayer: 4,
    attackType: 'dos',
    defenseEnabled: false
  },
  {
    id: 'l3-pod',
    name: { en: 'Ping of Death', it: 'Ping of Death' },
    description: { en: 'Sending oversized or malformed ICMP packets to crash systems.', it: 'Invio di pacchetti ICMP sovradimensionati o malformati per crashare i sistemi.' },
    recommendedDefense: { en: 'Modern OS patches and ICMP size filtering on routers.', it: 'Patch per OS moderni e filtraggio delle dimensioni ICMP sui router.' },
    targetLayer: 3,
    attackType: 'dos',
    defenseEnabled: false
  },
  {
    id: 'l3-bgp-hijack',
    name: { en: 'BGP Hijacking', it: 'BGP Hijacking' },
    description: { en: 'Redirecting global internet traffic by announcing false IP prefixes.', it: 'Reindirizzamento del traffico internet globale annunciando prefissi IP falsi.' },
    recommendedDefense: {
      en: 'Use RPKI route-origin validation and strict prefix and peer filters; use BGPsec where supported.',
      it: 'Usa la validazione dell’origine delle rotte tramite RPKI e filtri rigorosi su prefissi e peer; usa BGPsec dove supportato.'
    },
    targetLayer: 3,
    attackType: 'spoofing',
    defenseEnabled: false
  },
  {
    id: 'l7-ssh-brute',
    name: { en: 'SSH Brute Force', it: 'Forza Bruta SSH' },
    description: { en: 'Attempting thousands of password combinations to gain remote access.', it: 'Tentativo di migliaia di combinazioni di password per ottenere accesso remoto.' },
    recommendedDefense: { en: 'Implementation of Fail2Ban or PubKey Authentication.', it: 'Implementazione di Fail2Ban o Autenticazione a Chiave Pubblica.' },
    targetLayer: 7,
    attackType: 'bruteforce',
    defenseEnabled: false
  },
  {
    id: 'l7-smtp-relay',
    name: { en: 'SMTP Open Relay', it: 'SMTP Open Relay' },
    description: { en: 'Exploiting misconfigured mail servers to send unauthorized spam.', it: 'Sfruttamento di server di posta mal configurati per inviare spam non autorizzato.' },
    recommendedDefense: { en: 'Closing open relays and implementing SPF/DKIM.', it: 'Chiusura degli open relay e implementazione di SPF/DKIM.' },
    targetLayer: 7,
    attackType: 'spoofing',
    defenseEnabled: false
  },
  {
    id: 'l7-ftp-sniffing',
    name: { en: 'FTP Cleartext Sniffing', it: 'Sniffing FTP in Chiaro' },
    description: { en: 'Capturing credentials sent in unencrypted FTP packets.', it: 'Cattura di credenziali inviate in pacchetti FTP non crittografati.' },
    recommendedDefense: { en: 'Using FTPS or SFTP (Secure FTP) for encrypted transfers.', it: 'Uso di FTPS o SFTP per trasferimenti crittografati.' },
    targetLayer: 7,
    attackType: 'mitm',
    defenseEnabled: false
  }
];

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
      en: 'Virtual Private Network - A technology that creates an encrypted logical tunnel over public, untrusted transport networks, making remote clients access local office LAN assets safely.',
      it: 'Virtual Private Network - Una tecnologia che stabilisce un canale logico cifrato sopra reti pubbliche insicure, consentendo a computer remoti di agire come se fossero fisicamente connessi in ufficio.'
    }
  },
  {
    term: 'PDU',
    definition: {
      en: 'Protocol Data Unit - The name data takes at each layer: Data at L5-L7, Segment at L4 with TCP (Datagram with UDP), Packet at L3, Frame at L2, Bit at L1. Naming the PDU correctly tells you which header you are looking at.',
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
      en: 'Intrusion Detection System - A device or software application that monitors a network or systems for malicious activity or policy violations.',
      it: 'Intrusion Detection System - Dispositivo o software che monitora rete o sistemi alla ricerca di attività dannose o violazioni delle policy. Opera fuori banda su una copia del traffico: rileva e allerta, non blocca.'
    }
  },
  {
    term: 'IPS',
    definition: {
      en: 'Intrusion Prevention System - A network security tool that monitors network traffic to detect and actively block or prevent malicious activities.',
      it: 'Intrusion Prevention System - Strumento di sicurezza posto inline sul percorso del traffico: oltre a rilevare può scartare il pacchetto o terminare la sessione. Essendo inline, un falso positivo blocca traffico legittimo e un guasto impatta la disponibilità.'
    }
  },
  {
    term: 'NIDS / NIPS',
    definition: {
      en: 'Network-based IDS/IPS - Monitors and analyzes traffic from multiple devices on an entire subnet to identify security threats.',
      it: 'Network-based IDS/IPS - Analizza il traffico di più dispositivi di un intero segmento, ricevuto via SPAN/port mirroring o TAP (NIDS) oppure inline (NIPS). Non vede ciò che resta dentro l\'host né, senza decifratura, il contenuto del traffico cifrato.'
    }
  },
  {
    term: 'HIDS / HIPS',
    definition: {
      en: 'Host-based IDS/IPS - Installed directly on a specific host or device to monitor internal operating system activities and files.',
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
      en: 'Extensible Authentication Protocol - An authentication framework frequently used in wireless networks and point-to-point links. It supports various authentication methods like EAP-TLS (highly secure, certificate-based), EAP-PEAP, and EAP-TTLS (tunnel-based).',
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
      en: 'Open Systems Interconnection Model - A theoretical framework of 7 conceptual layers developed by the ISO to standardize and partition network telecommunication functions.',
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
      en: 'User Datagram Protocol - A connectionless Transport layer (Layer 4) protocol. It is not faster on the wire than TCP: it has an 8-byte header and no handshake, acknowledgements, retransmission, ordering, or congestion control, so it avoids the delay those mechanisms introduce. Its PDU is called a datagram.',
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
      it: 'Cross-Site Scripting - Una vulnerabilità in cui l\'attaccante inietta script malevoli (spesso JavaScript) all\'interno di pagine web visitate da altri utenti, consentendo il furto di cookie di sessione.'
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
      en: 'Authenticated Encryption with Associated Data - Encryption modes (like AES-GCM) that guarantee both data confidentiality and cryptographic payload integrity simultaneously, blocking padding tampering.',
      it: 'Authenticated Encryption with Associated Data - Modalità di cifratura (es. AES-GCM, ChaCha20-Poly1305) che garantiscono insieme riservatezza e integrità autenticata del payload: il testo cifrato manomesso viene rifiutato prima di essere decifrato, eliminando gli attacchi di tipo padding oracle tipici delle modalità CBC con MAC applicato dopo.'
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

// Step-by-step "kill chains" for the Attack & Defense Lab: how each attack unfolds and
// exactly where/how the recommended countermeasure neutralizes it.
export const ATTACK_WALKTHROUGHS: AttackWalkthrough[] = [
  {
    scenarioId: 'l1-tapping',
    layer: 1,
    severity: 'high',
    goal: {
      en: 'Silently copy every bit travelling on the physical medium without being on the network logically.',
      it: 'Copiare di nascosto ogni bit che viaggia sul mezzo fisico, senza comparire logicamente sulla rete.'
    },
    steps: [
      { actor: 'attacker', title: { en: 'Physical access to the cable', it: 'Accesso fisico al cavo' }, detail: { en: 'The attacker reaches an exposed copper run or bends a fiber to leak light.', it: "L'attaccante raggiunge un tratto di rame esposto o piega una fibra per farne uscire luce." } },
      { actor: 'attacker', title: { en: 'Install a passive tap', it: 'Installa un tap passivo' }, detail: { en: 'A splitter/vampire-tap mirrors the signal to the attacker with no logical footprint.', it: 'Uno splitter/vampire-tap specchia il segnale verso l\'attaccante senza traccia logica.' }, packet: 'TAP → mirror(RX/TX)' },
      { actor: 'network', title: { en: 'Raw bits are cloned', it: 'I bit grezzi vengono clonati' }, detail: { en: 'Frames flow normally, but a full copy is now captured off-band.', it: 'I frame scorrono normalmente, ma una copia completa viene ora catturata fuori banda.' } },
      { actor: 'victim', title: { en: 'Cleartext is reconstructed', it: 'Il testo in chiaro è ricostruito' }, detail: { en: 'Anything unencrypted (HTTP, FTP, Telnet) is readable in the capture.', it: 'Tutto ciò che non è cifrato (HTTP, FTP, Telnet) è leggibile nella cattura.' } }
    ],
    neutralizeAtStep: 3,
    defense: {
      name: { en: 'Link encryption + fiber monitoring', it: 'Cifratura di linea + monitoraggio fibra' },
      action: { en: 'MACsec/TLS encrypts the payload while OTDR sensors flag the light-level drop of a tap.', it: 'MACsec/TLS cifra il payload mentre sensori OTDR segnalano il calo di luce del tap.' },
      mechanism: { en: 'The captured bits are ciphertext without the key, and the physical intrusion raises an alarm.', it: 'I bit catturati sono testo cifrato senza la chiave, e l\'intrusione fisica genera un allarme.' }
    },
    outcomeSuccess: { en: 'Credentials and sensitive data are exfiltrated with zero network alerts.', it: 'Credenziali e dati sensibili vengono esfiltrati senza alcun allarme di rete.' },
    outcomeBlocked: { en: 'The tap only yields useless ciphertext and its insertion is detected.', it: 'Il tap ottiene solo testo cifrato inutile e il suo inserimento viene rilevato.' }
  },
  {
    scenarioId: 'l2-mitm',
    layer: 2,
    severity: 'critical',
    goal: {
      en: 'Sit between two hosts on the LAN to read and alter their traffic (Man-in-the-Middle).',
      it: 'Mettersi in mezzo a due host della LAN per leggere e alterare il loro traffico (Man-in-the-Middle).'
    },
    steps: [
      { actor: 'attacker', title: { en: 'Forge gratuitous ARP replies', it: 'Falsifica risposte ARP gratuite' }, detail: { en: 'The attacker claims "the gateway IP is at MY MAC" to the victim, and vice-versa.', it: 'L\'attaccante dichiara alla vittima "l\'IP del gateway è al MIO MAC", e viceversa.' }, packet: 'ARP reply: 192.168.1.1 is-at AA:AA:AA' },
      { actor: 'victim', title: { en: 'ARP cache is poisoned', it: 'La cache ARP viene avvelenata' }, detail: { en: 'ARP has no authentication, so the victim overwrites the correct entry.', it: 'ARP non ha autenticazione, quindi la vittima sovrascrive la voce corretta.' } },
      { actor: 'network', title: { en: 'Traffic reroutes through attacker', it: 'Il traffico passa dall\'attaccante' }, detail: { en: 'Every packet to the gateway is delivered to the attacker first.', it: 'Ogni pacchetto verso il gateway arriva prima all\'attaccante.' } },
      { actor: 'attacker', title: { en: 'Read, modify, forward', it: 'Legge, modifica, inoltra' }, detail: { en: 'The attacker relays traffic transparently while capturing or tampering with it.', it: 'L\'attaccante inoltra il traffico in modo trasparente catturandolo o manomettendolo.' } }
    ],
    neutralizeAtStep: 1,
    defense: {
      name: { en: 'Dynamic ARP Inspection (DAI)', it: 'Dynamic ARP Inspection (DAI)' },
      action: { en: 'The switch validates each ARP reply against the DHCP snooping binding table.', it: 'Lo switch valida ogni risposta ARP con la tabella di binding del DHCP snooping.' },
      mechanism: { en: 'ARP replies that do not match a legitimate IP↔MAC binding are dropped at the port.', it: 'Le risposte ARP che non corrispondono a un binding IP↔MAC legittimo vengono scartate sulla porta.' }
    },
    outcomeSuccess: { en: 'The attacker fully intercepts and can rewrite LAN traffic in real time.', it: 'L\'attaccante intercetta completamente e può riscrivere il traffico della LAN in tempo reale.' },
    outcomeBlocked: { en: 'The forged ARP never reaches the victim; the cache stays clean.', it: 'L\'ARP falsificato non raggiunge mai la vittima; la cache resta pulita.' }
  },
  {
    scenarioId: 'l2-mac-flood',
    layer: 2,
    severity: 'high',
    goal: {
      en: 'Force the switch to flood unknown-unicast frames on the VLAN so traffic meant for other hosts can be sniffed.',
      it: 'Forzare lo switch al flooding dei frame unknown-unicast sulla VLAN per sniffare il traffico destinato ad altri host.'
    },
    steps: [
      { actor: 'attacker', title: { en: 'Flood random source MACs', it: 'Inonda con MAC sorgente casuali' }, detail: { en: 'Thousands of frames with bogus source MACs are blasted at the switch.', it: 'Migliaia di frame con MAC sorgente fasulli vengono sparati verso lo switch.' }, packet: 'src=RANDOM_MAC x10000/s' },
      { actor: 'network', title: { en: 'CAM table fills up', it: 'La tabella CAM si riempie' }, detail: { en: 'The switch memory that maps MAC→port is exhausted.', it: 'La memoria dello switch che mappa MAC→porta si esaurisce.' } },
      { actor: 'network', title: { en: 'Switch fails open', it: 'Lo switch va in fail-open' }, detail: { en: 'Unable to learn new MACs, it floods every unknown-unicast frame to all ports of that VLAN; entries still in the CAM table are switched normally.', it: 'Non potendo apprendere nuovi MAC, esegue il flooding di ogni frame unknown-unicast su tutte le porte di quella VLAN; le voci ancora presenti in CAM continuano a essere commutate normalmente.' } },
      { actor: 'attacker', title: { en: 'Sniff all LAN traffic', it: 'Sniffa tutto il traffico LAN' }, detail: { en: 'The attacker now receives copies of frames meant for other hosts.', it: 'L\'attaccante ora riceve copie dei frame destinati agli altri host.' } }
    ],
    neutralizeAtStep: 0,
    defense: {
      name: { en: 'Port Security', it: 'Port Security' },
      action: { en: 'The switch caps the number of MAC addresses learned per port.', it: 'Lo switch limita il numero di indirizzi MAC appresi per porta.' },
      mechanism: { en: 'When the limit is exceeded the offending port is shut down before the CAM can overflow.', it: 'Superato il limite, la porta colpevole viene disattivata prima che la CAM trabocchi.' }
    },
    outcomeSuccess: { en: 'The entire segment is exposed to passive sniffing.', it: 'L\'intero segmento è esposto allo sniffing passivo.' },
    outcomeBlocked: { en: 'The flooding port is disabled instantly; the CAM table stays intact.', it: 'La porta che inonda viene disabilitata all\'istante; la tabella CAM resta integra.' }
  },
  {
    scenarioId: 'l3-spoofing',
    layer: 3,
    severity: 'high',
    goal: {
      en: 'Impersonate a trusted host by forging the source IP address of packets.',
      it: 'Impersonare un host fidato falsificando l\'indirizzo IP sorgente dei pacchetti.'
    },
    steps: [
      { actor: 'attacker', title: { en: 'Craft packets with a fake source IP', it: 'Crea pacchetti con IP sorgente falso' }, detail: { en: 'The IP header source field is set to a trusted internal address.', it: 'Il campo sorgente dell\'header IP è impostato a un indirizzo interno fidato.' }, packet: 'src=10.0.0.5 (spoofed) → dst=server' },
      { actor: 'network', title: { en: 'Router forwards blindly', it: 'Il router inoltra alla cieca' }, detail: { en: 'Basic routing only looks at the destination, not whether the source is plausible.', it: 'Il routing di base guarda solo la destinazione, non se la sorgente sia plausibile.' } },
      { actor: 'victim', title: { en: 'Server trusts the source', it: 'Il server si fida della sorgente' }, detail: { en: 'IP-based access rules accept the packet as if from the real host.', it: 'Le regole di accesso basate su IP accettano il pacchetto come dall\'host reale.' } },
      { actor: 'attacker', title: { en: 'Bypass filters / poison sessions', it: 'Aggira i filtri / avvelena sessioni' }, detail: { en: 'The attacker abuses the trust to inject data or launch reflected DoS.', it: 'L\'attaccante sfrutta la fiducia per iniettare dati o lanciare DoS riflessi.' } }
    ],
    neutralizeAtStep: 1,
    defense: {
      name: { en: 'Unicast Reverse Path Forwarding (uRPF)', it: 'Unicast Reverse Path Forwarding (uRPF)' },
      action: { en: 'The router checks that the source IP would return via the same interface it arrived on.', it: 'Il router verifica che l\'IP sorgente tornerebbe dalla stessa interfaccia da cui è arrivato.' },
      mechanism: { en: 'Packets whose source is unreachable via that path (spoofed) are dropped.', it: 'I pacchetti la cui sorgente non è raggiungibile da quel percorso (spoofati) vengono scartati.' }
    },
    outcomeSuccess: { en: 'The attacker is treated as a trusted host and slips past IP ACLs.', it: 'L\'attaccante è trattato come host fidato e supera le ACL basate su IP.' },
    outcomeBlocked: { en: 'The spoofed packet is discarded at the first router hop.', it: 'Il pacchetto spoofato viene scartato al primo hop del router.' }
  },
  {
    scenarioId: 'l3-bgp-hijack',
    layer: 3,
    severity: 'critical',
    goal: {
      en: 'Divert global Internet traffic by announcing IP prefixes you do not own.',
      it: 'Dirottare il traffico Internet globale annunciando prefissi IP che non ti appartengono.'
    },
    steps: [
      { actor: 'attacker', title: { en: 'Announce a false prefix', it: 'Annuncia un prefisso falso' }, detail: { en: 'A malicious AS advertises a more specific route for a victim\'s network.', it: 'Un AS malevolo pubblicizza una rotta più specifica per la rete della vittima.' }, packet: 'BGP UPDATE: 203.0.113.0/24 via AS666' },
      { actor: 'network', title: { en: 'Peers prefer the specific route', it: 'I peer preferiscono la rotta specifica' }, detail: { en: 'BGP favors longer prefixes, so neighbors accept and propagate the hijack.', it: 'BGP preferisce i prefissi più lunghi, quindi i vicini accettano e propagano il dirottamento.' } },
      { actor: 'network', title: { en: 'Traffic flows to the attacker', it: 'Il traffico va all\'attaccante' }, detail: { en: 'Whole regions route the victim\'s traffic through the rogue AS.', it: 'Intere regioni instradano il traffico della vittima attraverso l\'AS canaglia.' } },
      { actor: 'attacker', title: { en: 'Inspect, drop or relay', it: 'Ispeziona, scarta o rilancia' }, detail: { en: 'The attacker blackholes or transparently proxies the diverted traffic.', it: 'L\'attaccante fa blackhole o proxy trasparente del traffico dirottato.' } }
    ],
    neutralizeAtStep: 1,
    defense: {
      name: { en: 'RPKI Route Origin Validation', it: 'Validazione dell\'Origine (RPKI)' },
      action: { en: 'Routers check a signed ROA proving which AS may originate each prefix.', it: 'I router verificano una ROA firmata che prova quale AS può originare ciascun prefisso.' },
      mechanism: { en: 'Announcements from an unauthorized AS are marked Invalid and rejected.', it: 'Gli annunci da un AS non autorizzato sono marcati Invalid e rifiutati.' }
    },
    outcomeSuccess: { en: 'Global traffic is silently rerouted and can be intercepted or dropped.', it: 'Il traffico globale è reinstradato silenziosamente e può essere intercettato o scartato.' },
    outcomeBlocked: { en: 'The invalid announcement is rejected before it can propagate.', it: 'L\'annuncio non valido è rifiutato prima di potersi propagare.' }
  },
  {
    scenarioId: 'l4-dos',
    layer: 4,
    severity: 'high',
    goal: {
      en: 'Exhaust a server\'s connection table so legitimate users cannot connect (SYN Flood).',
      it: 'Esaurire la tabella delle connessioni di un server così che gli utenti legittimi non possano connettersi (SYN Flood).'
    },
    steps: [
      { actor: 'attacker', title: { en: 'Send a storm of SYN packets', it: 'Invia una tempesta di pacchetti SYN' }, detail: { en: 'Each SYN opens the first step of the TCP 3-way handshake.', it: 'Ogni SYN apre il primo passo dell\'handshake TCP a 3 vie.' }, packet: 'SYN seq=x (spoofed src) ×flood' },
      { actor: 'victim', title: { en: 'Server allocates half-open sockets', it: 'Il server alloca socket semi-aperti' }, detail: { en: 'It replies SYN-ACK and reserves memory waiting for an ACK that never comes.', it: 'Risponde SYN-ACK e riserva memoria aspettando un ACK che non arriva mai.' } },
      { actor: 'network', title: { en: 'SYN backlog fills up', it: 'Il backlog SYN si riempie' }, detail: { en: 'The half-open connection queue reaches its limit.', it: 'La coda delle connessioni semi-aperte raggiunge il limite.' } },
      { actor: 'victim', title: { en: 'Legitimate clients are refused', it: 'I client legittimi sono rifiutati' }, detail: { en: 'With no free slots, real users get connection timeouts.', it: 'Senza slot liberi, gli utenti reali ricevono timeout di connessione.' } }
    ],
    neutralizeAtStep: 1,
    defense: {
      name: { en: 'SYN Cookies', it: 'SYN Cookies' },
      action: { en: 'The server encodes connection state into the SYN-ACK sequence number instead of storing it.', it: 'Il server codifica lo stato della connessione nel sequence number del SYN-ACK invece di memorizzarlo.' },
      mechanism: { en: 'No memory is reserved until a valid ACK returns, so the backlog cannot be exhausted.', it: 'Nessuna memoria è riservata finché non torna un ACK valido, quindi il backlog non si esaurisce.' }
    },
    outcomeSuccess: { en: 'The service becomes unreachable for everyone.', it: 'Il servizio diventa irraggiungibile per tutti.' },
    outcomeBlocked: { en: 'The flood consumes no server memory and real users keep connecting.', it: 'L\'inondazione non consuma memoria del server e gli utenti reali continuano a connettersi.' }
  },
  {
    scenarioId: 'l4-tcp-reset',
    layer: 4,
    severity: 'medium',
    goal: {
      en: 'Tear down an active TCP session by injecting a forged RST packet.',
      it: 'Interrompere una sessione TCP attiva iniettando un pacchetto RST contraffatto.'
    },
    steps: [
      { actor: 'attacker', title: { en: 'Observe or guess the session', it: 'Osserva o indovina la sessione' }, detail: { en: 'The attacker learns the 4-tuple and a plausible sequence number.', it: 'L\'attaccante ricava la 4-tupla e un sequence number plausibile.' } },
      { actor: 'attacker', title: { en: 'Forge a RST packet', it: 'Falsifica un pacchetto RST' }, detail: { en: 'A spoofed RST with an in-window sequence number is injected.', it: 'Viene iniettato un RST spoofato con sequence number dentro la finestra.' }, packet: 'RST seq=in-window src=peer' },
      { actor: 'victim', title: { en: 'Endpoint accepts the RST', it: 'L\'endpoint accetta il RST' }, detail: { en: 'TCP treats an in-window RST as a legitimate abort.', it: 'TCP tratta un RST dentro la finestra come un\'interruzione legittima.' } },
      { actor: 'network', title: { en: 'Session is dropped', it: 'La sessione viene abbattuta' }, detail: { en: 'The connection is torn down mid-transfer.', it: 'La connessione viene chiusa a metà trasferimento.' } }
    ],
    neutralizeAtStep: 2,
    defense: {
      name: { en: 'TLS + randomized sequence numbers', it: 'TLS + sequence number randomizzati' },
      action: { en: 'Encryption authenticates the channel and ISN randomization makes sequence numbers unguessable.', it: 'La cifratura autentica il canale e la randomizzazione dell\'ISN rende i sequence number imprevedibili.' },
      mechanism: { en: 'The attacker cannot forge an in-window, authenticated RST.', it: 'L\'attaccante non può falsificare un RST autenticato e dentro la finestra.' }
    },
    outcomeSuccess: { en: 'The session is killed, disrupting transfers or long-lived connections (e.g. BGP).', it: 'La sessione viene uccisa, interrompendo trasferimenti o connessioni durature (es. BGP).' },
    outcomeBlocked: { en: 'The forged RST is ignored and the session survives.', it: 'Il RST falsificato viene ignorato e la sessione sopravvive.' }
  },
  {
    scenarioId: 'l5-hijacking',
    layer: 5,
    severity: 'critical',
    goal: {
      en: 'Take over an authenticated user session by stealing its session token.',
      it: 'Impossessarsi di una sessione utente autenticata rubandone il token.'
    },
    steps: [
      { actor: 'attacker', title: { en: 'Capture the session token', it: 'Cattura il token di sessione' }, detail: { en: 'A cookie is sniffed on an open network or leaked via XSS.', it: 'Un cookie viene sniffato su una rete aperta o trafugato via XSS.' }, packet: 'Cookie: SESSION=4f8s9a...' },
      { actor: 'attacker', title: { en: 'Replay the token', it: 'Riusa il token' }, detail: { en: 'The attacker sends requests carrying the victim\'s valid cookie.', it: 'L\'attaccante invia richieste con il cookie valido della vittima.' } },
      { actor: 'victim', title: { en: 'Server accepts the session', it: 'Il server accetta la sessione' }, detail: { en: 'Without extra checks, the token alone proves identity.', it: 'Senza controlli aggiuntivi, il solo token prova l\'identità.' } },
      { actor: 'attacker', title: { en: 'Act as the victim', it: 'Agisce come la vittima' }, detail: { en: 'Full access to the account without ever knowing the password.', it: 'Accesso completo all\'account senza mai conoscere la password.' } }
    ],
    neutralizeAtStep: 0,
    defense: {
      name: { en: 'HSTS + Secure/HttpOnly cookies + MFA', it: 'HSTS + cookie Secure/HttpOnly + MFA' },
      action: { en: 'TLS everywhere stops sniffing; HttpOnly blocks script theft; MFA re-checks identity.', it: 'TLS ovunque blocca lo sniffing; HttpOnly impedisce il furto via script; MFA riverifica l\'identità.' },
      mechanism: { en: 'The token never travels in clear and a stolen cookie alone is not enough to log in.', it: 'Il token non viaggia mai in chiaro e un cookie rubato da solo non basta ad autenticarsi.' }
    },
    outcomeSuccess: { en: 'The attacker fully impersonates the user.', it: 'L\'attaccante impersona completamente l\'utente.' },
    outcomeBlocked: { en: 'The token cannot be captured, and even if it were, MFA blocks reuse.', it: 'Il token non può essere catturato e, anche se lo fosse, l\'MFA ne blocca il riuso.' }
  },
  {
    scenarioId: 'l5-replay',
    layer: 5,
    severity: 'high',
    goal: {
      en: 'Re-send a captured valid message to trigger an action twice (e.g. a payment).',
      it: 'Reinviare un messaggio valido catturato per far eseguire un\'azione due volte (es. un pagamento).'
    },
    steps: [
      { actor: 'attacker', title: { en: 'Record a legitimate request', it: 'Registra una richiesta legittima' }, detail: { en: 'A signed/authenticated message is captured off the wire.', it: 'Un messaggio firmato/autenticato viene catturato dalla rete.' } },
      { actor: 'attacker', title: { en: 'Replay it later', it: 'Lo riproduce più tardi' }, detail: { en: 'The exact same bytes are re-sent to the server.', it: 'Gli stessi identici byte vengono reinviati al server.' }, packet: 'REPLAY: signed_txn(id=A) again' },
      { actor: 'victim', title: { en: 'Server re-processes it', it: 'Il server lo rielabora' }, detail: { en: 'The message is still validly signed, so it is accepted again.', it: 'Il messaggio è ancora firmato validamente, quindi viene accettato di nuovo.' } },
      { actor: 'attacker', title: { en: 'Duplicate effect achieved', it: 'Effetto duplicato ottenuto' }, detail: { en: 'The action executes twice — a double charge, a repeated unlock.', it: 'L\'azione si esegue due volte — un doppio addebito, uno sblocco ripetuto.' } }
    ],
    neutralizeAtStep: 2,
    defense: {
      name: { en: 'Nonces + timestamps (anti-replay)', it: 'Nonce + timestamp (anti-replay)' },
      action: { en: 'Each request carries a one-time nonce and a timestamp the server remembers.', it: 'Ogni richiesta porta un nonce usa-e-getta e un timestamp che il server ricorda.' },
      mechanism: { en: 'A message whose nonce was already seen (or is expired) is rejected as a replay.', it: 'Un messaggio con nonce già visto (o scaduto) è rifiutato come replay.' }
    },
    outcomeSuccess: { en: 'The duplicated action causes financial or state damage.', it: 'L\'azione duplicata causa un danno economico o di stato.' },
    outcomeBlocked: { en: 'The replayed message is recognised and discarded.', it: 'Il messaggio riprodotto viene riconosciuto e scartato.' }
  },
  {
    scenarioId: 'l6-oracle',
    layer: 6,
    severity: 'high',
    goal: {
      en: 'Decrypt ciphertext one byte at a time by abusing padding error responses.',
      it: 'Decifrare il testo cifrato un byte alla volta sfruttando le risposte di errore sul padding.'
    },
    steps: [
      { actor: 'attacker', title: { en: 'Send tampered ciphertext', it: 'Invia testo cifrato manomesso' }, detail: { en: 'The attacker modifies a block and submits it to the server.', it: 'L\'attaccante modifica un blocco e lo invia al server.' }, packet: 'C\' = flip(last block bytes)' },
      { actor: 'victim', title: { en: 'Server leaks padding validity', it: 'Il server rivela la validità del padding' }, detail: { en: 'Different errors for "bad padding" vs "bad content" reveal one bit of info.', it: 'Errori diversi per "padding errato" vs "contenuto errato" rivelano un bit di informazione.' } },
      { actor: 'attacker', title: { en: 'Iterate byte by byte', it: 'Itera byte per byte' }, detail: { en: 'Using the oracle, each plaintext byte is recovered without the key.', it: 'Usando l\'oracolo, ogni byte del testo in chiaro è recuperato senza la chiave.' } },
      { actor: 'attacker', title: { en: 'Full plaintext recovered', it: 'Testo in chiaro recuperato' }, detail: { en: 'The entire encrypted message is decrypted.', it: 'L\'intero messaggio cifrato viene decifrato.' } }
    ],
    neutralizeAtStep: 1,
    defense: {
      name: { en: 'Authenticated encryption (AES-GCM)', it: 'Crittografia autenticata (AES-GCM)' },
      action: { en: 'An integrity tag is verified before any decryption/padding logic runs.', it: 'Un tag di integrità è verificato prima di qualsiasi logica di decifratura/padding.' },
      mechanism: { en: 'Tampered ciphertext fails the tag check and is rejected uniformly — no oracle to leak.', it: 'Il testo manomesso fallisce il controllo del tag ed è rifiutato in modo uniforme — nessun oracolo che trapeli.' }
    },
    outcomeSuccess: { en: 'Confidential data is fully decrypted without the key.', it: 'I dati riservati sono decifrati completamente senza la chiave.' },
    outcomeBlocked: { en: 'Every tampered block is rejected identically, giving the attacker nothing.', it: 'Ogni blocco manomesso è rifiutato in modo identico, senza dare nulla all\'attaccante.' }
  },
  {
    scenarioId: 'l7-injection',
    layer: 7,
    severity: 'critical',
    goal: {
      en: 'Read or modify the database by injecting SQL through a web input.',
      it: 'Leggere o modificare il database iniettando SQL tramite un input web.'
    },
    steps: [
      { actor: 'attacker', title: { en: 'Submit a crafted input', it: 'Invia un input manipolato' }, detail: { en: "A form field contains SQL meta-characters instead of data.", it: 'Un campo del form contiene meta-caratteri SQL invece di dati.' }, packet: "user: ' OR '1'='1' -- " },
      { actor: 'victim', title: { en: 'App concatenates it into a query', it: "L'app la concatena nella query" }, detail: { en: 'The input is glued directly into the SQL string, changing its logic.', it: "L'input viene incollato direttamente nella stringa SQL, cambiandone la logica." } },
      { actor: 'network', title: { en: 'Database executes attacker logic', it: "Il DB esegue la logica dell'attaccante" }, detail: { en: 'The tampered query returns all rows or dumps other tables.', it: 'La query alterata restituisce tutte le righe o estrae altre tabelle.' } },
      { actor: 'attacker', title: { en: 'Exfiltrate or alter data', it: 'Esfiltra o altera i dati' }, detail: { en: 'Credentials and records are stolen, or data is modified.', it: 'Credenziali e record vengono rubati, o i dati modificati.' } }
    ],
    neutralizeAtStep: 1,
    defense: {
      name: { en: 'Parameterized queries + WAF', it: 'Query parametrizzate + WAF' },
      action: { en: 'Inputs are bound as data parameters, never concatenated as code; a WAF screens payloads.', it: 'Gli input sono legati come parametri dato, mai concatenati come codice; un WAF filtra i payload.' },
      mechanism: { en: 'The database treats the input purely as a value, so the injected SQL never executes.', it: "Il database tratta l'input solo come valore, quindi l'SQL iniettato non viene mai eseguito." }
    },
    outcomeSuccess: { en: 'The whole database is exposed or corrupted.', it: 'L\'intero database è esposto o corrotto.' },
    outcomeBlocked: { en: 'The payload is stored as harmless text; the query logic is unchanged.', it: 'Il payload è salvato come testo innocuo; la logica della query è invariata.' }
  },
  {
    scenarioId: 'l7-xss',
    layer: 7,
    severity: 'high',
    goal: {
      en: 'Run attacker JavaScript in other users\' browsers to steal sessions or data.',
      it: 'Eseguire JavaScript dell\'attaccante nei browser di altri utenti per rubare sessioni o dati.'
    },
    steps: [
      { actor: 'attacker', title: { en: 'Inject a script payload', it: 'Inietta un payload script' }, detail: { en: 'A comment or profile field contains a <script> tag.', it: 'Un commento o un campo profilo contiene un tag <script>.' }, packet: '<script>steal(document.cookie)</script>' },
      { actor: 'victim', title: { en: 'Server stores & reflects it', it: 'Il server lo salva e lo restituisce' }, detail: { en: 'The page renders the payload as HTML instead of text.', it: 'La pagina rende il payload come HTML invece che come testo.' } },
      { actor: 'network', title: { en: 'Other users load the page', it: 'Altri utenti caricano la pagina' }, detail: { en: 'Every visitor\'s browser executes the injected script.', it: 'Il browser di ogni visitatore esegue lo script iniettato.' } },
      { actor: 'attacker', title: { en: 'Sessions/keystrokes stolen', it: 'Sessioni/tasti rubati' }, detail: { en: 'Cookies are exfiltrated or actions performed on the victim\'s behalf.', it: 'I cookie vengono esfiltrati o azioni compiute a nome della vittima.' } }
    ],
    neutralizeAtStep: 1,
    defense: {
      name: { en: 'Output encoding + Content Security Policy', it: 'Output encoding + Content Security Policy' },
      action: { en: 'User content is HTML-escaped and a CSP forbids inline/foreign scripts.', it: 'Il contenuto utente è HTML-escaped e una CSP vieta script inline/esterni.' },
      mechanism: { en: 'The payload renders as inert text and the browser refuses to run injected scripts.', it: 'Il payload appare come testo inerte e il browser rifiuta di eseguire script iniettati.' }
    },
    outcomeSuccess: { en: 'Any visitor can be compromised through the trusted site.', it: 'Ogni visitatore può essere compromesso tramite il sito fidato.' },
    outcomeBlocked: { en: 'The script is shown as plain text and never executes.', it: 'Lo script è mostrato come testo semplice e non viene mai eseguito.' }
  },
  {
    scenarioId: 'l7-dns-poison',
    layer: 7,
    severity: 'critical',
    goal: {
      en: 'Redirect users to a malicious server by corrupting a DNS resolver\'s cache.',
      it: 'Reindirizzare gli utenti verso un server malevolo corrompendo la cache di un resolver DNS.'
    },
    steps: [
      { actor: 'attacker', title: { en: 'Trigger a resolution', it: 'Innesca una risoluzione' }, detail: { en: 'The attacker makes the resolver query a domain it doesn\'t have cached.', it: 'L\'attaccante fa interrogare al resolver un dominio non in cache.' } },
      { actor: 'attacker', title: { en: 'Race a forged response', it: 'Anticipa con una risposta falsa' }, detail: { en: 'A spoofed answer with the attacker\'s IP is sent before the real one, guessing the query ID.', it: 'Una risposta spoofata con l\'IP dell\'attaccante è inviata prima di quella vera, indovinando l\'ID della query.' }, packet: 'A bank.com → 6.6.6.6 (spoofed)' },
      { actor: 'victim', title: { en: 'Resolver caches the lie', it: 'Il resolver mette in cache la bugia' }, detail: { en: 'The fake mapping is stored and served to every client.', it: 'La mappatura falsa è memorizzata e servita a ogni client.' } },
      { actor: 'network', title: { en: 'Users routed to attacker', it: 'Utenti instradati all\'attaccante' }, detail: { en: 'Everyone visiting the domain lands on the malicious server.', it: 'Chiunque visiti il dominio finisce sul server malevolo.' } }
    ],
    neutralizeAtStep: 2,
    defense: {
      name: { en: 'DNSSEC', it: 'DNSSEC' },
      action: { en: 'Each DNS record is cryptographically signed and the resolver validates the signature.', it: 'Ogni record DNS è firmato crittograficamente e il resolver valida la firma.' },
      mechanism: { en: 'A forged answer lacks a valid signature chain and is refused before caching.', it: 'Una risposta falsa non ha una catena di firme valida ed è rifiutata prima della cache.' }
    },
    outcomeSuccess: { en: 'A whole user base is silently sent to a phishing/malware site.', it: 'Un\'intera base utenti è inviata silenziosamente a un sito di phishing/malware.' },
    outcomeBlocked: { en: 'The unsigned forgery is rejected; the cache stays honest.', it: 'La falsificazione non firmata è rifiutata; la cache resta onesta.' }
  },
  {
    scenarioId: 'l7-ssh-brute',
    layer: 7,
    severity: 'medium',
    goal: {
      en: 'Gain remote shell access by trying huge numbers of password guesses.',
      it: 'Ottenere una shell remota provando un enorme numero di password.'
    },
    steps: [
      { actor: 'attacker', title: { en: 'Find an exposed SSH port', it: 'Trova una porta SSH esposta' }, detail: { en: 'Port 22 is reachable from the Internet.', it: 'La porta 22 è raggiungibile da Internet.' }, packet: 'connect tcp/22' },
      { actor: 'attacker', title: { en: 'Automate login attempts', it: 'Automatizza i tentativi di login' }, detail: { en: 'A bot cycles through common usernames and passwords.', it: 'Un bot scorre username e password comuni.' }, packet: 'admin:123456, root:toor, ...' },
      { actor: 'victim', title: { en: 'Server checks each attempt', it: 'Il server verifica ogni tentativo' }, detail: { en: 'With password auth enabled, every guess gets a yes/no.', it: 'Con l\'autenticazione a password attiva, ogni tentativo riceve un sì/no.' } },
      { actor: 'attacker', title: { en: 'A weak password falls', it: 'Una password debole cede' }, detail: { en: 'Given enough tries, a reused/weak credential is found.', it: 'Con abbastanza tentativi, si trova una credenziale debole/riutilizzata.' } }
    ],
    neutralizeAtStep: 1,
    defense: {
      name: { en: 'Key-based auth + Fail2Ban', it: 'Autenticazione a chiave + Fail2Ban' },
      action: { en: 'Password login is disabled; repeated failures get the source IP banned.', it: 'Il login a password è disabilitato; i tentativi ripetuti fanno bannare l\'IP sorgente.' },
      mechanism: { en: 'Without the private key there is nothing to guess, and floods are rate-limited to zero.', it: 'Senza la chiave privata non c\'è nulla da indovinare, e le raffiche sono azzerate dal rate-limit.' }
    },
    outcomeSuccess: { en: 'The attacker gets an interactive shell on the server.', it: 'L\'attaccante ottiene una shell interattiva sul server.' },
    outcomeBlocked: { en: 'Guessing is futile against keys and the attacker IP is quickly banned.', it: 'Indovinare è inutile contro le chiavi e l\'IP dell\'attaccante è bannato in fretta.' }
  },
  {
    scenarioId: 'l1-jamming',
    layer: 1,
    severity: 'high',
    goal: {
      en: 'Knock a wireless network offline by saturating its radio band with noise.',
      it: 'Mettere offline una rete wireless saturando la sua banda radio con del rumore.'
    },
    steps: [
      { actor: 'attacker', title: { en: 'Emit high-power RF noise', it: 'Emette rumore RF ad alta potenza' }, detail: { en: 'A transmitter floods the target frequency with random radio energy.', it: 'Un trasmettitore inonda la frequenza bersaglio con energia radio casuale.' }, packet: 'RF noise @ 2.4 GHz' },
      { actor: 'network', title: { en: 'Signal-to-noise collapses', it: 'Il rapporto segnale/rumore crolla' }, detail: { en: 'Legitimate frames can no longer be told apart from the noise.', it: 'I frame legittimi non si distinguono più dal rumore.' } },
      { actor: 'victim', title: { en: 'Devices lose the link', it: 'I dispositivi perdono il collegamento' }, detail: { en: 'Wi-Fi clients disconnect; no data gets through.', it: 'I client Wi-Fi si disconnettono; nessun dato passa.' } }
    ],
    neutralizeAtStep: 1,
    defense: {
      name: { en: 'Frequency hopping + directional antennas', it: 'Frequency hopping + antenne direzionali' },
      action: { en: 'The link constantly changes channel and focuses the beam, dodging the jammed band.', it: 'Il collegamento cambia continuamente canale e concentra il fascio, evitando la banda disturbata.' },
      mechanism: { en: 'The jammer cannot cover every frequency at once, so the signal keeps getting through.', it: 'Il jammer non può coprire tutte le frequenze insieme, quindi il segnale continua a passare.' }
    },
    outcomeSuccess: { en: 'The wireless network is knocked offline for everyone in range.', it: 'La rete wireless va offline per tutti nel raggio d\'azione.' },
    outcomeBlocked: { en: 'The link hops around the noise and stays up.', it: 'Il collegamento aggira il rumore e resta attivo.' }
  },
  {
    scenarioId: 'l2-dhcp-starve',
    layer: 2,
    severity: 'medium',
    goal: {
      en: 'Exhaust the DHCP address pool so no new device can obtain an IP.',
      it: 'Esaurire il pool di indirizzi DHCP così che nessun nuovo dispositivo ottenga un IP.'
    },
    steps: [
      { actor: 'attacker', title: { en: 'Flood DHCP with spoofed MACs', it: 'Inonda il DHCP con MAC falsi' }, detail: { en: 'Thousands of DISCOVER requests, each with a different fake MAC.', it: 'Migliaia di richieste DISCOVER, ognuna con un MAC falso diverso.' }, packet: 'DHCPDISCOVER × N (fake MACs)' },
      { actor: 'victim', title: { en: 'Server leases every address', it: 'Il server assegna ogni indirizzo' }, detail: { en: 'The DHCP server hands out its whole pool to the fake clients.', it: 'Il server DHCP distribuisce tutto il pool ai client fasulli.' } },
      { actor: 'network', title: { en: 'The pool is exhausted', it: 'Il pool è esaurito' }, detail: { en: 'No addresses are left to assign.', it: 'Non restano indirizzi da assegnare.' } },
      { actor: 'victim', title: { en: 'Real clients get no IP', it: 'I client veri non ottengono IP' }, detail: { en: 'Legitimate devices cannot join the network.', it: 'I dispositivi legittimi non possono collegarsi alla rete.' } }
    ],
    neutralizeAtStep: 1,
    defense: {
      name: { en: 'DHCP Snooping + Port Security', it: 'DHCP Snooping + Port Security' },
      action: { en: 'The switch limits how many MACs/requests a port may send and trusts only the real DHCP server.', it: 'Lo switch limita quanti MAC/richieste può inviare una porta e si fida solo del vero server DHCP.' },
      mechanism: { en: 'The flood of fake requests is dropped before it can drain the pool.', it: 'La raffica di richieste fasulle viene scartata prima di svuotare il pool.' }
    },
    outcomeSuccess: { en: 'New devices are denied network access.', it: 'Ai nuovi dispositivi è negato l\'accesso alla rete.' },
    outcomeBlocked: { en: 'Fake requests are throttled; the pool stays available.', it: 'Le richieste fasulle sono limitate; il pool resta disponibile.' }
  },
  {
    scenarioId: 'l3-smurf',
    layer: 3,
    severity: 'high',
    goal: {
      en: 'Amplify a DoS by making an entire network flood the victim with ICMP replies.',
      it: 'Amplificare un DoS facendo inondare la vittima di risposte ICMP da un\'intera rete.'
    },
    steps: [
      { actor: 'attacker', title: { en: 'Ping the broadcast, spoofing the victim', it: 'Ping al broadcast, fingendosi la vittima' }, detail: { en: 'Sends an ICMP echo to a network broadcast address with the victim\'s IP as source.', it: 'Invia un echo ICMP a un indirizzo di broadcast con l\'IP della vittima come sorgente.' }, packet: 'ICMP echo → 10.0.0.255, src=victim' },
      { actor: 'network', title: { en: 'Every host answers the victim', it: 'Ogni host risponde alla vittima' }, detail: { en: 'All hosts reply to the spoofed source — the victim.', it: 'Tutti gli host rispondono alla sorgente falsificata — la vittima.' } },
      { actor: 'victim', title: { en: 'Flooded by amplified replies', it: 'Sommersa dalle risposte amplificate' }, detail: { en: 'One packet becomes hundreds of echo-replies hitting the victim.', it: 'Un pacchetto diventa centinaia di echo-reply che colpiscono la vittima.' } }
    ],
    neutralizeAtStep: 1,
    defense: {
      name: { en: 'Disable directed broadcasts', it: 'Disabilita i broadcast diretti' },
      action: { en: 'Routers no longer forward packets addressed to a network broadcast.', it: 'I router non inoltrano più i pacchetti diretti a un broadcast di rete.' },
      mechanism: { en: 'With no broadcast to amplify it, the single ping cannot multiply.', it: 'Senza un broadcast che lo amplifichi, il singolo ping non può moltiplicarsi.' }
    },
    outcomeSuccess: { en: 'The victim\'s link is saturated by amplified traffic.', it: 'Il collegamento della vittima è saturato dal traffico amplificato.' },
    outcomeBlocked: { en: 'The directed broadcast is dropped; no amplification happens.', it: 'Il broadcast diretto viene scartato; nessuna amplificazione.' }
  },
  {
    scenarioId: 'l3-frag',
    layer: 3,
    severity: 'high',
    goal: {
      en: 'Sneak a malicious payload past a firewall using overlapping IP fragments.',
      it: 'Far passare un payload malevolo oltre un firewall usando frammenti IP sovrapposti.'
    },
    steps: [
      { actor: 'attacker', title: { en: 'Split the payload into fragments', it: 'Divide il payload in frammenti' }, detail: { en: 'The attack is chopped into overlapping pieces, each looking harmless.', it: 'L\'attacco è spezzato in parti sovrapposte, ognuna apparentemente innocua.' }, packet: 'frag1 | frag2 (overlapping offsets)' },
      { actor: 'network', title: { en: 'Stateless filter checks each fragment', it: 'Il filtro stateless controlla ogni frammento' }, detail: { en: 'A simple firewall inspects fragments in isolation and sees nothing wrong.', it: 'Un firewall semplice ispeziona i frammenti isolati e non nota nulla.' } },
      { actor: 'victim', title: { en: 'Target reassembles the attack', it: 'Il bersaglio riassembla l\'attacco' }, detail: { en: 'The host stitches the overlapping fragments back into the malicious payload.', it: 'L\'host ricompone i frammenti sovrapposti nel payload malevolo.' } }
    ],
    neutralizeAtStep: 1,
    defense: {
      name: { en: 'Stateful firewall with reassembly', it: 'Firewall stateful con riassemblaggio' },
      action: { en: 'The firewall reassembles the full packet first, then inspects it as a whole.', it: 'Il firewall riassembla prima il pacchetto completo, poi lo ispeziona nell\'insieme.' },
      mechanism: { en: 'The hidden payload becomes visible before it reaches the target and is blocked.', it: 'Il payload nascosto diventa visibile prima di arrivare al bersaglio e viene bloccato.' }
    },
    outcomeSuccess: { en: 'The malicious payload bypasses the filter and hits the host.', it: 'Il payload malevolo aggira il filtro e colpisce l\'host.' },
    outcomeBlocked: { en: 'Reassembled and inspected, the attack is caught at the firewall.', it: 'Riassemblato e ispezionato, l\'attacco viene fermato al firewall.' }
  },
  {
    scenarioId: 'l4-udp-flood',
    layer: 4,
    severity: 'high',
    goal: {
      en: 'Overwhelm a target with a high volume of UDP packets.',
      it: 'Travolgere un bersaglio con un alto volume di pacchetti UDP.'
    },
    steps: [
      { actor: 'attacker', title: { en: 'Blast UDP at random ports', it: 'Spara UDP su porte casuali' }, detail: { en: 'A huge stream of UDP datagrams is sent to the target.', it: 'Un enorme flusso di datagrammi UDP viene inviato al bersaglio.' }, packet: 'UDP flood → random ports' },
      { actor: 'victim', title: { en: 'Host answers each closed port', it: 'L\'host risponde a ogni porta chiusa' }, detail: { en: 'For every packet on a closed port it generates an ICMP "unreachable".', it: 'Per ogni pacchetto su porta chiusa genera un ICMP "unreachable".' } },
      { actor: 'network', title: { en: 'Bandwidth and resources exhausted', it: 'Banda e risorse esaurite' }, detail: { en: 'Both the flood and the replies saturate the link.', it: 'Sia la raffica sia le risposte saturano il collegamento.' } },
      { actor: 'victim', title: { en: 'Service becomes unreachable', it: 'Il servizio diventa irraggiungibile' }, detail: { en: 'Legitimate traffic can no longer get through.', it: 'Il traffico legittimo non riesce più a passare.' } }
    ],
    neutralizeAtStep: 2,
    defense: {
      name: { en: 'Upstream rate-limiting / DDoS scrubbing', it: 'Rate-limiting a monte / scrubbing DDoS' },
      action: { en: 'A scrubbing center or edge rate-limit absorbs and filters the flood before the server.', it: 'Un centro di scrubbing o un rate-limit di bordo assorbe e filtra la raffica prima del server.' },
      mechanism: { en: 'Only legitimate-rate traffic reaches the host, which stays responsive.', it: 'Solo il traffico a rate legittimo raggiunge l\'host, che resta reattivo.' }
    },
    outcomeSuccess: { en: 'The service is saturated and drops offline.', it: 'Il servizio è saturato e va offline.' },
    outcomeBlocked: { en: 'The flood is scrubbed upstream; the service stays up.', it: 'La raffica è filtrata a monte; il servizio resta attivo.' }
  },
  {
    scenarioId: 'l4-scan',
    layer: 4,
    severity: 'medium',
    goal: {
      en: 'Map which ports and services are open on a target before attacking.',
      it: 'Mappare quali porte e servizi sono aperti sul bersaglio prima di attaccare.'
    },
    steps: [
      { actor: 'attacker', title: { en: 'Probe many ports', it: 'Sonda molte porte' }, detail: { en: 'Sends SYN packets to a range of TCP ports.', it: 'Invia pacchetti SYN a un intervallo di porte TCP.' }, packet: 'SYN → ports 1-1024' },
      { actor: 'victim', title: { en: 'Open ports reply SYN-ACK', it: 'Le porte aperte rispondono SYN-ACK' }, detail: { en: 'Closed ports send RST; open ones answer, revealing services.', it: 'Le porte chiuse inviano RST; quelle aperte rispondono, rivelando i servizi.' } },
      { actor: 'attacker', title: { en: 'Build a service map', it: 'Costruisce una mappa dei servizi' }, detail: { en: 'The attacker learns what is running (SSH 22, HTTP 80…) to target next.', it: 'L\'attaccante scopre cosa gira (SSH 22, HTTP 80…) per il prossimo bersaglio.' } }
    ],
    neutralizeAtStep: 1,
    defense: {
      name: { en: 'Default-deny firewall + IPS scan detection', it: 'Firewall default-deny + rilevamento scansioni IPS' },
      action: { en: 'Unsolicited ports are silently dropped and the burst of probes trips a scan signature.', it: 'Le porte non richieste vengono scartate in silenzio e la raffica di probe fa scattare una firma di scansione.' },
      mechanism: { en: 'Ports appear "filtered" (no reply) and the scanner is flagged or blocked.', it: 'Le porte appaiono "filtered" (nessuna risposta) e lo scanner viene segnalato o bloccato.' }
    },
    outcomeSuccess: { en: 'The attacker gets a full map of exposed services.', it: 'L\'attaccante ottiene una mappa completa dei servizi esposti.' },
    outcomeBlocked: { en: 'Ports look closed/filtered and the scan is detected.', it: 'Le porte sembrano chiuse/filtrate e la scansione viene rilevata.' }
  },
  {
    scenarioId: 'l3-pod',
    layer: 3,
    severity: 'medium',
    goal: {
      en: 'Crash a host with a malformed, oversized ICMP packet (Ping of Death).',
      it: 'Mandare in crash un host con un pacchetto ICMP malformato e sovradimensionato (Ping of Death).'
    },
    steps: [
      { actor: 'attacker', title: { en: 'Send oversized fragmented ICMP', it: 'Invia ICMP frammentato e sovradimensionato' }, detail: { en: 'Fragments that reassemble beyond the 65,535-byte limit.', it: 'Frammenti che, riassemblati, superano il limite di 65.535 byte.' }, packet: 'ICMP reassembled > 65535 bytes' },
      { actor: 'victim', title: { en: 'Host reassembles the fragments', it: 'L\'host riassembla i frammenti' }, detail: { en: 'A vulnerable network stack overflows its buffer.', it: 'Uno stack di rete vulnerabile fa traboccare il buffer.' } },
      { actor: 'victim', title: { en: 'System crashes or reboots', it: 'Il sistema va in crash o si riavvia' }, detail: { en: 'The oversized packet corrupts memory.', it: 'Il pacchetto sovradimensionato corrompe la memoria.' } }
    ],
    neutralizeAtStep: 1,
    defense: {
      name: { en: 'Modern OS patches + ICMP size filtering', it: 'Patch OS moderne + filtraggio dimensione ICMP' },
      action: { en: 'The stack validates the reassembled size and routers drop malformed/oversized ICMP.', it: 'Lo stack valida la dimensione riassemblata e i router scartano ICMP malformati/sovradimensionati.' },
      mechanism: { en: 'The illegal packet is discarded instead of overflowing a buffer.', it: 'Il pacchetto illegale viene scartato invece di far traboccare un buffer.' }
    },
    outcomeSuccess: { en: 'The target crashes, causing a denial of service.', it: 'Il bersaglio va in crash, causando un denial of service.' },
    outcomeBlocked: { en: 'The malformed packet is rejected; the host stays stable.', it: 'Il pacchetto malformato viene rifiutato; l\'host resta stabile.' }
  },
  {
    scenarioId: 'l7-homograph',
    layer: 7,
    severity: 'high',
    goal: {
      en: 'Trick a user with a lookalike domain to steal their credentials.',
      it: 'Ingannare un utente con un dominio-sosia per rubargli le credenziali.'
    },
    steps: [
      { actor: 'attacker', title: { en: 'Register a lookalike domain', it: 'Registra un dominio-sosia' }, detail: { en: 'Uses Unicode characters identical to Latin ones (e.g. Cyrillic "а").', it: 'Usa caratteri Unicode identici a quelli latini (es. la "а" cirillica).' }, packet: 'аpple.com → xn--pple-43d.com' },
      { actor: 'attacker', title: { en: 'Send a convincing link', it: 'Invia un link convincente' }, detail: { en: 'An email or message points to the fake domain.', it: 'Un\'email o un messaggio rimanda al dominio falso.' } },
      { actor: 'victim', title: { en: 'User sees a trusted name', it: 'L\'utente vede un nome fidato' }, detail: { en: 'The address looks legitimate at a glance.', it: 'L\'indirizzo sembra legittimo a colpo d\'occhio.' } },
      { actor: 'victim', title: { en: 'Credentials entered on fake site', it: 'Credenziali inserite sul sito falso' }, detail: { en: 'The user logs in and hands over their password.', it: 'L\'utente accede e consegna la sua password.' } }
    ],
    neutralizeAtStep: 2,
    defense: {
      name: { en: 'Browser punycode display + awareness', it: 'Visualizzazione punycode nel browser + consapevolezza' },
      action: { en: 'The browser shows the real "xn--" punycode form and warns about mixed scripts.', it: 'Il browser mostra la vera forma punycode "xn--" e avvisa sugli alfabeti misti.' },
      mechanism: { en: 'The disguise is exposed, so the user recognises the fake domain.', it: 'Il travestimento viene svelato, così l\'utente riconosce il dominio falso.' }
    },
    outcomeSuccess: { en: 'The victim\'s credentials are handed to the attacker.', it: 'Le credenziali della vittima finiscono all\'attaccante.' },
    outcomeBlocked: { en: 'The lookalike is revealed and the user avoids the trap.', it: 'L\'imitazione viene svelata e l\'utente evita la trappola.' }
  },
  {
    scenarioId: 'l7-slowloris',
    layer: 7,
    severity: 'high',
    goal: {
      en: 'Take down a web server by holding its connections open with slow, partial requests.',
      it: 'Abbattere un web server tenendone aperte le connessioni con richieste lente e parziali.'
    },
    steps: [
      { actor: 'attacker', title: { en: 'Open many connections', it: 'Apre molte connessioni' }, detail: { en: 'Starts hundreds of HTTP requests at once.', it: 'Avvia centinaia di richieste HTTP contemporaneamente.' }, packet: 'GET / HTTP/1.1 (headers a goccia…)' },
      { actor: 'attacker', title: { en: 'Send headers very slowly', it: 'Invia gli header lentissimamente' }, detail: { en: 'Each request is kept incomplete on purpose, never finishing.', it: 'Ogni richiesta è tenuta incompleta di proposito, senza mai concludersi.' } },
      { actor: 'victim', title: { en: 'Server keeps sockets waiting', it: 'Il server tiene i socket in attesa' }, detail: { en: 'It holds every connection open expecting the rest.', it: 'Mantiene ogni connessione aperta aspettando il resto.' } },
      { actor: 'victim', title: { en: 'Connection pool exhausted', it: 'Pool di connessioni esaurito' }, detail: { en: 'With all slots busy, real users are refused.', it: 'Con tutti gli slot occupati, gli utenti veri vengono rifiutati.' } }
    ],
    neutralizeAtStep: 1,
    defense: {
      name: { en: 'Reverse proxy + connection/timeout limits', it: 'Reverse proxy + limiti di connessione/timeout' },
      action: { en: 'A proxy buffers the full request and enforces per-client timeouts and connection caps.', it: 'Un proxy attende la richiesta completa e impone timeout per client e limiti di connessioni.' },
      mechanism: { en: 'Slow, incomplete requests are dropped before they can tie up the server.', it: 'Le richieste lente e incomplete vengono chiuse prima di impegnare il server.' }
    },
    outcomeSuccess: { en: 'The web server stops answering legitimate users.', it: 'Il web server smette di rispondere agli utenti legittimi.' },
    outcomeBlocked: { en: 'Stalled connections are timed out; the server stays available.', it: 'Le connessioni bloccate vanno in timeout; il server resta disponibile.' }
  },
  {
    scenarioId: 'l7-smtp-relay',
    layer: 7,
    severity: 'medium',
    goal: {
      en: 'Abuse a misconfigured mail server to send spam/spoofed email as someone else.',
      it: 'Sfruttare un server di posta mal configurato per inviare spam/email contraffatte a nome altrui.'
    },
    steps: [
      { actor: 'attacker', title: { en: 'Connect to an open relay', it: 'Si collega a un open relay' }, detail: { en: 'Finds a mail server that accepts mail for any domain.', it: 'Trova un server di posta che accetta mail per qualsiasi dominio.' }, packet: 'MAIL FROM:<ceo@bank.com>' },
      { actor: 'victim', title: { en: 'Server accepts foreign mail', it: 'Il server accetta posta esterna' }, detail: { en: 'With no restrictions, it relays mail it should not.', it: 'Senza restrizioni, inoltra posta che non dovrebbe.' } },
      { actor: 'network', title: { en: 'Spam/spoofed mail goes out', it: 'Parte spam/posta contraffatta' }, detail: { en: 'Messages appear to come from a trusted sender.', it: 'I messaggi sembrano provenire da un mittente fidato.' } },
      { actor: 'victim', title: { en: 'Recipients deceived / IP blacklisted', it: 'Destinatari ingannati / IP in blacklist' }, detail: { en: 'Targets get phishing and the server\'s IP gets blacklisted.', it: 'I bersagli ricevono phishing e l\'IP del server finisce in blacklist.' } }
    ],
    neutralizeAtStep: 1,
    defense: {
      name: { en: 'Close the relay + SPF/DKIM/DMARC', it: 'Chiudi il relay + SPF/DKIM/DMARC' },
      action: { en: 'The server relays only for authenticated/local users, and SPF/DKIM verify the sender.', it: 'Il server inoltra solo per utenti autenticati/locali, e SPF/DKIM verificano il mittente.' },
      mechanism: { en: 'Unauthorized relaying is refused and forged senders fail authentication.', it: 'L\'inoltro non autorizzato è rifiutato e i mittenti falsi non superano l\'autenticazione.' }
    },
    outcomeSuccess: { en: 'The server becomes a spam cannon for spoofed email.', it: 'Il server diventa un cannone di spam per email contraffatte.' },
    outcomeBlocked: { en: 'Relaying is refused; spoofed mail is rejected.', it: 'L\'inoltro è rifiutato; la posta contraffatta viene respinta.' }
  },
  {
    scenarioId: 'l7-ftp-sniffing',
    layer: 7,
    severity: 'high',
    goal: {
      en: 'Steal login credentials by capturing unencrypted FTP traffic.',
      it: 'Rubare le credenziali di accesso catturando traffico FTP non cifrato.'
    },
    steps: [
      { actor: 'victim', title: { en: 'User logs into FTP', it: 'L\'utente accede a FTP' }, detail: { en: 'The client sends its username and password to the server.', it: 'Il client invia username e password al server.' } },
      { actor: 'network', title: { en: 'Credentials travel in cleartext', it: 'Le credenziali viaggiano in chiaro' }, detail: { en: 'FTP has no encryption at all.', it: 'FTP non ha alcuna cifratura.' }, packet: 'USER admin / PASS s3cr3t (plain)' },
      { actor: 'attacker', title: { en: 'Sniff the packets', it: 'Sniffa i pacchetti' }, detail: { en: 'Anyone on the path reads the credentials directly.', it: 'Chiunque sul percorso legge le credenziali direttamente.' } },
      { actor: 'attacker', title: { en: 'Reuse the stolen login', it: 'Riusa il login rubato' }, detail: { en: 'The attacker logs in as the victim.', it: 'L\'attaccante accede come la vittima.' } }
    ],
    neutralizeAtStep: 1,
    defense: {
      name: { en: 'Use SFTP / FTPS (encrypted transfer)', it: 'Usa SFTP / FTPS (trasferimento cifrato)' },
      action: { en: 'The whole session is encrypted with SSH (SFTP) or TLS (FTPS).', it: 'L\'intera sessione è cifrata con SSH (SFTP) o TLS (FTPS).' },
      mechanism: { en: 'Sniffed packets are ciphertext, so the credentials stay secret.', it: 'I pacchetti intercettati sono testo cifrato, quindi le credenziali restano segrete.' }
    },
    outcomeSuccess: { en: 'The attacker captures working credentials in plain sight.', it: 'L\'attaccante cattura credenziali valide in chiaro.' },
    outcomeBlocked: { en: 'Only encrypted traffic is captured; credentials are safe.', it: 'Viene catturato solo traffico cifrato; le credenziali sono al sicuro.' }
  }
];

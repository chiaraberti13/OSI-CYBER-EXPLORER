import { LayerData, AttackScenario } from './types';

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
          'IP addresses are logical (software-assigned) unlike MAC addresses which are hardware-burned.',
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
          'Gli indirizzi IP sono logici (assegnati via software) a differenza degli indirizzi MAC che sono fissi nell\'hardware.',
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
          'Switches learn MAC addresses from traffic; a full table forces them to broadcast like a hub (fail-open).'
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
          'Gli switch imparano gli indirizzi MAC dal traffico; una tabella piena li forza a trasmettere come un hub (fail-open).'
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
    description: { en: 'Filling the switch CAM table to force fail-open mode.', it: 'Riempimento della tabella CAM dello switch per forzare il fail-open.' },
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
    recommendedDefense: { en: 'Deploying RPKI and BGPsec for route validation.', it: 'Distribuzione di RPKI e BGPsec per la validazione delle rotte.' },
    targetLayer: 7,
    attackType: 'mitm',
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

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: {
      en: "Which layer is responsible for routing packets based on IP addresses?",
      it: "Quale livello è responsabile dell'instradamento dei pacchetti basato sugli indirizzi IP?"
    },
    options: [
      { en: "Data Link (L2)", it: "Data Link (L2)" },
      { en: "Network (L3)", it: "Network (L3)" },
      { en: "Transport (L4)", it: "Trasporto (L4)" },
      { en: "Application (L7)", it: "Applicazione (L7)" }
    ],
    correctAnswer: 1,
    explanation: {
      en: "The Network Layer (L3) manages logical addressing (IP addresses) and routes packets across diverse networks to reach their destination.",
      it: "Il livello Network (L3) gestisce l'indirizzamento logico (IP) e decide il percorso migliore (routing) che i pacchetti devono seguire per raggiungere la destinazione."
    }
  },
  {
    id: 2,
    question: {
      en: "What is the primary function of the Transport Layer (L4)?",
      it: "Qual è la funzione principale del livello di Trasporto (L4)?"
    },
    options: [
      { en: "Physical signaling", it: "Segnalazione fisica" },
      { en: "End-to-end communication and error recovery", it: "Comunicazione end-to-end e recupero errori" },
      { en: "Managing session dialogues", it: "Gestione dei dialoghi di sessione" },
      { en: "Formatting data for the user", it: "Formattazione dei dati per l'utente" }
    ],
    correctAnswer: 1,
    explanation: {
      en: "The Transport Layer (L4) ensures end-to-end reliability, flow control, and error recovery using protocols like TCP.",
      it: "Il livello Trasporto (L4) è responsabile del trasferimento affidabile dei dati end-to-end, del controllo di flusso e della correzione degli errori (es. TCP)."
    }
  },
  {
    id: 3,
    question: {
      en: "Which protocol is commonly used for secure remote command-line access?",
      it: "Quale protocollo è comunemente usato per l'accesso remoto sicuro via riga di comando?"
    },
    options: [
      { en: "FTP", it: "FTP" },
      { en: "HTTP", it: "HTTP" },
      { en: "SSH", it: "SSH" },
      { en: "SMTP", it: "SMTP" }
    ],
    correctAnswer: 2,
    explanation: {
      en: "SSH (Secure Shell) provides robust encryption for secure terminal sessions, completely replacing cleartext legacy protocols like Telnet.",
      it: "SSH (Secure Shell) offre un canale cifrato sicuro per sessioni di terminale remoto, rimpiazzando protocolli insicuri e in chiaro come Telnet."
    }
  },
  {
    id: 4,
    question: {
      en: "A SYN Flood attack targets which layer?",
      it: "Un attacco SYN Flood a quale livello punta?"
    },
    options: [
      { en: "Layer 7", it: "Livello 7" },
      { en: "Layer 4", it: "Livello 4" },
      { en: "Layer 3", it: "Livello 3" },
      { en: "Layer 2", it: "Livello 2" }
    ],
    correctAnswer: 1,
    explanation: {
      en: "SYN Floods exploit the TCP three-way handshake queue (SYN backlog) at Layer 4 (Transport), exhausting host socket resources.",
      it: "Il SYN Flood sfrutta la coda degli handshake parziali TCP (SYN backlog) a livello 4 (Trasporto), esaurendo le risorse di socket dell'host."
    }
  },
  {
    id: 5,
    question: {
      en: "What does DNSSEC provide?",
      it: "Cosa fornisce DNSSEC?"
    },
    options: [
      { en: "Faster browsing speed", it: "Velocità di navigazione maggiore" },
      { en: "Encryption of all user traffic", it: "Crittografia di tutto il traffico utente" },
      { en: "Cryptographic authentication of DNS records", it: "Autenticazione crittografica dei record DNS" },
      { en: "Automatic IP address assignment", it: "Assegnazione automatica di indirizzi IP" }
    ],
    correctAnswer: 2,
    explanation: {
      en: "DNSSEC signs DNS records cryptographically so that clients can verify the authentic mapping of domains without sniffing, spoofing, or redirection hazards.",
      it: "DNSSEC firma digitalmente i record DNS per consentire la verifica di integrità e autenticità, prevenendo dirottamenti e risposte fasulle."
    }
  },
  {
    id: 6,
    question: {
      en: "Which protocol is used to translate domain names into IP addresses?",
      it: "Quale protocollo viene utilizzato per tradurre i nomi di dominio in indirizzi IP?"
    },
    options: [
      { en: "HTTP", it: "HTTP" },
      { en: "DNS", it: "DNS" },
      { en: "BGP", it: "BGP" },
      { en: "DHCP", it: "DHCP" }
    ],
    correctAnswer: 1,
    explanation: {
      en: "DNS (Domain Name System) functions at Layer 7 to map human-readable hostnames to numeric IP addresses.",
      it: "Il DNS (Domain Name System) opera a livello 7 per risolvere i nomi di dominio leggibili in indirizzi IP numerici."
    }
  },
  {
    id: 7,
    question: {
      en: "What is the standard port for SSH?",
      it: "Qual è la porta standard per SSH?"
    },
    options: [
      { en: "21", it: "21" },
      { en: "22", it: "22" },
      { en: "23", it: "23" },
      { en: "80", it: "80" }
    ],
    correctAnswer: 1,
    explanation: {
      en: "Port 22 is globally reserved by IANA for Secure Shell (SSH) connections by default.",
      it: "La porta standard IANA assegnata di default alle connessioni crittografate SSH (Secure Shell) è la porta 22."
    }
  },
  {
    id: 8,
    question: {
      en: "At which layer does an Ethernet Switch primarily operate?",
      it: "A quale livello opera principalmente uno Switch Ethernet?"
    },
    options: [
      { en: "Layer 1", it: "Livello 1" },
      { en: "Layer 2", it: "Livello 2" },
      { en: "Layer 3", it: "Livello 3" },
      { en: "Layer 4", it: "Livello 4" }
    ],
    correctAnswer: 1,
    explanation: {
      en: "Ethernet switches operate primarily at the Data Link Layer (L2) to inspect destination MAC addresses and forward frames accordingly.",
      it: "Gli switch Ethernet lavorano al livello Data Link (L2), analizzando gli indirizzi MAC di destinazione per inoltrare i frame selettivamente."
    }
  },
  {
    id: 9,
    question: {
      en: "What does MTU stand for in networking?",
      it: "Cosa significa MTU nel networking?"
    },
    options: [
      { en: "Master Traffic Unit", it: "Master Traffic Unit" },
      { en: "Maximum Transmission Unit", it: "Maximum Transmission Unit" },
      { en: "Multi-Tasking Utility", it: "Multi-Tasking Utility" },
      { en: "Modern Telemetry Unit", it: "Modern Telemetry Unit" }
    ],
    correctAnswer: 1,
    explanation: {
      en: "Maximum Transmission Unit (MTU) represents the largest physical packet size (usually 1500 bytes on standard Ethernet) that a medium can traverse without fragmentation.",
      it: "La Maximum Transmission Unit (MTU) rappresenta la dimensione massima (es. 1500 byte in Ethernet) che un pacchetto può avere per viaggiare sul mezzo fisico senza frammentarsi."
    }
  },
  {
    id: 10,
    question: {
      en: "Which address is used at Layer 2 to identify a network interface?",
      it: "Quale indirizzo viene utilizzato al Livello 2 per identificare un'interfaccia di rete?"
    },
    options: [
      { en: "IP Address", it: "Indirizzo IP" },
      { en: "MAC Address", it: "Indirizzo MAC" },
      { en: "Port Number", it: "Numero di Porta" },
      { en: "AS Number", it: "Numero AS" }
    ],
    correctAnswer: 1,
    explanation: {
      en: "Ethernet networks rely on physical 48-bit MAC addresses burned into Network Interface Cards relative to Layer 2.",
      it: "Le reti locali usano gli indirizzi MAC fisici a 48 bit cablati direttamente nelle schede di rete (NIC) per l'instradamento di livello 2."
    }
  },
  {
    id: 11,
    question: {
      en: "What type of attack involves an attacker placing themselves between two communicating parties?",
      it: "Che tipo di attacco prevede che un attaccante si posizioni tra due parti comunicanti?"
    },
    options: [
      { en: "MITM", it: "MITM" },
      { en: "DDoS", it: "DDoS" },
      { en: "SQL Injection", it: "SQL Injection" },
      { en: "Phishing", it: "Phishing" }
    ],
    correctAnswer: 0,
    explanation: {
      en: "Man-In-The-Middle (MITM) occurs when an attacker transparently intercepts, relays, or alters communication between two legitimate endpoints.",
      it: "Si definisce Man-In-The-Middle (MITM) quando un hacker intercetta, inoltra o altera segretamente le informazioni tra due macchine che credono di comunicare direttamente."
    }
  },
  {
    id: 12,
    question: {
      en: "Which protocol is considered the 'routing protocol of the Internet'?",
      it: "Quale protocollo è considerato il 'protocollo di routing di Internet'?"
    },
    options: [
      { en: "OSPF", it: "OSPF" },
      { en: "RIP", it: "RIP" },
      { en: "BGP", it: "BGP" },
      { en: "ICMP", it: "ICMP" }
    ],
    correctAnswer: 2,
    explanation: {
      en: "BGP (Border Gateway Protocol) is the exterior gateway protocol that coordinates routing topologies globally among Autonomous Systems (AS) on the internet.",
      it: "Il protocollo BGP (Border Gateway Protocol) è lo standard di routing esterno che unisce e sincronizza le tabelle di instradamento mondiali tra gli Autonomous Systems (AS)."
    }
  },
  {
    id: 13,
    question: {
      en: "Which EAP (Extensible Authentication Protocol) method is considered the most secure by requiring digital certificates on both the client and the server?",
      it: "Quale metodo EAP (Extensible Authentication Protocol) è considerato il più sicuro poiché richiede certificati digitali sia sul client che sul server?"
    },
    options: [
      { en: "EAP-MD5 (Weak password hash)", it: "EAP-MD5 (Hash password debole)" },
      { en: "EAP-PEAP (Server cert + password inside tunnel)", it: "EAP-PEAP (Certificato server + password nel tunnel)" },
      { en: "EAP-TLS (Dual certificate verification)", it: "EAP-TLS (Certificati digitali su ambo i lati)" },
      { en: "EAP-FAST (Cisco Shared PAC tunnel)", it: "EAP-FAST (Tunnel Cisco con chiave PAC)" }
    ],
    correctAnswer: 2,
    explanation: {
      en: "EAP-TLS is the gold standard because it demands mutual cryptographic certificate verification on both client (supplicant) and server sides.",
      it: "EAP-TLS è il protocollo più robusto poiché richiede l'autenticazione crittografica e lo scambio di certificati digitali X.509 validi sia sul client che sul server."
    }
  },
  {
    id: 14,
    question: {
      en: "What is a major administrative difference between RADIUS and TACACS+ protocols?",
      it: "Qual è una delle principali differenze amministrative tra i protocolli RADIUS e TACACS+?"
    },
    options: [
      { en: "RADIUS uses reliable TCP while TACACS+ uses speed-centric UDP", it: "RADIUS usa TCP con connessione affidabile mentre TACACS+ usa UDP per la velocità" },
      { en: "TACACS+ completely encrypts the packet payload body and separates AAA, whereas RADIUS encrypts only the password and combines Auth/Authz", it: "TACACS+ cifra interamente l'intero corpo del payload e separa le funzioni AAA, mentre RADIUS cifra solo la password e unisce Autenticazione/Autorizzazione" },
      { en: "RADIUS is Cisco-proprietary, while TACACS+ is an open standard suited for general client access", it: "RADIUS è un protocollo proprietario Cisco, mentre TACACS+ è uno standard aperto per l'accesso client classico" },
      { en: "TACACS+ operates at the Physical layer (L1) while RADIUS operates at the Session layer (L5)", it: "TACACS+ opera a livello Fisico (L1) mentre RADIUS opera a livello Sessione (L5)" }
    ],
    correctAnswer: 1,
    explanation: {
      en: "TACACS+ completely encrypts everything but the packet header, uses reliable TCP, and decouples AAA operations; RADIUS combines Autentication/Authorization and only encrypts passwords inside UDP.",
      it: "TACACS+ cifra interamente il corpo del pacchetto, usa l'affidabilità di TCP e separa nettamente le fasi AAA; RADIUS unisce Autenticazione/Autorizzazione e cifra unicamente la password su UDP."
    }
  },
  {
    id: 15,
    question: {
      en: "Why is DTLS (Datagram Transport Layer Security) often preferred over TLS inside VPN client products?",
      it: "Perché il DTLS (Datagram Transport Layer Security) è spesso preferito al TLS all'interno delle VPN client?"
    },
    options: [
      { en: "It completely skips packet integrity hashing verification steps", it: "Salta completamente i controles di integrità del pacchetto" },
      { en: "It integrates directly into physical fiber optic couplers", it: "Si integra direttamente nei connettori fisici in fibra ottica" },
      { en: "It encapsulates data over UDP, preventing latency spikes and TCP-in-TCP retransmission loops of nested tunnels", it: "Invia i dati su UDP, eliminando la latenza e i loop di re-invio causati dal sovrapporre un protocollo TCP sopra un altro (TCP-in-TCP)" },
      { en: "It acts purely as a routing mechanism and cannot encrypt", it: "Agisce puramente come organo di routing e non esegue cifratura" }
    ],
    correctAnswer: 2,
    explanation: {
      en: "Because DTLS encapsulates transit data over UDP. Nesting TCP payload streams inside a TCP tunnel triggers catastrophic timing delays (TCP Meltdown/retransmission loops) when transport packets are dropped.",
      it: "Perché il DTLS veicola i dati di transito su UDP. Se si incapsula del traffico TCP dentro un tunnel anch'esso TCP, la perdita di pacchetti causa loop infiniti di re-invio e blocchi di rete ('TCP Meltdown')."
    }
  },
  {
    id: 16,
    question: {
      en: "Which IPsec operational mode encrypts the entire original IP packet and appends a completely new IP header, preferred in Site-to-Site VPNs?",
      it: "Quale modalità operativa di IPsec cifra l'intero pacchetto IP originario e aggiunge una nuova intestazione IP, preferita nelle VPN Site-to-Site?"
    },
    options: [
      { en: "Transport Mode (Encrypts payload only)", it: "Modalità Trasporto (Cifra solo il payload)" },
      { en: "Tunnel Mode (Encrypts whole packet + new IP header)", it: "Modalità Tunnel (Cifra l'intero pacchetto + nuovo header IP)" },
      { en: "Pass-Through Mode (No active payload encryption)", it: "Modalità Passante (Nessuna cifratura attiva)" },
      { en: "Gateway Mode (Compresses header without signatures)", it: "Modalità Gateway (Comprime l'intestazione senza firma)" }
    ],
    correctAnswer: 1,
    explanation: {
      en: "Tunnel Mode encrypts the entire original IP packet (header + payload) and prefixes a completely new outer IP header, making it perfect for connecting network gateways in Site-to-Site office tunnels.",
      it: "La modalità Tunnel cifra il pacchetto IP di origine nella sua interezza (sia l'intestazione originaria sia i dati) e vi aggiunge un'intestazione IP esterna protettiva, ideale nei collegamenti stabili Site-to-Site."
    }
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
      en: 'Internet Protocol Security - A suite of secure network-layer (L3) protocols (ESP, AH, IKE) that encrypt and authenticate all IP packets, widely used to connect site-to-site office VPN tunnels.',
      it: 'Internet Protocol Security - Una suite di protocolli di livello Network (ESP, AH, IKE) che cifra e autentica pacchetti IP. È lo standard di riferimento per unire sedi aziendali via VPN.'
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
      en: 'Protocol Data Unit - The name for data at different layers (Bit, Frame, Packet, Segment).',
      it: 'Protocol Data Unit - Il nome dei dati ai diversi livelli (Bit, Frame, Pacchetto, Segmento).'
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
      en: 'Time To Live - A value in an IP packet that limits its lifespan to prevent infinite loops.',
      it: 'Time To Live - Un valore in un pacchetto IP che ne limita la durata per evitare loop infiniti.'
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
      en: 'The PDU of the Transport Layer (Layer 4). Includes port numbers.',
      it: 'La PDU del livello Transport (Livello 4). Include i numeri di porta.'
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
      en: 'The conceptual model and set of communications protocols used on the Internet.',
      it: 'Il modello concettuale e l\'insieme di protocolli di comunicazione utilizzati su Internet.'
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
      en: 'A type of DDoS attack that allows a single machine to take down another machine\'s web server with minimal bandwidth.',
      it: 'Un tipo di attacco DDoS che permette a una singola macchina di abbattere il server web di un\'altra macchina con banda minima.'
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
      it: 'Sistema di Rilevamento delle Intrusioni - Un dispositivo o software che monitora una rete o sistemi alla ricerca di attività dannose o violazioni delle policy.'
    }
  },
  {
    term: 'IPS',
    definition: {
      en: 'Intrusion Prevention System - A network security tool that monitors network traffic to detect and actively block or prevent malicious activities.',
      it: 'Sistema di Prevenzione delle Intrusioni - Uno strumento di sicurezza che monitora il traffico di rete per rilevare e bloccare attivamente o prevenire attività dannose.'
    }
  },
  {
    term: 'NIDS / NIPS',
    definition: {
      en: 'Network-based IDS/IPS - Monitors and analyzes traffic from multiple devices on an entire subnet to identify security threats.',
      it: 'IDS/IPS basato su Rete - Monitora e analizza il traffico proveniente da più dispositivi su un\'intera sottorete per identificare minacce alla sicurezza.'
    }
  },
  {
    term: 'HIDS / HIPS',
    definition: {
      en: 'Host-based IDS/IPS - Installed directly on a specific host or device to monitor internal operating system activities and files.',
      it: 'IDS/IPS basato su Host - Installato direttamente su un host o dispositivo specifico per monitorare le attività interne del sistema operativo e dei file.'
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
      en: 'Media Access Control Address - A unique 48-bit physical hardware identifier burned into a network interface card (NIC) used for local Layer 2 frame routing.',
      it: 'Indirizzo MAC - Un identificativo fisico univoco a 48 bit registrato direttamente sulla scheda di rete (NIC) usato per l\'instradamento dei frame a livello locale (Livello 2).'
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
      en: 'User Datagram Protocol - A simple, faster, connectionless Transport layer (Layer 4) protocol used for speed-centric and low-latency transmissions without packet loss recovery guarantees.',
      it: 'User Datagram Protocol - Un protocollo di livello Transport (Livello 4) non orientato alla connessione, leggero e ultra-veloce, ottimizzato per trasmissioni a bassa latenza senza garanzie di recupero dei pacchetti.'
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
      en: 'Unicast Reverse Path Forwarding - A network routing security tool that mitigates IP spoofing by checking if the source address of an incoming packet matches return routing table paths.',
      it: 'Unicast Reverse Path Forwarding - Una tecnologia di sicurezza dei router per mitigare l\'IP spoofing, che verifica se l\'indirizzo IP sorgente del pacchetto in arrivo coincide storicamente con l\'interfaccia di ritorno ottimale.'
    }
  },
  {
    term: 'DAI',
    definition: {
      en: 'Dynamic ARP Inspection - A switch hardware security feature that intercepts and validates ARP packets in local subnets, dropping unauthorized gratuitous replies to prevent Man-in-the-Middle attacks.',
      it: 'Dynamic ARP Inspection - Una funzionalità di sicurezza degli switch che intercetta e convalida le risposte ARP in una rete locale, scartando pacchetti gratuitous non autorizzati per impedire attacchi MitM.'
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
      it: 'Authenticated Encryption with Associated Data - Modalità cifrate (es. AES-GCM) che garantiscono contemporaneamente la riservatezza e l\'integrità del payload, prevenendo la manipolazione delle eccezioni di padding.'
    }
  }
];

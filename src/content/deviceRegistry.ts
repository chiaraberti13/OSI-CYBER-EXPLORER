import type { DeviceInfo } from './portsExplorerTypes';

export const DEVICE_REGISTRY: DeviceInfo[] = [
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
      en: 'Joins two physical LAN segments and separates their collision domains, while the two segments remain a single broadcast domain — the historical ancestor of the switch, which is simply a multiport bridge.',
      it: 'Unisce due segmenti LAN fisici separandone i domini di collisione, mentre i due segmenti restano un unico dominio di broadcast: è l\'antenato storico dello switch, che non è altro che un bridge multiporta.'
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

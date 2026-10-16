import type { DeviceInfo } from './portsExplorerTypes';

export const DEVICE_REGISTRY: DeviceInfo[] = [
  {
    name: 'FW-PF - Stateless Firewall',
    fullName: 'Packet Filtering Firewall (Stateless)',
    layer: 'Layer 3, 4 (Network/Transport)',
    category: 'security',
    role: {
      en: 'Filters individual packets using addresses, ports and protocols, without connection tracking.',
      it: 'Filtra i singoli pacchetti tramite indirizzi, porte e protocolli, senza tracciare le connessioni.'
    },
    howItWorks: {
      en: 'Applies ordered ACL rules to each packet; the default action and rule order determine the result.',
      it: 'Applica regole ACL ordinate a ogni pacchetto; l’azione predefinita e l’ordine delle regole determinano l’esito.'
    },
    securityAttacks: {
      en: 'Configured rules restrict reachable services and source networks; filtering does not make an allowed service safe.',
      it: 'Le regole configurate limitano servizi raggiungibili e reti sorgenti; il filtraggio non rende sicuro un servizio consentito.'
    },
    cannotStop: {
      en: 'Cannot establish whether a packet belongs to an expected conversation or inspect application meaning by basic header rules alone.',
      it: 'Le sole regole sulle intestazioni non stabiliscono se un pacchetto appartiene a una conversazione attesa né ne interpretano il contenuto applicativo.'
    },
    mitigation: {
      en: 'Keep least-privilege ACL policies; add stateful and application controls where the traffic and risk require them.',
      it: 'Mantenere politiche ACL di minimo privilegio; aggiungere controlli stateful e applicativi dove traffico e rischio lo richiedono.'
    },
    iconName: 'Shield'
  },
  {
    name: 'FW-SI - Stateful Firewall',
    fullName: 'Stateful Inspection Firewall',
    layer: 'Layer 3, 4 (Network/Transport)',
    category: 'security',
    role: {
      en: 'Tracks connections and applies policy to new and returning traffic; inbound services can be explicitly permitted.',
      it: 'Traccia le connessioni e applica regole al traffico nuovo e di risposta; i servizi in ingresso possono essere autorizzati esplicitamente.'
    },
    howItWorks: {
      en: 'Uses a state table with endpoint addresses, ports and protocol state; exact validation depends on the implementation.',
      it: 'Usa una tabella di stato con indirizzi degli endpoint, porte e stato del protocollo; i controlli precisi dipendono dall’implementazione.'
    },
    securityAttacks: {
      en: 'Can reject unsolicited traffic and packets inconsistent with tracked state, subject to configured policy.',
      it: 'Può rifiutare traffico non richiesto e pacchetti incoerenti con lo stato registrato, secondo la politica configurata.'
    },
    cannotStop: {
      en: 'Connection state alone does not detect SQL injection or malicious files inside permitted application traffic; state tables can also be exhausted.',
      it: 'Il solo stato delle connessioni non rileva SQL injection o file dannosi nel traffico applicativo consentito; anche le tabelle di stato possono esaurirsi.'
    },
    mitigation: {
      en: 'Apply connection limits and monitoring; combine with application security, WAF or IPS where appropriate.',
      it: 'Applicare limiti alle connessioni e monitoraggio; integrare sicurezza applicativa, WAF o IPS dove opportuno.'
    },
    iconName: 'Shield'
  },
  {
    name: 'FW-PX - Proxy Firewall',
    fullName: 'Application-Level Proxy Firewall',
    layer: 'Layer 7 (Application)',
    category: 'security',
    role: {
      en: 'Mediates application exchanges through separate client-side and server-side connections.',
      it: 'Media gli scambi applicativi tramite connessioni separate verso il client e verso il server.'
    },
    howItWorks: {
      en: 'An application-aware proxy validates supported commands and messages before relaying requests; unsupported protocols need separate handling.',
      it: 'Un proxy applicativo valida comandi e messaggi supportati prima di inoltrare richieste; i protocolli non supportati richiedono gestione separata.'
    },
    securityAttacks: {
      en: 'Can reject forbidden commands and malformed messages covered by its rules; mediation alone does not prevent every exploit.',
      it: 'Può rifiutare comandi vietati e messaggi malformati coperti dalle regole; la sola intermediazione non previene ogni exploit.'
    },
    cannotStop: {
      en: 'Proxy vulnerabilities, permitted but harmful transactions, and traffic that bypasses the proxy remain risks.',
      it: 'Restano rischi le vulnerabilità del proxy, le transazioni consentite ma dannose e il traffico che aggira il proxy.'
    },
    mitigation: {
      en: 'Patch and harden the proxy, restrict bypass paths, test rules and plan capacity and high availability.',
      it: 'Aggiornare e proteggere il proxy, limitare i percorsi alternativi, collaudare le regole e pianificare capacità e alta disponibilità.'
    },
    iconName: 'Server'
  },
  {
    name: 'FW-KPF - Kernel Proxy',
    fullName: 'Kernel Proxy Firewall',
    layer: 'Layer 5, 6, 7 (Session/Presentation/Application)',
    category: 'security',
    role: {
      en: 'Describes a proxy architecture with functions in the operating system kernel; it is not a universal security or performance standard.',
      it: 'Descrive un’architettura proxy con funzioni nel kernel del sistema operativo; non è uno standard universale di sicurezza o prestazioni.'
    },
    howItWorks: {
      en: 'Protocol handling runs partly in kernel space. Supported inspection and throughput depend on the product and enabled features.',
      it: 'La gestione dei protocolli avviene in parte nel kernel. Ispezione supportata e velocità dipendono dal prodotto e dalle funzioni abilitate.'
    },
    securityAttacks: {
      en: 'Only the implemented access and protocol checks mitigate attacks; running in the kernel adds no automatic detection capability.',
      it: 'Solo i controlli di accesso e protocollo implementati mitigano gli attacchi; operare nel kernel non aggiunge rilevamento automatico.'
    },
    cannotStop: {
      en: 'Cannot infer malicious intent from valid credentials alone; a vulnerable kernel component can affect the entire host.',
      it: 'Non può dedurre intenti dannosi dalle sole credenziali valide; un componente kernel vulnerabile può compromettere l’intero host.'
    },
    mitigation: {
      en: 'Verify supported features, patch privileged components and combine access control with MFA and monitored administrative activity.',
      it: 'Verificare le funzioni supportate, aggiornare i componenti privilegiati e integrare controlli di accesso, MFA e monitoraggio amministrativo.'
    },
    iconName: 'Cpu'
  },
  {
    name: 'WAF - Web Application Firewall',
    fullName: 'Web Application Firewall',
    layer: 'Layer 7 (Application)',
    category: 'security',
    role: {
      en: 'Applies application security rules to HTTP traffic, including HTTPS where decrypted content is available for inspection.',
      it: 'Applica regole di sicurezza applicativa al traffico HTTP, incluso HTTPS dove il contenuto decifrato è disponibile per l’ispezione.'
    },
    howItWorks: {
      en: 'Inspects headers, parameters and bodies using configured rules. OWASP Top 10 is a risk awareness document, not a signature database.',
      it: 'Ispeziona intestazioni, parametri e corpi con regole configurate. OWASP Top 10 è un documento sui rischi, non un database di firme.'
    },
    securityAttacks: {
      en: 'Can mitigate SQL injection and XSS patterns; credential abuse needs appropriate rate limits and additional identity controls.',
      it: 'Può mitigare pattern di SQL injection e XSS; gli abusi delle credenziali richiedono limiti di frequenza e ulteriori controlli di identità.'
    },
    cannotStop: {
      en: 'Business-logic flaws, bypasses and false negatives remain possible. An on-site WAF cannot prevent upstream link saturation.',
      it: 'Restano possibili errori di logica applicativa, aggiramenti e falsi negativi. Un WAF locale non impedisce la saturazione del collegamento a monte.'
    },
    mitigation: {
      en: 'Fix application vulnerabilities, tune and test rules, monitor false positives and arrange upstream DDoS protection when needed.',
      it: 'Correggere vulnerabilità applicative, calibrare e collaudare regole, monitorare falsi positivi e predisporre protezione DDoS a monte quando necessaria.'
    },
    iconName: 'Shield'
  },
  {
    name: 'UTM - Unified Threat Management',
    fullName: 'Unified Threat Management',
    layer: 'Multi-Layer (Layers 3, 4, 5, 7)',
    category: 'security',
    role: {
      en: 'Combines firewall, intrusion prevention and other security services in one management platform.',
      it: 'Combina firewall, prevenzione delle intrusioni e altri servizi di sicurezza in un’unica piattaforma di gestione.'
    },
    howItWorks: {
      en: 'Enabled inspection engines process traffic that crosses the device; processing order and acceleration vary by product.',
      it: 'I motori di ispezione abilitati elaborano il traffico che attraversa il dispositivo; ordine e accelerazione variano secondo il prodotto.'
    },
    securityAttacks: {
      en: 'Configured engines can detect or block covered malware and prohibited traffic; licensing, updates and visibility affect coverage.',
      it: 'I motori configurati possono rilevare o bloccare malware coperto dalle regole e traffico vietato; licenze, aggiornamenti e visibilità influenzano la copertura.'
    },
    cannotStop: {
      en: 'Cannot inspect traffic that bypasses it, including local lateral movement; encrypted content and overload can limit inspection.',
      it: 'Non ispeziona traffico che lo aggira, inclusi movimenti laterali locali; contenuti cifrati e sovraccarico possono limitare l’ispezione.'
    },
    mitigation: {
      en: 'Size capacity with inspection enabled, segment internal traffic and combine with endpoint monitoring and response.',
      it: 'Dimensionare la capacità con ispezione attiva, segmentare il traffico interno e integrare monitoraggio e risposta sugli endpoint.'
    },
    iconName: 'Cpu'
  },
  {
    name: 'NGFW - Next-Generation FW',
    fullName: 'Next-Generation Firewall',
    layer: 'Layer 3, 4, 7 (Application & Port Aware)',
    category: 'security',
    role: {
      en: 'Combines stateful policy with application identification and security inspection; capabilities vary by implementation.',
      it: 'Combina politiche stateful con identificazione applicativa e ispezione di sicurezza; le capacità variano secondo l’implementazione.'
    },
    howItWorks: {
      en: 'Uses protocol parsing and traffic metadata for application identification. DPI does not itself decrypt TLS.',
      it: 'Usa analisi dei protocolli e metadati del traffico per identificare le applicazioni. La DPI non decifra automaticamente TLS.'
    },
    securityAttacks: {
      en: 'Can enforce application restrictions and detect covered exploit patterns when the relevant inspection is enabled.',
      it: 'Può imporre restrizioni applicative e rilevare exploit coperti dalle regole quando l’ispezione pertinente è abilitata.'
    },
    cannotStop: {
      en: 'Encrypted payloads may remain opaque; valid credentials, unknown attacks and bypass paths still create risk.',
      it: 'I payload cifrati possono restare opachi; credenziali valide, attacchi sconosciuti e percorsi alternativi costituiscono ancora rischi.'
    },
    mitigation: {
      en: 'Use authorized TLS inspection only where appropriate, validate certificates, handle exceptions and supplement with endpoint controls.',
      it: 'Usare ispezione TLS autorizzata solo dove appropriata, validare i certificati, gestire le eccezioni e integrare controlli sugli endpoint.'
    },
    iconName: 'Shield'
  },
  {
    name: 'RTR - Network Router',
    fullName: 'Network Router',
    layer: 'Layer 3 (Network)',
    category: 'networking',
    role: {
      en: 'Forwards IP packets between networks using connected, static or dynamically learned routes.',
      it: 'Inoltra pacchetti IP tra reti tramite rotte connesse, statiche o apprese dinamicamente.'
    },
    howItWorks: {
      en: 'Selects the most specific matching destination prefix in the forwarding table, then sends the packet toward the next hop.',
      it: 'Seleziona nella tabella di inoltro il prefisso di destinazione corrispondente più specifico, poi invia il pacchetto verso il prossimo salto.'
    },
    securityAttacks: {
      en: 'ACL and uRPF can constrain unwanted or spoofed traffic when correctly configured; routing itself is not a security guarantee.',
      it: 'ACL e uRPF possono limitare traffico indesiderato o falsificato se configurati correttamente; il routing da solo non garantisce sicurezza.'
    },
    cannotStop: {
      en: 'Traffic switched locally without crossing the router is outside its enforcement path; a router also processes link-layer frames on its interfaces.',
      it: 'Il traffico commutato localmente senza attraversare il router non è soggetto ai suoi controlli; il router elabora anche frame sulle proprie interfacce.'
    },
    mitigation: {
      en: 'Protect routing and management access; configure switch protections such as DHCP snooping and DAI with valid bindings.',
      it: 'Proteggere routing e accesso di gestione; configurare sugli switch DHCP snooping e DAI con associazioni valide.'
    },
    iconName: 'Shuffle'
  },
  {
    name: 'SW - Ethernet Switch',
    fullName: 'Layer 2 Ethernet Switch',
    layer: 'Layer 2 (Data Link)',
    category: 'networking',
    role: {
      en: 'Forwards Ethernet frames within a VLAN; full-duplex links avoid the shared collision domain of a hub.',
      it: 'Inoltra frame Ethernet entro una VLAN; i collegamenti full-duplex evitano il dominio di collisione condiviso di un hub.'
    },
    howItWorks: {
      en: 'Learns source MAC addresses per VLAN and port; looks up destination MAC addresses, flooding unknown unicast and broadcast on eligible ports.',
      it: 'Apprende MAC sorgenti per VLAN e porta; cerca il MAC destinatario e propaga unicast sconosciuti e broadcast sulle porte ammesse.'
    },
    securityAttacks: {
      en: 'Configured BPDU Guard protects edge ports; Root Guard prevents an unwanted root election on selected links. Neither is automatic.',
      it: 'BPDU Guard configurato protegge le porte edge; Root Guard impedisce elezioni root indesiderate sui collegamenti scelti. Nessuno dei due è automatico.'
    },
    cannotStop: {
      en: 'Basic switching does not validate application content or encrypt frames; forwarding separation does not eliminate sniffing risks.',
      it: 'La commutazione di base non valida contenuti applicativi né cifra frame; la separazione dei flussi non elimina i rischi di intercettazione.'
    },
    mitigation: {
      en: 'Restrict access and trunks, apply appropriate switching protections and inspect inter-segment traffic with dedicated security controls.',
      it: 'Limitare accessi e trunk, applicare protezioni di switching appropriate e ispezionare il traffico tra segmenti con controlli dedicati.'
    },
    iconName: 'Network'
  },
  {
    name: 'WAP - Wireless AP',
    fullName: 'Wireless Access Point',
    layer: 'Layer 2 (Data Link)',
    category: 'networking',
    role: {
      en: 'Connects wireless clients to a distribution network, commonly bridging Wi-Fi and Ethernet traffic.',
      it: 'Collega client wireless a una rete di distribuzione, comunemente facendo da bridge tra traffico Wi-Fi ed Ethernet.'
    },
    howItWorks: {
      en: 'Manages client association and radio access; authentication and link encryption depend on the configured wireless security mode.',
      it: 'Gestisce associazione dei client e accesso radio; autenticazione e cifratura del collegamento dipendono dalla modalità di sicurezza configurata.'
    },
    securityAttacks: {
      en: 'Proper WPA3 configuration protects radio data and access; MAC filtering alone does not authenticate a device securely.',
      it: 'Una configurazione WPA3 corretta protegge dati radio e accessi; il solo filtro MAC non autentica un dispositivo in modo sicuro.'
    },
    cannotStop: {
      en: 'Encryption does not prevent radio jamming or endpoint compromise. Wireless protection is not end-to-end application encryption.',
      it: 'La cifratura non previene disturbi radio intenzionali né compromissioni degli endpoint. La protezione wireless non è cifratura applicativa end-to-end.'
    },
    mitigation: {
      en: 'Use supported security modes, validate enterprise authentication servers, require protected management frames and monitor radio coverage.',
      it: 'Usare modalità di sicurezza supportate, validare i server di autenticazione aziendale, richiedere frame di gestione protetti e monitorare la copertura radio.'
    },
    iconName: 'Radio'
  },
  {
    name: 'GWY - Protocol Gateway',
    fullName: 'Application & Protocol Gateway',
    layer: 'Layer 3 to 7 (Multi-Layer)',
    category: 'infrastructure',
    role: {
      en: 'Translates between protocols or application interfaces so otherwise incompatible systems can exchange data.',
      it: 'Traduce tra protocolli o interfacce applicative per consentire lo scambio di dati tra sistemi altrimenti incompatibili.'
    },
    howItWorks: {
      en: 'Maps messages and fields between supported formats; preservation of identity, permissions and errors requires explicit design.',
      it: 'Associa messaggi e campi tra formati supportati; conservare identità, permessi ed errori richiede una progettazione esplicita.'
    },
    securityAttacks: {
      en: 'Validation and authorization can reject prohibited messages if implemented; translation alone is not an attack prevention control.',
      it: 'Validazione e autorizzazione possono rifiutare messaggi vietati se implementate; la sola traduzione non è un controllo di prevenzione degli attacchi.'
    },
    cannotStop: {
      en: 'Malicious valid messages, parser flaws and loss of security context across protocols can still reach downstream systems.',
      it: 'Messaggi validi ma dannosi, difetti dei parser e perdita del contesto di sicurezza tra protocolli possono ancora colpire i sistemi a valle.'
    },
    mitigation: {
      en: 'Validate schemas, preserve authorization boundaries, restrict supported operations and test failures and audit logs.',
      it: 'Validare gli schemi, preservare i confini di autorizzazione, limitare le operazioni supportate e collaudare errori e log di audit.'
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
      it: "Unisce due segmenti LAN fisici separandone i domini di collisione, mentre i due segmenti restano un unico dominio di broadcast: è l'antenato storico dello switch, che non è altro che un bridge multiporta."
    },
    howItWorks: {
      en: 'Learns source MAC addresses and forwards by destination. Broadcast and unknown unicast frames are flooded on eligible ports within the same VLAN.',
      it: 'Apprende MAC sorgenti e inoltra in base alla destinazione. Frame broadcast e unicast sconosciuti sono propagati sulle porte ammesse della stessa VLAN.'
    },
    securityAttacks: {
      en: 'Separates forwarding paths for learned destinations; loop prevention requires a suitable topology or STP, not bridging alone.',
      it: 'Separa i percorsi per destinazioni apprese; prevenire loop richiede una topologia adeguata o STP, non il solo bridging.'
    },
    cannotStop: {
      en: 'Basic bridging does not authenticate routing messages or inspect application attacks carried inside frames.',
      it: 'Il bridging di base non autentica i messaggi di routing né ispeziona gli attacchi applicativi trasportati nei frame.'
    },
    mitigation: {
      en: 'Control physical access and loops; protect routing peers with supported authentication rather than relying on the bridge.',
      it: 'Controllare accessi fisici e loop; proteggere i peer di routing con autenticazione supportata anziché affidarsi al bridge.'
    },
    iconName: 'Server'
  },
  {
    name: 'HUB - Network Hub',
    fullName: 'Ethernet Repeater Hub',
    layer: 'Layer 1 (Physical)',
    category: 'networking',
    role: {
      en: 'An Ethernet multiport repeater shares a collision domain and repeats received signals toward other ports.',
      it: 'Un ripetitore Ethernet multiporta condivide un dominio di collisione e ripete i segnali ricevuti verso le altre porte.'
    },
    howItWorks: {
      en: 'Regenerates physical signals without learning MAC addresses or choosing a destination port from a forwarding table.',
      it: 'Rigenera segnali fisici senza apprendere indirizzi MAC né scegliere una porta destinataria da una tabella di inoltro.'
    },
    securityAttacks: {
      en: 'Provides no packet filtering, identity checks or traffic confidentiality.',
      it: 'Non offre filtraggio dei pacchetti, controlli di identità o riservatezza del traffico.'
    },
    cannotStop: {
      en: 'Connected hosts can observe shared traffic, but encrypted payloads remain encrypted; repetition does not decrypt TLS.',
      it: 'Gli host collegati possono osservare il traffico condiviso, ma i payload cifrati restano cifrati; ripetere segnali non decifra TLS.'
    },
    mitigation: {
      en: 'Replace obsolete shared hubs with managed switches, restrict physical access and retain end-to-end encryption.',
      it: 'Sostituire gli hub condivisi obsoleti con switch gestiti, limitare l’accesso fisico e mantenere la cifratura end-to-end.'
    },
    iconName: 'Activity'
  },
  {
    name: 'NIDS - Network IDS (Passive)',
    fullName: 'Network Intrusion Detection System',
    layer: 'Layer 3, 4, 7 (Network/Transport/Application)',
    category: 'security',
    role: {
      en: 'Analyzes copies of network traffic out of band and generates alerts for suspicious activity.',
      it: 'Analizza copie del traffico di rete fuori banda e genera avvisi per attività sospette.'
    },
    howItWorks: {
      en: 'Receives traffic through mirroring or a TAP; signatures and protocol analysis examine only traffic successfully captured.',
      it: 'Riceve traffico tramite mirroring o TAP; firme e analisi dei protocolli esaminano solo il traffico acquisito correttamente.'
    },
    securityAttacks: {
      en: 'Can detect scans and covered exploit patterns; detection depends on placement, rules, capacity and visibility.',
      it: 'Può rilevare scansioni ed exploit coperti dalle regole; il rilevamento dipende da posizione, regole, capacità e visibilità.'
    },
    cannotStop: {
      en: 'A passive sensor cannot directly drop the original packet. Encrypted content, packet loss and evasions can limit detection.',
      it: 'Un sensore passivo non può scartare direttamente il pacchetto originale. Contenuti cifrati, perdite ed evasioni possono limitare il rilevamento.'
    },
    mitigation: {
      en: 'Monitor capture loss, tune rules and send alerts to analysts or controlled response integrations with rollback procedures.',
      it: 'Monitorare perdite di acquisizione, calibrare le regole e inviare avvisi ad analisti o integrazioni di risposta controllate con procedure di ripristino.'
    },
    iconName: 'Activity'
  },
  {
    name: 'NIPS - Network IPS (Active inline)',
    fullName: 'Network Intrusion Prevention System',
    layer: 'Layer 3, 4, 7 (Network/Transport/Application)',
    category: 'security',
    role: {
      en: 'Inspects traffic inline and can block traffic matching configured prevention policies.',
      it: 'Ispeziona il traffico in linea e può bloccare quello corrispondente alle politiche di prevenzione configurate.'
    },
    howItWorks: {
      en: 'Traffic crosses an inspection engine that can drop packets or reset sessions; physical appliances and virtual deployments both exist.',
      it: 'Il traffico attraversa un motore che può scartare pacchetti o interrompere sessioni; esistono apparati fisici e installazioni virtuali.'
    },
    securityAttacks: {
      en: 'Can block recognized exploit attempts before delivery, but signatures and anomaly rules do not cover every attack.',
      it: 'Può bloccare tentativi di exploit riconosciuti prima della consegna, ma firme e regole sulle anomalie non coprono ogni attacco.'
    },
    cannotStop: {
      en: 'Encrypted payloads and unknown evasions can escape inspection. Capacity limits and false positives can disrupt legitimate traffic.',
      it: 'Payload cifrati ed evasioni sconosciute possono sfuggire all’ispezione. Limiti di capacità e falsi positivi possono interrompere traffico legittimo.'
    },
    mitigation: {
      en: 'Test rules and capacity; choose fail-open or fail-closed deliberately. Bypass preserves availability but removes inspection during failure.',
      it: 'Collaudare regole e capacità; scegliere consapevolmente fail-open o fail-closed. Il bypass conserva disponibilità ma rimuove l’ispezione durante il guasto.'
    },
    iconName: 'Shield'
  },
  {
    name: 'NDR - Network Detection & Response',
    fullName: 'Network Detection & Response',
    layer: 'Layer 3, 4, 7 (Network & Traffic Analytics)',
    category: 'security',
    role: {
      en: 'Analyzes network packets and flow metadata to identify suspicious communications and support investigation and response.',
      it: 'Analizza pacchetti e metadati dei flussi di rete per identificare comunicazioni sospette e supportare indagini e risposta.'
    },
    howItWorks: {
      en: 'Builds behavioral baselines and combines analytics with detections; isolation requires configured integrations and response policies.',
      it: 'Costruisce profili comportamentali e combina analisi e rilevamenti; l’isolamento richiede integrazioni configurate e politiche di risposta.'
    },
    securityAttacks: {
      en: 'May reveal C2 beaconing, lateral scans and unusual data transfers; anomalies require contextual investigation.',
      it: 'Può evidenziare beaconing C2, scansioni laterali e trasferimenti insoliti; le anomalie richiedono indagini contestualizzate.'
    },
    cannotStop: {
      en: 'Cannot observe purely local activity with no network evidence; normal-looking traffic and limited visibility can evade detection.',
      it: 'Non osserva attività esclusivamente locali senza evidenze di rete; traffico apparentemente normale e visibilità limitata possono eludere il rilevamento.'
    },
    mitigation: {
      en: 'Combine endpoint and identity telemetry, validate alerts and test authorized containment workflows before automation.',
      it: 'Integrare telemetria degli endpoint e delle identità, validare gli avvisi e collaudare flussi di contenimento autorizzati prima di automatizzarli.'
    },
    iconName: 'Activity'
  },
  {
    name: 'WIDS - Wireless IDS (Air Monitor)',
    fullName: 'Wireless Intrusion Detection System',
    layer: 'Layer 1, 2 (Physical & Data Link - RF Spectrum)',
    category: 'security',
    role: {
      en: 'Monitors wireless activity to identify suspicious access points, clients and management-frame patterns.',
      it: 'Monitora l’attività wireless per identificare access point, client e sequenze di frame di gestione sospetti.'
    },
    howItWorks: {
      en: 'Distributed sensors inspect supported channels and 802.11 frames; radio interference analysis depends on sensor capabilities.',
      it: 'Sensori distribuiti ispezionano canali supportati e frame 802.11; l’analisi delle interferenze radio dipende dalle capacità dei sensori.'
    },
    securityAttacks: {
      en: 'Can flag rogue AP candidates and deauthentication anomalies; a neighboring AP is not automatically malicious.',
      it: 'Può segnalare AP potenzialmente abusivi e anomalie di deautenticazione; un AP vicino non è automaticamente malevolo.'
    },
    cannotStop: {
      en: 'Passive monitoring does not block association or eliminate radio interference; channel coverage gaps can hide activity.',
      it: 'Il monitoraggio passivo non blocca associazioni né elimina interferenze radio; lacune di copertura dei canali possono nascondere attività.'
    },
    mitigation: {
      en: 'Plan sensor coverage, correlate wireless and wired evidence and investigate ownership before authorized containment.',
      it: 'Pianificare la copertura, correlare evidenze wireless e cablate e verificare la proprietà prima di un contenimento autorizzato.'
    },
    iconName: 'Radio'
  },
  {
    name: 'WIPS - Wireless IPS (Air Blocker)',
    fullName: 'Wireless Intrusion Prevention System',
    layer: 'Layer 1, 2 (Physical & Data Link - RF Spectrum)',
    category: 'security',
    role: {
      en: 'Adds policy-driven containment to wireless detection; supported actions depend on deployment and authorization.',
      it: 'Aggiunge contenimento basato su politiche al rilevamento wireless; le azioni supportate dipendono da installazione e autorizzazione.'
    },
    howItWorks: {
      en: 'May use wired-port controls or wireless containment. Spoofed deauthentication is not universally effective, particularly with PMF.',
      it: 'Può usare controlli sulle porte cablate o contenimento wireless. La deautenticazione falsificata non è universalmente efficace, soprattutto con PMF.'
    },
    securityAttacks: {
      en: 'Can restrict confirmed unauthorized connections where enforcement is supported; classification errors can disrupt legitimate users.',
      it: 'Può limitare connessioni non autorizzate confermate dove il controllo è supportato; errori di classificazione possono interrompere utenti legittimi.'
    },
    cannotStop: {
      en: 'Does not prevent passive listening or physical radio jamming; protected management frames limit some over-the-air containment methods.',
      it: 'Non previene ascolto passivo o disturbi radio fisici; i frame di gestione protetti limitano alcuni metodi di contenimento via radio.'
    },
    mitigation: {
      en: 'Require PMF where supported, verify target ownership and prioritize authorized wired containment with explicit response procedures.',
      it: 'Richiedere PMF dove supportato, verificare la proprietà dei bersagli e privilegiare contenimento cablato autorizzato con procedure esplicite.'
    },
    iconName: 'Shield'
  },
  {
    name: 'HIDS - Host IDS (Endpoint Monitor)',
    fullName: 'Host Intrusion Detection System',
    layer: 'Layer 7 (Application & Operating System)',
    category: 'security',
    role: {
      en: 'Monitors host logs, configuration and file integrity to identify suspicious changes and activity.',
      it: 'Monitora log, configurazione e integrità dei file dell’host per identificare modifiche e attività sospette.'
    },
    howItWorks: {
      en: 'An agent collects local events and compares them with rules or trusted baselines; coverage depends on collected telemetry.',
      it: 'Un agente raccoglie eventi locali e li confronta con regole o riferimenti fidati; la copertura dipende dalla telemetria raccolta.'
    },
    securityAttacks: {
      en: 'Can detect unexpected file changes, suspicious logins and privilege changes that produce observable evidence.',
      it: 'Può rilevare modifiche inattese ai file, accessi sospetti e variazioni dei privilegi che producono evidenze osservabili.'
    },
    cannotStop: {
      en: 'Detection alone does not block execution; privileged tampering, missing logs and memory-only activity may reduce visibility.',
      it: 'Il solo rilevamento non blocca l’esecuzione; manomissioni privilegiate, log mancanti e attività solo in memoria possono ridurre la visibilità.'
    },
    mitigation: {
      en: 'Protect the agent, forward logs to a restricted external collector and establish tested response and integrity-baseline procedures.',
      it: 'Proteggere l’agente, inoltrare log a un collettore esterno con accessi limitati e definire procedure collaudate di risposta e verifica dell’integrità.'
    },
    iconName: 'Activity'
  },
  {
    name: 'HIPS - Host IPS (Endpoint Protection)',
    fullName: 'Host Intrusion Prevention System',
    layer: 'Layer 7 (Application & Operating System)',
    category: 'security',
    role: {
      en: 'Enforces endpoint prevention policies against prohibited or suspicious operations, subject to product capabilities.',
      it: 'Applica politiche di prevenzione agli endpoint contro operazioni vietate o sospette, secondo le capacità del prodotto.'
    },
    howItWorks: {
      en: 'Uses operating-system instrumentation and rules to monitor or block activity; not every implementation intercepts all system calls.',
      it: 'Usa strumenti del sistema operativo e regole per monitorare o bloccare attività; non ogni implementazione intercetta tutte le chiamate di sistema.'
    },
    securityAttacks: {
      en: 'Can prevent covered exploit behavior and unauthorized writes; unknown threats are not guaranteed to be blocked.',
      it: 'Può prevenire comportamenti di exploit coperti dalle regole e scritture non autorizzate; il blocco delle minacce sconosciute non è garantito.'
    },
    cannotStop: {
      en: 'Firmware compromise, agent tampering and policy exceptions remain risks; false positives can interrupt legitimate applications.',
      it: 'Compromissioni firmware, manomissioni dell’agente ed eccezioni alle politiche restano rischi; falsi positivi possono interrompere applicazioni legittime.'
    },
    mitigation: {
      en: 'Test prevention policies, minimize exceptions, protect the agent and combine patching, least privilege and recovery planning.',
      it: 'Collaudare le politiche, ridurre le eccezioni, proteggere l’agente e integrare aggiornamenti, minimo privilegio e pianificazione del ripristino.'
    },
    iconName: 'Shield'
  },
  {
    name: 'EDR - Endpoint Detection & Response',
    fullName: 'Endpoint Detection & Response',
    layer: 'Layer 7 (Application & Operating System)',
    category: 'security',
    role: {
      en: 'Collects endpoint telemetry to support threat detection, investigation and response; prevention and automation vary by product.',
      it: 'Raccoglie telemetria degli endpoint per rilevamento, indagini e risposta; prevenzione e automazione variano secondo il prodotto.'
    },
    howItWorks: {
      en: 'Correlates observable process, file and network events. Process termination or host isolation requires supported, configured response actions.',
      it: 'Correla eventi osservabili di processi, file e rete. Terminazione dei processi o isolamento dell’host richiedono azioni supportate e configurate.'
    },
    securityAttacks: {
      en: 'Can identify suspicious process chains, credential access and ransomware behavior without guaranteeing detection of every technique.',
      it: 'Può identificare catene di processi sospette, accesso alle credenziali e comportamenti ransomware senza garantire il rilevamento di ogni tecnica.'
    },
    cannotStop: {
      en: 'Missing telemetry, disabled agents and evasions can conceal attacks. Physical theft and firmware risks need additional controls.',
      it: 'Telemetria mancante, agenti disabilitati ed evasioni possono nascondere attacchi. Furto fisico e rischi firmware richiedono controlli aggiuntivi.'
    },
    mitigation: {
      en: 'Monitor agent health, validate response actions, limit privileges and maintain tested offline or immutable backups.',
      it: 'Monitorare lo stato degli agenti, validare le risposte, limitare i privilegi e mantenere backup offline o immutabili collaudati.'
    },
    iconName: 'Cpu'
  },
  {
    name: 'LBR - Load Balancer',
    fullName: 'Application Delivery Controller & Load Balancer',
    layer: 'Layer 4, 7 (Transport/Application)',
    category: 'networking',
    role: {
      en: 'Distributes client traffic across backend services to improve capacity and availability within configured limits.',
      it: 'Distribuisce traffico dei client tra servizi backend per migliorare capacità e disponibilità entro i limiti configurati.'
    },
    howItWorks: {
      en: 'Uses transport or application information and health checks to select backends; algorithms and session affinity vary.',
      it: 'Usa informazioni di trasporto o applicative e controlli di salute per scegliere i backend; algoritmi e affinità di sessione variano.'
    },
    securityAttacks: {
      en: 'Can spread load and exclude unhealthy backends; it does not create unlimited capacity or automatically mitigate DDoS.',
      it: 'Può distribuire il carico ed escludere backend non funzionanti; non crea capacità illimitata né mitiga automaticamente DDoS.'
    },
    cannotStop: {
      en: 'Balancing alone does not detect application exploits; the balancer itself can fail or become overloaded.',
      it: 'Il solo bilanciamento non rileva exploit applicativi; il bilanciatore stesso può guastarsi o sovraccaricarsi.'
    },
    mitigation: {
      en: 'Plan redundancy and capacity, restrict origin access and combine application fixes with WAF and upstream protection as needed.',
      it: 'Pianificare ridondanza e capacità, limitare l’accesso ai server di origine e integrare correzioni applicative, WAF e protezione a monte secondo necessità.'
    },
    iconName: 'Shuffle'
  },
  {
    name: 'VPN - VPN Concentrator',
    fullName: 'Virtual Private Network Gateway',
    layer: 'Layer 3 / upper layers (IPsec / TLS)',
    category: 'security',
    role: {
      en: 'Protects selected traffic between remote clients or sites and a gateway over untrusted networks.',
      it: 'Protegge traffico selezionato tra client o sedi remote e un gateway attraverso reti non fidate.'
    },
    howItWorks: {
      en: 'Negotiates keys and authenticates peers using IPsec or TLS-based mechanisms; tunnel routes decide which traffic is protected.',
      it: 'Negozia chiavi e autentica i peer tramite IPsec o meccanismi basati su TLS; le rotte del tunnel determinano il traffico protetto.'
    },
    securityAttacks: {
      en: 'Correct encryption and peer validation protect traffic within tunnel boundaries against interception and modification.',
      it: 'Cifratura e validazione dei peer corrette proteggono il traffico entro i confini del tunnel da intercettazione e modifica.'
    },
    cannotStop: {
      en: 'A tunnel does not make an endpoint trustworthy or remove malicious payloads; excluded traffic follows other paths.',
      it: 'Un tunnel non rende fidato un endpoint né rimuove payload dannosi; il traffico escluso segue altri percorsi.'
    },
    mitigation: {
      en: 'Patch gateways, require strong authentication and MFA where applicable, restrict reachable services and check endpoint posture.',
      it: 'Aggiornare i gateway, richiedere autenticazione robusta e MFA dove applicabile, limitare i servizi raggiungibili e controllare lo stato degli endpoint.'
    },
    iconName: 'Shield'
  },
  {
    name: 'MDM/ONT - Modem & Terminal',
    fullName: 'Modulator-Demodulator & Optical Network Terminal',
    layer: 'Layer 1, 2 (Physical & Data Link)',
    category: 'infrastructure',
    role: {
      en: 'Terminates an access link: modems handle carrier modulation; an ONT terminates an optical access network.',
      it: 'Termina un collegamento di accesso: i modem gestiscono la modulazione della portante; un ONT termina una rete di accesso ottica.'
    },
    howItWorks: {
      en: 'Converts between access-network signaling and customer interfaces such as Ethernet; integrated routing functions depend on the device.',
      it: 'Converte tra segnali della rete di accesso e interfacce utente come Ethernet; le funzioni di routing integrate dipendono dal dispositivo.'
    },
    securityAttacks: {
      en: 'Link termination alone provides no general attack filtering and is not a guarantee of electrical surge protection.',
      it: 'La sola terminazione del collegamento non filtra genericamente gli attacchi e non garantisce protezione dalle sovratensioni.'
    },
    cannotStop: {
      en: 'A basic modem or ONT does not inspect application exploits; combined gateway products may add separate security functions.',
      it: 'Un modem o ONT di base non ispeziona exploit applicativi; prodotti gateway integrati possono aggiungere funzioni di sicurezza separate.'
    },
    mitigation: {
      en: 'Secure management access, maintain supported firmware and place appropriate routing and firewall policies behind the access link.',
      it: 'Proteggere l’accesso di gestione, mantenere firmware supportato e applicare politiche di routing e firewall adeguate dietro il collegamento di accesso.'
    },
    iconName: 'Radio'
  },
  {
    name: 'SIEM - Security Information & Event Management',
    fullName: 'Security Information & Event Management System',
    layer: 'Layer 7 (Application)',
    category: 'security',
    role: {
      en: 'Collects and correlates security events to help analysts investigate suspicious activity across systems.',
      it: 'Raccoglie e correla eventi di sicurezza per aiutare gli analisti a indagare attività sospette su più sistemi.'
    },
    howItWorks: {
      en: 'Normalizes available logs and applies detection rules and analytics; missing sources and time errors weaken correlation.',
      it: 'Normalizza i log disponibili e applica regole e analisi; sorgenti mancanti ed errori temporali indeboliscono la correlazione.'
    },
    securityAttacks: {
      en: 'Can reveal related authentication failures, privilege changes and lateral activity when the relevant evidence is collected.',
      it: 'Può evidenziare errori di autenticazione correlati, variazioni dei privilegi e attività laterali quando sono raccolte evidenze pertinenti.'
    },
    cannotStop: {
      en: 'A SIEM is not inherently inline and does not guarantee detection or blocking; response needs operators or configured integrations.',
      it: 'Un SIEM non è intrinsecamente in linea e non garantisce rilevamento o blocco; la risposta richiede operatori o integrazioni configurate.'
    },
    mitigation: {
      en: 'Validate log coverage and detections; test SOAR playbooks with scoped permissions, approval where needed and rollback.',
      it: 'Validare copertura dei log e rilevamenti; collaudare playbook SOAR con permessi limitati, approvazione dove necessaria e ripristino.'
    },
    iconName: 'Cpu'
  },
  {
    name: 'NAC - Network Access Control',
    fullName: 'Network Access Control & 802.1X Gateway',
    layer: 'Layer 2, 3 (Data Link & Network)',
    category: 'security',
    role: {
      en: 'Controls network admission and authorization based on identity and, where supported, device posture.',
      it: 'Controlla ammissione e autorizzazione di rete in base all’identità e, dove supportato, allo stato del dispositivo.'
    },
    howItWorks: {
      en: 'Can use 802.1X authentication and assign VLAN or access policies. Posture assessment is an additional integration, not inherent to 802.1X.',
      it: 'Può usare autenticazione 802.1X e assegnare VLAN o politiche di accesso. La verifica dello stato è un’integrazione aggiuntiva, non intrinseca a 802.1X.'
    },
    securityAttacks: {
      en: 'Can restrict unauthorized devices and quarantine noncompliant hosts if enforcement and identity checks are configured.',
      it: 'Può limitare dispositivi non autorizzati e isolare host non conformi se sono configurati controlli di identità e applicazione delle politiche.'
    },
    cannotStop: {
      en: 'Admission does not guarantee continuing trust; compromised compliant endpoints and weaker fallback authentication remain risks.',
      it: 'L’ammissione non garantisce fiducia continua; endpoint conformi ma compromessi e autenticazioni alternative più deboli restano rischi.'
    },
    mitigation: {
      en: 'Reassess posture, restrict fallback methods, segment authorized access and monitor policy enforcement failures.',
      it: 'Rivalutare lo stato, limitare i metodi alternativi, segmentare gli accessi autorizzati e monitorare errori di applicazione delle politiche.'
    },
    iconName: 'Server'
  },
  {
    name: 'HNP - Decoy Honeypot',
    fullName: 'Network Decoy Honeypot',
    layer: 'Layer 3, 4, 7 (Multi-Layer)',
    category: 'security',
    role: {
      en: 'Provides monitored decoy services to collect evidence of suspicious interaction; isolation must be designed and maintained.',
      it: 'Offre servizi esca monitorati per raccogliere evidenze di interazioni sospette; l’isolamento va progettato e mantenuto.'
    },
    howItWorks: {
      en: 'Emulates services or uses controlled real systems. Alerts require tuning because legitimate scanning can also reach the decoy.',
      it: 'Emula servizi o usa sistemi reali controllati. Gli avvisi richiedono calibrazione perché anche scansioni legittime possono raggiungere l’esca.'
    },
    securityAttacks: {
      en: 'Can reveal reconnaissance and credential guessing directed at the decoy, providing investigation evidence rather than general prevention.',
      it: 'Può rivelare ricognizione e tentativi sulle credenziali diretti all’esca, fornendo evidenze per indagini anziché prevenzione generale.'
    },
    cannotStop: {
      en: 'Attackers can ignore or identify the decoy; a compromised high-interaction honeypot can become a pivot if containment fails.',
      it: 'Gli attaccanti possono ignorare o riconoscere l’esca; un honeypot ad alta interazione compromesso può diventare un punto di transito se il contenimento fallisce.'
    },
    mitigation: {
      en: 'Isolate decoys, restrict outbound connections, use nonfunctional honeytokens and protect logs; never reuse production credentials.',
      it: 'Isolare le esche, limitare connessioni in uscita, usare honeytoken non operativi e proteggere i log; non riutilizzare credenziali di produzione.'
    },
    iconName: 'Activity'
  },
  {
    name: 'AAA - Authenticator TACACS+/RADIUS',
    fullName: 'Authentication, Authorization, and Accounting Gateway',
    layer: 'Layer 7 (Application)',
    category: 'security',
    role: {
      en: 'Centralizes authentication, authorization and accounting for network access or administration, according to the deployed protocol.',
      it: 'Centralizza autenticazione, autorizzazione e accounting per accesso alla rete o amministrazione, secondo il protocollo adottato.'
    },
    howItWorks: {
      en: 'RADIUS commonly serves network access; TACACS+ commonly serves device administration. Command authorization and logging depend on support and configuration.',
      it: 'RADIUS serve comunemente l’accesso di rete; TACACS+ l’amministrazione degli apparati. Autorizzazione e registrazione dei comandi dipendono da supporto e configurazione.'
    },
    securityAttacks: {
      en: 'Can enforce individual identities and permitted actions; fallback accounts, shared credentials and incomplete logs can weaken accountability.',
      it: 'Può imporre identità individuali e azioni consentite; account alternativi, credenziali condivise e log incompleti possono indebolire la tracciabilità.'
    },
    cannotStop: {
      en: 'Does not protect an unencrypted administrator session or an infected workstation; legacy AAA transports also need protection.',
      it: 'Non protegge una sessione amministrativa non cifrata o una postazione infetta; anche i trasporti AAA legacy richiedono protezione.'
    },
    mitigation: {
      en: 'Use SSH or HTTPS for management, protect AAA transport, apply MFA where supported and test restricted emergency access.',
      it: 'Usare SSH o HTTPS per la gestione, proteggere il trasporto AAA, applicare MFA dove supportata e collaudare accessi di emergenza limitati.'
    },
    iconName: 'Shield'
  },
  {
    name: 'PRX - Proxy Server (Forward/Reverse)',
    fullName: 'Forward & Reverse Proxy Server Array',
    layer: 'Layer 7 (Application)',
    category: 'networking',
    role: {
      en: 'A forward proxy mediates client requests; a reverse proxy fronts servers. Caching, filtering and TLS termination are optional capabilities.',
      it: 'Un forward proxy media le richieste dei client; un reverse proxy precede i server. Cache, filtraggio e terminazione TLS sono capacità opzionali.'
    },
    howItWorks: {
      en: 'Handles requests on behalf of another endpoint; application proxying is distinct from network address translation (NAT).',
      it: 'Gestisce richieste per conto di un altro endpoint; il proxy applicativo è distinto dalla traduzione degli indirizzi di rete (NAT).'
    },
    securityAttacks: {
      en: 'Configured policies can restrict destinations or requests; origin shielding also requires network rules that prevent direct bypass.',
      it: 'Le politiche configurate possono limitare destinazioni o richieste; proteggere il server di origine richiede anche regole di rete contro l’accesso diretto.'
    },
    cannotStop: {
      en: 'A proxy without appropriate application controls may relay malicious valid requests; tunneling does not imply payload inspection.',
      it: 'Un proxy privo di controlli applicativi adeguati può inoltrare richieste valide ma dannose; il tunneling non implica ispezione dei payload.'
    },
    mitigation: {
      en: 'Restrict proxy access and origin exposure, validate upstream TLS certificates and apply tested application rules where required.',
      it: 'Limitare accessi al proxy ed esposizione dei server di origine, validare i certificati TLS a monte e applicare regole applicative collaudate dove richieste.'
    },
    iconName: 'Server'
  },
  {
    name: 'JMP - Jump Server / Bastion Host',
    fullName: 'Secure Administrative Gateway & Bastion Host',
    layer: 'Layer 7 (Application - SSH / RDP / Web Console)',
    category: 'security',
    role: {
      en: 'Provides a controlled administrative entry point to sensitive systems; security depends on hardening and access restrictions.',
      it: 'Offre un punto di ingresso amministrativo controllato verso sistemi sensibili; la sicurezza dipende da protezione e restrizioni di accesso.'
    },
    howItWorks: {
      en: 'Administrators authenticate to an isolated host and then reach authorized targets; access paths and session controls must be configured.',
      it: 'Gli amministratori si autenticano su un host isolato e raggiungono destinazioni autorizzate; percorsi e controlli di sessione vanno configurati.'
    },
    securityAttacks: {
      en: 'Can reduce direct management exposure and centralize audit trails when bypass paths are blocked.',
      it: 'Può ridurre l’esposizione diretta della gestione e centralizzare le tracce di audit quando i percorsi alternativi sono bloccati.'
    },
    cannotStop: {
      en: 'Compromised administrator workstations or the bastion itself can expose credentials and privileged sessions.',
      it: 'Postazioni amministrative compromesse o la compromissione del bastion stesso possono esporre credenziali e sessioni privilegiate.'
    },
    mitigation: {
      en: 'Require MFA, least privilege and protected management paths; patch the host and protect session logs and recorded secrets.',
      it: 'Richiedere MFA, minimo privilegio e percorsi di gestione protetti; aggiornare l’host e proteggere log di sessione e segreti registrati.'
    },
    iconName: 'Shield'
  },
  {
    name: 'TAP/SEN - Network TAP & Sensor',
    fullName: 'Test Access Point & Active/Passive Network Sensor',
    layer: 'Layer 1, 2 (Physical & Data Link)',
    category: 'infrastructure',
    role: {
      en: 'Copies network traffic for analysis; a TAP supplies visibility, while attached sensors interpret the captured data.',
      it: 'Copia traffico di rete per l’analisi; un TAP offre visibilità, mentre i sensori collegati interpretano i dati acquisiti.'
    },
    howItWorks: {
      en: 'Optical splitters and powered copper devices have different failure and signal properties; verify link budgets, capacity and power behavior.',
      it: 'Splitter ottici e dispositivi in rame alimentati hanno proprietà diverse di segnale e guasto; verificare budget ottico, capacità e comportamento senza alimentazione.'
    },
    securityAttacks: {
      en: 'Supports independent observation of traffic crossing the monitored link; it does not authenticate packets or make spoofing impossible.',
      it: 'Supporta l’osservazione indipendente del traffico sul collegamento monitorato; non autentica pacchetti né rende impossibile lo spoofing.'
    },
    cannotStop: {
      en: 'A passive TAP cannot drop malicious traffic; encryption, unmonitored paths and capture loss can limit analysis.',
      it: 'Un TAP passivo non può scartare traffico dannoso; cifratura, percorsi non monitorati e perdite di acquisizione possono limitare l’analisi.'
    },
    mitigation: {
      en: 'Secure physical and monitor-port access, protect captured data and validate visibility and failure behavior before deployment.',
      it: 'Proteggere accessi fisici e porte di monitoraggio, tutelare i dati acquisiti e validare visibilità e comportamento ai guasti prima dell’installazione.'
    },
    iconName: 'Network'
  }
];

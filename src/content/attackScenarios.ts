import type { AttackScenario } from '../types';

/**
 * Split out of the old src/constants.ts.
 *
 * That single file held the OSI layers, the attack scenarios, the glossary and the
 * walkthroughs together, so opening the OSI lab downloaded the glossary too. Each
 * dataset now lives on its own and is imported only where it is used.
 */

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

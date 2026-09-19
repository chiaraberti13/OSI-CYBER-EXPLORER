import type { AttackWalkthrough } from '../types';

/**
 * Split out of the old src/constants.ts.
 *
 * That single file held the OSI layers, the attack scenarios, the glossary and the
 * walkthroughs together, so opening the OSI lab downloaded the glossary too. Each
 * dataset now lives on its own and is imported only where it is used.
 */

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

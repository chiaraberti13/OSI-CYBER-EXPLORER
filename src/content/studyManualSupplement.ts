/**
 * Small, reviewable additions to the study manual. Keeping curriculum deltas here
 * avoids growing the generated/static manual bundle source into an opaque monolith.
 */
import { STUDY_MANUAL as BASE_MANUAL, type ManualChapter, type GuidedLab } from './studyManual';

const ASSESSMENT_EVIDENCE_LAB: GuidedLab = {
  id: 'gl-assessment-evidence-workspace',
  title: { it: 'Costruisci un report di assessment dalle evidenze', en: 'Build an assessment report from evidence' },
  difficulty: 'advanced',
  lab: 'assessment',
  scenario: {
    it: 'Un incarico didattico autorizza esclusivamente la fixture documentale web-01.example.test (192.0.2.10/32). I record simulano OSINT, discovery, porte/servizi, configurazione TLS e un banner incompleto.',
    en: 'A teaching engagement authorizes only the documentation fixture web-01.example.test (192.0.2.10/32). Records simulate OSINT, discovery, ports/services, TLS configuration, and an incomplete banner.'
  },
  task: {
    it: 'Conferma lo scope, raccogli le osservazioni preregistrate, formula un’ipotesi OS esplicitamente incerta, valuta i rilievi e genera il report bilingue.',
    en: 'Confirm scope, collect preloaded observations, state an explicitly uncertain OS hypothesis, assess findings, and generate the bilingual report.'
  },
  steps: [
    {
      it: 'Verifica autorizzazione, target e regole: 198.51.100.20 è escluso. Il workspace è offline e non esegue scansioni né richieste di rete.',
      en: 'Verify authorization, target, and rules: 198.51.100.20 is excluded. The workspace is offline and performs no scans or network requests.'
    },
    {
      it: 'Raccogli OSINT, discovery ed enumerazione fixture. Per ogni dato distingui osservazione da inferenza e conserva fonte, data e confidenza.',
      en: 'Collect fixture OSINT, discovery, and enumeration. Distinguish observations from inferences and retain source, date, and confidence for each item.'
    },
    {
      it: 'Scegli un’ipotesi OS: banner e TTL sono indizi deboli, influenzati da proxy, NAT e hop. Non trattare il fingerprint come prova; indica una verifica indipendente.',
      en: 'Choose an OS hypothesis: banners and TTL are weak clues affected by proxies, NAT, and hops. Do not treat fingerprinting as proof; state an independent validation step.'
    },
    {
      it: 'Confronta TLS 1.0, dichiarato dalla configurazione, con il banner privo di dati sulle patch. Ordina per esposizione, impatto e confidenza; valida il secondo prima di dichiarare una vulnerabilità.',
      en: 'Compare TLS 1.0, explicitly declared by configuration, with the banner that contains no patch data. Rank by exposure, impact, and confidence; validate the latter before claiming a vulnerability.'
    },
    {
      it: 'Esporta e rivedi entrambe le lingue del report: scope, autorizzazione, fonti, date, confidenze, ipotesi e limiti del triage devono restare visibili.',
      en: 'Export and review both report languages: scope, authorization, sources, dates, confidence, hypotheses, and triage limitations must remain visible.'
    }
  ],
  challenge: {
    it: 'Un banner sembra corrispondere a una CVE, ma non identifica release o patch. Quali evidenze autorizzate raccogli prima di confermare il rilievo? Perché il punteggio di triage non è CVSS?',
    en: 'A banner appears to match a CVE but identifies no release or patch status. What authorized evidence do you collect before confirming the finding? Why is the triage score not CVSS?'
  },
  solution: [
    {
      it: 'Correla una release esatta con inventario autenticato e advisory del vendor, verifica la configurazione nel perimetro autorizzato e registra fonte/data/confidenza. Un banner generico non prova la vulnerabilità; una patch può essere retroportata.',
      en: 'Correlate an exact release with authenticated inventory and a vendor advisory, validate configuration within authorized scope, and record source/date/confidence. A generic banner does not prove a vulnerability; a patch may be backported.'
    },
    {
      it: 'L’indice usa un prodotto didattico semplificato, senza modello CVSS, vettori, metriche o calibrazione; serve solo a discutere priorità relative e incertezza.',
      en: 'The index is a simplified teaching product without the CVSS model, vectors, metrics, or calibration; it only supports discussion of relative priority and uncertainty.'
    }
  ],
  selfCheck: [
    {
      it: 'So mantenere scope, provenienza e incertezza e distinguere una configurazione osservata da un banner non conclusivo.',
      en: 'I can preserve scope, provenance, and uncertainty and distinguish an observed configuration from an inconclusive banner.'
    },
    {
      it: 'So generare e rivedere un report bilingue senza interrogare target reali né presentare il triage come CVSS.',
      en: 'I can generate and review a bilingual report without querying real targets or presenting triage as CVSS.'
    }
  ]
};

const EXPLOIT_WORKBENCH_LAB: GuidedLab = {
  id: 'gl-exploit-workbench',
  title: { it: 'Leggi, adatta e verifica un modulo fittizio', en: 'Read, adapt, and verify a fictional module' },
  difficulty: 'advanced',
  lab: 'exploitlab',
  scenario: {
    it: 'La fixture documentale EdgeGate Demo 1.4.2-lab è marcata vulnerabile; 1.4.3-lab è corretta e 2.0-lab non è supportata. Il modulo LAB-MOD-01 è composto solo da metadati fittizi: non esistono CVE, sorgente exploit o payload eseguibile.',
    en: 'The EdgeGate Demo 1.4.2-lab documentation fixture is marked vulnerable; 1.4.3-lab is patched and 2.0-lab is unsupported. Module LAB-MOD-01 consists only of fictional metadata: no CVE, exploit source, or executable payload exists.'
  },
  task: {
    it: 'Conferma lo scope, leggi tipo e prerequisiti del modulo, adatta e revisiona il profilo di compatibilità, scegli un payload descrittivo, interpreta esito/telemetria, confronta i controlli difensivi e ripristina lo stato iniziale.',
    en: 'Confirm scope, read the module type and prerequisites, adapt and review the compatibility profile, select a descriptive payload, interpret the result/telemetry, compare defensive controls, and restore the initial state.'
  },
  steps: [
    {
      it: 'Controlla autorizzazione e indirizzo documentale 192.0.2.44/32, poi conferma la casella di scope. Nessun target esterno è contattato; le selezioni restano nello stato UI.',
      en: 'Check authorization and the documentation address 192.0.2.44/32, then confirm the scope checkbox. No external target is contacted; selections remain in UI state.'
    },
    {
      it: 'Leggi ID, tipo, release affette e prerequisiti. Abbina la versione esatta della fixture: 1.4.2 è nel range dichiarato, 1.4.3 è corretta e 2.0 non è supportata. Non dedurre lo stato di patch dal solo banner.',
      en: 'Read the ID, type, affected releases, and prerequisites. Match the fixture’s exact version: 1.4.2 is in the declared range, 1.4.3 is patched, and 2.0 is unsupported. Do not infer patch status from a banner alone.'
    },
    {
      it: 'La mappatura iniziale del modulo punta al profilo 1.3.x e non è compatibile. Seleziona il profilo 1.4.x e confronta il diff: cambi solo metadati controllati, non codice exploit, indirizzi o payload. Approva esplicitamente la modifica.',
      en: 'The module’s initial mapping points to profile 1.3.x and is incompatible. Select profile 1.4.x and inspect the diff: only controlled metadata changes, not exploit code, addresses, or payloads. Explicitly approve the change.'
    },
    {
      it: 'Scegli il marcatore inerte oppure una scheda sessione reverse o bind. Distingui exploit (metodo che abusa il difetto), payload (comportamento richiesto), handler (trasporto/sessione corrispondente) e sessione mock (oggetto UI statico, senza comandi); osserva chi inizierebbe il flusso nei due modelli.',
      en: 'Choose the inert marker or a simulated reverse or bind session card. Distinguish the exploit (method abusing the flaw), payload (requested behavior), handler (matching transport/session), and mock session (static UI object with no commands); observe which peer would initiate each flow.'
    },
    {
      it: 'Esegui la simulazione deterministica. Con 1.4.2 e il profilo compatibile osserva il mock; ripeti con 1.4.3 e 2.0 per vedere patch e incompatibilità bloccare il risultato. Leggi gli eventi e abbina patch, EDR comportamentale, firewall/IDS, least privilege e segmentazione.',
      en: 'Run the deterministic simulation. With 1.4.2 and a compatible profile observe the mock; repeat with 1.4.3 and 2.0 to see the patch and incompatibility block the result. Read the events and connect patching, behavioral EDR, firewall/IDS, least privilege, and segmentation.'
    },
    {
      it: 'Usa il rollback, verifica che la sessione mock si chiuda e che la fixture ritorni allo stato iniziale, quindi ripeti la prova. Reverse e bind descrivono direzioni d’iniziativa diverse: non assumere che ogni sessione generi sempre egress dal target.',
      en: 'Use rollback, verify that the mock session closes and the fixture returns to its initial state, then repeat the test. Reverse and bind describe different initiation directions: do not assume every session always creates target egress.'
    }
  ],
  challenge: {
    it: 'La fixture mostra un esito simulato compatibile. Perché questo non prova una vulnerabilità reale né la riuscita di un exploit? Quale telemetria distingueresti tra un callback reverse e un listener bind, e come dimostreresti il rollback?',
    en: 'The fixture displays a simulated compatible result. Why does this not prove a real vulnerability or a successful exploit? Which telemetry would you distinguish between a reverse callback and a bind listener, and how would you prove rollback?'
  },
  solution: [
    {
      it: 'Il risultato deriva da etichette statiche e regole deterministiche locali, senza codice, rete o target: dimostra solo che sai correlare prerequisiti, release e profilo dichiarati. Un test reale richiede scope scritto, controllo del target, ambiente isolato e criteri di stop espliciti; la fixture non sostituisce tali verifiche.',
      en: 'The result comes from static labels and local deterministic rules, with no code, network, or target: it only demonstrates that you can correlate stated prerequisites, releases, and profile. A real test requires written scope, target validation, an isolated environment, and explicit stop criteria; the fixture does not replace those checks.'
    },
    {
      it: 'Per reverse, un flusso in uscita dal target può essere un segnale da correlare a processo e destinazione, ma proxy, NAT e policy ne influenzano la visibilità. Per bind, cerca processo in ascolto e connessioni in ingresso secondo le regole previste. Non sono firme universali: combina telemetria endpoint, firewall e contesto autorizzato.',
      en: 'For reverse, an outbound flow from the target can be a signal to correlate with process and destination, although proxies, NAT, and policy affect visibility. For bind, look for a listening process and inbound connections against expected rules. These are not universal signatures: combine endpoint and firewall telemetry with authorized context.'
    },
    {
      it: 'Il rollback chiude l’oggetto sessione mock, registra ROLLBACK_COMPLETE e riporta la fixture didattica al baseline. La verifica è ripetibile e non modifica filesystem, servizi o sistema host.',
      en: 'Rollback closes the mock session object, records ROLLBACK_COMPLETE, and returns the teaching fixture to baseline. The check is repeatable and changes no filesystem, service, or host system.'
    }
  ],
  selfCheck: [
    {
      it: 'So leggere tipo, release supportate, prerequisiti e opzioni senza confondere un controllo con una prova di vulnerabilità.',
      en: 'I can read type, supported releases, prerequisites, and options without confusing a check with proof of vulnerability.'
    },
    {
      it: 'So distinguere exploit, payload, handler e sessione e descrivere come reverse e bind cambiano chi inizia il flusso.',
      en: 'I can distinguish exploit, payload, handler, and session, and explain how reverse and bind change which peer initiates the flow.'
    },
    {
      it: 'So revisionare una modifica controllata, interpretare la telemetria simulata e verificare patch, difese e rollback senza eseguire codice.',
      en: 'I can review a controlled change, interpret simulated telemetry, and verify patching, defenses, and rollback without executing code.'
    }
  ]
};

const EXPLOIT_MANUAL_UPDATE = {
  objectives: {
    it: 'Verificare prerequisiti e compatibilità e adattare in modo controllato i metadati del modulo in una fixture, distinguendo la simulazione dall’esecuzione reale.',
    en: 'Verify prerequisites and compatibility and safely adapt module metadata in a fixture, distinguishing simulation from real execution.'
  },
  theory: [
    {
      it: 'I concetti chiave sono tre. I moduli si dividono per scopo: exploit (sfruttano una vulnerabilità), auxiliary (azioni di supporto, che possono includere scansione o enumerazione) e post (attività dopo l’accesso). Un payload staged usa uno stager iniziale che richiede uno stage successivo; uno stageless include invece il payload completo. Un handler corrispondente gestisce il trasporto/sessione attesa. Direzione e flusso dipendono dal payload: in modalità reverse è il target a iniziare la connessione verso l’handler, mentre in modalità bind il target resta in ascolto e il peer autorizzato inizia la connessione. Nessuno dei due pattern va dato per scontato: firewall, NAT e policy di egress possono modificarne o bloccarne la raggiungibilità.',
      en: 'There are three key concepts. Modules differ by purpose: exploit (abuse a vulnerability), auxiliary (supporting actions, which can include scanning or enumeration), and post (activity after access). A staged payload uses an initial stager that requests a later stage; a stageless payload includes the full payload. A matching handler manages the expected transport/session. Direction and flow depend on the payload: in reverse mode the target initiates a connection to the handler, whereas in bind mode the target listens and the authorized peer initiates the connection. Neither pattern should be assumed: firewalls, NAT, and egress policy can change or block reachability.'
    },
    {
      it: 'Il lato difensivo nasce proprio da questa struttura. Metadati e opzioni dichiarano target, versioni, prerequisiti e compatibilità: vanno confrontati con inventario attendibile e scope prima di qualsiasi prova autorizzata; la verifica preliminare non equivale sempre a dimostrare la vulnerabilità. Nomi o pattern noti possono alimentare firme IDS/IPS/EDR, ma non sono garanzia di detection e un payload modificato può eluderle. La telemetria comportamentale correla processi, integrità, flussi di rete e tentativi di sessione; la direzione osservata dipende da reverse/bind. La patch rimuove il prerequisito, mentre minimo privilegio e segmentazione limitano l’impatto residuo.',
      en: 'The defensive side comes precisely from this structure. Metadata and options declare targets, versions, prerequisites, and compatibility: compare them with trusted inventory and scope before any authorized test; a preliminary check does not always prove a vulnerability. Known names or patterns can feed IDS/IPS/EDR signatures, but they do not guarantee detection and a modified payload may evade them. Behavioral telemetry correlates processes, integrity, network flows, and session attempts; the observed direction depends on reverse/bind. A patch removes the prerequisite, while least privilege and segmentation limit residual impact.'
    }
  ],
  example: {
    it: 'Una fixture di documentazione in 192.0.2.0/24 rappresenta un modulo compatibile: in un payload reverse il target inizierebbe il callback verso l’handler; in un payload bind il target resterebbe in ascolto e il peer autorizzato inizierebbe il flusso. Qui il report mostra soltanto metadati e telemetria simulata. La patch rimuove il prerequisito; EDR comportamentale e controlli di rete possono rilevare o limitare flussi inattesi, senza garantire l’intercettazione di ogni variante.',
    en: 'A documentation fixture in 192.0.2.0/24 represents a compatible module: with a reverse payload the target would initiate a callback to the handler; with a bind payload the target would listen and the authorized peer would initiate the flow. Here the report displays simulated metadata and telemetry only. Patching removes the prerequisite; behavioral EDR and network controls may detect or restrict unexpected flows without guaranteeing interception of every variant.'
  },
  commonMistake: {
    it: 'Assumere che ogni sessione sia una connessione di ritorno in egress: reverse e bind hanno iniziatori diversi e la raggiungibilità dipende da firewall, NAT e policy.',
    en: 'Assuming every session is an outbound callback: reverse and bind have different initiators, and reachability depends on firewall, NAT, and policy.'
  }
};

const PIVOTING_LAB: GuidedLab = {
  id: 'gl-pivot-route-port-forward',
  title: { it: 'Confronta route host e port forwarding', en: 'Compare a host route and port forwarding' },
  difficulty: 'advanced',
  lab: 'pivotlab',
  scenario: {
    it: 'Una fixture documentale rappresenta il tester 198.51.100.10, il pivot con interfacce 198.51.100.20 e 203.0.113.1 e il target 203.0.113.25. È autorizzato solo TCP/443 per un massimo di 10 minuti simulati. Gli indirizzi sono riservati alla documentazione.',
    en: 'A documentation fixture represents tester 198.51.100.10, a pivot with interfaces 198.51.100.20 and 203.0.113.1, and target 203.0.113.25. Only TCP/443 is authorized for at most 10 simulated minutes. These addresses are reserved for documentation.'
  },
  task: {
    it: 'Attiva una sola modalità, confronta tabella route o mapping prima/dopo, simula HTTPS consentito e SSH fuori scope, interpreta firewall/IDS e completa sempre il teardown o la scadenza del lease.',
    en: 'Enable one mode, compare the routing table or mapping before/after, simulate allowed HTTPS and out-of-scope SSH, interpret firewall/IDS signals, and always tear down or expire the lease.'
  },
  steps: [
    {
      it: 'Conferma lo scope 203.0.113.25/32 TCP/443 nella topologia a due subnet. Non aggiungere subnet, host, porte o durata oltre quanto autorizzato.',
      en: 'Confirm scope 203.0.113.25/32 TCP/443 in the two-subnet topology. Do not add subnets, hosts, ports, or duration beyond authorization.'
    },
    {
      it: 'Seleziona host route /32 e una lease di 5 o 10 minuti. La tabella del tester usa 198.51.100.20 come next hop; il pivot deve inoltrare e il firewall deve consentire il flusso.',
      en: 'Select a /32 host route and a 5- or 10-minute lease. The tester table uses 198.51.100.20 as next hop; the pivot must forward and the firewall must allow the flow.'
    },
    {
      it: 'Simula TCP/443 e poi TCP/22. La route instrada l’host ma non autorizza tutte le porte: il firewall nega SSH fuori scope. Disabilita forwarding o firewall e osserva il blocco e la telemetria.',
      en: 'Simulate TCP/443 and then TCP/22. The route directs traffic to the host but does not authorize every port: the firewall denies out-of-scope SSH. Disable forwarding or the firewall and observe the block and telemetry.'
    },
    {
      it: 'Ripeti in modalità port forwarding. La tabella route resta invariata; compare solo 198.51.100.20:8443 → 203.0.113.25:443/TCP. TCP/22 non ha mapping.',
      en: 'Repeat in port-forward mode. The routing table remains unchanged; only 198.51.100.20:8443 → 203.0.113.25:443/TCP appears. TCP/22 has no mapping.'
    },
    {
      it: 'Correla audit del cambio route/mapping, flussi sui due lati del pivot, allow/deny firewall e osservazione IDS east-west. Sono segnali illustrativi, non firme universali.',
      en: 'Correlate route/mapping change audit, flows on both sides of the pivot, firewall allow/deny, and east-west IDS observation. These are illustrative signals, not universal signatures.'
    },
    {
      it: 'Esegui teardown prima della fine della lease e confronta le tabelle con il baseline. In alternativa avanza il tempo simulato fino alla scadenza e verifica la rimozione automatica.',
      en: 'Tear down before the lease ends and compare tables with baseline. Alternatively, advance simulated time to expiry and verify automatic removal.'
    }
  ],
  challenge: {
    it: 'La route /32 raggiunge l’host ma non TCP/22: quale livello nega il servizio? Nel port forwarding, quale parte della route table cambia? Quali eventi correlati provano che il teardown ha ripristinato la fixture?',
    en: 'The /32 route reaches the host but not TCP/22: which layer denies the service? In port forwarding, what changes in the routing table? Which correlated events prove teardown restored the fixture?'
  },
  solution: [
    {
      it: 'La route è una decisione IP nel tester e instrada l’host attraverso il pivot; forwarding sul pivot e policy firewall restano condizioni distinte. La route non concede tutte le porte: TCP/22 è negato per scope. Il port forwarding crea invece un mapping per una sola coppia listener/destinazione, 8443→443, senza route verso la subnet interna.',
      en: 'The route is an IP decision on the tester and directs the host through the pivot; pivot forwarding and firewall policy remain separate conditions. The route does not grant every port: TCP/22 is denied by scope. Port forwarding instead creates one listener/destination mapping, 8443→443, with no route to the internal subnet.'
    },
    {
      it: 'Cambio route, listener/mapping, flussi east-west e decisioni allow/deny possono essere correlati da audit host, firewall e IDS. La telemetria dipende da piattaforma e policy: il laboratorio mostra categorie didattiche e non garantisce detection reale.',
      en: 'Route changes, listener/mapping, east-west flows, and allow/deny decisions can be correlated across host audit, firewall, and IDS. Telemetry depends on platform and policy: this lab shows teaching categories and does not guarantee real detection.'
    },
    {
      it: 'Il teardown rimuove route o mapping e riporta il confronto al baseline; la scadenza della lease esegue la stessa rimozione. Nessun sistema reale viene modificato.',
      en: 'Teardown removes the route or mapping and returns the comparison to baseline; lease expiry performs the same removal. No real system is changed.'
    }
  ],
  selfCheck: [
    {
      it: 'So distinguere una route IP verso un host da un mapping di port forwarding verso un singolo servizio.',
      en: 'I can distinguish an IP route to a host from a port-forward mapping to one service.'
    },
    {
      it: 'So applicare scope host/porta e lease temporale senza confondere routing, forwarding e autorizzazione.',
      en: 'I can apply host/port scope and a time lease without confusing routing, forwarding, and authorization.'
    },
    {
      it: 'So interpretare segnali firewall/IDS e verificare teardown o scadenza fino al baseline.',
      en: 'I can interpret firewall/IDS signals and verify teardown or expiry back to baseline.'
    }
  ]
};

const ONLINE_PASSWORD_LAB: GuidedLab = {
  id: 'gl-online-password-controls',
  title: { it: 'Confronta brute force e password spraying', en: 'Compare brute force and password spraying' },
  difficulty: 'advanced',
  lab: 'passwordlab',
  scenario: {
    it: 'Servizio fittizio con account fixture-user-01…06, nessuna password reale o autenticazione riuscita e nessuna richiesta di rete. Ogni esecuzione è una finestra deterministica isolata.',
    en: 'A mock service uses fixture-user-01…06 labels only: no real password, successful authentication, or network request. Each run is an isolated deterministic window.'
  },
  task: {
    it: 'Osserva differenze tra rate limit per account, lockout e correlazione degli errori distribuiti, senza inserire credenziali.',
    en: 'Observe the difference between per-account rate limiting, lockout, and correlation of distributed failures without entering credentials.'
  },
  steps: [
    {
      it: 'Conferma lo scope fixture. Seleziona brute force, cinque tentativi, rate limit attivo e lockout disattivo; avvia la simulazione e confronta richieste elaborate e frenate.',
      en: 'Confirm fixture scope. Select brute force, five attempts, rate limiting on, and lockout off; run the simulation and compare processed and throttled requests.'
    },
    {
      it: 'Disattiva il rate limit, attiva il lockout e scegli otto tentativi. Verifica che la soglia per account blocchi i tentativi successivi e leggi l’evento di lockout.',
      en: 'Turn rate limiting off, turn lockout on, and choose eight attempts. Verify the per-account threshold blocks later attempts and inspect the lockout event.'
    },
    {
      it: 'Passa a password spraying, scegli cinque account e lascia attivi i controlli individuali. Un solo errore per utente resta sotto soglia; individua l’allerta ottenuta correlando gli account.',
      en: 'Switch to password spraying, choose five accounts, and leave individual controls on. One failure per user stays below threshold; find the alert from cross-account correlation.'
    },
    {
      it: 'Confronta log, contatori, account bloccati e richieste frenate. Distingui difesa di frequenza, lockout potenzialmente impattante e detection distribuita.',
      en: 'Compare logs, counters, locked accounts, and throttled requests. Separate frequency control, potentially disruptive lockout, and distributed detection.'
    },
    {
      it: 'Azzera la vista e ripeti la sequenza: i risultati devono essere deterministici e nessun dato persiste fuori dal componente.',
      en: 'Reset the view and repeat the sequence: results should be deterministic and no data should persist outside the component.'
    }
  ],
  challenge: {
    it: 'Perché cinque errori su un account e un errore su cinque account producono segnali diversi? Quali controlli riducono il rischio senza affidarsi al solo lockout?',
    en: 'Why do five failures on one account and one failure on five accounts produce different signals? Which controls reduce risk without relying on lockout alone?'
  },
  solution: [
    {
      it: 'Il brute force concentra gli errori e raggiunge la soglia individuale; rate limit o lockout lo frenano, ma il lockout può negare servizio all’utente. Lo spraying resta sotto ogni soglia individuale e richiede correlazione cross-account, MFA resistente al phishing e controlli adattivi.',
      en: 'Brute force concentrates failures and reaches the individual threshold; rate limiting or lockout slows it, but lockout can deny service to the user. Spraying stays below each individual threshold and needs cross-account correlation, phishing-resistant MFA, and adaptive controls.'
    },
    {
      it: 'La telemetria fixture mostra solo errori sintetici e decisioni simulate. Non prova un login, non rivela se un account reale esiste e non genera traffico.',
      en: 'Fixture telemetry shows synthetic failures and simulated decisions only. It proves no login, reveals no real account existence, and generates no traffic.'
    }
  ],
  selfCheck: [
    {
      it: 'So distinguere brute force e spraying attraverso la distribuzione degli errori.',
      en: 'I can distinguish brute force and spraying by how failures are distributed.'
    },
    {
      it: 'So separare rate limiting, lockout per account e detection cross-account.',
      en: 'I can separate rate limiting, per-account lockout, and cross-account detection.'
    },
    {
      it: 'So spiegare perché lockout e rate limit non sostituiscono MFA e correlazione.',
      en: 'I can explain why lockout and rate limiting do not replace MFA and correlation.'
    }
  ]
};

const OFFLINE_HASH_COST_LAB: GuidedLab = {
  id: 'gl-offline-hash-cost',
  title: { it: 'Confronta costo KDF, sale e budget offline', en: 'Compare KDF cost, salts, and offline budget' },
  difficulty: 'advanced',
  lab: 'passwordlab',
  scenario: {
    it: 'Due record di credenziali sintetici sono rappresentati da etichette, mai da password o digest reali: fixture legacy con hash veloce e fixture KDF con sale univoco.',
    en: 'Two synthetic credential records are represented by labels, never real passwords or digests: a legacy fast-hash fixture and a KDF fixture with a unique salt.'
  },
  task: {
    it: 'Confronta budget di candidati, impronte fixture e unità di costo didattiche; spiega l’effetto separato di sale, KDF lenta e password forte.',
    en: 'Compare candidate budgets, fixture fingerprints, and teaching cost units; explain the separate effects of salts, a slow KDF, and a strong password.'
  },
  steps: [
    {
      it: 'Conferma lo scope offline sintetico e imposta budget 10. Osserva che il campione debole non è ancora raggiunto e che la fixture KDF costa più unità per candidato.',
      en: 'Confirm synthetic offline scope and set budget 10. Observe the weak sample is not yet reached and the KDF fixture costs more units per candidate.'
    },
    {
      it: 'Aumenta il budget a 100: il campione debole fixture è collocato al candidato 30, mentre quello protetto resta oltre il budget.',
      en: 'Increase the budget to 100: the weak fixture sample is placed at candidate 30, while the hardened one remains beyond budget.'
    },
    {
      it: 'Confronta hash veloce senza sale e profilo Argon2id didattico con sale etichettato univoco. Il sale evita impronte uguali e precomputazione condivisa; non rallenta il singolo hash.',
      en: 'Compare the fast unsalted hash with the educational Argon2id profile and a uniquely labelled salt. Salt avoids identical fingerprints and shared precomputation; it does not slow one hash.'
    },
    {
      it: 'Leggi il costo come unità arbitrarie per candidato, non come tempo o benchmark hardware. Nessuna funzione di hash viene eseguita e i valori non sono parametri di produzione.',
      en: 'Read cost as arbitrary units per candidate, not time or a hardware benchmark. No hash function runs, and values are not production parameters.'
    },
    {
      it: 'Azzera e ripeti; distingui il lavoro offline su un dump sintetico dal rate limit e dai log che proteggono un servizio online.',
      en: 'Reset and repeat; distinguish offline work on a synthetic dump from rate limits and logs that protect an online service.'
    }
  ],
  challenge: {
    it: 'Perché un sale unico non riduce da solo il costo per candidato? Quali due fattori determinano il costo totale e quale difesa protegge il servizio online?',
    en: 'Why does a unique salt not by itself reduce per-candidate cost? Which two factors determine total cost, and which defense protects the online service?'
  },
  solution: [
    {
      it: 'Il sale casuale e per-record impedisce digest uguali e rende non riutilizzabili tabelle precomputate; il fattore di lavoro della KDF aumenta il costo di ogni candidato. Il costo totale dipende da candidati × costo per candidato; passphrase forti ampliano lo spazio. Rate limit, MFA e detection proteggono il percorso online, non il dump già catturato.',
      en: 'A random per-record salt prevents identical digests and makes precomputed tables non-reusable; the KDF work factor raises the cost of each candidate. Total cost depends on candidates × cost per candidate; strong passphrases expand the search space. Rate limiting, MFA, and detection protect the online path, not an already captured dump.'
    },
    {
      it: 'Le impronte e i budget sono etichette sintetiche deterministiche. La vista non contiene credenziali, hash, wordlist o implementazione di cracking.',
      en: 'Fingerprints and budgets are deterministic synthetic labels. The view contains no credentials, hashes, wordlists, or cracking implementation.'
    }
  ],
  selfCheck: [
    {
      it: 'So distinguere rate limit online da costo offline di una KDF.',
      en: 'I can distinguish online rate limiting from offline KDF cost.'
    },
    {
      it: 'So spiegare che il sale impedisce il riuso della precomputazione ma non rallenta un singolo candidato.',
      en: 'I can explain that salt prevents reusable precomputation but does not slow one candidate.'
    },
    {
      it: 'So interpretare il costo didattico senza confonderlo con un benchmark reale.',
      en: 'I can interpret teaching cost without confusing it with a real benchmark.'
    }
  ]
};

const HOST_AUDIT_EVIDENCE_LAB: GuidedLab = {
  id: 'gl-host-audit-evidence-custody',
  title: {
    it: 'Raccogli e trasferisci evidenze host in modo controllato',
    en: 'Collect and transfer host evidence under control'
  },
  difficulty: 'advanced',
  lab: 'auditlab',
  scenario: {
    it: 'Un host Linux o Windows di fixture usa indirizzi RFC 5737 e dati inventati. L’incarico autorizza soltanto le categorie selezionate; password e hash reali non sono presenti né acquisiti.',
    en: 'A Linux or Windows fixture host uses RFC 5737 addresses and invented data. The engagement authorizes selected categories only; no real password or hash is present or collected.'
  },
  task: {
    it: 'Produrre un inventario minimizzato, preservare origine e integrità, trasferire solo artefatti allowlisted e rimuovere la sessione al termine.',
    en: 'Produce a minimized inventory, preserve source and integrity, transfer allowlisted artifacts only, and clear the session at the end.'
  },
  steps: [
    {
      it: 'Leggi lo scope e conferma l’autorizzazione. Scegli la piattaforma fixture e seleziona soltanto rete e sistema; avvia la raccolta e verifica interfaccia, route, ARP, listener e baseline.',
      en: 'Read scope and confirm authorization. Choose a fixture platform and select network and system only; collect them and inspect interface, route, ARP, listeners, and baseline.'
    },
    {
      it: 'Confronta Linux e Windows: nomi interfaccia, indirizzi documentali, servizi in ascolto e stato delle difese. Distingui osservazione fixture da affermazione su un host reale.',
      en: 'Compare Linux and Windows: interface names, documentation addresses, listening services, and defense state. Separate fixture observations from claims about a real host.'
    },
    {
      it: 'Aggiungi l’inventario account e i metadati sensibili. Verifica che gli account siano sintetici e che l’archivio credenziali riporti soltanto conteggio e valore redatto, senza password o hash.',
      en: 'Add account inventory and sensitive metadata. Verify accounts are synthetic and the credential store shows only a count and redacted value, with no password or hash.'
    },
    {
      it: 'Trasferisci host → analista. Confronta SHA-256, percorso allowlisted, origine, operatore e timestamp nella catena di custodia. SHA-256 rileva modifiche ma non prova autenticità o riservatezza.',
      en: 'Transfer host → analyst. Check SHA-256, allowlisted path, source, operator, and timestamp in the custody chain. SHA-256 detects changes but proves neither authenticity nor confidentiality.'
    },
    {
      it: 'Prova analista → host con la sola nota testuale inerte. In un incarico reale usa un canale cifrato autenticato, autorizzazione esplicita e retention minima; infine esegui cleanup e verifica che non resti evidenza.',
      en: 'Try analyst → host using only the inert text note. In a real engagement use an authenticated encrypted channel, explicit authorization, and minimal retention; then clean up and verify no evidence remains.'
    }
  ],
  challenge: {
    it: 'Il manifest mostra listener TCP/22 e TCP/443, un account privilegiato e un archivio credenziali presente. Quali elementi includeresti nel report, quali ometteresti e perché un digest corretto non basta a proteggere il trasferimento?',
    en: 'The manifest shows TCP/22 and TCP/443 listeners, a privileged account, and a credential store. What belongs in the report, what should be omitted, and why is a valid digest not enough to protect transfer?'
  },
  solution: [
    {
      it: 'Riporta i listener e i privilegi sintetici come osservazioni da verificare rispetto a scope e baseline; segnala la presenza del materiale sensibile senza copiarlo. Il digest prova coerenza byte-per-byte rispetto al valore atteso, non identità del mittente né segretezza: serve un canale autenticato e cifrato, controllo accessi, log della custodia e cancellazione concordata.',
      en: 'Report listeners and synthetic privileges as observations to compare with scope and baseline; note sensitive material exists without copying it. A digest checks byte consistency against an expected value, not sender identity or secrecy: use an authenticated encrypted channel, access controls, custody logging, and agreed deletion.'
    },
    {
      it: 'La sessione usa riepiloghi redatti e indirizzi di documentazione. Non apre file, non interroga sistemi, non invia traffico e non trasferisce dati reali.',
      en: 'The session uses redacted summaries and documentation addresses. It opens no files, queries no systems, sends no traffic, and transfers no real data.'
    }
  ],
  selfCheck: [
    {
      it: 'So distinguere inventario host, stato di rete e scanning remoto.',
      en: 'I can distinguish host inventory, network state, and remote scanning.'
    },
    {
      it: 'So minimizzare account e materiale password/hash durante l’audit.',
      en: 'I can minimize account and password/hash material during an audit.'
    },
    {
      it: 'So descrivere limiti SHA-256 e requisiti di un trasferimento reale.',
      en: 'I can explain SHA-256 limits and requirements for a real transfer.'
    },
    {
      it: 'So verificare provenienza, catena di custodia e cleanup.',
      en: 'I can verify provenance, chain of custody, and cleanup.'
    }
  ]
};

const WEB_APPLICATION_PENTEST_LAB: GuidedLab = {
  id: 'gl-web-application-offline-assessment',
  title: {
    it: 'Mappa e verifica una web app fixture in modo sicuro',
    en: 'Safely map and test a web application fixture'
  },
  difficulty: 'advanced',
  lab: 'weblab',
  scenario: {
    it: 'L’incarico autorizza solo portal.demo.example.test (192.0.2.80/32), simulato da record HTTP statici. Non esistono endpoint web in ascolto, account reali o file segreti.',
    en: 'The engagement authorizes only portal.demo.example.test (192.0.2.80/32), represented by static HTTP records. No web endpoint listens and no real account or secret file exists.'
  },
  task: {
    it: 'Raccogli evidenze HTTP, individua percorsi fixture, osserva il controllo login, classifica un difetto di accesso a oggetti e dimostra remediation e regressioni.',
    en: 'Collect HTTP evidence, discover fixture paths, inspect login controls, classify an object-level access flaw, and demonstrate remediation and regression checks.'
  },
  steps: [
    {
      it: 'Conferma l’indirizzo e il perimetro prima di agire. Ispeziona GET / e leggi status, banner e attributi cookie; registra gli header mancanti come indizi, non come prova automatica di impatto.',
      en: 'Confirm the address and scope before acting. Inspect GET / and review status, banner, and cookie attributes; record missing headers as clues, not automatic proof of impact.'
    },
    {
      it: 'Esegui content discovery solo sui percorsi già elencati nella fixture. robots.txt fornisce un hint e non è un meccanismo di controllo accessi; confronta 200, 401 e 404 senza scaricare file.',
      en: 'Run content discovery only against paths already listed in the fixture. robots.txt is a hint, not an access-control mechanism; compare 200, 401, and 404 without downloading files.'
    },
    {
      it: 'Invia tentativi login sintetici e senza password: nella fixture vulnerabile le risposte 401 non sono limitate. Dopo la correzione, il quarto tentativo oltre la soglia di tre riceve 429; il cooldown è simulato.',
      en: 'Submit synthetic login attempts with no passwords: in the vulnerable fixture, 401 responses are not throttled. After remediation, the fourth attempt beyond the threshold of three receives 429; cooldown is simulated.'
    },
    {
      it: 'Con sessione fixture-user-01 richiedi il profilo documentale fixture-user-02. Classifica il 200 inatteso come difetto BOLA/IDOR: autenticazione riuscita non implica autorizzazione sull’oggetto richiesto.',
      en: 'With fixture-user-01 session, request the documentation profile for fixture-user-02. Classify an unexpected 200 as a BOLA/IDOR flaw: successful authentication does not imply authorization for the requested object.'
    },
    {
      it: 'Applica rate limit/cooldown con logging e controllo ownership server-side per ogni oggetto. Esegui le regressioni: il login deve diventare 429 oltre soglia e l’oggetto di un altro utente deve restituire 403 (o la risposta policy prevista).',
      en: 'Apply rate limiting/cooldown with logging and server-side ownership checks for each object. Run regressions: login must return 429 beyond the threshold, and another user’s object must return 403 (or the response required by policy).'
    },
    {
      it: 'Conserva coppie richiesta-risposta, scope, osservazione e correzione nel report. Non confondere banner informativo con versione verificata, hint con esposizione, autenticazione con autorizzazione o fixture con evidenza di un host reale.',
      en: 'Keep request-response pairs, scope, observation, and remediation in the report. Do not confuse an informational banner with a verified release, a hint with exposure, authentication with authorization, or a fixture with evidence about a real host.'
    }
  ],
  challenge: {
    it: 'Un report mostra /admin/ dietro autenticazione, un login senza rate limit e un profilo di un altro utente restituito con 200. Quali evidenze provano ciascun rilievo? Quale correzione strutturale e quale test impediscono la regressione?',
    en: 'A report shows /admin/ behind authentication, a login with no rate limit, and another user’s profile returned with 200. What evidence supports each finding? Which structural fix and test prevent regression?'
  },
  solution: [
    {
      it: 'Registra metodo/percorso, status e body fixture minimizzato. Un 401 prova che /admin/ richiede autenticazione, non che sia vulnerabile; più 401 senza throttling dimostrano l’assenza di un controllo nella fixture; il 200 su un oggetto non posseduto dimostra il difetto di autorizzazione documentale.',
      en: 'Record method/path, status, and minimized fixture body. A 401 shows that /admin/ requires authentication, not that it is vulnerable; repeated 401 responses without throttling show the fixture lacks a control; a 200 for an unowned object demonstrates the documented authorization flaw.'
    },
    {
      it: 'Limita i tentativi con controlli distribuiti per account/sorgente, cooldown e logging; associa ogni richiesta a un controllo server-side di ownership e nega per default. Le regressioni verificano 429 oltre soglia e diniego dell’oggetto estraneo senza dipendere da UI o input del client.',
      en: 'Limit attempts with distributed per-account/source controls, cooldown, and logging; bind each request to a server-side ownership check and deny by default. Regression checks assert 429 beyond the threshold and denial of an unowned object without relying on UI or client input.'
    },
    {
      it: 'Sono fixture deterministiche: nessun payload, account/password, file, scansione o richiesta di rete reale è presente; nessuna risposta va trattata come prova di vulnerabilità esterna.',
      en: 'These are deterministic fixtures: no payload, account/password, file, scan, or real network request is present; no response should be treated as proof of an external vulnerability.'
    }
  ],
  selfCheck: [
    {
      it: 'So produrre evidenza HTTP e distinguere i codici di stato senza attribuire a un banner o a robots.txt più valore probatorio di quanto abbiano.',
      en: 'I can capture HTTP evidence and distinguish status codes without overstating what a banner or robots.txt proves.'
    },
    {
      it: 'So distinguere brute force online, controllo di frequenza, autenticazione e autorizzazione a livello oggetto.',
      en: 'I can distinguish online brute force, rate limiting, authentication, and object-level authorization.'
    },
    {
      it: 'So applicare remediation server-side e dimostrarla con test di regressione su unicamente fixture locali.',
      en: 'I can apply server-side remediation and demonstrate it with regression tests using local fixtures only.'
    }
  ]
};

const NAT_STATIC_DYNAMIC_LAB: GuidedLab = {
  id: 'gl-nat-static-dynamic',
  title: { it: 'Configura NAT statico e dinamico', en: 'Configure static and dynamic NAT' },
  difficulty: 'core',
  lab: 'services',
  scenario: {
    it: 'Una rete interna 10.10.10.0/24 deve pubblicare un server 10.10.10.50 e assegnare dinamicamente gli indirizzi 198.51.100.20–21 a due client. Il pool documentale non è raggiungibile da Internet.',
    en: 'Inside network 10.10.10.0/24 must publish server 10.10.10.50 and dynamically assign addresses 198.51.100.20–21 to two clients. The documentation-only pool is not reachable from the Internet.'
  },
  task: {
    it: 'Confronta una mappatura statica uno-a-uno, NAT dinamico da pool e PAT overload; individua la traduzione attesa e diagnostica tre condizioni di mancata traduzione.',
    en: 'Compare a static one-to-one mapping, dynamic pool NAT, and PAT overload; identify the expected translation and diagnose three no-translation conditions.'
  },
  steps: [
    {
      it: 'Nel laboratorio «Servizi IP», assegna inside/outside alle interfacce e seleziona NAT statico: 10.10.10.50 deve tradursi sempre nello stesso IP globale.',
      en: 'In “IP Services”, assign inside/outside to the interfaces and select static NAT: 10.10.10.50 must always map to the same global IP.'
    },
    {
      it: 'Seleziona NAT dinamico e traduci due client. Poi occupa entrambi gli indirizzi del pool e osserva il fallimento della terza allocazione.',
      en: 'Select dynamic NAT and translate two clients. Then allocate both pool addresses and observe the third allocation fail.'
    },
    {
      it: 'Disattiva la corrispondenza ACL e poi i ruoli delle interfacce: annota che entrambe impediscono la creazione della traduzione.',
      en: 'Disable the ACL match and then the interface roles: note that each prevents translation creation.'
    },
    {
      it: 'Controlla configurazione, tabella e contatori con show ip nat translations e show ip nat statistics; genera traffico prima di diagnosticare una tabella vuota.',
      en: 'Check configuration, table, and counters with show ip nat translations and show ip nat statistics; generate traffic before diagnosing an empty table.'
    }
  ],
  challenge: {
    it: 'Il pool è esaurito ma PAT funziona. Quale differenza di capacità spiega l’esito e perché il NAT statico può comunque esporre il server?',
    en: 'The pool is exhausted but PAT works. Which capacity difference explains this, and why can static NAT still expose the server?'
  },
  solution: [
    {
      it: 'La mappatura statica è persistente; il NAT dinamico consuma un indirizzo pubblico per ogni binding e fallisce quando tutti gli indirizzi del pool sono occupati. PAT con overload condivide l’indirizzo dell’interfaccia distinguendo i flussi con le porte.',
      en: 'A static mapping is persistent; dynamic NAT consumes one public address per binding and fails when the pool is fully allocated. Overload PAT shares the interface address and distinguishes flows by ports.'
    },
    {
      it: 'ACL non corrispondente e ruoli inside/outside errati impediscono la traduzione; verificare in quest’ordine riduce diagnosi casuali. Una mappatura statica rende raggiungibile l’indirizzo tradotto, quindi firewall/ACL devono autorizzare esplicitamente i servizi.',
      en: 'An ACL mismatch and incorrect inside/outside roles prevent translation; checking them in this order avoids guesswork. A static mapping makes the translated address reachable, so firewalls/ACLs must explicitly authorize services.'
    }
  ],
  selfCheck: [
    {
      it: 'So distinguere e configurare i tre modelli NAT e descrivere inside local/inside global.',
      en: 'I can distinguish and configure the three NAT models and describe inside local/inside global.'
    },
    {
      it: 'So verificare traduzioni e contatori e riconoscere pool esaurito, ACL non corrispondente e ruoli errati.',
      en: 'I can verify translations and counters and identify pool exhaustion, ACL mismatch, and incorrect interface roles.'
    }
  ]
};

const NAT_EXPOSURE_NOTE = {
  it: 'Il NAT traduce indirizzi per conservare IPv4 e connettere domini di indirizzamento; non è una policy di sicurezza. Le traduzioni stateful spesso non ammettono flussi entranti senza mapping, mentre NAT statico e port forwarding possono renderli raggiungibili: autorizzazione e ispezione spettano a firewall e ACL esplicite.',
  en: 'NAT translates addresses to conserve IPv4 and connect addressing domains; it is not a security policy. Stateful translations often have no mapping for unsolicited inbound flows, while static NAT and port forwarding can make services reachable: explicit firewalls and ACLs provide authorization and inspection.'
};

const IPV6_STATIC_ROUTE_LAB: GuidedLab = {
  id: 'gl-static-ipv6-routes',
  title: { it: 'Configura e verifica rotte statiche IPv6', en: 'Configure and verify IPv6 static routes' },
  difficulty: 'core',
  lab: 'routing',
  scenario: {
    it: 'R1 raggiunge 2001:db8:20::/48 tramite R2; R3 offre un percorso di riserva. Un host remoto 2001:db8:20::50 richiede anche una rotta /128, mentre il traffico sconosciuto usa una default route.',
    en: 'R1 reaches 2001:db8:20::/48 through R2; R3 provides a backup path. Remote host 2001:db8:20::50 also needs a /128 route, while unknown traffic uses a default route.'
  },
  task: {
    it: 'Configura rotte IPv6 di rete, host, default e floating; verifica la selezione della rotta e il failover quando il next-hop primario scompare.',
    en: 'Configure IPv6 network, host, default, and floating routes; verify route selection and failover when the primary next hop disappears.'
  },
  steps: [
    {
      it: 'Configura la rete con ipv6 route 2001:db8:20::/48 2001:db8:0:12::2 e l’host più specifico con ipv6 route 2001:db8:20::50/128 2001:db8:0:12::2. Aggiungi per ciascun prefisso una floating via 2001:db8:0:13::2 con AD 200. Ricorda: il longest-prefix match precede la distanza amministrativa.',
      en: 'Configure the network with ipv6 route 2001:db8:20::/48 2001:db8:0:12::2 and the more specific host with ipv6 route 2001:db8:20::50/128 2001:db8:0:12::2. Add a floating route through 2001:db8:0:13::2 with AD 200 for each prefix. Remember: longest-prefix match comes before administrative distance.'
    },
    {
      it: 'Aggiungi la floating route per lo stesso /48 e /128 via 2001:db8:0:13::2 con distanza 200; crea ::/0 sul primario e la relativa floating default sul backup.',
      en: 'Add floating routes for the same /48 and /128 via 2001:db8:0:13::2 with distance 200; create ::/0 through the primary and its floating default through the backup.'
    },
    {
      it: 'Per un next-hop link-local, specifica anche l’interfaccia di uscita, per esempio ipv6 route 2001:db8:30::/48 GigabitEthernet0/0 fe80::2: il link-local è ambiguo fuori dal proprio link.',
      en: 'For a link-local next hop, also specify the exit interface, for example ipv6 route 2001:db8:30::/48 GigabitEthernet0/0 fe80::2: a link-local address is ambiguous outside its link.'
    },
    {
      it: 'Controlla show ipv6 route e prova ping ipv6 verso un host /128, un indirizzo nel /48 e una destinazione coperta solo da ::/0. Disattiva il collegamento primario: le floating /128, /48 e default con AD 200 devono subentrare; ripristinalo e verifica il ritorno al primario.',
      en: 'Check show ipv6 route and use ping ipv6 to test a /128 host, an address in the /48, and a destination covered only by ::/0. Disable the primary link: the floating /128, /48, and default routes with AD 200 must take over; restore it and verify return to the primary.'
    }
  ],
  challenge: {
    it: 'Rimuovi per prova la floating /128 e lascia attiva quella /48. La reachability verso 2001:db8:20::50 fallisce quando cade R2: spiega perché e ripristina una configurazione ridondante coerente.',
    en: 'For a test, remove the floating /128 but keep the /48 backup. Reachability to 2001:db8:20::50 fails when R2 goes down: explain why and restore a consistent redundant configuration.'
  },
  solution: [
    {
      it: 'Il /128 è più specifico del /48 e vince per longest-prefix match indipendentemente dall’AD; il /48 di backup non può sostituirlo. Mantieni una floating /128 via R3 con AD 200 oppure rimuovi la /128 dedicata se non serve.',
      en: 'The /128 is more specific than the /48 and wins by longest-prefix match regardless of AD; the backup /48 cannot replace it. Keep a floating /128 through R3 with AD 200, or remove the dedicated /128 if it is not needed.'
    },
    {
      it: 'Una rotta statica può restare in tabella anche se il percorso oltre il next-hop è guasto: la reachability va provata end-to-end e il monitoraggio/tracking dipende dalle funzionalità della piattaforma.',
      en: 'A static route can remain in the table even when the path beyond its next hop has failed: reachability must be tested end to end, and monitoring/tracking depends on platform features.'
    }
  ],
  selfCheck: [
    {
      it: 'So distinguere route di rete /48, host /128 e default ::/0 e spiegare il longest-prefix match.',
      en: 'I can distinguish a /48 network, /128 host, and ::/0 default route and explain longest-prefix match.'
    },
    {
      it: 'So verificare next-hop globale e link-local, distanza amministrativa, tabella IPv6 e failover.',
      en: 'I can verify global and link-local next hops, administrative distance, the IPv6 table, and failover.'
    }
  ]
};

const BPDU_FILTER_LAB: GuidedLab = {
  id: 'gl-bpdu-filter-safety',
  title: { it: 'Valuta BPDU Filter senza creare loop', en: 'Assess BPDU Filter without creating loops' },
  difficulty: 'core',
  lab: 'layer2security',
  scenario: {
    it: 'Una porta edge PortFast verso un PC riceve una BPDU da uno switch collegato per errore. In un secondo caso, un collegamento ridondante tra due switch è stato configurato con il filtro BPDU per interfaccia.',
    en: 'A PortFast edge port toward a PC receives a BPDU from a switch connected by mistake. In a second case, a redundant link between two switches has interface-level BPDU filtering enabled.'
  },
  task: {
    it: 'Scegli il controllo coerente con il ruolo di ciascuna porta, distingui i due ambiti del filtro BPDU e ripristina la protezione STP verificando stato e reachability.',
    en: 'Choose the control that matches each port role, distinguish the two BPDU-filter scopes, and restore STP protection by verifying state and reachability.'
  },
  steps: [
    {
      it: 'Sulla porta edge usa PortFast solo se collegata a un singolo endpoint e preferisci BPDU Guard (`spanning-tree portfast bpduguard default` globalmente, oppure `spanning-tree bpduguard enable` sull’interfaccia). La ricezione di BPDU porta la porta in err-disable; identifica prima la causa.',
      en: 'On an edge port, use PortFast only when it connects to a single endpoint and prefer BPDU Guard (`spanning-tree portfast bpduguard default` globally, or `spanning-tree bpduguard enable` on the interface). Receiving a BPDU puts the port into err-disable; identify the cause first.'
    },
    {
      it: 'Confronta `spanning-tree portfast bpdufilter default` in configurazione globale: si applica alle porte PortFast operative e, quando arriva una BPDU, PortFast viene rimosso e il filtro disabilitato. Le porte possono inviare alcune BPDU al link-up; il dettaglio dipende dalla piattaforma.',
      en: 'Compare global configuration `spanning-tree portfast bpdufilter default`: it applies to operational PortFast ports and, when a BPDU arrives, PortFast is removed and filtering is disabled. Ports may send a few BPDUs at link-up; details depend on the platform.'
    },
    {
      it: 'Su una porta, `spanning-tree bpdufilter enable` sopprime continuamente BPDU in ingresso e in uscita anche senza PortFast. Non applicarlo a collegamenti switch-switch: equivale a togliere a STP la visibilità del link e può creare un loop.',
      en: 'On an interface, `spanning-tree bpdufilter enable` continuously suppresses inbound and outbound BPDUs even without PortFast. Do not apply it to switch-to-switch links: STP loses visibility of the link and a loop can result.'
    },
    {
      it: 'Per l’uplink ridondante rimuovi il filtro per interfaccia (`no spanning-tree bpdufilter enable`), conferma che entrambi i lati scambino BPDU, attendi la convergenza e controlla `show spanning-tree`, `show spanning-tree inconsistentports` e la reachability. Se BPDU Guard ha disabilitato la porta, riabilitala solo dopo aver eliminato la causa e secondo la policy operativa (`shutdown`/`no shutdown` o recovery configurato).',
      en: 'For the redundant uplink, remove interface-level filtering (`no spanning-tree bpdufilter enable`), confirm both ends exchange BPDUs, wait for convergence, and check `show spanning-tree`, `show spanning-tree inconsistentports`, and reachability. If BPDU Guard disabled the port, re-enable it only after removing the cause and according to operational policy (`shutdown`/`no shutdown` or configured recovery).'
    },
    {
      it: 'Abbina gli altri controlli: Root Guard blocca una BPDU superiore su una porta designated dove la root non deve apparire; Loop Guard mantiene il blocco se una porta root/alternate smette inaspettatamente di ricevere BPDU. Non sono filtri e Root Guard e Loop Guard non vanno configurati insieme sulla stessa interfaccia Cisco.',
      en: 'Match the other controls: Root Guard blocks a superior BPDU on a designated port where the root must not appear; Loop Guard keeps a port blocked if a root/alternate port unexpectedly stops receiving BPDUs. They are not filters, and Cisco Root Guard and Loop Guard must not be configured together on the same interface.'
    }
  ],
  challenge: {
    it: 'Un loop compare dopo l’attivazione di `spanning-tree bpdufilter enable` su un uplink. Descrivi il contenimento sicuro, la rimozione del filtro e le prove necessarie prima di riaprire la porta.',
    en: 'A loop appears after `spanning-tree bpdufilter enable` is applied to an uplink. Describe safe containment, filter removal, and the evidence required before reopening the port.'
  },
  solution: [
    {
      it: 'Contieni il loop isolando la porta coinvolta secondo il piano di rete; rimuovi il filtro su entrambi i lati e ripristina BPDU/STP. Non usare BPDU Guard sull’uplink legittimo: riceve BPDU per progetto. Se Root Guard è richiesto dal ruolo designated, verifica l’assenza di Loop Guard sulla stessa interfaccia.',
      en: 'Contain the loop by isolating the affected port under the network plan; remove filtering on both ends and restore BPDU/STP exchange. Do not use BPDU Guard on a legitimate uplink: it is expected to receive BPDUs. If Root Guard is needed on a designated port, ensure Loop Guard is not configured on that same interface.'
    },
    {
      it: 'Prima del ripristino verifica ruolo e stato STP, porte inconsistent/err-disabled, scambio BPDU, assenza di topology change anomali e reachability end-to-end. Correggi la causa prima di riabilitare; il recupero automatico da err-disable dipende dalla configurazione e non sostituisce la diagnosi.',
      en: 'Before restoring service, verify STP role and state, inconsistent/err-disabled ports, BPDU exchange, absence of abnormal topology changes, and end-to-end reachability. Fix the cause before re-enabling; automatic err-disable recovery depends on configuration and does not replace diagnosis.'
    }
  ],
  selfCheck: [
    {
      it: 'So distinguere filtro globale PortFast da filtro per-interfaccia e spiegare il rischio di loop del secondo.',
      en: 'I can distinguish global PortFast filtering from interface-level filtering and explain the latter’s loop risk.'
    },
    {
      it: 'So scegliere BPDU Guard, Root Guard o Loop Guard in base a ruolo e direzione della porta e verificare un recupero STP.',
      en: 'I can choose BPDU Guard, Root Guard, or Loop Guard by port role and direction, and verify STP recovery.'
    }
  ]
};

const NTP_CLIENT_SERVER_LAB: GuidedLab = {
  id: 'gl-ntp-client-server',
  title: { it: 'Configura e verifica client e server NTP', en: 'Configure and verify NTP clients and servers' },
  difficulty: 'core',
  lab: 'services',
  scenario: {
    it: 'Due sorgenti NTP di documentazione, 192.0.2.123 a stratum 2 e 192.0.2.124 a stratum 3, alimentano un router di distribuzione e i client downstream. Gli indirizzi RFC 5737 sono esempi e non sono instradabili pubblicamente.',
    en: 'Two documentation NTP sources, 192.0.2.123 at stratum 2 and 192.0.2.124 at stratum 3, feed a distribution router and downstream clients. RFC 5737 addresses are examples and are not publicly routable.'
  },
  task: {
    it: 'Configura più server, determina sorgente selezionata e stratum risultante, verifica lo stato dopo guasti e distingui un orologio locale annunciato da una sorgente UTC sincronizzata.',
    en: 'Configure multiple servers, determine the selected source and resulting stratum, verify status after failures, and distinguish an advertised local clock from a synchronized UTC source.'
  },
  steps: [
    {
      it: 'Sul client configura `ntp server 192.0.2.123 prefer` e `ntp server 192.0.2.124`. IOS può valutare più associazioni; `prefer` indica una preferenza, non rende la sorgente infallibile.',
      en: 'On the client configure `ntp server 192.0.2.123 prefer` and `ntp server 192.0.2.124`. IOS can evaluate multiple associations; `prefer` expresses a preference, not infallibility.'
    },
    {
      it: 'Nel laboratorio Servizi IP osserva il client sincronizzato con 192.0.2.123: una sorgente upstream a stratum 2 produce un client a stratum 3. Disattiva la primaria: la secondaria a stratum 3 produce stratum 4.',
      en: 'In the IP Services lab observe the client synchronized to 192.0.2.123: an upstream source at stratum 2 gives the client stratum 3. Disable the primary: the secondary at stratum 3 gives it stratum 4.'
    },
    {
      it: 'Disattiva entrambe le sorgenti. Il client deve mostrare stratum 16 e non sincronizzato. Controlla `show ntp associations` per le associazioni e `show ntp status` per lo stato e lo stratum dichiarato.',
      en: 'Disable both sources. The client should show stratum 16 and unsynchronized status. Check `show ntp associations` for associations and `show ntp status` for status and reported stratum.'
    },
    {
      it: 'Imposta il dispositivo come server: con upstream raggiungibile continua a sincronizzarsi e può servire downstream; senza upstream, la simulazione distingue il fallback `ntp master 8` dal tempo sincronizzato. Abilitalo solo se il disegno lo richiede: non garantisce UTC accurato.',
      en: 'Set the device role to server: with a reachable upstream it remains synchronized and can serve downstream clients; without upstream, the simulation distinguishes the `ntp master 8` fallback from synchronized time. Enable it only when the design calls for it: it does not guarantee accurate UTC.'
    },
    {
      it: 'Correla timestamp syslog provenienti da due apparati prima e dopo la perdita della sincronizzazione. Annota come deriva temporale, certificati e timeline SIEM dipendano da una sorgente attendibile; usa UDP 123 solo tra peer autorizzati e considera autenticazione/NTS in base al supporto della piattaforma.',
      en: 'Correlate syslog timestamps from two devices before and after synchronization is lost. Note how clock drift, certificates, and SIEM timelines depend on a trusted source; allow UDP 123 only between authorized peers and consider authentication/NTS according to platform support.'
    }
  ],
  challenge: {
    it: 'La sorgente preferita è raggiungibile ma passa da stratum 2 a stratum 15; la secondaria resta a stratum 3. Spiega perché il solo numero di stratum non garantisce qualità, verifica l’associazione selezionata e descrivi i controlli di integrità e indipendenza delle sorgenti.',
    en: 'The preferred source is reachable but moves from stratum 2 to stratum 15; the secondary remains at stratum 3. Explain why stratum alone does not guarantee quality, verify the selected association, and describe source integrity and independence checks.'
  },
  solution: [
    {
      it: 'Il dispositivo sceglie tra associazioni valide secondo algoritmo, qualità, reachability, configurazione e preferenze della piattaforma; un valore numerico minore da solo non prova che l’orologio sia corretto. Lo stratum 16 indica non sincronizzato. In questa simulazione deterministica la migliore sorgente raggiungibile con stratum valido è scelta per rendere osservabile il comportamento atteso.',
      en: 'The device selects among valid associations using the platform’s algorithm, quality, reachability, configuration, and preferences; a lower number alone does not prove that the clock is correct. Stratum 16 means unsynchronized. This deterministic simulator selects the best reachable source with a valid stratum to make the expected behavior observable.'
    },
    {
      it: 'Più sorgenti riducono il guasto singolo, ma devono essere indipendenti e protette da spoofing/manomissione. Le opzioni di autenticazione e NTS dipendono da software e appliance: verificare il supporto, non inventare sintassi o segreti. Un orologio locale annunciato va marcato come fallback, non come tempo UTC affidabile.',
      en: 'Multiple sources reduce single-source failure, but should be independent and protected from spoofing/tampering. Authentication and NTS options depend on software and appliances: verify support instead of inventing syntax or secrets. An advertised local clock must be marked as a fallback, not trusted UTC.'
    }
  ],
  selfCheck: [
    {
      it: 'So configurare più sorgenti, spiegare la selezione e calcolare lo stratum aggiungendo un salto.',
      en: 'I can configure multiple sources, explain selection, and calculate stratum by adding one hop.'
    },
    {
      it: 'So distinguere synchronized, unsynchronized (stratum 16) e local-master; verifico associazioni e stato con i comandi IOS.',
      en: 'I can distinguish synchronized, unsynchronized (stratum 16), and local-master; I verify associations and status with IOS commands.'
    },
    {
      it: 'So spiegare l’impatto di tempo errato su syslog, SIEM e certificati e non inserisco credenziali reali nel materiale.',
      en: 'I can explain the impact of incorrect time on syslog, SIEM, and certificates, and I do not put real credentials in learning material.'
    }
  ]
};

export const STUDY_MANUAL: readonly ManualChapter[] = BASE_MANUAL.map((chapter) => ({
  ...chapter,
  topics: chapter.topics.map((topic) => {
    if (topic.id === 'nat-pat') {
      return {
        ...topic,
        theory: topic.theory.map((paragraph, index) => (index === 2 ? NAT_EXPOSURE_NOTE : paragraph)),
        guidedLabs: [...(topic.guidedLabs ?? []), NAT_STATIC_DYNAMIC_LAB]
      };
    }
    if (topic.id === 'pentest-scanning-enumeration') {
      return {
        ...topic,
        theory: [
          ...topic.theory,
          {
            it: 'Un assessment difendibile collega ogni affermazione a una fonte, una data e un livello di confidenza. L’osservazione (per esempio una configurazione fixture che abilita TLS 1.0) resta distinta dall’ipotesi (per esempio una famiglia OS dedotta da banner e TTL). Un banner generico non prova release o stato patch: correlare con inventario/advisory autorizzati e validare prima di dichiarare una vulnerabilità. Dare priorità con esposizione, impatto e attendibilità aiuta il triage ma non sostituisce CVSS. Il workspace assessment usa solo fixture locali e non invia richieste di rete.',
            en: 'A defensible assessment links each claim to a source, date, and confidence level. An observation (for example, a fixture configuration enabling TLS 1.0) remains distinct from a hypothesis (for example, an OS family inferred from a banner and TTL). A generic banner does not prove a release or patch status: correlate with authorized inventory/advisories and validate before claiming a vulnerability. Ranking by exposure, impact, and confidence supports triage but does not replace CVSS. The assessment workspace uses local fixtures only and sends no network requests.'
          }
        ],
        guidedLabs: [...(topic.guidedLabs ?? []), ASSESSMENT_EVIDENCE_LAB]
      };
    }
    if (topic.id === 'web-auth-session-access') {
      return {
        ...topic,
        objectives: [
          ...topic.objectives,
          {
            it: 'Verificare in fixture la separazione tra autenticazione e autorizzazione a livello oggetto, applicare una correzione server-side e provarla con regressioni.',
            en: 'Verify the separation between authentication and object-level authorization in a fixture, apply a server-side fix, and prove it with regression checks.'
          }
        ],
        theory: [
          ...topic.theory,
          {
            it: 'Un IDOR/BOLA si verifica quando il server usa un identificatore controllato dal client senza verificare che l’utente autenticato possa accedere proprio a quell’oggetto. UUID opachi, controlli UI e autenticazione generica non sostituiscono l’autorizzazione server-side per ogni richiesta; negare per default e limitare i dati restituiti. Una regressione utile prova un utente legittimo e uno estraneo sullo stesso endpoint, verificando il diniego previsto dalla policy.',
            en: 'IDOR/BOLA occurs when a server uses a client-controlled identifier without checking that the authenticated user may access that specific object. Opaque UUIDs, UI checks, and generic authentication do not replace server-side authorization on every request; deny by default and minimize returned data. A useful regression tests both an authorized and an unrelated user against the same endpoint and verifies the policy’s expected denial.'
          }
        ],
        guidedLabs: [...(topic.guidedLabs ?? []), WEB_APPLICATION_PENTEST_LAB]
      };
    }
    if (topic.id === 'exploitation-frameworks-metasploit') {
      return {
        ...topic,
        objectives: [...topic.objectives, EXPLOIT_MANUAL_UPDATE.objectives],
        theory: topic.theory.map((paragraph, index) =>
          index === 1 ? EXPLOIT_MANUAL_UPDATE.theory[0] : index === 3 ? EXPLOIT_MANUAL_UPDATE.theory[1] : paragraph
        ),
        example: EXPLOIT_MANUAL_UPDATE.example,
        commonMistakes: topic.commonMistakes.map((mistake, index) =>
          index === 2 ? EXPLOIT_MANUAL_UPDATE.commonMistake : mistake
        ),
        guidedLabs: [...(topic.guidedLabs ?? []), EXPLOIT_WORKBENCH_LAB]
      };
    }
    if (topic.id === 'lateral-movement-pivoting') {
      return {
        ...topic,
        objectives: [
          ...topic.objectives,
          {
            it: 'Dimostrare in fixture offline il pivoting con route host e con port forwarding, rispettando scope e durata e verificando il teardown.',
            en: 'Demonstrate pivoting in an offline fixture with a host route and with port forwarding, respecting scope and duration and verifying teardown.'
          }
        ],
        theory: [
          ...topic.theory,
          {
            it: 'Una route host /32 sul sistema di test sceglie il pivot come next hop per raggiungere un host; il traffico dipende ancora dall’IP forwarding sul pivot e dalle ACL/firewall. Non è una regola di autorizzazione e può instradare più porte del singolo servizio ammesso: lo scope va applicato separatamente. Il port forwarding crea invece una mappatura da una singola porta locale a una precisa destinazione/porta, senza installare una route per l’intera subnet. Limitare host, porta e lease, registrare entrambi i lati del flusso e rimuovere la configurazione a fine prova.',
            en: 'A /32 host route on the test system selects the pivot as next hop to reach one host; traffic still depends on IP forwarding on the pivot and ACL/firewall policy. It is not an authorization rule and can route more ports than the single permitted service: scope must be enforced separately. Port forwarding instead maps one local port to a precise destination/port without installing a route for the whole subnet. Limit host, port, and lease, log both sides of the flow, and remove the configuration when testing ends.'
          }
        ],
        commonMistakes: [
          ...topic.commonMistakes,
          {
            it: 'Confondere una route con un permesso firewall o con l’inoltro di una singola porta: routing, IP forwarding, mapping e policy sono decisioni distinte.',
            en: 'Confusing a route with firewall permission or single-port forwarding: routing, IP forwarding, mapping, and policy are separate decisions.'
          }
        ],
        guidedLabs: [...(topic.guidedLabs ?? []), PIVOTING_LAB]
      };
    }
    if (topic.id === 'pentest-password-attacks') {
      return {
        ...topic,
        objectives: [
          ...topic.objectives,
          {
            it: 'Valutare rate limit, lockout e detection cross-account in una simulazione limitata, senza verificare credenziali reali.',
            en: 'Evaluate rate limiting, lockout, and cross-account detection in a bounded simulation without checking real credentials.'
          }
        ],
        guidedLabs: [...(topic.guidedLabs ?? []), ONLINE_PASSWORD_LAB]
      };
    }
    if (topic.id === 'offline-hash-cracking-defense') {
      return {
        ...topic,
        objectives: [
          ...topic.objectives,
          {
            it: 'Confrontare costo per candidato e budget di fixture sintetiche, distinguendo sale per-record da fattore di lavoro della KDF.',
            en: 'Compare per-candidate cost and synthetic fixture budgets, distinguishing per-record salts from a KDF work factor.'
          }
        ],
        guidedLabs: [...(topic.guidedLabs ?? []), OFFLINE_HASH_COST_LAB]
      };
    }
    if (topic.id === 'host-network-auditing') {
      return {
        ...topic,
        objectives: [
          ...topic.objectives,
          {
            it: 'Raccogliere fixture autorizzate, minimizzare dati account e credenziali, verificare l’integrità e documentare il trasferimento e la cancellazione.',
            en: 'Collect authorized fixtures, minimize account and credential data, verify integrity, and document transfer and cleanup.'
          }
        ],
        guidedLabs: [...(topic.guidedLabs ?? []), HOST_AUDIT_EVIDENCE_LAB]
      };
    }
    if (topic.id === 'static-default-routes') {
      return {
        ...topic,
        objectives: [
          ...topic.objectives,
          {
            it: 'Configurare e verificare rotte statiche IPv6 di rete, host, default e floating, inclusi next-hop globali e link-local.',
            en: 'Configure and verify IPv6 network, host, default, and floating static routes, including global and link-local next hops.'
          }
        ],
        theory: [
          ...topic.theory,
          {
            it: 'In IPv6 le forme principali sono rotta di rete (per esempio 2001:db8:20::/48), host (/128) e default (::/0). L’AD predefinita di una statica è 1; una floating usa un valore maggiore per lo stesso prefisso. Il longest-prefix match viene prima dell’AD: una /128 resta preferita a una /48 anche se quest’ultima ha AD inferiore.',
            en: 'IPv6 static routes commonly target a network (for example 2001:db8:20::/48), a host (/128), or the default (::/0). A static route has a default AD of 1; a floating route uses a higher value for the same prefix. Longest-prefix match comes before AD: a /128 remains preferred over a /48 even when the latter has a lower AD.'
          },
          {
            it: 'Un next-hop globale identifica il router senza ambiguità. Un next-hop link-local fe80:: è valido solo sul link locale: sulle interfacce Ethernet specifica anche l’interfaccia di uscita, altrimenti il router non può determinare su quale link risolverlo.',
            en: 'A global next hop identifies the router unambiguously. A fe80:: link-local next hop is valid only on its local link: on Ethernet interfaces, also specify the exit interface, or the router cannot determine which link to use for resolution.'
          },
          {
            it: 'show ipv6 route mostra le rotte installate, non prova da solo il percorso end-to-end. Verifica con ping ipv6 e ripeti il test dopo la caduta del link primario; una statica può non rilevare un guasto oltre il next-hop senza tracking/supporto aggiuntivo.',
            en: 'show ipv6 route displays installed routes but does not by itself prove end-to-end reachability. Verify with ping ipv6 and repeat after the primary link fails; a static route may not detect a failure beyond its next hop without additional tracking/support.'
          }
        ],
        example: {
          it: 'ipv6 route 2001:db8:20::/48 2001:db8:0:12::2 installa il percorso primario; lo stesso prefisso via 2001:db8:0:13::2 200 crea il backup. Per un link-local Ethernet: ipv6 route 2001:db8:30::/48 GigabitEthernet0/0 fe80::2. La default è ipv6 route ::/0 <next-hop>.',
          en: 'ipv6 route 2001:db8:20::/48 2001:db8:0:12::2 installs the primary path; the same prefix via 2001:db8:0:13::2 200 creates the backup. For an Ethernet link-local next hop: ipv6 route 2001:db8:30::/48 GigabitEthernet0/0 fe80::2. The default is ipv6 route ::/0 <next-hop>.'
        },
        references: [
          ...(topic.references ?? []),
          { kind: 'rfc', id: 'RFC 4291' },
          { kind: 'rfc', id: 'RFC 4861' },
          { kind: 'cisco', id: 'IOS XE IPv6 static route configuration and verification' }
        ],
        commonMistakes: [
          ...topic.commonMistakes,
          {
            it: 'Dimenticare l’interfaccia di uscita con un next-hop link-local o assegnare alla floating un prefisso diverso: nel primo caso il next-hop è ambiguo, nel secondo non è un backup della rotta attesa.',
            en: 'Omitting the exit interface for a link-local next hop, or assigning the floating route a different prefix: the first makes the next hop ambiguous; the second does not back up the intended route.'
          },
          {
            it: 'Usare solo show ipv6 route come prova di reachability oppure presumere che una /48 di backup sostituisca una /128 primaria: la specificità prevale sull’AD.',
            en: 'Using only show ipv6 route as proof of reachability, or assuming a backup /48 replaces a primary /128: prefix specificity takes precedence over AD.'
          }
        ],
        guidedLabs: [...(topic.guidedLabs ?? []), IPV6_STATIC_ROUTE_LAB]
      };
    }
    if (topic.id === 'ip-services-ntp') {
      return {
        ...topic,
        objectives: [
          ...topic.objectives,
          {
            it: 'Configurare e verificare client e server NTP con più sorgenti, monitorare sincronizzazione e stratum e correlare i timestamp di gestione.',
            en: 'Configure and verify NTP clients and servers with multiple sources, monitor synchronization and stratum, and correlate management timestamps.'
          }
        ],
        theory: [
          ...topic.theory,
          {
            it: 'In IOS XE `ntp server <indirizzo> [prefer]` configura un’associazione client a una sorgente; più associazioni forniscono ridondanza. `show ntp associations` aiuta a leggere peer, reachability e peer di sistema; `show ntp status` riassume sincronizzazione, sorgente e stratum. La selezione reale considera qualità e algoritmo della piattaforma: lo stratum da solo non è una misura di accuratezza.',
            en: 'In IOS XE, `ntp server <address> [prefer]` configures a client association to a source; multiple associations provide redundancy. `show ntp associations` helps inspect peers, reachability, and the system peer; `show ntp status` summarizes synchronization, source, and stratum. Actual selection considers platform quality metrics and algorithms: stratum alone is not an accuracy measurement.'
          },
          {
            it: 'Un dispositivo sincronizzato può servire client NTP downstream. `ntp master <stratum>` annuncia invece l’orologio locale quando abilitato: senza un riferimento esterno non dimostra UTC accurato e va usato solo come fallback progettato consapevolmente. La disponibilità di autenticazione e NTS dipende da piattaforma e release; non pubblicare chiavi o credenziali reali.',
            en: 'A synchronized device can serve downstream NTP clients. `ntp master <stratum>` instead advertises the local clock when enabled: without an external reference it does not prove accurate UTC and should only be used as a deliberately designed fallback. Authentication and NTS availability depends on platform and release; never publish real keys or credentials.'
          }
        ],
        example: {
          it: 'Configura `ntp server 192.0.2.123 prefer` e `ntp server 192.0.2.124`, quindi verifica con `show ntp associations` e `show ntp status`. Gli indirizzi RFC 5737 sono riservati alla documentazione; in esercizio usa sorgenti autorizzate e raggiungibili.',
          en: 'Configure `ntp server 192.0.2.123 prefer` and `ntp server 192.0.2.124`, then verify with `show ntp associations` and `show ntp status`. RFC 5737 addresses are reserved for documentation; use authorized and reachable sources in operation.'
        },
        commonMistakes: [
          ...topic.commonMistakes,
          {
            it: 'Considerare `ntp master` equivalente alla sincronizzazione esterna o interpretare stratum basso come prova di precisione: sono proprietà distinte.',
            en: 'Treating `ntp master` as equivalent to external synchronization or treating a low stratum as proof of precision: these are different properties.'
          },
          {
            it: 'Controllare solo `show ntp associations` oppure solo `show ntp status`: peer configurati, reachability e stato finale sono verifiche complementari.',
            en: 'Checking only `show ntp associations` or only `show ntp status`: configured peers, reachability, and final state are complementary checks.'
          }
        ],
        references: [
          ...(topic.references ?? []),
          { kind: 'cisco', id: 'Cisco IOS XE NTP configuration and verification commands' }
        ],
        guidedLabs: [...(topic.guidedLabs ?? []), NTP_CLIENT_SERVER_LAB]
      };
    }
    if (topic.id === 'l2-topology-containment') {
      return {
        ...topic,
        objectives: [
          ...topic.objectives,
          {
            it: 'Confrontare BPDU Filter globale e per-interfaccia, scegliere protezioni STP per ruolo e verificare il recupero senza loop.',
            en: 'Compare global and interface-level BPDU filtering, choose STP protections by role, and verify recovery without loops.'
          }
        ],
        theory: [
          ...topic.theory,
          {
            it: 'BPDU Filter non è una guardia: sopprime frame di controllo STP. Il comando globale `spanning-tree portfast bpdufilter default` riguarda le porte PortFast operative; se riceve una BPDU, Cisco rimuove PortFast e disabilita il filtro su quella porta, consentendo a STP di elaborare la topologia. Il comando d’interfaccia `spanning-tree bpdufilter enable` sopprime invece in modo continuo BPDU inviate e ricevute, anche senza PortFast: su un link ridondante tra switch può nascondere il loop a STP. Il comportamento preciso e i nomi dei comandi vanno verificati per modello e release.',
            en: 'BPDU Filter is not a guard: it suppresses STP control frames. The global `spanning-tree portfast bpdufilter default` command applies to operational PortFast ports; if one receives a BPDU, Cisco removes PortFast and disables filtering on that port so STP can process the topology. Interface-level `spanning-tree bpdufilter enable` instead continuously suppresses sent and received BPDUs, even without PortFast; on a redundant switch link it can hide a loop from STP. Exact behavior and command names must be checked for the model and release.'
          },
          {
            it: 'Sulle porte edge, PortFast accelera l’accesso e BPDU Guard mette in err-disable una porta che riceve BPDU; il filtro globale ha una risposta diversa e non è una sostituzione equivalente. Root Guard protegge una designated da BPDU superiori (stato root-inconsistent); Loop Guard impedisce a root/alternate di diventare designated quando un guasto unidirezionale interrompe le BPDU. Cisco non consente Root Guard e Loop Guard insieme sulla stessa interfaccia.',
            en: 'On edge ports, PortFast speeds access and BPDU Guard puts a port into err-disable when it receives a BPDU; global filtering behaves differently and is not an equivalent replacement. Root Guard protects a designated port from superior BPDUs (root-inconsistent state); Loop Guard prevents a root/alternate port from becoming designated when a unidirectional failure interrupts BPDUs. Cisco does not allow Root Guard and Loop Guard together on the same interface.'
          }
        ],
        example: {
          it: 'Baseline edge: `spanning-tree portfast default` e `spanning-tree portfast bpduguard default`; alternativa per porta: `interface Gi1/0/1` → `spanning-tree portfast` → `spanning-tree bpduguard enable`. Il filtro globale si configura con `spanning-tree portfast bpdufilter default`; `spanning-tree bpdufilter enable` in modalità interface è continuo e rischioso sui link tra switch.',
          en: 'Edge baseline: `spanning-tree portfast default` and `spanning-tree portfast bpduguard default`; per-port alternative: `interface Gi1/0/1` → `spanning-tree portfast` → `spanning-tree bpduguard enable`. Global filtering uses `spanning-tree portfast bpdufilter default`; interface-mode `spanning-tree bpdufilter enable` is continuous and risky on switch links.'
        },
        commonMistakes: [
          ...topic.commonMistakes,
          {
            it: 'Usare `spanning-tree bpdufilter enable` su un uplink ridondante o trattare il filtro come una protezione: BPDUs soppresse possono impedire a STP di bloccare un percorso duplicato.',
            en: 'Using `spanning-tree bpdufilter enable` on a redundant uplink or treating filtering as a protection: suppressed BPDUs can prevent STP from blocking a duplicate path.'
          },
          {
            it: 'Confondere la risposta del filtro globale (BPDU ricevuta: PortFast/filtro disabilitati) con BPDU Guard (porta in err-disable), oppure riattivare una porta senza aver diagnosticato la causa.',
            en: 'Confusing the global-filter response (received BPDU: PortFast/filter disabled) with BPDU Guard (port enters err-disable), or re-enabling a port before diagnosing the cause.'
          }
        ],
        references: [
          ...(topic.references ?? []),
          {
            kind: 'cisco',
            id: 'Catalyst 9300 IOS XE 17.1 - Configuring Optional Spanning-Tree Features'
          }
        ],
        guidedLabs: [...(topic.guidedLabs ?? []), BPDU_FILTER_LAB]
      };
    }
    return topic;
  })
}));

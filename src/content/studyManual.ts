/**
 * @license
 * SPDX-License-Identifier: GPL-3.0-only
 */

import type { AppView } from '../store';
import type { Bilingual } from '../types';
import type { SecurityReference } from './securityReferences';

/**
 * EDU track — the study manual: a readable, bilingual handbook of the topics to
 * study, aligned to the CCNA 200-301 and CompTIA Security+ SY0-701 blueprints.
 *
 * Unlike the interactive labs (free exploration) and the CCNA map (an index), each
 * chapter here teaches: objectives, prerequisites, a progressive explanation, a
 * worked example, the mistakes learners actually make, and one or more *guided
 * labs* — exercises with a concrete task that send the student into an existing
 * interactive lab and then reveal a commented solution and self-check criteria.
 *
 * The data is plain typed content (no new dependency); relations that TypeScript
 * cannot check (the `lab` a topic or guided lab opens) are validated at runtime in
 * `content.test.ts`, like the rest of the content graph.
 */

export type ManualDifficulty = 'intro' | 'core' | 'advanced';
export type ManualCert = 'ccna' | 'securityplus' | 'both';

/** A guided lab exercise: a task that opens an interactive lab, with a worked solution. */
export interface GuidedLab {
  id: string;
  title: Bilingual;
  difficulty: ManualDifficulty;
  /** The interactive view this exercise is carried out in. */
  lab: AppView;
  /** The situation the exercise is set in. */
  scenario: Bilingual;
  /** What the student must produce or determine. */
  task: Bilingual;
  /** Ordered guided steps toward the task. */
  steps: Bilingual[];
  /** A harder variant to attempt without the steps. */
  challenge: Bilingual;
  /** Commented solution, revealed on demand (ordered paragraphs/steps). */
  solution: Bilingual[];
  /** How the student checks their own result. */
  selfCheck: Bilingual[];
}

export interface ManualTopic {
  id: string;
  title: Bilingual;
  /** What the student will be able to do (Bloom-oriented, observable). */
  objectives: Bilingual[];
  prerequisites: Bilingual[];
  /** Progressive explanation, one paragraph per entry. */
  theory: Bilingual[];
  example?: Bilingual;
  /** Misconceptions and exam traps to avoid. */
  commonMistakes: Bilingual[];
  /** The interactive lab that lets the student study this topic hands-on. */
  lab?: AppView;
  references?: SecurityReference[];
  guidedLabs?: GuidedLab[];
}

export interface ManualChapter {
  id: string;
  cert: ManualCert;
  /** Position in the study order. */
  order: number;
  title: Bilingual;
  summary: Bilingual;
  topics: ManualTopic[];
}

export const STUDY_MANUAL: readonly ManualChapter[] = [
  {
    id: 'osi-model',
    cert: 'both',
    order: 1,
    title: { it: 'Il modello OSI e l’incapsulamento', en: 'The OSI model and encapsulation' },
    summary: {
      it: 'Il linguaggio comune con cui descriviamo le reti: sette livelli, la funzione di ciascuno e come i dati vengono imbustati e sbustati mentre attraversano lo stack.',
      en: 'The shared language we use to describe networks: seven layers, what each one does, and how data is wrapped and unwrapped as it moves through the stack.'
    },
    topics: [
      {
        id: 'osi-why-layers',
        title: { it: 'Perché i livelli: a cosa serve il modello OSI', en: 'Why layers: what the OSI model is for' },
        objectives: [
          { it: 'Spiegare perché una rete viene descritta a livelli e quale problema risolve la stratificazione.', en: 'Explain why a network is described in layers and what problem layering solves.' },
          { it: 'Elencare i sette livelli OSI nell’ordine corretto, dal basso verso l’alto.', en: 'List the seven OSI layers in the correct order, from the bottom up.' }
        ],
        prerequisites: [
          { it: 'Sapere, a grandi linee, che cos’è una rete e che due dispositivi si scambiano messaggi.', en: 'A rough idea of what a network is and that two devices exchange messages.' }
        ],
        theory: [
          { it: 'Il modello OSI (Open Systems Interconnection, standard ISO/IEC 7498-1) è un modello di riferimento: non è il software che gira davvero, ma una mappa condivisa che divide la comunicazione di rete in sette livelli. Ogni livello ha un compito preciso e offre un servizio al livello superiore, nascondendogli i dettagli di come quel servizio viene realizzato.', en: 'The OSI model (Open Systems Interconnection, ISO/IEC 7498-1) is a reference model: it is not the software that actually runs, but a shared map that splits network communication into seven layers. Each layer has one job and offers a service to the layer above it, hiding the details of how that service is delivered.' },
          { it: 'La stratificazione serve a dominare la complessità. Un problema enorme — “far arrivare questo messaggio a quel computer dall’altra parte del mondo” — viene spezzato in problemi piccoli e indipendenti: come rappresentare i bit sul cavo, come consegnare un frame nella rete locale, come instradare tra reti diverse, come garantire che nulla vada perso. Si può cambiare la tecnologia di un livello (dal rame alla fibra, dall’Ethernet al Wi-Fi) senza riscrivere gli altri.', en: 'Layering exists to tame complexity. One huge problem — “get this message to that computer on the other side of the world” — is broken into small, independent ones: how to represent bits on the wire, how to deliver a frame on the local network, how to route between different networks, how to make sure nothing is lost. You can change one layer’s technology (copper to fibre, Ethernet to Wi-Fi) without rewriting the others.' },
          { it: 'Dal basso verso l’alto i sette livelli sono: 1 Fisico, 2 Collegamento dati (Data Link), 3 Rete, 4 Trasporto, 5 Sessione, 6 Presentazione, 7 Applicazione. Un mnemonico diffuso in inglese è “Please Do Not Throw Sausage Pizza Away”. I livelli 1–4 sono quelli su cui un tecnico di rete lavora ogni giorno; i livelli 5–7 descrivono funzioni che oggi vivono soprattutto dentro le applicazioni.', en: 'From the bottom up the seven layers are: 1 Physical, 2 Data Link, 3 Network, 4 Transport, 5 Session, 6 Presentation, 7 Application. A common mnemonic is “Please Do Not Throw Sausage Pizza Away”. Layers 1–4 are the ones a network technician works with every day; layers 5–7 describe functions that today live mostly inside applications.' }
        ],
        example: {
          it: 'Quando apri un sito, il browser (L7) produce una richiesta; questa viene affidata al trasporto (L4) che la numera e la rende affidabile con TCP, al livello rete (L3) che le dà un indirizzo IP di destinazione, al collegamento dati (L2) che la consegna al primo apparato, e al livello fisico (L1) che la trasmette come segnale. Nessuno di questi livelli ha bisogno di sapere come lavorano gli altri.', en: 'When you open a website, the browser (L7) produces a request; it is handed to transport (L4) which numbers it and makes it reliable with TCP, to the network layer (L3) which gives it a destination IP address, to data link (L2) which delivers it to the first device, and to the physical layer (L1) which transmits it as a signal. None of these layers needs to know how the others work.' }
        ,
        commonMistakes: [
          { it: 'Confondere il modello OSI con ciò che gira davvero: Internet usa lo stack TCP/IP; OSI è la mappa concettuale con cui lo descriviamo e lo confrontiamo.', en: 'Confusing the OSI model with what actually runs: the Internet uses the TCP/IP stack; OSI is the conceptual map we use to describe and compare it.' },
          { it: 'Invertire l’ordine o la numerazione dei livelli. Il livello 1 è il Fisico (in basso), il livello 7 è l’Applicazione (in alto): i dati “scendono” nel mittente e “salgono” nel destinatario.', en: 'Flipping the order or numbering of the layers. Layer 1 is Physical (bottom), layer 7 is Application (top): data goes “down” the sender and “up” the receiver.' }
        ],
        lab: 'osi',
        references: [{ kind: 'rfc', id: 'RFC 1122' }]
      },
      {
        id: 'osi-seven-layers',
        title: { it: 'I sette livelli e le loro funzioni', en: 'The seven layers and what they do' },
        objectives: [
          { it: 'Associare a ciascun livello la sua funzione principale e un esempio di protocollo o tecnologia.', en: 'Match each layer to its main function and an example protocol or technology.' },
          { it: 'Riconoscere a quale livello opera un dispositivo di rete (hub, switch, router).', en: 'Recognise which layer a network device operates at (hub, switch, router).' }
        ],
        prerequisites: [
          { it: 'Conoscere l’ordine e la numerazione dei sette livelli.', en: 'Know the order and numbering of the seven layers.' }
        ],
        theory: [
          { it: 'Livello 1 — Fisico: trasmette i bit come segnali (elettrici, ottici, radio) sul mezzo. Qui vivono cavi, connettori, pin, codifiche di linea e l’hub, che ripete semplicemente il segnale su tutte le porte.', en: 'Layer 1 — Physical: transmits bits as signals (electrical, optical, radio) over the medium. Cables, connectors, pinouts, line coding and the hub — which simply repeats the signal out of every port — live here.' },
          { it: 'Livello 2 — Collegamento dati: consegna i frame all’interno di una stessa rete locale usando indirizzi MAC, rileva gli errori con l’FCS e governa l’accesso al mezzo. È il livello dello switch, che impara i MAC e inoltra solo sulla porta giusta, delle VLAN e dello Spanning Tree.', en: 'Layer 2 — Data Link: delivers frames within a single local network using MAC addresses, detects errors with the FCS, and governs access to the medium. It is the layer of the switch — which learns MACs and forwards only out of the right port — of VLANs, and of Spanning Tree.' },
          { it: 'Livello 3 — Rete: instrada i pacchetti tra reti diverse usando indirizzi logici (IP) e decide il percorso migliore. È il livello del router, del longest-prefix match e dei protocolli di routing come OSPF.', en: 'Layer 3 — Network: routes packets between different networks using logical (IP) addresses and chooses the best path. It is the layer of the router, of longest-prefix match, and of routing protocols such as OSPF.' },
          { it: 'Livello 4 — Trasporto: gestisce la comunicazione fra processi tramite le porte. TCP offre una consegna affidabile e ordinata con handshake e controllo di flusso; UDP è leggero e senza connessione. È qui che vivono i numeri di porta (es. 443, 53).', en: 'Layer 4 — Transport: handles process-to-process communication through ports. TCP provides reliable, ordered delivery with a handshake and flow control; UDP is lightweight and connectionless. This is where port numbers (e.g. 443, 53) live.' },
          { it: 'Livelli 5–7 — Sessione, Presentazione, Applicazione: aprono e mantengono i dialoghi (sessione), traducono e cifrano/comprimono i dati — la crittografia TLS è associata logicamente alla presentazione — (presentazione) ed espongono i servizi all’utente come HTTP, DNS o SMTP (applicazione). Nello stack reale queste tre funzioni sono spesso svolte insieme dall’applicazione.', en: 'Layers 5–7 — Session, Presentation, Application: open and maintain dialogues (session), translate and encrypt/compress data — TLS encryption is logically associated with presentation — (presentation), and expose services to the user such as HTTP, DNS or SMTP (application). In the real stack these three functions are often handled together by the application.' }
        ],
        example: {
          it: 'Uno switch legge l’indirizzo MAC di destinazione (L2) e inoltra il frame sulla porta giusta; un router guarda l’indirizzo IP di destinazione (L3) e sceglie il prossimo salto. Lo stesso pacchetto, salendo e scendendo la rete, viene letto a livelli diversi da dispositivi diversi.', en: 'A switch reads the destination MAC address (L2) and forwards the frame out of the right port; a router looks at the destination IP address (L3) and chooses the next hop. The same packet, moving up and down the network, is read at different layers by different devices.' }
        ,
        commonMistakes: [
          { it: 'Pensare che lo switch lavori con gli indirizzi IP: lo switch tradizionale è un dispositivo di livello 2 e ragiona sui MAC. È il router a lavorare con gli IP a livello 3.', en: 'Thinking a switch works with IP addresses: a traditional switch is a layer-2 device and reasons about MACs. It is the router that works with IPs at layer 3.' },
          { it: 'Collocare TLS/HTTPS a un solo livello: la cifratura appartiene concettualmente alla presentazione (L6), ma TCP sotto di essa è L4 — per questo spesso si dice “HTTPS sta sopra TCP 443”.', en: 'Placing TLS/HTTPS at a single layer: encryption conceptually belongs to presentation (L6), but the TCP beneath it is L4 — which is why people say “HTTPS runs over TCP 443”.' }
        ],
        lab: 'ports',
        guidedLabs: [
          {
            id: 'gl-osi-device-layer',
            title: { it: 'A quale livello lavora questo dispositivo?', en: 'Which layer does this device work at?' },
            difficulty: 'intro',
            lab: 'ports',
            scenario: {
              it: 'Nel laboratorio “Porte & Protocolli” c’è anche un catalogo di dispositivi di rete (hub, switch, router, firewall…), ciascuno con il livello OSI a cui opera.',
              en: 'The “Ports & Protocols” lab also includes a catalogue of network devices (hub, switch, router, firewall…), each with the OSI layer it operates at.'
            },
            task: {
              it: 'Per hub, switch e router, determina a quale livello OSI opera ciascuno e perché, poi verifica nel catalogo.',
              en: 'For a hub, a switch and a router, determine which OSI layer each operates at and why, then check it against the catalogue.'
            },
            steps: [
              { it: 'Apri il laboratorio “Porte & Protocolli” e vai alla sezione dei dispositivi.', en: 'Open the “Ports & Protocols” lab and go to the devices section.' },
              { it: 'Per ogni dispositivo chiediti: su quale informazione prende le decisioni? Segnale grezzo, indirizzo MAC o indirizzo IP?', en: 'For each device ask: what information does it make decisions on? Raw signal, MAC address, or IP address?' },
              { it: 'Associa quell’informazione al livello: segnale → L1, MAC → L2, IP → L3.', en: 'Map that information to a layer: signal → L1, MAC → L2, IP → L3.' }
            ],
            challenge: {
              it: 'Aggiungi al ragionamento un firewall stateful e un access point wireless: a quali livelli operano e perché possono coprirne più di uno?',
              en: 'Extend the reasoning to a stateful firewall and a wireless access point: which layers do they operate at, and why can each span more than one?'
            },
            solution: [
              { it: 'Hub → Livello 1 (Fisico): ripete il segnale elettrico su tutte le porte, senza leggere alcun indirizzo.', en: 'Hub → Layer 1 (Physical): repeats the electrical signal out of every port, without reading any address.' },
              { it: 'Switch → Livello 2 (Collegamento dati): inoltra i frame in base all’indirizzo MAC di destinazione, che impara popolando la tabella CAM.', en: 'Switch → Layer 2 (Data Link): forwards frames based on the destination MAC address, which it learns by populating the CAM table.' },
              { it: 'Router → Livello 3 (Rete): instrada i pacchetti tra reti diverse in base all’indirizzo IP di destinazione e alla tabella di routing.', en: 'Router → Layer 3 (Network): routes packets between different networks based on the destination IP address and the routing table.' },
              { it: 'Sfida: un firewall stateful ispeziona fino a L4 (e, se applicativo, fino a L7); un access point unisce L1 (radio) e L2 (frame 802.11), per questo si dice che “coprono” più livelli.', en: 'Challenge: a stateful firewall inspects up to L4 (and, if application-aware, up to L7); an access point combines L1 (radio) and L2 (802.11 frames), which is why they are said to “span” multiple layers.' }
            ],
            selfCheck: [
              { it: 'So giustificare ogni risposta citando l’informazione su cui il dispositivo decide, non solo il nome del livello.', en: 'I can justify each answer by citing the information the device decides on, not just the layer name.' },
              { it: 'La mia classificazione coincide con quella mostrata nel catalogo dei dispositivi.', en: 'My classification matches the one shown in the device catalogue.' }
            ]
          }
        ]
      },
      {
        id: 'osi-encapsulation',
        title: { it: 'Incapsulamento e decapsulamento', en: 'Encapsulation and decapsulation' },
        objectives: [
          { it: 'Descrivere come i dati vengono imbustati scendendo lo stack e sbustati salendo.', en: 'Describe how data is wrapped going down the stack and unwrapped going up.' },
          { it: 'Nominare la PDU corretta a ciascun livello (dati, segmento/datagramma, pacchetto, frame, bit).', en: 'Name the correct PDU at each layer (data, segment/datagram, packet, frame, bits).' }
        ],
        prerequisites: [
          { it: 'Conoscere la funzione dei livelli 1–4.', en: 'Know the function of layers 1–4.' }
        ],
        theory: [
          { it: 'Incapsulamento è il processo con cui ogni livello, scendendo, aggiunge le proprie informazioni di controllo (header, e al livello 2 anche un trailer) ai dati ricevuti dal livello superiore. Il risultato è l’unità dati di protocollo, o PDU, di quel livello.', en: 'Encapsulation is the process by which each layer, going down, adds its own control information (a header, and at layer 2 also a trailer) to the data received from the layer above. The result is that layer’s protocol data unit, or PDU.' },
          { it: 'I nomi delle PDU sono un classico d’esame: al livello 7–5 si parla genericamente di dati; al livello 4 di segmento (TCP) o datagramma (UDP); al livello 3 di pacchetto; al livello 2 di frame; al livello 1 di bit. Ricordali con la frase “Do Some People Fear Birthdays”? No: Dati, Segmento, Pacchetto, Frame, Bit.', en: 'PDU names are a classic exam point: at layers 7–5 we speak generically of data; at layer 4 of a segment (TCP) or datagram (UDP); at layer 3 of a packet; at layer 2 of a frame; at layer 1 of bits. Remember the sequence Data, Segment, Packet, Frame, Bits.' },
          { it: 'Nel destinatario avviene il processo inverso, il decapsulamento: ogni livello rimuove e interpreta il proprio header, poi consegna il contenuto al livello superiore. Lo switch intermedio lavora sul frame (L2), il router sul pacchetto (L3): ogni apparato “apre la busta” solo fino al livello che gli compete.', en: 'At the receiver the reverse process, decapsulation, takes place: each layer removes and interprets its own header, then hands the payload to the layer above. An intermediate switch works on the frame (L2), a router on the packet (L3): each device “opens the envelope” only as far as the layer it is responsible for.' }
        ],
        example: {
          it: 'Una richiesta HTTP diventa: [dati HTTP] → [header TCP | dati] segmento → [header IP | header TCP | dati] pacchetto → [header Ethernet | pacchetto | FCS] frame → bit sul cavo. A destinazione il server toglie una busta per volta fino a ritrovare la richiesta HTTP originale.', en: 'An HTTP request becomes: [HTTP data] → [TCP header | data] segment → [IP header | TCP header | data] packet → [Ethernet header | packet | FCS] frame → bits on the wire. At the destination the server removes one envelope at a time until it recovers the original HTTP request.' }
        ,
        commonMistakes: [
          { it: 'Chiamare “pacchetto” qualsiasi cosa: a livello 4 è un segmento/datagramma, a livello 2 un frame. Il termine preciso dipende dal livello.', en: 'Calling everything a “packet”: at layer 4 it is a segment/datagram, at layer 2 a frame. The precise term depends on the layer.' },
          { it: 'Dimenticare che il livello 2 aggiunge anche un trailer (l’FCS per il controllo d’errore), non solo un header.', en: 'Forgetting that layer 2 also adds a trailer (the FCS for error checking), not just a header.' },
          { it: 'Credere che ogni apparato lungo il percorso legga tutti i livelli: uno switch non guarda l’header IP, un router non riscrive il payload applicativo.', en: 'Believing every device along the path reads all layers: a switch does not look at the IP header, a router does not rewrite the application payload.' }
        ],
        lab: 'osi',
        references: [{ kind: 'rfc', id: 'RFC 1122' }],
        guidedLabs: [
          {
            id: 'gl-osi-encapsulation-trace',
            title: { it: 'Segui una PDU attraverso lo stack', en: 'Follow a PDU through the stack' },
            difficulty: 'core',
            lab: 'osi',
            scenario: {
              it: 'Il laboratorio “Pila OSI” simula passo-passo l’incapsulamento di un pacchetto per il protocollo scelto, mostrando gli header reali man mano che vengono aggiunti.',
              en: 'The “OSI stack” lab simulates encapsulation step by step for the chosen protocol, showing the real headers as they are added.'
            },
            task: {
              it: 'Avvia una simulazione con un protocollo su TCP e annota, per ogni livello attraversato, il nome della PDU e quale header viene aggiunto.',
              en: 'Start a simulation with a protocol over TCP and note, for each layer crossed, the PDU name and which header is added.'
            },
            steps: [
              { it: 'Apri “Pila OSI”, scegli un protocollo applicativo (es. HTTP) e avvia la simulazione.', en: 'Open “OSI stack”, choose an application protocol (e.g. HTTP) and start the simulation.' },
              { it: 'A ogni passo osserva quale livello è attivo e quale header compare nell’ispettore dei pacchetti.', en: 'At each step observe which layer is active and which header appears in the packet inspector.' },
              { it: 'Compila la sequenza: L4 segmento (header TCP) → L3 pacchetto (header IP) → L2 frame (header Ethernet + FCS) → L1 bit.', en: 'Fill in the sequence: L4 segment (TCP header) → L3 packet (IP header) → L2 frame (Ethernet header + FCS) → L1 bits.' }
            ],
            challenge: {
              it: 'Ripeti con un protocollo su UDP (es. DNS): che cosa cambia nella PDU di livello 4 e perché non c’è l’handshake?',
              en: 'Repeat with a protocol over UDP (e.g. DNS): what changes in the layer-4 PDU, and why is there no handshake?'
            },
            solution: [
              { it: 'Partendo dai dati applicativi, il livello 4 crea un segmento aggiungendo l’header TCP (porte, numeri di sequenza); il livello 3 crea un pacchetto aggiungendo l’header IP (indirizzi sorgente/destinazione); il livello 2 crea un frame aggiungendo l’header Ethernet (MAC) e il trailer FCS; il livello 1 trasmette i bit.', en: 'Starting from application data, layer 4 builds a segment by adding the TCP header (ports, sequence numbers); layer 3 builds a packet by adding the IP header (source/destination addresses); layer 2 builds a frame by adding the Ethernet header (MACs) and the FCS trailer; layer 1 transmits the bits.' },
              { it: 'Sfida (UDP): a livello 4 la PDU è un datagramma con un header UDP minimale (8 byte, senza numeri di sequenza né handshake). UDP è senza connessione: non stabilisce uno stato prima di inviare, quindi è più veloce ma non garantisce consegna né ordine.', en: 'Challenge (UDP): at layer 4 the PDU is a datagram with a minimal UDP header (8 bytes, no sequence numbers or handshake). UDP is connectionless: it establishes no state before sending, so it is faster but guarantees neither delivery nor order.' }
            ],
            selfCheck: [
              { it: 'So riprodurre a memoria la sequenza Dati → Segmento → Pacchetto → Frame → Bit con l’header aggiunto a ogni livello.', en: 'I can reproduce from memory the sequence Data → Segment → Packet → Frame → Bits with the header added at each layer.' },
              { it: 'So spiegare perché un datagramma UDP non ha handshake e quali conseguenze ha sull’affidabilità.', en: 'I can explain why a UDP datagram has no handshake and what that means for reliability.' }
            ]
          }
        ]
      },
      {
        id: 'osi-vs-tcpip',
        title: { it: 'OSI e TCP/IP a confronto', en: 'OSI versus TCP/IP' },
        objectives: [
          { it: 'Mappare i sette livelli OSI sui quattro livelli del modello TCP/IP.', en: 'Map the seven OSI layers onto the four layers of the TCP/IP model.' },
          { it: 'Spiegare perché in pratica si usa TCP/IP mentre OSI resta un riferimento didattico e diagnostico.', en: 'Explain why TCP/IP is used in practice while OSI remains a teaching and troubleshooting reference.' }
        ],
        prerequisites: [
          { it: 'Conoscere le funzioni dei sette livelli OSI.', en: 'Know the functions of the seven OSI layers.' }
        ],
        theory: [
          { it: 'Il modello TCP/IP (descritto nella RFC 1122) ha quattro livelli: Accesso alla rete, Internet, Trasporto e Applicazione. È il modello che le reti reali implementano davvero, perché nasce dai protocolli effettivamente usati su Internet.', en: 'The TCP/IP model (described in RFC 1122) has four layers: Network Access, Internet, Transport and Application. It is the model that real networks actually implement, because it grew out of the protocols actually used on the Internet.' },
          { it: 'La corrispondenza con OSI è diretta: Accesso alla rete copre i livelli OSI 1–2; Internet corrisponde al livello 3 (IP); Trasporto corrisponde al livello 4 (TCP/UDP); Applicazione riunisce i livelli OSI 5–7. Molti testi usano una variante a cinque livelli che tiene separati Fisico e Collegamento dati.', en: 'The mapping to OSI is direct: Network Access covers OSI layers 1–2; Internet corresponds to layer 3 (IP); Transport corresponds to layer 4 (TCP/UDP); Application merges OSI layers 5–7. Many texts use a five-layer variant that keeps Physical and Data Link separate.' },
          { it: 'Perché studiare entrambi? TCP/IP descrive la realtà; OSI dà un vocabolario preciso per isolare i problemi (“è un problema di livello 1 o di livello 3?”) e per confrontare tecnologie diverse. Nel troubleshooting si ragiona spesso “a livelli”, salendo dal fisico verso l’applicazione.', en: 'Why study both? TCP/IP describes reality; OSI gives a precise vocabulary for isolating problems (“is this a layer-1 or a layer-3 issue?”) and for comparing different technologies. Troubleshooting is often done “by layers”, working up from physical toward application.' }
        ],
        example: {
          it: 'Un cavo scollegato è un problema di livello 1; un indirizzo IP o un gateway sbagliato è di livello 3; una porta chiusa dal firewall è di livello 4. Dare un nome al livello giusto indirizza subito la diagnosi.', en: 'An unplugged cable is a layer-1 problem; a wrong IP address or gateway is layer 3; a port closed by the firewall is layer 4. Naming the right layer immediately focuses the diagnosis.' }
        ,
        commonMistakes: [
          { it: 'Cercare un livello “Sessione” o “Presentazione” separato in TCP/IP: lì sono assorbiti nel livello Applicazione.', en: 'Looking for a separate “Session” or “Presentation” layer in TCP/IP: there they are absorbed into the Application layer.' },
          { it: 'Trattare OSI come un protocollo da configurare: è un modello di riferimento, non qualcosa che “gira” sugli apparati.', en: 'Treating OSI as a protocol to configure: it is a reference model, not something that “runs” on devices.' }
        ],
        lab: 'osi',
        references: [{ kind: 'rfc', id: 'RFC 1122' }]
      }
    ]
  },
  {
    id: 'ethernet-switching',
    cert: 'ccna',
    order: 2,
    title: { it: 'Ethernet, switching e tabella CAM', en: 'Ethernet, switching, and the CAM table' },
    summary: {
      it: 'Come funziona la rete locale al livello 2: il frame Ethernet e gli indirizzi MAC, come lo switch impara e inoltra, e perché domini di collisione e di broadcast cambiano il modo di progettare la rete.',
      en: 'How the local network works at layer 2: the Ethernet frame and MAC addresses, how a switch learns and forwards, and why collision and broadcast domains shape the way a network is designed.'
    },
    topics: [
      {
        id: 'ethernet-frame-mac',
        title: { it: 'Il frame Ethernet e l’indirizzo MAC', en: 'The Ethernet frame and the MAC address' },
        objectives: [
          { it: 'Descrivere i campi principali di un frame Ethernet II e il ruolo dell’FCS.', en: 'Describe the main fields of an Ethernet II frame and the role of the FCS.' },
          { it: 'Riconoscere struttura e tipi di indirizzo MAC: unicast, broadcast e la parte OUI.', en: 'Recognise the structure and types of MAC address: unicast, broadcast, and the OUI portion.' }
        ],
        prerequisites: [
          { it: 'Sapere che il livello 2 consegna i frame nella rete locale (vedi capitolo sul modello OSI).', en: 'Know that layer 2 delivers frames within the local network (see the OSI model chapter).' }
        ],
        theory: [
          { it: 'Un frame Ethernet II trasporta, nell’ordine: l’indirizzo MAC di destinazione (6 byte), l’indirizzo MAC sorgente (6 byte), un campo EtherType (2 byte) che indica il protocollo del payload — ad esempio 0x0800 per IPv4, 0x0806 per ARP, 0x86DD per IPv6 — poi il payload (da 46 a 1500 byte) e infine l’FCS (4 byte), il trailer di controllo d’errore.', en: 'An Ethernet II frame carries, in order: the destination MAC address (6 bytes), the source MAC address (6 bytes), an EtherType field (2 bytes) that names the payload protocol — for example 0x0800 for IPv4, 0x0806 for ARP, 0x86DD for IPv6 — then the payload (46 to 1500 bytes) and finally the FCS (4 bytes), the error-check trailer.' },
          { it: 'L’indirizzo MAC è lungo 48 bit (6 byte), scritto in esadecimale, es. 00:1A:2B:3C:4D:5E. I primi 24 bit sono l’OUI (Organizationally Unique Identifier) assegnato al produttore; i restanti 24 identificano la singola scheda. L’indirizzo di broadcast è FF:FF:FF:FF:FF:FF: un frame con quella destinazione è destinato a tutti gli host del dominio di broadcast.', en: 'A MAC address is 48 bits (6 bytes) long, written in hexadecimal, e.g. 00:1A:2B:3C:4D:5E. The first 24 bits are the OUI (Organizationally Unique Identifier) assigned to the vendor; the remaining 24 identify the individual card. The broadcast address is FF:FF:FF:FF:FF:FF: a frame with that destination is meant for every host in the broadcast domain.' },
          { it: 'L’FCS contiene un CRC calcolato sul frame: il ricevente lo ricalcola e, se non corrisponde, scarta il frame silenziosamente. Ethernet non ritrasmette: il recupero dell’errore, se serve, è compito dei livelli superiori come TCP.', en: 'The FCS holds a CRC computed over the frame: the receiver recomputes it and, if it does not match, silently discards the frame. Ethernet does not retransmit: error recovery, when needed, is the job of higher layers such as TCP.' }
        ],
        example: {
          it: 'Un payload IPv4 viaggia in un frame con EtherType 0x0800; una richiesta ARP nello stesso segmento usa EtherType 0x0806 e destinazione broadcast FF:FF:FF:FF:FF:FF, perché chiede “chi ha questo IP?” a tutti.', en: 'An IPv4 payload travels in a frame with EtherType 0x0800; an ARP request on the same segment uses EtherType 0x0806 and the broadcast destination FF:FF:FF:FF:FF:FF, because it asks “who has this IP?” of everyone.' }
        ,
        commonMistakes: [
          { it: 'Confondere indirizzo MAC e indirizzo IP: il MAC è fisico e locale al segmento (L2), l’IP è logico e instradabile tra reti (L3).', en: 'Confusing MAC and IP addresses: the MAC is physical and local to the segment (L2), the IP is logical and routable between networks (L3).' },
          { it: 'Pensare che Ethernet garantisca la consegna: l’FCS rileva gli errori e fa scartare il frame, ma non lo ritrasmette.', en: 'Thinking Ethernet guarantees delivery: the FCS detects errors and causes the frame to be dropped, but it does not retransmit it.' }
        ],
        lab: 'fundamentals'
      },
      {
        id: 'switch-cam-learning',
        title: { it: 'Come lo switch impara: la tabella CAM', en: 'How a switch learns: the CAM table' },
        objectives: [
          { it: 'Spiegare come lo switch popola la tabella CAM e come decide forwarding, flooding e filtering.', en: 'Explain how a switch populates the CAM table and how it decides forwarding, flooding, and filtering.' },
          { it: 'Prevedere il comportamento con unknown unicast, broadcast e aging della tabella.', en: 'Predict the behaviour with unknown unicast, broadcast, and table aging.' }
        ],
        prerequisites: [
          { it: 'Conoscere la struttura del frame Ethernet e l’indirizzo MAC.', en: 'Know the structure of the Ethernet frame and the MAC address.' }
        ],
        theory: [
          { it: 'Lo switch impara osservando l’indirizzo MAC *sorgente* dei frame in ingresso: associa quel MAC alla porta da cui è arrivato e lo registra nella tabella CAM (in IOS, la MAC address-table), insieme alla VLAN. È un apprendimento passivo e continuo.', en: 'A switch learns by observing the *source* MAC address of incoming frames: it associates that MAC with the port it arrived on and records it in the CAM table (in IOS, the MAC address-table), together with the VLAN. The learning is passive and continuous.' },
          { it: 'Per inoltrare, lo switch guarda il MAC di *destinazione*: se è noto in tabella, invia il frame solo sulla porta giusta (forwarding); se non è noto (unknown unicast) o è un broadcast/multicast, lo inonda su tutte le porte della VLAN tranne quella di ingresso (flooding); se destinazione e sorgente sono sulla stessa porta, non lo inoltra (filtering).', en: 'To forward, the switch looks at the *destination* MAC: if it is known in the table, it sends the frame only out of the correct port (forwarding); if it is unknown (unknown unicast) or is a broadcast/multicast, it floods it out of every port in the VLAN except the ingress port (flooding); if the destination and source are on the same port, it does not forward it (filtering).' },
          { it: 'Le voci apprese dinamicamente scadono dopo un tempo di inattività (per default 300 secondi su IOS): se da quel MAC non arrivano più frame, la voce viene rimossa. L’aging misura l’inattività, non l’età assoluta della voce.', en: 'Dynamically learned entries expire after an idle time (300 seconds by default on IOS): if no more frames arrive from that MAC, the entry is removed. Aging measures inactivity, not the absolute age of the entry.' }
        ],
        example: {
          it: 'Il primo frame verso un host mai sentito prima viene inondato su tutta la VLAN (unknown unicast): non è un broadcast, ma si comporta come tale finché lo switch non impara dove si trova quell’host dalla sua risposta.', en: 'The first frame toward a host never heard from before is flooded across the whole VLAN (unknown unicast): it is not a broadcast, but behaves like one until the switch learns where that host is from its reply.' }
        ,
        commonMistakes: [
          { it: 'Credere che lo switch impari dall’indirizzo di destinazione: impara dalla *sorgente*, e usa la destinazione solo per decidere dove inoltrare.', en: 'Believing the switch learns from the destination address: it learns from the *source*, and uses the destination only to decide where to forward.' },
          { it: 'Confondere unknown unicast e broadcast: il primo viene inondato per necessità (manca la voce in CAM), il secondo per definizione (destinazione a tutti).', en: 'Confusing unknown unicast and broadcast: the first is flooded out of necessity (no CAM entry), the second by definition (destined to everyone).' },
          { it: 'Pensare che l’aging scatti a tempo fisso: riparte ogni volta che arriva traffico da quel MAC.', en: 'Thinking aging fires on a fixed timer: it restarts every time traffic arrives from that MAC.' }
        ],
        lab: 'access',
        guidedLabs: [
          {
            id: 'gl-cam-decisions',
            title: { it: 'Forwarding, flooding o filtering?', en: 'Forwarding, flooding, or filtering?' },
            difficulty: 'core',
            lab: 'access',
            scenario: {
              it: 'Il laboratorio “Accesso alla rete” include un’esercitazione sulla CAM table che riesegue una sequenza di frame ed etichetta ogni decisione dello switch con il motivo.',
              en: 'The “Network access” lab includes a CAM-table exercise that replays a sequence of frames and labels each switch decision with its reason.'
            },
            task: {
              it: 'Per ciascun frame della sequenza, prevedi se lo switch farà forwarding, flooding o filtering e perché, poi confronta con l’esito mostrato.',
              en: 'For each frame in the sequence, predict whether the switch will forward, flood, or filter, and why, then compare with the shown outcome.'
            },
            steps: [
              { it: 'Apri “Accesso alla rete” e avvia l’esercitazione sulla CAM table.', en: 'Open “Network access” and start the CAM-table exercise.' },
              { it: 'Per ogni frame guarda prima il MAC sorgente (cosa impara lo switch) e poi il MAC destinazione (come decide).', en: 'For each frame look first at the source MAC (what the switch learns) and then at the destination MAC (how it decides).' },
              { it: 'Classifica la decisione: destinazione nota → forwarding; sconosciuta o broadcast → flooding; stessa porta della sorgente → filtering.', en: 'Classify the decision: destination known → forwarding; unknown or broadcast → flooding; same port as the source → filtering.' }
            ],
            challenge: {
              it: 'Introduci uno spostamento di MAC (lo stesso host appare su una porta diversa) e un’attesa oltre l’aging: come cambiano le voci in tabella e le decisioni successive?',
              en: 'Introduce a MAC move (the same host appears on a different port) and a wait beyond the aging time: how do the table entries and later decisions change?'
            },
            solution: [
              { it: 'Ogni frame prima aggiorna la CAM con la coppia (MAC sorgente, porta, VLAN), poi la decisione dipende dalla destinazione: nota → una sola porta (forwarding); unknown unicast o broadcast → tutte le porte della VLAN tranne l’ingresso (flooding); destinazione sulla stessa porta della sorgente → scartato (filtering).', en: 'Each frame first updates the CAM with the (source MAC, port, VLAN) tuple, then the decision depends on the destination: known → a single port (forwarding); unknown unicast or broadcast → every port in the VLAN except the ingress (flooding); destination on the same port as the source → dropped (filtering).' },
              { it: 'Sfida: uno spostamento di MAC riscrive la porta associata a quel MAC (lo switch “segue” l’host); superato l’aging per inattività, la voce sparisce e il successivo frame verso quell’host torna a essere un unknown unicast inondato.', en: 'Challenge: a MAC move rewrites the port associated with that MAC (the switch “follows” the host); once the idle aging elapses, the entry disappears and the next frame toward that host becomes a flooded unknown unicast again.' }
            ],
            selfCheck: [
              { it: 'So indicare, per ogni frame, sia cosa lo switch ha imparato sia perché ha inoltrato, inondato o filtrato.', en: 'I can state, for each frame, both what the switch learned and why it forwarded, flooded, or filtered.' },
              { it: 'Le mie previsioni coincidono con gli esiti etichettati nell’esercitazione.', en: 'My predictions match the labelled outcomes in the exercise.' }
            ]
          }
        ]
      },
      {
        id: 'collision-broadcast-domains',
        title: { it: 'Domini di collisione e di broadcast', en: 'Collision and broadcast domains' },
        objectives: [
          { it: 'Distinguere un dominio di collisione da un dominio di broadcast e dire quale dispositivo delimita ciascuno.', en: 'Distinguish a collision domain from a broadcast domain and say which device bounds each.' },
          { it: 'Spiegare perché hub, switch e router hanno effetti diversi sulla segmentazione.', en: 'Explain why hubs, switches, and routers have different effects on segmentation.' }
        ],
        prerequisites: [
          { it: 'Sapere come lo switch inoltra e inonda i frame.', en: 'Know how a switch forwards and floods frames.' }
        ],
        theory: [
          { it: 'Un dominio di collisione è l’insieme di dispositivi che condividono lo stesso mezzo e possono quindi “collidere” se trasmettono insieme. Un hub crea un unico grande dominio di collisione, half-duplex, governato da CSMA/CD. Ogni porta di uno switch, invece, è un dominio di collisione separato e in full-duplex le collisioni spariscono del tutto.', en: 'A collision domain is the set of devices that share the same medium and can therefore “collide” if they transmit at once. A hub creates one large collision domain, half-duplex, governed by CSMA/CD. Each switch port, by contrast, is a separate collision domain, and in full-duplex collisions disappear entirely.' },
          { it: 'Un dominio di broadcast è l’insieme di dispositivi che ricevono un frame di broadcast di livello 2. Uno switch, da solo, propaga i broadcast su tutte le sue porte: tutte appartengono allo stesso dominio di broadcast, a meno di suddividerlo in VLAN. È il router (o una SVI di livello 3) a delimitare i domini di broadcast, perché non inoltra i broadcast di livello 2.', en: 'A broadcast domain is the set of devices that receive a layer-2 broadcast frame. A switch on its own propagates broadcasts out of all its ports: they all belong to the same broadcast domain, unless it is split into VLANs. It is the router (or a layer-3 SVI) that bounds broadcast domains, because it does not forward layer-2 broadcasts.' },
          { it: 'In sintesi: lo switch aumenta il numero di domini di collisione (uno per porta) ma non quello di broadcast; le VLAN suddividono un dominio di broadcast in più domini logici; il router separa i domini di broadcast e instrada tra loro.', en: 'In short: a switch increases the number of collision domains (one per port) but not of broadcast domains; VLANs split one broadcast domain into several logical ones; the router separates broadcast domains and routes between them.' }
        ],
        example: {
          it: 'Dieci PC su un hub condividono un solo dominio di collisione (e uno di broadcast). Spostandoli su uno switch si ottengono dieci domini di collisione ma ancora un solo dominio di broadcast; creando due VLAN si ottengono due domini di broadcast, che solo un instradamento di livello 3 può mettere in comunicazione.', en: 'Ten PCs on a hub share a single collision domain (and one broadcast domain). Moving them to a switch yields ten collision domains but still one broadcast domain; creating two VLANs yields two broadcast domains, which only layer-3 routing can connect.' }
        ,
        commonMistakes: [
          { it: 'Pensare che uno switch separi i domini di broadcast: senza VLAN e senza routing, tutte le sue porte restano nello stesso dominio di broadcast.', en: 'Thinking a switch separates broadcast domains: without VLANs and without routing, all its ports stay in the same broadcast domain.' },
          { it: 'Attribuire ancora le collisioni a una rete tutta in full-duplex su switch: lì CSMA/CD non interviene perché le collisioni non si verificano.', en: 'Still attributing collisions to an all-full-duplex switched network: there CSMA/CD does not kick in because collisions do not occur.' }
        ],
        lab: 'fundamentals'
      }
    ]
  }
];

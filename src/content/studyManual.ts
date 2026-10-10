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
  },
  {
    id: 'ipv4-subnetting',
    cert: 'ccna',
    order: 3,
    title: { it: 'Indirizzamento IPv4 e subnetting', en: 'IPv4 addressing and subnetting' },
    summary: {
      it: 'Il livello 3 che instrada tra reti: come è fatto un indirizzo IPv4, cosa significano maschera e notazione CIDR, come si calcolano rete, broadcast e host, e come il VLSM assegna subnet di dimensioni diverse senza sprechi.',
      en: 'The layer-3 addressing that routes between networks: how an IPv4 address is built, what the mask and CIDR notation mean, how to compute network, broadcast and hosts, and how VLSM assigns differently sized subnets without waste.'
    },
    topics: [
      {
        id: 'ipv4-address-mask',
        title: { it: 'Indirizzo IPv4, maschera e notazione CIDR', en: 'IPv4 address, mask, and CIDR notation' },
        objectives: [
          { it: 'Descrivere la struttura di un indirizzo IPv4 e separare porzione di rete e porzione host tramite la maschera.', en: 'Describe the structure of an IPv4 address and separate the network portion from the host portion using the mask.' },
          { it: 'Leggere la notazione CIDR /n e riconoscere indirizzi privati (RFC 1918) e di documentazione (RFC 5737).', en: 'Read CIDR /n notation and recognise private (RFC 1918) and documentation (RFC 5737) addresses.' }
        ],
        prerequisites: [
          { it: 'Sapere che il livello 3 instrada i pacchetti tra reti diverse (vedi capitolo sul modello OSI).', en: 'Know that layer 3 routes packets between different networks (see the OSI model chapter).' }
        ],
        theory: [
          { it: 'Un indirizzo IPv4 è lungo 32 bit, scritto come quattro ottetti decimali separati da punti (es. 192.168.1.10), ciascuno da 0 a 255. L’indirizzo non basta da solo: serve la maschera di sottorete per sapere quanti bit, a partire da sinistra, identificano la rete e quanti restano per gli host.', en: 'An IPv4 address is 32 bits long, written as four decimal octets separated by dots (e.g. 192.168.1.10), each from 0 to 255. The address alone is not enough: the subnet mask is needed to know how many bits, from the left, identify the network and how many remain for hosts.' },
          { it: 'La maschera è anch’essa 32 bit: i bit a 1 coprono la porzione di rete, quelli a 0 la porzione host. La notazione CIDR riassume la maschera con /n, dove n è il numero di bit a 1: 255.255.255.0 equivale a /24, cioè 24 bit di rete e 8 di host.', en: 'The mask is also 32 bits: the 1 bits cover the network portion, the 0 bits the host portion. CIDR notation summarises the mask as /n, where n is the number of 1 bits: 255.255.255.0 equals /24, that is 24 network bits and 8 host bits.' },
          { it: 'Alcuni blocchi sono riservati: gli indirizzi privati RFC 1918 (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) non sono instradati su Internet e si usano nelle LAN dietro NAT; i blocchi di documentazione RFC 5737 (192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24) servono per esempi e manuali, e sono quelli usati in questa app proprio per non puntare a sistemi reali.', en: 'Some blocks are reserved: RFC 1918 private addresses (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) are not routed on the Internet and are used in LANs behind NAT; RFC 5737 documentation blocks (192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24) are for examples and manuals, and are the ones this app uses precisely so as not to point at real systems.' }
        ],
        example: {
          it: 'In 203.0.113.10/24 la maschera è 255.255.255.0: i primi 24 bit (203.0.113) sono la rete, l’ultimo ottetto (10) è l’host. Cambiando la maschera in /26 (255.255.255.192) la stessa rete viene divisa in quattro sottoreti più piccole.', en: 'In 203.0.113.10/24 the mask is 255.255.255.0: the first 24 bits (203.0.113) are the network, the last octet (10) is the host. Changing the mask to /26 (255.255.255.192) splits the same network into four smaller subnets.' }
        ,
        commonMistakes: [
          { it: 'Leggere l’indirizzo senza la maschera: lo stesso 203.0.113.10 appartiene a reti diverse con /24 o /26. La maschera non è un dettaglio opzionale.', en: 'Reading the address without the mask: the same 203.0.113.10 belongs to different networks with /24 or /26. The mask is not an optional detail.' },
          { it: 'Confondere privati e pubblici: un 192.168.x.x non è instradabile su Internet, deve passare per il NAT.', en: 'Confusing private and public: a 192.168.x.x is not routable on the Internet, it must go through NAT.' }
        ],
        lab: 'fundamentals',
        references: [{ kind: 'rfc', id: 'RFC 4632' }]
      },
      {
        id: 'ipv4-subnet-math',
        title: { it: 'Calcolare rete, broadcast e host', en: 'Computing network, broadcast, and hosts' },
        objectives: [
          { it: 'Dato un indirizzo con prefisso, calcolare indirizzo di rete, broadcast, primo e ultimo host e numero di host utilizzabili.', en: 'Given an address with a prefix, compute the network address, broadcast, first and last host, and the number of usable hosts.' },
          { it: 'Spiegare perché gli host utilizzabili sono 2^h − 2 e le eccezioni /31 e /32.', en: 'Explain why usable hosts are 2^h − 2 and the /31 and /32 exceptions.' }
        ],
        prerequisites: [
          { it: 'Conoscere maschera e notazione CIDR.', en: 'Know the mask and CIDR notation.' }
        ],
        theory: [
          { it: 'Con h bit host, una sottorete contiene 2^h indirizzi totali. Due sono riservati: l’indirizzo di rete (tutti i bit host a 0), che identifica la sottorete, e l’indirizzo di broadcast (tutti i bit host a 1), che raggiunge tutti gli host. Gli host utilizzabili sono quindi 2^h − 2.', en: 'With h host bits, a subnet contains 2^h total addresses. Two are reserved: the network address (all host bits 0), which identifies the subnet, and the broadcast address (all host bits 1), which reaches every host. Usable hosts are therefore 2^h − 2.' },
          { it: 'Il “block size” dell’ottetto interessante è 256 meno il valore della maschera in quell’ottetto: per /26 la maschera è 255.255.255.192, 256 − 192 = 64, quindi le sottoreti partono da .0, .64, .128, .192. L’indirizzo di rete è il multiplo del block size immediatamente ≤ all’host; il broadcast è l’indirizzo prima della rete successiva.', en: 'The “block size” of the interesting octet is 256 minus the mask value in that octet: for /26 the mask is 255.255.255.192, 256 − 192 = 64, so the subnets start at .0, .64, .128, .192. The network address is the multiple of the block size just ≤ the host; the broadcast is the address before the next network.' },
          { it: 'Due eccezioni: un /31 (RFC 3021) ha solo 2 indirizzi e nessun broadcast, usati entrambi come host sui collegamenti punto-punto; un /32 è un singolo indirizzo (host route), usato ad esempio per una loopback.', en: 'Two exceptions: a /31 (RFC 3021) has only 2 addresses and no broadcast, both used as hosts on point-to-point links; a /32 is a single address (host route), used for example for a loopback.' }
        ],
        example: {
          it: 'Per 203.0.113.80/26: block size 64, quindi la sottorete è 203.0.113.64, il broadcast 203.0.113.127, il primo host 203.0.113.65 e l’ultimo 203.0.113.126, per 62 host utilizzabili (2^6 − 2).', en: 'For 203.0.113.80/26: block size 64, so the subnet is 203.0.113.64, the broadcast 203.0.113.127, the first host 203.0.113.65 and the last 203.0.113.126, for 62 usable hosts (2^6 − 2).' }
        ,
        commonMistakes: [
          { it: 'Dimenticare di sottrarre i due indirizzi riservati: un /24 ha 256 indirizzi ma 254 host utilizzabili.', en: 'Forgetting to subtract the two reserved addresses: a /24 has 256 addresses but 254 usable hosts.' },
          { it: 'Applicare la regola 2^h − 2 anche al /31: lì vale l’eccezione RFC 3021 con 2 host e nessun broadcast.', en: 'Applying the 2^h − 2 rule to a /31 too: there the RFC 3021 exception applies, with 2 hosts and no broadcast.' },
          { it: 'Scegliere il block size dall’ottetto sbagliato: va individuato l’ottetto dove la maschera non è né 255 né 0.', en: 'Picking the block size from the wrong octet: it must be taken from the octet where the mask is neither 255 nor 0.' }
        ],
        lab: 'fundamentals',
        references: [{ kind: 'rfc', id: 'RFC 3021' }],
        guidedLabs: [
          {
            id: 'gl-subnet-calc',
            title: { it: 'Calcola la sottorete di un host', en: 'Work out a host’s subnet' },
            difficulty: 'core',
            lab: 'fundamentals',
            scenario: {
              it: 'Il laboratorio «Fondamenti di rete» include un esploratore IPv4 che, dato indirizzo e prefisso, mostra rete, broadcast, range host, maschera e wildcard.',
              en: 'The “Network fundamentals” lab includes an IPv4 explorer that, given an address and prefix, shows the network, broadcast, host range, mask and wildcard.'
            },
            task: {
              it: 'Per 203.0.113.80/26 calcola a mano rete, broadcast, primo e ultimo host e numero di host, poi verifica con l’esploratore.',
              en: 'For 203.0.113.80/26 work out by hand the network, broadcast, first and last host, and host count, then check with the explorer.'
            },
            steps: [
              { it: 'Trova il block size: 256 − 192 (il valore della maschera /26 nell’ultimo ottetto) = 64.', en: 'Find the block size: 256 − 192 (the /26 mask value in the last octet) = 64.' },
              { it: 'Individua il multiplo di 64 immediatamente ≤ 80: è 64, quindi la rete è 203.0.113.64.', en: 'Find the multiple of 64 just ≤ 80: it is 64, so the network is 203.0.113.64.' },
              { it: 'Il broadcast è l’indirizzo prima della rete successiva (.128), cioè 203.0.113.127; host da .65 a .126.', en: 'The broadcast is the address before the next network (.128), i.e. 203.0.113.127; hosts from .65 to .126.' },
              { it: 'Apri l’esploratore IPv4, inserisci 203.0.113.80/26 e confronta i valori.', en: 'Open the IPv4 explorer, enter 203.0.113.80/26 and compare the values.' }
            ],
            challenge: {
              it: 'Ripeti con 203.0.113.80/28 e con un /30 punto-punto: come cambiano block size, numero di host e broadcast?',
              en: 'Repeat with 203.0.113.80/28 and with a point-to-point /30: how do the block size, host count and broadcast change?'
            },
            solution: [
              { it: 'Per /26: block size 64, rete 203.0.113.64, broadcast 203.0.113.127, host 203.0.113.65–126, 62 host utilizzabili (2^6 − 2).', en: 'For /26: block size 64, network 203.0.113.64, broadcast 203.0.113.127, hosts 203.0.113.65–126, 62 usable hosts (2^6 − 2).' },
              { it: 'Sfida /28: block size 16, rete 203.0.113.80, broadcast 203.0.113.95, host .81–.94, 14 host. Sfida /30: block size 4, rete 203.0.113.80, broadcast .83, host .81–.82, 2 host — tipico collegamento punto-punto.', en: 'Challenge /28: block size 16, network 203.0.113.80, broadcast 203.0.113.95, hosts .81–.94, 14 hosts. Challenge /30: block size 4, network 203.0.113.80, broadcast .83, hosts .81–.82, 2 hosts — a typical point-to-point link.' }
            ],
            selfCheck: [
              { it: 'So ricavare rete e broadcast dal block size senza convertire tutto in binario.', en: 'I can derive the network and broadcast from the block size without converting everything to binary.' },
              { it: 'I miei valori coincidono con quelli dell’esploratore IPv4 per ogni prefisso provato.', en: 'My values match the IPv4 explorer’s for every prefix I tried.' }
            ]
          }
        ]
      },
      {
        id: 'ipv4-vlsm',
        title: { it: 'VLSM: subnet di dimensioni diverse', en: 'VLSM: differently sized subnets' },
        objectives: [
          { it: 'Applicare il VLSM per assegnare a ogni rete una subnet della dimensione giusta, partendo dal requisito più grande.', en: 'Apply VLSM to give each network a right-sized subnet, starting from the largest requirement.' },
          { it: 'Spiegare perché l’ordine di allocazione dal più grande al più piccolo evita sovrapposizioni e sprechi.', en: 'Explain why allocating from largest to smallest avoids overlaps and waste.' }
        ],
        prerequisites: [
          { it: 'Saper calcolare rete, broadcast e host di una sottorete.', en: 'Be able to compute a subnet’s network, broadcast and hosts.' }
        ],
        theory: [
          { it: 'Il VLSM (Variable Length Subnet Mask) usa maschere di lunghezza diversa all’interno dello stesso blocco, così ogni sottorete ha solo gli indirizzi che le servono. È il modo con cui si evita di sprecare un intero /24 per un collegamento con due soli host.', en: 'VLSM (Variable Length Subnet Mask) uses masks of different lengths within the same block, so each subnet has only the addresses it needs. It is how you avoid wasting a whole /24 on a link with just two hosts.' },
          { it: 'La regola pratica è allocare dal requisito più grande al più piccolo: per ciascuno si sceglie il prefisso più lungo (la subnet più piccola) che offre abbastanza host, e si parte dalla prima subnet libera. Ordinare al contrario frammenta il blocco e crea sovrapposizioni difficili da correggere.', en: 'The practical rule is to allocate from the largest requirement to the smallest: for each one you pick the longest prefix (the smallest subnet) that still provides enough hosts, starting from the first free subnet. Ordering the other way fragments the block and creates overlaps that are hard to fix.' },
          { it: 'La wildcard mask, usata ad esempio nelle ACL e in OSPF, è il complemento della maschera: 255.255.255.192 (/26) ha wildcard 0.0.0.63. Indica quali bit “non contano” nel confronto.', en: 'The wildcard mask, used for example in ACLs and OSPF, is the complement of the mask: 255.255.255.192 (/26) has wildcard 0.0.0.63. It indicates which bits “do not matter” in the comparison.' }
        ],
        example: {
          it: 'Dovendo servire 100, 50, 20 e 2 host dal blocco 203.0.113.0/24: 100 → /25 (203.0.113.0, 126 host), 50 → /26 (203.0.113.128, 62 host), 20 → /27 (203.0.113.192, 30 host), 2 → /30 (203.0.113.224). Ogni rete ha spazio sufficiente e nessuna si sovrappone.', en: 'To serve 100, 50, 20 and 2 hosts from the 203.0.113.0/24 block: 100 → /25 (203.0.113.0, 126 hosts), 50 → /26 (203.0.113.128, 62 hosts), 20 → /27 (203.0.113.192, 30 hosts), 2 → /30 (203.0.113.224). Each network has enough room and none overlaps.' }
        ,
        commonMistakes: [
          { it: 'Allocare in ordine arbitrario invece che dal più grande: si finisce per non far entrare più le reti grandi.', en: 'Allocating in arbitrary order instead of largest-first: you end up unable to fit the large networks any more.' },
          { it: 'Scegliere un prefisso troppo corto “per sicurezza”: spreca indirizzi e riduce il numero di subnet ottenibili dal blocco.', en: 'Choosing too short a prefix “to be safe”: it wastes addresses and reduces how many subnets the block can yield.' }
        ],
        lab: 'fundamentals',
        references: [{ kind: 'rfc', id: 'RFC 4632' }],
        guidedLabs: [
          {
            id: 'gl-vlsm-plan',
            title: { it: 'Pianifica un indirizzamento VLSM', en: 'Plan a VLSM addressing scheme' },
            difficulty: 'advanced',
            lab: 'fundamentals',
            scenario: {
              it: 'Il laboratorio «Fondamenti di rete» contiene un pianificatore VLSM che, dato un blocco e una lista di requisiti, propone le subnet e segnala gli indirizzi sprecati.',
              en: 'The “Network fundamentals” lab contains a VLSM planner that, given a block and a list of requirements, proposes the subnets and flags wasted addresses.'
            },
            task: {
              it: 'Dal blocco 203.0.113.0/24, pianifica a mano le subnet per 100, 50, 20 e 2 host, poi verifica con il pianificatore.',
              en: 'From the 203.0.113.0/24 block, plan by hand the subnets for 100, 50, 20 and 2 hosts, then check with the planner.'
            },
            steps: [
              { it: 'Ordina i requisiti dal più grande al più piccolo: 100, 50, 20, 2.', en: 'Order the requirements from largest to smallest: 100, 50, 20, 2.' },
              { it: 'Per ciascuno scegli il prefisso più lungo con host sufficienti: 100→/25, 50→/26, 20→/27, 2→/30.', en: 'For each, pick the longest prefix with enough hosts: 100→/25, 50→/26, 20→/27, 2→/30.' },
              { it: 'Alloca in sequenza dalla prima subnet libera e annota rete e broadcast di ognuna.', en: 'Allocate in sequence from the first free subnet and note each one’s network and broadcast.' },
              { it: 'Inserisci blocco e requisiti nel pianificatore VLSM e confronta il piano e gli sprechi.', en: 'Enter the block and requirements into the VLSM planner and compare the plan and the waste.' }
            ],
            challenge: {
              it: 'Aggiungi un quinto requisito da 2 host: entra ancora nel /24? Quanti indirizzi restano liberi dopo tutte le allocazioni?',
              en: 'Add a fifth requirement of 2 hosts: does it still fit in the /24? How many addresses remain free after all allocations?'
            },
            solution: [
              { it: '100→203.0.113.0/25 (.0–.127), 50→203.0.113.128/26 (.128–.191), 20→203.0.113.192/27 (.192–.223), 2→203.0.113.224/30 (.224–.227). Restano liberi .228–.255.', en: '100→203.0.113.0/25 (.0–.127), 50→203.0.113.128/26 (.128–.191), 20→203.0.113.192/27 (.192–.223), 2→203.0.113.224/30 (.224–.227). Addresses .228–.255 remain free.' },
              { it: 'Sfida: un secondo /30 entra a 203.0.113.228/30 (.228–.231); dopo le cinque reti restano liberi 203.0.113.232–255, cioè 24 indirizzi.', en: 'Challenge: a second /30 fits at 203.0.113.228/30 (.228–.231); after the five networks, 203.0.113.232–255 remain free, i.e. 24 addresses.' }
            ],
            selfCheck: [
              { it: 'Ho allocato dal requisito più grande e nessuna subnet si sovrappone.', en: 'I allocated from the largest requirement first and no subnet overlaps.' },
              { it: 'Il piano e gli indirizzi sprecati coincidono con quelli del pianificatore VLSM.', en: 'My plan and the wasted addresses match those of the VLSM planner.' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'vlan-trunk-stp',
    cert: 'ccna',
    order: 4,
    title: { it: 'VLAN, trunk 802.1Q e Spanning Tree', en: 'VLANs, 802.1Q trunks, and Spanning Tree' },
    summary: {
      it: 'Come si segmenta e si rende stabile la rete commutata: VLAN per separare i domini di broadcast, trunk 802.1Q per trasportarle tra switch, e Spanning Tree per evitare i loop di livello 2 mantenendo un percorso senza anelli.',
      en: 'How the switched network is segmented and kept stable: VLANs to separate broadcast domains, 802.1Q trunks to carry them between switches, and Spanning Tree to prevent layer-2 loops while keeping a loop-free path.'
    },
    topics: [
      {
        id: 'vlan-segmentation',
        title: { it: 'VLAN: segmentare la rete logicamente', en: 'VLANs: segmenting the network logically' },
        objectives: [
          { it: 'Spiegare cos’è una VLAN e perché corrisponde a un dominio di broadcast separato.', en: 'Explain what a VLAN is and why it corresponds to a separate broadcast domain.' },
          { it: 'Distinguere porta di accesso e appartenenza a una VLAN, e capire perché serve il livello 3 per il traffico inter-VLAN.', en: 'Distinguish an access port and VLAN membership, and understand why inter-VLAN traffic needs layer 3.' }
        ],
        prerequisites: [
          { it: 'Conoscere i domini di broadcast e il funzionamento dello switch (capitolo Ethernet e switching).', en: 'Know broadcast domains and how a switch works (Ethernet and switching chapter).' }
        ],
        theory: [
          { it: 'Una VLAN (Virtual LAN) suddivide un singolo switch fisico in più reti logiche: ogni VLAN è un dominio di broadcast separato. Due host in VLAN diverse, anche sullo stesso switch, non possono comunicare direttamente al livello 2, esattamente come se fossero su switch distinti.', en: 'A VLAN (Virtual LAN) splits a single physical switch into several logical networks: each VLAN is a separate broadcast domain. Two hosts in different VLANs, even on the same switch, cannot communicate directly at layer 2, exactly as if they were on separate switches.' },
          { it: 'Una porta di accesso appartiene a una sola VLAN dati e consegna all’host frame non taggati. Gli ID VLAN vanno da 1 a 4094: la VLAN 1 è quella di default (sconsigliata per il traffico utente) e le VLAN 1002-1005 sono riservate per compatibilità storica.', en: 'An access port belongs to a single data VLAN and delivers untagged frames to the host. VLAN IDs range from 1 to 4094: VLAN 1 is the default (discouraged for user traffic) and VLANs 1002–1005 are reserved for historical compatibility.' },
          { it: 'Poiché le VLAN isolano i domini di broadcast, il traffico tra VLAN diverse richiede un dispositivo di livello 3: un router o una SVI (Switched Virtual Interface) su uno switch multilayer. È il cosiddetto inter-VLAN routing.', en: 'Because VLANs isolate broadcast domains, traffic between different VLANs requires a layer-3 device: a router or an SVI (Switched Virtual Interface) on a multilayer switch. This is so-called inter-VLAN routing.' }
        ],
        example: {
          it: 'Mettendo i PC dell’ufficio in VLAN 10 e le telecamere in VLAN 20 sullo stesso switch, un broadcast delle telecamere non raggiunge i PC; perché un PC parli con il NVR in VLAN 20 serve un instradamento di livello 3 tra le due VLAN.', en: 'Putting office PCs in VLAN 10 and cameras in VLAN 20 on the same switch means a camera broadcast never reaches the PCs; for a PC to talk to the NVR in VLAN 20, layer-3 routing between the two VLANs is required.' }
        ,
        commonMistakes: [
          { it: 'Pensare che host in VLAN diverse comunichino perché sono sullo stesso switch: senza routing di livello 3 restano isolati.', en: 'Thinking hosts in different VLANs communicate because they are on the same switch: without layer-3 routing they stay isolated.' },
          { it: 'Lasciare il traffico utente sulla VLAN 1 di default, che è anche quella usata da molti protocolli di gestione: una scelta rischiosa in sicurezza.', en: 'Leaving user traffic on the default VLAN 1, which is also used by many management protocols: a risky security choice.' }
        ],
        lab: 'access'
      },
      {
        id: 'trunk-dot1q',
        title: { it: 'Trunk 802.1Q e native VLAN', en: '802.1Q trunks and the native VLAN' },
        objectives: [
          { it: 'Descrivere come un trunk trasporta più VLAN e come il tag 802.1Q identifica ciascun frame.', en: 'Describe how a trunk carries multiple VLANs and how the 802.1Q tag identifies each frame.' },
          { it: 'Spiegare il ruolo della native VLAN e il rischio di un native VLAN mismatch.', en: 'Explain the role of the native VLAN and the risk of a native VLAN mismatch.' }
        ],
        prerequisites: [
          { it: 'Sapere cos’è una VLAN e cosa fa una porta di accesso.', en: 'Know what a VLAN is and what an access port does.' }
        ],
        theory: [
          { it: 'Un collegamento trunk trasporta il traffico di più VLAN tra due switch (o tra switch e router/AP). Per non confondere le VLAN, lo standard IEEE 802.1Q inserisce nel frame un tag di 4 byte tra l’indirizzo sorgente e l’EtherType: contiene un TPID 0x8100, i bit di priorità (PCP) e, soprattutto, un VLAN ID di 12 bit (da cui il limite di 4094 VLAN). Il frame taggato può arrivare fino a 1522 byte.', en: 'A trunk link carries traffic for multiple VLANs between two switches (or between a switch and a router/AP). To avoid confusing the VLANs, the IEEE 802.1Q standard inserts a 4-byte tag into the frame between the source address and the EtherType: it holds a TPID 0x8100, the priority bits (PCP) and, above all, a 12-bit VLAN ID (hence the 4094-VLAN limit). A tagged frame can be up to 1522 bytes.' },
          { it: 'La native VLAN è l’unica VLAN i cui frame viaggiano sul trunk *senza* tag. Serve per compatibilità, ma è un punto delicato: entrambe le estremità del trunk devono concordare sulla stessa native VLAN.', en: 'The native VLAN is the one VLAN whose frames travel on the trunk *without* a tag. It exists for compatibility, but it is a delicate point: both ends of the trunk must agree on the same native VLAN.' },
          { it: 'Un native VLAN mismatch (i due lati configurati con native diverse) fa “saltare” il traffico tra le due VLAN native, con fuga di traffico e potenziali rischi di sicurezza come il VLAN hopping. Buona pratica: fissare esplicitamente la native su una VLAN inutilizzata e taggare tutto.', en: 'A native VLAN mismatch (the two sides configured with different natives) makes traffic “leak” between the two native VLANs, with traffic leakage and potential security risks such as VLAN hopping. Best practice: explicitly set the native to an unused VLAN and tag everything.' }
        ],
        example: {
          it: 'Su un trunk che trasporta VLAN 10, 20 e 99: i frame di VLAN 10 e 20 viaggiano taggati, quelli della native VLAN 99 non taggati. Se un lato ha native 99 e l’altro native 1, i due switch scambiano per errore traffico tra VLAN 99 e VLAN 1.', en: 'On a trunk carrying VLANs 10, 20 and 99: VLAN 10 and 20 frames travel tagged, native VLAN 99 frames untagged. If one side has native 99 and the other native 1, the two switches mistakenly exchange traffic between VLAN 99 and VLAN 1.' }
        ,
        commonMistakes: [
          { it: 'Credere che tutti i frame su un trunk siano taggati: quelli della native VLAN non lo sono, ed è proprio questo a rendere pericoloso un mismatch.', en: 'Believing every frame on a trunk is tagged: native VLAN frames are not, and that is exactly what makes a mismatch dangerous.' },
          { it: 'Lasciare la native VLAN a 1 di default su entrambi i lati senza valutarne le implicazioni di sicurezza (VLAN hopping con doppio tag).', en: 'Leaving the native VLAN at the default of 1 on both sides without considering the security implications (double-tagging VLAN hopping).' }
        ],
        lab: 'access',
        guidedLabs: [
          {
            id: 'gl-vlan-trunk',
            title: { it: 'Quali VLAN passano sul trunk?', en: 'Which VLANs cross the trunk?' },
            difficulty: 'core',
            lab: 'access',
            scenario: {
              it: 'Il laboratorio «Accesso alla rete» copre VLAN, trunk 802.1Q e la matrice di attacchi e difese di livello 2, inclusi i rischi legati alla native VLAN.',
              en: 'The “Network access” lab covers VLANs, 802.1Q trunks and the layer-2 attack-defence matrix, including native-VLAN risks.'
            },
            task: {
              it: 'Dato un trunk con VLAN consentite 10, 20 e native 99, stabilisci quali frame viaggiano taggati e quali no, e cosa accade con un native VLAN mismatch.',
              en: 'Given a trunk with allowed VLANs 10, 20 and native 99, determine which frames travel tagged and which do not, and what happens with a native VLAN mismatch.'
            },
            steps: [
              { it: 'Apri «Accesso alla rete» e individua la sezione su trunk 802.1Q e native VLAN.', en: 'Open “Network access” and find the section on 802.1Q trunks and the native VLAN.' },
              { it: 'Classifica i frame: VLAN 10 e 20 → taggati con il rispettivo VLAN ID; native 99 → non taggato.', en: 'Classify the frames: VLAN 10 and 20 → tagged with their VLAN ID; native 99 → untagged.' },
              { it: 'Ipotizza che il lato remoto abbia native 1 e descrivi la fuga di traffico che ne risulta.', en: 'Assume the remote side has native 1 and describe the resulting traffic leak.' }
            ],
            challenge: {
              it: 'Come mitighi il rischio? Indica due misure sulla native VLAN e sul tagging che eliminano il mismatch e riducono il VLAN hopping.',
              en: 'How do you mitigate the risk? Give two measures on the native VLAN and tagging that eliminate the mismatch and reduce VLAN hopping.'
            },
            solution: [
              { it: 'Sul trunk: i frame di VLAN 10 e 20 sono taggati 802.1Q con VID 10 e 20; i frame della native VLAN 99 viaggiano senza tag. Il ricevente assegna i frame non taggati alla propria native VLAN.', en: 'On the trunk: VLAN 10 and 20 frames are 802.1Q-tagged with VID 10 and 20; native VLAN 99 frames travel untagged. The receiver assigns untagged frames to its own native VLAN.' },
              { it: 'Con native 99 su un lato e 1 sull’altro, i frame non taggati inviati come VLAN 99 vengono interpretati come VLAN 1 (e viceversa): traffico che “scavalca” l’isolamento tra le due VLAN.', en: 'With native 99 on one side and 1 on the other, untagged frames sent as VLAN 99 are interpreted as VLAN 1 (and vice versa): traffic that “jumps” the isolation between the two VLANs.' },
              { it: 'Mitigazione: fissare la stessa native VLAN su entrambi i lati, sceglierla come VLAN inutilizzata e dedicata, e idealmente forzare il tagging di tutte le VLAN sul trunk così nessun frame viaggia senza tag.', en: 'Mitigation: set the same native VLAN on both sides, pick it as an unused dedicated VLAN, and ideally force tagging of all VLANs on the trunk so no frame travels untagged.' }
            ],
            selfCheck: [
              { it: 'So dire, per ogni VLAN del trunk, se i suoi frame sono taggati o no e perché.', en: 'I can say, for each VLAN on the trunk, whether its frames are tagged or not and why.' },
              { it: 'So spiegare la fuga di traffico di un native VLAN mismatch e come eliminarla.', en: 'I can explain the traffic leak of a native VLAN mismatch and how to eliminate it.' }
            ]
          }
        ]
      },
      {
        id: 'stp-loops',
        title: { it: 'Spanning Tree: evitare i loop di livello 2', en: 'Spanning Tree: preventing layer-2 loops' },
        objectives: [
          { it: 'Spiegare perché un loop di livello 2 è catastrofico e come STP costruisce una topologia senza anelli.', en: 'Explain why a layer-2 loop is catastrophic and how STP builds a loop-free topology.' },
          { it: 'Determinare la root bridge e i ruoli delle porte in base a Bridge ID e costo del percorso.', en: 'Determine the root bridge and the port roles based on Bridge ID and path cost.' }
        ],
        prerequisites: [
          { it: 'Conoscere trunk e come gli switch inoltrano e inondano i frame.', en: 'Know trunks and how switches forward and flood frames.' }
        ],
        theory: [
          { it: 'Il frame Ethernet non ha un campo TTL: in una rete commutata con anelli fisici, un broadcast verrebbe inondato all’infinito, moltiplicandosi a ogni giro — una broadcast storm che satura la rete in pochi secondi. Lo Spanning Tree Protocol (IEEE 802.1D) previene i loop bloccando selettivamente alcune porte, così che resti attivo un solo percorso logico tra due punti qualsiasi.', en: 'The Ethernet frame has no TTL field: in a switched network with physical loops, a broadcast would be flooded forever, multiplying on every lap — a broadcast storm that saturates the network in seconds. The Spanning Tree Protocol (IEEE 802.1D) prevents loops by selectively blocking some ports, so only one logical path remains active between any two points.' },
          { it: 'STP elegge prima la root bridge: vince lo switch con il Bridge ID più basso, dato da priorità (multipli di 4096, con l’extended system ID che somma il numero di VLAN) seguita dall’indirizzo MAC. Ogni switch non-root sceglie una root port (la porta col costo di percorso verso la root più basso) e, per ogni segmento, si elegge una designated port; le altre porte vanno in blocco.', en: 'STP first elects the root bridge: the switch with the lowest Bridge ID wins, given by priority (multiples of 4096, with the extended system ID adding the VLAN number) followed by the MAC address. Each non-root switch chooses a root port (the port with the lowest path cost toward the root) and, per segment, a designated port is elected; the other ports are blocked.' },
          { it: 'A parità di costo i criteri sono, in ordine: Bridge ID del mittente più basso, poi Port ID del mittente più basso. Le porte attraversano gli stati blocking → listening → learning → forwarding; RSTP (802.1w) accelera la convergenza con gli stati discarding/learning/forwarding. Su una porta di accesso conviene attivare PortFast (va subito in forwarding) e BPDU Guard (spegne la porta se riceve BPDU, segno di uno switch non autorizzato).', en: 'On a cost tie the criteria are, in order: lowest sender Bridge ID, then lowest sender Port ID. Ports go through the states blocking → listening → learning → forwarding; RSTP (802.1w) speeds up convergence with the discarding/learning/forwarding states. On an access port it is best to enable PortFast (it goes straight to forwarding) and BPDU Guard (it shuts the port down if it receives BPDUs, a sign of an unauthorised switch).' }
        ],
        example: {
          it: 'Con tre switch in anello, STP elegge come root quello con Bridge ID più basso; ogni altro switch tiene una sola root port verso la root e blocca la porta che chiuderebbe l’anello, lasciando una topologia ad albero senza loop. Se un collegamento cade, la porta bloccata può riattivarsi e la rete riconverge.', en: 'With three switches in a ring, STP elects as root the one with the lowest Bridge ID; every other switch keeps a single root port toward the root and blocks the port that would close the ring, leaving a loop-free tree topology. If a link fails, the blocked port can reactivate and the network reconverges.' }
        ,
        commonMistakes: [
          { it: 'Pensare che la root sia lo switch “più potente”: è semplicemente quello con il Bridge ID più basso (priorità, poi MAC). Si controlla abbassando la priorità sullo switch voluto.', en: 'Thinking the root is the “most powerful” switch: it is simply the one with the lowest Bridge ID (priority, then MAC). You control it by lowering the priority on the switch you want.' },
          { it: 'Confondere la priorità configurata con il Bridge ID effettivo: con l’extended system ID la priorità reale include il numero di VLAN e va in multipli di 4096.', en: 'Confusing the configured priority with the effective Bridge ID: with the extended system ID the real priority includes the VLAN number and comes in multiples of 4096.' },
          { it: 'Attivare PortFast su una porta trunk verso un altro switch: va usato solo sulle porte di accesso verso host, altrimenti si rischia proprio il loop che STP deve evitare.', en: 'Enabling PortFast on a trunk port toward another switch: it must be used only on access ports toward hosts, otherwise you risk exactly the loop STP is meant to avoid.' }
        ],
        lab: 'access',
        guidedLabs: [
          {
            id: 'gl-stp-roles',
            title: { it: 'Eleggi la root e assegna i ruoli delle porte', en: 'Elect the root and assign port roles' },
            difficulty: 'advanced',
            lab: 'access',
            scenario: {
              it: 'Il laboratorio «Accesso alla rete» esegue l’algoritmo STP su una maglia di quattro switch con anelli fisici, mostrando root, root port, designated port e il criterio che ha deciso ogni porta, con tabella dei costi short o long.',
              en: 'The “Network access” lab runs the STP algorithm on a four-switch mesh with physical loops, showing the root, root ports, designated ports and the criterion that decided each port, with the short or long cost table.'
            },
            task: {
              it: 'Prevedi quale switch diventa root e, per uno switch non-root, quale porta sarà root port e perché; poi cambia la tabella dei costi da short a long e osserva se la scelta cambia.',
              en: 'Predict which switch becomes root and, for a non-root switch, which port will be the root port and why; then switch the cost table from short to long and observe whether the choice changes.'
            },
            steps: [
              { it: 'Apri «Accesso alla rete» e avvia la convergenza STP sulla maglia di switch.', en: 'Open “Network access” and start STP convergence on the switch mesh.' },
              { it: 'Identifica la root confrontando i Bridge ID (priorità, poi MAC): vince il più basso.', en: 'Identify the root by comparing Bridge IDs (priority, then MAC): the lowest wins.' },
              { it: 'Per uno switch non-root, somma i costi lungo ogni percorso verso la root e scegli la porta col costo totale minore; a parità usa Bridge ID e poi Port ID del mittente.', en: 'For a non-root switch, add the costs along each path to the root and pick the port with the lower total cost; on a tie use the sender Bridge ID then Port ID.' },
              { it: 'Cambia la tabella dei costi (short 802.1D ↔ long 802.1t) e verifica se la root port cambia.', en: 'Switch the cost table (short 802.1D ↔ long 802.1t) and check whether the root port changes.' }
            ],
            challenge: {
              it: 'Vuoi forzare come root un altro switch: quale valore di priorità imposti e perché i multipli di 4096? Che effetto ha sulla scelta delle root port?',
              en: 'You want to force a different switch as root: what priority value do you set and why multiples of 4096? What effect does it have on the root-port choices?'
            },
            solution: [
              { it: 'La root è lo switch con Bridge ID più basso: a parità di priorità decide il MAC più basso. Per uno switch non-root la root port è quella col costo cumulativo verso la root minore; a parità di costo vince il Bridge ID del mittente più basso, poi il Port ID più basso.', en: 'The root is the switch with the lowest Bridge ID: on equal priority the lowest MAC decides. For a non-root switch the root port is the one with the lowest cumulative cost to the root; on a cost tie the lowest sender Bridge ID wins, then the lowest sender Port ID.' },
              { it: 'Cambiando da short a long i costi per porta aumentano (es. 1 Gbps: 4 in short, 20000 in long): i rapporti tra percorsi possono cambiare e quindi anche la root port, se prima due percorsi erano vicini.', en: 'Switching from short to long raises the per-port costs (e.g. 1 Gbps: 4 in short, 20000 in long): the ratios between paths can change and so can the root port, if two paths were previously close.' },
              { it: 'Sfida: per forzare la root si abbassa la priorità (es. a 4096 o 0) sullo switch voluto; la priorità va in multipli di 4096 perché i 12 bit bassi del campo sono occupati dall’extended system ID (il VLAN). Una root diversa ricalcola i costi e può spostare le root port degli altri switch.', en: 'Challenge: to force the root you lower the priority (e.g. to 4096 or 0) on the chosen switch; priority comes in multiples of 4096 because the low 12 bits of the field are taken by the extended system ID (the VLAN). A different root recomputes costs and can move the other switches’ root ports.' }
            ],
            selfCheck: [
              { it: 'So motivare l’elezione della root e ogni ruolo di porta citando il criterio applicato (costo, Bridge ID, Port ID).', en: 'I can justify the root election and each port role by citing the criterion applied (cost, Bridge ID, Port ID).' },
              { it: 'Le mie previsioni coincidono con i ruoli e i criteri mostrati dal laboratorio, in short e in long.', en: 'My predictions match the roles and criteria shown by the lab, in both short and long.' }
            ]
          }
        ]
      }
    ]
  }
];

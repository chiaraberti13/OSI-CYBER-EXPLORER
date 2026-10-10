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
  }
];

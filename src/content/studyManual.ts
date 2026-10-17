/**
 * @license
 * SPDX-License-Identifier: GPL-3.0-only
 */

import type { AppView } from '../store';
import type { Bilingual } from '../types';
import type { ManualDiagramId } from './manualDiagrams';
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
/** `both` means CCNA + Security+, not CCNA + eJPT. */
export type ManualCert = 'ccna' | 'securityplus' | 'both' | 'ejpt';

/**
 * The two learner-facing study routes. The CCNA route carries the CCNA 200-301 backbone
 * together with the Security+/advanced defensive extension (both are the "blue" study
 * path); eJPT is the dedicated offensive route. This is deliberately binary — the two
 * certification objectives — and is separate from the CCNA-blueprint alignment on a
 * chapter (`track: 'ccna' | 'extension'`), which still drives domain mapping.
 */
export type ManualCertificationTrack = 'ccna' | 'ejpt';

/** Stable route order and shared bilingual labels for indexes, filters and progress. */
export const MANUAL_CERTIFICATION_TRACKS: readonly {
  id: ManualCertificationTrack;
  title: Bilingual;
}[] = [
  { id: 'ccna', title: { it: 'Percorso CCNA', en: 'CCNA path' } },
  { id: 'ejpt', title: { it: 'eJPT', en: 'eJPT' } }
];

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
  /** Optional bilingual visual explanation, rendered after the theory. */
  diagram?: ManualDiagramId;
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
  /**
   * Alignment to the CCNA 200-301 v1.1 blueprint: `ccna` for a backbone chapter that
   * maps to an official domain, `extension` for content declared beyond the blueprint
   * (advanced networking or CompTIA Security+ SY0-701).
   */
  track: 'ccna' | 'extension';
  /**
   * For `ccna` chapters, the `CCNA_DOMAINS` id (src/content/ccna.ts) this chapter maps
   * to. Omitted for `extension` chapters. The pairing is validated in content.test.ts.
   */
  domain?: string;
  title: Bilingual;
  summary: Bilingual;
  topics: ManualTopic[];
}

export const STUDY_MANUAL: readonly ManualChapter[] = [
  {
    id: 'osi-model',
    cert: 'both',
    order: 1,
    track: 'ccna',
    domain: 'network-fundamentals',
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
          {
            it: 'Spiegare perché una rete viene descritta a livelli e quale problema risolve la stratificazione.',
            en: 'Explain why a network is described in layers and what problem layering solves.'
          },
          {
            it: 'Elencare i sette livelli OSI nell’ordine corretto, dal basso verso l’alto.',
            en: 'List the seven OSI layers in the correct order, from the bottom up.'
          }
        ],
        prerequisites: [
          {
            it: 'Sapere, a grandi linee, che cos’è una rete e che due dispositivi si scambiano messaggi.',
            en: 'A rough idea of what a network is and that two devices exchange messages.'
          }
        ],
        theory: [
          {
            it: 'Il modello OSI (Open Systems Interconnection, standard ISO/IEC 7498-1) è un modello di riferimento: non è il software che gira davvero, ma una mappa condivisa che divide la comunicazione di rete in sette livelli. Ogni livello ha un compito preciso e offre un servizio al livello superiore, nascondendogli i dettagli di come quel servizio viene realizzato.',
            en: 'The OSI model (Open Systems Interconnection, ISO/IEC 7498-1) is a reference model: it is not the software that actually runs, but a shared map that splits network communication into seven layers. Each layer has one job and offers a service to the layer above it, hiding the details of how that service is delivered.'
          },
          {
            it: 'La stratificazione serve a dominare la complessità. Un problema enorme — “far arrivare questo messaggio a quel computer dall’altra parte del mondo” — viene spezzato in problemi piccoli e indipendenti: come rappresentare i bit sul cavo, come consegnare un frame nella rete locale, come instradare tra reti diverse, come garantire che nulla vada perso. Si può cambiare la tecnologia di un livello (dal rame alla fibra, dall’Ethernet al Wi-Fi) senza riscrivere gli altri.',
            en: 'Layering exists to tame complexity. One huge problem — “get this message to that computer on the other side of the world” — is broken into small, independent ones: how to represent bits on the wire, how to deliver a frame on the local network, how to route between different networks, how to make sure nothing is lost. You can change one layer’s technology (copper to fibre, Ethernet to Wi-Fi) without rewriting the others.'
          },
          {
            it: 'Dal basso verso l’alto i sette livelli sono: 1 Fisico, 2 Collegamento dati (Data Link), 3 Rete, 4 Trasporto, 5 Sessione, 6 Presentazione, 7 Applicazione. Un mnemonico diffuso in inglese è “Please Do Not Throw Sausage Pizza Away”. I livelli 1–4 sono quelli su cui un tecnico di rete lavora ogni giorno; i livelli 5–7 descrivono funzioni che oggi vivono soprattutto dentro le applicazioni.',
            en: 'From the bottom up the seven layers are: 1 Physical, 2 Data Link, 3 Network, 4 Transport, 5 Session, 6 Presentation, 7 Application. A common mnemonic is “Please Do Not Throw Sausage Pizza Away”. Layers 1–4 are the ones a network technician works with every day; layers 5–7 describe functions that today live mostly inside applications.'
          }
        ],
        example: {
          it: 'Quando apri un sito, il browser (L7) produce una richiesta; questa viene affidata al trasporto (L4) che la numera e la rende affidabile con TCP, al livello rete (L3) che le dà un indirizzo IP di destinazione, al collegamento dati (L2) che la consegna al primo apparato, e al livello fisico (L1) che la trasmette come segnale. Nessuno di questi livelli ha bisogno di sapere come lavorano gli altri.',
          en: 'When you open a website, the browser (L7) produces a request; it is handed to transport (L4) which numbers it and makes it reliable with TCP, to the network layer (L3) which gives it a destination IP address, to data link (L2) which delivers it to the first device, and to the physical layer (L1) which transmits it as a signal. None of these layers needs to know how the others work.'
        },
        commonMistakes: [
          {
            it: 'Confondere il modello OSI con ciò che gira davvero: Internet usa lo stack TCP/IP; OSI è la mappa concettuale con cui lo descriviamo e lo confrontiamo.',
            en: 'Confusing the OSI model with what actually runs: the Internet uses the TCP/IP stack; OSI is the conceptual map we use to describe and compare it.'
          },
          {
            it: 'Invertire l’ordine o la numerazione dei livelli. Il livello 1 è il Fisico (in basso), il livello 7 è l’Applicazione (in alto): i dati “scendono” nel mittente e “salgono” nel destinatario.',
            en: 'Flipping the order or numbering of the layers. Layer 1 is Physical (bottom), layer 7 is Application (top): data goes “down” the sender and “up” the receiver.'
          }
        ],
        lab: 'osi',
        references: [{ kind: 'rfc', id: 'RFC 1122' }]
      },
      {
        id: 'osi-seven-layers',
        title: { it: 'I sette livelli e le loro funzioni', en: 'The seven layers and what they do' },
        objectives: [
          {
            it: 'Associare a ciascun livello la sua funzione principale e un esempio di protocollo o tecnologia.',
            en: 'Match each layer to its main function and an example protocol or technology.'
          },
          {
            it: 'Riconoscere a quale livello opera un dispositivo di rete (hub, switch, router).',
            en: 'Recognise which layer a network device operates at (hub, switch, router).'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere l’ordine e la numerazione dei sette livelli.',
            en: 'Know the order and numbering of the seven layers.'
          }
        ],
        theory: [
          {
            it: 'Livello 1 — Fisico: trasmette i bit come segnali (elettrici, ottici, radio) sul mezzo. Qui vivono cavi, connettori, pin, codifiche di linea e l’hub, che ripete semplicemente il segnale su tutte le porte.',
            en: 'Layer 1 — Physical: transmits bits as signals (electrical, optical, radio) over the medium. Cables, connectors, pinouts, line coding and the hub — which simply repeats the signal out of every port — live here.'
          },
          {
            it: 'Livello 2 — Collegamento dati: consegna i frame all’interno di una stessa rete locale usando indirizzi MAC, rileva gli errori con l’FCS e governa l’accesso al mezzo. È il livello dello switch, che impara i MAC e inoltra solo sulla porta giusta, delle VLAN e dello Spanning Tree.',
            en: 'Layer 2 — Data Link: delivers frames within a single local network using MAC addresses, detects errors with the FCS, and governs access to the medium. It is the layer of the switch — which learns MACs and forwards only out of the right port — of VLANs, and of Spanning Tree.'
          },
          {
            it: 'Livello 3 — Rete: instrada i pacchetti tra reti diverse usando indirizzi logici (IP) e decide il percorso migliore. È il livello del router, del longest-prefix match e dei protocolli di routing come OSPF.',
            en: 'Layer 3 — Network: routes packets between different networks using logical (IP) addresses and chooses the best path. It is the layer of the router, of longest-prefix match, and of routing protocols such as OSPF.'
          },
          {
            it: 'Livello 4 — Trasporto: gestisce la comunicazione fra processi tramite le porte. TCP offre una consegna affidabile e ordinata con handshake e controllo di flusso; UDP è leggero e senza connessione. È qui che vivono i numeri di porta (es. 443, 53).',
            en: 'Layer 4 — Transport: handles process-to-process communication through ports. TCP provides reliable, ordered delivery with a handshake and flow control; UDP is lightweight and connectionless. This is where port numbers (e.g. 443, 53) live.'
          },
          {
            it: 'Livelli 5–7 — Sessione, Presentazione, Applicazione: aprono e mantengono i dialoghi (sessione), traducono e cifrano/comprimono i dati — la crittografia TLS è associata logicamente alla presentazione — (presentazione) ed espongono i servizi all’utente come HTTP, DNS o SMTP (applicazione). Nello stack reale queste tre funzioni sono spesso svolte insieme dall’applicazione.',
            en: 'Layers 5–7 — Session, Presentation, Application: open and maintain dialogues (session), translate and encrypt/compress data — TLS encryption is logically associated with presentation — (presentation), and expose services to the user such as HTTP, DNS or SMTP (application). In the real stack these three functions are often handled together by the application.'
          }
        ],
        example: {
          it: 'Uno switch legge l’indirizzo MAC di destinazione (L2) e inoltra il frame sulla porta giusta; un router guarda l’indirizzo IP di destinazione (L3) e sceglie il prossimo salto. Lo stesso pacchetto, salendo e scendendo la rete, viene letto a livelli diversi da dispositivi diversi.',
          en: 'A switch reads the destination MAC address (L2) and forwards the frame out of the right port; a router looks at the destination IP address (L3) and chooses the next hop. The same packet, moving up and down the network, is read at different layers by different devices.'
        },
        commonMistakes: [
          {
            it: 'Pensare che lo switch lavori con gli indirizzi IP: lo switch tradizionale è un dispositivo di livello 2 e ragiona sui MAC. È il router a lavorare con gli IP a livello 3.',
            en: 'Thinking a switch works with IP addresses: a traditional switch is a layer-2 device and reasons about MACs. It is the router that works with IPs at layer 3.'
          },
          {
            it: 'Collocare TLS/HTTPS a un solo livello: la cifratura appartiene concettualmente alla presentazione (L6), ma TCP sotto di essa è L4 — per questo spesso si dice “HTTPS sta sopra TCP 443”.',
            en: 'Placing TLS/HTTPS at a single layer: encryption conceptually belongs to presentation (L6), but the TCP beneath it is L4 — which is why people say “HTTPS runs over TCP 443”.'
          }
        ],
        lab: 'ports',
        references: [{ kind: 'cisco', id: 'Cisco OSI reference model' }],
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
              {
                it: 'Apri il laboratorio “Porte & Protocolli” e vai alla sezione dei dispositivi.',
                en: 'Open the “Ports & Protocols” lab and go to the devices section.'
              },
              {
                it: 'Per ogni dispositivo chiediti: su quale informazione prende le decisioni? Segnale grezzo, indirizzo MAC o indirizzo IP?',
                en: 'For each device ask: what information does it make decisions on? Raw signal, MAC address, or IP address?'
              },
              {
                it: 'Associa quell’informazione al livello: segnale → L1, MAC → L2, IP → L3.',
                en: 'Map that information to a layer: signal → L1, MAC → L2, IP → L3.'
              }
            ],
            challenge: {
              it: 'Aggiungi al ragionamento un firewall stateful e un access point wireless: a quali livelli operano e perché possono coprirne più di uno?',
              en: 'Extend the reasoning to a stateful firewall and a wireless access point: which layers do they operate at, and why can each span more than one?'
            },
            solution: [
              {
                it: 'Hub → Livello 1 (Fisico): ripete il segnale elettrico su tutte le porte, senza leggere alcun indirizzo.',
                en: 'Hub → Layer 1 (Physical): repeats the electrical signal out of every port, without reading any address.'
              },
              {
                it: 'Switch → Livello 2 (Collegamento dati): inoltra i frame in base all’indirizzo MAC di destinazione, che impara popolando la tabella CAM.',
                en: 'Switch → Layer 2 (Data Link): forwards frames based on the destination MAC address, which it learns by populating the CAM table.'
              },
              {
                it: 'Router → Livello 3 (Rete): instrada i pacchetti tra reti diverse in base all’indirizzo IP di destinazione e alla tabella di routing.',
                en: 'Router → Layer 3 (Network): routes packets between different networks based on the destination IP address and the routing table.'
              },
              {
                it: 'Sfida: un firewall stateful ispeziona fino a L4 (e, se applicativo, fino a L7); un access point unisce L1 (radio) e L2 (frame 802.11), per questo si dice che “coprono” più livelli.',
                en: 'Challenge: a stateful firewall inspects up to L4 (and, if application-aware, up to L7); an access point combines L1 (radio) and L2 (802.11 frames), which is why they are said to “span” multiple layers.'
              }
            ],
            selfCheck: [
              {
                it: 'So giustificare ogni risposta citando l’informazione su cui il dispositivo decide, non solo il nome del livello.',
                en: 'I can justify each answer by citing the information the device decides on, not just the layer name.'
              },
              {
                it: 'La mia classificazione coincide con quella mostrata nel catalogo dei dispositivi.',
                en: 'My classification matches the one shown in the device catalogue.'
              }
            ]
          }
        ]
      },
      {
        diagram: 'encapsulation',
        id: 'osi-encapsulation',
        title: { it: 'Incapsulamento e decapsulamento', en: 'Encapsulation and decapsulation' },
        objectives: [
          {
            it: 'Descrivere come i dati vengono imbustati scendendo lo stack e sbustati salendo.',
            en: 'Describe how data is wrapped going down the stack and unwrapped going up.'
          },
          {
            it: 'Nominare la PDU corretta a ciascun livello (dati, segmento/datagramma, pacchetto, frame, bit).',
            en: 'Name the correct PDU at each layer (data, segment/datagram, packet, frame, bits).'
          }
        ],
        prerequisites: [{ it: 'Conoscere la funzione dei livelli 1–4.', en: 'Know the function of layers 1–4.' }],
        theory: [
          {
            it: 'Incapsulamento è il processo con cui ogni livello, scendendo, aggiunge le proprie informazioni di controllo (header, e al livello 2 anche un trailer) ai dati ricevuti dal livello superiore. Il risultato è l’unità dati di protocollo, o PDU, di quel livello.',
            en: 'Encapsulation is the process by which each layer, going down, adds its own control information (a header, and at layer 2 also a trailer) to the data received from the layer above. The result is that layer’s protocol data unit, or PDU.'
          },
          {
            it: 'I nomi delle PDU sono un classico d’esame: al livello 7–5 si parla genericamente di dati; al livello 4 di segmento (TCP) o datagramma (UDP); al livello 3 di pacchetto; al livello 2 di frame; al livello 1 di bit. Ricordali con la frase “Do Some People Fear Birthdays”? No: Dati, Segmento, Pacchetto, Frame, Bit.',
            en: 'PDU names are a classic exam point: at layers 7–5 we speak generically of data; at layer 4 of a segment (TCP) or datagram (UDP); at layer 3 of a packet; at layer 2 of a frame; at layer 1 of bits. Remember the sequence Data, Segment, Packet, Frame, Bits.'
          },
          {
            it: 'Nel destinatario avviene il processo inverso, il decapsulamento: ogni livello rimuove e interpreta il proprio header, poi consegna il contenuto al livello superiore. Lo switch intermedio lavora sul frame (L2), il router sul pacchetto (L3): ogni apparato “apre la busta” solo fino al livello che gli compete.',
            en: 'At the receiver the reverse process, decapsulation, takes place: each layer removes and interprets its own header, then hands the payload to the layer above. An intermediate switch works on the frame (L2), a router on the packet (L3): each device “opens the envelope” only as far as the layer it is responsible for.'
          }
        ],
        example: {
          it: 'Una richiesta HTTP diventa: [dati HTTP] → [header TCP | dati] segmento → [header IP | header TCP | dati] pacchetto → [header Ethernet | pacchetto | FCS] frame → bit sul cavo. A destinazione il server toglie una busta per volta fino a ritrovare la richiesta HTTP originale.',
          en: 'An HTTP request becomes: [HTTP data] → [TCP header | data] segment → [IP header | TCP header | data] packet → [Ethernet header | packet | FCS] frame → bits on the wire. At the destination the server removes one envelope at a time until it recovers the original HTTP request.'
        },
        commonMistakes: [
          {
            it: 'Chiamare “pacchetto” qualsiasi cosa: a livello 4 è un segmento/datagramma, a livello 2 un frame. Il termine preciso dipende dal livello.',
            en: 'Calling everything a “packet”: at layer 4 it is a segment/datagram, at layer 2 a frame. The precise term depends on the layer.'
          },
          {
            it: 'Dimenticare che il livello 2 aggiunge anche un trailer (l’FCS per il controllo d’errore), non solo un header.',
            en: 'Forgetting that layer 2 also adds a trailer (the FCS for error checking), not just a header.'
          },
          {
            it: 'Credere che ogni apparato lungo il percorso legga tutti i livelli: uno switch non guarda l’header IP, un router non riscrive il payload applicativo.',
            en: 'Believing every device along the path reads all layers: a switch does not look at the IP header, a router does not rewrite the application payload.'
          }
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
              {
                it: 'Apri “Pila OSI”, scegli un protocollo applicativo (es. HTTP) e avvia la simulazione.',
                en: 'Open “OSI stack”, choose an application protocol (e.g. HTTP) and start the simulation.'
              },
              {
                it: 'A ogni passo osserva quale livello è attivo e quale header compare nell’ispettore dei pacchetti.',
                en: 'At each step observe which layer is active and which header appears in the packet inspector.'
              },
              {
                it: 'Compila la sequenza: L4 segmento (header TCP) → L3 pacchetto (header IP) → L2 frame (header Ethernet + FCS) → L1 bit.',
                en: 'Fill in the sequence: L4 segment (TCP header) → L3 packet (IP header) → L2 frame (Ethernet header + FCS) → L1 bits.'
              }
            ],
            challenge: {
              it: 'Ripeti con un protocollo su UDP (es. DNS): che cosa cambia nella PDU di livello 4 e perché non c’è l’handshake?',
              en: 'Repeat with a protocol over UDP (e.g. DNS): what changes in the layer-4 PDU, and why is there no handshake?'
            },
            solution: [
              {
                it: 'Partendo dai dati applicativi, il livello 4 crea un segmento aggiungendo l’header TCP (porte, numeri di sequenza); il livello 3 crea un pacchetto aggiungendo l’header IP (indirizzi sorgente/destinazione); il livello 2 crea un frame aggiungendo l’header Ethernet (MAC) e il trailer FCS; il livello 1 trasmette i bit.',
                en: 'Starting from application data, layer 4 builds a segment by adding the TCP header (ports, sequence numbers); layer 3 builds a packet by adding the IP header (source/destination addresses); layer 2 builds a frame by adding the Ethernet header (MACs) and the FCS trailer; layer 1 transmits the bits.'
              },
              {
                it: 'Sfida (UDP): a livello 4 la PDU è un datagramma con un header UDP minimale (8 byte, senza numeri di sequenza né handshake). UDP è senza connessione: non stabilisce uno stato prima di inviare, quindi è più veloce ma non garantisce consegna né ordine.',
                en: 'Challenge (UDP): at layer 4 the PDU is a datagram with a minimal UDP header (8 bytes, no sequence numbers or handshake). UDP is connectionless: it establishes no state before sending, so it is faster but guarantees neither delivery nor order.'
              }
            ],
            selfCheck: [
              {
                it: 'So riprodurre a memoria la sequenza Dati → Segmento → Pacchetto → Frame → Bit con l’header aggiunto a ogni livello.',
                en: 'I can reproduce from memory the sequence Data → Segment → Packet → Frame → Bits with the header added at each layer.'
              },
              {
                it: 'So spiegare perché un datagramma UDP non ha handshake e quali conseguenze ha sull’affidabilità.',
                en: 'I can explain why a UDP datagram has no handshake and what that means for reliability.'
              }
            ]
          }
        ]
      },
      {
        id: 'osi-vs-tcpip',
        title: { it: 'OSI e TCP/IP a confronto', en: 'OSI versus TCP/IP' },
        objectives: [
          {
            it: 'Mappare i sette livelli OSI sui quattro livelli del modello TCP/IP.',
            en: 'Map the seven OSI layers onto the four layers of the TCP/IP model.'
          },
          {
            it: 'Spiegare perché in pratica si usa TCP/IP mentre OSI resta un riferimento didattico e diagnostico.',
            en: 'Explain why TCP/IP is used in practice while OSI remains a teaching and troubleshooting reference.'
          }
        ],
        prerequisites: [
          { it: 'Conoscere le funzioni dei sette livelli OSI.', en: 'Know the functions of the seven OSI layers.' }
        ],
        theory: [
          {
            it: 'Il modello TCP/IP (descritto nella RFC 1122) ha quattro livelli: Accesso alla rete, Internet, Trasporto e Applicazione. È il modello che le reti reali implementano davvero, perché nasce dai protocolli effettivamente usati su Internet.',
            en: 'The TCP/IP model (described in RFC 1122) has four layers: Network Access, Internet, Transport and Application. It is the model that real networks actually implement, because it grew out of the protocols actually used on the Internet.'
          },
          {
            it: 'La corrispondenza con OSI è diretta: Accesso alla rete copre i livelli OSI 1–2; Internet corrisponde al livello 3 (IP); Trasporto corrisponde al livello 4 (TCP/UDP); Applicazione riunisce i livelli OSI 5–7. Molti testi usano una variante a cinque livelli che tiene separati Fisico e Collegamento dati.',
            en: 'The mapping to OSI is direct: Network Access covers OSI layers 1–2; Internet corresponds to layer 3 (IP); Transport corresponds to layer 4 (TCP/UDP); Application merges OSI layers 5–7. Many texts use a five-layer variant that keeps Physical and Data Link separate.'
          },
          {
            it: 'Perché studiare entrambi? TCP/IP descrive la realtà; OSI dà un vocabolario preciso per isolare i problemi (“è un problema di livello 1 o di livello 3?”) e per confrontare tecnologie diverse. Nel troubleshooting si ragiona spesso “a livelli”, salendo dal fisico verso l’applicazione.',
            en: 'Why study both? TCP/IP describes reality; OSI gives a precise vocabulary for isolating problems (“is this a layer-1 or a layer-3 issue?”) and for comparing different technologies. Troubleshooting is often done “by layers”, working up from physical toward application.'
          }
        ],
        example: {
          it: 'Un cavo scollegato è un problema di livello 1; un indirizzo IP o un gateway sbagliato è di livello 3; una porta chiusa dal firewall è di livello 4. Dare un nome al livello giusto indirizza subito la diagnosi.',
          en: 'An unplugged cable is a layer-1 problem; a wrong IP address or gateway is layer 3; a port closed by the firewall is layer 4. Naming the right layer immediately focuses the diagnosis.'
        },
        commonMistakes: [
          {
            it: 'Cercare un livello “Sessione” o “Presentazione” separato in TCP/IP: lì sono assorbiti nel livello Applicazione.',
            en: 'Looking for a separate “Session” or “Presentation” layer in TCP/IP: there they are absorbed into the Application layer.'
          },
          {
            it: 'Trattare OSI come un protocollo da configurare: è un modello di riferimento, non qualcosa che “gira” sugli apparati.',
            en: 'Treating OSI as a protocol to configure: it is a reference model, not something that “runs” on devices.'
          }
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
    track: 'ccna',
    domain: 'network-fundamentals',
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
          {
            it: 'Descrivere i campi principali di un frame Ethernet II e il ruolo dell’FCS.',
            en: 'Describe the main fields of an Ethernet II frame and the role of the FCS.'
          },
          {
            it: 'Riconoscere struttura e tipi di indirizzo MAC: unicast, broadcast e la parte OUI.',
            en: 'Recognise the structure and types of MAC address: unicast, broadcast, and the OUI portion.'
          }
        ],
        prerequisites: [
          {
            it: 'Sapere che il livello 2 consegna i frame nella rete locale (vedi capitolo sul modello OSI).',
            en: 'Know that layer 2 delivers frames within the local network (see the OSI model chapter).'
          }
        ],
        theory: [
          {
            it: 'Un frame Ethernet II trasporta, nell’ordine: l’indirizzo MAC di destinazione (6 byte), l’indirizzo MAC sorgente (6 byte), un campo EtherType (2 byte) che indica il protocollo del payload — ad esempio 0x0800 per IPv4, 0x0806 per ARP, 0x86DD per IPv6 — poi il payload (da 46 a 1500 byte) e infine l’FCS (4 byte), il trailer di controllo d’errore.',
            en: 'An Ethernet II frame carries, in order: the destination MAC address (6 bytes), the source MAC address (6 bytes), an EtherType field (2 bytes) that names the payload protocol — for example 0x0800 for IPv4, 0x0806 for ARP, 0x86DD for IPv6 — then the payload (46 to 1500 bytes) and finally the FCS (4 bytes), the error-check trailer.'
          },
          {
            it: 'L’indirizzo MAC è lungo 48 bit (6 byte), scritto in esadecimale, es. 00:1A:2B:3C:4D:5E. I primi 24 bit sono l’OUI (Organizationally Unique Identifier) assegnato al produttore; i restanti 24 identificano la singola scheda. L’indirizzo di broadcast è FF:FF:FF:FF:FF:FF: un frame con quella destinazione è destinato a tutti gli host del dominio di broadcast.',
            en: 'A MAC address is 48 bits (6 bytes) long, written in hexadecimal, e.g. 00:1A:2B:3C:4D:5E. The first 24 bits are the OUI (Organizationally Unique Identifier) assigned to the vendor; the remaining 24 identify the individual card. The broadcast address is FF:FF:FF:FF:FF:FF: a frame with that destination is meant for every host in the broadcast domain.'
          },
          {
            it: 'L’FCS contiene un CRC calcolato sul frame: il ricevente lo ricalcola e, se non corrisponde, scarta il frame silenziosamente. Ethernet non ritrasmette: il recupero dell’errore, se serve, è compito dei livelli superiori come TCP.',
            en: 'The FCS holds a CRC computed over the frame: the receiver recomputes it and, if it does not match, silently discards the frame. Ethernet does not retransmit: error recovery, when needed, is the job of higher layers such as TCP.'
          }
        ],
        example: {
          it: 'Un payload IPv4 viaggia in un frame con EtherType 0x0800; una richiesta ARP nello stesso segmento usa EtherType 0x0806 e destinazione broadcast FF:FF:FF:FF:FF:FF, perché chiede “chi ha questo IP?” a tutti.',
          en: 'An IPv4 payload travels in a frame with EtherType 0x0800; an ARP request on the same segment uses EtherType 0x0806 and the broadcast destination FF:FF:FF:FF:FF:FF, because it asks “who has this IP?” of everyone.'
        },
        commonMistakes: [
          {
            it: 'Confondere indirizzo MAC e indirizzo IP: il MAC è fisico e locale al segmento (L2), l’IP è logico e instradabile tra reti (L3).',
            en: 'Confusing MAC and IP addresses: the MAC is physical and local to the segment (L2), the IP is logical and routable between networks (L3).'
          },
          {
            it: 'Pensare che Ethernet garantisca la consegna: l’FCS rileva gli errori e fa scartare il frame, ma non lo ritrasmette.',
            en: 'Thinking Ethernet guarantees delivery: the FCS detects errors and causes the frame to be dropped, but it does not retransmit it.'
          }
        ],
        lab: 'fundamentals',
        references: [{ kind: 'ieee', id: 'IEEE 802.3' }]
      },
      {
        id: 'switch-cam-learning',
        title: { it: 'Come lo switch impara: la tabella CAM', en: 'How a switch learns: the CAM table' },
        objectives: [
          {
            it: 'Spiegare come lo switch popola la tabella CAM e come decide forwarding, flooding e filtering.',
            en: 'Explain how a switch populates the CAM table and how it decides forwarding, flooding, and filtering.'
          },
          {
            it: 'Prevedere il comportamento con unknown unicast, broadcast e aging della tabella.',
            en: 'Predict the behaviour with unknown unicast, broadcast, and table aging.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere la struttura del frame Ethernet e l’indirizzo MAC.',
            en: 'Know the structure of the Ethernet frame and the MAC address.'
          }
        ],
        theory: [
          {
            it: 'Lo switch impara osservando l’indirizzo MAC *sorgente* dei frame in ingresso: associa quel MAC alla porta da cui è arrivato e lo registra nella tabella CAM (in IOS, la MAC address-table), insieme alla VLAN. È un apprendimento passivo e continuo.',
            en: 'A switch learns by observing the *source* MAC address of incoming frames: it associates that MAC with the port it arrived on and records it in the CAM table (in IOS, the MAC address-table), together with the VLAN. The learning is passive and continuous.'
          },
          {
            it: 'Per inoltrare, lo switch guarda il MAC di *destinazione*: se è noto in tabella, invia il frame solo sulla porta giusta (forwarding); se non è noto (unknown unicast) o è un broadcast/multicast, lo inonda su tutte le porte della VLAN tranne quella di ingresso (flooding); se destinazione e sorgente sono sulla stessa porta, non lo inoltra (filtering).',
            en: 'To forward, the switch looks at the *destination* MAC: if it is known in the table, it sends the frame only out of the correct port (forwarding); if it is unknown (unknown unicast) or is a broadcast/multicast, it floods it out of every port in the VLAN except the ingress port (flooding); if the destination and source are on the same port, it does not forward it (filtering).'
          },
          {
            it: 'Le voci apprese dinamicamente scadono dopo un tempo di inattività (per default 300 secondi su IOS): se da quel MAC non arrivano più frame, la voce viene rimossa. L’aging misura l’inattività, non l’età assoluta della voce.',
            en: 'Dynamically learned entries expire after an idle time (300 seconds by default on IOS): if no more frames arrive from that MAC, the entry is removed. Aging measures inactivity, not the absolute age of the entry.'
          }
        ],
        example: {
          it: 'Il primo frame verso un host mai sentito prima viene inondato su tutta la VLAN (unknown unicast): non è un broadcast, ma si comporta come tale finché lo switch non impara dove si trova quell’host dalla sua risposta.',
          en: 'The first frame toward a host never heard from before is flooded across the whole VLAN (unknown unicast): it is not a broadcast, but behaves like one until the switch learns where that host is from its reply.'
        },
        commonMistakes: [
          {
            it: 'Credere che lo switch impari dall’indirizzo di destinazione: impara dalla *sorgente*, e usa la destinazione solo per decidere dove inoltrare.',
            en: 'Believing the switch learns from the destination address: it learns from the *source*, and uses the destination only to decide where to forward.'
          },
          {
            it: 'Confondere unknown unicast e broadcast: il primo viene inondato per necessità (manca la voce in CAM), il secondo per definizione (destinazione a tutti).',
            en: 'Confusing unknown unicast and broadcast: the first is flooded out of necessity (no CAM entry), the second by definition (destined to everyone).'
          },
          {
            it: 'Pensare che l’aging scatti a tempo fisso: riparte ogni volta che arriva traffico da quel MAC.',
            en: 'Thinking aging fires on a fixed timer: it restarts every time traffic arrives from that MAC.'
          }
        ],
        lab: 'access',
        references: [{ kind: 'ieee', id: 'IEEE 802.1D' }],
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
              {
                it: 'Apri “Accesso alla rete” e avvia l’esercitazione sulla CAM table.',
                en: 'Open “Network access” and start the CAM-table exercise.'
              },
              {
                it: 'Per ogni frame guarda prima il MAC sorgente (cosa impara lo switch) e poi il MAC destinazione (come decide).',
                en: 'For each frame look first at the source MAC (what the switch learns) and then at the destination MAC (how it decides).'
              },
              {
                it: 'Classifica la decisione: destinazione nota → forwarding; sconosciuta o broadcast → flooding; stessa porta della sorgente → filtering.',
                en: 'Classify the decision: destination known → forwarding; unknown or broadcast → flooding; same port as the source → filtering.'
              }
            ],
            challenge: {
              it: 'Introduci uno spostamento di MAC (lo stesso host appare su una porta diversa) e un’attesa oltre l’aging: come cambiano le voci in tabella e le decisioni successive?',
              en: 'Introduce a MAC move (the same host appears on a different port) and a wait beyond the aging time: how do the table entries and later decisions change?'
            },
            solution: [
              {
                it: 'Ogni frame prima aggiorna la CAM con la coppia (MAC sorgente, porta, VLAN), poi la decisione dipende dalla destinazione: nota → una sola porta (forwarding); unknown unicast o broadcast → tutte le porte della VLAN tranne l’ingresso (flooding); destinazione sulla stessa porta della sorgente → scartato (filtering).',
                en: 'Each frame first updates the CAM with the (source MAC, port, VLAN) tuple, then the decision depends on the destination: known → a single port (forwarding); unknown unicast or broadcast → every port in the VLAN except the ingress (flooding); destination on the same port as the source → dropped (filtering).'
              },
              {
                it: 'Sfida: uno spostamento di MAC riscrive la porta associata a quel MAC (lo switch “segue” l’host); superato l’aging per inattività, la voce sparisce e il successivo frame verso quell’host torna a essere un unknown unicast inondato.',
                en: 'Challenge: a MAC move rewrites the port associated with that MAC (the switch “follows” the host); once the idle aging elapses, the entry disappears and the next frame toward that host becomes a flooded unknown unicast again.'
              }
            ],
            selfCheck: [
              {
                it: 'So indicare, per ogni frame, sia cosa lo switch ha imparato sia perché ha inoltrato, inondato o filtrato.',
                en: 'I can state, for each frame, both what the switch learned and why it forwarded, flooded, or filtered.'
              },
              {
                it: 'Le mie previsioni coincidono con gli esiti etichettati nell’esercitazione.',
                en: 'My predictions match the labelled outcomes in the exercise.'
              }
            ]
          }
        ]
      },
      {
        id: 'collision-broadcast-domains',
        title: { it: 'Domini di collisione e di broadcast', en: 'Collision and broadcast domains' },
        objectives: [
          {
            it: 'Distinguere un dominio di collisione da un dominio di broadcast e dire quale dispositivo delimita ciascuno.',
            en: 'Distinguish a collision domain from a broadcast domain and say which device bounds each.'
          },
          {
            it: 'Spiegare perché hub, switch e router hanno effetti diversi sulla segmentazione.',
            en: 'Explain why hubs, switches, and routers have different effects on segmentation.'
          }
        ],
        prerequisites: [
          { it: 'Sapere come lo switch inoltra e inonda i frame.', en: 'Know how a switch forwards and floods frames.' }
        ],
        theory: [
          {
            it: 'Un dominio di collisione è l’insieme di dispositivi che condividono lo stesso mezzo e possono quindi “collidere” se trasmettono insieme. Un hub crea un unico grande dominio di collisione, half-duplex, governato da CSMA/CD. Ogni porta di uno switch, invece, è un dominio di collisione separato e in full-duplex le collisioni spariscono del tutto.',
            en: 'A collision domain is the set of devices that share the same medium and can therefore “collide” if they transmit at once. A hub creates one large collision domain, half-duplex, governed by CSMA/CD. Each switch port, by contrast, is a separate collision domain, and in full-duplex collisions disappear entirely.'
          },
          {
            it: 'Un dominio di broadcast è l’insieme di dispositivi che ricevono un frame di broadcast di livello 2. Uno switch, da solo, propaga i broadcast su tutte le sue porte: tutte appartengono allo stesso dominio di broadcast, a meno di suddividerlo in VLAN. È il router (o una SVI di livello 3) a delimitare i domini di broadcast, perché non inoltra i broadcast di livello 2.',
            en: 'A broadcast domain is the set of devices that receive a layer-2 broadcast frame. A switch on its own propagates broadcasts out of all its ports: they all belong to the same broadcast domain, unless it is split into VLANs. It is the router (or a layer-3 SVI) that bounds broadcast domains, because it does not forward layer-2 broadcasts.'
          },
          {
            it: 'In sintesi: lo switch aumenta il numero di domini di collisione (uno per porta) ma non quello di broadcast; le VLAN suddividono un dominio di broadcast in più domini logici; il router separa i domini di broadcast e instrada tra loro.',
            en: 'In short: a switch increases the number of collision domains (one per port) but not of broadcast domains; VLANs split one broadcast domain into several logical ones; the router separates broadcast domains and routes between them.'
          }
        ],
        example: {
          it: 'Dieci PC su un hub condividono un solo dominio di collisione (e uno di broadcast). Spostandoli su uno switch si ottengono dieci domini di collisione ma ancora un solo dominio di broadcast; creando due VLAN si ottengono due domini di broadcast, che solo un instradamento di livello 3 può mettere in comunicazione.',
          en: 'Ten PCs on a hub share a single collision domain (and one broadcast domain). Moving them to a switch yields ten collision domains but still one broadcast domain; creating two VLANs yields two broadcast domains, which only layer-3 routing can connect.'
        },
        commonMistakes: [
          {
            it: 'Pensare che uno switch separi i domini di broadcast: senza VLAN e senza routing, tutte le sue porte restano nello stesso dominio di broadcast.',
            en: 'Thinking a switch separates broadcast domains: without VLANs and without routing, all its ports stay in the same broadcast domain.'
          },
          {
            it: 'Attribuire ancora le collisioni a una rete tutta in full-duplex su switch: lì CSMA/CD non interviene perché le collisioni non si verificano.',
            en: 'Still attributing collisions to an all-full-duplex switched network: there CSMA/CD does not kick in because collisions do not occur.'
          }
        ],
        lab: 'fundamentals',
        references: [
          { kind: 'ieee', id: 'IEEE 802.3' },
          { kind: 'ieee', id: 'IEEE 802.1D' }
        ]
      }
    ]
  },
  {
    id: 'ipv4-subnetting',
    cert: 'ccna',
    order: 3,
    track: 'ccna',
    domain: 'network-fundamentals',
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
          {
            it: 'Descrivere la struttura di un indirizzo IPv4 e separare porzione di rete e porzione host tramite la maschera.',
            en: 'Describe the structure of an IPv4 address and separate the network portion from the host portion using the mask.'
          },
          {
            it: 'Leggere la notazione CIDR /n e riconoscere indirizzi privati (RFC 1918) e di documentazione (RFC 5737).',
            en: 'Read CIDR /n notation and recognise private (RFC 1918) and documentation (RFC 5737) addresses.'
          }
        ],
        prerequisites: [
          {
            it: 'Sapere che il livello 3 instrada i pacchetti tra reti diverse (vedi capitolo sul modello OSI).',
            en: 'Know that layer 3 routes packets between different networks (see the OSI model chapter).'
          }
        ],
        theory: [
          {
            it: 'Un indirizzo IPv4 è lungo 32 bit, scritto come quattro ottetti decimali separati da punti (es. 192.168.1.10), ciascuno da 0 a 255. L’indirizzo non basta da solo: serve la maschera di sottorete per sapere quanti bit, a partire da sinistra, identificano la rete e quanti restano per gli host.',
            en: 'An IPv4 address is 32 bits long, written as four decimal octets separated by dots (e.g. 192.168.1.10), each from 0 to 255. The address alone is not enough: the subnet mask is needed to know how many bits, from the left, identify the network and how many remain for hosts.'
          },
          {
            it: 'La maschera è anch’essa 32 bit: i bit a 1 coprono la porzione di rete, quelli a 0 la porzione host. La notazione CIDR riassume la maschera con /n, dove n è il numero di bit a 1: 255.255.255.0 equivale a /24, cioè 24 bit di rete e 8 di host.',
            en: 'The mask is also 32 bits: the 1 bits cover the network portion, the 0 bits the host portion. CIDR notation summarises the mask as /n, where n is the number of 1 bits: 255.255.255.0 equals /24, that is 24 network bits and 8 host bits.'
          },
          {
            it: 'Alcuni blocchi sono riservati: gli indirizzi privati RFC 1918 (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) non sono instradati su Internet e si usano nelle LAN dietro NAT; i blocchi di documentazione RFC 5737 (192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24) servono per esempi e manuali, e sono quelli usati in questa app proprio per non puntare a sistemi reali.',
            en: 'Some blocks are reserved: RFC 1918 private addresses (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) are not routed on the Internet and are used in LANs behind NAT; RFC 5737 documentation blocks (192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24) are for examples and manuals, and are the ones this app uses precisely so as not to point at real systems.'
          }
        ],
        example: {
          it: 'In 203.0.113.10/24 la maschera è 255.255.255.0: i primi 24 bit (203.0.113) sono la rete, l’ultimo ottetto (10) è l’host. Cambiando la maschera in /26 (255.255.255.192) la stessa rete viene divisa in quattro sottoreti più piccole.',
          en: 'In 203.0.113.10/24 the mask is 255.255.255.0: the first 24 bits (203.0.113) are the network, the last octet (10) is the host. Changing the mask to /26 (255.255.255.192) splits the same network into four smaller subnets.'
        },
        commonMistakes: [
          {
            it: 'Leggere l’indirizzo senza la maschera: lo stesso 203.0.113.10 appartiene a reti diverse con /24 o /26. La maschera non è un dettaglio opzionale.',
            en: 'Reading the address without the mask: the same 203.0.113.10 belongs to different networks with /24 or /26. The mask is not an optional detail.'
          },
          {
            it: 'Confondere privati e pubblici: un 192.168.x.x non è instradabile su Internet, deve passare per il NAT.',
            en: 'Confusing private and public: a 192.168.x.x is not routable on the Internet, it must go through NAT.'
          }
        ],
        lab: 'fundamentals',
        references: [{ kind: 'rfc', id: 'RFC 4632' }]
      },
      {
        id: 'ipv4-subnet-math',
        title: { it: 'Calcolare rete, broadcast e host', en: 'Computing network, broadcast, and hosts' },
        objectives: [
          {
            it: 'Dato un indirizzo con prefisso, calcolare indirizzo di rete, broadcast, primo e ultimo host e numero di host utilizzabili.',
            en: 'Given an address with a prefix, compute the network address, broadcast, first and last host, and the number of usable hosts.'
          },
          {
            it: 'Spiegare perché gli host utilizzabili sono 2^h − 2 e le eccezioni /31 e /32.',
            en: 'Explain why usable hosts are 2^h − 2 and the /31 and /32 exceptions.'
          }
        ],
        prerequisites: [{ it: 'Conoscere maschera e notazione CIDR.', en: 'Know the mask and CIDR notation.' }],
        theory: [
          {
            it: 'Con h bit host, una sottorete contiene 2^h indirizzi totali. Due sono riservati: l’indirizzo di rete (tutti i bit host a 0), che identifica la sottorete, e l’indirizzo di broadcast (tutti i bit host a 1), che raggiunge tutti gli host. Gli host utilizzabili sono quindi 2^h − 2.',
            en: 'With h host bits, a subnet contains 2^h total addresses. Two are reserved: the network address (all host bits 0), which identifies the subnet, and the broadcast address (all host bits 1), which reaches every host. Usable hosts are therefore 2^h − 2.'
          },
          {
            it: 'Il “block size” dell’ottetto interessante è 256 meno il valore della maschera in quell’ottetto: per /26 la maschera è 255.255.255.192, 256 − 192 = 64, quindi le sottoreti partono da .0, .64, .128, .192. L’indirizzo di rete è il multiplo del block size immediatamente ≤ all’host; il broadcast è l’indirizzo prima della rete successiva.',
            en: 'The “block size” of the interesting octet is 256 minus the mask value in that octet: for /26 the mask is 255.255.255.192, 256 − 192 = 64, so the subnets start at .0, .64, .128, .192. The network address is the multiple of the block size just ≤ the host; the broadcast is the address before the next network.'
          },
          {
            it: 'Due eccezioni: un /31 (RFC 3021) ha solo 2 indirizzi e nessun broadcast, usati entrambi come host sui collegamenti punto-punto; un /32 è un singolo indirizzo (host route), usato ad esempio per una loopback.',
            en: 'Two exceptions: a /31 (RFC 3021) has only 2 addresses and no broadcast, both used as hosts on point-to-point links; a /32 is a single address (host route), used for example for a loopback.'
          }
        ],
        example: {
          it: 'Per 203.0.113.80/26: block size 64, quindi la sottorete è 203.0.113.64, il broadcast 203.0.113.127, il primo host 203.0.113.65 e l’ultimo 203.0.113.126, per 62 host utilizzabili (2^6 − 2).',
          en: 'For 203.0.113.80/26: block size 64, so the subnet is 203.0.113.64, the broadcast 203.0.113.127, the first host 203.0.113.65 and the last 203.0.113.126, for 62 usable hosts (2^6 − 2).'
        },
        commonMistakes: [
          {
            it: 'Dimenticare di sottrarre i due indirizzi riservati: un /24 ha 256 indirizzi ma 254 host utilizzabili.',
            en: 'Forgetting to subtract the two reserved addresses: a /24 has 256 addresses but 254 usable hosts.'
          },
          {
            it: 'Applicare la regola 2^h − 2 anche al /31: lì vale l’eccezione RFC 3021 con 2 host e nessun broadcast.',
            en: 'Applying the 2^h − 2 rule to a /31 too: there the RFC 3021 exception applies, with 2 hosts and no broadcast.'
          },
          {
            it: 'Scegliere il block size dall’ottetto sbagliato: va individuato l’ottetto dove la maschera non è né 255 né 0.',
            en: 'Picking the block size from the wrong octet: it must be taken from the octet where the mask is neither 255 nor 0.'
          }
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
              {
                it: 'Trova il block size: 256 − 192 (il valore della maschera /26 nell’ultimo ottetto) = 64.',
                en: 'Find the block size: 256 − 192 (the /26 mask value in the last octet) = 64.'
              },
              {
                it: 'Individua il multiplo di 64 immediatamente ≤ 80: è 64, quindi la rete è 203.0.113.64.',
                en: 'Find the multiple of 64 just ≤ 80: it is 64, so the network is 203.0.113.64.'
              },
              {
                it: 'Il broadcast è l’indirizzo prima della rete successiva (.128), cioè 203.0.113.127; host da .65 a .126.',
                en: 'The broadcast is the address before the next network (.128), i.e. 203.0.113.127; hosts from .65 to .126.'
              },
              {
                it: 'Apri l’esploratore IPv4, inserisci 203.0.113.80/26 e confronta i valori.',
                en: 'Open the IPv4 explorer, enter 203.0.113.80/26 and compare the values.'
              }
            ],
            challenge: {
              it: 'Ripeti con 203.0.113.80/28 e con un /30 punto-punto: come cambiano block size, numero di host e broadcast?',
              en: 'Repeat with 203.0.113.80/28 and with a point-to-point /30: how do the block size, host count and broadcast change?'
            },
            solution: [
              {
                it: 'Per /26: block size 64, rete 203.0.113.64, broadcast 203.0.113.127, host 203.0.113.65–126, 62 host utilizzabili (2^6 − 2).',
                en: 'For /26: block size 64, network 203.0.113.64, broadcast 203.0.113.127, hosts 203.0.113.65–126, 62 usable hosts (2^6 − 2).'
              },
              {
                it: 'Sfida /28: block size 16, rete 203.0.113.80, broadcast 203.0.113.95, host .81–.94, 14 host. Sfida /30: block size 4, rete 203.0.113.80, broadcast .83, host .81–.82, 2 host — tipico collegamento punto-punto.',
                en: 'Challenge /28: block size 16, network 203.0.113.80, broadcast 203.0.113.95, hosts .81–.94, 14 hosts. Challenge /30: block size 4, network 203.0.113.80, broadcast .83, hosts .81–.82, 2 hosts — a typical point-to-point link.'
              }
            ],
            selfCheck: [
              {
                it: 'So ricavare rete e broadcast dal block size senza convertire tutto in binario.',
                en: 'I can derive the network and broadcast from the block size without converting everything to binary.'
              },
              {
                it: 'I miei valori coincidono con quelli dell’esploratore IPv4 per ogni prefisso provato.',
                en: 'My values match the IPv4 explorer’s for every prefix I tried.'
              }
            ]
          }
        ]
      },
      {
        id: 'ipv4-vlsm',
        title: { it: 'VLSM: subnet di dimensioni diverse', en: 'VLSM: differently sized subnets' },
        objectives: [
          {
            it: 'Applicare il VLSM per assegnare a ogni rete una subnet della dimensione giusta, partendo dal requisito più grande.',
            en: 'Apply VLSM to give each network a right-sized subnet, starting from the largest requirement.'
          },
          {
            it: 'Spiegare perché l’ordine di allocazione dal più grande al più piccolo evita sovrapposizioni e sprechi.',
            en: 'Explain why allocating from largest to smallest avoids overlaps and waste.'
          }
        ],
        prerequisites: [
          {
            it: 'Saper calcolare rete, broadcast e host di una sottorete.',
            en: 'Be able to compute a subnet’s network, broadcast and hosts.'
          }
        ],
        theory: [
          {
            it: 'Il VLSM (Variable Length Subnet Mask) usa maschere di lunghezza diversa all’interno dello stesso blocco, così ogni sottorete ha solo gli indirizzi che le servono. È il modo con cui si evita di sprecare un intero /24 per un collegamento con due soli host.',
            en: 'VLSM (Variable Length Subnet Mask) uses masks of different lengths within the same block, so each subnet has only the addresses it needs. It is how you avoid wasting a whole /24 on a link with just two hosts.'
          },
          {
            it: 'La regola pratica è allocare dal requisito più grande al più piccolo: per ciascuno si sceglie il prefisso più lungo (la subnet più piccola) che offre abbastanza host, e si parte dalla prima subnet libera. Ordinare al contrario frammenta il blocco e crea sovrapposizioni difficili da correggere.',
            en: 'The practical rule is to allocate from the largest requirement to the smallest: for each one you pick the longest prefix (the smallest subnet) that still provides enough hosts, starting from the first free subnet. Ordering the other way fragments the block and creates overlaps that are hard to fix.'
          },
          {
            it: 'La wildcard mask, usata ad esempio nelle ACL e in OSPF, è il complemento della maschera: 255.255.255.192 (/26) ha wildcard 0.0.0.63. Indica quali bit “non contano” nel confronto.',
            en: 'The wildcard mask, used for example in ACLs and OSPF, is the complement of the mask: 255.255.255.192 (/26) has wildcard 0.0.0.63. It indicates which bits “do not matter” in the comparison.'
          }
        ],
        example: {
          it: 'Dovendo servire 100, 50, 20 e 2 host dal blocco 203.0.113.0/24: 100 → /25 (203.0.113.0, 126 host), 50 → /26 (203.0.113.128, 62 host), 20 → /27 (203.0.113.192, 30 host), 2 → /30 (203.0.113.224). Ogni rete ha spazio sufficiente e nessuna si sovrappone.',
          en: 'To serve 100, 50, 20 and 2 hosts from the 203.0.113.0/24 block: 100 → /25 (203.0.113.0, 126 hosts), 50 → /26 (203.0.113.128, 62 hosts), 20 → /27 (203.0.113.192, 30 hosts), 2 → /30 (203.0.113.224). Each network has enough room and none overlaps.'
        },
        commonMistakes: [
          {
            it: 'Allocare in ordine arbitrario invece che dal più grande: si finisce per non far entrare più le reti grandi.',
            en: 'Allocating in arbitrary order instead of largest-first: you end up unable to fit the large networks any more.'
          },
          {
            it: 'Scegliere un prefisso troppo corto “per sicurezza”: spreca indirizzi e riduce il numero di subnet ottenibili dal blocco.',
            en: 'Choosing too short a prefix “to be safe”: it wastes addresses and reduces how many subnets the block can yield.'
          }
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
              {
                it: 'Ordina i requisiti dal più grande al più piccolo: 100, 50, 20, 2.',
                en: 'Order the requirements from largest to smallest: 100, 50, 20, 2.'
              },
              {
                it: 'Per ciascuno scegli il prefisso più lungo con host sufficienti: 100→/25, 50→/26, 20→/27, 2→/30.',
                en: 'For each, pick the longest prefix with enough hosts: 100→/25, 50→/26, 20→/27, 2→/30.'
              },
              {
                it: 'Alloca in sequenza dalla prima subnet libera e annota rete e broadcast di ognuna.',
                en: 'Allocate in sequence from the first free subnet and note each one’s network and broadcast.'
              },
              {
                it: 'Inserisci blocco e requisiti nel pianificatore VLSM e confronta il piano e gli sprechi.',
                en: 'Enter the block and requirements into the VLSM planner and compare the plan and the waste.'
              }
            ],
            challenge: {
              it: 'Aggiungi un quinto requisito da 2 host: entra ancora nel /24? Quanti indirizzi restano liberi dopo tutte le allocazioni?',
              en: 'Add a fifth requirement of 2 hosts: does it still fit in the /24? How many addresses remain free after all allocations?'
            },
            solution: [
              {
                it: '100→203.0.113.0/25 (.0–.127), 50→203.0.113.128/26 (.128–.191), 20→203.0.113.192/27 (.192–.223), 2→203.0.113.224/30 (.224–.227). Restano liberi .228–.255.',
                en: '100→203.0.113.0/25 (.0–.127), 50→203.0.113.128/26 (.128–.191), 20→203.0.113.192/27 (.192–.223), 2→203.0.113.224/30 (.224–.227). Addresses .228–.255 remain free.'
              },
              {
                it: 'Sfida: un secondo /30 entra a 203.0.113.228/30 (.228–.231); dopo le cinque reti restano liberi 203.0.113.232–255, cioè 24 indirizzi.',
                en: 'Challenge: a second /30 fits at 203.0.113.228/30 (.228–.231); after the five networks, 203.0.113.232–255 remain free, i.e. 24 addresses.'
              }
            ],
            selfCheck: [
              {
                it: 'Ho allocato dal requisito più grande e nessuna subnet si sovrappone.',
                en: 'I allocated from the largest requirement first and no subnet overlaps.'
              },
              {
                it: 'Il piano e gli indirizzi sprecati coincidono con quelli del pianificatore VLSM.',
                en: 'My plan and the wasted addresses match those of the VLSM planner.'
              }
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
    track: 'ccna',
    domain: 'network-access',
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
          {
            it: 'Spiegare cos’è una VLAN e perché corrisponde a un dominio di broadcast separato.',
            en: 'Explain what a VLAN is and why it corresponds to a separate broadcast domain.'
          },
          {
            it: 'Distinguere porta di accesso e appartenenza a una VLAN, e capire perché serve il livello 3 per il traffico inter-VLAN.',
            en: 'Distinguish an access port and VLAN membership, and understand why inter-VLAN traffic needs layer 3.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere i domini di broadcast e il funzionamento dello switch (capitolo Ethernet e switching).',
            en: 'Know broadcast domains and how a switch works (Ethernet and switching chapter).'
          }
        ],
        theory: [
          {
            it: 'Una VLAN (Virtual LAN) suddivide un singolo switch fisico in più reti logiche: ogni VLAN è un dominio di broadcast separato. Due host in VLAN diverse, anche sullo stesso switch, non possono comunicare direttamente al livello 2, esattamente come se fossero su switch distinti.',
            en: 'A VLAN (Virtual LAN) splits a single physical switch into several logical networks: each VLAN is a separate broadcast domain. Two hosts in different VLANs, even on the same switch, cannot communicate directly at layer 2, exactly as if they were on separate switches.'
          },
          {
            it: 'Una porta di accesso appartiene a una sola VLAN dati e consegna all’host frame non taggati. Gli ID VLAN vanno da 1 a 4094: la VLAN 1 è quella di default (sconsigliata per il traffico utente) e le VLAN 1002-1005 sono riservate per compatibilità storica.',
            en: 'An access port belongs to a single data VLAN and delivers untagged frames to the host. VLAN IDs range from 1 to 4094: VLAN 1 is the default (discouraged for user traffic) and VLANs 1002–1005 are reserved for historical compatibility.'
          },
          {
            it: 'Poiché le VLAN isolano i domini di broadcast, il traffico tra VLAN diverse richiede un dispositivo di livello 3: un router o una SVI (Switched Virtual Interface) su uno switch multilayer. È il cosiddetto inter-VLAN routing.',
            en: 'Because VLANs isolate broadcast domains, traffic between different VLANs requires a layer-3 device: a router or an SVI (Switched Virtual Interface) on a multilayer switch. This is so-called inter-VLAN routing.'
          }
        ],
        example: {
          it: 'Mettendo i PC dell’ufficio in VLAN 10 e le telecamere in VLAN 20 sullo stesso switch, un broadcast delle telecamere non raggiunge i PC; perché un PC parli con il NVR in VLAN 20 serve un instradamento di livello 3 tra le due VLAN.',
          en: 'Putting office PCs in VLAN 10 and cameras in VLAN 20 on the same switch means a camera broadcast never reaches the PCs; for a PC to talk to the NVR in VLAN 20, layer-3 routing between the two VLANs is required.'
        },
        commonMistakes: [
          {
            it: 'Pensare che host in VLAN diverse comunichino perché sono sullo stesso switch: senza routing di livello 3 restano isolati.',
            en: 'Thinking hosts in different VLANs communicate because they are on the same switch: without layer-3 routing they stay isolated.'
          },
          {
            it: 'Lasciare il traffico utente sulla VLAN 1 di default, che è anche quella usata da molti protocolli di gestione: una scelta rischiosa in sicurezza.',
            en: 'Leaving user traffic on the default VLAN 1, which is also used by many management protocols: a risky security choice.'
          }
        ],
        lab: 'access',
        references: [{ kind: 'ieee', id: 'IEEE 802.1Q' }]
      },
      {
        id: 'trunk-dot1q',
        title: { it: 'Trunk 802.1Q e native VLAN', en: '802.1Q trunks and the native VLAN' },
        objectives: [
          {
            it: 'Descrivere come un trunk trasporta più VLAN e come il tag 802.1Q identifica ciascun frame.',
            en: 'Describe how a trunk carries multiple VLANs and how the 802.1Q tag identifies each frame.'
          },
          {
            it: 'Spiegare il ruolo della native VLAN e il rischio di un native VLAN mismatch.',
            en: 'Explain the role of the native VLAN and the risk of a native VLAN mismatch.'
          }
        ],
        prerequisites: [
          {
            it: 'Sapere cos’è una VLAN e cosa fa una porta di accesso.',
            en: 'Know what a VLAN is and what an access port does.'
          }
        ],
        theory: [
          {
            it: 'Un collegamento trunk trasporta il traffico di più VLAN tra due switch (o tra switch e router/AP). Per non confondere le VLAN, lo standard IEEE 802.1Q inserisce nel frame un tag di 4 byte tra l’indirizzo sorgente e l’EtherType: contiene un TPID 0x8100, i bit di priorità (PCP) e, soprattutto, un VLAN ID di 12 bit (da cui il limite di 4094 VLAN). Il frame taggato può arrivare fino a 1522 byte.',
            en: 'A trunk link carries traffic for multiple VLANs between two switches (or between a switch and a router/AP). To avoid confusing the VLANs, the IEEE 802.1Q standard inserts a 4-byte tag into the frame between the source address and the EtherType: it holds a TPID 0x8100, the priority bits (PCP) and, above all, a 12-bit VLAN ID (hence the 4094-VLAN limit). A tagged frame can be up to 1522 bytes.'
          },
          {
            it: 'La native VLAN è l’unica VLAN i cui frame viaggiano sul trunk *senza* tag. Serve per compatibilità, ma è un punto delicato: entrambe le estremità del trunk devono concordare sulla stessa native VLAN.',
            en: 'The native VLAN is the one VLAN whose frames travel on the trunk *without* a tag. It exists for compatibility, but it is a delicate point: both ends of the trunk must agree on the same native VLAN.'
          },
          {
            it: 'Un native VLAN mismatch (i due lati configurati con native diverse) fa “saltare” il traffico tra le due VLAN native, con fuga di traffico e potenziali rischi di sicurezza come il VLAN hopping. Buona pratica: fissare esplicitamente la native su una VLAN inutilizzata e taggare tutto.',
            en: 'A native VLAN mismatch (the two sides configured with different natives) makes traffic “leak” between the two native VLANs, with traffic leakage and potential security risks such as VLAN hopping. Best practice: explicitly set the native to an unused VLAN and tag everything.'
          }
        ],
        example: {
          it: 'Su un trunk che trasporta VLAN 10, 20 e 99: i frame di VLAN 10 e 20 viaggiano taggati, quelli della native VLAN 99 non taggati. Se un lato ha native 99 e l’altro native 1, i due switch scambiano per errore traffico tra VLAN 99 e VLAN 1.',
          en: 'On a trunk carrying VLANs 10, 20 and 99: VLAN 10 and 20 frames travel tagged, native VLAN 99 frames untagged. If one side has native 99 and the other native 1, the two switches mistakenly exchange traffic between VLAN 99 and VLAN 1.'
        },
        commonMistakes: [
          {
            it: 'Credere che tutti i frame su un trunk siano taggati: quelli della native VLAN non lo sono, ed è proprio questo a rendere pericoloso un mismatch.',
            en: 'Believing every frame on a trunk is tagged: native VLAN frames are not, and that is exactly what makes a mismatch dangerous.'
          },
          {
            it: 'Lasciare la native VLAN a 1 di default su entrambi i lati senza valutarne le implicazioni di sicurezza (VLAN hopping con doppio tag).',
            en: 'Leaving the native VLAN at the default of 1 on both sides without considering the security implications (double-tagging VLAN hopping).'
          }
        ],
        lab: 'access',
        references: [{ kind: 'ieee', id: 'IEEE 802.1Q' }],
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
              {
                it: 'Apri «Accesso alla rete» e individua la sezione su trunk 802.1Q e native VLAN.',
                en: 'Open “Network access” and find the section on 802.1Q trunks and the native VLAN.'
              },
              {
                it: 'Classifica i frame: VLAN 10 e 20 → taggati con il rispettivo VLAN ID; native 99 → non taggato.',
                en: 'Classify the frames: VLAN 10 and 20 → tagged with their VLAN ID; native 99 → untagged.'
              },
              {
                it: 'Ipotizza che il lato remoto abbia native 1 e descrivi la fuga di traffico che ne risulta.',
                en: 'Assume the remote side has native 1 and describe the resulting traffic leak.'
              }
            ],
            challenge: {
              it: 'Come mitighi il rischio? Indica due misure sulla native VLAN e sul tagging che eliminano il mismatch e riducono il VLAN hopping.',
              en: 'How do you mitigate the risk? Give two measures on the native VLAN and tagging that eliminate the mismatch and reduce VLAN hopping.'
            },
            solution: [
              {
                it: 'Sul trunk: i frame di VLAN 10 e 20 sono taggati 802.1Q con VID 10 e 20; i frame della native VLAN 99 viaggiano senza tag. Il ricevente assegna i frame non taggati alla propria native VLAN.',
                en: 'On the trunk: VLAN 10 and 20 frames are 802.1Q-tagged with VID 10 and 20; native VLAN 99 frames travel untagged. The receiver assigns untagged frames to its own native VLAN.'
              },
              {
                it: 'Con native 99 su un lato e 1 sull’altro, i frame non taggati inviati come VLAN 99 vengono interpretati come VLAN 1 (e viceversa): traffico che “scavalca” l’isolamento tra le due VLAN.',
                en: 'With native 99 on one side and 1 on the other, untagged frames sent as VLAN 99 are interpreted as VLAN 1 (and vice versa): traffic that “jumps” the isolation between the two VLANs.'
              },
              {
                it: 'Mitigazione: fissare la stessa native VLAN su entrambi i lati, sceglierla come VLAN inutilizzata e dedicata, e idealmente forzare il tagging di tutte le VLAN sul trunk così nessun frame viaggia senza tag.',
                en: 'Mitigation: set the same native VLAN on both sides, pick it as an unused dedicated VLAN, and ideally force tagging of all VLANs on the trunk so no frame travels untagged.'
              }
            ],
            selfCheck: [
              {
                it: 'So dire, per ogni VLAN del trunk, se i suoi frame sono taggati o no e perché.',
                en: 'I can say, for each VLAN on the trunk, whether its frames are tagged or not and why.'
              },
              {
                it: 'So spiegare la fuga di traffico di un native VLAN mismatch e come eliminarla.',
                en: 'I can explain the traffic leak of a native VLAN mismatch and how to eliminate it.'
              }
            ]
          }
        ]
      },
      {
        id: 'stp-loops',
        diagram: 'stp-tree',
        title: { it: 'Spanning Tree: evitare i loop di livello 2', en: 'Spanning Tree: preventing layer-2 loops' },
        objectives: [
          {
            it: 'Spiegare perché un loop di livello 2 è catastrofico e come STP costruisce una topologia senza anelli.',
            en: 'Explain why a layer-2 loop is catastrophic and how STP builds a loop-free topology.'
          },
          {
            it: 'Determinare la root bridge e i ruoli delle porte in base a Bridge ID e costo del percorso.',
            en: 'Determine the root bridge and the port roles based on Bridge ID and path cost.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere trunk e come gli switch inoltrano e inondano i frame.',
            en: 'Know trunks and how switches forward and flood frames.'
          }
        ],
        theory: [
          {
            it: 'Il frame Ethernet non ha un campo TTL: in una rete commutata con anelli fisici, un broadcast verrebbe inondato all’infinito, moltiplicandosi a ogni giro — una broadcast storm che satura la rete in pochi secondi. Lo Spanning Tree Protocol (IEEE 802.1D) previene i loop bloccando selettivamente alcune porte, così che resti attivo un solo percorso logico tra due punti qualsiasi.',
            en: 'The Ethernet frame has no TTL field: in a switched network with physical loops, a broadcast would be flooded forever, multiplying on every lap — a broadcast storm that saturates the network in seconds. The Spanning Tree Protocol (IEEE 802.1D) prevents loops by selectively blocking some ports, so only one logical path remains active between any two points.'
          },
          {
            it: 'STP elegge prima la root bridge: vince lo switch con il Bridge ID più basso, dato da priorità (multipli di 4096, con l’extended system ID che somma il numero di VLAN) seguita dall’indirizzo MAC. Ogni switch non-root sceglie una root port (la porta col costo di percorso verso la root più basso) e, per ogni segmento, si elegge una designated port; le altre porte vanno in blocco.',
            en: 'STP first elects the root bridge: the switch with the lowest Bridge ID wins, given by priority (multiples of 4096, with the extended system ID adding the VLAN number) followed by the MAC address. Each non-root switch chooses a root port (the port with the lowest path cost toward the root) and, per segment, a designated port is elected; the other ports are blocked.'
          },
          {
            it: 'A parità di costo i criteri sono, in ordine: Bridge ID del mittente più basso, poi Port ID del mittente più basso. Le porte attraversano gli stati blocking → listening → learning → forwarding; RSTP (802.1w) accelera la convergenza con gli stati discarding/learning/forwarding. Su una porta di accesso conviene attivare PortFast (va subito in forwarding) e BPDU Guard (spegne la porta se riceve BPDU, segno di uno switch non autorizzato).',
            en: 'On a cost tie the criteria are, in order: lowest sender Bridge ID, then lowest sender Port ID. Ports go through the states blocking → listening → learning → forwarding; RSTP (802.1w) speeds up convergence with the discarding/learning/forwarding states. On an access port it is best to enable PortFast (it goes straight to forwarding) and BPDU Guard (it shuts the port down if it receives BPDUs, a sign of an unauthorised switch).'
          }
        ],
        example: {
          it: 'Con tre switch in anello, STP elegge come root quello con Bridge ID più basso; ogni altro switch tiene una sola root port verso la root e blocca la porta che chiuderebbe l’anello, lasciando una topologia ad albero senza loop. Se un collegamento cade, la porta bloccata può riattivarsi e la rete riconverge.',
          en: 'With three switches in a ring, STP elects as root the one with the lowest Bridge ID; every other switch keeps a single root port toward the root and blocks the port that would close the ring, leaving a loop-free tree topology. If a link fails, the blocked port can reactivate and the network reconverges.'
        },
        commonMistakes: [
          {
            it: 'Pensare che la root sia lo switch “più potente”: è semplicemente quello con il Bridge ID più basso (priorità, poi MAC). Si controlla abbassando la priorità sullo switch voluto.',
            en: 'Thinking the root is the “most powerful” switch: it is simply the one with the lowest Bridge ID (priority, then MAC). You control it by lowering the priority on the switch you want.'
          },
          {
            it: 'Confondere la priorità configurata con il Bridge ID effettivo: con l’extended system ID la priorità reale include il numero di VLAN e va in multipli di 4096.',
            en: 'Confusing the configured priority with the effective Bridge ID: with the extended system ID the real priority includes the VLAN number and comes in multiples of 4096.'
          },
          {
            it: 'Attivare PortFast su una porta trunk verso un altro switch: va usato solo sulle porte di accesso verso host, altrimenti si rischia proprio il loop che STP deve evitare.',
            en: 'Enabling PortFast on a trunk port toward another switch: it must be used only on access ports toward hosts, otherwise you risk exactly the loop STP is meant to avoid.'
          }
        ],
        lab: 'access',
        references: [{ kind: 'ieee', id: 'IEEE 802.1D' }],
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
              {
                it: 'Apri «Accesso alla rete» e avvia la convergenza STP sulla maglia di switch.',
                en: 'Open “Network access” and start STP convergence on the switch mesh.'
              },
              {
                it: 'Identifica la root confrontando i Bridge ID (priorità, poi MAC): vince il più basso.',
                en: 'Identify the root by comparing Bridge IDs (priority, then MAC): the lowest wins.'
              },
              {
                it: 'Per uno switch non-root, somma i costi lungo ogni percorso verso la root e scegli la porta col costo totale minore; a parità usa Bridge ID e poi Port ID del mittente.',
                en: 'For a non-root switch, add the costs along each path to the root and pick the port with the lower total cost; on a tie use the sender Bridge ID then Port ID.'
              },
              {
                it: 'Cambia la tabella dei costi (short 802.1D ↔ long 802.1t) e verifica se la root port cambia.',
                en: 'Switch the cost table (short 802.1D ↔ long 802.1t) and check whether the root port changes.'
              }
            ],
            challenge: {
              it: 'Vuoi forzare come root un altro switch: quale valore di priorità imposti e perché i multipli di 4096? Che effetto ha sulla scelta delle root port?',
              en: 'You want to force a different switch as root: what priority value do you set and why multiples of 4096? What effect does it have on the root-port choices?'
            },
            solution: [
              {
                it: 'La root è lo switch con Bridge ID più basso: a parità di priorità decide il MAC più basso. Per uno switch non-root la root port è quella col costo cumulativo verso la root minore; a parità di costo vince il Bridge ID del mittente più basso, poi il Port ID più basso.',
                en: 'The root is the switch with the lowest Bridge ID: on equal priority the lowest MAC decides. For a non-root switch the root port is the one with the lowest cumulative cost to the root; on a cost tie the lowest sender Bridge ID wins, then the lowest sender Port ID.'
              },
              {
                it: 'Cambiando da short a long i costi per porta aumentano (es. 1 Gbps: 4 in short, 20000 in long): i rapporti tra percorsi possono cambiare e quindi anche la root port, se prima due percorsi erano vicini.',
                en: 'Switching from short to long raises the per-port costs (e.g. 1 Gbps: 4 in short, 20000 in long): the ratios between paths can change and so can the root port, if two paths were previously close.'
              },
              {
                it: 'Sfida: per forzare la root si abbassa la priorità (es. a 4096 o 0) sullo switch voluto; la priorità va in multipli di 4096 perché i 12 bit bassi del campo sono occupati dall’extended system ID (il VLAN). Una root diversa ricalcola i costi e può spostare le root port degli altri switch.',
                en: 'Challenge: to force the root you lower the priority (e.g. to 4096 or 0) on the chosen switch; priority comes in multiples of 4096 because the low 12 bits of the field are taken by the extended system ID (the VLAN). A different root recomputes costs and can move the other switches’ root ports.'
              }
            ],
            selfCheck: [
              {
                it: 'So motivare l’elezione della root e ogni ruolo di porta citando il criterio applicato (costo, Bridge ID, Port ID).',
                en: 'I can justify the root election and each port role by citing the criterion applied (cost, Bridge ID, Port ID).'
              },
              {
                it: 'Le mie previsioni coincidono con i ruoli e i criteri mostrati dal laboratorio, in short e in long.',
                en: 'My predictions match the roles and criteria shown by the lab, in both short and long.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'ip-routing-ospf',
    cert: 'ccna',
    order: 5,
    track: 'ccna',
    domain: 'ip-connectivity',
    title: { it: 'Routing IP: rotte statiche e OSPF', en: 'IP routing: static routes and OSPF' },
    summary: {
      it: 'Come un router decide dove inoltrare un pacchetto: la tabella di routing e il longest prefix match, le rotte statiche e di default, e OSPF come protocollo dinamico link-state con il suo costo e le adiacenze.',
      en: 'How a router decides where to forward a packet: the routing table and longest prefix match, static and default routes, and OSPF as a dynamic link-state protocol with its cost and adjacencies.'
    },
    topics: [
      {
        id: 'routing-table-lpm',
        title: {
          it: 'La tabella di routing e il longest prefix match',
          en: 'The routing table and longest prefix match'
        },
        objectives: [
          {
            it: 'Spiegare come il router sceglie la rotta per una destinazione applicando il longest prefix match.',
            en: 'Explain how the router chooses the route for a destination by applying longest prefix match.'
          },
          {
            it: 'Distinguere il ruolo di distanza amministrativa e metrica quando esistono più rotte.',
            en: 'Distinguish the role of administrative distance and metric when multiple routes exist.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere indirizzamento IPv4, maschere e prefissi CIDR (capitolo sul subnetting).',
            en: 'Know IPv4 addressing, masks and CIDR prefixes (subnetting chapter).'
          }
        ],
        theory: [
          {
            it: 'La tabella di routing elenca le reti note e come raggiungerle. Per ogni pacchetto il router confronta l’indirizzo di destinazione con tutte le rotte e sceglie quella con il prefisso più lungo (la più specifica): è il longest prefix match. Una rotta /26 vince su una /24 che pure conterrebbe la destinazione, perché descrive la destinazione con più precisione.',
            en: 'The routing table lists the known networks and how to reach them. For each packet the router compares the destination address with all routes and chooses the one with the longest prefix (the most specific): this is longest prefix match. A /26 route beats a /24 that would also contain the destination, because it describes the destination more precisely.'
          },
          {
            it: 'La distanza amministrativa (AD) interviene prima, quando due *sorgenti* diverse offrono la stessa rete: è l’affidabilità della sorgente. Valori tipici: connessa 0, statica 1, OSPF 110, RIP 120. A parità di sorgente (stesso protocollo) decide la metrica interna del protocollo (per OSPF il costo, per RIP il numero di hop).',
            en: 'Administrative distance (AD) comes first, when two different *sources* offer the same network: it is the trustworthiness of the source. Typical values: connected 0, static 1, OSPF 110, RIP 120. For the same source (same protocol) the protocol’s internal metric decides (OSPF cost, RIP hop count).'
          },
          {
            it: 'Il longest prefix match viene però *prima* di AD e metrica: la specificità del prefisso ha la precedenza assoluta. Solo tra rotte con lo stesso identico prefisso si confrontano AD e poi metrica.',
            en: 'Longest prefix match, however, comes *before* AD and metric: prefix specificity has absolute priority. Only among routes with the exact same prefix are AD and then metric compared.'
          }
        ],
        example: {
          it: 'Con in tabella 203.0.113.0/24 via A e 203.0.113.0/26 via B, un pacchetto per 203.0.113.10 segue la /26 via B (prefisso più lungo), anche se la /24 avesse distanza amministrativa migliore.',
          en: 'With 203.0.113.0/24 via A and 203.0.113.0/26 via B in the table, a packet for 203.0.113.10 follows the /26 via B (longer prefix), even if the /24 had a better administrative distance.'
        },
        commonMistakes: [
          {
            it: 'Credere che la distanza amministrativa batta un prefisso più specifico: il longest prefix match decide per primo, sempre.',
            en: 'Believing administrative distance beats a more specific prefix: longest prefix match decides first, always.'
          },
          {
            it: 'Confondere distanza amministrativa (tra protocolli/sorgenti diverse) e metrica (all’interno dello stesso protocollo).',
            en: 'Confusing administrative distance (between different protocols/sources) and metric (within the same protocol).'
          }
        ],
        lab: 'routing',
        references: [{ kind: 'rfc', id: 'RFC 4632' }],
        guidedLabs: [
          {
            id: 'gl-route-lookup',
            title: { it: 'Quale rotta sceglie il router?', en: 'Which route does the router pick?' },
            difficulty: 'core',
            lab: 'routing',
            scenario: {
              it: 'Il laboratorio «Connettività IP» mostra un output annotato di show ip route e permette di cercare quale rotta serve una destinazione.',
              en: 'The “IP connectivity” lab shows annotated show ip route output and lets you look up which route serves a destination.'
            },
            task: {
              it: 'Data una tabella con una rotta di default, una /24 e una /26 che si sovrappongono, determina quale rotta serve 203.0.113.10 e quale serve 198.51.100.5.',
              en: 'Given a table with a default route, a /24 and an overlapping /26, determine which route serves 203.0.113.10 and which serves 198.51.100.5.'
            },
            steps: [
              {
                it: 'Apri «Connettività IP» e usa il lookup interattivo della tabella di routing.',
                en: 'Open “IP connectivity” and use the interactive routing-table lookup.'
              },
              {
                it: 'Per ogni destinazione individua tutte le rotte che la contengono, poi scegli quella col prefisso più lungo.',
                en: 'For each destination find all routes that contain it, then pick the one with the longest prefix.'
              },
              {
                it: 'Verifica cosa accade a una destinazione non coperta da alcuna rotta specifica (ricade sulla default 0.0.0.0/0).',
                en: 'Check what happens to a destination not covered by any specific route (it falls back to the default 0.0.0.0/0).'
              }
            ],
            challenge: {
              it: 'Aggiungi mentalmente una seconda /26 identica da una sorgente diversa (statica vs OSPF): ora quale criterio decide e perché?',
              en: 'Mentally add a second identical /26 from a different source (static vs OSPF): which criterion decides now and why?'
            },
            solution: [
              {
                it: '203.0.113.10 è coperto sia dalla /24 sia dalla /26: vince la /26 per longest prefix match. 198.51.100.5, non coperto da rotte specifiche, segue la default 0.0.0.0/0 (gateway of last resort).',
                en: '203.0.113.10 is covered by both the /24 and the /26: the /26 wins by longest prefix match. 198.51.100.5, not covered by specific routes, follows the default 0.0.0.0/0 (gateway of last resort).'
              },
              {
                it: 'Sfida: due /26 identiche hanno lo stesso prefisso, quindi il longest prefix match non basta; decide la distanza amministrativa (statica 1 batte OSPF 110), e solo a parità di sorgente si userebbe la metrica.',
                en: 'Challenge: two identical /26 routes share the same prefix, so longest prefix match is not enough; administrative distance decides (static 1 beats OSPF 110), and only for the same source would the metric be used.'
              }
            ],
            selfCheck: [
              {
                it: 'So elencare tutte le rotte che contengono una destinazione e scegliere la più specifica.',
                en: 'I can list every route that contains a destination and pick the most specific one.'
              },
              {
                it: 'So dire quando entra in gioco la distanza amministrativa invece del prefisso.',
                en: 'I can say when administrative distance comes into play instead of the prefix.'
              }
            ]
          }
        ]
      },
      {
        id: 'static-default-routes',
        title: { it: 'Rotte statiche e di default', en: 'Static and default routes' },
        objectives: [
          {
            it: 'Configurare concettualmente una rotta statica e una rotta di default, scegliendo tra next-hop e interfaccia di uscita.',
            en: 'Conceptually configure a static route and a default route, choosing between next-hop and exit interface.'
          },
          { it: 'Spiegare a cosa serve una floating static route.', en: 'Explain what a floating static route is for.' }
        ],
        prerequisites: [
          {
            it: 'Capire la tabella di routing e il longest prefix match.',
            en: 'Understand the routing table and longest prefix match.'
          }
        ],
        theory: [
          {
            it: 'Una rotta statica è inserita a mano dall’amministratore: “per raggiungere la rete X usa il next-hop Y”. Si può specificare l’indirizzo del prossimo salto, l’interfaccia di uscita, o entrambi. È semplice e prevedibile, ma non si adatta da sola ai cambiamenti della topologia.',
            en: 'A static route is entered by hand by the administrator: “to reach network X use next-hop Y”. You can specify the next-hop address, the exit interface, or both. It is simple and predictable, but it does not adapt on its own to topology changes.'
          },
          {
            it: 'La rotta di default 0.0.0.0/0 è la rotta meno specifica possibile: cattura tutte le destinazioni non coperte da rotte più precise ed è il “gateway of last resort”, tipicamente verso Internet. Per il longest prefix match è l’ultima scelta, perché ha prefisso /0.',
            en: 'The default route 0.0.0.0/0 is the least specific route possible: it catches every destination not covered by more precise routes and is the “gateway of last resort”, typically toward the Internet. For longest prefix match it is the last resort, because its prefix is /0.'
          },
          {
            it: 'Una floating static route è una statica con distanza amministrativa aumentata a bella posta (più alta di quella del protocollo dinamico): resta “a galleggiare” inattiva finché la rotta preferita esiste, e subentra solo se questa sparisce. È un backup manuale.',
            en: 'A floating static route is a static route with a deliberately raised administrative distance (higher than the dynamic protocol’s): it stays “floating” inactive while the preferred route exists, and takes over only if that route disappears. It is a manual backup.'
          }
        ],
        example: {
          it: 'ip route 0.0.0.0 0.0.0.0 198.51.100.1 manda tutto il traffico sconosciuto al next-hop 198.51.100.1. Una seconda default via un altro ISP con distanza amministrativa 10 resta inattiva finché la prima (distanza 1) è valida.',
          en: 'ip route 0.0.0.0 0.0.0.0 198.51.100.1 sends all unknown traffic to next-hop 198.51.100.1. A second default via another ISP with administrative distance 10 stays inactive while the first (distance 1) is valid.'
        },
        commonMistakes: [
          {
            it: 'Dare alla floating static la stessa distanza della rotta primaria: così finiscono entrambe in tabella (o in load-sharing) invece di fare da backup.',
            en: 'Giving the floating static the same distance as the primary route: then both end up in the table (or load-sharing) instead of acting as a backup.'
          },
          {
            it: 'Usare solo l’interfaccia di uscita su link multiaccesso (Ethernet) senza next-hop: può generare problemi di risoluzione ARP; sui punto-punto è invece naturale.',
            en: 'Using only the exit interface on multiaccess links (Ethernet) without a next-hop: it can cause ARP resolution issues; on point-to-point links it is natural instead.'
          }
        ],
        lab: 'routing',
        references: [{ kind: 'rfc', id: 'RFC 1812' }]
      },
      {
        id: 'ospf-basics',
        title: { it: 'OSPF: routing dinamico link-state', en: 'OSPF: dynamic link-state routing' },
        objectives: [
          {
            it: 'Descrivere come OSPF costruisce le adiacenze e calcola i percorsi con il costo e l’algoritmo SPF.',
            en: 'Describe how OSPF builds adjacencies and computes paths with the cost and the SPF algorithm.'
          },
          {
            it: 'Spiegare il calcolo del costo OSPF e perché su link veloci serve regolare la reference bandwidth.',
            en: 'Explain OSPF cost computation and why fast links require adjusting the reference bandwidth.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere la tabella di routing, distanza amministrativa e metrica.',
            en: 'Know the routing table, administrative distance and metric.'
          }
        ],
        theory: [
          {
            it: 'OSPFv2 è un protocollo link-state: ogni router descrive i propri collegamenti in annunci (LSA), tutti i router costruiscono la stessa mappa della rete (il link-state database) e ciascuno esegue l’algoritmo SPF (Dijkstra) per calcolare i percorsi più brevi verso ogni rete. La distanza amministrativa di OSPF è 110.',
            en: 'OSPFv2 is a link-state protocol: each router describes its links in advertisements (LSAs), all routers build the same map of the network (the link-state database), and each runs the SPF (Dijkstra) algorithm to compute the shortest paths to every network. OSPF’s administrative distance is 110.'
          },
          {
            it: 'La metrica OSPF è il costo, inversamente proporzionale alla banda: costo = reference-bandwidth / banda dell’interfaccia (minimo 1). Con la reference bandwidth di default (100 Mbps), Fast Ethernet e tutto ciò che è ≥ 100 Mbps ottengono costo 1 e diventano indistinguibili: per questo su reti moderne si alza la reference bandwidth (auto-cost reference-bandwidth) in modo coerente su tutti i router.',
            en: 'The OSPF metric is cost, inversely proportional to bandwidth: cost = reference-bandwidth / interface bandwidth (minimum 1). With the default reference bandwidth (100 Mbps), Fast Ethernet and anything ≥ 100 Mbps get cost 1 and become indistinguishable: this is why on modern networks the reference bandwidth is raised (auto-cost reference-bandwidth) consistently on all routers.'
          },
          {
            it: 'I router diventano vicini scambiando pacchetti Hello; ogni router ha un router-ID (il valore più alto tra le loopback, altrimenti l’interfaccia attiva più alta, o impostato a mano). Su segmenti multiaccesso (Ethernet) si eleggono un DR e un BDR per ridurre il numero di adiacenze: vince la priorità OSPF più alta, poi il router-ID più alto, e l’elezione non è preemptive.',
            en: 'Routers become neighbours by exchanging Hello packets; each router has a router-ID (the highest loopback, otherwise the highest active interface, or set manually). On multiaccess segments (Ethernet) a DR and a BDR are elected to reduce the number of adjacencies: the highest OSPF priority wins, then the highest router-ID, and the election is non-preemptive.'
          }
        ],
        example: {
          it: 'Con reference bandwidth di default, due percorsi verso la stessa rete — uno a 1 Gbps e uno a 100 Mbps — hanno entrambi costo 1 e OSPF li usa in load-sharing; alzando la reference bandwidth a 1000 il percorso a 1 Gbps ottiene costo 1 e quello a 100 Mbps costo 10, così SPF sceglie il più veloce.',
          en: 'With the default reference bandwidth, two paths to the same network — one at 1 Gbps and one at 100 Mbps — both have cost 1 and OSPF uses them in load-sharing; raising the reference bandwidth to 1000 gives the 1 Gbps path cost 1 and the 100 Mbps path cost 10, so SPF picks the faster one.'
        },
        commonMistakes: [
          {
            it: 'Lasciare la reference bandwidth di default su reti con link ≥ 100 Mbps: percorsi di velocità diversa sembrano equivalenti e SPF non distingue il migliore.',
            en: 'Leaving the default reference bandwidth on networks with links ≥ 100 Mbps: paths of different speed look equivalent and SPF cannot tell the best one apart.'
          },
          {
            it: 'Credere che il DR sia “il router che instrada per gli altri”: il DR riduce solo il numero di adiacenze sul segmento multiaccesso, non inoltra al posto degli altri.',
            en: 'Believing the DR is “the router that routes for the others”: the DR only reduces the number of adjacencies on the multiaccess segment, it does not forward on the others’ behalf.'
          },
          {
            it: 'Pensare che l’elezione DR/BDR sia preemptive: un router con priorità più alta che si aggiunge dopo non scalza il DR già eletto.',
            en: 'Thinking the DR/BDR election is preemptive: a higher-priority router that joins later does not displace the already-elected DR.'
          }
        ],
        lab: 'routing',
        references: [{ kind: 'rfc', id: 'RFC 2328' }],
        guidedLabs: [
          {
            id: 'gl-ospf-cost',
            title: { it: 'Calcola il costo e sciogli il pareggio OSPF', en: 'Compute OSPF cost and break the tie' },
            difficulty: 'advanced',
            lab: 'routing',
            scenario: {
              it: 'Il laboratorio «Connettività IP» esegue SPF su una topologia a cinque router mantenendo i predecessori a costo uguale, così l’ECMP è visibile, e consente di cambiare la reference bandwidth.',
              en: 'The “IP connectivity” lab runs SPF on a five-router topology keeping equal-cost predecessors, so ECMP is visible, and lets you change the reference bandwidth.'
            },
            task: {
              it: 'Con reference bandwidth di default, individua i percorsi a costo uguale verso una rete; poi alza la reference bandwidth e verifica se il pareggio si scioglie.',
              en: 'With the default reference bandwidth, find the equal-cost paths to a network; then raise the reference bandwidth and check whether the tie is broken.'
            },
            steps: [
              {
                it: 'Apri «Connettività IP» e avvia l’esercitazione SPF sulla topologia.',
                en: 'Open “IP connectivity” and start the SPF exercise on the topology.'
              },
              {
                it: 'Per ogni percorso somma i costi delle interfacce attraversate (costo = reference / banda).',
                en: 'For each path add the costs of the interfaces crossed (cost = reference / bandwidth).'
              },
              {
                it: 'Osserva i percorsi che pareggiano con la reference di default, poi alza auto-cost reference-bandwidth e ricalcola.',
                en: 'Observe the paths that tie with the default reference, then raise auto-cost reference-bandwidth and recompute.'
              }
            ],
            challenge: {
              it: 'Perché la reference bandwidth va impostata uguale su tutti i router? Cosa accade se un solo router la lascia al valore di default?',
              en: 'Why must the reference bandwidth be set the same on all routers? What happens if just one router leaves it at the default?'
            },
            solution: [
              {
                it: 'Con reference 100 Mbps due percorsi di banda diversa ma entrambi ≥ 100 Mbps hanno costo 1 per salto e possono pareggiare: SPF li tiene entrambi (ECMP). Alzando la reference (es. a 1000) i costi tornano a differenziarsi e SPF sceglie il percorso complessivamente più veloce.',
                en: 'With a 100 Mbps reference, two paths of different bandwidth but both ≥ 100 Mbps have cost 1 per hop and can tie: SPF keeps both (ECMP). Raising the reference (e.g. to 1000) makes the costs differ again and SPF picks the overall faster path.'
              },
              {
                it: 'Sfida: la reference bandwidth deve essere identica su tutti i router perché il costo è un numero confrontabile solo se calcolato con lo stesso riferimento; se un router la lascia al default, i suoi costi non sono comparabili con quelli degli altri e SPF può scegliere percorsi incoerenti.',
                en: 'Challenge: the reference bandwidth must be identical on all routers because the cost is only comparable if computed against the same reference; if one router leaves it at the default, its costs are not comparable with the others’ and SPF can choose inconsistent paths.'
              }
            ],
            selfCheck: [
              {
                it: 'So calcolare il costo totale di un percorso OSPF e spiegare perché due percorsi pareggiano.',
                en: 'I can compute the total cost of an OSPF path and explain why two paths tie.'
              },
              {
                it: 'So spiegare l’effetto della reference bandwidth e perché va uniformata su tutti i router.',
                en: 'I can explain the effect of the reference bandwidth and why it must be uniform across all routers.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'ip-services',
    cert: 'ccna',
    order: 6,
    track: 'ccna',
    domain: 'ip-services',
    title: { it: 'Servizi IP: DHCP, DNS e NAT', en: 'IP services: DHCP, DNS, and NAT' },
    summary: {
      it: 'I servizi che rendono utilizzabile una rete IP: DHCP assegna gli indirizzi, DNS traduce i nomi in indirizzi, NAT/PAT permette a molti host privati di uscire su Internet con pochi indirizzi pubblici.',
      en: 'The services that make an IP network usable: DHCP hands out addresses, DNS translates names to addresses, and NAT/PAT lets many private hosts reach the Internet with a few public addresses.'
    },
    topics: [
      {
        id: 'dhcp-dora',
        title: { it: 'DHCP e il flusso DORA', en: 'DHCP and the DORA exchange' },
        objectives: [
          {
            it: 'Descrivere i quattro messaggi DORA, le porte UDP usate e quali messaggi sono in broadcast.',
            en: 'Describe the four DORA messages, the UDP ports used, and which messages are broadcast.'
          },
          {
            it: 'Spiegare il ruolo del relay (ip helper-address) e del campo giaddr quando il server è in un’altra sottorete.',
            en: 'Explain the role of the relay (ip helper-address) and the giaddr field when the server is in another subnet.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere indirizzamento IPv4, broadcast e la differenza tra livello 2 e livello 3.',
            en: 'Know IPv4 addressing, broadcast, and the difference between layer 2 and layer 3.'
          }
        ],
        theory: [
          {
            it: 'DHCP assegna automaticamente a un client indirizzo IP, maschera, gateway e DNS. Lo scambio ha quattro messaggi, riassunti nell’acronimo DORA: Discover, Offer, Request, Acknowledge. Il server ascolta sulla porta UDP 67, il client sulla UDP 68.',
            en: 'DHCP automatically gives a client an IP address, mask, gateway and DNS. The exchange has four messages, summed up by the acronym DORA: Discover, Offer, Request, Acknowledge. The server listens on UDP port 67, the client on UDP 68.'
          },
          {
            it: 'Il client non ha ancora un indirizzo, quindi il Discover parte in broadcast (sorgente 0.0.0.0, destinazione 255.255.255.255). Il server risponde con un Offer; il client invia una Request — ancora in broadcast — per accettare una specifica offerta, così gli altri server sanno di ritirare le proprie; il server conferma con un Ack. La Request è in broadcast proprio perché deve essere vista anche dai server non scelti.',
            en: 'The client has no address yet, so the Discover goes out as a broadcast (source 0.0.0.0, destination 255.255.255.255). The server replies with an Offer; the client sends a Request — still broadcast — to accept one specific offer, so the other servers know to withdraw theirs; the server confirms with an Ack. The Request is broadcast precisely so the non-chosen servers also see it.'
          },
          {
            it: 'Se il server DHCP è in un’altra sottorete, i broadcast non la attraversano: si configura allora un relay con ip helper-address sull’interfaccia del router. Il relay inoltra la richiesta in unicast al server e imposta il campo giaddr con l’indirizzo dell’interfaccia su cui ha ricevuto il Discover, così il server capisce da quale scope (pool) assegnare l’indirizzo. Se non c’è alcun server, il client ricade sull’indirizzo APIPA 169.254.x.x.',
            en: 'If the DHCP server is in another subnet, broadcasts do not cross it: a relay is then configured with ip helper-address on the router interface. The relay forwards the request as unicast to the server and sets the giaddr field to the address of the interface where it received the Discover, so the server knows which scope (pool) to assign from. If there is no server at all, the client falls back to the APIPA address 169.254.x.x.'
          }
        ],
        example: {
          it: 'Un PC appena acceso invia un Discover in broadcast; il router con ip helper-address lo inoltra al server 203.0.113.10 impostando giaddr all’indirizzo della sua interfaccia nella LAN del PC, e il server sceglie il pool giusto grazie a quel giaddr.',
          en: 'A PC that has just booted sends a broadcast Discover; the router with ip helper-address forwards it to server 203.0.113.10, setting giaddr to its own interface address in the PC’s LAN, and the server picks the right pool thanks to that giaddr.'
        },
        commonMistakes: [
          {
            it: 'Pensare che la Request sia unicast: è in broadcast, perché serve anche a informare i server non scelti che possono liberare la loro offerta.',
            en: 'Thinking the Request is unicast: it is broadcast, because it also tells the non-chosen servers they can release their offer.'
          },
          {
            it: 'Dimenticare il giaddr con un relay: senza di esso il server non sa da quale scope assegnare e la DORA fallisce pur sembrando configurata.',
            en: 'Forgetting giaddr with a relay: without it the server does not know which scope to assign from and DORA fails while appearing configured.'
          },
          {
            it: 'Scambiare un indirizzo APIPA 169.254.x.x per una configurazione valida: segnala invece che il DHCP non ha risposto.',
            en: 'Mistaking an APIPA 169.254.x.x address for a valid configuration: it instead signals that DHCP did not answer.'
          }
        ],
        lab: 'services',
        references: [{ kind: 'rfc', id: 'RFC 2131' }],
        guidedLabs: [
          {
            id: 'gl-dora-order',
            title: { it: 'Ricostruisci lo scambio DORA', en: 'Reconstruct the DORA exchange' },
            difficulty: 'core',
            lab: 'services',
            scenario: {
              it: 'Il laboratorio «Servizi IP» percorre lo scambio DHCP messaggio per messaggio, con indirizzi, porte UDP e il campo giaddr, e riproduce i modi in cui fallisce.',
              en: 'The “IP services” lab walks the DHCP exchange message by message, with addresses, UDP ports and the giaddr field, and reproduces the ways it fails.'
            },
            task: {
              it: 'Metti in ordine i quattro messaggi DORA indicando, per ciascuno, se è broadcast o unicast e quale porta UDP usa; poi individua cosa succede senza ip helper-address.',
              en: 'Put the four DORA messages in order, stating for each whether it is broadcast or unicast and which UDP port it uses; then identify what happens without ip helper-address.'
            },
            steps: [
              {
                it: 'Apri «Servizi IP» e avvia l’esercitazione DORA.',
                en: 'Open “IP services” and start the DORA exercise.'
              },
              {
                it: 'Per ogni messaggio annota mittente, destinatario, broadcast/unicast e porta UDP (67 lato server, 68 lato client).',
                en: 'For each message note the sender, receiver, broadcast/unicast and UDP port (67 on the server side, 68 on the client side).'
              },
              {
                it: 'Simula l’assenza del relay e osserva perché il Discover non raggiunge il server in un’altra sottorete.',
                en: 'Simulate the missing relay and observe why the Discover does not reach the server in another subnet.'
              }
            ],
            challenge: {
              it: 'Riproduci altri due guasti: pool esaurito e DHCP snooping che scarta l’Offer su una porta untrusted. Quale messaggio manca in ciascun caso?',
              en: 'Reproduce two more failures: an exhausted pool and DHCP snooping dropping the Offer on an untrusted port. Which message is missing in each case?'
            },
            solution: [
              {
                it: 'Ordine: Discover (client→broadcast, da 0.0.0.0, UDP 68→67), Offer (server→client, UDP 67→68), Request (client→broadcast, UDP 68→67), Ack (server→client, UDP 67→68). Il Discover e la Request sono in broadcast, Offer e Ack tornano verso il client.',
                en: 'Order: Discover (client→broadcast, from 0.0.0.0, UDP 68→67), Offer (server→client, UDP 67→68), Request (client→broadcast, UDP 68→67), Ack (server→client, UDP 67→68). Discover and Request are broadcast, Offer and Ack go back toward the client.'
              },
              {
                it: 'Senza ip helper-address il Discover in broadcast resta confinato nella sottorete del client e non raggiunge il server: nessun Offer arriva. Sfida: con il pool esaurito il server non invia Offer (manca la O); con DHCP snooping che blocca l’Offer su porta untrusted il client non riceve l’Offer e resta senza indirizzo.',
                en: 'Without ip helper-address the broadcast Discover stays confined to the client’s subnet and never reaches the server: no Offer arrives. Challenge: with an exhausted pool the server sends no Offer (the O is missing); with DHCP snooping blocking the Offer on an untrusted port the client never receives the Offer and stays without an address.'
              }
            ],
            selfCheck: [
              {
                it: 'So riprodurre l’ordine DORA con direzione broadcast/unicast e porte UDP corrette.',
                en: 'I can reproduce the DORA order with the correct broadcast/unicast direction and UDP ports.'
              },
              {
                it: 'So collegare ogni modalità di guasto al messaggio DORA che non compare.',
                en: 'I can link each failure mode to the DORA message that does not appear.'
              }
            ]
          }
        ]
      },
      {
        id: 'dns-resolution',
        title: { it: 'DNS: dai nomi agli indirizzi', en: 'DNS: from names to addresses' },
        objectives: [
          {
            it: 'Spiegare come un resolver risolve un nome interrogando root, TLD e server autoritativi.',
            en: 'Explain how a resolver resolves a name by querying root, TLD and authoritative servers.'
          },
          {
            it: 'Riconoscere i principali record (A, AAAA, CNAME, MX, NS, PTR) e il ruolo di TTL e caching.',
            en: 'Recognise the main records (A, AAAA, CNAME, MX, NS, PTR) and the role of TTL and caching.'
          }
        ],
        prerequisites: [
          {
            it: 'Sapere cos’è un indirizzo IP e la differenza tra UDP e TCP.',
            en: 'Know what an IP address is and the difference between UDP and TCP.'
          }
        ],
        theory: [
          {
            it: 'Il DNS traduce nomi leggibili (come www.example.com) negli indirizzi IP usati dalla rete. La risoluzione è gerarchica: il resolver interroga un server radice, che rimanda al server del dominio di primo livello (TLD, es. .com), che rimanda al server autoritativo del dominio, che fornisce la risposta finale. Il client fa una query ricorsiva al resolver; il resolver fa query iterative verso la gerarchia.',
            en: 'DNS translates human-readable names (such as www.example.com) into the IP addresses the network uses. Resolution is hierarchical: the resolver queries a root server, which refers it to the top-level domain (TLD, e.g. .com) server, which refers it to the domain’s authoritative server, which gives the final answer. The client makes a recursive query to the resolver; the resolver makes iterative queries down the hierarchy.'
          },
          {
            it: 'Le risposte sono record di tipo diverso: A (nome→IPv4), AAAA (nome→IPv6), CNAME (alias verso un altro nome), MX (server di posta del dominio), NS (server autoritativi), PTR (IP→nome, la risoluzione inversa). Il DNS usa la porta 53, su UDP per le query normali e su TCP per risposte grandi o per i trasferimenti di zona.',
            en: 'Answers are records of different types: A (name→IPv4), AAAA (name→IPv6), CNAME (alias to another name), MX (the domain’s mail servers), NS (authoritative servers), PTR (IP→name, reverse resolution). DNS uses port 53, over UDP for ordinary queries and over TCP for large answers or zone transfers.'
          },
          {
            it: 'Ogni record ha un TTL che indica per quanto può essere messo in cache: i resolver conservano le risposte per quel tempo, riducendo latenza e carico sui server autoritativi. Un TTL basso rende i cambiamenti più rapidi ma aumenta le query; un TTL alto fa il contrario.',
            en: 'Each record has a TTL that says how long it may be cached: resolvers keep answers for that time, cutting latency and load on the authoritative servers. A low TTL makes changes propagate faster but increases queries; a high TTL does the opposite.'
          }
        ],
        example: {
          it: 'Aprendo www.example.com il resolver, se non ha nulla in cache, chiede alla radice (→ .com), poi al TLD (→ server autoritativo di example.com), poi all’autoritativo che risponde con il record A; la risposta viene messa in cache per la durata del TTL.',
          en: 'Opening www.example.com, the resolver — if it has nothing cached — asks the root (→ .com), then the TLD (→ example.com’s authoritative server), then the authoritative server that answers with the A record; the answer is cached for the TTL.'
        },
        commonMistakes: [
          {
            it: 'Credere che il DNS usi solo UDP: le query comuni sì, ma risposte grandi e trasferimenti di zona passano su TCP, sempre sulla porta 53.',
            en: 'Believing DNS uses only UDP: ordinary queries do, but large answers and zone transfers go over TCP, still on port 53.'
          },
          {
            it: 'Confondere un CNAME con un record A: il CNAME punta a un altro nome, non direttamente a un indirizzo, e richiede una risoluzione ulteriore.',
            en: 'Confusing a CNAME with an A record: a CNAME points to another name, not directly to an address, and needs a further lookup.'
          }
        ],
        lab: 'services',
        references: [{ kind: 'rfc', id: 'RFC 1035' }]
      },
      {
        id: 'nat-pat',
        title: { it: 'NAT e PAT', en: 'NAT and PAT' },
        objectives: [
          {
            it: 'Spiegare perché il NAT è necessario e distinguere NAT statico, dinamico e PAT (overload).',
            en: 'Explain why NAT is needed and distinguish static NAT, dynamic NAT and PAT (overload).'
          },
          {
            it: 'Descrivere come il PAT usa le porte per far condividere a molti host un solo indirizzo pubblico.',
            en: 'Describe how PAT uses ports to let many hosts share a single public address.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere indirizzi privati RFC 1918 e porte di livello 4.',
            en: 'Know RFC 1918 private addresses and layer-4 ports.'
          }
        ],
        theory: [
          {
            it: 'Gli indirizzi privati RFC 1918 non sono instradabili su Internet: il NAT (Network Address Translation) traduce l’indirizzo privato interno in un indirizzo pubblico quando il traffico esce. Esistono tre forme: NAT statico (una corrispondenza fissa uno-a-uno), NAT dinamico (da un pool di indirizzi pubblici) e PAT o overload (molti host dietro un solo indirizzo pubblico).',
            en: 'RFC 1918 private addresses are not routable on the Internet: NAT (Network Address Translation) translates the internal private address into a public one when traffic leaves. There are three forms: static NAT (a fixed one-to-one mapping), dynamic NAT (from a pool of public addresses) and PAT or overload (many hosts behind a single public address).'
          },
          {
            it: 'Il PAT è la forma più diffusa (è ciò che fa il router di casa). Distingue i flussi di host diversi assegnando a ciascuno una porta sorgente differente sull’indirizzo pubblico condiviso, e tiene una tabella di traduzione che associa (IP privato, porta) ↔ (IP pubblico, porta) per instradare correttamente le risposte.',
            en: 'PAT is the most common form (it is what a home router does). It tells apart the flows of different hosts by assigning each a different source port on the shared public address, and keeps a translation table mapping (private IP, port) ↔ (public IP, port) to route the replies back correctly.'
          },
          {
            it: 'Il NAT nasce per conservare gli indirizzi IPv4, non come controllo di sicurezza: nasconde la topologia interna e, di fatto, blocca le connessioni entranti non sollecitate, ma non va considerato un firewall. La vera politica di sicurezza resta compito di firewall e ACL.',
            en: 'NAT exists to conserve IPv4 addresses, not as a security control: it hides the internal topology and effectively blocks unsolicited inbound connections, but must not be treated as a firewall. The real security policy stays the job of firewalls and ACLs.'
          }
        ],
        example: {
          it: 'Due PC interni (192.168.1.10 e 192.168.1.11) navigano verso Internet: il PAT li traduce entrambi sull’unico indirizzo pubblico 203.0.113.1, distinguendoli con porte sorgente diverse; le risposte tornano alla porta giusta grazie alla tabella di traduzione.',
          en: 'Two internal PCs (192.168.1.10 and 192.168.1.11) browse to the Internet: PAT translates both to the single public address 203.0.113.1, telling them apart by different source ports; the replies return to the right port thanks to the translation table.'
        },
        commonMistakes: [
          {
            it: 'Considerare il NAT un firewall: ostacola le connessioni entranti non richieste, ma non applica una politica e non ispeziona il traffico.',
            en: 'Treating NAT as a firewall: it hinders unsolicited inbound connections but enforces no policy and inspects no traffic.'
          },
          {
            it: 'Dimenticare che il PAT dipende dalle porte: senza porta sorgente libera la traduzione fallisce, ed è un limite di capacità reale sotto carico elevato.',
            en: 'Forgetting that PAT depends on ports: with no free source port the translation fails, and that is a real capacity limit under heavy load.'
          }
        ],
        lab: 'services',
        references: [{ kind: 'rfc', id: 'RFC 3022' }],
        guidedLabs: [
          {
            id: 'gl-pat-translate',
            title: { it: 'Traduci un flusso con il PAT', en: 'Translate a flow with PAT' },
            difficulty: 'core',
            lab: 'services',
            scenario: {
              it: 'Il laboratorio «Servizi IP» mostra NAT/PAT con allocazione delle porte fedele ai range e la tabella di traduzione.',
              en: 'The “IP services” lab shows NAT/PAT with range-accurate port allocation and the translation table.'
            },
            task: {
              it: 'Per due host privati che aprono una connessione verso lo stesso server, ricostruisci le voci della tabella PAT e spiega come tornano le risposte.',
              en: 'For two private hosts opening a connection to the same server, reconstruct the PAT table entries and explain how the replies return.'
            },
            steps: [
              {
                it: 'Apri «Servizi IP» e vai alla sezione NAT/PAT.',
                en: 'Open “IP services” and go to the NAT/PAT section.'
              },
              {
                it: 'Per ogni host annota (IP privato, porta sorgente) e la coppia pubblica (IP pubblico, porta) assegnata dal PAT.',
                en: 'For each host note the (private IP, source port) and the public pair (public IP, port) assigned by PAT.'
              },
              {
                it: 'Verifica come il router usa la tabella per rimandare la risposta all’host interno corretto.',
                en: 'Check how the router uses the table to send the reply back to the correct internal host.'
              }
            ],
            challenge: {
              it: 'Cosa accade se i due host usano la stessa porta sorgente verso lo stesso server? Come fa il PAT a evitare l’ambiguità?',
              en: 'What happens if both hosts use the same source port toward the same server? How does PAT avoid the ambiguity?'
            },
            solution: [
              {
                it: 'Ogni host riceve una voce che associa (IP privato, porta) a (203.0.113.1, porta pubblica). Le risposte arrivano all’indirizzo pubblico con la porta pubblica come destinazione, e il router le riscrive verso l’host privato corrispondente grazie alla tabella.',
                en: 'Each host gets an entry mapping (private IP, port) to (203.0.113.1, public port). Replies arrive at the public address with the public port as destination, and the router rewrites them back to the matching private host thanks to the table.'
              },
              {
                it: 'Sfida: se entrambi usano la stessa porta sorgente, il PAT assegna porte pubbliche diverse ai due flussi, così la coppia (IP pubblico, porta pubblica) resta unica e le risposte non sono ambigue.',
                en: 'Challenge: if both use the same source port, PAT assigns different public ports to the two flows, so the (public IP, public port) pair stays unique and the replies are unambiguous.'
              }
            ],
            selfCheck: [
              {
                it: 'So ricostruire le voci della tabella PAT e spiegare come instradano le risposte.',
                en: 'I can reconstruct the PAT table entries and explain how they route the replies.'
              },
              {
                it: 'So spiegare perché il PAT resta univoco anche con porte sorgente uguali.',
                en: 'I can explain why PAT stays unambiguous even with equal source ports.'
              }
            ]
          }
        ]
      },
      {
        id: 'ip-services-ntp',
        title: {
          it: 'NTP: sincronizzazione del tempo',
          en: 'NTP: time synchronization'
        },
        objectives: [
          {
            it: 'Spiegare la gerarchia NTP a stratum, i ruoli client, server e peer, e il trasporto su UDP 123.',
            en: 'Explain the NTP stratum hierarchy, the client, server, and peer roles, and the transport over UDP 123.'
          },
          {
            it: 'Argomentare perché un tempo accurato è un prerequisito di sicurezza, non una comodità.',
            en: 'Argue why accurate time is a security prerequisite, not a convenience.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere UDP e il ruolo dei servizi IP di infrastruttura (argomenti DHCP e DNS di questo capitolo).',
            en: 'Know UDP and the role of infrastructure IP services (the DHCP and DNS topics of this chapter).'
          }
        ],
        theory: [
          {
            it: 'NTP allinea gli orologi dei dispositivi sulla rete usando UDP 123. Lo stratum misura la distanza da un riferimento autorevole: stratum 0 è l’orologio di riferimento (GPS, atomico), stratum 1 un server collegato direttamente a esso, e ogni salto aggiunge uno fino a 15; stratum 16 significa non sincronizzato. Si preferisce lo stratum più basso, cioè la sorgente più vicina al riferimento.',
            en: 'NTP aligns device clocks across the network over UDP 123. The stratum measures the distance from an authoritative reference: stratum 0 is the reference clock (GPS, atomic), stratum 1 a server directly attached to it, and each hop adds one up to 15; stratum 16 means unsynchronized. The lower stratum is preferred, that is the source closest to the reference.'
          },
          {
            it: 'Un dispositivo può agire da client, server o peer; configurare più sorgenti attendibili protegge da un singolo orologio guasto o malevolo. Senza protezione, un server NTP fasullo può spostare il tempo e con esso tutto ciò che vi dipende: per questo si usano l’autenticazione NTP e, sugli stack moderni, NTS (Network Time Security).',
            en: 'A device can act as client, server, or peer; configuring several trusted sources protects against a single faulty or malicious clock. Without protection, a rogue NTP server can shift time and everything that depends on it: this is why NTP authentication and, on modern stacks, NTS (Network Time Security) are used.'
          },
          {
            it: 'Il tempo accurato è un prerequisito di sicurezza. Senza di esso i log di dispositivi diversi non sono correlabili, le finestre di validità dei certificati non sono valutabili e i protocolli sensibili al tempo falliscono. È il motivo per cui NTP e i timestamp di syslog si configurano insieme, in UTC, così che un SIEM possa allineare gli eventi di apparati diversi allo stesso secondo.',
            en: 'Accurate time is a security prerequisite. Without it the logs of different devices cannot be correlated, certificate validity windows cannot be judged, and time-sensitive protocols fail. This is why NTP and syslog timestamps are configured together, in UTC, so that a SIEM can line up events from different devices to the same second.'
          }
        ],
        example: {
          it: 'Configurando due server NTP attendibili e marcando il syslog con il tempo NTP in UTC, un SIEM allinea gli eventi di apparati diversi allo stesso secondo; un dispositivo fermo a stratum 16 rivela una sincronizzazione rotta.',
          en: 'Configuring two trusted NTP servers and stamping syslog with NTP time in UTC, a SIEM lines up events from different devices to the same second; a device stuck at stratum 16 reveals a broken synchronization.'
        },
        commonMistakes: [
          {
            it: 'Trattare la sincronizzazione del tempo come cosmetica: senza UTC accurato log e certificati non reggono.',
            en: 'Treating time synchronization as cosmetic: without accurate UTC, logs and certificates do not hold up.'
          },
          {
            it: 'Usare una sola sorgente NTP senza ridondanza né autenticazione: un orologio sbagliato diventa verità.',
            en: 'Using a single NTP source with no redundancy or authentication: one wrong clock becomes the truth.'
          },
          {
            it: 'Confondere lo stratum con la qualità assoluta: indica la distanza dal riferimento, non la precisione garantita.',
            en: 'Confusing stratum with absolute quality: it indicates the distance from the reference, not guaranteed accuracy.'
          }
        ],
        references: [{ kind: 'rfc', id: 'RFC 5905' }]
      },
      {
        diagram: 'qos',
        id: 'ip-services-qos',
        title: {
          it: 'QoS: classificazione, marcatura e gestione della congestione',
          en: 'QoS: classification, marking, and congestion handling'
        },
        objectives: [
          {
            it: 'Spiegare il comportamento per-hop (PHB) e perché la QoS conta solo quando il collegamento è congestionato.',
            en: 'Explain per-hop behavior (PHB) and why QoS matters only when the link is congested.'
          },
          {
            it: 'Distinguere la marcatura CoS (3 bit, livello 2) e DSCP (6 bit, livello 3) e dove ciascuna sopravvive.',
            en: 'Distinguish CoS marking (3 bits, layer 2) and DSCP (6 bits, layer 3) and where each one survives.'
          },
          {
            it: 'Confrontare policing e shaping e collocare il confine di fiducia (trust boundary).',
            en: 'Compare policing and shaping and place the trust boundary.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere l’header IP, la differenza tra livello 2 e livello 3 e il tag 802.1Q (capitolo Accesso alla rete).',
            en: 'Know the IP header, the difference between layer 2 and layer 3, and the 802.1Q tag (Network access chapter).'
          }
        ],
        theory: [
          {
            it: 'La QoS (Quality of Service) decide quali pacchetti hanno la precedenza quando un’interfaccia è congestionata, cioè quando arriva più traffico di quanto il collegamento possa trasmettere. Su un collegamento scarico non serve: passa tutto subito. Il modello pratico è DiffServ, in cui ogni router applica, salto per salto, un comportamento per-hop (PHB) in base a come il pacchetto è marcato. La QoS non crea banda: la assegna sotto contesa, decidendo chi aspetta e chi viene scartato.',
            en: 'QoS (Quality of Service) decides which packets get precedence when an interface is congested, that is when more traffic arrives than the link can transmit. On an idle link it does nothing: everything goes through at once. The practical model is DiffServ, where each router applies, hop by hop, a per-hop behavior (PHB) based on how the packet is marked. QoS does not create bandwidth: it allocates it under contention, deciding who waits and who is dropped.'
          },
          {
            it: 'Il traffico va prima classificato (riconosciuto: voce, video, dati) e poi marcato, cioè etichettato perché gli hop successivi non debbano riclassificarlo. A livello 2, dentro il tag 802.1Q, i 3 bit di CoS (Class of Service) danno 8 valori ma valgono solo sul singolo segmento Ethernet: un router che instrada rifà l’intestazione di livello 2 e la marcatura CoS si perde. A livello 3, il campo DSCP usa 6 bit dell’ottetto ToS/DS dell’header IP (64 valori) e viaggia end-to-end con il pacchetto. Valori notevoli: EF (Expedited Forwarding, DSCP 46) per la voce, la famiglia AF (Assured Forwarding) per i dati a priorità, CS0/DSCP 0 per il best effort.',
            en: 'Traffic is first classified (recognised: voice, video, data) and then marked, that is tagged so later hops need not reclassify it. At layer 2, inside the 802.1Q tag, the 3 CoS (Class of Service) bits give 8 values but apply only on a single Ethernet segment: a router that routes rebuilds the layer 2 header and the CoS marking is lost. At layer 3, the DSCP field uses 6 bits of the ToS/DS octet in the IP header (64 values) and travels end-to-end with the packet. Notable values: EF (Expedited Forwarding, DSCP 46) for voice, the AF (Assured Forwarding) family for prioritised data, CS0/DSCP 0 for best effort.'
          },
          {
            it: 'Quando l’interfaccia è piena i pacchetti si accodano. La gestione della congestione sceglie l’ordine di uscita delle code: la LLQ (Low Latency Queuing) dà una coda a priorità stretta alla voce, così EF esce per prima e con jitter minimo, mentre CBWFQ riserva una quota di banda alle altre classi. La prevenzione della congestione, con WRED, scarta in anticipo e in modo selettivo i pacchetti a priorità più bassa prima che la coda si riempia del tutto, evitando il tail drop che colpisce tutti allo stesso modo e sincronizza i flussi TCP.',
            en: 'When the interface is full, packets queue. Congestion management chooses the order in which queues drain: LLQ (Low Latency Queuing) gives voice a strict priority queue, so EF leaves first and with minimal jitter, while CBWFQ reserves a share of bandwidth for the other classes. Congestion avoidance, with WRED, drops lower-priority packets early and selectively before the queue fills completely, avoiding the tail drop that hits everyone equally and synchronises TCP flows.'
          },
          {
            it: 'Per far rispettare un tasso concordato ci sono due strumenti. Il policing misura il traffico e, se supera il limite, scarta o ri-marca subito i pacchetti in eccesso: non introduce ritardo ma causa perdita. Lo shaping invece bufferizza l’eccesso e lo rilascia in modo regolare: non scarta ma aggiunge ritardo, utile verso un collegamento più lento. Infine il confine di fiducia (trust boundary) è il punto fino al quale le marcature altrui sono credute: di norma si marca al bordo della rete (lo switch di accesso o il telefono IP) e non ci si fida delle marcature provenienti dai PC degli utenti, che potrebbero auto-promuoversi a EF.',
            en: 'To enforce an agreed rate there are two tools. Policing measures traffic and, if it exceeds the limit, immediately drops or re-marks the excess packets: it adds no delay but causes loss. Shaping instead buffers the excess and releases it smoothly: it does not drop but adds delay, useful toward a slower link. Finally, the trust boundary is the point up to which other devices’ markings are believed: markings are normally set at the network edge (the access switch or the IP phone), and markings coming from user PCs — which could promote themselves to EF — are not trusted.'
          }
        ],
        example: {
          it: 'Un telefono IP marca la voce come EF (DSCP 46); lo switch di accesso è il confine di fiducia e conferma quella marcatura, mentre azzera a 0 quella dei PC. Sul collegamento WAN congestionato la LLQ fa uscire per prima la voce, mentre una classe «scavenger» (CS1, DSCP 8) è la prima a essere scartata da WRED.',
          en: 'An IP phone marks voice as EF (DSCP 46); the access switch is the trust boundary and confirms that marking, while resetting PCs’ markings to 0. On the congested WAN link, LLQ drains voice first, while a “scavenger” class (CS1, DSCP 8) is the first to be dropped by WRED.'
        },
        commonMistakes: [
          {
            it: 'Credere che la QoS aggiunga banda: ridistribuisce solo ciò che c’è quando il collegamento è congestionato; su un link scarico non cambia nulla.',
            en: 'Believing QoS adds bandwidth: it only redistributes what is there when the link is congested; on an idle link it changes nothing.'
          },
          {
            it: 'Aspettarsi che la marcatura CoS sopravviva all’instradamento: i 3 bit CoS vivono nel tag 802.1Q di livello 2 e si perdono al primo router; per un trattamento end-to-end serve il DSCP di livello 3.',
            en: 'Expecting CoS marking to survive routing: the 3 CoS bits live in the layer 2 802.1Q tag and are lost at the first router; end-to-end treatment needs the layer 3 DSCP.'
          },
          {
            it: 'Confondere policing e shaping: il policing scarta o ri-marca l’eccesso (perdita, nessun ritardo), lo shaping lo bufferizza (ritardo, nessuna perdita).',
            en: 'Confusing policing and shaping: policing drops or re-marks the excess (loss, no delay), shaping buffers it (delay, no loss).'
          },
          {
            it: 'Fidarsi delle marcature che arrivano dagli host degli utenti: senza un confine di fiducia al bordo, qualunque PC può marcarsi EF e scavalcare la voce.',
            en: 'Trusting markings that arrive from user hosts: without a trust boundary at the edge, any PC can mark itself EF and jump ahead of voice.'
          }
        ],
        references: [
          { kind: 'rfc', id: 'RFC 2474' },
          { kind: 'rfc', id: 'RFC 4594' }
        ]
      }
    ]
  },
  {
    id: 'security-fundamentals',
    cert: 'both',
    order: 7,
    track: 'ccna',
    domain: 'security-fundamentals',
    title: { it: 'Fondamenti di sicurezza', en: 'Security fundamentals' },
    summary: {
      it: 'La terminologia di base della sicurezza: la triade CIA, la differenza tra minaccia, vulnerabilità e rischio, la superficie d’attacco e la difesa in profondità, con i controlli letti per funzione e per piano.',
      en: 'The base terminology of security: the CIA triad, the difference between threat, vulnerability and risk, the attack surface and defense in depth, with controls read by function and by plane.'
    },
    topics: [
      {
        id: 'cia-triad',
        title: { it: 'La triade CIA', en: 'The CIA triad' },
        objectives: [
          {
            it: 'Definire riservatezza, integrità e disponibilità e riconoscere quale proprietà protegge un dato controllo.',
            en: 'Define confidentiality, integrity and availability and recognise which property a given control protects.'
          },
          {
            it: 'Spiegare come autenticità e non ripudio estendono la triade CIA.',
            en: 'Explain how authenticity and non-repudiation extend the CIA triad.'
          }
        ],
        prerequisites: [
          {
            it: 'Avere un’idea di base di cosa sono dati, sistemi e utenti in una rete.',
            en: 'Have a basic idea of what data, systems and users are on a network.'
          }
        ],
        theory: [
          {
            it: 'La sicurezza delle informazioni poggia su tre obiettivi, riassunti nell’acronimo CIA: riservatezza (confidentiality), integrità (integrity) e disponibilità (availability). La riservatezza impedisce la divulgazione non autorizzata; l’integrità garantisce che i dati non siano alterati in modo non autorizzato; la disponibilità assicura che sistemi e dati siano accessibili a chi ne ha diritto quando servono.',
            en: 'Information security rests on three goals, summed up by the acronym CIA: confidentiality, integrity and availability. Confidentiality prevents unauthorised disclosure; integrity ensures data is not altered in an unauthorised way; availability ensures that systems and data are reachable by authorised users when needed.'
          },
          {
            it: 'Le tre proprietà sono spesso in tensione: cifrare tutto rafforza la riservatezza ma può ridurre la disponibilità se si perde una chiave; replicare i dati aumenta la disponibilità ma allarga la superficie da proteggere per la riservatezza. La sicurezza è quindi un bilanciamento guidato dal valore del bene e dal rischio, non la massimizzazione di una sola proprietà.',
            en: 'The three properties are often in tension: encrypting everything strengthens confidentiality but can reduce availability if a key is lost; replicating data increases availability but widens the surface to protect for confidentiality. Security is therefore a balance driven by the value of the asset and by risk, not the maximisation of a single property.'
          },
          {
            it: 'Alla triade si affiancano spesso autenticità (la garanzia che un’identità sia quella dichiarata) e non ripudio (l’impossibilità di negare un’azione compiuta). Un controllo va sempre letto chiedendosi quale proprietà protegge: così si evita di accumulare misure ridondanti sulla stessa proprietà lasciandone un’altra scoperta.',
            en: 'The triad is often complemented by authenticity (the assurance that an identity is what it claims to be) and non-repudiation (the inability to deny an action taken). A control should always be read by asking which property it protects: this avoids piling up redundant measures on one property while leaving another exposed.'
          }
        ],
        example: {
          it: 'Un backup cifrato e firmato protegge tutte e tre le proprietà: la cifratura la riservatezza, la firma l’integrità e l’autenticità, la copia ulteriore la disponibilità in caso di ransomware.',
          en: 'An encrypted, signed backup protects all three properties: encryption for confidentiality, the signature for integrity and authenticity, the extra copy for availability in case of ransomware.'
        },
        commonMistakes: [
          {
            it: 'Ridurre la sicurezza alla sola riservatezza: un sistema cifrato ma irraggiungibile ha comunque fallito sulla disponibilità.',
            en: 'Reducing security to confidentiality alone: an encrypted but unreachable system has still failed on availability.'
          },
          {
            it: 'Trattare integrità e autenticità come sinonimi: l’integrità dice che il dato non è cambiato, l’autenticità dice chi lo ha prodotto.',
            en: 'Treating integrity and authenticity as synonyms: integrity says the data has not changed, authenticity says who produced it.'
          }
        ],
        lab: 'defense',
        references: [{ kind: 'nist', id: 'SP 800-53 Rev. 5' }]
      },
      {
        id: 'threat-vuln-risk',
        title: { it: 'Minaccia, vulnerabilità e rischio', en: 'Threat, vulnerability and risk' },
        objectives: [
          {
            it: 'Distinguere minaccia, vulnerabilità e rischio e combinarli in una valutazione del rischio.',
            en: 'Distinguish threat, vulnerability and risk and combine them into a risk assessment.'
          },
          {
            it: 'Descrivere la superficie d’attacco e come ridurla.',
            en: 'Describe the attack surface and how to reduce it.'
          }
        ],
        prerequisites: [{ it: 'Conoscere la triade CIA.', en: 'Know the CIA triad.' }],
        theory: [
          {
            it: 'Una minaccia è un evento o un attore che può causare un danno; una vulnerabilità è una debolezza che la minaccia può sfruttare; il rischio è la combinazione della probabilità che ciò accada e dell’impatto se accade. In forma sintetica: rischio ≈ minaccia × vulnerabilità × impatto. Senza una vulnerabilità sfruttabile una minaccia resta potenziale; senza una minaccia credibile una vulnerabilità ha rischio basso.',
            en: 'A threat is an event or actor that can cause harm; a vulnerability is a weakness the threat can exploit; risk is the combination of the likelihood that this happens and the impact if it does. In short: risk ≈ threat × vulnerability × impact. Without an exploitable vulnerability a threat stays potential; without a credible threat a vulnerability carries low risk.'
          },
          {
            it: 'La superficie d’attacco è l’insieme dei punti in cui un attaccante può tentare di entrare o estrarre dati: porte aperte, servizi esposti, interfacce di gestione, credenziali, dipendenze software. Ridurla — chiudendo ciò che non serve, segmentando e applicando il minimo privilegio — abbassa il rischio prima ancora di aggiungere difese attive.',
            en: 'The attack surface is the set of points where an attacker can try to get in or pull data out: open ports, exposed services, management interfaces, credentials, software dependencies. Reducing it — closing what is not needed, segmenting and applying least privilege — lowers risk before any active defence is even added.'
          },
          {
            it: 'Il rischio si tratta in quattro modi: mitigare (ridurlo con controlli), trasferire (per esempio assicurarlo), accettare (consapevolmente, se basso) o evitare (rinunciando all’attività). La scelta dipende dal rischio residuo tollerabile: nessun sistema reale ha rischio zero, quindi l’obiettivo è portarlo a un livello accettabile e documentato.',
            en: 'Risk is treated in four ways: mitigate (reduce it with controls), transfer (for example insure it), accept (knowingly, if low) or avoid (by dropping the activity). The choice depends on the tolerable residual risk: no real system has zero risk, so the goal is to bring it to an accepted, documented level.'
          }
        ],
        example: {
          it: 'Un servizio di gestione raggiungibile da Internet (vulnerabilità) con attaccanti che scansionano di continuo (minaccia) dà un rischio alto; spostarlo su una rete di gestione isolata riduce la superficie e quindi il rischio, senza eliminare la vulnerabilità del servizio in sé.',
          en: 'A management service reachable from the Internet (vulnerability) with attackers constantly scanning (threat) gives a high risk; moving it onto an isolated management network reduces the surface and therefore the risk, without removing the vulnerability of the service itself.'
        },
        commonMistakes: [
          {
            it: 'Confondere vulnerabilità e rischio: una vulnerabilità senza minaccia credibile o impatto rilevante può avere rischio basso, e va prioritizzata di conseguenza.',
            en: 'Confusing vulnerability and risk: a vulnerability with no credible threat or meaningful impact can carry low risk, and should be prioritised accordingly.'
          },
          {
            it: 'Cercare il rischio zero: è irraggiungibile e costoso; l’obiettivo è il rischio residuo accettabile.',
            en: 'Chasing zero risk: it is unreachable and costly; the goal is an acceptable residual risk.'
          }
        ],
        lab: 'defense',
        references: [{ kind: 'nist', id: 'SP 800-30 Rev. 1' }]
      },
      {
        id: 'defense-in-depth',
        title: { it: 'Difesa in profondità e funzioni dei controlli', en: 'Defense in depth and control functions' },
        objectives: [
          {
            it: 'Spiegare la difesa in profondità e perché nessun singolo controllo è sufficiente.',
            en: 'Explain defense in depth and why no single control is sufficient.'
          },
          {
            it: 'Classificare i controlli per funzione (preventiva, detective, contenimento, ripristino, compensativa) e per piano.',
            en: 'Classify controls by function (preventive, detective, containment, recovery, compensating) and by plane.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere la triade CIA e la terminologia di minaccia, vulnerabilità e rischio.',
            en: 'Know the CIA triad and the threat, vulnerability and risk terminology.'
          }
        ],
        theory: [
          {
            it: 'La difesa in profondità dispone più controlli indipendenti su livelli diversi, così che il fallimento di uno non comprometta l’intero sistema. L’idea complementare è il minimo privilegio: ogni utente, servizio o dispositivo riceve solo gli accessi necessari. Insieme riducono sia la probabilità sia l’impatto di un attacco.',
            en: 'Defense in depth places several independent controls at different layers, so that the failure of one does not compromise the whole system. The complementary idea is least privilege: every user, service or device gets only the access it needs. Together they reduce both the likelihood and the impact of an attack.'
          },
          {
            it: 'I controlli si classificano per funzione: preventiva (impedisce l’evento, come un’ACL), detective (lo rileva, come un IDS o la telemetria), di contenimento (ne limita la propagazione, come la segmentazione), di ripristino (riporta il servizio, come un backup) e compensativa (surroga un controllo mancante). Una buona architettura copre tutte le funzioni, non solo la prevenzione.',
            en: 'Controls are classified by function: preventive (stops the event, like an ACL), detective (detects it, like an IDS or telemetry), containment (limits its spread, like segmentation), recovery (restores the service, like a backup) and compensating (stands in for a missing control). A good architecture covers every function, not only prevention.'
          },
          {
            it: 'Ogni controllo va valutato come un sistema: punto di enforcement, prerequisiti, come si verifica che funzioni e qual è il suo limite operativo. Un controllo configurato ma non verificato dà una falsa sicurezza; e nessun controllo, da solo, protegge tutte le proprietà CIA su tutti i piani.',
            en: 'Every control should be assessed as a system: its enforcement point, prerequisites, how you verify it works and what its operational limit is. A control that is configured but not verified gives false assurance; and no control, on its own, protects every CIA property across every plane.'
          }
        ],
        example: {
          it: 'Contro il furto di credenziali si combinano più funzioni: MFA (preventiva), log di accesso anomalo (detective), blocco della sessione (contenimento) e reset delle credenziali (ripristino); nessuna delle quattro, da sola, chiude il problema.',
          en: 'Against credential theft several functions are combined: MFA (preventive), anomalous-login logs (detective), session lockout (containment) and credential reset (recovery); none of the four, on its own, closes the problem.'
        },
        commonMistakes: [
          {
            it: 'Accumulare controlli solo preventivi: senza funzioni detective e di ripristino, un attacco che supera la prevenzione resta invisibile e irreversibile.',
            en: 'Piling up only preventive controls: without detective and recovery functions, an attack that gets past prevention stays invisible and irreversible.'
          },
          {
            it: 'Considerare un controllo efficace perché configurato: senza verifica e senza conoscerne il limite operativo, può non proteggere nulla.',
            en: 'Considering a control effective because it is configured: without verification and without knowing its operational limit, it may protect nothing.'
          }
        ],
        lab: 'defense',
        references: [{ kind: 'nist', id: 'SP 800-53 Rev. 5' }],
        guidedLabs: [
          {
            id: 'gl-defense-functions',
            title: { it: 'Classifica i controlli per funzione', en: 'Classify controls by function' },
            difficulty: 'core',
            lab: 'defense',
            scenario: {
              it: 'Il laboratorio «Controlli difensivi» elenca i controlli con funzione, punto di enforcement, dipendenze, verifica e limite operativo, e permette di filtrarli per funzione e per piano.',
              en: 'The “Defensive controls” lab lists controls with their function, enforcement point, dependencies, verification and operational limit, and lets you filter them by function and by plane.'
            },
            task: {
              it: 'Usando il filtro per funzione, trova almeno un controllo per ciascuna delle cinque funzioni (preventiva, detective, contenimento, ripristino, compensativa) e annota per ognuno il punto di enforcement.',
              en: 'Using the function filter, find at least one control for each of the five functions (preventive, detective, containment, recovery, compensating) and note each one’s enforcement point.'
            },
            steps: [
              {
                it: 'Apri «Controlli difensivi» e imposta il filtro «Funzione» su una funzione per volta.',
                en: 'Open “Defensive controls” and set the “Function” filter to one function at a time.'
              },
              {
                it: 'Per ogni funzione scegli un controllo e leggi enforcement, dipendenze, verifica e limite operativo.',
                en: 'For each function pick a control and read its enforcement, dependencies, verification and operational limit.'
              },
              {
                it: 'Nota come lo stesso controllo spesso copre più funzioni: la classificazione non è esclusiva.',
                en: 'Notice how the same control often covers several functions: the classification is not exclusive.'
              }
            ],
            challenge: {
              it: 'Trova un controllo che sia al tempo stesso preventivo e di ripristino e spiega perché compare sotto entrambe le funzioni.',
              en: 'Find a control that is both preventive and recovery and explain why it appears under both functions.'
            },
            solution: [
              {
                it: 'Filtrando per funzione si trovano, ad esempio: preventiva → segmentazione o AAA/MFA; detective → telemetria e fonti indipendenti; contenimento → first hop security di livello 2; ripristino → guardrail di automazione e recovery; compensativa → un controllo che surroga una misura mancante. Il punto di enforcement è dove il controllo agisce (porta, interfaccia, identità, piano di gestione).',
                en: 'Filtering by function yields, for example: preventive → segmentation or AAA/MFA; detective → telemetry and independent sources; containment → first hop security at Layer 2; recovery → automation and recovery guardrails; compensating → a control that stands in for a missing measure. The enforcement point is where the control acts (port, interface, identity, management plane).'
              },
              {
                it: 'Sfida: un controllo come la crittografia con PKI e VPN può essere preventivo (riservatezza in transito) e insieme contribuire al ripristino di una comunicazione fidata dopo un incidente; compare sotto più funzioni perché protegge proprietà diverse in momenti diversi.',
                en: 'Challenge: a control such as cryptography with PKI and VPN can be preventive (confidentiality in transit) and at the same time help restore trusted communication after an incident; it appears under several functions because it protects different properties at different times.'
              }
            ],
            selfCheck: [
              {
                it: 'So assegnare a ciascuna delle cinque funzioni almeno un controllo con il suo punto di enforcement.',
                en: 'I can assign at least one control, with its enforcement point, to each of the five functions.'
              },
              {
                it: 'So spiegare perché un controllo può coprire più funzioni insieme.',
                en: 'I can explain why one control can cover several functions at once.'
              }
            ]
          },
          {
            id: 'gl-defense-cia-plane',
            title: { it: 'Mappa un controllo a CIA e al piano', en: 'Map a control to CIA and to the plane' },
            difficulty: 'core',
            lab: 'defense',
            scenario: {
              it: 'Nel laboratorio «Controlli difensivi» ogni controllo indica i piani che tocca (fisico, dati, controllo, gestione, applicazione, identità) e ciò che contrasta, oltre al suo limite operativo.',
              en: 'In the “Defensive controls” lab each control shows the planes it touches (physical, data, control, management, application, identity) and what it counters, along with its operational limit.'
            },
            task: {
              it: 'Scegli due controlli, determina quale proprietà della triade CIA protegge principalmente ciascuno e su quale piano agisce, e individua il suo limite operativo.',
              en: 'Pick two controls, determine which CIA property each one mainly protects and on which plane it acts, and identify its operational limit.'
            },
            steps: [
              {
                it: 'Apri «Controlli difensivi» e usa il filtro «Piano» per isolare i controlli di un piano.',
                en: 'Open “Defensive controls” and use the “Plane” filter to isolate the controls of one plane.'
              },
              {
                it: 'Per ogni controllo scelto leggi cosa contrasta e deduci quale proprietà CIA protegge in primo luogo.',
                en: 'For each chosen control read what it counters and deduce which CIA property it primarily protects.'
              },
              {
                it: 'Annota il limite operativo: cosa il controllo non copre, così da capire quale altro controllo serve accanto.',
                en: 'Note the operational limit: what the control does not cover, so you understand which other control is needed alongside it.'
              }
            ],
            challenge: {
              it: 'Trova un controllo che protegge soprattutto la disponibilità e spiega perché non basta da solo per riservatezza e integrità.',
              en: 'Find a control that mainly protects availability and explain why it is not enough on its own for confidentiality and integrity.'
            },
            solution: [
              {
                it: 'Esempi: la crittografia con VPN protegge soprattutto la riservatezza (e l’integrità in transito) sul piano dei dati; la segmentazione protegge integrità e disponibilità limitando la portata di un attacco sui piani di controllo e dati; la protezione della disponibilità e della capacità agisce sulla disponibilità. Il limite operativo indica cosa resta scoperto — per esempio la cifratura non impedisce un attacco di esaurimento delle risorse.',
                en: 'Examples: cryptography with VPN mainly protects confidentiality (and integrity in transit) on the data plane; segmentation protects integrity and availability by limiting the reach of an attack on the control and data planes; availability and capacity protection acts on availability. The operational limit shows what stays exposed — for example encryption does not stop a resource-exhaustion attack.'
              },
              {
                it: 'Sfida: un controllo di disponibilità (per esempio la protezione da esaurimento delle risorse) mantiene il servizio raggiungibile ma non cifra né autentica nulla: servono controlli distinti per riservatezza e integrità, perché nessuna singola misura copre tutta la triade CIA.',
                en: 'Challenge: an availability control (for example resource-exhaustion protection) keeps the service reachable but encrypts and authenticates nothing: separate controls are needed for confidentiality and integrity, because no single measure covers the whole CIA triad.'
              }
            ],
            selfCheck: [
              {
                it: 'So collegare un controllo alla proprietà CIA che protegge e al piano su cui agisce.',
                en: 'I can link a control to the CIA property it protects and to the plane it acts on.'
              },
              {
                it: 'So leggere il limite operativo di un controllo e dedurre quale controllo complementare serve.',
                en: 'I can read a control’s operational limit and infer which complementary control is needed.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'attacks-osi-killchain',
    cert: 'securityplus',
    order: 8,
    track: 'extension',
    title: { it: 'Attacchi per livello OSI e kill chain', en: 'Attacks by OSI layer and the kill chain' },
    summary: {
      it: 'Come gli attacchi si mappano ai livelli OSI, le fasi della kill chain e i percorsi d’attacco multi-stadio: leggere un attacco per livello e per fase aiuta a scegliere dove la difesa lo interrompe.',
      en: 'How attacks map to the OSI layers, the phases of the kill chain and multi-stage attack paths: reading an attack by layer and by phase helps choose where the defence breaks it.'
    },
    topics: [
      {
        id: 'attacks-by-layer',
        title: { it: 'Attacchi mappati ai livelli OSI', en: 'Attacks mapped to the OSI layers' },
        objectives: [
          {
            it: 'Associare attacchi tipici a ciascun livello OSI, dal livello 1 al livello 7.',
            en: 'Associate typical attacks with each OSI layer, from layer 1 to layer 7.'
          },
          {
            it: 'Spiegare perché il livello di un attacco determina dove va collocata la difesa.',
            en: 'Explain why an attack’s layer determines where the defence belongs.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere i sette livelli OSI e la triade CIA.',
            en: 'Know the seven OSI layers and the CIA triad.'
          }
        ],
        theory: [
          {
            it: 'Ogni attacco colpisce principalmente un livello OSI, e il livello suggerisce dove difendersi. Al livello 1 (fisico) rientrano il tapping di un cavo e il jamming radio; al livello 2 (collegamento) l’ARP spoofing/MITM, il MAC flooding e la DHCP starvation; al livello 3 (rete) l’IP spoofing, il BGP hijacking, lo smurf e gli attacchi di frammentazione.',
            en: 'Each attack mainly hits one OSI layer, and the layer suggests where to defend. Layer 1 (physical) covers cable tapping and radio jamming; layer 2 (data link) covers ARP spoofing/MITM, MAC flooding and DHCP starvation; layer 3 (network) covers IP spoofing, BGP hijacking, smurf and fragmentation attacks.'
          },
          {
            it: 'Salendo: al livello 4 (trasporto) i flood DoS come il SYN flood, i reset TCP forgiati, gli UDP flood e le scansioni di porta; al livello 5 (sessione) il session hijacking e il replay; al livello 6 (presentazione) gli attacchi alla cifratura come il padding oracle; al livello 7 (applicazione) injection, XSS, DNS poisoning, SSH brute force e slowloris.',
            en: 'Going up: layer 4 (transport) has DoS floods such as the SYN flood, forged TCP resets, UDP floods and port scans; layer 5 (session) has session hijacking and replay; layer 6 (presentation) has attacks on encryption such as the padding oracle; layer 7 (application) has injection, XSS, DNS poisoning, SSH brute force and slowloris.'
          },
          {
            it: 'Mappare l’attacco al livello evita difese fuori posto: un firewall di livello 3/4 non ferma un’injection di livello 7, e una ACL non protegge dal tapping fisico di livello 1. La difesa efficace agisce al livello giusto o lo compensa esplicitamente a un altro livello.',
            en: 'Mapping the attack to the layer avoids misplaced defences: a layer 3/4 firewall does not stop a layer 7 injection, and an ACL does not protect against layer 1 physical tapping. Effective defence acts at the right layer or explicitly compensates for it at another layer.'
          }
        ],
        example: {
          it: 'Un MAC flooding riempie la tabella CAM di uno switch (livello 2) e lo forza a inondare il traffico: la difesa corretta è la port security sulla porta di accesso, non un controllo di livello superiore.',
          en: 'A MAC flooding fills a switch’s CAM table (layer 2) and forces it to flood traffic: the correct defence is port security on the access port, not a higher-layer control.'
        },
        commonMistakes: [
          {
            it: 'Pensare che un firewall perimetrale fermi tutto: non vede gli attacchi di livello 2 interni né molte minacce applicative di livello 7.',
            en: 'Thinking a perimeter firewall stops everything: it sees neither internal layer 2 attacks nor many layer 7 application threats.'
          },
          {
            it: 'Confondere il livello del sintomo con quello della causa: un servizio lento (apparente livello 7) può derivare da un flood di livello 4.',
            en: 'Confusing the layer of the symptom with that of the cause: a slow service (apparent layer 7) can come from a layer 4 flood.'
          }
        ],
        lab: 'attacklab',
        references: [{ kind: 'attack', id: 'T1046' }]
      },
      {
        id: 'cyber-kill-chain',
        title: { it: 'La kill chain', en: 'The kill chain' },
        objectives: [
          {
            it: 'Elencare le fasi della cyber kill chain e che cosa cerca di ottenere l’attaccante in ciascuna.',
            en: 'List the phases of the cyber kill chain and what the attacker seeks in each.'
          },
          {
            it: 'Indicare, per ogni fase, un controllo difensivo che la interrompe.',
            en: 'Give, for each phase, a defensive control that disrupts it.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere la terminologia di minaccia, vulnerabilità e rischio.',
            en: 'Know the threat, vulnerability and risk terminology.'
          }
        ],
        theory: [
          {
            it: 'La cyber kill chain descrive un attacco come una sequenza di fasi; nel modello di Lockheed Martin sono sette: ricognizione (reconnaissance), armamento (weaponization), consegna (delivery), sfruttamento (exploitation), installazione (installation), comando e controllo (Command & Control, C2) e azioni sull’obiettivo (actions on objectives). L’attaccante deve completarle quasi tutte; al difensore basta spezzarne una.',
            en: 'The cyber kill chain describes an attack as a sequence of phases; in the Lockheed Martin model there are seven: reconnaissance, weaponization, delivery, exploitation, installation, Command & Control (C2) and actions on objectives. The attacker must complete nearly all of them; the defender only needs to break one.'
          },
          {
            it: 'Le prime fasi avvengono spesso fuori dal perimetro (ricognizione su fonti pubbliche, preparazione del payload); le fasi centrali toccano la vittima (consegna via e-mail o servizio esposto, sfruttamento di una vulnerabilità, installazione di un impianto); le ultime stabiliscono il controllo remoto e perseguono l’obiettivo, come l’esfiltrazione o il movimento laterale.',
            en: 'The early phases often happen outside the perimeter (reconnaissance on public sources, payload preparation); the middle phases touch the victim (delivery via e-mail or an exposed service, exploitation of a vulnerability, installation of an implant); the last ones establish remote control and pursue the objective, such as exfiltration or lateral movement.'
          },
          {
            it: 'A ogni fase corrisponde una difesa: formazione e riduzione dell’esposizione contro la ricognizione, filtraggio e sandboxing contro la consegna, patch contro lo sfruttamento, segmentazione e telemetria contro il movimento laterale, blocco del C2 e monitoraggio delle uscite contro l’esfiltrazione. La difesa in profondità funziona perché copre più fasi.',
            en: 'Each phase has a matching defence: training and exposure reduction against reconnaissance, filtering and sandboxing against delivery, patching against exploitation, segmentation and telemetry against lateral movement, C2 blocking and egress monitoring against exfiltration. Defense in depth works because it covers several phases.'
          }
        ],
        example: {
          it: 'In un phishing con allegato: la ricognizione individua i nomi, la consegna arriva via e-mail, lo sfruttamento apre l’allegato, l’installazione lascia un impianto, il C2 lo comanda; un filtro che blocca l’allegato spezza la catena già alla consegna.',
          en: 'In a phishing attack with an attachment: reconnaissance finds the names, delivery arrives via e-mail, exploitation opens the attachment, installation drops an implant, C2 commands it; a filter that blocks the attachment breaks the chain already at delivery.'
        },
        commonMistakes: [
          {
            it: 'Difendere solo l’ultima fase: se si guarda solo all’esfiltrazione, si perdono le molte occasioni di fermare l’attacco prima.',
            en: 'Defending only the last phase: looking only at exfiltration misses the many chances to stop the attack earlier.'
          },
          {
            it: 'Trattare la kill chain come lineare e rigida: attacchi reali saltano fasi o le ripetono, ma il valore del modello è indicare dove intervenire.',
            en: 'Treating the kill chain as linear and rigid: real attacks skip phases or repeat them, but the model’s value is in showing where to intervene.'
          }
        ],
        lab: 'attacklab',
        references: [{ kind: 'attack', id: 'T1190' }]
      },
      {
        id: 'multi-stage-attack-paths',
        title: { it: 'Percorsi d’attacco multi-stadio', en: 'Multi-stage attack paths' },
        objectives: [
          {
            it: 'Ricostruire un percorso d’attacco che concatena più stadi attraverso livelli diversi.',
            en: 'Reconstruct an attack path that chains several stages across different layers.'
          },
          {
            it: 'Individuare il controllo che spezza la catena il prima possibile.',
            en: 'Identify the control that breaks the chain as early as possible.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere la mappa attacco→livello OSI e le fasi della kill chain.',
            en: 'Know the attack→OSI layer mapping and the phases of the kill chain.'
          }
        ],
        theory: [
          {
            it: 'Gli attacchi reali raramente si fermano a un solo livello: un percorso tipico parte da una ricognizione, ottiene un punto d’appoggio su un livello, poi devia il traffico o scala verso risorse più preziose. L’app modella questi percorsi come stadi concatenati, ciascuno con il proprio obiettivo intermedio.',
            en: 'Real attacks rarely stop at a single layer: a typical path starts from reconnaissance, gains a foothold at one layer, then redirects traffic or escalates toward more valuable assets. The app models these paths as chained stages, each with its own intermediate goal.'
          },
          {
            it: 'Per esempio il percorso «Dall’accesso fisico al controllo del dominio Layer 2» concatena scoperta del segmento, estensione della raggiungibilità (un trunk o VLAN non previste), deviazione del traffico ed esaurimento delle risorse di livello 2; il percorso «Deviazione del traffico tramite il control plane» mappa il routing, falsifica la sorgente e inserisce una rotta.',
            en: 'For example the path “From physical access to Layer 2 domain control” chains segment discovery, reachability expansion (a trunk or unintended VLANs), traffic redirection and layer 2 resource exhaustion; the path “Traffic detour through the control plane” maps the routing, forges the source and inserts a route.'
          },
          {
            it: 'La lezione difensiva è spezzare la catena il prima possibile: un singolo controllo ben posizionato — port security, DHCP snooping, Dynamic ARP Inspection, autenticazione del routing — può rendere impercorribile uno stadio e fermare tutto il percorso. È la difesa in profondità applicata a una sequenza.',
            en: 'The defensive lesson is to break the chain as early as possible: a single well-placed control — port security, DHCP snooping, Dynamic ARP Inspection, routing authentication — can make one stage impassable and stop the whole path. It is defense in depth applied to a sequence.'
          }
        ],
        example: {
          it: 'Nel percorso Layer 2, abilitare port security e DHCP snooping blocca già lo stadio iniziale: senza raggiungibilità estesa, la deviazione del traffico e l’esaurimento non avvengono.',
          en: 'In the Layer 2 path, enabling port security and DHCP snooping already blocks the initial stage: without extended reachability, the traffic redirection and exhaustion do not happen.'
        },
        commonMistakes: [
          {
            it: 'Analizzare gli stadi isolatamente: il rischio nasce dalla concatenazione, non dal singolo passo preso da solo.',
            en: 'Analysing the stages in isolation: the risk comes from the chaining, not from a single step taken alone.'
          },
          {
            it: 'Rincorrere l’ultimo stadio: conviene investire nei controlli che rendono impossibili i primi, dove l’attaccante ha meno appigli.',
            en: 'Chasing the last stage: it is better to invest in the controls that make the first ones impossible, where the attacker has the least foothold.'
          }
        ],
        lab: 'attackpaths',
        references: [{ kind: 'attack', id: 'T1046' }],
        guidedLabs: [
          {
            id: 'gl-attack-layer-killchain',
            title: {
              it: 'Mappa un attacco al livello OSI e traccia la kill chain',
              en: 'Map an attack to its OSI layer and trace the kill chain'
            },
            difficulty: 'core',
            lab: 'attacklab',
            scenario: {
              it: 'Il laboratorio «Attacco & Difesa» mostra per ogni scenario il livello OSI, una kill chain passo-passo con i ruoli di attaccante e difensore e il punto esatto in cui la contromisura neutralizza l’attacco.',
              en: 'The “Attack & defense” lab shows, for each scenario, the OSI layer, a step-by-step kill chain with the attacker and defender roles, and the exact point where the countermeasure neutralises the attack.'
            },
            task: {
              it: 'Scegli tre scenari su livelli OSI diversi; per ciascuno indica il livello, riassumi i passi dell’attaccante e individua in quale passo la difesa interviene.',
              en: 'Pick three scenarios on different OSI layers; for each, state the layer, summarise the attacker’s steps and identify at which step the defence intervenes.'
            },
            steps: [
              {
                it: 'Apri «Attacco & Difesa» e scegli uno scenario per ogni fascia di livelli (basso, medio, alto).',
                en: 'Open “Attack & defense” and pick one scenario for each band of layers (low, middle, high).'
              },
              {
                it: 'Leggi il livello OSI indicato e segui i passi alternati di attaccante e difensore.',
                en: 'Read the stated OSI layer and follow the alternating attacker and defender steps.'
              },
              {
                it: 'Annota il passo in cui la contromisura neutralizza l’attacco e a quale fase della kill chain corrisponde.',
                en: 'Note the step where the countermeasure neutralises the attack and which kill-chain phase it corresponds to.'
              }
            ],
            challenge: {
              it: 'Trova due attacchi su livelli diversi che condividono la stessa contromisura e spiega perché un solo controllo copre entrambi.',
              en: 'Find two attacks on different layers that share the same countermeasure and explain why one control covers both.'
            },
            solution: [
              {
                it: 'Esempi: MAC flooding (livello 2) → port security che limita i MAC per porta; SYN flood (livello 4) → SYN cookies e limiti di stato; DNS poisoning (livello 7) → validazione delle risposte e sorgenti fidate. In ciascuno il passo difensivo coincide con la fase della kill chain in cui l’attacco diventa visibile o bloccabile.',
                en: 'Examples: MAC flooding (layer 2) → port security limiting the MAC addresses per port; SYN flood (layer 4) → SYN cookies and state limits; DNS poisoning (layer 7) → answer validation and trusted sources. In each the defensive step coincides with the kill-chain phase where the attack becomes visible or blockable.'
              },
              {
                it: 'Sfida: port security e Dynamic ARP Inspection, pur mirando a livelli diversi, nascono dalla stessa idea — fidarsi solo di binding noti su una porta — quindi un’unica disciplina di first hop security di livello 2 contrasta più attacchi insieme.',
                en: 'Challenge: port security and Dynamic ARP Inspection, though aimed at different layers, come from the same idea — trust only known bindings on a port — so a single Layer 2 first hop security discipline counters several attacks at once.'
              }
            ],
            selfCheck: [
              {
                it: 'So assegnare un attacco al suo livello OSI e riassumerne i passi.',
                en: 'I can assign an attack to its OSI layer and summarise its steps.'
              },
              {
                it: 'So indicare in quale passo e fase la difesa interrompe l’attacco.',
                en: 'I can state at which step and phase the defence breaks the attack.'
              }
            ]
          },
          {
            id: 'gl-break-attack-path',
            title: { it: 'Spezza un percorso d’attacco multi-stadio', en: 'Break a multi-stage attack path' },
            difficulty: 'advanced',
            lab: 'attackpaths',
            scenario: {
              it: 'Il laboratorio «Percorsi d’attacco» presenta attacchi reali come sequenze di stadi concatenati, ciascuno con obiettivo, famiglie coinvolte e impatto.',
              en: 'The “Attack paths” lab presents real attacks as sequences of chained stages, each with its goal, the families involved and the impact.'
            },
            task: {
              it: 'Scegli un percorso, elenca i suoi stadi in ordine e individua il primo stadio in cui un singolo controllo spezza l’intera catena.',
              en: 'Pick a path, list its stages in order and identify the earliest stage where a single control breaks the whole chain.'
            },
            steps: [
              {
                it: 'Apri «Percorsi d’attacco» e seleziona un percorso, per esempio quello di dominio Layer 2.',
                en: 'Open “Attack paths” and select a path, for example the Layer 2 domain one.'
              },
              {
                it: 'Elenca gli stadi in ordine e annota l’obiettivo intermedio di ciascuno.',
                en: 'List the stages in order and note the intermediate goal of each.'
              },
              {
                it: 'Per ogni stadio chiediti quale controllo lo renderebbe impercorribile e scegli quello che agisce il prima possibile.',
                en: 'For each stage ask which control would make it impassable and choose the one that acts as early as possible.'
              }
            ],
            challenge: {
              it: 'Confronta due percorsi diversi e trova un controllo comune che li spezza entrambi su uno stadio iniziale.',
              en: 'Compare two different paths and find a common control that breaks both at an early stage.'
            },
            solution: [
              {
                it: 'Nel percorso «Dall’accesso fisico al controllo del dominio Layer 2» gli stadi sono scoperta del segmento → estensione della raggiungibilità → deviazione del traffico → esaurimento delle risorse. Abilitare port security e DHCP snooping sullo stadio iniziale nega la raggiungibilità estesa, e gli stadi successivi non possono avvenire.',
                en: 'In the path “From physical access to Layer 2 domain control” the stages are segment discovery → reachability expansion → traffic redirection → resource exhaustion. Enabling port security and DHCP snooping at the initial stage denies extended reachability, and the later stages cannot happen.'
              },
              {
                it: 'Sfida: sia il percorso Layer 2 sia la deviazione del traffico tramite il control plane dipendono da una ricognizione iniziale e da binding non validati; disabilitare i protocolli di scoperta non necessari e autenticare routing e first hop security spezza entrambi vicino all’inizio.',
                en: 'Challenge: both the Layer 2 path and the traffic detour through the control plane depend on an initial reconnaissance and on unvalidated bindings; disabling unnecessary discovery protocols and authenticating routing and first hop security breaks both near the start.'
              }
            ],
            selfCheck: [
              {
                it: 'So ricostruire gli stadi di un percorso d’attacco nell’ordine corretto.',
                en: 'I can reconstruct the stages of an attack path in the correct order.'
              },
              {
                it: 'So scegliere il controllo che spezza la catena nello stadio più precoce.',
                en: 'I can choose the control that breaks the chain at the earliest stage.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'network-defenses',
    cert: 'both',
    order: 9,
    track: 'ccna',
    domain: 'security-fundamentals',
    title: {
      it: 'Difese di rete: ACL, firewall, IDS/IPS e segmentazione',
      en: 'Network defenses: ACLs, firewalls, IDS/IPS and segmentation'
    },
    summary: {
      it: 'I controlli che filtrano e sorvegliano il traffico: ACL e filtraggio dei pacchetti, firewall stateful con ordine delle regole, IDS/IPS fra rilevamento e blocco, e la segmentazione fino allo Zero Trust.',
      en: 'The controls that filter and watch traffic: ACLs and packet filtering, stateful firewalls with rule order, IDS/IPS between detection and blocking, and segmentation up to Zero Trust.'
    },
    topics: [
      {
        id: 'acl-packet-filtering',
        title: { it: 'ACL e filtraggio dei pacchetti', en: 'ACLs and packet filtering' },
        objectives: [
          {
            it: 'Spiegare come un’ACL valuta i pacchetti dall’alto verso il basso fermandosi alla prima corrispondenza.',
            en: 'Explain how an ACL evaluates packets top-down, stopping at the first match.'
          },
          {
            it: 'Distinguere ACL standard ed extended e applicare il principio del default deny.',
            en: 'Distinguish standard and extended ACLs and apply the default-deny principle.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere indirizzi IP, porte e la differenza tra TCP e UDP.',
            en: 'Know IP addresses, ports and the difference between TCP and UDP.'
          }
        ],
        theory: [
          {
            it: 'Un’ACL (Access Control List) è un elenco ordinato di regole permit/deny che il dispositivo valuta dall’alto verso il basso: appena un pacchetto corrisponde a una regola, l’ACL si ferma e applica quell’azione, ignorando le regole successive. L’ordine, quindi, cambia il risultato.',
            en: 'An ACL (Access Control List) is an ordered list of permit/deny rules the device evaluates top-down: as soon as a packet matches a rule, the ACL stops and applies that action, ignoring the later rules. Order therefore changes the outcome.'
          },
          {
            it: 'Un’ACL standard filtra solo sull’indirizzo sorgente; un’ACL extended filtra su protocollo, sorgente, destinazione e porte, quindi è molto più selettiva. La parola chiave “established” lascia passare il traffico di ritorno controllando i flag ACK/RST, ma non mantiene stato: è un filtro, non un firewall stateful.',
            en: 'A standard ACL filters only on the source address; an extended ACL filters on protocol, source, destination and ports, so it is far more selective. The “established” keyword lets return traffic through by checking the ACK/RST flags, but keeps no state: it is a filter, not a stateful firewall.'
          },
          {
            it: 'In fondo a ogni ACL c’è un deny implicito: tutto ciò che non è esplicitamente permesso viene scartato. Questo è il default deny, il fondamento del minimo privilegio applicato al traffico: si aprono solo i flussi necessari e si nega il resto.',
            en: 'At the bottom of every ACL there is an implicit deny: anything not explicitly permitted is dropped. This is default deny, the foundation of least privilege applied to traffic: only the needed flows are opened and the rest is denied.'
          }
        ],
        example: {
          it: 'Se una regola “permit ip any any” precede un “deny” più specifico, il deny non verrà mai raggiunto: il pacchetto corrisponde già alla prima regola. Spostare le regole specifiche sopra quelle generiche risolve lo shadowing.',
          en: 'If a “permit ip any any” rule precedes a more specific “deny”, the deny is never reached: the packet already matches the first rule. Moving the specific rules above the generic ones fixes the shadowing.'
        },
        commonMistakes: [
          {
            it: 'Dimenticare l’ordine: una regola generica messa troppo in alto oscura (shadowing) quelle specifiche sotto di essa.',
            en: 'Forgetting order: a generic rule placed too high shadows the specific ones below it.'
          },
          {
            it: 'Scambiare “established” per stato reale: controlla solo i flag ACK/RST del pacchetto, non tiene traccia della connessione.',
            en: 'Mistaking “established” for real state: it only checks the packet’s ACK/RST flags, it does not track the connection.'
          }
        ],
        lab: 'securitycore',
        references: [{ kind: 'nist', id: 'SP 800-41 Rev. 1' }],
        guidedLabs: [
          {
            id: 'gl-acl-first-match',
            title: { it: 'Prevedi la decisione di un’ACL', en: 'Predict an ACL’s decision' },
            difficulty: 'core',
            lab: 'securitycore',
            scenario: {
              it: 'Il laboratorio «Sicurezza CCNA» valuta un pacchetto contro un’ACL IPv4 regola per regola, mostrando quale riga produce la prima corrispondenza.',
              en: 'The “Security fundamentals” (CCNA) lab evaluates a packet against an IPv4 ACL rule by rule, showing which line produces the first match.'
            },
            task: {
              it: 'Per due pacchetti diversi, prevedi se l’ACL li consente o li nega e quale regola scatta per prima; poi verifica nel lab.',
              en: 'For two different packets, predict whether the ACL permits or denies them and which rule fires first; then check in the lab.'
            },
            steps: [
              {
                it: 'Apri «Sicurezza CCNA» e osserva l’elenco di regole dell’ACL IPv4.',
                en: 'Open “Security fundamentals” (CCNA) and look at the IPv4 ACL rule list.'
              },
              {
                it: 'Imposta i campi del pacchetto (sorgente, destinazione, protocollo, porta) e prevedi l’esito prima di valutare.',
                en: 'Set the packet fields (source, destination, protocol, port) and predict the outcome before evaluating.'
              },
              {
                it: 'Confronta la tua previsione con la prima corrispondenza evidenziata dal lab.',
                en: 'Compare your prediction with the first match highlighted by the lab.'
              }
            ],
            challenge: {
              it: 'Riordina mentalmente due regole per eliminare uno shadowing e prevedi come cambia l’esito.',
              en: 'Mentally reorder two rules to remove a shadowing and predict how the outcome changes.'
            },
            solution: [
              {
                it: 'L’ACL si ferma alla prima regola che corrisponde: se una “permit” generica precede una “deny” specifica, il pacchetto è consentito perché la deny non viene mai raggiunta. Il deny implicito finale scarta ciò che nessuna regola permette.',
                en: 'The ACL stops at the first matching rule: if a generic “permit” precedes a specific “deny”, the packet is permitted because the deny is never reached. The final implicit deny drops whatever no rule permits.'
              },
              {
                it: 'Sfida: spostando la regola specifica sopra quella generica, la prima corrispondenza cambia e l’esito si inverte per i pacchetti interessati — la prova concreta che in un’ACL l’ordine è semantica, non estetica.',
                en: 'Challenge: moving the specific rule above the generic one changes the first match and flips the outcome for the affected packets — concrete proof that in an ACL order is semantics, not aesthetics.'
              }
            ],
            selfCheck: [
              {
                it: 'So prevedere permit/deny e la prima regola che scatta per un pacchetto dato.',
                en: 'I can predict permit/deny and the first rule that fires for a given packet.'
              },
              {
                it: 'So spiegare come riordinare le regole elimina lo shadowing.',
                en: 'I can explain how reordering rules removes shadowing.'
              }
            ]
          }
        ]
      },
      {
        id: 'firewalls-inspection',
        title: { it: 'Firewall e ispezione stateful', en: 'Firewalls and stateful inspection' },
        objectives: [
          {
            it: 'Distinguere un filtro stateless da un firewall stateful e spiegare il ruolo della state table.',
            en: 'Distinguish a stateless filter from a stateful firewall and explain the role of the state table.'
          },
          {
            it: 'Applicare l’ordine delle regole, evitare lo shadowing e partire da un default deny per zone.',
            en: 'Apply rule order, avoid shadowing and start from a default deny per zone.'
          }
        ],
        prerequisites: [
          { it: 'Conoscere le ACL e la nozione di sessione TCP.', en: 'Know ACLs and the notion of a TCP session.' }
        ],
        theory: [
          {
            it: 'Un filtro stateless valuta ogni pacchetto in isolamento; un firewall stateful tiene una state table delle connessioni attive e lascia passare automaticamente il traffico di ritorno coerente, bloccando i pacchetti fuori stato. Questo distingue una risposta legittima da un pacchetto iniettato.',
            en: 'A stateless filter evaluates each packet in isolation; a stateful firewall keeps a state table of active connections and automatically lets coherent return traffic through, blocking out-of-state packets. This tells a legitimate reply from an injected packet.'
          },
          {
            it: 'Il firewall classifica il traffico per zona, sorgente, destinazione, servizio, applicazione e identità, poi applica la prima regola corrispondente. Regole ampie o messe troppo in alto rendono inefficaci i deny più specifici (shadowing) e aprono percorsi non previsti tra zone: l’ordine e la specificità delle regole sono parte della sicurezza.',
            en: 'The firewall classifies traffic by zone, source, destination, service, application and identity, then applies the first matching rule. Broad rules, or rules placed too high, make more specific denies ineffective (shadowing) and open unintended paths between zones: rule order and specificity are part of security.'
          },
          {
            it: 'Anche l’ordine di elaborazione con il NAT conta: la policy va definita in modo esplicito e indipendente dalla traduzione, altrimenti una regola può corrispondere a tuple diverse da quelle attese. Il firewall è un punto di enforcement inline: se è in linea sul percorso, può bloccare, non solo osservare.',
            en: 'The processing order with NAT also matters: the policy must be defined explicitly and independently of translation, otherwise a rule can match tuples different from those expected. The firewall is an inline enforcement point: being in line on the path, it can block, not only observe.'
          }
        ],
        example: {
          it: 'Con routing asimmetrico il ritorno passa da un altro firewall che non ha la connessione nella sua state table: il traffico legittimo viene scartato come fuori stato. La correzione è rendere simmetrico il percorso, non aprire il traffico out-of-state.',
          en: 'With asymmetric routing the return goes through another firewall that does not have the connection in its state table: legitimate traffic is dropped as out-of-state. The fix is to make the path symmetric, not to allow out-of-state traffic.'
        },
        commonMistakes: [
          {
            it: 'Aprire il traffico fuori stato per “far funzionare” un flusso: nasconde un problema di routing e indebolisce le garanzie del firewall stateful.',
            en: 'Allowing out-of-state traffic to “make a flow work”: it hides a routing problem and weakens the stateful firewall’s guarantees.'
          },
          {
            it: 'Credere che un NAT basti come policy di sicurezza: la traduzione non è autorizzazione; serve una policy esplicita indipendente dal NAT.',
            en: 'Believing a NAT is enough as a security policy: translation is not authorization; an explicit policy independent of NAT is needed.'
          }
        ],
        lab: 'inspection',
        references: [{ kind: 'nist', id: 'SP 800-41 Rev. 1' }],
        guidedLabs: [
          {
            id: 'gl-rule-order-shadowing',
            title: { it: 'Traccia un flusso fino alla regola che scatta', en: 'Trace a flow to the rule that fires' },
            difficulty: 'core',
            lab: 'inspection',
            scenario: {
              it: 'Il laboratorio «Firewall e ispezione» mostra scenari di policy con ordine delle regole, shadowing, default deny e state table.',
              en: 'The “Firewall and inspection” lab shows policy scenarios with rule order, shadowing, default deny and the state table.'
            },
            task: {
              it: 'Scegli lo scenario sull’ordine delle regole e individua quale regola corrisponde davvero a un flusso dato e perché un deny più specifico resta a zero hit.',
              en: 'Pick the rule-order scenario and find which rule actually matches a given flow and why a more specific deny stays at zero hits.'
            },
            steps: [
              {
                it: 'Apri «Firewall e ispezione» e seleziona lo scenario «Ordine delle regole, shadowing e default deny».',
                en: 'Open “Firewall and inspection” and select the “Rule order, shadowing, and default deny” scenario.'
              },
              {
                it: 'Segui il flusso attraverso le regole e osserva su quale riga avviene la prima corrispondenza.',
                en: 'Follow the flow through the rules and observe on which line the first match happens.'
              },
              {
                it: 'Nota come una regola specifica con zero hit riveli uno shadowing da parte di una regola più ampia e precedente.',
                en: 'Notice how a specific rule with zero hits reveals shadowing by a broader, earlier rule.'
              }
            ],
            challenge: {
              it: 'Proponi un riordino che azzeri lo shadowing mantenendo il default deny finale, e indica come lo verificheresti con test positivi e negativi.',
              en: 'Propose a reordering that removes the shadowing while keeping the final default deny, and say how you would verify it with positive and negative tests.'
            },
            solution: [
              {
                it: 'Il firewall applica la prima regola corrispondente: una policy generica precedente intercetta il flusso e la deny specifica resta a zero hit. Spostare la regola specifica sopra quella generica ripristina l’intento, e il deny implicito di zona continua a scartare tutto il resto.',
                en: 'The firewall applies the first matching rule: an earlier generic policy intercepts the flow and the specific deny stays at zero hits. Moving the specific rule above the generic one restores the intent, and the implicit zone deny keeps dropping everything else.'
              },
              {
                it: 'Sfida: dopo il riordino si verifica con test per zona, famiglia di indirizzi e direzione — positivi (ciò che deve passare) e negativi (ciò che deve essere negato) — e si controlla che rimuovere una regola apparentemente inutilizzata non rompa dipendenze note.',
                en: 'Challenge: after reordering you verify with tests by zone, address family and direction — positive (what must pass) and negative (what must be denied) — and check that removing an apparently unused rule does not break known dependencies.'
              }
            ],
            selfCheck: [
              {
                it: 'So tracciare un flusso fino alla regola che scatta davvero.',
                en: 'I can trace a flow to the rule that actually fires.'
              },
              {
                it: 'So riconoscere e correggere uno shadowing mantenendo il default deny.',
                en: 'I can recognise and fix a shadowing while keeping the default deny.'
              }
            ]
          }
        ]
      },
      {
        id: 'ids-ips-segmentation',
        title: { it: 'IDS/IPS, segmentazione e Zero Trust', en: 'IDS/IPS, segmentation and Zero Trust' },
        objectives: [
          {
            it: 'Distinguere un IDS (rilevamento, out-of-band) da un IPS (blocco, inline) e sapere quando usarli.',
            en: 'Distinguish an IDS (detection, out-of-band) from an IPS (blocking, inline) and know when to use each.'
          },
          {
            it: 'Spiegare come la segmentazione e il modello Zero Trust riducono la portata di un attacco.',
            en: 'Explain how segmentation and the Zero Trust model reduce the reach of an attack.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere firewall, VLAN e la difesa in profondità.',
            en: 'Know firewalls, VLANs and defense in depth.'
          }
        ],
        theory: [
          {
            it: 'Un IDS (Intrusion Detection System) osserva una copia del traffico out-of-band e genera un allarme quando rileva qualcosa: non è sul percorso, quindi non può bloccare da solo. Un IPS (Intrusion Prevention System) è inline sul traffico e può scartare il pacchetto in tempo reale, al prezzo di poter introdurre latenza o falsi positivi che bloccano traffico legittimo.',
            en: 'An IDS (Intrusion Detection System) watches a copy of the traffic out-of-band and raises an alert when it detects something: it is not on the path, so it cannot block on its own. An IPS (Intrusion Prevention System) is inline on the traffic and can drop the packet in real time, at the cost of possibly adding latency or false positives that block legitimate traffic.'
          },
          {
            it: 'I sensori si distinguono anche per posizione: NIDS/NIPS osservano la rete, HIDS/HIPS vivono sull’host e vedono ciò che la rete non mostra (processi, file, chiamate di sistema), mentre un EDR unisce telemetria e risposta sull’endpoint. La scelta fra rilevare e bloccare dipende dal rischio: in linea si blocca, fuori banda si indaga senza impattare il traffico.',
            en: 'Sensors also differ by placement: NIDS/NIPS watch the network, HIDS/HIPS live on the host and see what the network does not show (processes, files, system calls), while an EDR combines telemetry and response on the endpoint. The choice between detecting and blocking depends on risk: inline you block, out-of-band you investigate without impacting traffic.'
          },
          {
            it: 'La segmentazione divide la rete in zone con policy fra loro, così un attacco confinato non raggiunge tutto; il microsegmento la porta al singolo carico di lavoro. Lo Zero Trust estende l’idea: nessuna fiducia implicita per posizione in rete, ma verifica di identità e contesto a ogni richiesta («never trust, always verify»). IDS/IPS e segmentazione sono complementari: uno vede, l’altra contiene.',
            en: 'Segmentation divides the network into zones with policy between them, so a contained attack does not reach everything; microsegmentation takes it down to the single workload. Zero Trust extends the idea: no implicit trust by network location, but verification of identity and context on every request (“never trust, always verify”). IDS/IPS and segmentation are complementary: one sees, the other contains.'
          }
        ],
        example: {
          it: 'Un IDS fuori banda rileva una scansione e avvisa il SOC senza toccare il traffico; un IPS inline sulla stessa tratta può invece scartare subito i pacchetti della scansione. In una rete segmentata, anche se un host cade, la policy di zona impedisce il movimento laterale verso i server critici.',
          en: 'An out-of-band IDS detects a scan and alerts the SOC without touching the traffic; an inline IPS on the same path can instead drop the scan packets immediately. In a segmented network, even if one host falls, the zone policy prevents lateral movement toward the critical servers.'
        },
        commonMistakes: [
          {
            it: 'Aspettarsi che un IDS blocchi: essendo out-of-band rileva e segnala, ma per bloccare serve un IPS inline o un’azione a valle.',
            en: 'Expecting an IDS to block: being out-of-band it detects and alerts, but blocking needs an inline IPS or a downstream action.'
          },
          {
            it: 'Considerare lo Zero Trust solo un prodotto: è un modello che toglie la fiducia implicita e verifica ogni richiesta, e si realizza con identità, segmentazione e policy, non con un singolo apparato.',
            en: 'Treating Zero Trust as just a product: it is a model that removes implicit trust and verifies every request, realised through identity, segmentation and policy, not a single appliance.'
          }
        ],
        lab: 'security',
        references: [
          { kind: 'nist', id: 'SP 800-94' },
          { kind: 'nist', id: 'SP 800-207' }
        ],
        guidedLabs: [
          {
            id: 'gl-ids-vs-ips',
            title: { it: 'Scegli tra rilevare e bloccare', en: 'Choose between detecting and blocking' },
            difficulty: 'core',
            lab: 'security',
            scenario: {
              it: 'Il laboratorio «IDS e IPS» presenta i sensori difensivi — NIDS, NIPS, HIDS, HIPS, WIDS, WIPS ed EDR — distinguendo chi rileva da chi blocca e la posizione inline o fuori banda.',
              en: 'The “IDS and IPS” lab presents the defensive sensors — NIDS, NIPS, HIDS, HIPS, WIDS, WIPS and EDR — telling apart who detects from who blocks and the inline or out-of-band placement.'
            },
            task: {
              it: 'Per una minaccia di rete e una minaccia sull’host, scegli il sensore giusto e indica se va inline (blocco) o fuori banda (rilevamento) e perché.',
              en: 'For a network threat and a host threat, choose the right sensor and state whether it goes inline (blocking) or out-of-band (detection) and why.'
            },
            steps: [
              {
                it: 'Apri «IDS e IPS» e confronta le caratteristiche di NIDS/NIPS e HIDS/HIPS.',
                en: 'Open “IDS and IPS” and compare the characteristics of NIDS/NIPS and HIDS/HIPS.'
              },
              {
                it: 'Per ogni minaccia decidi se conta di più non impattare il traffico (fuori banda) o fermarlo subito (inline).',
                en: 'For each threat decide whether not impacting traffic (out-of-band) or stopping it immediately (inline) matters more.'
              },
              {
                it: 'Associa il sensore corretto alla posizione e giustifica la scelta con il rischio.',
                en: 'Match the correct sensor to the placement and justify the choice with the risk.'
              }
            ],
            challenge: {
              it: 'Quando preferiresti un IDS fuori banda a un IPS inline pur potendo bloccare? Motiva con falsi positivi e disponibilità.',
              en: 'When would you prefer an out-of-band IDS to an inline IPS even when blocking is possible? Justify with false positives and availability.'
            },
            solution: [
              {
                it: 'Per una minaccia di rete su un segmento critico un NIPS inline può bloccarla subito; se il rischio di falsi positivi che interrompono traffico legittimo è alto, un NIDS fuori banda rileva e allerta senza impattare. Sull’host, HIDS/HIPS ed EDR vedono processi e file che la rete non mostra.',
                en: 'For a network threat on a critical segment an inline NIPS can block it at once; if the risk of false positives cutting legitimate traffic is high, an out-of-band NIDS detects and alerts without impact. On the host, HIDS/HIPS and EDR see processes and files the network does not show.'
              },
              {
                it: 'Sfida: si preferisce un IDS fuori banda quando la disponibilità del flusso è prioritaria e un blocco errato costerebbe più del ritardo nella risposta; l’IPS inline conviene dove fermare subito l’attacco vale il rischio di qualche falso positivo.',
                en: 'Challenge: an out-of-band IDS is preferred when flow availability is the priority and a wrong block would cost more than a slower response; the inline IPS is worth it where stopping the attack immediately outweighs the risk of a few false positives.'
              }
            ],
            selfCheck: [
              {
                it: 'So scegliere tra sensore inline e fuori banda in base al rischio.',
                en: 'I can choose between an inline and an out-of-band sensor based on risk.'
              },
              {
                it: 'So collocare NIDS/NIPS e HIDS/HIPS secondo ciò che devono vedere.',
                en: 'I can place NIDS/NIPS and HIDS/HIPS according to what they must see.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'network-components',
    cert: 'ccna',
    order: 10,
    track: 'ccna',
    domain: 'network-fundamentals',
    title: {
      it: 'Componenti, architetture e virtualizzazione',
      en: 'Network components, architectures, and virtualization'
    },
    summary: {
      it: 'I mattoni della rete prima dei protocolli: quale decisione prende ogni apparato e quale confine crea, come si scelgono le architetture dal campus al data center, e come virtualizzazione e container cambiano dove vive davvero il traffico.',
      en: 'The building blocks before the protocols: the single decision each device makes and the boundary it creates, how architectures are chosen from campus to data centre, and how virtualization and containers change where traffic actually lives.'
    },
    topics: [
      {
        id: 'network-components-roles',
        title: {
          it: 'I componenti di rete e la decisione che prendono',
          en: 'Network components and the decision they make'
        },
        objectives: [
          {
            it: 'Associare a switch, router, switch multilayer, firewall, access point, WLC ed endpoint la singola decisione che prendono su ogni unità di traffico.',
            en: 'Match switch, router, multilayer switch, firewall, access point, WLC, and endpoint to the single decision each makes on every unit of traffic.'
          },
          {
            it: 'Dire quale confine ciascun apparato crea (collisione, broadcast, fiducia) e quale non crea.',
            en: 'State which boundary each device creates (collision, broadcast, trust) and which it does not.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere il modello OSI e sapere come uno switch impara e inoltra i frame (capitoli precedenti).',
            en: 'Know the OSI model and how a switch learns and forwards frames (earlier chapters).'
          }
        ],
        theory: [
          {
            it: 'Ogni apparato prende una sola decisione per ogni unità di traffico, e conoscerla spiega in anticipo perché una configurazione funziona o no. Lo switch Layer 2 confronta il MAC di destinazione con la tabella CAM e inoltra, filtra o fa flooding sulla VLAN: separa i domini di collisione (uno per porta) ma non quello di broadcast. Il router cerca il prefisso più lungo nella routing table, decrementa il TTL e riscrive gli header di livello 2: è il confine del dominio di broadcast, e per questo serve un relay DHCP per servire una subnet remota. Lo switch multilayer concentra i due ruoli: commuta dentro la VLAN e instrada tra VLAN tramite le SVI, con il forwarding in hardware.',
            en: 'Every device makes a single decision per unit of traffic, and knowing it explains in advance why a configuration works or not. A Layer 2 switch compares the destination MAC with the CAM table and forwards, filters, or floods within the VLAN: it separates collision domains (one per port) but not the broadcast domain. A router looks up the longest prefix in the routing table, decrements the TTL, and rewrites the Layer 2 headers: it is the broadcast-domain boundary, which is why a DHCP relay is needed to serve a remote subnet. A multilayer switch concentrates both roles: it switches inside a VLAN and routes between VLANs through SVIs, with forwarding done in hardware.'
          },
          {
            it: 'Il firewall (e il NGFW) classifica il flusso per zona, indirizzi e servizio — e, in un NGFW, anche per applicazione e identità — poi applica la prima regola corrispondente e mantiene lo stato della sessione: è un confine di fiducia, e il traffico di ritorno passa perché esiste lo stato, non perché esista una regola inversa. Ma non vede ciò che non gli passa davanti: un percorso asimmetrico o un flusso east-west nella stessa VLAN gli sfugge, e il traffico cifrato resta opaco senza ispezione TLS. L’endpoint (host o server) è dove il traffico nasce e termina: per ogni destinazione confronta il proprio indirizzo e la subnet mask — stessa subnet significa ARP diretto, subnet diversa significa consegna al default gateway.',
            en: 'A firewall (and an NGFW) classifies the flow by zone, addresses, and service — and, in an NGFW, by application and identity too — then applies the first matching rule and keeps session state: it is a trust boundary, and return traffic passes because state exists, not because a reverse rule exists. But it cannot see what does not pass through it: an asymmetric path or an east-west flow inside the same VLAN escapes it, and encrypted traffic stays opaque without TLS inspection. The endpoint (host or server) is where traffic begins and ends: for each destination it compares its own address and the subnet mask — same subnet means ARP directly, a different subnet means delivery to the default gateway.'
          },
          {
            it: 'Sul lato wireless, l’access point fa da bridge tra il mezzo radio half-duplex e la rete cablata, gestendo associazione, contesa del canale e mappatura SSID-VLAN: estende un dominio di broadcast via radio, ma la banda è condivisa e un client associato non è ancora un client autorizzato. Il Wireless LAN Controller centralizza configurazione, RF management, roaming e policy degli AP lightweight (split-MAC) attraverso il tunnel CAPWAP, che separa il control plane dal data plane: aggiunge coerenza e scala, e diventa un punto singolo di fiducia da proteggere. Un AP autonomo, invece, funziona anche senza controller.',
            en: 'On the wireless side, the access point bridges the half-duplex radio medium and the wired network, handling association, channel contention, and SSID-to-VLAN mapping: it extends a broadcast domain over the air, but bandwidth is shared and an associated client is not yet an authorized client. The Wireless LAN Controller centralizes configuration, RF management, roaming, and policy for lightweight APs (split-MAC) over the CAPWAP tunnel, which separates the control plane from the data plane: it adds consistency and scale, and becomes a single point of trust to protect. An autonomous AP, by contrast, works even without a controller.'
          }
        ],
        example: {
          it: 'Un frame tra due host in VLAN diverse attraversa lo switch di accesso (decisione L2 sul MAC), sale alla SVI o al router che instrada tra le subnet (decisione L3 sull’IP) e, se c’è un firewall fra le zone, passa solo se una regola lo consente e lo stato di sessione viene creato.',
          en: 'A frame between two hosts in different VLANs crosses the access switch (an L2 decision on the MAC), rises to the SVI or router that routes between the subnets (an L3 decision on the IP), and, if a firewall sits between the zones, passes only if a rule allows it and session state is created.'
        },
        commonMistakes: [
          {
            it: 'Pensare che uno switch separi i domini di broadcast: senza VLAN e senza routing tutte le sue porte restano nello stesso dominio di broadcast.',
            en: 'Thinking a switch separates broadcast domains: without VLANs and without routing, all its ports stay in the same broadcast domain.'
          },
          {
            it: 'Trattare il router come un firewall: senza ACL inoltra qualunque pacchetto per cui esiste una rotta, e una rotta nella RIB non garantisce che il percorso di ritorno esista.',
            en: 'Treating the router as a firewall: without ACLs it forwards any packet for which a route exists, and a route in the RIB does not guarantee the return path exists.'
          },
          {
            it: 'Scambiare l’access point per uno switch wireless: la banda è condivisa tra i client associati, non commutata per porta.',
            en: 'Mistaking the access point for a wireless switch: bandwidth is shared among associated clients, not switched per port.'
          }
        ],
        lab: 'fundamentals',
        references: [{ kind: 'ieee', id: 'IEEE 802.3' }],
        guidedLabs: [
          {
            id: 'gl-device-decision',
            title: { it: 'Quale apparato, quale confine', en: 'Which device, which boundary' },
            difficulty: 'intro',
            lab: 'fundamentals',
            scenario: {
              it: 'Il laboratorio «Fondamenti di rete» elenca i componenti con la decisione che prendono, il confine che creano e ciò che non fanno.',
              en: 'The “Network fundamentals” lab lists the components with the decision they make, the boundary they create, and what they do not do.'
            },
            task: {
              it: 'Per uno scenario dato (es. separare due reparti nello stesso edificio) scegli quali apparati servono e indica, per ciascuno, la decisione che prende e il confine che crea.',
              en: 'For a given scenario (e.g. separating two departments in the same building) choose which devices are needed and state, for each, the decision it makes and the boundary it creates.'
            },
            steps: [
              {
                it: 'Apri «Fondamenti di rete» e leggi la tabella dei componenti (decisione, confine, ciò che non fa).',
                en: 'Open “Network fundamentals” and read the components table (decision, boundary, what it does not do).'
              },
              {
                it: 'Per lo scenario, decidi dove serve un confine di broadcast (router o SVI) e dove basta un confine di collisione (switch).',
                en: 'For the scenario, decide where a broadcast boundary is needed (router or SVI) and where a collision boundary is enough (switch).'
              },
              {
                it: 'Aggiungi un confine di fiducia (firewall) solo dove una policy fra zone è davvero richiesta.',
                en: 'Add a trust boundary (firewall) only where a policy between zones is genuinely required.'
              }
            ],
            challenge: {
              it: 'Lo scenario chiede Wi-Fi per gli ospiti isolato dalla rete interna: quali apparati e quale confine garantiscono l’isolamento, e perché una sola VLAN non basta senza un punto di enforcement L3?',
              en: 'The scenario asks for guest Wi-Fi isolated from the internal network: which devices and which boundary guarantee the isolation, and why is a single VLAN not enough without an L3 enforcement point?'
            },
            solution: [
              {
                it: 'Separare due reparti: uno switch dà domini di collisione per porta e, con una VLAN per reparto, due domini di broadcast logici; la comunicazione fra loro passa solo da un confine L3 (router o SVI), ed è lì — non sullo switch — che una ACL o un firewall applica la policy.',
                en: 'Separating two departments: a switch gives per-port collision domains and, with one VLAN per department, two logical broadcast domains; communication between them passes only through an L3 boundary (router or SVI), and it is there — not on the switch — that an ACL or firewall enforces the policy.'
              },
              {
                it: 'Sfida: il Wi-Fi ospiti è un SSID mappato su una VLAN dedicata sull’AP/WLC; l’isolamento è reale solo se quel confine di broadcast termina su un punto L3 con una policy di default-deny verso l’interno, perché una VLAN separa il livello 2 ma non filtra il livello 3.',
                en: 'Challenge: guest Wi-Fi is an SSID mapped to a dedicated VLAN on the AP/WLC; isolation is real only if that broadcast boundary terminates at an L3 point with a default-deny policy toward the inside, because a VLAN separates Layer 2 but does not filter Layer 3.'
              }
            ],
            selfCheck: [
              {
                it: 'So dire, per ogni apparato scelto, la decisione che prende e il confine che crea.',
                en: 'I can state, for each chosen device, the decision it makes and the boundary it creates.'
              },
              {
                it: 'So spiegare perché la segmentazione L2 (VLAN) non protegge senza un punto di enforcement L3.',
                en: 'I can explain why L2 segmentation (VLANs) does not protect without an L3 enforcement point.'
              }
            ]
          }
        ]
      },
      {
        id: 'network-architectures',
        title: {
          it: 'Architetture: due e tre livelli, spine-leaf, SOHO e WAN',
          en: 'Architectures: two- and three-tier, spine-leaf, SOHO, and WAN'
        },
        objectives: [
          {
            it: 'Scegliere l’architettura adatta alla scala e al tipo di traffico, dal campus piccolo al data center.',
            en: 'Choose the architecture suited to the scale and traffic type, from a small campus to the data centre.'
          },
          {
            it: 'Dire il trade-off di ciascuna: ridondanza, numero di apparati, hop e prevedibilità della latenza.',
            en: 'State the trade-off of each: redundancy, device count, hops, and latency predictability.'
          }
        ],
        prerequisites: [
          {
            it: 'Sapere quale decisione prendono switch e router e quale confine creano (argomento precedente).',
            en: 'Know what decision switches and routers make and what boundary they create (previous topic).'
          }
        ],
        theory: [
          {
            it: 'Il modello a campus gerarchico distingue tre funzioni: l’accesso, a cui si collegano gli host; la distribuzione, che aggrega gli switch di accesso e applica policy e routing di blocco; il core, dedicato al solo trasporto veloce fra blocchi. Nell’architettura a due livelli (collapsed core) distribuzione e core coincidono in una coppia di switch: è la scelta normale per una sede singola o un campus piccolo, con meno apparati e meno hop, ma quella coppia concentra il rischio ed è l’intera resilienza del sito. L’architettura a tre livelli tiene il core separato: serve quando i blocchi di accesso sono molti o su più edifici, perché permette di aggiungere o isolare un blocco senza toccare gli altri, al costo di più apparati, più link e un progetto Layer 3 più articolato.',
            en: 'The hierarchical campus model distinguishes three functions: access, where hosts connect; distribution, which aggregates access switches and applies policy and boundary routing; and the core, dedicated to fast transport between blocks only. In the two-tier (collapsed core) architecture, distribution and core coincide in a pair of switches: the normal choice for a single site or small campus, with fewer devices and fewer hops, but that pair concentrates the risk and is the site’s entire resilience. The three-tier architecture keeps the core separate: it is needed when access blocks are numerous or spread across buildings, because it lets a block be added or isolated without touching the others, at the cost of more devices, more links, and a more elaborate Layer 3 design.'
          },
          {
            it: 'Nel data center domina invece il traffico east-west fra server, e la latenza deve essere prevedibile: l’architettura spine-leaf collega ogni leaf a ogni spine e nessun leaf a un altro leaf, così due server qualsiasi distano sempre lo stesso numero di hop. Offre banda e latenza uniformi, ma richiede molti link, ECMP sul routing e tipicamente un overlay per la segmentazione dei tenant. All’estremo opposto, il SOHO integra routing, switching, wireless e spesso firewall e modem in un unico apparato: massima semplicità dove gli utenti sono pochi, ma nessuna ridondanza e poca visibilità — l’apparato è insieme punto singolo di guasto e unico punto di enforcement, ed è lo scenario tipico del lavoro da remoto da proteggere con una VPN.',
            en: 'In the data centre, by contrast, east-west traffic between servers dominates, and latency must be predictable: the spine-leaf architecture connects every leaf to every spine and no leaf to another leaf, so any two servers are always the same number of hops apart. It offers uniform bandwidth and latency, but requires many links, ECMP in routing, and typically an overlay for tenant segmentation. At the opposite extreme, SOHO integrates routing, switching, wireless, and often firewall and modem in a single device: maximum simplicity where users are few, but no redundancy and little visibility — the device is both the single point of failure and the only enforcement point, and it is the typical remote-work scenario to protect with a VPN.'
          },
          {
            it: 'La WAN collega sedi distanti con circuiti di un provider — MPLS, Internet con VPN IPsec, linee dedicate o accessi broadband, spesso combinati in SD-WAN — quando le sedi sono oltre la portata del campus e la connettività va acquistata invece che cablata. È il collo di bottiglia dove la banda costa e la latenza è imposta dalla distanza fisica: qui QoS, ridondanza dei circuiti e scelta del percorso contano davvero, mentre nel campus la banda è abbondante ed economica.',
            en: 'The WAN connects distant sites over provider circuits — MPLS, Internet with IPsec VPNs, leased lines, or broadband access, often combined in SD-WAN — when sites are beyond campus reach and connectivity must be bought rather than cabled. It is the bottleneck where bandwidth costs and latency is imposed by physical distance: here QoS, circuit redundancy, and path selection genuinely matter, whereas in the campus bandwidth is abundant and cheap.'
          }
        ],
        example: {
          it: 'Un campus piccolo si risolve con due livelli (collapsed core); un data center con molti server che dialogano tra loro vuole spine-leaf per la latenza uniforme; una filiale di poche persone usa un apparato SOHO raggiunto dalla sede via VPN sulla WAN.',
          en: 'A small campus is solved with two tiers (collapsed core); a data centre with many servers talking to each other wants spine-leaf for uniform latency; a small branch uses a SOHO device reached from headquarters over a VPN on the WAN.'
        },
        commonMistakes: [
          {
            it: 'Portare lo spine-leaf nel campus: è pensato per il traffico east-west del data center, non per l’accesso degli utenti, dove aggiunge complessità senza vantaggio.',
            en: 'Bringing spine-leaf into the campus: it is designed for east-west data-centre traffic, not user access, where it adds complexity without benefit.'
          },
          {
            it: 'Imporre tre livelli a una sede singola: il core separato aggiunge costo e latenza senza risolvere un problema reale finché i blocchi di accesso restano pochi.',
            en: 'Forcing three tiers on a single site: a separate core adds cost and latency without solving a real problem while access blocks stay few.'
          },
          {
            it: 'Trattare il SOHO come una rete resiliente: è un punto singolo di guasto, e la sua unica linea WAN va considerata un rischio, non una garanzia.',
            en: 'Treating SOHO as a resilient network: it is a single point of failure, and its single WAN link must be treated as a risk, not a guarantee.'
          }
        ],
        lab: 'fundamentals',
        references: [{ kind: 'cisco', id: 'Cisco Enterprise Campus Architecture' }]
      },
      {
        id: 'network-virtualization',
        title: {
          it: 'Virtualizzazione: macchine virtuali, container e VRF',
          en: 'Virtualization: virtual machines, containers, and VRFs'
        },
        objectives: [
          {
            it: 'Distinguere macchina virtuale, container e VRF per isolamento e per impatto sulla rete.',
            en: 'Distinguish virtual machine, container, and VRF by isolation and by network impact.'
          },
          {
            it: 'Spiegare dove vive il traffico che gli strumenti di ispezione tradizionali non vedono.',
            en: 'Explain where the traffic that traditional inspection tools miss actually lives.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere VLAN e routing di base: la VRF separa il livello 3 come la VLAN separa il livello 2.',
            en: 'Know VLANs and basic routing: a VRF separates Layer 3 the way a VLAN separates Layer 2.'
          }
        ],
        theory: [
          {
            it: 'La virtualizzazione dei server usa un hypervisor per dividere un server fisico in più macchine virtuali, ognuna con il proprio sistema operativo completo e kernel separato: il tipo 1 (bare-metal, es. ESXi) gira direttamente sull’hardware, il tipo 2 sopra un sistema operativo host. Dal punto di vista della rete, ogni VM ha una vNIC collegata a un virtual switch: il traffico tra VM sullo stesso host può non toccare mai la rete fisica, quindi sfugge agli strumenti di ispezione tradizionali posti sui cavi e sugli switch fisici.',
            en: 'Server virtualization uses a hypervisor to divide one physical server into several virtual machines, each with its own complete operating system and separate kernel: type 1 (bare-metal, e.g. ESXi) runs directly on the hardware, type 2 on top of a host operating system. From the network’s point of view, each VM has a vNIC attached to a virtual switch: traffic between VMs on the same host may never touch the physical network, so it escapes traditional inspection tools placed on physical cables and switches.'
          },
          {
            it: 'I container impacchettano un’applicazione con le sue dipendenze condividendo il kernel dell’host: si avviano in secondi e hanno un footprint molto minore di una VM, ma la condivisione del kernel rende l’isolamento più debole di quello di una macchina virtuale. La loro rete è tipicamente NAT o un overlay per namespace, con indirizzi effimeri: le policy vanno espresse su identità o label, non su indirizzi IP, perché l’indirizzo di un container cambia a ogni riavvio.',
            en: 'Containers package an application with its dependencies while sharing the host kernel: they start in seconds and have a much smaller footprint than a VM, but sharing the kernel makes isolation weaker than a virtual machine’s. Their networking is typically NAT or an overlay per namespace, with ephemeral addresses: policy must be expressed on identity or labels, not on IP addresses, because a container’s address changes on every restart.'
          },
          {
            it: 'La VRF (Virtual Routing and Forwarding) fa sì che un router mantenga più tabelle di routing indipendenti sullo stesso dispositivo fisico: le interfacce assegnate a VRF diverse non si raggiungono, anche con indirizzi sovrapposti. Separa il livello 3 come una VLAN separa il livello 2, ed è la base del management VRF che isola la gestione dal traffico dati. Ma non cifra e non filtra: per far comunicare due VRF serve un route leaking esplicito o un firewall, altrimenti l’isolamento è totale per costruzione.',
            en: 'A VRF (Virtual Routing and Forwarding) makes one router keep several independent routing tables on the same physical device: interfaces assigned to different VRFs cannot reach each other, even with overlapping addresses. It separates Layer 3 the way a VLAN separates Layer 2, and is the basis of the management VRF that isolates management from data traffic. But it neither encrypts nor filters: making two VRFs talk requires explicit route leaking or a firewall, otherwise the isolation is total by construction.'
          }
        ],
        example: {
          it: 'Due VM sullo stesso host dialogano attraverso il virtual switch senza che un pacchetto raggiunga mai lo switch fisico; due clienti con lo stesso blocco 10.0.0.0/8 convivono sullo stesso router in VRF separate senza collidere, finché nessuno configura un route leaking.',
          en: 'Two VMs on the same host talk through the virtual switch without a single packet ever reaching the physical switch; two customers with the same 10.0.0.0/8 block coexist on the same router in separate VRFs without colliding, as long as no one configures route leaking.'
        },
        commonMistakes: [
          {
            it: 'Credere che un container isoli come una VM: condividendo il kernel dell’host, una vulnerabilità del kernel attraversa il confine che una macchina virtuale terrebbe separato.',
            en: 'Believing a container isolates like a VM: by sharing the host kernel, a kernel vulnerability crosses the boundary a virtual machine would keep separate.'
          },
          {
            it: 'Pensare che la VRF cifri o filtri il traffico: isola le tabelle di routing, ma la riservatezza e il filtraggio restano compito di VPN e firewall.',
            en: 'Thinking a VRF encrypts or filters traffic: it isolates routing tables, but confidentiality and filtering remain the job of VPNs and firewalls.'
          },
          {
            it: 'Dare per scontato che gli strumenti di rete fisici vedano tutto: il traffico tra VM o tra container sullo stesso host resta invisibile senza visibilità a livello di virtual switch.',
            en: 'Assuming physical network tools see everything: traffic between VMs or between containers on the same host stays invisible without visibility at the virtual-switch level.'
          }
        ],
        lab: 'fundamentals',
        references: [{ kind: 'cisco', id: 'Cisco Network Virtualization' }],
        guidedLabs: [
          {
            id: 'gl-virtualization-boundaries',
            title: { it: 'Dove vive davvero il traffico', en: 'Where traffic really lives' },
            difficulty: 'core',
            lab: 'fundamentals',
            scenario: {
              it: 'Il laboratorio «Fondamenti di rete» riepiloga VM, container e VRF con il loro effetto sulla rete e sulla visibilità.',
              en: 'The “Network fundamentals” lab summarizes VMs, containers, and VRFs with their effect on the network and on visibility.'
            },
            task: {
              it: 'Per ciascuna tecnologia indica dove passa il traffico fra due carichi e quale strumento (switch fisico, virtual switch, firewall, route leaking) è necessario per vederlo o per metterli in comunicazione.',
              en: 'For each technology, state where traffic between two workloads goes and which tool (physical switch, virtual switch, firewall, route leaking) is needed to see it or to connect them.'
            },
            steps: [
              {
                it: 'Apri «Fondamenti di rete» e leggi le righe su virtualizzazione dei server, container e VRF.',
                en: 'Open “Network fundamentals” and read the rows on server virtualization, containers, and VRFs.'
              },
              {
                it: 'Per due VM sullo stesso host, individua il punto in cui il traffico diventa (o non diventa) visibile agli strumenti fisici.',
                en: 'For two VMs on the same host, identify where traffic becomes (or does not become) visible to physical tools.'
              },
              {
                it: 'Per due VRF con indirizzi sovrapposti, stabilisci cosa serve per farle comunicare senza collisioni di indirizzamento.',
                en: 'For two VRFs with overlapping addresses, determine what is needed to make them talk without addressing collisions.'
              }
            ],
            challenge: {
              it: 'Un container deve esporre un servizio verso l’esterno e restare isolato dagli altri: su cosa fondi la policy se l’indirizzo IP cambia a ogni riavvio?',
              en: 'A container must expose a service externally and stay isolated from the others: what do you base the policy on if the IP address changes on every restart?'
            },
            solution: [
              {
                it: 'VM sullo stesso host: il traffico passa dal virtual switch e può non toccare la rete fisica, quindi serve visibilità a livello di hypervisor; VRF con indirizzi sovrapposti: restano separate per costruzione e comunicano solo con route leaking esplicito o attraverso un firewall, che resta anche l’unico punto dove applicare una policy.',
                en: 'VMs on the same host: traffic passes through the virtual switch and may never touch the physical network, so hypervisor-level visibility is needed; VRFs with overlapping addresses: they stay separate by construction and talk only through explicit route leaking or a firewall, which also remains the only point where a policy can be applied.'
              },
              {
                it: 'Sfida: con indirizzi effimeri la policy non può basarsi sull’IP; si fonda su identità o label del container (e su un confine esplicito verso l’esterno), perché solo quelle restano stabili attraverso i riavvii.',
                en: 'Challenge: with ephemeral addresses the policy cannot rest on the IP; it rests on the container’s identity or labels (and on an explicit boundary toward the outside), because only those stay stable across restarts.'
              }
            ],
            selfCheck: [
              {
                it: 'So dire, per VM, container e VRF, dove passa il traffico e cosa serve per vederlo o filtrarlo.',
                en: 'I can state, for VMs, containers, and VRFs, where traffic goes and what is needed to see or filter it.'
              },
              {
                it: 'So spiegare perché le policy dei container si esprimono su identità e non su indirizzi IP.',
                en: 'I can explain why container policy is expressed on identity rather than IP addresses.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'ipv6-addressing',
    cert: 'ccna',
    order: 11,
    track: 'ccna',
    domain: 'network-fundamentals',
    title: {
      it: 'IPv6: indirizzamento, SLAAC e dual-stack',
      en: 'IPv6: addressing, SLAAC, and dual-stack'
    },
    summary: {
      it: 'Come si scrive e si legge un indirizzo IPv6, i tipi che contano (globale, link-local, unique-local, multicast), come un host si autoconfigura con SLAAC e Neighbor Discovery, e perché una rete dual-stack va protetta su entrambi i protocolli.',
      en: 'How an IPv6 address is written and read, the types that matter (global, link-local, unique-local, multicast), how a host autoconfigures with SLAAC and Neighbor Discovery, and why a dual-stack network must be protected on both protocols.'
    },
    topics: [
      {
        id: 'ipv6-format-types',
        title: {
          it: 'Formato, abbreviazione e tipi di indirizzo',
          en: 'Format, abbreviation, and address types'
        },
        objectives: [
          {
            it: 'Abbreviare ed espandere un indirizzo IPv6 applicando correttamente le due regole e il doppio due punti una sola volta.',
            en: 'Abbreviate and expand an IPv6 address, applying the two rules and the double colon exactly once.'
          },
          {
            it: 'Riconoscere i tipi di indirizzo dal prefisso: globale, link-local, unique-local, loopback, non specificato e multicast.',
            en: 'Recognise address types from the prefix: global, link-local, unique-local, loopback, unspecified, and multicast.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere l’indirizzamento IPv4 e la notazione CIDR (capitolo sul subnetting).',
            en: 'Know IPv4 addressing and CIDR notation (the subnetting chapter).'
          }
        ],
        theory: [
          {
            it: 'Un indirizzo IPv6 è lungo 128 bit, scritto come otto gruppi (hextet) di quattro cifre esadecimali separati da due punti, ad esempio 2001:db8:0000:0000:0000:0000:0000:0001. Due regole lo accorciano: si eliminano gli zeri iniziali di ogni hextet (0db8 → db8, 0000 → 0) e si sostituisce una sola sequenza di hextet tutti a zero con il doppio due punti ::. Quel doppio due punti può comparire una volta sola, altrimenti l’indirizzo diventa ambiguo: l’esempio si comprime in 2001:db8::1.',
            en: 'An IPv6 address is 128 bits long, written as eight groups (hextets) of four hexadecimal digits separated by colons, for example 2001:db8:0000:0000:0000:0000:0000:0001. Two rules shorten it: drop the leading zeros of each hextet (0db8 → db8, 0000 → 0) and replace a single run of all-zero hextets with the double colon ::. That double colon may appear only once, otherwise the address becomes ambiguous: the example compresses to 2001:db8::1.'
          },
          {
            it: 'Il prefisso iniziale dice il tipo. L’unicast globale (GUA) sta in 2000::/3 ed è instradabile su Internet; il link-local (LLA) in fe80::/10 esiste su ogni interfaccia, non è instradabile e serve a Neighbor Discovery e ai next-hop; l’unique-local (ULA) in fc00::/7 — in pratica con prefisso fd — è l’equivalente degli indirizzi privati. Il loopback è ::1, l’indirizzo non specificato è :: e il blocco di documentazione è 2001:db8::/32.',
            en: 'The leading prefix tells the type. Global unicast (GUA) sits in 2000::/3 and is routable on the Internet; link-local (LLA) in fe80::/10 exists on every interface, is not routable, and serves Neighbor Discovery and next-hops; unique-local (ULA) in fc00::/7 — in practice with the fd prefix — is the equivalent of private addresses. The loopback is ::1, the unspecified address is ::, and the documentation block is 2001:db8::/32.'
          },
          {
            it: 'IPv6 non ha il broadcast: al suo posto usa il multicast, nel blocco ff00::/8. Gli indirizzi notevoli sono ff02::1 (tutti i nodi del link) e ff02::2 (tutti i router del link); il multicast solicited-node ff02::1:ff00:0/104 fa sì che la risoluzione dell’indirizzo raggiunga solo gli host che condividono le ultime 24 cifre, invece di disturbare tutti come faceva il broadcast ARP. Una interfaccia IPv6 ha di norma più indirizzi insieme: almeno un link-local e uno o più globali.',
            en: 'IPv6 has no broadcast: in its place it uses multicast, in the ff00::/8 block. The notable addresses are ff02::1 (all nodes on the link) and ff02::2 (all routers on the link); the solicited-node multicast ff02::1:ff00:0/104 makes address resolution reach only the hosts that share the last 24 bits, instead of disturbing everyone as ARP broadcast did. An IPv6 interface normally holds several addresses at once: at least one link-local and one or more globals.'
          }
        ],
        example: {
          it: 'L’indirizzo 2001:db8:0000:0000:0000:ff00:0042:8329 si comprime in 2001:db8::ff00:42:8329; fe80::1 è un link-local valido solo sul proprio link; fd00::1 è un unique-local privato che non deve comparire su Internet.',
          en: 'The address 2001:db8:0000:0000:0000:ff00:0042:8329 compresses to 2001:db8::ff00:42:8329; fe80::1 is a link-local valid only on its own link; fd00::1 is a private unique-local that must not appear on the Internet.'
        },
        commonMistakes: [
          {
            it: 'Usare il doppio due punti più di una volta: l’indirizzo diventa ambiguo perché non si sa quanti hextet a zero rappresenti ciascuno.',
            en: 'Using the double colon more than once: the address becomes ambiguous because it is unknown how many zero hextets each one represents.'
          },
          {
            it: 'Cercare un indirizzo di broadcast in IPv6: non esiste, e il suo ruolo è svolto dal multicast ff02::1.',
            en: 'Looking for a broadcast address in IPv6: there is none, and its role is played by multicast ff02::1.'
          },
          {
            it: 'Credere che un host abbia un solo indirizzo: ne ha sempre almeno due, un link-local e un globale, usati in contesti diversi.',
            en: 'Believing a host has a single address: it always has at least two, a link-local and a global, used in different contexts.'
          }
        ],
        lab: 'fundamentals',
        references: [{ kind: 'rfc', id: 'RFC 4291' }],
        guidedLabs: [
          {
            id: 'gl-ipv6-compress',
            title: { it: 'Comprimere e classificare un indirizzo', en: 'Compress and classify an address' },
            difficulty: 'intro',
            lab: 'fundamentals',
            scenario: {
              it: 'Il laboratorio «Fondamenti di rete» include uno strumento IPv6 che espande, comprime e genera l’interface ID in formato EUI-64.',
              en: 'The “Network fundamentals” lab includes an IPv6 tool that expands, compresses, and generates the interface ID in EUI-64 format.'
            },
            task: {
              it: 'Dato un indirizzo in forma estesa, scrivi la forma compressa e indica il tipo (globale, link-local, unique-local, multicast), poi verifica con lo strumento.',
              en: 'Given an address in expanded form, write the compressed form and state the type (global, link-local, unique-local, multicast), then check with the tool.'
            },
            steps: [
              {
                it: 'Elimina gli zeri iniziali di ogni hextet.',
                en: 'Drop the leading zeros of each hextet.'
              },
              {
                it: 'Sostituisci con :: la più lunga sequenza di hextet a zero, una volta sola.',
                en: 'Replace the longest run of zero hextets with ::, only once.'
              },
              {
                it: 'Leggi il prefisso e classifica il tipo: 2000::/3 globale, fe80::/10 link-local, fd unique-local, ff multicast.',
                en: 'Read the prefix and classify the type: 2000::/3 global, fe80::/10 link-local, fd unique-local, ff multicast.'
              }
            ],
            challenge: {
              it: 'Da un indirizzo MAC genera l’interface ID in EUI-64 e spiega perché il settimo bit viene invertito; confronta con un interface ID casuale per la privacy.',
              en: 'From a MAC address generate the EUI-64 interface ID and explain why the seventh bit is flipped; compare it with a random interface ID for privacy.'
            },
            solution: [
              {
                it: 'La compressione applica le due regole in ordine: prima gli zeri iniziali di ciascun hextet, poi un solo :: sulla sequenza di zeri più lunga; il tipo si legge dal prefisso senza calcoli, perché IPv6 riserva blocchi fissi (2000::/3, fe80::/10, fc00::/7, ff00::/8).',
                en: 'Compression applies the two rules in order: first the leading zeros of each hextet, then a single :: on the longest run of zeros; the type is read from the prefix without calculation, because IPv6 reserves fixed blocks (2000::/3, fe80::/10, fc00::/7, ff00::/8).'
              },
              {
                it: 'Sfida: EUI-64 inserisce fffe in mezzo ai 48 bit del MAC e inverte il settimo bit (U/L) per segnalare un identificatore derivato localmente; un interface ID casuale rompe la correlazione con il MAC e protegge la privacy, al prezzo di un indirizzo non deducibile dall’hardware.',
                en: 'Challenge: EUI-64 inserts fffe into the middle of the 48-bit MAC and flips the seventh bit (U/L) to signal a locally derived identifier; a random interface ID breaks the correlation with the MAC and protects privacy, at the cost of an address not derivable from the hardware.'
              }
            ],
            selfCheck: [
              {
                it: 'So comprimere un indirizzo IPv6 applicando il doppio due punti una sola volta.',
                en: 'I can compress an IPv6 address, applying the double colon only once.'
              },
              {
                it: 'So classificare un indirizzo dal suo prefisso senza eseguire calcoli.',
                en: 'I can classify an address from its prefix without doing any calculation.'
              }
            ]
          }
        ]
      },
      {
        id: 'ipv6-slaac-nd',
        title: {
          it: 'SLAAC e Neighbor Discovery',
          en: 'SLAAC and Neighbor Discovery'
        },
        objectives: [
          {
            it: 'Descrivere come un host ottiene un indirizzo globale con SLAAC a partire dal Router Advertisement.',
            en: 'Describe how a host obtains a global address with SLAAC from the Router Advertisement.'
          },
          {
            it: 'Spiegare il ruolo di Neighbor Discovery (RS/RA, NS/NA, DAD) e perché sostituisce ARP.',
            en: 'Explain the role of Neighbor Discovery (RS/RA, NS/NA, DAD) and why it replaces ARP.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere i tipi di indirizzo IPv6 e il multicast solicited-node (argomento precedente).',
            en: 'Know the IPv6 address types and the solicited-node multicast (previous topic).'
          }
        ],
        theory: [
          {
            it: 'Con SLAAC (Stateless Address Autoconfiguration) l’host costruisce da solo il proprio indirizzo globale: invia un Router Solicitation a ff02::2 e riceve un Router Advertisement che annuncia il prefisso /64 del link. L’host unisce quel prefisso a un interface ID — derivato dal MAC con EUI-64 oppure generato in modo casuale per la privacy — e ottiene un indirizzo globale senza alcun server. Il Router Advertisement porta anche i flag M e O che dicono se usare in aggiunta un server DHCPv6 per l’indirizzo (stateful) o solo per informazioni come il DNS (stateless).',
            en: 'With SLAAC (Stateless Address Autoconfiguration) the host builds its own global address: it sends a Router Solicitation to ff02::2 and receives a Router Advertisement announcing the link’s /64 prefix. The host joins that prefix to an interface ID — derived from the MAC with EUI-64 or generated randomly for privacy — and obtains a global address with no server at all. The Router Advertisement also carries the M and O flags that say whether to additionally use a DHCPv6 server for the address (stateful) or only for information such as DNS (stateless).'
          },
          {
            it: 'Neighbor Discovery (ICMPv6) sostituisce ARP e il broadcast. Per trovare il MAC di un vicino, l’host invia una Neighbor Solicitation al multicast solicited-node del bersaglio e riceve una Neighbor Advertisement con l’indirizzo di livello 2: solo gli host con lo stesso suffisso ascoltano quel gruppo, quindi il disturbo è minimo. Le stesse coppie NS/NA realizzano il Duplicate Address Detection (DAD): prima di usare un indirizzo l’host chiede se qualcuno lo possiede già, e lo adotta solo se nessuno risponde.',
            en: 'Neighbor Discovery (ICMPv6) replaces ARP and broadcast. To find a neighbour’s MAC, the host sends a Neighbor Solicitation to the target’s solicited-node multicast and receives a Neighbor Advertisement with the Layer 2 address: only hosts with the same suffix listen to that group, so the disturbance is minimal. The same NS/NA pair performs Duplicate Address Detection (DAD): before using an address the host asks whether anyone already owns it, and adopts it only if no one answers.'
          },
          {
            it: 'La conseguenza di sicurezza è diretta: poiché il Router Advertisement è fidato per costruzione, un Router Advertisement falso (rogue RA) può dirottare il default gateway di un intero link, e un server DHCPv6 rogue può imporre un DNS malevolo. Le difese stanno al primo hop — RA Guard e DHCPv6 snooping sullo switch — ed è questo che il laboratorio «IPv6 e dual-stack» mette in scena.',
            en: 'The security consequence is direct: because the Router Advertisement is trusted by construction, a forged Router Advertisement (rogue RA) can hijack the default gateway of an entire link, and a rogue DHCPv6 server can impose a malicious DNS. The defenses live at the first hop — RA Guard and DHCPv6 snooping on the switch — and this is what the “IPv6 and dual-stack” lab stages.'
          }
        ],
        example: {
          it: 'Un host nuovo invia un Router Solicitation a ff02::2, riceve il prefisso 2001:db8:acad:1::/64, forma 2001:db8:acad:1 con il proprio interface ID e, superato il DAD, inizia a comunicare senza che esista alcun server DHCP.',
          en: 'A new host sends a Router Solicitation to ff02::2, receives the prefix 2001:db8:acad:1::/64, forms 2001:db8:acad:1 with its own interface ID and, once DAD passes, starts communicating without any DHCP server existing.'
        },
        commonMistakes: [
          {
            it: 'Pensare che SLAAC richieda un server: il prefisso arriva dal router nel Router Advertisement, e l’host costruisce l’indirizzo da sé.',
            en: 'Thinking SLAAC needs a server: the prefix comes from the router in the Router Advertisement, and the host builds the address itself.'
          },
          {
            it: 'Cercare ARP in IPv6: la risoluzione di indirizzo è Neighbor Discovery via NS/NA sul multicast solicited-node.',
            en: 'Looking for ARP in IPv6: address resolution is Neighbor Discovery via NS/NA on the solicited-node multicast.'
          },
          {
            it: 'Trattare il Router Advertisement come attendibile per definizione: senza RA Guard un annuncio falso dirotta il gateway del link.',
            en: 'Treating the Router Advertisement as trustworthy by definition: without RA Guard a forged announcement hijacks the link gateway.'
          }
        ],
        lab: 'ipv6security',
        references: [{ kind: 'rfc', id: 'RFC 4862' }],
        guidedLabs: [
          {
            id: 'gl-ipv6-rogue-ra',
            title: { it: 'SLAAC e il rischio del rogue RA', en: 'SLAAC and the rogue-RA risk' },
            difficulty: 'core',
            lab: 'ipv6security',
            scenario: {
              it: 'Il laboratorio «IPv6 e dual-stack» include lo scenario di Router Advertisement rogue e Neighbor Discovery falsificato, con evidenze e difese al primo hop.',
              en: 'The “IPv6 and dual-stack” lab includes the rogue Router Advertisement and forged Neighbor Discovery scenario, with evidence and first-hop defenses.'
            },
            task: {
              it: 'Ricostruisci come un host arriva al proprio indirizzo con SLAAC e individua il punto in cui un Router Advertisement falso dirotterebbe il traffico, indicando la difesa corretta.',
              en: 'Reconstruct how a host reaches its address with SLAAC and identify where a forged Router Advertisement would hijack traffic, naming the correct defense.'
            },
            steps: [
              {
                it: 'Apri «IPv6 e dual-stack» e seleziona lo scenario di RA rogue e Neighbor Discovery.',
                en: 'Open “IPv6 and dual-stack” and select the rogue RA and Neighbor Discovery scenario.'
              },
              {
                it: 'Segui il flusso RS → RA → formazione dell’indirizzo e nota quale messaggio stabilisce il default gateway.',
                en: 'Follow the RS → RA → address-formation flow and note which message establishes the default gateway.'
              },
              {
                it: 'Collega l’abuso (RA falso) alla difesa al primo hop (RA Guard) e all’evidenza che la rivela.',
                en: 'Connect the abuse (forged RA) to the first-hop defense (RA Guard) and to the evidence that reveals it.'
              }
            ],
            challenge: {
              it: 'Con la privacy extension gli host cambiano interface ID nel tempo: come cambia l’indagine se devi attribuire un flusso a un host preciso?',
              en: 'With the privacy extension hosts change their interface ID over time: how does the investigation change if you must attribute a flow to a specific host?'
            },
            solution: [
              {
                it: 'L’host invia RS a ff02::2, il router risponde con un RA che porta il prefisso /64 e si candida come default gateway; l’host forma l’indirizzo e, dopo il DAD, comunica. Il punto debole è proprio l’RA: un annuncio falso si propone come gateway, e solo RA Guard sullo switch — che scarta gli RA sulle porte non fidate — chiude il buco.',
                en: 'The host sends RS to ff02::2, the router replies with an RA carrying the /64 prefix and offering itself as default gateway; the host forms its address and, after DAD, communicates. The weak point is the RA itself: a forged announcement offers itself as gateway, and only RA Guard on the switch — which drops RAs on untrusted ports — closes the gap.'
              },
              {
                it: 'Sfida: con interface ID che cambiano l’attribuzione non può basarsi sull’indirizzo nel tempo; serve correlare con il MAC osservato nella Neighbor Cache, con i log DHCPv6 (se stateful) e con la finestra temporale, perché l’indirizzo da solo non identifica più l’host in modo stabile.',
                en: 'Challenge: with changing interface IDs, attribution cannot rely on the address over time; it must correlate with the MAC seen in the Neighbor Cache, with DHCPv6 logs (if stateful), and with the time window, because the address alone no longer identifies the host stably.'
              }
            ],
            selfCheck: [
              {
                it: 'So descrivere il flusso SLAAC dal Router Solicitation all’indirizzo pronto dopo il DAD.',
                en: 'I can describe the SLAAC flow from the Router Solicitation to the address ready after DAD.'
              },
              {
                it: 'So dire perché il Router Advertisement va protetto e con quale difesa al primo hop.',
                en: 'I can say why the Router Advertisement must be protected and with which first-hop defense.'
              }
            ]
          }
        ]
      },
      {
        id: 'ipv6-routing-dualstack',
        title: {
          it: 'Routing IPv6 e reti dual-stack',
          en: 'IPv6 routing and dual-stack networks'
        },
        objectives: [
          {
            it: 'Spiegare come si instrada IPv6 e perché i next-hop sono tipicamente indirizzi link-local.',
            en: 'Explain how IPv6 is routed and why next-hops are typically link-local addresses.'
          },
          {
            it: 'Descrivere il funzionamento dual-stack e il rischio di una policy applicata a un solo protocollo.',
            en: 'Describe how dual-stack works and the risk of a policy applied to only one protocol.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere la tabella di routing e il longest prefix match (capitolo sul routing).',
            en: 'Know the routing table and longest prefix match (the routing chapter).'
          }
        ],
        theory: [
          {
            it: 'IPv6 si instrada con la stessa logica di IPv4 — longest prefix match su una tabella separata — ma con alcune differenze pratiche: le rotte statiche si scrivono con ipv6 route, i protocolli hanno versioni dedicate (OSPFv3 al posto di OSPFv2) e soprattutto il next-hop su un collegamento è di norma l’indirizzo link-local del router vicino, non il suo globale. Il router non frammenta più i pacchetti in transito: se un pacchetto è troppo grande scarta e segnala con un messaggio ICMPv6 Packet Too Big, quindi è la sorgente a fare Path MTU Discovery.',
            en: 'IPv6 is routed with the same logic as IPv4 — longest prefix match on a separate table — but with a few practical differences: static routes are written with ipv6 route, protocols have dedicated versions (OSPFv3 instead of OSPFv2), and above all the next-hop on a link is normally the neighbour router’s link-local address, not its global one. The router no longer fragments packets in transit: if a packet is too large it drops it and signals with an ICMPv6 Packet Too Big message, so the source performs Path MTU Discovery.'
          },
          {
            it: 'La maggior parte delle reti non sostituisce IPv4 con IPv6 di colpo: le fa convivere in dual-stack, dove ogni host e ogni router parlano entrambi i protocolli con due tabelle di routing indipendenti. Gli host moderni, con l’algoritmo Happy Eyeballs, tentano in parallelo IPv6 e IPv4 e usano quello che risponde prima, così la transizione è trasparente all’utente.',
            en: 'Most networks do not replace IPv4 with IPv6 at once: they run them side by side in dual-stack, where every host and router speaks both protocols with two independent routing tables. Modern hosts, using the Happy Eyeballs algorithm, try IPv6 and IPv4 in parallel and use whichever answers first, so the transition is transparent to the user.'
          },
          {
            it: 'Il rischio del dual-stack è proprio la doppia strada: una ACL o una regola di firewall scritta solo per IPv4 lascia IPv6 completamente aperto, e un host che ottiene un indirizzo IPv6 via SLAAC senza che nessuno lo preveda crea un percorso non filtrato (shadow IPv6). La regola operativa è una sola: ogni policy va applicata a entrambi i protocolli, e la verifica va fatta su entrambi, perché un controllo valido su IPv4 non dice nulla di IPv6.',
            en: 'The dual-stack risk is precisely the second path: an ACL or firewall rule written only for IPv4 leaves IPv6 completely open, and a host that obtains an IPv6 address via SLAAC without anyone expecting it creates an unfiltered path (shadow IPv6). The operational rule is a single one: every policy must be applied to both protocols, and verification must be done on both, because a check that passes on IPv4 says nothing about IPv6.'
          }
        ],
        example: {
          it: 'Una azienda abilita IPv6 su un segmento ma lascia l’ACL solo in IPv4: i PC ottengono un indirizzo globale via SLAAC e raggiungono Internet su IPv6 aggirando del tutto i controlli pensati per IPv4.',
          en: 'A company enables IPv6 on a segment but leaves the ACL only in IPv4: the PCs obtain a global address via SLAAC and reach the Internet over IPv6, bypassing entirely the controls designed for IPv4.'
        },
        commonMistakes: [
          {
            it: 'Indicare il globale del router come next-hop: su un collegamento il next-hop IPv6 è di norma il link-local del vicino.',
            en: 'Giving the router’s global address as next-hop: on a link the IPv6 next-hop is normally the neighbour’s link-local.'
          },
          {
            it: 'Aspettarsi che il router frammenti: in IPv6 scarta e invia Packet Too Big, e la sorgente fa Path MTU Discovery.',
            en: 'Expecting the router to fragment: in IPv6 it drops and sends Packet Too Big, and the source performs Path MTU Discovery.'
          },
          {
            it: 'Proteggere solo IPv4 in una rete dual-stack: IPv6 resta un percorso parallelo non filtrato finché la stessa policy non vi è applicata.',
            en: 'Protecting only IPv4 in a dual-stack network: IPv6 stays a parallel, unfiltered path until the same policy is applied to it.'
          }
        ],
        lab: 'ipv6security',
        references: [{ kind: 'rfc', id: 'RFC 8200' }],
        guidedLabs: [
          {
            id: 'gl-ipv6-dual-stack-gap',
            title: { it: 'Chiudere il divario dual-stack', en: 'Close the dual-stack gap' },
            difficulty: 'core',
            lab: 'ipv6security',
            scenario: {
              it: 'Il laboratorio «IPv6 e dual-stack» include lo scenario di divergenza di policy dual-stack e shadow IPv6.',
              en: 'The “IPv6 and dual-stack” lab includes the dual-stack policy-drift and shadow-IPv6 scenario.'
            },
            task: {
              it: 'Individua dove una policy applicata solo a IPv4 lascia IPv6 aperto e indica la verifica che lo dimostra su entrambi i protocolli.',
              en: 'Identify where a policy applied only to IPv4 leaves IPv6 open and name the verification that proves it on both protocols.'
            },
            steps: [
              {
                it: 'Apri «IPv6 e dual-stack» e seleziona lo scenario di divergenza di policy dual-stack.',
                en: 'Open “IPv6 and dual-stack” and select the dual-stack policy-drift scenario.'
              },
              {
                it: 'Confronta la regola IPv4 con l’assenza della regola IPv6 corrispondente.',
                en: 'Compare the IPv4 rule with the missing corresponding IPv6 rule.'
              },
              {
                it: 'Scegli la verifica che controlla il flusso su entrambi i protocolli, non solo su IPv4.',
                en: 'Choose the verification that checks the flow on both protocols, not only on IPv4.'
              }
            ],
            challenge: {
              it: 'Gli host hanno IPv6 attivo per default via SLAAC ma la rete lo ignora: come scopri gli shadow IPv6 prima che diventino un percorso di esfiltrazione?',
              en: 'Hosts have IPv6 enabled by default via SLAAC but the network ignores it: how do you discover shadow IPv6 before it becomes an exfiltration path?'
            },
            solution: [
              {
                it: 'Lo shadow IPv6 nasce quando l’ACL vive solo su IPv4: l’host prende un globale via SLAAC e il traffico IPv6 esce non filtrato. La prova è una verifica parallela — stesso test su IPv4 e su IPv6 — che mostra il flusso bloccato su un protocollo e aperto sull’altro; la correzione è replicare la policy in IPv6.',
                en: 'Shadow IPv6 arises when the ACL lives only on IPv4: the host takes a global via SLAAC and IPv6 traffic leaves unfiltered. The proof is a parallel check — the same test on IPv4 and on IPv6 — showing the flow blocked on one protocol and open on the other; the fix is to replicate the policy in IPv6.'
              },
              {
                it: 'Sfida: si scoprono gli shadow IPv6 inventariando gli indirizzi globali formati via SLAAC (dalla Neighbor Cache degli switch e dai log del primo hop) e disabilitando o governando IPv6 dove non è previsto, invece di ignorarlo — perché è attivo per default a prescindere.',
                en: 'Challenge: shadow IPv6 is discovered by inventorying the global addresses formed via SLAAC (from the switches’ Neighbor Cache and first-hop logs) and by disabling or governing IPv6 where it is not intended, instead of ignoring it — because it is on by default regardless.'
              }
            ],
            selfCheck: [
              {
                it: 'So spiegare perché una policy solo-IPv4 lascia un percorso IPv6 aperto in dual-stack.',
                en: 'I can explain why an IPv4-only policy leaves an open IPv6 path in dual-stack.'
              },
              {
                it: 'So indicare una verifica che dimostra lo stato del flusso su entrambi i protocolli.',
                en: 'I can name a verification that proves the flow state on both protocols.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'network-access-discovery',
    cert: 'ccna',
    order: 12,
    track: 'ccna',
    domain: 'network-access',
    title: {
      it: 'Accesso alla rete: scoperta, EtherChannel e wireless',
      en: 'Network access: discovery, EtherChannel, and wireless'
    },
    summary: {
      it: 'Come gli apparati si scoprono tra loro con CDP e LLDP, come più link diventano uno solo con EtherChannel, e come funziona una WLAN dai modi dell’access point al controller, alla configurazione WPA2/WPA3 dalla GUI.',
      en: 'How devices discover each other with CDP and LLDP, how several links become one with EtherChannel, and how a WLAN works from access-point modes to the controller and WPA2/WPA3 configuration from the GUI.'
    },
    topics: [
      {
        id: 'neighbor-discovery',
        title: {
          it: 'Scoperta dei vicini: CDP e LLDP',
          en: 'Neighbor discovery: CDP and LLDP'
        },
        objectives: [
          {
            it: 'Distinguere CDP da LLDP e dire quali informazioni sul vicino riportano.',
            en: 'Distinguish CDP from LLDP and state which neighbour information they report.'
          },
          {
            it: 'Spiegare perché la scoperta dei vicini è utile a chi documenta la rete e rischiosa verso reti non fidate.',
            en: 'Explain why neighbour discovery helps whoever documents the network and is risky toward untrusted networks.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere switch, trunk e VLAN (capitoli sullo switching e sulle VLAN).',
            en: 'Know switches, trunks, and VLANs (the switching and VLAN chapters).'
          }
        ],
        theory: [
          {
            it: 'CDP (Cisco Discovery Protocol) e LLDP (Link Layer Discovery Protocol) sono protocolli di livello 2 con cui un apparato annuncia la propria identità ai vicini direttamente collegati: a intervalli regolari invia un frame che riporta device ID, piattaforma, versione, porta di uscita e VLAN. Il vicino raccoglie questi annunci e costruisce una mappa di chi è attaccato a quale porta, senza alcuna configurazione IP. CDP è proprietario Cisco; LLDP è lo standard aperto IEEE 802.1AB e funziona anche tra apparati di produttori diversi.',
            en: 'CDP (Cisco Discovery Protocol) and LLDP (Link Layer Discovery Protocol) are Layer 2 protocols by which a device announces its identity to directly connected neighbours: at regular intervals it sends a frame reporting device ID, platform, version, egress port, and VLAN. The neighbour collects these announcements and builds a map of who is attached to which port, with no IP configuration at all. CDP is Cisco proprietary; LLDP is the open IEEE 802.1AB standard and works between devices from different vendors too.'
          },
          {
            it: 'La stessa informazione che rende la scoperta preziosa per documentare una topologia la rende un regalo per un attaccante: un frame CDP rivela modello, versione del software e VLAN nativa, cioè esattamente ciò che serve per scegliere un exploit o un attacco di VLAN hopping. La regola operativa è disabilitare CDP e LLDP sulle porte verso reti non fidate (accesso utenti, DMZ, link esterni) e lasciarli attivi solo sui collegamenti di infrastruttura dove servono davvero.',
            en: 'The same information that makes discovery valuable for documenting a topology makes it a gift to an attacker: a CDP frame reveals model, software version, and native VLAN — exactly what is needed to pick an exploit or a VLAN hopping attack. The operational rule is to disable CDP and LLDP on ports facing untrusted networks (user access, DMZ, external links) and leave them on only on the infrastructure links where they are genuinely useful.'
          },
          {
            it: 'La scoperta dei vicini aiuta anche a trovare i disallineamenti: CDP segnala un native VLAN mismatch quando i due estremi di un trunk non concordano sulla VLAN nativa, e confrontare la porta annunciata dal vicino con quella attesa smaschera un cablaggio sbagliato. È diagnostica, non sicurezza: dice com’è fatta la rete, non la protegge.',
            en: 'Neighbour discovery also helps find mismatches: CDP flags a native VLAN mismatch when the two ends of a trunk disagree on the native VLAN, and comparing the port the neighbour advertises with the expected one exposes miswiring. It is diagnostics, not security: it tells how the network is built, it does not protect it.'
          }
        ],
        example: {
          it: 'Su uno switch il comando show cdp neighbors elenca, per ogni porta, il vicino direttamente collegato con il suo device ID e la sua porta: è il modo più rapido per ricostruire una topologia non documentata, ma è anche ciò che un attaccante collegato vede per primo.',
          en: 'On a switch the command show cdp neighbors lists, for each port, the directly connected neighbour with its device ID and its port: it is the fastest way to reconstruct an undocumented topology, but it is also what an attacker who is connected sees first.'
        },
        commonMistakes: [
          {
            it: 'Credere che CDP e LLDP attraversino la rete: sono limitati al singolo collegamento, perché descrivono solo il vicino direttamente connesso.',
            en: 'Believing CDP and LLDP cross the network: they are limited to a single link, because they describe only the directly connected neighbour.'
          },
          {
            it: 'Lasciare la scoperta attiva sulle porte di accesso: espone modello, versione e VLAN nativa a chiunque si colleghi.',
            en: 'Leaving discovery on on access ports: it exposes model, version, and native VLAN to anyone who connects.'
          },
          {
            it: 'Confondere LLDP e CDP: LLDP è lo standard aperto multi-vendor, CDP è proprietario Cisco; su una rete mista serve LLDP.',
            en: 'Confusing LLDP and CDP: LLDP is the open multi-vendor standard, CDP is Cisco proprietary; a mixed network needs LLDP.'
          }
        ],
        lab: 'access',
        references: [{ kind: 'ieee', id: 'IEEE 802.1AB' }]
      },
      {
        id: 'etherchannel',
        title: {
          it: 'EtherChannel: aggregare i link',
          en: 'EtherChannel: aggregating links'
        },
        objectives: [
          {
            it: 'Spiegare perché EtherChannel aggrega più link fisici in un unico collegamento logico e come interagisce con STP.',
            en: 'Explain why EtherChannel aggregates several physical links into one logical link and how it interacts with STP.'
          },
          {
            it: 'Scegliere le modalità di negoziazione compatibili di LACP e PAgP ed evitare le combinazioni che non formano il canale.',
            en: 'Choose compatible LACP and PAgP negotiation modes and avoid the combinations that do not form the channel.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere lo Spanning Tree e perché blocca i link ridondanti (capitolo su VLAN e STP).',
            en: 'Know Spanning Tree and why it blocks redundant links (the VLAN and STP chapter).'
          }
        ],
        theory: [
          {
            it: 'EtherChannel unisce da due a otto link fisici paralleli in un unico collegamento logico (port-channel). Il vantaggio è doppio: la banda si somma e, soprattutto, lo Spanning Tree vede un solo link logico e non ne blocca nessuno, così tutti i cavi portano traffico invece di restare in standby. Il bilanciamento distribuisce i flussi sui membri in base a un hash (di MAC, IP o porte): un singolo flusso resta su un membro, ma flussi diversi usano link diversi.',
            en: 'EtherChannel joins two to eight parallel physical links into one logical link (port-channel). The benefit is twofold: bandwidth adds up and, above all, Spanning Tree sees a single logical link and blocks none of them, so every cable carries traffic instead of sitting in standby. Load balancing spreads flows across the members using a hash (of MAC, IP, or ports): a single flow stays on one member, but different flows use different links.'
          },
          {
            it: 'Il canale si forma solo se i due estremi negoziano in modo compatibile. LACP (standard, IEEE 802.1AX) usa le modalità active (avvia la negoziazione) e passive (risponde soltanto): active con active o active con passive formano il canale, ma passive con passive no, perché nessuno dei due inizia. PAgP (proprietario Cisco) usa desirable (avvia) e auto (risponde) con la stessa logica. La modalità on forza il canale senza negoziare e deve essere su entrambi i lati: on con un lato che negozia non forma il canale e crea instabilità.',
            en: 'The channel forms only if the two ends negotiate compatibly. LACP (the standard, IEEE 802.1AX) uses the modes active (starts the negotiation) and passive (only responds): active with active or active with passive form the channel, but passive with passive does not, because neither one starts. PAgP (Cisco proprietary) uses desirable (starts) and auto (responds) with the same logic. The on mode forces the channel without negotiating and must be on both sides: on with a side that negotiates does not form the channel and creates instability.'
          },
          {
            it: 'Perché il canale venga su, tutti i membri devono essere coerenti: stessa velocità e duplex, stessa modalità (access o trunk), stesse VLAN consentite e, su un trunk, stessa VLAN nativa. Un solo membro incoerente viene escluso dal canale, e un mismatch di protocollo (un lato LACP e l’altro PAgP) impedisce del tutto la formazione. È un errore frequente mescolare le due famiglie di negoziazione.',
            en: 'For the channel to come up, all members must be consistent: same speed and duplex, same mode (access or trunk), same allowed VLANs and, on a trunk, same native VLAN. A single inconsistent member is excluded from the channel, and a protocol mismatch (one side LACP and the other PAgP) prevents formation entirely. Mixing the two negotiation families is a frequent mistake.'
          }
        ],
        example: {
          it: 'Due switch collegati da quattro cavi li aggregano in un port-channel: STP non blocca più tre dei quattro link, la banda disponibile quadruplica e, se un cavo si guasta, il canale continua sui tre rimasti senza una nuova convergenza di STP.',
          en: 'Two switches connected by four cables aggregate them into a port-channel: STP no longer blocks three of the four links, available bandwidth quadruples and, if a cable fails, the channel continues on the remaining three without a new STP convergence.'
        },
        commonMistakes: [
          {
            it: 'Configurare entrambi i lati in passive (o entrambi in auto): nessuno avvia la negoziazione e il canale non si forma.',
            en: 'Configuring both sides as passive (or both as auto): neither starts the negotiation and the channel does not form.'
          },
          {
            it: 'Mescolare LACP e PAgP sui due estremi: i protocolli non si parlano e il port-channel resta giù.',
            en: 'Mixing LACP and PAgP on the two ends: the protocols do not talk and the port-channel stays down.'
          },
          {
            it: 'Aspettarsi che un singolo flusso superi la velocità di un membro: il bilanciamento è per flusso, non per pacchetto.',
            en: 'Expecting a single flow to exceed one member’s speed: balancing is per flow, not per packet.'
          }
        ],
        lab: 'access',
        references: [{ kind: 'ieee', id: 'IEEE 802.1AX' }],
        guidedLabs: [
          {
            id: 'gl-etherchannel-modes',
            title: { it: 'Quali modalità formano il canale', en: 'Which modes form the channel' },
            difficulty: 'core',
            lab: 'access',
            scenario: {
              it: 'Il laboratorio «Accesso alla rete» include un simulatore di EtherChannel che, scelte le modalità dei due estremi, mostra se il port-channel si forma.',
              en: 'The “Network access” lab includes an EtherChannel simulator that, once the two ends’ modes are chosen, shows whether the port-channel forms.'
            },
            task: {
              it: 'Per ogni coppia di modalità prevedi se il canale si forma e perché, poi verifica con il simulatore.',
              en: 'For each pair of modes predict whether the channel forms and why, then check with the simulator.'
            },
            steps: [
              {
                it: 'Apri «Accesso alla rete» e individua il simulatore di EtherChannel.',
                en: 'Open “Network access” and find the EtherChannel simulator.'
              },
              {
                it: 'Imposta i due estremi e ricorda che serve almeno un lato che avvia (active o desirable).',
                en: 'Set the two ends and remember that at least one side must start (active or desirable).'
              },
              {
                it: 'Verifica che i due lati usino la stessa famiglia (entrambi LACP o entrambi PAgP) e che on sia su entrambi.',
                en: 'Check that the two sides use the same family (both LACP or both PAgP) and that on is on both.'
              }
            ],
            challenge: {
              it: 'Il canale è su ma un membro ha una VLAN consentita diversa: cosa succede a quel membro e al traffico di quella VLAN?',
              en: 'The channel is up but one member has a different allowed VLAN: what happens to that member and to that VLAN’s traffic?'
            },
            solution: [
              {
                it: 'Il canale si forma quando almeno un lato avvia e l’altro almeno risponde: active/active, active/passive e desirable/auto funzionano; passive/passive e auto/auto no; on richiede on su entrambi; LACP con PAgP non si parla. La ragione è sempre la stessa: qualcuno deve iniziare la negoziazione, e i due lati devono usare lo stesso linguaggio.',
                en: 'The channel forms when at least one side starts and the other at least responds: active/active, active/passive, and desirable/auto work; passive/passive and auto/auto do not; on requires on on both; LACP with PAgP does not talk. The reason is always the same: someone must start the negotiation, and the two sides must speak the same language.'
              },
              {
                it: 'Sfida: un membro con VLAN consentite diverse viene escluso dal canale per incoerenza; resta fisicamente su ma fuori dal port-channel, e il traffico di quella VLAN non lo usa finché la configurazione non viene allineata.',
                en: 'Challenge: a member with different allowed VLANs is excluded from the channel for inconsistency; it stays physically up but outside the port-channel, and that VLAN’s traffic does not use it until the configuration is aligned.'
              }
            ],
            selfCheck: [
              {
                it: 'So dire, per ogni coppia di modalità, se il canale si forma e perché.',
                en: 'I can say, for each pair of modes, whether the channel forms and why.'
              },
              {
                it: 'So elencare le coerenze richieste a tutti i membri perché il canale venga su.',
                en: 'I can list the consistencies required of all members for the channel to come up.'
              }
            ]
          }
        ]
      },
      {
        id: 'wlan-ap-wlc',
        title: {
          it: 'WLAN: modi dell’AP, WLC e sicurezza',
          en: 'WLAN: AP modes, WLC, and security'
        },
        objectives: [
          {
            it: 'Distinguere AP autonomo e lightweight e descrivere il ruolo del WLC e del tunnel CAPWAP.',
            en: 'Distinguish autonomous and lightweight APs and describe the role of the WLC and the CAPWAP tunnel.'
          },
          {
            it: 'Configurare una WLAN WPA2/WPA3 dalla GUI del controller e scegliere il metodo di accesso di gestione corretto.',
            en: 'Configure a WPA2/WPA3 WLAN from the controller GUI and choose the correct management-access method.'
          }
        ],
        prerequisites: [
          {
            it: 'Sapere che un access point fa da bridge tra radio e rete cablata e mappa un SSID su una VLAN (capitolo sui componenti).',
            en: 'Know that an access point bridges radio and wired network and maps an SSID to a VLAN (the components chapter).'
          }
        ],
        theory: [
          {
            it: 'Un access point può essere autonomo — configurato uno per uno e indipendente — oppure lightweight, cioè gestito da un Wireless LAN Controller. Nel modello lightweight l’AP e il WLC parlano attraverso il tunnel CAPWAP, che separa il control plane (gestione, cifrato con DTLS) dal data plane: il WLC centralizza configurazione, RF management, roaming e policy, mentre l’AP resta responsabile delle funzioni radio in tempo reale (split-MAC). È la scelta quando gli AP sono molti, perché una modifica si applica una volta sola sul controller invece che su ogni apparato.',
            en: 'An access point can be autonomous — configured one by one and independent — or lightweight, that is, managed by a Wireless LAN Controller. In the lightweight model the AP and the WLC talk through the CAPWAP tunnel, which separates the control plane (management, DTLS-encrypted) from the data plane: the WLC centralizes configuration, RF management, roaming, and policy, while the AP remains responsible for real-time radio functions (split-MAC). It is the choice when APs are numerous, because a change is applied once on the controller instead of on every device.'
          },
          {
            it: 'Associarsi non è autenticarsi. Un client prima scopre l’AP (beacon o probe), poi si autentica e solo dopo si associa: sono tre passi distinti, e un client associato non è ancora autorizzato sulla rete. La sicurezza del livello 2 wireless sta nella coppia Authentication Key Management e cifratura: WPA2 usa AES/CCMP, WPA3 aggiunge SAE (che sostituisce la vulnerabile handshake PSK) e rende obbligatori i Protected Management Frames (802.11w). La PSK è condivisa da tutti i client, quindi non identifica nessuno e non si revoca singolarmente: per utenti nominali serve WPA2/WPA3-Enterprise con 802.1X.',
            en: 'Associating is not authenticating. A client first discovers the AP (beacon or probe), then authenticates, and only afterwards associates: these are three distinct steps, and an associated client is not yet authorized on the network. Wireless Layer 2 security lives in the Authentication Key Management and encryption pair: WPA2 uses AES/CCMP, WPA3 adds SAE (which replaces the vulnerable PSK handshake) and makes Protected Management Frames (802.11w) mandatory. The PSK is shared by every client, so it identifies no one and cannot be revoked individually: for named users you need WPA2/WPA3-Enterprise with 802.1X.'
          },
          {
            it: 'Nell’interfaccia classica AireOS del WLC, la WLAN si crea in pochi passi: nella scheda General si impostano Profile Name, SSID, Status e la Interface che lega la WLAN alla sua VLAN; nella scheda Security si sceglie Layer 2 Security = WPA2 (o WPA2+WPA3), AES/CCMP e Authentication Key Management = PSK con la passphrase. È un flusso distinto dal modello a profili e tag di Catalyst 9800 IOS XE descritto nell’argomento successivo. Il controller stesso va protetto: lo si configura via HTTPS (GUI cifrata con TLS) limitato alle sorgenti di management, mai via HTTP in chiaro, perché quella GUI espone le credenziali dell’intera infrastruttura wireless.',
            en: 'In the classic AireOS WLC interface, a WLAN is created in a few steps: in the General tab you set Profile Name, SSID, Status, and the Interface that binds the WLAN to its VLAN; in the Security tab you choose Layer 2 Security = WPA2 (or WPA2+WPA3), AES/CCMP, and Authentication Key Management = PSK with the passphrase. This flow differs from the Catalyst 9800 IOS XE profile-and-tag model covered in the next topic. The controller itself must be protected: configure it over HTTPS (a TLS-encrypted GUI) restricted to management sources, never over cleartext HTTP, because that GUI exposes the credentials of the whole wireless infrastructure.'
          }
        ],
        example: {
          it: 'Un WLC con venti AP lightweight distribuisce una nuova WLAN WPA2 PSK a tutti in un’unica configurazione: senza controller, la stessa WLAN andrebbe creata a mano su venti AP autonomi, con il rischio di venti configurazioni leggermente diverse.',
          en: 'A WLC with twenty lightweight APs pushes a new WPA2 PSK WLAN to all of them in a single configuration: without a controller, the same WLAN would have to be created by hand on twenty autonomous APs, with the risk of twenty slightly different configurations.'
        },
        commonMistakes: [
          {
            it: 'Confondere associazione e autorizzazione: un client associato ha completato il livello 2, non è ancora detto che sia autenticato sulla rete.',
            en: 'Confusing association and authorization: an associated client has completed Layer 2, it is not yet necessarily authenticated on the network.'
          },
          {
            it: 'Usare la PSK dove servono utenti nominali: non identifica nessuno e non si revoca, quindi per quello serve l’Enterprise con 802.1X.',
            en: 'Using the PSK where named users are needed: it identifies no one and cannot be revoked, so Enterprise with 802.1X is required for that.'
          },
          {
            it: 'Gestire il WLC via HTTP in chiaro: espone le credenziali di tutta l’infrastruttura wireless; va usato HTTPS limitato alle sorgenti di management.',
            en: 'Managing the WLC over cleartext HTTP: it exposes the credentials of the whole wireless infrastructure; use HTTPS restricted to management sources.'
          }
        ],
        lab: 'access',
        references: [{ kind: 'ieee', id: 'IEEE 802.11' }],
        guidedLabs: [
          {
            id: 'gl-wlan-wpa2-gui',
            title: { it: 'Creare una WLAN WPA2 dalla GUI', en: 'Create a WPA2 WLAN from the GUI' },
            difficulty: 'core',
            lab: 'access',
            scenario: {
              it: 'Il laboratorio «Accesso alla rete» descrive, scheda per scheda, la sequenza di campi per creare una WLAN WPA2 PSK sulla GUI di un WLC.',
              en: 'The “Network access” lab describes, tab by tab, the sequence of fields to create a WPA2 PSK WLAN on a WLC GUI.'
            },
            task: {
              it: 'Ricostruisci l’ordine dei campi dalla scheda General a Security e indica dove la WLAN viene legata alla sua VLAN e dove si imposta la cifratura.',
              en: 'Reconstruct the order of fields from the General tab to Security and point out where the WLAN is bound to its VLAN and where encryption is set.'
            },
            steps: [
              {
                it: 'Apri «Accesso alla rete» e leggi la sequenza della configurazione WLAN dalla GUI del WLC.',
                en: 'Open “Network access” and read the WLAN configuration sequence from the WLC GUI.'
              },
              {
                it: 'Nella scheda General individua l’Interface che lega la WLAN alla VLAN (e quindi alla subnet).',
                en: 'In the General tab find the Interface that binds the WLAN to its VLAN (and therefore to its subnet).'
              },
              {
                it: 'Nella scheda Security imposta Layer 2 Security = WPA2, AES/CCMP e Key Management = PSK con la passphrase.',
                en: 'In the Security tab set Layer 2 Security = WPA2, AES/CCMP, and Key Management = PSK with the passphrase.'
              }
            ],
            challenge: {
              it: 'La WLAN deve servire utenti nominali tracciabili invece di una passphrase condivisa: cosa cambia nella scheda Security e perché?',
              en: 'The WLAN must serve traceable named users instead of a shared passphrase: what changes in the Security tab and why?'
            },
            solution: [
              {
                it: 'La WLAN si lega alla VLAN tramite l’Interface nella scheda General; la cifratura e l’autenticazione si impostano nella scheda Security con WPA2, AES/CCMP e Key Management = PSK. TKIP resta disattivato perché deprecato, e la passphrase è condivisa da tutti i client.',
                en: 'The WLAN is bound to its VLAN through the Interface in the General tab; encryption and authentication are set in the Security tab with WPA2, AES/CCMP, and Key Management = PSK. TKIP stays off because it is deprecated, and the passphrase is shared by every client.'
              },
              {
                it: 'Sfida: per utenti nominali si passa da PSK a 802.1X (WPA2/WPA3-Enterprise), che autentica ogni utente contro un server e permette di revocare un singolo accesso; la PSK condivisa non lo consente, perché non distingue un client dall’altro.',
                en: 'Challenge: for named users you move from PSK to 802.1X (WPA2/WPA3-Enterprise), which authenticates each user against a server and allows a single access to be revoked; the shared PSK cannot, because it does not tell one client from another.'
              }
            ],
            selfCheck: [
              {
                it: 'So ricostruire i campi essenziali per creare una WLAN WPA2 PSK dalla GUI del WLC.',
                en: 'I can reconstruct the essential fields to create a WPA2 PSK WLAN from the WLC GUI.'
              },
              {
                it: 'So spiegare quando serve l’Enterprise con 802.1X al posto della PSK.',
                en: 'I can explain when Enterprise with 802.1X is needed instead of the PSK.'
              }
            ]
          },
          {
            id: 'gl-wlan-evil-twin',
            title: { it: 'Riconoscere un evil twin', en: 'Recognise an evil twin' },
            difficulty: 'advanced',
            lab: 'wirelesssecurity',
            scenario: {
              it: 'Il laboratorio «Sicurezza wireless» include lo scenario dell’evil twin con autenticazione enterprise.',
              en: 'The “Wireless security” lab includes the evil-twin scenario with enterprise authentication.'
            },
            task: {
              it: 'Individua cosa, nell’autenticazione enterprise, impedisce a un evil twin con lo stesso SSID di rubare le credenziali.',
              en: 'Identify what, in enterprise authentication, prevents an evil twin with the same SSID from stealing credentials.'
            },
            steps: [
              {
                it: 'Apri «Sicurezza wireless» e seleziona lo scenario di evil twin con EAP.',
                en: 'Open “Wireless security” and select the evil-twin scenario with EAP.'
              },
              {
                it: 'Nota che lo stesso SSID e un RSSI alto non provano che l’AP sia legittimo.',
                en: 'Note that the same SSID and a high RSSI do not prove the AP is legitimate.'
              },
              {
                it: 'Collega la difesa alla validazione del certificato del server durante lo scambio EAP.',
                en: 'Connect the defense to the validation of the server certificate during the EAP exchange.'
              }
            ],
            challenge: {
              it: 'Con WPA2 PSK, perché un evil twin è più pericoloso che con l’Enterprise, e quale proprietà di WPA3 riduce il rischio?',
              en: 'With WPA2 PSK, why is an evil twin more dangerous than with Enterprise, and which WPA3 property reduces the risk?'
            },
            solution: [
              {
                it: 'Nell’autenticazione enterprise (802.1X/EAP-TLS) il client valida il certificato del server prima di presentare le credenziali: un evil twin senza quel certificato fidato viene rifiutato, quindi lo stesso SSID non basta a ingannare il client. I Protected Management Frames (obbligatori con WPA3) impediscono inoltre i frame di deautenticazione falsi che spingono i client verso l’AP ostile.',
                en: 'In enterprise authentication (802.1X/EAP-TLS) the client validates the server certificate before presenting credentials: an evil twin without that trusted certificate is rejected, so the same SSID is not enough to fool the client. Protected Management Frames (mandatory with WPA3) also prevent the forged deauthentication frames that push clients toward the hostile AP.'
              },
              {
                it: 'Sfida: con WPA2 PSK la chiave è condivisa e non c’è un server da validare, quindi un evil twin che conosce la passphrase intercetta il traffico; WPA3 con SAE rende la handshake resistente al dizionario e, con i Protected Management Frames, toglie all’attaccante la deautenticazione.',
                en: 'Challenge: with WPA2 PSK the key is shared and there is no server to validate, so an evil twin that knows the passphrase intercepts traffic; WPA3 with SAE makes the handshake dictionary-resistant and, with Protected Management Frames, takes deauthentication away from the attacker.'
              }
            ],
            selfCheck: [
              {
                it: 'So spiegare perché lo stesso SSID non prova la legittimità di un AP.',
                en: 'I can explain why the same SSID does not prove an AP’s legitimacy.'
              },
              {
                it: 'So dire quale proprietà dell’Enterprise e di WPA3 neutralizza un evil twin.',
                en: 'I can state which property of Enterprise and WPA3 neutralises an evil twin.'
              }
            ]
          }
        ]
      },
      {
        id: 'wlc-gui-policy-mapping',
        title: {
          it: 'WLC Catalyst 9800: dalla WLAN ai tag dell’AP',
          en: 'Catalyst 9800 WLC: from WLAN to AP tags'
        },
        diagram: 'wlc-policy-mapping',
        objectives: [
          {
            it: 'Distinguere WLAN profile, policy profile e policy tag nella GUI del Catalyst 9800.',
            en: 'Distinguish the WLAN profile, policy profile, and policy tag in the Catalyst 9800 GUI.'
          },
          {
            it: 'Seguire l’associazione SSID→VLAN e prevedere dove passa il traffico con central o local switching.',
            en: 'Trace the SSID-to-VLAN mapping and predict where traffic flows with central or local switching.'
          },
          {
            it: 'Verificare quali tag e percorsi di gestione sono necessari perché un AP pubblichi la WLAN in sicurezza.',
            en: 'Check which tags and management paths are required for an AP to advertise the WLAN securely.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere SSID, VLAN, trunk e il ruolo del tunnel CAPWAP illustrati nel tema WLAN precedente.',
            en: 'Know SSIDs, VLANs, trunks, and the role of the CAPWAP tunnel from the preceding WLAN topic.'
          }
        ],
        theory: [
          {
            it: 'Sul Catalyst 9800 con IOS XE la GUI organizza la configurazione in profili e tag. Il WLAN profile definisce la WLAN/SSID e le impostazioni di sicurezza; il policy profile definisce la policy del client, inclusi VLAN e modalità di switching. Il policy tag collega una WLAN profile al relativo policy profile: creare i due profili senza associare il tag e applicarlo all’AP non rende la WLAN disponibile su quell’AP. I nomi e la posizione dei menu possono variare leggermente tra release IOS XE; il modello logico resta il riferimento.',
            en: 'On a Catalyst 9800 running IOS XE, the GUI organises configuration into profiles and tags. The WLAN profile defines the WLAN/SSID and security settings; the policy profile defines client policy, including VLAN and switching mode. The policy tag links a WLAN profile to its policy profile: creating both profiles without mapping the tag and applying it to an AP does not make the WLAN available on that AP. Menu names and locations can vary slightly across IOS XE releases; the logical model remains the guide.'
          },
          {
            it: 'Il policy tag non sostituisce gli altri tag dell’AP: il site tag governa l’appartenenza al sito e il comportamento di join (tra cui il modello di switching previsto), mentre l’RF tag associa i profili radio. Il mapping WLAN↔policy profile determina la policy client; site e RF tag descrivono contesto operativo e radio. Separarli aiuta a capire quale oggetto correggere quando una WLAN manca, un AP non fa join o una radio usa parametri inattesi.',
            en: 'The policy tag does not replace the AP’s other tags: the site tag governs site membership and join behaviour (including the intended switching model), while the RF tag assigns radio profiles. The WLAN-to-policy-profile mapping determines client policy; site and RF tags describe operating context and radio settings. Keeping them distinct helps identify which object to fix when a WLAN is missing, an AP will not join, or a radio uses unexpected settings.'
          },
          {
            it: 'Con central switching il traffico dati del client attraversa CAPWAP fino al controller, dove viene associato al contesto VLAN configurato; con local switching viene inoltrato dalla sede tramite l’AP e il relativo trunk. Il control channel CAPWAP usa UDP 5246 e il data channel UDP 5247; DTLS protegge il control channel, mentre la protezione DTLS del data channel dipende dalla configurazione e dal supporto. La VLAN client deve esistere nel corretto contesto e attraversare il percorso cablato fino al gateway: il solo SSID o una VLAN configurata nel controller non crea il trunk né il routing.',
            en: 'With central switching, client data traverses CAPWAP to the controller, where it is associated with the configured VLAN context; with local switching, it is forwarded at the site through the AP and its uplink trunk. The CAPWAP control channel uses UDP 5246 and the data channel UDP 5247; DTLS protects the control channel, while DTLS protection for the data channel depends on configuration and support. The client VLAN must exist in the right context and traverse the wired path to its gateway: an SSID or a VLAN configured on the controller does not create the trunk or routing.'
          },
          {
            it: 'Tratta il WLC come un piano di gestione privilegiato: usa la GUI via HTTPS, AAA con identità individuali e accesso limitato a una rete o a sorgenti di management; consenti i flussi CAPWAP necessari solo tra AP e controller previsti. Dopo una modifica verifica join dell’AP, tag effettivamente applicati, associazione del client, assegnazione IP/DHCP e raggiungibilità del gateway: così distingui un problema radio da un errore di policy o di VLAN.',
            en: 'Treat the WLC as a privileged management plane: use its GUI over HTTPS, AAA with individual identities, and access restricted to a management network or approved management sources; allow required CAPWAP flows only between intended APs and controllers. After a change, verify AP join, applied tags, client association, DHCP/IP assignment, and gateway reachability: this separates a radio issue from a policy or VLAN error.'
          }
        ],
        example: {
          it: 'Una filiale usa il WLAN profile `CORP` e il policy profile `EMPLOYEE` associato alla VLAN 120. Il policy tag `BRANCH` collega i profili ed è assegnato agli AP della sede insieme ai tag site e RF corretti. In central switching il client percorre il tunnel dati fino al WLC; in local switching la VLAN 120 deve invece essere ammessa sull’uplink locale dell’AP. In entrambi i casi si controllano il trunk a monte, lo scope DHCP e il gateway della VLAN 120 prima di attribuire il guasto all’autenticazione wireless.',
          en: 'A branch uses the `CORP` WLAN profile and the `EMPLOYEE` policy profile mapped to VLAN 120. The `BRANCH` policy tag links the profiles and is assigned to the site APs alongside the correct site and RF tags. With central switching, client data traverses the tunnel to the WLC; with local switching, VLAN 120 must instead be allowed on the AP’s local uplink. In either case, check the upstream trunk, DHCP scope, and VLAN 120 gateway before blaming wireless authentication.'
        },
        commonMistakes: [
          {
            it: 'Confondere il WLAN profile con la configurazione completa dell’AP: il policy tag deve collegare i profili e risultare applicato all’AP perché la WLAN venga distribuita.',
            en: 'Confusing the WLAN profile with a complete AP configuration: the policy tag must link the profiles and be applied to the AP for the WLAN to be provisioned.'
          },
          {
            it: 'Scambiare policy tag, site tag e RF tag o tentare di risolvere una VLAN client modificando il solo RF tag.',
            en: 'Mixing up policy, site, and RF tags, or trying to fix a client VLAN by changing only the RF tag.'
          },
          {
            it: 'Presumere che central e local switching abbiano lo stesso percorso dati o che il controller crei automaticamente VLAN, trunk e gateway.',
            en: 'Assuming central and local switching use the same data path, or that the controller automatically creates VLANs, trunks, and gateways.'
          },
          {
            it: 'Esporre la GUI di gestione del controller alla rete client o consentire CAPWAP da sorgenti non previste.',
            en: 'Exposing the controller management GUI to the client network or allowing CAPWAP from unintended sources.'
          }
        ],
        references: [
          { kind: 'cisco', id: 'Catalyst 9800 configuration model and WLAN policy profile GUI' },
          { kind: 'rfc', id: 'RFC 5415' }
        ]
      }
    ]
  },
  {
    id: 'ip-services-extended',
    cert: 'ccna',
    order: 13,
    track: 'ccna',
    domain: 'ip-services',
    title: {
      it: 'Servizi IP estesi e ridondanza del gateway',
      en: 'Extended IP services and gateway redundancy'
    },
    summary: {
      it: 'I servizi che rendono una rete gestibile e resiliente: la ridondanza del primo hop con FHRP, il tempo e la telemetria con NTP, SNMP e Syslog, e la qualità del servizio con l’accesso sicuro agli apparati.',
      en: 'The services that make a network manageable and resilient: first-hop redundancy with FHRP, time and telemetry with NTP, SNMP and Syslog, and quality of service alongside secure device access.'
    },
    topics: [
      {
        id: 'fhrp-gateway-redundancy',
        title: {
          it: 'FHRP: ridondanza del primo hop',
          en: 'FHRP: first-hop redundancy'
        },
        objectives: [
          {
            it: 'Spiegare come un FHRP presenta un gateway virtuale e come avviene il subentro tra router.',
            en: 'Explain how an FHRP presents a virtual gateway and how failover between routers happens.'
          },
          {
            it: 'Distinguere HSRP, VRRP e GLBP per priorità, preempt e comportamento in caso di guasto.',
            en: 'Distinguish HSRP, VRRP, and GLBP by priority, preemption, and failure behaviour.'
          }
        ],
        prerequisites: [
          {
            it: 'Sapere che l’host consegna al default gateway ciò che è fuori dalla sua subnet (capitolo sul routing).',
            en: 'Know that a host delivers off-subnet traffic to the default gateway (the routing chapter).'
          }
        ],
        theory: [
          {
            it: 'Un host ha un solo default gateway configurato: se quel router cade, l’host resta isolato anche quando esiste un secondo router. Un FHRP (First Hop Redundancy Protocol) risolve il problema presentando agli host un indirizzo IP virtuale e un MAC virtuale condivisi da due o più router: gli host puntano al virtuale, e dietro di esso un router è attivo mentre gli altri sono in standby, pronti a subentrare. Questo argomento appartiene al dominio 3.0 (Connettività IP) ma vive qui perché completa i servizi che rendono la rete affidabile.',
            en: 'A host has a single configured default gateway: if that router fails, the host is isolated even when a second router exists. An FHRP (First Hop Redundancy Protocol) solves this by presenting hosts with a shared virtual IP address and virtual MAC owned by two or more routers: hosts point at the virtual one, and behind it one router is active while the others stand by, ready to take over. This topic belongs to domain 3.0 (IP Connectivity) but lives here because it completes the services that make a network reliable.'
          },
          {
            it: 'HSRP è proprietario Cisco: vince il router con priorità più alta (default 100), poi l’IP più alto, e il MAC virtuale è 0000.0C07.ACxx (xx = gruppo) in HSRPv1. Senza il comando preempt, un router a priorità maggiore che torna online non riprende il ruolo attivo, per evitare un flap. VRRP è lo standard aperto (RFC 5798) con la stessa logica di priorità ma con il preempt attivo per impostazione predefinita. GLBP, anch’esso Cisco, va oltre la coppia attivo/standby: distribuisce il carico tra più gateway dello stesso gruppo invece di tenerne uno solo attivo.',
            en: 'HSRP is Cisco proprietary: the router with the highest priority wins (default 100), then the highest IP, and the virtual MAC is 0000.0C07.ACxx (xx = group) in HSRPv1. Without the preempt command, a higher-priority router that comes back online does not reclaim the active role, to avoid a flap. VRRP is the open standard (RFC 5798) with the same priority logic but with preemption enabled by default. GLBP, also Cisco, goes beyond the active/standby pair: it shares load across several gateways in the same group instead of keeping only one active.'
          },
          {
            it: 'Il subentro è trasparente perché a cambiare è solo quale router risponde all’IP e al MAC virtuali: gli host non riconfigurano nulla e la loro tabella ARP resta valida. Il tempo di failover dipende dai timer di hello e hold; abbassarli accelera il subentro ma aumenta il traffico di controllo e il rischio di flap su link instabili. L’FHRP protegge il gateway, non il percorso a valle: un guasto oltre il primo hop non lo riguarda.',
            en: 'Failover is transparent because all that changes is which router answers the virtual IP and MAC: hosts reconfigure nothing and their ARP table stays valid. Failover time depends on the hello and hold timers; lowering them speeds up the takeover but increases control traffic and the risk of flapping on unstable links. An FHRP protects the gateway, not the path downstream: a failure beyond the first hop is none of its concern.'
          }
        ],
        example: {
          it: 'Due router condividono un IP virtuale che gli host usano come gateway: il router attivo inoltra, lo standby ascolta gli hello; se l’attivo smette di rispondere, lo standby assume IP e MAC virtuali e il traffico prosegue senza che un solo host cambi configurazione.',
          en: 'Two routers share a virtual IP that hosts use as their gateway: the active router forwards, the standby listens to the hellos; if the active stops responding, the standby takes over the virtual IP and MAC and traffic continues without a single host changing configuration.'
        },
        commonMistakes: [
          {
            it: 'Dimenticare il comando preempt in HSRP: il router a priorità maggiore non riprende il ruolo attivo quando torna disponibile.',
            en: 'Forgetting the preempt command in HSRP: the higher-priority router does not reclaim the active role when it becomes available again.'
          },
          {
            it: 'Credere che un FHRP bilanci il carico: HSRP e VRRP tengono un solo router attivo; è GLBP a distribuire il traffico nel gruppo.',
            en: 'Believing an FHRP load-balances: HSRP and VRRP keep a single active router; it is GLBP that shares traffic within the group.'
          },
          {
            it: 'Pensare che l’FHRP protegga l’intero percorso: copre solo il primo hop, non i guasti a valle del gateway.',
            en: 'Thinking an FHRP protects the whole path: it covers only the first hop, not failures downstream of the gateway.'
          }
        ],
        lab: 'routing',
        references: [{ kind: 'rfc', id: 'RFC 5798' }],
        guidedLabs: [
          {
            id: 'gl-fhrp-failover',
            title: { it: 'Chi subentra, e quando', en: 'Who takes over, and when' },
            difficulty: 'core',
            lab: 'routing',
            scenario: {
              it: 'Il laboratorio «Connettività IP» include una tabella di confronto FHRP con priorità, preempt e indirizzi virtuali di HSRP e VRRP.',
              en: 'The “IP connectivity” lab includes an FHRP comparison table with priority, preemption, and virtual addresses of HSRP and VRRP.'
            },
            task: {
              it: 'Dati due router con priorità diverse, stabilisci chi è attivo, chi subentra a un guasto e cosa cambia con o senza preempt.',
              en: 'Given two routers with different priorities, determine who is active, who takes over on a failure, and what changes with or without preemption.'
            },
            steps: [
              {
                it: 'Apri «Connettività IP» e leggi la tabella di confronto FHRP.',
                en: 'Open “IP connectivity” and read the FHRP comparison table.'
              },
              {
                it: 'Individua il router attivo in base alla priorità più alta (poi l’IP più alto).',
                en: 'Identify the active router by the highest priority (then the highest IP).'
              },
              {
                it: 'Valuta cosa accade quando il router a priorità maggiore torna online, con e senza preempt.',
                en: 'Assess what happens when the higher-priority router comes back online, with and without preemption.'
              }
            ],
            challenge: {
              it: 'Vuoi che entrambi i router inoltrino traffico contemporaneamente invece di tenerne uno in standby: quale FHRP scegli e perché?',
              en: 'You want both routers to forward traffic at once instead of keeping one on standby: which FHRP do you choose and why?'
            },
            solution: [
              {
                it: 'È attivo il router con priorità più alta (default 100), a parità l’IP più alto; se cade, lo standby assume IP e MAC virtuali. Con HSRP il router a priorità maggiore riprende il ruolo solo se è configurato preempt; con VRRP il preempt è attivo per default, quindi riprende da solo.',
                en: 'The active router is the one with the highest priority (default 100), ties broken by the highest IP; if it fails, the standby takes over the virtual IP and MAC. With HSRP the higher-priority router reclaims the role only if preempt is configured; with VRRP preemption is on by default, so it reclaims on its own.'
              },
              {
                it: 'Sfida: per far inoltrare entrambi i router si usa GLBP, che distribuisce il carico tra i gateway dello stesso gruppo rispondendo con MAC virtuali diversi ai diversi host; HSRP e VRRP, invece, tengono un solo router attivo per gruppo.',
                en: 'Challenge: to have both routers forward you use GLBP, which shares load across the gateways in the same group by answering different hosts with different virtual MACs; HSRP and VRRP, instead, keep a single active router per group.'
              }
            ],
            selfCheck: [
              {
                it: 'So dire chi è attivo, chi subentra e cosa cambia con o senza preempt.',
                en: 'I can say who is active, who takes over, and what changes with or without preemption.'
              },
              {
                it: 'So scegliere l’FHRP adatto quando serve bilanciare il carico tra gateway.',
                en: 'I can choose the right FHRP when load must be shared across gateways.'
              }
            ]
          }
        ]
      },
      {
        id: 'management-ntp-snmp-syslog',
        title: {
          it: 'Tempo e telemetria: NTP, SNMP e Syslog',
          en: 'Time and telemetry: NTP, SNMP, and Syslog'
        },
        objectives: [
          {
            it: 'Spiegare perché il tempo sincronizzato con NTP è il presupposto di log e certificati affidabili.',
            en: 'Explain why time synchronised with NTP is the prerequisite for reliable logs and certificates.'
          },
          {
            it: 'Descrivere il modello SNMP (manager, agent, MIB) e la scala di severità di Syslog.',
            en: 'Describe the SNMP model (manager, agent, MIB) and the Syslog severity scale.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere i servizi IP di base e il ruolo di client e server (capitolo sui servizi IP).',
            en: 'Know the basic IP services and the client/server roles (the IP services chapter).'
          }
        ],
        theory: [
          {
            it: 'NTP (Network Time Protocol, UDP/123) sincronizza l’orologio degli apparati verso una sorgente di riferimento, organizzata in strati (stratum): lo stratum 0 è l’orologio fisico, lo stratum 1 il server a esso direttamente collegato, e ogni livello successivo si allontana di uno. Il tempo corretto non è un dettaglio: senza di esso i timestamp dei log non si possono correlare tra apparati, la validità dei certificati non si può verificare e un’indagine perde la linea temporale. NTP va autenticato, perché un tempo falsificato può invalidare log e certificati.',
            en: 'NTP (Network Time Protocol, UDP/123) synchronises device clocks toward a reference source, organised in strata: stratum 0 is the physical clock, stratum 1 the server directly attached to it, and each further level is one step away. Correct time is not a detail: without it, log timestamps cannot be correlated across devices, certificate validity cannot be checked, and an investigation loses its timeline. NTP must be authenticated, because a forged time can invalidate logs and certificates.'
          },
          {
            it: 'SNMP (Simple Network Management Protocol) segue il modello manager–agent–MIB: il manager interroga l’agent sull’apparato, che espone i valori organizzati nella MIB (Management Information Base), e può ricevere trap non sollecitate quando accade un evento. Le versioni 1 e 2c usano community string in chiaro e vanno evitate; SNMPv3 in modalità authPriv aggiunge autenticazione, integrità e cifratura, con viste minime e ACL che limitano chi può leggere e scrivere.',
            en: 'SNMP (Simple Network Management Protocol) follows the manager–agent–MIB model: the manager queries the agent on the device, which exposes values organised in the MIB (Management Information Base), and can receive unsolicited traps when an event occurs. Versions 1 and 2c use cleartext community strings and should be avoided; SNMPv3 in authPriv mode adds authentication, integrity, and encryption, with minimal views and ACLs that limit who may read and write.'
          },
          {
            it: 'Syslog raccoglie i messaggi di evento degli apparati su una scala di severità da 0 a 7, dove 0 (emergency) è il più grave e 7 (debug) il più dettagliato; impostare una soglia include quel livello e tutti i numericamente inferiori. I log vanno inviati a un collector remoto centralizzato, con timestamp NTP, accesso ristretto e storage immutabile: un log che resta solo sull’apparato sparisce con l’apparato, e un attaccante che compromette il dispositivo può alterarlo.',
            en: 'Syslog collects device event messages on a severity scale from 0 to 7, where 0 (emergency) is the most severe and 7 (debug) the most detailed; setting a threshold includes that level and all numerically lower ones. Logs must be sent to a centralised remote collector, with NTP timestamps, restricted access, and immutable storage: a log that stays only on the device disappears with the device, and an attacker who compromises it can alter it.'
          }
        ],
        example: {
          it: 'Quando due switch registrano lo stesso evento, solo un orologio sincronizzato con NTP permette di metterne in fila i log sul collector Syslog; con orologi sfasati, la sequenza degli eventi diventa inservibile per un’indagine.',
          en: 'When two switches record the same event, only an NTP-synchronised clock lets their logs be lined up on the Syslog collector; with skewed clocks, the sequence of events becomes useless for an investigation.'
        },
        commonMistakes: [
          {
            it: 'Trattare il tempo come secondario: senza NTP i log non si correlano e la validità dei certificati non si verifica.',
            en: 'Treating time as secondary: without NTP, logs do not correlate and certificate validity cannot be checked.'
          },
          {
            it: 'Usare SNMPv1/v2c in produzione: le community string viaggiano in chiaro; serve SNMPv3 authPriv.',
            en: 'Using SNMPv1/v2c in production: community strings travel in cleartext; SNMPv3 authPriv is needed.'
          },
          {
            it: 'Leggere la severità Syslog al contrario: 0 è il più grave e 7 il più dettagliato, e la soglia include i livelli inferiori.',
            en: 'Reading Syslog severity backwards: 0 is the most severe and 7 the most detailed, and the threshold includes the lower levels.'
          }
        ],
        lab: 'services',
        references: [{ kind: 'rfc', id: 'RFC 5905' }],
        guidedLabs: [
          {
            id: 'gl-syslog-severity',
            title: { it: 'Scegliere la soglia di Syslog', en: 'Choosing the Syslog threshold' },
            difficulty: 'core',
            lab: 'services',
            scenario: {
              it: 'Il laboratorio «Servizi IP» mostra la scala di severità di Syslog da 0 a 7 e la relazione con la soglia impostata.',
              en: 'The “IP services” lab shows the Syslog severity scale from 0 to 7 and its relationship with the configured threshold.'
            },
            task: {
              it: 'Data una soglia, indica quali livelli vengono registrati e perché, poi verifica con il laboratorio.',
              en: 'Given a threshold, state which levels are logged and why, then check with the lab.'
            },
            steps: [
              {
                it: 'Apri «Servizi IP» e individua la scala di severità Syslog (0–7).',
                en: 'Open “IP services” and find the Syslog severity scale (0–7).'
              },
              {
                it: 'Ricorda che 0 è il più grave e 7 il più dettagliato.',
                en: 'Remember that 0 is the most severe and 7 the most detailed.'
              },
              {
                it: 'Applica la soglia: include il livello scelto e tutti i numericamente inferiori.',
                en: 'Apply the threshold: it includes the chosen level and all numerically lower ones.'
              }
            ],
            challenge: {
              it: 'I log devono reggere in un’indagine: oltre alla soglia, quali tre proprietà del trasporto e dello storage li rendono attendibili?',
              en: 'The logs must hold up in an investigation: beyond the threshold, which three properties of transport and storage make them trustworthy?'
            },
            solution: [
              {
                it: 'Una soglia a livello N registra N e tutti i livelli numericamente inferiori: impostare 4 (warning) cattura 0–4 e scarta il rumore di 5–7. La scala è invertita rispetto all’intuito, perché 0 (emergency) è il più grave.',
                en: 'A threshold at level N logs N and all numerically lower levels: setting 4 (warning) captures 0–4 and drops the 5–7 noise. The scale is inverted from intuition, because 0 (emergency) is the most severe.'
              },
              {
                it: 'Sfida: i log reggono se sono su un collector remoto centralizzato (non spariscono con l’apparato), con timestamp NTP (si correlano tra dispositivi) e su storage immutabile ad accesso ristretto (un attaccante non li altera).',
                en: 'Challenge: logs hold up if they are on a centralised remote collector (they do not vanish with the device), with NTP timestamps (they correlate across devices), and on immutable, access-restricted storage (an attacker cannot alter them).'
              }
            ],
            selfCheck: [
              {
                it: 'So dire, data una soglia, quali livelli di Syslog vengono registrati.',
                en: 'I can say, given a threshold, which Syslog levels are logged.'
              },
              {
                it: 'So elencare le proprietà che rendono i log attendibili per un’indagine.',
                en: 'I can list the properties that make logs trustworthy for an investigation.'
              }
            ]
          }
        ]
      },
      {
        id: 'qos-secure-access',
        title: {
          it: 'QoS e accesso sicuro agli apparati',
          en: 'QoS and secure device access'
        },
        objectives: [
          {
            it: 'Spiegare come la QoS classifica, marca e tratta il traffico per-hop e dove sta la trust boundary.',
            en: 'Explain how QoS classifies, marks, and treats traffic per hop, and where the trust boundary sits.'
          },
          {
            it: 'Scegliere metodi di accesso e trasferimento sicuri (SSH, SCP/SFTP) rispetto a quelli in chiaro.',
            en: 'Choose secure access and transfer methods (SSH, SCP/SFTP) over cleartext ones.'
          }
        ],
        prerequisites: [
          {
            it: 'Sapere che i router prendono decisioni per pacchetto e che la banda è una risorsa contesa (capitoli su routing e WAN).',
            en: 'Know that routers make per-packet decisions and that bandwidth is a contended resource (the routing and WAN topics).'
          }
        ],
        theory: [
          {
            it: 'La QoS (Quality of Service) non crea banda: decide quale traffico riceve un trattamento preferenziale quando le risorse sono contese. Il traffico viene prima classificato e marcato — con CoS a livello 2 o DSCP a livello 3 — poi ogni router applica un comportamento per-hop (Per-Hop Behavior) coerente con quella marcatura: accodamento prioritario per voce e video sensibili al ritardo, scarto selettivo per il traffico meno importante. La trust boundary stabilisce dove una marcatura in arrivo può essere accettata: oltre quel confine le marcature di una sorgente non fidata vanno riscritte, altrimenti chiunque può auto-assegnarsi priorità.',
            en: 'QoS (Quality of Service) does not create bandwidth: it decides which traffic receives preferential treatment when resources are contended. Traffic is first classified and marked — with CoS at Layer 2 or DSCP at Layer 3 — then each router applies a Per-Hop Behavior consistent with that marking: priority queuing for delay-sensitive voice and video, selective dropping for less important traffic. The trust boundary determines where an incoming marking may be accepted: beyond that boundary the markings of an untrusted source must be rewritten, otherwise anyone can grant themselves priority.'
          },
          {
            it: 'La gestione degli apparati va fatta con protocolli cifrati. SSH (SSHv2, TCP/22) fornisce cifratura, integrità e autenticazione per la CLI e sostituisce Telnet, che trasmette tutto in chiaro; la sua sicurezza dipende anche da AAA, chiavi, un management plane isolato e autorizzazioni minime. Per i trasferimenti di file, TFTP (UDP/69) non autentica e non cifra, e FTP (TCP/21) trasmette credenziali e contenuti in chiaro: per un trasferimento protetto si usano SCP, SFTP o HTTPS.',
            en: 'Device management must use encrypted protocols. SSH (SSHv2, TCP/22) provides encryption, integrity, and authentication for the CLI and replaces Telnet, which sends everything in cleartext; its security also depends on AAA, keys, an isolated management plane, and least privilege. For file transfers, TFTP (UDP/69) neither authenticates nor encrypts, and FTP (TCP/21) sends credentials and content in cleartext: for a protected transfer use SCP, SFTP, or HTTPS.'
          },
          {
            it: 'Gestione e QoS si incontrano sul management plane: il traffico di gestione va isolato (idealmente in un VRF o una VLAN dedicata), limitato alle sorgenti autorizzate con una ACL e protetto con CoPP (Control Plane Policing) perché un apparato sommerso di richieste non smetta di essere gestibile. La marcatura QoS del traffico di gestione garantisce che un comando di emergenza passi anche quando la rete è congestionata.',
            en: 'Management and QoS meet on the management plane: management traffic must be isolated (ideally in a dedicated VRF or VLAN), restricted to authorised sources with an ACL, and protected with CoPP (Control Plane Policing) so that a device flooded with requests does not stop being manageable. QoS marking of management traffic ensures an emergency command gets through even when the network is congested.'
          }
        ],
        example: {
          it: 'Un telefono IP marca la voce con DSCP EF: dentro la trust boundary i router la mettono in coda prioritaria e la voce resta pulita anche su un link saturo; un PC che provasse a marcare il proprio traffico come EF oltre il confine vedrebbe la marcatura riscritta.',
          en: 'An IP phone marks voice with DSCP EF: inside the trust boundary routers place it in a priority queue and the voice stays clean even on a saturated link; a PC trying to mark its own traffic as EF beyond the boundary would see the marking rewritten.'
        },
        commonMistakes: [
          {
            it: 'Credere che la QoS aumenti la banda: riordina solo le priorità quando la banda è contesa, non ne aggiunge.',
            en: 'Believing QoS increases bandwidth: it only reorders priorities when bandwidth is contended, it does not add any.'
          },
          {
            it: 'Fidarsi delle marcature oltre la trust boundary: una sorgente non fidata può auto-assegnarsi priorità se la marcatura non viene riscritta.',
            en: 'Trusting markings beyond the trust boundary: an untrusted source can grant itself priority if the marking is not rewritten.'
          },
          {
            it: 'Gestire gli apparati con Telnet, FTP o TFTP: trasmettono in chiaro; servono SSH e SCP/SFTP.',
            en: 'Managing devices with Telnet, FTP, or TFTP: they transmit in cleartext; SSH and SCP/SFTP are needed.'
          }
        ],
        lab: 'services',
        references: [{ kind: 'rfc', id: 'RFC 2474' }],
        guidedLabs: [
          {
            id: 'gl-qos-trust-boundary',
            title: { it: 'Dove ci si fida di una marcatura', en: 'Where a marking is trusted' },
            difficulty: 'core',
            lab: 'services',
            scenario: {
              it: 'Il laboratorio «Servizi IP» descrive i meccanismi di QoS, dalla classificazione e marcatura alla trust boundary.',
              en: 'The “IP services” lab describes the QoS mechanisms, from classification and marking to the trust boundary.'
            },
            task: {
              it: 'Individua dove una marcatura in arrivo può essere accettata e dove va riscritta, e perché.',
              en: 'Identify where an incoming marking may be accepted and where it must be rewritten, and why.'
            },
            steps: [
              {
                it: 'Apri «Servizi IP» e leggi i meccanismi di QoS (classificazione, marcatura, trust boundary).',
                en: 'Open “IP services” and read the QoS mechanisms (classification, marking, trust boundary).'
              },
              {
                it: 'Individua la trust boundary: il punto fino a cui ci si fida delle marcature.',
                en: 'Identify the trust boundary: the point up to which markings are trusted.'
              },
              {
                it: 'Stabilisci cosa fare delle marcature provenienti da una porta di accesso non gestita.',
                en: 'Decide what to do with markings coming from an unmanaged access port.'
              }
            ],
            challenge: {
              it: 'Un telefono IP e il PC collegato dietro di esso marcano traffico in modo diverso: come si fida la rete del telefono ma non del PC?',
              en: 'An IP phone and the PC connected behind it mark traffic differently: how does the network trust the phone but not the PC?'
            },
            solution: [
              {
                it: 'Dentro la trust boundary le marcature sono accettate perché provengono da dispositivi gestiti; oltre il confine — tipicamente la porta di accesso verso un host non fidato — vanno riscritte, altrimenti un host può auto-assegnarsi una priorità alta e rubare la coda prioritaria.',
                en: 'Inside the trust boundary markings are accepted because they come from managed devices; beyond the boundary — typically the access port toward an untrusted host — they must be rewritten, otherwise a host can grant itself high priority and steal the priority queue.'
              },
              {
                it: 'Sfida: lo switch estende condizionatamente la trust boundary al telefono IP (riconosciuto e gestito) ma non al PC dietro di esso, riscrivendo la marcatura del traffico che arriva dalla porta dati del telefono; così la voce resta prioritaria e il PC non può fingersi voce.',
                en: 'Challenge: the switch conditionally extends the trust boundary to the IP phone (recognised and managed) but not to the PC behind it, rewriting the marking of traffic arriving from the phone’s data port; this keeps voice prioritised and stops the PC from posing as voice.'
              }
            ],
            selfCheck: [
              {
                it: 'So spiegare perché la QoS non crea banda e cosa fa la trust boundary.',
                en: 'I can explain why QoS does not create bandwidth and what the trust boundary does.'
              },
              {
                it: 'So scegliere protocolli cifrati per gestire e trasferire file sugli apparati.',
                en: 'I can choose encrypted protocols to manage devices and transfer files.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'ccna-security-config',
    cert: 'ccna',
    order: 14,
    track: 'ccna',
    domain: 'security-fundamentals',
    title: {
      it: 'Sicurezza CCNA: AAA, VPN e hardening di livello 2',
      en: 'CCNA security: AAA, VPN, and Layer 2 hardening'
    },
    summary: {
      it: 'Le configurazioni di sicurezza del dominio 5.0: controllare chi accede agli apparati con AAA, proteggere il traffico tra sedi e utenti remoti con le VPN, e difendere l’access layer con port security, DHCP snooping e DAI oltre al wireless WPA2/WPA3.',
      en: 'The security configurations of domain 5.0: controlling who accesses devices with AAA, protecting traffic between sites and remote users with VPNs, and defending the access layer with port security, DHCP snooping, and DAI alongside WPA2/WPA3 wireless.'
    },
    topics: [
      {
        id: 'aaa-access-control',
        title: {
          it: 'AAA e controllo dell’accesso',
          en: 'AAA and access control'
        },
        objectives: [
          {
            it: 'Spiegare le tre A di AAA e la differenza tra autenticazione locale e server centralizzato.',
            en: 'Explain the three A’s of AAA and the difference between local authentication and a centralised server.'
          },
          {
            it: 'Distinguere TACACS+ e RADIUS per ambito, porte e ciò che cifrano.',
            en: 'Distinguish TACACS+ and RADIUS by scope, ports, and what they encrypt.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere l’accesso di gestione cifrato con SSH (capitolo sui servizi IP estesi).',
            en: 'Know encrypted management access with SSH (the extended IP services chapter).'
          }
        ],
        theory: [
          {
            it: 'AAA sta per Authentication, Authorization, Accounting: autenticazione verifica chi sei, autorizzazione decide cosa puoi fare, accounting registra cosa hai fatto. Senza AAA ogni apparato tiene password locali scollegate le une dalle altre; con AAA l’identità è centralizzata su un server, così un account revocato sparisce ovunque in un colpo solo. Si configura sempre un fallback locale, perché se il server diventa irraggiungibile l’amministratore deve comunque poter entrare: un AAA senza via di riserva è un modo per chiudersi fuori.',
            en: 'AAA stands for Authentication, Authorization, Accounting: authentication verifies who you are, authorization decides what you may do, accounting records what you did. Without AAA each device keeps local passwords disconnected from one another; with AAA identity is centralised on a server, so a revoked account disappears everywhere at once. A local fallback is always configured, because if the server becomes unreachable the administrator must still be able to get in: AAA without a backup path is a way to lock yourself out.'
          },
          {
            it: 'I due protocolli AAA hanno vocazioni diverse. TACACS+ (proprietario Cisco, TCP porta 49) è pensato per l’amministrazione dei dispositivi: separa nettamente le tre A, permette autorizzazioni per comando e cifra l’intero payload. RADIUS (standard, UDP 1812/1813) è pensato per l’accesso alla rete — VPN e 802.1X — unisce autenticazione e autorizzazione e, tradizionalmente, cifra solo la password e non tutto il pacchetto. La scelta segue l’uso: TACACS+ per chi amministra lo switch, RADIUS per chi si collega alla rete.',
            en: 'The two AAA protocols have different callings. TACACS+ (Cisco proprietary, TCP port 49) is made for device administration: it cleanly separates the three A’s, allows per-command authorization, and encrypts the entire payload. RADIUS (standard, UDP 1812/1813) is made for network access — VPN and 802.1X — it merges authentication and authorization and, traditionally, encrypts only the password and not the whole packet. The choice follows the use: TACACS+ for whoever administers the switch, RADIUS for whoever connects to the network.'
          },
          {
            it: 'L’autenticazione vale quanto le credenziali che protegge: servono passphrase lunghe e uniche, MFA dove possibile e il controllo delle credenziali compromesse, evitando rotazioni arbitrarie che spingono verso pattern deboli. Sull’apparato, enable secret conserva la password con un hash robusto, i privilege level o il modello per comando limitano cosa ciascun ruolo può eseguire, e l’accounting trasforma ogni comando in una traccia verificabile.',
            en: 'Authentication is only as good as the credentials it protects: you need long, unique passphrases, MFA where possible, and breached-credential checks, avoiding arbitrary rotation that pushes toward weak patterns. On the device, enable secret stores the password with a strong hash, privilege levels or a per-command model limit what each role may run, and accounting turns every command into a verifiable trail.'
          }
        ],
        example: {
          it: 'Uno switch gestito via TACACS+ autentica l’amministratore sul server centrale e ne registra ogni comando; se il server cade, il metodo locale di riserva permette comunque l’accesso, così una modifica urgente non resta bloccata.',
          en: 'A switch managed via TACACS+ authenticates the administrator on the central server and logs every command; if the server goes down, the local fallback method still allows access, so an urgent change is not blocked.'
        },
        commonMistakes: [
          {
            it: 'Configurare AAA senza fallback locale: se il server diventa irraggiungibile ci si chiude fuori dall’apparato.',
            en: 'Configuring AAA without a local fallback: if the server becomes unreachable you lock yourself out of the device.'
          },
          {
            it: 'Usare RADIUS per l’autorizzazione per comando: è TACACS+ a separarla e a offrirla; RADIUS è pensato per l’accesso alla rete.',
            en: 'Using RADIUS for per-command authorization: it is TACACS+ that separates and offers it; RADIUS is made for network access.'
          },
          {
            it: 'Credere che RADIUS cifri tutto: tradizionalmente protegge solo la password, non l’intero pacchetto.',
            en: 'Believing RADIUS encrypts everything: it traditionally protects only the password, not the whole packet.'
          }
        ],
        lab: 'securitycore',
        references: [{ kind: 'rfc', id: 'RFC 8907' }],
        guidedLabs: [
          {
            id: 'gl-aaa-tacacs-radius',
            title: { it: 'TACACS+ o RADIUS?', en: 'TACACS+ or RADIUS?' },
            difficulty: 'core',
            lab: 'securitycore',
            scenario: {
              it: 'Il laboratorio «Sicurezza CCNA» include una tabella di confronto AAA tra TACACS+ e RADIUS per ambito, porte, separazione e cifratura.',
              en: 'The “CCNA security” lab includes an AAA comparison table between TACACS+ and RADIUS for scope, ports, separation, and encryption.'
            },
            task: {
              it: 'Per due casi d’uso — amministrare uno switch e autenticare l’accesso VPN — scegli il protocollo AAA giusto e motiva.',
              en: 'For two use cases — administering a switch and authenticating VPN access — choose the right AAA protocol and justify it.'
            },
            steps: [
              {
                it: 'Apri «Sicurezza CCNA» e leggi la tabella di confronto AAA.',
                en: 'Open “CCNA security” and read the AAA comparison table.'
              },
              {
                it: 'Associa l’amministrazione dei dispositivi a TACACS+ (autorizzazione per comando, payload cifrato).',
                en: 'Map device administration to TACACS+ (per-command authorization, encrypted payload).'
              },
              {
                it: 'Associa l’accesso alla rete, VPN e 802.1X a RADIUS.',
                en: 'Map network access, VPN, and 802.1X to RADIUS.'
              }
            ],
            challenge: {
              it: 'Il server AAA diventa irraggiungibile durante un intervento: cosa evita che l’amministratore resti chiuso fuori, e come va configurato?',
              en: 'The AAA server becomes unreachable during maintenance: what prevents the administrator from being locked out, and how is it configured?'
            },
            solution: [
              {
                it: 'Per amministrare lo switch si sceglie TACACS+, perché separa le tre A, autorizza per comando e cifra l’intero payload; per l’accesso VPN si sceglie RADIUS, il protocollo pensato per l’accesso alla rete e per 802.1X.',
                en: 'To administer the switch you choose TACACS+, because it separates the three A’s, authorizes per command, and encrypts the entire payload; for VPN access you choose RADIUS, the protocol designed for network access and 802.1X.'
              },
              {
                it: 'Sfida: un metodo locale di riserva nella lista di autenticazione (il server prima, poi il locale) evita il lock-out: se il server AAA non risponde, l’apparato ricade sulle credenziali locali, così l’accesso di emergenza resta possibile.',
                en: 'Challenge: a local fallback method in the authentication list (server first, then local) avoids the lock-out: if the AAA server does not answer, the device falls back to local credentials, so emergency access stays possible.'
              }
            ],
            selfCheck: [
              {
                it: 'So scegliere tra TACACS+ e RADIUS in base all’uso e motivarlo.',
                en: 'I can choose between TACACS+ and RADIUS based on the use and justify it.'
              },
              {
                it: 'So spiegare perché serve un fallback locale all’autenticazione AAA.',
                en: 'I can explain why a local fallback to AAA authentication is needed.'
              }
            ]
          }
        ]
      },
      {
        id: 'vpn-site-remote',
        title: {
          it: 'VPN: da sede a sede e accesso remoto',
          en: 'VPN: site-to-site and remote access'
        },
        objectives: [
          {
            it: 'Distinguere una VPN site-to-site da una remote-access e dire cosa protegge ciascuna.',
            en: 'Distinguish a site-to-site VPN from a remote-access one and say what each protects.'
          },
          {
            it: 'Descrivere a grandi linee come IPsec, con IKE, stabilisce un tunnel cifrato.',
            en: 'Describe in broad terms how IPsec, with IKE, establishes an encrypted tunnel.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere riservatezza, integrità e autenticità (capitolo sui fondamenti di sicurezza).',
            en: 'Know confidentiality, integrity, and authenticity (the security fundamentals chapter).'
          }
        ],
        theory: [
          {
            it: 'Una VPN crea un tunnel cifrato su una rete non fidata, tipicamente Internet. La VPN site-to-site collega due reti intere — due sedi — attraverso i rispettivi gateway: gli host non se ne accorgono, perché sono i router a cifrare e decifrare. La VPN remote-access collega invece un singolo utente alla rete aziendale, con IPsec o TLS: qui contano MFA, postura dell’endpoint, autorizzazioni minime e una policy di split-tunneling valutata, perché il dispositivo che si collega è fuori dal perimetro gestito.',
            en: 'A VPN creates an encrypted tunnel over an untrusted network, typically the Internet. The site-to-site VPN connects two whole networks — two sites — through their respective gateways: hosts do not notice, because it is the routers that encrypt and decrypt. The remote-access VPN instead connects a single user to the enterprise, with IPsec or TLS: here MFA, endpoint posture, least privilege, and an evaluated split-tunneling policy matter, because the connecting device is outside the managed perimeter.'
          },
          {
            it: 'IPsec è la suite che fornisce riservatezza, integrità e autenticità al traffico del tunnel. La negoziazione avviene con IKE (Internet Key Exchange): in IKEv2 la fase IKE_SA_INIT concorda gli algoritmi e scambia le chiavi con Diffie–Hellman, IKE_AUTH autentica i due peer, e i CHILD_SA proteggono poi il traffico dati. Il risultato è che, anche attraversando Internet, i pacchetti non sono leggibili né alterabili da chi sta in mezzo, e ciascun capo è certo dell’identità dell’altro.',
            en: 'IPsec is the suite that gives the tunnel traffic confidentiality, integrity, and authenticity. Negotiation happens with IKE (Internet Key Exchange): in IKEv2 the IKE_SA_INIT phase agrees on algorithms and exchanges keys with Diffie–Hellman, IKE_AUTH authenticates the two peers, and the CHILD_SAs then protect the data traffic. The result is that, even across the Internet, packets are neither readable nor alterable by anyone in the middle, and each end is certain of the other’s identity.'
          },
          {
            it: 'Non ogni tunnel cifra. GRE (Generic Routing Encapsulation) incapsula protocolli e traffico multicast — utile per far passare un protocollo di routing — ma non cifra e non autentica: da solo è un tunnel in chiaro. Per questo si usa GRE over IPsec, dove GRE fornisce l’incapsulamento flessibile e IPsec aggiunge la protezione. Confondere incapsulamento e cifratura è l’errore da evitare: un tunnel che passa non è necessariamente un tunnel sicuro.',
            en: 'Not every tunnel encrypts. GRE (Generic Routing Encapsulation) encapsulates protocols and multicast traffic — useful to carry a routing protocol — but does not encrypt or authenticate: on its own it is a cleartext tunnel. That is why GRE over IPsec is used, where GRE provides the flexible encapsulation and IPsec adds the protection. Confusing encapsulation and encryption is the mistake to avoid: a tunnel that passes is not necessarily a secure tunnel.'
          }
        ],
        example: {
          it: 'Due filiali si collegano con una VPN site-to-site IPsec: i router cifrano il traffico tra le due reti e gli host comunicano come se fossero nella stessa LAN, mentre un lavoratore da casa entra con una remote-access VPN protetta da MFA.',
          en: 'Two branches connect with a site-to-site IPsec VPN: the routers encrypt the traffic between the two networks and hosts communicate as if on the same LAN, while a home worker connects with a remote-access VPN protected by MFA.'
        },
        commonMistakes: [
          {
            it: 'Credere che GRE cifri: incapsula soltanto; serve GRE over IPsec per avere riservatezza e autenticità.',
            en: 'Believing GRE encrypts: it only encapsulates; GRE over IPsec is needed for confidentiality and authenticity.'
          },
          {
            it: 'Trattare una remote-access VPN come fidata di per sé: l’endpoint è fuori dal perimetro e servono MFA, postura e minimo privilegio.',
            en: 'Treating a remote-access VPN as trusted in itself: the endpoint is outside the perimeter and needs MFA, posture, and least privilege.'
          },
          {
            it: 'Pensare che il tunnel protegga oltre i suoi estremi: la cifratura vale tra i peer, non dentro le reti che collega.',
            en: 'Thinking the tunnel protects beyond its endpoints: encryption applies between the peers, not inside the networks it connects.'
          }
        ],
        lab: 'securitycore',
        references: [{ kind: 'rfc', id: 'RFC 7296' }],
        guidedLabs: [
          {
            id: 'gl-vpn-ipsec-phases',
            title: { it: 'Cosa fa ogni fase di IKE', en: 'What each IKE phase does' },
            difficulty: 'core',
            lab: 'securitycore',
            scenario: {
              it: 'Il laboratorio «Sicurezza CCNA» descrive i tipi di VPN e le fasi di IKEv2 che stabiliscono un tunnel IPsec.',
              en: 'The “CCNA security” lab describes the VPN types and the IKEv2 phases that establish an IPsec tunnel.'
            },
            task: {
              it: 'Metti in ordine le fasi di IKEv2 e indica, per ciascuna, cosa negozia o protegge.',
              en: 'Put the IKEv2 phases in order and state, for each, what it negotiates or protects.'
            },
            steps: [
              {
                it: 'Apri «Sicurezza CCNA» e leggi la sezione sulle VPN e su IKEv2.',
                en: 'Open “CCNA security” and read the VPN and IKEv2 section.'
              },
              {
                it: 'Colloca IKE_SA_INIT (algoritmi e Diffie–Hellman) prima di IKE_AUTH (autenticazione dei peer).',
                en: 'Place IKE_SA_INIT (algorithms and Diffie–Hellman) before IKE_AUTH (peer authentication).'
              },
              {
                it: 'Attribuisci ai CHILD_SA la protezione effettiva del traffico dati.',
                en: 'Attribute to the CHILD_SAs the actual protection of the data traffic.'
              }
            ],
            challenge: {
              it: 'Serve far passare un protocollo di routing tra due sedi e proteggerlo: quale combinazione di tunnel scegli e perché non basta il solo GRE?',
              en: 'You need to carry a routing protocol between two sites and protect it: which tunnel combination do you choose and why is GRE alone not enough?'
            },
            solution: [
              {
                it: 'L’ordine è IKE_SA_INIT (concorda algoritmi e scambia le chiavi con Diffie–Hellman), poi IKE_AUTH (autentica i peer), infine i CHILD_SA (proteggono il traffico dati). Ogni fase prepara la successiva: senza chiavi condivise non si può autenticare, senza autenticazione non si protegge il traffico.',
                en: 'The order is IKE_SA_INIT (agrees on algorithms and exchanges keys with Diffie–Hellman), then IKE_AUTH (authenticates the peers), finally the CHILD_SAs (protect the data traffic). Each phase prepares the next: without shared keys you cannot authenticate, without authentication you do not protect the traffic.'
              },
              {
                it: 'Sfida: per trasportare un protocollo di routing serve GRE (incapsula multicast e protocolli), ma GRE da solo è in chiaro; si usa quindi GRE over IPsec, dove IPsec aggiunge riservatezza, integrità e autenticità al tunnel GRE.',
                en: 'Challenge: to carry a routing protocol you need GRE (it encapsulates multicast and protocols), but GRE alone is cleartext; so you use GRE over IPsec, where IPsec adds confidentiality, integrity, and authenticity to the GRE tunnel.'
              }
            ],
            selfCheck: [
              {
                it: 'So ordinare le fasi di IKEv2 e dire cosa fa ciascuna.',
                en: 'I can order the IKEv2 phases and say what each one does.'
              },
              {
                it: 'So spiegare perché GRE da solo non protegge e quando serve GRE over IPsec.',
                en: 'I can explain why GRE alone does not protect and when GRE over IPsec is needed.'
              }
            ]
          }
        ]
      },
      {
        id: 'layer2-wireless-hardening',
        title: {
          it: 'Hardening di livello 2 e wireless',
          en: 'Layer 2 and wireless hardening'
        },
        objectives: [
          {
            it: 'Descrivere port security, DHCP snooping e DAI e come si rafforzano a vicenda.',
            en: 'Describe port security, DHCP snooping, and DAI and how they reinforce one another.'
          },
          {
            it: 'Scegliere la sicurezza wireless adatta tra WPA2 e WPA3, PSK ed Enterprise.',
            en: 'Choose the right wireless security between WPA2 and WPA3, PSK and Enterprise.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere VLAN, trunk e il funzionamento di DHCP e ARP (capitoli su VLAN e servizi IP).',
            en: 'Know VLANs, trunks, and how DHCP and ARP work (the VLAN and IP services chapters).'
          }
        ],
        theory: [
          {
            it: 'La difesa dell’access layer si costruisce a strati sulla porta. Port Security limita quali e quanti indirizzi MAC possono apparire su una porta e reagisce a una violazione in tre modi: protect scarta in silenzio, restrict scarta e registra, shutdown mette la porta in err-disabled. Il MAC sticky impara l’indirizzo legittimo e lo fissa. È la prima barriera contro un host non autorizzato o un MAC flooding che cerca di saturare la tabella CAM.',
            en: 'Access-layer defense is built in layers on the port. Port Security limits which and how many MAC addresses may appear on a port and reacts to a violation in three ways: protect drops silently, restrict drops and logs, shutdown puts the port into err-disabled. Sticky MAC learns the legitimate address and pins it. It is the first barrier against an unauthorized host or a MAC flooding that tries to saturate the CAM table.'
          },
          {
            it: 'DHCP Snooping distingue le porte fidate (verso i veri server DHCP) da quelle non fidate (verso gli host): sulle porte non fidate scarta i messaggi da server — Offer e Ack — così un DHCP rogue non può assegnare un gateway falso. Mentre lavora, costruisce una binding table che lega MAC, IP, VLAN e porta di ogni client legittimo. Questa tabella diventa la base di Dynamic ARP Inspection (DAI), che convalida ogni ARP contro di essa e ferma l’ARP spoofing, e di IP Source Guard, che filtra il traffico con IP sorgente non coerente. I tre controlli si rafforzano a vicenda: senza DHCP snooping, DAI non ha contro cosa verificare.',
            en: 'DHCP Snooping separates trusted ports (toward the real DHCP servers) from untrusted ones (toward hosts): on untrusted ports it drops server messages — Offer and Ack — so a rogue DHCP cannot hand out a fake gateway. As it works, it builds a binding table tying MAC, IP, VLAN, and port of every legitimate client. That table becomes the basis of Dynamic ARP Inspection (DAI), which validates every ARP against it and stops ARP spoofing, and of IP Source Guard, which filters traffic with an inconsistent source IP. The three controls reinforce one another: without DHCP snooping, DAI has nothing to check against.'
          },
          {
            it: 'Sul wireless la sicurezza del livello 2 sta nella coppia autenticazione e cifratura. WPA2 usa AES/CCMP; WPA3 aggiunge SAE, che sostituisce la vulnerabile handshake PSK e resiste agli attacchi a dizionario, e rende obbligatori i Protected Management Frames. La PSK è una chiave condivisa da tutti i client: comoda in casa, inadatta dove servono utenti nominali, perché non identifica nessuno e non si revoca singolarmente. Lì serve WPA2/WPA3-Enterprise con 802.1X, che autentica ogni utente e permette di revocarne uno solo.',
            en: 'On wireless, Layer 2 security lives in the authentication and encryption pair. WPA2 uses AES/CCMP; WPA3 adds SAE, which replaces the vulnerable PSK handshake and resists dictionary attacks, and makes Protected Management Frames mandatory. The PSK is a key shared by every client: convenient at home, unsuitable where named users are needed, because it identifies no one and cannot be revoked individually. There you need WPA2/WPA3-Enterprise with 802.1X, which authenticates each user and allows a single one to be revoked.'
          }
        ],
        example: {
          it: 'Su una porta di accesso, Port Security fissa il MAC del PC, DHCP Snooping scarta un server DHCP rogue collegato di nascosto, e DAI blocca l’ARP spoofing confrontando l’ARP con la binding table: tre controlli diversi, un unico access layer difeso.',
          en: 'On an access port, Port Security pins the PC’s MAC, DHCP Snooping drops a rogue DHCP server plugged in on the sly, and DAI blocks ARP spoofing by comparing ARP against the binding table: three different controls, one defended access layer.'
        },
        commonMistakes: [
          {
            it: 'Abilitare DAI senza DHCP snooping: manca la binding table contro cui convalidare gli ARP, e il controllo non ha basi.',
            en: 'Enabling DAI without DHCP snooping: the binding table to validate ARPs against is missing, and the control has no basis.'
          },
          {
            it: 'Lasciare le porte verso i server DHCP come non fidate: DHCP snooping scarterebbe gli Offer legittimi e romperebbe il servizio.',
            en: 'Leaving the ports toward DHCP servers as untrusted: DHCP snooping would drop legitimate Offers and break the service.'
          },
          {
            it: 'Usare la PSK dove servono utenti nominali: non identifica nessuno e non si revoca; serve l’Enterprise con 802.1X.',
            en: 'Using the PSK where named users are needed: it identifies no one and cannot be revoked; Enterprise with 802.1X is required.'
          }
        ],
        lab: 'securitycore',
        references: [{ kind: 'nist', id: 'SP 800-128' }],
        guidedLabs: [
          {
            id: 'gl-l2-defense-stack',
            title: { it: 'Comporre le difese di livello 2', en: 'Composing the Layer 2 defenses' },
            difficulty: 'core',
            lab: 'securitycore',
            scenario: {
              it: 'Il laboratorio «Sicurezza CCNA» elenca i controlli dell’access layer — Port Security, DHCP Snooping, DAI, IP Source Guard — e la loro dipendenza dalle trust boundary.',
              en: 'The “CCNA security” lab lists the access-layer controls — Port Security, DHCP Snooping, DAI, IP Source Guard — and their dependence on trust boundaries.'
            },
            task: {
              it: 'Ordina i controlli secondo le loro dipendenze e indica quale fornisce la binding table agli altri.',
              en: 'Order the controls by their dependencies and identify which one provides the binding table to the others.'
            },
            steps: [
              {
                it: 'Apri «Sicurezza CCNA» e individua i controlli dell’access layer.',
                en: 'Open “CCNA security” and find the access-layer controls.'
              },
              {
                it: 'Riconosci che DHCP Snooping costruisce la binding table (MAC, IP, VLAN, porta).',
                en: 'Recognise that DHCP Snooping builds the binding table (MAC, IP, VLAN, port).'
              },
              {
                it: 'Collega DAI e IP Source Guard a quella binding table come loro fonte di verità.',
                en: 'Connect DAI and IP Source Guard to that binding table as their source of truth.'
              }
            ],
            challenge: {
              it: 'Dopo aver abilitato DAI gli host legittimi perdono la rete: quale configurazione mancante o errata lo spiega, e come si corregge?',
              en: 'After enabling DAI, legitimate hosts lose the network: which missing or wrong configuration explains it, and how is it fixed?'
            },
            solution: [
              {
                it: 'L’ordine delle dipendenze parte da Port Security (limita i MAC sulla porta) e da DHCP Snooping, che separa porte fidate e non fidate e costruisce la binding table; su quella tabella si appoggiano DAI (convalida gli ARP) e IP Source Guard (filtra per IP sorgente). DHCP Snooping è la fonte della verità per gli altri due.',
                en: 'The dependency order starts from Port Security (limits MACs on the port) and DHCP Snooping, which separates trusted and untrusted ports and builds the binding table; on that table rest DAI (validates ARPs) and IP Source Guard (filters by source IP). DHCP Snooping is the source of truth for the other two.'
              },
              {
                it: 'Sfida: se DAI blocca gli host legittimi è perché la binding table non li contiene — DHCP snooping non è attivo, oppure le loro porte o la VLAN non sono incluse — o perché una porta verso un server/uplink fidato è rimasta non fidata; si corregge abilitando lo snooping sulla VLAN giusta e marcando come trusted le porte di infrastruttura.',
                en: 'Challenge: if DAI blocks legitimate hosts it is because the binding table does not contain them — DHCP snooping is not enabled, or their ports or VLAN are not included — or because a port toward a trusted server/uplink was left untrusted; it is fixed by enabling snooping on the right VLAN and marking the infrastructure ports as trusted.'
              }
            ],
            selfCheck: [
              {
                it: 'So ordinare Port Security, DHCP Snooping, DAI e IP Source Guard per dipendenza.',
                en: 'I can order Port Security, DHCP Snooping, DAI, and IP Source Guard by dependency.'
              },
              {
                it: 'So dire perché DAI senza DHCP snooping non ha basi su cui lavorare.',
                en: 'I can say why DAI without DHCP snooping has no basis to work on.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'automation-programmability',
    cert: 'ccna',
    order: 15,
    track: 'ccna',
    domain: 'automation-programmability',
    title: {
      it: 'Automazione e programmabilità',
      en: 'Automation and programmability'
    },
    summary: {
      it: 'Il dominio 6.0: perché l’automazione cambia il modo di gestire la rete, come una rete controller-based separa l’intento dal forwarding, e come si parla con gli apparati via REST API, dati JSON e strumenti come Ansible e Terraform.',
      en: 'Domain 6.0: why automation changes the way a network is managed, how a controller-based network separates intent from forwarding, and how devices are spoken to through REST APIs, JSON data, and tools like Ansible and Terraform.'
    },
    topics: [
      {
        id: 'automation-impact-sdn',
        title: {
          it: 'Impatto dell’automazione e reti controller-based',
          en: 'Automation impact and controller-based networks'
        },
        objectives: [
          {
            it: 'Spiegare come l’automazione cambia la gestione della rete rispetto alla configurazione per dispositivo.',
            en: 'Explain how automation changes network management compared with per-device configuration.'
          },
          {
            it: 'Descrivere una rete controller-based e il ruolo delle API northbound e southbound.',
            en: 'Describe a controller-based network and the role of northbound and southbound APIs.'
          }
        ],
        prerequisites: [
          {
            it: 'Sapere che control plane e data plane prendono decisioni diverse (capitoli su switching e routing).',
            en: 'Know that the control plane and data plane make different decisions (the switching and routing chapters).'
          }
        ],
        theory: [
          {
            it: 'Configurare la rete a mano, dispositivo per dispositivo, non scala: ogni apparato diventa un fiocco di neve con piccole differenze, le modifiche sono lente e gli errori si moltiplicano. L’automazione sostituisce il lavoro ripetitivo con descrizioni riproducibili: la stessa configurazione si applica a cento apparati in modo coerente, le modifiche si versionano come codice e si possono rivedere e annullare. Il guadagno non è solo velocità, è coerenza: la rete fa ciò che il codice descrive, non ciò che qualcuno ricorda di aver digitato.',
            en: 'Configuring the network by hand, device by device, does not scale: each device becomes a snowflake with small differences, changes are slow, and errors multiply. Automation replaces repetitive work with reproducible descriptions: the same configuration is applied to a hundred devices consistently, changes are versioned like code and can be reviewed and rolled back. The gain is not only speed, it is consistency: the network does what the code describes, not what someone remembers typing.'
          },
          {
            it: 'In una rete controller-based un controller centrale mantiene una vista logica dell’intera rete, traduce l’intento e le policy e programma i dispositivi; i forwarding device continuano a inoltrare nel data plane. È lo stesso principio della SDN (Software-Defined Networking), dove il control plane viene centralizzato e astratto dal piano di inoltro. Il vantaggio è una gestione d’insieme — una policy si esprime una volta e il controller la realizza ovunque — al prezzo di un nuovo punto singolo di fiducia da proteggere: il controller.',
            en: 'In a controller-based network a central controller maintains a logical view of the whole network, translates intent and policy, and programs the devices; forwarding devices keep forwarding in the data plane. It is the same principle as SDN (Software-Defined Networking), where the control plane is centralised and abstracted from the forwarding plane. The advantage is whole-network management — a policy is expressed once and the controller realises it everywhere — at the cost of a new single point of trust to protect: the controller.'
          },
          {
            it: 'Il controller parla in due direzioni. Le API northbound lo collegano verso l’alto, alle applicazioni e all’intento: è lì che un operatore o un programma esprimono cosa vogliono. Le API southbound lo collegano verso il basso, all’infrastruttura, tramite protocolli come NETCONF e RESTCONF che programmano gli apparati. Capire questa doppia direzione spiega il modello: l’intento scende dall’alto, la realizzazione raggiunge il basso, e il controller sta nel mezzo a tradurre.',
            en: 'The controller talks in two directions. Northbound APIs connect it upward, to applications and intent: that is where an operator or a program expresses what they want. Southbound APIs connect it downward, to the infrastructure, through protocols such as NETCONF and RESTCONF that program the devices. Understanding this double direction explains the model: intent comes down from above, realisation reaches below, and the controller sits in the middle translating.'
          }
        ],
        example: {
          it: 'Invece di collegarsi a cinquanta switch per aprire una VLAN, un operatore la chiede una volta al controller tramite l’API northbound; il controller la programma su tutti gli apparati via southbound, in modo coerente e tracciato.',
          en: 'Instead of connecting to fifty switches to open a VLAN, an operator requests it once from the controller through the northbound API; the controller programs it on every device via southbound, consistently and with an audit trail.'
        },
        commonMistakes: [
          {
            it: 'Pensare che il controller inoltri i pacchetti: programma i dispositivi, ma il forwarding resta nel data plane degli apparati.',
            en: 'Thinking the controller forwards packets: it programs the devices, but forwarding stays in the devices’ data plane.'
          },
          {
            it: 'Scambiare northbound e southbound: northbound guarda alle applicazioni e all’intento, southbound all’infrastruttura.',
            en: 'Swapping northbound and southbound: northbound faces applications and intent, southbound faces the infrastructure.'
          },
          {
            it: 'Sottovalutare il controller come bersaglio: centralizzando il controllo diventa un punto singolo di fiducia da proteggere.',
            en: 'Underestimating the controller as a target: by centralising control it becomes a single point of trust to protect.'
          }
        ],
        lab: 'automation',
        references: [{ kind: 'rfc', id: 'RFC 7426' }]
      },
      {
        id: 'rest-apis-json',
        title: {
          it: 'REST API e dati strutturati (JSON)',
          en: 'REST APIs and structured data (JSON)'
        },
        objectives: [
          {
            it: 'Descrivere le caratteristiche di una REST API e il significato dei metodi HTTP e delle famiglie di stato.',
            en: 'Describe the characteristics of a REST API and the meaning of the HTTP methods and status families.'
          },
          {
            it: 'Leggere un documento JSON riconoscendone i tipi e la struttura annidata.',
            en: 'Read a JSON document, recognising its types and nested structure.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere il modello client–server e le porte dei servizi (capitoli sui servizi IP).',
            en: 'Know the client–server model and service ports (the IP services chapters).'
          }
        ],
        theory: [
          {
            it: 'Una REST API espone le risorse come indirizzi (URI) e le si manipola con i metodi HTTP. I metodi hanno significati precisi: GET legge e non modifica nulla (è sicuro), POST crea, PUT sostituisce una risorsa, PATCH ne aggiorna una parte, DELETE la rimuove. GET, PUT e DELETE sono idempotenti — ripeterli porta allo stesso risultato — mentre POST ripetuto può creare doppioni. La risposta porta un codice di stato: la famiglia 2xx indica successo, la 4xx un errore del client (richiesta sbagliata, non autorizzata, risorsa assente), la 5xx un errore del server.',
            en: 'A REST API exposes resources as addresses (URIs) and manipulates them with HTTP methods. The methods have precise meanings: GET reads and changes nothing (it is safe), POST creates, PUT replaces a resource, PATCH updates part of one, DELETE removes it. GET, PUT, and DELETE are idempotent — repeating them yields the same result — while a repeated POST may create duplicates. The response carries a status code: the 2xx family means success, 4xx a client error (bad request, unauthorized, missing resource), 5xx a server error.'
          },
          {
            it: 'Lo scambio di dati avviene tipicamente in JSON (JavaScript Object Notation), un formato testuale con pochi tipi: oggetti (coppie chiave-valore tra graffe), array (elenchi ordinati tra quadre), stringhe, numeri, i booleani true e false, e null. I valori si annidano — un oggetto può contenere array di oggetti — e la struttura si legge seguendo le chiavi come un percorso. Lo standard JSON non prevede commenti: un commento rende il documento non valido.',
            en: 'Data exchange typically happens in JSON (JavaScript Object Notation), a textual format with few types: objects (key–value pairs in braces), arrays (ordered lists in brackets), strings, numbers, the booleans true and false, and null. Values nest — an object can contain arrays of objects — and the structure is read by following the keys like a path. The JSON standard allows no comments: a comment makes the document invalid.'
          },
          {
            it: 'YAML è un altro formato molto usato, più leggibile per le persone perché basato sull’indentazione invece che su graffe e quadre, e usato dai file di configurazione e dai playbook. JSON e YAML rappresentano le stesse strutture — oggetti, liste, scalari — quindi spesso si convertono l’uno nell’altro. La regola operativa quando si leggono dati da un’API è non fidarsi del contenuto: va validato contro uno schema atteso, perché un campo mancante o un tipo sbagliato rompe l’automazione a valle.',
            en: 'YAML is another widely used format, more human-readable because it is based on indentation instead of braces and brackets, and used by configuration files and playbooks. JSON and YAML represent the same structures — objects, lists, scalars — so they often convert into each other. The operational rule when reading data from an API is not to trust the content: it must be validated against an expected schema, because a missing field or a wrong type breaks the downstream automation.'
          }
        ],
        example: {
          it: 'Un GET verso /devices restituisce un JSON con un array di oggetti, ciascuno con chiavi come hostname e status; leggere quel documento significa seguire le chiavi fino al valore cercato, mentre un POST allo stesso URI creerebbe un nuovo dispositivo.',
          en: 'A GET to /devices returns JSON with an array of objects, each with keys such as hostname and status; reading that document means following the keys to the wanted value, while a POST to the same URI would create a new device.'
        },
        commonMistakes: [
          {
            it: 'Considerare GET e POST equivalenti: GET non modifica nulla ed è idempotente, POST crea e ripetuto può duplicare.',
            en: 'Treating GET and POST as equivalent: GET changes nothing and is idempotent, POST creates and repeated may duplicate.'
          },
          {
            it: 'Mettere commenti in un JSON: lo standard non li prevede e il documento diventa non valido; per i commenti serve un altro formato.',
            en: 'Putting comments in JSON: the standard does not allow them and the document becomes invalid; another format is needed for comments.'
          },
          {
            it: 'Leggere la famiglia di stato al contrario: 2xx è successo, 4xx è un errore del client, 5xx del server.',
            en: 'Reading the status family backwards: 2xx is success, 4xx is a client error, 5xx a server error.'
          }
        ],
        lab: 'automation',
        references: [{ kind: 'rfc', id: 'RFC 8259' }],
        guidedLabs: [
          {
            id: 'gl-json-rest-read',
            title: { it: 'Leggere JSON e metodi REST', en: 'Reading JSON and REST methods' },
            difficulty: 'intro',
            lab: 'automation',
            scenario: {
              it: 'Il laboratorio «Automazione» include un ispettore JSON che appiattisce il documento in percorsi e un esploratore dei metodi HTTP con le loro proprietà.',
              en: 'The “Automation” lab includes a JSON inspector that flattens the document into paths and an HTTP method explorer with their properties.'
            },
            task: {
              it: 'Dato un documento JSON, individua il percorso di un valore annidato; per un’operazione data, scegli il metodo HTTP corretto e dì se è sicuro o idempotente.',
              en: 'Given a JSON document, find the path to a nested value; for a given operation, choose the correct HTTP method and say whether it is safe or idempotent.'
            },
            steps: [
              {
                it: 'Apri «Automazione» e incolla un documento JSON nell’ispettore.',
                en: 'Open “Automation” and paste a JSON document into the inspector.'
              },
              {
                it: 'Segui le chiavi come un percorso fino al valore annidato che cerchi.',
                en: 'Follow the keys like a path to the nested value you want.'
              },
              {
                it: 'Nell’esploratore dei metodi, associa l’operazione (leggere, creare, sostituire, rimuovere) al metodo e verifica sicurezza e idempotenza.',
                en: 'In the method explorer, map the operation (read, create, replace, remove) to the method and check safety and idempotency.'
              }
            ],
            challenge: {
              it: 'Un client ripete la stessa richiesta dopo un timeout: con quali metodi è sicuro farlo senza effetti collaterali, e con quale no?',
              en: 'A client repeats the same request after a timeout: with which methods is it safe to do so without side effects, and with which is it not?'
            },
            solution: [
              {
                it: 'Il valore in JSON si raggiunge seguendo le chiavi attraverso oggetti e array fino allo scalare; il metodo si sceglie dall’operazione: GET per leggere (sicuro), POST per creare, PUT per sostituire, PATCH per aggiornare parzialmente, DELETE per rimuovere.',
                en: 'A JSON value is reached by following the keys through objects and arrays to the scalar; the method is chosen from the operation: GET to read (safe), POST to create, PUT to replace, PATCH to partially update, DELETE to remove.'
              },
              {
                it: 'Sfida: ripetere GET, PUT o DELETE è sicuro perché sono idempotenti — lo stato finale è lo stesso — mentre ripetere POST può creare un doppione, quindi dopo un timeout va gestito con attenzione (per esempio con una chiave di idempotenza).',
                en: 'Challenge: repeating GET, PUT, or DELETE is safe because they are idempotent — the final state is the same — while repeating POST may create a duplicate, so after a timeout it must be handled carefully (for example with an idempotency key).'
              }
            ],
            selfCheck: [
              {
                it: 'So leggere un valore annidato in un JSON seguendo le sue chiavi.',
                en: 'I can read a nested value in JSON by following its keys.'
              },
              {
                it: 'So scegliere il metodo HTTP per un’operazione e dire se è sicuro o idempotente.',
                en: 'I can choose the HTTP method for an operation and say whether it is safe or idempotent.'
              }
            ]
          }
        ]
      },
      {
        id: 'config-management-tools',
        title: {
          it: 'Strumenti di gestione della configurazione',
          en: 'Configuration management tools'
        },
        objectives: [
          {
            it: 'Distinguere gli strumenti di configuration management per modello agent/agentless e dati usati.',
            en: 'Distinguish configuration-management tools by agent/agentless model and the data they use.'
          },
          {
            it: 'Spiegare perché l’idempotenza e l’infrastruttura come codice rendono i cambiamenti riproducibili.',
            en: 'Explain why idempotency and infrastructure as code make changes reproducible.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere JSON/YAML e l’accesso agli apparati via SSH e API (argomenti precedenti).',
            en: 'Know JSON/YAML and device access via SSH and APIs (previous topics).'
          }
        ],
        theory: [
          {
            it: 'Gli strumenti di gestione della configurazione descrivono lo stato desiderato degli apparati e lo fanno convergere. Ansible è agentless: non richiede software sugli apparati, si collega via SSH, API o NETCONF ed esegue playbook scritti in YAML con inventory e moduli; i moduli dovrebbero convergere in modo idempotente. Puppet e Chef seguono un modello ad agente, con un software che gira sui nodi e applica il modello definito centralmente. La scelta tra agent e agentless dipende da cosa si gestisce e da cosa si può installare.',
            en: 'Configuration-management tools describe the desired state of devices and make them converge to it. Ansible is agentless: it needs no software on the devices, connects over SSH, APIs, or NETCONF, and runs playbooks written in YAML with inventory and modules; the modules should converge idempotently. Puppet and Chef follow an agent model, with software running on the nodes that applies the centrally defined model. The choice between agent and agentless depends on what is managed and what can be installed.'
          },
          {
            it: 'Il concetto che rende tutto affidabile è l’idempotenza: applicare la stessa descrizione una o dieci volte lascia il sistema nello stesso stato finale, perché lo strumento cambia solo ciò che diverge dallo stato desiderato invece di rieseguire comandi alla cieca. Così un rollout si può ripetere senza paura, e una configurazione fuori posto viene riportata in linea. L’opposto — comandi imperativi rieseguiti — rischia di accumulare effetti e di rendere il risultato non riproducibile.',
            en: 'The concept that makes everything reliable is idempotency: applying the same description once or ten times leaves the system in the same final state, because the tool changes only what diverges from the desired state instead of blindly re-running commands. So a rollout can be repeated without fear, and an out-of-place configuration is brought back in line. The opposite — imperative commands re-run — risks accumulating effects and making the outcome non-reproducible.'
          },
          {
            it: 'Terraform porta lo stesso principio all’infrastruttura come codice (IaC) con un approccio dichiarativo: si descrive lo stato desiderato delle risorse e Terraform calcola il piano delle modifiche necessarie per raggiungerlo, tenendo traccia di ciò che esiste in un file di stato. La buona pratica, comune a tutti questi strumenti, è versionare le descrizioni come codice, provare prima in dry-run (anteprima senza applicare), fare il rollout a lotti e non mettere mai segreti nel codice: le credenziali vanno lette da un secret manager, non scritte nel playbook.',
            en: 'Terraform brings the same principle to infrastructure as code (IaC) with a declarative approach: you describe the desired state of the resources and Terraform computes the plan of changes needed to reach it, tracking what exists in a state file. The good practice, common to all these tools, is to version the descriptions as code, try first in dry-run (a preview without applying), roll out in batches, and never put secrets in the code: credentials must be read from a secret manager, not written into the playbook.'
          }
        ],
        example: {
          it: 'Un playbook Ansible che garantisce “questa VLAN esiste su questi switch” si può rieseguire ogni giorno: la prima volta la crea, le volte successive non cambia nulla perché lo stato già coincide con quello desiderato.',
          en: 'An Ansible playbook that ensures “this VLAN exists on these switches” can be re-run every day: the first time it creates it, the following times it changes nothing because the state already matches the desired one.'
        },
        commonMistakes: [
          {
            it: 'Credere che Ansible richieda un agente: è agentless e si collega via SSH, API o NETCONF; sono Puppet e Chef a usare un agente.',
            en: 'Believing Ansible needs an agent: it is agentless and connects via SSH, APIs, or NETCONF; it is Puppet and Chef that use an agent.'
          },
          {
            it: 'Trattare i playbook come script imperativi: la forza è l’idempotenza, che cambia solo ciò che diverge invece di rieseguire comandi.',
            en: 'Treating playbooks as imperative scripts: the strength is idempotency, which changes only what diverges instead of re-running commands.'
          },
          {
            it: 'Scrivere segreti nel codice di automazione: vanno letti da un secret manager, mai incorporati nel playbook o nello stato.',
            en: 'Writing secrets into the automation code: they must be read from a secret manager, never embedded in the playbook or the state.'
          }
        ],
        lab: 'automation',
        references: [{ kind: 'rfc', id: 'RFC 6241' }],
        guidedLabs: [
          {
            id: 'gl-idempotent-rollout',
            title: { it: 'Perché un rollout si può ripetere', en: 'Why a rollout can be repeated' },
            difficulty: 'core',
            lab: 'automation',
            scenario: {
              it: 'Il laboratorio «Automazione» confronta gli strumenti di configuration management e mostra una sequenza operativa sicura (secret manager, dry-run, rollout a lotti).',
              en: 'The “Automation” lab compares configuration-management tools and shows a safe operational sequence (secret manager, dry-run, batched rollout).'
            },
            task: {
              it: 'Spiega perché applicare due volte lo stesso playbook idempotente non causa danni e individua i tre passi di un rollout sicuro.',
              en: 'Explain why applying the same idempotent playbook twice causes no harm and identify the three steps of a safe rollout.'
            },
            steps: [
              {
                it: 'Apri «Automazione» e leggi il confronto tra Ansible, Puppet, Chef e Terraform.',
                en: 'Open “Automation” and read the comparison between Ansible, Puppet, Chef, and Terraform.'
              },
              {
                it: 'Nota che uno strumento idempotente cambia solo ciò che diverge dallo stato desiderato.',
                en: 'Note that an idempotent tool changes only what diverges from the desired state.'
              },
              {
                it: 'Individua la sequenza sicura: credenziali dal secret manager, dry-run, rollout a lotti.',
                en: 'Identify the safe sequence: credentials from the secret manager, dry-run, batched rollout.'
              }
            ],
            challenge: {
              it: 'Un rollout imperativo rieseguito raddoppia una regola e rompe la rete: come lo evita un approccio dichiarativo e idempotente?',
              en: 'A re-run imperative rollout doubles a rule and breaks the network: how does a declarative, idempotent approach avoid it?'
            },
            solution: [
              {
                it: 'Applicare due volte un playbook idempotente non causa danni perché lo strumento confronta lo stato reale con quello desiderato e agisce solo sulla differenza: la seconda esecuzione non trova nulla da cambiare. Il rollout sicuro legge i segreti da un secret manager, prova in dry-run e procede a lotti per limitare l’impatto di un errore.',
                en: 'Applying an idempotent playbook twice causes no harm because the tool compares the actual state with the desired one and acts only on the difference: the second run finds nothing to change. A safe rollout reads secrets from a secret manager, tries a dry-run, and proceeds in batches to limit the impact of a mistake.'
              },
              {
                it: 'Sfida: un approccio dichiarativo descrive il risultato voluto, non i comandi; applicarlo più volte converge sempre allo stesso stato, mentre una sequenza imperativa rieseguita aggiunge una seconda regola perché esegue di nuovo l’azione invece di verificare lo stato.',
                en: 'Challenge: a declarative approach describes the wanted result, not the commands; applying it repeatedly always converges to the same state, whereas a re-run imperative sequence adds a second rule because it performs the action again instead of checking the state.'
              }
            ],
            selfCheck: [
              {
                it: 'So spiegare l’idempotenza e perché rende ripetibile un rollout.',
                en: 'I can explain idempotency and why it makes a rollout repeatable.'
              },
              {
                it: 'So elencare i passi di un rollout sicuro e dove tenere i segreti.',
                en: 'I can list the steps of a safe rollout and where to keep secrets.'
              }
            ]
          }
        ]
      },
      {
        id: 'automation-ai-ml-netops',
        title: {
          it: 'IA e machine learning nelle operazioni di rete',
          en: 'AI and machine learning in network operations'
        },
        objectives: [
          {
            it: 'Distinguere machine learning, IA predittiva e IA generativa e spiegare, a livello concettuale, come si applicano alle operazioni di rete.',
            en: 'Distinguish machine learning, predictive AI and generative AI, and explain, at a conceptual level, how they apply to network operations.'
          },
          {
            it: 'Collegare l’IA all’automazione esistente e riconoscerne i limiti: l’output è un suggerimento da verificare, non una verità.',
            en: 'Link AI to the existing automation and recognize its limits: the output is a suggestion to verify, not a truth.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere l’impatto dell’automazione e il networking basato su controller (argomenti precedenti di questo capitolo).',
            en: 'Know the impact of automation and controller-based networking (previous topics in this chapter).'
          }
        ],
        theory: [
          {
            it: 'Il CCNA 200-301 v1.1 aggiunge l’IA alle operazioni di rete (obiettivo 6.4). Tre termini vanno distinti. Il machine learning (ML) impara schemi dai dati invece di seguire regole scritte a mano. L’IA predittiva usa quegli schemi per prevedere o rilevare: previsione della capacità, dei guasti, rilevamento di anomalie nel traffico e nei log. L’IA generativa produce contenuti da una richiesta: bozze di configurazione, riassunti, risposte di un assistente. In rete trasformano la telemetria che l’infrastruttura già emette in informazione e assistenza.',
            en: 'CCNA 200-301 v1.1 adds AI to network operations (objective 6.4). Three terms must be told apart. Machine learning (ML) learns patterns from data instead of following hand-written rules. Predictive AI uses those patterns to forecast or detect: capacity forecasting, fault prediction, anomaly detection in traffic and logs. Generative AI produces content from a prompt: draft configurations, summaries, an assistant’s answers. In the network they turn the telemetry the infrastructure already emits into insight and assistance.'
          },
          {
            it: 'Dove si applica nelle operazioni (AIOps): analisi predittiva per capacità e guasti, rilevamento di anomalie che impara la linea di base del «normale» e segnala lo scostamento, assurance e analisi della causa radice correlate da piattaforme basate su controller (es. Catalyst Center), e assistenti generativi che abbozzano una configurazione o spiegano un problema. L’IA completa l’automazione (API, controller): l’automazione esegue compiti predefiniti, l’IA suggerisce o decide a partire dai dati. Le due cose lavorano insieme, ma non sono la stessa cosa.',
            en: 'Where it applies in operations (AIOps): predictive analytics for capacity and faults, anomaly detection that learns the baseline of «normal» and flags the deviation, assurance and root-cause analysis correlated by controller-based platforms (e.g. Catalyst Center), and generative assistants that draft a configuration or explain a problem. AI complements automation (APIs, controllers): automation runs predefined tasks, AI suggests or decides from data. The two work together, but they are not the same thing.'
          },
          {
            it: 'I limiti contano quanto le capacità. L’output di un modello è un suggerimento da verificare, non una verità: un modello può sbagliare, essere sbilanciato dai dati di addestramento o, nel caso generativo, «allucinare» una configurazione plausibile ma errata. Un umano rivede ogni cambiamento prima che tocchi la rete, e la qualità e la privacy della telemetria restano responsabilità dell’operatore. Per il CCNA la profondità è concettuale: capire cosa fanno IA e ML nelle operazioni, non implementarli.',
            en: 'The limits matter as much as the capabilities. A model’s output is a suggestion to verify, not a truth: a model can be wrong, skewed by its training data or, in the generative case, «hallucinate» a plausible but incorrect configuration. A human reviews every change before it touches the network, and the quality and privacy of the telemetry stay the operator’s responsibility. For the CCNA the depth is conceptual: understand what AI and ML do in operations, not implement them.'
          }
        ],
        example: {
          it: 'Una piattaforma basata su controller segnala un’anomalia nella telemetria di un’interfaccia (IA predittiva) e un assistente generativo abbozza una modifica di configurazione: l’operatore verifica entrambe prima di applicarle, perché il modello suggerisce, non decide al posto suo.',
          en: 'A controller-based platform flags an anomaly in an interface’s telemetry (predictive AI) and a generative assistant drafts a configuration change: the operator verifies both before applying them, because the model suggests, it does not decide in their place.'
        },
        commonMistakes: [
          {
            it: 'Trattare l’output dell’IA come autorevole senza verificarlo: può essere errato o «allucinato», e tocca la rete solo dopo revisione umana.',
            en: 'Treating AI output as authoritative without verifying it: it can be wrong or «hallucinated», and it touches the network only after human review.'
          },
          {
            it: 'Confondere automazione e IA: l’automazione esegue compiti predefiniti, l’IA impara, prevede o genera dai dati.',
            en: 'Confusing automation and AI: automation runs predefined tasks, AI learns, predicts or generates from data.'
          },
          {
            it: 'Credere che l’IA sostituisca la comprensione della rete: resta uno strumento sopra la telemetria, non un rimpiazzo del progetto e della verifica.',
            en: 'Believing AI replaces understanding of the network: it stays a tool on top of the telemetry, not a replacement for design and verification.'
          }
        ],
        references: [{ kind: 'cisco', id: 'Cisco AI and machine learning in network operations' }]
      }
    ]
  },
  {
    id: 'crypto-vpn-pki-tls',
    cert: 'securityplus',
    order: 16,
    track: 'extension',
    title: {
      it: 'Crittografia, VPN/IPsec, PKI e TLS',
      en: 'Cryptography, VPN/IPsec, PKI, and TLS'
    },
    summary: {
      it: 'L’approfondimento oltre il blueprint CCNA: i mattoni crittografici che danno riservatezza, integrità e autenticità, come IPsec e IKEv2 li mettono in pratica in un tunnel, e come una PKI e il TLS legano una chiave a un’identità attraverso la catena dei certificati.',
      en: 'The deep dive beyond the CCNA blueprint: the cryptographic building blocks that provide confidentiality, integrity, and authenticity, how IPsec and IKEv2 put them to work in a tunnel, and how a PKI and TLS bind a key to an identity through the certificate chain.'
    },
    topics: [
      {
        id: 'crypto-building-blocks',
        title: {
          it: 'Crittografia: riservatezza, integrità, autenticità',
          en: 'Cryptography: confidentiality, integrity, authenticity'
        },
        objectives: [
          {
            it: 'Distinguere cifratura simmetrica e asimmetrica, hashing e firma digitale per il servizio che offrono.',
            en: 'Distinguish symmetric and asymmetric encryption, hashing, and digital signatures by the service they provide.'
          },
          {
            it: 'Spiegare come questi strumenti si combinano per ottenere riservatezza, integrità e autenticità.',
            en: 'Explain how these tools combine to achieve confidentiality, integrity, and authenticity.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere la triade CIA (capitolo sui fondamenti di sicurezza).',
            en: 'Know the CIA triad (the security fundamentals chapter).'
          }
        ],
        theory: [
          {
            it: 'Ogni servizio crittografico nasce da uno strumento diverso. La cifratura simmetrica (per esempio AES) usa una sola chiave condivisa per cifrare e decifrare: è veloce e protegge grandi volumi di dati, ma richiede un modo sicuro per scambiare la chiave. La cifratura asimmetrica (per esempio RSA o a curve ellittiche) usa una coppia di chiavi — pubblica e privata — legate matematicamente: ciò che una cifra solo l’altra decifra. È lenta, quindi non si usa per i dati in volume, ma risolve lo scambio di chiavi e la firma.',
            en: 'Each cryptographic service comes from a different tool. Symmetric encryption (for example AES) uses a single shared key to encrypt and decrypt: it is fast and protects large volumes of data, but it needs a secure way to exchange the key. Asymmetric encryption (for example RSA or elliptic-curve) uses a key pair — public and private — mathematically linked: what one encrypts only the other decrypts. It is slow, so it is not used for bulk data, but it solves key exchange and signing.'
          },
          {
            it: 'Riservatezza, integrità e autenticità si ottengono combinando gli strumenti. La riservatezza viene dalla cifratura. L’integrità viene da una funzione di hash (per esempio SHA-256), che riduce un messaggio a un’impronta di lunghezza fissa: cambiando un solo bit, l’impronta cambia del tutto. L’autenticità e il non ripudio vengono dalla firma digitale: si firma l’hash del messaggio con la propria chiave privata, e chiunque può verificarlo con la chiave pubblica corrispondente, certo che solo il titolare della privata poteva produrlo.',
            en: 'Confidentiality, integrity, and authenticity are achieved by combining the tools. Confidentiality comes from encryption. Integrity comes from a hash function (for example SHA-256), which reduces a message to a fixed-length fingerprint: change a single bit and the fingerprint changes entirely. Authenticity and non-repudiation come from the digital signature: you sign the hash of the message with your private key, and anyone can verify it with the matching public key, certain that only the holder of the private key could have produced it.'
          },
          {
            it: 'Il problema dello scambio di chiavi si risolve con Diffie–Hellman: due parti costruiscono una chiave simmetrica condivisa scambiandosi solo valori pubblici, senza mai trasmettere la chiave. Usando valori effimeri a ogni sessione si ottiene la forward secrecy: se in futuro una chiave privata di lungo termine viene compromessa, le sessioni passate restano protette perché le loro chiavi non sono derivabili. È questa combinazione — asimmetrica per lo scambio e la firma, simmetrica per i dati, hash per l’integrità — che sta sotto a IPsec e TLS.',
            en: 'The key-exchange problem is solved with Diffie–Hellman: two parties build a shared symmetric key by exchanging only public values, never transmitting the key itself. Using ephemeral values for each session gives forward secrecy: if a long-term private key is compromised in the future, past sessions stay protected because their keys cannot be derived. It is this combination — asymmetric for exchange and signing, symmetric for the data, hash for integrity — that underpins IPsec and TLS.'
          }
        ],
        example: {
          it: 'Per spedire un messaggio riservato e firmato: si cifra il contenuto con una chiave simmetrica di sessione (riservatezza), si calcola l’hash del messaggio (integrità) e lo si firma con la propria chiave privata (autenticità), mentre la chiave di sessione viaggia protetta dalla chiave pubblica del destinatario.',
          en: 'To send a confidential, signed message: encrypt the content with a symmetric session key (confidentiality), compute the message hash (integrity), and sign it with your private key (authenticity), while the session key travels protected by the recipient’s public key.'
        },
        commonMistakes: [
          {
            it: 'Credere che l’hash cifri: un hash prova l’integrità ma non nasconde nulla; la riservatezza viene dalla cifratura.',
            en: 'Believing a hash encrypts: a hash proves integrity but hides nothing; confidentiality comes from encryption.'
          },
          {
            it: 'Usare l’asimmetrica per i dati in volume: è lenta; serve a scambiare la chiave e a firmare, poi il traffico va in simmetrica.',
            en: 'Using asymmetric encryption for bulk data: it is slow; it serves to exchange the key and to sign, then traffic moves to symmetric.'
          },
          {
            it: 'Confondere cifrare e firmare: si cifra con la chiave pubblica del destinatario, si firma con la propria chiave privata.',
            en: 'Confusing encrypting and signing: you encrypt with the recipient’s public key, you sign with your own private key.'
          }
        ],
        lab: 'vpnsecurity',
        references: [{ kind: 'nist', id: 'SP 800-175B' }]
      },
      {
        id: 'ipsec-ikev2-depth',
        title: {
          it: 'IPsec e IKEv2 in profondità',
          en: 'IPsec and IKEv2 in depth'
        },
        objectives: [
          {
            it: 'Descrivere cosa proteggono ESP e AH e il ruolo di SA e SPI nel forwarding IPsec.',
            en: 'Describe what ESP and AH protect and the role of SAs and SPIs in IPsec forwarding.'
          },
          {
            it: 'Spiegare la negoziazione IKEv2 e come NAT-T e il rekey mantengono il tunnel.',
            en: 'Explain the IKEv2 negotiation and how NAT-T and rekeying keep the tunnel alive.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere la panoramica VPN del capitolo di sicurezza CCNA e i mattoni crittografici (argomento precedente).',
            en: 'Know the VPN overview from the CCNA security chapter and the cryptographic building blocks (previous topic).'
          }
        ],
        theory: [
          {
            it: 'IPsec protegge i pacchetti con due protocolli. ESP (Encapsulating Security Payload) fornisce riservatezza, integrità e autenticità — è quello che si usa quasi sempre. AH (Authentication Header) fornisce solo integrità e autenticità, senza cifratura, ed è oggi raro perché non attraversa il NAT. Ogni direzione del traffico è protetta da una Security Association (SA) distinta, identificata da un numero chiamato SPI (Security Parameter Index): il ricevente usa lo SPI del pacchetto per trovare la SA giusta e le sue chiavi. Due peer hanno quindi due IPsec SA, una per verso.',
            en: 'IPsec protects packets with two protocols. ESP (Encapsulating Security Payload) provides confidentiality, integrity, and authenticity — it is what is almost always used. AH (Authentication Header) provides only integrity and authenticity, without encryption, and is rare today because it does not traverse NAT. Each traffic direction is protected by a distinct Security Association (SA), identified by a number called the SPI (Security Parameter Index): the receiver uses the packet’s SPI to find the right SA and its keys. Two peers therefore have two IPsec SAs, one per direction.'
          },
          {
            it: 'La negoziazione la guida IKEv2 in due scambi. IKE_SA_INIT concorda la suite crittografica (cifratura, PRF, integrità, gruppo Diffie–Hellman) e scambia i nonce, costruendo il canale sicuro di controllo (la IKE SA). IKE_AUTH autentica le identità dei due peer e crea la prima CHILD_SA, cioè la coppia di IPsec SA che protegge il traffico dati. Un errore diagnostico comune è fermarsi alla IKE SA in stato UP: quella prova solo il control plane, non che entrambe le IPsec SA esistano né che il traffico passi davvero.',
            en: 'The negotiation is driven by IKEv2 in two exchanges. IKE_SA_INIT agrees on the cryptographic suite (encryption, PRF, integrity, Diffie–Hellman group) and exchanges nonces, building the secure control channel (the IKE SA). IKE_AUTH authenticates the two peers’ identities and creates the first CHILD_SA, that is, the pair of IPsec SAs that protects the data traffic. A common diagnostic mistake is to stop at the IKE SA being UP: that only proves the control plane, not that both IPsec SAs exist or that traffic actually passes.'
          },
          {
            it: 'Due meccanismi tengono vivo il tunnel. Il NAT-T (NAT Traversal) gestisce il caso in cui un NAT sta tra i peer: IKE parte su UDP/500 e rileva il NAT, poi IKE ed ESP incapsulato passano su UDP/4500, perché l’ESP puro non ha porte e il NAT non saprebbe tradurlo. Il rekey sostituisce periodicamente le chiavi di una SA prima che scadano per tempo o per volume di dati, così una chiave non protegge mai troppo traffico: è l’applicazione pratica della forward secrecy dentro una sessione di lunga durata.',
            en: 'Two mechanisms keep the tunnel alive. NAT-T (NAT Traversal) handles the case where a NAT sits between the peers: IKE starts on UDP/500 and detects the NAT, then IKE and UDP-encapsulated ESP move to UDP/4500, because bare ESP has no ports and the NAT could not translate it. Rekeying periodically replaces an SA’s keys before they expire by time or data volume, so one key never protects too much traffic: it is the practical application of forward secrecy within a long-lived session.'
          }
        ],
        example: {
          it: 'Un tunnel tra due sedi dietro NAT negozia con IKEv2 su UDP/500, rileva il NAT e passa a UDP/4500; da quel momento ESP incapsulato in UDP protegge il traffico, con due IPsec SA (una per verso) che vengono rinnovate dal rekey prima di scadere.',
          en: 'A tunnel between two sites behind NAT negotiates with IKEv2 on UDP/500, detects the NAT, and moves to UDP/4500; from then on UDP-encapsulated ESP protects the traffic, with two IPsec SAs (one per direction) renewed by rekeying before they expire.'
        },
        commonMistakes: [
          {
            it: 'Dichiarare il tunnel funzionante perché la IKE SA è UP: prova il control plane, non il forwarding né entrambe le IPsec SA.',
            en: 'Declaring the tunnel working because the IKE SA is UP: it proves the control plane, not forwarding or both IPsec SAs.'
          },
          {
            it: 'Aspettarsi che AH passi il NAT: AH autentica l’intestazione e il NAT la modifica, rompendo la verifica; con il NAT serve ESP e NAT-T.',
            en: 'Expecting AH to pass NAT: AH authenticates the header and NAT modifies it, breaking the check; with NAT you need ESP and NAT-T.'
          },
          {
            it: 'Trascurare il rekey: una chiave che protegge troppo traffico o troppo a lungo indebolisce la sessione.',
            en: 'Neglecting rekeying: a key that protects too much traffic or for too long weakens the session.'
          }
        ],
        lab: 'vpnsecurity',
        references: [{ kind: 'rfc', id: 'RFC 7296' }],
        guidedLabs: [
          {
            id: 'gl-ikev2-child-sa',
            title: { it: 'Dalla IKE SA alle CHILD_SA', en: 'From the IKE SA to the CHILD_SAs' },
            difficulty: 'advanced',
            lab: 'vpnsecurity',
            scenario: {
              it: 'Il laboratorio «VPN, IPsec e PKI» mette in scena la negoziazione IKEv2 e il forwarding ESP con SPI e CHILD_SA.',
              en: 'The “VPN, IPsec, and PKI” lab stages the IKEv2 negotiation and ESP forwarding with SPIs and CHILD_SAs.'
            },
            task: {
              it: 'Ricostruisci cosa stabiliscono IKE_SA_INIT e IKE_AUTH e spiega perché una IKE SA UP non basta a dire che il traffico passa.',
              en: 'Reconstruct what IKE_SA_INIT and IKE_AUTH establish and explain why an UP IKE SA is not enough to say traffic passes.'
            },
            steps: [
              {
                it: 'Apri «VPN, IPsec e PKI» e seleziona lo scenario di negoziazione IKEv2.',
                en: 'Open “VPN, IPsec, and PKI” and select the IKEv2 negotiation scenario.'
              },
              {
                it: 'Attribuisci a IKE_SA_INIT la suite e lo scambio di nonce, a IKE_AUTH l’autenticazione e la prima CHILD_SA.',
                en: 'Attribute to IKE_SA_INIT the suite and nonce exchange, to IKE_AUTH the authentication and the first CHILD_SA.'
              },
              {
                it: 'Verifica l’esistenza di entrambe le IPsec SA (una per verso) tramite i loro SPI.',
                en: 'Verify the existence of both IPsec SAs (one per direction) via their SPIs.'
              }
            ],
            challenge: {
              it: 'Il tunnel “risulta su” ma il traffico non passa in una direzione: quale evidenza cerchi e cosa potrebbe mancare?',
              en: 'The tunnel “shows up” but traffic does not pass in one direction: what evidence do you look for and what might be missing?'
            },
            solution: [
              {
                it: 'IKE_SA_INIT costruisce la IKE SA concordando cifratura, PRF, integrità e gruppo DH e scambiando i nonce; IKE_AUTH autentica i peer e crea la prima CHILD_SA. La IKE SA UP prova solo il canale di controllo: per il traffico servono entrambe le IPsec SA, identificate dai rispettivi SPI, e il forwarding ESP effettivo.',
                en: 'IKE_SA_INIT builds the IKE SA by agreeing on encryption, PRF, integrity, and the DH group and exchanging nonces; IKE_AUTH authenticates the peers and creates the first CHILD_SA. The UP IKE SA proves only the control channel: for traffic you need both IPsec SAs, identified by their SPIs, and actual ESP forwarding.'
              },
              {
                it: 'Sfida: se il traffico manca in un verso, si cerca la IPsec SA di quella direzione (il suo SPI) e i contatori di pacchetti ESP; può mancare la SA in uscita, può esserci un traffic selector non combaciante o un NAT non gestito (manca NAT-T su UDP/4500) che scarta l’ESP.',
                en: 'Challenge: if traffic is missing in one direction, you look for that direction’s IPsec SA (its SPI) and the ESP packet counters; the outbound SA may be missing, there may be a mismatched traffic selector, or an unhandled NAT (no NAT-T on UDP/4500) dropping the ESP.'
              }
            ],
            selfCheck: [
              {
                it: 'So dire cosa stabilisce ciascuno scambio IKEv2 e cosa prova (e non prova) una IKE SA UP.',
                en: 'I can say what each IKEv2 exchange establishes and what an UP IKE SA proves (and does not prove).'
              },
              {
                it: 'So spiegare il ruolo di SPI e CHILD_SA e quando serve NAT-T.',
                en: 'I can explain the role of SPIs and CHILD_SAs and when NAT-T is needed.'
              }
            ]
          }
        ]
      },
      {
        id: 'pki-tls-certificate-chain',
        diagram: 'pki-tls-chain',
        title: {
          it: 'PKI e TLS: la catena dei certificati',
          en: 'PKI and TLS: the certificate chain'
        },
        objectives: [
          {
            it: 'Descrivere come una PKI lega una chiave pubblica a un’identità tramite la catena dei certificati.',
            en: 'Describe how a PKI binds a public key to an identity through the certificate chain.'
          },
          {
            it: 'Spiegare cosa va validato in un certificato e come il TLS lo usa per stabilire una sessione sicura.',
            en: 'Explain what must be validated in a certificate and how TLS uses it to establish a secure session.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere firma digitale e chiavi pubblica/privata (argomento sui mattoni crittografici).',
            en: 'Know digital signatures and public/private keys (the cryptographic building blocks topic).'
          }
        ],
        theory: [
          {
            it: 'Una chiave pubblica da sola non dice a chi appartiene: serve qualcuno di fidato che lo attesti. Una PKI (Public Key Infrastructure) lo fa con i certificati: una Certificate Authority (CA) firma un certificato che lega una chiave pubblica a un’identità. I certificati formano una catena — il certificato del server è firmato da una CA intermedia, firmata a sua volta da una root CA — e la fiducia si ancora alla root, il trust anchor che sta già nel trust store del client. Validare la catena significa risalirla fino a una root fidata verificando ogni firma.',
            en: 'A public key alone does not say who it belongs to: someone trusted must attest it. A PKI (Public Key Infrastructure) does this with certificates: a Certificate Authority (CA) signs a certificate binding a public key to an identity. Certificates form a chain — the server certificate is signed by an intermediate CA, itself signed by a root CA — and trust is anchored to the root, the trust anchor already in the client’s trust store. Validating the chain means walking it up to a trusted root, verifying each signature.'
          },
          {
            it: 'La catena valida non basta: validare un certificato significa controllare più cose insieme. Che il nome atteso coincida con il soggetto o con un SAN (Subject Alternative Name) del certificato; che l’uso sia quello giusto (l’EKU, Extended Key Usage, deve autorizzare quell’impiego); che il certificato sia nel suo periodo di validità; e che non sia stato revocato, verificandolo con una CRL (Certificate Revocation List) o con OCSP. Un errore sottile è fidarsi di una chain validation “SUCCESS” che però non ha controllato il nome o la revoca: la catena è buona, ma il certificato potrebbe essere di un’altra identità o già revocato.',
            en: 'A valid chain is not enough: validating a certificate means checking several things together. That the expected name matches the subject or a SAN (Subject Alternative Name) of the certificate; that the use is the right one (the EKU, Extended Key Usage, must authorise that use); that the certificate is within its validity period; and that it has not been revoked, checking it with a CRL (Certificate Revocation List) or with OCSP. A subtle mistake is trusting a chain validation that reads “SUCCESS” but did not check the name or revocation: the chain is good, but the certificate could belong to another identity or already be revoked.'
          },
          {
            it: 'Il TLS usa questa PKI per proteggere una connessione. Nell’handshake il server presenta il suo certificato, il client lo valida contro il proprio trust store, e con Diffie–Hellman effimero le due parti derivano chiavi di sessione con forward secrecy; da lì il traffico va in cifratura simmetrica. È lo stesso schema di IPsec — asimmetrica e PKI per autenticare e scambiare chiavi, simmetrica per i dati — applicato al livello di trasporto invece che a quello di rete, ed è ciò che rende HTTPS affidabile.',
            en: 'TLS uses this PKI to protect a connection. In the handshake the server presents its certificate, the client validates it against its own trust store, and with ephemeral Diffie–Hellman the two parties derive session keys with forward secrecy; from there traffic moves to symmetric encryption. It is the same scheme as IPsec — asymmetric and PKI to authenticate and exchange keys, symmetric for the data — applied at the transport layer instead of the network layer, and it is what makes HTTPS trustworthy.'
          }
        ],
        example: {
          it: 'Un browser che apre un sito HTTPS riceve il certificato del server, risale la catena fino a una root fidata, controlla che il nome del sito sia nel SAN, che il certificato sia valido e non revocato, poi negozia le chiavi di sessione: solo allora la connessione è sicura.',
          en: 'A browser opening an HTTPS site receives the server certificate, walks the chain up to a trusted root, checks that the site name is in the SAN, that the certificate is valid and not revoked, then negotiates the session keys: only then is the connection secure.'
        },
        commonMistakes: [
          {
            it: 'Fidarsi di una “chain validation SUCCESS”: non prova che il nome atteso coincida né che la revoca sia stata controllata con esito valido.',
            en: 'Trusting a “chain validation SUCCESS”: it does not prove the expected name matches or that revocation was successfully checked.'
          },
          {
            it: 'Dimenticare la revoca: un certificato nel suo periodo di validità può essere stato revocato, e va verificato con CRL o OCSP.',
            en: 'Forgetting revocation: a certificate within its validity period may have been revoked, and must be checked with a CRL or OCSP.'
          },
          {
            it: 'Ignorare l’EKU: un certificato valido per un uso diverso o per un’altra identità deve essere rifiutato, non accettato perché la catena è buona.',
            en: 'Ignoring the EKU: a certificate valid for a different use or another identity must be rejected, not accepted because the chain is good.'
          }
        ],
        lab: 'vpnsecurity',
        references: [{ kind: 'rfc', id: 'RFC 5280' }],
        guidedLabs: [
          {
            id: 'gl-cert-validation',
            title: { it: 'Cosa valida davvero un certificato', en: 'What truly validates a certificate' },
            difficulty: 'advanced',
            lab: 'vpnsecurity',
            scenario: {
              it: 'Il laboratorio «VPN, IPsec e PKI» include lo scenario di autenticazione del peer con certificato e validazione PKI.',
              en: 'The “VPN, IPsec, and PKI” lab includes the peer-authentication-with-certificate and PKI-validation scenario.'
            },
            task: {
              it: 'Elenca i controlli che un certificato deve superare oltre alla catena, e di’ perché una “chain SUCCESS” da sola non basta.',
              en: 'List the checks a certificate must pass beyond the chain, and say why a “chain SUCCESS” alone is not enough.'
            },
            steps: [
              {
                it: 'Apri «VPN, IPsec e PKI» e seleziona lo scenario di autenticazione con certificato.',
                en: 'Open “VPN, IPsec, and PKI” and select the certificate authentication scenario.'
              },
              {
                it: 'Verifica la catena fino al trust anchor, poi il nome/SAN, l’EKU e la validità.',
                en: 'Verify the chain up to the trust anchor, then the name/SAN, the EKU, and validity.'
              },
              {
                it: 'Controlla la revoca con CRL o OCSP prima di accettare il peer.',
                en: 'Check revocation with a CRL or OCSP before accepting the peer.'
              }
            ],
            challenge: {
              it: 'Un peer presenta un certificato con catena valida ma nome diverso da quello atteso: va accettato? E se la revoca non è verificabile?',
              en: 'A peer presents a certificate with a valid chain but a name different from the expected one: should it be accepted? And if revocation cannot be checked?'
            },
            solution: [
              {
                it: 'Oltre alla catena fino a un trust anchor fidato, un certificato va accettato solo se il nome atteso coincide con il soggetto o un SAN, l’EKU autorizza quell’uso, il certificato è nel periodo di validità e non è revocato (CRL o OCSP). Una “chain SUCCESS” da sola non controlla nome né revoca.',
                en: 'Beyond the chain up to a trusted trust anchor, a certificate is accepted only if the expected name matches the subject or a SAN, the EKU authorises that use, the certificate is within its validity period, and it is not revoked (CRL or OCSP). A “chain SUCCESS” alone checks neither name nor revocation.'
              },
              {
                it: 'Sfida: un certificato con catena valida ma nome diverso va rifiutato, perché la catena prova l’emissione da una CA fidata, non che quel certificato appartenga all’identità attesa; se la revoca non è verificabile, la scelta prudente è non fidarsi finché lo stato non è noto, perché un certificato revocato e non controllato è un ingresso aperto.',
                en: 'Challenge: a certificate with a valid chain but a different name must be rejected, because the chain proves issuance by a trusted CA, not that the certificate belongs to the expected identity; if revocation cannot be checked, the prudent choice is not to trust until the status is known, because a revoked, unchecked certificate is an open door.'
              }
            ],
            selfCheck: [
              {
                it: 'So elencare i controlli di un certificato oltre alla catena (nome/SAN, EKU, validità, revoca).',
                en: 'I can list a certificate’s checks beyond the chain (name/SAN, EKU, validity, revocation).'
              },
              {
                it: 'So spiegare perché una catena valida non basta ad accettare un peer.',
                en: 'I can explain why a valid chain is not enough to accept a peer.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'identity-aaa-advanced',
    cert: 'securityplus',
    order: 17,
    track: 'extension',
    title: {
      it: 'Identità e AAA avanzati: 802.1X, EAP-TLS e NAC',
      en: 'Advanced identity and AAA: 802.1X, EAP-TLS, and NAC'
    },
    summary: {
      it: 'L’approfondimento sull’identità in rete: come 802.1X controlla l’ammissione con EAP-TLS, cosa fare dei dispositivi senza supplicant con MAB e i fallback, e come l’autorizzazione dinamica governa la sessione dopo l’accesso.',
      en: 'The deep dive on network identity: how 802.1X controls admission with EAP-TLS, what to do with devices lacking a supplicant using MAB and fallbacks, and how dynamic authorization governs the session after access.'
    },
    topics: [
      {
        id: 'dot1x-eap-tls',
        title: {
          it: '802.1X ed EAP-TLS: il controllo dell’ammissione',
          en: '802.1X and EAP-TLS: controlling admission'
        },
        objectives: [
          {
            it: 'Descrivere i tre ruoli di 802.1X (supplicant, authenticator, server) e il flusso EAP fino all’autorizzazione.',
            en: 'Describe the three 802.1X roles (supplicant, authenticator, server) and the EAP flow up to authorization.'
          },
          {
            it: 'Spiegare perché la validazione del certificato del server è il punto critico di EAP-TLS.',
            en: 'Explain why validating the server certificate is the critical point of EAP-TLS.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere AAA e la differenza RADIUS/TACACS+ (capitolo di sicurezza CCNA) e la validazione dei certificati (capitolo su PKI e TLS).',
            en: 'Know AAA and the RADIUS/TACACS+ difference (the CCNA security chapter) and certificate validation (the PKI and TLS chapter).'
          }
        ],
        theory: [
          {
            it: '802.1X è il controllo dell’ammissione alla rete basato sulla porta, e distingue tre ruoli: il supplicant è il client che chiede di entrare, l’authenticator è lo switch o l’access point che tiene la porta chiusa a tutto tranne l’autenticazione, e il server è il RADIUS che decide. Il supplicant scambia EAPOL con l’authenticator, che incapsula l’EAP verso il server RADIUS; finché l’autenticazione non riesce, dalla porta passa solo il traffico di autenticazione, non i dati.',
            en: '802.1X is port-based network admission control, and it distinguishes three roles: the supplicant is the client asking to get in, the authenticator is the switch or access point that keeps the port closed to everything but authentication, and the server is the RADIUS that decides. The supplicant exchanges EAPOL with the authenticator, which encapsulates the EAP toward the RADIUS server; until authentication succeeds, only authentication traffic passes the port, not data.'
          },
          {
            it: 'EAP-TLS è il metodo EAP più robusto perché autentica con i certificati in entrambi i versi: il client prova la propria identità con il suo certificato e, soprattutto, valida il certificato del server. Se l’autenticazione riesce, il RADIUS non dice solo “sì”: restituisce un’autorizzazione, che può assegnare dinamicamente una VLAN o una policy. Così l’identità determina il livello di accesso: lo stesso cavo mette un dipendente nella VLAN giusta e un ospite in una isolata.',
            en: 'EAP-TLS is the strongest EAP method because it authenticates with certificates in both directions: the client proves its identity with its certificate and, above all, validates the server certificate. If authentication succeeds, RADIUS does not just say “yes”: it returns an authorization, which can dynamically assign a VLAN or a policy. So identity determines the access level: the same cable puts an employee in the right VLAN and a guest in an isolated one.'
          },
          {
            it: 'Il punto critico è proprio la validazione del certificato del server. Se il supplicant non controlla la CA, il nome e lo scopo del certificato server, consegna il proprio flusso EAP — e quindi le proprie credenziali — a un’infrastruttura rogue che si finge il server legittimo. La difesa è un profilo supplicant gestito con CA e nome del server vincolati (pinned): senza quel vincolo, 802.1X autentica il client verso un attaccante invece che verso la rete. Ed è bene ricordare che 802.1X controlla l’ammissione, non prova che l’endpoint resti integro dopo l’accesso.',
            en: 'The critical point is exactly the validation of the server certificate. If the supplicant does not check the CA, name, and purpose of the server certificate, it hands its EAP flow — and therefore its credentials — to rogue infrastructure posing as the legitimate server. The defense is a managed supplicant profile with a pinned CA and server name: without that pin, 802.1X authenticates the client toward an attacker instead of toward the network. And it is worth remembering that 802.1X controls admission, it does not prove the endpoint stays uncompromised after access.'
          }
        ],
        example: {
          it: 'Un portatile aziendale si collega: lo switch tiene la porta chiusa, il supplicant presenta il certificato e valida quello del server RADIUS, l’autenticazione riesce e il RADIUS assegna dinamicamente la VLAN dei dipendenti; un dispositivo sconosciuto, senza certificato valido, resta fuori.',
          en: 'A corporate laptop connects: the switch keeps the port closed, the supplicant presents its certificate and validates the RADIUS server’s, authentication succeeds, and RADIUS dynamically assigns the employee VLAN; an unknown device, without a valid certificate, stays out.'
        },
        commonMistakes: [
          {
            it: 'Non vincolare CA e nome del server nel supplicant: il client può autenticarsi verso un server rogue consegnandogli il flusso EAP.',
            en: 'Not pinning the CA and server name in the supplicant: the client may authenticate toward a rogue server, handing it the EAP flow.'
          },
          {
            it: 'Confondere i ruoli: l’authenticator (lo switch) non decide, inoltra l’EAP al server RADIUS che decide.',
            en: 'Confusing the roles: the authenticator (the switch) does not decide, it forwards the EAP to the RADIUS server, which decides.'
          },
          {
            it: 'Credere che 802.1X garantisca l’integrità dell’endpoint: controlla l’ammissione, non lo stato del dispositivo dopo l’accesso.',
            en: 'Believing 802.1X guarantees endpoint integrity: it controls admission, not the device’s state after access.'
          }
        ],
        lab: 'identitytrust',
        references: [{ kind: 'rfc', id: 'RFC 5216' }],
        guidedLabs: [
          {
            id: 'gl-dot1x-server-cert',
            title: { it: 'Il certificato che il client deve rifiutare', en: 'The certificate the client must reject' },
            difficulty: 'advanced',
            lab: 'identitytrust',
            scenario: {
              it: 'Il laboratorio «Identità e AAA» include lo scenario 802.1X/EAP-TLS con supplicant, authenticator e server RADIUS.',
              en: 'The “Identity and AAA” lab includes the 802.1X/EAP-TLS scenario with supplicant, authenticator, and RADIUS server.'
            },
            task: {
              it: 'Segui il flusso EAP dai tre ruoli e individua il momento in cui il supplicant deve rifiutare un certificato server non autorizzato.',
              en: 'Follow the EAP flow across the three roles and identify the moment the supplicant must reject an unauthorized server certificate.'
            },
            steps: [
              {
                it: 'Apri «Identità e AAA» e seleziona lo scenario 802.1X ed EAP-TLS.',
                en: 'Open “Identity and AAA” and select the 802.1X and EAP-TLS scenario.'
              },
              {
                it: 'Attribuisci lo scambio EAPOL al supplicant/authenticator e l’incapsulamento EAP al RADIUS.',
                en: 'Attribute the EAPOL exchange to the supplicant/authenticator and the EAP encapsulation to RADIUS.'
              },
              {
                it: 'Verifica che il supplicant validi CA, nome e scopo del certificato server e rifiuti quello non autorizzato.',
                en: 'Verify that the supplicant validates the server certificate’s CA, name, and purpose and rejects an unauthorized one.'
              }
            ],
            challenge: {
              it: 'Un attaccante mette in piedi un finto server RADIUS con lo stesso nome ma un certificato di un’altra CA: cosa deve fare il supplicant e perché un profilo non gestito fallisce?',
              en: 'An attacker stands up a fake RADIUS server with the same name but a certificate from another CA: what must the supplicant do and why does an unmanaged profile fail?'
            },
            solution: [
              {
                it: 'Il flusso è supplicant ↔ authenticator (EAPOL) e authenticator ↔ RADIUS (EAP incapsulato); con EAP-TLS il supplicant valida il certificato del server prima di presentare le proprie credenziali. Il momento critico è quello: se il certificato server non è firmato dalla CA attesa, con il nome atteso e per lo scopo giusto, va rifiutato.',
                en: 'The flow is supplicant ↔ authenticator (EAPOL) and authenticator ↔ RADIUS (encapsulated EAP); with EAP-TLS the supplicant validates the server certificate before presenting its own credentials. That is the critical moment: if the server certificate is not signed by the expected CA, with the expected name and for the right purpose, it must be rejected.'
              },
              {
                it: 'Sfida: contro un finto server il supplicant deve rifiutare il certificato perché la CA non coincide con quella vincolata; un profilo non gestito che non fissa CA e nome accetta qualunque certificato “valido” e consegna il flusso EAP all’attaccante — è il vero punto di rottura di EAP-TLS.',
                en: 'Challenge: against a fake server the supplicant must reject the certificate because the CA does not match the pinned one; an unmanaged profile that does not pin CA and name accepts any “valid” certificate and hands the EAP flow to the attacker — that is the real breaking point of EAP-TLS.'
              }
            ],
            selfCheck: [
              {
                it: 'So descrivere i tre ruoli di 802.1X e il flusso EAP fino all’autorizzazione.',
                en: 'I can describe the three 802.1X roles and the EAP flow up to authorization.'
              },
              {
                it: 'So spiegare perché la validazione del certificato server è il punto critico di EAP-TLS.',
                en: 'I can explain why server-certificate validation is the critical point of EAP-TLS.'
              }
            ]
          }
        ]
      },
      {
        id: 'mab-fallback-order',
        title: {
          it: 'MAB, guest e l’ordine dei fallback',
          en: 'MAB, guest, and the order of fallbacks'
        },
        objectives: [
          {
            it: 'Spiegare a cosa serve MAB e perché è un controllo più debole di 802.1X.',
            en: 'Explain what MAB is for and why it is a weaker control than 802.1X.'
          },
          {
            it: 'Ordinare i metodi di ammissione (802.1X, MAB, guest) e dire il rischio di ciascun fallback.',
            en: 'Order the admission methods (802.1X, MAB, guest) and state the risk of each fallback.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere 802.1X e l’apprendimento dei MAC sullo switch (argomento precedente e capitolo sullo switching).',
            en: 'Know 802.1X and MAC learning on the switch (previous topic and the switching chapter).'
          }
        ],
        theory: [
          {
            it: 'Non tutti i dispositivi hanno un supplicant: stampanti, telecamere, sensori e altri apparati IoT spesso non sanno fare 802.1X. Per loro esiste MAB (MAC Authentication Bypass): lo switch, fallito 802.1X, prende il MAC del dispositivo e lo autentica contro il RADIUS come se fosse una credenziale. Funziona, ma è un controllo debole: un MAC si legge e si falsifica, quindi MAB autentica “un indirizzo”, non “un dispositivo fidato”. Va perciò ristretto alle porte dove serve davvero e abbinato a profilazione e a una VLAN con pochi privilegi.',
            en: 'Not every device has a supplicant: printers, cameras, sensors, and other IoT devices often cannot do 802.1X. For them there is MAB (MAC Authentication Bypass): the switch, after 802.1X fails, takes the device’s MAC and authenticates it against RADIUS as if it were a credential. It works, but it is a weak control: a MAC can be read and spoofed, so MAB authenticates “an address,” not “a trusted device.” It must therefore be restricted to the ports where it is genuinely needed and paired with profiling and a low-privilege VLAN.'
          },
          {
            it: 'I metodi di ammissione si incatenano in un ordine di robustezza decrescente. Prima si prova 802.1X, il più forte, perché basato su credenziali o certificati; se il dispositivo non risponde con EAPOL, si ricade su MAB, basato sul MAC; come ultima risorsa può intervenire un web-auth per gli ospiti, dove l’utente si autentica da un portale. Ogni gradino è più debole del precedente, quindi l’ordine conta: mettere MAB prima di 802.1X, o lasciare un fallback guest troppo permissivo, significa offrire la porta meno sicura come prima scelta.',
            en: 'The admission methods chain in order of decreasing strength. First 802.1X is tried, the strongest, because it is based on credentials or certificates; if the device does not respond with EAPOL, it falls back to MAB, based on the MAC; as a last resort a web-auth may step in for guests, where the user authenticates from a portal. Each step is weaker than the previous, so order matters: putting MAB before 802.1X, or leaving a too-permissive guest fallback, means offering the least secure door as the first choice.'
          },
          {
            it: 'Un fallback diverso vale per l’amministrazione degli apparati: quando il server AAA è irraggiungibile serve un metodo locale di riserva, altrimenti un guasto del RADIUS chiude fuori gli amministratori. È lo stesso principio visto per AAA, applicato qui: il fallback di accesso alla rete (MAB, guest) e il fallback di gestione (locale) risolvono problemi diversi e non vanno confusi. Il primo ammette dispositivi senza supplicant, il secondo garantisce l’accesso di emergenza agli amministratori.',
            en: 'A different fallback applies to device administration: when the AAA server is unreachable a local backup method is needed, otherwise a RADIUS failure locks administrators out. It is the same principle seen for AAA, applied here: the network-access fallback (MAB, guest) and the management fallback (local) solve different problems and must not be confused. The first admits devices without a supplicant, the second guarantees emergency access for administrators.'
          }
        ],
        example: {
          it: 'Una stampante senza supplicant si collega: 802.1X fallisce, lo switch ricade su MAB e autentica il MAC della stampante mettendola in una VLAN a privilegi minimi; un portatile sulla stessa porta supera invece 802.1X e finisce nella VLAN dei dipendenti.',
          en: 'A printer without a supplicant connects: 802.1X fails, the switch falls back to MAB and authenticates the printer’s MAC, placing it in a low-privilege VLAN; a laptop on the same port instead passes 802.1X and ends up in the employee VLAN.'
        },
        commonMistakes: [
          {
            it: 'Trattare MAB come equivalente a 802.1X: un MAC è falsificabile, quindi MAB autentica un indirizzo, non un dispositivo fidato.',
            en: 'Treating MAB as equivalent to 802.1X: a MAC is spoofable, so MAB authenticates an address, not a trusted device.'
          },
          {
            it: 'Sbagliare l’ordine dei metodi: 802.1X va provato per primo, MAB e guest sono fallback progressivamente più deboli.',
            en: 'Getting the method order wrong: 802.1X is tried first, MAB and guest are progressively weaker fallbacks.'
          },
          {
            it: 'Confondere il fallback di rete con quello di gestione: MAB ammette dispositivi, il fallback locale serve agli amministratori quando il RADIUS è giù.',
            en: 'Confusing the network fallback with the management one: MAB admits devices, the local fallback serves administrators when RADIUS is down.'
          }
        ],
        lab: 'identitytrust',
        references: [{ kind: 'ieee', id: 'IEEE 802.1X' }]
      },
      {
        id: 'dynamic-authorization-lifecycle',
        title: {
          it: 'Autorizzazione dinamica e ciclo di vita della sessione',
          en: 'Dynamic authorization and session lifecycle'
        },
        objectives: [
          {
            it: 'Spiegare come l’autorizzazione dinamica (CoA) cambia la policy di una sessione già aperta.',
            en: 'Explain how dynamic authorization (CoA) changes the policy of an already-open session.'
          },
          {
            it: 'Descrivere perché l’ammissione non basta e cosa aggiunge la postura e la rivalutazione.',
            en: 'Describe why admission is not enough and what posture and re-evaluation add.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere 802.1X e l’assegnazione dinamica di VLAN/policy da RADIUS (argomenti precedenti).',
            en: 'Know 802.1X and the dynamic assignment of VLAN/policy from RADIUS (previous topics).'
          }
        ],
        theory: [
          {
            it: 'L’autenticazione decide l’ingresso una volta sola, ma la policy di una sessione può dover cambiare mentre è aperta. La Change of Authorization (CoA) permette al server di modificare o terminare una sessione già autorizzata senza aspettare che l’utente si riconnetta: può spostare un dispositivo in quarantena, cambiargli VLAN o policy, o chiuderne la sessione. È il meccanismo che rende l’accesso reattivo: un endpoint che smette di essere conforme viene isolato subito, non alla prossima autenticazione.',
            en: 'Authentication decides entry once, but a session’s policy may need to change while it is open. Change of Authorization (CoA) lets the server modify or terminate an already-authorized session without waiting for the user to reconnect: it can move a device to quarantine, change its VLAN or policy, or close its session. It is the mechanism that makes access reactive: an endpoint that stops being compliant is isolated at once, not at the next authentication.'
          },
          {
            it: 'L’ammissione non è integrità. 802.1X prova chi è l’endpoint al momento dell’accesso, ma non che resti sano dopo: un portatile autenticato può prendere malware un minuto dopo. Per questo si aggiunge la valutazione della postura — verificare che il dispositivo abbia antivirus aggiornato, patch, disco cifrato — e la rivalutazione periodica, che insieme alla CoA permette di declassare una sessione che non è più conforme. L’accesso diventa così una condizione continua, non un lasciapassare permanente.',
            en: 'Admission is not integrity. 802.1X proves who the endpoint is at access time, but not that it stays healthy afterward: an authenticated laptop can pick up malware a minute later. That is why posture assessment is added — checking that the device has an up-to-date antivirus, patches, an encrypted disk — along with periodic re-evaluation, which together with CoA allows a session that is no longer compliant to be downgraded. Access thus becomes a continuous condition, not a permanent pass.'
          },
          {
            it: 'Intorno a tutto questo c’è il ciclo di vita dell’identità: un account o un certificato va creato, assegnato con i privilegi minimi, rivisto e infine revocato quando non serve più. Un certificato device revocato deve essere rifiutato all’autenticazione, e un privilegio concesso per un compito temporaneo va ritirato alla fine. Trascurare la revoca e la dismissione lascia credenziali valide in giro — il modo più comune in cui un accesso legittimo diventa un ingresso per un attaccante.',
            en: 'Around all this is the identity lifecycle: an account or a certificate must be created, assigned with least privilege, reviewed, and finally revoked when no longer needed. A revoked device certificate must be rejected at authentication, and a privilege granted for a temporary task must be withdrawn at the end. Neglecting revocation and deprovisioning leaves valid credentials lying around — the most common way a legitimate access becomes an attacker’s entry.'
          }
        ],
        example: {
          it: 'Un portatile autenticato smette di essere conforme perché disattiva l’antivirus: la valutazione della postura lo rileva e una CoA lo sposta in una VLAN di quarantena mentre la sua sessione è ancora aperta, senza attendere una nuova autenticazione.',
          en: 'An authenticated laptop stops being compliant because it disables the antivirus: posture assessment detects it and a CoA moves it to a quarantine VLAN while its session is still open, without waiting for a new authentication.'
        },
        commonMistakes: [
          {
            it: 'Considerare l’autenticazione un lasciapassare permanente: senza postura e rivalutazione, un endpoint compromesso dopo l’accesso resta dentro.',
            en: 'Treating authentication as a permanent pass: without posture and re-evaluation, an endpoint compromised after access stays in.'
          },
          {
            it: 'Ignorare la CoA: senza di essa una policy cambia solo alla prossima autenticazione, troppo tardi per isolare una sessione a rischio.',
            en: 'Ignoring CoA: without it a policy changes only at the next authentication, too late to isolate a risky session.'
          },
          {
            it: 'Trascurare revoca e dismissione: credenziali e certificati non ritirati restano un accesso valido per chi non dovrebbe più averlo.',
            en: 'Neglecting revocation and deprovisioning: un-withdrawn credentials and certificates remain a valid access for someone who should no longer have it.'
          }
        ],
        lab: 'identitytrust',
        references: [{ kind: 'rfc', id: 'RFC 5176' }],
        guidedLabs: [
          {
            id: 'gl-coa-posture',
            title: { it: 'Reagire durante la sessione', en: 'Reacting during the session' },
            difficulty: 'advanced',
            lab: 'identitytrust',
            scenario: {
              it: 'Il laboratorio «Identità e AAA» copre l’autorizzazione dinamica e il ciclo di vita della sessione oltre l’ammissione iniziale.',
              en: 'The “Identity and AAA” lab covers dynamic authorization and the session lifecycle beyond initial admission.'
            },
            task: {
              it: 'Spiega come una sessione già aperta può essere declassata quando l’endpoint non è più conforme, e cosa lo rende possibile.',
              en: 'Explain how an already-open session can be downgraded when the endpoint is no longer compliant, and what makes it possible.'
            },
            steps: [
              {
                it: 'Apri «Identità e AAA» e individua lo scenario di sessione e autorizzazione dinamica.',
                en: 'Open “Identity and AAA” and find the session and dynamic-authorization scenario.'
              },
              {
                it: 'Nota che 802.1X prova l’identità all’accesso, non l’integrità continua dell’endpoint.',
                en: 'Note that 802.1X proves identity at access, not the endpoint’s ongoing integrity.'
              },
              {
                it: 'Collega la valutazione della postura e la CoA al declassamento di una sessione non più conforme.',
                en: 'Connect posture assessment and CoA to downgrading a session that is no longer compliant.'
              }
            ],
            challenge: {
              it: 'Un dispositivo autenticato viene revocato mentre la sessione è attiva: cosa deve succedere subito e cosa alla prossima autenticazione?',
              en: 'An authenticated device is revoked while the session is active: what must happen immediately and what at the next authentication?'
            },
            solution: [
              {
                it: 'Una sessione aperta si declassa perché la postura rileva la non conformità e una CoA cambia VLAN/policy o chiude la sessione senza attendere una nuova autenticazione; è questo che rende l’accesso una condizione continua invece di un lasciapassare.',
                en: 'An open session is downgraded because posture detects the non-compliance and a CoA changes the VLAN/policy or closes the session without waiting for a new authentication; this is what makes access a continuous condition rather than a pass.'
              },
              {
                it: 'Sfida: alla revoca, una CoA deve terminare o mettere subito in quarantena la sessione attiva, e al successivo tentativo l’autenticazione deve fallire perché il certificato device revocato viene rifiutato; senza la CoA la revoca avrebbe effetto solo al prossimo accesso, lasciando una finestra aperta.',
                en: 'Challenge: on revocation, a CoA must immediately terminate or quarantine the active session, and at the next attempt authentication must fail because the revoked device certificate is rejected; without CoA the revocation would take effect only at the next access, leaving an open window.'
              }
            ],
            selfCheck: [
              {
                it: 'So spiegare cosa fa la CoA e perché l’ammissione da sola non basta.',
                en: 'I can explain what CoA does and why admission alone is not enough.'
              },
              {
                it: 'So dire cosa aggiungono postura, rivalutazione e revoca al controllo dell’accesso.',
                en: 'I can say what posture, re-evaluation, and revocation add to access control.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'hardening-detection-ir',
    cert: 'securityplus',
    order: 18,
    track: 'extension',
    title: {
      it: 'Hardening, detection e incident response',
      en: 'Hardening, detection, and incident response'
    },
    summary: {
      it: 'Il ciclo operativo della difesa: ridurre la superficie con una baseline di configurazione, accorgersi di ciò che accade con telemetria e detection, e rispondere a un incidente leggendo le evidenze senza trarre conclusioni che i dati non reggono.',
      en: 'The operational cycle of defense: reduce the surface with a configuration baseline, notice what happens with telemetry and detection, and respond to an incident by reading the evidence without drawing conclusions the data does not support.'
    },
    topics: [
      {
        id: 'config-baseline-hardening',
        title: {
          it: 'Baseline di configurazione e hardening',
          en: 'Configuration baseline and hardening'
        },
        objectives: [
          {
            it: 'Spiegare perché una baseline sicura riduce la superficie d’attacco e come si riconosce la deriva.',
            en: 'Explain why a secure baseline reduces the attack surface and how configuration drift is recognised.'
          },
          {
            it: 'Applicare il principio di minima funzionalità a una porta di accesso e a un apparato.',
            en: 'Apply the principle of least functionality to an access port and to a device.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere la sicurezza di livello 2 e l’accesso sicuro agli apparati (capitolo di sicurezza CCNA).',
            en: 'Know Layer 2 security and secure device access (the CCNA security chapter).'
          }
        ],
        theory: [
          {
            it: 'L’hardening parte da una baseline: una configurazione sicura di riferimento che ogni apparato dovrebbe rispettare. Il principio guida è la minima funzionalità — tenere attivo solo ciò che serve e disabilitare il resto — perché ogni servizio acceso, porta aperta o protocollo legacy è superficie d’attacco in più. Su una porta di accesso la baseline mette insieme più controlli coerenti: la porta in modalità access su una VLAN definita, Port Security, protezioni STP come BPDU Guard, e la disattivazione di negoziazioni non necessarie.',
            en: 'Hardening starts from a baseline: a reference secure configuration every device should comply with. The guiding principle is least functionality — keep active only what is needed and disable the rest — because every running service, open port, or legacy protocol is extra attack surface. On an access port the baseline combines several consistent controls: the port in access mode on a defined VLAN, Port Security, STP protections such as BPDU Guard, and turning off unnecessary negotiations.'
          },
          {
            it: 'Una baseline serve a poco se non la si confronta nel tempo: la deriva di configurazione (configuration drift) è l’allontanamento graduale degli apparati dallo stato di riferimento, per modifiche manuali, eccezioni temporanee mai rimosse e interventi non tracciati. Il modo per tenerla sotto controllo è trattare la baseline come uno stato desiderato da riaffermare — idealmente con l’automazione idempotente — e rilevare le differenze rispetto ad essa, invece di scoprire a incidente avvenuto che un apparato era configurato diversamente da come si credeva.',
            en: 'A baseline is of little use if it is not compared over time: configuration drift is the gradual divergence of devices from the reference state, through manual changes, temporary exceptions never removed, and untracked interventions. The way to keep it in check is to treat the baseline as a desired state to reassert — ideally with idempotent automation — and to detect differences from it, instead of discovering after an incident that a device was configured differently than believed.'
          },
          {
            it: 'L’hardening ha però un limite operativo: le soglie e le protezioni vanno dimensionate sulla rete reale. Un filtro anti-spoofing come uRPF in modalità strict, o un policing aggressivo, applicati senza misurare la baseline di traffico, scartano traffico legittimo e trasformano una difesa in un’interruzione. La regola è introdurre i controlli in modo misurato, osservarne l’effetto e stringerli gradualmente: un hardening che spegne la rete non è più sicuro, è solo indisponibile.',
            en: 'Hardening has an operational limit, though: thresholds and protections must be sized against the real network. An anti-spoofing filter like uRPF in strict mode, or aggressive policing, applied without measuring the traffic baseline, drops legitimate traffic and turns a defense into an outage. The rule is to introduce controls in a measured way, observe their effect, and tighten them gradually: hardening that shuts the network down is not more secure, it is just unavailable.'
          }
        ],
        example: {
          it: 'Una porta di accesso con baseline: modalità access su una VLAN dedicata, Port Security con il MAC fissato, BPDU Guard attivo e negoziazione trunk disattivata; confrontare periodicamente la configurazione reale con questa baseline rivela la deriva prima che diventi un problema.',
          en: 'An access port with a baseline: access mode on a dedicated VLAN, Port Security with a pinned MAC, BPDU Guard enabled, and trunk negotiation off; periodically comparing the real configuration against this baseline reveals drift before it becomes a problem.'
        },
        commonMistakes: [
          {
            it: 'Lasciare attivi servizi e protocolli non necessari: ogni funzione accesa è superficie d’attacco in più contro la minima funzionalità.',
            en: 'Leaving unnecessary services and protocols enabled: every function left on is extra attack surface against least functionality.'
          },
          {
            it: 'Definire una baseline e non verificarla: senza confronto nel tempo la deriva di configurazione passa inosservata fino all’incidente.',
            en: 'Defining a baseline and never verifying it: without comparison over time, configuration drift goes unnoticed until the incident.'
          },
          {
            it: 'Applicare soglie aggressive senza misurare: uRPF strict o policing tarati male scartano traffico legittimo.',
            en: 'Applying aggressive thresholds without measuring: strict uRPF or mis-tuned policing drop legitimate traffic.'
          }
        ],
        lab: 'hardening',
        references: [{ kind: 'nist', id: 'SP 800-123' }],
        guidedLabs: [
          {
            id: 'gl-access-port-baseline',
            title: { it: 'Comporre la baseline di una porta', en: 'Composing a port baseline' },
            difficulty: 'core',
            lab: 'hardening',
            scenario: {
              it: 'Il laboratorio «Hardening» mostra configurazioni di baseline commentate, tra cui quella sicura delle porte di accesso.',
              en: 'The “Hardening” lab shows commented baseline configurations, including the secure access-port one.'
            },
            task: {
              it: 'Elenca i controlli che compongono una baseline di porta di accesso e spiega quale rischio ciascuno chiude.',
              en: 'List the controls that make up an access-port baseline and explain which risk each one closes.'
            },
            steps: [
              {
                it: 'Apri «Hardening» e individua la baseline sicura delle porte di accesso.',
                en: 'Open “Hardening” and find the secure access-port baseline.'
              },
              {
                it: 'Associa ciascun comando al rischio che riduce (host non autorizzato, loop, trunk non voluto).',
                en: 'Map each command to the risk it reduces (unauthorized host, loop, unwanted trunk).'
              },
              {
                it: 'Nota che le soglie sono esempi da dimensionare sulla baseline di traffico reale.',
                en: 'Note that thresholds are examples to be sized against the real traffic baseline.'
              }
            ],
            challenge: {
              it: 'Dopo settimane di modifiche manuali alcune porte non rispettano più la baseline: come lo scopri e come riporti gli apparati allo stato di riferimento?',
              en: 'After weeks of manual changes some ports no longer comply with the baseline: how do you discover it and bring the devices back to the reference state?'
            },
            solution: [
              {
                it: 'La baseline di una porta di accesso mette insieme modalità access su una VLAN definita (chiude il trunk non voluto), Port Security (chiude l’host non autorizzato e il MAC flooding), BPDU Guard (chiude un loop o uno switch ostile), e la disattivazione delle negoziazioni non necessarie. Ogni comando corrisponde a un rischio preciso dell’access layer.',
                en: 'An access-port baseline combines access mode on a defined VLAN (closes the unwanted trunk), Port Security (closes the unauthorized host and MAC flooding), BPDU Guard (closes a loop or hostile switch), and turning off unnecessary negotiations. Each command maps to a specific access-layer risk.'
              },
              {
                it: 'Sfida: la deriva si scopre confrontando la configurazione reale con la baseline (un diff rispetto allo stato desiderato); si corregge riapplicando la baseline in modo idempotente, così gli apparati tornano allo stato di riferimento e le eccezioni temporanee dimenticate vengono rimosse.',
                en: 'Challenge: drift is discovered by comparing the real configuration with the baseline (a diff against the desired state); it is fixed by reapplying the baseline idempotently, so devices return to the reference state and forgotten temporary exceptions are removed.'
              }
            ],
            selfCheck: [
              {
                it: 'So elencare i controlli di una baseline di porta e il rischio che ciascuno chiude.',
                en: 'I can list an access-port baseline’s controls and the risk each one closes.'
              },
              {
                it: 'So spiegare cos’è la deriva di configurazione e come riportare un apparato alla baseline.',
                en: 'I can explain configuration drift and how to bring a device back to the baseline.'
              }
            ]
          }
        ]
      },
      {
        id: 'telemetry-detection',
        title: {
          it: 'Telemetria e detection engineering',
          en: 'Telemetry and detection engineering'
        },
        objectives: [
          {
            it: 'Riconoscere le fonti di telemetria utili e perché una buona detection correla più segnali.',
            en: 'Recognise useful telemetry sources and why good detection correlates multiple signals.'
          },
          {
            it: 'Distinguere un comportamento normale da uno anomalo usando il contesto per ridurre i falsi positivi.',
            en: 'Distinguish normal from anomalous behaviour using context to reduce false positives.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere i servizi di telemetria (NTP, SNMP, Syslog, NetFlow) e gli attacchi per livello (capitoli sui servizi IP e sugli attacchi).',
            en: 'Know the telemetry services (NTP, SNMP, Syslog, NetFlow) and per-layer attacks (the IP services and attacks chapters).'
          }
        ],
        theory: [
          {
            it: 'La detection comincia dalla telemetria: i dati che la rete già produce — contatori STP, log di firewall e IDS, flussi NetFlow, log dei servizi — sono le tracce su cui si costruisce un rilevamento. Fare detection engineering significa trasformare una fonte in una regola che riconosce un comportamento sospetto, con una logica esplicita e una soglia. Ma un singolo segnale, da solo, dice poco: un contatore che sale può essere un attacco o un normale picco di manutenzione.',
            en: 'Detection begins with telemetry: the data the network already produces — STP counters, firewall and IDS logs, NetFlow flows, service logs — are the traces on which a detection is built. Doing detection engineering means turning a source into a rule that recognises suspicious behaviour, with explicit logic and a threshold. But a single signal, on its own, says little: a counter that rises may be an attack or a normal maintenance spike.'
          },
          {
            it: 'La differenza tra un allarme utile e il rumore è la correlazione. Una buona regola richiede almeno due segnali indipendenti prima di allertare: per esempio, un cambio di topologia STP è normale durante guasti e manutenzione, ma un nuovo root bridge insieme a un trunk apparso su una porta edge e a una crescita anomala della CAM è un segnale forte. Correlare riduce i falsi positivi perché un singolo evento innocuo non basta a far scattare l’allarme, mentre la coincidenza di più eventi improbabili insieme è ciò che davvero distingue un attacco.',
            en: 'The difference between a useful alert and noise is correlation. A good rule requires at least two independent signals before alerting: for example, an STP topology change is normal during failures and maintenance, but a new root bridge together with a trunk appearing on an edge port and abnormal CAM growth is a strong signal. Correlation reduces false positives because a single harmless event is not enough to trigger the alert, while the coincidence of several unlikely events together is what truly distinguishes an attack.'
          },
          {
            it: 'Il contesto è ciò che rende leggibile un segnale: frequenza, porta, orario e stato atteso dicono se un evento è normale o no. Lo stesso topology change è innocuo se avviene durante una manutenzione pianificata su una porta nota, e sospetto se arriva di notte da una porta di accesso. Una detection senza contesto o genera troppi falsi positivi — e allora viene ignorata — o è troppo lasca e non vede nulla; il lavoro di tuning consiste proprio nel calibrarla sulla rete reale perché allerti quando serve e taccia quando non serve.',
            en: 'Context is what makes a signal readable: frequency, port, time, and expected state tell whether an event is normal or not. The same topology change is harmless during planned maintenance on a known port, and suspicious at night from an access port. A detection without context either generates too many false positives — and then it is ignored — or is too loose and sees nothing; the tuning work is exactly about calibrating it against the real network so it alerts when needed and stays quiet when not.'
          }
        ],
        example: {
          it: 'Una regola per la modifica inattesa della topologia Layer 2 non allerta su un singolo topology change, ma solo quando a quello si aggiunge un secondo segnale — un trunk apparso su una porta edge o un cambio di configurazione — perché è la coincidenza, non l’evento singolo, a indicare un problema.',
          en: 'A rule for an unexpected Layer 2 topology change does not alert on a single topology change, but only when a second signal joins it — a trunk appearing on an edge port or a configuration change — because it is the coincidence, not the single event, that indicates a problem.'
        },
        commonMistakes: [
          {
            it: 'Allertare su un singolo segnale: senza correlazione un evento normale genera un falso positivo e la regola viene ignorata.',
            en: 'Alerting on a single signal: without correlation a normal event generates a false positive and the rule gets ignored.'
          },
          {
            it: 'Ignorare il contesto: frequenza, porta e orario atteso distinguono un evento di manutenzione da un attacco.',
            en: 'Ignoring context: frequency, port, and expected time distinguish a maintenance event from an attack.'
          },
          {
            it: 'Non fare tuning: una detection troppo lasca non vede nulla, una troppo sensibile annega l’analista nei falsi positivi.',
            en: 'Not tuning: a detection that is too loose sees nothing, one that is too sensitive drowns the analyst in false positives.'
          }
        ],
        lab: 'detection',
        references: [{ kind: 'nist', id: 'SP 800-92' }],
        guidedLabs: [
          {
            id: 'gl-correlated-detection',
            title: { it: 'Due segnali meglio di uno', en: 'Two signals better than one' },
            difficulty: 'advanced',
            lab: 'detection',
            scenario: {
              it: 'Il laboratorio «Detection engineering» presenta casi d’uso con telemetria, logica di rilevamento e il contesto che distingue il normale dall’anomalo.',
              en: 'The “Detection engineering” lab presents use cases with telemetry, detection logic, and the context that separates normal from anomalous.'
            },
            task: {
              it: 'Per un caso d’uso, individua la telemetria, scrivi la condizione di correlazione a due segnali e di’ quale contesto riduce i falsi positivi.',
              en: 'For a use case, identify the telemetry, write the two-signal correlation condition, and state which context reduces false positives.'
            },
            steps: [
              {
                it: 'Apri «Detection engineering» e scegli un caso d’uso (ad esempio la modifica di topologia Layer 2).',
                en: 'Open “Detection engineering” and pick a use case (for example the Layer 2 topology change).'
              },
              {
                it: 'Individua le fonti di telemetria e richiedi almeno due segnali indipendenti.',
                en: 'Identify the telemetry sources and require at least two independent signals.'
              },
              {
                it: 'Aggiungi il contesto (frequenza, porta, root atteso) che separa la manutenzione dall’attacco.',
                en: 'Add the context (frequency, port, expected root) that separates maintenance from an attack.'
              }
            ],
            challenge: {
              it: 'La regola allerta troppo spesso durante le manutenzioni programmate: come la calibri senza perdere la capacità di vedere l’attacco?',
              en: 'The rule alerts too often during scheduled maintenance: how do you tune it without losing the ability to see the attack?'
            },
            solution: [
              {
                it: 'Una buona detection prende la telemetria (per il Layer 2: contatori STP, BPDU Guard, eventi di porta) e allerta solo quando almeno due segnali indipendenti coincidono — un cambio STP più un evento di porta o di configurazione — invece che su un singolo topology change, che da solo è normale durante guasti e manutenzione.',
                en: 'A good detection takes the telemetry (for Layer 2: STP counters, BPDU Guard, port events) and alerts only when at least two independent signals coincide — an STP change plus a port or configuration event — rather than on a single topology change, which on its own is normal during failures and maintenance.'
              },
              {
                it: 'Sfida: si calibra con il contesto, non abbassando la sensibilità alla cieca: si escludono le finestre di manutenzione note e le porte attese, si richiede la coincidenza di segnali, e si confronta con il root e la frequenza attesi; così la regola tace sul normale e resta capace di vedere la coincidenza anomala.',
                en: 'Challenge: you tune with context, not by blindly lowering sensitivity: exclude known maintenance windows and expected ports, require coincident signals, and compare against the expected root and frequency; so the rule stays quiet on the normal and remains able to see the anomalous coincidence.'
              }
            ],
            selfCheck: [
              {
                it: 'So costruire una condizione di detection che correla almeno due segnali.',
                en: 'I can build a detection condition that correlates at least two signals.'
              },
              {
                it: 'So usare il contesto per ridurre i falsi positivi senza accecare la regola.',
                en: 'I can use context to reduce false positives without blinding the rule.'
              }
            ]
          }
        ]
      },
      {
        id: 'incident-response-evidence',
        title: {
          it: 'Prima risposta ed evidenze operative',
          en: 'First response and operational evidence'
        },
        objectives: [
          {
            it: 'Leggere l’output dei comandi come evidenza, distinguendo ciò che prova da ciò che suggerisce soltanto.',
            en: 'Read command output as evidence, distinguishing what it proves from what it only suggests.'
          },
          {
            it: 'Spiegare perché la correlazione tra più fonti e la catena di custodia reggono un’indagine.',
            en: 'Explain why correlation across sources and the chain of custody hold up an investigation.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere NTP e Syslog per i timestamp e la raccolta (capitolo sui servizi IP estesi).',
            en: 'Know NTP and Syslog for timestamps and collection (the extended IP services chapter).'
          }
        ],
        theory: [
          {
            it: 'La prima risposta a un incidente si gioca sulle evidenze, e un’evidenza è l’output di un comando o un log letto per ciò che davvero dimostra. Errori fisici su un’interfaccia provano un problema di livello 1, non l’identità di chi lo causa; una Neighbor Cache o una binding table provano una corrispondenza MAC/IP in un momento, non l’intenzione. Il primo lavoro è separare il fatto osservato dall’interpretazione: scrivere cosa mostra l’evidenza prima di scrivere cosa significa.',
            en: 'First response to an incident turns on evidence, and a piece of evidence is a command’s output or a log read for what it actually proves. Physical errors on an interface prove a Layer 1 problem, not the identity of whoever causes it; a Neighbor Cache or a binding table proves a MAC/IP match at a moment, not intent. The first task is to separate the observed fact from the interpretation: write what the evidence shows before writing what it means.'
          },
          {
            it: 'Una sola fonte raramente basta. Un’osservazione presa da un unico punto può essere un artefatto locale — un collector mal sincronizzato, una vista parziale della rete — mentre la stessa evidenza confermata da più collettori indipendenti è molto più solida. Per questo l’indagine correla: mette in fila i timestamp (ed è qui che un orologio sincronizzato con NTP diventa decisivo), confronta ciò che vedono apparati diversi, e cerca la coerenza tra piano dati, log di controllo e accounting. Una conclusione che regge è quella che più evidenze indipendenti raccontano allo stesso modo.',
            en: 'A single source is rarely enough. An observation taken from one point may be a local artifact — a badly synchronised collector, a partial view of the network — while the same evidence confirmed by several independent collectors is far more solid. That is why the investigation correlates: it lines up timestamps (and this is where an NTP-synchronised clock becomes decisive), compares what different devices see, and looks for consistency between the data plane, control logs, and accounting. A conclusion that holds is the one that several independent pieces of evidence tell the same way.'
          },
          {
            it: 'Perché un’evidenza regga anche dopo, servono disciplina e catena di custodia: raccoglierla da un collector remoto e immutabile, con timestamp affidabili e accesso ristretto, registrarne la provenienza e l’ora, e preservarla senza alterarla. L’accounting AAA, che lega ogni comando a un’identità e a un momento, è un esempio di evidenza forte proprio perché raccolta in modo disciplinato. La regola che tiene insieme tutto è la prudenza interpretativa: non affermare più di quanto le evidenze provino, e tenere aperte le ipotesi finché la correlazione non le chiude.',
            en: 'For evidence to hold up later, discipline and a chain of custody are needed: collect it from a remote, immutable collector, with reliable timestamps and restricted access, record its provenance and time, and preserve it without altering it. AAA accounting, which ties every command to an identity and a moment, is an example of strong evidence precisely because it is collected in a disciplined way. The rule that holds it all together is interpretive prudence: do not claim more than the evidence proves, and keep hypotheses open until correlation closes them.'
          }
        ],
        example: {
          it: 'Davanti a un sospetto ARP spoofing, i log di Dynamic ARP Inspection provano che certi ARP sono stati scartati su una porta e in un momento; correlarli con la binding table di DHCP Snooping e con i timestamp sincronizzati distingue un attacco reale da un semplice errore di configurazione.',
          en: 'Facing a suspected ARP spoofing, the Dynamic ARP Inspection logs prove that certain ARPs were dropped on a port at a moment; correlating them with the DHCP Snooping binding table and synchronised timestamps separates a real attack from a mere misconfiguration.'
        },
        commonMistakes: [
          {
            it: 'Confondere ciò che un’evidenza prova con ciò che suggerisce: un contatore o una corrispondenza non dimostrano l’intenzione né l’identità.',
            en: 'Confusing what evidence proves with what it suggests: a counter or a match does not prove intent or identity.'
          },
          {
            it: 'Fidarsi di un’unica fonte: un’osservazione da un solo collector può essere un artefatto locale, non un fatto della rete.',
            en: 'Trusting a single source: an observation from one collector may be a local artifact, not a fact of the network.'
          },
          {
            it: 'Correlare con orologi non sincronizzati: senza NTP i timestamp non si allineano e la sequenza degli eventi diventa inservibile.',
            en: 'Correlating with unsynchronised clocks: without NTP the timestamps do not line up and the event sequence becomes useless.'
          }
        ],
        lab: 'evidence',
        references: [{ kind: 'nist', id: 'SP 800-61' }],
        guidedLabs: [
          {
            id: 'gl-evidence-correlation',
            title: { it: 'Cosa prova davvero l’evidenza', en: 'What the evidence really proves' },
            difficulty: 'advanced',
            lab: 'evidence',
            scenario: {
              it: 'Il laboratorio «Evidenze operative» presenta output di comandi annotati come evidenze, da leggere e correlare per sostenere o smentire un’ipotesi.',
              en: 'The “Operational evidence” lab presents command output annotated as evidence, to be read and correlated to support or refute a hypothesis.'
            },
            task: {
              it: 'Per un caso, separa ciò che l’evidenza prova da ciò che suggerisce e indica quale seconda fonte la confermerebbe.',
              en: 'For a case, separate what the evidence proves from what it suggests and name which second source would confirm it.'
            },
            steps: [
              {
                it: 'Apri «Evidenze operative» e scegli un caso (ad esempio ARP spoofing e DAI).',
                en: 'Open “Operational evidence” and pick a case (for example ARP spoofing and DAI).'
              },
              {
                it: 'Scrivi cosa mostra l’evidenza prima di scrivere cosa significa.',
                en: 'Write what the evidence shows before writing what it means.'
              },
              {
                it: 'Individua una seconda fonte indipendente e usa i timestamp NTP per correlarle.',
                en: 'Identify a second independent source and use NTP timestamps to correlate them.'
              }
            ],
            challenge: {
              it: 'Una sola evidenza sembra incolpare un host preciso: cosa potrebbe smentirla e perché non vai oltre ciò che i dati provano?',
              en: 'A single piece of evidence seems to blame a specific host: what could refute it and why do you not go beyond what the data proves?'
            },
            solution: [
              {
                it: 'Un’evidenza va letta per ciò che dimostra: i log DAI provano che certi ARP sono stati scartati su una porta a un dato istante, non chi e perché; per sostenere l’ipotesi serve correlarli con la binding table di DHCP Snooping, con i timestamp sincronizzati da NTP e con i log di un secondo apparato, finché più fonti indipendenti raccontano la stessa cosa.',
                en: 'Evidence is read for what it proves: DAI logs prove that certain ARPs were dropped on a port at a given instant, not who and why; to support the hypothesis you correlate them with the DHCP Snooping binding table, with NTP-synchronised timestamps, and with a second device’s logs, until several independent sources tell the same story.'
              },
              {
                it: 'Sfida: un’osservazione da un solo collector può essere un artefatto locale (vista parziale, orologio sfasato); la smentisce una seconda fonte che non concorda. Non si va oltre ciò che i dati provano perché attribuire identità o intenzione a una semplice corrispondenza è il modo più rapido per accusare l’host sbagliato.',
                en: 'Challenge: an observation from one collector may be a local artifact (partial view, skewed clock); a second source that disagrees refutes it. You do not go beyond what the data proves because attributing identity or intent to a mere match is the fastest way to blame the wrong host.'
              }
            ],
            selfCheck: [
              {
                it: 'So distinguere ciò che un’evidenza prova da ciò che soltanto suggerisce.',
                en: 'I can distinguish what evidence proves from what it only suggests.'
              },
              {
                it: 'So dire perché correlazione, timestamp NTP e catena di custodia reggono un’indagine.',
                en: 'I can say why correlation, NTP timestamps, and the chain of custody hold up an investigation.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'pentest-methodology',
    cert: 'ejpt',
    order: 19,
    track: 'extension',
    title: {
      it: 'Metodologia di penetration testing (eJPT)',
      en: 'Penetration testing methodology (eJPT)'
    },
    summary: {
      it: 'L’estensione offensiva allineata all’eJPT: come si conduce un test autorizzato, dalla definizione dello scope alla segnalazione. Si studia la metodologia — ricognizione, scanning, enumerazione, valutazione delle vulnerabilità ed exploitation — in chiave didattica e difensiva, collegando ogni fase ai livelli OSI e alle tracce che un difensore osserva.',
      en: 'The offensive extension aligned with the eJPT: how an authorized test is run, from defining the scope to reporting. You study the methodology — reconnaissance, scanning, enumeration, vulnerability assessment, and exploitation — through a teaching and defensive lens, linking each phase to the OSI layers and to the traces a defender observes.'
    },
    topics: [
      {
        id: 'pentest-engagement-phases',
        diagram: 'pentest',
        title: {
          it: 'Ingaggio, autorizzazione e fasi del test',
          en: 'Engagement, authorization, and the test phases'
        },
        objectives: [
          {
            it: 'Spiegare perché autorizzazione scritta, scope e regole d’ingaggio precedono ogni attività tecnica.',
            en: 'Explain why written authorization, scope, and rules of engagement precede any technical activity.'
          },
          {
            it: 'Elencare le fasi di un penetration test e collegarle alla kill chain vista dalla difesa.',
            en: 'List the phases of a penetration test and link them to the kill chain seen from the defense.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere la kill chain e i percorsi d’attacco multi-stadio (capitolo su attacchi e kill chain).',
            en: 'Know the kill chain and multi-stage attack paths (the attacks and kill chain chapter).'
          }
        ],
        theory: [
          {
            it: 'Un penetration test è una simulazione di attacco autorizzata: senza un permesso scritto le stesse azioni sono un reato. Perciò tutto inizia dal pre-engagement, dove si fissano lo scope (quali sistemi e reti sono inclusi), le regole d’ingaggio (orari, tecniche vietate, finestre di manutenzione) e i contatti per l’escalation. Il modello di conoscenza cambia la prospettiva: black box senza informazioni, white box con documentazione e accessi, grey box una via di mezzo. Lo scope non è burocrazia: definisce il confine legale ed etico del lavoro.',
            en: 'A penetration test is an authorized attack simulation: without written permission the same actions are a crime. So everything begins with pre-engagement, where you set the scope (which systems and networks are included), the rules of engagement (hours, forbidden techniques, maintenance windows), and the escalation contacts. The knowledge model changes the perspective: black box with no information, white box with documentation and access, grey box in between. Scope is not bureaucracy: it defines the legal and ethical boundary of the work.'
          },
          {
            it: 'Il lavoro tecnico segue poi fasi ordinate. La ricognizione raccoglie informazioni sul bersaglio; lo scanning individua host e porte vive; l’enumerazione estrae dettagli dai servizi (versioni, utenti, condivisioni); la valutazione delle vulnerabilità correla quei dettagli con debolezze note; l’exploitation verifica se una debolezza è davvero sfruttabile; la post-exploitation misura l’impatto reale (accesso, movimento laterale, persistenza); il reporting trasforma tutto in rischi e rimedi prioritari. Ogni fase riduce l’incertezza di quella dopo: si enumera solo ciò che lo scanning ha trovato, si tenta solo ciò che l’enumerazione rende plausibile.',
            en: 'The technical work then follows ordered phases. Reconnaissance gathers information about the target; scanning finds live hosts and ports; enumeration extracts details from services (versions, users, shares); vulnerability assessment correlates those details with known weaknesses; exploitation checks whether a weakness is truly exploitable; post-exploitation measures the real impact (access, lateral movement, persistence); reporting turns everything into prioritized risks and fixes. Each phase reduces the uncertainty of the next: you enumerate only what scanning found, you attempt only what enumeration makes plausible.'
          },
          {
            it: 'Queste fasi sono lo specchio della kill chain che la difesa conosce: ricognizione ed enumerazione corrispondono alle prime tappe, exploitation e post-exploitation a quelle finali. Ogni azione del tester lascia tracce — query DNS, pacchetti di scanning, tentativi di login — che un difensore rileva con log e IDS. Per questo il valore di un test non è «entrare», ma produrre un report che spieghi come si è entrati, quali evidenze restano e quali controlli avrebbero fermato o rivelato il percorso. Studiare l’offesa serve a rendere la difesa misurabile.',
            en: 'These phases mirror the kill chain the defense knows: reconnaissance and enumeration map to the early stages, exploitation and post-exploitation to the final ones. Every tester action leaves traces — DNS queries, scanning packets, login attempts — that a defender detects with logs and an IDS. This is why the value of a test is not «getting in», but producing a report that explains how entry happened, which evidence remains, and which controls would have stopped or revealed the path. Studying offense serves to make defense measurable.'
          }
        ],
        example: {
          it: 'Un test grey box su 192.0.2.0/24 parte dalle regole d’ingaggio (solo quella sottorete, niente DoS, finestra notturna), poi procede per fasi: si mappa la superficie, si scansionano gli host, si enumerano i servizi, si valutano le vulnerabilità e solo le plausibili si verificano; il report finale ordina i rischi per impatto e indica i rimedi.',
          en: 'A grey-box test on 192.0.2.0/24 starts from the rules of engagement (that subnet only, no DoS, a night window), then proceeds by phases: you map the surface, scan the hosts, enumerate the services, assess the vulnerabilities, and verify only the plausible ones; the final report ranks the risks by impact and states the fixes.'
        },
        commonMistakes: [
          {
            it: 'Agire fuori scope o senza autorizzazione scritta: trasforma un test in un illecito, qualunque sia l’intenzione.',
            en: 'Acting out of scope or without written authorization: it turns a test into an offense, whatever the intent.'
          },
          {
            it: 'Saltare alla exploitation senza enumerare: si tenta alla cieca, si fa rumore e si manca il bersaglio reale.',
            en: 'Jumping to exploitation without enumerating: you attempt blindly, make noise, and miss the real target.'
          },
          {
            it: 'Confondere l’accesso con il risultato: senza un report di rischi e rimedi il test non migliora la difesa.',
            en: 'Confusing access with the result: without a report of risks and fixes the test does not improve the defense.'
          }
        ],
        lab: 'attackpaths',
        references: [{ kind: 'nist', id: 'SP 800-115' }],
        guidedLabs: [
          {
            id: 'gl-pentest-phase-map',
            title: {
              it: 'Mappa le fasi su un percorso d’attacco',
              en: 'Map the phases onto an attack path'
            },
            difficulty: 'core',
            lab: 'attackpaths',
            scenario: {
              it: 'Il laboratorio «Percorsi d’attacco» mostra percorsi multi-stadio in cui ogni tappa prepara la successiva, proprio come le fasi di un test.',
              en: 'The “Attack paths” lab shows multi-stage paths where each step sets up the next, just like the phases of a test.'
            },
            task: {
              it: 'Associa ogni tappa del percorso a una fase (ricognizione, scanning, enumerazione, exploitation, post-exploitation) e indica dove un controllo spezzerebbe la catena.',
              en: 'Match each step of the path to a phase (reconnaissance, scanning, enumeration, exploitation, post-exploitation) and point out where a control would break the chain.'
            },
            steps: [
              {
                it: 'Apri «Percorsi d’attacco» e scegli un percorso multi-stadio.',
                en: 'Open “Attack paths” and pick a multi-stage path.'
              },
              {
                it: 'Per ogni tappa scrivi la fase corrispondente e l’evidenza che lascerebbe.',
                en: 'For each step write the matching phase and the evidence it would leave.'
              },
              {
                it: 'Individua il controllo che interrompe il percorso e di’ in quale fase agisce.',
                en: 'Identify the control that interrupts the path and say in which phase it acts.'
              }
            ],
            challenge: {
              it: 'Se il primo controllo fallisse, quale fase successiva offrirebbe la seconda occasione di rilevamento, e con quale evidenza?',
              en: 'If the first control failed, which later phase would offer the second chance of detection, and with what evidence?'
            },
            solution: [
              {
                it: 'Le prime tappe di un percorso corrispondono a ricognizione e scanning (query e sonde verso host e porte), le intermedie a enumerazione ed exploitation (dettagli dei servizi e uso di una debolezza), le ultime a post-exploitation (movimento laterale e persistenza). Ogni tappa lascia un’evidenza — query DNS, tentativi di connessione, login anomali — e un controllo posto su una tappa precedente riduce tutte le opzioni successive.',
                en: 'The early steps of a path correspond to reconnaissance and scanning (queries and probes toward hosts and ports), the middle ones to enumeration and exploitation (service details and the use of a weakness), the last ones to post-exploitation (lateral movement and persistence). Each step leaves evidence — DNS queries, connection attempts, anomalous logins — and a control placed on an earlier step reduces all the later options.'
              },
              {
                it: 'Sfida: se il primo controllo fallisce, la difesa in profondità dà una seconda occasione a una fase successiva — per esempio l’exploitation genera log di errore o un IDS nota il payload — perché nessun singolo controllo è l’unica barriera.',
                en: 'Challenge: if the first control fails, defense in depth gives a second chance at a later phase — for example exploitation generates error logs or an IDS notices the payload — because no single control is the only barrier.'
              }
            ],
            selfCheck: [
              {
                it: 'So riconoscere a quale fase appartiene una tappa e quale evidenza lascia.',
                en: 'I can tell which phase a step belongs to and what evidence it leaves.'
              },
              {
                it: 'So spiegare perché un controllo su una fase iniziale riduce le opzioni di quelle successive.',
                en: 'I can explain why a control on an early phase reduces the options of the later ones.'
              }
            ]
          }
        ]
      },
      {
        id: 'pentest-recon-footprinting',
        title: {
          it: 'Ricognizione e footprinting',
          en: 'Reconnaissance and footprinting'
        },
        objectives: [
          {
            it: 'Distinguere ricognizione passiva e attiva per il rumore che generano e le tracce che lasciano.',
            en: 'Distinguish passive and active reconnaissance by the noise they generate and the traces they leave.'
          },
          {
            it: 'Costruire la superficie d’attacco di un bersaglio a partire da fonti aperte e dai servizi esposti.',
            en: 'Build a target’s attack surface from open sources and the exposed services.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere DNS, porte e servizi (capitoli su servizi IP e su porte e protocolli).',
            en: 'Know DNS, ports, and services (the IP services and the ports and protocols chapters).'
          }
        ],
        theory: [
          {
            it: 'La ricognizione raccoglie informazioni prima di toccare il bersaglio. Quella passiva non invia pacchetti al sistema: usa OSINT (open-source intelligence) come registrazioni DNS pubbliche, record WHOIS, certificati, repository e motori di ricerca. Non lascia tracce sul bersaglio ed è silenziosa. Quella attiva interroga invece direttamente i sistemi — risoluzioni DNS mirate, richieste a un servizio — ed è più ricca ma rumorosa, perché ogni richiesta può finire in un log. Un tester inizia dalla passiva e passa all’attiva solo quando serve.',
            en: 'Reconnaissance gathers information before touching the target. Passive recon sends no packets to the system: it uses OSINT (open-source intelligence) such as public DNS records, WHOIS data, certificates, repositories, and search engines. It leaves no traces on the target and is quiet. Active recon instead queries the systems directly — targeted DNS lookups, requests to a service — and is richer but noisy, because every request may end up in a log. A tester starts with passive recon and moves to active only when needed.'
          },
          {
            it: 'L’obiettivo è costruire la superficie d’attacco: l’insieme dei punti in cui un bersaglio può essere raggiunto. Il footprinting del DNS enumera i nomi di un dominio — host, sottodomini, record MX e NS — e li traduce in indirizzi; da lì si ricavano gli host esposti e i servizi probabili. Ogni informazione va annotata con la sua fonte e la sua data, perché un dato vecchio o incerto porta fuori strada nelle fasi successive. La ricognizione non «attacca»: disegna la mappa su cui scanning ed enumerazione lavoreranno.',
            en: 'The goal is to build the attack surface: the set of points where a target can be reached. DNS footprinting enumerates a domain’s names — hosts, subdomains, MX and NS records — and resolves them to addresses; from there you derive the exposed hosts and the likely services. Every piece of information should be recorded with its source and date, because stale or uncertain data leads the later phases astray. Reconnaissance does not «attack»: it draws the map that scanning and enumeration will work on.'
          },
          {
            it: 'Dal lato difensivo, la ricognizione passiva è quasi invisibile, ma quella attiva lascia segni: un picco di query DNS da un’unica origine, risoluzioni di nomi inesistenti, accessi insoliti a servizi esposti. La contromisura non è nascondere il DNS — serve a funzionare — ma ridurre la superficie (chiudere ciò che non deve essere pubblico), tenere coerenti i dati esposti e raccogliere log che rendano riconoscibile un footprinting attivo. Conoscere ciò che un tester cerca è il modo più diretto per decidere cosa non esporre.',
            en: 'On the defensive side, passive recon is almost invisible, but active recon leaves signs: a spike of DNS queries from a single source, lookups of nonexistent names, unusual access to exposed services. The countermeasure is not to hide DNS — it must work — but to reduce the surface (close what should not be public), keep the exposed data consistent, and collect logs that make active footprinting recognizable. Knowing what a tester looks for is the most direct way to decide what not to expose.'
          }
        ],
        example: {
          it: 'Per preparare un test su example.test si parte dai record DNS pubblici e dai certificati per elencare host e sottodomini, si annota ogni voce con fonte e data, e si ottiene una mappa di indirizzi e servizi probabili — tutto senza inviare un solo pacchetto d’attacco al bersaglio.',
          en: 'To prepare a test on example.test you start from public DNS records and certificates to list hosts and subdomains, record each entry with its source and date, and obtain a map of likely addresses and services — all without sending a single attack packet to the target.'
        },
        commonMistakes: [
          {
            it: 'Partire dalla ricognizione attiva: fa rumore inutile quando l’OSINT passivo avrebbe già dato la mappa.',
            en: 'Starting with active recon: it makes needless noise when passive OSINT would already give the map.'
          },
          {
            it: 'Fidarsi di dati senza fonte né data: un record vecchio manda scanning ed enumerazione sul bersaglio sbagliato.',
            en: 'Trusting data with no source or date: a stale record sends scanning and enumeration to the wrong target.'
          },
          {
            it: 'Credere che il DNS vada «nascosto»: deve risolvere; ciò che si riduce è la superficie esposta, non la sua visibilità.',
            en: 'Believing DNS must be «hidden»: it has to resolve; what you reduce is the exposed surface, not its visibility.'
          }
        ],
        lab: 'ports',
        references: [{ kind: 'attack', id: 'T1590' }],
        guidedLabs: [
          {
            id: 'gl-pentest-surface-map',
            title: {
              it: 'Disegna la superficie dai servizi esposti',
              en: 'Draw the surface from the exposed services'
            },
            difficulty: 'core',
            lab: 'ports',
            scenario: {
              it: 'Il laboratorio «Porte & Protocolli» elenca porte, protocolli e apparati con le loro caratteristiche di sicurezza: la stessa vista che un tester usa per ipotizzare i servizi dietro una porta.',
              en: 'The “Ports & protocols” lab lists ports, protocols, and devices with their security characteristics: the same view a tester uses to hypothesize the services behind a port.'
            },
            task: {
              it: 'Da un breve elenco di porte aperte deduci i servizi probabili e scrivi quali informazioni l’enumerazione cercherebbe in ciascuno.',
              en: 'From a short list of open ports deduce the likely services and write down what information enumeration would look for in each.'
            },
            steps: [
              {
                it: 'Apri «Porte & Protocolli» e cerca le porte 22, 53, 80 e 443.',
                en: 'Open “Ports & protocols” and look up ports 22, 53, 80, and 443.'
              },
              {
                it: 'Per ciascuna annota il servizio atteso e il dato utile da enumerare (versione, nomi, certificato).',
                en: 'For each, note the expected service and the useful detail to enumerate (version, names, certificate).'
              },
              {
                it: 'Segna quali di questi servizi dovrebbero essere pubblici e quali no, dal lato difensivo.',
                en: 'Mark which of these services should be public and which should not, from the defensive side.'
              }
            ],
            challenge: {
              it: 'Una porta risponde ma con un servizio diverso da quello atteso per quel numero: come lo scopriresti e perché conta per le fasi successive?',
              en: 'A port responds but with a service different from the one expected for that number: how would you find out, and why does it matter for the later phases?'
            },
            solution: [
              {
                it: 'Le porte suggeriscono i servizi — 22 per SSH, 53 per DNS, 80 e 443 per HTTP e HTTPS — ma sono solo un’ipotesi: l’enumerazione la conferma leggendo versioni e banner. Per ogni servizio il dato utile cambia: una versione per SSH, i record per il DNS, il certificato e le intestazioni per HTTPS. Dal lato difensivo, un servizio esposto senza ragione è superficie in più da chiudere.',
                en: 'Ports suggest services — 22 for SSH, 53 for DNS, 80 and 443 for HTTP and HTTPS — but they are only a hypothesis: enumeration confirms it by reading versions and banners. For each service the useful detail changes: a version for SSH, the records for DNS, the certificate and headers for HTTPS. On the defensive side, a service exposed without reason is extra surface to close.'
              },
              {
                it: 'Sfida: un servizio su una porta inattesa si scopre con la rilevazione di versione e banner, che leggono il servizio reale invece di fidarsi del numero; conta perché enumerazione ed eventuale exploitation dipendono dal servizio vero, non dalla porta.',
                en: 'Challenge: a service on an unexpected port is found with version and banner detection, which read the real service instead of trusting the number; it matters because enumeration and any exploitation depend on the real service, not the port.'
              }
            ],
            selfCheck: [
              {
                it: 'So dedurre i servizi probabili dalle porte e dire quale dato enumererei in ciascuno.',
                en: 'I can deduce the likely services from the ports and say which detail I would enumerate in each.'
              },
              {
                it: 'So spiegare perché la porta è solo un’ipotesi che l’enumerazione deve confermare.',
                en: 'I can explain why the port is only a hypothesis that enumeration must confirm.'
              }
            ]
          }
        ]
      },
      {
        id: 'pentest-scanning-enumeration',
        title: {
          it: 'Scanning ed enumerazione dei servizi',
          en: 'Scanning and service enumeration'
        },
        objectives: [
          {
            it: 'Spiegare host discovery e port scanning TCP e UDP e cosa distingue una porta aperta, chiusa o filtrata.',
            en: 'Explain host discovery and TCP and UDP port scanning, and what tells an open, closed, or filtered port apart.'
          },
          {
            it: 'Trasformare i risultati dello scanning in enumerazione e in una valutazione delle vulnerabilità difendibile.',
            en: 'Turn scanning results into enumeration and a defensible vulnerability assessment.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere il three-way handshake TCP e la differenza tra TCP e UDP (capitoli sui fondamenti e sui servizi IP).',
            en: 'Know the TCP three-way handshake and the difference between TCP and UDP (the fundamentals and IP services chapters).'
          }
        ],
        theory: [
          {
            it: 'Lo scanning verifica cosa è vivo e raggiungibile. L’host discovery individua gli host attivi in una sottorete; il port scanning determina quali porte rispondono. Su TCP lo stato si deduce dall’handshake: una risposta SYN-ACK indica una porta aperta, un RST una porta chiusa, nessuna risposta una porta filtrata da un firewall. UDP è più ambiguo perché non ha handshake: il silenzio può significare aperto o filtrato, e spesso serve la risposta del servizio per decidere. Distinguere aperto da filtrato è ciò che separa un servizio reale da un confine di rete.',
            en: 'Scanning checks what is alive and reachable. Host discovery finds the active hosts in a subnet; port scanning determines which ports respond. On TCP the state is inferred from the handshake: a SYN-ACK reply means an open port, an RST a closed port, no reply a port filtered by a firewall. UDP is more ambiguous because it has no handshake: silence can mean open or filtered, and often the service’s reply is needed to decide. Telling open from filtered is what separates a real service from a network boundary.'
          },
          {
            it: 'Una porta aperta è solo l’inizio: l’enumerazione estrae i dettagli che rendono un servizio sfruttabile o sicuro. La rilevazione di servizio e versione legge il banner o le risposte del protocollo per capire cosa gira e in quale versione; da lì si enumerano utenti, condivisioni, endpoint o record a seconda del servizio. La valutazione delle vulnerabilità correla versione e configurazione con debolezze note, ma resta un’ipotesi finché non è verificata: una versione «vulnerabile» può essere stata corretta con una patch retroportata. Enumerare bene è ciò che evita tentativi alla cieca nella fase di exploitation.',
            en: 'An open port is only the start: enumeration extracts the details that make a service exploitable or safe. Service and version detection reads the banner or the protocol responses to learn what runs and in which version; from there you enumerate users, shares, endpoints, or records depending on the service. Vulnerability assessment correlates version and configuration with known weaknesses, but it stays a hypothesis until verified: a «vulnerable» version may have been fixed with a backported patch. Enumerating well is what avoids blind attempts in the exploitation phase.'
          },
          {
            it: 'Lo scanning è rumoroso per natura, e questo è l’aggancio della difesa. Una scansione lascia una firma riconoscibile: molte connessioni verso porte diverse in poco tempo, molti RST, pacchetti UDP verso servizi inesistenti. Un IDS e i log di rete la rilevano, e la segmentazione limita cosa uno scanner può persino raggiungere. Per questo i risultati vanno sempre riportati con la data e il metodo: lo stato di una porta è vero al momento della scansione, e una buona difesa cambia quella fotografia tra un test e il successivo.',
            en: 'Scanning is noisy by nature, and this is the defense’s hook. A scan leaves a recognizable signature: many connections to different ports in a short time, many RSTs, UDP packets toward nonexistent services. An IDS and network logs detect it, and segmentation limits what a scanner can even reach. This is why results must always be reported with the date and the method: a port’s state is true at the moment of the scan, and a good defense changes that snapshot between one test and the next.'
          }
        ],
        example: {
          it: 'Scansionando un host in 192.0.2.0/24 si trovano la porta 22 aperta (SYN-ACK) e la 80 filtrata (nessuna risposta); l’enumerazione legge la versione del servizio sulla 22 e la annota con data e metodo, mentre l’IDS registra la raffica di connessioni come una firma di scansione.',
          en: 'Scanning a host in 192.0.2.0/24 finds port 22 open (SYN-ACK) and port 80 filtered (no reply); enumeration reads the service version on 22 and records it with the date and method, while the IDS logs the burst of connections as a scan signature.'
        },
        commonMistakes: [
          {
            it: 'Trattare «nessuna risposta» come porta chiusa: su TCP indica filtrata, e su UDP il silenzio è ambiguo.',
            en: 'Treating «no reply» as a closed port: on TCP it means filtered, and on UDP silence is ambiguous.'
          },
          {
            it: 'Dichiarare vulnerabile un servizio dalla sola versione: una patch retroportata smentisce il numero di versione.',
            en: 'Declaring a service vulnerable from the version alone: a backported patch disproves the version number.'
          },
          {
            it: 'Riportare uno stato senza data né metodo: la fotografia delle porte scade appena la difesa cambia.',
            en: 'Reporting a state with no date or method: the snapshot of the ports expires as soon as the defense changes.'
          }
        ],
        lab: 'scanstates',
        references: [{ kind: 'attack', id: 'T1046' }],
        guidedLabs: [
          {
            id: 'gl-pentest-scan-states',
            title: {
              it: 'Leggi aperto, chiuso e filtrato',
              en: 'Read open, closed, and filtered'
            },
            difficulty: 'advanced',
            lab: 'scanstates',
            scenario: {
              it: 'Il laboratorio «Stati di porta (scanning)» decodifica come una scansione deduce lo stato da sonda e risposta, su TCP e UDP.',
              en: 'The “Port states (scanning)” lab decodes how a scan deduces the state from probe and response, on TCP and UDP.'
            },
            task: {
              it: 'Collega gli stati aperto, chiuso e filtrato alla risposta ricevuta e spiega come un difensore riconosce una scansione.',
              en: 'Link the open, closed, and filtered states to the response received and explain how a defender recognizes a scan.'
            },
            steps: [
              {
                it: 'Apri «Stati di porta (scanning)» e confronta i tre casi su TCP.',
                en: 'Open “Port states (scanning)” and compare the three cases on TCP.'
              },
              {
                it: 'Passa a UDP e nota perché il silenzio rende aperto e filtrato ambigui.',
                en: 'Switch to UDP and note why silence makes open and filtered ambiguous.'
              },
              {
                it: 'Indica quale evidenza (molti tentativi, molti RST) rivelerebbe la scansione nei log.',
                en: 'Point out which evidence (many attempts, many RSTs) would reveal the scan in the logs.'
              }
            ],
            challenge: {
              it: 'Due host rispondono in modo diverso alla stessa sonda: cosa ti dice sul firewall davanti a ciascuno e su quale merita enumerazione?',
              en: 'Two hosts respond differently to the same probe: what does that tell you about the firewall in front of each and which one deserves enumeration?'
            },
            solution: [
              {
                it: 'Una porta filtrata nasce da un firewall che scarta il pacchetto senza rispondere, perciò lo scanner non vede né SYN-ACK né RST; una porta chiusa produce un RST perché l’host risponde ma nessun servizio ascolta; una aperta completa l’handshake. Nei log la scansione appare come molti tentativi verso porte diverse in poco tempo, spesso con molti RST: un IDS la riconosce per questa firma.',
                en: 'A filtered port comes from a firewall that drops the packet without replying, so the scanner sees neither SYN-ACK nor RST; a closed port produces an RST because the host answers but no service listens; an open one completes the handshake. In the logs the scan appears as many attempts to different ports in a short time, often with many RSTs: an IDS recognizes it by this signature.'
              },
              {
                it: 'Sfida: se un host dà RST e l’altro resta muto alla stessa sonda, il primo non ha un firewall che filtra quella porta (chiusa) mentre il secondo sì (filtrata); l’enumerazione conviene sull’host e sulle porte che rispondono, non su quelle filtrate che potrebbero nascondere o meno un servizio.',
                en: 'Challenge: if one host gives an RST and the other stays silent to the same probe, the first has no firewall filtering that port (closed) while the second does (filtered); enumeration is worth it on the host and ports that respond, not on filtered ones that may or may not hide a service.'
              }
            ],
            selfCheck: [
              {
                it: 'So dedurre dallo scanning se una porta è aperta, chiusa o filtrata e perché.',
                en: 'I can infer from scanning whether a port is open, closed, or filtered, and why.'
              },
              {
                it: 'So dire quale evidenza rivela una scansione e come la segmentazione ne limita la portata.',
                en: 'I can say which evidence reveals a scan and how segmentation limits its reach.'
              }
            ]
          }
        ]
      },
      {
        id: 'pentest-service-enumeration',
        title: {
          it: 'Enumerazione dei servizi: SMB, SNMP e NFS',
          en: 'Service enumeration: SMB, SNMP, and NFS'
        },
        objectives: [
          {
            it: 'Spiegare cosa espongono SMB, SNMP e NFS quando sono configurati in modo debole e perché l’enumerazione del servizio precede ogni tentativo di exploitation.',
            en: 'Explain what SMB, SNMP, and NFS expose when weakly configured, and why service enumeration precedes any exploitation attempt.'
          },
          {
            it: 'Collegare ciascun servizio alla difesa che ne riduce la superficie e alla telemetria che rivela l’enumerazione.',
            en: 'Link each service to the defense that reduces its surface and to the telemetry that reveals the enumeration.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere la differenza tra scanning ed enumerazione e la lettura di servizio e versione (argomento precedente).',
            en: 'Know the difference between scanning and enumeration and how to read service and version (the previous topic).'
          }
        ],
        theory: [
          {
            it: 'SMB (porte 445 e 139) condivide file e stampanti sulla rete, ed è il servizio che più spesso parla troppo. Una sessione null o guest — l’accesso senza credenziali che le configurazioni legacy ammettono — può restituire l’elenco delle condivisioni, gli utenti, i gruppi e la politica delle password, cioè la mappa che orienta tutto il resto del test. Conta anche la versione: SMBv1 è obsoleto e va disattivato, mentre SMBv2 e SMBv3 vanno imposti con la firma dei messaggi. La difesa è negare le sessioni anonime, limitare l’esposizione di 445 con la segmentazione e non pubblicare condivisioni oltre il necessario.',
            en: 'SMB (ports 445 and 139) shares files and printers over the network, and it is the service that most often says too much. A null or guest session — the credential-less access that legacy configurations allow — can return the list of shares, users, groups, and the password policy, that is, the map that guides the rest of the test. The version matters too: SMBv1 is obsolete and must be disabled, while SMBv2 and SMBv3 must be enforced with message signing. The defense is to deny anonymous sessions, limit the exposure of 445 with segmentation, and not publish shares beyond what is needed.'
          },
          {
            it: 'SNMP (porta UDP 161) monitora e gestisce gli apparati, e la sua debolezza storica è la community string: una stringa condivisa che funge da password. I valori predefiniti «public» in sola lettura (RO) e «private» in lettura-scrittura (RW) sono notissimi, e SNMPv1 e v2c li trasmettono in chiaro. Con la sola RO si enumerano tabella di routing, interfacce, processi e versione del sistema; con la RW si può persino riconfigurare l’apparato. La difesa è SNMPv3 con autenticazione e cifratura, l’abbandono delle community predefinite e il filtro di 161 verso i soli collector autorizzati su una rete di gestione separata.',
            en: 'SNMP (UDP port 161) monitors and manages devices, and its historical weakness is the community string: a shared string that acts as a password. The default values «public» for read-only (RO) and «private» for read-write (RW) are well known, and SNMPv1 and v2c send them in cleartext. With RO alone you enumerate the routing table, interfaces, processes, and system version; with RW you can even reconfigure the device. The defense is SNMPv3 with authentication and encryption, dropping the default communities, and filtering 161 to the authorized collectors only on a separate management network.'
          },
          {
            it: 'NFS (porta 2049) condivide file system in rete, tipicamente tra sistemi Unix. L’enumerazione legge la lista degli export e le reti a cui ciascuno è concesso; un export troppo aperto, o l’opzione no_root_squash che lascia a root del client i privilegi di root sul file system, trasforma una condivisione in un accesso privilegiato. La difesa è esportare solo verso host o reti precise, mantenere il root squash e preferire autenticazione e cifratura (Kerberos su NFSv4) alla sola fiducia nell’indirizzo IP. In tutti e tre i casi l’enumerazione lascia una firma nei log — sessioni anonime, query SNMP, richieste mount — e la segmentazione limita a monte chi può anche solo raggiungere il servizio.',
            en: 'NFS (port 2049) shares file systems over the network, typically between Unix systems. Enumeration reads the list of exports and the networks each is granted to; an export that is too open, or the no_root_squash option that leaves the client’s root with root privileges on the file system, turns a share into privileged access. The defense is to export only to precise hosts or networks, keep root squash, and prefer authentication and encryption (Kerberos on NFSv4) over trusting the IP address alone. In all three cases enumeration leaves a signature in the logs — anonymous sessions, SNMP queries, mount requests — and segmentation limits upstream who can even reach the service.'
          }
        ],
        example: {
          it: 'Su un host in 192.0.2.0/24 una sessione SMB null elenca le condivisioni e gli utenti, SNMP risponde alla community «public» con la tabella di routing e NFS mostra un export concesso a tutta la sottorete: la difesa nega le sessioni anonime, sostituisce la community con SNMPv3 e restringe l’export a un solo host, mentre i log registrano le tre richieste di enumerazione.',
          en: 'On a host in 192.0.2.0/24 an SMB null session lists the shares and users, SNMP answers the «public» community with the routing table, and NFS shows an export granted to the whole subnet: the defense denies anonymous sessions, replaces the community with SNMPv3, and narrows the export to a single host, while the logs record the three enumeration requests.'
        },
        commonMistakes: [
          {
            it: 'Lasciare attive le sessioni SMB null o guest: restituiscono condivisioni, utenti e politica delle password senza credenziali.',
            en: 'Leaving SMB null or guest sessions active: they return shares, users, and password policy with no credentials.'
          },
          {
            it: 'Conservare le community SNMP «public»/«private» su v1/v2c: viaggiano in chiaro e aprono lettura o riconfigurazione.',
            en: 'Keeping the «public»/«private» SNMP communities on v1/v2c: they travel in cleartext and open read or reconfiguration.'
          },
          {
            it: 'Esportare in NFS con no_root_squash o verso reti troppo ampie: una condivisione diventa un accesso privilegiato.',
            en: 'Exporting over NFS with no_root_squash or to networks that are too broad: a share becomes privileged access.'
          }
        ],
        references: [
          { kind: 'attack', id: 'T1135' },
          { kind: 'nist', id: 'SP 800-123' }
        ]
      },
      {
        id: 'pentest-vulnerability-assessment',
        title: {
          it: 'Valutazione delle vulnerabilità',
          en: 'Vulnerability assessment'
        },
        objectives: [
          {
            it: 'Spiegare come l’enumerazione diventa una lista di vulnerabilità plausibili, prioritizzata e difendibile, distinguendo l’ipotesi dalla verifica.',
            en: 'Explain how enumeration becomes a prioritized, defensible list of plausible vulnerabilities, telling the hypothesis from the verification.'
          },
          {
            it: 'Collegare la valutazione al lato difensivo — gestione delle patch e della configurazione, riduzione della superficie — e ai suoi limiti (falsi positivi, contesto).',
            en: 'Link the assessment to the defensive side — patch and configuration management, surface reduction — and to its limits (false positives, context).'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere scanning ed enumerazione dei servizi (argomenti precedenti): la valutazione parte dai loro risultati.',
            en: 'Know scanning and service enumeration (previous topics): the assessment starts from their results.'
          }
        ],
        theory: [
          {
            it: 'La valutazione delle vulnerabilità è la fase — nella metodologia eJPT, dentro le Assessment Methodologies — che trasforma ciò che l’enumerazione ha trovato (servizi, versioni, configurazioni) in una lista di vulnerabilità plausibili. Il metodo è correlare quelle evidenze con debolezze note, tipicamente identificate da un CVE e valutate per gravità con un punteggio CVSS. Il punto chiave è che resta un’ipotesi finché non è verificata: una versione marcata «vulnerabile» può essere stata corretta con una patch retroportata, e uno scanner produce falsi positivi. Riportare una vulnerabilità come confermata senza averla verificata è l’errore classico di questa fase.',
            en: 'Vulnerability assessment is the phase — in the eJPT methodology, within Assessment Methodologies — that turns what enumeration found (services, versions, configurations) into a list of plausible vulnerabilities. The method is to correlate that evidence with known weaknesses, typically identified by a CVE and rated for severity with a CVSS score. The key point is that it stays a hypothesis until verified: a version marked «vulnerable» may have been fixed with a backported patch, and a scanner produces false positives. Reporting a vulnerability as confirmed without verifying it is the classic mistake of this phase.'
          },
          {
            it: 'La valutazione si fa con due prospettive. Una scansione non autenticata vede ciò che vede un estraneo dalla rete; una scansione autenticata, con credenziali sul sistema, legge versioni e patch effettive e riduce i falsi positivi, ma non va confusa con l’esposizione reale verso l’esterno. La prioritizzazione non può basarsi sul solo CVSS: contano anche l’esposizione (il servizio è raggiungibile da dove?), l’esistenza di un exploit praticabile e il valore dell’asset. Una vulnerabilità critica su un host isolato può pesare meno di una media su un servizio esposto e centrale.',
            en: 'The assessment is done from two perspectives. An unauthenticated scan sees what an outsider on the network sees; an authenticated scan, with credentials on the system, reads the actual versions and patches and reduces false positives, but must not be confused with real external exposure. Prioritization cannot rest on CVSS alone: exposure also matters (reachable from where?), the existence of a practical exploit, and the value of the asset. A critical vulnerability on an isolated host can weigh less than a medium one on an exposed, central service.'
          },
          {
            it: 'È la stessa attività che il difensore esegue di continuo, dall’altro lato: la gestione delle vulnerabilità è un ciclo di scoperta, prioritizzazione, rimedio (patch o mitigazione di configurazione) e verifica, non un evento una tantum. L’output utile non è l’elenco grezzo dello scanner ma una lista verificata e contestualizzata con rimedi concreti. Come ogni scansione, lascia una firma nei log ed è vincolata a scope e autorizzazione: valutare fuori dallo scope o dichiarare sfruttabile ciò che non è stato verificato sono errori di metodo, non solo di tecnica.',
            en: 'It is the same activity the defender runs continuously, from the other side: vulnerability management is a cycle of discovery, prioritization, remediation (patching or configuration mitigation) and verification, not a one-off event. The useful output is not the scanner’s raw list but a verified, contextualized list with concrete remediation. Like any scan, it leaves a signature in the logs and is bound by scope and authorization: assessing out of scope, or declaring exploitable what was never verified, are method errors, not just technical ones.'
          }
        ],
        example: {
          it: 'Su un host in 192.0.2.0/24 uno scanner segnala la versione di un servizio come esposta a un CVE ad alto CVSS; la verifica mostra che è un falso positivo (patch retroportata), quindi l’assessor non la riporta come confermata e prioritizza invece una vulnerabilità media ma su un servizio realmente raggiungibile dall’esterno.',
          en: 'On a host in 192.0.2.0/24 a scanner flags a service version as exposed to a high-CVSS CVE; verification shows it is a false positive (backported patch), so the assessor does not report it as confirmed and instead prioritizes a medium vulnerability on a service that is actually reachable from outside.'
        },
        commonMistakes: [
          {
            it: 'Riportare come confermata una vulnerabilità vista solo dallo scanner: falsi positivi e patch retroportate smentiscono il numero di versione.',
            en: 'Reporting as confirmed a vulnerability seen only by the scanner: false positives and backported patches disprove the version number.'
          },
          {
            it: 'Prioritizzare col solo CVSS, ignorando esposizione, exploit praticabile e valore dell’asset.',
            en: 'Prioritizing by CVSS alone, ignoring exposure, a practical exploit, and the value of the asset.'
          },
          {
            it: 'Fermarsi all’elenco grezzo dello scanner invece di produrre una lista verificata con rimedi concreti.',
            en: 'Stopping at the scanner’s raw list instead of producing a verified list with concrete remediation.'
          }
        ],
        references: [{ kind: 'nist', id: 'SP 800-115' }]
      },
      {
        id: 'host-network-auditing',
        title: {
          it: 'Auditing di host e rete',
          en: 'Host and network auditing'
        },
        objectives: [
          {
            it: 'Spiegare la prospettiva di auditing dell’eJPT: inventariare cosa un host e il segmento espongono, dallo stato di rete locale ai servizi raggiungibili.',
            en: 'Explain the eJPT auditing perspective: inventory what a host and the segment expose, from the local network state to the reachable services.'
          },
          {
            it: 'Collegare l’auditing al suo speculare difensivo: baseline, minima esposizione e monitoraggio dello scostamento.',
            en: 'Link auditing to its defensive mirror: baselines, least exposure and drift monitoring.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere scanning, enumerazione dei servizi e valutazione delle vulnerabilità (argomenti precedenti).',
            en: 'Know scanning, service enumeration and vulnerability assessment (previous topics).'
          }
        ],
        theory: [
          {
            it: 'Nell’eJPT il dominio Host & Network Auditing è la prospettiva di auditing: inventariare in modo sistematico cosa un host e il suo segmento espongono, dall’interno o con accesso. Su un host si legge lo stato di rete locale — tabella di routing, cache ARP, porte in ascolto, condivisioni, utenti — per capire la raggiungibilità e di chi l’host si fida; sulla rete si verifica quali servizi (SMB, FTP, SSH, HTTP, SQL) sono raggiungibili e come sono configurati.',
            en: 'In the eJPT the Host & Network Auditing domain is the auditing perspective: systematically inventory what a host and its segment expose, from the inside or with access. On a host you read the local network state — routing table, ARP cache, listening ports, shares, users — to understand reachability and who the host trusts; on the network you check which services (SMB, FTP, SSH, HTTP, SQL) are reachable and how they are configured.'
          },
          {
            it: 'L’auditing si distingue dallo scanning remoto: non è un sondaggio esterno veloce, ma una ricognizione sistematica e basata sull’evidenza, spesso da un punto d’appoggio o con credenziali, che mappa la configurazione e l’esposizione reali per produrre un quadro difendibile. Correlare ciò che ogni servizio rivela e trasferire le evidenze tra host e tester fa parte del metodo: conta la configurazione effettiva, non la sola presenza di una porta.',
            en: 'Auditing differs from remote scanning: it is not a quick external probe, but a systematic, evidence-first review, often from a foothold or with credentials, that maps the actual configuration and exposure to produce a defensible picture. Correlating what each service reveals and transferring the evidence between host and tester is part of the method: what counts is the effective configuration, not the mere presence of a port.'
          },
          {
            it: 'Lo speculare difensivo è l’audit di sicurezza con baseline: minima esposizione (chiudere porte e servizi non usati), configurazione dei servizi irrobustita, inventario e baseline di configurazione, e monitoraggio che segnala lo scostamento. Lo stesso stato di host e rete che l’auditor legge è ciò che il difensore dovrebbe già conoscere: la distanza tra i due è il rilievo. Studiare l’auditing insegna a trasformare un elenco di dati grezzi in una valutazione che indica dove ridurre l’esposizione.',
            en: 'The defensive mirror is the security audit with baselines: least exposure (close unused ports and services), hardened service configuration, inventory and configuration baselines, and monitoring that flags drift. The same host and network state the auditor reads is what the defender should already know: the gap between the two is the finding. Studying auditing teaches turning a list of raw data into an assessment that points to where exposure should be reduced.'
          }
        ],
        example: {
          it: 'Su un host in 192.0.2.0/24 l’audit legge tabella di routing, cache ARP e porte in ascolto e trova una condivisione SMB e una porta di database esposta: una baseline difensiva avrebbe chiuso la porta inutilizzata e documentato la condivisione, quindi la distanza tra stato reale e baseline è il rilievo.',
          en: 'On a host in 192.0.2.0/24 the audit reads the routing table, ARP cache and listening ports and finds an SMB share and an exposed database port: a defensive baseline would have closed the unused port and documented the share, so the gap between the real state and the baseline is the finding.'
        },
        commonMistakes: [
          {
            it: 'Confondere l’auditing con una scansione veloce: l’audit è un inventario sistematico e basato sull’evidenza della configurazione e dell’esposizione reali.',
            en: 'Confusing auditing with a quick scan: the audit is a systematic, evidence-first inventory of the real configuration and exposure.'
          },
          {
            it: 'Ignorare lo stato di rete locale dell’host (routing, ARP, porte in ascolto): rivela raggiungibilità e relazioni di fiducia.',
            en: 'Ignoring the host’s local network state (routing, ARP, listening ports): it reveals reachability and trust relationships.'
          },
          {
            it: 'Eseguire l’auditing fuori dallo scope o senza autorizzazione: resta vincolato come ogni altra attività del test.',
            en: 'Performing the auditing out of scope or without authorization: it stays bound like every other test activity.'
          }
        ],
        references: [
          { kind: 'attack', id: 'T1016' },
          { kind: 'nist', id: 'SP 800-115' }
        ]
      },
      {
        id: 'pentest-password-attacks',
        title: {
          it: 'Attacchi alle password: brute force e spraying',
          en: 'Password attacks: brute force and spraying'
        },
        objectives: [
          {
            it: 'Distinguere brute force, dizionario, credential stuffing e password spraying, e separare il caso online da quello offline.',
            en: 'Tell brute force, dictionary, credential stuffing, and password spraying apart, and separate the online case from the offline one.'
          },
          {
            it: 'Collegare ciascuna tecnica alla difesa che la contiene, spiegando perché il solo blocco dopo N tentativi non basta.',
            en: 'Link each technique to the defense that contains it, explaining why lockout after N attempts alone is not enough.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere autenticazione, hashing e la differenza tra una password memorizzata come hash e in chiaro (capitolo sui fondamenti di sicurezza).',
            en: 'Know authentication, hashing, and the difference between a password stored as a hash and in cleartext (the security-fundamentals chapter).'
          }
        ],
        theory: [
          {
            it: 'La distinzione di fondo è online contro offline. Un attacco online prova le credenziali contro un servizio vivo: è lento, visibile nei log e frenato da rate limiting e lockout. Un attacco offline lavora su hash già catturati: non ha limiti di velocità né log sul bersaglio, e la sua riuscita dipende solo dalla forza della password e dalla lentezza dell’algoritmo di hashing. Capire quale dei due si sta affrontando decide la difesa utile.',
            en: 'The underlying split is online versus offline. An online attack tries credentials against a live service: it is slow, visible in the logs, and curbed by rate limiting and lockout. An offline attack works on already captured hashes: it has no rate limit or log on the target, and its success depends only on the password strength and the slowness of the hashing algorithm. Knowing which of the two you face decides the useful defense.'
          },
          {
            it: 'Le varianti differiscono per strategia. Il brute force prova tutte le combinazioni; il dizionario usa una wordlist di password probabili; il credential stuffing riusa coppie già trapelate da altre violazioni, sfruttando il riuso delle password; il password spraying rovescia la logica e prova una sola password comune su molti account, proprio per restare sotto la soglia di lockout di ogni singolo account. Sono profili di rumore diversi, e quindi di rilevamento diverso.',
            en: 'The variants differ by strategy. Brute force tries every combination; a dictionary attack uses a wordlist of likely passwords; credential stuffing reuses pairs already leaked from other breaches, exploiting password reuse; password spraying flips the logic and tries one common password across many accounts, precisely to stay under each single account’s lockout threshold. These are different noise profiles, and therefore different detection problems.'
          },
          {
            it: 'La difesa è stratificata. Passphrase lunghe e uniche e un gestore di password tolgono valore a dizionario e stuffing; la MFA resistente al phishing rende insufficiente la sola password; un hashing lento e salato (bcrypt, scrypt, Argon2) difende il caso offline. Il lockout va tarato con cura perché punisce anche l’utente e non ferma lo spraying: per quello serve correlare i fallimenti tra account diversi, non solo per singolo account.',
            en: 'The defense is layered. Long, unique passphrases and a password manager strip value from dictionary and stuffing; phishing-resistant MFA makes the password alone insufficient; slow, salted hashing (bcrypt, scrypt, Argon2) defends the offline case. Lockout must be tuned carefully because it also punishes the user and does not stop spraying: for that you must correlate failures across different accounts, not per single account.'
          }
        ],
        example: {
          it: 'Il password spraying prova una password comune su molti nomi utente per restare sotto la soglia di lockout di ciascuno, quindi il rilevamento deve correlare i fallimenti tra account e non contarli per singolo account.',
          en: 'Password spraying tries one common password across many usernames to stay below each account’s lockout threshold, so detection must correlate failures across accounts rather than counting them per single account.'
        },
        commonMistakes: [
          {
            it: 'Affidarsi al solo lockout: il password spraying lo aggira restando sotto la soglia di ogni account.',
            en: 'Relying on lockout alone: password spraying evades it by staying under each account’s threshold.'
          },
          {
            it: 'Considerare un hash robusto sufficiente senza MFA: una password debole cade comunque offline.',
            en: 'Treating a strong hash as enough without MFA: a weak password still falls offline.'
          },
          {
            it: 'Dimenticare che il cracking offline ignora rate limiting e log: lì conta solo la lentezza dell’hashing.',
            en: 'Forgetting that offline cracking ignores rate limiting and logs: there only the slowness of hashing matters.'
          }
        ],
        references: [{ kind: 'attack', id: 'T1110' }],
        guidedLabs: [
          {
            id: 'gl-pentest-password-defense',
            title: {
              it: 'Spezza spraying e stuffing con l’identità',
              en: 'Break spraying and stuffing with identity'
            },
            difficulty: 'core',
            lab: 'identitytrust',
            scenario: {
              it: 'Il laboratorio «Identità e trust» raccoglie i controlli di identità — MFA, rate limiting, controllo delle credenziali compromesse — e i loro limiti dichiarati.',
              en: 'The “Identity and trust” lab gathers the identity controls — MFA, rate limiting, breached-credential checks — and their stated limits.'
            },
            task: {
              it: 'Associa brute force, credential stuffing e password spraying al controllo che contiene ciascuno e spiega perché il solo lockout non basta.',
              en: 'Match brute force, credential stuffing, and password spraying to the control that contains each, and explain why lockout alone is not enough.'
            },
            steps: [
              {
                it: 'Apri «Identità e trust» e individua i controlli di autenticazione e i limiti che dichiarano.',
                en: 'Open “Identity and trust” and find the authentication controls and the limits they state.'
              },
              {
                it: 'Collega il credential stuffing al riuso delle password, e la difesa a MFA e controllo delle credenziali compromesse.',
                en: 'Link credential stuffing to password reuse, and the defense to MFA and breached-credential checks.'
              },
              {
                it: 'Spiega perché il password spraying resta sotto la soglia di lockout e quale metrica lo rivela davvero.',
                en: 'Explain why password spraying stays under the lockout threshold and which metric actually reveals it.'
              }
            ],
            challenge: {
              it: 'Un attaccante prova una sola password su molti account: quale segnale lo smaschera e quale difesa lo ferma senza bloccare gli utenti legittimi?',
              en: 'An attacker tries one password across many accounts: which signal exposes it and which defense stops it without locking out legitimate users?'
            },
            solution: [
              {
                it: 'Brute force e dizionario si contrastano con passphrase forti e uniche e un hashing lento e salato; il credential stuffing con MFA e il controllo delle credenziali compromesse; il password spraying correlando i fallimenti tra account diversi e con MFA resistente al phishing. Il lockout da solo punisce gli utenti e lo spraying lo aggira restando sotto la soglia di ogni account.',
                en: 'Brute force and dictionary are countered with strong, unique passphrases and slow, salted hashing; credential stuffing with MFA and breached-credential checks; password spraying by correlating failures across different accounts and with phishing-resistant MFA. Lockout alone punishes users and spraying evades it by staying under each account’s threshold.'
              }
            ],
            selfCheck: [
              {
                it: 'So abbinare ogni attacco alle password alla difesa efficace.',
                en: 'I can match each password attack to its effective defense.'
              },
              {
                it: 'So dire perché lo spraying sfugge al lockout e come lo si rileva.',
                en: 'I can say why spraying evades lockout and how it is detected.'
              }
            ]
          }
        ]
      },
      {
        id: 'offline-hash-cracking-defense',
        title: {
          it: 'Cracking offline degli hash: modello di costo e difesa',
          en: 'Offline hash cracking: cost model and defense'
        },
        objectives: [
          {
            it: 'Spiegare perché un hash catturato è attaccabile offline e da cosa dipende il costo del cracking.',
            en: 'Explain why a captured hash is attackable offline and what the cracking cost depends on.'
          },
          {
            it: 'Collegare la difesa della memorizzazione — KDF lente, sale per-utente, pepper, fattore di lavoro — al costo che impone all’attaccante.',
            en: 'Link the storage defense — slow KDFs, per-user salt, pepper, work factor — to the cost it imposes on the attacker.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere la distinzione tra attacco online e offline e l’hashing delle password (argomento precedente e capitolo sui fondamenti di sicurezza).',
            en: 'Know the online-versus-offline distinction and password hashing (the previous topic and the security-fundamentals chapter).'
          }
        ],
        theory: [
          {
            it: 'Il cracking offline parte da un hash già catturato — da un database esfiltrato o da una cattura di rete — e lavora sulla macchina dell’attaccante, senza rate limiting né log sul bersaglio. Il metodo è sempre lo stesso: indovinare una password candidata, calcolarne l’hash con lo stesso algoritmo e confrontarlo. Il costo non è quindi un singolo tentativo ma il prodotto «numero di tentativi × costo di un hash»: ogni difesa efficace agisce su uno dei due fattori, aumentando lo spazio da provare o il costo di ogni prova.',
            en: 'Offline cracking starts from an already captured hash — from an exfiltrated database or a network capture — and works on the attacker’s machine, with no rate limiting or logging on the target. The method is always the same: guess a candidate password, compute its hash with the same algorithm, and compare. The cost is therefore not a single attempt but the product «number of attempts × cost of one hash»: every effective defense acts on one of the two factors, raising the space to try or the cost of each try.'
          },
          {
            it: 'È qui che l’algoritmo di memorizzazione decide tutto. Un hash veloce e generico come MD5 o SHA-1 nudo è nato per essere rapido: una GPU ne calcola miliardi al secondo, quindi il costo per tentativo è irrisorio. Una funzione di derivazione della chiave (KDF) lenta e progettata apposta — bcrypt, scrypt, Argon2, PBKDF2 — ha un fattore di lavoro regolabile che rende ogni hash volutamente costoso, alzando di ordini di grandezza il tempo per tentativo. Il sale, un valore casuale e per-utente concatenato alla password prima dell’hash, non rallenta il singolo calcolo ma annulla la precomputazione: rende inutili le rainbow table e fa sì che due utenti con la stessa password abbiano hash diversi, costringendo ad attaccare ogni hash separatamente. Il pepper aggiunge un segreto non memorizzato nel database (tenuto altrove, es. in un HSM) che l’attaccante con il solo dump non possiede.',
            en: 'This is where the storage algorithm decides everything. A fast, general-purpose hash such as bare MD5 or SHA-1 was built to be quick: a GPU computes billions per second, so the cost per attempt is negligible. A slow, purpose-built key derivation function (KDF) — bcrypt, scrypt, Argon2, PBKDF2 — has a tunable work factor that makes each hash deliberately expensive, raising the time per attempt by orders of magnitude. The salt, a random, per-user value concatenated to the password before hashing, does not slow the single computation but defeats precomputation: it makes rainbow tables useless and ensures two users with the same password get different hashes, forcing the attacker to attack each hash separately. The pepper adds a secret not stored in the database (kept elsewhere, e.g. in an HSM) that an attacker with only the dump does not possess.'
          },
          {
            it: 'La difesa è un budget a due fattori e nessuno dei due basta da solo. L’entropia della password amplia lo spazio dei tentativi; il fattore di lavoro della KDF alza il costo di ciascuno. Una KDF lenta non salva una password debole, che cade comunque perché lo spazio è piccolo; una password forte non salva un hash veloce e senza sale, che cade alla precomputazione. La scelta progettuale che ne segue è netta: mai memorizzare con hash veloci e senza sale, usare una KDF moderna con sale per-utente e fattore di lavoro tarato sull’hardware odierno, aggiornarlo quando l’hardware migliora e, dove possibile, aggiungere un pepper. L’attaccante investe in GPU e ASIC proprio per abbattere il costo per tentativo: è quel costo che il fattore di lavoro è progettato per difendere.',
            en: 'The defense is a two-factor budget and neither factor alone is enough. The entropy of the password widens the space of attempts; the work factor of the KDF raises the cost of each. A slow KDF does not save a weak password, which falls anyway because the space is small; a strong password does not save a fast, unsalted hash, which falls to precomputation. The design choice that follows is clear: never store with fast, unsalted hashes, use a modern KDF with a per-user salt and a work factor tuned to today’s hardware, raise it as hardware improves, and, where possible, add a pepper. The attacker invests in GPUs and ASICs precisely to drive down the cost per attempt: it is that cost the work factor is designed to defend.'
          }
        ],
        example: {
          it: 'Lo stesso database con «password123» memorizzata come MD5 nudo cade in un istante a una rainbow table; memorizzata con Argon2, sale per-utente e un fattore di lavoro tarato, costringe l’attaccante ad attaccare ogni hash separatamente e a un costo per tentativo migliaia di volte maggiore — ma «password123» resta debole, quindi serve anche l’entropia della password.',
          en: 'The same database with «password123» stored as bare MD5 falls instantly to a rainbow table; stored with Argon2, a per-user salt, and a tuned work factor, it forces the attacker to attack each hash separately and at a per-attempt cost thousands of times higher — but «password123» stays weak, so the password entropy is needed too.'
        },
        commonMistakes: [
          {
            it: 'Memorizzare le password con hash veloci e senza sale (MD5/SHA-1 nudi): una GPU li prova a miliardi al secondo.',
            en: 'Storing passwords with fast, unsalted hashes (bare MD5/SHA-1): a GPU tries them at billions per second.'
          },
          {
            it: 'Usare un sale unico o assente: senza sale per-utente le rainbow table e gli hash identici per password uguali tornano utili all’attaccante.',
            en: 'Using a single or absent salt: without a per-user salt, rainbow tables and identical hashes for equal passwords become useful to the attacker again.'
          },
          {
            it: 'Considerare la KDF lenta una licenza per password deboli, o non alzare mai il fattore di lavoro mentre l’hardware migliora.',
            en: 'Treating the slow KDF as a license for weak passwords, or never raising the work factor as hardware improves.'
          }
        ],
        references: [
          { kind: 'nist', id: 'SP 800-63B' },
          { kind: 'attack', id: 'T1110.002' }
        ]
      }
    ]
  },
  {
    id: 'web-app-pentest',
    cert: 'ejpt',
    order: 20,
    track: 'extension',
    title: {
      it: 'Penetration testing delle applicazioni web (eJPT)',
      en: 'Web application penetration testing (eJPT)'
    },
    summary: {
      it: 'Il dominio web dell’eJPT: come si studia un’applicazione dal lato del tester — HTTP e proxy di intercettazione, le classi di injection e la loro radice comune, autenticazione, sessioni e controllo degli accessi. Ogni tecnica è presentata in chiave difensiva, con la contromisura che la neutralizza e solo target di documentazione.',
      en: 'The eJPT web domain: how an application is studied from the tester’s side — HTTP and an intercepting proxy, the injection classes and their common root, authentication, sessions, and access control. Each technique is presented through a defensive lens, with the countermeasure that neutralizes it and only documentation targets.'
    },
    topics: [
      {
        id: 'web-http-proxy-mapping',
        title: {
          it: 'HTTP, mappatura dell’app e proxy di intercettazione',
          en: 'HTTP, app mapping, and the intercepting proxy'
        },
        objectives: [
          {
            it: 'Leggere una richiesta e una risposta HTTP: metodo, percorso, intestazioni, stato e cookie.',
            en: 'Read an HTTP request and response: method, path, headers, status, and cookies.'
          },
          {
            it: 'Mappare la superficie di un’applicazione web con un proxy di intercettazione, dal lato difensivo e offensivo.',
            en: 'Map a web application’s surface with an intercepting proxy, from the defensive and offensive sides.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere il livello applicativo e TLS (capitoli su DNS/web e su crittografia e TLS).',
            en: 'Know the application layer and TLS (the DNS/web and the cryptography and TLS chapters).'
          }
        ],
        theory: [
          {
            it: 'Il web parla HTTP, un protocollo testuale a richiesta e risposta. La richiesta ha un metodo (GET per leggere, POST per inviare, e poi PUT, DELETE, HEAD), un percorso, delle intestazioni e un corpo opzionale; la risposta porta un codice di stato (200 riuscito, 301 e 302 redirezione, 401 e 403 accesso negato, 404 non trovato, 500 errore del server), intestazioni e il corpo. Lo stato della sessione vive nei cookie, perché HTTP di per sé non ricorda nulla tra una richiesta e l’altra. Capire questi pezzi è il prerequisito di ogni analisi: un test web è prima di tutto lettura attenta di richieste e risposte.',
            en: 'The web speaks HTTP, a textual request–response protocol. The request has a method (GET to read, POST to send, and then PUT, DELETE, HEAD), a path, headers, and an optional body; the response carries a status code (200 success, 301 and 302 redirection, 401 and 403 access denied, 404 not found, 500 server error), headers, and the body. Session state lives in cookies, because HTTP itself remembers nothing between one request and the next. Understanding these pieces is the prerequisite of any analysis: a web test is first of all careful reading of requests and responses.'
          },
          {
            it: 'Mappare l’applicazione significa scoprirne la superficie: le pagine, i parametri, i punti in cui accetta input e i confini tra aree pubbliche e autenticate. Un proxy di intercettazione si pone tra il browser e il server e mostra — e, con autorizzazione, consente di modificare — ogni richiesta prima che parta. È lo strumento che trasforma il browser da semplice client in uno strumento di osservazione: si vedono i parametri nascosti, le intestazioni, i cookie e le risposte reali, non solo ciò che la pagina mostra. La mappatura non attacca: costruisce l’elenco dei punti che le fasi successive esamineranno.',
            en: 'Mapping the application means discovering its surface: the pages, the parameters, the points where it accepts input, and the boundaries between public and authenticated areas. An intercepting proxy sits between the browser and the server and shows — and, with authorization, lets you modify — every request before it leaves. It is the tool that turns the browser from a mere client into an observation instrument: you see the hidden parameters, the headers, the cookies, and the real responses, not just what the page displays. Mapping does not attack: it builds the list of points that the later phases will examine.'
          },
          {
            it: 'Dal lato difensivo, la stessa visibilità guida l’hardening. Le intestazioni di sicurezza della risposta — per esempio quelle che impongono HTTPS, limitano l’inclusione in frame o restringono le sorgenti di script — riducono intere classi di attacco. I log del server registrano metodi insoliti, raffiche verso percorsi inesistenti e codici 401 o 403 ripetuti, che sono la firma di una mappatura attiva. Ridurre la superficie — rimuovere endpoint dimenticati, non esporre parametri di debug — vale più di qualunque filtro aggiunto dopo. Conoscere ciò che un proxy rivela è il modo diretto per decidere cosa non lasciare esposto.',
            en: 'On the defensive side, the same visibility guides hardening. The response security headers — for example those that enforce HTTPS, limit framing, or restrict script sources — cut whole classes of attack. Server logs record unusual methods, bursts toward nonexistent paths, and repeated 401 or 403 codes, which are the signature of active mapping. Reducing the surface — removing forgotten endpoints, not exposing debug parameters — is worth more than any filter added afterward. Knowing what a proxy reveals is the direct way to decide what not to leave exposed.'
          }
        ],
        example: {
          it: 'Su example.test un proxy mostra una richiesta GET con un parametro nascosto e una risposta 200 che imposta un cookie di sessione; lo stesso tracciato, dal lato difensivo, rivela quali intestazioni di sicurezza mancano e quali 404 ripetuti segnalano una mappatura in corso.',
          en: 'On example.test a proxy shows a GET request with a hidden parameter and a 200 response that sets a session cookie; the same trace, from the defensive side, reveals which security headers are missing and which repeated 404 responses signal mapping in progress.'
        },
        commonMistakes: [
          {
            it: 'Fidarsi di ciò che mostra la pagina: parametri e cookie reali si vedono nel proxy, non nel contenuto reso.',
            en: 'Trusting what the page shows: the real parameters and cookies are seen in the proxy, not in the rendered content.'
          },
          {
            it: 'Ignorare i codici di stato: un 403 o un 500 raccontano del confine di accesso o di un errore più di una pagina «vuota».',
            en: 'Ignoring the status codes: a 403 or a 500 tells of the access boundary or an error more than an «empty» page does.'
          },
          {
            it: 'Trattare HTTP come senza stato dimenticando i cookie: la sessione vive lì, ed è lì che va protetta.',
            en: 'Treating HTTP as stateless while forgetting cookies: the session lives there, and that is where it must be protected.'
          }
        ],
        lab: 'applicationsecurity',
        references: [{ kind: 'attack', id: 'T1595' }],
        guidedLabs: [
          {
            id: 'gl-web-map-surface',
            title: {
              it: 'Mappa la superficie da richieste e risposte',
              en: 'Map the surface from requests and responses'
            },
            difficulty: 'core',
            lab: 'applicationsecurity',
            scenario: {
              it: 'Il laboratorio «DNS, web e applicazioni» mette in scena il percorso di una richiesta e le evidenze che lascia: la stessa vista con cui un tester mappa un’app.',
              en: 'The “DNS, web, and applications” lab stages a request’s path and the evidence it leaves: the same view a tester uses to map an app.'
            },
            task: {
              it: 'Da una richiesta e dalla sua risposta ricava metodo, punti di input e stato della sessione, e indica quale intestazione di sicurezza mancante noteresti dal lato difensivo.',
              en: 'From a request and its response derive the method, the input points, and the session state, and point out which missing security header you would notice from the defensive side.'
            },
            steps: [
              {
                it: 'Apri «DNS, web e applicazioni» e segui una richiesta applicativa fino alla risposta.',
                en: 'Open “DNS, web, and applications” and follow an application request to its response.'
              },
              {
                it: 'Annota metodo, percorso, parametri e il cookie di sessione impostato dalla risposta.',
                en: 'Note the method, path, parameters, and the session cookie set by the response.'
              },
              {
                it: 'Indica quale intestazione di sicurezza, se assente, amplierebbe la superficie di attacco.',
                en: 'Point out which security header, if absent, would widen the attack surface.'
              }
            ],
            challenge: {
              it: 'Due endpoint restituiscono lo stesso contenuto ma codici di stato diversi: cosa ti dice sul confine di accesso e su quale merita attenzione?',
              en: 'Two endpoints return the same content but different status codes: what does that tell you about the access boundary and which one deserves attention?'
            },
            solution: [
              {
                it: 'Una richiesta rivela il metodo e i punti di input (percorso, parametri, corpo); la risposta rivela lo stato e il cookie di sessione, dove vive la continuità tra richieste. Dal lato difensivo, l’assenza di intestazioni che impongono HTTPS o restringono le sorgenti di script allarga la superficie: un cookie di sessione senza i suoi attributi di protezione è esposto a furto e a invio in chiaro.',
                en: 'A request reveals the method and the input points (path, parameters, body); the response reveals the status and the session cookie, where continuity between requests lives. On the defensive side, the absence of headers that enforce HTTPS or restrict script sources widens the surface: a session cookie without its protection attributes is exposed to theft and to being sent in the clear.'
              },
              {
                it: 'Sfida: stesso contenuto con codici diversi indica che il confine di accesso sta nello stato, non nella pagina — per esempio 200 per l’utente autenticato e 403 per l’anonimo; merita attenzione l’endpoint che a volte risponde 200 senza che l’identità lo giustifichi, perché è il sintomo di un controllo degli accessi debole.',
                en: 'Challenge: the same content with different codes indicates that the access boundary is in the state, not in the page — for example 200 for the authenticated user and 403 for the anonymous one; the endpoint that sometimes answers 200 without the identity justifying it deserves attention, because it is the symptom of a weak access control.'
              }
            ],
            selfCheck: [
              {
                it: 'So leggere metodo, stato, intestazioni e cookie di una coppia richiesta/risposta.',
                en: 'I can read the method, status, headers, and cookies of a request/response pair.'
              },
              {
                it: 'So dire quali intestazioni di sicurezza e quali log riducono o rivelano la mappatura.',
                en: 'I can say which security headers and which logs reduce or reveal mapping.'
              }
            ]
          }
        ]
      },
      {
        id: 'web-enumeration',
        title: {
          it: 'Enumerazione dell’applicazione web',
          en: 'Web application enumeration'
        },
        objectives: [
          {
            it: 'Spiegare come si scopre la superficie reale di un’applicazione web — contenuti nascosti, virtual host, stack tecnologico — oltre a ciò che è linkato.',
            en: 'Explain how the real surface of a web application is discovered — hidden content, virtual hosts, technology stack — beyond what is linked.'
          },
          {
            it: 'Collegare l’enumerazione alle difese (nessuna sicurezza per oscurità, igiene dei file, errori generici) e alla sua firma nei log.',
            en: 'Link enumeration to the defenses (no security by obscurity, file hygiene, generic errors) and to its signature in the logs.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere HTTP e la mappatura dell’applicazione con un proxy di intercettazione (argomento precedente).',
            en: 'Know HTTP and mapping the application with an intercepting proxy (previous topic).'
          }
        ],
        theory: [
          {
            it: 'Nel dominio Web Application Penetration Testing dell’eJPT, dopo aver capito HTTP, l’enumerazione scopre attivamente la superficie reale dell’applicazione: directory e file non collegati da nessuna pagina (content discovery con wordlist), i virtual host serviti sullo stesso IP (variando l’header Host) e lo stack tecnologico (server, framework, versioni) dedotto da header, pagine d’errore e cookie. Trasforma «un web server risponde» in «esistono questi endpoint e queste tecnologie».',
            en: 'In the eJPT Web Application Penetration Testing domain, after understanding HTTP, enumeration actively discovers the real surface of the application: directories and files linked from no page (content discovery with wordlists), the virtual hosts served on the same IP (by varying the Host header), and the technology stack (server, framework, versions) inferred from headers, error pages and cookies. It turns «a web server responds» into «these endpoints and technologies exist».'
          },
          {
            it: 'L’applicazione lascia indizi: robots.txt e sitemap.xml elencano percorsi (a volte proprio quelli che si volevano nascondere), pagine di default o di amministrazione, file di backup dimenticati (.bak, copie con la tilde), errori verbosi che rivelano stack e percorsi, nomi prevedibili. Ogni endpoint scoperto allarga ciò che gli attacchi successivi — injection, autenticazione, inclusione di file — possono prendere di mira: la qualità dell’enumerazione decide se quei tentativi sono alla cieca o mirati.',
            en: 'The application leaks clues: robots.txt and sitemap.xml list paths (sometimes exactly the ones meant to be hidden), default or administration pages, forgotten backup files (.bak, tilde copies), verbose errors that reveal stack and paths, predictable names. Every discovered endpoint widens what later attacks — injection, authentication, file inclusion — can target: the quality of the enumeration decides whether those attempts are blind or aimed.'
          },
          {
            it: 'La difesa parte da un principio: non affidare la sicurezza al fatto che un URL non sia linkato (la sicurezza per oscurità cade davanti a una wordlist). Rimuovere file di default e di backup, sopprimere banner di versione ed errori verbosi, richiedere autenticazione sulle pagine di amministrazione e osservare i log: la content discovery è una raffica di 404 verso percorsi indovinati, una firma riconoscibile. Segmentazione e WAF riducono l’esposizione, ma non sostituiscono l’igiene dell’applicazione.',
            en: 'The defense starts from a principle: do not rest security on a URL not being linked (security by obscurity falls to a wordlist). Remove default and backup files, suppress version banners and verbose errors, require authentication on administration pages, and watch the logs: content discovery is a burst of 404 responses toward guessed paths, a recognizable signature. Segmentation and a WAF reduce exposure, but do not replace application hygiene.'
          }
        ],
        example: {
          it: 'Scansionando un host in 192.0.2.0/24, la content discovery trova un percorso /admin non collegato e un file config.bak dimenticato: il rimedio è rimuovere il backup, autenticare /admin e rendere generici gli errori, mentre la raffica di 404 resta visibile nei log.',
          en: 'Scanning a host in 192.0.2.0/24, content discovery finds an unlinked /admin path and a forgotten config.bak file: the fix is to remove the backup, authenticate /admin and make errors generic, while the burst of 404 responses stays visible in the logs.'
        },
        commonMistakes: [
          {
            it: 'Affidarsi a un URL non linkato come protezione: una wordlist lo trova comunque (sicurezza per oscurità).',
            en: 'Relying on an unlinked URL as protection: a wordlist finds it anyway (security by obscurity).'
          },
          {
            it: 'Lasciare file di default e di backup e abilitare errori verbosi: regalano percorsi, versioni e stack all’enumerazione.',
            en: 'Leaving default and backup files and enabling verbose errors: they hand paths, versions and stack to the enumeration.'
          },
          {
            it: 'Scambiare un 200 su un percorso scoperto per una vulnerabilità: è superficie, non ancora un difetto verificato.',
            en: 'Mistaking a 200 on a discovered path for a vulnerability: it is surface, not yet a verified flaw.'
          }
        ],
        references: [
          { kind: 'attack', id: 'T1595' },
          { kind: 'attack', id: 'T1595.003' }
        ]
      },
      {
        id: 'web-injection-classes',
        title: {
          it: 'Injection: SQL, XSS e comandi, una radice comune',
          en: 'Injection: SQL, XSS, and commands, one common root'
        },
        objectives: [
          {
            it: 'Riconoscere SQLi, XSS, command injection e path traversal come varianti di un unico difetto.',
            en: 'Recognize SQLi, XSS, command injection, and path traversal as variants of a single flaw.'
          },
          {
            it: 'Spiegare la difesa strutturale di ciascuna classe senza affidarsi al solo filtraggio.',
            en: 'Explain the structural defense of each class without relying on filtering alone.'
          }
        ],
        prerequisites: [
          {
            it: 'Aver mappato un’applicazione e individuato i suoi punti di input (argomento precedente).',
            en: 'Have mapped an application and found its input points (previous topic).'
          }
        ],
        theory: [
          {
            it: 'Le injection hanno tutte la stessa radice: un input dell’utente raggiunge un interprete e ne cambia il significato invece di restare un semplice dato. Nella SQL injection l’input entra in una query e ne altera la logica; nel cross-site scripting (XSS) l’input viene reso come markup nel browser di un’altra vittima ed esegue script nel suo contesto; nella command injection l’input finisce in un comando di sistema; nel path traversal l’input manipola un percorso di file per uscire dalla cartella prevista. Nomi diversi, stesso schema: il confine tra dato e istruzione non è stato mantenuto.',
            en: 'Injections all share the same root: a user input reaches an interpreter and changes its meaning instead of remaining mere data. In SQL injection the input enters a query and alters its logic; in cross-site scripting (XSS) the input is rendered as markup in another victim’s browser and runs script in their context; in command injection the input ends up in a system command; in path traversal the input manipulates a file path to escape the intended folder. Different names, same pattern: the boundary between data and instruction was not kept.'
          },
          {
            it: 'Poiché la radice è comune, lo è anche la difesa di fondo: separare i dati dalle istruzioni alla fonte. Per la SQL injection la difesa strutturale sono le query parametrizzate, che spediscono la logica e i dati su canali distinti, così l’input non può diventare codice. Per l’XSS è la codifica in uscita nel contesto giusto (HTML, attributo, JavaScript) più una policy che limita le sorgenti di script. Per la command injection è evitare la shell e passare argomenti separati; per il path traversal è normalizzare e confinare il percorso a una radice consentita. La validazione dell’input aiuta, ma da sola non basta: è un filtro, non il confine.',
            en: 'Because the root is common, so is the underlying defense: separate data from instructions at the source. For SQL injection the structural defense is parameterized queries, which send logic and data on separate channels, so the input cannot become code. For XSS it is output encoding in the right context (HTML, attribute, JavaScript) plus a policy that limits script sources. For command injection it is avoiding the shell and passing separated arguments; for path traversal it is normalizing and confining the path to an allowed root. Input validation helps, but alone it is not enough: it is a filter, not the boundary.'
          },
          {
            it: 'Dal lato del test, riconoscere la classe guida l’evidenza da cercare e il rischio da riportare, senza bisogno di sferrare un attacco reale: un parametro che cambia il numero di risultati suggerisce SQL injection, un valore che riappare non codificato nella pagina suggerisce XSS. Dal lato della difesa, le stesse osservazioni diventano test di regressione e regole di rilevamento. Il valore del lavoro non è «rompere» l’app, ma dimostrare dove il confine dato/istruzione manca e indicare la correzione strutturale: è questo che rende un report utile allo sviluppatore.',
            en: 'On the testing side, recognizing the class guides the evidence to look for and the risk to report, without needing to launch a real attack: a parameter that changes the number of results suggests SQL injection, a value that reappears unencoded in the page suggests XSS. On the defensive side, the same observations become regression tests and detection rules. The value of the work is not «breaking» the app, but showing where the data/instruction boundary is missing and stating the structural fix: that is what makes a report useful to the developer.'
          }
        ],
        example: {
          it: 'Su example.test un campo di ricerca che cambia il numero di risultati a seconda di caratteri speciali segnala un confine dato/istruzione debole verso il database; la correzione non è filtrare quei caratteri ma usare query parametrizzate, e il test diventa una regressione permanente.',
          en: 'On example.test a search field that changes the number of results depending on special characters signals a weak data/instruction boundary toward the database; the fix is not to filter those characters but to use parameterized queries, and the test becomes a permanent regression.'
        },
        commonMistakes: [
          {
            it: 'Trattare le injection come problemi separati: condividono la radice, quindi condividono la difesa strutturale.',
            en: 'Treating injections as separate problems: they share the root, so they share the structural defense.'
          },
          {
            it: 'Affidarsi alla sola blocklist di caratteri: un filtro si aggira, mentre separare dati e istruzioni chiude la classe.',
            en: 'Relying on a character blocklist alone: a filter is bypassed, while separating data and instructions closes the class.'
          },
          {
            it: 'Confondere la validazione dell’input con la codifica in uscita: servono entrambe, in punti diversi del flusso.',
            en: 'Confusing input validation with output encoding: both are needed, at different points of the flow.'
          }
        ],
        lab: 'applicationsecurity',
        references: [{ kind: 'attack', id: 'T1190' }],
        guidedLabs: [
          {
            id: 'gl-web-injection-root',
            title: {
              it: 'Risali alla radice comune delle injection',
              en: 'Trace injections to their common root'
            },
            difficulty: 'advanced',
            lab: 'applicationsecurity',
            scenario: {
              it: 'Il laboratorio «DNS, web e applicazioni» mostra scenari in cui un input non fidato attraversa l’applicazione: il terreno in cui nascono le injection.',
              en: 'The “DNS, web, and applications” lab shows scenarios where an untrusted input crosses the application: the ground where injections arise.'
            },
            task: {
              it: 'Per due scenari diversi indica a quale interprete arriva l’input e quale difesa strutturale chiude la classe, senza usare alcun payload.',
              en: 'For two different scenarios state which interpreter the input reaches and which structural defense closes the class, without using any payload.'
            },
            steps: [
              {
                it: 'Apri «DNS, web e applicazioni» e scegli uno scenario con input dell’utente.',
                en: 'Open “DNS, web, and applications” and pick a scenario with user input.'
              },
              {
                it: 'Individua l’interprete di destinazione (database, browser, shell, file system).',
                en: 'Identify the destination interpreter (database, browser, shell, file system).'
              },
              {
                it: 'Associa la difesa strutturale corretta e di’ perché il solo filtro non basta.',
                en: 'Match the correct structural defense and say why filtering alone is not enough.'
              }
            ],
            challenge: {
              it: 'Se un input compare sia in una query sia nella pagina resa, quali due difese servono e in quali punti distinti del flusso agiscono?',
              en: 'If an input appears both in a query and in the rendered page, which two defenses are needed and at which distinct points of the flow do they act?'
            },
            solution: [
              {
                it: 'In ogni injection l’input raggiunge un interprete e ne cambia il significato: verso il database è SQL injection (difesa: query parametrizzate), verso il browser è XSS (difesa: codifica in uscita più restrizione delle sorgenti di script), verso la shell è command injection (difesa: niente shell, argomenti separati), verso il file system è path traversal (difesa: normalizzazione e radice consentita). Il filtro è aggirabile; separare dati e istruzioni alla fonte chiude la classe.',
                en: 'In every injection the input reaches an interpreter and changes its meaning: toward the database it is SQL injection (defense: parameterized queries), toward the browser it is XSS (defense: output encoding plus restriction of script sources), toward the shell it is command injection (defense: no shell, separated arguments), toward the file system it is path traversal (defense: normalization and an allowed root). The filter is bypassable; separating data and instructions at the source closes the class.'
              },
              {
                it: 'Sfida: un input che compare in una query e nella pagina richiede due difese in punti diversi — query parametrizzate dove entra nel database e codifica in uscita dove viene reso nel browser — perché proteggono interpreti diversi in momenti diversi del flusso.',
                en: 'Challenge: an input that appears in a query and in the page requires two defenses at different points — parameterized queries where it enters the database and output encoding where it is rendered in the browser — because they protect different interpreters at different moments of the flow.'
              }
            ],
            selfCheck: [
              {
                it: 'So ricondurre SQLi, XSS, command injection e path traversal alla stessa radice.',
                en: 'I can trace SQLi, XSS, command injection, and path traversal to the same root.'
              },
              {
                it: 'So indicare la difesa strutturale di ciascuna classe e perché il filtro non basta.',
                en: 'I can state the structural defense of each class and why filtering is not enough.'
              }
            ]
          }
        ]
      },
      {
        id: 'web-auth-session-access',
        title: {
          it: 'Autenticazione, sessioni e controllo degli accessi',
          en: 'Authentication, sessions, and access control'
        },
        objectives: [
          {
            it: 'Distinguere i difetti di autenticazione, di gestione della sessione e di controllo degli accessi.',
            en: 'Distinguish authentication, session management, and access control flaws.'
          },
          {
            it: 'Collegare ogni difetto alla sua difesa: credenziali robuste, cookie protetti, autorizzazione lato server.',
            en: 'Link each flaw to its defense: strong credentials, protected cookies, server-side authorization.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere i cookie di sessione e il modello di accesso (argomenti precedenti e capitolo su AAA).',
            en: 'Know session cookies and the access model (previous topics and the AAA chapter).'
          }
        ],
        theory: [
          {
            it: 'Tre difetti vicini ma distinti riguardano l’identità. L’autenticazione risponde a «chi sei»: è debole quando ammette credenziali facili, non limita i tentativi o espone messaggi che rivelano se un’utenza esiste, aprendo al brute force. La gestione della sessione risponde a «sei ancora tu»: il cookie che rappresenta la sessione va protetto con gli attributi che ne impediscono l’invio in chiaro e la lettura da script, e va rigenerato al login per evitare la session fixation. Confondere i due porta a difendere l’uno e lasciare scoperto l’altro.',
            en: 'Three close but distinct flaws concern identity. Authentication answers «who are you»: it is weak when it allows easy credentials, does not limit attempts, or exposes messages that reveal whether an account exists, opening the door to brute force. Session management answers «are you still you»: the cookie that represents the session must be protected with the attributes that prevent its transmission in the clear and its reading by script, and it must be regenerated at login to avoid session fixation. Confusing the two leads to defending one and leaving the other exposed.'
          },
          {
            it: 'Il controllo degli accessi risponde a «puoi farlo»: decide se l’identità autenticata è autorizzata a quella risorsa o azione. È qui che nasce l’IDOR (Insecure Direct Object Reference), quando cambiando un identificatore nella richiesta si raggiunge il dato di un altro utente perché il server si fida del parametro invece di verificare il permesso; e l’escalation di privilegi, quando un utente ordinario raggiunge funzioni amministrative. La regola è che l’autorizzazione va decisa lato server a ogni richiesta, non dedotta da ciò che l’interfaccia mostra o nasconde al client.',
            en: 'Access control answers «may you do it»: it decides whether the authenticated identity is authorized for that resource or action. This is where IDOR (Insecure Direct Object Reference) arises, when changing an identifier in the request reaches another user’s data because the server trusts the parameter instead of checking the permission; and privilege escalation, when an ordinary user reaches administrative functions. The rule is that authorization must be decided server-side on every request, not inferred from what the interface shows or hides on the client.'
          },
          {
            it: 'Dal lato del test queste debolezze si dimostrano con osservazioni mirate e autorizzate — un identificatore che, cambiato, restituisce dati altrui; una sessione che resta valida dopo il logout — non con furti reali di account. Dal lato della difesa le contromisure sono nette: credenziali robuste con limitazione dei tentativi e messaggi d’errore uniformi; cookie con i loro attributi di protezione e rigenerati al login; autorizzazione verificata lato server per ogni oggetto e ogni azione. Un report che lega ciascun difetto alla sua difesa trasforma la prova in una correzione verificabile.',
            en: 'On the testing side these weaknesses are shown with targeted, authorized observations — an identifier that, when changed, returns someone else’s data; a session that stays valid after logout — not with real account theft. On the defensive side the countermeasures are clear-cut: strong credentials with attempt limiting and uniform error messages; cookies with their protection attributes and regenerated at login; authorization verified server-side for every object and every action. A report that links each flaw to its defense turns the proof into a verifiable fix.'
          }
        ],
        example: {
          it: 'Su example.test una richiesta con un identificatore di oggetto che, incrementato, restituisce il record di un altro utente dimostra un IDOR; la difesa non è nascondere l’identificatore ma verificare lato server, a ogni richiesta, che l’utente autenticato sia autorizzato a quel record.',
          en: 'On example.test a request with an object identifier that, when incremented, returns another user’s record demonstrates an IDOR; the defense is not to hide the identifier but to verify server-side, on every request, that the authenticated user is authorized for that record.'
        },
        commonMistakes: [
          {
            it: 'Confondere autenticazione e autorizzazione: provare «chi sei» non prova «puoi farlo»; servono controlli distinti.',
            en: 'Confusing authentication and authorization: proving «who you are» does not prove «you may do it»; distinct checks are needed.'
          },
          {
            it: 'Affidare il controllo degli accessi al client: nascondere un pulsante non protegge la risorsa, che va autorizzata lato server.',
            en: 'Entrusting access control to the client: hiding a button does not protect the resource, which must be authorized server-side.'
          },
          {
            it: 'Non rigenerare la sessione al login: lasciare valido il vecchio identificatore apre alla session fixation.',
            en: 'Not regenerating the session at login: leaving the old identifier valid opens the door to session fixation.'
          }
        ],
        lab: 'applicationsecurity',
        references: [{ kind: 'attack', id: 'T1078' }],
        guidedLabs: [
          {
            id: 'gl-web-access-boundary',
            title: {
              it: 'Prova il confine dell’autorizzazione',
              en: 'Test the authorization boundary'
            },
            difficulty: 'advanced',
            lab: 'applicationsecurity',
            scenario: {
              it: 'Il laboratorio «DNS, web e applicazioni» mostra richieste autenticate e il loro esito: il terreno in cui si vede se l’autorizzazione è decisa lato server.',
              en: 'The “DNS, web, and applications” lab shows authenticated requests and their outcome: the ground where you see whether authorization is decided server-side.'
            },
            task: {
              it: 'Distingui, su due richieste, un difetto di autenticazione, uno di sessione e uno di controllo degli accessi, e associa a ciascuno la difesa corretta.',
              en: 'On two requests, tell an authentication flaw, a session flaw, and an access-control flaw apart, and match each to the correct defense.'
            },
            steps: [
              {
                it: 'Apri «DNS, web e applicazioni» e osserva una richiesta autenticata con il suo cookie.',
                en: 'Open “DNS, web, and applications” and observe an authenticated request with its cookie.'
              },
              {
                it: 'Cambia (concettualmente) un identificatore di oggetto e ragiona su cosa dovrebbe rispondere il server.',
                en: 'Change (conceptually) an object identifier and reason about what the server should answer.'
              },
              {
                it: 'Associa a ciò che osservi la difesa: credenziali, attributi del cookie o autorizzazione lato server.',
                en: 'Match what you observe to the defense: credentials, cookie attributes, or server-side authorization.'
              }
            ],
            challenge: {
              it: 'Una sessione resta valida dopo il logout: è un difetto di autenticazione, di sessione o di controllo degli accessi, e come lo correggi?',
              en: 'A session stays valid after logout: is it an authentication, a session, or an access-control flaw, and how do you fix it?'
            },
            solution: [
              {
                it: 'L’autenticazione debole si vede nei tentativi non limitati e nei messaggi che rivelano le utenze (difesa: credenziali robuste, limitazione, errori uniformi). Il difetto di sessione si vede in un cookie senza attributi di protezione o non rigenerato al login (difesa: attributi del cookie e rigenerazione). Il controllo degli accessi fallisce quando un identificatore cambiato restituisce dati altrui (difesa: autorizzazione lato server a ogni richiesta). Sono livelli distinti e ognuno ha la sua contromisura.',
                en: 'Weak authentication shows in unlimited attempts and in messages that reveal accounts (defense: strong credentials, limiting, uniform errors). The session flaw shows in a cookie without protection attributes or not regenerated at login (defense: cookie attributes and regeneration). Access control fails when a changed identifier returns someone else’s data (defense: server-side authorization on every request). They are distinct layers and each has its own countermeasure.'
              },
              {
                it: 'Sfida: una sessione valida dopo il logout è un difetto di gestione della sessione; si corregge invalidando il token lato server al logout e rigenerandolo al login, così il vecchio identificatore non vale più.',
                en: 'Challenge: a session valid after logout is a session-management flaw; you fix it by invalidating the token server-side at logout and regenerating it at login, so the old identifier is no longer valid.'
              }
            ],
            selfCheck: [
              {
                it: 'So distinguere difetti di autenticazione, sessione e controllo degli accessi.',
                en: 'I can distinguish authentication, session, and access-control flaws.'
              },
              {
                it: 'So associare a ciascuno la difesa e perché l’autorizzazione va decisa lato server.',
                en: 'I can match each to its defense and why authorization must be decided server-side.'
              }
            ]
          }
        ]
      },
      {
        id: 'web-file-inclusion-traversal',
        title: {
          it: 'Inclusione di file e directory traversal (LFI/RFI)',
          en: 'File inclusion and directory traversal (LFI/RFI)'
        },
        objectives: [
          {
            it: 'Spiegare directory traversal, LFI e RFI e la causa comune: un percorso o un include costruito da input non validato.',
            en: 'Explain directory traversal, LFI, and RFI and their common root cause: a path or include built from unvalidated input.'
          },
          {
            it: 'Collegare ogni difetto alla difesa, distinguendo il blocco della sequenza letterale dalla validazione del percorso risolto.',
            en: 'Link each flaw to its defense, distinguishing blocking the literal sequence from validating the resolved path.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere il modello richiesta/risposta HTTP e come un parametro arriva dal client al server (capitolo sul proxy e la mappatura web).',
            en: 'Know the HTTP request/response model and how a parameter travels from client to server (the web proxy and mapping chapter).'
          }
        ],
        theory: [
          {
            it: 'Il directory traversal (o path traversal) nasce quando l’applicazione costruisce il percorso di un file da input dell’utente: sequenze relative risalgono fuori dalla cartella prevista e leggono file altrove sul server, fino a file di sistema come quello delle password. La radice è la concatenazione di percorso non validata, non il singolo carattere: bloccare la sequenza letterale non basta, perché le codifiche la aggirano.',
            en: 'Directory traversal (or path traversal) arises when the application builds a file path from user input: relative sequences climb out of the intended folder and read files elsewhere on the server, up to system files such as the password file. The root cause is unvalidated path concatenation, not the single character: blocking the literal sequence is not enough, because encodings bypass it.'
          },
          {
            it: 'La File Inclusion è lo stesso difetto applicato all’include. La LFI (locale) fa includere un file già presente sul server — configurazioni o log — e può arrivare all’esecuzione di codice quando l’attaccante riesce a influenzare il contenuto incluso, per esempio avvelenando un log poi incluso. La RFI (remota) include una URL esterna ed è ormai rara perché gli include remoti sono disabilitati di default nelle piattaforme moderne.',
            en: 'File Inclusion is the same flaw applied to the include. LFI (local) includes a file already on the server — configuration or logs — and can reach code execution when the attacker can influence the included content, for example by poisoning a log that is then included. RFI (remote) includes an external URL and is now rare because remote includes are disabled by default on modern platforms.'
          },
          {
            it: 'La difesa è architetturale, non cosmetica. Non si deve mai derivare il bersaglio di un include o di una lettura di file dall’input grezzo: si mappa un allowlist fisso di identificatori lato server, così l’utente sceglie una voce, non un percorso. Dove serve un percorso, si canonicalizza e si verifica che resti sotto la directory di base, e si esegue il processo con privilegio minimo per limitare cosa un traversal riuscito possa leggere.',
            en: 'The defense is architectural, not cosmetic. You must never derive the target of an include or a file read from raw input: map a fixed allowlist of identifiers server-side, so the user picks an entry, not a path. Where a path is unavoidable, canonicalize it and verify it stays under the base directory, and run the process with least privilege to limit what a successful traversal can read.'
          }
        ],
        example: {
          it: 'Un parametro che seleziona una pagina per percorso, se alimentato con sequenze relative, risale sopra la web root e legge file di sistema; la correzione mappa quel parametro su un allowlist di pagine, non su un percorso del filesystem.',
          en: 'A parameter that selects a page by path, when fed relative sequences, climbs above the web root and reads system files; the fix maps that parameter to an allowlist of pages, not to a filesystem path.'
        },
        commonMistakes: [
          {
            it: 'Bloccare solo la sequenza letterale: le codifiche e i percorsi assoluti la aggirano.',
            en: 'Blocking only the literal sequence: encodings and absolute paths bypass it.'
          },
          {
            it: 'Credere che la RFI sia il rischio principale: oggi la LFI con avvelenamento dei log è la via più comune.',
            en: 'Believing RFI is the main risk: today LFI with log poisoning is the more common path.'
          },
          {
            it: 'Fidarsi dell’estensione o del nome del file invece di validare il percorso risolto lato server.',
            en: 'Trusting the file extension or name instead of validating the resolved path server-side.'
          }
        ],
        references: [{ kind: 'attack', id: 'T1190' }],
        guidedLabs: [
          {
            id: 'gl-web-inclusion-defense',
            title: {
              it: 'Neutralizza inclusione e traversal con un allowlist',
              en: 'Neutralize inclusion and traversal with an allowlist'
            },
            difficulty: 'core',
            lab: 'applicationsecurity',
            scenario: {
              it: 'Il laboratorio «Sicurezza applicativa» raccoglie i difetti web lato applicazione e le relative difese.',
              en: 'The “Application security” lab gathers application-side web flaws and their defenses.'
            },
            task: {
              it: 'Spiega la causa comune di LFI/RFI e directory traversal e perché la correzione è un allowlist lato server, non il blocco della sequenza.',
              en: 'Explain the common cause of LFI/RFI and directory traversal and why the fix is a server-side allowlist, not blocking the sequence.'
            },
            steps: [
              {
                it: 'Apri «Sicurezza applicativa» e individua i difetti legati all’input non validato.',
                en: 'Open “Application security” and find the flaws tied to unvalidated input.'
              },
              {
                it: 'Collega directory traversal, LFI e RFI alla stessa causa: un percorso o un include costruito dall’input.',
                en: 'Link directory traversal, LFI, and RFI to the same cause: a path or include built from input.'
              },
              {
                it: 'Indica perché bloccare la sola sequenza di risalita non basta e cosa la aggira.',
                en: 'Point out why blocking only the traversal sequence is not enough and what bypasses it.'
              }
            ],
            challenge: {
              it: 'Il filtro blocca la sequenza di risalita ma l’attacco riesce lo stesso: cosa l’ha aggirato e qual è la correzione definitiva?',
              en: 'The filter blocks the traversal sequence but the attack still works: what bypassed it and what is the definitive fix?'
            },
            solution: [
              {
                it: 'Le codifiche (percent-encoding, doppia codifica) e i percorsi assoluti aggirano il blocco letterale della sequenza. La correzione definitiva è non derivare mai il bersaglio dall’input: un allowlist di identificatori mappati lato server, più la canonicalizzazione del percorso risolto con verifica che resti sotto la directory di base, e privilegio minimo sul processo.',
                en: 'Encodings (percent-encoding, double encoding) and absolute paths bypass the literal sequence block. The definitive fix is to never derive the target from input: a server-side allowlist of mapped identifiers, plus canonicalizing the resolved path with a check that it stays under the base directory, and least privilege on the process.'
              }
            ],
            selfCheck: [
              {
                it: 'So spiegare la causa comune di LFI/RFI e directory traversal.',
                en: 'I can explain the common cause of LFI/RFI and directory traversal.'
              },
              {
                it: 'So dire perché l’allowlist lato server è la difesa, non il blocco della sequenza.',
                en: 'I can say why a server-side allowlist is the defense, not blocking the sequence.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'exploitation-post-exploitation',
    cert: 'ejpt',
    order: 21,
    track: 'extension',
    title: {
      it: 'Exploitation e post-exploitation (eJPT)',
      en: 'Exploitation and post-exploitation (eJPT)'
    },
    summary: {
      it: 'La parte centrale del penetration testing di host e rete: trasformare una debolezza confermata in accesso, poi misurare l’impatto reale con l’escalation dei privilegi, il movimento laterale e il pivoting. Tutto in chiave concettuale e difensiva — nessun comando operativo — con il controllo che spezza ogni fase e solo target di documentazione.',
      en: 'The core of host and network penetration testing: turning a confirmed weakness into access, then measuring the real impact with privilege escalation, lateral movement, and pivoting. All conceptual and defense-oriented — no operational commands — with the control that breaks each phase and only documentation targets.'
    },
    topics: [
      {
        id: 'exploitation-concepts',
        title: {
          it: 'Dall’enumerazione all’exploitation',
          en: 'From enumeration to exploitation'
        },
        objectives: [
          {
            it: 'Distinguere exploit e payload e spiegare perché l’exploitation verifica, non presume.',
            en: 'Distinguish exploit and payload and explain why exploitation verifies, it does not assume.'
          },
          {
            it: 'Collegare ogni exploitation a un’evidenza e alla difesa che la previene o la rileva.',
            en: 'Link every exploitation to an evidence and to the defense that prevents or detects it.'
          }
        ],
        prerequisites: [
          {
            it: 'Aver enumerato servizi e versioni e ipotizzato una debolezza (capitoli sullo scanning e sul web).',
            en: 'Have enumerated services and versions and hypothesized a weakness (the scanning and web chapters).'
          }
        ],
        theory: [
          {
            it: 'L’exploitation è il momento in cui una debolezza ipotizzata viene verificata trasformandola in accesso. Conviene separare due concetti: l’exploit è la tecnica che sfrutta un difetto specifico; il payload è ciò che viene eseguito una volta che l’exploit ha funzionato — per esempio l’apertura di una sessione di controllo. Tenerli distinti spiega perché un framework modulare abbina lo stesso payload a exploit diversi. L’exploitation serve a confermare un rischio, non a presumerlo: una versione «vulnerabile» resta un’ipotesi finché un tentativo controllato non dimostra che il difetto è davvero raggiungibile e sfruttabile in quel contesto.',
            en: 'Exploitation is the moment when a hypothesized weakness is verified by turning it into access. It helps to separate two concepts: the exploit is the technique that abuses a specific flaw; the payload is what runs once the exploit has worked — for example opening a control session. Keeping them distinct explains why a modular framework pairs the same payload with different exploits. Exploitation serves to confirm a risk, not to assume it: a «vulnerable» version remains a hypothesis until a controlled attempt proves that the flaw is truly reachable and exploitable in that context.'
          },
          {
            it: 'Non ogni debolezza raggiungibile è sfruttabile allo stesso modo: contano l’affidabilità (un tentativo che fa crashare il servizio è rumoroso e dannoso), le condizioni (configurazione, protezioni di memoria, privilegi del servizio) e l’impatto che l’accesso ottenuto comporta. Un tester responsabile sceglie la via più sicura per dimostrare il rischio e si ferma a ciò che le regole d’ingaggio consentono: l’obiettivo è la prova, non il danno. Per questo l’exploitation va sempre registrata con il bersaglio, il difetto, il metodo e l’esito, così da essere ripetibile e inseribile nel report come rischio con il suo rimedio.',
            en: 'Not every reachable weakness is exploitable in the same way: what matters is reliability (an attempt that crashes the service is noisy and harmful), the conditions (configuration, memory protections, the service’s privileges), and the impact that the obtained access entails. A responsible tester chooses the safest way to demonstrate the risk and stops at what the rules of engagement allow: the goal is the proof, not the damage. For this reason exploitation must always be recorded with the target, the flaw, the method, and the outcome, so it is repeatable and can enter the report as a risk with its fix.'
          },
          {
            it: 'La difesa agisce prima, durante e dopo. Prima: ridurre la superficie e applicare le patch toglie all’exploit il difetto su cui lavora, mentre il minimo privilegio limita cosa un servizio compromesso può fare. Durante: un IPS e i log riconoscono il tentativo per la sua firma — payload anomali, crash ripetuti, connessioni inattese in uscita. Dopo: l’accesso ottenuto lascia tracce (nuovi processi, sessioni, autenticazioni) che un sistema di detection correla. Studiare l’exploitation serve esattamente a sapere quali di questi controlli mancano e quale evidenza cercare.',
            en: 'The defense acts before, during, and after. Before: reducing the surface and applying patches removes from the exploit the flaw it works on, while least privilege limits what a compromised service can do. During: an IPS and the logs recognize the attempt by its signature — anomalous payloads, repeated crashes, unexpected outbound connections. After: the obtained access leaves traces (new processes, sessions, authentications) that a detection system correlates. Studying exploitation serves exactly to know which of these controls are missing and which evidence to look for.'
          }
        ],
        example: {
          it: 'Su un host in 192.0.2.0/24 un servizio di cui l’enumerazione ha letto la versione viene verificato con un tentativo controllato: se l’accesso si apre, il rischio è provato e si registra bersaglio, difetto, metodo ed esito; la patch mancante e il minimo privilegio sono il rimedio che il report indica.',
          en: 'On a host in 192.0.2.0/24 a service whose version enumeration read is verified with a controlled attempt: if access opens, the risk is proven and you record target, flaw, method, and outcome; the missing patch and least privilege are the fix the report states.'
        },
        commonMistakes: [
          {
            it: 'Presumere la vulnerabilità dalla sola versione: senza verifica controllata resta un’ipotesi, non un rischio provato.',
            en: 'Assuming the vulnerability from the version alone: without a controlled check it stays a hypothesis, not a proven risk.'
          },
          {
            it: 'Confondere exploit e payload: il primo sfrutta il difetto, il secondo è ciò che viene eseguito dopo.',
            en: 'Confusing exploit and payload: the first abuses the flaw, the second is what runs afterward.'
          },
          {
            it: 'Cercare l’accesso a ogni costo: un tentativo che fa crashare il servizio viola le regole d’ingaggio e distrugge l’evidenza.',
            en: 'Seeking access at any cost: an attempt that crashes the service violates the rules of engagement and destroys the evidence.'
          }
        ],
        lab: 'attacklab',
        references: [{ kind: 'attack', id: 'T1210' }],
        guidedLabs: [
          {
            id: 'gl-exploit-verify-defense',
            title: {
              it: 'Verifica il rischio e trova il controllo',
              en: 'Verify the risk and find the control'
            },
            difficulty: 'advanced',
            lab: 'attacklab',
            scenario: {
              it: 'Il laboratorio «Attacco & Difesa» mostra un attacco che si svolge passo dopo passo e il punto in cui una difesa attiva lo interrompe.',
              en: 'The “Attack & defense” lab shows an attack unfolding step by step and the point where an active defense interrupts it.'
            },
            task: {
              it: 'Individua il passo di exploitation, distingui exploit e payload e indica quale controllo (patch, minimo privilegio, IPS) lo fermerebbe o lo rivelerebbe.',
              en: 'Find the exploitation step, tell exploit and payload apart, and point out which control (patch, least privilege, IPS) would stop or reveal it.'
            },
            steps: [
              {
                it: 'Apri «Attacco & Difesa» e scegli uno scenario con una difesa attivabile.',
                en: 'Open “Attack & defense” and pick a scenario with an activatable defense.'
              },
              {
                it: 'Individua il passo in cui il difetto diventa accesso e separa l’exploit dal payload.',
                en: 'Find the step where the flaw becomes access and separate the exploit from the payload.'
              },
              {
                it: 'Attiva la difesa e osserva in quale punto il percorso viene interrotto.',
                en: 'Enable the defense and observe at which point the path is interrupted.'
              }
            ],
            challenge: {
              it: 'Se la patch non fosse disponibile, quale altro controllo ridurrebbe l’impatto dell’exploitation e quale evidenza lascerebbe comunque il tentativo?',
              en: 'If the patch were not available, which other control would reduce the exploitation’s impact and what evidence would the attempt leave anyway?'
            },
            solution: [
              {
                it: 'Il passo di exploitation è quello in cui un difetto raggiungibile diventa accesso: l’exploit è la tecnica che lo sfrutta, il payload è ciò che viene eseguito dopo (per esempio una sessione di controllo). La patch toglie il difetto; se manca, il minimo privilegio limita cosa l’accesso ottenuto può fare e la segmentazione ne contiene la portata, mentre un IPS e i log riconoscono il tentativo per la sua firma.',
                en: 'The exploitation step is the one where a reachable flaw becomes access: the exploit is the technique that abuses it, the payload is what runs afterward (for example a control session). The patch removes the flaw; if it is missing, least privilege limits what the obtained access can do and segmentation contains its reach, while an IPS and the logs recognize the attempt by its signature.'
              },
              {
                it: 'Sfida: senza patch, il minimo privilegio e la segmentazione riducono l’impatto anche se l’exploit riesce; il tentativo lascia comunque evidenza — payload anomali, crash o una connessione inattesa in uscita — che la detection correla.',
                en: 'Challenge: without a patch, least privilege and segmentation reduce the impact even if the exploit succeeds; the attempt still leaves evidence — anomalous payloads, crashes, or an unexpected outbound connection — that detection correlates.'
              }
            ],
            selfCheck: [
              {
                it: 'So distinguere exploit e payload e dire perché l’exploitation verifica anziché presumere.',
                en: 'I can distinguish exploit and payload and say why exploitation verifies instead of assuming.'
              },
              {
                it: 'So indicare i controlli che fermano o rivelano un’exploitation e l’evidenza che lascia.',
                en: 'I can state the controls that stop or reveal an exploitation and the evidence it leaves.'
              }
            ]
          }
        ]
      },
      {
        id: 'exploitation-frameworks-metasploit',
        title: {
          it: 'Framework di exploitation (Metasploit)',
          en: 'Exploitation frameworks (Metasploit)'
        },
        objectives: [
          {
            it: 'Descrivere a cosa serve un framework di exploitation e la sua struttura — moduli, payload, sessioni — senza comandi operativi.',
            en: 'Describe what an exploitation framework is for and its structure — modules, payloads, sessions — without operational commands.'
          },
          {
            it: 'Collegare il funzionamento del framework a ciò che un difensore rileva e previene.',
            en: 'Link how the framework works to what a defender detects and prevents.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere i concetti di exploitation e di reverse/bind shell (argomenti di questo capitolo).',
            en: 'Know the exploitation concepts and reverse/bind shells (topics in this chapter).'
          }
        ],
        theory: [
          {
            it: 'Nel dominio Host & Network Penetration Testing dell’eJPT, un framework di exploitation automatizza la fase di exploitation: invece di ricostruire ogni exploit a mano, offre un catalogo di moduli riusabili, payload pronti e la gestione delle sessioni ottenute. Metasploit è l’esempio di riferimento del percorso. Ciò che conta imparare è la struttura, non una sequenza di comandi: capire come è organizzato spiega sia come un test lo usa sia come una difesa lo riconosce.',
            en: 'In the eJPT Host & Network Penetration Testing domain, an exploitation framework automates the exploitation phase: instead of rebuilding each exploit by hand, it offers a catalog of reusable modules, ready-made payloads, and management of the sessions obtained. Metasploit is the reference example of the path. What matters to learn is the structure, not a sequence of commands: understanding how it is organized explains both how a test uses it and how a defense recognizes it.'
          },
          {
            it: 'I concetti chiave sono tre. I moduli si dividono per scopo: exploit (sfruttano una vulnerabilità), auxiliary (scanning, enumerazione, azioni senza payload) e post (attività dopo l’accesso). I payload possono essere staged (un piccolo stager scarica il resto dopo la connessione) o stageless (autosufficienti). La sessione risultante — per esempio una sessione interattiva tipo Meterpreter — è attesa da un handler che riceve la connessione di ritorno: per questo l’exploitation produce tipicamente una connessione in uscita verso l’attaccante, la stessa forma che il filtraggio in egress intercetta.',
            en: 'There are three key concepts. Modules divide by purpose: exploit (abuse a vulnerability), auxiliary (scanning, enumeration, actions with no payload) and post (activity after access). Payloads can be staged (a small stager downloads the rest after connecting) or stageless (self-contained). The resulting session — for example an interactive Meterpreter-style session — is awaited by a handler that receives the callback: this is why exploitation typically produces an outbound connection toward the attacker, the same shape that egress filtering intercepts.'
          },
          {
            it: 'Il lato difensivo nasce proprio da questa struttura. I framework usano moduli noti e lasciano artefatti predefiniti (nomi dei payload, pattern di staging, certificati) che le firme di IDS/IPS ed EDR riconoscono; la sessione di ritorno è un evento di egress che il monitoraggio della rete rileva; e un modulo exploit funziona solo finché esiste la vulnerabilità, quindi la patch lo neutralizza alla radice. Studiare il framework serve al difensore per prevedere cosa cercare — non è una guida all’uso, ma una mappa di ciò che l’exploitation lascia dietro di sé.',
            en: 'The defensive side comes precisely from this structure. Frameworks use known modules and leave default artifacts (payload names, staging patterns, certificates) that IDS/IPS and EDR signatures recognize; the callback session is an egress event that network monitoring detects; and an exploit module works only while the vulnerability exists, so patching neutralizes it at the root. Studying the framework helps the defender predict what to look for — it is not a usage guide, but a map of what exploitation leaves behind.'
          }
        ],
        example: {
          it: 'Un modulo exploit consegna un payload staged che apre una sessione verso l’host dell’attaccante in 192.0.2.0/24: la patch della vulnerabilità toglie il modulo alla radice, le firme EDR riconoscono gli artefatti del payload e il filtraggio in egress intercetta la connessione di ritorno.',
          en: 'An exploit module delivers a staged payload that opens a session toward the attacker host in 192.0.2.0/24: patching the vulnerability removes the module at the root, EDR signatures recognize the payload artifacts, and egress filtering intercepts the callback connection.'
        },
        commonMistakes: [
          {
            it: 'Vedere il framework come una collezione di comandi da memorizzare invece che una struttura (moduli, payload, sessioni) da capire.',
            en: 'Seeing the framework as a set of commands to memorize instead of a structure (modules, payloads, sessions) to understand.'
          },
          {
            it: 'Dimenticare che un modulo exploit dipende da una vulnerabilità reale: senza quella, o con la patch, non funziona.',
            en: 'Forgetting that an exploit module depends on a real vulnerability: without it, or with the patch, it does not work.'
          },
          {
            it: 'Trascurare la connessione di ritorno: è il segnale in egress che rivela l’exploitation più del tentativo iniziale.',
            en: 'Overlooking the callback connection: it is the egress signal that reveals the exploitation more than the initial attempt.'
          }
        ],
        references: [{ kind: 'nist', id: 'SP 800-115' }]
      },
      {
        id: 'network-based-attacks',
        title: {
          it: 'Attacchi basati sulla rete: MITM e poisoning',
          en: 'Network-based attacks: MITM and poisoning'
        },
        objectives: [
          {
            it: 'Spiegare come un attaccante sulla rete locale si inserisce nel traffico (ARP spoofing) o cattura autenticazioni (poisoning LLMNR/NBT-NS).',
            en: 'Explain how an attacker on the local network inserts into traffic (ARP spoofing) or captures authentication (LLMNR/NBT-NS poisoning).'
          },
          {
            it: 'Collegare ogni tecnica alla difesa di switch e host che la neutralizza.',
            en: 'Link each technique to the switch- and host-side defense that neutralizes it.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere ARP, la CAM table e la risoluzione dei nomi (capitoli sui fondamenti e sui servizi IP).',
            en: 'Know ARP, the CAM table, and name resolution (the fundamentals and IP services chapters).'
          }
        ],
        theory: [
          {
            it: 'Il dominio Host & Network Penetration Testing dell’eJPT include gli attacchi basati sulla rete: chi può immettere frame su un segmento può inserirsi nel traffico. L’ARP spoofing invia risposte ARP falsificate così le vittime associano l’IP del gateway al MAC dell’attaccante, mettendolo on-path (man-in-the-middle). Il poisoning di LLMNR e NBT-NS sfrutta i fallback di risoluzione dei nomi di Windows: quando il DNS non risolve, l’host chiede in broadcast «chi è questo nome?» e l’attaccante risponde, inducendo il client a tentare un’autenticazione verso di lui e consegnandogli il materiale (es. hash di sfida/risposta).',
            en: 'The eJPT Host & Network Penetration Testing domain includes network-based attacks: whoever can inject frames on a segment can insert into the traffic. ARP spoofing sends forged ARP replies so victims map the gateway IP to the attacker MAC, putting the attacker on-path (man-in-the-middle). LLMNR and NBT-NS poisoning abuses Windows name-resolution fallbacks: when DNS fails to resolve, the host broadcasts «who is this name?» and the attacker answers, luring the client into attempting authentication toward it and handing over the material (e.g. challenge/response hashes).'
          },
          {
            it: 'La radice comune è la fiducia implicita: ARP e i protocolli di fallback credono a qualunque rispondente sul segmento, senza autenticazione. Una volta on-path, i protocolli in chiaro perdono credenziali e dati, e il materiale di autenticazione catturato alimenta il cracking offline o il relay verso un altro servizio. Non è un bug del software ma una proprietà del livello 2 e della risoluzione dei nomi locale: ecco perché la difesa è strutturale, non una semplice patch.',
            en: 'The common root is implicit trust: ARP and the fallback protocols believe any responder on the segment, with no authentication. Once on-path, cleartext protocols leak credentials and data, and captured authentication material feeds offline cracking or relay toward another service. It is not a software bug but a property of Layer 2 and local name resolution: that is why the defense is structural, not a simple patch.'
          },
          {
            it: 'Le difese stanno su switch e host. DHCP Snooping con Dynamic ARP Inspection scarta le risposte ARP non coerenti con la binding table e ferma l’ARP spoofing; disattivare LLMNR e NBT-NS toglie il fallback su cui vive il poisoning; la firma SMB blocca il relay del materiale catturato; la cifratura e la segmentazione riducono ciò che l’essere on-path produce. Il monitoraggio rivela le anomalie — raffiche di ARP gratuiti, rispondenti inattesi alla risoluzione dei nomi — che tradiscono l’attacco.',
            en: 'The defenses are on the switch and the host. DHCP Snooping with Dynamic ARP Inspection drops ARP replies inconsistent with the binding table and stops ARP spoofing; disabling LLMNR and NBT-NS removes the fallback the poisoning lives on; SMB signing blocks relay of the captured material; encryption and segmentation reduce what being on-path yields. Monitoring reveals the anomalies — gratuitous ARP bursts, unexpected name-resolution responders — that give the attack away.'
          }
        ],
        example: {
          it: 'Su un segmento in 192.0.2.0/24 l’attaccante avvelena la cache ARP per diventare on-path e risponde alle query LLMNR per raccogliere un hash di autenticazione: Dynamic ARP Inspection e la disattivazione di LLMNR/NBT-NS avrebbero spezzato entrambe le vie, e la firma SMB avrebbe reso inutile il relay.',
          en: 'On a segment in 192.0.2.0/24 the attacker poisons the ARP cache to become on-path and answers LLMNR queries to collect an authentication hash: Dynamic ARP Inspection and disabling LLMNR/NBT-NS would have broken both paths, and SMB signing would have made the relay useless.'
        },
        commonMistakes: [
          {
            it: 'Credere che una VLAN basti: separa i domini ma non autentica ARP né i fallback di risoluzione dei nomi dentro il segmento.',
            en: 'Believing a VLAN is enough: it separates domains but does not authenticate ARP or the name-resolution fallbacks within the segment.'
          },
          {
            it: 'Lasciare attivi LLMNR e NBT-NS «perché non danno fastidio»: sono il fallback su cui vive il poisoning.',
            en: 'Leaving LLMNR and NBT-NS enabled «because they are harmless»: they are the fallback the poisoning lives on.'
          },
          {
            it: 'Affidarsi al solo perimetro: questi attacchi sono interni al segmento e li fermano DAI, firma SMB e cifratura, non il firewall di confine.',
            en: 'Relying on the perimeter alone: these attacks are internal to the segment and are stopped by DAI, SMB signing and encryption, not the border firewall.'
          }
        ],
        references: [
          { kind: 'attack', id: 'T1557' },
          { kind: 'attack', id: 'T1557.001' }
        ]
      },
      {
        id: 'system-host-based-attacks',
        title: {
          it: 'Attacchi a sistema e host',
          en: 'System and host-based attacks'
        },
        objectives: [
          {
            it: 'Spiegare come il sistema operativo e i servizi locali di un host diventano un punto d’accesso: servizi non aggiornati, configurazioni errate, permessi deboli.',
            en: 'Explain how a host operating system and its local services become an entry point: unpatched services, misconfigurations, weak permissions.'
          },
          {
            it: 'Collegare l’hardening dell’host — patch, minima funzionalità, baseline di configurazione, logging locale — a ciò che riduce o rivela l’attacco.',
            en: 'Link host hardening — patching, least functionality, configuration baselines, local logging — to what reduces or reveals the attack.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere i concetti di exploitation e la valutazione delle vulnerabilità (argomenti precedenti).',
            en: 'Know the exploitation concepts and vulnerability assessment (previous topics).'
          }
        ],
        theory: [
          {
            it: 'Nel dominio Host & Network Penetration Testing dell’eJPT, gli attacchi a sistema e host prendono di mira il sistema operativo e i servizi locali in esecuzione su una macchina: un servizio non aggiornato, una configurazione errata, permessi troppo larghi. L’obiettivo è l’esecuzione di codice o l’accesso iniziale sull’host. Si distinguono dagli attacchi basati sulla rete (che abusano del segmento) e dalla post-exploitation (che segue l’accesso): qui il bersaglio è ciò che gira sull’host stesso.',
            en: 'In the eJPT Host & Network Penetration Testing domain, system and host-based attacks target the operating system and the local services running on a machine: an unpatched service, a misconfiguration, permissions that are too broad. The goal is code execution or initial access on the host. They differ from network-based attacks (which abuse the segment) and from post-exploitation (which follows access): here the target is what runs on the host itself.'
          },
          {
            it: 'I punti d’appoggio tipici, su Windows e Linux, sono pochi e ricorrenti: un servizio esposto e obsoleto con un CVE noto; credenziali predefinite o deboli su un servizio locale; permessi mal configurati (binari di servizio scrivibili, SUID su Linux, attività pianificate manipolabili). La valutazione è sempre versione e configurazione → debolezza nota, verificata nello scope. Ciò che rende un host attaccabile raramente è un solo bug: è l’accumulo di software non aggiornato e configurazioni lasche.',
            en: 'The typical footholds, on Windows and Linux, are few and recurring: an exposed, outdated service with a known CVE; default or weak credentials on a local service; misconfigured permissions (writable service binaries, SUID on Linux, manipulable scheduled tasks). The assessment is always version and configuration → known weakness, verified in scope. What makes a host attackable is rarely a single bug: it is the accumulation of unpatched software and loose configuration.'
          },
          {
            it: 'La difesa è l’hardening dell’host, speculare all’attacco: gestione delle patch (togliere la versione vulnerabile), minima funzionalità (disattivare o rimuovere servizi e software inutili), baseline di configurazione sicura (niente default, permessi stretti) e logging locale o EDR che rivela il tentativo di exploitation. La superficie d’attacco dell’host si riduce esattamente nella misura in cui l’hardening è applicato: non serve un controllo esotico, ma la disciplina di patch e configurazione.',
            en: 'The defense is host hardening, the mirror of the attack: patch management (remove the vulnerable version), least functionality (disable or remove unused services and software), secure configuration baselines (no defaults, tight permissions), and local logging or EDR that reveals the exploitation attempt. The host attack surface shrinks exactly as far as hardening is applied: it needs no exotic control, but the discipline of patching and configuration.'
          }
        ],
        example: {
          it: 'Un host in 192.0.2.0/24 esegue un servizio locale obsoleto con un CVE noto e ha un binario di servizio scrivibile da tutti: applicare la patch al servizio e correggere i permessi (più una baseline di configurazione) toglie entrambi i punti d’appoggio, mentre i log locali registrano il tentativo di exploitation.',
          en: 'A host in 192.0.2.0/24 runs an outdated local service with a known CVE and has a world-writable service binary: patching the service and fixing the permissions (plus a configuration baseline) removes both footholds, while the local logs record the exploitation attempt.'
        },
        commonMistakes: [
          {
            it: 'Credere che il perimetro protegga l’host: questi attacchi colpiscono i servizi e la configurazione dell’host stesso.',
            en: 'Believing the perimeter protects the host: these attacks hit the host’s own services and configuration.'
          },
          {
            it: 'Lasciare servizi inutili e configurazioni di default: la minima funzionalità è la difesa più economica e più efficace.',
            en: 'Leaving unused services and default configurations: least functionality is the cheapest and most effective defense.'
          },
          {
            it: 'Dichiarare sfruttabile un CVE abbinato alla sola versione senza verificarlo: patch retroportate e falsi positivi lo smentiscono.',
            en: 'Declaring a CVE matched by version alone exploitable without verifying it: backported patches and false positives disprove it.'
          }
        ],
        references: [
          { kind: 'attack', id: 'T1210' },
          { kind: 'nist', id: 'SP 800-123' }
        ]
      },
      {
        id: 'post-exploitation-privesc',
        title: {
          it: 'Post-exploitation: privilegi, bottino e persistenza',
          en: 'Post-exploitation: privileges, loot, and persistence'
        },
        objectives: [
          {
            it: 'Descrivere le attività di post-exploitation e cosa misurano in termini di impatto reale.',
            en: 'Describe post-exploitation activities and what they measure in terms of real impact.'
          },
          {
            it: 'Collegare escalation dei privilegi, raccolta di credenziali e persistenza alle difese che le contengono.',
            en: 'Link privilege escalation, credential harvesting, and persistence to the defenses that contain them.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere l’exploitation e il modello di accesso (argomento precedente e capitolo su AAA).',
            en: 'Know exploitation and the access model (previous topic and the AAA chapter).'
          }
        ],
        theory: [
          {
            it: 'Ottenuto un primo accesso, la post-exploitation misura cosa quell’accesso vale davvero. Si parte dalla consapevolezza della situazione: chi sono, con quali privilegi, su quale host e in quale rete. L’escalation dei privilegi cerca di passare da un’utenza limitata a una amministrativa sfruttando configurazioni errate, servizi deboli o permessi eccessivi. La raccolta di credenziali recupera password, token o chiavi riutilizzabili altrove. Ogni passo trasforma un punto d’appoggio in impatto misurabile, che è ciò che il report deve quantificare: non «sono entrato», ma «fin dove si arriva da lì».',
            en: 'Once a first access is obtained, post-exploitation measures what that access is really worth. It starts from situational awareness: who I am, with what privileges, on which host, and in which network. Privilege escalation tries to move from a limited account to an administrative one by abusing misconfigurations, weak services, or excessive permissions. Credential harvesting recovers passwords, tokens, or keys reusable elsewhere. Each step turns a foothold into measurable impact, which is what the report must quantify: not «I got in», but «how far you can reach from there».'
          },
          {
            it: 'La persistenza è la capacità di mantenere l’accesso nel tempo, oltre la sessione iniziale. In un test serve a dimostrare un rischio reale — un attaccante vero non si disconnette — ma va trattata con cautela: ogni meccanismo lasciato va documentato e rimosso a fine ingaggio, perché dimenticarne uno è un rischio introdotto dal test stesso. È qui che la differenza tra un test e un attacco si vede nella disciplina: si registra ogni modifica, si preferisce il metodo meno invasivo e si ripulisce. La persistenza dimostra l’impatto; la tracciabilità la rende sicura.',
            en: 'Persistence is the ability to keep access over time, beyond the initial session. In a test it serves to demonstrate a real risk — a real attacker does not disconnect — but it must be handled carefully: every mechanism left behind must be documented and removed at the end of the engagement, because forgetting one is a risk introduced by the test itself. This is where the difference between a test and an attack shows in discipline: you record every change, prefer the least invasive method, and clean up. Persistence demonstrates the impact; traceability makes it safe.'
          },
          {
            it: 'Le difese della post-exploitation sono quelle che contengono l’impatto dopo che il perimetro è caduto. Il minimo privilegio fa sì che un accesso iniziale valga poco; la separazione degli account impedisce che una credenziale apra tutto; la gestione dei segreti evita password riutilizzabili sugli host. Un sistema di detection sugli endpoint nota i segni della post-exploitation — nuovi processi privilegiati, dump di credenziali, meccanismi di avvio aggiunti — e la segmentazione limita quanto in là si arriva. Studiare queste attività serve a capire perché «assumere la violazione» e difendere in profondità è più realistico che fidarsi del solo perimetro.',
            en: 'The defenses of post-exploitation are those that contain the impact after the perimeter has fallen. Least privilege makes an initial access worth little; account separation prevents one credential from opening everything; secrets management avoids passwords reusable across hosts. An endpoint detection system notices the signs of post-exploitation — new privileged processes, credential dumps, added startup mechanisms — and segmentation limits how far you get. Studying these activities serves to understand why «assume breach» and defending in depth is more realistic than trusting the perimeter alone.'
          }
        ],
        example: {
          it: 'Da un accesso limitato su un host, una configurazione errata consente l’escalation a privilegi amministrativi e il recupero di una credenziale riutilizzabile; il report quantifica l’impatto e indica il rimedio — minimo privilegio, separazione degli account e gestione dei segreti — mentre ogni modifica lasciata viene documentata e rimossa.',
          en: 'From a limited access on a host, a misconfiguration allows escalation to administrative privileges and the recovery of a reusable credential; the report quantifies the impact and states the fix — least privilege, account separation, and secrets management — while every change left behind is documented and removed.'
        },
        commonMistakes: [
          {
            it: 'Fermarsi al primo accesso: senza misurare l’impatto il report non dice quanto vale davvero la compromissione.',
            en: 'Stopping at the first access: without measuring the impact the report does not say how much the compromise is really worth.'
          },
          {
            it: 'Lasciare meccanismi di persistenza non documentati: diventano un rischio introdotto dal test e vanno rimossi a fine ingaggio.',
            en: 'Leaving undocumented persistence mechanisms: they become a risk introduced by the test and must be removed at the end of the engagement.'
          },
          {
            it: 'Trattare il perimetro come unica difesa: dopo il primo accesso contano minimo privilegio, segmentazione e detection sugli endpoint.',
            en: 'Treating the perimeter as the only defense: after the first access, least privilege, segmentation, and endpoint detection are what count.'
          }
        ],
        lab: 'attackpaths',
        references: [{ kind: 'attack', id: 'T1068' }],
        guidedLabs: [
          {
            id: 'gl-postexploit-impact',
            title: {
              it: 'Misura l’impatto oltre il primo accesso',
              en: 'Measure the impact beyond the first access'
            },
            difficulty: 'advanced',
            lab: 'attackpaths',
            scenario: {
              it: 'Il laboratorio «Percorsi d’attacco» mostra come un punto d’appoggio porti, passo dopo passo, a un impatto più profondo.',
              en: 'The “Attack paths” lab shows how a foothold leads, step by step, to a deeper impact.'
            },
            task: {
              it: 'Segui un percorso oltre il primo accesso e associa escalation, raccolta di credenziali e persistenza alla difesa che le contiene.',
              en: 'Follow a path beyond the first access and match escalation, credential harvesting, and persistence to the defense that contains them.'
            },
            steps: [
              {
                it: 'Apri «Percorsi d’attacco» e scegli un percorso che prosegua dopo il primo accesso.',
                en: 'Open “Attack paths” and pick a path that continues after the first access.'
              },
              {
                it: 'Attribuisci a ogni tappa l’attività di post-exploitation e l’impatto che aggiunge.',
                en: 'Attribute to each step the post-exploitation activity and the impact it adds.'
              },
              {
                it: 'Indica la difesa che conterrebbe quella tappa (minimo privilegio, segmentazione, detection).',
                en: 'Point out the defense that would contain that step (least privilege, segmentation, detection).'
              }
            ],
            challenge: {
              it: 'Se il minimo privilegio fosse applicato, quali tappe del percorso cadrebbero e quale impatto resterebbe comunque da riportare?',
              en: 'If least privilege were applied, which steps of the path would fall and what impact would still remain to report?'
            },
            solution: [
              {
                it: 'Oltre il primo accesso, la consapevolezza della situazione precede l’escalation dei privilegi, che a sua volta abilita la raccolta di credenziali e, infine, la persistenza. Ogni tappa aggiunge impatto: da «un host» a «un amministratore» a «credenziali riutilizzabili» a «accesso mantenuto». Le difese sono rispettivamente minimo privilegio, separazione degli account e gestione dei segreti, con la detection sugli endpoint a rivelare i segni e la segmentazione a limitare la portata.',
                en: 'Beyond the first access, situational awareness precedes privilege escalation, which in turn enables credential harvesting and, finally, persistence. Each step adds impact: from «a host» to «an administrator» to «reusable credentials» to «maintained access». The defenses are respectively least privilege, account separation, and secrets management, with endpoint detection to reveal the signs and segmentation to limit the reach.'
              },
              {
                it: 'Sfida: con il minimo privilegio cadono l’escalation e gran parte della raccolta di credenziali, perché l’accesso iniziale vale poco; resta da riportare l’impatto del solo primo accesso e l’evidenza del tentativo, che valgono comunque come rischio e come verifica della detection.',
                en: 'Challenge: with least privilege, escalation and much of the credential harvesting fall, because the initial access is worth little; what remains to report is the impact of the first access alone and the evidence of the attempt, which still count as a risk and as a check of detection.'
              }
            ],
            selfCheck: [
              {
                it: 'So descrivere le attività di post-exploitation e l’impatto che ciascuna aggiunge.',
                en: 'I can describe post-exploitation activities and the impact each one adds.'
              },
              {
                it: 'So collegare escalation, credenziali e persistenza alle difese che le contengono.',
                en: 'I can link escalation, credentials, and persistence to the defenses that contain them.'
              }
            ]
          }
        ]
      },
      {
        id: 'lateral-movement-pivoting',
        title: {
          it: 'Movimento laterale e pivoting',
          en: 'Lateral movement and pivoting'
        },
        objectives: [
          {
            it: 'Spiegare come un punto d’appoggio raggiunge sistemi più profondi tramite movimento laterale e pivoting.',
            en: 'Explain how a foothold reaches deeper systems through lateral movement and pivoting.'
          },
          {
            it: 'Collegare la portata del movimento alle difese est-ovest: segmentazione, Zero Trust, monitoraggio.',
            en: 'Link the reach of movement to the east-west defenses: segmentation, Zero Trust, monitoring.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere la post-exploitation e la segmentazione (argomento precedente e capitolo sulle difese di rete).',
            en: 'Know post-exploitation and segmentation (previous topic and the network defenses chapter).'
          }
        ],
        theory: [
          {
            it: 'Il movimento laterale è lo spostamento da un sistema compromesso a un altro all’interno della stessa rete, riusando le credenziali e le relazioni di fiducia raccolte nella post-exploitation. Il pivoting è la tecnica che lo rende possibile oltre i confini di rete: l’host compromesso diventa un ponte verso segmenti che l’attaccante non raggiungerebbe direttamente, instradando il traffico attraverso di esso. Insieme trasformano un singolo punto d’appoggio in un percorso verso il bersaglio reale — spesso dati o sistemi che il perimetro proteggeva proprio impedendo l’accesso diretto.',
            en: 'Lateral movement is the shift from one compromised system to another within the same network, reusing the credentials and trust relationships gathered in post-exploitation. Pivoting is the technique that makes it possible beyond network boundaries: the compromised host becomes a bridge toward segments the attacker could not reach directly, routing traffic through it. Together they turn a single foothold into a path toward the real target — often data or systems that the perimeter protected precisely by preventing direct access.'
          },
          {
            it: 'Ciò che abilita il movimento è la fiducia implicita: reti piatte dove ogni host raggiunge ogni altro, credenziali valide ovunque, relazioni di fiducia non verificate a ogni passo. La mappa che conta non è quella degli indirizzi ma quella delle relazioni: chi può autenticarsi dove, quale host si fida di quale. Un tester segue proprio queste relazioni; documentarle è spesso il risultato più utile di un test, perché mostra al difensore i percorsi che non sapeva di avere. L’impatto non è il numero di host «presi», ma la distanza coperta dal punto d’ingresso al dato critico.',
            en: 'What enables movement is implicit trust: flat networks where every host reaches every other, credentials valid everywhere, trust relationships not verified at each step. The map that matters is not the one of addresses but the one of relationships: who can authenticate where, which host trusts which. A tester follows exactly these relationships; documenting them is often the most useful result of a test, because it shows the defender the paths they did not know they had. The impact is not the number of hosts «taken», but the distance covered from the entry point to the critical data.'
          },
          {
            it: 'Le difese sono est-ovest, cioè tra sistemi interni, non solo al perimetro. La segmentazione spezza la rete piatta così che un host compromesso non raggiunga l’intera infrastruttura; il principio Zero Trust verifica identità e autorizzazione a ogni accesso invece di fidarsi della posizione in rete; il monitoraggio del traffico interno rivela movimenti insoliti — autenticazioni tra host che non dialogano mai, un host che instrada traffico verso un segmento nuovo. Studiare il movimento laterale è il modo diretto per capire perché la fiducia implicita è il moltiplicatore d’impatto che le difese moderne cercano di togliere.',
            en: 'The defenses are east-west, that is between internal systems, not just at the perimeter. Segmentation breaks the flat network so that a compromised host does not reach the whole infrastructure; the Zero Trust principle verifies identity and authorization at every access instead of trusting the network location; internal traffic monitoring reveals unusual movements — authentications between hosts that never talk, a host routing traffic toward a new segment. Studying lateral movement is the direct way to understand why implicit trust is the impact multiplier that modern defenses try to remove.'
          }
        ],
        example: {
          it: 'Da un host compromesso in 192.0.2.0/24, una credenziale riutilizzabile consente il movimento laterale verso un secondo host, che fa da pivot verso un segmento interno non raggiungibile direttamente; la segmentazione e la verifica Zero Trust a ogni accesso avrebbero spezzato il percorso, e il monitoraggio est-ovest lo avrebbe rivelato.',
          en: 'From a compromised host in 192.0.2.0/24, a reusable credential allows lateral movement to a second host, which acts as a pivot toward an internal segment not reachable directly; segmentation and Zero Trust verification at every access would have broken the path, and east-west monitoring would have revealed it.'
        },
        commonMistakes: [
          {
            it: 'Misurare l’impatto in host «presi»: conta la distanza dal punto d’ingresso al dato critico, non il conteggio.',
            en: 'Measuring impact in hosts «taken»: what counts is the distance from the entry point to the critical data, not the count.'
          },
          {
            it: 'Fidarsi del solo perimetro: il movimento laterale è interno, e lo fermano segmentazione e Zero Trust, non il firewall di confine.',
            en: 'Trusting the perimeter alone: lateral movement is internal, and segmentation and Zero Trust stop it, not the border firewall.'
          },
          {
            it: 'Ignorare le relazioni di fiducia: sono la mappa reale del movimento, più degli indirizzi IP.',
            en: 'Ignoring trust relationships: they are the real map of movement, more than the IP addresses.'
          }
        ],
        lab: 'attackpaths',
        references: [{ kind: 'attack', id: 'T1021' }],
        guidedLabs: [
          {
            id: 'gl-lateral-trust-map',
            title: {
              it: 'Segui le relazioni di fiducia',
              en: 'Follow the trust relationships'
            },
            difficulty: 'advanced',
            lab: 'attackpaths',
            scenario: {
              it: 'Il laboratorio «Percorsi d’attacco» mostra percorsi che attraversano più sistemi: il terreno del movimento laterale e del pivoting.',
              en: 'The “Attack paths” lab shows paths that cross multiple systems: the ground of lateral movement and pivoting.'
            },
            task: {
              it: 'Ricostruisci come il percorso passa da un host all’altro e indica dove segmentazione o Zero Trust lo spezzerebbero.',
              en: 'Reconstruct how the path moves from one host to another and point out where segmentation or Zero Trust would break it.'
            },
            steps: [
              {
                it: 'Apri «Percorsi d’attacco» e scegli un percorso che attraversa più host.',
                en: 'Open “Attack paths” and pick a path that crosses multiple hosts.'
              },
              {
                it: 'Per ogni salto indica la relazione di fiducia o la credenziale che lo rende possibile.',
                en: 'For each hop indicate the trust relationship or credential that makes it possible.'
              },
              {
                it: 'Segna dove una barriera est-ovest (segmentazione, Zero Trust, monitoraggio) interromperebbe il percorso.',
                en: 'Mark where an east-west barrier (segmentation, Zero Trust, monitoring) would interrupt the path.'
              }
            ],
            challenge: {
              it: 'Se la rete fosse segmentata, il pivoting resterebbe possibile? Quale condizione residua lo permetterebbe ancora?',
              en: 'If the network were segmented, would pivoting still be possible? Which residual condition would still allow it?'
            },
            solution: [
              {
                it: 'Il percorso avanza riusando credenziali e relazioni di fiducia: ogni salto è un host che si fida di un altro o una credenziale valida altrove, e il pivoting usa un host compromesso come ponte verso segmenti non raggiungibili direttamente. La mappa che conta è quella delle relazioni. La segmentazione spezza i salti tra segmenti, lo Zero Trust toglie la fiducia implicita verificando ogni accesso, e il monitoraggio est-ovest rivela le autenticazioni insolite.',
                en: 'The path advances by reusing credentials and trust relationships: each hop is a host that trusts another or a credential valid elsewhere, and pivoting uses a compromised host as a bridge toward segments not reachable directly. The map that matters is the one of relationships. Segmentation breaks the hops between segments, Zero Trust removes implicit trust by verifying every access, and east-west monitoring reveals the unusual authentications.'
              },
              {
                it: 'Sfida: con la rete segmentata il pivoting resta possibile solo se una regola troppo permissiva o una credenziale valida su più segmenti ricrea la fiducia che la segmentazione doveva togliere; è lì che lo Zero Trust, verificando ogni accesso, chiude il residuo.',
                en: 'Challenge: with a segmented network, pivoting stays possible only if an overly permissive rule or a credential valid across segments recreates the trust that segmentation was meant to remove; that is where Zero Trust, by verifying every access, closes the residue.'
              }
            ],
            selfCheck: [
              {
                it: 'So spiegare movimento laterale e pivoting e la fiducia implicita che li abilita.',
                en: 'I can explain lateral movement and pivoting and the implicit trust that enables them.'
              },
              {
                it: 'So dire quali difese est-ovest spezzano il percorso e perché il perimetro non basta.',
                en: 'I can say which east-west defenses break the path and why the perimeter is not enough.'
              }
            ]
          }
        ]
      },
      {
        id: 'active-directory-basics',
        title: {
          it: 'Basi di Active Directory: dominio, Kerberos e fiducia',
          en: 'Active Directory basics: domain, Kerberos, and trust'
        },
        objectives: [
          {
            it: 'Descrivere il modello di Active Directory — dominio, foresta, unità organizzative e criteri di gruppo — e il ruolo del domain controller come directory e autorità di autenticazione.',
            en: 'Describe the Active Directory model — domain, forest, organizational units, and group policy — and the role of the domain controller as directory and authentication authority.'
          },
          {
            it: 'Distinguere Kerberos da NTLM a livello concettuale e collegare la superficie tipica (enumerazione LDAP, relazioni di fiducia) alle difese che la riducono.',
            en: 'Tell Kerberos from NTLM at a conceptual level and link the typical surface (LDAP enumeration, trust relationships) to the defenses that reduce it.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere autenticazione e movimento laterale e il ruolo delle relazioni di fiducia (argomenti precedenti di questo capitolo).',
            en: 'Know authentication and lateral movement and the role of trust relationships (the previous topics of this chapter).'
          }
        ],
        theory: [
          {
            it: 'Active Directory (AD) è la directory che organizza identità e risorse di una rete Windows. L’unità base è il dominio, raccolto con altri domini in una foresta che ne definisce il confine di fiducia; dentro il dominio le unità organizzative (OU) raggruppano oggetti — utenti, computer, gruppi — e i criteri di gruppo (GPO) ne impongono la configurazione. Il domain controller (DC) è il cuore: tiene la directory, interrogabile via LDAP, e autentica gli accessi. Capire questa struttura è il primo passo, perché in AD l’impatto non si misura sul singolo host ma sul controllo del dominio.',
            en: 'Active Directory (AD) is the directory that organizes the identities and resources of a Windows network. The base unit is the domain, grouped with other domains into a forest that defines its trust boundary; inside the domain the organizational units (OUs) group objects — users, computers, groups — and group policy (GPO) imposes their configuration. The domain controller (DC) is the heart: it holds the directory, queryable over LDAP, and authenticates access. Understanding this structure is the first step, because in AD impact is not measured on the single host but on control of the domain.'
          },
          {
            it: 'L’autenticazione in AD usa due protocolli. NTLM è il più vecchio, basato su challenge-response e sul riuso dell’hash della password, ed è proprio quel riuso a renderlo fragile. Kerberos è il predefinito: un’autorità fidata, il KDC sul domain controller, rilascia un ticket iniziale (TGT) dopo il login, e con quello l’utente ottiene ticket di servizio (TGS) per i singoli servizi, senza ripresentare la password. Il modello riduce l’esposizione delle credenziali, ma sposta il valore sui ticket e sull’account di servizio: chi comprende questo flusso capisce perché la robustezza delle password di servizio e la protezione del DC contano più di ogni singolo host.',
            en: 'Authentication in AD uses two protocols. NTLM is the older one, based on challenge-response and on reusing the password hash, and it is exactly that reuse that makes it fragile. Kerberos is the default: a trusted authority, the KDC on the domain controller, issues an initial ticket (TGT) after login, and with it the user obtains service tickets (TGS) for individual services, without re-presenting the password. The model reduces credential exposure, but it shifts the value onto the tickets and the service account: whoever understands this flow understands why the strength of service passwords and the protection of the DC matter more than any single host.'
          },
          {
            it: 'La superficie di AD nasce dalla sua stessa natura di directory condivisa. L’enumerazione via LDAP, possibile anche a un utente di dominio qualunque, legge utenti, gruppi, computer e relazioni di fiducia: è la mappa che orienta il movimento laterale verso gli amministratori di dominio. Le relazioni di fiducia tra domini o foreste estendono quella mappa oltre il confine iniziale. La difesa è stratificata: il tiering amministrativo separa gli account che gestiscono i DC da quelli di uso quotidiano, l’hardening di Kerberos (account di servizio con password lunghe e casuali, privilegi minimi) toglie valore ai ticket catturabili, e il monitoraggio degli eventi del DC (accessi e richieste di ticket anomale) rivela l’enumerazione e l’abuso. Studiare queste basi è il modo per capire perché il controllo del dominio è l’obiettivo e la protezione del DC la priorità.',
            en: 'The surface of AD arises from its very nature as a shared directory. Enumeration over LDAP, possible even to any ordinary domain user, reads users, groups, computers, and trust relationships: it is the map that guides lateral movement toward the domain administrators. Trust relationships between domains or forests extend that map beyond the initial boundary. The defense is layered: administrative tiering separates the accounts that manage the DCs from everyday ones, Kerberos hardening (service accounts with long, random passwords, least privilege) strips value from capturable tickets, and monitoring the DC events (anomalous logons and ticket requests) reveals enumeration and abuse. Studying these basics is the way to understand why control of the domain is the objective and protection of the DC the priority.'
          }
        ],
        example: {
          it: 'Un utente di dominio qualunque su un host in 192.0.2.0/24 interroga via LDAP il domain controller ed enumera utenti, gruppi e relazioni di fiducia, individuando il percorso verso un amministratore di dominio: il tiering amministrativo, le password robuste degli account di servizio e il monitoraggio delle richieste di ticket Kerberos sul DC avrebbero ridotto la superficie e rivelato l’attività.',
          en: 'Any ordinary domain user on a host in 192.0.2.0/24 queries the domain controller over LDAP and enumerates users, groups, and trust relationships, finding the path toward a domain administrator: administrative tiering, strong service-account passwords, and monitoring of Kerberos ticket requests on the DC would have reduced the surface and revealed the activity.'
        },
        commonMistakes: [
          {
            it: 'Trattare il controllo di un host come l’obiettivo: in AD l’obiettivo è il dominio, e il domain controller è la priorità da proteggere.',
            en: 'Treating control of a host as the objective: in AD the objective is the domain, and the domain controller is the priority to protect.'
          },
          {
            it: 'Ritenere innocua l’enumerazione LDAP perché autenticata: un utente di dominio qualunque legge la mappa che orienta il movimento laterale.',
            en: 'Thinking LDAP enumeration is harmless because it is authenticated: any ordinary domain user reads the map that guides lateral movement.'
          },
          {
            it: 'Dimenticare gli account di servizio: password deboli e privilegi eccessivi rendono i ticket Kerberos un bersaglio di valore.',
            en: 'Forgetting service accounts: weak passwords and excessive privileges make Kerberos tickets a valuable target.'
          }
        ],
        references: [
          { kind: 'attack', id: 'T1087.002' },
          { kind: 'rfc', id: 'RFC 4120' }
        ]
      },
      {
        id: 'exploitation-reverse-bind-shell',
        title: {
          it: 'Reverse shell e bind shell',
          en: 'Reverse shell and bind shell'
        },
        objectives: [
          {
            it: 'Distinguere bind shell e reverse shell e spiegare perché la reverse supera un firewall in ingresso e il NAT.',
            en: 'Tell a bind shell from a reverse shell and explain why the reverse one defeats an inbound firewall and NAT.'
          },
          {
            it: 'Individuare il controllo che spezza davvero la connessione: filtraggio dell’egress e ispezione, non le regole in ingresso.',
            en: 'Identify the control that truly breaks the connection: egress filtering and inspection, not inbound rules.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere direzione delle connessioni TCP, NAT e la differenza tra traffico in ingresso e in uscita (capitoli sui servizi IP e sui fondamenti).',
            en: 'Know TCP connection direction, NAT, and the difference between inbound and outbound traffic (the IP services and fundamentals chapters).'
          }
        ],
        theory: [
          {
            it: 'Una shell è l’accesso interattivo ai comandi sul bersaglio. In una bind shell il target apre una porta in ascolto e attende la connessione dell’attaccante: semplice, ma inefficace quando un firewall in ingresso o il NAT bloccano le connessioni verso il target. In una reverse shell è il target ad aprire la connessione verso l’esterno, verso un listener controllato dall’attaccante.',
            en: 'A shell is interactive command access on the target. In a bind shell the target opens a listening port and waits for the attacker to connect: simple, but useless when an inbound firewall or NAT block connections toward the target. In a reverse shell the target itself opens the connection outward, to a listener the attacker controls.'
          },
          {
            it: 'La reverse shell è preferita proprio per questo: quasi tutte le reti consentono il traffico in uscita molto più liberamente di quello in ingresso, così la connessione esce dal target e aggira sia il firewall in ingresso sia il NAT. È la ragione per cui un perimetro che filtra solo l’ingresso dà una falsa sicurezza: una volta eseguito il codice sul target, è il target a chiamare fuori.',
            en: 'The reverse shell is preferred for exactly this reason: almost every network allows outbound traffic far more freely than inbound, so the connection leaves the target and bypasses both the inbound firewall and NAT. This is why a perimeter that filters only ingress gives false confidence: once code runs on the target, it is the target that calls out.'
          },
          {
            it: 'La difesa si sposta quindi sull’uscita. Il filtraggio dell’egress che consente solo destinazioni e porte note, l’ispezione del traffico e la segmentazione est-ovest spezzano la connessione di ritorno; il solo firewall in ingresso non la vede. L’attaccante tende a cifrare il canale di comando e controllo su porte comuni come la 443 per confondersi, perciò il rilevamento si basa su anomalie e log di proxy e DNS, non sul numero di porta.',
            en: 'The defense therefore shifts to egress. Egress filtering that allows only known destinations and ports, traffic inspection, and east-west segmentation break the return connection; an inbound firewall alone does not see it. The attacker tends to encrypt the command-and-control channel over common ports such as 443 to blend in, so detection relies on anomalies and proxy and DNS logs, not on the port number.'
          }
        ],
        example: {
          it: 'Un target dietro NAT non può offrire una bind shell raggiungibile da fuori, quindi l’attaccante preferisce una reverse shell in uscita sulla 443; una policy di egress che consente solo il proxy la interrompe.',
          en: 'A target behind NAT cannot offer a bind shell reachable from outside, so the attacker prefers a reverse shell outbound to 443; an egress policy that allows only the proxy breaks it.'
        },
        commonMistakes: [
          {
            it: 'Credere che un firewall in ingresso fermi le shell: la reverse esce dal target e lo aggira.',
            en: 'Believing an inbound firewall stops shells: the reverse one leaves the target and bypasses it.'
          },
          {
            it: 'Considerare benigna la porta 443: un canale cifrato di comando e controllo vi si nasconde.',
            en: 'Treating port 443 as benign: an encrypted command-and-control channel hides in it.'
          },
          {
            it: 'Dimenticare che il NAT impedisce una bind shell dall’esterno, ma non una connessione in uscita.',
            en: 'Forgetting that NAT blocks a bind shell from outside, but not an outbound connection.'
          }
        ],
        references: [{ kind: 'attack', id: 'T1059' }],
        guidedLabs: [
          {
            id: 'gl-exploitation-egress-shell',
            title: {
              it: 'Ferma la reverse shell con l’egress',
              en: 'Stop the reverse shell with egress'
            },
            difficulty: 'advanced',
            lab: 'inspection',
            scenario: {
              it: 'Il laboratorio «Ispezione del traffico» mostra quale traffico passa in ingresso e in uscita e dove viene ispezionato.',
              en: 'The “Traffic inspection” lab shows which traffic passes inbound and outbound and where it is inspected.'
            },
            task: {
              it: 'Spiega perché una reverse shell supera il firewall in ingresso e il NAT, e quale controllo sull’uscita la spezza.',
              en: 'Explain why a reverse shell defeats the inbound firewall and NAT, and which control on egress breaks it.'
            },
            steps: [
              {
                it: 'Apri «Ispezione del traffico» e distingui ciò che è permesso in ingresso da ciò che è permesso in uscita.',
                en: 'Open “Traffic inspection” and tell apart what is allowed inbound from what is allowed outbound.'
              },
              {
                it: 'Collega la bind shell all’ingresso bloccato e la reverse shell all’uscita consentita.',
                en: 'Link the bind shell to blocked inbound and the reverse shell to allowed outbound.'
              },
              {
                it: 'Indica quale policy di egress e quale ispezione interrompono la connessione di ritorno.',
                en: 'Point out which egress policy and which inspection break the return connection.'
              }
            ],
            challenge: {
              it: 'Il perimetro blocca ogni ingresso ma l’host interno «chiama fuori» sulla 443: cosa lo rende possibile e come lo si ferma senza rompere il traffico legittimo?',
              en: 'The perimeter blocks all inbound but the internal host “calls out” on 443: what makes it possible and how do you stop it without breaking legitimate traffic?'
            },
            solution: [
              {
                it: 'La reverse shell esce dal target, quindi il firewall in ingresso e il NAT non la vedono; si confonde su porte comuni come la 443 cifrando il canale di comando e controllo. La si ferma con un egress filtering che consente solo destinazioni note (per esempio il proxy), con l’ispezione del traffico e con la segmentazione est-ovest; le sole regole in ingresso non bastano.',
                en: 'The reverse shell leaves the target, so the inbound firewall and NAT do not see it; it blends in on common ports such as 443 by encrypting the command-and-control channel. You stop it with egress filtering that allows only known destinations (for example the proxy), with traffic inspection, and with east-west segmentation; inbound rules alone are not enough.'
              }
            ],
            selfCheck: [
              {
                it: 'So spiegare perché la reverse shell aggira ingresso e NAT.',
                en: 'I can explain why the reverse shell bypasses inbound and NAT.'
              },
              {
                it: 'So indicare il controllo sull’uscita che la spezza.',
                en: 'I can name the egress control that breaks it.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'email-human-security',
    cert: 'securityplus',
    order: 22,
    track: 'extension',
    title: {
      it: 'Sicurezza dell’email e del fattore umano',
      en: 'Email and human-layer security'
    },
    summary: {
      it: 'L’estensione sul vettore d’attacco più usato: l’email. Come SPF, DKIM e DMARC autenticano il mittente, come riconoscere phishing e ingegneria sociale, e come rispondere a BEC e consent phishing con un triage evidence-first. Ogni minaccia è accoppiata al controllo che la riduce e all’evidenza che la rivela.',
      en: 'The extension on the most used attack vector: email. How SPF, DKIM, and DMARC authenticate the sender, how to recognize phishing and social engineering, and how to respond to BEC and consent phishing with an evidence-first triage. Each threat is paired with the control that reduces it and the evidence that reveals it.'
    },
    topics: [
      {
        id: 'email-authentication-spf-dkim-dmarc',
        diagram: 'email',
        title: {
          it: 'Autenticazione dell’email: SPF, DKIM e DMARC',
          en: 'Email authentication: SPF, DKIM, and DMARC'
        },
        objectives: [
          {
            it: 'Spiegare cosa verifica ciascuno di SPF, DKIM e DMARC e perché serve l’allineamento.',
            en: 'Explain what each of SPF, DKIM, and DMARC verifies and why alignment is needed.'
          },
          {
            it: 'Leggere una policy DMARC e dire quale abuso ferma e quale no.',
            en: 'Read a DMARC policy and say which abuse it stops and which it does not.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere il DNS e il concetto di firma digitale (capitoli su servizi IP e su crittografia).',
            en: 'Know DNS and the concept of a digital signature (the IP services and the cryptography chapters).'
          }
        ],
        theory: [
          {
            it: 'Tre meccanismi, pubblicati nel DNS, autenticano un’email e lavorano insieme. SPF (Sender Policy Framework) elenca in un record gli host autorizzati a spedire per un dominio: il ricevente confronta l’IP del mittente con la lista. DKIM (DomainKeys Identified Mail) aggiunge una firma crittografica all’email, verificabile con una chiave pubblica nel DNS: prova che il messaggio non è stato alterato e proviene dal dominio firmatario. DMARC (Domain-based Message Authentication, Reporting and Conformance) le lega in una policy e aggiunge il requisito dell’allineamento: il dominio verificato da SPF o DKIM deve coincidere con quello che l’utente vede nel campo From.',
            en: 'Three mechanisms, published in DNS, authenticate an email and work together. SPF (Sender Policy Framework) lists in a record the hosts authorized to send for a domain: the receiver compares the sender’s IP with the list. DKIM (DomainKeys Identified Mail) adds a cryptographic signature to the email, verifiable with a public key in DNS: it proves the message was not altered and comes from the signing domain. DMARC (Domain-based Message Authentication, Reporting and Conformance) ties them into a policy and adds the alignment requirement: the domain verified by SPF or DKIM must match the one the user sees in the From field.'
          },
          {
            it: 'L’allineamento è il punto che spesso sfugge. Senza DMARC, un attaccante può superare SPF o DKIM usando un dominio proprio e scrivere un From falso, perché SPF e DKIM da soli non guardano il From visibile. DMARC chiede invece che il dominio autenticato sia allineato al From: così un messaggio che finge un dominio altrui fallisce, anche se è tecnicamente firmato per un dominio diverso. La policy DMARC dice al ricevente cosa fare con i messaggi che falliscono: p=none (solo osserva e manda report), p=quarantine (in spam) o p=reject (rifiuta). La policy richiede un trattamento dei fallimenti, ma la decisione finale resta al ricevente: p=reject non è una garanzia assoluta contro lo spoofing.',
            en: 'Alignment is the point that often escapes notice. Without DMARC, an attacker can pass SPF or DKIM using their own domain and write a fake From, because SPF and DKIM alone do not look at the visible From. DMARC instead requires that the authenticated domain be aligned with the From: so a message faking another’s domain fails, even if it is technically signed for a different domain. The DMARC policy tells the receiver what to do with messages that fail: p=none (only observe and send reports), p=quarantine (to spam), or p=reject (refuse). The policy requests handling of failures, but the final decision remains with the receiver: p=reject is not an absolute guarantee against spoofing.'
          },
          {
            it: 'Resta un limite importante da tenere a mente: DMARC protegge il dominio che l’utente vede nel From, non lo protegge da un dominio diverso ma somigliante. Un attaccante che registra un dominio lookalike supera SPF, DKIM e DMARC perfettamente, perché autentica il proprio dominio: l’autenticazione dell’email risolve lo spoofing esatto, non l’inganno visivo. Per questo l’autenticazione è la base necessaria ma non sufficiente, e va completata dai controlli sul phishing e dalla consapevolezza dell’utente trattati negli argomenti successivi.',
            en: 'An important limit remains to keep in mind: DMARC protects the domain the user sees in the From, it does not protect against a different but similar domain. An attacker who registers a lookalike domain passes SPF, DKIM, and DMARC perfectly, because they authenticate their own domain: email authentication solves exact spoofing, not visual deception. This is why authentication is the necessary but not sufficient base, and it must be completed by the phishing controls and user awareness covered in the following topics.'
          }
        ],
        example: {
          it: 'Un messaggio che finge il dominio example.test con un From falso fallisce DMARC quando nessun risultato SPF o DKIM valido è allineato al From, indipendentemente dalla policy p=none, p=quarantine o p=reject; ma un messaggio da un dominio lookalike registrato dall’attaccante supera SPF, DKIM e DMARC, perché autentica il proprio dominio, non quello imitato.',
          en: 'A message faking the domain example.test with a forged From fails DMARC when no passing SPF or DKIM result aligns with From, regardless of the p=none, p=quarantine or p=reject policy; but a message from a lookalike domain registered by the attacker passes SPF, DKIM, and DMARC, because it authenticates its own domain, not the imitated one.'
        },
        commonMistakes: [
          {
            it: 'Credere che SPF o DKIM da soli fermino il From falso: senza l’allineamento di DMARC non guardano il From visibile.',
            en: 'Believing SPF or DKIM alone stop a forged From: without DMARC alignment they do not look at the visible From.'
          },
          {
            it: 'Lasciare DMARC a p=none pensando di essere protetti: osserva soltanto, non rifiuta nulla.',
            en: 'Leaving DMARC at p=none thinking you are protected: it only observes, it refuses nothing.'
          },
          {
            it: 'Aspettarsi che DMARC fermi i domini lookalike: autentica il From esatto, non un dominio somigliante.',
            en: 'Expecting DMARC to stop lookalike domains: it authenticates the exact From, not a similar domain.'
          }
        ],
        lab: 'emailsecurity',
        references: [{ kind: 'rfc', id: 'RFC 7489' }],
        guidedLabs: [
          {
            id: 'gl-email-auth-alignment',
            title: {
              it: 'Quando l’autenticazione ferma lo spoofing',
              en: 'When authentication stops spoofing'
            },
            difficulty: 'core',
            lab: 'emailsecurity',
            scenario: {
              it: 'Il laboratorio «Email e phishing» mette in scena la catena di consegna con SPF, DKIM, DMARC e l’allineamento.',
              en: 'The “Email and phishing” lab stages the delivery chain with SPF, DKIM, DMARC, and alignment.'
            },
            task: {
              it: 'Per due messaggi distingui cosa autenticano SPF e DKIM, se c’è allineamento DMARC, e di’ quale spoofing viene fermato e quale no.',
              en: 'For two messages distinguish what SPF and DKIM authenticate, whether there is DMARC alignment, and say which spoofing is stopped and which is not.'
            },
            steps: [
              {
                it: 'Apri «Email e phishing» e seleziona lo scenario su SPF, DKIM e DMARC.',
                en: 'Open “Email and phishing” and select the scenario on SPF, DKIM, and DMARC.'
              },
              {
                it: 'Per ogni messaggio verifica il dominio autenticato e se è allineato al From.',
                en: 'For each message check the authenticated domain and whether it is aligned with the From.'
              },
              {
                it: 'Indica l’esito con policy p=reject e perché un dominio lookalike lo supererebbe.',
                en: 'State the outcome under a p=reject policy and why a lookalike domain would pass it.'
              }
            ],
            challenge: {
              it: 'Un messaggio passa SPF ma fallisce DMARC: cosa significa sul dominio che ha autenticato, e perché il ricevente lo tratta come spoofing?',
              en: 'A message passes SPF but fails DMARC: what does it mean about the domain it authenticated, and why does the receiver treat it as spoofing?'
            },
            solution: [
              {
                it: 'SPF verifica che l’IP mittente sia autorizzato per un dominio; DKIM verifica una firma legata a un dominio; DMARC chiede che quel dominio sia allineato al From visibile e, con p=reject, rifiuta chi non lo è. Un From falso su un dominio protetto fallisce; un dominio lookalike supera tutto perché autentica sé stesso, non quello imitato — lì serve il riconoscimento del phishing, non l’autenticazione.',
                en: 'SPF verifies the sender IP is authorized for a domain; DKIM verifies a signature bound to a domain; DMARC requires that domain to be aligned with the visible From and, with p=reject, refuses whoever is not. A forged From on a protected domain fails; a lookalike domain passes everything because it authenticates itself, not the imitated one — there you need phishing recognition, not authentication.'
              },
              {
                it: 'Sfida: passare SPF ma fallire DMARC significa che l’IP era autorizzato per un dominio diverso da quello del From, cioè manca l’allineamento; il ricevente lo tratta come spoofing perché l’identità che l’utente vede non è quella autenticata.',
                en: 'Challenge: passing SPF but failing DMARC means the IP was authorized for a domain different from the From, that is, alignment is missing; the receiver treats it as spoofing because the identity the user sees is not the authenticated one.'
              }
            ],
            selfCheck: [
              {
                it: 'So dire cosa autenticano SPF, DKIM e DMARC e perché serve l’allineamento.',
                en: 'I can say what SPF, DKIM, and DMARC authenticate and why alignment is needed.'
              },
              {
                it: 'So distinguere lo spoofing diretto, che DMARC ferma, dal dominio lookalike, che non ferma.',
                en: 'I can distinguish direct spoofing, which DMARC stops, from a lookalike domain, which it does not.'
              }
            ]
          }
        ]
      },
      {
        id: 'phishing-social-engineering',
        title: {
          it: 'Phishing e ingegneria sociale',
          en: 'Phishing and social engineering'
        },
        objectives: [
          {
            it: 'Riconoscere gli indicatori di phishing nel mittente, nei link e negli allegati.',
            en: 'Recognize phishing indicators in the sender, the links, and the attachments.'
          },
          {
            it: 'Collegare le leve psicologiche dell’inganno alle difese tecniche e umane.',
            en: 'Link the psychological levers of deception to the technical and human defenses.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere l’autenticazione dell’email e i suoi limiti (argomento precedente).',
            en: 'Know email authentication and its limits (previous topic).'
          }
        ],
        theory: [
          {
            it: 'Dove l’autenticazione finisce, inizia l’inganno. Il phishing imita un mittente fidato per far compiere un’azione: cliccare, aprire, pagare, rivelare credenziali. Gli indicatori tecnici stanno nel mittente — un dominio lookalike, un display name che non coincide con l’indirizzo reale, un reply-to diverso dal From — e nei link, dove l’URL mostrato può differire dalla destinazione, nascondersi dietro uno shortener o un QR code, o passare per redirect multipli. Gli allegati portano il payload in archivi o documenti con macro. Riconoscere questi segni è una lettura attenta, la stessa disciplina dell’analisi di una richiesta web.',
            en: 'Where authentication ends, deception begins. Phishing imitates a trusted sender to make you perform an action: click, open, pay, reveal credentials. The technical indicators are in the sender — a lookalike domain, a display name that does not match the real address, a reply-to different from the From — and in the links, where the shown URL may differ from the destination, hide behind a shortener or a QR code, or pass through multiple redirects. Attachments carry the payload in archives or documents with macros. Recognizing these signs is careful reading, the same discipline as analyzing a web request.'
          },
          {
            it: 'La parte difficile non è tecnica ma umana. Il phishing funziona sfruttando leve psicologiche: l’urgenza («entro oggi»), l’autorità (un dirigente che ordina), la paura (un account bloccato), la curiosità o l’avidità. Queste leve spingono ad agire prima di pensare, ed è per questo che anche un utente informato può cadere sotto pressione. Difendersi significa togliere valore all’azione affrettata: processi che non dipendono da un singolo messaggio, verifiche fuori banda per le richieste sensibili, e la normalità di fermarsi a controllare senza timore di sembrare lenti.',
            en: 'The hard part is not technical but human. Phishing works by exploiting psychological levers: urgency («by today»), authority (an executive giving an order), fear (a locked account), curiosity, or greed. These levers push you to act before thinking, and this is why even an informed user can fall under pressure. Defending means removing the value of the hasty action: processes that do not depend on a single message, out-of-band verification for sensitive requests, and making it normal to stop and check without fear of seeming slow.'
          },
          {
            it: 'La difesa è a strati, nessuno dei quali basta da solo. L’autenticazione dell’email e i filtri riducono il volume; la riscrittura e l’analisi dei link e il sandboxing degli allegati fermano parte del resto; ma l’ultimo strato è l’utente, ed è per questo che la segnalazione facile è un controllo di sicurezza, non una formalità: un utente che segnala trasforma un singolo bersaglio in un sensore per tutti gli altri. L’obiettivo non è un utente che non sbaglia mai, ma un sistema in cui un errore è reversibile, rilevabile e segnalato in fretta.',
            en: 'The defense is layered, none of which is enough alone. Email authentication and filters reduce the volume; link rewriting and analysis and attachment sandboxing stop part of the rest; but the last layer is the user, and this is why easy reporting is a security control, not a formality: a user who reports turns a single target into a sensor for everyone else. The goal is not a user who never errs, but a system in which an error is reversible, detectable, and reported quickly.'
          }
        ],
        example: {
          it: 'Un’email che sembra di un collega chiede con urgenza di aprire un allegato: il display name coincide ma l’indirizzo reale è un dominio lookalike, il reply-to è diverso e il link passa per uno shortener; il controllo fuori banda e la segnalazione fermano l’azione prima che il payload parta.',
          en: 'An email that looks like it is from a colleague urgently asks to open an attachment: the display name matches but the real address is a lookalike domain, the reply-to is different, and the link passes through a shortener; out-of-band verification and reporting stop the action before the payload runs.'
        },
        commonMistakes: [
          {
            it: 'Fidarsi del display name: è testo libero; conta l’indirizzo reale e l’allineamento, non il nome mostrato.',
            en: 'Trusting the display name: it is free text; what counts is the real address and alignment, not the shown name.'
          },
          {
            it: 'Giudicare un link dal testo visibile: la destinazione può differire, nascondersi in un QR o passare per redirect.',
            en: 'Judging a link by its visible text: the destination can differ, hide in a QR, or pass through redirects.'
          },
          {
            it: 'Trattare la formazione come l’unica difesa: serve, ma senza processi fuori banda e segnalazione facile l’errore resta irreversibile.',
            en: 'Treating training as the only defense: it helps, but without out-of-band processes and easy reporting the error stays irreversible.'
          }
        ],
        lab: 'emailsecurity',
        references: [{ kind: 'attack', id: 'T1566' }],
        guidedLabs: [
          {
            id: 'gl-phishing-indicators',
            title: {
              it: 'Leggi gli indicatori di un phishing',
              en: 'Read a phishing’s indicators'
            },
            difficulty: 'core',
            lab: 'emailsecurity',
            scenario: {
              it: 'Il laboratorio «Email e phishing» mostra messaggi con display name, domini lookalike, reply-to e link da esaminare.',
              en: 'The “Email and phishing” lab shows messages with display names, lookalike domains, reply-to, and links to examine.'
            },
            task: {
              it: 'Da un messaggio elenca gli indicatori tecnici e la leva psicologica usata, e indica il controllo che spezza l’azione.',
              en: 'From a message list the technical indicators and the psychological lever used, and point out the control that breaks the action.'
            },
            steps: [
              {
                it: 'Apri «Email e phishing» e scegli uno scenario di display name o lookalike.',
                en: 'Open “Email and phishing” and pick a display-name or lookalike scenario.'
              },
              {
                it: 'Confronta display name, indirizzo reale, reply-to e destinazione del link.',
                en: 'Compare the display name, real address, reply-to, and the link destination.'
              },
              {
                it: 'Nomina la leva psicologica e il controllo (verifica fuori banda, segnalazione) che la neutralizza.',
                en: 'Name the psychological lever and the control (out-of-band verification, reporting) that neutralizes it.'
              }
            ],
            challenge: {
              it: 'Il messaggio passa l’autenticazione dell’email ma resta phishing: com’è possibile e quale difesa resta a fermarlo?',
              en: 'The message passes email authentication but is still phishing: how is that possible and which defense is left to stop it?'
            },
            solution: [
              {
                it: 'Gli indicatori tecnici stanno nel mittente (dominio lookalike, display name che non coincide con l’indirizzo, reply-to diverso) e nei link (destinazione diversa dal testo, shortener, QR, redirect). La leva è psicologica — urgenza, autorità, paura. Il controllo che spezza l’azione è la verifica fuori banda per le richieste sensibili e la segnalazione facile, che rende l’errore rilevabile e reversibile.',
                en: 'The technical indicators are in the sender (lookalike domain, display name not matching the address, different reply-to) and in the links (destination different from the text, shortener, QR, redirect). The lever is psychological — urgency, authority, fear. The control that breaks the action is out-of-band verification for sensitive requests and easy reporting, which makes the error detectable and reversible.'
              },
              {
                it: 'Sfida: un phishing passa l’autenticazione quando l’attaccante usa un dominio lookalike che autentica sé stesso; a quel punto l’autenticazione non aiuta e restano il riconoscimento degli indicatori, i processi fuori banda e la segnalazione.',
                en: 'Challenge: a phishing passes authentication when the attacker uses a lookalike domain that authenticates itself; at that point authentication does not help and what remains is indicator recognition, out-of-band processes, and reporting.'
              }
            ],
            selfCheck: [
              {
                it: 'So elencare gli indicatori di phishing nel mittente, nei link e negli allegati.',
                en: 'I can list phishing indicators in the sender, the links, and the attachments.'
              },
              {
                it: 'So collegare la leva psicologica alla difesa umana e di processo che la neutralizza.',
                en: 'I can link the psychological lever to the human and process defense that neutralizes it.'
              }
            ]
          }
        ]
      },
      {
        id: 'bec-consent-response',
        title: {
          it: 'BEC, consent phishing e risposta evidence-first',
          en: 'BEC, consent phishing, and evidence-first response'
        },
        objectives: [
          {
            it: 'Distinguere BEC e consent phishing dagli attacchi con payload e dire perché eludono i filtri.',
            en: 'Distinguish BEC and consent phishing from payload attacks and say why they evade filters.'
          },
          {
            it: 'Descrivere una risposta evidence-first: contenere, raccogliere evidenza, recuperare.',
            en: 'Describe an evidence-first response: contain, gather evidence, recover.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere il phishing e il modello di autorizzazione (argomenti precedenti e capitolo su AAA).',
            en: 'Know phishing and the authorization model (previous topics and the AAA chapter).'
          }
        ],
        theory: [
          {
            it: 'Gli attacchi più costosi spesso non portano alcun payload. Nel BEC (Business Email Compromise) l’attaccante impersona un dirigente o un fornitore e, con il solo testo, ordina un bonifico o un cambio di coordinate bancarie; il thread hijacking inserisce la richiesta in una conversazione reale già in corso, così sembra legittima. Non c’è link né allegato da analizzare: il filtro tecnico ha poco su cui lavorare, e la difesa diventa il processo — verifica fuori banda obbligatoria per i pagamenti, doppio controllo sui cambi di coordinate, autorità che non si esercita via una sola email.',
            en: 'The costliest attacks often carry no payload at all. In BEC (Business Email Compromise) the attacker impersonates an executive or a supplier and, with text alone, orders a wire transfer or a change of bank details; thread hijacking inserts the request into a real conversation already in progress, so it looks legitimate. There is no link or attachment to analyze: the technical filter has little to work on, and the defense becomes the process — mandatory out-of-band verification for payments, a double check on detail changes, authority that is not exercised through a single email.'
          },
          {
            it: 'Il consent phishing sposta l’inganno sull’autorizzazione. Invece di rubare la password, l’attaccante induce l’utente ad autorizzare un’applicazione malevola tramite OAuth: l’utente concede il consenso e l’app ottiene un token che le dà accesso a email o dati senza conoscere la password, e sopravvive al cambio password e spesso alla stessa MFA. È l’equivalente, sul piano dell’identità, di una porta lasciata aperta volontariamente. La difesa è governare i consensi — limitare quali app possono essere autorizzate, revisionare i permessi concessi, poter revocare i token — perché qui il controllo degli accessi, non l’autenticazione, è il confine.',
            en: 'Consent phishing shifts the deception to authorization. Instead of stealing the password, the attacker induces the user to authorize a malicious application via OAuth: the user grants consent and the app obtains a token that gives it access to email or data without knowing the password, and it survives a password change and often MFA itself. It is the identity-layer equivalent of a door deliberately left open. The defense is to govern consents — limit which apps can be authorized, review granted permissions, be able to revoke tokens — because here access control, not authentication, is the boundary.'
          },
          {
            it: 'Quando qualcosa passa, conta la risposta, e va fatta evidence-first. Prima si contiene — revocare le sessioni e i token, bloccare un bonifico, isolare un account — poi si raccoglie l’evidenza prima che sparisca: intestazioni complete del messaggio, log di accesso, consensi OAuth concessi, regole di posta create dall’attaccante (un classico del BEC è una regola che nasconde le risposte). Solo dopo si recupera e si chiude la causa. L’ordine conta: agire senza raccogliere evidenza acceca l’indagine, raccogliere senza contenere lascia correre il danno. La segnalazione rapida dell’utente è ciò che fa partire tutto in tempo.',
            en: 'When something gets through, the response matters, and it must be evidence-first. First you contain — revoke sessions and tokens, stop a transfer, isolate an account — then you gather the evidence before it disappears: full message headers, access logs, granted OAuth consents, mail rules created by the attacker (a BEC classic is a rule that hides the replies). Only then do you recover and close the root cause. The order matters: acting without gathering evidence blinds the investigation, gathering without containing lets the damage run. The user’s quick report is what sets it all off in time.'
          }
        ],
        example: {
          it: 'Un fornitore su example.test chiede via email di aggiornare le coordinate per il prossimo pagamento: nessun link, solo testo in un thread reale; la verifica fuori banda ferma il BEC, mentre un consenso OAuth sospetto viene revocato e le regole di posta create dall’attaccante entrano nell’evidenza prima del recovery.',
          en: 'A supplier on example.test asks by email to update the details for the next payment: no link, only text in a real thread; out-of-band verification stops the BEC, while a suspicious OAuth consent is revoked and the mail rules created by the attacker enter the evidence before recovery.'
        },
        commonMistakes: [
          {
            it: 'Cercare un link o un allegato in un BEC: l’inganno è nel testo e nel processo, non in un payload.',
            en: 'Looking for a link or attachment in a BEC: the deception is in the text and the process, not in a payload.'
          },
          {
            it: 'Credere che il cambio password fermi il consent phishing: il token OAuth concesso sopravvive; va revocato.',
            en: 'Believing a password change stops consent phishing: the granted OAuth token survives; it must be revoked.'
          },
          {
            it: 'Recuperare prima di raccogliere l’evidenza: cancella le tracce (regole di posta, log) che spiegano l’incidente.',
            en: 'Recovering before gathering the evidence: it erases the traces (mail rules, logs) that explain the incident.'
          }
        ],
        lab: 'emailsecurity',
        references: [{ kind: 'attack', id: 'T1566.002' }],
        guidedLabs: [
          {
            id: 'gl-bec-evidence-first',
            title: {
              it: 'Rispondi a un BEC senza perdere l’evidenza',
              en: 'Respond to a BEC without losing the evidence'
            },
            difficulty: 'advanced',
            lab: 'emailsecurity',
            scenario: {
              it: 'Il laboratorio «Email e phishing» mette in scena BEC, consent phishing e il triage evidence-first.',
              en: 'The “Email and phishing” lab stages BEC, consent phishing, and the evidence-first triage.'
            },
            task: {
              it: 'Ordina le azioni di risposta (contenere, raccogliere evidenza, recuperare) e di’ perché il cambio password non basta per il consent phishing.',
              en: 'Order the response actions (contain, gather evidence, recover) and say why a password change is not enough for consent phishing.'
            },
            steps: [
              {
                it: 'Apri «Email e phishing» e seleziona lo scenario di BEC o consent phishing.',
                en: 'Open “Email and phishing” and select the BEC or consent-phishing scenario.'
              },
              {
                it: 'Elenca l’evidenza da raccogliere (intestazioni, log, consensi OAuth, regole di posta).',
                en: 'List the evidence to gather (headers, logs, OAuth consents, mail rules).'
              },
              {
                it: 'Metti in ordine contenimento, raccolta ed evidenza, e recovery, spiegando l’ordine.',
                en: 'Put containment, gathering and evidence, and recovery in order, explaining the order.'
              }
            ],
            challenge: {
              it: 'Dopo un consent phishing la password è stata cambiata ma l’accesso continua: cosa è stato dimenticato e come lo chiudi?',
              en: 'After a consent phishing the password was changed but access continues: what was forgotten and how do you close it?'
            },
            solution: [
              {
                it: 'Il BEC e il consent phishing non portano payload: il primo inganna con testo e processo, il secondo ottiene un token OAuth. La risposta è evidence-first: prima contenere (revocare sessioni e token, bloccare pagamenti), poi raccogliere l’evidenza prima che sparisca (intestazioni, log, consensi, regole di posta create dall’attaccante), infine recuperare. Il cambio password non revoca il token OAuth, che va revocato esplicitamente.',
                en: 'BEC and consent phishing carry no payload: the first deceives with text and process, the second obtains an OAuth token. The response is evidence-first: first contain (revoke sessions and tokens, stop payments), then gather the evidence before it disappears (headers, logs, consents, mail rules created by the attacker), finally recover. A password change does not revoke the OAuth token, which must be revoked explicitly.'
              },
              {
                it: 'Sfida: se l’accesso continua dopo il cambio password, è stato dimenticato il token OAuth concesso all’app malevola; si chiude revocando il consenso e i token dell’app, non cambiando di nuovo la password.',
                en: 'Challenge: if access continues after the password change, the OAuth token granted to the malicious app was forgotten; you close it by revoking the app’s consent and tokens, not by changing the password again.'
              }
            ],
            selfCheck: [
              {
                it: 'So dire perché BEC e consent phishing eludono i filtri basati su payload.',
                en: 'I can say why BEC and consent phishing evade payload-based filters.'
              },
              {
                it: 'So ordinare una risposta evidence-first e spiegare perché il token OAuth va revocato.',
                en: 'I can order an evidence-first response and explain why the OAuth token must be revoked.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'endpoint-security-posture',
    cert: 'securityplus',
    order: 23,
    track: 'extension',
    title: {
      it: 'Sicurezza dell’endpoint e postura',
      en: 'Endpoint security and posture'
    },
    summary: {
      it: 'L’estensione sul punto in cui l’attacco atterra: l’host. Dall’inventario e dalla baseline al patching basato sul rischio, dall’EDR e l’application control alla postura continua e all’isolamento in risposta. È il complemento difensivo della post-exploitation: dove l’offensiva cerca privilegi e persistenza, l’endpoint li contiene e li rivela.',
      en: 'The extension on where the attack lands: the host. From inventory and the baseline to risk-based patching, from EDR and application control to continuous posture and isolation in response. It is the defensive complement of post-exploitation: where the offensive seeks privileges and persistence, the endpoint contains and reveals them.'
    },
    topics: [
      {
        id: 'endpoint-inventory-baseline-patching',
        title: {
          it: 'Inventario, baseline e patching basato sul rischio',
          en: 'Inventory, baseline, and risk-based patching'
        },
        objectives: [
          {
            it: 'Spiegare perché inventario e baseline precedono ogni altro controllo sull’endpoint.',
            en: 'Explain why inventory and the baseline precede every other control on the endpoint.'
          },
          {
            it: 'Prioritizzare il patching in base al rischio invece che al numero di vulnerabilità.',
            en: 'Prioritize patching by risk instead of by the number of vulnerabilities.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere la gestione delle vulnerabilità e la difesa in profondità (capitoli sui fondamenti di sicurezza).',
            en: 'Know vulnerability management and defense in depth (the security fundamentals chapters).'
          }
        ],
        theory: [
          {
            it: 'La sicurezza dell’endpoint inizia da ciò che spesso manca: sapere cosa si possiede. Un inventario completo di host, proprietario e ruolo è la precondizione di ogni controllo, perché un dispositivo non gestito — fuori inventario, senza agente, senza baseline — è il punto cieco da cui parte la maggior parte delle compromissioni. Sapere cosa esiste permette poi di definire una baseline sicura: la configurazione attesa di un host conforme. Il nemico della baseline è il configuration drift, lo scostamento che si accumula nel tempo; rilevarlo e riportare l’host alla baseline è un controllo continuo, non un’attività una tantum.',
            en: 'Endpoint security starts from what is often missing: knowing what you own. A complete inventory of hosts, owner, and role is the precondition of every control, because an unmanaged device — out of inventory, without an agent, without a baseline — is the blind spot most compromises start from. Knowing what exists then lets you define a secure baseline: the expected configuration of a compliant host. The enemy of the baseline is configuration drift, the deviation that accumulates over time; detecting it and returning the host to the baseline is a continuous control, not a one-off activity.'
          },
          {
            it: 'Il patching è il controllo più citato e il più frainteso. Non si possono applicare tutte le patch subito, e trattarle tutte come uguali spreca la finestra di intervento sulle cose sbagliate. Il patching basato sul rischio ordina gli interventi per la combinazione di gravità della vulnerabilità, esposizione reale dell’host (è raggiungibile? il servizio è attivo?) e sfruttabilità nota: una vulnerabilità critica su un host esposto e con exploit disponibile viene prima di una critica su un host isolato e non sfruttabile. Il numero di vulnerabilità non è una metrica di rischio; il rischio è ciò che un attaccante può davvero raggiungere e usare.',
            en: 'Patching is the most cited and most misunderstood control. You cannot apply every patch at once, and treating them all as equal wastes the intervention window on the wrong things. Risk-based patching orders the work by the combination of the vulnerability’s severity, the host’s real exposure (is it reachable? is the service active?), and known exploitability: a critical vulnerability on an exposed host with an available exploit comes before a critical one on an isolated, non-exploitable host. The number of vulnerabilities is not a risk metric; the risk is what an attacker can actually reach and use.'
          },
          {
            it: 'Questi tre controlli si sostengono a vicenda ed è lì la loro forza. L’inventario dice quali host esistono; la baseline dice come dovrebbero essere configurati; il patching basato sul rischio decide dove intervenire prima. Senza inventario, patching e baseline hanno buchi invisibili; senza baseline, il drift riapre ciò che il patching aveva chiuso; senza priorità di rischio, lo sforzo si disperde. È la stessa logica della ricognizione vista dal lato offensivo, ribaltata in difesa: conoscere la propria superficie meglio di chi la attacca.',
            en: 'These three controls support one another, and that is their strength. The inventory says which hosts exist; the baseline says how they should be configured; risk-based patching decides where to act first. Without inventory, patching and the baseline have invisible gaps; without the baseline, drift reopens what patching had closed; without risk priority, effort is scattered. It is the same logic as reconnaissance seen from the offensive side, flipped into defense: knowing your own surface better than whoever attacks it.'
          }
        ],
        example: {
          it: 'Su un host in 192.0.2.0/24 fuori inventario, senza baseline né agente, una vulnerabilità critica resta scoperta; una volta inventariato e portato alla baseline, il patching basato sul rischio la tratta prima di una pari gravità su un host isolato, perché esposizione e sfruttabilità, non il solo numero, ordinano l’intervento.',
          en: 'On a host in 192.0.2.0/24 that is out of inventory, without a baseline or an agent, a critical vulnerability stays uncovered; once inventoried and brought to the baseline, risk-based patching handles it before an equally severe one on an isolated host, because exposure and exploitability, not the number alone, order the work.'
        },
        commonMistakes: [
          {
            it: 'Proteggere senza inventariare: un dispositivo non gestito è il punto cieco da cui parte la compromissione.',
            en: 'Protecting without inventorying: an unmanaged device is the blind spot the compromise starts from.'
          },
          {
            it: 'Misurare la sicurezza col numero di patch mancanti: conta il rischio, cioè esposizione e sfruttabilità, non il conteggio.',
            en: 'Measuring security by the number of missing patches: what counts is risk — exposure and exploitability — not the count.'
          },
          {
            it: 'Trattare la baseline come una tantum: senza rilevare il drift l’host torna insicuro tra un controllo e l’altro.',
            en: 'Treating the baseline as a one-off: without detecting drift the host becomes insecure again between checks.'
          }
        ],
        lab: 'endpointsecurity',
        references: [{ kind: 'nist', id: 'SP 800-40 Rev. 4' }],
        guidedLabs: [
          {
            id: 'gl-endpoint-risk-patch',
            title: {
              it: 'Ordina il patching per rischio',
              en: 'Order patching by risk'
            },
            difficulty: 'core',
            lab: 'endpointsecurity',
            scenario: {
              it: 'Il laboratorio «Endpoint e postura» mette in scena inventario, baseline e vulnerabilità con la loro esposizione.',
              en: 'The “Endpoint and posture” lab stages inventory, the baseline, and vulnerabilities with their exposure.'
            },
            task: {
              it: 'Date più vulnerabilità su host diversi, ordinale per rischio e spiega perché il numero da solo non basta.',
              en: 'Given several vulnerabilities on different hosts, order them by risk and explain why the number alone is not enough.'
            },
            steps: [
              {
                it: 'Apri «Endpoint e postura» e osserva lo stato di inventario e baseline degli host.',
                en: 'Open “Endpoint and posture” and observe the inventory and baseline state of the hosts.'
              },
              {
                it: 'Per ogni vulnerabilità nota gravità, esposizione dell’host e sfruttabilità.',
                en: 'For each vulnerability note the severity, the host’s exposure, and exploitability.'
              },
              {
                it: 'Ordina gli interventi e motiva la priorità con il rischio, non con il conteggio.',
                en: 'Order the work and justify the priority by risk, not by the count.'
              }
            ],
            challenge: {
              it: 'Un host ha più vulnerabilità di un altro ma va patchato dopo: quali condizioni lo giustificano?',
              en: 'One host has more vulnerabilities than another but is patched later: which conditions justify that?'
            },
            solution: [
              {
                it: 'Il rischio ordina gli interventi per gravità, esposizione reale (raggiungibilità, servizio attivo) e sfruttabilità nota: una critica su host esposto e con exploit disponibile precede una critica su host isolato. L’inventario rende visibili gli host non gestiti e la baseline tiene fermo ciò che il patching ha chiuso; il numero di vulnerabilità non è una metrica di rischio.',
                en: 'Risk orders the work by severity, real exposure (reachability, active service), and known exploitability: a critical one on an exposed host with an available exploit precedes a critical one on an isolated host. The inventory makes unmanaged hosts visible and the baseline holds what patching closed; the number of vulnerabilities is not a risk metric.'
              },
              {
                it: 'Sfida: un host con più vulnerabilità va dopo quando è isolato e non sfruttabile mentre l’altro è esposto con exploit disponibile; l’esposizione e la sfruttabilità, non il conteggio, decidono la priorità.',
                en: 'Challenge: a host with more vulnerabilities comes later when it is isolated and not exploitable while the other is exposed with an available exploit; exposure and exploitability, not the count, decide the priority.'
              }
            ],
            selfCheck: [
              {
                it: 'So dire perché inventario e baseline precedono gli altri controlli sull’endpoint.',
                en: 'I can say why inventory and the baseline precede the other endpoint controls.'
              },
              {
                it: 'So ordinare il patching per rischio invece che per numero di vulnerabilità.',
                en: 'I can order patching by risk instead of by the number of vulnerabilities.'
              }
            ]
          }
        ]
      },
      {
        id: 'endpoint-edr-application-control',
        title: {
          it: 'EDR, host firewall e application control',
          en: 'EDR, host firewall, and application control'
        },
        objectives: [
          {
            it: 'Descrivere cosa osserva un EDR e perché copertura, sensor health e tamper protection contano.',
            en: 'Describe what an EDR observes and why coverage, sensor health, and tamper protection matter.'
          },
          {
            it: 'Collegare host firewall e application control alle classi di minaccia che riducono.',
            en: 'Link the host firewall and application control to the threat classes they reduce.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere inventario e baseline dell’endpoint (argomento precedente) e la post-exploitation (percorso eJPT).',
            en: 'Know endpoint inventory and the baseline (previous topic) and post-exploitation (the eJPT path).'
          }
        ],
        theory: [
          {
            it: 'L’EDR (Endpoint Detection and Response) osserva ciò che accade sull’host — processi, comportamenti, accessi — e rileva i segni della post-exploitation che la rete non vede: un processo privilegiato anomalo, un dump di credenziali, un meccanismo di avvio aggiunto. Ma un EDR vale quanto la sua copertura: un host senza agente è invisibile, un sensore spento o manomesso non riporta, e per questo la copertura, la sensor health e la tamper protection sono controlli di primo livello. Un attaccante esperto cerca proprio di disattivare o aggirare l’EDR; monitorarne lo stato è parte della difesa, non un dettaglio operativo.',
            en: 'EDR (Endpoint Detection and Response) observes what happens on the host — processes, behaviors, accesses — and detects the signs of post-exploitation the network does not see: an anomalous privileged process, a credential dump, an added startup mechanism. But an EDR is worth only its coverage: a host without an agent is invisible, a sensor that is off or tampered with does not report, and this is why coverage, sensor health, and tamper protection are first-class controls. A skilled attacker tries precisely to disable or bypass the EDR; monitoring its state is part of the defense, not an operational detail.'
          },
          {
            it: 'Due controlli preventivi affiancano la detection. L’host firewall non guarda al perimetro ma al traffico east–west, tra host interni: limita quali connessioni un host accetta e inizia, riducendo proprio il movimento laterale che la post-exploitation usa per propagarsi. L’application control decide quale codice può eseguire sull’host: consentire solo applicazioni note e bloccare script e macro non autorizzati chiude molte catene d’attacco alla radice, perché un payload che non può eseguire non fa danni. Insieme, firewall e application control riducono la superficie che l’EDR dovrà altrimenti rilevare dopo.',
            en: 'Two preventive controls flank the detection. The host firewall does not look at the perimeter but at east–west traffic, between internal hosts: it limits which connections a host accepts and initiates, reducing exactly the lateral movement that post-exploitation uses to spread. Application control decides which code may run on the host: allowing only known applications and blocking unauthorized scripts and macros closes many attack chains at the root, because a payload that cannot run does no harm. Together, the firewall and application control reduce the surface the EDR would otherwise have to detect later.'
          },
          {
            it: 'La logica è la difesa in profondità applicata all’host: l’application control e l’host firewall prevengono, l’EDR rileva ciò che passa, e la postura (argomento successivo) verifica che tutto questo sia attivo prima di concedere accesso. Nessuno dei tre basta da solo: l’application control si può aggirare con tecniche note, l’host firewall non vede ciò che è già in esecuzione, l’EDR non protegge un host che non ha agente. È la loro combinazione, misurata dalla copertura, a rendere l’endpoint un livello di difesa e non solo un bersaglio.',
            en: 'The logic is defense in depth applied to the host: application control and the host firewall prevent, the EDR detects what gets through, and posture (the next topic) verifies that all of this is active before granting access. None of the three is enough alone: application control can be bypassed with known techniques, the host firewall does not see what is already running, the EDR does not protect a host that has no agent. It is their combination, measured by coverage, that makes the endpoint a layer of defense and not just a target.'
          }
        ],
        example: {
          it: 'Dopo un accesso iniziale, l’application control impedisce l’esecuzione di uno script non autorizzato, l’host firewall blocca la connessione east–west verso un secondo host, e l’EDR — con sensore integro e non manomesso — segnala il processo anomalo: tre livelli, misurati dalla copertura, contro una stessa catena.',
          en: 'After an initial access, application control prevents an unauthorized script from running, the host firewall blocks the east–west connection toward a second host, and the EDR — with an intact, untampered sensor — flags the anomalous process: three layers, measured by coverage, against one chain.'
        },
        commonMistakes: [
          {
            it: 'Fidarsi dell’EDR senza misurarne la copertura: un host senza agente o con sensore spento è invisibile.',
            en: 'Trusting the EDR without measuring its coverage: a host without an agent or with a sensor off is invisible.'
          },
          {
            it: 'Pensare che il firewall perimetrale basti: il movimento laterale è east–west e lo limita l’host firewall.',
            en: 'Thinking the perimeter firewall is enough: lateral movement is east–west and the host firewall limits it.'
          },
          {
            it: 'Trascurare script e macro: senza application control un payload che non è un eseguibile classico passa lo stesso.',
            en: 'Neglecting scripts and macros: without application control a payload that is not a classic executable passes anyway.'
          }
        ],
        lab: 'endpointsecurity',
        references: [{ kind: 'attack', id: 'T1562.001' }],
        guidedLabs: [
          {
            id: 'gl-endpoint-defense-layers',
            title: {
              it: 'Componi i livelli di difesa dell’host',
              en: 'Compose the host defense layers'
            },
            difficulty: 'advanced',
            lab: 'endpointsecurity',
            scenario: {
              it: 'Il laboratorio «Endpoint e postura» mostra EDR, host firewall e application control e il loro stato.',
              en: 'The “Endpoint and posture” lab shows EDR, the host firewall, and application control and their state.'
            },
            task: {
              it: 'Per una catena post-accesso indica quale livello previene, quale rileva e perché la copertura dell’EDR è decisiva.',
              en: 'For a post-access chain state which layer prevents, which detects, and why EDR coverage is decisive.'
            },
            steps: [
              {
                it: 'Apri «Endpoint e postura» e osserva copertura e sensor health dell’EDR.',
                en: 'Open “Endpoint and posture” and observe EDR coverage and sensor health.'
              },
              {
                it: 'Attribuisci all’application control e all’host firewall ciò che prevengono.',
                en: 'Attribute to application control and the host firewall what they prevent.'
              },
              {
                it: 'Indica cosa resta all’EDR da rilevare e cosa succede se il sensore è assente.',
                en: 'Point out what is left for the EDR to detect and what happens if the sensor is absent.'
              }
            ],
            challenge: {
              it: 'Se l’EDR non segnala nulla, come distingui un host sicuro da un host senza agente o con sensore manomesso?',
              en: 'If the EDR reports nothing, how do you tell a secure host from a host without an agent or with a tampered sensor?'
            },
            solution: [
              {
                it: 'L’application control previene l’esecuzione di script e macro non autorizzati; l’host firewall previene le connessioni east–west del movimento laterale; l’EDR rileva ciò che passa — processi privilegiati anomali, dump di credenziali, meccanismi di avvio. La copertura è decisiva perché un host senza agente è invisibile: la difesa vale quanto la sua estensione, non quanto il singolo controllo.',
                en: 'Application control prevents unauthorized scripts and macros from running; the host firewall prevents the east–west connections of lateral movement; the EDR detects what gets through — anomalous privileged processes, credential dumps, startup mechanisms. Coverage is decisive because a host without an agent is invisible: the defense is worth its extent, not a single control.'
              },
              {
                it: 'Sfida: «nessuna segnalazione» non significa sicuro; lo si distingue verificando la sensor health e la copertura — un host senza agente o con sensore manomesso non riporta, ed è proprio ciò che un attaccante cerca di ottenere.',
                en: 'Challenge: «no alert» does not mean secure; you tell them apart by checking sensor health and coverage — a host without an agent or with a tampered sensor does not report, which is exactly what an attacker tries to achieve.'
              }
            ],
            selfCheck: [
              {
                it: 'So dire cosa prevengono host firewall e application control e cosa rileva l’EDR.',
                en: 'I can say what the host firewall and application control prevent and what the EDR detects.'
              },
              {
                it: 'So spiegare perché copertura e sensor health rendono l’EDR affidabile.',
                en: 'I can explain why coverage and sensor health make the EDR trustworthy.'
              }
            ]
          }
        ]
      },
      {
        id: 'endpoint-posture-isolation',
        title: {
          it: 'Postura continua, privilegi e isolamento',
          en: 'Continuous posture, privileges, and isolation'
        },
        objectives: [
          {
            it: 'Spiegare come la postura continua condiziona l’accesso di rete di un endpoint.',
            en: 'Explain how continuous posture conditions an endpoint’s network access.'
          },
          {
            it: 'Collegare igiene dei privilegi locali e isolamento in risposta al contenimento dell’impatto.',
            en: 'Link local-privilege hygiene and isolation in response to containing the impact.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere l’autenticazione di rete/NAC e la post-exploitation (capitolo su identità/AAA e percorso eJPT).',
            en: 'Know network/NAC authentication and post-exploitation (the identity/AAA chapter and the eJPT path).'
          }
        ],
        theory: [
          {
            it: 'La postura continua lega l’accesso di rete allo stato dell’endpoint: non basta che l’identità sia valida, deve esserlo anche l’host — agente attivo, baseline rispettata, patch minime presenti. È l’applicazione del principio Zero Trust all’endpoint: la fiducia non è concessa una volta all’ammissione, ma verificata di continuo, e un host che esce dalla conformità perde o riduce l’accesso finché non rientra. Questo chiude il caso dell’host «già dentro» che si degrada nel tempo, che l’autenticazione iniziale da sola non coprirebbe.',
            en: 'Continuous posture ties network access to the endpoint’s state: it is not enough for the identity to be valid, the host must be too — agent active, baseline respected, minimum patches present. It is the Zero Trust principle applied to the endpoint: trust is not granted once at admission but verified continuously, and a host that falls out of compliance loses or reduces access until it returns. This closes the case of the «already inside» host that degrades over time, which initial authentication alone would not cover.'
          },
          {
            it: 'L’igiene dei privilegi locali decide quanto vale un accesso quando arriva. Se gli utenti lavorano con privilegi amministrativi permanenti, un accesso iniziale diventa subito pieno controllo; se i privilegi sono minimi ed elevati solo quando serve, l’escalation che la post-exploitation cerca trova meno terreno. Allo stesso modo contano le credenziali locali: password riutilizzate tra host o cache non protette alimentano il movimento laterale. È il lato difensivo esatto di ciò che il tester cerca in post-exploitation — togliere valore all’accesso prima che l’attaccante lo misuri.',
            en: 'Local-privilege hygiene decides how much an access is worth when it arrives. If users work with permanent administrative privileges, an initial access immediately becomes full control; if privileges are minimal and elevated only when needed, the escalation that post-exploitation seeks finds less ground. Local credentials matter the same way: passwords reused across hosts or unprotected caches feed lateral movement. It is the exact defensive side of what the tester looks for in post-exploitation — removing an access’s value before the attacker measures it.'
          },
          {
            it: 'Quando la prevenzione non basta, conta la risposta sull’host, e segue la stessa disciplina evidence-first vista per l’email. L’isolamento stacca l’endpoint dalla rete per fermare la propagazione senza spegnerlo, così l’evidenza resta acquisibile; si raccolgono gli artefatti (processi, connessioni, modifiche alla baseline) prima di ripulire; la riammissione avviene solo dopo che l’host è riportato alla baseline e verificato. L’ordine — isolare, acquisire, bonificare, riammettere — evita i due errori opposti: spegnere e perdere l’evidenza, o bonificare in fretta e lasciare rientrare un host ancora compromesso.',
            en: 'When prevention is not enough, the response on the host matters, and it follows the same evidence-first discipline seen for email. Isolation detaches the endpoint from the network to stop the spread without powering it off, so the evidence stays acquirable; you collect the artifacts (processes, connections, baseline changes) before cleaning; readmission happens only after the host is returned to the baseline and verified. The order — isolate, acquire, remediate, readmit — avoids the two opposite errors: powering off and losing the evidence, or remediating in haste and letting a still-compromised host back in.'
          }
        ],
        example: {
          it: 'Un endpoint che esce dalla baseline perde l’accesso per postura continua; se è compromesso, viene isolato senza spegnerlo, se ne acquisiscono processi e connessioni come evidenza, poi è riportato alla baseline e solo allora riammesso — mentre i privilegi locali minimi avevano già ridotto quanto l’accesso iniziale poteva fare.',
          en: 'An endpoint that falls out of the baseline loses access through continuous posture; if it is compromised, it is isolated without being powered off, its processes and connections are acquired as evidence, then it is returned to the baseline and only then readmitted — while minimal local privileges had already reduced what the initial access could do.'
        },
        commonMistakes: [
          {
            it: 'Verificare la postura solo all’ammissione: un host conforme oggi può degradarsi domani; serve la verifica continua.',
            en: 'Checking posture only at admission: a host compliant today can degrade tomorrow; continuous verification is needed.'
          },
          {
            it: 'Lasciare privilegi amministrativi permanenti: trasformano un accesso iniziale in controllo completo senza escalation.',
            en: 'Leaving permanent administrative privileges: they turn an initial access into full control without escalation.'
          },
          {
            it: 'Spegnere l’host compromesso: ferma la propagazione ma distrugge l’evidenza; si isola, non si spegne.',
            en: 'Powering off the compromised host: it stops the spread but destroys the evidence; you isolate, you do not power off.'
          }
        ],
        lab: 'endpointsecurity',
        references: [{ kind: 'nist', id: 'SP 800-137' }],
        guidedLabs: [
          {
            id: 'gl-endpoint-isolation-order',
            title: {
              it: 'Isola senza perdere l’evidenza',
              en: 'Isolate without losing the evidence'
            },
            difficulty: 'advanced',
            lab: 'endpointsecurity',
            scenario: {
              it: 'Il laboratorio «Endpoint e postura» mette in scena postura continua, privilegi locali e il ciclo di isolamento e riammissione.',
              en: 'The “Endpoint and posture” lab stages continuous posture, local privileges, and the isolation and readmission cycle.'
            },
            task: {
              it: 'Ordina isolamento, acquisizione, bonifica e riammissione e spiega perché i privilegi minimi riducono l’impatto a monte.',
              en: 'Order isolation, acquisition, remediation, and readmission and explain why minimal privileges reduce the impact upstream.'
            },
            steps: [
              {
                it: 'Apri «Endpoint e postura» e osserva la postura e i privilegi locali di un host.',
                en: 'Open “Endpoint and posture” and observe a host’s posture and local privileges.'
              },
              {
                it: 'Metti in ordine isolamento, acquisizione dell’evidenza, bonifica alla baseline e riammissione.',
                en: 'Put isolation, evidence acquisition, remediation to the baseline, and readmission in order.'
              },
              {
                it: 'Spiega cosa avrebbe ridotto i privilegi amministrativi permanenti sull’impatto dell’accesso.',
                en: 'Explain what permanent administrative privileges would have changed about the access’s impact.'
              }
            ],
            challenge: {
              it: 'Un host bonificato in fretta torna in rete e la compromissione riparte: quale passo è stato saltato e in quale ordine andava fatto?',
              en: 'A hastily remediated host returns to the network and the compromise restarts: which step was skipped and in what order should it have been done?'
            },
            solution: [
              {
                it: 'La postura continua toglie l’accesso a un host che esce dalla baseline; i privilegi locali minimi riducono quanto vale un accesso iniziale, togliendo terreno all’escalation. In risposta l’ordine è isolare (senza spegnere, per conservare l’evidenza), acquisire gli artefatti, bonificare riportando alla baseline, e riammettere solo dopo la verifica.',
                en: 'Continuous posture removes access from a host that falls out of the baseline; minimal local privileges reduce how much an initial access is worth, taking ground from escalation. In response the order is isolate (without powering off, to preserve the evidence), acquire the artifacts, remediate by returning to the baseline, and readmit only after verification.'
              },
              {
                it: 'Sfida: se la compromissione riparte, è stata saltata la verifica prima della riammissione — l’host è rientrato non ancora riportato alla baseline; l’ordine corretto riammette solo dopo bonifica e verifica.',
                en: 'Challenge: if the compromise restarts, the verification before readmission was skipped — the host returned not yet brought to the baseline; the correct order readmits only after remediation and verification.'
              }
            ],
            selfCheck: [
              {
                it: 'So spiegare come la postura continua condiziona l’accesso e perché va verificata nel tempo.',
                en: 'I can explain how continuous posture conditions access and why it must be verified over time.'
              },
              {
                it: 'So ordinare isolamento, acquisizione, bonifica e riammissione senza perdere l’evidenza.',
                en: 'I can order isolation, acquisition, remediation, and readmission without losing the evidence.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'segmentation-trust-boundaries',
    cert: 'securityplus',
    order: 24,
    track: 'extension',
    title: {
      it: 'Segmentazione e confini di fiducia',
      en: 'Segmentation and trust boundaries'
    },
    summary: {
      it: 'L’estensione su dove la rete decide chi può parlare con chi. Cosa separa davvero un confine e cosa no, come la microsegmentazione e lo Zero Trust tolgono la fiducia implicita che alimenta il movimento laterale, e come overlay, VRF e servizi condivisi complicano l’applicazione della policy. È il complemento difensivo del movimento laterale: dove l’offensiva sfrutta la rete piatta, la segmentazione la spezza.',
      en: 'The extension on where the network decides who may talk to whom. What a boundary really separates and what it does not, how microsegmentation and Zero Trust remove the implicit trust that feeds lateral movement, and how overlays, VRFs, and shared services complicate policy enforcement. It is the defensive complement of lateral movement: where the offensive exploits the flat network, segmentation breaks it.'
    },
    topics: [
      {
        id: 'segmentation-separation-enforcement',
        title: {
          it: 'Separare non è applicare: VLAN, ACL e confini',
          en: 'Separating is not enforcing: VLANs, ACLs, and boundaries'
        },
        objectives: [
          {
            it: 'Distinguere la separazione di un dominio di broadcast dall’applicazione di una policy.',
            en: 'Distinguish separating a broadcast domain from enforcing a policy.'
          },
          {
            it: 'Collocare e orientare un’ACL perché il confine applichi davvero ciò che intende.',
            en: 'Place and direct an ACL so the boundary actually enforces what it intends.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere VLAN, trunk e ACL (capitoli su VLAN/STP e sulle difese di rete).',
            en: 'Know VLANs, trunks, and ACLs (the VLAN/STP and the network defenses chapters).'
          }
        ],
        theory: [
          {
            it: 'Il primo malinteso della segmentazione è credere che una VLAN sia un firewall. Una VLAN separa un dominio di broadcast: mette host in reti logiche distinte, ma di per sé non impedisce il traffico tra di esse — basta un router o una SVI e le VLAN si parlano. La separazione è una precondizione, non l’applicazione della policy: chi può parlare con chi lo decide un controllo di filtraggio — un’ACL o un firewall — posto sul confine. Confondere i due porta a reti «segmentate» in cui, di fatto, tutto raggiunge tutto appena c’è instradamento.',
            en: 'The first misconception of segmentation is believing a VLAN is a firewall. A VLAN separates a broadcast domain: it puts hosts in distinct logical networks, but on its own it does not prevent traffic between them — a router or an SVI is enough and the VLANs talk. Separation is a precondition, not policy enforcement: who may talk to whom is decided by a filtering control — an ACL or a firewall — placed on the boundary. Confusing the two leads to «segmented» networks where, in fact, everything reaches everything as soon as there is routing.'
          },
          {
            it: 'Applicare la policy richiede collocazione e direzione corrette del filtro. Un’ACL agisce su un’interfaccia in una direzione (in ingresso o in uscita): la stessa regola posta nel punto sbagliato o nel verso sbagliato filtra l’opposto di ciò che si intende, o non filtra affatto. Una ACL stateless, inoltre, valuta ogni pacchetto per sé: applicata in una sola direzione lascia passare il ritorno, perché non sa nulla della sessione. La regola pratica è ragionare sul flusso reale — origine, destinazione, direzione sull’interfaccia — e verificare il confine nei due versi, non solo in quello «andata».',
            en: 'Enforcing the policy requires the filter’s correct placement and direction. An ACL acts on an interface in one direction (inbound or outbound): the same rule placed in the wrong spot or the wrong direction filters the opposite of what is intended, or does not filter at all. A stateless ACL, moreover, evaluates each packet on its own: applied in only one direction it lets the return through, because it knows nothing of the session. The practical rule is to reason about the real flow — source, destination, direction on the interface — and to verify the boundary in both directions, not just the «outbound» one.'
          },
          {
            it: 'Il valore del confine si misura da ciò che ferma, non da quante VLAN esistono. Una buona segmentazione parte dalla domanda «quali flussi sono necessari?» e nega il resto per default, invece di separare tutto e poi riaprire caso per caso. Questo rende il confine leggibile — poche regole che esprimono l’intento — e verificabile: si prova un flusso consentito e uno negato in entrambe le direzioni e si confronta l’esito con l’intento. Un confine che nessuno verifica è un’ipotesi, non un controllo.',
            en: 'The value of a boundary is measured by what it stops, not by how many VLANs exist. Good segmentation starts from the question «which flows are necessary?» and denies the rest by default, instead of separating everything and then reopening case by case. This makes the boundary readable — a few rules that express the intent — and verifiable: you test an allowed flow and a denied one in both directions and compare the outcome with the intent. A boundary nobody verifies is a hypothesis, not a control.'
          }
        ],
        example: {
          it: 'Due VLAN su 192.0.2.0/24 restano raggiungibili tra loro appena una SVI le instrada; solo un’ACL collocata sull’interfaccia giusta e nella direzione giusta applica la policy, e va provata nei due versi perché, stateless, da sola lascerebbe passare il traffico di ritorno.',
          en: 'Two VLANs on 192.0.2.0/24 stay mutually reachable as soon as an SVI routes them; only an ACL placed on the right interface and in the right direction enforces the policy, and it must be tested in both directions because, being stateless, on its own it would let the return traffic through.'
        },
        commonMistakes: [
          {
            it: 'Trattare la VLAN come un firewall: separa il broadcast, non applica una policy tra le reti.',
            en: 'Treating a VLAN as a firewall: it separates the broadcast, it does not enforce a policy between networks.'
          },
          {
            it: 'Applicare l’ACL in una sola direzione: stateless, lascia passare il ritorno della sessione.',
            en: 'Applying the ACL in only one direction: being stateless, it lets the session’s return through.'
          },
          {
            it: 'Misurare la segmentazione col numero di VLAN: conta ciò che il confine ferma, verificato nei due versi.',
            en: 'Measuring segmentation by the number of VLANs: what counts is what the boundary stops, verified both ways.'
          }
        ],
        lab: 'segmentation',
        references: [{ kind: 'nist', id: 'SP 800-41 Rev. 1' }],
        guidedLabs: [
          {
            id: 'gl-seg-direction',
            title: {
              it: 'Applica la policy nel punto e nel verso giusti',
              en: 'Enforce the policy at the right spot and direction'
            },
            difficulty: 'core',
            lab: 'segmentation',
            scenario: {
              it: 'Il laboratorio «Segmentazione» mostra dove un confine applica davvero la policy e dove soltanto separa.',
              en: 'The “Segmentation” lab shows where a boundary really enforces the policy and where it only separates.'
            },
            task: {
              it: 'Per un flusso tra due VLAN indica dove va l’ACL e in quale direzione, e perché va verificata nei due versi.',
              en: 'For a flow between two VLANs state where the ACL goes and in which direction, and why it must be verified both ways.'
            },
            steps: [
              {
                it: 'Apri «Segmentazione» e scegli lo scenario su direzione e posizionamento delle ACL.',
                en: 'Open “Segmentation” and pick the scenario on ACL direction and placement.'
              },
              {
                it: 'Individua l’interfaccia e la direzione in cui l’ACL applica l’intento.',
                en: 'Identify the interface and direction in which the ACL enforces the intent.'
              },
              {
                it: 'Prova un flusso consentito e uno negato in entrambe le direzioni e confronta con l’intento.',
                en: 'Test an allowed flow and a denied one in both directions and compare with the intent.'
              }
            ],
            challenge: {
              it: 'La regola «andata» funziona ma il ritorno passa lo stesso: cosa manca e come lo correggi senza aprire troppo?',
              en: 'The «outbound» rule works but the return passes anyway: what is missing and how do you fix it without opening too much?'
            },
            solution: [
              {
                it: 'La VLAN separa il broadcast ma le due reti si parlano appena una SVI le instrada; la policy la applica un’ACL collocata sull’interfaccia giusta e nel verso giusto. Essendo stateless, valuta ogni pacchetto per sé: se copre solo l’andata, il ritorno passa. Si verifica provando un flusso consentito e uno negato nei due versi e confrontando con l’intento.',
                en: 'The VLAN separates the broadcast but the two networks talk as soon as an SVI routes them; the policy is enforced by an ACL placed on the right interface and in the right direction. Being stateless, it evaluates each packet on its own: if it covers only the outbound path, the return passes. You verify by testing an allowed flow and a denied one both ways and comparing with the intent.'
              },
              {
                it: 'Sfida: il ritorno passa perché l’ACL stateless non conosce la sessione; si corregge filtrando anche la direzione di ritorno con regole speculari e mirate al flusso necessario, o spostando l’applicazione a un firewall stateful che segue la sessione, senza aprire oltre il necessario.',
                en: 'Challenge: the return passes because the stateless ACL does not know the session; you fix it by also filtering the return direction with mirrored rules targeted to the needed flow, or by moving enforcement to a stateful firewall that follows the session, without opening more than necessary.'
              }
            ],
            selfCheck: [
              {
                it: 'So distinguere separare un broadcast dall’applicare una policy sul confine.',
                en: 'I can distinguish separating a broadcast from enforcing a policy on the boundary.'
              },
              {
                it: 'So collocare e orientare un’ACL e verificarla nei due versi.',
                en: 'I can place and direct an ACL and verify it in both directions.'
              }
            ]
          }
        ]
      },
      {
        id: 'segmentation-microseg-zero-trust',
        diagram: 'segmentation',
        title: {
          it: 'Microsegmentazione, east–west e Zero Trust',
          en: 'Microsegmentation, east–west, and Zero Trust'
        },
        objectives: [
          {
            it: 'Spiegare perché la rete piatta alimenta il movimento laterale e come la microsegmentazione lo limita.',
            en: 'Explain why the flat network feeds lateral movement and how microsegmentation limits it.'
          },
          {
            it: 'Descrivere il principio Zero Trust applicato ai confini interni e ai dispositivi non gestiti.',
            en: 'Describe the Zero Trust principle applied to internal boundaries and unmanaged devices.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere il movimento laterale (percorso eJPT) e i confini di segmentazione (argomento precedente).',
            en: 'Know lateral movement (the eJPT path) and segmentation boundaries (previous topic).'
          }
        ],
        theory: [
          {
            it: 'La rete piatta è il moltiplicatore d’impatto che il movimento laterale sfrutta: se ogni host raggiunge ogni altro, un singolo punto d’appoggio apre l’intera infrastruttura. La microsegmentazione risponde spostando il confine vicino al carico: non più solo macro-zone (VLAN di reparto), ma politiche fini tra host e servizi, così che un host compromesso possa parlare solo con ciò che gli serve davvero. L’effetto non è impedire la compromissione iniziale, ma contenerne la propagazione — ridurre la distanza che un attaccante può coprire dal punto d’ingresso al dato critico.',
            en: 'The flat network is the impact multiplier that lateral movement exploits: if every host reaches every other, a single foothold opens the whole infrastructure. Microsegmentation responds by moving the boundary close to the workload: no longer only macro-zones (department VLANs), but fine policies between hosts and services, so a compromised host can talk only to what it truly needs. The effect is not to prevent the initial compromise, but to contain its spread — to reduce the distance an attacker can cover from the entry point to the critical data.'
          },
          {
            it: 'Lo Zero Trust generalizza il principio: nessuna fiducia implicita basata sulla posizione in rete. Essere «dentro» un segmento non autorizza nulla; ogni accesso è verificato per identità e contesto, a ogni richiesta. Applicato ai confini interni, significa trattare il traffico east–west come si tratterebbe quello dal perimetro, e trattare i dispositivi guest, IoT e non gestiti come non fidati per default, confinandoli in segmenti da cui non raggiungono i sistemi sensibili. È l’opposto esatto della rete piatta: la posizione non è più una credenziale.',
            en: 'Zero Trust generalizes the principle: no implicit trust based on network location. Being «inside» a segment authorizes nothing; every access is verified for identity and context, on every request. Applied to internal boundaries, it means treating east–west traffic as you would perimeter traffic, and treating guest, IoT, and unmanaged devices as untrusted by default, confining them to segments from which they do not reach sensitive systems. It is the exact opposite of the flat network: location is no longer a credential.'
          },
          {
            it: 'Microsegmentazione e Zero Trust non sostituiscono gli altri controlli: li rendono efficaci. Un confine fine senza monitoraggio est–ovest non si accorge di essere aggirato; una verifica continua senza identità affidabile non decide bene; una policy fine ingestibile a mano ha bisogno di automazione per restare coerente. Per questo la segmentazione moderna è un sistema — identità, policy, monitoraggio e automazione insieme — e il suo scopo misurabile resta uno: trasformare una compromissione da «accesso a tutto» a «accesso a poco», così che il tempo di rilevamento conti più della prevenzione perfetta.',
            en: 'Microsegmentation and Zero Trust do not replace the other controls: they make them effective. A fine boundary without east–west monitoring does not notice it is being bypassed; continuous verification without reliable identity does not decide well; a fine policy unmanageable by hand needs automation to stay consistent. This is why modern segmentation is a system — identity, policy, monitoring, and automation together — and its measurable goal stays one: to turn a compromise from «access to everything» into «access to little», so that detection time matters more than perfect prevention.'
          }
        ],
        example: {
          it: 'In una rete piatta un host compromesso raggiunge i server critici; con la microsegmentazione quell’host parla solo con i servizi che gli servono, i dispositivi IoT restano confinati, e la verifica Zero Trust a ogni accesso fa sì che «essere nel segmento» non autorizzi il salto successivo.',
          en: 'In a flat network a compromised host reaches the critical servers; with microsegmentation that host talks only to the services it needs, the IoT devices stay confined, and Zero Trust verification at every access makes «being in the segment» not authorize the next hop.'
        },
        commonMistakes: [
          {
            it: 'Fidarsi della posizione in rete: «dentro» un segmento non è un’autorizzazione; lo Zero Trust la toglie.',
            en: 'Trusting network location: «inside» a segment is not an authorization; Zero Trust removes it.'
          },
          {
            it: 'Mettere i dispositivi non gestiti nella rete generale: guest e IoT vanno confinati come non fidati per default.',
            en: 'Putting unmanaged devices on the general network: guest and IoT must be confined as untrusted by default.'
          },
          {
            it: 'Credere che la segmentazione prevenga la compromissione: ne contiene la propagazione, e va affiancata al monitoraggio.',
            en: 'Believing segmentation prevents the compromise: it contains the spread, and must be paired with monitoring.'
          }
        ],
        lab: 'segmentation',
        references: [{ kind: 'nist', id: 'SP 800-207' }],
        guidedLabs: [
          {
            id: 'gl-seg-contain-lateral',
            title: {
              it: 'Contieni il movimento laterale',
              en: 'Contain lateral movement'
            },
            difficulty: 'advanced',
            lab: 'segmentation',
            scenario: {
              it: 'Il laboratorio «Segmentazione» mostra il traffico east–west e i confini che lo limitano.',
              en: 'The “Segmentation” lab shows east–west traffic and the boundaries that limit it.'
            },
            task: {
              it: 'Da un host compromesso individua dove la microsegmentazione e lo Zero Trust spezzano la propagazione e cosa resta da monitorare.',
              en: 'From a compromised host identify where microsegmentation and Zero Trust break the spread and what is left to monitor.'
            },
            steps: [
              {
                it: 'Apri «Segmentazione» e scegli lo scenario sul movimento laterale east–west.',
                en: 'Open “Segmentation” and pick the east–west lateral-movement scenario.'
              },
              {
                it: 'Indica quali salti cadono confinando l’host ai soli servizi necessari.',
                en: 'Point out which hops fall when confining the host to only the needed services.'
              },
              {
                it: 'Segna dove la verifica Zero Trust toglie la fiducia implicita e cosa resta al monitoraggio.',
                en: 'Mark where Zero Trust verification removes implicit trust and what is left to monitoring.'
              }
            ],
            challenge: {
              it: 'Con la microsegmentazione attiva, quale condizione residua permetterebbe comunque un salto laterale?',
              en: 'With microsegmentation active, which residual condition would still allow a lateral hop?'
            },
            solution: [
              {
                it: 'La rete piatta lascia che un host raggiunga tutto; confinandolo ai soli servizi necessari cadono i salti verso ciò che non gli serve, e lo Zero Trust toglie l’autorizzazione implicita della posizione verificando ogni accesso per identità e contesto. Resta al monitoraggio est–ovest accorgersi di un confine aggirato: la segmentazione contiene, la detection rivela.',
                en: 'The flat network lets a host reach everything; confining it to only the needed services drops the hops toward what it does not need, and Zero Trust removes the position’s implicit authorization by verifying every access for identity and context. It is left to east–west monitoring to notice a bypassed boundary: segmentation contains, detection reveals.'
              },
              {
                it: 'Sfida: un salto laterale resta possibile se un servizio condiviso raggiungibile da più segmenti, o una credenziale valida ovunque, ricrea la fiducia che la segmentazione doveva togliere; lì serve lo Zero Trust sull’accesso al servizio, non solo il confine di rete.',
                en: 'Challenge: a lateral hop stays possible if a shared service reachable from several segments, or a credential valid everywhere, recreates the trust segmentation was meant to remove; there you need Zero Trust on the service access, not only the network boundary.'
              }
            ],
            selfCheck: [
              {
                it: 'So spiegare come la microsegmentazione contiene il movimento laterale.',
                en: 'I can explain how microsegmentation contains lateral movement.'
              },
              {
                it: 'So dire perché lo Zero Trust toglie la fiducia basata sulla posizione in rete.',
                en: 'I can say why Zero Trust removes trust based on network location.'
              }
            ]
          }
        ]
      },
      {
        id: 'segmentation-overlay-shared-services',
        title: {
          it: 'VRF, overlay e servizi condivisi',
          en: 'VRFs, overlays, and shared services'
        },
        objectives: [
          {
            it: 'Spiegare come VRF e overlay separano il traffico e dove il route leaking riapre un confine.',
            en: 'Explain how VRFs and overlays separate traffic and where route leaking reopens a boundary.'
          },
          {
            it: 'Riconoscere i rischi dei servizi condivisi e del routing asimmetrico per l’ispezione stateful.',
            en: 'Recognize the risks of shared services and asymmetric routing for stateful inspection.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere il routing e l’ispezione stateful (capitoli su routing e sulle difese di rete).',
            en: 'Know routing and stateful inspection (the routing and network defenses chapters).'
          }
        ],
        theory: [
          {
            it: 'Quando una VLAN non basta, la separazione sale di livello. La VRF (Virtual Routing and Forwarding) dà a un router più tabelle di routing indipendenti: due VRF non si raggiungono anche se condividono l’hardware, come compartimenti stagni del piano di instradamento. Gli overlay (per esempio in una fabric con controller) incapsulano il traffico di tenant diversi su una stessa rete fisica, e la policy la decide il controller per tenant. In entrambi i casi la separazione è forte per costruzione; il punto delicato è dove, di proposito, la si apre.',
            en: 'When a VLAN is not enough, separation moves up a level. A VRF (Virtual Routing and Forwarding) gives a router multiple independent routing tables: two VRFs do not reach each other even if they share the hardware, like watertight compartments of the forwarding plane. Overlays (for example in a controller-based fabric) encapsulate the traffic of different tenants over one physical network, and the policy is decided by the controller per tenant. In both cases separation is strong by construction; the delicate point is where, on purpose, you open it.'
          },
          {
            it: 'Il route leaking è l’apertura controllata tra VRF: si importano rotte selezionate da una VRF all’altra per consentire flussi specifici. È utile e spesso necessario — un servizio condiviso deve essere raggiungibile da più VRF — ma ogni leak è un confine riaperto, e va trattato come una regola di policy esplicita, non come una conseguenza accidentale di una ridistribuzione troppo larga. La domanda da porsi è sempre la stessa: quale flusso minimo richiede questo leak, e cosa diventa raggiungibile come effetto collaterale?',
            en: 'Route leaking is the controlled opening between VRFs: selected routes are imported from one VRF to another to allow specific flows. It is useful and often necessary — a shared service must be reachable from several VRFs — but every leak is a reopened boundary, and must be treated as an explicit policy rule, not as an accidental consequence of an overly broad redistribution. The question to ask is always the same: which minimal flow does this leak require, and what becomes reachable as a side effect?'
          },
          {
            it: 'I servizi condivisi — DNS, autenticazione, gestione — sono raggiungibili da tutti i segmenti per definizione, e proprio per questo sono il punto in cui la segmentazione si indebolisce: un servizio condiviso compromesso parla con l’intera rete. Vanno quindi trattati come un segmento ad alto valore, con accesso minimo e in una sola direzione dove possibile. Un rischio tecnico correlato è il routing asimmetrico: se andata e ritorno di un flusso passano per percorsi diversi, un firewall stateful può vedere solo metà della sessione e scartarla, o peggio lasciarla passare senza stato. Verificare il confine nei due versi vale qui più che altrove.',
            en: 'Shared services — DNS, authentication, management — are reachable from all segments by definition, and for exactly this reason they are the point where segmentation weakens: a compromised shared service talks to the whole network. They must therefore be treated as a high-value segment, with minimal access and in one direction where possible. A related technical risk is asymmetric routing: if a flow’s outbound and return take different paths, a stateful firewall may see only half the session and drop it, or worse let it through without state. Verifying the boundary in both directions is worth more here than elsewhere.'
          }
        ],
        example: {
          it: 'Un servizio condiviso in una VRF è reso raggiungibile da altre VRF con un route leaking mirato al solo flusso necessario; se andata e ritorno prendono percorsi diversi, il firewall stateful vede mezza sessione, quindi il confine va verificato nei due versi e il leak tenuto minimo.',
          en: 'A shared service in one VRF is made reachable from other VRFs with a route leak targeted to the only needed flow; if outbound and return take different paths, the stateful firewall sees half a session, so the boundary must be verified both ways and the leak kept minimal.'
        },
        commonMistakes: [
          {
            it: 'Trattare il route leaking come una ridistribuzione qualunque: ogni leak è un confine riaperto, da rendere esplicito e minimo.',
            en: 'Treating route leaking as any redistribution: every leak is a reopened boundary, to be made explicit and minimal.'
          },
          {
            it: 'Mettere i servizi condivisi nella rete generale: sono raggiungibili da tutti e vanno trattati come segmento ad alto valore.',
            en: 'Putting shared services on the general network: they are reachable by all and must be treated as a high-value segment.'
          },
          {
            it: 'Ignorare il routing asimmetrico: spezza l’ispezione stateful, che vede solo metà della sessione.',
            en: 'Ignoring asymmetric routing: it breaks stateful inspection, which sees only half the session.'
          }
        ],
        lab: 'segmentation',
        references: [{ kind: 'rfc', id: 'RFC 4364' }],
        guidedLabs: [
          {
            id: 'gl-seg-route-leak',
            title: {
              it: 'Apri un confine senza spalancarlo',
              en: 'Open a boundary without flinging it wide'
            },
            difficulty: 'advanced',
            lab: 'segmentation',
            scenario: {
              it: 'Il laboratorio «Segmentazione» mostra VRF, route leaking e servizi condivisi tra segmenti.',
              en: 'The “Segmentation” lab shows VRFs, route leaking, and shared services across segments.'
            },
            task: {
              it: 'Rendi un servizio condiviso raggiungibile da due VRF con il flusso minimo e spiega il rischio del routing asimmetrico.',
              en: 'Make a shared service reachable from two VRFs with the minimal flow and explain the asymmetric-routing risk.'
            },
            steps: [
              {
                it: 'Apri «Segmentazione» e scegli lo scenario su VRF e route leaking.',
                en: 'Open “Segmentation” and pick the VRF and route-leaking scenario.'
              },
              {
                it: 'Importa solo le rotte necessarie al flusso verso il servizio condiviso.',
                en: 'Import only the routes needed for the flow toward the shared service.'
              },
              {
                it: 'Verifica andata e ritorno e segnala dove un percorso asimmetrico romperebbe lo stateful.',
                en: 'Verify outbound and return and flag where an asymmetric path would break the stateful inspection.'
              }
            ],
            challenge: {
              it: 'Dopo il leak un segmento raggiunge più del previsto: cosa è stato importato di troppo e come lo restringi?',
              en: 'After the leak a segment reaches more than intended: what was imported in excess and how do you narrow it?'
            },
            solution: [
              {
                it: 'La VRF separa per costruzione; il route leaking apre un confine importando rotte selezionate, e va tenuto al flusso minimo necessario al servizio condiviso. Il servizio condiviso è un segmento ad alto valore, con accesso minimo e, dove possibile, in una sola direzione. Il routing asimmetrico è il rischio tecnico: se andata e ritorno divergono, il firewall stateful vede mezza sessione, perciò il confine si verifica nei due versi.',
                en: 'The VRF separates by construction; route leaking opens a boundary by importing selected routes, and must be kept to the minimal flow the shared service needs. The shared service is a high-value segment, with minimal access and, where possible, one direction. Asymmetric routing is the technical risk: if outbound and return diverge, the stateful firewall sees half a session, so the boundary is verified both ways.'
              },
              {
                it: 'Sfida: se un segmento raggiunge più del previsto, è stata importata una rotta troppo ampia (un prefisso che copre oltre il servizio); si restringe importando solo il prefisso del servizio e negando il resto, e si riverifica nei due versi.',
                en: 'Challenge: if a segment reaches more than intended, an overly broad route was imported (a prefix covering beyond the service); you narrow it by importing only the service’s prefix and denying the rest, and you re-verify both ways.'
              }
            ],
            selfCheck: [
              {
                it: 'So spiegare come VRF e overlay separano e dove il route leaking riapre un confine.',
                en: 'I can explain how VRFs and overlays separate and where route leaking reopens a boundary.'
              },
              {
                it: 'So riconoscere il rischio dei servizi condivisi e del routing asimmetrico per lo stateful.',
                en: 'I can recognize the risk of shared services and asymmetric routing for stateful inspection.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'routing-control-plane-security',
    cert: 'securityplus',
    order: 25,
    track: 'extension',
    title: {
      it: 'Sicurezza del routing e del control plane',
      en: 'Routing and control-plane security'
    },
    summary: {
      it: 'L’estensione su ciò di cui una rete si fida per decidere dove mandare i pacchetti: le informazioni di routing e il piano di controllo che le elabora. Come si autentica un’adiacenza e si protegge l’integrità del routing, come BGP, RPKI e l’anti-spoofing limitano le rotte false, e come CoPP e la coerenza RIB/FIB difendono il control plane. Un router esegue ciò che gli viene detto: la difesa è non fidarsi senza verifica.',
      en: 'The extension on what a network trusts to decide where to send packets: the routing information and the control plane that processes it. How an adjacency is authenticated and routing integrity protected, how BGP, RPKI, and anti-spoofing limit false routes, and how CoPP and RIB/FIB consistency defend the control plane. A router does what it is told: the defense is to not trust without verification.'
    },
    topics: [
      {
        id: 'routing-trust-ospf-lsdb',
        title: {
          it: 'Fiducia del routing: adiacenze OSPF e integrità dell’LSDB',
          en: 'Routing trust: OSPF adjacencies and LSDB integrity'
        },
        objectives: [
          {
            it: 'Spiegare perché un router esegue ciò che gli dice il routing e cosa autentica un’adiacenza.',
            en: 'Explain why a router acts on what routing tells it and what authenticating an adjacency does.'
          },
          {
            it: 'Riconoscere i rischi di redistribuzione e default-route injection sull’integrità del routing.',
            en: 'Recognize the risks of redistribution and default-route injection to routing integrity.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere OSPF e le rotte statiche/di default (capitolo sul routing IP).',
            en: 'Know OSPF and static/default routes (the IP routing chapter).'
          }
        ],
        theory: [
          {
            it: 'Il routing è un sistema di fiducia: un router costruisce la sua tabella a partire da ciò che gli dicono i vicini, e poi inoltra i pacchetti di conseguenza. Se accetta informazioni false, inoltra verso la destinazione sbagliata — e lo fa con la stessa diligenza con cui inoltrerebbe quelle corrette. Per questo il primo controllo è autenticare le adiacenze: in OSPF, l’autenticazione del vicino fa sì che un router formi un’adiacenza solo con chi dimostra di condividere un segreto, impedendo a un host qualunque di iniettarsi come router e alterare l’LSDB (Link-State Database) condiviso.',
            en: 'Routing is a trust system: a router builds its table from what its neighbors tell it, and then forwards packets accordingly. If it accepts false information, it forwards toward the wrong destination — and it does so with the same diligence it would use for correct information. This is why the first control is to authenticate adjacencies: in OSPF, neighbor authentication makes a router form an adjacency only with a peer that proves it shares a secret, preventing any host from injecting itself as a router and altering the shared LSDB (Link-State Database).'
          },
          {
            it: 'L’integrità del routing non si gioca solo al confine dell’adiacenza, ma anche dentro: la redistribuzione tra protocolli è un punto delicato. Ridistribuire rotte da una fonte meno affidabile verso il dominio interno senza filtri è il modo più comune per far entrare informazioni sbagliate — comprese le default route. Una default-route injection non autorizzata attira verso di sé tutto il traffico senza una rotta più specifica, trasformando un singolo router manomesso in un buco nero o in un punto di intercettazione. La difesa è filtrare esplicitamente cosa si ridistribuisce, nei due sensi, invece di ridistribuire tutto e sperare.',
            en: 'Routing integrity is not played only at the adjacency boundary, but also inside: redistribution between protocols is a delicate point. Redistributing routes from a less trusted source into the internal domain without filters is the most common way to let wrong information in — default routes included. An unauthorized default-route injection attracts to itself all traffic without a more specific route, turning a single tampered router into a black hole or an interception point. The defense is to explicitly filter what is redistributed, in both directions, instead of redistributing everything and hoping.'
          },
          {
            it: 'Il filo conduttore è lo stesso della segmentazione e dell’identità: nessuna fiducia implicita. Un’adiacenza va autenticata come si autentica un utente; una rotta ridistribuita va filtrata come si filtra un flusso al confine; e l’integrità dell’LSDB va verificata, non assunta, confrontando ciò che un router crede con ciò che gli altri vedono. Dal lato del tester, il routing è un bersaglio proprio perché pochi lo trattano come superficie di attacco; dal lato della difesa, autenticare e filtrare il routing è tra i controlli a più alto rapporto tra impatto e sforzo.',
            en: 'The thread is the same as segmentation and identity: no implicit trust. An adjacency must be authenticated as a user is; a redistributed route must be filtered as a flow is filtered at a boundary; and LSDB integrity must be verified, not assumed, comparing what one router believes with what the others see. On the tester’s side, routing is a target precisely because few treat it as an attack surface; on the defensive side, authenticating and filtering routing is among the controls with the highest impact-to-effort ratio.'
          }
        ],
        example: {
          it: 'Un host collegato a un segmento OSPF senza autenticazione del vicino può presentarsi come router e iniettare una default route verso 192.0.2.0/24: il traffico senza rotta più specifica lo segue. L’autenticazione delle adiacenze e il filtro sulla redistribuzione lo impediscono, e il confronto dell’LSDB rivela l’incoerenza.',
          en: 'A host attached to an OSPF segment without neighbor authentication can present itself as a router and inject a default route toward 192.0.2.0/24: traffic without a more specific route follows it. Adjacency authentication and a redistribution filter prevent it, and comparing the LSDB reveals the inconsistency.'
        },
        commonMistakes: [
          {
            it: 'Lasciare le adiacenze senza autenticazione: un host qualunque può presentarsi come router e alterare l’LSDB.',
            en: 'Leaving adjacencies without authentication: any host can present itself as a router and alter the LSDB.'
          },
          {
            it: 'Ridistribuire senza filtri: è il modo più comune per far entrare rotte sbagliate, default comprese.',
            en: 'Redistributing without filters: it is the most common way to let wrong routes in, defaults included.'
          },
          {
            it: 'Assumere l’integrità del routing: va verificata confrontando ciò che i router vedono, non data per scontata.',
            en: 'Assuming routing integrity: it must be verified by comparing what the routers see, not taken for granted.'
          }
        ],
        lab: 'routingsecurity',
        references: [{ kind: 'rfc', id: 'RFC 2328' }],
        guidedLabs: [
          {
            id: 'gl-routing-ospf-trust',
            title: {
              it: 'Autentica l’adiacenza, filtra la redistribuzione',
              en: 'Authenticate the adjacency, filter the redistribution'
            },
            difficulty: 'advanced',
            lab: 'routingsecurity',
            scenario: {
              it: 'Il laboratorio «Routing e control plane» mostra il confine di adiacenza OSPF e l’integrità dell’LSDB.',
              en: 'The “Routing and control plane” lab shows the OSPF adjacency boundary and LSDB integrity.'
            },
            task: {
              it: 'Indica dove l’autenticazione del vicino e il filtro sulla redistribuzione fermano una rotta falsa, e come si verifica l’integrità dell’LSDB.',
              en: 'Point out where neighbor authentication and the redistribution filter stop a false route, and how LSDB integrity is verified.'
            },
            steps: [
              {
                it: 'Apri «Routing e control plane» e osserva il confine di adiacenza OSPF.',
                en: 'Open “Routing and control plane” and observe the OSPF adjacency boundary.'
              },
              {
                it: 'Individua dove l’autenticazione impedisce a un host di formare un’adiacenza.',
                en: 'Identify where authentication prevents a host from forming an adjacency.'
              },
              {
                it: 'Segna il filtro che blocca una default-route injection in redistribuzione.',
                en: 'Mark the filter that blocks a default-route injection on redistribution.'
              }
            ],
            challenge: {
              it: 'Un router accetta una default route che non dovrebbe esistere: quali due controlli mancavano e in quale ordine agiscono?',
              en: 'A router accepts a default route that should not exist: which two controls were missing and in what order do they act?'
            },
            solution: [
              {
                it: 'Un router inoltra secondo ciò che il routing gli dice, quindi una rotta falsa reindirizza il traffico. L’autenticazione del vicino impedisce a un host di formare un’adiacenza e iniettare informazioni come router; il filtro sulla redistribuzione impedisce che rotte non autorizzate (una default compresa) entrino nel dominio. L’integrità dell’LSDB si verifica confrontando ciò che i router vedono, non assumendola.',
                en: 'A router forwards according to what routing tells it, so a false route redirects traffic. Neighbor authentication prevents a host from forming an adjacency and injecting information as a router; the redistribution filter prevents unauthorized routes (a default included) from entering the domain. LSDB integrity is verified by comparing what the routers see, not assumed.'
              },
              {
                it: 'Sfida: mancavano l’autenticazione delle adiacenze (per impedire l’ingresso come router) e il filtro sulla redistribuzione (per bloccare la default); agiscono in ordine — prima si nega l’adiacenza non fidata, poi si filtra ciò che comunque entrerebbe da una fonte ridistribuita.',
                en: 'Challenge: adjacency authentication (to prevent entry as a router) and the redistribution filter (to block the default) were missing; they act in order — first the untrusted adjacency is denied, then what would still enter from a redistributed source is filtered.'
              }
            ],
            selfCheck: [
              {
                it: 'So dire cosa autentica un’adiacenza e perché un router esegue ciò che il routing gli dice.',
                en: 'I can say what authenticating an adjacency does and why a router acts on what routing tells it.'
              },
              {
                it: 'So riconoscere i rischi di redistribuzione e default-route injection e come filtrarli.',
                en: 'I can recognize the risks of redistribution and default-route injection and how to filter them.'
              }
            ]
          }
        ]
      },
      {
        id: 'routing-bgp-rpki-antispoofing',
        title: {
          it: 'BGP, RPKI e anti-spoofing (uRPF e BCP 38)',
          en: 'BGP, RPKI, and anti-spoofing (uRPF and BCP 38)'
        },
        objectives: [
          {
            it: 'Descrivere come policy BGP, RPKI e maximum-prefix limitano l’accettazione di rotte false.',
            en: 'Describe how BGP policy, RPKI, and maximum-prefix limit accepting false routes.'
          },
          {
            it: 'Spiegare l’anti-spoofing di origine con uRPF e il filtraggio in ingresso di BCP 38.',
            en: 'Explain source anti-spoofing with uRPF and the ingress filtering of BCP 38.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere il routing tra domini e l’indirizzamento (capitoli su routing e su IPv4).',
            en: 'Know interdomain routing and addressing (the routing and IPv4 chapters).'
          }
        ],
        theory: [
          {
            it: 'Tra domini amministrativi diversi, la fiducia è ancora più scarsa, e BGP la gestisce con la policy. Accettare qualunque annuncio espone al route hijacking — un vicino che annuncia prefissi che non gli appartengono attira traffico altrui. Tre controlli lo limitano: la policy di importazione filtra ciò che si accetta per prefisso e per vicino; RPKI (Resource Public Key Infrastructure) permette di validare che l’origine di un prefisso sia autorizzata a annunciarlo, scartando gli annunci con origine non valida; e il maximum-prefix chiude la sessione se un vicino annuncia molti più prefissi del previsto, un segnale di errore o di leak.',
            en: 'Between different administrative domains, trust is even scarcer, and BGP manages it with policy. Accepting any announcement exposes you to route hijacking — a neighbor announcing prefixes that are not theirs attracts others’ traffic. Three controls limit it: the import policy filters what you accept by prefix and by neighbor; RPKI (Resource Public Key Infrastructure) lets you validate that a prefix’s origin is authorized to announce it, dropping announcements with an invalid origin; and maximum-prefix closes the session if a neighbor announces many more prefixes than expected, a sign of an error or a leak.'
          },
          {
            it: 'La fiducia manca anche sugli indirizzi di origine dei pacchetti, non solo sulle rotte. L’IP spoofing falsifica l’indirizzo di origine per nascondersi o per riflettere un attacco su una vittima. L’anti-spoofing lo contrasta alla sorgente: uRPF (unicast Reverse Path Forwarding) scarta un pacchetto se la sua origine non è raggiungibile dall’interfaccia su cui è arrivato, cioè se la rotta di ritorno non combacia. È l’applicazione pratica del BCP 38, il filtraggio in ingresso che impedisce a una rete di immettere nel resto di Internet pacchetti con origini che non le appartengono. Attenzione però al routing asimmetrico, che può far scartare a uRPF traffico legittimo: va calibrato sulla topologia.',
            en: 'Trust is also missing on the packets’ source addresses, not only on the routes. IP spoofing forges the source address to hide or to reflect an attack onto a victim. Anti-spoofing counters it at the source: uRPF (unicast Reverse Path Forwarding) drops a packet if its source is not reachable from the interface it arrived on, that is, if the return route does not match. It is the practical application of BCP 38, the ingress filtering that prevents a network from injecting into the rest of the Internet packets with sources that are not its own. Beware of asymmetric routing, though, which can make uRPF drop legitimate traffic: it must be tuned to the topology.'
          },
          {
            it: 'La logica è coerente con il resto del capitolo: non accettare un’affermazione — una rotta, un indirizzo di origine — solo perché è arrivata. BGP con policy e RPKI non accetta rotte la cui origine non è provata; uRPF e BCP 38 non accettano pacchetti la cui origine non regge alla verifica del percorso di ritorno. Nessuno di questi controlli è perfetto da solo, ma insieme alzano molto il costo di iniettare rotte false o indirizzi falsificati, che è l’obiettivo realistico della difesa del routing tra domini.',
            en: 'The logic is consistent with the rest of the chapter: do not accept a claim — a route, a source address — just because it arrived. BGP with policy and RPKI does not accept routes whose origin is not proven; uRPF and BCP 38 do not accept packets whose source does not hold up to the return-path check. None of these controls is perfect alone, but together they raise a lot the cost of injecting false routes or forged addresses, which is the realistic goal of interdomain routing defense.'
          }
        ],
        example: {
          it: 'Un vicino BGP che annuncia un prefisso non suo viene scartato dalla validazione RPKI dell’origine; un pacchetto con indirizzo di origine falsificato in 192.0.2.0/24 viene scartato da uRPF perché la rotta di ritorno non combacia con l’interfaccia d’ingresso.',
          en: 'A BGP neighbor announcing a prefix that is not theirs is dropped by RPKI origin validation; a packet with a forged source address in 192.0.2.0/24 is dropped by uRPF because the return route does not match the ingress interface.'
        },
        commonMistakes: [
          {
            it: 'Accettare gli annunci BGP senza policy né validazione dell’origine: apre al route hijacking.',
            en: 'Accepting BGP announcements without policy or origin validation: it opens the door to route hijacking.'
          },
          {
            it: 'Attivare uRPF stretto ignorando il routing asimmetrico: scarta traffico legittimo quando il ritorno diverge.',
            en: 'Enabling strict uRPF while ignoring asymmetric routing: it drops legitimate traffic when the return diverges.'
          },
          {
            it: 'Credere che un solo controllo basti: policy, RPKI, maximum-prefix e anti-spoofing lavorano insieme.',
            en: 'Believing one control is enough: policy, RPKI, maximum-prefix, and anti-spoofing work together.'
          }
        ],
        lab: 'routingsecurity',
        references: [{ kind: 'rfc', id: 'RFC 7454' }],
        guidedLabs: [
          {
            id: 'gl-routing-bgp-origin',
            title: {
              it: 'Rifiuta la rotta e l’origine non provate',
              en: 'Reject the unproven route and source'
            },
            difficulty: 'advanced',
            lab: 'routingsecurity',
            scenario: {
              it: 'Il laboratorio «Routing e control plane» mostra la policy BGP, RPKI e l’anti-spoofing con uRPF.',
              en: 'The “Routing and control plane” lab shows BGP policy, RPKI, and anti-spoofing with uRPF.'
            },
            task: {
              it: 'Associa route hijacking e IP spoofing ai controlli che li fermano, e spiega il limite del routing asimmetrico per uRPF.',
              en: 'Match route hijacking and IP spoofing to the controls that stop them, and explain the asymmetric-routing limit for uRPF.'
            },
            steps: [
              {
                it: 'Apri «Routing e control plane» e scegli lo scenario su BGP e RPKI.',
                en: 'Open “Routing and control plane” and pick the BGP and RPKI scenario.'
              },
              {
                it: 'Individua come policy, RPKI e maximum-prefix limitano le rotte accettate.',
                en: 'Identify how policy, RPKI, and maximum-prefix limit the accepted routes.'
              },
              {
                it: 'Segna dove uRPF scarta un’origine falsificata e dove il routing asimmetrico lo complica.',
                en: 'Mark where uRPF drops a forged source and where asymmetric routing complicates it.'
              }
            ],
            challenge: {
              it: 'uRPF scarta traffico legittimo: è un attacco o una configurazione, e come lo risolvi senza disattivare l’anti-spoofing?',
              en: 'uRPF drops legitimate traffic: is it an attack or a configuration, and how do you fix it without disabling anti-spoofing?'
            },
            solution: [
              {
                it: 'Il route hijacking si ferma con la policy di importazione, la validazione RPKI dell’origine e il maximum-prefix, che insieme non accettano rotte la cui origine non è provata. L’IP spoofing si ferma con uRPF e il BCP 38, che scartano i pacchetti la cui origine non regge alla verifica del percorso di ritorno. Nessuno dei due basta da solo: lavorano a strati.',
                en: 'Route hijacking is stopped by the import policy, RPKI origin validation, and maximum-prefix, which together do not accept routes whose origin is not proven. IP spoofing is stopped by uRPF and BCP 38, which drop packets whose source does not hold up to the return-path check. Neither is enough alone: they work in layers.'
              },
              {
                it: 'Sfida: uRPF che scarta traffico legittimo è spesso una configurazione, non un attacco — il routing asimmetrico fa divergere andata e ritorno; si risolve passando a una modalità uRPF che accetta più percorsi di ritorno (loose) sulle interfacce asimmetriche, senza spegnere l’anti-spoofing dove la topologia è simmetrica.',
                en: 'Challenge: uRPF dropping legitimate traffic is often a configuration, not an attack — asymmetric routing makes outbound and return diverge; you fix it by moving to a uRPF mode that accepts more return paths (loose) on the asymmetric interfaces, without disabling anti-spoofing where the topology is symmetric.'
              }
            ],
            selfCheck: [
              {
                it: 'So associare route hijacking e IP spoofing ai controlli che li fermano.',
                en: 'I can match route hijacking and IP spoofing to the controls that stop them.'
              },
              {
                it: 'So spiegare perché il routing asimmetrico complica uRPF e come calibrarlo.',
                en: 'I can explain why asymmetric routing complicates uRPF and how to tune it.'
              }
            ]
          }
        ]
      },
      {
        id: 'control-plane-copp-consistency',
        title: {
          it: 'Protezione del control plane: CoPP e coerenza RIB/FIB',
          en: 'Control-plane protection: CoPP and RIB/FIB consistency'
        },
        objectives: [
          {
            it: 'Spiegare perché il control plane è un bersaglio e come CoPP ne protegge la CPU.',
            en: 'Explain why the control plane is a target and how CoPP protects its CPU.'
          },
          {
            it: 'Verificare la coerenza tra RIB, FIB e adiacenza invece di fidarsi di un solo stato.',
            en: 'Verify consistency among RIB, FIB, and adjacency instead of trusting a single state.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere piani di controllo/dati e la tabella di routing (capitoli su componenti di rete e routing).',
            en: 'Know the control/data planes and the routing table (the network components and routing chapters).'
          }
        ],
        theory: [
          {
            it: 'Il control plane — i processi che calcolano le rotte e gestiscono i protocolli — gira sulla CPU del dispositivo, ed è un bersaglio proprio perché esaurirlo degrada tutta la rete senza toccare un singolo host. Un’ondata di pacchetti destinati al router stesso (richieste di protocollo, ICMP, gestione) può saturare la CPU e far cadere le adiacenze, con un effetto a cascata. CoPP (Control Plane Policing) difende classificando il traffico diretto al control plane e applicando un policing per classe: il traffico legittimo dei protocolli ha la sua quota garantita, il resto viene limitato, così un picco non travolge la CPU.',
            en: 'The control plane — the processes that compute routes and run the protocols — runs on the device’s CPU, and it is a target precisely because exhausting it degrades the whole network without touching a single host. A surge of packets destined to the router itself (protocol requests, ICMP, management) can saturate the CPU and bring adjacencies down, with a cascading effect. CoPP (Control Plane Policing) defends by classifying the traffic directed at the control plane and applying per-class policing: the legitimate protocol traffic has its guaranteed share, the rest is rate-limited, so a spike does not overwhelm the CPU.'
          },
          {
            it: 'Un altro rischio sottile è l’incoerenza tra i piani. La RIB (Routing Information Base) è ciò che il control plane crede; la FIB (Forwarding Information Base) è ciò con cui il data plane inoltra davvero. In condizioni normali coincidono, ma un bug, un’ottimizzazione o un attacco possono farle divergere: il router «dice» di inoltrare in un modo e inoltra in un altro. Per questo lo stato di un solo piano non basta come prova — una adiacenza UP non garantisce che la FIB inoltri come la RIB prevede. La verifica confronta RIB, FIB e adiacenza, e usa test sintetici end-to-end e telemetria indipendente per vedere il forwarding reale, non quello dichiarato.',
            en: 'Another subtle risk is inconsistency between the planes. The RIB (Routing Information Base) is what the control plane believes; the FIB (Forwarding Information Base) is what the data plane actually forwards with. Under normal conditions they match, but a bug, an optimization, or an attack can make them diverge: the router «says» it forwards one way and forwards another. This is why the state of a single plane is not enough as proof — an adjacency being UP does not guarantee the FIB forwards as the RIB intends. Verification compares RIB, FIB, and adjacency, and uses end-to-end synthetic tests and independent telemetry to see the real forwarding, not the declared one.'
          },
          {
            it: 'Il capitolo si chiude sul suo principio: nel routing nulla va creduto senza verifica — né un vicino, né una rotta, né un’origine, né lo stato di un piano. CoPP protegge la capacità del control plane di continuare a decidere sotto pressione; il confronto RIB/FIB protegge dall’illusione che decidere bene basti a inoltrare bene. Dal lato del tester, control plane e incoerenze sono bersagli a basso rumore e alto impatto; dal lato della difesa, proteggere e verificare il piano di controllo è ciò che tiene in piedi tutto il resto.',
            en: 'The chapter closes on its principle: in routing nothing is to be believed without verification — not a neighbor, not a route, not an origin, not a plane’s state. CoPP protects the control plane’s ability to keep deciding under pressure; the RIB/FIB comparison protects from the illusion that deciding well is enough to forward well. On the tester’s side, the control plane and inconsistencies are low-noise, high-impact targets; on the defensive side, protecting and verifying the control plane is what holds up everything else.'
          }
        ],
        example: {
          it: 'Un picco di pacchetti verso il router satura la CPU e fa cadere le adiacenze; CoPP garantisce una quota al traffico dei protocolli e limita il resto. Se un’adiacenza è UP ma il traffico non passa, il confronto tra RIB e FIB e un test end-to-end rivelano l’incoerenza che lo stato del solo control plane nascondeva.',
          en: 'A spike of packets toward the router saturates the CPU and brings adjacencies down; CoPP guarantees a share to protocol traffic and rate-limits the rest. If an adjacency is UP but traffic does not pass, comparing RIB and FIB and an end-to-end test reveal the inconsistency that the control plane’s state alone hid.'
        },
        commonMistakes: [
          {
            it: 'Trascurare il control plane: saturarne la CPU degrada tutta la rete senza toccare un host.',
            en: 'Neglecting the control plane: saturating its CPU degrades the whole network without touching a host.'
          },
          {
            it: 'Fidarsi di un’adiacenza UP come prova di forwarding: RIB e FIB possono divergere.',
            en: 'Trusting an UP adjacency as proof of forwarding: the RIB and FIB can diverge.'
          },
          {
            it: 'Verificare un solo piano: serve confrontare RIB, FIB e adiacenza con test end-to-end.',
            en: 'Verifying a single plane: you must compare RIB, FIB, and adjacency with end-to-end tests.'
          }
        ],
        lab: 'routingsecurity',
        references: [{ kind: 'nist', id: 'SP 800-189' }],
        guidedLabs: [
          {
            id: 'gl-control-plane-verify',
            title: {
              it: 'Proteggi la CPU, verifica il forwarding',
              en: 'Protect the CPU, verify the forwarding'
            },
            difficulty: 'advanced',
            lab: 'routingsecurity',
            scenario: {
              it: 'Il laboratorio «Routing e control plane» mostra il policing CoPP e la coerenza tra RIB, FIB e adiacenza.',
              en: 'The “Routing and control plane” lab shows CoPP policing and the consistency among RIB, FIB, and adjacency.'
            },
            task: {
              it: 'Spiega come CoPP protegge la CPU sotto un picco e come verifichi che la FIB inoltri come la RIB prevede.',
              en: 'Explain how CoPP protects the CPU under a spike and how you verify the FIB forwards as the RIB intends.'
            },
            steps: [
              {
                it: 'Apri «Routing e control plane» e scegli lo scenario su CoPP.',
                en: 'Open “Routing and control plane” and pick the CoPP scenario.'
              },
              {
                it: 'Osserva come il policing per classe garantisce quota ai protocolli e limita il resto.',
                en: 'Observe how per-class policing guarantees a share to the protocols and rate-limits the rest.'
              },
              {
                it: 'Confronta RIB, FIB e adiacenza e indica un test end-to-end che prova il forwarding reale.',
                en: 'Compare RIB, FIB, and adjacency and point out an end-to-end test that proves the real forwarding.'
              }
            ],
            challenge: {
              it: 'L’adiacenza è UP ma il traffico non passa: dove guardi per distinguere un problema di control plane da uno di data plane?',
              en: 'The adjacency is UP but traffic does not pass: where do you look to tell a control-plane problem from a data-plane one?'
            },
            solution: [
              {
                it: 'CoPP classifica il traffico diretto al router e applica un policing per classe: i protocolli hanno una quota garantita, un picco viene limitato e la CPU continua a decidere. La coerenza si verifica confrontando RIB (ciò che il control plane crede), FIB (ciò con cui il data plane inoltra) e adiacenza, perché un’adiacenza UP non prova il forwarding; un test end-to-end e la telemetria indipendente mostrano il percorso reale.',
                en: 'CoPP classifies the traffic directed at the router and applies per-class policing: the protocols have a guaranteed share, a spike is rate-limited, and the CPU keeps deciding. Consistency is verified by comparing the RIB (what the control plane believes), the FIB (what the data plane forwards with), and the adjacency, because an UP adjacency does not prove forwarding; an end-to-end test and independent telemetry show the real path.'
              },
              {
                it: 'Sfida: con adiacenza UP ma traffico assente si guarda alla FIB rispetto alla RIB — se la FIB non riflette la RIB il problema è nel data plane (programmazione del forwarding); se anche la RIB è errata il problema è nel control plane (la rotta scelta), e il test end-to-end distingue i due casi.',
                en: 'Challenge: with the adjacency UP but no traffic you look at the FIB against the RIB — if the FIB does not reflect the RIB the problem is in the data plane (forwarding programming); if the RIB itself is wrong the problem is in the control plane (the chosen route), and the end-to-end test tells the two cases apart.'
              }
            ],
            selfCheck: [
              {
                it: 'So spiegare perché il control plane è un bersaglio e come CoPP ne protegge la CPU.',
                en: 'I can explain why the control plane is a target and how CoPP protects its CPU.'
              },
              {
                it: 'So verificare la coerenza RIB/FIB/adiacenza invece di fidarmi di un solo stato.',
                en: 'I can verify RIB/FIB/adjacency consistency instead of trusting a single state.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'availability-dos-capacity',
    cert: 'securityplus',
    order: 26,
    track: 'extension',
    title: {
      it: 'Disponibilità, DoS e capacità',
      en: 'Availability, DoS, and capacity'
    },
    summary: {
      it: 'L’estensione sulla «A» della triade CIA: tenere in piedi il servizio. Il modello del DoS come esaurimento di una risorsa finita, i flood che riempiono le tabelle di stato più del traffico stesso, e la capacità e le code che decidono quale traffico sopravvive sotto pressione. La difesa non è un solo dispositivo ma la scelta del punto giusto in cui fermare o assorbire l’esaurimento.',
      en: 'The extension on the «A» of the CIA triad: keeping the service up. The DoS model as exhaustion of a finite resource, the floods that fill state tables more than the traffic itself, and the capacity and queues that decide which traffic survives under pressure. The defense is not a single device but choosing the right point at which to stop or absorb the exhaustion.'
    },
    topics: [
      {
        id: 'availability-resource-model',
        title: {
          it: 'Il modello del DoS: esaurire una risorsa finita',
          en: 'The DoS model: exhausting a finite resource'
        },
        objectives: [
          {
            it: 'Spiegare il DoS come esaurimento della risorsa più scarsa invece che come «troppo traffico».',
            en: 'Explain DoS as exhaustion of the scarcest resource rather than as «too much traffic».'
          },
          {
            it: 'Scegliere il punto di enforcement giusto: locale o a monte, secondo la risorsa esaurita.',
            en: 'Choose the right enforcement point: local or upstream, according to the exhausted resource.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere la triade CIA e gli attacchi per livello (capitoli sui fondamenti di sicurezza e sugli attacchi).',
            en: 'Know the CIA triad and attacks by layer (the security fundamentals and the attacks chapters).'
          }
        ],
        theory: [
          {
            it: 'La disponibilità non si perde «per troppo traffico» in astratto, ma perché una risorsa finita si esaurisce. Ogni servizio ne ha una più scarsa delle altre: la banda di un collegamento, le voci di una tabella di stato, i cicli di CPU, la memoria. Il DoS (Denial of Service) mira proprio a quella: saturare il link più stretto, riempire la tabella più piccola, consumare la CPU più carica. Ragionare per risorsa, non per volume, è ciò che distingue una difesa efficace: contro una saturazione di banda non serve un firewall più veloce, serve fermare il traffico prima del collo di bottiglia.',
            en: 'Availability is not lost «from too much traffic» in the abstract, but because a finite resource runs out. Every service has one scarcer than the others: a link’s bandwidth, a state table’s entries, CPU cycles, memory. DoS (Denial of Service) aims at exactly that: saturate the narrowest link, fill the smallest table, consume the busiest CPU. Reasoning by resource, not by volume, is what makes a defense effective: against bandwidth saturation a faster firewall does not help, you need to stop the traffic before the bottleneck.'
          },
          {
            it: 'Da qui la domanda chiave: dove si applica l’enforcement? Se la risorsa esaurita è la banda del collegamento in ingresso, il punto giusto è a monte — presso il provider o un servizio di scrubbing — perché quando il traffico è già arrivato sul link, il link è già saturo, qualunque cosa faccia il dispositivo locale. Se invece la risorsa è una tabella di stato o la CPU di un apparato, l’enforcement locale ha senso perché può rifiutare ciò che la riempirebbe. Sbagliare il punto è l’errore classico: mettere una difesa dietro al collo di bottiglia non salva ciò che sta davanti.',
            en: 'Hence the key question: where is enforcement applied? If the exhausted resource is the inbound link’s bandwidth, the right point is upstream — at the provider or a scrubbing service — because once the traffic has already reached the link, the link is already saturated, whatever the local device does. If instead the resource is a state table or a device’s CPU, local enforcement makes sense because it can refuse what would fill it. Getting the point wrong is the classic mistake: placing a defense behind the bottleneck does not save what sits in front of it.'
          },
          {
            it: 'Questo modello unifica attacchi che sembrano diversi. Un flood di banda, un SYN flood che riempie il backlog, una reflection che consuma il link, un esaurimento della tabella NAT: cambia la risorsa, non la logica. Per questo la difesa della disponibilità si progetta mappando, per ogni servizio, la risorsa più scarsa e il punto in cui la si protegge — a monte per la banda, localmente per lo stato e la CPU — e misurando la capacità normale per riconoscere quando viene superata. Conoscere la propria risorsa più scarsa meglio dell’attaccante è, di nuovo, il cuore della difesa.',
            en: 'This model unifies attacks that look different. A bandwidth flood, a SYN flood filling the backlog, a reflection consuming the link, a NAT-table exhaustion: the resource changes, not the logic. This is why availability defense is designed by mapping, for each service, the scarcest resource and the point where it is protected — upstream for bandwidth, locally for state and CPU — and by measuring normal capacity to recognize when it is exceeded. Knowing your own scarcest resource better than the attacker is, again, the heart of the defense.'
          }
        ],
        example: {
          it: 'Un flood che satura il link in ingresso verso 192.0.2.0/24 non si ferma con il firewall locale, già a valle del collo di bottiglia: va mitigato a monte, presso il provider; un esaurimento della tabella di stato, invece, si ferma localmente rifiutando ciò che la riempirebbe.',
          en: 'A flood saturating the inbound link toward 192.0.2.0/24 is not stopped by the local firewall, already downstream of the bottleneck: it must be mitigated upstream, at the provider; a state-table exhaustion, instead, is stopped locally by refusing what would fill it.'
        },
        commonMistakes: [
          {
            it: 'Pensare al DoS come «troppo traffico»: conta la risorsa più scarsa che si esaurisce, non il volume in sé.',
            en: 'Thinking of DoS as «too much traffic»: what counts is the scarcest resource that runs out, not the volume itself.'
          },
          {
            it: 'Mettere la difesa dietro al collo di bottiglia: una saturazione di banda si ferma a monte, non localmente.',
            en: 'Placing the defense behind the bottleneck: bandwidth saturation is stopped upstream, not locally.'
          },
          {
            it: 'Non misurare la capacità normale: senza una linea di base non si riconosce quando viene superata.',
            en: 'Not measuring normal capacity: without a baseline you cannot recognize when it is exceeded.'
          }
        ],
        lab: 'availability',
        references: [{ kind: 'attack', id: 'T1498' }],
        guidedLabs: [
          {
            id: 'gl-availability-enforcement-point',
            title: {
              it: 'Scegli dove fermare l’esaurimento',
              en: 'Choose where to stop the exhaustion'
            },
            difficulty: 'core',
            lab: 'availability',
            scenario: {
              it: 'Il laboratorio «Disponibilità e DoS» mostra la saturazione del link e il punto di enforcement.',
              en: 'The “Availability and DoS” lab shows link saturation and the enforcement point.'
            },
            task: {
              it: 'Per due scenari indica la risorsa esaurita e se l’enforcement giusto è locale o a monte, spiegando perché.',
              en: 'For two scenarios state the exhausted resource and whether the right enforcement is local or upstream, explaining why.'
            },
            steps: [
              {
                it: 'Apri «Disponibilità e DoS» e scegli lo scenario sulla saturazione del link.',
                en: 'Open “Availability and DoS” and pick the link-saturation scenario.'
              },
              {
                it: 'Individua la risorsa più scarsa e dove si trova rispetto al collo di bottiglia.',
                en: 'Identify the scarcest resource and where it sits relative to the bottleneck.'
              },
              {
                it: 'Indica il punto di enforcement giusto (locale o a monte) e perché.',
                en: 'State the right enforcement point (local or upstream) and why.'
              }
            ],
            challenge: {
              it: 'Il firewall locale è potentissimo ma il servizio resta giù: quale risorsa è esaurita e dove andava fermata?',
              en: 'The local firewall is very powerful but the service stays down: which resource is exhausted and where should it have been stopped?'
            },
            solution: [
              {
                it: 'Il DoS esaurisce la risorsa più scarsa: se è la banda del link in ingresso, l’enforcement va a monte (provider o scrubbing), perché a valle il collo di bottiglia è già saturo; se è una tabella di stato o la CPU, l’enforcement locale può rifiutare ciò che la riempirebbe. Si misura la capacità normale per riconoscere il superamento.',
                en: 'DoS exhausts the scarcest resource: if it is the inbound link’s bandwidth, enforcement goes upstream (provider or scrubbing), because downstream the bottleneck is already saturated; if it is a state table or the CPU, local enforcement can refuse what would fill it. You measure normal capacity to recognize when it is exceeded.'
              },
              {
                it: 'Sfida: se il firewall locale è potente ma il servizio resta giù, la risorsa esaurita è la banda del link in ingresso, a monte del firewall; andava fermata presso il provider, perché nessun dispositivo a valle del collo di bottiglia può liberare un link già saturo.',
                en: 'Challenge: if the local firewall is powerful but the service stays down, the exhausted resource is the inbound link’s bandwidth, upstream of the firewall; it had to be stopped at the provider, because no device downstream of the bottleneck can free an already-saturated link.'
              }
            ],
            selfCheck: [
              {
                it: 'So ragionare sul DoS per risorsa esaurita invece che per volume.',
                en: 'I can reason about DoS by exhausted resource instead of by volume.'
              },
              {
                it: 'So scegliere l’enforcement locale o a monte secondo dove sta il collo di bottiglia.',
                en: 'I can choose local or upstream enforcement according to where the bottleneck is.'
              }
            ]
          }
        ]
      },
      {
        id: 'availability-state-floods',
        title: {
          it: 'Flood di stato: SYN, reflection e tabelle di stato',
          en: 'State floods: SYN, reflection, and state tables'
        },
        objectives: [
          {
            it: 'Spiegare perché un flood costa poco all’attaccante e molto al difensore in termini di stato.',
            en: 'Explain why a flood costs the attacker little and the defender a lot in terms of state.'
          },
          {
            it: 'Collegare SYN flood, reflection/amplification ed esaurimento delle tabelle alle rispettive difese.',
            en: 'Link SYN floods, reflection/amplification, and table exhaustion to their respective defenses.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere l’handshake TCP, NAT e lo spoofing dell’origine (capitoli su fondamenti, servizi IP e routing).',
            en: 'Know the TCP handshake, NAT, and source spoofing (the fundamentals, IP services, and routing chapters).'
          }
        ],
        theory: [
          {
            it: 'Molti attacchi di disponibilità non esauriscono la banda ma lo stato, ed è lì la loro economia: inviare costa poco, mantenere lo stato costa molto. Il SYN flood ne è l’esempio: l’attaccante invia molti SYN senza completare l’handshake, e ogni SYN occupa una voce nel backlog delle connessioni half-open; con poche risorse riempie una tabella che il server deve tenere. La difesa non è bloccare i SYN ma non pagarne lo stato: i SYN cookie permettono al server di non allocare nulla finché l’handshake non è completato, spostando il costo indietro sull’attaccante.',
            en: 'Many availability attacks exhaust not bandwidth but state, and that is their economy: sending costs little, keeping the state costs a lot. The SYN flood is the example: the attacker sends many SYN without completing the handshake, and each SYN takes an entry in the half-open connection backlog; with few resources it fills a table the server must hold. The defense is not to block SYN but to not pay their state: SYN cookies let the server allocate nothing until the handshake is completed, pushing the cost back onto the attacker.'
          },
          {
            it: 'La reflection con amplification porta l’asimmetria all’estremo. L’attaccante invia piccole richieste con l’indirizzo di origine falsificato a quello della vittima verso servizi che rispondono con molto più di quanto ricevono; i server «riflettono» e amplificano verso la vittima, che riceve un volume enorme da sorgenti legittime. Due difese si combinano: a monte, l’anti-spoofing (BCP 38, visto nel capitolo sul routing) impedisce alla sorgente falsificata di partire; sul servizio riflettente, limitare le risposte e non esporre protocolli amplificanti riduce il fattore di amplificazione.',
            en: 'Reflection with amplification takes the asymmetry to the extreme. The attacker sends small requests with the source address forged to the victim’s toward services that reply with much more than they receive; the servers «reflect» and amplify toward the victim, which receives a huge volume from legitimate sources. Two defenses combine: upstream, anti-spoofing (BCP 38, seen in the routing chapter) prevents the forged source from leaving; on the reflecting service, limiting responses and not exposing amplifying protocols reduces the amplification factor.'
          },
          {
            it: 'Lo stesso schema vale per ogni tabella di stato condivisa: le traduzioni NAT/PAT, le sessioni di un firewall stateful, le voci di una tabella di connessioni. Riempirle nega il servizio a tutti, perché una tabella piena non distingue il traffico legittimo da quello ostile. Le difese sono coerenti: limitare quante voci una singola sorgente può creare, far scadere prima lo stato incompleto, e dimensionare le tabelle sulla capacità attesa misurata. Il filo conduttore è sempre lo stesso — non lasciare che un pacchetto economico imponga uno stato costoso senza prova di legittimità.',
            en: 'The same pattern holds for every shared state table: NAT/PAT translations, a stateful firewall’s sessions, a connection table’s entries. Filling them denies the service to everyone, because a full table does not tell legitimate traffic from hostile. The defenses are consistent: limit how many entries a single source can create, expire incomplete state sooner, and size the tables to the measured expected capacity. The thread is always the same — do not let a cheap packet impose expensive state without proof of legitimacy.'
          }
        ],
        example: {
          it: 'Un SYN flood riempie il backlog delle half-open: i SYN cookie evitano di allocare stato finché l’handshake non è completo. Una reflection con origine falsificata verso 192.0.2.0/24 si contrasta con l’anti-spoofing a monte e limitando le risposte del servizio riflettente.',
          en: 'A SYN flood fills the half-open backlog: SYN cookies avoid allocating state until the handshake is complete. A reflection with a forged source toward 192.0.2.0/24 is countered with upstream anti-spoofing and by limiting the reflecting service’s responses.'
        },
        commonMistakes: [
          {
            it: 'Difendersi dal SYN flood bloccando i SYN: la soluzione è non allocare stato finché l’handshake non è completo.',
            en: 'Defending against a SYN flood by blocking SYN: the solution is to not allocate state until the handshake is complete.'
          },
          {
            it: 'Ignorare l’anti-spoofing: senza BCP 38 la reflection con origine falsificata parte indisturbata.',
            en: 'Ignoring anti-spoofing: without BCP 38 the reflection with a forged source leaves undisturbed.'
          },
          {
            it: 'Non limitare lo stato per sorgente: una singola origine può riempire una tabella condivisa e negarla a tutti.',
            en: 'Not limiting state per source: a single source can fill a shared table and deny it to everyone.'
          }
        ],
        lab: 'availability',
        references: [{ kind: 'rfc', id: 'RFC 4987' }],
        guidedLabs: [
          {
            id: 'gl-availability-state-cost',
            title: {
              it: 'Non pagare lo stato di un pacchetto economico',
              en: 'Do not pay the state of a cheap packet'
            },
            difficulty: 'advanced',
            lab: 'availability',
            scenario: {
              it: 'Il laboratorio «Disponibilità e DoS» mostra SYN flood, reflection e l’esaurimento delle tabelle di stato.',
              en: 'The “Availability and DoS” lab shows SYN floods, reflection, and state-table exhaustion.'
            },
            task: {
              it: 'Collega SYN flood, reflection ed esaurimento NAT alle difese che spostano il costo sull’attaccante.',
              en: 'Link SYN floods, reflection, and NAT exhaustion to the defenses that shift the cost onto the attacker.'
            },
            steps: [
              {
                it: 'Apri «Disponibilità e DoS» e scegli lo scenario sul SYN flood e il backlog.',
                en: 'Open “Availability and DoS” and pick the SYN flood and backlog scenario.'
              },
              {
                it: 'Individua la tabella di stato che si riempie e cosa la alimenta.',
                en: 'Identify the state table that fills and what feeds it.'
              },
              {
                it: 'Indica la difesa che evita di pagare lo stato o che taglia la sorgente falsificata.',
                en: 'State the defense that avoids paying the state or that cuts the forged source.'
              }
            ],
            challenge: {
              it: 'Una reflection arriva da server legittimi: come la fermi senza bloccare quei server, e dove?',
              en: 'A reflection arrives from legitimate servers: how do you stop it without blocking those servers, and where?'
            },
            solution: [
              {
                it: 'I flood di stato sfruttano l’asimmetria tra l’invio (economico) e il mantenimento dello stato (costoso). Il SYN flood si contrasta con i SYN cookie, che non allocano stato finché l’handshake non è completo; la reflection si contrasta a monte con l’anti-spoofing (BCP 38) e limitando le risposte del servizio riflettente; l’esaurimento delle tabelle si contrasta limitando lo stato per sorgente e facendo scadere prima lo stato incompleto.',
                en: 'State floods exploit the asymmetry between sending (cheap) and keeping state (expensive). The SYN flood is countered with SYN cookies, which allocate no state until the handshake is complete; reflection is countered upstream with anti-spoofing (BCP 38) and by limiting the reflecting service’s responses; table exhaustion is countered by limiting state per source and expiring incomplete state sooner.'
              },
              {
                it: 'Sfida: una reflection arriva da server legittimi, quindi non si bloccano quelli; si ferma alla radice con l’anti-spoofing a monte (che impedisce la partenza dell’origine falsificata) e riducendo l’amplificazione sul servizio riflettente, non filtrando la vittima a valle.',
                en: 'Challenge: a reflection arrives from legitimate servers, so you do not block those; you stop it at the root with upstream anti-spoofing (which prevents the forged source from leaving) and by reducing amplification on the reflecting service, not by filtering the victim downstream.'
              }
            ],
            selfCheck: [
              {
                it: 'So spiegare perché un flood di stato costa poco all’attaccante e molto al difensore.',
                en: 'I can explain why a state flood costs the attacker little and the defender a lot.'
              },
              {
                it: 'So collegare SYN flood, reflection ed esaurimento delle tabelle alle rispettive difese.',
                en: 'I can link SYN floods, reflection, and table exhaustion to their respective defenses.'
              }
            ]
          }
        ]
      },
      {
        id: 'availability-capacity-queues',
        title: {
          it: 'Capacità, code e QoS: il traffico critico sotto pressione',
          en: 'Capacity, queues, and QoS: critical traffic under pressure'
        },
        objectives: [
          {
            it: 'Riconoscere l’esaurimento di capacità in tabelle, cache e servizi oltre il link.',
            en: 'Recognize capacity exhaustion in tables, caches, and services beyond the link.'
          },
          {
            it: 'Spiegare come QoS e code decidono quale traffico sopravvive quando la risorsa è contesa.',
            en: 'Explain how QoS and queues decide which traffic survives when the resource is contended.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere QoS, DNS e NAT (capitoli sui servizi IP e sui servizi IP estesi).',
            en: 'Know QoS, DNS, and NAT (the IP services and extended IP services chapters).'
          }
        ],
        theory: [
          {
            it: 'La capacità si esaurisce anche dove non c’è un attacco esplicito. Una tabella CAM che trabocca fa degradare lo switch a flooding; un pool di lease DHCP esaurito nega l’indirizzo a nuovi host; una cache DNS con troppi cache miss scarica sulla recursion e sui server a monte; una tabella di traduzioni NAT piena blocca nuove sessioni. In tutti i casi la risorsa non è la banda ma una struttura dati o un servizio con un limite, e il sintomo — lentezza, intermittenza, fallimenti nuovi a parità di configurazione — è lo stesso di un attacco. Per questo misurare la capacità normale è un controllo di sicurezza, non solo di capacity planning.',
            en: 'Capacity runs out even where there is no explicit attack. An overflowing CAM table degrades the switch to flooding; an exhausted DHCP lease pool denies addresses to new hosts; a DNS cache with too many cache misses offloads onto recursion and upstream servers; a full NAT translation table blocks new sessions. In all cases the resource is not bandwidth but a data structure or a service with a limit, and the symptom — slowness, intermittence, new failures with unchanged configuration — is the same as an attack. This is why measuring normal capacity is a security control, not only capacity planning.'
          },
          {
            it: 'Quando la risorsa è contesa e non basta per tutti, qualcuno deve decidere chi passa: lo fanno le code e la QoS. Senza una politica, la contesa è cieca e il traffico critico — voce, controllo, gestione — muore per starvation accanto a quello di volume. La QoS classifica il traffico e gli assegna code e priorità, così che sotto pressione le classi critiche mantengano la loro quota invece di competere ad armi pari con un download. Ma la QoS non crea capacità: ridistribuisce la scarsità secondo una priorità scelta, e una classificazione sbagliata protegge il traffico sbagliato.',
            en: 'When the resource is contended and not enough for everyone, someone must decide who passes: queues and QoS do. Without a policy, contention is blind and critical traffic — voice, control, management — dies of starvation next to volume traffic. QoS classifies the traffic and assigns it queues and priorities, so that under pressure the critical classes keep their share instead of competing on equal terms with a download. But QoS does not create capacity: it redistributes scarcity according to a chosen priority, and a wrong classification protects the wrong traffic.'
          },
          {
            it: 'Il capitolo si chiude ricomponendo il quadro: la disponibilità è una proprietà di sistema, non di un dispositivo. Si difende mappando la risorsa più scarsa di ogni servizio, scegliendo il punto di enforcement (a monte per la banda, locale per lo stato e la CPU), non pagando stato costoso per pacchetti economici, e usando capacità e QoS per far sopravvivere il traffico critico quando la scarsità è inevitabile. È la «A» della triade CIA resa operativa: non «niente cade mai», ma «ciò che conta resta in piedi, e ce ne accorgiamo in tempo».',
            en: 'The chapter closes by recomposing the picture: availability is a property of the system, not of a device. It is defended by mapping each service’s scarcest resource, choosing the enforcement point (upstream for bandwidth, local for state and CPU), not paying expensive state for cheap packets, and using capacity and QoS to let critical traffic survive when scarcity is unavoidable. It is the «A» of the CIA triad made operational: not «nothing ever falls», but «what matters stays up, and we notice in time».'
          }
        ],
        example: {
          it: 'Sotto pressione, senza QoS la voce si interrompe mentre un download occupa la coda; classificando il traffico, la classe critica mantiene la sua quota. Una tabella NAT piena, invece, non si risolve con la QoS ma dimensionando la tabella e limitando lo stato per sorgente.',
          en: 'Under pressure, without QoS voice breaks up while a download occupies the queue; by classifying the traffic, the critical class keeps its share. A full NAT table, instead, is not solved by QoS but by sizing the table and limiting state per source.'
        },
        commonMistakes: [
          {
            it: 'Cercare sempre la banda: spesso a esaurirsi è una tabella, una cache o un pool, non il link.',
            en: 'Always looking at bandwidth: often what runs out is a table, a cache, or a pool, not the link.'
          },
          {
            it: 'Credere che la QoS crei capacità: ridistribuisce la scarsità, e una classificazione sbagliata protegge il traffico sbagliato.',
            en: 'Believing QoS creates capacity: it redistributes scarcity, and a wrong classification protects the wrong traffic.'
          },
          {
            it: 'Non avere una linea di base: senza capacità normale misurata, un esaurimento sembra un guasto casuale.',
            en: 'Having no baseline: without measured normal capacity, an exhaustion looks like a random fault.'
          }
        ],
        lab: 'availability',
        references: [{ kind: 'attack', id: 'T1499' }],
        guidedLabs: [
          {
            id: 'gl-availability-qos-starvation',
            title: {
              it: 'Fai sopravvivere il traffico critico',
              en: 'Let the critical traffic survive'
            },
            difficulty: 'core',
            lab: 'availability',
            scenario: {
              it: 'Il laboratorio «Disponibilità e DoS» mostra la capacità di tabelle e servizi e le code QoS.',
              en: 'The “Availability and DoS” lab shows the capacity of tables and services and the QoS queues.'
            },
            task: {
              it: 'Distingui un esaurimento di capacità da un flood e spiega come la QoS fa sopravvivere il traffico critico.',
              en: 'Tell a capacity exhaustion from a flood and explain how QoS lets the critical traffic survive.'
            },
            steps: [
              {
                it: 'Apri «Disponibilità e DoS» e scegli lo scenario su QoS e code.',
                en: 'Open “Availability and DoS” and pick the QoS and queues scenario.'
              },
              {
                it: 'Individua la risorsa esaurita (tabella, cache, pool) o la coda contesa.',
                en: 'Identify the exhausted resource (table, cache, pool) or the contended queue.'
              },
              {
                it: 'Indica se serve QoS, dimensionamento o limite per sorgente, e perché.',
                en: 'State whether QoS, sizing, or per-source limiting is needed, and why.'
              }
            ],
            challenge: {
              it: 'La QoS è configurata ma il traffico critico cade comunque: cosa può essere sbagliato nella classificazione?',
              en: 'QoS is configured but the critical traffic still drops: what can be wrong in the classification?'
            },
            solution: [
              {
                it: 'Un esaurimento di capacità riguarda una struttura con un limite — CAM, lease DHCP, cache DNS, tabella NAT — e si risolve dimensionando e limitando lo stato per sorgente, non con la QoS. La QoS serve quando la risorsa è contesa: classifica il traffico e dà alle classi critiche una quota garantita, così sotto pressione non muoiono per starvation. Ma non crea capacità: ridistribuisce la scarsità secondo la priorità scelta.',
                en: 'A capacity exhaustion concerns a structure with a limit — CAM, DHCP leases, DNS cache, NAT table — and is solved by sizing and limiting state per source, not with QoS. QoS is for when the resource is contended: it classifies traffic and gives critical classes a guaranteed share, so under pressure they do not die of starvation. But it does not create capacity: it redistributes scarcity by the chosen priority.'
              },
              {
                it: 'Sfida: se il traffico critico cade pur con QoS, la classificazione è probabilmente sbagliata — il traffico critico non viene riconosciuto e finisce nella classe di default, o una classe troppo ampia gli toglie la quota; si corregge marcando correttamente il traffico critico al confine di fiducia e verificando le code.',
                en: 'Challenge: if critical traffic drops despite QoS, the classification is probably wrong — the critical traffic is not recognized and ends up in the default class, or an overly broad class takes its share; you fix it by correctly marking the critical traffic at the trust boundary and verifying the queues.'
              }
            ],
            selfCheck: [
              {
                it: 'So riconoscere un esaurimento di capacità oltre la banda e la difesa adatta.',
                en: 'I can recognize a capacity exhaustion beyond bandwidth and the fitting defense.'
              },
              {
                it: 'So spiegare come la QoS fa sopravvivere il traffico critico e perché non crea capacità.',
                en: 'I can explain how QoS lets critical traffic survive and why it does not create capacity.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'management-plane-telemetry-security',
    cert: 'securityplus',
    order: 27,
    track: 'extension',
    title: {
      it: 'Sicurezza del piano di gestione e della telemetria',
      en: 'Management-plane and telemetry security'
    },
    summary: {
      it: 'L’estensione sul terzo piano, dopo dati e controllo: il piano di gestione, cioè come si amministra e si osserva la rete. Isolare la gestione da chi non deve raggiungerla, rendere la telemetria autentica e ancorata a un tempo attendibile perché valga come evidenza, e conoscere i punti ciechi del monitoraggio. Chi controlla la gestione controlla la rete: la difesa è trattarla come la superficie critica che è.',
      en: 'The extension on the third plane, after data and control: the management plane — how the network is administered and observed. Isolate management from those who should not reach it, make telemetry authentic and anchored to trusted time so it counts as evidence, and know the blind spots of monitoring. Whoever controls management controls the network: the defense is to treat it as the critical surface it is.'
    },
    topics: [
      {
        id: 'management-isolation-access',
        title: {
          it: 'Isolare la gestione: OOB, management VRF e accesso',
          en: 'Isolating management: OOB, management VRF, and access'
        },
        objectives: [
          {
            it: 'Spiegare perché il piano di gestione va separato da quello dati e come lo si isola.',
            en: 'Explain why the management plane must be separated from the data plane and how it is isolated.'
          },
          {
            it: 'Collegare accesso amministrativo, identità e accounting a chi può fare cosa sul dispositivo.',
            en: 'Link administrative access, identity, and accounting to who can do what on the device.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere AAA, SSH e la segmentazione (capitoli su sicurezza CCNA, identità e segmentazione).',
            en: 'Know AAA, SSH, and segmentation (the CCNA security, identity, and segmentation chapters).'
          }
        ],
        theory: [
          {
            it: 'Oltre al piano dati (inoltro) e al piano di controllo (routing), esiste il piano di gestione: come si configura e si osserva un dispositivo. È il più sensibile, perché chi lo raggiunge può riconfigurare tutto, e per questo va isolato da chi non deve toccarlo. L’isolamento ideale è out-of-band (OOB): una rete di gestione fisicamente o logicamente separata da quella produttiva, così che un problema o un attacco sul piano dati non chiuda la porta dell’amministratore e, soprattutto, un host qualunque in produzione non raggiunga le interfacce di gestione. Quando l’OOB puro non è possibile, una management VRF separa il traffico di gestione in-band in una tabella di routing dedicata.',
            en: 'Beyond the data plane (forwarding) and the control plane (routing), there is the management plane: how a device is configured and observed. It is the most sensitive, because whoever reaches it can reconfigure everything, and this is why it must be isolated from those who should not touch it. The ideal isolation is out-of-band (OOB): a management network physically or logically separate from the production one, so that a problem or an attack on the data plane does not lock the administrator out and, above all, no random production host reaches the management interfaces. When pure OOB is not possible, a management VRF separates the in-band management traffic into a dedicated routing table.'
          },
          {
            it: 'Isolare il percorso non basta: conta anche chi vi accede e cosa può fare. L’accesso amministrativo va fatto con un trasporto cifrato (SSHv2, mai Telnet in chiaro) sulle linee VTY, con identità individuali invece di un account condiviso, così che ogni azione sia attribuibile a una persona. L’AAA lega l’autenticazione a un sistema centrale, l’autorizzazione a cosa quel ruolo può eseguire, e l’accounting a un registro di chi ha fatto cosa e quando. Un account condiviso o un trasporto in chiaro vanificano l’isolamento del percorso, perché il confine lo attraversa chi non dovrebbe o senza lasciare traccia.',
            en: 'Isolating the path is not enough: who accesses it and what they can do also matters. Administrative access must use an encrypted transport (SSHv2, never cleartext Telnet) on the VTY lines, with individual identities instead of a shared account, so that every action is attributable to a person. AAA ties authentication to a central system, authorization to what that role may run, and accounting to a record of who did what and when. A shared account or a cleartext transport defeats the path isolation, because the boundary is crossed by someone who should not, or without leaving a trace.'
          },
          {
            it: 'Il principio è lo stesso di tutto il capitolo precedente sul routing: nessuna fiducia implicita, nemmeno «dentro». La gestione è un segmento ad alto valore — come i servizi condivisi della segmentazione — e va trattata come tale: raggiungibile solo dalle postazioni autorizzate, con accesso autenticato, autorizzato per ruolo e registrato. Dal lato del tester, le interfacce di gestione esposte sono un bersaglio di primo livello proprio perché aprono tutto; dal lato della difesa, isolarle e governarne l’accesso è il controllo con il più alto impatto sull’intera rete.',
            en: 'The principle is the same as the whole previous routing chapter: no implicit trust, not even «inside». Management is a high-value segment — like the shared services of segmentation — and must be treated as such: reachable only from authorized stations, with authenticated access, authorized by role, and recorded. On the tester’s side, exposed management interfaces are a first-class target precisely because they open everything; on the defensive side, isolating them and governing their access is the control with the highest impact on the whole network.'
          }
        ],
        example: {
          it: 'Le interfacce di gestione dei dispositivi in 192.0.2.0/24 sono raggiungibili solo via rete OOB (o management VRF), con accesso SSHv2 su VTY, identità individuali e AAA: un host qualunque in produzione non le raggiunge e ogni comando resta attribuibile a una persona nell’accounting.',
          en: 'The management interfaces of the devices in 192.0.2.0/24 are reachable only via the OOB network (or a management VRF), with SSHv2 access on VTY, individual identities, and AAA: no random production host reaches them and every command stays attributable to a person in the accounting.'
        },
        commonMistakes: [
          {
            it: 'Gestire in-band sulla rete di produzione: un problema o un attacco sul piano dati chiude fuori l’amministratore.',
            en: 'Managing in-band on the production network: a problem or an attack on the data plane locks the administrator out.'
          },
          {
            it: 'Usare Telnet o un account condiviso: il trasporto in chiaro e l’identità non individuale vanificano l’isolamento.',
            en: 'Using Telnet or a shared account: the cleartext transport and the non-individual identity defeat the isolation.'
          },
          {
            it: 'Trattare la gestione come un segmento qualunque: è ad alto valore e va raggiungibile solo dalle postazioni autorizzate.',
            en: 'Treating management as any segment: it is high-value and must be reachable only from authorized stations.'
          }
        ],
        lab: 'managementsecurity',
        references: [{ kind: 'nist', id: 'SP 800-53 Rev. 5' }],
        guidedLabs: [
          {
            id: 'gl-management-isolation',
            title: {
              it: 'Isola la gestione e rendi attribuibile l’accesso',
              en: 'Isolate management and make access attributable'
            },
            difficulty: 'core',
            lab: 'managementsecurity',
            scenario: {
              it: 'Il laboratorio «Management e telemetria» mostra OOB, management VRF e il percorso in-band, con accesso e accounting.',
              en: 'The “Management and telemetry” lab shows OOB, the management VRF, and the in-band path, with access and accounting.'
            },
            task: {
              it: 'Indica come isoli il piano di gestione e come rendi ogni comando attribuibile a una persona.',
              en: 'State how you isolate the management plane and how you make every command attributable to a person.'
            },
            steps: [
              {
                it: 'Apri «Management e telemetria» e confronta OOB, management VRF e percorso in-band.',
                en: 'Open “Management and telemetry” and compare OOB, the management VRF, and the in-band path.'
              },
              {
                it: 'Individua l’accesso SSHv2 su VTY con identità individuali e AAA.',
                en: 'Identify the SSHv2 access on VTY with individual identities and AAA.'
              },
              {
                it: 'Segna dove l’accounting rende ogni comando attribuibile a una persona.',
                en: 'Mark where accounting makes every command attributable to a person.'
              }
            ],
            challenge: {
              it: 'La gestione è in-band e il piano dati va giù: perché l’amministratore resta chiuso fuori e come lo eviti?',
              en: 'Management is in-band and the data plane goes down: why is the administrator locked out and how do you avoid it?'
            },
            solution: [
              {
                it: 'Il piano di gestione è il più sensibile perché chi lo raggiunge riconfigura tutto; va isolato con l’OOB (rete separata) o una management VRF, raggiungibile solo dalle postazioni autorizzate. L’accesso usa SSHv2 su VTY con identità individuali, e l’AAA lega autenticazione, autorizzazione per ruolo e accounting, così ogni azione è attribuibile a una persona.',
                en: 'The management plane is the most sensitive because whoever reaches it reconfigures everything; it is isolated with OOB (a separate network) or a management VRF, reachable only from authorized stations. Access uses SSHv2 on VTY with individual identities, and AAA ties authentication, role authorization, and accounting, so every action is attributable to a person.'
              },
              {
                it: 'Sfida: con gestione in-band, un guasto o un attacco sul piano dati interrompe anche il percorso di gestione e chiude fuori l’amministratore; lo si evita con l’OOB, un percorso di gestione indipendente dal piano dati che resta raggiungibile proprio quando serve di più.',
                en: 'Challenge: with in-band management, a fault or an attack on the data plane also breaks the management path and locks the administrator out; you avoid it with OOB, a management path independent of the data plane that stays reachable exactly when it is needed most.'
              }
            ],
            selfCheck: [
              {
                it: 'So spiegare perché il piano di gestione va isolato e come (OOB, management VRF).',
                en: 'I can explain why the management plane must be isolated and how (OOB, management VRF).'
              },
              {
                it: 'So legare accesso, identità e accounting all’attribuibilità di ogni comando.',
                en: 'I can tie access, identity, and accounting to the attributability of every command.'
              }
            ]
          }
        ]
      },
      {
        id: 'management-trusted-telemetry',
        title: {
          it: 'Telemetria attendibile: SNMPv3, Syslog e tempo',
          en: 'Trusted telemetry: SNMPv3, Syslog, and time'
        },
        objectives: [
          {
            it: 'Spiegare perché la telemetria vale come evidenza solo se autentica e integra.',
            en: 'Explain why telemetry counts as evidence only if it is authentic and intact.'
          },
          {
            it: 'Collegare il tempo attendibile (NTP) alla correlazione e alla catena di custodia.',
            en: 'Link trusted time (NTP) to correlation and the chain of custody.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere SNMP, Syslog e NTP di base (capitolo sui servizi IP estesi) e la detection.',
            en: 'Know basic SNMP, Syslog, and NTP (the extended IP services chapter) and detection.'
          }
        ],
        theory: [
          {
            it: 'La telemetria — i dati che la rete emette su sé stessa — serve a vedere e a provare cosa è successo, ma vale come evidenza solo se è autentica e integra. SNMP va usato nella versione 3, che aggiunge autenticazione e cifratura e limita con le viste cosa ogni utente può leggere o scrivere: le versioni precedenti, con la community in chiaro, espongono lo stato del dispositivo e, in scrittura, la sua configurazione. Allo stesso modo il Syslog remoto va trasportato in modo protetto verso un collector affidabile, perché i log valgono solo se non possono essere letti o alterati lungo il percorso: un’evidenza manomissibile non è un’evidenza.',
            en: 'Telemetry — the data the network emits about itself — serves to see and to prove what happened, but it counts as evidence only if it is authentic and intact. SNMP must be used in version 3, which adds authentication and encryption and limits with views what each user may read or write: earlier versions, with the cleartext community, expose the device state and, on write, its configuration. Likewise remote Syslog must be transported protected toward a trustworthy collector, because logs count only if they cannot be read or altered along the way: tamperable evidence is not evidence.'
          },
          {
            it: 'C’è un ingrediente che tiene insieme tutta la telemetria: il tempo attendibile. Senza orologi sincronizzati su una fonte NTP affidabile, i log di sistemi diversi non si possono correlare — un evento sembra precedere la sua causa, o due tracce dello stesso fatto non combaciano. Il tempo è anche parte della catena di custodia: un’evidenza con un timestamp incoerente perde valore in un’indagine. Per questo l’NTP non è un dettaglio operativo ma un controllo di sicurezza, e la sua stessa fonte va protetta: un tempo falsificato falsifica a cascata ogni correlazione che vi si appoggia.',
            en: 'There is one ingredient that holds all telemetry together: trusted time. Without clocks synchronized to a reliable NTP source, the logs of different systems cannot be correlated — an event seems to precede its cause, or two traces of the same fact do not match. Time is also part of the chain of custody: evidence with an inconsistent timestamp loses value in an investigation. This is why NTP is not an operational detail but a security control, and its own source must be protected: a forged time cascades into forging every correlation that relies on it.'
          },
          {
            it: 'Il filo conduttore è che la telemetria è una difesa solo quando ci si può fidare di ciò che dice. Autenticità (SNMPv3, trasporto Syslog protetto), integrità (collector affidabile, log non alterabili) e tempo attendibile (NTP protetto) sono i tre requisiti che trasformano dei dati in evidenza. È la stessa disciplina evidence-first vista per l’email e per l’endpoint, portata al piano di gestione: non basta raccogliere, bisogna poter dimostrare che ciò che si è raccolto è vero e collocato correttamente nel tempo.',
            en: 'The thread is that telemetry is a defense only when you can trust what it says. Authenticity (SNMPv3, protected Syslog transport), integrity (a trustworthy collector, tamper-resistant logs), and trusted time (protected NTP) are the three requirements that turn data into evidence. It is the same evidence-first discipline seen for email and for the endpoint, brought to the management plane: collecting is not enough, you must be able to prove that what you collected is true and correctly placed in time.'
          }
        ],
        example: {
          it: 'Un collector riceve Syslog da dispositivi in 192.0.2.0/24 su un trasporto protetto e SNMPv3 autenticato; grazie all’NTP condiviso, i log si correlano con timestamp coerenti, e un evento e la sua causa restano nell’ordine giusto in un’indagine.',
          en: 'A collector receives Syslog from devices in 192.0.2.0/24 over a protected transport and authenticated SNMPv3; thanks to shared NTP, the logs correlate with consistent timestamps, and an event and its cause stay in the right order in an investigation.'
        },
        commonMistakes: [
          {
            it: 'Usare SNMP v1/v2c con community in chiaro: espone lo stato e, in scrittura, la configurazione del dispositivo.',
            en: 'Using SNMP v1/v2c with a cleartext community: it exposes the state and, on write, the device configuration.'
          },
          {
            it: 'Trascurare il tempo attendibile: senza NTP coerente i log non si correlano e l’evidenza perde valore.',
            en: 'Neglecting trusted time: without consistent NTP the logs do not correlate and the evidence loses value.'
          },
          {
            it: 'Fidarsi di log manomissibili: un trasporto o un collector non protetti rendono l’evidenza inutilizzabile.',
            en: 'Trusting tamperable logs: an unprotected transport or collector makes the evidence unusable.'
          }
        ],
        lab: 'managementsecurity',
        references: [{ kind: 'rfc', id: 'RFC 3411' }],
        guidedLabs: [
          {
            id: 'gl-management-evidence',
            title: {
              it: 'Rendi la telemetria un’evidenza affidabile',
              en: 'Make telemetry reliable evidence'
            },
            difficulty: 'advanced',
            lab: 'managementsecurity',
            scenario: {
              it: 'Il laboratorio «Management e telemetria» mostra SNMPv3, il Syslog remoto e il tempo attendibile.',
              en: 'The “Management and telemetry” lab shows SNMPv3, remote Syslog, and trusted time.'
            },
            task: {
              it: 'Indica i tre requisiti che rendono la telemetria un’evidenza e cosa succede se manca il tempo attendibile.',
              en: 'State the three requirements that make telemetry evidence and what happens if trusted time is missing.'
            },
            steps: [
              {
                it: 'Apri «Management e telemetria» e confronta SNMPv3 con le versioni in chiaro.',
                en: 'Open “Management and telemetry” and compare SNMPv3 with the cleartext versions.'
              },
              {
                it: 'Verifica il trasporto protetto del Syslog verso un collector affidabile.',
                en: 'Check the protected transport of Syslog toward a trustworthy collector.'
              },
              {
                it: 'Segna come l’NTP condiviso permette di correlare log di sistemi diversi.',
                en: 'Mark how shared NTP lets you correlate logs from different systems.'
              }
            ],
            challenge: {
              it: 'Due log dello stesso evento non combaciano nei tempi: cosa è saltato e perché invalida la correlazione?',
              en: 'Two logs of the same event do not match in time: what broke and why does it invalidate the correlation?'
            },
            solution: [
              {
                it: 'La telemetria vale come evidenza solo se è autentica (SNMPv3 con autenticazione e viste, non le community in chiaro), integra (Syslog su trasporto protetto verso un collector affidabile, log non alterabili) e ancorata a un tempo attendibile (NTP protetto). Insieme, i tre requisiti trasformano dei dati in prova utilizzabile.',
                en: 'Telemetry counts as evidence only if it is authentic (SNMPv3 with authentication and views, not cleartext communities), intact (Syslog over a protected transport toward a trustworthy collector, tamper-resistant logs), and anchored to trusted time (protected NTP). Together, the three requirements turn data into usable proof.'
              },
              {
                it: 'Sfida: se i tempi di due log non combaciano è saltato il tempo attendibile — orologi non sincronizzati o una fonte NTP non affidabile; invalida la correlazione perché un evento può sembrare precedere la sua causa, e un timestamp incoerente rompe la catena di custodia.',
                en: 'Challenge: if two logs’ times do not match, trusted time broke — unsynchronized clocks or an unreliable NTP source; it invalidates the correlation because an event can seem to precede its cause, and an inconsistent timestamp breaks the chain of custody.'
              }
            ],
            selfCheck: [
              {
                it: 'So dire i tre requisiti (autenticità, integrità, tempo) che rendono la telemetria un’evidenza.',
                en: 'I can state the three requirements (authenticity, integrity, time) that make telemetry evidence.'
              },
              {
                it: 'So spiegare perché l’NTP attendibile è un controllo di sicurezza, non un dettaglio.',
                en: 'I can explain why trusted NTP is a security control, not a detail.'
              }
            ]
          }
        ]
      },
      {
        id: 'management-automation-blind-spots',
        title: {
          it: 'Automazione e punti ciechi: NETCONF, backup e collector',
          en: 'Automation and blind spots: NETCONF, backups, and collectors'
        },
        objectives: [
          {
            it: 'Distinguere lo stato previsto da quello effettivo con le interfacce programmabili (NETCONF/RESTCONF).',
            en: 'Distinguish intended from actual state with the programmable interfaces (NETCONF/RESTCONF).'
          },
          {
            it: 'Riconoscere i punti ciechi: informazioni esposte, backup non protetti e sampling dei collector.',
            en: 'Recognize the blind spots: exposed information, unprotected backups, and collector sampling.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere automazione e API (capitolo su automazione e programmabilità) e la telemetria (argomento precedente).',
            en: 'Know automation and APIs (the automation and programmability chapter) and telemetry (previous topic).'
          }
        ],
        theory: [
          {
            it: 'Le interfacce programmabili cambiano come si gestisce e come si verifica. NETCONF e RESTCONF, con i modelli dati YANG, permettono di leggere e scrivere la configurazione in modo strutturato, e soprattutto di confrontare lo stato previsto (ciò che si è inteso configurare) con lo stato effettivo (ciò che il dispositivo ha davvero). È un controllo potente contro la deriva silenziosa: una configurazione che «dovrebbe» essere applicata ma non lo è diventa visibile. Ma un canale programmabile è anche un accesso di gestione a tutti gli effetti, e come tale va autenticato, autorizzato e registrato: un’API di gestione esposta è pericolosa quanto una VTY aperta.',
            en: 'Programmable interfaces change how you manage and how you verify. NETCONF and RESTCONF, with the YANG data models, let you read and write configuration in a structured way, and above all compare the intended state (what you meant to configure) with the actual state (what the device really has). It is a powerful control against silent drift: a configuration that «should» be applied but is not becomes visible. But a programmable channel is also a management access in every respect, and as such must be authenticated, authorized, and recorded: an exposed management API is as dangerous as an open VTY.'
          },
          {
            it: 'Il piano di gestione ha anche punti ciechi che vanno conosciuti. I protocolli di scoperta come CDP e LLDP sono utili all’inventario ma espongono informazioni — modello, versione, porte, vicini — a chi è sul segmento: vanno attivati solo dove servono e non verso segmenti non fidati. I backup di configurazione contengono segreti e sono una copia completa della rete: vanno protetti come i segreti stessi e il restore va verificato, perché un backup che non si ripristina non è un backup. Infine i collector campionano: ciò che non viene campionato o che cade in una finestra di non copertura è un punto cieco, e un attaccante esperto lavora proprio lì.',
            en: 'The management plane also has blind spots that must be known. Discovery protocols like CDP and LLDP are useful for inventory but expose information — model, version, ports, neighbors — to whoever is on the segment: they must be enabled only where needed and not toward untrusted segments. Configuration backups contain secrets and are a full copy of the network: they must be protected like the secrets themselves and the restore must be verified, because a backup that does not restore is not a backup. Finally, collectors sample: what is not sampled or falls in a non-coverage window is a blind spot, and a skilled attacker works exactly there.'
          },
          {
            it: 'Il capitolo chiude la trilogia dei piani: dati, controllo e gestione. Il filo è unico — nessuna fiducia implicita, tutto verificato — applicato a chi amministra e osserva la rete: isolare la gestione, autenticare e registrare l’accesso, rendere la telemetria autentica e ben datata, verificare lo stato effettivo e conoscere i punti ciechi. Chi controlla la gestione controlla la rete; per questo il piano di gestione non è l’ultimo per importanza, ma spesso il primo bersaglio, e difenderlo è ciò che rende affidabile tutto il resto che abbiamo costruito.',
            en: 'The chapter closes the trilogy of planes: data, control, and management. The thread is one — no implicit trust, everything verified — applied to those who administer and observe the network: isolate management, authenticate and record access, make telemetry authentic and well-timed, verify the actual state, and know the blind spots. Whoever controls management controls the network; this is why the management plane is not the least important, but often the first target, and defending it is what makes everything else we have built trustworthy.'
          }
        ],
        example: {
          it: 'Con NETCONF si confronta lo stato effettivo di un dispositivo in 192.0.2.0/24 con quello previsto e si scopre una regola mancante; intanto il CDP è disattivato verso i segmenti non fidati, i backup di configurazione sono protetti come segreti e il restore è verificato.',
          en: 'With NETCONF you compare a device’s actual state in 192.0.2.0/24 with the intended one and find a missing rule; meanwhile CDP is disabled toward untrusted segments, the configuration backups are protected like secrets, and the restore is verified.'
        },
        commonMistakes: [
          {
            it: 'Esporre un’API di gestione senza controlli: NETCONF/RESTCONF è un accesso di gestione come una VTY.',
            en: 'Exposing a management API without controls: NETCONF/RESTCONF is a management access like a VTY.'
          },
          {
            it: 'Lasciare CDP/LLDP ovunque: rivelano modello, versione e vicini a chi è su un segmento non fidato.',
            en: 'Leaving CDP/LLDP everywhere: they reveal model, version, and neighbors to whoever is on an untrusted segment.'
          },
          {
            it: 'Non verificare il restore: un backup con segreti che non si ripristina non protegge e non è un backup.',
            en: 'Not verifying the restore: a backup with secrets that does not restore protects nothing and is not a backup.'
          }
        ],
        lab: 'managementsecurity',
        references: [{ kind: 'rfc', id: 'RFC 6241' }],
        guidedLabs: [
          {
            id: 'gl-management-actual-state',
            title: {
              it: 'Verifica lo stato effettivo e trova il punto cieco',
              en: 'Verify the actual state and find the blind spot'
            },
            difficulty: 'advanced',
            lab: 'managementsecurity',
            scenario: {
              it: 'Il laboratorio «Management e telemetria» mostra NETCONF/RESTCONF, l’esposizione di CDP/LLDP, i backup e i collector.',
              en: 'The “Management and telemetry” lab shows NETCONF/RESTCONF, CDP/LLDP exposure, backups, and collectors.'
            },
            task: {
              it: 'Confronta stato previsto ed effettivo e indica un punto cieco del monitoraggio e come lo chiudi.',
              en: 'Compare intended and actual state and point out a monitoring blind spot and how you close it.'
            },
            steps: [
              {
                it: 'Apri «Management e telemetria» e usa NETCONF/RESTCONF per leggere lo stato effettivo.',
                en: 'Open “Management and telemetry” and use NETCONF/RESTCONF to read the actual state.'
              },
              {
                it: 'Confronta con lo stato previsto e individua una deriva silenziosa.',
                en: 'Compare with the intended state and find a silent drift.'
              },
              {
                it: 'Segna un punto cieco (CDP esposto, backup non protetto, sampling) e come lo chiudi.',
                en: 'Mark a blind spot (exposed CDP, unprotected backup, sampling) and how you close it.'
              }
            ],
            challenge: {
              it: 'Il monitoraggio «non vede niente» eppure qualcosa è cambiato: dove può essere il punto cieco?',
              en: 'Monitoring «sees nothing» yet something changed: where can the blind spot be?'
            },
            solution: [
              {
                it: 'NETCONF/RESTCONF con YANG permette di leggere lo stato effettivo e confrontarlo con quello previsto, rendendo visibile una deriva che la sola intenzione nasconderebbe; ma è un accesso di gestione e va autenticato, autorizzato e registrato. I punti ciechi sono CDP/LLDP che espongono informazioni su segmenti non fidati, i backup con segreti non protetti o con restore non verificato, e il sampling dei collector che non copre tutto.',
                en: 'NETCONF/RESTCONF with YANG lets you read the actual state and compare it with the intended one, making visible a drift that intent alone would hide; but it is a management access and must be authenticated, authorized, and recorded. The blind spots are CDP/LLDP exposing information on untrusted segments, backups with unprotected secrets or an unverified restore, and collector sampling that does not cover everything.'
              },
              {
                it: 'Sfida: se il monitoraggio non vede un cambiamento, il punto cieco è dove non campiona o non raccoglie — una finestra di sampling scoperta, un dispositivo fuori dall’inventario del collector, o un canale non monitorato; si chiude confrontando lo stato effettivo via NETCONF e allargando la copertura dove il sampling lasciava un buco.',
                en: 'Challenge: if monitoring does not see a change, the blind spot is where it does not sample or collect — an uncovered sampling window, a device outside the collector’s inventory, or an unmonitored channel; you close it by comparing the actual state via NETCONF and widening coverage where sampling left a gap.'
              }
            ],
            selfCheck: [
              {
                it: 'So confrontare stato previsto ed effettivo e trattare un’API di gestione come un accesso critico.',
                en: 'I can compare intended and actual state and treat a management API as a critical access.'
              },
              {
                it: 'So riconoscere i punti ciechi (CDP, backup, sampling) e come chiuderli.',
                en: 'I can recognize the blind spots (CDP, backups, sampling) and how to close them.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'resilience-recovery',
    cert: 'securityplus',
    order: 28,
    track: 'extension',
    title: {
      it: 'Resilienza e ripristino',
      en: 'Resilience and recovery'
    },
    summary: {
      it: 'L’estensione sull’altra faccia della disponibilità: non evitare il guasto, ma riprendersi quando accade. La ridondanza che aiuta davvero (percorsi e alimentazione realmente indipendenti, accesso OOB), la procedura di ripristino con dipendenze, continuità minima e condizioni di arresto, e la validazione — perché un ripristino non è finito finché non è provato per nome, con RTO/RPO rispettati e backup che si ripristinano davvero.',
      en: 'The extension on the other face of availability: not avoiding the failure, but recovering when it happens. Redundancy that truly helps (genuinely independent paths and power, OOB access), the recovery procedure with dependencies, minimum continuity, and stop conditions, and validation — because a recovery is not done until it is proven by name, with RTO/RPO met and backups that actually restore.'
    },
    topics: [
      {
        id: 'recovery-true-redundancy',
        title: {
          it: 'Ridondanza vera: percorsi, alimentazione e accesso OOB',
          en: 'True redundancy: paths, power, and OOB access'
        },
        objectives: [
          {
            it: 'Distinguere la ridondanza configurata dall’indipendenza reale (nessun destino condiviso).',
            en: 'Distinguish configured redundancy from real independence (no shared fate).'
          },
          {
            it: 'Spiegare perché l’accesso OOB e uno spare validato rendono possibile il ripristino.',
            en: 'Explain why OOB access and a validated spare make recovery possible.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere FHRP, la disponibilità e il piano di gestione (capitoli su servizi IP estesi, disponibilità e gestione).',
            en: 'Know FHRP, availability, and the management plane (the extended IP services, availability, and management chapters).'
          }
        ],
        theory: [
          {
            it: 'La ridondanza serve a sopravvivere a un guasto, ma aiuta solo se le due vie non cadono insieme. Due collegamenti «ridondati» che passano per lo stesso cavidotto, lo stesso apparato o la stessa alimentazione condividono un destino: un singolo evento li spegne entrambi, e la ridondanza esiste sulla carta ma non nei fatti. La domanda giusta non è «ho un secondo percorso?» ma «il secondo percorso è davvero indipendente dal primo?». Lo stesso vale per l’alimentazione (alimentatori e linee separate) e per gli apparati (uno spare realmente disponibile e, soprattutto, validato: uno spare mai provato è un’ipotesi, non una difesa).',
            en: 'Redundancy exists to survive a failure, but it helps only if the two paths do not fall together. Two «redundant» links that run through the same duct, the same device, or the same power feed share a fate: a single event turns both off, and redundancy exists on paper but not in fact. The right question is not «do I have a second path?» but «is the second path truly independent of the first?». The same holds for power (separate supplies and feeds) and for devices (a spare that is really available and, above all, validated: an untested spare is a hypothesis, not a defense).'
          },
          {
            it: 'C’è una ridondanza che si dimentica sempre e che conta più delle altre quando le cose vanno male: l’accesso. Se la gestione è in-band e il guasto è sul piano dati, l’amministratore non raggiunge i dispositivi proprio nel momento in cui deve ripristinarli. L’accesso out-of-band (OOB), indipendente dal percorso dati, è ciò che trasforma un’interruzione in un ripristino: senza di esso, un guasto diventa un intervento fisico sul posto. Per questo l’OOB, già visto come controllo di gestione, è anche un controllo di resilienza: è la via che resta aperta quando tutte le altre si chiudono.',
            en: 'There is a redundancy that is always forgotten and that matters more than the others when things go wrong: access. If management is in-band and the failure is on the data plane, the administrator cannot reach the devices exactly when they must be restored. Out-of-band (OOB) access, independent of the data path, is what turns an outage into a recovery: without it, a failure becomes a physical on-site intervention. This is why OOB, already seen as a management control, is also a resilience control: it is the path that stays open when all the others close.'
          },
          {
            it: 'Il principio è che la ridondanza va provata, non dichiarata. Un percorso alternativo va verificato davvero, facendo cadere il primario in una finestra controllata e osservando che il secondario regga senza errori né saturazione; uno spare va installato e configurato almeno una volta; l’OOB va usato prima dell’emergenza. È la stessa disciplina di verifica vista per il routing e la telemetria, applicata alla continuità: ciò che non è stato provato non si può dare per funzionante, e scoprire che una ridondanza era solo sulla carta durante un guasto reale è il modo più costoso di impararlo.',
            en: 'The principle is that redundancy must be proven, not declared. An alternate path must actually be verified, by failing the primary in a controlled window and observing that the secondary holds without errors or saturation; a spare must be installed and configured at least once; OOB must be used before the emergency. It is the same verification discipline seen for routing and telemetry, applied to continuity: what has not been tested cannot be assumed working, and discovering that a redundancy was only on paper during a real failure is the most expensive way to learn it.'
          }
        ],
        example: {
          it: 'Due uplink verso 192.0.2.0/24 sono «ridondati» ma passano per lo stesso apparato: un suo guasto li spegne entrambi. La ridondanza vera richiede un percorso fisicamente separato, alimentazione indipendente, uno spare validato e l’accesso OOB per intervenire quando il piano dati è giù.',
          en: 'Two uplinks toward 192.0.2.0/24 are «redundant» but run through the same device: a failure of it turns both off. True redundancy requires a physically separate path, independent power, a validated spare, and OOB access to intervene when the data plane is down.'
        },
        commonMistakes: [
          {
            it: 'Chiamare ridondanza due vie con destino condiviso: stesso cavidotto, apparato o alimentazione cadono insieme.',
            en: 'Calling two paths with a shared fate redundancy: the same duct, device, or power feed fall together.'
          },
          {
            it: 'Contare su uno spare mai provato: uno spare non validato è un’ipotesi, non una difesa.',
            en: 'Counting on an untested spare: an unvalidated spare is a hypothesis, not a defense.'
          },
          {
            it: 'Gestire in-band senza OOB: quando il piano dati cade, l’accesso per ripristinare cade con lui.',
            en: 'Managing in-band without OOB: when the data plane falls, the access to recover falls with it.'
          }
        ],
        lab: 'recovery',
        references: [{ kind: 'nist', id: 'SP 800-34 Rev. 1' }],
        guidedLabs: [
          {
            id: 'gl-recovery-independence',
            title: {
              it: 'Prova che la ridondanza è indipendente',
              en: 'Prove the redundancy is independent'
            },
            difficulty: 'core',
            lab: 'recovery',
            scenario: {
              it: 'Il laboratorio «Resilienza e ripristino» mostra percorsi alternativi, alimentazione ridondata e accesso OOB.',
              en: 'The “Resilience and recovery” lab shows alternate paths, redundant power, and OOB access.'
            },
            task: {
              it: 'Verifica se un percorso alternativo è davvero indipendente dal primario e indica cosa serve per ripristinare.',
              en: 'Verify whether an alternate path is truly independent of the primary and state what is needed to recover.'
            },
            steps: [
              {
                it: 'Apri «Resilienza e ripristino» e osserva il percorso alternativo rispetto al primario.',
                en: 'Open “Resilience and recovery” and observe the alternate path against the primary.'
              },
              {
                it: 'Cerca un destino condiviso (stesso apparato, cavidotto o alimentazione).',
                en: 'Look for a shared fate (the same device, duct, or power feed).'
              },
              {
                it: 'Indica come l’accesso OOB e uno spare validato rendono possibile il ripristino.',
                en: 'State how OOB access and a validated spare make recovery possible.'
              }
            ],
            challenge: {
              it: 'Il secondario «c’è» ma durante un guasto cade con il primario: quale destino condiviso te lo avrebbe rivelato prima?',
              en: 'The secondary «is there» but during a failure it falls with the primary: which shared fate would have revealed it earlier?'
            },
            solution: [
              {
                it: 'La ridondanza aiuta solo se le due vie non cadono insieme: un percorso alternativo che condivide cavidotto, apparato o alimentazione ha un destino condiviso e un solo evento li spegne entrambi. Si prova facendo cadere il primario in una finestra controllata e osservando che il secondario regga; l’accesso OOB e uno spare validato rendono possibile intervenire quando il piano dati è giù.',
                en: 'Redundancy helps only if the two paths do not fall together: an alternate path sharing a duct, a device, or power has a shared fate and a single event turns both off. You prove it by failing the primary in a controlled window and observing that the secondary holds; OOB access and a validated spare make it possible to intervene when the data plane is down.'
              },
              {
                it: 'Sfida: se il secondario cade con il primario, il destino condiviso era un elemento comune — lo stesso apparato di aggregazione, lo stesso cavidotto o la stessa alimentazione; lo avrebbe rivelato prima una prova di failover controllata, non la sola presenza del secondo percorso in configurazione.',
                en: 'Challenge: if the secondary falls with the primary, the shared fate was a common element — the same aggregation device, the same duct, or the same power; a controlled failover test would have revealed it earlier, not the mere presence of the second path in the configuration.'
              }
            ],
            selfCheck: [
              {
                it: 'So distinguere la ridondanza configurata dall’indipendenza reale senza destino condiviso.',
                en: 'I can distinguish configured redundancy from real independence with no shared fate.'
              },
              {
                it: 'So spiegare perché OOB e spare validato rendono possibile il ripristino.',
                en: 'I can explain why OOB and a validated spare make recovery possible.'
              }
            ]
          }
        ]
      },
      {
        id: 'recovery-procedure-continuity',
        title: {
          it: 'La procedura: dipendenze, continuità minima e stop condition',
          en: 'The procedure: dependencies, minimum continuity, and stop conditions'
        },
        objectives: [
          {
            it: 'Ordinare un ripristino secondo le dipendenze e la continuità minima da garantire.',
            en: 'Order a recovery by dependencies and the minimum continuity to guarantee.'
          },
          {
            it: 'Definire condizioni di arresto che evitano di peggiorare la situazione durante il ripristino.',
            en: 'Define stop conditions that avoid making the situation worse during recovery.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere routing, servizi IP e il ripristino L2 (capitoli su routing, servizi IP e VLAN/STP).',
            en: 'Know routing, IP services, and L2 recovery (the routing, IP services, and VLAN/STP chapters).'
          }
        ],
        theory: [
          {
            it: 'Un ripristino non è un atto unico ma una procedura ordinata, e l’ordine conta perché i servizi dipendono l’uno dall’altro. Ripristinare un servizio prima di ciò da cui dipende lo fa ripartire rotto: il DNS prima della connettività, un’applicazione prima del gateway, il routing dinamico prima che le adiacenze siano autenticate. La procedura parte quindi dalle dipendenze — cosa deve essere in piedi perché il passo successivo abbia senso — e punta prima alla continuità minima: non «tutto come prima», ma «il servizio essenziale di nuovo disponibile», lasciando il ripristino completo ai passi seguenti.',
            en: 'A recovery is not a single act but an ordered procedure, and the order matters because services depend on one another. Restoring a service before what it depends on brings it back broken: DNS before connectivity, an application before the gateway, dynamic routing before the adjacencies are authenticated. The procedure therefore starts from the dependencies — what must be up for the next step to make sense — and aims first at minimum continuity: not «everything as before», but «the essential service available again», leaving the full recovery to the following steps.'
          },
          {
            it: 'Ogni procedura di ripristino ha bisogno di condizioni di arresto, perché insistere può peggiorare le cose. Se un passo non produce il risultato atteso — un’adiacenza che non si forma, una rotta che non appare, un servizio che riparte e ricade — bisogna fermarsi e capire, non ripetere con più forza. Senza stop condition, un ripristino maldestro può propagare il guasto: riportare in servizio un apparato ancora compromesso, reintrodurre un loop, ripristinare una configurazione che conteneva proprio l’errore. La stop condition è ciò che distingue un ripristino disciplinato da un «proviamo e vediamo» che allunga il disservizio.',
            en: 'Every recovery procedure needs stop conditions, because pressing on can make things worse. If a step does not produce the expected result — an adjacency that does not form, a route that does not appear, a service that restarts and falls again — you must stop and understand, not repeat harder. Without stop conditions, a clumsy recovery can propagate the failure: bringing back a still-compromised device, reintroducing a loop, restoring a configuration that contained the very error. The stop condition is what distinguishes a disciplined recovery from a «let’s try and see» that lengthens the outage.'
          },
          {
            it: 'Il quadro è coerente con l’intero track difensivo: anche nell’emergenza, non si agisce senza verifica. Si ripristina per dipendenze, si garantisce prima la continuità minima, si verifica ogni passo prima del successivo e ci si ferma quando l’esito non è quello atteso. È la differenza tra un piano di ripristino e un’improvvisazione sotto pressione: il piano conosce in anticipo l’ordine, la continuità minima accettabile e i segnali per fermarsi, così la persona che ripristina non deve inventarli mentre l’orologio corre.',
            en: 'The picture is consistent with the whole defensive track: even in an emergency, you do not act without verification. You recover by dependencies, you guarantee minimum continuity first, you verify each step before the next, and you stop when the outcome is not the expected one. It is the difference between a recovery plan and improvisation under pressure: the plan knows in advance the order, the acceptable minimum continuity, and the signals to stop, so the person recovering does not have to invent them while the clock runs.'
          }
        ],
        example: {
          it: 'Dopo un guasto, si ripristina prima la connettività di base e il gateway, poi DNS e DHCP, infine le applicazioni testate per nome; se un’adiacenza di routing non si forma come previsto, la stop condition impone di fermarsi e verificare l’autenticazione invece di forzare.',
          en: 'After a failure, you restore basic connectivity and the gateway first, then DNS and DHCP, finally the applications tested by name; if a routing adjacency does not form as expected, the stop condition requires stopping and checking authentication instead of forcing.'
        },
        commonMistakes: [
          {
            it: 'Ripristinare senza rispettare le dipendenze: un servizio riparte rotto se manca ciò da cui dipende.',
            en: 'Recovering without respecting dependencies: a service comes back broken if what it depends on is missing.'
          },
          {
            it: 'Puntare subito a «tutto come prima»: prima la continuità minima, poi il ripristino completo.',
            en: 'Aiming straight for «everything as before»: minimum continuity first, then full recovery.'
          },
          {
            it: 'Insistere senza stop condition: ripetere un passo che fallisce può propagare il guasto.',
            en: 'Pressing on without a stop condition: repeating a failing step can propagate the failure.'
          }
        ],
        lab: 'recovery',
        references: [{ kind: 'nist', id: 'SP 800-53 Rev. 5' }],
        guidedLabs: [
          {
            id: 'gl-recovery-order',
            title: {
              it: 'Ordina il ripristino e sappi quando fermarti',
              en: 'Order the recovery and know when to stop'
            },
            difficulty: 'advanced',
            lab: 'recovery',
            scenario: {
              it: 'Il laboratorio «Resilienza e ripristino» mostra procedure con dipendenze, continuità minima e condizioni di arresto.',
              en: 'The “Resilience and recovery” lab shows procedures with dependencies, minimum continuity, and stop conditions.'
            },
            task: {
              it: 'Metti in ordine un ripristino per dipendenze e indica una stop condition che evita di peggiorare la situazione.',
              en: 'Put a recovery in order by dependencies and state a stop condition that avoids making things worse.'
            },
            steps: [
              {
                it: 'Apri «Resilienza e ripristino» e scegli uno scenario con più servizi dipendenti.',
                en: 'Open “Resilience and recovery” and pick a scenario with several dependent services.'
              },
              {
                it: 'Ordina i passi per dipendenze e individua la continuità minima da garantire prima.',
                en: 'Order the steps by dependencies and identify the minimum continuity to guarantee first.'
              },
              {
                it: 'Definisci una stop condition per un passo che non dà l’esito atteso.',
                en: 'Define a stop condition for a step that does not give the expected outcome.'
              }
            ],
            challenge: {
              it: 'Ripristinare un apparato lo riporta in servizio ma reintroduce il problema: quale verifica mancava prima di riattivarlo?',
              en: 'Recovering a device brings it back but reintroduces the problem: which check was missing before reactivating it?'
            },
            solution: [
              {
                it: 'Il ripristino segue le dipendenze — connettività e gateway prima di DNS/DHCP, questi prima delle applicazioni — e punta prima alla continuità minima, non a «tutto come prima». Ogni passo si verifica prima del successivo, e una stop condition impone di fermarsi quando l’esito non è quello atteso, per non propagare il guasto reintroducendo un loop o un apparato ancora compromesso.',
                en: 'Recovery follows the dependencies — connectivity and gateway before DNS/DHCP, these before applications — and aims first at minimum continuity, not «everything as before». Each step is verified before the next, and a stop condition requires stopping when the outcome is not the expected one, to avoid propagating the failure by reintroducing a loop or a still-compromised device.'
              },
              {
                it: 'Sfida: se riattivare un apparato reintroduce il problema, mancava la verifica del suo stato prima di rimetterlo in servizio — una configurazione nota-buona e il controllo che non fosse ancora compromesso; la stop condition l’avrebbe fermato finché la verifica non dava esito.',
                en: 'Challenge: if reactivating a device reintroduces the problem, the check of its state before returning it to service was missing — a known-good configuration and the verification that it was not still compromised; the stop condition would have held it until the check passed.'
              }
            ],
            selfCheck: [
              {
                it: 'So ordinare un ripristino per dipendenze e garantire prima la continuità minima.',
                en: 'I can order a recovery by dependencies and guarantee minimum continuity first.'
              },
              {
                it: 'So definire condizioni di arresto che evitano di peggiorare durante il ripristino.',
                en: 'I can define stop conditions that avoid making things worse during recovery.'
              }
            ]
          }
        ]
      },
      {
        id: 'recovery-validation-rto-rpo',
        title: {
          it: 'Validare il ripristino: RTO/RPO, test per nome e backup verificati',
          en: 'Validating recovery: RTO/RPO, testing by name, and verified backups'
        },
        objectives: [
          {
            it: 'Definire RTO e RPO come obiettivi misurabili del ripristino e del dato recuperabile.',
            en: 'Define RTO and RPO as measurable targets of the recovery and of the recoverable data.'
          },
          {
            it: 'Spiegare perché un ripristino vale solo se validato per nome, con backup che si ripristinano.',
            en: 'Explain why a recovery counts only if validated by name, with backups that actually restore.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere DNS, i backup di configurazione e la telemetria (capitoli su servizi IP e gestione).',
            en: 'Know DNS, configuration backups, and telemetry (the IP services and management chapters).'
          }
        ],
        theory: [
          {
            it: 'Un ripristino ha due obiettivi misurabili, ed entrambi vanno decisi prima del guasto. Il RTO (Recovery Time Objective) è quanto tempo il servizio può restare giù prima che il danno diventi inaccettabile; il RPO (Recovery Point Objective) è quanto dato si può perdere, cioè quanto indietro può essere l’ultimo stato recuperabile. Insieme dicono «entro quanto» e «da quale punto» si deve tornare in servizio, e guidano le scelte: un RPO stretto richiede backup frequenti, un RTO stretto richiede ridondanza calda e procedure provate. Senza RTO/RPO, «ripristinato» non ha una misura e il piano non si può valutare.',
            en: 'A recovery has two measurable targets, and both must be decided before the failure. The RTO (Recovery Time Objective) is how long the service can stay down before the damage becomes unacceptable; the RPO (Recovery Point Objective) is how much data can be lost, that is, how far back the last recoverable state can be. Together they say «within how long» and «from which point» service must be restored, and they drive the choices: a tight RPO requires frequent backups, a tight RTO requires hot redundancy and tested procedures. Without RTO/RPO, «recovered» has no measure and the plan cannot be evaluated.'
          },
          {
            it: 'La validazione è il passo che molti saltano, ed è quello che decide se il ripristino è reale. Un backup conta solo se si ripristina davvero: un backup mai testato in restore è una speranza, non una copia, e si scopre inutilizzabile proprio quando serve. E il servizio va provato come lo usa un utente, non come lo vede un amministratore: testare per nome — aprire l’applicazione, risolvere il nome, completare una transazione — non limitarsi a un ping verso un IP, perché il DNS, l’autenticazione e la catena applicativa possono essere rotti mentre la connettività di base funziona. Il ripristino non è finito quando «risponde», ma quando l’utente può lavorare.',
            en: 'Validation is the step many skip, and it is the one that decides whether the recovery is real. A backup counts only if it actually restores: a backup never tested in restore is a hope, not a copy, and is found unusable exactly when it is needed. And the service must be tested the way a user uses it, not the way an administrator sees it: test by name — open the application, resolve the name, complete a transaction — not just a ping to an IP, because DNS, authentication, and the application chain can be broken while basic connectivity works. Recovery is not done when it «responds», but when the user can work.'
          },
          {
            it: 'Il capitolo chiude la faccia «ripristino» della disponibilità: la «A» della triade non è solo evitare il guasto (capitolo sulla disponibilità) ma anche riprendersi in tempo e per intero quando accade. Ridondanza davvero indipendente, una procedura ordinata con continuità minima e stop condition, e una validazione misurata da RTO/RPO e provata per nome: è questo che rende la resilienza una proprietà verificata e non una speranza. Come per tutto il resto, ciò che non è stato provato non si può dare per funzionante — e un ripristino lo si prova prima, non durante l’emergenza.',
            en: 'The chapter closes the «recovery» face of availability: the «A» of the triad is not only avoiding the failure (the availability chapter) but also recovering in time and in full when it happens. Truly independent redundancy, an ordered procedure with minimum continuity and stop conditions, and a validation measured by RTO/RPO and proven by name: this is what makes resilience a verified property and not a hope. As with everything else, what has not been tested cannot be assumed working — and a recovery is tested before, not during, the emergency.'
          }
        ],
        example: {
          it: 'Dopo un ripristino, un ping verso un IP in 192.0.2.0/24 risponde ma l’applicazione resta inutilizzabile perché il DNS non risolve: il test per nome lo rivela, mentre RTO e RPO, decisi prima, dicono se il ripristino è avvenuto in tempo e con quanta perdita di dato.',
          en: 'After a recovery, a ping to an IP in 192.0.2.0/24 responds but the application stays unusable because DNS does not resolve: testing by name reveals it, while RTO and RPO, decided beforehand, say whether the recovery happened in time and with how much data loss.'
        },
        commonMistakes: [
          {
            it: 'Non definire RTO/RPO: senza obiettivi misurabili «ripristinato» non si può valutare né dimensionare.',
            en: 'Not defining RTO/RPO: without measurable targets «recovered» cannot be evaluated or sized.'
          },
          {
            it: 'Fidarsi di backup non testati: un backup mai ripristinato è una speranza, non una copia.',
            en: 'Trusting untested backups: a backup never restored is a hope, not a copy.'
          },
          {
            it: 'Validare con un ping verso un IP: il test per nome scopre DNS, autenticazione e catena applicativa rotte.',
            en: 'Validating with a ping to an IP: testing by name uncovers broken DNS, authentication, and the application chain.'
          }
        ],
        lab: 'recovery',
        references: [{ kind: 'nist', id: 'SP 800-184' }],
        guidedLabs: [
          {
            id: 'gl-recovery-validate-by-name',
            title: {
              it: 'Valida il ripristino per nome, non per IP',
              en: 'Validate the recovery by name, not by IP'
            },
            difficulty: 'core',
            lab: 'recovery',
            scenario: {
              it: 'Il laboratorio «Resilienza e ripristino» mostra la validazione con test per nome, DNS/DHCP coordinati e obiettivi RTO/RPO.',
              en: 'The “Resilience and recovery” lab shows validation with testing by name, coordinated DNS/DHCP, and RTO/RPO targets.'
            },
            task: {
              it: 'Spiega perché un ping non basta a validare un ripristino e come RTO/RPO misurano l’esito.',
              en: 'Explain why a ping is not enough to validate a recovery and how RTO/RPO measure the outcome.'
            },
            steps: [
              {
                it: 'Apri «Resilienza e ripristino» e scegli lo scenario di ripristino DNS/DHCP coordinato.',
                en: 'Open “Resilience and recovery” and pick the coordinated DNS/DHCP recovery scenario.'
              },
              {
                it: 'Valida il servizio per nome (applicazione e risoluzione), non solo con un ping verso un IP.',
                en: 'Validate the service by name (application and resolution), not only with a ping to an IP.'
              },
              {
                it: 'Confronta l’esito con RTO/RPO e verifica che il backup usato si ripristini davvero.',
                en: 'Compare the outcome with RTO/RPO and verify that the backup used actually restores.'
              }
            ],
            challenge: {
              it: 'Il ping risponde ma gli utenti non lavorano: cosa può essere rotto che un test per IP non vede?',
              en: 'The ping responds but users cannot work: what can be broken that an IP test does not see?'
            },
            solution: [
              {
                it: 'RTO e RPO, decisi prima del guasto, misurano entro quanto tornare in servizio e quanto dato si può perdere, e guidano backup e ridondanza. La validazione decide se il ripristino è reale: un backup conta solo se si ripristina davvero, e il servizio va provato per nome — applicazione, risoluzione DNS, transazione — perché connettività di base funzionante non significa servizio utilizzabile.',
                en: 'RTO and RPO, decided before the failure, measure within how long to restore service and how much data can be lost, and they drive backups and redundancy. Validation decides whether the recovery is real: a backup counts only if it actually restores, and the service must be tested by name — application, DNS resolution, transaction — because working basic connectivity does not mean a usable service.'
              },
              {
                it: 'Sfida: se il ping risponde ma gli utenti non lavorano, può essere rotta la catena applicativa che un test per IP non tocca — il DNS non risolve, l’autenticazione fallisce, o un servizio dipendente non è ancora su; il test per nome lo rivela perché segue lo stesso percorso dell’utente.',
                en: 'Challenge: if the ping responds but users cannot work, the application chain an IP test does not touch may be broken — DNS does not resolve, authentication fails, or a dependent service is not up yet; testing by name reveals it because it follows the same path as the user.'
              }
            ],
            selfCheck: [
              {
                it: 'So definire RTO e RPO e dire come guidano backup e ridondanza.',
                en: 'I can define RTO and RPO and say how they drive backups and redundancy.'
              },
              {
                it: 'So spiegare perché si valida per nome e perché un backup va provato in restore.',
                en: 'I can explain why you validate by name and why a backup must be tested in restore.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'access-layer-security',
    cert: 'securityplus',
    order: 29,
    track: 'extension',
    title: {
      it: 'Sicurezza dell’access layer: il confine della porta',
      en: 'Access-layer security: the port as the trust boundary'
    },
    summary: {
      it: 'L’estensione che insegna il laboratorio «Sicurezza Layer 2»: l’access layer è il punto in cui un host non fidato incontra il dominio commutato, e lì ogni difesa nasce da un modello di fiducia esplicito. Il ruolo della porta e la Port Security come controllo del primo hop, l’integrità del first-hop costruita su una binding table attendibile (DHCP Snooping, DAI, IP Source Guard) con trunk e native VLAN in ordine, e la protezione della topologia commutata (guardie STP, coerenza EtherChannel) con contenimento e recovery. Complemento difensivo, orientato al modello e al perché, dei comandi di hardening Layer 2 già visti nel capitolo di sicurezza CCNA.',
      en: 'The extension that teaches the “Layer 2 security” lab: the access layer is where an untrusted host meets the switched domain, and there every defense starts from an explicit trust model. The port role and Port Security as first-hop control, first-hop integrity built on a trustworthy binding table (DHCP Snooping, DAI, IP Source Guard) with trunks and native VLAN in order, and protection of the switched topology (STP guards, EtherChannel consistency) with containment and recovery. A defensive complement — focused on the model and the why — to the Layer 2 hardening commands already seen in the CCNA security chapter.'
    },
    topics: [
      {
        id: 'l2-port-trust-boundary',
        title: {
          it: 'La porta di accesso come confine di fiducia: ruolo, VLAN e Port Security',
          en: 'The access port as a trust boundary: role, VLANs, and Port Security'
        },
        objectives: [
          {
            it: 'Spiegare perché la porta di accesso è il confine di fiducia e dichiararne il ruolo (access, voce) invece di lasciarlo negoziare.',
            en: 'Explain why the access port is the trust boundary and declare its role (access, voice) instead of letting it be negotiated.'
          },
          {
            it: 'Usare CAM table e Port Security come controllo di identità del primo hop senza rompere l’host legittimo.',
            en: 'Use the CAM table and Port Security as first-hop identity control without breaking the legitimate host.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere switching Ethernet, CAM table e VLAN/802.1Q (capitoli su Ethernet/switching e su VLAN/trunk/STP).',
            en: 'Know Ethernet switching, the CAM table, and VLAN/802.1Q (the Ethernet/switching and VLAN/trunk/STP chapters).'
          }
        ],
        theory: [
          {
            it: 'L’access layer è il bordo fisico in cui un dispositivo non fidato si collega al dominio commutato, e lo switch impara gli indirizzi MAC nella CAM table per inoltrare le trame. Ma imparare è fidarsi: chi invia trame definisce la tabella, e nessuno autentica quell’apprendimento. Per questo la porta di accesso deve dichiarare il proprio ruolo in modo esplicito — porta di accesso con la sua data VLAN e, se serve, una voice VLAN — invece di lasciarlo negoziare: un endpoint che può negoziare un trunk raggiunge altre VLAN e il confine salta. La disciplina del ruolo (niente negoziazione dinamica del trunk sulle porte verso gli host, modalità di accesso esplicita) è il primo confine, prima ancora dei controlli specifici.',
            en: 'The access layer is the physical edge where an untrusted device plugs into the switched domain, and the switch learns MAC addresses into the CAM table to forward frames. But learning is trusting: whoever sends frames defines the table, and nothing authenticates that learning. This is why the access port must declare its role explicitly — an access port with its data VLAN and, if needed, a voice VLAN — instead of letting it be negotiated: an endpoint that can negotiate a trunk reaches other VLANs and the boundary is gone. Role discipline (no dynamic trunk negotiation on host-facing ports, an explicit access mode) is the first boundary, even before the specific controls.'
          },
          {
            it: 'Sulla porta così delimitata, CAM table e Port Security danno il controllo di identità del primo hop: si limita quanti e quali MAC la porta accetta, così un flood non trabocca la tabella facendola degradare a flooding fail-open, e un MAC «spostato» non dirotta in silenzio il traffico. Ma le tre violation mode non sono equivalenti — protect scarta in silenzio assoluto senza nemmeno contare, restrict scarta e conta/segnala, shutdown porta la porta in err-disable — e un limite troppo stretto rompe la convivenza di telefono e PC o il normale ricambio di MAC (DHCP, roaming). Port Security va quindi dimensionata sull’endpoint reale, non sul «rischio zero».',
            en: 'On the port thus bounded, the CAM table and Port Security give first-hop identity control: you limit how many and which MACs the port accepts, so a flood does not overflow the table into fail-open flooding, and a «moved» MAC does not silently hijack traffic. But the three violation modes are not equivalent — protect drops in absolute silence without even counting, restrict drops and counts/alerts, shutdown puts the port into err-disable — and a limit that is too tight breaks a phone and PC sharing a port or the normal churn of MACs (DHCP, roaming). Port Security must therefore be sized to the real endpoint, not to «zero risk».'
          },
          {
            it: 'Il principio è coerente con tutto il track difensivo: l’access layer è dove la policy costa meno ed è più efficace, perché è il punto più vicino alla sorgente; ma ogni controllo lì è a doppio taglio — troppo lasco e viene aggirato, troppo stretto e abbatte l’host legittimo (la voice VLAN che non sale, il DHCP che non rinnova). La difesa non si dichiara, si prova: un limite di Port Security va validato contro il mix reale di dispositivi, e un ruolo di porta va verificato osservando che un endpoint non riesca davvero a negoziare nulla di più del previsto.',
            en: 'The principle is consistent with the whole defensive track: the access layer is where policy is cheapest and most effective, because it is the closest point to the source; but every control there is double-edged — too loose and it is bypassed, too tight and it takes down the legitimate host (the voice VLAN that does not come up, the DHCP that does not renew). The defense is not declared, it is proven: a Port Security limit must be validated against the real device mix, and a port role must be verified by observing that an endpoint genuinely cannot negotiate anything beyond what is intended.'
          }
        ],
        example: {
          it: 'Una porta di accesso in 192.0.2.0/24 serve un telefono con un PC a valle: il ruolo è access con data e voice VLAN, mai trunk negoziabile, e Port Security ammette i pochi MAC attesi (telefono più PC) con violation restrict, così un flood non degrada la CAM table ma il telefono non finisce in err-disable per un MAC in più.',
          en: 'An access port in 192.0.2.0/24 serves a phone with a PC behind it: the role is access with a data and a voice VLAN, never a negotiable trunk, and Port Security admits the few expected MACs (phone plus PC) with violation restrict, so a flood does not degrade the CAM table yet the phone is not pushed into err-disable for one extra MAC.'
        },
        commonMistakes: [
          {
            it: 'Lasciare la negoziazione dinamica del trunk sulle porte verso gli host: un endpoint può negoziare un trunk e uscire dalla sua VLAN.',
            en: 'Leaving dynamic trunk negotiation on host-facing ports: an endpoint can negotiate a trunk and leave its VLAN.'
          },
          {
            it: 'Impostare il limite a un solo MAC dove convivono telefono e PC: si rompe la voce o il PC a valle.',
            en: 'Setting the limit to a single MAC where a phone and a PC coexist: the voice or the downstream PC breaks.'
          },
          {
            it: 'Credere che protect sia la scelta «sicura»: scarta in silenzio e senza contatore, quindi una violazione resta invisibile.',
            en: 'Believing protect is the «safe» choice: it drops silently and without a counter, so a violation stays invisible.'
          }
        ],
        lab: 'layer2security',
        references: [{ kind: 'ieee', id: 'IEEE 802.1Q' }],
        guidedLabs: [
          {
            id: 'gl-layer2-access-boundary',
            title: {
              it: 'Dichiara il ruolo della porta e dimensiona Port Security',
              en: 'Declare the port role and size Port Security'
            },
            difficulty: 'core',
            lab: 'layer2security',
            scenario: {
              it: 'Il laboratorio «Sicurezza Layer 2» mostra il confine fisico della porta, i ruoli access/voce/trunk e il controllo MAC del primo hop.',
              en: 'The “Layer 2 security” lab shows the port’s physical boundary, the access/voice/trunk roles, and first-hop MAC control.'
            },
            task: {
              it: 'Stabilisci il ruolo corretto di una porta di accesso e indica un limite di Port Security che regga il mix reale di dispositivi.',
              en: 'Set the correct role for an access port and state a Port Security limit that holds the real device mix.'
            },
            steps: [
              {
                it: 'Apri «Sicurezza Layer 2» e osserva il ruolo della porta e la data/voice VLAN.',
                en: 'Open “Layer 2 security” and observe the port role and the data/voice VLAN.'
              },
              {
                it: 'Disattiva la negoziazione dinamica del trunk e verifica che l’endpoint non possa negoziarlo.',
                en: 'Disable dynamic trunk negotiation and verify the endpoint cannot negotiate it.'
              },
              {
                it: 'Scegli il limite di Port Security e la violation mode in base al mix reale (telefono più PC), non al rischio zero.',
                en: 'Choose the Port Security limit and violation mode from the real mix (phone plus PC), not from zero risk.'
              }
            ],
            challenge: {
              it: 'Dopo aver messo il limite a un solo MAC la porta va in err-disable: quale assunzione sul mix di dispositivi era sbagliata?',
              en: 'After setting the limit to a single MAC the port goes err-disable: which assumption about the device mix was wrong?'
            },
            solution: [
              {
                it: 'La porta di accesso è il confine di fiducia: va dichiarata access con la sua VLAN (ed eventuale voice VLAN), senza negoziazione dinamica del trunk, così un endpoint non può raggiungere altre VLAN. Port Security poi limita i MAC per impedire l’overflow della CAM table e il dirottamento, ma il limite si dimensiona sull’endpoint reale e la violation mode si sceglie per visibilità (restrict conta e segnala; protect scarta in silenzio).',
                en: 'The access port is the trust boundary: it must be declared access with its VLAN (and an optional voice VLAN), with no dynamic trunk negotiation, so an endpoint cannot reach other VLANs. Port Security then limits MACs to prevent CAM-table overflow and hijacking, but the limit is sized to the real endpoint and the violation mode is chosen for visibility (restrict counts and alerts; protect drops silently).'
              },
              {
                it: 'Sfida: se con un solo MAC la porta va in err-disable, l’assunzione sbagliata era che l’host fosse uno solo — un telefono con un PC a valle presenta almeno due MAC, quindi il limite va alzato al mix reale invece di forzare lo «zero rischio».',
                en: 'Challenge: if one MAC pushes the port to err-disable, the wrong assumption was a single host — a phone with a PC behind it presents at least two MACs, so the limit must be raised to the real mix instead of forcing «zero risk».'
              }
            ],
            selfCheck: [
              {
                it: 'So spiegare perché l’access port è il confine di fiducia e come dichiararne il ruolo.',
                en: 'I can explain why the access port is the trust boundary and how to declare its role.'
              },
              {
                it: 'So dimensionare Port Security sul mix reale e scegliere la violation mode per visibilità.',
                en: 'I can size Port Security to the real mix and choose the violation mode for visibility.'
              }
            ]
          }
        ]
      },
      {
        id: 'l2-first-hop-integrity',
        title: {
          it: 'Integrità del first-hop: DHCP Snooping, DAI, IP Source Guard e igiene dei trunk',
          en: 'First-hop integrity: DHCP Snooping, DAI, IP Source Guard, and trunk hygiene'
        },
        objectives: [
          {
            it: 'Costruire una binding table attendibile con DHCP Snooping e usarla per DAI e IP Source Guard.',
            en: 'Build a trustworthy binding table with DHCP Snooping and use it for DAI and IP Source Guard.'
          },
          {
            it: 'Mettere in ordine trunk e native VLAN per chiudere il VLAN hopping.',
            en: 'Put trunks and the native VLAN in order to close VLAN hopping.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere DHCP, ARP e trunk/802.1Q (capitoli su servizi IP e su VLAN/trunk/STP).',
            en: 'Know DHCP, ARP, and trunks/802.1Q (the IP services and VLAN/trunk/STP chapters).'
          }
        ],
        theory: [
          {
            it: 'Molti attacchi di livello 2 sono l’assenza di una fonte di verità: ARP non autentica chi risponde, DHCP non autentica il server. DHCP Snooping introduce quella fonte costruendo una binding table attendibile — associazioni MAC/IP/porta/VLAN osservate dal traffico DHCP — distinguendo porte fidate (solo gli uplink verso il server DHCP reale) da porte non fidate (gli host). Un’offerta DHCP che arriva da una porta non fidata è un server abusivo e viene scartata. Quella tabella diventa la base su cui si appoggiano i controlli successivi: senza di essa, DAI e IP Source Guard non avrebbero nulla contro cui verificare.',
            en: 'Many Layer 2 attacks are the absence of a source of truth: ARP does not authenticate who answers, DHCP does not authenticate the server. DHCP Snooping introduces that source by building a trustworthy binding table — MAC/IP/port/VLAN associations observed from DHCP traffic — distinguishing trusted ports (only the uplinks toward the real DHCP server) from untrusted ports (the hosts). A DHCP offer arriving from an untrusted port is a rogue server and is dropped. That table becomes the base the later controls lean on: without it, DAI and IP Source Guard would have nothing to verify against.'
          },
          {
            it: 'Su quella base, DAI (Dynamic ARP Inspection) valida ogni ARP contro la binding table e scarta un ARP gratuito che rivendica un IP che non gli appartiene — è così che si ferma l’ARP poisoning e il MITM che ne consegue; IP Source Guard filtra il traffico IP ammettendo solo la coppia IP/MAC legata alla porta, fermando lo spoofing dell’IP sorgente. Entrambi valgono esattamente quanto la binding table su cui si basano: una porta fidata sbagliata, o host statici senza un binding manuale, trasformano la difesa in un bypass (se troppo permissiva) o in un’interruzione (se scarta traffico legittimo). È il principio «garbage in, garbage enforced»: la qualità della fonte di verità decide la qualità della difesa.',
            en: 'On that base, DAI (Dynamic ARP Inspection) validates every ARP against the binding table and drops a gratuitous ARP that claims an IP it does not own — this is how ARP poisoning and the MITM that follows are stopped; IP Source Guard filters IP traffic, admitting only the IP/MAC pair bound to the port, stopping source-IP spoofing. Both are worth exactly as much as the binding table they rely on: a wrong trusted port, or static hosts without a manual binding, turn the defense into a bypass (if too permissive) or an outage (if it drops legitimate traffic). It is the «garbage in, garbage enforced» principle: the quality of the source of truth decides the quality of the defense.'
          },
          {
            it: 'L’igiene dei trunk chiude l’altra via d’ingresso, il VLAN hopping: si disattiva la negoziazione dinamica (niente trunk che si forma da solo verso un host), si pota la allowed list alle sole VLAN necessarie, e si imposta la native VLAN su una VLAN inutilizzata e dedicata, taggandola, così il double-tagging e lo switch-spoofing non attraversano il confine di VLAN. Il filo conduttore è unico: il confine è reale solo se sono attendibili insieme la binding table (chi è chi al primo hop) e la configurazione del trunk (cosa può attraversare tra switch); basta che una delle due non sia provata perché il confine esista solo sulla carta.',
            en: 'Trunk hygiene closes the other way in, VLAN hopping: you disable dynamic negotiation (no trunk forming by itself toward a host), you prune the allowed list to only the needed VLANs, and you set the native VLAN to an unused, dedicated VLAN and tag it, so double-tagging and switch-spoofing do not cross the VLAN boundary. The thread is single: the boundary is real only if the binding table (who is who at the first hop) and the trunk configuration (what may cross between switches) are trustworthy together; it is enough for one of the two to be unproven for the boundary to exist only on paper.'
          }
        ],
        example: {
          it: 'In 192.0.2.0/24 un server con indirizzo statico non ha un binding manuale: con IP Source Guard attivo il suo traffico viene scartato, perché la binding table — alimentata dal solo DHCP — non lo conosce; la correzione è aggiungere il binding statico, non disattivare il controllo.',
          en: 'In 192.0.2.0/24 a server with a static address has no manual binding: with IP Source Guard active its traffic is dropped, because the binding table — fed only by DHCP — does not know it; the fix is to add the static binding, not to disable the control.'
        },
        commonMistakes: [
          {
            it: 'Marcare come fidata una porta verso gli host: un server DHCP abusivo su quella porta vanifica lo snooping.',
            en: 'Marking a host-facing port as trusted: a rogue DHCP server on that port defeats snooping.'
          },
          {
            it: 'Attivare DAI o IP Source Guard senza binding per gli host statici: il traffico legittimo viene scartato.',
            en: 'Enabling DAI or IP Source Guard without bindings for static hosts: legitimate traffic is dropped.'
          },
          {
            it: 'Lasciare la native VLAN predefinita e non taggata: apre la porta al double-tagging.',
            en: 'Leaving the native VLAN default and untagged: it opens the door to double-tagging.'
          }
        ],
        lab: 'layer2security',
        references: [
          { kind: 'rfc', id: 'RFC 2131' },
          { kind: 'ieee', id: 'IEEE 802.1Q' }
        ],
        guidedLabs: [
          {
            id: 'gl-layer2-binding-table',
            title: {
              it: 'Costruisci la binding table e falla rispettare',
              en: 'Build the binding table and enforce it'
            },
            difficulty: 'core',
            lab: 'layer2security',
            scenario: {
              it: 'Il laboratorio «Sicurezza Layer 2» mostra porte fidate/non fidate, la binding table di DHCP Snooping e l’enforcement di DAI e IP Source Guard.',
              en: 'The “Layer 2 security” lab shows trusted/untrusted ports, the DHCP Snooping binding table, and the enforcement of DAI and IP Source Guard.'
            },
            task: {
              it: 'Indica quali porte sono fidate, come si popola la binding table e perché un host statico richiede un binding manuale.',
              en: 'State which ports are trusted, how the binding table is populated, and why a static host needs a manual binding.'
            },
            steps: [
              {
                it: 'Apri «Sicurezza Layer 2» e marca come fidate solo le porte verso il server DHCP reale.',
                en: 'Open “Layer 2 security” and mark as trusted only the ports toward the real DHCP server.'
              },
              {
                it: 'Osserva come il traffico DHCP popola la binding table (MAC/IP/porta/VLAN).',
                en: 'Observe how DHCP traffic populates the binding table (MAC/IP/port/VLAN).'
              },
              {
                it: 'Attiva DAI e IP Source Guard e aggiungi un binding statico per l’host a indirizzo fisso.',
                en: 'Enable DAI and IP Source Guard and add a static binding for the fixed-address host.'
              }
            ],
            challenge: {
              it: 'Un server statico legittimo smette di comunicare appena attivi IP Source Guard: cosa manca nella fonte di verità?',
              en: 'A legitimate static server stops communicating as soon as you enable IP Source Guard: what is missing from the source of truth?'
            },
            solution: [
              {
                it: 'DHCP Snooping costruisce la binding table distinguendo porte fidate (solo gli uplink verso il server reale) da non fidate (gli host), e scarta le offerte DHCP abusive. Su quella tabella, DAI valida gli ARP (ferma l’ARP poisoning e il MITM) e IP Source Guard filtra il traffico IP sulla coppia IP/MAC legata alla porta (ferma lo spoofing). Entrambi valgono quanto la binding table: trunk in ordine e native VLAN dedicata chiudono poi il VLAN hopping.',
                en: 'DHCP Snooping builds the binding table by distinguishing trusted ports (only the uplinks toward the real server) from untrusted ones (the hosts), and drops rogue DHCP offers. On that table, DAI validates ARP (stops ARP poisoning and MITM) and IP Source Guard filters IP traffic on the IP/MAC pair bound to the port (stops spoofing). Both are worth as much as the binding table: trunks in order and a dedicated native VLAN then close VLAN hopping.'
              },
              {
                it: 'Sfida: un host a indirizzo statico non passa dal DHCP, quindi non entra nella binding table; manca il binding manuale, ed è quello che va aggiunto — disattivare il controllo riaprirebbe lo spoofing invece di correggere la fonte di verità.',
                en: 'Challenge: a static-address host does not go through DHCP, so it never enters the binding table; the manual binding is missing, and that is what must be added — disabling the control would reopen spoofing instead of fixing the source of truth.'
              }
            ],
            selfCheck: [
              {
                it: 'So spiegare come DHCP Snooping costruisce la binding table e su cosa si appoggiano DAI e IP Source Guard.',
                en: 'I can explain how DHCP Snooping builds the binding table and what DAI and IP Source Guard rely on.'
              },
              {
                it: 'So mettere in ordine trunk e native VLAN per chiudere il VLAN hopping.',
                en: 'I can put trunks and the native VLAN in order to close VLAN hopping.'
              }
            ]
          }
        ]
      },
      {
        id: 'l2-topology-containment',
        title: {
          it: 'Proteggere la topologia commutata: guardie STP, coerenza EtherChannel e contenimento',
          en: 'Protecting the switched topology: STP guards, EtherChannel consistency, and containment'
        },
        objectives: [
          {
            it: 'Proteggere lo spanning tree da una root abusiva o cambiata con BPDU Guard, Root Guard e Loop Guard.',
            en: 'Protect the spanning tree from a rogue or changed root with BPDU Guard, Root Guard, and Loop Guard.'
          },
          {
            it: 'Mantenere coerenti i membri EtherChannel e contenere e ripristinare un incidente di livello 2.',
            en: 'Keep EtherChannel members consistent and contain and recover a Layer 2 incident.'
          }
        ],
        prerequisites: [
          {
            it: 'Conoscere STP/RSTP ed EtherChannel (capitoli su VLAN/trunk/STP e su accesso/EtherChannel/wireless) e il capitolo su resilienza e ripristino.',
            en: 'Know STP/RSTP and EtherChannel (the VLAN/trunk/STP and access/EtherChannel/wireless chapters) and the resilience and recovery chapter.'
          }
        ],
        theory: [
          {
            it: 'Lo spanning tree si fida delle BPDU: chi invia la BPDU migliore diventa root e l’intera topologia di livello 2 si riorganizza attorno a lui. È una fiducia che va protetta in tre punti. BPDU Guard porta in err-disable una porta di accesso che riceve una BPDU — un endpoint non dovrebbe mai inviarne, quindi riceverla è il segnale di uno switch non previsto; Root Guard impedisce a una porta designated di accettare una BPDU superiore, così uno switch a valle non può diventare root e spostare il traffico; Loop Guard protegge dal link unidirezionale che smetterebbe di ricevere BPDU e rimuoverebbe in silenzio uno stato di blocco, creando un loop. Ogni guardia difende un’assunzione precisa dello spanning tree.',
            en: 'The spanning tree trusts BPDUs: whoever sends the best BPDU becomes root and the whole Layer 2 topology reorganizes around it. It is a trust that must be protected at three points. BPDU Guard puts an access port into err-disable when it receives a BPDU — an endpoint should never send one, so receiving one is the signal of an unexpected switch; Root Guard prevents a designated port from accepting a superior BPDU, so a downstream switch cannot become root and move the traffic; Loop Guard protects against a unidirectional link that would stop receiving BPDUs and silently remove a blocking state, creating a loop. Each guard defends a specific assumption of the spanning tree.'
          },
          {
            it: 'La ridondanza di link si aggrega solo se i membri concordano: EtherChannel bundla più collegamenti in uno logico, ma solo se velocità, duplex, VLAN ammesse e modalità coincidono; un membro incoerente viene escluso o, peggio, forma un collegamento non previsto che lo spanning tree deve poi gestire. LACP con i suoi controlli di coerenza evita il bundle formato a metà. La lezione è la stessa già vista per il routing: una ridondanza incoerente non è ridondanza — è una complicazione che si attiva nel momento sbagliato, quando ci si aspetta che regga.',
            en: 'Link redundancy aggregates only if the members agree: EtherChannel bundles several links into one logical link, but only if speed, duplex, allowed VLANs, and mode match; an inconsistent member is excluded or, worse, forms an unintended link that the spanning tree then has to handle. LACP with its consistency checks avoids the half-formed bundle. The lesson is the same already seen for routing: an inconsistent redundancy is not redundancy — it is a complication that triggers at the wrong moment, when you expect it to hold.'
          },
          {
            it: 'Quando l’incidente di livello 2 accade — un loop, uno switch abusivo, un flood — vale la stessa disciplina del capitolo su resilienza e ripristino, applicata all’access layer: prima si contiene al confine della porta (err-disable, shutdown, isolamento della VLAN) per fermare la propagazione, poi si cerca la causa, infine si ripristina in ordine con una condizione di arresto. Non si riabilita una porta in err-disable finché non si sa perché è scattata: rimetterla in servizio senza capire reintroduce il loop o lo switch non previsto. Contenere prima, capire poi, ripristinare per ultimo e per verifica: è ciò che distingue un incidente gestito da uno che si propaga.',
            en: 'When the Layer 2 incident happens — a loop, a rogue switch, a flood — the same discipline as the resilience and recovery chapter applies, at the access layer: first you contain at the port boundary (err-disable, shutdown, VLAN isolation) to stop propagation, then you find the cause, and finally you recover in order with a stop condition. You do not re-enable an err-disabled port until you know why it tripped: returning it to service without understanding reintroduces the loop or the unexpected switch. Contain first, understand next, recover last and by verification: this is what distinguishes a managed incident from one that propagates.'
          }
        ],
        example: {
          it: 'Una porta di accesso in 192.0.2.0/24 riceve una BPDU: BPDU Guard la porta in err-disable perché un endpoint non dovrebbe inviarne, e la riabilitazione resta sospesa finché non si è individuato lo switch non previsto a monte — contenimento prima, causa poi.',
          en: 'An access port in 192.0.2.0/24 receives a BPDU: BPDU Guard puts it into err-disable because an endpoint should never send one, and re-enabling it stays on hold until the unexpected upstream switch is found — containment first, cause next.'
        },
        commonMistakes: [
          {
            it: 'Abilitare BPDU Guard su un trunk o un uplink verso uno switch: abbatte un collegamento legittimo che le BPDU le invia per mestiere.',
            en: 'Enabling BPDU Guard on a trunk or an uplink to a switch: it takes down a legitimate link that sends BPDUs by design.'
          },
          {
            it: 'Confondere i ruoli delle guardie: Root Guard non ferma un endpoint che invia BPDU (è il lavoro di BPDU Guard) e viceversa.',
            en: 'Confusing the guards’ roles: Root Guard does not stop an endpoint sending BPDUs (that is BPDU Guard’s job) and vice versa.'
          },
          {
            it: 'Riabilitare una porta in err-disable senza trovare la causa: si reintroduce il loop o lo switch non previsto.',
            en: 'Re-enabling an err-disabled port without finding the cause: the loop or the unexpected switch is reintroduced.'
          }
        ],
        lab: 'layer2security',
        references: [
          { kind: 'ieee', id: 'IEEE 802.1D' },
          { kind: 'ieee', id: 'IEEE 802.1AX' }
        ],
        guidedLabs: [
          {
            id: 'gl-layer2-topology-guard',
            title: {
              it: 'Scegli la guardia STP giusta e contieni prima di capire',
              en: 'Choose the right STP guard and contain before understanding'
            },
            difficulty: 'advanced',
            lab: 'layer2security',
            scenario: {
              it: 'Il laboratorio «Sicurezza Layer 2» mostra le guardie STP, la coerenza dei membri EtherChannel e il contenimento/recovery di livello 2.',
              en: 'The “Layer 2 security” lab shows the STP guards, EtherChannel member consistency, and Layer 2 containment/recovery.'
            },
            task: {
              it: 'Abbina ogni guardia STP all’assunzione che protegge e indica l’ordine corretto di contenimento e ripristino dopo un incidente.',
              en: 'Match each STP guard to the assumption it protects and state the correct order of containment and recovery after an incident.'
            },
            steps: [
              {
                it: 'Apri «Sicurezza Layer 2» e individua su quali porte vanno BPDU Guard, Root Guard e Loop Guard.',
                en: 'Open “Layer 2 security” and identify which ports take BPDU Guard, Root Guard, and Loop Guard.'
              },
              {
                it: 'Verifica la coerenza dei membri EtherChannel (velocità, duplex, VLAN ammesse, modalità).',
                en: 'Verify the consistency of the EtherChannel members (speed, duplex, allowed VLANs, mode).'
              },
              {
                it: 'Davanti a un loop, contieni al confine della porta, poi cerca la causa, poi ripristina con una stop condition.',
                en: 'Facing a loop, contain at the port boundary, then find the cause, then recover with a stop condition.'
              }
            ],
            challenge: {
              it: 'Dopo aver abilitato BPDU Guard «ovunque» cade un uplink verso un altro switch: su quale porta la guardia era sbagliata e quale andava usata?',
              en: 'After enabling BPDU Guard «everywhere» an uplink to another switch goes down: on which port was the guard wrong and which one should have been used?'
            },
            solution: [
              {
                it: 'Ogni guardia difende un’assunzione di STP: BPDU Guard sulle porte di accesso (un endpoint non invia BPDU), Root Guard sulle designated verso valle (nessuno switch a valle diventa root), Loop Guard contro il link unidirezionale che rimuove in silenzio un blocco. EtherChannel aggrega solo con membri coerenti. All’incidente si contiene prima al confine della porta, poi si cerca la causa, poi si ripristina con una stop condition, senza riabilitare una porta finché non se ne conosce il motivo.',
                en: 'Each guard defends an STP assumption: BPDU Guard on access ports (an endpoint does not send BPDUs), Root Guard on downstream-facing designated ports (no downstream switch becomes root), Loop Guard against the unidirectional link that silently removes a block. EtherChannel aggregates only with consistent members. At the incident you contain first at the port boundary, then find the cause, then recover with a stop condition, without re-enabling a port until its reason is known.'
              },
              {
                it: 'Sfida: su un uplink verso uno switch le BPDU sono legittime, quindi BPDU Guard era la guardia sbagliata lì — l’avrebbe abbattuto; su quella porta serve semmai Root Guard, per impedire che lo switch a valle diventi root senza spegnere il collegamento.',
                en: 'Challenge: on an uplink to a switch BPDUs are legitimate, so BPDU Guard was the wrong guard there — it would take it down; that port needs Root Guard instead, to prevent the downstream switch from becoming root without shutting the link.'
              }
            ],
            selfCheck: [
              {
                it: 'So abbinare BPDU Guard, Root Guard e Loop Guard all’assunzione di STP che proteggono.',
                en: 'I can match BPDU Guard, Root Guard, and Loop Guard to the STP assumption they protect.'
              },
              {
                it: 'So contenere al confine della porta prima di cercare la causa e ripristinare con una stop condition.',
                en: 'I can contain at the port boundary before finding the cause and recover with a stop condition.'
              }
            ]
          }
        ]
      }
    ]
  }
];

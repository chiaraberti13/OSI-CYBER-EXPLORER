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
        lab: 'fundamentals'
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
        lab: 'fundamentals'
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
        lab: 'access'
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
        lab: 'routing'
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
        lab: 'services'
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
            it: 'Dalla GUI del WLC una WLAN si crea in pochi passi: nella scheda General si impostano Profile Name, SSID, Status e la Interface che lega la WLAN alla sua VLAN; nella scheda Security si sceglie Layer 2 Security = WPA2 (o WPA2+WPA3), AES/CCMP e Authentication Key Management = PSK con la passphrase. Il controller stesso va protetto: lo si configura via HTTPS (GUI cifrata con TLS) limitato alle sorgenti di management, mai via HTTP in chiaro, perché quella GUI espone le credenziali dell’intera infrastruttura wireless.',
            en: 'From the WLC GUI a WLAN is created in a few steps: in the General tab you set Profile Name, SSID, Status, and the Interface that binds the WLAN to its VLAN; in the Security tab you choose Layer 2 Security = WPA2 (or WPA2+WPA3), AES/CCMP, and Authentication Key Management = PSK with the passphrase. The controller itself must be protected: you configure it over HTTPS (TLS-encrypted GUI) restricted to management sources, never over cleartext HTTP, because that GUI exposes the credentials of the whole wireless infrastructure.'
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
      }
    ]
  }
];

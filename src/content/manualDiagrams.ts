import type { Bilingual } from '../types';

export interface ManualDiagram {
  title: Bilingual;
  description: Bilingual;
  height: number;
  nodes: { x: number; y: number; width: number; label: Bilingual; detail: Bilingual }[];
  edges: { path: string; x: number; y: number; label?: Bilingual; dashed?: boolean }[];
}

/** Inert, schematic teaching aids. Coordinates keep every label readable on a narrow screen. */
export const MANUAL_DIAGRAMS = {
  segmentation: {
    title: { it: 'Perimetro e traffico interno', en: 'Perimeter and internal traffic' },
    description: {
      it: 'Il flusso nord–sud attraversa il firewall perimetrale. Il flusso est–ovest tra carichi interni può non attraversarlo: servono policy e monitoraggio vicino ai carichi. Le frecce mostrano direzioni esemplificative, non permessi impliciti; una VLAN da sola non applica una policy di sicurezza.',
      en: 'North–south traffic crosses the perimeter firewall. East–west traffic between internal workloads may bypass it: policy and monitoring are needed near the workloads. Arrows show example directions, not implicit permissions; a VLAN alone does not enforce a security policy.'
    },
    height: 320,
    nodes: [
      {
        x: 70,
        y: 10,
        width: 180,
        label: { it: 'Rete esterna', en: 'External network' },
        detail: { it: 'Origine del flusso', en: 'Flow source' }
      },
      {
        x: 70,
        y: 110,
        width: 180,
        label: { it: 'Firewall', en: 'Firewall' },
        detail: { it: 'Policy perimetrale', en: 'Perimeter policy' }
      },
      {
        x: 8,
        y: 250,
        width: 140,
        label: { it: 'Carico A', en: 'Workload A' },
        detail: { it: 'Policy locale', en: 'Local policy' }
      },
      {
        x: 172,
        y: 250,
        width: 140,
        label: { it: 'Carico B', en: 'Workload B' },
        detail: { it: 'Policy locale', en: 'Local policy' }
      }
    ],
    edges: [
      { path: 'M160 66 V108', x: 215, y: 90, label: { it: 'Nord–sud', en: 'North–south' } },
      { path: 'M160 166 V190 H78 V248', x: 160, y: 216, label: { it: 'Rete interna', en: 'Internal network' } },
      { path: 'M148 278 H170', x: 160, y: 240, label: { it: 'Est–ovest', en: 'East–west' }, dashed: true }
    ]
  },
  email: {
    title: { it: 'Consegna e verifica dell’email', en: 'Email delivery and verification' },
    description: {
      it: 'Schema semplificato: il client invia al servizio di posta, che trasferisce il messaggio al ricevente tramite SMTP. Il ricevente consulta il DNS per SPF, DKIM e DMARC e decide come trattarlo prima della consegna alla casella. Questi controlli non garantiscono che il contenuto sia innocuo; relay intermedi e accesso alla casella sono omessi.',
      en: 'Simplified model: the client submits to the mail service, which transfers the message to the receiver using SMTP. The receiver consults DNS for SPF, DKIM and DMARC and decides how to handle it before mailbox delivery. These checks do not guarantee harmless content; intermediate relays and mailbox access are omitted.'
    },
    height: 390,
    nodes: [
      {
        x: 60,
        y: 10,
        width: 200,
        label: { it: 'Client mittente', en: 'Sending client' },
        detail: { it: 'Composizione', en: 'Composition' }
      },
      {
        x: 60,
        y: 110,
        width: 200,
        label: { it: 'Servizio mittente', en: 'Sending service' },
        detail: { it: 'Invio della posta', en: 'Mail submission' }
      },
      {
        x: 60,
        y: 210,
        width: 200,
        label: { it: 'Servizio ricevente', en: 'Receiving service' },
        detail: { it: 'SPF · DKIM · DMARC', en: 'SPF · DKIM · DMARC' }
      },
      {
        x: 60,
        y: 320,
        width: 200,
        label: { it: 'Casella destinataria', en: 'Recipient mailbox' },
        detail: { it: 'Se accettato', en: 'If accepted' }
      }
    ],
    edges: [
      { path: 'M160 66 V108', x: 218, y: 91, label: { it: 'Invio', en: 'Submission' } },
      { path: 'M160 166 V208', x: 204, y: 191, label: { it: 'SMTP', en: 'SMTP' } },
      { path: 'M160 266 V318', x: 218, y: 295, label: { it: 'Consegna', en: 'Delivery' } }
    ]
  },
  pentest: {
    title: { it: 'Fasi e ritorni del penetration test', en: 'Penetration test phases and iteration' },
    description: {
      it: 'Autorizzazione scritta, scope e regole d’ingaggio precedono il test. Ricognizione, scanning ed enumerazione alimentano la valutazione; la freccia tratteggiata indica il ritorno dalla verifica dell’impatto all’enumerazione, sempre nello scope. Evidenze e confronto con la difesa accompagnano ogni fase; report, rimedi e nuovo test concordato chiudono il ciclo.',
      en: 'Written authorization, scope and rules of engagement precede testing. Reconnaissance, scanning and enumeration inform assessment; the dashed arrow indicates a return from impact validation to enumeration, always within scope. Evidence and comparison with defensive observations accompany every phase; reporting, remediation and an agreed retest close the cycle.'
    },
    height: 450,
    nodes: [
      {
        x: 45,
        y: 10,
        width: 230,
        label: { it: '1 · Autorizzazione', en: '1 · Authorization' },
        detail: { it: 'Scope e regole', en: 'Scope and rules' }
      },
      {
        x: 45,
        y: 100,
        width: 230,
        label: { it: '2 · Ricognizione', en: '2 · Reconnaissance' },
        detail: { it: 'Scanning / enumerazione', en: 'Scanning / enumeration' }
      },
      {
        x: 45,
        y: 190,
        width: 230,
        label: { it: '3 · Valutazione', en: '3 · Assessment' },
        detail: { it: 'Vulnerabilità plausibili', en: 'Plausible vulnerabilities' }
      },
      {
        x: 45,
        y: 280,
        width: 230,
        label: { it: '4 · Verifica e impatto', en: '4 · Validation and impact' },
        detail: { it: 'Solo attività autorizzate', en: 'Authorized activities only' }
      },
      {
        x: 45,
        y: 380,
        width: 230,
        label: { it: '5 · Report e rimedi', en: '5 · Report and remediation' },
        detail: { it: 'Nuovo test concordato', en: 'Agreed retest' }
      }
    ],
    edges: [
      { path: 'M160 66 V98', x: 160, y: 0 },
      { path: 'M160 156 V188', x: 160, y: 0 },
      { path: 'M160 246 V278', x: 160, y: 0 },
      { path: 'M160 336 V378', x: 210, y: 362, label: { it: 'Evidenze', en: 'Evidence' } },
      {
        path: 'M275 308 H300 V128 H277',
        x: 160,
        y: 176,
        dashed: true
      }
    ]
  },
  encapsulation: {
    title: { it: 'Incapsulamento lungo lo stack di rete', en: 'Encapsulation down the network stack' },
    description: {
      it: 'Nel mittente i dati applicativi scendono nello stack: TCP o UDP aggiunge il proprio header, IP aggiunge il suo, Ethernet aggiunge header e trailer FCS, poi il livello fisico trasmette bit. Il destinatario rimuove e interpreta le stesse informazioni in ordine inverso. È uno schema didattico: il formato esatto dipende dai protocolli e dal collegamento.',
      en: 'At the sender, application data moves down the stack: TCP or UDP adds its header, IP adds its header, Ethernet adds a header and the FCS trailer, and the physical layer transmits bits. The receiver removes and interprets the same information in reverse order. This is a teaching model; exact formats depend on the protocols and link.'
    },
    height: 470,
    nodes: [
      {
        x: 28,
        y: 10,
        width: 264,
        label: { it: 'Livelli 7–5 · Dati', en: 'Layers 7–5 · Data' },
        detail: { it: 'Payload applicativo', en: 'Application payload' }
      },
      {
        x: 28,
        y: 106,
        width: 264,
        label: { it: 'Livello 4 · Segmento / datagramma', en: 'Layer 4 · Segment / datagram' },
        detail: { it: 'Header TCP oppure UDP', en: 'TCP or UDP header' }
      },
      {
        x: 28,
        y: 202,
        width: 264,
        label: { it: 'Livello 3 · Pacchetto IP', en: 'Layer 3 · IP packet' },
        detail: { it: 'Header IP + PDU di livello 4', en: 'IP header + layer-4 PDU' }
      },
      {
        x: 28,
        y: 298,
        width: 264,
        label: { it: 'Livello 2 · Frame', en: 'Layer 2 · Frame' },
        detail: { it: 'Header Ethernet + pacchetto + FCS', en: 'Ethernet header + packet + FCS' }
      },
      {
        x: 28,
        y: 394,
        width: 264,
        label: { it: 'Livello 1 · Bit', en: 'Layer 1 · Bits' },
        detail: { it: 'Segnali sul mezzo trasmissivo', en: 'Signals on the transmission medium' }
      }
    ],
    edges: [
      { path: 'M160 66 V104', x: 224, y: 91, label: { it: 'header L4', en: 'L4 header' } },
      { path: 'M160 162 V200', x: 222, y: 187, label: { it: 'header IP', en: 'IP header' } },
      { path: 'M160 258 V296', x: 226, y: 283, label: { it: 'header + FCS', en: 'header + FCS' } },
      { path: 'M160 354 V392', x: 220, y: 379, label: { it: 'trasmissione', en: 'transmission' } }
    ]
  },
  qos: {
    title: { it: 'Dalla marcatura all’uscita in rete', en: 'From marking to network egress' },
    description: {
      it: 'La policy definisce il confine di fiducia, classifica il traffico e decide come servire o scartare i pacchetti durante la congestione. LLQ dà priorità stretta alla classe configurata, CBWFQ ripartisce banda tra classi e WRED può scartare in anticipo traffico selezionato. QoS gestisce la capacità disponibile: non crea banda e le marcature vanno applicate e verificate lungo il percorso.',
      en: 'Policy defines a trust boundary, classifies traffic and decides how to serve or drop packets during congestion. LLQ gives strict priority to its configured class, CBWFQ allocates bandwidth among classes, and WRED can drop selected traffic early. QoS manages available capacity; it does not create bandwidth, and markings must be applied and checked along the path.'
    },
    height: 390,
    nodes: [
      {
        x: 24,
        y: 10,
        width: 272,
        label: { it: 'Bordo e confine di fiducia', en: 'Edge and trust boundary' },
        detail: { it: 'Considera attendibile o riscrivi la marcatura', en: 'Trust or rewrite the marking' }
      },
      {
        x: 24,
        y: 106,
        width: 272,
        label: { it: 'Classificazione del traffico', en: 'Traffic classification' },
        detail: { it: 'DSCP · EF 46 · AF · CS0', en: 'DSCP · EF 46 · AF · CS0' }
      },
      {
        x: 24,
        y: 202,
        width: 272,
        label: { it: 'Code e gestione congestione', en: 'Queues and congestion management' },
        detail: { it: 'LLQ · CBWFQ · WRED', en: 'LLQ · CBWFQ · WRED' }
      },
      {
        x: 24,
        y: 298,
        width: 272,
        label: { it: 'Link in uscita', en: 'Egress link' },
        detail: { it: 'Capacità condivisa tra flussi', en: 'Capacity shared among flows' }
      }
    ],
    edges: [
      { path: 'M160 66 V104', x: 222, y: 91, label: { it: 'classifica', en: 'classify' } },
      { path: 'M160 162 V200', x: 224, y: 187, label: { it: 'accoda / gestisce', en: 'queue / manage' } },
      { path: 'M160 258 V296', x: 220, y: 283, label: { it: 'trasmette', en: 'transmit' } }
    ]
  },
  'wlc-policy-mapping': {
    title: { it: 'Dalla WLAN alla VLAN del client', en: 'From WLAN to the client VLAN' },
    description: {
      it: 'Il WLAN profile definisce SSID e sicurezza; il policy tag mappa la WLAN al policy profile e viene assegnato all’AP. Site tag e RF tag restano associazioni distinte. Il policy profile e la modalità di switching determinano dove prosegue il traffico client.',
      en: 'The WLAN profile defines the SSID and security; the policy tag maps the WLAN to a policy profile and is assigned to the AP. Site and RF tags remain separate assignments. The policy profile and switching mode determine where client traffic goes next.'
    },
    height: 440,
    nodes: [
      {
        x: 24,
        y: 8,
        width: 272,
        label: { it: 'WLAN profile', en: 'WLAN profile' },
        detail: { it: 'SSID · autenticazione · cifratura', en: 'SSID · authentication · encryption' }
      },
      {
        x: 24,
        y: 92,
        width: 272,
        label: { it: 'Policy tag', en: 'Policy tag' },
        detail: { it: 'Associa WLAN e policy profile', en: 'Maps WLAN to policy profile' }
      },
      {
        x: 24,
        y: 176,
        width: 272,
        label: { it: 'Policy profile', en: 'Policy profile' },
        detail: { it: 'VLAN · switching · policy client', en: 'VLAN · switching · client policy' }
      },
      {
        x: 24,
        y: 260,
        width: 272,
        label: { it: 'AP e tag', en: 'AP and tags' },
        detail: { it: 'Policy · site · RF (assegnazioni distinte)', en: 'Policy · site · RF (separate assignments)' }
      },
      {
        x: 24,
        y: 344,
        width: 272,
        label: { it: 'Percorso dati client', en: 'Client data path' },
        detail: { it: 'CAPWAP centrale oppure VLAN locale → gateway', en: 'Central CAPWAP or local VLAN → gateway' }
      }
    ],
    edges: [
      { path: 'M160 64 V90', x: 220, y: 80, label: { it: 'mappa', en: 'map' } },
      { path: 'M160 148 V174', x: 220, y: 164, label: { it: 'applica policy', en: 'apply policy' } },
      { path: 'M160 232 V258', x: 220, y: 248, label: { it: 'assegna tag', en: 'assign tags' } },
      { path: 'M160 316 V342', x: 220, y: 332, label: { it: 'instrada', en: 'forward' } }
    ]
  },
  'pki-tls-chain': {
    title: { it: 'Catena di fiducia PKI/TLS', en: 'PKI/TLS chain of trust' },
    description: {
      it: 'La fiducia TLS è una catena: la Root CA (autofirmata, nel trust store del client) firma la Intermediate CA, che firma il certificato del server. Nell’handshake il server presenta il proprio certificato e la catena; il client la ricostruisce fino a una Root attendibile e verifica firma, validità, nome e revoca (CRL/OCSP). La freccia tratteggiata indica la verifica, che risale dal certificato server alla Root. Schema semplificato: cross-signing e pinning sono omessi.',
      en: 'TLS trust is a chain: the Root CA (self-signed, in the client’s trust store) signs the Intermediate CA, which signs the server certificate. In the handshake the server presents its certificate and the chain; the client rebuilds it up to a trusted Root and verifies signature, validity, name and revocation (CRL/OCSP). The dashed arrow shows validation, which goes up from the server certificate to the Root. Simplified schematic: cross-signing and pinning are omitted.'
    },
    height: 360,
    nodes: [
      {
        x: 24,
        y: 8,
        width: 272,
        label: { it: 'Root CA', en: 'Root CA' },
        detail: { it: 'Ancora di fiducia · autofirmata', en: 'Trust anchor · self-signed' }
      },
      {
        x: 24,
        y: 92,
        width: 272,
        label: { it: 'Intermediate CA', en: 'Intermediate CA' },
        detail: { it: 'Firmata dalla Root', en: 'Signed by the Root' }
      },
      {
        x: 24,
        y: 176,
        width: 272,
        label: { it: 'Certificato server', en: 'Server certificate' },
        detail: { it: 'Chiave pubblica + nome', en: 'Public key + name' }
      },
      {
        x: 24,
        y: 260,
        width: 272,
        label: { it: 'Validazione del client', en: 'Client validation' },
        detail: { it: 'Costruisce e verifica la catena', en: 'Builds and verifies the chain' }
      }
    ],
    edges: [
      { path: 'M160 64 V90', x: 220, y: 80, label: { it: 'firma', en: 'signs' } },
      { path: 'M160 148 V174', x: 224, y: 164, label: { it: 'poi firma', en: 'then signs' } },
      { path: 'M160 232 V258', x: 224, y: 248, label: { it: 'presenta', en: 'presents' } },
      { path: 'M298 288 H312 V36 H298', x: 160, y: 0, dashed: true }
    ]
  }
} satisfies Record<string, ManualDiagram>;

export type ManualDiagramId = keyof typeof MANUAL_DIAGRAMS;

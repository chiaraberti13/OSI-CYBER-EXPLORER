import type { Bilingual } from '../types';

export interface ManualDiagram {
  title: Bilingual;
  description: Bilingual;
  height: number;
  nodes: { x: number; y: number; width: number; label: Bilingual; detail: Bilingual }[];
  edges: { path: string; x: number; y: number; label: Bilingual; dashed?: boolean }[];
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
      { path: 'M160 66 V98', x: 160, y: 0, label: { it: '', en: '' } },
      { path: 'M160 156 V188', x: 160, y: 0, label: { it: '', en: '' } },
      { path: 'M160 246 V278', x: 160, y: 0, label: { it: '', en: '' } },
      { path: 'M160 336 V378', x: 210, y: 362, label: { it: 'Evidenze', en: 'Evidence' } },
      {
        path: 'M275 308 H300 V128 H277',
        x: 160,
        y: 176,
        label: { it: '', en: '' },
        dashed: true
      }
    ]
  }
} satisfies Record<string, ManualDiagram>;

export type ManualDiagramId = keyof typeof MANUAL_DIAGRAMS;

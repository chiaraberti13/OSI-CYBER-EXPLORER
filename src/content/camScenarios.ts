import type { Bilingual } from '../types';
import type { FrameInput, SwitchPort } from '../lib/camTable';

/**
 * The switch the CAM table lab replays frames on, and the sequences worth replaying.
 *
 * Four ports are enough for every case that matters: two access ports in the same
 * VLAN, one in a different VLAN to prove the table is keyed by VLAN too, and a trunk
 * that carries both. Each scenario is built around one behaviour, so the table tells
 * a single story instead of several at once.
 */

const b = (it: string, en: string): Bilingual => ({ it, en });

export const CAM_PORTS: SwitchPort[] = [
  { id: 'Gi1/0/1', name: 'Gi1/0/1', mode: 'access', vlan: 10 },
  { id: 'Gi1/0/2', name: 'Gi1/0/2', mode: 'access', vlan: 10 },
  { id: 'Gi1/0/3', name: 'Gi1/0/3', mode: 'access', vlan: 20 },
  { id: 'Gi1/0/24', name: 'Gi1/0/24', mode: 'trunk', vlan: 99, trunkVlans: [10, 20] }
];

export const CAM_HOSTS = [
  { mac: '0000.1111.aaaa', name: 'PC-A', port: 'Gi1/0/1', vlan: 10 },
  { mac: '0000.2222.bbbb', name: 'PC-B', port: 'Gi1/0/2', vlan: 10 },
  { mac: '0000.3333.cccc', name: 'PC-C', port: 'Gi1/0/3', vlan: 20 },
  { mac: 'ffff.ffff.ffff', name: 'Broadcast', port: '—', vlan: 0 },
  { mac: '0100.5e00.0001', name: 'Multicast', port: '—', vlan: 0 }
] as const;

const A = '0000.1111.aaaa';
const B = '0000.2222.bbbb';
const C = '0000.3333.cccc';
const BROADCAST = 'ffff.ffff.ffff';

export interface CamScenario {
  id: string;
  title: Bilingual;
  /** What the sequence is built to show. */
  lesson: Bilingual;
  frames: FrameInput[];
  agingSeconds?: number;
  initialEntries?: Array<{ mac: string; port: string; vlan: number; kind: 'dynamic' | 'static' }>;
}

export const CAM_SCENARIOS: CamScenario[] = [
  {
    id: 'first-conversation',
    title: b('Prima conversazione', 'First conversation'),
    lesson: b(
      'Una tabella vuota costringe lo switch a inondare la prima trama, e la risposta è ciò che gli insegna dove sta l’altro host. Dopo due trame la conversazione è unicast pura.',
      'An empty table forces the switch to flood the first frame, and the reply is what teaches it where the other host is. After two frames the conversation is pure unicast.'
    ),
    frames: [
      { srcMac: A, dstMac: B, ingressPort: 'Gi1/0/1', vlan: 10, at: 0 },
      { srcMac: B, dstMac: A, ingressPort: 'Gi1/0/2', vlan: 10, at: 1 },
      { srcMac: A, dstMac: B, ingressPort: 'Gi1/0/1', vlan: 10, at: 2 }
    ]
  },
  {
    id: 'broadcast-vs-flood',
    title: b('Broadcast contro unknown unicast', 'Broadcast against unknown unicast'),
    lesson: b(
      'Le due trame escono dalle stesse porte, ma per motivi diversi: il broadcast per definizione, l’unknown unicast perché la tabella non sa ancora dove mandarlo. Solo la seconda smette di essere inondata quando lo switch impara.',
      'Both frames leave the same ports, for different reasons: the broadcast by definition, the unknown unicast because the table does not know where to send it yet. Only the second stops being flooded once the switch learns.'
    ),
    frames: [
      { srcMac: A, dstMac: BROADCAST, ingressPort: 'Gi1/0/1', vlan: 10, at: 0 },
      { srcMac: A, dstMac: B, ingressPort: 'Gi1/0/1', vlan: 10, at: 1 },
      { srcMac: B, dstMac: A, ingressPort: 'Gi1/0/2', vlan: 10, at: 2 },
      { srcMac: A, dstMac: B, ingressPort: 'Gi1/0/1', vlan: 10, at: 3 },
      { srcMac: A, dstMac: BROADCAST, ingressPort: 'Gi1/0/1', vlan: 10, at: 4 }
    ]
  },
  {
    id: 'filtering',
    title: b('Filtering: la trama che non esce', 'Filtering: the frame that goes nowhere'),
    lesson: b(
      'Se mittente e destinatario risultano sulla stessa porta — dietro c’è uno hub, un altro switch o una VM sullo stesso host — lo switch scarta la trama. È la terza decisione possibile, e quella che si dimentica.',
      'When sender and receiver appear on the same port — a hub, another switch, or two VMs on the same host behind it — the switch discards the frame. It is the third possible decision, and the forgotten one.'
    ),
    frames: [
      { srcMac: B, dstMac: C, ingressPort: 'Gi1/0/1', vlan: 10, at: 0 },
      { srcMac: A, dstMac: B, ingressPort: 'Gi1/0/1', vlan: 10, at: 1 }
    ]
  },
  {
    id: 'mac-move',
    title: b('Lo stesso MAC su un’altra porta', 'The same MAC on another port'),
    lesson: b(
      'Lo switch si fida sempre dell’ultima trama vista: la voce si sposta, senza chiedere conferma. Se lo spostamento si ripete in continuazione si chiama MAC flapping, e le cause sono un loop, una VM migrata o uno spoofing in corso.',
      'The switch always trusts the most recent frame: the entry moves, with nothing asked for confirmation. If the move keeps repeating it is called MAC flapping, and the causes are a loop, a migrated VM, or spoofing in progress.'
    ),
    frames: [
      { srcMac: A, dstMac: B, ingressPort: 'Gi1/0/1', vlan: 10, at: 0 },
      { srcMac: A, dstMac: B, ingressPort: 'Gi1/0/2', vlan: 10, at: 1 },
      { srcMac: A, dstMac: B, ingressPort: 'Gi1/0/1', vlan: 10, at: 2 }
    ]
  },
  {
    id: 'aging',
    title: b('Aging: la tabella dimentica', 'Aging: the table forgets'),
    lesson: b(
      'Una voce dinamica vive 300 secondi di inattività, non 300 secondi in assoluto: ogni trama del suo host la rinnova. Quando scade, il traffico verso quell’host torna a essere inondato finché non si fa sentire di nuovo.',
      'A dynamic entry lives for 300 seconds of inactivity, not 300 seconds in absolute terms: every frame from its host renews it. Once it expires, traffic toward that host is flooded again until the host speaks up.'
    ),
    agingSeconds: 300,
    frames: [
      { srcMac: B, dstMac: C, ingressPort: 'Gi1/0/2', vlan: 10, at: 0 },
      { srcMac: A, dstMac: B, ingressPort: 'Gi1/0/1', vlan: 10, at: 120 },
      { srcMac: A, dstMac: B, ingressPort: 'Gi1/0/1', vlan: 10, at: 310 }
    ]
  },
  {
    id: 'vlan-separation',
    title: b('Due VLAN, due tabelle', 'Two VLANs, two tables'),
    lesson: b(
      'La CAM table è indicizzata per VLAN e MAC, non per MAC. Un indirizzo noto nella VLAN 20 resta un unknown unicast nella VLAN 10, e nessuna trama viene mai inondata fuori dalla propria VLAN: è il confine del dominio di broadcast, visto dalla parte della tabella.',
      'The CAM table is keyed by VLAN and MAC, not by MAC alone. An address known in VLAN 20 is still an unknown unicast in VLAN 10, and no frame is ever flooded outside its own VLAN: this is the broadcast domain boundary, seen from the table’s side.'
    ),
    frames: [
      { srcMac: C, dstMac: BROADCAST, ingressPort: 'Gi1/0/3', vlan: 20, at: 0 },
      { srcMac: A, dstMac: C, ingressPort: 'Gi1/0/1', vlan: 10, at: 1 },
      { srcMac: A, dstMac: BROADCAST, ingressPort: 'Gi1/0/1', vlan: 10, at: 2 }
    ]
  },
  {
    id: 'static-entry',
    title: b('Voce statica contro il filo', 'A static entry against the wire'),
    lesson: b(
      'Una voce statica non invecchia e non viene sovrascritta da ciò che arriva: se l’host si sposta davvero, il traffico continua a essere inviato dove dice la configurazione. È una protezione e, allo stesso tempo, un modo di rompere la rete.',
      'A static entry neither ages nor is overwritten by what arrives: if the host really moves, traffic keeps being sent where the configuration says. It is a protection and, at the same time, a way to break the network.'
    ),
    initialEntries: [{ mac: B, port: 'Gi1/0/2', vlan: 10, kind: 'static' }],
    frames: [
      { srcMac: B, dstMac: A, ingressPort: 'Gi1/0/1', vlan: 10, at: 0 },
      { srcMac: A, dstMac: B, ingressPort: 'Gi1/0/1', vlan: 10, at: 1 }
    ]
  }
];

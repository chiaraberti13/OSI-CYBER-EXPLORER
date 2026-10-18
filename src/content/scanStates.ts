import type { Bilingual } from '../types';

/**
 * eJPT scanning — the port-state decoder (LAB-01).
 *
 * A port scan does not "see" a state; it infers one from the response to a probe. On
 * TCP the three-way handshake makes the inference crisp (SYN-ACK, RST, or silence); on
 * UDP the absence of a handshake makes silence ambiguous, so the service reply or an
 * ICMP message is what decides. This dataset pairs each (protocol, condition) with the
 * probe sent, the response seen, the deduced state, and what a defender observes — the
 * same mapping the scanning chapter teaches, made explorable rather than asserted.
 *
 * Teaching-only: no live targets, no payloads; inert protocol labels (SYN, RST, ICMP
 * type 3 code 3) and well-known port numbers describe the mechanism, not an attack.
 */

export type ScanProtocol = 'tcp' | 'udp';

/** The state a scanner reports for a port. */
export type ScanState = 'open' | 'closed' | 'filtered';

export interface ScanCase {
  id: string;
  protocol: ScanProtocol;
  /** The real condition of the port behind the probe. */
  condition: ScanState;
  /** What the scanner sends. */
  probe: Bilingual;
  /** What comes back (or does not). */
  response: Bilingual;
  /** The state the scanner deduces, and whether the deduction is certain or ambiguous. */
  deduction: Bilingual;
  /** What the same exchange looks like from the defensive side. */
  defenderNote: Bilingual;
}

const b = (it: string, en: string): Bilingual => ({ it, en });

export const SCAN_CASES: readonly ScanCase[] = [
  {
    id: 'tcp-open',
    protocol: 'tcp',
    condition: 'open',
    probe: b('SYN verso la porta 22 (TCP).', 'SYN to port 22 (TCP).'),
    response: b(
      'SYN-ACK: il servizio accetta di aprire la sessione.',
      'SYN-ACK: the service agrees to open the session.'
    ),
    deduction: b(
      'Porta aperta, con certezza: il SYN-ACK completa il primo passo del three-way handshake, quindi un servizio è in ascolto.',
      'Open, with certainty: the SYN-ACK completes the first step of the three-way handshake, so a service is listening.'
    ),
    defenderNote: b(
      'L’handshake è visibile nei log; molti SYN verso porte diverse in poco tempo sono la firma di una scansione per un IDS.',
      'The handshake is visible in the logs; many SYN to different ports in a short time are a scan signature for an IDS.'
    )
  },
  {
    id: 'tcp-closed',
    protocol: 'tcp',
    condition: 'closed',
    probe: b('SYN verso la porta 22 (TCP).', 'SYN to port 22 (TCP).'),
    response: b(
      'RST: l’host risponde ma nessun servizio ascolta.',
      'RST: the host answers but no service is listening.'
    ),
    deduction: b(
      'Porta chiusa, con certezza: il RST prova che l’host è vivo e raggiungibile, ma su quella porta non c’è alcun servizio.',
      'Closed, with certainty: the RST proves the host is alive and reachable, but there is no service on that port.'
    ),
    defenderNote: b(
      'Il RST rivela che l’host esiste: anche una porta chiusa conferma all’attaccante che il bersaglio è attivo.',
      'The RST reveals the host exists: even a closed port confirms to the attacker that the target is alive.'
    )
  },
  {
    id: 'tcp-filtered',
    protocol: 'tcp',
    condition: 'filtered',
    probe: b('SYN verso la porta 22 (TCP).', 'SYN to port 22 (TCP).'),
    response: b(
      'Nessuna risposta (o un ICMP di amministrativamente proibito).',
      'No reply (or an ICMP administratively-prohibited message).'
    ),
    deduction: b(
      'Porta filtrata: un firewall scarta il pacchetto, quindi lo scanner non vede né SYN-ACK né RST e non può distinguere un servizio da un’assenza.',
      'Filtered: a firewall drops the packet, so the scanner sees neither SYN-ACK nor RST and cannot tell a service from an absence.'
    ),
    defenderNote: b(
      'Lo scarto silenzioso è la scelta difensiva giusta: non conferma l’esistenza dell’host e toglie informazione allo scanner.',
      'The silent drop is the right defensive choice: it does not confirm the host exists and takes information away from the scanner.'
    )
  },
  {
    id: 'udp-open',
    protocol: 'udp',
    condition: 'open',
    probe: b('Datagramma UDP verso la porta 53 (UDP).', 'UDP datagram to port 53 (UDP).'),
    response: b('Risposta del servizio (oppure, spesso, silenzio).', 'A service reply (or, often, silence).'),
    deduction: b(
      'Porta aperta se arriva una risposta applicativa; se c’è silenzio resta ambigua (aperta o filtrata), perché UDP non ha handshake che lo chiarisca.',
      'Open if an application reply arrives; if there is silence it stays ambiguous (open or filtered), because UDP has no handshake to settle it.'
    ),
    defenderNote: b(
      'La risposta del servizio conferma l’esposizione; ridurre la superficie UDP vale più che fidarsi del silenzio come difesa.',
      'The service reply confirms exposure; reducing the UDP surface is worth more than trusting silence as a defense.'
    )
  },
  {
    id: 'udp-closed',
    protocol: 'udp',
    condition: 'closed',
    probe: b('Datagramma UDP verso la porta 53 (UDP).', 'UDP datagram to port 53 (UDP).'),
    response: b('ICMP port unreachable (tipo 3 codice 3).', 'ICMP port unreachable (type 3 code 3).'),
    deduction: b(
      'Porta chiusa: l’ICMP port unreachable di tipo 3 codice 3 dice esplicitamente che nessun servizio ascolta su quella porta UDP.',
      'Closed: the type 3 code 3 ICMP port-unreachable explicitly says no service is listening on that UDP port.'
    ),
    defenderNote: b(
      'Il rate-limiting dell’ICMP rallenta la scansione UDP, che dipende proprio da quei messaggi per decidere lo stato.',
      'ICMP rate-limiting slows the UDP scan, which depends on exactly those messages to decide the state.'
    )
  },
  {
    id: 'udp-filtered',
    protocol: 'udp',
    condition: 'filtered',
    probe: b('Datagramma UDP verso la porta 53 (UDP).', 'UDP datagram to port 53 (UDP).'),
    response: b('Nessuna risposta, e nessun ICMP di ritorno.', 'No reply, and no ICMP message back.'),
    deduction: b(
      'Porta filtrata: un firewall scarta sia il datagramma sia l’eventuale ICMP, così lo scanner non riceve nulla e non può separare filtrata da aperta.',
      'Filtered: a firewall drops both the datagram and any ICMP, so the scanner receives nothing and cannot separate filtered from open.'
    ),
    defenderNote: b(
      'Scartare anche l’ICMP è ciò che rende la scansione UDP lenta e incerta: è il silenzio, non il messaggio, a togliere informazione.',
      'Dropping the ICMP too is what makes the UDP scan slow and uncertain: it is the silence, not the message, that removes information.'
    )
  }
];

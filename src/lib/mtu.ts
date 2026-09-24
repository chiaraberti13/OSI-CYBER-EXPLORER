import type { Bilingual } from '../types';

/**
 * MTU arithmetic, and what happens to the packet that does not fit.
 *
 * Three facts collide here and each one is a common mistake on its own. A tunnel does
 * not shrink the link, it shrinks what the *inner* packet may be. IPv4 fragments only
 * when the DF bit is clear, and when it is set the router drops the packet and reports
 * back with ICMP — which is why filtering ICMP wholesale creates a black hole nobody
 * can diagnose. IPv6 routers never fragment at all: only the source may, so the report
 * always comes back as Packet Too Big.
 *
 * And the fragment size itself is not simply "what is left": the fragment offset field
 * counts in units of 8 bytes, so every fragment except the last must carry a payload
 * that is a multiple of 8.
 */

export type IpVersion = 4 | 6;

export interface EncapsulationOverhead {
  id: string;
  label: Bilingual;
  /** Bytes taken away from what the inner IP packet can use. */
  bytes: number;
  /** False for encapsulations that grow the frame without touching the IP MTU. */
  affectsIpMtu: boolean;
  detail: Bilingual;
}

export interface MtuFragment {
  index: number;
  /** Total bytes on the wire, header included. */
  totalBytes: number;
  payloadBytes: number;
  /** Value of the fragment offset field, in units of 8 bytes. */
  offsetUnits: number;
  /** Byte position of this fragment's payload inside the original payload. */
  offsetBytes: number;
  moreFragments: boolean;
}

export type MtuOutcome = 'fits' | 'fragmented' | 'dropped-df' | 'dropped-ipv6' | 'impossible';

export interface MtuResult {
  version: IpVersion;
  linkMtu: number;
  overheadBytes: number;
  /** MTU left for the inner IP packet once the encapsulation is accounted for. */
  effectiveMtu: number;
  packetBytes: number;
  headerBytes: number;
  outcome: MtuOutcome;
  fragments: MtuFragment[];
  /** Bytes of header repeated across the fragments: the cost of fragmenting. */
  overheadFromFragmentation: number;
  /** ICMP message the router sends back, when it drops instead of fragmenting. */
  icmp: { name: string; type: number; code: number; reportedMtu: number } | null;
  /** Largest TCP payload that fits without fragmenting, and the adjust-mss value. */
  tcpMss: number;
  explanation: Bilingual;
}

const b = (it: string, en: string): Bilingual => ({ it, en });

/** IPv4 header without options; IPv6 has a fixed 40-byte header. */
const IPV4_HEADER = 20;
const IPV6_HEADER = 40;
const TCP_HEADER = 20;
/** The fragment offset field counts 8-byte units, so payloads must align to 8. */
const FRAGMENT_ALIGNMENT = 8;
/** An IPv6 source that fragments adds a fragment header to every piece. */
const IPV6_FRAGMENT_HEADER = 8;

export const ENCAPSULATIONS: EncapsulationOverhead[] = [
  {
    id: 'none', bytes: 0, affectsIpMtu: true,
    label: b('Nessun incapsulamento', 'No encapsulation'),
    detail: b('Ethernet standard: 1500 byte di MTU IP.', 'Standard Ethernet: 1500 bytes of IP MTU.')
  },
  {
    id: 'dot1q', bytes: 4, affectsIpMtu: false,
    label: b('Trunk 802.1Q (+4 byte)', '802.1Q trunk (+4 bytes)'),
    detail: b(
      'Il tag VLAN allunga la TRAMA, non il pacchetto IP: la trama arriva a 1522 byte e lo switch la accetta come baby giant, ma l’MTU IP resta 1500. Sottrarre 4 dall’MTU IP per un trunk è un errore.',
      'The VLAN tag lengthens the FRAME, not the IP packet: the frame reaches 1522 bytes and the switch accepts it as a baby giant, but the IP MTU stays 1500. Subtracting 4 from the IP MTU for a trunk is a mistake.'
    )
  },
  {
    id: 'pppoe', bytes: 8, affectsIpMtu: true,
    label: b('PPPoE (+8 byte)', 'PPPoE (+8 bytes)'),
    detail: b('Classico dell’accesso xDSL/FTTC: MTU IP a 1492.', 'The classic xDSL/FTTC case: IP MTU drops to 1492.')
  },
  {
    id: 'gre', bytes: 24, affectsIpMtu: true,
    label: b('GRE (+24 byte)', 'GRE (+24 bytes)'),
    detail: b('20 byte di nuovo header IP più 4 di header GRE.', '20 bytes of new IP header plus 4 of GRE header.')
  },
  {
    id: 'ipsec', bytes: 56, affectsIpMtu: true,
    label: b('IPsec ESP tunnel (+56 byte tipici)', 'IPsec ESP tunnel (+56 bytes typical)'),
    detail: b(
      'Valore tipico con AES-CBC e SHA: nuovo header IP, header ESP, IV, padding e ICV. Varia con gli algoritmi, quindi in produzione si misura invece di assumerlo.',
      'A typical figure with AES-CBC and SHA: new IP header, ESP header, IV, padding and ICV. It varies with the algorithms, so in production you measure it instead of assuming it.'
    )
  },
  {
    id: 'gre-ipsec', bytes: 80, affectsIpMtu: true,
    label: b('GRE over IPsec (+80 byte)', 'GRE over IPsec (+80 bytes)'),
    detail: b('I due incapsulamenti si sommano: 24 di GRE più 56 di ESP.', 'The two encapsulations add up: 24 for GRE plus 56 for ESP.')
  },
  {
    id: 'vxlan', bytes: 50, affectsIpMtu: true,
    label: b('VXLAN (+50 byte)', 'VXLAN (+50 bytes)'),
    detail: b(
      'Ethernet esterno, IP, UDP e header VXLAN: è il motivo per cui un underlay va portato a 1600 byte di MTU invece di 1500.',
      'Outer Ethernet, IP, UDP and the VXLAN header: it is why an underlay is raised to 1600 bytes of MTU instead of 1500.'
    )
  }
];

export interface MtuOptions {
  version?: IpVersion;
  /** MTU of the link the packet has to cross. */
  linkMtu?: number;
  /** Total length of the IP packet, header included. */
  packetBytes: number;
  /** Id from ENCAPSULATIONS. */
  encapsulationId?: string;
  /** IPv4 only: with DF set the router drops instead of fragmenting. */
  dontFragment?: boolean;
}

export function encapsulationById(id: string): EncapsulationOverhead {
  const found = ENCAPSULATIONS.find(item => item.id === id);
  if (!found) throw new Error('UNKNOWN_ENCAPSULATION');
  return found;
}

export function analyseMtu({
  version = 4,
  linkMtu = 1500,
  packetBytes,
  encapsulationId = 'none',
  dontFragment = false
}: MtuOptions): MtuResult {
  if (version !== 4 && version !== 6) throw new Error('INVALID_IP_VERSION');
  if (!Number.isInteger(linkMtu) || linkMtu < 68) throw new Error('INVALID_MTU');
  const headerBytes = version === 4 ? IPV4_HEADER : IPV6_HEADER;
  if (!Number.isInteger(packetBytes) || packetBytes <= headerBytes) throw new Error('INVALID_PACKET_SIZE');
  if (packetBytes > 65535) throw new Error('PACKET_TOO_LARGE');

  const encapsulation = encapsulationById(encapsulationId);
  const overheadBytes = encapsulation.affectsIpMtu ? encapsulation.bytes : 0;
  const effectiveMtu = linkMtu - overheadBytes;
  const tcpMss = Math.max(0, effectiveMtu - headerBytes - TCP_HEADER);

  const base: Omit<MtuResult, 'outcome' | 'fragments' | 'icmp' | 'explanation' | 'overheadFromFragmentation'> = {
    version, linkMtu, overheadBytes, effectiveMtu, packetBytes, headerBytes, tcpMss
  };

  if (effectiveMtu <= headerBytes + FRAGMENT_ALIGNMENT) {
    return {
      ...base, outcome: 'impossible', fragments: [], icmp: null, overheadFromFragmentation: 0,
      explanation: b(
        `Con ${overheadBytes} byte di incapsulamento su un MTU di ${linkMtu} non resta spazio utile per un pacchetto IP: la configurazione non è trasportabile.`,
        `With ${overheadBytes} bytes of encapsulation over an MTU of ${linkMtu} there is no usable room left for an IP packet: this configuration cannot carry traffic.`
      )
    };
  }

  if (packetBytes <= effectiveMtu) {
    return {
      ...base, outcome: 'fits', fragments: [], icmp: null, overheadFromFragmentation: 0,
      explanation: b(
        `Il pacchetto da ${packetBytes} byte entra nei ${effectiveMtu} byte disponibili dopo l’incapsulamento: passa intero, senza frammentazione. La MSS TCP più grande che non frammenta su questo percorso è ${tcpMss} byte.`,
        `The ${packetBytes}-byte packet fits within the ${effectiveMtu} bytes left after encapsulation: it passes whole, with no fragmentation. The largest TCP MSS that avoids fragmenting on this path is ${tcpMss} bytes.`
      )
    };
  }

  if (version === 6) {
    return {
      ...base, outcome: 'dropped-ipv6', fragments: [], overheadFromFragmentation: 0,
      icmp: { name: 'ICMPv6 Packet Too Big', type: 2, code: 0, reportedMtu: effectiveMtu },
      explanation: b(
        `In IPv6 i router non frammentano mai: il pacchetto viene scartato e il router risponde con ICMPv6 Packet Too Big indicando ${effectiveMtu} byte. Solo la sorgente può frammentare, aggiungendo un fragment header di ${IPV6_FRAGMENT_HEADER} byte. Se ICMPv6 è filtrato, la sorgente non riceve l’avviso e la connessione si blocca senza errori visibili: è il PMTUD black hole.`,
        `In IPv6 routers never fragment: the packet is dropped and the router replies with ICMPv6 Packet Too Big reporting ${effectiveMtu} bytes. Only the source may fragment, by adding an ${IPV6_FRAGMENT_HEADER}-byte fragment header. If ICMPv6 is filtered the source never hears about it and the connection stalls with no visible error: the PMTUD black hole.`
      )
    };
  }

  if (dontFragment) {
    return {
      ...base, outcome: 'dropped-df', fragments: [], overheadFromFragmentation: 0,
      icmp: { name: 'ICMP Destination Unreachable — Fragmentation Needed', type: 3, code: 4, reportedMtu: effectiveMtu },
      explanation: b(
        `Il bit DF è impostato, quindi il router non può frammentare: scarta il pacchetto e risponde con ICMP tipo 3 codice 4, indicando ${effectiveMtu} byte come MTU del prossimo salto. È così che funziona la Path MTU Discovery — e se quel messaggio ICMP viene filtrato, la sorgente continua a inviare pacchetti troppo grandi senza mai saperlo.`,
        `The DF bit is set, so the router cannot fragment: it drops the packet and replies with ICMP type 3 code 4, reporting ${effectiveMtu} bytes as the next-hop MTU. This is how Path MTU Discovery works — and if that ICMP message is filtered, the source keeps sending packets that are too large and never finds out.`
      )
    };
  }

  // Every fragment but the last carries a payload aligned to 8 bytes.
  const perFragmentPayload = Math.floor((effectiveMtu - headerBytes) / FRAGMENT_ALIGNMENT) * FRAGMENT_ALIGNMENT;
  const totalPayload = packetBytes - headerBytes;
  const fragments: MtuFragment[] = [];
  let offsetBytes = 0;
  let index = 0;
  while (offsetBytes < totalPayload) {
    const payloadBytes = Math.min(perFragmentPayload, totalPayload - offsetBytes);
    const moreFragments = offsetBytes + payloadBytes < totalPayload;
    fragments.push({
      index,
      totalBytes: payloadBytes + headerBytes,
      payloadBytes,
      offsetUnits: offsetBytes / FRAGMENT_ALIGNMENT,
      offsetBytes,
      moreFragments
    });
    offsetBytes += payloadBytes;
    index += 1;
  }

  return {
    ...base,
    outcome: 'fragmented',
    fragments,
    overheadFromFragmentation: (fragments.length - 1) * headerBytes,
    icmp: null,
    explanation: b(
      `Il pacchetto viene diviso in ${fragments.length} frammenti. Ognuno tranne l’ultimo porta ${perFragmentPayload} byte di payload, perché il campo fragment offset conta in unità di 8 byte e il payload deve essere un multiplo di 8. Ogni frammento ripete l’header IP, quindi la frammentazione aggiunge ${(fragments.length - 1) * headerBytes} byte e obbliga la destinazione a riassemblare: se un solo frammento si perde, si perde l’intero pacchetto.`,
      `The packet is split into ${fragments.length} fragments. Each one except the last carries ${perFragmentPayload} bytes of payload, because the fragment offset field counts in units of 8 bytes and the payload has to be a multiple of 8. Every fragment repeats the IP header, so fragmenting adds ${(fragments.length - 1) * headerBytes} bytes and forces the destination to reassemble: lose one fragment and the whole packet is lost.`
    )
  };
}

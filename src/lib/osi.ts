/**
 * Pure, framework-free helpers for the OSI simulation.
 * Kept separate from the React components so the encapsulation logic can be
 * unit-tested in isolation.
 */

export type SimProtocol = 'HTTP' | 'DNS' | 'BGP' | 'SSH' | 'FTP' | 'SMTP';

/** Protocols carried over UDP at the Transport layer. Everything else here is TCP. */
const UDP_PROTOCOLS: ReadonlySet<SimProtocol> = new Set(['DNS']);

/** The Transport-layer protocol (TCP/UDP) used by a given application protocol. */
export function l4ProtocolFor(protocol: SimProtocol): 'TCP' | 'UDP' {
  return UDP_PROTOCOLS.has(protocol) ? 'UDP' : 'TCP';
}

/**
 * Name of the Protocol Data Unit (PDU) at a given OSI layer.
 * L5-L7 → Data, L4 → Segment (TCP) / Datagram (UDP), L3 → Packet,
 * L2 → Frame, L1 → Bits.
 */
export function pduNameForLayer(layerId: number, protocol: SimProtocol): string {
  if (layerId >= 5) return 'Data';
  if (layerId === 4) return l4ProtocolFor(protocol) === 'UDP' ? 'Datagram' : 'Segment';
  if (layerId === 3) return 'Packet';
  if (layerId === 2) return 'Frame';
  if (layerId === 1) return 'Bits';
  return 'Data';
}

import { describe, it, expect } from 'vitest';
import { pduNameForLayer, l4ProtocolFor, type SimProtocol } from './osi';

const ALL: SimProtocol[] = ['HTTP', 'DNS', 'BGP', 'SSH', 'FTP', 'SMTP'];

describe('l4ProtocolFor', () => {
  it('maps DNS to UDP and everything else to TCP', () => {
    expect(l4ProtocolFor('DNS')).toBe('UDP');
    for (const p of ALL.filter(p => p !== 'DNS')) {
      expect(l4ProtocolFor(p)).toBe('TCP');
    }
  });
});

describe('pduNameForLayer', () => {
  it('names the PDU correctly for the upper layers (protocol-independent)', () => {
    for (const p of ALL) {
      expect(pduNameForLayer(7, p)).toBe('Data');
      expect(pduNameForLayer(6, p)).toBe('Data');
      expect(pduNameForLayer(5, p)).toBe('Data');
      expect(pduNameForLayer(3, p)).toBe('Packet');
      expect(pduNameForLayer(2, p)).toBe('Frame');
      expect(pduNameForLayer(1, p)).toBe('Bits');
    }
  });

  it('uses Segment for TCP protocols at L4', () => {
    for (const p of ['HTTP', 'BGP', 'SSH', 'FTP', 'SMTP'] as SimProtocol[]) {
      expect(pduNameForLayer(4, p)).toBe('Segment');
    }
  });

  it('uses Datagram for UDP (DNS) at L4', () => {
    expect(pduNameForLayer(4, 'DNS')).toBe('Datagram');
  });
});

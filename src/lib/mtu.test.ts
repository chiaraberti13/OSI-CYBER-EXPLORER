import { describe, expect, it } from 'vitest';
import { analyseMtu, encapsulationById, ENCAPSULATIONS } from './mtu';

describe('MTU left for the inner packet', () => {
  it('leaves the full 1500 bytes with no encapsulation', () => {
    const result = analyseMtu({ packetBytes: 1500 });
    expect(result.effectiveMtu).toBe(1500);
    expect(result.outcome).toBe('fits');
    expect(result.tcpMss).toBe(1460);
  });

  it('subtracts each tunnel overhead and the MSS with it', () => {
    expect(analyseMtu({ packetBytes: 100, encapsulationId: 'gre' }).effectiveMtu).toBe(1476);
    expect(analyseMtu({ packetBytes: 100, encapsulationId: 'gre' }).tcpMss).toBe(1436);
    expect(analyseMtu({ packetBytes: 100, encapsulationId: 'gre-ipsec' }).effectiveMtu).toBe(1420);
    expect(analyseMtu({ packetBytes: 100, encapsulationId: 'gre-ipsec' }).tcpMss).toBe(1380);
    expect(analyseMtu({ packetBytes: 100, encapsulationId: 'pppoe' }).effectiveMtu).toBe(1492);
    expect(analyseMtu({ packetBytes: 100, encapsulationId: 'vxlan' }).effectiveMtu).toBe(1450);
  });

  it('does not touch the IP MTU for an 802.1Q tag', () => {
    // The tag lengthens the frame to 1522, not the IP packet: this is the mistake.
    const tagged = analyseMtu({ packetBytes: 1500, encapsulationId: 'dot1q' });
    expect(tagged.effectiveMtu).toBe(1500);
    expect(tagged.overheadBytes).toBe(0);
    expect(tagged.outcome).toBe('fits');
    expect(encapsulationById('dot1q').affectsIpMtu).toBe(false);
  });

  it('uses the IPv6 header size for the MSS', () => {
    // 1500 - 40 (IPv6) - 20 (TCP) = 1440, the figure IPv6 tunnels are tuned around.
    expect(analyseMtu({ version: 6, packetBytes: 100 }).tcpMss).toBe(1440);
  });

  it('describes every encapsulation in both languages', () => {
    for (const item of ENCAPSULATIONS) {
      expect(item.label.it.length).toBeGreaterThan(3);
      expect(item.label.en.length).toBeGreaterThan(3);
      expect(item.detail.it.length).toBeGreaterThan(20);
      expect(item.detail.en.length).toBeGreaterThan(20);
    }
    expect(() => encapsulationById('nope')).toThrow('UNKNOWN_ENCAPSULATION');
  });
});

describe('IPv4 fragmentation', () => {
  it('aligns every fragment but the last to 8 bytes', () => {
    // 1500 - 20 = 1480 of payload per fragment, already a multiple of 8.
    const result = analyseMtu({ packetBytes: 4000 });
    expect(result.outcome).toBe('fragmented');
    expect(result.fragments.map(fragment => fragment.payloadBytes)).toEqual([1480, 1480, 1020]);
    expect(result.fragments.map(fragment => fragment.offsetUnits)).toEqual([0, 185, 370]);
    expect(result.fragments.map(fragment => fragment.moreFragments)).toEqual([true, true, false]);
  });

  it('rounds the fragment payload down when the MTU is not a multiple of 8', () => {
    // 1492 - 20 = 1472, which is a multiple of 8; 1491 - 20 = 1471 is not, so 1464.
    expect(analyseMtu({ packetBytes: 3000, encapsulationId: 'pppoe' }).fragments[0].payloadBytes).toBe(1472);
    const odd = analyseMtu({ packetBytes: 3000, linkMtu: 1491 });
    expect(odd.fragments[0].payloadBytes).toBe(1464);
    expect(odd.fragments[0].totalBytes).toBe(1484);
  });

  it('accounts for the header repeated on every fragment', () => {
    const result = analyseMtu({ packetBytes: 4000 });
    expect(result.overheadFromFragmentation).toBe(40);
    const bytesOnWire = result.fragments.reduce((sum, fragment) => sum + fragment.totalBytes, 0);
    expect(bytesOnWire).toBe(4000 + 40);
  });

  it('keeps the payload bytes accounted for exactly once', () => {
    const result = analyseMtu({ packetBytes: 5000, encapsulationId: 'gre' });
    const payload = result.fragments.reduce((sum, fragment) => sum + fragment.payloadBytes, 0);
    expect(payload).toBe(5000 - 20);
    // Offsets have to be contiguous, in 8-byte units.
    let expectedOffset = 0;
    for (const fragment of result.fragments) {
      expect(fragment.offsetBytes).toBe(expectedOffset);
      expect(fragment.offsetUnits).toBe(expectedOffset / 8);
      expectedOffset += fragment.payloadBytes;
    }
  });

  it('explains the cost of fragmenting in both languages', () => {
    const result = analyseMtu({ packetBytes: 4000 });
    expect(result.explanation.it).toMatch(/multiplo di 8/);
    expect(result.explanation.en).toMatch(/multiple of 8/);
  });
});

describe('when the router refuses to fragment', () => {
  it('drops a DF packet and reports the next-hop MTU with ICMP type 3 code 4', () => {
    const result = analyseMtu({ packetBytes: 1600, dontFragment: true });
    expect(result.outcome).toBe('dropped-df');
    expect(result.fragments).toEqual([]);
    expect(result.icmp).toEqual({
      name: 'ICMP Destination Unreachable — Fragmentation Needed', type: 3, code: 4, reportedMtu: 1500
    });
    expect(result.explanation.en).toMatch(/Path MTU Discovery/);
  });

  it('reports the tunnel MTU, not the link MTU, when a tunnel is in the way', () => {
    const result = analyseMtu({ packetBytes: 1500, encapsulationId: 'gre-ipsec', dontFragment: true });
    expect(result.icmp?.reportedMtu).toBe(1420);
  });

  it('never fragments in IPv6, whatever the DF bit would say', () => {
    const result = analyseMtu({ version: 6, packetBytes: 1600 });
    expect(result.outcome).toBe('dropped-ipv6');
    expect(result.icmp).toMatchObject({ name: 'ICMPv6 Packet Too Big', type: 2, code: 0, reportedMtu: 1500 });
    expect(result.fragments).toEqual([]);
    expect(result.explanation.en).toMatch(/black hole/);
  });

  it('reports a configuration that cannot carry anything', () => {
    // A tiny MTU under a heavy tunnel leaves no room for a usable packet.
    const result = analyseMtu({ packetBytes: 500, linkMtu: 100, encapsulationId: 'gre-ipsec' });
    expect(result.outcome).toBe('impossible');
  });
});

describe('invalid input', () => {
  it('refuses sizes that cannot describe a packet', () => {
    expect(() => analyseMtu({ packetBytes: 20 })).toThrow('INVALID_PACKET_SIZE');
    expect(() => analyseMtu({ packetBytes: 70000 })).toThrow('PACKET_TOO_LARGE');
    expect(() => analyseMtu({ packetBytes: 1000, linkMtu: 40 })).toThrow('INVALID_MTU');
    // An IPv6 packet has to be longer than its 40-byte header.
    expect(() => analyseMtu({ version: 6, packetBytes: 40 })).toThrow('INVALID_PACKET_SIZE');
  });
});

import { describe, expect, it } from 'vitest';
import { simulateDhcp } from './dhcpFlow';

const messages = (result: ReturnType<typeof simulateDhcp>) => result.steps.map(step => step.message);

describe('DORA with the server in the same subnet', () => {
  const result = simulateDhcp({ serverLocation: 'same-subnet' });

  it('exchanges exactly four messages', () => {
    expect(messages(result)).toEqual(['DISCOVER', 'OFFER', 'REQUEST', 'ACK']);
    expect(result.leased).toBe(true);
  });

  it('sources the DISCOVER from 0.0.0.0 to the limited broadcast', () => {
    expect(result.steps[0]).toMatchObject({
      sourceIp: '0.0.0.0',
      destinationIp: '255.255.255.255',
      destinationMac: 'ffff.ffff.ffff',
      broadcast: true,
      udp: { source: 68, destination: 67 }
    });
  });

  it('broadcasts the REQUEST as well, and explains why', () => {
    const request = result.steps[2];
    expect(request.broadcast).toBe(true);
    expect(request.sourceIp).toBe('0.0.0.0');
    expect(request.note.en).toMatch(/withdraw theirs/);
    expect(request.note.en).toMatch(/option 54/);
  });

  it('leaves giaddr at zero when no relay is involved', () => {
    expect(result.steps.every(step => step.giaddr === '0.0.0.0')).toBe(true);
  });

  it('computes the renewal and rebinding timers from the lease', () => {
    expect(result.lease).toMatchObject({
      address: '10.10.10.42', mask: '255.255.255.0', gateway: '10.10.10.1',
      leaseSeconds: 86_400, t1Seconds: 43_200, t2Seconds: 75_600
    });
  });
});

describe('DORA through a relay', () => {
  const result = simulateDhcp({ serverLocation: 'remote', relayConfigured: true });

  it('adds the relayed copies of the messages', () => {
    expect(messages(result)).toEqual(['DISCOVER', 'DISCOVER', 'OFFER', 'OFFER', 'REQUEST', 'ACK']);
  });

  it('turns the broadcast into a unicast and fills giaddr', () => {
    const relayed = result.steps[1];
    expect(relayed).toMatchObject({
      sourceIp: '10.10.10.1',
      destinationIp: '10.20.50.10',
      broadcast: false,
      giaddr: '10.10.10.1',
      // The relay speaks as a DHCP agent, so it sources from 67 rather than 68.
      udp: { source: 67, destination: 67 }
    });
    expect(relayed.note.en).toMatch(/which pool/);
  });

  it('has the server answer to giaddr, not to the client', () => {
    expect(result.steps[2]).toMatchObject({ destinationIp: '10.10.10.1', broadcast: false });
    // And the relay puts it back on the client's subnet as a broadcast.
    expect(result.steps[3]).toMatchObject({ destinationIp: '255.255.255.255', broadcast: true });
  });

  it('ends at the first message when the relay is not configured', () => {
    const broken = simulateDhcp({ serverLocation: 'remote', relayConfigured: false });
    expect(messages(broken)).toEqual(['DISCOVER']);
    expect(broken.leased).toBe(false);
    expect(broken.failure?.code).toBe('NO_RELAY');
    expect(broken.failure?.note.en).toMatch(/ip helper-address/);
    expect(broken.failure?.note.en).toMatch(/169\.254/);
  });
});

describe('the ways it fails while looking configured', () => {
  it('gets no offer at all when the pool is empty', () => {
    const result = simulateDhcp({ poolExhausted: true });
    expect(messages(result)).not.toContain('OFFER');
    expect(result.failure?.code).toBe('POOL_EXHAUSTED');
    expect(result.failure?.note.en).toMatch(/show ip dhcp pool/);
  });

  it('drops a server message that arrives on an untrusted port', () => {
    const result = simulateDhcp({ snoopingUntrustedServer: true });
    expect(result.leased).toBe(false);
    expect(result.failure?.code).toBe('SNOOPING_UNTRUSTED');
    // This is the feature working, not breaking: it is the rogue-server defence.
    expect(result.steps.at(-1)?.note.en).toMatch(/correct behaviour/);
    expect(result.steps.at(-1)?.note.en).toMatch(/ip dhcp snooping trust/);
  });

  it('refuses Option 82 arriving with giaddr at zero', () => {
    const result = simulateDhcp({ serverLocation: 'same-subnet', option82: true });
    expect(result.failure?.code).toBe('OPTION82_WITHOUT_RELAY');
    expect(result.failure?.note.en).toMatch(/ip dhcp relay information trusted/);
  });

  it('accepts Option 82 when the relay is the one inserting it', () => {
    const result = simulateDhcp({ serverLocation: 'remote', relayConfigured: true, option82: true });
    expect(result.leased).toBe(true);
    expect(result.steps[1].option82).toBe(true);
  });
});

describe('renewal is not a DORA', () => {
  const result = simulateDhcp({ mode: 'renew' });

  it('is two unicast messages, with no discover and no offer', () => {
    expect(messages(result)).toEqual(['REQUEST', 'ACK']);
    expect(result.steps[0].broadcast).toBe(false);
    expect(result.steps[0].sourceIp).toBe('10.10.10.42');
    expect(result.steps[0].note.en).toMatch(/T1/);
    expect(result.steps[0].note.en).toMatch(/87\.5%/);
  });

  it('keeps the same address and resets the timer', () => {
    expect(result.leased).toBe(true);
    expect(result.lease?.address).toBe('10.10.10.42');
    expect(result.steps[1].note.en).toMatch(/same binding/);
  });

  it('sends a NAK when the server will not confirm the address', () => {
    const refused = simulateDhcp({ mode: 'renew', poolExhausted: true });
    expect(messages(refused)).toEqual(['REQUEST', 'NAK']);
    expect(refused.leased).toBe(false);
    expect(refused.failure?.code).toBe('RENEW_NAK');
  });
});

describe('every step is teachable', () => {
  it('describes each message in both languages, with ports and addresses', () => {
    for (const options of [
      {}, { serverLocation: 'same-subnet' as const }, { mode: 'renew' as const },
      { relayConfigured: false }, { snoopingUntrustedServer: true }
    ]) {
      for (const step of simulateDhcp(options).steps) {
        expect(step.note.it.length).toBeGreaterThan(60);
        expect(step.note.en.length).toBeGreaterThan(60);
        expect([67, 68]).toContain(step.udp.source);
        expect([67, 68]).toContain(step.udp.destination);
        expect(step.sourceMac).toMatch(/^[0-9a-f]{4}\.[0-9a-f]{4}\.[0-9a-f]{4}$/);
      }
    }
  });

  it('rejects a lease shorter than a minute', () => {
    expect(() => simulateDhcp({ leaseSeconds: 30 })).toThrow('INVALID_LEASE');
  });
});

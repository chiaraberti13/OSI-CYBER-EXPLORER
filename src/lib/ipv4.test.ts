import { describe, expect, it } from 'vitest';
import {
  addressKind, calculateIpv4Subnet, ipv4ToUint, planVlsm, prefixForHosts, prefixToMask,
  uintToIpv4, wildcardForRange
} from './ipv4';

describe('IPv4 conversion', () => {
  it('round-trips a valid address', () => {
    expect(uintToIpv4(ipv4ToUint('192.168.10.42'))).toBe('192.168.10.42');
  });

  it('rejects malformed addresses and prefixes', () => {
    expect(() => ipv4ToUint('192.168.1')).toThrow('INVALID_IPV4');
    expect(() => ipv4ToUint('192.168.1.256')).toThrow('INVALID_IPV4');
    expect(() => prefixToMask(33)).toThrow('INVALID_PREFIX');
  });
});

describe('IPv4 subnet calculation', () => {
  it('calculates a /24 network', () => {
    const subnet = calculateIpv4Subnet('192.168.10.42', 24);
    expect(subnet.subnetMask).toBe('255.255.255.0');
    expect(subnet.wildcardMask).toBe('0.0.0.255');
    expect(subnet.networkAddress).toBe('192.168.10.0');
    expect(subnet.broadcastAddress).toBe('192.168.10.255');
    expect(subnet.firstUsable).toBe('192.168.10.1');
    expect(subnet.lastUsable).toBe('192.168.10.254');
    expect(subnet.usableHosts).toBe(254);
    expect(subnet.kind).toBe('private');
  });

  it('calculates a /26 boundary correctly', () => {
    const subnet = calculateIpv4Subnet('172.16.8.130', 26);
    expect(subnet.networkAddress).toBe('172.16.8.128');
    expect(subnet.broadcastAddress).toBe('172.16.8.191');
    expect(subnet.usableHosts).toBe(62);
  });

  it('handles /31 point-to-point and /32 host routes', () => {
    const pointToPoint = calculateIpv4Subnet('10.0.0.5', 31);
    expect(pointToPoint.pointToPoint).toBe(true);
    expect(pointToPoint.firstUsable).toBe('10.0.0.4');
    expect(pointToPoint.lastUsable).toBe('10.0.0.5');
    expect(pointToPoint.usableHosts).toBe(2);
    expect(pointToPoint.hasBroadcast).toBe(false);

    const hostRoute = calculateIpv4Subnet('203.0.113.7', 32);
    expect(hostRoute.hostRoute).toBe(true);
    expect(hostRoute.networkAddress).toBe('203.0.113.7');
    expect(hostRoute.usableHosts).toBe(1);
    expect(hostRoute.hasBroadcast).toBe(false);
  });
});

describe('IPv4 address classification', () => {
  it('recognizes special-use ranges', () => {
    expect(addressKind(ipv4ToUint('127.0.0.1'))).toBe('loopback');
    expect(addressKind(ipv4ToUint('169.254.1.5'))).toBe('link-local');
    expect(addressKind(ipv4ToUint('224.0.0.5'))).toBe('multicast');
    expect(addressKind(ipv4ToUint('198.51.100.8'))).toBe('documentation');
    expect(addressKind(ipv4ToUint('100.64.10.1'))).toBe('shared');
    expect(addressKind(ipv4ToUint('198.18.0.1'))).toBe('special-use');
    expect(addressKind(ipv4ToUint('8.8.8.8'))).toBe('public');
  });
});

describe('prefix sizing for a host requirement', () => {
  it('leaves room for the network and broadcast addresses', () => {
    // 62 usable hosts fit in a /26; ask for one more and the whole subnet doubles.
    expect(prefixForHosts(62)).toBe(26);
    expect(prefixForHosts(63)).toBe(25);
    expect(prefixForHosts(126)).toBe(25);
    expect(prefixForHosts(254)).toBe(24);
    expect(prefixForHosts(500)).toBe(23);
  });

  it('never goes below a /30, because two addresses are always reserved', () => {
    expect(prefixForHosts(1)).toBe(30);
    expect(prefixForHosts(2)).toBe(30);
    expect(prefixForHosts(3)).toBe(29);
  });

  it('rejects a request that is not a positive whole number of hosts', () => {
    expect(() => prefixForHosts(0)).toThrow('INVALID_HOST_COUNT');
    expect(() => prefixForHosts(-4)).toThrow('INVALID_HOST_COUNT');
    expect(() => prefixForHosts(1.5)).toThrow('INVALID_HOST_COUNT');
    expect(() => prefixForHosts(2 ** 30)).toThrow('HOSTS_EXCEED_IPV4');
  });
});

describe('VLSM planning', () => {
  const requirements = [
    { id: 'sales', name: 'Sales', hosts: 50 },
    { id: 'hr', name: 'HR', hosts: 20 },
    { id: 'it', name: 'IT', hosts: 10 },
    { id: 'wan', name: 'WAN', hosts: 2 }
  ];

  it('allocates largest first and keeps every subnet on its own boundary', () => {
    const plan = planVlsm('192.168.1.0', 24, requirements);
    expect(plan.allocations.map(a => [a.id, a.network, a.prefix])).toEqual([
      ['sales', '192.168.1.0', 26],
      ['hr', '192.168.1.64', 27],
      ['it', '192.168.1.96', 28],
      ['wan', '192.168.1.112', 30]
    ]);
    expect(plan.allocations[0].broadcast).toBe('192.168.1.63');
    expect(plan.allocations[0].firstUsable).toBe('192.168.1.1');
    expect(plan.allocations[0].lastUsable).toBe('192.168.1.62');
  });

  it('reports the addresses each subnet wastes', () => {
    const plan = planVlsm('192.168.1.0', 24, requirements);
    const sales = plan.allocations[0];
    expect(sales.usableHosts).toBe(62);
    expect(sales.wastedHosts).toBe(12);
    // The two-host WAN link is the extreme case: a /30 wastes nothing at all.
    expect(plan.allocations[3].usableHosts).toBe(2);
    expect(plan.allocations[3].wastedHosts).toBe(0);
  });

  it('accounts for the whole block, not just the subnets', () => {
    const plan = planVlsm('192.168.1.0', 24, requirements);
    expect(plan.totalAddresses).toBe(256);
    expect(plan.usedAddresses).toBe(116);
    expect(plan.utilisationPercent).toBe(45.3);
    expect(plan.nextFreeAddress).toBe('192.168.1.116');
  });

  it('gives the same plan whatever order the requirements arrive in', () => {
    const shuffled = [requirements[2], requirements[0], requirements[3], requirements[1]];
    expect(planVlsm('192.168.1.0', 24, shuffled)).toEqual(planVlsm('192.168.1.0', 24, requirements));
  });

  it('fits a set that request order would not fit', () => {
    // In a /25 there are 128 addresses. Taken in the order asked — /28, /26, /27 —
    // the /26 can only start at .64, which leaves the /27 nowhere to go. Largest
    // first, the same three subnets fit with 16 addresses to spare.
    const awkward = [
      { id: 'lab', name: 'Lab', hosts: 10 },
      { id: 'floor', name: 'Floor', hosts: 60 },
      { id: 'voice', name: 'Voice', hosts: 25 }
    ];
    const plan = planVlsm('10.0.0.0', 25, awkward);
    expect(plan.allocations.map(a => `${a.network}/${a.prefix}`)).toEqual([
      '10.0.0.0/26', '10.0.0.64/27', '10.0.0.96/28'
    ]);
    expect(plan.usedAddresses).toBe(112);
    expect(plan.utilisationPercent).toBe(87.5);
  });

  it('normalises a base written as a host address', () => {
    const plan = planVlsm('192.168.1.77', 24, [requirements[0]]);
    expect(plan.base).toBe('192.168.1.0');
    expect(plan.allocations[0].network).toBe('192.168.1.0');
  });

  it('refuses a block that cannot hold the requirements', () => {
    expect(() => planVlsm('10.0.0.0', 29, [{ id: 'a', name: 'A', hosts: 100 }])).toThrow('BLOCK_TOO_SMALL');
    expect(() => planVlsm('10.0.0.0', 24, [])).toThrow('NO_REQUIREMENTS');
  });

  it('reports a full block as having no free address left', () => {
    const plan = planVlsm('10.0.0.0', 26, [{ id: 'a', name: 'A', hosts: 60 }]);
    expect(plan.utilisationPercent).toBe(100);
    expect(plan.nextFreeAddress).toBeNull();
  });
});

describe('wildcard for a range', () => {
  it('matches an aligned block with a single ACE', () => {
    expect(wildcardForRange('10.1.1.0', '10.1.1.255')).toMatchObject({
      address: '10.1.1.0', wildcard: '0.0.0.255', prefix: 24, exact: true, extraAddresses: 0
    });
  });

  it('writes the four management hosts as one aligned /30', () => {
    expect(wildcardForRange('10.1.1.8', '10.1.1.11')).toMatchObject({
      address: '10.1.1.8', wildcard: '0.0.0.3', prefix: 30, exact: true
    });
  });

  it('matches a single host with a zero wildcard', () => {
    expect(wildcardForRange('10.1.1.9', '10.1.1.9')).toMatchObject({
      address: '10.1.1.9', wildcard: '0.0.0.0', prefix: 32, exact: true, extraAddresses: 0
    });
  });

  it('says how much extra a misaligned range drags in', () => {
    // .5 to .8 crosses a boundary, so no single wildcard fits it: the smallest block
    // that covers both ends is the /28, which also matches twelve addresses nobody asked for.
    const match = wildcardForRange('10.1.1.5', '10.1.1.8');
    expect(match).toMatchObject({ address: '10.1.1.0', wildcard: '0.0.0.15', prefix: 28, exact: false });
    expect(match.extraAddresses).toBe(12);
  });

  it('crosses octets when the range demands it', () => {
    expect(wildcardForRange('10.1.0.0', '10.1.3.255')).toMatchObject({
      address: '10.1.0.0', wildcard: '0.0.3.255', prefix: 22, exact: true
    });
  });

  it('rejects a range given backwards', () => {
    expect(() => wildcardForRange('10.1.1.10', '10.1.1.1')).toThrow('INVALID_RANGE');
  });
});

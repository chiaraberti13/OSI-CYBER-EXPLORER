import { describe, expect, it } from 'vitest';
import { addressKind, calculateIpv4Subnet, ipv4ToUint, prefixToMask, uintToIpv4 } from './ipv4';

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

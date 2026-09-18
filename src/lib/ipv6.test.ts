import { describe, expect, it } from 'vitest';
import { inspectIpv6, macToModifiedEui64 } from './ipv6';

describe('IPv6 inspection', () => {
  it('expands and compresses a global address', () => {
    const details = inspectIpv6('2001:db8::1/64');
    expect(details.expanded).toBe('2001:0db8:0000:0000:0000:0000:0000:0001');
    expect(details.compressed).toBe('2001:db8::1');
    expect(details.prefix).toBe(64);
    expect(details.kind).toBe('documentation');
  });

  it('recognizes common address types', () => {
    expect(inspectIpv6('::').kind).toBe('unspecified');
    expect(inspectIpv6('::1').kind).toBe('loopback');
    expect(inspectIpv6('fe80::1').kind).toBe('link-local');
    expect(inspectIpv6('fd12:3456::1').kind).toBe('unique-local');
    expect(inspectIpv6('2001:4860:4860::8888').kind).toBe('global-unicast');
    expect(inspectIpv6('ff02::1').kind).toBe('multicast');
  });

  it('parses IPv4-embedded addresses and prints them in mixed notation', () => {
    const mapped = inspectIpv6('::ffff:192.0.2.1');
    expect(mapped.kind).toBe('ipv4-mapped');
    expect(mapped.expanded).toBe('0000:0000:0000:0000:0000:ffff:c000:0201');
    expect(mapped.compressed).toBe('::ffff:192.0.2.1');

    const nat64 = inspectIpv6('64:ff9b::192.0.2.33/96');
    expect(nat64.kind).toBe('nat64');
    expect(nat64.compressed).toBe('64:ff9b::192.0.2.33');
    expect(nat64.prefix).toBe(96);

    expect(inspectIpv6('::192.0.2.1').kind).toBe('ipv4-compatible');
  });

  it('rejects malformed values', () => {
    expect(() => inspectIpv6('2001::db8::1')).toThrow('INVALID_IPV6');
    expect(() => inspectIpv6('2001:db8::1/129')).toThrow('INVALID_IPV6_PREFIX');
    expect(() => inspectIpv6('::ffff:192.0.2')).toThrow('INVALID_IPV6');
    expect(() => inspectIpv6('::ffff:192.0.2.300')).toThrow('INVALID_IPV6');
  });
});

describe('Modified EUI-64', () => {
  it('inserts FFFE and flips the universal/local bit', () => {
    expect(macToModifiedEui64('00:1A:2B:3C:4D:5E')).toBe('021a:2bff:fe3c:4d5e');
  });

  it('rejects invalid MAC addresses', () => {
    expect(() => macToModifiedEui64('00:11:22:33:44')).toThrow('INVALID_MAC');
  });
});

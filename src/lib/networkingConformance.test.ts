import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  addressKind,
  calculateIpv4Subnet,
  ipv4ToUint,
  uintToIpv4
} from './ipv4';
import {
  classifyIpv6,
  compressIpv6,
  expandIpv6,
  inspectIpv6,
  macToModifiedEui64
} from './ipv6';

const PROPERTY_PARAMETERS = { seed: 0x4f5349, numRuns: 1_000 } as const;

/**
 * Sources checked on 2026-09-30:
 * - IANA IPv4 Special-Purpose Address Registry, governed by RFC 6890 section 2.2.2.
 * - IANA IPv6 Special-Purpose Address Registry, governed by RFC 6890 section 2.2.3.
 */
describe('IANA special-purpose registries (RFC 6890 sections 2.2.2 and 2.2.3)', () => {
  it.each([
    ['0.0.0.0', 'unspecified'],
    ['0.0.0.1', 'special-use'],
    ['10.0.0.1', 'private'],
    ['100.64.0.1', 'shared'],
    ['127.0.0.1', 'loopback'],
    ['169.254.1.1', 'link-local'],
    ['192.0.2.1', 'documentation'],
    ['198.18.0.1', 'special-use'],
    ['240.0.0.1', 'special-use'],
    ['255.255.255.255', 'limited-broadcast']
  ] as const)('addressKind classifies the registry vector %s as %s', (address, expected) => {
    expect(addressKind(ipv4ToUint(address))).toBe(expected);
  });

  it.each([
    ['::', 'unspecified'],
    ['::1', 'loopback'],
    ['::ffff:192.0.2.1', 'ipv4-mapped'],
    ['64:ff9b::192.0.2.1', 'nat64'],
    ['64:ff9b:1::192.0.2.1', 'nat64'],
    ['100::1', 'other'],
    ['2001:db8::1', 'documentation'],
    ['3fff::1', 'documentation'],
    ['fc00::1', 'unique-local'],
    ['fe80::1', 'link-local']
  ] as const)('classifyIpv6 classifies the registry vector %s as %s', (address, expected) => {
    expect(classifyIpv6(expandIpv6(address))).toBe(expected);
  });
});

describe('IPv4 /31 point-to-point links (RFC 3021 sections 2.1 and 2.2.1)', () => {
  it('calculateIpv4Subnet treats both addresses as hosts and exposes no directed broadcast', () => {
    const subnet = calculateIpv4Subnet('192.0.2.10', 31);

    expect(subnet).toMatchObject({
      networkAddress: '192.0.2.10',
      broadcastAddress: '192.0.2.11',
      firstUsable: '192.0.2.10',
      lastUsable: '192.0.2.11',
      totalAddresses: 2,
      usableHosts: 2,
      pointToPoint: true,
      hasBroadcast: false
    });
  });
});

describe('canonical IPv6 text (RFC 5952 sections 4.1, 4.2.1-4.2.3 and 4.3)', () => {
  it.each([
    ['2001:0DB8:0000:0000:0000:0000:0000:0001', '2001:db8::1'],
    ['2001:0:0:1:0:0:0:1', '2001:0:0:1::1'],
    ['2001:db8:0:0:1:0:0:1', '2001:db8::1:0:0:1'],
    ['2001:db8:0:1:1:1:1:1', '2001:db8:0:1:1:1:1:1']
  ] as const)('compressIpv6 renders %s as %s', (input, expected) => {
    expect(compressIpv6(expandIpv6(input))).toBe(expected);
  });

  it('inspectIpv6 emits the same canonical representation', () => {
    expect(inspectIpv6('2001:0DB8:0:0:1:0:0:1').compressed).toBe('2001:db8::1:0:0:1');
  });
});

describe('Modified EUI-64 (RFC 4291 section 2.5.1 and appendix A)', () => {
  it('macToModifiedEui64 inserts ff:fe and inverts the universal/local bit', () => {
    expect(macToModifiedEui64('00:1A:2B:3C:4D:5E')).toBe('021a:2bff:fe3c:4d5e');
    expect(macToModifiedEui64('02:1A:2B:3C:4D:5E')).toBe('001a:2bff:fe3c:4d5e');
  });
});

describe('address conversion properties (RFC 791 section 3.2; RFC 4291 section 2.2)', () => {
  it('ipv4ToUint ∘ uintToIpv4 is the identity over every 32-bit unsigned integer', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 0xffff_ffff }), value =>
        ipv4ToUint(uintToIpv4(value)) === value
      ),
      PROPERTY_PARAMETERS
    );
  });

  it('expandIpv6 ∘ compressIpv6 preserves every expanded 128-bit address', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 0xffff }), { minLength: 8, maxLength: 8 }),
        values => {
          const expanded = values.map(value => value.toString(16).padStart(4, '0'));
          return expandIpv6(compressIpv6(expanded)).join(':') === expanded.join(':');
        }
      ),
      PROPERTY_PARAMETERS
    );
  });
});

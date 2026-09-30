import { describe, expect, it } from 'vitest';
import {
  HEADER_SPECIFICATIONS,
  headerSpecificationFacts,
  headerSpecificationSignature,
} from './headerSpecifications';

describe('header specifications', () => {
  it('keeps the normative wire dimensions in one immutable source', () => {
    expect(HEADER_SPECIFICATIONS).toEqual({
      ethernet: {
        headerBytes: 14,
        fcsBytes: 4,
        vlanTagBytes: 4,
        minimumFrameBytes: 64,
        maximumFrameBytes: 1518,
        maximumTaggedFrameBytes: 1522,
        mtuBytes: 1500,
      },
      ipv4: { minimumHeaderBytes: 20, maximumHeaderBytes: 60 },
      ipv6: { fixedHeaderBytes: 40 },
      tcp: { minimumHeaderBytes: 20, maximumHeaderBytes: 60 },
      udp: { headerBytes: 8 },
      typicalMss: { ipv4Bytes: 1460, ipv6Bytes: 1440 },
      initialTtlSystemDefaults: [64, 128, 255],
    });
  });

  it('labels TTL values as system defaults rather than protocol constants', () => {
    expect(headerSpecificationFacts(3, 'it')).toContainEqual({
      id: 'ttl-defaults',
      label: 'TTL iniziali (default di sistema)',
      value: '64 / 128 / 255',
    });
    expect(headerSpecificationFacts(3, 'en')).toContainEqual({
      id: 'ttl-defaults',
      label: 'Initial TTLs (system defaults)',
      value: '64 / 128 / 255',
    });
  });

  it('generates a stable signature for cross-component consistency checks', () => {
    expect(headerSpecificationSignature(4, 'it')).toBe(
      'Header TCP: 20–60 B · Header UDP: 8 B · MSS tipico IPv4: 1460 B · MSS tipico IPv6: 1440 B',
    );
  });
});

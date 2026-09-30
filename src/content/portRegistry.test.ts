import { describe, expect, it } from 'vitest';
import {
  classifyPortRange,
  IANA_PORT_REGISTRY_UPDATED_ON,
  PORT_REGISTRY_METADATA,
  PORT_REGISTRY_VERIFIED_ON,
  validatePortRegistry
} from './portRegistry';

describe('IANA Service Name and Transport Protocol Port Number Registry', () => {
  it('keeps every curated port/protocol pair unique and valid', () => {
    expect(validatePortRegistry(PORT_REGISTRY_METADATA)).toEqual([]);

    const pairs = PORT_REGISTRY_METADATA.flatMap(item =>
      item.ports.flatMap(port => item.transports.map(transport => `${port}/${transport}`))
    );
    expect(new Set(pairs).size).toBe(pairs.length);
    expect(PORT_REGISTRY_METADATA).toHaveLength(45);
  });

  it.each([
    [0, 'well-known'],
    [1_023, 'well-known'],
    [1_024, 'registered'],
    [49_151, 'registered'],
    [49_152, 'dynamic'],
    [65_535, 'dynamic']
  ] as const)('classifies port %i as %s per RFC 6335 section 6', (port, expected) => {
    expect(classifyPortRange(port)).toBe(expected);
  });

  it('rejects values outside the complete 0-65535 port-number space', () => {
    expect(() => classifyPortRange(-1)).toThrow('INVALID_PORT');
    expect(() => classifyPortRange(65_536)).toThrow('INVALID_PORT');
    expect(() => classifyPortRange(1.5)).toThrow('INVALID_PORT');
  });

  it('records the registry revision and verification date explicitly', () => {
    expect(IANA_PORT_REGISTRY_UPDATED_ON).toBe('2026-09-28');
    expect(PORT_REGISTRY_VERIFIED_ON).toBe('2026-09-30');
    expect(PORT_REGISTRY_METADATA.every(item => item.verifiedOn === PORT_REGISTRY_VERIFIED_ON)).toBe(true);
  });

  it('links the cleartext mail and directory services to their TLS equivalents', () => {
    const byService = new Map(PORT_REGISTRY_METADATA.map(item => [item.service, item]));
    expect(byService.get('IMAP')?.encryptedEquivalent).toMatchObject({ ports: [993], service: 'IMAP over TLS' });
    expect(byService.get('LDAP')?.encryptedEquivalent).toMatchObject({ ports: [636], service: 'LDAP over TLS' });
  });

  it('marks conventional conflicts as de-facto and explains the IANA assignment', () => {
    const byService = new Map(PORT_REGISTRY_METADATA.map(item => [item.service, item]));
    for (const service of ['Oracle DB', 'RADIUS Auth (Alt)', 'RADIUS Acct (Alt)', 'Vite / Dev Server']) {
      expect(byService.get(service)).toMatchObject({ registrationStatus: 'de-facto' });
      expect(byService.get(service)?.ambiguity?.en).toBeTruthy();
      expect(byService.get(service)?.ianaServiceNames.length).toBeGreaterThan(0);
    }
  });

  it('uses the current IANA http-alt assignment for TCP 8080', () => {
    expect(PORT_REGISTRY_METADATA.find(item => item.service === 'HTTP Alternate')).toMatchObject({
      ports: [8080],
      transports: ['TCP'],
      registrationStatus: 'assigned',
      ianaServiceNames: ['http-alt']
    });
  });
});

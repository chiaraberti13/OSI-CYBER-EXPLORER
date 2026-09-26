import { describe, expect, it } from 'vitest';
import {
  INTERACTIVE_INPUT_LIMITS,
  InputValidationError,
  inputErrorMessage,
  parseBoundedInteger,
  parseHttpStatus,
  parseIpv4Address,
  parseIpv4Subnet,
  parseRelativeResourcePath,
  parseVlanId,
  parseVlanListInput,
  parseWildcardRange,
  validateTextInput
} from './inputValidation';

function expectCode(action: () => unknown, code: string) {
  expect(action).toThrow(expect.objectContaining({ code }));
}

describe('central interactive input validation', () => {
  it('rejects control characters and applies text limits after trimming', () => {
    expect(validateTextInput('  router-1  ', { maxLength: 8 })).toBe('router-1');
    expectCode(() => validateTextInput('router\n1', { maxLength: 20 }), 'CONTROL_CHARACTER');
    expectCode(() => validateTextInput('abcdef', { maxLength: 5 }), 'TOO_LONG');
    expectCode(() => validateTextInput('   ', { maxLength: 5 }), 'REQUIRED');
  });

  it('accepts only bounded whole numbers without coercing blank or decimal input', () => {
    expect(parseBoundedInteger(' 100 ', 100, 599)).toBe(100);
    expect(parseHttpStatus(599)).toBe(599);
    expectCode(() => parseBoundedInteger('', 0, 10), 'REQUIRED');
    expectCode(() => parseBoundedInteger('1.5', 0, 10), 'INVALID_INTEGER');
    expectCode(() => parseBoundedInteger('11', 0, 10), 'OUT_OF_RANGE');
  });

  it('normalizes IPv4 addresses and validates subnet prefixes', () => {
    expect(parseIpv4Address('192.0.2.10')).toBe('192.0.2.10');
    expect(parseIpv4Subnet('198.51.100.9', '24')).toEqual({ address: '198.51.100.9', prefix: 24 });
    expectCode(() => parseIpv4Address('192.0.2.999'), 'INVALID_IPV4');
    expectCode(() => parseIpv4Address(`192.0.2.1${'0'.repeat(7)}`), 'TOO_LONG');
    expectCode(() => parseIpv4Subnet('192.0.2.1', 33), 'OUT_OF_RANGE');
  });

  it('validates wildcard ranges before calculating the ACE', () => {
    expect(parseWildcardRange('10.1.1.8', '10.1.1.11')).toMatchObject({
      address: '10.1.1.8', wildcard: '0.0.0.3', exact: true
    });
    expectCode(() => parseWildcardRange('10.1.1.11', '10.1.1.8'), 'INVALID_RANGE');
  });

  it('validates single VLANs and compact VLAN lists', () => {
    expect(parseVlanId('4094')).toBe(4094);
    expect(parseVlanListInput('20-22,10,20')).toEqual([10, 20, 21, 22]);
    expectCode(() => parseVlanId(4095), 'OUT_OF_RANGE');
    expectCode(() => parseVlanListInput('30-20'), 'INVALID_VLAN_RANGE');
    expectCode(() => parseVlanListInput('10\u0000,20'), 'CONTROL_CHARACTER');
  });

  it('accepts only an origin-relative REST path and rejects traversal or URL syntax', () => {
    expect(parseRelativeResourcePath('/api/v1/devices/R1')).toBe('/api/v1/devices/R1');
    expect(parseRelativeResourcePath('/')).toBe('/');
    for (const invalid of [
      'https://evil.example/api', '//evil.example/api', '/api/../admin', '/api/%2e%2e/admin',
      '/api/%2Fadmin', '/api?token=x', '/api#fragment', '/api//devices', '/api\\devices'
    ]) {
      expectCode(() => parseRelativeResourcePath(invalid), 'INVALID_RESOURCE_PATH');
    }
    expectCode(
      () => parseRelativeResourcePath(`/${'a'.repeat(INTERACTIVE_INPUT_LIMITS.resourcePathCharacters)}`),
      'TOO_LONG'
    );
  });

  it('provides consistent bilingual messages and a safe fallback', () => {
    const error = new InputValidationError('INVALID_RESOURCE_PATH');
    expect(inputErrorMessage(error, 'it')).toContain('path relativo');
    expect(inputErrorMessage(error, 'en')).toContain('host-relative path');
    expect(inputErrorMessage(new Error('UNEXPECTED'), 'it')).toBe('Controlla il valore inserito.');
  });

  it('keeps shared limits immutable', () => {
    expect(Object.isFrozen(INTERACTIVE_INPUT_LIMITS)).toBe(true);
  });
});

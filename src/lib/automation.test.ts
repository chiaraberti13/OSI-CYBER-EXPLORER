import { describe, expect, it } from 'vitest';
import { findSensitiveJsonPaths, flattenJsonDocument, httpMethodProfile, httpStatusFamily } from './automation';

describe('REST method semantics', () => {
  it('distinguishes safe and idempotent methods', () => {
    expect(httpMethodProfile('GET')).toMatchObject({ crud: 'read', safe: true, idempotent: true });
    expect(httpMethodProfile('POST')).toMatchObject({ crud: 'create', safe: false, idempotent: false });
    expect(httpMethodProfile('PUT')).toMatchObject({ crud: 'replace', safe: false, idempotent: true });
    expect(httpMethodProfile('PATCH')).toMatchObject({ crud: 'partial-update', safe: false, idempotent: false });
    expect(httpMethodProfile('DELETE').idempotent).toBe(true);
  });

  it('classifies HTTP status families', () => {
    expect(httpStatusFamily(204)).toBe('success');
    expect(httpStatusFamily(401)).toBe('client-error');
    expect(httpStatusFamily(503)).toBe('server-error');
  });
});

describe('JSON inspection', () => {
  const document = JSON.stringify({ hostname: 'R1', interfaces: [{ name: 'Gi0/0', enabled: true }], mtu: 1500, description: null });

  it('flattens objects and arrays into typed JSON paths', () => {
    const nodes = flattenJsonDocument(document);
    expect(nodes).toContainEqual({ path: '$.interfaces[0].enabled', type: 'boolean', value: 'true' });
    expect(nodes).toContainEqual({ path: '$.mtu', type: 'number', value: '1500' });
    expect(nodes).toContainEqual({ path: '$.description', type: 'null', value: 'null' });
  });

  it('rejects malformed JSON', () => {
    expect(() => flattenJsonDocument('{"hostname":}')).toThrow();
  });

  it('detects likely secrets by key without exposing values', () => {
    const paths = findSensitiveJsonPaths('{"username":"netops","apiToken":"abc","nested":{"private_key":"pem"}}');
    expect(paths).toEqual(['$.apiToken', '$.nested.private_key']);
  });

  it('does not flag ordinary operational fields', () => {
    expect(findSensitiveJsonPaths(document)).toEqual([]);
  });
});

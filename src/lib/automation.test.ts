import { describe, expect, it } from 'vitest';
import {
  JSON_INPUT_LIMITS,
  JsonInputError,
  REDACTED_JSON_VALUE,
  findSensitiveJsonPaths,
  flattenJsonDocument,
  httpMethodProfile,
  httpStatusFamily,
  isSensitiveJsonKey,
  inspectJsonDocument
} from './automation';

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

  it('detects supported secret-key variants across case and separators', () => {
    const keys = [
      'authorization', 'AUTHORIZATION', 'access_token', 'access-token', 'accessToken',
      'refresh_token', 'idToken', 'api_key', 'api-key', 'apiKey', 'client_secret',
      'clientSecret', 'secretKey', 'private_key', 'dbPassword', 'passwd',
      'credentials', 'snmpCommunity', 'community_string'
    ];

    expect(keys.every(isSensitiveJsonKey)).toBe(true);
  });

  it('normalizes Unicode compatibility forms, accents and invisible separators', () => {
    expect(isSensitiveJsonKey('ＡＣＣＥＳＳ＿ＴＯＫＥＮ')).toBe(true);
    expect(isSensitiveJsonKey('tókén')).toBe(true);
    expect(isSensitiveJsonKey('client\u200Bsecret')).toBe(true);
  });

  it('avoids ordinary metadata and security-related false positives', () => {
    const ordinaryKeys = [
      'tokenBucket', 'tokenExpiry', 'passwordPolicy', 'secretariat',
      'authorizationServer', 'privateKeyAlgorithm', 'apiKeyName',
      'communityDescription', 'credentialRotationDate'
    ];

    expect(ordinaryKeys.some(isSensitiveJsonKey)).toBe(false);
  });

  it('detects likely secrets without retaining their values in inspection results', () => {
    const marker = 'value-that-must-never-survive';
    const inspection = inspectJsonDocument(JSON.stringify({
      username: 'netops',
      apiToken: marker,
      nested: { private_key: marker }
    }));

    expect(inspection.sensitivePaths).toEqual(['$.apiToken', '$.nested.private_key']);
    expect(inspection.nodes.filter(node => inspection.sensitivePaths.includes(node.path)))
      .toEqual(expect.arrayContaining([
        expect.objectContaining({ path: '$.apiToken', value: REDACTED_JSON_VALUE }),
        expect.objectContaining({ path: '$.nested.private_key', value: REDACTED_JSON_VALUE })
      ]));
    expect(JSON.stringify(inspection)).not.toContain(marker);
  });

  it('redacts every descendant of a sensitive container', () => {
    const inspection = inspectJsonDocument(JSON.stringify({
      credentials: {
        username: 'netops',
        password: 'never-visible'
      },
      hostname: 'R1'
    }));

    expect(inspection.sensitivePaths).toEqual(['$.credentials', '$.credentials.password']);
    expect(inspection.nodes.find(node => node.path === '$.credentials.username')?.value)
      .toBe(REDACTED_JSON_VALUE);
    expect(inspection.nodes.find(node => node.path === '$.hostname')?.value).toBe('R1');
    expect(JSON.stringify(inspection)).not.toContain('never-visible');
    expect(JSON.stringify(inspection)).not.toContain('netops');
  });

  it('does not flag ordinary operational fields', () => {
    expect(findSensitiveJsonPaths(document)).toEqual([]);
  });

  it('enforces the UTF-8 byte limit at its exact boundary', () => {
    const exact = JSON.stringify('€');
    const exactBytes = new TextEncoder().encode(exact).byteLength;

    expect(inspectJsonDocument(exact, { maxBytes: exactBytes }).nodes).toHaveLength(1);
    expect(() => inspectJsonDocument(exact, { maxBytes: exactBytes - 1 })).toThrowError(
      expect.objectContaining({ code: 'JSON_TOO_MANY_BYTES' })
    );
  });

  it('ignores brackets inside strings while enforcing structural depth', () => {
    const atLimit = '{"value":'.repeat(4) + '"[not structural]"' + '}'.repeat(4);
    const overLimit = `[${atLimit}]`;

    expect(inspectJsonDocument(atLimit, { maxDepth: 4 }).nodes).toHaveLength(5);
    expect(() => inspectJsonDocument(overLimit, { maxDepth: 4 })).toThrowError(
      expect.objectContaining({ code: 'JSON_TOO_DEEP' })
    );
  });

  it('enforces the node limit consistently for flattening and secret detection', () => {
    const fourNodes = '{"token":"abc","enabled":true,"mtu":1500}';

    expect(flattenJsonDocument(fourNodes, 4)).toHaveLength(4);
    expect(findSensitiveJsonPaths(fourNodes, 4)).toEqual(['$.token']);
    expect(() => flattenJsonDocument(fourNodes, 3)).toThrowError(
      expect.objectContaining({ code: 'JSON_TOO_MANY_NODES' })
    );
    expect(() => findSensitiveJsonPaths(fourNodes, 3)).toThrowError(
      expect.objectContaining({ code: 'JSON_TOO_MANY_NODES' })
    );
  });

  it('rejects stack-exhaustion payloads before parsing or recursive traversal', () => {
    const deeplyNested = '['.repeat(10_000) + '0' + ']'.repeat(10_000);

    expect(() => inspectJsonDocument(deeplyNested)).toThrowError(
      expect.objectContaining({ code: 'JSON_TOO_DEEP' })
    );
  });

  it('handles a deterministic fuzz corpus without leaking native parser or stack errors', () => {
    let state = 0x5eed1234;
    const random = (): number => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 0x1_0000_0000;
    };
    const scalar = (): unknown => {
      const values: unknown[] = [null, true, false, 0, -42.5, 'brace } in string', 'quote \\" and slash \\\\', '€'];
      return values[Math.floor(random() * values.length)];
    };
    const generate = (depth: number): unknown => {
      if (depth >= 4 || random() < 0.45) return scalar();
      if (random() < 0.5) return Array.from({ length: Math.floor(random() * 4) }, () => generate(depth + 1));
      return Object.fromEntries(
        Array.from({ length: Math.floor(random() * 4) }, (_, index) => [`key_${depth}_${index}`, generate(depth + 1)])
      );
    };

    for (let index = 0; index < 250; index += 1) {
      const input = JSON.stringify(generate(0));
      expect(() => inspectJsonDocument(input)).not.toThrow();
    }
  });

  it('uses immutable production defaults and controlled errors', () => {
    expect(JSON_INPUT_LIMITS).toEqual({ maxBytes: 65_536, maxDepth: 12, maxNodes: 200 });
    expect(Object.isFrozen(JSON_INPUT_LIMITS)).toBe(true);
    expect(() => inspectJsonDocument('{"hostname":}')).toThrow(JsonInputError);
    expect(() => inspectJsonDocument('null', { maxNodes: 0 })).toThrow(TypeError);
  });
});

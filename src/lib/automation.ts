export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface HttpMethodProfile {
  crud: 'read' | 'create' | 'replace' | 'partial-update' | 'delete';
  safe: boolean;
  idempotent: boolean;
  typicalSuccess: number[];
}

export interface JsonNode {
  path: string;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  value: string;
}

export interface JsonInspectionLimits {
  maxBytes: number;
  maxDepth: number;
  maxNodes: number;
}

export interface JsonInspection {
  nodes: JsonNode[];
  sensitivePaths: string[];
}

export type JsonInputErrorCode =
  | 'JSON_INVALID'
  | 'JSON_TOO_MANY_BYTES'
  | 'JSON_TOO_DEEP'
  | 'JSON_TOO_MANY_NODES';

export class JsonInputError extends Error {
  readonly code: JsonInputErrorCode;

  constructor(code: JsonInputErrorCode) {
    super(code);
    this.name = 'JsonInputError';
    this.code = code;
  }
}

export const JSON_INPUT_LIMITS: Readonly<JsonInspectionLimits> = Object.freeze({
  maxBytes: 64 * 1024,
  maxDepth: 12,
  maxNodes: 200
});

const HTTP_PROFILES: Readonly<Record<HttpMethod, HttpMethodProfile>> = {
  GET: { crud: 'read', safe: true, idempotent: true, typicalSuccess: [200] },
  POST: { crud: 'create', safe: false, idempotent: false, typicalSuccess: [200, 201, 202] },
  PUT: { crud: 'replace', safe: false, idempotent: true, typicalSuccess: [200, 201, 204] },
  PATCH: { crud: 'partial-update', safe: false, idempotent: false, typicalSuccess: [200, 204] },
  DELETE: { crud: 'delete', safe: false, idempotent: true, typicalSuccess: [200, 202, 204] }
};

export const REDACTED_JSON_VALUE = '[REDACTED]';

const SENSITIVE_TERMINAL_TOKENS = new Set([
  'authorization',
  'community',
  'credential',
  'credentials',
  'passphrase',
  'passwd',
  'password',
  'secret',
  'secrets',
  'token',
  'tokens'
]);

const SENSITIVE_TOKEN_SUFFIXES = [
  ['api', 'key'],
  ['private', 'key'],
  ['secret', 'key'],
  ['community', 'string']
] as const;

const COMPACT_SENSITIVE_KEYS = new Set([
  'accesstoken',
  'apikey',
  'authorization',
  'clientsecret',
  'communitystring',
  'credential',
  'credentials',
  'idtoken',
  'passphrase',
  'passwd',
  'password',
  'privatekey',
  'refreshtoken',
  'secret',
  'secretkey',
  'token'
]);

function normalizedKeyTokens(key: string): string[] {
  return key
    .normalize('NFKC')
    .replace(/([\p{Ll}\p{Nd}])(\p{Lu})/gu, '$1 $2')
    .replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, '$1 $2')
    .normalize('NFKD')
    .replace(/\p{M}+/gu, '')
    .toLocaleLowerCase('en-US')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

export function isSensitiveJsonKey(key: string): boolean {
  const tokens = normalizedKeyTokens(key);
  if (tokens.length === 0) return false;

  const compactKey = tokens.join('');
  if (COMPACT_SENSITIVE_KEYS.has(compactKey)) return true;
  if (SENSITIVE_TERMINAL_TOKENS.has(tokens.at(-1)!)) return true;

  return SENSITIVE_TOKEN_SUFFIXES.some(suffix =>
    suffix.length <= tokens.length
    && suffix.every((token, index) => token === tokens[tokens.length - suffix.length + index])
  );
}

export function httpMethodProfile(method: HttpMethod): HttpMethodProfile {
  return HTTP_PROFILES[method];
}

function valueType(value: unknown): JsonNode['type'] {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value as JsonNode['type'];
}

function displayValue(value: unknown, type: JsonNode['type']): string {
  if (type === 'object') return `{${Object.keys(value as object).length} keys}`;
  if (type === 'array') return `[${(value as unknown[]).length} items]`;
  if (type === 'string') return String(value);
  if (type === 'null') return 'null';
  return String(value);
}

function resolveJsonLimits(overrides: Partial<JsonInspectionLimits>): JsonInspectionLimits {
  const limits = { ...JSON_INPUT_LIMITS, ...overrides };
  if (Object.values(limits).some(limit => !Number.isSafeInteger(limit) || limit < 1)) {
    throw new TypeError('JSON limits must be positive safe integers');
  }
  return limits;
}

/**
 * Reject oversized or excessively nested documents before JSON.parse allocates
 * the corresponding object graph. Brackets inside JSON strings are ignored.
 * Syntax validation remains the responsibility of JSON.parse.
 */
function assertJsonPreParseLimits(input: string, limits: JsonInspectionLimits): void {
  if (new TextEncoder().encode(input).byteLength > limits.maxBytes) {
    throw new JsonInputError('JSON_TOO_MANY_BYTES');
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (const character of input) {
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (character === '\\') {
        escaped = true;
      } else if (character === '"') {
        inString = false;
      }
      continue;
    }

    if (character === '"') {
      inString = true;
    } else if (character === '{' || character === '[') {
      depth += 1;
      if (depth > limits.maxDepth) throw new JsonInputError('JSON_TOO_DEEP');
    } else if ((character === '}' || character === ']') && depth > 0) {
      depth -= 1;
    }
  }
}

interface PendingJsonNode {
  value: unknown;
  path: string;
  depth: number;
  key?: string;
  redact?: boolean;
}

export function inspectJsonDocument(
  input: string,
  limitOverrides: Partial<JsonInspectionLimits> = {}
): JsonInspection {
  const limits = resolveJsonLimits(limitOverrides);
  assertJsonPreParseLimits(input, limits);

  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch {
    throw new JsonInputError('JSON_INVALID');
  }

  const nodes: JsonNode[] = [];
  const sensitivePaths: string[] = [];
  const pending: PendingJsonNode[] = [{ value: parsed, path: '$', depth: 0 }];

  while (pending.length > 0) {
    const current = pending.pop()!;
    const { value, path, depth, key } = current;
    if (depth > limits.maxDepth) throw new JsonInputError('JSON_TOO_DEEP');
    if (nodes.length >= limits.maxNodes) throw new JsonInputError('JSON_TOO_MANY_NODES');
    const type = valueType(value);
    const sensitiveKey = key !== undefined && isSensitiveJsonKey(key);
    const redact = current.redact === true || sensitiveKey;
    nodes.push({ path, type, value: redact ? REDACTED_JSON_VALUE : displayValue(value, type) });
    if (sensitiveKey) sensitivePaths.push(path);

    if (Array.isArray(value)) {
      if (nodes.length + pending.length + value.length > limits.maxNodes) {
        throw new JsonInputError('JSON_TOO_MANY_NODES');
      }
      for (let index = value.length - 1; index >= 0; index -= 1) {
        pending.push({ value: value[index], path: `${path}[${index}]`, depth: depth + 1, redact });
      }
    } else if (value !== null && typeof value === 'object') {
      const entries = Object.entries(value);
      if (nodes.length + pending.length + entries.length > limits.maxNodes) {
        throw new JsonInputError('JSON_TOO_MANY_NODES');
      }
      for (let index = entries.length - 1; index >= 0; index -= 1) {
        const [childKey, item] = entries[index];
        pending.push({
          value: item,
          path: path === '$' ? `$.${childKey}` : `${path}.${childKey}`,
          depth: depth + 1,
          key: childKey,
          redact
        });
      }
    }
  }

  return { nodes, sensitivePaths };
}

export function flattenJsonDocument(input: string, maxNodes = JSON_INPUT_LIMITS.maxNodes): JsonNode[] {
  return inspectJsonDocument(input, { maxNodes }).nodes;
}

export function findSensitiveJsonPaths(input: string, maxNodes = JSON_INPUT_LIMITS.maxNodes): string[] {
  return inspectJsonDocument(input, { maxNodes }).sensitivePaths;
}

export function httpStatusFamily(status: number): 'success' | 'redirect' | 'client-error' | 'server-error' | 'informational' {
  if (!Number.isInteger(status) || status < 100 || status > 599) throw new Error('INVALID_HTTP_STATUS');
  if (status < 200) return 'informational';
  if (status < 300) return 'success';
  if (status < 400) return 'redirect';
  if (status < 500) return 'client-error';
  return 'server-error';
}

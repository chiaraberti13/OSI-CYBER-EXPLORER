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

const HTTP_PROFILES: Readonly<Record<HttpMethod, HttpMethodProfile>> = {
  GET: { crud: 'read', safe: true, idempotent: true, typicalSuccess: [200] },
  POST: { crud: 'create', safe: false, idempotent: false, typicalSuccess: [200, 201, 202] },
  PUT: { crud: 'replace', safe: false, idempotent: true, typicalSuccess: [200, 201, 204] },
  PATCH: { crud: 'partial-update', safe: false, idempotent: false, typicalSuccess: [200, 204] },
  DELETE: { crud: 'delete', safe: false, idempotent: true, typicalSuccess: [200, 202, 204] }
};

const SENSITIVE_KEY = /(?:password|passwd|secret|token|api[_-]?key|community|private[_-]?key|credential)/i;

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

export function flattenJsonDocument(input: string, maxNodes = 200): JsonNode[] {
  const parsed: unknown = JSON.parse(input);
  const nodes: JsonNode[] = [];

  const visit = (value: unknown, path: string, depth: number): void => {
    if (depth > 12) throw new Error('JSON_TOO_DEEP');
    if (nodes.length >= maxNodes) throw new Error('JSON_TOO_LARGE');
    const type = valueType(value);
    nodes.push({ path, type, value: displayValue(value, type) });
    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, `${path}[${index}]`, depth + 1));
    } else if (value !== null && typeof value === 'object') {
      Object.entries(value).forEach(([key, item]) => visit(item, path === '$' ? `$.${key}` : `${path}.${key}`, depth + 1));
    }
  };

  visit(parsed, '$', 0);
  return nodes;
}

export function findSensitiveJsonPaths(input: string): string[] {
  const parsed: unknown = JSON.parse(input);
  const paths: string[] = [];

  const visit = (value: unknown, path: string): void => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, `${path}[${index}]`));
      return;
    }
    if (value === null || typeof value !== 'object') return;
    Object.entries(value).forEach(([key, item]) => {
      const childPath = path === '$' ? `$.${key}` : `${path}.${key}`;
      if (SENSITIVE_KEY.test(key)) paths.push(childPath);
      visit(item, childPath);
    });
  };

  visit(parsed, '$');
  return paths;
}

export function httpStatusFamily(status: number): 'success' | 'redirect' | 'client-error' | 'server-error' | 'informational' {
  if (!Number.isInteger(status) || status < 100 || status > 599) throw new Error('INVALID_HTTP_STATUS');
  if (status < 200) return 'informational';
  if (status < 300) return 'success';
  if (status < 400) return 'redirect';
  if (status < 500) return 'client-error';
  return 'server-error';
}

import { ipv4ToUint, uintToIpv4, wildcardForRange, type WildcardMatch } from './ipv4';
import { parseVlanList } from './networkAccess';

export type InputLanguage = 'it' | 'en';

export type InputValidationCode =
  | 'REQUIRED'
  | 'TOO_LONG'
  | 'CONTROL_CHARACTER'
  | 'INVALID_INTEGER'
  | 'OUT_OF_RANGE'
  | 'INVALID_IPV4'
  | 'INVALID_PREFIX'
  | 'INVALID_RANGE'
  | 'INVALID_VLAN'
  | 'INVALID_VLAN_LIST'
  | 'INVALID_VLAN_RANGE'
  | 'EMPTY_VLAN_LIST'
  | 'INVALID_RESOURCE_PATH'
  | 'JSON_INVALID'
  | 'JSON_TOO_MANY_BYTES'
  | 'JSON_TOO_DEEP'
  | 'JSON_TOO_MANY_NODES'
  | 'INVALID_INPUT';

export class InputValidationError extends Error {
  readonly code: InputValidationCode;

  constructor(code: InputValidationCode) {
    super(code);
    this.name = 'InputValidationError';
    this.code = code;
  }
}

export const INTERACTIVE_INPUT_LIMITS = Object.freeze({
  ipv4Characters: 15,
  numericCharacters: 16,
  resourcePathCharacters: 256,
  vlanListCharacters: 256,
  labelCharacters: 64
});

function hasControlCharacters(value: string): boolean {
  return [...value].some(character => {
    const codePoint = character.codePointAt(0)!;
    return codePoint <= 0x1f || (codePoint >= 0x7f && codePoint <= 0x9f);
  });
}
const KNOWN_CODES = new Set<InputValidationCode>([
  'REQUIRED', 'TOO_LONG', 'CONTROL_CHARACTER', 'INVALID_INTEGER', 'OUT_OF_RANGE',
  'INVALID_IPV4', 'INVALID_PREFIX', 'INVALID_RANGE', 'INVALID_VLAN',
  'INVALID_VLAN_LIST', 'INVALID_VLAN_RANGE', 'EMPTY_VLAN_LIST',
  'INVALID_RESOURCE_PATH', 'JSON_INVALID', 'JSON_TOO_MANY_BYTES', 'JSON_TOO_DEEP',
  'JSON_TOO_MANY_NODES', 'INVALID_INPUT'
]);

const MESSAGES: Record<InputLanguage, Record<InputValidationCode, string>> = {
  it: {
    REQUIRED: 'Il valore è obbligatorio.',
    TOO_LONG: 'Il valore supera la lunghezza massima consentita.',
    CONTROL_CHARACTER: 'I caratteri di controllo non sono consentiti.',
    INVALID_INTEGER: 'Inserisci un numero intero valido.',
    OUT_OF_RANGE: 'Il numero è fuori dall’intervallo consentito.',
    INVALID_IPV4: 'Inserisci un indirizzo IPv4 valido.',
    INVALID_PREFIX: 'Inserisci un prefisso IPv4 valido tra /0 e /32.',
    INVALID_RANGE: 'Il primo indirizzo IPv4 non può essere successivo all’ultimo.',
    INVALID_VLAN: 'La VLAN deve essere un intero compreso tra 1 e 4094.',
    INVALID_VLAN_LIST: 'Usa VLAN o intervalli separati da virgole, ad esempio 10,20-22.',
    INVALID_VLAN_RANGE: 'L’intervallo VLAN non è valido o è invertito.',
    EMPTY_VLAN_LIST: 'Inserisci almeno una VLAN.',
    INVALID_RESOURCE_PATH: 'Inserisci solo un path relativo all’host, ad esempio /api/v1/devices/R1.',
    JSON_INVALID: 'Il documento non è JSON valido.',
    JSON_TOO_MANY_BYTES: 'Il documento JSON supera il limite di 64 KiB.',
    JSON_TOO_DEEP: 'Il documento JSON supera 12 livelli di profondità.',
    JSON_TOO_MANY_NODES: 'Il documento JSON supera il limite di 200 nodi.',
    INVALID_INPUT: 'Controlla il valore inserito.'
  },
  en: {
    REQUIRED: 'This value is required.',
    TOO_LONG: 'The value exceeds the maximum allowed length.',
    CONTROL_CHARACTER: 'Control characters are not allowed.',
    INVALID_INTEGER: 'Enter a valid whole number.',
    OUT_OF_RANGE: 'The number is outside the allowed range.',
    INVALID_IPV4: 'Enter a valid IPv4 address.',
    INVALID_PREFIX: 'Enter a valid IPv4 prefix from /0 to /32.',
    INVALID_RANGE: 'The first IPv4 address cannot come after the last.',
    INVALID_VLAN: 'The VLAN must be a whole number from 1 to 4094.',
    INVALID_VLAN_LIST: 'Use comma-separated VLANs or ranges, for example 10,20-22.',
    INVALID_VLAN_RANGE: 'The VLAN range is invalid or reversed.',
    EMPTY_VLAN_LIST: 'Enter at least one VLAN.',
    INVALID_RESOURCE_PATH: 'Enter only a host-relative path, for example /api/v1/devices/R1.',
    JSON_INVALID: 'The document is not valid JSON.',
    JSON_TOO_MANY_BYTES: 'The JSON document exceeds the 64 KiB limit.',
    JSON_TOO_DEEP: 'The JSON document exceeds 12 levels of nesting.',
    JSON_TOO_MANY_NODES: 'The JSON document exceeds the 200-node limit.',
    INVALID_INPUT: 'Check the value you entered.'
  }
};

export function inputErrorCode(error: unknown): InputValidationCode {
  const candidate = error instanceof InputValidationError
    ? error.code
    : error instanceof Error
      ? error.message
      : '';
  return KNOWN_CODES.has(candidate as InputValidationCode)
    ? candidate as InputValidationCode
    : 'INVALID_INPUT';
}

export function inputErrorMessage(error: unknown, language: InputLanguage): string {
  return MESSAGES[language][inputErrorCode(error)];
}

export function validateTextInput(
  value: string,
  options: { maxLength: number; allowEmpty?: boolean } 
): string {
  if (hasControlCharacters(value)) throw new InputValidationError('CONTROL_CHARACTER');
  const normalized = value.trim();
  if (!options.allowEmpty && normalized.length === 0) throw new InputValidationError('REQUIRED');
  if (normalized.length > options.maxLength) throw new InputValidationError('TOO_LONG');
  return normalized;
}

export function parseBoundedInteger(value: string | number, minimum: number, maximum: number): number {
  const text = validateTextInput(String(value), { maxLength: INTERACTIVE_INPUT_LIMITS.numericCharacters });
  if (!/^-?\d+$/u.test(text)) throw new InputValidationError('INVALID_INTEGER');
  const parsed = Number(text);
  if (!Number.isSafeInteger(parsed)) throw new InputValidationError('INVALID_INTEGER');
  if (parsed < minimum || parsed > maximum) throw new InputValidationError('OUT_OF_RANGE');
  return parsed;
}

export function parseIpv4Address(value: string): string {
  const address = validateTextInput(value, { maxLength: INTERACTIVE_INPUT_LIMITS.ipv4Characters });
  try {
    return uintToIpv4(ipv4ToUint(address));
  } catch {
    throw new InputValidationError('INVALID_IPV4');
  }
}

export function parseIpv4Subnet(address: string, prefix: string | number): { address: string; prefix: number } {
  return {
    address: parseIpv4Address(address),
    prefix: parseBoundedInteger(prefix, 0, 32)
  };
}

export function parseWildcardRange(first: string, last: string): WildcardMatch {
  const normalizedFirst = parseIpv4Address(first);
  const normalizedLast = parseIpv4Address(last);
  try {
    return wildcardForRange(normalizedFirst, normalizedLast);
  } catch {
    throw new InputValidationError('INVALID_RANGE');
  }
}

export function parseVlanId(value: string | number): number {
  const vlan = parseBoundedInteger(value, 1, 4094);
  return vlan;
}

export function parseVlanListInput(value: string): number[] {
  const list = validateTextInput(value, { maxLength: INTERACTIVE_INPUT_LIMITS.vlanListCharacters });
  try {
    return parseVlanList(list);
  } catch (error) {
    const code = inputErrorCode(error);
    if (code === 'INVALID_INPUT') throw new InputValidationError('INVALID_VLAN_LIST');
    throw new InputValidationError(code);
  }
}

export function parseRelativeResourcePath(value: string): string {
  const path = validateTextInput(value, { maxLength: INTERACTIVE_INPUT_LIMITS.resourcePathCharacters });
  if (!path.startsWith('/') || path.startsWith('//') || /[\\?#\s]/u.test(path)) {
    throw new InputValidationError('INVALID_RESOURCE_PATH');
  }

  const rawSegments = path.split('/').slice(1);
  if (rawSegments.some(segment => segment.length === 0) && path !== '/') {
    throw new InputValidationError('INVALID_RESOURCE_PATH');
  }

  for (const segment of rawSegments) {
    if (!/^(?:[A-Za-z0-9._~!$&'()*+,;=:@-]|%[0-9A-Fa-f]{2})*$/u.test(segment)) {
      throw new InputValidationError('INVALID_RESOURCE_PATH');
    }
    let decoded: string;
    try {
      decoded = decodeURIComponent(segment);
    } catch {
      throw new InputValidationError('INVALID_RESOURCE_PATH');
    }
    if (decoded === '.' || decoded === '..' || hasControlCharacters(decoded) || /[\\/]/u.test(decoded)) {
      throw new InputValidationError('INVALID_RESOURCE_PATH');
    }
  }
  return path;
}

export function parseHttpStatus(value: string | number): number {
  return parseBoundedInteger(value, 100, 599);
}

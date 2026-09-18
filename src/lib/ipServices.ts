import { ipv4ToUint, uintToIpv4 } from './ipv4';

export interface PatTranslation {
  insideLocal: string;
  insideGlobal: string;
  protocol: 'tcp' | 'udp';
  preservedPort: boolean;
  /** The port range PAT drew from, because a translated port never leaves its own range. */
  portRange: readonly [number, number];
}

export interface NtpMetrics {
  offsetMs: number;
  delayMs: number;
}

const DSCP_NAMES: Readonly<Record<number, string>> = {
  0: 'BE',
  8: 'CS1',
  10: 'AF11',
  12: 'AF12',
  14: 'AF13',
  16: 'CS2',
  18: 'AF21',
  20: 'AF22',
  22: 'AF23',
  24: 'CS3',
  26: 'AF31',
  28: 'AF32',
  30: 'AF33',
  32: 'CS4',
  34: 'AF41',
  36: 'AF42',
  38: 'AF43',
  40: 'CS5',
  46: 'EF',
  48: 'CS6',
  56: 'CS7'
};

function assertPort(port: number): void {
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('INVALID_PORT');
}

/**
 * PAT keeps a translated port inside the same range as the original one: 1-511,
 * 512-1023, or 1024-65535. It matters operationally — a host sourcing from a
 * well-known port can exhaust its small range while the dynamic range is still empty.
 */
export function patPortRange(port: number): readonly [number, number] {
  assertPort(port);
  if (port < 512) return [1, 511];
  if (port < 1024) return [512, 1023];
  return [1024, 65535];
}

export function createPatTranslation(
  insideIp: string,
  sourcePort: number,
  publicIp: string,
  occupiedPorts: ReadonlySet<number>,
  protocol: 'tcp' | 'udp' = 'tcp'
): PatTranslation {
  ipv4ToUint(insideIp);
  ipv4ToUint(publicIp);
  assertPort(sourcePort);

  const [rangeStart, rangeEnd] = patPortRange(sourcePort);
  let translatedPort = sourcePort;
  if (occupiedPorts.has(translatedPort)) {
    translatedPort = rangeStart;
    while (translatedPort <= rangeEnd && occupiedPorts.has(translatedPort)) translatedPort += 1;
    if (translatedPort > rangeEnd) throw new Error('PAT_PORT_EXHAUSTION');
  }

  return {
    insideLocal: `${uintToIpv4(ipv4ToUint(insideIp))}:${sourcePort}`,
    insideGlobal: `${uintToIpv4(ipv4ToUint(publicIp))}:${translatedPort}`,
    protocol,
    preservedPort: translatedPort === sourcePort,
    portRange: [rangeStart, rangeEnd]
  };
}

export function calculateNtpMetrics(t1: number, t2: number, t3: number, t4: number): NtpMetrics {
  if (![t1, t2, t3, t4].every(Number.isFinite) || t4 < t1 || t3 < t2) throw new Error('INVALID_NTP_TIMESTAMPS');
  return {
    offsetMs: ((t2 - t1) + (t3 - t4)) / 2,
    delayMs: (t4 - t1) - (t3 - t2)
  };
}

export function syslogSeverityName(severity: number): string {
  const names = ['Emergency', 'Alert', 'Critical', 'Error', 'Warning', 'Notice', 'Informational', 'Debugging'];
  if (!Number.isInteger(severity) || severity < 0 || severity > 7) throw new Error('INVALID_SYSLOG_SEVERITY');
  return names[severity];
}

export function isSyslogForwarded(messageSeverity: number, configuredThreshold: number): boolean {
  syslogSeverityName(messageSeverity);
  syslogSeverityName(configuredThreshold);
  return messageSeverity <= configuredThreshold;
}

export function dscpName(codePoint: number): string {
  if (!Number.isInteger(codePoint) || codePoint < 0 || codePoint > 63) throw new Error('INVALID_DSCP');
  return DSCP_NAMES[codePoint] ?? `DSCP ${codePoint}`;
}

export function isDnsCacheValid(cachedAtMs: number, ttlSeconds: number, nowMs: number): boolean {
  if (![cachedAtMs, ttlSeconds, nowMs].every(Number.isFinite) || ttlSeconds < 0 || nowMs < cachedAtMs) {
    throw new Error('INVALID_DNS_CACHE_TIME');
  }
  return nowMs < cachedAtMs + ttlSeconds * 1000;
}

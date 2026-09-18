import { describe, expect, it } from 'vitest';
import {
  calculateNtpMetrics,
  createPatTranslation,
  dscpName,
  isDnsCacheValid,
  isSyslogForwarded,
  patPortRange,
  syslogSeverityName
} from './ipServices';

describe('PAT translations', () => {
  it('preserves a source port when the public tuple is available', () => {
    expect(createPatTranslation('10.0.0.10', 49152, '198.51.100.10', new Set()).insideGlobal).toBe('198.51.100.10:49152');
  });

  it('allocates a different port after a collision', () => {
    const translation = createPatTranslation('10.0.0.11', 49152, '198.51.100.10', new Set([49152, 1024]));
    expect(translation.insideGlobal).toBe('198.51.100.10:1025');
    expect(translation.preservedPort).toBe(false);
    expect(translation.portRange).toEqual([1024, 65535]);
  });

  it('keeps the translated port inside the range of the original one', () => {
    expect(patPortRange(80)).toEqual([1, 511]);
    expect(patPortRange(600)).toEqual([512, 1023]);
    expect(patPortRange(49152)).toEqual([1024, 65535]);

    // A well-known source port is never relocated into the dynamic range.
    const translation = createPatTranslation('10.0.0.12', 443, '198.51.100.10', new Set([443, 1, 2]));
    expect(translation.insideGlobal).toBe('198.51.100.10:3');
    expect(translation.portRange).toEqual([1, 511]);
  });

  it('reports exhaustion of the range instead of leaking into the next one', () => {
    const fullLowRange = new Set(Array.from({ length: 511 }, (_, index) => index + 1));
    expect(() => createPatTranslation('10.0.0.13', 80, '198.51.100.10', fullLowRange)).toThrow('PAT_PORT_EXHAUSTION');
  });
});

describe('NTP timing', () => {
  it('calculates clock offset and round-trip delay from four timestamps', () => {
    expect(calculateNtpMetrics(1000, 1040, 1050, 1090)).toEqual({ offsetMs: 0, delayMs: 80 });
    expect(calculateNtpMetrics(1000, 1050, 1060, 1100)).toEqual({ offsetMs: 5, delayMs: 90 });
  });
});

describe('Syslog filtering', () => {
  it('uses lower numbers for more severe messages', () => {
    expect(syslogSeverityName(0)).toBe('Emergency');
    expect(syslogSeverityName(7)).toBe('Debugging');
    expect(isSyslogForwarded(3, 5)).toBe(true);
    expect(isSyslogForwarded(6, 5)).toBe(false);
  });
});

describe('QoS and DNS helpers', () => {
  it('recognizes standard DSCP code points', () => {
    expect(dscpName(46)).toBe('EF');
    expect(dscpName(34)).toBe('AF41');
    expect(dscpName(0)).toBe('BE');
  });

  it('expires a DNS cache entry at its TTL boundary', () => {
    expect(isDnsCacheValid(1000, 60, 60999)).toBe(true);
    expect(isDnsCacheValid(1000, 60, 61000)).toBe(false);
  });
});

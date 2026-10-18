import { describe, expect, it } from 'vitest';
import { SCAN_CASES, type ScanProtocol, type ScanState } from '../content/scanStates';
import { SCAN_PROTOCOLS, SCAN_STATES, casesForProtocol, findCase } from './scanStates';

/**
 * LAB-01 — integrity of the port-state decoder data and its selectors.
 * Every (protocol, condition) pair must exist exactly once, ids must be unique, every
 * bilingual field must carry both sides, and the selectors must order and resolve cases.
 */

describe('scan-state decoder content', () => {
  it('covers every protocol and state exactly once, with unique ids', () => {
    expect(SCAN_CASES.length).toBe(SCAN_PROTOCOLS.length * SCAN_STATES.length);
    const ids = SCAN_CASES.map((scanCase) => scanCase.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const protocol of SCAN_PROTOCOLS) {
      for (const state of SCAN_STATES) {
        const matches = SCAN_CASES.filter((scanCase) => scanCase.protocol === protocol && scanCase.condition === state);
        expect(matches.length, `${protocol}/${state}`).toBe(1);
      }
    }
  });

  it('fills both languages of every bilingual field', () => {
    for (const scanCase of SCAN_CASES) {
      for (const field of ['probe', 'response', 'deduction', 'defenderNote'] as const) {
        expect(scanCase[field].it.trim(), `${scanCase.id}.${field}.it`).not.toBe('');
        expect(scanCase[field].en.trim(), `${scanCase.id}.${field}.en`).not.toBe('');
      }
    }
  });
});

describe('scan-state decoder selectors', () => {
  it('returns a protocol’s cases in SCAN_STATES order', () => {
    for (const protocol of SCAN_PROTOCOLS as ScanProtocol[]) {
      const cases = casesForProtocol(protocol);
      expect(cases.map((scanCase) => scanCase.condition)).toEqual([...SCAN_STATES]);
      expect(cases.every((scanCase) => scanCase.protocol === protocol)).toBe(true);
    }
  });

  it('resolves a case by protocol and condition, and nothing for an unknown pair', () => {
    expect(findCase('tcp', 'open')?.id).toBe('tcp-open');
    expect(findCase('udp', 'closed')?.id).toBe('udp-closed');
    expect(findCase('tcp', 'nope' as ScanState)).toBeUndefined();
  });
});

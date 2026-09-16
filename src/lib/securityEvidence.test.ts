import { describe, expect, it } from 'vitest';
import { CCNA_DOMAINS } from '../content/ccna';
import { SECURITY_EVIDENCE_CASES } from '../content/securityEvidence';
import type { CcnaDomainId } from '../content/securityCoverage';

describe('operational evidence cases', () => {
  it('provides unique cases across every CCNA domain', () => {
    expect(SECURITY_EVIDENCE_CASES.length).toBeGreaterThanOrEqual(8);
    expect(new Set(SECURITY_EVIDENCE_CASES.map(item => item.id)).size).toBe(SECURITY_EVIDENCE_CASES.length);
    CCNA_DOMAINS.forEach(domain => expect(SECURITY_EVIDENCE_CASES.some(item => item.domains.includes(domain.id as CcnaDomainId))).toBe(true));
  });

  it('keeps every annotation bound to an existing output line', () => {
    SECURITY_EVIDENCE_CASES.forEach(item => item.annotations.forEach(annotation => {
      expect(annotation.line).toBeGreaterThanOrEqual(1);
      expect(annotation.line).toBeLessThanOrEqual(item.output.length);
    }));
  });

  it('provides bilingual interpretation, correlation, and limitations', () => {
    SECURITY_EVIDENCE_CASES.forEach(item => {
      [item.title, item.context, item.limitation, ...item.correlate, ...item.annotations.flatMap(annotation => [annotation.label, annotation.meaning])].forEach(field => {
        expect(field.it.trim().length).toBeGreaterThan(8);
        expect(field.en.trim().length).toBeGreaterThan(8);
      });
      expect(item.correlate.length).toBeGreaterThanOrEqual(2);
      expect(item.annotations.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('includes realistic source and output metadata', () => {
    SECURITY_EVIDENCE_CASES.forEach(item => {
      expect(item.source.length).toBeGreaterThan(2);
      expect(item.command.length).toBeGreaterThan(5);
      expect(item.output.length).toBeGreaterThanOrEqual(5);
    });
  });
});

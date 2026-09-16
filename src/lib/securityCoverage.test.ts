import { describe, expect, it } from 'vitest';
import { CCNA_DOMAINS } from '../content/ccna';
import { SECURITY_TECHNIQUES, type CcnaDomainId } from '../content/securityCoverage';
import { ATTACK_FAMILIES } from '../content/securityTaxonomy';

describe('integrated security coverage catalog', () => {
  it('contains a broad set of unique techniques', () => {
    expect(SECURITY_TECHNIQUES.length).toBeGreaterThanOrEqual(28);
    expect(new Set(SECURITY_TECHNIQUES.map(item => item.id)).size).toBe(SECURITY_TECHNIQUES.length);
  });

  it('references only known attack families and CCNA domains', () => {
    const families = new Set(ATTACK_FAMILIES.map(item => item.id));
    const domains = new Set(CCNA_DOMAINS.map(item => item.id));
    SECURITY_TECHNIQUES.forEach(item => {
      expect(families.has(item.familyId)).toBe(true);
      item.domains.forEach(domain => expect(domains.has(domain)).toBe(true));
    });
  });

  it('covers every CCNA domain with attack and defense content', () => {
    CCNA_DOMAINS.forEach(domain => {
      expect(SECURITY_TECHNIQUES.some(item => item.domains.includes(domain.id as CcnaDomainId))).toBe(true);
    });
  });

  it('covers every declared attack family', () => {
    ATTACK_FAMILIES.forEach(family => {
      expect(SECURITY_TECHNIQUES.some(item => item.familyId === family.id)).toBe(true);
    });
  });

  it('provides bilingual attack, prevention, detection, response, and verification guidance', () => {
    SECURITY_TECHNIQUES.forEach(item => {
      [item.name, item.attack, item.prevent, item.detect, item.respondRecover, item.verify].forEach(field => {
        expect(field.it.trim().length).toBeGreaterThan(8);
        expect(field.en.trim().length).toBeGreaterThan(8);
      });
      expect(item.planes.length).toBeGreaterThan(0);
    });
  });
});

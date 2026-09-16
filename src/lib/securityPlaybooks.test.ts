import { describe, expect, it } from 'vitest';
import { CCNA_DOMAINS } from '../content/ccna';
import { SECURITY_PLAYBOOKS } from '../content/securityPlaybooks';
import { SECURITY_TECHNIQUES, type CcnaDomainId } from '../content/securityCoverage';

describe('security response playbooks', () => {
  it('provides unique playbooks for the principal operational scenarios', () => {
    expect(SECURITY_PLAYBOOKS.length).toBeGreaterThanOrEqual(8);
    expect(new Set(SECURITY_PLAYBOOKS.map(playbook => playbook.id)).size).toBe(SECURITY_PLAYBOOKS.length);
  });

  it('references only known domains and techniques', () => {
    const domains = new Set(CCNA_DOMAINS.map(domain => domain.id));
    const techniques = new Set(SECURITY_TECHNIQUES.map(technique => technique.id));

    SECURITY_PLAYBOOKS.forEach(playbook => {
      playbook.domains.forEach(domain => expect(domains.has(domain)).toBe(true));
      playbook.techniqueIds.forEach(technique => expect(techniques.has(technique)).toBe(true));
    });
  });

  it('connects every CCNA domain to at least one response workflow', () => {
    CCNA_DOMAINS.forEach(domain => {
      expect(SECURITY_PLAYBOOKS.some(playbook => playbook.domains.includes(domain.id as CcnaDomainId))).toBe(true);
    });
  });

  it('includes evidence-first response and validation in both languages', () => {
    SECURITY_PLAYBOOKS.forEach(playbook => {
      [playbook.title, playbook.signal].forEach(field => {
        expect(field.it.trim().length).toBeGreaterThan(8);
        expect(field.en.trim().length).toBeGreaterThan(8);
      });

      [playbook.stabilize, playbook.evidence, playbook.contain, playbook.recover, playbook.validate, playbook.pitfalls]
        .forEach(items => {
          expect(items.length).toBeGreaterThanOrEqual(2);
          items.forEach(item => {
            expect(item.it.trim().length).toBeGreaterThan(20);
            expect(item.en.trim().length).toBeGreaterThan(20);
          });
        });
    });
  });
});

import { describe, expect, it } from 'vitest';
import { IDENTITY_TRUST_SCENARIOS, type IdentityTrustArea } from '../content/identityTrustScenarios';
import { SECURITY_TECHNIQUES } from '../content/securityCoverage';
import { DEFENSE_CONTROLS } from '../content/defenseControls';

describe('identity, AAA, and trust scenarios', () => {
  it('covers every trust area with unique scenarios', () => {
    expect(IDENTITY_TRUST_SCENARIOS.length).toBeGreaterThanOrEqual(9);
    expect(new Set(IDENTITY_TRUST_SCENARIOS.map(item => item.id)).size).toBe(IDENTITY_TRUST_SCENARIOS.length);
    const areas: IdentityTrustArea[] = ['device-admin', 'network-access', 'fallback', 'pki', 'remote-access', 'privilege', 'session', 'lifecycle'];
    areas.forEach(area => expect(IDENTITY_TRUST_SCENARIOS.some(item => item.area === area)).toBe(true));
  });

  it('references known techniques and controls', () => {
    const techniques = new Set(SECURITY_TECHNIQUES.map(item => item.id));
    const controls = new Set(DEFENSE_CONTROLS.map(item => item.id));
    IDENTITY_TRUST_SCENARIOS.forEach(item => {
      item.techniqueIds.forEach(id => expect(techniques.has(id)).toBe(true));
      item.controlIds.forEach(id => expect(controls.has(id)).toBe(true));
      expect(item.domains.length).toBeGreaterThan(0);
      expect(item.planes.length).toBeGreaterThan(0);
    });
  });

  it('provides complete bilingual trust flows and verification', () => {
    IDENTITY_TRUST_SCENARIOS.forEach(item => {
      [item.title, item.failureMode, item.boundary, ...item.trustFlow, ...item.evidence, ...item.controls, ...item.verification].forEach(field => {
        expect(field.it.trim().length).toBeGreaterThan(8);
        expect(field.en.trim().length).toBeGreaterThan(8);
      });
      expect(item.trustFlow.length).toBeGreaterThanOrEqual(3);
      expect(item.evidence.length).toBeGreaterThanOrEqual(2);
      expect(item.controls.length).toBeGreaterThanOrEqual(2);
      expect(item.verification.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('teaches critical AAA and identity distinctions', () => {
    const content = JSON.stringify(IDENTITY_TRUST_SCENARIOS);
    expect(content).toContain('non autentica una persona');
    expect(content).toContain('esplicito reject AAA');
    expect(content).toContain('non revoca automaticamente');
    expect(content).toContain('non rende affidabile un endpoint');
  });
});

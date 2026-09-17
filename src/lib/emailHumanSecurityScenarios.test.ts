import { describe, expect, it } from 'vitest';
import { EMAIL_HUMAN_SECURITY_SCENARIOS, type EmailHumanArea } from '../content/emailHumanSecurityScenarios';
import { SECURITY_TECHNIQUES } from '../content/securityCoverage';
import { DEFENSE_CONTROLS } from '../content/defenseControls';

describe('email, phishing, and human-layer scenarios', () => {
  it('covers every email and human-layer area with unique scenarios', () => {
    expect(EMAIL_HUMAN_SECURITY_SCENARIOS.length).toBeGreaterThanOrEqual(9);
    expect(new Set(EMAIL_HUMAN_SECURITY_SCENARIOS.map(item => item.id)).size).toBe(EMAIL_HUMAN_SECURITY_SCENARIOS.length);
    const areas: EmailHumanArea[] = ['authenticity', 'impersonation', 'credential', 'attachment', 'link', 'bec', 'oauth', 'reporting', 'response'];
    areas.forEach(area => expect(EMAIL_HUMAN_SECURITY_SCENARIOS.some(item => item.area === area)).toBe(true));
  });

  it('references known techniques and controls', () => {
    const techniques = new Set(SECURITY_TECHNIQUES.map(item => item.id));
    const controls = new Set(DEFENSE_CONTROLS.map(item => item.id));
    EMAIL_HUMAN_SECURITY_SCENARIOS.forEach(item => {
      item.techniqueIds.forEach(id => expect(techniques.has(id)).toBe(true));
      item.controlIds.forEach(id => expect(controls.has(id)).toBe(true));
      expect(item.domains.length).toBeGreaterThan(0);
      expect(item.planes.length).toBeGreaterThan(0);
    });
  });

  it('provides complete bilingual delivery paths and proof', () => {
    EMAIL_HUMAN_SECURITY_SCENARIOS.forEach(item => {
      [item.title, item.threat, item.caveat, ...item.deliveryPath, ...item.evidence, ...item.controls, ...item.verification].forEach(field => {
        expect(field.it.trim().length).toBeGreaterThan(8);
        expect(field.en.trim().length).toBeGreaterThan(8);
      });
      expect(item.deliveryPath.length).toBeGreaterThanOrEqual(2);
      expect(item.evidence.length).toBeGreaterThanOrEqual(2);
      expect(item.controls.length).toBeGreaterThanOrEqual(2);
      expect(item.verification.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('preserves critical email-security distinctions', () => {
    const italian = EMAIL_HUMAN_SECURITY_SCENARIOS.flatMap(item => [item.threat.it, item.caveat.it, ...item.deliveryPath.map(value => value.it)]).join(' ');
    expect(italian).toContain('non provano che mittente, account o contenuto siano benigni');
    expect(italian).toContain('DMARC pass non significa identità aziendale verificata');
    expect(italian).toContain('MFA non resistente al phishing può essere aggirata');
    expect(italian).toContain('Revocare la password non elimina un grant OAuth');
  });
});

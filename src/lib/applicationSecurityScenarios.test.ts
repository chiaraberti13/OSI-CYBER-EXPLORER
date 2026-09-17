import { describe, expect, it } from 'vitest';
import { APPLICATION_SECURITY_SCENARIOS, type ApplicationSecurityArea } from '../content/applicationSecurityScenarios';
import { SECURITY_TECHNIQUES } from '../content/securityCoverage';
import { DEFENSE_CONTROLS } from '../content/defenseControls';

describe('DNS, web, and application security scenarios', () => {
  it('covers every application area with unique scenarios', () => {
    expect(APPLICATION_SECURITY_SCENARIOS.length).toBeGreaterThanOrEqual(9);
    expect(new Set(APPLICATION_SECURITY_SCENARIOS.map(item => item.id)).size).toBe(APPLICATION_SECURITY_SCENARIOS.length);
    const areas: ApplicationSecurityArea[] = ['resolution', 'authoritative', 'resolver', 'tunneling', 'tls', 'http', 'injection', 'browser', 'api'];
    areas.forEach(area => expect(APPLICATION_SECURITY_SCENARIOS.some(item => item.area === area)).toBe(true));
  });

  it('references known techniques and controls', () => {
    const techniques = new Set(SECURITY_TECHNIQUES.map(item => item.id));
    const controls = new Set(DEFENSE_CONTROLS.map(item => item.id));
    APPLICATION_SECURITY_SCENARIOS.forEach(item => {
      item.techniqueIds.forEach(id => expect(techniques.has(id)).toBe(true));
      item.controlIds.forEach(id => expect(controls.has(id)).toBe(true));
      expect(item.domains.length).toBeGreaterThan(0);
      expect(item.planes.length).toBeGreaterThan(0);
    });
  });

  it('provides complete bilingual request paths and proof', () => {
    APPLICATION_SECURITY_SCENARIOS.forEach(item => {
      [item.title, item.threat, item.caveat, ...item.requestPath, ...item.evidence, ...item.controls, ...item.verification].forEach(field => {
        expect(field.it.trim().length).toBeGreaterThan(8);
        expect(field.en.trim().length).toBeGreaterThan(8);
      });
      expect(item.requestPath.length).toBeGreaterThanOrEqual(2);
      expect(item.evidence.length).toBeGreaterThanOrEqual(2);
      expect(item.controls.length).toBeGreaterThanOrEqual(2);
      expect(item.verification.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('preserves critical application-security distinctions', () => {
    const italian = APPLICATION_SECURITY_SCENARIOS.flatMap(item => [item.threat.it, item.caveat.it, ...item.requestPath.map(value => value.it)]).join(' ');
    expect(italian).toContain('DNSSEC autentica origine e integrità');
    expect(italian).toContain('non prova che contenuto, account o server applicativo siano benigni');
    expect(italian).toContain('WAF che registra “blocked” non prova');
    expect(italian).toContain('HTTP 200 non provano autorizzazione corretta');
  });
});

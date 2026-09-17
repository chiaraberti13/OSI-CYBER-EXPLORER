import { describe, expect, it } from 'vitest';
import { ENDPOINT_SECURITY_SCENARIOS, type EndpointSecurityArea } from '../content/endpointSecurityScenarios';
import { SECURITY_TECHNIQUES } from '../content/securityCoverage';
import { DEFENSE_CONTROLS } from '../content/defenseControls';

describe('endpoint security and posture scenarios', () => {
  it('covers every endpoint area with unique scenarios', () => {
    expect(ENDPOINT_SECURITY_SCENARIOS.length).toBeGreaterThanOrEqual(9);
    expect(new Set(ENDPOINT_SECURITY_SCENARIOS.map(item => item.id)).size).toBe(ENDPOINT_SECURITY_SCENARIOS.length);
    const areas: EndpointSecurityArea[] = ['inventory', 'baseline', 'patching', 'edr', 'firewall', 'application', 'posture', 'privilege', 'containment'];
    areas.forEach(area => expect(ENDPOINT_SECURITY_SCENARIOS.some(item => item.area === area)).toBe(true));
  });

  it('references known techniques and controls', () => {
    const techniques = new Set(SECURITY_TECHNIQUES.map(item => item.id));
    const controls = new Set(DEFENSE_CONTROLS.map(item => item.id));
    ENDPOINT_SECURITY_SCENARIOS.forEach(item => {
      item.techniqueIds.forEach(id => expect(techniques.has(id)).toBe(true));
      item.controlIds.forEach(id => expect(controls.has(id)).toBe(true));
      expect(item.domains.length).toBeGreaterThan(0);
      expect(item.planes.length).toBeGreaterThan(0);
    });
  });

  it('provides complete bilingual lifecycles and proof', () => {
    ENDPOINT_SECURITY_SCENARIOS.forEach(item => {
      [item.title, item.threat, item.caveat, ...item.lifecycle, ...item.evidence, ...item.controls, ...item.verification].forEach(field => {
        expect(field.it.trim().length).toBeGreaterThan(8);
        expect(field.en.trim().length).toBeGreaterThan(8);
      });
      expect(item.lifecycle.length).toBeGreaterThanOrEqual(2);
      expect(item.evidence.length).toBeGreaterThanOrEqual(2);
      expect(item.controls.length).toBeGreaterThanOrEqual(2);
      expect(item.verification.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('preserves critical endpoint distinctions', () => {
    const italian = ENDPOINT_SECURITY_SCENARIOS.flatMap(item => [item.threat.it, item.caveat.it, ...item.lifecycle.map(value => value.it)]).join(' ');
    expect(italian).toContain('non equivale a proprietà o integrità dimostrate');
    expect(italian).toContain('Patch installata non prova vulnerabilità rimossa');
    expect(italian).toContain('Agente installato o console “healthy” non prova visibilità completa');
    expect(italian).toContain('non dimostra che l’endpoint sia privo di compromissione');
  });
});

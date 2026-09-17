import { describe, expect, it } from 'vitest';
import { ROUTING_SECURITY_SCENARIOS, type RoutingSecurityArea } from '../content/routingSecurityScenarios';
import { SECURITY_TECHNIQUES } from '../content/securityCoverage';
import { DEFENSE_CONTROLS } from '../content/defenseControls';

describe('routing and control-plane security scenarios', () => {
  it('covers every routing security area with unique scenarios', () => {
    expect(ROUTING_SECURITY_SCENARIOS.length).toBeGreaterThanOrEqual(9);
    expect(new Set(ROUTING_SECURITY_SCENARIOS.map(item => item.id)).size).toBe(ROUTING_SECURITY_SCENARIOS.length);
    const areas: RoutingSecurityArea[] = ['ospf', 'redistribution', 'bgp', 'fhrp', 'source-validation', 'copp', 'host-routing', 'forwarding', 'change'];
    areas.forEach(area => expect(ROUTING_SECURITY_SCENARIOS.some(item => item.area === area)).toBe(true));
  });

  it('references known techniques and controls', () => {
    const techniques = new Set(SECURITY_TECHNIQUES.map(item => item.id));
    const controls = new Set(DEFENSE_CONTROLS.map(item => item.id));
    ROUTING_SECURITY_SCENARIOS.forEach(item => {
      item.techniqueIds.forEach(id => expect(techniques.has(id)).toBe(true));
      item.controlIds.forEach(id => expect(controls.has(id)).toBe(true));
      expect(item.domains.length).toBeGreaterThan(0);
      expect(item.planes.length).toBeGreaterThan(0);
    });
  });

  it('provides complete bilingual decisions, evidence, and verification', () => {
    ROUTING_SECURITY_SCENARIOS.forEach(item => {
      [item.title, item.normalDecision, item.threat, item.caveat, ...item.evidence, ...item.controls, ...item.verification].forEach(field => {
        expect(field.it.trim().length).toBeGreaterThan(8);
        expect(field.en.trim().length).toBeGreaterThan(8);
      });
      expect(item.evidence.length).toBeGreaterThanOrEqual(2);
      expect(item.controls.length).toBeGreaterThanOrEqual(2);
      expect(item.verification.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('teaches critical control-plane distinctions', () => {
    const content = JSON.stringify(ROUTING_SECURITY_SCENARIOS);
    expect(content).toContain('non valida l’intero AS_PATH');
    expect(content).toContain('non la capacità del link');
    expect(content).toContain('non l’effettivo inoltro hardware');
    expect(content).toContain('non equivale alla convergenza');
  });
});

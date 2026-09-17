import { describe, expect, it } from 'vitest';
import { AVAILABILITY_SCENARIOS, type AvailabilityArea } from '../content/availabilityScenarios';
import { SECURITY_TECHNIQUES } from '../content/securityCoverage';
import { DEFENSE_CONTROLS } from '../content/defenseControls';

describe('availability, DoS, and capacity scenarios', () => {
  it('covers every availability area with unique scenarios', () => {
    expect(AVAILABILITY_SCENARIOS.length).toBeGreaterThanOrEqual(9);
    expect(new Set(AVAILABILITY_SCENARIOS.map(item => item.id)).size).toBe(AVAILABILITY_SCENARIOS.length);
    const areas: AvailabilityArea[] = ['bandwidth', 'tcp-state', 'reflection', 'control-plane', 'layer2', 'ipv6', 'services', 'nat', 'qos'];
    areas.forEach(area => expect(AVAILABILITY_SCENARIOS.some(item => item.area === area)).toBe(true));
  });

  it('references known techniques and controls', () => {
    const techniques = new Set(SECURITY_TECHNIQUES.map(item => item.id));
    const controls = new Set(DEFENSE_CONTROLS.map(item => item.id));
    AVAILABILITY_SCENARIOS.forEach(item => {
      item.techniqueIds.forEach(id => expect(techniques.has(id)).toBe(true));
      item.controlIds.forEach(id => expect(controls.has(id)).toBe(true));
      expect(item.domains.length).toBeGreaterThan(0);
      expect(item.planes.length).toBeGreaterThan(0);
    });
  });

  it('provides complete bilingual resource diagnosis and proof', () => {
    AVAILABILITY_SCENARIOS.forEach(item => {
      [item.title, item.resource, item.saturationMechanism, item.caveat, ...item.evidence, ...item.controls, ...item.verification].forEach(field => {
        expect(field.it.trim().length).toBeGreaterThan(8);
        expect(field.en.trim().length).toBeGreaterThan(8);
      });
      expect(item.evidence.length).toBeGreaterThanOrEqual(2);
      expect(item.controls.length).toBeGreaterThanOrEqual(2);
      expect(item.verification.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('preserves critical capacity distinctions', () => {
    const italian = AVAILABILITY_SCENARIOS.flatMap(item => [item.resource.it, item.saturationMechanism.it, item.caveat.it, ...item.evidence.map(value => value.it), ...item.controls.map(value => value.it), ...item.verification.map(value => value.it)]).join(' ');
    expect(italian).toContain('non libera un link WAN già saturo');
    expect(italian).toContain('Banda non necessariamente satura');
    expect(italian).toContain('non recupera banda già consumata');
    expect(italian).toContain('QoS gestisce la congestione ma non crea banda');
  });
});

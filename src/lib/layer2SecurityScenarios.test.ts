import { describe, expect, it } from 'vitest';
import { LAYER2_SECURITY_SCENARIOS, type Layer2SecurityArea } from '../content/layer2SecurityScenarios';
import { SECURITY_TECHNIQUES } from '../content/securityCoverage';
import { DEFENSE_CONTROLS } from '../content/defenseControls';

describe('Layer 2 and first-hop security scenarios', () => {
  it('covers every Layer 2 area with unique scenarios', () => {
    expect(LAYER2_SECURITY_SCENARIOS.length).toBeGreaterThanOrEqual(9);
    expect(new Set(LAYER2_SECURITY_SCENARIOS.map(item => item.id)).size).toBe(LAYER2_SECURITY_SCENARIOS.length);
    const areas: Layer2SecurityArea[] = ['physical', 'edge-port', 'cam', 'trunk', 'dhcp', 'arp', 'stp', 'etherchannel', 'containment'];
    areas.forEach(area => expect(LAYER2_SECURITY_SCENARIOS.some(item => item.area === area)).toBe(true));
  });

  it('references known techniques and controls', () => {
    const techniques = new Set(SECURITY_TECHNIQUES.map(item => item.id));
    const controls = new Set(DEFENSE_CONTROLS.map(item => item.id));
    LAYER2_SECURITY_SCENARIOS.forEach(item => {
      item.techniqueIds.forEach(id => expect(techniques.has(id)).toBe(true));
      item.controlIds.forEach(id => expect(controls.has(id)).toBe(true));
      expect(item.domains.length).toBeGreaterThan(0);
      expect(item.planes.length).toBeGreaterThan(0);
    });
  });

  it('provides complete bilingual frame paths and proof', () => {
    LAYER2_SECURITY_SCENARIOS.forEach(item => {
      [item.title, item.threat, item.caveat, ...item.framePath, ...item.evidence, ...item.controls, ...item.verification].forEach(field => {
        expect(field.it.trim().length).toBeGreaterThan(8);
        expect(field.en.trim().length).toBeGreaterThan(8);
      });
      expect(item.framePath.length).toBeGreaterThanOrEqual(2);
      expect(item.evidence.length).toBeGreaterThanOrEqual(2);
      expect(item.controls.length).toBeGreaterThanOrEqual(2);
      expect(item.verification.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('preserves critical Layer 2 distinctions', () => {
    const italian = LAYER2_SECURITY_SCENARIOS.flatMap(item => [item.threat.it, item.caveat.it, ...item.framePath.map(value => value.it)]).join(' ');
    expect(italian).toContain('OUI e profiling descrivono somiglianza, non identità crittografica');
    expect(italian).toContain('DHCP Snooping non protegge host con IP statico automaticamente');
    expect(italian).toContain('BPDU Guard, Root Guard e Loop Guard non sono intercambiabili');
    expect(italian).toContain('Port-channel up non prova che tutti i member inoltrino correttamente');
  });
});

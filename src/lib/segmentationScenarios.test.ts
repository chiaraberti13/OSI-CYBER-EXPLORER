import { describe, expect, it } from 'vitest';
import { SEGMENTATION_SCENARIOS, type SegmentationArea } from '../content/segmentationScenarios';
import { SECURITY_TECHNIQUES } from '../content/securityCoverage';
import { DEFENSE_CONTROLS } from '../content/defenseControls';

describe('segmentation and trust-boundary scenarios', () => {
  it('covers every declared architecture area with unique scenarios', () => {
    expect(SEGMENTATION_SCENARIOS.length).toBeGreaterThanOrEqual(8);
    expect(new Set(SEGMENTATION_SCENARIOS.map(item => item.id)).size).toBe(SEGMENTATION_SCENARIOS.length);
    const areas: SegmentationArea[] = ['layer2', 'routed', 'vrf', 'management', 'edge', 'east-west', 'overlay', 'shared-services'];
    areas.forEach(area => expect(SEGMENTATION_SCENARIOS.some(item => item.area === area)).toBe(true));
  });

  it('references known techniques and controls', () => {
    const techniques = new Set(SECURITY_TECHNIQUES.map(item => item.id));
    const controls = new Set(DEFENSE_CONTROLS.map(item => item.id));
    SEGMENTATION_SCENARIOS.forEach(item => {
      item.techniqueIds.forEach(id => expect(techniques.has(id)).toBe(true));
      item.controlIds.forEach(id => expect(controls.has(id)).toBe(true));
      expect(item.domains.length).toBeGreaterThan(0);
      expect(item.planes.length).toBeGreaterThan(0);
    });
  });

  it('provides a complete bilingual packet-path teaching structure', () => {
    SEGMENTATION_SCENARIOS.forEach(item => {
      [item.title, item.architecture, item.trustFailure, item.limitation, ...item.packetPath, ...item.controls, ...item.verification].forEach(field => {
        expect(field.it.trim().length).toBeGreaterThan(8);
        expect(field.en.trim().length).toBeGreaterThan(8);
      });
      expect(item.packetPath.length).toBeGreaterThanOrEqual(3);
      expect(item.controls.length).toBeGreaterThanOrEqual(2);
      expect(item.verification.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('corrects common segmentation misconceptions', () => {
    const content = JSON.stringify(SEGMENTATION_SCENARIOS);
    expect(content).toContain('dominio di broadcast');
    expect(content).toContain('implicit `deny any`');
    expect(content).toContain('non è realmente out-of-band');
    expect(content).toContain('Un underlay raggiungibile non prova');
  });
});

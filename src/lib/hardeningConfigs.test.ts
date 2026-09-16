import { describe, expect, it } from 'vitest';
import { HARDENING_CONFIGS, type HardeningArea } from '../content/hardeningConfigs';
import { SECURITY_TECHNIQUES } from '../content/securityCoverage';
import { DEFENSE_CONTROLS } from '../content/defenseControls';

describe('configuration hardening catalog', () => {
  it('contains unique scenarios across every operational area', () => {
    const areas: HardeningArea[] = ['layer2', 'routing', 'services', 'management', 'security', 'automation'];
    expect(HARDENING_CONFIGS.length).toBeGreaterThanOrEqual(12);
    expect(new Set(HARDENING_CONFIGS.map(item => item.id)).size).toBe(HARDENING_CONFIGS.length);
    expect(areas.every(area => HARDENING_CONFIGS.some(item => item.area === area))).toBe(true);
  });

  it('references known techniques and defensive controls', () => {
    const techniques = new Set(SECURITY_TECHNIQUES.map(item => item.id));
    const controls = new Set(DEFENSE_CONTROLS.map(item => item.id));
    for (const item of HARDENING_CONFIGS) {
      expect(item.techniqueIds.every(id => techniques.has(id))).toBe(true);
      expect(item.controlIds.every(id => controls.has(id))).toBe(true);
    }
  });

  it('documents configuration, verification, change risk, and rollback', () => {
    for (const item of HARDENING_CONFIGS) {
      expect(item.weakConfig.length).toBeGreaterThan(0);
      expect(item.hardenedConfig.length).toBeGreaterThan(item.weakConfig.length);
      expect(item.verifyCommands.length).toBeGreaterThan(1);
      expect(item.rollback.length).toBeGreaterThan(0);
      expect(['low', 'medium', 'high']).toContain(item.changeRisk);
    }
  });

  it('keeps every explanatory field bilingual', () => {
    const fields = HARDENING_CONFIGS.flatMap(item => [item.title, item.weakReason, item.hardeningReason, item.expectedEvidence, item.changeWarning]);
    expect(fields.every(field => field.it.trim().length > 8 && field.en.trim().length > 8)).toBe(true);
  });
});

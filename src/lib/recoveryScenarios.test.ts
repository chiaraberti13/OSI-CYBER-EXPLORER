import { describe, expect, it } from 'vitest';
import { RECOVERY_SCENARIOS, type RecoveryArea } from '../content/recoveryScenarios';
import { CCNA_DOMAINS } from '../content/ccna';
import { SECURITY_TECHNIQUES } from '../content/securityCoverage';
import { DEFENSE_CONTROLS } from '../content/defenseControls';

describe('resilience and recovery scenarios', () => {
  it('contains unique scenarios across every recovery area and CCNA domain', () => {
    const areas: RecoveryArea[] = ['infrastructure', 'layer2', 'routing', 'services', 'wireless', 'identity', 'trust', 'automation', 'endpoint'];
    expect(RECOVERY_SCENARIOS.length).toBeGreaterThanOrEqual(12);
    expect(new Set(RECOVERY_SCENARIOS.map(item => item.id)).size).toBe(RECOVERY_SCENARIOS.length);
    expect(areas.every(area => RECOVERY_SCENARIOS.some(item => item.area === area))).toBe(true);
    const domains = new Set<string>(RECOVERY_SCENARIOS.flatMap(item => item.domains));
    expect(CCNA_DOMAINS.every(item => domains.has(item.id))).toBe(true);
  });

  it('references known techniques and controls', () => {
    const techniques = new Set(SECURITY_TECHNIQUES.map(item => item.id));
    const controls = new Set(DEFENSE_CONTROLS.map(item => item.id));
    for (const item of RECOVERY_SCENARIOS) {
      expect(item.techniqueIds.every(id => techniques.has(id))).toBe(true);
      expect(item.controlIds.every(id => controls.has(id))).toBe(true);
    }
  });

  it('defines ordered recovery, stop conditions, and independent validation', () => {
    for (const item of RECOVERY_SCENARIOS) {
      expect(item.dependencies.length).toBeGreaterThanOrEqual(2);
      expect(item.recoverySteps.length).toBeGreaterThanOrEqual(4);
      expect(item.stopConditions.length).toBeGreaterThanOrEqual(2);
      expect(item.validation.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('keeps every learner-facing field bilingual', () => {
    const fields = RECOVERY_SCENARIOS.flatMap(item => [item.title, item.trigger, item.minimumContinuity, item.residualRisk, ...item.dependencies, ...item.recoverySteps, ...item.stopConditions, ...item.validation]);
    expect(fields.every(field => field.it.trim().length > 8 && field.en.trim().length > 8)).toBe(true);
  });
});

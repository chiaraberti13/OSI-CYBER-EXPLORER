import { describe, expect, it } from 'vitest';
import { ATTACK_PATHS } from '../content/attackPaths';
import { ATTACK_FAMILIES } from '../content/securityTaxonomy';
import { SECURITY_TECHNIQUES } from '../content/securityCoverage';
import { DEFENSE_CONTROLS } from '../content/defenseControls';

describe('attack paths', () => {
  it('provides unique multi-stage paths', () => {
    expect(ATTACK_PATHS.length).toBeGreaterThanOrEqual(8);
    expect(new Set(ATTACK_PATHS.map(path => path.id)).size).toBe(ATTACK_PATHS.length);
    expect(ATTACK_PATHS.every(path => path.stages.length >= 4)).toBe(true);
  });

  it('covers every attack family', () => {
    const covered = new Set(ATTACK_PATHS.flatMap(path => path.familyIds));
    expect(ATTACK_FAMILIES.every(family => covered.has(family.id))).toBe(true);
  });

  it('references known techniques and controls', () => {
    const techniqueIds = new Set(SECURITY_TECHNIQUES.map(item => item.id));
    const controlIds = new Set(DEFENSE_CONTROLS.map(item => item.id));
    for (const stage of ATTACK_PATHS.flatMap(path => path.stages)) {
      expect(stage.techniqueIds.every(id => techniqueIds.has(id))).toBe(true);
      expect(stage.defenseControlIds.every(id => controlIds.has(id))).toBe(true);
    }
  });

  it('keeps all learner-facing content bilingual', () => {
    const bilingual = ATTACK_PATHS.flatMap(path => [path.title, path.context, path.impact, ...path.stages.flatMap(stage => [stage.title, stage.objective, stage.observable, stage.validation])]);
    expect(bilingual.every(item => item.it.trim().length > 0 && item.en.trim().length > 0)).toBe(true);
  });
});

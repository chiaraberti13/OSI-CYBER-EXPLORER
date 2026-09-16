import { describe, expect, it } from 'vitest';
import { DEFENSE_CONTROLS, type DefenseFunction } from '../content/defenseControls';
import { SECURITY_TECHNIQUES } from '../content/securityCoverage';
import type { SecurityPlane } from '../content/securityTaxonomy';

describe('defensive control catalog', () => {
  it('contains unique controls', () => {
    expect(DEFENSE_CONTROLS.length).toBeGreaterThanOrEqual(12);
    expect(new Set(DEFENSE_CONTROLS.map(item => item.id)).size).toBe(DEFENSE_CONTROLS.length);
  });
  it('covers every defensive function and security plane', () => {
    const functions: DefenseFunction[] = ['prevent', 'detect', 'contain', 'recover', 'compensate'];
    const planes: SecurityPlane[] = ['physical', 'data', 'control', 'management', 'application', 'identity'];
    functions.forEach(fn => expect(DEFENSE_CONTROLS.some(item => item.functions.includes(fn))).toBe(true));
    planes.forEach(plane => expect(DEFENSE_CONTROLS.some(item => item.planes.includes(plane))).toBe(true));
  });
  it('references only known attack techniques', () => {
    const techniques = new Set(SECURITY_TECHNIQUES.map(item => item.id));
    DEFENSE_CONTROLS.forEach(control => control.techniqueIds.forEach(id => expect(techniques.has(id)).toBe(true)));
  });
  it('documents enforcement, dependencies, verification, and limits bilingually', () => {
    DEFENSE_CONTROLS.forEach(control => [control.name, control.enforcement, control.dependsOn, control.verify, control.limitation].forEach(field => {
      expect(field.it.trim().length).toBeGreaterThan(8);
      expect(field.en.trim().length).toBeGreaterThan(8);
    }));
  });
});

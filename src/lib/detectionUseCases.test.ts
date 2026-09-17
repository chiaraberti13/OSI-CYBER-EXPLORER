import { describe, expect, it } from 'vitest';
import { DETECTION_USE_CASES } from '../content/detectionUseCases';
import { ATTACK_FAMILIES, type SecurityPlane } from '../content/securityTaxonomy';
import { SECURITY_TECHNIQUES } from '../content/securityCoverage';
import { SECURITY_EVIDENCE_CASES } from '../content/securityEvidence';

describe('detection engineering use cases', () => {
  it('contains unique use cases and covers every family and plane', () => {
    const planes: SecurityPlane[] = ['physical', 'data', 'control', 'management', 'application', 'identity'];
    expect(DETECTION_USE_CASES.length).toBeGreaterThanOrEqual(12);
    expect(new Set(DETECTION_USE_CASES.map(item => item.id)).size).toBe(DETECTION_USE_CASES.length);
    const families = new Set(DETECTION_USE_CASES.flatMap(item => item.familyIds));
    const coveredPlanes = new Set(DETECTION_USE_CASES.flatMap(item => item.planes));
    expect(ATTACK_FAMILIES.every(item => families.has(item.id))).toBe(true);
    expect(planes.every(item => coveredPlanes.has(item))).toBe(true);
  });

  it('references known techniques and evidence', () => {
    const techniques = new Set(SECURITY_TECHNIQUES.map(item => item.id));
    const evidence = new Set(SECURITY_EVIDENCE_CASES.map(item => item.id));
    for (const item of DETECTION_USE_CASES) {
      expect(item.techniqueIds.every(id => techniques.has(id))).toBe(true);
      expect(item.evidenceIds.every(id => evidence.has(id))).toBe(true);
    }
  });

  it('includes multiple telemetry sources, benign causes, and validation steps', () => {
    for (const item of DETECTION_USE_CASES) {
      expect(item.telemetry.length).toBeGreaterThanOrEqual(2);
      expect(item.benignCauses.length).toBeGreaterThanOrEqual(2);
      expect(item.validation.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('keeps all explanatory content bilingual', () => {
    const fields = DETECTION_USE_CASES.flatMap(item => [item.title, item.detectionLogic, item.correlation, item.firstResponse, item.limitation, ...item.telemetry, ...item.benignCauses, ...item.validation]);
    expect(fields.every(field => field.it.trim().length > 8 && field.en.trim().length > 8)).toBe(true);
  });
});

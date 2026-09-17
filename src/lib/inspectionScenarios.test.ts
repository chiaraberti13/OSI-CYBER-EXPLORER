import { describe, expect, it } from 'vitest';
import { INSPECTION_SCENARIOS, type InspectionArea } from '../content/inspectionScenarios';
import { SECURITY_TECHNIQUES } from '../content/securityCoverage';
import { DEFENSE_CONTROLS } from '../content/defenseControls';

describe('firewall, IDS/IPS, and inspection scenarios', () => {
  it('covers every inspection area with unique scenarios', () => {
    expect(INSPECTION_SCENARIOS.length).toBeGreaterThanOrEqual(9);
    expect(new Set(INSPECTION_SCENARIOS.map(item => item.id)).size).toBe(INSPECTION_SCENARIOS.length);
    const areas: InspectionArea[] = ['policy', 'state', 'nat', 'ids-ips', 'tuning', 'encrypted', 'evasion', 'ha', 'logging'];
    areas.forEach(area => expect(INSPECTION_SCENARIOS.some(item => item.area === area)).toBe(true));
  });

  it('references known techniques and controls', () => {
    const techniques = new Set(SECURITY_TECHNIQUES.map(item => item.id));
    const controls = new Set(DEFENSE_CONTROLS.map(item => item.id));
    INSPECTION_SCENARIOS.forEach(item => {
      item.techniqueIds.forEach(id => expect(techniques.has(id)).toBe(true));
      item.controlIds.forEach(id => expect(controls.has(id)).toBe(true));
      expect(item.domains.length).toBeGreaterThan(0);
      expect(item.planes.length).toBeGreaterThan(0);
    });
  });

  it('provides complete bilingual inspection paths and proof', () => {
    INSPECTION_SCENARIOS.forEach(item => {
      [item.title, item.threat, item.caveat, ...item.inspectionPath, ...item.evidence, ...item.controls, ...item.verification].forEach(field => {
        expect(field.it.trim().length).toBeGreaterThan(8);
        expect(field.en.trim().length).toBeGreaterThan(8);
      });
      expect(item.inspectionPath.length).toBeGreaterThanOrEqual(2);
      expect(item.evidence.length).toBeGreaterThanOrEqual(2);
      expect(item.controls.length).toBeGreaterThanOrEqual(2);
      expect(item.verification.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('preserves critical inspection distinctions', () => {
    const italian = INSPECTION_SCENARIOS.flatMap(item => [item.threat.it, item.caveat.it, ...item.inspectionPath.map(value => value.it)]).join(' ');
    expect(italian).toContain('NAT modifica indirizzi o porte');
    expect(italian).toContain('Un alert IDS dimostra rilevamento, non blocco');
    expect(italian).toContain('La cifratura protegge il contenuto ma non rende il flusso benigno');
    expect(italian).toContain('Assenza di log non prova assenza di traffico');
  });
});

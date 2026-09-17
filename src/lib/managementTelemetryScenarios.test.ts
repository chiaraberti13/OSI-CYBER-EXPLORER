import { describe, expect, it } from 'vitest';
import { MANAGEMENT_TELEMETRY_SCENARIOS, type ManagementTelemetryArea } from '../content/managementTelemetryScenarios';
import { SECURITY_TECHNIQUES } from '../content/securityCoverage';
import { DEFENSE_CONTROLS } from '../content/defenseControls';

describe('management-plane and telemetry scenarios', () => {
  it('covers every management and telemetry area with unique scenarios', () => {
    expect(MANAGEMENT_TELEMETRY_SCENARIOS.length).toBeGreaterThanOrEqual(9);
    expect(new Set(MANAGEMENT_TELEMETRY_SCENARIOS.map(item => item.id)).size).toBe(MANAGEMENT_TELEMETRY_SCENARIOS.length);
    const areas: ManagementTelemetryArea[] = ['boundary', 'ssh', 'snmp', 'syslog', 'time', 'api', 'discovery', 'backup', 'collectors'];
    areas.forEach(area => expect(MANAGEMENT_TELEMETRY_SCENARIOS.some(item => item.area === area)).toBe(true));
  });

  it('references known techniques and controls', () => {
    const techniques = new Set(SECURITY_TECHNIQUES.map(item => item.id));
    const controls = new Set(DEFENSE_CONTROLS.map(item => item.id));
    MANAGEMENT_TELEMETRY_SCENARIOS.forEach(item => {
      item.techniqueIds.forEach(id => expect(techniques.has(id)).toBe(true));
      item.controlIds.forEach(id => expect(controls.has(id)).toBe(true));
      expect(item.domains.length).toBeGreaterThan(0);
      expect(item.planes.length).toBeGreaterThan(0);
    });
  });

  it('provides complete bilingual trust paths and proof', () => {
    MANAGEMENT_TELEMETRY_SCENARIOS.forEach(item => {
      [item.title, item.threat, item.caveat, ...item.trustPath, ...item.evidence, ...item.controls, ...item.verification].forEach(field => {
        expect(field.it.trim().length).toBeGreaterThan(8);
        expect(field.en.trim().length).toBeGreaterThan(8);
      });
      expect(item.trustPath.length).toBeGreaterThanOrEqual(2);
      expect(item.evidence.length).toBeGreaterThanOrEqual(2);
      expect(item.controls.length).toBeGreaterThanOrEqual(2);
      expect(item.verification.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('preserves critical management and telemetry distinctions', () => {
    const italian = MANAGEMENT_TELEMETRY_SCENARIOS.flatMap(item => [item.threat.it, item.caveat.it, ...item.trustPath.map(value => value.it)]).join(' ');
    expect(italian).toContain('non equivale automaticamente a una rete OOB fisica');
    expect(italian).toContain('non prova autorizzazione e accounting');
    expect(italian).toContain('non dimostra che nessun evento sia andato perso');
    expect(italian).toContain('non prova che il restore sia corretto');
  });
});

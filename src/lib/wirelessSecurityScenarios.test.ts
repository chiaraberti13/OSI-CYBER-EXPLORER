import { describe, expect, it } from 'vitest';
import { WIRELESS_SECURITY_SCENARIOS, type WirelessSecurityArea } from '../content/wirelessSecurityScenarios';
import { SECURITY_TECHNIQUES } from '../content/securityCoverage';
import { DEFENSE_CONTROLS } from '../content/defenseControls';

describe('wireless and RF security scenarios', () => {
  it('covers every wireless security area with unique scenarios', () => {
    expect(WIRELESS_SECURITY_SCENARIOS.length).toBeGreaterThanOrEqual(9);
    expect(new Set(WIRELESS_SECURITY_SCENARIOS.map(item => item.id)).size).toBe(WIRELESS_SECURITY_SCENARIOS.length);
    const areas: WirelessSecurityArea[] = ['rf', 'rogue', 'evil-twin', 'management-frames', 'personal', 'transition', 'enterprise', 'infrastructure', 'guest'];
    areas.forEach(area => expect(WIRELESS_SECURITY_SCENARIOS.some(item => item.area === area)).toBe(true));
  });

  it('references known techniques and controls', () => {
    const techniques = new Set(SECURITY_TECHNIQUES.map(item => item.id));
    const controls = new Set(DEFENSE_CONTROLS.map(item => item.id));
    WIRELESS_SECURITY_SCENARIOS.forEach(item => {
      item.techniqueIds.forEach(id => expect(techniques.has(id)).toBe(true));
      item.controlIds.forEach(id => expect(controls.has(id)).toBe(true));
      expect(item.domains.length).toBeGreaterThan(0);
      expect(item.planes.length).toBeGreaterThan(0);
    });
  });

  it('provides complete bilingual evidence and verification', () => {
    WIRELESS_SECURITY_SCENARIOS.forEach(item => {
      [item.title, item.normalBehavior, item.threat, item.caveat, ...item.evidence, ...item.controls, ...item.verification].forEach(field => {
        expect(field.it.trim().length).toBeGreaterThan(8);
        expect(field.en.trim().length).toBeGreaterThan(8);
      });
      expect(item.evidence.length).toBeGreaterThanOrEqual(2);
      expect(item.controls.length).toBeGreaterThanOrEqual(2);
      expect(item.verification.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('preserves critical wireless distinctions', () => {
    const italian = WIRELESS_SECURITY_SCENARIOS.flatMap(item => [item.normalBehavior.it, item.threat.it, item.caveat.it]).join(' ');
    expect(italian).toContain('non provano jamming');
    expect(italian).toContain('non un’identità crittografica');
    expect(italian).toContain('non prova che ogni client stia usando WPA3');
    expect(italian).toContain('non cifra da solo');
  });
});

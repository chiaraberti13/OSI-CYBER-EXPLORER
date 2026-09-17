import { describe, expect, it } from 'vitest';
import { VPN_PKI_SCENARIOS, type VpnPkiArea } from '../content/vpnPkiScenarios';
import { SECURITY_TECHNIQUES } from '../content/securityCoverage';
import { DEFENSE_CONTROLS } from '../content/defenseControls';

describe('VPN, IPsec, and PKI security scenarios', () => {
  it('covers every VPN and PKI area with unique scenarios', () => {
    expect(VPN_PKI_SCENARIOS.length).toBeGreaterThanOrEqual(9);
    expect(new Set(VPN_PKI_SCENARIOS.map(item => item.id)).size).toBe(VPN_PKI_SCENARIOS.length);
    const areas: VpnPkiArea[] = ['negotiation', 'sa', 'peer-auth', 'nat-traversal', 'selectors', 'routing', 'remote-access', 'rekey-replay', 'lifecycle'];
    areas.forEach(area => expect(VPN_PKI_SCENARIOS.some(item => item.area === area)).toBe(true));
  });

  it('references known techniques and controls', () => {
    const techniques = new Set(SECURITY_TECHNIQUES.map(item => item.id));
    const controls = new Set(DEFENSE_CONTROLS.map(item => item.id));
    VPN_PKI_SCENARIOS.forEach(item => {
      item.techniqueIds.forEach(id => expect(techniques.has(id)).toBe(true));
      item.controlIds.forEach(id => expect(controls.has(id)).toBe(true));
      expect(item.domains.length).toBeGreaterThan(0);
      expect(item.planes.length).toBeGreaterThan(0);
    });
  });

  it('provides complete bilingual protocol flows and proof', () => {
    VPN_PKI_SCENARIOS.forEach(item => {
      [item.title, item.threat, item.caveat, ...item.packetFlow, ...item.evidence, ...item.controls, ...item.verification].forEach(field => {
        expect(field.it.trim().length).toBeGreaterThan(8);
        expect(field.en.trim().length).toBeGreaterThan(8);
      });
      expect(item.packetFlow.length).toBeGreaterThanOrEqual(2);
      expect(item.evidence.length).toBeGreaterThanOrEqual(2);
      expect(item.controls.length).toBeGreaterThanOrEqual(2);
      expect(item.verification.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('preserves critical VPN and PKI distinctions', () => {
    const italian = VPN_PKI_SCENARIOS.flatMap(item => [item.threat.it, item.caveat.it, ...item.packetFlow.map(step => step.it)]).join(' ');
    expect(italian).toContain('IKE SA in stato UP');
    expect(italian).toContain('UDP/4500 indica NAT traversal');
    expect(italian).toContain('Cifrare un prefisso non lo autorizza automaticamente');
    expect(italian).toContain('Revocare un certificato non chiude necessariamente una SA già attiva');
  });
});

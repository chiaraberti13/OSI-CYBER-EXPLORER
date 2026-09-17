import { describe, expect, it } from 'vitest';
import { IPV6_SECURITY_SCENARIOS, type Ipv6SecurityTopic } from '../content/ipv6Security';
import { SECURITY_TECHNIQUES } from '../content/securityCoverage';
import { DEFENSE_CONTROLS } from '../content/defenseControls';

describe('IPv6 and dual-stack security scenarios', () => {
  it('covers the essential IPv6 security topics with unique scenarios', () => {
    expect(IPV6_SECURITY_SCENARIOS.length).toBeGreaterThanOrEqual(8);
    expect(new Set(IPV6_SECURITY_SCENARIOS.map(item => item.id)).size).toBe(IPV6_SECURITY_SCENARIOS.length);
    const topics: Ipv6SecurityTopic[] = ['first-hop', 'control', 'evasion', 'transition', 'dual-stack'];
    topics.forEach(topic => expect(IPV6_SECURITY_SCENARIOS.some(item => item.topic === topic)).toBe(true));
  });

  it('references known attack techniques and defense controls', () => {
    const techniques = new Set(SECURITY_TECHNIQUES.map(item => item.id));
    const controls = new Set(DEFENSE_CONTROLS.map(item => item.id));
    IPV6_SECURITY_SCENARIOS.forEach(item => {
      item.techniqueIds.forEach(id => expect(techniques.has(id)).toBe(true));
      item.controlIds.forEach(id => expect(controls.has(id)).toBe(true));
      expect(item.planes.length).toBeGreaterThan(0);
      expect(item.domains.length).toBeGreaterThan(0);
    });
  });

  it('provides complete bilingual teaching and verification content', () => {
    IPV6_SECURITY_SCENARIOS.forEach(item => {
      [item.title, item.normalBehavior, item.threat, item.pitfall, ...item.evidence, ...item.controls, ...item.verification].forEach(field => {
        expect(field.it.trim().length).toBeGreaterThan(8);
        expect(field.en.trim().length).toBeGreaterThan(8);
      });
      expect(item.evidence.length).toBeGreaterThanOrEqual(2);
      expect(item.controls.length).toBeGreaterThanOrEqual(2);
      expect(item.verification.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('teaches the two critical IPv6 operational distinctions', () => {
    const content = JSON.stringify(IPV6_SECURITY_SCENARIOS);
    expect(content).toContain('default gateway');
    expect(content).toContain('Packet Too Big');
    expect(content).toContain('non frammentano');
    expect(content).toContain('NAT non è un controllo');
  });
});

import { describe, expect, it } from 'vitest';
import { DEVICE_REGISTRY } from '../content/deviceRegistry';
import { PORT_REGISTRY } from '../content/portContent';
import { PROTOCOL_REGISTRY } from '../content/protocolRegistry';
import { filterDevices, filterPorts, filterProtocols, shuffled } from './portsFilter';

describe('portsFilter', () => {
  it('returns every entry when no filter is applied', () => {
    expect(filterPorts(PORT_REGISTRY, 'all', '', 'en')).toHaveLength(PORT_REGISTRY.length);
    expect(filterProtocols(PROTOCOL_REGISTRY, '', 'en')).toHaveLength(PROTOCOL_REGISTRY.length);
    expect(filterDevices(DEVICE_REGISTRY, 'all', '', 'en')).toHaveLength(DEVICE_REGISTRY.length);
  });

  it('filters ports by range and by search term', () => {
    const wellKnown = filterPorts(PORT_REGISTRY, 'well-known', '', 'en');
    expect(wellKnown.length).toBeGreaterThan(0);
    expect(wellKnown.every(p => p.range === 'well-known')).toBe(true);

    const https = filterPorts(PORT_REGISTRY, 'all', '443', 'it');
    expect(https.some(p => p.ports.join(' / ').includes('443'))).toBe(true);
    expect(filterPorts(PORT_REGISTRY, 'all', 'zzz-no-match-zzz', 'en')).toEqual([]);
  });

  it('matches protocols case-insensitively', () => {
    const first = PROTOCOL_REGISTRY[0]!;
    const hits = filterProtocols(PROTOCOL_REGISTRY, first.name.toUpperCase(), 'en');
    expect(hits).toContain(first);
  });

  it('filters devices by category', () => {
    const security = filterDevices(DEVICE_REGISTRY, 'security', '', 'en');
    expect(security.length).toBeGreaterThan(0);
    expect(security.every(d => d.category === 'security')).toBe(true);
  });

  it('keeps registry invariants: unique protocol and device names', () => {
    expect(new Set(PROTOCOL_REGISTRY.map(p => p.name)).size).toBe(PROTOCOL_REGISTRY.length);
    expect(new Set(DEVICE_REGISTRY.map(d => d.name)).size).toBe(DEVICE_REGISTRY.length);
  });

  it('shuffles without mutating the source', () => {
    const src = [1, 2, 3, 4];
    const out = shuffled(src, () => 0.1);
    expect([...out].sort()).toEqual(src);
    expect(src).toEqual([1, 2, 3, 4]);
  });
});

import { describe, expect, it } from 'vitest';
import { DEVICE_REGISTRY } from '../content/deviceRegistry';
import { deviceLayerLabel } from './deviceLabels';
import { filterDevices } from './portsFilter';

describe('device layer labels and search', () => {
  it('preserves English labels and technical layer numbers', () => {
    for (const device of DEVICE_REGISTRY) {
      expect(deviceLayerLabel(device.layer, 'en')).toBe(device.layer);
      expect(deviceLayerLabel(device.layer, 'it').match(/\d+/g)).toEqual(device.layer.match(/\d+/g));
      expect(deviceLayerLabel(device.layer, 'it')).not.toMatch(
        /\b(?:Layer|Network|Application|Physical|Transport|Session|Presentation|Data Link)\b/
      );
    }
  });

  it('finds the localized layer text that the user can see', () => {
    const expected = DEVICE_REGISTRY.filter((device) => device.layer.includes('Operating System'));
    expect(filterDevices(DEVICE_REGISTRY, 'all', 'sistema operativo', 'it')).toEqual(expect.arrayContaining(expected));
    expect(filterDevices(DEVICE_REGISTRY, 'all', 'operating system', 'en')).toEqual(expect.arrayContaining(expected));
    expect(filterDevices(DEVICE_REGISTRY, 'all', 'operating system', 'it')).toEqual([]);
  });
});

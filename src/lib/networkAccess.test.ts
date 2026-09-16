import { describe, expect, it } from 'vitest';
import {
  electRootBridge,
  evaluateTrunkFrame,
  isEtherChannelCompatible,
  parseVlanList
} from './networkAccess';

describe('VLAN and 802.1Q trunk logic', () => {
  it('parses ranges, sorts VLANs, and removes duplicates', () => {
    expect(parseVlanList('30,10,20-22,20')).toEqual([10, 20, 21, 22, 30]);
  });

  it('rejects reserved VLAN identifiers and inverted ranges', () => {
    expect(() => parseVlanList('0,10')).toThrow('INVALID_VLAN');
    expect(() => parseVlanList('4095')).toThrow('INVALID_VLAN');
    expect(() => parseVlanList('30-20')).toThrow('INVALID_VLAN_RANGE');
  });

  it('distinguishes tagged, native, and pruned traffic', () => {
    expect(evaluateTrunkFrame(20, 99, [10, 20, 99])).toEqual({ forwarded: true, tagged: true, reason: 'allowed-tagged' });
    expect(evaluateTrunkFrame(99, 99, [10, 20, 99])).toEqual({ forwarded: true, tagged: false, reason: 'native-untagged' });
    expect(evaluateTrunkFrame(30, 99, [10, 20, 99])).toEqual({ forwarded: false, tagged: false, reason: 'not-allowed' });
  });
});

describe('STP root bridge election', () => {
  it('elects the lowest priority before comparing MAC addresses', () => {
    const root = electRootBridge([
      { id: 'SW1', priority: 32768, mac: '00:11:22:33:44:01' },
      { id: 'SW2', priority: 24576, mac: '00:11:22:33:44:ff' }
    ]);
    expect(root.id).toBe('SW2');
  });

  it('uses the lowest MAC as the tie-breaker', () => {
    const root = electRootBridge([
      { id: 'SW1', priority: 32768, mac: '00:11:22:33:44:02' },
      { id: 'SW2', priority: 32768, mac: '00:11:22:33:44:01' }
    ]);
    expect(root.id).toBe('SW2');
  });
});

describe('EtherChannel negotiation', () => {
  it('models valid LACP, PAgP, and static combinations', () => {
    expect(isEtherChannelCompatible('active', 'passive')).toBe(true);
    expect(isEtherChannelCompatible('passive', 'passive')).toBe(false);
    expect(isEtherChannelCompatible('desirable', 'auto')).toBe(true);
    expect(isEtherChannelCompatible('auto', 'auto')).toBe(false);
    expect(isEtherChannelCompatible('on', 'on')).toBe(true);
    expect(isEtherChannelCompatible('active', 'desirable')).toBe(false);
  });
});

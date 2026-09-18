import { describe, expect, it } from 'vitest';
import {
  electRootBridge,
  evaluateTrunkFrame,
  isEtherChannelCompatible,
  parseVlanList,
  STP_LONG_PATH_COST,
  STP_SHORT_METHOD_CEILING,
  STP_SHORT_PATH_COST
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

describe('STP path costs', () => {
  it('keeps the 802.1D-1998 short values', () => {
    expect(STP_SHORT_PATH_COST).toEqual({ '10 Mb/s': 100, '100 Mb/s': 19, '1 Gb/s': 4, '10 Gb/s': 2 });
  });

  it('exposes long values that still rank links apart above the short-method ceiling', () => {
    expect(STP_SHORT_METHOD_CEILING).toBe('10 Gb/s');
    expect(STP_SHORT_PATH_COST[STP_SHORT_METHOD_CEILING]).toBe(2);

    // The short method has nothing left to give beyond its ceiling; the long one has.
    expect(Object.keys(STP_SHORT_PATH_COST)).not.toContain('100 Gb/s');
    expect(STP_LONG_PATH_COST['100 Gb/s']).toBe(200);
    expect(STP_LONG_PATH_COST['1 Tb/s']).toBe(20);

    const longCosts = Object.values(STP_LONG_PATH_COST);
    const strictlyDecreasing = longCosts.every((cost, index) => index === 0 || cost < longCosts[index - 1]);
    expect(strictlyDecreasing).toBe(true);
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

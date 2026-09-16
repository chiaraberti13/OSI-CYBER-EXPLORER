export type EtherChannelMode = 'active' | 'passive' | 'desirable' | 'auto' | 'on';

export interface BridgeCandidate {
  id: string;
  priority: number;
  mac: string;
}

export interface TrunkFrameResult {
  forwarded: boolean;
  tagged: boolean;
  reason: 'allowed-tagged' | 'native-untagged' | 'not-allowed';
}

const VLAN_MIN = 1;
const VLAN_MAX = 4094;
const MAC_PATTERN = /^(?:[0-9a-fA-F]{2}[:-]){5}[0-9a-fA-F]{2}$|^[0-9a-fA-F]{4}(?:\.[0-9a-fA-F]{4}){2}$/;

export function isValidVlan(vlan: number): boolean {
  return Number.isInteger(vlan) && vlan >= VLAN_MIN && vlan <= VLAN_MAX;
}

export function parseVlanList(input: string): number[] {
  const vlans = new Set<number>();
  const tokens = input.split(',').map(token => token.trim()).filter(Boolean);
  if (tokens.length === 0) throw new Error('EMPTY_VLAN_LIST');

  for (const token of tokens) {
    if (/^\d+$/.test(token)) {
      const vlan = Number(token);
      if (!isValidVlan(vlan)) throw new Error('INVALID_VLAN');
      vlans.add(vlan);
      continue;
    }

    const range = token.match(/^(\d+)-(\d+)$/);
    if (!range) throw new Error('INVALID_VLAN_LIST');
    const start = Number(range[1]);
    const end = Number(range[2]);
    if (!isValidVlan(start) || !isValidVlan(end) || start > end) throw new Error('INVALID_VLAN_RANGE');
    for (let vlan = start; vlan <= end; vlan += 1) vlans.add(vlan);
  }

  return [...vlans].sort((a, b) => a - b);
}

export function evaluateTrunkFrame(vlan: number, nativeVlan: number, allowedVlans: number[]): TrunkFrameResult {
  if (!isValidVlan(vlan) || !isValidVlan(nativeVlan)) throw new Error('INVALID_VLAN');
  if (!allowedVlans.includes(vlan)) return { forwarded: false, tagged: false, reason: 'not-allowed' };
  if (vlan === nativeVlan) return { forwarded: true, tagged: false, reason: 'native-untagged' };
  return { forwarded: true, tagged: true, reason: 'allowed-tagged' };
}

export function normalizeMac(mac: string): string {
  if (!MAC_PATTERN.test(mac.trim())) throw new Error('INVALID_MAC');
  return mac.toLowerCase().replace(/[.:-]/g, '');
}

export function electRootBridge(candidates: BridgeCandidate[]): BridgeCandidate {
  if (candidates.length === 0) throw new Error('NO_BRIDGES');
  for (const bridge of candidates) {
    if (!Number.isInteger(bridge.priority) || bridge.priority < 0 || bridge.priority > 61440 || bridge.priority % 4096 !== 0) {
      throw new Error('INVALID_STP_PRIORITY');
    }
    normalizeMac(bridge.mac);
  }

  return candidates.reduce((best, candidate) => {
    if (candidate.priority !== best.priority) return candidate.priority < best.priority ? candidate : best;
    return normalizeMac(candidate.mac) < normalizeMac(best.mac) ? candidate : best;
  });
}

export function etherChannelProtocol(mode: EtherChannelMode): 'lacp' | 'pagp' | 'static' {
  if (mode === 'active' || mode === 'passive') return 'lacp';
  if (mode === 'desirable' || mode === 'auto') return 'pagp';
  return 'static';
}

export function isEtherChannelCompatible(left: EtherChannelMode, right: EtherChannelMode): boolean {
  const leftProtocol = etherChannelProtocol(left);
  const rightProtocol = etherChannelProtocol(right);
  if (leftProtocol !== rightProtocol) return false;
  if (leftProtocol === 'static') return true;
  if (leftProtocol === 'lacp') return left === 'active' || right === 'active';
  return left === 'desirable' || right === 'desirable';
}

export const STP_SHORT_PATH_COST: Readonly<Record<string, number>> = {
  '10 Mb/s': 100,
  '100 Mb/s': 19,
  '1 Gb/s': 4,
  '10 Gb/s': 2
};

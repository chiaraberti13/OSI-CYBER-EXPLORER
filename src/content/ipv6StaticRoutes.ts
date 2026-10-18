export type Ipv6RouteScenario = 'host' | 'network' | 'default';

export interface Ipv6RouteResult {
  destination: string;
  selectedPrefix: string;
  nextHop: string;
  administrativeDistance: number;
  backupActive: boolean;
}

/** Deterministic IOS lab fixture: the primary /48 disappears when its link fails. */
export function resolveIpv6Route(scenario: Ipv6RouteScenario, primaryLinkUp: boolean): Ipv6RouteResult {
  if (scenario === 'host') {
    return {
      destination: '2001:db8:20::50',
      selectedPrefix: '2001:db8:20::50/128',
      nextHop: primaryLinkUp ? '2001:db8:0:12::2' : '2001:db8:0:13::2',
      administrativeDistance: primaryLinkUp ? 1 : 200,
      backupActive: !primaryLinkUp
    };
  }
  if (scenario === 'network') {
    return {
      destination: '2001:db8:20::25',
      selectedPrefix: '2001:db8:20::/48',
      nextHop: primaryLinkUp ? '2001:db8:0:12::2' : '2001:db8:0:13::2',
      administrativeDistance: primaryLinkUp ? 1 : 200,
      backupActive: !primaryLinkUp
    };
  }
  return {
    destination: '2001:db8:99::10',
    selectedPrefix: '::/0',
    nextHop: primaryLinkUp ? '2001:db8:0:12::2' : '2001:db8:0:13::2',
    administrativeDistance: primaryLinkUp ? 1 : 200,
    backupActive: !primaryLinkUp
  };
}

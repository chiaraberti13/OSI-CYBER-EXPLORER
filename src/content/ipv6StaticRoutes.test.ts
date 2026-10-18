import { describe, expect, it } from 'vitest';
import { resolveIpv6Route } from './ipv6StaticRoutes';

describe('IPv6 static route lab scenarios', () => {
  it('selects a host route for a single destination', () => {
    expect(resolveIpv6Route('host', true)).toMatchObject({
      selectedPrefix: '2001:db8:20::50/128',
      administrativeDistance: 1,
      backupActive: false
    });
    expect(resolveIpv6Route('host', false)).toMatchObject({
      nextHop: '2001:db8:0:13::2',
      administrativeDistance: 200,
      backupActive: true
    });
  });

  it('uses the primary network route, then the floating route after failure', () => {
    expect(resolveIpv6Route('network', true)).toMatchObject({
      nextHop: '2001:db8:0:12::2',
      administrativeDistance: 1,
      backupActive: false
    });
    expect(resolveIpv6Route('network', false)).toMatchObject({
      nextHop: '2001:db8:0:13::2',
      administrativeDistance: 200,
      backupActive: true
    });
  });

  it('uses the default route only for otherwise unmatched destinations', () => {
    expect(resolveIpv6Route('default', true)).toMatchObject({
      destination: '2001:db8:99::10',
      selectedPrefix: '::/0',
      nextHop: '2001:db8:0:12::2'
    });
    expect(resolveIpv6Route('default', false)).toMatchObject({
      selectedPrefix: '::/0',
      nextHop: '2001:db8:0:13::2',
      administrativeDistance: 200,
      backupActive: true
    });
  });
});

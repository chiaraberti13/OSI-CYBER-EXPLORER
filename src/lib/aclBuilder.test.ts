import { describe, expect, it } from 'vitest';
import { aceCovers, buildAcl, portToken, type AclIntent } from './aclBuilder';
import { evaluateIpv4Acl } from './securityFundamentals';

const GUESTS = { kind: 'subnet' as const, address: '10.10.10.0', wildcard: '0.0.0.255' };
const SERVERS = { kind: 'subnet' as const, address: '10.20.50.0', wildcard: '0.0.0.255' };
const ANY = { kind: 'any' as const };

const intent = (over: Partial<AclIntent> & Pick<AclIntent, 'id'>): AclIntent => ({
  action: 'permit',
  protocol: 'ip',
  source: ANY,
  destination: ANY,
  description: { it: 'test', en: 'test' },
  ...over
});

describe('writing the ACE', () => {
  it('writes each address form the way IOS does', () => {
    const acl = buildAcl([
      intent({ id: 'a', action: 'deny', protocol: 'tcp', source: GUESTS, destination: ANY, port: 23, log: true }),
      intent({ id: 'b', protocol: 'tcp', source: GUESTS, destination: SERVERS, port: 443 }),
      intent({ id: 'c', protocol: 'icmp', source: { kind: 'host', address: '10.10.10.42' }, destination: ANY })
    ]);
    expect(acl.aces.map(ace => ace.text)).toEqual([
      '10 deny tcp 10.10.10.0 0.0.0.255 any eq telnet log',
      '20 permit tcp 10.10.10.0 0.0.0.255 10.20.50.0 0.0.0.255 eq https',
      '30 permit icmp host 10.10.10.42 any'
    ]);
  });

  it('prints well-known ports by name and the rest as numbers', () => {
    expect(portToken(22)).toBe('ssh');
    expect(portToken(443)).toBe('https');
    expect(portToken(8443)).toBe('8443');
  });

  it('produces a configuration with the interface and the implicit deny spelled out', () => {
    const acl = buildAcl([intent({ id: 'a', protocol: 'tcp', source: GUESTS, destination: SERVERS, port: 443 })], {
      name: 'GUEST-IN', interfaceName: 'Vlan10', direction: 'in'
    });
    expect(acl.configuration).toEqual([
      'ip access-list extended GUEST-IN',
      ' 10 permit tcp 10.10.10.0 0.0.0.255 10.20.50.0 0.0.0.255 eq https',
      ' remark implicit deny ip any any',
      '!',
      'interface Vlan10',
      ' ip access-group GUEST-IN in'
    ]);
  });
});

describe('when one ACE covers another', () => {
  const rule = (over: Partial<Parameters<typeof aceCovers>[0]> = {}) => ({
    sequence: 10, action: 'permit' as const, protocol: 'ip' as const,
    source: { address: '0.0.0.0', wildcard: '255.255.255.255' },
    destination: { address: '0.0.0.0', wildcard: '255.255.255.255' },
    ...over
  });

  it('lets a wider subnet cover a host inside it, never the reverse', () => {
    const subnet = rule({ source: { address: '10.10.10.0', wildcard: '0.0.0.255' } });
    const host = rule({ source: { address: '10.10.10.42', wildcard: '0.0.0.0' } });
    expect(aceCovers(subnet, host)).toBe(true);
    expect(aceCovers(host, subnet)).toBe(false);
  });

  it('does not let one subnet cover a different subnet', () => {
    const left = rule({ source: { address: '10.10.10.0', wildcard: '0.0.0.255' } });
    const right = rule({ source: { address: '10.10.20.0', wildcard: '0.0.0.255' } });
    expect(aceCovers(left, right)).toBe(false);
  });

  it('lets ip cover a specific protocol, and any port cover a specific port', () => {
    expect(aceCovers(rule({ protocol: 'ip' }), rule({ protocol: 'tcp', destinationPort: 23 }))).toBe(true);
    expect(aceCovers(rule({ protocol: 'tcp' }), rule({ protocol: 'tcp', destinationPort: 23 }))).toBe(true);
    expect(aceCovers(rule({ protocol: 'tcp', destinationPort: 23 }), rule({ protocol: 'tcp' }))).toBe(false);
    expect(aceCovers(rule({ protocol: 'tcp' }), rule({ protocol: 'udp' }))).toBe(false);
  });

  it('knows established narrows the match instead of widening it', () => {
    // permit tcp any any established matches only replies, so it cannot cover a line
    // that also matches the opening SYN.
    expect(aceCovers(rule({ protocol: 'tcp', established: true }), rule({ protocol: 'tcp' }))).toBe(false);
    expect(aceCovers(rule({ protocol: 'tcp' }), rule({ protocol: 'tcp', established: true }))).toBe(true);
  });
});

describe('first match wins, and what it costs', () => {
  const permitEverything = intent({ id: 'open', protocol: 'ip', source: GUESTS, destination: ANY });
  const denyTelnet = intent({ id: 'telnet', action: 'deny', protocol: 'tcp', source: GUESTS, destination: ANY, port: 23 });

  it('marks a specific deny placed after a general permit as a dead line', () => {
    const acl = buildAcl([permitEverything, denyTelnet]);
    expect(acl.aces[1].status).toBe('shadowed');
    expect(acl.aces[1].coveredBy).toBe(10);
    expect(acl.hasDeadRules).toBe(true);
    expect(acl.aces[1].note.en).toMatch(/never reached/);
  });

  it('leaves both lines alive in the right order', () => {
    const acl = buildAcl([denyTelnet, permitEverything]);
    expect(acl.aces.map(ace => ace.status)).toEqual(['active', 'active']);
    expect(acl.hasDeadRules).toBe(false);
    expect(acl.suggestedOrder).toBeNull();
  });

  it('suggests an order in which nothing is shadowed', () => {
    const acl = buildAcl([permitEverything, denyTelnet]);
    expect(acl.suggestedOrder).toEqual(['telnet', 'open']);
    // And that order really does leave every line reachable.
    const fixed = buildAcl([denyTelnet, permitEverything]);
    expect(fixed.aces.every(ace => ace.status === 'active')).toBe(true);
  });

  it('separates a redundant line from a dead one', () => {
    // Same decision, so nothing breaks — but the second line will never count a packet.
    const acl = buildAcl([
      intent({ id: 'wide', protocol: 'tcp', source: ANY, destination: SERVERS, port: 443 }),
      intent({ id: 'narrow', protocol: 'tcp', source: GUESTS, destination: SERVERS, port: 443 })
    ]);
    expect(acl.aces[1].status).toBe('redundant');
    expect(acl.aces[1].note.en).toMatch(/counter will stay at zero/);
    expect(acl.hasDeadRules).toBe(true);
  });

  it('scores a host rule as more specific than a subnet rule', () => {
    const acl = buildAcl([
      intent({ id: 'subnet', protocol: 'tcp', source: GUESTS, destination: ANY, port: 443 }),
      intent({ id: 'host', protocol: 'tcp', source: { kind: 'host', address: '10.10.10.42' }, destination: ANY, port: 443 })
    ]);
    expect(acl.aces[1].specificity).toBeGreaterThan(acl.aces[0].specificity);
  });
});

describe('the builder and the evaluator agree', () => {
  const acl = buildAcl([
    intent({ id: 'telnet', action: 'deny', protocol: 'tcp', source: GUESTS, destination: ANY, port: 23, log: true }),
    intent({ id: 'https', protocol: 'tcp', source: GUESTS, destination: SERVERS, port: 443 }),
    intent({ id: 'ping', protocol: 'icmp', source: ANY, destination: ANY })
  ]);
  const rules = acl.aces.map(ace => ace.rule);

  it('denies the traffic the first line was written to deny', () => {
    const decision = evaluateIpv4Acl(rules, {
      protocol: 'tcp', sourceIp: '10.10.10.42', destinationIp: '10.20.50.5', destinationPort: 23
    });
    expect(decision).toMatchObject({ action: 'deny', matchedSequence: 10, logged: true });
  });

  it('permits the traffic the second line was written to permit', () => {
    const decision = evaluateIpv4Acl(rules, {
      protocol: 'tcp', sourceIp: '10.10.10.42', destinationIp: '10.20.50.5', destinationPort: 443
    });
    expect(decision).toMatchObject({ action: 'permit', matchedSequence: 20 });
  });

  it('drops through to the implicit deny when no line matches', () => {
    const decision = evaluateIpv4Acl(rules, {
      protocol: 'udp', sourceIp: '10.10.10.42', destinationIp: '10.20.50.5', destinationPort: 53
    });
    expect(decision).toMatchObject({ action: 'deny', matchedSequence: null, implicit: true });
  });
});

describe('invalid policies', () => {
  it('refuses intents it cannot turn into an ACL', () => {
    expect(() => buildAcl([])).toThrow('NO_INTENTS');
    expect(() => buildAcl([intent({ id: 'x' }), intent({ id: 'x' })])).toThrow('DUPLICATE_INTENT');
    expect(() => buildAcl([intent({ id: 'x', protocol: 'tcp', port: 0 })])).toThrow('INVALID_PORT');
    // A port has no meaning without a Layer 4 protocol: `permit ip any any eq 80` is not
    // a command IOS accepts.
    expect(() => buildAcl([intent({ id: 'x', protocol: 'ip', port: 80 })])).toThrow('PORT_WITHOUT_L4_PROTOCOL');
    expect(() => buildAcl([intent({ id: 'x', source: { kind: 'host', address: '10.10.10.999' } })])).toThrow('INVALID_IPV4');
  });

  it('explains the implicit deny in both languages', () => {
    const acl = buildAcl([intent({ id: 'a' })]);
    expect(acl.implicitDeny.it.length).toBeGreaterThan(60);
    expect(acl.implicitDeny.en.length).toBeGreaterThan(60);
  });
});

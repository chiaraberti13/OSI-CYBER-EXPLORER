import { describe, expect, it } from 'vitest';
import { aclAddressMatches, evaluateIpv4Acl, inverseMaskFromPrefix, type AclRule } from './securityFundamentals';

const rules: AclRule[] = [
  { sequence: 10, action: 'deny', protocol: 'tcp', source: { address: '10.10.10.0', wildcard: '0.0.0.255' }, destination: { address: '0.0.0.0', wildcard: '255.255.255.255' }, destinationPort: 23, log: true },
  { sequence: 20, action: 'permit', protocol: 'tcp', source: { address: '10.10.10.0', wildcard: '0.0.0.255' }, destination: { address: '10.20.0.0', wildcard: '0.0.255.255' }, destinationPort: 443 },
  { sequence: 30, action: 'permit', protocol: 'icmp', source: { address: '0.0.0.0', wildcard: '255.255.255.255' }, destination: { address: '10.20.0.0', wildcard: '0.0.255.255' } }
];

describe('ACL wildcard matching', () => {
  it('matches only significant address bits', () => {
    expect(aclAddressMatches('10.10.10.42', { address: '10.10.10.0', wildcard: '0.0.0.255' })).toBe(true);
    expect(aclAddressMatches('10.10.11.42', { address: '10.10.10.0', wildcard: '0.0.0.255' })).toBe(false);
  });

  it('converts CIDR prefixes to wildcard masks', () => {
    expect(inverseMaskFromPrefix(24)).toBe('0.0.0.255');
    expect(inverseMaskFromPrefix(0)).toBe('255.255.255.255');
    expect(inverseMaskFromPrefix(32)).toBe('0.0.0.0');
  });
});

describe('first-match IPv4 ACL evaluation', () => {
  it('denies Telnet and records the explicit logging rule', () => {
    expect(evaluateIpv4Acl(rules, { protocol: 'tcp', sourceIp: '10.10.10.42', destinationIp: '192.0.2.10', destinationPort: 23 })).toEqual({ action: 'deny', matchedSequence: 10, implicit: false, logged: true });
  });

  it('permits HTTPS only toward the intended destination prefix', () => {
    expect(evaluateIpv4Acl(rules, { protocol: 'tcp', sourceIp: '10.10.10.42', destinationIp: '10.20.50.5', destinationPort: 443 }).action).toBe('permit');
    expect(evaluateIpv4Acl(rules, { protocol: 'tcp', sourceIp: '10.10.10.42', destinationIp: '10.30.50.5', destinationPort: 443 }).implicit).toBe(true);
  });

  it('uses an implicit deny when no explicit rule matches', () => {
    expect(evaluateIpv4Acl(rules, { protocol: 'udp', sourceIp: '10.10.10.42', destinationIp: '10.20.50.5', destinationPort: 53 })).toEqual({ action: 'deny', matchedSequence: null, implicit: true, logged: false });
  });

  it('treats established as ACK or RST, not as stateful inspection', () => {
    const establishedRule: AclRule = { sequence: 10, action: 'permit', protocol: 'tcp', source: { address: '0.0.0.0', wildcard: '255.255.255.255' }, destination: { address: '10.0.0.0', wildcard: '0.255.255.255' }, established: true };
    expect(evaluateIpv4Acl([establishedRule], { protocol: 'tcp', sourceIp: '198.51.100.1', destinationIp: '10.0.0.10', tcpFlags: ['ACK'] }).action).toBe('permit');
    expect(evaluateIpv4Acl([establishedRule], { protocol: 'tcp', sourceIp: '198.51.100.1', destinationIp: '10.0.0.10', tcpFlags: ['SYN'] }).action).toBe('deny');
  });
});

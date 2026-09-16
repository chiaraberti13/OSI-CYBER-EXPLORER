import { ipv4ToUint } from './ipv4';

export type AclAction = 'permit' | 'deny';
export type IpProtocol = 'ip' | 'tcp' | 'udp' | 'icmp';

export interface AclAddress {
  address: string;
  wildcard: string;
}

export interface AclRule {
  sequence: number;
  action: AclAction;
  protocol: IpProtocol;
  source: AclAddress;
  destination: AclAddress;
  destinationPort?: number;
  established?: boolean;
  log?: boolean;
}

export interface PacketDescriptor {
  protocol: Exclude<IpProtocol, 'ip'>;
  sourceIp: string;
  destinationIp: string;
  sourcePort?: number;
  destinationPort?: number;
  tcpFlags?: string[];
}

export interface AclDecision {
  action: AclAction;
  matchedSequence: number | null;
  implicit: boolean;
  logged: boolean;
}

function assertPort(port: number | undefined): void {
  if (port !== undefined && (!Number.isInteger(port) || port < 1 || port > 65535)) throw new Error('INVALID_PORT');
}

export function aclAddressMatches(packetAddress: string, aclAddress: AclAddress): boolean {
  const packet = ipv4ToUint(packetAddress);
  const base = ipv4ToUint(aclAddress.address);
  const wildcard = ipv4ToUint(aclAddress.wildcard);
  const significantMask = (~wildcard) >>> 0;
  return ((packet & significantMask) >>> 0) === ((base & significantMask) >>> 0);
}

function ruleMatches(rule: AclRule, packet: PacketDescriptor): boolean {
  if (rule.protocol !== 'ip' && rule.protocol !== packet.protocol) return false;
  if (!aclAddressMatches(packet.sourceIp, rule.source)) return false;
  if (!aclAddressMatches(packet.destinationIp, rule.destination)) return false;
  if (rule.destinationPort !== undefined && packet.destinationPort !== rule.destinationPort) return false;
  if (rule.established) {
    if (packet.protocol !== 'tcp') return false;
    const flags = new Set((packet.tcpFlags ?? []).map(flag => flag.toUpperCase()));
    if (!flags.has('ACK') && !flags.has('RST')) return false;
  }
  return true;
}

export function evaluateIpv4Acl(rules: AclRule[], packet: PacketDescriptor): AclDecision {
  ipv4ToUint(packet.sourceIp);
  ipv4ToUint(packet.destinationIp);
  assertPort(packet.sourcePort);
  assertPort(packet.destinationPort);

  const ordered = [...rules].sort((left, right) => left.sequence - right.sequence);
  for (const rule of ordered) {
    if (!Number.isInteger(rule.sequence) || rule.sequence < 1) throw new Error('INVALID_SEQUENCE');
    assertPort(rule.destinationPort);
    if (ruleMatches(rule, packet)) {
      return { action: rule.action, matchedSequence: rule.sequence, implicit: false, logged: Boolean(rule.log) };
    }
  }
  return { action: 'deny', matchedSequence: null, implicit: true, logged: false };
}

export function inverseMaskFromPrefix(prefix: number): string {
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) throw new Error('INVALID_PREFIX');
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const wildcard = (~mask) >>> 0;
  return [24, 16, 8, 0].map(shift => (wildcard >>> shift) & 0xff).join('.');
}

import type { Bilingual } from '../types';
import { ipv4ToUint } from './ipv4';
import type { AclAction, AclAddress, AclRule, IpProtocol } from './securityFundamentals';

/**
 * Building an ACL from a requirement, and finding out what the order costs.
 *
 * The evaluator answers "what happens to this packet". The direction a requirement
 * actually arrives in is the other one: "allow HTTPS to the servers, block Telnet from
 * the guest VLAN, let ping through" — and the difficulty is never writing the lines.
 * It is that an ACL is evaluated first match wins, so a general line placed before a
 * specific one makes the specific one unreachable: it will never match a single packet
 * and its counter will stay at zero forever.
 *
 * So this module turns intents into ACEs and then does the analysis nobody does by
 * hand: which line can still match, which is shadowed by an earlier one, which is
 * merely redundant, and in what order the same set of intents would all survive.
 */

export type AddressScope =
  | { kind: 'any' }
  | { kind: 'host'; address: string }
  | { kind: 'subnet'; address: string; wildcard: string };

export interface AclIntent {
  id: string;
  action: AclAction;
  protocol: IpProtocol;
  source: AddressScope;
  destination: AddressScope;
  /** Destination port; only meaningful for TCP and UDP. */
  port?: number;
  established?: boolean;
  log?: boolean;
  description: Bilingual;
}

export type AceStatus = 'active' | 'shadowed' | 'redundant';

export interface BuiltAce {
  intentId: string;
  rule: AclRule;
  /** The line as IOS would show it. */
  text: string;
  status: AceStatus;
  /** Sequence number of the earlier ACE that makes this one dead, when it is dead. */
  coveredBy?: number;
  /** Bits the ACE cares about, across source and destination: higher is more specific. */
  specificity: number;
  note: Bilingual;
}

export interface BuiltAcl {
  name: string;
  aces: BuiltAce[];
  /** IOS configuration, ready to read: the list plus the interface that applies it. */
  configuration: string[];
  /** True when at least one ACE can never match. */
  hasDeadRules: boolean;
  /** The order in which no ACE is shadowed, when the current one has dead rules. */
  suggestedOrder: string[] | null;
  /** Reminder that traffic matching nothing is dropped by the implicit deny. */
  implicitDeny: Bilingual;
}

const b = (it: string, en: string): Bilingual => ({ it, en });

function scopeToAddress(scope: AddressScope): AclAddress {
  if (scope.kind === 'any') return { address: '0.0.0.0', wildcard: '255.255.255.255' };
  if (scope.kind === 'host') return { address: scope.address, wildcard: '0.0.0.0' };
  return { address: scope.address, wildcard: scope.wildcard };
}

/** How IOS writes an address pair: `any`, `host A`, or `A W`. */
function scopeToText(scope: AddressScope): string {
  if (scope.kind === 'any') return 'any';
  if (scope.kind === 'host') return `host ${scope.address}`;
  return `${scope.address} ${scope.wildcard}`;
}

/** Number of bits the wildcard forces to match. */
function careBits(address: AclAddress): number {
  const wildcard = ipv4ToUint(address.wildcard);
  let bits = 0;
  for (let index = 0; index < 32; index += 1) {
    if ((wildcard & (1 << index)) === 0) bits += 1;
  }
  return bits;
}

/**
 * True when every packet matched by `inner` is also matched by `outer`.
 *
 * An address pair can only cover another when it cares about a subset of the same
 * bits and agrees with it on all of them — which is the formal version of "the /24
 * covers the host, never the other way round".
 */
function addressCovers(outer: AclAddress, inner: AclAddress): boolean {
  const outerCare = (~ipv4ToUint(outer.wildcard)) >>> 0;
  const innerCare = (~ipv4ToUint(inner.wildcard)) >>> 0;
  if ((outerCare & ~innerCare) >>> 0) return false;
  return (((ipv4ToUint(outer.address) ^ ipv4ToUint(inner.address)) & outerCare) >>> 0) === 0;
}

function protocolCovers(outer: IpProtocol, inner: IpProtocol): boolean {
  return outer === 'ip' || outer === inner;
}

function portCovers(outer: number | undefined, inner: number | undefined): boolean {
  return outer === undefined || outer === inner;
}

/** True when `outer` matches every packet `inner` would match. */
export function aceCovers(outer: AclRule, inner: AclRule): boolean {
  if (!protocolCovers(outer.protocol, inner.protocol)) return false;
  if (outer.established && !inner.established) return false;
  if (!portCovers(outer.destinationPort, inner.destinationPort)) return false;
  return addressCovers(outer.source, inner.source) && addressCovers(outer.destination, inner.destination);
}

const PORT_NAMES: Record<number, string> = {
  20: 'ftp-data', 21: 'ftp', 22: 'ssh', 23: 'telnet', 25: 'smtp', 53: 'domain',
  67: 'bootps', 68: 'bootpc', 69: 'tftp', 80: 'www', 110: 'pop3', 123: 'ntp',
  143: 'imap', 161: 'snmp', 443: 'https', 445: 'microsoft-ds', 514: 'syslog',
  3389: 'rdp'
};

/** IOS prints well-known ports by name, which is what a `show` output looks like. */
export function portToken(port: number): string {
  return PORT_NAMES[port] ?? String(port);
}

function intentToRule(intent: AclIntent, sequence: number): AclRule {
  const rule: AclRule = {
    sequence,
    action: intent.action,
    protocol: intent.protocol,
    source: scopeToAddress(intent.source),
    destination: scopeToAddress(intent.destination)
  };
  if (intent.port !== undefined) rule.destinationPort = intent.port;
  if (intent.established) rule.established = true;
  if (intent.log) rule.log = true;
  return rule;
}

function intentToText(intent: AclIntent, sequence: number): string {
  const parts = [
    String(sequence),
    intent.action,
    intent.protocol,
    scopeToText(intent.source),
    scopeToText(intent.destination)
  ];
  if (intent.port !== undefined) parts.push('eq', portToken(intent.port));
  if (intent.established) parts.push('established');
  if (intent.log) parts.push('log');
  return parts.join(' ');
}

export interface BuildAclOptions {
  name?: string;
  /** Interface the list is applied to, for the configuration output. */
  interfaceName?: string;
  direction?: 'in' | 'out';
}

export function buildAcl(intents: AclIntent[], options: BuildAclOptions = {}): BuiltAcl {
  if (intents.length === 0) throw new Error('NO_INTENTS');
  const seen = new Set<string>();
  for (const intent of intents) {
    if (seen.has(intent.id)) throw new Error('DUPLICATE_INTENT');
    seen.add(intent.id);
    if (intent.port !== undefined) {
      if (!Number.isInteger(intent.port) || intent.port < 1 || intent.port > 65535) throw new Error('INVALID_PORT');
      if (intent.protocol !== 'tcp' && intent.protocol !== 'udp') throw new Error('PORT_WITHOUT_L4_PROTOCOL');
    }
    // Validate the addresses here, so a typo fails at build time instead of quietly
    // producing an ACE that matches nothing.
    ipv4ToUint(scopeToAddress(intent.source).address);
    ipv4ToUint(scopeToAddress(intent.source).wildcard);
    ipv4ToUint(scopeToAddress(intent.destination).address);
    ipv4ToUint(scopeToAddress(intent.destination).wildcard);
  }

  const name = options.name ?? 'SEGMENT-POLICY';
  const aces: BuiltAce[] = [];

  intents.forEach((intent, index) => {
    const sequence = (index + 1) * 10;
    const rule = intentToRule(intent, sequence);
    let status: AceStatus = 'active';
    let coveredBy: number | undefined;
    let note = b(
      'Questa ACE può ancora corrispondere a del traffico: nessuna riga precedente la copre interamente.',
      'This ACE can still match traffic: no earlier line covers it entirely.'
    );

    for (const earlier of aces) {
      if (!aceCovers(earlier.rule, rule)) continue;
      coveredBy = earlier.rule.sequence;
      if (earlier.rule.action === rule.action) {
        status = 'redundant';
        note = b(
          `Ridondante: la riga ${earlier.rule.sequence} corrisponde già a tutto questo traffico e prende la stessa decisione. Non è un errore di sicurezza, ma il contatore di questa riga resterà a zero e chi legge la ACL penserà che serva a qualcosa.`,
          `Redundant: line ${earlier.rule.sequence} already matches all of this traffic and takes the same decision. It is not a security error, but this line's counter will stay at zero and whoever reads the ACL will think it does something.`
        );
      } else {
        status = 'shadowed';
        note = b(
          `Riga morta: la ${earlier.rule.sequence} corrisponde prima a tutto questo traffico e decide il contrario. Con la valutazione first match questa riga non verrà mai raggiunta — è il motivo per cui un “deny” apparentemente configurato non blocca nulla. Va spostata prima della ${earlier.rule.sequence}.`,
          `Dead line: line ${earlier.rule.sequence} matches all of this traffic first and decides the opposite. With first-match evaluation this line is never reached — this is why an apparently configured "deny" blocks nothing. It has to move above line ${earlier.rule.sequence}.`
        );
      }
      break;
    }

    aces.push({
      intentId: intent.id,
      rule,
      text: intentToText(intent, sequence),
      status,
      coveredBy,
      specificity: careBits(rule.source) + careBits(rule.destination)
        + (rule.destinationPort !== undefined ? 1 : 0)
        + (rule.protocol !== 'ip' ? 1 : 0),
      note
    });
  });

  const hasDeadRules = aces.some(ace => ace.status !== 'active');

  // Most specific first is the order in which a specific decision is never swallowed by
  // a general one. Equal specificity keeps the order the author chose.
  let suggestedOrder: string[] | null = null;
  if (hasDeadRules) {
    const reordered = intents
      .map((intent, index) => ({ intent, index, ace: aces[index] }))
      .sort((left, right) => right.ace.specificity - left.ace.specificity || left.index - right.index)
      .map(item => item.intent);
    const rebuilt = buildOrder(reordered);
    suggestedOrder = rebuilt.every(ace => ace.status === 'active') ? reordered.map(intent => intent.id) : null;
  }

  const configuration = [
    `ip access-list extended ${name}`,
    ...aces.map(ace => ` ${ace.text}`),
    ' remark implicit deny ip any any',
    '!',
    ...(options.interfaceName
      ? [`interface ${options.interfaceName}`, ` ip access-group ${name} ${options.direction ?? 'in'}`]
      : [])
  ];

  return {
    name,
    aces,
    configuration,
    hasDeadRules,
    suggestedOrder,
    implicitDeny: b(
      'Alla fine di ogni ACL c’è un deny ip any any implicito che non si vede nella configurazione: tutto ciò che nessuna riga permette viene scartato. Per questo una ACL composta solo da deny blocca tutto, e per questo serve sempre almeno una riga di permit.',
      'At the end of every ACL there is an implicit deny ip any any that does not appear in the configuration: anything no line permits is dropped. This is why an ACL made only of deny lines blocks everything, and why at least one permit line is always needed.'
    )
  };
}

/** Statuses only, used to check whether a candidate order leaves every ACE reachable. */
function buildOrder(intents: AclIntent[]): Array<{ status: AceStatus }> {
  const rules: AclRule[] = [];
  return intents.map((intent, index) => {
    const rule = intentToRule(intent, (index + 1) * 10);
    const covered = rules.find(earlier => aceCovers(earlier, rule));
    rules.push(rule);
    if (!covered) return { status: 'active' as AceStatus };
    return { status: covered.action === rule.action ? 'redundant' as AceStatus : 'shadowed' as AceStatus };
  });
}

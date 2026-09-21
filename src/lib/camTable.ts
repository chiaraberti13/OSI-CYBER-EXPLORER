import type { Bilingual } from '../types';
import { isValidVlan, normalizeMac } from './networkAccess';

/**
 * What a switch does with one frame, frame after frame.
 *
 * The theory is four words — learning, forwarding, flooding, aging — and they are easy
 * to recite and easy to get wrong under exam pressure, because the interesting cases
 * are the ones nobody pictures: a frame whose destination is known on the *same* port
 * it arrived on (filtered, not forwarded), an unknown unicast (flooded, which is not
 * the same thing as a broadcast), a MAC that reappears on another port (the entry
 * moves), and an entry that simply ages out of a table nobody touched.
 *
 * So this engine replays a frame sequence and shows the table after each one. Nothing
 * here is random: the same sequence always produces the same table.
 */

export type FrameAction = 'forward' | 'flood' | 'filter';
export type PortMode = 'access' | 'trunk';

export interface SwitchPort {
  id: string;
  name: string;
  mode: PortMode;
  /** Access VLAN, or the native VLAN on a trunk. */
  vlan: number;
  /** VLANs a trunk carries; ignored on an access port. */
  trunkVlans?: number[];
}

export interface CamEntry {
  mac: string;
  port: string;
  vlan: number;
  /** Seconds, relative to the start of the sequence. */
  learnedAt: number;
  kind: 'dynamic' | 'static';
}

export interface FrameInput {
  srcMac: string;
  dstMac: string;
  ingressPort: string;
  vlan: number;
  /** Seconds since the start of the sequence; defaults to the previous frame's time. */
  at?: number;
}

export interface CamStep {
  frame: FrameInput & { at: number };
  action: FrameAction;
  /** Ports the frame leaves on; empty when it is filtered. */
  egressPorts: string[];
  /** The source entry written by this frame, and whether it moved from another port. */
  learned: { mac: string; port: string; vlan: number; moved: boolean; movedFrom?: string } | null;
  /** Entries removed by aging before this frame was processed. */
  agedOut: string[];
  destinationKnown: boolean;
  destinationKind: 'unicast' | 'multicast' | 'broadcast';
  reason: Bilingual;
  /** The whole table after this frame, sorted by MAC. */
  table: CamEntry[];
}

export interface CamOptions {
  /** Idle time after which a dynamic entry is removed. Cisco's default is 300 s. */
  agingSeconds?: number;
  /** Entries present before the sequence starts, for example configured statically. */
  initialEntries?: Array<Omit<CamEntry, 'learnedAt'> & { learnedAt?: number }>;
}

const BROADCAST = 'ffffffffffff';
const b = (it: string, en: string): Bilingual => ({ it, en });

/**
 * Twelve lowercase hex digits, from either a written address (0011.2233.4455 or
 * 00:11:22:33:44:55) or an already normalised one. The tolerance matters because these
 * helpers are called both on what a learner types and on what the table holds.
 */
function hexOf(mac: string): string {
  const bare = mac.trim().toLowerCase();
  return /^[0-9a-f]{12}$/.test(bare) ? bare : normalizeMac(bare);
}

/** True for broadcast and multicast: the I/G bit is the low bit of the first octet. */
export function isGroupMac(mac: string): boolean {
  return (Number.parseInt(hexOf(mac).slice(0, 2), 16) & 1) === 1;
}

export function macKind(mac: string): 'unicast' | 'multicast' | 'broadcast' {
  const normalized = hexOf(mac);
  if (normalized === BROADCAST) return 'broadcast';
  return isGroupMac(normalized) ? 'multicast' : 'unicast';
}

/** Cisco's display form, 0011.2233.4455. */
export function formatMac(mac: string): string {
  const normalized = hexOf(mac);
  return `${normalized.slice(0, 4)}.${normalized.slice(4, 8)}.${normalized.slice(8, 12)}`;
}

/** Ports that carry a VLAN: an access port in it, or a trunk allowing it. */
function portsInVlan(ports: SwitchPort[], vlan: number): SwitchPort[] {
  return ports.filter(port => (
    port.mode === 'access'
      ? port.vlan === vlan
      : (port.trunkVlans ?? []).includes(vlan) || port.vlan === vlan
  ));
}

export function simulateCam(ports: SwitchPort[], frames: FrameInput[], options: CamOptions = {}): CamStep[] {
  if (ports.length === 0) throw new Error('NO_PORTS');
  const agingSeconds = options.agingSeconds ?? 300;
  if (agingSeconds <= 0) throw new Error('INVALID_AGING');

  const byId = new Map(ports.map(port => [port.id, port]));
  const table = new Map<string, CamEntry>();
  for (const entry of options.initialEntries ?? []) {
    if (!byId.has(entry.port)) throw new Error('UNKNOWN_PORT');
    const mac = hexOf(entry.mac);
    table.set(`${entry.vlan}:${mac}`, { ...entry, mac, learnedAt: entry.learnedAt ?? 0 });
  }

  const steps: CamStep[] = [];
  let clock = 0;

  for (const frame of frames) {
    const ingress = byId.get(frame.ingressPort);
    if (!ingress) throw new Error('UNKNOWN_PORT');
    if (!isValidVlan(frame.vlan)) throw new Error('INVALID_VLAN');
    // A switch never learns from a group address: no host owns one.
    if (isGroupMac(frame.srcMac)) throw new Error('INVALID_SOURCE_MAC');

    const at = frame.at ?? clock;
    if (at < clock) throw new Error('TIME_WENT_BACKWARDS');
    clock = at;

    const srcMac = hexOf(frame.srcMac);
    const dstMac = hexOf(frame.dstMac);
    const destinationKind = macKind(dstMac);

    // 1. Aging happens on idle time, and it happens before this frame is handled.
    const agedOut: string[] = [];
    for (const [key, entry] of [...table.entries()]) {
      if (entry.kind === 'dynamic' && at - entry.learnedAt >= agingSeconds) {
        table.delete(key);
        agedOut.push(formatMac(entry.mac));
      }
    }

    // 2. Learning always uses the source address, never the destination.
    const sourceKey = `${frame.vlan}:${srcMac}`;
    const existing = table.get(sourceKey);
    let learned: CamStep['learned'] = null;
    // A static entry is never overwritten by what arrives on the wire, so a frame from
    // that address teaches the switch nothing.
    if (existing?.kind !== 'static') {
      const moved = existing !== undefined && existing.port !== ingress.id;
      table.set(sourceKey, { mac: srcMac, port: ingress.id, vlan: frame.vlan, learnedAt: at, kind: 'dynamic' });
      learned = { mac: formatMac(srcMac), port: ingress.id, vlan: frame.vlan, moved, movedFrom: moved ? existing?.port : undefined };
    }

    // 3. The forwarding decision is taken on the destination address.
    const vlanPorts = portsInVlan(ports, frame.vlan);
    const others = vlanPorts.filter(port => port.id !== ingress.id).map(port => port.id);
    const destinationEntry = destinationKind === 'unicast' ? table.get(`${frame.vlan}:${dstMac}`) : undefined;
    const destinationKnown = destinationEntry !== undefined;

    let action: FrameAction;
    let egressPorts: string[];
    let reason: Bilingual;
    const ingressName = ingress.name;

    if (destinationKind === 'broadcast') {
      action = 'flood';
      egressPorts = others;
      reason = b(
        `Destinazione broadcast: la trama esce da tutte le porte della VLAN ${frame.vlan} tranne quella di ingresso (${ingressName}). Il broadcast non si apprende e non si filtra: è il confine del dominio di broadcast a limitarlo, non la CAM table.`,
        `Broadcast destination: the frame leaves every port in VLAN ${frame.vlan} except the one it arrived on (${ingressName}). A broadcast is neither learned nor filtered: what bounds it is the broadcast domain, not the CAM table.`
      );
    } else if (destinationKind === 'multicast') {
      action = 'flood';
      egressPorts = others;
      reason = b(
        `Destinazione multicast: senza IGMP snooping lo switch la tratta come un broadcast e la inonda su tutta la VLAN ${frame.vlan}. Con IGMP snooping uscirebbe solo dalle porte che hanno chiesto quel gruppo.`,
        `Multicast destination: without IGMP snooping the switch treats it like a broadcast and floods it across VLAN ${frame.vlan}. With IGMP snooping it would leave only the ports that joined that group.`
      );
    } else if (!destinationKnown) {
      action = 'flood';
      egressPorts = others;
      reason = b(
        `Unknown unicast: ${formatMac(dstMac)} non è in CAM table per la VLAN ${frame.vlan}, quindi la trama viene inondata su tutte le altre porte della VLAN. Non è un broadcast — l'indirizzo di destinazione resta unicast — ed è così che lo switch scopre dove si trova quell'host quando risponde.`,
        `Unknown unicast: ${formatMac(dstMac)} is not in the CAM table for VLAN ${frame.vlan}, so the frame is flooded out of every other port in the VLAN. This is not a broadcast — the destination address stays unicast — and it is how the switch discovers where that host is when it replies.`
      );
    } else if (destinationEntry.port === ingress.id) {
      action = 'filter';
      egressPorts = [];
      reason = b(
        `Filtering: ${formatMac(dstMac)} risulta sulla stessa porta da cui la trama è arrivata (${ingressName}), quindi mittente e destinatario sono sullo stesso segmento e lo switch scarta la trama. È il caso che si dimentica più spesso: la CAM table serve anche a non inoltrare.`,
        `Filtering: ${formatMac(dstMac)} sits on the same port the frame arrived on (${ingressName}), so sender and receiver are on the same segment and the switch discards the frame. This is the most commonly forgotten case: the CAM table also exists to *not* forward.`
      );
    } else {
      action = 'forward';
      egressPorts = [destinationEntry.port];
      reason = b(
        `Forwarding: ${formatMac(dstMac)} è noto sulla porta ${byId.get(destinationEntry.port)?.name ?? destinationEntry.port} nella VLAN ${frame.vlan}, quindi la trama esce solo da lì. Una sola decisione, presa sull'indirizzo MAC di destinazione.`,
        `Forwarding: ${formatMac(dstMac)} is known on port ${byId.get(destinationEntry.port)?.name ?? destinationEntry.port} in VLAN ${frame.vlan}, so the frame leaves only there. One decision, taken on the destination MAC address.`
      );
    }

    steps.push({
      frame: { ...frame, at },
      action,
      egressPorts,
      learned,
      agedOut,
      destinationKnown,
      destinationKind,
      reason,
      table: [...table.values()].sort((left, right) => left.vlan - right.vlan || left.mac.localeCompare(right.mac))
    });
  }

  return steps;
}

import type { Bilingual } from '../types';
import { formatMac } from './camTable';
import { normalizeMac } from './networkAccess';

/**
 * Port Security, and the three violation modes that are not interchangeable.
 *
 * The configuration is three commands, which is why the feature looks simple and is
 * routinely misconfigured. The distinctions that matter are all in what happens at the
 * violation: `protect` drops the offending traffic and says nothing at all, not even
 * incrementing the violation counter; `restrict` drops it, counts it and reports it;
 * `shutdown` — the default nobody remembers is the default — err-disables the port,
 * which takes down the legitimate host too and needs a human to bring it back.
 *
 * The other detail worth replaying is that sticky addresses are written into the
 * running configuration and do not age, so they survive a reload the moment the
 * configuration is saved.
 */

export type ViolationMode = 'protect' | 'restrict' | 'shutdown';
export type PortSecurityAction = 'learned' | 'allowed' | 'violation' | 'port-down';
export type PortState = 'up' | 'err-disabled';

export interface PortSecurityConfig {
  /** `switchport port-security maximum`; IOS defaults to 1. */
  maximum?: number;
  /** `switchport port-security violation`; IOS defaults to shutdown. */
  mode?: ViolationMode;
  /** `switchport port-security mac-address sticky`. */
  sticky?: boolean;
  /** `switchport port-security aging time`, in minutes; 0 disables aging. */
  agingMinutes?: number;
  /** `absolute` removes the entry on schedule, `inactivity` only if the host goes quiet. */
  agingType?: 'absolute' | 'inactivity';
}

export interface PortSecurityFrame {
  mac: string;
  /** Seconds since the start of the sequence. */
  at?: number;
}

export interface SecureMacEntry {
  mac: string;
  kind: 'dynamic' | 'sticky';
  learnedAt: number;
  lastSeenAt: number;
}

export interface PortSecurityStep {
  mac: string;
  at: number;
  action: PortSecurityAction;
  /** Secure addresses held after this frame. */
  secureMacs: SecureMacEntry[];
  /** Value of the SecurityViolation counter after this frame. */
  violationCount: number;
  portState: PortState;
  /** Whether a syslog message and an SNMP trap were generated. */
  notified: boolean;
  /** Addresses removed by aging before this frame. */
  agedOut: string[];
  reason: Bilingual;
}

export interface PortSecurityResult {
  config: Required<Omit<PortSecurityConfig, 'agingType'>> & { agingType: 'absolute' | 'inactivity' };
  steps: PortSecurityStep[];
  finalState: PortState;
  violationCount: number;
  secureMacs: SecureMacEntry[];
  /** Lines the feature adds to the running configuration. */
  configuration: string[];
  /** What it takes to bring the port back, when it went down. */
  recovery: string[] | null;
}

const b = (it: string, en: string): Bilingual => ({ it, en });

export function simulatePortSecurity(
  frames: PortSecurityFrame[],
  config: PortSecurityConfig = {},
  interfaceName = 'GigabitEthernet1/0/5'
): PortSecurityResult {
  const maximum = config.maximum ?? 1;
  const mode = config.mode ?? 'shutdown';
  const sticky = config.sticky ?? false;
  const agingMinutes = config.agingMinutes ?? 0;
  const agingType = config.agingType ?? 'absolute';

  if (!Number.isInteger(maximum) || maximum < 1 || maximum > 132) throw new Error('INVALID_MAXIMUM');
  if (!Number.isInteger(agingMinutes) || agingMinutes < 0 || agingMinutes > 1440) throw new Error('INVALID_AGING_TIME');

  const secure = new Map<string, SecureMacEntry>();
  const steps: PortSecurityStep[] = [];
  let violationCount = 0;
  let portState: PortState = 'up';
  let clock = 0;

  for (const frame of frames) {
    const mac = normalizeMac(frame.mac);
    const at = frame.at ?? clock;
    if (at < clock) throw new Error('TIME_WENT_BACKWARDS');
    clock = at;

    if (portState === 'err-disabled') {
      steps.push({
        mac: formatMac(mac), at, action: 'port-down',
        secureMacs: [...secure.values()], violationCount, portState, notified: false, agedOut: [],
        reason: b(
          'La porta è in err-disable: non passa più nulla, nemmeno il traffico dell’host legittimo. Finché non interviene un operatore, questa trama non viene neppure esaminata.',
          'The port is err-disabled: nothing passes any more, not even the legitimate host’s traffic. Until an operator steps in, this frame is not even examined.'
        )
      });
      continue;
    }

    // Aging runs before the frame is handled. Sticky addresses never age.
    const agedOut: string[] = [];
    if (agingMinutes > 0) {
      const limitSeconds = agingMinutes * 60;
      for (const [key, entry] of [...secure.entries()]) {
        if (entry.kind === 'sticky') continue;
        const reference = agingType === 'absolute' ? entry.learnedAt : entry.lastSeenAt;
        if (at - reference >= limitSeconds) {
          secure.delete(key);
          agedOut.push(formatMac(entry.mac));
        }
      }
    }

    const known = secure.get(mac);
    if (known) {
      known.lastSeenAt = at;
      steps.push({
        mac: formatMac(mac), at, action: 'allowed',
        secureMacs: [...secure.values()], violationCount, portState, notified: false, agedOut,
        reason: b(
          `${formatMac(mac)} è già un indirizzo sicuro su questa porta: la trama passa e l’ultima attività viene aggiornata.`,
          `${formatMac(mac)} is already a secure address on this port: the frame passes and the last-seen time is updated.`
        )
      });
      continue;
    }

    if (secure.size < maximum) {
      secure.set(mac, { mac, kind: sticky ? 'sticky' : 'dynamic', learnedAt: at, lastSeenAt: at });
      steps.push({
        mac: formatMac(mac), at, action: 'learned',
        secureMacs: [...secure.values()], violationCount, portState, notified: false, agedOut,
        reason: sticky
          ? b(
              `${formatMac(mac)} viene appreso come indirizzo sicuro sticky (${secure.size} di ${maximum}) e scritto nella running configuration: sopravvive al riavvio se la configurazione viene salvata, e non invecchia.`,
              `${formatMac(mac)} is learned as a sticky secure address (${secure.size} of ${maximum}) and written into the running configuration: it survives a reload once the configuration is saved, and it never ages.`
            )
          : b(
              `${formatMac(mac)} viene appreso come indirizzo sicuro dinamico (${secure.size} di ${maximum}). Resta in memoria ma non in configurazione: al riavvio la porta riparte da zero.`,
              `${formatMac(mac)} is learned as a dynamic secure address (${secure.size} of ${maximum}). It lives in memory but not in the configuration: after a reload the port starts over.`
            )
      });
      continue;
    }

    // Maximum reached and this address is new: this is the violation.
    let notified: boolean;
    let reason: Bilingual;
    if (mode === 'protect') {
      // Cisco's protect mode drops silently: no counter, no syslog, no trap.
      notified = false;
      reason = b(
        `Violazione in modalità protect: il massimo di ${maximum} indirizzi è raggiunto, quindi il traffico di ${formatMac(mac)} viene scartato in silenzio. La porta resta attiva, il contatore di violazioni NON avanza e non viene generato nessun messaggio: l’host non funziona e nei log non c’è niente da trovare.`,
        `Violation in protect mode: the maximum of ${maximum} addresses is reached, so traffic from ${formatMac(mac)} is dropped silently. The port stays up, the violation counter does NOT advance and no message is generated: the host does not work and there is nothing in the logs to find.`
      );
    } else if (mode === 'restrict') {
      violationCount += 1;
      notified = true;
      reason = b(
        `Violazione in modalità restrict: il traffico di ${formatMac(mac)} viene scartato, il contatore SecurityViolation passa a ${violationCount} e vengono generati un messaggio syslog e una trap SNMP. La porta resta attiva, quindi l’host legittimo continua a lavorare — è il compromesso che si sceglie in produzione.`,
        `Violation in restrict mode: traffic from ${formatMac(mac)} is dropped, the SecurityViolation counter moves to ${violationCount}, and a syslog message plus an SNMP trap are generated. The port stays up, so the legitimate host keeps working — the trade-off chosen in production.`
      );
    } else {
      violationCount += 1;
      notified = true;
      portState = 'err-disabled';
      reason = b(
        `Violazione in modalità shutdown, che è il comportamento PREDEFINITO: la porta va immediatamente in err-disable. Non si ferma solo ${formatMac(mac)} — si ferma tutto, compreso l’host legittimo, e la porta non torna su da sola. È il motivo per cui una violation mode non scelta esplicitamente può trasformare un telefono IP collegato in cascata in un guasto.`,
        `Violation in shutdown mode, which is the DEFAULT behaviour: the port goes err-disabled immediately. It does not stop ${formatMac(mac)} alone — it stops everything, the legitimate host included, and the port does not come back on its own. It is why a violation mode left unchosen can turn a daisy-chained IP phone into an outage.`
      );
    }

    steps.push({
      mac: formatMac(mac), at, action: 'violation',
      secureMacs: [...secure.values()], violationCount, portState, notified, agedOut, reason
    });
  }

  const configuration = [
    `interface ${interfaceName}`,
    ' switchport mode access',
    ' switchport port-security',
    ` switchport port-security maximum ${maximum}`,
    ` switchport port-security violation ${mode}`,
    ...(sticky ? [' switchport port-security mac-address sticky'] : []),
    ...(agingMinutes > 0
      ? [` switchport port-security aging time ${agingMinutes}`, ` switchport port-security aging type ${agingType}`]
      : []),
    ...[...secure.values()]
      .filter(entry => entry.kind === 'sticky')
      .map(entry => ` switchport port-security mac-address sticky ${formatMac(entry.mac)}`)
  ];

  return {
    config: { maximum, mode, sticky, agingMinutes, agingType },
    steps,
    finalState: portState,
    violationCount,
    secureMacs: [...secure.values()],
    configuration,
    recovery: portState === 'err-disabled'
      ? [
          `interface ${interfaceName}`,
          ' shutdown',
          ' no shutdown',
          '!',
          '! oppure, per farla risalire da sola dopo 300 s / or, to let it recover on its own after 300 s',
          'errdisable recovery cause psecure-violation',
          'errdisable recovery interval 300'
        ]
      : null
  };
}

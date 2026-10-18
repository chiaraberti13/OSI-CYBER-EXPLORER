/**
 * EJPT-03 offline pivoting fixtures. The lab models route and port-forward state only;
 * it never configures the host, opens a listener, or sends network traffic.
 */
import type { Bilingual } from '../types';

export type PivotMode = 'route' | 'port-forward';
export type PivotServicePort = 443 | 22;
export type PivotLeaseMinutes = 5 | 10;

export const PIVOTING_TOPOLOGY = {
  tester: { address: '198.51.100.10', subnet: '198.51.100.0/24' },
  pivot: { external: '198.51.100.20', internal: '203.0.113.1' },
  target: { address: '203.0.113.25', subnet: '203.0.113.0/24' },
  route: '203.0.113.25/32',
  listener: '198.51.100.20:8443',
  destination: '203.0.113.25:443',
  allowedPort: 443 as const
} as const;

export const PIVOTING_COPY = {
  it: {
    authorization:
      'Scope didattico: solo 203.0.113.25 TCP/443. Gli indirizzi RFC 5737 sono riservati alla documentazione; nessun host reale è coinvolto.',
    duration: 'Durata massima autorizzata',
    setup: 'Attiva la simulazione',
    teardown: 'Esegui teardown',
    advance: 'Avanza di 5 minuti',
    routeBefore: 'Tabella route prima',
    routeAfter: 'Tabella route dopo',
    noHostRoute: 'Nessuna route specifica per il segmento obiettivo',
    hostRoute: '203.0.113.25/32 via 198.51.100.20 · host route di fixture',
    mappingBefore: 'Port forwarding prima',
    mappingAfter: 'Port forwarding dopo',
    noMapping: 'Nessuna mappatura attiva',
    mapping: '198.51.100.20:8443 → 203.0.113.25:443/TCP · fixture',
    request: 'Servizio richiesto',
    allowedService: 'HTTPS · TCP/443 · autorizzato',
    outOfScopeService: 'SSH · TCP/22 · fuori scope',
    forwarding: 'Forwarding del pivot abilitato',
    firewall: 'Firewall consente solo il servizio autorizzato',
    run: 'Simula il flusso',
    flow: 'Flusso simulato',
    telemetry: 'Eventi firewall e IDS (fixture)',
    controls: 'Lettura difensiva',
    remaining: 'Lease simulato',
    minutes: 'minuti',
    active: 'Configurazione didattica attiva',
    expired: 'Lease scaduto: route/mappatura rimossi automaticamente.',
    cleaned: 'Teardown completato: stato iniziale ripristinato e fixture pulita.',
    inactive: 'Attiva la simulazione dopo aver confermato lo scope.',
    modeRoute: 'Route host /32',
    modeForward: 'Port forwarding singola porta',
    routeExplanation:
      'La route sul tester indirizza il traffico destinato all’host attraverso il pivot. Non autorizza tutte le porte: l’host route non amplia lo scope TCP/443.',
    forwardExplanation:
      'Il tester raggiunge solo il listener locale della fixture (8443), mappato a un servizio preciso (TCP/443). Non viene aggiunta una route verso la subnet.',
    routeSuccess:
      'Il tester instrada l’host /32 al pivot; il pivot inoltra verso TCP/443, consentito dallo scope e dal firewall fixture.',
    forwardSuccess:
      'Il tester contatta il listener fixture 8443 sul pivot; la mappatura inoltra solo al servizio TCP/443 autorizzato.',
    outOfScope:
      'La destinazione TCP/22 è fuori scope: il percorso di rete può esistere, ma la policy deve negare il servizio.',
    firewallDenied: 'Il firewall fixture nega il flusso; la route/mappatura non equivale a un’autorizzazione.',
    forwardingDisabled: 'Il pivot non inoltra il traffico: il percorso simulato non raggiunge il target.',
    noMappingForService: 'La fixture non espone una mappatura per TCP/22: nessun listener o flusso viene creato.',
    scopePrompt: 'Confermo l’autorizzazione limitata al target e al servizio indicati.',
    noNetwork:
      'Tutte le azioni sono deterministiche e locali allo stato UI: non vengono eseguiti comandi, configurati sistemi o aperti socket; nessuna richiesta di rete viene inviata.'
  },
  en: {
    authorization:
      'Teaching scope: only 203.0.113.25 TCP/443. RFC 5737 addresses are reserved for documentation; no real host is involved.',
    duration: 'Maximum authorized duration',
    setup: 'Enable simulation',
    teardown: 'Tear down',
    advance: 'Advance by 5 minutes',
    routeBefore: 'Routing table before',
    routeAfter: 'Routing table after',
    noHostRoute: 'No specific route for the target segment',
    hostRoute: '203.0.113.25/32 via 198.51.100.20 · fixture host route',
    mappingBefore: 'Port forwarding before',
    mappingAfter: 'Port forwarding after',
    noMapping: 'No active mapping',
    mapping: '198.51.100.20:8443 → 203.0.113.25:443/TCP · fixture',
    request: 'Requested service',
    allowedService: 'HTTPS · TCP/443 · authorized',
    outOfScopeService: 'SSH · TCP/22 · out of scope',
    forwarding: 'Pivot forwarding enabled',
    firewall: 'Firewall allows only the authorized service',
    run: 'Simulate flow',
    flow: 'Simulated flow',
    telemetry: 'Firewall and IDS events (fixture)',
    controls: 'Defensive interpretation',
    remaining: 'Simulated lease',
    minutes: 'minutes',
    active: 'Teaching configuration active',
    expired: 'Lease expired: route/mapping removed automatically.',
    cleaned: 'Teardown complete: initial state restored and fixture cleared.',
    inactive: 'Enable the simulation after confirming scope.',
    modeRoute: 'Host route /32',
    modeForward: 'Single-port forwarding',
    routeExplanation:
      'The route on the tester directs traffic for the host through the pivot. It does not authorize every port: the host route does not expand TCP/443 scope.',
    forwardExplanation:
      'The tester reaches only the fixture’s local listener (8443), mapped to one precise service (TCP/443). No route to the subnet is added.',
    routeSuccess:
      'The tester routes the /32 host to the pivot; the pivot forwards to TCP/443, allowed by fixture scope and firewall.',
    forwardSuccess:
      'The tester contacts the pivot’s fixture listener on 8443; the mapping forwards only to the authorized TCP/443 service.',
    outOfScope: 'TCP/22 is out of scope: a network path may exist, but policy must deny the service.',
    firewallDenied: 'The fixture firewall denies the flow; a route/mapping is not authorization.',
    forwardingDisabled: 'The pivot does not forward traffic: the simulated path cannot reach the target.',
    noMappingForService: 'The fixture has no mapping for TCP/22: no listener or flow is created.',
    scopePrompt: 'I confirm authorization is limited to the stated target and service.',
    noNetwork:
      'All actions are deterministic and local to UI state: no commands run, systems are configured, or sockets opened; no network request is sent.'
  }
} as const satisfies Record<string, Record<string, string>>;

export interface PivotSession {
  mode: PivotMode;
  leaseMinutes: PivotLeaseMinutes;
  elapsedMinutes: number;
  active: boolean;
}

export type PivotOutcome =
  'allowed' | 'out-of-scope' | 'firewall-denied' | 'forwarding-disabled' | 'no-mapping' | 'inactive';

export interface PivotRunResult {
  outcome: PivotOutcome;
  flow: string[];
  telemetry: string[];
  explanation: Bilingual;
}

export function createPivotSession(
  mode: PivotMode,
  leaseMinutes: PivotLeaseMinutes,
  scopeConfirmed: boolean
): PivotSession | null {
  if (!scopeConfirmed || ![5, 10].includes(leaseMinutes)) return null;
  return { mode, leaseMinutes, elapsedMinutes: 0, active: true };
}

export function advancePivotTime(session: PivotSession, minutes = 5): PivotSession {
  if (!session.active || !Number.isInteger(minutes) || minutes <= 0) return session;
  const elapsedMinutes = Math.min(session.elapsedMinutes + minutes, session.leaseMinutes);
  return { ...session, elapsedMinutes, active: elapsedMinutes < session.leaseMinutes };
}

export function teardownPivotSession(session: PivotSession): PivotSession {
  return { ...session, active: false };
}

export function simulatePivotFlow(
  session: PivotSession,
  servicePort: PivotServicePort,
  forwardingEnabled: boolean,
  firewallAllows: boolean
): PivotRunResult {
  if (!session.active) {
    return {
      outcome: 'inactive',
      flow: [],
      telemetry: ['FLOW_BLOCKED: lease inactive'],
      explanation: {
        it: 'La route e le mappature non sono attive; configura una nuova sessione didattica autorizzata.',
        en: 'The route and mappings are inactive; configure a new authorized teaching session.'
      }
    };
  }

  const flow =
    session.mode === 'route'
      ? [
          `${PIVOTING_TOPOLOGY.tester.address} → ${PIVOTING_TOPOLOGY.pivot.external}`,
          `${PIVOTING_TOPOLOGY.pivot.internal} → ${PIVOTING_TOPOLOGY.target.address}:${servicePort}/TCP`
        ]
      : [
          `${PIVOTING_TOPOLOGY.tester.address} → ${PIVOTING_TOPOLOGY.listener}`,
          `${PIVOTING_TOPOLOGY.pivot.internal} → ${PIVOTING_TOPOLOGY.target.address}:${PIVOTING_TOPOLOGY.allowedPort}/TCP`
        ];
  const telemetry = [
    session.mode === 'route' ? 'ROUTE_CHANGE: host route /32' : 'PORT_FORWARD: fixture mapping 8443→443'
  ];

  if (session.mode === 'port-forward' && servicePort !== PIVOTING_TOPOLOGY.allowedPort) {
    return {
      outcome: 'no-mapping',
      flow: [`${PIVOTING_TOPOLOGY.tester.address} → ${PIVOTING_TOPOLOGY.pivot.external}:9443/TCP`],
      telemetry: [...telemetry, 'FIREWALL_DENY: no approved mapping', 'IDS_OBSERVATION: unmapped listener attempt'],
      explanation: { it: PIVOTING_COPY.it.noMappingForService, en: PIVOTING_COPY.en.noMappingForService }
    };
  }
  if (servicePort !== PIVOTING_TOPOLOGY.allowedPort) {
    return {
      outcome: 'out-of-scope',
      flow,
      telemetry: [
        ...telemetry,
        'FIREWALL_DENY: TCP/22 outside authorized scope',
        'IDS_OBSERVATION: denied east-west attempt'
      ],
      explanation: { it: PIVOTING_COPY.it.outOfScope, en: PIVOTING_COPY.en.outOfScope }
    };
  }
  if (!forwardingEnabled) {
    return {
      outcome: 'forwarding-disabled',
      flow,
      telemetry: [...telemetry, 'PIVOT_FORWARDING: disabled', 'FLOW_BLOCKED: pivot forwarding unavailable'],
      explanation: {
        it: PIVOTING_COPY.it.forwardingDisabled,
        en: PIVOTING_COPY.en.forwardingDisabled
      }
    };
  }
  if (!firewallAllows) {
    return {
      outcome: 'firewall-denied',
      flow,
      telemetry: [...telemetry, 'FIREWALL_DENY: TCP/443', 'IDS_ALERT: policy-denied pivot flow'],
      explanation: { it: PIVOTING_COPY.it.firewallDenied, en: PIVOTING_COPY.en.firewallDenied }
    };
  }

  return {
    outcome: 'allowed',
    flow,
    telemetry: [
      ...telemetry,
      'PIVOT_FORWARDING: enabled',
      'FIREWALL_ALLOW: TCP/443 in authorized fixture scope',
      'IDS_OBSERVATION: simulated east-west flow'
    ],
    explanation:
      session.mode === 'route'
        ? { it: PIVOTING_COPY.it.routeSuccess, en: PIVOTING_COPY.en.routeSuccess }
        : { it: PIVOTING_COPY.it.forwardSuccess, en: PIVOTING_COPY.en.forwardSuccess }
  };
}

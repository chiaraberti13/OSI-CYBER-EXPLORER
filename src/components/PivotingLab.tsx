import { useState } from 'react';
import { ArrowRight, GitBranch, ShieldAlert, TimerOff } from 'lucide-react';
import {
  advancePivotTime,
  createPivotSession,
  PIVOTING_COPY,
  PIVOTING_TOPOLOGY,
  simulatePivotFlow,
  teardownPivotSession,
  type PivotLeaseMinutes,
  type PivotMode,
  type PivotRunResult,
  type PivotServicePort,
  type PivotSession
} from '../content/pivotingLab';
import { useStore } from '../store';

const UI = {
  it: {
    eyebrow: 'eJPT · PIVOTING · SCOPE · DURATA · TEARDOWN',
    title: 'Pivoting: route o port forwarding?',
    intro:
      'Confronta una host route verso un host autorizzato con la mappatura di una singola porta. Osserva tabella, flusso e controlli senza configurare reti reali.',
    topology: 'Topologia documentale a due subnet',
    tester: 'Sistema di test',
    pivot: 'Host ponte / pivot',
    target: 'Host obiettivo',
    labMode: 'Meccanismo da simulare',
    scope: 'Perimetro autorizzato',
    scopeCheck: 'Confermo l’autorizzazione limitata al target e al servizio indicati.',
    duration: 'Durata massima autorizzata',
    five: '5 minuti',
    ten: '10 minuti',
    forwarding: 'Forwarding del pivot abilitato',
    firewall: 'Firewall consente solo il servizio autorizzato',
    requested: 'Servizio richiesto',
    https: 'HTTPS · TCP/443 · autorizzato',
    ssh: 'SSH · TCP/22 · fuori scope',
    setup: 'Attiva la simulazione',
    teardown: 'Esegui teardown',
    advance: 'Avanza di 5 minuti',
    before: 'Prima',
    after: 'Dopo',
    routeTable: 'Tabella route del tester',
    mappingTable: 'Mappatura del pivot',
    noHostRoute: 'Nessuna route specifica per l’host obiettivo',
    hostRoute: '203.0.113.25/32 via 198.51.100.20',
    noMapping: 'Nessuna mappatura attiva',
    mapping: '198.51.100.20:8443 → 203.0.113.25:443/TCP',
    run: 'Simula il flusso selezionato',
    flow: 'Flusso osservato (simulazione)',
    telemetry: 'Telemetria firewall / IDS (simulata)',
    outcome: 'Interpretazione',
    controls: 'Lettura difensiva',
    remaining: 'Lease simulato',
    minutes: 'minuti',
    active: 'Configurazione didattica attiva',
    expired: 'Lease scaduto: route o mappatura rimossi automaticamente.',
    cleaned: 'Teardown completato: configurazione rimossa e stato iniziale ripristinato.',
    inactive: 'Conferma lo scope e attiva una simulazione.',
    noNetwork:
      'Nessun comando viene eseguito, nessun host o firewall è configurato e nessun socket o traffico di rete viene creato. Tutto resta nello stato locale dell’interfaccia.'
  },
  en: {
    eyebrow: 'eJPT · PIVOTING · SCOPE · LEASE · TEARDOWN',
    title: 'Pivoting: route or port forwarding?',
    intro:
      'Compare a host route to an authorized host with a single-port mapping. Inspect tables, flow, and controls without configuring real networks.',
    topology: 'Two-subnet documentation topology',
    tester: 'Test system',
    pivot: 'Bridge host / pivot',
    target: 'Target host',
    labMode: 'Mechanism to simulate',
    scope: 'Authorized scope',
    scopeCheck: 'I confirm authorization is limited to the stated target and service.',
    duration: 'Maximum authorized duration',
    five: '5 minutes',
    ten: '10 minutes',
    forwarding: 'Pivot forwarding enabled',
    firewall: 'Firewall allows only the authorized service',
    requested: 'Requested service',
    https: 'HTTPS · TCP/443 · authorized',
    ssh: 'SSH · TCP/22 · out of scope',
    setup: 'Enable simulation',
    teardown: 'Tear down',
    advance: 'Advance by 5 minutes',
    before: 'Before',
    after: 'After',
    routeTable: 'Tester routing table',
    mappingTable: 'Pivot mapping',
    noHostRoute: 'No specific route to the target host',
    hostRoute: '203.0.113.25/32 via 198.51.100.20',
    noMapping: 'No active mapping',
    mapping: '198.51.100.20:8443 → 203.0.113.25:443/TCP',
    run: 'Simulate selected flow',
    flow: 'Observed flow (simulation)',
    telemetry: 'Firewall / IDS telemetry (simulated)',
    outcome: 'Interpretation',
    controls: 'Defensive interpretation',
    remaining: 'Simulated lease',
    minutes: 'minutes',
    active: 'Teaching configuration active',
    expired: 'Lease expired: route or mapping removed automatically.',
    cleaned: 'Teardown complete: configuration removed and initial state restored.',
    inactive: 'Confirm scope and enable a simulation.',
    noNetwork:
      'No commands run, hosts or firewalls are configured, and no sockets or network traffic are created. Everything stays in local interface state.'
  }
} as const;

export default function PivotingLab() {
  const language = useStore((state) => state.language);
  const copy = UI[language];
  const model = PIVOTING_COPY[language];
  const [scopeConfirmed, setScopeConfirmed] = useState(false);
  const [mode, setMode] = useState<PivotMode>('route');
  const [leaseMinutes, setLeaseMinutes] = useState<PivotLeaseMinutes>(5);
  const [servicePort, setServicePort] = useState<PivotServicePort>(443);
  const [forwardingEnabled, setForwardingEnabled] = useState(true);
  const [firewallAllows, setFirewallAllows] = useState(true);
  const [session, setSession] = useState<PivotSession | null>(null);
  const [result, setResult] = useState<PivotRunResult | null>(null);
  const [teardownComplete, setTeardownComplete] = useState(false);

  const active = session?.active ?? false;
  const expired = Boolean(
    session && !session.active && !teardownComplete && session.elapsedMinutes >= session.leaseMinutes
  );
  const setUp = () => {
    setSession(createPivotSession(mode, leaseMinutes, scopeConfirmed));
    setResult(null);
    setTeardownComplete(false);
  };
  const teardown = () => {
    if (!session?.active) return;
    setSession(teardownPivotSession(session));
    setResult(null);
    setTeardownComplete(true);
  };
  const routeInstalled = active && session?.mode === 'route';
  const mappingInstalled = active && session?.mode === 'port-forward';
  const explanation = mode === 'route' ? model.routeExplanation : model.forwardExplanation;

  return (
    <div className="space-y-5" aria-labelledby="pivoting-lab-title">
      <header className="rounded-xl border border-slate-200 bg-white p-5 md:p-7">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
            <GitBranch aria-hidden="true" className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1 id="pivoting-lab-title" className="mt-1 text-xl font-semibold text-slate-900">
              {copy.title}
            </h1>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-600">{copy.intro}</p>
          </div>
        </div>
        <div className="mt-5 rounded-lg border border-indigo-200 bg-indigo-50/60 p-4">
          <h2 className="text-sm font-semibold text-indigo-950">{copy.scope}</h2>
          <p className="mt-1 break-words font-mono text-sm text-indigo-900">
            {PIVOTING_TOPOLOGY.target.address}/32 · TCP/443 · ≤ 10 min
          </p>
          <p className="mt-2 text-xs leading-relaxed text-indigo-950">{model.authorization}</p>
          <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm text-slate-800">
            <input
              type="checkbox"
              checked={scopeConfirmed}
              disabled={active}
              onChange={(event) => setScopeConfirmed(event.target.checked)}
              className="h-4 w-4 rounded border-slate-400 text-indigo-700 focus:ring-indigo-600"
            />
            <span>{copy.scopeCheck}</span>
          </label>
        </div>
      </header>

      <section
        className="rounded-xl border border-slate-200 bg-white p-4 md:p-5"
        aria-labelledby="pivot-topology-title"
      >
        <h2 id="pivot-topology-title" className="font-semibold text-slate-900">
          {copy.topology}
        </h2>
        <div
          className="mt-3 grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]"
          role="img"
          aria-label={`${copy.tester} ${PIVOTING_TOPOLOGY.tester.address} — ${copy.pivot} ${PIVOTING_TOPOLOGY.pivot.external} / ${PIVOTING_TOPOLOGY.pivot.internal} — ${copy.target} ${PIVOTING_TOPOLOGY.target.address}`}
        >
          <TopologyNode
            title={copy.tester}
            address={PIVOTING_TOPOLOGY.tester.address}
            subnet={PIVOTING_TOPOLOGY.tester.subnet}
          />
          <div className="flex items-center justify-center text-indigo-700" aria-hidden="true">
            <ArrowRight className="h-5 w-5 rotate-90 md:rotate-0" />
          </div>
          <TopologyNode
            title={copy.pivot}
            address={`${PIVOTING_TOPOLOGY.pivot.external} ↔ ${PIVOTING_TOPOLOGY.pivot.internal}`}
            subnet="two interfaces"
          />
          <div className="flex items-center justify-center text-indigo-700" aria-hidden="true">
            <ArrowRight className="h-5 w-5 rotate-90 md:rotate-0" />
          </div>
          <TopologyNode
            title={copy.target}
            address={PIVOTING_TOPOLOGY.target.address}
            subnet={PIVOTING_TOPOLOGY.target.subnet}
          />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2" aria-label={copy.labMode}>
        <article className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
          <h2 className="font-semibold text-slate-900">{copy.labMode}</h2>
          <label className="mt-3 block text-sm font-semibold text-slate-700">
            {copy.labMode}
            <select
              value={mode}
              disabled={active}
              onChange={(event) => setMode(event.target.value as PivotMode)}
              className="mt-1 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:bg-slate-100"
            >
              <option value="route">{model.modeRoute}</option>
              <option value="port-forward">{model.modeForward}</option>
            </select>
          </label>
          <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">{explanation}</p>
          <label className="mt-3 block text-sm font-semibold text-slate-700">
            {copy.duration}
            <select
              value={leaseMinutes}
              disabled={active}
              onChange={(event) => setLeaseMinutes(Number(event.target.value) as PivotLeaseMinutes)}
              className="mt-1 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:bg-slate-100"
            >
              <option value={5}>{copy.five}</option>
              <option value={10}>{copy.ten}</option>
            </select>
          </label>
          <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800">
            <input
              type="checkbox"
              checked={forwardingEnabled}
              disabled={active}
              onChange={(event) => setForwardingEnabled(event.target.checked)}
              className="h-4 w-4 rounded border-slate-400 text-indigo-700 focus:ring-indigo-600"
            />
            <span>{model.forwarding}</span>
          </label>
          <label className="mt-2 flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800">
            <input
              type="checkbox"
              checked={firewallAllows}
              disabled={active}
              onChange={(event) => setFirewallAllows(event.target.checked)}
              className="h-4 w-4 rounded border-slate-400 text-indigo-700 focus:ring-indigo-600"
            />
            <span>{model.firewall}</span>
          </label>
          <label className="mt-2 block text-sm font-semibold text-slate-700">
            {copy.requested}
            <select
              value={servicePort}
              disabled={active}
              onChange={(event) => setServicePort(Number(event.target.value) as PivotServicePort)}
              className="mt-1 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:bg-slate-100"
            >
              <option value={443}>{copy.https}</option>
              <option value={22}>{copy.ssh}</option>
            </select>
          </label>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={setUp}
              disabled={!scopeConfirmed || active}
              className="min-h-11 rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {copy.setup}
            </button>
            <button
              type="button"
              onClick={() => session && setSession(advancePivotTime(session))}
              disabled={!active}
              className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              <span className="inline-flex items-center gap-2">
                <TimerOff aria-hidden="true" className="h-4 w-4" />
                {copy.advance}
              </span>
            </button>
            <button
              type="button"
              onClick={teardown}
              disabled={!active}
              className="min-h-11 rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              {copy.teardown}
            </button>
          </div>
        </article>

        <article className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 md:p-5">
          <h2 className="font-semibold text-slate-900">{copy.routeTable}</h2>
          <Comparison
            before={copy.noHostRoute}
            after={routeInstalled ? model.hostRoute : copy.noHostRoute}
            copy={copy}
          />
          <h2 className="font-semibold text-slate-900">{copy.mappingTable}</h2>
          <Comparison before={copy.noMapping} after={mappingInstalled ? model.mapping : copy.noMapping} copy={copy} />
          {session && (
            <div
              className={`rounded-lg border p-3 text-sm ${active ? 'border-emerald-200 bg-emerald-50 text-emerald-950' : 'border-slate-200 bg-slate-50 text-slate-800'}`}
              role="status"
              aria-live="polite"
            >
              <p className="font-semibold">
                {active ? copy.active : expired ? copy.expired : teardownComplete ? copy.cleaned : copy.inactive}
              </p>
              <p className="mt-1">
                {copy.remaining}: {Math.max(session.leaseMinutes - session.elapsedMinutes, 0)} {copy.minutes}
              </p>
            </div>
          )}
        </article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 md:p-5" aria-labelledby="pivot-flow-title">
        <h2 id="pivot-flow-title" className="font-semibold text-slate-900">
          {copy.flow}
        </h2>
        <button
          type="button"
          onClick={() =>
            session && setResult(simulatePivotFlow(session, servicePort, forwardingEnabled, firewallAllows))
          }
          disabled={!active}
          className="mt-3 min-h-11 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {copy.run}
        </button>
        {!session && <p className="mt-3 text-sm text-slate-600">{copy.inactive}</p>}
        {result && (
          <div className="mt-4 grid gap-4 lg:grid-cols-2" aria-live="polite">
            <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
              <h3 className="font-semibold text-indigo-950">{copy.outcome}</h3>
              <p className="mt-2 text-sm leading-relaxed text-indigo-950">{result.explanation[language]}</p>
              <ol className="mt-3 list-decimal space-y-1 pl-5 font-mono text-xs text-indigo-950">
                {result.flow.map((hop) => (
                  <li key={hop}>{hop}</li>
                ))}
              </ol>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h3 className="flex items-center gap-2 font-semibold text-amber-950">
                <ShieldAlert aria-hidden="true" className="h-4 w-4" />
                {copy.telemetry}
              </h3>
              <ul className="mt-2 space-y-1 font-mono text-xs text-amber-950">
                {result.telemetry.map((event) => (
                  <li key={event}>{event}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {session?.active && result && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-900">{copy.controls}</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-700">
              {result.outcome === 'allowed'
                ? language === 'it'
                  ? 'Correla cambio della route sul tester, forwarding al pivot, connessioni east-west e regola firewall prevista. Una route o una mappatura non è di per sé un’autorizzazione.'
                  : 'Correlate the tester route change, pivot forwarding, east-west connections, and expected firewall rule. A route or mapping is not authorization by itself.'
                : language === 'it'
                  ? 'Usa il deny firewall e l’osservazione IDS come evidenza della policy applicata; verifica anche configurazione e scope autorizzato.'
                  : 'Use the firewall denial and IDS observation as evidence of policy enforcement; also verify configuration and authorized scope.'}
            </p>
          </div>
        )}
        <p className="mt-4 text-xs leading-relaxed text-slate-600">{copy.noNetwork}</p>
      </section>
    </div>
  );
}

function TopologyNode({ title, address, subnet }: { title: string; address: string; subnet: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">{title}</p>
      <p className="mt-1 break-words font-mono text-xs text-slate-900">{address}</p>
      <p className="mt-1 break-words text-xs text-slate-600">{subnet}</p>
    </div>
  );
}

function Comparison({
  before,
  after,
  copy
}: {
  before: string;
  after: string;
  copy: { before: string; after: string };
}) {
  return (
    <dl className="grid gap-2 sm:grid-cols-2">
      <div className="rounded-lg bg-slate-50 p-3">
        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.before}</dt>
        <dd className="mt-1 break-words font-mono text-xs text-slate-800">{before}</dd>
      </div>
      <div className="rounded-lg bg-indigo-50/70 p-3">
        <dt className="text-xs font-semibold uppercase tracking-wide text-indigo-700">{copy.after}</dt>
        <dd className="mt-1 break-words font-mono text-xs text-indigo-950">{after}</dd>
      </div>
    </dl>
  );
}

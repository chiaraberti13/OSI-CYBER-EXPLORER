import { useMemo, useState } from 'react';
import { ArrowRight, Ban, CircleCheck, Info, Network, Route, Settings2, Split } from 'lucide-react';
import { traceRoundTrip, type AclPlacement, type StepVerdict, type TraceResult } from '../lib/pathTrace';
import { TOPO_ACL_TEXT, TOPO_HOSTS, TOPO_INTERNET, TOPO_LINKS, TOPO_TRAFFIC, TOPO_VLANS } from '../content/pathTopology';
import { useStore } from '../store';

const VERDICT_STYLE: Record<StepVerdict, { row: string; badge: string; Icon: typeof Info }> = {
  forward: { row: 'border-emerald-200 bg-emerald-50/50', badge: 'bg-emerald-100 text-emerald-900', Icon: CircleCheck },
  drop: { row: 'border-rose-300 bg-rose-50', badge: 'bg-rose-100 text-rose-900', Icon: Ban },
  info: { row: 'border-slate-200 bg-white', badge: 'bg-slate-100 text-slate-600', Icon: Info }
};

export default function PathTraceLab() {
  const language = useStore(state => state.language);

  const [sourceId, setSourceId] = useState('pc-a');
  const [destinationId, setDestinationId] = useState('server');
  const [trafficId, setTrafficId] = useState('https');
  const [aclPlacement, setAclPlacement] = useState<AclPlacement>('inbound-users');
  const [voiceOnTrunk, setVoiceOnTrunk] = useState(true);
  const [nativeVlanConsistent, setNativeVlanConsistent] = useState(true);
  const [natEnabled, setNatEnabled] = useState(true);
  const [defaultRoutePresent, setDefaultRoutePresent] = useState(true);

  const traffic = TOPO_TRAFFIC.find(item => item.id === trafficId) ?? TOPO_TRAFFIC[0];

  const trip = useMemo(() => traceRoundTrip({
    sourceId,
    destinationId,
    protocol: traffic.protocol,
    port: traffic.port,
    aclPlacement,
    trunkAllowedVlans: voiceOnTrunk ? [10, 20, 99] : [10, 99],
    nativeVlanConsistent,
    natEnabled,
    defaultRoutePresent
  }), [sourceId, destinationId, traffic, aclPlacement, voiceOnTrunk, nativeVlanConsistent, natEnabled, defaultRoutePresent]);

  const t = language === 'it'
    ? {
        title: 'Tracciatore di percorso',
        subtitle: 'Scegli sorgente, destinazione e traffico: ogni decisione che il pacchetto incontra viene calcolata, non descritta. Cambia una condizione e guarda dove il percorso si interrompe.',
        topology: 'Topologia di riferimento', traffic: 'Traffico', from: 'Sorgente', to: 'Destinazione',
        conditions: 'Condizioni da modificare',
        aclLabel: 'Posizione della ACL', aclIn: 'In ingresso sulla VLAN 10', aclOut: 'In uscita sulla VLAN 50', aclNone: 'Nessuna ACL applicata',
        voice: 'VLAN 20 ammessa sul trunk', native: 'Native VLAN coerente sui due capi', nat: 'NAT overload attivo', defRoute: 'Default route presente',
        forward: 'Andata', ret: 'Ritorno', delivered: 'Consegnato', dropped: 'Scartato',
        aclRef: 'La ACL applicata', evidence: 'Come si verifica',
        asymmetric: 'Le due direzioni non si comportano allo stesso modo',
        symmetric: 'Andata e ritorno si comportano allo stesso modo',
        l2note: 'Questo traffico non ha lasciato il Layer 2.',
        internet: 'Internet (8.8.8.8)'
      }
    : {
        title: 'Path tracer',
        subtitle: 'Pick a source, a destination, and the traffic: every decision the packet meets is computed, not described. Change one condition and watch where the path stops.',
        topology: 'Reference topology', traffic: 'Traffic', from: 'Source', to: 'Destination',
        conditions: 'Conditions you can change',
        aclLabel: 'ACL placement', aclIn: 'Inbound on VLAN 10', aclOut: 'Outbound on VLAN 50', aclNone: 'No ACL applied',
        voice: 'VLAN 20 allowed on the trunk', native: 'Native VLAN consistent on both ends', nat: 'NAT overload enabled', defRoute: 'Default route present',
        forward: 'Forward', ret: 'Return', delivered: 'Delivered', dropped: 'Dropped',
        aclRef: 'The ACL in use', evidence: 'How to verify it',
        asymmetric: 'The two directions do not behave the same way',
        symmetric: 'Both directions behave the same way',
        l2note: 'This traffic never left Layer 2.',
        internet: 'Internet (8.8.8.8)'
      };

  const endpoints = [...TOPO_HOSTS.map(host => ({ id: host.id, label: `${host.name} · ${host.ip}` })), { id: TOPO_INTERNET.id, label: t.internet }];

  function renderTrace(result: TraceResult, heading: string) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5" aria-labelledby={`trace-${heading}`}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <h3 id={`trace-${heading}`} className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Route className="h-4 w-4 text-indigo-600" aria-hidden="true" />{heading}
          </h3>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${result.delivered ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
            {result.delivered ? t.delivered : t.dropped}
          </span>
        </div>

        <ol className="mt-4 space-y-2">
          {result.steps.map((step, index) => {
            const style = VERDICT_STYLE[step.verdict];
            const Icon = style.Icon;
            return (
              <li key={`${step.kind}-${index}`} className={`rounded-lg border p-3 ${style.row}`}>
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${style.badge}`}>{index + 1}</span>
                  <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                  <span className="text-xs font-semibold text-slate-900">{step.title[language]}</span>
                  <code className="eyebrow min-w-0">{step.device}</code>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{step.detail[language]}</p>
                {step.evidence ? (
                  <p className="mt-2 text-[11px] text-slate-500">
                    <span className="eyebrow">{t.evidence}</span> <code className="text-indigo-700">{step.evidence}</code>
                  </p>
                ) : null}
              </li>
            );
          })}
        </ol>

        {result.dropReason ? (
          <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium leading-relaxed text-rose-900">{result.dropReason[language]}</p>
        ) : null}
        {result.layer2Only ? (
          <p className="mt-3 rounded-lg border border-sky-100 bg-sky-50 p-3 text-xs leading-relaxed text-sky-900">{t.l2note}</p>
        ) : null}
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-indigo-50 p-3 text-indigo-700"><Split className="h-6 w-6" aria-hidden="true" /></div>
          <div>
            <p className="eyebrow">DECIDE · FORWARD · ENFORCE · PROVE</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">{t.title}</h1>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-600">{t.subtitle}</p>
          </div>
        </div>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-5" aria-labelledby="topology-title">
        <h2 id="topology-title" className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Network className="h-4 w-4 text-indigo-600" aria-hidden="true" />{t.topology}
        </h2>
        <div className="mt-4 grid gap-2 text-xs lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-center">
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="eyebrow">VLAN 10 · 20</p>
            {TOPO_HOSTS.filter(host => host.device === 'sw-access').map(host => (
              <p key={host.id} className="mt-1 font-mono text-[11px] text-slate-700">{host.name} {host.ip}</p>
            ))}
          </div>
          <ArrowRight className="hidden h-4 w-4 justify-self-center text-slate-300 lg:block" aria-hidden="true" />
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="eyebrow">SW-ACCESS</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
              {language === 'it' ? 'Trunk' : 'Trunk'} {TOPO_LINKS.accessTrunk.port} · native {TOPO_LINKS.accessTrunk.nativeVlan}
            </p>
          </div>
          <ArrowRight className="hidden h-4 w-4 justify-self-center text-slate-300 lg:block" aria-hidden="true" />
          <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-3">
            <p className="eyebrow">SW-CORE</p>
            {TOPO_VLANS.map(vlan => (
              <p key={vlan.id} className="mt-1 font-mono text-[11px] text-indigo-900">SVI {vlan.id} {vlan.gateway}</p>
            ))}
          </div>
          <ArrowRight className="hidden h-4 w-4 justify-self-center text-slate-300 lg:block" aria-hidden="true" />
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="eyebrow">R-EDGE</p>
            <p className="mt-1 font-mono text-[11px] text-slate-700">{TOPO_LINKS.edgeOutside.ip}</p>
            <p className="mt-1 text-[11px] text-slate-500">NAT overload → {TOPO_INTERNET.ip}</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5" aria-labelledby="controls-title">
        <h2 id="controls-title" className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Settings2 className="h-4 w-4 text-indigo-600" aria-hidden="true" />{t.conditions}
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="text-xs text-slate-600">{t.from}
            <select value={sourceId} onChange={event => setSourceId(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
              {TOPO_HOSTS.map(host => <option key={host.id} value={host.id}>{host.name} · {host.ip}</option>)}
            </select>
          </label>
          <label className="text-xs text-slate-600">{t.to}
            <select value={destinationId} onChange={event => setDestinationId(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
              {endpoints.filter(item => item.id !== sourceId).map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
          <label className="text-xs text-slate-600">{t.traffic}
            <select value={trafficId} onChange={event => setTrafficId(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
              {TOPO_TRAFFIC.map(item => <option key={item.id} value={item.id}>{item.label[language]}</option>)}
            </select>
          </label>
          <label className="text-xs text-slate-600">{t.aclLabel}
            <select value={aclPlacement} onChange={event => setAclPlacement(event.target.value as AclPlacement)} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
              <option value="inbound-users">{t.aclIn}</option>
              <option value="outbound-servers">{t.aclOut}</option>
              <option value="none">{t.aclNone}</option>
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {([
            [t.voice, voiceOnTrunk, setVoiceOnTrunk],
            [t.native, nativeVlanConsistent, setNativeVlanConsistent],
            [t.nat, natEnabled, setNatEnabled],
            [t.defRoute, defaultRoutePresent, setDefaultRoutePresent]
          ] as const).map(([label, value, setter]) => (
            <label key={label} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2.5 text-xs text-slate-700">
              <input type="checkbox" checked={value} onChange={event => setter(event.target.checked)} className="h-4 w-4 shrink-0 rounded border-slate-300" />
              {label}
            </label>
          ))}
        </div>

        <details className="mt-4 rounded-lg border border-slate-200 bg-slate-50/60">
          <summary className="cursor-pointer p-3 text-xs font-semibold text-slate-700">{t.aclRef}</summary>
          <pre className="overflow-x-auto border-t border-slate-200 p-3 text-[11px] leading-relaxed text-slate-700"><code>{TOPO_ACL_TEXT.join('\n')}</code></pre>
        </details>
      </section>

      <div className={`rounded-xl border p-4 ${trip.asymmetric ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'}`} role="status">
        <p className="text-sm font-semibold text-slate-900">{trip.asymmetric ? t.asymmetric : t.symmetric}</p>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{trip.note[language]}</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {renderTrace(trip.forward, t.forward)}
        {renderTrace(trip.ret, t.ret)}
      </div>
    </div>
  );
}

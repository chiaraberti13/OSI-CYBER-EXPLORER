import { useMemo, useState } from 'react';
import { GitBranch, TriangleAlert } from 'lucide-react';
import { computeSpf, type OspfRouteEntry, type OspfSpfResult } from '../lib/ospfTopology';
import { OSPF_LINK_LABELS, OSPF_LINKS, OSPF_REFERENCES, OSPF_ROUTERS } from '../content/ospfTopology';
import { useStore } from '../store';
import ResponsiveTable from './ResponsiveTable';

/**
 * Where OSPF's cost arithmetic becomes a decision.
 *
 * Converting a bandwidth into a cost is one division. What it cannot show is which
 * path wins on a real topology, when two paths tie and are installed together, and
 * what the 100 Mb/s default reference bandwidth hides while they do. Everything drawn
 * here comes out of computeSpf, so the diagram, the costs and the route table cannot
 * disagree with each other.
 */

const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  R1: { x: 170, y: 34 },
  R2: { x: 62, y: 112 },
  R3: { x: 278, y: 112 },
  R4: { x: 170, y: 172 },
  R5: { x: 62, y: 216 }
};

const COPY = {
  it: {
    title: 'SPF su topologia: quale percorso vince',
    intro: 'Cinque router in una sola area. Scegli da dove guardare, la reference bandwidth e quali collegamenti sono caduti: il motore esegue Dijkstra e mostra l’albero, i costi e la routing table che ne deriva.',
    root: 'Router da cui calcolare (root dell’albero)',
    reference: 'auto-cost reference-bandwidth',
    maxPaths: 'maximum-paths',
    links: 'Stato dei collegamenti', linkUp: 'attivo', linkDown: 'caduto', cost: 'costo',
    diagram: 'Albero dei percorsi più brevi',
    tableLabel: 'Routing table OSPF calcolata',
    colNetwork: 'Rete', colCost: 'Costo', colVia: 'Next hop', colPath: 'Percorso', colKind: 'Tipo',
    connected: 'Connessa', ecmp: 'ECMP', single: 'Percorso unico',
    unreachable: 'Router non raggiungibili',
    cli: 'Come la stamperebbe il router',
    warning: 'Costi indistinguibili con questa reference bandwidth',
    warningBody: 'Questi collegamenti hanno velocità diverse ma lo stesso costo, quindi OSPF non riesce a preferire il più veloce — e se pareggiano, ci bilancia il traffico sopra come se fossero uguali.',
    invalid: 'Configurazione non calcolabile su questa topologia.',
    formula: 'Come si calcola il costo',
    formulaBody: 'Costo = reference bandwidth ÷ banda dell’interfaccia, troncato all’intero inferiore, con minimo 1. Con la reference predefinita di 100 Mb/s: 10 Mb/s → 10, 100 Mb/s → 1, 1 Gb/s → 1 (0,1 troncato a 0 e alzato a 1), T1 a 1,544 Mb/s → 64. Il costo di un percorso è la somma dei costi delle interfacce di uscita attraversate, e il costo verso una rete stub aggiunge il costo dell’interfaccia su cui quella rete si trova.',
    trap: 'Trappola d’esame',
    trapBody: 'La reference bandwidth predefinita è ferma a 100 Mb/s: da 100 Mb/s in su tutti i collegamenti costano 1, quindi OSPF non distingue una FastEthernet da una 100 Gb/s. Va alzata con auto-cost reference-bandwidth e deve essere identica su tutti i router dell’area, altrimenti i costi non sono confrontabili. Seconda trappola: il costo si applica all’interfaccia di USCITA, quindi due direzioni possono avere costi diversi e produrre routing asimmetrico.',
    ecmpNote: 'Bilanciamento a costo uguale',
    ecmpBody: 'Quando due percorsi hanno lo stesso costo totale, OSPF li installa entrambi e il router bilancia il traffico per flusso. IOS ne installa fino a 4 per impostazione predefinita (maximum-paths). Non è una scelta arbitraria del router: dipende solo dalla somma dei costi, ed è per questo che alzare la reference bandwidth può far sparire un bilanciamento che sembrava desiderato.'
  },
  en: {
    title: 'SPF on a topology: which path wins',
    intro: 'Five routers in a single area. Choose where to look from, the reference bandwidth, and which links are down: the engine runs Dijkstra and shows the tree, the costs, and the routing table that follows.',
    root: 'Router to compute from (tree root)',
    reference: 'auto-cost reference-bandwidth',
    maxPaths: 'maximum-paths',
    links: 'Link state', linkUp: 'up', linkDown: 'down', cost: 'cost',
    diagram: 'Shortest path tree',
    tableLabel: 'Computed OSPF routing table',
    colNetwork: 'Network', colCost: 'Cost', colVia: 'Next hop', colPath: 'Path', colKind: 'Kind',
    connected: 'Connected', ecmp: 'ECMP', single: 'Single path',
    unreachable: 'Unreachable routers',
    cli: 'As the router would print it',
    warning: 'Costs this reference bandwidth cannot tell apart',
    warningBody: 'These links run at different speeds but carry the same cost, so OSPF cannot prefer the faster one — and when they tie, it balances traffic across them as if they were equal.',
    invalid: 'This configuration cannot be computed on this topology.',
    formula: 'How the cost is computed',
    formulaBody: 'Cost = reference bandwidth ÷ interface bandwidth, truncated to the integer below, with a minimum of 1. At the 100 Mb/s default: 10 Mb/s → 10, 100 Mb/s → 1, 1 Gb/s → 1 (0.1 truncated to 0 and raised to 1), a 1.544 Mb/s T1 → 64. A path cost is the sum of the outgoing interface costs crossed, and the cost to a stub network adds the cost of the interface that network sits on.',
    trap: 'Exam trap',
    trapBody: 'The default reference bandwidth is still 100 Mb/s: from 100 Mb/s upward every link costs 1, so OSPF cannot tell a FastEthernet from a 100 Gb/s link. Raise it with auto-cost reference-bandwidth, and keep it identical on every router in the area, or the costs are not comparable. Second trap: cost applies to the OUTGOING interface, so the two directions can carry different costs and produce asymmetric routing.',
    ecmpNote: 'Equal-cost load balancing',
    ecmpBody: 'When two paths have the same total cost, OSPF installs both and the router balances traffic per flow. IOS installs up to 4 by default (maximum-paths). It is not an arbitrary choice by the router: it follows only from the sum of the costs, which is why raising the reference bandwidth can remove a balancing that looked intentional.'
  }
} as const;

/** Link ids on the shortest-path tree, derived from the computed paths. */
function treeLinkIds(result: OspfSpfResult): Set<string> {
  const ids = new Set<string>();
  for (const route of result.routes) {
    for (const path of route.paths) {
      for (let index = 0; index + 1 < path.length; index += 1) {
        const link = OSPF_LINKS.find(item =>
          (item.a === path[index] && item.b === path[index + 1]) ||
          (item.b === path[index] && item.a === path[index + 1])
        );
        if (link) ids.add(link.id);
      }
    }
  }
  return ids;
}

function TopologyDiagram({ result, downLinks, label }: { result: OspfSpfResult; downLinks: string[]; label: string }) {
  const onTree = treeLinkIds(result);

  return (
    <svg viewBox="0 0 340 250" className="h-auto w-full" role="img" aria-label={label}>
      {OSPF_LINKS.map(link => {
        const from = NODE_POSITIONS[link.a];
        const to = NODE_POSITIONS[link.b];
        const isDown = downLinks.includes(link.id);
        const isTree = !isDown && onTree.has(link.id);
        const midX = from.x + (to.x - from.x) * 0.5;
        const midY = from.y + (to.y - from.y) * 0.5;
        return (
          <g key={link.id}>
            <line
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={isDown ? '#cbd5e1' : isTree ? '#4f46e5' : '#94a3b8'}
              strokeWidth={isTree ? 2.6 : 1.4}
              strokeDasharray={isDown ? '4 4' : undefined}
            />
            <text
              x={midX} y={midY - 3} textAnchor="middle" fontSize={8}
              fontFamily="ui-monospace, monospace"
              fill={isDown ? '#94a3b8' : isTree ? '#4338ca' : '#64748b'}
              stroke="#ffffff" strokeWidth={2.5} paintOrder="stroke"
            >
              {isDown ? 'down' : result.linkCosts[link.id]}
            </text>
          </g>
        );
      })}

      {OSPF_ROUTERS.map(router => {
        const position = NODE_POSITIONS[router.id];
        const isRoot = router.id === result.rootId;
        const cost = result.routerCosts[router.id];
        const reachable = cost !== undefined;
        return (
          <g key={router.id}>
            <rect
              x={position.x - 32} y={position.y - 15} width={64} height={30} rx={7}
              fill={isRoot ? '#4f46e5' : reachable ? '#ffffff' : '#f1f5f9'}
              stroke={isRoot ? '#4338ca' : reachable ? '#cbd5f5' : '#e2e8f0'}
              strokeWidth={1.5}
            />
            <text x={position.x} y={position.y - 1} textAnchor="middle" fontSize={11} fontWeight={600} fill={isRoot ? '#ffffff' : reachable ? '#0f172a' : '#94a3b8'}>
              {router.name}
            </text>
            <text x={position.x} y={position.y + 10} textAnchor="middle" fontSize={7.5} fontFamily="ui-monospace, monospace" fill={isRoot ? '#c7d2fe' : '#64748b'}>
              {isRoot ? 'ROOT' : reachable ? `cost ${cost}` : 'unreachable'}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function OspfSpfLab() {
  const language = useStore((state) => state.language);
  const copy = COPY[language];

  const [rootId, setRootId] = useState('R1');
  const [reference, setReference] = useState(100);
  const [maximumPaths, setMaximumPaths] = useState(4);
  const [downLinks, setDownLinks] = useState<string[]>([]);

  const result = useMemo<{ value: OspfSpfResult; error: false } | { value: null; error: true }>(() => {
    try {
      return {
        value: computeSpf({
          routers: OSPF_ROUTERS,
          links: OSPF_LINKS,
          rootId,
          referenceBandwidthMbps: reference,
          downLinkIds: downLinks,
          maximumPaths
        }),
        error: false
      };
    } catch {
      return { value: null, error: true };
    }
  }, [rootId, reference, downLinks, maximumPaths]);

  const computed = result.value;
  const toggleLink = (id: string) =>
    setDownLinks(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);

  const nameOf = (id: string) => OSPF_ROUTERS.find(router => router.id === id)?.name ?? id;
  const selectClass = 'block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="ospf-spf-title">
      <div className="flex items-center gap-3">
        <GitBranch className="h-5 w-5 text-indigo-600" />
        <h2 id="ospf-spf-title" className="text-lg font-semibold text-slate-900">{copy.title}</h2>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{copy.intro}</p>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <label className="min-w-0 space-y-1.5 text-xs font-medium text-slate-600">
          {copy.root}
          <select value={rootId} aria-label={copy.root} onChange={(event) => setRootId(event.target.value)} className={selectClass}>
            {OSPF_ROUTERS.map(router => <option key={router.id} value={router.id}>{router.name} · {router.routerId}</option>)}
          </select>
        </label>
        <label className="min-w-0 space-y-1.5 text-xs font-medium text-slate-600">
          {copy.reference}
          <select value={reference} aria-label={copy.reference} onChange={(event) => setReference(Number(event.target.value))} className={selectClass}>
            {OSPF_REFERENCES.map(item => <option key={item.value} value={item.value}>{item.label[language]}</option>)}
          </select>
        </label>
        <label className="min-w-0 space-y-1.5 text-xs font-medium text-slate-600">
          {copy.maxPaths}
          <select value={maximumPaths} aria-label={copy.maxPaths} onChange={(event) => setMaximumPaths(Number(event.target.value))} className={selectClass}>
            {[1, 2, 4].map(value => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
      </div>

      <div className="mt-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.links}</h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {OSPF_LINKS.map(link => {
            const isDown = downLinks.includes(link.id);
            return (
              <label key={link.id} className={`flex min-w-0 cursor-pointer items-start gap-2 rounded-lg border p-2.5 text-xs transition ${isDown ? 'border-slate-200 bg-slate-50 text-slate-400' : 'border-slate-200 text-slate-700 hover:border-indigo-200'}`}>
                <input
                  type="checkbox"
                  checked={!isDown}
                  onChange={() => toggleLink(link.id)}
                  className="mt-0.5 shrink-0"
                  aria-label={`${link.id} ${isDown ? copy.linkDown : copy.linkUp}`}
                />
                <span className="min-w-0">
                  <span className="font-mono text-[11px] font-semibold">{link.id}</span>
                  <span className="ml-1.5 font-mono text-[10px] text-slate-500">
                    {isDown ? copy.linkDown : `${copy.cost} ${computed?.linkCosts[link.id] ?? '—'}`}
                  </span>
                  <span className="block text-[11px] leading-snug text-slate-500">{OSPF_LINK_LABELS[link.id]?.[language]}</span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {!computed ? (
        <p className="mt-5 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">
          <TriangleAlert className="h-4 w-4 shrink-0" /> {copy.invalid}
        </p>
      ) : (
        <div className="mt-6 space-y-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="min-w-0 rounded-lg border border-slate-200 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.diagram}</h3>
              <div className="mt-3">
                <TopologyDiagram result={computed} downLinks={downLinks} label={copy.diagram} />
              </div>
            </div>

            <div className="min-w-0 space-y-3">
              {computed.indistinguishableLinks.length > 0 ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">{copy.warning}</h3>
                  <p className="mt-1 font-mono text-[11px] text-amber-900">{computed.indistinguishableLinks.join(' · ')}</p>
                  <p className="mt-2 text-[11px] leading-relaxed text-amber-900">{copy.warningBody}</p>
                </div>
              ) : null}
              {computed.unreachableRouters.length > 0 ? (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wide text-rose-700">{copy.unreachable}</h3>
                  <p className="mt-1 font-mono text-[11px] text-rose-900">{computed.unreachableRouters.map(nameOf).join(' · ')}</p>
                </div>
              ) : null}
              <div className="overflow-x-auto rounded-lg bg-slate-950 p-3">
                <p className="font-mono text-[10px] text-slate-500">{copy.cli}</p>
                <pre className="mt-2 font-mono text-[11px] leading-relaxed text-emerald-300"><code>{[
                  `${nameOf(computed.rootId)}# show ip route ospf`,
                  '',
                  ...computed.routes.filter(route => !route.local).flatMap(route => {
                    const first = `O    ${route.network}/${route.prefix} [110/${route.totalCost}]`;
                    return route.nextHops.map((hop, index) => index === 0
                      ? `${first} via ${nameOf(hop)}`
                      : `${' '.repeat(first.length)} via ${nameOf(hop)}`);
                  }),
                  ...(computed.routes.every(route => route.local) ? ['     (no OSPF routes)'] : [])
                ].join('\n')}</code></pre>
              </div>
            </div>
          </div>

          <ResponsiveTable<OspfRouteEntry>
            label={copy.tableLabel}
            rows={computed.routes}
            rowKey={(route) => `${route.network}/${route.prefix}`}
            breakpoint="lg"
            minWidth={840}
            columns={[
              {
                id: 'network',
                header: copy.colNetwork,
                heading: true,
                cell: (route) => (
                  <span className="font-mono text-xs">
                    <span className="font-semibold text-slate-900">{route.network}/{route.prefix}</span>
                    <span className="ml-2 text-[10px] text-slate-500">{nameOf(route.advertisedBy)}</span>
                  </span>
                )
              },
              {
                id: 'cost',
                header: copy.colCost,
                cell: (route) => (
                  <span className="font-mono text-xs">
                    {route.totalCost}
                    {route.local ? '' : <span className="ml-1 text-[10px] text-slate-400">({route.routerCost}+{route.totalCost - route.routerCost})</span>}
                  </span>
                )
              },
              { id: 'via', header: copy.colVia, cell: (route) => <span className="font-mono text-xs">{route.local ? '—' : route.nextHops.map(nameOf).join(', ')}</span> },
              {
                id: 'path',
                header: copy.colPath,
                cell: (route) => (
                  <span className="font-mono text-[11px] text-slate-600">
                    {route.paths.map(path => path.map(nameOf).join(' → ')).join(' | ')}
                  </span>
                )
              },
              {
                id: 'kind',
                header: copy.colKind,
                cell: (route) => (
                  <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    route.local ? 'bg-slate-100 text-slate-700'
                      : route.ecmp ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {route.local ? copy.connected : route.ecmp ? copy.ecmp : copy.single}
                  </span>
                )
              }
            ]}
          />

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-sky-700">{copy.formula}</h3>
              <p className="mt-2 text-xs leading-relaxed text-sky-900">{copy.formulaBody}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.ecmpNote}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-700">{copy.ecmpBody}</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-700">{copy.trap}</h3>
              <p className="mt-2 text-xs leading-relaxed text-amber-900">{copy.trapBody}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

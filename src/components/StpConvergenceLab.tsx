import { useMemo, useState } from 'react';
import { Network, TriangleAlert } from 'lucide-react';
import { convergeStp, type StpPathCostMethod, type StpPort, type StpPortRole, type StpResult } from '../lib/stp';
import { STP_LINK_LABELS, STP_LINKS, STP_SWITCHES } from '../content/stpTopology';
import { useStore } from '../store';
import ResponsiveTable from './ResponsiveTable';

/**
 * Spanning tree on the topology, not in the abstract.
 *
 * The section above this one answers "who becomes root". The question that follows it
 * — and the one an exam item actually poses — is "so which port blocks?". Everything
 * drawn here is computed by convergeStp, so the diagram cannot disagree with the port
 * table, and changing a priority changes both at once.
 */

const PRIORITIES = [0, 4096, 8192, 16384, 24576, 32768, 40960, 49152, 61440];
const VLAN_CHOICES = [10, 20, 30];

/** Fixed positions for the four switches; the six links are every pair between them. */
const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  dsw1: { x: 80, y: 42 },
  dsw2: { x: 260, y: 42 },
  asw1: { x: 80, y: 168 },
  asw2: { x: 260, y: 168 }
};

const ROLE_STYLES: Record<StpPortRole, { badge: string; dot: string }> = {
  root: { badge: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
  designated: { badge: 'bg-indigo-100 text-indigo-800', dot: 'bg-indigo-500' },
  alternate: { badge: 'bg-rose-100 text-rose-800', dot: 'bg-rose-500' }
};

const COPY = {
  it: {
    title: 'Convergenza STP sulla topologia',
    intro: 'Quattro switch collegati a maglia: tre loop fisici contemporaneamente. Scegli VLAN, metodo di costo e priorità, e guarda quale porta finisce in blocking — è la domanda che l’esame pone davvero.',
    vlan: 'VLAN', method: 'Metodo di costo', short: 'short (802.1D-1998)', long: 'long (802.1D-2004)',
    priorities: 'Priorità per la VLAN selezionata', priorityFor: 'Priorità STP', reset: 'Ripristina il progetto',
    root: 'Root bridge', bridgeId: 'Bridge ID', cost: 'Costo verso la root',
    diagram: 'Topologia e ruoli delle porte', blocked: 'Collegamenti interrotti dall’albero', none: 'Nessuno',
    portsLabel: 'Ruolo di ogni porta', showAll: 'Tutte le porte', showBlocking: 'Solo quelle in discarding',
    colPort: 'Porta', colNeighbor: 'Vicino', colRole: 'Ruolo', colState: 'Stato', colCost: 'Costo porta', colWhy: 'Perché',
    roles: { root: 'Root port', designated: 'Designated', alternate: 'Alternate (blocking)' },
    states: { forwarding: 'Forwarding', discarding: 'Discarding' },
    invalid: 'Configurazione non valida per questa topologia.',
    order: 'L’ordine delle decisioni',
    orderBody: '1) Root bridge: Bridge ID più basso, e nient’altro. 2) Root port: una sola per switch non root, quella con il costo cumulativo più basso verso la root. 3) Designated port: una per segmento, dal lato che annuncia il costo migliore. 4) Tutto il resto va in discarding. I pareggi si rompono sempre nello stesso ordine: costo, Bridge ID del vicino, Port ID del vicino, Port ID proprio.',
    trap: 'Trappola d’esame',
    trapBody: 'Il Bridge ID contiene la VLAN nell’extended system ID: priority 24576 sulla VLAN 10 si legge 24586. Per questo la priorità è configurabile solo a passi di 4096, e per questo due VLAN possono avere root diverse sugli stessi switch — è il load balancing di PVST+. Nota anche che una porta in discarding non è spenta: continua ad ascoltare le BPDU, ed è così che si accorge quando il percorso primario cade. Attenzione ai nomi degli stati: questa tabella usa il vocabolario RSTP, che ha tre stati — discarding, learning, forwarding — perché Rapid PVST+ è il default sugli switch Cisco attuali. Lo STP classico (802.1D) ne ha cinque — disabled, blocking, listening, learning, forwarding — e chiama blocking lo stato che qui si legge discarding.',
    pvst: 'Cosa cambia tra le VLAN',
    pvstBody: 'Passa dalla VLAN 10 alla 20 e osserva gli uplink degli access switch invertirsi: con DSW1 root per la 10 e DSW2 root per la 20, nessun uplink resta inutilizzato. Sulla VLAN 30 nessuno ha una priorità configurata, quindi decide il MAC più basso: è il comportamento che ottieni quando dimentichi di scegliere la root.'
  },
  en: {
    title: 'STP convergence on the topology',
    intro: 'Four switches in a mesh: three physical loops at once. Choose the VLAN, the cost method and the priorities, and watch which port ends up blocking — that is the question an exam actually asks.',
    vlan: 'VLAN', method: 'Cost method', short: 'short (802.1D-1998)', long: 'long (802.1D-2004)',
    priorities: 'Priorities for the selected VLAN', priorityFor: 'STP priority', reset: 'Restore the design',
    root: 'Root bridge', bridgeId: 'Bridge ID', cost: 'Cost to the root',
    diagram: 'Topology and port roles', blocked: 'Links the tree has cut', none: 'None',
    portsLabel: 'Role of every port', showAll: 'All ports', showBlocking: 'Only the discarding ones',
    colPort: 'Port', colNeighbor: 'Neighbour', colRole: 'Role', colState: 'State', colCost: 'Port cost', colWhy: 'Why',
    roles: { root: 'Root port', designated: 'Designated', alternate: 'Alternate (blocking)' },
    states: { forwarding: 'Forwarding', discarding: 'Discarding' },
    invalid: 'Invalid configuration for this topology.',
    order: 'The order of the decisions',
    orderBody: '1) Root bridge: lowest Bridge ID, and nothing else. 2) Root port: one per non-root switch, the one with the lowest cumulative cost to the root. 3) Designated port: one per segment, on the side advertising the better cost. 4) Everything left goes to discarding. Ties always break in the same order: cost, neighbour Bridge ID, neighbour Port ID, own Port ID.',
    trap: 'Exam trap',
    trapBody: 'The Bridge ID carries the VLAN in its extended system ID: priority 24576 on VLAN 10 reads as 24586. That is why the priority is only settable in steps of 4096, and why two VLANs can have different roots on the same switches — PVST+ load balancing. Note too that a discarding port is not shut down: it keeps listening to BPDUs, which is how it notices when the primary path fails. Mind the state names: this table uses the RSTP vocabulary, which has three states — discarding, learning, forwarding — because Rapid PVST+ is the default on current Cisco switches. Classic STP (802.1D) has five — disabled, blocking, listening, learning, forwarding — and calls blocking the state shown here as discarding.',
    pvst: 'What changes between VLANs',
    pvstBody: 'Switch from VLAN 10 to VLAN 20 and watch the access uplinks swap: with DSW1 root for 10 and DSW2 root for 20, no uplink sits idle. On VLAN 30 nobody has a configured priority, so the lowest MAC decides — the behaviour you get when you forget to choose the root.'
  }
} as const;

function TopologyDiagram({ result, label }: { result: StpResult; label: string }) {
  const portByEnd = new Map(result.ports.map(port => [`${port.linkId}:${port.switchId}`, port]));

  return (
    <svg viewBox="0 0 340 210" className="h-auto w-full" role="img" aria-label={label}>
      {STP_LINKS.map(link => {
        const from = NODE_POSITIONS[link.from.switchId];
        const to = NODE_POSITIONS[link.to.switchId];
        const blocked = result.blockedLinkIds.includes(link.id);
        const blockingEnd = [link.from, link.to].find(end => portByEnd.get(`${link.id}:${end.switchId}`)?.role === 'alternate');
        const blockingAt = blockingEnd ? NODE_POSITIONS[blockingEnd.switchId] : null;
        const other = blockingEnd
          ? NODE_POSITIONS[blockingEnd.switchId === link.from.switchId ? link.to.switchId : link.from.switchId]
          : null;
        // The marker sits near the end that blocks; the cost label sits past the middle,
        // so the two never land on top of each other and the diagonals do not collide.
        const markerX = blockingAt && other ? blockingAt.x + (other.x - blockingAt.x) * 0.2 : 0;
        const markerY = blockingAt && other ? blockingAt.y + (other.y - blockingAt.y) * 0.2 : 0;
        const costAt = 0.62;
        const costX = from.x + (to.x - from.x) * costAt;
        const costY = from.y + (to.y - from.y) * costAt;
        const cost = portByEnd.get(`${link.id}:${link.from.switchId}`)?.cost ?? 0;

        return (
          <g key={link.id}>
            <line
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={blocked ? '#fb7185' : '#6366f1'}
              strokeWidth={blocked ? 1.5 : 2.5}
              strokeDasharray={blocked ? '5 4' : undefined}
            />
            {blockingAt ? <circle cx={markerX} cy={markerY} r={5} fill="#fff" stroke="#e11d48" strokeWidth={2} /> : null}
            <text
              x={costX} y={costY - 4} textAnchor="middle" fontSize={8}
              fontFamily="ui-monospace, monospace"
              fill="#64748b"
              /* A white outline keeps the number legible where it crosses a link. */
              stroke="#ffffff" strokeWidth={2.5} paintOrder="stroke"
            >
              {cost.toLocaleString('en')}
            </text>
          </g>
        );
      })}

      {STP_SWITCHES.map(item => {
        const position = NODE_POSITIONS[item.id];
        const isRoot = result.rootId === item.id;
        return (
          <g key={item.id}>
            <rect
              x={position.x - 42} y={position.y - 17} width={84} height={34} rx={8}
              fill={isRoot ? '#4f46e5' : '#ffffff'}
              stroke={isRoot ? '#4338ca' : '#cbd5f5'}
              strokeWidth={1.5}
            />
            <text x={position.x} y={position.y - 2} textAnchor="middle" fontSize={11} fontWeight={600} fill={isRoot ? '#ffffff' : '#0f172a'}>
              {item.name}
            </text>
            <text x={position.x} y={position.y + 10} textAnchor="middle" fontSize={8} fill={isRoot ? '#c7d2fe' : '#64748b'} fontFamily="ui-monospace, monospace">
              {isRoot ? 'ROOT' : `cost ${result.rootPathCosts[item.id].toLocaleString('en')}`}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function StpConvergenceLab() {
  const language = useStore((state) => state.language);
  const copy = COPY[language];

  const [vlan, setVlan] = useState(10);
  const [method, setMethod] = useState<StpPathCostMethod>('short');
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [blockingOnly, setBlockingOnly] = useState(false);

  const result = useMemo<{ value: StpResult; error: false } | { value: null; error: true }>(() => {
    try {
      const switches = STP_SWITCHES.map(item => (
        overrides[item.id] === undefined
          ? item
          : { ...item, vlanPriority: { ...item.vlanPriority, [vlan]: overrides[item.id] } }
      ));
      return { value: convergeStp({ switches, links: STP_LINKS, vlan, method }), error: false };
    } catch {
      return { value: null, error: true };
    }
  }, [vlan, method, overrides]);

  const converged = result.value;
  const selectClass = 'block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';
  const nameOf = (id: string) => STP_SWITCHES.find(item => item.id === id)?.name ?? id;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="stp-converge-title">
      <div className="flex items-center gap-3">
        <Network className="h-5 w-5 text-indigo-600" />
        <h2 id="stp-converge-title" className="text-lg font-semibold text-slate-900">{copy.title}</h2>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{copy.intro}</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-xs font-medium text-slate-600">
          {copy.vlan}
          <select value={vlan} aria-label={copy.vlan} onChange={(event) => setVlan(Number(event.target.value))} className={selectClass}>
            {VLAN_CHOICES.map(value => <option key={value} value={value}>VLAN {value}</option>)}
          </select>
        </label>
        <label className="space-y-1.5 text-xs font-medium text-slate-600">
          {copy.method}
          <select value={method} aria-label={copy.method} onChange={(event) => setMethod(event.target.value as StpPathCostMethod)} className={selectClass}>
            <option value="short">{copy.short}</option>
            <option value="long">{copy.long}</option>
          </select>
        </label>
      </div>

      <div className="mt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.priorities}</h3>
          {Object.keys(overrides).length > 0 ? (
            <button type="button" onClick={() => setOverrides({})} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700">
              {copy.reset}
            </button>
          ) : null}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STP_SWITCHES.map(item => {
            const value = overrides[item.id] ?? item.vlanPriority?.[vlan] ?? item.priority;
            const isRoot = converged?.rootId === item.id;
            return (
              <article key={item.id} className={`rounded-lg border p-3 ${isRoot ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200'}`}>
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-slate-900">{item.name}</h4>
                  {isRoot ? <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-semibold text-white">ROOT</span> : null}
                </div>
                <p className="mt-1 text-[11px] leading-snug text-slate-500">{item.role[language]}</p>
                <select
                  value={value}
                  aria-label={`${copy.priorityFor} ${item.name}`}
                  onChange={(event) => setOverrides(current => ({ ...current, [item.id]: Number(event.target.value) }))}
                  className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 font-mono text-xs"
                >
                  {PRIORITIES.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
                <p className="mt-2 font-mono text-[10px] text-slate-500">
                  {converged ? converged.bridgeIds[item.id].text : item.mac}
                </p>
              </article>
            );
          })}
        </div>
      </div>

      {!converged ? (
        <p className="mt-5 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">
          <TriangleAlert className="h-4 w-4 shrink-0" /> {copy.invalid}
        </p>
      ) : (
        <div className="mt-6 space-y-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.diagram}</h3>
              <div className="mt-3">
                <TopologyDiagram result={converged} label={copy.diagram} />
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-500">
                {(['root', 'designated', 'alternate'] as StpPortRole[]).map(role => (
                  <span key={role} className="inline-flex items-center gap-1.5">
                    <span className={`inline-block h-2 w-2 rounded-full ${ROLE_STYLES[role].dot}`} />
                    {copy.roles[role]}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-600">{copy.root}</p>
                <p className="mt-1 text-sm font-semibold text-indigo-900">{nameOf(converged.rootId)}</p>
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-indigo-600">{copy.bridgeId}</p>
                <p className="font-mono text-xs text-indigo-900">{converged.bridgeIds[converged.rootId].text}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{copy.blocked}</p>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-700">
                  {converged.blockedLinkIds.length === 0 ? <li>{copy.none}</li> : converged.blockedLinkIds.map(id => (
                    <li key={id}>
                      <span className="font-mono text-[11px] text-rose-700">{id}</span>
                      <span className="block text-[11px] leading-snug text-slate-500">{STP_LINK_LABELS[id]?.[language]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.portsLabel}</h3>
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5" role="group" aria-label={copy.portsLabel}>
                {[{ value: false, label: copy.showAll }, { value: true, label: copy.showBlocking }].map(option => (
                  <button
                    key={String(option.value)}
                    type="button"
                    aria-pressed={blockingOnly === option.value}
                    onClick={() => setBlockingOnly(option.value)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                      blockingOnly === option.value ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3">
              <ResponsiveTable<StpPort>
                label={copy.portsLabel}
                rows={blockingOnly ? converged.ports.filter(port => port.state === 'discarding') : converged.ports}
                rowKey={(port) => `${port.switchId}-${port.port}`}
                breakpoint="lg"
                minWidth={900}
                columns={[
                  {
                    id: 'port',
                    header: copy.colPort,
                    heading: true,
                    cell: (port) => (
                      <span className="font-mono text-xs">
                        <span className="font-semibold text-slate-900">{nameOf(port.switchId)}</span> {port.port}
                      </span>
                    )
                  },
                  { id: 'neighbor', header: copy.colNeighbor, cell: (port) => <span className="font-mono text-xs">{nameOf(port.neighborId)} {port.neighborPort}</span> },
                  {
                    id: 'role',
                    header: copy.colRole,
                    cell: (port) => (
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${ROLE_STYLES[port.role].badge}`}>
                        {copy.roles[port.role]}
                      </span>
                    )
                  },
                  { id: 'state', header: copy.colState, cell: (port) => <span className={`text-xs font-medium ${port.state === 'discarding' ? 'text-rose-700' : 'text-emerald-700'}`}>{copy.states[port.state]}</span> },
                  { id: 'cost', header: copy.colCost, cell: (port) => <span className="font-mono text-xs">{port.cost.toLocaleString(language)}</span> },
                  { id: 'why', header: copy.colWhy, cell: (port) => <span className="text-xs leading-relaxed text-slate-600">{port.reason[language]}</span> }
                ]}
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-sky-700">{copy.order}</h3>
              <p className="mt-2 text-xs leading-relaxed text-sky-900">{copy.orderBody}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.pvst}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-700">{copy.pvstBody}</p>
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

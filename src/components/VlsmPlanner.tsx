import { useMemo, useState } from 'react';
import { AlertTriangle, LayoutGrid, Plus, Trash2 } from 'lucide-react';
import { planVlsm, prefixToMask, uintToIpv4, type VlsmAllocation, type VlsmPlan } from '../lib/ipv4';
import { useStore } from '../store';
import ResponsiveTable from './ResponsiveTable';

/**
 * The design direction of subnetting.
 *
 * The IPv4 explorer answers "what is this address part of?". This answers the question
 * an exam item and a real project both ask instead: given one block and a list of
 * departments, which subnets do I cut? The lesson it is built to make visible is the
 * ordering rule — allocate from the largest requirement down, or alignment strands
 * space that would otherwise have been enough.
 */

interface Row {
  id: string;
  name: string;
  /** Kept as text so the field can be empty while typing. */
  hosts: string;
}

const DEFAULT_ROWS: Row[] = [
  { id: 'r1', name: 'Sales', hosts: '50' },
  { id: 'r2', name: 'Voice', hosts: '25' },
  { id: 'r3', name: 'Servers', hosts: '10' },
  { id: 'r4', name: 'WAN link', hosts: '2' }
];

const COPY = {
  it: {
    title: 'Pianificatore VLSM',
    intro: 'VLSM significa assegnare a ogni segmento la subnet più piccola che lo contiene, invece di dividere il blocco in parti uguali. Il pianificatore ordina i requisiti dal più grande al più piccolo: è questa la regola che fa entrare i conti.',
    base: 'Blocco di partenza', prefix: 'Prefisso', requirements: 'Requisiti', addRow: 'Aggiungi segmento',
    remove: 'Rimuovi', name: 'Segmento', hosts: 'Host richiesti',
    resultLabel: 'Piano di indirizzamento',
    colSubnet: 'Subnet', colMask: 'Subnet mask', colRange: 'Intervallo utilizzabile', colBroadcast: 'Broadcast',
    colUsable: 'Host disponibili', colWaste: 'Indirizzi sprecati',
    utilisation: 'Blocco utilizzato', used: 'usati', of: 'su', nextFree: 'Primo indirizzo libero', full: 'Blocco esaurito',
    errors: {
      INVALID_IPV4: 'Il blocco di partenza non è un indirizzo IPv4 valido.',
      INVALID_PREFIX: 'Il prefisso del blocco deve essere compreso tra /0 e /32.',
      INVALID_HOST_COUNT: 'Ogni segmento deve chiedere almeno 1 host, come numero intero.',
      HOSTS_EXCEED_IPV4: 'Un segmento chiede più host di quanti ne esistano in IPv4.',
      BLOCK_TOO_SMALL: 'Il blocco non basta per questi requisiti: serve un prefisso più corto, oppure requisiti più piccoli.',
      NO_REQUIREMENTS: 'Aggiungi almeno un segmento con un numero di host.',
      GENERIC: 'Controlla blocco, prefisso e host richiesti.'
    },
    why: 'Perché dal più grande al più piccolo',
    whyBody: 'Una subnet può iniziare solo su un multiplo della propria dimensione. Se assegni prima una /28 in un blocco /25, la /26 che segue non può più partire da .16: deve saltare a .64, e i 48 indirizzi in mezzo restano inutilizzabili. Partendo dalla più grande, ogni subnet successiva è più piccola della precedente e cade sempre su un confine valido: nessun buco.',
    trap: 'Trappola d’esame',
    trapBody: 'Il numero richiesto sono gli host utilizzabili, non gli indirizzi: 62 host stanno in una /26, ma 63 host obbligano a una /25. E un collegamento punto-punto tra due router chiede 2 host, quindi una /30 (o una /31, dove è supportata: non ha broadcast e usa entrambi gli indirizzi).'
  },
  en: {
    title: 'VLSM planner',
    intro: 'VLSM means giving each segment the smallest subnet that holds it, instead of cutting the block into equal parts. The planner allocates from the largest requirement down: that ordering rule is what makes the arithmetic fit.',
    base: 'Starting block', prefix: 'Prefix', requirements: 'Requirements', addRow: 'Add segment',
    remove: 'Remove', name: 'Segment', hosts: 'Hosts needed',
    resultLabel: 'Addressing plan',
    colSubnet: 'Subnet', colMask: 'Subnet mask', colRange: 'Usable range', colBroadcast: 'Broadcast',
    colUsable: 'Usable hosts', colWaste: 'Wasted addresses',
    utilisation: 'Block used', used: 'used', of: 'of', nextFree: 'First free address', full: 'Block exhausted',
    errors: {
      INVALID_IPV4: 'The starting block is not a valid IPv4 address.',
      INVALID_PREFIX: 'The block prefix must be between /0 and /32.',
      INVALID_HOST_COUNT: 'Every segment must ask for at least 1 host, as a whole number.',
      HOSTS_EXCEED_IPV4: 'A segment asks for more hosts than IPv4 contains.',
      BLOCK_TOO_SMALL: 'The block cannot hold these requirements: use a shorter prefix, or smaller requirements.',
      NO_REQUIREMENTS: 'Add at least one segment with a host count.',
      GENERIC: 'Check the block, the prefix, and the host counts.'
    },
    why: 'Why largest to smallest',
    whyBody: 'A subnet can only start on a multiple of its own size. Allocate a /28 first inside a /25 and the /26 that follows can no longer start at .16: it has to jump to .64, and the 48 addresses in between are stranded. Starting from the largest, every later subnet is smaller than the one before it and always lands on a valid boundary: no holes.',
    trap: 'Exam trap',
    trapBody: 'The number requested is usable hosts, not addresses: 62 hosts fit a /26, but 63 hosts force a /25. And a point-to-point link between two routers needs 2 hosts, so a /30 — or a /31 where it is supported, which has no broadcast and uses both addresses.'
  }
} as const;

type ErrorKey = keyof typeof COPY['it']['errors'];

function errorKeyOf(error: unknown): ErrorKey {
  const message = error instanceof Error ? error.message : '';
  return message in COPY.it.errors ? (message as ErrorKey) : 'GENERIC';
}

export default function VlsmPlanner() {
  const language = useStore((state) => state.language);
  const copy = COPY[language];

  const [base, setBase] = useState('192.168.1.0');
  const [basePrefix, setBasePrefix] = useState(24);
  const [rows, setRows] = useState<Row[]>(DEFAULT_ROWS);

  const result = useMemo<{ plan: VlsmPlan; error: null } | { plan: null; error: ErrorKey }>(() => {
    try {
      const requirements = rows
        .filter(row => row.hosts.trim() !== '')
        .map(row => ({ id: row.id, name: row.name.trim() || row.id, hosts: Number(row.hosts) }));
      return { plan: planVlsm(base.trim(), basePrefix, requirements), error: null };
    } catch (error) {
      return { plan: null, error: errorKeyOf(error) };
    }
  }, [base, basePrefix, rows]);

  const updateRow = (id: string, patch: Partial<Row>) =>
    setRows(current => current.map(row => (row.id === id ? { ...row, ...patch } : row)));

  const addRow = () =>
    setRows(current => [...current, { id: `r${Date.now().toString(36)}`, name: '', hosts: '' }]);

  const removeRow = (id: string) =>
    setRows(current => (current.length > 1 ? current.filter(row => row.id !== id) : current));

  const inputClass = 'block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';
  const plan = result.plan;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="vlsm-title">
      <div className="flex items-center gap-3">
        <LayoutGrid className="h-5 w-5 text-indigo-600" />
        <h2 id="vlsm-title" className="text-lg font-semibold text-slate-900">{copy.title}</h2>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{copy.intro}</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_140px]">
        <label className="space-y-1.5 text-xs font-medium text-slate-600">
          {copy.base}
          <input value={base} onChange={(event) => setBase(event.target.value)} inputMode="decimal" className={inputClass} />
        </label>
        <label className="space-y-1.5 text-xs font-medium text-slate-600">
          {copy.prefix}
          <input type="number" min={0} max={30} value={basePrefix} onChange={(event) => setBasePrefix(Number(event.target.value))} className={inputClass} />
        </label>
      </div>

      <div className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900">{copy.requirements}</h3>
          <button type="button" onClick={addRow} className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100">
            <Plus className="h-3.5 w-3.5" /> {copy.addRow}
          </button>
        </div>
        <ul className="mt-3 space-y-2">
          {rows.map(row => (
            // On a phone the name takes the full width and the host count sits next to
            // the delete button, so a segment stays one visual block instead of three bars.
            <li key={row.id} className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[1fr_120px_auto]">
              <input
                value={row.name}
                onChange={(event) => updateRow(row.id, { name: event.target.value })}
                aria-label={copy.name}
                placeholder={copy.name}
                className="col-span-2 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:col-span-1"
              />
              <input
                value={row.hosts}
                onChange={(event) => updateRow(row.id, { hosts: event.target.value })}
                aria-label={copy.hosts}
                placeholder={copy.hosts}
                inputMode="numeric"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                disabled={rows.length === 1}
                aria-label={`${copy.remove} ${row.name || row.id}`}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {result.error ? (
        <div className="mt-5 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> <span>{copy.errors[result.error]}</span>
        </div>
      ) : plan ? (
        <div className="mt-6 space-y-5">
          <ResponsiveTable<VlsmAllocation>
            label={copy.resultLabel}
            rows={plan.allocations}
            rowKey={(allocation) => allocation.id}
            breakpoint="lg"
            minWidth={820}
            columns={[
              {
                id: 'subnet',
                header: copy.colSubnet,
                heading: true,
                cell: (allocation) => (
                  <span>
                    <span className="font-semibold text-slate-900">{allocation.name}</span>
                    <span className="ml-2 font-mono text-xs text-indigo-700">{allocation.network}/{allocation.prefix}</span>
                  </span>
                )
              },
              { id: 'mask', header: copy.colMask, cell: (a) => <span className="font-mono text-xs">{uintToIpv4(prefixToMask(a.prefix) >>> 0)}</span> },
              { id: 'range', header: copy.colRange, cell: (a) => <span className="font-mono text-xs">{a.firstUsable} – {a.lastUsable}</span> },
              { id: 'broadcast', header: copy.colBroadcast, cell: (a) => <span className="font-mono text-xs">{a.broadcast}</span> },
              { id: 'usable', header: copy.colUsable, cell: (a) => <span className="font-mono text-xs">{a.usableHosts.toLocaleString(language)} / {a.requestedHosts.toLocaleString(language)}</span> },
              {
                id: 'waste',
                header: copy.colWaste,
                cell: (a) => (
                  <span className={`font-mono text-xs ${a.wastedHosts > a.requestedHosts ? 'text-amber-700' : 'text-slate-600'}`}>
                    {a.wastedHosts.toLocaleString(language)}
                  </span>
                )
              }
            ]}
          />

          <div className="rounded-lg border border-slate-200 p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs text-slate-500">
              <span className="font-semibold uppercase tracking-wide text-slate-400">{copy.utilisation}</span>
              <span className="font-mono">
                {plan.usedAddresses.toLocaleString(language)} {copy.of} {plan.totalAddresses.toLocaleString(language)} {copy.used} · {plan.utilisationPercent}%
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100" role="presentation">
              <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min(100, plan.utilisationPercent)}%` }} />
            </div>
            <p className="mt-3 text-xs text-slate-600">
              {copy.nextFree}: <span className="font-mono">{plan.nextFreeAddress ?? copy.full}</span>
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-sky-700">{copy.why}</h3>
              <p className="mt-2 text-xs leading-relaxed text-sky-900">{copy.whyBody}</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-700">{copy.trap}</h3>
              <p className="mt-2 text-xs leading-relaxed text-amber-900">{copy.trapBody}</p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

import { useMemo, useState } from 'react';
import { Gauge, Route, Router, ShieldCheck, TriangleAlert } from 'lucide-react';
import {
  calculateOspfCost,
  electOspfDrBdr,
  routeMatches,
  selectBestRoutes,
  type OspfCandidate
} from '../lib/ipConnectivity';
import { useStore } from '../store';
import OspfSpfLab from './OspfSpfLab';
import ResponsiveTable from './ResponsiveTable';
import {
  ROUTES,
  ROUTE_CODES,
  OSPF_STATES,
  SECURITY_ROWS,
  ROUTE_TABLE_OUTPUT,
  ROUTE_TABLE_LEGEND,
  FHRP_ROWS,
  STATIC_CONFIG,
  OSPF_CONFIG,
} from '../content/ipConnectivityLab';


function SectionTitle({ icon: Icon, title, id }: { icon: typeof Route; title: string; id: string }) {
  return <div className="flex items-center gap-3"><Icon className="h-5 w-5 text-indigo-600" /><h2 id={id} className="text-lg font-semibold text-slate-900">{title}</h2></div>;
}

export default function IpConnectivityLab() {
  const language = useStore(state => state.language);
  const [destination, setDestination] = useState('10.10.10.42');
  const [referenceBandwidth, setReferenceBandwidth] = useState(100000);
  const [interfaceBandwidth, setInterfaceBandwidth] = useState(1000);
  const [priorities, setPriorities] = useState<Record<string, number>>({ R1: 1, R2: 100, R3: 100 });
  const [lateJoin, setLateJoin] = useState(false);

  const lookup = useMemo(() => {
    try {
      const matching = ROUTES.filter(route => routeMatches(route, destination));
      return { matching, selected: selectBestRoutes(ROUTES, destination), error: false } as const;
    } catch {
      return { matching: [], selected: [], error: true } as const;
    }
  }, [destination]);

  const ospfCost = useMemo(() => {
    try {
      return calculateOspfCost(interfaceBandwidth, referenceBandwidth);
    } catch {
      return null;
    }
  }, [interfaceBandwidth, referenceBandwidth]);

  const election = useMemo(() => {
    const candidates: OspfCandidate[] = [
      { id: 'R1', priority: priorities.R1, routerId: '1.1.1.1' },
      { id: 'R2', priority: priorities.R2, routerId: '2.2.2.2' },
      { id: 'R3', priority: priorities.R3, routerId: '3.3.3.3' }
    ];
    const initial = electOspfDrBdr(candidates);
    if (!lateJoin) return initial;
    // R4 joins a segment that has already converged: the seated roles are passed in,
    // which is what makes the absence of preemption observable.
    return electOspfDrBdr(
      [...candidates, { id: 'R4', priority: 255, routerId: '4.4.4.4' }],
      { drId: initial.dr?.id, bdrId: initial.bdr?.id }
    );
  }, [priorities, lateJoin]);

  const selectedIds = new Set(lookup.selected.map(route => route.id));
  const t = language === 'it'
    ? {
        title: 'IP Connectivity Lab', subtitle: 'Dal lookup nella routing table alla convergenza OSPF: osserva come il router decide e come proteggere il control plane.',
        readTable: 'Leggere show ip route', legend: 'Elemento', legendDetail: 'Come si interpreta',
        readTableNote: 'La tabella qui sotto è un output realistico annotato. Leggerlo è un obiettivo d’esame a sé: prima di calcolare un percorso bisogna saper dire da dove viene ogni rotta, quanto è attendibile e se il router la userà davvero.',
        lookup: 'Routing table e longest-prefix match', destination: 'IPv4 di destinazione', invalid: 'Inserisci un indirizzo IPv4 valido.', code: 'Codice', prefix: 'Prefisso', adMetric: '[AD/metrica]', nextHop: 'Next hop / uscita', decision: 'Decisione', selected: 'Selezionata', candidate: 'Candidata', ignored: 'Non corrisponde',
        logic: 'Ordine della decisione', logicText: '1. Prefisso più lungo; 2. distanza amministrativa minore tra rotte dello stesso prefisso; 3. metrica minore all’interno dello stesso protocollo. Percorsi equivalenti possono essere installati in ECMP.',
        fib: 'RIB, FIB e adjacency table', fibText: 'La RIB raccoglie le rotte candidate del control plane. Le migliori vengono programmate nella FIB; l’adjacency table contiene le informazioni di riscrittura di livello 2. CEF usa FIB e adjacency per inoltrare nel data plane.',
        ospf: 'OSPFv2 single-area', cost: 'Calcolatore del costo OSPF', reference: 'Reference bandwidth (Mb/s)', bandwidth: 'Bandwidth interfaccia (Mb/s)', result: 'Costo risultante', costNote: 'Costo = reference bandwidth / interface bandwidth, con minimo 1. Configura lo stesso valore di riferimento su tutti i router del dominio OSPF.',
        election: 'Elezione DR/BDR', priority: 'Priorità', dr: 'DR', bdr: 'BDR',
        electionNote: 'Sulle reti broadcast vince la priorità più alta, poi il Router ID più alto; priorità 0 rende il router non eleggibile. L’ordine reale non è “i due migliori”: OSPF elegge prima il BDR tra i router che non rivendicano il ruolo di DR e lo promuove a DR solo se nessun DR è presente.',
        lateJoin: 'Aggiungi R4 (priorità 255) a rete già converta',
        promoted: 'Nessun DR presente: il BDR è stato promosso a DR ed è stato eletto un nuovo BDR.',
        blocked: 'R4 ha la priorità migliore ma resta DROTHER: l’elezione OSPF non è preemptive e i ruoli assegnati non vengono revocati finché il router seduto non scompare (o non si azzera il processo con clear ip ospf process).',
        states: 'Formazione dell’adiacenza', fhrp: 'First-hop redundancy: HSRP e VRRP', fhrpNote: 'Un FHRP protegge il default gateway, non il percorso: gli host continuano a usare un solo IP virtuale mentre il router fisico dietro di esso può cambiare. Attenzione all’esame: in HSRP il subentro del router con priorità migliore avviene solo se è configurato preempt, e un FHRP senza object tracking può restare Active pur avendo perso l’uplink.', property: 'Proprietà', security: 'Attacchi e difese del routing', attack: 'Attacco', effect: 'Effetto osservabile', defense: 'Difesa e limite', evidence: 'Verifica', config: 'Configurazioni IOS di riferimento', configNote: 'I comandi di autenticazione e CoPP dipendono dalla release e dalla piattaforma: verifica sempre il supporto IOS/IOS XE reale.'
      }
    : {
        title: 'IP Connectivity Lab', subtitle: 'From routing-table lookup to OSPF convergence: observe how the router decides and how to protect the control plane.',
        readTable: 'Reading show ip route', legend: 'Element', legendDetail: 'How to read it',
        readTableNote: 'The output below is a realistic annotated routing table. Reading it is an exam objective in its own right: before computing a path you must be able to say where each route came from, how trusted it is, and whether the router will actually use it.',
        lookup: 'Routing table and longest-prefix match', destination: 'Destination IPv4', invalid: 'Enter a valid IPv4 address.', code: 'Code', prefix: 'Prefix', adMetric: '[AD/metric]', nextHop: 'Next hop / exit', decision: 'Decision', selected: 'Selected', candidate: 'Candidate', ignored: 'No match',
        logic: 'Decision order', logicText: '1. Longest prefix; 2. lowest administrative distance among routes for the same prefix; 3. lowest metric within the same protocol. Equivalent paths may be installed as ECMP.',
        fib: 'RIB, FIB, and adjacency table', fibText: 'The RIB collects control-plane route candidates. The best routes are programmed into the FIB; the adjacency table holds Layer 2 rewrite information. CEF uses the FIB and adjacency table for data-plane forwarding.',
        ospf: 'Single-area OSPFv2', cost: 'OSPF cost calculator', reference: 'Reference bandwidth (Mb/s)', bandwidth: 'Interface bandwidth (Mb/s)', result: 'Resulting cost', costNote: 'Cost = reference bandwidth / interface bandwidth, with a minimum of 1. Configure the same reference value on every router in the OSPF domain.',
        election: 'DR/BDR election', priority: 'Priority', dr: 'DR', bdr: 'BDR',
        electionNote: 'On broadcast networks the highest priority wins, then the highest Router ID; priority 0 makes a router ineligible. The real order is not “the best two”: OSPF elects the BDR first among the routers that do not claim the DR role, and promotes it to DR only when no DR is present.',
        lateJoin: 'Add R4 (priority 255) to an already converged segment',
        promoted: 'No DR was present: the BDR was promoted to DR and a new BDR was elected.',
        blocked: 'R4 has the best priority but stays a DROTHER: the OSPF election is not preemptive and seated roles are not revoked until the seated router disappears (or the process is reset with clear ip ospf process).',
        states: 'Adjacency formation', fhrp: 'First-hop redundancy: HSRP and VRRP', fhrpNote: 'An FHRP protects the default gateway, not the path: hosts keep using a single virtual IP while the physical router behind it can change. Exam watch-out: in HSRP a better-priority router only takes over when preempt is configured, and an FHRP without object tracking can stay Active after losing its uplink.', property: 'Property', security: 'Routing attacks and defenses', attack: 'Attack', effect: 'Observable effect', defense: 'Defense and limitation', evidence: 'Verification', config: 'Reference IOS configurations', configNote: 'Authentication and CoPP commands vary by release and platform: always verify support on the actual IOS/IOS XE device.'
      };

  return (
    <div className="space-y-8">
      <header className="rounded-xl border border-slate-200 bg-white p-6 md:p-8"><p className="eyebrow">CCNA 3.1 · 3.2 · 3.3 · 3.4 · 3.5</p><h1 className="mt-2 text-2xl font-semibold text-slate-900">{t.title}</h1><p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{t.subtitle}</p></header>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="route-read-title">
        <SectionTitle icon={Route} title={t.readTable} id="route-read-title" />
        <p className="mt-3 max-w-4xl text-xs leading-relaxed text-slate-600">{t.readTableNote}</p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-emerald-300"><code>{ROUTE_TABLE_OUTPUT}</code></pre>
        <div className="mt-4"><ResponsiveTable
          rows={ROUTE_TABLE_LEGEND}
          rowKey={item => item.token}
          label={t.readTable}
          breakpoint="md"
          minWidth={620}
          columns={[
            { id: 'token', header: t.legend, heading: true, cell: item => <code className="text-[11px] font-semibold text-indigo-700">{item.token}</code> },
            { id: 'detail', header: t.legendDetail, cell: item => item.detail[language] }
          ]}
        /></div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="route-lookup-title">
        <SectionTitle icon={Route} title={t.lookup} id="route-lookup-title" />
        <label className="mt-5 block max-w-md space-y-1.5 text-xs font-medium text-slate-600">{t.destination}<input value={destination} onChange={event => setDestination(event.target.value)} inputMode="decimal" className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" /></label>
        {lookup.error ? <p className="mt-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert"><TriangleAlert className="h-4 w-4" />{t.invalid}</p> : (
          <><p className="lg:hidden mt-2 text-[11px] text-slate-400" role="note">{language === 'it' ? 'Scorri la tabella in orizzontale per vedere tutte le colonne.' : 'Scroll the table horizontally to see every column.'}</p><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[760px] border-collapse text-left text-xs"><thead><tr className="border-b border-slate-200 text-slate-500"><th className="p-3">{t.code}</th><th className="p-3">{t.prefix}</th><th className="p-3">{t.adMetric}</th><th className="p-3">{t.nextHop}</th><th className="p-3">{t.decision}</th></tr></thead><tbody>{ROUTES.map(route => { const matches = lookup.matching.some(item => item.id === route.id); const selected = selectedIds.has(route.id); return <tr key={route.id} className={`border-b border-slate-100 ${selected ? 'bg-emerald-50' : ''}`}><td className="p-3 font-mono font-semibold text-indigo-700">{ROUTE_CODES[route.source]}</td><td className="p-3 font-mono">{route.network}/{route.prefix}</td><td className="p-3 font-mono">[{route.administrativeDistance}/{route.metric}]</td><td className="p-3 font-mono">{route.nextHop ? `${route.nextHop} → ` : ''}{route.exitInterface}</td><td className={`p-3 font-semibold ${selected ? 'text-emerald-700' : matches ? 'text-amber-700' : 'text-slate-400'}`}>{selected ? t.selected : matches ? t.candidate : t.ignored}</td></tr>; })}</tbody></table></div></>
        )}
        <div className="mt-5 grid gap-4 lg:grid-cols-2"><article className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-4"><h3 className="text-sm font-semibold text-indigo-900">{t.logic}</h3><p className="mt-2 text-xs leading-relaxed text-indigo-900/80">{t.logicText}</p></article><article className="rounded-lg border border-sky-100 bg-sky-50/50 p-4"><h3 className="text-sm font-semibold text-sky-900">{t.fib}</h3><p className="mt-2 text-xs leading-relaxed text-sky-900/80">{t.fibText}</p></article></div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="ospf-title">
        <SectionTitle icon={Router} title={t.ospf} id="ospf-title" />
        <div className="mt-5 grid gap-6 xl:grid-cols-2">
          <article className="rounded-lg border border-slate-200 p-4"><h3 className="text-sm font-semibold text-slate-900">{t.cost}</h3><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="space-y-1.5 text-xs text-slate-600">{t.reference}<input type="number" min={1} value={referenceBandwidth} onChange={event => setReferenceBandwidth(Number(event.target.value))} className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm" /></label><label className="space-y-1.5 text-xs text-slate-600">{t.bandwidth}<input type="number" min={1} value={interfaceBandwidth} onChange={event => setInterfaceBandwidth(Number(event.target.value))} className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm" /></label></div><p className="mt-4 text-sm font-semibold text-indigo-700">{t.result}: {ospfCost ?? '—'}</p><p className="mt-2 text-xs leading-relaxed text-slate-600">{t.costNote}</p></article>
          <article className="rounded-lg border border-slate-200 p-4"><h3 className="text-sm font-semibold text-slate-900">{t.election}</h3><div className="mt-3 grid grid-cols-3 gap-2">{(['R1', 'R2', 'R3'] as const).map(id => <label key={id} className="space-y-1 text-xs text-slate-600">{id} · {t.priority}<select value={priorities[id]} onChange={event => setPriorities(current => ({ ...current, [id]: Number(event.target.value) }))} className="block w-full rounded-lg border border-slate-200 bg-white px-2 py-2 font-mono text-xs">{[0, 1, 50, 100, 200, 255].map(value => <option key={value} value={value}>{value}</option>)}</select></label>)}</div><label className="mt-4 flex items-center gap-2 text-xs text-slate-700"><input type="checkbox" checked={lateJoin} onChange={event => setLateJoin(event.target.checked)} className="h-4 w-4 rounded border-slate-300" />{t.lateJoin}</label><div className="mt-4 flex gap-3"><span className="rounded-md bg-indigo-100 px-3 py-2 text-xs font-semibold text-indigo-800">{t.dr}: {election.dr?.id ?? '—'}</span><span className="rounded-md bg-sky-100 px-3 py-2 text-xs font-semibold text-sky-800">{t.bdr}: {election.bdr?.id ?? '—'}</span></div>{election.preemptionBlocked ? <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">{t.blocked}</p> : null}{election.promotedBdr ? <p className="mt-3 rounded-lg border border-sky-100 bg-sky-50 p-3 text-xs leading-relaxed text-sky-900">{t.promoted}</p> : null}<p className="mt-3 text-xs leading-relaxed text-slate-600">{t.electionNote}</p></article>
        </div>
        <h3 className="mt-6 text-sm font-semibold text-slate-900">{t.states}</h3><ol className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{OSPF_STATES.map((item, index) => <li key={item.state} className="rounded-lg border border-slate-200 p-3"><span className="font-mono text-[10px] text-indigo-600">{index + 1}</span><h4 className="mt-1 text-xs font-semibold text-slate-900">{item.state}</h4><p className="mt-1.5 text-xs leading-relaxed text-slate-600">{item.detail[language]}</p></li>)}</ol>
      </section>

      <OspfSpfLab />

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="fhrp-title">
        <SectionTitle icon={Router} title={t.fhrp} id="fhrp-title" />
        <div className="mt-4"><ResponsiveTable
          rows={FHRP_ROWS}
          rowKey={row => row.property.en}
          label={t.fhrp}
          minWidth={760}
          columns={[
            { id: 'property', header: t.property, heading: true, cell: row => row.property[language] },
            { id: 'hsrp', header: 'HSRP', headerClassName: 'text-indigo-600', cell: row => row.hsrp[language] },
            { id: 'vrrp', header: 'VRRP', headerClassName: 'text-emerald-700', cell: row => row.vrrp[language] }
          ]}
        /></div>
        <p className="mt-4 rounded-lg border border-sky-100 bg-sky-50 p-3 text-xs leading-relaxed text-sky-900">{t.fhrpNote}</p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-emerald-300"><code>show standby brief{`\n`}show vrrp brief{`\n`}show track</code></pre>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="routing-security-title"><SectionTitle icon={ShieldCheck} title={t.security} id="routing-security-title" /><div className="mt-4"><ResponsiveTable
          rows={SECURITY_ROWS}
          rowKey={item => item.attack.en}
          label={t.security}
          breakpoint="xl"
          minWidth={960}
          columns={[
            { id: 'attack', header: t.attack, heading: true, cellClassName: 'text-rose-700', cell: item => item.attack[language] },
            { id: 'effect', header: t.effect, cell: item => item.effect[language] },
            { id: 'defense', header: t.defense, cellClassName: 'text-emerald-800', cell: item => item.defense[language] },
            { id: 'evidence', header: t.evidence, cell: item => <code className="text-[11px] text-indigo-700">{item.evidence}</code> }
          ]}
        /></div></section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="routing-config-title"><SectionTitle icon={Gauge} title={t.config} id="routing-config-title" /><p className="mt-3 text-xs leading-relaxed text-slate-600">{t.configNote}</p><div className="mt-4 grid gap-4 xl:grid-cols-2"><pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-emerald-300"><code>{STATIC_CONFIG[language]}</code></pre><pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-sky-300"><code>{OSPF_CONFIG}</code></pre></div></section>
    </div>
  );
}

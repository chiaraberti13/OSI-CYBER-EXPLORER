import { useMemo, useState } from 'react';
import { Gauge, Route, Router, ShieldCheck, TriangleAlert } from 'lucide-react';
import {
  calculateOspfCost,
  electOspfDrBdr,
  routeMatches,
  selectBestRoutes,
  type Ipv4Route,
  type OspfCandidate,
  type RouteSource
} from '../lib/ipConnectivity';
import { useStore } from '../store';

type Language = 'it' | 'en';
type Localized = Record<Language, string>;

const ROUTES: Ipv4Route[] = [
  { id: 'local-lan', source: 'local', network: '10.10.10.1', prefix: 32, administrativeDistance: 0, metric: 0, exitInterface: 'Gi0/1' },
  { id: 'connected-lan', source: 'connected', network: '10.10.10.0', prefix: 24, administrativeDistance: 0, metric: 0, exitInterface: 'Gi0/1' },
  { id: 'ospf-branch-a', source: 'ospf', network: '10.10.0.0', prefix: 16, administrativeDistance: 110, metric: 20, nextHop: '192.0.2.2', exitInterface: 'Gi0/0' },
  { id: 'static-campus', source: 'static', network: '10.0.0.0', prefix: 8, administrativeDistance: 1, metric: 0, nextHop: '192.0.2.6', exitInterface: 'Gi0/2' },
  { id: 'ospf-dc-a', source: 'ospf', network: '172.16.0.0', prefix: 16, administrativeDistance: 110, metric: 30, nextHop: '192.0.2.2', exitInterface: 'Gi0/0' },
  { id: 'ospf-dc-b', source: 'ospf', network: '172.16.0.0', prefix: 16, administrativeDistance: 110, metric: 30, nextHop: '192.0.2.10', exitInterface: 'Gi0/3' },
  { id: 'default', source: 'static', network: '0.0.0.0', prefix: 0, administrativeDistance: 1, metric: 0, nextHop: '198.51.100.1', exitInterface: 'Gi0/4' }
];

const ROUTE_CODES: Record<RouteSource, string> = {
  local: 'L',
  connected: 'C',
  static: 'S',
  ospf: 'O',
  'ospf-ia': 'O IA'
};

const OSPF_STATES: Array<{ state: string; detail: Localized }> = [
  { state: 'Down', detail: { it: 'Nessun Hello valido ricevuto durante il dead interval.', en: 'No valid Hello received within the dead interval.' } },
  { state: 'Init', detail: { it: 'È stato ricevuto un Hello, ma il router locale non compare ancora tra i neighbor.', en: 'A Hello was received, but the local router is not yet listed as a neighbor.' } },
  { state: '2-Way', detail: { it: 'Comunicazione bidirezionale; su reti multiaccess avviene l’elezione DR/BDR.', en: 'Bidirectional communication; DR/BDR election occurs on multiaccess networks.' } },
  { state: 'ExStart', detail: { it: 'I router negoziano master/slave e sequence number per lo scambio DBD.', en: 'Routers negotiate master/slave roles and sequence numbers for DBD exchange.' } },
  { state: 'Exchange', detail: { it: 'Vengono scambiati i Database Description packet.', en: 'Database Description packets are exchanged.' } },
  { state: 'Loading', detail: { it: 'LSR, LSU e LSAck sincronizzano le LSA mancanti o più recenti.', en: 'LSRs, LSUs, and LSAcks synchronize missing or newer LSAs.' } },
  { state: 'Full', detail: { it: 'Le link-state database dei due neighbor sono sincronizzate.', en: 'The neighbors’ link-state databases are synchronized.' } }
];

const SECURITY_ROWS: Array<{ attack: Localized; effect: Localized; defense: Localized; evidence: string }> = [
  {
    attack: { it: 'Neighbor OSPF non autorizzato', en: 'Unauthorized OSPF neighbor' },
    effect: { it: 'Un router ostile forma un’adiacenza e tenta di introdurre informazioni di routing.', en: 'A hostile router forms an adjacency and attempts to introduce routing information.' },
    defense: { it: 'Autenticazione OSPF coerente su entrambi i peer, passive-interface di default e adiacenze solo sui link previsti.', en: 'Consistent OSPF authentication on both peers, passive-interface by default, and adjacencies only on intended links.' },
    evidence: 'show ip ospf neighbor detail'
  },
  {
    attack: { it: 'LSA false o route injection', en: 'Forged LSA or route injection' },
    effect: { it: 'Rotte più specifiche, default o metriche alterate deviano il traffico verso black hole o intercettazione.', en: 'More-specific routes, defaults, or altered metrics redirect traffic toward a black hole or interception point.' },
    defense: { it: 'Autenticazione protegge il dominio da dispositivi esterni; filtri e policy di redistribuzione limitano anche errori o router interni compromessi.', en: 'Authentication protects the domain from external devices; redistribution filters and policy also limit mistakes or compromised internal routers.' },
    evidence: 'show ip ospf database'
  },
  {
    attack: { it: 'Hello/LSA flooding', en: 'Hello/LSA flooding' },
    effect: { it: 'Consumo di CPU e instabilità delle adiacenze o della LSDB.', en: 'CPU exhaustion and instability of adjacencies or the LSDB.' },
    defense: { it: 'CoPP per proteggere il control plane, autenticazione, policing e monitoraggio delle variazioni LSA/neighbor.', en: 'CoPP to protect the control plane, authentication, policing, and monitoring of LSA/neighbor churn.' },
    evidence: 'show policy-map control-plane'
  },
  {
    attack: { it: 'Route hijacking più specifico', en: 'More-specific route hijacking' },
    effect: { it: 'Una rotta con prefisso più lungo vince anche contro una sorgente con distanza amministrativa migliore.', en: 'A longer-prefix route wins even against a source with a better administrative distance.' },
    defense: { it: 'Prefix filtering, summarization controllata, autenticazione del protocollo e allarmi per nuovi prefissi critici.', en: 'Prefix filtering, controlled summarization, protocol authentication, and alerts for new critical prefixes.' },
    evidence: 'show ip route <prefix>'
  },
  {
    attack: { it: 'ICMP redirect spoofing', en: 'ICMP redirect spoofing' },
    effect: { it: 'Un host può accettare un next hop malevolo sulla rete locale.', en: 'A host may accept a malicious next hop on the local network.' },
    defense: { it: 'Disabilita ICMP Redirect sulle interfacce dove non serve, applica segmentazione e protezioni di access layer.', en: 'Disable ICMP Redirects on interfaces where they are not required, and apply segmentation and access-layer protections.' },
    evidence: 'show ip interface'
  },
  {
    attack: { it: 'IP source routing', en: 'IP source routing' },
    effect: { it: 'Opzioni IPv4 consentono al mittente di influenzare il percorso e tentare di aggirare controlli.', en: 'IPv4 options allow the sender to influence the path and attempt to bypass controls.' },
    defense: { it: 'Mantieni disabilitato IP source routing e filtra pacchetti con opzioni anomale ai confini.', en: 'Keep IP source routing disabled and filter packets with abnormal options at boundaries.' },
    evidence: 'show running-config | include source-route'
  },
  {
    attack: { it: 'Spoofing dell’indirizzo sorgente', en: 'Source-address spoofing' },
    effect: { it: 'Il traffico usa indirizzi impossibili o appartenenti ad altre reti per nascondere l’origine o amplificare attacchi.', en: 'Traffic uses impossible or foreign source addresses to hide its origin or amplify attacks.' },
    defense: { it: 'uRPF dove la topologia lo consente, ACL anti-spoofing e BCP 38 agli edge; valuta i percorsi asimmetrici.', en: 'uRPF where topology permits, anti-spoofing ACLs, and BCP 38 at edges; account for asymmetric paths.' },
    evidence: 'show ip interface | include verify'
  }
];

const STATIC_CONFIG: Record<Language, string> = {
  it: `ip route 0.0.0.0 0.0.0.0 198.51.100.1
ip route 10.20.0.0 255.255.0.0 192.0.2.2
! Floating static: AD 200, usata solo se la rotta migliore scompare
ip route 10.20.0.0 255.255.0.0 192.0.2.6 200
! IPv6
ipv6 route ::/0 2001:db8:0:1::1`,
  en: `ip route 0.0.0.0 0.0.0.0 198.51.100.1
ip route 10.20.0.0 255.255.0.0 192.0.2.2
! Floating static: AD 200, used only when the better route disappears
ip route 10.20.0.0 255.255.0.0 192.0.2.6 200
! IPv6
ipv6 route ::/0 2001:db8:0:1::1`
};

const OSPF_CONFIG = `router ospf 10
 router-id 1.1.1.1
 passive-interface default
 no passive-interface GigabitEthernet0/0
 auto-cost reference-bandwidth 100000
!
interface GigabitEthernet0/0
 ip ospf 10 area 0
 ip ospf network point-to-point
 ip ospf authentication key-chain OSPF-AUTH`;

function SectionTitle({ icon: Icon, title, id }: { icon: typeof Route; title: string; id: string }) {
  return <div className="flex items-center gap-3"><Icon className="h-5 w-5 text-indigo-600" /><h2 id={id} className="text-lg font-semibold text-slate-900">{title}</h2></div>;
}

export default function IpConnectivityLab() {
  const language = useStore(state => state.language);
  const [destination, setDestination] = useState('10.10.10.42');
  const [referenceBandwidth, setReferenceBandwidth] = useState(100000);
  const [interfaceBandwidth, setInterfaceBandwidth] = useState(1000);
  const [priorities, setPriorities] = useState<Record<string, number>>({ R1: 1, R2: 100, R3: 100 });

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
    return electOspfDrBdr(candidates);
  }, [priorities]);

  const selectedIds = new Set(lookup.selected.map(route => route.id));
  const t = language === 'it'
    ? {
        title: 'IP Connectivity Lab', subtitle: 'Dal lookup nella routing table alla convergenza OSPF: osserva come il router decide e come proteggere il control plane.',
        lookup: 'Routing table e longest-prefix match', destination: 'IPv4 di destinazione', invalid: 'Inserisci un indirizzo IPv4 valido.', code: 'Codice', prefix: 'Prefisso', adMetric: '[AD/metrica]', nextHop: 'Next hop / uscita', decision: 'Decisione', selected: 'Selezionata', candidate: 'Candidata', ignored: 'Non corrisponde',
        logic: 'Ordine della decisione', logicText: '1. Prefisso più lungo; 2. distanza amministrativa minore tra rotte dello stesso prefisso; 3. metrica minore all’interno dello stesso protocollo. Percorsi equivalenti possono essere installati in ECMP.',
        fib: 'RIB, FIB e adjacency table', fibText: 'La RIB raccoglie le rotte candidate del control plane. Le migliori vengono programmate nella FIB; l’adjacency table contiene le informazioni di riscrittura di livello 2. CEF usa FIB e adjacency per inoltrare nel data plane.',
        ospf: 'OSPFv2 single-area', cost: 'Calcolatore del costo OSPF', reference: 'Reference bandwidth (Mb/s)', bandwidth: 'Bandwidth interfaccia (Mb/s)', result: 'Costo risultante', costNote: 'Costo = reference bandwidth / interface bandwidth, con minimo 1. Configura lo stesso valore di riferimento su tutti i router del dominio OSPF.',
        election: 'Elezione DR/BDR iniziale', priority: 'Priorità', dr: 'DR', bdr: 'BDR', electionNote: 'Sulle reti broadcast eleggibili vince la priorità più alta, poi il Router ID più alto. Priorità 0 rende il router non eleggibile. L’elezione non è preemptive.',
        states: 'Formazione dell’adiacenza', security: 'Attacchi e difese del routing', attack: 'Attacco', effect: 'Effetto osservabile', defense: 'Difesa e limite', evidence: 'Verifica', config: 'Configurazioni IOS di riferimento', configNote: 'I comandi di autenticazione e CoPP dipendono dalla release e dalla piattaforma: verifica sempre il supporto IOS/IOS XE reale.'
      }
    : {
        title: 'IP Connectivity Lab', subtitle: 'From routing-table lookup to OSPF convergence: observe how the router decides and how to protect the control plane.',
        lookup: 'Routing table and longest-prefix match', destination: 'Destination IPv4', invalid: 'Enter a valid IPv4 address.', code: 'Code', prefix: 'Prefix', adMetric: '[AD/metric]', nextHop: 'Next hop / exit', decision: 'Decision', selected: 'Selected', candidate: 'Candidate', ignored: 'No match',
        logic: 'Decision order', logicText: '1. Longest prefix; 2. lowest administrative distance among routes for the same prefix; 3. lowest metric within the same protocol. Equivalent paths may be installed as ECMP.',
        fib: 'RIB, FIB, and adjacency table', fibText: 'The RIB collects control-plane route candidates. The best routes are programmed into the FIB; the adjacency table holds Layer 2 rewrite information. CEF uses the FIB and adjacency table for data-plane forwarding.',
        ospf: 'Single-area OSPFv2', cost: 'OSPF cost calculator', reference: 'Reference bandwidth (Mb/s)', bandwidth: 'Interface bandwidth (Mb/s)', result: 'Resulting cost', costNote: 'Cost = reference bandwidth / interface bandwidth, with a minimum of 1. Configure the same reference value on every router in the OSPF domain.',
        election: 'Initial DR/BDR election', priority: 'Priority', dr: 'DR', bdr: 'BDR', electionNote: 'On eligible broadcast networks, the highest priority wins, followed by the highest Router ID. Priority 0 makes a router ineligible. The election is non-preemptive.',
        states: 'Adjacency formation', security: 'Routing attacks and defenses', attack: 'Attack', effect: 'Observable effect', defense: 'Defense and limitation', evidence: 'Verification', config: 'Reference IOS configurations', configNote: 'Authentication and CoPP commands vary by release and platform: always verify support on the actual IOS/IOS XE device.'
      };

  return (
    <div className="space-y-8">
      <header className="rounded-xl border border-slate-200 bg-white p-6 md:p-8"><p className="eyebrow">CCNA 3.1 · 3.2 · 3.3 · 3.4</p><h1 className="mt-2 text-2xl font-semibold text-slate-900">{t.title}</h1><p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{t.subtitle}</p></header>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="route-lookup-title">
        <SectionTitle icon={Route} title={t.lookup} id="route-lookup-title" />
        <label className="mt-5 block max-w-md space-y-1.5 text-xs font-medium text-slate-600">{t.destination}<input value={destination} onChange={event => setDestination(event.target.value)} inputMode="decimal" className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" /></label>
        {lookup.error ? <p className="mt-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert"><TriangleAlert className="h-4 w-4" />{t.invalid}</p> : (
          <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[760px] border-collapse text-left text-xs"><thead><tr className="border-b border-slate-200 text-slate-500"><th className="p-3">{t.code}</th><th className="p-3">{t.prefix}</th><th className="p-3">{t.adMetric}</th><th className="p-3">{t.nextHop}</th><th className="p-3">{t.decision}</th></tr></thead><tbody>{ROUTES.map(route => { const matches = lookup.matching.some(item => item.id === route.id); const selected = selectedIds.has(route.id); return <tr key={route.id} className={`border-b border-slate-100 ${selected ? 'bg-emerald-50' : ''}`}><td className="p-3 font-mono font-semibold text-indigo-700">{ROUTE_CODES[route.source]}</td><td className="p-3 font-mono">{route.network}/{route.prefix}</td><td className="p-3 font-mono">[{route.administrativeDistance}/{route.metric}]</td><td className="p-3 font-mono">{route.nextHop ? `${route.nextHop} → ` : ''}{route.exitInterface}</td><td className={`p-3 font-semibold ${selected ? 'text-emerald-700' : matches ? 'text-amber-700' : 'text-slate-400'}`}>{selected ? t.selected : matches ? t.candidate : t.ignored}</td></tr>; })}</tbody></table></div>
        )}
        <div className="mt-5 grid gap-4 lg:grid-cols-2"><article className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-4"><h3 className="text-sm font-semibold text-indigo-900">{t.logic}</h3><p className="mt-2 text-xs leading-relaxed text-indigo-900/80">{t.logicText}</p></article><article className="rounded-lg border border-sky-100 bg-sky-50/50 p-4"><h3 className="text-sm font-semibold text-sky-900">{t.fib}</h3><p className="mt-2 text-xs leading-relaxed text-sky-900/80">{t.fibText}</p></article></div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="ospf-title">
        <SectionTitle icon={Router} title={t.ospf} id="ospf-title" />
        <div className="mt-5 grid gap-6 xl:grid-cols-2">
          <article className="rounded-lg border border-slate-200 p-4"><h3 className="text-sm font-semibold text-slate-900">{t.cost}</h3><div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="space-y-1.5 text-xs text-slate-600">{t.reference}<input type="number" min={1} value={referenceBandwidth} onChange={event => setReferenceBandwidth(Number(event.target.value))} className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm" /></label><label className="space-y-1.5 text-xs text-slate-600">{t.bandwidth}<input type="number" min={1} value={interfaceBandwidth} onChange={event => setInterfaceBandwidth(Number(event.target.value))} className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm" /></label></div><p className="mt-4 text-sm font-semibold text-indigo-700">{t.result}: {ospfCost ?? '—'}</p><p className="mt-2 text-xs leading-relaxed text-slate-600">{t.costNote}</p></article>
          <article className="rounded-lg border border-slate-200 p-4"><h3 className="text-sm font-semibold text-slate-900">{t.election}</h3><div className="mt-3 grid grid-cols-3 gap-2">{(['R1', 'R2', 'R3'] as const).map(id => <label key={id} className="space-y-1 text-xs text-slate-600">{id} · {t.priority}<select value={priorities[id]} onChange={event => setPriorities(current => ({ ...current, [id]: Number(event.target.value) }))} className="block w-full rounded-lg border border-slate-200 bg-white px-2 py-2 font-mono text-xs">{[0, 1, 50, 100, 200, 255].map(value => <option key={value} value={value}>{value}</option>)}</select></label>)}</div><div className="mt-4 flex gap-3"><span className="rounded-md bg-indigo-100 px-3 py-2 text-xs font-semibold text-indigo-800">{t.dr}: {election.dr?.id ?? '—'}</span><span className="rounded-md bg-sky-100 px-3 py-2 text-xs font-semibold text-sky-800">{t.bdr}: {election.bdr?.id ?? '—'}</span></div><p className="mt-3 text-xs leading-relaxed text-slate-600">{t.electionNote}</p></article>
        </div>
        <h3 className="mt-6 text-sm font-semibold text-slate-900">{t.states}</h3><ol className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{OSPF_STATES.map((item, index) => <li key={item.state} className="rounded-lg border border-slate-200 p-3"><span className="font-mono text-[10px] text-indigo-600">{index + 1}</span><h4 className="mt-1 text-xs font-semibold text-slate-900">{item.state}</h4><p className="mt-1.5 text-xs leading-relaxed text-slate-600">{item.detail[language]}</p></li>)}</ol>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="routing-security-title"><SectionTitle icon={ShieldCheck} title={t.security} id="routing-security-title" /><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[960px] border-collapse text-left text-xs"><thead><tr className="border-b border-slate-200 text-slate-500"><th className="p-3">{t.attack}</th><th className="p-3">{t.effect}</th><th className="p-3">{t.defense}</th><th className="p-3">{t.evidence}</th></tr></thead><tbody>{SECURITY_ROWS.map(item => <tr key={item.attack.en} className="border-b border-slate-100 align-top"><th className="p-3 font-semibold text-rose-700">{item.attack[language]}</th><td className="p-3 leading-relaxed text-slate-600">{item.effect[language]}</td><td className="p-3 leading-relaxed text-emerald-800">{item.defense[language]}</td><td className="p-3"><code className="text-[11px] text-indigo-700">{item.evidence}</code></td></tr>)}</tbody></table></div></section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="routing-config-title"><SectionTitle icon={Gauge} title={t.config} id="routing-config-title" /><p className="mt-3 text-xs leading-relaxed text-slate-600">{t.configNote}</p><div className="mt-4 grid gap-4 xl:grid-cols-2"><pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-emerald-300"><code>{STATIC_CONFIG[language]}</code></pre><pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-sky-300"><code>{OSPF_CONFIG}</code></pre></div></section>
    </div>
  );
}

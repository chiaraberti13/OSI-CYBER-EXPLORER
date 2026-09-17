import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Filter, Gauge, Route, Router, ShieldCheck } from 'lucide-react';
import { ROUTING_SECURITY_SCENARIOS, type RoutingSecurityArea } from '../content/routingSecurityScenarios';
import { SECURITY_TECHNIQUES } from '../content/securityCoverage';
import { DEFENSE_CONTROLS } from '../content/defenseControls';
import type { SecurityPlane } from '../content/securityTaxonomy';
import { useStore } from '../store';

const AREAS: RoutingSecurityArea[] = ['ospf', 'redistribution', 'bgp', 'fhrp', 'source-validation', 'copp', 'host-routing', 'forwarding', 'change'];
const PLANES: SecurityPlane[] = ['control', 'data', 'management'];
const AREA_LABELS: Record<RoutingSecurityArea, { it: string; en: string }> = {
  ospf: { it: 'OSPF', en: 'OSPF' }, redistribution: { it: 'Redistribuzione', en: 'Redistribution' }, bgp: { it: 'BGP', en: 'BGP' }, fhrp: { it: 'FHRP', en: 'FHRP' }, 'source-validation': { it: 'Validazione sorgente', en: 'Source validation' }, copp: { it: 'CoPP', en: 'CoPP' }, 'host-routing': { it: 'Routing host', en: 'Host routing' }, forwarding: { it: 'RIB/FIB', en: 'RIB/FIB' }, change: { it: 'Change', en: 'Change' }
};
const PLANE_LABELS: Record<SecurityPlane, { it: string; en: string }> = {
  physical: { it: 'Fisico', en: 'Physical' }, data: { it: 'Dati', en: 'Data' }, control: { it: 'Controllo', en: 'Control' }, management: { it: 'Gestione', en: 'Management' }, application: { it: 'Applicazione', en: 'Application' }, identity: { it: 'Identità', en: 'Identity' }
};
const TECHNIQUE_BY_ID = new Map(SECURITY_TECHNIQUES.map(item => [item.id, item]));
const CONTROL_BY_ID = new Map(DEFENSE_CONTROLS.map(item => [item.id, item]));

export default function RoutingSecurityLab() {
  const language = useStore(state => state.language);
  const [area, setArea] = useState<'all' | RoutingSecurityArea>('all');
  const [plane, setPlane] = useState<'all' | SecurityPlane>('all');
  const filtered = useMemo(() => ROUTING_SECURITY_SCENARIOS.filter(item => (area === 'all' || item.area === area) && (plane === 'all' || item.planes.includes(plane))), [area, plane]);

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6 md:p-8"><div className="flex items-start gap-4"><div className="rounded-xl bg-blue-50 p-3 text-blue-700"><Router className="h-6 w-6" aria-hidden="true" /></div><div><p className="eyebrow">PEER · POLICY · CONVERGENCE · FORWARDING</p><h1 className="mt-2 text-2xl font-semibold text-slate-900">{language === 'it' ? 'Laboratorio sicurezza del routing e control plane' : 'Routing & Control-Plane Security Lab'}</h1><p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-600">{language === 'it' ? 'Distingui ciò che il control plane apprende da ciò che il data plane inoltra. Gli scenari collegano adiacenze, policy, RIB/FIB, gateway e change a evidenze e verifiche operative.' : 'Distinguish what the control plane learns from what the data plane forwards. Scenarios connect adjacencies, policy, RIB/FIB, gateways, and changes to evidence and operational verification.'}</p></div></div></header>

      <section className="grid gap-3 sm:grid-cols-3" aria-label={language === 'it' ? 'Riepilogo sicurezza routing' : 'Routing security summary'}>{[{ value: ROUTING_SECURITY_SCENARIOS.length, it: 'Scenari operativi', en: 'Operational scenarios' }, { value: new Set(ROUTING_SECURITY_SCENARIOS.flatMap(item => item.techniqueIds)).size, it: 'Tecniche correlate', en: 'Related techniques' }, { value: ROUTING_SECURITY_SCENARIOS.reduce((total, item) => total + item.verification.length, 0), it: 'Prove di forwarding', en: 'Forwarding proofs' }].map(item => <div key={item.en} className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-2xl font-semibold text-slate-900">{item.value}</p><p className="text-xs text-slate-500">{item[language]}</p></div>)}</section>

      <aside className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-blue-950"><p className="flex items-center gap-2 text-sm font-semibold"><Gauge className="h-4 w-4" aria-hidden="true" />{language === 'it' ? 'Regola di verifica' : 'Verification rule'}</p><p className="mt-2 text-xs leading-relaxed">{language === 'it' ? 'Neighbor FULL, route presente o job SUCCESS non dimostrano da soli che il traffico attraversi il next hop corretto. Verifica sempre intent, RIB, FIB/CEF, adjacency, policy e flusso end-to-end.' : 'A FULL neighbor, a present route, or a SUCCESS job alone does not prove that traffic traverses the correct next hop. Always verify intent, RIB, FIB/CEF, adjacency, policy, and the end-to-end flow.'}</p></aside>

      <section className="rounded-xl border border-slate-200 bg-white p-4" aria-labelledby="routing-security-filter-title"><h2 id="routing-security-filter-title" className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Filter className="h-4 w-4 text-indigo-600" aria-hidden="true" />{language === 'it' ? 'Filtra gli scenari' : 'Filter scenarios'}</h2><div className="mt-3 grid gap-3 sm:grid-cols-2"><FilterSelect label={language === 'it' ? 'Area di routing' : 'Routing area'} value={area} onChange={value => setArea(value as 'all' | RoutingSecurityArea)} allLabel={language === 'it' ? 'Tutte le aree' : 'All areas'} options={AREAS.map(value => ({ value, label: AREA_LABELS[value][language] }))} /><FilterSelect label={language === 'it' ? 'Piano di sicurezza' : 'Security plane'} value={plane} onChange={value => setPlane(value as 'all' | SecurityPlane)} allLabel={language === 'it' ? 'Tutti i piani' : 'All planes'} options={PLANES.map(value => ({ value, label: PLANE_LABELS[value][language] }))} /></div></section>

      <div className="flex items-center justify-between gap-4"><h2 className="text-lg font-semibold text-slate-900">{language === 'it' ? 'Decisioni, minacce e prove' : 'Decisions, threats, and proof'}</h2><span className="text-xs font-semibold text-slate-500" aria-live="polite">{filtered.length} {language === 'it' ? 'risultati' : 'results'}</span></div>
      {filtered.length > 0 ? <section className="grid gap-4 xl:grid-cols-2" aria-label={language === 'it' ? 'Scenari sicurezza routing' : 'Routing security scenarios'}>{filtered.map(item => <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 [content-visibility:auto] [contain-intrinsic-size:auto_720px]">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4"><div><p className="text-[10px] font-semibold uppercase tracking-wider text-blue-700">{AREA_LABELS[item.area][language]}</p><h3 className="mt-1 text-base font-semibold text-slate-900">{item.title[language]}</h3></div><div className="flex flex-wrap justify-end gap-1">{item.planes.map(value => <span key={value} className="rounded-full bg-indigo-50 px-2 py-1 text-[9px] font-semibold text-indigo-800">{PLANE_LABELS[value][language]}</span>)}</div></div>
        <Info icon={Route} label={language === 'it' ? 'Decisione normale' : 'Normal decision'} tone="sky"><p>{item.normalDecision[language]}</p></Info>
        <Info icon={AlertTriangle} label={language === 'it' ? 'Minaccia o failure mode' : 'Threat or failure mode'} tone="rose"><p>{item.threat[language]}</p></Info>
        <div className="grid gap-3 sm:grid-cols-2"><Info icon={Gauge} label={language === 'it' ? 'Evidenze' : 'Evidence'} tone="amber"><List items={item.evidence.map(value => value[language])} /></Info><Info icon={ShieldCheck} label={language === 'it' ? 'Controlli' : 'Controls'} tone="teal"><List items={item.controls.map(value => value[language])} /></Info></div>
        <Info icon={CheckCircle2} label={language === 'it' ? 'Verifica operativa' : 'Operational verification'} tone="emerald"><List items={item.verification.map(value => value[language])} /></Info>
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-slate-700"><p className="text-[10px] font-semibold uppercase tracking-wider">{language === 'it' ? 'Limite tecnico' : 'Technical caveat'}</p><p className="mt-2 text-xs leading-relaxed">{item.caveat[language]}</p></div>
        <div className="mt-3 border-t border-slate-100 pt-3 text-[10px] leading-relaxed text-slate-500"><p><strong>{language === 'it' ? 'Tecniche:' : 'Techniques:'}</strong> {item.techniqueIds.map(id => TECHNIQUE_BY_ID.get(id)?.name[language]).join(' · ')}</p><p className="mt-1"><strong>{language === 'it' ? 'Difese:' : 'Defenses:'}</strong> {item.controlIds.map(id => CONTROL_BY_ID.get(id)?.name[language]).join(' · ')}</p></div>
      </article>)}</section> : <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500" role="status">{language === 'it' ? 'Nessuno scenario corrisponde ai filtri.' : 'No scenario matches the filters.'}</div>}
    </div>
  );
}

const TONES = { sky: 'border-sky-100 bg-sky-50/60 text-sky-950', rose: 'border-rose-100 bg-rose-50/60 text-rose-950', amber: 'border-amber-100 bg-amber-50/60 text-amber-950', teal: 'border-teal-100 bg-teal-50/60 text-teal-950', emerald: 'border-emerald-100 bg-emerald-50/60 text-emerald-950' } as const;
function Info({ icon: Icon, label, tone, children }: { icon: typeof Route; label: string; tone: keyof typeof TONES; children: ReactNode }) { return <section className={`mt-3 rounded-lg border p-3 ${TONES[tone]}`}><h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider"><Icon className="h-3.5 w-3.5" aria-hidden="true" />{label}</h4><div className="mt-2 text-xs leading-relaxed">{children}</div></section>; }
function List({ items }: { items: string[] }) { return <ul className="space-y-1.5">{items.map(item => <li key={item}>• {item}</li>)}</ul>; }
function FilterSelect({ label, value, onChange, allLabel, options }: { label: string; value: string; onChange: (value: string) => void; allLabel: string; options: Array<{ value: string; label: string }> }) { return <label className="text-xs text-slate-600">{label}<select value={value} onChange={event => onChange(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"><option value="all">{allLabel}</option>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>; }

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Eye, Filter, Network, ShieldCheck, Waypoints } from 'lucide-react';
import { IPV6_SECURITY_SCENARIOS, type Ipv6SecurityTopic } from '../content/ipv6Security';
import { SECURITY_TECHNIQUES } from '../content/securityCoverage';
import { DEFENSE_CONTROLS } from '../content/defenseControls';
import type { SecurityPlane } from '../content/securityTaxonomy';
import { useStore } from '../store';

const TOPICS: Ipv6SecurityTopic[] = ['first-hop', 'control', 'evasion', 'transition', 'dual-stack'];
const PLANES: SecurityPlane[] = ['data', 'control', 'management', 'application'];
const TOPIC_LABELS: Record<Ipv6SecurityTopic, { it: string; en: string }> = {
  'first-hop': { it: 'First hop', en: 'First hop' }, control: { it: 'Controllo', en: 'Control' }, evasion: { it: 'Evasione', en: 'Evasion' }, transition: { it: 'Transizione', en: 'Transition' }, 'dual-stack': { it: 'Dual-stack', en: 'Dual stack' }
};
const PLANE_LABELS: Record<SecurityPlane, { it: string; en: string }> = {
  physical: { it: 'Fisico', en: 'Physical' }, data: { it: 'Dati', en: 'Data' }, control: { it: 'Controllo', en: 'Control' }, management: { it: 'Gestione', en: 'Management' }, application: { it: 'Applicazione', en: 'Application' }, identity: { it: 'Identità', en: 'Identity' }
};
const TECHNIQUE_BY_ID = new Map(SECURITY_TECHNIQUES.map(item => [item.id, item]));
const CONTROL_BY_ID = new Map(DEFENSE_CONTROLS.map(item => [item.id, item]));

export default function Ipv6SecurityLab() {
  const language = useStore(state => state.language);
  const [topic, setTopic] = useState<'all' | Ipv6SecurityTopic>('all');
  const [plane, setPlane] = useState<'all' | SecurityPlane>('all');
  const filtered = useMemo(() => IPV6_SECURITY_SCENARIOS.filter(item => (topic === 'all' || item.topic === topic) && (plane === 'all' || item.planes.includes(plane))), [topic, plane]);

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6 md:p-8">
        <div className="flex items-start gap-4"><div className="rounded-xl bg-cyan-50 p-3 text-cyan-700"><Network className="h-6 w-6" aria-hidden="true" /></div><div><p className="eyebrow">DISCOVER · PROTECT · OBSERVE · VERIFY</p><h1 className="mt-2 text-2xl font-semibold text-slate-900">{language === 'it' ? 'Laboratorio sicurezza IPv6 e dual-stack' : 'IPv6 & Dual-Stack Security Lab'}</h1><p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-600">{language === 'it' ? 'Collega il comportamento normale di IPv6 agli abusi reali e ai controlli verificabili. Il laboratorio separa il piano di controllo dal piano dati e mette in evidenza le differenze operative rispetto a IPv4.' : 'Connect normal IPv6 behavior to real abuse and verifiable controls. The lab separates the control plane from the data plane and highlights operational differences from IPv4.'}</p></div></div>
      </header>

      <section className="grid gap-3 sm:grid-cols-3" aria-label={language === 'it' ? 'Riepilogo del laboratorio IPv6' : 'IPv6 lab summary'}>
        {[{ value: IPV6_SECURITY_SCENARIOS.length, it: 'Scenari operativi', en: 'Operational scenarios' }, { value: new Set(IPV6_SECURITY_SCENARIOS.flatMap(item => item.techniqueIds)).size, it: 'Tecniche correlate', en: 'Related techniques' }, { value: new Set(IPV6_SECURITY_SCENARIOS.flatMap(item => item.controlIds)).size, it: 'Controlli difensivi', en: 'Defense controls' }].map(item => <div key={item.en} className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-2xl font-semibold text-slate-900">{item.value}</p><p className="text-xs text-slate-500">{item[language]}</p></div>)}
      </section>

      <aside className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-amber-950"><p className="flex items-center gap-2 text-sm font-semibold"><AlertTriangle className="h-4 w-4" aria-hidden="true" />{language === 'it' ? 'Due regole da ricordare' : 'Two rules to remember'}</p><ul className="mt-2 space-y-1.5 text-xs leading-relaxed"><li>• {language === 'it' ? 'Il default gateway IPv6 si apprende dai Router Advertisement, non da DHCPv6.' : 'The IPv6 default gateway is learned from Router Advertisements, not from DHCPv6.'}</li><li>• {language === 'it' ? 'ICMPv6 è necessario per ND e Path MTU Discovery: va filtrato per tipo e ruolo, non bloccato in blocco.' : 'ICMPv6 is required for ND and Path MTU Discovery: filter it by type and role rather than blocking it wholesale.'}</li></ul></aside>

      <section className="rounded-xl border border-slate-200 bg-white p-4" aria-labelledby="ipv6-filter-title"><h2 id="ipv6-filter-title" className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Filter className="h-4 w-4 text-indigo-600" aria-hidden="true" />{language === 'it' ? 'Filtra gli scenari' : 'Filter scenarios'}</h2><div className="mt-3 grid gap-3 sm:grid-cols-2"><FilterSelect label={language === 'it' ? 'Argomento' : 'Topic'} value={topic} onChange={value => setTopic(value as 'all' | Ipv6SecurityTopic)} allLabel={language === 'it' ? 'Tutti gli argomenti' : 'All topics'} options={TOPICS.map(value => ({ value, label: TOPIC_LABELS[value][language] }))} /><FilterSelect label={language === 'it' ? 'Piano di sicurezza' : 'Security plane'} value={plane} onChange={value => setPlane(value as 'all' | SecurityPlane)} allLabel={language === 'it' ? 'Tutti i piani' : 'All planes'} options={PLANES.map(value => ({ value, label: PLANE_LABELS[value][language] }))} /></div></section>

      <div className="flex items-center justify-between gap-4"><h2 className="text-lg font-semibold text-slate-900">{language === 'it' ? 'Scenari e verifiche' : 'Scenarios and verification'}</h2><span className="text-xs font-semibold text-slate-500" aria-live="polite">{filtered.length} {language === 'it' ? 'risultati' : 'results'}</span></div>
      {filtered.length > 0 ? <section className="grid gap-4 xl:grid-cols-2" aria-label={language === 'it' ? 'Scenari di sicurezza IPv6' : 'IPv6 security scenarios'}>{filtered.map(item => (
        <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 [content-visibility:auto] [contain-intrinsic-size:auto_720px]">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4"><div><p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-700">{TOPIC_LABELS[item.topic][language]}</p><h3 className="mt-1 text-base font-semibold text-slate-900">{item.title[language]}</h3></div><div className="flex flex-wrap justify-end gap-1">{item.planes.map(value => <span key={value} className="rounded-full bg-indigo-50 px-2 py-1 text-[9px] font-semibold text-indigo-800">{PLANE_LABELS[value][language]}</span>)}</div></div>
          <Info icon={Waypoints} label={language === 'it' ? 'Comportamento normale' : 'Normal behavior'} tone="sky"><p>{item.normalBehavior[language]}</p></Info>
          <Info icon={AlertTriangle} label={language === 'it' ? 'Minaccia e impatto' : 'Threat and impact'} tone="rose"><p>{item.threat[language]}</p></Info>
          <div className="grid gap-3 sm:grid-cols-2"><Info icon={Eye} label={language === 'it' ? 'Evidenze da cercare' : 'Evidence to seek'} tone="amber"><List items={item.evidence.map(value => value[language])} /></Info><Info icon={ShieldCheck} label={language === 'it' ? 'Controlli' : 'Controls'} tone="teal"><List items={item.controls.map(value => value[language])} /></Info></div>
          <Info icon={CheckCircle2} label={language === 'it' ? 'Verifica operativa' : 'Operational verification'} tone="emerald"><List items={item.verification.map(value => value[language])} /></Info>
          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-slate-700"><p className="text-[10px] font-semibold uppercase tracking-wider">{language === 'it' ? 'Errore comune' : 'Common pitfall'}</p><p className="mt-2 text-xs leading-relaxed">{item.pitfall[language]}</p></div>
          <div className="mt-3 border-t border-slate-100 pt-3 text-[10px] leading-relaxed text-slate-500"><p><strong>{language === 'it' ? 'Tecniche:' : 'Techniques:'}</strong> {item.techniqueIds.map(id => TECHNIQUE_BY_ID.get(id)?.name[language]).join(' · ')}</p><p className="mt-1"><strong>{language === 'it' ? 'Difese:' : 'Defenses:'}</strong> {item.controlIds.map(id => CONTROL_BY_ID.get(id)?.name[language]).join(' · ')}</p></div>
        </article>
      ))}</section> : <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500" role="status">{language === 'it' ? 'Nessuno scenario corrisponde ai filtri.' : 'No scenario matches the filters.'}</div>}
    </div>
  );
}

const TONES = { sky: 'border-sky-100 bg-sky-50/60 text-sky-950', rose: 'border-rose-100 bg-rose-50/60 text-rose-950', amber: 'border-amber-100 bg-amber-50/60 text-amber-950', teal: 'border-teal-100 bg-teal-50/60 text-teal-950', emerald: 'border-emerald-100 bg-emerald-50/60 text-emerald-950' } as const;
function Info({ icon: Icon, label, tone, children }: { icon: typeof Eye; label: string; tone: keyof typeof TONES; children: ReactNode }) { return <section className={`mt-3 rounded-lg border p-3 ${TONES[tone]}`}><h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider"><Icon className="h-3.5 w-3.5" aria-hidden="true" />{label}</h4><div className="mt-2 text-xs leading-relaxed">{children}</div></section>; }
function List({ items }: { items: string[] }) { return <ul className="space-y-1.5">{items.map(item => <li key={item}>• {item}</li>)}</ul>; }
function FilterSelect({ label, value, onChange, allLabel, options }: { label: string; value: string; onChange: (value: string) => void; allLabel: string; options: Array<{ value: string; label: string }> }) { return <label className="text-xs text-slate-600">{label}<select value={value} onChange={event => onChange(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"><option value="all">{allLabel}</option>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>; }

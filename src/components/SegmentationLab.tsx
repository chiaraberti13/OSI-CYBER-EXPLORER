import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Filter, GitFork, Layers3, Route, ShieldCheck } from 'lucide-react';
import { SEGMENTATION_SCENARIOS, type SegmentationArea } from '../content/segmentationScenarios';
import { SECURITY_TECHNIQUES } from '../content/securityCoverage';
import { DEFENSE_CONTROLS } from '../content/defenseControls';
import type { SecurityPlane } from '../content/securityTaxonomy';
import { useStore } from '../store';

const AREAS: SegmentationArea[] = ['layer2', 'routed', 'vrf', 'management', 'edge', 'east-west', 'overlay', 'shared-services'];
const PLANES: SecurityPlane[] = ['data', 'control', 'management', 'identity', 'application'];
const AREA_LABELS: Record<SegmentationArea, { it: string; en: string }> = {
  layer2: { it: 'Layer 2', en: 'Layer 2' }, routed: { it: 'Routing e ACL', en: 'Routing and ACLs' }, vrf: { it: 'VRF', en: 'VRF' }, management: { it: 'Gestione', en: 'Management' }, edge: { it: 'Guest e IoT', en: 'Guest and IoT' }, 'east-west': { it: 'East–west', en: 'East–west' }, overlay: { it: 'Overlay', en: 'Overlay' }, 'shared-services': { it: 'Servizi condivisi', en: 'Shared services' }
};
const PLANE_LABELS: Record<SecurityPlane, { it: string; en: string }> = {
  physical: { it: 'Fisico', en: 'Physical' }, data: { it: 'Dati', en: 'Data' }, control: { it: 'Controllo', en: 'Control' }, management: { it: 'Gestione', en: 'Management' }, application: { it: 'Applicazione', en: 'Application' }, identity: { it: 'Identità', en: 'Identity' }
};
const TECHNIQUE_BY_ID = new Map(SECURITY_TECHNIQUES.map(item => [item.id, item]));
const CONTROL_BY_ID = new Map(DEFENSE_CONTROLS.map(item => [item.id, item]));

export default function SegmentationLab() {
  const language = useStore(state => state.language);
  const [area, setArea] = useState<'all' | SegmentationArea>('all');
  const [plane, setPlane] = useState<'all' | SecurityPlane>('all');
  const filtered = useMemo(() => SEGMENTATION_SCENARIOS.filter(item => (area === 'all' || item.area === area) && (plane === 'all' || item.planes.includes(plane))), [area, plane]);

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6 md:p-8"><div className="flex items-start gap-4"><div className="rounded-xl bg-violet-50 p-3 text-violet-700"><Layers3 className="h-6 w-6" aria-hidden="true" /></div><div><p className="eyebrow">ZONE · PATH · ENFORCEMENT · PROOF</p><h1 className="mt-2 text-2xl font-semibold text-slate-900">{language === 'it' ? 'Laboratorio segmentazione e confini di fiducia' : 'Segmentation & Trust Boundaries Lab'}</h1><p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-600">{language === 'it' ? 'Segui il percorso reale del traffico attraverso VLAN, SVI, ACL, VRF, firewall e overlay. L’obiettivo non è presumere l’isolamento, ma individuare il punto di enforcement e provarlo in entrambe le direzioni.' : 'Follow the actual traffic path through VLANs, SVIs, ACLs, VRFs, firewalls, and overlays. The goal is not to assume isolation, but to identify the enforcement point and prove it in both directions.'}</p></div></div></header>

      <section className="grid gap-3 sm:grid-cols-3" aria-label={language === 'it' ? 'Riepilogo segmentazione' : 'Segmentation summary'}>{[{ value: SEGMENTATION_SCENARIOS.length, it: 'Scenari architetturali', en: 'Architecture scenarios' }, { value: new Set(SEGMENTATION_SCENARIOS.flatMap(item => item.techniqueIds)).size, it: 'Tecniche correlate', en: 'Related techniques' }, { value: SEGMENTATION_SCENARIOS.reduce((total, item) => total + item.verification.length, 0), it: 'Verifiche operative', en: 'Operational checks' }].map(item => <div key={item.en} className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-2xl font-semibold text-slate-900">{item.value}</p><p className="text-xs text-slate-500">{item[language]}</p></div>)}</section>

      <aside className="rounded-xl border border-violet-200 bg-violet-50/70 p-4 text-violet-950"><p className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="h-4 w-4" aria-hidden="true" />{language === 'it' ? 'Principio operativo' : 'Operational principle'}</p><p className="mt-2 text-xs leading-relaxed">{language === 'it' ? 'Una VLAN separa domini Layer 2 e una VRF separa tabelle di routing: nessuna delle due, da sola, definisce quali flussi siano autorizzati. Il confine di sicurezza esiste soltanto dove una policy viene applicata, osservata e verificata.' : 'A VLAN separates Layer 2 domains and a VRF separates routing tables: neither one alone defines which flows are authorized. A security boundary exists only where policy is enforced, observed, and verified.'}</p></aside>

      <section className="rounded-xl border border-slate-200 bg-white p-4" aria-labelledby="segmentation-filter-title"><h2 id="segmentation-filter-title" className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Filter className="h-4 w-4 text-indigo-600" aria-hidden="true" />{language === 'it' ? 'Filtra gli scenari' : 'Filter scenarios'}</h2><div className="mt-3 grid gap-3 sm:grid-cols-2"><FilterSelect label={language === 'it' ? 'Area architetturale' : 'Architecture area'} value={area} onChange={value => setArea(value as 'all' | SegmentationArea)} allLabel={language === 'it' ? 'Tutte le aree' : 'All areas'} options={AREAS.map(value => ({ value, label: AREA_LABELS[value][language] }))} /><FilterSelect label={language === 'it' ? 'Piano di sicurezza' : 'Security plane'} value={plane} onChange={value => setPlane(value as 'all' | SecurityPlane)} allLabel={language === 'it' ? 'Tutti i piani' : 'All planes'} options={PLANES.map(value => ({ value, label: PLANE_LABELS[value][language] }))} /></div></section>

      <div className="flex items-center justify-between gap-4"><h2 className="text-lg font-semibold text-slate-900">{language === 'it' ? 'Percorsi e punti di enforcement' : 'Paths and enforcement points'}</h2><span className="text-xs font-semibold text-slate-500" aria-live="polite">{filtered.length} {language === 'it' ? 'risultati' : 'results'}</span></div>
      {filtered.length > 0 ? <section className="grid gap-4 xl:grid-cols-2" aria-label={language === 'it' ? 'Scenari di segmentazione' : 'Segmentation scenarios'}>{filtered.map(item => <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 [content-visibility:auto] [contain-intrinsic-size:auto_760px]">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4"><div><p className="text-[10px] font-semibold uppercase tracking-wider text-violet-700">{AREA_LABELS[item.area][language]}</p><h3 className="mt-1 text-base font-semibold text-slate-900">{item.title[language]}</h3></div><div className="flex flex-wrap justify-end gap-1">{item.planes.map(value => <span key={value} className="rounded-full bg-indigo-50 px-2 py-1 text-[9px] font-semibold text-indigo-800">{PLANE_LABELS[value][language]}</span>)}</div></div>
        <Info icon={Layers3} label={language === 'it' ? 'Architettura corretta' : 'Intended architecture'} tone="sky"><p>{item.architecture[language]}</p></Info>
        <Info icon={AlertTriangle} label={language === 'it' ? 'Rottura del confine di fiducia' : 'Trust-boundary failure'} tone="rose"><p>{item.trustFailure[language]}</p></Info>
        <Info icon={Route} label={language === 'it' ? 'Percorso del traffico' : 'Traffic path'} tone="violet"><ol className="space-y-2">{item.packetPath.map((step, index) => <li key={step.en} className="flex gap-2"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-200 text-[9px] font-bold text-violet-900">{index + 1}</span><span>{step[language]}</span></li>)}</ol></Info>
        <div className="grid gap-3 sm:grid-cols-2"><Info icon={ShieldCheck} label={language === 'it' ? 'Controlli' : 'Controls'} tone="teal"><List items={item.controls.map(value => value[language])} /></Info><Info icon={CheckCircle2} label={language === 'it' ? 'Prove operative' : 'Operational proof'} tone="emerald"><List items={item.verification.map(value => value[language])} /></Info></div>
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-amber-950"><p className="text-[10px] font-semibold uppercase tracking-wider">{language === 'it' ? 'Limite da ricordare' : 'Limitation to remember'}</p><p className="mt-2 text-xs leading-relaxed">{item.limitation[language]}</p></div>
        <div className="mt-3 border-t border-slate-100 pt-3 text-[10px] leading-relaxed text-slate-500"><p><strong>{language === 'it' ? 'Tecniche:' : 'Techniques:'}</strong> {item.techniqueIds.map(id => TECHNIQUE_BY_ID.get(id)?.name[language]).join(' · ')}</p><p className="mt-1"><strong>{language === 'it' ? 'Difese:' : 'Defenses:'}</strong> {item.controlIds.map(id => CONTROL_BY_ID.get(id)?.name[language]).join(' · ')}</p></div>
      </article>)}</section> : <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500" role="status">{language === 'it' ? 'Nessuno scenario corrisponde ai filtri.' : 'No scenario matches the filters.'}</div>}
    </div>
  );
}

const TONES = { sky: 'border-sky-100 bg-sky-50/60 text-sky-950', rose: 'border-rose-100 bg-rose-50/60 text-rose-950', violet: 'border-violet-100 bg-violet-50/60 text-violet-950', teal: 'border-teal-100 bg-teal-50/60 text-teal-950', emerald: 'border-emerald-100 bg-emerald-50/60 text-emerald-950' } as const;
function Info({ icon: Icon, label, tone, children }: { icon: typeof GitFork; label: string; tone: keyof typeof TONES; children: ReactNode }) { return <section className={`mt-3 rounded-lg border p-3 ${TONES[tone]}`}><h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider"><Icon className="h-3.5 w-3.5" aria-hidden="true" />{label}</h4><div className="mt-2 text-xs leading-relaxed">{children}</div></section>; }
function List({ items }: { items: string[] }) { return <ul className="space-y-1.5">{items.map(item => <li key={item}>• {item}</li>)}</ul>; }
function FilterSelect({ label, value, onChange, allLabel, options }: { label: string; value: string; onChange: (value: string) => void; allLabel: string; options: Array<{ value: string; label: string }> }) { return <label className="text-xs text-slate-600">{label}<select value={value} onChange={event => onChange(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"><option value="all">{allLabel}</option>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>; }

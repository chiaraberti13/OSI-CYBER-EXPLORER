import { useMemo, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Filter, Laptop, Network, Search, ShieldCheck } from 'lucide-react';
import { useStore } from '../store';
import { ENDPOINT_SECURITY_SCENARIOS, type EndpointSecurityArea } from '../content/endpointSecurityScenarios';
import { SECURITY_TECHNIQUES } from '../content/securityCoverage';
import { DEFENSE_CONTROLS } from '../content/defenseControls';
import type { SecurityPlane } from '../content/securityTaxonomy';

const AREAS: EndpointSecurityArea[] = ['inventory', 'baseline', 'patching', 'edr', 'firewall', 'application', 'posture', 'privilege', 'containment'];
const PLANES: SecurityPlane[] = ['data', 'application', 'management', 'identity'];
const AREA_LABELS: Record<EndpointSecurityArea, { it: string; en: string }> = {
  inventory: { it: 'Inventario', en: 'Inventory' }, baseline: { it: 'Baseline', en: 'Baseline' }, patching: { it: 'Patching', en: 'Patching' },
  edr: { it: 'EDR e sensor health', en: 'EDR and sensor health' }, firewall: { it: 'Host firewall', en: 'Host firewall' },
  application: { it: 'Application control', en: 'Application control' }, posture: { it: 'Postura e NAC', en: 'Posture and NAC' },
  privilege: { it: 'Privilegi locali', en: 'Local privileges' }, containment: { it: 'Contenimento', en: 'Containment' }
};
const PLANE_LABELS: Record<SecurityPlane, { it: string; en: string }> = {
  physical: { it: 'Fisico', en: 'Physical' }, data: { it: 'Dati', en: 'Data' }, control: { it: 'Controllo', en: 'Control' },
  management: { it: 'Gestione', en: 'Management' }, application: { it: 'Applicazione', en: 'Application' }, identity: { it: 'Identità', en: 'Identity' }
};
const TECHNIQUE_BY_ID = new Map(SECURITY_TECHNIQUES.map(item => [item.id, item]));
const CONTROL_BY_ID = new Map(DEFENSE_CONTROLS.map(item => [item.id, item]));

export default function EndpointSecurityLab() {
  const language = useStore(state => state.language);
  const [area, setArea] = useState<'all' | EndpointSecurityArea>('all');
  const [plane, setPlane] = useState<'all' | SecurityPlane>('all');
  const filtered = useMemo(() => ENDPOINT_SECURITY_SCENARIOS.filter(item => (area === 'all' || item.area === area) && (plane === 'all' || item.planes.includes(plane))), [area, plane]);

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6 md:p-8"><div className="flex items-start gap-4"><div className="rounded-xl bg-violet-50 p-3 text-violet-800"><Laptop className="h-6 w-6" aria-hidden="true" /></div><div><p className="eyebrow">INVENTORY · POSTURE · DETECTION · CONTAINMENT</p><h1 className="mt-2 text-2xl font-semibold text-slate-900">{language === 'it' ? 'Laboratorio sicurezza endpoint e postura' : 'Endpoint Security & Posture Lab'}</h1><p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-600">{language === 'it' ? 'Segui l’endpoint dall’inventario alla riammissione: baseline, patch, EDR, host firewall, applicazioni, privilegi e NAC continuo. Gli scenari distinguono uno stato dichiarato dalla protezione realmente verificata.' : 'Follow an endpoint from inventory through readmission: baselines, patches, EDR, host firewalls, applications, privileges, and continuous NAC. Scenarios distinguish a declared state from actually verified protection.'}</p></div></div></header>

      <section className="grid gap-3 sm:grid-cols-3" aria-label={language === 'it' ? 'Riepilogo sicurezza endpoint' : 'Endpoint security summary'}>{[{ value: ENDPOINT_SECURITY_SCENARIOS.length, it: 'Scenari operativi', en: 'Operational scenarios' }, { value: new Set(ENDPOINT_SECURITY_SCENARIOS.flatMap(item => item.techniqueIds)).size, it: 'Tecniche correlate', en: 'Related techniques' }, { value: ENDPOINT_SECURITY_SCENARIOS.reduce((total, item) => total + item.verification.length, 0), it: 'Verifiche end-to-end', en: 'End-to-end checks' }].map(item => <div key={item.en} className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-2xl font-semibold text-slate-900">{item.value}</p><p className="text-xs text-slate-500">{item[language]}</p></div>)}</section>

      <aside className="rounded-xl border border-violet-200 bg-violet-50/70 p-4 text-violet-950"><p className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="h-4 w-4" aria-hidden="true" />{language === 'it' ? 'Principio di verifica' : 'Verification principle'}</p><p className="mt-2 text-xs leading-relaxed">{language === 'it' ? 'Installato, compliant, patched e healthy sono fotografie diverse e possono essere obsolete. La prova richiede riconciliazione dell’inventario, stato effettivo, un test controllato e verifica della risposta.' : 'Installed, compliant, patched, and healthy are different snapshots and may be stale. Proof requires inventory reconciliation, effective state, a controlled test, and response verification.'}</p></aside>

      <section className="rounded-xl border border-slate-200 bg-white p-4" aria-labelledby="endpoint-filter-title"><h2 id="endpoint-filter-title" className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Filter className="h-4 w-4 text-violet-800" aria-hidden="true" />{language === 'it' ? 'Filtra gli scenari' : 'Filter scenarios'}</h2><div className="mt-3 grid gap-3 sm:grid-cols-2"><FilterSelect label={language === 'it' ? 'Area endpoint' : 'Endpoint area'} value={area} onChange={value => setArea(value as 'all' | EndpointSecurityArea)} allLabel={language === 'it' ? 'Tutte le aree' : 'All areas'} options={AREAS.map(value => ({ value, label: AREA_LABELS[value][language] }))} /><FilterSelect label={language === 'it' ? 'Piano di sicurezza' : 'Security plane'} value={plane} onChange={value => setPlane(value as 'all' | SecurityPlane)} allLabel={language === 'it' ? 'Tutti i piani' : 'All planes'} options={PLANES.map(value => ({ value, label: PLANE_LABELS[value][language] }))} /></div></section>

      <div className="flex items-center justify-between gap-4"><h2 className="text-lg font-semibold text-slate-900">{language === 'it' ? 'Lifecycle, minaccia e prova' : 'Lifecycle, threat, and proof'}</h2><span className="text-xs font-semibold text-slate-500" aria-live="polite">{filtered.length} {language === 'it' ? 'risultati' : 'results'}</span></div>
      {filtered.length > 0 ? <section className="grid gap-4 xl:grid-cols-2" aria-label={language === 'it' ? 'Scenari sicurezza endpoint' : 'Endpoint security scenarios'}>{filtered.map(item => <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 [content-visibility:auto] [contain-intrinsic-size:auto_780px]">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4"><div><p className="text-[10px] font-semibold uppercase tracking-wider text-violet-800">{AREA_LABELS[item.area][language]}</p><h3 className="mt-1 text-base font-semibold text-slate-900">{item.title[language]}</h3></div><div className="flex flex-wrap justify-end gap-1">{item.planes.map(value => <span key={value} className="rounded-full bg-indigo-50 px-2 py-1 text-[9px] font-semibold text-indigo-800">{PLANE_LABELS[value][language]}</span>)}</div></div>
        <Info icon={Network} label={language === 'it' ? 'Lifecycle del controllo' : 'Control lifecycle'} tone="sky"><ol className="space-y-2">{item.lifecycle.map((step, index) => <li key={step.en} className="flex gap-2"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-200 text-[9px] font-bold text-sky-900">{index + 1}</span><span>{step[language]}</span></li>)}</ol></Info>
        <Info icon={AlertTriangle} label={language === 'it' ? 'Minaccia o failure mode' : 'Threat or failure mode'} tone="rose"><p>{item.threat[language]}</p></Info>
        <div className="grid gap-3 sm:grid-cols-2"><Info icon={Search} label={language === 'it' ? 'Evidenze' : 'Evidence'} tone="amber"><List items={item.evidence.map(value => value[language])} /></Info><Info icon={ShieldCheck} label={language === 'it' ? 'Controlli' : 'Controls'} tone="teal"><List items={item.controls.map(value => value[language])} /></Info></div>
        <Info icon={CheckCircle2} label={language === 'it' ? 'Verifica operativa' : 'Operational verification'} tone="emerald"><List items={item.verification.map(value => value[language])} /></Info>
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-slate-700"><p className="text-[10px] font-semibold uppercase tracking-wider">{language === 'it' ? 'Limite tecnico' : 'Technical caveat'}</p><p className="mt-2 text-xs leading-relaxed">{item.caveat[language]}</p></div>
        <div className="mt-3 border-t border-slate-100 pt-3 text-[10px] leading-relaxed text-slate-500"><p><strong>{language === 'it' ? 'Tecniche:' : 'Techniques:'}</strong> {item.techniqueIds.map(id => TECHNIQUE_BY_ID.get(id)?.name[language]).join(' · ')}</p><p className="mt-1"><strong>{language === 'it' ? 'Difese:' : 'Defenses:'}</strong> {item.controlIds.map(id => CONTROL_BY_ID.get(id)?.name[language]).join(' · ')}</p></div>
      </article>)}</section> : <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500" role="status">{language === 'it' ? 'Nessuno scenario corrisponde ai filtri.' : 'No scenario matches the filters.'}</div>}
    </div>
  );
}

const TONES = { sky: 'border-sky-100 bg-sky-50/60 text-sky-950', rose: 'border-rose-100 bg-rose-50/60 text-rose-950', amber: 'border-amber-100 bg-amber-50/60 text-amber-950', teal: 'border-teal-100 bg-teal-50/60 text-teal-950', emerald: 'border-emerald-100 bg-emerald-50/60 text-emerald-950' } as const;
function Info({ icon: Icon, label, tone, children }: { icon: typeof Network; label: string; tone: keyof typeof TONES; children: ReactNode }) { return <section className={`mt-3 rounded-lg border p-3 ${TONES[tone]}`}><h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider"><Icon className="h-3.5 w-3.5" aria-hidden="true" />{label}</h4><div className="mt-2 text-xs leading-relaxed">{children}</div></section>; }
function List({ items }: { items: string[] }) { return <ul className="space-y-1.5">{items.map(item => <li key={item}>• {item}</li>)}</ul>; }
function FilterSelect({ label, value, onChange, allLabel, options }: { label: string; value: string; onChange: (value: string) => void; allLabel: string; options: Array<{ value: string; label: string }> }) { return <label className="text-xs text-slate-600">{label}<select value={value} onChange={event => onChange(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-100"><option value="all">{allLabel}</option>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>; }

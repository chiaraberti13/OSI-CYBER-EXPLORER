import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Database, Filter, Link2, Radar, ShieldAlert, Siren } from 'lucide-react';
import { DETECTION_USE_CASES } from '../content/detectionUseCases';
import { ATTACK_FAMILIES, type SecurityPlane } from '../content/securityTaxonomy';
import { SECURITY_TECHNIQUES } from '../content/securityCoverage';
import { SECURITY_EVIDENCE_CASES } from '../content/securityEvidence';
import { CCNA_DOMAINS } from '../content/ccna';
import { useStore } from '../store';

const PLANES: SecurityPlane[] = ['physical', 'data', 'control', 'management', 'application', 'identity'];
const FAMILY_BY_ID = new Map(ATTACK_FAMILIES.map(item => [item.id, item]));
const TECHNIQUE_BY_ID = new Map(SECURITY_TECHNIQUES.map(item => [item.id, item]));
const EVIDENCE_BY_ID = new Map(SECURITY_EVIDENCE_CASES.map(item => [item.id, item]));
const DOMAIN_BY_ID = new Map(CCNA_DOMAINS.map(item => [item.id, item]));
const PLANE_LABELS: Record<SecurityPlane, { it: string; en: string }> = {
  physical: { it: 'Fisico', en: 'Physical' }, data: { it: 'Data plane', en: 'Data plane' }, control: { it: 'Control plane', en: 'Control plane' }, management: { it: 'Management plane', en: 'Management plane' }, application: { it: 'Applicativo', en: 'Application' }, identity: { it: 'Identità', en: 'Identity' }
};

export default function DetectionEngineeringLab() {
  const language = useStore(state => state.language);
  const [family, setFamily] = useState('all');
  const [plane, setPlane] = useState<'all' | SecurityPlane>('all');
  const filtered = useMemo(() => DETECTION_USE_CASES.filter(item => (family === 'all' || item.familyIds.includes(family)) && (plane === 'all' || item.planes.includes(plane))), [family, plane]);

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6 md:p-8">
        <div className="flex items-start gap-4"><div className="rounded-xl bg-cyan-50 p-3 text-cyan-700"><Radar className="h-6 w-6" aria-hidden="true" /></div><div><p className="eyebrow">SIGNAL · CORRELATE · VALIDATE · RESPOND</p><h1 className="mt-2 text-2xl font-semibold text-slate-900">{language === 'it' ? 'Laboratorio di Detection Engineering' : 'Detection Engineering Lab'}</h1><p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-600">{language === 'it' ? 'Progetta il rilevamento partendo da telemetria e comportamento, non da un singolo alert. Ogni caso mostra logica, correlazione, cause legittime alternative, validazione controllata e prima risposta.' : 'Design detection from telemetry and behavior rather than a single alert. Each case shows logic, correlation, legitimate alternative causes, controlled validation, and first response.'}</p></div></div>
      </header>

      <section className="grid gap-3 sm:grid-cols-3" aria-label={language === 'it' ? 'Riepilogo rilevamenti' : 'Detection summary'}>{[{ value: DETECTION_USE_CASES.length, it: 'Casi di rilevamento', en: 'Detection use cases' }, { value: ATTACK_FAMILIES.length, it: 'Famiglie coperte', en: 'Covered families' }, { value: PLANES.length, it: 'Piani osservati', en: 'Observed planes' }].map(item => <div key={item.en} className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-2xl font-semibold text-slate-900">{item.value}</p><p className="text-xs text-slate-500">{item[language]}</p></div>)}</section>

      <section className="rounded-xl border border-slate-200 bg-white p-4" aria-labelledby="detection-filter-title"><h2 id="detection-filter-title" className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Filter className="h-4 w-4 text-indigo-600" aria-hidden="true" />{language === 'it' ? 'Filtra i casi' : 'Filter use cases'}</h2><div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-xs text-slate-600">{language === 'it' ? 'Famiglia di attacco' : 'Attack family'}<select value={family} onChange={event => setFamily(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"><option value="all">{language === 'it' ? 'Tutte le famiglie' : 'All families'}</option>{ATTACK_FAMILIES.map(item => <option key={item.id} value={item.id}>{item.name[language]}</option>)}</select></label><label className="text-xs text-slate-600">{language === 'it' ? 'Piano di sicurezza' : 'Security plane'}<select value={plane} onChange={event => setPlane(event.target.value as 'all' | SecurityPlane)} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"><option value="all">{language === 'it' ? 'Tutti i piani' : 'All planes'}</option>{PLANES.map(item => <option key={item} value={item}>{PLANE_LABELS[item][language]}</option>)}</select></label></div></section>

      <div className="flex items-center justify-between gap-4"><h2 className="text-lg font-semibold text-slate-900">{language === 'it' ? 'Logiche di rilevamento' : 'Detection logic'}</h2><p className="text-xs font-semibold text-slate-500" aria-live="polite">{filtered.length} {language === 'it' ? 'risultati' : 'results'}</p></div>
      {filtered.length > 0 ? <section className="grid gap-4 xl:grid-cols-2" aria-label={language === 'it' ? 'Casi di detection engineering' : 'Detection engineering use cases'}>{filtered.map(item => (
        <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 deferred-card [contain-intrinsic-height:auto_760px]">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4"><div><p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-700">{item.planes.map(id => PLANE_LABELS[id][language]).join(' · ')}</p><h3 className="mt-1 text-base font-semibold text-slate-900">{item.title[language]}</h3></div><div className="flex max-w-xs flex-wrap justify-end gap-1">{item.familyIds.map(id => <span key={id} className="rounded-full bg-rose-50 px-2 py-1 text-[9px] font-semibold text-rose-800">{FAMILY_BY_ID.get(id)?.name[language]}</span>)}</div></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2"><Info icon={Database} label={language === 'it' ? 'Fonti di telemetria' : 'Telemetry sources'} tone="sky"><ul className="space-y-1.5">{item.telemetry.map(source => <li key={source.en}>• {source[language]}</li>)}</ul></Info><Info icon={Activity} label={language === 'it' ? 'Logica' : 'Logic'} tone="indigo"><p>{item.detectionLogic[language]}</p></Info><Info icon={Link2} label={language === 'it' ? 'Correlazione' : 'Correlation'} tone="violet"><p>{item.correlation[language]}</p></Info><Info icon={AlertTriangle} label={language === 'it' ? 'Cause legittime alternative' : 'Legitimate alternative causes'} tone="amber"><ul className="space-y-1.5">{item.benignCauses.map(cause => <li key={cause.en}>• {cause[language]}</li>)}</ul></Info></div>
          <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50/60 p-3 text-emerald-950"><p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider"><CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />{language === 'it' ? 'Validazione controllata' : 'Controlled validation'}</p><ul className="mt-2 space-y-1.5 text-xs leading-relaxed">{item.validation.map(step => <li key={step.en}>• {step[language]}</li>)}</ul></div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2"><Info icon={Siren} label={language === 'it' ? 'Prima risposta' : 'First response'} tone="rose"><p>{item.firstResponse[language]}</p></Info><Info icon={ShieldAlert} label={language === 'it' ? 'Limite analitico' : 'Analytical limitation'} tone="slate"><p>{item.limitation[language]}</p></Info></div>
          <div className="mt-3 border-t border-slate-100 pt-3 text-[10px] leading-relaxed text-slate-500"><p><strong>{language === 'it' ? 'Tecniche:' : 'Techniques:'}</strong> {item.techniqueIds.map(id => TECHNIQUE_BY_ID.get(id)?.name[language]).join(' · ')}</p>{item.evidenceIds.length > 0 ? <p className="mt-1"><strong>{language === 'it' ? 'Evidenze correlate:' : 'Related evidence:'}</strong> {item.evidenceIds.map(id => EVIDENCE_BY_ID.get(id)?.title[language]).join(' · ')}</p> : null}<p className="mt-1"><strong>{language === 'it' ? 'Domini:' : 'Domains:'}</strong> {item.domains.map(id => DOMAIN_BY_ID.get(id)?.title[language]).join(' · ')}</p></div>
        </article>
      ))}</section> : <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500" role="status">{language === 'it' ? 'Nessun caso corrisponde ai filtri.' : 'No use case matches the filters.'}</div>}
    </div>
  );
}

const TONES = { sky: 'border-sky-100 bg-sky-50/60 text-sky-950', indigo: 'border-indigo-100 bg-indigo-50/60 text-indigo-950', violet: 'border-violet-100 bg-violet-50/60 text-violet-950', amber: 'border-amber-100 bg-amber-50/60 text-amber-950', rose: 'border-rose-100 bg-rose-50/60 text-rose-950', slate: 'border-slate-200 bg-slate-50 text-slate-700' } as const;
function Info({ icon: Icon, label, tone, children }: { icon: typeof Activity; label: string; tone: keyof typeof TONES; children: ReactNode }) { return <div className={`rounded-lg border p-3 ${TONES[tone]}`}><p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider"><Icon className="h-3.5 w-3.5" aria-hidden="true" />{label}</p><div className="mt-2 text-xs leading-relaxed">{children}</div></div>; }

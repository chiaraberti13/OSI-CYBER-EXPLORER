import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Filter, Layers3, Link2, ShieldCheck } from 'lucide-react';
import { CCNA_DOMAINS } from '../content/ccna';
import { DEFENSE_CONTROLS, type DefenseFunction } from '../content/defenseControls';
import { SECURITY_TECHNIQUES } from '../content/securityCoverage';
import { type SecurityPlane } from '../content/securityTaxonomy';
import { useStore } from '../store';

const FUNCTIONS: DefenseFunction[] = ['prevent', 'detect', 'contain', 'recover', 'compensate'];
const PLANES: SecurityPlane[] = ['physical', 'data', 'control', 'management', 'application', 'identity'];
const DOMAIN_BY_ID = new Map(CCNA_DOMAINS.map(item => [item.id, item]));
const TECHNIQUE_BY_ID = new Map(SECURITY_TECHNIQUES.map(item => [item.id, item]));
const FUNCTION_LABELS: Record<DefenseFunction, { it: string; en: string }> = {
  prevent: { it: 'Preventiva', en: 'Preventive' }, detect: { it: 'Detective', en: 'Detective' }, contain: { it: 'Contenimento', en: 'Containment' }, recover: { it: 'Ripristino', en: 'Recovery' }, compensate: { it: 'Compensativa', en: 'Compensating' }
};

export default function DefenseControlsLab() {
  const language = useStore(state => state.language);
  const [fn, setFn] = useState<'all' | DefenseFunction>('all');
  const [plane, setPlane] = useState<'all' | SecurityPlane>('all');
  const filtered = useMemo(() => DEFENSE_CONTROLS.filter(control => (fn === 'all' || control.functions.includes(fn)) && (plane === 'all' || control.planes.includes(plane))), [fn, plane]);

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6 md:p-8"><div className="flex items-start gap-4"><div className="rounded-xl bg-emerald-50 p-3 text-emerald-700"><ShieldCheck className="h-6 w-6" aria-hidden="true" /></div><div><p className="eyebrow">CONTROL · DEPENDENCY · LIMIT</p><h1 className="mt-2 text-2xl font-semibold text-slate-900">{language === 'it' ? 'Laboratorio dei controlli difensivi' : 'Defensive Controls Lab'}</h1><p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-600">{language === 'it' ? 'Esplora le difese come sistemi composti: funzione, punto di enforcement, prerequisiti, verifica e limite operativo. Nessun controllo è efficace solo perché configurato.' : 'Explore defenses as composed systems: function, enforcement point, prerequisites, verification, and operational limitation. No control is effective merely because it is configured.'}</p></div></div></header>

      <section className="grid gap-3 sm:grid-cols-3" aria-label={language === 'it' ? 'Riepilogo difese' : 'Defense summary'}>{[{ v: DEFENSE_CONTROLS.length, it: 'Controlli', en: 'Controls' }, { v: FUNCTIONS.length, it: 'Funzioni', en: 'Functions' }, { v: PLANES.length, it: 'Piani coperti', en: 'Covered planes' }].map(item => <div key={item.en} className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-2xl font-semibold text-slate-900">{item.v}</p><p className="text-xs text-slate-500">{item[language]}</p></div>)}</section>

      <section className="rounded-xl border border-slate-200 bg-white p-4" aria-labelledby="defense-filter-title"><h2 id="defense-filter-title" className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Filter className="h-4 w-4 text-indigo-600" aria-hidden="true" />{language === 'it' ? 'Filtra i controlli' : 'Filter controls'}</h2><div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-xs text-slate-600">{language === 'it' ? 'Funzione' : 'Function'}<select value={fn} onChange={event => setFn(event.target.value as 'all' | DefenseFunction)} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"><option value="all">{language === 'it' ? 'Tutte le funzioni' : 'All functions'}</option>{FUNCTIONS.map(item => <option key={item} value={item}>{FUNCTION_LABELS[item][language]}</option>)}</select></label><label className="text-xs text-slate-600">{language === 'it' ? 'Piano' : 'Plane'}<select value={plane} onChange={event => setPlane(event.target.value as 'all' | SecurityPlane)} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"><option value="all">{language === 'it' ? 'Tutti i piani' : 'All planes'}</option>{PLANES.map(item => <option key={item} value={item}>{item}</option>)}</select></label></div></section>

      <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-slate-900">{language === 'it' ? 'Architettura di difesa' : 'Defense architecture'}</h2><span className="text-xs font-semibold text-slate-500" aria-live="polite">{filtered.length} {language === 'it' ? 'risultati' : 'results'}</span></div>
      <section className="grid gap-4 xl:grid-cols-2" aria-label={language === 'it' ? 'Controlli difensivi' : 'Defensive controls'}>
        {filtered.map(control => <article key={control.id} className="rounded-xl border border-slate-200 bg-white p-5 [content-visibility:auto] [contain-intrinsic-size:auto_420px]"><div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3"><div><p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">{control.planes.join(' · ')}</p><h3 className="mt-1 text-base font-semibold text-slate-900">{control.name[language]}</h3></div><div className="flex flex-wrap gap-1">{control.functions.map(item => <span key={item} className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-semibold text-emerald-800">{FUNCTION_LABELS[item][language]}</span>)}</div></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><Info icon={Layers3} label={language === 'it' ? 'Enforcement' : 'Enforcement'} text={control.enforcement[language]} tone="indigo" /><Info icon={Link2} label={language === 'it' ? 'Dipendenze' : 'Dependencies'} text={control.dependsOn[language]} tone="sky" /><Info icon={CheckCircle2} label={language === 'it' ? 'Verifica' : 'Verification'} text={control.verify[language]} tone="emerald" /><Info icon={AlertTriangle} label={language === 'it' ? 'Limite operativo' : 'Operational limit'} text={control.limitation[language]} tone="orange" /></div><div className="mt-3 border-t border-slate-100 pt-3 text-[10px] text-slate-500"><p>{language === 'it' ? 'Domini' : 'Domains'}: {control.domains.map(id => DOMAIN_BY_ID.get(id)?.title[language]).join(' · ')}</p><p className="mt-1">{language === 'it' ? 'Contrasta' : 'Counters'}: {control.techniqueIds.map(id => TECHNIQUE_BY_ID.get(id)?.name[language]).join(' · ')}</p></div></article>)}
      </section>
    </div>
  );
}

const TONES = { indigo: 'border-indigo-100 bg-indigo-50/60 text-indigo-950', sky: 'border-sky-100 bg-sky-50/60 text-sky-950', emerald: 'border-emerald-100 bg-emerald-50/60 text-emerald-950', orange: 'border-orange-200 bg-orange-50 text-orange-950' } as const;
function Info({ icon: Icon, label, text, tone }: { icon: typeof Layers3; label: string; text: string; tone: keyof typeof TONES }) { return <div className={`rounded-lg border p-3 ${TONES[tone]}`}><h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider"><Icon className="h-3.5 w-3.5" aria-hidden="true" />{label}</h4><p className="mt-2 text-xs leading-relaxed">{text}</p></div>; }

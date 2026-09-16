import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, FileCode2, Filter, RotateCcw, ShieldAlert, ShieldCheck, TerminalSquare } from 'lucide-react';
import { HARDENING_CONFIGS, type ChangeRisk, type HardeningArea } from '../content/hardeningConfigs';
import { CCNA_DOMAINS } from '../content/ccna';
import { SECURITY_TECHNIQUES } from '../content/securityCoverage';
import { DEFENSE_CONTROLS } from '../content/defenseControls';
import { useStore } from '../store';

const AREAS: HardeningArea[] = ['layer2', 'routing', 'services', 'management', 'security', 'automation'];
const RISKS: ChangeRisk[] = ['low', 'medium', 'high'];
const DOMAIN_BY_ID = new Map(CCNA_DOMAINS.map(item => [item.id, item]));
const TECHNIQUE_BY_ID = new Map(SECURITY_TECHNIQUES.map(item => [item.id, item]));
const CONTROL_BY_ID = new Map(DEFENSE_CONTROLS.map(item => [item.id, item]));
const AREA_LABELS: Record<HardeningArea, { it: string; en: string }> = {
  layer2: { it: 'Layer 2', en: 'Layer 2' }, routing: { it: 'Routing', en: 'Routing' }, services: { it: 'Servizi IP', en: 'IP services' }, management: { it: 'Gestione', en: 'Management' }, security: { it: 'Policy di sicurezza', en: 'Security policy' }, automation: { it: 'Automazione', en: 'Automation' }
};
const RISK_LABELS: Record<ChangeRisk, { it: string; en: string; style: string }> = {
  low: { it: 'Rischio modifica basso', en: 'Low change risk', style: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  medium: { it: 'Rischio modifica medio', en: 'Medium change risk', style: 'border-amber-200 bg-amber-50 text-amber-800' },
  high: { it: 'Rischio modifica alto', en: 'High change risk', style: 'border-rose-200 bg-rose-50 text-rose-800' }
};

export default function ConfigurationHardeningLab() {
  const language = useStore(state => state.language);
  const [area, setArea] = useState<'all' | HardeningArea>('all');
  const [risk, setRisk] = useState<'all' | ChangeRisk>('all');
  const filtered = useMemo(() => HARDENING_CONFIGS.filter(item => (area === 'all' || item.area === area) && (risk === 'all' || item.changeRisk === risk)), [area, risk]);
  const [selectedId, setSelectedId] = useState(HARDENING_CONFIGS[0].id);
  const selected = filtered.find(item => item.id === selectedId) ?? filtered[0];

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-indigo-50 p-3 text-indigo-700"><FileCode2 className="h-6 w-6" aria-hidden="true" /></div>
          <div>
            <p className="eyebrow">CONFIG · RISK · HARDEN · VERIFY · ROLLBACK</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">{language === 'it' ? 'Laboratorio di hardening delle configurazioni' : 'Configuration Hardening Lab'}</h1>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-600">{language === 'it' ? 'Confronta configurazioni Cisco IOS/IOS XE deboli e rinforzate. Ogni esempio collega il rischio tecnico alla difesa, mostra come verificarla e rende esplicito il possibile impatto della modifica.' : 'Compare weak and hardened Cisco IOS/IOS XE configurations. Each example links technical risk to the defense, shows how to verify it, and makes the possible change impact explicit.'}</p>
          </div>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-3" aria-label={language === 'it' ? 'Riepilogo hardening' : 'Hardening summary'}>
        {[{ value: HARDENING_CONFIGS.length, it: 'Configurazioni', en: 'Configurations' }, { value: AREAS.length, it: 'Aree operative', en: 'Operational areas' }, { value: HARDENING_CONFIGS.reduce((total, item) => total + item.verifyCommands.length, 0), it: 'Verifiche show', en: 'Show verifications' }].map(item => <div key={item.en} className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-2xl font-semibold text-slate-900">{item.value}</p><p className="text-xs text-slate-500">{item[language]}</p></div>)}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4" aria-labelledby="hardening-filter-title">
        <h2 id="hardening-filter-title" className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Filter className="h-4 w-4 text-indigo-600" aria-hidden="true" />{language === 'it' ? 'Filtra e seleziona' : 'Filter and select'}</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <label className="text-xs text-slate-600">{language === 'it' ? 'Area' : 'Area'}<select value={area} onChange={event => setArea(event.target.value as 'all' | HardeningArea)} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"><option value="all">{language === 'it' ? 'Tutte le aree' : 'All areas'}</option>{AREAS.map(item => <option key={item} value={item}>{AREA_LABELS[item][language]}</option>)}</select></label>
          <label className="text-xs text-slate-600">{language === 'it' ? 'Rischio della modifica' : 'Change risk'}<select value={risk} onChange={event => setRisk(event.target.value as 'all' | ChangeRisk)} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"><option value="all">{language === 'it' ? 'Tutti i livelli' : 'All levels'}</option>{RISKS.map(item => <option key={item} value={item}>{RISK_LABELS[item][language]}</option>)}</select></label>
          <label className="text-xs text-slate-600">{language === 'it' ? 'Configurazione' : 'Configuration'}<select value={selected?.id ?? ''} onChange={event => setSelectedId(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100">{filtered.map(item => <option key={item.id} value={item.id}>{item.title[language]}</option>)}</select></label>
        </div>
      </section>

      {selected ? (
        <article className="rounded-xl border border-slate-200 bg-white p-4 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div><p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">{AREA_LABELS[selected.area][language]}</p><h2 className="mt-1 text-xl font-semibold text-slate-900">{selected.title[language]}</h2></div>
            <div className="flex flex-wrap justify-end gap-1.5"><span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${RISK_LABELS[selected.changeRisk].style}`}>{RISK_LABELS[selected.changeRisk][language]}</span>{selected.domains.map(id => <span key={id} className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">{DOMAIN_BY_ID.get(id)?.title[language]}</span>)}</div>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            <ConfigPanel icon={ShieldAlert} title={language === 'it' ? 'Configurazione debole' : 'Weak configuration'} lines={selected.weakConfig} tone="weak" />
            <ConfigPanel icon={ShieldCheck} title={language === 'it' ? 'Configurazione rinforzata' : 'Hardened configuration'} lines={selected.hardenedConfig} tone="strong" />
          </div>
          <div className="mt-3 grid gap-3 xl:grid-cols-2">
            <Explanation icon={AlertTriangle} label={language === 'it' ? 'Perché è rischiosa' : 'Why it is risky'} text={selected.weakReason[language]} tone="weak" />
            <Explanation icon={CheckCircle2} label={language === 'it' ? 'Perché riduce il rischio' : 'Why it reduces risk'} text={selected.hardeningReason[language]} tone="strong" />
          </div>

          <section className="mt-5 rounded-xl border border-sky-100 bg-sky-50/50 p-4" aria-labelledby="verify-config-title">
            <h3 id="verify-config-title" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-900"><TerminalSquare className="h-4 w-4" aria-hidden="true" />{language === 'it' ? 'Verifica operativa' : 'Operational verification'}</h3>
            <div className="mt-3 grid gap-4 lg:grid-cols-2"><CodeBlock lines={selected.verifyCommands} label={language === 'it' ? 'Comandi show' : 'Show commands'} /><div><p className="text-[10px] font-semibold uppercase tracking-wider text-sky-800">{language === 'it' ? 'Evidenza attesa' : 'Expected evidence'}</p><p className="mt-2 text-xs leading-relaxed text-sky-950">{selected.expectedEvidence[language]}</p></div></div>
          </section>

          <section className="mt-4 grid gap-3 lg:grid-cols-2" aria-label={language === 'it' ? 'Sicurezza del cambiamento' : 'Change safety'}>
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-orange-950"><h3 className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider"><AlertTriangle className="h-4 w-4" aria-hidden="true" />{language === 'it' ? 'Avvertenza prima del change' : 'Pre-change warning'}</h3><p className="mt-2 text-xs leading-relaxed">{selected.changeWarning[language]}</p></div>
            <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-4 text-violet-950"><h3 className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider"><RotateCcw className="h-4 w-4" aria-hidden="true" />Rollback</h3><div className="mt-2"><CodeBlock lines={selected.rollback} label="Rollback" compact /></div></div>
          </section>

          <div className="mt-4 border-t border-slate-100 pt-4 text-[10px] leading-relaxed text-slate-500"><p><strong>{language === 'it' ? 'Tecniche contrastate:' : 'Countered techniques:'}</strong> {selected.techniqueIds.map(id => TECHNIQUE_BY_ID.get(id)?.name[language]).join(' · ')}</p><p className="mt-1"><strong>{language === 'it' ? 'Controlli applicati:' : 'Applied controls:'}</strong> {selected.controlIds.map(id => CONTROL_BY_ID.get(id)?.name[language]).join(' · ')}</p></div>
        </article>
      ) : <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500" role="status">{language === 'it' ? 'Nessuna configurazione corrisponde ai filtri.' : 'No configuration matches the filters.'}</div>}
    </div>
  );
}

function ConfigPanel({ icon: Icon, title, lines, tone }: { icon: typeof ShieldAlert; title: string; lines: string[]; tone: 'weak' | 'strong' }) {
  const style = tone === 'weak' ? 'border-rose-200 bg-rose-50/40 text-rose-950' : 'border-emerald-200 bg-emerald-50/40 text-emerald-950';
  return <section className={`rounded-xl border p-4 ${style}`}><h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"><Icon className="h-4 w-4" aria-hidden="true" />{title}</h3><div className="mt-3"><CodeBlock lines={lines} label={title} /></div></section>;
}

function Explanation({ icon: Icon, label, text, tone }: { icon: typeof AlertTriangle; label: string; text: string; tone: 'weak' | 'strong' }) {
  const style = tone === 'weak' ? 'border-rose-100 bg-rose-50/60 text-rose-950' : 'border-emerald-100 bg-emerald-50/60 text-emerald-950';
  return <div className={`rounded-lg border p-3 ${style}`}><p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider"><Icon className="h-3.5 w-3.5" aria-hidden="true" />{label}</p><p className="mt-2 text-xs leading-relaxed">{text}</p></div>;
}

function CodeBlock({ lines, label, compact = false }: { lines: string[]; label: string; compact?: boolean }) {
  return <pre aria-label={label} className={`overflow-x-auto rounded-lg bg-slate-950 text-slate-100 ${compact ? 'p-2.5 text-[10px]' : 'p-3 text-xs'} leading-relaxed`}><code>{lines.join('\n')}</code></pre>;
}

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Activity, ArrowDown, CheckCircle2, Crosshair, GitBranch, ShieldCheck, Target } from 'lucide-react';
import { ATTACK_PATHS } from '../content/attackPaths';
import { ATTACK_FAMILIES } from '../content/securityTaxonomy';
import { SECURITY_TECHNIQUES } from '../content/securityCoverage';
import { DEFENSE_CONTROLS } from '../content/defenseControls';
import { CCNA_DOMAINS } from '../content/ccna';
import { useStore } from '../store';

const FAMILY_BY_ID = new Map(ATTACK_FAMILIES.map(item => [item.id, item]));
const TECHNIQUE_BY_ID = new Map(SECURITY_TECHNIQUES.map(item => [item.id, item]));
const CONTROL_BY_ID = new Map(DEFENSE_CONTROLS.map(item => [item.id, item]));
const DOMAIN_BY_ID = new Map(CCNA_DOMAINS.map(item => [item.id, item]));

export default function AttackPathsLab() {
  const language = useStore(state => state.language);
  const [familyId, setFamilyId] = useState('all');
  const filteredPaths = useMemo(
    () => familyId === 'all' ? ATTACK_PATHS : ATTACK_PATHS.filter(path => path.familyIds.includes(familyId)),
    [familyId]
  );
  const [selectedId, setSelectedId] = useState(ATTACK_PATHS[0].id);
  const selected = filteredPaths.find(path => path.id === selectedId) ?? filteredPaths[0];

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-rose-50 p-3 text-rose-700"><GitBranch className="h-6 w-6" aria-hidden="true" /></div>
          <div>
            <p className="eyebrow">PATH · SIGNAL · CONTROL · VALIDATION</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">{language === 'it' ? 'Laboratorio dei percorsi d’attacco' : 'Attack Paths Lab'}</h1>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-600">
              {language === 'it'
                ? 'Segui come tecniche diverse si concatenano tra livelli, piani di sicurezza e domini CCNA. Ogni fase mostra ciò che è osservabile, il controllo che interrompe il percorso e la verifica necessaria per dimostrarne l’efficacia.'
                : 'Follow how different techniques chain across layers, security planes, and CCNA domains. Each stage shows what is observable, the control that breaks the path, and the validation required to prove effectiveness.'}
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-3" aria-label={language === 'it' ? 'Riepilogo percorsi' : 'Path summary'}>
        {[
          { value: ATTACK_PATHS.length, it: 'Percorsi', en: 'Paths' },
          { value: ATTACK_PATHS.reduce((total, path) => total + path.stages.length, 0), it: 'Fasi operative', en: 'Operational stages' },
          { value: ATTACK_FAMILIES.length, it: 'Famiglie collegate', en: 'Linked families' }
        ].map(item => <div key={item.en} className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-2xl font-semibold text-slate-900">{item.value}</p><p className="text-xs text-slate-500">{item[language]}</p></div>)}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4" aria-labelledby="path-selection-title">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <label className="min-w-56 text-xs text-slate-600">
            <span className="font-semibold" id="path-selection-title">{language === 'it' ? 'Filtra per famiglia' : 'Filter by family'}</span>
            <select value={familyId} onChange={event => setFamilyId(event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="all">{language === 'it' ? 'Tutte le famiglie' : 'All families'}</option>
              {ATTACK_FAMILIES.map(family => <option key={family.id} value={family.id}>{family.name[language]}</option>)}
            </select>
          </label>
          <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1" aria-label={language === 'it' ? 'Selezione percorso' : 'Path selection'}>
            {filteredPaths.map(path => {
              const active = path.id === selected?.id;
              return <button type="button" key={path.id} onClick={() => setSelectedId(path.id)} aria-pressed={active} className={`shrink-0 rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${active ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>{path.title[language]}</button>;
            })}
          </div>
        </div>
      </section>

      {selected ? (
        <article className="rounded-xl border border-slate-200 bg-white p-4 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="max-w-4xl">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-600">{language === 'it' ? 'Contesto iniziale' : 'Initial context'}</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">{selected.title[language]}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{selected.context[language]}</p>
              <p className="mt-3 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs leading-relaxed text-orange-950"><strong>{language === 'it' ? 'Impatto potenziale:' : 'Potential impact:'}</strong> {selected.impact[language]}</p>
            </div>
            <div className="flex max-w-sm flex-wrap justify-end gap-1.5">
              {selected.familyIds.map(id => <span key={id} className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-semibold text-rose-800">{FAMILY_BY_ID.get(id)?.name[language]}</span>)}
              {selected.domains.map(id => <span key={id} className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-800">{DOMAIN_BY_ID.get(id)?.title[language]}</span>)}
            </div>
          </div>

          <ol className="mx-auto mt-6 max-w-5xl" aria-label={language === 'it' ? 'Fasi del percorso d’attacco' : 'Attack path stages'}>
            {selected.stages.map((stage, index) => (
              <li key={stage.id} className="[content-visibility:auto] [contain-intrinsic-size:auto_360px]">
                {index > 0 ? <div className="flex h-10 items-center justify-center text-slate-300"><ArrowDown className="h-5 w-5" aria-hidden="true" /></div> : null}
                <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 md:p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white" aria-hidden="true">{index + 1}</span>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{language === 'it' ? `Fase ${index + 1}` : `Stage ${index + 1}`}</p>
                      <h3 className="mt-0.5 text-base font-semibold text-slate-900">{stage.title[language]}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">{stage.objective[language]}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 lg:grid-cols-3">
                    <StageBlock icon={Crosshair} label={language === 'it' ? 'Tecniche utilizzate' : 'Techniques used'} tone="rose">
                      <ul className="space-y-1.5">{stage.techniqueIds.map(id => <li key={id}>{TECHNIQUE_BY_ID.get(id)?.name[language]}</li>)}</ul>
                    </StageBlock>
                    <StageBlock icon={Activity} label={language === 'it' ? 'Segnali osservabili' : 'Observable signals'} tone="amber"><p>{stage.observable[language]}</p></StageBlock>
                    <StageBlock icon={ShieldCheck} label={language === 'it' ? 'Controlli che interrompono' : 'Controls that break the path'} tone="emerald">
                      <ul className="space-y-1.5">{stage.defenseControlIds.map(id => <li key={id}>{CONTROL_BY_ID.get(id)?.name[language]}</li>)}</ul>
                    </StageBlock>
                  </div>
                  <div className="mt-3 flex items-start gap-2 rounded-lg border border-sky-100 bg-sky-50/70 p-3 text-sky-950">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <div><p className="text-[10px] font-semibold uppercase tracking-wider">{language === 'it' ? 'Validazione della difesa' : 'Defense validation'}</p><p className="mt-1 text-xs leading-relaxed">{stage.validation[language]}</p></div>
                  </div>
                </section>
              </li>
            ))}
          </ol>
          <div className="mx-auto mt-5 flex max-w-5xl items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
            <Target className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <p className="text-xs leading-relaxed">{language === 'it' ? 'Un percorso è realmente interrotto solo quando la verifica mostra che il controllo agisce nel punto previsto e che il traffico o l’identità legittimi continuano a funzionare.' : 'A path is truly broken only when validation shows that the control acts at the intended point and legitimate traffic or identities continue to work.'}</p>
          </div>
        </article>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500" role="status">{language === 'it' ? 'Nessun percorso corrisponde al filtro.' : 'No path matches the filter.'}</div>
      )}
    </div>
  );
}

const TONES = { rose: 'border-rose-100 bg-rose-50/60 text-rose-950', amber: 'border-amber-100 bg-amber-50/60 text-amber-950', emerald: 'border-emerald-100 bg-emerald-50/60 text-emerald-950' } as const;
function StageBlock({ icon: Icon, label, tone, children }: { icon: typeof Activity; label: string; tone: keyof typeof TONES; children: ReactNode }) {
  return <div className={`rounded-lg border p-3 ${TONES[tone]}`}><h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider"><Icon className="h-3.5 w-3.5" aria-hidden="true" />{label}</h4><div className="mt-2 text-xs leading-relaxed">{children}</div></div>;
}

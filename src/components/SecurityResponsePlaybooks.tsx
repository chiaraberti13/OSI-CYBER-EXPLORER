import { memo, useMemo, useState } from 'react';
import { Archive, CheckCircle2, CircleAlert, RotateCcw, Search, Shield, Siren } from 'lucide-react';
import { CCNA_DOMAINS } from '../content/ccna';
import { SECURITY_PLAYBOOKS, type SecurityPlaybook } from '../content/securityPlaybooks';
import { SECURITY_TECHNIQUES, type CcnaDomainId } from '../content/securityCoverage';
import type { Language } from '../types';

const DOMAIN_BY_ID = new Map(CCNA_DOMAINS.map(domain => [domain.id, domain]));
const TECHNIQUE_BY_ID = new Map(SECURITY_TECHNIQUES.map(technique => [technique.id, technique]));

const PHASES = [
  { field: 'stabilize', icon: Siren, it: 'Stabilizza', en: 'Stabilize', style: 'border-rose-100 bg-rose-50/60 text-rose-950' },
  { field: 'evidence', icon: Archive, it: 'Raccogli evidenze', en: 'Collect evidence', style: 'border-violet-100 bg-violet-50/60 text-violet-950' },
  { field: 'contain', icon: Shield, it: 'Contieni', en: 'Contain', style: 'border-amber-100 bg-amber-50/60 text-amber-950' },
  { field: 'recover', icon: RotateCcw, it: 'Ripristina', en: 'Recover', style: 'border-sky-100 bg-sky-50/60 text-sky-950' },
  { field: 'validate', icon: CheckCircle2, it: 'Verifica', en: 'Validate', style: 'border-emerald-100 bg-emerald-50/60 text-emerald-950' }
] as const satisfies ReadonlyArray<{
  field: keyof Pick<SecurityPlaybook, 'stabilize' | 'evidence' | 'contain' | 'recover' | 'validate'>;
  icon: typeof Siren;
  it: string;
  en: string;
  style: string;
}>;

interface SecurityResponsePlaybooksProps {
  language: Language;
  onOpenDomain: (domain: CcnaDomainId) => void;
  onTechniqueSelect: (techniqueId: string) => void;
}

function SecurityResponsePlaybooks({ language, onOpenDomain, onTechniqueSelect }: SecurityResponsePlaybooksProps) {
  const [selectedId, setSelectedId] = useState(SECURITY_PLAYBOOKS[0].id);
  const selected = useMemo(
    () => SECURITY_PLAYBOOKS.find(playbook => playbook.id === selectedId) ?? SECURITY_PLAYBOOKS[0],
    [selectedId]
  );

  return (
    <section aria-labelledby="response-playbooks-title" className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-rose-50 p-2 text-rose-700">
          <Siren className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 id="response-playbooks-title" className="text-base font-semibold text-slate-900">
            {language === 'it' ? 'Playbook di risposta operativa' : 'Operational response playbooks'}
          </h2>
          <p className="mt-1 max-w-4xl text-xs leading-relaxed text-slate-600">
            {language === 'it'
              ? 'Procedure didattiche evidence-first: stabilizzare senza distruggere il contesto, contenere il minimo necessario e dichiarare il ripristino solo dopo una verifica indipendente.'
              : 'Evidence-first learning procedures: stabilize without destroying context, contain only what is necessary, and declare recovery only after independent verification.'}
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2" aria-label={language === 'it' ? 'Selezione playbook' : 'Playbook selection'}>
        {SECURITY_PLAYBOOKS.map(playbook => {
          const active = selected.id === playbook.id;
          return (
            <button
              type="button"
              key={playbook.id}
              onClick={() => setSelectedId(playbook.id)}
              aria-pressed={active}
              className={`shrink-0 rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${active ? 'border-indigo-200 bg-indigo-50 text-indigo-800' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              {playbook.title[language]}
            </button>
          );
        })}
      </div>

      <article className="mt-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-600">{language === 'it' ? 'Segnali iniziali' : 'Initial signals'}</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">{selected.title[language]}</h3>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-600">{selected.signal[language]}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selected.domains.map(domainId => {
              const domain = DOMAIN_BY_ID.get(domainId);
              return (
                <button
                  type="button"
                  key={domainId}
                  onClick={() => onOpenDomain(domainId)}
                  className="rounded-full border border-indigo-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-indigo-700 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  {domain?.number}. {domain?.title[language]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-5">
          {PHASES.map(phase => {
            const Icon = phase.icon;
            return (
              <section key={phase.field} className={`rounded-lg border p-3 ${phase.style}`}>
                <h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider">
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {phase[language]}
                </h4>
                <ul className="mt-2 space-y-2 text-xs leading-relaxed">
                  {selected[phase.field].map(item => <li key={item.en}>• {item[language]}</li>)}
                </ul>
              </section>
            );
          })}
        </div>

        <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50 p-3 text-orange-950">
          <h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider">
            <CircleAlert className="h-3.5 w-3.5" aria-hidden="true" />
            {language === 'it' ? 'Errori operativi da evitare' : 'Operational mistakes to avoid'}
          </h4>
          <ul className="mt-2 grid gap-2 text-xs leading-relaxed md:grid-cols-2">
            {selected.pitfalls.map(item => <li key={item.en}>• {item[language]}</li>)}
          </ul>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            {language === 'it' ? 'Tecniche correlate' : 'Related techniques'}
          </span>
          {selected.techniqueIds.map(techniqueId => {
            const technique = TECHNIQUE_BY_ID.get(techniqueId);
            return (
              <button
                type="button"
                key={techniqueId}
                onClick={() => onTechniqueSelect(techniqueId)}
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-600 hover:border-indigo-200 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                {technique?.name[language]}
              </button>
            );
          })}
        </div>
      </article>
    </section>
  );
}

export default memo(SecurityResponsePlaybooks);

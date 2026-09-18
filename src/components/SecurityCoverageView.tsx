import { useCallback, useMemo, useState } from 'react';
import { Activity, Crosshair, Filter, Search, ShieldCheck, Wrench } from 'lucide-react';
import { CCNA_DOMAINS } from '../content/ccna';
import { SECURITY_TECHNIQUES, type CcnaDomainId } from '../content/securityCoverage';
import { ATTACK_FAMILIES, type SecurityPlane } from '../content/securityTaxonomy';
import { useStore } from '../store';
import SecurityCoverageMatrix, { DOMAIN_LAB_VIEWS } from './SecurityCoverageMatrix';
import SecurityResponsePlaybooks from './SecurityResponsePlaybooks';

const PLANES: SecurityPlane[] = ['physical', 'data', 'control', 'management', 'application', 'identity'];
const DOMAIN_BY_ID = new Map(CCNA_DOMAINS.map(domain => [domain.id, domain]));
const ATTACK_FAMILY_BY_ID = new Map(ATTACK_FAMILIES.map(family => [family.id, family]));

const PLANE_LABELS: Record<SecurityPlane, { it: string; en: string }> = {
  physical: { it: 'Fisico', en: 'Physical' },
  data: { it: 'Dati', en: 'Data' },
  control: { it: 'Controllo', en: 'Control' },
  management: { it: 'Gestione', en: 'Management' },
  application: { it: 'Applicazione', en: 'Application' },
  identity: { it: 'Identità', en: 'Identity' }
};

const FIELD_STYLES = {
  attack: 'border-rose-100 bg-rose-50/70 text-rose-900',
  prevent: 'border-emerald-100 bg-emerald-50/70 text-emerald-900',
  detect: 'border-amber-100 bg-amber-50/70 text-amber-900',
  respond: 'border-sky-100 bg-sky-50/70 text-sky-900'
} as const;

export default function SecurityCoverageView() {
  const language = useStore(state => state.language);
  const setActiveView = useStore(state => state.setActiveView);
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState<'all' | CcnaDomainId>('all');
  const [family, setFamily] = useState('all');
  const [plane, setPlane] = useState<'all' | SecurityPlane>('all');

  const filteredTechniques = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(language);

    return SECURITY_TECHNIQUES.filter((technique) => {
      if (domain !== 'all' && !technique.domains.includes(domain)) return false;
      if (family !== 'all' && technique.familyId !== family) return false;
      if (plane !== 'all' && !technique.planes.includes(plane)) return false;
      if (!normalizedQuery) return true;

      return [technique.name, technique.attack, technique.prevent, technique.detect, technique.respondRecover, technique.verify]
        .some(field => field[language].toLocaleLowerCase(language).includes(normalizedQuery));
    });
  }, [domain, family, language, plane, query]);

  const clearFilters = () => {
    setQuery('');
    setDomain('all');
    setFamily('all');
    setPlane('all');
  };

  const selectCoverage = useCallback((selectedDomain: CcnaDomainId, selectedFamily: string) => {
    setDomain(selectedDomain);
    setFamily(selectedFamily);
    document.getElementById('coverage-filters')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const openDomainLab = useCallback((selectedDomain: CcnaDomainId) => {
    setActiveView(DOMAIN_LAB_VIEWS[selectedDomain]);
  }, [setActiveView]);

  const selectTechnique = useCallback((techniqueId: string) => {
    const technique = SECURITY_TECHNIQUES.find(item => item.id === techniqueId);
    if (!technique) return;
    setDomain('all');
    setFamily('all');
    setPlane('all');
    setQuery(technique.name[language]);
    document.getElementById('coverage-filters')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [language]);

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <p className="eyebrow">ATTACK · DEFEND · VERIFY</p>
            <h1 className="text-2xl font-semibold text-slate-900">
              {language === 'it' ? 'Catalogo integrato Attacco–Difesa' : 'Integrated Attack–Defense Catalog'}
            </h1>
            <p className="max-w-4xl text-sm leading-relaxed text-slate-600">
              {language === 'it'
                ? 'Una tassonomia didattica estensibile, collegata ai sei domini CCNA. Ogni tecnica separa ciò che fa l’attacco da prevenzione, rilevamento, risposta e verifica operativa: una difesa non è considerata efficace finché non viene verificata.'
                : 'An extensible learning taxonomy linked to all six CCNA domains. Each technique separates attack behavior from prevention, detection, response, and operational verification: a defense is not considered effective until it is verified.'}
            </p>
            <p className="max-w-4xl text-xs leading-relaxed text-slate-500">
              {language === 'it'
                ? 'Il catalogo copre le principali famiglie rilevanti per reti e CCNA; non pretende di enumerare ogni tecnica esistente o sostituire procedure autorizzate di laboratorio.'
                : 'The catalog covers the main families relevant to networking and CCNA; it does not claim to enumerate every existing technique or replace authorized lab procedures.'}
            </p>
          </div>
        </div>
      </header>

      <section aria-label={language === 'it' ? 'Riepilogo copertura' : 'Coverage summary'} className="grid gap-3 sm:grid-cols-3">
        {[
          { value: SECURITY_TECHNIQUES.length, it: 'Tecniche documentate', en: 'Documented techniques' },
          { value: ATTACK_FAMILIES.length, it: 'Famiglie di attacco', en: 'Attack families' },
          { value: CCNA_DOMAINS.length, it: 'Domini CCNA coperti', en: 'CCNA domains covered' }
        ].map(item => (
          <div key={item.en} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-2xl font-semibold text-slate-900">{item.value}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">{language === 'it' ? item.it : item.en}</p>
          </div>
        ))}
      </section>

      <SecurityCoverageMatrix
        language={language}
        onOpenLab={openDomainLab}
        onSelect={selectCoverage}
      />

      <SecurityResponsePlaybooks
        language={language}
        onOpenDomain={openDomainLab}
        onTechniqueSelect={selectTechnique}
      />

      <section aria-labelledby="coverage-filters" className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id="coverage-filters" className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Filter className="h-4 w-4 text-indigo-600" aria-hidden="true" />
            {language === 'it' ? 'Filtra il catalogo' : 'Filter the catalog'}
          </h2>
          <button type="button" onClick={clearFilters} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
            {language === 'it' ? 'Azzera filtri' : 'Clear filters'}
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="relative">
            <span className="sr-only">{language === 'it' ? 'Cerca nel catalogo' : 'Search the catalog'}</span>
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden="true" />
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder={language === 'it' ? 'Cerca tecnica o difesa…' : 'Search technique or defense…'} className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          </label>
          <label>
            <span className="sr-only">{language === 'it' ? 'Dominio CCNA' : 'CCNA domain'}</span>
            <select value={domain} onChange={event => setDomain(event.target.value as 'all' | CcnaDomainId)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="all">{language === 'it' ? 'Tutti i domini CCNA' : 'All CCNA domains'}</option>
              {CCNA_DOMAINS.map(item => <option key={item.id} value={item.id}>{item.number}. {item.title[language]}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">{language === 'it' ? 'Famiglia di attacco' : 'Attack family'}</span>
            <select value={family} onChange={event => setFamily(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="all">{language === 'it' ? 'Tutte le famiglie' : 'All families'}</option>
              {ATTACK_FAMILIES.map(item => <option key={item.id} value={item.id}>{item.name[language]}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">{language === 'it' ? 'Piano di sicurezza' : 'Security plane'}</span>
            <select value={plane} onChange={event => setPlane(event.target.value as 'all' | SecurityPlane)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="all">{language === 'it' ? 'Tutti i piani' : 'All planes'}</option>
              {PLANES.map(item => <option key={item} value={item}>{PLANE_LABELS[item][language]}</option>)}
            </select>
          </label>
        </div>
      </section>

      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900">{language === 'it' ? 'Tecniche e contromisure' : 'Techniques and countermeasures'}</h2>
        <p className="text-xs font-semibold text-slate-500" aria-live="polite">
          {filteredTechniques.length} {language === 'it' ? 'risultati' : 'results'}
        </p>
      </div>

      {filteredTechniques.length > 0 ? (
        <section aria-label={language === 'it' ? 'Tecniche di sicurezza' : 'Security techniques'} className="grid gap-4 xl:grid-cols-2">
          {filteredTechniques.map(technique => {
            const familyItem = ATTACK_FAMILY_BY_ID.get(technique.familyId);
            return (
              <article key={technique.id} className="rounded-xl border border-slate-200 bg-white p-5 deferred-card [contain-intrinsic-height:auto_520px]">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">{familyItem?.name[language]}</p>
                    <h3 className="mt-1 text-base font-semibold text-slate-900">{technique.name[language]}</h3>
                  </div>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {technique.planes.map(item => <span key={item} className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">{PLANE_LABELS[item][language]}</span>)}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <InfoBlock icon={Crosshair} label={language === 'it' ? 'Attacco: meccanismo' : 'Attack: mechanism'} text={technique.attack[language]} style={FIELD_STYLES.attack} />
                  <InfoBlock icon={ShieldCheck} label={language === 'it' ? 'Prevenzione' : 'Prevention'} text={technique.prevent[language]} style={FIELD_STYLES.prevent} />
                  <InfoBlock icon={Activity} label={language === 'it' ? 'Rilevamento' : 'Detection'} text={technique.detect[language]} style={FIELD_STYLES.detect} />
                  <InfoBlock icon={Wrench} label={language === 'it' ? 'Risposta e ripristino' : 'Response and recovery'} text={technique.respondRecover[language]} style={FIELD_STYLES.respond} />
                </div>

                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{language === 'it' ? 'Verifica operativa' : 'Operational verification'}</p>
                  <p className="mt-1 font-mono text-xs leading-relaxed text-slate-700">{technique.verify[language]}</p>
                </div>
                <p className="mt-3 text-[10px] text-slate-400">
                  {language === 'it' ? 'Domini' : 'Domains'}: {technique.domains.map(id => DOMAIN_BY_ID.get(id)?.title[language]).join(' · ')}
                </p>
              </article>
            );
          })}
        </section>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500" role="status">
          {language === 'it' ? 'Nessuna tecnica corrisponde ai filtri selezionati.' : 'No techniques match the selected filters.'}
        </div>
      )}
    </div>
  );
}

function InfoBlock({ icon: Icon, label, text, style }: { icon: typeof Activity; label: string; text: string; style: string }) {
  return (
    <div className={`rounded-lg border p-3 ${style}`}>
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </p>
      <p className="mt-2 text-xs leading-relaxed">{text}</p>
    </div>
  );
}

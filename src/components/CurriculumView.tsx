import { BookOpen, Network, ShieldCheck } from 'lucide-react';
import { CCNA_DOMAINS } from '../content/ccna';
import { ATTACK_FAMILIES } from '../content/securityTaxonomy';
import { useStore } from '../store';

export default function CurriculumView() {
  const { language, setActiveView } = useStore();

  return (
    <div className="space-y-8">
      <header className="bg-white border border-slate-200 rounded-xl p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
            <BookOpen className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <p className="eyebrow">CCNA 200-301 v1.1</p>
            <h1 className="text-2xl font-semibold text-slate-900">
              {language === 'it' ? 'Mappa didattica integrata' : 'Integrated learning map'}
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
              {language === 'it'
                ? 'Ogni dominio collega funzionamento della rete, configurazione, verifica, attacchi osservabili e difese. La piattaforma è un laboratorio esplorativo: non assegna voti e non simula l’esame.'
                : 'Each domain connects network operation, configuration, verification, observable attacks, and defenses. The platform is an exploratory lab: it does not assign scores or simulate the exam.'}
            </p>
          </div>
        </div>
      </header>

      <section aria-labelledby="ccna-domains-title" className="space-y-4">
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-indigo-600" />
          <h2 id="ccna-domains-title" className="text-lg font-semibold text-slate-900">
            {language === 'it' ? 'Domini CCNA e sicurezza correlata' : 'CCNA domains and related security'}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {CCNA_DOMAINS.map((domain) => (
            <article key={domain.id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
                    {language === 'it' ? `Dominio ${domain.number}` : `Domain ${domain.number}`}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-slate-900">{domain.title[language]}</h3>
                </div>
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                  {domain.weight}%
                </span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-600">{domain.purpose[language]}</p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {language === 'it' ? 'Contenuti' : 'Topics'}
                  </h4>
                  <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-600">
                    {domain.topics.map((topic) => <li key={topic.en}>• {topic[language]}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {language === 'it' ? 'Attacchi e difese' : 'Attacks and defenses'}
                  </h4>
                  <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-600">
                    {domain.securityLinks.map((item) => <li key={item.en}>• {item[language]}</li>)}
                  </ul>
                </div>
              </div>

              <p className="mt-4 font-mono text-[10px] text-slate-400">
                {language === 'it' ? 'Obiettivi' : 'Objectives'}: {domain.objectiveIds.join(' · ')}
              </p>
              {domain.id === 'network-fundamentals' ? (
                <button
                  type="button"
                  onClick={() => setActiveView('fundamentals')}
                  className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  {language === 'it' ? 'Apri il laboratorio IPv4' : 'Open the IPv4 lab'}
                </button>
              ) : null}
              {domain.id === 'network-access' ? (
                <button
                  type="button"
                  onClick={() => setActiveView('access')}
                  className="mt-4 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 transition-colors hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                >
                  {language === 'it' ? 'Apri il laboratorio Network Access' : 'Open the Network Access lab'}
                </button>
              ) : null}
              {domain.id === 'ip-connectivity' ? (
                <button
                  type="button"
                  onClick={() => setActiveView('routing')}
                  className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  {language === 'it' ? 'Apri il laboratorio IP Connectivity' : 'Open the IP Connectivity lab'}
                </button>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="attack-taxonomy-title" className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <h2 id="attack-taxonomy-title" className="text-lg font-semibold text-slate-900">
            {language === 'it' ? 'Tassonomia Attacco & Difesa' : 'Attack & Defense taxonomy'}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {ATTACK_FAMILIES.map((family) => (
            <article key={family.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-slate-900">{family.name[language]}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{family.description[language]}</p>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-wide text-slate-400">
                {family.planes.join(' · ')}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

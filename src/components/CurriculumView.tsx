import { BookOpen, ListChecks, Network, ShieldCheck } from 'lucide-react';
import { CCNA_DOMAINS } from '../content/ccna';
import { DOMAIN_CHECKLISTS } from '../content/domainChecklists';
import { ATTACK_FAMILIES } from '../content/securityTaxonomy';
import { useStore } from '../store';

const CHECKLIST_BY_DOMAIN = new Map<string, (typeof DOMAIN_CHECKLISTS)[number]>(DOMAIN_CHECKLISTS.map(list => [list.domainId, list]));

export default function CurriculumView() {
  const { language, setActiveView } = useStore();
  const checklistLabels = language === 'it'
    ? { title: 'Concetti da saper spiegare', observe: 'Dove osservarlo', pitfall: 'Errore rivelatore', note: 'Non è un quiz e non produce un punteggio: è un elenco di concetti da usare per decidere cosa rivedere. Ogni voce dice dove nella piattaforma puoi vedere il concetto in funzione e quale errore rivela che non è ancora solido.' }
    : { title: 'Concepts you should be able to explain', observe: 'Where to observe it', pitfall: 'Revealing mistake', note: 'This is not a quiz and produces no score: it is a list of concepts to help you decide what to revisit. Each entry names where in the platform you can watch the concept at work and which mistake reveals it is not yet solid.' };

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
            <p className="max-w-3xl rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
              {language === 'it'
                ? 'Materiale di studio originale e non ufficiale, non affiliato né approvato da Cisco Systems. I contenuti sono note di studio personali: non contengono domande d’esame reali né materiale coperto da copyright Cisco. Obiettivi, pesi, costi, date e policy d’esame vanno sempre verificati sulle fonti ufficiali (Cisco Learning Network e learningnetwork.cisco.com), che prevalgono su questa mappa.'
                : 'Original, unofficial study material, neither affiliated with nor endorsed by Cisco Systems. The content is a set of personal study notes: it contains no real exam questions and no Cisco-copyrighted material. Objectives, weights, pricing, dates, and exam policy must always be verified against the official sources (Cisco Learning Network, learningnetwork.cisco.com), which take precedence over this map.'}
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

              {CHECKLIST_BY_DOMAIN.has(domain.id) ? (
                <details className="mt-4 rounded-lg border border-slate-200 bg-slate-50/60">
                  <summary className="flex cursor-pointer items-center gap-2 p-3 text-xs font-semibold text-slate-700">
                    <ListChecks className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden="true" />
                    {checklistLabels.title}
                    <span className="ml-auto font-normal text-slate-400">{CHECKLIST_BY_DOMAIN.get(domain.id)!.items.length}</span>
                  </summary>
                  <div className="border-t border-slate-200 p-3">
                    <p className="text-[11px] leading-relaxed text-slate-500">{checklistLabels.note}</p>
                    <ul className="mt-3 space-y-3">
                      {CHECKLIST_BY_DOMAIN.get(domain.id)!.items.map(entry => (
                        <li key={entry.id} className="rounded-lg border border-slate-200 bg-white p-3">
                          <p className="text-xs font-medium leading-relaxed text-slate-800">{entry.concept[language]}</p>
                          <p className="mt-2 text-[11px] leading-relaxed text-sky-900"><strong>{checklistLabels.observe}:</strong> {entry.observeIn[language]}</p>
                          <p className="mt-1 text-[11px] leading-relaxed text-amber-900"><strong>{checklistLabels.pitfall}:</strong> {entry.pitfall[language]}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              ) : null}
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
              {domain.id === 'ip-services' ? (
                <button
                  type="button"
                  onClick={() => setActiveView('services')}
                  className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  {language === 'it' ? 'Apri il laboratorio IP Services' : 'Open the IP Services lab'}
                </button>
              ) : null}
              {domain.id === 'security-fundamentals' ? (
                <button
                  type="button"
                  onClick={() => setActiveView('securitycore')}
                  className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800 transition-colors hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                >
                  {language === 'it' ? 'Apri il laboratorio Security Fundamentals' : 'Open the Security Fundamentals lab'}
                </button>
              ) : null}
              {domain.id === 'automation-programmability' ? (
                <button
                  type="button"
                  onClick={() => setActiveView('automation')}
                  className="mt-4 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-800 transition-colors hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  {language === 'it' ? 'Apri il laboratorio Automation' : 'Open the Automation lab'}
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
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
          <p className="text-sm leading-relaxed text-emerald-950">
            {language === 'it'
              ? 'Consulta le tecniche per dominio, famiglia e piano, con prevenzione, rilevamento, risposta e verifica operativa.'
              : 'Browse techniques by domain, family, and plane, with prevention, detection, response, and operational verification.'}
          </p>
          <button
            type="button"
            onClick={() => setActiveView('coverage')}
            className="mt-3 shrink-0 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 sm:mt-0"
          >
            {language === 'it' ? 'Apri il catalogo completo' : 'Open the full catalog'}
          </button>
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

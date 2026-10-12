import { BookOpen, ListChecks, Network, ShieldCheck } from 'lucide-react';
import { CCNA_DOMAINS } from '../content/ccna';
import { CCNA_BLUEPRINT, CCNA_BLUEPRINT_DOMAINS, CCNA_BLUEPRINT_TOPICS } from '../content/ccnaBlueprint';
import { DOMAIN_CHECKLISTS } from '../content/domainChecklists';
import { ATTACK_FAMILIES } from '../content/securityTaxonomy';
import { VIEW_REGISTRY } from '../content/viewRegistry';
import { chapterCompletion, chaptersByDomain } from '../lib/studyManual';
import { useStore } from '../store';
import CcnaHubTabs from './CcnaHubTabs';
import ViewLink from './ViewLink';

const CHECKLIST_BY_DOMAIN = new Map<string, (typeof DOMAIN_CHECKLISTS)[number]>(
  DOMAIN_CHECKLISTS.map((list) => [list.domainId, list])
);

/** Manual chapters that teach each CCNA domain — the single source the index points into. */
const MANUAL_CHAPTERS_BY_DOMAIN = new Map(
  chaptersByDomain()
    .filter((group) => group.domain)
    .map((group) => [group.domain!.id, group.chapters])
);

export default function CurriculumView() {
  const language = useStore((state) => state.language);
  const completedChapterIds = useStore((state) => state.completedChapterIds);
  const manualProgressByDomain = new Map(
    CCNA_DOMAINS.map((domain) => {
      const chapters = MANUAL_CHAPTERS_BY_DOMAIN.get(domain.id) ?? [];
      return [domain.id, { chapters, ...chapterCompletion(chapters, completedChapterIds) }] as const;
    })
  );
  const checklistLabels =
    language === 'it'
      ? {
          title: 'Concetti da saper spiegare',
          observe: 'Dove osservarlo',
          pitfall: 'Errore rivelatore',
          note: 'Non è un quiz e non produce un punteggio: è un elenco di concetti da usare per decidere cosa rivedere. Ogni voce dice dove nella piattaforma puoi vedere il concetto in funzione e quale errore rivela che non è ancora solido.'
        }
      : {
          title: 'Concepts you should be able to explain',
          observe: 'Where to observe it',
          pitfall: 'Revealing mistake',
          note: 'This is not a quiz and produces no score: it is a list of concepts to help you decide what to revisit. Each entry names where in the platform you can watch the concept at work and which mistake reveals it is not yet solid.'
        };

  return (
    <div className="space-y-8">
      <CcnaHubTabs />
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

      <section
        aria-labelledby="start-path-title"
        className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-5 md:p-6"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl space-y-2">
            <p className="eyebrow text-indigo-700">{language === 'it' ? 'Percorso consigliato' : 'Recommended path'}</p>
            <h2 id="start-path-title" className="text-lg font-semibold text-slate-900">
              {language === 'it' ? 'Da dove iniziare' : 'Where to start'}
            </h2>
            <p className="text-sm leading-relaxed text-slate-700">
              {language === 'it'
                ? 'Se stai iniziando, segui questi tre passaggi: prima costruisci le basi, poi osserva come viaggiano i dati e infine prova un laboratorio guidato.'
                : 'If you are new to the topic, follow these three steps: build the foundations, see how data moves, then try a guided lab.'}
            </p>
          </div>
          <ViewLink
            view="manual"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            {language === 'it' ? 'Continua con il Manuale di studio' : 'Continue with the Study Manual'}
          </ViewLink>
        </div>

        <ol className="mt-5 grid gap-3 md:grid-cols-3">
          <li className="rounded-lg border border-indigo-100 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
              {language === 'it' ? 'Passaggio 1 · Basi' : 'Step 1 · Foundations'}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              {language === 'it'
                ? 'Leggi il Manuale di studio e segui gli esempi.'
                : 'Read the Study Manual and follow its examples.'}
            </p>
            <ViewLink
              view="manual"
              className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-4 hover:text-indigo-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {language === 'it' ? 'Apri il Manuale di studio' : 'Open the Study Manual'}
            </ViewLink>
          </li>
          <li className="rounded-lg border border-indigo-100 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
              {language === 'it' ? 'Passaggio 2 · Modello OSI' : 'Step 2 · OSI model'}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              {language === 'it'
                ? 'Esplora i livelli e osserva l’incapsulamento.'
                : 'Explore the layers and see encapsulation in action.'}
            </p>
            <ViewLink
              view="osi"
              className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-4 hover:text-indigo-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {language === 'it' ? 'Esplora la pila OSI' : 'Explore the OSI stack'}
            </ViewLink>
          </li>
          <li className="rounded-lg border border-indigo-100 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
              {language === 'it' ? 'Passaggio 3 · Pratica' : 'Step 3 · Practice'}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              {language === 'it'
                ? 'Calcola una subnet IPv4 e verifica i risultati.'
                : 'Plan an IPv4 subnet and check the results.'}
            </p>
            <ViewLink
              view="fundamentals"
              className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-4 hover:text-indigo-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {language === 'it' ? 'Prova il laboratorio IPv4' : 'Try the IPv4 lab'}
            </ViewLink>
          </li>
        </ol>
        <p className="mt-4 text-xs leading-relaxed text-slate-600">
          {language === 'it'
            ? 'Il completamento dei capitoli viene salvato solo in questo browser; puoi azzerarlo dal Manuale. Usa “Continua” per aprire il manuale oppure scegli liberamente un laboratorio.'
            : 'Chapter completion is stored only in this browser and can be reset from the Manual. Use “Continue” to open the manual, or choose any lab freely.'}
        </p>
      </section>

      <section aria-labelledby="blueprint-coverage-title" className="space-y-4">
        <div className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-indigo-600" />
          <h2 id="blueprint-coverage-title" className="text-lg font-semibold text-slate-900">
            {language === 'it' ? 'Copertura del blueprint' : 'Blueprint coverage'}
          </h2>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                CCNA {CCNA_BLUEPRINT.exam} v{CCNA_BLUEPRINT.version}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                {language === 'it'
                  ? `${CCNA_BLUEPRINT_TOPICS.length} obiettivi numerati, ciascuno collegato ad almeno una vista di studio. Ultima verifica: ${CCNA_BLUEPRINT.reviewedOn}.`
                  : `${CCNA_BLUEPRINT_TOPICS.length} numbered objectives, each linked to at least one study view. Last reviewed: ${CCNA_BLUEPRINT.reviewedOn}.`}
              </p>
            </div>
            <a
              href={CCNA_BLUEPRINT.source.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-indigo-700 underline decoration-indigo-300 underline-offset-2 hover:text-indigo-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              {language === 'it' ? 'Fonte ufficiale Cisco (PDF)' : 'Official Cisco source (PDF)'}
            </a>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {CCNA_BLUEPRINT_DOMAINS.map((domain) => (
              <details key={domain.number} className="rounded-lg border border-slate-200 bg-slate-50/60">
                <summary className="flex cursor-pointer items-center gap-2 p-3 text-xs font-semibold text-slate-800">
                  <span>
                    {domain.number}. {domain.title[language]}
                  </span>
                  <span className="ml-auto font-normal text-slate-500">
                    {domain.topics.length} · {domain.weight}%
                  </span>
                </summary>
                <ul className="space-y-3 border-t border-slate-200 p-3">
                  {domain.topics.map((entry) => (
                    <li key={entry.id} className="text-xs leading-relaxed text-slate-700">
                      <p>
                        <span className="font-mono font-semibold text-indigo-700">{entry.id}</span>{' '}
                        {entry.title[language]}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {entry.destinations.map((destination) => (
                          <ViewLink
                            key={destination}
                            view={destination}
                            className="rounded-full border border-indigo-200 bg-white px-2 py-0.5 text-[11px] font-medium text-indigo-700 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                          >
                            {VIEW_REGISTRY[destination][language]}
                          </ViewLink>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>
      </section>

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

              <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50/40 p-3">
                <h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-700">
                  <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                  {language === 'it' ? 'Teoria nel manuale' : 'Theory in the study manual'}
                </h4>
                {manualProgressByDomain.get(domain.id)!.total > 0 ? (
                  <>
                    <p
                      className="mt-2 text-xs font-semibold text-slate-700"
                      aria-label={`${language === 'it' ? 'Progresso capitoli' : 'Chapter progress'}: ${manualProgressByDomain.get(domain.id)!.completed}/${manualProgressByDomain.get(domain.id)!.total}`}
                    >
                      {language === 'it' ? 'Progresso' : 'Progress'}: {manualProgressByDomain.get(domain.id)!.completed}
                      /{manualProgressByDomain.get(domain.id)!.total} ({manualProgressByDomain.get(domain.id)!.percent}
                      %)
                    </p>
                    <ul className="mt-2 space-y-1 text-xs leading-relaxed text-slate-700">
                      {manualProgressByDomain.get(domain.id)!.chapters.map((entry) => (
                        <li key={entry.id}>
                          <ViewLink
                            view="manual"
                            chapterId={entry.id}
                            className="inline-flex min-h-11 items-center font-medium text-indigo-700 underline decoration-indigo-300 underline-offset-2 hover:text-indigo-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                          >
                            {language === 'it' ? `Cap. ${entry.order}` : `Ch. ${entry.order}`}: {entry.title[language]}
                          </ViewLink>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    {language === 'it'
                      ? 'In arrivo: questo dominio non ha ancora un capitolo dedicato nel manuale.'
                      : 'Coming soon: this domain does not yet have a dedicated manual chapter.'}
                  </p>
                )}
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {language === 'it' ? 'Contenuti' : 'Topics'}
                  </h4>
                  <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-600">
                    {domain.topics.map((topic) => (
                      <li key={topic.en}>• {topic[language]}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {language === 'it' ? 'Attacchi e difese' : 'Attacks and defenses'}
                  </h4>
                  <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-600">
                    {domain.securityLinks.map((item) => (
                      <li key={item.en}>• {item[language]}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className="mt-4 font-mono text-[10px] text-slate-400">
                {language === 'it' ? 'Obiettivi' : 'Objectives'}: {domain.objectiveIds.join(' · ')}
              </p>

              {CHECKLIST_BY_DOMAIN.has(domain.id) ? (
                <details className="mt-4 inline-block rounded-lg border border-slate-200 bg-slate-50/60">
                  <summary className="flex cursor-pointer items-center gap-2 p-3 text-xs font-semibold text-slate-700">
                    <ListChecks className="h-4 w-4 shrink-0 text-indigo-600" aria-hidden="true" />
                    {checklistLabels.title}
                    <span className="ml-auto font-normal text-slate-400">
                      {CHECKLIST_BY_DOMAIN.get(domain.id)!.items.length}
                    </span>
                  </summary>
                  <div className="border-t border-slate-200 p-3">
                    <p className="text-[11px] leading-relaxed text-slate-500">{checklistLabels.note}</p>
                    <ul className="mt-3 space-y-3">
                      {CHECKLIST_BY_DOMAIN.get(domain.id)!.items.map((entry) => (
                        <li key={entry.id} className="rounded-lg border border-slate-200 bg-white p-3">
                          <p className="text-xs font-medium leading-relaxed text-slate-800">
                            {entry.concept[language]}
                          </p>
                          <p className="mt-2 text-[11px] leading-relaxed text-sky-900">
                            <strong>{checklistLabels.observe}:</strong> {entry.observeIn[language]}
                          </p>
                          <p className="mt-1 text-[11px] leading-relaxed text-amber-900">
                            <strong>{checklistLabels.pitfall}:</strong> {entry.pitfall[language]}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              ) : null}
              {domain.id === 'network-fundamentals' ? (
                <ViewLink
                  view="fundamentals"
                  className="mt-4 inline-block rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  {language === 'it' ? 'Apri il laboratorio IPv4' : 'Open the IPv4 lab'}
                </ViewLink>
              ) : null}
              {domain.id === 'network-access' ? (
                <ViewLink
                  view="access"
                  className="mt-4 inline-block rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 transition-colors hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                >
                  {language === 'it' ? 'Apri il laboratorio Network Access' : 'Open the Network Access lab'}
                </ViewLink>
              ) : null}
              {domain.id === 'ip-connectivity' ? (
                <ViewLink
                  view="routing"
                  className="mt-4 inline-block rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  {language === 'it' ? 'Apri il laboratorio IP Connectivity' : 'Open the IP Connectivity lab'}
                </ViewLink>
              ) : null}
              {domain.id === 'ip-services' ? (
                <ViewLink
                  view="services"
                  className="mt-4 inline-block rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  {language === 'it' ? 'Apri il laboratorio IP Services' : 'Open the IP Services lab'}
                </ViewLink>
              ) : null}
              {domain.id === 'security-fundamentals' ? (
                <ViewLink
                  view="securitycore"
                  className="mt-4 inline-block rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800 transition-colors hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                >
                  {language === 'it'
                    ? 'Apri il laboratorio Security Fundamentals'
                    : 'Open the Security Fundamentals lab'}
                </ViewLink>
              ) : null}
              {domain.id === 'automation-programmability' ? (
                <ViewLink
                  view="automation"
                  className="mt-4 inline-block rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-800 transition-colors hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  {language === 'it' ? 'Apri il laboratorio Automation' : 'Open the Automation lab'}
                </ViewLink>
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
          <ViewLink
            view="coverage"
            className="mt-3 inline-block shrink-0 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 sm:mt-0"
          >
            {language === 'it' ? 'Apri il catalogo completo' : 'Open the full catalog'}
          </ViewLink>
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

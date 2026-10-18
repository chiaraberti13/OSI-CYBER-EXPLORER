import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardCheck, FileText, LockKeyhole } from 'lucide-react';
import {
  ASSESSMENT_EVIDENCE,
  ASSESSMENT_FINDINGS,
  ASSESSMENT_PHASES,
  ASSESSMENT_SCOPE,
  buildAssessmentReport,
  calculateTriageIndex,
  confidencePercent,
  triagePriority,
  type AssessmentEvidence,
  type AssessmentPhaseId,
  type OsHypothesis
} from '../content/assessmentWorkspace';
import { useStore } from '../store';

const COPY = {
  it: {
    eyebrow: 'EJPT · SCOPE → EVIDENCE → TRIAGE',
    title: 'Workspace di assessment',
    intro:
      'Conduci una catena di valutazione ripetibile usando solo fixture locali. Ogni fase sblocca dati con fonte, data e confidenza; nessun host viene interrogato.',
    guardTitle: 'Ambiente offline e autorizzazione',
    scopeLabel: 'Perimetro autorizzato',
    confirmScope: 'Confermo di lavorare esclusivamente sulla fixture nello scope.',
    start: 'Scope da confermare prima di iniziare',
    locked: 'Completa la fase precedente',
    load: 'Carica evidenze simulate',
    evaluate: 'Valuta l’ipotesi',
    loaded: 'Fase completata',
    source: 'Fonte',
    date: 'Data',
    confidence: 'Confidenza',
    observation: 'Osservazione',
    hypothesis: 'Ipotesi',
    osChoice: 'Ipotesi OS da verificare',
    osChoices: { 'linux-like': 'Linux/Unix-like', 'windows-like': 'Windows-like', unknown: 'Non determinabile' },
    assets: 'Asset in scope',
    excluded: 'Fuori scope, escluso',
    triage: 'Triage didattico',
    exposure: 'Esposizione',
    impact: 'Impatto',
    noCvss:
      'Indice di triage didattico: esposizione × impatto × confidenza (scala 1–5). Non è CVSS e non sostituisce una valutazione professionale.',
    validateFirst: 'Attendibilità bassa: verificare prima di dichiarare una vulnerabilità.',
    reportTitle: 'Report bilingue pronto',
    reportHint: 'Il report include scope, autorizzazione, fonti, date, confidenze, ipotesi e priorità.',
    noNetwork:
      'Nessun pacchetto, comando, scansione o richiesta HTTP viene generato. I record sono dati sintetici inclusi nell’app.',
    stageCount: 'fasi completate',
    evidenceCount: 'evidenze raccolte',
    confidencePercent: (value: number) => `${value}%`
  },
  en: {
    eyebrow: 'eJPT · SCOPE → EVIDENCE → TRIAGE',
    title: 'Assessment workspace',
    intro:
      'Run a repeatable assessment chain using local fixtures only. Each phase unlocks data with a source, date, and confidence; no host is queried.',
    guardTitle: 'Offline environment and authorization',
    scopeLabel: 'Authorized scope',
    confirmScope: 'I confirm that I will work exclusively on the in-scope fixture.',
    start: 'Confirm scope before starting',
    locked: 'Complete the previous phase',
    load: 'Load simulated evidence',
    evaluate: 'Evaluate hypothesis',
    loaded: 'Phase completed',
    source: 'Source',
    date: 'Date',
    confidence: 'Confidence',
    observation: 'Observation',
    hypothesis: 'Hypothesis',
    osChoice: 'OS hypothesis to evaluate',
    osChoices: { 'linux-like': 'Linux/Unix-like', 'windows-like': 'Windows-like', unknown: 'Inconclusive' },
    assets: 'In-scope asset',
    excluded: 'Out of scope, excluded',
    triage: 'Teaching triage',
    exposure: 'Exposure',
    impact: 'Impact',
    noCvss:
      'Teaching triage index: exposure × impact × confidence (1–5 scale). It is not CVSS and does not replace a professional assessment.',
    validateFirst: 'Low confidence: validate before claiming a vulnerability.',
    reportTitle: 'Bilingual report ready',
    reportHint: 'The report includes scope, authorization, sources, dates, confidence, hypotheses, and priorities.',
    noNetwork: 'No packet, command, scan, or HTTP request is generated. Records are synthetic data bundled in the app.',
    stageCount: 'phases completed',
    evidenceCount: 'evidence items collected',
    confidencePercent: (value: number) => `${value}%`
  }
};

const buildOsHypothesisEvidence = (hypothesis: OsHypothesis): AssessmentEvidence => ({
  id: 'OS-HYP-01',
  phase: 'os-hypothesis',
  kind: 'hypothesis',
  source: 'derived: fixture://services/web-01.json (ENUM-01)',
  observedOn: ASSESSMENT_SCOPE.observedOn,
  confidence: hypothesis === 'unknown' ? 20 : 45,
  statement: {
    it: `La fixture suggerisce ${hypothesis === 'linux-like' ? 'Linux/Unix-like' : hypothesis === 'windows-like' ? 'Windows-like' : 'un sistema non determinabile'}; banner e TTL sono indizi deboli, influenzabili da NAT, proxy, firewall e hop, non una prova dell’OS reale. Da validare con evidenze indipendenti.`,
    en: `The fixture suggests a ${hypothesis === 'linux-like' ? 'Linux/Unix-like' : hypothesis === 'windows-like' ? 'Windows-like' : 'non-identifiable'} system; banners and TTL are weak clues affected by NAT, proxies, firewalls, and hops, not proof of a real operating system. Validate with independent evidence.`
  }
});

export default function AssessmentWorkspaceLab() {
  const language = useStore((state) => state.language);
  const copy = COPY[language];
  const [scopeConfirmed, setScopeConfirmed] = useState(false);
  const [completedPhases, setCompletedPhases] = useState<AssessmentPhaseId[]>([]);
  const [evidence, setEvidence] = useState<AssessmentEvidence[]>([]);
  const [hypothesis, setHypothesis] = useState<OsHypothesis>('linux-like');
  const report = useMemo(
    () => (completedPhases.includes('assessment') ? buildAssessmentReport(evidence) : ''),
    [completedPhases, evidence]
  );

  const runPhase = (phase: AssessmentPhaseId) => {
    if (!scopeConfirmed) return;
    const phaseIndex = ASSESSMENT_PHASES.findIndex((item) => item.id === phase);
    if (phaseIndex > 0 && !completedPhases.includes(ASSESSMENT_PHASES[phaseIndex - 1].id)) return;
    const phaseEvidence =
      phase === 'os-hypothesis'
        ? [buildOsHypothesisEvidence(hypothesis)]
        : ASSESSMENT_EVIDENCE.filter((item) => item.phase === phase);
    setEvidence((current) => [...current.filter((item) => item.phase !== phase), ...phaseEvidence]);
    setCompletedPhases((current) => (current.includes(phase) ? current : [...current, phase]));
  };

  return (
    <div className="space-y-5">
      <header className="rounded-xl border border-slate-200 bg-white p-5 md:p-7" aria-labelledby="assessment-title">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
            <ClipboardCheck aria-hidden="true" className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1 id="assessment-title" className="mt-1 text-xl font-semibold text-slate-900">
              {copy.title}
            </h1>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-600">{copy.intro}</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <section
            className="rounded-lg border border-indigo-200 bg-indigo-50/60 p-4"
            aria-labelledby="assessment-scope-title"
          >
            <h2 id="assessment-scope-title" className="text-sm font-semibold text-indigo-950">
              {copy.scopeLabel}
            </h2>
            <p className="mt-1 break-words font-mono text-sm text-indigo-900">
              {ASSESSMENT_SCOPE.hostname} · {ASSESSMENT_SCOPE.target}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-indigo-950">{ASSESSMENT_SCOPE.authorization[language]}</p>
            <p className="mt-1 text-xs leading-relaxed text-indigo-950">{ASSESSMENT_SCOPE.rules[language]}</p>
          </section>
          <aside className="rounded-lg border border-amber-200 bg-amber-50 p-4" role="note">
            <div className="flex items-start gap-2">
              <LockKeyhole aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-amber-800" />
              <div>
                <h2 className="text-sm font-semibold text-amber-950">{copy.guardTitle}</h2>
                <p className="mt-1 text-xs leading-relaxed text-amber-950">{copy.noNetwork}</p>
              </div>
            </div>
          </aside>
        </div>
        <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800">
          <input
            type="checkbox"
            checked={scopeConfirmed}
            onChange={(event) => setScopeConfirmed(event.target.checked)}
            className="h-4 w-4 rounded border-slate-400 text-indigo-700 focus:ring-indigo-600"
          />
          <span>{copy.confirmScope}</span>
        </label>
      </header>

      <section aria-label={copy.title} className="grid gap-4">
        {ASSESSMENT_PHASES.map((phase, index) => {
          const complete = completedPhases.includes(phase.id);
          const unlocked = scopeConfirmed && (index === 0 || completedPhases.includes(ASSESSMENT_PHASES[index - 1].id));
          const entries = evidence.filter((item) => item.phase === phase.id);
          return (
            <article key={phase.id} className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-800">
                    {complete ? (
                      <CheckCircle2 aria-label={copy.loaded} className="h-5 w-5 text-emerald-700" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-slate-900">{phase.title[language]}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{phase.objective[language]}</p>
                  </div>
                </div>
                {phase.id === 'os-hypothesis' && unlocked && !complete ? (
                  <label className="min-w-52 text-xs font-semibold text-slate-700">
                    {copy.osChoice}
                    <select
                      value={hypothesis}
                      onChange={(event) => setHypothesis(event.target.value as OsHypothesis)}
                      className="mt-1 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      {(['linux-like', 'windows-like', 'unknown'] as const).map((choice) => (
                        <option key={choice} value={choice}>
                          {copy.osChoices[choice]}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
                <button
                  type="button"
                  disabled={!unlocked || complete}
                  onClick={() => runPhase(phase.id)}
                  className="min-h-11 shrink-0 rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600"
                >
                  {complete
                    ? copy.loaded
                    : unlocked
                      ? phase.id === 'os-hypothesis'
                        ? copy.evaluate
                        : copy.load
                      : scopeConfirmed
                        ? copy.locked
                        : copy.start}
                </button>
              </div>
              {entries.length > 0 ? (
                <ul className="mt-4 grid gap-3 lg:grid-cols-2" aria-live="polite">
                  {entries.map((item) => (
                    <li
                      key={item.id}
                      className={
                        item.kind === 'hypothesis'
                          ? 'rounded-lg border border-amber-200 bg-amber-50/70 p-3'
                          : 'rounded-lg border border-slate-200 bg-slate-50 p-3'
                      }
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{item.id}</span>
                        <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-slate-700">
                          {item.kind === 'hypothesis' ? copy.hypothesis : copy.observation} ·{' '}
                          {copy.confidencePercent(confidencePercent(item.confidence))}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-slate-800">{item.statement[language]}</p>
                      <dl className="mt-3 grid gap-x-4 gap-y-1 text-xs sm:grid-cols-2">
                        <div className="min-w-0">
                          <dt className="font-semibold text-slate-600">{copy.source}</dt>
                          <dd className="break-all font-mono text-slate-800">{item.source}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-slate-600">{copy.date}</dt>
                          <dd className="text-slate-800">{item.observedOn}</dd>
                        </div>
                      </dl>
                    </li>
                  ))}
                </ul>
              ) : null}
              {phase.id === 'discovery' && complete ? (
                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-950">
                    <strong>{copy.assets}:</strong> 192.0.2.10/32
                  </p>
                  <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-950">
                    <strong>{copy.excluded}:</strong> 198.51.100.20
                  </p>
                </div>
              ) : null}
              {phase.id === 'assessment' && complete ? (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-slate-900">{copy.triage}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">{copy.noCvss}</p>
                  <ul className="mt-3 grid gap-3 lg:grid-cols-2">
                    {[...ASSESSMENT_FINDINGS]
                      .sort((left, right) => calculateTriageIndex(right) - calculateTriageIndex(left))
                      .map((finding) => {
                        const indexScore = calculateTriageIndex(finding);
                        return (
                          <li key={finding.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h4 className="text-sm font-semibold text-slate-900">{finding.title[language]}</h4>
                              <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-950">
                                {triagePriority(indexScore)} · {indexScore}/125
                              </span>
                            </div>
                            <p className="mt-2 text-xs leading-relaxed text-slate-700">{finding.rationale[language]}</p>
                            <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
                              <Metric label={copy.exposure} value={finding.exposure} />
                              <Metric label={copy.impact} value={finding.impact} />
                              <Metric label={copy.confidence} value={finding.confidence} />
                            </dl>
                            <p className="mt-2 text-xs leading-relaxed text-slate-700">
                              {finding.validation[language]}
                            </p>
                            {finding.confidence <= 2 ? (
                              <p className="mt-2 flex items-start gap-1.5 text-xs font-semibold text-amber-900">
                                <AlertTriangle aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                {copy.validateFirst}
                              </p>
                            ) : null}
                          </li>
                        );
                      })}
                  </ul>
                </div>
              ) : null}
            </article>
          );
        })}
      </section>

      {report ? (
        <section
          className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 md:p-5"
          aria-labelledby="assessment-report-title"
        >
          <div className="flex items-start gap-3">
            <FileText aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-800" />
            <div className="min-w-0">
              <h2 id="assessment-report-title" className="font-semibold text-emerald-950">
                {copy.reportTitle}
              </h2>
              <p className="mt-1 text-sm text-emerald-950">{copy.reportHint}</p>
            </div>
          </div>
          <pre
            aria-label={copy.reportTitle}
            className="mt-4 max-h-[32rem] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-emerald-200 bg-white p-4 text-xs leading-relaxed text-slate-800"
          >
            {report}
          </pre>
        </section>
      ) : null}

      <p className="text-xs text-slate-600">
        {completedPhases.length}/5 {copy.stageCount} · {evidence.length} {copy.evidenceCount}
      </p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-2">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">{label}</dt>
      <dd className="mt-0.5 font-mono text-sm font-bold text-slate-900">{value}/5</dd>
    </div>
  );
}

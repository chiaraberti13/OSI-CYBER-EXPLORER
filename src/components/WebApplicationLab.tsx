import { useState } from 'react';
import { Bug, CheckCircle2, ClipboardCheck, Globe, Search, ShieldAlert, Trash2 } from 'lucide-react';
import {
  applyWebFixtureRemediations,
  confirmWebLabScope,
  createWebLabState,
  discoverWebFixturePaths,
  inspectOtherFixtureProfile,
  inspectWebFixture,
  resetWebLab,
  runWebFixtureRegressions,
  submitFixtureLoginAttempt,
  WEB_LAB_SCOPE,
  type WebLabState
} from '../content/webApplicationLab';
import { useStore } from '../store';

const COPY = {
  it: {
    eyebrow: 'eJPT · RICOGNIZIONE → TEST → REMEDIATION → REGRESSIONE',
    title: 'Web application pentest: fixture offline',
    intro:
      'Esamina scambi HTTP preregistrati, trova percorsi fixture, osserva un login senza rate limit e verifica un difetto di autorizzazione a livello oggetto. Applica le correzioni e ripeti i test di regressione.',
    scope: 'Scope autorizzato',
    guard: 'Simulazione deterministica non eseguibile',
    confirm: 'Confermo lo scope: userò esclusivamente le fixture locali documentali.',
    recon: 'Ispeziona risposta HTTP',
    discover: 'Scopri percorsi fixture',
    login: 'Invia tentativo login sintetico',
    profile: 'Verifica accesso al profilo fixture-user-02',
    remediate: 'Applica remediation fixture',
    runRegression: 'Esegui test di regressione',
    reset: 'Azzera sessione',
    evidence: 'Evidenza richiesta-risposta',
    request: 'Richiesta',
    response: 'Risposta',
    none: 'Nessuna evidenza ancora. Conferma lo scope e avvia un controllo.',
    vulnerable: 'Fixture vulnerabile',
    fixed: 'Fixture corretta',
    loginState: (attempts: number, blocked: boolean) =>
      `Tentativi fixture: ${attempts} · ${blocked ? 'throttled (429)' : 'non bloccato'}`,
    remediations: 'Controlli applicati',
    rateLimit: 'Rate limit e cooldown per account e sorgente; risposta uniforme e logging.',
    authorization: 'Autorizzazione server-side per ogni oggetto; accesso negato per default.',
    regression: 'Esito regressioni',
    pass: 'PASS',
    fail: 'FAIL',
    rateCheck: 'Login: la quarta richiesta è limitata dopo tre tentativi fixture.',
    accessCheck: 'Accesso oggetto: la sessione user-01 non legge il profilo user-02.',
    finding:
      'Rilievo didattico: controllo accessi a livello oggetto mancante (IDOR/BOLA). La sessione è autenticata, ma l’ownership non è verificata per ogni risorsa.',
    httpFinding:
      'Rilievi da validare: il cookie non mostra il flag Secure e manca Content-Security-Policy. Un banner Server è informativo, non prova una vulnerabilità o una release.',
    pathsFinding:
      'Il percorso indicizzato da robots.txt è un hint di superficie, non una barriera né una vulnerabilità. La fixture non restituisce file segreti.',
    noNetwork:
      'Ogni scambio è testo statico in memoria. Non vengono effettuate richieste HTTP, scansioni, tentativi su credenziali reali, accessi a file o connessioni esterne.',
    reviewDate: 'Contenuti verificati: 18 ottobre 2026'
  },
  en: {
    eyebrow: 'eJPT · RECON → TEST → REMEDIATION → REGRESSION',
    title: 'Web application pentest: offline fixture',
    intro:
      'Review preloaded HTTP exchanges, discover fixture paths, observe a login without rate limiting, and verify a broken object-level authorization issue. Apply fixes and rerun regression checks.',
    scope: 'Authorized scope',
    guard: 'Deterministic, non-executable simulation',
    confirm: 'I confirm scope: I will use only the local documentation fixtures.',
    recon: 'Inspect HTTP response',
    discover: 'Discover fixture paths',
    login: 'Submit synthetic login attempt',
    profile: 'Check access to fixture-user-02 profile',
    remediate: 'Apply fixture remediations',
    runRegression: 'Run regression checks',
    reset: 'Reset session',
    evidence: 'Request-response evidence',
    request: 'Request',
    response: 'Response',
    none: 'No evidence yet. Confirm scope and start a check.',
    vulnerable: 'Vulnerable fixture',
    fixed: 'Patched fixture',
    loginState: (attempts: number, blocked: boolean) =>
      `Fixture attempts: ${attempts} · ${blocked ? 'throttled (429)' : 'not blocked'}`,
    remediations: 'Applied controls',
    rateLimit: 'Per-account and per-source rate limits and cooldown; uniform responses and logging.',
    authorization: 'Server-side authorization for each object; deny access by default.',
    regression: 'Regression results',
    pass: 'PASS',
    fail: 'FAIL',
    rateCheck: 'Login: the fourth request is throttled after three fixture attempts.',
    accessCheck: 'Object access: user-01 session cannot read the user-02 profile.',
    finding:
      'Teaching finding: missing object-level access control (IDOR/BOLA). The session is authenticated, but ownership is not checked for each resource.',
    httpFinding:
      'Findings to validate: the cookie lacks a visible Secure flag and Content-Security-Policy is absent. A Server banner is informational; it does not prove a vulnerability or release.',
    pathsFinding:
      'A path listed in robots.txt is a surface hint, not a control or vulnerability. The fixture returns no secret files.',
    noNetwork:
      'Every exchange is static in-memory text. No HTTP requests, scans, real credential attempts, file access, or external connections occur.',
    reviewDate: 'Content reviewed: 18 October 2026'
  }
} as const;

function update(state: WebLabState, change: (current: WebLabState) => WebLabState): WebLabState {
  return change(state);
}

export default function WebApplicationLab() {
  const language = useStore((state) => state.language);
  const copy = COPY[language];
  const [state, setState] = useState(createWebLabState);
  const allPassed = state.regressionResults.length > 0 && state.regressionResults.every((result) => result.passed);

  return (
    <div className="space-y-5" aria-labelledby="web-application-lab-title">
      <header className="rounded-xl border border-slate-200 bg-white p-5 md:p-7">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
            <Globe aria-hidden="true" className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1 id="web-application-lab-title" className="mt-1 text-xl font-semibold text-slate-900">
              {copy.title}
            </h1>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-600">{copy.intro}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <section
            className="rounded-lg border border-indigo-200 bg-indigo-50/60 p-4"
            aria-labelledby="web-scope-title"
          >
            <h2 id="web-scope-title" className="text-sm font-semibold text-indigo-950">
              {copy.scope}
            </h2>
            <p className="mt-1 break-words font-mono text-sm text-indigo-900">
              {WEB_LAB_SCOPE.host} · {WEB_LAB_SCOPE.address}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-indigo-950">{WEB_LAB_SCOPE.authorization[language]}</p>
            <p className="mt-1 text-xs leading-relaxed text-indigo-950">{WEB_LAB_SCOPE.rules[language]}</p>
          </section>
          <aside className="rounded-lg border border-amber-200 bg-amber-50 p-4" role="note">
            <div className="flex items-start gap-2">
              <ShieldAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-amber-800" />
              <div>
                <h2 className="text-sm font-semibold text-amber-950">{copy.guard}</h2>
                <p className="mt-1 text-xs leading-relaxed text-amber-950">{copy.noNetwork}</p>
                <p className="mt-2 text-xs text-amber-900">{copy.reviewDate}</p>
              </div>
            </div>
          </aside>
        </div>
        <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800">
          <input
            type="checkbox"
            checked={state.authorized}
            onChange={(event) =>
              setState((current) =>
                event.target.checked ? confirmWebLabScope(current) : { ...createWebLabState(), authorized: false }
              )
            }
            className="h-4 w-4 rounded border-slate-400 text-indigo-700 focus:ring-indigo-600"
          />
          <span>{copy.confirm}</span>
        </label>
      </header>

      <section className="grid gap-4 xl:grid-cols-[minmax(16rem,0.8fr)_minmax(0,1.2fr)]">
        <article
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 md:p-5"
          aria-labelledby="web-actions-title"
        >
          <h2 id="web-actions-title" className="font-semibold text-slate-900">
            {language === 'it' ? 'Controlli guidati' : 'Guided checks'}
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            <button
              type="button"
              disabled={!state.authorized}
              onClick={() => setState((s) => update(s, inspectWebFixture))}
              className={buttonClass}
            >
              <Globe aria-hidden="true" className="h-4 w-4" /> {copy.recon}
            </button>
            <button
              type="button"
              disabled={!state.authorized}
              onClick={() => setState((s) => update(s, discoverWebFixturePaths))}
              className={buttonClass}
            >
              <Search aria-hidden="true" className="h-4 w-4" /> {copy.discover}
            </button>
            <button
              type="button"
              disabled={!state.authorized || state.loginBlocked}
              onClick={() => setState((s) => update(s, submitFixtureLoginAttempt))}
              className={buttonClass}
            >
              <Bug aria-hidden="true" className="h-4 w-4" /> {copy.login}
            </button>
            <button
              type="button"
              disabled={!state.authorized}
              onClick={() => setState((s) => update(s, inspectOtherFixtureProfile))}
              className={buttonClass}
            >
              <ShieldAlert aria-hidden="true" className="h-4 w-4" /> {copy.profile}
            </button>
          </div>
          <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700" role="status" aria-live="polite">
            {copy.loginState(state.loginAttempts, state.loginBlocked)} ·{' '}
            {state.objectAuthorizationFixed ? copy.fixed : copy.vulnerable}
          </p>
          {state.profileStatus === 200 && <p className="text-sm leading-relaxed text-amber-900">{copy.finding}</p>}
          {state.evidence.some((item) => item.id === 'http-recon') && (
            <p className="text-sm leading-relaxed text-slate-700">{copy.httpFinding}</p>
          )}
          {state.pathsDiscovered && <p className="text-sm leading-relaxed text-slate-700">{copy.pathsFinding}</p>}
          <div className="border-t border-slate-200 pt-4">
            <h3 className="font-semibold text-slate-900">{copy.remediations}</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li>{copy.rateLimit}</li>
              <li>{copy.authorization}</li>
            </ul>
            <button
              type="button"
              disabled={!state.authorized}
              onClick={() => setState((s) => applyWebFixtureRemediations(s))}
              className={`${buttonClass} mt-3 w-full`}
            >
              <CheckCircle2 aria-hidden="true" className="h-4 w-4" /> {copy.remediate}
            </button>
            <button
              type="button"
              disabled={!state.authorized || !state.rateLimitFixed || !state.objectAuthorizationFixed}
              onClick={() => setState((s) => runWebFixtureRegressions(s))}
              className={`${buttonClass} mt-2 w-full`}
            >
              <ClipboardCheck aria-hidden="true" className="h-4 w-4" /> {copy.runRegression}
            </button>
            <button
              type="button"
              onClick={() => setState((s) => resetWebLab(s))}
              className={`${buttonClass} mt-2 w-full`}
            >
              <Trash2 aria-hidden="true" className="h-4 w-4" /> {copy.reset}
            </button>
          </div>
        </article>

        <section
          className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 md:p-5"
          aria-labelledby="web-evidence-title"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 id="web-evidence-title" className="font-semibold text-slate-900">
              {copy.evidence}
            </h2>
            <span className="font-mono text-xs text-slate-500">{state.evidence.length}</span>
          </div>
          {state.evidence.length === 0 ? (
            <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-600" role="status">
              {copy.none}
            </p>
          ) : (
            <ol className="mt-3 space-y-3">
              {state.evidence.map((evidence, index) => (
                <li key={`${evidence.id}-${index}`} className="min-w-0 rounded-lg border border-slate-200 p-3">
                  <h3 className="font-semibold text-slate-900">{evidence.title[language]}</h3>
                  <div className="mt-2 grid min-w-0 gap-2 lg:grid-cols-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.request}</p>
                      <pre className="mt-1 overflow-x-auto rounded-md bg-slate-950 p-3 text-xs leading-relaxed text-slate-100">
                        <code>{evidence.request}</code>
                      </pre>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.response}</p>
                      <pre className="mt-1 overflow-x-auto rounded-md bg-slate-950 p-3 text-xs leading-relaxed text-slate-100">
                        <code>{evidence.response}</code>
                      </pre>
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{evidence.observation[language]}</p>
                </li>
              ))}
            </ol>
          )}
          {state.regressionResults.length > 0 && (
            <section className="mt-4 rounded-lg border border-slate-200 p-4" aria-labelledby="web-regression-title">
              <h3 id="web-regression-title" className="flex items-center gap-2 font-semibold text-slate-900">
                <ClipboardCheck aria-hidden="true" className="h-4 w-4" /> {copy.regression}:{' '}
                {allPassed ? copy.pass : copy.fail}
              </h3>
              <ul className="mt-2 space-y-2 text-sm">
                {state.regressionResults.map((result) => (
                  <li key={result.id} className="flex gap-2 text-slate-700">
                    <span className={result.passed ? 'font-semibold text-emerald-800' : 'font-semibold text-rose-800'}>
                      {result.passed ? copy.pass : copy.fail}
                    </span>
                    {result.id === 'login-rate-limit' ? copy.rateCheck : copy.accessCheck}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </section>
      </section>
    </div>
  );
}

const buttonClass =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500';

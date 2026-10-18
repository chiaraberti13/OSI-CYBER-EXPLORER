import { useState } from 'react';
import { Fingerprint, ShieldAlert, TimerReset } from 'lucide-react';
import {
  PASSWORD_LAB_COPY,
  simulateOfflineCost,
  simulateOnlineAttempts,
  type GuessBudget,
  type OfflineProfileResult,
  type OnlineSimulationResult,
  type OnlineStrategy
} from '../content/passwordHashLab';
import { useStore } from '../store';

const UI = {
  it: {
    eyebrow: 'eJPT · PASSWORD · HASH · DIFESE',
    title: 'Password & hash workbench',
    intro:
      'Confronta controlli di autenticazione online e costo della verifica offline su fixture finite. Nessun segreto viene richiesto o verificato.',
    reset: 'Azzera la simulazione',
    online: 'Attacco online simulato',
    strategy: 'Strategia da confrontare',
    bruteForce: 'Tentativi ripetuti su un account',
    spray: 'Un tentativo su account distinti (spraying)',
    attempts: 'Tentativi simulati sul singolo account',
    accounts: 'Account sintetici nel campione',
    rateLimit: 'Rate limit: massimo 3 errori per account nella finestra simulata',
    accountLockout: 'Blocca l’account dopo 5 errori',
    runOnline: 'Simula tentativi online',
    onlineResult: 'Esito del servizio e telemetria',
    eventLog: 'Registro eventi fixture',
    submitted: 'Tentativi presentati',
    processed: 'Errori elaborati dal servizio',
    rateLimited: 'Richieste frenate dal rate limit',
    lockoutBlocked: 'Tentativi respinti dall’account bloccato',
    lockedAccounts: 'Account bloccati',
    sprayDetected: 'Correlazione tra account',
    sprayDetectedYes: 'Allerta: errori distribuiti su più account',
    sprayDetectedNo: 'Nessuna soglia cross-account raggiunta',
    onlineExplanation:
      'Nessuna autenticazione riesce: il simulatore conta solo richieste e controlli. Il rate limit agisce sulla frequenza; il lockout sul singolo account; la correlazione cross-account è necessaria per rilevare lo spraying.',
    offline: 'Cracking offline: confronto di costo',
    offlineExplanation:
      'Confronta una fixture legacy con hash veloce e una protetta da KDF con fattore di lavoro e sale univoco. Il budget limita il numero di candidati simulati.',
    budget: 'Budget sintetico di candidati',
    runOffline: 'Confronta i profili offline',
    profile: 'Profilo fixture',
    salt: 'Sale',
    costPerGuess: 'Unità didattiche per candidato',
    totalCost: 'Costo didattico totale',
    recovered: 'Campione debole trovato nel budget',
    notRecovered: 'Campione non trovato nel budget',
    fastProfile: 'Hash veloce generico · fixture legacy',
    kdfProfile: 'KDF lenta · fixture protetta',
    noSalt: 'Assente',
    uniqueSalt: 'Unico per record · etichetta sintetica',
    fastExplanation:
      'Un hash veloce rende economico ogni candidato; senza sale, record uguali possono condividere l’impronta e la precomputazione resta riutilizzabile. Qui l’impronta è soltanto un’etichetta fixture.',
    kdfExplanation:
      'Una KDF con fattore di lavoro aumenta il costo per candidato; il sale casuale e distinto evita impronte uguali e tabelle precomputate riutilizzabili, ma non rallenta da solo il singolo calcolo.',
    costDisclaimer:
      'Unità e posizioni dei campioni sono arbitrarie e solo didattiche: nessun hash viene calcolato, nessun candidato o dato segreto è presente e i valori non sono benchmark né stime temporali.',
    noNetwork:
      'Il modello è deterministico e resta nella memoria locale della vista. Non invia richieste, non verifica credenziali e non esegue cracking reale.'
  },
  en: {
    eyebrow: 'eJPT · PASSWORDS · HASHING · DEFENSES',
    title: 'Password & hash workbench',
    intro:
      'Compare online authentication controls and offline verification cost using bounded fixtures. No secret is requested or checked.',
    reset: 'Reset simulation',
    online: 'Simulated online attack',
    strategy: 'Strategy to compare',
    bruteForce: 'Repeated attempts against one account',
    spray: 'One attempt across distinct accounts (spraying)',
    attempts: 'Simulated attempts against one account',
    accounts: 'Synthetic accounts in sample',
    rateLimit: 'Rate limit: at most 3 failures per account in the simulated window',
    accountLockout: 'Lock account after 5 failures',
    runOnline: 'Simulate online attempts',
    onlineResult: 'Service outcome and telemetry',
    eventLog: 'Fixture event log',
    submitted: 'Attempts submitted',
    processed: 'Failures processed by service',
    rateLimited: 'Requests throttled by rate limit',
    lockoutBlocked: 'Attempts rejected by locked account',
    lockedAccounts: 'Accounts locked',
    sprayDetected: 'Cross-account correlation',
    sprayDetectedYes: 'Alert: failures distributed across accounts',
    sprayDetectedNo: 'Cross-account threshold not reached',
    onlineExplanation:
      'No authentication succeeds: the simulator counts requests and controls only. Rate limiting controls frequency; lockout applies to one account; cross-account correlation is needed to detect spraying.',
    offline: 'Offline cracking: cost comparison',
    offlineExplanation:
      'Compare a legacy fast-hash fixture with a protected profile using a work-factor KDF and unique salt. The budget caps the number of simulated candidates.',
    budget: 'Synthetic candidate budget',
    runOffline: 'Compare offline profiles',
    profile: 'Fixture profile',
    salt: 'Salt',
    costPerGuess: 'Teaching units per candidate',
    totalCost: 'Total teaching cost',
    recovered: 'Weak sample found within budget',
    notRecovered: 'Sample not found within budget',
    fastProfile: 'Fast general-purpose hash · legacy fixture',
    kdfProfile: 'Slow KDF · hardened fixture',
    noSalt: 'Absent',
    uniqueSalt: 'Unique per record · synthetic label',
    fastExplanation:
      'A fast hash makes each candidate inexpensive; without a salt, identical records can share a fingerprint and precomputation remains reusable. The fingerprint here is only a fixture label.',
    kdfExplanation:
      'A KDF with a work factor raises the cost per candidate; a distinct random salt prevents identical fingerprints and reusable precomputed tables, but does not by itself slow one computation.',
    costDisclaimer:
      'Units and sample positions are arbitrary and educational only: no hash is computed, no candidate or secret data is present, and values are not benchmarks or time estimates.',
    noNetwork:
      'The model is deterministic and stays in this view’s local memory. It sends no requests, checks no credentials, and performs no real cracking.'
  }
} as const;

export default function PasswordHashLab() {
  const language = useStore((state) => state.language);
  const copy = UI[language];
  const model = PASSWORD_LAB_COPY[language];
  const [scopeConfirmed, setScopeConfirmed] = useState(false);
  const [strategy, setStrategy] = useState<OnlineStrategy>('brute-force');
  const [attempts, setAttempts] = useState(5);
  const [accounts, setAccounts] = useState(4);
  const [rateLimitEnabled, setRateLimitEnabled] = useState(true);
  const [accountLockoutEnabled, setAccountLockoutEnabled] = useState(false);
  const [budget, setBudget] = useState<GuessBudget>(100);
  const [onlineResult, setOnlineResult] = useState<OnlineSimulationResult | null>(null);
  const [offlineResult, setOfflineResult] = useState<OfflineProfileResult[] | null>(null);

  const reset = () => {
    setScopeConfirmed(false);
    setStrategy('brute-force');
    setAttempts(5);
    setAccounts(4);
    setRateLimitEnabled(true);
    setAccountLockoutEnabled(false);
    setBudget(100);
    setOnlineResult(null);
    setOfflineResult(null);
  };

  return (
    <div className="space-y-5" aria-labelledby="password-hash-lab-title">
      <header className="rounded-xl border border-slate-200 bg-white p-5 md:p-7">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
            <Fingerprint aria-hidden="true" className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1 id="password-hash-lab-title" className="mt-1 text-xl font-semibold text-slate-900">
              {copy.title}
            </h1>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-600">{copy.intro}</p>
          </div>
          <button
            type="button"
            aria-label={copy.reset}
            onClick={reset}
            className="min-h-11 shrink-0 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <span className="inline-flex items-center gap-2">
              <TimerReset aria-hidden="true" className="h-4 w-4" />
              <span className="hidden sm:inline">{copy.reset}</span>
            </span>
          </button>
        </div>
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="flex items-start gap-2 text-sm font-medium leading-relaxed text-amber-950">
            <ShieldAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            {model.scope}
          </p>
          <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-slate-800">
            <input
              type="checkbox"
              checked={scopeConfirmed}
              onChange={(event) => setScopeConfirmed(event.target.checked)}
              className="h-4 w-4 rounded border-slate-400 text-indigo-700 focus:ring-indigo-600"
            />
            <span>
              {language === 'it'
                ? 'Confermo che opero solo sulle fixture sintetiche e non inserisco credenziali reali.'
                : 'I confirm I will use only synthetic fixtures and enter no real credentials.'}
            </span>
          </label>
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-2" aria-label={copy.title}>
        <article className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
          <h2 className="font-semibold text-slate-900">{copy.online}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{model.onlineExplanation}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">
              {copy.strategy}
              <select
                aria-label={copy.strategy}
                value={strategy}
                onChange={(event) => setStrategy(event.target.value as OnlineStrategy)}
                className="mt-1 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <option value="brute-force">{copy.bruteForce}</option>
                <option value="password-spray">{copy.spray}</option>
              </select>
            </label>
            {strategy === 'brute-force' ? (
              <label className="block text-sm font-semibold text-slate-700">
                {copy.attempts}
                <select
                  aria-label={copy.attempts}
                  value={attempts}
                  onChange={(event) => setAttempts(Number(event.target.value))}
                  className="mt-1 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  {[1, 3, 5, 8].map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <label className="block text-sm font-semibold text-slate-700">
                {copy.accounts}
                <select
                  aria-label={copy.accounts}
                  value={accounts}
                  onChange={(event) => setAccounts(Number(event.target.value))}
                  className="mt-1 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  {[2, 3, 4, 5, 6].map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          <div className="mt-3 space-y-2">
            <Toggle checked={rateLimitEnabled} label={copy.rateLimit} onChange={setRateLimitEnabled} />
            <Toggle checked={accountLockoutEnabled} label={copy.accountLockout} onChange={setAccountLockoutEnabled} />
          </div>
          <button
            type="button"
            disabled={!scopeConfirmed}
            onClick={() => {
              const result = simulateOnlineAttempts({
                strategy,
                attempts,
                accounts,
                rateLimitEnabled,
                accountLockoutEnabled
              });
              setOnlineResult(result);
            }}
            className="mt-4 min-h-11 rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {copy.runOnline}
          </button>
          {onlineResult && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4" role="status" aria-live="polite">
              <h3 className="font-semibold text-slate-900">{copy.onlineResult}</h3>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <Metric label={copy.submitted} value={onlineResult.submitted} />
                <Metric label={copy.processed} value={onlineResult.processed} />
                <Metric label={copy.rateLimited} value={onlineResult.rateLimited} />
                <Metric label={copy.lockoutBlocked} value={onlineResult.lockoutBlocked} />
                <Metric label={copy.lockedAccounts} value={onlineResult.lockedAccounts} />
                <div className="rounded-md bg-white p-2">
                  <dt className="text-xs leading-relaxed text-slate-600">{copy.sprayDetected}</dt>
                  <dd className="mt-1 text-xs font-semibold text-slate-900">
                    {onlineResult.sprayDetected ? copy.sprayDetectedYes : copy.sprayDetectedNo}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">{onlineResult.explanation[language]}</p>
              <Telemetry events={onlineResult.telemetry} label={copy.eventLog} />
            </div>
          )}
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
          <h2 className="font-semibold text-slate-900">{copy.offline}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{copy.offlineExplanation}</p>
          <label className="mt-4 block max-w-xs text-sm font-semibold text-slate-700">
            {copy.budget}
            <select
              aria-label={copy.budget}
              value={budget}
              onChange={(event) => setBudget(Number(event.target.value) as GuessBudget)}
              className="mt-1 block min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {[10, 100, 1000].map((count) => (
                <option key={count} value={count}>
                  {count.toLocaleString(language === 'it' ? 'it-IT' : 'en-US')}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={!scopeConfirmed}
            onClick={() => setOfflineResult(simulateOfflineCost(budget))}
            className="mt-4 min-h-11 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {copy.runOffline}
          </button>
          {offlineResult && (
            <div className="mt-4 grid gap-3 md:grid-cols-2" aria-live="polite">
              {offlineResult.map((profile) => (
                <OfflineProfile key={profile.id} copy={copy} profile={profile} />
              ))}
            </div>
          )}
          <p className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-xs leading-relaxed text-indigo-950">
            {model.costDisclaimer}
          </p>
        </article>
      </section>
      <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
        {model.noNetwork}
      </p>
    </div>
  );
}

function Toggle({ checked, label, onChange }: { checked: boolean; label: string; onChange: (value: boolean) => void }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-slate-400 text-indigo-700 focus:ring-indigo-600"
      />
      <span>{label}</span>
    </label>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-white p-2">
      <dt className="text-xs leading-relaxed text-slate-600">{label}</dt>
      <dd className="mt-1 font-mono text-sm font-semibold text-slate-900">{value}</dd>
    </div>
  );
}

function Telemetry({ events, label }: { events: string[]; label: string }) {
  return (
    <div className="mt-3 rounded-md border border-slate-200 bg-white p-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</h4>
      <ul className="mt-2 max-h-40 space-y-1 overflow-auto font-mono text-xs text-slate-800">
        {events.map((event, index) => (
          <li key={`${event}-${index}`} className="break-words">
            {event}
          </li>
        ))}
      </ul>
    </div>
  );
}

function OfflineProfile({
  copy,
  profile
}: {
  copy: {
    fastProfile: string;
    kdfProfile: string;
    profile: string;
    salt: string;
    noSalt: string;
    uniqueSalt: string;
    costPerGuess: string;
    totalCost: string;
    recovered: string;
    notRecovered: string;
  };
  profile: OfflineProfileResult;
}) {
  const isFast = profile.id === 'fast';
  const language = useStore((state) => state.language);
  const model = PASSWORD_LAB_COPY[language];
  return (
    <section
      className={`min-w-0 rounded-lg border p-3 ${profile.sampleFound ? 'border-amber-300 bg-amber-50/70' : 'border-emerald-300 bg-emerald-50/70'}`}
      aria-label={isFast ? copy.fastProfile : copy.kdfProfile}
    >
      <h3 className="break-words text-sm font-semibold text-slate-900">
        {isFast ? copy.fastProfile : copy.kdfProfile}
      </h3>
      <dl className="mt-3 space-y-2 text-xs">
        <div>
          <dt className="font-semibold text-slate-700">{copy.profile}</dt>
          <dd className="mt-0.5 break-words text-slate-800">{profile.algorithm}</dd>
          <dd className="mt-0.5 break-all font-mono text-slate-800">{profile.fingerprint}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-700">{copy.salt}</dt>
          <dd className="mt-0.5 text-slate-800">{profile.saltLabel === 'none' ? copy.noSalt : copy.uniqueSalt}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-700">{copy.costPerGuess}</dt>
          <dd className="mt-0.5 font-mono text-slate-800">{profile.unitsPerGuess.toLocaleString()}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-700">{copy.totalCost}</dt>
          <dd className="mt-0.5 font-mono text-slate-800">{profile.totalUnits.toLocaleString()}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs font-semibold text-slate-900">
        {profile.sampleFound ? copy.recovered : copy.notRecovered}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-slate-700">
        {profile.explanation[language]} {isFast ? model.fastExplanation : model.kdfExplanation}
      </p>
    </section>
  );
}

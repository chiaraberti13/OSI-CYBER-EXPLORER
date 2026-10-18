/** EJPT-04 deterministic credential fixtures. No password or real hash is stored or tested. */
import type { Bilingual } from '../types';

export type OnlineStrategy = 'brute-force' | 'password-spray';
export type GuessBudget = 10 | 100 | 1000;

export const PASSWORD_LAB_POLICY = {
  rateLimitPerAccount: 3,
  accountLockoutThreshold: 5,
  sprayDetectionAccountThreshold: 3,
  maxAttempts: 8,
  minAccounts: 2,
  maxAccounts: 6
} as const;

export const PASSWORD_LAB_COPY = {
  it: {
    scope:
      'Fixture esclusivamente didattica: utenti sintetici, nessuna password o hash reale e nessun servizio contattato.',
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
    reset: 'Azzera la simulazione',
    noNetwork:
      'Il modello è deterministico e resta nella memoria locale della vista. Non invia richieste, non verifica credenziali e non esegue cracking reale.'
  },
  en: {
    scope: 'Teaching fixture only: synthetic users, no real password or hash, and no service is contacted.',
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
    reset: 'Reset simulation',
    noNetwork:
      'The model is deterministic and stays in this view’s local memory. It sends no requests, checks no credentials, and performs no real cracking.'
  }
} as const satisfies Record<string, Record<string, string>>;

export interface OnlineSimulationOptions {
  strategy: OnlineStrategy;
  attempts: number;
  accounts: number;
  rateLimitEnabled: boolean;
  accountLockoutEnabled: boolean;
}

export interface OnlineSimulationResult {
  submitted: number;
  processed: number;
  rateLimited: number;
  lockoutBlocked: number;
  lockedAccounts: number;
  distinctAccounts: number;
  sprayDetected: boolean;
  telemetry: string[];
  explanation: Bilingual;
}

export interface OfflineProfileResult {
  id: 'fast' | 'kdf';
  algorithm: string;
  fingerprint: string;
  saltLabel: string;
  unitsPerGuess: number;
  budget: GuessBudget;
  totalUnits: number;
  sampleFound: boolean;
  explanation: Bilingual;
}

const VALID_GUESS_BUDGETS: readonly number[] = [10, 100, 1000];

export function simulateOnlineAttempts(options: OnlineSimulationOptions): OnlineSimulationResult | null {
  const validStrategy = options.strategy === 'brute-force' || options.strategy === 'password-spray';
  if (!validStrategy || !Number.isInteger(options.attempts) || options.attempts < 1 || options.attempts > 8) {
    return null;
  }
  if (
    !Number.isInteger(options.accounts) ||
    options.accounts < PASSWORD_LAB_POLICY.minAccounts ||
    options.accounts > PASSWORD_LAB_POLICY.maxAccounts
  ) {
    return null;
  }

  const targetAccounts = options.strategy === 'brute-force' ? 1 : options.accounts;
  const attemptsPerAccount = options.strategy === 'brute-force' ? options.attempts : 1;
  let processed = 0;
  let rateLimited = 0;
  let lockoutBlocked = 0;
  let lockedAccounts = 0;
  const telemetry: string[] = [];

  for (let account = 1; account <= targetAccounts; account += 1) {
    let accountFailures = 0;
    let accountLocked = false;
    for (let attempt = 1; attempt <= attemptsPerAccount; attempt += 1) {
      const syntheticAccount = `fixture-user-${String(account).padStart(2, '0')}`;
      if (accountLocked) {
        lockoutBlocked += 1;
        telemetry.push(`ACCOUNT_LOCKOUT_REJECT: ${syntheticAccount}`);
      } else if (options.rateLimitEnabled && accountFailures >= PASSWORD_LAB_POLICY.rateLimitPerAccount) {
        rateLimited += 1;
        telemetry.push(`RATE_LIMIT: ${syntheticAccount} · simulated window`);
      } else {
        processed += 1;
        accountFailures += 1;
        telemetry.push(`AUTH_FAILURE: ${syntheticAccount} · ${accountFailures} synthetic failure(s)`);
        if (options.accountLockoutEnabled && accountFailures >= PASSWORD_LAB_POLICY.accountLockoutThreshold) {
          accountLocked = true;
          lockedAccounts += 1;
          telemetry.push(`ACCOUNT_LOCKOUT: ${syntheticAccount} · fixture policy threshold reached`);
        }
      }
    }
  }

  const sprayDetected =
    options.strategy === 'password-spray' && targetAccounts >= PASSWORD_LAB_POLICY.sprayDetectionAccountThreshold;
  if (sprayDetected) telemetry.push(`CORRELATED_FAILURES: ${targetAccounts} synthetic accounts · simulated window`);

  return {
    submitted: targetAccounts * attemptsPerAccount,
    processed,
    rateLimited,
    lockoutBlocked,
    lockedAccounts,
    distinctAccounts: targetAccounts,
    sprayDetected,
    telemetry,
    explanation: {
      it: sprayDetected
        ? 'Un solo errore per account resta sotto le soglie individuali; la correlazione tra account rileva lo spraying.'
        : lockedAccounts > 0
          ? 'Il contatore per account raggiunge la soglia: il lockout blocca i tentativi successivi, ma può penalizzare utenti legittimi.'
          : rateLimited > 0
            ? 'Il rate limit frena le richieste oltre la soglia nella finestra simulata prima del lockout per account.'
            : 'I tentativi falliscono senza successo di autenticazione; osserva i contatori per account e nel tempo.',
      en: sprayDetected
        ? 'One failure per account stays below individual thresholds; cross-account correlation detects the spray.'
        : lockedAccounts > 0
          ? 'The per-account counter reaches its threshold: lockout blocks subsequent attempts but can penalize legitimate users.'
          : rateLimited > 0
            ? 'Rate limiting throttles requests beyond the simulated-window threshold before per-account lockout.'
            : 'Attempts fail without successful authentication; inspect per-account and time-based counters.'
    }
  };
}

export function simulateOfflineCost(budget: GuessBudget): OfflineProfileResult[] | null {
  if (!VALID_GUESS_BUDGETS.includes(budget)) return null;
  return [
    {
      id: 'fast',
      algorithm: 'fast-hash fixture (illustrative)',
      fingerprint: 'fixture-fingerprint-fast-01',
      saltLabel: 'none',
      unitsPerGuess: 1,
      budget,
      totalUnits: budget,
      sampleFound: budget >= 100,
      explanation: {
        it: 'Il campione sintetico debole è collocato al candidato didattico 30: non rientra nel budget 10 ma rientra in 100.',
        en: 'The weak synthetic sample is placed at educational candidate 30: it is outside budget 10 and inside budget 100.'
      }
    },
    {
      id: 'kdf',
      algorithm: 'Argon2id KDF fixture (illustrative profile)',
      fingerprint: 'fixture-fingerprint-kdf-02',
      saltLabel: 'fixture-salt-unique-02',
      unitsPerGuess: 100,
      budget,
      totalUnits: budget * 100,
      sampleFound: false,
      explanation: {
        it: 'Il campione sintetico protetto non rientra nei budget didattici; sale unico e fattore di lavoro sono proprietà distinte.',
        en: 'The hardened synthetic sample is outside the educational budgets; a unique salt and work factor are separate properties.'
      }
    }
  ];
}

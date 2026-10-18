/**
 * EJPT-06 deterministic web-application fixture. It records illustrative HTTP
 * exchanges only: no fetch, socket, credentials, payload, or external endpoint exists.
 */
import type { Bilingual } from '../types';

export const WEB_LAB_SCOPE = {
  host: 'portal.demo.example.test',
  address: '192.0.2.80/32',
  authorization: {
    it: 'Scope limitato alle fixture statiche incluse nell’app e all’indirizzo documentale 192.0.2.80/32. Non autorizza test su altri sistemi.',
    en: 'Scope is limited to static fixtures bundled in the app and documentation address 192.0.2.80/32. It does not authorize testing other systems.'
  } satisfies Bilingual,
  rules: {
    it: 'Le richieste e risposte sono record in memoria, non HTTP reale. Nessun endpoint, file, account o servizio esterno viene contattato.',
    en: 'Requests and responses are in-memory records, not real HTTP. No external endpoint, file, account, or service is contacted.'
  } satisfies Bilingual
} as const;

export type WebEvidence = {
  id: string;
  title: Bilingual;
  request: string;
  response: string;
  observation: Bilingual;
};

export type WebRegression = { id: 'login-rate-limit' | 'object-authorization'; passed: boolean };

export type WebLabState = {
  authorized: boolean;
  pathsDiscovered: boolean;
  loginAttempts: number;
  loginBlocked: boolean;
  rateLimitFixed: boolean;
  objectAuthorizationFixed: boolean;
  profileStatus: 200 | 403 | null;
  evidence: WebEvidence[];
  regressionResults: WebRegression[];
};

export const createWebLabState = (): WebLabState => ({
  authorized: false,
  pathsDiscovered: false,
  loginAttempts: 0,
  loginBlocked: false,
  rateLimitFixed: false,
  objectAuthorizationFixed: false,
  profileStatus: null,
  evidence: [],
  regressionResults: []
});

export function confirmWebLabScope(state: WebLabState): WebLabState {
  return { ...state, authorized: true, evidence: [], regressionResults: [] };
}

export function inspectWebFixture(state: WebLabState): WebLabState {
  if (!state.authorized) return state;
  return appendEvidence(state, {
    id: 'http-recon',
    title: { it: 'Ricognizione HTTP', en: 'HTTP reconnaissance' },
    request: 'GET / HTTP/1.1\nHost: portal.demo.example.test\nAccept: text/html',
    response:
      'HTTP/1.1 200 OK\nServer: DemoPortal/1.0-lab\nSet-Cookie: sid=fixture; HttpOnly; SameSite=Lax\nStrict-Transport-Security: max-age=31536000\nContent-Security-Policy: (missing)',
    observation: {
      it: 'Fixture: il banner è informativo; il flag Secure del cookie di sessione e la CSP risultano assenti. Verifica il rischio nel contesto HTTPS e della policy applicativa.',
      en: 'Fixture: the banner is informational; the session cookie Secure flag and CSP are absent. Assess the risk in the context of HTTPS and the application policy.'
    }
  });
}

export function discoverWebFixturePaths(state: WebLabState): WebLabState {
  if (!state.authorized) return state;
  const next = appendEvidence(state, {
    id: 'content-discovery',
    title: { it: 'Content discovery fixture', en: 'Fixture content discovery' },
    request: 'GET /robots.txt, /admin/, /.git/HEAD, /backup/ HTTP/1.1\nHost: portal.demo.example.test',
    response:
      '200 /robots.txt → Disallow: /admin/ (path hint only)\n401 /admin/ → authentication required\n404 /.git/HEAD\n404 /backup/',
    observation: {
      it: 'La fixture rivela un percorso da controllare ma non espone file segreti. Un hint non prova una vulnerabilità: convalida ownership, esposizione e autorizzazione.',
      en: 'The fixture reveals a path to review but exposes no secret files. A hint is not proof of a vulnerability: validate ownership, exposure, and authorization.'
    }
  });
  return { ...next, pathsDiscovered: true };
}

export function submitFixtureLoginAttempt(state: WebLabState): WebLabState {
  if (!state.authorized || state.loginBlocked) return state;
  const attempt = state.loginAttempts + 1;
  const limit = state.rateLimitFixed ? 3 : Number.POSITIVE_INFINITY;
  const blocked = attempt > limit;
  const next: WebLabState = {
    ...state,
    loginAttempts: blocked ? state.loginAttempts : attempt,
    loginBlocked: blocked,
    regressionResults: []
  };
  return appendEvidence(next, {
    id: `login-attempt-${attempt}`,
    title: { it: 'Tentativo login sintetico', en: 'Synthetic login attempt' },
    request:
      'POST /login HTTP/1.1\nHost: portal.demo.example.test\nContent-Type: application/json\nBody: [fixture values redacted]',
    response: blocked
      ? 'HTTP/1.1 429 Too Many Requests\nRetry-After: 60 (fixture seconds)'
      : 'HTTP/1.1 401 Unauthorized',
    observation: {
      it: blocked
        ? 'Il controllo di frequenza blocca il tentativo successivo alla soglia fixture; il tempo è simulato e non viene attesa una pausa reale.'
        : 'Risposta fixture: credenziale non valida. Nessuna password o coppia di credenziali è inserita, memorizzata o verificata.',
      en: blocked
        ? 'The rate control blocks the attempt after the fixture threshold; time is simulated and no real delay occurs.'
        : 'Fixture response: invalid credential. No password or credential pair is entered, stored, or checked.'
    }
  });
}

export function inspectOtherFixtureProfile(state: WebLabState): WebLabState {
  if (!state.authorized) return state;
  const status = state.objectAuthorizationFixed ? 403 : 200;
  const next = appendEvidence(
    { ...state, profileStatus: status, regressionResults: [] },
    {
      id: `object-authorization-${status}`,
      title: { it: 'Controllo accessi oggetto', en: 'Object-level access control' },
      request: 'GET /api/profile/fixture-user-02 HTTP/1.1\nHost: portal.demo.example.test\nCookie: sid=fixture-user-01',
      response:
        status === 200
          ? 'HTTP/1.1 200 OK\nContent-Type: application/json\nBody: {"displayName":"Fixture User 02","role":"viewer"}'
          : 'HTTP/1.1 403 Forbidden\nContent-Type: application/json\nBody: {"error":"forbidden"}',
      observation: {
        it:
          status === 200
            ? 'Difetto di autorizzazione a livello oggetto (IDOR/BOLA): la sessione fixture user-01 legge un oggetto user-02. L’autenticazione non sostituisce il controllo ownership per ogni richiesta.'
            : 'La fixture nega l’oggetto non posseduto. Risposta 403 è una scelta didattica; una policy può usare 404 per evitare di rivelare l’esistenza della risorsa.',
        en:
          status === 200
            ? 'Broken object-level authorization (IDOR/BOLA): fixture user-01 reads a user-02 object. Authentication does not replace an ownership check on each request.'
            : 'The fixture denies the unowned object. 403 is a teaching choice; a policy may use 404 to avoid disclosing resource existence.'
      }
    }
  );
  return next;
}

export function applyWebFixtureRemediations(state: WebLabState): WebLabState {
  if (!state.authorized) return state;
  return {
    ...state,
    rateLimitFixed: true,
    objectAuthorizationFixed: true,
    loginAttempts: 0,
    loginBlocked: false,
    profileStatus: null,
    regressionResults: []
  };
}

export function runWebFixtureRegressions(state: WebLabState): WebLabState {
  if (!state.authorized) return state;
  let fixture: WebLabState = {
    ...state,
    loginAttempts: 0,
    loginBlocked: false,
    profileStatus: null,
    evidence: [...state.evidence],
    regressionResults: []
  };
  for (let attempt = 0; attempt < 4; attempt += 1) fixture = submitFixtureLoginAttempt(fixture);
  fixture = inspectOtherFixtureProfile(fixture);
  const rateLimitPasses = fixture.rateLimitFixed && fixture.loginBlocked && fixture.loginAttempts === 3;
  const accessPasses = fixture.objectAuthorizationFixed && fixture.profileStatus === 403;
  return {
    ...fixture,
    regressionResults: [
      { id: 'login-rate-limit', passed: rateLimitPasses },
      { id: 'object-authorization', passed: accessPasses }
    ]
  };
}

export function resetWebLab(state: WebLabState): WebLabState {
  return { ...createWebLabState(), authorized: state.authorized };
}

function appendEvidence(state: WebLabState, evidence: WebEvidence): WebLabState {
  return { ...state, evidence: [...state.evidence, evidence] };
}

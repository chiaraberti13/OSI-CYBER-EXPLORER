# CONTENT-13 — Cracking offline degli hash in ottica difensiva (eJPT)

17 ottobre 2026. Baseline `main` HEAD `9c17f12` (dopo CONTENT-15). Checkout
pulito. Intervento: completare il task del backlog **CONTENT-13 (P3)** —
approfondire il cracking offline dal lato della difesa della memorizzazione,
bilingue e verificato.

## Cosa è stato aggiunto

### Manuale (`src/content/studyManual.ts`) — 1 nuovo argomento (95 → 96)

| Capitolo (track)             | Nuovo argomento                                        |
| ---------------------------- | ------------------------------------------------------ |
| `pentest-methodology` (eJPT) | Cracking offline degli hash: modello di costo e difesa |

L'argomento `offline-hash-cracking-defense` è collocato dopo «Attacchi alle
password: brute force e spraying», di cui è il complemento **senza ridondanza**:
il precedente tratta le strategie d'attacco e le difese di account (MFA,
lockout, rilevamento dello spraying); questo tratta il **modello di costo del
cracking offline** e la **difesa della memorizzazione**. Copre:

- **Perché l'offline funziona**: l'attaccante lavora su un hash catturato, senza
  rate limiting né log; il costo è «numero di tentativi × costo di un hash», e
  ogni difesa agisce su uno dei due fattori.
- **L'algoritmo di memorizzazione decide**: hash veloci e generici (MD5/SHA-1
  nudi, miliardi/s su GPU) vs KDF lente con fattore di lavoro regolabile
  (bcrypt, scrypt, Argon2, PBKDF2); il **sale** per-utente che annulla la
  precomputazione (rainbow table) e rende diversi gli hash di password uguali;
  il **pepper** tenuto fuori dal database.
- **Budget a due fattori**: entropia della password × fattore di lavoro della
  KDF; nessuno dei due basta da solo (KDF lenta su password debole cade;
  password forte su hash veloce e senza sale cade alla precomputazione).

Taglio difensivo: **nessun comando di cracking**, nessun tool, soli target di
documentazione. Riferimenti risolti in HTTPS: NIST **SP 800-63B** (memorized
secret verifiers, `https://csrc.nist.gov/pubs/sp/800/63/b/final`) e ATT&CK
**T1110.002** (Brute Force: Password Cracking,
`https://attack.mitre.org/techniques/T1110/002/`). OWASP (citato come esempio
nel criterio del backlog) non è tra i tipi `SecurityReference`
(`rfc|ieee|nist|attack|cisco`), quindi non è stato aggiunto come riferimento
strutturato per non introdurre una URL fuori dalle autorità approvate.

Teoria-only: nessun laboratorio interattivo adeguato. Nessun nuovo capitolo
eJPT. Conteggi derivati dal dataset (ENG-31): `manualStats()` → **29 capitoli /
96 argomenti / 77 laboratori guidati**.

## Revisione IT/EN (I18N-10)

Parità di acronimi e cifre curata: MD5, SHA-1, bcrypt, scrypt, Argon2, PBKDF2,
GPU, ASIC, HSM. Le stringhe EN rispecchiano le IT senza divergenze; accuratezza
tecnica e naturalezza riviste (es. «work factor», «per-user salt», «rainbow
table», «precomputation»).

## Verifiche

- `npm run typecheck`, `npm run lint`, `npm run format:check`: **puliti**.
- Integrità del manuale (`src/lib/studyManual.test.ts`): **verde** — id unico,
  campi non vuoti, riferimenti risolti in HTTPS, guard «ogni argomento ha ≥1
  riferimento» (96/96), parità IT/EN, rotta eJPT invariata ai tre capitoli.
- Guard bilingue (`src/lib/content.test.ts`): **verde** — contatore anti no-op
  rispettato (96 argomenti).
- `npm run verify` completo: **superato** — build e tutti i gate (lockfile,
  release, deployment-security, repository-posture, documentation-targets,
  offensive-content, technical-content, design-system, accessibility-release,
  format, typecheck, lint, test:coverage, performance).
- E2E Playwright/Chromium con Axe WCAG 2.2 AA: **superati**.
- `size-limit` / budget performance: entry **122,9 kB** gzip < 125 kB.
- `npm audit --omit=dev`: **0 vulnerabilità**.

## Esito

CONTENT-13 **completato** e verificato: incremento verticale verde,
difensivo/neutro, senza nuovi capitoli eJPT. Chiude il gruppo «Contenuti da
aggiungere» del backlog (CONTENT-11/12/13); resta aperta la sola **VIS-13** (P3).

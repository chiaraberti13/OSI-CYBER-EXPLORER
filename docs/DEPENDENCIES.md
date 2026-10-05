# Dependency policy

<p align="center"><a href="#-english">🇬🇧 English</a> · <a href="#-italiano">🇮🇹 Italiano</a></p>

---

## 🇬🇧 English

### Runtime
- Supported Node.js versions are declared once in `package.json#engines` (`^22.22.2 || ^24.15.0 || >=26.0.0`); `.nvmrc` pins the recommended LTS (24).
- `.npmrc` sets `engine-strict=true`: installing on an unsupported Node.js version fails immediately instead of producing results that differ from CI.
- CI runs the same checks on the lowest supported line (`22.22.x`) and on the recommended LTS (`24.x`).

### Installing
- Use `npm ci --ignore-scripts`, locally and in CI. It installs exactly what `package-lock.json` records, fails if the lockfile and `package.json` disagree and does not execute dependency lifecycle scripts.
- Run `npm run verify:lockfile:bootstrap` before installing. This zero-dependency check rejects non-HTTPS or unexpected registries, missing tarball URLs, non-SHA512 integrity values and unsupported lockfile structures before third-party code is available.
- Use `npm install <package>` only when you intend to add or update a dependency.
- `npm run verify` runs both lockfile checks, type-check, lint, tests with blocking logic coverage and build: the same sequence as CI. See [TEST_COVERAGE.md](TEST_COVERAGE.md#english) for scope, thresholds and reports.

Dependency lifecycle scripts are disabled globally by `.npmrc`. The current lockfile contains no required install script: only the optional macOS package `fsevents` declares one. If a future dependency genuinely needs a lifecycle script, document and review a narrow allowlist before enabling it.

### Changing dependencies
- Lockfile changes go in a **dedicated pull request** that contains only `package.json`/`package-lock.json` and the minimal code needed to keep the build green. Review it by reading the lockfile diff, not only the `package.json` diff.
- Never run `npm audit fix --force` without reviewing the resulting major upgrades.
- Never hand-edit resolved versions or integrity hashes in `package-lock.json`.
- `npm run lint:lockfile` uses `lockfile-lint` to require the npm registry over HTTPS, valid package names and integrity metadata. Keep the zero-dependency bootstrap validator too: unlike an installed linter, it can reject a tampered lockfile before `npm ci` downloads anything.
- Dependabot waits 3 days for patches, 7 days for minor updates and 14 days for major npm updates; GitHub Actions updates wait 7 days. GitHub security updates are not delayed by this cooldown.

### Audit policy
The shipped bundle only contains the `dependencies` (`react`, `react-dom`, `zustand`, `motion`, `lucide-react`); `devDependencies` run on developer machines and in CI but never reach users. The two are therefore audited separately:

| Scope | Command | In CI | Why |
|---|---|---|---|
| Runtime (`dependencies`) | `npm run audit:runtime` | **blocking** on High/Critical | code that reaches the browser |
| Full toolchain | `npm run audit:full` | **blocking** on High/Critical | build and test dependencies execute on developer machines and CI |
| Runtime signatures and provenance | `npm run audit:signatures:runtime` | **blocking** | registry signatures and attestations for shipped dependencies |
| Full signature inventory | `npm run audit:signatures:full` | **informational** | currently exposes registry-side attestation availability without hiding a runtime failure |

A new High/Critical advisory must be fixed before merging. A temporary exception requires a versioned entry in `.github/security-exceptions.yml`, including owner, reason, compensating control and expiry date, plus the matching scanner configuration described in `docs/SECURITY_SCANNING.md`.

---

## 🇮🇹 Italiano

### Runtime
- Le versioni di Node.js supportate sono dichiarate una sola volta in `package.json#engines` (`^22.22.2 || ^24.15.0 || >=26.0.0`); `.nvmrc` indica la LTS consigliata (24).
- `.npmrc` imposta `engine-strict=true`: un'installazione su una versione di Node.js non supportata fallisce subito, invece di produrre risultati diversi dalla CI.
- La CI esegue gli stessi controlli sulla versione minima supportata (`22.22.x`) e sulla LTS consigliata (`24.x`).

### Installazione
- Usare `npm ci --ignore-scripts`, in locale e in CI: installa esattamente ciò che è registrato in `package-lock.json`, fallisce se lockfile e `package.json` non coincidono e non esegue i lifecycle script delle dipendenze.
- Eseguire `npm run verify:lockfile:bootstrap` prima dell'installazione. Questo controllo senza dipendenze rifiuta registry non HTTPS o inattesi, URL dei tarball mancanti, integrità diversa da SHA-512 e strutture lockfile non supportate prima che sia disponibile codice di terze parti.
- Usare `npm install <pacchetto>` solo quando si vuole aggiungere o aggiornare una dipendenza.
- `npm run verify` esegue entrambi i controlli del lockfile, type-check, lint, test con coverage bloccante della logica e build: la stessa sequenza della CI. Ambito, soglie e report sono descritti in [TEST_COVERAGE.md](TEST_COVERAGE.md#italiano).

I lifecycle script delle dipendenze sono disabilitati globalmente da `.npmrc`. Il lockfile attuale non contiene script necessari all'installazione: soltanto il pacchetto macOS opzionale `fsevents` ne dichiara uno. Se una dipendenza futura ne avrà realmente bisogno, prima di abilitarlo andrà documentata e revisionata un'allowlist ristretta.

### Modificare le dipendenze
- Le modifiche al lockfile vanno in una **pull request dedicata**, che contenga solo `package.json`/`package-lock.json` e il codice minimo necessario a mantenere la build verde. La revisione si fa leggendo il diff del lockfile, non solo quello di `package.json`.
- Non eseguire mai `npm audit fix --force` senza revisionare gli aggiornamenti major che produce.
- Non modificare a mano versioni risolte o hash di integrità in `package-lock.json`.
- `npm run lint:lockfile` usa `lockfile-lint` per imporre registry npm via HTTPS, nomi dei pacchetti validi e metadati di integrità. Va mantenuto anche il validatore bootstrap senza dipendenze: diversamente da un linter installato, può rifiutare un lockfile manomesso prima che `npm ci` scarichi qualsiasi pacchetto.
- Dependabot attende 3 giorni per le patch, 7 giorni per gli aggiornamenti minor e 14 giorni per i major npm; gli aggiornamenti delle GitHub Actions attendono 7 giorni. Gli aggiornamenti di sicurezza GitHub non subiscono questo cooldown.

### Policy di audit
Il bundle distribuito contiene solo le `dependencies` (`react`, `react-dom`, `zustand`, `motion`, `lucide-react`); le `devDependencies` girano sulle macchine di sviluppo e in CI ma non arrivano mai agli utenti. Per questo vengono verificate separatamente:

| Ambito | Comando | In CI | Motivo |
|---|---|---|---|
| Runtime (`dependencies`) | `npm run audit:runtime` | **bloccante** su High/Critical | codice che arriva al browser |
| Toolchain completa | `npm run audit:full` | **bloccante** su High/Critical | le dipendenze di build e test vengono eseguite sulle macchine di sviluppo e in CI |
| Firme e provenienza runtime | `npm run audit:signatures:runtime` | **bloccante** | firme del registry e attestazioni delle dipendenze distribuite |
| Inventario completo delle firme | `npm run audit:signatures:full` | **informativo** | rende visibili problemi di disponibilità delle attestazioni lato registry senza nascondere un errore runtime |

Un nuovo advisory High/Critical va corretto prima del merge. Un'eccezione temporanea richiede una voce versionata in `.github/security-exceptions.yml`, con responsabile, motivazione, controllo compensativo e scadenza, oltre alla configurazione dello scanner descritta in `docs/SECURITY_SCANNING.md`.

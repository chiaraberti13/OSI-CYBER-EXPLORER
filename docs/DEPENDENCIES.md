# Dependency policy

<p align="center"><a href="#-english">🇬🇧 English</a> · <a href="#-italiano">🇮🇹 Italiano</a></p>

---

## 🇬🇧 English

### Runtime
- Supported Node.js versions are declared once in `package.json#engines` (`^22.22.2 || ^24.15.0 || >=26.0.0`); `.nvmrc` pins the recommended LTS (24).
- `.npmrc` sets `engine-strict=true`: installing on an unsupported Node.js version fails immediately instead of producing results that differ from CI.
- CI runs the same checks on the lowest supported line (`22.22.x`) and on the recommended LTS (`24.x`).

### Installing
- Use `npm ci`, locally and in CI. It installs exactly what `package-lock.json` records and fails if the lockfile and `package.json` disagree.
- Use `npm install <package>` only when you intend to add or update a dependency.
- `npm run verify` runs type-check, lint, tests and build: the same sequence as CI.

### Changing dependencies
- Lockfile changes go in a **dedicated pull request** that contains only `package.json`/`package-lock.json` and the minimal code needed to keep the build green. Review it by reading the lockfile diff, not only the `package.json` diff.
- Never run `npm audit fix --force` without reviewing the resulting major upgrades.
- Never hand-edit resolved versions or integrity hashes in `package-lock.json`.

### Audit policy
The shipped bundle only contains the `dependencies` (`react`, `react-dom`, `zustand`, `motion`, `lucide-react`); `devDependencies` run on developer machines and in CI but never reach users. The two are therefore audited separately:

| Scope | Command | In CI | Why |
|---|---|---|---|
| Runtime (`dependencies`) | `npm run audit:runtime` | **blocking** on High/Critical | code that reaches the browser |
| Full toolchain | `npm run audit:full` | report only | tracked in `ROADMAP.md` (SEC-01) until the current advisories are fixed; it becomes blocking with SEC-06 |

A new High/Critical advisory in a runtime dependency must be fixed, or documented with a reason and an expiry date, before merging.

---

## 🇮🇹 Italiano

### Runtime
- Le versioni di Node.js supportate sono dichiarate una sola volta in `package.json#engines` (`^22.22.2 || ^24.15.0 || >=26.0.0`); `.nvmrc` indica la LTS consigliata (24).
- `.npmrc` imposta `engine-strict=true`: un'installazione su una versione di Node.js non supportata fallisce subito, invece di produrre risultati diversi dalla CI.
- La CI esegue gli stessi controlli sulla versione minima supportata (`22.22.x`) e sulla LTS consigliata (`24.x`).

### Installazione
- Usare `npm ci`, in locale e in CI: installa esattamente ciò che è registrato in `package-lock.json` e fallisce se lockfile e `package.json` non coincidono.
- Usare `npm install <pacchetto>` solo quando si vuole aggiungere o aggiornare una dipendenza.
- `npm run verify` esegue type-check, lint, test e build: la stessa sequenza della CI.

### Modificare le dipendenze
- Le modifiche al lockfile vanno in una **pull request dedicata**, che contenga solo `package.json`/`package-lock.json` e il codice minimo necessario a mantenere la build verde. La revisione si fa leggendo il diff del lockfile, non solo quello di `package.json`.
- Non eseguire mai `npm audit fix --force` senza revisionare gli aggiornamenti major che produce.
- Non modificare a mano versioni risolte o hash di integrità in `package-lock.json`.

### Policy di audit
Il bundle distribuito contiene solo le `dependencies` (`react`, `react-dom`, `zustand`, `motion`, `lucide-react`); le `devDependencies` girano sulle macchine di sviluppo e in CI ma non arrivano mai agli utenti. Per questo vengono verificate separatamente:

| Ambito | Comando | In CI | Motivo |
|---|---|---|---|
| Runtime (`dependencies`) | `npm run audit:runtime` | **bloccante** su High/Critical | codice che arriva al browser |
| Toolchain completa | `npm run audit:full` | solo report | tracciato in `ROADMAP.md` (SEC-01) finché gli advisory attuali non sono corretti; diventa bloccante con SEC-06 |

Un nuovo advisory High/Critical in una dipendenza runtime va corretto, oppure documentato con motivazione e scadenza, prima del merge.

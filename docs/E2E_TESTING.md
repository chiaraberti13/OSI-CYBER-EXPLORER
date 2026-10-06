# End-to-end smoke tests · Smoke test end-to-end (ENG-12)

> Playwright drives a real Chromium browser against the production bundle. These
> tests complement — they do not replace — the Vitest unit and component suites.

---

## English

### Scope

The end-to-end suite is a **smoke suite**: it proves the app boots and its core
flows work end to end, not every edge case (those live in the Vitest logic and
component tests). It runs against the **production build** served by
`vite preview`, so it exercises the same lazy chunks, hash routing and
CSP-compatible assets that ship to users.

Covered flows (`e2e/`):

| File | Flow |
|---|---|
| `app-shell.spec.ts` | First load; IT↔EN language toggle (and `<html lang>`); `Ctrl+K` quick search opened and driven entirely by keyboard (type → ArrowDown → Enter); `Escape` closes search; deep links, reload and an unknown route canonicalised to `#/osi`; browser Back/Forward; a lab reachable from the compact menu at 390 px. |
| `labs.spec.ts` | OSI packet simulation start → pause → resume → reset; live IPv4 subnet calculation; VLSM re-planning when the base block changes; STP convergence with root election and the 16↔32-bit cost standard; opening a lab from the navigation menu. |

Only **Chromium** runs for now. Firefox and WebKit are added once the suite has
proven stable in CI (ENG-12 exit criterion).

### Running locally

```bash
npm ci
npx playwright install chromium   # one-time; downloads the pinned browser
npm run test:e2e                  # builds, serves with vite preview, runs Chromium
npm run test:e2e:report           # opens the last HTML report
```

`playwright.config.ts` owns the web server: it runs `npm run build && npm run
preview` on `127.0.0.1:4173` and waits for it before the first test. In a managed
cloud/dev environment where Chromium is pre-installed at
`/opt/pw-browsers/chromium`, the config launches that build directly and no
download is needed.

### CI

`.github/workflows/e2e.yml` runs the suite on every push to `main` and every PR,
in a workflow **separate** from the unit/build matrix so the browser install
stays isolated and the fast build job is unaffected. It pins actions to SHAs,
installs with `npm ci --ignore-scripts`, enforces the lockfile policy, installs
only the pinned Chromium with its OS dependencies, runs the suite and uploads the
HTML report as an artifact.

### Conventions

- Specs use the `.spec.ts` extension under `e2e/`, outside `src/`, so **Vitest
  never picks them up** (its `include` is `src/**/*.test.{ts,tsx}`).
- Prefer accessible selectors (`getByRole`, `getByLabel`) and user-visible text
  over CSS classes, so a test fails only when behaviour changes.
- Keep interactions **deterministic**: pause timer-driven UI before asserting,
  and assert computed output that follows directly from the input.
- The SEC-10 unsafe-DOM-sink ESLint guardrails still apply to the specs; only the
  component and persistence restrictions are relaxed (Node harness code).

---

## Italiano

### Ambito

La suite end-to-end è una **suite di smoke test**: dimostra che l'app si avvia e
che i flussi principali funzionano end to end, non ogni caso limite (quelli sono
coperti dai test di logica e componenti Vitest). Gira contro la **build di
produzione** servita da `vite preview`, così da esercitare gli stessi lazy chunk,
hash routing e asset compatibili con la CSP che arrivano all'utente.

Flussi coperti (`e2e/`):

| File | Flusso |
|---|---|
| `app-shell.spec.ts` | Primo caricamento; toggle lingua IT↔EN (e `<html lang>`); ricerca rapida `Ctrl+K` aperta e guidata interamente da tastiera (digita → ArrowDown → Invio); `Escape` chiude la ricerca; deep link, reload e rotta sconosciuta canonicalizzata su `#/osi`; Back/Forward del browser; un laboratorio raggiungibile dal menu compatto a 390 px. |
| `labs.spec.ts` | Simulazione del pacchetto OSI avvio → pausa → ripresa → reset; calcolo IPv4 live; ri-pianificazione VLSM al cambio del blocco di base; convergenza STP con elezione della root e standard di costo 16↔32 bit; apertura di un lab dal menu di navigazione. |

Per ora gira solo **Chromium**. Firefox e WebKit verranno aggiunti dopo che la
suite si sarà dimostrata stabile in CI (criterio di uscita di ENG-12).

### Esecuzione locale

```bash
npm ci
npx playwright install chromium   # una tantum; scarica il browser fissato
npm run test:e2e                  # build, preview con vite, esecuzione su Chromium
npm run test:e2e:report           # apre l'ultimo report HTML
```

`playwright.config.ts` possiede il web server: esegue `npm run build && npm run
preview` su `127.0.0.1:4173` e lo attende prima del primo test. In un ambiente
cloud/dev gestito in cui Chromium è preinstallato in `/opt/pw-browsers/chromium`,
la configurazione avvia direttamente quella build senza alcun download.

### CI

`.github/workflows/e2e.yml` esegue la suite a ogni push su `main` e a ogni PR, in
un workflow **separato** dalla matrice unit/build per isolare l'installazione del
browser e non rallentare il job di build. Fissa le action a SHA, installa con
`npm ci --ignore-scripts`, applica la policy del lockfile, installa solo il
Chromium fissato con le relative dipendenze di sistema, esegue la suite e carica
il report HTML come artifact.

### Convenzioni

- Gli spec usano l'estensione `.spec.ts` in `e2e/`, fuori da `src/`, così **Vitest
  non li raccoglie mai** (il suo `include` è `src/**/*.test.{ts,tsx}`).
- Preferire selettori accessibili (`getByRole`, `getByLabel`) e testo visibile
  dall'utente alle classi CSS, così un test fallisce solo quando cambia il
  comportamento.
- Mantenere le interazioni **deterministiche**: mettere in pausa la UI guidata da
  timer prima delle asserzioni e verificare output calcolati che discendono
  direttamente dall'input.
- I guardrail ESLint SEC-10 sui sink DOM non sicuri valgono anche per gli spec;
  sono rilassate solo le restrizioni su componenti e persistenza (codice harness
  Node).

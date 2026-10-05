# Test coverage — ENG-11

<p align="center"><a href="#italiano">🇮🇹 Italiano</a> · <a href="#english">🇬🇧 English</a></p>

## Italiano

`npm run test:coverage` esegue tutta la suite Vitest con il provider V8 e fallisce se i test o una soglia non passano. `npm run verify` usa lo stesso comando prima della build; `npm test` resta disponibile per eseguire rapidamente la suite senza instrumentation.

La misura comprende **tutti i moduli di produzione `src/lib/**/*.{ts,tsx}`, anche quelli mai importati dai test**. Esclude test, specifiche e dichiarazioni di tipi. UI, store e grandi dataset didattici restano fuori dal denominatore di questo gate; i rispettivi test continuano a essere eseguiti. La coverage misura i percorsi eseguiti, mentre le asserzioni e i controlli dei contenuti verificano il comportamento e la correttezza didattica.

### Baseline e soglie

Misura del 5 ottobre 2026: 24 moduli, Node 24.19.0, Vitest e `@vitest/coverage-v8` 5.0.1. Prima della configurazione delle soglie, il report ha individuato percorsi non coperti del simulatore e del retry dei chunk. Sono stati aggiunti test per i sette protocolli in IT/EN, porte e PDU, esito della difesa, fasi inattive, reset e backoff con timer simulati.

| Metrica | Prima | Baseline finale | Minimo aggregato | Minimo per ogni modulo |
|---|---:|---:|---:|---:|
| Righe | 93,97% | 97,58% (1214/1244) | 95% | 80% |
| Istruzioni | 92,19% | 95,21% (1452/1525) | 92% | 80% |
| Rami | 88,11% | 91,87% (1198/1304) | 90% | 70% |
| Funzioni | 99,19% | 99,59% (248/249) | 98% | 90% |

Le soglie aggregate lasciano un margine rispetto alla baseline misurata. I minimi per modulo impediscono che file molto coperti nascondano una nuova funzione o un intero modulo senza test. I moduli piccoli hanno percentuali più sensibili al singolo ramo: `navigation.ts` parte dal 75% sui rami; `osi.ts` dall'87,5% sulle righe; `simulation.ts` dal 90% sulle funzioni. Non sono previste eccezioni per file né aggiornamenti automatici delle soglie.

`vitest.config.ts` è la fonte delle soglie ed è protetto da CODEOWNERS. Quando la copertura migliora, aumentare i minimi con una modifica esplicita; quando un gate fallisce, leggere le righe scoperte e aggiungere asserzioni su comportamenti reali. Aggiornare insieme runner e provider V8, che richiedono la stessa versione, rigenerando il lockfile senza abilitare lifecycle script.

### Report locali e CI

```bash
npm test                 # suite completa, senza coverage
npm run test:coverage    # suite completa, report e soglie bloccanti
npm run verify           # tutti i gate, coverage e build
```

Vitest scrive in `coverage/`, ignorata da git e ripulita a ogni esecuzione:

- `index.html` e relativi asset: report navigabile per modulo e righe/rami scoperti;
- `lcov.info`: report interoperabile con editor e strumenti di analisi;
- `coverage-summary.json`: conteggi e percentuali aggregate e per modulo;
- tabella testuale nel log del comando.

La CI esegue il gate su Node `22.22.x` e `24.x`, pubblica una tabella nel riepilogo di ogni job e conserva i report completi per 14 giorni negli artifact `coverage-node-22.22.x` e `coverage-node-24.x`. `reportOnFailure: true` e gli step di pubblicazione condizionali conservano i report anche se falliscono test o soglie; l'errore resta bloccante e impedisce la build. Gli artifact non sono versionati nel repository.

Per controllare manualmente il gate senza modificare la configurazione:

```bash
npm run test:coverage -- --coverage.thresholds.lines=100
```

Con questa baseline i test passano, il comando termina con errore sulle righe sotto il 100% e i report sono disponibili. Eseguire poi il comando normale per ripristinare i report della configurazione versionata. ENG-11 è stato verificato anche aggiungendo temporaneamente un modulo mai importato (coverage 0%, gate per modulo fallito) e un test fallente (report comunque generati); entrambe le fixture sono state rimosse.

## English

`npm run test:coverage` runs the entire Vitest suite with the V8 provider and fails when tests or any threshold fail. `npm run verify` uses the same command before building; `npm test` remains the faster, uninstrumented suite.

The gate measures **all production `src/lib/**/*.{ts,tsx}` modules, including files never imported by tests**. Tests, specs and type declarations are excluded. UI, store and large educational datasets are outside this denominator; their tests still run. Coverage measures executed paths; assertions and content checks establish behavior and educational correctness.

### Baseline and thresholds

Measured on 5 October 2026: 24 modules, Node 24.19.0, Vitest and `@vitest/coverage-v8` 5.0.1. The initial report exposed missing simulator protocol journeys and chunk retry timing. Added assertions cover all seven protocols in both languages, service ports and PDUs, defense outcomes, inactive phases, reset and backoff with fake timers.

| Metric | Before | Final baseline | Aggregate minimum | Minimum for every module |
|---|---:|---:|---:|---:|
| Lines | 93.97% | 97.58% (1214/1244) | 95% | 80% |
| Statements | 92.19% | 95.21% (1452/1525) | 92% | 80% |
| Branches | 88.11% | 91.87% (1198/1304) | 90% | 70% |
| Functions | 99.19% | 99.59% (248/249) | 98% | 90% |

Aggregate thresholds leave room below the measured baseline. Per-module minima prevent highly covered files from masking an untested function or module. Small modules are more sensitive to a single uncovered path: `navigation.ts` starts at 75% branches, `osi.ts` at 87.5% lines and `simulation.ts` at 90% functions. There are no per-file exceptions or automatic threshold updates.

`vitest.config.ts` owns the thresholds and is protected by CODEOWNERS. Raise minima explicitly as coverage improves; investigate uncovered paths and add behavioral assertions when a gate fails. Update the Vitest runner and V8 provider together: their versions must match. Regenerate the lockfile with dependency lifecycle scripts disabled.

### Local and CI reports

```bash
npm test                 # full suite without coverage
npm run test:coverage    # full suite, reports and blocking thresholds
npm run verify           # all gates, coverage and build
```

Git ignores `coverage/`, and Vitest cleans it before each run. It contains the navigable HTML report (`index.html` and assets), `lcov.info` and `coverage-summary.json` with aggregate and per-module counts. The command also prints a coverage table.

CI runs the gate on Node `22.22.x` and `24.x`, adds a table to each job summary and retains full reports for 14 days as `coverage-node-22.22.x` and `coverage-node-24.x`. `reportOnFailure: true` and conditional publishing steps preserve diagnostics after failing tests or thresholds. Failures remain blocking and prevent the build. Reports are not committed.

To check the failure path without editing the configuration, run `npm run test:coverage -- --coverage.thresholds.lines=100`. With this baseline tests pass, the command fails below 100% lines and reports remain available. Run the normal command afterward to restore the configured reports. ENG-11 also verified an unimported temporary module (0% coverage, per-module gate failure) and an intentionally failing temporary test (reports still generated); both fixtures were removed.

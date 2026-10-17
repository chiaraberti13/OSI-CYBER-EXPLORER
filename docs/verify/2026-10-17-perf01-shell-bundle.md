# PERF-01 — Riduzione del bundle JavaScript dello shell

17 ottobre 2026. Branch di lavoro riallineato a `main` (`e5962ca`). L'entry
JavaScript gzip era a **122.911 B** rispetto al limite di **125.000 B**: solo
2.089 B di margine. Il task evolutivo PERF-01 era il primo intervento utile
aperto nella roadmap.

## Causa verificata

La treemap Vite ha mostrato `studyManual.ts` nell'entry: il parser degli URL,
lo store, la sanitizzazione delle preferenze e i link di ritorno dai laboratori
importavano il manuale bilingue completo solo per validare ID o recuperare
titoli e relazioni lab. L'entry incorporava inoltre Motion per le transizioni
dello shell e per la barra superiore. La regressione non dipendeva dalla
crescita dei contenuti didattici in sé, ma dai riferimenti eager a quei contenuti
e alle animazioni globali.

## Modifiche

- Creato `src/content/manualRouteIndex.ts`, un indice compatto con 29 capitoli,
  96 ID di argomento, titoli bilingui e 44 relazioni uniche capitolo/lab.
- `studyManual.test.ts` confronta l'indice con capitoli, argomenti e link del
  dataset completo, così la copia compatta non può divergere senza bloccare i test.
- Routing, store, preferenze e `LabManualLink` usano l'indice e non importano il
  manuale completo nel bundle dello shell. Vite conserva il dataset completo nel
  chunk lazy del manuale.
- Rimossi gli import eager di `motion/react` da App e Topbar. Le transizioni di
  vista, menu e ricerca usano CSS; `prefers-reduced-motion: reduce` le disattiva.
  La guida, inclusa la sua dipendenza dialogo/animazione, viene caricata solo
  quando l'utente la apre.
- Vitest è limitato a due worker e usa un timeout di 20 secondi per i test: il
  runner dichiarava 87 CPU ma l'ambiente applica una quota molto più bassa. Le
  due attese `findByRole` in App hanno timeout espliciti di 15 secondi per i
  chunk manuale/guida.

## Misure e verifiche locali

| Misura                  |                                                  Prima |                Dopo |                Limite |
| ----------------------- | -----------------------------------------------------: | ------------------: | --------------------: |
| Entry JavaScript gzip   |                                              122.911 B |        **83.816 B** |             125.000 B |
| Chunk Ports gzip        |                                               47.945 B |        **47.968 B** |              55.000 B |
| Chunk dati manuale gzip | incluso tra le dipendenze statiche del bundle iniziale | **232.790 B, lazy** | route-wide Lighthouse |

L'entry si riduce di **39.095 B (31,8%)**. `size-limit` e `scripts/performance-budget.mjs`
passano; il manifest controlla 36 route lazy. I test del budget passano 5/5.

Verifiche già eseguite:

- typecheck e i test mirati routing/manuale/preferenze/store/link/App: **119/119**.
- `npm run build`: **superato**.
- `npm run verify:performance`: **superato**; entry 83.816 B e Ports 47.968 B gzip.
- `npm audit --audit-level=high`: **0 vulnerabilità**.
- `npm audit signatures`: **330/330 pacchetti firmati verificati; 123 attestazioni**.
- `npm run verify`: **superato**; 791/791 test (87 file), coverage 95,56%
  statement, 92,23% branch, 99,66% function e 97,69% line; format, typecheck,
  lint, build e tutti i gate repository verdi.
- Playwright locale è stato avviato ma il browser non è installato: il percorso
  `/opt/pw-browsers/chromium` e la cache Playwright sono assenti. I test E2E
  quindi non hanno raggiunto l'app. Il workflow E2E GitHub installa Chromium
  esplicitamente; l'esito remoto va verificato dopo il push. Anche il workflow
  Performance esegue Lighthouse CI e va confermato dopo il push.

## Esito

L'indice compatto e il bundle di produzione rispettano il budget senza alzare le
soglie. PERF-01 resterà non spuntato finché i check Lighthouse CI e E2E attivati
dal push su `main` non risultano verdi.

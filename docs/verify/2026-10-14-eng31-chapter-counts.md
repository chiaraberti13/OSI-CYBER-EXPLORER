# Verifica e intervento ENG-31 (guard di conteggio dei capitoli) — 14 ottobre 2026

Baseline: `main`, `4157b9e` (dopo DOC-21). Ambiente locale: Node.js 22.22.0, npm 10.9.4,
Chromium preinstallato (Playwright 1.56.1); CI sulla versione fissata.

## Analisi (verifica 360°)

Stato Git pulito, `HEAD == origin/main == 4157b9e`, nessuna modifica concorrente; baseline verde.
Il manuale conta 28 capitoli e ogni incremento di capitolo costringeva finora ad aggiornare a mano
i numeri `x/N` sparsi nei test (28 opzioni del selettore, 7 optgroup, `0/5` e `0/14` per gruppo,
progresso `x/28`, percentuale `4%`). È il task **ENG-31 (P2)** della Fase 3: azzerare quel costo
derivando i conteggi dalla stessa fonte di verità del contenuto. Nessun problema bloccante.

## Implementazione (Senior Software Developer / QA)

I conteggi di capitoli nei test sono ora derivati dai selettori puri già coperti da test in
`src/lib/studyManual.ts` — `manualStats()` (totale capitoli) e `chaptersByDomain()` (gruppi del
selettore) — l'unica fonte di verità del manuale, invece di letterali ripetuti:

- **`src/components/StudyManualView.test.tsx`** — `TOTAL_CHAPTERS`, `FIRST_DOMAIN_CHAPTERS` e
  `EXTENSION_CHAPTERS` derivati: numero di opzioni del selettore, optgroup «CCNA 1.0 · Fondamenti
  di rete · 0/N», optgroup «Estensione · 0/N» e progresso «1/N».
- **`e2e/manual-mobile-sticky.spec.ts`** — numero di opzioni (`TOTAL_CHAPTERS`), numero di optgroup
  (`chaptersByDomain().length`), progresso «1/N (X%)» con la **percentuale ricavata** come fa la
  vista (`Math.round((1 / N) * 100)`), optgroup inglese «CCNA 1.0 · Network Fundamentals · 0/N».
- **`e2e/app-shell.spec.ts`** — progresso totale «0/N» e «1/N», aggregazione per dominio «… · 1/N».
- **`e2e/manual-help.spec.ts`** — progresso inglese «Chapter progress: 1/N».

Scelta di qualità: non è un numero che coincide con se stesso. La vista costruisce le opzioni e gli
optgroup da `chaptersByDomain()` (che può escludere un capitolo con dominio irrisolto), mentre le
asserzioni confrontano il reso con `manualStats()` (= `STUDY_MANUAL.length`): così il test prova che
la vista espone **ogni** capitolo e **ogni** gruppo — un capitolo perso o duplicato in navigazione
romperebbe il conteggio. L'invariante vista↔dati resta, il costo di manutenzione sparisce.

Verificato prima dell'intervento, con un test usa-e-getta poi rimosso, che le derivazioni riproducano
i valori correnti: totale **28**, gruppi **7**, primo dominio **5** (`network-fundamentals`),
estensione **14**. Solo codice di test (unit + E2E): nessun cambio a codice di prodotto, contenuti o
dati.

## Esiti finali

| Controllo                      | Esito                                                 |
| ------------------------------ | ----------------------------------------------------- |
| `npm run verify`               | Superato (uscita 0)                                   |
| Prettier, ESLint, TypeScript   | Superati (test e E2E modificati inclusi)              |
| Vitest con coverage            | Superato (84 file / 714 test)                         |
| Playwright completo            | **64/64** su Chromium (Axe WCAG 2.2 AA incluso)       |
| Parità IT/EN (`bilingual`)     | Superata (nessun contenuto toccato)                   |
| `documentation-targets`        | Superato                                              |
| `verify:offensive-content`     | Superato (file sorgente invariati)                    |
| Build Vite + budget gzip       | Superati (initial 122.19 kB gzip; chunk max 52.07 kB) |
| `audit:runtime` / `audit:full` | 0 vulnerabilità                                       |

CodeQL, Gitleaks, OSV, Lighthouse e la scansione dinamica del deployment sono verifiche dei
workflow GitHub, non eseguite localmente.

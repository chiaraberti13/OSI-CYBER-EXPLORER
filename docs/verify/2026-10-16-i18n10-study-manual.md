# I18N-10 — Il manuale di studio nel guard strutturale di parità

16 ottobre 2026. Baseline `main`:
`002a1a1e80f9c55566c09b746f006dd79490e1a3` (dopo il merge della PR #74:
report di verifica giornaliero e fix della flakiness E2E della tipografia).
Checkout iniziale pulito; branch di lavoro riallineato sulla nuova baseline
preservando il lavoro concorrente. Avviata l'applicazione (build) ed eseguita
l'intera pipeline `npm run verify` più la suite E2E prima di intervenire: tutto
verde. L'unico punto aperto è il task ricorrente I18N-10.

## Analisi, priorità e intervento

Dopo l'inclusione dei cataloghi (protocolli, porte, apparati) e del glossario nel
walk strutturale `BILINGUAL_DATASETS`, restava un dataset grande e centrale non
coperto: **`STUDY_MANUAL`** (`src/content/studyManual.ts`, ~9500 righe, 29
capitoli / 88 argomenti / 74 laboratori guidati), il manuale vero e proprio.

| Priorità          | Osservazione verificata                                                                                                                                                    | Intervento                                                                                                                                 |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| P1, parità IT/EN  | Il manuale era protetto **solo** dall'euristica testuale e da nessun controllo di presenza in `content.test.ts`                                                            | Aggiunto `STUDY_MANUAL` al guard strutturale con un controllo dedicato che percorre ogni campo `Bilingual`/`Bilingual[]` annidato          |
| P1, robustezza CI | L'euristica confronta solo coppie `it`/`en` **adiacenti ed esistenti**: un lato lingua **interamente mancante** in un elemento annidato (es. un passo di lab) non emergeva | Il walk ricorsivo `collectEmptyTranslations` fallisce su un lato mancante o vuoto e **nomina** il campo (capitolo → argomento/lab → campo) |
| P1, accuratezza   | Lettura di struttura e campione dei contenuti: tutti i campi presentano entrambe le lingue, non vuote; nessun errore fattuale o didattico rilevato                         | Nessuna correzione di contenuto necessaria; confermata la pulizia invece di introdurre modifiche cosmetiche o regressioni                  |

Il controllo attraversa, per ogni capitolo: `title`, `summary`; per ogni
argomento: `title`, `objectives[]`, `prerequisites[]`, `theory[]`, `example?`,
`commonMistakes[]`; per ogni laboratorio guidato: `title`, `scenario`, `task`,
`steps[]`, `challenge`, `solution[]`, `selfCheck[]`. Due asserzioni di conteggio
(>80 argomenti, >70 lab) impediscono che una futura modifica trasformi il
controllo in un no-op silenzioso. `SecurityReference` (`{ kind, id }`) non ha
chiavi `it`/`en` e quindi non genera falsi positivi.

La variazione è circoscritta al test di guardia `src/content/bilingual.test.ts`
e alla documentazione: nessuna modifica al runtime dell'applicazione, nessuna
nuova dipendenza, nessun refactoring.

## Verifiche e limiti

Baseline `npm run verify` superata prima dell'intervento. Sulle modifiche:

- `npm run verify`: superato — **86 file / 779 test Vitest** (era 778), coverage
  richiesto, `format:check`, `typecheck`, `lint`, build e tutti i gate (lockfile,
  release, deployment-security, repository-posture, documentation-targets,
  offensive-content, technical-content, design-system, accessibility-release,
  performance).
- `src/content/bilingual.test.ts`: **18 test** (era 17); nuovo controllo del
  manuale verde con contatori confermati (>80 argomenti, >70 lab guidati visitati).
- Audit runtime/full: **0 vulnerabilità**; nessuna dipendenza cambiata.
- Budget performance: ingresso 122430 byte gzip / 125 kB; Ports Explorer 48000
  byte / 55 kB. Soglie invariate.
- `npm run test:e2e`: **74/74 superati**, Chromium. La modifica è solo di test e
  non tocca il runtime, quindi l'esito resta valido.

Primo avvio con Node 24.22.0 (nvm) perché l'ambiente aveva 22.22.0, fuori dal
range `engines`; nessuna dipendenza del progetto modificata. Non eseguiti
Firefox/WebKit, screen reader reali o controlli del deployment pubblico. Axe e
reflow non certificano da soli la conformità completa WCAG 2.2 AA. Gli esiti
locali non equivalgono all'esito della matrice CI e degli scanner remoti.

I18N-10 resta ricorrente per futuri contenuti. Con cataloghi, glossario e manuale
ora nel guard strutturale, i dataset principali rivolti al discente falliscono in
CI se perdono un lato lingua; ciò non implica una revisione integrale di ogni
testo storico presente in tutte le sezioni dell'applicazione.

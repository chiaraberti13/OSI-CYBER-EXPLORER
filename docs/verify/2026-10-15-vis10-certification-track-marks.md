# Verifica e intervento VIS-10 (segno visivo del percorso) — 15 ottobre 2026

Baseline: `main`, `60c5ca1` (dopo EDU-31). Ambiente locale: Node.js 24.22.0 via nvm (il default
22.22.0 è sotto il minimo `^22.22.2` di `engines`), npm 11.19.1, Chromium preinstallato (Playwright
1.56.1); CI sulla versione fissata.

## Analisi (verifica 360°)

Stato Git pulito, `HEAD == origin/main == 60c5ca1`, nessuna modifica concorrente; baseline verde.
VIS-10 era il primo task `[ ]` in ordine di documento e il primo nell'ordine consigliato della Fase 3.

Stato prima dell'intervento: la navigazione del manuale raggruppa i capitoli per **dominio CCNA** e
i capitoli di estensione in un bucket finale «Estensione». I capitoli **eJPT** (`cert: 'ejpt'`,
`track: 'extension'`) finiscono in quel bucket insieme ai Security+, quindi **non erano distinguibili**
dall'estensione né nell'albero né, di fatto, nell'intestazione (il badge mostrava un generico
«Estensione»). Il selettore puro `certificationTrackForChapter` (ENG-30) già classifica ogni capitolo
in CCNA/eJPT/estensione: mancava solo il segno visivo. Nessun problema bloccante.

## Implementazione

- **`TrackMark`** (componente presentazionale in `StudyManualView.tsx`): icona + colore per percorso,
  con la **forma dell'icona** come canale non cromatico (WCAG 1.4.1 «Use of Color») e il **nome del
  percorso come testo**:
  - CCNA → `Route`, indigo; eJPT → `Crosshair`, rosa; estensione → `ShieldHalf`, ambra.
  - Nell'albero ogni riga-capitolo riceve il mark con un'etichetta **sr-only** «Percorso CCNA/eJPT/
    Estensione», così la riga nomina il percorso anche per gli screen reader.
  - Nel **breadcrumb sticky** e nell'**eyebrow** della card panoramica il mark precede il testo di
    allineamento già presente (visibile), rendendo auto-esplicativa l'associazione icona↔percorso.
- **Badge destro della panoramica** reso consapevole del percorso: per i capitoli di estensione ora
  distingue **eJPT** (chip rosa con `Crosshair`) dall'estensione **Security+** (chip ambra con
  `ShieldHalf`), invece del generico «Estensione».
- **Tema scuro (`index.css`)**: indigo e ambra erano già rimappati ai token scuri AA del manuale; per
  l'accento **rosa** di eJPT aggiunti token dedicati (`--color-dark-track-ejpt-*`) e mappature delle
  utility `bg-rose-100`/`text-rose-700/800` nello scope `[data-manual-root]`. Contrasti verificati
  (AA ≥ 4.5:1 per il testo): chip eJPT **8.3:1** su sfondo scuro, **6.7:1** chiaro; icona ≥ 5.6:1.
- **i18n**: aggiunte etichette brevi e stabili (`trackAria`, `trackCcnaShort`, `trackEjptShort`) in IT
  ed EN, con parità del set di chiavi (catalog test).

Nessuna modifica ai contenuti didattici o alla struttura dei dati; solo presentazione, i18n di UI e CSS.

## Verifiche aggiunte (guard)

- **Unit** (`StudyManualView.test.tsx`): nell'albero il numero di icone `data-track` per percorso
  uguaglia i conteggi del dataset (eJPT incluso, benché dentro il gruppo «Estensione»); una sola
  etichetta testuale «Percorso …» per riga (non solo colore/icona); nell'intestazione un capitolo
  eJPT mostra il chip «eJPT» (rosa) mentre un capitolo Security+ resta «Estensione» (ambra).
- **E2E** (`manual-track-marks.spec.ts`): marcatura distinta di CCNA/eJPT/estensione in albero e
  intestazione; scansione Axe `color-contrast` del manuale in **tema scuro** su un capitolo eJPT
  (il chip rosa è presente solo lì), attesa la fine della dissolvenza d'ingresso prima dell'analisi.

## Esiti finali

| Controllo                                        | Esito                                                        |
| ------------------------------------------------ | ------------------------------------------------------------ |
| `npm run verify`                                 | Superato (uscita 0)                                          |
| Prettier, ESLint, TypeScript                     | Superati                                                     |
| Vitest con coverage                              | Superato (manual view: +2 test VIS-10; catalog i18n ok)      |
| Parità IT/EN (`bilingual`, catalog)              | Superata (nuove chiavi presenti e bilanciate)                |
| `verify:design-system`                           | Superato (token AA; nessuna regressione sui token esistenti) |
| `documentation-targets`                          | Superato                                                     |
| `verify:offensive-content` / `technical-content` | Superati                                                     |
| Build Vite + budget gzip                         | Superati (initial 122.22 kB / 125; route 52.07 kB / 55)      |
| Playwright completo                              | **67/67** su Chromium (Axe WCAG 2.2 AA, dark incluso)        |
| `audit:runtime` / `audit:full`                   | 0 vulnerabilità                                              |

CodeQL, Gitleaks, OSV, Lighthouse e la scansione dinamica del deployment sono verifiche dei workflow
GitHub, non eseguite localmente.

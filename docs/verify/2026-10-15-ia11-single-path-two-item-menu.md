# Verifica e intervento IA-11 (percorso unico + menu a due voci) — 15 ottobre 2026

Baseline: `main`, `82c4eec` (dopo IA-10). Ambiente locale: Node.js 24.22.0 via nvm (il default
22.22.0 è sotto il minimo `^22.22.2` di `engines`), npm 11.19.1, Chromium preinstallato (Playwright
1.56.1); CI sulla versione fissata.

## Richiesta utente

«PANORAMICA E CAPITOLI mi crea confusione: voglio un solo percorso organizzato dove ho il manuale e i
laboratori (sempre senza quiz e flashcard) e organizza meglio il menu… il menu è dispersivo.»
Direzione confermata: hub «Solo Manuale»; menu a due voci **Manuale** e **Laboratori**.

## Implementazione

- **Hub unificato → solo Manuale.** Eliminato lo switcher a schede `CcnaHubTabs` (rimosso da
  `StudyManualView` e `CurriculumView`, componente e test cancellati). Il Manuale di studio è il
  percorso unico e l'**atterraggio predefinito**: `DEFAULT_VIEW = 'manual'` (e stato iniziale dello
  store allineato). La «Mappa CCNA» (`curriculum`) resta instradabile via deep-link (`#/curriculum`,
  `hideFromNav`) ma non è più una voce di menu né il landing.
- **Menu a due voci.** `ViewGroupId` passa da quattro gruppi a **`manual | labs`**; introdotto
  `LabCategoryId` (`ccna | interactive | area | operations`) con `LAB_CATEGORIES` per i sottotitoli.
  Nel registro, `manual` è l'unico membro del gruppo `manual`; tutti gli altri laboratori passano al
  gruppo `labs` con la loro categoria d'area. In barra: **Manuale** è un link diretto (nessun menu che
  si apre su una sola voce), **Laboratori** è un dropdown che elenca **tutti** i laboratori in un
  unico pannello, organizzati per sottotitoli d'area (Percorso CCNA, Laboratori interattivi, Sicurezza
  per area, Operazioni e difesa). La ricerca ⌘K resta invariata.
- **Modello derivato.** Il modello di navigazione (`lib/navigation.ts`) continua a derivare dal
  registro; `NavEntry` porta ora la `category` per i sottotitoli. Routing, deep-link, Back/Forward e
  WCAG 2.2 AA preservati.

Nessun quiz o flashcard introdotti; nessun cambiamento al contenuto dei capitoli o dei laboratori.

## Verifiche aggiornate

- **Unit:** `viewRegistry.test` e `navigation.test` (due gruppi, aree ≤12, `navGroupOf` → `labs`);
  `Navigation.test` (gruppo «Laboratori», link «Manuale», aria-current); `viewRouting.test` (default
  `manual`); `ViewLink.test` (CurriculumView senza i link dello switcher); cancellato
  `CcnaHubTabs.test`.
- **E2E:** `app-shell` (atterraggio Manuale, route sconosciuta → `#/manual`, Back/Forward, skip-link,
  lingua, menu compatto via gruppo «Laboratori» e pannello `#nav-panel-labs`; rimosso il test
  dell'affordance di overflow dei tab, non più applicabile con due sole voci); `labs` (apertura lab
  dal menu «Laboratori»). `accessibility` resta valido (la Mappa CCNA è ancora deep-linkable).

## Esiti finali

| Controllo                                               | Esito                                                   |
| ------------------------------------------------------- | ------------------------------------------------------- |
| `npm run verify`                                        | Superato (uscita 0)                                     |
| Prettier, ESLint, TypeScript                            | Superati                                                |
| Vitest con coverage                                     | Superato (83 file / 753 test)                           |
| Parità IT/EN (`catalog`, `bilingual`)                   | Superata                                                |
| `verify:design-system`                                  | Superato                                                |
| `documentation-targets` / offensive / technical-content | Superati                                                |
| Build Vite + budget gzip                                | Superati (initial 122.40 kB / 125; route 52.07 kB / 55) |
| Playwright completo                                     | **64/64** su Chromium (Axe WCAG 2.2 AA incluso)         |
| `audit:runtime` / `audit:full`                          | 0 vulnerabilità                                         |

Con IA-10 e IA-11 i quattro punti sollevati dall'utente sono risolti: guida unica, due soli percorsi
(Percorso CCNA ed eJPT, senza «Estensione»), un solo percorso organizzato (il Manuale, con i
laboratori collegati dai capitoli) e un menu a due voci non più dispersivo.

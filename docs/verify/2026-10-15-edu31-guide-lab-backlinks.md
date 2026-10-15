# Verifica e intervento EDU-31 (cross-link guida↔lab) — 15 ottobre 2026

Baseline: `main`, `e3ed4c2` (dopo CONTENT-02 5/5, capitolo sicurezza Layer 2). Ambiente locale:
Node.js 24.22.0 via nvm (l'ambiente di default era 22.22.0, sotto il minimo `^22.22.2` di `engines`),
npm 11.19.1, Chromium preinstallato (Playwright 1.56.1); CI sulla versione fissata.

## Analisi (verifica 360°)

Stato Git pulito, `HEAD == origin/main == e3ed4c2`, nessuna modifica concorrente; baseline verde
(typecheck, 35 test del back-link dopo l'aggiunta del guard). EDU-31 era il primo task `[ ]` in ordine
di documento. Verifica del meccanismo esistente:

- Il back-link lab→capitolo (`LabManualLink`, EDU-STRUCT-05) è **montato una sola volta** in
  `App.tsx` dalla vista attiva (`<LabManualLink lab={activeView} />`), fuori dal confine lazy — non
  per-lab. Di conseguenza ogni lab citato da un capitolo espone il back-link senza cablaggio per
  vista; una vista non citata (manuale, curriculum, lab offensivi) rende `null`.
- I chapter sono derivati dalla **mappa inversa** `chaptersForLab`, già testata in
  `studyManual.test.ts` (ordine di studio, ogni capitolo cita davvero il lab).
- Censimento: **30 lab insegnati** (unione di `topic.lab` e `guidedLab.lab` su `STUDY_MANUAL`), tutti
  risolti a ≥1 capitolo, inclusi i nuovi difensivi di CONTENT-01/02 (`segmentation`,
  `routingsecurity`, `availability`, `managementsecurity`, `recovery`, `layer2security`).

Lacuna rilevata (non bloccante): i test del back-link coprivano solo casi hardcoded (`osi`,
`fundamentals`, `manual`). Mancava un **guard sistematico** che garantisse la proprietà «ogni lab
insegnato espone il back-link» anche per i capitoli futuri — esattamente l'oggetto di EDU-31.

## Implementazione (solo codice di test)

- **Guard unit** in `src/components/LabManualLink.test.tsx`: l'insieme `TAUGHT_LABS` è derivato da
  `STUDY_MANUAL` (unica fonte di verità). Due nuovi test:
  1. l'insieme è non banale (≥ 20) e include i sei lab difensivi che hanno appena ottenuto un
     capitolo, così smettere di insegnarne uno fallisce in CI;
  2. `it.each(TAUGHT_LABS)` — per ogni lab insegnato, `LabManualLink` rende il callout (ruolo
     `complementary`) e i suoi link sono **esattamente** i deep-link `#/manual/<id>` dei capitoli
     citanti, in ordine di studio. Un nuovo capitolo o laboratorio guidato entra nel guard senza
     liste da mantenere a mano.
- **E2E** in `e2e/lab-manual-link.spec.ts`: aggiunto un caso su un lab **appena insegnato**
  (`layer2security` → capitolo `access-layer-security`) che naviga nell'app reale, verifica il
  callout «Teoria nel manuale», l'`href` del capitolo, il click e l'apertura del capitolo. Prova che
  il montaggio centrale copre i nuovi capitoli end-to-end, non solo i lab cablati a mano.

Nessuna modifica a prodotto, contenuti o traduzioni: il meccanismo era già corretto; l'intervento lo
rende verificato e a prova di regressione.

## Esiti finali

| Controllo                          | Esito                                                     |
| ---------------------------------- | --------------------------------------------------------- |
| `npm run verify`                   | Superato (uscita 0)                                       |
| Prettier, ESLint, TypeScript       | Superati                                                  |
| Vitest con coverage                | Superato (`LabManualLink` 35 test: 30 lab + guard + base) |
| Parità IT/EN (`bilingual`, manual) | Superata (nessun contenuto modificato)                    |
| `documentation-targets`            | Superato                                                  |
| `verify:offensive-content`         | Superato                                                  |
| `verify:technical-content`         | Superato                                                  |
| Build Vite + budget gzip           | Superati                                                  |
| Playwright completo                | **65/65** su Chromium (Axe WCAG 2.2 AA incluso)           |
| `audit:runtime` / `audit:full`     | 0 vulnerabilità                                           |

CodeQL, Gitleaks, OSV, Lighthouse e la scansione dinamica del deployment sono verifiche dei workflow
GitHub, non eseguite localmente.

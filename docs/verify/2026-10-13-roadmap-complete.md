# Verifica di chiusura della roadmap — 13 ottobre 2026

Baseline: `main`, `7a99e36` (dopo EDU-18). Ambiente locale: Node.js 22.22.0, npm 10.9.4,
Chromium preinstallato (Playwright 1.56.1); install con `--engine-strict=false`
(ambiente Node 22.22.0 vs `engines ^22.22.2`); CI sulla versione fissata.

## Analisi e priorità

Con EDU-18 il backlog titolato di `ROADMAP.md` (UX-\*, IA-\*, EDU-STRUCT-\*, EDU-01…EDU-18)
risulta interamente spuntato. Gli unici elementi `[ ]` residui erano la legenda («Da
iniziare», che non è un task) e i nove **Criteri di Completamento della Roadmap** (Definition
of Done), invarianti di qualità che i gate automatici già enforcano. L'intervento utile e
non inventato è stato verificare rigorosamente ciascun criterio sulla baseline corrente e
spuntarlo solo dove realmente soddisfatto, chiudendo formalmente la roadmap.

## Implementazione

Nessuna modifica a codice o contenuti: le simulazioni, i contenuti e l'architettura erano
già in stato di completamento. È stato aggiornato `ROADMAP.md` spuntando i nove criteri di
completamento e aggiungendo una nota di chiusura con la mappatura criterio→evidenza (e il
rinvio: gli interventi futuri si baseranno su nuove lacune verificate, non su task inventati).

## Verifica dei nove criteri (evidenza)

1. **CI/type-check/lint/test/build/a11y verdi** — `npm run verify` uscita 0 (format, typecheck,
   lint, `test:coverage` 83 file di test, build, budget) ed E2E 59/59 su Chromium, incluso
   `accessibility.spec.ts` con Axe sui tag WCAG 2.2 AA.
2. **Vulnerabilità** — `audit:runtime` e `audit:full` a 0 vulnerabilità.
3. **Input interattivi** — `src/lib/inputValidation.ts` (limiti, parsing con schema, errori
   bilingui) e test di confine in `inputValidation.test.ts`.
4. **Viste** — registrazione unica (`viewRegistry.test.ts`/`navigation.test.ts`),
   indirizzabilità hash (`viewRouting.ts`), `ChunkErrorBoundary` in `App.tsx`.
5. **Separazione dei concern** — contenuti in `src/content`, logica pura in `src/lib`,
   presentazione nei componenti.
6. **Accessibilità** — gate `verify:design-system` (contrasto WCAG AA dai token, globale), Axe
   WCAG 2.2 AA sulle viste rappresentative e flussi da tastiera (`accessibility.spec.ts`,
   `manual-accessibility.spec.ts`).
7. **Parità IT/EN e riferimenti** — `bilingual.test.ts`, `catalog.test.ts`, `content.test.ts`,
   controlli riferimenti in `studyManual.test.ts`.
8. **Dati di documentazione e fonti** — gate `documentation-targets` (450 IPv4, 87 IPv6, 24
   domini, tutti riservati), riferimenti strutturati validati, `networkingConformance.test.ts`.
9. **Simulazioni** — gate `verify:offensive-content` (25 scenari, solo simulazione, client-side,
   contestualizzate come attività autorizzate).

## Esiti finali

| Controllo                      | Esito                                            |
| ------------------------------ | ------------------------------------------------ |
| `npm run verify`               | Superato (uscita 0)                              |
| Prettier, ESLint, TypeScript   | Superati                                         |
| Vitest con coverage            | **83 file di test superati**                     |
| Build Vite + budget gzip       | Superati (initial 121,84 kB; max route 52,07 kB) |
| Playwright completo            | **59/59** su Chromium                            |
| `documentation-targets`        | Superato (450 IPv4, 87 IPv6, 24 domini)          |
| `offensive-content`            | Superato (25 scenari, solo simulazione)          |
| `audit:runtime` / `audit:full` | **0 vulnerabilità**                              |
| Stato roadmap                  | **Completata** (backlog + 9 criteri di DoD)      |

CodeQL, Gitleaks, OSV, Lighthouse e la scansione dinamica del deployment sono verifiche
dei workflow GitHub, non eseguite localmente.

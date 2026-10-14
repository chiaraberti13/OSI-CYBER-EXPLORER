# Verifica e intervento LAB-01 (nuovo laboratorio) + rifinitura favicon — 14 ottobre 2026

Baseline: `main`, `f1cade9` (dopo CONTENT-01 + Fase 3). Ambiente locale: Node.js 22.22.0,
npm 10.9.4, Chromium preinstallato (Playwright 1.56.1), ImageMagick `convert`; CI sulla versione
fissata.

## Analisi

Il percorso eJPT è servito finora riusando le viste difensive esistenti: mancava un laboratorio
**interattivo** costruito per la metodologia offensiva — il primo task P1 della Fase 3 (LAB-01). In
parallelo, l'utente segnala che la favicon «non è cambiata»: la favicon della Fase 2 (VIS-11) è in
realtà pubblicata su `main`, ma i browser/CDN la mettono in cache in modo aggressivo e il link non
aveva cache-busting.

## Implementazione

### LAB-01 — «Stati di porta (scanning)» (Senior Dev + Instructional Designer)

- **Nuovo `AppView` `scanstates`** registrato in `viewRegistry` (gruppo «Laboratori interattivi»,
  icona radar, lazy-loaded); `App.tsx` lo renderizza genericamente dal registro. Aggiornate le
  liste di viste nei test (`viewRegistry.test.ts`, `navigation.test.ts`).
- **Modello dati bilingue** `src/content/scanStates.ts`: sei casi (TCP/UDP × aperto/chiuso/filtrato)
  con sonda, risposta, deduzione e nota difensiva; **logica pura** `src/lib/scanStates.ts`
  (selettori `casesForProtocol`/`findCase`) con test (`src/lib/scanStates.test.ts`).
- **Componente** `ScanStatesLab.tsx`: un **decodificatore esploratore** (non un quiz) — si sceglie
  il protocollo e si confrontano i tre stati; mostra come la scansione deduce lo stato da sonda e
  risposta e cosa osserva la difesa. Solo porte note ed etichette di protocollo inerti.
- **Collegamento dal manuale**: il capitolo eJPT di scanning (ordine 19) punta ora al nuovo lab —
  il lab guidato `gl-pentest-scan-states` e il link del topic usano `scanstates` (numero di
  laboratori guidati invariato, 3 sul capitolo eJPT).
- **E2E** `e2e/scan-states-lab.spec.ts`: apertura via deep link, verifica dei contenuti TCP, toggle
  a UDP (evidenza ICMP port unreachable), scansione Axe WCAG 2.2 AA.
- Coverage: il comparatore è stato riscritto con `indexOf` per eliminare un ramo difensivo non
  raggiungibile e rispettare la soglia di branch per-file.

### Rifinitura favicon (Visual Designer)

- Mark reso **più leggibile a 16px** (barre più spesse) in `public/favicon.svg` e nel logo inline
  dell'header; rigenerati `public/favicon.ico` (32+16 px) e `public/apple-touch-icon.png` (180×180).
- **Cache-busting** in `index.html` (`?v=2` sui riferimenti `icon`/`apple-touch-icon`) così i
  browser riscaricano la nuova icona invece di servire quella in cache.

## Esiti finali

| Controllo                          | Esito                                                  |
| ---------------------------------- | ------------------------------------------------------ |
| `npm run verify`                   | Superato (uscita 0)                                    |
| Prettier, ESLint, TypeScript       | Superati                                               |
| Vitest con coverage                | Superato (**84 file / 714 test**; soglie per-file ok)  |
| Parità IT/EN (`bilingual`, manual) | Superata                                               |
| `documentation-targets`            | Superato (158 file; solo target di documentazione)     |
| `verify:offensive-content`         | Superato                                               |
| Build Vite + budget gzip           | Superati (**35 route**; initial 122,19 kB gzip)        |
| Playwright completo                | **64/64** su Chromium (nuovo spec LAB-01 incluso, Axe) |
| `audit:runtime` / `audit:full`     | 0 vulnerabilità                                        |

CodeQL, Gitleaks, OSV, Lighthouse e la scansione dinamica del deployment sono verifiche dei
workflow GitHub, non eseguite localmente.

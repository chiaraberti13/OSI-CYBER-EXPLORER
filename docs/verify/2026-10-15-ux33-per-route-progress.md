# Verifica e intervento UX-33 (progresso per percorso) — 15 ottobre 2026

Baseline: `main`, `8ab7c15` (dopo UX-32). Ambiente locale: Node.js 24.22.0 via nvm (il default
22.22.0 è sotto il minimo `^22.22.2` di `engines`), npm 11.19.1, Chromium preinstallato (Playwright
1.56.1); CI sulla versione fissata.

## Analisi (verifica 360°)

Stato Git pulito, `HEAD == origin/main == 8ab7c15`, nessuna modifica concorrente; baseline verde.
UX-33 era un task `[ ]` P3 e il successivo nell'ordine consigliato dopo UX-32. La base era pronta:
i selettori puri `chaptersForCertificationTrack` e `chapterCompletion` già calcolano, per percorso,
capitoli e completamento; il header mostrava solo il progresso complessivo. I18N-10 (P1) è un gate
ricorrente già imposto dal test `bilingual`, senza nuovi contenuti pendenti da revisionare. Nessun
problema bloccante.

## Implementazione

- **Progresso per percorso** nel header di `StudyManualView.tsx`, accanto al totale esistente: una
  lista etichettata «Progresso per percorso» con una voce per ciascun percorso di certificazione
  (CCNA, eJPT, Estensione), in ordine di catalogo (`MANUAL_CERTIFICATION_TRACKS`). I due obiettivi di
  certificazione (CCNA ed eJPT) più l'estensione Security+ — coerente con il filtro UX-32 e i segni
  di percorso VIS-10.
- Ogni voce porta l'icona di percorso (`TrackMark`) a rinforzo del nome scritto e un'etichetta
  accessibile completa (`<percorso> · Progresso capitoli: x/n (p%)`); il testo visibile resta
  compatto (`CCNA 1/15`).
- Derivato interamente dai selettori puri già testati (`chaptersForCertificationTrack` +
  `chapterCompletion`), senza stato aggiuntivo né duplicazione: completare un capitolo avanza solo il
  percorso a cui appartiene, mentre il totale continua a contare tutti i percorsi insieme.
- **i18n:** aggiunta la chiave `progressByRoute` (IT «Progresso per percorso» / EN «Progress by
  route»), set di chiavi bilanciato.

Nessun cambio ai contenuti didattici o al modello dati; solo presentazione e i18n di interfaccia.

## Verifiche aggiunte

- **Unit** (`StudyManualView.test.tsx`): con un capitolo CCNA completato (`osi-model`), la voce CCNA
  mostra `1/n` mentre eJPT ed Estensione restano `0/n` (progresso per percorso, non condiviso); il
  totale mostra `1/N`. La lista ha esattamente tre voci.
- **E2E** (`manual-route-progress.spec.ts`): la lista è visibile con le tre route a zero; dopo aver
  segnato completato il capitolo aperto (CCNA), solo CCNA avanza a `1/n` e il totale a `1/N`.

## Esiti finali

| Controllo                                               | Esito                                                   |
| ------------------------------------------------------- | ------------------------------------------------------- |
| `npm run verify`                                        | Superato (uscita 0)                                     |
| Prettier, ESLint, TypeScript                            | Superati                                                |
| Vitest con coverage                                     | Superato (manual view: +1 test UX-33)                   |
| Parità IT/EN (`catalog`, `bilingual`)                   | Superata (nuova chiave presente e bilanciata)           |
| `verify:design-system`                                  | Superato                                                |
| `documentation-targets` / offensive / technical-content | Superati                                                |
| Build Vite + budget gzip                                | Superati (initial 122.23 kB / 125; route 52.07 kB / 55) |
| Playwright completo                                     | **70/70** su Chromium (Axe WCAG 2.2 AA incluso)         |
| `audit:runtime` / `audit:full`                          | 0 vulnerabilità                                         |

CodeQL, Gitleaks, OSV, Lighthouse e la scansione dinamica del deployment sono verifiche dei workflow
GitHub, non eseguite localmente.

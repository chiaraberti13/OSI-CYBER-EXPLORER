# Verifica e intervento IA-10 (due percorsi + guida unica) — 15 ottobre 2026

Baseline: `main`, `c686d0b` (dopo UX-33). Ambiente locale: Node.js 24.22.0 via nvm (il default
22.22.0 è sotto il minimo `^22.22.2` di `engines`), npm 11.19.1, Chromium preinstallato (Playwright
1.56.1); CI sulla versione fissata.

## Richiesta utente

Due osservazioni precise: (1) la guida non deve essere duplicata — va tenuta solo nella sezione
«Guida» e tolta dal manuale di studio; (2) i gruppi di appartenenza devono essere **due** — Percorso
CCNA ed eJPT — mentre «Estensione» creava confusione.

## Implementazione

- **Modello a due tracce.** `ManualCertificationTrack` passa da `ccna | ejpt | extension` a
  `ccna | ejpt`; `MANUAL_CERTIFICATION_TRACKS` ha due voci (`Percorso CCNA` / `CCNA path`, `eJPT`).
  `certificationTrackForChapter` ora classifica solo eJPT↔CCNA: i capitoli dell'estensione difensiva
  (Security+/avanzata) studiano insieme alla dorsale CCNA come unico percorso «blu». Il campo di
  allineamento al blueprint sul capitolo (`track: 'ccna' | 'extension'`) resta per la mappa dei domini.
- **Indice del manuale per percorso.** L'albero desktop e la select mobile raggruppano per le due
  tracce (via `chaptersByCertificationTrack()`), non più per dominio CCNA + bucket «Estensione». Ogni
  intestazione di gruppo porta l'icona di percorso (`TrackMark`), il nome e il progresso. Il filtro
  (UX-32) offre Tutti / CCNA / eJPT; il progresso per percorso (UX-33) elenca due voci.
- **Niente etichetta «Estensione» nell'interfaccia.** Il badge destro della panoramica mostra il
  peso d'esame per i capitoli di dominio, un chip **eJPT** (rosa) per l'offensiva e un chip
  **CCNA** (indigo) per i capitoli avanzati CCNA, al posto del vecchio «Estensione»; l'allineamento
  eyebrow per i capitoli senza dominio mostra la fonte (Security+ o eJPT) senza prefisso «Estensione».
- **Guida unica.** Rimossa dal manuale la guida in pagina «Come usare questa guida» (pannello,
  pulsante e stato relativi): resta la «Guida» globale in testata. Rimossi gli import e lo stato
  orfani; le chiavi i18n della vecchia guida restano definite ma inutilizzate.
- **Tema scuro:** aggiunta la mappatura AA del chip CCNA (`.bg-indigo-100` → token tile objectives).

Nessun cambiamento al testo dei capitoli: solo modello delle tracce, presentazione dell'indice e
rimozione della guida duplicata.

## Verifiche aggiornate

- **Unit:** riscritti i blocchi ENG-30 (`studyManual.test.ts`, due tracce) e i test della vista
  (`StudyManualView.test.tsx`: raggruppamento per due percorsi, filtro a due tracce, progresso a due
  voci, chip di percorso, assenza di «Estensione»); rimossi i test della guida in pagina (UX-22).
- **E2E:** eliminato `manual-help.spec.ts` (guida rimossa); aggiornati `app-shell`,
  `manual-mobile-sticky`, `manual-track-marks`, `manual-track-filter`, `manual-route-progress`,
  `manual-ejpt` ai due percorsi e all'etichetta eJPT senza prefisso; tolti i click all'onboarding
  non più presente.

## Esiti finali

| Controllo                                               | Esito                                                   |
| ------------------------------------------------------- | ------------------------------------------------------- |
| `npm run verify`                                        | Superato (uscita 0)                                     |
| Prettier, ESLint, TypeScript                            | Superati                                                |
| Vitest con coverage                                     | Superato (84 file / 755 test)                           |
| Parità IT/EN (`catalog`, `bilingual`)                   | Superata                                                |
| `verify:design-system`                                  | Superato                                                |
| `documentation-targets` / offensive / technical-content | Superati                                                |
| Build Vite + budget gzip                                | Superati (initial 122.24 kB / 125; route 52.06 kB / 55) |
| Playwright completo                                     | **65/65** su Chromium (Axe WCAG 2.2 AA incluso)         |
| `audit:runtime` / `audit:full`                          | 0 vulnerabilità                                         |

Nota QA: una prima esecuzione completa aveva segnalato un rosso in `manual-accessibility` (ordine
Tab / target-size); non riproducibile in isolamento (3/3) né alla riesecuzione completa (65/65) —
flake sotto esecuzione parallela, non un effetto della riorganizzazione.

Lo hub «solo Manuale» e il menu a due voci (Manuale + Laboratori) sono l'intervento successivo
(IA-11), tracciato in ROADMAP.

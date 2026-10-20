# Roadmap

OSI Cyber Explorer è una piattaforma didattica bilingue (IT/EN) per lo studio del
**CCNA 200-301 v1.1** e dell'**eJPT**, con un'estensione avanzata allineata a
**CompTIA Security+ SY0-701**: manuale, laboratori interattivi, catalogo
Attacco–Difesa e mappa di copertura delle certificazioni, tutto deterministico e
lato client (nessun backend, nessuna IA).

Stato verificato alla revisione tecnica del 2026-10-10
(`docs/technical-content-reviews.json`, prossima revisione entro 2027-04-08).

## Stato attuale (verificato)

- **Manuale di studio** — copre i sei domini del CCNA 200-301 v1.1, l'estensione
  Security+/avanzata e i quattro domini dell'eJPT, con obiettivi, prerequisiti,
  teoria progressiva, esempi, errori comuni, riferimenti e laboratori guidati.
  Prova: `src/content/studyManual.ts`, `src/lib/studyManual.test.ts`.
- **Mappa di copertura delle certificazioni** — 53 obiettivi e 58 sotto-obiettivi
  CCNA v1.1 più i 22 obiettivi eJPT, con pesi, verbi, livello di evidenza e
  destinazioni reali. Prova: `src/content/certificationCoverage.ts`,
  `src/content/certificationCoverage.test.ts`, `docs/CCNA_BLUEPRINT_COVERAGE.md`.
- **Laboratori interattivi** — oltre 30 viste deterministiche (OSI, fondamenti di
  rete, access/switching, routing/OSPF, servizi IP, sicurezza di rete,
  automazione, catalogo Attacco–Difesa, laboratori Security+ e workbench eJPT).
  Prova: `src/content/viewRegistry.ts` e i test per-vista in `src/components`.
- **Progresso di studio** — completamento per capitolo, progresso per percorso, un
  interruttore “studiato” formativo per argomento con conteggio «argomenti studiati»
  per capitolo e un **riepilogo «riprendi lo studio»** sull'indice che somma gli
  argomenti studiati e collega al primo capitolo non completato. Persistenza locale
  con sanitizzazione allowlist e migrazione di schema (v4). Prova: `src/store.ts`,
  `src/lib/preferences.ts`, `src/lib/studyManual.ts` (`topicCompletion`,
  `overallTopicCompletion`, `nextChapterToStudy`), `e2e/manual-topic-progress.spec.ts`,
  `e2e/manual-resume-summary.spec.ts`.
- **Qualità** — 101 file di test unitari/integrazione (vitest), E2E Playwright con
  verifica Axe WCAG 2.2 AA, lint, type-check, build, budget di performance,
  audit delle dipendenze e gate di revisione contenuti (tecnici e offensivi).

I contenuti ufficialmente mappati, gli approfondimenti correlati e i contenuti
fuori programma restano distinti nella mappa di copertura e nel manuale.

## Priorità pianificate (non ancora realizzate)

Ogni voce indica dipendenze, criteri di completamento e fonti da aggiornare.
Nessuna di queste va presentata come già disponibile finché non è verificata.

1. **Manutenzione dei blueprint delle certificazioni**
   - Dipende da: fonti ufficiali (Cisco 200-301, INE eJPT, CompTIA SY0-701) e
     ciclo di revisione a 180 giorni.
   - Fonti da aggiornare: `CERTIFICATION_SOURCES`, `docs/technical-content-reviews.json`,
     matrice di copertura e date di revisione.
   - Completamento: revisione firmata, prove collegate, nessun record scaduto in CI.
   - Stato: verifica incrociata del blueprint CCNA v1.1 contro il PDF ufficiale Cisco
     eseguita il 2026-10-20 (piena corrispondenza, nessuna deriva) — vedi
     `docs/CERTIFICATION_SOURCE_VERIFICATION.md`. La prossima revisione umana firmata
     resta prevista entro il 2027-04-08.

2. **Nuovi laboratori e diagrammi mirati**
   - Criterio: aggiungere un laboratorio o un diagramma solo quando un supporto
     visivo chiarisce meglio del testo e il contenuto è collegato a un obiettivo.
   - Completamento: simulazione deterministica, parità IT/EN, test dedicati,
     distinzione esplicita tra simulazione didattica e sistema reale.

3. **Revisione continua di parità e naturalezza IT/EN**
   - Prova: `src/i18n/catalog.test.ts`, `src/content/bilingual.test.ts`,
     specifiche E2E `*-bilingual.spec.ts`.

4. **Monitoraggio di performance, accessibilità e sicurezza**
   - Prova: budget di performance, Lighthouse CI, gate accessibilità,
     audit/osv-scanner delle dipendenze.

## Qualità (criteri di rilascio)

Ogni rilascio supera i controlli automatici: test unitari e di integrazione, E2E con
verifica di accessibilità WCAG 2.2 AA, lint, type-check, build, audit delle
dipendenze, gate di revisione dei contenuti e budget di performance. Un contenuto o
una funzionalità che non può essere validato va segnalato e non dichiarato completo.

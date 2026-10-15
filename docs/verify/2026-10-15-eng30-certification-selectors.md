# Verifica ENG-30 — 15 ottobre 2026

Baseline: `main` a `d546e294376c123ce339f05c9b61cbca551e3385`, checkout pulito.
Ambiente: Node 24.19.0, npm 11.9.0, dipendenze da lockfile con `npm ci --ignore-scripts`,
Playwright 1.56.1 / Chromium 141.0.7390.37 (build 1194).

## Analisi e priorità

Esaminati architettura SPA React/TypeScript/Vite, selettori e modello del manuale,
roadmap, README, percorso didattico, test, script di verifica e workflow CI/sicurezza.
Consultati branch e ultimi cinque commit; ricontrollato `origin/main` prima della pubblicazione.

| Priorità | Evidenza                                                                                                                            | Intervento / stato                                    |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| P2       | eJPT incluso nel gruppo blueprint `extension`; nessuna API condivisa per i tre percorsi                                             | Completato ENG-30, primo task non spuntato            |
| P2       | Intestazione roadmap ancora a 24 capitoli / 73 argomenti / 59 lab                                                                   | Corretta a 28 / 85 / 71                               |
| P2       | CONTENT-02 ancora a 4/5: manca il capitolo dedicato a `layer2security`                                                              | Resta aperto, come già documentato                    |
| P2       | Filtri, indicatori e progresso per percorso non ancora disponibili nella UI                                                         | Restano aperti UX-32/33 e VIS-10                      |
| P3       | Numerazione degli elenchi in `docs/STUDY_PATH.md` non sempre coincide con `order` (es. configurazione sicurezza CCNA è capitolo 14) | Residuo documentale segnalato; non blocca i selettori |

Nessun blocco applicativo emerso dai controlli eseguiti. La verifica dei contenuti
networking/cybersecurity include i gate tecnici, riferimenti, target di documentazione,
contenuti offensivi e integrità del grafo didattico. Non è una rilettura umana completa
di tutti gli 85 argomenti, né una certificazione di conformità WCAG.

## Modifiche

Catalogo tipizzato `MANUAL_CERTIFICATION_TRACKS` con etichette IT/EN e ordine stabile;
selettori `certificationTrackForChapter`, `chaptersForCertificationTrack`,
`chaptersByCertificationTrack`; parametro opzionale in `chaptersByDomain`.
La classificazione deriva dai metadati esistenti: non introduce un campo duplicato.
`both` significa CCNA + Security+, mentre eJPT resta fuori dai domini ufficiali CCNA.

Dodici nuovi casi testano semantica, integrità metadati, partizione senza perdita o duplicati,
ordine, array indipendenti e raggruppamento filtrato. Documentazione del contratto bilingue in
`docs/manual-certification-selectors.md`. Solo ENG-30 spuntato; nessun filtro UI dichiarato completo.

## Flusso verificato

Lo studente apre il manuale dalla SPA → il dataset locale passa dai selettori all'indice →
seleziona capitoli e argomenti → naviga ai laboratori e conserva il progresso locale.
Non esistono API, database o credenziali backend in questo flusso.
La suite browser avvia il bundle di produzione con Vite preview e verifica navigazione,
deep-link, lingua IT/EN, persistenza, responsive, tastiera e controlli Axe.

## Esiti

| Controllo                                                                         | Esito                                                                                   |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `npm run verify` finale                                                           | Superato, uscita 0                                                                      |
| Formattazione, ESLint, TypeScript                                                 | Superati                                                                                |
| Vitest con coverage                                                               | 84 file, 726 test superati (12 aggiuntivi)                                              |
| Coverage logica                                                                   | Linee 97,68%; statement 95,55%; branch 92,30%; funzioni 99,66%; soglie superate         |
| Playwright completo, Chromium                                                     | 64/64 superati; Axe e flussi IT/EN inclusi                                              |
| Build e performance                                                               | Superati; JS iniziale 122.182 B gzip, route massima 52.071 B gzip, 35 route controllate |
| Gate contenuti, target, IT/EN, design, accessibilità, release, lockfile e posture | Superati                                                                                |
| `audit:runtime` e `audit:full`                                                    | 0 vulnerabilità                                                                         |
| `audit:signatures:full`                                                           | 330 firme registry e 123 attestazioni verificate                                        |
| Revisione diff                                                                    | Nessuna nuova dipendenza, segreto o artefatto generato incluso                          |

Il primo tentativo E2E è fallito per assenza del browser, prima di eseguire i flussi.
Installato Chromium con il comando Playwright; i mirror alternativi hanno risolto un download
iniziale non valido. La successiva suite completa è passata. Il build conserva l'avviso
non bloccante sui chunk grandi; i budget gzip del progetto sono rispettati.

CodeQL, Gitleaks, OSV, Lighthouse e scansione dinamica deployment non eseguiti localmente.
La presenza dei workflow è stata esaminata; il loro esito remoto non è implicato nei risultati locali.
Nessun force push previsto; la conferma del commit remoto viene verificata dopo il push.

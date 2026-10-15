# VIS-12 — Diagrammi concettuali e verifica trasversale

Data: 15 ottobre 2026. Baseline: `main` a `1badf67`, checkout pulito; esaminati
branch, ultimi cinque commit, roadmap, script, CI e componenti del manuale.
Ambiente: Node 24.19.0, npm 11.9.0; dipendenze installate con `npm ci --ignore-scripts`.
Browser: Chromium 141, Playwright 1.56.1; applicazione avviata dal bundle di produzione.

## Analisi e priorità

| Priorità           | Evidenza                                                                                                                            | Intervento / stato                                                                                   |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Bloccanti          | Nessun errore nei gate iniziali di `npm run verify`                                                                                 | Baseline verificata                                                                                  |
| P2, contenuti      | Esempio DMARC condiziona il fallimento a `p=reject`; testo promette protezione assoluta                                             | Distinti risultato di autenticazione/allineamento, policy richiesta e decisione del ricevente, IT/EN |
| P2, documentazione | README e guida descrivono quattro menu e aiuto inline rimossi da IA-10–12                                                           | Allineati alle due voci, ai percorsi e alla guida globale                                            |
| P3, didattica      | Primo task non completato: VIS-12                                                                                                   | Completati i tre schemi suggeriti nella roadmap                                                      |
| P2, residuo        | `bilingual.test.ts` esclude ancora `deviceRegistry.ts`, `portContent.ts`, `protocolRegistry.ts` dalla revisione automatica completa | Eccezioni preesistenti mantenute; I18N-10 resta ricorrente/aperto                                    |
| P3, performance    | Avviso Vite per chunk oltre 500 kB non compressi                                                                                    | Budget gzip superati; nessun refactoring fuori scope                                                 |

La revisione tecnica approfondita riguarda i tre argomenti modificati; i gate globali
coprono logica di rete, contenuti, parità, target didattici, sicurezza e accessibilità
rilevabile automaticamente. Non costituisce una certificazione integrale di tutti
i contenuti o della conformità WCAG.

## Implementazione

- Catalogo `manualDiagrams.ts`, unione tipizzata `ManualDiagramId` e campo opzionale
  `ManualTopic.diagram`, senza dipendenze aggiuntive o nuove richieste di rete.
- `ManualConceptDiagram`: SVG inline, colori del manuale tramite `currentColor`,
  frecce con pattern distinti, descrizione visibile equivalente, nome/descrizione
  accessibili, identificatori React univoci anche quando il componente è ripetuto.
- Tre schemi: perimetro vs flussi interni; consegna email con controlli al ricevente;
  fasi del test con ritorno all’enumerazione entro lo scope. Nessun target operativo.
- Diagrammi dentro il chunk lazy del manuale, dopo la spiegazione del rispettivo
  argomento; routing, progresso, tastiera e sequenza dei capitoli preservati.
- Correzioni DMARC circoscritte a policy/esito; alternative e didascalie revisionate IT/EN.
- README IT/EN e `STUDY_MANUAL_HELP.md` aggiornati, inclusa compatibilità del vecchio
  flag persistito senza ripristinare il pannello rimosso.

## Riferimenti tecnici consultati

- [SMTP, RFC 5321](https://www.rfc-editor.org/rfc/rfc5321): trasferimento e consegna.
- [NIST SP 800-115](https://csrc.nist.gov/pubs/sp/800/115/final): pianificazione,
  verifica, evidenze e rimedi; lo schema è una sintesi didattica, non una sequenza normativa.
- [NIST SP 800-207](https://csrc.nist.gov/pubs/sp/800/207/final): assenza di fiducia
  implicita in base alla posizione di rete.
- [RFC 7489, §6.7](https://www.rfc-editor.org/rfc/rfc7489#section-6.7) e
  [RFC 9989](https://www.rfc-editor.org/rfc/rfc9989): policy e decisione del ricevente.
  RFC 7489 resta riferimento storico nel capitolo; la pagina RFC Editor ne segnala
  la sostituzione con RFC 9989/9990/9991. Non è stata effettuata qui una migrazione
  completa di tutti i materiali DMARC del progetto.

## Verifiche

| Controllo                                                                                                 | Esito                                                                                                                |
| --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `npm run verify`, prima e dopo l’intervento                                                               | Superato                                                                                                             |
| TypeScript, ESLint, Prettier                                                                              | Superati                                                                                                             |
| Vitest con coverage                                                                                       | 84 file, 759 test superati; soglie globali e per modulo superate                                                     |
| Gate lockfile, release, deployment, repository, target, contenuti tecnici/offensivi, design/accessibilità | Superati                                                                                                             |
| Build e budget                                                                                            | Superati: ingresso circa 122,43 kB gzip / 125; Ports Explorer 52,07 / 55; 35 route                                   |
| Playwright completo                                                                                       | 68/68 Chromium, inclusi Axe WCAG A/AA, routing, lab, mobile e lingua                                                 |
| Nuovi test SVG                                                                                            | Alternative IT/EN, collegamenti topic, ID univoci, testo entro viewBox, nessun overflow pagina, contrasto SVG ≥4,5:1 |
| `audit:runtime`, `audit:full`                                                                             | Zero vulnerabilità                                                                                                   |
| `audit:signatures:full`                                                                                   | 330 firme registry e 123 attestazioni verificate                                                                     |
| Ispezione visiva                                                                                          | Schemi mobile nei temi chiaro/scuro; screenshot temporanei non versionati                                            |
| `git diff --check` e revisione diff                                                                       | Nessun errore, segreto o artefatto generato incluso                                                                  |

La prima esecuzione E2E ha rilevato il contrasto errato del nuovo sfondo in tema scuro
(e un selettore lingua errato nel nuovo test). Correzione con superficie già supportata
dal design system e nome accessibile effettivo; riesecuzione completa: 68/68.

Limiti: eseguito Chromium, non Firefox/WebKit né lettori di schermo reali. La matrice
CI Node 22/24, CodeQL/OSV e le verifiche sul deployment pubblico sono workflow remoti,
non equivalenti ai controlli locali qui documentati. Nessun risultato remoto è presunto.

VIS-12 completato; I18N-10 rimane aperto perché ricorrente. Pubblicazione prevista
tramite commit e push ordinario su `main`, con verifica separata dello SHA remoto.

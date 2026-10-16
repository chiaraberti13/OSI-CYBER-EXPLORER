# I18N-10 — Revisione del catalogo porte

16 ottobre 2026. Baseline `main`: `4b63263d567f50808aa8903ec1fd11dce87f108e`.
Checkout iniziale pulito; remoto, commit recenti, architettura e roadmap esaminati.
Il prossimo incremento dell'unico punto aperto, I18N-10 ricorrente, riguarda le
45 schede delle porte (90 coppie IT/EN: descrizione e sicurezza).

## Problemi verificati e intervento

| Priorità                  | Lacuna                                                                                     | Correzione                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| P1, didattica e sicurezza | TACACS+ definito estremamente sicuro; VLAN e cambio porta suggeriti come protezione RADIUS | Offuscamento legacy distinto dalla cifratura robusta, trasporto protetto e filtro TACACS+ corretto |
| P1, accuratezza           | Confusione relay SMTP/submission, TLS implicito/esplicito e cifratura end-to-end           | Distinti 25, 465 e 587; corretti IMAP/IMAPS e certificati; alternativa del relay resta su 25       |
| P1, traduzioni            | Catalogo escluso dal guard; dettagli e acronimi presenti in una sola lingua                | Revisione integrale, rimozione dell'esclusione, verifica strutturale di ogni campo                 |
| P2, contenuti             | SSL, autenticazione PostgreSQL debole, SNMPv3 senza livello, Redis senza contesto          | TLS moderno, SCRAM-SHA-256, authPriv e modalità protetta con ACL                                   |
| P2, networking            | Intervallo effimero presentato come universale, Vite descritto come predefinito su 3000    | Distinzione range IANA/configurazione del sistema, Vite 5173 rispetto al 3000 del progetto         |
| P2, UX                    | Etichetta di sicurezza assoluta e intestazioni senza wrapping                              | Protezione da configurare, intestazioni adattabili, verifica completa mobile e desktop             |

Nessun gate bloccante nella baseline. Conservati struttura, servizi, associazioni
porta/trasporto e date della precedente verifica IANA; nessuna dipendenza aggiunta.
Rivisti anche DHCP IPv4, DNSSEC/DoT/DoH, Kerberos, SMB, database e autorizzazione.
Le note indicano condizioni e limiti invece di attribuire sicurezza al numero di porta.

La revisione trasversale comprende architettura React/TypeScript con route lazy,
filtri, copertura, workflow CI e scanner, supply chain, budget, contenuti e didattica.
La revisione manuale approfondita di questo incremento riguarda il catalogo porte,
non equivale a una nuova certificazione di tutti i contenuti dell'applicazione.

## Fonti primarie

- [RFC 8907](https://www.rfc-editor.org/info/rfc8907/): TACACS+ legacy e limiti dell'offuscamento.
- [RFC 8314](https://www.rfc-editor.org/rfc/rfc8314.html): posta e TLS implicito/submission.
- [RFC 6614](https://www.rfc-editor.org/rfc/rfc6614.html): trasporto RADIUS su TLS.
- [RFC 6335](https://www.rfc-editor.org/info/rfc6335/) e
  [RFC 6056](https://www.rfc-editor.org/info/rfc6056/): intervalli e selezione delle porte effimere.
- [Vite server options](https://vite.dev/config/server-options): porta predefinita e configurazione.
- [PostgreSQL password authentication](https://www.postgresql.org/docs/17/auth-password.html): SCRAM.
- [Redis security](https://redis.io/docs/latest/operate/oss_and_stack/management/security/): modalità protetta, ACL e TLS.

## Verifiche

Ambiente: Node 24.19.0, npm 11.9.0; produzione avviata tramite Vite preview.

- `npm run verify`: superato; 85 file / 774 test Vitest, coverage richiesto,
  lint, typecheck, formattazione, build e tutti i gate disponibili.
- `npm run test:e2e -- --workers=2`: **72/72 superati** su Chromium 141,
  inclusi Axe WCAG A/AA e reflow del catalogo completo a 320/1280 px in IT/EN.
- Audit runtime/full: zero vulnerabilità; 330 firme e 123 attestazioni verificate.
- Budget finale: ingresso 122441 byte gzip su 125 kB; Ports Explorer 53415 byte
  su 55 kB (baseline 53679 byte). Nessuna soglia allentata.
- Ripetuti typecheck, lint e budget dopo la correzione delle ultime etichette.
- Ispezione visiva TACACS+ a 320 px in italiano e RADIUS a 1280 px in inglese.
- Test di regressione per filtro TACACS+, relay SMTP e ricerca SCRAM; controllo
  di tutte le descrizioni, note di sicurezza e ambiguità nelle due lingue.
- `git diff --check`: superato; nessun segreto o file generato aggiunto.

Durante la verifica sono stati risolti un dato SQL non allineato tra le lingue,
un'asserzione unitaria sul titolo aggiornato e un selettore E2E ambiguo tra
«Azzera filtri» e «Riazzera filtri» (ora corrispondenza esatta). Il primo avvio
browser era impedito da Chromium assente: installato il browser previsto da
Playwright senza modificare le dipendenze del progetto.

## Limiti e seguito

I18N-10 resta aperto perché ricorrente. `deviceRegistry.ts` è ora l'unico dataset
ancora escluso dal confronto euristico delle traduzioni. Non eseguiti Firefox/WebKit,
screen reader reali o verifica del deployment pubblico; Axe e reflow non costituiscono
certificazione completa WCAG 2.2 AA. La matrice CI remota e gli scanner remoti non
sono dichiarati superati in base ai controlli locali.

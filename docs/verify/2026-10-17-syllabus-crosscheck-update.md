# Cross-check aggiornato dei blueprint eJPT e CCNA

17 ottobre 2026. Baseline `main` `361e1ae` (dopo fast-forward dei commit concorrenti). Seconda verifica su richiesta: confronto diretto dei contenuti del manuale con le due fonti ufficiali e integrazione delle lacune verificabili.

## Fonti ufficiali consultate

- INE, [eJPT Certification](https://ine.com/security/certifications/ejpt-certification), pagina esame letta il 17/10/2026. La pagina presenta quattro domini con pesi **35%, 25%, 25%, 15%** e gli obiettivi elencati sotto.
- Cisco, [CCNA Exam v1.1 (200-301) exam topics PDF](https://learningcontent.cisco.com/documents/marketing/exam-topics/200-301-CCNA-v1.1.pdf), PDF di quattro pagine letto il 17/10/2026.
- Per i dettagli tecnici di QoS WLAN Catalyst 9800: Cisco, [Configure, Validate and Troubleshoot Wireless QoS on 9800 WLC](https://www.cisco.com/c/en/us/support/docs/wireless/catalyst-9800-series-wireless-controllers/222241-configure-validate-and-troubleshoot-wire.html) e [Catalyst 9800 Series Configuration Best Practices](https://www.cisco.com/c/en/us/td/docs/wireless/controller/9800/technical-reference/c9800-best-practices.html).
- La precedente verifica non poteva raggiungere le due fonti INE e Cisco per DNS. In questa sessione la pagina INE e il PDF Cisco sono stati aperti direttamente e le precedenti note di incertezza sui pesi sono superate.

## eJPT — confronto obiettivo per obiettivo

| Dominio INE e peso                         | Obiettivo della pagina                                                                                                           | Copertura nel manuale                                                                                                                                                                                                   |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Host and Network Penetration Testing — 35% | Identificare e modificare exploit                                                                                                | `exploitation-frameworks-metasploit`: selezione, prerequisiti, modifica concettuale e verifica in lab autorizzato; differenze, rollback e telemetria difensiva                                                          |
|                                            | Exploitation con Metasploit                                                                                                      | `exploitation-frameworks-metasploit`, moduli, payload, sessioni e segnali difensivi                                                                                                                                     |
|                                            | Pivoting aggiungendo una route e con port forwarding                                                                             | `lateral-movement-pivoting`: distinzione concettuale tra route e forwarding di una porta, scope, log ed egress                                                                                                          |
|                                            | Brute force e cracking hash                                                                                                      | `pentest-password-attacks`, `offline-hash-cracking-defense`; login web online distinto dal cracking offline                                                                                                             |
| Assessment Methodologies — 25%             | Localizzare endpoint, porte e servizi; identificare il sistema operativo                                                         | `pentest-scanning-enumeration`; fingerprinting dichiarato come ipotesi con fonti d’errore e confidenza                                                                                                                  |
|                                            | Informazioni pubbliche su azienda, email e tecnologia                                                                            | `pentest-recon-footprinting`: OSINT, fonte/data/confidenza, minimizzazione dei dati e limite dello scope                                                                                                                |
|                                            | Identificare vulnerabilità nei servizi e valutarne criticità/impatto                                                             | `pentest-vulnerability-assessment`, inclusi CVE/CVSS, esposizione, contesto, falsi positivi e rimedi                                                                                                                    |
| Host and Networking Auditing — 25%         | Raccogliere informazioni da file; enumerare rete e sistema; informazioni utente; trasferire file; raccogliere dati hash/password | `host-network-auditing`: configurazioni/log, rete/sistema, utenti, credenziali/hash trattati come evidenza sensibile, trasferimento minimo protetto e integrità documentata                                             |
| Web Application Penetration Testing — 15%  | Vulnerabilità web, directory/file nascosti, brute force login, ricognizione web                                                  | `web-injection-classes`, `web-file-inclusion-traversal`, `web-enumeration`, `web-http-proxy-mapping`, `web-auth-session-access`, `pentest-password-attacks`; login affrontato come caso online con difese e rilevamento |

L’integrazione estende topic già presenti e mantiene invariato il limite dei tre capitoli eJPT. I contenuti non aggiungono comandi, target reali o procedure per sottrarre credenziali; raccolta e test restano esplicitamente autorizzati e limitati allo scope.

## CCNA 200-301 v1.1

Il PDF dichiara sei domini e pesi: Network Fundamentals 20%, Network Access 20%, IP Connectivity 25%, IP Services 10%, Security Fundamentals 15%, Automation and Programmability 10%. La matrice `src/content/ccnaBlueprint.ts` contiene gli obiettivi numerati dei sei domini e li collega a viste reali; `ccnaBlueprint.test.ts` controlla ordine/pesi rispetto a `CCNA_DOMAINS`, unicità, traduzioni e destinazioni registrate. La revisione della matrice è aggiornata al 17/10/2026.

Il controllo dei sottopunti ha individuato un dettaglio mancante nel 2.9: la lezione Catalyst 9800 trattava WLAN, sicurezza e policy tag ma non i profili QoS e le opzioni avanzate citati esplicitamente dal PDF. Ora la lezione bilingue copre i profili Platinum/Gold/Silver/Bronze e precisa che non creano banda; aggiunge isolamento peer-to-peer, timeout e client exclusion come opzioni la cui disponibilità dipende da release/modello e il cui effetto va verificato. Il riferimento Cisco conferma la presenza di QoS per WLAN/SSID e le cautele sulla configurazione Catalyst 9800.

Per gli altri obiettivi del PDF non è emersa una lacuna di destinazione nella matrice CCNA. Il cross-check conferma anche la copertura recente di 6.4 (AI generativa/predittiva e ML) e 4.7 (PHB/QoS); la matrice dei capitoli/vista e la verifica dei singoli sottopunti sono riepilogate nel roadmap.

## Modifiche

- `studyManual.ts`: integrazione IT/EN nei temi eJPT di ricognizione, scanning, exploitation/Metasploit, auditing, password e pivoting; completamento CCNA 2.9.
- `ccnaBlueprint.ts` e `docs/CCNA_BLUEPRINT_COVERAGE.md`: data di revisione aggiornata.
- `ROADMAP.md`: pesi e nomi correnti INE, mappatura degli obiettivi, lacune chiuse e riferimenti ufficiali aggiornati.
- Diagramma didattico IKEv2/CHILD_SA e relativa verifica sono rendicontati in `docs/verify/2026-10-17-vis13-ikev2-handshake.md`.

## Verifiche

Esiti finali:

- `npm run verify`: superato; guard tecnici/offensivi, contenuti, accessibilità, formattazione, typecheck, lint, test unitari, build e budget prestazionali verdi. Test unitari **795/795**, 87 file; coverage statement **95,56%**.
- `npm run test:e2e`: **84/84** superati, incluse le 8 combinazioni del diagramma IKEv2. I controlli automatici Axe WCAG A/AA sulle viste sono verdi.
- `npm run audit:full`: superato, zero vulnerabilità.
- `npm run audit:signatures:full`: superato, firme registry di 330 pacchetti verificate e 123 attestazioni.
- Smoke HTTP locale: server Vite avviato e pagina principale ricevuta via HTTP.
- `git diff --check` e controllo Prettier dei documenti: superati.

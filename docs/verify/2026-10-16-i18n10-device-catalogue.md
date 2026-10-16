# I18N-10 — Revisione del catalogo apparati

16 ottobre 2026. Baseline `main`: `3acca02bf9fe429e5c124a892c6df98c5487c7de`.
Checkout iniziale pulito e remoto allineato. Esaminati roadmap, commit recenti,
architettura React/TypeScript, caricamento lazy, filtri, test e workflow CI.
Il prossimo incremento dell'unico punto aperto ricorrente era `deviceRegistry.ts`,
ultimo catalogo escluso dal confronto euristico IT/EN.

## Analisi, priorità e correzioni

| Priorità                    | Problema verificato                                                                                                            | Intervento                                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| P1, accuratezza e didattica | Garanzie assolute di blocco, isolamento o rilevamento attribuite a firewall, proxy, EDR, NDR e SIEM                            | Distinti capacità, configurazione, visibilità, evidenza e risposta; eliminato il blocco automatico dato per certo       |
| P1, networking              | Apprendimento MAC impreciso, bridge senza flooding, hub equiparato a decrittazione, modem presentato come protezione elettrica | Corretti apprendimento sorgente, flooding nella VLAN, cifratura dei payload e funzione di terminazione del collegamento |
| P1, sicurezza               | DPI confusa con decrittazione; ispezione TLS e fail-open proposti senza limiti; NAC equiparato a fiducia continua              | Precisati autorizzazione, validazione, compromesso disponibilità/ispezione, controlli dello stato e rischi residui      |
| P1, parità IT/EN            | Dataset escluso dal guard, divergenze nei dettagli e negli acronimi                                                            | Revisionate 31 schede e 155 coppie; eliminata l'ultima esclusione, aggiunto controllo strutturale dei cinque campi      |
| P2, UX/accessibilità        | Ricerca senza nome accessibile, categorie senza stato annunciato, reset vuoto che conservava la categoria                      | Nome esplicito, conteggio live, `aria-pressed`, reset completo e bersagli dei filtri di almeno 44 px                    |
| P2, UI e traduzioni         | Etichette miste IT/EN e intestazioni non adattabili                                                                            | Localizzati categorie, livelli e azioni; wrapping delle schede e nota sulle classificazioni OSI indicative              |

Ulteriori correzioni: OWASP Top 10 non è un database di firme; Root Guard distinto
da BPDU Guard; traduzione protocolli distinta da prevenzione e proxy distinto da
NAT; PMF limita alcuni metodi di contenimento wireless; honeypot con isolamento
ed egress controllati; TAP distinto dal sensore e senza immunità allo spoofing.
Mantenuti i 31 elementi, le categorie e le funzionalità esistenti. Nessuna nuova
dipendenza, nessun refactoring architetturale.

La revisione approfondita riguarda questo catalogo e il relativo pannello.
I gate globali verificano anche contenuti, logica, architettura di rilascio,
accessibilità automatica, supply chain e performance; non sostituiscono una nuova
revisione manuale integrale di tutte le pagine o una certificazione di sicurezza.

## Fonti primarie consultate

- [NIST SP 800-41 Rev. 1](https://nvlpubs.nist.gov/nistpubs/legacy/sp/nistspecialpublication800-41r1.pdf): modelli di firewall e politiche.
- [NIST SP 800-94](https://csrc.nist.gov/pubs/sp/800/94/final): sensori passivi/in linea e limiti IDPS; riferimento architetturale storico.
- [Cisco Root Guard](https://www.cisco.com/c/en/us/support/docs/lan-switching/spanning-tree-protocol/10588-74.html) e
  [BPDU Guard](https://www.cisco.com/c/en/us/support/docs/lan-switching/spanning-tree-protocol/10586-65.html): ambiti distinti dei controlli.
- [OWASP WAF](https://community.owasp.org/Web_Application_Firewall) e
  [OWASP Top 10](https://owasp.org/projects/top-ten): scopo del filtro e documento di sensibilizzazione ai rischi.
- [Cisco Management Frame Protection](https://www.cisco.com/c/en/us/td/docs/wireless/controller/9800/17-13/config-guide/b_wl_17_13_cg/m_mfp.pdf): protezione dei frame di gestione.
- [Microsoft EDR](https://learn.microsoft.com/en-us/defender-endpoint/overview-endpoint-detection-response): telemetria osservabile e azioni di risposta; le capacità del prodotto non sono generalizzate a tutti gli EDR.

## Verifiche e limiti

Baseline `npm run verify` superata. Sulle modifiche:

- `npm run verify`: superato, **86 file / 777 test Vitest**, coverage richiesto,
  typecheck, lint, formattazione, build e tutti i gate disponibili.
- Audit runtime/full: zero vulnerabilità; nessuna dipendenza cambiata.
- Budget: ingresso 122430 byte gzip / 125 kB; Ports Explorer 48000 byte / 55 kB,
  rispetto ai 53415 byte iniziali. Soglie invariate.
- Firme: 330 pacchetti verificati e 123 attestazioni verificate.
- Ricerca verificata anche sui livelli OSI localizzati; etichette e filtro usano
  la stessa traduzione, con test di regressione.
- `npm run test:e2e -- --workers=2`: **74/74 superati**, Chromium 141.
- I nuovi scenari verificano tutte le 155 coppie, categorie, ricerca, reset,
  cambio lingua, Axe e overflow di ogni scheda a 320/1280 px.
- Ispezione visiva delle schede switch in italiano e NGFW in inglese.
- Corretto un overflow reale del badge Kernel Proxy a 320 px, rilevato dal
  nuovo test; ripetuti i controlli browser, lint, typecheck e budget.
- `git diff --check` superato; esclusi screenshot, cache, file generati e segreti.

Il primo avvio E2E era impedito dal browser assente; Chromium è stato installato
nella versione prevista da Playwright, senza cambiare le dipendenze del progetto.
Non eseguiti Firefox/WebKit, screen reader reali o controlli del deployment pubblico.
Axe e reflow non certificano da soli conformità completa WCAG 2.2 AA.
Gli esiti locali non equivalgono all'esito della matrice CI e degli scanner remoti.

I18N-10 resta ricorrente per futuri contenuti. Non rimangono cataloghi storici
esclusi dal guard euristico; questo non implica revisione completa di ogni testo
storico presente in altre sezioni dell'applicazione.

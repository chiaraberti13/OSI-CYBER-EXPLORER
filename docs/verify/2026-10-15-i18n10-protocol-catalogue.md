# I18N-10 — Revisione completa del catalogo protocolli

15 ottobre 2026. Baseline `main`: `2f1df7161486ff95e99c877caa93a5436dd74976`.
Checkout pulito, remoto allineato, ultimi commit e roadmap esaminati. L’unico punto
aperto è I18N-10 (ricorrente): questo incremento completa il catalogo protocolli,
non dichiara completata la revisione degli altri dataset esclusi.

## Analisi e priorità

| Priorità          | Problema verificato                                                                                                                                  | Esito                                                                                                             |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| P1, qualità       | Il guard delle traduzioni riconosceva una coppia solo con entrambe le chiavi già presenti: una lingua assente o di tipo errato sfuggiva al controllo | Corretto il riconoscimento; otto casi di regressione con input validi, incompleti e malformati                    |
| P1, contenuti     | Catalogo protocolli escluso dai controlli; divergenze IT/EN e indicazioni tecniche imprecise                                                         | Revisionate 20 schede e 60 coppie; eliminata l’esclusione, aggiunta validazione strutturale di tutti i campi      |
| P2, UX/didattica  | Etichette inglesi in modalità italiana, UDP descritto come “Fast”, badge “Sicuro” anche per famiglie con varianti non cifrate                        | Localizzazione completa delle etichette del pannello; badge “Protezione configurabile” e descrizioni condizionali |
| P2, accessibilità | Ricerca protocolli affidata al placeholder; intestazioni delle schede senza wrapping                                                                 | Nome accessibile esplicito, wrapping e reset di almeno 44 px                                                      |
| Residuo           | `deviceRegistry.ts` e `portContent.ts` restano esclusi dal confronto euristico                                                                       | Mantenuti e dichiarati in roadmap, senza allentare le soglie dei test                                             |

Nessun blocco nei gate della baseline. Revisione di architettura SPA React/TypeScript,
caricamento lazy, filtraggio, persistenza, workflow CI, dipendenze e budget esistenti.
Le verifiche globali coprono logica di rete, contenuti, navigazione e accessibilità
rilevabile automaticamente; la revisione umana approfondita riguarda questo catalogo.

## Correzioni tecniche e linguistiche

- HTTP/HTTPS: distinguere HTTP in chiaro da TLS; non proporre SSL e non equiparare
  cifratura e attendibilità del sito.
- DNS: record oltre agli indirizzi; DNSSEC protegge origine/integrità, non riservatezza.
- SSH, SMTP e SNMP: verifica delle chiavi, limiti del TLS opportunistico e livello
  authPriv per la cifratura, senza promesse automatiche.
- TCP/UDP: flusso di byte e datagrammi; nessuna garanzia assoluta di consegna o latenza;
  HTTP/3 usa QUIC su UDP.
- IP, ICMP e ARP: best-effort e interfacce, protezione IPsec dipendente dalla
  configurazione, filtraggio ICMP selettivo, ARP per IPv4 e Neighbor Discovery per IPv6.
- FTP/TFTP: differenza SFTP/FTPS e richieste TFTP unicast nel protocollo base, non broadcast.
- DHCP/LDAP: distinguere DHCP per IPv4 da DHCPv6; LDAP non equivale da solo al Single Sign-On.
- IMAP/POP3: corretto il nome Internet Message Access Protocol, distinte sincronizzazione
  e recupero; TLS senza raccomandare SSL.
- TLS: terminazione della protezione e mappatura OSI 6 esplicitamente didattica.
- BGP/OSPF: validazione RPKI dell’origine, non dell’intero AS_PATH; autenticazione
  OSPFv2 con HMAC-SHA invece di indicare soltanto MD5.
- Ethernet/Wi-Fi: non garantire ritrasmissione Ethernet o sicurezza radio automatica;
  note su MACsec, configurazione e identità della rete.

Tutti i campi `description`, `useCase`, `security` sono stati letti e revisionati in
entrambe le lingue, mantenendo acronimi, cifre e limiti tecnici equivalenti. I nomi
ufficiali dei protocolli restano in inglese. Nessuna dipendenza aggiunta.

## Fonti primarie consultate

| Ambito                  | Riferimenti                                                                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trasporto e HTTP/3      | [RFC 9293](https://www.rfc-editor.org/info/rfc9293/), [RFC 9114](https://www.rfc-editor.org/info/rfc9114/)                                                          |
| TFTP                    | [RFC 1350](https://www.rfc-editor.org/info/rfc1350/)                                                                                                                |
| OSPF e BGP              | [RFC 5709](https://www.rfc-editor.org/info/rfc5709/), [RFC 8481](https://www.rfc-editor.org/info/rfc8481/)                                                          |
| DNS e ICMP              | [RFC 4033](https://www.rfc-editor.org/rfc/rfc4033.html), [RFC 4890](https://www.rfc-editor.org/rfc/rfc4890)                                                         |
| IMAP, posta, LDAP       | [RFC 9051](https://www.rfc-editor.org/info/rfc9051/), [RFC 8314](https://www.rfc-editor.org/info/rfc8314/), [RFC 4513](https://www.rfc-editor.org/info/rfc4513/)    |
| Collegamento e gestione | [IEEE 802.1AE](https://1.ieee802.org/security/802-1ae/), [RFC 3414](https://www.rfc-editor.org/info/rfc3414/), [RFC 4861](https://www.rfc-editor.org/info/rfc4861/) |
| TLS                     | [RFC 9846](https://www.rfc-editor.org/info/rfc9846/) (successore di RFC 8446, consultato anche come riferimento storico)                                            |

## Verifica e limiti

Ambiente: Node 24.19.0, npm 11.9.0, Chromium 141 / Playwright 1.56.1.
L’applicazione viene avviata con `vite preview` sul bundle di produzione dai test.

- `npm run verify`: superato; lint, typecheck, formattazione, test con coverage,
  build, budget e gate di lockfile, deployment, repository e contenuti.
- Test mirati: validazione bilingue e filtraggio superati; il nuovo E2E controlla
  ogni campo di ogni scheda nelle due lingue, cambio lingua a ricerca attiva,
  reset, assenza di overflow a 320/1280 px e Axe WCAG A/AA.
- Audit runtime/full: zero vulnerabilità. Firme: 330 pacchetti verificati,
  123 attestazioni verificate.
- Budget: ingresso 122,44 kB gzip / 125; route Ports Explorer 53,68 / 55.
  Il margine della route è ridotto: nuove espansioni del catalogo devono rispettare
  il gate, che non è stato modificato.
- `git diff --check`: superato; esclusi screenshot, report generati, cache e segreti.

Esiti finali: **84 file / 768 test Vitest superati**, soglie coverage globali e per
modulo rispettate; **70/70 E2E Chromium superati**, inclusi i due nuovi scenari
IT/EN a 320 e 1280 px. Ispezione visiva delle schede HTTP/HTTPS mobile e OSPF desktop.
Non eseguiti Firefox/WebKit, audit con screen reader reali o controlli del deployment
pubblico. La matrice CI remota Node 22/24 e gli scanner remoti non sono sostituiti
né dichiarati superati sulla base dell’esecuzione locale.

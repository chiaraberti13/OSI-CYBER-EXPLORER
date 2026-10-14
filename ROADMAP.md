# 🚀 Roadmap di Sviluppo — Fase 2: OSI-CYBER-EXPLORER

> **Baseline:** branch `main`, successiva alla chiusura della Fase 1 (roadmap storica in
> [`docs/roadmap-archive-2026-10-13.md`](docs/roadmap-archive-2026-10-13.md)).
> **Apertura Fase 2:** 13 ottobre 2026.
> **Obiettivi di certificazione:** **CCNA 200-301** (networking e sicurezza di base) e
> **eJPT — INE/eLearnSecurity Junior Penetration Tester** (metodologia offensiva, in chiave
> didattica e autorizzata).
> **Metodo:** incrementi verticali completi e verificati (`npm run verify`, E2E Chromium con
> Axe WCAG 2.2 AA, audit), pubblicati su `main`; ogni intervento documentato in `docs/verify/`.

## Legenda

- [ ] Da iniziare
- [~] In corso
- [x] Completato e verificato
- **P0 — Critica** · **P1 — Alta** · **P2 — Media** · **P3 — Evolutiva**

## 🎯 Visione della Fase 2

La Fase 1 ha reso l'app un manuale di studio bilingue completo per il **CCNA 200-301**, con
laboratori interattivi e un impianto di sicurezza difensivo. La Fase 2 **amplia gli argomenti e
i concetti** lungo due direttrici:

1. **eJPT — metodologia di penetration testing.** Introduce la prospettiva del tester: ingaggio
   e autorizzazione, ricognizione, scanning, enumerazione, valutazione delle vulnerabilità,
   exploitation, post-exploitation e reporting — sempre **didattica, autorizzazione-first e
   accoppiata alla difesa** (ogni tecnica è legata alle tracce che lascia e ai controlli che la
   fermano). I contenuti riusano i laboratori interattivi esistenti e usano solo target di
   documentazione.
2. **Chiusura del divario guida↔laboratori.** Dieci laboratori interattivi esistono ma il
   manuale non li insegna ancora: trasformarli in capitoli/argomenti colma il divario e aggiunge
   concetti Security+/offensivi senza nuovo codice di prodotto.

**Principio di responsabilità.** I contenuti offensivi restano a scopo formativo: nessuna
procedura operativa riutilizzabile contro sistemi reali, nessun payload eseguibile, solo
indirizzi/host di documentazione, e ogni fase offensiva è presentata con la sua contromisura e
la sua evidenza rilevabile. L'allineamento con il gate `verify:offensive-content` e con la
revisione dei contenuti tecnici è vincolante.

## 🌐 Network Engineer (CCNA+) — approfondimenti di networking

- [ ] **NET-01 (P2) — Troubleshooting strutturato.** Un argomento/capitolo sulla metodologia di
      diagnosi (modello a livelli, bisezione, verifica per ipotesi) che riusa `pathtrace` come
      laboratorio guidato. **Completato quando:** l'argomento insegna un metodo ripetibile con un
      lab guidato su `pathtrace`, test e parità IT/EN verdi.
- [ ] **NET-02 (P3) — TCP/UDP in profondità.** Approfondire handshake, finestre, controllo di
      flusso e congestione, stati delle porte — base condivisa con lo scanning eJPT.

## 🛡️ Cybersecurity Specialist — ampliamento concetti offensivi/difensivi

- [x] **PENTEST-01 (P1) — Capitolo «Metodologia di penetration testing (eJPT)».** Nuovo capitolo
      estensione (ordine 19, cert `eJPT`) con tre argomenti — ingaggio/autorizzazione/fasi,
      ricognizione e footprinting, scanning ed enumerazione — ciascuno con obiettivi, teoria
      progressiva, esempio su target di documentazione, errori comuni, riferimenti (NIST SP 800-115,
      MITRE ATT&CK) e un laboratorio guidato che riusa viste esistenti (`attackpaths`, `ports`,
      `inspection`). Taglio autorizzazione-first e accoppiato alla difesa. **Esito (13/10/2026):**
      aggiunto il valore `ejpt` a `ManualCert` con etichetta i18n `certEjpt`; il manuale sale a 19
      capitoli / 58 argomenti / 44 laboratori guidati; aggiornate le asserzioni di conteggio in test
      ed E2E (progresso `x/19`, opzioni selettore, optgroup «Estensione · 0/5»). `npm run verify`
      verde, E2E Chromium verdi (Axe WCAG 2.2 AA incluso). Report: `docs/verify/2026-10-13-pentest01.md`.
- [x] **PENTEST-02 (P1) — Web application penetration testing (eJPT).** Argomenti su attacchi web
      (injection, XSS, traversal, autenticazione/sessione) in chiave difensiva, riusando
      `applicationsecurity`. **Completato quando:** il capitolo insegna il dominio web dell'eJPT con
      lab guidati su `applicationsecurity`, senza payload eseguibili e con sole contromisure.
      **Esito (14/10/2026):** nuovo capitolo estensione «Penetration testing delle applicazioni web
      (eJPT)» (ordine 20, cert `eJPT`) con tre argomenti — HTTP/mappatura/proxy di intercettazione,
      le classi di injection (SQLi, XSS, command injection, path traversal) e la loro radice comune,
      autenticazione/sessione/controllo degli accessi (IDOR, session fixation) — ciascuno con
      obiettivi, teoria progressiva, esempio su `example.test`, errori comuni, riferimenti MITRE
      ATT&CK (T1595, T1190, T1078) e un laboratorio guidato su `applicationsecurity`. **Nessun
      payload eseguibile**: injection e difetti descritti per concetto e radice, sempre con la
      contromisura strutturale (query parametrizzate, codifica in uscita, autorizzazione lato
      server). Il manuale sale a **20 capitoli / 61 argomenti / 47 laboratori guidati**; aggiornate
      le asserzioni di conteggio in test ed E2E (progresso `x/20`, 20 opzioni, optgroup «Estensione ·
      0/6»). `npm run verify` verde, E2E Chromium verdi (Axe WCAG 2.2 AA incluso). Report:
      `docs/verify/2026-10-14-pentest02.md`.
- [ ] **PENTEST-03 (P2) — Exploitation e post-exploitation (concetti).** Modello concettuale di
      exploitation, movimento laterale, pivoting e persistenza, mappato alla kill chain e alle
      evidenze; riusa `attackpaths` e `attacklab`.
- [ ] **SECX-01 (P2) — Sicurezza applicativa e supply chain.** Capitolo che insegna
      `applicationsecurity` dal lato difensivo (OWASP, SSDLC, SBOM, provenienza, hardening CI/CD).
- [ ] **SECX-02 (P2) — Email e fattore umano.** Capitolo che insegna `emailsecurity` (phishing,
      BEC, SPF/DKIM/DMARC) con lab guidato.
- [ ] **SECX-03 (P2) — Difese e resilienza non ancora in guida.** Insegnare i laboratori
      `endpointsecurity`, `routingsecurity`, `availability`, `recovery`, `segmentation`,
      `managementsecurity`, `layer2security` con capitoli/argomenti dedicati (uno per incremento).

## 💻 Senior Software Developer — architettura e manutenibilità

- [ ] **ENG-30 (P2) — Selettori di dominio-cert per il manuale.** Esporre nel modello contenuti
      la distinzione CCNA/eJPT/estensione in modo che indice e filtri possano raggruppare per
      percorso di certificazione senza logica ad hoc nella vista.
- [ ] **ENG-31 (P3) — Guard di conteggio dei capitoli.** Ridurre i magic number `x/N` nei test
      E2E derivandoli dal dataset dove possibile, per abbassare il costo di manutenzione quando il
      manuale cresce.

## 🔎 QA/Test Engineer — copertura e regressioni

- [ ] **QA-20 (P1) — Copertura E2E del percorso eJPT.** Uno smoke E2E che apre il capitolo eJPT,
      verifica l'etichetta cert e la navigabilità dei nuovi argomenti/laboratori guidati, con Axe.
- [ ] **QA-21 (P2) — Regressione parità IT/EN per i nuovi contenuti offensivi.** Estendere i
      controlli di parità e documentazione-target a ogni nuovo capitolo della Fase 2.

## 🎨 Visual Designer — identità e gerarchia

- [ ] **VIS-10 (P3) — Segno visivo del percorso di certificazione.** Un indicatore coerente (non
      solo testuale) che distingua capitoli CCNA, eJPT ed estensione nell'albero e nell'intestazione,
      rispettando contrasto AA e tema scuro.

## 🧭 UX/UI Designer — navigazione e accessibilità

- [ ] **UX-32 (P2) — Filtro per percorso di certificazione.** Permettere di filtrare l'indice del
      manuale per CCNA / eJPT / estensione, preservando routing, deep-link e WCAG 2.2 AA.
- [ ] **UX-33 (P3) — Progresso per percorso.** Mostrare il progresso separato per i due obiettivi
      di certificazione, oltre al totale.

## 🌍 Traduttore/Revisore inglese — parità e naturalezza

- [ ] **I18N-10 (P1, ricorrente) — Revisione IT/EN dei contenuti offensivi.** Ogni nuovo
      capitolo della Fase 2 passa la revisione di accuratezza tecnica e naturalezza, mantenendo la
      parità di acronimi e cifre imposta dai test.

## 🎓 Instructional Designer — progressione didattica

- [ ] **EDU-30 (P1) — Sequenza didattica a doppio binario.** Definire l'ordine di studio che
      intreccia i capitoli CCNA e il percorso eJPT (prerequisiti espliciti tra reti e offensiva).
- [ ] **EDU-31 (P2) — Collegamenti incrociati guida↔lab.** Ogni laboratorio insegnato in guida
      espone il back-link alla teoria (EDU-STRUCT-05), verificato dalla mappa inversa.

## 📝 Technical Writer — documentazione

- [x] **DOC-20 (P1) — Nuova roadmap di Fase 2 e archiviazione della Fase 1.** Questa roadmap
      sostituisce quella storica, conservata in `docs/roadmap-archive-2026-10-13.md`. **Esito
      (13/10/2026):** archivio con banner di rimando; nuova roadmap organizzata per le figure del
      team e per i due obiettivi di certificazione.
- [ ] **DOC-21 (P2) — README: obiettivi CCNA 200-301 + eJPT.** Aggiornare il README perché
      dichiari entrambi i percorsi e come il manuale li copre.

## 📅 Ordine consigliato

1. **PENTEST-01** ✅ → **PENTEST-02** → **PENTEST-03** (percorso eJPT, incrementi verticali).
2. In parallelo, **SECX-01…03** chiudono il divario guida↔laboratori, uno per incremento.
3. **QA-20/21** e **I18N-10** accompagnano ogni capitolo; **UX-32**, **VIS-10** e gli interventi
   **ENG** seguono quando i contenuti dei due percorsi giustificano filtri e segni dedicati.

## ✅ Criteri di completamento della Fase 2

- Il percorso **eJPT** è coperto dalle sue fasi principali (metodologia, ricognizione, scanning,
  web, exploitation/post-exploitation) con laboratori guidati e taglio difensivo.
- Ogni laboratorio interattivo ha una controparte teorica nel manuale (divario guida↔lab chiuso).
- Parità IT/EN, documentazione-target, `verify:offensive-content`, Axe WCAG 2.2 AA e audit
  restano verdi a ogni incremento.
- README e `docs/verify/` riflettono il doppio obiettivo CCNA 200-301 + eJPT.

## 🧾 Registro delle decisioni

- **13/10/2026 — Doppio obiettivo CCNA 200-301 + eJPT.** Su indicazione dell'utente, la Fase 2
  amplia argomenti e concetti verso l'eJPT (niente quiz né flashcard): contenuti teorici e
  laboratori, non gamification. I contenuti offensivi restano didattici, autorizzazione-first e
  accoppiati alla difesa, con soli target di documentazione.
- **13/10/2026 — Archiviazione Fase 1.** La roadmap storica è spostata in `docs/` come registro;
  `ROADMAP.md` ospita la roadmap attiva.

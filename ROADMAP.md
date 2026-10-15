# 🚀 Roadmap di Sviluppo — Fase 3: OSI-CYBER-EXPLORER

> **Baseline:** branch `main`, dopo la Fase 2 (storico in
> [`docs/roadmap-archive-phase2-2026-10-14.md`](docs/roadmap-archive-phase2-2026-10-14.md)).
> **Apertura Fase 3:** 14 ottobre 2026.
> **Obiettivi di certificazione:** **CCNA 200-301** e **eJPT — INE/eLearnSecurity Junior
> Penetration Tester**, in chiave didattica e autorizzata.
> **Stato del manuale:** 29 capitoli / 88 argomenti / 74 laboratori guidati, bilingue IT/EN,
> con il percorso eJPT completo e una sequenza di studio a doppio binario documentata.
> **Metodo:** incrementi verticali completi e verificati (`npm run verify`, E2E Chromium con
> Axe WCAG 2.2 AA, audit), pubblicati su `main`; ogni intervento documentato in `docs/verify/`.

## Legenda

- [ ] Da iniziare
- [~] In corso
- [x] Completato e verificato
- **P0 — Critica** · **P1 — Alta** · **P2 — Media** · **P3 — Evolutiva**

## 🎯 Visione della Fase 3

La Fase 2 ha reso il manuale un handbook bilingue a doppio percorso (CCNA 200-301 + eJPT) con
tutti i capitoli offensivi e molti difensivi. La Fase 3 chiude e consolida:

1. **Completare la copertura guida↔laboratori.** Restano pochi laboratori interattivi senza una
   controparte teorica nel manuale: un capitolo per ciascuno, uno per incremento.
2. **Nuovi laboratori interattivi.** Introdurre laboratori costruiti su misura per la metodologia
   eJPT (finora servita riusando le viste difensive), così che anche l'offensiva abbia il suo
   strumento interattivo, sempre didattico e con soli target di documentazione.
3. **Qualità trasversale.** Segni visivi del percorso di certificazione, filtri e progresso per
   percorso, revisione IT/EN continua e documentazione (README) allineata ai due obiettivi.

**Principio di responsabilità** (invariato dalla Fase 2): contenuti e laboratori offensivi a scopo
formativo, autorizzazione-first, accoppiati alla difesa, con soli indirizzi/host di documentazione;
il gate `verify:offensive-content` e la revisione dei contenuti tecnici restano vincolanti.

## 💻 Senior Software Developer — architettura, nuovi laboratori, manutenibilità

- [x] **LAB-01 (P1) — Nuovo laboratorio interattivo per la metodologia eJPT.** Una vista costruita
      su misura (nuovo `AppView`, registrata in `viewRegistry`, lazy-loaded) che renda interattiva
      una fase del penetration test. **Esito (14/10/2026):** nuovo laboratorio **«Stati di porta
      (scanning)»** (`AppView` `scanstates`, gruppo «Laboratori interattivi», icona radar),
      un **decodificatore** che, scelto il protocollo (TCP/UDP), confronta i tre casi
      aperto/chiuso/filtrato mostrando sonda, risposta, stato dedotto (con la sua certezza o
      ambiguità) e cosa osserva la difesa — un esploratore, non un quiz, con soli numeri di porta
      noti ed etichette di protocollo inerti. Dati bilingui in `src/content/scanStates.ts`
      (parità IT/EN), logica pura testata in `src/lib/scanStates.ts` (+ test), componente
      accessibile `ScanStatesLab.tsx`. Collegato dal capitolo eJPT di scanning (il lab guidato
      `gl-pentest-scan-states` e il link del topic puntano ora al nuovo lab). Coperto da E2E
      (`e2e/scan-states-lab.spec.ts`: apertura, toggle TCP/UDP, Axe WCAG 2.2 AA). `npm run verify`
      verde (84 file di test), E2E Chromium verdi. Report: `docs/verify/2026-10-14-lab01-scanstates.md`.
- [x] **ENG-30 (P2) — Selettori di dominio-cert per il manuale.** Esporre nel modello contenuti la
      distinzione CCNA/eJPT/estensione così che indice e filtri possano raggruppare per percorso di
      certificazione senza logica ad hoc nella vista. **Esito (15/10/2026):** catalogo tipizzato
      dei percorsi e delle etichette IT/EN; selettori puri per classificare, filtrare e raggruppare
      i capitoli; filtro opzionale nei gruppi per dominio, compatibile con la navigazione attuale.
      eJPT è distinto dalle estensioni; `both` resta CCNA + Security+. Nessuna duplicazione dei
      metadati dei capitoli. 12 test aggiuntivi, verifica completa e 64 E2E Chromium superati.
      Contratto: `docs/manual-certification-selectors.md`.
      Report: `docs/verify/2026-10-15-eng30-certification-selectors.md`.
- [x] **ENG-31 (P2) — Guard di conteggio dei capitoli.** Derivare dal dataset i numeri `x/N` oggi
      fissati nei test E2E/unit (progresso, opzioni del selettore, optgroup), per azzerare il costo
      di manutenzione a ogni nuovo capitolo. **Esito (14/10/2026):** i conteggi di capitoli nei test
      sono ora derivati dai selettori puri già testati (`manualStats()`, `chaptersByDomain()` in
      `src/lib/studyManual.ts`), unica fonte di verità, invece di letterali ripetuti. Sostituiti in
      `src/components/StudyManualView.test.tsx` (opzioni del selettore, optgroup CCNA/estensione,
      progresso), `e2e/manual-mobile-sticky.spec.ts` (opzioni, numero di optgroup, progresso con la
      percentuale derivata, optgroup inglese), `e2e/app-shell.spec.ts` (progresso totale e per dominio)
      e `e2e/manual-help.spec.ts` (progresso inglese). Le asserzioni ora provano che la vista rende
      **ogni** capitolo e gruppo (coerenza vista↔dati), non che un numero coincida con se stesso, e un
      nuovo capitolo non richiederà più di aggiornare a mano questi `x/N`. Solo codice di test: nessun
      cambio a prodotto o contenuti. Report: `docs/verify/2026-10-14-eng31-chapter-counts.md`.

## 🎓 Instructional Designer — contenuti e progressione

- [x] **CONTENT-01 (P2) — Segmentazione e confini di fiducia.** Capitolo che insegna il laboratorio
      `segmentation` (finora non in guida). **Esito (14/10/2026):** nuovo capitolo estensione
      (ordine 24, cert Security+) con tre argomenti — separare non è applicare (VLAN/ACL/direzione e
      posizionamento), microsegmentazione/east–west/Zero Trust, VRF/overlay/servizi condivisi e
      routing asimmetrico — ciascuno con obiettivi, teoria progressiva, esempio su `192.0.2.0/24`,
      errori comuni, riferimenti (NIST SP 800-41 Rev. 1, SP 800-207, RFC 4364) e un laboratorio
      guidato su `segmentation`; complemento difensivo del movimento laterale eJPT. Manuale a **24
      capitoli / 73 argomenti / 59 laboratori guidati**. Report: `docs/verify/2026-10-14-content01-segmentation.md`.
- [x] **CONTENT-02 (P2) — Laboratori difensivi ancora non in guida (uno per incremento).** Insegnare
      `routingsecurity`, `availability`, `recovery`, `managementsecurity`, `layer2security` con
      capitoli/argomenti dedicati, chiudendo del tutto il divario guida↔laboratori. **Completato — 5
      di 5 (15/10/2026).**
  - **(1/5)** «Sicurezza del routing e del control plane» (ordine 25, cert Security+) che insegna
    `routingsecurity` — fiducia del routing (adiacenze OSPF, integrità LSDB, redistribuzione/
    default-route injection), BGP/RPKI e anti-spoofing (uRPF, BCP 38), protezione del control plane
    (CoPP, coerenza RIB/FIB). Riferimenti RFC 2328/RFC 7454/NIST SP 800-189. Report:
    `docs/verify/2026-10-14-content02-routing.md`.
  - **(2/5)** «Disponibilità, DoS e capacità» (ordine 26, cert Security+) che insegna `availability`
    — il modello del DoS come esaurimento della risorsa più scarsa e scelta del punto di enforcement
    (locale/a monte), i flood di stato (SYN flood e SYN cookie, reflection/amplification con
    anti-spoofing, esaurimento delle tabelle), capacità e QoS (CAM/DHCP/DNS/NAT, code e starvation
    del traffico critico). Riferimenti MITRE ATT&CK T1498/T1499, RFC 4987. Report:
    `docs/verify/2026-10-14-content02-availability.md`.
  - **(3/5)** «Sicurezza del piano di gestione e della telemetria» (ordine 27, cert Security+) che
    insegna `managementsecurity` — isolamento della gestione (OOB, management VRF, SSHv2/VTY/AAA e
    accounting), telemetria attendibile (SNMPv3, Syslog protetto, tempo attendibile NTP per la
    correlazione e la catena di custodia), automazione e punti ciechi (NETCONF/RESTCONF/YANG stato
    effettivo, esposizione CDP/LLDP, backup e restore, sampling dei collector). Completa la trilogia
    dei piani (dati/controllo/gestione). Riferimenti NIST SP 800-53 Rev. 5, RFC 3411, RFC 6241.
    Report: `docs/verify/2026-10-14-content02-management.md`.
  - **(4/5)** «Resilienza e ripristino» (ordine 28, cert Security+) che insegna `recovery` — la
    ridondanza vera (percorsi/alimentazione realmente indipendenti, spare validato, accesso OOB), la
    procedura (dipendenze, continuità minima, condizioni di arresto) e la validazione (RTO/RPO, test
    per nome non per IP, backup verificati in restore). Chiude la faccia «ripristino» della
    disponibilità. Riferimenti NIST SP 800-34 Rev. 1, SP 800-53 Rev. 5, SP 800-184. Report:
    `docs/verify/2026-10-14-content02-recovery.md`.
  - **(5/5)** «Sicurezza dell'access layer: il confine della porta» (ordine 29, cert Security+) che
    insegna `layer2security` — la porta di accesso come confine di fiducia (ruolo, data/voice VLAN,
    CAM table e Port Security dimensionata sull'endpoint reale), l'integrità del first-hop (binding
    table di DHCP Snooping come fonte di verità per DAI e IP Source Guard, igiene di trunk e native
    VLAN contro il VLAN hopping) e la protezione della topologia commutata (guardie STP — BPDU/Root/
    Loop Guard — coerenza EtherChannel e contenimento/recovery di livello 2). Complemento difensivo,
    orientato al modello, dei comandi di hardening L2 del capitolo di sicurezza CCNA (14). Riferimenti
    IEEE 802.1Q, IEEE 802.1D, IEEE 802.1AX, RFC 2131. **Chiude del tutto il divario guida↔laboratori.**
    Report: `docs/verify/2026-10-15-content02-layer2.md`.

  Manuale a **29 capitoli / 88 argomenti / 74 laboratori guidati**; i conteggi di vista e test sono
  derivati dal dataset (ENG-31), quindi il nuovo capitolo non ha richiesto modifiche manuali alle
  asserzioni (progresso `x/29`, 29 opzioni, optgroup «Estensione · 0/15»). Divario guida↔laboratori
  chiuso: ogni laboratorio difensivo ha ora la sua controparte teorica nel manuale.

- [x] **EDU-31 (P2) — Collegamenti incrociati guida↔lab.** Verificare che ogni laboratorio insegnato
      esponga il back-link alla teoria (EDU-STRUCT-05) via la mappa inversa, anche per i nuovi
      capitoli. **Esito (15/10/2026):** il back-link è montato una sola volta dalla vista attiva
      (`App.tsx`, non per-lab), quindi ogni lab citato da un capitolo lo espone già; verificato che
      tutti i **30** lab insegnati risolvono a ≥1 capitolo (inclusi i nuovi difensivi `segmentation`,
      `routingsecurity`, `availability`, `managementsecurity`, `recovery`, `layer2security`). Aggiunto
      un **guard sistematico** che deriva l'insieme dei lab insegnati da `STUDY_MANUAL` (unica fonte
      di verità) e prova, per ciascuno, che `LabManualLink` renda i deep-link esatti dei capitoli
      citanti in ordine di studio — così un nuovo capitolo o un nuovo laboratorio guidato entra nel
      guard senza liste da mantenere a mano. Esteso l'E2E con un lab appena insegnato
      (`layer2security` → `access-layer-security`) per provare la catena completa nell'app reale.
      Solo codice di test: nessun cambio a prodotto o contenuti. Report:
      `docs/verify/2026-10-15-edu31-guide-lab-backlinks.md`.

## 🎨 Visual Designer — identità e diagrammi

- [x] **VIS-10 (P2) — Segno visivo del percorso di certificazione.** Un indicatore coerente (non
      solo testuale) che distingua capitoli CCNA, eJPT ed estensione nell'albero e nell'intestazione,
      rispettando contrasto AA e tema scuro. **Esito (15/10/2026):** introdotto un `TrackMark`
      riusabile — icona + colore per percorso (CCNA `Route`/indigo, eJPT `Crosshair`/rosa, estensione
      `ShieldHalf`/ambra), con la forma dell'icona come canale non cromatico (WCAG 1.4.1) e il nome
      del percorso sempre disponibile come testo (etichetta sr-only «Percorso …» su ogni riga
      dell'albero, copy di allineamento visibile nell'intestazione). Reso nell'albero dei capitoli
      (ogni riga), nel breadcrumb sticky e nell'eyebrow della card panoramica; il badge destro della
      panoramica ora distingue **eJPT** (chip rosa) dall'**estensione** Security+ (chip ambra), colmando
      il caso in cui eJPT — che vive nel gruppo «Estensione» — era indistinguibile. Palette riusate dal
      tema scuro del manuale (indigo/ambra già mappate) più un accento **rosa** aggiunto in `index.css`
      con token dedicati e mappature AA-verificate (chip eJPT 8.3:1 su sfondo scuro, 6.7:1 chiaro).
      Guard: test unit (conteggi `data-track` per percorso = dataset, etichette testuali, distinzione
      eJPT↔estensione nell'intestazione) ed E2E dedicato (`manual-track-marks.spec.ts`: marcatura in
      albero/intestazione + scansione Axe `color-contrast` del manuale scuro su un capitolo eJPT).
      Report: `docs/verify/2026-10-15-vis10-certification-track-marks.md`.
- [ ] **VIS-12 (P3) — Diagrammi dei nuovi concetti.** Micro-diagrammi SVG (coerenti con il sistema
      di design, leggibili in tema chiaro e scuro) per i concetti che un disegno chiarisce meglio del
      testo — p. es. east–west vs perimetro, catena di consegna dell'email, fasi del pentest.

## 🧭 UX/UI Designer — navigazione, filtri, accessibilità

- [x] **UX-32 (P2) — Filtro per percorso di certificazione.** Filtrare l'indice del manuale per
      CCNA / eJPT / estensione, preservando routing, deep-link e WCAG 2.2 AA. **Esito (15/10/2026):**
      controllo `TrackFilter` (gruppo di toggle con `aria-pressed`, icona di percorso + testo, Tutti/
      CCNA/eJPT/Estensione) che restringe l'indice via il selettore puro `chaptersByDomain(track)`
      (ENG-30). È **stato di vista, non navigazione**: non tocca URL, Back/Forward né il capitolo
      aperto (deep-link preservati); il flusso precedente/successivo e il progresso restano sull'intero
      insieme. Posizionato **fuori** dalla navigazione capitoli (l'albero resta solo-capitoli) e, su
      mobile, **fuori** dalla toolbar sticky (che mantiene il suo budget d'altezza), con la stessa
      sorgente di stato condivisa tra desktop e mobile. La select mobile conserva un'opzione nascosta
      per il capitolo aperto quando il filtro lo esclude, così il controllo resta valido. Guard: test
      unit (restringe l'albero, `aria-pressed`, nessuna navigazione) ed E2E dedicato
      (`manual-track-filter.spec.ts`: restringimento, routing/deep-link invariati, Axe WCAG 2.2 AA
      sullo stato filtrato). Report: `docs/verify/2026-10-15-ux32-certification-track-filter.md`.
- [x] **UX-33 (P3) — Progresso per percorso.** Mostrare il progresso separato per i due obiettivi di
      certificazione, oltre al totale. **Esito (15/10/2026):** nel header del manuale, accanto al
      progresso complessivo, una lista «Progresso per percorso» mostra il completamento separato per
      ciascun percorso (CCNA, eJPT, Estensione) — i due obiettivi di certificazione più l'estensione
      Security+, coerente con il filtro UX-32 e i segni VIS-10. Ogni voce ha l'icona di percorso
      (`TrackMark`) a rinforzo del nome scritto e un'etichetta accessibile completa
      («&lt;percorso&gt; · Progresso capitoli: x/n (p%)»). Derivato dai selettori puri
      `chaptersForCertificationTrack` + `chapterCompletion`, senza stato aggiuntivo: completare un
      capitolo avanza solo il suo percorso, mentre il totale conta tutti. Guard: test unit (un
      capitolo CCNA completato avanza solo CCNA; le altre route restano a 0; il totale conta) ed E2E
      dedicato (`manual-route-progress.spec.ts`). Report: `docs/verify/2026-10-15-ux33-per-route-progress.md`.

## 🧭 Riorganizzazione IA (richiesta utente, 15/10/2026)

- [x] **IA-10 (P1) — Due soli percorsi e guida unica.** Il manuale confondeva con un terzo gruppo
      «Estensione» e con una guida in pagina duplicata rispetto alla «Guida» globale. **Esito:** il
      modello delle tracce è ora binario — **Percorso CCNA** (dorsale CCNA + estensione difensiva
      Security+/avanzata) ed **eJPT** (offensiva); `ManualCertificationTrack` e
      `MANUAL_CERTIFICATION_TRACKS` hanno due sole voci, `certificationTrackForChapter` classifica
      eJPT↔CCNA. L'indice del manuale (albero desktop e select mobile), il filtro (UX-32) e il
      progresso per percorso (UX-33) raggruppano per queste due tracce; sparisce l'etichetta
      «Estensione» dall'interfaccia (chip di percorso CCNA/eJPT al posto di «Estensione»). Rimossa la
      guida in pagina del manuale («Come usare questa guida»): resta solo la «Guida» globale in testata.
      Aggiornati tutti i test unit/E2E; `npm run verify` verde, Playwright 65/65. Report:
      `docs/verify/2026-10-15-ia10-two-routes-single-guide.md`.
- [x] **IA-11 (P1) — Un solo percorso (Manuale) e menu a due voci.** **Esito (15/10/2026):** rimosso
      lo switcher a schede «Panoramica/Capitoli» (`CcnaHubTabs` eliminato da manuale e Mappa CCNA); il
      **Manuale è il percorso unico** ed è l'atterraggio predefinito (`DEFAULT_VIEW = 'manual'`, stato
      iniziale dello store allineato). La «Mappa CCNA» (`curriculum`) resta raggiungibile via deep-link
      ma non è più una voce di menu. Menu in alto ridotto a **due voci**: **Manuale** (link diretto) e
      **Laboratori** (dropdown con TUTTI i laboratori in un unico elenco, organizzati per sottotitoli
      d'area — Percorso CCNA, Laboratori interattivi, Sicurezza per area, Operazioni e difesa), più la
      ricerca ⌘K. `ViewGroupId` passa a `manual | labs` con `LabCategoryId` per i sottotitoli; i gruppi
      di vista e il modello di navigazione derivano dal registro. Routing, deep-link e WCAG 2.2 AA
      preservati. Aggiornati i test di registro/navigazione/routing e gli E2E; `npm run verify` verde,
      Playwright 64/64. Report: `docs/verify/2026-10-15-ia11-single-path-two-item-menu.md`.
- [x] **IA-12 (P1) — Menu laterale del manuale ad accordion per domini.** **Esito (15/10/2026):** la
      lista piatta di 26 capitoli sotto «Percorso CCNA» diventa un **accordion a sezioni di dominio
      CCNA** (1.0 Fondamenti di rete … 6.0 Automazione, più il bucket «Approfondimenti e Security+»),
      ciascuna con **progresso per sezione** (contatore + barra sottile) e disclosure accessibile
      (`aria-expanded`/`aria-controls`). Per impostazione predefinita è aperta **solo la sezione del
      capitolo attivo**, così l'indice resta corto e scansionabile; navigando verso un capitolo in una
      sezione chiusa (selettore mobile, precedente/successivo, deep-link) la sezione si apre da sola
      (adeguamento dello stato in render, non in effetto). Il percorso **eJPT** (una sola sezione) resta
      **flat**. Preservati i due `role="group"` di percorso e i marchi `data-track` (VIS-10); le sezioni
      sono disclosure, non landmark. Su mobile resta il selettore nativo compatto (budget altezza ≤112px).
      Contrasto AA verificato anche in tema scuro (chip indigo e barre adattate). Aggiornati gli unit test
      (accordion, auto-espansione) e l'E2E `manual-guided-exercise`; `npm run verify` verde, Playwright
      64/64. Report: `docs/verify/2026-10-15-ia12-manual-sidebar-accordion.md`.

## 🌍 Traduttore/Revisore inglese — parità e naturalezza

- [ ] **I18N-10 (P1, ricorrente) — Revisione IT/EN dei nuovi contenuti.** Ogni nuovo capitolo e
      laboratorio passa la revisione di accuratezza tecnica e naturalezza, mantenendo la parità di
      acronimi e cifre imposta dai test.

## 📝 Technical Writer — documentazione

- [x] **DOC-21 (P2) — README allineato ai due obiettivi e ai capitoli attuali.** Aggiornare le
      feature del manuale (oggi ferme ai primi capitoli) perché riflettano i 24 capitoli e il
      percorso eJPT, e dichiarare entrambi gli obiettivi CCNA 200-301 + eJPT. **Esito (14/10/2026):**
      aggiornati entrambi i README (`README.md` / `README.it.md`): tagline che dichiara i percorsi
      **CCNA 200-301 + eJPT**; descrizione del manuale riscritta per riflettere l'intera dorsale
      CCNA, l'**estensione Security+/avanzata** e la **traccia eJPT** (metodologia, web, exploitation/
      post-exploitation), con rimando al percorso di studio (`docs/STUDY_PATH.md`); aggiunto il nuovo
      laboratorio «Stati di porta (scanning)» all'elenco. Parità IT/EN mantenuta; `format:check`
      verde. Report: `docs/verify/2026-10-14-doc21-readme.md`.

## 📅 Ordine consigliato

1. **LAB-01** (primo laboratorio interattivo eJPT) in parallelo a **CONTENT-02** (chiusura del
   divario guida↔laboratori, uno per incremento).
2. **DOC-21** quando i capitoli si stabilizzano; **ENG-30/31** per ridurre il costo di manutenzione.
3. **VIS-10**, **UX-32/33** e **VIS-12** quando i due percorsi giustificano filtri, segni e diagrammi
   dedicati; **I18N-10** accompagna ogni incremento.

## ✅ Criteri di completamento della Fase 3

- Ogni laboratorio interattivo ha una controparte teorica nel manuale (divario guida↔lab chiuso).
- Esiste almeno un laboratorio interattivo costruito per la metodologia eJPT, collegato dal manuale.
- README e `docs/` riflettono i 24+ capitoli e il doppio obiettivo CCNA 200-301 + eJPT.
- Parità IT/EN, documentazione-target, `verify:offensive-content`, Axe WCAG 2.2 AA e audit restano
  verdi a ogni incremento.

## 🧾 Registro delle decisioni

- **14/10/2026 — Apertura Fase 3.** Chiusa la Fase 2 (percorso eJPT completo, sequenza a doppio
  binario, nuovo marchio). La Fase 3 completa la copertura guida↔laboratori, introduce laboratori
  interattivi per la metodologia eJPT e consolida qualità visiva, UX, i18n e documentazione. Roadmap
  storica Fase 2 archiviata in `docs/`.
- **Invarianti di responsabilità** (dalla Fase 2): contenuti offensivi didattici,
  autorizzazione-first, accoppiati alla difesa, con soli target di documentazione.

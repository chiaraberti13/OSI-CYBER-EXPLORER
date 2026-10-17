# 🚀 Roadmap di Sviluppo — Fase 3: OSI-CYBER-EXPLORER

> **Baseline:** branch `main`, dopo la Fase 2 (storico in
> [`docs/roadmap-archive-phase2-2026-10-14.md`](docs/roadmap-archive-phase2-2026-10-14.md)).
> **Apertura Fase 3:** 14 ottobre 2026.
> **Obiettivi di certificazione:** **CCNA 200-301** e **eJPT — INE/eLearnSecurity Junior
> Penetration Tester**, in chiave didattica e autorizzata.
> **Stato del manuale:** 29 capitoli / 104 argomenti / 77 laboratori guidati, bilingue IT/EN,
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
- [x] **VIS-12 (P3) — Diagrammi dei nuovi concetti.** Micro-diagrammi SVG (coerenti con il sistema
      di design, leggibili in tema chiaro e scuro) per i concetti che un disegno chiarisce meglio del
      testo — p. es. east–west vs perimetro, catena di consegna dell'email, fasi del pentest. **Esito
      (15/10/2026):** tre diagrammi SVG bilingui nei rispettivi argomenti, modello tipizzato,
      componente riusabile, alternative testuali visibili e riferimenti accessibili univoci.
      Verificati geometria su mobile, contrasto SVG e Axe nei due temi e nelle due lingue;
      68 E2E Chromium superati. Corretta la distinzione esito/policy DMARC e allineati README
      e istruzioni alla navigazione IA-10–12. Report: `docs/verify/2026-10-15-vis12-concept-diagrams.md`.

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
      acronimi e cifre imposta dai test. **Incremento VIS-12 (15/10/2026):** rivisti diagrammi,
      alternative testuali e correzioni DMARC in entrambe le lingue; guard bilingue superato.
      Il task resta aperto perché ricorrente; non implica revisione integrale dei dataset storici.
  - [x] **Incremento VPN/IPsec/DTLS (17/10/2026).** Risolto il residuo dei report
        AAA/EAP: distinti ESP/AH, modalità e servizi di protezione; corretti trailer,
        tag e header visibili, limiti VPN/DTLS e traduzioni. Revisionate 29 coppie;
        schemi ordinati e selettori accessibili. Guard bilingui, tastiera, Axe e
        reflow a 320/1280 px superati; 786 test unitari, 80 E2E e audit puliti.
        Report: `docs/verify/2026-10-17-i18n10-vpn.md`.
  - [x] **Incremento metodi EAP (17/10/2026).** Rivisti cinque metodi e 27 coppie
        IT/EN: validazione del server, autenticazione interna, provisioning PAC,
        challenge-response MD5 e distinzione tra autenticazione e connettività.
        Selettori accessibili e sequenze leggibili; guard bilingui, tastiera,
        Axe e reflow a 320/1280 px verificati. 786 test unitari e 78 E2E superati.
        Report: `docs/verify/2026-10-17-i18n10-eap.md`. Resta il residuo VPN P1/P2.
  - [x] **Incremento confronto AAA (17/10/2026).** Corrette e localizzate 22 coppie
        IT/EN di confronto e tracce RADIUS/TACACS+: offuscamento legacy distinto da
        TLS, autorizzazione distinta dai privilegi globali e accounting condizionale.
        Guard strutturale ed euristico, tastiera, Axe, reflow e lettura completa a
        320/1280 px verificati; 786 test unitari e 76 E2E superati, audit puliti.
        Preservati gli aggiornamenti concorrenti fino a `8927bb9`.
        Restano da revisionare EAP e VPN nello stesso pannello (P1/P2).
        Report: `docs/verify/2026-10-17-i18n10-aaa.md`.
  - [x] **Incremento catalogo protocolli (15/10/2026).** Revisionate tutte le 20 schede
        (`description`, `useCase`, `security`: 60 coppie IT/EN), corrette le imprecisioni
        tecniche e rimossa `protocolRegistry.ts` dalle esclusioni del guard bilingue.
        Il guard strutturale ora rileva anche chiavi lingua assenti e valori non stringa;
        pannello localizzato, ricerca nominata e badge senza garanzie assolute di sicurezza.
        Criteri: parità automatica, rendering IT/EN completo, ricerca, Axe e reflow a 320/1280 px.
        Report: `docs/verify/2026-10-15-i18n10-protocol-catalogue.md`.
  - [x] **Incremento catalogo porte (16/10/2026).** Revisionate 45 schede e 90 coppie
        IT/EN; corrette le note su TACACS+, posta/TLS, RADIUS, SNMP e database.
        Rimossa `portContent.ts` dalle esclusioni; corretti intervalli effimeri,
        porta Vite e lessico del pannello. Criteri verificati: parità strutturale
        ed euristica, ricerca e filtri, rendering completo IT/EN, Axe e reflow
        a 320/1280 px. `verify` superato (774 test), 72/72 E2E Chromium e audit puliti.
        Report: `docs/verify/2026-10-16-i18n10-port-catalogue.md`.
  - [x] **Incremento catalogo apparati (16/10/2026).** Revisionate 31 schede e 155
        coppie IT/EN; corretti capacità e limiti di firewall, switching, sensori,
        endpoint, accesso e infrastruttura. Rimossa l’ultima esclusione dal guard.
        Localizzati pannello e livelli OSI, corretti ricerca, reset completo,
        stato dei filtri e overflow dei badge. Criteri verificati: parità strutturale
        ed euristica, tutti i testi e filtri IT/EN, Axe e reflow delle singole schede
        a 320/1280 px; 777 test unitari e 74/74 E2E Chromium superati, audit puliti.
        Report: `docs/verify/2026-10-16-i18n10-device-catalogue.md`.
        Nessun catalogo resta escluso; I18N-10 rimane ricorrente per nuovi contenuti,
        senza dichiarare revisionato ogni testo storico dell’applicazione.
  - [x] **Incremento glossario (16/10/2026).** Revisionate tutte le 114 voci (228 definizioni
        IT/EN): accuratezza tecnica e parità confermate senza correzioni necessarie. Il
        glossario — unico dataset fondamentale rivolto al discente ancora assente — è stato
        aggiunto al guard strutturale `BILINGUAL_DATASETS` con un controllo dedicato per voce,
        così da intercettare con un walk ricorsivo anche un lato mancante in eventuali campi
        bilingui annidati futuri (dove il controllo superficiale di `content.test.ts` non
        arriverebbe). Criteri verificati: parità strutturale ed euristica (3228 coppie, nessun
        punto cieco), `verify` completo verde (778 test unitari), 74/74 E2E Chromium.
        Report: `docs/verify/2026-10-16-i18n10-glossary.md`.
  - [x] **Incremento manuale di studio (16/10/2026).** `STUDY_MANUAL` (29 capitoli / 88
        argomenti / 74 laboratori guidati, ~9500 righe) — il dataset bilingue più grande e
        importante dell'app — era protetto solo dall'euristica testuale, che per costruzione
        non rileva un lato lingua interamente mancante in un campo `Bilingual` annidato.
        Aggiunto al guard strutturale `BILINGUAL_DATASETS` con un controllo dedicato che
        percorre esplicitamente titoli, sommari, obiettivi, prerequisiti, teoria, esempi,
        errori comuni e, per ogni lab guidato, scenario/consegna/passi/sfida/soluzione/
        autovalutazione, con contatori anti no-op (>80 argomenti, >70 lab). Nessuna
        correzione di contenuto necessaria: tutti i campi hanno entrambe le lingue non vuote.
        Criteri verificati: `verify` completo verde (779 test unitari), guard bilingue 18 test,
        74/74 E2E Chromium, 0 vulnerabilità. Report: `docs/verify/2026-10-16-i18n10-study-manual.md`.
  - [x] **Incremento modello OSI (16/10/2026).** `OSI_LAYERS` (`osiLayers.ts`, ~1900 righe) —
        contenuto centrale dell'app — conserva le due lingue in blocchi paralleli
        `translations.en`/`translations.it`, non come coppie `{ it, en }` adiacenti: né
        l'euristica testuale né il walk strutturale raggiungevano quella prosa, e
        `content.test.ts` verificava solo nome/descrizione e il _conteggio_ di attacchi/difese.
        Aggiunto un controllo parallelo it↔en che verifica parità di lunghezza e non-vuoto di
        responsabilità, casi d'uso, fatti chiave e, per ogni attacco e difesa, dei campi
        testuali (nome, descrizione, funzionamento, impatto, mitigazione / metodo), con un
        contatore anti no-op (>300 stringhe traducibili). Nessun difetto rilevato: tutti i
        campi sono presenti e paralleli. Criteri verificati: `verify` completo verde (781 test
        unitari), 74/74 E2E Chromium, 0 vulnerabilità.
        Report: `docs/verify/2026-10-16-i18n10-osi-layers.md`.
  - [x] **Correzione padding oracle nei feedback di scenario (16/10/2026).** Revisionato
        `scenarioFeedback.ts` (i banner attacco/difesa del laboratorio OSI). Corretto un
        errore tecnico reale nel feedback `l6-oracle`: l'inglese affermava che l'attaccante
        «reconstructed ciphertexts», mentre un attacco _padding oracle_ **recupera il
        plaintext** (decifra byte per byte), come diceva già correttamente l'italiano. L'EN
        ora rispecchia l'IT («decrypted the ciphertext byte by byte by exploiting the
        server's distinguishable error responses to CBC padding»), ripristinando la parità
        di significato e la correttezza. Primo difetto di contenuto trovato in questa
        ricognizione I18N-10 (non un'aggiunta di guard). Criteri verificati: guard bilingue
        verde, `verify` completo (781 test), 74/74 E2E Chromium.
        Report: `docs/verify/2026-10-16-i18n10-scenario-feedback.md`.
  - [x] **Revisione e guard dei laboratori interattivi (16/10/2026).** Letti per intero i
        cinque dataset dei laboratori interattivi (`networkFundamentalsLab`, `networkAccessLab`,
        `ipConnectivityLab`, `ipServicesLab`, `securityFundamentalsLab`, ~2300 righe):
        accuratezza tecnica e parità IT/EN confermate (FHRP, OSPF, ACL/AAA, matrice WPA, DORA
        con timer T1/T2, VLAN/STP/EtherChannel, subnetting, prefissi IPv6), **nessun difetto
        trovato**. Questi dataset — unico contenuto didattico ancora raggiunto solo
        dall'euristica testuale — sono stati messi sotto controllo strutturale con un unico
        test che percorre per namespace ogni export dei cinque moduli (scala agli export
        futuri), con contatore anti no-op (>100 coppie). Criteri verificati: `verify` completo
        verde (782 test), guard bilingue 19 test, 74/74 E2E Chromium, 0 vulnerabilità.
        Report: `docs/verify/2026-10-16-i18n10-interactive-labs.md`.
  - [x] **Incremento diagrammi VIS-13 (17/10/2026).** Revisionati titolo, descrizioni, nodi,
        dettagli ed etichette IT/EN dei diagrammi OSI e QoS. Corretto un titolo innaturale, reso
        esplicito che LLQ dà priorità alla classe configurata (non solo alla voce) e allineato
        «trust/remark» tra le lingue. `MANUAL_DIAGRAMS` ora è incluso nel guard strutturale; le
        frecce decorative senza testo sono modellate senza etichetta, mentre i test unitari
        verificano ogni testo effettivamente reso in entrambe le lingue. Report:
        `docs/verify/2026-10-17-i18n10-vis13-diagrams.md`.

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

## 🔭 Prossimi interventi utili (backlog verificato)

> Lo scopo obbligatorio della Fase 3 è raggiunto: tutti i task sopra sono completati e verificati.
> **I18N-10** e **CONTENT-10** restano aperti per loro natura ricorrente. Gli elementi seguenti sono evolutivi e
> **facoltativi**, derivati da osservazioni reali su `main`; non sono blocchi. Ciascuno porta criteri
> di completamento verificabili, così che un incremento resti un incremento verticale e verde.

- [x] **PERF-01 (P2) — Margine del budget JavaScript iniziale.** **Intervento verificato in locale
      (17/10/2026):** l'entry gzip è scesa da **122.911 B** a **83.816 B** (−31,8%; margine sul budget
      125.000 B da 2.089 B a 41.184 B). La treemap ha individuato il dataset bilingue completo del
      manuale nell'entry attraverso `viewRouting`, `store`, preferenze e `LabManualLink`, oltre a
      Motion importato dallo shell. Sostituiti gli accessi runtime al dataset con l'indice compatto
      `manualRouteIndex.ts` (29 capitoli, 96 argomenti, collegamenti lab), la cui parità è verificata
      contro il dataset; guida caricata solo all'apertura; le animazioni dello shell usano CSS e
      rispettano `prefers-reduced-motion`. Il dataset completo resta nel chunk lazy del manuale
      (**232.790 B gzip**), mentre il chunk Ports misura **47.968 B gzip**. `size-limit` e il budget
      manifest passano su **36** route lazy. Dopo il push su `main`, i workflow **Performance budgets**
      (comprensivo di Lighthouse CI) ed **E2E** sono terminati con esito `success`, insieme a CI,
      CodeQL, OSV, Security Supply Chain, OpenSSF Scorecard e Dynamic Deployment Security. Report:
      `docs/verify/2026-10-17-perf01-shell-bundle.md`.
- [ ] **CONTENT-10 (P3, ricorrente) — Nuovi argomenti per i due percorsi.** Proseguire l'aggiunta di
      argomenti ad alto valore nei capitoli esistenti (es. CCNA: QoS applicata, lettura della GUI del
      WLC; eJPT: enumerazione SMB/SNMP, cracking offline degli hash, basi di Active Directory), uno per
      incremento, senza creare capitoli eJPT oltre ai tre fissati dai test. **Criteri:** ogni argomento
      bilingue IT/EN con obiettivi, teoria ed errori comuni, riferimenti ATT&CK/RFC/NIST risolti in
      HTTPS, solo target di documentazione; guard bilingue e integrità del manuale verdi; conteggi
      derivati dal dataset; report in `docs/verify/`.
  - [x] **Incremento QoS applicata (17/10/2026).** Aggiunto l'argomento CCNA 200-301 dominio 4.7
        `ip-services-qos` al capitolo `ip-services`: PHB/DiffServ, classificazione e marcatura
        (CoS 3 bit di livello 2 vs DSCP 6 bit di livello 3; EF/DSCP 46, AF, CS0), gestione della
        congestione (LLQ, CBWFQ, WRED contro il tail drop) e policing vs shaping con il confine di
        fiducia. Contenuto difensivo/neutro, teoria-only (come NTP), riferimenti RFC 2474 e
        RFC 4594 risolti in HTTPS. Parità IT/EN curata su acronimi e cifre. `manualStats()` →
        29/93/77. `verify` completo verde (786 test), E2E 74/74 con Axe, budget 122,9 kB gzip,
        `npm audit` 0 vulnerabilità. Report: `docs/verify/2026-10-17-content10-qos.md`.
  - [x] **Incremento GUI WLC Catalyst 9800 (17/10/2026).** Aggiunta una lezione CCNA bilingue sul
        modello IOS XE WLAN profile → policy profile → policy tag, assegnazione distinta dei tag site/RF,
        central vs local switching, percorso VLAN/trunk/gateway e hardening del piano di gestione. Chiarita
        la distinzione dalla GUI classica AireOS già presente; aggiunto diagramma accessibile e riferimenti
        Cisco/RFC 5415. `manualStats()` → 29/97/77. Typecheck, guard bilingue/tecnico/offensive e test mirati
        verdi. Report: `docs/verify/2026-10-17-content10-wlc-policy-mapping.md`.
  - [x] **Incrocio blueprint eJPT/CCNA (17/10/2026).** Verificate direttamente la pagina INE e il PDF
        Cisco v1.1. Lacune di contenuto colmate con estensioni bilingui: auditing da file/utenti/hash e
        trasferimento sicuro delle evidenze, ipotesi sul sistema operativo, OSINT aziendale/email, route e
        port forwarding, modifica concettuale di exploit e brute force di login web; per CCNA 2.9 aggiunte
        QoS WLAN e impostazioni GUI avanzate. Mappa puntuale, pesi correnti e residui documentati nel report
        `docs/verify/2026-10-17-syllabus-crosscheck-update.md`.
- [x] **EDU-40 (P3) — Esercizi guidati per gli argomenti aggiunti.** **Esito (16/10/2026):** aggiunti
      tre esercizi guidati ai nuovi argomenti eJPT, riusando laboratori interattivi già registrati:
      «Attacchi alle password» → `identitytrust`, «Inclusione di file e directory traversal» →
      `applicationsecurity`, «Reverse shell e bind shell» → `inspection`. L'argomento CCNA **NTP**
      resta solo-teoria: non esiste un laboratorio interattivo con cui abbinarlo in modo istruttivo, e
      forzarlo sarebbe un riuso debole. Ogni `guidedLab` è bilingue con `steps`, `solution` e
      `selfCheck` non vuoti e punta a una vista registrata; laboratori guidati 74 → 77, conteggi
      derivati dal dataset. `studyManual.test.ts` e l'E2E QA-20 (che deriva i conteggi) restano verdi.

## 📚 Contenuti pianificati (backlog, 17/10/2026)

> Piano concreto di **contenuti da aggiungere** e **miglioramenti ai contenuti**, derivato da una
> ricognizione reale della copertura su `main` (218 id di capitoli/argomenti/lab; `manualStats()` →
> 29 capitoli / 104 argomenti / 77 laboratori guidati; **104/104** argomenti con `references` (CONTENT-15
> completato e mantenuto dal guard), **9/104** con `diagram` SVG). **VIS-13** è completata sui candidati
> identificati; **CONTENT-10** e **I18N-10** restano aperti come attività ricorrenti. CONTENT-11,
> CONTENT-12, CONTENT-13 e CONTENT-15 sono stati completati il 17/10/2026.
> I vincoli di sempre restano: bilingue IT/EN con parità di acronimi e
> cifre, riferimenti ATT&CK/RFC/NIST/Cisco risolti in **HTTPS**, **soli target di documentazione**,
> **nessun nuovo capitolo eJPT** oltre ai tre fissati dai test (gli argomenti eJPT entrano nei
> capitoli esistenti), conteggi **derivati dal dataset** (ENG-31), guard bilingue e integrità del
> manuale verdi, un incremento verticale per volta con report in `docs/verify/`.

### Contenuti da aggiungere — nuovi argomenti ad alto valore

- [x] **CONTENT-11 (P2) — eJPT: enumerazione dei servizi di rete (SMB/SNMP/NFS).** **Esito
      (17/10/2026):** aggiunto l'argomento `pentest-service-enumeration` al capitolo eJPT
      `pentest-methodology`, subito dopo scanning ed enumerazione. Copre, in chiave didattica e
      difensiva, cosa espone ciascun servizio mal configurato — **SMB** (445/139: sessioni null/guest,
      elenco di share, utenti e politica password, SMBv1 obsoleto vs firma su SMBv2/3), **SNMP** (UDP
      161: community string «public» RO/«private» RW in chiaro su v1/v2c, enumerazione via MIB,
      rimedio SNMPv3), **NFS** (2049: export troppo aperti e `no_root_squash`, rimedio con root squash
      e Kerberos su NFSv4) — con la difesa e la telemetria che rivela l'enumerazione per ciascuno.
      Contenuto concettuale/difensivo, nessun comando operativo, soli target di documentazione
      (`192.0.2.0/24`). Riferimenti risolti in HTTPS: ATT&CK **T1135** (Network Share Discovery) e
      NIST **SP 800-123**. Parità IT/EN curata su acronimi e cifre (445/139, 161, 2049, RO/RW,
      v1/v2c/v3, SMBv1/2/3). Teoria-only (nessun laboratorio interattivo adeguato). `manualStats()`
      29 → **29/94/77**. Guard bilingue strutturale ed euristico e integrità del manuale verdi,
      typecheck pulito. Report: `docs/verify/2026-10-17-content11-service-enumeration.md`.
- [x] **CONTENT-12 (P2) — eJPT: basi di Active Directory.** **Esito (17/10/2026):** aggiunto
      l'argomento `active-directory-basics` al capitolo eJPT `exploitation-post-exploitation`, dopo
      movimento laterale e pivoting (di cui estende il modello di fiducia). Copre il modello **AD**
      (dominio, foresta, **OU**, **GPO**, **DC** come directory LDAP e autorità di autenticazione),
      l'autenticazione **Kerberos** (**KDC**, **TGT**, **TGS**) vs **NTLM** a livello concettuale, la
      superficie tipica (enumerazione LDAP da utente di dominio, relazioni di fiducia tra domini/
      foreste) e la difesa stratificata (tiering amministrativo, hardening degli account di servizio
      Kerberos, monitoraggio degli eventi del DC). Taglio concettuale/difensivo, nessuna tecnica
      operativa, soli target di documentazione (`192.0.2.0/24`). Riferimenti risolti in HTTPS: ATT&CK
      **T1087.002** (Account Discovery: Domain Account) e **RFC 4120** (Kerberos V5). Parità IT/EN
      curata su acronimi (AD/OU/GPO/DC/LDAP/KDC/TGT/TGS/NTLM/Kerberos). Teoria-only. `manualStats()`
      94 → **29/95/77**. Guard bilingue e integrità del manuale verdi, typecheck pulito. Report:
      `docs/verify/2026-10-17-content12-active-directory.md`.
- [x] **CONTENT-13 (P3) — eJPT: cracking offline degli hash in ottica difensiva.** **Esito
      (17/10/2026):** aggiunto l'argomento complementare `offline-hash-cracking-defense` al capitolo
      eJPT `pentest-methodology`, dopo gli attacchi alle password (di cui copre il lato memorizzazione
      senza ridondanza: il precedente tratta strategie d'attacco e difese di account, questo il
      modello di costo e lo storage). Copre: perché un hash catturato è attaccabile offline (nessun
      rate limiting/log, costo = tentativi × costo per hash); hash veloci (MD5/SHA-1 nudi, miliardi/s
      su GPU) vs KDF lente con fattore di lavoro (bcrypt/scrypt/Argon2/PBKDF2); il **sale** per-utente
      che annulla la precomputazione (rainbow table) e il **pepper** fuori dal database; il budget a
      due fattori entropia × fattore di lavoro (nessuno basta da solo). Nessun comando di cracking,
      soli target di documentazione. Riferimenti risolti in HTTPS: NIST **SP 800-63B** (memorized
      secret) e ATT&CK **T1110.002** (Password Cracking); OWASP non è un tipo `SecurityReference`
      (`rfc|ieee|nist|attack|cisco`), quindi non citato come riferimento strutturato. Parità IT/EN
      su acronimi e cifre. Teoria-only. `manualStats()` 95 → **29/96/77**. Guard bilingue, integrità
      del manuale (incluso il guard dei riferimenti) e typecheck verdi. Report:
      `docs/verify/2026-10-17-content13-offline-cracking.md`.

### Miglioramenti ai contenuti esistenti

- [x] **CONTENT-15 (P2) — Completare i riferimenti mancanti.** **Esito (17/10/2026):** aggiunto un
      riferimento autorevole risolto in HTTPS ai **10** argomenti (tutti fondamenti CCNA) che ne erano
      privi, portando la copertura a **95/95**. Elenco esatto (derivato dal guard, non a mano):
      `osi-seven-layers` (Cisco OSI reference model), `ethernet-frame-mac` (IEEE 802.3),
      `switch-cam-learning` (IEEE 802.1D), `collision-broadcast-domains` (IEEE 802.3 + 802.1D),
      `vlan-segmentation` (IEEE 802.1Q), `trunk-dot1q` (IEEE 802.1Q), `stp-loops` (IEEE 802.1D),
      `routing-table-lpm` (RFC 4632 / CIDR-LPM), `static-default-routes` (RFC 1812), `dns-resolution`
      (RFC 1035). Aggiunto il **guard** `studyManual.test.ts` «ogni argomento espone ≥1 riferimento»
      (binario: l'estensione Security+ è piegata sul percorso CCNA, quindi copre entrambi i percorsi
      d'esame): un nuovo argomento senza riferimento ora fallisce in CI. Nessuna URL non-HTTPS (il
      test di risoluzione resta verde). I riferimenti sono `{kind,id}` senza testo, quindi senza
      impatto bilingue. Report: `docs/verify/2026-10-17-content15-references.md`.
- [x] **VIS-13 (P3) — Estendere i micro-diagrammi SVG ai concetti chiave.** **Esito (17/10/2026):**
      i due candidati rimanenti identificati — albero STP e handshake IKEv2/Child SA — sono stati completati;
      il manuale ha **9/104** diagrammi bilingui. Ogni incremento conserva alternativa testuale, `id`
      accessibili univoci, contrasto e Axe nei due temi/lingue, geometria a 320/1280 px ed E2E dedicato.
      Ulteriori concetti potranno aprire un nuovo intervento quando una lacuna didattica concreta li motiverà.
  - [x] **Incremento incapsulamento OSI + QoS (17/10/2026).** Aggiunti diagrammi SVG bilingui ai
        temi `osi-encapsulation` e `ip-services-qos`: sequenza di PDU e aggiunta degli header/FCS;
        confine di fiducia, classificazione DSCP e gestione delle code LLQ/CBWFQ/WRED. Ogni figura ha
        descrizione completa e visibile, titolo/descrizione accessibili e riferimenti SVG univoci; il
        diagramma richiama i limiti già insegnati (protocollo/link variabili, QoS non crea banda).
        I diagrammi coperti passano da 3/96 a 5/96. E2E: 8 combinazioni lingua/tema a viewport 320 e
        1280 px, controllo Axe, contrasto, overflow e nomi/descrizioni accessibili; suite completa
        84/84. Report: `docs/verify/2026-10-17-vis13-encapsulation-qos.md`.
  - [x] **Incremento catena di fiducia PKI/TLS (17/10/2026).** Aggiunto il diagramma SVG bilingue
        `pki-tls-chain` al tema `pki-tls-certificate-chain` (capitolo `crypto-vpn-pki-tls`): Root CA
        (autofirmata, nel trust store) → Intermediate CA → certificato server, con la freccia
        tratteggiata della validazione che risale dal certificato alla Root (firma, validità, nome,
        revoca CRL/OCSP). Riusa `MANUAL_DIAGRAMS`/`ManualConceptDiagram`; alternativa testuale
        visibile, `id` accessibili univoci, inline senza asset remoti; schema che dichiara i limiti
        (cross-signing e pinning omessi). Diagrammi coperti 6/97 → **7/97**. Guard del componente
        (attacco a 1 solo tema, resa IT/EN) e guard bilingue strutturale verdi; E2E
        `manual-concept-diagrams.spec.ts` esteso al capitolo `crypto-vpn-pki-tls`: 8/8 combinazioni
        lingua/tema a 320 e 1280 px (overflow, contrasto ≥ 4.5, Axe WCAG 2.2 AA). Report:
        `docs/verify/2026-10-17-vis13-pki-tls-chain.md`.
  - [x] **Incremento albero STP e ruoli delle porte (17/10/2026).** Aggiunto il diagramma SVG bilingue
        `stp-tree` al tema `stp-loops` (capitolo `vlan-trunk-stp`): Root Bridge (Bridge ID più basso) con
        Switch B e C, frecce Root Port / Designated verso la radice e il collegamento ridondante B–C
        tratteggiato in Blocking che spezza il loop. Riusa `MANUAL_DIAGRAMS`/`ManualConceptDiagram`;
        alternativa testuale visibile, `id` accessibili univoci, etichette d'arco uniche, inline senza
        asset remoti; schema che dichiara i limiti (priorità, costi di percorso e temporizzazioni non
        mostrati). Diagrammi coperti 7/102 → **8/102**. Guard del componente e guard bilingue
        strutturale verdi; E2E `manual-concept-diagrams.spec.ts` esteso al capitolo `vlan-trunk-stp`:
        8/8 combinazioni lingua/tema a 320 e 1280 px (overflow, contrasto ≥ 4.5, Axe WCAG 2.2 AA).
        Report: `docs/verify/2026-10-17-vis13-stp-tree.md`.
  - [x] **Incremento handshake IKEv2/CHILD_SA (17/10/2026).** Aggiunto il diagramma bilingue
        `ikev2-handshake` a `ipsec-ikev2-depth`, distinguendo IKE_SA_INIT (suite, DH, nonce), IKE_AUTH
        (autenticazione e prima CHILD_SA), IKE SA/control plane e CHILD_SA/data plane; la descrizione
        dichiara il caso comune e gli scambi successivi CREATE_CHILD_SA. Diagrammi 8/104 → **9/104**.
        Guard bilingue/componente e E2E su lingue, temi e viewport verificati; report:
        `docs/verify/2026-10-17-vis13-ikev2-handshake.md`.
- [ ] **I18N-10 (P1, ricorrente) — Revisione IT/EN dei nuovi contenuti.** Vedi la voce dedicata nella
      sezione del Traduttore/Revisore: ogni argomento o diagramma aggiunto da questo backlog passa la
      revisione di accuratezza e naturalezza con parità di acronimi e cifre prima della pubblicazione.
  - [x] **Incremento diagrammi VIS-13 (17/10/2026).** Revisione linguistica e tecnica IT/EN completata;
        dettagli e verifiche nella sezione I18N-10 e in `docs/verify/2026-10-17-i18n10-vis13-diagrams.md`.
  - [x] **Diagramma modello tag WLC (17/10/2026).** Aggiunto diagramma verticale accessibile che
        distingue WLAN profile, policy tag, policy profile, tag AP e percorso dati; incremento revisionato
        in IT/EN. Report: `docs/verify/2026-10-17-content10-wlc-policy-mapping.md`.
  - [x] **Revisione IT/EN del contenuto WLC (17/10/2026).** Verificati equivalenza degli obiettivi,
        flusso dei profili/tag, porte CAPWAP, comportamento central/local e terminologia di sicurezza;
        report e verifiche in `docs/verify/2026-10-17-content10-wlc-policy-mapping.md`.
  - [x] **Revisione IT/EN del cross-check INE/Cisco (17/10/2026).** Riviste le nuove estensioni del
        manuale su auditing da file, OS fingerprinting, OSINT, pivoting, exploit, login web e QoS WLAN;
        la parità di obiettivi, acronimi e limiti di scope è verificata dai guard bilingui e dai test.
        Report: `docs/verify/2026-10-17-syllabus-crosscheck-update.md`.

## 🧭 Mappa di copertura eJPT (pagina ufficiale INE)

Corrispondenza tra i **4 domini ufficiali** della pagina INE e gli argomenti del manuale (contenuti
bilingui, didattici e vincolati allo scope autorizzato; eJPT resta nei **3 capitoli** fissati dai
test). La pagina di certificazione è stata verificata direttamente il **17/10/2026**: i pesi
pubblicati sono **35% / 25% / 25% / 15%**. Per la mappatura puntuale degli obiettivi e le lacune
colmate, vedi `docs/verify/2026-10-17-syllabus-crosscheck-update.md`.

- **Host & Network Penetration Testing (35%)**
  - System/Host-Based Attacks → `system-host-based-attacks`
  - Network-Based Attacks → `network-based-attacks` (ARP/MITM, LLMNR/NBT-NS)
  - The Metasploit Framework, selezione e modifica concettuale di exploit → `exploitation-frameworks-metasploit`
  - Exploitation → `exploitation-concepts`, `exploitation-reverse-bind-shell`
  - Post-Exploitation → `post-exploitation-privesc`
  - Pivoting (route e port forwarding) → `lateral-movement-pivoting`
  - Brute force e cracking hash → `pentest-password-attacks`, `offline-hash-cracking-defense`
  - Active Directory → `active-directory-basics`
- **Assessment Methodologies (25%)**
  - Information Gathering (fonti pubbliche, azienda/email/tecnologia) → `pentest-recon-footprinting`
  - Footprinting, endpoint e service discovery, ipotesi OS → `pentest-scanning-enumeration`
  - Enumeration (SMB/SNMP/NFS) → `pentest-service-enumeration`
  - Vulnerability Assessment, criticità e impatto → `pentest-vulnerability-assessment`
- **Host and Networking Auditing (25%)**
  - File autorizzati, rete/sistema, utenti, password/hash e trasferimento controllato delle evidenze →
    `host-network-auditing`
- **Web Application Penetration Testing (15%)**
  - Web/HTTP e ricognizione → `web-http-proxy-mapping`, `web-enumeration`
  - Vulnerabilità, file e directory nascosti → `web-injection-classes`, `web-file-inclusion-traversal`,
    `web-enumeration`
  - Brute force del login e difese online → `pentest-password-attacks`, `web-auth-session-access`
- **Social engineering** (contesto aggiuntivo, non dominio autonomo della pagina) →
  `phishing-social-engineering` (capitolo estensione)

Stato: **tutti i quattro domini e gli obiettivi elencati dalla pagina INE risultano mappati** dopo
l'incrocio del 17/10/2026. I paragrafi aggiunti colmano raccolta da file, fingerprinting OS, dettagli
OSINT, route/port forwarding, modifica concettuale degli exploit, login web e QoS/GUI WLAN. Gli
ampliamenti futuri restano sotto **CONTENT-10** (ricorrente), senza nuovi capitoli eJPT né istruzioni
operative fuori da ambienti autorizzati.

## 🧾 Registro delle decisioni

- **17/10/2026 — Incrocio iniziale eJPT + CCNA v1.1.** Incrociati
  gli argomenti con la pagina eJPT INE e il PDF CCNA 200-301 v1.1 (le fonti ufficiali non erano
  raggiungibili via DNS dal sandbox — `ENOTFOUND` su `ine.com` e `learningcontent.cisco.com` — quindi
  dato ricavato via ricerca web e segnalato come da riconfermare). Emerse e colmate **due lacune
  reali**:
  1. **CCNA v1.1 obiettivo 6.4** — «AI (generativa e predittiva) e machine learning nelle operazioni
     di rete», novità della v1.1 (ago 2024), assente: aggiunto l'argomento `automation-ai-ml-netops`
     al capitolo `automation-programmability` (ML vs IA predittiva vs generativa, AIOps/anomaly
     detection/assistenti, limiti e verifica umana; taglio concettuale da esame).
  2. **eJPTv2 dominio «Host & Network Auditing» (~25%)** — l'eJPTv2 ha **4 domini**, non 3; questo
     mancava: aggiunto l'argomento `host-network-auditing` al capitolo `pentest-methodology` (stato di
     rete locale: routing/ARP/porte in ascolto; audit di SMB/FTP/SSH/HTTP/SQL; speculare difensivo con
     baseline e minima esposizione). Corretta la mappa di copertura eJPT (4 domini con pesi).
     Entrambi difensivi/neutri, soli target di documentazione; riferimenti Cisco (6.4) e ATT&CK T1016 +
     NIST SP 800-115 (auditing) risolti in HTTPS. Nessun nuovo capitolo eJPT. Manuale 102 → **104**
     argomenti; `MANUAL_ROUTE_INDEX` in sincrono. `verify` completo verde, E2E Chromium con Axe verdi,
     0 vulnerabilità. Report: `docs/verify/2026-10-17-syllabus-crosscheck.md`.
- **17/10/2026 — VIS-13: diagramma albero STP e ruoli delle porte.** Aggiunto il diagramma bilingue
  `stp-tree` al tema `stp-loops` (Root Bridge con Switch B/C, Root Port/Designated e il link ridondante
  in Blocking che spezza il loop), riusando il modello/componente VIS-12. Diagrammi 7/102 → **8/102**.
  Alternativa testuale visibile, `id` univoci, etichette d'arco uniche, inline. Guard componente e
  bilingue strutturale verdi; E2E diagrammi 8/8 a 320/1280 px (overflow, contrasto, Axe). `verify`
  completo verde, E2E Chromium verdi, 0 vulnerabilità. Resta candidato l'handshake IKEv2/Child SA.
  Report: `docs/verify/2026-10-17-vis13-stp-tree.md`.
- **17/10/2026 — eJPT: «System/Host-Based Attacks» e «Web application enumeration» (moduli del
  syllabus).** Aggiunti due argomenti che completano la copertura dei moduli eJPTv2:
  `system-host-based-attacks` (capitolo `exploitation-post-exploitation`: exploitation di servizi/OS
  locali — servizi obsoleti con CVE, credenziali deboli, permessi errati/SUID — e hardening dell'host:
  patch, minima funzionalità, baseline, logging/EDR; riferimenti ATT&CK T1210 + NIST SP 800-123) e
  `web-enumeration` (capitolo `web-app-pentest`: content discovery, virtual host, fingerprinting dello
  stack, file di default/backup, errori verbosi; difesa contro la sicurezza per oscurità; riferimenti
  ATT&CK T1595 + T1595.003). Didattici/difensivi, nessun comando operativo, target di documentazione.
  Aggiunta la **mappa di copertura eJPT** in ROADMAP. Manuale 100 → **102** argomenti;
  `MANUAL_ROUTE_INDEX` in sincrono. Guard integrità, riferimenti (102/102), indice di rotta e bilingue
  (strutturale + euristico) verdi. Report: `docs/verify/2026-10-17-ejpt-host-web-enum.md`.
- **17/10/2026 — eJPT: «The Metasploit Framework» e «Network-Based Attacks» (moduli del syllabus).**
  Aggiunti due argomenti al capitolo eJPT `exploitation-post-exploitation`, corrispondenti a moduli
  omonimi del dominio **Host & Network Penetration Testing** della certificazione eJPT (INE eJPTv2),
  finora assenti: `exploitation-frameworks-metasploit` (struttura di un framework di exploitation —
  moduli exploit/auxiliary/post, payload staged/stageless, sessioni e handler, connessione di ritorno
  in egress — e cosa ne rileva/previene la difesa: firme EDR/IDS, patch, egress) e
  `network-based-attacks` (ARP spoofing/MITM e poisoning LLMNR/NBT-NS, con difese DHCP snooping+DAI,
  disattivazione LLMNR/NBT-NS, firma SMB, cifratura, monitoraggio). Didattici/difensivi, nessun
  comando operativo, target di documentazione; riferimenti NIST SP 800-115 e ATT&CK T1557/T1557.001
  risolti in HTTPS. Nessun nuovo capitolo eJPT (i 3 restano fissi): approfondimenti come argomenti,
  ancorati ai moduli ufficiali del corso, non inventati. Manuale 98 → **100** argomenti;
  `MANUAL_ROUTE_INDEX` aggiornato in sincrono. Guard integrità manuale, riferimenti (100/100), indice
  di rotta e bilingue verdi. Report: `docs/verify/2026-10-17-ejpt-metasploit-network-attacks.md`.
- **17/10/2026 — eJPT: argomento «Valutazione delle vulnerabilità» (syllabus reale).** Aggiunto
  l'argomento `pentest-vulnerability-assessment` al capitolo eJPT `pentest-methodology`, dopo
  l'enumerazione dei servizi: è una sotto-fase esplicita del dominio **Assessment Methodologies**
  della certificazione eJPT (INE eJPTv2), finora solo implicita. Tratta la correlazione
  servizio/versione → debolezza nota (CVE/CVSS), l'ipotesi-vs-verifica (falsi positivi, patch
  retroportate), scansione autenticata vs non autenticata, prioritizzazione per esposizione/exploit/
  valore dell'asset e il ciclo difensivo di vulnerability management. Difensivo/neutro, nessun tool
  operativo, target di documentazione; riferimento NIST **SP 800-115** risolto in HTTPS. Nessun nuovo
  capitolo eJPT (i 3 capitoli restano fissi): approfondimento come argomento. Manuale 97 → **98**
  argomenti; aggiornato il `MANUAL_ROUTE_INDEX` in sincrono (guard). Guard integrità manuale (incluso
  il guard dei riferimenti e dell'indice di rotta) e bilingue verdi. Report:
  `docs/verify/2026-10-17-ejpt-vulnerability-assessment.md`.
- **17/10/2026 — Glossario: +50 voci (CCNA + eJPT).** Su richiesta, ampliato `GLOSSARY_TERMS` da
  **126 a 176 voci** bilingui, colmando lacune reali: lato CCNA (CIDR, VLSM, default/static route,
  multicast, root bridge, CAM table, access port, inter-VLAN routing, loopback, OSPF area, LSA, QoS,
  LLQ, trust boundary, VRF, SD-WAN, CoPP, control plane, Telnet, TFTP, DNS record) e fondamenti
  (CIA triad, defense in depth, Zero Trust, least privilege, MAC flooding, VLAN hopping, ARP
  spoofing, CVE); lato **eJPT**, vocabolario del syllabus reale (reconnaissance, footprinting, banner
  grabbing, port scanning, vulnerability assessment, exploit, post-exploitation, lateral movement,
  SMB, null session, LDAP, Kerberos, NTLM, TGT/TGS, Kerberoasting, pass-the-hash, Active Directory,
  rainbow table, salt, brute force). Tutte difensive/neutre, senza tool operativi. Guard glossario
  (unicità + definizione bilingue) e guard bilingue strutturale verdi. Report:
  `docs/verify/2026-10-17-glossary-50-terms.md`.
- **17/10/2026 — VIS-13: diagramma catena di fiducia PKI/TLS.** Dopo la sincronizzazione con il
  lavoro concorrente (che aveva già aggiunto i diagrammi `encapsulation`, `qos` e `wlc-policy-mapping`),
  aggiunto il diagramma bilingue `pki-tls-chain` al tema `pki-tls-certificate-chain`: Root CA →
  Intermediate CA → certificato server con validazione (freccia tratteggiata) che risale alla Root.
  Riuso del modello/componente VIS-12, alternativa testuale visibile, `id` univoci, inline. Diagrammi
  7/97. Guard componente e guard bilingue strutturale verdi; E2E diagrammi 8/8 a 320/1280 px (overflow,
  contrasto, Axe). `verify` completo verde, E2E Chromium verdi, 0 vulnerabilità. Report:
  `docs/verify/2026-10-17-vis13-pki-tls-chain.md`.
- **17/10/2026 — CONTENT-13: cracking offline degli hash (difensivo).** Aggiunto l'argomento
  complementare `offline-hash-cracking-defense` al capitolo eJPT `pentest-methodology`: modello di
  costo (tentativi × costo per hash), hash veloci vs KDF lente con fattore di lavoro, sale per-utente
  contro la precomputazione e pepper, budget entropia × fattore di lavoro. Lato memorizzazione, senza
  ridondanza con «Attacchi alle password». Nessun comando di cracking, soli target di documentazione,
  riferimenti NIST SP 800-63B / ATT&CK T1110.002 risolti in HTTPS. Manuale 95 → 96 argomenti.
  `verify` completo verde, E2E Chromium con Axe verdi, 0 vulnerabilità. Report:
  `docs/verify/2026-10-17-content13-offline-cracking.md`.
- **17/10/2026 — CONTENT-15: riferimenti completati + guard.** Aggiunto un riferimento autorevole
  (RFC/IEEE/Cisco) risolto in HTTPS ai 10 argomenti fondamentali CCNA che ne erano privi (copertura
  85/95 → 95/95) e introdotto in `studyManual.test.ts` il guard «ogni argomento espone ≥1
  riferimento», così che un nuovo argomento senza fonte fallisca in CI. Elenco derivato dal guard,
  non a mano; nessuna URL non-HTTPS; riferimenti senza testo, nessun impatto bilingue. `verify`
  completo verde, E2E Chromium con Axe verdi, 0 vulnerabilità. Report:
  `docs/verify/2026-10-17-content15-references.md`.
- **17/10/2026 — CONTENT-12: basi di Active Directory.** Completato il task successivo del backlog:
  aggiunto l'argomento eJPT `active-directory-basics` al capitolo `exploitation-post-exploitation`
  (modello AD dominio/foresta/OU/GPO/DC, Kerberos KDC/TGT/TGS vs NTLM, enumerazione LDAP e relazioni
  di fiducia, difesa con tiering amministrativo, hardening degli account di servizio e monitoraggio
  del DC). Concettuale/difensivo, nessuna tecnica operativa, soli target di documentazione e
  riferimenti ATT&CK T1087.002 / RFC 4120 risolti in HTTPS. Nessun nuovo capitolo eJPT. Manuale
  94 → 95 argomenti (conteggi derivati dal dataset). `verify` completo verde, E2E Chromium con Axe
  verdi, 0 vulnerabilità. Report: `docs/verify/2026-10-17-content12-active-directory.md`.
- **17/10/2026 — CONTENT-11: enumerazione dei servizi (SMB/SNMP/NFS).** Completato il prossimo task
  del backlog: aggiunto l'argomento eJPT `pentest-service-enumeration` al capitolo
  `pentest-methodology` (SMB 445/139, SNMP UDP 161, NFS 2049) in chiave didattica e difensiva, con
  difesa e telemetria per servizio, soli target di documentazione e riferimenti ATT&CK T1135 / NIST
  SP 800-123 risolti in HTTPS. Nessun nuovo capitolo eJPT (vincolo dei test rispettato). Manuale
  93 → 94 argomenti (conteggi derivati dal dataset). `verify` completo verde, E2E Chromium con Axe
  verdi, 0 vulnerabilità. Report: `docs/verify/2026-10-17-content11-service-enumeration.md`.
- **17/10/2026 — Pianificazione del backlog contenuti.** Dopo una ricognizione reale della copertura
  (217 id, 83/94 argomenti con riferimenti, 3/94 con diagramma) è stata aggiunta la sezione «Contenuti
  pianificati»: nuovi argomenti su lacune verificate (enumerazione SMB/SNMP/NFS, basi di Active
  Directory, cracking offline difensivo degli hash — tutti dentro i capitoli eJPT esistenti) e
  miglioramenti (completamento dei riferimenti mancanti con guard, estensione dei micro-diagrammi
  SVG). La dorsale CCNA 200-301 risulta già coperta per argomento, quindi l'opportunità CCNA è di
  qualità (riferimenti e diagrammi), non di nuovi argomenti. Solo documentazione (ROADMAP): nessun
  cambio a prodotto, contenuti o test.
- **17/10/2026 — CONTENT-10: QoS applicata (CCNA 4.7).** Aggiunto l'argomento `ip-services-qos` al
  capitolo `ip-services` (PHB/DiffServ, CoS vs DSCP, LLQ/CBWFQ/WRED, policing vs shaping, trust
  boundary), bilingue con parità di acronimi e cifre e riferimenti RFC 2474/4594. Argomento d'esame
  CCNA difensivo/neutro, teoria-only. Manuale 92 → 93 argomenti (conteggi derivati dal dataset).
  `verify` completo verde (786 test), 74/74 E2E Chromium con Axe, 0 vulnerabilità.
  Report: `docs/verify/2026-10-17-content10-qos.md`.
- **14/10/2026 — Apertura Fase 3.** Chiusa la Fase 2 (percorso eJPT completo, sequenza a doppio
  binario, nuovo marchio). La Fase 3 completa la copertura guida↔laboratori, introduce laboratori
  interattivi per la metodologia eJPT e consolida qualità visiva, UX, i18n e documentazione. Roadmap
  storica Fase 2 archiviata in `docs/`.
- **16/10/2026 — Contenuti aggiuntivi per i due obiettivi di certificazione.** Aggiunti al
  **glossario** 12 voci bilingui (CCNA: GLBP, DHCPv6, RA Guard, VXLAN, Split Horizon, Route
  Summarization; eJPT: Enumeration, Privilege Escalation, Pivoting, Reverse Shell, LFI/RFI,
  Directory Traversal) e al **manuale** 4 nuovi argomenti nei capitoli esistenti: NTP in
  `ip-services` (CCNA 4.x), e per l'eJPT «Attacchi alle password» (pentest-methodology),
  «Inclusione di file e directory traversal» (web-app-pentest) e «Reverse shell e bind shell»
  (exploitation-post-exploitation). Contenuti eJPT concettuali e difensivi, con soli target di
  documentazione e riferimenti ATT&CK/RFC. Manuale ora a 92 argomenti; glossario a 126 voci.
  Conteggi derivati dal dataset (ENG-31), nessuna asserzione hard-coded modificata.
  Report: `docs/verify/2026-10-16-content-cert-additions.md`.
- **Invarianti di responsabilità** (dalla Fase 2): contenuti offensivi didattici,
  autorizzazione-first, accoppiati alla difesa, con soli target di documentazione.

# Technical content review / Revisione dei contenuti tecnici

## English

Technical accuracy is a product requirement: a learner may memorise an error that appears in a lab. OSI Cyber Explorer therefore performs a full review at most every **180 days**, and again whenever a pinned CCNA blueprint, MITRE ATT&CK release, registry baseline, or cryptographic recommendation changes.

### Scope and evidence

Every completed review must cover all six scopes in `docs/technical-content-reviews.json`:

1. IANA port assignments, transport pairs, registration status, and encrypted alternatives;
2. Cisco IOS/IOS XE and Linux commands, including context, verification, and rollback;
3. deprecated protocols and their safe replacements (TLS 1.0/1.1, SSHv1, SNMPv1/v2c);
4. cryptographic recommendations and minimums;
5. the current CCNA 200-301 blueprint;
6. the current MITRE ATT&CK version and referenced identifiers.

A record is complete only when it includes a date, next due date, reviewer handle, pinned versions, a bilingual decision for every scope, authoritative HTTPS sources, and paths to repository evidence. `confirmed` means that no content change was required; `corrected` identifies a change made by the review. Open or unverified work is not a completed decision and must not renew the deadline.

### Enforcement

- `npm run verify:technical-content` validates the ledger, source authorities, evidence paths, dates, scope coverage, and pinned values read directly from the TypeScript sources.
- The normal CI runs the gate on every change. Updating `CCNA_BLUEPRINT.version`, `MITRE_ATTACK_VERSION`, `MITRE_ATTACK_RELEASED_ON`, or `PORT_REGISTRY_VERIFIED_ON` without a matching new review record fails CI.
- `.github/workflows/technical-content-review.yml` runs on **1 April** and **1 October**, plus manual dispatch. Its scheduled mode opens the renewal window 30 days early and fails until a new completed record is committed.
- The protocol registry is checked for explicit warnings and replacements for TLS 1.0/1.1, SSHv1, and SNMPv1/v2c.

To perform the next review, copy the previous JSON record, assign a unique dated ID, verify every source and evidence path, record only decisions actually completed, set `nextReviewBy` no more than 180 days later, then run the complete project verification. Do not edit an old record: the ledger is append-only.

### Baseline review — 2026-10-10

The first record confirms IANA metadata verified on 2026-09-30, CCNA 200-301 v1.1, MITRE ATT&CK v19.2 (released 28 April 2026), and NIST SP 800-131A Rev. 2. It corrects the previously documented ATT&CK release date. TLS 1.0/1.1 and SNMPv1/v2c were already presented as unsafe legacy choices; the review made the SSH entry explicit that SSHv1 is obsolete and SSHv2 with modern algorithms is required. Cisco/Linux command examples retain platform context, verification, and rollback where they represent a change.

## Italiano

L’accuratezza tecnica è un requisito di prodotto: chi studia potrebbe memorizzare un errore mostrato in un laboratorio. OSI Cyber Explorer esegue quindi una revisione completa al massimo ogni **180 giorni** e nuovamente quando cambia una versione fissata del blueprint CCNA, di MITRE ATT&CK, della registry o delle raccomandazioni crittografiche.

### Ambito ed evidenze

Ogni revisione completata deve coprire i sei ambiti dichiarati in `docs/technical-content-reviews.json`:

1. assegnazioni IANA delle porte, trasporti, stato di registrazione e alternative cifrate;
2. comandi Cisco IOS/IOS XE e Linux, inclusi contesto, verifica e rollback;
3. protocolli deprecati e sostituti sicuri (TLS 1.0/1.1, SSHv1, SNMPv1/v2c);
4. raccomandazioni e requisiti minimi crittografici;
5. blueprint corrente CCNA 200-301;
6. versione corrente MITRE ATT&CK e identificativi referenziati.

Un record è completo solo se include data, prossima scadenza, handle del revisore, versioni fissate, una decisione bilingue per ogni ambito, fonti HTTPS autorevoli e percorsi delle evidenze nel repository. `confirmed` indica che non servivano modifiche; `corrected` identifica una correzione prodotta dalla revisione. Un’attività aperta o non verificata non è una decisione completata e non può rinnovare la scadenza.

### Applicazione della policy

- `npm run verify:technical-content` valida registro, autorità delle fonti, evidenze, date, copertura e valori fissati letti direttamente dai sorgenti TypeScript.
- La CI ordinaria esegue il gate a ogni modifica. Cambiare `CCNA_BLUEPRINT.version`, `MITRE_ATTACK_VERSION`, `MITRE_ATTACK_RELEASED_ON` o `PORT_REGISTRY_VERIFIED_ON` senza un nuovo record coerente fa fallire la CI.
- `.github/workflows/technical-content-review.yml` parte il **1° aprile** e il **1° ottobre**, oltre che manualmente. La modalità schedulata apre la finestra 30 giorni prima e fallisce finché non viene registrata una nuova revisione completata.
- La registry dei protocolli viene controllata per avvisi e sostituti espliciti di TLS 1.0/1.1, SSHv1 e SNMPv1/v2c.

Per la revisione successiva, copia il record precedente, assegna un ID univoco con data, verifica ogni fonte ed evidenza, registra soltanto decisioni realmente concluse, imposta `nextReviewBy` entro 180 giorni ed esegui l’intera verifica del progetto. Non modificare un record precedente: il registro è append-only.

### Revisione baseline — 10/10/2026

Il primo record conferma metadati IANA verificati il 30/09/2026, CCNA 200-301 v1.1, MITRE ATT&CK v19.2 (rilasciata il 28 aprile 2026) e NIST SP 800-131A Rev. 2. Corregge inoltre la data di rilascio ATT&CK documentata in precedenza. TLS 1.0/1.1 e SNMPv1/v2c erano già presentati come scelte legacy non sicure; la revisione ha reso esplicito nella voce SSH che SSHv1 è obsoleto e che servono SSHv2 e algoritmi moderni. Gli esempi Cisco/Linux mantengono contesto di piattaforma, verifica e rollback quando rappresentano una modifica.

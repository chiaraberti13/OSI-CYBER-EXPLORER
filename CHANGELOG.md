# Changelog

All notable changes to OSI Cyber Explorer are documented in this file. The project follows [Semantic Versioning](https://semver.org/) and keeps this structure compatible with [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

- Study manual (EDU-01): a new bilingual "Study manual" view — a handbook of the topics to study aligned to CCNA 200-301 and CompTIA Security+ SY0-701. The first chapter (OSI model and encapsulation) gives objectives, prerequisites, progressive theory, examples, common mistakes and RFC references, plus two guided labs (task → steps → autonomous challenge → revealable commented solution → self-check) that open the OSI stack and Ports & Protocols labs. Typed content, pure selectors, content-integrity checks and unit/component/E2E tests included.
- Manuale di studio (EDU-01): nuova vista bilingue "Manuale di studio" — un handbook degli argomenti da studiare allineato a CCNA 200-301 e CompTIA Security+ SY0-701. Il primo capitolo (modello OSI e incapsulamento) offre obiettivi, prerequisiti, teoria progressiva, esempi, errori comuni e riferimenti RFC, più due laboratori guidati (consegna → passi → sfida autonoma → soluzione commentata rivelabile → autoverifica) che aprono i lab «Pila OSI» e «Porte & Protocolli». Inclusi contenuti tipizzati, selettori puri, controlli di integrità e test unitari/di componente/E2E.
- Navigation: on narrow screens the group tabs now show a fade and an explicit scroll-arrow button (with a bilingual label) whenever content is hidden off either edge, so every group is reachable without a blind horizontal swipe; search and copy-link stay visible (UX-07).
- Navigazione: su schermi stretti le tab dei gruppi mostrano ora una dissolvenza e un pulsante freccia esplicito (con etichetta bilingue) quando c'è contenuto nascosto oltre un bordo, così ogni gruppo è raggiungibile senza uno swipe orizzontale alla cieca; ricerca e copia-link restano visibili (UX-07).
- Navigation: a copy-link control in the lab navigation copies a shareable URL to the current lab (built from its hash route) and confirms the copy through an `aria-live` region; the strings live in the typed i18n catalog (UX-06).
- Navigazione: un pulsante nella barra dei laboratori copia un URL condivisibile del lab corrente (costruito dalla sua rotta hash) e conferma la copia tramite una regione `aria-live`; le stringhe sono nel catalogo i18n tipizzato (UX-06).
- Accessibility: OSI stack layers are now buttons with `aria-pressed` for selection, and the transforming/compromised/hardened states are rendered as localised text (plus icons) rather than colour alone; purely decorative colour accents are `aria-hidden` (UX-05).
- Accessibilità: i livelli dello stack OSI sono ora pulsanti con `aria-pressed` per la selezione e gli stati «in trasformazione/compromesso/protetto» sono resi come testo localizzato (oltre alle icone) invece che solo con il colore; gli accenti puramente cromatici sono `aria-hidden` (UX-05).
- Accessibility: the glossary search now has a real accessible name via a bilingual `aria-label` (no longer the placeholder alone), an `aria-live` region that announces the result count or no-results and describes the field, and a reset button that clears the query and returns focus; decorative icons are `aria-hidden` (UX-04).
- Accessibilità: la ricerca del glossario ha ora un nome accessibile reale tramite `aria-label` bilingue (non più il solo placeholder), una regione `aria-live` che annuncia il conteggio dei risultati o l'assenza di corrispondenze e descrive il campo, e un pulsante di reset che svuota la ricerca e riporta il focus; le icone decorative sono `aria-hidden` (UX-04).
- Consolidated repeated application chrome and shared security-lab labels into typed Italian/English UI catalogs. TypeScript rejects missing English keys, while catalog tests enforce exact key parity, non-empty values, and bilingual result-count formatting without adding a runtime i18n dependency.
- Consolidate le etichette ripetute del guscio applicativo e dei laboratori di sicurezza in cataloghi UI italiano/inglese tipizzati. TypeScript rifiuta chiavi inglesi mancanti, mentre i test impongono parità esatta, valori non vuoti e formattazione bilingue del conteggio risultati senza aggiungere dipendenze i18n a runtime.
- Profiled the large collections before optimisation and removed the glossary's 114 staggered row animations: visual settling fell from 3.69 s to zero and median cold-search latency from 19.22 ms to 12.37 ms, while semantic definition-list markup replaced index keys without adding virtualisation.
- Profilate le collezioni grandi prima dell’ottimizzazione e rimosse le 114 animazioni scaglionate del glossario: completamento visivo da 3,69 s a zero e latenza mediana della ricerca a freddo da 19,22 ms a 12,37 ms, con elenco di definizioni semantico e senza introdurre virtualizzazione.
- Added enforced performance budgets for initial JavaScript and every lazy route, a reproducible bundle treemap, and Lighthouse CI checks for the OSI and Ports paths without adding its vulnerable CLI dependency tree to the application lockfile.
- Aggiunti budget prestazionali bloccanti per il JavaScript iniziale e ogni route lazy, un treemap riproducibile del bundle e controlli Lighthouse CI sui percorsi OSI e Porte senza inserire nel lockfile dell’app l’albero vulnerabile della CLI.
- Added an enforced six-month technical-content review for ports, platform commands, deprecated protocols, cryptography, CCNA, and MITRE ATT&CK. An append-only bilingual ledger, CI gate, and scheduled workflow reject expired reviews, missing evidence, unapproved sources, and pinned-version drift; the baseline review also makes the SSHv1 prohibition explicit and corrects the ATT&CK v19.2 release date.
- Aggiunta una revisione tecnica semestrale applicata a porte, comandi di piattaforma, protocolli deprecati, crittografia, CCNA e MITRE ATT&CK. Registro bilingue append-only, gate CI e workflow schedulato rifiutano revisioni scadute, evidenze mancanti, fonti non approvate e variazioni delle versioni fissate; la revisione baseline rende inoltre esplicito il divieto di SSHv1 e corregge la data di rilascio di ATT&CK v19.2.
- Added a versioned CCNA 200-301 v1.1 blueprint matrix that maps all 53 numbered topics to registered study views. The bilingual CCNA Map exposes the links and official source, while automated checks reject uncovered, stale, duplicated, untranslated, or invalid destinations.
- Aggiunta una matrice versionata del blueprint CCNA 200-301 v1.1 che collega tutti i 53 argomenti numerati alle viste di studio registrate. La Mappa CCNA bilingue mostra collegamenti e fonte ufficiale, mentre i controlli automatici rifiutano destinazioni scoperte, obsolete, duplicate, non tradotte o non valide.
- Added structured, validated RFC/IEEE/NIST/MITRE ATT&CK/Cisco references for every Attack & Defense scenario and defensive control. MITRE ATT&CK is pinned to v19.2, authoritative URLs are generated centrally, and CI rejects missing, malformed, duplicate, non-HTTPS, or unapproved references.
- Aggiunti riferimenti strutturati e validati RFC/IEEE/NIST/MITRE ATT&CK/Cisco per ogni scenario Attacco & Difesa e controllo difensivo. MITRE ATT&CK è fissato alla v19.2, gli URL autorevoli sono generati centralmente e la CI rifiuta riferimenti mancanti, malformati, duplicati, non HTTPS o non approvati.

Use this section only for changes already merged into `main` but not yet included in a tagged release.

### Added

- Accessibility: the quick search (Ctrl/⌘+K) now follows the ARIA combobox pattern — `role="combobox"` with `aria-autocomplete`, `aria-expanded`, `aria-controls`, and `aria-activedescendant`; results as a `listbox` of `option`s with `aria-selected`; arrow keys move the active option without moving DOM focus; and an `aria-live` region announces the result count (UX-03).
- Accessibilità: la ricerca rapida (Ctrl/⌘+K) segue ora il pattern combobox ARIA — `role="combobox"` con `aria-autocomplete`, `aria-expanded`, `aria-controls` e `aria-activedescendant`; risultati come `listbox` di `option` con `aria-selected`; le frecce spostano l'opzione attiva senza muovere il focus DOM; una regione `aria-live` annuncia il numero di risultati (UX-03).
- Accessibility: a bilingual skip link ("Skip to content" / "Vai al contenuto") as the first focusable element, jumping past the sticky header and navigation to the `main` landmark without disturbing the hash route (UX-02).

### Fixed

- Licence metadata: the `SPDX-License-Identifier` headers of six source files still declared `MIT` after the project was relicensed to GPL-3.0; they now read `GPL-3.0-only`, matching `LICENSE`, the README badges, and the new `package.json#license` field. A test guard (`src/licenseHeaders.test.ts`) fails the build on any inconsistent SPDX header.

## [1.0.0] - 2026-09-27

### Added

- Bilingual Italian/English interactive study environment for the OSI model, networking, CCNA topics, and defensive cybersecurity.
- Deterministic client-side laboratories for encapsulation, troubleshooting, attack paths, automation, and security controls.
- Versioned input validation, preference migration, frontend security guardrails, and production security headers.
- CI across the supported Node.js lines, CodeQL, secret and dependency scanning, lockfile validation, package-signature checks, and CycloneDX SBOM generation.
- Repository security governance through a disclosure policy, threat model, CODEOWNERS, and an enforced `main` ruleset.

### Security

- The application remains static and client-side: it does not introduce a backend, telemetry, credential collection, real scanning, or offensive traffic.

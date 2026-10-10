# Changelog

All notable changes to OSI Cyber Explorer are documented in this file. The project follows [Semantic Versioning](https://semver.org/) and keeps this structure compatible with [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

- Added an enforced six-month technical-content review for ports, platform commands, deprecated protocols, cryptography, CCNA, and MITRE ATT&CK. An append-only bilingual ledger, CI gate, and scheduled workflow reject expired reviews, missing evidence, unapproved sources, and pinned-version drift; the baseline review also makes the SSHv1 prohibition explicit and corrects the ATT&CK v19.2 release date.
- Aggiunta una revisione tecnica semestrale applicata a porte, comandi di piattaforma, protocolli deprecati, crittografia, CCNA e MITRE ATT&CK. Registro bilingue append-only, gate CI e workflow schedulato rifiutano revisioni scadute, evidenze mancanti, fonti non approvate e variazioni delle versioni fissate; la revisione baseline rende inoltre esplicito il divieto di SSHv1 e corregge la data di rilascio di ATT&CK v19.2.
- Added a versioned CCNA 200-301 v1.1 blueprint matrix that maps all 53 numbered topics to registered study views. The bilingual CCNA Map exposes the links and official source, while automated checks reject uncovered, stale, duplicated, untranslated, or invalid destinations.
- Aggiunta una matrice versionata del blueprint CCNA 200-301 v1.1 che collega tutti i 53 argomenti numerati alle viste di studio registrate. La Mappa CCNA bilingue mostra collegamenti e fonte ufficiale, mentre i controlli automatici rifiutano destinazioni scoperte, obsolete, duplicate, non tradotte o non valide.
- Added structured, validated RFC/IEEE/NIST/MITRE ATT&CK/Cisco references for every Attack & Defense scenario and defensive control. MITRE ATT&CK is pinned to v19.2, authoritative URLs are generated centrally, and CI rejects missing, malformed, duplicate, non-HTTPS, or unapproved references.
- Aggiunti riferimenti strutturati e validati RFC/IEEE/NIST/MITRE ATT&CK/Cisco per ogni scenario Attacco & Difesa e controllo difensivo. MITRE ATT&CK è fissato alla v19.2, gli URL autorevoli sono generati centralmente e la CI rifiuta riferimenti mancanti, malformati, duplicati, non HTTPS o non approvati.

Use this section only for changes already merged into `main` but not yet included in a tagged release.

### Added

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

# Contributing to OSI-CYBER-EXPLORER

<p align="center"><a href="#english">🇬🇧 English</a> · <a href="#italiano">🇮🇹 Italiano</a></p>

## English

This repository covers a bilingual React/TypeScript networking, CCNA and attack-defense learning lab with deterministic client-side simulations.

### Before you start

1. Read `README.md`, `SECURITY.md`, the roadmap and relevant architecture/design documentation.
2. Search existing issues and keep each pull request focused.
3. Use only owned or explicitly authorized targets, systems, datasets and signals.
4. Never commit credentials, tokens, private keys, personal data or sensitive evidence.
5. Report vulnerabilities privately.

### Setup

Use a supported Node.js release from `package.json#engines` and the npm version declared in `packageManager`. The commands are identical in Windows PowerShell, macOS Terminal and Linux shells:

```bash
npm ci
npm run dev
```

Vite empties its output directory before every build, so no shell-specific cleanup command is required.

### Formatting and language parity

Run `npm run format` to apply the shared Prettier rules and `npm run format:check` to verify them without changing files. Editor defaults are defined in `.editorconfig`; ESLint remains responsible for code-quality and security rules.

Every learner-facing change must keep Italian and English content equivalent, preserve technical terms and update typed i18n catalogs together. Networking and security claims must cite the relevant authoritative source or repository registry.

### Required checks

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test:coverage
npm run build
npm run test:e2e
```

Offensive examples must remain inert/non-executing, use documentation-reserved/private targets, include defensive context and comply with the repository's offensive-content review policy.

### Engineering expectations

Preserve scope/authorization guards, validate untrusted input, fail safely, keep secrets outside source control, add tests for behavioural changes, and document compatibility or schema changes. Security-related functionality must not weaken logging, provenance, auditability or isolation. Update English documentation first and keep Italian documentation semantically aligned.

### Pull requests

Describe what changed, why, how it was tested, affected security boundaries, compatibility impact and rollback/migration notes. Participation follows `CODE_OF_CONDUCT.md`.

Before opening a pull request, confirm that:

- [ ] the change is focused and contains no secrets, generated reports or personal data;
- [ ] Italian and English content remain semantically equivalent;
- [ ] networking and cybersecurity content is accurate, sourced and safe for authorized labs;
- [ ] keyboard access, visible focus, semantics, contrast and responsive layouts are preserved;
- [ ] `npm run verify`, relevant E2E tests and both dependency audits pass;
- [ ] documentation, changelog and roadmap reflect the actual result.

## Italiano

Questo repository ospita un laboratorio didattico bilingue di networking, CCNA e sicurezza offensiva/difensiva, sviluppato con React e TypeScript e basato su simulazioni deterministiche eseguite nel browser.

### Prima di iniziare

1. Leggi `README.md`, `SECURITY.md`, roadmap e documentazione di architettura pertinente.
2. Controlla le issue esistenti e mantieni ogni pull request focalizzata.
3. Usa solo target, sistemi, dataset e segnali propri o esplicitamente autorizzati.
4. Non committare credenziali, token, chiavi private, dati personali o evidenze sensibili.
5. Segnala privatamente le vulnerabilità.

### Setup

Usa una versione Node.js supportata da `package.json#engines` e la versione npm dichiarata in `packageManager`. I comandi sono identici in Windows PowerShell, Terminale macOS e shell Linux:

```bash
npm ci
npm run dev
```

Vite svuota la directory di output prima di ogni build, quindi non serve alcun comando di pulizia specifico della shell.

### Formattazione e parità linguistica

Esegui `npm run format` per applicare le regole Prettier condivise e `npm run format:check` per verificarle senza modificare file. Le impostazioni degli editor sono in `.editorconfig`; ESLint continua a gestire qualità e sicurezza del codice.

Ogni modifica visibile a chi studia deve mantenere equivalenti italiano e inglese, preservare la terminologia tecnica e aggiornare insieme i cataloghi i18n tipizzati. Le affermazioni su networking e sicurezza devono citare la fonte autorevole o il registro del repository pertinente.

### Controlli richiesti

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test:coverage
npm run build
npm run test:e2e
```

Gli esempi offensivi devono rimanere inerti e non eseguibili, utilizzare esclusivamente indirizzi privati o riservati alla documentazione, includere il contesto difensivo e rispettare la policy di revisione dei contenuti offensivi del repository.

### Aspettative tecniche

Mantieni i controlli di scope/autorizzazione, valida gli input, usa comportamenti fail-safe, conserva i segreti fuori dal repository, aggiorna i test e documenta modifiche di compatibilità/schema. Le funzioni di sicurezza non devono indebolire logging, provenienza, auditabilità o isolamento. Aggiorna prima la documentazione inglese e mantieni quella italiana equivalente.

### Pull request

Descrivi cosa cambia, perché, test eseguiti, confini di sicurezza interessati, compatibilità e note di rollback/migrazione. Si applica `CODE_OF_CONDUCT.md`.

Prima di aprire una pull request, verifica che:

- [ ] la modifica sia focalizzata e non contenga segreti, report generati o dati personali;
- [ ] i contenuti italiani e inglesi restino semanticamente equivalenti;
- [ ] i contenuti di networking e cybersecurity siano corretti, documentati e sicuri per laboratori autorizzati;
- [ ] accesso da tastiera, focus visibile, semantica, contrasto e layout responsive siano preservati;
- [ ] `npm run verify`, gli E2E pertinenti ed entrambi gli audit delle dipendenze siano verdi;
- [ ] documentazione, changelog e roadmap descrivano il risultato reale.

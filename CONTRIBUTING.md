# Contributing to OSI-CYBER-EXPLORER

This repository covers a bilingual React/TypeScript networking, CCNA and attack-defense learning lab with deterministic client-side simulations.

## Before you start

1. Read `README.md`, `SECURITY.md`, the roadmap and relevant architecture/design documentation.
2. Search existing issues and keep each pull request focused.
3. Use only owned or explicitly authorized targets, systems, datasets and signals.
4. Never commit credentials, tokens, private keys, personal data or sensitive evidence.
5. Report vulnerabilities privately.

## Setup

Use a supported Node.js release from `package.json#engines` and the npm version declared in `packageManager`. The commands are identical in Windows PowerShell, macOS Terminal and Linux shells:

```bash
npm ci
npm run dev
```

Vite empties its output directory before every build, so no shell-specific cleanup command is required.

## Formatting and language parity

Run `npm run format` to apply the shared Prettier rules and `npm run format:check` to verify them without changing files. Editor defaults are defined in `.editorconfig`; ESLint remains responsible for code-quality and security rules.

Every learner-facing change must keep Italian and English content equivalent, preserve technical terms and update typed i18n catalogs together. Networking and security claims must cite the relevant authoritative source or repository registry.

## Required checks

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test:coverage
npm run build
npm run test:e2e
```

Offensive examples must remain inert/non-executing, use documentation-reserved/private targets, include defensive context and comply with the repository's offensive-content review policy.

## Engineering expectations

Preserve scope/authorization guards, validate untrusted input, fail safely, keep secrets outside source control, add tests for behavioural changes, and document compatibility or schema changes. Security-related functionality must not weaken logging, provenance, auditability or isolation. Write documentation in English and keep README.md and README.it.md semantically aligned.

## Pull requests

Describe what changed, why, how it was tested, affected security boundaries, compatibility impact and rollback/migration notes. Participation follows `CODE_OF_CONDUCT.md`.

Before opening a pull request, confirm that:

- [ ] the change is focused and contains no secrets, generated reports or personal data;
- [ ] Italian and English content remain semantically equivalent;
- [ ] networking and cybersecurity content is accurate, sourced and safe for authorized labs;
- [ ] keyboard access, visible focus, semantics, contrast and responsive layouts are preserved;
- [ ] `npm run verify`, relevant E2E tests and both dependency audits pass;
- [ ] documentation, changelog and roadmap reflect the actual result.

## Reporting and contribution checks

Use the [issue templates](https://github.com/chiaraberti13/OSI-CYBER-EXPLORER/issues/new/choose) and check for duplicates first. Useful context: Browser, language, lab, scenario and reproducible steps.

Write community and technical documentation in English; maintain equivalent English and Italian READMEs. Preserve existing application translations. Fill in the pull request template with commands, results and checks not performed, including the reason. Use synthetic examples without secrets or personal data.

See [the code of conduct](CODE_OF_CONDUCT.md), [security policy](SECURITY.md) and [accessibility statement](ACCESSIBILITY.md). Report vulnerabilities only through the security policy process.

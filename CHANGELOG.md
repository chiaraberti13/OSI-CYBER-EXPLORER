# Changelog

All notable changes to OSI Cyber Explorer are documented in this file. The project follows [Semantic Versioning](https://semver.org/) and keeps this structure compatible with [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

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

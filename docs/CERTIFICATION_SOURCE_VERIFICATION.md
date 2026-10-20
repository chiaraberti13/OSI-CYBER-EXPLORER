# Certification source verification · Verifica delle fonti di certificazione

Cross-check log that supplements — but does not replace — the signed six-monthly
technical-content review in [`technical-content-reviews.json`](technical-content-reviews.json).

## English

### 2026-10-20 — CCNA 200-301 v1.1 blueprint cross-check

- **Source.** The official Cisco _CCNA Exam v1.1 (200-301)_ exam-topics document
  (2024 Cisco Public), provided by the maintainer and cited in
  [`src/content/ccnaBlueprint.ts`](../src/content/ccnaBlueprint.ts)
  (`learningcontent.cisco.com`).
- **Method.** Automated cross-check assisted by Claude: every domain, weight,
  parent objective, sub-objective identifier and objective verb in
  `ccnaBlueprint.ts` and `certificationCoverage.ts` was compared against the
  official document, objective by objective.
- **Result — full alignment, no content change required.** Six domains with the
  exact official weights (1.0 Network Fundamentals 20%, 2.0 Network Access 20%,
  3.0 IP Connectivity 25%, 4.0 IP Services 10%, 5.0 Security Fundamentals 15%,
  6.0 Automation and Programmability 10%); **53** parent objectives
  (13 · 9 · 5 · 9 · 10 · 7) and **58** sub-objectives, all matching the published
  structure.
- **Regression guard added.** `src/content/ccnaBlueprint.test.ts` now pins the
  exact per-domain weights and objective counts, so a future edit that drifts from
  the official structure fails CI — the previous sum-to-100 check alone could not
  catch two compensating wrong weights.

### Scope and limitations

- This is an **evidence cross-check, not a signed human review**. It does not modify
  the attributed review record in `technical-content-reviews.json`; the next
  six-monthly human review remains due **2027-04-08**.
- **eJPT.** The official coverage mapping stays sourced from INE's published eJPT
  domains and objectives (`ine.com`, cited in `certificationCoverage.ts`).
  Third-party community notes (for example a maintainer-provided eJPT notes
  repository) are **correlated study material, not an official syllabus source**, and
  were not used to change the official eJPT mapping.
- **CompTIA Security+ SY0-701** is referenced as an advanced manual extension, not an
  officially mapped coverage matrix; its exam version is reviewed on the same
  six-monthly cadence.

## Italiano

### 2026-10-20 — Verifica incrociata del blueprint CCNA 200-301 v1.1

- **Fonte.** Il documento ufficiale Cisco _CCNA Exam v1.1 (200-301)_ con gli exam
  topics (2024 Cisco Public), fornito dal manutentore e citato in
  [`src/content/ccnaBlueprint.ts`](../src/content/ccnaBlueprint.ts)
  (`learningcontent.cisco.com`).
- **Metodo.** Verifica incrociata automatica assistita da Claude: ogni dominio, peso,
  obiettivo, identificatore di sotto-obiettivo e verbo in `ccnaBlueprint.ts` e
  `certificationCoverage.ts` è stato confrontato con il documento ufficiale, obiettivo
  per obiettivo.
- **Esito — piena corrispondenza, nessuna modifica di contenuto necessaria.** Sei
  domini con i pesi ufficiali esatti (1.0 Fondamenti di rete 20%, 2.0 Accesso alla
  rete 20%, 3.0 Connettività IP 25%, 4.0 Servizi IP 10%, 5.0 Fondamenti di sicurezza
  15%, 6.0 Automazione e programmabilità 10%); **53** obiettivi padre
  (13 · 9 · 5 · 9 · 10 · 7) e **58** sotto-obiettivi, tutti allineati alla struttura
  pubblicata.
- **Garanzia di regressione aggiunta.** `src/content/ccnaBlueprint.test.ts` ora fissa i
  pesi e i conteggi esatti per dominio: una futura modifica che si discosta dalla
  struttura ufficiale fa fallire la CI — il solo controllo "somma = 100" non coglieva
  due pesi errati che si compensano.

### Ambito e limiti

- Questa è una **verifica basata su prove, non una revisione umana firmata**. Non
  modifica il record di revisione attribuito in `technical-content-reviews.json`; la
  prossima revisione umana semestrale resta prevista entro il **2027-04-08**.
- **eJPT.** La mappatura ufficiale di copertura resta basata sui domini e obiettivi eJPT
  pubblicati da INE (`ine.com`, citati in `certificationCoverage.ts`). Appunti di terze
  parti della community (ad esempio un repository di note eJPT fornito dal manutentore)
  sono **materiale di studio correlato, non una fonte ufficiale del programma**, e non
  sono stati usati per modificare la mappatura ufficiale eJPT.
- **CompTIA Security+ SY0-701** è trattata come estensione avanzata del manuale, non come
  matrice di copertura mappata ufficialmente; la versione d'esame è rivista con la stessa
  cadenza semestrale.

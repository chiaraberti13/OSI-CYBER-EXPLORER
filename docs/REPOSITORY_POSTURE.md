# Repository posture / Postura del repository

## English

The `OpenSSF Scorecard` workflow (`.github/workflows/scorecard.yml`) runs on pushes to `main`, on branch-protection changes, weekly (Tuesday) and on demand. It is a **trend indicator, not a gate**: it never blocks a merge. Each run publishes results to the public OpenSSF API (badge/history at `https://scorecard.dev/viewer/?uri=github.com/chiaraberti13/OSI-CYBER-EXPLORER`) and keeps the SARIF file as an artifact for 90 days, so scores can be compared between runs. The action is pinned to a full commit SHA and the job uses least privilege (`id-token: write` is required only for publishing).

### Manual Vercel checks (owner action, not verifiable from the repository)

Record the outcome and date of each check in the table below.

| Check | Expected | Status |
| --- | --- | --- |
| Preview deployments do not receive production environment variables (the app has none; confirm no variable is scoped to Preview) | none exposed | pending |
| Deployment Protection matches the public nature of the project (previews may stay protected; production must be public) | documented choice | pending |
| HSTS is served only by the canonical production domain (`vercel.json` sets it; `scripts/deployment-security.mjs` enforces it on production only) | production only | pending |

Remaining Scorecard findings are accepted or scheduled explicitly in `ROADMAP.md` after the first report.

## Italiano

Il workflow `OpenSSF Scorecard` (`.github/workflows/scorecard.yml`) gira a ogni push su `main`, alle modifiche della branch protection, ogni settimana (martedì) e su richiesta. È un **indicatore di tendenza, non un gate**: non blocca mai un merge. Ogni esecuzione pubblica i risultati sull'API pubblica OpenSSF (storico su `https://scorecard.dev/viewer/?uri=github.com/chiaraberti13/OSI-CYBER-EXPLORER`) e conserva il file SARIF come artifact per 90 giorni, per confrontare i punteggi tra esecuzioni. L'action è fissata a uno SHA completo e il job usa privilegi minimi (`id-token: write` serve solo alla pubblicazione).

### Verifiche manuali su Vercel (azione del proprietario, non verificabili dal repository)

Annotare esito e data di ogni verifica nella tabella sopra (colonna *Status*): preview senza variabili di produzione, Deployment Protection coerente con la natura pubblica del progetto, HSTS servito solo dal dominio di produzione canonico.

I finding Scorecard residui verranno accettati o pianificati esplicitamente in `ROADMAP.md` dopo il primo report.

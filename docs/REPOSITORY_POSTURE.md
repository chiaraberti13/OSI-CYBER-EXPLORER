# Postura del repository e preview / Repository posture and previews

## Italiano

**Revisione: 5 ottobre 2026 — responsabile: @chiaraberti13.** Questa SPA didattica pubblica non ha backend, account applicativi o segreti client. Scorecard è un indicatore di tendenza, non una certificazione o una soglia per il merge.

### Report iniziale e confronto nel tempo

Il [JSON completo del 05/10/2026](scorecard/2026-10-05.json) proviene dall’[API pubblica OpenSSF](https://api.securityscorecards.dev/projects/github.com/chiaraberti13/OSI-CYBER-EXPLORER): **7/10**, motore **v5.5.0**, commit `a73cf8812f84283278b8f146dd6f28e1e6b2fb8d`, scansione `2026-10-05T10:28:54Z`. La [run corrispondente](https://github.com/chiaraberti13/OSI-CYBER-EXPLORER/actions/runs/37296816591) è riuscita; artifact SARIF `11339366582`, SHA-256 del ZIP `ca26c908d2db7c6d3d1979a30a2f934b46e3e7c15a19173c56e9395cf0ebedd8`. Il workflow è già attivo dal [03/10/2026](https://github.com/chiaraberti13/OSI-CYBER-EXPLORER/actions/runs/37080341323). I vecchi SARIF restano fino alla scadenza; non contengono necessariamente tutti i punteggi, quindi non ricavare lo score contando gli alert.

Da questa revisione il workflow conserva tutti i controlli in **JSON** e un confronto **Markdown** rispetto alla baseline. Gli artifact `scorecard-json-RUN_ID` e `scorecard-trend-RUN_ID-ATTEMPT` durano **90 giorni**; il report compare nel riepilogo della run. Data, commit e versione distinguono le build. Per conservare lo storico oltre 90 giorni, aggiungere nuovi JSON datati in `docs/scorecard/` durante revisioni o release senza sovrascrivere la baseline.

Il workflow gira su push a `main`, modifiche della protezione classica, ogni martedì e su richiesta. Le modifiche ai ruleset sono rilevate dalla successiva scansione periodica o manuale. Non è richiesto dai gate del branch e non contiene soglie sul punteggio; gli errori tecnici restano visibili. Il job di pubblicazione OIDC contiene soltanto action ammesse da OpenSSF; la generazione del report è separata, senza OIDC, permessi in scrittura o dipendenze npm. Tutte le action sono fissate a SHA.

La CLI può omettere il punteggio aggregato dell’API: il report non inventa una media. **`-1` indica un risultato non conclusivo**, mai zero o esito positivo. Controlli aggiunti/rimossi e passaggi da/verso `-1` sono variazioni di copertura; una nuova versione del motore può cambiare i criteri.

Confronto locale, senza rete:

```bash
npm run verify:repository-posture
node scripts/scorecard-report.mjs \
  --input docs/scorecard/2026-10-05.json \
  --baseline docs/scorecard/2026-10-05.json \
  --commit a73cf8812f84283278b8f146dd6f28e1e6b2fb8d \
  --output /tmp/osi-scorecard-report.md
```

### Triage dei risultati residui

Decisioni del **05/10/2026**, responsabile **@chiaraberti13**. La pianificazione è ammessa dal criterio di completamento SEC-18; nessun risultato viene nascosto per aumentare lo score.

| Controllo | Score | Decisione, evidenza e prossimo riesame |
| --- | --- | --- |
| Branch-Protection | 0 | **Pianificato, SEC-13, entro 12/10/2026:** riconciliare protezione effettiva e documentazione. L’API `/rulesets` restituisce `[]`; la protezione classica restituisce `403 Resource not accessible by integration`. Non confermare quindi il vecchio ruleset né dichiarare assenza di ogni protezione. Fino al riesame è accettato il rischio del flusso diretto del maintainer su `main`, richiesto per questi interventi; CI e scanner continuano dopo il push. Non estendere il token Scorecard per migliorare il numero. |
| Code-Review | 0 | **Accettato per il flusso attuale:** 0 changeset approvati sugli ultimi 30. Un solo maintainer e push diretti non danno review indipendente. Riesaminare con SEC-13 entro 12/10/2026 e quando entra un secondo reviewer; non creare approvazioni artificiali. |
| CI-Tests | -1 | **Accettato come non conclusivo:** nessuna PR nel campione, non assenza di test. CI esegue test su push e PR con Node 22/24; [run della baseline](https://github.com/chiaraberti13/OSI-CYBER-EXPLORER/actions/runs/37296816463) riuscita. Riesaminare alla prossima PR reale. |
| Maintained | 0 | **Accettato:** repository più giovane di 90 giorni. Le scansioni settimanali rivalutano naturalmente il controllo; non modificare storia o date. |
| Contributors | 3 | **Accettato:** progetto personale con una sola organizzazione contributrice. Riesaminare se cambia il modello di contribuzione. |
| CII-Best-Practices | 0 | **Accettato:** nessun badge dichiarato o richiesto dalla demo. Riesaminare per una futura release pubblica o governance comunitaria. |
| Packaging | -1 | **Accettato come non applicabile ora:** SPA statica, non pacchetto npm pubblico. Riesaminare se viene richiesta una distribuzione installabile. |
| Signed-Releases | -1 | **Pianificato al primo tag SemVer richiesto:** non ci sono release. Il processo in [RELEASING.md](RELEASING.md) produrrà SBOM, checksum e attestazioni; riesaminare sul primo artifact. Non creare release soltanto per migliorare lo score. |

Gli altri dieci controlli sono a 10/10: Binary-Artifacts, Dependency-Update-Tool, Security-Policy, Token-Permissions, SAST, Dangerous-Workflow, Pinned-Dependencies, License, Vulnerabilities e Fuzzing. Vulnerabilities misura soltanto le fonti interrogate da Scorecard, non l’assenza di ogni vulnerabilità nell’applicazione.

### Verifica Vercel del 05/10/2026

API: progetto `osi-cyber-explorer`, ID `prj_hXl9ys9HNQY2tdE8aXvxYkFAEuLS`, team `chiara11`, Vite, Node 24. Letti metadati e inventario non decrittato: **nessun valore di variabile o bypass viene salvato**.

| Controllo | Evidenza verificata | Decisione |
| --- | --- | --- |
| Variabili d’ambiente | API `envs: []`: nessuna variabile configurata per Production, Preview o Development. Sorgenti e configurazione Vite non esportano `process.env`, `import.meta.env`, `loadEnv`, `envPrefix` o `define`. Le variabili di sistema del provider sono distinte dalle credenziali applicative. | **Conforme alla SPA senza segreti.** Riesaminare ogni futura variabile: mai segreti in `VITE_*`, bundle o scope Preview condiviso con Production. |
| Protezione deployment | `ssoProtection.enabled: true`, `deploymentType: all_except_custom_domains`; password e trusted IP disattivati. Produzione canonica: GET anonimo **200**. Preview READY `osi-cyber-explorer-rlk752gx0-chiara11.vercel.app`, commit `073f7ec3bd192e73f6670203ab2362ed06097f02`, branch non `main`: GET anonimo **302** verso `https://vercel.com/sso-api`. | **Scelta accettata:** demo pubblica, preview con Vercel Authentication. Nessun allentamento della protezione né scansione della pagina SSO. |
| HSTS applicativo | Prima della revisione `vercel.json` lo applicava a ogni host. Ora `has: [{type: host, value: osi-cyber-explorer.vercel.app}]` limita `max-age=63072000; includeSubDomains; preload` al dominio canonico. Un test CI impedisce la regola globale. | **Corretto il perimetro applicativo.** Gli altri header restano su tutte le risposte applicative. |
| HSTS del provider | Vercel [aggiunge HSTS automaticamente](https://vercel.com/docs/headers/response-headers#strict-transport-security). Osservato anche sul redirect SSO della preview: `max-age=63072000; includeSubDomains; preload`. L’autenticazione precede l’applicazione. | **Eccezione di piattaforma accettata:** “solo produzione” riguarda la policy controllata in `vercel.json`, non l’assenza di HSTS sui domini o sulle pagine di autenticazione Vercel. Non disabilitare HTTPS/HSTS del provider. |

È una fotografia datata, non un monitor amministrativo continuo. [Dynamic Deployment Security](DYNAMIC_SECURITY.md) verifica la produzione dopo i deployment e settimanalmente. Ripetere inventario e protezione dopo modifiche a variabili, domini, Deployment Protection o hosting; revisione ordinaria entro **05/04/2027**. I test offline verificano la configurazione applicativa; inventario e SSO provengono da API Vercel e GET anonimi.

## English

**Reviewed on 5 October 2026; owner: @chiaraberti13.** This public educational SPA has no backend, application accounts or client secrets. Scorecard is a trend indicator, not a certification or merge threshold.

The immutable [baseline JSON](scorecard/2026-10-05.json) comes from the public OpenSSF API: **7/10**, engine **v5.5.0**, commit `a73cf8812f84283278b8f146dd6f28e1e6b2fb8d`, scan `2026-10-05T10:28:54Z`. The matching successful [run](https://github.com/chiaraberti13/OSI-CYBER-EXPLORER/actions/runs/37296816591) archived SARIF artifact `11339366582`; ZIP SHA-256 `ca26c908d2db7c6d3d1979a30a2f934b46e3e7c15a19173c56e9395cf0ebedd8`. Earlier SARIF artifacts remain until expiry. SARIF does not contain every numerical check; never reconstruct an aggregate from alerts.

Future runs retain complete JSON and per-check Markdown comparisons for **90 days**, with date, commit and engine version, and show the report in the run summary. Preserve additional dated JSON snapshots in `docs/scorecard/` during reviews/releases for longer history. The workflow runs on `main` pushes, classic protection changes, Tuesdays and manual dispatch; ruleset changes are detected by the next periodic/manual scan. It is not a required branch check and scores never fail a gate; technical failures remain visible. The action-only OIDC job stays separate from dependency-free, read-only processing; all actions are SHA-pinned.

The CLI may omit the API aggregate; the reporter never substitutes a mean. **`-1` is inconclusive**, not zero or a pass. Added/removed checks and transitions to/from `-1` represent coverage changes; engine upgrades can change criteria. The command above reproduces the comparison offline.

| Residual check | Score | Explicit disposition (owner: @chiaraberti13, 05/10/2026) |
| --- | --- | --- |
| Branch-Protection | 0 | **Scheduled under SEC-13 by 12/10/2026:** reconcile configuration and documentation. Rulesets API returned `[]`; classic protection returned integration `403`, so neither total absence nor the old ruleset is confirmed. Temporarily accept direct-maintainer `main` pushes with CI/scanners afterwards; do not broaden the Scorecard token. |
| Code-Review | 0 | **Accepted for current workflow:** 0 approved changesets among the last 30. Reassess with SEC-13 by 12/10/2026 or when an independent reviewer joins; no artificial approvals. |
| CI-Tests | -1 | **Accepted as inconclusive:** no sampled PR; CI tests push/PR on Node 22/24 and baseline CI succeeded. Reassess on the next real PR. |
| Maintained | 0 | **Accepted:** younger than 90 days; weekly scans reassess naturally. |
| Contributors | 3 | **Accepted:** personal project with one contributing organization; reassess if collaboration changes. |
| CII-Best-Practices | 0 | **Accepted:** no badge claimed or required; revisit for public releases/community governance. |
| Packaging | -1 | **Accepted as currently inapplicable:** static SPA, not a public npm package; revisit for installable distribution. |
| Signed-Releases | -1 | **Scheduled for the first requested SemVer release:** existing workflow creates SBOM, checksums and attestations; no score-driven release. |

The other ten checks score 10/10, as listed above. Vulnerabilities covers Scorecard’s queried sources, not all possible application vulnerabilities.

Vercel API confirmed project `prj_hXl9ys9HNQY2tdE8aXvxYkFAEuLS` in team `chiara11`, Vite/Node 24. Undecrypted inventory returned **`envs: []`**; source/configuration do not export environment variables. Provider system variables are separate from application secrets. No values or bypass links are retained. Review future variables; never put secrets in `VITE_*`, bundles or shared Production/Preview scope.

Authentication is enabled with `all_except_custom_domains`; password/IP restrictions are disabled. Canonical production returned anonymous **200**; READY non-main preview `osi-cyber-explorer-rlk752gx0-chiara11.vercel.app` (commit `073f7ec3bd192e73f6670203ab2362ed06097f02`) returned **302** to Vercel SSO. **Accepted choice:** public canonical demo, authenticated previews, no weakened protection or SSO-page scan.

Application HSTS is now restricted to the exact canonical host by `vercel.json`, guarded by CI; other application headers retain their scope. **Accepted platform exception:** Vercel adds HSTS automatically, including the observed preview SSO redirect (`max-age=63072000; includeSubDomains; preload`). Production-only refers to application-controlled policy, not removal of Vercel HTTPS/HSTS.

This is dated evidence, not continuous administrative monitoring. Dynamic Deployment Security checks production after deployment and weekly. Recheck inventory/protection after variable, domain, protection or hosting changes; routine review due by **05/04/2027**. Offline tests verify source policy; inventory and SSO evidence come from API and anonymous requests.

## Fonti / Sources

- [OpenSSF publishing restrictions and formats, pinned action version](https://github.com/ossf/scorecard-action/blob/2d1146689b8cda280b9bc96326124645441f03bc/README.md#publishing-results)
- [Check definitions at the scanned engine commit](https://github.com/ossf/scorecard/blob/c395761df6afe1a69e476bc60a013a94bcbc153f/docs/checks.md)
- [Vercel response headers](https://vercel.com/docs/headers/response-headers)
- [Vercel conditional headers](https://vercel.com/docs/project-configuration/vercel-json#headers)
- [Vite client environment exposure](https://vite.dev/guide/env-and-mode.html)

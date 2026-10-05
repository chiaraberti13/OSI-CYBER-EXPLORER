# Dynamic deployment security / Sicurezza dinamica del deployment

## English

The `Dynamic Deployment Security` workflow performs a non-authenticated, passive check of the deployed application. It runs when GitHub receives a successful Vercel **Production** deployment status, every Wednesday against production to detect configuration drift, and on demand for an explicitly supplied official preview URL.

The workflow has two independent controls:

1. `scripts/deployment-security.mjs` validates the target before any request, follows at most three allowlisted redirects, and checks the effective HTTP status, CSP, HSTS on the canonical production hostname, and the other security headers versioned in `vercel.json`.
2. OWASP ZAP Baseline passively spiders the public application. It does not authenticate, run active attacks, create issues, or scan arbitrary hosts.

Application HSTS is scoped to the exact canonical production host. Vercel may also add HSTS to preview or authentication responses; this platform behavior is explicitly accepted in [repository posture](REPOSITORY_POSTURE.md). The scanner requires HSTS on production and does not require its absence on previews.

The automatic deployment event checks the canonical production URL after Vercel has promoted the new build. The target validator accepts only HTTPS URLs for `osi-cyber-explorer.vercel.app` and preview hostnames beginning with `osi-cyber-explorer-` and ending in `.vercel.app`. Credentials, custom ports, unrelated hosts, and redirects outside that boundary are rejected before ZAP runs. A Vercel preview protected by SSO therefore fails the manual unauthenticated preflight instead of scanning the Vercel login page; no protection-bypass secret is stored in this repository.

Each run retains two artifacts for 90 days:

- `dynamic-security-headers-*` contains a versioned JSON report with stable finding IDs, including blocked request/redirect failures, a Markdown summary, the source commit and workflow metadata;
- `dynamic-security-zap-*` contains the ZAP JSON, HTML and Markdown reports produced by the pinned Baseline action.

Compare the JSON reports by finding ID and severity. A header/CSP policy violation or a scanner execution failure fails the job. ZAP findings remain visible and comparable without automatically failing the run because passive scanner alerts require contextual triage; scanner execution failures are also recorded in `run.json` before the final gate.

Run the deterministic checks locally with:

```bash
node --test scripts/deployment-security.test.mjs
node scripts/deployment-security.mjs check \
  --url https://osi-cyber-explorer.vercel.app \
  --output dynamic-security/security-headers.json \
  --summary dynamic-security/security-headers.md
```

Create a fresh output directory before repeating the live command. Output files use exclusive creation so one run cannot silently overwrite earlier evidence.

## Italiano

Il workflow `Dynamic Deployment Security` esegue un controllo passivo e non autenticato dell'applicazione pubblicata. Si avvia quando GitHub riceve lo stato riuscito di un deployment Vercel di **produzione**, ogni mercoledì sulla produzione per rilevare derive di configurazione e manualmente per una preview ufficiale indicata in modo esplicito.

Il workflow applica due controlli indipendenti:

1. `scripts/deployment-security.mjs` valida la destinazione prima di qualsiasi richiesta, segue al massimo tre redirect compresi nell'allowlist e verifica stato HTTP effettivo, CSP, HSTS sul solo hostname canonico di produzione e gli altri header di sicurezza versionati in `vercel.json`.
2. OWASP ZAP Baseline esplora passivamente l'applicazione pubblica. Non effettua autenticazione, attacchi attivi, apertura automatica di issue o scansioni di host arbitrari.

HSTS applicativo è limitato all'host canonico di produzione. Vercel può aggiungere HSTS anche alle risposte di preview o autenticazione: questa eccezione di piattaforma è accettata nella [postura del repository](REPOSITORY_POSTURE.md). Lo scanner richiede HSTS sulla produzione e non ne impone l'assenza sulle preview.

L'evento automatico verifica l'URL canonico di produzione dopo che Vercel ha promosso la nuova build. Il validatore accetta soltanto URL HTTPS di `osi-cyber-explorer.vercel.app` e preview con hostname che iniziano per `osi-cyber-explorer-` e terminano in `.vercel.app`. Credenziali, porte personalizzate, host estranei e redirect fuori da questo confine vengono rifiutati prima dell'avvio di ZAP. Una preview protetta da SSO Vercel fallisce quindi il preflight manuale non autenticato invece di sottoporre a scansione la pagina di login Vercel; nel repository non viene conservato alcun segreto di bypass della protezione.

Ogni esecuzione conserva due artifact per 90 giorni:

- `dynamic-security-headers-*` contiene un report JSON versionato con identificatori stabili dei finding, compresi gli errori di richiesta o redirect bloccati, un riepilogo Markdown, il commit sorgente e i metadati del workflow;
- `dynamic-security-zap-*` contiene i report JSON, HTML e Markdown generati dall'action Baseline fissata a uno SHA verificato.

I report JSON sono confrontabili tramite identificatore e severità. Una violazione della policy di header/CSP o un errore di esecuzione dello scanner rende il job rosso. I finding ZAP restano visibili e confrontabili senza far fallire automaticamente l'esecuzione, perché gli alert passivi richiedono triage contestuale; gli errori tecnici vengono registrati in `run.json` prima del gate finale.

I controlli deterministici possono essere eseguiti localmente con i comandi mostrati nella sezione inglese. Prima di ripetere il controllo live, crea una directory di output nuova: i file vengono creati in modalità esclusiva affinché un'esecuzione non sovrascriva silenziosamente evidenze precedenti.

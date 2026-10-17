# Incrocio con i blueprint ufficiali (eJPT + CCNA 200-301 v1.1)

17 ottobre 2026. Baseline `main` HEAD `0d9c984`. Richiesta utente: incrociare gli
argomenti del manuale con le due fonti ufficiali e verificare se manca qualcosa,
poi aggiornare la ROADMAP.

## Fonti e limite di accesso

- eJPT: `https://ine.com/security/certifications/ejpt-certification`
- CCNA v1.1: `https://learningcontent.cisco.com/documents/marketing/exam-topics/200-301-CCNA-v1.1.pdf`

**Entrambe non raggiungibili via DNS dal sandbox** (`getaddrinfo ENOTFOUND` su
`ine.com` e `learningcontent.cisco.com`; l'accesso diretto non risolve questi
host). L'incrocio è stato fatto con la ricerca web su più fonti concordanti; i
**pesi dei domini** e la **numerazione esatta** vanno riconfermati sul blueprint
ufficiale quando raggiungibile. I nomi dei domini/moduli non sono inventati.

## Esito dell'incrocio

### eJPTv2 — il dominio «Host & Network Auditing» mancava

La pagina INE elenca **4 domini** (non 3): Host & Network Penetration Testing
(~35%), Assessment Methodologies (~25%), **Host & Network Auditing (~25%)**, Web
Application Penetration Testing (~15%). La mappa precedente ne copriva 3: il
dominio **Host & Network Auditing** era assente.

**Colmato:** nuovo argomento `host-network-auditing` nel capitolo eJPT
`pentest-methodology` — prospettiva di auditing (stato di rete locale: tabella di
routing, cache ARP, porte in ascolto, condivisioni; audit dei servizi SMB/FTP/
SSH/HTTP/SQL; evidenze), con lo speculare difensivo (baseline, minima esposizione,
monitoraggio dello scostamento). Riferimenti ATT&CK **T1016** (System Network
Configuration Discovery) e NIST **SP 800-115**. Mappa di copertura eJPT in ROADMAP
corretta a 4 domini con pesi.

### CCNA 200-301 v1.1 — obiettivo 6.4 (AI/ML) mancava

La v1.1 (in vigore da agosto 2024) aggiunge l'obiettivo **6.4**: «Explain AI
(generative and predictive) and machine learning in network operations». Il
capitolo `automation-programmability` (automation-impact-sdn, rest-apis-json,
config-management-tools) **non** lo copriva.

**Colmato:** nuovo argomento `automation-ai-ml-netops` — ML vs IA predittiva vs
IA generativa; applicazioni AIOps (analisi predittiva, anomaly detection,
assurance/root-cause con piattaforme a controller, assistenti generativi);
limiti e verifica umana (output da verificare, hallucination, privacy/qualità
della telemetria). Taglio concettuale da esame. Riferimento Cisco.

Il resto della dorsale CCNA v1.1 (domini 1–5, e 6.1–6.3) risulta già coperto
dagli argomenti esistenti; nessun'altra lacuna evidente dall'incrocio.

## Modifiche

- `src/content/studyManual.ts`: +2 argomenti (102 → **104**): `automation-ai-ml-netops`
  (CCNA 6.4) e `host-network-auditing` (eJPT Host & Network Auditing).
- `src/content/manualRouteIndex.ts`: aggiunti i due id ai rispettivi capitoli
  (parità con il dataset).
- `ROADMAP.md`: mappa eJPT corretta a 4 domini con pesi; registro delle decisioni.

## Verifiche

- `npm run typecheck`, `npm run lint`, `npm run format:check`: **puliti**.
- Integrità del manuale (`src/lib/studyManual.test.ts`): **verde** — id unici,
  guard riferimenti (104/104 con ≥1 riferimento HTTPS), indice di rotta in
  sincrono, parità IT/EN, rotta eJPT ai tre capitoli invariata.
- Guard bilingue strutturale ed euristico (`src/content/bilingual.test.ts`):
  **verde**.
- `npm run verify` completo: **superato** — build e tutti i gate (incluso
  `verify:offensive-content`).
- E2E Playwright/Chromium con Axe WCAG 2.2 AA: **superati**.
- `size-limit` / budget performance: entry **< 125 kB** gzip.
- `npm audit --omit=dev`: **0 vulnerabilità**.

## Esito

Dopo l'incrocio, **tutti i 4 domini eJPTv2 e la dorsale CCNA 200-301 v1.1
(compreso 6.4 AI/ML) risultano coperti**. Manuale a 29 capitoli / 104 argomenti /
77 laboratori guidati. Nota: pesi e numerazione da riconfermare sulle pagine
ufficiali quando raggiungibili.

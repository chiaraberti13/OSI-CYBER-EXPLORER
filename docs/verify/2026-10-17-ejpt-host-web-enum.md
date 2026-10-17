# eJPT — «System/Host-Based Attacks» e «Web application enumeration»

17 ottobre 2026. Baseline `main` HEAD `3128930`. Checkout pulito. Richiesta
utente: aggiungere i restanti moduli eJPT (senza inventarne) e, in ROADMAP,
tracciare la copertura. Intervento: coprire gli ultimi due moduli del syllabus
eJPTv2 ancora senza argomento dedicato.

## Ancoraggio al syllabus eJPT (INE eJPTv2)

- Host & Network Penetration Testing → **System/Host-Based Attacks** (gap colmato).
- Web Application Penetration Testing → **Web application enumeration** (gap colmato).

Entrambi sono moduli con questi nomi nel corso eJPTv2; non sono temi inventati.

## Cosa è stato aggiunto

### Manuale (`src/content/studyManual.ts`) — 2 nuovi argomenti (100 → 102)

1. **`system-host-based-attacks`** (capitolo `exploitation-post-exploitation`):
   gli attacchi al sistema operativo e ai servizi locali di un host — servizio
   obsoleto con CVE noto, credenziali deboli, permessi errati (binari di servizio
   scrivibili, SUID, attività pianificate) — distinti dagli attacchi di rete e
   dalla post-exploitation. Difesa = **hardening dell'host**: patch, minima
   funzionalità, baseline di configurazione, logging locale/EDR. Riferimenti
   ATT&CK **T1210** (Exploitation of Remote Services) e NIST **SP 800-123**.
2. **`web-enumeration`** (capitolo `web-app-pentest`): scoperta della superficie
   reale dell'app — content discovery (directory/file non linkati), virtual host,
   fingerprinting dello stack, indizi (robots/sitemap, file di default e backup,
   errori verbosi). Difesa = niente **sicurezza per oscurità**, igiene dei file,
   errori generici, autenticazione sulle pagine admin, monitoraggio della raffica
   di 404. Riferimenti ATT&CK **T1595** + **T1595.003** (Active Scanning: Wordlist
   Scanning).

Didattici/difensivi: nessun comando o tool operativo, soli target di
documentazione (`192.0.2.0/24`). Nessun nuovo capitolo eJPT (i tre restano
fissi). `MANUAL_ROUTE_INDEX` aggiornato in sincrono per entrambi.

## Copertura eJPT completata

Con questi due argomenti **tutti i moduli principali dell'eJPTv2 sono coperti**;
la mappa modulo → argomento è documentata nella nuova sezione «Mappa di copertura
eJPT» della ROADMAP. Approfondimenti futuri proseguono sotto CONTENT-10
(ricorrente), senza inventare moduli non presenti nel syllabus.

## Verifiche

- `npm run typecheck`, `npm run lint`, `npm run format:check`: **puliti**.
- Integrità del manuale (`src/lib/studyManual.test.ts`): **verde** — id unici,
  campi non vuoti, guard riferimenti (102/102 con ≥1 riferimento HTTPS), indice
  di rotta in sincrono, parità IT/EN, rotta eJPT ai tre capitoli invariata.
- Guard bilingue **strutturale ed euristico** (`src/content/bilingual.test.ts`):
  **verde** — corretta una disparità di token (il «404» inglese era «404s»),
  ripristinata la parità di cifre/termini tra IT ed EN.
- `npm run verify` completo: **superato** — build e tutti i gate, incluso
  `verify:offensive-content` (contenuti difensivi, nessun payload riusabile o
  target live).
- E2E Playwright/Chromium con Axe WCAG 2.2 AA: **superati**.
- `size-limit` / budget performance: entry **< 125 kB** gzip.
- `npm audit --omit=dev`: **0 vulnerabilità**.

## Esito

Manuale a **29 capitoli / 102 argomenti / 77 laboratori guidati**. Copertura dei
moduli eJPTv2 completa e mappata in ROADMAP; contenuti ancorati al syllabus
ufficiale, difensivi e verificati.

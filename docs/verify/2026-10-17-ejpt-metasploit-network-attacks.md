# eJPT — «The Metasploit Framework» e «Network-Based Attacks»

17 ottobre 2026. Baseline `main` HEAD `570e784`. Checkout pulito. Richiesta
utente: continuare ad aggiungere argomenti dei **domini reali eJPT**, senza
inventarne. Intervento: coprire due moduli del dominio Host & Network Penetration
Testing finora assenti.

## Ancoraggio al syllabus eJPT (INE eJPTv2)

Domini ufficiali e moduli:

- Assessment Methodologies — Information Gathering, Footprinting & Scanning,
  Enumeration, Vulnerability Assessment.
- **Host & Network Penetration Testing** — System/Host-Based Attacks,
  **Network-Based Attacks**, **The Metasploit Framework**, Exploitation,
  Post-Exploitation, Pivoting.
- Web Application Penetration Testing — HTTP, enumerazione, attacchi web.

I due argomenti aggiunti corrispondono a **moduli con quei nomi esatti** del
corso; non sono temi inventati. (I nomi dei moduli sono quelli pubblici
dell'outline eJPTv2; non è stato possibile scaricare la pagina INE dall'ambiente.)

## Cosa è stato aggiunto

### Manuale (`src/content/studyManual.ts`) — 2 nuovi argomenti (98 → 100)

Capitolo eJPT `exploitation-post-exploitation`, dopo «Concetti di exploitation»:

1. **`exploitation-frameworks-metasploit`** — a cosa serve un framework di
   exploitation e la sua **struttura**: moduli (exploit / auxiliary / post),
   payload **staged vs stageless**, la **sessione** (es. Meterpreter) attesa da un
   **handler**, e il perché l'exploitation produce una **connessione di ritorno in
   egress**. Lato difesa: firme IDS/IPS ed EDR sugli artefatti noti, patch che
   toglie il modulo alla radice, filtraggio in egress sul callback. Nessun comando
   d'uso: è una mappa di cosa l'exploitation lascia dietro di sé.
2. **`network-based-attacks`** — attacchi basati sulla rete: **ARP spoofing**
   (on-path / MITM) e **poisoning LLMNR/NBT-NS** (cattura di autenticazione dai
   fallback di risoluzione dei nomi di Windows), con la radice comune della fiducia
   implicita a livello 2. Difese: **DHCP Snooping + Dynamic ARP Inspection**,
   disattivazione di **LLMNR/NBT-NS**, **firma SMB** contro il relay, cifratura e
   segmentazione, e il monitoraggio delle anomalie (ARP gratuiti, rispondenti
   inattesi).

Didattici/difensivi: nessun comando o tool operativo, soli target di
documentazione (`192.0.2.0/24`). Riferimenti risolti in HTTPS: NIST **SP 800-115**
(Metasploit) e ATT&CK **T1557** + **T1557.001** (Adversary-in-the-Middle:
LLMNR/NBT-NS Poisoning). Nessun nuovo capitolo eJPT (i tre restano fissi).

### Indice di rotta (`src/content/manualRouteIndex.ts`)

Aggiunti i due id ai `topicIds` del capitolo `exploitation-post-exploitation`
nella posizione corretta, per la parità con il dataset (guard).

## Verifiche

- `npm run typecheck`, `npm run lint`, `npm run format:check`: **puliti**.
- Integrità del manuale (`src/lib/studyManual.test.ts`): **verde** — id unici,
  campi non vuoti, guard riferimenti (100/100 con ≥1 riferimento HTTPS), indice di
  rotta in sincrono, parità IT/EN, rotta eJPT ai tre capitoli invariata.
- Guard bilingue strutturale: **verde** (contatore anti no-op, 100 argomenti).
- `npm run verify` completo: **superato** — build e tutti i gate, incluso
  `verify:offensive-content` (contenuti difensivi, nessun payload riusabile o
  target live).
- E2E Playwright/Chromium con Axe WCAG 2.2 AA: **superati**.
- `size-limit` / budget performance: entry **< 125 kB** gzip.
- `npm audit --omit=dev`: **0 vulnerabilità**.

## Esito

Manuale a **29 capitoli / 100 argomenti / 77 laboratori guidati**. Il dominio
Host & Network Penetration Testing dell'eJPT guadagna i moduli Metasploit e
Network-Based Attacks, ancorati al corso ufficiale, difensivi e verificati.

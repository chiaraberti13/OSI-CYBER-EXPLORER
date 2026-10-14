# Verifica e intervento CONTENT-02 (routing/control plane) — 14 ottobre 2026

Baseline: `main`, `67f222f` (dopo LAB-01). Ambiente locale: Node.js 22.22.0, npm 10.9.4, Chromium
preinstallato (Playwright 1.56.1); CI sulla versione fissata.

## Analisi (verifica 360°)

Stato Git pulito, `HEAD == origin/main == 67f222f`, nessuna modifica concorrente; baseline verde.
Tra i laboratori difensivi non ancora insegnati (CONTENT-02), `routingsecurity` («Routing e control
plane») è il più ricco e distinto: copre la sicurezza del piano di controllo (OSPF, BGP/RPKI, uRPF,
CoPP, RIB/FIB), non trattata nei capitoli di routing di base (ordine 5) né nei servizi IP estesi
(ordine 13). È il primo incremento naturale. Nessun problema bloccante in analisi.

## Implementazione

- **Nuovo capitolo** `routing-control-plane-security` (ordine 25, `track: 'extension'`,
  `cert: 'securityplus'`), «Sicurezza del routing e del control plane», con tre argomenti:
  1. **Fiducia del routing: adiacenze OSPF e integrità dell'LSDB** — un router esegue ciò che il
     routing gli dice; autenticazione delle adiacenze, integrità dell'LSDB, rischi di
     redistribuzione e default-route injection.
  2. **BGP, RPKI e anti-spoofing (uRPF e BCP 38)** — policy BGP, validazione RPKI dell'origine,
     maximum-prefix; anti-spoofing con uRPF e filtraggio in ingresso BCP 38, con il limite del
     routing asimmetrico.
  3. **Protezione del control plane: CoPP e coerenza RIB/FIB** — il control plane come bersaglio e
     la sua CPU, CoPP (classificazione e policing per classe), la coerenza tra RIB, FIB e adiacenza
     verificata con test end-to-end.
- Ogni argomento ha obiettivi, teoria progressiva, esempio su `192.0.2.0/24`, errori comuni,
  riferimenti (RFC 2328, RFC 7454, NIST SP 800-189) e un laboratorio guidato su `routingsecurity`.
  Filo conduttore coerente con segmentazione e identità: nessuna fiducia implicita, tutto
  verificato.
- **Chiusura del divario guida↔lab:** `routingsecurity` ora ha una controparte teorica nel manuale.
- **Conteggi:** il manuale passa a **25 capitoli / 76 argomenti / 62 laboratori guidati**.
  Aggiornate le asserzioni che fissavano 24 capitoli (progresso `0/25` e `1/25`, percentuale
  `1/25 (4%)`, 25 opzioni, optgroup «Estensione · 0/11», progresso inglese `1/25`).

## Esiti finali

| Controllo                          | Esito                                                     |
| ---------------------------------- | --------------------------------------------------------- |
| `npm run verify`                   | Superato (uscita 0)                                       |
| Prettier, ESLint, TypeScript       | Superati                                                  |
| Vitest con coverage                | Superato                                                  |
| Parità IT/EN (`bilingual`, manual) | Superata (acronimi e cifre identici tra le due lingue)    |
| `documentation-targets`            | Superato (solo target di documentazione)                  |
| `verify:offensive-content`         | Superato (file sorgente invariati; manuale fuori dal set) |
| Build Vite + budget gzip           | Superati                                                  |
| Playwright completo                | **64/64** su Chromium (Axe WCAG 2.2 AA incluso)           |
| `audit:runtime` / `audit:full`     | 0 vulnerabilità                                           |

CodeQL, Gitleaks, OSV, Lighthouse e la scansione dinamica del deployment sono verifiche dei
workflow GitHub, non eseguite localmente.

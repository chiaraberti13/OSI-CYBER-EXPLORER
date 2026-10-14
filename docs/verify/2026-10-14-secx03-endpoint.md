# Verifica e intervento SECX-03 (endpoint) — 14 ottobre 2026

Baseline: `main`, `15bcfa7` (dopo SECX-02). Ambiente locale: Node.js 22.22.0, npm 10.9.4, Chromium
preinstallato (Playwright 1.56.1); CI sulla versione fissata.

## Analisi (verifica 360°)

Stato Git pulito, `HEAD == origin/main == 15bcfa7`, nessuna modifica concorrente; baseline verde.
SECX-03 copre sette laboratori difensivi non ancora insegnati, «uno per incremento». Il laboratorio
`endpointsecurity` («Endpoint e postura») è distinto dal capitolo 18 (hardening/detection/IR, di
rete) e complementare alla post-exploitation del percorso eJPT; è il primo incremento naturale.
Nessun problema bloccante in analisi.

## Implementazione

- **Nuovo capitolo** `endpoint-security-posture` (ordine 23, `track: 'extension'`,
  `cert: 'securityplus'`), «Sicurezza dell'endpoint e postura», con tre argomenti:
  1. **Inventario, baseline e patching basato sul rischio** — l'inventario come precondizione, la
     baseline contro il configuration drift, il patching ordinato per rischio (gravità, esposizione,
     sfruttabilità) e non per numero.
  2. **EDR, host firewall e application control** — cosa osserva un EDR e perché copertura/sensor
     health/tamper protection contano, l'host firewall sul traffico east–west, l'application control
     su script e macro.
  3. **Postura continua, privilegi e isolamento** — Zero Trust applicato all'endpoint, igiene dei
     privilegi locali, risposta evidence-first (isolare senza spegnere, acquisire, bonificare,
     riammettere).
- Ogni argomento ha obiettivi, teoria progressiva, esempio su `192.0.2.0/24`, errori comuni,
  riferimenti (NIST SP 800-40 Rev. 4, SP 800-137, MITRE ATT&CK T1562.001) e un laboratorio guidato
  su `endpointsecurity`. Esplicito il collegamento difensivo alla post-exploitation eJPT.
- **Chiusura del divario guida↔lab:** `endpointsecurity` ora ha una controparte teorica nel manuale.
- **Conteggi:** il manuale passa a **23 capitoli / 70 argomenti / 56 laboratori guidati**.
  Aggiornate le asserzioni che fissavano 22 capitoli (progresso `0/23` e `1/23`, percentuale
  `1/23 (4%)`, 23 opzioni, optgroup «Estensione · 0/9», progresso inglese `1/23`).

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
| Playwright completo                | **63/63** su Chromium (Axe WCAG 2.2 AA incluso)           |
| `audit:runtime` / `audit:full`     | 0 vulnerabilità                                           |

CodeQL, Gitleaks, OSV, Lighthouse e la scansione dinamica del deployment sono verifiche dei
workflow GitHub, non eseguite localmente.

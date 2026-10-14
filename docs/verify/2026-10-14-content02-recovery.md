# Verifica e intervento CONTENT-02 (resilienza/ripristino) — 14 ottobre 2026

Baseline: `main`, `4b3a114` (dopo CONTENT-02 management). Ambiente locale: Node.js 22.22.0,
npm 10.9.4, Chromium preinstallato (Playwright 1.56.1); CI sulla versione fissata.

## Analisi (verifica 360°)

Stato Git pulito, `HEAD == origin/main == 4b3a114`, nessuna modifica concorrente; baseline verde.
Quarto incremento di CONTENT-02. Dei due laboratori ancora non insegnati, `layer2security`
risulterebbe in sovrapposizione con il capitolo 14 (che già insegna «comporre le difese di livello
2»): si è quindi scelto `recovery` («Resilienza e ripristino»), distinto e complementare al
capitolo sulla disponibilità (26) come faccia «ripristino» della «A» della triade CIA. Nessun
problema bloccante in analisi.

## Implementazione

- **Nuovo capitolo** `resilience-recovery` (ordine 28, `track: 'extension'`, `cert: 'securityplus'`),
  «Resilienza e ripristino», con tre argomenti:
  1. **Ridondanza vera: percorsi, alimentazione e accesso OOB** — l'indipendenza reale (niente
     destino condiviso), lo spare validato e l'OOB come controllo di resilienza; la ridondanza va
     provata, non dichiarata.
  2. **La procedura: dipendenze, continuità minima e stop condition** — ripristinare nell'ordine
     delle dipendenze, puntare prima alla continuità minima, fermarsi quando l'esito non è atteso.
  3. **Validare il ripristino: RTO/RPO, test per nome e backup verificati** — RTO/RPO come obiettivi
     misurabili, la validazione per nome (non un ping verso un IP) e i backup provati in restore.
- Ogni argomento ha obiettivi, teoria progressiva, esempio su `192.0.2.0/24`, errori comuni,
  riferimenti (NIST SP 800-34 Rev. 1, SP 800-53 Rev. 5, SP 800-184) e un laboratorio guidato su
  `recovery`. Filo conduttore coerente: ciò che non è provato non si dà per funzionante.
- **Chiusura del divario guida↔lab:** `recovery` ora ha una controparte teorica nel manuale.
- **Conteggi:** il manuale passa a **28 capitoli / 85 argomenti / 71 laboratori guidati**.
  Aggiornate le asserzioni che fissavano 27 capitoli (progresso `0/28` e `1/28`, percentuale
  `1/28 (4%)`, 28 opzioni, optgroup «Estensione · 0/14», progresso inglese `1/28`).

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

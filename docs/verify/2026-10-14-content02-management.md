# Verifica e intervento CONTENT-02 (piano di gestione) — 14 ottobre 2026

Baseline: `main`, `752dc79` (dopo CONTENT-02 availability). Ambiente locale: Node.js 22.22.0,
npm 10.9.4, Chromium preinstallato (Playwright 1.56.1); CI sulla versione fissata.

## Analisi (verifica 360°)

Stato Git pulito, `HEAD == origin/main == 752dc79`, nessuna modifica concorrente; baseline verde.
Terzo incremento di CONTENT-02: `managementsecurity` («Management e telemetria») è un laboratorio
non ancora insegnato. Completa la **trilogia dei piani** (dati e controllo trattati nel capitolo
25): il piano di gestione. La sovrapposizione con il capitolo 13 (basi NTP/SNMP/Syslog) è evitata
inquadrando il capitolo sulla _sicurezza e fiducia_ del piano di gestione (isolamento, telemetria
autentica, tempo attendibile, punti ciechi), non sulla configurazione di base. Nessun problema
bloccante in analisi.

## Implementazione

- **Nuovo capitolo** `management-plane-telemetry-security` (ordine 27, `track: 'extension'`,
  `cert: 'securityplus'`), «Sicurezza del piano di gestione e della telemetria», con tre argomenti:
  1. **Isolare la gestione: OOB, management VRF e accesso** — separare il piano di gestione,
     SSHv2/VTY, identità individuali e AAA per l'attribuibilità.
  2. **Telemetria attendibile: SNMPv3, Syslog e tempo** — autenticità (SNMPv3), integrità (Syslog
     protetto, collector affidabile) e tempo attendibile (NTP) come requisiti perché la telemetria
     valga come evidenza.
  3. **Automazione e punti ciechi: NETCONF, backup e collector** — stato previsto vs effettivo con
     NETCONF/RESTCONF/YANG, esposizione CDP/LLDP, backup/restore protetti, sampling dei collector.
- Ogni argomento ha obiettivi, teoria progressiva, esempio su `192.0.2.0/24`, errori comuni,
  riferimenti (NIST SP 800-53 Rev. 5, RFC 3411, RFC 6241) e un laboratorio guidato su
  `managementsecurity`. Filo conduttore coerente con routing e disponibilità: nessuna fiducia
  implicita, tutto verificato.
- **Chiusura del divario guida↔lab:** `managementsecurity` ora ha una controparte teorica nel
  manuale.
- **Conteggi:** il manuale passa a **27 capitoli / 82 argomenti / 68 laboratori guidati**.
  Aggiornate le asserzioni che fissavano 26 capitoli (progresso `0/27` e `1/27`, percentuale
  `1/27 (4%)`, 27 opzioni, optgroup «Estensione · 0/13», progresso inglese `1/27`).

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

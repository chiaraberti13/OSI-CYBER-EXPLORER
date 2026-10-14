# Verifica e intervento CONTENT-02 (disponibilità/DoS) — 14 ottobre 2026

Baseline: `main`, `b60dc91` (dopo CONTENT-02 routing). Ambiente locale: Node.js 22.22.0, npm
10.9.4, Chromium preinstallato (Playwright 1.56.1); CI sulla versione fissata.

## Analisi (verifica 360°)

Stato Git pulito, `HEAD == origin/main == b60dc91`, nessuna modifica concorrente; baseline verde.
Secondo incremento di CONTENT-02: `availability` («Disponibilità e DoS») è un laboratorio non
ancora insegnato, ricco e distinto (esaurimento di risorse a ogni livello: link, backlog, tabelle
di stato, cache, code). È la «A» della triade CIA resa operativa; la sola sovrapposizione — la CPU
del control plane — è gestita rimandando al capitolo 25. Nessun problema bloccante in analisi.

## Implementazione

- **Nuovo capitolo** `availability-dos-capacity` (ordine 26, `track: 'extension'`,
  `cert: 'securityplus'`), «Disponibilità, DoS e capacità», con tre argomenti:
  1. **Il modello del DoS: esaurire una risorsa finita** — ragionare per risorsa più scarsa, non
     per volume, e scegliere il punto di enforcement (a monte per la banda, locale per stato/CPU).
  2. **Flood di stato: SYN, reflection e tabelle di stato** — l'asimmetria invio/stato, SYN flood e
     SYN cookie, reflection/amplification con anti-spoofing (BCP 38, dal capitolo routing),
     esaurimento di NAT/firewall e limite dello stato per sorgente.
  3. **Capacità, code e QoS** — esaurimento di CAM/DHCP/DNS/NAT oltre la banda, e la QoS che
     ridistribuisce la scarsità (senza crearla) per far sopravvivere il traffico critico.
- Ogni argomento ha obiettivi, teoria progressiva, esempio su `192.0.2.0/24`, errori comuni,
  riferimenti (MITRE ATT&CK T1498 e T1499, RFC 4987) e un laboratorio guidato su `availability`.
- **Chiusura del divario guida↔lab:** `availability` ora ha una controparte teorica nel manuale.
- **Conteggi:** il manuale passa a **26 capitoli / 79 argomenti / 65 laboratori guidati**.
  Aggiornate le asserzioni che fissavano 25 capitoli (progresso `0/26` e `1/26`, percentuale
  `1/26 (4%)`, 26 opzioni, optgroup «Estensione · 0/12», progresso inglese `1/26`).

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

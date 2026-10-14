# Verifica e intervento CONTENT-01 (segmentazione) + apertura Fase 3 — 14 ottobre 2026

Baseline: `main`, `eeb9a40` (dopo VIS-11). Ambiente locale: Node.js 22.22.0, npm 10.9.4, Chromium
preinstallato (Playwright 1.56.1); CI sulla versione fissata.

## Analisi (team multidisciplinare, verifica 360°)

Stato Git pulito, `HEAD == origin/main == eeb9a40`, nessuna modifica concorrente; baseline verde.
Il percorso eJPT è completo e la copertura guida↔laboratori è quasi conclusa; tra i laboratori
difensivi ancora non insegnati, `segmentation` è il più ricco e distinto (il capitolo 9 ne tratta
solo un cenno) ed è il complemento difensivo naturale del movimento laterale eJPT. In parallelo,
l'utente chiede una **nuova roadmap in sostituzione di quella vecchia**. Nessun problema bloccante.

## Implementazione

### Contenuto (Instructional Designer + Cybersecurity)

- **Nuovo capitolo** `segmentation-trust-boundaries` (ordine 24, `track: 'extension'`,
  `cert: 'securityplus'`), «Segmentazione e confini di fiducia», con tre argomenti:
  1. **Separare non è applicare: VLAN, ACL e confini** — la VLAN separa il broadcast ma non applica
     policy; collocazione e direzione dell'ACL; verifica nei due versi (stateless).
  2. **Microsegmentazione, east–west e Zero Trust** — la rete piatta come moltiplicatore d'impatto,
     la microsegmentazione che contiene la propagazione, lo Zero Trust che toglie la fiducia basata
     sulla posizione, i confini guest/IoT/non gestiti.
  3. **VRF, overlay e servizi condivisi** — VRF e overlay, il route leaking come confine riaperto da
     tenere minimo, i servizi condivisi come segmento ad alto valore, il rischio del routing
     asimmetrico per l'ispezione stateful.
- Ogni argomento ha obiettivi, teoria progressiva, esempio su `192.0.2.0/24`, errori comuni,
  riferimenti (NIST SP 800-41 Rev. 1, SP 800-207 Zero Trust, RFC 4364) e un laboratorio guidato su
  `segmentation`. Collegamento difensivo esplicito al movimento laterale eJPT.
- **Conteggi:** il manuale passa a **24 capitoli / 73 argomenti / 59 laboratori guidati**.
  Aggiornate le asserzioni che fissavano 23 capitoli (progresso `0/24` e `1/24`, percentuale
  `1/24 (4%)`, 24 opzioni, optgroup «Estensione · 0/10», progresso inglese `1/24`).

### Roadmap (Technical Writer)

- **Nuova roadmap Fase 3** in `ROADMAP.md`, in sostituzione della Fase 2 (archiviata con banner di
  rimando in `docs/roadmap-archive-phase2-2026-10-14.md`), organizzata per le figure del team e
  focalizzata su: chiusura della copertura guida↔laboratori, **nuovi laboratori interattivi** per la
  metodologia eJPT (track dedicato `LAB-01`), e qualità trasversale (visual/UX/i18n/docs).

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

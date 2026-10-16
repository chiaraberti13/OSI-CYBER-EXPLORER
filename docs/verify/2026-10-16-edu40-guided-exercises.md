# EDU-40 — Esercizi guidati per i nuovi argomenti eJPT

16 ottobre 2026. Baseline `main`:
`ac7f737c4dd73b25b946aaca51e9783a31db4c29`. Checkout pulito, remoto allineato,
nessun lavoro concorrente. Intervento: primo elemento del backlog verificato
(EDU-40), preceduto dalla verifica di PERF-01.

## Verifica di PERF-01 (prima di procedere)

Ho misurato dal manifest di build che il budget `initialJsGzipBytes` copre il
**solo chunk entry** (`index-*.js`, ~122,4 kB gzip), che contiene codice dello
shell. I dati di manuale e glossario **non** sono nell'entry: Vite li colloca in
un chunk condiviso lazy (verificato: le stringhe `osi-model`, `ip-services-ntp`,
`exploitation-reverse-bind-shell` non compaiono nell'entry). Quindi l'aggiunta di
contenuti — inclusi questi esercizi guidati — non consuma il margine del budget,
come confermato dopo le modifiche (entry invariato a ~122,4 kB). La voce PERF-01
nella roadmap è stata corretta di conseguenza: la pressione è sullo shell, non sui
contenuti, e la priorità effettiva resta bassa finché l'entry è sotto soglia.

## Cosa è stato aggiunto (EDU-40)

Tre esercizi guidati (`guidedLab`) per i tre argomenti eJPT aggiunti in precedenza,
ciascuno che riusa un laboratorio interattivo già registrato:

| Argomento (capitolo)                               | `guidedLab`                    | Vista riusata         |
| -------------------------------------------------- | ------------------------------ | --------------------- |
| Attacchi alle password (pentest-methodology)       | `gl-pentest-password-defense`  | `identitytrust`       |
| Inclusione di file e directory traversal (web-app) | `gl-web-inclusion-defense`     | `applicationsecurity` |
| Reverse shell e bind shell (exploitation)          | `gl-exploitation-egress-shell` | `inspection`          |

L'argomento CCNA **NTP** resta volutamente solo-teoria: non esiste un laboratorio
interattivo con cui abbinarlo in modo istruttivo e un riuso forzato sarebbe di
bassa qualità. Ogni esercizio è bilingue (scenario, consegna, passi, sfida,
soluzione, autovalutazione), concettuale e difensivo, con soli target di
documentazione. Laboratori guidati totali: 74 → 77 (conteggio derivato dal
dataset, ENG-31); aggiornata l'intestazione della roadmap.

## Verifiche

- `npm run verify` completo: **superato** — 782 test Vitest, build e tutti i gate
  (offensive-content, technical-content, documentation-targets, design-system,
  accessibility-release, performance, lockfile, release, deployment-security,
  repository-posture); budget d'ingresso invariato a 122432 B gzip / 125 kB.
- `studyManual.test.ts`: **verde** — id dei laboratori guidati unici, `steps`,
  `solution`, `selfCheck` non vuoti, viste registrate, parità IT/EN.
- Guard bilingue (`bilingual.test.ts`): **verde**.
- `npm run test:e2e`: **74/74** Chromium; la QA-20 deriva dal dataset il numero di
  argomenti ed esercizi guidati per i capitoli eJPT, quindi i tre nuovi esercizi
  sono coperti senza modifiche allo spec.
- Audit: **0 vulnerabilità**; nessuna dipendenza cambiata.

Avvio con Node 24.22.0 (nvm) per il range `engines`; nessuna dipendenza del
progetto modificata. Non eseguiti Firefox/WebKit né controlli del deployment
pubblico; gli esiti locali non equivalgono alla matrice CI remota.

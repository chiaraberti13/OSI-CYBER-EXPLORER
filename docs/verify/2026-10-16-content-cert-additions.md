# Contenuti aggiuntivi per CCNA 200-301 ed eJPT (manuale + glossario)

16 ottobre 2026. Baseline `main`:
`b92d4eb2f8662502b6f709ad0940e60b83548c05`. Checkout pulito, remoto allineato,
nessun lavoro concorrente. Intervento richiesto: aggiungere contenuti utili per i
due obiettivi di certificazione sia nel manuale sia nel glossario.

## Cosa è stato aggiunto

### Glossario (`src/content/glossaryTerms.ts`) — 12 voci bilingui (114 → 126)

- **CCNA 200-301:** GLBP, DHCPv6, RA Guard, VXLAN, Split Horizon, Route Summarization.
- **eJPT:** Enumeration, Privilege Escalation, Pivoting, Reverse Shell, LFI/RFI,
  Directory Traversal.

Ogni voce ha definizione IT ed EN tecnicamente verificata e parallela negli
acronimi e nelle cifre (requisito del guard bilingue euristico).

### Manuale (`src/content/studyManual.ts`) — 4 nuovi argomenti (88 → 92)

| Capitolo (track)                        | Nuovo argomento                                    | Obiettivo                                                                      |
| --------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------ |
| `ip-services` (CCNA)                    | NTP: sincronizzazione del tempo                    | CCNA 4.x IP services; stratum, UDP 123, NTS, UTC e correlazione dei log        |
| `pentest-methodology` (eJPT)            | Attacchi alle password: brute force e spraying     | online vs offline, stuffing, spraying e difese (MFA, hashing lento)            |
| `web-app-pentest` (eJPT)                | Inclusione di file e directory traversal (LFI/RFI) | causa comune, log poisoning, allowlist e canonicalizzazione del percorso       |
| `exploitation-post-exploitation` (eJPT) | Reverse shell e bind shell                         | perché la reverse supera firewall in ingresso e NAT; difesa = egress filtering |

Nessun nuovo capitolo: la rotta eJPT resta vincolata ai tre capitoli esistenti
(test `studyManual.test.ts`), quindi i contenuti eJPT sono stati aggiunti come
argomenti dei capitoli già presenti. I contenuti offensivi restano **concettuali
e difensivi** — nessun comando operativo, solo target di documentazione — con
riferimenti MITRE ATT&CK (T1110, T1190, T1059) e RFC 5905 per NTP.

I conteggi (capitoli, argomenti, laboratori, glossario) sono derivati dal dataset
(ENG-31), quindi nessuna asserzione hard-coded è stata modificata; aggiornato solo
il riferimento «92 argomenti» nell'intestazione della ROADMAP.

## Verifiche

- `npm run typecheck`, `npm run lint`, `npm run format:check`: **puliti**.
- Guard bilingue (`src/content/bilingual.test.ts`): **verde** — parità euristica
  (token/lunghezza) e walk strutturale di glossario e manuale superati sulle nuove
  voci (corretto in corsa un plurale «/24s» che rompeva il conteggio della cifra in
  inglese).
- Integrità del manuale (`src/lib/studyManual.test.ts`): **verde** — id argomenti
  unici, campi didattici non vuoti, riferimenti risolti in HTTPS, parità IT/EN,
  track/dominio coerenti, rotta eJPT invariata ai tre capitoli.
- `npm run verify` completo: **superato** — 782 test Vitest, build e tutti i gate
  (offensive-content, technical-content, documentation-targets, design-system,
  accessibility-release, performance, lockfile, release, deployment-security,
  repository-posture).
- `npm run test:e2e`: **74/74** Chromium (Axe WCAG 2.2 AA).
- Audit: **0 vulnerabilità**; nessuna dipendenza cambiata.

Avvio con Node 24.22.0 (nvm) perché l'ambiente aveva 22.22.0, fuori dal range
`engines`; nessuna dipendenza del progetto modificata. Non eseguiti Firefox/WebKit
né controlli del deployment pubblico; gli esiti locali non equivalgono alla matrice
CI remota.

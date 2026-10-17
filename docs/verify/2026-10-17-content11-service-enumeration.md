# CONTENT-11 — Enumerazione dei servizi: SMB, SNMP e NFS (eJPT)

17 ottobre 2026. Baseline `main` HEAD `94d3134` (dopo la pianificazione del
backlog contenuti). Checkout pulito. Intervento: completare il prossimo task
utile della ROADMAP — **CONTENT-11 (P2)** del backlog «Contenuti pianificati» —
aggiungendo un argomento ad alto valore a un capitolo eJPT esistente, bilingue,
difensivo e verificato.

## Cosa è stato aggiunto

### Manuale (`src/content/studyManual.ts`) — 1 nuovo argomento (93 → 94)

| Capitolo (track)             | Nuovo argomento                           | Allineamento                               |
| ---------------------------- | ----------------------------------------- | ------------------------------------------ |
| `pentest-methodology` (eJPT) | Enumerazione dei servizi: SMB, SNMP e NFS | eJPT — Information Gathering / Enumeration |

L'argomento `pentest-service-enumeration` è collocato subito dopo «Scanning ed
enumerazione dei servizi», di cui è l'approfondimento per servizio. Copre, in
chiave didattica e difensiva:

- **SMB (445/139)**: sessioni null/guest che espongono share, utenti, gruppi e
  politica delle password; SMBv1 obsoleto da disattivare, firma dei messaggi su
  SMBv2/SMBv3; difesa = negare le sessioni anonime, segmentare, non pubblicare
  share superflue.
- **SNMP (UDP 161)**: community string come password condivisa, i valori di
  default «public» (RO) e «private» (RW), trasmissione in chiaro su v1/v2c,
  enumerazione via MIB (routing, interfacce, processi, versione); difesa =
  SNMPv3 con autenticazione e cifratura, rete di gestione separata, filtro ai
  soli collector.
- **NFS (2049)**: lista degli export, export troppo aperti e l'opzione
  `no_root_squash` che eleva a root del client; difesa = export a host/reti
  precise, root squash, Kerberos su NFSv4.
- In tutti e tre i casi: la firma dell'enumerazione nei log e il ruolo della
  segmentazione nel limitare a monte la raggiungibilità del servizio.

Argomento **concettuale/difensivo**: nessun comando operativo d'attacco, nessun
tool, soli target di documentazione (`192.0.2.0/24`). Riferimenti risolti in
HTTPS: **ATT&CK T1135** (Network Share Discovery,
`https://attack.mitre.org/techniques/T1135/`) e **NIST SP 800-123** (Guide to
General Server Security, `https://csrc.nist.gov/pubs/sp/800/123/final`).
Teoria-only (come QoS/NTP): nessun laboratorio interattivo adeguato con cui
abbinarlo in modo istruttivo, quindi nessun `lab`/`guidedLab` forzato.

Nessun nuovo capitolo eJPT: l'argomento entra in un capitolo esistente, nel
rispetto del vincolo fissato dai test (tre soli capitoli eJPT). I conteggi sono
derivati dal dataset (ENG-31): `manualStats()` → **29 capitoli / 94 argomenti /
77 laboratori guidati**. Nessuna asserzione hard-coded modificata; aggiornato il
riferimento «93 argomenti» nell'intestazione della ROADMAP.

## Revisione IT/EN (I18N-10)

Parità di acronimi e cifre curata campo per campo: 445/139, 161, 2049, RO/RW,
v1/v2c/v3, SMBv1/SMBv2/SMBv3, NFSv4. Le stringhe EN rispecchiano le IT senza
divergenze numeriche; accuratezza tecnica e naturalezza riviste in entrambe le
lingue (es. «null/guest session», «root squash», «community string»).

## Verifiche

- `npm run typecheck`, `npm run lint`, `npm run format:check`: **puliti**.
- Guard bilingue strutturale ed euristico (`STUDY_MANUAL` in `BILINGUAL_DATASETS`,
  `src/lib/content.test.ts`): **verde** — parità e non-vuoto su titolo, obiettivi,
  prerequisiti, teoria, esempio ed errori comuni del nuovo argomento; contatore
  anti no-op (>80 argomenti) rispettato (94).
- Integrità del manuale (`src/lib/studyManual.test.ts`): **verde** — id argomento
  unico, campi didattici non vuoti, riferimenti risolti in HTTPS, parità IT/EN,
  track/dominio coerenti, rotta eJPT invariata ai tre capitoli.
- `npm run verify` completo: **superato** — build e tutti i gate (lockfile,
  release, deployment-security, repository-posture, documentation-targets,
  offensive-content, technical-content, design-system, accessibility-release,
  format, typecheck, lint, test:coverage, performance).
- E2E Playwright/Chromium con Axe WCAG 2.2 AA: **superati**.
- `size-limit` / budget performance: entry **122,9 kB** gzip < 125 kB (il
  contenuto vive nel chunk condiviso lazy, non nell'entry).
- `npm audit --omit=dev`: **0 vulnerabilità**.

## Esito

CONTENT-11 **completato** e verificato: incremento verticale verde,
documentazione-only lato contenuti didattici, difensivo/neutro, senza nuovi
capitoli eJPT. Il backlog «Contenuti pianificati» resta con le voci CONTENT-12,
CONTENT-13, CONTENT-15 e VIS-13 ancora aperte.

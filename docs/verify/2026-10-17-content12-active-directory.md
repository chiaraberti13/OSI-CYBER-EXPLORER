# CONTENT-12 — Basi di Active Directory (eJPT)

17 ottobre 2026. Baseline `main` HEAD `27765cf` (dopo CONTENT-11). Checkout
pulito. Intervento: completare il task successivo del backlog «Contenuti
pianificati» — **CONTENT-12 (P2)** — aggiungendo un argomento ad alto valore a
un capitolo eJPT esistente, bilingue, concettuale/difensivo e verificato.

## Cosa è stato aggiunto

### Manuale (`src/content/studyManual.ts`) — 1 nuovo argomento (94 → 95)

| Capitolo (track)                        | Nuovo argomento                                       | Allineamento                        |
| --------------------------------------- | ----------------------------------------------------- | ----------------------------------- |
| `exploitation-post-exploitation` (eJPT) | Basi di Active Directory: dominio, Kerberos e fiducia | eJPT — Host & Network Auditing / AD |

L'argomento `active-directory-basics` è collocato subito dopo «Movimento
laterale e pivoting», di cui estende il modello di fiducia dal singolo host al
dominio. Copre, in chiave didattica e difensiva:

- **Modello AD**: dominio, foresta (confine di fiducia), unità organizzative
  (OU), criteri di gruppo (GPO) e il domain controller (DC) come directory
  interrogabile via LDAP e autorità di autenticazione.
- **Autenticazione**: NTLM (challenge-response e riuso dell'hash) vs Kerberos
  (KDC sul DC, TGT iniziale e TGS di servizio), con il motivo per cui Kerberos
  riduce l'esposizione delle credenziali spostando il valore su ticket e account
  di servizio.
- **Superficie e difesa**: enumerazione LDAP possibile anche a un utente di
  dominio qualunque, relazioni di fiducia tra domini/foreste; difesa stratificata
  con tiering amministrativo, hardening degli account di servizio Kerberos
  (password lunghe/casuali, privilegi minimi) e monitoraggio degli eventi del DC.

Argomento **concettuale/difensivo**: nessuna tecnica operativa, nessun comando,
soli target di documentazione (`192.0.2.0/24`). Riferimenti risolti in HTTPS:
**ATT&CK T1087.002** (Account Discovery: Domain Account,
`https://attack.mitre.org/techniques/T1087/002/`) e **RFC 4120** (Kerberos V5,
`https://datatracker.ietf.org/doc/html/rfc4120`). Teoria-only: nessun laboratorio
interattivo adeguato con cui abbinarlo in modo istruttivo.

Nessun nuovo capitolo eJPT: l'argomento entra in un capitolo esistente, nel
rispetto del vincolo dei test (tre soli capitoli eJPT). Conteggi derivati dal
dataset (ENG-31): `manualStats()` → **29 capitoli / 95 argomenti / 77 laboratori
guidati**. Aggiornato il riferimento «94 argomenti» nell'intestazione della
ROADMAP.

## Revisione IT/EN (I18N-10)

Parità di acronimi curata campo per campo: AD, OU, GPO, DC, LDAP, KDC, TGT, TGS,
NTLM, Kerberos. Le stringhe EN rispecchiano le IT senza divergenze; accuratezza
tecnica e naturalezza riviste in entrambe le lingue (es. «trust relationship»,
«domain controller», «service account»).

## Verifiche

- `npm run typecheck`, `npm run lint`, `npm run format:check`: **puliti**.
- Guard bilingue strutturale ed euristico (`STUDY_MANUAL` in `BILINGUAL_DATASETS`,
  `src/lib/content.test.ts`): **verde** — parità e non-vuoto su titolo, obiettivi,
  prerequisiti, teoria, esempio ed errori comuni; contatore anti no-op rispettato (95).
- Integrità del manuale (`src/lib/studyManual.test.ts`): **verde** — id argomento
  unico, campi didattici non vuoti, riferimenti risolti in HTTPS, parità IT/EN,
  track/dominio coerenti, rotta eJPT invariata ai tre capitoli.
- `npm run verify` completo: **superato** — build e tutti i gate (lockfile,
  release, deployment-security, repository-posture, documentation-targets,
  offensive-content, technical-content, design-system, accessibility-release,
  format, typecheck, lint, test:coverage, performance).
- E2E Playwright/Chromium con Axe WCAG 2.2 AA: **superati**.
- `size-limit` / budget performance: entry **122,9 kB** gzip < 125 kB.
- `npm audit --omit=dev`: **0 vulnerabilità**.

## Esito

CONTENT-12 **completato** e verificato: incremento verticale verde, contenuto
didattico concettuale/difensivo, senza nuovi capitoli eJPT. Il backlog
«Contenuti pianificati» resta con CONTENT-13, CONTENT-15 e VIS-13 ancora aperte.

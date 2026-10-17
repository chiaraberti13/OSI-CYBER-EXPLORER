# Glossario — +50 voci (CCNA + eJPT)

17 ottobre 2026. Baseline `main` HEAD `4265baa`. Checkout pulito. Richiesta
utente: il glossario appariva scarno — aggiungere **50** voci. Intervento:
ampliare `GLOSSARY_TERMS` con vocabolario reale di CCNA 200-301 e del syllabus
eJPT, bilingue e sotto i guard esistenti.

## Cosa è stato aggiunto

`src/content/glossaryTerms.ts`: **da 126 a 176 voci** (+50). Nessuna preesistente
duplicata (controllo di unicità case-insensitive del guard). Ripartizione:

- **CCNA / networking (22):** CIDR, VLSM, Default Route, Static Route, Multicast,
  Root Bridge, CAM Table, Access Port, Inter-VLAN Routing, Loopback Interface,
  OSPF Area, LSA, QoS, LLQ, Trust Boundary, VRF, SD-WAN, CoPP, Control Plane,
  Telnet, TFTP, DNS Record.
- **Fondamenti di sicurezza (8):** CIA Triad, Defense in Depth, Zero Trust,
  Least Privilege, MAC Flooding, VLAN Hopping, ARP Spoofing, CVE.
- **eJPT / metodologia (20):** Reconnaissance, Footprinting, Banner Grabbing,
  Port Scanning, Vulnerability Assessment, Exploit, Post-Exploitation, Lateral
  Movement, SMB, Null Session, LDAP, Kerberos, NTLM, TGT / TGS, Kerberoasting,
  Pass-the-Hash, Active Directory, Rainbow Table, Salt, Brute Force.

Le voci eJPT riprendono il vocabolario dei domini reali della certificazione
(Assessment Methodologies; Host & Network Penetration Testing; Web Application
Penetration Testing): ricognizione, enumerazione, valutazione delle
vulnerabilità, exploitation/post-exploitation, movimento laterale, attacchi e
difese di Active Directory. Ogni definizione è **difensiva/neutra**: nessun
comando, nessun tool operativo, con la contromisura dove pertinente.

## Verifiche

- `npm run typecheck`, `npm run lint`, `npm run format:check`: **puliti**.
- Guard glossario (`GLOSSARY_TERMS` in `src/lib/content.test.ts`): **verde** —
  termini unici (case-insensitive) e definizione bilingue non vuota per ciascuno
  (ora 176).
- Guard bilingue strutturale (`src/content/bilingual.test.ts`): **verde** — il
  glossario è già in `BILINGUAL_DATASETS`; parità it/en confermata sulle nuove
  voci.
- `npm run verify` completo: **superato** — build e tutti i gate.
- E2E Playwright/Chromium con Axe WCAG 2.2 AA: **superati** (modale glossario
  inclusa).
- `size-limit` / budget performance: entry **< 125 kB** gzip (il glossario vive
  nel chunk condiviso lazy, non nell'entry).
- `npm audit --omit=dev`: **0 vulnerabilità**.

## Esito

Glossario portato a **176 voci** bilingui, con copertura molto più ricca di CCNA
ed eJPT. Nessun nuovo tool o contenuto offensivo operativo; solo definizioni
didattiche. (Parte A della richiesta; la parte B — argomenti eJPT basati sul
syllabus reale — è trattata in un incremento separato.)

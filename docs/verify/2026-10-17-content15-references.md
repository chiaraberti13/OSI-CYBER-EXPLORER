# CONTENT-15 — Riferimenti completati e guard di copertura

17 ottobre 2026. Baseline `main` HEAD `d479198` (dopo CONTENT-12). Checkout
pulito. Intervento: completare il task del backlog **CONTENT-15 (P2)** —
portare a copertura totale i riferimenti autorevoli degli argomenti del manuale
e renderla non regredibile con un guard.

## Problema

Dieci argomenti del manuale — tutti fondamenti del percorso CCNA — non citavano
alcun riferimento strutturato (`references`): copertura **85/95**. Mancava inoltre
un controllo che impedisse a un nuovo argomento di essere pubblicato senza fonte.

## Cosa è stato fatto

### Riferimenti aggiunti (`src/content/studyManual.ts`) — 10 argomenti, 85/95 → 95/95

Elenco esatto **derivato dal guard** (non compilato a mano), con la fonte scelta
per accuratezza e risolta in HTTPS su autorità approvata:

| Argomento                     | Riferimento                            |
| ----------------------------- | -------------------------------------- |
| `osi-seven-layers`            | Cisco — OSI reference model            |
| `ethernet-frame-mac`          | IEEE 802.3 (Ethernet)                  |
| `switch-cam-learning`         | IEEE 802.1D (bridging/learning)        |
| `collision-broadcast-domains` | IEEE 802.3 + IEEE 802.1D               |
| `vlan-segmentation`           | IEEE 802.1Q (VLAN tagging)             |
| `trunk-dot1q`                 | IEEE 802.1Q (trunking)                 |
| `stp-loops`                   | IEEE 802.1D (Spanning Tree)            |
| `routing-table-lpm`           | RFC 4632 (CIDR / longest-prefix match) |
| `static-default-routes`       | RFC 1812 (requisiti dei router IPv4)   |
| `dns-resolution`              | RFC 1035 (DNS)                         |

Il modello OSI è ISO/IEC 7498-1, non coperto dai tipi `SecurityReference`
(`rfc|ieee|nist|attack|cisco`): per `osi-seven-layers` è stata scelta la fonte
Cisco, la referenza d'apprendimento autorevole per il CCNA, invece di citare
impropriamente un RFC TCP/IP. Tutte le altre mappano allo standard IEEE/RFC che
definisce il concetto insegnato.

### Guard (`src/lib/studyManual.test.ts`)

Aggiunto il test «gives every topic at least one authoritative reference»: deriva
dall'intero `STUDY_MANUAL` l'insieme degli argomenti con `references` vuoto e
pretende che sia vuoto. Il modello di tracce è binario (IA-10) e piega
l'estensione Security+/avanzata sul percorso CCNA, quindi il controllo copre
entrambi i percorsi d'esame (CCNA ed eJPT) senza liste da mantenere. Un nuovo
argomento senza fonte ora fallisce in CI, esattamente come una traduzione
mancante. Il test preesistente «resolves every structured reference to an https
URL» resta verde: nessuna URL non-HTTPS introdotta.

## Nota su bilingue e conteggi

I riferimenti sono oggetti `{ kind, id }` senza testo: nessun impatto sulla
parità IT/EN né sul guard bilingue. Nessun nuovo argomento, capitolo o
laboratorio: `manualStats()` resta **29 capitoli / 95 argomenti / 77 laboratori
guidati**.

## Verifiche

- `npm run typecheck`, `npm run lint`, `npm run format:check`: **puliti**.
- Integrità del manuale (`src/lib/studyManual.test.ts`): **verde** — incluso il
  nuovo guard (copertura 95/95) e la risoluzione HTTPS di ogni riferimento.
- Guard bilingue (`src/lib/content.test.ts`): **verde** (riferimenti senza testo,
  parità invariata).
- `npm run verify` completo: **superato** — build e tutti i gate (lockfile,
  release, deployment-security, repository-posture, documentation-targets,
  offensive-content, technical-content, design-system, accessibility-release,
  format, typecheck, lint, test:coverage, performance).
- E2E Playwright/Chromium con Axe WCAG 2.2 AA: **superati**.
- `size-limit` / budget performance: entry **122,9 kB** gzip < 125 kB.
- `npm audit --omit=dev`: **0 vulnerabilità**.

## Esito

CONTENT-15 **completato** e verificato: copertura dei riferimenti al 100% degli
argomenti e guard che la mantiene tale. Il backlog «Contenuti pianificati» resta
con CONTENT-13 (P3) e VIS-13 (P3) ancora aperte.

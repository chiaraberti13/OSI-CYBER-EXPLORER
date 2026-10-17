# VIS-13 — Diagramma catena di fiducia PKI/TLS

17 ottobre 2026. Baseline `main` HEAD `34a1537` (dopo la sincronizzazione con il
lavoro concorrente che aveva già aggiunto i diagrammi `encapsulation`, `qos` e
`wlc-policy-mapping`). Checkout pulito. Intervento: proseguire **VIS-13 (P3)**
aggiungendo un nuovo micro-diagramma SVG bilingue a un concetto chiave non ancora
illustrato.

## Contesto di sincronizzazione

Alla verifica remota `origin/main` risultava avanzato di 6 commit concorrenti
(diagrammi encapsulation/QoS/WLC, PERF-01, refactor shell). Il lavoro VIS-13 che
avevo preparato in locale (gli stessi diagrammi encapsulation + QoS) era quindi
**ridondante**: è stato scartato senza forzare duplicati, il ramo riallineato a
`origin/main` in fast-forward e scelto un concetto ancora **non** illustrato — la
catena di fiducia PKI/TLS, già tra i candidati di VIS-13.

## Cosa è stato aggiunto

### Diagramma (`src/content/manualDiagrams.ts`) — 1 nuovo (6 → 7)

| Chiave          | Argomento (capitolo)                               | Concetto                                        |
| --------------- | -------------------------------------------------- | ----------------------------------------------- |
| `pki-tls-chain` | `pki-tls-certificate-chain` (`crypto-vpn-pki-tls`) | Catena di fiducia: Root → Intermediate → server |

Quattro nodi verticali — Root CA (autofirmata, nel trust store), Intermediate CA
(firmata dalla Root), certificato server (chiave pubblica + nome), validazione
del client (costruisce e verifica la catena) — con frecce «firma» / «poi firma» /
«presenta» verso il basso e una freccia **tratteggiata** di validazione che
risale dal certificato server alla Root. La descrizione (`figcaption`, anche
alternativa testuale completa) spiega firma, validità, nome e revoca (CRL/OCSP) e
dichiara i limiti dello schema (cross-signing e pinning omessi).

Inerte e schematico: SVG inline, nessun asset o script remoto. Attacco al tema
via `diagram: 'pki-tls-chain'`; nessun nuovo argomento/capitolo/laboratorio
(`manualStats()` invariato a 29/97/77).

## Accessibilità e riuso (modello VIS-12)

`ManualConceptDiagram` fornisce `role="img"` con `aria-labelledby` (titolo) e
`aria-describedby` (descrizione), `id` univoci via `useId`, colori via
`currentColor` (adattivi al tema). Le etichette degli archi sono uniche nel
diagramma (richiesto dal test del componente) e il lato senza etichetta omette il
campo `label` (ora opzionale), così da non violare il guard bilingue strutturale
che pretende entrambe le lingue non vuote quando l'etichetta è presente.

## Verifiche

- `npm run typecheck`, `npm run lint`, `npm run format:check`: **puliti**.
- Test del componente (`ManualConceptDiagram.test.tsx`): **verde a 7 diagrammi** —
  ogni diagramma attaccato a **un solo** argomento; titolo, descrizione, etichette
  dei nodi e degli archi resi in **entrambe** le lingue; `id` univoci nel riuso.
- Guard bilingue strutturale (`src/content/bilingual.test.ts`, che ora copre
  `MANUAL_DIAGRAMS`) e integrità del manuale (`src/lib/studyManual.test.ts`):
  **verdi**.
- E2E `e2e/manual-concept-diagrams.spec.ts`, esteso al capitolo
  `crypto-vpn-pki-tls`: **8/8** (IT/EN × chiaro/scuro × 320/1280 px) — nessun
  overflow del testo SVG, contrasto inchiostro/superficie ≥ 4.5 nei due temi,
  nessuno scroll orizzontale, Axe WCAG 2.2 AA senza violazioni.
- `npm run verify` completo: **superato** — build e tutti i gate.
- E2E Playwright/Chromium completo con Axe WCAG 2.2 AA: **superati**.
- `size-limit` / budget performance: entry **< 125 kB** gzip (i diagrammi vivono
  nel chunk condiviso lazy, non nell'entry).
- `npm audit --omit=dev`: **0 vulnerabilità**.

## Esito

VIS-13 avanza a **7/97** diagrammi. Resta `[~]` (ricorrente): restano candidati
l'albero STP con i ruoli delle porte e l'handshake IKEv2/Child SA. Nessun
duplicato introdotto rispetto al lavoro concorrente; modifiche riallineate su
`origin/main` senza force push.

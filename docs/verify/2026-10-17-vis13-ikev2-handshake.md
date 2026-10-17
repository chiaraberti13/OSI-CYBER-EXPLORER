# VIS-13 — Diagramma degli scambi IKEv2 e delle CHILD_SA

17 ottobre 2026. Baseline `main` `361e1ae` dopo il riallineamento in fast-forward. Il candidato IKEv2/Child SA era il successivo nella roadmap VIS-13.

## Contenuto aggiunto

Nuovo diagramma inline SVG bilingue `ikev2-handshake`, collegato all'argomento `ipsec-ikev2-depth` nel capitolo `crypto-vpn-pki-tls`.

La sequenza distingue:

1. `IKE_SA_INIT`: negozia parametri crittografici, scambia valori DH e nonce e prepara la IKE SA.
2. `IKE_AUTH`: autentica le identità dei peer e negozia la prima CHILD_SA.
3. Piano di controllo: la IKE SA protegge gli scambi IKE.
4. Piano dati: la prima CHILD_SA corrisponde a due IPsec SA, una per direzione.

La descrizione visibile chiarisce che quattro messaggi in due scambi request/response sono il caso comune, non l'unico; errori e flussi EAP estesi sono omessi. `CREATE_CHILD_SA` può creare altre CHILD_SA o rinnovarle. I fatti sono coerenti con RFC 7296, sezione 1.2.

## Accessibilità e test

Il diagramma riusa `MANUAL_DIAGRAMS` e `ManualConceptDiagram`: SVG inline inerte, `role="img"`, titolo e descrizione accessibili, testo alternativo visibile bilingue, nodi e archi localizzati, `id` generati univoci e colori adattivi al tema. Non sono stati aggiunti asset remoti o codice eseguibile.

Verifiche dopo l'implementazione:

- Guard componente: ogni ID è collegato a un solo argomento; titoli, descrizioni e tutte le etichette sono presenti in italiano e inglese; riferimenti SVG restano univoci quando riusati.
- Guard bilingue strutturale e guard del componente: superati in `npm run verify`.
- E2E `manual-concept-diagrams.spec.ts`: tutte le 8 combinazioni (IT/EN × tema chiaro/scuro × viewport 320/1280 px) passano, inclusi overflow SVG, contrasto ≥ 4.5, scroll orizzontale e Axe WCAG 2.2 AA. Anche la suite E2E completa passa: **84/84**.
- `npm run verify`: superato; typecheck, lint, test unitari/coverage, build e budget prestazionali inclusi. Test unitari: **795/795**; copertura statement **95,56%**.
- Audit dipendenze: `npm run audit:full` e `npm run audit:signatures:full` superati; zero vulnerabilità, 330 firme registry verificate e 123 attestazioni.
- Smoke HTTP locale: `npm run dev -- --host 127.0.0.1 --port 36933` risponde correttamente con la pagina dell'app.

## Esito

VIS-13 passa da **8/104** a **9/104** argomenti con diagramma. I due candidati espliciti della roadmap — albero STP e scambi IKEv2 — sono ora completati. VIS-13 resta ricorrente per aggiunte future motivate da una lacuna didattica concreta.

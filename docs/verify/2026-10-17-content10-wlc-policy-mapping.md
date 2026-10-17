# CONTENT-10 — Modello GUI del WLC Catalyst 9800

17 ottobre 2026. Incremento bilingue nel capitolo CCNA `network-access-discovery`, dopo
`wlan-ap-wlc`. Il manuale passa da **29 capitoli / 96 argomenti / 77 laboratori guidati** a
**29 / 97 / 77**. Il task CONTENT-10 resta ricorrente: questo incremento è completato.

## Lacuna verificata e intervento

Il manuale insegnava già CAPWAP, sicurezza WLAN e creazione di una WLAN dalla GUI con i campi
`General > Interface`, tipici del flusso classico AireOS, ma non distingueva esplicitamente quel
modello dal modello a profili e tag di Catalyst 9800 IOS XE. La nuova lezione rende osservabile
la configurazione end-to-end e corregge l’ambiguità etichettando il flusso esistente come AireOS.

La lezione CCNA bilingue `wlc-gui-policy-mapping` copre:

- responsabilità di WLAN profile (SSID e sicurezza), policy profile (policy client, VLAN e switching)
  e policy tag (mapping WLAN→policy);
- assegnazione indipendente di policy, site e RF tag all’AP;
- percorso del client con central switching via CAPWAP e local switching via VLAN/trunk locale, fino
  al gateway;
- porte CAPWAP UDP 5246 (control) e 5247 (data), protezione del control channel con DTLS e precisazione
  che DTLS sul data channel dipende da configurazione/supporto;
- hardening del piano di gestione, AAA, HTTPS e restrizione delle sorgenti di management;
- controlli diagnostici dal join dell’AP alla reachability del gateway, più errori tipici d’esame e
  di troubleshooting.

È stato aggiunto il diagramma accessibile bilingue `wlc-policy-mapping`; `manualRouteIndex.ts` e il
test di parità riflettono il nuovo topic ID. Non è stato inventato un laboratorio: le viste esistenti
non simulano la configurazione/tagging di un WLC Catalyst 9800.

## Fonti tecniche

- [Cisco Catalyst 9800 IOS XE 17.18 — configuration model](https://www.cisco.com/c/en/us/td/docs/wireless/controller/9800/17-18/config-guide/b_wl_17_18_cg/m_config_model.html)
- [RFC 5415 — CAPWAP Protocol Specification](https://www.rfc-editor.org/rfc/rfc5415.html)

## Verifiche

- Parità/struttura bilingue, integrità manuale, route index e diagrammi: **81 test mirati superati**;
  il gate completo conferma **792 test su 87 file**.
- `npm run verify`: **superato**, coverage 95,56% statement, 92,23% branch, 99,66% function,
  97,69% line; formattazione, typecheck, lint, gate contenuti/accessibilità, build e budget passati.
- `npm run verify:technical-content`: **superato**; fonti HTTPS approvate, revisione in vigore fino
  all’8 aprile 2027.
- `npm run verify:offensive-content`: **superato**; nessun comando offensivo o target reale introdotto.
- `npm run audit:full`: **zero vulnerabilità**.
- `npm run audit:signatures:full`: **330/330 pacchetti firmati verificati; 123 attestazioni**.
- Smoke locale Vite: **HTTP 200**, shell HTML restituito.
- Budget prestazionale: entry **83.819 B gzip** su 125.000 B; route Ports **47.966 B gzip** su
  55.000 B; 36 route lazy verificate. Il nuovo indice aggiunge un solo ID al route index.
- E2E locale non eseguito: Chromium non è installato nell’ambiente. Il workflow E2E remoto su `main`
  deve confermare l’incremento dopo la pubblicazione.

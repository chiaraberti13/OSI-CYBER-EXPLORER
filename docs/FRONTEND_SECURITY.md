# Frontend Security Guardrails

OSI-CYBER-EXPLORER è una SPA statica e client-side. Il codice runtime non effettua chiamate API, telemetria o connessioni di rete programmatiche; gli asset ammessi sono governati dalla CSP e le simulazioni restano locali e non esecutive.

## Policy applicata

ESLint blocca nel codice TypeScript/React di produzione:

- rendering HTML non sicuro tramite `dangerouslySetInnerHTML`, `srcDoc`, `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `setHTMLUnsafe`, `createContextualFragment` e `document.write`;
- esecuzione dinamica tramite `eval`, costruttore `Function`, timer con stringhe e URL `javascript:`;
- accesso di rete non autorizzato tramite `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource` e `sendBeacon`;
- persistenza non approvata tramite `sessionStorage`, `indexedDB` e cookie gestiti dal client.

`localStorage` è consentito esclusivamente in `src/store.ts`, dove SEC-08 applica versione, migrazione, validazione in rehydration e una `partialize` allowlist limitata a `language`, `audioEnabled`, `simSpeed` e `hasSeenGuide`.

## Test e CI

`src/securityPolicy.test.ts` usa ESLint programmaticamente contro esempi ostili e controlla anche il confine positivo dello store. Le fixture di test possono usare storage isolato in jsdom e stringhe volutamente pericolose; i sink runtime restano vietati anche nei file di test.

`npm run lint` e `npm test` sono eseguiti dalla CI su ogni pull request e push verso `main`.

## Processo per le eccezioni

Non aggiungere disabilitazioni inline. Una nuova capacità di rete, persistenza o rendering HTML deve essere introdotta con:

1. motivazione e superficie dati documentate;
2. wrapper centralizzato con validazione e destinazioni allowlist;
3. aggiornamento ristretto della configurazione ESLint;
4. test positivi, negativi e di regressione;
5. aggiornamento di questa policy e del threat model quando disponibile.

# I18N-10 — Correzione padding oracle nei feedback di scenario

16 ottobre 2026. Baseline `main`:
`736dd26ac0d9ecbdf63fd83d428b79563818f6e7`. Checkout iniziale pulito, remoto
allineato, nessun lavoro concorrente nuovo. Avviata l'applicazione (build) ed
eseguita l'intera pipeline `npm run verify` più la suite E2E in baseline: tutto
verde. L'unico punto aperto è il task ricorrente I18N-10.

## Analisi, priorità e intervento

Dopo aver portato cataloghi, glossario, manuale e modello OSI sotto controlli di
parità strutturata, questa ricognizione I18N-10 è passata a una **revisione di
contenuto** (accuratezza e naturalezza), non a un ulteriore guard. Letto per
intero `src/content/scenarioFeedback.ts`: i banner attacco/difesa del laboratorio
OSI (26 scenari × 2 messaggi × 2 lingue). Sono volutamente in stile "terminale" e
paralleli nel significato, non traduzioni letterali — scelta corretta.

| Priorità         | Osservazione verificata                                                                                                                                                                    | Intervento                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| P1, accuratezza  | `l6-oracle`, lato inglese: «The attacker **reconstructed ciphertexts**…». Un attacco _padding oracle_ recupera il **plaintext** (decifra byte per byte), non ricostruisce il ciphertext    | Corretto l'inglese per allinearlo all'italiano (già corretto) e alla realtà tecnica                                 |
| P1, parità IT/EN | L'italiano diceva correttamente «decifrato byte-per-byte sfruttando le risposte differenziate di errore sul padding CBC»; l'inglese insegnava un concetto più debole/errato                | Ripristinata la parità di significato tra le due lingue                                                             |
| —, resto dataset | Gli altri 25 scenari: significati paralleli e tecnicamente corretti in entrambe le lingue (jamming, ARP poisoning/DAI, MAC flooding/port security, SYN flood/SYN cookies, SQLi, XSS, ecc.) | Nessuna altra correzione necessaria; evitate modifiche cosmetiche sui banner tematici deliberatamente non letterali |

Testo prima → dopo (solo lato EN del feedback `l6-oracle.attack`):

- **Prima:** `The attacker reconstructed ciphertexts by analyzing temporal and descriptive CBC padding-exception delays.`
- **Dopo:** `The attacker decrypted the ciphertext byte by byte by exploiting the server's distinguishable error responses to CBC padding.`

L'italiano resta invariato (era già corretto). La modifica è circoscritta a una
stringa di contenuto; nessuna modifica a logica, componenti, dipendenze o
architettura. La stringa è renderizzata dinamicamente in `LayerDetails.tsx`
(`SCENARIO_FEEDBACK[id].attack[language]`) e nessun test ne asseriva il valore
esatto.

## Fonte primaria

- [NIST SP 800-38A](https://csrc.nist.gov/pubs/sp/800/38/a/final) — modalità
  operative a blocchi (CBC); il padding oracle recupera il plaintext sfruttando la
  distinguibilità delle risposte di padding, ed è la ragione per cui si adottano
  modalità AEAD (già citate nel feedback di difesa `l6-oracle`).

## Verifiche e limiti

Baseline `npm run verify` superata prima dell'intervento. Sulle modifiche:

- `npm run verify`: superato — **86 file / 781 test Vitest**, coverage richiesto,
  `format:check`, `typecheck`, `lint`, build e tutti i gate (lockfile, release,
  deployment-security, repository-posture, documentation-targets,
  offensive-content, technical-content, design-system, accessibility-release,
  performance).
- Guard bilingue (`src/content/bilingual.test.ts`): **18 test** verdi; la coppia
  IT/EN corretta rispetta parità di lunghezza e di token tecnici (CBC presente in
  entrambe).
- `npm run test:e2e`: **74/74 superati**, Chromium; il laboratorio attacchi (dove
  il banner è renderizzato) resta accessibile (Axe WCAG 2.2 AA).
- Nessuna dipendenza cambiata.

Primo avvio con Node 24.22.0 (nvm) perché l'ambiente aveva 22.22.0, fuori dal
range `engines`; nessuna dipendenza del progetto modificata. Non eseguiti
Firefox/WebKit, screen reader reali o controlli del deployment pubblico. Gli
esiti locali non equivalgono all'esito della matrice CI e degli scanner remoti.

I18N-10 resta ricorrente per futuri contenuti; questa correzione non implica una
revisione integrale di ogni testo storico dell'applicazione.

# Verifica e intervento CONTENT-02 (sicurezza Layer 2) — 15 ottobre 2026

Baseline: `main`, `e87d72c` (dopo ENG-30, selettori di dominio-cert). Ambiente locale: Node.js 24.22.0
(l'ambiente di default era 22.22.0, sotto il minimo `^22.22.2` di `engines`; installato Node 24 via
nvm per riprodurre la CI), npm 11.19.1, Chromium preinstallato (Playwright 1.56.1); CI sulla versione
fissata.

## Analisi (verifica 360°)

Stato Git pulito, `HEAD == origin/main == e87d72c`, nessuna modifica concorrente; baseline verde
(typecheck, 51 test manuale, 80 test manuale+contenuti). CONTENT-02 era l'unico task `[~]` in corso
(4 di 5): restava da insegnare il laboratorio `layer2security`, l'ultimo laboratorio difensivo senza
una controparte teorica nel manuale. Verificato che nessun capitolo citasse il lab `layer2security`
(`grep` → 0 occorrenze), confermando il divario. Il capitolo 14 (sicurezza CCNA) dà già i _comandi_
di hardening L2 nel contesto del dominio 5.0; il nuovo capitolo è quindi stato impostato come
complemento difensivo orientato al **modello e al perché** (confine di fiducia, binding table come
fonte di verità, protezione della topologia e contenimento), senza duplicare i comandi. Nessun
problema bloccante in analisi.

## Implementazione

- **Nuovo capitolo** `access-layer-security` (ordine 29, `track: 'extension'`, `cert: 'securityplus'`),
  «Sicurezza dell'access layer: il confine della porta», con tre argomenti:
  1. **La porta di accesso come confine di fiducia: ruolo, VLAN e Port Security** — l'access port è
     il bordo dove l'host non fidato incontra il dominio commutato; dichiarare il ruolo (access/voce,
     niente trunk negoziabile) e usare CAM table + Port Security come identità del primo hop,
     dimensionata sull'endpoint reale (telefono + PC) e non sul «rischio zero».
  2. **Integrità del first-hop: DHCP Snooping, DAI, IP Source Guard e igiene dei trunk** — la binding
     table attendibile come fonte di verità (porte fidate solo verso il server reale), DAI contro
     l'ARP poisoning/MITM e IP Source Guard contro lo spoofing, con host statici che richiedono un
     binding manuale; trunk e native VLAN in ordine contro il VLAN hopping.
  3. **Proteggere la topologia commutata: guardie STP, coerenza EtherChannel e contenimento** — BPDU
     Guard/Root Guard/Loop Guard ciascuna a difesa di un'assunzione precisa di STP, coerenza dei
     membri EtherChannel, e contenimento→causa→ripristino con stop condition (la disciplina del
     capitolo su resilienza e ripristino applicata al livello 2).
- Ogni argomento ha obiettivi osservabili, prerequisiti, teoria progressiva (3 paragrafi), esempio su
  `192.0.2.0/24`, errori comuni, riferimenti strutturati (IEEE 802.1Q, RFC 2131, IEEE 802.1D, IEEE
  802.1AX) e un laboratorio guidato su `layer2security` con consegna, passi, sfida, soluzione
  commentata e autoverifica. Filo conduttore coerente con il track: la difesa si prova, non si
  dichiara.
- **Chiusura del divario guida↔lab:** `layer2security` ora ha una controparte teorica nel manuale;
  **tutti** i laboratori difensivi sono insegnati. CONTENT-02 completato (5 di 5).
- **Conteggi:** il manuale passa a **29 capitoli / 88 argomenti / 74 laboratori guidati** (estensione
  15). Grazie a ENG-31 i conteggi di vista e test sono derivati dal dataset, quindi nessuna
  asserzione manuale è stata modificata (progresso `x/29`, 29 opzioni, optgroup «Estensione · 0/15»).
- **Documentazione:** aggiornati ROADMAP (header di stato, CONTENT-02 a `[x]`, sotto-task 5/5) ed
  entrambi i README (voce «sicurezza dell'access layer Layer 2» nell'elenco dell'estensione, parità
  IT/EN).

### Nota di correttezza (parità bilingue)

Il primo passaggio ha segnalato `bilingual` → in inglese «VLANs/802.1Q» faceva sì che la `s` minuscola
troncasse l'estrazione dell'acronimo, perdendo il token `802.1Q` presente invece in italiano.
Correzione mirata: in inglese «VLAN/802.1Q», così lo stesso token è estratto da entrambe le lingue.

## Esiti finali

| Controllo                          | Esito                                                     |
| ---------------------------------- | --------------------------------------------------------- |
| `npm run verify`                   | Superato (uscita 0)                                       |
| Prettier, ESLint, TypeScript       | Superati                                                  |
| Vitest con coverage                | Superato                                                  |
| Parità IT/EN (`bilingual`, manual) | Superata (acronimi e cifre identici tra le due lingue)    |
| `documentation-targets`            | Superato (solo target di documentazione, `192.0.2.0/24`)  |
| `verify:offensive-content`         | Superato (file sorgente invariati; manuale fuori dal set) |
| `verify:technical-content`         | Superato (ledger di revisione valido)                     |
| Build Vite + budget gzip           | Superati (initial 122.18 kB / 125; route 52.07 kB / 55)   |
| Playwright completo                | **64/64** su Chromium (Axe WCAG 2.2 AA incluso)           |
| `audit:runtime` / `audit:full`     | 0 vulnerabilità                                           |

Nota E2E: una prima esecuzione completa aveva segnalato una violazione target-size (WCAG 2.5.8) in
`manual-accessibility.spec.ts`; non riproducibile in isolamento (3/3) né alla riesecuzione completa
(64/64), quindi flake sotto esecuzione parallela, non un problema del capitolo.

CodeQL, Gitleaks, OSV, Lighthouse e la scansione dinamica del deployment sono verifiche dei workflow
GitHub, non eseguite localmente.

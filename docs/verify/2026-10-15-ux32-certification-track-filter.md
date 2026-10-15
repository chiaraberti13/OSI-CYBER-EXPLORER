# Verifica e intervento UX-32 (filtro per percorso) — 15 ottobre 2026

Baseline: `main`, `723742a` (dopo VIS-10). Ambiente locale: Node.js 24.22.0 via nvm (il default
22.22.0 è sotto il minimo `^22.22.2` di `engines`), npm 11.19.1, Chromium preinstallato (Playwright
1.56.1); CI sulla versione fissata.

## Analisi (verifica 360°)

Stato Git pulito, `HEAD == origin/main == 723742a`, nessuna modifica concorrente; baseline verde.
UX-32 era il primo task `[ ]` di priorità P2 (e il successivo nell'ordine consigliato dopo VIS-10).
La base era già pronta: il selettore puro `chaptersByDomain(track?)` (ENG-30) sa restringere l'indice
a un percorso, e VIS-10 ha dato a ogni riga il suo segno di percorso. Mancava il controllo di filtro.
Nessun problema bloccante.

## Implementazione

- **`TrackFilter`** (`StudyManualView.tsx`): un gruppo di pulsanti-toggle (`role="group"`, ciascuno
  con `aria-pressed`) — Tutti / CCNA / eJPT / Estensione — ognuno con l'icona di percorso (in
  `currentColor`, leggibile sia selezionato sia a riposo) e il nome come testo. Riporta la scelta
  verso l'alto; **non naviga mai**.
- **Stato di vista, non navigazione:** `trackFilter` è `useState` locale; l'indice (`chapterGroups`)
  è derivato con `chaptersByDomain(filtro)`. Routing, deep-link, Back/Forward e il capitolo aperto
  restano invariati; il flusso precedente/successivo e il progresso complessivo restano sull'intero
  insieme di capitoli.
- **Posizionamento (preserva i contratti esistenti):**
  - desktop: il filtro sta **sopra** la navigazione capitoli, in un contenitore sticky che fa
    scorrere filtro + albero insieme; la `nav aria-label="Capitoli del manuale"` resta un elenco di
    soli capitoli (i test che indicizzano i pulsanti della nav non cambiano);
  - mobile: il filtro sta **fuori** dalla toolbar sticky, in flusso normale sopra di essa, così la
    toolbar compatta mantiene il suo budget d'altezza (≤ 112 px) e i conteggi/ordine dei suoi
    controlli restano invariati. Le due istanze condividono lo stesso stato.
- **Select mobile robusta:** quando il filtro esclude il capitolo aperto, una `<option hidden>` per
  quel capitolo mantiene valido il `<select>` controllato senza alterare routing o deep-link.
- **i18n:** aggiunte `trackFilterLabel` e `trackFilterAll` (IT/EN), set di chiavi bilanciato.

Nessun cambio ai contenuti didattici o al modello dati; solo UI, i18n di interfaccia e stato di vista.

## Verifiche aggiunte / aggiornate

- **Unit** (`StudyManualView.test.tsx`): il filtro restringe l'albero al percorso scelto (conteggi
  `data-track`), aggiorna `aria-pressed`, e **non** cambia `activeChapterId` (il capitolo aperto resta
  renderizzato); «CCNA» rimuove il bucket estensione mantenendo i gruppi di dominio CCNA. Aggiornati
  due test preesistenti perché contino i pulsanti dell'**indice argomenti** (`mobile-topic-index`)
  invece di tutti i pulsanti della toolbar.
- **E2E** (`manual-track-filter.spec.ts`): restringimento dell'albero e routing invariato (URL
  `#/manual` dopo il filtro), deep-link preservato (capitolo CCNA aperto resta visibile anche
  filtrando su eJPT), scansione Axe WCAG 2.2 AA sullo stato filtrato.

## Esiti finali

| Controllo                                               | Esito                                                   |
| ------------------------------------------------------- | ------------------------------------------------------- |
| `npm run verify`                                        | Superato (uscita 0)                                     |
| Prettier, ESLint, TypeScript                            | Superati                                                |
| Vitest con coverage                                     | Superato (manual view: +1 test UX-32; 2 test adeguati)  |
| Parità IT/EN (`catalog`, `bilingual`)                   | Superata (nuove chiavi presenti e bilanciate)           |
| `verify:design-system`                                  | Superato                                                |
| `documentation-targets` / offensive / technical-content | Superati                                                |
| Build Vite + budget gzip                                | Superati (initial 122.26 kB / 125; route 52.07 kB / 55) |
| Playwright completo                                     | **69/69** su Chromium (Axe WCAG 2.2 AA incluso)         |
| `audit:runtime` / `audit:full`                          | 0 vulnerabilità                                         |

Nota QA: una prima esecuzione completa aveva segnalato un rosso in `manual-typography` (ritmo di
lettura su mobile); non riproducibile in isolamento (2/2) né alla riesecuzione completa (69/69),
quindi flake sotto esecuzione parallela, non un effetto del filtro.

CodeQL, Gitleaks, OSV, Lighthouse e la scansione dinamica del deployment sono verifiche dei workflow
GitHub, non eseguite localmente.

# Performance budgets / Budget prestazionali

## English

Performance is treated as a versioned constraint, not as a reason for speculative refactoring. The baseline was measured on 10 October 2026 from commit `1060a22` with Node 24, Vite 8.3.1, gzip level 9, and the production build:

| Scope | Baseline | Blocking budget | Headroom |
|---|---:|---:|---:|
| Initial JavaScript entry | 116,060 B gzip | 125,000 B gzip | 7.7% |
| Largest lazy route (`PortsExplorer`) | 51,325 B gzip | 55,000 B gzip | 7.2% |
| Browser script transfer, OSI/Ports | measured by Lighthouse CI | 600 KiB | route-wide |
| Browser total transfer, OSI/Ports | measured by Lighthouse CI | 750 KiB | route-wide |
| Lighthouse Performance | OSI 0.78 · Ports 0.98 | ≥ 0.75 | no regression |
| Lighthouse CLS | OSI 0.547 · Ports 0.082 | ≤ 0.60 | no regression |

`npm run build` emits `dist/.vite/manifest.json`. `npm run verify:performance` then applies three independent checks:

1. Size Limit checks the hashed initial and Ports files against the two gzip limits.
2. `scripts/performance-budget.mjs` resolves the entry and **all 33 lazy route entries** from the manifest, measures them with one deterministic gzip implementation, and fails if any route exceeds 55,000 bytes.
3. The dedicated read-only workflow runs Lighthouse CI three times on `#/osi` and `#/ports`, enforcing the measured baseline floors of Performance ≥ 0.75 and CLS ≤ 0.60 plus network resource budgets. The route query marker keeps results separate even though the app routes by hash. LCP ≤ 2.5 s and TTI ≤ 3 s are warnings because shared-runner timing is noisier; bundle and transfer growth remain blocking. These are regression budgets, not claims that the current OSI CLS is good: the WCAG-oriented target remains CLS ≤ 0.10 and requires a profiled follow-up rather than weakening this record.

Run `npm run analyze:bundle` to create the ignored `dist/bundle-report.html` treemap with raw, gzip, and Brotli attribution. Before changing chunking, memoisation, indexing, or virtualisation, retain the report or CI artifact, identify the modules or interaction responsible, and record the same measurement after the change. A budget increase requires an explicit update to this document, `performance-budgets.json`, and the roadmap decision log; a failing limit must not be bypassed by deleting coverage or excluding a route.

Lighthouse CI stays outside the application lockfile: its current CLI dependency tree contains unresolved high-severity development advisories. The workflow uses the action pinned to a full commit SHA, with read-only permissions and no public report upload. Deterministic local gates therefore remain auditable with `npm audit` at zero findings.

## Italiano

La performance è un vincolo versionato, non un pretesto per refactoring ipotetici. La baseline è stata misurata il 10 ottobre 2026 dal commit `1060a22` con Node 24, Vite 8.3.1, gzip livello 9 e build di produzione:

| Ambito | Baseline | Budget bloccante | Margine |
|---|---:|---:|---:|
| Entry JavaScript iniziale | 116.060 B gzip | 125.000 B gzip | 7,7% |
| Route lazy più grande (`PortsExplorer`) | 51.325 B gzip | 55.000 B gzip | 7,2% |
| Trasferimento script browser, OSI/Porte | misurato da Lighthouse CI | 600 KiB | intera route |
| Trasferimento totale browser, OSI/Porte | misurato da Lighthouse CI | 750 KiB | intera route |
| Lighthouse Performance | OSI 0,78 · Porte 0,98 | ≥ 0,75 | nessuna regressione |
| Lighthouse CLS | OSI 0,547 · Porte 0,082 | ≤ 0,60 | nessuna regressione |

`npm run build` produce `dist/.vite/manifest.json`. `npm run verify:performance` applica quindi tre controlli indipendenti:

1. Size Limit verifica i file con hash dell’entry iniziale e di Porte rispetto ai due limiti gzip.
2. `scripts/performance-budget.mjs` ricava dal manifest l’entry e **tutte le 33 route lazy**, le misura con una sola implementazione gzip deterministica e fallisce se una route supera 55.000 byte.
3. Il workflow dedicato read-only esegue Lighthouse CI tre volte su `#/osi` e `#/ports`, imponendo le soglie della baseline misurata Performance ≥ 0,75 e CLS ≤ 0,60, oltre ai budget delle risorse di rete. Un marcatore nella query mantiene separate le route anche se l’app usa l’hash. LCP ≤ 2,5 s e TTI ≤ 3 s sono warning perché i tempi dei runner condivisi sono più variabili; la crescita di bundle e trasferimenti resta bloccante. Questi sono budget anti-regressione, non l’affermazione che il CLS OSI attuale sia buono: l’obiettivo orientato WCAG resta CLS ≤ 0,10 e richiede un intervento successivo basato sul profiling, non l’indebolimento di questo registro.

`npm run analyze:bundle` crea il treemap ignorato `dist/bundle-report.html`, con attribuzione raw, gzip e Brotli. Prima di cambiare chunking, memoizzazione, indicizzazione o virtualizzazione, occorre conservare il report o l’artifact CI, identificare moduli o interazione responsabili e registrare la stessa misura dopo la modifica. Alzare un budget richiede una decisione esplicita in questo documento, in `performance-budgets.json` e nel registro della roadmap; un limite fallito non va aggirato eliminando copertura o escludendo una route.

Lighthouse CI resta fuori dal lockfile dell’app: l’albero dipendenze attuale della CLI contiene advisory di sviluppo High non risolti. Il workflow usa l’action fissata a SHA completo, permessi read-only e nessun caricamento pubblico dei report. I gate locali deterministici restano così verificabili con `npm audit` a zero finding.

# Accessibility release checklist · Checklist accessibilità di release

This policy turns UX-17 into measurable release gates. It defines the minimum
evidence required for every tagged release; passing an automated scanner does not
by itself claim complete WCAG conformance.

---

## English

### Measurable targets

| Target                   | Required result                                                                                                   | Automated evidence                                        |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| WCAG 2.2 AA              | No machine-detectable A/AA violations on the representative IT/EN routes and open Guide                           | Axe in `e2e/accessibility.spec.ts`                        |
| Lighthouse Accessibility | Score **≥ 0.95** on both audited routes, median of three runs                                                     | `lighthouserc.json` on `#/osi` and `#/ports`              |
| Keyboard operation       | Skip link, language, search, primary navigation, Guide and representative lab flow work without a pointer         | Playwright application-shell, accessibility and lab specs |
| Focus behaviour          | Intentional Guide focus loop; `Escape` closes it and focus returns to its trigger; no tested flow becomes trapped | Playwright accessibility spec                             |
| Touch targets            | Visible native controls and primary actions are at least **44 × 44 CSS px**                                       | Playwright at a 320 px viewport                           |
| Reflow                   | No horizontal page overflow at **320 CSS px**, equivalent to a 1280 px viewport at **400%** zoom                  | Playwright reflow assertion                               |

### Release execution and evidence

The tagged-release workflow is the canonical checklist execution. Before it can
publish, it runs the complete repository verification, the full Chromium E2E
suite, and Lighthouse CI with the blocking Accessibility threshold. Its
Playwright HTML report is retained for **90 days**; Lighthouse artifacts are
uploaded privately by the workflow. A failed check blocks the release.

For interaction changes, the maintainer must also review keyboard focus order,
screen-reader announcements, reading order and zoom visually before creating the
tag, recording any exception in the changelog. These human checks cover aspects
that Axe and Lighthouse cannot determine reliably.

Run the deterministic policy guard locally with:

```bash
npm run verify:accessibility-release
```

Run the browser evidence locally with:

```bash
npm run test:e2e
```

---

## Italiano

### Obiettivi misurabili

| Obiettivo                | Risultato richiesto                                                                                                         | Evidenza automatica                                  |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| WCAG 2.2 AA              | Nessuna violazione A/AA rilevabile automaticamente sulle route IT/EN rappresentative e sulla Guida aperta                   | Axe in `e2e/accessibility.spec.ts`                   |
| Lighthouse Accessibility | Punteggio **≥ 0,95** su entrambe le route, mediana di tre esecuzioni                                                        | `lighthouserc.json` su `#/osi` e `#/ports`           |
| Uso da tastiera          | Skip link, lingua, ricerca, navigazione primaria, Guida e un flusso laboratorio funzionano senza puntatore                  | Spec Playwright di shell, accessibilità e laboratori |
| Gestione del focus       | Ciclo intenzionale nella Guida; `Escape` la chiude e il focus torna al trigger; nessun flusso verificato resta intrappolato | Spec Playwright di accessibilità                     |
| Target touch             | Controlli nativi visibili e azioni principali di almeno **44 × 44 CSS px**                                                  | Playwright con viewport da 320 px                    |
| Reflow                   | Nessun overflow orizzontale della pagina a **320 CSS px**, equivalenti a una viewport da 1280 px con zoom al **400%**       | Asserzione Playwright sul reflow                     |

### Esecuzione ed evidenze di release

Il workflow delle release taggate è l’esecuzione canonica della checklist. Prima
della pubblicazione esegue la verifica completa del repository, tutta la suite
E2E Chromium e Lighthouse CI con soglia Accessibility bloccante. Il report HTML
di Playwright viene conservato per **90 giorni**; gli artifact Lighthouse sono
caricati privatamente dal workflow. Qualsiasi controllo fallito blocca la release.

Quando cambiano le interazioni, prima di creare il tag il maintainer deve inoltre
revisionare ordine del focus da tastiera, annunci dello screen reader, ordine di
lettura e zoom, registrando nel changelog eventuali eccezioni. Questi controlli
umani coprono aspetti che Axe e Lighthouse non possono determinare in modo
affidabile.

Per verificare localmente la policy deterministica:

```bash
npm run verify:accessibility-release
```

Per produrre localmente le evidenze browser:

```bash
npm run test:e2e
```

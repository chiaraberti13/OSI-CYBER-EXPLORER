# Verifica e intervento IA-12 (sidebar del manuale ad accordion) — 15 ottobre 2026

Baseline: `main`, `93f6d4a` (dopo IA-11). Ambiente locale: Node.js 24.22.0 via nvm (il default 22.22.0
è sotto il minimo `^22.22.2` di `engines`), Chromium preinstallato (Playwright 1.56.1); CI sulla
versione fissata.

## Richiesta utente

«Il menu laterale non si può migliorare? Organizzare e visualizzare meglio? Trova una soluzione
funzionale e bella da vedere anche per il mobile… stai attento alla UX.» Lo screenshot mostrava
«Percorso CCNA 0/26» seguito da una **lista piatta di 26 capitoli numerati**, lunga e difficile da
scansionare.

## Implementazione

- **Accordion a sezioni di dominio.** La lista piatta della rotta CCNA diventa un indice a **sezioni di
  dominio CCNA** derivate da `chaptersByDomain('ccna')`: 1.0 Fondamenti di rete, 2.0 Accesso alla rete,
  3.0 Connettività IP, 4.0 Servizi IP, 5.0 Fondamenti di sicurezza, 6.0 Automazione e programmabilità,
  più il bucket **«Approfondimenti e Security+»** (12 capitoli di estensione). Ogni sezione è una
  _disclosure_: un `button` con `aria-expanded`/`aria-controls` che apre/chiude il pannello dei
  capitoli. Chevron che ruota, chip del numero di dominio (es. «3.0»), titolo, **contatore di progresso
  per sezione** e una **barra sottile** di avanzamento (decorativa; il conteggio accessibile vive
  nell'`aria-label` del toggle).
- **Default corto.** All'apertura è espansa **solo la sezione del capitolo attivo**; le altre partono
  chiuse, così l'indice è breve e scansionabile invece di 26 righe. Navigando verso un capitolo in una
  sezione chiusa (selettore mobile, precedente/successivo, deep-link) la sezione si apre da sola. L'auto
  espansione usa l'**adeguamento dello stato durante il render** (pattern React «store information from
  previous renders»), non un `useEffect` con `setState` (rispetta la regola ESLint
  `react-hooks/set-state-in-effect`); i toggle manuali dell'utente sono preservati.
- **eJPT flat.** La rotta eJPT ha una sola sezione (3 capitoli) e resta una **lista piatta** sotto la
  sua intestazione di percorso, senza accordion.
- **Invarianti preservate.** Restano i **due `role="group"`** di percorso (Percorso CCNA, eJPT) con i
  marchi `data-track` (VIS-10); le sezioni di dominio sono disclosure, non landmark, quindi
  `getAllByRole('group')` resta 2. I capitoli espongono `data-testid="manual-chapter-link"` per
  distinguerli dai toggle di sezione. Su mobile resta il **selettore nativo compatto** (budget altezza
  ≤112px) grouppato per percorso.
- **Contrasto AA (tema scuro incluso).** Il chip del numero di dominio usa `bg-indigo-50`/`text-indigo-700`
  (coppia già rimappata e verificata nel tema scuro del manuale); la barra di progresso usa una traccia
  neutra semitrasparente (`bg-slate-400/20`) indipendente dal tema; il contatore «completato» usa
  `text-emerald-700`.

## Verifiche aggiornate

- **Unit:** `StudyManualView.test` — nuovi test «organises the CCNA route into collapsible domain
  sections» (sezione attiva espansa, sezione chiusa nascosta, toggle senza navigazione, due soli
  `role="group"`) e «auto-expands the section of a chapter opened from elsewhere».
- **E2E:** `manual-guided-exercise` — prima di iterare i capitoli, il test ora **espande tutte le
  sezioni** e itera i soli `[data-testid="manual-chapter-link"]` (non i toggle). Gli altri E2E restano
  validi: la sezione attiva (1.0) è espansa di default, quindi i capitoli OSI/Ethernet su cui agiscono
  i test sono visibili; eJPT è flat, quindi i suoi capitoli sono sempre elencati.

## Esiti finali

| Controllo                                   | Esito                                                   |
| ------------------------------------------- | ------------------------------------------------------- |
| `npm run verify`                            | Superato (uscita 0)                                     |
| Prettier, ESLint, TypeScript                | Superati                                                |
| Vitest con coverage                         | Superato                                                |
| Parità IT/EN (`catalog`, `bilingual`)       | Superata                                                |
| `verify:design-system` / performance budget | Superati (initial 122.44 kB / 125; route 52.07 kB / 55) |
| Playwright completo                         | **64/64** su Chromium (Axe WCAG 2.2 AA, light + dark)   |

L'indice laterale del manuale è ora organizzato per domini CCNA, corto per impostazione predefinita,
collassabile, con progresso per sezione e accessibile (tastiera, screen reader, AA in chiaro e scuro),
rispondendo alla richiesta di una navigazione «organizzata e visualizzata meglio, funzionale e bella,
anche su mobile».

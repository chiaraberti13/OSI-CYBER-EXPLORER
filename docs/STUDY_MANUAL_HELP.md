# Study manual help · Istruzioni del manuale

Updated / aggiornato: 2026-10-20 (IA-10–12, VIS-12, EDU-PROG).

## English

The **Manual** is the default entry point. The top menu contains Manual and one
**Labs** dropdown, with area headings and a quick search (`Ctrl`/`⌘` + `K`).
Application help is available from the global **Guide** button in the header;
there is no separate inline manual-help panel (removed in IA-10).

The chapter index has two study routes: **CCNA** and **eJPT**. On desktop, CCNA
chapters are organised into collapsible domain sections with progress counters.
The active chapter's section opens automatically. The route filter only narrows
the index: it does not change the open chapter or its deep link.

On mobile, a compact sticky toolbar provides a native chapter selector grouped by
study route, progress and a native per-topic selector. Previous/next
actions remain at the chapter end. Chapter changes focus the chapter heading.

Attempt each guided lab before revealing its solution; use its self-checks and
mark the chapter complete when ready. Each topic additionally carries a formative
**“studied” toggle** (`aria-pressed`): it records the learner's own progress through
the chapter — it is not a score, an answer key, or an exam simulation — and feeds a
per-chapter topics-studied tally. Once any progress exists, the chapter index shows a
**resume-studying summary** that aggregates topics studied and links to the first
chapter not yet completed; it is hidden for a first-time visitor. Each chapter card
also shows an in-progress topic tally for a chapter the learner has started but not
completed. Total progress,
progress per route and per-topic progress are stored locally and cleared together by
the single **reset** control. If browser storage is blocked, progress remains usable
in memory for the current session. No progress is sent to a server. The legacy
`hasDismissedManualHelp` preference remains compatible with saved data but no longer
controls a visible panel.

Selected topics include bilingual concept diagrams with visible text alternatives:
internal/perimeter traffic, email delivery and penetration-test phases. They are
schematics, not live networks, and introduce no additional controls or tab stops.

Regression coverage: `e2e/app-shell.spec.ts`, `e2e/manual-mobile-sticky.spec.ts`,
`e2e/manual-track-filter.spec.ts`, `e2e/manual-concept-diagrams.spec.ts`,
`e2e/manual-route-progress.spec.ts`, `e2e/manual-topic-progress.spec.ts`,
`e2e/manual-resume-summary.spec.ts` and the manual component tests. Automated Axe
checks do not replace a screen-reader audit.

## Italiano

Il **Manuale** è la vista iniziale. Il menu contiene Manuale e un unico dropdown
**Laboratori**, con sottotitoli di area e ricerca rapida (`Ctrl`/`⌘` + `K`). Le
istruzioni dell’applicazione si aprono dalla **Guida** globale in testata; non
esiste più il pannello di istruzioni inline del manuale (rimosso con IA-10).

L’indice ha due percorsi: **CCNA** ed **eJPT**. Su desktop, i capitoli CCNA sono
organizzati in sezioni di dominio collassabili con contatori di progresso. La
sezione del capitolo attivo si apre automaticamente. Il filtro per percorso
restringe soltanto l’indice: non cambia il capitolo aperto o il suo deep-link.

Su mobile, una toolbar sticky compatta offre il selettore nativo dei capitoli
raggruppati per percorso, il progresso e un selettore nativo degli argomenti.
Precedente/Successivo restano a fine capitolo. Il cambio capitolo porta il focus
sul titolo.

Prova ogni laboratorio guidato prima di rivelarne la soluzione; usa i criteri di
autoverifica e segna il capitolo come completato quando sei pronta/o. Ogni argomento
ha inoltre un **interruttore “studiato”** formativo (`aria-pressed`): registra il
progresso personale dello studente nel capitolo — non è un punteggio, una soluzione
né la simulazione di un esame — e alimenta un conteggio «argomenti studiati» per
capitolo. Quando esiste del progresso, l’indice dei capitoli mostra un **riepilogo
«riprendi lo studio»** che somma gli argomenti studiati e porta al primo capitolo non
ancora completato; è nascosto alla prima visita. Anche ogni card di capitolo mostra il
conteggio degli argomenti studiati per un capitolo iniziato ma non completato. Il
progresso totale, per percorso e
per argomento viene salvato localmente e azzerato insieme dall’unico controllo di
**azzeramento**. Se lo storage è bloccato,
resta utilizzabile in memoria per la sessione corrente. Nessun progresso viene inviato
a un server. La preferenza storica `hasDismissedManualHelp` resta compatibile con
i dati salvati, ma non controlla più un pannello visibile.

Alcuni argomenti includono diagrammi concettuali bilingui con alternative testuali
visibili: traffico interno/perimetrale, consegna email e fasi del penetration test.
Sono schemi, non reti operative; non aggiungono controlli o tappe di tabulazione.

Copertura delle regressioni: `e2e/app-shell.spec.ts`, `e2e/manual-mobile-sticky.spec.ts`,
`e2e/manual-track-filter.spec.ts`, `e2e/manual-concept-diagrams.spec.ts`,
`e2e/manual-route-progress.spec.ts`, `e2e/manual-topic-progress.spec.ts`,
`e2e/manual-resume-summary.spec.ts` e test del componente manuale. I controlli Axe
non sostituiscono un audit con screen reader.

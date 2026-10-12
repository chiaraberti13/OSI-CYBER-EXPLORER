# Study manual help · Istruzioni del manuale (UX-22)

## English

The first manual visit shows an inline **How to use this guide** panel. Its three
steps explain the CCNA chapter index and topic navigation, how to attempt a guided
lab before checking its solution, and previous/next chapter navigation with local
completion tracking. The panel does not cover the theory or block other controls.

**Close the instructions**, or the expanded help button, dismisses the panel.
Focus returns to the help button, which can reopen it at any time. The disclosure
exposes `aria-expanded` and `aria-controls`; its named region follows the manual
heading in reading order. It adds no animation. Both controls are at least 44 px
high, and the panel stacks its three steps on small screens.

Dismissal is stored as the boolean `hasDismissedManualHelp` in the existing
`osi-lab-preferences` allowlist, schema version **3**. Versions 0–2 migrate through
the same sanitizer, preserving valid preferences and chapter progress. Missing or
malformed flags default to `false`; unknown schema versions restore defaults.
Reopening help does not clear the dismissal preference, and resetting chapter
progress does not reset help. Clearing site storage restores first-visit help.

If Web Storage is unavailable, help and progress remain usable in memory while
the app is open, including navigation to a lab and back. Reloading in that mode
cannot preserve the preference. Nothing is sent to a server.

Regression evidence covers preference validation and migrations, actual store
rehydration, the disclosure and focus return, live IT/EN switching, lab round trips,
and blocked storage. `e2e/manual-help.spec.ts` also scans both languages with Axe
at 320 px and checks page overflow and control dimensions. Automated accessibility
checks cover detectable issues; the wider manual refinements remain in UX-23–UX-29.

## Italiano

Al primo accesso al manuale compare il pannello inline **Come usare questa guida**.
I tre passi spiegano indice dei capitoli CCNA e navigazione agli argomenti, come
provare un laboratorio guidato prima di consultare la soluzione, e navigazione tra
capitoli con tracciamento locale del completamento. Il pannello lascia disponibili
la teoria e gli altri controlli.

**Chiudi le istruzioni**, oppure il pulsante delle istruzioni già espanso, nasconde
il pannello. Il focus torna al pulsante, che permette di riaprirlo in ogni momento.
Il controllo espone `aria-expanded` e `aria-controls`; la regione con nome accessibile
segue il titolo del manuale nell'ordine di lettura. Non introduce animazioni.
Entrambi i controlli sono alti almeno 44 px e i tre passi si impilano sugli schermi
piccoli.

La chiusura viene salvata nel booleano `hasDismissedManualHelp` dell'allowlist
esistente `osi-lab-preferences`, schema **3**. Le versioni 0–2 migrano attraverso lo
stesso sanitizer, conservando preferenze e progresso validi. Flag assenti o non
validi assumono `false`; versioni sconosciute ripristinano i default. Riaprire le
istruzioni non cancella la preferenza e azzerare il progresso non riattiva il
pannello. Cancellare lo storage del sito ripristina le istruzioni al primo accesso.

Se Web Storage non è disponibile, istruzioni e progresso restano utilizzabili in
memoria mentre l'app è aperta, anche passando a un laboratorio e tornando al
manuale. In questa modalità un reload non può conservare la preferenza. Nessun
dato viene inviato a un server.

Le regressioni coprono validazione e migrazioni, rehydration reale dello store,
apertura/chiusura e ritorno del focus, cambio lingua IT/EN, andata/ritorno dai lab e
storage bloccato. `e2e/manual-help.spec.ts` esegue anche Axe nelle due lingue a
320 px e misura overflow e dimensioni dei controlli. I controlli automatici coprono
i problemi rilevabili; le ulteriori rifiniture del manuale restano in UX-23–UX-29.

# Lab URLs / URL dei laboratori

## Italiano

Ogni vista registrata ha un URL stabile nella forma `#/<id>`. Gli ID sono quelli di
`src/content/viewRegistry.ts`: la tabella delle route viene generata dalla registry,
senza una seconda lista da aggiornare quando si aggiunge un laboratorio.

| Destinazione | URL di esempio |
|---|---|
| Panoramica OSI | `https://osi-cyber-explorer.vercel.app/#/osi` |
| Fondamenti IPv4/IPv6 e VLSM | `https://osi-cyber-explorer.vercel.app/#/fundamentals` |
| Connettività IP e OSPF | `https://osi-cyber-explorer.vercel.app/#/routing` |
| Glossario | `https://osi-cyber-explorer.vercel.app/#/glossary` |

Copia l'indirizzo dalla barra del browser oppure il link di un laboratorio nel menu,
nella ricerca o nella mappa CCNA. Ctrl/Cmd+clic, clic centrale e apertura in una nuova
scheda mantengono il comportamento nativo dei link. Invio su un link focalizzato e
Invio nella ricerca aprono il laboratorio nella stessa scheda.

Il link diretto viene risolto prima del primo rendering. Un refresh riapre la stessa
vista; il titolo della scheda usa il nome del laboratorio nella lingua selezionata.
Indietro/Avanti ripristinano la vista della voce di cronologia senza aggiungerne altre.
Riselezionare la vista corrente o cambiare lingua/preferenze non aggiunge voci.
Anche i collegamenti interni e il ritorno sicuro del pannello di errore aggiornano l'URL.

URL senza fragment, sconosciuti o malformati vengono sostituiti con `#/osi`, aprendo
la panoramica e conservando percorso base e query string. Le route sono confrontate
esattamente: maiuscole, segmenti extra, query nel fragment e ID percent-encoded non
sono alias accettati. L'input URL non diventa mai un percorso di import dinamico.

Il fragment identifica **solo la vista**, non i valori dei campi, i filtri, gli attacchi,
i log o l'avanzamento di una simulazione. Lo stato locale di un laboratorio viene
reiniziato quando viene smontato; un refresh conserva soltanto le preferenze già
ammesse da SEC-08. La cronologia non salva dati di sessione o contenuti didattici.

Il routing usa fragment e History API, senza librerie aggiuntive o richieste di rete.
Il server riceve il percorso del documento, non il fragment: non servono rewrite
Vercel e funzionano anche gli hosting statici con un percorso base.
La connessione browser/store viene inizializzata una sola volta in `src/main.tsx`;
il cleanup rimuove listener e sottoscrizione anche durante gli aggiornamenti HMR.

Verifiche automatiche: round trip di tutte le viste, URL ostili/non validi,
inizializzazione e canonicalizzazione, Back/Forward reali in jsdom, `hashchange`,
deduplicazione, cleanup, link nativi, ricerca, mappa CCNA e titoli IT/EN.

## English

Every registered view has a stable URL in the form `#/<id>`. IDs come from
`src/content/viewRegistry.ts`: the route table is generated from the registry,
without a second list to maintain when a lab is added.

| Destination | Example URL |
|---|---|
| OSI overview | `https://osi-cyber-explorer.vercel.app/#/osi` |
| IPv4/IPv6 fundamentals and VLSM | `https://osi-cyber-explorer.vercel.app/#/fundamentals` |
| IP connectivity and OSPF | `https://osi-cyber-explorer.vercel.app/#/routing` |
| Glossary | `https://osi-cyber-explorer.vercel.app/#/glossary` |

Copy the browser address or a lab link in the menu, search, or CCNA map.
Ctrl/Cmd+click, middle-click and opening a new tab retain native link behavior.
Enter on a focused link or in the search opens the lab in the current tab.

Deep links resolve before the first render. Refresh reopens the same view, and the
tab title uses the lab name in the selected language. Back/Forward restore the
history entry's view without adding more entries. Re-selecting the current view or
changing language/preferences does not create an entry. Internal shortcuts and the
error panel's safe return also update the URL.

Missing, unknown or malformed fragments are replaced with `#/osi`, opening the
overview while preserving the base path and query string. Routes match exactly:
uppercase, extra segments, fragment queries and percent-encoded IDs are not aliases.
URL input never becomes a dynamic import path.

The fragment identifies **only the view**, not field values, filters, attacks, logs
or simulation progress. A lab's local state resets when it is unmounted; refresh
retains only the existing SEC-08 preference allowlist. History stores no session
data or educational content.

Routing uses fragments and the History API without extra libraries or network
requests. The server receives the document path, not the fragment: no Vercel rewrites
are needed, and static hosts with a base path work too. The browser/store connection
starts once in `src/main.tsx`; cleanup removes listeners and the subscription on HMR.

Automated checks cover every view's round trip, hostile/invalid URLs, initialization
and canonicalization, real Back/Forward traversal in jsdom, `hashchange`,
deduplication, cleanup, native links, search, CCNA map and IT/EN titles.

## API references / Riferimenti API

- [History.pushState](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState)
- [Window.hashchange](https://developer.mozilla.org/en-US/docs/Web/API/Window/hashchange_event)

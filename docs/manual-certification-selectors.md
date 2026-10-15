# Manual certification selectors / Selettori dei percorsi (ENG-30)

## Italiano

Il manuale espone tre percorsi primari: `ccna`, `ejpt`, `extension`. Sono gruppi
esclusivi per organizzare lo studio, non una dichiarazione di copertura completa
degli esami. I prerequisiti possono attraversare più percorsi.

- `cert` resta l'etichetta di certificazione: `both` significa CCNA + Security+.
- `track` e `domain` descrivono l'allineamento al blueprint CCNA. eJPT resta
  `track: 'extension'`, senza dominio CCNA, ma appartiene al percorso `ejpt`.
- `certificationTrackForChapter(chapter)` deriva il percorso da questi metadati:
  `cert: 'ejpt'` → eJPT; altrimenti `track: 'ccna'` → CCNA; il resto → estensione.
- `MANUAL_CERTIFICATION_TRACKS` contiene ordine stabile ed etichette IT/EN.
- `chaptersForCertificationTrack(track)` restituisce i capitoli in ordine di studio.
- `chaptersByCertificationTrack()` restituisce gruppi con `key`, `title` bilingue
  e `chapters`; omette i gruppi vuoti.
- `chaptersByDomain(track?)` filtra prima di raggruppare per dominio. Senza argomenti
  mantiene l'indice esistente. Il gruppo `extension` è relativo al blueprint CCNA:
  con filtro eJPT contiene soltanto capitoli eJPT.

I selettori sono puri e restituiscono nuovi array; gli oggetti contenuto restano
condivisi e non vanno modificati. `chapterCompletion(group.chapters, completedIds)`
può calcolare il progresso per percorso senza duplicare la logica.

ENG-30 prepara il modello e i selettori. Il filtro visibile (UX-32), gli indicatori
(VIS-10) e il progresso per percorso (UX-33) restano task separati della roadmap.

## English

The manual exposes three primary routes: `ccna`, `ejpt`, `extension`. These are
mutually exclusive study groups, not a claim of complete exam coverage.
Prerequisites may cross routes.

- `cert` retains its certification label: `both` means CCNA + Security+.
- `track` and `domain` describe CCNA blueprint alignment. eJPT retains
  `track: 'extension'`, without a CCNA domain, but belongs to the `ejpt` route.
- `certificationTrackForChapter(chapter)` derives the route from those metadata:
  `cert: 'ejpt'` → eJPT; otherwise `track: 'ccna'` → CCNA; everything else → extension.
- `MANUAL_CERTIFICATION_TRACKS` supplies stable ordering and IT/EN labels.
- `chaptersForCertificationTrack(track)` returns chapters in study order.
- `chaptersByCertificationTrack()` returns groups with `key`, bilingual `title`
  and `chapters`, omitting empty groups.
- `chaptersByDomain(track?)` filters before grouping by domain. Without an argument
  it preserves the existing index. The `extension` group refers to the CCNA blueprint:
  with the eJPT filter it contains only eJPT chapters.

Selectors are pure and return fresh arrays; content objects remain shared and must
not be mutated. `chapterCompletion(group.chapters, completedIds)` can calculate
route progress without duplicating logic.

ENG-30 prepares the model and selectors. The visible filter (UX-32), indicators
(VIS-10), and route progress (UX-33) remain separate roadmap tasks.

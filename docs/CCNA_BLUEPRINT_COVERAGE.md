# CCNA 200-301 blueprint coverage

## English

The application tracks the numbered topics in the official **CCNA 200-301 v1.1** exam blueprint reviewed on **2026-10-10**. The authoritative source is Cisco's [CCNA Exam v1.1 (200-301) exam topics PDF](https://learningcontent.cisco.com/documents/marketing/exam-topics/200-301-CCNA-v1.1.pdf).

`src/content/ccnaBlueprint.ts` is the versioned coverage matrix. Each entry contains:

- the numbered exam-topic identifier;
- an original bilingual summary, not an exam question or a reproduction of Cisco training material;
- one or more typed destination IDs from `VIEW_REGISTRY` where the topic can be studied or observed.

The CCNA Map renders the same matrix, including its source, review date, weights, and links to the actual study views. `src/content/ccnaBlueprint.test.ts` rejects:

- a topic declared by `CCNA_DOMAINS` but missing from the matrix, or an extra stale topic;
- a duplicate topic ID, empty translation, uncovered topic, or repeated destination;
- a destination that does not exist in the central view registry;
- inconsistent domain weights, order, exam metadata, or a non-authoritative source host.

When Cisco publishes a new blueprint, update the metadata, domain objectives, bilingual summaries, and destinations together. The equality test intentionally fails until every newly declared objective has a real destination; do not satisfy it with a placeholder or the CCNA Map itself.

## Italiano

L'applicazione traccia gli argomenti numerati del blueprint ufficiale **CCNA 200-301 v1.1**, verificato il **10/10/2026**. La fonte autorevole è il [PDF Cisco degli argomenti d'esame CCNA v1.1 (200-301)](https://learningcontent.cisco.com/documents/marketing/exam-topics/200-301-CCNA-v1.1.pdf).

`src/content/ccnaBlueprint.ts` è la matrice di copertura versionata. Ogni voce contiene:

- l'identificativo numerato dell'argomento d'esame;
- una sintesi originale bilingue, non una domanda d'esame né una riproduzione del materiale formativo Cisco;
- uno o più ID tipizzati di `VIEW_REGISTRY` in cui studiare o osservare l'argomento.

La Mappa CCNA mostra la stessa matrice con fonte, data di verifica, pesi e link alle viste di studio reali. `src/content/ccnaBlueprint.test.ts` rifiuta:

- un obiettivo dichiarato da `CCNA_DOMAINS` ma assente dalla matrice, oppure una voce obsoleta in più;
- ID duplicati, traduzioni vuote, argomenti scoperti o destinazioni ripetute;
- destinazioni assenti dalla registry centrale delle viste;
- pesi, ordine, metadati dell'esame o host della fonte incoerenti.

Quando Cisco pubblica un nuovo blueprint, metadati, obiettivi dei domini, sintesi bilingui e destinazioni vanno aggiornati insieme. Il test di uguaglianza deve fallire finché ogni nuovo obiettivo non ha una destinazione reale; non va superato usando un segnaposto o la Mappa CCNA stessa.

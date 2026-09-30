# Revisione dei contenuti offensivi / Offensive-content review

Questo repository spiega tecniche di attacco esclusivamente per imparare a riconoscerle e interromperle. I laboratori sono simulazioni locali, deterministiche e non esecutive: non generano traffico, non eseguono comandi e non consegnano payload.

This repository explains attack techniques only so learners can recognise and stop them. Labs are local, deterministic, non-executing simulations: they generate no traffic, execute no commands, and deliver no payloads.

## Regole editoriali / Editorial rules

Ogni scenario o percorso nuovo deve essere aggiunto a `docs/offensive-content-reviews.json`. Il gate `npm run verify:offensive-content` rifiuta contenuti non registrati, revisioni scadute e indicatori operativi vietati.

Every new scenario or path must be added to `docs/offensive-content-reviews.json`. The `npm run verify:offensive-content` gate rejects unregistered content, overdue reviews, and prohibited operational indicators.

La checklist obbligatoria richiede che il contenuto:

1. sia chiaramente marcato come simulazione non esecutiva;
2. presupponga un ambiente posseduto o esplicitamente autorizzato;
3. colleghi sempre la tecnica a difese e segnali osservabili;
4. dichiari i limiti del modello didattico;
5. usi solo target riservati alla documentazione o locali;
6. renda inerti o redatti credenziali, comandi e payload;
7. eviti velocità, intervalli e sequenze immediatamente riutilizzabili contro terzi;
8. abbia una revisione con data e scadenza non superiore a 180 giorni.

The mandatory checklist requires content to:

1. be clearly labelled as a non-executing simulation;
2. assume an owned or explicitly authorised environment;
3. always connect the technique to defenses and observable signals;
4. state the educational model's limitations;
5. use only documentation-reserved or local targets;
6. keep credentials, commands, and payloads inert or redacted;
7. omit rates, ranges, and sequences that are immediately reusable against third parties;
8. carry a dated review expiring within 180 days.

## Flusso di revisione / Review workflow

1. Aggiungere o modificare il contenuto e la relativa difesa. / Add or change the content and its defense.
2. Astrarre qualsiasi dettaglio operativo: descrivere l'effetto, non fornire una ricetta. / Abstract operational detail: describe the effect, not a recipe.
3. Aggiungere o rinnovare la voce nel registro. / Add or renew the registry entry.
4. Eseguire `npm run verify:offensive-content` e la suite completa. / Run `npm run verify:offensive-content` and the full suite.
5. Richiedere la revisione del CODEOWNER per i file protetti. / Request the CODEOWNER review for protected files.

Una revisione periodica rinnova `reviewedOn` e `nextReviewBy` solo dopo aver riesaminato contenuto, target, comandi e payload. Un gate scaduto è intenzionalmente bloccante.

A periodic review renews `reviewedOn` and `nextReviewBy` only after rechecking content, targets, commands, and payloads. An overdue gate intentionally blocks the build.

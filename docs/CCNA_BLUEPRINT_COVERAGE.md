# Certification syllabus coverage

## English

The application tracks the official **CCNA 200-301 v1.1** and **eJPT** syllabi reviewed on
**2026-10-18**. The authoritative sources are Cisco's
[CCNA exam topics PDF](https://learningcontent.cisco.com/documents/marketing/exam-topics/200-301-CCNA-v1.1.pdf)
and INE's [eJPT certification page](https://ine.com/security/certifications/ejpt-certification).

`src/content/certificationCoverage.ts` is the granular evidence matrix. It records:

- all 53 top-level CCNA objectives and all 58 published CCNA subobjectives;
- all 22 eJPT objectives in the order published by INE;
- a bilingual original summary, the governing verb, the minimum evidence level, the actual evidence
  level, and one or more typed destinations from `VIEW_REGISTRY`;
- `covered` or `partial` status, with every partial item tied to a concrete roadmap task.

INE does not publish objective codes. Stable IDs such as `EJPT-HNPT-01` are therefore local catalogue
identifiers that preserve the official domain and published order; they are not presented as INE IDs.

Evidence levels have deliberately narrow meanings:

- `theory`: an explanation or worked example;
- `guided`: a repeatable exercise with instructions and verification;
- `interactive`: an interactive lab with observable feedback.

The Certification Map renders the same matrix. `certificationCoverage.test.ts` rejects missing or
duplicate objectives, incomplete translations, stale or repeated destinations, invalid source
metadata, and domain-weight drift. It also derives the minimum level from the official verb:
`configure`, `verify`, `conduct`, `demonstrate`, and `modify` require at least guided evidence before
an item may be marked covered. A partial item may remain below that threshold only when it names the
roadmap task that closes the gap.

`ccnaBlueprint.ts` remains the compact top-level domain model used by the CCNA curriculum. When an
official syllabus changes, update both the compact model and the granular matrix in the same commit;
do not use a placeholder destination or mark partial coverage as complete.

## Italiano

L'applicazione traccia i syllabus ufficiali **CCNA 200-301 v1.1** ed **eJPT**, verificati il
**18/10/2026**. Le fonti autorevoli sono il
[PDF Cisco degli argomenti d'esame](https://learningcontent.cisco.com/documents/marketing/exam-topics/200-301-CCNA-v1.1.pdf)
e la [pagina della certificazione eJPT di INE](https://ine.com/security/certifications/ejpt-certification).

`src/content/certificationCoverage.ts` è la matrice granulare delle prove. Registra:

- tutti i 53 obiettivi principali e i 58 sotto-obiettivi CCNA pubblicati;
- tutti i 22 obiettivi eJPT nell'ordine pubblicato da INE;
- sintesi originale bilingue, verbo determinante, livello minimo, livello effettivo e una o più
  destinazioni tipizzate di `VIEW_REGISTRY`;
- stato `covered` o `partial`, collegando ogni voce parziale a un task concreto della roadmap.

INE non pubblica codici per gli obiettivi. Gli ID stabili come `EJPT-HNPT-01` sono quindi
identificativi interni che conservano dominio e ordine ufficiale; non vengono presentati come ID INE.

I livelli di prova hanno un significato intenzionalmente ristretto:

- `theory`: spiegazione o esempio svolto;
- `guided`: esercizio ripetibile con istruzioni e verifica;
- `interactive`: laboratorio interattivo con feedback osservabile.

La Mappa delle certificazioni mostra la stessa matrice. `certificationCoverage.test.ts` rifiuta
obiettivi mancanti o duplicati, traduzioni incomplete, destinazioni obsolete o ripetute, metadati
delle fonti non validi e variazioni dei pesi. Inoltre deriva il livello minimo dal verbo ufficiale:
`configure`, `verify`, `conduct`, `demonstrate` e `modify` richiedono almeno una prova guidata prima
che la voce possa essere marcata completa. Una voce parziale può restare sotto soglia soltanto se
indica il task della roadmap che chiuderà la lacuna.

`ccnaBlueprint.ts` resta il modello compatto dei domini principali usato dal curriculum CCNA. Quando
un syllabus ufficiale cambia, modello compatto e matrice granulare vanno aggiornati nello stesso
commit; non si devono usare destinazioni segnaposto né dichiarare completa una copertura parziale.

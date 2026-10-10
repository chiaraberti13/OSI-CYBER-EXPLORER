# List performance profile / Profilo prestazionale delle liste

## English

ENG-15 was measured on 10 October 2026 against the production Vite preview in Chromium 141 at 1440 × 1000. Each search sample used a fresh browser context; the reported value is the median of seven runs. The interaction filled `security` in the glossary search and waited for the filtered `IPsec` result.

| Metric | Before | After | Change |
|---|---:|---:|---:|
| Glossary terms | 114 | 114 | unchanged |
| Initial DOM nodes | 442 | 443 | semantic `dl` wrapper added |
| Per-row animations on initial render | 114 | 0 | removed |
| Last glossary animation completion | 3,690 ms | 0 ms | −100% |
| Cold filtered-search median | 19.22 ms | 12.37 ms | −35.6% |

The measured bottleneck was the staggered Motion animation: every one of the 114 rows stayed in the animation schedule, with the last row delayed for more than three seconds, and filtering replaced many animated nodes while those animations were active. The implementation now renders a semantic `dl` with stable term keys and retains only CSS hover feedback.

Virtualisation and a search index were deliberately not added. The complete glossary has only 443 DOM nodes after the semantic wrapper, the filtered interaction is below one 60 Hz frame in the median, and the Ports, Protocols, and Hardware collections are smaller and already cap their animation delay. Adding `react-window` or a second index would increase code and accessibility complexity without evidence of a remaining bottleneck. Re-profile if the glossary grows substantially or the median search latency exceeds 16.7 ms on the same method.

## Italiano

ENG-15 è stato misurato il 10 ottobre 2026 sulla preview Vite di produzione, con Chromium 141 a 1440 × 1000. Ogni campione di ricerca usa un contesto browser nuovo; il valore riportato è la mediana di sette esecuzioni. L’interazione inserisce `security` nella ricerca del glossario e attende il risultato filtrato `IPsec`.

| Metrica | Prima | Dopo | Variazione |
|---|---:|---:|---:|
| Termini del glossario | 114 | 114 | invariato |
| Nodi DOM iniziali | 442 | 443 | aggiunto wrapper semantico `dl` |
| Animazioni per riga al rendering iniziale | 114 | 0 | eliminate |
| Completamento dell’ultima animazione | 3.690 ms | 0 ms | −100% |
| Mediana ricerca filtrata a freddo | 19,22 ms | 12,37 ms | −35,6% |

Il collo di bottiglia misurato era l’animazione Motion scaglionata: tutte le 114 righe restavano pianificate, l’ultima con oltre tre secondi di ritardo, e il filtro sostituiva numerosi nodi animati mentre le animazioni erano ancora attive. L’implementazione usa ora un `dl` semantico con chiavi stabili basate sul termine e conserva soltanto il feedback hover in CSS.

Virtualizzazione e indice di ricerca non sono stati aggiunti intenzionalmente. Il glossario completo occupa solo 443 nodi DOM dopo il wrapper semantico, l’interazione filtrata resta sotto un frame a 60 Hz nella mediana e le collezioni Porte, Protocolli e Apparati sono più piccole e limitano già il ritardo delle animazioni. Aggiungere `react-window` o un secondo indice aumenterebbe codice e complessità accessibile senza evidenza di un collo di bottiglia residuo. Ripetere il profilo se il glossario cresce sensibilmente o la mediana supera 16,7 ms con lo stesso metodo.

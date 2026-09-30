# Modello STP del simulatore / STP simulator model

Verifica tecnica / Technical review: **2026-09-30**

## Modello applicato / Applied model

Il simulatore calcola una singola istanza **Cisco Rapid PVST+** per la VLAN selezionata. L'elezione della topologia usa il vettore di priorità comune a STP/RSTP, mentre ruoli e stati mostrati sono quelli RSTP: `root`, `designated`, `alternate` e `forwarding`/`discarding`. Non simula timer, proposal/agreement, topology change, backup port o migrazione del protocollo.

The simulator calculates one **Cisco Rapid PVST+** instance for the selected VLAN. Topology election uses the priority vector shared by STP/RSTP, while the displayed roles and states use RSTP vocabulary: `root`, `designated`, `alternate`, and `forwarding`/`discarding`. It does not simulate timers, proposal/agreement, topology changes, backup ports, or protocol migration.

### Cost method / Metodo di costo

| Selezione UI | Origine dichiarata | Campo | Intervallo | Esempi 10 Mb/s · 100 Mb/s · 1 Gb/s · 10 Gb/s |
|---|---|---:|---:|---|
| `short` | IEEE 802.1D-1998 | 16 bit | 1–65,535 | 100 · 19 · 4 · 2 |
| `long` | IEEE 802.1t / IEEE 802.1D-2004 | 32 bit | 1–200,000,000 | 2,000,000 · 200,000 · 20,000 · 2,000 |

La scelta è globale per la topologia simulata ed entra nel risultato come `StpResult.model.cost`; non è una semplice etichetta UI. Il metodo `short` resta selezionato di default per riflettere il default documentato da Cisco, ma la UI rende sempre visibile lo standard attivo.

The choice is global to the simulated topology and is carried in `StpResult.model.cost`; it is not merely a UI label. `short` remains selected by default to reflect Cisco's documented default, but the UI always exposes the active standard.

### Bridge ID ed extended system ID

La priorità configurata è accettata da 0 a 61,440 in multipli di 4,096. Il valore che partecipa all'elezione è:

`effective priority = configured priority + VLAN ID`

Per esempio, la priorità 24,576 sulla VLAN 10 produce 24,586. Il MAC normalizzato completa il Bridge ID; a parità di priorità effettiva vince il MAC numericamente più basso.

Configured priority is accepted from 0 through 61,440 in 4,096 increments. The election value is the configured priority plus the VLAN ID. The normalized MAC completes the Bridge ID; when effective priorities tie, the numerically lower MAC wins.

### Elezione della root port / Root-port election

Il confronto puro `compareRootPortCandidates` applica, senza saltare livelli, questo ordine:

1. root path cost più basso;
2. sender Bridge ID più basso;
3. sender Port ID più basso;
4. Port ID locale più basso.

`compareRootPortCandidates` applies the same complete order: lowest root path cost, sender Bridge ID, sender Port ID, then local Port ID. Unit tests isolate every level and deliberately make later fields conflict, ensuring that a later field can never override an earlier winner.

## Distinzione dei protocolli / Protocol distinction

| Modalità | Base | Istanze | Stato nel simulatore |
|---|---|---|---|
| PVST+ | Cisco, basato su IEEE 802.1D | una per VLAN | spiegato, non calcolato con stati classici |
| Rapid PVST+ | Cisco, convergenza basata su IEEE 802.1w | una per VLAN | **modello applicato** |
| MSTP | IEEE 802.1s, poi incorporato in IEEE 802.1Q; usa RSTP | più VLAN mappabili sulla stessa istanza | spiegato; regione e mapping VLAN non simulati |

La UI espone questa distinzione accanto a ogni risultato. In particolare non chiama l'albero “MST” solo perché usa ruoli RSTP, e non mescola il ruolo `alternate` con i cinque stati classici di 802.1D.

The UI exposes this distinction beside every result. In particular, it does not call the tree “MST” merely because it uses RSTP roles, and it does not mix the `alternate` role with the five classic 802.1D states.

## Fonti / Sources

- Cisco, [Configuring Spanning Tree Protocol — Catalyst 9400](https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9400/software/release/17-3/configuration_guide/lyr2/b_173_lyr2_9400_cg/configuring_spanning_tree_protocol.html): composizione del Bridge ID, modalità PVST+/Rapid PVST+/MSTP, istanze e base IEEE.
- Cisco, [Configuring Rapid PVST+ — Nexus 9000](https://www.cisco.com/c/en/us/td/docs/switches/datacenter/nexus9000/sw/92x/Layer-2_switching/configuration/guide/b-cisco-nexus-9000-nx-os-layer-2-switching-configuration-guide-92x/b-cisco-nexus-9000-nx-os-layer-2-switching-configuration-guide-92x_chapter_01001.html): tabelle short/long, intervalli di costo, default short, priorità valide ed extended system ID.
- IEEE, riferimenti storici dichiarati nella roadmap: IEEE 802.1D-1998, IEEE 802.1t, IEEE 802.1w, IEEE 802.1s e IEEE 802.1D-2004. Gli standard successivi hanno incorporato o riallocato parte di questi contenuti in IEEE 802.1Q; le etichette storiche sono mantenute perché corrispondono alla terminologia didattica e ai comandi Cisco mostrati.


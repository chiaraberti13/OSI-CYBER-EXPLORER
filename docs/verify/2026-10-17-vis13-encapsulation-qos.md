# VIS-13 — Micro-diagrammi per incapsulamento OSI e QoS

**Data:** 17/10/2026

**Ambito:** primo incremento di VIS-13; il task resta in corso.

## Verifica iniziale

- Repository riallineato con `origin/main` in fast-forward da `794dc5d` a `1ca70d8` prima
  dell'analisi; nessuna modifica locale preesistente nel checkout usato.
- La roadmap indicava VIS-13 come unico elemento evolutivo aperto oltre al task ricorrente
  I18N-10. Dei 96 argomenti, 3 avevano già un diagramma.
- Il componente `ManualConceptDiagram` fornisce inline SVG, tema ereditato, titolo e descrizione
  accessibili, testo alternativo visibile e identificatori SVG univoci.

## Modifiche

- Aggiunto `encapsulation`, collegato a `osi-encapsulation`: mostra Dati → segmento/datagramma →
  pacchetto IP → frame Ethernet con FCS → bit. La descrizione spiega anche il decapsulamento inverso
  e chiarisce che il formato effettivo dipende dai protocolli e dal collegamento.
- Aggiunto `qos`, collegato a `ip-services-qos`: confine di fiducia → classificazione DSCP → code e
  gestione della congestione (LLQ, CBWFQ, WRED) → link in uscita. La descrizione ricorda che QoS
  gestisce la capacità disponibile e non crea banda.
- Entrambe le figure hanno contenuti IT/EN, un titolo, una descrizione completa visibile e le
  etichette tecniche essenziali. Nessuna dipendenza o richiesta di rete aggiunta.
- Esteso l'E2E dei diagrammi a tutti e cinque i diagrammi, a 320 e 1280 px, in entrambe le lingue e
  nei due temi. Il test controlla anche accessibilità Axe, contrasto del tratto SVG, bounding box dei
  testi e overflow della pagina.
- VIS-13 resta **in corso**: l'incremento ha portato la copertura da 3/96 a 5/96 argomenti.

## Verifiche

| Controllo                                                 | Esito                                                                                                                                                        |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run verify`                                          | Superato: 87 file, 789 test unitari; format, typecheck, lint, guard di sicurezza/contenuti, build e budget                                                   |
| `npm run test:e2e -- e2e/manual-concept-diagrams.spec.ts` | Superato: 8/8                                                                                                                                                |
| `npm run test:e2e`                                        | Superato al secondo run: 84/84; nel primo run un controllo Axe sui target mobili è fallito una volta, poi è passato nel rerun isolato e nella suite completa |
| `npm run audit:full`                                      | 0 vulnerabilità                                                                                                                                              |
| `npm run audit:signatures:full`                           | 330 firme registry e 123 attestazioni verificate                                                                                                             |
| Budget di produzione                                      | Entry 122.897 B gzip / 125.000 B; chunk porte 47.946 B / 55 kB; 35 route chunk controllati                                                                   |

Il build emette un avviso informativo per un chunk JavaScript sopra 500 kB minificato; i limiti
gzip di entry e route definiti dal progetto sono superati con esito positivo. Non è stato introdotto
dal presente incremento.

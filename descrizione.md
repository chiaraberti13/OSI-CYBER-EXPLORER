# OSI Cyber Explorer — Descrizione del progetto

> Documento pensato per accompagnare il curriculum. Spiega **cosa fa** l'applicazione,
> **come è stata sviluppata** dal punto di vista tecnico e **quale è stato il mio ruolo**
> e le competenze che il progetto dimostra.

---

## 1. In una frase

**OSI Cyber Explorer** è un'applicazione web didattica e interattiva, bilingue (Italiano/Inglese),
che permette di studiare il **modello OSI** e la **cybersecurity di rete** vedendo *in movimento*
come un pacchetto di dati attraversa i 7 livelli della rete, come può essere attaccato e come lo si difende.

L'idea è trasformare un argomento normalmente teorico e astratto — l'incapsulamento dei pacchetti —
in un **laboratorio visivo** che si "guarda funzionare", pensato per studenti e professionisti IT.

---

## 2. Cosa fa l'app (funzionalità per l'utente)

L'applicazione è organizzata in **5 sezioni** navigabili da un menu in alto:

### 🧪 Lab Pila OSI (la sezione principale)
È il cuore dell'app. Lo schermo è diviso in tre colonne:

- **A sinistra — Terminale di log:** una console che scrive in tempo reale ogni operazione
  della simulazione (es. *"L4 incapsulato (TCP)"*, *"Attacco DoS riuscito! Connessione interrotta"*),
  con colori diversi in base alla gravità (info, warning, pericolo, successo).
- **Al centro — Motore di simulazione + Pila OSI:** l'utente sceglie un **protocollo**
  (HTTP, DNS, BGP, SSH, FTP, SMTP), preme *Avvia Simulazione* e vede il pacchetto scendere
  dal Livello 7 (Applicazione) al Livello 1 (Fisico), aggiungendo a ogni passo un'**intestazione (header)**
  realistica — indirizzi IP, porte TCP/UDP, MAC address, flag, sequence number, ecc. —
  per poi risalire in fase di **decapsulamento**. Si può mettere in pausa, riprendere e resettare.
- **A destra — Layer Intelligence:** una scheda tecnica che approfondisce il livello selezionato
  con panoramica, responsabilità, casi d'uso, attacchi e difese.

Su questa sezione l'utente può anche:
- **Iniettare uno scenario di attacco** (es. SQL Injection su L7, SYN Flood su L4, BGP Hijacking su L3,
  Man-in-the-Middle, spoofing…). Quando l'attacco è attivo appare un **indicatore di rischio ("threat meter")**
  che sale, l'interfaccia si tinge di rosso e la connessione può venire "interrotta".
- **Attivare le difese** (toggle *Shield*): con la contromisura giusta l'attacco viene **mitigato**
  e la simulazione arriva a destinazione, con tanto di scheda "difesa consigliata" per ogni scenario.
- **Attivare/disattivare i segnali audio:** ogni fase produce un suono sintetizzato
  (avvio, tick a ogni livello, accordo di successo, allarme in caso di attacco).

### 🔢 Porte & Protocolli
Una sezione di riferimento sulle porte di rete e i protocolli associati.

### 🛡️ Cybersecurity (IDS/IPS)
Una dashboard dedicata all'analisi di sicurezza: attacchi tipici per livello,
strategie di *hardening* e contromisure.

### 📖 Glossario di Rete
Dizionario dei termini tecnici di networking e sicurezza.

### 🎓 Quiz
Un motore di quiz per autovalutare le conoscenze acquisite, con punteggio.

Tutti i contenuti sono disponibili sia **in italiano che in inglese**, commutabili con un click.

### ✨ Esperienza didattica e UX
Alcune scelte pensate specificamente per l'apprendimento e l'usabilità:

- **Onboarding alla prima visita:** la *Guida del Lab* si apre automaticamente solo la prima volta,
  per orientare subito chi non conosce l'app (poi non disturba più).
- **Preferenze ricordate:** lingua, segnali audio, velocità di simulazione e *record* del quiz
  vengono salvati nel browser (`localStorage`), così l'app riapre com'era stata lasciata.
- **Controllo della velocità (0.5× / 1× / 2×):** si può rallentare la simulazione per spiegare
  passo-passo in aula o accelerarla per un ripasso.
- **Console guidata:** quando non ci sono ancora log, il terminale mostra un suggerimento su
  come iniziare invece di restare vuoto.
- **Quiz più interattivo:** barra di avanzamento, punteggio in tempo reale, record personale
  e **navigazione da tastiera** (tasti 1–4 per rispondere, Invio per proseguire), con
  *spiegazione del tutor* dopo ogni risposta.
- **Accessibilità:** attributo `lang` del documento e titolo sincronizzati con la lingua,
  etichette `aria-label` sui controlli a sola icona, focus da tastiera ben visibile e
  rispetto della preferenza di sistema *"riduci animazioni"* (`prefers-reduced-motion`).

---

## 3. Come è stata sviluppata (aspetti tecnici)

### Stack tecnologico
| Area | Tecnologia | Ruolo nel progetto |
|------|------------|--------------------|
| Linguaggio | **TypeScript** | Tipizzazione statica di dati e stato, meno errori a runtime |
| UI | **React 19** | Costruzione dell'interfaccia a componenti |
| Build tool | **Vite 6** | Dev server rapido e bundling di produzione |
| Stile | **Tailwind CSS 4** | Design system utility-first, look coerente e responsivo |
| Stato globale | **Zustand** | Store centralizzato e leggero, senza boilerplate |
| Animazioni | **Motion** | Transizioni fluide tra viste e micro-interazioni |
| Icone | **lucide-react** | Set di icone vettoriali |
| Audio | **Web Audio API** | Sintesi in tempo reale dei segnali sonori (nessun file audio) |

### Architettura
Il progetto segue un'**architettura modulare e a responsabilità separate**:

- **`src/types.ts`** — definizione centrale dei tipi (livelli OSI, attacchi, difese, header di pacchetto,
  scenari, log). È il "contratto" dati su cui poggia tutto il resto.
- **`src/constants.ts`** — i **dati** dell'applicazione (i 7 livelli OSI con descrizioni, protocolli,
  attacchi e difese in due lingue, gli scenari di attacco, i termini del glossario). Contenuto e logica
  sono tenuti separati: aggiungere un attacco o un livello significa modificare i dati, non il codice.
- **`src/store.ts`** — lo **stato globale** con Zustand: lingua attiva, livello selezionato, stato della
  simulazione, protocollo scelto, attacco attivo, difese, log, header generati, vista corrente, audio,
  velocità di simulazione. Tutti i componenti leggono e scrivono da qui, evitando il "prop drilling".
  Le sole **preferenze** (lingua, audio, velocità, record del quiz, guida già vista) sono rese
  persistenti con il middleware `persist` di Zustand su `localStorage`, mentre lo stato transitorio
  della sessione (log, stato simulazione, attacco) riparte pulito a ogni ricarica.
- **`src/components/`** — i **componenti UI**, ognuno con una responsabilità chiara:
  `PacketSimulator` (motore di simulazione), `OsiStack` (pila visiva dei 7 livelli),
  `Terminal` (log animati), `LayerDetails`, `SecurityDashboard`, `QuizModal`, `PortsModal`,
  `GlossaryModal`, `Header`, `Navigation`.
- **`src/utils/audio.ts`** — un piccolo **synth** basato su Web Audio API che genera i segnali
  sonori (oscillatori, inviluppi di gain) senza dipendere da asset esterni.

### Il motore di simulazione (la "pipeline")
Il componente `PacketSimulator` gestisce l'intero ciclo di vita del pacchetto:

1. All'avvio imposta lo stato su `encapsulating` e parte dal livello 7.
2. Un ciclo temporizzato (`setInterval`, un passo al secondo) scende di livello in livello:
   a ogni passo calcola l'**header** e il nome della **PDU** corretti in base al protocollo scelto
   (es. *Segment* + TCP su L4 per HTTP, *Datagram* + UDP per DNS), li aggiunge allo store e scrive nel log.
3. Arrivato al livello fisico, se è attivo un attacco **senza** difesa la simulazione passa a `interrupted`;
   altrimenti passa a `decapsulating` e il pacchetto **risale** i livelli fino alla consegna.
4. Ogni transizione aggiorna in modo reattivo l'interfaccia, il terminale e i segnali audio.

Il tutto è **deterministico e client-side**: i dati di pacchetto (IP, MAC, porte, sequence number)
sono realistici ma predefiniti, scelti per essere didatticamente chiari.

### Internazionalizzazione (i18n)
Il bilinguismo non usa librerie esterne: i testi sono strutturati come dizionari `{ it, en }`
nei tipi e nelle costanti, e i componenti scelgono la stringa in base alla lingua nello store.
Questo rende immediato aggiungere o correggere una traduzione.

### Nota tecnica onesta
Il `package.json` include la dipendenza `@google/genai` e il `metadata.json` menziona una capability
Gemini: sono un residuo dell'ambiente di scaffolding iniziale. **La logica dell'app attuale non usa
alcun modello di AI**: la simulazione è interamente deterministica e lato client. È bene dichiararlo
così com'è, per non attribuire al progetto funzionalità che non implementa.

---

## 4. Il mio ruolo e contributo nel progetto

> ⚠️ *Questa sezione è una traccia da personalizzare: mantieni solo le affermazioni che corrispondono
> davvero alla tua parte di lavoro e taglia il resto — un CV è più forte quando è verificabile.*

Nel progetto ho:

- **Progettato l'architettura modulare** dell'applicazione, separando in modo netto i **dati**
  (`constants.ts`), i **tipi/contratti** (`types.ts`), lo **stato** (`store.ts`) e i **componenti UI**,
  così che i contenuti didattici possano crescere senza toccare la logica.
- **Gestito la pipeline di simulazione e rendering** del pacchetto: il ciclo di
  incapsulamento/decapsulamento livello per livello, la generazione degli header realistici per ogni
  protocollo e la sincronizzazione tra stato, interfaccia, log e feedback audio.
- **Modellato lo stato globale** con Zustand, definendo un unico store reattivo che coordina tutte
  le sezioni dell'app (simulazione, attacchi, difese, lingua, viste, quiz).
- **Curato l'esperienza utente e le micro-interazioni**: transizioni animate tra le viste,
  "threat meter" visivo, terminale con log colorati e segnali audio sintetizzati in tempo reale.
- **Implementato il bilinguismo (IT/EN)** con un sistema di dizionari senza dipendenze esterne.
- **Prodotto i contenuti didattici tecnici**: descrizione dei 7 livelli OSI, catalogo di attacchi
  (SQLi, XSS, DoS, MITM, BGP Hijacking…), relative contromisure e scenari di sicurezza.

---

## 5. Competenze dimostrate

**Sviluppo front-end**
- React 19 con componenti funzionali e hook (`useEffect`, `useRef`, stato derivato)
- TypeScript: progettazione di tipi e interfacce, tipizzazione dello stato applicativo
- Gestione dello stato con Zustand (store centralizzato, azioni, selettori)
- Styling con Tailwind CSS e design responsivo
- Animazioni e transizioni con Motion
- Web Audio API per la sintesi sonora

**Ingegneria del software**
- Architettura modulare e separazione dei livelli (dati / tipi / stato / UI)
- Progettazione di una macchina a stati per il ciclo di vita della simulazione
- Internazionalizzazione (i18n) senza dipendenze
- Configurazione di toolchain moderna (Vite, TypeScript, `tsc --noEmit` come lint)

**Dominio: reti e cybersecurity**
- Modello OSI e incapsulamento/decapsulamento delle PDU
- Protocolli di rete (HTTP, DNS, BGP, SSH, FTP, SMTP, TCP/UDP/IP)
- Attacchi per livello e strategie di mitigazione/hardening

**Trasversali**
- Capacità di **rendere semplice e visivo** un argomento tecnico complesso (didattica)
- Attenzione al dettaglio nell'UI e nell'esperienza d'uso
- Documentazione chiara del progetto (README bilingue, questo documento)

---

## 6. Come si avvia (per chi vuole provarlo)

```bash
# Requisiti: Node.js 18+
npm install      # installa le dipendenze
npm run dev      # avvia in sviluppo su http://localhost:3000
npm run build    # crea la build di produzione
npm run lint     # controllo dei tipi TypeScript (tsc --noEmit)
```

---

*OSI Cyber Explorer — © Chiara Berti, 2026. Applicazione didattica a scopo educativo.*

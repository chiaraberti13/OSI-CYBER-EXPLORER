# OSI Cyber Explorer

> An interactive, bilingual (🇮🇹 / 🇬🇧) lab to **see** how data travels through the 7 OSI layers, how each layer can be attacked, and how those attacks are neutralized.

![CI](https://github.com/chiaraberti13/OSI-Cyber-Explorer/actions/workflows/ci.yml/badge.svg)

[English](#-english) · [Italiano](#-italiano)

---

<a name="-english"></a>
## 🇬🇧 English

### Overview
**OSI Cyber Explorer** turns two normally abstract topics — **packet encapsulation** and **network security** — into a visual, hands-on laboratory. You watch a packet descend the OSI stack header by header, inject real-world attacks, and toggle the matching defense to see it work. Everything is deterministic and client-side; there is no backend and no AI involved.

### Features
- **OSI Stack Lab** — Pick a protocol (HTTP, DNS, BGP, SSH, FTP, SMTP) and run the simulation. A live **Packet Inspector** shows the headers stacking up (L7 → L1) with realistic fields (IP, ports, MAC, flags, sequence numbers), a colour-coded console logs every step, and the layer panel explains theory, use cases, attacks and defenses. Adjustable playback speed (0.5× / 1× / 2×) and audio cues.
- **Attack & Defense Lab** — ~25 attacks across all 7 layers (ARP poisoning, MAC flooding, IP/BGP spoofing, SYN/UDP floods, session hijacking, padding oracle, SQL injection, XSS, DNS cache poisoning, and more). Each one plays out as a step-by-step *kill chain*; turn the defense on to see exactly **where** and **how** it is neutralized.
- **Ports & Protocols** — Reference for IANA port ranges, protocols, appliances and a port-association trainer.
- **Cybersecurity (IDS/IPS)** — Reference on defensive appliances (NIDS/NIPS/HIDS/HIPS/WIDS/WIPS/EDR) and the key difference between **detecting** (IDS) and **blocking** (IPS).
- **Network Glossary** — Searchable dictionary of networking & security terms.

Every screen is available in **Italian and English**, switchable with one click. UI preferences (language, audio, speed) persist across reloads.

### Tech stack
| Area | Choice |
|------|--------|
| Language | TypeScript |
| UI | React 19 |
| Build tool | Vite 6 |
| Styling | Tailwind CSS 4 |
| State | Zustand (with `persist`) |
| Animation | Motion |
| Icons | lucide-react |
| Audio | Web Audio API (synthesized, no assets) |
| Tests | Vitest |

### Project structure
```
src/
├─ components/     UI components (OsiStack, PacketSimulator, PacketInspector,
│                  AttackLab, SecurityDashboard, LayerDetails, Terminal, …)
├─ lib/            Pure, unit-tested logic (osi.ts) + tests
├─ utils/          Web Audio synth
├─ constants.ts    Bilingual educational data (layers, attacks, walkthroughs, glossary)
├─ store.ts        Global state (Zustand)
├─ types.ts        Shared type contracts
└─ App.tsx
```
Content (`constants.ts`) is kept separate from logic and UI, so adding an attack or a layer means editing data, not code.

### Getting started
Requires Node.js 18+.
```bash
npm install      # install dependencies
npm run dev      # start dev server at http://localhost:3000
npm run build    # production build
npm test         # run the test suite (Vitest)
npm run typecheck # TypeScript type-check
```

### What this project demonstrates
- Front-end engineering with **React 19 + TypeScript**, centralized state (Zustand) and a clean data/logic/UI separation.
- A deterministic **encapsulation/decapsulation state machine** and testable, framework-free logic (`src/lib`).
- **Internationalization** (IT/EN) without external libraries, plus accessibility (focus states, `aria` labels, reduced-motion support).
- Engineering hygiene: **unit tests**, **CI** (type-check + test + build), no dead dependencies.
- Solid networking & security domain knowledge across all 7 OSI layers.

### License & terms of use
Released under the [MIT License](LICENSE). You may use, study, modify and
redistribute the project while preserving the copyright and licence notice.

---

<a name="-italiano"></a>
## 🇮🇹 Italiano

### Panoramica
**OSI Cyber Explorer** trasforma due argomenti normalmente astratti — **l'incapsulamento dei pacchetti** e la **sicurezza di rete** — in un laboratorio visivo e pratico. Si guarda un pacchetto scendere lungo la pila OSI header dopo header, si iniettano attacchi reali e si attiva la difesa corrispondente per vederla funzionare. Tutto è deterministico e lato client: nessun backend, nessuna AI.

### Funzionalità
- **Lab Pila OSI** — Scegli un protocollo (HTTP, DNS, BGP, SSH, FTP, SMTP) e avvia la simulazione. L'**Ispettore Pacchetto** mostra gli header che si accumulano (L7 → L1) con campi realistici (IP, porte, MAC, flag, sequence number), una console colorata registra ogni passo e il pannello del livello spiega teoria, casi d'uso, attacchi e difese. Velocità regolabile (0.5× / 1× / 2×) e segnali audio.
- **Lab Attacco & Difesa** — ~25 attacchi su tutti i 7 livelli (ARP poisoning, MAC flooding, spoofing IP/BGP, SYN/UDP flood, session hijacking, padding oracle, SQL injection, XSS, avvelenamento cache DNS e altri). Ognuno si svolge come una *kill chain* passo-passo; attiva la difesa per vedere **dove** e **come** viene neutralizzato.
- **Porte & Protocolli** — Riferimento su range di porte IANA, protocolli, apparati e un trainer sulle associazioni.
- **Cybersecurity (IDS/IPS)** — Riferimento sugli apparati difensivi (NIDS/NIPS/HIDS/HIPS/WIDS/WIPS/EDR) e la differenza tra **rilevare** (IDS) e **bloccare** (IPS).
- **Glossario di Rete** — Dizionario ricercabile di termini di rete e sicurezza.

Ogni schermata è disponibile in **italiano e inglese**, commutabile con un click. Le preferenze (lingua, audio, velocità) vengono ricordate tra una sessione e l'altra.

### Stack tecnologico
TypeScript · React 19 · Vite 6 · Tailwind CSS 4 · Zustand (`persist`) · Motion · lucide-react · Web Audio API · Vitest.

### Avvio rapido
Richiede Node.js 18+.
```bash
npm install       # installa le dipendenze
npm run dev       # avvia in sviluppo su http://localhost:3000
npm run build     # build di produzione
npm test          # esegue i test (Vitest)
npm run typecheck # controllo dei tipi TypeScript
```

### Competenze dimostrate
- Sviluppo front-end con **React 19 + TypeScript**, stato centralizzato (Zustand) e netta separazione dati/logica/UI.
- Una **macchina a stati** deterministica per incapsulamento/decapsulamento e logica pura e testabile (`src/lib`).
- **Internazionalizzazione** (IT/EN) senza librerie esterne, con attenzione all'accessibilità (focus, `aria`, riduzione animazioni).
- Igiene ingegneristica: **test unitari**, **CI** (type-check + test + build), nessuna dipendenza morta.
- Solide conoscenze di rete e sicurezza su tutti i 7 livelli OSI.

### Licenza e termini d'uso
Distribuito con [licenza MIT](LICENSE). Il progetto può essere utilizzato,
studiato, modificato e ridistribuito mantenendo l'avviso di copyright e licenza.

---

© Chiara Berti — 2026

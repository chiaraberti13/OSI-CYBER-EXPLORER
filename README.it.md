<p align="center"><img src="assets/banner.svg" alt="OSI Cyber Explorer" width="100%"></p>

<p align="center"><a href="README.md">🇬🇧 English</a> · <a href="README.it.md">🇮🇹 Italiano</a></p>

<p align="center">
  <img src="https://github.com/chiaraberti13/OSI-Cyber-Explorer/actions/workflows/ci.yml/badge.svg" alt="CI">
  <img src="https://img.shields.io/badge/status-active-F2C94C?style=flat-square" alt="Active">
  <img src="https://img.shields.io/badge/category-CYBERSECURITY-22D3EE?style=flat-square" alt="Cybersecurity">
  <img src="https://img.shields.io/badge/stack-React%20%2B%20TypeScript-8B949E?style=flat-square" alt="React and TypeScript">
  <img src="https://img.shields.io/badge/licence-MIT-2EA043?style=flat-square" alt="MIT">
</p>

> Laboratorio bilingue per studiare networking e CCNA 200-301, osservare il viaggio dei dati, simulare attacchi e comprendere le difese corrispondenti.

<p align="center"><a href="https://osi-cyber-explorer.vercel.app"><strong>Demo live</strong></a> · <a href="SECURITY.md">Sicurezza</a> · <a href="LICENSE">Licenza</a></p>

---

## 🇮🇹 Italiano

## Panoramica
**OSI Cyber Explorer** trasforma il networking, l'incapsulamento e la sicurezza di rete in un laboratorio visuale. La piattaforma collega i sei domini del **CCNA 200-301 v1.1** alle famiglie di attacco e alle relative difese. Distingue gli header realmente presenti dalle funzioni concettuali dei livelli OSI superiori. Tutto è deterministico e lato client: nessun backend, nessuna AI.

## Funzionalità
- **Mappa CCNA** — I sei domini ufficiali, con peso, obiettivi, argomenti e collegamenti alle famiglie di attacco e difesa. È una guida esplorativa senza quiz, voti o simulazione d'esame.
- **Lab Pila OSI** — Scegli un protocollo (HTTP, HTTPS, DNS, BGP, SSH, FTP, SMTP) e avvia la simulazione. L'**Ispettore Pacchetto** mostra campi realistici (IP, porte, MAC, flag e sequence number), distinguendo gli header reali dalle funzioni concettuali dei livelli OSI superiori. Velocità regolabile (0.5× / 1× / 2×) e segnali audio.
- **Lab Attacco & Difesa** — ~25 attacchi su tutti i 7 livelli (ARP poisoning, MAC flooding, spoofing IP/BGP, SYN/UDP flood, session hijacking, padding oracle, SQL injection, XSS, avvelenamento cache DNS e altri). Ognuno si svolge come una *kill chain* passo-passo; attiva la difesa per vedere **dove** e **come** viene neutralizzato.
- **Porte & Protocolli** — Esploratore dei range IANA, dei protocolli, degli apparati e delle caratteristiche di sicurezza, senza punteggi o valutazioni.
- **Cybersecurity (IDS/IPS)** — Riferimento sugli apparati difensivi (NIDS/NIPS/HIDS/HIPS/WIDS/WIPS/EDR) e la differenza tra **rilevare** (IDS) e **bloccare** (IPS).
- **Glossario di Rete** — Dizionario ricercabile di termini di rete e sicurezza.

Ogni schermata è disponibile in **italiano e inglese**, commutabile con un click. Le preferenze (lingua, audio, velocità) vengono ricordate tra una sessione e l'altra.

## Stack tecnologico
TypeScript · React 19 · Vite 6 · Tailwind CSS 4 · Zustand (`persist`) · Motion · lucide-react · Web Audio API · Vitest.

## Avvio rapido
Richiede Node.js 18+.
```bash
npm install       # installa le dipendenze
npm run dev       # avvia in sviluppo su http://localhost:3000
npm run build     # build di produzione
npm test          # esegue i test (Vitest)
npm run typecheck # controllo dei tipi TypeScript
```

## Competenze dimostrate
- Sviluppo front-end con **React 19 + TypeScript**, stato centralizzato (Zustand) e netta separazione dati/logica/UI.
- Una **macchina a stati** deterministica per incapsulamento/decapsulamento e logica pura e testabile (`src/lib`).
- **Internazionalizzazione** (IT/EN) senza librerie esterne, con attenzione all'accessibilità (focus, `aria`, riduzione animazioni).
- Igiene ingegneristica: **test unitari**, **CI** (type-check + test + build), nessuna dipendenza morta.
- Solide conoscenze di rete e sicurezza su tutti i 7 livelli OSI.

## Licenza e termini d'uso
Distribuito con [licenza MIT](LICENSE). Il progetto può essere utilizzato,
studiato, modificato e ridistribuito mantenendo l'avviso di copyright e licenza.

---

© Chiara Berti — 2026

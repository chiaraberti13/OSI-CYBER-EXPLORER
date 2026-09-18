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
- **Network Fundamentals Lab** — Esploratore IPv4 e subnetting con rete, broadcast, host, subnet mask, wildcard e rappresentazione binaria; esploratore IPv6 che accetta anche la notazione mista con IPv4 incorporato; confronto TCP/UDP, diagnostica delle interfacce, concetti di switching (learning, forwarding, flooding, aging), fondamenti di virtualizzazione (hypervisor, container, VRF), verifica dei parametri IP sul client per sistema operativo e collegamenti attacco-difesa.
- **Network Access Lab** — Laboratorio su VLAN, trunk 802.1Q, STP/RSTP con metodi short e long di path cost, EtherChannel, principi radio e 802.11, accesso di gestione a dispositivi/AP/WLC e percorso descritto nella GUI del WLC per una WLAN WPA2 PSK, con simulazioni deterministiche e matrice bilingue degli attacchi e delle difese di livello 2.
- **IP Connectivity Lab** — Output `show ip route` annotato, lookup interattivo della routing table, longest-prefix match, rotte statiche, costo e adiacenze OSPFv2, elezione DR/BDR non preemptive osservabile, first-hop redundancy (HSRP/VRRP) e protezione del control plane.
- **IP Services Lab** — DHCP/relay e DNS dal punto di vista del client, NAT/PAT con allocazione delle porte fedele ai range, NTP, SNMPv3, Syslog, QoS e SSH con calcoli interattivi, configurazioni IOS e matrice attacco-difesa.
- **Security Fundamentals Lab** — Valutatore ACL IPv4, AAA, VPN/IPsec, firewall, IDS/IPS, PKI, NAC, confronto da WEP a WPA3 con la sequenza di configurazione WPA2 PSK, sicurezza wireless ed endpoint con hardening IOS e limiti operativi delle difese.
- **Automation & Programmability Lab** — Architetture controller-based, underlay/overlay/fabric, REST/CRUD, JSON, configuration management e AI/ML con sicurezza della pipeline e gestione del blast radius.
- **Catalogo integrato Attacco–Difesa** — Catalogo trasversale ricercabile e filtrabile delle tecniche di rete e cybersecurity. Ogni voce collega il meccanismo dell’attacco a prevenzione, rilevamento, risposta/ripristino e verifica operativa in entrambe le lingue; una matrice dominio × famiglia rende esplicita la copertura e apre direttamente il laboratorio pertinente. Otto playbook evidence-first coprono incidenti Layer 2, wireless, routing, servizi, disponibilità, credenziali, PKI/VPN e automazione.
- **Laboratorio dei percorsi d’attacco** — Otto percorsi multi-fase collegano ricognizione, accesso, propagazione, impatto, segnali osservabili, controlli difensivi e validazione per tutte le famiglie di attacco e i relativi domini CCNA.
- **Laboratorio di hardening delle configurazioni** — Confronti affiancati di configurazioni Cisco IOS/IOS XE mostrano impostazioni deboli e pattern più sicuri per Layer 2, routing, servizi IP, gestione, policy di sicurezza e automazione, con comandi `show`, avvertenze sul change e rollback.
- **Laboratorio di Detection Engineering** — Dodici casi trasversali collegano telemetria, logica comportamentale, correlazione, cause legittime alternative, validazione controllata, prima risposta e limiti analitici per tutte le famiglie di attacco.
- **Laboratorio sicurezza IPv6 e dual-stack** — Otto scenari operativi coprono RA/ND e DHCPv6 rogue, esaurimento della Neighbor Cache, ICMPv6/PMTUD, extension header, frammentazione, tunnel di transizione e parità delle policy IPv4/IPv6, con evidenze, controlli, verifiche ed errori comuni.
- **Laboratorio segmentazione e confini di fiducia** — Otto scenari seguono il percorso dei pacchetti attraverso VLAN, ACL, VRF, management, guest/IoT, traffico east–west, overlay e servizi condivisi, evidenziando enforcement, verifica bidirezionale e limiti architetturali.
- **Laboratorio identità, AAA e fiducia** — Nove catene di fiducia collegano amministrazione TACACS+, RADIUS/802.1X/EAP-TLS, MAB, fallback AAA, PKI, VPN remote access, comandi privilegiati, revoca delle sessioni e lifecycle delle identità a evidenze e verifiche operative.
- **Laboratorio sicurezza del routing e control plane** — Nove scenari coprono fiducia OSPF, redistribuzione, BGP/RPKI, FHRP, uRPF, CoPP, routing dell’host, coerenza RIB/FIB e change sicuri con prove del control plane e del forwarding.
- **Laboratorio sicurezza Wireless e RF** — Nove scenari evidence-led coprono interferenza e jamming, classificazione dei rogue AP, evil twin, PMF, WPA2-Personal, transition mode WPA3, policy Enterprise/RADIUS, trust WLC/CAPWAP e isolamento guest senza confondere associazione e autorizzazione.
- **Laboratorio sicurezza VPN, IPsec e PKI** — Nove scenari seguono negoziazione IKEv2, CHILD_SA e SPI, autenticazione del peer, NAT-T, traffic selector, routing/failover del tunnel, DNS nel remote access, anti-replay/rekey e revoca dei certificati dallo stato del control plane al forwarding protetto.
- **Laboratorio disponibilità, DoS e capacità** — Nove scenari distinguono saturazione del link, backlog TCP, reflection UDP, CPU del control plane, tabelle/broadcast Layer 2, stato neighbor/riassemblaggio IPv6, capacità DNS, stato NAT/firewall e code QoS, collegando ogni risorsa esaurita alla mitigazione locale o upstream.
- **Laboratorio firewall, IDS/IPS e ispezione** — Nove scenari seguono policy ordinata, flussi stateful/asimmetrici, elaborazione NAT, IDS rispetto a IPS inline, tuning delle firme, visibilità del traffico cifrato, evasione dei parser, failure mode HA e logging dall’intento configurato all’enforcement provato.
- **Laboratorio management plane e telemetria** — Nove catene di fiducia coprono OOB rispetto a management VRF, SSH e AAA, SNMPv3, Syslog remoto, tempo attendibile, NETCONF/RESTCONF, esposizione CDP/LLDP, backup di configurazione protetti e blind spot dei collector con verifica end-to-end.
- **Laboratorio sicurezza endpoint e postura** — Nove scenari di lifecycle coprono inventario degli asset, baseline sicure, patching basato sul rischio, salute dei sensori EDR, host firewall, application control, postura NAC continua, privilegi locali e isolamento/riammissione coordinati.
- **Laboratorio sicurezza DNS, web e applicativa** — Nove scenari seguono risoluzione e delega DNS, recursion/rebinding, tunneling e DoH, identità TLS, parsing HTTP tra proxy, injection server-side, controlli browser/sessione e autorizzazione degli oggetti API.
- **Laboratorio email, phishing e human layer** — Nove scenari seguono SPF/DKIM/DMARC, domini lookalike, credential phishing adversary-in-the-middle, allegati malevoli, link/QR e redirect, BEC, OAuth consent, segnalazione dell’utente e recovery coordinato.
- **Laboratorio sicurezza Layer 2 e first-hop** — Nove scenari seguono confine fisico della porta, ruoli edge data/voice, CAM e Port Security, trunk/native VLAN, DHCP Snooping, DAI/IP Source Guard, protezioni STP, coerenza EtherChannel e contenimento controllato.
- **Laboratorio di resilienza e ripristino** — Dodici procedure coprono infrastruttura fisica, Layer 2, gateway, routing, servizi IP, wireless, esaurimento capacità, telemetria, AAA, PKI/VPN, automazione e ransomware, con dipendenze, continuità minima, condizioni di arresto, validazione e rischio residuo.
- **Laboratorio delle evidenze operative** — Output IOS, log, dati di route monitoring e audit di automazione annotati. Separa l’osservazione grezza dall’interpretazione, dalle fonti di correlazione e dai limiti del singolo artefatto.
- **Laboratorio dei controlli difensivi** — Catalogo defense-in-depth organizzato per funzioni preventive, detective, di contenimento, ripristino e compensative, con enforcement, dipendenze, verifica e limiti operativi.
- **Lab Pila OSI** — Scegli un protocollo (HTTP, HTTPS, DNS, BGP, SSH, FTP, SMTP) e avvia la simulazione. L'**Ispettore Pacchetto** mostra campi realistici (IP, porte, MAC, flag e sequence number), distinguendo gli header reali dalle funzioni concettuali dei livelli OSI superiori. Velocità regolabile (0.5× / 1× / 2×) e segnali audio.
- **Lab Attacco & Difesa** — ~25 attacchi su tutti i 7 livelli (ARP poisoning, MAC flooding, spoofing IP/BGP, SYN/UDP flood, session hijacking, padding oracle, SQL injection, XSS, avvelenamento cache DNS e altri). Ognuno si svolge come una *kill chain* passo-passo; attiva la difesa per vedere **dove** e **come** viene neutralizzato.
- **Porte & Protocolli** — Esploratore dei range IANA, dei protocolli, degli apparati e delle caratteristiche di sicurezza, senza punteggi o valutazioni.
- **Cybersecurity (IDS/IPS)** — Riferimento sugli apparati difensivi (NIDS/NIPS/HIDS/HIPS/WIDS/WIPS/EDR) e la differenza tra **rilevare** (IDS) e **bloccare** (IPS).
- **Glossario di Rete** — Dizionario ricercabile di termini di rete e sicurezza.

I laboratori sono raggruppati in quattro menu a tendina — Percorso CCNA, Laboratori interattivi, Sicurezza per area, Operazioni e difesa — ognuno con una descrizione per voce, più una **ricerca rapida** (`Ctrl`/`⌘` + `K`) che filtra tutti i laboratori per nome, protocollo o argomento. Il percorso corrente resta sempre visibile nella barra.

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

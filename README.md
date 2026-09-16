<p align="center"><img src="assets/banner.svg" alt="OSI Cyber Explorer" width="100%"></p>

<p align="center"><a href="README.md">🇬🇧 English</a> · <a href="README.it.md">🇮🇹 Italiano</a></p>

<p align="center">
  <img src="https://github.com/chiaraberti13/OSI-Cyber-Explorer/actions/workflows/ci.yml/badge.svg" alt="CI">
  <img src="https://img.shields.io/badge/status-active-F2C94C?style=flat-square" alt="Active">
  <img src="https://img.shields.io/badge/category-CYBERSECURITY-22D3EE?style=flat-square" alt="Cybersecurity">
  <img src="https://img.shields.io/badge/stack-React%20%2B%20TypeScript-8B949E?style=flat-square" alt="React and TypeScript">
  <img src="https://img.shields.io/badge/licence-MIT-2EA043?style=flat-square" alt="MIT">
</p>

> A bilingual networking and CCNA 200-301 lab for observing data flows, simulating attacks, and understanding the corresponding defenses.

<p align="center"><a href="https://osi-cyber-explorer.vercel.app"><strong>Live demo</strong></a> · <a href="SECURITY.md">Security</a> · <a href="LICENSE">Licence</a></p>

---

## 🇬🇧 English

## Overview
**OSI Cyber Explorer** turns networking, encapsulation, and network security into a visual laboratory. It connects the six **CCNA 200-301 v1.1** domains to attack families and their defenses, while distinguishing real protocol headers from conceptual upper-layer OSI functions. Everything is deterministic and client-side; there is no backend and no AI involved.

## Features
- **CCNA Map** — The six official domains with their weights, objectives, topics, and links to attack and defense families. It is an exploratory guide with no quizzes, scores, or exam simulation.
- **Network Fundamentals Lab** — IPv4 and subnetting explorer with network, broadcast, hosts, subnet mask, wildcard mask, and binary representation; includes TCP/UDP comparison, interface diagnostics, and attack-defense links.
- **Network Access Lab** — VLAN, 802.1Q trunking, STP/RSTP, EtherChannel, and wireless lab with deterministic simulations and a bilingual Layer 2 attack-defense matrix.
- **IP Connectivity Lab** — Interactive routing-table lookup, longest-prefix match, static routes, OSPFv2 cost and adjacencies, DR/BDR election, and control-plane protection.
- **IP Services Lab** — DHCP/relay, DNS, NAT/PAT, NTP, SNMPv3, Syslog, QoS, and SSH with interactive calculations, IOS configurations, and an attack-defense matrix.
- **Security Fundamentals Lab** — IPv4 ACL evaluator, AAA, VPN/IPsec, firewalls, IDS/IPS, PKI, NAC, wireless and endpoint security with IOS hardening and defense limitations.
- **Automation & Programmability Lab** — Controller-based architecture, underlay/overlay/fabric, REST/CRUD, JSON, configuration management, and AI/ML with pipeline security and blast-radius controls.
- **Integrated Attack–Defense Catalog** — A searchable, filterable cross-domain catalog of network and cybersecurity techniques. Each entry connects attack mechanics to prevention, detection, response/recovery, and operational verification in both languages; a domain × family matrix exposes coverage and links directly to the relevant lab. Eight evidence-first response playbooks cover Layer 2, wireless, routing, services, availability, credentials, PKI/VPN, and automation incidents.
- **Operational Evidence Lab** — Annotated IOS outputs, logs, route-monitoring data, and automation audits. It separates raw observations from interpretation, correlation sources, and the limits of each individual artifact.
- **OSI Stack Lab** — Pick a protocol (HTTP, HTTPS, DNS, BGP, SSH, FTP, SMTP) and run the simulation. A live **Packet Inspector** shows realistic fields (IP, ports, MAC addresses, flags, and sequence numbers) while distinguishing real headers from conceptual upper-layer OSI functions. Adjustable playback speed (0.5× / 1× / 2×) and audio cues.
- **Attack & Defense Lab** — ~25 attacks across all 7 layers (ARP poisoning, MAC flooding, IP/BGP spoofing, SYN/UDP floods, session hijacking, padding oracle, SQL injection, XSS, DNS cache poisoning, and more). Each one plays out as a step-by-step *kill chain*; turn the defense on to see exactly **where** and **how** it is neutralized.
- **Ports & Protocols** — Exploratory reference for IANA ranges, protocols, appliances, and security properties, without scores or assessment.
- **Cybersecurity (IDS/IPS)** — Reference on defensive appliances (NIDS/NIPS/HIDS/HIPS/WIDS/WIPS/EDR) and the key difference between **detecting** (IDS) and **blocking** (IPS).
- **Network Glossary** — Searchable dictionary of networking & security terms.

Every screen is available in **Italian and English**, switchable with one click. UI preferences (language, audio, speed) persist across reloads.

## Tech stack
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

## Project structure
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

## Getting started
Requires Node.js 18+.
```bash
npm install      # install dependencies
npm run dev      # start dev server at http://localhost:3000
npm run build    # production build
npm test         # run the test suite (Vitest)
npm run typecheck # TypeScript type-check
```

## What this project demonstrates
- Front-end engineering with **React 19 + TypeScript**, centralized state (Zustand) and a clean data/logic/UI separation.
- A deterministic **encapsulation/decapsulation state machine** and testable, framework-free logic (`src/lib`).
- **Internationalization** (IT/EN) without external libraries, plus accessibility (focus states, `aria` labels, reduced-motion support).
- Engineering hygiene: **unit tests**, **CI** (type-check + test + build), no dead dependencies.
- Solid networking & security domain knowledge across all 7 OSI layers.

## License & terms of use
Released under the [MIT License](LICENSE). You may use, study, modify and
redistribute the project while preserving the copyright and licence notice.

---

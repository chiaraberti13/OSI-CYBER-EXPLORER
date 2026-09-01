<p align="center"><img src="assets/banner.svg" alt="OSI Cyber Explorer" width="100%"></p>

<p align="center"><a href="README.md">🇬🇧 English</a> · <a href="README.it.md">🇮🇹 Italiano</a></p>

<p align="center">
  <img src="https://github.com/chiaraberti13/OSI-Cyber-Explorer/actions/workflows/ci.yml/badge.svg" alt="CI">
  <img src="https://img.shields.io/badge/status-active-F2C94C?style=flat-square" alt="Active">
  <img src="https://img.shields.io/badge/category-CYBERSECURITY-22D3EE?style=flat-square" alt="Cybersecurity">
  <img src="https://img.shields.io/badge/stack-React%20%2B%20TypeScript-8B949E?style=flat-square" alt="React and TypeScript">
  <img src="https://img.shields.io/badge/licence-MIT-2EA043?style=flat-square" alt="MIT">
</p>

> An interactive laboratory for observing data across all seven OSI layers, simulating attacks and validating the corresponding defenses.

<p align="center"><a href="https://osi-cyber-explorer.vercel.app"><strong>Live demo</strong></a> · <a href="SECURITY.md">Security</a> · <a href="LICENSE">Licence</a></p>

---

## 🇬🇧 English

## Overview
**OSI Cyber Explorer** turns two normally abstract topics — **packet encapsulation** and **network security** — into a visual, hands-on laboratory. You watch a packet descend the OSI stack header by header, inject real-world attacks, and toggle the matching defense to see it work. Everything is deterministic and client-side; there is no backend and no AI involved.

## Features
- **OSI Stack Lab** — Pick a protocol (HTTP, DNS, BGP, SSH, FTP, SMTP) and run the simulation. A live **Packet Inspector** shows the headers stacking up (L7 → L1) with realistic fields (IP, ports, MAC, flags, sequence numbers), a colour-coded console logs every step, and the layer panel explains theory, use cases, attacks and defenses. Adjustable playback speed (0.5× / 1× / 2×) and audio cues.
- **Attack & Defense Lab** — ~25 attacks across all 7 layers (ARP poisoning, MAC flooding, IP/BGP spoofing, SYN/UDP floods, session hijacking, padding oracle, SQL injection, XSS, DNS cache poisoning, and more). Each one plays out as a step-by-step *kill chain*; turn the defense on to see exactly **where** and **how** it is neutralized.
- **Ports & Protocols** — Reference for IANA port ranges, protocols, appliances and a port-association trainer.
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

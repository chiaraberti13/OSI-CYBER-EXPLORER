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
- **CCNA Map** — The six official domains with their weights, objectives, topics, and links to attack and defense families. Each domain carries a **checklist of concepts you should be able to explain**: for every entry, where to observe the concept at work in the platform and which mistake reveals it is not yet solid. It is an exploratory guide with no quizzes, scores, or exam simulation: the checklist assigns no score.
- **Path Trace Lab** — Follow one packet across the whole topology and watch each decision in the order it happens: the host's local-or-remote test, ARP or the default gateway, the switch's CAM lookup, the trunk's allowed list and native VLAN, the SVI, the ACL in the direction it is actually applied, the routing decision, and NAT overload. Both directions are traced, so a stateless ACL applied inbound on a single SVI is visibly filtering one direction and not the other.
- **Network Fundamentals Lab** — IPv4 and subnetting explorer with network, broadcast, hosts, subnet mask, wildcard mask, and binary representation; IPv6 explorer that also accepts IPv4-embedded mixed notation; TCP/UDP comparison, interface diagnostics, network components with the decision each one makes and the boundary it creates, topology architectures from two- and three-tier to spine-leaf, WAN and cloud, copper and fibre cabling with T568A/B pinouts and autonegotiation, switching concepts (learning, forwarding, flooding, aging), virtualization fundamentals (hypervisors, containers, VRFs), client-side IP verification per operating system, and attack-defense links. A **VLSM planner** turns one block and a list of host requirements into an addressing plan: it allocates from the largest requirement down — the ordering rule that makes the arithmetic fit — and reports the addresses each subnet wastes, the share of the block consumed, and the first address still free. An **MTU and fragmentation** exercise computes what a tunnel really leaves for the inner packet (GRE, IPsec, GRE over IPsec, VXLAN, PPPoE), splits an oversized packet into fragments whose payloads are multiples of 8 bytes because the fragment offset counts in 8-byte units, and shows the two ways a router refuses instead: ICMP type 3 code 4 when DF is set, ICMPv6 Packet Too Big in IPv6, where routers never fragment at all.
- **Network Access Lab** — VLAN, 802.1Q trunking, STP/RSTP with both short and long path-cost methods, EtherChannel, radio and 802.11 principles, device/AP/WLC management access, and a described WLC GUI walkthrough for a WPA2 PSK WLAN, with deterministic simulations and a bilingual Layer 2 attack-defense matrix. **STP convergence** then runs the real algorithm on a four-switch mesh holding three physical loops: root election on the Bridge ID, cumulative path cost, one root port per non-root switch and one designated port per segment, with the criterion that actually decided each port named explicitly — cost, Bridge ID, or Port ID — and the per-VLAN trees of PVST+ visible by switching VLAN. A **CAM table** exercise replays a frame sequence and labels each decision — forwarding, flooding, filtering — with the reason behind it, covering unknown unicast (flooded, yet not a broadcast), the frame filtered because its destination sits on the ingress port, MAC moves, aging on 300 seconds of *inactivity*, and the VLAN keying that keeps an address known in one VLAN unknown in another. A **Port Security** exercise then shows why the three violation modes are not interchangeable: `protect` drops in complete silence, without even incrementing the violation counter; `restrict` drops, counts and reports; `shutdown` — the default — err-disables the port and takes the legitimate host down with it.
- **IP Connectivity Lab** — Annotated `show ip route` output, interactive routing-table lookup, longest-prefix match, static routes, OSPFv2 cost and adjacencies, a non-preemptive DR/BDR election you can observe, first-hop redundancy (HSRP/VRRP), and control-plane protection. An **SPF exercise** runs Dijkstra over a five-router single-area topology, keeping a set of equal-cost predecessors so equal-cost multipath is visible rather than arbitrary: two paths tie at the default reference bandwidth, one of them is ten times faster, and raising `auto-cost reference-bandwidth` removes the tie and picks the fast link. Links can be failed to watch the tree reconverge and routers fall out of reach.
- **IP Services Lab** — DHCP/relay and DNS from the client's point of view, NAT/PAT with range-accurate port allocation, NTP, SNMPv3, Syslog, QoS, and SSH with interactive calculations, IOS configurations, and an attack-defense matrix. A **DORA exercise** walks the exchange message by message with addresses, UDP ports and the `giaddr` field, explaining why the REQUEST is broadcast again after the client has already chosen its server, and reproducing the ways the exchange fails while looking configured: a missing `ip helper-address`, an exhausted pool, DHCP snooping dropping a server message on an untrusted port, and Option 82 arriving with `giaddr` at zero.
- **Security Fundamentals Lab** — IPv4 ACL evaluator, AAA, VPN/IPsec, firewalls, IDS/IPS, PKI, NAC, WEP-to-WPA3 comparison with a WPA2 PSK deployment sequence, wireless and endpoint security with IOS hardening and defense limitations. A **reverse wildcard** builder works in the direction requirements actually arrive in: give it a range of addresses and it produces the ACE, saying whether one wildcard covers the range exactly or how many extra addresses it drags in. An **ACL builder** turns requirements into an ordered list and then performs the analysis nobody does by hand, comparing the bits each wildcard forces to match: it separates an *active* line from a *dead* one (covered by an earlier line that decides the opposite — the reason an apparently configured deny blocks nothing) and from a merely *redundant* one, proposes an order in which none is dead, and fires a test packet through the result.
- **Automation & Programmability Lab** — Controller-based architecture, underlay/overlay/fabric, REST/CRUD, JSON, configuration management, and AI/ML with pipeline security and blast-radius controls.
- **Integrated Attack–Defense Catalog** — A searchable, filterable cross-domain catalog of network and cybersecurity techniques. Each entry connects attack mechanics to prevention, detection, response/recovery, and operational verification in both languages; a domain × family matrix exposes coverage and links directly to the relevant lab. Eight evidence-first response playbooks cover Layer 2, wireless, routing, services, availability, credentials, PKI/VPN, and automation incidents.
- **Attack Paths Lab** — Eight multi-stage paths connect reconnaissance, access, propagation, impact, observable signals, defensive controls, and validation across every attack family and the related CCNA domains.
- **Configuration Hardening Lab** — Side-by-side Cisco IOS/IOS XE configurations expose insecure defaults and safer patterns for Layer 2, routing, IP services, management, security policy, and automation, including `show` verification, change warnings, and rollback commands.
- **Detection Engineering Lab** — Twelve cross-domain use cases connect telemetry, behavioral logic, correlation, legitimate alternative causes, controlled validation, first response, and analytical limitations across every attack family.
- **Resilience & Recovery Lab** — Twelve recovery procedures cover physical infrastructure, Layer 2, gateways, routing, IP services, wireless, capacity exhaustion, telemetry, AAA, PKI/VPN, automation, and ransomware, with dependencies, minimum continuity, stop conditions, validation, and residual risk.
- **IPv6 & Dual-Stack Security Lab** — Eight operational scenarios cover rogue RA/ND and DHCPv6, Neighbor Cache exhaustion, ICMPv6/PMTUD, extension headers, fragmentation, transition tunnels, and IPv4/IPv6 policy parity, with evidence, controls, verification, and common pitfalls.
- **Segmentation & Trust Boundaries Lab** — Eight packet-path scenarios explain where VLAN, ACL, VRF, management, guest/IoT, east–west, overlay, and shared-service boundaries actually enforce policy, including bidirectional verification and architectural limitations.
- **Identity, AAA & Trust Lab** — Nine trust-flow scenarios connect TACACS+ device administration, RADIUS/802.1X/EAP-TLS, MAB, AAA fallback, PKI, remote-access VPN, privileged commands, session revocation, and identity lifecycle to evidence and operational verification.
- **Routing & Control-Plane Security Lab** — Nine operational scenarios cover OSPF trust, redistribution, BGP/RPKI, FHRP, uRPF, CoPP, host routing, RIB/FIB consistency, and safe routing changes with control-plane and forwarding proof.
- **Wireless & RF Security Lab** — Nine evidence-led scenarios cover interference and jamming, rogue AP classification, evil twins, PMF, WPA2-Personal, WPA3 transition mode, Enterprise/RADIUS policy, WLC/CAPWAP trust, and guest isolation without confusing association with authorization.
- **VPN, IPsec & PKI Security Lab** — Nine scenarios trace IKEv2 negotiation, CHILD SAs and SPIs, peer authentication, NAT-T, traffic selectors, tunnel routing/failover, remote-access DNS, anti-replay/rekeying, and certificate revocation from control-plane state to protected forwarding.
- **Availability, DoS & Capacity Lab** — Nine scenarios distinguish link saturation, TCP backlog, UDP reflection, control-plane CPU, Layer 2 tables/broadcasts, IPv6 neighbor/reassembly state, DNS capacity, NAT/firewall state, and QoS queues, matching each exhausted resource to local or upstream mitigation.
- **Firewall, IDS/IPS & Inspection Lab** — Nine scenarios trace ordered policy, stateful/asymmetric flows, NAT processing, IDS versus inline IPS, signature tuning, encrypted-traffic visibility, parser evasion, HA failure modes, and logging from configured intent to proven enforcement.
- **Management Plane & Telemetry Lab** — Nine trust-chain scenarios cover OOB versus management VRFs, SSH and AAA, SNMPv3, remote Syslog, trusted time, NETCONF/RESTCONF, CDP/LLDP exposure, protected configuration backups, and collector blind spots with end-to-end verification.
- **Endpoint Security & Posture Lab** — Nine lifecycle scenarios cover asset inventory, secure baselines, risk-based patching, EDR sensor health, host firewalls, application control, continuous NAC posture, local privileges, and coordinated isolation/readmission.
- **DNS, Web & Application Security Lab** — Nine request-path scenarios cover DNS resolution and delegation, recursion/rebinding, tunneling and DoH, TLS identity, HTTP proxy parsing, server-side injection, browser origin/session controls, and API object authorization.
- **Email, Phishing & Human-Layer Security Lab** — Nine delivery-chain scenarios cover SPF/DKIM/DMARC, lookalike domains, adversary-in-the-middle credential phishing, malicious attachments, links/QR redirects, BEC, OAuth consent, user reporting, and coordinated recovery.
- **Layer 2 & First-Hop Security Lab** — Nine frame-path scenarios cover the physical port boundary, data/voice edge roles, CAM and Port Security, trunks/native VLANs, DHCP Snooping, DAI/IP Source Guard, STP protections, EtherChannel consistency, and controlled containment.
- **Operational Evidence Lab** — Annotated IOS outputs, logs, route-monitoring data, and automation audits. It separates raw observations from interpretation, correlation sources, and the limits of each individual artifact.
- **Defensive Controls Lab** — Defense-in-depth catalog organized by preventive, detective, containment, recovery, and compensating functions, including enforcement points, dependencies, verification, and operational limitations.
- **OSI Stack Lab** — Pick a protocol (HTTP, HTTPS, DNS, BGP, SSH, FTP, SMTP) and run the simulation. A live **Packet Inspector** shows realistic fields (IP, ports, MAC addresses, flags, and sequence numbers) while distinguishing real headers from conceptual upper-layer OSI functions. Adjustable playback speed (0.5× / 1× / 2×) and audio cues.
- **Attack & Defense Lab** — ~25 attacks across all 7 layers (ARP poisoning, MAC flooding, IP/BGP spoofing, SYN/UDP floods, session hijacking, padding oracle, SQL injection, XSS, DNS cache poisoning, and more). Each one plays out as a step-by-step *kill chain*; turn the defense on to see exactly **where** and **how** it is neutralized.
- **Ports & Protocols** — Exploratory reference for IANA ranges, protocols, appliances, and security properties, without scores or assessment.
- **Cybersecurity (IDS/IPS)** — Reference on defensive appliances (NIDS/NIPS/HIDS/HIPS/WIDS/WIPS/EDR) and the key difference between **detecting** (IDS) and **blocking** (IPS).
- **Network Glossary** — Searchable dictionary of networking & security terms.

The labs are grouped into four dropdown menus — CCNA path, Interactive labs, Security by area, Operations and defense — each entry carrying a one-line description, plus a **quick search** (`Ctrl`/`⌘` + `K`) that filters every lab by name, protocol, or topic. The current location stays visible in the bar.

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
├─ components/     UI components (OsiStack, PacketSimulator, PathTraceLab,
│                  StpConvergenceLab, VlsmPlanner, AttackLab, LayerDetails, …)
├─ content/        Bilingual educational data, one module per dataset (OSI layers,
│                  attack scenarios, walkthroughs, glossary, CCNA domains, topologies)
├─ lib/            Pure, unit-tested logic (ipv4, ipv6, mtu, camTable, stp, ospfTopology,
│                  aclBuilder, portSecurity, dhcpFlow, pathTrace, navigation, …) + tests
├─ utils/          Web Audio synth
├─ store.ts        Global state (Zustand)
├─ types.ts        Shared type contracts
└─ App.tsx
```
Content (`src/content/`) is kept separate from logic (`src/lib/`) and UI, so adding an attack or a layer means editing data, not code. Each dataset is its own module, so a lab downloads only the content it actually uses.

## Getting started
Requires Node.js 22.22.2+ or 24.15+ (24 LTS recommended, see `.nvmrc`) and npm.
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
- **Responsive layout** verified at 390 px and 768 px: no horizontal page scrolling, comparison tables that become cards on narrow screens, and CLI output kept monospaced inside its own scroll area.
- Engineering hygiene: **unit tests**, **CI** (type-check + test + build), no dead dependencies.
- Solid networking & security domain knowledge across all 7 OSI layers.

## License & terms of use
Released under the [MIT License](LICENSE). You may use, study, modify and
redistribute the project while preserving the copyright and licence notice.

---

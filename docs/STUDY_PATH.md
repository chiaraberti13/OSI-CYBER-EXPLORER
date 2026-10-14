# Study path · Percorso di studio (EDU-30)

A recommended order for studying the manual toward its two objectives — **CCNA 200-301**
(networking and baseline security) and **eJPT — INE/eLearnSecurity Junior Penetration Tester**
(offensive methodology, taught defensively) — with the explicit prerequisites that tie the
offensive track back to the networking foundation.

## English

### Principle

The offensive track is studied **last and never first**: a penetration test is reasoning about a
network, so you cannot assess what you cannot read. The path therefore builds the CCNA networking
and defensive foundation, then layers the eJPT methodology on top, with each eJPT chapter declaring
the CCNA chapters it depends on. Everything stays teaching-first, authorization-first, and paired
with the defense that stops or reveals each technique.

### Phase A — Networking foundations (CCNA core)

1. The OSI model and encapsulation
2. Ethernet, switching, and the CAM table
3. IPv4 addressing and subnetting (VLSM)
4. VLANs, 802.1Q trunks, and Spanning Tree
5. IP routing: static routes and OSPF
6. IP services: DHCP, DNS, and NAT

### Phase B — Security foundations (CCNA security and defenses)

7. Security fundamentals (CIA triad, threat/vulnerability/risk, defense in depth)
8. Attacks by OSI layer and the kill chain
9. Network defenses (ACLs, stateful firewalls, IDS/IPS, segmentation, Zero Trust)
10. CCNA security configuration (AAA, VPN, Layer 2 hardening)

### Phase C — Advanced and extension topics

10. Network components and architectures
11. IPv6 addressing, SLAAC, and dual-stack
12. Network access: discovery, EtherChannel, and wireless
13. Extended IP services and gateway redundancy
14. Automation and programmability
15. Cryptography, VPN/IPsec, PKI, and TLS
16. Advanced identity and AAA (802.1X, EAP-TLS, NAC)
17. Hardening, detection, and incident response

### Phase D — Offensive methodology (eJPT)

19. Penetration testing methodology (engagement, reconnaissance, scanning/enumeration)
20. Web application penetration testing (HTTP/proxy, injection classes, auth/session/access control)
21. Exploitation and post-exploitation (exploitation, privilege escalation, lateral movement)

### Cross-track prerequisites

Each eJPT chapter builds on specific CCNA chapters; study those first.

| eJPT chapter                             | Depends on (study first)                                           |
| ---------------------------------------- | ------------------------------------------------------------------ |
| 19 · Penetration testing methodology     | 8 (attacks and the kill chain), 6 (IP services), Ports & protocols |
| 20 · Web application penetration testing | 6/16 (application layer and TLS), 14 (AAA), 19 (methodology)       |
| 21 · Exploitation and post-exploitation  | 19 (methodology), 20 (web), 9 (network defenses), 14 (AAA)         |

The reverse holds too: each eJPT technique is paired with the CCNA defense that contains it —
segmentation and Zero Trust against lateral movement, least privilege against post-exploitation,
patching and IPS against exploitation, parameterized queries and output encoding against injection.

## Italiano

### Principio

Il percorso offensivo si studia **per ultimo e mai per primo**: un penetration test è ragionare su
una rete, e non si può valutare ciò che non si sa leggere. Il percorso costruisce quindi le
fondamenta di networking e di difesa del CCNA, poi vi sovrappone la metodologia eJPT, con ogni
capitolo eJPT che dichiara i capitoli CCNA da cui dipende. Tutto resta didattico,
autorizzazione-first e accoppiato alla difesa che ferma o rivela ciascuna tecnica.

### Fase A — Fondamenti di rete (CCNA core)

1. Il modello OSI e l'incapsulamento
2. Ethernet, switching e tabella CAM
3. Indirizzamento IPv4 e subnetting (VLSM)
4. VLAN, trunk 802.1Q e Spanning Tree
5. Routing IP: rotte statiche e OSPF
6. Servizi IP: DHCP, DNS e NAT

### Fase B — Fondamenti di sicurezza (sicurezza CCNA e difese)

7. Fondamenti di sicurezza (triade CIA, minaccia/vulnerabilità/rischio, difesa in profondità)
8. Attacchi per livello OSI e kill chain
9. Difese di rete (ACL, firewall stateful, IDS/IPS, segmentazione, Zero Trust)
10. Configurazione di sicurezza CCNA (AAA, VPN, hardening di livello 2)

### Fase C — Approfondimenti ed estensione

10. Componenti e architetture di rete
11. Indirizzamento IPv6, SLAAC e dual-stack
12. Accesso alla rete: scoperta, EtherChannel e wireless
13. Servizi IP estesi e ridondanza del gateway
14. Automazione e programmabilità
15. Crittografia, VPN/IPsec, PKI e TLS
16. Identità avanzata e AAA (802.1X, EAP-TLS, NAC)
17. Hardening, detection e risposta agli incidenti

### Fase D — Metodologia offensiva (eJPT)

19. Metodologia di penetration testing (ingaggio, ricognizione, scanning/enumerazione)
20. Penetration testing delle applicazioni web (HTTP/proxy, classi di injection, autenticazione/sessione/accessi)
21. Exploitation e post-exploitation (exploitation, escalation dei privilegi, movimento laterale)

### Prerequisiti tra i percorsi

Ogni capitolo eJPT si fonda su capitoli CCNA specifici: studia prima quelli.

| Capitolo eJPT                           | Dipende da (studiare prima)                                   |
| --------------------------------------- | ------------------------------------------------------------- |
| 19 · Metodologia di penetration testing | 8 (attacchi e kill chain), 6 (servizi IP), Porte & Protocolli |
| 20 · Penetration testing delle app web  | 6/16 (livello applicativo e TLS), 14 (AAA), 19 (metodologia)  |
| 21 · Exploitation e post-exploitation   | 19 (metodologia), 20 (web), 9 (difese di rete), 14 (AAA)      |

Vale anche l'inverso: ogni tecnica eJPT è accoppiata alla difesa CCNA che la contiene —
segmentazione e Zero Trust contro il movimento laterale, minimo privilegio contro la
post-exploitation, patching e IPS contro l'exploitation, query parametrizzate e codifica in uscita
contro le injection.

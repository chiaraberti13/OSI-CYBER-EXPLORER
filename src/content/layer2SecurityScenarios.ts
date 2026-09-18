import type { Bilingual } from '../types';
import type { CcnaDomainId } from './securityCoverage';
import type { SecurityPlane } from './securityTaxonomy';

export type Layer2SecurityArea = 'physical' | 'edge-port' | 'cam' | 'trunk' | 'dhcp' | 'arp' | 'stp' | 'etherchannel' | 'containment';

export interface Layer2SecurityScenario {
  id: string;
  area: Layer2SecurityArea;
  domains: CcnaDomainId[];
  planes: SecurityPlane[];
  techniqueIds: string[];
  controlIds: string[];
  title: Bilingual;
  framePath: Bilingual[];
  threat: Bilingual;
  evidence: Bilingual[];
  controls: Bilingual[];
  verification: Bilingual[];
  caveat: Bilingual;
}

const b = (it: string, en: string): Bilingual => ({ it, en });

export const LAYER2_SECURITY_SCENARIOS: Layer2SecurityScenario[] = [
  {
    id: 'physical-port-boundary', area: 'physical', domains: ['network-fundamentals', 'network-access', 'security-fundamentals'], planes: ['physical', 'data'], techniqueIds: ['physical-tapping', 'rogue-device'], controlIds: ['physical-media-hardening', 'layer2-first-hop-assurance'],
    title: b('Presa, cablaggio e confine fisico', 'Outlets, cabling, and the physical boundary'),
    framePath: [b('La presa e il patch panel collegano un endpoint a una porta switch identificata e inventariata.', 'The outlet and patch panel connect an endpoint to an identified, inventoried switch port.'), b('Link state, transceiver e contatori trasformano il mezzo fisico in una sessione di rete osservabile.', 'Link state, transceivers, and counters turn the physical medium into an observable network session.')],
    threat: b('Accesso a porte, rame o fibra consente collegamento rogue, bridge, TAP o interruzione prima dei controlli logici.', 'Access to ports, copper, or fiber enables rogue connections, bridges, taps, or disruption before logical controls.'),
    evidence: [b('Mappa presa–patch–porta, link transition, MAC/LLDP/NAC e contatori fisici.', 'Outlet-to-patch-to-port mapping, link transitions, MAC/LLDP/NAC data, and physical counters.'), b('Ispezione, tamper evidence, DOM/transceiver e variazioni di potenza ottica quando supportate.', 'Inspection, tamper evidence, DOM/transceiver data, and optical-power changes where supported.')],
    controls: [b('Armadi e patch panel protetti, porte inutilizzate shutdown e cablaggio inventariato.', 'Protected racks and patch panels, shutdown unused ports, and inventoried cabling.'), b('802.1X/EAP-TLS, Port Security e cifratura end-to-end per il contenuto sensibile.', '802.1X/EAP-TLS, Port Security, and end-to-end encryption for sensitive content.')],
    verification: [b('Collega un endpoint controllato a una porta inattiva e conferma shutdown o autorizzazione prevista.', 'Connect a controlled endpoint to an inactive port and confirm the intended shutdown or authorization behavior.'), b('Segui fisicamente e logicamente un link campione dalla presa alla sessione NAC.', 'Trace a sample link physically and logically from the outlet to the NAC session.')],
    caveat: b('La sicurezza fisica riduce accesso al mezzo, ma non protegge da sola il contenuto che transita su infrastruttura autorizzata.', 'Physical security reduces access to the medium but does not by itself protect content traversing authorized infrastructure.')
  },
  {
    id: 'access-port-role', area: 'edge-port', domains: ['network-access', 'security-fundamentals'], planes: ['data', 'identity'], techniqueIds: ['rogue-device', 'voice-vlan-device-spoofing'], controlIds: ['dot1x-nac', 'layer2-first-hop-assurance'],
    title: b('Ruolo della porta, data VLAN e voice VLAN', 'Port roles, data VLANs, and voice VLANs'),
    framePath: [b('La porta edge applica modalità access, VLAN dati/voce, autenticazione e limiti per il ruolo atteso.', 'The edge port applies access mode, data/voice VLANs, authentication, and limits for the expected role.'), b('Telefono e workstation possono condividere la porta con identità e policy distinte.', 'A phone and workstation may share the port with distinct identities and policies.')],
    threat: b('Spoofing del profilo telefonico, multi-host permissivo o VLAN errata concede una policy più fidata a un device rogue.', 'Phone-profile spoofing, permissive multi-host mode, or the wrong VLAN grants a more trusted policy to a rogue device.'),
    evidence: [b('Switchport mode/VLAN, authentication host mode, sessioni per MAC e device profiling.', 'Switchport mode/VLAN, authentication host mode, per-MAC sessions, and device profiling.'), b('LLDP-MED/CDP voice TLV, OUI, DHCP fingerprint e comportamento reale del device.', 'LLDP-MED/CDP voice TLVs, OUIs, DHCP fingerprints, and actual device behavior.')],
    controls: [b('Modalità access esplicita, 802.1X multi-domain dove richiesto e MAB solo come fallback limitato.', 'Explicit access mode, multi-domain 802.1X where required, and MAB only as a restricted fallback.'), b('Policy voice minima, profiling correlato e dACL/SGT coerenti con identità e ruolo.', 'Minimal voice policy, correlated profiling, and dACLs/SGTs consistent with identity and role.')],
    verification: [b('Prova telefono, workstation e device sconosciuto, confermando sessioni e reachability distinte.', 'Test a phone, workstation, and unknown device while confirming distinct sessions and reachability.'), b('Rimuovi il telefono e verifica che il client non erediti la policy voice.', 'Remove the phone and verify the client does not inherit the voice policy.')],
    caveat: b('OUI e profiling descrivono somiglianza, non identità crittografica; non devono sostituire EAP-TLS.', 'OUIs and profiling describe similarity, not cryptographic identity; they must not replace EAP-TLS.')
  },
  {
    id: 'cam-port-security', area: 'cam', domains: ['network-access'], planes: ['data'], techniqueIds: ['mac-flooding', 'rogue-device'], controlIds: ['layer2-first-hop-assurance', 'availability-capacity-protection'],
    title: b('CAM table, Port Security e MAC churn', 'CAM tables, Port Security, and MAC churn'),
    framePath: [b('Lo switch apprende il MAC sorgente sulla porta/VLAN e inoltra usando la CAM table.', 'The switch learns source MAC addresses by port/VLAN and forwards using the CAM table.'), b('Port Security limita quantità, modalità di apprendimento e azione alla violazione.', 'Port Security limits quantity, learning mode, and the violation action.')],
    threat: b('Molti MAC o spostamenti rapidi consumano CAM state, provocano violation o unknown-unicast flooding.', 'Many MAC addresses or rapid moves consume CAM state, trigger violations, or cause unknown-unicast flooding.'),
    evidence: [b('MAC count, dynamic/static/sticky entry, move/flap e age timer per VLAN/porta.', 'MAC counts, dynamic/static/sticky entries, moves/flaps, and age timers by VLAN/port.'), b('Port-security status, violation counter/action e unknown-unicast rate.', 'Port-security status, violation counters/actions, and unknown-unicast rates.')],
    controls: [b('Limite MAC coerente con telefono/AP/hypervisor, sticky governato e aging calibrato.', 'MAC limits consistent with phones/APs/hypervisors, governed sticky learning, and calibrated aging.'), b('Violation mode scelto per rischio, alert e procedura di err-disable recovery.', 'Risk-based violation modes, alerting, and an err-disable recovery procedure.')],
    verification: [b('Aggiungi MAC controllati fino al limite e osserva action, contatori e traffico legittimo.', 'Add controlled MAC addresses up to the limit and observe the action, counters, and legitimate traffic.'), b('Conferma che sticky/configuration persistence sia coerente dopo reload e sostituzione autorizzata.', 'Confirm sticky/configuration persistence remains correct after reload and authorized replacement.')],
    caveat: b('Un limite MAC troppo basso causa outage legittimi; uno troppo alto non contiene il flooding e il MAC resta falsificabile.', 'A MAC limit that is too low causes legitimate outages; one that is too high does not contain flooding, and MAC addresses remain spoofable.')
  },
  {
    id: 'trunk-native-vlan-boundary', area: 'trunk', domains: ['network-access'], planes: ['data'], techniqueIds: ['vlan-switch-spoofing', 'vlan-double-tagging'], controlIds: ['layer2-first-hop-assurance', 'segmentation-least-reachability'],
    title: b('Trunk, DTP, native VLAN e allowed list', 'Trunks, DTP, native VLANs, and allowed lists'),
    framePath: [b('La porta stabilisce staticamente ruolo access/trunk e incapsula solo le VLAN previste.', 'The port statically establishes access/trunk role and encapsulates only intended VLANs.'), b('Native VLAN e allowed list determinano trattamento dei frame untagged e domini trasportati.', 'The native VLAN and allowed list determine handling of untagged frames and transported domains.')],
    threat: b('DTP su porte utente, native VLAN usata o allowed list ampia abilitano switch spoofing, double tagging e propagazione eccessiva.', 'DTP on user ports, an active native VLAN, or broad allowed lists enable switch spoofing, double tagging, and excessive propagation.'),
    evidence: [b('Operational/admin mode, negotiation, encapsulation, native VLAN e allowed/active VLAN.', 'Operational/admin mode, negotiation, encapsulation, native VLAN, and allowed/active VLANs.'), b('Frame tag/untagged su capture, trunk inattesi e VLAN ricevute sul peer.', 'Tagged/untagged frames in captures, unexpected trunks, and VLANs received by the peer.')],
    controls: [b('Access statico + nonegotiate sugli edge; trunk statici solo sui link previsti.', 'Static access plus nonegotiate on edges; static trunks only on intended links.'), b('Native VLAN dedicata/inutilizzata, pruning esplicito e tagging native dove supportato.', 'Dedicated/unused native VLANs, explicit pruning, and native tagging where supported.')],
    verification: [b('Confronta entrambi i lati del trunk e prova VLAN consentita e non consentita.', 'Compare both sides of the trunk and test an allowed and disallowed VLAN.'), b('Invia un frame controllato untagged e conferma il trattamento previsto senza coinvolgere reti produttive.', 'Send a controlled untagged frame and confirm intended handling without involving production networks.')],
    caveat: b('Cambiare native VLAN su un solo lato può creare leak o disservizio; il change deve essere coordinato e verificato su entrambi i peer.', 'Changing the native VLAN on one side can create leaks or outages; the change must be coordinated and verified on both peers.')
  },
  {
    id: 'dhcp-snooping-boundary', area: 'dhcp', domains: ['network-access', 'ip-services'], planes: ['data', 'application'], techniqueIds: ['rogue-dhcp', 'dhcp-starvation', 'dhcp-snooping-trust-abuse'], controlIds: ['l2-first-hop-security', 'layer2-first-hop-assurance'],
    title: b('DHCP Snooping, trust e binding', 'DHCP Snooping, trust, and bindings'),
    framePath: [b('Discover/Request entra da una porta untrusted e raggiunge server o relay attraverso uplink trusted.', 'Discover/Request enters an untrusted port and reaches the server or relay through trusted uplinks.'), b('Offer/ACK è accettato solo dal lato fidato e costruisce un binding VLAN–MAC–IP–porta–lease.', 'Offer/ACK is accepted only from the trusted side and builds a VLAN-MAC-IP-port-lease binding.')],
    threat: b('Trust sulla porta sbagliata consente rogue DHCP; richieste ad alta velocità esauriscono lease o risorse dello switch.', 'Trust on the wrong port permits rogue DHCP; high-rate requests exhaust leases or switch resources.'),
    evidence: [b('Trusted/untrusted state, rate/drop counters, Option 82 e binding con lease residuo.', 'Trusted/untrusted state, rate/drop counters, Option 82, and bindings with remaining lease time.'), b('Offer/ACK source port, server identifier e confronto con server/relay inventariati.', 'Offer/ACK source port, server identifier, and comparison with inventoried servers/relays.')],
    controls: [b('Trust solo verso server/relay legittimi, rate limit sugli edge e VLAN abilitate esplicitamente.', 'Trust only toward legitimate servers/relays, edge rate limits, and explicitly enabled VLANs.'), b('Database binding protetto e coerente, Option 82 governata e Port Security complementare.', 'Protected consistent binding databases, governed Option 82, and complementary Port Security.')],
    verification: [b('Invia Offer benigno da una porta client e conferma drop; rinnova un client legittimo e verifica il binding.', 'Send a benign Offer from a client port and confirm it drops; renew a legitimate client and verify the binding.'), b('Esegui un burst controllato sotto/sopra soglia e osserva rate limit senza err-disable inatteso.', 'Run a controlled burst below/above threshold and observe rate limiting without unexpected err-disable.')],
    caveat: b('DHCP Snooping non protegge host con IP statico automaticamente e un trust errato può annullare l’intero confine.', 'DHCP Snooping does not automatically protect statically addressed hosts, and incorrect trust can nullify the entire boundary.')
  },
  {
    id: 'dai-source-binding', area: 'arp', domains: ['network-access'], planes: ['data'], techniqueIds: ['arp-poisoning', 'dhcp-snooping-trust-abuse'], controlIds: ['l2-first-hop-security', 'layer2-first-hop-assurance'],
    title: b('DAI, IP Source Guard e host statici', 'DAI, IP Source Guard, and static hosts'),
    framePath: [b('DAI confronta i messaggi ARP su porte untrusted con binding DHCP Snooping o ARP ACL.', 'DAI checks ARP messages on untrusted ports against DHCP Snooping bindings or ARP ACLs.'), b('IP Source Guard limita sorgenti IP/MAC ammesse sulla porta usando binding affidabili.', 'IP Source Guard restricts allowed IP/MAC sources on the port using trusted bindings.')],
    threat: b('ARP falsi o IP spoofing intercettano traffico; binding assente o uplink trusted eccessivo crea bypass o drop legittimi.', 'Forged ARP or IP spoofing intercepts traffic; missing bindings or excessive trusted uplinks create bypasses or legitimate drops.'),
    evidence: [b('Binding, ARP ACL, validation checks, DAI drop/forward e source-guard filter.', 'Bindings, ARP ACLs, validation checks, DAI drop/forward counters, and source-guard filters.'), b('ARP cache di gateway/client, MAC table e capture del messaggio scartato.', 'Gateway/client ARP caches, MAC tables, and captures of the dropped message.')],
    controls: [b('DAI e IP Source Guard sulle VLAN/porte corrette, rate calibrato e validation coerente.', 'DAI and IP Source Guard on correct VLANs/ports, calibrated rates, and consistent validation.'), b('ARP ACL o static binding governati per host statici, infrastruttura e device speciali.', 'Governed ARP ACLs or static bindings for static hosts, infrastructure, and special devices.')],
    verification: [b('Genera ARP benigno incoerente da porta test e conferma drop senza modificare cache legittime.', 'Generate a benign inconsistent ARP from a test port and confirm it drops without changing legitimate caches.'), b('Prova un host DHCP e uno statico autorizzato verificando binding, ACL e reachability.', 'Test an authorized DHCP host and static host while verifying bindings, ACLs, and reachability.')],
    caveat: b('DAI dipende dalla qualità dei binding: una sorgente di verità errata trasforma la difesa in bypass o indisponibilità.', 'DAI depends on binding quality: a wrong source of truth turns the defense into a bypass or outage.')
  },
  {
    id: 'stp-control-boundary', area: 'stp', domains: ['network-access'], planes: ['control', 'data'], techniqueIds: ['stp-manipulation', 'l2-broadcast-storm'], controlIds: ['stp-edge-protection', 'layer2-first-hop-assurance'],
    title: b('STP root, BPDU Guard, Root Guard e Loop Guard', 'STP roots, BPDU Guard, Root Guard, and Loop Guard'),
    framePath: [b('Bridge ID e path cost eleggono root e ruoli; RSTP porta i link verso forwarding o alternate/discarding.', 'Bridge IDs and path costs elect the root and roles; RSTP moves links toward forwarding or alternate/discarding states.'), b('Le protezioni dipendono dal ruolo: edge, uplink verso accesso, percorso ridondante o link unidirezionale.', 'Protections depend on role: edge, access-facing uplink, redundant path, or unidirectional link.')],
    threat: b('BPDU superiori, BPDU inattese o perdita unidirezionale alterano root/ruoli, provocano intercettazione, loop o storm.', 'Superior or unexpected BPDUs and unidirectional loss alter roots/roles, causing interception, loops, or storms.'),
    evidence: [b('Root/bridge ID, port role/state/cost, BPDU counters e topology change history.', 'Root/bridge IDs, port roles/states/costs, BPDU counters, and topology-change history.'), b('Err-disable/inconsistent reason, MAC flapping, broadcast rate e CPU.', 'Err-disable/inconsistent reasons, MAC flapping, broadcast rates, and CPU use.')],
    controls: [b('Root primario/secondario deterministici, BPDU Guard sugli edge e Root Guard verso accesso.', 'Deterministic primary/secondary roots, BPDU Guard on edges, and Root Guard toward access.'), b('Loop Guard/UDLD secondo mezzo e ruolo, storm control calibrato come contenimento.', 'Loop Guard/UDLD according to medium and role, with calibrated storm control as containment.')],
    verification: [b('Invia una BPDU di test su edge isolato e conferma la reazione senza impattare la topologia.', 'Send a test BPDU on an isolated edge and confirm the response without affecting topology.'), b('Confronta root e ruoli previsti su ogni VLAN/istanza prima e dopo un failover controllato.', 'Compare intended roots and roles for each VLAN/instance before and after a controlled failover.')],
    caveat: b('BPDU Guard, Root Guard e Loop Guard non sono intercambiabili: applicarli al ruolo sbagliato può causare outage.', 'BPDU Guard, Root Guard, and Loop Guard are not interchangeable; applying them to the wrong role may cause an outage.')
  },
  {
    id: 'etherchannel-consistency', area: 'etherchannel', domains: ['network-access'], planes: ['data', 'control'], techniqueIds: ['etherchannel-member-mismatch', 'l2-broadcast-storm'], controlIds: ['layer2-first-hop-assurance', 'stp-edge-protection'],
    title: b('EtherChannel, LACP e coerenza dei member', 'EtherChannel, LACP, and member consistency'),
    framePath: [b('LACP negozia system/port ID e aggrega solo member compatibili nel port-channel logico.', 'LACP negotiates system/port IDs and bundles only compatible members into the logical port channel.'), b('STP e forwarding vedono il port-channel, mentre hashing distribuisce i flussi sui link attivi.', 'STP and forwarding see the port channel while hashing distributes flows across active links.')],
    threat: b('Mode on, peer errato o mismatch di trunk/VLAN/speed crea member sospesi, traffico unidirezionale, loop o black hole.', 'Static on mode, the wrong peer, or trunk/VLAN/speed mismatches create suspended members, one-way traffic, loops, or black holes.'),
    evidence: [b('Protocol/mode, actor/partner ID, bundled/suspended/individual state e consistency reason.', 'Protocol/mode, actor/partner IDs, bundled/suspended/individual states, and consistency reasons.'), b('Port-channel trunk/VLAN, STP state, member counters e distribuzione dei flussi.', 'Port-channel trunk/VLAN data, STP state, member counters, and flow distribution.')],
    controls: [b('LACP active/passive secondo design, min-links e peer identity verificata.', 'LACP active/passive according to design, minimum links, and verified peer identity.'), b('Configurazione sul port-channel, template coerenti e change coordinato dei member.', 'Configuration on the port channel, consistent templates, and coordinated member changes.')],
    verification: [b('Rimuovi un member in modo controllato e conferma capacità, STP e sessioni senza loop.', 'Controlledly remove a member and confirm capacity, STP, and sessions without loops.'), b('Confronta entrambe le estremità per partner, key, VLAN e stato prima di aggiungere un link.', 'Compare both ends for partner, key, VLANs, and state before adding a link.')],
    caveat: b('Port-channel up non prova che tutti i member inoltrino correttamente né che la capacità residua soddisfi il traffico.', 'A port channel being up does not prove every member forwards correctly or residual capacity meets traffic needs.')
  },
  {
    id: 'layer2-containment-recovery', area: 'containment', domains: ['network-access', 'security-fundamentals'], planes: ['physical', 'data', 'control', 'management'], techniqueIds: ['mac-flooding', 'arp-poisoning', 'rogue-dhcp', 'stp-manipulation', 'l2-broadcast-storm'], controlIds: ['layer2-first-hop-assurance', 'telemetry-independent-evidence'],
    title: b('Contenimento e recovery Layer 2', 'Layer 2 containment and recovery'),
    framePath: [b('La risposta correla porta fisica, MAC, IP, VLAN, autenticazione e ruolo topologico prima di agire.', 'Response correlates physical ports, MAC addresses, IPs, VLANs, authentication, and topology roles before acting.'), b('Il contenimento isola il minimo dominio necessario preservando uplink, management e servizi essenziali.', 'Containment isolates the smallest necessary domain while preserving uplinks, management, and essential services.')],
    threat: b('Shutdown indiscriminato di trunk, root port o uplink può ampliare l’outage; clear di tabelle distrugge evidenze e stato legittimo.', 'Indiscriminate shutdown of trunks, root ports, or uplinks may expand the outage; clearing tables destroys evidence and legitimate state.'),
    evidence: [b('Snapshot MAC/ARP/binding/STP/EtherChannel, interface counters, logs e NAC session.', 'Snapshots of MAC/ARP/binding/STP/EtherChannel state, interface counters, logs, and NAC sessions.'), b('Timeline di link, violation, topology change, DHCP/DAI drop e reachability.', 'Timeline of link events, violations, topology changes, DHCP/DAI drops, and reachability.')],
    controls: [b('Playbook per ruolo porta, OOB, rollback, spare path e ownership delle dipendenze.', 'Role-based port playbooks, OOB access, rollback, spare paths, and dependency ownership.'), b('Quarantena NAC/porta, rate limit o shutdown mirato con rivalidazione progressiva.', 'NAC/port quarantine, rate limiting, or targeted shutdown with progressive revalidation.')],
    verification: [b('Dopo il contenimento verifica root/STP, trunk, binding, gateway e flussi essenziali in entrambe le direzioni.', 'After containment verify root/STP, trunks, bindings, gateways, and essential bidirectional flows.'), b('Riammetti una porta o VLAN alla volta monitorando recidiva, MAC churn e broadcast rate.', 'Readmit one port or VLAN at a time while monitoring recurrence, MAC churn, and broadcast rates.')],
    caveat: b('La porta con più contatori non è necessariamente la sorgente: può essere l’uplink che trasporta gli effetti del problema.', 'The port with the most counters is not necessarily the source: it may be an uplink carrying the problem’s effects.')
  }
];

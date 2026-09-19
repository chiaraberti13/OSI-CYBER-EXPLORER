import type { Bilingual } from '../types';
import type { CcnaDomainId } from './securityCoverage';

/**
 * Per-domain concept checklist.
 *
 * This is deliberately not a quiz: there is no question, no answer to pick, no score.
 * Each item states a concept in the form "can you explain this?", names where in the
 * platform you can watch it happen, and states the mistake that shows the concept is
 * only half understood. A learner uses it to decide what to revisit, not to be graded.
 */
export interface ChecklistItem {
  id: string;
  /** The concept, phrased as something you either can or cannot explain. */
  concept: Bilingual;
  /** Where in the platform the concept can be observed rather than just read. */
  observeIn: Bilingual;
  /** The error that reveals the concept is not yet solid. */
  pitfall: Bilingual;
}

export interface DomainChecklist {
  domainId: CcnaDomainId;
  items: ChecklistItem[];
}

const b = (it: string, en: string): Bilingual => ({ it, en });
const item = (id: string, concept: Bilingual, observeIn: Bilingual, pitfall: Bilingual): ChecklistItem => ({ id, concept, observeIn, pitfall });

export const DOMAIN_CHECKLISTS: DomainChecklist[] = [
  {
    domainId: 'network-fundamentals',
    items: [
      item('components',
        b('Sai dire quale singola decisione prende ogni apparato su ogni unità di traffico, e quale confine crea o non crea.', 'You can state the single decision each device makes on every unit of traffic, and which boundary it does or does not create.'),
        b('Fondamenti di rete → Componenti di rete e decisione che prendono.', 'Network fundamentals → Network components and the decision they make.'),
        b('Dire che uno switch “separa le reti”: separa i domini di collisione, non quello di broadcast.', 'Saying a switch “separates networks”: it separates collision domains, not the broadcast domain.')),
      item('subnetting',
        b('Dato un indirizzo e un prefisso, ricavi rete, broadcast, primo e ultimo host utilizzabile e numero di host, e sai perché /31 e /32 sono eccezioni.', 'Given an address and a prefix you can derive the network, broadcast, first and last usable host, and host count, and you know why /31 and /32 are exceptions.'),
        b('Fondamenti di rete → Esploratore IPv4, con la rappresentazione binaria che mostra dove cade il confine.', 'Network fundamentals → IPv4 explorer, with the binary strip showing where the boundary falls.'),
        b('Sottrarre sempre 2 dagli host: su un /31 punto-punto entrambi gli indirizzi sono utilizzabili.', 'Always subtracting 2 from the host count: on a point-to-point /31 both addresses are usable.')),
      item('wildcard',
        b('Converti una subnet mask nella wildcard corrispondente e sai in quali comandi serve l’una e in quali l’altra.', 'You can convert a subnet mask into the matching wildcard and know which commands take which.'),
        b('Fondamenti di rete → Esploratore IPv4 (campo wildcard); Sicurezza CCNA → valutatore ACL.', 'Network fundamentals → IPv4 explorer (wildcard field); Security fundamentals → ACL evaluator.'),
        b('Scrivere una subnet mask dove è attesa una wildcard, per esempio nel comando network di OSPF.', 'Writing a subnet mask where a wildcard is expected, for example in the OSPF network command.')),
      item('tcp-udp',
        b('Spieghi cosa TCP aggiunge a UDP e perché quell’aggiunta costa, senza dire che UDP “è più veloce”.', 'You can explain what TCP adds to UDP and why that addition costs, without saying UDP “is faster”.'),
        b('Fondamenti di rete → confronto TCP e UDP; Pila OSI → simulazione del livello 4.', 'Network fundamentals → TCP and UDP comparison; OSI stack → Layer 4 simulation.'),
        b('Confondere la PDU: con TCP si chiama segment, con UDP datagram.', 'Confusing the PDU: with TCP it is a segment, with UDP a datagram.')),
      item('ipv6',
        b('Comprimi ed espandi un indirizzo IPv6 secondo le regole, riconosci i tipi dal prefisso e sai come SLAAC costruisce l’interface ID.', 'You can compress and expand an IPv6 address by the rules, recognize types from the prefix, and know how SLAAC builds the interface ID.'),
        b('Fondamenti di rete → esploratore IPv6 e Modified EUI-64.', 'Network fundamentals → IPv6 explorer and Modified EUI-64.'),
        b('Credere che DHCPv6 fornisca il default gateway: quello arriva dai Router Advertisement.', 'Believing DHCPv6 provides the default gateway: that comes from Router Advertisements.')),
      item('interfaces',
        b('Leggi lo stato di un’interfaccia e i contatori di errore e distingui un guasto fisico da un problema di protocollo o da un duplex mismatch.', 'You can read interface state and error counters and separate a physical fault from a protocol problem or a duplex mismatch.'),
        b('Fondamenti di rete → diagnostica delle interfacce; Evidenze operative → caso degli errori fisici.', 'Network fundamentals → interface diagnostics; Operational evidence → physical errors case.'),
        b('Cercare late collision su un lato full-duplex: esistono solo in half duplex, sull’altro capo del mismatch.', 'Looking for late collisions on a full-duplex side: they exist only in half duplex, on the other end of the mismatch.')),
      item('client-os',
        b('Verifichi i quattro parametri IP di un host su Windows, macOS e Linux e interpreti un indirizzo APIPA.', 'You can verify a host’s four IP parameters on Windows, macOS, and Linux, and interpret an APIPA address.'),
        b('Fondamenti di rete → verifica dei parametri IP sul client.', 'Network fundamentals → verifying IP parameters on the client.'),
        b('Concludere che la rete è guasta quando il ping per indirizzo funziona e quello per nome no: è il resolver.', 'Concluding the network is broken when a ping by address works and by name does not: it is the resolver.'))
    ]
  },
  {
    domainId: 'network-access',
    items: [
      item('vlan-trunk',
        b('Spieghi perché un frame esce taggato o non taggato da un trunk, e cosa decidono native VLAN e allowed list.', 'You can explain why a frame leaves a trunk tagged or untagged, and what the native VLAN and allowed list decide.'),
        b('Accesso alla rete → simulatore VLAN e trunk 802.1Q.', 'Network access → VLAN and 802.1Q trunk simulator.'),
        b('Lasciare la native VLAN a 1 e coincidente con una VLAN di accesso: è la premessa del double tagging.', 'Leaving the native VLAN at 1 and equal to an access VLAN: that is the premise of double tagging.')),
      item('stp',
        b('Ricavi la root bridge dal Bridge ID e spieghi perché un loop Layer 2 è peggiore di un loop Layer 3.', 'You can derive the root bridge from the Bridge ID and explain why a Layer 2 loop is worse than a Layer 3 loop.'),
        b('Accesso alla rete → elezione della root bridge con priorità modificabili.', 'Network access → root bridge election with adjustable priorities.'),
        b('Dimenticare che la priorità va a passi di 4096 e che l’extended system ID somma il numero di VLAN.', 'Forgetting that priority moves in steps of 4096 and that the extended system ID adds the VLAN number.')),
      item('stp-guards',
        b('Distingui a cosa serve BPDU Guard e a cosa serve Root Guard, e su quali porte non vanno messi.', 'You can distinguish what BPDU Guard is for from what Root Guard is for, and which ports they must not go on.'),
        b('Hardening delle config → PortFast e protezioni STP sugli edge.', 'Configuration hardening → PortFast and STP edge protections.'),
        b('Mettere BPDU Guard su un uplink verso uno switch legittimo: la prima BPDU spegne il link.', 'Putting BPDU Guard on an uplink toward a legitimate switch: the first BPDU shuts the link down.')),
      item('etherchannel',
        b('Sai quali combinazioni di modalità formano un port-channel e quali requisiti devono coincidere sulle porte membro.', 'You know which mode combinations form a port-channel and which requirements must match on member ports.'),
        b('Accesso alla rete → simulatore EtherChannel con le cinque modalità.', 'Network access → EtherChannel simulator with the five modes.'),
        b('Mettere passive su entrambi i lati, o mescolare LACP e PAgP: nessuno dei due negozia.', 'Setting passive on both sides, or mixing LACP and PAgP: neither negotiates.')),
      item('wireless',
        b('Spieghi perché la radio è un mezzo condiviso half-duplex e distingui SSID, BSSID, BSS ed ESS.', 'You can explain why radio is a shared half-duplex medium and distinguish SSID, BSSID, BSS, and ESS.'),
        b('Accesso alla rete → principi radio e 802.11.', 'Network access → radio and 802.11 principles.'),
        b('Trattare un client associato come un client autorizzato: sono due fasi distinte.', 'Treating an associated client as an authorized client: they are two distinct stages.')),
      item('wlc-gui',
        b('Sai quali campi servono per pubblicare una WLAN da GUI e quale lega la WLAN alla sua VLAN.', 'You know which fields publish a WLAN from the GUI and which one binds the WLAN to its VLAN.'),
        b('Accesso alla rete → percorso nella GUI del WLC.', 'Network access → WLC GUI walkthrough.'),
        b('Confondere Profile Name e SSID, o sbagliare l’interfaccia: i client si associano ma non ottengono indirizzo.', 'Confusing Profile Name with SSID, or picking the wrong interface: clients associate but get no address.'))
    ]
  },
  {
    domainId: 'ip-connectivity',
    items: [
      item('lpm',
        b('Applichi nell’ordine corretto prefisso più lungo, distanza amministrativa e metrica, e sai che la prima regola prevale sulle altre.', 'You apply longest prefix, administrative distance, and metric in the correct order, and you know the first rule overrides the others.'),
        b('Connettività IP → lookup interattivo nella routing table.', 'IP connectivity → interactive routing-table lookup.'),
        b('Confrontare la distanza amministrativa tra rotte con prefissi di lunghezza diversa: non si fa.', 'Comparing administrative distance between routes with different prefix lengths: that is not how it works.')),
      item('read-route',
        b('Leggi un `show ip route` reale: codici, gateway of last resort, valori tra parentesi quadre, differenza tra C e L.', 'You can read a real `show ip route`: codes, gateway of last resort, the bracketed values, the difference between C and L.'),
        b('Connettività IP → output annotato con la legenda riga per riga.', 'IP connectivity → annotated output with a line-by-line legend.'),
        b('Leggere la riga “variably subnetted” come una rotta installata: è una riga di riepilogo.', 'Reading the “variably subnetted” line as an installed route: it is a summary line.')),
      item('static',
        b('Configuri una rotta statica e una floating static, e spieghi quando la seconda entra in tabella.', 'You can configure a static route and a floating static, and explain when the second enters the table.'),
        b('Connettività IP → configurazioni IOS di riferimento.', 'IP connectivity → reference IOS configurations.'),
        b('Dare alla floating static una distanza amministrativa non superiore a quella del protocollo che deve sostituire.', 'Giving the floating static an administrative distance that is not higher than the protocol it must back up.')),
      item('ospf',
        b('Spieghi come si forma un’adiacenza OSPF, cosa deve coincidere tra vicini e come si calcola il costo.', 'You can explain how an OSPF adjacency forms, what must match between neighbours, and how cost is computed.'),
        b('Connettività IP → calcolatore del costo e stati dell’adiacenza.', 'IP connectivity → cost calculator and adjacency states.'),
        b('Lasciare la reference bandwidth predefinita: ogni interfaccia da 100 Mb/s in su ha costo 1 e i link diventano indistinguibili.', 'Leaving the default reference bandwidth: every interface at 100 Mb/s or faster costs 1 and links become indistinguishable.')),
      item('dr-bdr',
        b('Sai su quali reti si elegge il DR, con quali criteri e perché l’elezione non è preemptive.', 'You know on which networks a DR is elected, by which criteria, and why the election is not preemptive.'),
        b('Connettività IP → elezione DR/BDR, con la casella che aggiunge un router a rete già converta.', 'IP connectivity → DR/BDR election, with the box that adds a router to an already converged segment.'),
        b('Aspettarsi che un router con priorità più alta subentri da solo: resta DROTHER.', 'Expecting a higher-priority router to take over by itself: it stays a DROTHER.')),
      item('fhrp',
        b('Spieghi cosa condividono i router in un FHRP e cosa governa failover e failback.', 'You can explain what routers share in an FHRP and what governs failover and failback.'),
        b('Connettività IP → confronto HSRP e VRRP.', 'IP connectivity → HSRP and VRRP comparison.'),
        b('Dare per scontato il subentro in HSRP senza preempt, o non tracciare l’uplink: il gateway resta Active senza percorso.', 'Assuming takeover in HSRP without preempt, or not tracking the uplink: the gateway stays Active with no path.'))
    ]
  },
  {
    domainId: 'ip-services',
    items: [
      item('dora',
        b('Ripercorri i quattro messaggi DHCP con direzione e porte, e sai cosa fa un relay e perché serve.', 'You can walk through the four DHCP messages with direction and ports, and you know what a relay does and why it is needed.'),
        b('Servizi IP → sequenza DORA e nota sul relay.', 'IP services → DORA sequence and relay note.'),
        b('Aspettarsi che un server centrale serva una subnet remota senza `ip helper-address`: i router non inoltrano i broadcast.', 'Expecting a central server to serve a remote subnet without `ip helper-address`: routers do not forward broadcasts.')),
      item('nat',
        b('Distingui inside local, inside global e outside global, e spieghi cosa aggiunge PAT al NAT.', 'You can distinguish inside local, inside global, and outside global, and explain what PAT adds to NAT.'),
        b('Servizi IP → NAT/PAT explorer con il range di allocazione della porta.', 'IP services → NAT/PAT explorer showing the port allocation range.'),
        b('Considerare il NAT un controllo di sicurezza: non autentica e non ispeziona nulla.', 'Treating NAT as a security control: it authenticates nothing and inspects nothing.')),
      item('syslog',
        b('Sai che in Syslog 0 è il livello più grave e cosa comprende una soglia configurata.', 'You know that in Syslog 0 is the most severe level and what a configured threshold includes.'),
        b('Servizi IP → filtro Syslog con severità e soglia regolabili.', 'IP services → Syslog filter with adjustable severity and threshold.'),
        b('Pensare che una soglia più alta significhi meno messaggi: include tutti i livelli numericamente inferiori.', 'Thinking a higher threshold means fewer messages: it includes every numerically lower level.')),
      item('ntp-snmp',
        b('Spieghi perché il tempo accurato è un prerequisito di sicurezza e quale versione di SNMP è l’unica adeguata.', 'You can explain why accurate time is a security prerequisite and which SNMP version is the only adequate one.'),
        b('Servizi IP → NTP con offset e delay, matrice attacco-difesa dei servizi.', 'IP services → NTP with offset and delay, service attack-defense matrix.'),
        b('Usare SNMPv2c perché “è interno”: la community viaggia in chiaro.', 'Using SNMPv2c because “it is internal”: the community travels in cleartext.')),
      item('qos',
        b('Sai cosa marca DSCP, cosa fa un per-hop behavior e perché la trust boundary conta.', 'You know what DSCP marks, what a per-hop behavior does, and why the trust boundary matters.'),
        b('Servizi IP → code point DSCP e meccanismi QoS.', 'IP services → DSCP code points and QoS mechanisms.'),
        b('Credere che marcare il traffico crei banda: la QoS decide solo chi soffre quando la banda finisce.', 'Believing marking traffic creates bandwidth: QoS only decides who suffers when bandwidth runs out.'))
    ]
  },
  {
    domainId: 'security-fundamentals',
    items: [
      item('acl',
        b('Prevedi l’esito di una ACL sapendo che si ferma alla prima corrispondenza e che chiude con un deny implicito.', 'You can predict an ACL outcome knowing it stops at the first match and ends with an implicit deny.'),
        b('Sicurezza CCNA → valutatore ACL che evidenzia la regola colpita.', 'Security fundamentals → ACL evaluator highlighting the matched rule.'),
        b('Ordinare una regola generica prima di una specifica, o applicare la ACL nella direzione sbagliata.', 'Ordering a generic rule before a specific one, or applying the ACL in the wrong direction.')),
      item('aaa',
        b('Distingui autenticazione, autorizzazione e accounting, e sai perché TACACS+ e RADIUS servono scopi diversi.', 'You can distinguish authentication, authorization, and accounting, and know why TACACS+ and RADIUS serve different purposes.'),
        b('Sicurezza CCNA → confronto TACACS+ e RADIUS; Identità e AAA → catene di fiducia.', 'Security fundamentals → TACACS+ and RADIUS comparison; Identity and AAA → trust chains.'),
        b('Attivare AAA senza un fallback locale testato: un server irraggiungibile diventa un lockout.', 'Enabling AAA without a tested local fallback: an unreachable server becomes a lockout.')),
      item('l2-security',
        b('Sai in quale ordine vanno attivati DHCP Snooping, DAI e IP Source Guard e perché quell’ordine conta.', 'You know in which order DHCP Snooping, DAI, and IP Source Guard must be enabled, and why that order matters.'),
        b('Layer 2 e first hop → scenari di binding e trust; Hardening delle config → Snooping e DAI.', 'Layer 2 and first hop → binding and trust scenarios; Configuration hardening → Snooping and DAI.'),
        b('Attivare DAI senza DHCP Snooping o senza ARP ACL per gli host statici: si bloccano host legittimi.', 'Enabling DAI without DHCP Snooping or without ARP ACLs for static hosts: legitimate hosts get blocked.')),
      item('vpn',
        b('Spieghi cosa fornisce ESP, cosa negozia IKE e perché una IKE SA attiva non prova il forwarding.', 'You can explain what ESP provides, what IKE negotiates, and why an active IKE SA does not prove forwarding.'),
        b('VPN, IPsec e PKI → dalla negoziazione IKEv2 al forwarding reale.', 'VPN, IPsec, and PKI → from IKEv2 negotiation to actual forwarding.'),
        b('Pensare che il tunnel up significhi traffico protetto: servono entrambe le SA e i selector corretti.', 'Thinking an up tunnel means protected traffic: both SAs and correct selectors are required.')),
      item('wlan-security',
        b('Distingui Personal da Enterprise e sai cosa cambia SAE rispetto all’handshake a 4 vie di WPA2.', 'You can distinguish Personal from Enterprise and know what SAE changes compared with the WPA2 4-way handshake.'),
        b('Sicurezza CCNA → confronto da WEP a WPA3 e sequenza WPA2 PSK.', 'Security fundamentals → WEP-to-WPA3 comparison and WPA2 PSK sequence.'),
        b('Usare una PSK condivisa dove serve identità: non identifica nessuno e non si revoca singolarmente.', 'Using a shared PSK where identity is required: it identifies no one and cannot be revoked individually.'))
    ]
  },
  {
    domainId: 'automation-programmability',
    items: [
      item('controller',
        b('Spieghi cosa centralizza un controller e cosa resta sui dispositivi, e la differenza tra northbound e southbound.', 'You can explain what a controller centralizes and what stays on the devices, and the difference between northbound and southbound.'),
        b('Automazione → architetture e API.', 'Automation → architectures and APIs.'),
        b('Pensare che il controller inoltri il traffico: i dispositivi continuano a inoltrare nel proprio data plane.', 'Thinking the controller forwards traffic: devices keep forwarding in their own data plane.')),
      item('rest',
        b('Associ ogni verbo HTTP alla sua operazione CRUD e distingui “safe” da “idempotente”.', 'You can map each HTTP verb to its CRUD operation and distinguish “safe” from “idempotent”.'),
        b('Automazione → REST request explorer con metodo e stato simulati.', 'Automation → REST request explorer with simulated method and status.'),
        b('Confondere 401 e 403: il primo è autenticazione assente o non valida, il secondo è identità riconosciuta ma non autorizzata.', 'Confusing 401 and 403: the first is missing or invalid authentication, the second a recognized but unauthorized identity.')),
      item('json',
        b('Leggi un documento JSON riconoscendo i sei tipi di valore e la differenza tra oggetto e array.', 'You can read a JSON document recognizing the six value types and the difference between an object and an array.'),
        b('Automazione → JSON inspector che appiattisce il documento in percorsi.', 'Automation → JSON inspector flattening the document into paths.'),
        b('Aggiungere una virgola dopo l’ultimo elemento o un commento: il JSON standard non li ammette.', 'Adding a trailing comma or a comment: standard JSON allows neither.')),
      item('iac',
        b('Distingui push da pull e dichiarativo da imperativo, e spieghi perché l’idempotenza rende sicuro rieseguire.', 'You can distinguish push from pull and declarative from imperative, and explain why idempotency makes re-running safe.'),
        b('Automazione → confronto tra strumenti di configuration management.', 'Automation → configuration management tool comparison.'),
        b('Considerare un job SUCCESS come prova di convergenza: descrive il job, non lo stato finale della rete.', 'Treating a SUCCESS job as proof of convergence: it describes the job, not the network’s final state.'))
    ]
  }
];

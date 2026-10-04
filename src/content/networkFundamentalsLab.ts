import type { Ipv4AddressKind } from '../lib/ipv4';
import type { Ipv6AddressKind } from '../lib/ipv6';
type Language = 'it' | 'en';

export const ADDRESS_KIND_LABELS: Record<Ipv4AddressKind, Record<Language, string>> = {
  private: { it: 'Privato RFC 1918', en: 'RFC 1918 private' },
  public: { it: 'Pubblico', en: 'Public' },
  shared: { it: 'Spazio condiviso RFC 6598', en: 'RFC 6598 shared space' },
  'special-use': { it: 'Uso speciale o riservato', en: 'Special-use or reserved' },
  loopback: { it: 'Loopback', en: 'Loopback' },
  'link-local': { it: 'Link-local/APIPA', en: 'Link-local/APIPA' },
  multicast: { it: 'Multicast', en: 'Multicast' },
  documentation: { it: 'Documentazione', en: 'Documentation' },
  unspecified: { it: 'Non specificato', en: 'Unspecified' },
  'limited-broadcast': { it: 'Broadcast limitato', en: 'Limited broadcast' }
};

export const IPV6_KIND_LABELS: Record<Ipv6AddressKind, Record<Language, string>> = {
  unspecified: { it: 'Non specificato (::)', en: 'Unspecified (::)' },
  loopback: { it: 'Loopback (::1)', en: 'Loopback (::1)' },
  'link-local': { it: 'Link-local (FE80::/10)', en: 'Link-local (FE80::/10)' },
  'unique-local': { it: 'Unique local (FC00::/7)', en: 'Unique local (FC00::/7)' },
  'global-unicast': { it: 'Global unicast (2000::/3)', en: 'Global unicast (2000::/3)' },
  multicast: { it: 'Multicast (FF00::/8)', en: 'Multicast (FF00::/8)' },
  documentation: { it: 'Documentazione (2001:DB8::/32)', en: 'Documentation (2001:DB8::/32)' },
  'ipv4-mapped': { it: 'IPv4-mapped (::FFFF:0:0/96)', en: 'IPv4-mapped (::FFFF:0:0/96)' },
  'ipv4-compatible': { it: 'IPv4-compatible (::/96, deprecato)', en: 'IPv4-compatible (::/96, deprecated)' },
  nat64: { it: 'Prefisso NAT64 well-known (64:FF9B::/96)', en: 'NAT64 well-known prefix (64:FF9B::/96)' },
  other: { it: 'Altro intervallo IPv6', en: 'Other IPv6 range' }
};

export const TRANSPORT_ROWS = [
  {
    property: { it: 'Connessione', en: 'Connection' },
    tcp: { it: 'Orientato alla connessione; handshake a tre vie', en: 'Connection-oriented; three-way handshake' },
    udp: { it: 'Connectionless; nessun handshake', en: 'Connectionless; no handshake' }
  },
  {
    property: { it: 'Affidabilità', en: 'Reliability' },
    tcp: { it: 'ACK, ritrasmissione e consegna ordinata', en: 'ACKs, retransmission, and ordered delivery' },
    udp: { it: 'Nessuna garanzia integrata di consegna o ordine', en: 'No built-in delivery or ordering guarantee' }
  },
  {
    property: { it: 'Controllo', en: 'Control' },
    tcp: { it: 'Controllo di flusso e congestione', en: 'Flow and congestion control' },
    udp: { it: 'Overhead minimo; il controllo spetta all’applicazione', en: 'Minimal overhead; control belongs to the application' }
  },
  {
    property: { it: 'Impieghi tipici', en: 'Typical uses' },
    tcp: { it: 'HTTPS, SSH, FTP, SMTP e BGP', en: 'HTTPS, SSH, FTP, SMTP, and BGP' },
    udp: { it: 'DNS, DHCP, NTP, SNMP e traffico real-time', en: 'DNS, DHCP, NTP, SNMP, and real-time traffic' }
  }
];

export const INTERFACE_STATES = [
  {
    state: 'administratively down / down',
    cause: { it: 'Interfaccia disabilitata con shutdown.', en: 'The interface is disabled with shutdown.' },
    action: { it: 'Verifica la configurazione e usa no shutdown.', en: 'Verify the configuration and use no shutdown.' }
  },
  {
    state: 'down / down',
    cause: { it: 'Problema fisico: cavo, transceiver, alimentazione, speed o porta remota.', en: 'Physical problem: cable, transceiver, power, speed, or remote port.' },
    action: { it: 'Controlla LED, cablaggio e show interfaces.', en: 'Check LEDs, cabling, and show interfaces.' }
  },
  {
    state: 'up / down',
    cause: { it: 'Il livello fisico è attivo, ma il protocollo di linea non funziona.', en: 'The physical layer is active, but the line protocol is not operational.' },
    action: { it: 'Controlla encapsulation, keepalive, VLAN e configurazione del peer.', en: 'Check encapsulation, keepalives, VLANs, and peer configuration.' }
  },
  {
    state: 'up / up + CRC/input errors',
    cause: { it: 'Rumore, cablaggio difettoso, transceiver o duplex mismatch.', en: 'Noise, faulty cabling, transceiver issues, or duplex mismatch.' },
    action: { it: 'Confronta speed/duplex e analizza i contatori incrementali.', en: 'Compare speed/duplex settings and inspect increasing counters.' }
  }
];

// CCNA 1.13 — switching concepts, stated positively (the attack labs only show the abuses)
export const SWITCHING_CONCEPTS = [
  {
    title: { it: 'Apprendimento (learning)', en: 'Learning' },
    detail: {
      it: 'Lo switch legge il MAC sorgente di ogni frame in ingresso e lo associa alla porta e alla VLAN da cui è arrivato, scrivendo la voce nella CAM table. Non impara nulla dal MAC di destinazione.',
      en: 'The switch reads the source MAC of every incoming frame and associates it with the port and VLAN it arrived on, writing the entry into the CAM table. It learns nothing from the destination MAC.'
    }
  },
  {
    title: { it: 'Inoltro e filtraggio', en: 'Forwarding and filtering' },
    detail: {
      it: 'Se il MAC di destinazione è in CAM su un’altra porta, il frame esce solo da quella porta (forwarding); se è sulla stessa porta da cui è arrivato, il frame viene scartato (filtering).',
      en: 'If the destination MAC is in the CAM table on another port, the frame leaves only through that port (forwarding); if it is on the same port it arrived on, the frame is discarded (filtering).'
    }
  },
  {
    title: { it: 'Flooding', en: 'Flooding' },
    detail: {
      it: 'Tre categorie vengono replicate su tutte le porte della VLAN tranne quella di ingresso: unknown unicast (destinazione non in CAM), broadcast e multicast senza snooping. Il flooding è comportamento normale, non un guasto.',
      en: 'Three categories are replicated to every port of the VLAN except the ingress one: unknown unicast (destination not in the CAM table), broadcast, and multicast without snooping. Flooding is normal behavior, not a fault.'
    }
  },
  {
    title: { it: 'Aging e MAC move', en: 'Aging and MAC moves' },
    detail: {
      it: 'Una voce inutilizzata scade dopo l’aging time (300 s per impostazione predefinita). Se lo stesso MAC riappare su un’altra porta la voce viene riscritta: un MAC che rimbalza tra due porte (MAC flapping) indica un loop o un host duplicato.',
      en: 'An unused entry expires after the aging time (300 s by default). If the same MAC reappears on another port the entry is rewritten: a MAC bouncing between two ports (MAC flapping) indicates a loop or a duplicated host.'
    }
  },
  {
    title: { it: 'CAM table e tabella ARP', en: 'CAM table vs ARP table' },
    detail: {
      it: 'Sono due cose diverse e una trappola d’esame ricorrente: la CAM table dello switch mappa MAC → porta (livello 2), la tabella ARP di un host o router mappa IP → MAC (livello 3 verso 2).',
      en: 'They are two different things and a recurring exam trap: the switch CAM table maps MAC to port (Layer 2), while the ARP table of a host or router maps IP to MAC (Layer 3 to Layer 2).'
    }
  },
  {
    title: { it: 'Store-and-forward e cut-through', en: 'Store-and-forward vs cut-through' },
    detail: {
      it: 'Store-and-forward riceve il frame completo e ne verifica l’FCS prima di inoltrarlo: scarta i frame corrotti ma aggiunge latenza. Cut-through inoltra appena letto l’header di destinazione: è più rapido ma propaga anche i frame errati.',
      en: 'Store-and-forward receives the whole frame and verifies its FCS before forwarding: it drops corrupted frames but adds latency. Cut-through forwards as soon as the destination header is read: faster, but it also propagates bad frames.'
    }
  }
];

// CCNA 1.12 — virtualization fundamentals
export const VIRTUALIZATION_ROWS = [
  {
    title: { it: 'Virtualizzazione dei server', en: 'Server virtualization' },
    detail: {
      it: 'Un hypervisor divide un server fisico in più macchine virtuali, ognuna con il proprio sistema operativo completo e kernel separato. Tipo 1 (bare-metal, es. ESXi) gira direttamente sull’hardware; tipo 2 gira sopra un sistema operativo host.',
      en: 'A hypervisor divides one physical server into several virtual machines, each with its own complete operating system and separate kernel. Type 1 (bare-metal, e.g. ESXi) runs directly on the hardware; type 2 runs on top of a host operating system.'
    },
    network: {
      it: 'Ogni VM ha una vNIC collegata a un virtual switch; il traffico tra VM sullo stesso host può non toccare mai la rete fisica, quindi sfugge agli strumenti di ispezione tradizionali.',
      en: 'Each VM has a vNIC attached to a virtual switch; traffic between VMs on the same host may never touch the physical network, so it escapes traditional inspection tools.'
    }
  },
  {
    title: { it: 'Container', en: 'Containers' },
    detail: {
      it: 'Impacchettano applicazione e dipendenze condividendo il kernel dell’host: avvio in secondi e footprint molto minore di una VM. La condivisione del kernel rende però l’isolamento più debole di quello di una macchina virtuale.',
      en: 'They package an application with its dependencies while sharing the host kernel: startup in seconds and a much smaller footprint than a VM. Sharing the kernel, however, makes isolation weaker than a virtual machine’s.'
    },
    network: {
      it: 'La rete è tipicamente NAT o overlay per namespace, con indirizzi effimeri: le policy vanno espresse su identità o label, non su indirizzi IP.',
      en: 'Networking is typically NAT or an overlay per namespace, with ephemeral addresses: policy must be expressed on identity or labels, not on IP addresses.'
    }
  },
  {
    title: { it: 'VRF', en: 'VRFs' },
    detail: {
      it: 'Virtual Routing and Forwarding: un router mantiene più tabelle di routing indipendenti sullo stesso dispositivo fisico. Le interfacce assegnate a VRF diverse non si raggiungono, anche con indirizzi sovrapposti.',
      en: 'Virtual Routing and Forwarding: one router keeps several independent routing tables on the same physical device. Interfaces assigned to different VRFs cannot reach each other, even with overlapping addresses.'
    },
    network: {
      it: 'Separa il livello 3 come una VLAN separa il livello 2, ed è la base del management VRF. Non cifra e non filtra: per far comunicare due VRF serve un route leaking o un firewall esplicito.',
      en: 'It separates Layer 3 the way a VLAN separates Layer 2, and is the basis of the management VRF. It neither encrypts nor filters: making two VRFs talk requires explicit route leaking or a firewall.'
    }
  }
];

// CCNA 1.10 — verify IP parameters on the client operating system
export const CLIENT_IP_COMMANDS = [
  {
    os: 'Windows',
    commands: 'ipconfig /all\nipconfig /release · /renew\nipconfig /flushdns\nroute print · nslookup',
    read: {
      it: 'IPv4 Address, Subnet Mask, Default Gateway, DNS Servers, DHCP Enabled e la durata del lease. /all è indispensabile: ipconfig da solo non mostra DNS né stato DHCP.',
      en: 'IPv4 Address, Subnet Mask, Default Gateway, DNS Servers, DHCP Enabled, and the lease duration. /all is essential: plain ipconfig shows neither DNS nor DHCP state.'
    }
  },
  {
    os: 'macOS',
    commands: 'ifconfig en0\nipconfig getpacket en0\nnetworksetup -getinfo Wi-Fi\nscutil --dns · route -n get default',
    read: {
      it: 'inet e netmask dell’interfaccia, il pacchetto DHCP ricevuto (con router e domain_name_server), i resolver attivi e il gateway effettivo.',
      en: 'The interface inet and netmask, the DHCP packet actually received (with router and domain_name_server), the active resolvers, and the effective gateway.'
    }
  },
  {
    os: 'Linux',
    commands: 'ip addr show\nip route show\nresolvectl status\nip neigh · ss -tulpn',
    read: {
      it: 'Indirizzo con prefisso CIDR, default via che indica il gateway, i resolver per link e la cache dei vicini. ifconfig e route sono deprecati a favore del comando ip.',
      en: 'The address with its CIDR prefix, the default via line that names the gateway, per-link resolvers, and the neighbour cache. ifconfig and route are deprecated in favour of the ip command.'
    }
  }
];

export const CLIENT_IP_SYMPTOMS = [
  {
    symptom: '169.254.x.x / fe80:: only',
    meaning: {
      it: 'Indirizzo APIPA autoassegnato: nessun DHCPACK è arrivato. Cerca la causa tra porta in VLAN errata, DHCP relay mancante, pool esaurito o DHCP Snooping che scarta le risposte su una porta non trusted.',
      en: 'A self-assigned APIPA address: no DHCPACK arrived. Look for a port in the wrong VLAN, a missing DHCP relay, an exhausted pool, or DHCP snooping dropping replies on an untrusted port.'
    }
  },
  {
    symptom: { it: 'Gateway assente o errato', en: 'Missing or wrong gateway' },
    meaning: {
      it: 'La comunicazione dentro la subnet funziona, tutto il resto no. È il caso in cui il ping all’host vicino riesce e quello a Internet no.',
      en: 'Communication inside the subnet works, everything else fails. This is the case where a ping to the neighbouring host succeeds and a ping to the Internet does not.'
    }
  },
  {
    symptom: { it: 'Subnet mask incoerente', en: 'Inconsistent subnet mask' },
    meaning: {
      it: 'L’host sbaglia la decisione locale/remota: alcune destinazioni sono raggiungibili e altre no, in modo apparentemente casuale. Il sintomo tipico è asimmetrico tra i due host.',
      en: 'The host makes the wrong local/remote decision: some destinations are reachable and others are not, apparently at random. The symptom is typically asymmetric between the two hosts.'
    }
  },
  {
    symptom: { it: 'IP corretto, DNS non risolve', en: 'Correct IP, DNS not resolving' },
    meaning: {
      it: 'Il ping per indirizzo funziona, quello per nome no: il problema è nel resolver o nella sua raggiungibilità, non nel livello 3. Distingue un guasto di rete da un guasto di servizio.',
      en: 'A ping by address works, a ping by name does not: the problem is in the resolver or its reachability, not in Layer 3. This separates a network fault from a service fault.'
    }
  }
];

export const ATTACK_ITEMS = [
  { it: 'IP spoofing e falsificazione dell’indirizzo sorgente', en: 'IP spoofing and source-address forgery' },
  { it: 'SYN flood, UDP flood e reflection/amplification', en: 'SYN floods, UDP floods, and reflection/amplification' },
  { it: 'Sniffing su mezzi condivisi o compromessi', en: 'Sniffing on shared or compromised media' },
  { it: 'Rogue Router Advertisement e Neighbor Discovery spoofing', en: 'Rogue Router Advertisements and Neighbor Discovery spoofing' }
];

export const DEFENSE_ITEMS = [
  { it: 'ACL infrastrutturali, uRPF e BCP 38', en: 'Infrastructure ACLs, uRPF, and BCP 38' },
  { it: 'Stateful firewall, SYN cookie e rate limiting', en: 'Stateful firewalls, SYN cookies, and rate limiting' },
  { it: 'Segmentazione, sicurezza degli switch e cifratura', en: 'Segmentation, switch security, and encryption' },
  { it: 'RA Guard, DHCPv6 Guard e monitoraggio ICMPv6', en: 'RA Guard, DHCPv6 Guard, and ICMPv6 monitoring' }
];

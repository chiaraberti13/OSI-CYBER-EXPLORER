import { useMemo, useState } from 'react';
import { AlertTriangle, Binary, Cable, Calculator, Laptop, Network, Router, Server, ShieldCheck, Workflow } from 'lucide-react';
import { calculateIpv4Subnet, type Ipv4AddressKind } from '../lib/ipv4';
import { inspectIpv6, macToModifiedEui64, type Ipv6AddressKind } from '../lib/ipv6';
import { useStore } from '../store';
import ResponsiveTable from './ResponsiveTable';
import VlsmPlanner from './VlsmPlanner';
import { CABLING_TYPES, NETWORK_COMPONENTS, TOPOLOGY_ARCHITECTURES } from '../content/networkConcepts';

type Language = 'it' | 'en';

const ADDRESS_KIND_LABELS: Record<Ipv4AddressKind, Record<Language, string>> = {
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

const IPV6_KIND_LABELS: Record<Ipv6AddressKind, Record<Language, string>> = {
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

const TRANSPORT_ROWS = [
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

const INTERFACE_STATES = [
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
const SWITCHING_CONCEPTS = [
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
const VIRTUALIZATION_ROWS = [
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
const CLIENT_IP_COMMANDS = [
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

const CLIENT_IP_SYMPTOMS = [
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

const ATTACK_ITEMS = [
  { it: 'IP spoofing e falsificazione dell’indirizzo sorgente', en: 'IP spoofing and source-address forgery' },
  { it: 'SYN flood, UDP flood e reflection/amplification', en: 'SYN floods, UDP floods, and reflection/amplification' },
  { it: 'Sniffing su mezzi condivisi o compromessi', en: 'Sniffing on shared or compromised media' },
  { it: 'Rogue Router Advertisement e Neighbor Discovery spoofing', en: 'Rogue Router Advertisements and Neighbor Discovery spoofing' }
];

const DEFENSE_ITEMS = [
  { it: 'ACL infrastrutturali, uRPF e BCP 38', en: 'Infrastructure ACLs, uRPF, and BCP 38' },
  { it: 'Stateful firewall, SYN cookie e rate limiting', en: 'Stateful firewalls, SYN cookies, and rate limiting' },
  { it: 'Segmentazione, sicurezza degli switch e cifratura', en: 'Segmentation, switch security, and encryption' },
  { it: 'RA Guard, DHCPv6 Guard e monitoraggio ICMPv6', en: 'RA Guard, DHCPv6 Guard, and ICMPv6 monitoring' }
];

function BinaryStrip({ octets, prefix }: { octets: string[]; prefix: number }) {
  let bitIndex = 0;
  return (
    <div className="flex flex-wrap gap-2 font-mono" aria-label="32-bit binary representation">
      {octets.map((octet, octetIndex) => (
        <span key={`${octet}-${octetIndex}`} className="flex overflow-hidden rounded border border-slate-200">
          {octet.split('').map((bit) => {
            const currentIndex = bitIndex++;
            const networkBit = currentIndex < prefix;
            return (
              <span
                key={currentIndex}
                className={`px-1 py-1 text-[11px] ${networkBit ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-50 text-amber-800'}`}
              >
                {bit}
              </span>
            );
          })}
        </span>
      ))}
    </div>
  );
}

export default function NetworkFundamentalsLab() {
  const language = useStore((state) => state.language);
  const [address, setAddress] = useState('192.168.10.42');
  const [prefix, setPrefix] = useState(24);
  const [ipv6Address, setIpv6Address] = useState('2001:db8:acad::10/64');
  const [macAddress, setMacAddress] = useState('00:1A:2B:3C:4D:5E');

  const calculation = useMemo(() => {
    try {
      return { subnet: calculateIpv4Subnet(address, prefix), error: false } as const;
    } catch {
      return { subnet: null, error: true } as const;
    }
  }, [address, prefix]);

  const ipv6Calculation = useMemo(() => {
    try {
      return { details: inspectIpv6(ipv6Address), error: false } as const;
    } catch {
      return { details: null, error: true } as const;
    }
  }, [ipv6Address]);

  const eui64Calculation = useMemo(() => {
    try {
      return { value: macToModifiedEui64(macAddress), error: false } as const;
    } catch {
      return { value: null, error: true } as const;
    }
  }, [macAddress]);

  const labels = language === 'it'
    ? {
        title: 'Network Fundamentals Lab', subtitle: 'Indirizzamento IPv4, trasporto, diagnostica e sicurezza — senza punteggi o valutazioni.',
        calculator: 'Esploratore IPv4 e subnetting', address: 'Indirizzo IPv4', prefix: 'Prefisso CIDR', invalid: 'Inserisci un indirizzo IPv4 valido e un prefisso compreso tra /0 e /32.',
        mask: 'Subnet mask', wildcard: 'Wildcard mask', network: 'Indirizzo di rete', broadcast: 'Broadcast', noBroadcast: 'Non applicabile', range: 'Intervallo utilizzabile', hosts: 'Host utilizzabili', total: 'Indirizzi totali', kind: 'Tipo indirizzo',
        binary: 'Rappresentazione binaria', networkBits: 'bit di rete', hostBits: 'bit host', special31: '/31: collegamento point-to-point; entrambi gli indirizzi sono utilizzabili.', special32: '/32: host route; identifica un solo indirizzo.', ipv6: 'Esploratore IPv6', ipv6Address: 'Indirizzo IPv6', ipv6Invalid: 'Inserisci un indirizzo IPv6 valido, con prefisso opzionale tra /0 e /128. È accettata anche la notazione mista con IPv4 incorporato, per esempio ::ffff:192.0.2.1 o 64:ff9b::192.0.2.33.', expanded: 'Forma espansa', compressed: 'Forma compressa', ipv6Type: 'Tipo IPv6', eui64: 'Modified EUI-64', mac: 'MAC address', macInvalid: 'Inserisci un MAC address valido di 48 bit.', interfaceId: 'Interface ID generato', anycast: 'Anycast non possiede un prefisso dedicato: usa un indirizzo unicast assegnato a più interfacce e il routing consegna il traffico all’istanza più vicina.',
        transport: 'TCP e UDP', diagnostics: 'Diagnostica delle interfacce', security: 'Attacchi e difese collegati', cause: 'Possibile causa', action: 'Verifica consigliata',
        switching: 'Concetti di switching', switchingNote: 'Uno switch prende una sola decisione per frame, e la prende sul MAC di destinazione: inoltrare su una porta, filtrare o fare flooding. Tutto il resto — VLAN, STP, Port Security — serve a delimitare dove quella decisione può avere effetto.',
        virtualization: 'Virtualizzazione: server, container e VRF', virtualizationImpact: 'Effetto sulla rete',
        clientIp: 'Verifica dei parametri IP sul client', clientRead: 'Cosa leggere', clientSymptoms: 'Sintomi e interpretazione', clientNote: 'Prima di sospettare la rete, leggi i quattro parametri che l’host possiede davvero: indirizzo, mask, gateway e DNS. Tre quarti dei problemi “di rete” si chiudono qui.',
        components: 'Componenti di rete e decisione che prendono', componentsNote: 'Ogni apparato prende una sola decisione per ogni unità di traffico. Sapere quale è, e quale confine crea, spiega in anticipo perché una configurazione funziona o no.',
        decision: 'Decisione che prende', boundary: 'Confine che crea', notThis: 'Ciò che NON fa',
        topology: 'Architetture di topologia', shape: 'Com’è fatta', whenToUse: 'Quando si usa', tradeOff: 'Compromesso',
        cabling: 'Interfacce fisiche e cablaggio', medium: 'Come funziona il mezzo', reach: 'Portata', useCase: 'Dove si usa', trap: 'Trappola d’esame'
      }
    : {
        title: 'Network Fundamentals Lab', subtitle: 'IPv4 addressing, transport, diagnostics, and security — without scores or assessment.',
        calculator: 'IPv4 and subnetting explorer', address: 'IPv4 address', prefix: 'CIDR prefix', invalid: 'Enter a valid IPv4 address and a prefix between /0 and /32.',
        mask: 'Subnet mask', wildcard: 'Wildcard mask', network: 'Network address', broadcast: 'Broadcast', noBroadcast: 'Not applicable', range: 'Usable range', hosts: 'Usable hosts', total: 'Total addresses', kind: 'Address type',
        binary: 'Binary representation', networkBits: 'network bits', hostBits: 'host bits', special31: '/31: point-to-point link; both addresses are usable.', special32: '/32: host route; identifies one address.', ipv6: 'IPv6 explorer', ipv6Address: 'IPv6 address', ipv6Invalid: 'Enter a valid IPv6 address, with an optional prefix between /0 and /128. Mixed notation with an embedded IPv4 address is also accepted, for example ::ffff:192.0.2.1 or 64:ff9b::192.0.2.33.', expanded: 'Expanded form', compressed: 'Compressed form', ipv6Type: 'IPv6 type', eui64: 'Modified EUI-64', mac: 'MAC address', macInvalid: 'Enter a valid 48-bit MAC address.', interfaceId: 'Generated interface ID', anycast: 'Anycast has no dedicated prefix: it uses a unicast address assigned to multiple interfaces, and routing delivers traffic to the nearest instance.',
        transport: 'TCP and UDP', diagnostics: 'Interface diagnostics', security: 'Related attacks and defenses', cause: 'Possible cause', action: 'Recommended verification',
        switching: 'Switching concepts', switchingNote: 'A switch makes a single decision per frame, and makes it on the destination MAC: forward out one port, filter, or flood. Everything else — VLANs, STP, Port Security — exists to bound where that decision can take effect.',
        virtualization: 'Virtualization: servers, containers, and VRFs', virtualizationImpact: 'Network impact',
        clientIp: 'Verifying IP parameters on the client', clientRead: 'What to read', clientSymptoms: 'Symptoms and interpretation', clientNote: 'Before suspecting the network, read the four parameters the host actually holds: address, mask, gateway, and DNS. Three quarters of “network” problems end here.',
        components: 'Network components and the decision they make', componentsNote: 'Every device makes a single decision per unit of traffic. Knowing which one it is, and which boundary it creates, explains in advance why a configuration works or does not.',
        decision: 'Decision it makes', boundary: 'Boundary it creates', notThis: 'What it does NOT do',
        topology: 'Topology architectures', shape: 'What it looks like', whenToUse: 'When it is used', tradeOff: 'Trade-off',
        cabling: 'Physical interfaces and cabling', medium: 'How the medium works', reach: 'Reach', useCase: 'Where it is used', trap: 'Exam trap'
      };

  const subnet = calculation.subnet;
  const summary = subnet ? [
    [labels.mask, subnet.subnetMask],
    [labels.wildcard, subnet.wildcardMask],
    [labels.network, `${subnet.networkAddress}/${subnet.prefix}`],
    [labels.broadcast, subnet.hasBroadcast ? subnet.broadcastAddress : labels.noBroadcast],
    [labels.range, `${subnet.firstUsable} – ${subnet.lastUsable}`],
    [labels.hosts, subnet.usableHosts.toLocaleString(language)],
    [labels.total, subnet.totalAddresses.toLocaleString(language)],
    [labels.kind, ADDRESS_KIND_LABELS[subnet.kind][language]]
  ] : [];

  return (
    <div className="space-y-8">
      <header className="rounded-xl border border-slate-200 bg-white p-6 md:p-8">
        <p className="eyebrow">CCNA 1.1 → 1.10 · 1.12 · 1.13</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">{labels.title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{labels.subtitle}</p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="components-title">
        <div className="flex items-center gap-3"><Router className="h-5 w-5 text-indigo-600" /><h2 id="components-title" className="text-lg font-semibold text-slate-900">{labels.components}</h2></div>
        <p className="mt-3 max-w-4xl text-xs leading-relaxed text-slate-600">{labels.componentsNote}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {NETWORK_COMPONENTS.map(component => (
            <article key={component.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
                <h3 className="text-sm font-semibold text-slate-900">{component.name[language]}</h3>
                <span className="eyebrow shrink-0">{component.layer}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600"><strong className="text-slate-700">{labels.decision}:</strong> {component.decision[language]}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-sky-900"><strong>{labels.boundary}:</strong> {component.boundary[language]}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-amber-900"><strong>{labels.notThis}:</strong> {component.notThis[language]}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="topology-title">
        <div className="flex items-center gap-3"><Workflow className="h-5 w-5 text-violet-600" /><h2 id="topology-title" className="text-lg font-semibold text-slate-900">{labels.topology}</h2></div>
        <div className="mt-4">
          <ResponsiveTable
            rows={TOPOLOGY_ARCHITECTURES}
            rowKey={row => row.id}
            label={labels.topology}
            minWidth={880}
            columns={[
              { id: 'name', header: labels.topology, heading: true, cell: row => row.name[language] },
              { id: 'shape', header: labels.shape, cell: row => row.shape[language] },
              { id: 'when', header: labels.whenToUse, cell: row => row.whenToUse[language] },
              { id: 'tradeoff', header: labels.tradeOff, cellClassName: 'text-amber-900', cell: row => row.tradeOff[language] }
            ]}
          />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="cabling-title">
        <div className="flex items-center gap-3"><Cable className="h-5 w-5 text-sky-600" /><h2 id="cabling-title" className="text-lg font-semibold text-slate-900">{labels.cabling}</h2></div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {CABLING_TYPES.map(cable => (
            <article key={cable.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
                <h3 className="text-sm font-semibold text-slate-900">{cable.name[language]}</h3>
                <span className="eyebrow min-w-0">{typeof cable.reach === 'string' ? cable.reach : cable.reach[language]}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{cable.medium[language]}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600"><strong className="text-slate-700">{labels.useCase}:</strong> {cable.useCase[language]}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-amber-900"><strong>{labels.trap}:</strong> {cable.trap[language]}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="subnet-title">
        <div className="flex items-center gap-3">
          <Calculator className="h-5 w-5 text-indigo-600" />
          <h2 id="subnet-title" className="text-lg font-semibold text-slate-900">{labels.calculator}</h2>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_160px]">
          <label className="space-y-1.5 text-xs font-medium text-slate-600">
            {labels.address}
            <input value={address} onChange={(event) => setAddress(event.target.value)} inputMode="decimal" className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          </label>
          <label className="space-y-1.5 text-xs font-medium text-slate-600">
            {labels.prefix}
            <input type="number" min={0} max={32} value={prefix} onChange={(event) => setPrefix(Number(event.target.value))} className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
          </label>
        </div>

        {calculation.error ? (
          <div className="mt-5 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">
            <AlertTriangle className="h-4 w-4 shrink-0" /> {labels.invalid}
          </div>
        ) : subnet ? (
          <div className="mt-6 space-y-6">
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {summary.map(([label, value]) => (
                <div key={label} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
                  <dd className="mt-1 break-words font-mono text-sm font-semibold text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <Binary className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-semibold text-slate-900">{labels.binary}</h3>
              </div>
              <div className="mt-3 space-y-3 overflow-x-auto">
                <BinaryStrip octets={subnet.binaryAddress} prefix={subnet.prefix} />
                <BinaryStrip octets={subnet.binaryMask} prefix={subnet.prefix} />
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-slate-500">
                <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-indigo-100" />{labels.networkBits}: {subnet.prefix}</span>
                <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-amber-50" />{labels.hostBits}: {32 - subnet.prefix}</span>
              </div>
            </div>

            {subnet.pointToPoint || subnet.hostRoute ? (
              <p className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-xs leading-relaxed text-sky-800">
                {subnet.pointToPoint ? labels.special31 : labels.special32}
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      <VlsmPlanner />

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="ipv6-title">
        <div className="flex items-center gap-3">
          <Binary className="h-5 w-5 text-violet-600" />
          <h2 id="ipv6-title" className="text-lg font-semibold text-slate-900">{labels.ipv6}</h2>
        </div>

        <label className="mt-5 block space-y-1.5 text-xs font-medium text-slate-600">
          {labels.ipv6Address}
          <input value={ipv6Address} onChange={(event) => setIpv6Address(event.target.value)} spellCheck={false} className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
        </label>

        {ipv6Calculation.error ? (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert"><AlertTriangle className="h-4 w-4 shrink-0" />{labels.ipv6Invalid}</div>
        ) : ipv6Calculation.details ? (
          <dl className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 md:col-span-2"><dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{labels.expanded}</dt><dd className="mt-1 break-all font-mono text-xs font-semibold text-slate-800">{ipv6Calculation.details.expanded}{ipv6Calculation.details.prefix !== undefined ? `/${ipv6Calculation.details.prefix}` : ''}</dd></div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3"><dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{labels.ipv6Type}</dt><dd className="mt-1 text-xs font-semibold text-slate-800">{IPV6_KIND_LABELS[ipv6Calculation.details.kind][language]}</dd></div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 md:col-span-3"><dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{labels.compressed}</dt><dd className="mt-1 break-all font-mono text-sm font-semibold text-violet-700">{ipv6Calculation.details.compressed}{ipv6Calculation.details.prefix !== undefined ? `/${ipv6Calculation.details.prefix}` : ''}</dd></div>
          </dl>
        ) : null}

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-900">{labels.eui64}</h3>
            <label className="mt-3 block space-y-1.5 text-xs font-medium text-slate-600">{labels.mac}<input value={macAddress} onChange={(event) => setMacAddress(event.target.value)} spellCheck={false} className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" /></label>
            {eui64Calculation.error ? <p className="mt-3 text-xs text-rose-700" role="alert">{labels.macInvalid}</p> : <p className="mt-3 text-xs text-slate-500">{labels.interfaceId}: <code className="font-semibold text-violet-700">{eui64Calculation.value}</code></p>}
          </div>
          <div className="rounded-lg border border-violet-100 bg-violet-50/50 p-4">
            <h3 className="text-sm font-semibold text-violet-900">Anycast</h3>
            <p className="mt-2 text-xs leading-relaxed text-violet-900/80">{labels.anycast}</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="transport-title">
        <h2 id="transport-title" className="text-lg font-semibold text-slate-900">{labels.transport}</h2>
        <div className="mt-4">
          <ResponsiveTable
            rows={TRANSPORT_ROWS}
            rowKey={row => row.property.en}
            label={labels.transport}
            breakpoint="md"
            minWidth={620}
            columns={[
              { id: 'property', header: language === 'it' ? 'Proprietà' : 'Property', heading: true, cell: row => row.property[language] },
              { id: 'tcp', header: 'TCP', headerClassName: 'text-indigo-600', cell: row => row.tcp[language] },
              { id: 'udp', header: 'UDP', headerClassName: 'text-amber-600', cell: row => row.udp[language] }
            ]}
          />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="diagnostics-title">
        <div className="flex items-center gap-3"><Cable className="h-5 w-5 text-sky-600" /><h2 id="diagnostics-title" className="text-lg font-semibold text-slate-900">{labels.diagnostics}</h2></div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {INTERFACE_STATES.map(item => <article key={item.state} className="rounded-lg border border-slate-200 p-4"><code className="text-xs font-semibold text-sky-700">{item.state}</code><p className="mt-3 text-xs leading-relaxed text-slate-600"><strong>{labels.cause}:</strong> {item.cause[language]}</p><p className="mt-2 text-xs leading-relaxed text-slate-600"><strong>{labels.action}:</strong> {item.action[language]}</p></article>)}
        </div>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-emerald-300"><code>show ip interface brief{`\n`}show interfaces{`\n`}show interfaces counters errors{`\n`}show controllers ethernet-controller</code></pre>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="switching-title">
        <div className="flex items-center gap-3"><Network className="h-5 w-5 text-indigo-600" /><h2 id="switching-title" className="text-lg font-semibold text-slate-900">{labels.switching}</h2></div>
        <p className="mt-3 max-w-4xl text-xs leading-relaxed text-slate-600">{labels.switchingNote}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {SWITCHING_CONCEPTS.map(item => <article key={item.title.en} className="rounded-lg border border-slate-200 p-4"><h3 className="text-sm font-semibold text-slate-900">{item.title[language]}</h3><p className="mt-2 text-xs leading-relaxed text-slate-600">{item.detail[language]}</p></article>)}
        </div>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-emerald-300"><code>show mac address-table dynamic{`\n`}show mac address-table count{`\n`}show mac address-table aging-time{`\n`}show interfaces status</code></pre>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="virtualization-title">
        <div className="flex items-center gap-3"><Server className="h-5 w-5 text-violet-600" /><h2 id="virtualization-title" className="text-lg font-semibold text-slate-900">{labels.virtualization}</h2></div>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {VIRTUALIZATION_ROWS.map(item => (
            <article key={item.title.en} className="rounded-lg border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-900">{item.title[language]}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{item.detail[language]}</p>
              <p className="mt-3 border-t border-slate-100 pt-3 text-xs leading-relaxed text-violet-900"><strong>{labels.virtualizationImpact}:</strong> {item.network[language]}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="client-ip-title">
        <div className="flex items-center gap-3"><Laptop className="h-5 w-5 text-sky-600" /><h2 id="client-ip-title" className="text-lg font-semibold text-slate-900">{labels.clientIp}</h2></div>
        <p className="mt-3 max-w-4xl text-xs leading-relaxed text-slate-600">{labels.clientNote}</p>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {CLIENT_IP_COMMANDS.map(item => (
            <article key={item.os} className="rounded-lg border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-900">{item.os}</h3>
              <pre className="mt-2 overflow-x-auto rounded-md bg-slate-950 p-3 text-[11px] leading-relaxed text-sky-300"><code>{item.commands}</code></pre>
              <p className="mt-3 text-xs leading-relaxed text-slate-600"><strong>{labels.clientRead}:</strong> {item.read[language]}</p>
            </article>
          ))}
        </div>
        <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-slate-500">{labels.clientSymptoms}</h3>
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          {CLIENT_IP_SYMPTOMS.map(item => {
            const symptom = typeof item.symptom === 'string' ? item.symptom : item.symptom[language];
            return <article key={typeof item.symptom === 'string' ? item.symptom : item.symptom.en} className="rounded-lg border border-slate-200 p-4"><code className="text-xs font-semibold text-sky-700">{symptom}</code><p className="mt-2 text-xs leading-relaxed text-slate-600">{item.meaning[language]}</p></article>;
          })}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="security-title">
        <div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-emerald-600" /><h2 id="security-title" className="text-lg font-semibold text-slate-900">{labels.security}</h2></div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <article className="rounded-lg border border-rose-100 bg-rose-50/50 p-4"><h3 className="text-sm font-semibold text-rose-800">{language === 'it' ? 'Superficie di attacco' : 'Attack surface'}</h3><ul className="mt-3 space-y-2 text-xs leading-relaxed text-rose-900/80">{ATTACK_ITEMS.map(item => <li key={item.en}>• {item[language]}</li>)}</ul></article>
          <article className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-4"><h3 className="text-sm font-semibold text-emerald-800">{language === 'it' ? 'Difese correlate' : 'Related defenses'}</h3><ul className="mt-3 space-y-2 text-xs leading-relaxed text-emerald-900/80">{DEFENSE_ITEMS.map(item => <li key={item.en}>• {item[language]}</li>)}</ul></article>
        </div>
      </section>
    </div>
  );
}

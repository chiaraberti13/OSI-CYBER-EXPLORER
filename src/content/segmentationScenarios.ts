import type { Bilingual } from '../types';
import type { CcnaDomainId } from './securityCoverage';
import type { SecurityPlane } from './securityTaxonomy';

export type SegmentationArea = 'layer2' | 'routed' | 'vrf' | 'management' | 'edge' | 'east-west' | 'overlay' | 'shared-services';

export interface SegmentationScenario {
  id: string;
  area: SegmentationArea;
  domains: CcnaDomainId[];
  planes: SecurityPlane[];
  techniqueIds: string[];
  controlIds: string[];
  title: Bilingual;
  architecture: Bilingual;
  trustFailure: Bilingual;
  packetPath: Bilingual[];
  controls: Bilingual[];
  verification: Bilingual[];
  limitation: Bilingual;
}

const b = (it: string, en: string): Bilingual => ({ it, en });

export const SEGMENTATION_SCENARIOS: SegmentationScenario[] = [
  {
    id: 'vlan-is-not-firewall', area: 'layer2', domains: ['network-access', 'security-fundamentals'], planes: ['data'], techniqueIds: ['vlan-switch-spoofing', 'vlan-double-tagging'], controlIds: ['segmentation-least-reachability', 'l2-first-hop-security'],
    title: b('VLAN: dominio di broadcast, non firewall', 'VLAN: broadcast domain, not firewall'),
    architecture: b('Le VLAN separano il forwarding Layer 2; appena un router, uno switch multilayer o un firewall instrada tra SVI, la policy dipende dal punto Layer 3.', 'VLANs separate Layer 2 forwarding; as soon as a router, multilayer switch, or firewall routes between SVIs, policy depends on the Layer 3 enforcement point.'),
    trustFailure: b('Una VLAN viene considerata erroneamente un confine di sicurezza anche se l’inter-VLAN routing è aperto o il trunk trasporta VLAN non necessarie.', 'A VLAN is incorrectly treated as a security boundary even though inter-VLAN routing is open or the trunk carries unnecessary VLANs.'),
    packetPath: [b('Il frame resta nella VLAN fino al default gateway.', 'The frame remains in the VLAN until it reaches the default gateway.'), b('Il gateway esegue il route lookup verso la VLAN di destinazione.', 'The gateway performs a route lookup toward the destination VLAN.'), b('Senza ACL o firewall, il pacchetto viene reinoltrato nel nuovo dominio Layer 2.', 'Without an ACL or firewall, the packet is forwarded into the new Layer 2 domain.')],
    controls: [b('Trunk statici, pruning e native VLAN inutilizzata.', 'Static trunks, pruning, and an unused native VLAN.'), b('Policy inter-VLAN esplicita, deny by default e logging mirato.', 'Explicit inter-VLAN policy, deny by default, and targeted logging.')],
    verification: [b('`show interfaces trunk`, `show vlan brief` e `show ip route`.', '`show interfaces trunk`, `show vlan brief`, and `show ip route`.'), b('Testa flussi consentiti e negati attraversando realmente il gateway.', 'Test allowed and denied flows by actually traversing the gateway.')],
    limitation: b('Un test nello stesso subnet non attraversa l’ACL dell’SVI e non dimostra l’isolamento inter-VLAN.', 'A same-subnet test does not traverse the SVI ACL and does not prove inter-VLAN isolation.')
  },
  {
    id: 'acl-direction-placement', area: 'routed', domains: ['ip-connectivity', 'security-fundamentals'], planes: ['data'], techniqueIds: ['inter-vlan-policy-bypass', 'ip-spoofing'], controlIds: ['segmentation-least-reachability', 'source-validation-copp'],
    title: b('Direzione e posizionamento delle ACL', 'ACL direction and placement'),
    architecture: b('Le ACL IOS sono elaborate in ingresso o uscita rispetto all’interfaccia, non rispetto all’intenzione “verso” o “da” una rete.', 'IOS ACLs are processed inbound or outbound relative to the interface, not relative to the intent of traffic going “to” or “from” a network.'),
    trustFailure: b('Una ACL corretta ma applicata all’interfaccia o nella direzione sbagliata lascia un percorso aperto o interrompe traffico legittimo.', 'A correct ACL applied to the wrong interface or direction leaves a path open or interrupts legitimate traffic.'),
    packetPath: [b('Identifica interfaccia d’ingresso, sorgente e destinazione.', 'Identify the ingress interface, source, and destination.'), b('Applica l’ACL inbound prima del route lookup oppure outbound dopo la decisione di routing.', 'Apply the inbound ACL before the route lookup or the outbound ACL after the routing decision.'), b('La prima ACE corrispondente decide; resta sempre l’implicito `deny any` finale.', 'The first matching ACE decides; the final implicit `deny any` always remains.')],
    controls: [b('ACE specifiche ordinate prima delle regole generiche e remark descrittivi.', 'Specific ACEs ordered before broad rules, with descriptive remarks.'), b('Anti-spoofing all’ingresso e change plan con rollback.', 'Ingress anti-spoofing and a change plan with rollback.')],
    verification: [b('`show ip interface`, `show access-lists` e incremento dei contatori attesi.', '`show ip interface`, `show access-lists`, and expected counter increments.'), b('Traccia il percorso nelle due direzioni: la policy di ritorno può essere diversa.', 'Trace the path in both directions: return-path policy may differ.')],
    limitation: b('Una ACL stateless non conserva lo stato della sessione; traffico di ritorno e protocolli dinamici richiedono regole coerenti.', 'A stateless ACL does not retain session state; return traffic and dynamic protocols require consistent rules.')
  },
  {
    id: 'vrf-route-leaking', area: 'vrf', domains: ['network-fundamentals', 'ip-connectivity', 'security-fundamentals'], planes: ['control', 'data'], techniqueIds: ['vrf-route-leak'], controlIds: ['segmentation-least-reachability', 'routing-trust-policy'],
    title: b('VRF e route leaking controllato', 'VRFs and controlled route leaking'),
    architecture: b('Una VRF mantiene tabelle di routing separate sullo stesso apparato. La separazione termina quando route target, static route, firewall o shared service importano raggiungibilità tra VRF.', 'A VRF maintains separate routing tables on the same device. Separation ends when route targets, static routes, firewalls, or shared services import reachability between VRFs.'),
    trustFailure: b('Un leak troppo ampio, una default route condivisa o una route importata per errore espone prefissi di un tenant o dominio di fiducia.', 'An overly broad leak, shared default route, or mistakenly imported route exposes prefixes from another tenant or trust domain.'),
    packetPath: [b('Il route lookup avviene nella VRF dell’interfaccia d’ingresso.', 'The route lookup occurs in the ingress interface VRF.'), b('Solo una route importata o un percorso esplicito permette di uscire dalla tabella.', 'Only an imported route or explicit path allows traffic to leave the table.'), b('Il ritorno deve avere route e policy simmetriche o consapevoli dell’asimmetria.', 'The return path must have symmetric routes and policy or be designed for asymmetry.')],
    controls: [b('Allowlist di prefissi importati/esportati e firewall tra domini.', 'Allowlisted imported/exported prefixes and a firewall between domains.'), b('Source of truth, review delle route target e maximum-prefix dove applicabile.', 'A source of truth, route-target review, and maximum-prefix where applicable.')],
    verification: [b('`show ip route vrf <VRF>` e lookup per sorgente/destinazione.', '`show ip route vrf <VRF>` and source/destination lookups.'), b('Confronta RIB, FIB/CEF e sessioni del firewall per entrambe le direzioni.', 'Compare the RIB, FIB/CEF, and firewall sessions in both directions.')],
    limitation: b('VRF separa il routing, ma non corregge servizi condivisi, management o policy applicative configurati senza isolamento.', 'A VRF separates routing, but it does not fix shared services, management, or application policy configured without isolation.')
  },
  {
    id: 'management-plane-isolation', area: 'management', domains: ['ip-services', 'security-fundamentals'], planes: ['management', 'identity'], techniqueIds: ['management-plane-exposure', 'ssh-management-attacks', 'snmp-community-abuse'], controlIds: ['management-plane-isolation', 'aaa-privileged-access'],
    title: b('Isolamento del management plane', 'Management-plane isolation'),
    architecture: b('SSH, SNMP, API, AAA, syslog e NTP appartengono a un piano di gestione che dovrebbe usare interfacce, VRF o reti amministrative dedicate.', 'SSH, SNMP, APIs, AAA, syslog, and NTP belong to a management plane that should use dedicated interfaces, VRFs, or administrative networks.'),
    trustFailure: b('Un’interfaccia utente o Internet può raggiungere servizi amministrativi, oppure il fallback locale aggira AAA e accounting centralizzati.', 'A user-facing or Internet interface can reach administrative services, or local fallback bypasses centralized AAA and accounting.'),
    packetPath: [b('Il traffico di gestione entra da una sorgente autorizzata.', 'Management traffic enters from an authorized source.'), b('Management VRF/ACL limita destinazione, protocollo e jump host.', 'The management VRF/ACL restricts destination, protocol, and jump host.'), b('AAA autentica e autorizza; accounting e syslog registrano l’azione fuori dispositivo.', 'AAA authenticates and authorizes; accounting and syslog record the action off-device.')],
    controls: [b('OOB quando possibile; in-band dedicato con management VRF e ACL.', 'OOB where possible; dedicated in-band access with a management VRF and ACLs.'), b('SSHv2, SNMPv3, TACACS+/RADIUS ridondanti, MFA sul jump host e CoPP.', 'SSHv2, SNMPv3, redundant TACACS+/RADIUS, MFA on the jump host, and CoPP.')],
    verification: [b('Test positivo dal jump host e negativo da VLAN utente/guest.', 'Positive test from the jump host and negative test from user/guest VLANs.'), b('Verifica accounting, sorgente dei servizi e comportamento del fallback AAA.', 'Verify accounting, service source interfaces, and AAA fallback behavior.')],
    limitation: b('Una management VRF non è realmente out-of-band se condivide failure domain, alimentazione e uplink con la rete di produzione.', 'A management VRF is not truly out of band if it shares the production network’s failure domain, power, and uplinks.')
  },
  {
    id: 'guest-iot-boundary', area: 'edge', domains: ['network-access', 'ip-services', 'security-fundamentals'], planes: ['data', 'identity'], techniqueIds: ['rogue-device', 'nac-posture-bypass', 'inter-vlan-policy-bypass'], controlIds: ['dot1x-nac', 'segmentation-least-reachability'],
    title: b('Confini guest, IoT e dispositivi non gestiti', 'Guest, IoT, and unmanaged-device boundaries'),
    architecture: b('Guest e IoT richiedono segmenti e policy distinti perché identità, capacità di patching e flussi necessari differiscono dagli endpoint gestiti.', 'Guest and IoT require distinct segments and policies because identity, patchability, and required flows differ from managed endpoints.'),
    trustFailure: b('MAB o profiling vengono trattati come autenticazione forte e assegnano a un dispositivo clonabile lo stesso accesso di un endpoint gestito.', 'MAB or profiling is treated as strong authentication and grants a clonable device the same access as a managed endpoint.'),
    packetPath: [b('802.1X/EAP autentica; MAB è solo fallback identificativo.', '802.1X/EAP authenticates; MAB is only an identifying fallback.'), b('NAC assegna VLAN, SGT o policy in base a identità e postura.', 'NAC assigns a VLAN, SGT, or policy based on identity and posture.'), b('Firewall/DNS policy permette soltanto servizi necessari e uscita Internet controllata.', 'Firewall/DNS policy permits only required services and controlled Internet access.')],
    controls: [b('EAP-TLS per gestiti, segmenti limitati per guest/IoT e client isolation.', 'EAP-TLS for managed devices, restricted guest/IoT segments, and client isolation.'), b('Allowlist dei flussi, DNS/NTP controllati e blocco del management interno.', 'Flow allowlists, controlled DNS/NTP, and blocked internal management access.')],
    verification: [b('`show authentication sessions details` e attributi restituiti da RADIUS.', '`show authentication sessions details` and attributes returned by RADIUS.'), b('Testa Internet, servizi necessari e negazione laterale tra client.', 'Test Internet access, required services, and denied lateral client-to-client access.')],
    limitation: b('La classificazione del device non prova che il dispositivo sia integro; serve contenimento anche dopo l’ammissione.', 'Device classification does not prove the device is uncompromised; containment is still required after admission.')
  },
  {
    id: 'east-west-lateral', area: 'east-west', domains: ['network-access', 'security-fundamentals'], planes: ['data', 'identity'], techniqueIds: ['east-west-lateral-movement', 'credential-attacks', 'malware-ransomware'], controlIds: ['segmentation-least-reachability', 'dot1x-nac', 'firewall-ids-ips'],
    title: b('Movimento laterale east–west', 'East–west lateral movement'),
    architecture: b('Il firewall perimetrale osserva il traffico north–south; host nello stesso segmento o tra segmenti interni possono comunicare senza attraversarlo.', 'The perimeter firewall observes north–south traffic; hosts in the same segment or across internal segments may communicate without traversing it.'),
    trustFailure: b('Credenziali o endpoint compromessi sfruttano protocolli amministrativi e condivisioni interne consentite troppo ampiamente.', 'Compromised credentials or endpoints exploit administrative protocols and internal shares that are permitted too broadly.'),
    packetPath: [b('Nello stesso VLAN il traffico può essere commutato localmente.', 'Within the same VLAN, traffic may be switched locally.'), b('Tra subnet il percorso può attraversare core, firewall interno o policy distribuita.', 'Between subnets, the path may traverse the core, an internal firewall, or distributed policy.'), b('DNS, identità e servizi condivisi possono creare percorsi indiretti.', 'DNS, identity, and shared services can create indirect paths.')],
    controls: [b('Segmenti per funzione/sensibilità, host firewall e tiering amministrativo.', 'Segments by function/sensitivity, host firewalls, and administrative tiering.'), b('NAC dinamico, least privilege e telemetria east–west.', 'Dynamic NAC, least privilege, and east–west telemetry.')],
    verification: [b('Matrice dei flussi da più punti, non solo dal perimetro.', 'A flow matrix from multiple vantage points, not only the perimeter.'), b('NetFlow/EDR/firewall correlati con autenticazioni e asset inventory.', 'NetFlow/EDR/firewall data correlated with authentication and asset inventory.')],
    limitation: b('Microsegmentare senza conoscere i flussi produce regole permissive di emergenza o interruzioni difficili da diagnosticare.', 'Microsegmentation without flow knowledge produces permissive emergency rules or hard-to-diagnose outages.')
  },
  {
    id: 'overlay-tenant-boundary', area: 'overlay', domains: ['network-fundamentals', 'automation-programmability', 'security-fundamentals'], planes: ['control', 'data', 'management'], techniqueIds: ['overlay-tenant-escape', 'controller-compromise', 'automation-supply-chain-drift'], controlIds: ['segmentation-least-reachability', 'automation-guardrails'],
    title: b('Overlay, tenant e policy del controller', 'Overlay, tenants, and controller policy'),
    architecture: b('VXLAN/fabric e policy controller-based separano tenant e gruppi logici sopra un underlay IP condiviso.', 'VXLAN/fabric and controller-based policy separate tenants and logical groups over a shared IP underlay.'),
    trustFailure: b('Mapping errati tra endpoint, VNI/segmento o policy del controller collegano domini che dovrebbero rimanere isolati.', 'Incorrect endpoint-to-VNI/segment mappings or controller policy connect domains that should remain isolated.'),
    packetPath: [b('L’edge classifica endpoint e segmento logico.', 'The edge classifies the endpoint and logical segment.'), b('L’overlay incapsula il traffico attraverso l’underlay.', 'The overlay encapsulates traffic across the underlay.'), b('L’egress decapsula e applica policy coerente con identità e destinazione.', 'The egress decapsulates and applies policy consistent with identity and destination.')],
    controls: [b('RBAC sul controller, template versionati, approval e canary.', 'Controller RBAC, versioned templates, approval, and canaries.'), b('Allowlist dei mapping tenant/VNI e telemetria su overlay e underlay.', 'Allowlisted tenant/VNI mappings and telemetry across overlay and underlay.')],
    verification: [b('Confronta intent, configurazione distribuita e stato effettivo sui nodi.', 'Compare intent, distributed configuration, and actual node state.'), b('Testa isolamento tenant e osserva entrambi gli header nella capture.', 'Test tenant isolation and observe both headers in captures.')],
    limitation: b('Un underlay raggiungibile non prova che segmentazione, endpoint mapping o policy overlay siano corretti.', 'A reachable underlay does not prove that overlay segmentation, endpoint mapping, or policy is correct.')
  },
  {
    id: 'shared-services-asymmetry', area: 'shared-services', domains: ['ip-connectivity', 'ip-services', 'security-fundamentals'], planes: ['data', 'application'], techniqueIds: ['vrf-route-leak', 'dual-stack-policy-bypass', 'session-hijack-reset'], controlIds: ['segmentation-least-reachability', 'dual-stack-policy-parity', 'telemetry-independent-evidence'],
    title: b('Servizi condivisi e routing asimmetrico', 'Shared services and asymmetric routing'),
    architecture: b('DNS, NTP, identity, proxy e logging possono servire più zone attraverso firewall, route leaking o load balancer.', 'DNS, NTP, identity, proxies, and logging may serve multiple zones through firewalls, route leaking, or load balancers.'),
    trustFailure: b('Una default route o un percorso di ritorno diverso evita il controllo stateful, mentre una regola “shared services” troppo ampia diventa un ponte tra zone.', 'A default route or different return path bypasses a stateful control, while an overly broad “shared services” rule becomes a bridge between zones.'),
    packetPath: [b('La richiesta attraversa il punto di policy verso il servizio condiviso.', 'The request traverses the policy point toward the shared service.'), b('NAT, proxy o load balancer possono modificare indirizzi e stato osservato.', 'NAT, a proxy, or a load balancer may change observed addresses and state.'), b('La risposta deve tornare attraverso un percorso compatibile con lo stato creato.', 'The response must return through a path compatible with the created state.')],
    controls: [b('Policy per servizio/porta e sorgenti specifiche, non regole any-any tra zone.', 'Policy by service/port and specific sources, not any-any rules between zones.'), b('Routing simmetrico quando richiesto e logging correlato prima/dopo NAT.', 'Symmetric routing where required and correlated logging before/after NAT.')],
    verification: [b('Route lookup, session table, NAT translation e capture sui due lati.', 'Route lookup, session table, NAT translation, and captures on both sides.'), b('Ripeti i test su IPv4 e IPv6 e durante il failover.', 'Repeat tests over IPv4 and IPv6 and during failover.')],
    limitation: b('Il ping può riuscire mentre la sessione applicativa fallisce per stato, DNS, MTU, TLS o percorso di ritorno.', 'Ping may succeed while the application session fails because of state, DNS, MTU, TLS, or the return path.')
  }
];

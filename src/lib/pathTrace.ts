import type { Bilingual } from '../types';
import { ipv4ToUint, prefixToMask } from './ipv4';
import { evaluateTrunkFrame } from './networkAccess';
import { selectBestRoutes, type Ipv4Route } from './ipConnectivity';
import { evaluateIpv4Acl, type AclRule, type PacketDescriptor } from './securityFundamentals';
import { createPatTranslation } from './ipServices';
import { TOPO_HOSTS, TOPO_INTERNET, TOPO_LINKS, TOPO_VLANS, type TopoHost } from '../content/pathTopology';

/**
 * Walks one packet across the reference topology and records every decision.
 *
 * This module deliberately adds no new network logic: the host's local/remote
 * decision, the trunk, the routing table, the ACL and the translation are the same
 * tested functions the individual labs already use. What was missing was a place
 * where they run one after another, so a learner can see that a packet is just a
 * sequence of independent decisions — and see exactly which one dropped it.
 */

export type StepKind = 'host' | 'arp' | 'switch' | 'trunk' | 'svi' | 'acl' | 'route' | 'nat' | 'delivery';
export type StepVerdict = 'forward' | 'drop' | 'info';

export interface TraceStep {
  kind: StepKind;
  /** Which device makes this decision. */
  device: string;
  title: Bilingual;
  detail: Bilingual;
  /** The command that would prove this step on a real device. */
  evidence?: string;
  verdict: StepVerdict;
}

export interface TraceResult {
  steps: TraceStep[];
  delivered: boolean;
  /** Why the packet stopped, when it did. */
  dropReason?: Bilingual;
  /** True when the packet never left Layer 2, so no ACL or route was ever consulted. */
  layer2Only: boolean;
  /** The translated source, when NAT rewrote it. */
  translatedSource?: string;
}

export type AclPlacement = 'inbound-users' | 'outbound-servers' | 'none';

export interface TraceOptions {
  sourceId: string;
  /** A host id, or 'internet'. */
  destinationId: string;
  protocol: 'tcp' | 'icmp';
  port?: number;
  aclPlacement: AclPlacement;
  /** VLANs the access-to-core trunk carries. */
  trunkAllowedVlans: number[];
  /** False simulates the classic native-VLAN mismatch between the two trunk ends. */
  nativeVlanConsistent: boolean;
  natEnabled: boolean;
  defaultRoutePresent: boolean;
}

const b = (it: string, en: string): Bilingual => ({ it, en });

/** The ACL of the reference topology, as rules the evaluator can run. */
const ACL_RULES: AclRule[] = [
  { sequence: 10, action: 'deny', protocol: 'tcp', source: { address: '10.10.10.0', wildcard: '0.0.0.255' }, destination: { address: '0.0.0.0', wildcard: '255.255.255.255' }, destinationPort: 23, log: true },
  { sequence: 20, action: 'permit', protocol: 'tcp', source: { address: '10.10.10.0', wildcard: '0.0.0.255' }, destination: { address: '10.20.50.0', wildcard: '0.0.0.255' }, destinationPort: 443 },
  { sequence: 30, action: 'permit', protocol: 'tcp', source: { address: '10.10.10.0', wildcard: '0.0.0.255' }, destination: { address: '0.0.0.0', wildcard: '255.255.255.255' }, destinationPort: 443 },
  { sequence: 40, action: 'permit', protocol: 'icmp', source: { address: '0.0.0.0', wildcard: '255.255.255.255' }, destination: { address: '0.0.0.0', wildcard: '255.255.255.255' } }
];

function hostById(id: string): TopoHost | undefined {
  return TOPO_HOSTS.find(host => host.id === id);
}

function vlanOf(id: number) {
  const vlan = TOPO_VLANS.find(item => item.id === id);
  if (!vlan) throw new Error('UNKNOWN_VLAN');
  return vlan;
}

/** Same-subnet test from the sender's point of view: its own mask, not the destination's. */
function sameSubnet(sourceIp: string, destinationIp: string, prefix: number): boolean {
  const mask = prefixToMask(prefix);
  return ((ipv4ToUint(sourceIp) & mask) >>> 0) === ((ipv4ToUint(destinationIp) & mask) >>> 0);
}

/** The multilayer switch routing table: three connected SVIs plus an optional default. */
function coreRoutes(defaultRoutePresent: boolean): Ipv4Route[] {
  const routes: Ipv4Route[] = TOPO_VLANS.map(vlan => ({
    id: `vlan${vlan.id}`,
    source: 'connected',
    network: vlan.gateway,
    prefix: vlan.prefix,
    administrativeDistance: 0,
    metric: 0,
    exitInterface: `Vlan${vlan.id}`
  }));
  routes.push({
    id: 'p2p-edge',
    source: 'connected',
    network: TOPO_LINKS.coreToEdge.network,
    prefix: TOPO_LINKS.coreToEdge.prefix,
    administrativeDistance: 0,
    metric: 0,
    exitInterface: 'Gi1/0/48'
  });
  if (defaultRoutePresent) {
    routes.push({
      id: 'default',
      source: 'static',
      network: '0.0.0.0',
      prefix: 0,
      administrativeDistance: 1,
      metric: 0,
      nextHop: TOPO_LINKS.coreToEdge.edgeIp,
      exitInterface: 'Gi1/0/48'
    });
  }
  return routes;
}

function aclStep(device: string, direction: 'in' | 'out', packet: PacketDescriptor): TraceStep {
  const decision = evaluateIpv4Acl(ACL_RULES, packet);
  const where = direction === 'in'
    ? b('in ingresso sull’SVI della VLAN sorgente', 'inbound on the source VLAN SVI')
    : b('in uscita sull’SVI della VLAN di destinazione', 'outbound on the destination VLAN SVI');
  const matched = decision.implicit
    ? b('nessuna ACE corrisponde, quindi decide il deny implicito finale', 'no ACE matches, so the final implicit deny decides')
    : b(`corrisponde la ACE ${decision.matchedSequence}`, `ACE ${decision.matchedSequence} matches`);

  return {
    kind: 'acl',
    device,
    title: decision.action === 'permit'
      ? b('ACL: PERMIT', 'ACL: PERMIT')
      : b('ACL: DENY', 'ACL: DENY'),
    detail: b(
      `ACL valutata ${where.it}: ${matched.it}.${decision.action === 'deny' ? ' Il pacchetto viene scartato qui, prima di qualunque decisione di routing successiva.' : ''}`,
      `ACL evaluated ${where.en}: ${matched.en}.${decision.action === 'deny' ? ' The packet is dropped here, before any later routing decision.' : ''}`
    ),
    evidence: 'show access-lists · show ip interface',
    verdict: decision.action === 'permit' ? 'forward' : 'drop'
  };
}

export function tracePath(options: TraceOptions): TraceResult {
  const steps: TraceStep[] = [];
  const source = hostById(options.sourceId);
  if (!source) throw new Error('UNKNOWN_SOURCE');

  const toInternet = options.destinationId === TOPO_INTERNET.id;
  const destination = toInternet ? undefined : hostById(options.destinationId);
  if (!toInternet && !destination) throw new Error('UNKNOWN_DESTINATION');

  const destinationIp = toInternet ? TOPO_INTERNET.ip : destination!.ip;
  const sourceVlan = vlanOf(source.vlan);
  const local = !toInternet && sameSubnet(source.ip, destinationIp, sourceVlan.prefix);

  // ---- 1. The sending host decides local or remote -------------------------------
  steps.push({
    kind: 'host',
    device: source.name,
    title: local
      ? b('Destinazione nella stessa subnet', 'Destination in the same subnet')
      : b('Destinazione fuori dalla subnet', 'Destination outside the subnet'),
    detail: local
      ? b(`${source.ip}/${sourceVlan.prefix} e ${destinationIp} stanno nella stessa subnet: l’host consegna direttamente, senza coinvolgere il gateway.`,
          `${source.ip}/${sourceVlan.prefix} and ${destinationIp} are in the same subnet: the host delivers directly, without involving the gateway.`)
      : b(`Applicando la propria mask /${sourceVlan.prefix}, l’host vede ${destinationIp} fuori dalla subnet: consegna al default gateway ${sourceVlan.gateway}.`,
          `Applying its own /${sourceVlan.prefix} mask, the host sees ${destinationIp} outside the subnet: it delivers to the default gateway ${sourceVlan.gateway}.`),
    evidence: 'ipconfig /all · ip route show',
    verdict: 'info'
  });

  // ---- 2. ARP resolves the next Layer 2 hop --------------------------------------
  steps.push({
    kind: 'arp',
    device: source.name,
    title: local ? b('ARP per la destinazione', 'ARP for the destination') : b('ARP per il gateway', 'ARP for the gateway'),
    detail: local
      ? b(`L’host chiede il MAC di ${destinationIp}. L’IP di destinazione nel pacchetto e il MAC di destinazione nel frame puntano allo stesso host.`,
          `The host asks for the MAC of ${destinationIp}. The destination IP in the packet and the destination MAC in the frame point to the same host.`)
      : b(`L’host chiede il MAC di ${sourceVlan.gateway}. L’IP di destinazione resta ${destinationIp}, ma il MAC di destinazione diventa quello del gateway: è la distinzione che molti confondono.`,
          `The host asks for the MAC of ${sourceVlan.gateway}. The destination IP stays ${destinationIp}, but the destination MAC becomes the gateway's: this is the distinction many people confuse.`),
    evidence: 'arp -a · show ip arp',
    verdict: 'info'
  });

  // ---- 3. The access switch forwards the frame -----------------------------------
  const destinationOnSameAccessSwitch = !toInternet && destination!.device === 'sw-access';
  const stayOnAccessSwitch = local && destinationOnSameAccessSwitch;

  if (source.device === 'sw-access') {
    steps.push({
      kind: 'switch',
      device: 'SW-ACCESS',
      title: b('Consultazione della CAM table', 'CAM table lookup'),
      detail: stayOnAccessSwitch
        ? b(`Il MAC di destinazione è appreso su ${destination!.port}, nella stessa VLAN ${source.vlan}: lo switch commuta il frame su quella porta e la decisione finisce qui.`,
            `The destination MAC is learned on ${destination!.port}, in the same VLAN ${source.vlan}: the switch forwards the frame out that port and the decision ends here.`)
        : b(`Il MAC di destinazione (il gateway) è raggiungibile dall’uplink ${TOPO_LINKS.accessTrunk.port}: il frame esce dal trunk, ancora nella VLAN ${source.vlan}.`,
            `The destination MAC (the gateway) is reachable through uplink ${TOPO_LINKS.accessTrunk.port}: the frame leaves on the trunk, still in VLAN ${source.vlan}.`),
      evidence: 'show mac address-table dynamic',
      verdict: 'forward'
    });
  }

  // A packet that never leaves its VLAN never meets the SVI, so it never meets the ACL.
  if (stayOnAccessSwitch) {
    steps.push({
      kind: 'delivery',
      device: destination!.name,
      title: b('Consegnato restando al Layer 2', 'Delivered while staying at Layer 2'),
      detail: b('Il traffico non ha attraversato alcun SVI, quindi nessuna ACL applicata a un’interfaccia di livello 3 lo ha visto. Una ACL sull’SVI non filtra il traffico intra-VLAN: per separare host della stessa VLAN servono Private VLAN, port ACL o segmentazione diversa.',
                'The traffic crossed no SVI, so no ACL applied to a Layer 3 interface ever saw it. An ACL on the SVI does not filter intra-VLAN traffic: separating hosts inside one VLAN needs private VLANs, a port ACL, or different segmentation.'),
      verdict: 'forward'
    });
    return { steps, delivered: true, layer2Only: true };
  }

  // ---- 4. The trunk between access and core -------------------------------------
  if (source.device === 'sw-access') {
    const trunk = evaluateTrunkFrame(source.vlan, TOPO_LINKS.accessTrunk.nativeVlan, options.trunkAllowedVlans);
    if (!trunk.forwarded) {
      steps.push({
        kind: 'trunk',
        device: 'SW-ACCESS',
        title: b('Trunk: VLAN non ammessa', 'Trunk: VLAN not allowed'),
        detail: b(`La VLAN ${source.vlan} non è nella allowed list del trunk (${options.trunkAllowedVlans.join(', ')}): il frame viene scartato sull’uplink. L’host resta raggiungibile dentro la propria VLAN, quindi il sintomo sembra un problema di gateway.`,
                  `VLAN ${source.vlan} is not in the trunk allowed list (${options.trunkAllowedVlans.join(', ')}): the frame is dropped on the uplink. The host stays reachable inside its own VLAN, so the symptom looks like a gateway problem.`),
        evidence: 'show interfaces trunk',
        verdict: 'drop'
      });
      return {
        steps,
        delivered: false,
        layer2Only: false,
        dropReason: b(`VLAN ${source.vlan} esclusa dalla allowed list del trunk`, `VLAN ${source.vlan} pruned from the trunk allowed list`)
      };
    }

    steps.push({
      kind: 'trunk',
      device: `SW-ACCESS ${TOPO_LINKS.accessTrunk.port}`,
      title: trunk.tagged ? b('Trunk: frame taggato 802.1Q', 'Trunk: frame tagged 802.1Q') : b('Trunk: native VLAN, frame non taggato', 'Trunk: native VLAN, untagged frame'),
      detail: trunk.tagged
        ? b(`La VLAN ${source.vlan} è ammessa e non è la native: il frame attraversa il trunk con il tag 802.1Q, che è come il core sa a quale SVI consegnarlo.`,
            `VLAN ${source.vlan} is allowed and is not the native VLAN: the frame crosses the trunk with its 802.1Q tag, which is how the core knows which SVI to hand it to.`)
        : b('Il frame appartiene alla native VLAN e attraversa il trunk senza tag.', 'The frame belongs to the native VLAN and crosses the trunk untagged.'),
      evidence: 'show interfaces trunk',
      verdict: 'forward'
    });

    if (!options.nativeVlanConsistent) {
      steps.push({
        kind: 'trunk',
        device: 'SW-CORE',
        title: b('Native VLAN mismatch rilevato', 'Native VLAN mismatch detected'),
        detail: b(`I due capi del trunk dichiarano native VLAN diverse. Il traffico taggato della VLAN ${source.vlan} continua a passare, quindi questo scenario non si interrompe — ma il traffico non taggato finisce nella VLAN sbagliata e CDP registra l’incoerenza: è il presupposto del double tagging.`,
                  `The two trunk ends declare different native VLANs. Tagged traffic in VLAN ${source.vlan} keeps flowing, so this scenario does not break — but untagged traffic lands in the wrong VLAN and CDP logs the inconsistency: this is the premise of double tagging.`),
        evidence: 'show cdp neighbors detail · show interfaces trunk',
        verdict: 'info'
      });
    }
  }

  // ---- 5. The SVI receives the frame and becomes a routing decision --------------
  const packet: PacketDescriptor = {
    protocol: options.protocol,
    sourceIp: source.ip,
    destinationIp,
    sourcePort: options.protocol === 'tcp' ? 49152 : undefined,
    destinationPort: options.port,
    tcpFlags: options.protocol === 'tcp' ? ['SYN'] : undefined
  };

  steps.push({
    kind: 'svi',
    device: `SW-CORE Vlan${source.vlan}`,
    title: b('L’SVI riceve il frame: da qui è routing', 'The SVI receives the frame: from here it is routing'),
    detail: b(`Il frame arriva all’SVI ${sourceVlan.gateway}, che è il default gateway della VLAN ${source.vlan}. Lo switch scarta l’header Ethernet, valuta il pacchetto IP e lo re-incapsula verso l’uscita scelta.`,
              `The frame reaches SVI ${sourceVlan.gateway}, the default gateway of VLAN ${source.vlan}. The switch strips the Ethernet header, evaluates the IP packet, and re-encapsulates it toward the chosen exit.`),
    evidence: `show ip interface brief | include Vlan${source.vlan}`,
    verdict: 'forward'
  });

  // The inbound ACL sits on the source SVI, so it is evaluated before the lookup.
  if (options.aclPlacement === 'inbound-users' && source.vlan === 10) {
    const step = aclStep(`SW-CORE Vlan${source.vlan}`, 'in', packet);
    steps.push(step);
    if (step.verdict === 'drop') {
      return { steps, delivered: false, layer2Only: false, dropReason: b('Scartato dalla ACL in ingresso', 'Dropped by the inbound ACL') };
    }
  }

  // ---- 6. Routing decision on the multilayer switch -----------------------------
  const routes = coreRoutes(options.defaultRoutePresent);
  const best = selectBestRoutes(routes, destinationIp);
  if (best.length === 0) {
    steps.push({
      kind: 'route',
      device: 'SW-CORE',
      title: b('Nessuna rotta corrispondente', 'No matching route'),
      detail: b(`Nessun prefisso in tabella corrisponde a ${destinationIp} e non esiste una default route: il pacchetto viene scartato e il mittente riceve ICMP Destination Unreachable.`,
                `No prefix in the table matches ${destinationIp} and there is no default route: the packet is dropped and the sender receives ICMP Destination Unreachable.`),
      evidence: `show ip route ${destinationIp}`,
      verdict: 'drop'
    });
    return { steps, delivered: false, layer2Only: false, dropReason: b('Nessuna rotta verso la destinazione', 'No route toward the destination') };
  }

  const chosen = best[0];
  steps.push({
    kind: 'route',
    device: 'SW-CORE',
    title: b('Longest prefix match nella routing table', 'Longest prefix match in the routing table'),
    detail: chosen.nextHop
      ? b(`Vince ${chosen.network}/${chosen.prefix} [${chosen.administrativeDistance}/${chosen.metric}] via ${chosen.nextHop}: la destinazione non è locale, quindi si passa al router di frontiera.`,
          `${chosen.network}/${chosen.prefix} [${chosen.administrativeDistance}/${chosen.metric}] via ${chosen.nextHop} wins: the destination is not local, so the packet goes to the edge router.`)
      : b(`Vince ${chosen.network}/${chosen.prefix}, direttamente connessa su ${chosen.exitInterface}: la destinazione è in una VLAN che questo switch possiede già.`,
          `${chosen.network}/${chosen.prefix} wins, directly connected on ${chosen.exitInterface}: the destination is in a VLAN this switch already owns.`),
    evidence: `show ip route ${destinationIp}`,
    verdict: 'forward'
  });

  // The outbound ACL sits on the destination SVI, so it is evaluated after the lookup.
  if (options.aclPlacement === 'outbound-servers' && !toInternet && destination!.vlan === 50) {
    const step = aclStep('SW-CORE Vlan50', 'out', packet);
    steps.push(step);
    if (step.verdict === 'drop') {
      return { steps, delivered: false, layer2Only: false, dropReason: b('Scartato dalla ACL in uscita', 'Dropped by the outbound ACL') };
    }
  }

  // ---- 7. The edge router, when the destination is outside ----------------------
  let translatedSource: string | undefined;
  if (toInternet) {
    if (!options.defaultRoutePresent) {
      // Already handled above, but kept explicit: without a default nothing reaches the edge.
      return { steps, delivered: false, layer2Only: false, dropReason: b('Nessuna default route', 'No default route') };
    }

    if (options.natEnabled) {
      const translation = createPatTranslation(source.ip, packet.sourcePort ?? 49152, TOPO_LINKS.edgeOutside.ip, new Set());
      translatedSource = translation.insideGlobal;
      steps.push({
        kind: 'nat',
        device: 'R-EDGE',
        title: b('NAT overload: traduzione della sorgente', 'NAT overload: source translation'),
        detail: b(`Inside local ${translation.insideLocal} diventa inside global ${translation.insideGlobal}. La traduzione crea lo stato che permetterà al traffico di ritorno di tornare all’host giusto; il range di allocazione della porta è ${translation.portRange[0]}-${translation.portRange[1]}.`,
                  `Inside local ${translation.insideLocal} becomes inside global ${translation.insideGlobal}. The translation creates the state that will let return traffic find the right host; the port allocation range is ${translation.portRange[0]}-${translation.portRange[1]}.`),
        evidence: 'show ip nat translations · show ip nat statistics',
        verdict: 'forward'
      });
    } else {
      steps.push({
        kind: 'nat',
        device: 'R-EDGE',
        title: b('NAT disattivato: sorgente privata sul link pubblico', 'NAT disabled: private source on the public link'),
        detail: b(`Il pacchetto esce con sorgente ${source.ip}, un indirizzo RFC 1918. Il provider lo scarta e in ogni caso nessuna risposta potrebbe tornare: il problema non è la raggiungibilità in uscita ma l’assenza di un indirizzo instradabile.`,
                  `The packet leaves with source ${source.ip}, an RFC 1918 address. The provider drops it, and no reply could come back anyway: the problem is not outbound reachability but the absence of a routable address.`),
        evidence: 'show ip nat statistics',
        verdict: 'drop'
      });
      return { steps, delivered: false, layer2Only: false, dropReason: b('Sorgente privata senza traduzione', 'Private source with no translation') };
    }

    steps.push({
      kind: 'route',
      device: 'R-EDGE',
      title: b('Default route verso il provider', 'Default route toward the provider'),
      detail: b(`0.0.0.0/0 via ${TOPO_LINKS.edgeOutside.nextHop} su ${TOPO_LINKS.edgeOutside.interface}: il pacchetto lascia la rete.`,
                `0.0.0.0/0 via ${TOPO_LINKS.edgeOutside.nextHop} on ${TOPO_LINKS.edgeOutside.interface}: the packet leaves the network.`),
      evidence: 'show ip route 0.0.0.0',
      verdict: 'forward'
    });
  }

  steps.push({
    kind: 'delivery',
    device: toInternet ? TOPO_INTERNET.name : destination!.name,
    title: b('Consegnato', 'Delivered'),
    detail: toInternet
      ? b(`Il pacchetto raggiunge ${destinationIp} presentandosi come ${translatedSource}. La consegna in andata non prova nulla sul ritorno: quello dipende dallo stato del NAT e dalla policy nella direzione opposta.`,
          `The packet reaches ${destinationIp} presenting itself as ${translatedSource}. Delivery in one direction proves nothing about the return: that depends on NAT state and on the policy in the opposite direction.`)
      : b(`Il pacchetto arriva a ${destination!.name} (${destinationIp}) dopo essere stato instradato tra VLAN.`,
          `The packet reaches ${destination!.name} (${destinationIp}) after being routed between VLANs.`),
    verdict: 'forward'
  });

  return { steps, delivered: true, layer2Only: false, translatedSource };
}

export interface RoundTrip {
  forward: TraceResult;
  /** The reply, traced independently: the same engine with the endpoints swapped. */
  ret: TraceResult;
  /** True when one direction succeeds and the other does not. */
  asymmetric: boolean;
  note: Bilingual;
}

/**
 * Traces both directions, because almost every hard network fault is asymmetric and
 * the material keeps saying "verify in both directions" without ever showing it.
 */
export function traceRoundTrip(options: TraceOptions): RoundTrip {
  const forward = tracePath(options);

  // The Internet cannot be an initiator in this topology: the reply is the NAT state
  // being reversed, which is a different thing from an inbound connection.
  if (options.destinationId === 'internet') {
    const ret: TraceResult = {
      layer2Only: false,
      delivered: forward.delivered && options.natEnabled,
      steps: forward.delivered && options.natEnabled
        ? [{
            kind: 'nat',
            device: 'R-EDGE',
            title: b('Ritorno: lo stato NAT viene invertito', 'Return: NAT state is reversed'),
            detail: b(`La risposta arriva a ${forward.translatedSource} e la tabella delle traduzioni la riporta a ${options.sourceId.toUpperCase()}. Nessuna regola in ingresso è necessaria, perché lo stato esiste già: è la differenza fra uno stato di sessione e una ACL stateless, che invece richiederebbe una regola esplicita nel verso opposto.`,
                      `The reply arrives at ${forward.translatedSource} and the translation table maps it back to ${options.sourceId.toUpperCase()}. No inbound rule is needed because the state already exists: that is the difference between session state and a stateless ACL, which would require an explicit rule in the opposite direction.`),
            evidence: 'show ip nat translations',
            verdict: 'forward'
          }]
        : [{
            kind: 'nat',
            device: 'R-EDGE',
            title: b('Nessun ritorno possibile', 'No return possible'),
            detail: b('Senza una traduzione registrata non esiste nulla che dica al router a quale host interno appartiene la risposta.',
                      'Without a recorded translation there is nothing to tell the router which internal host the reply belongs to.'),
            verdict: 'drop'
          }],
      dropReason: forward.delivered && options.natEnabled ? undefined : b('Ritorno impossibile senza stato NAT', 'Return impossible without NAT state')
    };

    return {
      forward,
      ret,
      asymmetric: forward.delivered !== ret.delivered,
      note: b('Verso Internet il ritorno non è un percorso simmetrico ma il riuso dello stato di traduzione.',
              'Toward the Internet the return is not a symmetric path but the reuse of translation state.')
    };
  }

  const ret = tracePath({ ...options, sourceId: options.destinationId, destinationId: options.sourceId });
  const asymmetric = forward.delivered !== ret.delivered;

  return {
    forward,
    ret,
    asymmetric,
    note: asymmetric
      ? b('Le due direzioni non si comportano allo stesso modo: una ACL stateless applicata in un solo verso filtra solo quel verso, ed è il motivo per cui un test in una direzione non dimostra la connettività.',
          'The two directions do not behave the same way: a stateless ACL applied in one direction filters only that direction, which is why testing one way does not prove connectivity.')
      : b('Andata e ritorno attraversano gli stessi punti di enforcement con lo stesso esito.',
          'Both directions cross the same enforcement points with the same outcome.')
  };
}

import type { Bilingual } from '../types';

/**
 * DORA as it appears on the wire, including the parts that are not obvious.
 *
 * The four letters are easy. What the four cards on a slide never explain is why the
 * REQUEST is broadcast again after the client has already chosen a server (so the
 * other servers that made an offer withdraw theirs), why a router silently ends the
 * whole exchange unless it is told to relay (routers do not forward broadcasts), and
 * what `giaddr` is actually for (it tells the server which pool to serve from, and it
 * is the address the relay puts there, not the client's).
 *
 * Then there are the two ways the exchange fails while looking configured: DHCP
 * snooping dropping a server message that arrives on an untrusted port — which is the
 * feature working as intended against a rogue server — and Option 82 inserted by a
 * switch that is not the relay, which a server may refuse.
 */

export type DhcpMessage = 'DISCOVER' | 'OFFER' | 'REQUEST' | 'ACK' | 'NAK';
export type DhcpMode = 'initial' | 'renew';
export type ServerLocation = 'same-subnet' | 'remote';

export interface DhcpStep {
  message: DhcpMessage;
  from: string;
  to: string;
  sourceIp: string;
  destinationIp: string;
  sourceMac: string;
  destinationMac: string;
  /** UDP ports: the client uses 68, the server 67. */
  udp: { source: number; destination: number };
  broadcast: boolean;
  /** Relay agent IP address field: 0.0.0.0 when no relay is involved. */
  giaddr: string;
  option82: boolean;
  note: Bilingual;
}

export interface DhcpLease {
  address: string;
  mask: string;
  gateway: string;
  dns: string;
  leaseSeconds: number;
  /** Renewal timer, 50% of the lease. */
  t1Seconds: number;
  /** Rebinding timer, 87.5% of the lease. */
  t2Seconds: number;
}

export interface DhcpResult {
  steps: DhcpStep[];
  leased: boolean;
  lease: DhcpLease | null;
  failure: { code: string; note: Bilingual } | null;
}

export interface DhcpOptions {
  mode?: DhcpMode;
  serverLocation?: ServerLocation;
  /** `ip helper-address` on the client's gateway. */
  relayConfigured?: boolean;
  /** Relay agent information inserted by the switch or the relay. */
  option82?: boolean;
  /** True when the server's messages arrive on a port DHCP snooping does not trust. */
  snoopingUntrustedServer?: boolean;
  poolExhausted?: boolean;
  leaseSeconds?: number;
}

const b = (it: string, en: string): Bilingual => ({ it, en });

const CLIENT = { name: 'PC-A', mac: '0000.1111.aaaa' };
const RELAY = { name: 'R1 (relay)', mac: '0000.00aa.0001', clientSubnetIp: '10.10.10.1' };
const SERVER = { name: 'DHCP server', mac: '0000.00bb.0002', ip: '10.20.50.10' };
const BROADCAST_MAC = 'ffff.ffff.ffff';
const OFFERED = { address: '10.10.10.42', mask: '255.255.255.0', gateway: '10.10.10.1', dns: '10.20.50.53' };

export function simulateDhcp({
  mode = 'initial',
  serverLocation = 'remote',
  relayConfigured = true,
  option82 = false,
  snoopingUntrustedServer = false,
  poolExhausted = false,
  leaseSeconds = 86_400
}: DhcpOptions = {}): DhcpResult {
  if (!Number.isInteger(leaseSeconds) || leaseSeconds < 60) throw new Error('INVALID_LEASE');

  const usesRelay = serverLocation === 'remote';
  const giaddr = usesRelay ? RELAY.clientSubnetIp : '0.0.0.0';
  const steps: DhcpStep[] = [];

  const lease: DhcpLease = {
    ...OFFERED,
    leaseSeconds,
    t1Seconds: Math.floor(leaseSeconds * 0.5),
    t2Seconds: Math.floor(leaseSeconds * 0.875)
  };

  // A renewal is not a DORA: the client already has a lease and talks to its server.
  if (mode === 'renew') {
    steps.push({
      message: 'REQUEST',
      from: CLIENT.name, to: SERVER.name,
      sourceIp: OFFERED.address, destinationIp: SERVER.ip,
      sourceMac: CLIENT.mac, destinationMac: usesRelay ? RELAY.mac : SERVER.mac,
      udp: { source: 68, destination: 67 },
      broadcast: false, giaddr: '0.0.0.0', option82: false,
      note: b(
        `Al tempo T1, cioè al 50% del lease (${lease.t1Seconds} s), il client rinnova: invia una REQUEST in UNICAST direttamente al proprio server, usando l'indirizzo che già possiede. Non c'è nessuna DISCOVER e nessuna OFFER — il rinnovo non è un DORA, sono solo due messaggi. Se il server non risponde, al tempo T2 (87,5% del lease, ${lease.t2Seconds} s) il client torna a mandare la REQUEST in broadcast per farsi rispondere da qualunque server.`,
        `At time T1, that is 50% of the lease (${lease.t1Seconds} s), the client renews: it sends a REQUEST as a UNICAST straight to its own server, using the address it already holds. There is no DISCOVER and no OFFER — a renewal is not a DORA, it is two messages. If the server does not answer, at time T2 (87.5% of the lease, ${lease.t2Seconds} s) the client goes back to broadcasting the REQUEST so that any server can reply.`
      )
    });

    if (poolExhausted) {
      steps.push({
        message: 'NAK',
        from: SERVER.name, to: CLIENT.name,
        sourceIp: SERVER.ip, destinationIp: '255.255.255.255',
        sourceMac: SERVER.mac, destinationMac: BROADCAST_MAC,
        udp: { source: 67, destination: 68 },
        broadcast: true, giaddr, option82: false,
        note: b(
          'Il server rifiuta il rinnovo con un DHCPNAK: l\'indirizzo non è più suo da assegnare, per esempio perché il pool è stato cambiato o la voce è stata rimossa. Ricevuto un NAK il client deve abbandonare l\'indirizzo e ripartire da una DISCOVER.',
          'The server refuses the renewal with a DHCPNAK: the address is no longer its to assign, for example because the pool changed or the binding was removed. On receiving a NAK the client must abandon the address and start over from a DISCOVER.'
        )
      });
      return {
        steps, leased: false, lease: null,
        failure: {
          code: 'RENEW_NAK',
          note: b(
            'Rinnovo rifiutato: il client perde l\'indirizzo e ricomincia il DORA da zero.',
            'Renewal refused: the client loses the address and restarts the DORA from scratch.'
          )
        }
      };
    }

    steps.push({
      message: 'ACK',
      from: SERVER.name, to: CLIENT.name,
      sourceIp: SERVER.ip, destinationIp: OFFERED.address,
      sourceMac: SERVER.mac, destinationMac: CLIENT.mac,
      udp: { source: 67, destination: 68 },
      broadcast: false, giaddr: '0.0.0.0', option82: false,
      note: b(
        'Il server conferma con un ACK in unicast e il lease riparte da capo. L\'indirizzo non cambia: è lo stesso binding, con il timer azzerato.',
        'The server confirms with a unicast ACK and the lease starts over. The address does not change: it is the same binding, with the timer reset.'
      )
    });
    return { steps, leased: true, lease, failure: null };
  }

  // 1. DISCOVER — the client has no address yet, so it comes from 0.0.0.0.
  steps.push({
    message: 'DISCOVER',
    from: CLIENT.name, to: usesRelay ? RELAY.name : SERVER.name,
    sourceIp: '0.0.0.0', destinationIp: '255.255.255.255',
    sourceMac: CLIENT.mac, destinationMac: BROADCAST_MAC,
    udp: { source: 68, destination: 67 },
    broadcast: true, giaddr: '0.0.0.0', option82: false,
    note: b(
      'Il client non ha ancora un indirizzo, quindi il pacchetto parte da 0.0.0.0 verso il broadcast limitato 255.255.255.255, con MAC di destinazione ffff.ffff.ffff. Non può essere altrimenti: non sa né il proprio indirizzo né quello del server. Il campo giaddr è a zero, perché nessun relay l\'ha ancora toccato.',
      'The client has no address yet, so the packet leaves from 0.0.0.0 toward the limited broadcast 255.255.255.255, with destination MAC ffff.ffff.ffff. It cannot be otherwise: it knows neither its own address nor the server’s. The giaddr field is zero, because no relay has touched it yet.'
    )
  });

  if (usesRelay && !relayConfigured) {
    return {
      steps, leased: false, lease: null,
      failure: {
        code: 'NO_RELAY',
        note: b(
          'Il DORA finisce qui. Un router non inoltra i broadcast, quindi la DISCOVER muore sull\'interfaccia del gateway e il server, che è in un\'altra subnet, non la vede mai. Serve ip helper-address <server> sull\'interfaccia rivolta al client: il router trasforma quel broadcast in un unicast verso il server. Il sintomo lato client è un indirizzo 169.254.x.x (APIPA), che significa "nessuna risposta DHCP", non "problema di cavo".',
          'The DORA ends here. A router does not forward broadcasts, so the DISCOVER dies on the gateway interface and the server, which is in another subnet, never sees it. What is needed is ip helper-address <server> on the interface facing the client: the router turns that broadcast into a unicast toward the server. The symptom on the client is a 169.254.x.x address (APIPA), which means "no DHCP answer", not "cabling problem".'
        )
      }
    };
  }

  if (usesRelay) {
    steps.push({
      message: 'DISCOVER',
      from: RELAY.name, to: SERVER.name,
      sourceIp: RELAY.clientSubnetIp, destinationIp: SERVER.ip,
      sourceMac: RELAY.mac, destinationMac: SERVER.mac,
      udp: { source: 67, destination: 67 },
      broadcast: false, giaddr, option82,
      note: b(
        `Il relay riscrive il pacchetto: da broadcast diventa un UNICAST verso ${SERVER.ip}, la sorgente diventa l'indirizzo dell'interfaccia rivolta al client e soprattutto il campo giaddr viene impostato a ${giaddr}. È quel campo che dice al server da quale pool prendere l'indirizzo — senza di esso il server non saprebbe a quale subnet appartiene il client. Nota anche la porta sorgente: il relay parla come un agente DHCP, quindi usa la 67, non la 68.`,
        `The relay rewrites the packet: the broadcast becomes a UNICAST toward ${SERVER.ip}, the source becomes the address of the interface facing the client, and above all the giaddr field is set to ${giaddr}. That field is what tells the server which pool to take the address from — without it the server would not know which subnet the client is on. Note the source port too: the relay speaks as a DHCP agent, so it uses 67, not 68.`
      )
    });
  }

  if (poolExhausted) {
    return {
      steps, leased: false, lease: null,
      failure: {
        code: 'POOL_EXHAUSTED',
        note: b(
          'Il server riceve la DISCOVER ma non ha più indirizzi liberi nel pool, quindi non risponde: nessuna OFFER. Il client ritenta, poi si autoassegna un 169.254.x.x. Il sintomo è identico a quello del relay mancante, e si distinguono solo guardando il server: show ip dhcp binding e show ip dhcp pool dicono subito se il problema è la capacità del pool o un lease time troppo lungo per il ricambio dei client.',
          'The server receives the DISCOVER but has no free addresses left in the pool, so it does not answer: no OFFER. The client retries, then assigns itself a 169.254.x.x. The symptom is identical to a missing relay, and they are told apart only by looking at the server: show ip dhcp binding and show ip dhcp pool say immediately whether the problem is pool capacity or a lease time too long for the client turnover.'
        )
      }
    };
  }

  if (option82 && !usesRelay) {
    return {
      steps, leased: false, lease: null,
      failure: {
        code: 'OPTION82_WITHOUT_RELAY',
        note: b(
          'L\'Option 82 è stata inserita da uno switch che non è il relay, quindi il pacchetto arriva al server con le informazioni dell\'agente ma con giaddr a 0.0.0.0. Molti server, IOS compreso, scartano questa combinazione perché è contraddittoria. Si risolve con ip dhcp relay information trusted sull\'interfaccia (oppure no ip dhcp snooping information option sullo switch): è una delle cause più subdole di DHCP che smette di funzionare il giorno in cui si abilita lo snooping.',
          'Option 82 was inserted by a switch that is not the relay, so the packet reaches the server carrying agent information but with giaddr at 0.0.0.0. Many servers, IOS included, discard this combination because it contradicts itself. The fix is ip dhcp relay information trusted on the interface (or no ip dhcp snooping information option on the switch): it is one of the most insidious reasons DHCP stops working the day snooping is enabled.'
        )
      }
    };
  }

  // 2. OFFER
  if (snoopingUntrustedServer) {
    steps.push({
      message: 'OFFER',
      from: SERVER.name, to: CLIENT.name,
      sourceIp: usesRelay ? SERVER.ip : SERVER.ip, destinationIp: usesRelay ? giaddr : '255.255.255.255',
      sourceMac: SERVER.mac, destinationMac: usesRelay ? RELAY.mac : BROADCAST_MAC,
      udp: { source: 67, destination: usesRelay ? 67 : 68 },
      broadcast: !usesRelay, giaddr, option82,
      note: b(
        'L\'OFFER viene generata, ma arriva su una porta che DHCP snooping non considera trusted: lo switch la scarta. È il comportamento corretto, non un guasto — è esattamente il controllo che blocca un server DHCP non autorizzato collegato da un utente. Se la porta è quella del server legittimo, va dichiarata con ip dhcp snooping trust.',
        'The OFFER is generated, but it arrives on a port DHCP snooping does not consider trusted: the switch drops it. This is correct behaviour, not a fault — it is exactly the control that stops an unauthorized DHCP server plugged in by a user. If that port is the legitimate server’s, it has to be declared with ip dhcp snooping trust.'
      )
    });
    return {
      steps, leased: false, lease: null,
      failure: {
        code: 'SNOOPING_UNTRUSTED',
        note: b(
          'Messaggio di server scartato da DHCP snooping su porta untrusted: il client non riceve alcuna offerta.',
          'A server message dropped by DHCP snooping on an untrusted port: the client receives no offer.'
        )
      }
    };
  }

  steps.push({
    message: 'OFFER',
    from: SERVER.name, to: usesRelay ? RELAY.name : CLIENT.name,
    sourceIp: SERVER.ip, destinationIp: usesRelay ? giaddr : '255.255.255.255',
    sourceMac: SERVER.mac, destinationMac: usesRelay ? RELAY.mac : BROADCAST_MAC,
    udp: { source: 67, destination: usesRelay ? 67 : 68 },
    broadcast: !usesRelay, giaddr, option82,
    note: usesRelay
      ? b(
          `Il server risponde in unicast al relay, all'indirizzo che ha trovato in giaddr (${giaddr}), e prende l'indirizzo dal pool corrispondente a quella subnet. Sarà poi il relay a consegnare l'offerta al client, che ancora non ha un indirizzo.`,
          `The server replies as a unicast to the relay, at the address it found in giaddr (${giaddr}), and takes the address from the pool matching that subnet. It is then the relay that delivers the offer to the client, which still has no address.`
        )
      : b(
          'Il server è nella stessa subnet e risponde con l\'offerta. Il client non ha ancora un indirizzo, quindi la risposta viaggia in broadcast: il client la riconosce come propria dal proprio MAC contenuto nel campo chaddr e dallo XID della transazione.',
          'The server is in the same subnet and replies with the offer. The client still has no address, so the reply travels as a broadcast: the client recognises it as its own from its MAC in the chaddr field and from the transaction XID.'
        )
  });

  if (usesRelay) {
    steps.push({
      message: 'OFFER',
      from: RELAY.name, to: CLIENT.name,
      sourceIp: RELAY.clientSubnetIp, destinationIp: '255.255.255.255',
      sourceMac: RELAY.mac, destinationMac: BROADCAST_MAC,
      udp: { source: 67, destination: 68 },
      broadcast: true, giaddr, option82,
      note: b(
        'Il relay consegna l\'offerta sulla subnet del client, in broadcast, perché il client non ha ancora un indirizzo con cui essere raggiunto in unicast.',
        'The relay delivers the offer onto the client’s subnet, as a broadcast, because the client still has no address to be reached at as a unicast.'
      )
    });
  }

  // 3. REQUEST — broadcast again, on purpose.
  steps.push({
    message: 'REQUEST',
    from: CLIENT.name, to: usesRelay ? RELAY.name : SERVER.name,
    sourceIp: '0.0.0.0', destinationIp: '255.255.255.255',
    sourceMac: CLIENT.mac, destinationMac: BROADCAST_MAC,
    udp: { source: 68, destination: 67 },
    broadcast: true, giaddr: '0.0.0.0', option82: false,
    note: b(
      `Qui sta il dettaglio che sfugge: il client ha già scelto il server, ma manda la REQUEST ancora in BROADCAST, e ancora da 0.0.0.0. Il motivo è che l'indirizzo offerto non è suo finché non arriva l'ACK, e soprattutto che gli altri server che avevano fatto un'offerta devono vedere quale è stata accettata per ritirare la propria e liberare l'indirizzo. Il server scelto è indicato dall'option 54 (Server Identifier) dentro il pacchetto, non dall'indirizzo di destinazione.`,
      `Here is the detail that gets missed: the client has already chosen the server, yet it sends the REQUEST as a BROADCAST, and still from 0.0.0.0. The reason is that the offered address is not the client’s until the ACK arrives, and above all that the other servers which made an offer must see which one was accepted so they can withdraw theirs and release the address. The chosen server is named by option 54 (Server Identifier) inside the packet, not by the destination address.`
    )
  });

  // 4. ACK
  steps.push({
    message: 'ACK',
    from: SERVER.name, to: CLIENT.name,
    sourceIp: SERVER.ip, destinationIp: usesRelay ? giaddr : '255.255.255.255',
    sourceMac: SERVER.mac, destinationMac: usesRelay ? RELAY.mac : BROADCAST_MAC,
    udp: { source: 67, destination: usesRelay ? 67 : 68 },
    broadcast: !usesRelay, giaddr, option82,
    note: b(
      `Con l'ACK il binding diventa effettivo: indirizzo ${OFFERED.address}, mask ${OFFERED.mask}, default gateway ${OFFERED.gateway} (option 3) e DNS ${OFFERED.dns} (option 6). Da questo momento partono i timer: rinnovo a T1, cioè al 50% del lease, e rebinding a T2, all'87,5%.`,
      `With the ACK the binding takes effect: address ${OFFERED.address}, mask ${OFFERED.mask}, default gateway ${OFFERED.gateway} (option 3) and DNS ${OFFERED.dns} (option 6). From this moment the timers run: renewal at T1, 50% of the lease, and rebinding at T2, at 87.5%.`
    )
  });

  return { steps, leased: true, lease, failure: null };
}

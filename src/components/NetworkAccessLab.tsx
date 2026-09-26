import { useMemo, useState } from 'react';
import { Cable, Radio, ShieldCheck, TriangleAlert, Waypoints } from 'lucide-react';
import {
  electRootBridge,
  evaluateTrunkFrame,
  isEtherChannelCompatible,
  STP_LONG_PATH_COST,
  STP_SHORT_METHOD_CEILING,
  STP_SHORT_PATH_COST,
  type EtherChannelMode
} from '../lib/networkAccess';
import {
  INTERACTIVE_INPUT_LIMITS,
  inputErrorMessage,
  parseVlanId,
  parseVlanListInput
} from '../lib/inputValidation';
import { useStore } from '../store';
import ResponsiveTable from './ResponsiveTable';
import CamTableLab from './CamTableLab';
import PortSecurityLab from './PortSecurityLab';
import StpConvergenceLab from './StpConvergenceLab';

type Language = 'it' | 'en';
type Localized = Record<Language, string>;

const ETHERCHANNEL_MODES: EtherChannelMode[] = ['active', 'passive', 'desirable', 'auto', 'on'];

const SECURITY_CONTROLS: Array<{
  attack: Localized;
  mechanism: Localized;
  defense: Localized;
  verify: string;
}> = [
  {
    attack: { it: 'VLAN hopping: switch spoofing', en: 'VLAN hopping: switch spoofing' },
    mechanism: { it: 'L’attaccante negozia un trunk tramite DTP da una porta utente.', en: 'The attacker negotiates a trunk through DTP from a user-facing port.' },
    defense: { it: 'Forza switchport mode access, disabilita DTP con switchport nonegotiate e spegni le porte inutilizzate.', en: 'Force switchport mode access, disable DTP with switchport nonegotiate, and shut down unused ports.' },
    verify: 'show interfaces switchport'
  },
  {
    attack: { it: 'VLAN hopping: double tagging', en: 'VLAN hopping: double tagging' },
    mechanism: { it: 'Due tag 802.1Q sfruttano il traffico non taggato della native VLAN; l’attacco è tipicamente unidirezionale.', en: 'Two 802.1Q tags abuse untagged native-VLAN traffic; the attack is typically unidirectional.' },
    defense: { it: 'Usa una native VLAN dedicata e inutilizzata, diversa dalle VLAN di accesso; limita le VLAN ammesse e valuta il tagging della native VLAN.', en: 'Use a dedicated, unused native VLAN that differs from access VLANs; prune allowed VLANs and consider tagging the native VLAN.' },
    verify: 'show interfaces trunk'
  },
  {
    attack: { it: 'Manipolazione STP / BPDU spoofing', en: 'STP manipulation / BPDU spoofing' },
    mechanism: { it: 'BPDU superiori fanno eleggere root uno switch ostile, deviando o interrompendo il traffico.', en: 'Superior BPDUs make a hostile switch the root, redirecting or disrupting traffic.' },
    defense: { it: 'BPDU Guard sugli edge port, Root Guard dove la root non deve comparire e priorità root deterministica.', en: 'BPDU Guard on edge ports, Root Guard where the root must not appear, and deterministic root priority.' },
    verify: 'show spanning-tree inconsistentports'
  },
  {
    attack: { it: 'MAC flooding', en: 'MAC flooding' },
    mechanism: { it: 'Molti MAC sorgente saturano la CAM table e possono causare flooding dei frame unknown-unicast.', en: 'Many source MAC addresses exhaust the CAM table and may trigger unknown-unicast flooding.' },
    defense: { it: 'Port Security con limite, sticky MAC e violation mode coerente; monitoraggio delle variazioni CAM.', en: 'Port Security with a limit, sticky MAC, and an appropriate violation mode; monitor CAM churn.' },
    verify: 'show port-security interface'
  },
  {
    attack: { it: 'DHCP starvation e rogue DHCP', en: 'DHCP starvation and rogue DHCP' },
    mechanism: { it: 'Richieste con MAC falsificati esauriscono il pool; un server non autorizzato invia offerte malevole.', en: 'Requests with forged MAC addresses exhaust the pool; an unauthorized server sends malicious offers.' },
    defense: { it: 'DHCP Snooping: trust solo verso il server, rate limit sulle porte client e binding database protetto.', en: 'DHCP Snooping: trust only toward the server, rate-limit client ports, and protect the binding database.' },
    verify: 'show ip dhcp snooping binding'
  },
  {
    attack: { it: 'ARP spoofing / poisoning', en: 'ARP spoofing / poisoning' },
    mechanism: { it: 'Risposte ARP false associano l’IP del gateway al MAC dell’attaccante.', en: 'Forged ARP replies associate the gateway IP with the attacker MAC.' },
    defense: { it: 'Dynamic ARP Inspection usa binding attendibili, normalmente prodotti da DHCP Snooping; gestisci ACL ARP per host statici.', en: 'Dynamic ARP Inspection uses trusted bindings, normally learned by DHCP Snooping; use ARP ACLs for static hosts.' },
    verify: 'show ip arp inspection statistics'
  },
  {
    attack: { it: 'Evil twin e credenziali Wi-Fi', en: 'Evil twin and Wi-Fi credential attacks' },
    mechanism: { it: 'Un AP imita SSID e portale; protocolli deboli o password condivise ampliano il rischio.', en: 'An AP imitates the SSID and portal; weak protocols or shared passwords increase the risk.' },
    defense: { it: 'WPA3-Enterprise o WPA2-Enterprise con 802.1X/EAP-TLS, validazione del certificato server e WIDS/WIPS.', en: 'WPA3-Enterprise or WPA2-Enterprise with 802.1X/EAP-TLS, server-certificate validation, and WIDS/WIPS.' },
    verify: 'show wireless stats client detail'
  },
  {
    attack: { it: 'Deauthentication/disassociation spoofing', en: 'Deauthentication/disassociation spoofing' },
    mechanism: { it: 'Frame di management falsificati disconnettono i client e possono favorire DoS o evil twin.', en: 'Forged management frames disconnect clients and can support DoS or evil-twin attacks.' },
    defense: { it: 'Protected Management Frames 802.11w, obbligatori con WPA3; RF monitoring e soglie di allarme.', en: '802.11w Protected Management Frames, mandatory with WPA3; RF monitoring and alert thresholds.' },
    verify: 'show wireless client mac-address'
  }
];

const WIRELESS_ROWS: Array<{ topic: Localized; detail: Localized }> = [
  { topic: { it: '2,4 GHz', en: '2.4 GHz' }, detail: { it: 'Maggiore portata e interferenza; in 20 MHz i canali non sovrapposti tipici sono 1, 6 e 11.', en: 'Longer range and more interference; with 20 MHz channels, 1, 6, and 11 are the typical non-overlapping choices.' } },
  { topic: { it: '5 GHz', en: '5 GHz' }, detail: { it: 'Più canali e capacità, minore penetrazione; alcuni canali richiedono DFS.', en: 'More channels and capacity, less penetration; some channels require DFS.' } },
  { topic: { it: '6 GHz', en: '6 GHz' }, detail: { it: 'Spettro aggiuntivo per Wi-Fi 6E/7; richiede client compatibili e sicurezza WPA3.', en: 'Additional spectrum for Wi-Fi 6E/7; requires compatible clients and WPA3 security.' } },
  { topic: { it: 'Infrastruttura', en: 'Infrastructure' }, detail: { it: 'AP lightweight e WLC separano funzioni di accesso, controllo e gestione; CAPWAP crea i tunnel AP–controller.', en: 'Lightweight APs and WLCs separate access, control, and management functions; CAPWAP builds AP-to-controller tunnels.' } }
];

// CCNA 1.11 — wireless principles (the RF and 802.11 basics the other labs build on)
const WIRELESS_PRINCIPLES: Array<{ title: Localized; detail: Localized }> = [
  {
    title: { it: 'Mezzo condiviso e half-duplex', en: 'Shared, half-duplex medium' },
    detail: {
      it: 'La radio è un mezzo condiviso: su un canale trasmette uno alla volta e il throughput reale si divide tra i client associati. Un AP non è uno switch — non esistono porte dedicate.',
      en: 'Radio is a shared medium: one station transmits at a time on a channel and real throughput is divided among the associated clients. An AP is not a switch — there are no dedicated ports.'
    }
  },
  {
    title: { it: 'CSMA/CA', en: 'CSMA/CA' },
    detail: {
      it: 'Il Wi-Fi evita le collisioni invece di rilevarle: il client ascolta, attende un backoff casuale, trasmette e attende un ACK. RTS/CTS prenota il canale quando i client non si sentono tra loro (nodo nascosto).',
      en: 'Wi-Fi avoids collisions rather than detecting them: the client listens, waits a random backoff, transmits, and waits for an ACK. RTS/CTS reserves the channel when clients cannot hear each other (hidden node).'
    }
  },
  {
    title: { it: 'SSID, BSSID, BSS ed ESS', en: 'SSID, BSSID, BSS, and ESS' },
    detail: {
      it: 'Il SSID è il nome della rete; il BSSID è il MAC della radio dell’AP e identifica la singola cella (BSS). Più AP con lo stesso SSID formano un ESS e permettono il roaming; senza AP la topologia è ad-hoc (IBSS).',
      en: 'The SSID is the network name; the BSSID is the MAC of the AP radio and identifies the single cell (BSS). Several APs sharing an SSID form an ESS and enable roaming; with no AP the topology is ad-hoc (IBSS).'
    }
  },
  {
    title: { it: 'Canali e interferenza', en: 'Channels and interference' },
    detail: {
      it: 'In 2,4 GHz con canali da 20 MHz solo 1, 6 e 11 non si sovrappongono. Due AP vicini sullo stesso canale si contendono il tempo (co-channel interference); su canali parzialmente sovrapposti si disturbano come rumore, che è peggio.',
      en: 'In 2.4 GHz with 20 MHz channels only 1, 6, and 11 do not overlap. Two nearby APs on the same channel contend for airtime (co-channel interference); on partially overlapping channels they interfere as noise, which is worse.'
    }
  },
  {
    title: { it: 'Banda, ampiezza e portata', en: 'Band, width, and range' },
    detail: {
      it: 'Canali più larghi (40/80/160 MHz) aumentano il throughput ma riducono i canali disponibili e il rapporto segnale/rumore. Le frequenze più alte portano più capacità e meno penetrazione: 6 GHz copre meno di 2,4 GHz.',
      en: 'Wider channels (40/80/160 MHz) raise throughput but reduce the number of available channels and the signal-to-noise ratio. Higher frequencies bring more capacity and less penetration: 6 GHz covers less than 2.4 GHz.'
    }
  },
  {
    title: { it: 'Associazione in tre fasi', en: 'Three-stage association' },
    detail: {
      it: 'Il client scopre l’AP (beacon o probe), si autentica e infine si associa. Sono tre passaggi distinti: un client associato non è necessariamente autorizzato sulla rete, ed è l’errore da non fare nella diagnosi.',
      en: 'The client discovers the AP (beacon or probe), authenticates, and only then associates. These are three distinct steps: an associated client is not necessarily authorized on the network, and conflating them is the diagnostic mistake to avoid.'
    }
  }
];

// CCNA 2.8 — management access to network devices, APs, and WLCs
/** A method is either a protocol/port label, identical in both languages, or a translated name. */
const MGMT_ACCESS_ROWS: Array<{ method: string | Localized; detail: Localized; verdict: Localized }> = [
  {
    method: { it: 'Console (out-of-band)', en: 'Console (out-of-band)' },
    detail: { it: 'Accesso diretto via cavo, indipendente dalla configurazione IP: è l’unica via quando la rete è giù o la configurazione è sbagliata, e serve per il recupero password.', en: 'Direct cabled access, independent of any IP configuration: the only way in when the network is down or the configuration is wrong, and what password recovery relies on.' },
    verdict: { it: 'Da proteggere fisicamente e con password: chi raggiunge la console raggiunge il dispositivo.', en: 'Protect it physically and with a password: whoever reaches the console reaches the device.' }
  },
  {
    method: 'Telnet · TCP 23',
    detail: { it: 'Sessione CLI in chiaro: credenziali e comandi sono leggibili da chiunque intercetti il traffico.', en: 'Cleartext CLI session: credentials and commands are readable by anyone intercepting the traffic.' },
    verdict: { it: 'Da disabilitare (transport input ssh sulle linee vty).', en: 'Disable it (transport input ssh on the vty lines).' }
  },
  {
    method: 'SSH · TCP 22',
    detail: { it: 'Sessione CLI cifrata e autenticata. Richiede hostname, ip domain name, una coppia di chiavi RSA e ip ssh version 2.', en: 'Encrypted, authenticated CLI session. It requires a hostname, ip domain name, an RSA key pair, and ip ssh version 2.' },
    verdict: { it: 'È il metodo CLI da usare, abbinato a AAA e a una ACL sulle vty.', en: 'This is the CLI method to use, paired with AAA and an ACL on the vty lines.' }
  },
  {
    method: 'HTTP · TCP 80',
    detail: { it: 'GUI di gestione non cifrata: su un WLC significa esporre in chiaro le credenziali di amministrazione dell’intera infrastruttura wireless.', en: 'Unencrypted management GUI: on a WLC this means exposing the administrative credentials of the whole wireless infrastructure in cleartext.' },
    verdict: { it: 'Da disabilitare (no ip http server).', en: 'Disable it (no ip http server).' }
  },
  {
    method: 'HTTPS · TCP 443',
    detail: { it: 'GUI cifrata con TLS, il metodo con cui si configura normalmente un WLC. Il certificato va sostituito con uno attendibile, altrimenti gli amministratori si abituano a ignorare gli avvisi.', en: 'TLS-encrypted GUI, the normal way to configure a WLC. Replace the certificate with a trusted one, otherwise administrators get used to dismissing warnings.' },
    verdict: { it: 'Metodo GUI da usare, limitato alle sorgenti di management.', en: 'The GUI method to use, restricted to management sources.' }
  },
  {
    method: 'TACACS+ · RADIUS',
    detail: { it: 'Spostano autenticazione e autorizzazione su un server centrale invece delle password locali: TACACS+ per l’amministrazione dei dispositivi, RADIUS per l’accesso alla rete.', en: 'They move authentication and authorization to a central server instead of local passwords: TACACS+ for device administration, RADIUS for network access.' },
    verdict: { it: 'Conserva sempre un fallback locale testato, o un server irraggiungibile diventa un lockout.', en: 'Always keep a tested local fallback, or an unreachable server becomes a lockout.' }
  },
  {
    method: { it: 'Gestione cloud', en: 'Cloud-managed' },
    detail: { it: 'Il dispositivo stabilisce una sessione uscente verso un controller cloud e ne riceve la configurazione: nessuna porta di gestione esposta in ingresso.', en: 'The device establishes an outbound session to a cloud controller and receives its configuration from it: no inbound management port is exposed.' },
    verdict: { it: 'Sposta la fiducia sull’account cloud: MFA e ruoli minimi diventano il controllo principale.', en: 'It shifts trust onto the cloud account: MFA and least-privilege roles become the primary control.' }
  }
];

// CCNA 2.9 + 5.10 — reading the WLC GUI and building a WPA2 PSK WLAN
const WLAN_GUI_STEPS: Array<{ tab: string; fields: Localized; note: Localized }> = [
  {
    tab: 'WLANs → Create New → General',
    fields: { it: 'Profile Name (nome interno del profilo), SSID (nome trasmesso ai client), Status (abilita la WLAN), Radio Policy (quali bande servono la WLAN) e Interface/Interface Group, che lega la WLAN alla VLAN e quindi alla subnet.', en: 'Profile Name (internal profile name), SSID (the name broadcast to clients), Status (enables the WLAN), Radio Policy (which bands serve the WLAN), and Interface/Interface Group, which binds the WLAN to its VLAN and therefore to its subnet.' },
    note: { it: 'Profile Name e SSID sono campi distinti: possono differire, e confonderli è l’errore più comune. Senza l’interfaccia corretta i client si associano ma non ottengono indirizzo.', en: 'Profile Name and SSID are distinct fields: they may differ, and confusing them is the most common mistake. With the wrong interface, clients associate but get no address.' }
  },
  {
    tab: 'Security → Layer 2',
    fields: { it: 'Layer 2 Security = WPA+WPA2 (o WPA2+WPA3), spunta su WPA2 Policy e WPA2 Encryption = AES/CCMP, Authentication Key Management = PSK, e la passphrase in PSK Format (ASCII, 8-63 caratteri).', en: 'Layer 2 Security = WPA+WPA2 (or WPA2+WPA3), WPA2 Policy checked with WPA2 Encryption = AES/CCMP, Authentication Key Management = PSK, and the passphrase under PSK Format (ASCII, 8-63 characters).' },
    note: { it: 'Questa è la configurazione WPA2 PSK dell’obiettivo 5.10. TKIP va lasciato disattivato: è deprecato. La PSK è condivisa da tutti i client, quindi non identifica nessuno e non si revoca singolarmente.', en: 'This is the WPA2 PSK configuration of objective 5.10. Leave TKIP off: it is deprecated. The PSK is shared by every client, so it identifies no one and cannot be revoked individually.' }
  },
  {
    tab: 'Security → AAA Servers',
    fields: { it: 'Con 802.1X al posto di PSK si selezionano qui i server RADIUS di autenticazione e accounting, già definiti in Security → RADIUS.', en: 'With 802.1X instead of PSK, this is where the authentication and accounting RADIUS servers — already defined under Security → RADIUS — are selected.' },
    note: { it: 'È il passaggio da Personal a Enterprise: credenziali o certificati per utente, revoca individuale e VLAN/policy assegnate dinamicamente.', en: 'This is the step from Personal to Enterprise: per-user credentials or certificates, individual revocation, and dynamically assigned VLANs/policy.' }
  },
  {
    tab: 'QoS',
    fields: { it: 'Profilo Platinum (voce), Gold (video), Silver (best effort, predefinito) o Bronze (background), più i limiti di banda per SSID o per client e la WMM policy.', en: 'Platinum (voice), Gold (video), Silver (best effort, the default), or Bronze (background) profile, plus per-SSID or per-client bandwidth limits and the WMM policy.' },
    note: { it: 'Il profilo impone un tetto alla priorità del traffico della WLAN: una WLAN voce su Silver vede la marcatura declassata all’ingresso.', en: 'The profile caps the priority of that WLAN’s traffic: a voice WLAN on Silver has its marking downgraded on ingress.' }
  },
  {
    tab: 'Advanced',
    fields: { it: 'Session Timeout, Client Exclusion, P2P Blocking Action (isolamento tra client), FlexConnect Local Switching, DHCP Addr. Assignment e Enable Passive Client.', en: 'Session Timeout, Client Exclusion, P2P Blocking Action (client isolation), FlexConnect Local Switching, DHCP Addr. Assignment, and Enable Passive Client.' },
    note: { it: 'P2P Blocking è ciò che isola i client di una WLAN guest tra loro; FlexConnect Local Switching cambia dove il traffico esce e quindi dove le policy vanno applicate.', en: 'P2P Blocking is what isolates the clients of a guest WLAN from each other; FlexConnect Local Switching changes where traffic exits and therefore where policy must be applied.' }
  }
];

const STP_ROLES: Array<{ name: string; detail: Localized }> = [
  { name: 'Root port', detail: { it: 'Su ogni switch non-root, è la porta con il costo totale minore verso la root bridge.', en: 'On each non-root switch, this is the port with the lowest total path cost toward the root bridge.' } },
  { name: 'Designated port', detail: { it: 'È la porta che offre il percorso migliore verso la root per uno specifico segmento; inoltra i frame.', en: 'This port offers the best path to the root for a specific segment; it forwards frames.' } },
  { name: 'Alternate port', detail: { it: 'In RSTP fornisce un percorso alternativo verso la root e rimane in discarding finché non serve.', en: 'In RSTP, this provides an alternate path to the root and stays discarding until needed.' } },
  { name: 'RSTP states', detail: { it: 'Discarding non inoltra né apprende MAC; learning apprende MAC; forwarding apprende e inoltra.', en: 'Discarding neither forwards nor learns MACs; learning learns MACs; forwarding learns and forwards.' } }
];

const ETHERCHANNEL_REQUIREMENTS: Localized[] = [
  { it: 'Stessa velocità e duplex sulle porte membro.', en: 'Matching speed and duplex on member ports.' },
  { it: 'Coerenza tra modalità access/trunk, VLAN access, native VLAN e allowed list.', en: 'Consistent access/trunk mode, access VLAN, native VLAN, and allowed list.' },
  { it: 'Tutte le porte membro devono appartenere allo stesso channel-group e usare un protocollo compatibile.', en: 'All member ports must use the same channel group and a compatible negotiation protocol.' }
];

const VLAN_CONFIG = `vlan 10
 name USERS
vlan 20
 name VOICE
vlan 99
 name NATIVE-BLACKHOLE
!
interface GigabitEthernet1/0/1
 switchport mode access
 switchport access vlan 10
 switchport nonegotiate
 spanning-tree portfast
 spanning-tree bpduguard enable
!
interface GigabitEthernet1/0/24
 switchport trunk encapsulation dot1q
 switchport mode trunk
 switchport trunk native vlan 99
 switchport trunk allowed vlan 10,20,99`;

const L2_SECURITY_CONFIG = `ip dhcp snooping
ip dhcp snooping vlan 10,20
ip arp inspection vlan 10,20
!
interface GigabitEthernet1/0/1
 switchport port-security
 switchport port-security maximum 2
 switchport port-security mac-address sticky
 ip dhcp snooping limit rate 15
!
interface GigabitEthernet1/0/24
 ip dhcp snooping trust
 ip arp inspection trust`;

function SectionTitle({ icon: Icon, title, id }: { icon: typeof Cable; title: string; id: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5 text-indigo-600" />
      <h2 id={id} className="text-lg font-semibold text-slate-900">{title}</h2>
    </div>
  );
}

export default function NetworkAccessLab() {
  const language = useStore(state => state.language);
  const [allowedInput, setAllowedInput] = useState('10,20,30-32,99');
  const [frameVlan, setFrameVlan] = useState('20');
  const [nativeVlan, setNativeVlan] = useState('99');
  const [sw1Priority, setSw1Priority] = useState(24576);
  const [sw2Priority, setSw2Priority] = useState(32768);
  const [leftMode, setLeftMode] = useState<EtherChannelMode>('active');
  const [rightMode, setRightMode] = useState<EtherChannelMode>('passive');

  const trunk = useMemo(() => {
    try {
      const allowed = parseVlanListInput(allowedInput);
      return { allowed, result: evaluateTrunkFrame(parseVlanId(frameVlan), parseVlanId(nativeVlan), allowed), error: null } as const;
    } catch (error) {
      return { allowed: [], result: null, error } as const;
    }
  }, [allowedInput, frameVlan, nativeVlan]);

  const rootBridge = useMemo(() => {
    try {
      return electRootBridge([
        { id: 'SW1', priority: sw1Priority, mac: '00:11:22:33:44:01' },
        { id: 'SW2', priority: sw2Priority, mac: '00:11:22:33:44:02' }
      ]);
    } catch {
      return null;
    }
  }, [sw1Priority, sw2Priority]);

  const etherChannelUp = isEtherChannelCompatible(leftMode, rightMode);
  const t = language === 'it'
    ? {
        title: 'Network Access Lab', subtitle: 'Esplora switching Ethernet, VLAN, trunk, STP, EtherChannel, wireless e difese di livello 2.',
        vlanTitle: 'VLAN e trunk 802.1Q', allowed: 'VLAN ammesse', frame: 'VLAN del frame', native: 'Native VLAN', invalidVlan: 'La lista deve contenere VLAN da 1 a 4094, separate da virgole o intervalli.',
        tagged: 'Il frame attraversa il trunk con tag 802.1Q.', untagged: 'Il frame appartiene alla native VLAN e, per impostazione predefinita, attraversa il trunk senza tag.', pruned: 'Il frame viene scartato: la VLAN non è nella allowed list.',
        nativeWarning: 'Una native VLAN mismatch può causare perdita di traffico, leakage tra VLAN e messaggi CDP; deve coincidere sui due estremi.',
        stpTitle: 'STP/RSTP e prevenzione dei loop', priority: 'Priorità bridge', root: 'Root bridge eletto', rootRule: 'Nella stessa VLAN vince il Bridge ID più basso: prima la priorità configurata, poi il MAC. Il system ID extension contiene il VLAN ID e la priorità procede a incrementi di 4096.',
        costs: 'Costi STP (short method, 802.1D-1998)', longCosts: 'Costi STP (long method, 802.1D-2004)',
        costNote: `Il metodo short è a 16 bit e si ferma a ${STP_SHORT_METHOD_CEILING}: da lì in su i valori collassano verso 1 e link di velocità molto diversa diventano indistinguibili per STP. Con uplink a 10 Gb/s o più veloci si abilita spanning-tree pathcost method long, che deve essere identico su tutti gli switch della topologia: mescolare short e long produce un albero incoerente.`, etherTitle: 'EtherChannel', left: 'Switch sinistro', right: 'Switch destro', formed: 'Port-channel formato', notFormed: 'Port-channel non formato',
        etherNote: 'LACP: active avvia la negoziazione, passive risponde. PAgP: desirable avvia, auto risponde. La modalità on non negozia e deve essere coerente sui due lati.',
        wirelessTitle: 'Fondamenti wireless', principlesTitle: 'Principi radio e 802.11',
        mgmtTitle: 'Accesso di gestione a dispositivi, AP e WLC', method: 'Metodo', mgmtDetail: 'Come funziona', mgmtVerdict: 'Indicazione operativa',
        guiTitle: 'Configurazione WLAN dalla GUI del WLC (WPA2 PSK)', guiTab: 'Percorso nella GUI', guiFields: 'Campi da impostare', guiNote: 'Nota didattica',
        guiIntro: 'Sequenza dei campi che si incontrano creando una WLAN su un Wireless LAN Controller. È una descrizione testuale, non una GUI interattiva: nomi e posizione dei campi variano tra AireOS e IOS XE.',
        securityTitle: 'Attacchi e difese di accesso', attack: 'Attacco', mechanism: 'Meccanismo e impatto', defense: 'Difesa appropriata', verify: 'Verifica IOS',
        configTitle: 'Configurazioni IOS di riferimento', configNote: 'Gli esempi sono blocchi didattici: nomi interfaccia, VLAN, piattaforma e supporto dei comandi vanno adattati al dispositivo reale.'
      }
    : {
        title: 'Network Access Lab', subtitle: 'Explore Ethernet switching, VLANs, trunks, STP, EtherChannel, wireless, and Layer 2 defenses.',
        vlanTitle: 'VLANs and 802.1Q trunks', allowed: 'Allowed VLANs', frame: 'Frame VLAN', native: 'Native VLAN', invalidVlan: 'The list must contain VLANs from 1 to 4094, separated by commas or ranges.',
        tagged: 'The frame crosses the trunk with an 802.1Q tag.', untagged: 'The frame belongs to the native VLAN and crosses the trunk untagged by default.', pruned: 'The frame is dropped: its VLAN is not in the allowed list.',
        nativeWarning: 'A native VLAN mismatch can cause traffic loss, VLAN leakage, and CDP messages; both trunk ends must match.',
        stpTitle: 'STP/RSTP and loop prevention', priority: 'Bridge priority', root: 'Elected root bridge', rootRule: 'Within the same VLAN, the lowest Bridge ID wins: configured priority first, then MAC address. The system ID extension carries the VLAN ID, and priority uses increments of 4096.',
        costs: 'STP costs (short method, 802.1D-1998)', longCosts: 'STP costs (long method, 802.1D-2004)',
        costNote: `The short method is 16-bit and stops at ${STP_SHORT_METHOD_CEILING}: above that the values collapse toward 1 and links of very different speed become indistinguishable to STP. With 10 Gb/s or faster uplinks, enable spanning-tree pathcost method long — and keep it identical on every switch of the topology, because mixing short and long produces an inconsistent tree.`, etherTitle: 'EtherChannel', left: 'Left switch', right: 'Right switch', formed: 'Port-channel formed', notFormed: 'Port-channel not formed',
        etherNote: 'LACP: active initiates negotiation, passive responds. PAgP: desirable initiates, auto responds. Mode on does not negotiate and must be consistent on both sides.',
        wirelessTitle: 'Wireless fundamentals', principlesTitle: 'Radio and 802.11 principles',
        mgmtTitle: 'Management access to devices, APs, and WLCs', method: 'Method', mgmtDetail: 'How it works', mgmtVerdict: 'Operational guidance',
        guiTitle: 'WLAN configuration from the WLC GUI (WPA2 PSK)', guiTab: 'GUI path', guiFields: 'Fields to set', guiNote: 'Teaching note',
        guiIntro: 'The sequence of fields encountered when creating a WLAN on a Wireless LAN Controller. This is a textual description, not an interactive GUI: field names and placement differ between AireOS and IOS XE.',
        securityTitle: 'Access-layer attacks and defenses', attack: 'Attack', mechanism: 'Mechanism and impact', defense: 'Appropriate defense', verify: 'IOS verification',
        configTitle: 'Reference IOS configurations', configNote: 'These are teaching blocks: interface names, VLANs, platform, and command support must be adapted to the actual device.'
      };

  const trunkMessage = trunk.result?.reason === 'allowed-tagged' ? t.tagged : trunk.result?.reason === 'native-untagged' ? t.untagged : t.pruned;

  return (
    <div className="space-y-8">
      <header className="rounded-xl border border-slate-200 bg-white p-6 md:p-8">
        <p className="eyebrow">CCNA 1.11 · 2.1 · 2.2 · 2.3 · 2.4 · 2.5 · 2.6 · 2.7 · 2.8 · 2.9</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">{t.title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{t.subtitle}</p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="vlan-title">
        <SectionTitle icon={Waypoints} title={t.vlanTitle} id="vlan-title" />
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <label className="space-y-1.5 text-xs font-medium text-slate-600">{t.allowed}<input value={allowedInput} maxLength={INTERACTIVE_INPUT_LIMITS.vlanListCharacters + 1} onChange={event => setAllowedInput(event.target.value)} spellCheck={false} aria-invalid={trunk.error !== null} className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" /></label>
          <label className="space-y-1.5 text-xs font-medium text-slate-600">{t.frame}<input inputMode="numeric" value={frameVlan} maxLength={4} onChange={event => setFrameVlan(event.target.value)} aria-invalid={trunk.error !== null} className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" /></label>
          <label className="space-y-1.5 text-xs font-medium text-slate-600">{t.native}<input inputMode="numeric" value={nativeVlan} maxLength={4} onChange={event => setNativeVlan(event.target.value)} aria-invalid={trunk.error !== null} className="block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" /></label>
        </div>
        {trunk.error ? (
          <p className="mt-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert"><TriangleAlert className="h-4 w-4" />{inputErrorMessage(trunk.error, language)}</p>
        ) : (
          <div className={`mt-5 rounded-lg border p-4 text-sm ${trunk.result?.forwarded ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
            <p className="font-semibold">{trunkMessage}</p>
            <p className="mt-2 font-mono text-xs opacity-80">allowed: {trunk.allowed.join(', ')}</p>
          </div>
        )}
        <p className="mt-4 rounded-lg border border-sky-100 bg-sky-50 p-3 text-xs leading-relaxed text-sky-900">{t.nativeWarning}</p>
      </section>

      <CamTableLab />

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="stp-title">
        <SectionTitle icon={Waypoints} title={t.stpTitle} id="stp-title" />
        <p className="mt-3 text-xs leading-relaxed text-slate-600">{t.rootRule}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {[['SW1', sw1Priority, setSw1Priority, '00:11:22:33:44:01'], ['SW2', sw2Priority, setSw2Priority, '00:11:22:33:44:02']].map(([id, priority, setter, mac]) => (
            <article key={String(id)} className={`rounded-lg border p-4 ${rootBridge?.id === id ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between"><h3 className="font-semibold text-slate-900">{String(id)}</h3>{rootBridge?.id === id ? <span className="rounded-full bg-indigo-600 px-2 py-1 text-[10px] font-semibold text-white">ROOT</span> : null}</div>
              <label className="mt-3 block space-y-1.5 text-xs text-slate-600">{t.priority}<select value={Number(priority)} onChange={event => (setter as (value: number) => void)(Number(event.target.value))} className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm">{[0, 4096, 8192, 16384, 24576, 32768, 40960, 49152, 61440].map(value => <option key={value} value={value}>{value}</option>)}</select></label>
              <p className="mt-3 font-mono text-xs text-slate-500">MAC {String(mac)}</p>
            </article>
          ))}
        </div>
        <p className="mt-4 text-sm font-semibold text-indigo-700">{t.root}: {rootBridge?.id ?? '—'}</p>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div><h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.costs}</h3><div className="mt-2 flex flex-wrap gap-2">{Object.entries(STP_SHORT_PATH_COST).map(([speed, cost]) => <span key={speed} className="rounded-md bg-slate-100 px-3 py-2 font-mono text-xs text-slate-700">{speed} → {cost}</span>)}</div></div>
          <div><h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.longCosts}</h3><div className="mt-2 flex flex-wrap gap-2">{Object.entries(STP_LONG_PATH_COST).map(([speed, cost]) => <span key={speed} className="rounded-md bg-indigo-50 px-3 py-2 font-mono text-xs text-indigo-800">{speed} → {cost.toLocaleString(language)}</span>)}</div></div>
        </div>
        <p className="mt-4 rounded-lg border border-amber-100 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">{t.costNote}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">{STP_ROLES.map(item => <article key={item.name} className="rounded-lg border border-slate-200 p-3"><h3 className="text-xs font-semibold text-slate-900">{item.name}</h3><p className="mt-1.5 text-xs leading-relaxed text-slate-600">{item.detail[language]}</p></article>)}</div>
      </section>

      <StpConvergenceLab />

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="etherchannel-title">
        <SectionTitle icon={Cable} title={t.etherTitle} id="etherchannel-title" />
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {[[t.left, leftMode, setLeftMode], [t.right, rightMode, setRightMode]].map(([label, mode, setter]) => <label key={String(label)} className="space-y-1.5 text-xs font-medium text-slate-600">{String(label)}<select value={String(mode)} onChange={event => (setter as (value: EtherChannelMode) => void)(event.target.value as EtherChannelMode)} className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm">{ETHERCHANNEL_MODES.map(item => <option key={item} value={item}>{item}</option>)}</select></label>)}
        </div>
        <p className={`mt-4 rounded-lg border p-3 text-sm font-semibold ${etherChannelUp ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>{etherChannelUp ? t.formed : t.notFormed}</p>
        <p className="mt-3 text-xs leading-relaxed text-slate-600">{t.etherNote}</p>
        <ul className="mt-4 space-y-2 rounded-lg bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">{ETHERCHANNEL_REQUIREMENTS.map(item => <li key={item.en}>• {item[language]}</li>)}</ul>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="wireless-title">
        <SectionTitle icon={Radio} title={t.wirelessTitle} id="wireless-title" />
        <div className="mt-4 grid gap-3 md:grid-cols-2">{WIRELESS_ROWS.map(row => <article key={row.topic.en} className="rounded-lg border border-slate-200 p-4"><h3 className="text-sm font-semibold text-slate-900">{row.topic[language]}</h3><p className="mt-2 text-xs leading-relaxed text-slate-600">{row.detail[language]}</p></article>)}</div>
        <h3 className="mt-6 text-xs font-semibold uppercase tracking-wide text-slate-500">{t.principlesTitle}</h3>
        <div className="mt-2 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{WIRELESS_PRINCIPLES.map(item => <article key={item.title.en} className="rounded-lg border border-slate-200 p-4"><h4 className="text-sm font-semibold text-slate-900">{item.title[language]}</h4><p className="mt-2 text-xs leading-relaxed text-slate-600">{item.detail[language]}</p></article>)}</div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="mgmt-access-title">
        <SectionTitle icon={ShieldCheck} title={t.mgmtTitle} id="mgmt-access-title" />
        <div className="mt-4"><ResponsiveTable
          rows={MGMT_ACCESS_ROWS}
          rowKey={row => row.detail.en}
          label={t.mgmtTitle}
          minWidth={820}
          columns={[
            { id: 'method', header: t.method, heading: true, cellClassName: 'font-mono text-[11px] text-indigo-700', cell: row => (typeof row.method === 'string' ? row.method : row.method[language]) },
            { id: 'detail', header: t.mgmtDetail, cell: row => row.detail[language] },
            { id: 'verdict', header: t.mgmtVerdict, cellClassName: 'text-emerald-800', cell: row => row.verdict[language] }
          ]}
        /></div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="wlan-gui-title">
        <SectionTitle icon={Radio} title={t.guiTitle} id="wlan-gui-title" />
        <p className="mt-3 max-w-4xl text-xs leading-relaxed text-slate-600">{t.guiIntro}</p>
        <ol className="mt-4 space-y-3">{WLAN_GUI_STEPS.map((step, index) => (
          <li key={step.tab} className="rounded-lg border border-slate-200 p-4">
            <div className="flex flex-wrap items-baseline gap-2"><span className="font-mono text-[10px] font-semibold text-indigo-600">{index + 1}</span><code className="text-xs font-semibold text-slate-900">{step.tab}</code></div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600"><strong>{t.guiFields}:</strong> {step.fields[language]}</p>
            <p className="mt-2 text-xs leading-relaxed text-amber-900"><strong>{t.guiNote}:</strong> {step.note[language]}</p>
          </li>
        ))}</ol>
      </section>

      <PortSecurityLab />

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="access-security-title">
        <SectionTitle icon={ShieldCheck} title={t.securityTitle} id="access-security-title" />
        <div className="mt-4"><ResponsiveTable
          rows={SECURITY_CONTROLS}
          rowKey={item => item.attack.en}
          label={t.securityTitle}
          minWidth={900}
          columns={[
            { id: 'attack', header: t.attack, heading: true, cellClassName: 'text-rose-700', cell: item => item.attack[language] },
            { id: 'mechanism', header: t.mechanism, cell: item => item.mechanism[language] },
            { id: 'defense', header: t.defense, cellClassName: 'text-emerald-800', cell: item => item.defense[language] },
            { id: 'verify', header: t.verify, cell: item => <code className="text-[11px] text-indigo-700">{item.verify}</code> }
          ]}
        /></div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6" aria-labelledby="config-title">
        <SectionTitle icon={Cable} title={t.configTitle} id="config-title" />
        <p className="mt-3 text-xs leading-relaxed text-slate-600">{t.configNote}</p>
        <div className="mt-4 grid gap-4 xl:grid-cols-2"><pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-emerald-300"><code>{VLAN_CONFIG}</code></pre><pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-sky-300"><code>{L2_SECURITY_CONFIG}</code></pre></div>
      </section>
    </div>
  );
}

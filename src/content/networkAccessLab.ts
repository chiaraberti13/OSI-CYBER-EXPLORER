import type { EtherChannelMode } from '../lib/networkAccess';
type Language = 'it' | 'en';
type Localized = Record<Language, string>;

export const ETHERCHANNEL_MODES: EtherChannelMode[] = ['active', 'passive', 'desirable', 'auto', 'on'];

export const SECURITY_CONTROLS: Array<{
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

export const WIRELESS_ROWS: Array<{ topic: Localized; detail: Localized }> = [
  { topic: { it: '2,4 GHz', en: '2.4 GHz' }, detail: { it: 'Maggiore portata e interferenza; in 20 MHz i canali non sovrapposti tipici sono 1, 6 e 11.', en: 'Longer range and more interference; with 20 MHz channels, 1, 6, and 11 are the typical non-overlapping choices.' } },
  { topic: { it: '5 GHz', en: '5 GHz' }, detail: { it: 'Più canali e capacità, minore penetrazione; alcuni canali richiedono DFS.', en: 'More channels and capacity, less penetration; some channels require DFS.' } },
  { topic: { it: '6 GHz', en: '6 GHz' }, detail: { it: 'Spettro aggiuntivo per Wi-Fi 6E/7; richiede client compatibili e sicurezza WPA3.', en: 'Additional spectrum for Wi-Fi 6E/7; requires compatible clients and WPA3 security.' } },
  { topic: { it: 'Infrastruttura', en: 'Infrastructure' }, detail: { it: 'AP lightweight e WLC separano funzioni di accesso, controllo e gestione; CAPWAP crea i tunnel AP–controller.', en: 'Lightweight APs and WLCs separate access, control, and management functions; CAPWAP builds AP-to-controller tunnels.' } }
];

// CCNA 1.11 — wireless principles (the RF and 802.11 basics the other labs build on)
export const WIRELESS_PRINCIPLES: Array<{ title: Localized; detail: Localized }> = [
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
export const MGMT_ACCESS_ROWS: Array<{ method: string | Localized; detail: Localized; verdict: Localized }> = [
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
export const WLAN_GUI_STEPS: Array<{ tab: string; fields: Localized; note: Localized }> = [
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

export const STP_ROLES: Array<{ name: string; detail: Localized }> = [
  { name: 'Root port', detail: { it: 'Su ogni switch non-root, è la porta con il costo totale minore verso la root bridge.', en: 'On each non-root switch, this is the port with the lowest total path cost toward the root bridge.' } },
  { name: 'Designated port', detail: { it: 'È la porta che offre il percorso migliore verso la root per uno specifico segmento; inoltra i frame.', en: 'This port offers the best path to the root for a specific segment; it forwards frames.' } },
  { name: 'Alternate port', detail: { it: 'In RSTP fornisce un percorso alternativo verso la root e rimane in discarding finché non serve.', en: 'In RSTP, this provides an alternate path to the root and stays discarding until needed.' } },
  { name: 'RSTP states', detail: { it: 'Discarding non inoltra né apprende MAC; learning apprende MAC; forwarding apprende e inoltra.', en: 'Discarding neither forwards nor learns MACs; learning learns MACs; forwarding learns and forwards.' } }
];

export const ETHERCHANNEL_REQUIREMENTS: Localized[] = [
  { it: 'Stessa velocità e duplex sulle porte membro.', en: 'Matching speed and duplex on member ports.' },
  { it: 'Coerenza tra modalità access/trunk, VLAN access, native VLAN e allowed list.', en: 'Consistent access/trunk mode, access VLAN, native VLAN, and allowed list.' },
  { it: 'Tutte le porte membro devono appartenere allo stesso channel-group e usare un protocollo compatibile.', en: 'All member ports must use the same channel group and a compatible negotiation protocol.' }
];

export const VLAN_CONFIG = `vlan 10
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

export const L2_SECURITY_CONFIG = `ip dhcp snooping
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

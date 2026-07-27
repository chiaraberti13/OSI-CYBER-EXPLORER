import { useState, Fragment } from 'react';
import { OSI_LAYERS, ATTACK_SCENARIOS } from '../constants';
import { useStore } from '../store';

const SCENARIO_FEEDBACK: Record<string, {
  attack: { it: string; en: string };
  defense: { it: string; en: string };
}> = {
  'l1-jamming': {
    attack: {
      it: 'DISTURBO DEL SEGNALE (JAMMING): Il canale fisico è saturo di rumore di fondo. I bit non possono essere trasferiti e la trasmissione si interrompe a livello Fisico.',
      en: 'SIGNAL JAMMING DETECTED: The physical channel is flooded with noise. Bits cannot be transmitted and the communication halts at the Physical layer.'
    },
    defense: {
      it: 'FILTRI ATTIVI: Lo spettro di frequenza è protetto da frequency hopping e schermatura fisica, azzerando le interferenze esterne.',
      en: 'ACTIVE SHIELDING: The spectrum is protected by frequency hopping and physical shielding, nullifying external interference.'
    }
  },
  'l1-tapping': {
    attack: {
      it: 'INTERCETTAZIONE FISICA (TAPPING): Un accoppiatore abusivo sul cavo fisico sta clonando ed estraendo i segnali in transito.',
      en: 'PHYSICAL TAPPING DETECTED: An unauthorized cable splice or fiber bend is actively cloning and capturing data in transit.'
    },
    defense: {
      it: 'CRITTOGRAFIA DI LINEA: Sensori OTDR e crittografia ottica di link rilevano variazioni di luce e mettono al sicuro il payload.',
      en: 'LINE SECURITY ONLINE: OTDR sensors detect light manipulation while link encryption safeguards the raw payload.'
    }
  },
  'l2-mitm': {
    attack: {
      it: 'ARP POISONING RIUSCITO: L\'attaccante ha avvelenato la cache ARP dello switch. Tutto il traffico locale viene ricanalizzato attraverso l\'host malevolo.',
      en: 'ARP POISONING SUCCESSFUL: The attacker poisoned the ARP cache. Local area traffic is rerouted through the fraudulent host.'
    },
    defense: {
      it: 'CONTROMISURA DAI: Dynamic ARP Inspection (DAI) sullo switch ha scartato i messaggi ARP gratuitous fasulli e non autorizzati.',
      en: 'DAI MITIGATION: Dynamic ARP Inspection (DAI) on the switch dropped unauthorized gratuitous ARP replies.'
    }
  },
  'l2-mac-flood': {
    attack: {
      it: 'MAC FLOODING RIUSCITO: La tabella CAM dello switch è satura. Lo switch entra in modalità fail-open, inoltrando frammenti in broadcast a tutte le porte.',
      en: 'MAC FLOODING SUCCESSFUL: The switch CAM table is filled to capacity. The switch fails open, broadcasting all frames like a hub.'
    },
    defense: {
      it: 'PORT SECURITY ATTIVA: Lo switch limita i MAC address consentiti per porta e blocca l\'interfaccia violata che inviava richieste massive.',
      en: 'PORT SECURITY ENGAGED: The switch limits maximum allowed MACs per interface and disables the leaking port immediately.'
    }
  },
  'l2-dhcp-starve': {
    attack: {
      it: 'DHCP STARVATION RIUSCITO: Tutte le allocazioni di indirizzi IP nel pool DHCP sono esaurite. Ai nuovi client legittimi viene rifiutata la connessione.',
      en: 'DHCP STARVATION SUCCESSFUL: All IP pool leases have been exhausted. Legitimate new clients cannot obtain an IP address.'
    },
    defense: {
      it: 'DHCP SNOOPING OPERATIVO: Lo switch ignora le richieste DHCP malevole provenienti da porte non affidabili.',
      en: 'DHCP SNOOPING OPERATIVE: The switch identifies and drops malicious DHCP requests coming from untrusted interfaces.'
    }
  },
  'l3-spoofing': {
    attack: {
      it: 'IP SPOOFING RIUSCITO: Pacchetti con indirizzo IP sorgente contraffato hanno superato i controlli di perimetro ignorando le regole sul firewall.',
      en: 'IP SPOOFING SUCCESSFUL: Packets with forged source IPs successfully bypassed peripheral check-rules on the firewall.'
    },
    defense: {
      it: 'REGOLA URPF FILTRANTE: Unicast Reverse Path Forwarding (uRPF) ha scartato il pacchetto poiché l\'interfaccia di ingresso era incongruente.',
      en: 'URPF RULE ACTIVE: Unicast Reverse Path Forwarding (uRPF) discarded the spoofed packet as the ingress route was invalid.'
    }
  },
  'l3-smurf': {
    attack: {
      it: 'ICMP SMURF RIUSCITO: Attacco amplificato tramite richiesta ECHO ICMP broadcast. L\'obiettivo è sommerso da risposte Echo-Reply non richieste.',
      en: 'ICMP SMURF SUCCESSFUL: Reflection attack enabled using broadcast ICMP echo requests. The target is flooded with replies.'
    },
    defense: {
      it: 'FILTRAGGIO BROADCAST: I router di confine ignorano e bloccano l\'instradamento dei pacchetti broadcast diretti all\'intera sottorete.',
      en: 'BROADCAST SCRUBBING: Border routers drop broadcast directed ICMP echo requests, preventing spoofed reflection bursts.'
    }
  },
  'l3-frag': {
    attack: {
      it: 'IP FRAGMENTATION RIUSCITO: Frammenti IP sovrapposti e di dimensioni anomale hanno causato l\'esaurimento delle risorse sul sistema vittima.',
      en: 'IP FRAGMENTATION SUCCESSFUL: Overlapping and malformed packet fragments bypass checks, causing resource exhaustion during reassembly.'
    },
    defense: {
      it: 'ISPEZIONE REASSEMBLAGGIO: Il firewall stateful ricombina ed analizza i frammenti prima dell\'inoltro salvaguardando il buffer dell\'host.',
      en: 'REASSEMBLY INSPECTION: The stateful firewall reconstructs and inspects IP fragments, discarding out-of-order anomalies.'
    }
  },
  'l4-dos': {
    attack: {
      it: 'TCP SYN FLOOD RIUSCITO: Innumerevoli handshake TCP parziali hanno saturato la tabella SYN Backlog. Il server ignora ulteriori richieste.',
      en: 'TCP SYN FLOOD SUCCESSFUL: Millions of half-open TCP handshakes filled the SYN backlog queue, making the server unavailable.'
    },
    defense: {
      it: 'SYN COOKIES ATTIVI: Il server convalida l\'autenticità della connessione nell\'ACK finale senza allocare memoria preliminare.',
      en: 'SYN COOKIES ACTIVE: The server validates authentic handshakes cryptographically without allocating buffer queues upfront.'
    }
  },
  'l4-udp-flood': {
    attack: {
      it: 'UDP FLOOD RIUSCITO: La tempesta di pacchetti UDP inviati a porte casuali manda in blocco il socket nell\'invio di ricorsivi ICMP Port Unreachable.',
      en: 'UDP FLOOD SUCCESSFUL: A massive volume of UDP packets to random ports exhausted CPU capacity generating ICMP Unreachable replies.'
    },
    defense: {
      it: 'RATE-LIMITING INTERFACCIA: Regole firewall Anycast scartano la raffica anomala mantenendo inalterata la stabilità di rete.',
      en: 'SURGE RATE-LIMITING: Anycast filtering and router-level rate-limiting drop unauthorized UDP flows dynamically.'
    }
  },
  'l4-scan': {
    attack: {
      it: 'SCANSIONE PORTE RIUSCITA: Una scansione coordinata (SYN/FIN Scan) ha tracciato con precisione i servizi attivi ed esposti dell\'host.',
      en: 'PORT SCAN SUCCESSFUL: Intensive probing (SYN/FIN scans) mapped out open ports, exposing active socket applications.'
    },
    defense: {
      it: 'IDS REAZIONE DINAMICA: L\'Intrusion Detection System intercetta i ping sequenziali e inserisce temporaneamente in blacklist l\'IP sorgente.',
      en: 'IDS INSTANT ACTION: The Intrusion Detection System caught the probes and dynamically blocked the sender IP on the firewall.'
    }
  },
  'l5-replay': {
    attack: {
      it: 'ATTACCO DI REPLAY RIUSCITO: Un token di autenticazione precedentemente intercettato è stato reiniettato, eludendo la sequenza e validando il login.',
      en: 'REPLAY ATTACK SUCCESSFUL: A captured session token has been re-sent, bypassing fresh login credentials successfully.'
    },
    defense: {
      it: 'CONTROLLO NONCE E TIMESTAMP: L\'applicazione scarta il frame poiché il marcatore di tempo o il token usa-e-getta (Nonce) sono scaduti o già usati.',
      en: 'NONCE & TIME CHECK: The server discarded the packet because its timestamp or single-use nonce is expired or already processed.'
    }
  },
  'l5-hijacking': {
    attack: {
      it: 'SESSION HIJACKING RIUSCITO: L\'attaccante ha preso il controllo di una sessione TCP stabilita falsificando gli ID o inserendosi nel flusso delle credenziali.',
      en: 'SESSION HIJACKING SUCCESSFUL: The attacker hijacked or cloned an authentic active session ID, taking direct command of the channel.'
    },
    defense: {
      it: 'TOKEN BINDING E TLS: La rinegoziazione periodica delle chiavi cifrate TLS ed ID di canale univoci hanno invalidato il token trafugato.',
      en: 'TOKEN BINDING & HSTS: Recurrent TLS session ticket rotation and strict transport bindings dismissed the hijacked session immediately.'
    }
  },
  'l6-oracle': {
    attack: {
      it: 'PADDING ORACLE RIUSCITO: Il testo cifrato è stato decifrato byte-per-byte sfruttando le risposte differenziate di errore sul padding CBC.',
      en: 'PADDING ORACLE SUCCESSFUL: The attacker reconstructed ciphertexts by analyzing temporal and descriptive CBC padding-exception delays.'
    },
    defense: {
      it: 'CRITTOGRAFIA AUTENTICATA (AEAD): L\'adozione di modalità cifrate come AES-GCM impedisce la manipolazione del padding lanciando eccezioni generiche identiche.',
      en: 'AUTHENTICATED ENCRYPTION: GCM/AEAD mode validates message integrity, throwing uniform errors to deny padding analysis.'
    }
  },
  'l7-injection': {
    attack: {
      it: 'SQL INJECTION RIUSCITO: Frammenti di codice SQL dannoso inseriti negli input hanno alterato la query originale, svelando informazioni protette.',
      en: 'SQL INJECTION SUCCESSFUL: Unescaped database statements manipulated the compile tree, circumventing login or leaking information.'
    },
    defense: {
      it: 'QUERY PARAMETRIZZATE: L\'uso di prepared statements isola gli argomenti di input trattandoli come stringhe letterali inoffensive.',
      en: 'PARAMETERIZED BINDINGS: Prepared queries treat all inputs as safe data fields, completely neutralizing database tree shifts.'
    }
  },
  'l7-xss': {
    attack: {
      it: 'XSS RIUSCITO: Script Javascript malevoli memorizzati lato server vengono eseguiti nel browser degli utenti, catturando cookie e file di sessione.',
      en: 'XSS ATTACK SUCCESSFUL: Unauthorized inline javascript code was executed by the browser on client-side, stealing cookie files.'
    },
    defense: {
      it: 'CSP E SANITIZZAZIONE: Una rigida Content Security Policy (CSP) impedisce l\'esecuzione di script inline sprovvisti di firma approvata.',
      en: 'CSP FILTERING ENGAGED: A robust Content Security Policy and output-encoding block any unsanctioned script executions.'
    }
  },
  'l7-homograph': {
    attack: {
      it: 'PHISHING OMOGRAFICO RIUSCITO: Caratteri internazionalizzati (Unicode) esteticamente identici a lettere latine hanno ingannato l\'utente simulando un sito protetto.',
      en: 'HOMOGRAPH PHISHING SUCCESSFUL: Internationalized domain names with indistinguishable characters tricked users into visiting a clone page.'
    },
    defense: {
      it: 'PUNYCODE CONVERSION: Il browser intercetta il set di caratteri misti e visualizza la stringa codificata ("xn--") smascherando l\'inganno.',
      en: 'PUNYCODE CONVERSION ACTIVE: The client resolves and displays the domain with Punycode representation ("xn--"), unmasking the fake address.'
    }
  },
  'l7-dns-poison': {
    attack: {
      it: 'AVVELENAMENTO DNS RIUSCITO: Record contraffatti inseriti nella cache del DNS di rete reindirizzano gli utenti verso indirizzi IP controllati dall\'attaccante.',
      en: 'DNS POISONING SUCCESSFUL: Mimicked responses corrupted the caching resolver domain mapping, redirecting client requests to the wrong IP.'
    },
    defense: {
      it: 'CONVALIDA DNSSEC: Le risposte DNS contengono firme crittografiche digitali. Se non verificabili, il pacchetto viene rifiutato impedendo il dirottamento.',
      en: 'DNSSEC IMPLEMENTATION: Signed DNS delegations cryptographically check authenticity of records, discarding suspicious IP outputs.'
    }
  },
  'l7-slowloris': {
    attack: {
      it: 'SLOWLORIS RIUSCITO: Il web server ha terminato i socket disponibili a causa di connessioni mantenute fittiziamente aperte con intestazioni parziali.',
      en: 'SLOWLORIS SUCCESSFUL: The application pool is exhausted as the attacker slowly feeds HTTP headers to prevent sessions from closing.'
    },
    defense: {
      it: 'TIMEOUT INTESTAZIONI EXPIRED: Il web server chiude istantaneamente i canali che non completano l\'invio delle intestazioni entro intervalli brevi prestabiliti.',
      en: 'STALL TIMEOUT ACTIVATED: Web server configurations prune stalling HTTP connections that fail to deliver key content on schedule.'
    }
  },
  'l4-tcp-reset': {
    attack: {
      it: 'TCP RESET RIUSCITO: Un pacchetto RST con indirizzo e numero di sequenza forgiati ha forzato la chiusura immediata della connessione di rete.',
      en: 'TCP RESET SUCCESSFUL: A spoofed TCP RST packet matching the active sequence parameters triggered an abrupt socket closure.'
    },
    defense: {
      it: 'CIFRATURA DI INTESTAZIONE: TLS blocca i tentativi degli intercettatori passivi di leggere i numeri di sequenza, rendendo impossibile forgiare l\'attacco.',
      en: 'TCP SEQUENCE ENCRYPTION: TLS sessions prevent passive wiretappers from guessing sequence coordinates, neutralizing reset injections.'
    }
  },
  'l3-pod': {
    attack: {
      it: 'PING OF DEATH RIUSCITO: Pacchetti ICMP sovradimensionati rispetto al limite IP hanno scatenato arresti anomali durante il riassemblaggio software.',
      en: 'PING OF DEATH SUCCESSFUL: Malformed oversized IP frames exceeded maximum limits and crashed the target driver memory during reassembly.'
    },
    defense: {
      it: 'FILTRAGGIO DIMENSIONE ICMP: Il router esamina la frammentazione e scarta pacchetti accumulati che superano i 65.535 byte di buffer.',
      en: 'ICMP DIMENSION CHECK: Internal network drivers and firewalls filter and block payloads exceeding standard MTU and IP buffer capacities.'
    }
  },
  'l3-bgp-hijack': {
    attack: {
      it: 'BGP HIJACKING RIUSCITO: Annunci BGP fasulli hanno modificato il traffico di routing principale di Internet, instradandolo attraverso sistemi controllati.',
      en: 'BGP HIJACKING SUCCESSFUL: Rogue Autonomous System path advertisements redirected global internet traffic core coordinates through fake routers.'
    },
    defense: {
      it: 'VALIDAZIONE RPKI: Standard di sicurezza (BGPsec) confermano crittograficamente i diritti di instradamento, scartando annunci anomali.',
      en: 'RPKI CHECK ACTIVE: Cryptographically signed certifications validate Autonomous System routing bounds, dropping unauthorized paths.'
    }
  },
  'l7-ssh-brute': {
    attack: {
      it: 'SSH BRUTE FORCE RIUSCITO: Tentativi consecutivi automatizzati hanno individuato passkey amministrative sbloccando la riga di comando remota.',
      en: 'SSH BRUTE FORCE SUCCESSFUL: High-frequency dictionaries unlocked root credentials, delivering full console access to the endpoint.'
    },
    defense: {
      it: 'FAIL2BAN REAZIONE: I continui tentativi falliti innescano l\'esclusione temporanea dell\'indirizzo IP tramite tabelle di routing host.',
      en: 'FAIL2BAN ACTIVE: Multiple successive unauthorized login attempts prompted a system IP blacklist trigger, denying any further connect requests.'
    }
  },
  'l7-smtp-relay': {
    attack: {
      it: 'SMTP OPEN RELAY EXPLOITED: Il server accetta e instrada flussi e-mail malevoli di terze parti facilitando l\'inoltro di spam e malware indiscriminato.',
      en: 'SMTP OPEN RELAY EXPLOITED: The wide-open relay server processed unauthorized email queues, forwarding massive spam at scale.'
    },
    defense: {
      it: 'RESTRIZIONE SASL: È stata abilitata l\'autenticazione accoppiata a rigide regole SPF/DKIM bloccando indirizzi provenienti da domini esterni.',
      en: 'SASL SECURED: Configured strict credential-based transport authentication combined with SPF/DKIM restrictions.'
    }
  },
  'l7-ftp-sniffing': {
    attack: {
      it: 'FTP CLEAR TEXT SNIFFING: Credenziali di amministrazione inviate su flussi FTP non protetti sono state lette e catturate in chiaro.',
      en: 'FTP CLEAR TEXT SNIFFING: Management credentials sent across unencrypted FTP control ports have been recorded in plain ASCII directly.'
    },
    defense: {
      it: 'ENFORCED SFTP/FTPS: L\'host disabilita le porte tradizionali e consente esclusivamente trasferimenti cifrati proteggendo i dati di controllo.',
      en: 'ENFORCED SFTP/FTPS: Traditional plain ports are barred in favor of encrypted SSH/TLS tunnels, keeping transmission items secure.'
    }
  }
};
import { Attack, Defense, Severity } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Network, Box, ShieldAlert, ShieldCheck, Skull, Zap, ChevronDown, ChevronUp, Lightbulb, BookOpen, Search } from 'lucide-react';

const severityConfig: Record<Severity, { label: string; color: string; bg: string; border: string }> = {
  low:      { label: 'LOW',      color: '#64748b', bg: 'bg-slate-50',  border: 'border-slate-200' },
  medium:   { label: 'MEDIUM',   color: '#b45309', bg: 'bg-amber-50', border: 'border-amber-200' },
  high:     { label: 'HIGH',     color: '#c2410c', bg: 'bg-orange-50', border: 'border-orange-200' },
  critical: { label: 'CRITICAL', color: '#b91c1c', bg: 'bg-red-50',    border: 'border-red-200' },
};

const TUTOR_CORNER: Record<number, {
  analogy: { en: string; it: string };
  commands: { description: string; code: string }[];
}> = {
  7: {
    analogy: {
      en: "Like reading the actual content and requests inside a letter (e.g., 'Deliver 1 hot coffee' or 'Query room 42 balance').",
      it: "Come leggere il contenuto reale e le richieste scritte in una lettera (es. 'Consegna 1 caffè caldo' o 'Richiedi il saldo della stanza 42')."
    },
    commands: [
      { description: "Inspect HTTP headers in real-time", code: "curl -Iv https://httpbin.org/get" },
      { description: "Resolve DNS record diagnostic fields", code: "dig +short A google.com" }
    ]
  },
  6: {
    analogy: {
      en: "Translating words into a common language (English/Italian) or encrypting/compressing the letter inside a safe before sealing it.",
      it: "Tradurre le parole in una lingua comune (inglese/italiano) o crittografare/comprimere la lettera in una cassaforte prima di spedirla."
    },
    commands: [
      { description: "Check TLS handshake & TLS certificate chain details", code: "openssl s_client -connect google.com:443" },
      { description: "Verify payload JSON content-type parsing", code: "curl -H 'Content-Type: application/json'" }
    ]
  },
  5: {
    analogy: {
      en: "Setting up a phone call session, verifying identities with badges, keeping the line open, and cleanly logging off when finished.",
      it: "Stabilire una chiamata telefonica attiva, verificare le identità, tenere aperta la linea e riagganciare in modo ordinato al termine."
    },
    commands: [
      { description: "Check current active state authentication cookies", code: "document.cookie" },
      { description: "List established RPC sessions & database handles", code: "netstat -an | grep 5432" }
    ]
  },
  4: {
    analogy: {
      en: "Registered Mail (TCP) guaranteeing order & receipt verification, OR quick Postcards (UDP) sent without delivery guarantees or retries.",
      it: "Posta Raccomandata (TCP) con ricevuta che garantisce ordine e recapito, OPPURE una cartolina veloce (UDP) spedita senza tracciamento."
    },
    commands: [
      { description: "Check if a remote service port socket is open & listening", code: "nc -zv 192.168.1.1 443" },
      { description: "Display all active local network ports & sockets", code: "ss -tulnp" }
    ]
  },
  3: {
    analogy: {
      en: "Sorting packages globally at the national post office using Postal ZIP codes / IP addresses to route packages from country to country.",
      it: "Smistare i pacchi su scala mondiale scrivendo gli indirizzi IP / Codici Postali per instradare le lettere da nazione a nazione."
    },
    commands: [
      { description: "Trace hops and route paths across autonomous routers", code: "traceroute 8.8.8.8" },
      { description: "Check standard reachability and routing roundtrip latency", code: "ping -c 4 8.8.8.8" },
      { description: "Examine system network gateway routing tables", code: "ip route show" }
    ]
  },
  2: {
    analogy: {
      en: "Handing an envelope by hand to a specific office room number (MAC address) on the exact same floor of your current building.",
      it: "Consegnare a mano la busta a un numero di stanza specifico (indirizzo MAC) situato sullo stesso piano dell'edificio locale."
    },
    commands: [
      { description: "Inspect the local IP-to-MAC hardware resolution map", code: "arp -a" },
      { description: "See current interface Layer-2 hardware MAC details", code: "ip link show" }
    ]
  },
  1: {
    analogy: {
      en: "The copper wires, physical optical fibers, radio frequency sparks, or connectors carrying simple raw electrical/light binary pulses (0 and 1).",
      it: "I cavi in rame, i filamenti di fibra ottica, le onde radio o le tensioni elettriche che trasmettono impulsi di bit binari (0 e 1)."
    },
    commands: [
      { description: "Inspect physical link speed, auto-negotiation, and cable light indicators", code: "ethtool eth0" },
      { description: "Check physical cable carrier & transceiver drops", code: "cat /sys/class/net/eth0/carrier" }
    ]
  }
};

function AttackCard({ attack }: { attack: Attack }) {
  const [expanded, setExpanded] = useState(true);
  const sev = severityConfig[attack.severity];

  return (
    <motion.div
      layout
      className={`rounded-xl border ${sev.border} ${sev.bg} shadow-sm overflow-hidden`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-4 text-left group"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded border" style={{ color: sev.color, borderColor: sev.color + '50', backgroundColor: sev.color + '15' }}>
              {sev.label}
            </span>
            <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">{attack.name}</h4>
          </div>
          <p className="text-[10px] text-slate-500 leading-snug">{attack.description}</p>
        </div>
        <div className="flex-shrink-0 mt-0.5 text-slate-400 group-hover:text-slate-600 transition-colors">
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-slate-200/50 pt-3">
              {/* How it works */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Zap className="w-3 h-3 text-amber-600" />
                  <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Come funziona / How it works</span>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-3">
                  <pre className="text-[9px] text-slate-600 leading-relaxed whitespace-pre-wrap font-mono">{attack.howItWorks}</pre>
                </div>
              </div>

              {/* Impact */}
              <div>
                <span className="text-[8px] font-black text-red-600 uppercase tracking-widest block mb-1">Impatto / Impact</span>
                <p className="text-[10px] text-red-700/80 leading-snug">{attack.impact}</p>
              </div>

              {/* Mitigation */}
              <div className="pt-2 border-t border-slate-200/40">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Mitigazione</span>
                </div>
                <p className="text-[10px] text-emerald-700/70 leading-snug italic">{attack.mitigation_strategy}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function DefenseCard({ defense }: { defense: Defense }) {
  return (
    <div className="p-4 bg-emerald-50 border border-emerald-100 shadow-sm rounded-xl space-y-2">
      <div className="flex items-start gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-tight mb-1">{defense.name}</h4>
          <p className="text-[10px] text-slate-500 leading-snug mb-2">{defense.description}</p>
          <div className="bg-white rounded-lg border border-emerald-100 p-2 shadow-sm">
            <span className="text-[7px] font-black text-emerald-800 uppercase tracking-widest block mb-1">Metodo / Method</span>
            <p className="text-[9px] text-emerald-900/70 font-mono leading-relaxed">{defense.method}</p>
          </div>
          {defense.counters && defense.counters.length > 0 && (
            <div className="mt-2">
              <span className="text-[7px] font-black text-emerald-600/60 uppercase tracking-widest block mb-1.5">Contrastare / Counters</span>
              <div className="flex flex-wrap gap-1">
                {defense.counters.map(c => (
                  <span key={c} className="text-[8px] px-1.5 py-0.5 bg-red-50 border border-red-100 text-red-600 rounded font-mono uppercase">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LayerDetails() {
  const { 
    selectedLayerId, 
    language, 
    viewMode, 
    setViewMode, 
    packetHeaders, 
    selectedProtocol, 
    simulationState, 
    activeAttack, 
    activeScenarioId,
    detailTab, 
    setDetailTab,
    hasSimulated,
    defenseEnabled
  } = useStore();

  const layer = OSI_LAYERS.find(l => l.id === selectedLayerId);

  if (!layer && viewMode === 'theory') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl p-8 text-center uppercase tracking-widest text-xs bg-white">
        <Network className="w-12 h-12 mb-4 opacity-20" />
        {language === 'en' ? 'Select a layer to inspect' : 'Seleziona un livello da ispezionare'}
      </div>
    );
  }

  const info = layer?.translations[language];
  
  // Filter attacks based on simulation state AND selected protocol
  const attacksForView = info?.attacks?.filter(a => {
    // If an attack has protocols defined, it must match the selected one
    const protocolMatches = !a.protocols || a.protocols.includes(selectedProtocol);
    
    // If simulation is active, only show the attack being simulated
    if (hasSimulated && activeAttack !== 'none') {
      return a.type === activeAttack && protocolMatches;
    }
    
    // If no simulation, show all attacks matching the protocol
    return protocolMatches;
  }) ?? [];

  // Filter defenses that counter the active attack AND match protocol
  const defensesForView = info?.defenses?.filter(d => {
    // Protocol match
    const protocolMatches = !d.protocols || d.protocols.includes(selectedProtocol);

    if (hasSimulated && activeAttack !== 'none') {
      // Check if any of the counters strings contain the attack name or parts of it
      return protocolMatches && d.counters?.some(c => 
        c.toLowerCase().includes(activeAttack.toLowerCase()) || 
        (attacksForView.length > 0 && c.toLowerCase().includes(attacksForView[0].name.toLowerCase()))
      );
    }
    
    return protocolMatches;
  }) ?? [];

  // General protocol-specific attacks and defenses (ignoring is-simulating filter) for overall security stats
  const protocolAttacks = info?.attacks?.filter(a => !a.protocols || a.protocols.includes(selectedProtocol)) ?? [];
  const protocolDefenses = info?.defenses?.filter(d => !d.protocols || d.protocols.includes(selectedProtocol)) ?? [];

  const tabs = [
    { id: 'overview' as const, label: language === 'en' ? 'Overview' : 'Panoramica', icon: BookOpen },
    { id: 'attacks' as const, label: language === 'en' ? 'Attacks' : 'Attacchi', icon: Skull, count: attacksForView.length },
    { id: 'defenses' as const, label: language === 'en' ? 'Defenses' : 'Difese', icon: ShieldCheck, count: defensesForView.length },
    { id: 'security' as const, label: language === 'en' ? 'Analysis' : 'Analisi', icon: Search },
  ];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={viewMode === 'packet' ? 'packet-view' : (layer?.id || 'none')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="h-full bg-white border border-slate-100 rounded-xl flex flex-col overflow-hidden shadow-sm"
      >
        {viewMode === 'packet' ? (
          <>
            <div className="flex items-center justify-between border-b border-slate-50 p-5 bg-slate-50/30">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-900">
                   <Box className="w-5 h-5 text-white" />
                 </div>
                 <div>
                   <h2 className="text-xs font-bold text-slate-900 uppercase tracking-[0.2em]">Packet_Inspect</h2>
                   <p className="text-[10px] text-emerald-600 font-mono mt-0.5">PROTO_{selectedProtocol}_ACTIVE</p>
                 </div>
              </div>
              <button
                onClick={() => setViewMode('theory')}
                className="text-[9px] font-bold text-slate-400 hover:text-slate-800 uppercase tracking-widest px-2 py-1 bg-white rounded border border-slate-200 transition-all shadow-sm"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-6 bg-white">
              <section className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                 <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: layer?.color }} />
                    <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Layer_Mission</h3>
                 </div>
                 <p className="text-[11px] text-slate-700 leading-relaxed">{info?.description}</p>
              </section>

              {simulationState === 'interrupted' && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-4 shadow-sm"
                >
                   <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                      <ShieldAlert className="w-4 h-4 text-white" />
                   </div>
                   <div>
                      <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest">Security_Violation_Detected</h4>
                      <p className="text-[10px] text-red-700/70 font-mono mt-1 italic">
                        {activeAttack === 'mitm' ? 'Man-in-the-Middle detected at Data Link / Network bridge.' :
                         activeAttack === 'dos' ? 'Resource exhaustion detected. Network stack saturated.' :
                         activeAttack === 'replay' ? 'Replay attack: old session tokens being reused.' :
                         activeAttack === 'eavesdropping' ? 'Passive sniffing detected on physical medium.' :
                         'Identity spoofing detected in L3 source headers.'}
                      </p>
                   </div>
                </motion.div>
              )}

              <section>
                 <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Runtime Payload</h3>
                 <div className="p-3 bg-slate-900 rounded-lg border border-black/5 font-mono text-[10px] text-slate-200 break-all leading-relaxed shadow-lg">
                   {"{ \"msg\": \"NetLab_Simulator\", \"proto\": \"" + selectedProtocol + "\", \"bytes\": 1500, \"payload\": \"Secure\" }"}
                 </div>
              </section>

              <section>
                <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Protocol Header Breakdown</h3>
                <div className="space-y-4">
                  {[...packetHeaders].reverse().map((h, idx) => {
                    const l = OSI_LAYERS.find(layer => layer.id === h.layer);
                    const headerFields = (h.fields && h.fields.length > 0)
                      ? h.fields
                      : ({
                        7: [{ key: 'Method', value: 'GET' }, { key: 'Path', value: '/api/v1' }, { key: 'Agent', value: 'Lab_Core' }],
                        6: [{ key: 'Encoding', value: 'Base64' }, { key: 'Crypto', value: 'TLSv1.3' }, { key: 'Type', value: 'JSON' }],
                        5: [{ key: 'SID', value: 'SESS_9821' }, { key: 'Auth', value: 'Verified' }, { key: 'Sync', value: 'ACK' }],
                        4: [{ key: 'SrcPort', value: '54321' }, { key: 'DstPort', value: selectedProtocol === 'HTTP' ? '80' : '7' }, { key: 'Seq', value: '1024' }],
                        3: [{ key: 'SrcIP', value: '192.168.1.10' }, { key: 'DstIP', value: '8.8.8.8' }, { key: 'TTL', value: '64' }],
                        2: [{ key: 'SrcMAC', value: '00:0C:29:...' }, { key: 'DstMAC', value: '00:50:56:...' }, { key: 'Type', value: '0x0800' }],
                        1: [{ key: 'Signal', value: '0/1' }, { key: 'Media', value: 'Ethernet' }, { key: 'Clock', value: '1Gbps' }],
                      }[h.layer as keyof typeof headerFields] || []);

                    return (
                      <div key={`${h.layer}-${idx}`} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 group hover:shadow-sm transition-all shadow-none">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] font-black uppercase flex items-center gap-2" style={{ color: l?.color }}>
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: l?.color }} />
                            L{h.layer} {l?.translations[language].name}
                          </span>
                          <div className="flex items-center gap-2">
                             <span className="text-[8px] font-black text-slate-400 bg-white px-1 py-0.5 rounded border border-slate-200 uppercase">{h.pduName}</span>
                             <span className="text-[9px] text-slate-500 font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">{h.protocol}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                           {headerFields.map(f => (
                             <div key={f.key} className={`p-1.5 border rounded-md transition-colors ${simulationState !== 'idle' && h.layer === selectedLayerId ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100 shadow-sm'}`}>
                                <div className="flex items-center justify-between mb-1">
                                   <span className="text-[6px] text-slate-400 uppercase leading-none">{f.key}</span>
                                   {simulationState !== 'idle' && h.layer === selectedLayerId && (
                                     <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                                   )}
                                </div>
                                <span className={`text-[8px] font-mono truncate block ${simulationState !== 'idle' && h.layer === selectedLayerId ? 'text-emerald-600' : 'text-slate-700'}`}>{f.value}</span>
                             </div>
                           ))}
                        </div>
                        <p className="text-[9px] text-slate-500 font-mono leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                          {h.details}
                        </p>
                      </div>
                    );
                  })}
                  {packetHeaders.length === 0 && (
                    <div className="text-center py-12 flex flex-col items-center gap-3 border border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                      <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest">Awaiting_Transmission_Init</span>
                    </div>
                  )}
                </div>
              </section>

              <section className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Encapsulation Logic</h4>
                 <p className="text-[10px] text-slate-500 leading-relaxed italic">
                    {language === 'it'
                      ? 'Per ogni livello dello stack, viene aggiunto un header specifico che contiene le istruzioni per il livello corrispondente sul destinatario. Solo il livello fisico (L1) trasmette segnali elettrici/ottici.'
                      : 'For each stack layer, a specific header is added containing instructions for the matching layer at the destination. Only the physical layer (L1) transmits electrical/optical signals.'}
                 </p>
              </section>
            </div>
          </>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-50 p-5 flex-shrink-0 bg-slate-50/20">
              <div className="flex items-center gap-3">
                 <div
                   className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-sm"
                   style={{ backgroundColor: layer?.color }}
                 >
                   {layer?.id}
                 </div>
                 <div>
                   <h2 className="text-xs font-bold text-slate-900 uppercase tracking-[0.2em]">{info?.name}</h2>
                   <p className="text-[10px] text-slate-400 font-mono mt-0.5">PDU: {layer?.pdu} · LVL_{layer?.id}</p>
                 </div>
              </div>
              <Network className="w-4 h-4 text-slate-200" />
            </div>

            {/* Tab Bar */}
            <div className="flex border-b border-slate-50 flex-shrink-0 px-2 pt-2 gap-1 bg-white">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = detailTab === tab.id;
                return (
                   <button
                    key={tab.id}
                    onClick={() => setDetailTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-[9px] font-bold uppercase tracking-widest transition-all border-b-2 ${
                      isActive
                        ? tab.id === 'attacks'
                          ? 'border-red-600 text-red-600 bg-red-50'
                          : tab.id === 'defenses'
                          ? 'border-emerald-600 text-emerald-600 bg-emerald-50'
                          : 'border-slate-900 text-slate-900 bg-slate-50/50'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {tab.label}
                    {tab.count !== undefined && (
                      <span className={`ml-0.5 px-1 py-0.5 rounded text-[7px] font-black ${
                        isActive && tab.id === 'attacks' ? 'bg-red-200 text-red-700' :
                        isActive && tab.id === 'defenses' ? 'bg-emerald-200 text-emerald-700' :
                        'bg-slate-100 text-slate-400'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
              <AnimatePresence mode="wait">
                {detailTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="p-5 space-y-6"
                  >
                    {/* Simulation Result / Insight Section */}
                    {hasSimulated && activeAttack !== 'none' && (
                      <section className={`p-4 rounded-xl border animate-in fade-in slide-in-from-bottom-4 duration-500 ${simulationState === 'interrupted' && !defenseEnabled ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                        <div className="flex items-center gap-2 mb-3">
                          {simulationState === 'interrupted' && !defenseEnabled ? (
                            <Skull className="w-4 h-4 text-red-600" />
                          ) : (
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          )}
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900">
                            {language === 'it' ? 'Esecuzione Analisi L' : 'Execution Insight L'}{selectedLayerId}
                          </h4>
                        </div>
                        
                        <div className="space-y-3">
                          <p className="text-[10px] text-slate-700 leading-relaxed font-semibold">
                            {simulationState === 'interrupted' && !defenseEnabled ? (
                              activeScenarioId && SCENARIO_FEEDBACK[activeScenarioId] ? (
                                SCENARIO_FEEDBACK[activeScenarioId].attack[language]
                              ) : (
                                language === 'it' 
                                  ? `ATTACCO RILEVATO: Il livello ${selectedLayerId} è stato compromesso da ${activeAttack.toUpperCase()}. Il pacchetto è stato intercettato o alterato.`
                                  : `ATTACK DETECTED: Layer ${selectedLayerId} has been compromised by ${activeAttack.toUpperCase()}. The packet was intercepted or altered.`
                              )
                            ) : (
                              activeScenarioId && SCENARIO_FEEDBACK[activeScenarioId] ? (
                                SCENARIO_FEEDBACK[activeScenarioId].defense[language]
                              ) : (
                                language === 'it'
                                  ? `CONTROMISURA ATTIVA: Le protezioni del livello ${selectedLayerId} hanno rilevato e mitigato la minaccia ${activeAttack.toUpperCase()}.`
                                  : `COUNTERMEASURE ACTIVE: Layer ${selectedLayerId} protections detected and mitigated the ${activeAttack.toUpperCase()} threat.`
                              )
                            )}
                          </p>
                          
                          <div className="bg-white/50 p-2.5 rounded-lg border border-slate-200/50 text-[9px] font-mono text-slate-600 leading-normal">
                            <span className="font-bold text-slate-700">{language === 'it' ? 'Dettagli Diagnostica:' : 'Diagnostic Details:'}</span>{' '}
                            {
                              attacksForView.length > 0 ? (
                                activeScenarioId && ATTACK_SCENARIOS.find(s => s.id === activeScenarioId) ? (
                                  `${ATTACK_SCENARIOS.find(s => s.id === activeScenarioId)?.description[language]}`
                                ) : activeAttack === 'mitm' ? (language === 'it' ? 'L\'indirizzo MAC di destinazione è stato corrotto. Il frame viene deviato verso l\'attaccante invece del gateway.' : 'The destination MAC address has been corrupted. The frame is redirected to the attacker instead of the gateway.') :
                                activeAttack === 'dos' ? (language === 'it' ? 'Il buffer di ricezione TCP è saturo. Il sistema non può processare nuove richieste legittime.' : 'The TCP reception buffer is saturated. The system cannot process new legitimate requests.') :
                                activeAttack === 'injection' ? (language === 'it' ? 'Il payload applicativo contiene metacaratteri SQL. La query al database verrà alterata a runtime.' : 'The application payload contains SQL metacharacters. The database query will be altered at runtime.') :
                                activeAttack === 'spoofing' ? (language === 'it' ? 'L\'header IP contiene un indirizzo sorgente non verificato che bypassa i controlli di accesso.' : 'The IP header contains an unverified source address that bypasses access controls.') :
                                (language === 'it' ? 'Anomalia rilevata nel flusso dei bit o della sessione.' : 'Anomaly detected in bit stream or session flow.')
                              ) : (
                                language === 'it' 
                                  ? 'Livello di transito: Questo livello sta incapsulando o inoltrando il pacchetto nel flusso senza ispezionarlo direttamente.'
                                  : 'Transit layer: This layer is encapsulating or forwarding the packet down the stream without direct payload inspection.'
                              )
                            }
                          </div>
                        </div>
                      </section>
                    )}

                    <section>
                      <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                        {language === 'it' ? 'Descrizione' : 'Description'}
                      </h3>
                      <p className="text-xs text-slate-700 leading-relaxed">{info?.description}</p>
                    </section>

                    {info?.responsibilities && info.responsibilities.length > 0 && (
                      <section>
                        <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                          {language === 'it' ? 'Responsabilità Primarie' : 'Primary Responsibilities'}
                        </h3>
                        <div className="space-y-2">
                          {info.responsibilities.map((resp, i) => (
                            <div key={i} className="flex items-start gap-2 group">
                              <div className="w-1 h-1 rounded-full bg-slate-300 mt-1.5 flex-shrink-0 group-hover:bg-slate-900 transition-colors" />
                              <p className="text-[10px] text-slate-600 leading-relaxed">{resp}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {info?.useCases && info.useCases.length > 0 && (
                      <section>
                        <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                          {language === 'it' ? 'Casi d\'Uso Comuni' : 'Common Use Cases'}
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                          {info.useCases.map((useCase, i) => (
                            <div key={i} className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-900/10 flex items-center justify-center text-[7px] font-bold text-slate-400">
                                {i + 1}
                              </div>
                              <p className="text-[10px] text-slate-700 font-medium">{useCase}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {info?.keyFacts && info.keyFacts.length > 0 && (
                      <section>
                        <div className="flex items-center gap-2 mb-3">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                          <h3 className="text-[9px] font-bold text-amber-600 uppercase tracking-widest">
                            {language === 'it' ? 'Fatti Chiave' : 'Key Facts'}
                          </h3>
                        </div>
                        <div className="space-y-2">
                          {info.keyFacts.map((fact, i) => (
                            <div key={i} className="flex gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg shadow-sm">
                              <span className="text-[8px] font-black text-amber-500/40 mt-0.5 flex-shrink-0">0{i + 1}</span>
                              <p className="text-[10px] text-slate-700 leading-relaxed">{fact}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    <section>
                      <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                        {language === 'it' ? 'Protocolli Standard' : 'Standard Protocols'}
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {info?.protocols?.map(p => (
                          <span key={p} className="px-2 py-1 bg-white border border-slate-200 text-slate-700 rounded-md text-[9px] font-mono shadow-sm">
                            {p}
                          </span>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                        {language === 'it' ? 'Statistiche di Sicurezza' : 'Security Stats'}
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-center shadow-sm">
                          <span className="block text-2xl font-black text-red-600">{protocolAttacks.length}</span>
                          <span className="text-[8px] text-slate-500 uppercase tracking-widest">
                            {language === 'it' ? 'Attacchi Noti' : 'Known Attacks'}
                          </span>
                        </div>
                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-center shadow-sm">
                          <span className="block text-2xl font-black text-emerald-600">{protocolDefenses.length}</span>
                          <span className="text-[8px] text-slate-500 uppercase tracking-widest">
                            {language === 'it' ? 'Contromisure' : 'Countermeasures'}
                          </span>
                        </div>
                      </div>
                    </section>

                    {selectedLayerId && TUTOR_CORNER[selectedLayerId] && (
                      <section className="p-4 bg-indigo-50/30 border border-indigo-100 rounded-2xl space-y-4 animate-in fade-in duration-300">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-mono text-[10px] font-black flex items-center justify-center shadow-md shadow-indigo-100">
                            T
                          </div>
                          <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-wider">
                            {language === 'it' ? "L'Angolo del Tutor" : "Tutor's Corner"}
                          </h4>
                        </div>
                        
                        <div className="space-y-1">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">
                            {language === 'it' ? "Analogia Pratica" : "Practical Analogy"}
                          </span>
                          <p className="text-[11px] text-slate-600 leading-relaxed italic pr-2">
                            "{TUTOR_CORNER[selectedLayerId].analogy[language]}"
                          </p>
                        </div>

                        <div className="space-y-2 border-t border-indigo-100/40 pt-3">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">
                            {language === 'it' ? "Diagnostica Reale / Comandi Consigliati" : "Field Diagnostics / CLI Commands"}
                          </span>
                          <div className="space-y-2">
                            {TUTOR_CORNER[selectedLayerId].commands.map((cmd, i) => (
                              <div key={i} className="space-y-1">
                                <span className="text-[9px] text-slate-500 font-semibold block">{cmd.description}</span>
                                <div className="p-2.5 bg-slate-900 border border-slate-950 rounded-xl text-indigo-300 font-mono text-[10px] select-all break-all shadow-md">
                                  {cmd.code}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </section>
                    )}
                  </motion.div>
                )}

                {detailTab === 'attacks' && (
                  <motion.div
                    key="attacks"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="p-5 space-y-3"
                  >
                    {!hasSimulated ? (
                      <div className="text-center py-12 flex flex-col items-center gap-4 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
                        <Box className="w-8 h-8 text-slate-200" />
                        <div className="space-y-1 px-6">
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Modulo_Bloccato</p>
                           <p className="text-[10px] text-slate-400 leading-relaxed italic">
                             {language === 'it' 
                               ? 'Esegui una simulazione per identificare le minacce specifiche a questo livello.' 
                               : 'Run a simulation to identify specific threats at this layer.'}
                           </p>
                        </div>
                      </div>
                    ) : attacksForView.length === 0 ? (
                      <div className="text-center py-12 flex flex-col items-center gap-4 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
                        <ShieldCheck className="w-8 h-8 text-emerald-200" />
                        <div className="space-y-1 px-6">
                           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Nessuna Minaccia Attiva</p>
                           <p className="text-[10px] text-slate-400 leading-relaxed italic">
                             {language === 'it' 
                               ? 'L\'attacco selezionato non colpisce questo livello direttamente.' 
                               : 'The selected attack does not target this layer directly.'}
                           </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <Skull className="w-3.5 h-3.5 text-red-400" />
                          <p className="text-[9px] text-slate-500">
                            {language === 'it'
                              ? 'Analisi della minaccia rilevata durante la simulazione.'
                              : 'Analysis of the threat detected during simulation.'}
                          </p>
                        </div>
                        {attacksForView.map(attack => (
                          <Fragment key={attack.name}>
                            <AttackCard attack={attack} />
                          </Fragment>
                        ))}
                      </>
                    )}
                  </motion.div>
                )}

                {detailTab === 'defenses' && (
                  <motion.div
                    key="defenses"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="p-5 space-y-3"
                  >
                    {!hasSimulated ? (
                      <div className="text-center py-12 flex flex-col items-center gap-4 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
                        <Box className="w-8 h-8 text-slate-200" />
                        <div className="space-y-1 px-6">
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Modulo_Bloccato</p>
                           <p className="text-[10px] text-slate-400 leading-relaxed italic">
                             {language === 'it' 
                               ? 'Esegui una simulazione per scoprire le contromisure appropriate.' 
                               : 'Run a simulation to discover appropriate countermeasures.'}
                           </p>
                        </div>
                      </div>
                    ) : defensesForView.length === 0 ? (
                      <div className="text-center py-12 flex flex-col items-center gap-4 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
                        <Box className="w-8 h-8 text-slate-200" />
                        <div className="space-y-1 px-6">
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nessuna Difesa Rilevante</p>
                           <p className="text-[10px] text-slate-400 leading-relaxed italic">
                             {language === 'it' 
                               ? 'Non ci sono difese attive necessarie per l\'attuale scenario su questo livello.' 
                               : 'No active defenses required for the current scenario at this layer.'}
                           </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                          <p className="text-[9px] text-slate-500">
                            {language === 'it'
                              ? 'Meccanismi di protezione che hanno mitigato o potrebbero mitigare l\'attacco.'
                              : 'Protection mechanisms that mitigated or could mitigate the attack.'}
                          </p>
                        </div>
                        {defensesForView.map(defense => (
                          <Fragment key={defense.name}>
                            <DefenseCard defense={defense} />
                          </Fragment>
                        ))}
                      </>
                    )}
                  </motion.div>
                )}
                {detailTab === 'security' && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="p-5 space-y-6"
                  >
                    {!hasSimulated ? (
                      <div className="text-center py-12 flex flex-col items-center gap-4 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
                        <Search className="w-8 h-8 text-slate-200" />
                        <div className="space-y-1 px-6">
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Analisi Disattiva</p>
                           <p className="text-[10px] text-slate-400 leading-relaxed italic">
                             {language === 'it' 
                               ? 'Attiva una simulazione per analizzare la vulnerabilità di questo livello.' 
                               : 'Activate a simulation to analyze the vulnerability of this layer.'}
                           </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <section className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative">
                          <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Zap className="w-20 h-20" />
                          </div>
                          <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Expert_Technical_Insight</h4>
                          
                          <div className="space-y-4 relative z-10">
                            <div>
                               <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Vulnerability Vector</span>
                               <p className="text-xs font-mono text-blue-100">
                                 {selectedLayerId === 7 ? 'APP_LOGIC_EXPLOIT' : 
                                  selectedLayerId === 4 ? 'PROTOCOL_HANDSHAKE_SATURATION' :
                                  selectedLayerId === 3 ? 'ROUTING_TABLE_CORRUPTION' :
                                  'UNAUTHENTICATED_CHANNEL_ACCESS'}
                               </p>
                            </div>
                            
                            <div className="h-px bg-white/10" />
                            
                            <div>
                               <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Recommended Controls</span>
                               <ul className="space-y-2">
                                 {[
                                   language === 'en' ? 'Implement strict input validation' : 'Implementa validazione input severa',
                                   language === 'en' ? 'Rotate session keys frequently' : 'Ruota le chiavi di sessione frequentemente',
                                   language === 'en' ? 'Enforce mutual TLS (mTLS)' : 'Applica mutual TLS (mTLS)'
                                 ].map((item, i) => (
                                   <li key={i} className="flex items-center gap-2 text-[10px] text-slate-300">
                                     <div className="w-1 h-1 bg-blue-500 rounded-full" />
                                     {item}
                                   </li>
                                 ))}
                               </ul>
                            </div>
                          </div>
                        </section>

                        <section className="space-y-4">
                           <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hardening Roadmap</h4>
                           <div className="grid gap-3">
                              <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                                 <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest block mb-1">Short Term</span>
                                 <p className="text-[10px] text-slate-600">
                                   {language === 'en' 
                                     ? 'Configure IDS signatures for common attack patterns at this layer.' 
                                     : 'Configura le firme IDS per i pattern di attacco comuni a questo livello.'}
                                 </p>
                              </div>
                              <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                                 <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest block mb-1">Infrastructure</span>
                                 <p className="text-[10px] text-slate-600">
                                   {language === 'en' 
                                     ? 'Migrate to automated orchestration with Zero Trust network policies.' 
                                     : 'Migra verso un\'orchestrazione automatizzata con policy di rete Zero Trust.'}
                                 </p>
                              </div>
                           </div>
                        </section>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

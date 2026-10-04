export const SCENARIO_FEEDBACK: Record<string, {
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
      it: 'ARP POISONING RIUSCITO: L\'attaccante ha avvelenato la cache ARP degli host (e del gateway), non la CAM table dello switch. Il traffico locale viene ricanalizzato attraverso l\'host malevolo.',
      en: 'ARP POISONING SUCCESSFUL: The attacker poisoned the ARP cache of the hosts (and of the gateway) — not the switch CAM table. Local traffic is rerouted through the fraudulent host.'
    },
    defense: {
      it: 'CONTROMISURA DAI: Dynamic ARP Inspection (DAI) sullo switch ha scartato i messaggi ARP gratuitous fasulli e non autorizzati.',
      en: 'DAI MITIGATION: Dynamic ARP Inspection (DAI) on the switch dropped unauthorized gratuitous ARP replies.'
    }
  },
  'l2-mac-flood': {
    attack: {
      it: 'MAC FLOODING RIUSCITO: La CAM table dello switch è satura. Lo switch entra in fail-open ed esegue il flooding dei frame unknown-unicast su tutte le porte della VLAN.',
      en: 'MAC FLOODING SUCCESSFUL: The switch CAM table is filled to capacity. The switch fails open and floods unknown-unicast frames to every port in the VLAN.'
    },
    defense: {
      it: 'PORT SECURITY ATTIVA: Lo switch limita i MAC address consentiti per porta e blocca l\'interfaccia violata che inviava richieste massive.',
      en: 'PORT SECURITY ENGAGED: The switch limits maximum allowed MACs per interface and disables the leaking port immediately.'
    }
  },
  'l2-dhcp-starve': {
    attack: {
      it: 'DHCP STARVATION RIUSCITO: Tutte le allocazioni di indirizzi IP nel pool DHCP sono esaurite. Ai nuovi client legittimi viene rifiutata la connessione.',
      en: 'DHCP STARVATION SUCCESSFUL: All DHCP pool leases have been exhausted. Legitimate new clients cannot obtain an IP address.'
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
      it: 'ICMP SMURF RIUSCITO: Attacco amplificato tramite richiesta ICMP echo broadcast. L\'obiettivo è sommerso da risposte Echo-Reply non richieste.',
      en: 'ICMP SMURF SUCCESSFUL: Reflection attack enabled using broadcast ICMP echo requests. The target is flooded with replies.'
    },
    defense: {
      it: 'FILTRAGGIO BROADCAST: I router di confine ignorano e bloccano l\'instradamento dei pacchetti ICMP broadcast diretti all\'intera sottorete.',
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
      en: 'SYN COOKIES ACTIVE: The server validates authentic handshakes cryptographically in the final ACK without allocating buffer queues upfront.'
    }
  },
  'l4-udp-flood': {
    attack: {
      it: 'UDP FLOOD RIUSCITO: La tempesta di pacchetti UDP inviati a porte casuali esaurisce la CPU nell\'invio di ricorsivi ICMP Port Unreachable.',
      en: 'UDP FLOOD SUCCESSFUL: A massive volume of UDP packets to random ports exhausted CPU capacity generating ICMP Unreachable replies.'
    },
    defense: {
      it: 'RATE-LIMITING INTERFACCIA: Regole firewall Anycast scartano la raffica anomala di flussi UDP mantenendo inalterata la stabilità di rete.',
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
      en: 'SESSION HIJACKING SUCCESSFUL: The attacker hijacked or cloned an authentic active TCP session ID, taking direct command of the channel.'
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
      it: 'CRITTOGRAFIA AUTENTICATA: L\'adozione di modalità cifrate AEAD come AES-GCM impedisce la manipolazione del padding lanciando eccezioni generiche identiche.',
      en: 'AUTHENTICATED ENCRYPTION: AES-GCM/AEAD mode validates message integrity, throwing uniform errors to deny padding analysis.'
    }
  },
  'l7-injection': {
    attack: {
      it: 'SQL INJECTION RIUSCITO: Frammenti di codice SQL dannoso inseriti negli input hanno alterato la query originale, svelando informazioni protette.',
      en: 'SQL INJECTION SUCCESSFUL: Unescaped SQL statements manipulated the compile tree, circumventing login or leaking information.'
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
      en: 'CSP FILTERING ENGAGED: A robust Content Security Policy (CSP) and output-encoding block any unsanctioned script executions.'
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
      it: 'SLOWLORIS RIUSCITO: Il web server ha terminato i socket disponibili a causa di connessioni mantenute fittiziamente aperte con intestazioni HTTP parziali.',
      en: 'SLOWLORIS SUCCESSFUL: The application pool is exhausted as the attacker slowly feeds HTTP headers to prevent sessions from closing.'
    },
    defense: {
      it: 'TIMEOUT INTESTAZIONI EXPIRED: Il web server chiude istantaneamente i canali che non completano l\'invio delle intestazioni entro intervalli brevi prestabiliti.',
      en: 'STALL TIMEOUT ACTIVATED: Web server configurations prune stalling connections that fail to deliver key content on schedule.'
    }
  },
  'l4-tcp-reset': {
    attack: {
      it: 'TCP RESET RIUSCITO: Un pacchetto RST con indirizzo e numero di sequenza forgiati ha forzato la chiusura immediata della connessione di rete.',
      en: 'TCP RESET SUCCESSFUL: A spoofed RST packet matching the active sequence parameters triggered an abrupt socket closure.'
    },
    defense: {
      it: 'CIFRATURA DI INTESTAZIONE: TLS blocca i tentativi degli intercettatori passivi di leggere i numeri di sequenza, rendendo impossibile forgiare l\'attacco.',
      en: 'TCP SEQUENCE ENCRYPTION: TLS sessions prevent passive wiretappers from guessing sequence coordinates, neutralizing reset injections.'
    }
  },
  'l3-pod': {
    attack: {
      it: 'PING OF DEATH RIUSCITO: Pacchetti ICMP sovradimensionati rispetto al limite IP hanno scatenato arresti anomali durante il riassemblaggio software.',
      en: 'PING OF DEATH SUCCESSFUL: Malformed oversized ICMP packets exceeded maximum limits and crashed the target driver memory during reassembly.'
    },
    defense: {
      it: 'FILTRAGGIO DIMENSIONE ICMP: Il router esamina la frammentazione e scarta pacchetti accumulati che superano i 65.535 byte di buffer.',
      en: 'ICMP DIMENSION CHECK: Internal network drivers and firewalls filter and block payloads exceeding the 65,535-byte IP buffer limit.'
    }
  },
  'l3-bgp-hijack': {
    attack: {
      it: 'BGP HIJACKING RIUSCITO: Annunci BGP fasulli hanno modificato il traffico di routing principale di Internet, instradandolo attraverso sistemi controllati.',
      en: 'BGP HIJACKING SUCCESSFUL: Rogue BGP Autonomous System path advertisements redirected global internet traffic core coordinates through fake routers.'
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
      en: 'FTP CLEAR TEXT SNIFFING: Management credentials sent across unencrypted FTP control ports have been recorded in plain text directly.'
    },
    defense: {
      it: 'ENFORCED SFTP/FTPS: L\'host disabilita le porte tradizionali e consente esclusivamente trasferimenti cifrati SSH/TLS proteggendo i dati di controllo.',
      en: 'ENFORCED SFTP/FTPS: Traditional plain ports are barred in favor of encrypted SSH/TLS tunnels, keeping transmission items secure.'
    }
  }
};

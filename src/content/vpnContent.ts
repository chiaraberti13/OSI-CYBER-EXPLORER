// Sources and scope: docs/verify/2026-10-17-i18n10-vpn.md
export const VPN_CONTENT = {
  overview: {
    it: 'Una VPN crea una rete logica privata su un’altra rete; la cifratura dipende dalla tecnologia e dalla configurazione. IPsec offre ESP e AH: AH autentica ma non cifra. DTLS protegge datagrammi e può essere usato da una VPN, ma non definisce da solo una VPN.',
    en: 'A VPN creates a private logical network over another network; encryption depends on technology and configuration. IPsec offers ESP and AH: AH authenticates but does not encrypt. DTLS protects datagrams and can be used by a VPN, but does not define a VPN by itself.'
  },
  diagramNote: {
    it: 'Schema concettuale, non in scala: i blocchi indicano ordine e confini di protezione, non lunghezze. Gli esempi ESP usano IPv4 senza opzioni, cifratura e integrità abilitate; sono omessi IV e incapsulamento NAT-T.',
    en: 'Conceptual diagram, not to scale: blocks show order and protection boundaries, not lengths. ESP examples use IPv4 without options, with encryption and integrity enabled; IV and NAT-T encapsulation are omitted.'
  },
  modes: {
    'vpn-overview': {
      title: {
        it: 'Panoramica VPN',
        en: 'VPN overview'
      },
      description: {
        it: 'Una VPN cifrata protegge il tratto tra i suoi endpoint, non automaticamente il traffico oltre l’uscita né un dispositivo compromesso. Verificare identità dei peer, policy, aggiornamenti, routing e DNS. Un kill switch può limitare fughe di traffico se configurato e verificato; non garantisce la sicurezza.',
        en: 'An encrypted VPN protects the path between its endpoints, not automatically traffic beyond the exit or a compromised device. Verify peer identities, policy, updates, routing and DNS. A kill switch can limit traffic leaks if configured and tested; it does not guarantee security.'
      },
      note: {
        it: 'Esempio prima del tunnel: il payload TCP può già essere protetto da TLS. Non tutti i pacchetti senza VPN contengono dati applicativi in chiaro.',
        en: 'Example before tunneling: the TCP payload may already be protected by TLS. Not every packet outside a VPN contains plaintext application data.'
      },
      blocks: [
        {
          it: 'Header IP visibile',
          en: 'Visible IP header'
        },
        {
          it: 'Header TCP visibile',
          en: 'Visible TCP header'
        },
        {
          it: 'Dati applicativi: protezione dipendente dal protocollo',
          en: 'Application data: protection depends on protocol'
        }
      ]
    },
    'ipsec-tunnel': {
      title: {
        it: 'IPsec: modalità tunnel',
        en: 'IPsec: tunnel mode'
      },
      description: {
        it: 'Con ESP cifrato, il pacchetto IP originale è dentro la parte cifrata; un nuovo header IP instrada tra gli endpoint IPsec. Uso comune: collegamento tra sedi o accesso remoto. Gli indirizzi esterni, dimensioni e tempi restano osservabili: il tunnel non garantisce anonimato.',
        en: 'With encrypted ESP, the original IP packet is inside the encrypted portion; a new IP header routes between IPsec endpoints. Common uses: site-to-site links or remote access. Outer addresses, sizes and timing remain observable: the tunnel does not guarantee anonymity.'
      },
      note: {
        it: 'L’header ESP resta visibile. Il trailer ESP è cifrato insieme ai dati; il tag di integrità è distinto dal trailer. L’integrità ESP non copre il nuovo header IP esterno.',
        en: 'The ESP header remains visible. The ESP trailer is encrypted with the data; the integrity tag is separate from the trailer. ESP integrity does not cover the new outer IP header.'
      },
      blocks: [
        {
          it: 'Nuovo header IP: visibile',
          en: 'New IP header: visible'
        },
        {
          it: 'Header ESP: SPI e sequenza visibili',
          en: 'ESP header: visible SPI and sequence'
        },
        {
          it: 'Cifrato: IP originale, TCP/UDP, dati e trailer ESP',
          en: 'Encrypted: original IP, TCP/UDP, data and ESP trailer'
        },
        {
          it: 'Tag di integrità ESP: non cifrato',
          en: 'ESP integrity tag: not encrypted'
        }
      ]
    },
    'ipsec-transport': {
      title: {
        it: 'IPsec: modalità trasporto',
        en: 'IPsec: transport mode'
      },
      description: {
        it: 'Con ESP cifrato in modalità trasporto, l’header IP originale resta esterno e visibile. Nel semplice esempio IPv4 vengono cifrati il segmento TCP/UDP e il trailer ESP, senza aggiungere un header IP interno. Uso tipico: protezione tra host; selezione e policy dipendono dall’architettura.',
        en: 'With encrypted ESP in transport mode, the original IP header stays outside and visible. In this simple IPv4 example the TCP/UDP segment and ESP trailer are encrypted, without adding an inner IP header. Typical use: host-to-host protection; selection and policy depend on the architecture.'
      },
      note: {
        it: 'L’integrità ESP copre il contenuto ESP previsto dall’algoritmo, non l’header IP esterno. IPv6, estensioni e incapsulamenti aggiuntivi richiedono schemi più dettagliati.',
        en: 'ESP integrity covers the ESP content specified by the algorithm, not the outer IP header. IPv6, extensions and additional encapsulations require more detailed diagrams.'
      },
      blocks: [
        {
          it: 'Header IP originale: visibile',
          en: 'Original IP header: visible'
        },
        {
          it: 'Header ESP: SPI e sequenza visibili',
          en: 'ESP header: visible SPI and sequence'
        },
        {
          it: 'Cifrato: TCP/UDP, dati e trailer ESP',
          en: 'Encrypted: TCP/UDP, data and ESP trailer'
        },
        {
          it: 'Tag di integrità ESP: non cifrato',
          en: 'ESP integrity tag: not encrypted'
        }
      ]
    },
    dtls: {
      title: {
        it: 'DTLS: protezione dei datagrammi',
        en: 'DTLS: datagram protection'
      },
      description: {
        it: 'DTLS adatta la sicurezza di TLS a un trasporto a datagrammi, normalmente UDP. Gestisce perdite e riordino durante l’handshake, ma non rende affidabile né ordinata la consegna dei dati applicativi. Non garantisce velocità massima: prestazioni e latenza dipendono anche da rete, MTU e applicazione.',
        en: 'DTLS adapts TLS security to a datagram transport, normally UDP. It handles loss and reordering during the handshake, but does not make application data delivery reliable or ordered. It does not guarantee maximum speed: performance and latency also depend on the network, MTU and application.'
      },
      note: {
        it: 'Esempio di record applicativo protetto dopo l’handshake. Formato e protezione dell’header DTLS dipendono dalla versione; in DTLS 1.3 parte del numero di sequenza è protetta. L’handshake autentica i peer secondo la configurazione.',
        en: 'Example of a protected application record after the handshake. DTLS header format and protection depend on version; in DTLS 1.3 part of the sequence number is protected. The handshake authenticates peers according to configuration.'
      },
      blocks: [
        {
          it: 'Header IP: visibile',
          en: 'IP header: visible'
        },
        {
          it: 'Header UDP: visibile',
          en: 'UDP header: visible'
        },
        {
          it: 'Header record DTLS: dipende dalla versione',
          en: 'DTLS record header: version-dependent'
        },
        {
          it: 'Dati applicativi cifrati e tag di autenticazione',
          en: 'Encrypted application data and authentication tag'
        }
      ]
    }
  }
} as const;

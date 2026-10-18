// Reviewed against RFC 2865, RFC 2866, RFC 3579, RFC 6614, RFC 8907 and RFC 9887.
export const AAA_CONTENT = {
  overview: {
    it: 'AAA comprende autenticazione, autorizzazione e accounting: identità, permessi e registrazione delle attività. RADIUS è comune per accesso alla rete; TACACS+ per amministrazione degli apparati. Sono impieghi tipici, non esclusivi.',
    en: 'AAA covers authentication, authorization and accounting: identity, permissions and activity records. RADIUS is common for network access; TACACS+ for device administration. These are typical, not exclusive uses.'
  },
  disclaimer: {
    it: 'Traccia didattica: eventi sintetici, nessun pacchetto inviato o catturato. Il dispositivo di accesso applica le decisioni del server.',
    en: 'Illustrative trace: synthetic events, no packets sent or captured. The access device enforces the server decisions.'
  },
  protocols: {
    radius: {
      name: 'RADIUS',
      facts: [
        {
          it: 'Trasporto classico: UDP 1812 per autenticazione e autorizzazione, UDP 1813 per accounting separato.',
          en: 'Classic transport: UDP 1812 for authentication and authorization, UDP 1813 for separate accounting.'
        },
        {
          it: 'Nel metodo PAP, User-Password è offuscato con un segreto condiviso; non è un hash di password trasmesso. Altri attributi possono restare leggibili.',
          en: 'With PAP, User-Password is obfuscated using a shared secret; it is not a transmitted password hash. Other attributes may remain readable.'
        },
        {
          it: 'Access-Accept può includere attributi di autorizzazione. Gli scambi EAP possono richiedere più richieste e non usano User-Password.',
          en: 'Access-Accept can include authorization attributes. EAP exchanges can require multiple requests and do not use User-Password.'
        },
        {
          it: 'Impieghi comuni: accesso Wi-Fi aziendale e accesso remoto. La protezione dipende anche dal metodo di autenticazione e dal trasporto.',
          en: 'Common uses: enterprise Wi-Fi and remote access. Protection also depends on the authentication method and transport.'
        }
      ],
      events: [
        {
          it: 'Esempio legacy PAP: il dispositivo di accesso invia Access-Request via UDP 1812 per lab_user.',
          en: 'Legacy PAP example: the access device sends Access-Request over UDP 1812 for lab_user.'
        },
        {
          it: 'User-Name può essere leggibile; User-Password è offuscato. Non rappresenta una cattura EAP o WPA3.',
          en: 'User-Name may be readable; User-Password is obfuscated. This does not represent an EAP or WPA3 capture.'
        },
        {
          it: 'Il server verifica le credenziali e la policy: qui risponde Access-Accept; potrebbe anche negare accesso.',
          en: 'The server checks credentials and policy: here it returns Access-Accept; it could also deny access.'
        },
        {
          it: 'Il dispositivo applica gli attributi autorizzati; Access-Accept da solo non dimostra connettività operativa.',
          en: 'The device applies authorized attributes; Access-Accept alone does not prove working connectivity.'
        },
        {
          it: 'Se configurato, accounting separato su UDP 1813 registra la sessione. Verificare ricezione e conservazione dei record.',
          en: 'If configured, separate accounting on UDP 1813 records the session. Verify record receipt and retention.'
        }
      ],
      lesson: {
        it: 'L’offuscamento legacy non protegge l’intero messaggio. Valutare RADIUS su TLS (RadSec) o un trasporto protetto compatibile; verificare certificati e policy.',
        en: 'Legacy obfuscation does not protect the whole message. Evaluate RADIUS over TLS (RadSec) or a compatible protected transport; verify certificates and policy.'
      }
    },
    tacacs: {
      name: 'TACACS+',
      facts: [
        {
          it: 'Trasporto legacy: TCP 49. Le ritrasmissioni TCP non garantiscono che un comando sia autorizzato o che un record sia conservato.',
          en: 'Legacy transport: TCP 49. TCP retransmissions do not guarantee that a command is authorized or a record retained.'
        },
        {
          it: 'Il corpo può essere offuscato; l’header resta leggibile. Questo meccanismo legacy non fornisce moderna riservatezza e integrità.',
          en: 'The body can be obfuscated; the header remains readable. This legacy mechanism does not provide modern confidentiality and integrity.'
        },
        {
          it: 'Autenticazione, autorizzazione e accounting sono scambi separati. Il controllo dei singoli comandi richiede configurazione sul dispositivo.',
          en: 'Authentication, authorization and accounting are separate exchanges. Per-command control requires configuration on the device.'
        },
        {
          it: 'Uso tipico: amministrazione di router e switch. Consentire un comando non equivale ad assegnare tutti i privilegi amministrativi.',
          en: 'Typical use: router and switch administration. Allowing one command does not mean granting all administrative privileges.'
        }
      ],
      events: [
        {
          it: 'Esempio legacy: il router di laboratorio apre una connessione TCP 49 al server TACACS+.',
          en: 'Legacy example: the lab router opens a TCP 49 connection to the TACACS+ server.'
        },
        {
          it: 'Autenticazione di lab_user approvata. L’header è leggibile; il corpo offuscato non è un tunnel sicuro.',
          en: 'Authentication of lab_user succeeds. The header is readable; the obfuscated body is not a secure tunnel.'
        },
        {
          it: 'Autorizzazione separata: la policy di esempio consente show version. Il router applica la decisione.',
          en: 'Separate authorization: the example policy allows show version. The router enforces the decision.'
        },
        {
          it: 'La stessa policy nega reload. Questo esito dipende dal controllo dei comandi configurato, non dal solo protocollo.',
          en: 'The same policy denies reload. This outcome depends on configured command control, not the protocol alone.'
        },
        {
          it: 'Accounting invia il record se abilitato. Verificare consegna, conservazione e comportamento in caso di server indisponibile.',
          en: 'Accounting sends the record if enabled. Verify delivery, retention and behavior when the server is unavailable.'
        }
      ],
      lesson: {
        it: 'Proteggere il canale di amministrazione. TACACS+ su TLS 1.3 è definito da RFC 9887: richiede supporto e configurazione dedicati, non è implicito in TCP 49.',
        en: 'Protect the administration channel. TACACS+ over TLS 1.3 is defined by RFC 9887: it requires dedicated support and configuration, and is not implicit in TCP 49.'
      }
    }
  }
} as const;

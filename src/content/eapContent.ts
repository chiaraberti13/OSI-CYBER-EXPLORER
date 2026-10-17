// Sources and review scope: docs/verify/2026-10-17-i18n10-eap.md
export const EAP_CONTENT = {
  overview: {
    it: 'EAP è un framework di autenticazione, non un singolo metodo né un tunnel per il traffico applicativo. In una rete 802.1X con server remoto, il client (supplicant) scambia EAP su EAPOL con lo switch o access point (authenticator), che inoltra i messaggi al server tramite RADIUS.',
    en: 'EAP is an authentication framework, not a single method or a tunnel for application traffic. In an 802.1X network with a remote server, the client (supplicant) exchanges EAP over EAPOL with the switch or access point (authenticator), which forwards messages to the server through RADIUS.'
  },
  flowNote: {
    it: 'Sequenza concettuale, non una cattura: i passaggi intermedi e le ritrasmissioni sono omessi. L’esito di autenticazione non dimostra da solo connettività: il dispositivo deve applicare la policy e completare gli eventuali scambi di chiavi del collegamento.',
    en: 'Conceptual sequence, not a capture: intermediate steps and retransmissions are omitted. Authentication success alone does not prove connectivity: the device must enforce policy and complete any link key exchanges.'
  },
  methods: {
    tls: {
      name: 'EAP-TLS',
      label: {
        it: 'Certificati client e server',
        en: 'Client and server certificates'
      },
      description: {
        it: 'Autenticazione reciproca basata su certificati, senza password riutilizzabili nello scambio. Verificare catena di fiducia, identità attesa del server, validità e gestione della revoca; proteggere le chiavi private. La sola presenza di un certificato non basta.',
        en: 'Certificate-based mutual authentication, without reusable passwords in the exchange. Verify the trust chain, expected server identity, validity and revocation handling; protect private keys. Merely having a certificate is insufficient.'
      },
      steps: [
        {
          it: 'Il client avvia o risponde allo scambio EAP; il dispositivo inoltra i messaggi al server.',
          en: 'The client initiates or responds to the EAP exchange; the device forwards messages to the server.'
        },
        {
          it: 'Client e server completano TLS, verificando certificati e possesso delle rispettive chiavi private.',
          en: 'Client and server complete TLS, verifying certificates and possession of their respective private keys.'
        },
        {
          it: 'Dopo autenticazione riuscita, il materiale di chiave e la policy consentono i successivi controlli di accesso.',
          en: 'After successful authentication, keying material and policy support subsequent access controls.'
        }
      ]
    },
    peap: {
      name: 'PEAP',
      label: {
        it: 'Tunnel e metodo interno',
        en: 'Tunnel and inner method'
      },
      description: {
        it: 'PEAP protegge un metodo EAP interno con TLS. Nel comune profilo EAP-MSCHAPv2 il server usa un certificato e il client una risposta challenge-response basata sulla password: non invia semplicemente user/password. Validare server e autorità attendibili prima di procedere.',
        en: 'PEAP protects an inner EAP method with TLS. In the common EAP-MSCHAPv2 profile the server uses a certificate and the client a password-based challenge-response: it does not simply send user/password. Validate the server and trusted authorities before proceeding.'
      },
      steps: [
        {
          it: 'Il client verifica identità e certificato del server durante la creazione del tunnel TLS.',
          en: 'The client checks the server identity and certificate while establishing the TLS tunnel.'
        },
        {
          it: 'Nel tunnel si esegue il metodo EAP interno concordato; qui EAP-MSCHAPv2, non una password in chiaro.',
          en: 'The agreed inner EAP method runs inside the tunnel; here EAP-MSCHAPv2, not a plaintext password.'
        },
        {
          it: 'Il server valuta il risultato e la policy. Se la validazione del server fallisce, interrompere senza accettare certificati sconosciuti.',
          en: 'The server evaluates the result and policy. If server validation fails, stop without accepting unknown certificates.'
        }
      ]
    },
    ttls: {
      name: 'EAP-TTLS',
      label: {
        it: 'Autenticazione interna flessibile',
        en: 'Flexible inner authentication'
      },
      description: {
        it: 'EAP-TTLS stabilisce un tunnel TLS autenticando il server; l’autenticazione interna può usare EAP o metodi come PAP. Il certificato client non è obbligatorio in tutti i profili. Il tunnel non rende sicura una configurazione che omette la validazione del server.',
        en: 'EAP-TTLS establishes a TLS tunnel that authenticates the server; inner authentication can use EAP or methods such as PAP. A client certificate is not mandatory in every profile. The tunnel does not secure a configuration that skips server validation.'
      },
      steps: [
        {
          it: 'Il client valida certificato e identità del server prima della fase interna.',
          en: 'The client validates the server certificate and identity before the inner phase.'
        },
        {
          it: 'Il metodo configurato viene eseguito dentro TLS. Con PAP la password è disponibile al server che termina il tunnel.',
          en: 'The configured method runs inside TLS. With PAP the password is available to the server terminating the tunnel.'
        },
        {
          it: 'Il server verifica le credenziali e restituisce un esito; proteggere anche credenziali e collegamenti successivi al server.',
          en: 'The server verifies credentials and returns a result; also protect credentials and onward server connections.'
        }
      ]
    },
    fast: {
      name: 'EAP-FAST',
      label: {
        it: 'Provisioning e tunnel protetto',
        en: 'Provisioning and protected tunnel'
      },
      description: {
        it: 'EAP-FAST può usare una PAC (Protected Access Credential) per stabilire il tunnel TLS, seguita da autenticazione interna. La distribuzione della PAC richiede un processo fidato; alcune modalità di provisioning usano certificati. Non implica accesso istantaneo né assenza universale di certificati.',
        en: 'EAP-FAST can use a PAC (Protected Access Credential) to establish the TLS tunnel, followed by inner authentication. PAC distribution requires a trusted process; some provisioning modes use certificates. It implies neither instant access nor universal absence of certificates.'
      },
      steps: [
        {
          it: 'Se necessaria, la PAC viene distribuita tramite una procedura autorizzata e protetta.',
          en: 'If needed, the PAC is distributed through an authorized and protected procedure.'
        },
        {
          it: 'Client e server stabiliscono il tunnel TLS con la modalità configurata.',
          en: 'Client and server establish the TLS tunnel using the configured mode.'
        },
        {
          it: 'Autenticazione interna e legame crittografico con il tunnel precedono la decisione di accesso. Gestire scadenza e rinnovo della PAC.',
          en: 'Inner authentication and cryptographic binding to the tunnel precede the access decision. Manage PAC expiration and renewal.'
        }
      ]
    },
    md5: {
      name: 'EAP-MD5',
      label: {
        it: 'Legacy: limiti di sicurezza',
        en: 'Legacy: security limitations'
      },
      description: {
        it: 'EAP-MD5 usa challenge-response: la risposta dipende da identificatore, segreto e challenge, non è l’hash statico della password. Non fornisce autenticazione reciproca né materiale di chiave. Le catture possono consentire tentativi offline a dizionario: non è adatto agli impieghi wireless che richiedono tali proprietà.',
        en: 'EAP-MD5 uses challenge-response: the response depends on identifier, secret and challenge, not a static password hash. It provides neither mutual authentication nor keying material. Captures can enable offline dictionary guessing: it is unsuitable for wireless uses requiring those properties.'
      },
      steps: [
        {
          it: 'Il server invia un challenge; non viene creato un tunnel TLS dal metodo.',
          en: 'The server sends a challenge; the method does not create a TLS tunnel.'
        },
        {
          it: 'Il client calcola e restituisce una risposta MD5 legata al challenge e al segreto.',
          en: 'The client computes and returns an MD5 response tied to the challenge and secret.'
        },
        {
          it: 'Il server verifica la risposta, ma il client non ottiene autenticazione del server né chiavi per proteggere il collegamento.',
          en: 'The server verifies the response, but the client obtains neither server authentication nor keys to protect the link.'
        }
      ]
    }
  }
} as const;

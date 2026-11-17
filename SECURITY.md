# Security Policy

<p align="center"><a href="#english">🇬🇧 English</a> · <a href="#italiano">🇮🇹 Italiano</a></p>

## English

### Supported versions

Security fixes target the latest revision on the default branch unless a release is explicitly documented as supported.

### Scope

The client-side React application, educational datasets, routing/state logic, attack-defense content, build pipeline, deployment configuration and dependency supply chain.

### Reporting

Do not open a public issue for an unpatched vulnerability. Use GitHub private vulnerability reporting / Security Advisories when available. Include the affected commit/version, impact, minimal reproducible proof, environment assumptions and possible mitigations. Remove unrelated sensitive data.

### Responsible testing

Test only systems, data, devices and networks you own or are explicitly authorized to assess. No denial of service, destructive actions, persistence, social engineering, unauthorized interception or third-party access.

### Security requirements

Keep secrets outside source control; validate untrusted input; preserve authorization/scope checks; review dependency and CI changes; prefer reproducible builds; never present partial or unverified evidence as a confirmed fact. Do not introduce copy-pasteable attack targets, active exploit payloads or public IP/domain examples that bypass the repository's documentation-target controls.

### Disclosure

Allow reasonable remediation time and coordinate publication of exploit-enabling details.

## Italiano

### Versioni supportate

Le correzioni riguardano la revisione più recente del branch predefinito, salvo release esplicitamente supportate.

### Ambito

The client-side React application, educational datasets, routing/state logic, attack-defense content, build pipeline, deployment configuration and dependency supply chain.

### Segnalazione

Non aprire issue pubbliche per vulnerabilità non corrette. Usa la segnalazione privata / Security Advisories quando disponibile. Indica commit/versione, impatto, PoC minimo riproducibile, assunzioni ambientali e mitigazioni, eliminando dati sensibili non necessari.

### Test responsabili

Esegui test solo su sistemi, dati, dispositivi e reti propri o esplicitamente autorizzati. Sono esclusi DoS, azioni distruttive, persistenza, social engineering, intercettazioni non autorizzate e accessi a terzi.

### Requisiti di sicurezza

Mantieni i segreti fuori dal repository; valida gli input; conserva i controlli di autorizzazione/scope; controlla dipendenze e CI; preferisci build riproducibili; non presentare evidenze parziali o non verificate come fatti confermati. Do not introduce copy-pasteable attack targets, active exploit payloads or public IP/domain examples that bypass the repository's documentation-target controls.

### Divulgazione

Concedi tempo ragionevole per la correzione e coordina la pubblicazione di dettagli sfruttabili.

## Percorso operativo di segnalazione

1. Consulta [la sezione sicurezza del repository](https://github.com/chiaraberti13/OSI-CYBER-EXPLORER/security) e usa la funzione di segnalazione privata se disponibile. La presenza di questo documento non implica che tale funzione sia abilitata.
2. Se la funzione non è disponibile, usa un canale privato già verificato con la manutentrice. In assenza di un contatto, chiedi soltanto l'attivazione di un canale riservato in una issue, senza dettagli tecnici, nomi di soggetti coinvolti o allegati sensibili. Se le issue sono disabilitate, usa un contatto verificato già disponibile; attendi un canale riservato prima di condividere dettagli.
3. Nel canale riservato indica versione o commit, componente, impatto, prerequisiti, riproduzione minima con dati sintetici ed eventuale mitigazione.
4. Concorda la pubblicazione dei dettagli dopo la valutazione e la correzione. Restano valide le eventuali tempistiche specifiche già indicate sopra; questa integrazione non introduce nuove garanzie sui tempi.

I bug ordinari e le richieste di accessibilità possono usare i modelli delle issue. Non allegare credenziali, dati di produzione o dati personali, neppure ai report tecnici quando non necessari.

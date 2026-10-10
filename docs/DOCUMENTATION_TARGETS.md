# Target di documentazione / Documentation targets

Gli esempi copiabili e le simulazioni di OSI Cyber Explorer non devono inviare traffico verso sistemi reali di terzi. Indirizzi, nomi host e identità usati a scopo didattico devono appartenere a spazi riservati, locali o privati.

Copyable examples and OSI Cyber Explorer simulations must not send traffic to real third-party systems. Addresses, hostnames, and identities used for teaching must belong to reserved, local, or private spaces.

## Spazi ammessi / Allowed spaces

| Tipo / Type | Spazio / Space | Uso / Use |
|---|---|---|
| IPv4 documentazione | `192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24` | Host Internet, NAT, peer e servizi simulati / Simulated Internet hosts, NAT, peers, and services |
| IPv6 documentazione | `2001:db8::/32` | Host e prefissi IPv6 simulati / Simulated IPv6 hosts and prefixes |
| Domini | `example.com`, `example.org`, `example.net`, `.example.test`, `.test` | DNS, HTTP, email e nomi di laboratorio / DNS, HTTP, email, and lab names |
| Ambiti non pubblici | RFC 1918, loopback, link-local, unique-local e `localhost` | Topologie locali / Local topologies |
| Protocolli | multicast, unspecified, broadcast, subnet mask, wildcard e prefissi well-known | Spiegazione del protocollo, non destinazioni di terzi / Protocol explanation, not third-party destinations |

## Eccezioni contestuali / Contextual exceptions

Il registro `docs/documentation-target-allowlist.json` contiene solo eccezioni legate a un file e a uno scopo verificabile:

- router-ID OSPF convenzionali `1.1.1.1`–`5.5.5.5`, usati come identificatori e non come destinazioni;
- `learningnetwork.cisco.com` e `learningcontent.cisco.com`, citati come fonti ufficiali del programma e del blueprint CCNA;
- `datatracker.ietf.org`, `standards.ieee.org`, `csrc.nist.gov`, `attack.mitre.org` e `www.cisco.com`, autorità ufficiali usate esclusivamente dal resolver delle citazioni strutturate;
- `images.unsplash.com`, dipendenza immagine già governata dalla CSP e tracciata separatamente da UX-11.

The `docs/documentation-target-allowlist.json` registry contains only file-bound exceptions with a verifiable purpose:

- conventional OSPF router IDs `1.1.1.1`–`5.5.5.5`, used as identifiers rather than destinations;
- `learningnetwork.cisco.com` and `learningcontent.cisco.com`, cited as official CCNA curriculum and blueprint sources;
- `datatracker.ietf.org`, `standards.ieee.org`, `csrc.nist.gov`, `attack.mitre.org`, and `www.cisco.com`, official authorities used only by the structured-citation resolver;
- `images.unsplash.com`, an image dependency already governed by CSP and tracked separately by UX-11.

Le eccezioni non autorizzano comandi, scansioni o test contro quei sistemi. Una nuova eccezione richiede motivazione, file esatto, revisione CODEOWNER e aggiornamento di questo documento.

Exceptions do not authorise commands, scans, or testing against those systems. A new exception requires a rationale, an exact file, CODEOWNER review, and an update to this document.

## Verifica / Verification

`npm run verify:documentation-targets` analizza tutti i file TypeScript di produzione sotto `src`, escludendo solo test e specifiche. Il controllo fallisce su:

- IPv4 pubblici fuori dai blocchi di documentazione e dalle eccezioni contestuali;
- IPv6 globali fuori da `2001:db8::/32` e dai prefissi di protocollo esplicitamente ammessi;
- domini pubblici inseriti nelle stringhe dell'applicazione fuori dai suffissi riservati e dalle dipendenze contestuali;
- eccezioni duplicate, incomplete o riferite a file inesistenti.

`npm run verify:documentation-targets` scans every production TypeScript file under `src`, excluding only tests and specifications. It fails on:

- public IPv4 addresses outside documentation blocks and contextual exceptions;
- global IPv6 addresses outside `2001:db8::/32` and explicitly allowed protocol prefixes;
- public domains embedded in application strings outside reserved suffixes and contextual dependencies;
- duplicate, incomplete, or missing-file exceptions.

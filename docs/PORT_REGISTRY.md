# Registry delle porte / Port registry

La registry didattica mostrata da OSI Cyber Explorer è un sottoinsieme verificato del [Service Name and Transport Protocol Port Number Registry di IANA](https://www.iana.org/assignments/service-names-port-numbers/). Il dataset IANA consultato risulta aggiornato al **28 settembre 2026**; la verifica del progetto è stata eseguita il **30 settembre 2026**.

The teaching registry shown by OSI Cyber Explorer is a verified subset of the [IANA Service Name and Transport Protocol Port Number Registry](https://www.iana.org/assignments/service-names-port-numbers/). The consulted IANA dataset was last updated on **28 September 2026**; the project verification was performed on **30 September 2026**.

## Modello / Model

Ogni scheda registra:

- numero o coppia di porte e protocolli di trasporto effettivamente descritti dalla scheda;
- classe RFC 6335: System/Well-Known `0–1023`, User/Registered `1024–49151`, Dynamic/Private `49152–65535`;
- stato `assigned`, `reserved`, `unassigned` o `de-facto`;
- nomi di servizio presenti nel registry IANA;
- alternativa cifrata, se ne esiste una diretta o operativamente equivalente;
- data di verifica e nota bilingue obbligatoria quando uso comune e assegnazione IANA non coincidono.

Each card records:

- the port number or pair and the transport protocols actually represented by the card;
- its RFC 6335 class: System/Well-Known `0–1023`, User/Registered `1024–49151`, or Dynamic/Private `49152–65535`;
- `assigned`, `reserved`, `unassigned`, or `de-facto` status;
- the service names present in the IANA registry;
- an encrypted alternative when a direct or operationally equivalent option exists;
- the verification date and a mandatory bilingual note whenever common use differs from the IANA assignment.

## Ambiguità esplicite / Explicit ambiguities

| Porta / Port | Uso mostrato / Displayed use | Stato e motivo / Status and rationale |
|---|---|---|
| TCP 465 | Message Submission over TLS | Assegnata, ma con più nomi IANA (`submissions`, `urd`); la UI dichiara quale significato usa. / Assigned with multiple IANA names; the UI states which meaning it uses. |
| TCP 1521 | Oracle Database | De facto: IANA assegna `ncube-lm` e registra l’uso non autorizzato della porta 1521. / De facto: IANA assigns `ncube-lm` and records unauthorized use of port 1521. |
| UDP 1645/1646 | RADIUS legacy | De facto: IANA assegna rispettivamente `sightline` e `sa-msg-port`; per nuovi deployment si usano 1812/1813. / De facto: IANA assigns `sightline` and `sa-msg-port`; new deployments use 1812/1813. |
| TCP 3000 | Vite / development server | De facto: IANA registra `hbci` e l’uso diffuso `remoteware-cl`. / De facto: IANA registers `hbci` and widespread `remoteware-cl` use. |
| TCP 8080 | HTTP Alternate | Assegnata a `http-alt`: non viene più descritta come semplice convenzione non registrata. / Assigned to `http-alt`: it is no longer described as merely an unregistered convention. |

## Verifica automatica / Automated verification

`src/content/portRegistry.test.ts` applica le regole della [RFC 6335 §6](https://www.rfc-editor.org/rfc/rfc6335#section-6) e blocca:

- coppie porta/protocollo duplicate;
- numeri fuori dall’intervallo `0–65535`;
- classi numeriche incoerenti;
- voci non assegnate o de facto prive di spiegazione;
- alternative cifrate con numeri di porta invalidi;
- rimozione accidentale delle date di origine e verifica.

`src/content/portRegistry.test.ts` applies the rules from [RFC 6335 §6](https://www.rfc-editor.org/rfc/rfc6335#section-6) and rejects duplicate port/protocol pairs, out-of-range numbers, inconsistent numeric classes, unexplained non-assigned or de-facto entries, invalid encrypted alternatives, and missing source or verification dates.

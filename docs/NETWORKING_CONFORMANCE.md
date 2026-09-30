# Conformità dell'indirizzamento / Addressing conformance

I test normativi in `src/lib/networkingConformance.test.ts` collegano ogni comportamento di indirizzamento alla sezione che lo definisce. Le fonti e i registry sono stati verificati il **30 settembre 2026**.

The normative tests in `src/lib/networkingConformance.test.ts` link each addressing behaviour to the section that defines it. Sources and registries were checked on **30 September 2026**.

| Funzione / Function | Comportamento / Behaviour | Fonte normativa / Normative source |
|---|---|---|
| `addressKind` | Classificazione degli spazi IPv4 special-purpose | [IANA IPv4 Special-Purpose Address Registry](https://www.iana.org/assignments/iana-ipv4-special-registry/), [RFC 6890 §2.2.2](https://www.rfc-editor.org/rfc/rfc6890#section-2.2.2) |
| `classifyIpv6` | Classificazione degli spazi IPv6 special-purpose, inclusi `64:ff9b:1::/48` e `3fff::/20` | [IANA IPv6 Special-Purpose Address Registry](https://www.iana.org/assignments/iana-ipv6-special-registry/), [RFC 6890 §2.2.3](https://www.rfc-editor.org/rfc/rfc6890#section-2.2.3) |
| `calculateIpv4Subnet` | Entrambi gli indirizzi di una `/31` sono host e non esiste directed broadcast | [RFC 3021 §2.1 e §2.2.1](https://www.rfc-editor.org/rfc/rfc3021#section-2.1) |
| `compressIpv6`, `inspectIpv6` | Zeri iniziali rimossi, sequenza di zeri più lunga e più a sinistra, nessuna compressione di un solo gruppo, lettere minuscole | [RFC 5952 §4.1–4.3](https://www.rfc-editor.org/rfc/rfc5952#section-4) |
| `macToModifiedEui64` | Inserimento `ff:fe` e inversione del bit universal/local | [RFC 4291 §2.5.1 e appendice A](https://www.rfc-editor.org/rfc/rfc4291#appendix-A) |
| `ipv4ToUint`, `uintToIpv4` | Round trip senza perdita sui 32 bit dell'indirizzo IPv4 | [RFC 791 §3.2](https://www.rfc-editor.org/rfc/rfc791#section-3.2) |
| `expandIpv6`, `compressIpv6` | Round trip senza perdita sugli otto gruppi da 16 bit | [RFC 4291 §2.2](https://www.rfc-editor.org/rfc/rfc4291#section-2.2) |

Le proprietà sono generate con `fast-check` usando seed fissi e 1.000 casi per proprietà. Lo stesso motore genera i 250 documenti JSON del corpus fuzz di SEC-02; in questo modo ogni fallimento resta riproducibile e viene ridotto automaticamente al controesempio minimo.

Properties are generated with `fast-check` using fixed seeds and 1,000 cases per property. The same engine generates the 250 JSON documents in SEC-02's fuzz corpus, keeping failures reproducible and automatically shrinking them to a minimal counterexample.

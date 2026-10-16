# I18N-10 — Revisione dei laboratori interattivi e guard strutturale

16 ottobre 2026. Baseline `main`:
`a80a0fc53d01e04b51168f3690b3b73d83d4e831`. Checkout iniziale pulito, remoto
allineato, nessun lavoro concorrente nuovo. Avviata l'applicazione (build) ed
eseguita l'intera pipeline `npm run verify` più la suite E2E in baseline: tutto
verde. L'unico punto aperto è il task ricorrente I18N-10.

## Analisi e revisione di contenuto

Questa ricognizione ha completato la **revisione di accuratezza/naturalezza** dei
cinque dataset che reggono i laboratori interattivi, letti integralmente
(~2300 righe) con prospettiva Network Engineer + Cybersecurity Specialist +
Revisore IT/EN:

| Dataset                      | Ambito                                                                                     | Esito revisione         |
| ---------------------------- | ------------------------------------------------------------------------------------------ | ----------------------- |
| `ipConnectivityLab.ts`       | OSPF (stati, costo, DR/BDR), FHRP HSRP/VRRP, routing, uRPF/BCP 38, output `show ip route`  | Corretto, parità pulita |
| `securityFundamentalsLab.ts` | ACL, AAA (TACACS+/RADIUS), matrice WLAN WEP→WPA3, VPN/IKEv2, PKI, hardening IOS            | Corretto, parità pulita |
| `ipServicesLab.ts`           | DHCP DORA + timer T1/T2, record DNS, DoT/DoH, SNMPv3, QoS, NAT/PAT                         | Corretto, parità pulita |
| `networkAccessLab.ts`        | VLAN hopping, STP/RSTP, wireless RF/CSMA-CA, EtherChannel, accesso di management           | Corretto, parità pulita |
| `networkFundamentalsLab.ts`  | Classi di indirizzi IPv4/IPv6, TCP/UDP, switching (CAM, flooding, aging), virtualizzazione | Corretto, parità pulita |

Verificati a campione, tra gli altri: MAC virtuali HSRP `0000.0C07.ACxx` e VRRP
`0000.5E00.01xx`; preempt HSRP disabilitato di default / VRRP abilitato; timer
DHCP T1 50% unicast e T2 87,5% broadcast; canali 2,4 GHz non sovrapposti 1/6/11;
aging CAM 300 s; prefissi IPv6 (FE80::/10, FC00::/7, 2000::/3, FF00::/8,
2001:DB8::/32, 64:FF9B::/96). **Nessun difetto fattuale o di parità rilevato.**
Non è quindi stata introdotta alcuna modifica di contenuto (niente ritocchi
cosmetici).

## Intervento (robustezza CI)

I cinque dataset sono `Localized` / `Record<Language, string>` e, a differenza
del manuale e del modello OSI, erano raggiunti **solo** dall'euristica testuale,
che non rileva un lato lingua interamente mancante. Aggiunto a
`src/content/bilingual.test.ts` un unico controllo che, per **namespace**,
percorre ogni export dei cinque moduli con `collectEmptyTranslations` (fallisce su
un lato mancante o vuoto e nomina `modulo.export…`), più un contatore anti no-op
(>100 coppie). L'uso del namespace copre anche gli export futuri senza
enumerarli. Export non bilingui (es. `ETHERCHANNEL_MODES`, `ACL_RULES`,
`OSPF_CONFIG`, `SYSLOG_LEVELS`) non hanno chiavi `it`/`en` e sono ignorati senza
falsi positivi. Variazione circoscritta al test di guardia e alla documentazione:
nessuna modifica al runtime, dipendenze o architettura.

## Verifiche e limiti

Baseline `npm run verify` superata prima dell'intervento. Sulle modifiche:

- `npm run verify`: superato — **86 file / 782 test Vitest** (era 781), coverage
  richiesto, `format:check`, `typecheck`, `lint`, build e tutti i gate (lockfile,
  release, deployment-security, repository-posture, documentation-targets,
  offensive-content, technical-content, design-system, accessibility-release,
  performance).
- `src/content/bilingual.test.ts`: **19 test** (era 18); nuovo controllo dei lab
  verde, contatore confermato (>100 coppie IT/EN visitate nei cinque moduli).
- Audit runtime/full: **0 vulnerabilità**; nessuna dipendenza cambiata.
- Budget performance: ingresso 122430 byte gzip / 125 kB; Ports Explorer 48002
  byte / 55 kB. Soglie invariate.
- `npm run test:e2e`: **74/74 superati**, Chromium. La modifica è solo di test e
  non tocca il runtime, quindi l'esito resta valido.

Primo avvio con Node 24.22.0 (nvm) perché l'ambiente aveva 22.22.0, fuori dal
range `engines`; nessuna dipendenza del progetto modificata. Non eseguiti
Firefox/WebKit, screen reader reali o controlli del deployment pubblico. Gli
esiti locali non equivalgono all'esito della matrice CI e degli scanner remoti.

Con cataloghi, glossario, manuale, modello OSI e ora i laboratori interattivi
sotto controllo strutturale, **tutti** i dataset principali rivolti al discente
falliscono in CI se perdono un lato lingua. I18N-10 resta ricorrente per i futuri
contenuti; questa revisione non implica un controllo integrale di ogni testo
storico presente in tutte le sezioni dell'applicazione.

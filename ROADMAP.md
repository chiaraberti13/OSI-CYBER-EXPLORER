# 🚀 Roadmap di Sviluppo: OSI-CYBER-EXPLORER

> **Baseline analizzata:** branch `main`, commit `8f91a2c` del 20 settembre 2026  
> **Ultima revisione della roadmap:** 24 settembre 2026 (rev. 2 — verifica tecnica, track Networking, KPI e rischi)  
> **Metodo della rev. 2:** baseline rieseguita localmente con Node 22.22.2 (`npm ci`, `vitest run`, `npm audit`, `vite build`) e ispezione mirata del codice; i task già presenti sono stati conservati con la stessa numerazione e arricchiti solo dove la verifica ha fatto emergere dettagli mancanti.

## Legenda

- [ ] Da iniziare
- [~] In corso
- [x] Completato
- **P0 — Critica:** blocca affidabilità, sicurezza o qualità della baseline.
- **P1 — Alta:** intervento da pianificare nel breve periodo.
- **P2 — Media:** consolidamento successivo.
- **P3 — Evolutiva:** miglioramento futuro, subordinato a metriche o bisogni reali.

---

## 📌 Stato Attuale e Visione

### Valutazione iniziale

La premessa relativa a un singolo `script.py` non corrisponde più allo stato del repository: nel branch `main` il file non è presente. **OSI-CYBER-EXPLORER è già una Single Page Application educativa, bilingue e interamente client-side**, costruita con React 19, TypeScript, Vite 6, Tailwind CSS 4, Zustand, Motion e Vitest.

Il progetto dispone già di:

- 49 componenti React, 32 moduli di contenuto e 46 file di logica/test in `src/lib`;
- laboratori interattivi su OSI, CCNA 200-301, attacchi, difese, hardening, detection e recovery;
- separazione iniziale tra UI (`src/components`), contenuti (`src/content`) e logica (`src/lib`);
- caricamento lazy delle viste principali e code splitting;
- contenuti IT/EN, ricerca rapida e layout responsive;
- stato globale Zustand con persistenza limitata alle preferenze;
- ESLint, TypeScript, Vitest e CI GitHub Actions;
- 38 file di test e 239 test superati localmente con Node 24;
- `SECURITY.md`, licenza MIT e lockfile npm.

### Problemi verificati nella baseline

1. ✅ *Risolto da ENG-01 (CI verde su `main`, run #91).* **CI rossa su `main`:** il workflow usa Node 20, mentre `jsdom@30.1.0` richiede Node `^22.22.2 || ^24.15.0 || >=26`. I test di logica passano, ma i due test componenti non inizializzano jsdom; il build viene quindi saltato.
2. ✅ *Risolto da ENG-01.* **Requisiti incoerenti:** il README dichiara Node 18+, in contrasto con la toolchain installata.
3. **Supply chain di sviluppo:** `npm audit` completo rileva 10 vulnerabilità nella toolchain/dev dependencies (1 low, 4 moderate, 4 high, 1 critical); `npm audit --omit=dev` non rileva vulnerabilità runtime.
4. **Debito di modularità:** `PortsExplorer.tsx` supera 226 KB, `LayerDetails.tsx` 65 KB e diversi laboratori 30–42 KB; dati, logica e rendering sono ancora accoppiati in alcuni componenti.
5. **Accessibilità incompleta:** le basi sono buone, ma modali, ricerca tipo combobox, focus management e alcuni stati visuali non seguono ancora integralmente WCAG 2.2 AA.
6. **Indirizzi e servizi reali nei contenuti didattici:** simulazioni ed esempi usano IP pubblici reali (`8.8.8.8` in `pathTopology.ts`, `PacketSimulator.tsx`, `PathTraceLab.tsx`, `LayerDetails.tsx`; `104.22.3.14`, appartenente a un provider CDN, in `PacketSimulator.tsx`) e un servizio di terzi (`curl -Iv https://httpbin.org/get` in `LayerDetails.tsx`), invece dei blocchi riservati alla documentazione (RFC 5737, RFC 3849) e dei domini `example.*` (RFC 2606). Vedi NET-01.
7. **Contenuti di rete senza fonti normative tracciate:** porte, costi STP, classi di indirizzi e intestazioni sono corretti nei casi verificati, ma non riportano la fonte (RFC, IEEE, registry IANA) né la data di verifica; manca quindi un modo per rilevare quando un dato diventa obsoleto. Vedi NET-02–NET-07.

### Verifica della baseline (rev. 2, 24/09/2026)

| Controllo | Esito rilevato | Nota |
|---|---|---|
| `vitest run` (Node 22.22.2) | 38 file, 239 test superati | conferma che il problema della CI è la versione di Node, non il codice |
| `npm audit` completo | 10 advisory: 1 low, 4 moderate, 4 high, 1 critical | dirette: `vite` (high) e `vitest` (critical); il resto è transitivo (`esbuild`, `postcss`, `nanoid`, `browserslist`, `vite-node`, `@vitest/mocker`, …) |
| `npm audit --omit=dev` | 0 vulnerabilità | il bundle servito agli utenti non include le dipendenze vulnerabili |
| `vite build` | chunk iniziale 385 KB (123 KB gzip), Porte 171 KB (50 KB gzip) | valori usati come baseline di ENG-14 |
| Sink pericolosi (`dangerouslySetInnerHTML`, `eval`, `new Function`, `innerHTML`, `fetch`) | nessuno nel codice sorgente | l'unica risorsa remota a runtime è l'immagine Unsplash in `GuideModal.tsx` (UX-11) |
| Persistenza | solo `localStorage` tramite `zustand/persist` con `partialize` | coerente con SEC-08 |

### Visione

Evolvere la piattaforma in un laboratorio didattico affidabile, verificabile e accessibile, mantenendo tre principi:

- **sicurezza by design:** nessun traffico offensivo reale, nessun segreto nel client e input sempre limitati;
- **architettura data-driven:** contenuti, logica e interfaccia indipendenti e testabili;
- **apprendimento inclusivo:** navigazione condivisibile, interazione completa da tastiera e parità IT/EN.

### Non-obiettivi attuali

- Non introdurre backend, account, telemetria o AI senza una decisione architetturale separata.
- Non aggiungere gestione di API key o credenziali runtime: nel codice attuale non risultano chiavi hardcoded, autenticazione o API reali.
- Non trasformare le simulazioni in strumenti che generano traffico, exploit o payload contro sistemi esterni.
- Non aggiungere librerie Python (`requirements.txt`, framework CLI, ecc.): lo stack reale è TypeScript/React.

---

## 🛡️ Interventi di Cyber Security (A cura del Security Architect)

**Priorità complessiva: alta.** La superficie reale è una SPA statica: le priorità sono supply chain, pipeline, deployment, disponibilità del browser e integrità dei contenuti.

### P0 — Correzioni critiche

- [ ] **SEC-01 — Correggere le vulnerabilità della toolchain.** Aggiornare in PR controllate Vite, Vitest e dipendenze transitive alle prime versioni supportate prive degli advisory rilevati; rigenerare `package-lock.json`, rieseguire tutti i test ed evitare `npm audit fix --force` non revisionato. Poiché gli advisory più gravi riguardano direttamente `vite` e `vitest`, aggiornarli insieme a versioni compatibili tra loro: questo permette anche di rivalutare la separazione tra `vite.config.ts` e `vitest.config.ts`, oggi motivata dalla doppia copia di Vite. **Completato quando:** non rimangono vulnerabilità High/Critical non documentate; il report runtime e quello completo sono separati.

- [ ] **SEC-02 — Applicare limiti pre-parse agli input JSON.** In `AutomationLab`/`src/lib/automation.ts` definire soglie condivise per byte, profondità e numero di nodi prima e durante la visita. `flattenJsonDocument` limita nodi e profondità solo dopo `JSON.parse`, mentre `findSensitiveJsonPaths` percorre oggi l'intero oggetto senza gli stessi limiti. **Completato quando:** input oltre soglia falliscono in modo controllato e test boundary/fuzz coprono byte, depth, nodes e stack exhaustion; valutare `fast-check`.

- [ ] **SEC-03 — Limitare il server di sviluppo alla loopback.** Sostituire il default `vite --host=0.0.0.0` con `127.0.0.1`; offrire un comando `dev:network` esplicito e documentato solo per chi necessita accesso LAN. **Completato quando:** `npm run dev` non espone il progetto sulla rete locale per impostazione predefinita.

- [ ] **SEC-04 — Ridurre i privilegi della CI.** Dichiarare `permissions: contents: read`, usare `persist-credentials: false` in `actions/checkout` (il token non deve restare nella configurazione git del runner), aggiungere `timeout-minutes` e fissare le GitHub Actions a commit SHA verificati, con aggiornamenti automatizzati controllati. **Completato quando:** il token del workflow è read-only e tutte le action sono immutable-pinned.

### P1 — Hardening applicativo e del deployment

- [ ] **SEC-05 — Introdurre security header sul deploy Vercel.** Configurare `vercel.json` con CSP prima in `Report-Only` e poi enforced, almeno `default-src 'self'`, `object-src 'none'`, `base-uri 'none'`, `frame-ancestors 'none'`; aggiungere `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` e HSTS sul solo endpoint HTTPS di produzione. Considerare l'immagine Unsplash attuale nella guida prima di restringere `img-src`. Come passo finale, dato che il codice non usa sink DOM testuali, valutare `require-trusted-types-for 'script'` (Trusted Types) in Report-Only per rendere strutturalmente impossibile una futura DOM XSS. **Completato quando:** gli header sono verificati sulla demo e non interrompono Motion, font, asset o lazy chunks.

- [ ] **SEC-06 — Automatizzare SAST, dependency e secret scanning.** Aggiungere CodeQL JavaScript/TypeScript, Dependabot per npm e GitHub Actions, Gitleaks o secret scanning equivalente, OSV/npm audit e SBOM CycloneDX. Bloccare inizialmente solo nuovi finding High/Critical, con eccezioni versionate. **Completato quando:** ogni PR produce risultati leggibili e una vulnerabilità non può essere ignorata senza motivazione.

- [ ] **SEC-07 — Centralizzare la validazione degli input interattivi.** Applicare funzioni pure o schemi `zod`/`valibot` a JSON, path REST simulato, IP/subnet, wildcard, VLAN e valori numerici; introdurre limiti di lunghezza e rifiuto dei caratteri di controllo. Il campo `resource` deve accettare solo un path relativo e dichiarare chiaramente che nessuna richiesta viene inviata. **Completato quando:** errori e limiti sono coerenti, bilingui e coperti da test.

- [ ] **SEC-08 — Validare e versionare `localStorage`.** Aggiungere versione, migrazione e schema di rehydration per `language`, `audioEnabled`, `simSpeed` e `hasSeenGuide`; ignorare dati corrotti o valori fuori dominio. Non cifrare queste preferenze: non sono segreti. **Completato quando:** testano storage manomesso, schema precedente e ripristino dei default.

- [ ] **SEC-09 — Rafforzare il rilevamento didattico dei segreti.** Estendere `SENSITIVE_KEY` a varianti come `authorization`, `access_token`, `client_secret` e `secretKey`, mantenendo sempre i valori redatti. Aggiungere test su maiuscole, separatori, Unicode, falsi positivi e limiti. **Completato quando:** il warning non espone mai il valore e resta esplicito che non sostituisce un secret scanner.

- [ ] **SEC-10 — Aggiungere test di sicurezza frontend.** Integrare regole ESLint/Semgrep mirate a TypeScript/React e test che impediscano l'introduzione di `dangerouslySetInnerHTML`, `eval`, sink DOM non sicuri, fetch non previsti e persistenza oltre l'allowlist. **Completato quando:** le regole sono tarate per evitare rumore e girano in PR.

- [ ] **SEC-17 — Rafforzare l'installazione delle dipendenze.** Verificare con `lockfile-lint` che il lockfile punti solo a `https://registry.npmjs.org` con hash di integrità; eseguire `npm audit signatures` in CI per verificare firme e provenienza dei pacchetti; valutare `npm ci --ignore-scripts` (o un'allowlist degli script di installazione necessari) e un periodo di attesa (cooldown) di alcuni giorni in Dependabot prima di proporre versioni appena pubblicate, per ridurre l'esposizione a pacchetti compromessi. **Completato quando:** una modifica del lockfile verso registry o tarball non attesi fa fallire la CI.

### P2 — Governance e assurance

- [ ] **SEC-11 — Versionare un threat model.** Creare `docs/THREAT_MODEL.md` con asset, trust boundary browser/localStorage/npm/GitHub Actions/Vercel, minacce STRIDE, controlli esistenti e non-obiettivi. **Completato quando:** descrive esplicitamente assenza di backend, AI, telemetria e traffico offensivo reale.

- [ ] **SEC-12 — Ampliare `SECURITY.md`.** Aggiungere versioni supportate, scope/out-of-scope, tempi indicativi di presa in carico, processo di coordinated disclosure e canale di fallback. **Completato quando:** un ricercatore sa cosa segnalare, come e con quali aspettative.

- [ ] **SEC-13 — Proteggere file e branch sensibili.** Aggiungere `CODEOWNERS` per workflow, lockfile, `SECURITY.md` e contenuti offensivi; verificare e abilitare ruleset/branch protection con CI obbligatoria e review. **Nota:** l'API del repository non consente di confermare l'attuale branch protection; questa attività va verificata nelle impostazioni GitHub.

- [ ] **SEC-14 — Produrre release verificabili.** Allegare SBOM, checksum e attestazione di provenienza agli artifact/release, con changelog e versionamento semantico. **Completato quando:** ogni release è riconducibile a commit e workflow verificati.

- [ ] **SEC-15 — Verificare dinamicamente il deploy.** Eseguire OWASP ZAP Baseline non autenticato o controllo equivalente sulla preview e testare CSP/header dopo ogni modifica di hosting. **Completato quando:** i finding sono archiviati e confrontabili tra release.

- [ ] **SEC-16 — Formalizzare la revisione dei contenuti offensivi.** Conservare simulazioni deterministiche e non esecutive, marcatura “simulazione”, prerequisiti di autorizzazione, difese e limiti; revisionare periodicamente comandi e payload per evitare istruzioni immediatamente riutilizzabili contro terzi. **Completato quando:** una checklist editoriale accompagna ogni nuovo scenario.

- [ ] **SEC-18 — Misurare la postura del repository e proteggere le preview.** Pubblicare OpenSSF Scorecard (action o report periodico) come indicatore di tendenza, non come gate; verificare su Vercel che le preview deployment non espongano variabili d'ambiente, che la Deployment Protection sia coerente con la natura pubblica del progetto e che il dominio di produzione sia l'unico con HSTS. **Completato quando:** il punteggio Scorecard è tracciato nel tempo e i controlli rimanenti sono accettati o pianificati in modo esplicito.

### Mappatura verso framework di riferimento

La mappatura serve a spiegare *perché* esiste un controllo, non a dichiarare conformità formale.

| Area | Task | Riferimento |
|---|---|---|
| Supply chain e build | SEC-01, SEC-04, SEC-06, SEC-14, SEC-17 | NIST SP 800-218 (SSDF) PO.3/PS.2/PS.3, SLSA Build L2–L3, OWASP Top 10:2025 A03 |
| Validazione input | SEC-02, SEC-07, SEC-09 | OWASP ASVS 5.0 (validazione e codifica), CWE-20, CWE-400, CWE-674 |
| Header e browser | SEC-05, SEC-15 | OWASP Secure Headers Project, OWASP ASVS 5.0 (configurazione) |
| Governance | SEC-11, SEC-12, SEC-13, SEC-18 | STRIDE, ISO/IEC 29147 (vulnerability disclosure), OpenSSF Scorecard |
| Contenuti offensivi | SEC-16, NET-01 | MITRE ATT&CK (tecniche referenziate per ID), principio di simulazione non esecutiva |

---

## 💻 Miglioramenti di Ingegneria del Software (A cura del Senior Engineer)

**Priorità complessiva: medio/alta.** L'architettura è già valida; il lavoro consiste nel ripristinare una baseline riproducibile e ridurre l'accoppiamento dei moduli più grandi.

### P0 — Baseline affidabile e riproducibile

- [x] **ENG-01 — Ripristinare la CI verde e allineare Node.** Portare CI, `package.json#engines`, `.nvmrc` e README a Node 22.22.2+ oppure 24 LTS/supportato; aggiungere `packageManager`. Consigliato: `.nvmrc` su Node 24 LTS e una matrice CI minima `22.22.x` + `24.x`, così il limite inferiore dichiarato in `engines` resta davvero testato (la baseline passa già con Node 22.22.2). Un downgrade di jsdom è possibile ma meno coerente con la toolchain corrente. **Completato quando:** type-check, lint, 38 file di test/239 test e build terminano con successo in locale e GitHub Actions. **Esito (24/09/2026):** `engines` = `^22.22.2 || ^24.15.0 || >=26.0.0` (lo stesso intervallo richiesto da jsdom), `.nvmrc` = `24`, `packageManager` = `npm@11.19.0` (npm incluso in Node 24.21.0), CI con matrice `22.22.x` + `24.x` e `fail-fast: false`, requisiti aggiornati in `README.md`, `README.it.md` e `descrizione.md`. Nel lockfile è stato aggiunto solo il blocco `engines` della radice. Verifica locale su Node 22.22.2/npm 10.9.7 e Node 24.21.0/npm 11.19.0: type-check, lint, 44 file/344 test (la suite è cresciuta dopo la baseline) e build superati. Confermato su GitHub Actions: entrambi i job della matrice verdi sulla PR #48 e su `main` (run #91). Nota per SEC-17: con npm 11 `npm ci` avvisa che alcuni script di installazione non sono approvati (`npm install-scripts ls`); l'installazione e i test non ne risentono.

- [x] **ENG-02 — Rendere deterministica la gestione delle dipendenze.** Mantenere `npm ci`, aggiornare il lockfile solo in PR dedicate e documentare la policy di audit, incluse differenze tra dipendenze runtime e development. **Completato quando:** una nuova installazione usa versioni e runtime dichiarati e produce lo stesso esito della CI. **Esito (24/09/2026):** `.npmrc` con `engine-strict=true` (su Node 20 `npm ci` ora fallisce subito con `EBADENGINE` invece di rompere i test più avanti); script `verify` (stessa sequenza della CI), `audit:runtime` (`npm audit --omit=dev --audit-level=high`) e `audit:full`; in CI l'audit runtime è bloccante e quello completo è solo report fino a SEC-01; policy bilingue in `docs/DEPENDENCIES.md`; README e `descrizione.md` indicano `npm ci` invece di `npm install`. Verificato su Node 22.22.2 e 24.21.0: `npm ci` + `npm run verify` superati (44 file/344 test); `audit:runtime` 0 vulnerabilità.

### P1 — Manutenibilità, tipi e test

- [ ] **ENG-03 — Attivare TypeScript strict in modo incrementale.** Abilitare `strict`, poi `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` e `noFallthroughCasesInSwitch`; rimuovere `allowJs`, decorator flag e opzioni inutilizzate dopo verifica. Correggere l'alias `@/*` verso `src/*` o eliminarlo, in modo coerente sia in `tsconfig.json` sia in `vite.config.ts` (entrambi puntano oggi alla radice del repository). **Completato quando:** `tsc --noEmit` passa senza nuovi `any`, `@ts-ignore` o cast non motivati.

- [ ] **ENG-04 — Scomporre `PortsExplorer.tsx`.** Estrarre registry di porte, protocolli, dispositivi e categorie in `src/content`, logica di filtro in `src/lib` e pannelli UI in componenti focalizzati. **Completato quando:** invarianti e ricerca sono testati, il file non è più il principale collo di bottiglia manutentivo e i chunk non peggiorano.

- [ ] **ENG-05 — Scomporre gli altri moduli monolitici.** Spostare `SCENARIO_FEEDBACK` da `LayerDetails.tsx` nei contenuti e separare progressivamente `NetworkFundamentalsLab`, `NetworkAccessLab`, `IpConnectivityLab`, `IpServicesLab` e `SecurityFundamentalsLab` in sezioni riutilizzabili. **Completato quando:** dati, logica e rendering sono separati senza regressioni.

- [ ] **ENG-06 — Creare una registry tipizzata delle viste.** Eliminare la duplicazione tra `AppView`, `NAV_GROUPS`, `VIEW_ICONS` e i numerosi blocchi `activeView === ...` in `App.tsx`. Usare una definizione esaustiva con `satisfies Record<AppView, ViewDefinition>`, loader lazy, metadati e gruppo. **Completato quando:** ogni vista è registrata e raggiungibile esattamente una volta, verificato da test.

- [ ] **ENG-07 — Estrarre il motore di simulazione dalla UI.** Spostare timer, transizioni, generazione header e profili protocollo di `PacketSimulator.tsx` in reducer/macchina a stati pura in `src/lib/simulation.ts`. XState non è necessario se basta un reducer TypeScript discriminato. **Completato quando:** fake timers coprono start, pause, resume, reset, velocità, cambio protocollo e cleanup.

- [ ] **ENG-08 — Ridurre i re-render Zustand.** Usare selector granulari e `useShallow`, dividere lo store in slice `preferences`, `navigation`, `simulation` e `ui`, e lasciare locale lo stato non condiviso. Tipizzare `simSpeed` come `0.5 | 1 | 2` e i layer come dominio 1–7. **Completato quando:** React Profiler mostra aggiornamenti circoscritti durante una simulazione.

- [ ] **ENG-09 — Gestire gli errori dei moduli lazy.** Affiancare a `Suspense` un Error Boundary bilingue con retry del chunk e ritorno sicuro a una vista funzionante; usare `react-error-boundary` o un boundary minimo interno. **Completato quando:** un import dinamico fallito non lascia l'app vuota.

- [ ] **ENG-10 — Rendere le viste indirizzabili via URL.** Usare React Router o hash routing, generando le route dalla registry; aggiungere rewrite Vercel se necessario. **Completato quando:** refresh, deep link, URL non valido e back/forward preservano un comportamento prevedibile.

- [ ] **ENG-11 — Rendere misurabile la copertura.** Aggiungere `@vitest/coverage-v8`, report in CI e soglie iniziali realistiche soprattutto su `src/lib`; evitare una soglia globale artificiale sui grandi dataset. **Completato quando:** le regressioni nella logica pura riducono visibilmente la coverage o falliscono sotto la soglia concordata.

- [ ] **ENG-12 — Aggiungere smoke test E2E.** Con Playwright coprire caricamento, cambio lingua, ricerca `Ctrl/Cmd+K`, apertura laboratorio, simulazione, IPv4/VLSM/STP e flussi da tastiera. **Completato quando:** almeno Chromium gira stabilmente in CI; aggiungere Firefox/WebKit solo dopo stabilizzazione.

- [ ] **ENG-13 — Validare sistematicamente i contenuti.** Estendere `content.test.ts` e `bilingual.test.ts` per ID unici, riferimenti esistenti, valori ammessi, parità IT/EN e copertura delle relazioni tra dominio, scenario, tecnica e controllo. Usare `satisfies`; introdurre Zod/Valibot solo se l'authoring esce da TypeScript. **Completato quando:** un riferimento rotto o una traduzione mancante falliscono in CI.

### P2/P3 — Performance e collaborazione

- [ ] **ENG-14 — Definire budget prestazionali.** Misurare con `rollup-plugin-visualizer` o `vite-bundle-visualizer`, `size-limit` e Lighthouse CI. La build attuale produce un chunk iniziale di circa 385 KB (123 KB gzip) e il chunk Porte di circa 171 KB (50 KB gzip). **Completato quando:** esistono budget per initial JS e route; ogni ottimizzazione deriva da profiling.

- [ ] **ENG-15 — Ottimizzare liste solo dopo misurazione.** Valutare memoizzazione, indicizzazione della ricerca o virtualizzazione (`react-window`) per glossario/porte soltanto se profiler e Web Vitals mostrano un problema reale. **Completato quando:** il miglioramento è dimostrato da una metrica prima/dopo.

- [ ] **ENG-16 — Consolidare l'internazionalizzazione UI.** Spostare le label duplicate in cataloghi tipizzati `src/i18n/it.ts` e `en.ts`; adottare `react-i18next` solo se servono pluralizzazione, namespace o caricamento dinamico. **Completato quando:** una chiave mancante viene rilevata da TypeScript/test.

- [ ] **ENG-17 — Standardizzare formato e contribuzione.** Aggiungere Prettier, `.editorconfig`, `format:check` e `CONTRIBUTING.md`; rimuovere lo script POSIX `rm -rf dist` se superfluo oppure sostituirlo con `rimraf`. **Completato quando:** setup, convenzioni bilingui e checklist PR sono riproducibili su Windows, macOS e Linux.

- [ ] **ENG-18 — Rendere la CI più efficiente.** Dopo il ripristino P0, aggiungere `concurrency` con cancellazione dei run superati, job separati per quality/test/build e artifact di coverage/bundle. **Completato quando:** il check richiesto su `main` è rapido, leggibile e diagnostico.

---

## 🌐 Accuratezza di Networking e Contenuti Tecnici (A cura del Networking Specialist)

**Priorità complessiva: media/alta.** Per un laboratorio didattico l'errore tecnico è un difetto di prodotto: uno studente memorizza ciò che vede. La logica di `src/lib` (IPv4, IPv6, VLSM, wildcard, STP) è già ben testata; questo track la rende tracciabile rispetto alle fonti normative e allinea gli esempi alle convenzioni della documentazione di rete.

### P1 — Correttezza e sicurezza degli esempi

- [ ] **NET-01 — Usare solo indirizzi e domini riservati alla documentazione.** Sostituire IP pubblici reali e servizi di terzi negli esempi con `192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24` (RFC 5737), `2001:db8::/32` (RFC 3849) ed `example.com`/`.org`/`.net` (RFC 2606). Esempi concreti: `8.8.8.8` → `203.0.113.8` per la destinazione “Internet”; `104.22.3.14` → `198.51.100.14`; `curl -Iv https://httpbin.org/get` → `curl -Iv https://example.com/`. Eccezioni ammesse e documentate: router-ID OSPF convenzionali (`1.1.1.1`, `2.2.2.2`, …), che sono identificatori e non destinazioni, e i blocchi privati RFC 1918 per le LAN. Aggiungere un test che scansioni `src/content` e i componenti e fallisca su IPv4/IPv6 pubblici fuori da un'allowlist. **Completato quando:** nessun esempio copiato dall'utente genera traffico verso sistemi reali di terzi.

- [ ] **NET-02 — Test di conformità con vettori normativi.** Aggiungere casi tratti direttamente dalle specifiche: registry IANA IPv4/IPv6 Special-Purpose (RFC 6890) per `addressKind`/`classifyIpv6`, `/31` punto-punto (RFC 3021), rappresentazione testuale canonica IPv6 (RFC 5952: minuscole, compressione della sequenza di zeri più lunga e più a sinistra, nessuna compressione di un singolo gruppo), EUI-64 modificato (RFC 4291 app. A). Con `fast-check` (condiviso con SEC-02) verificare le proprietà `ipv4ToUint ∘ uintToIpv4 = id` ed `expand(compress(x)) = x`. **Completato quando:** ogni funzione di indirizzamento cita nel test la sezione della fonte usata.

- [ ] **NET-03 — Allineare la registry delle porte a IANA.** Durante ENG-04, per ogni voce registrare protocollo di trasporto (TCP/UDP/SCTP), stato IANA (assegnata, non assegnata, de facto: ad es. `8080`), versione cifrata equivalente (ad es. 143→993, 389→636) e data di verifica rispetto al *Service Name and Transport Protocol Port Number Registry*. Test: coppia porta/protocollo univoca, range 0–65535, classificazione well-known/registered/dynamic (RFC 6335). **Completato quando:** una porta ambigua o non verificata è marcata come tale nella UI.

- [ ] **NET-04 — Rendere esplicito il modello STP.** Dichiarare nella UI e nei test quale tabella dei costi è in uso (802.1D-1998 “short” a 16 bit oppure 802.1t/802.1D-2004 “long” a 32 bit), la priorità in multipli di 4096 con *extended system ID* (VLAN ID sommato alla priorità) e la distinzione PVST+/RSTP/MST già accennata in `stp.ts`. Aggiungere test sui tie-breaker completi: root path cost → sender bridge ID → sender port ID → porta locale. **Completato quando:** lo studente vede sempre quale standard produce il risultato mostrato.

### P2 — Coerenza e manutenzione dei contenuti

- [ ] **NET-05 — Unica fonte per dimensioni e campi degli header.** Centralizzare in `src/content` le costanti usate da `PacketSimulator.tsx`, `LayerDetails.tsx` e `PacketInspector.tsx`: Ethernet II 14 byte + FCS 4, tag 802.1Q 4 byte, frame 64–1518 byte (1522 con tag), MTU 1500, header IPv4 20–60 byte e IPv6 40 byte fissi, TCP 20–60 byte e UDP 8 byte, quindi MSS tipico 1460 (IPv4) / 1440 (IPv6); TTL iniziali tipici (64/128/255) presentati come default di sistema, non come costanti di protocollo. **Completato quando:** un test verifica che i valori mostrati dai vari componenti coincidano.

- [ ] **NET-06 — Riferimenti normativi strutturati.** Aggiungere ai contenuti un campo opzionale `references` tipizzato (`{ kind: 'rfc' | 'ieee' | 'nist' | 'attack' | 'cisco'; id: string }`) e validarne il formato in `content.test.ts` (ad es. `RFC 5952`, `T1557.002`). Fissare la versione di MITRE ATT&CK usata. **Completato quando:** ogni scenario di attacco e ogni controllo difensivo ha almeno un riferimento verificabile.

- [ ] **NET-07 — Tracciare la copertura del blueprint CCNA 200-301.** Versionare una matrice *exam topic → laboratorio/sezione* allineata alla versione corrente dell'esame e testare che ogni topic dichiarato abbia almeno una destinazione esistente nella registry delle viste (ENG-06). **Completato quando:** un aggiornamento del blueprint mostra immediatamente i topic scoperti.

- [ ] **NET-08 — Revisione periodica dei contenuti tecnici.** Pianificare una revisione semestrale (o a ogni nuova versione del blueprint/ATT&CK) di porte, comandi Cisco IOS/Linux, protocolli deprecati (ad es. TLS 1.0/1.1 secondo RFC 8996, SSHv1, SNMPv1/v2c come esempi da evitare) e raccomandazioni crittografiche. **Completato quando:** ogni revisione lascia una voce nel registro delle decisioni con data e ambito.

---

## 🎨 Ottimizzazioni UX/UI (A cura del UX/UI Designer)

**Priorità complessiva: media, con alcuni interventi P0 di accessibilità.** La UI dispone già di focus visibile, `prefers-reduced-motion`, tabelle responsive, ricerca da tastiera e fallback di caricamento.

### P0 — Accessibilità essenziale

- [ ] **UX-01 — Rendere accessibili le modali Guida e Glossario.** Aggiungere `role="dialog"`, `aria-modal="true"`, `aria-labelledby`/`aria-describedby`, focus iniziale, focus trap, Escape, ripristino focus al trigger e blocco dello scroll del body. Assegnare `aria-label` ai pulsanti di chiusura e rendere il backdrop non ambiguo. **Completato quando:** il flusso è interamente utilizzabile con tastiera e screen reader senza perdita del focus.

- [ ] **UX-02 — Aggiungere uno skip link.** Inserire “Vai al contenuto” prima dell'header e `id="main-content"` sul landmark principale. **Completato quando:** il primo Tab consente di saltare header e navigazione sticky.

- [ ] **UX-03 — Implementare il pattern combobox nella ricerca.** Aggiungere `role="combobox"`, `aria-autocomplete`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, risultati `listbox/option` e annunci `aria-live`. **Completato quando:** frecce, Invio, Escape e lettura dei risultati seguono il pattern ARIA senza spostare indebitamente il focus.

- [ ] **UX-04 — Etichettare la ricerca del glossario.** Usare `<label>` o `aria-label`, associare gli errori/stati, annunciare conteggio e nessun risultato e fornire reset della ricerca. **Completato quando:** il placeholder non è l'unico nome accessibile.

- [ ] **UX-05 — Rendere semantici gli stati OSI.** Esporre selezione, bersaglio, compromissione e mitigazione con `aria-pressed`/`aria-current`, testo o icone oltre al colore; localizzare anche `transforming`, `compromised` e `hardened`. **Completato quando:** stato e risultato sono comprensibili senza percezione cromatica.

### P1 — Navigazione, leggibilità e feedback

- [ ] **UX-06 — Rendere condivisibile ogni laboratorio.** Coordinare la navigazione URL-based con ENG-10 e aggiungere titoli pagina per singola vista. **Completato quando:** un utente può copiare il link del lab corrente e usare back/forward senza perdere contesto.

- [ ] **UX-07 — Migliorare la navigazione mobile.** L'overflow orizzontale con scrollbar nascosta non comunica la presenza di altre voci; introdurre drawer “Tutti i laboratori”, gradient/freccia di overflow o menu compatto, mantenendo la ricerca visibile. **Completato quando:** tutte le sezioni sono scopribili a 320–390 px senza gesti impliciti.

- [ ] **UX-08 — Portare i target touch ad almeno 44×44 px.** Verificare lingua, guida, ricerca, tab, icone e controlli simulazione; ridurre l'uso sistematico di testi 9–11 px. **Completato quando:** target e reflow rispettano WCAG 2.2 a 320 px e zoom 200%/400%.

- [ ] **UX-09 — Correggere la gerarchia degli heading.** Evitare l'`h1` permanente del brand insieme agli `h1` delle viste; mantenere un solo titolo principale per pagina/vista e una gerarchia coerente. **Completato quando:** l'outline del documento è lineare in ogni laboratorio.

- [ ] **UX-10 — Rendere adattiva l'altezza del glossario.** Sostituire `h-[82vh] min-h-[600px]` con un layout che funzioni su viewport bassi e landscape, usando `min-h-0` e regioni scorrevoli controllate. **Completato quando:** non compare overflow della pagina su mobile landscape.

- [ ] **UX-11 — Rimuovere la dipendenza dall'immagine remota in Guida.** Usare un asset locale ottimizzato e `alt=""` se decorativo, riducendo tracking, dipendenza di rete e rumore per screen reader. **Completato quando:** la guida è completa anche offline e compatibile con CSP restrittiva.

- [ ] **UX-12 — Standardizzare feedback ed errori.** Posizionare i messaggi vicino ai campi, usare `aria-invalid`/`aria-describedby` e annunciare pausa, reset, velocità, esito simulazione e validazioni senza affidarsi al solo colore. **Completato quando:** tutti gli stati critici sono percepibili visivamente e tramite tecnologie assistive.

### P2/P3 — Coerenza visiva e qualità dell'apprendimento

- [ ] **UX-13 — Consolidare un design system.** Centralizzare token per colori, contrasto, tipografia, spaziatura, radius, elevazione e stati, riducendo classi Tailwind arbitrarie duplicate. **Completato quando:** i componenti condividono token documentati e i contrasti raggiungono WCAG 2.2 AA.

- [ ] **UX-14 — Migliorare l'orientamento iniziale.** Valutare `CurriculumView` come landing oppure una home leggera con percorso consigliato e “Continua”, basata solo su interazioni già disponibili. **Completato quando:** un nuovo utente comprende da dove iniziare senza aprire tutti i menu.

- [ ] **UX-15 — Migliorare la findability delle collezioni grandi.** Per glossario e porte aggiungere filtri espliciti, conteggio, reset ed evidenziazione dei match; introdurre virtualizzazione solo dopo profiling. **Completato quando:** le ricerche comuni richiedono pochi passaggi e mantengono il contesto.

- [ ] **UX-16 — Automatizzare i controlli a11y.** Integrare `axe-core` con Vitest/Testing Library o `@axe-core/playwright`, più E2E per focus modale, tastiera, cambio lingua, reflow e deep link. **Completato quando:** regressioni WCAG rilevabili automaticamente bloccano la PR.

- [ ] **UX-17 — Definire obiettivi misurabili.** Adottare WCAG 2.2 AA, Lighthouse Accessibility ≥95, uso completo da tastiera, assenza di focus trap involontari, target touch 44 px e nessuno scroll orizzontale della pagina a 320 px/400% zoom. **Completato quando:** la checklist viene eseguita per ogni release.

---

## 📅 Pianificazione Temporale

| Fase | Orizzonte indicativo | Obiettivo | Task principali | Criterio di uscita |
|---|---:|---|---|---|
| **Sprint 0 — Stabilizzazione** | 1–3 giorni | Ripristinare una baseline affidabile | ENG-01, ENG-02, SEC-01, SEC-03, SEC-04, NET-01 | CI verde; runtime e README coerenti; audit governato |
| **Sprint 1 — Sicurezza e accessibilità** | 1–2 settimane | Chiudere i rischi immediati | SEC-02, SEC-05–SEC-10, SEC-17, UX-01–UX-05, NET-02 | Input limitati; header verificati; modali e ricerca accessibili |
| **Sprint 2 — Architettura** | 2–4 settimane | Ridurre accoppiamento e duplicazioni | ENG-03–ENG-10, UX-06–UX-12, NET-03, NET-04 | registry viste, routing, state machine ed error boundary operativi |
| **Sprint 3 — Quality gates** | 1–2 settimane | Rendere qualità e contenuti misurabili | ENG-11–ENG-13, SEC-11–SEC-13, UX-16–UX-17, NET-05, NET-06 | coverage, E2E, content validation e threat model in CI |
| **Backlog evolutivo** | Dopo le metriche | Performance, design system e release | ENG-14–ENG-18, SEC-14–SEC-16, SEC-18, UX-13–UX-15, NET-07, NET-08 | miglioramenti dimostrati da metriche e release verificabili |

### Ordine di dipendenza consigliato

1. Ripristinare runtime e CI prima di aggiungere nuovi quality gate.
2. Aggiornare le dipendenze prima di fissare gli SHA e introdurre l'audit bloccante.
3. Creare la registry delle viste prima di routing e rifinitura della navigazione.
4. Estrarre logica e dati prima di impostare soglie di coverage significative.
5. Correggere modali, combobox e focus prima di rendere axe bloccante.
6. Misurare bundle e runtime prima di introdurre memoizzazione o virtualizzazione.
7. Eseguire NET-01 prima di SEC-16: la checklist editoriale deve poter dare per scontato che gli esempi usino solo indirizzi di documentazione.
8. Allineare la registry delle porte (NET-03) durante l'estrazione di ENG-04, non dopo: si evita di spostare due volte gli stessi dati.
9. Introdurre `fast-check` una sola volta e riusarlo per SEC-02 e NET-02.

### Indicatori e soglie

| Indicatore | Baseline (24/09/2026) | Obiettivo | Task collegati |
|---|---:|---:|---|
| Stato CI su `main` | rossa (Node 20) → verde su Node 22.22.x e 24.x dopo ENG-01 (run #91) | verde, tempo totale < 5 min | ENG-01, ENG-18 |
| Advisory `npm audit` High/Critical | 5 (solo dev) | 0 non documentati | SEC-01, SEC-06 |
| Advisory runtime (`--omit=dev`) | 0 | 0, controllo bloccante in CI da ENG-02 | SEC-01, ENG-02 |
| Action non fissate a SHA | 2 su 2 | 0 | SEC-04 |
| JS iniziale (gzip) | 123 KB | ≤ 123 KB, poi budget ridotto dopo ENG-06/ENG-10 | ENG-14 |
| Coverage righe `src/lib` | non misurata | ≥ 80% dopo la misura iniziale | ENG-11 |
| IP pubblici reali negli esempi | ≥ 4 file coinvolti | 0 fuori allowlist | NET-01 |
| Lighthouse Accessibility | non misurato | ≥ 95 | UX-16, UX-17 |

### Rischi e mitigazioni

| Rischio | Probabilità | Impatto | Mitigazione |
|---|---|---|---|
| L'aggiornamento di Vite/Vitest rompe build o test | media | alto | PR dedicata, nessun'altra modifica insieme, confronto dimensioni bundle prima/dopo |
| CSP enforced blocca chunk lazy, font o Motion | media | alto | fase `Report-Only` sulla preview, rimozione dell'immagine remota (UX-11) prima dell'enforcement |
| La scomposizione di `PortsExplorer` introduce regressioni nei dati | media | medio | test di invarianti scritti prima dell'estrazione e snapshot del conteggio voci |
| Quality gate troppo rumorosi rallentano i contributi | media | medio | blocco solo su nuovi finding High/Critical, eccezioni versionate con scadenza |
| Contenuti tecnici obsoleti (porte, blueprint, ATT&CK) | alta nel lungo periodo | medio | riferimenti strutturati (NET-06) e revisione periodica (NET-08) |

---

## Criteri di Completamento della Roadmap

La roadmap può considerarsi completata quando:

- [ ] CI, type-check, lint, test, build, scansioni e controlli a11y sono verdi sul branch protetto.
- [ ] Non esistono vulnerabilità runtime High/Critical né vulnerabilità di sviluppo non valutate.
- [ ] Ogni input interattivo ha schema, limiti, errore bilingue e test di confine.
- [ ] Le viste sono registrate una sola volta, indirizzabili via URL e protette da Error Boundary.
- [ ] I componenti maggiori separano contenuti, logica e presentazione.
- [ ] Tutti i laboratori sono utilizzabili da tastiera e rispettano WCAG 2.2 AA.
- [ ] La parità IT/EN e l'integrità dei riferimenti didattici vengono verificate automaticamente.
- [ ] Gli esempi usano solo indirizzi e domini di documentazione, e i dati di rete (porte, STP, header, indirizzamento) citano la fonte normativa e sono coperti da vettori di test.
- [ ] Le simulazioni restano client-side, deterministiche, non esecutive e chiaramente contestualizzate come attività autorizzate.

---

## Registro delle Decisioni

| Data | Decisione | Motivazione |
|---|---|---|
| 2026-09-24 | Roadmap basata sulla SPA React/TypeScript, non su `script.py` | Il file non è presente nel branch `main`; la struttura reale è già un'applicazione web evoluta |
| 2026-09-24 | Priorità iniziale a CI/runtime e supply chain | La CI di `main` è rossa e la toolchain di sviluppo presenta advisory verificati |
| 2026-09-24 | Nessun backend o traffico offensivo introdotto | Non necessari alle funzionalità attuali e aumenterebbero superficie d'attacco e responsabilità operative |
| 2026-09-24 | Aggiunto il track Networking (NET-01–NET-08) senza rinumerare SEC/ENG/UX | In un prodotto didattico la correttezza tecnica è un requisito; mantenere gli ID esistenti preserva i riferimenti già usati in issue e PR |
| 2026-09-24 | Esempi limitati agli indirizzi RFC 5737/3849 e ai domini RFC 2606 | Evita che comandi copiati dagli studenti generino traffico verso infrastrutture reali di terzi |
| 2026-09-24 | Scorecard usato come indicatore, non come gate | Alcuni controlli (ad es. fuzzing, release firmate) non sono proporzionati alla fase attuale del progetto |
| 2026-09-24 | ENG-01: Node 24 LTS come riferimento, 22.22.2 come minimo testato | Coincide con i requisiti di jsdom; la matrice CI impedisce che `engines` dichiari versioni mai verificate |
| 2026-09-24 | ENG-02: audit runtime bloccante, audit toolchain solo report | Le vulnerabilità note sono solo nelle dev dependencies e hanno già un task (SEC-01); bloccare subito la toolchain renderebbe rossa ogni PR senza aumentare la sicurezza degli utenti |

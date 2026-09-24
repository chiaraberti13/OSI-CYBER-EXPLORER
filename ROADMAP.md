# 🚀 Roadmap di Sviluppo: OSI-CYBER-EXPLORER

> **Baseline analizzata:** branch `main`, commit `8f91a2c` del 20 settembre 2026  
> **Ultima revisione della roadmap:** 24 settembre 2026

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

1. **CI rossa su `main`:** il workflow usa Node 20, mentre `jsdom@30.1.0` richiede Node `^22.22.2 || ^24.15.0 || >=26`. I test di logica passano, ma i due test componenti non inizializzano jsdom; il build viene quindi saltato.
2. **Requisiti incoerenti:** il README dichiara Node 18+, in contrasto con la toolchain installata.
3. **Supply chain di sviluppo:** `npm audit` completo rileva 10 vulnerabilità nella toolchain/dev dependencies (1 low, 4 moderate, 4 high, 1 critical); `npm audit --omit=dev` non rileva vulnerabilità runtime.
4. **Debito di modularità:** `PortsExplorer.tsx` supera 226 KB, `LayerDetails.tsx` 65 KB e diversi laboratori 30–42 KB; dati, logica e rendering sono ancora accoppiati in alcuni componenti.
5. **Accessibilità incompleta:** le basi sono buone, ma modali, ricerca tipo combobox, focus management e alcuni stati visuali non seguono ancora integralmente WCAG 2.2 AA.

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

- [ ] **SEC-01 — Correggere le vulnerabilità della toolchain.** Aggiornare in PR controllate Vite, Vitest e dipendenze transitive alle prime versioni supportate prive degli advisory rilevati; rigenerare `package-lock.json`, rieseguire tutti i test ed evitare `npm audit fix --force` non revisionato. **Completato quando:** non rimangono vulnerabilità High/Critical non documentate; il report runtime e quello completo sono separati.

- [ ] **SEC-02 — Applicare limiti pre-parse agli input JSON.** In `AutomationLab`/`src/lib/automation.ts` definire soglie condivise per byte, profondità e numero di nodi prima e durante la visita. `flattenJsonDocument` limita nodi e profondità solo dopo `JSON.parse`, mentre `findSensitiveJsonPaths` percorre oggi l'intero oggetto senza gli stessi limiti. **Completato quando:** input oltre soglia falliscono in modo controllato e test boundary/fuzz coprono byte, depth, nodes e stack exhaustion; valutare `fast-check`.

- [ ] **SEC-03 — Limitare il server di sviluppo alla loopback.** Sostituire il default `vite --host=0.0.0.0` con `127.0.0.1`; offrire un comando `dev:network` esplicito e documentato solo per chi necessita accesso LAN. **Completato quando:** `npm run dev` non espone il progetto sulla rete locale per impostazione predefinita.

- [ ] **SEC-04 — Ridurre i privilegi della CI.** Dichiarare `permissions: contents: read`, aggiungere `timeout-minutes` e fissare le GitHub Actions a commit SHA verificati, con aggiornamenti automatizzati controllati. **Completato quando:** il token del workflow è read-only e tutte le action sono immutable-pinned.

### P1 — Hardening applicativo e del deployment

- [ ] **SEC-05 — Introdurre security header sul deploy Vercel.** Configurare `vercel.json` con CSP prima in `Report-Only` e poi enforced, almeno `default-src 'self'`, `object-src 'none'`, `base-uri 'none'`, `frame-ancestors 'none'`; aggiungere `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` e HSTS sul solo endpoint HTTPS di produzione. Considerare l'immagine Unsplash attuale nella guida prima di restringere `img-src`. **Completato quando:** gli header sono verificati sulla demo e non interrompono Motion, font, asset o lazy chunks.

- [ ] **SEC-06 — Automatizzare SAST, dependency e secret scanning.** Aggiungere CodeQL JavaScript/TypeScript, Dependabot per npm e GitHub Actions, Gitleaks o secret scanning equivalente, OSV/npm audit e SBOM CycloneDX. Bloccare inizialmente solo nuovi finding High/Critical, con eccezioni versionate. **Completato quando:** ogni PR produce risultati leggibili e una vulnerabilità non può essere ignorata senza motivazione.

- [ ] **SEC-07 — Centralizzare la validazione degli input interattivi.** Applicare funzioni pure o schemi `zod`/`valibot` a JSON, path REST simulato, IP/subnet, wildcard, VLAN e valori numerici; introdurre limiti di lunghezza e rifiuto dei caratteri di controllo. Il campo `resource` deve accettare solo un path relativo e dichiarare chiaramente che nessuna richiesta viene inviata. **Completato quando:** errori e limiti sono coerenti, bilingui e coperti da test.

- [ ] **SEC-08 — Validare e versionare `localStorage`.** Aggiungere versione, migrazione e schema di rehydration per `language`, `audioEnabled`, `simSpeed` e `hasSeenGuide`; ignorare dati corrotti o valori fuori dominio. Non cifrare queste preferenze: non sono segreti. **Completato quando:** testano storage manomesso, schema precedente e ripristino dei default.

- [ ] **SEC-09 — Rafforzare il rilevamento didattico dei segreti.** Estendere `SENSITIVE_KEY` a varianti come `authorization`, `access_token`, `client_secret` e `secretKey`, mantenendo sempre i valori redatti. Aggiungere test su maiuscole, separatori, Unicode, falsi positivi e limiti. **Completato quando:** il warning non espone mai il valore e resta esplicito che non sostituisce un secret scanner.

- [ ] **SEC-10 — Aggiungere test di sicurezza frontend.** Integrare regole ESLint/Semgrep mirate a TypeScript/React e test che impediscano l'introduzione di `dangerouslySetInnerHTML`, `eval`, sink DOM non sicuri, fetch non previsti e persistenza oltre l'allowlist. **Completato quando:** le regole sono tarate per evitare rumore e girano in PR.

### P2 — Governance e assurance

- [ ] **SEC-11 — Versionare un threat model.** Creare `docs/THREAT_MODEL.md` con asset, trust boundary browser/localStorage/npm/GitHub Actions/Vercel, minacce STRIDE, controlli esistenti e non-obiettivi. **Completato quando:** descrive esplicitamente assenza di backend, AI, telemetria e traffico offensivo reale.

- [ ] **SEC-12 — Ampliare `SECURITY.md`.** Aggiungere versioni supportate, scope/out-of-scope, tempi indicativi di presa in carico, processo di coordinated disclosure e canale di fallback. **Completato quando:** un ricercatore sa cosa segnalare, come e con quali aspettative.

- [ ] **SEC-13 — Proteggere file e branch sensibili.** Aggiungere `CODEOWNERS` per workflow, lockfile, `SECURITY.md` e contenuti offensivi; verificare e abilitare ruleset/branch protection con CI obbligatoria e review. **Nota:** l'API del repository non consente di confermare l'attuale branch protection; questa attività va verificata nelle impostazioni GitHub.

- [ ] **SEC-14 — Produrre release verificabili.** Allegare SBOM, checksum e attestazione di provenienza agli artifact/release, con changelog e versionamento semantico. **Completato quando:** ogni release è riconducibile a commit e workflow verificati.

- [ ] **SEC-15 — Verificare dinamicamente il deploy.** Eseguire OWASP ZAP Baseline non autenticato o controllo equivalente sulla preview e testare CSP/header dopo ogni modifica di hosting. **Completato quando:** i finding sono archiviati e confrontabili tra release.

- [ ] **SEC-16 — Formalizzare la revisione dei contenuti offensivi.** Conservare simulazioni deterministiche e non esecutive, marcatura “simulazione”, prerequisiti di autorizzazione, difese e limiti; revisionare periodicamente comandi e payload per evitare istruzioni immediatamente riutilizzabili contro terzi. **Completato quando:** una checklist editoriale accompagna ogni nuovo scenario.

---

## 💻 Miglioramenti di Ingegneria del Software (A cura del Senior Engineer)

**Priorità complessiva: medio/alta.** L'architettura è già valida; il lavoro consiste nel ripristinare una baseline riproducibile e ridurre l'accoppiamento dei moduli più grandi.

### P0 — Baseline affidabile e riproducibile

- [ ] **ENG-01 — Ripristinare la CI verde e allineare Node.** Portare CI, `package.json#engines`, `.nvmrc` e README a Node 22.22.2+ oppure 24 LTS/supportato; aggiungere `packageManager`. Un downgrade di jsdom è possibile ma meno coerente con la toolchain corrente. **Completato quando:** type-check, lint, 38 file di test/239 test e build terminano con successo in locale e GitHub Actions.

- [ ] **ENG-02 — Rendere deterministica la gestione delle dipendenze.** Mantenere `npm ci`, aggiornare il lockfile solo in PR dedicate e documentare la policy di audit, incluse differenze tra dipendenze runtime e development. **Completato quando:** una nuova installazione usa versioni e runtime dichiarati e produce lo stesso esito della CI.

### P1 — Manutenibilità, tipi e test

- [ ] **ENG-03 — Attivare TypeScript strict in modo incrementale.** Abilitare `strict`, poi `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` e `noFallthroughCasesInSwitch`; rimuovere `allowJs`, decorator flag e opzioni inutilizzate dopo verifica. Correggere l'alias `@/*` verso `src/*` o eliminarlo. **Completato quando:** `tsc --noEmit` passa senza nuovi `any`, `@ts-ignore` o cast non motivati.

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
| **Sprint 0 — Stabilizzazione** | 1–3 giorni | Ripristinare una baseline affidabile | ENG-01, ENG-02, SEC-01, SEC-03, SEC-04 | CI verde; runtime e README coerenti; audit governato |
| **Sprint 1 — Sicurezza e accessibilità** | 1–2 settimane | Chiudere i rischi immediati | SEC-02, SEC-05–SEC-10, UX-01–UX-05 | Input limitati; header verificati; modali e ricerca accessibili |
| **Sprint 2 — Architettura** | 2–4 settimane | Ridurre accoppiamento e duplicazioni | ENG-03–ENG-10, UX-06–UX-12 | registry viste, routing, state machine ed error boundary operativi |
| **Sprint 3 — Quality gates** | 1–2 settimane | Rendere qualità e contenuti misurabili | ENG-11–ENG-13, SEC-11–SEC-13, UX-16–UX-17 | coverage, E2E, content validation e threat model in CI |
| **Backlog evolutivo** | Dopo le metriche | Performance, design system e release | ENG-14–ENG-18, SEC-14–SEC-16, UX-13–UX-15 | miglioramenti dimostrati da metriche e release verificabili |

### Ordine di dipendenza consigliato

1. Ripristinare runtime e CI prima di aggiungere nuovi quality gate.
2. Aggiornare le dipendenze prima di fissare gli SHA e introdurre l'audit bloccante.
3. Creare la registry delle viste prima di routing e rifinitura della navigazione.
4. Estrarre logica e dati prima di impostare soglie di coverage significative.
5. Correggere modali, combobox e focus prima di rendere axe bloccante.
6. Misurare bundle e runtime prima di introdurre memoizzazione o virtualizzazione.

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
- [ ] Le simulazioni restano client-side, deterministiche, non esecutive e chiaramente contestualizzate come attività autorizzate.

---

## Registro delle Decisioni

| Data | Decisione | Motivazione |
|---|---|---|
| 2026-09-24 | Roadmap basata sulla SPA React/TypeScript, non su `script.py` | Il file non è presente nel branch `main`; la struttura reale è già un'applicazione web evoluta |
| 2026-09-24 | Priorità iniziale a CI/runtime e supply chain | La CI di `main` è rossa e la toolchain di sviluppo presenta advisory verificati |
| 2026-09-24 | Nessun backend o traffico offensivo introdotto | Non necessari alle funzionalità attuali e aumenterebbero superficie d'attacco e responsabilità operative |

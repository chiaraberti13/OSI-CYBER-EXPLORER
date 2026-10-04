---
name: roadmap-next
description: Avanza la roadmap di OSI-CYBER-EXPLORER. Usala ogni volta che il compito è completare il prossimo punto non spuntato di ROADMAP.md, verificarlo, spuntarlo e fare commit e push su main.
---

# Prossimo punto della roadmap — OSI-CYBER-EXPLORER

Procedura per una sessione automatica che deve chiudere **un** punto di `ROADMAP.md`
e pubblicarlo su `main` senza intervento umano. Segui i passi in ordine.

## 1. Allinea il repository

```bash
git checkout main
git pull --rebase origin main
npm ci --ignore-scripts
```

Lavora sempre partendo dall'ultimo `main`: altre esecuzioni pianificate possono aver
spuntato punti poco prima di te.

## 2. Scegli il punto giusto

Trova i candidati con:

```bash
grep -n -E '^\s*[-*] \[ \]' ROADMAP.md | head -20
```

Il punto da fare è il **primo vero task** non spuntato, in ordine di documento, con
queste eccezioni:

- **Salta la sezione `## Legenda`** in cima: le righe `- [ ] Da iniziare`,
  `- [~] In corso`, `- [x] Completato` sono la legenda, non task. I task veri hanno
  un ID in grassetto, es. `**ENG-06 — ...**`.
- I punti `[~]` sono in corso: se uno precede il primo `[ ]` reale ed è lavorabile,
  completalo prima.
- **Salta** i punti che non si possono chiudere da una sessione cloud: richiedono
  account o servizi esterni da attivare (Vercel, impostazioni GitHub, branch
  protection), credenziali reali, hardware, laboratorio live o decisioni della
  proprietaria. Passa al successivo e segnalalo nel resoconto finale.
- Se un punto è troppo grande per una sola sessione, completa una parte coerente e
  verificata e marcalo come **parziale** con la convenzione del repository (vedi
  sotto), mai come completato.

Prima di scrivere codice rileggi il punto, la sua sezione e il criterio di
completamento: il lavoro è finito solo quando quel criterio è soddisfatto.

## 3. Implementa

- Ogni task ha un criterio **"Completato quando:"**: è la definizione di fatto, e di
  solito richiede test che lo verifichino.
- Stack: React 19, TypeScript strict, Vite, Tailwind 4, Zustand, Vitest. UI in
  `src/components`, contenuti in `src/content`, logica pura testabile in `src/lib`.
- L'app è bilingue: ogni testo per l'utente va in italiano e inglese.
- I contenuti offensivi devono restare didattici: `npm run verify:offensive-content`
  li controlla. Se modifichi il lockfile, deve passare `npm run verify:lockfile`.
- Aggiorna `CHANGELOG.md` per modifiche visibili all'utente.

## 4. Verifica

Esegui i controlli che la CI esegue su questo repository e correggi ogni errore prima
di proseguire:

```bash
npm run verify
```

`npm run verify` esegue lockfile, metadati di release, sicurezza del deploy,
target della documentazione, revisione dei contenuti offensivi, typecheck, lint,
test e build. Se fallisce solo per mancanza di rete, esegui almeno
`npm run typecheck && npm run lint && npm test && npm run build`.

Se un controllo fallisce per cause preesistenti estranee al punto (verificabile
eseguendolo anche su `main` senza le tue modifiche), non nasconderlo: annotalo nel
resoconto.

## 5. Aggiorna ROADMAP.md

Sostituisci `- [ ]` con `- [x]` sulla riga del task. Se completi solo una parte
usa `- [~]` e aggiungi in coda al task cosa resta da fare.

## 6. Commit e push

```bash
git add -A
git status            # controlla che non ci siano file temporanei, .env o segreti
git commit            # messaggio secondo la convenzione sotto
git pull --rebase origin main
git push origin main
```

Convenzione dei messaggi: Conventional Commits in inglese con scope e ID tra parentesi, es.
`refactor(ports): split PortsExplorer into content, lib and panels (ENG-04)`; per
un lavoro parziale `(ENG-03, partial)`.

Se il push viene rifiutato perché `main` è avanzato, ripeti `git pull --rebase`,
risolvi gli eventuali conflitti (in `ROADMAP.md` tieni le spunte di entrambi), riesegui
i test interessati e ripeti il push. **Mai** `--force`, mai riscrivere la storia di
`main`, mai `--no-verify`.

## 7. Resoconto

Chiudi con un riepilogo breve: punto scelto (con ID), file modificati, controlli
eseguiti con esito, hash del commit ed esito del push, punti saltati e perché.

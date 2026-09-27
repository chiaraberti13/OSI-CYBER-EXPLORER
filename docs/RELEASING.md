# Verifiable release process / Processo di release verificabile

## English

OSI Cyber Explorer uses Semantic Versioning and publishes a release only from a tag named `vMAJOR.MINOR.PATCH` (prerelease identifiers are supported). The tag, `package.json` version, and matching dated `CHANGELOG.md` section must agree exactly.

### Maintainer procedure

1. Run `npm version --no-git-tag-version MAJOR.MINOR.PATCH` to update `package.json` and `package-lock.json` without creating a tag.
2. Move the release notes from `Unreleased` into `## [MAJOR.MINOR.PATCH] - YYYY-MM-DD` in `CHANGELOG.md`.
3. Merge the version change into `main` only after all required reviews and checks pass.
4. Create the tag on that exact `main` commit, preferably as an annotated tag: `git tag -a vMAJOR.MINOR.PATCH -m "OSI Cyber Explorer vMAJOR.MINOR.PATCH"`.
5. Push only the tag: `git push origin vMAJOR.MINOR.PATCH`.

The release workflow rejects malformed or inconsistent versions and tags not contained in `origin/main`. It reinstalls dependencies without lifecycle scripts, executes the complete verification suite and audits, creates a deterministic archive, generates a CycloneDX SBOM, and produces GitHub/Sigstore attestations for both build provenance and the SBOM. The release and the retained workflow artifact contain:

- `osi-cyber-explorer-VERSION.tar.gz`;
- `osi-cyber-explorer-VERSION-sbom.cdx.json`;
- `osi-cyber-explorer-VERSION-provenance.intoto.jsonl`;
- `osi-cyber-explorer-VERSION-sbom-attestation.intoto.jsonl`;
- `SHA256SUMS.txt` covering all four files.

Verify the downloaded files with `sha256sum -c SHA256SUMS.txt`. Verify online provenance with `gh attestation verify osi-cyber-explorer-VERSION.tar.gz -R chiaraberti13/OSI-CYBER-EXPLORER`. GitHub links the signed statement to the source repository, commit, and workflow run; no long-lived signing key is stored in the repository.

## Italiano

OSI Cyber Explorer adotta il versionamento semantico e pubblica una release soltanto da un tag `vMAJOR.MINOR.PATCH` (sono supportati anche identificatori prerelease). Tag, versione in `package.json` e sezione datata corrispondente in `CHANGELOG.md` devono coincidere esattamente.

### Procedura per il maintainer

1. Esegui `npm version --no-git-tag-version MAJOR.MINOR.PATCH` per aggiornare `package.json` e `package-lock.json` senza creare il tag.
2. Sposta le note da `Unreleased` a `## [MAJOR.MINOR.PATCH] - YYYY-MM-DD` in `CHANGELOG.md`.
3. Integra il cambio versione in `main` soltanto dopo review e controlli obbligatori verdi.
4. Crea il tag sullo stesso commit di `main`, preferibilmente annotato: `git tag -a vMAJOR.MINOR.PATCH -m "OSI Cyber Explorer vMAJOR.MINOR.PATCH"`.
5. Pubblica soltanto il tag: `git push origin vMAJOR.MINOR.PATCH`.

Il workflow rifiuta versioni incoerenti, tag malformati e commit non contenuti in `origin/main`. Reinstalla le dipendenze senza lifecycle script, esegue verifiche e audit completi, crea un archivio deterministico, genera la SBOM CycloneDX e produce attestazioni GitHub/Sigstore sia per la provenienza della build sia per la SBOM. Release e artifact del workflow contengono i cinque file elencati nella sezione inglese.

Verifica i download con `sha256sum -c SHA256SUMS.txt`. Verifica online la provenienza con `gh attestation verify osi-cyber-explorer-VERSION.tar.gz -R chiaraberti13/OSI-CYBER-EXPLORER`. La dichiarazione firmata collega repository sorgente, commit e workflow senza conservare chiavi di firma a lunga durata nel progetto.

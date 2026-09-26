<p align="center"><img src="assets/banner.svg" alt="OSI Cyber Explorer" width="100%"></p>

<p align="center"><a href="#-english">🇬🇧 English</a> · <a href="#-italiano">🇮🇹 Italiano</a></p>

<p align="center"><img src="https://img.shields.io/badge/security-responsible%20disclosure-22D3EE?style=flat-square" alt="Responsible disclosure"></p>

<p align="center"><a href="README.md">Project README</a> · <a href="LICENSE">MIT Licence</a></p>

---

## 🇬🇧 English

Report suspected vulnerabilities privately through [GitHub Security Advisories](https://github.com/chiaraberti13/OSI-Cyber-Explorer/security/advisories/new). Include the affected commit, browser, reproducible steps and sanitized console output. Do not publish unpatched vulnerabilities in issues.

The laboratory is educational and client-side. Test attack concepts only in controlled environments you own or are explicitly authorized to use.

### Deployment hardening

The production security headers are versioned in [`vercel.json`](vercel.json). The enforced Content Security Policy allows scripts and connections only from the application origin; the guide image is temporarily limited to `images.unsplash.com`. Inline styles remain enabled because Motion uses element style attributes. Trusted Types enforcement is monitored through a separate Report-Only policy.

After a production deployment, verify the effective headers with:

```bash
curl --head https://osi-cyber-explorer.vercel.app/
```

---

## 🇮🇹 Italiano

Segnala privatamente le vulnerabilità sospette tramite [GitHub Security Advisories](https://github.com/chiaraberti13/OSI-Cyber-Explorer/security/advisories/new). Indica commit, browser, passaggi riproducibili e output della console privo di dati sensibili. Non pubblicare vulnerabilità non corrette nelle issue.

Il laboratorio è didattico e funziona lato client. Sperimenta i concetti di attacco esclusivamente in ambienti controllati di tua proprietà o per i quali possiedi un’autorizzazione esplicita.

### Hardening del deployment

Gli header di sicurezza della produzione sono versionati in [`vercel.json`](vercel.json). La Content Security Policy applicata consente script e connessioni solo dall'origine dell'applicazione; l'immagine della guida è temporaneamente limitata a `images.unsplash.com`. Gli stili inline restano abilitati perché Motion usa attributi `style` sugli elementi. L'applicazione di Trusted Types viene monitorata tramite una policy Report-Only separata.

Dopo un deployment di produzione, verifica gli header effettivi con:

```bash
curl --head https://osi-cyber-explorer.vercel.app/
```

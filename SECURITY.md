# Security Policy

## Supported versions

Security fixes target the latest revision on the default branch unless a release is explicitly documented as supported.

## Scope

The client-side React application, educational datasets, routing/state logic, attack-defense content, build pipeline, deployment configuration and dependency supply chain.

## Reporting

Do not open a public issue for an unpatched vulnerability. Use GitHub private vulnerability reporting / Security Advisories when available. Include the affected commit/version, impact, minimal reproducible proof, environment assumptions and possible mitigations. Remove unrelated sensitive data.

## Responsible testing

Test only systems, data, devices and networks you own or are explicitly authorized to assess. No denial of service, destructive actions, persistence, social engineering, unauthorized interception or third-party access.

## Security requirements

Keep secrets outside source control; validate untrusted input; preserve authorization/scope checks; review dependency and CI changes; prefer reproducible builds; never present partial or unverified evidence as a confirmed fact. Do not introduce copy-pasteable attack targets, active exploit payloads or public IP/domain examples that bypass the repository's documentation-target controls.

## Disclosure

Allow reasonable remediation time and coordinate publication of exploit-enabling details.

## Private reporting process

Use **Report a vulnerability** in the repository Security tab if private reporting is available. Otherwise use a verified private contact published by the repository owner. If no private contact is available, open a public issue asking only for a private contact, without vulnerability details. Do not publish exploit details, credentials, personal data or sensitive logs in public issues.

Include the affected revision, environment, impact and minimal synthetic reproduction. Coordinate disclosure with the maintainer. Acknowledgement and remediation depend on availability and severity; no fixed response deadline is guaranteed.

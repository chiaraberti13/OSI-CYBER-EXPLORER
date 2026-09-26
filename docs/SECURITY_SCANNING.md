# Security scanning policy

This policy defines the automated security checks for OSI Cyber Explorer and how a finding may be temporarily accepted. The checks run on `main`, on every pull request and weekly unless noted otherwise.

## Controls

| Control | Tool | Result | Merge policy |
|---|---|---|---|
| Static application security testing | CodeQL, JavaScript/TypeScript `security-extended` suite | SARIF in GitHub Code scanning | Review every alert; enable severity-based merge protection when repository rules support it |
| Dependency gate | `npm audit --audit-level=high` | Readable job log and failing check | High/Critical findings block the workflow |
| Dependency intelligence | OSV-Scanner | PR annotations, SARIF and downloadable JSON/SARIF artifacts | Informational during the initial rollout; PR reports contain only newly introduced vulnerabilities |
| Secret detection | Gitleaks with its default rules | Job summary; SARIF artifact when a leak is found | Any detected secret blocks the workflow and must be rotated, not merely deleted |
| Software bill of materials | Anchore Syft | CycloneDX JSON workflow artifact retained for 14 days | Generation failure blocks the workflow |
| Update discovery | Dependabot | Weekly npm and GitHub Actions pull requests | Review lockfile/action SHA changes before merging |

All third-party actions are pinned to full, verified commit SHAs. Dependabot proposes controlled updates without weakening immutable pins.

## Versioned exceptions

No exception is active by default. A suppression is acceptable only when all of the following are committed in the same pull request:

1. A narrowly scoped scanner rule: `[[IgnoredVulns]]` in `osv-scanner.toml` or an allowlist in `.gitleaks.toml`. Do not use broad path exclusions.
2. A matching entry in `.github/security-exceptions.yml` containing `tool`, `finding_id`, `scope`, `owner`, `reason`, `compensating_control`, `approved_by`, `created`, and `expires`.
3. Evidence that no safe fix is currently available and a follow-up issue or pull request.

The expiry must be a concrete ISO 8601 date and no later than 90 days after creation. Expired exceptions must be removed or explicitly reviewed and renewed. An `npm audit` High/Critical finding has no automatic bypass: introducing an exception requires a reviewed workflow change plus the ledger entry, so it cannot be silently ignored.

Example ledger entry (documentation only):

```yaml
exceptions:
  - tool: osv
    finding_id: GHSA-xxxx-xxxx-xxxx
    scope: package-name@version
    owner: github-handle
    reason: No fixed version is available; affected code path is unreachable.
    compensating_control: The vulnerable feature is disabled and covered by a regression test.
    approved_by: github-handle
    created: 2026-09-26
    expires: 2026-10-26
```

## Response to findings

- Treat a leaked credential as compromised: revoke or rotate it first, then remove it from code and history where appropriate.
- Prefer a direct dependency update that preserves the lockfile over `npm audit fix --force`.
- Link remediation commits to the advisory or rule identifier so later reviews can reconstruct the decision.
- If a scanner fails to execute or produce its report, treat that as a failed security check rather than a clean scan.


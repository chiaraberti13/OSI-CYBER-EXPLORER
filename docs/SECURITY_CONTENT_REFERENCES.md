# Security content references

## Scope

Attack scenarios and defensive controls carry machine-readable references instead of embedding source names in prose. The shared shape is:

```ts
type SecurityReference = {
  kind: 'rfc' | 'ieee' | 'nist' | 'attack' | 'cisco';
  id: string;
};
```

`src/content/securityReferences.ts` is the source of truth for identifiers, authoritative URLs, and review metadata. `src/lib/content.test.ts` rejects missing references, invalid identifiers, duplicate entries, non-HTTPS URLs, and authorities outside IETF, IEEE, NIST, MITRE ATT&CK, and Cisco.

## Editorial rules

- Prefer the narrowest source that actually supports the statement: an RFC for protocol behavior, IEEE for link-layer standards, NIST for control guidance, and ATT&CK for adversary behavior.
- A reference supports the educational description; it does not mean that the whole document or technique is equivalent to the scenario.
- New attack scenarios require at least one direct reference in `ATTACK_SCENARIO_REFERENCES`.
- Every defensive control retains the NIST SP 800-53 Rev. 5 baseline. Add a narrower reference when a control makes protocol- or vendor-specific claims.
- ATT&CK identifiers are reviewed against a pinned release. Do not silently change the pinned version when adding a technique.

## Review baseline

- MITRE ATT&CK Enterprise: **v19.2**, released 6 August 2026 and reviewed 10 October 2026.
- NIST SP 800-53 Rev. 5 is the minimum defensive-control catalog baseline.
- RFC links resolve through the IETF Datatracker; IEEE, NIST, ATT&CK, and Cisco links resolve only to their official domains.

The version pin makes later ATT&CK renames, deprecations, and identifier changes visible during NET-08 periodic content review.

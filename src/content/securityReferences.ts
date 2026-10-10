export type SecurityReferenceKind = 'rfc' | 'ieee' | 'nist' | 'attack' | 'cisco';

export interface SecurityReference {
  kind: SecurityReferenceKind;
  id: string;
}

/** Version reviewed for the ATT&CK technique identifiers used by the app. */
export const MITRE_ATTACK_VERSION = '19.2' as const;
export const MITRE_ATTACK_REVIEWED_ON = '2026-10-10' as const;

const nistSlug = (id: string): string => {
  const match = id.match(/^SP (\d+)-(\d+)([A-Z]?)(?: Rev\. (\d+))?$/);
  if (!match) return encodeURIComponent(id.toLowerCase());
  const [, series, publication, suffix, revision] = match;
  return `sp/${series}/${publication}${suffix ? `/${suffix.toLowerCase()}` : ''}${revision ? `/r${revision}` : ''}`;
};

/** Returns the authoritative landing page for a validated structured reference. */
export function securityReferenceUrl(reference: SecurityReference): string {
  switch (reference.kind) {
    case 'rfc':
      return `https://datatracker.ietf.org/doc/html/${reference.id.toLowerCase().replace(' ', '')}`;
    case 'ieee':
      return `https://standards.ieee.org/standard/${reference.id.replace('IEEE ', '').replaceAll('.', '_')}.html`;
    case 'nist':
      return `https://csrc.nist.gov/pubs/${nistSlug(reference.id)}/final`;
    case 'attack': {
      const [technique, subtechnique] = reference.id.split('.');
      return `https://attack.mitre.org/techniques/${technique}/${subtechnique ? `${subtechnique}/` : ''}`;
    }
    case 'cisco':
      return `https://www.cisco.com/c/en/us/search.html#q=${encodeURIComponent(reference.id)}`;
  }
}

export const ATTACK_SCENARIO_REFERENCES = {
  'l1-jamming': [{ kind: 'nist', id: 'SP 800-153' }],
  'l1-tapping': [{ kind: 'nist', id: 'SP 800-53 Rev. 5' }],
  'l2-mitm': [{ kind: 'attack', id: 'T1557.002' }],
  'l2-mac-flood': [{ kind: 'nist', id: 'SP 800-115' }],
  'l2-dhcp-starve': [{ kind: 'nist', id: 'SP 800-115' }],
  'l3-spoofing': [{ kind: 'rfc', id: 'RFC 2827' }],
  'l3-smurf': [{ kind: 'rfc', id: 'RFC 2644' }],
  'l3-frag': [{ kind: 'rfc', id: 'RFC 1858' }],
  'l4-dos': [{ kind: 'rfc', id: 'RFC 4987' }],
  'l4-udp-flood': [{ kind: 'attack', id: 'T1498.001' }],
  'l4-scan': [{ kind: 'attack', id: 'T1046' }],
  'l5-replay': [{ kind: 'nist', id: 'SP 800-63B' }],
  'l5-hijacking': [{ kind: 'attack', id: 'T1539' }],
  'l6-oracle': [{ kind: 'nist', id: 'SP 800-38A' }],
  'l7-injection': [{ kind: 'attack', id: 'T1190' }],
  'l7-xss': [{ kind: 'attack', id: 'T1059.007' }],
  'l7-homograph': [{ kind: 'rfc', id: 'RFC 5890' }],
  'l7-dns-poison': [{ kind: 'rfc', id: 'RFC 5452' }],
  'l7-slowloris': [{ kind: 'attack', id: 'T1499.003' }],
  'l4-tcp-reset': [{ kind: 'rfc', id: 'RFC 5961' }],
  'l3-pod': [{ kind: 'rfc', id: 'RFC 8200' }],
  'l3-bgp-hijack': [{ kind: 'rfc', id: 'RFC 7454' }],
  'l7-ssh-brute': [{ kind: 'attack', id: 'T1110.001' }],
  'l7-smtp-relay': [{ kind: 'rfc', id: 'RFC 5321' }],
  'l7-ftp-sniffing': [{ kind: 'rfc', id: 'RFC 2577' }],
} as const satisfies Record<string, readonly SecurityReference[]>;

/** Baseline catalog used for every defensive control; specific technique links remain in techniqueIds. */
export const DEFENSIVE_CONTROL_BASELINE_REFERENCES = [
  { kind: 'nist', id: 'SP 800-53 Rev. 5' },
] as const satisfies readonly SecurityReference[];

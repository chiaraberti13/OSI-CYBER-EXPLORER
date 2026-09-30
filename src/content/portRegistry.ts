export type TransportProtocol = 'TCP' | 'UDP' | 'SCTP';
export type PortRange = 'well-known' | 'registered' | 'dynamic';
export type PortRegistrationStatus = 'assigned' | 'reserved' | 'unassigned' | 'de-facto';

export interface LocalizedText {
  en: string;
  it: string;
}

export interface SecurePortAlternative {
  ports: readonly number[];
  service: string;
  transports: readonly TransportProtocol[];
}

export interface PortRegistryMetadata {
  service: string;
  ports: readonly number[];
  transports: readonly TransportProtocol[];
  range: PortRange;
  registrationStatus: PortRegistrationStatus;
  ianaServiceNames: readonly string[];
  verifiedOn: string;
  encryptedEquivalent: SecurePortAlternative | null;
  ambiguity?: LocalizedText;
}

export const IANA_PORT_REGISTRY_UPDATED_ON = '2026-09-28';
export const PORT_REGISTRY_VERIFIED_ON = '2026-09-30';
export const IANA_PORT_REGISTRY_SOURCE = 'Service Name and Transport Protocol Port Number Registry';

export function classifyPortRange(port: number): PortRange {
  if (!Number.isInteger(port) || port < 0 || port > 65_535) throw new Error('INVALID_PORT');
  if (port <= 1_023) return 'well-known';
  if (port <= 49_151) return 'registered';
  return 'dynamic';
}

type EntryOptions = {
  status?: PortRegistrationStatus;
  iana: readonly string[];
  encrypted?: SecurePortAlternative | null;
  ambiguity?: LocalizedText;
};

const secure = (
  ports: readonly number[],
  service: string,
  transports: readonly TransportProtocol[]
): SecurePortAlternative => ({ ports, service, transports });

function entry(
  service: string,
  ports: readonly number[],
  transports: readonly TransportProtocol[],
  options: EntryOptions
): PortRegistryMetadata {
  const ranges = new Set(ports.map(classifyPortRange));
  if (ranges.size !== 1) throw new Error(`PORT_RANGE_CROSSED:${service}`);
  return {
    service,
    ports,
    transports,
    range: [...ranges][0],
    registrationStatus: options.status ?? 'assigned',
    ianaServiceNames: options.iana,
    verifiedOn: PORT_REGISTRY_VERIFIED_ON,
    encryptedEquivalent: options.encrypted ?? null,
    ambiguity: options.ambiguity
  };
}

/**
 * Curated teaching subset checked against the IANA registry identified above.
 * `transports` describes the protocol pairing represented by this UI entry, not
 * every historical IANA pairing that may exist for the same numeric port.
 */
export const PORT_REGISTRY_METADATA: readonly PortRegistryMetadata[] = [
  entry('FTP Data', [20], ['TCP'], { iana: ['ftp-data'], encrypted: secure([22], 'SFTP', ['TCP']) }),
  entry('FTP Control', [21], ['TCP'], { iana: ['ftp'], encrypted: secure([22], 'SFTP', ['TCP']) }),
  entry('SSH', [22], ['TCP'], { iana: ['ssh'] }),
  entry('Telnet', [23], ['TCP'], { iana: ['telnet'], encrypted: secure([22], 'SSH', ['TCP']) }),
  entry('SMTP', [25], ['TCP'], { iana: ['smtp'], encrypted: secure([465], 'Message Submission over TLS', ['TCP']) }),
  entry('TACACS+', [49], ['TCP'], { iana: ['tacacs'] }),
  entry('DNS', [53], ['TCP', 'UDP'], { iana: ['domain'], encrypted: secure([853], 'DNS over TLS', ['TCP']) }),
  entry('DHCP', [67, 68], ['UDP'], { iana: ['bootps', 'bootpc'] }),
  entry('TFTP', [69], ['UDP'], { iana: ['tftp'], encrypted: secure([22], 'SFTP', ['TCP']) }),
  entry('HTTP', [80], ['TCP'], { iana: ['http'], encrypted: secure([443], 'HTTPS', ['TCP', 'UDP']) }),
  entry('Kerberos', [88], ['TCP', 'UDP'], { iana: ['kerberos'] }),
  entry('POP3', [110], ['TCP'], { iana: ['pop3'], encrypted: secure([995], 'POP3 over TLS', ['TCP']) }),
  entry('NNTP', [119], ['TCP'], { iana: ['nntp'], encrypted: secure([563], 'NNTP over TLS', ['TCP']) }),
  entry('NTP', [123], ['UDP'], { iana: ['ntp'] }),
  entry('MS RPC', [135], ['TCP', 'UDP'], { iana: ['epmap'] }),
  entry('NetBIOS-NS', [137], ['TCP', 'UDP'], { iana: ['netbios-ns'] }),
  entry('NetBIOS-DGM', [138], ['UDP'], { iana: ['netbios-dgm'] }),
  entry('NetBIOS-SSN', [139], ['TCP'], { iana: ['netbios-ssn'] }),
  entry('IMAP', [143], ['TCP'], { iana: ['imap'], encrypted: secure([993], 'IMAP over TLS', ['TCP']) }),
  entry('SNMP', [161], ['UDP'], { iana: ['snmp'], encrypted: secure([161], 'SNMPv3 authPriv', ['UDP']) }),
  entry('SNMP Trap', [162], ['UDP'], { iana: ['snmptrap'], encrypted: secure([162], 'SNMPv3 authPriv traps', ['UDP']) }),
  entry('BGP', [179], ['TCP'], { iana: ['bgp'] }),
  entry('LDAP', [389], ['TCP', 'UDP'], { iana: ['ldap'], encrypted: secure([636], 'LDAP over TLS', ['TCP']) }),
  entry('HTTPS', [443], ['TCP', 'UDP'], { iana: ['https'] }),
  entry('SMB', [445], ['TCP'], { iana: ['microsoft-ds'], encrypted: secure([445], 'SMB 3 encryption', ['TCP']) }),
  entry('SMTPS', [465], ['TCP'], {
    iana: ['submissions', 'urd'],
    ambiguity: {
      en: 'TCP 465 has multiple IANA service names; this card represents Message Submission over TLS (submissions).',
      it: 'TCP 465 ha più nomi di servizio IANA; questa scheda rappresenta Message Submission over TLS (submissions).'
    }
  }),
  entry('Syslog', [514], ['UDP'], { iana: ['syslog'], encrypted: secure([6514], 'Syslog over TLS', ['TCP']) }),
  entry('SMTP Submission', [587], ['TCP'], { iana: ['submission'], encrypted: secure([587], 'Message Submission with STARTTLS', ['TCP']) }),
  entry('LDAPS', [636], ['TCP'], { iana: ['ldaps'] }),
  entry('IMAPS', [993], ['TCP'], { iana: ['imaps'] }),
  entry('POP3S', [995], ['TCP'], { iana: ['pop3s'] }),
  entry('MSSQL', [1433], ['TCP'], { iana: ['ms-sql-s'], encrypted: secure([1433], 'Microsoft SQL Server with TLS', ['TCP']) }),
  entry('Oracle DB', [1521], ['TCP'], {
    status: 'de-facto',
    iana: ['ncube-lm'],
    encrypted: secure([1521], 'Oracle Net with native encryption or TLS', ['TCP']),
    ambiguity: {
      en: 'Oracle commonly uses TCP 1521, but IANA assigns this pair to ncube-lm and records unauthorized use.',
      it: 'Oracle usa comunemente TCP 1521, ma IANA assegna la coppia a ncube-lm e ne registra l’uso non autorizzato.'
    }
  }),
  entry('RADIUS Auth (Alt)', [1645], ['UDP'], {
    status: 'de-facto',
    iana: ['sightline'],
    ambiguity: {
      en: 'Legacy RADIUS deployments use UDP 1645, but IANA assigns it to sightline; use UDP 1812 for new deployments.',
      it: 'Installazioni RADIUS legacy usano UDP 1645, ma IANA la assegna a sightline; per nuove installazioni usare UDP 1812.'
    }
  }),
  entry('RADIUS Acct (Alt)', [1646], ['UDP'], {
    status: 'de-facto',
    iana: ['sa-msg-port'],
    ambiguity: {
      en: 'Legacy RADIUS accounting uses UDP 1646, but IANA assigns it to sa-msg-port; use UDP 1813 for new deployments.',
      it: 'Il RADIUS accounting legacy usa UDP 1646, ma IANA la assegna a sa-msg-port; per nuove installazioni usare UDP 1813.'
    }
  }),
  entry('RADIUS Auth', [1812], ['UDP'], { iana: ['radius'] }),
  entry('RADIUS Acct', [1813], ['UDP'], { iana: ['radius-acct'] }),
  entry('Vite / Dev Server', [3000], ['TCP'], {
    status: 'de-facto',
    iana: ['hbci', 'remoteware-cl'],
    ambiguity: {
      en: 'Vite and other development servers use TCP 3000 by convention; IANA registers HBCI and also records widespread RemoteWare use.',
      it: 'Vite e altri server di sviluppo usano TCP 3000 per convenzione; IANA registra HBCI e annota anche l’uso diffuso di RemoteWare.'
    }
  }),
  entry('MySQL', [3306], ['TCP'], { iana: ['mysql'], encrypted: secure([3306], 'MySQL with TLS', ['TCP']) }),
  entry('RDP', [3389], ['TCP', 'UDP'], { iana: ['ms-wbt-server'], encrypted: secure([3389], 'RDP with TLS and NLA', ['TCP', 'UDP']) }),
  entry('PostgreSQL', [5432], ['TCP'], { iana: ['postgresql'], encrypted: secure([5432], 'PostgreSQL with TLS', ['TCP']) }),
  entry('Redis', [6379], ['TCP'], { iana: ['redis'], encrypted: secure([6379], 'Redis with TLS', ['TCP']) }),
  entry('Syslog over TLS', [6514], ['TCP'], { iana: ['syslog-tls'] }),
  entry('HTTP Alternate', [8080], ['TCP'], { iana: ['http-alt'], encrypted: secure([443], 'HTTPS', ['TCP', 'UDP']) }),
  entry('MongoDB', [27017], ['TCP'], { iana: ['mongodb'], encrypted: secure([27017], 'MongoDB with TLS', ['TCP']) })
];

export function validatePortRegistry(entries: readonly PortRegistryMetadata[]): string[] {
  const errors: string[] = [];
  const pairs = new Set<string>();

  for (const item of entries) {
    if (!item.service || item.ports.length === 0 || item.transports.length === 0) {
      errors.push(`incomplete:${item.service || '<missing>'}`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.verifiedOn)) errors.push(`date:${item.service}`);
    if (item.ports.some(port => classifyPortRange(port) !== item.range)) errors.push(`range:${item.service}`);
    if (item.registrationStatus === 'assigned' && item.ianaServiceNames.length === 0) {
      errors.push(`iana-name:${item.service}`);
    }
    if (item.registrationStatus !== 'assigned' && !item.ambiguity) errors.push(`status-note:${item.service}`);

    for (const port of item.ports) {
      for (const transport of item.transports) {
        const key = `${port}/${transport}`;
        if (pairs.has(key)) errors.push(`duplicate:${key}`);
        pairs.add(key);
      }
    }

    for (const port of item.encryptedEquivalent?.ports ?? []) {
      try {
        classifyPortRange(port);
      } catch {
        errors.push(`encrypted-port:${item.service}`);
      }
    }
  }

  return errors;
}

export function mergePortRegistry<T extends { service: string }>(content: readonly T[]): Array<T & PortRegistryMetadata> {
  const metadata = new Map(PORT_REGISTRY_METADATA.map(item => [item.service, item]));
  const merged = content.map(item => {
    const normative = metadata.get(item.service);
    if (!normative) throw new Error(`MISSING_PORT_METADATA:${item.service}`);
    return { ...item, ...normative };
  });
  const contentNames = new Set(content.map(item => item.service));
  const orphan = PORT_REGISTRY_METADATA.find(item => !contentNames.has(item.service));
  if (orphan) throw new Error(`MISSING_PORT_CONTENT:${orphan.service}`);
  return merged;
}

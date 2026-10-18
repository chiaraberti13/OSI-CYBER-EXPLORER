import { describe, expect, it } from 'vitest';
import { filterPorts } from '../lib/portsFilter';
import { PORT_REGISTRY } from './portContent';

describe('reviewed port catalogue security semantics', () => {
  it.each(['it', 'en'] as const)('keeps legacy TACACS+ in the review filter (%s)', (language) => {
    expect(filterPorts(PORT_REGISTRY, 'all', 'TACACS+', language, 'secure')).toEqual([]);
    expect(filterPorts(PORT_REGISTRY, 'all', 'TACACS+', language, 'review')).toHaveLength(1);
  });

  it('keeps the encrypted SMTP relay option on the relay port', () => {
    expect(PORT_REGISTRY.find((port) => port.service === 'SMTP')?.encryptedEquivalent).toMatchObject({
      ports: [25],
      service: 'SMTP relay with STARTTLS',
      transports: ['TCP']
    });
  });

  it.each(['it', 'en'] as const)('searches revised PostgreSQL authentication advice (%s)', (language) => {
    expect(filterPorts(PORT_REGISTRY, 'all', 'SCRAM-SHA-256', language).map((port) => port.service)).toEqual([
      'PostgreSQL'
    ]);
  });
});

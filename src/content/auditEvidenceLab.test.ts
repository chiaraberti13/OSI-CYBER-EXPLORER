import { describe, expect, it } from 'vitest';
import {
  cleanupAuditSession,
  collectAuditEvidence,
  createEmptyAuditSession,
  sha256Fixture,
  simulateAuditTransfer
} from './auditEvidenceLab';

describe('EJPT-05 host audit evidence fixtures', () => {
  it('requires authorization and at least one selected category', async () => {
    expect(await collectAuditEvidence('linux', ['network'], false)).toBeNull();
    expect(await collectAuditEvidence('linux', [], true)).toBeNull();
  });

  it('collects a minimized bilingual Linux manifest with actual SHA-256 and no secrets', async () => {
    const result = await collectAuditEvidence('linux', ['network', 'accounts', 'sensitive-metadata'], true);
    expect(result?.evidence).toHaveLength(3);
    expect(result?.evidence.map((item) => item.category)).toEqual(['network', 'accounts', 'sensitive-metadata']);
    for (const item of result?.evidence ?? []) expect(item.sha256).toMatch(/^[a-f0-9]{64}$/);
    const sensitive = result?.evidence.find((item) => item.category === 'sensitive-metadata');
    expect(sensitive).toMatchObject({ redacted: true, sensitivity: 'high' });
    expect(sensitive?.summary.it).toContain('omessi e non acquisiti');
    expect(JSON.stringify(result)).not.toMatch(/\$[0-9a-f]{2,}|password\s*[:=]|hash\s*[:=]/i);
    expect(result?.custody).toHaveLength(3);
    expect(result?.custody.every((event) => event.timestamp === '2026-10-18T12:00:00Z')).toBe(true);
  });

  it('supports a Windows fixture and rejects arbitrary category IDs', async () => {
    const result = await collectAuditEvidence('windows', ['network', 'system'], true);
    expect(result?.evidence[0].sourcePath).toContain('C:\\Fixture');
    expect(result?.evidence[1].summary.en).toContain('SMBv1 disabled');
    expect(await collectAuditEvidence('windows', ['../../etc/shadow' as 'network'], true)).toBeNull();
    expect(await collectAuditEvidence('windows', ['toString' as 'network'], true)).toBeNull();
  });

  it('transfers only allowlisted evidence or an inert note and verifies received digest', async () => {
    const empty = createEmptyAuditSession('linux');
    expect(await simulateAuditTransfer(empty, 'host-to-analyst', true)).toBeNull();
    expect(await simulateAuditTransfer(empty, 'analyst-to-host', false)).toBeNull();
    const collected = await collectAuditEvidence('windows', ['system'], true);
    const outbound = await simulateAuditTransfer(collected!, 'host-to-analyst', true);
    expect(outbound?.transfer).toMatchObject({ verified: true, direction: 'host-to-analyst' });
    expect(outbound?.transfer?.fileName).toBe('windows-system.redacted.json');
    const inbound = await simulateAuditTransfer(empty, 'analyst-to-host', true);
    expect(inbound?.transfer).toMatchObject({ verified: true, fileName: 'validation-note.txt' });
    expect(inbound?.custody[0].to).toBe('synthetic-host');
  });

  it('clears evidence, transfer, and custody on cleanup', async () => {
    const collected = await collectAuditEvidence('linux', ['network'], true);
    const transferred = await simulateAuditTransfer(collected!, 'host-to-analyst', true);
    const cleaned = cleanupAuditSession(transferred!);
    expect(cleaned).toMatchObject({ active: false, evidence: [], custody: [], transfer: null, platform: 'linux' });
  });

  it('uses standard Web Crypto SHA-256 for fixture integrity', async () => {
    expect(await sha256Fixture('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });
});

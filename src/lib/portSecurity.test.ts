import { describe, expect, it } from 'vitest';
import { simulatePortSecurity, type PortSecurityConfig } from './portSecurity';

const A = '0000.1111.aaaa';
const B = '0000.2222.bbbb';
const C = '0000.3333.cccc';

const run = (macs: Array<string | { mac: string; at: number }>, config: PortSecurityConfig = {}) =>
  simulatePortSecurity(macs.map(item => (typeof item === 'string' ? { mac: item } : item)), config);

describe('defaults nobody remembers', () => {
  it('allows exactly one address and err-disables on the second', () => {
    const result = run([A, B]);
    expect(result.config.maximum).toBe(1);
    expect(result.config.mode).toBe('shutdown');
    expect(result.steps.map(step => step.action)).toEqual(['learned', 'violation']);
    expect(result.finalState).toBe('err-disabled');
  });

  it('stops examining frames once the port is err-disabled', () => {
    const result = run([A, B, A]);
    // Even the legitimate host is down: that is the point of the default being harsh.
    expect(result.steps[2].action).toBe('port-down');
    expect(result.steps[2].reason.en).toMatch(/not even examined/);
  });
});

describe('the three violation modes differ', () => {
  it('protect drops silently, without counting or reporting', () => {
    const result = run([A, B], { mode: 'protect' });
    expect(result.finalState).toBe('up');
    expect(result.violationCount).toBe(0);
    expect(result.steps[1].notified).toBe(false);
    expect(result.steps[1].reason.en).toMatch(/nothing in the logs/);
  });

  it('restrict drops, counts and reports, and leaves the port up', () => {
    const result = run([A, B, C], { mode: 'restrict' });
    expect(result.finalState).toBe('up');
    expect(result.violationCount).toBe(2);
    expect(result.steps.every(step => step.action !== 'port-down')).toBe(true);
    expect(result.steps[1].notified).toBe(true);
  });

  it('shutdown counts, reports and takes the port down', () => {
    const result = run([A, B], { mode: 'shutdown' });
    expect(result.violationCount).toBe(1);
    expect(result.steps[1].notified).toBe(true);
    expect(result.steps[1].portState).toBe('err-disabled');
  });

  it('offers a way back only when the port actually went down', () => {
    expect(run([A, B], { mode: 'shutdown' }).recovery).toEqual([
      'interface GigabitEthernet1/0/5', ' shutdown', ' no shutdown', '!',
      '! oppure, per farla risalire da sola dopo 300 s / or, to let it recover on its own after 300 s',
      'errdisable recovery cause psecure-violation',
      'errdisable recovery interval 300'
    ]);
    expect(run([A, B], { mode: 'restrict' }).recovery).toBeNull();
  });
});

describe('the maximum', () => {
  it('learns up to the configured number and only then violates', () => {
    const result = run([A, B, C], { maximum: 2, mode: 'restrict' });
    expect(result.steps.map(step => step.action)).toEqual(['learned', 'learned', 'violation']);
    expect(result.secureMacs).toHaveLength(2);
  });

  it('does not count a frame from an address it already holds', () => {
    const result = run([A, A, A], { maximum: 1 });
    expect(result.steps.map(step => step.action)).toEqual(['learned', 'allowed', 'allowed']);
    expect(result.violationCount).toBe(0);
  });

  it('rejects a maximum outside the platform range', () => {
    expect(() => run([A], { maximum: 0 })).toThrow('INVALID_MAXIMUM');
    expect(() => run([A], { maximum: 200 })).toThrow('INVALID_MAXIMUM');
  });
});

describe('sticky learning', () => {
  it('writes each learned address into the configuration', () => {
    const result = run([A, B], { maximum: 2, sticky: true });
    expect(result.secureMacs.every(entry => entry.kind === 'sticky')).toBe(true);
    expect(result.configuration).toContain(' switchport port-security mac-address sticky 0000.1111.aaaa');
    expect(result.configuration).toContain(' switchport port-security mac-address sticky 0000.2222.bbbb');
    expect(result.steps[0].reason.en).toMatch(/survives a reload/);
  });

  it('keeps a dynamic address out of the configuration', () => {
    const result = run([A], { sticky: false });
    expect(result.configuration.some(line => line.includes('mac-address sticky 0000'))).toBe(false);
    expect(result.steps[0].reason.en).toMatch(/not in the configuration/);
  });
});

describe('aging', () => {
  it('frees a slot when an absolute timer expires', () => {
    const result = run([
      { mac: A, at: 0 },
      { mac: B, at: 100 },      // still inside the 2-minute timer: violation
      { mac: B, at: 200 }       // A has aged out, so B fits
    ], { maximum: 1, mode: 'restrict', agingMinutes: 2, agingType: 'absolute' });
    expect(result.steps.map(step => step.action)).toEqual(['learned', 'violation', 'learned']);
    expect(result.steps[2].agedOut).toContain('0000.1111.aaaa');
  });

  it('expires an entry exactly at the configured boundary', () => {
    // 2 minutes is 120 seconds, and the entry is gone at 120, not at 121.
    const atBoundary = run([{ mac: A, at: 0 }, { mac: B, at: 120 }], { maximum: 1, mode: 'restrict', agingMinutes: 2 });
    expect(atBoundary.steps[1].action).toBe('learned');
    const justBefore = run([{ mac: A, at: 0 }, { mac: B, at: 119 }], { maximum: 1, mode: 'restrict', agingMinutes: 2 });
    expect(justBefore.steps[1].action).toBe('violation');
  });

  it('keeps an inactivity timer alive while the host keeps talking', () => {
    const result = run([
      { mac: A, at: 0 },
      { mac: A, at: 100 },
      { mac: B, at: 150 }
    ], { maximum: 1, mode: 'restrict', agingMinutes: 2, agingType: 'inactivity' });
    // A was seen at t=100, so at t=150 it has been idle 50 s: it stays.
    expect(result.steps[2].action).toBe('violation');
    expect(result.steps[2].agedOut).toEqual([]);
  });

  it('never ages a sticky address', () => {
    const result = run([
      { mac: A, at: 0 },
      { mac: B, at: 10_000 }
    ], { maximum: 1, mode: 'restrict', sticky: true, agingMinutes: 2 });
    expect(result.steps[1].agedOut).toEqual([]);
    expect(result.steps[1].action).toBe('violation');
  });

  it('rejects an aging time outside the accepted range', () => {
    expect(() => run([A], { agingMinutes: -1 })).toThrow('INVALID_AGING_TIME');
    expect(() => run([A], { agingMinutes: 5000 })).toThrow('INVALID_AGING_TIME');
  });
});

describe('configuration and validation', () => {
  it('produces the commands that match the chosen options', () => {
    const result = run([A], { maximum: 3, mode: 'restrict', sticky: true, agingMinutes: 10, agingType: 'inactivity' });
    expect(result.configuration).toEqual([
      'interface GigabitEthernet1/0/5',
      ' switchport mode access',
      ' switchport port-security',
      ' switchport port-security maximum 3',
      ' switchport port-security violation restrict',
      ' switchport port-security mac-address sticky',
      ' switchport port-security aging time 10',
      ' switchport port-security aging type inactivity',
      ' switchport port-security mac-address sticky 0000.1111.aaaa'
    ]);
  });

  it('refuses a malformed address or a sequence that goes back in time', () => {
    expect(() => run(['not-a-mac'])).toThrow('INVALID_MAC');
    expect(() => run([{ mac: A, at: 10 }, { mac: B, at: 5 }])).toThrow('TIME_WENT_BACKWARDS');
  });

  it('explains every step in both languages', () => {
    for (const step of run([A, B, A], { mode: 'shutdown' }).steps) {
      expect(step.reason.it.length).toBeGreaterThan(50);
      expect(step.reason.en.length).toBeGreaterThan(50);
    }
  });
});

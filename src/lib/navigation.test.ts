import { describe, expect, it } from 'vitest';
import { NAV_ENTRIES, NAV_GROUPS, navEntryOf, navGroupOf, searchNav } from './navigation';
import type { AppView } from '../store';

/** Every view the app can render, mirrored from the AppView union in the store. */
const ALL_APP_VIEWS: AppView[] = [
  'curriculum', 'pathtrace', 'fundamentals', 'access', 'routing', 'services', 'securitycore', 'automation',
  'coverage', 'attackpaths', 'hardening', 'detection', 'recovery', 'ipv6security', 'segmentation',
  'identitytrust', 'routingsecurity', 'wirelesssecurity', 'vpnsecurity', 'availability', 'inspection',
  'managementsecurity', 'endpointsecurity', 'applicationsecurity', 'emailsecurity', 'layer2security',
  'defense', 'evidence', 'osi', 'attacklab', 'ports', 'security', 'glossary'
];

describe('navigation model', () => {
  it('reaches every view exactly once', () => {
    const views = NAV_ENTRIES.map(item => item.entry.view);
    expect(new Set(views).size, 'a view is listed twice').toBe(views.length);
    expect([...views].sort()).toEqual([...ALL_APP_VIEWS].sort());
  });

  it('keeps every group small enough to scan', () => {
    expect(NAV_GROUPS.length).toBeLessThanOrEqual(5);
    for (const group of NAV_GROUPS) {
      expect(group.entries.length, `${group.id} is empty`).toBeGreaterThan(0);
      expect(group.entries.length, `${group.id} has too many entries to scan`).toBeLessThanOrEqual(12);
    }
  });

  it('labels and hints every entry in both languages', () => {
    const ids = NAV_GROUPS.map(group => group.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const group of NAV_GROUPS) {
      for (const field of ['it', 'en', 'itShort', 'enShort'] as const) {
        expect(group[field]?.trim(), `${group.id}.${field}`).toBeTruthy();
      }
      for (const entry of group.entries) {
        for (const field of ['it', 'en', 'hintIt', 'hintEn', 'keywords'] as const) {
          expect(entry[field]?.trim(), `${entry.view}.${field}`).toBeTruthy();
        }
      }
    }
  });

  it('resolves the group and entry of a view', () => {
    expect(navGroupOf('routing')?.id).toBe('ccna');
    expect(navGroupOf('emailsecurity')?.id).toBe('domains');
    expect(navEntryOf('glossary')?.en).toBe('Glossary');
  });

  it('returns every entry for an empty query', () => {
    expect(searchNav('', 'it')).toHaveLength(NAV_ENTRIES.length);
    expect(searchNav('   ', 'en')).toHaveLength(NAV_ENTRIES.length);
  });

  it('finds views by label, keyword, and accent-insensitive text', () => {
    expect(searchNav('ospf', 'it').map(item => item.entry.view)).toContain('routing');
    expect(searchNav('wpa3', 'it').map(item => item.entry.view)).toContain('wirelesssecurity');
    // "identità" is reachable by typing it without the accent
    expect(searchNav('identita', 'it').map(item => item.entry.view)).toContain('identitytrust');
    expect(searchNav('GLOSSARIO', 'it').map(item => item.entry.view)).toEqual(['glossary']);
  });

  it('narrows instead of widening when several terms are typed', () => {
    const single = searchNav('dns', 'it');
    const both = searchNav('dns tunneling', 'it');
    expect(single.length).toBeGreaterThan(both.length);
    expect(both.map(item => item.entry.view)).toEqual(['applicationsecurity']);
  });

  it('returns nothing for a query that matches no view', () => {
    expect(searchNav('zzzznotathing', 'it')).toHaveLength(0);
  });
});

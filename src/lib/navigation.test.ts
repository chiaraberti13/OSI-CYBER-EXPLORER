import { describe, expect, it } from 'vitest';
import { NAV_ENTRIES, NAV_GROUPS, navEntryOf, navGroupOf, navOverflow, searchNav } from './navigation';
import { LAB_CATEGORIES } from '../content/viewRegistry';
import type { AppView } from '../store';

/** Every view the app can render, mirrored from the AppView union in the store. */
const ALL_APP_VIEWS: AppView[] = [
  'manual',
  'curriculum',
  'pathtrace',
  'fundamentals',
  'access',
  'routing',
  'services',
  'securitycore',
  'automation',
  'coverage',
  'attackpaths',
  'hardening',
  'detection',
  'recovery',
  'ipv6security',
  'segmentation',
  'identitytrust',
  'routingsecurity',
  'wirelesssecurity',
  'vpnsecurity',
  'availability',
  'inspection',
  'managementsecurity',
  'endpointsecurity',
  'applicationsecurity',
  'emailsecurity',
  'layer2security',
  'defense',
  'evidence',
  'osi',
  'attacklab',
  'ports',
  'security',
  'scanstates',
  'assessment',
  'exploitlab',
  'pivotlab',
  'passwordlab',
  'auditlab',
  'weblab',
  'glossary'
];

describe('navigation model', () => {
  // The CCNA hub overview is reached through the in-page hub switcher and as the landing
  // view, not as a separate dropdown entry, so it is intentionally hidden from the nav (IA-01).
  const HUB_ONLY_VIEWS: AppView[] = ['curriculum'];

  it('reaches every navigable view exactly once', () => {
    const views = NAV_ENTRIES.map((item) => item.entry.view);
    expect(new Set(views).size, 'a view is listed twice').toBe(views.length);
    const expected = ALL_APP_VIEWS.filter((view) => !HUB_ONLY_VIEWS.includes(view));
    expect([...views].sort()).toEqual([...expected].sort());
  });

  it('keeps the groups few and every lab area small enough to scan', () => {
    expect(NAV_GROUPS.length).toBeLessThanOrEqual(5);
    for (const group of NAV_GROUPS) {
      expect(group.entries.length, `${group.id} is empty`).toBeGreaterThan(0);
    }
    // The single Labs group is long but organised into area subheadings (IA-11); each
    // area stays scannable, and every lab belongs to exactly one declared area.
    const labs = NAV_GROUPS.find((group) => group.id === 'labs');
    expect(labs, 'labs group').toBeDefined();
    for (const category of LAB_CATEGORIES) {
      const count = labs!.entries.filter((entry) => entry.category === category.id).length;
      expect(count, `${category.id} has too many entries to scan`).toBeLessThanOrEqual(12);
    }
    expect(labs!.entries.every((entry) => entry.category !== undefined)).toBe(true);
  });

  it('labels and hints every entry in both languages', () => {
    const ids = NAV_GROUPS.map((group) => group.id);
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
    expect(navGroupOf('routing')?.id).toBe('labs');
    expect(navGroupOf('emailsecurity')?.id).toBe('labs');
    expect(navEntryOf('glossary')?.en).toBe('Glossary');
  });

  it('returns every entry for an empty query', () => {
    expect(searchNav('', 'it')).toHaveLength(NAV_ENTRIES.length);
    expect(searchNav('   ', 'en')).toHaveLength(NAV_ENTRIES.length);
  });

  it('finds views by label, keyword, and accent-insensitive text', () => {
    expect(searchNav('ospf', 'it').map((item) => item.entry.view)).toContain('routing');
    expect(searchNav('wpa3', 'it').map((item) => item.entry.view)).toContain('wirelesssecurity');
    // "identità" is reachable by typing it without the accent
    expect(searchNav('identita', 'it').map((item) => item.entry.view)).toContain('identitytrust');
    expect(searchNav('GLOSSARIO', 'it').map((item) => item.entry.view)).toEqual(['glossary']);
  });

  it('narrows instead of widening when several terms are typed', () => {
    const single = searchNav('dns', 'it');
    const both = searchNav('dns tunneling', 'it');
    expect(single.length).toBeGreaterThan(both.length);
    expect(both.map((item) => item.entry.view)).toEqual(['applicationsecurity']);
  });

  it('finds every interactive exercise by the name a learner would type', () => {
    // These exercises are sections inside a lab, not views of their own, so the search
    // keywords are the only way to reach them by name.
    const cases: Array<[string, string]> = [
      ['cam table', 'access'],
      ['flooding', 'access'],
      ['port-security', 'access'],
      ['sticky', 'access'],
      ['vlsm', 'fundamentals'],
      ['frammentazione', 'fundamentals'],
      ['pmtud', 'fundamentals'],
      ['spf', 'routing'],
      ['ecmp', 'routing'],
      ['reference-bandwidth', 'routing'],
      ['dora', 'services'],
      ['giaddr', 'services'],
      ['option 82', 'services'],
      ['shadowing', 'securitycore'],
      ['implicit deny', 'securitycore'],
      ['wildcard', 'securitycore']
    ];
    for (const [query, view] of cases) {
      expect(
        searchNav(query, 'it').map((item) => item.entry.view),
        `"${query}"`
      ).toContain(view);
    }
  });

  it('returns nothing for a query that matches no view', () => {
    expect(searchNav('zzzznotathing', 'it')).toHaveLength(0);
  });
});

describe('navOverflow (UX-07 tab overflow affordance)', () => {
  it('reports no overflow when content fits', () => {
    expect(navOverflow({ scrollLeft: 0, scrollWidth: 300, clientWidth: 300 })).toEqual({
      canScrollLeft: false,
      canScrollRight: false
    });
    // Sub-pixel difference within tolerance is still "fits".
    expect(navOverflow({ scrollLeft: 0, scrollWidth: 301, clientWidth: 300 })).toEqual({
      canScrollLeft: false,
      canScrollRight: false
    });
  });

  it('shows only the right affordance at the start of an overflowing row', () => {
    expect(navOverflow({ scrollLeft: 0, scrollWidth: 800, clientWidth: 300 })).toEqual({
      canScrollLeft: false,
      canScrollRight: true
    });
  });

  it('shows both affordances in the middle', () => {
    expect(navOverflow({ scrollLeft: 200, scrollWidth: 800, clientWidth: 300 })).toEqual({
      canScrollLeft: true,
      canScrollRight: true
    });
  });

  it('shows only the left affordance at the end', () => {
    expect(navOverflow({ scrollLeft: 500, scrollWidth: 800, clientWidth: 300 })).toEqual({
      canScrollLeft: true,
      canScrollRight: false
    });
  });

  it('clamps rubber-band over-scroll past either edge', () => {
    // Negative (bounce left) and beyond-max (bounce right) must not flip the flags.
    expect(navOverflow({ scrollLeft: -20, scrollWidth: 800, clientWidth: 300 })).toEqual({
      canScrollLeft: false,
      canScrollRight: true
    });
    expect(navOverflow({ scrollLeft: 520, scrollWidth: 800, clientWidth: 300 })).toEqual({
      canScrollLeft: true,
      canScrollRight: false
    });
  });
});

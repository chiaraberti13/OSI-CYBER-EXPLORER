import { describe, expect, it } from 'vitest';
import { VIEW_GROUPS, VIEW_ORDER, VIEW_REGISTRY, type ViewGroupId } from './viewRegistry';
import { NAV_ENTRIES, NAV_GROUPS } from '../lib/navigation';
import type { AppView } from '../store';

/** Every view the app can render, mirrored from the AppView union in the store. */
const ALL_APP_VIEWS: AppView[] = [
  'manual', 'curriculum', 'pathtrace', 'fundamentals', 'access', 'routing', 'services', 'securitycore', 'automation',
  'coverage', 'attackpaths', 'hardening', 'detection', 'recovery', 'ipv6security', 'segmentation',
  'identitytrust', 'routingsecurity', 'wirelesssecurity', 'vpnsecurity', 'availability', 'inspection',
  'managementsecurity', 'endpointsecurity', 'applicationsecurity', 'emailsecurity', 'layer2security',
  'defense', 'evidence', 'osi', 'attacklab', 'ports', 'security', 'glossary'
];

const GROUP_IDS = VIEW_GROUPS.map(group => group.id);

describe('view registry', () => {
  it('registers every view exactly once and no extra view', () => {
    // The `satisfies Record<AppView, ViewDefinition>` annotation already guarantees this
    // at compile time; this asserts it at runtime so a drift surfaces as a failing test.
    expect([...VIEW_ORDER].sort()).toEqual([...ALL_APP_VIEWS].sort());
    expect(new Set(VIEW_ORDER).size).toBe(VIEW_ORDER.length);
    expect(VIEW_ORDER).toEqual(Object.keys(VIEW_REGISTRY));
  });

  it('gives every view a loadable component, an icon and a known group', () => {
    for (const view of VIEW_ORDER) {
      const definition = VIEW_REGISTRY[view];
      expect(definition.component, `${view}.component`).toBeTruthy();
      expect(typeof definition.icon, `${view}.icon`).not.toBe('undefined');
      expect(GROUP_IDS, `${view}.group is an unknown group`).toContain(definition.group);
    }
  });

  it('labels, hints and keywords every view in both languages', () => {
    for (const view of VIEW_ORDER) {
      const definition = VIEW_REGISTRY[view];
      for (const field of ['it', 'en', 'hintIt', 'hintEn', 'keywords'] as const) {
        expect(definition[field]?.trim(), `${view}.${field}`).toBeTruthy();
      }
    }
  });

  it('only uses the two defined motion presets', () => {
    for (const view of VIEW_ORDER) {
      const motion = VIEW_REGISTRY[view].motion;
      expect([undefined, 'subtle', 'pronounced'], `${view}.motion`).toContain(motion);
    }
  });

  it('marks the embeddable modal views as inline and leaves the rest full-render', () => {
    const inlineViews = VIEW_ORDER.filter(view => VIEW_REGISTRY[view].inline === true);
    expect([...inlineViews].sort()).toEqual(['glossary', 'ports']);
  });

  it('keeps group ids unique and every group populated', () => {
    expect(new Set(GROUP_IDS).size).toBe(GROUP_IDS.length);
    for (const group of GROUP_IDS) {
      const members = VIEW_ORDER.filter(view => VIEW_REGISTRY[view].group === group);
      expect(members.length, `${group} is empty`).toBeGreaterThan(0);
    }
  });

  it('does not reference a group that is not declared in VIEW_GROUPS', () => {
    const usedGroups = new Set<ViewGroupId>(VIEW_ORDER.map(view => VIEW_REGISTRY[view].group));
    expect([...usedGroups].sort()).toEqual([...GROUP_IDS].sort());
  });
});

describe('navigation derived from the registry', () => {
  it('projects the registry into groups without losing or duplicating a view', () => {
    const navViews = NAV_ENTRIES.map(item => item.entry.view);
    expect([...navViews].sort()).toEqual([...VIEW_ORDER].sort());
    expect(new Set(navViews).size).toBe(navViews.length);
  });

  it('keeps each entry in its registry group, in registry order', () => {
    for (const group of NAV_GROUPS) {
      const expected = VIEW_ORDER.filter(view => VIEW_REGISTRY[view].group === group.id);
      expect(group.entries.map(entry => entry.view), group.id).toEqual(expected);
      for (const entry of group.entries) {
        expect(VIEW_REGISTRY[entry.view].group).toBe(group.id);
        expect(entry.icon).toBe(VIEW_REGISTRY[entry.view].icon);
      }
    }
  });

  it('lists groups in VIEW_GROUPS order', () => {
    expect(NAV_GROUPS.map(group => group.id)).toEqual(GROUP_IDS);
  });
});

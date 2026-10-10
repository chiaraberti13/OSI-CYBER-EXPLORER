import type { LucideIcon } from 'lucide-react';
import type { AppView } from '../store';
import { VIEW_GROUPS, VIEW_ORDER, VIEW_REGISTRY, type ViewGroupId } from '../content/viewRegistry';

/**
 * Navigation model for the lab.
 *
 * There are more than thirty views: listing them all at once is not navigable, so
 * they are grouped by what the learner is trying to do, and every entry carries a
 * one-line hint plus search keywords. Since ENG-06 this model is *derived* from the
 * single view registry (`src/content/viewRegistry.ts`) rather than duplicating the
 * list of views: the registry owns group membership, icons, labels, hints and
 * keywords, and this file only reshapes them into the grouped structure the
 * navigation component renders. The unit tests still assert every view is reachable
 * exactly once.
 */
export interface NavEntry {
  view: AppView;
  it: string;
  en: string;
  /** One line explaining what the view is for, shown under the label. */
  hintIt: string;
  hintEn: string;
  /** Extra terms the quick search should match, beyond label and hint. */
  keywords: string;
  /** Icon representing the view in menus and search, from the registry. */
  icon: LucideIcon;
}

export interface NavGroup {
  id: ViewGroupId;
  it: string;
  en: string;
  itShort: string;
  enShort: string;
  entries: NavEntry[];
}

/**
 * The grouped navigation model, built from the registry. Groups appear in
 * {@link VIEW_GROUPS} order, and the entries inside each group keep the registry's
 * declaration order, so the menu is a direct, testable projection of the registry.
 */
export const NAV_GROUPS: NavGroup[] = VIEW_GROUPS.map(group => ({
  id: group.id,
  it: group.it,
  en: group.en,
  itShort: group.itShort,
  enShort: group.enShort,
  entries: VIEW_ORDER
    .filter(view => VIEW_REGISTRY[view].group === group.id)
    .map(view => {
      const definition = VIEW_REGISTRY[view];
      return {
        view,
        it: definition.it,
        en: definition.en,
        hintIt: definition.hintIt,
        hintEn: definition.hintEn,
        keywords: definition.keywords,
        icon: definition.icon
      };
    })
}));

/** Every entry, flattened, in menu order. */
export const NAV_ENTRIES: ReadonlyArray<{ group: NavGroup; entry: NavEntry }> = NAV_GROUPS.flatMap(group =>
  group.entries.map(entry => ({ group, entry }))
);

/** The group a view belongs to, used to highlight the menu and build the breadcrumb. */
export function navGroupOf(view: AppView): NavGroup | undefined {
  return NAV_GROUPS.find(group => group.entries.some(entry => entry.view === view));
}

export function navEntryOf(view: AppView): NavEntry | undefined {
  return NAV_ENTRIES.find(item => item.entry.view === view)?.entry;
}

/** Lowercases and strips accents so "identità" is found by typing "identita". */
function normalize(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/**
 * Quick search across every view. All whitespace-separated terms must match
 * somewhere in the label, the hint, or the keywords, so "wpa dns" narrows instead
 * of widening. An empty query returns everything, in menu order.
 */
export function searchNav(query: string, language: 'it' | 'en'): ReadonlyArray<{ group: NavGroup; entry: NavEntry }> {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return NAV_ENTRIES;

  return NAV_ENTRIES.filter(({ group, entry }) => {
    const haystack = normalize([
      entry[language],
      entry.it,
      entry.en,
      language === 'it' ? entry.hintIt : entry.hintEn,
      entry.keywords,
      group[language]
    ].join(' '));
    return terms.every(term => haystack.includes(term));
  });
}

/**
 * UX-07: whether a horizontally scrollable tab row has content hidden off either
 * edge. The nav hides its scrollbar, so these flags drive the visible overflow
 * affordances (fade + scroll buttons) that make every group reachable without a
 * blind swipe. Pure and layout-free so it is unit-tested without a browser; the
 * component feeds it live scroll metrics. A small tolerance absorbs sub-pixel
 * rounding and over-scroll bounce.
 */
export interface ScrollMetrics {
  scrollLeft: number;
  scrollWidth: number;
  clientWidth: number;
}

export function navOverflow(metrics: ScrollMetrics, tolerance = 2): { canScrollLeft: boolean; canScrollRight: boolean } {
  const maxScroll = metrics.scrollWidth - metrics.clientWidth;
  if (maxScroll <= tolerance) {
    return { canScrollLeft: false, canScrollRight: false };
  }
  // Over-scroll (rubber-band) can push scrollLeft slightly negative or past max.
  const scrollLeft = Math.max(0, Math.min(metrics.scrollLeft, maxScroll));
  return {
    canScrollLeft: scrollLeft > tolerance,
    canScrollRight: scrollLeft < maxScroll - tolerance,
  };
}

/**
 * Which lab a CCNA domain opens. Kept next to the navigation model because it maps
 * content identifiers onto views, exactly like the groups above.
 */
export const DOMAIN_LAB_VIEWS: Record<string, AppView> = {
  'network-fundamentals': 'fundamentals',
  'network-access': 'access',
  'ip-connectivity': 'routing',
  'ip-services': 'services',
  'security-fundamentals': 'securitycore',
  'automation-programmability': 'automation'
};

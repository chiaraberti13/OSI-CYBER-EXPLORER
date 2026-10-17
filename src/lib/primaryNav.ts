import { BookOpen, FlaskConical, Library, Map as MapIcon, Network } from 'lucide-react';
import type { AppView } from '../store';
import type { LucideIcon } from 'lucide-react';

/**
 * The app's primary destinations, shared by the top-bar menu (inline on desktop) and the
 * mobile drawer. There are only a handful, so they fit a horizontal bar without the
 * scrolling tab strip the earlier layout needed. Laboratori holds many labs, so it opens
 * a panel (a dropdown in the bar, a disclosure in the drawer) rather than its own item.
 * Glossario and Porte are promoted to their own top-level entries, so the labs panel omits
 * them (RAIL_VIEWS).
 */
export interface PrimaryItem {
  /** The view a single-destination item opens. */
  view?: AppView;
  /** A group id whose entries open in a panel (Laboratori). */
  group?: 'labs';
  /** Full, descriptive name (accessible label). */
  it: string;
  en: string;
  /** Compact label shown in the horizontal bar. */
  shortIt: string;
  shortEn: string;
  icon: LucideIcon;
}

export const PRIMARY: PrimaryItem[] = [
  { view: 'manual', it: 'Manuale', en: 'Manual', shortIt: 'Manuale', shortEn: 'Manual', icon: BookOpen },
  { group: 'labs', it: 'Laboratori', en: 'Labs', shortIt: 'Laboratori', shortEn: 'Labs', icon: FlaskConical },
  { view: 'glossary', it: 'Glossario', en: 'Glossary', shortIt: 'Glossario', shortEn: 'Glossary', icon: Library },
  { view: 'curriculum', it: 'Mappa CCNA', en: 'CCNA map', shortIt: 'Mappa', shortEn: 'Map', icon: MapIcon },
  {
    view: 'ports',
    it: 'Porte e protocolli',
    en: 'Ports & protocols',
    shortIt: 'Porte',
    shortEn: 'Ports',
    icon: Network
  }
];

export const RAIL_VIEWS = new Set<AppView>(['glossary', 'ports']);

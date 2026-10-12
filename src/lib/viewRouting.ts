import type { StoreApi } from 'zustand';
import { VIEW_ORDER, VIEW_REGISTRY } from '../content/viewRegistry';
import { findChapter } from './studyManual';
import type { AppState, AppView } from '../store';
import type { Language } from '../types';

export const DEFAULT_VIEW: AppView = 'curriculum';

/** Routes are a projection of the registry, never a second list of view ids. */
const VIEW_BY_HASH = new Map(VIEW_ORDER.map((view) => [viewHash(view), view]));

export function viewHash(view: AppView): string {
  return `#/${view}`;
}

/** Match exact registered routes only; URL input never becomes a module path. */
export function resolveViewHash(hash: string): AppView {
  return VIEW_BY_HASH.get(hash) ?? DEFAULT_VIEW;
}

/** Canonical deep link to a single manual chapter (EDU-STRUCT-04). */
export function manualChapterHash(chapterId: string): string {
  return `#/manual/${chapterId}`;
}

/**
 * The manual is the only view with an addressable sub-route: `#/manual/<chapterId>`.
 * Parsing validates the chapter id against the real chapter list, so a tampered or
 * stale id collapses to the manual root (`#/manual`) rather than selecting anything
 * unexpected. Every other hash resolves through the strict, exact-match view table.
 */
export function parseRoute(hash: string): { view: AppView; chapterId: string | null } {
  const manual = /^#\/manual(?:\/(.*))?$/.exec(hash);
  if (manual) {
    const candidate = (manual[1] ?? '').split('/')[0];
    return { view: 'manual', chapterId: candidate && findChapter(candidate) ? candidate : null };
  }
  return { view: resolveViewHash(hash), chapterId: null };
}

/** The canonical hash for a (view, chapter) pair; the chapter only applies to the manual. */
function routeHash(view: AppView, chapterId: string | null): string {
  return view === 'manual' && chapterId ? manualChapterHash(chapterId) : viewHash(view);
}

export function viewTitle(view: AppView, language: Language): string {
  return `${VIEW_REGISTRY[view][language]} — OSI Cyber Explorer`;
}

/**
 * Connect once, before React renders, so a deep link opens its destination directly.
 * All existing setActiveView actions (menus, search, curriculum and error recovery)
 * then participate in browser history without coupling the store to browser APIs.
 * Hash routing works on static hosts and under a base path without server rewrites.
 */
export function connectViewRouting(
  store: Pick<StoreApi<AppState>, 'getState' | 'subscribe'>,
  browser: Window
): () => void {
  const readLocation = () => {
    const { view, chapterId } = parseRoute(browser.location.hash);
    const hash = routeHash(view, chapterId);
    if (browser.location.hash !== hash) {
      // Canonicalize empty/unknown routes (and broken chapter ids) in place: Back must
      // not revisit a bad URL. A fragment-only update preserves host, base path and query.
      browser.history.replaceState(browser.history.state, '', hash);
    }
    const state = store.getState();
    if (state.activeView !== view) state.setActiveView(view);
    if (state.activeChapterId !== chapterId) state.setActiveChapter(chapterId);
  };

  readLocation();

  const unsubscribe = store.subscribe((state, previousState) => {
    if (state.activeView === previousState.activeView && state.activeChapterId === previousState.activeChapterId) {
      return;
    }
    const hash = routeHash(state.activeView, state.activeView === 'manual' ? state.activeChapterId : null);
    if (browser.location.hash !== hash) {
      // No session data is stored in history. Re-selecting the same route adds no entry.
      browser.history.pushState(null, '', hash);
    }
  });

  // pushState does not emit hashchange. Traversal may emit both events; reading
  // the current URL and comparing before writing makes their delivery idempotent.
  browser.addEventListener('popstate', readLocation);
  browser.addEventListener('hashchange', readLocation);

  return () => {
    unsubscribe();
    browser.removeEventListener('popstate', readLocation);
    browser.removeEventListener('hashchange', readLocation);
  };
}

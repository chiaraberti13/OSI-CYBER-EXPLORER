import type { StoreApi } from 'zustand';
import { VIEW_ORDER, VIEW_REGISTRY } from '../content/viewRegistry';
import type { AppState, AppView } from '../store';
import type { Language } from '../types';

export const DEFAULT_VIEW: AppView = 'osi';

/** Routes are a projection of the registry, never a second list of view ids. */
const VIEW_BY_HASH = new Map(VIEW_ORDER.map(view => [viewHash(view), view]));

export function viewHash(view: AppView): string {
  return `#/${view}`;
}

/** Match exact registered routes only; URL input never becomes a module path. */
export function resolveViewHash(hash: string): AppView {
  return VIEW_BY_HASH.get(hash) ?? DEFAULT_VIEW;
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
  browser: Window,
): () => void {
  const readLocation = () => {
    const view = resolveViewHash(browser.location.hash);
    const hash = viewHash(view);
    if (browser.location.hash !== hash) {
      // Canonicalize empty/unknown routes in place: Back must not revisit a bad URL.
      // A fragment-only update preserves the host, base path and query string.
      browser.history.replaceState(browser.history.state, '', hash);
    }
    if (store.getState().activeView !== view) {
      store.getState().setActiveView(view);
    }
  };

  readLocation();

  const unsubscribe = store.subscribe((state, previousState) => {
    if (state.activeView === previousState.activeView) return;
    const hash = viewHash(state.activeView);
    if (browser.location.hash !== hash) {
      // No session data is stored in history. Re-selecting a view adds no entry.
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

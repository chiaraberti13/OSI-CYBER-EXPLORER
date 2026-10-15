import type { StoreApi } from 'zustand';
import { VIEW_ORDER, VIEW_REGISTRY } from '../content/viewRegistry';
import { findChapter } from './studyManual';
import type { AppState, AppView } from '../store';
import type { Language } from '../types';

export const DEFAULT_VIEW: AppView = 'manual';

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

/** Canonical deep link to a single topic within a manual chapter (UX-29). */
export function manualTopicHash(chapterId: string, topicId: string): string {
  return `#/manual/${chapterId}/${topicId}`;
}

/**
 * The manual is the only view with addressable sub-routes: `#/manual/<chapterId>` and
 * `#/manual/<chapterId>/<topicId>`. Parsing validates the chapter id against the real
 * chapter list and the topic id against that chapter's topics, so a tampered or stale id
 * collapses to the nearest valid level (the chapter, or the manual root) rather than
 * selecting anything unexpected. Every other hash resolves through the strict view table.
 */
export function parseRoute(hash: string): { view: AppView; chapterId: string | null; topicId: string | null } {
  const manual = /^#\/manual(?:\/(.*))?$/.exec(hash);
  if (manual) {
    const [chapterCandidate, topicCandidate] = (manual[1] ?? '').split('/');
    const chapter = chapterCandidate ? findChapter(chapterCandidate) : undefined;
    if (!chapter) return { view: 'manual', chapterId: null, topicId: null };
    const topicId =
      topicCandidate && chapter.topics.some((topic) => topic.id === topicCandidate) ? topicCandidate : null;
    return { view: 'manual', chapterId: chapter.id, topicId };
  }
  return { view: resolveViewHash(hash), chapterId: null, topicId: null };
}

/** The canonical hash for a (view, chapter, topic); chapter/topic only apply to the manual. */
function routeHash(view: AppView, chapterId: string | null, topicId: string | null): string {
  if (view !== 'manual' || !chapterId) return viewHash(view);
  return topicId ? manualTopicHash(chapterId, topicId) : manualChapterHash(chapterId);
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
    const { view, chapterId, topicId } = parseRoute(browser.location.hash);
    const hash = routeHash(view, chapterId, topicId);
    if (browser.location.hash !== hash) {
      // Canonicalize empty/unknown routes (and broken chapter/topic ids) in place: Back
      // must not revisit a bad URL. A fragment-only update preserves host, base path and query.
      browser.history.replaceState(browser.history.state, '', hash);
    }
    const state = store.getState();
    // Apply view, chapter and topic in one update so the subscriber never observes an
    // inconsistent intermediate state (which would push a wrong URL during traversal).
    if (state.activeView !== view || state.activeChapterId !== chapterId || state.activeTopicId !== topicId) {
      state.applyRoute(view, chapterId, topicId);
    }
  };

  readLocation();

  const unsubscribe = store.subscribe((state, previousState) => {
    const viewChanged = state.activeView !== previousState.activeView;
    const chapterChanged = state.activeChapterId !== previousState.activeChapterId;
    const topicChanged = state.activeTopicId !== previousState.activeTopicId;
    if (!viewChanged && !chapterChanged && !topicChanged) return;
    const onManual = state.activeView === 'manual';
    const hash = routeHash(
      state.activeView,
      onManual ? state.activeChapterId : null,
      onManual ? state.activeTopicId : null
    );
    if (browser.location.hash === hash) return;
    // Changing view or chapter adds a history entry; moving to a topic within the same
    // chapter replaces it, so Back does not step through every anchor (UX-29).
    if (viewChanged || chapterChanged) {
      browser.history.pushState(null, '', hash);
    } else {
      browser.history.replaceState(browser.history.state, '', hash);
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

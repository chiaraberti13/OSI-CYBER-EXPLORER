/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Undo2 } from 'lucide-react';

/**
 * A minimal, bilingual error boundary for the lazily-loaded views (ENG-09).
 *
 * `Suspense` handles the *loading* state of a dynamic `import()`, but it does nothing
 * when that import ultimately *fails*: the rejection is thrown during render and, with
 * no boundary above it, unmounts the whole tree and leaves a blank page. This boundary
 * catches that error (and any render error inside the active view) and replaces it with
 * a recoverable panel instead of an empty app.
 *
 * It offers two independent recovery paths, matching ENG-09's requirement of "retry del
 * chunk e ritorno sicuro a una vista funzionante":
 *
 *  - **Reload** — a hard retry that re-fetches the failed chunk. `React.lazy` caches a
 *    rejected import permanently, so re-rendering the same view cannot re-request it; a
 *    full reload is the reliable way to fetch the chunk again. {@link importWithRetry}
 *    already absorbs transient blips at load time, so reaching this button means the
 *    chunk is still unreachable and a clean reload is the honest next step.
 *  - **Safe return** — switches back to a known-good view (the OSI overview) without a
 *    reload, recovering in-page when only the failed view's chunk is broken.
 *
 * `resetKeys` lets the boundary recover automatically: when the active view changes
 * (the user navigates elsewhere), the boundary clears its error state and tries to
 * render the new view, so a single broken chunk never traps the user on the panel.
 *
 * It is a class component because `getDerivedStateFromError`/`componentDidCatch` have no
 * hook equivalent. Keeping it in-repo avoids adding `react-error-boundary` for a boundary
 * this small and specific.
 */

export interface SafeReturnAction {
  /** Visible label for the "return to a working view" button. */
  label: string;
  /** Invoked when the user chooses the safe return (e.g. switch the active view). */
  onAction: () => void;
}

interface ChunkErrorBoundaryProps {
  language: 'it' | 'en';
  children: ReactNode;
  /**
   * When any value in this list changes, a boundary currently showing its error panel
   * resets and re-renders its children. Pass the active view so navigation recovers.
   */
  resetKeys?: readonly unknown[];
  /** Optional "return to a working view" action shown as a secondary button. */
  safeReturn?: SafeReturnAction;
  /** Hard retry. Defaults to reloading the page; injectable so tests need not reload jsdom. */
  onReload?: () => void;
}

interface ChunkErrorBoundaryState {
  hasError: boolean;
}

const COPY = {
  it: {
    title: 'Impossibile caricare questa sezione',
    body: 'Il modulo non è stato scaricato correttamente, probabilmente per un problema di rete temporaneo. I tuoi dati e le tue preferenze non sono andati persi.',
    reload: 'Ricarica la pagina',
    role: 'Messaggio di errore'
  },
  en: {
    title: 'This section could not be loaded',
    body: 'The module failed to download, most likely because of a temporary network issue. Your data and preferences have not been lost.',
    reload: 'Reload the page',
    role: 'Error message'
  }
} as const;

function defaultReload(): void {
  if (typeof window !== 'undefined' && typeof window.location?.reload === 'function') {
    window.location.reload();
  }
}

function keysChanged(a: readonly unknown[] = [], b: readonly unknown[] = []): boolean {
  if (a.length !== b.length) return true;
  return a.some((value, index) => !Object.is(value, b[index]));
}

export default class ChunkErrorBoundary extends Component<ChunkErrorBoundaryProps, ChunkErrorBoundaryState> {
  state: ChunkErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ChunkErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // `warn`/`error` are the only console methods the lint policy allows; this keeps a
    // diagnostic trail for a failed chunk without shipping noisy logging.
    console.error('ChunkErrorBoundary caught an error while rendering a view', error, info.componentStack);
  }

  componentDidUpdate(prevProps: ChunkErrorBoundaryProps): void {
    if (this.state.hasError && keysChanged(prevProps.resetKeys, this.props.resetKeys)) {
      this.reset();
    }
  }

  private reset = (): void => {
    this.setState({ hasError: false });
  };

  private handleReload = (): void => {
    (this.props.onReload ?? defaultReload)();
  };

  private handleSafeReturn = (): void => {
    this.props.safeReturn?.onAction();
    // Reset too: if the safe return does not change a reset key (e.g. we are already on
    // the fallback view), the boundary still needs to re-attempt rendering.
    this.reset();
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const copy = COPY[this.props.language];
    const { safeReturn } = this.props;

    return (
      <div
        role="alert"
        aria-label={copy.role}
        className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center"
      >
        <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-amber-500" aria-hidden="true" />
        <h2 className="text-base font-semibold text-slate-800">{copy.title}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">{copy.body}</p>
        <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={this.handleReload}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {copy.reload}
          </button>
          {safeReturn ? (
            <button
              type="button"
              onClick={this.handleSafeReturn}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
            >
              <Undo2 className="h-4 w-4" aria-hidden="true" />
              {safeReturn.label}
            </button>
          ) : null}
        </div>
      </div>
    );
  }
}

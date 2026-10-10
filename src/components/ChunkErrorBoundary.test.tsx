// @vitest-environment jsdom
/**
 * @license
 * SPDX-License-Identifier: GPL-3.0-only
 */

import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChunkErrorBoundary from './ChunkErrorBoundary';

/** A child that throws on render when asked, to simulate a failed lazy chunk. */
function Thrower({ shouldThrow }: { shouldThrow: boolean }): React.ReactElement {
  if (shouldThrow) {
    throw new Error('Simulated chunk load failure');
  }
  return <p>Working view</p>;
}

beforeEach(() => {
  // React logs caught render errors to console.error; the boundary logs its own
  // diagnostic too. Silence both so a deliberately-thrown test error is not noise.
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
});

describe('ChunkErrorBoundary (ENG-09)', () => {
  it('renders its children when nothing throws', () => {
    render(
      <ChunkErrorBoundary language="it">
        <Thrower shouldThrow={false} />
      </ChunkErrorBoundary>
    );

    expect(screen.getByText('Working view')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows a recoverable Italian panel when a child throws', () => {
    render(
      <ChunkErrorBoundary language="it">
        <Thrower shouldThrow={true} />
      </ChunkErrorBoundary>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toBeTruthy();
    expect(screen.getByText('Impossibile caricare questa sezione')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Ricarica la pagina' })).toBeTruthy();
    expect(screen.queryByText('Working view')).toBeNull();
  });

  it('localizes the panel in English', () => {
    render(
      <ChunkErrorBoundary language="en">
        <Thrower shouldThrow={true} />
      </ChunkErrorBoundary>
    );

    expect(screen.getByText('This section could not be loaded')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Reload the page' })).toBeTruthy();
  });

  it('calls the injected reload handler when the reload button is pressed', async () => {
    const onReload = vi.fn();
    render(
      <ChunkErrorBoundary language="it" onReload={onReload}>
        <Thrower shouldThrow={true} />
      </ChunkErrorBoundary>
    );

    await userEvent.click(screen.getByRole('button', { name: 'Ricarica la pagina' }));
    expect(onReload).toHaveBeenCalledTimes(1);
  });

  it('renders and triggers the safe-return action', async () => {
    const onAction = vi.fn();
    render(
      <ChunkErrorBoundary
        language="it"
        safeReturn={{ label: 'Torna alla panoramica OSI', onAction }}
      >
        <Thrower shouldThrow={true} />
      </ChunkErrorBoundary>
    );

    const button = screen.getByRole('button', { name: 'Torna alla panoramica OSI' });
    await userEvent.click(button);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('omits the safe-return button when no action is provided', () => {
    render(
      <ChunkErrorBoundary language="it">
        <Thrower shouldThrow={true} />
      </ChunkErrorBoundary>
    );

    expect(screen.queryByRole('button', { name: /panoramica|overview/i })).toBeNull();
  });

  it('recovers automatically when a reset key changes', async () => {
    // Drives the boundary from erroring → recovered by changing both the reset key and
    // the child so navigation away from a broken chunk clears the panel.
    function Harness(): React.ReactElement {
      const [view, setView] = useState('broken');
      return (
        <>
          <button type="button" onClick={() => setView('osi')}>
            navigate
          </button>
          <ChunkErrorBoundary language="it" resetKeys={[view]}>
            <Thrower shouldThrow={view === 'broken'} />
          </ChunkErrorBoundary>
        </>
      );
    }

    render(<Harness />);
    expect(screen.getByRole('alert')).toBeTruthy();

    await userEvent.click(screen.getByRole('button', { name: 'navigate' }));

    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByText('Working view')).toBeTruthy();
  });
});

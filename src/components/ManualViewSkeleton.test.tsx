// @vitest-environment jsdom
/**
 * @license
 * SPDX-License-Identifier: GPL-3.0-only
 */

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import ManualViewSkeleton from './ManualViewSkeleton';

afterEach(cleanup);

describe('ManualViewSkeleton (UX-27)', () => {
  it('exposes a single polite status with a bilingual loading label', () => {
    const { rerender } = render(<ManualViewSkeleton language="it" />);
    const status = screen.getByRole('status');
    expect(status.textContent?.trim()).toBe('Caricamento del manuale di studio…');
    expect(status.getAttribute('aria-live')).toBe('polite');

    rerender(<ManualViewSkeleton language="en" />);
    expect(screen.getByRole('status').textContent?.trim()).toBe('Loading the study manual…');
  });

  it('mirrors the manual layout to reserve space and avoid a layout jump', () => {
    const { container } = render(<ManualViewSkeleton language="it" />);
    const skeleton = screen.getByTestId('manual-skeleton');
    // Same reading container width as the real manual.
    expect(skeleton.classList.contains('max-w-5xl')).toBe(true);
    // An overview card plus at least two topic-card placeholders keep the height close
    // to the loaded manual, so the swap to real content does not shift the layout.
    expect(container.querySelectorAll('[data-skeleton="card"]').length).toBeGreaterThanOrEqual(3);
  });

  it('is decorative: it adds no headings to the document outline', () => {
    const { container } = render(<ManualViewSkeleton language="it" />);
    expect(container.querySelector('h1, h2, h3, h4, h5, h6')).toBeNull();
  });

  it('disables the shimmer under reduced motion', () => {
    render(<ManualViewSkeleton language="it" />);
    const skeleton = screen.getByTestId('manual-skeleton');
    expect(skeleton.classList.contains('animate-pulse')).toBe(true);
    expect(skeleton.classList.contains('motion-reduce:animate-none')).toBe(true);
  });
});

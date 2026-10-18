/**
 * @license
 * SPDX-License-Identifier: GPL-3.0-only
 */

export function scrollBehaviorForReducedMotion(prefersReducedMotion: boolean): ScrollBehavior {
  return prefersReducedMotion ? 'auto' : 'smooth';
}

export function preferredScrollBehavior(): ScrollBehavior {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return scrollBehaviorForReducedMotion(prefersReducedMotion);
}

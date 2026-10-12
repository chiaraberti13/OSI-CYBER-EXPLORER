/**
 * @license
 * SPDX-License-Identifier: GPL-3.0-only
 */

import { describe, expect, it } from 'vitest';
import { scrollBehaviorForReducedMotion } from './motion';

describe('motion preference', () => {
  it('maps reduced motion to instant scrolling and preserves smooth scrolling otherwise', () => {
    expect(scrollBehaviorForReducedMotion(true)).toBe('auto');
    expect(scrollBehaviorForReducedMotion(false)).toBe('smooth');
  });
});

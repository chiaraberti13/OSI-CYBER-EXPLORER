// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { getFocusableElements } from './focus';

afterEach(cleanup);

describe('getFocusableElements', () => {
  it('returns focusable descendants in DOM order and skips disabled, hidden, inert and tabindex=-1 ones', () => {
    const { container } = render(
      <div>
        <a href="#a" id="link">a</a>
        <a id="no-href">no href</a>
        <button type="button" id="ok">ok</button>
        <button type="button" id="disabled" disabled>x</button>
        <input id="text" />
        <input id="hidden-input" type="hidden" />
        <div id="custom" tabIndex={0}>custom</div>
        <div id="programmatic" tabIndex={-1}>programmatic</div>
        <button type="button" id="display-none" style={{ display: 'none' }}>x</button>
        <button type="button" id="invisible" style={{ visibility: 'hidden' }}>x</button>
        <div inert><button type="button" id="inert-child">x</button></div>
        <select id="select" aria-label="select"><option>1</option></select>
        <textarea id="area" aria-label="area" />
      </div>
    );

    expect(getFocusableElements(container).map(element => element.id)).toEqual(['link', 'ok', 'text', 'custom', 'select', 'area']);
  });
});

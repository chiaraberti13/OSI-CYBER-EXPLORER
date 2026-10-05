// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ViewLink from './ViewLink';
import CurriculumView from './CurriculumView';
import { useStore } from '../store';
import { DOMAIN_LAB_VIEWS } from '../lib/navigation';

afterEach(() => {
  cleanup();
  useStore.setState({ activeView: 'osi', language: 'it' });
});

describe('ViewLink', () => {
  it('offers a copyable href and navigates on a normal click or Enter', async () => {
    const user = userEvent.setup();
    render(<ViewLink view="routing">Routing</ViewLink>);
    const link = screen.getByRole('link', { name: 'Routing' });
    expect(link.getAttribute('href')).toBe('#/routing');
    await user.click(link);
    expect(useStore.getState().activeView).toBe('routing');
    useStore.setState({ activeView: 'osi' });
    link.focus();
    await user.keyboard('{Enter}');
    expect(useStore.getState().activeView).toBe('routing');
  });

  it('leaves modified clicks and secondary buttons to the browser', () => {
    render(<ViewLink view="routing">Routing</ViewLink>);
    const link = screen.getByRole('link', { name: 'Routing' });
    for (const options of [
      { metaKey: true }, { ctrlKey: true }, { shiftKey: true }, { altKey: true },
      { button: 1 }, { button: 2 },
    ]) {
      const event = new MouseEvent('click', { bubbles: true, cancelable: true, ...options });
      fireEvent(link, event);
      expect(event.defaultPrevented).toBe(false);
      expect(useStore.getState().activeView).toBe('osi');
    }
  });

  it('respects an explicit new-tab target and a caller that cancels navigation', () => {
    const { rerender } = render(<ViewLink view="routing" target="_blank">Routing</ViewLink>);
    fireEvent.click(screen.getByRole('link'));
    expect(useStore.getState().activeView).toBe('osi');
    rerender(<ViewLink view="routing" onClick={event => event.preventDefault()}>Routing</ViewLink>);
    fireEvent.click(screen.getByRole('link'));
    expect(useStore.getState().activeView).toBe('osi');
  });

  it('makes every curriculum destination a real lab link', () => {
    render(<CurriculumView />);
    const hashes = screen.getAllByRole('link').map(link => link.getAttribute('href'));
    expect(hashes.sort()).toEqual([
      ...Object.values(DOMAIN_LAB_VIEWS).map(view => `#/${view}`), '#/coverage',
    ].sort());
  });
});

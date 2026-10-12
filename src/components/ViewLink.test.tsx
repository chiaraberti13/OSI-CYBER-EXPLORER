// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ViewLink from './ViewLink';
import CurriculumView from './CurriculumView';
import { useStore } from '../store';
import { DOMAIN_LAB_VIEWS } from '../lib/navigation';
import { chaptersByDomain } from '../lib/studyManual';
import { CCNA_BLUEPRINT, CCNA_BLUEPRINT_TOPICS } from '../content/ccnaBlueprint';

afterEach(() => {
  cleanup();
  useStore.setState({ activeView: 'osi', language: 'it', activeChapterId: null });
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

  it('deep-links a manual chapter and selects it on click (EDU-STRUCT-04)', async () => {
    const user = userEvent.setup();
    render(
      <ViewLink view="manual" chapterId="ethernet-switching">
        Ethernet chapter
      </ViewLink>
    );
    const link = screen.getByRole('link', { name: 'Ethernet chapter' });
    expect(link.getAttribute('href')).toBe('#/manual/ethernet-switching');
    await user.click(link);
    expect(useStore.getState().activeView).toBe('manual');
    expect(useStore.getState().activeChapterId).toBe('ethernet-switching');
  });

  it('leaves modified clicks and secondary buttons to the browser', () => {
    render(<ViewLink view="routing">Routing</ViewLink>);
    const link = screen.getByRole('link', { name: 'Routing' });
    for (const options of [
      { metaKey: true },
      { ctrlKey: true },
      { shiftKey: true },
      { altKey: true },
      { button: 1 },
      { button: 2 }
    ]) {
      const event = new MouseEvent('click', { bubbles: true, cancelable: true, ...options });
      fireEvent(link, event);
      expect(event.defaultPrevented).toBe(false);
      expect(useStore.getState().activeView).toBe('osi');
    }
  });

  it('respects an explicit new-tab target and a caller that cancels navigation', () => {
    const { rerender } = render(
      <ViewLink view="routing" target="_blank">
        Routing
      </ViewLink>
    );
    fireEvent.click(screen.getByRole('link'));
    expect(useStore.getState().activeView).toBe('osi');
    rerender(
      <ViewLink view="routing" onClick={(event) => event.preventDefault()}>
        Routing
      </ViewLink>
    );
    fireEvent.click(screen.getByRole('link'));
    expect(useStore.getState().activeView).toBe('osi');
  });

  it('shows a clear Italian study path with working next steps', () => {
    render(<CurriculumView />);
    expect(screen.getByRole('heading', { name: 'Da dove iniziare' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Continua con il Manuale di studio' }).getAttribute('href')).toBe(
      '#/manual'
    );
    expect(screen.getByRole('link', { name: 'Esplora la pila OSI' }).getAttribute('href')).toBe('#/osi');
    expect(screen.getByRole('link', { name: 'Prova il laboratorio IPv4' }).getAttribute('href')).toBe('#/fundamentals');
    expect(screen.getByText(/completamento dei capitoli viene salvato solo in questo browser/i)).toBeTruthy();
  });

  it('localizes the starting path and keeps destinations available in English', () => {
    useStore.setState({ language: 'en' });
    render(<CurriculumView />);
    expect(screen.getByRole('heading', { name: 'Where to start' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Continue with the Study Manual' }).getAttribute('href')).toBe('#/manual');
    expect(screen.getByRole('link', { name: 'Explore the OSI stack' }).getAttribute('href')).toBe('#/osi');
    expect(screen.getByRole('link', { name: 'Try the IPv4 lab' }).getAttribute('href')).toBe('#/fundamentals');
    expect(screen.getByText(/Chapter completion is stored only in this browser/i)).toBeTruthy();
  });

  it('makes every curriculum and blueprint destination a real link', () => {
    render(<CurriculumView />);
    const hashes = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
    expect(hashes.sort()).toEqual(
      [
        ...Object.values(DOMAIN_LAB_VIEWS).map((view) => `#/${view}`),
        // The CCNA hub switcher at the top: Overview (self) + Chapters (IA-01).
        '#/curriculum',
        '#/manual',
        '#/coverage',
        '#/manual',
        '#/manual',
        '#/osi',
        '#/fundamentals',
        // One "open the chapters in the Manual" deep link per covered domain, pointing to
        // its first chapter (IA-01b: a single pointer, not a duplicated chapter list).
        ...chaptersByDomain()
          .filter((group) => group.domain && group.chapters.length > 0)
          .map((group) => `#/manual/${group.chapters[0].id}`),
        ...CCNA_BLUEPRINT_TOPICS.flatMap((entry) => entry.destinations.map((view) => `#/${view}`)),
        CCNA_BLUEPRINT.source.url
      ].sort()
    );
    expect(screen.getByRole('link', { name: 'Fonte ufficiale Cisco (PDF)' })).toHaveProperty('target', '_blank');
  });
});

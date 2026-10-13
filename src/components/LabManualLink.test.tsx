// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LabManualLink from './LabManualLink';
import { useStore } from '../store';
import { chaptersForLab } from '../lib/studyManual';

afterEach(() => {
  cleanup();
  useStore.setState({ activeView: 'osi', language: 'it', activeChapterId: null });
});

describe('LabManualLink (EDU-STRUCT-05)', () => {
  it('deep-links a lab back to each chapter whose theory it exercises', async () => {
    const user = userEvent.setup();
    render(<LabManualLink lab="osi" />);

    const [chapter] = chaptersForLab('osi');
    const link = screen.getByRole('link', { name: new RegExp(chapter.title.it) });
    expect(link.getAttribute('href')).toBe(`#/manual/${chapter.id}`);

    await user.click(link);
    expect(useStore.getState().activeView).toBe('manual');
    expect(useStore.getState().activeChapterId).toBe(chapter.id);
  });

  it('lists every citing chapter for a lab shared by more than one chapter', () => {
    const chapters = chaptersForLab('fundamentals');
    expect(chapters.length).toBeGreaterThan(1);
    render(<LabManualLink lab="fundamentals" />);
    const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
    expect(hrefs).toEqual(chapters.map((chapter) => `#/manual/${chapter.id}`));
  });

  it('renders nothing for a view no chapter cites, so there is no empty or broken link', () => {
    const { container } = render(<LabManualLink lab="manual" />);
    expect(container.firstChild).toBeNull();
  });

  it('localizes the chapter title in English', () => {
    useStore.setState({ language: 'en' });
    const [chapter] = chaptersForLab('osi');
    render(<LabManualLink lab="osi" />);
    expect(screen.getByRole('link', { name: new RegExp(chapter.title.en) })).toBeTruthy();
  });
});

// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LabManualLink from './LabManualLink';
import { useStore, type AppView } from '../store';
import { chaptersForLab } from '../lib/studyManual';
import { STUDY_MANUAL } from '../content/studyManual';

/**
 * EDU-31 — the single source of truth for "a taught lab": every interactive view a manual
 * chapter sends a student into, through a topic's `lab` or a guided lab's `lab`. Derived
 * from the manual data so a newly taught lab (a new chapter, or a new guided lab in an
 * existing one) joins the guard automatically, with no hand-maintained list.
 */
const TAUGHT_LABS: readonly AppView[] = [
  ...new Set(
    STUDY_MANUAL.flatMap((chapter) =>
      chapter.topics.flatMap((topic) =>
        [topic.lab, ...(topic.guidedLabs ?? []).map((guided) => guided.lab)].filter((lab): lab is AppView =>
          Boolean(lab)
        )
      )
    )
  )
];

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

/**
 * EDU-31 — guide↔lab cross-links. The back-link is mounted once from the active view id
 * (App.tsx), so the guarantee "every taught lab exposes its theory back-link" reduces to:
 * for every lab a chapter cites, `LabManualLink` renders a callout whose links are exactly
 * the citing chapters, in study order. Deriving the set from the manual means new chapters
 * (and new guided labs) are covered without touching this test — closing EDU-31's "anche
 * per i nuovi capitoli".
 */
describe('every taught lab exposes its manual back-link (EDU-31)', () => {
  it('derives a non-trivial taught-lab set that includes the newest chapters', () => {
    expect(TAUGHT_LABS.length).toBeGreaterThanOrEqual(20);
    // The CONTENT-01/02 defensive labs that most recently gained a chapter must be present,
    // so a regression that stops teaching one is caught here and not only in review.
    for (const lab of [
      'segmentation',
      'routingsecurity',
      'availability',
      'managementsecurity',
      'recovery',
      'layer2security'
    ] as const) {
      expect(TAUGHT_LABS, `${lab} is taught`).toContain(lab);
    }
  });

  it.each(TAUGHT_LABS)('renders the ordered chapter back-links for %s', (lab) => {
    const chapters = chaptersForLab(lab);
    // A taught lab always resolves to at least one chapter (the reverse map's contract).
    expect(chapters.length, `${lab} has no citing chapter`).toBeGreaterThan(0);

    render(<LabManualLink lab={lab} />);
    // The callout is present (not the null render reserved for uncited views)…
    expect(screen.getByRole('complementary'), `${lab} renders no callout`).toBeTruthy();
    // …and its links are exactly the citing chapters' deep-links, in study order.
    const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
    expect(hrefs).toEqual(chapters.map((chapter) => `#/manual/${chapter.id}`));
  });
});

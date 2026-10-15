// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MANUAL_DIAGRAMS } from '../content/manualDiagrams';
import type { ManualDiagramId } from '../content/manualDiagrams';
import { STUDY_MANUAL } from '../content/studyManual';
import ManualConceptDiagram from './ManualConceptDiagram';

afterEach(cleanup);

describe('manual concept diagrams', () => {
  for (const id of Object.keys(MANUAL_DIAGRAMS) as ManualDiagramId[]) {
    it(`${id} is attached to a real topic and exposes a complete alternative in both languages`, () => {
      expect(STUDY_MANUAL.flatMap((chapter) => chapter.topics).filter((topic) => topic.diagram === id)).toHaveLength(1);
      for (const language of ['it', 'en'] as const) {
        const { unmount } = render(<ManualConceptDiagram id={id} language={language} />);
        const graphic = screen.getByRole('img', { name: MANUAL_DIAGRAMS[id].title[language] });
        expect(document.getElementById(graphic.getAttribute('aria-describedby')!)?.textContent).toBe(
          MANUAL_DIAGRAMS[id].description[language]
        );
        for (const node of MANUAL_DIAGRAMS[id].nodes) expect(screen.getByText(node.label[language])).toBeTruthy();
        unmount();
      }
    });
  }

  it('keeps title, description and arrow references unique when reused', () => {
    const { container } = render(
      <>
        <ManualConceptDiagram id="email" language="it" />
        <ManualConceptDiagram id="email" language="en" />
      </>
    );
    const ids = [...container.querySelectorAll('[id]')].map((element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const path of container.querySelectorAll('[marker-end]')) {
      const id = path.getAttribute('marker-end')!.slice(5, -1);
      expect(document.getElementById(id)?.tagName).toBe('marker');
    }
  });
});
